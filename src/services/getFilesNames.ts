/** ===============================================================================================
 * @author Frash | Francesco Ascenzi
 * @fund https://www.paypal.com/donate/?hosted_button_id=QL4PRUX9K9Y6A
 * @license Apache 2.0 
================================================================================================ */
import fs from "fs/promises";
import { stdResponse } from "../types/index.js";

/** Get the names of the followers/followings files in a given folder
 * 
 * @param filesPath - Path to the folder containing the files
 * @returns {stdResponse<string[]>} - Object containing the status of the operation and the files names
 */
export default async function getFilesNames(filesPath: string): Promise<stdResponse<string[]>> {
  // Retrieve files names within the main files folder
  let filesFound: string[] = [];
  try {
    filesFound = await fs.readdir(filesPath);
  } catch (err: unknown) {
    return {
      ok: false,
      msg: String(err)
    };
  }

  // Extract only the .json files names
  let jsonFiles: string[] = [];
  for (let i = 0; i < filesFound.length; i++) {
    if (filesFound[i].match(/\.json$/gmi)) {
      jsonFiles.push(filesFound[i]);
    }
  }

  return {
    ok: true,
    value: jsonFiles
  };
}