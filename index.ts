/** INSTACO | Tool to compare Instagram's followers/followings and track them over time with Node and MongoDb
 * 
 * @author Frash | Francesco Ascenzi
 * @fund https://buymeacoffee.com/frash
 * @license Apache 2.0
 */
import fs from 'fs';
import mongodb from 'mongodb';
import path from 'path';

// Functions
import welcomeMessage from "./fns/core/welcomeMessage.js";
import parseSettings from './fns/core/parseSettings.js';
import { connect, getCollection } from './connection/index.js';
import prompt from './fns/core/readUserInput.js';
import processFile from './fns/processFile.js';
import generateDiffLists from './fns/generateDiffLists.js';

// Constants and variables
const __root = import.meta.dirname;
const settingsFilePath: string = path.join(__root, 'settings.json');

const errorLine = '\x1b[31m> Error:\x1b[0m';

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

// Start main function
(async (): Promise<number> => {
  
  // Prints out welcome message
  await welcomeMessage();
  
  // Parse settings
  const settings: settingsInterface | Error = await parseSettings(__root, settingsFilePath);
  if (settings instanceof Error) {
    console.error(errorLine, settings);
    return 1;
  }

  console.info(`> Extracted settings from \x1b[30m${settingsFilePath}\x1b[0m`);
  
  // Connect, check, and create final collection, then retrieve files' names within main files folder
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

  let filesFound: string[] = [];
  try {
    filesFound = await fs.promises.readdir(settings.files.inputFiles);
  } catch (err: unknown) {
    console.error(errorLine, err);
    return 1;
  }
  
  // Extract files' name
  let jsonFiles: string[] = [];
  for (let i = 0; i < filesFound.length; i++) {
    if (filesFound[i].match(/\.json$/gmi)) {
      jsonFiles.push(filesFound[i]);
    }
  }
  
  // Check if there are more than two .json files
  if (jsonFiles.length != 2) {
    if (jsonFiles.length == 0) {
      console.error(errorLine, `Instaco didn't find .json files into ${settings.files.inputFiles}`)
      return 1;
    } else if (jsonFiles.length == 1) {
      console.error(errorLine, `Instaco found more than 2 files into ${settings.files.inputFiles}: ${jsonFiles.join(', ')}`);
      return 1;
    } else {
      console.error(errorLine, `Instaco found more than 2 files into ${settings.files.inputFiles}: ${jsonFiles.join(', ')}`);
      return 1;
    }
  }

  console.info(`> \x1b[30m${jsonFiles.join(', ')}\x1b[0m files found at \x1b[30m${settings.files.inputFiles}\x1b[0m`);

  // Await user input
  const userInput: string | Error = prompt(`> Are they? (type y to continue) `, 1);
  if (userInput instanceof Error) {
    console.error(errorLine, userInput);
    return 1;
  }

  if (userInput.trim().toLowerCase() != 'y') {
    console.error(`> Process terminated due to the user's choice`);
    return 1;
  }

  // Initialize timer
  console.time('> Completed in');
  
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
  const processDiff: true | Error = await generateDiffLists(settings.files.outputList);
  if (processDiff instanceof Error) {
    console.error(errorLine, processDiff);
    return 1;
  }
  
  // Close db connection and prints end messages
  await connection.close(true);

  console.info(`> MongoDB connection closed`);
  console.info('\x1b[32m');
  console.timeEnd('> Completed in');
  console.info('\x1b[0m');

  return 0;
})();