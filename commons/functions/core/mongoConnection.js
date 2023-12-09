const {MongoClient} = require("mongodb");

/** Function to connect to Mongo DB
 * 
 * @param {String} connectionString Connection string
 * 
 * @returns {Connection|Exit} Connection object or process exit
 */
async function mongoConnection(connectionString) {
  try {
    const client = new MongoClient(connectionString);

    await client.connect();
    return client;
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

module.exports = mongoConnection;