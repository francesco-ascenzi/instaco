import fs from 'node:fs';
import path from 'node:path';

import { getDb } from '../db/connection.js';

import { getStringDate } from '../utils/date.js';

/** Generates a text file containing usernames of accounts that do not follow you back on Instagram
 *
 * Output:
 * - File: `unfollow_me_.txt`
 * - Format: one username per line
 *
 * @returns Resolves when the file has been fully written
 */
export default async function generatesFiles(outputDirPath: string): Promise<void> {
  const query = `
    SELECT 
      f.username,
      f.ig_from
    FROM followings f
    LEFT JOIN followers fr
      ON fr.username = f.username
    WHERE fr.username IS NULL
      ORDER BY f.ig_from DESC
  `;

  const stmt = getDb().prepare(query);

  const outputFilePath = path.resolve(outputDirPath, `unfollow_me_${getStringDate()}.txt`);
  const stream = fs.createWriteStream(outputFilePath, {
    encoding: 'utf8',
  });

  for (const record of stmt.iterate() as Iterable<{ username: string }>) {
    stream.write(record.username + '\n');
  }

  await new Promise((resolve, reject) => {
    stream.end();
    stream.on('finish', resolve);
    stream.on('error', reject);
  });
}
