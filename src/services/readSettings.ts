/** ===============================================================================================
 * @author Frash | Francesco Ascenzi
 * @fund https://www.paypal.com/donate/?hosted_button_id=QL4PRUX9K9Y6A
 * @license Apache 2.0 
================================================================================================ */
import path from "path";
import vdck from "vdck";

import { settings, extStdResponse, stdResponse } from "../types/index.js";
import { readFile } from "../lib/utilities.js";

// Constants and variables
const valid: vdck = new vdck(false);
const stdSettings: string = `{
  "connection": {
    "uri": "mongodb://127.0.0.1:27018/",
    "db": "instagram",
    "collection": "trackFollowers"
  },
  "files": {
    "batchSize": 5000
    "inputFiles": "data",
    "outputList": "data/list"
  }
}`;

/** Parse settings from the file
 * 
 * @returns {extStdResponse<settings>} - Response object containing the parsed settings or an error message
 */
export default async function readSettings(dirPath: string): Promise<extStdResponse<settings>> {

  // Check if the settings file exists and read it
  const fileContent: stdResponse<string> = await readFile(path.join(dirPath, "settings.json"));
  if (!fileContent.ok) {
    return {
      ok: false,
      msg: fileContent.msg
    };
  }

  let parsedSettings: settings;
  try {
    const tryToParse: settings = await JSON.parse(fileContent.value);
    if (!valid.sameObjects(tryToParse, {
      connection: {
        uri: "string",
        db: "string",
        collection: "string"
      },
      files: {
        batchSize: "number",
        inputFiles: "string",
        outputList: "string"
      }
    })) {
      throw new Error("Invalid settings file keys/values");
    }

    parsedSettings = tryToParse;
  } catch (err: unknown) {
    return {
      ok: true,
      msg: "Invalid settings file, using default settings",
      value: JSON.parse(stdSettings)
    };
  }

  // Normalize the settings
  parsedSettings.files.inputFiles = path.join(parsedSettings.files.inputFiles);
  parsedSettings.files.outputList = path.join(parsedSettings.files.outputList);

  return {
    ok: true,
    msg: "Settings file parsed successfully",
    value: parsedSettings
  };
}