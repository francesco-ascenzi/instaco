import fs from 'node:fs';
import { chain } from 'stream-chain';
import { parser } from 'stream-json';
import streamArray from 'stream-json/streamers/stream-array.js';

import { FollowersFileStruct, type ParsedData } from '../types/index.js';

/** Followers parser
 *
 * @param filePath - Followers file path
 */
export async function* parseFollowers(filePath: string): AsyncGenerator<ParsedData, void, unknown> {
  const pipeline = chain([
    fs.createReadStream(filePath, { encoding: 'utf8' }),
    parser(),
    streamArray(),
  ]);

  for await (const { value } of pipeline) {
    const parsed = FollowersFileStruct.safeParse(value);
    if (!parsed.success) continue;

    const item = parsed.data.string_list_data[0];
    if (!item) continue;

    yield {
      timestamp: item.timestamp,
      username: item.value,
    };
  }
}
