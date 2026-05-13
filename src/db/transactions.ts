import { getDb } from "./connection.js";

/** Executes a function inside a SQL transaction
 *
 * @param fn - Function containing all database operations to execute atomically
 * @returns The return value of the executed transaction function
 */
export function transaction<T>(fn: () => T): T {
  const trx = getDb().transaction(fn);
  return trx();
}