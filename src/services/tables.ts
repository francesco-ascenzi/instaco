import { query } from '../db/query.js';
import { transaction } from '../db/transactions.js';

import type { TableName } from '../types/index.js';

/** Atomically swaps two database tables by renaming them within a single transaction
 *
 * @param first - Target table that will be replaced
 * @param second - Source table that will take its place
 * @returns void
 */
export function swapTables(first: TableName, second: TableName): void {
  if (first === second) throw new Error(`Same tables' names: ${first} - ${second}`);

  transaction(() => {
    query(`ALTER TABLE ${first} RENAME TO ${first}_old`);
    query(`ALTER TABLE ${second} RENAME TO ${first}`);
    query(`DROP TABLE IF EXISTS ${first}_old`);
  });
}

/** Deletes all rows from the specified database table
 *
 * @param name - Name of the table to clear
 * @returns void
 */
export function cleanTables(name: string): void {
  query(`DELETE FROM ${name}`);
}
