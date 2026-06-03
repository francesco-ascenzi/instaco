import { describe, expect, test, vi } from 'vitest';
import { TableName } from '../../src/types/index.js';

describe('services/tables.ts', () => {
  test('swapTables renames tables and preserves the source content', async () => {
    process.env.DB_PATH = ':memory:';
    vi.resetModules();

    const { getDb } = await import('../../src/db/connection.js');
    const { swapTables } = await import('../../src/services/tables.js');

    const db = getDb();
    db.prepare(
      'INSERT INTO followings (username, ig_from, created_at, updated_at) VALUES (?, ?, ?, ?)',
    ).run('swapped_user', 123, 1000, 1000);

    swapTables(TableName.FOLLOWERS, TableName.FOLLOWINGS);

    const row = db
      .prepare('SELECT username, ig_from FROM followers WHERE username = ?')
      .get('swapped_user');
    const tableExists = db
      .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name = ?")
      .get('followings');

    expect(row).toEqual({ username: 'swapped_user', ig_from: 123 });
    expect(tableExists).toBeUndefined();
  });

  test('swapTables throws when both table names are the same', async () => {
    const { swapTables } = await import('../../src/services/tables.js');

    expect(() => swapTables(TableName.FOLLOWERS, TableName.FOLLOWERS)).toThrow(
      "Same tables' names: followers - followers",
    );
  });

  test('cleanTables removes all rows from the given table', async () => {
    process.env.DB_PATH = ':memory:';
    vi.resetModules();

    const { getDb } = await import('../../src/db/connection.js');
    const { cleanTables } = await import('../../src/services/tables.js');

    const db = getDb();
    db.prepare(
      'INSERT INTO followers (username, ig_from, created_at, updated_at) VALUES (?, ?, ?, ?)',
    ).run('clean_user', 10, 1000, 1000);

    cleanTables('followers');

    const count = db.prepare('SELECT COUNT(*) AS total FROM followers').get() as { total: number };
    expect(count.total).toBe(0);
  });
});
