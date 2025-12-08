import mongodb from "mongodb";

import { OpenConnectionResponse } from "../types/index.js";

/** Open a connection to the database
 * 
 * @returns Connection response object
*/
export async function openConnection(uri: string, database: string): Promise<OpenConnectionResponse> {
  try {
    const client = new mongodb.MongoClient(uri);
    await client.connect();
    const db = client.db(database);
    return {
      ok: true,
      db: db
    };
  } catch (err: unknown) {
    return {
      ok: false,
      msg: String(err)
    };
  }
}