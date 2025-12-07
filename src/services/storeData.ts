import fs, { ReadStream } from 'fs';
import { AnyBulkWriteOperation, BSON, Db } from 'mongodb';
import Vdck from 'vdck';

import { logError } from '../lib/prompt.js';
import { extractUsernameFromHref } from '../lib/utilities.js';

const vdck = new Vdck(false);

const stringToSearch: string = '"string_list_data": [';
const endStringToSearch: string = ']';

let bulkUsersLists: AnyBulkWriteOperation<BSON.Document>[] = [];

/** Check if the data params corresponds to the std Instagram followers/followings keys/values object and push it to the bulkUsersLists
 * 
 * @param data - Example: 
 * {
 *   href: 'https://www.instagram.com/test',
 *   value: 'test',
 *   timestamp: 1714987387
 * }
 * @returns True if the data is valid, Error otherwise
 */
function checkJSON(data: string, fileName: string): void {
  try {
    const jsonedData = JSON.parse(data);

    // If the std Instagram followers/followings keys/values object fits
    if (vdck.sameObjects(jsonedData, {
      href: "string",
      timestamp: "number"
    })) {
      const convertedTimestamp = new Date(jsonedData.timestamp * 1000);
      const username = extractUsernameFromHref(jsonedData.href);

      // Push it into bulkUsersLists
      bulkUsersLists.push({
        updateOne: {
          filter: {
            user: username
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

      return;
    }

    throw new Error(`It seems that the file '${fileName}' is not a standard Instagram followers/followings file`);
  } catch (err: unknown) {
    throw new Error(String(err));
  }
}

/** Process file and store its data into MongoDB
 * 
 * @param mongo - MongoDB database instance
 * @param filePath - File path
 * @param batchSize - Max batch size to process at time
 * @returns MongoDB collection object
 */
export default async function processFile(mongo: Db, filePath: string, batchSize: number): Promise<boolean> {
  let collection = mongo.collection("followers");
  let firstChunk = true;
  let incompleteChunk = "";

  try {
    const readStream: ReadStream = fs.createReadStream(filePath, { encoding: "utf8" });

    // Process file line by line
    for await (let chunk of readStream) {
      let buffer: string = incompleteChunk + chunk;

      // Checks if the current file is the followers one or the followings one
      if (firstChunk) {
        if (buffer.indexOf("relationships_following") >= 0) {
          collection = mongo.collection("followings");
        }
        firstChunk = false;
      }

      let startIndex = -1;
      let endIndex = -1;
      while ((startIndex = buffer.indexOf(stringToSearch)) >= 0) {
        endIndex = buffer.indexOf(endStringToSearch, startIndex + stringToSearch.length);
        if (endIndex >= 0) {
          const jsonChunk = buffer.substring((startIndex + stringToSearch.length), endIndex);

          // Checks JSON and push users into bulkUsersLists
          checkJSON(jsonChunk, filePath);

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
  } catch (err: unknown) {
    logError(String(err));
    return false;
  }

  return true;
}