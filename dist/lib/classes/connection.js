/** ===============================================================================================
 * @author Frash | Francesco Ascenzi
 * @fund https://www.paypal.com/donate/?hosted_button_id=QL4PRUX9K9Y6A
 * @license Apache 2.0
================================================================================================ */
import mongodb from "mongodb";
export default class Connection {
    mongoClient;
    mongoErrors = [];
    constructor(connUri) {
        this.mongoClient = new mongodb.MongoClient(connUri);
    }
    /** Open a connection to the database
     *
     * @returns {string} - Empty string if successful, error message otherwise
     */
    async openConnection() {
        try {
            await this.mongoClient.connect();
            return "";
        }
        catch (err) {
            return String(err);
        }
    }
    /** Close the connection to the database
     *
     * @returns {Promise<void>} - No return value
     */
    async close() {
        if (!this.mongoClient)
            return;
        await this.mongoClient.close();
    }
    /** Use a collection from the database
     *
     * @param {string} dbName - Database name
     * @param {string} collectionName - Collection name
     * @returns {Collection | string} - Collection object or error message
     */
    async useCollection(dbName, collectionName, type = 0) {
        try {
            if (!this.mongoClient)
                throw new Error("Database connection is lost, try again");
            // Choose the database and collection
            const choseDb = this.mongoClient.db(dbName);
            const collection = choseDb.collection(collectionName);
            // Check indexes and create them if they don't exist
            const indexes = await collection.indexes();
            const indexExists = indexes.some(index => index.name === "user");
            if (!indexExists)
                await collection.createIndex({ user: 1 }, { name: "user" });
            return collection;
        }
        catch (err) {
            return String(err);
        }
    }
}
