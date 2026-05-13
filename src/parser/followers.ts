import fs from "fs";
import { chain } from "stream-chain";
import { parser } from "stream-json";
import streamArray from "stream-json/streamers/stream-array.js";

import { ParsedData } from "../types/index.js";

/** Followers parser
 * 
 * @param filePath - Followers file path
 */
export async function* parseFollowers(filePath: string): AsyncGenerator<ParsedData, void, unknown> {
  const pipeline = chain([
    fs.createReadStream(filePath, { encoding: "utf8" }),
    parser(),
    streamArray()
  ]);

  for await (const { value } of pipeline) {
    const item = value?.string_list_data?.[0];
    if (!item) continue;

    yield {
      username: item.value ?? null,
      timestamp: item.timestamp ?? null
    };
  }
}