/** ======================================================
 * INSTACO
 * 
 * A tool to compare Instagram's followers/followings 
 * and track them over time with Node and MongoDB
 * 
 * @author Francesco Ascenzi
 * @license Apache 2.0 
======================================================= */
import { errorsHandler } from './errors/errors.js';
import start from './services/main.js';

process.on('uncaughtException', (err) => {
  errorsHandler(err);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  errorsHandler(reason);
  process.exit(1);
});

process.on('SIGINT', (signal) => {
  errorsHandler(signal);
  process.exit(0);
});

await start();
