/** ======================================================
 * INSTACO
 * 
 * A tool to compare Instagram's followers/followings 
 * and track them over time with Node and MongoDB
 * 
 * @author Frash | Francesco Ascenzi
 * @license Apache 2.0 
======================================================= */
import start from './services/main.js';

import { logError } from './utils/prompt.js';

process.on('uncaughtException', (err) => {
  logError(err);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logError(reason);
  process.exit(1);
});

process.on('SIGINT', (signal) => {
  logError(signal);
  process.exit(0);
});

start();
