import { describe, expect, test } from 'vitest';

describe('services/findFiles service', () => {
  test('findFiles detects followers and followings files from a directory', async () => {
    const { default: findFiles } = await import('../../src/services/findFiles.js');
    const files = await findFiles('./tests/fixtures');

    expect(files).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'followers',
          path: expect.stringContaining('followers.json'),
        }),
        expect.objectContaining({
          type: 'followings',
          path: expect.stringContaining('followings.json'),
        }),
      ]),
    );
  });

  test('findFiles detects multiple followers and followings files', async () => {
    const { default: findFiles } = await import('../../src/services/findFiles.js');

    const files = await findFiles('./tests/fixtures');

    const followersFiles = files.filter((file) => file.type === 'followers');
    const followingsFiles = files.filter((file) => file.type === 'followings');

    expect(followersFiles.length).toBeGreaterThan(1);
    expect(followingsFiles.length).toBeGreaterThan(0);

    expect(followersFiles).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: expect.stringContaining('followers'),
        }),
      ]),
    );

    expect(followingsFiles).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: expect.stringContaining('followings'),
        }),
      ]),
    );
  });

  test('findFiles detects only temporary followers file when no followings file exists', async () => {
    const { default: findFiles } = await import('../../src/services/findFiles.js');

    const files = await findFiles('./tests/fixtures/followers-only');

    const followersFiles = files.filter((file) => file.type === 'followers');
    const followingsFiles = files.filter((file) => file.type === 'followings');

    expect(followersFiles).toHaveLength(1);
    expect(followingsFiles).toHaveLength(0);

    expect(followersFiles[0]).toEqual(
      expect.objectContaining({
        path: expect.stringContaining('followers'),
      }),
    );
  });
});
