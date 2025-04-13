/** =============================================================================================== */
/** 
 * @author Frash | Francesco Ascenzi
 * @fund https://www.paypal.com/donate/?hosted_button_id=QL4PRUX9K9Y6A
 * @license Apache 2.0
 */ 
/** =============================================================================================== */
import mongodb, { Collection, Db, MongoClient } from "mongodb";

import { stdResponse } from "../../types/index.js";

export default class Connection {
  protected mongoClient: MongoClient;
  public mongoErrors: string[] = [];

  constructor(connUri: string) {
    this.mongoClient = new mongodb.MongoClient(connUri);
  }

  /**
   * 
   */
  async openConnection(): Promise<string> {
    try {
      await this.mongoClient.connect();
      return "";
    } catch (err: unknown) {
      return String(err);
    }
  }

  /**
   * 
   * @returns 
   */
  async close(): Promise<void> {
    if (!this.mongoClient) return;
    await this.mongoClient.close();
  }
  
  /**
   * 
   * @param dbName 
   * @param collectionName 
   * @returns 
   */
  async useCollection(dbName: string, collectionName: string): Promise<Collection | string> {
    if (!this.mongoClient) return "Database connection is lost, try again";
    const choseDb: Db = this.mongoClient.db(dbName);
    return choseDb.collection(collectionName);
  }
}