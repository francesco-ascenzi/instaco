import chalk from "chalk";
import { constants, existsSync } from "fs";
import fs from "fs/promises";
import path from "path";

import { logError } from "./prompt.js";

/** Create a directory if it doesn't exist
 * 
 * @param dirPath - Path to the directory
 * @returns Response object indicating success or failure
 */
export async function createDir(dirPath: string): Promise<boolean> {
  try {
    await fs.access(dirPath, constants.F_OK);
  } catch (err: unknown) {
    try {
      await fs.mkdir(dirPath, { recursive: true });
    } catch (dirError: unknown) {
      logError(chalk.red(`> Error: Unable to create directory at path ${dirPath}`));
      return false;
    }
  }

  return true;
}

/** Get the root directory of the project
 * 
 * @param mainDirPath - Path to the main directory
 * @returns Path to the root directory
 */
export function getRoot(mainDirPath: string): string {
  mainDirPath = mainDirPath.replace(/^file:\/\/\//g, process.platform === "win32" ? "" : "/");
  const rootArray: string[] = mainDirPath.trim().split("/").slice(0, -2);
  if (rootArray.length == 0) return path.sep;
  return rootArray.join(path.sep);
}

/** Check if a directory exists
 * 
 * @param dirPath - Path to the directory
 * @param mustExist - Whether the directory must exist
 * @returns True if the directory exists or was not required to exist, false otherwise
 */
export function checkDir(dirPath: string, mustExist: boolean): boolean {
  try {
    if (mustExist && !existsSync(dirPath)) {
      logError(`directory at path '${dirPath}' doesn't exist`);
      return false;
    }

    return existsSync(dirPath);
  } catch (err: unknown) {
    logError(String(err));
    return false;
  }
}

/** Extract username from Instagram profile href
 * 
 * @param href - Instagram profile href
 * @returns Username extracted from the href
 */
export function extractUsernameFromHref(href: string): string {
  const parts = href.split("/");
  const totalLength = parts.length;
  return parts[totalLength - 1];
}