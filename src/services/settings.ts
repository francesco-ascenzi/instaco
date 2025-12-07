import fs from "fs/promises";
import path from "path";
import Vdck from "vdck";

import { logError } from "../lib/prompt.js";

import { StdResponse, Settings } from "../types/index.js";

const vdck = new Vdck(false);

/** Parse settings from the settings file
 * 
 * @returns Response object containing the parsed settings or an error message
 */
export async function parseSettings(settings: Settings): Promise<boolean> {
  try {
    const fileContent = await fs.readFile("./settings.json", "utf8");

    const parsedContent: Record<string, number | string> = await JSON.parse(fileContent);
    if (!vdck.sameObjects(parsedContent, {
      connection: {
        uri: "string",
        db: "string",
        collection: "string"
      },
      maxFileBatchSize: "number",
      inputFilesPath: "string",
      outputListPath: "string",
      skipSettings: "boolean"
    })) {
      logError("invalid settings file structure, using default settings");
      return false;
    }

    Object.assign(settings, {
      connection: {
        uri: parsedContent.connection.uri,
        db: parsedContent.connection.db,
        collection: parsedContent.connection.collection
      },
      maxFileBatchSize: parsedContent.maxFileBatchSize,
      inputFilesPath: path.normalize(parsedContent.inputFilesPath),
      outputListPath: path.normalize(parsedContent.outputListPath),
      skipSettings: parsedContent.skipSettings
    });

    return true;
  } catch (err: unknown) {
    logError(`while parsing settings file... ${String(err)}`);
    return false;
  }
}