import { logError } from '../utils/prompt.js';

/** Custom application error that extends the native `Error` object.
 *
 * Adds contextual information about the function or module where the error originated.
 */
export class AppError extends Error {
  public readonly mainFn: string;

  /** Creates a new AppError instance
   *
   * @param message - The error message describing what went wrong
   * @param mainFn - The name of the function or context where the error originated
   */
  constructor(message: string, mainFn: string = '') {
    super(message);

    this.name = 'AppError';
    this.mainFn = mainFn;

    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/** Global error handler that normalizes and logs all thrown errors
 *
 * @param err - The thrown error of unknown type
 */
export function errorsHandler(err: unknown): void {
  if (process.env.debug === 'true') {
    console.error(err);
  }

  if (err instanceof AppError) {
    logError(`${err.message} | ${err.mainFn}`);
    return;
  }

  if (err instanceof Error) {
    logError(String(err.message));
    return;
  }

  console.error(err);
}
