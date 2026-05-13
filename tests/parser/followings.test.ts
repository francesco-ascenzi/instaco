import fs from 'node:fs/promises';
import os from 'node:os';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

import { parseFollowings } from '../../src/parser/followings.js';

async function collector(generator: AsyncGenerator<any, void, unknown>) {
  const results: any[] = [];
  for await (const item of generator) {
    results.push(item);
  }
  return results;
}

describe('parser/followings.js modules', () => {
  test('parseFollowings reads following usernames and timestamps', async () => {
    const fixturePath = join('./tests/fixtures/followings.json');
    const parsed = await collector(parseFollowings(fixturePath));

    expect(parsed).toEqual([
      { username: 'following_one', timestamp: 1690002000 },
      { username: 'following_two', timestamp: 1690003000 },
    ]);
  });

  test('parseFollowings throws if file does not exist', async () => {
    await expect(async () => {
      await collector(parseFollowings('/not/existing/file.json'));
    }).rejects.toThrow();
  });

  test('parseFollowings throws on invalid JSON', async () => {
    await expect(async () => {
      await collector(parseFollowings('./tests/fixtures/invalid.json'));
    }).rejects.toThrow();
  });

  test('parseFollowings skips completely malformed values', async () => {
    const tempDir = await fs.mkdtemp(join(os.tmpdir(), 'instaco-parser-'));
    const fixturePath = join(tempDir, 'edge-followings.json');

    await fs.writeFile(
      fixturePath,
      JSON.stringify({
        relationships_following: [null, {}, { string_list_data: [] }, { string_list_data: [{}] }],
      }),
      'utf8',
    );

    const parsed = await collector(parseFollowings(fixturePath));

    expect(parsed).toEqual([]);
  });

  test('parseFollowings normalizes partial following entries', async () => {
    const tempDir = await fs.mkdtemp(join(os.tmpdir(), 'instaco-parser-'));
    const fixturePath = join(tempDir, 'partial-followings.json');

    await fs.writeFile(
      fixturePath,
      JSON.stringify({
        relationships_following: [
          {
            title: 'only_username',
            string_list_data: [
              {
                timestamp: 1690000000,
              },
            ],
          },
          {
            string_list_data: [
              {
                value: 'ignored',
              },
            ],
          },
        ],
      }),
      'utf8',
    );

    const parsed = await collector(parseFollowings(fixturePath));

    expect(parsed).toEqual([
      {
        username: 'only_username',
        timestamp: 1690000000,
      }
    ]);
  });

  test('parseFollowings ignores unrelated root keys', async () => {
    const tempDir = await fs.mkdtemp(join(os.tmpdir(), 'instaco-parser-'));
    const fixturePath = join(tempDir, 'unrelated-root.json');

    await fs.writeFile(
      fixturePath,
      JSON.stringify({
        unrelated_key: [
          {
            title: 'ignored_user',
            string_list_data: [
              {
                timestamp: 123,
              },
            ],
          },
        ],
      }),
      'utf8',
    );

    const parsed = await collector(parseFollowings(fixturePath));

    expect(parsed).toEqual([]);
  });
});
