import fs, { ReadStream } from 'fs';
import { AnyBulkWriteOperation, BSON, Collection, MongoClient } from 'mongodb';
import vdck from 'vdck';

import { getCollection } from '../lib/connection.js';

import { minStdResponse, stdResponse } from '../types/index.js';

// Constants and variables
const stringToSearch: string = '"string_list_data": [';
const endStringToSearch: string = ']';
const validate: vdck = new vdck(false);

let bulkUsersLists: AnyBulkWriteOperation<BSON.Document>[] = [];

/** Check if the data params corresponds to the std Instagram followers/followings keys/values object and push it to the bulkUsersLists
 * 
 * @param {string} data - Example: 
 * {
 *   href: 'https://www.instagram.com/test',
 *   value: 'test',
 *   timestamp: 1714987387
 * }
 * @returns {true | Error} - true if the data is valid, Error if not
 */
function checkJSON(data: string): true | Error {
  try {
    const jsonedData: {
      href?: string;
      value?: string;
      timestamp?: number;
    } = JSON.parse(data);

    // If the std Instagram followers/followings keys/values object fits
    if (validate.sameObjects(jsonedData, {
      href: "string",
      value: "string",
      timestamp: "number"
    })) {
      const convertedTimestamp: Date = new Date(jsonedData.timestamp * 1000);

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
 * @param {MongoClient} conn - MongoDB connection object
 * @param {string} dbName - MongoDB database name
 * @param {string} filePath - File path
 * @param {number} batchSize - Max batch size to process at time
 * @returns {Promise<minStdResponse>} - MongoDB collection object
 */
export default async function processFile(conn: MongoClient, dbName: string, filePath: string, batchSize: number): Promise<minStdResponse> {
  let firstChunk: boolean = true;
  let followings: boolean = false;

  let collection: stdResponse<Collection> = await getCollection(conn, dbName, 'followers');
  if (!collection.ok) {
    return {
      ok: false,
      msg: String(collection)
    };
  }

  // Create a read stream and process file's data
  try {
    const readStream: ReadStream = fs.createReadStream(filePath, { encoding: "utf-8" });

    let incompleteChunk: string = "";
    for await (let chunk of readStream) {
      let buffer: string = incompleteChunk + chunk;

      // Checks if the current file is for followers or followings
      if (firstChunk) {
        if (buffer.indexOf("relationships_following") >= 0) {
          followings = true;
          collection = await getCollection(conn, dbName, "followings");
          if (!collection.ok) {
            return {
              ok: false,
              msg: String(collection)
            };
          }
        }
        firstChunk = false;
      }

      let startIndex: number = -1;
      let endIndex: number = -1;
      while ((startIndex = buffer.indexOf(stringToSearch)) >= 0) {
        endIndex = buffer.indexOf(endStringToSearch, startIndex + stringToSearch.length);
        if (endIndex >= 0) {
          const jsonChunk: string = buffer.substring((startIndex + stringToSearch.length), endIndex);

          // Checks JSON and push users into bulkUsersLists
          const checkProcess: true | Error = checkJSON(jsonChunk);
          if (checkProcess instanceof Error) {
            return {
              ok: false,
              msg: String(checkProcess)
            };
          }

          // Checks bulkUsersLists length and every 'batchSize' push data into MongoDB
          if (bulkUsersLists.length == batchSize) {
            await collection.value.bulkWrite(bulkUsersLists);
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
      await collection.value.bulkWrite(bulkUsersLists);
    }

    bulkUsersLists = [];
  } catch(err: unknown) {
    return {
      ok: false,
      msg: String(err)
    };
  }

  return {
    ok: true
  };
}