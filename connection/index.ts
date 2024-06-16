import mongodb from 'mongodb';

/** Connect to Mongo
 * 
 * @param {string} connectionString Connection string
 * @return {Promise<mongodb.MongoClient | Error>}
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

/** Create or get a mongodb's collection based on function's parameters
 * 
 * @param {mongodb.MongoClient} connection MongoDB's connection object
 * @param {string} collectionName Collection name
 * @return {Promise<mongodb.Collection | Error>}
 */
export async function getCollection(connection: mongodb.MongoClient, collectionName: string): Promise<mongodb.Collection | Error> {

  // Check for collectionsNames array
  if (typeof collectionName != 'string' || !collectionName || collectionName.length == 0) {
    return new Error('Inputted collection name was not a valid string')
  }

  // Check existing collections and create it if 'collectionName' doesn't exists
  const existingCollections = await connection.db().listCollections().toArray();

  let found = false;
  for (let i = 0; i < existingCollections.length; i++) {    
    if (collectionName == existingCollections[i].name) {
      found = true;
      break;
    }
  }

  // Create it if it doesn't exists
  if (!found) await connection.db().createCollection(collectionName);

  // Check indexes and create it if 'user' index doesn't exists
  if (!await (await connection.db().collection(collectionName)).indexExists('user')) {
    await (await connection.db().collection(collectionName)).createIndex({'user': -1}, {unique: true});
  }

  return connection.db().collection(collectionName);
}