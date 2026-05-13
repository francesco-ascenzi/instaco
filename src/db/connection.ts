import Database, { type Database as DatabaseType } from "better-sqlite3";

import { loadConfig } from "../utils/validation.js";

let db: DatabaseType | null = null;

/** Initializes SQLite database instance
 *
 * The database connection is created only once, on first access,
 * using the file path defined in the application configuration
 *
 * @returns {DatabaseType} A singleton instance of the SQLite database
 */
export function getDb(): DatabaseType {
  if (!db) {
    const config = loadConfig();
    db = new Database(config.DB_FILE_PATH);
  }

  return db;
}