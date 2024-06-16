import fs from 'fs';

/** Read user's input and return it
 * 
 * @param {string} question Question to ask
 * @return {string} User's input
 * 
 * @author Frash | Francesco Ascenzi
 */
export default function prompt(question: string, bytes: number): string | Error {

  // Write the question
  process.stdout.write(question);
  const buffer: Buffer = Buffer.alloc(bytes);
  let bytesRead: number = 0;

  // Read sync user's input and store it within the buffer
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

  // Convert buffer to string and trim new line characters
  const input: string = buffer.toString('utf8', 0, bytesRead).trim();
  return input;
}