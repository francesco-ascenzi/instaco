/** ===============================================================================================
 * @author Frash | Francesco Ascenzi
 * @fund https://www.paypal.com/donate/?hosted_button_id=QL4PRUX9K9Y6A
 * @license Apache 2.0
================================================================================================ */
import fs from 'fs';
import vdck from 'vdck';
// Constants and variables
const stringToSearch = '"string_list_data": [';
const endStringToSearch = ']';
const validate = new vdck(false);
let bulkUsersLists = [];
;
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
function checkJSON(data) {
    try {
        // Parse the data
        const jsonedData = JSON.parse(data);
        // If the std Instagram followers/followings keys/values object fits
        if (validate.sameObjects(jsonedData, {
            href: "string",
            value: "string",
            timestamp: "number"
        })) {
            const convertedTimestamp = new Date(jsonedData.timestamp * 1000);
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
        throw new Error(`It seems that the file is not a standard Instagram followers/followings file`);
    }
    catch (err) {
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
export default async function processFile(conn, dbName, filePath, batchSize) {
    // Collection check and creation
    let firstChunk = true;
    let collection = await conn.useCollection(dbName, "followers");
    if (typeof collection === "string") {
        return {
            ok: false,
            msg: String(collection)
        };
    }
    try {
        // Initialize read stream and variables
        let incompleteChunk = "";
        const readStream = fs.createReadStream(filePath, { encoding: "utf-8" });
        // Process file line by line
        for await (let chunk of readStream) {
            let buffer = incompleteChunk + chunk;
            // Checks if the current file is for followers or followings
            if (firstChunk) {
                if (buffer.indexOf("relationships_following") >= 0) {
                    collection = await conn.useCollection(dbName, "followings");
                    if (typeof collection === "string") {
                        return {
                            ok: false,
                            msg: String(collection)
                        };
                    }
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
                    const checkProcess = checkJSON(jsonChunk);
                    if (checkProcess instanceof Error) {
                        return {
                            ok: false,
                            msg: String(checkProcess)
                        };
                    }
                    // Checks bulkUsersLists length and every 'batchSize' push data into MongoDB
                    if (bulkUsersLists.length == batchSize) {
                        await collection.bulkWrite(bulkUsersLists);
                        bulkUsersLists = [];
                    }
                    // Slice away the prev chunk
                    buffer = buffer.slice(endIndex);
                }
                else {
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
    }
    catch (err) {
        return {
            ok: false,
            msg: String(err)
        };
    }
    return {
        ok: true
    };
}
