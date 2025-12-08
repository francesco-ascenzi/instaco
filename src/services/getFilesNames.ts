import fs from "fs/promises";

import { StdResponse } from "../types/index.js";

/** Get the names of the followers/followings files in a given folder
 * 
 * @param filesPath - Path to the folder containing the files
 * @returns {StdResponse<string[]>} - Object containing the status of the operation and the files names
 */
export default async function getFilesNames(filesPath: string): Promise<StdResponse<string[]>> {
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

  if (jsonFiles.length !== 2) {
    return {
      ok: false,
      msg: `It seems that the input folder doesn't contain exactly two .json files (found ${jsonFiles.length})`
    };
  }

  return {
    ok: true,
    value: jsonFiles
  };
}