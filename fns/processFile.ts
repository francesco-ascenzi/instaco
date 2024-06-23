import fs from 'fs';
import mongo from 'mongodb';
import { getCollection } from '../connection/index.js';

// Constants and variables
const stringToSearch = '"string_list_data": [';
const endStringToSearch = ']';

let bulkUsersLists: mongo.AnyBulkWriteOperation<mongo.BSON.Document>[] = [];

/** Check if the data params corresponds to the std Instagram followers/followings keys/values object and push it to the bulkUsersLists
 * 
 * @param {string} data - Example: 
 * {
 *   href: 'https://www.instagram.com/test',
 *   value: 'test',
 *   timestamp: 1714987387
 * }
 * @returns {true | Error}
 * 
 * @author Frash | Francesco Ascenzi
 * @fund https://www.paypal.com/donate/?hosted_button_id=QL4PRUX9K9Y6A
 * @license Apache 2.0
 */
function checkJSON(data: string): true | Error {
  try {
    let jsonedData: any = JSON.parse(data);

    // If the std Instagram followers/followings keys/values object fits
    if (('value' in jsonedData) && jsonedData.value && 
      typeof jsonedData.value == 'string' && jsonedData.value.length > 0 && 
      ('timestamp' in jsonedData) && jsonedData.timestamp && 
      typeof jsonedData.timestamp == 'number' && jsonedData.timestamp > 0
    ) {
      let convertedTimestamp = new Date(jsonedData.timestamp * 1000);

      // Push it into bulkUsersLists
      bulkUsersLists.push({
        updateOne: {
          filter: {
            user: jsonedData.value
          },
          update: {
            $set: {
              timestamp: convertedTimestamp,
              updated: new Date()
            }
          },
          upsert: true
        }
      });

      return true;
    }

    throw new Error(`One or both of the 'value' and 'timestamp' keys are missing`);
  } catch (err: unknown) {
    return new Error(String(err));
  }
}

/** Process file and store its data into MongoDB
 * 
 * @param {mongo.MongoClient} connection - MongoDB connection object
 * @param {string} filePath - File path
 * @param {number} batchSize - Max batch size to process at time
 * @returns {Promise<true | Error>}
 * 
 * @author Frash | Francesco Ascenzi
 * @fund https://www.paypal.com/donate/?hosted_button_id=QL4PRUX9K9Y6A
 * @license Apache 2.0
 */
export default async function processFile(connection: mongo.MongoClient, dbName: string, filePath: string, batchSize: number): Promise<true | Error> {

  // Initialize function's constants and variables
  let firstChunk = true;
  let followings = false;
  let collection: mongo.Collection<mongo.BSON.Document> | Error = await getCollection(connection, dbName, 'followers');
  if (collection instanceof Error) return new Error(String(collection));

  // Create a read stream and process file's data
  try {
    const readStream = fs.createReadStream(filePath, { encoding: 'utf-8' });

    let incompleteChunk = '';
    for await (let chunk of readStream) {
      let buffer = incompleteChunk + chunk;

      // Checks if the current file is for followers or followings
      if (firstChunk) {
        if (buffer.indexOf('relationships_following') >= 0) {
          followings = true;
          collection = await getCollection(connection, dbName, 'followings');
          if (collection instanceof Error) {
            return new Error(String(collection));
          }
        }
        firstChunk = false;
      }

      let startIndex = -1;
      let endIndex = -1;
      while ((startIndex = buffer.indexOf(stringToSearch)) >= 0) {
        endIndex = buffer.indexOf(endStringToSearch, startIndex + stringToSearch.length);
        if (endIndex >= 0) {
          let jsonChunk = buffer.substring((startIndex + stringToSearch.length), endIndex);

          // Checks JSON and push users into bulkUsersLists
          const checkProcess: true | Error = checkJSON(jsonChunk);
          if (checkProcess instanceof Error) return new Error(String(checkProcess));

          // Checks bulkUsersLists length and every 'batchSize' push data into MongoDB
          if (bulkUsersLists.length == batchSize) {
            await collection.bulkWrite(bulkUsersLists);
            bulkUsersLists = [];
          }

          // Slice away the prev chunk
          buffer = buffer.slice(endIndex);
        } else {
          break;
        }
      }

      // Prepare to add incomplete chunk to the next process
      incompleteChunk = buffer;
    }

    // Insert latest users
    if (bulkUsersLists.length > 0) {
      await collection.bulkWrite(bulkUsersLists);
    }

    bulkUsersLists = [];
  } catch(err: unknown) {
    return new Error(String(err));
  }

  return true;
}