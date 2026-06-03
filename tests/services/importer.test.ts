import fs from 'node:fs/promises';
import os from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { TableName } from '../../src/types/index.js';

let originalCwd = process.cwd();

describe('services/importer.ts', () => {
  beforeEach(() => {
    vi.resetModules();
    originalCwd = process.cwd();
    process.env.DB_PATH = ':memory:';
  });

  afterEach(() => {
    process.chdir(originalCwd);
  });

  test('importer inserts followers and updates duplicate usernames', async () => {
    const { getDb } = await import('../../src/db/connection.js');
    const { importer } = await import('../../src/services/importer.js');

    const tempDir = await fs.mkdtemp(join(os.tmpdir(), 'instaco-importer-'));
    const fixturePath = join(tempDir, 'duplicate-followers.json');
    await fs.writeFile(
      fixturePath,
      JSON.stringify([
        { string_list_data: [{ value: 'user_a', timestamp: 1690000000 }] },
        { string_list_data: [{ value: 'user_a', timestamp: 1690001000 }] },
      ]),
      'utf8',
    );

    await importer(fixturePath, TableName.NEW_FOLLOWERS, 1);

    const row = getDb()
      .prepare('SELECT username, ig_from, updated_at FROM new_followers WHERE username = ?')
      .get('user_a') as { username: string; ig_from: number; updated_at: number };
    const count = getDb().prepare('SELECT COUNT(*) AS total FROM new_followers').get() as {
      total: number;
    };

    expect(row.username).toBe('user_a');
    expect(row.ig_from).toBe(1690000000);
    expect(row.updated_at).toBeGreaterThan(0);
    expect(count.total).toBe(1);
  });

  test('importer inserts followings from parsed file', async () => {
    const { getDb } = await import('../../src/db/connection.js');
    const { importer } = await import('../../src/services/importer.js');

    const tempDir = await fs.mkdtemp(join(os.tmpdir(), 'instaco-importer-'));
    const fixturePath = join(tempDir, 'followings.json');
    await fs.writeFile(
      fixturePath,
      JSON.stringify({
        relationships_following: [
          { title: 'user_b', string_list_data: [{ timestamp: 1690003000 }] },
        ],
      }),
      'utf8',
    );

    await importer(fixturePath, TableName.FOLLOWINGS, 10);

    const row = getDb()
      .prepare('SELECT username, ig_from FROM followings WHERE username = ?')
      .get('user_b');

    expect(row).toEqual({ username: 'user_b', ig_from: 1690003000 });
  });
});
