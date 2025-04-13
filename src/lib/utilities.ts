/** =============================================================================================== */
/** 
 * @author Frash | Francesco Ascenzi
 * @fund https://www.paypal.com/donate/?hosted_button_id=QL4PRUX9K9Y6A
 * @license Apache 2.0
 */ 
/** =============================================================================================== */
import fs from "fs";
import path from "path";

import { minStdResponse } from "../types/index.js";

/** Create a directory if it doesn't exist
 * 
 * @param {string} dirPath - Path to the directory
 * @returns Path to the created directory
 */
export async function createDir(dirPath: string): Promise<minStdResponse> {
  try {
    await fs.promises.access(dirPath, fs.constants.F_OK);
  } catch (err: unknown) {
    try {
      await fs.promises.mkdir(dirPath, { recursive: true });
    } catch (dirError: unknown) {
      return {
        ok: false,
        msg: String(dirError)
      };
    }
  }
  
  return {
    ok: true
  };
}

/** Read a file and return its content
 * 
 * @param {string} filePath - Path to the file
 * @returns {string} - Content of the file
 */
export async function readFile(filePath: string): Promise<string> {
  try {
    await fs.promises.open(filePath, "a+");
    const content = await fs.promises.readFile(filePath, "utf-8");
    return content;
  } catch (err: unknown) {
    return "";
  }
}

/** Get the root directory of the project
 * 
 * @param {string} mainDirPath - Path to the main directory
 * @returns {string} - Path to the root directory
 */
export function getRoot(mainDirPath: string): string {
  const rootArray: string[] = mainDirPath.trim().split(path.sep).slice(0, -1);
  if (rootArray.length == 0) return path.sep;
  return rootArray.join(path.sep);
}