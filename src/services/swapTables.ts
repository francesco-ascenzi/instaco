import { run } from '../db/query.js';
import { transaction } from '../db/transactions.js';

/** Replaces the current `followers` table with the temporary
 * `temp_followers` table inside a single atomic transaction.
 *
 * @returns void
 */
export function swapTables(): void {
  transaction(() => {
    run(`DROP TABLE followers`);
    run(`ALTER TABLE temp_followers RENAME TO followers`);
  });
}
