import { describe, expect, test, vi } from 'vitest';

describe('utils/date.ts', () => {
  test('getStringDate returns a zero-padded formatted timestamp', async () => {
    const OriginalDate = Date;
    const fixedDate = new Date(2024, 0, 2, 3, 4, 5);

    vi.stubGlobal(
      'Date',
      class extends Date {
        constructor(...args: unknown[]) {
          if (args.length === 0) {
            super(fixedDate);
          } else {
            super(...(args as [number, number, number, number, number, number]));
          }
        }

        static now() {
          return fixedDate.getTime();
        }
      } as unknown as typeof Date,
    );

    const { getStringDate } = await import('../../src/utils/date.js');
    expect(getStringDate()).toBe('01022024_030405');

    vi.stubGlobal('Date', OriginalDate as unknown as typeof Date);
  });
});
