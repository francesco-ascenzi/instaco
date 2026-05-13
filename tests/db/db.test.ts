import { beforeEach, describe, expect, test, vi } from 'vitest';

async function loadDbModules() {
  process.env.DB_FILE_PATH = ':memory:';
  vi.resetModules();

  const connection = await import('../../src/db/connection.js');
  const query = await import('../../src/db/query.js');
  const transactions = await import('../../src/db/transactions.js');
  const initDbModule = await import('../../src/db/init.js');

  return {
    getDb: connection.getDb,
    run: query.run,
    transaction: transactions.transaction,
    initDb: initDbModule.initDb,
  };
}

type TableRow = {
  name: string;
};

type Result = { value: number };

describe('database connection and schema', () => {
  beforeEach(() => {
    vi.resetModules();
    process.env.DB_FILE_PATH = ':memory:';
  });

  test('establishes an in-memory SQLite connection', async () => {
    const { getDb } = await loadDbModules();
    const db = getDb();

    expect(db).toBeDefined();
    expect((db.prepare('SELECT 1 AS value').get() as Result).value).toBe(1);
  });

  test('creates followers and followings tables with initDb', async () => {
    const { getDb, initDb } = await loadDbModules();
    initDb();

    const tables = getDb()
      .prepare(
        "SELECT name FROM sqlite_master WHERE type='table' AND name IN ('followers', 'followings') ORDER BY name",
      )
      .all() as TableRow[];

    expect(tables.map((row: { name: string }) => row.name)).toEqual(['followers', 'followings']);
  });

  test('applies SQLite pragmas on initialization', async () => {
    const { getDb, initDb } = await loadDbModules();
    initDb();

    const journalMode = getDb().pragma('journal_mode', { simple: true });
    const synchronous = getDb().pragma('synchronous', { simple: true });

    expect(['memory', 'wal', 'delete']).toContain(journalMode);
    expect(synchronous).toBe(1);
  });

  test('runs queries inside a transaction and commits data', async () => {
    const { getDb, initDb, run, transaction } = await loadDbModules();
    initDb();

    const insertResult = transaction(() => {
      return run(
        'INSERT INTO followers (username, ig_from, created_at, updated_at) VALUES (?, ?, ?, ?)',
        ['test_user', 123, 123, 123],
      );
    });

    const row = getDb()
      .prepare('SELECT username, ig_from FROM followers WHERE username = ?')
      .get('test_user');

    expect(insertResult.changes).toBe(1);
    expect(row).toEqual({ username: 'test_user', ig_from: 123 });
  });
});
