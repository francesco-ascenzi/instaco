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
});
