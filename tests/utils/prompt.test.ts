import { describe, expect, test, vi } from 'vitest';

describe('utils/prompt.ts', () => {
  test('deleteLine writes ANSI escape codes to stdout', async () => {
    const { deleteLine } = await import('../../src/utils/prompt.js');
    const spy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true as any);

    deleteLine();

    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy).toHaveBeenCalledWith('\x1b[0G');
    expect(spy).toHaveBeenCalledWith('\x1b[K');

    spy.mockRestore();
  });

  test('logError forwards messages to console.error', async () => {
    const { logError } = await import('../../src/utils/prompt.js');
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    logError('test error', { code: 123 });

    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  test('printConfig logs the configuration object', async () => {
    const { printConfig } = await import('../../src/utils/prompt.js');
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});

    printConfig({
      db: { path: 'database.db' },
      globals: { inputPath: './data', outputPath: './data/list', maxBatchSize: 100, debug: false },
    });

    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  test('intro writes the application banner and waits for the animation to complete', async () => {
    vi.useFakeTimers();

    const stdoutSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true as any);
    const { intro } = await import('../../src/utils/prompt.js');

    const promise = intro();
    await vi.runAllTimersAsync();
    await promise;

    expect(stdoutSpy).toHaveBeenCalled();
    expect(
      stdoutSpy.mock.calls.some((args) =>
        args[0]
          .toString()
          .includes('Instaco is a tool for tracking your Instagram followers/followings'),
      ),
    ).toBe(true);

    stdoutSpy.mockRestore();
    vi.useRealTimers();
  });
});
