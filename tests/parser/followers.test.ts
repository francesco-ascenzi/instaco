import fs from 'node:fs/promises';
import os from 'node:os';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

import { parseFollowers } from '../../src/parser/followers.js';

async function collector(generator: AsyncGenerator<any, void, unknown>) {
  const results: any[] = [];
  for await (const item of generator) {
    results.push(item);
  }
  return results;
}

describe('parser/followers.js modules', () => {
  test('parseFollowers reads follower usernames and timestamps', async () => {
    const fixturePath = join('./tests/fixtures/followers.json');
    const parsed = await collector(parseFollowers(fixturePath));

    expect(parsed).toEqual([
      { username: 'follower_one', timestamp: 1690000000 },
      { username: 'follower_two', timestamp: 1690001000 },
    ]);
  });

  test('parseFollowers throws if file does not exist', async () => {
    await expect(async () => {
      await collector(parseFollowers('/not/existing/file.json'));
    }).rejects.toThrow();
  });

  test('parseFollowers throws on invalid JSON', async () => {
    await expect(async () => {
      await collector(parseFollowers('./tests/fixtures/invalid.json'));
    }).rejects.toThrow();
  });

  test('parseFollowers skips completely malformed values', async () => {
    const tempDir = await fs.mkdtemp(join(os.tmpdir(), 'instaco-parser-'));
    const fixturePath = join(tempDir, 'edge-followers.json');

    await fs.writeFile(
      fixturePath,
      JSON.stringify([null, {}, { string_list_data: [] }, { string_list_data: [{}] }]),
      'utf8',
    );

    const parsed = await collector(parseFollowers(fixturePath));

    expect(parsed).toEqual([]);
  });

  test('parseFollowers normalizes partial follower entries', async () => {
    const tempDir = await fs.mkdtemp(join(os.tmpdir(), 'instaco-parser-'));
    const fixturePath = join(tempDir, 'partial-followers.json');

    await fs.writeFile(
      fixturePath,
      JSON.stringify([
        {
          string_list_data: [
            {
              value: 'only_username',
            },
          ],
        },
        {
          string_list_data: [
            {
              timestamp: 1690000000,
            },
          ],
        },
      ]),
      'utf8',
    );

    const parsed = await collector(parseFollowers(fixturePath));

    expect(parsed).toEqual([]);
  });
});
