import fs from "fs/promises";

import { logError } from "../lib/prompt.js";
import { checkDir } from "../lib/utilities.js";

import { Settings } from "../types/index.js";

/** Check required directories based on settings
 * 
 * @param settings - Settings information
 * @returns True if all directories are valid, false otherwise
 */
export async function checkDirectories(settings: Settings): Promise<boolean> {
  if (!checkDir(settings.inputFilesPath, true)) return false;
  if (!checkDir(settings.outputListPath, false)) {
    try {
      await fs.mkdir(settings.outputListPath, { recursive: true });
    } catch (error: unknown) {
      logError(`Unable to create output directory at path ${settings.outputListPath}`);
      return false;
    }
  }

  return true;
}