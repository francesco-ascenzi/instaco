import chalk from 'chalk';

import { getDb } from '../db/connection.js';
import { initDb } from '../db/init.js';

import findFiles from './findFiles.js';
import generatesFiles from './generateFiles.js';
import { importer } from './importer.js';
import { validateFiles } from './validateFiles.js';

import { confirm, intro, logError, printConfig } from '../utils/prompt.js';
import { loadConfig } from '../utils/validation.js';

/** Main entry point of the Instaco application.
 *
 * This function runs the full interactive CLI workflow:
 * 1. Displays an introduction screen
 * 2. Loads configuration from `.env`
 * 3. Prompts the user to confirm settings
 * 4. Initializes the database if not already available
 * 5. Scans the input directory for Instagram export files
 * 6. Asks user confirmation before processing
 * 7. Imports each file into the SQLite database via the importer
 * 8. Generates the final "unfollow" diff output file
 * 9. Optionally restarts the process in a loop
 * 10. Exits the application cleanly when requested
 *
 * @returns Resolves when the application terminates
 */
export default async function start() {
  // Intro
  await intro();

  // Configs
  const config = loadConfig();
  printConfig(config);

  if (!(await confirm('Are these settings correct? (y/n)'))) {
    logError('fix the settings file and restart Instaco.');
    process.exit(1);
  }

  // Init db
  if (!getDb()) initDb();

  // Find files
  const files = await findFiles(config.INPUT_PATH);
  if (!validateFiles(files)) process.exit(1);

  console.log('__________________________');
  console.log('\nFiles found:', '\n');
  for (const file of files) {
    console.log(
      chalk.gray('Type:'),
      file.type === 'followers' ? chalk.greenBright('followers ') : chalk.blueBright('followings'),
      chalk.gray('| Name:'),
      file.name,
    );
  }

  if (!(await confirm('\nAre these files correct? (y/n)'))) {
    logError('change file paths. Aborted by user.');
    process.exit(1);
  }

  // Start timer
  console.log('__________________________', '\n');
  console.time(chalk.greenBright('Completed in'));

  // Import records
  for (const file of files) {
    await importer(file.path, file.type, config.MAX_BATCH_SIZE);
  }

  // Generate output file
  await generatesFiles(config.OUTPUT_PATH);

  // End
  console.timeEnd(chalk.greenBright('Completed in'));
}
