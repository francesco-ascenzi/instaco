import fs from 'fs';
import path from 'path';

// Interfaces
interface objectOfKeyString {
  [key: string]: any;
}

interface settingsInterface {
  "connection": {
    "string": string,
    "db": string,
    "collection": string
  },
  "files": {
    "batchSize": number,
    "inputFiles": string,
    "outputList": string
  }
};

// Constants and variables
const stdSettings = `{
  "connection": {
    "string": "mongodb://127.0.0.1:27018/",
    "db": "instagram",
    "collection": "trackFollowers"
  },
  "files": {
    "batchSize": 5000
    "inputFiles": "data",
    "outputList": "data/list"
  }
}`;

/** Check if the object's value is a string (more than 1 character) or an object
 * 
 * @param {objectOfKeyString} obj - Main object
 * @param {string} key - Key to search within the object
 * @param {boolean} type - Type of data to search for => "o": object | "s": string | "n": number
 * @returns {Promise<JSON | null>}
 * 
 * @author Frash | Francesco Ascenzi
 * @fund https://www.paypal.com/donate/?hosted_button_id=QL4PRUX9K9Y6A
 * @license Apache 2.0
 */
function checkSettings(obj: objectOfKeyString, key: string, type: string): boolean {
  if (type == 's') { // String
    if (!(key in obj) || !obj[key] || !(typeof obj[key] == 'string' && obj[key].length > 1)) {
      return false;
    }
  } else if (type == 'o') { // Object
    if (!(key in obj) || !obj[key] || !(typeof obj[key] == 'object' && !Array.isArray(obj[key]))) {
      return false;
    }
  } else if (type == 'n') { // Number
    if (!(key in obj) || typeof obj[key] != 'number' || obj[key] <= 0) {
      return false;
    }
  } else {
    return false;
  }
  
  return true;
}

/** Parse settings from the file
 * 
 * @param {string} __root - Root's files path
 * @param {string} settingsFilePath - Setting's file path
 * @returns {Promise<settingsInterface | null>}
 * 
 * @author Frash | Francesco Ascenzi
 * @fund https://www.paypal.com/donate/?hosted_button_id=QL4PRUX9K9Y6A
 * @license Apache 2.0
 */
export default async function parseSettings(__root: string, settingsFilePath: string): Promise<settingsInterface | Error> {

  // Initialize settings object
  let settings: settingsInterface | null = null;
  try {
    try {
      await fs.promises.access(settingsFilePath, fs.constants.R_OK);

      const settingsFile = await fs.promises.readFile(settingsFilePath, 'utf-8');
      settings = await JSON.parse(settingsFile);
    } catch (err) {
      // If the file doens't exists create a new one
      await fs.promises.writeFile(settingsFilePath, stdSettings, 'utf-8');
      settings = await JSON.parse(stdSettings);
    }

    // Check mandatory keys/values of settings object
    if (!settings) {
      throw new Error('Empty or invalid settings.json file');
    }

    if (!('connection' in settings) || !settings.connection || !(typeof settings.connection == 'object' && !Array.isArray(settings.connection)) || 
      !('files' in settings) || !settings.files || !(typeof settings.files == 'object' && !Array.isArray(settings.files))
    ) {
      throw new Error('No "files" or "connection" key was found in settings');
    }

    if (!checkSettings(settings.connection, 'string', 's') || !checkSettings(settings.connection, 'db', 's') || 
      !checkSettings(settings.connection, 'collection', 's') || !checkSettings(settings.files, 'inputFiles', 's') || 
      !checkSettings(settings.files, 'outputList', 's') || !checkSettings(settings.files, 'batchSize', 'n')
    ) {
      throw new Error('One of "string"/"db"/"collection"/"inputFiles"/"outputList" keys was not found in settings');
    }

    settings.files.inputFiles = path.join(__root, settings.files.inputFiles);
    settings.files.outputList = path.join(__root, settings.files.outputList);

    return settings;
  } catch (err: unknown) {
    return new Error(String(err));
  }
}