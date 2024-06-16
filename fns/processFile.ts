import EventEmitter from 'events';
import fs from 'fs';
import mongo from 'mongodb';
import { getCollection } from '../connection/index.js';

// Constants and variables
const storeEvent = new EventEmitter();

let following = false;
let followingStarts = '"relationships_following": ';
let foundFollowing = false;
let start = true;

let usersList: mongo.AnyBulkWriteOperation<mongo.BSON.Document>[] = [];

/** Check if it corresponds and push it to the usersList array
 * {
 *   href: 'https://www.instagram.com/test',
 *   value: 'test',
 *   timestamp: 1714987387
 * }
 */
function checkJSON(data: string): boolean {
  try {
    let jsonedData: any = JSON.parse(data);

    if (('value' in jsonedData) && jsonedData.value && 
      typeof jsonedData.value == 'string' && jsonedData.value.length > 0 && 
      ('timestamp' in jsonedData) && jsonedData.timestamp && 
      typeof jsonedData.timestamp == 'number' && jsonedData.timestamp > 0
    ) {
      let convertedTimestamp = new Date(jsonedData.timestamp * 1000);

      usersList.push({
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

    throw new Error('');
  } catch (err: unknown) {
    console.error(err);
    return false;
  }
}

/** Process file and store data into MongoDB
 * 
 * @param {mongo.MongoClient} connection MongoClient's connection object
 * @param {string} filePath File path
 * @param {number} batchSize Max batch size to process at time
 * @returns {Promise<true | Error>}
 * 
 * @author Frash | Francesco Ascenzi
 */
export default async function processFile(connection: mongo.MongoClient, filePath: string, batchSize: number): Promise<true | Error> {

  let startStringToSearch = '"string_list_data": [';
  let endStringToSearch = ']';

  let firstChunk = true;
  let followings = false;

  let Collection: mongo.Collection<mongo.BSON.Document>;
  try {
    const readStream = fs.createReadStream(filePath, { encoding: 'utf-8' });

    let incompleteChunk = '';
    for await (let chunk of readStream) {
      let buffer = incompleteChunk + chunk;

      if (firstChunk) {
        if (buffer.indexOf('relationships_following') >= 0) {
          followings = true;
        }
        firstChunk = false;
      }

      let startIndex = -1;
      let endIndex = -1;

      while ((startIndex = buffer.indexOf(startStringToSearch)) >= 0) {
        endIndex = buffer.indexOf(endStringToSearch, startIndex + startStringToSearch.length);
        if (endIndex >= 0) {
          let jsonChunk = buffer.substring((startIndex + startStringToSearch.length), endIndex);

          // Check JSON
          if (!checkJSON(jsonChunk)) break;

          // Insert into Mongo
          if (usersList.length == batchSize) {
            if (followings) {
              Collection = await getCollection(connection, 'followings');
            } else {
              Collection = await getCollection(connection, 'followers');
            }

            await Collection.bulkWrite(usersList);
            usersList = [];
          }

          // Slice away the prev chunk
          buffer = buffer.slice(endIndex);
        } else {
          break;
        }
      }
      incompleteChunk = buffer;
    }

    if (incompleteChunk) {
      console.error('Errore: frammento JSON incompleto trovato:', incompleteChunk);
    }

    // Insert latest
    if (usersList.length > 0) {
      if (followings) {
        Collection = await getCollection(connection, 'followings');
      } else {
        Collection = await getCollection(connection, 'followers');
      }

      await Collection.bulkWrite(usersList);
    }

    usersList = [];
  } catch(err: unknown) {
    return new Error(String(err));
  }

  return true;
}