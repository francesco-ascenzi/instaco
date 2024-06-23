// Constants and variables
const subTitle = '---------------------------\n\n' + 
  'Instaco is a tool for tracking your Instagram followers/followings\n' + 
  `\x1b[30m@author: Frash | Francesco Ascenzi\x1b[0m\n\n` + 
  '---------------------------\n';

/** Prints out the welcome message
 * 
 * @return {Promise<void>}
 * 
 * @author Frash | Francesco Ascenzi
 * @fund https://www.paypal.com/donate/?hosted_button_id=QL4PRUX9K9Y6A
 * @license Apache 2.0
 */
export default async function welcomeMessage(): Promise<void> {

  await new Promise(resolve => setTimeout(resolve, 150));
  process.stdout.write('\x1Bc');
  console.info(
    ' _ \n' + 
    '|_|\n' +  
    '| |\n' + 
    '|_|\n' + 
    '\x1b[30m|_|\x1b[0m\n\n' + 
    subTitle
  );

  await new Promise(resolve => setTimeout(resolve, 150));
  process.stdout.write('\x1Bc');
  console.info(
    ' _     \n' + 
    '|_|___ \n' +  
    '| |   |\n' + 
    '|_|_|_|\n' + 
    '\x1b[30m|_|_|_|\x1b[0m\n\n' + 
    subTitle
  );

  await new Promise(resolve => setTimeout(resolve, 150));
  process.stdout.write('\x1Bc');
  console.info(
    ' _        \n' + 
    '|_|___ ___\n' +  
    '| |   |_ -|\n' + 
    '|_|_|_|___|\n' + 
    '\x1b[30m|_|_|_|___|\x1b[0m\n\n' + 
    subTitle
  );

  await new Promise(resolve => setTimeout(resolve, 150));
  process.stdout.write('\x1Bc');
  console.info(
    ' _         _   \n' + 
    '|_|___ ___| |_ \n' +  
    '| |   |_ -|  _|\n' + 
    '|_|_|_|___|_| \n' + 
    '\x1b[30m|_|_|_|___|_| \x1b[0m\n\n' + 
    subTitle
  );

  await new Promise(resolve => setTimeout(resolve, 150));
  process.stdout.write('\x1Bc');
  console.info(
    ' _         _       \n' + 
    '|_|___ ___| |_ ___ \n' +  
    '| |   |_ -|  _| .\'|\n' + 
    '|_|_|_|___|_| |__,|\n' + 
    '\x1b[30m|_|_|_|___|_| |__,|\x1b[0m\n\n' + 
    subTitle
  );

  await new Promise(resolve => setTimeout(resolve, 150));
  process.stdout.write('\x1Bc');
  console.info(
    ' _         _           \n' + 
    '|_|___ ___| |_ ___ ___ \n' +  
    '| |   |_ -|  _| .\'|  _|\n' + 
    '|_|_|_|___|_| |__,|___|\n' + 
    '\x1b[30m|_|_|_|___|_| |__,|___|\x1b[0m\n\n' + 
    subTitle
  );

  await new Promise(resolve => setTimeout(resolve, 150));
  process.stdout.write('\x1Bc');
  console.info(
    ' _         _               \n' + 
    '|_|___ ___| |_ ___ ___ ___\n' +  
    '| |   |_ -|  _| .\'|  _| . |\n' + 
    '|_|_|_|___|_| |__,|___|___|\n' + 
    '\x1b[30m|_|_|_|___|_| |__,|___|___|\x1b[0m\n\n' + 
    subTitle
  );
}