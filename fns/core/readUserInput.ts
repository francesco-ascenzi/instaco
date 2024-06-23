import fs from 'fs';

/** Read the user's input and return it
 * 
 * @param {string} question - Question to ask
 * @param {string} bytes - How many bytes to store the user's input
 * @return {string}
 * 
 * @author Frash | Francesco Ascenzi
 * @fund https://www.paypal.com/donate/?hosted_button_id=QL4PRUX9K9Y6A
 * @license Apache 2.0
 */
export default function prompt(question: string, bytes: number): string | Error {

  // Write the question
  process.stdout.write(question);
  const buffer: Buffer = Buffer.alloc(bytes);
  let bytesRead: number = 0;

  // Read the user's input synchronously and store it in the buffer
  try {
    bytesRead = fs.readSync(process.stdin.fd, buffer, 0, bytes, null);
  } catch (err: unknown) {
    if (err && typeof err == 'object' && ('code' in err) && err.code === 'EAGAIN') {
      process.stdin.setEncoding('utf8');
      fs.readSync(process.stdin.fd, buffer, 0, bytes, null);
      bytesRead = fs.readSync(process.stdin.fd, buffer, 0, bytes, null);
    } else {
      // Cast error and return it
      return new Error(String(err));
    }
  }

  // Convert the buffer to a string and trim newline characters
  return buffer.toString('utf8', 0, bytesRead).trim();
}