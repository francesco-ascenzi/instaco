const fs = require('fs').promises;

/** Function to scrap and return an array of followers/followings from the main file
 * 
 * @param {String} mainFilePath Main file path
 * 
 * @returns {Object} {ok: true/false, msg: error message if ok is false, list: followers/followings list if ok is true}
 */
async function scrapList(mainFilePath) {

  // Initialize error message, final list, and parsed file
  let errorMessage = [];
  let mainList = [];
  let parsedFile;

  // Parse and check if content has strings or keys
  try {
    parsedFile = await JSON.parse(await fs.readFile(mainFilePath, 'utf-8'));

    if (parsedFile.length == 0 || Object.keys(parsedFile).length == 0) {
      errorMessage.push('File is not coming from Instagram or main fields are empty');
    }
  } catch(e) {
    console.error(e);
    process.exit(1);
  }

  // Parse file and check
  for (const key in parsedFile) {
    if (await parsedFile[key].hasOwnProperty("string_list_data")) {
      if (!Array.isArray(parsedFile[key].string_list_data) ||
        parsedFile[key].string_list_data.length < 1 ||
        parsedFile[key].string_list_data > 1
      ) {
        errorMessage.push(`No keys or values were found inside string_list_data in '${mainFilePath}', please check the file`);
      }

      if (!parsedFile[key].string_list_data[0].hasOwnProperty("value")) {
        errorMessage.push(`No users were found in '${mainFilePath}', please check the file`);
      }

      let convertedTimestamp = new Date(parsedFile[key].string_list_data[0].timestamp * 1000);
      mainList.push({
        Name: parsedFile[key].string_list_data[0].value,
        Follow: true,
        Timestamp: convertedTimestamp,
        LastRetrieve: new Date()
      });
    } else if (Array.isArray(parsedFile[key])) {
      for (let i = 0; i < parsedFile[key].length; i++) {
        if (!parsedFile[key][i].hasOwnProperty("string_list_data")) {
          errorMessage.push(`No keys or values were found in '${mainFilePath}', please check the file`);
        }

        if (!Array.isArray(parsedFile[key][i].string_list_data) ||
          parsedFile[key][i].string_list_data.length > 1 ||
          parsedFile[key][i].string_list_data.length == 0
        ) {
          errorMessage.push(`No keys or values were found inside string_list_data in '${mainFilePath}', please check the file`);
        }

        if (!parsedFile[key][i].string_list_data[0].hasOwnProperty("value")) {
          errorMessage.push(`No users were found in '${mainFilePath}', please check the file`);
        }

        let convertedTimestamp = new Date(parsedFile[key][i].string_list_data[0].timestamp * 1000);
        mainList.push({
          Name: parsedFile[key][i].string_list_data[0].value,
          Follow: null,
          Timestamp: convertedTimestamp,
          LastRetrieve: new Date()
        });
      }
    } else {
      errorMessage.push(`No keys or values were found in '${mainFilePath}', please check the file`);
    }
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
      list: mainList
    };
  }
}

module.exports = scrapList;