/** ===============================================================================================
 * @author Frash | Francesco Ascenzi
 * @fund https://www.paypal.com/donate/?hosted_button_id=QL4PRUX9K9Y6A
 * @license Apache 2.0
================================================================================================ */
import fs from "fs";
import path from "path";
/** Update the main collection with the followers/followings data
 *
 * @param {Collection} collection - Main collection
 * @param {Collection} diffCollection - Followers or followings collection
 * @param {number} type - 0 for followers, 1 for followings
 * @param {settings} settings - Settings object
 * @returns {Promise<boolean | Error>} - true if the operation is successful, Error if not
 */
async function updateCollection(collection, diffCollection, type, settings) {
    // Initialize the bulk array
    let bulkArray = [];
    // Calculate how many cycles needs to the for loop and retrieve 'n' elements
    let cycles = 0;
    try {
        const total = await diffCollection.countDocuments();
        cycles = Math.ceil(total / settings.files.batchSize);
    }
    catch (err) {
        return new Error(String(err));
    }
    for (let i = 0; i < cycles; i++) {
        const currentBatch = await diffCollection.find().limit(settings.files.batchSize).skip(i * settings.files.batchSize).toArray();
        if (currentBatch.length > 0) {
            // Process the current batch
            for (let j = 0; j < currentBatch.length; j++) {
                const user = currentBatch[j];
                // If the current batch user is valid
                if (user) {
                    delete currentBatch[j].updatedAt;
                    // The user is a follower
                    if (type == 0) {
                        bulkArray.push({
                            updateOne: {
                                filter: {
                                    user: currentBatch[j].user
                                },
                                update: {
                                    $set: {
                                        followsMe: true,
                                        timestamp: user.timestamp,
                                        updatedAt: new Date()
                                    },
                                    $setOnInsert: {
                                        followsMeBefore: true,
                                        insertedAt: new Date()
                                    }
                                },
                                upsert: true
                            }
                        });
                        // The user is a following
                    }
                    else {
                        bulkArray.push({
                            updateOne: {
                                filter: {
                                    user: currentBatch[j].user
                                },
                                update: {
                                    $set: {
                                        followIt: true,
                                        timestamp: user.timestamp,
                                        updatedAt: new Date()
                                    },
                                    $setOnInsert: {
                                        insertedAt: new Date()
                                    }
                                },
                                upsert: true
                            }
                        });
                    }
                }
            }
            // Every batchSize elements do a bulkWrite operation
            if (bulkArray.length > 0) {
                try {
                    await collection.bulkWrite(bulkArray);
                    bulkArray = [];
                }
                catch (err) {
                    bulkArray = [];
                    return new Error(String(err));
                }
            }
        }
    }
    bulkArray = [];
    return true;
}
/** Compare the lists of followers and followings
 *
 * @param {MongoClient} conn - MongoDB connection object
 * @param {settings} settings - Settings object
 * @returns {Promise<minStdResponse>} - Response object indicating success or failure
 */
export default async function compareLists(conn, settings) {
    // Initialize the collections
    const followers = await conn.useCollection(settings.connection.db, "followers");
    if (typeof followers === "string") {
        return {
            ok: false,
            msg: followers
        };
    }
    const followings = await conn.useCollection(settings.connection.db, "followings");
    if (typeof followings === "string") {
        return {
            ok: false,
            msg: followings
        };
    }
    const collection = await conn.useCollection(settings.connection.db, settings.connection.collection);
    if (typeof collection === "string") {
        return {
            ok: false,
            msg: collection
        };
    }
    // Reset followsMe and followIt
    await collection.updateMany({}, { $set: { followsMe: false, followIt: false } });
    // Updates main collection
    const followersUpProcess = await updateCollection(collection, followers, 0, settings);
    if (followersUpProcess instanceof Error) {
        return {
            ok: false,
            msg: String(followersUpProcess)
        };
    }
    const followingsUpProcess = await updateCollection(collection, followings, 1, settings);
    if (followingsUpProcess instanceof Error) {
        return {
            ok: false,
            msg: String(followingsUpProcess)
        };
    }
    // Add followsMe: false to new followings that don't follow me
    await collection.updateMany({
        followsMe: {
            $exists: false
        }
    }, {
        $set: {
            followsMe: false
        }
    });
    // Generate diff list
    const differences = await collection.find({
        followsMe: false,
        followIt: true
    }, {
        projection: {
            _id: 0,
            user: 1
        }
    }).sort({
        timestamp: -1
    }).toArray();
    // Generate a new .txt file
    const year = new Date().getFullYear();
    const month = (1 + new Date().getMonth()).toString().padStart(2, "0");
    const day = new Date().getDate().toString().padStart(2, "0");
    const generatedFileName = `list_${year}${month}${day}.txt`;
    const listFilePath = path.join(settings.files.outputList, generatedFileName);
    try {
        await fs.promises.access(listFilePath, fs.constants.F_OK);
        await fs.promises.writeFile(listFilePath, "", "utf8");
    }
    catch (err) {
        try {
            await fs.promises.writeFile(listFilePath, "", "utf8");
        }
        catch (permErr) {
            return {
                ok: false,
                msg: String(permErr)
            };
        }
    }
    for (let i = 0; i < differences.length; i++) {
        if (("user" in differences[i]) &&
            differences[i].user &&
            typeof differences[i].user == "string") {
            await fs.promises.appendFile(listFilePath, `${differences[i].user}\n`, "utf8");
        }
    }
    return {
        ok: true
    };
}
