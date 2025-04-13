/** =============================================================================================== */
/** 
 * @author Frash | Francesco Ascenzi
 * @fund https://www.paypal.com/donate/?hosted_button_id=QL4PRUX9K9Y6A
 * @license Apache 2.0
 */ 
/** =============================================================================================== */
import fs from "fs";

/** 
 * @class Prompt
 * 
 * This class is responsible for handling user input and displaying messages to the console.
 * It provides methods for getting user input, displaying an introductory animation, and managing messages.
 * 
 * @property {string} subTitle - The subtitle displayed in the console
 * @property {string} messages - The messages to be displayed in the console
 * 
 * @method getUserInput: string - Reads user input from the console
 * @method intro: Promise<void> - Displays an introductory animation in the console
 */
export default class Prompt {
  protected errorLine: string = '\x1b[31m> Error:\x1b[0m';

  /** Delete the last line in the console
   * 
   * @returns {void}
   */
  deleteLine(): void {
    process.stdout.write('\x1b[0G');
    process.stdout.write("\x1b[K");
  }

  /** Display an error message in the console
   * 
   * @param {string} message - The error message to display
   * @returns {void} - No return value
   */
  error(message: string): void {
    process.stdout.write(`${this.errorLine} ${message}\n`);
  }

  /** Get user input from the console
   * @param {string} question - The question to ask the user
   * @param {number} bytes - The number of bytes to read from the input
   * @returns {string} - The user's input as a string.
   */
  getUserInput(question: string, bytes: number): string {
    // Write the question
    process.stdout.write(question);
    const buffer: Buffer = Buffer.alloc(bytes);

    for (let i = 0; i < 10; i++) {
      const element = array[i];
      
    }
    try {
      // Write the question
      process.stdout.write(question);
      const buffer: Buffer = Buffer.alloc(bytes);
  
      // Read the user's input synchronously and store it within the buffer
      process.stdin.setEncoding("utf8"); // @ts-ignore
      const bytesRead = fs.readSync(process.stdin.fd, buffer, 0, bytes, null);

      return buffer.toString("utf8", 0, bytesRead).trim();
    } catch (err: unknown) {
      if (err && typeof err == 'object' && ('code' in err) && err.code === 'EAGAIN') {
        process.stdin.setEncoding('utf8');
        fs.readSync(process.stdin.fd, buffer, 0, bytes, null);
        bytesRead = fs.readSync(process.stdin.fd, buffer, 0, bytes, null);
      } else {
        // Cast error and return it
        return new Error(String(err));
      }
      return "";
    }
  }

  /** Display a message to the user
   * 
   * @param {string} message - An info message to display to the user
   * @param {boolean} deleteAtTheEnd - Delete the info message at the end
   * @returns {void} - No return value
   */
  info(message: string, deleteAtTheEnd: boolean = false): void {
    process.stdout.write(message + (deleteAtTheEnd ? "" : "\n"));
  }

  /** Introductory animation
   * 
   * @returns {Promise<void>} - A promise that resolves when the animation is complete
   */
  async intro(): Promise<void> {
    process.stdout.write("\x1Bc");
    process.stdout.write(
      " _         _               \n" + 
      "|_|___ ___| |_ ___ ___ ___\n" +  
      "| |   |_ -|  _| .\"|  _| . |\n" + 
      "|_|_|_|___|_| |__,|___|___|\n" + 
      "\x1b[30m|_|_|_|___|_| |__,|___|___|\x1b[0m\n\n" + 
      "---------------------------\n\n" + 
      "Instaco is a tool for tracking your Instagram followers/followings\n\n" + 
      "If you liked it, please consider to donating at:\n"
    );

    for (let i = 0; i < 6; i++) {
      await new Promise(resolve => setTimeout(resolve, 500));
      this.deleteLine();
      process.stdout.write(i % 2 ? 
        "\x1b[4mhttps://www.paypal.com/donate/?hosted_button_id=QL4PRUX9K9Y6A\x1b[0m" : 
        "\x1b[30m\x1b[4mhttps://www.paypal.com/donate/?hosted_button_id=QL4PRUX9K9Y6A\x1b[0m"
      );
    }

    this.deleteLine();
    process.stdout.write(`\x1b[4mhttps://www.paypal.com/donate/?hosted_button_id=QL4PRUX9K9Y6A\x1b[0m\n\n`);
    await new Promise(resolve => setTimeout(resolve, 250));
    process.stdout.write("\x1b[30m@author: Francesco 'Frash' Ascenzi " + "| \x1b[4mhttps://www.github.com/francesco-ascenzi\x1b[0m\n\n");
    await new Promise(resolve => setTimeout(resolve, 250));
    process.stdout.write("---------------------------\n\n");
  }
}