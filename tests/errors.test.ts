import { describe, expect, test, vi } from 'vitest';

describe('errors/errorsHandler', () => {
  test('logs AppError via logError', async () => {
    const prompt = await import('../src/utils/prompt.js');
    const spy = vi.spyOn(prompt, 'logError');

    const { AppError, errorsHandler } = await import('../src/errors/errors.js');

    const err = new AppError('something broke', 'myFn');
    errorsHandler(err);

    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  test('logs regular Error to console.error', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { errorsHandler } = await import('../src/errors/errors.js');

    errorsHandler(new Error('regular error'));

    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  test('logs primitive errors to console.error', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { errorsHandler } = await import('../src/errors/errors.js');

    errorsHandler('plain string error');

    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
