/** INSTACO
 * 
 * Compare followers/following throught time with the help of Node and MongoDB.
 * 
 * @author Francesco "Frash" Ascenzi
 * @license Apache 2.0
 */
const fs = require('fs');

const connectionString = 'mongodb://localhost:27018';
const databaseName = 'Instagram';
const collectionName = 'followers';
const filesDir = './data';

// Connection and collection check
const mongo = require('./commons/functions/core/mongoConnection.js');
const checkCollection = require('./commons/functions/core/checkCollection.js');

// Functions
const retrievePaths = require('./commons/functions/retrieveFilesPaths.js');
const scrapList = require('./commons/functions/scrapList.js');
const compareLists = require('./commons/functions/compareList.js');
const updateStoredList = require('./commons/functions/updateStoredList.js');
const generateFileName = require('./commons/functions/generateFileName.js');
const loadingBar = require('./commons/functions/loadingBar.js');

/** Main async function
 * 
 * @returns {Void}
 */
(async () => {

  // Initialize timer and the loading bar
  console.time("Loading complete in");
  loadingBar(0);

  // Connect, check, and assign followers collection
  const client = await mongo(connectionString);
  const retrieveDb = await client.db(databaseName);
  loadingBar(5.88);

  const collectionsResponse = await checkCollection(retrieveDb, collectionName);
  if (!collectionsResponse.ok) {
    console.error(collectionsResponse.msg);
    return;
  }
  loadingBar(11.76);

  let Followers;
  try {
    Followers = await retrieveDb.collection(collectionName);
  } catch(e) {
    console.error(err, 1);
    return;
  };
  loadingBar(17.64);

  // Create indexes
  if (!await Followers.indexExists('Name')) {
    await Followers.createIndex({'Name': -1}, {unique: true});
  }
  loadingBar(23.52);

  // Retrieve files paths if data folder, followers, and following files exists
  if (!fs.existsSync(filesDir)) {
    console.error(`No ${filesDir} found in the root folder`);
    return;
  }
  loadingBar(29.41);

  const retrievedPaths = retrievePaths();
  if (!retrievedPaths.ok) {
    console.error(retrievePaths.msg)
    return;
  }
  loadingBar(35.29);

  const followersFilePath = `${filesDir}/${retrievedPaths.followers}`;
  const followeingsFilePath = `${filesDir}/${retrievedPaths.followings}`;
  loadingBar(41.17);

  // Scraping lists to get followersList/following
  let followersList = await scrapList(followersFilePath);
  if (!followersList.ok) {
    console.error(followersList.msg);
    return;
  } else {
    followersList = followersList.list;
  }
  loadingBar(47.05);

  let followingsList = await scrapList(followeingsFilePath);
  if (!followingsList.ok) {
    console.error(followingsList.msg);
    return;
  } else {
    followingsList = followingsList.list;
  }
  loadingBar(52.94);

  // Insert followers if no documents were found
  try {
    if (await Followers.countDocuments({}) == 0) {
      await Followers.insertMany(followersList);
    }
  } catch(e) {
    console.error(e);
    return;
  }
  loadingBar(58.82);

  // Retrieve all followers from db
  const dbFollowers = await Followers.find({}).toArray();
  loadingBar(64.70);

  // Compare and retrieve differences between stored, and followers from the file
  let comparedFollowers = compareLists(dbFollowers, followersList);
  if (!comparedFollowers.ok) {
    console.error(comparedFollowers.msg);
    return;
  } else {
    comparedFollowers = comparedFollowers.list;
  }
  loadingBar(70.58);

  // Update followers/followings statuses
  const updateStatus = await updateStoredList(comparedFollowers, Followers, 0);
  if (!updateStatus.ok) {
    console.error(updateStatus.msg);
    return;
  }
  loadingBar(76.47);

  // Compare and retrieve differences between followings and followers files lists
  let compareFollowings = compareLists(followingsList, followersList);
  if (!compareFollowings.ok) {
    console.error(compareFollowings.msg);
    return;
  } else {
    compareFollowings = compareFollowings.list;
  }
  loadingBar(82.35);

  // Update unfollowings statuses
  const retrievePlainText = await updateStoredList(compareFollowings, Followers, 1);
  if (!retrievePlainText.ok) {
    console.error(retrievePlainText.msg);
    return;
  }
  loadingBar(88.23);

  // Generate a plain test of who doesn't follow me anymore
  fs.writeFileSync(`./data/lists/plain_list_${generateFileName()}.txt`, retrievePlainText.textList, "utf8");
  loadingBar(94.11);

  // Close db connection and print last item
  await client.close();
  loadingBar(100);
  return 0;
})();