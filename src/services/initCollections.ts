import { Db } from "mongodb";

import { logError } from "../lib/prompt.js";

/** Initialize the 'followers' and 'followings' collections in the database
 * 
 * @param mongo - MongoDB database instance
 * @param settings - Settings object
 * @returns True if initialization is successful, false otherwise
 */
export async function initCollections(mongo: Db): Promise<boolean> {
  const followers = mongo.collection("followers");
  const followings = mongo.collection("followings");

  try {
    await followers.deleteMany({});
    await followings.deleteMany({});

    if (!followers.indexExists("user")) {
      await followers.createIndex({ user: 1 }, { unique: true });
    }

    if (!followings.indexExists("user")) {
      await followings.createIndex({ user: 1 }, { unique: true });
    }

    return true;
  } catch (err: unknown) {
    logError(String(err));
    return false;
  }
}