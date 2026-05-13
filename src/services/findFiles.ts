import fs from "node:fs/promises";
import path from "path";

import { parseFollowers } from "../parser/followers.js";
import { parseFollowings } from "../parser/followings.js";

import { logError, logInfo } from "../utils/prompt.js";

import { FileType } from "../types/index.js";

/** Scans a directory for Instagram JSON files and detects their type.
 *
 * @param filesPath - Path to the directory containing JSON files
 * @returns A list of detected files with their associated type and absolute path
 */
export default async function findFiles(filesPath: string): Promise<FileType[]> {
  try {
    const readDir = await fs.readdir(filesPath);
    const jsonFiles = readDir.filter((file) => /\.json$/i.test(file));

    const files: FileType[] = [];
    for (const file of jsonFiles) {
      const filePath = path.resolve(filesPath, file);

      try {
        for await (const _ of parseFollowers(filePath)) {
          logInfo(`- Type: followers  | File: ${file}`);
          files.push({
            type: "followers",
            path: filePath
          });

          break;
        }

        if (files.some((f) => f.path === filePath)) continue;
      } catch {}

      try {
        for await (const _ of parseFollowings(filePath)) {
          logInfo(`- Type: followings | File: ${file}`);
          files.push({
            type: "followings",
            path: filePath
          });

          break;
        }
      } catch {}
    }

    return files;
  } catch (err: unknown) {
    logError(String(err));
    return [];
  }
}