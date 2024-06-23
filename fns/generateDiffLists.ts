import fs from 'fs';
import mongo from 'mongodb';
import path from 'path';
import { getCollection } from '../connection/index.js';

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
 * @param {mongo.Collection<mongo.BSON.Document>} collection - Main collection
 * @param {mongo.Collection<mongo.BSON.Document>} diffCollection - 'followers'/'followings' collection based on 'type' param
 * @param {number} type - Collection's type | 0 => 'followers', 1 => 'followings'
 * @param {settingsInterface} settings - Settings
 * @returns {Promise<true | Error>}
 */
async function updateCollection(
  collection: mongo.Collection<mongo.BSON.Document>, 
  diffCollection: mongo.Collection<mongo.BSON.Document>, 
  type: number, 
  settings: settingsInterface
): Promise<true | Error> {

  let bulkArray: mongo.AnyBulkWriteOperation<mongo.BSON.Document>[] = [];

  // Calculate how many cycles needs to the for loop and retrieve 'n' elements
  const totalDiffDocuments: number = await diffCollection.countDocuments();
  const howManyCycles = Math.ceil(totalDiffDocuments / settings.files.batchSize);

  for (let i = 0; i < howManyCycles; i++) {
    const currentBatch: mongo.WithId<mongo.BSON.Document>[] = await diffCollection.find().limit(settings.files.batchSize).skip(i * settings.files.batchSize).toArray();

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

/** Update main collection and generate a diff list between followers and followings
 * 
 * @param {mongo.MongoClient} connection - Output path
 * @param {mongo.Collection<mongo.BSON.Document>} collection - Output path
 * @param {settingsInterface} settings - Settings
 * @param {string} rootPath - Root's files path
 * @returns {Promise<true | Error>}
 * 
 * @author Frash | Francesco Ascenzi
 * @fund https://www.paypal.com/donate/?hosted_button_id=QL4PRUX9K9Y6A
 * @license Apache 2.0
 */
export default async function generateDiffLists(
  connection: mongo.MongoClient, 
  collection: mongo.Collection<mongo.BSON.Document>, 
  settings: settingsInterface,
  rootPath: string
): Promise<true | Error> {

  // Get both collections
  const followers: mongo.Collection<mongo.BSON.Document> | Error = await getCollection(connection, 'followers');
  const followings: mongo.Collection<mongo.BSON.Document> | Error = await getCollection(connection, 'followings');

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