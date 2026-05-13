/** Generates a formatted timestamp string based on the current date and time.
 *
 * The format returned is:
 * `MMDDYYYY_HHMMSS`
 *
 * @returns A formatted date-time string in `MMDDYYYY_HHMMSS` format
 */
export function getStringDate(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');

  const MM = pad(now.getMonth() + 1);
  const DD = pad(now.getDate());
  const YYYY = now.getFullYear();

  const HH = pad(now.getHours());
  const mm = pad(now.getMinutes());
  const ss = pad(now.getSeconds());

  return `${MM}${DD}${YYYY}_${HH}${mm}${ss}`;
}
