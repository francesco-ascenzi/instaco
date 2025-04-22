/** ===============================================================================================
 * @author Frash | Francesco Ascenzi
 * @fund https://www.paypal.com/donate/?hosted_button_id=QL4PRUX9K9Y6A
 * @license Apache 2.0 
================================================================================================ */
import fs from "fs";
import { FileHandle } from "fs/promises";
import path from "path";

import { minStdResponse, stdResponse } from "../types/index.js";

/** Create a directory if it doesn't exist
 * 
 * @param {string} dirPath - Path to the directory
 * @returns {minStdResponse} - Response object indicating success or failure
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
 * @returns {stdResponse<string>} - Response object containing the file content or an error message
 */
export async function readFile(filePath: string): Promise<stdResponse<string>> {
  try {
    // Try to access the file
    const tryToOpen: FileHandle = await fs.promises.open(filePath, "a+");
    await tryToOpen.close();

    return {
      ok: true,
      value: await fs.promises.readFile(filePath, "utf-8")
    };
  } catch (err: unknown) {
    return {
      ok: false,
      msg: String(err)
    };
  }
}

/** Get the root directory of the project
 * 
 * @param {string} mainDirPath - Path to the main directory
 * @returns {string} - Path to the root directory
 */
export function getRoot(mainDirPath: string): string {
  mainDirPath = mainDirPath.replace(/^file:\/\/\//g, process.platform === "win32" ? "" : "/");
  const rootArray: string[] = mainDirPath.trim().split("/").slice(0, -2);
  if (rootArray.length == 0) return path.sep;
  return rootArray.join(path.sep);
}