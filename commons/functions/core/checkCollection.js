/** Function to check, then in case of create a mongoDB collection
 * 
 * @param {MongoConnectionObject} connObject MongoDB connection object
 * @param {String} collectionName Collection name
 * 
 * @returns {Object} {ok: true/false, msg: error message if ok's false}
 */
async function checkCollection(connObject, collectionName) {

  // Check for collectionsNames array
  if (!collectionName) {
    return {
      ok: false,
      msg: 'Collection name is undefined or null'
    };
  } else if (typeof collectionName != 'string') {
    return {
      ok: false,
      msg: 'Collection name is not a string'
    };
  } else if (collectionName.length == 0) {
    return {
      ok: false,
      msg: 'Collection name is empty'
    };
  }

  // Check for existing collections and if they don't exists create them
  const existingCollections = await connObject.listCollections().toArray();

  let foundCollection = false;
  if (existingCollections.length == 0) {
    await connObject.createCollection(collectionName);
    foundCollection = true;
  } else {
    for (let i = 0; i < existingCollections.length; i++) {
      const currentCollection = existingCollections[i];
      
      if (collectionName == currentCollection.name) {
        foundCollection = true;
        break;
      }
    }
  }

  if (!foundCollection) {
    await connObject.createCollection(collectionName);
  }

  return {ok: true};
}

module.exports = checkCollection;