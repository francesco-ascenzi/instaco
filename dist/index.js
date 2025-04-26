import path from "path";
import prompt from './lib/classes/prompt.js';
import Connection from './lib/classes/connection.js';
import { createDir, getRoot } from './lib/utilities.js';
import readSettings from "./services/readSettings.js";
import storeData from "./services/storeData.js";
import compareLists from "./services/compareList.js";
import getFilesNames from "./services/getFilesNames.js";
// Constants and variables
const __dirname = import.meta.url;
const __rootdir = getRoot(__dirname);
const print = new prompt();
(async () => {
    while (true) {
        // Print the intro
        await print.intro();
        // Check if settings file exists and read it
        print.info(`> Parsing settings file...`, true);
        const getSettings = await readSettings(__rootdir);
        print.deleteLine();
        if (!getSettings.ok) {
            print.error(getSettings.msg);
            break;
        }
        print.info(`> ${getSettings.msg}`);
        // Check/create main i/o files folder
        print.info(`> Checking dir...`, true);
        const inputDir = await createDir(getSettings.value.files.inputFiles);
        if (!inputDir.ok) {
            print.error(inputDir.msg);
            break;
        }
        const outputDir = await createDir(getSettings.value.files.outputList);
        if (!outputDir.ok) {
            print.error(outputDir.msg);
            break;
        }
        print.deleteLine();
        print.info(`> Try to connect to \x1b[30m${getSettings.value.connection.uri}\x1b[0m`, true);
        // Handle connection and collections from MongoDB
        const mongo = new Connection(getSettings.value.connection.uri);
        print.deleteLine();
        if (mongo.mongoErrors.length > 0) {
            print.error(mongo.mongoErrors.join("\n"));
            break;
        }
        print.info(`> Connected to \x1b[30m${getSettings.value.connection.uri}\x1b[0m`);
        const collection = await mongo.useCollection(getSettings.value.connection.db, getSettings.value.connection.collection);
        if (typeof collection === "string") {
            print.error(collection);
            break;
        }
        print.info(`> Collection \x1b[30m${getSettings.value.connection.collection}\x1b[0m was found/created`);
        // Check conn errors
        if (mongo.mongoErrors.length > 0) {
            print.error(mongo.mongoErrors.join("\n"));
            break;
        }
        // Get files names within the main files folder
        print.info(`> Getting files names...`, true);
        const jsonFiles = await getFilesNames(getSettings.value.files.inputFiles);
        print.deleteLine();
        if (!jsonFiles.ok) {
            print.error(jsonFiles.msg);
            break;
        }
        if (jsonFiles.value.length != 2) {
            print.error(`Instaco ${jsonFiles.value.length > 0 ? "found only 1 (" + jsonFiles.value.join(', ') + ")" : "didn't find"} .json files in the ${getSettings.value.files.inputFiles} folder\n`);
            break;
        }
        print.info(`> Files found in ${getSettings.value.files.inputFiles} folder: \x1b[30m${jsonFiles.value.join(", ")}\x1b[0m`);
        const userInput = await print.getUserInput(`> Do you want to continue? (y/n) | `, 1);
        if (userInput.toLowerCase() !== "y") {
            print.error("Aborted by user");
            break;
        }
        console.time('> Completed in'); // Initialize timer
        // Clean 'followers'/'followings' collections
        const followers = await mongo.useCollection(getSettings.value.connection.db, "followers");
        if (typeof followers === "string") {
            print.error(followers);
            break;
        }
        const followings = await mongo.useCollection(getSettings.value.connection.db, "followings");
        if (typeof followings === "string") {
            print.error(followings);
            break;
        }
        // Delete all documents in the collections
        await followers.deleteMany({});
        await followings.deleteMany({});
        // Process each file
        for (let i = 0; i < 2; i++) {
            const filePath = path.join(getSettings.value.files.inputFiles, jsonFiles.value[i]);
            const processFileResponse = await storeData(mongo, getSettings.value.connection.db, filePath, getSettings.value.files.batchSize);
            if (!processFileResponse.ok) {
                print.error(processFileResponse.msg);
                break;
            }
            print.info(`> Processed \x1b[30m${filePath}\x1b[0m`);
        }
        // Generate .txt diff files
        print.info(`> Generating diff list`, true);
        const processDiff = await compareLists(mongo, getSettings.value);
        print.deleteLine();
        if (!processDiff.ok) {
            print.error(processDiff.msg);
            break;
        }
        print.info(`> \x1b[30m${getSettings.value.connection.collection}\x1b[0m collection was updated`);
        // Close db connection and prints end messages
        await mongo.close();
        print.info(`> MongoDB connection closed\x1b[32m\n`);
        console.timeEnd('> Completed in');
        print.info('\x1b[0m\n\x1b[30mIf you liked this tool, consider funding it at:\x1b[0m ' +
            'https://www.paypal.com/donate/?hosted_button_id=QL4PRUX9K9Y6A ' +
            '\x1b[30m(the link is within package.json too)\x1b[0m\n');
        const restartUserInput = await print.getUserInput(`> Do you want to restart the service? (y/n) | `, 1);
        if (restartUserInput.toLowerCase() !== "y") {
            print.info("Exiting...");
            process.exit(0);
        }
    }
})();
