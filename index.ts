/** INSTACO | A tool to compare Instagram's followers/followings and track them over time with Node and MongoDB
 * 
 * @author Frash | Francesco Ascenzi
 * @fund https://www.paypal.com/donate/?hosted_button_id=QL4PRUX9K9Y6A
 * @license Apache 2.0
 */
import fs from 'fs';
import mongodb from 'mongodb';
import path from 'path';
import { connect, getCollection } from './connection/index.js';

import generateDiffLists from './fns/generateDiffLists.js';
import parseSettings from './fns/core/parseSettings.js';
import processFile from './fns/processFile.js';
import prompt from './fns/core/readUserInput.js';
import welcomeMessage from "./fns/core/welcomeMessage.js";

// Constants and variables
const __root = import.meta.dirname;
const errorLine = '\x1b[31m> Error:\x1b[0m';

const settingsFilePath: string = path.join(__root, 'settings.json');

// Interfaces & types
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

/** Starts the main process
 * 
 * @return {Promise<number>}
 * 
 * @author Frash | Francesco Ascenzi
 * @fund https://www.paypal.com/donate/?hosted_button_id=QL4PRUX9K9Y6A
 * @license Apache 2.0
 */
(async (): Promise<number> => {
  
  await welcomeMessage(); // Prints welcome message
  
  const settings: settingsInterface | Error = await parseSettings(__root, settingsFilePath);
  if (settings instanceof Error) {
    console.error(errorLine, settings);
    return 1;
  }

  console.info(`> Extracted settings from \x1b[30m${settingsFilePath}\x1b[0m`);

  // Check/create main output files folder
  try {
    await fs.promises.access(settings.files.outputList, fs.constants.F_OK);
  } catch (err: unknown) {
    try {
      await fs.promises.mkdir(settings.files.outputList);
      console.info(`> Folder created at \x1b[30m${settings.files.outputList}\x1b[0m`);
    } catch (permErr: unknown) {
      console.error(errorLine, permErr);
      return 1;
    }
  }
  
  // Handle connection and collections from MongoDB
  const connection: mongodb.MongoClient | Error = await connect(settings.connection.string);
  if (connection instanceof Error) {
    console.error(errorLine, connection);
    return 1;
  }

  console.info(`> Connection to MongoDB established \x1b[30m(${settings.connection.string})\x1b[0m`);
  
  const collection: mongodb.Collection<mongodb.BSON.Document> | Error = await getCollection(connection, settings.connection.collection);
  if (collection instanceof Error) {
    console.error(errorLine, collection);
    return 1;
  }

  console.info(`> Collection \x1b[30m${settings.connection.collection}\x1b[0m was found/created`);

  // Retrieve files names within the main files folder
  let filesFound: string[] = [];

  try {
    filesFound = await fs.promises.readdir(settings.files.inputFiles);
  } catch (err: unknown) {
    console.error(errorLine, String(err));
    return 1;
  }
  
  // Extract files names
  let jsonFiles: string[] = [];
  for (let i = 0; i < filesFound.length; i++) {
    if (filesFound[i].match(/\.json$/gmi)) {
      jsonFiles.push(filesFound[i]);
    }
  }
  
  // Check how many .json files were retrieved
  if (jsonFiles.length != 2) {
    if (jsonFiles.length == 0) {
      console.error(errorLine, `Instaco didn't find any .json files in ${settings.files.inputFiles}`)
      return 1;
    } else if (jsonFiles.length == 1) {
      console.error(errorLine, `Instaco found just 1 file in ${settings.files.inputFiles}: ${jsonFiles.join(', ')}`);
      return 1;
    } else {
      console.error(errorLine, `Instaco found more than 2 files in ${settings.files.inputFiles}: ${jsonFiles.join(', ')}`);
      return 1;
    }
  }

  console.info(`> \x1b[30m${jsonFiles.join(', ')}\x1b[0m files found in \x1b[30m${settings.files.inputFiles}\x1b[0m`);

  // Confirm the files
  const userInput: string | Error = prompt(`> Confirm? (type 'y' to continue) `, 1);
  if (userInput instanceof Error) {
    console.error(errorLine, userInput);
    return 1;
  }

  if (userInput.trim().toLowerCase() != 'y') {
    console.error(`> Process terminated due to user choice`);
    return 1;
  }

  console.time('> Completed in'); // Initialize timer

  // Clean 'followers'/'followings' collections
  const followers = await getCollection(connection, 'followers');
  const followings = await getCollection(connection, 'followings');

  if (followers instanceof Error || followings instanceof Error) {
    console.error(`General error retrieving 'followers' or 'followings' collection`);
    return 1;
  }

  await followers.deleteMany({});
  await followings.deleteMany({});

  // Process each file
  for (let i = 0; i < 2; i++) {
    const filePath: string = path.join(settings.files.inputFiles, jsonFiles[i]);

    const processFileResponse: true | Error = await processFile(connection, filePath, settings.files.batchSize);
    if (processFileResponse instanceof Error) {
      console.error(errorLine, processFileResponse);
      return 1;
    }

    console.info(`> Processed \x1b[30m${filePath}\x1b[0m`);
  }

  // Generate .txt diff files
  const processDiff: true | Error = await generateDiffLists(connection, collection, settings, __root);
  if (processDiff instanceof Error) {
    console.error(errorLine, processDiff);
    return 1;
  }

  console.info(`> \x1b[30m${settings.connection.collection}\x1b[0m collection was updated`);

  // Close db connection and prints end messages
  await connection.close(true);

  console.info(`> MongoDB connection closed\x1b[32m\n`);
  console.timeEnd('> Completed in');
  console.info('\x1b[0m\n\x1b[30mIf you liked this tool, consider funding it at:\x1b[0m ' + 
    'https://www.paypal.com/donate/?hosted_button_id=QL4PRUX9K9Y6A ' + 
    '\x1b[30m(the link is within package.json too)\x1b[0m\n'
  );

  return 0;
})();