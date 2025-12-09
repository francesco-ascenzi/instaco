/** ======================================================
 * INSTACO
 * 
 * A tool to compare Instagram's followers/followings 
 * and track them over time with Node and MongoDB
 * 
 * @author Frash | Francesco Ascenzi
 * @license Apache 2.0 
======================================================= */
import chalk from "chalk";
import path from "path";

import { getUserInput, intro, logError, logInfo } from './lib/prompt.js';
import { openConnection } from './lib/connection.js';

import { checkDirectories } from "./services/checkDirectories.js";
import compareLists from "./services/compareList.js";
import getFilesNames from "./services/getFilesNames.js";
import { initCollections } from "./services/initCollections.js";
import { parseSettings } from "./services/settings.js";
import processFile from "./services/storeData.js";

import { Settings } from "./types/index.js";

const settings: Settings = {
  connection: {
    uri: "mongodb://127.0.0.1:27017/",
    db: "instagram",
    collection: "trackFollowers"
  },
  maxFileBatchSize: 5000,
  inputFilesPath: "data",
  outputListPath: "data/list",
  skipSettings: false
};

// Main function
(async (): Promise<number> => {
  await intro();

  while (true) {
    // Read and parse settings
    await parseSettings(settings);
    console.log("\n" + JSON.stringify(settings, null, 2)+ "\n");
    if (settings.skipSettings) {
      logInfo("Skipping settings confirmation as per configuration.");
    } else {
      const isSettingsCorrect = await getUserInput(`Do you want to continue with these settings? (y/n)`, 1);
      if (isSettingsCorrect.toLowerCase() !== "y") {
        logError("Please fix the settings file and restart Instaco");
        break;
      }
    }

    // Check directories
    if (!(await checkDirectories(settings))) break;

    // Connect to MongoDB
    const mongo = await openConnection(settings.connection.uri, settings.connection.db);
    if (!mongo.ok) {
      logError(mongo.msg);
      break;
    }

    // Search files
    const foundFiles = await getFilesNames(settings.inputFilesPath);
    if (!foundFiles.ok) {
      logError(foundFiles.msg);
      break;
    }

    // Ask user to confirm found files
    const jsonFiles: string[] = foundFiles.value;
    logInfo(`Found the following files:\n` +
      `- ${jsonFiles[0]}` + "\n" +
      `- ${jsonFiles[1]}` + "\n" 
    );
    const areFilesCorrect: string = await getUserInput(`Do you want to continue? (y/n)`, 1);
    if (areFilesCorrect.toLowerCase() !== "y") {
      logInfo("aborted by user");
      break;
    }

    console.time(chalk.green('Completed in')); // Initialize timer

    // Clean 'followers'/'followings' collections
    const collections = await initCollections(mongo.db);
    if (!collections) break;

    // Process each file
    for (let i = 0; i < 2; i++) {
      const filePath: string = path.join(settings.inputFilesPath, jsonFiles[i]);

      const processFileResponse = await processFile(mongo.db, filePath, settings.maxFileBatchSize);
      if (!processFileResponse) break;

      logInfo("Processed ", chalk.underline(filePath));
    }

    // Generate .txt diff files
    const processDiff = await compareLists(mongo.db, settings);
    if (!processDiff) break;

    console.log();
    console.timeEnd(chalk.green('Completed in')); // End timer

    const restartProcess: string = await getUserInput(`\nDo you want to restart? (y/n)`, 1);
    if (restartProcess.toLowerCase() !== "y") {
      logInfo("\nExiting Instaco. Goodbye!");
      break;
    }
  }

  process.exit(0);
})();