import fs from 'node:fs/promises';
import os from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

let originalCwd = process.cwd();

describe('parser/configs.ts', () => {
  beforeEach(() => {
    vi.resetModules();
    originalCwd = process.cwd();
  });

  afterEach(() => {
    process.chdir(originalCwd);
  });

  test('parseConfigs loads settings.json and sets environment variables', async () => {
    const tempDir = await fs.mkdtemp(join(os.tmpdir(), 'instaco-configs-'));
    const settingsPath = join(tempDir, 'settings.json');
    await fs.writeFile(
      settingsPath,
      JSON.stringify({
        db: { path: './database.db' },
        globals: { inputPath: './data', outputPath: './data/list', maxBatchSize: 100, debug: true },
      }),
      'utf8',
    );

    process.chdir(tempDir);
    const { parseConfigs } = await import('../../src/parser/configs.js');

    const configs = await parseConfigs();

    expect(configs.db.path).toBe('./database.db');
    expect(configs.globals.debug).toBe(true);
    expect(process.env.DB_PATH).toBe('./database.db');
    expect(process.env.DEBUG).toBe('true');
  });
});
