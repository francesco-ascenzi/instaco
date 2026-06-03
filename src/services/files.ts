import { createWriteStream } from 'node:fs';
import { readdir } from 'node:fs/promises';
import { join } from 'node:path';

import { parseFollowers } from '../parser/followers.js';
import { parseFollowings } from '../parser/followings.js';

import { AppError } from '../errors/errors.js';
import { getDb } from '../db/connection.js';

import { whoUnfollowedMe, whoUnfollowsFromPrevFollowed } from '../db/templates.js';

import { GenerateFileType, TableName, type ExportMap, type FileType } from '../types/index.js';

// Export file map
export const EXPORTS_MAP: Record<GenerateFileType, ExportMap> = {
  [GenerateFileType.PREV_FOLLOWERS]: {
    query: whoUnfollowsFromPrevFollowed,

    formatter: (record: { username: string; created_at: string }) => {
      return `${record.username}\t| ${record.created_at}\n`;
    },
  },

  [GenerateFileType.WHO_UNFOLLOWED_ME]: {
    query: whoUnfollowedMe,

    formatter: (record: { username: string }) => {
      return `${record.username}\n`;
    },
  },
};

/** Scans a directory for Instagram JSON export files and automatically
 * detects whether each file contains followers or followings data.
 *
 * @param filesPath - Path to the directory containing JSON files
 * @returns A list of detected files with their associated type and absolute path
 */
export async function findFiles(filesPath: string): Promise<FileType[]> {
  const readDir = await readdir(filesPath);
  const jsonFiles = readDir.filter((file) => /\.json$/i.test(file));

  const files: FileType[] = [];
  for (const file of jsonFiles) {
    const filePath = join(filesPath, file);

    try {
      for await (const _ of parseFollowers(filePath)) {
        files.push({
          name: file,
          path: filePath,
          type: TableName.NEW_FOLLOWERS,
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
          type: TableName.FOLLOWINGS,
        });

        break;
      }
    } catch {}
  }

  const hasFollowers = files.some((f) => f.type === TableName.NEW_FOLLOWERS);
  if (!hasFollowers) {
    throw new AppError('missing followers file', 'handleFiles()');
  }

  const hasFollowings = files.some((f) => f.type === TableName.FOLLOWINGS);
  if (!hasFollowings) {
    throw new AppError('missing followings file', 'handleFiles()');
  }

  return files;
}

/** Executes a predefined export query and writes the formatted result
 * into a text file
 *
 * @param queryName - Identifier of the export query to execute
 * @param outputDirPath - Directory where the output file will be created
 * @param outputFileName - Name of the generated output file
 * @returns Resolves when the file has been completely written
 */
export async function exportToFile(
  queryName: GenerateFileType,
  outputDirPath: string,
  outputFileName: string,
): Promise<void> {
  const selectedExport = EXPORTS_MAP[queryName];
  const stmt = getDb().prepare(selectedExport.query);

  const outputFilePath = join(outputDirPath, outputFileName);
  const stream = createWriteStream(outputFilePath, {
    encoding: 'utf8',
  });

  for (const record of stmt.iterate()) {
    stream.write(selectedExport.formatter(record));
  }

  await new Promise<void>((resolve, reject) => {
    stream.end();
    stream.on('finish', () => resolve());
    stream.on('error', reject);
  });
}
