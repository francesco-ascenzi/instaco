import fs from 'node:fs';
import path from 'node:path';

import { getDb } from './connection.js';

/** Initializes database schema and PRAGMA settings
 *
 * @returns void
 */
export function initDb(): void {
  const db = getDb();

  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA synchronous = NORMAL;
  `);

  const schemasFilePath = path.resolve('db/schemas/tables.sql');
  const schemas = fs.readFileSync(schemasFilePath, 'utf8');

  db.exec(schemas);
}
