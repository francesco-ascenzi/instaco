import { run } from '../db/query.js';
import { transaction } from '../db/transactions.js';

import { parseFollowers } from '../parser/followers.js';
import { parseFollowings } from '../parser/followings.js';

/** Imports Instagram data (followers or followings) from a JSON file
 * into the SQLite database using batched transactions.
 *
 * @param file - Path to the JSON file to import
 * @param type - Type of dataset being imported
 * @param maxBatchSize - Maximum number of records per batch insert
 *
 * @returns void
 */
export async function importer(
  file: string,
  type: 'followers' | 'followings',
  maxBatchSize: number,
): Promise<void> {
  const now = Date.now();
  const batch: any[] = [];

  const parser = type === 'followers' ? parseFollowers : parseFollowings;

  for await (const user of parser(file)) {
    batch.push(user);

    if (batch.length >= maxBatchSize) {
      flush(batch, type, now);
      batch.length = 0;
    }
  }

  if (batch.length) {
    flush(batch, type, now);
  }
}

/** Writes a batch of users into the SQLite database inside a transaction.
 *
 * @param batch - Array of user records to persist
 * @param type - Target database table
 * @param now - Timestamp used for `created_at` and `updated_at` fields
 *
 * @returns void
 */
function flush(batch: any[], type: string, now: number): void {
  const table = type === 'followers' ? 'temp_followers' : 'followings';

  transaction(() => {
    for (const user of batch) {
      run(
        `
        INSERT INTO ${table} (username, ig_from, created_at, updated_at)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(username) DO UPDATE SET
          ig_from = excluded.ig_from,
          updated_at = excluded.updated_at
        `,
        [user.username, user.timestamp, now, now],
      );
    }
  });
}
