import fs from 'node:fs/promises';
import os from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { GenerateFileType, TableName } from '../../src/types/index.js';

let originalCwd = process.cwd();

describe('services/files.ts', () => {
  beforeEach(() => {
    vi.resetModules();
    originalCwd = process.cwd();
    process.env.DB_PATH = ':memory:';
  });

  afterEach(() => {
    process.chdir(originalCwd);
  });

  test('findFiles detects both followers and followings files', async () => {
    const tempDir = await fs.mkdtemp(join(os.tmpdir(), 'instaco-files-'));

    await fs.writeFile(
      join(tempDir, 'followers.json'),
      JSON.stringify([{ string_list_data: [{ value: 'user_a', timestamp: 1690000000 }] }]),
      'utf8',
    );

    await fs.writeFile(
      join(tempDir, 'followings.json'),
      JSON.stringify({
        relationships_following: [
          { title: 'user_b', string_list_data: [{ timestamp: 1690001000 }] },
        ],
      }),
      'utf8',
    );

    const { findFiles } = await import('../../src/services/files.js');
    const files = await findFiles(tempDir);

    const types = files.map((file) => file.type).sort();
    expect(types).toEqual([TableName.FOLLOWINGS, TableName.NEW_FOLLOWERS]);
  });

  test('findFiles throws an AppError when followings file is missing', async () => {
    const tempDir = await fs.mkdtemp(join(os.tmpdir(), 'instaco-files-'));
    await fs.writeFile(
      join(tempDir, 'followers.json'),
      JSON.stringify([{ string_list_data: [{ value: 'user_a', timestamp: 1690000000 }] }]),
      'utf8',
    );

    const { findFiles } = await import('../../src/services/files.js');

    await expect(async () => {
      await findFiles(tempDir);
    }).rejects.toThrow('missing followings file');
  });

  test('exportToFile writes query results to disk', async () => {
    process.env.DB_PATH = ':memory:';
    const { getDb } = await import('../../src/db/connection.js');
    const { exportToFile } = await import('../../src/services/files.js');

    const db = getDb();
    db.prepare(
      'INSERT INTO followings (username, ig_from, created_at, updated_at) VALUES (?, ?, ?, ?)',
    ).run('export_user', 100, 123, 123);

    const tempDir = await fs.mkdtemp(join(os.tmpdir(), 'instaco-export-'));
    const outputFile = join(tempDir, 'output.txt');

    await exportToFile(GenerateFileType.WHO_UNFOLLOWED_ME, tempDir, 'output.txt');

    const content = await fs.readFile(outputFile, 'utf8');
    expect(content).toContain('export_user');
  });
});
