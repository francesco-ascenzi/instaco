import fs from 'node:fs/promises';
import path from 'path';

import { parseFollowers } from '../parser/followers.js';
import { parseFollowings } from '../parser/followings.js';

import { logError } from '../utils/prompt.js';

import { type FileType } from '../types/index.js';

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
          files.push({
            name: file,
            path: filePath,
            type: 'followers',
          });

          break;
        }

        if (files.some((f) => f.path === filePath)) continue;
      } catch {}

      try {
        for await (const _ of parseFollowings(filePath)) {
          files.push({
            name: file,
            path: filePath,
            type: 'followings',
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
