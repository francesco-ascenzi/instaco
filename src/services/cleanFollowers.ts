import fs from 'node:fs';
import path from 'path';

import { getDb } from '../db/connection.js';

import { getStringDate } from '../utils/date.js';

/** Exports followers that are no longer present in the temporary followers table
 * into a timestamped text file.
 *
 * @param outputDirPath - Absolute or relative path of the directory
 * where the output file will be created.
 * @returns Resolves when the file has been completely written.
 */
export async function cleanFollowers(outputDirPath: string): Promise<void> {
  const query = `
    SELECT 
      f.username,
      f.ig_from,
      datetime(f.created_at / 1000, 'unixepoch') as created_at 
    FROM followers f
      LEFT JOIN temp_followers tf
      ON f.username = tf.username
    WHERE tf.username IS NULL
      ORDER BY f.ig_from DESC
  `;

  const stmt = getDb().prepare(query);

  const outputFilePath = path.resolve(outputDirPath, `prev_followers_${getStringDate()}.txt`);
  const stream = fs.createWriteStream(outputFilePath, {
    encoding: 'utf8',
  });

  for (const record of stmt.iterate() as Iterable<{ username: string; created_at: string }>) {
    stream.write(`${record.username}\t| ${record.created_at}\n`);
  }

  await new Promise((resolve, reject) => {
    stream.end();
    stream.on('finish', resolve);
    stream.on('error', reject);
  });
}
