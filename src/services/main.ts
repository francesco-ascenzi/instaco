import { getUserInput, intro, logError, logInfo } from '../utils/prompt.js';
import findFiles from "../services/findFiles.js";

import { loadConfig } from "../utils/validation.js";
import { initDb } from "../db/init.js";
import { importer } from "../services/importer.js";

let dbInit = false;

process.on('SIGINT', (e) => {
  logError(e);
});

export default async function start() {
  await intro();

  while (true) {
    const config = loadConfig();
    console.log("\n" + JSON.stringify(config, null, 2)+ "\n");
    const isSettingsCorrect = await getUserInput(`Do you want to continue with these settings? (y/n)`, 1);
    if (isSettingsCorrect.toLowerCase() !== "y") {
      logError("Please fix the settings file and restart Instaco");
      break;
    }

    if (!dbInit) initDb();

    // Search files
    const files = await findFiles(config.INPUT_PATH);
    const areFilesCorrect: string = await getUserInput(`Are these files correct? (y/n)`, 1);
    if (areFilesCorrect.toLowerCase() !== "y") {
      logInfo("Aborted by user");
      break;
    }

    // Process each file
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      logInfo(String(file));
      await importer(config, file.path, file.type);
    }

    // Generate diff file and clean db


    const restartProcess: string = await getUserInput(`\nDo you want to restart? (y/n)`, 1);
    if (restartProcess.toLowerCase() !== "y") {
      logInfo("\nExiting Instaco. Goodbye!");
      break;
    }
  }

  process.exit(0);
}