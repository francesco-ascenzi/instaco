import fs from 'fs';
import { AnyBulkWriteOperation, BSON, Collection, MongoClient, WithId } from 'mongodb';
import path from 'path';
import { getCollection } from '../lib/classes/connection.js';
import { minStdResponse, settings } from '../types/index.js';

// Interfaces & types
interface settingsInterface {
  "connection": {
    "string": string,
    "db": string,
    "collection": string
  },
  "files": {
    "batchSize": number,
    "inputFiles": string,
    "outputList": string
  }
};

/** Update main collection
 * 
 * @param {Collection<BSON.Document>} collection - Main collection
 * @param {Collection<BSON.Document>} diffCollection - 'followers'/'followings' collection based on 'type' param
 * @param {number} type - Collection's type | 0 => 'followers', 1 => 'followings'
 * @param {settings} settings - Settings
 * @returns {Promise<minStdResponse>}
 */
async function updateCollection(
  collection: Collection<BSON.Document>, 
  diffCollection: Collection<BSON.Document>, 
  type: number, 
  settings: settings
): Promise<true | Error> {

  let bulkArray: AnyBulkWriteOperation<BSON.Document>[] = [];

  // Calculate how many cycles needs to the for loop and retrieve 'n' elements
  const totalDiffDocuments: number = await diffCollection.countDocuments();
  const howManyCycles = Math.ceil(totalDiffDocuments / settings.files.batchSize);

  for (let i = 0; i < howManyCycles; i++) {
    const currentBatch: WithId<BSON.Document>[] = await diffCollection.find().limit(settings.files.batchSize).skip(i * settings.files.batchSize).toArray();

    if (currentBatch.length > 0) {
      // Process the current batch
      for (let j = 0; j < currentBatch.length; j++) {
        const user = currentBatch[j];

        // If the current batch user is valid
        if (user) {
          delete currentBatch[j].updatedAt;

          // The user is a follower
          if (type == 0) {
            bulkArray.push({
              updateOne: {
                filter: {
                  user: currentBatch[j].user
                },
                update: {
                  $set: {
                    followsMe: true,
                    timestamp: user.timestamp,
                    updatedAt: new Date()
                  },
                  $setOnInsert: {
                    followsMeBefore: true,
                    insertedAt: new Date()
                  }
                },
                upsert: true
              }
            })
          // The user is a following
          } else {
            bulkArray.push({
              updateOne: {
                filter: {
                  user: currentBatch[j].user
                },
                update: {
                  $set: {
                    followIt: true,
                    timestamp: user.timestamp,
                    updatedAt: new Date()
                  },
                  $setOnInsert: {
                    insertedAt: new Date()
                  }
                },
                upsert: true
              }
            });
          }
        }
      }

      // Every batchSize elements do a bulkWrite operation
      if (bulkArray.length > 0) {
        try {
          await collection.bulkWrite(bulkArray);

          bulkArray = [];
        } catch(err: unknown) {
          bulkArray = [];

          return new Error(String(err));
        }
      }
    }
  }

  bulkArray = [];
  return true;
}

/** Compare 'followers' and 'followings' lists
 * 
 * @param {MongoClient} connection - Output path
 * @param {Collection<BSON.Document>} collection - Output path
 * @param {settings} settings - Settings
 * @param {string} rootPath - Root's files path
 * @returns {Promise<true | Error>} - True if the diff list was generated successfully, otherwise an Error
 */
export default async function compareLists(
  connection: MongoClient, 
  collection: Collection<BSON.Document>, 
  settings: settings
): Promise<minStdResponse> {

  // Get both collections
  const followers: Collection<BSON.Document> | Error = await getCollection(connection, settings.connection.db, 'followers');
  const followings: Collection<BSON.Document> | Error = await getCollection(connection, settings.connection.db, 'followings');

  if (followers instanceof Error) {
    return new Error(String(followers));
  }

  if (followings instanceof Error) {
    return new Error(String(followings));
  }

  // Reset followsMe and followIt
  await collection.updateMany({}, { $set: { followsMe: false, followIt: false }});

  // Updates main collection
  const followersUpProcess = await updateCollection(collection, followers, 0, settings);
  if (followersUpProcess instanceof Error) {
    return new Error(String(followersUpProcess));
  }

  const followingsUpProcess = await updateCollection(collection, followings, 1, settings);
  if (followingsUpProcess instanceof Error) {
    return new Error(String(followingsUpProcess));
  }

  // Add followsMe: false to new followings that don't follow me
  await collection.updateMany({
    followsMe: {
      $exists: false
    }
  }, {
    $set: {
      followsMe: false
    }
  });

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
  const month = (1 + new Date().getMonth()).toString().padStart(2, '0');
  const day = new Date().getDate().toString().padStart(2, '0');
  const generatedFileName: string = `list_${year}${month}${day}.txt`;

  const listFilePath: string = path.join(settings.files.outputList, generatedFileName);

  try {
    await fs.promises.access(listFilePath, fs.constants.F_OK);
    await fs.promises.writeFile(listFilePath, '', 'utf8');
  } catch (err: unknown) {
    try {
      await fs.promises.writeFile(listFilePath, '', 'utf8');
    } catch (permErr: unknown) {
      return new Error(String(permErr));
    }
  }

  for (let i = 0; i < differences.length; i++) {
    if (('user' in differences[i]) && 
      differences[i].user && 
      typeof differences[i].user == 'string'
    ) {
      await fs.promises.appendFile(listFilePath, `${differences[i].user}\n`, 'utf8');
    }
  }

  return true;
}