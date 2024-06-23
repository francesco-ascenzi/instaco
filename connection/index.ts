import mongodb from 'mongodb';

/** Connect to MongoDB
 * 
 * @param {string} connectionString - Connection string
 * @returns {Promise<mongodb.MongoClient | Error>}
 * 
 * @author Frash | Francesco Ascenzi
 * @fund https://www.paypal.com/donate/?hosted_button_id=QL4PRUX9K9Y6A
 * @license Apache 2.0
 */
export async function connect(connectionString: string): Promise<mongodb.MongoClient | Error> {
  try {
    let client: mongodb.MongoClient = new mongodb.MongoClient(connectionString);
    client = await client.connect();

    return client;
  } catch (err: unknown) {
    return new Error(String(err));
  }
}

/** Create or get a MongoDB collection based on the function's parameters
 * 
 * @param {mongodb.MongoClient} connection - MongoDB connection object
 * @param {string} collectionName - Collection name
 * @returns {Promise<mongodb.Collection | Error>}
 * 
 * @author Frash | Francesco Ascenzi
 * @fund https://www.paypal.com/donate/?hosted_button_id=QL4PRUX9K9Y6A
 * @license Apache 2.0
 */
export async function getCollection(connection: mongodb.MongoClient, collectionName: string): Promise<mongodb.Collection | Error> {

  if (typeof collectionName != 'string' || !collectionName || collectionName.length == 0) {
    return new Error('Inputted collection name was not a valid string')
  }

  // Check existing collections and create the collection if 'collectionName' doesn't exist
  const existingCollections = await connection.db().listCollections().toArray();

  let found = false;
  for (let i = 0; i < existingCollections.length; i++) {    
    if (collectionName == existingCollections[i].name) {
      found = true;
      break;
    }
  }

  // Create the collection if it doesn't exist
  if (!found) await connection.db().createCollection(collectionName);

  // Check indexes and create the 'user' index if it doesn't exist
  if (!await (await connection.db().collection(collectionName)).indexExists('user')) {
    await (await connection.db().collection(collectionName)).createIndex({'user': -1});
  }

  return connection.db().collection(collectionName);
}