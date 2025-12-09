import fs from "fs/promises";
import path from "path";
import Vdck from "vdck";

import { logError } from "../lib/prompt.js";

import { Settings } from "../types/index.js";

const vdck = new Vdck(false);

/** Parse settings from the settings file
 * 
 * @returns Response object containing the parsed settings or an error message
 */
export async function parseSettings(settings: Settings): Promise<void> {
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
      logError("Invalid settings file structure");
      return;
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
  } catch (err: unknown) {
    logError(`While parsing settings file... ${String(err)}`);
  }
}