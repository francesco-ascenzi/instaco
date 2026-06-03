import { query } from '../db/query.js';
import { transaction } from '../db/transactions.js';

import { parseFollowers } from '../parser/followers.js';
import { parseFollowings } from '../parser/followings.js';
import { TableName } from '../types/index.js';

/** Imports Instagram data (followers or followings) from a JSON file
 * into the SQLite database using batched transactions.
 *
 * @param file - Path to the JSON file to import
 * @param tableName - Target database table
 * @param maxBatchSize - Maximum number of records per batch insert
 *
 * @returns void
 */
export async function importer(
  file: string,
  tableName: TableName,
  maxBatchSize: number,
): Promise<void> {
  const now = Date.now();
  const batch: any[] = [];

  const parser = tableName === TableName.NEW_FOLLOWERS ? parseFollowers : parseFollowings;

  for await (const user of parser(file)) {
    batch.push(user);

    if (batch.length >= maxBatchSize) {
      flush(batch, tableName, now);
      batch.length = 0;
    }
  }

  if (batch.length) {
    flush(batch, tableName, now);
  }
}

/** Writes a batch of users into the SQLite database inside a transaction.
 *
 * @param batch - Array of user records to persist
 * @param tableName - Target database table
 * @param now - Timestamp used for `created_at` and `updated_at` fields
 *
 * @returns void
 */
function flush(batch: any[], tableName: TableName, now: number): void {
  transaction(() => {
    for (const user of batch) {
      query(
        `
        INSERT INTO ${tableName} (username, ig_from, created_at, updated_at)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(username) DO UPDATE SET
          updated_at = excluded.updated_at
        `,
        [user.username, user.timestamp, now, now],
      );
    }
  });
}
