/** ===============================================================================================
 * @author Frash | Francesco Ascenzi
 * @fund https://www.paypal.com/donate/?hosted_button_id=QL4PRUX9K9Y6A
 * @license Apache 2.0 
================================================================================================ */
import mongodb, { Collection, Db, MongoClient } from "mongodb";

export default class Connection {
  public mongoClient: MongoClient;
  public mongoErrors: string[] = [];

  constructor(connUri: string) {
    this.mongoClient = new mongodb.MongoClient(connUri);
  }

  /** Open a connection to the database
   * 
   * @returns {string} - Empty string if successful, error message otherwise
   */
  async openConnection(): Promise<string> {
    try {
      await this.mongoClient.connect();
      return "";
    } catch (err: unknown) {
      return String(err);
    }
  }

  /** Close the connection to the database
   * 
   * @returns {Promise<void>} - No return value
   */
  async close(): Promise<void> {
    if (!this.mongoClient) return;
    await this.mongoClient.close();
  }
  
  /** Use a collection from the database
   * 
   * @param {string} dbName - Database name
   * @param {string} collectionName - Collection name
   * @returns {Collection | string} - Collection object or error message
   */
  async useCollection(dbName: string, collectionName: string): Promise<Collection | string> {
    if (!this.mongoClient) return "Database connection is lost, try again";
    const choseDb: Db = this.mongoClient.db(dbName);
    return choseDb.collection(collectionName);
  }
}