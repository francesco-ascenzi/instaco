/** ===============================================================================================
 * @author Frash | Francesco Ascenzi
 * @fund https://www.paypal.com/donate/?hosted_button_id=QL4PRUX9K9Y6A
 * @license Apache 2.0
================================================================================================ */
import readline from "readline";
/**
 * @class Prompt
 *
 * This class is responsible for handling user input and displaying messages to the console.
 * It provides methods for getting user input, displaying an introductory animation, and managing messages.
 *
 * @property {string} errorLine - The error line prefix for console messages
 */
export default class Prompt {
    errorLine = '\x1b[31m> Error:\x1b[0m';
    /** Delete the last line in the console
     *
     * @returns {void}
     */
    deleteLine() {
        process.stdout.write('\x1b[0G');
        process.stdout.write("\x1b[K");
    }
    /** Display an error message in the console
     *
     * @param {string} message - The error message to display
     * @returns {void} - No return value
     */
    error(message) {
        process.stdout.write(`${this.errorLine} ${message}\n`);
    }
    /** Get user input from the console
     * @param {string} question - The question to ask the user
     * @param {number} bytes - The number of bytes to read from the input
     * @returns {string} - The user's input as a string
     */
    getUserInput(question, bytes) {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        return new Promise((res, rej) => {
            rl.question(question, (answer) => {
                rl.close();
                res(answer.trim().substring(0, bytes));
            });
        });
    }
    /** Display an info message to the user
     *
     * @param {string} message - An info message to display to the user
     * @param {boolean} deleteAtTheEnd - Delete the info message at the end
     * @returns {void} - No return value
     */
    info(message, deleteAtTheEnd = false) {
        process.stdout.write(message + (deleteAtTheEnd ? "" : "\n"));
    }
    /** Introductory animation
     *
     * @returns {Promise<void>} - A promise that resolves when the animation is complete
     */
    async intro() {
        process.stdout.write("\x1Bc");
        process.stdout.write(" _         _               \n" +
            "|_|___ ___| |_ ___ ___ ___\n" +
            "| |   |_ -|  _| .\"|  _| . |\n" +
            "|_|_|_|___|_| |__,|___|___|\n" +
            "\x1b[30m|_|_|_|___|_| |__,|___|___|\x1b[0m\n\n" +
            "---------------------------\n\n" +
            "Instaco is a tool for tracking your Instagram followers/followings\n\n" +
            "If you liked it, please consider to donating at:\n");
        for (let i = 0; i < 6; i++) {
            await new Promise(resolve => setTimeout(resolve, 250));
            this.deleteLine();
            process.stdout.write(i % 2 ?
                "\x1b[4mhttps://www.paypal.com/donate/?hosted_button_id=QL4PRUX9K9Y6A\x1b[0m" :
                "\x1b[30m\x1b[4mhttps://www.paypal.com/donate/?hosted_button_id=QL4PRUX9K9Y6A\x1b[0m");
        }
        this.deleteLine();
        process.stdout.write(`\x1b[4mhttps://www.paypal.com/donate/?hosted_button_id=QL4PRUX9K9Y6A\x1b[0m\n\n`);
        await new Promise(resolve => setTimeout(resolve, 250));
        process.stdout.write("\x1b[30m@author: Francesco 'Frash' Ascenzi " + "| \x1b[4mhttps://www.github.com/francesco-ascenzi\x1b[0m\n\n");
        await new Promise(resolve => setTimeout(resolve, 250));
        process.stdout.write("---------------------------\n\n");
    }
}
