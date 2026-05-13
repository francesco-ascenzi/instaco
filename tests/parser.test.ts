import fs from 'node:fs/promises';
import os from 'node:os';
import { describe, expect, test } from 'vitest';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseFollowers } from '../src/parser/followers.js';
import { parseFollowings } from '../src/parser/followings.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function collect<T>(generator: AsyncGenerator<T, void, unknown>) {
  const results: T[] = [];
  for await (const item of generator) {
    results.push(item);
  }
  return results;
}

describe('parser modules', () => {
  test('parseFollowers reads follower usernames and timestamps', async () => {
    const fixturePath = join(__dirname, 'fixtures', 'followers.json');
    const parsed = await collect(parseFollowers(fixturePath));

    expect(parsed).toEqual([
      { username: 'follower_one', timestamp: 1690000000 },
      { username: 'follower_two', timestamp: 1690001000 },
    ]);
  });

  test('parseFollowings reads following usernames and timestamps', async () => {
    const fixturePath = join(__dirname, 'fixtures', 'followings.json');
    const parsed = await collect(parseFollowings(fixturePath));

    expect(parsed).toEqual([
      { username: 'following_one', timestamp: 1690002000 },
      { username: 'following_two', timestamp: 1690003000 },
    ]);
  });

  test('parseFollowers skips completely malformed values', async () => {
    const tempDir = await fs.mkdtemp(join(os.tmpdir(), 'instaco-parser-'));
    const fixturePath = join(tempDir, 'edge-followers.json');

    await fs.writeFile(
      fixturePath,
      JSON.stringify([null, {}, { string_list_data: [] }, { string_list_data: [{}] }]),
      'utf8',
    );

    const parsed = await collect(parseFollowers(fixturePath));

    expect(parsed).toEqual([
      {
        timestamp: null,
        username: null,
      },
    ]);
  });

  test('parseFollowers skips invalid follower entries', async () => {
    const tempDir = await fs.mkdtemp(join(os.tmpdir(), 'instaco-parser-'));
    const fixturePath = join(tempDir, 'invalid-followers.json');
    await fs.writeFile(
      fixturePath,
      JSON.stringify([
        { string_list_data: [{ value: 'valid_follower', timestamp: 1690000000 }] },
        { string_list_data: [] },
        {},
      ]),
      'utf8',
    );

    const parsed = await collect(parseFollowers(fixturePath));

    expect(parsed).toEqual([{ username: 'valid_follower', timestamp: 1690000000 }]);
  });

  test('parseFollowings skips invalid following entries', async () => {
    const tempDir = await fs.mkdtemp(join(os.tmpdir(), 'instaco-parser-'));
    const fixturePath = join(tempDir, 'invalid-followings.json');
    await fs.writeFile(
      fixturePath,
      JSON.stringify({
        relationships_following: [
          {
            title: 'valid_following',
            string_list_data: [{ value: 'valid_following', timestamp: 1690002000 }],
          },
          { title: 'missing_data' },
          { string_list_data: [] },
        ],
      }),
      'utf8',
    );

    const parsed = await collect(parseFollowings(fixturePath));

    expect(parsed).toEqual([{ username: 'valid_following', timestamp: 1690002000 }]);
  });

  test('parseFollowings skips unrelated keys', async () => {
    const tempDir = await fs.mkdtemp(join(os.tmpdir(), 'instaco-parser-'));
    const fixturePath = join(tempDir, 'wrong-key.json');

    await fs.writeFile(
      fixturePath,
      JSON.stringify({
        something_else: [],
        relationships_following: [],
      }),
      'utf8',
    );

    const parsed = await collect(parseFollowings(fixturePath));

    expect(parsed).toEqual([]);
  });

  test('parseFollowings skips invalid entries', async () => {
    const tempDir = await fs.mkdtemp(join(os.tmpdir(), 'instaco-parser-'));
    const fixturePath = join(tempDir, 'invalid.json');

    await fs.writeFile(
      fixturePath,
      JSON.stringify({
        relationships_following: [{}, { title: 'x' }, { string_list_data: [] }],
      }),
      'utf8',
    );

    const parsed = await collect(parseFollowings(fixturePath));

    expect(parsed).toEqual([]);
  });
});
