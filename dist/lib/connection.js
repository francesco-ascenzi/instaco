/** =============================================================================================== */
/**
 * @author Frash | Francesco Ascenzi
 * @fund https://www.paypal.com/donate/?hosted_button_id=QL4PRUX9K9Y6A
 * @license Apache 2.0
 */
/** =============================================================================================== */
import mongodb from "mongodb";
/** Connect to MongoDB
 *
 * @param {string} connUri - Connection string
 * @returns {Promise<stdResponse<MongoClient>>} - MongoDB connection object or throw error
 */
export async function connect(connUri) {
    try {
        let client = await (new mongodb.MongoClient(connUri)).connect();
        return {
            ok: true,
            value: client
        };
    }
    catch (err) {
        return {
            ok: false,
            msg: String(err)
        };
    }
}
/** Create or get a MongoDB collection based on the function's parameters
 *
 * @param {MongoClient} conn - MongoDB connection object
 * @param {string} collectionName - Collection name
 * @returns {Promise<stdResponse<Collection>>} - MongoDB collection object
 */
export async function getCollection(conn, dbName, collectionName) {
    if (typeof dbName != "string" || !dbName || dbName.length == 0) {
        return {
            ok: false,
            msg: "Inputted db name was not a valid string"
        };
    }
    if (typeof collectionName != "string" || !collectionName || collectionName.length == 0) {
        return {
            ok: false,
            msg: "Inputted collection name was not a valid string"
        };
    }
    // Check existing collections and create the collection if 'collectionName' doesn't exist
    const existingCollections = await conn.db(dbName).listCollections().toArray();
    let found = false;
    for (let i = 0; i < existingCollections.length; i++) {
        if (collectionName == existingCollections[i].name) {
            found = true;
            break;
        }
    }
    // Create the collection if it doesn't exist
    if (!found)
        await conn.db(dbName).createCollection(collectionName);
    // Check indexes and create 'timestamp'/'user' indexes if they don't exist
    if (!await (await conn.db(dbName).collection(collectionName)).indexExists("user")) {
        await (await conn.db(dbName).collection(collectionName)).createIndex({ "user": -1 });
    }
    if (!await (await conn.db(dbName).collection(collectionName)).indexExists("timestamp")) {
        await (await conn.db(dbName).collection(collectionName)).createIndex({ "timestamp": -1 });
    }
    return {
        ok: true,
        value: conn.db(dbName).collection(collectionName)
    };
}
