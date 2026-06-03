import chalk from 'chalk';

import { resetConnection } from '../db/connection.js';

import { AppError } from '../errors/errors.js';
import { findFiles, exportToFile } from './files.js';
import { importer } from './importer.js';
import { parseConfigs } from '../parser/configs.js';
import { cleanTables, swapTables } from './tables.js';

import { getStringDate } from '../utils/date.js';
import { confirm, intro } from '../utils/prompt.js';

import { GenerateFileType, TableName, type ConfigType } from '../types/index.js';

/** Main entry point of the Instaco application.
 *
 * This function runs the full interactive CLI workflow:
 * 1. Displays an introduction screen
 * 2. Loads configuration from the `settings.json` file
 * 3. Prompts the user to confirm settings
 * 4. Scans the input directory for Instagram export files
 * 5. Asks user confirmation before processing
 * 6. Imports each file into the SQLite database via the importer
 * 7. Generates the final "unfollow" diff output file
 * 8. Optionally restarts the process in a loop
 * 9. Exits the application cleanly when requested
 *
 * @returns Resolves when the application terminates
 */
export default async function start() {
  await intro();
  let configs: ConfigType | null = null;

  while (true) {
    // Config section
    if (!configs) {
      configs = await parseConfigs();
    }

    console.log('\nCurrent settings:', chalk.gray(`\n\n${JSON.stringify(configs, null, 2)}`), '\n');
    if (!(await confirm('Are these settings correct? (y/n)'))) {
      throw new AppError('Fix the settings file and restart Instaco.');
    }

    // Reset db connection
    resetConnection();

    // Files handling section
    const files = await findFiles(configs.globals.inputPath);

    console.log('__________________________');
    console.log('\nFiles found:', '\n');
    for (const file of files) {
      console.log(
        chalk.gray('Type:'),
        file.type === TableName.NEW_FOLLOWERS
          ? chalk.greenBright('followers ')
          : chalk.blueBright('followings'),
        chalk.gray('| Name:'),
        file.name,
      );
    }
    if (!(await confirm('\nAre these files correct? (y/n)'))) {
      throw new AppError('Change file paths. Aborted by user.');
    }

    // Start timer
    console.log('__________________________', '\n');
    console.time(chalk.greenBright('Completed in'));

    // Clean tables
    cleanTables('followings');

    // Import records
    for (const file of files) {
      await importer(file.path, file.type, configs.globals.maxBatchSize);
    }

    // Generate leaving followers output file
    await exportToFile(
      GenerateFileType.PREV_FOLLOWERS,
      configs.globals.outputPath,
      `prev_followers_${getStringDate()}.txt`,
    );

    // Replace followers table with new followers records
    swapTables(TableName.FOLLOWERS, TableName.NEW_FOLLOWERS);

    // Generate output file
    await exportToFile(
      GenerateFileType.WHO_UNFOLLOWED_ME,
      configs.globals.outputPath,
      `unfollowed_me_${getStringDate()}.txt`,
    );

    console.timeEnd(chalk.greenBright('Completed in'));

    // Choose to repeat
    console.log('__________________________', '\n');
    if (!(await confirm('Do you want to restart the process? (y/n)'))) {
      break;
    }
  }
}
