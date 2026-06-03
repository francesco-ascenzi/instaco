import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import Database, { type Database as DatabaseType } from 'better-sqlite3';

import { AppError } from '../errors/errors.js';

let db: DatabaseType | null = null;

/** Initializes SQLite database instance
 *
 * The database connection is created only once, on first access,
 * using the file path defined in the application configuration
 *
 * @returns A singleton instance of the SQLite database
 */
export function getDb(): DatabaseType {
  if (!db) {
    if (!process.env.DB_PATH?.trim()) {
      throw new AppError('Database file path was not defined', 'getDb()');
    }

    db = new Database(process.env.DB_PATH);

    // Init and schema creation
    db.exec(`
      PRAGMA journal_mode = WAL;
      PRAGMA synchronous = NORMAL;
    `);

    const schemasFilePath = join(process.cwd(), 'db/schemas/tables.sql');
    const schemas = readFileSync(schemasFilePath, 'utf8');

    db.exec(schemas);
  }

  return db;
}

/** Closes the SQLite database connection and resets the singleton instance
 *
 * @returns void
 */
export function resetConnection(): void {
  if (db) {
    db.close();
    db = null;
  }
}
