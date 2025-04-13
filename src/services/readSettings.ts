import fs from "fs";
import path from "path";
import vdck from "vdck";

import { settings, extStdResponse } from "../types/index.js";
import { readFile } from "../lib/utilities.js";

// Constants and variables
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

const valid: vdck = new vdck(false);

/** Parse settings from the file
 * 
 * @returns {Promise<settings | null>}
 */
export default async function readSettings(dirPath: string): Promise<extStdResponse<settings>> {

  const fileContent: string = await readFile(path.join(dirPath, "settings.json"));
  let parsedSettings: settings;

  try {
    const tryToParse: settings = await JSON.parse(fileContent);
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
      throw new Error("Invalid settings file");
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