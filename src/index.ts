/** INSTACO | A tool to compare Instagram's followers/followings and track them over time with Node and MongoDB
 * 
 * @author Frash | Francesco Ascenzi
 * @fund https://www.paypal.com/donate/?hosted_button_id=QL4PRUX9K9Y6A
 * @license Apache 2.0
 */
import fs from "fs/promises";
import mongodb, { MongoClient } from "mongodb";
import path from "path";
import vdck from "vdck";

import { connect, getCollection } from './lib/connection.js';
import prompt from './lib/classes/prompt.js';
import { createDir, getRoot } from './lib/utilities.js';
import readSettings from "./services/readSettings.js";
import storeData from "./services/storeData.js";

import { stdResponse, settings, minStdResponse, extStdResponse } from "./types/index.js";
import compareLists from "./services/compareList.js";

// Constants and variables
const connection: prompt = new connection();
const csl: prompt = new prompt();

const __dirname: string = import.meta.dirname;

(async (): Promise<number> => {

  // Print the intro
  await csl.intro();

  // Get the project's root dir
  const rootPath: string = getRoot(__dirname);

  // Check if settings file exists and read it
  csl.info(`> Parsing settings file...`);
  const getSettings: extStdResponse<settings> = await readSettings(rootPath);
  csl.deleteLine();
  if (!getSettings.ok) {
    csl.error(getSettings.msg);
    return 1;
  }

  csl.info(`> ${getSettings.msg}`);

  // Check/create main i/o files folder
  const inputDir: minStdResponse = await createDir(getSettings.value.files.inputFiles);
  if (!inputDir.ok) {
    csl.error(inputDir.msg);
    return 1;
  }

  const outputDir: minStdResponse = await createDir(getSettings.value.files.outputList);
  if (!outputDir.ok) {
    csl.error(outputDir.msg);
    return 1;
  }

  // Handle connection and collections from MongoDB
  let connection: MongoClient;
  try {
    const tryToConnect: stdResponse<MongoClient> = await connect(getSettings.value.connection.uri);
    if (!tryToConnect.ok) throw new Error(tryToConnect.msg);
    connection = tryToConnect.value;
  } catch (err: unknown) {
    csl.error(String(err));
    return 1;
  }

  // console.info(`> Connected to \x1b[30m${getSettings.value.connection.uri}\x1b[0m`);

  // const collection: stdResponse<mongodb.Collection> = await getCollection(connection, getSettings.value.connection.db, getSettings.value.connection.collection);
  // if (!collection.ok) {
  //   console.error(errorLine, collection.msg, "\n");
  //   return 1;
  // }

  // console.info(`> Collection \x1b[30m${getSettings.value.connection.collection}\x1b[0m was found/created`);

  // // Retrieve files names within the main files folder
  // let filesFound: string[] = [];
  // try {
  //   filesFound = await fs.readdir(getSettings.value.files.inputFiles);
  // } catch (err: unknown) {
  //   console.error(errorLine, String(err), "\n");
  //   return 1;
  // }
  
  // // Extract files names
  // let jsonFiles: string[] = [];
  // for (let i = 0; i < filesFound.length; i++) {
  //   if (filesFound[i].match(/\.json$/gmi)) {
  //     jsonFiles.push(filesFound[i]);
  //   }
  // }
  
  // // Check how many .json files were retrieved
  // if (jsonFiles.length != 2) {
  //   console.error(errorLine, `Instaco ${jsonFiles.length > 0 ? "found only 1 (" + jsonFiles.join(', ') + ")" : "didn't find"} .json files in the ${getSettings.value.files.inputFiles} folder\n`);
  //   return 1;
  // }

  // console.info(`> \x1b[30m${jsonFiles.join(', ')}\x1b[0m files found in \x1b[30m${getSettings.value.files.inputFiles}\x1b[0m`);

  // // Confirm the files
  // const userInput: string = prompt(`> Confirm? (type 'y' to continue) `, 1);
  // if (userInput.toLowerCase() != 'y') {
  //   console.error(`> Process terminated due to user choice\n`);
  //   return 1;
  // }

  // console.time('> Completed in'); // Initialize timer

  // // Clean 'followers'/'followings' collections
  // const followers = await getCollection(connection, getSettings.value.connection.db, "followers");
  // if (!followers.ok) {
  //   console.error(errorLine, followers.msg, "\n");
  //   return 1;
  // }

  // const followings = await getCollection(connection, getSettings.value.connection.db, "followings");
  // if (!followings.ok) {
  //   console.error(errorLine, followings.msg, "\n");
  //   return 1;
  // }

  // await followers.value.deleteMany({});
  // await followings.value.deleteMany({});

  // // Process each file
  // for (let i = 0; i < 2; i++) {
  //   const filePath: string = path.join(getSettings.value.files.inputFiles, jsonFiles[i]);

  //   const processFileResponse: minStdResponse = await storeData(connection, getSettings.value.connection.db, filePath, getSettings.value.files.batchSize);
  //   if (!processFileResponse.ok) {
  //     console.error(errorLine, processFileResponse.msg, "\n");
  //     return 1;
  //   }

  //   console.info(`> Processed \x1b[30m${filePath}\x1b[0m`);
  // }

  // // Generate .txt diff files
  // const processDiff: minStdResponse = await compareLists(connection, collection.value, getSettings.value);
  // if (!processDiff.ok) {
  //   console.error(errorLine, processDiff.msg, "\n");
  //   return 1;
  // }

  // console.info(`> \x1b[30m${getSettings.value.connection.collection}\x1b[0m collection was updated`);

  // // Close db connection and prints end messages
  // await connection.close(true);

  // console.info(`> MongoDB connection closed\x1b[32m\n`);
  // console.timeEnd('> Completed in');
  // console.info('\x1b[0m\n\x1b[30mIf you liked this tool, consider funding it at:\x1b[0m ' + 
  //   'https://www.paypal.com/donate/?hosted_button_id=QL4PRUX9K9Y6A ' + 
  //   '\x1b[30m(the link is within package.json too)\x1b[0m\n'
  // );

  return 0;
})();