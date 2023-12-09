/** Function to update Defollow/Follow values based on compared lists
 * 
 * @param {Array} list Array list
 * @param {MongoCollectionObject} followersModel MongoDB model object
 * @param {Number} type type == 0 update for defollow, type == 1 update for unfollow and return plain text list
 * 
 * @returns {Object} {ok: true/false, msg: error message if ok is false, textList: unfollowings list if ok is true and if type == 1}
 */
async function updateStoredList(list, followersModel, type = 0) {

  // Initialize error message, and plain text list
  let errorMessage = [];
  let plainText = '';

  // Compare and store values into db based on type
  for (let i = 0; i < list.length; i++) {
    const element = list[i];
    plainText += `${element.Name}\n`;

    if (type == 1) {
      element.Follow = false;
    } else {
      delete element.Follow;
    }

    const foundFollower = await followersModel.findOne({Name: element.Name});
    if (foundFollower == null) {
      if (type == 1) {
        await followersModel.insertOne(element);
      } else {
        Object.assign(element, {
          Defollow: true,
          Follow: false
        });
        await Followers.insertOne(element);
      }
    } else {
      let setObject = {};
      let setArray = {};

      if (type == 1) {
        if (foundFollower.Follow == true) {
          Object.assign(setObject, {Follow: false});
          Object.assign(setArray, {Follow: true});
        }
      } else {
        if (foundFollower.Defollow == undefined || foundFollower.Defollow == null || foundFollower.Defollow == false) {
          Object.assign(setObject, {
            Follow: false,
            Defollow: true
          });
          Object.assign(setArray, {
            Defollow: false,
            Follow: false
          });
        }
      }

      if (new Date(element.Timestamp).getTime() != new Date(foundFollower.Timestamp).getTime()) {
        Object.assign(setObject, {Timestamp: element.Timestamp});
        Object.assign(setArray, {Timestamp: foundFollower.Timestamp});
      }

      if (Object.keys(setObject).length > 0) {
        Object.assign(setObject, {LastRetrieve: new Date()});
        let pushArray = [setArray];

        await followersModel.updateOne({
          Name: element.Name
        }, {
          $set: setObject,
          $push: {
            History: {
              $each: pushArray,
              $position: 0
            }
          }
        });
      } else {
        await followersModel.updateOne({
          Name: element.Name
        }, {
          $set: {
            LastRetrieve: new Date()
          }
        });
      }
    }
  }

  // Check for error messages
  if (errorMessage.length > 0) {
    return {
      ok: false,
      msg: errorMessage.join('\n')
    }
  } else {
    if (type == 1) {
      return {
        ok: true, 
        textList: plainText
      };
    } else {
      return {ok: true};
    }
  }
}

module.exports = updateStoredList;