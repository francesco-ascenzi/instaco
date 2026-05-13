import { getDb } from "./connection.js";

/** Executes a parameterized SQL statement
 *
 * This function prepares the SQL statement and executes it with the provided
 * parameters using a safe parameter binding approach
 *
 * @param sql - The SQL statement to execute (e.g. INSERT, UPDATE, etc.)
 * @param params - Array of parameters to bind to the SQL statement
 * @returns The result of the execution
 */
export function run(sql: string, params: any[] = []) {
  return getDb().prepare(sql).run(...params);
}