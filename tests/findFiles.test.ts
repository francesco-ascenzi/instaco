import { afterEach, describe, expect, test } from 'vitest';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

const fixtures = {
  followers: [
    {
      string_list_data: [
        { value: 'follower_one', timestamp: 1690000000 },
      ],
    },
  ],
  followings: {
    relationships_following: [
      {
        title: 'following_one',
        string_list_data: [{ value: 'following_one', timestamp: 1690002000 }],
      },
    ],
  },
};

describe('findFiles service', () => {
  let tempDir: string;

  afterEach(async () => {
    if (tempDir) await fs.rm(tempDir, { recursive: true, force: true });
  });

  test('detects followers and followings files from a directory', async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'instaco-findfiles-'));
    await fs.writeFile(path.join(tempDir, 'followers.json'), JSON.stringify(fixtures.followers));
    await fs.writeFile(path.join(tempDir, 'followings.json'), JSON.stringify(fixtures.followings));

    const { default: findFiles } = await import('../src/services/findFiles.js');
    const files = await findFiles(tempDir);

    expect(files).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: 'followers', path: expect.stringContaining('followers.json') }),
        expect.objectContaining({ type: 'followings', path: expect.stringContaining('followings.json') }),
      ]),
    );
  });
});
