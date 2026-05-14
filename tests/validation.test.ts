import { beforeEach, describe, expect, test, vi } from 'vitest';

function resetEnv() {
  process.env.DB_FILE_PATH = ':memory:';
  process.env.MAX_BATCH_SIZE = '20';
  process.env.INPUT_PATH = 'data';
  process.env.OUTPUT_PATH = 'data/list';
}

describe('utils/validation', () => {
  beforeEach(() => {
    vi.resetModules();
    resetEnv();
  });

  test('loadConfig load values from environment variables', async () => {
    const { loadConfig } = await import('../src/utils/validation.js');
    const config = loadConfig();

    expect(config).toEqual({
      DB_FILE_PATH: ':memory:',
      MAX_BATCH_SIZE: 20,
      INPUT_PATH: 'data',
      OUTPUT_PATH: 'data/list',
    });
  });

  test('loadConfig falls back to defaults when env values are invalid', async () => {
    process.env.MAX_BATCH_SIZE = '0';
    const { loadConfig } = await import('../src/utils/validation.js');
    const config = loadConfig();

    expect(config.MAX_BATCH_SIZE).toBe(500);
  });
});
