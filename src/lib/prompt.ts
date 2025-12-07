import chalk from "chalk";
import readline from "readline";

/** Delete the current line in the console
 * 
 * @returns void
 */
export function deleteLine(): void {
  process.stdout.write('\x1b[0G');
  process.stdout.write("\x1b[K");
}

/** Get user input from the console
 * 
 * @param question - The question to ask the user
 * @param bytes - The number of bytes to read from the input
 * @returns The user's input as a string
*/
export function getUserInput(question: string, bytes: number): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((res: (value: string | PromiseLike<string>) => void, rej: (reason?: any) => void) => {
    rl.question(`${question} | `, (answer: string) => {
      rl.close();
      res(answer.trim().substring(0, bytes));
    });
  });
}

/** Intro animation
 * 
 * @returns A promise that resolves when the animation is complete
*/
export async function intro(): Promise<void> {
  process.stdout.write("\x1Bc");
  process.stdout.write(
    " _         _               \n" +
    "|_|___ ___| |_ ___ ___ ___\n" +
    "| |   |_ -|  _| .\"|  _| . |\n" +
    "|_|_|_|___|_| |__,|___|___|\n" +
    chalk.grey("|_|_|_|___|_| |__,|___|___|")
  );

  await new Promise(resolve => setTimeout(resolve, 400));

  process.stdout.write("\n\n\n" +
    "Instaco is a tool for tracking your Instagram followers/followings" + "\n" +
    chalk.grey("@author: Francesco 'Frash' Ascenzi") + "\n\n" +
    "Find out more projects on" + "\n" +
    chalk.grey("https://www.github.com/francesco-ascenzi") + "\n\n" +
    "__________________________" + "\n\n"
  );

  await new Promise(resolve => setTimeout(resolve, 500));
}

/** Log an error message to the console
 * 
 * @returns void
*/
export function logError(...message: string[]): void {
  console.error(chalk.red(`> Error:`), ...message);
}

/** Log an info message to the console
 * 
 * @returns void
*/
export function logInfo(...message: string[]): void {
  console.info(">", ...message);
}