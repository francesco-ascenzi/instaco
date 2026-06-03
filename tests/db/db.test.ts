import { beforeEach, describe, expect, test, vi } from 'vitest';

async function loadDbModules() {
  process.env.DB_PATH = ':memory:';
  vi.resetModules();

  const connection = await import('../../src/db/connection.js');
  const query = await import('../../src/db/query.js');
  const transactions = await import('../../src/db/transactions.js');

  return {
    getDb: connection.getDb,
    run: query.query,
    transaction: transactions.transaction,
    resetConnection: connection.resetConnection,
  };
}

describe('db/* module', () => {
  beforeEach(() => {
    vi.resetModules();
    process.env.DB_PATH = ':memory:';
  });

  test('establishes an in-memory SQLite connection', async () => {
    const { getDb } = await loadDbModules();
    const db = getDb();

    expect(db).toBeDefined();
    expect((db.prepare('SELECT 1 AS value').get() as { value: number }).value).toBe(1);
  });

  test('creates followers and followings tables with initialization', async () => {
    const { getDb, resetConnection } = await loadDbModules();
    // ensure a fresh connection and trigger schema creation
    resetConnection();
    getDb();

    const tables = getDb()
      .prepare(
        "SELECT name FROM sqlite_master WHERE type='table' AND name IN ('followers', 'followings') ORDER BY name",
      )
      .all() as { name: string }[];

    expect(tables.map((row: { name: string }) => row.name)).toEqual(['followers', 'followings']);
  });

  test('applies SQLite pragmas on initialization', async () => {
    const { getDb, resetConnection } = await loadDbModules();
    resetConnection();
    getDb();

    const journalMode = getDb().pragma('journal_mode', { simple: true });
    const synchronous = getDb().pragma('synchronous', { simple: true });

    expect(['memory', 'wal', 'delete']).toContain(journalMode);
    expect(synchronous).toBe(1);
  });

  test('runs queries inside a transaction and commits data', async () => {
    const { getDb, resetConnection, run, transaction } = await loadDbModules();
    resetConnection();
    getDb();

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
