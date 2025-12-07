import fs from "fs";
import { AnyBulkWriteOperation, BSON, Collection, Db, WithId } from "mongodb";
import path from "path";

import { Settings } from "../types/index.js";
import { logError } from "../lib/prompt.js";

/** Update the main collection with the followers/followings data
 * 
 * @param collection - Main collection
 * @param diffCollection - Followers or followings collection
 * @param type - 0 for followers, 1 for followings
 * @param settings - Settings object
 * @returns void
 */
async function updateCollection(collection: Collection, diffCollection: Collection, type: number, settings: Settings): Promise<void> {
  let bulkArray: AnyBulkWriteOperation<BSON.Document>[] = [];
  let lastId: any = null;

  while (true) {
    const query = lastId ? { _id: { $gt: lastId } } : {};

    const batch = await diffCollection.find(query)
      .sort({ _id: 1 })
      .limit(settings.maxFileBatchSize)
      .project({ _id: 1, user: 1, timestamp: 1 })
      .toArray();

    if (batch.length === 0) {
      if (bulkArray.length > 0) {
        await collection.bulkWrite(bulkArray);
      }
      break;
    }

    lastId = batch[batch.length - 1]._id;

    for (const user of batch) {
      if (!user) continue;

      const filter = { user: user.user };
      const update = {
        $set: {
          timestamp: user.timestamp,
          updatedAt: new Date()
        },
        $setOnInsert: {
          insertedAt: new Date()
        }
      };

      if (type === 0) {
        Object.assign(update.$setOnInsert, { followsMeBefore: true });
        Object.assign(update.$set, { followsMe: true });
      } else {
        Object.assign(update.$set, { followIt: true });
      }

      bulkArray.push({ updateOne: { filter, update, upsert: true } });
    }

    if (bulkArray.length > 0) {
      await collection.bulkWrite(bulkArray);
      bulkArray = [];
    }
  }
}

/** Compare the lists of followers and followings
 * 
 * @param db - MongoDB database instance
 * @param settings - Settings object
 * @returns Response object indicating success or failure
 */
export default async function compareLists(db: Db, settings: Settings): Promise<boolean> {
  try {
    const followers = db.collection("followers");
    const followings = db.collection("followings");
    const collection = db.collection(settings.connection.collection);

    await collection.updateMany({}, { $set: { followsMe: false, followIt: false } });

    await updateCollection(collection, followers, 0, settings);
    await updateCollection(collection, followings, 1, settings);

    // Generate diff list
    const differences = await collection.find({
      followsMe: false, 
      followIt: true
    }, {
      projection: {
        _id: 0,
        user: 1
      }
    }).sort({
      timestamp: -1
    }).toArray();

    // Generate a new .txt file
    const year = new Date().getFullYear();
    const month = (1 + new Date().getMonth()).toString().padStart(2, "0");
    const day = new Date().getDate().toString().padStart(2, "0");
    const generatedFileName = `list_${year}${month}${day}.txt`;

    const listFilePath = path.join(settings.outputListPath, generatedFileName);

    await fs.promises.writeFile(
      listFilePath,
      differences.map(d => d.user).join("\n") + "\n",
      "utf8"
    );
  } catch (err: unknown) {
    logError(String(err));
    return false;
  }

  return true;
}