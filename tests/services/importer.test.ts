import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

const followerFixture = [
  {
    string_list_data: [{ value: 'common_user', timestamp: 1690000000 }],
  },
];

const followingFixture = {
  relationships_following: [
    {
      title: 'common_user',
      string_list_data: [{ value: 'common_user', timestamp: 1690001000 }],
    },
    {
      title: 'lost_user',
      string_list_data: [{ value: 'lost_user', timestamp: 1690002000 }],
    },
  ],
};

describe('importer and output generation', () => {
  let tempDir: string;
  let outputDir: string;

  beforeEach(async () => {
    vi.resetModules();
    process.env.DB_FILE_PATH = ':memory:';
    process.env.MAX_BATCH_SIZE = '100';
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'instaco-importer-'));
    outputDir = path.join(tempDir, 'output');
    await fs.mkdir(outputDir, { recursive: true });
  });

  afterEach(async () => {
    if (tempDir) await fs.rm(tempDir, { recursive: true, force: true });
  });

  test('imports followers and followings, then writes missing followers to output', async () => {
    const followerFile = path.join(tempDir, 'followers.json');
    const followingFile = path.join(tempDir, 'followings.json');

    await fs.writeFile(followerFile, JSON.stringify(followerFixture));
    await fs.writeFile(followingFile, JSON.stringify(followingFixture));

    const { initDb } = await import('../../src/db/init.js');
    const { getDb } = await import('../../src/db/connection.js');
    const { importer } = await import('../../src/services/importer.js');
    const { default: generateFiles } = await import('../../src/services/generateFiles.js');

    initDb();

    const config = {
      DB_FILE_PATH: ':memory:',
      MAX_BATCH_SIZE: 100,
      INPUT_PATH: tempDir,
      OUTPUT_PATH: outputDir,
    };

    await importer(followerFile, 'followers', config.MAX_BATCH_SIZE);
    await importer(followingFile, 'followings', config.MAX_BATCH_SIZE);
    await generateFiles(outputDir);

    const outputFiles = await fs.readdir(outputDir);
    expect(outputFiles).toHaveLength(1);
    expect(outputFiles[0]).toContain('unfollow_me_');

    const generated = await fs.readFile(path.join(outputDir, outputFiles[0]), 'utf8');
    expect(generated.trim()).toBe('lost_user\ncommon_user');

    const rowsFollowers = getDb()
      .prepare('SELECT username FROM followers ORDER BY username')
      .all() as { username: string }[];
    const rowsFollowings = getDb()
      .prepare('SELECT username FROM followings ORDER BY username')
      .all() as { username: string }[];

    expect(rowsFollowers.map((row) => row.username)).toEqual([]);
    expect(rowsFollowings.map((row) => row.username)).toEqual(['common_user', 'lost_user']);
  });
});
