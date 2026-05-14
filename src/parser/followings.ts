import fs from 'node:fs';
import { chain } from 'stream-chain';
import { parser } from 'stream-json';
import streamObject from 'stream-json/streamers/stream-object.js';

import { FollowingsFileStruct, type ParsedData } from '../types/index.js';

/** Followings parser
 *
 * @param filePath - Followings file path
 */
export async function* parseFollowings(
  filePath: string,
): AsyncGenerator<ParsedData, void, unknown> {
  const pipeline = chain([
    fs.createReadStream(filePath, { encoding: 'utf8' }),
    parser(),
    streamObject(),
  ]);

  for await (const { key, value } of pipeline) {
    if (key !== 'relationships_following') continue;

    for (const entry of value) {
      const parsed = FollowingsFileStruct.safeParse(entry);
      if (!parsed.success) continue;

      const data = entry.string_list_data[0];
      if (!data) continue;

      yield {
        timestamp: data.timestamp ?? null,
        username: entry.title ?? null,
      };
    }
  }
}
