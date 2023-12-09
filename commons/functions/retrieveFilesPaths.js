const fs = require('fs');

/** Retrieve followers/followings files paths
 * 
 * @returns {Object} {ok: true/false, msg: error message if ok is false, followers: followers file path if ok is true, followings: followings file path if ok is true}
 */
function retrieveFilesPaths() {

  // Initialize error messages, files paths, and followers/followings files names
  let errorMessage = [];
  let filesPath;

  let followersFileName;
  let followingsFileName;

  try {
    // Read dir and retrieve files names
    filesPath = fs.readdirSync('./data', {encoding: 'utf8'});

    followersFileName = filesPath.find(fileName => fileName.match(/followers/gm) != null);
    followingsFileName = filesPath.find(fileName => fileName.match(/following/gm) != null);

    if (!followersFileName) {
      errorMessage.push('No followers file found in data folder');
    }

    if (!followingsFileName) {
      errorMessage.push('No following file found in data folder');
    }
  } catch(e) {
    errorMessage.push(e);
  }

  // Check for error messages
  if (errorMessage.length > 0) {
    return {
      ok: false,
      msg: errorMessage.join('\n')
    }
  } else {
    return {
      ok: true, 
      followers: followersFileName,
      followings: followingsFileName
    };
  }
}

module.exports = retrieveFilesPaths;