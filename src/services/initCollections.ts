import { Db } from "mongodb";

import { logError } from "../lib/prompt.js";

/** Initialize the 'followers' and 'followings' collections in the database
 * 
 * @param mongo - MongoDB database instance
 * @param settings - Settings object
 * @returns True if initialization is successful, false otherwise
 */
export async function initCollections(mongo: Db): Promise<boolean> {
  try {
    const collectionList = await mongo.listCollections().toArray();
    const collectionsNames = collectionList.map(col => col.name);

    if (!collectionsNames.includes("followers")) {
      await mongo.createCollection("followers");
    }
    
    if (!collectionsNames.includes("followings")) {
      await mongo.createCollection("followings");
    }

    const followers = mongo.collection("followers");
    const followings = mongo.collection("followings");

    await followers.createIndex({ user: 1 }, { unique: true });
    await followings.createIndex({ user: 1 }, { unique: true });

    await followers.deleteMany({});
    await followings.deleteMany({});

    return true;
  } catch (err: unknown) {
    logError(String(err));
    return false;
  }
}