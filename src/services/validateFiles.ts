import { logError } from '../utils/prompt.js';

import type { FileType } from '../types/index.js';

export function validateFiles(files: FileType[]): boolean {
  const hasFollowers = files.some((f) => f.type === 'followers');
  if (!hasFollowers) {
    logError('missing followers file.');
    return false;
  }

  const hasFollowings = files.some((f) => f.type === 'followings');
  if (!hasFollowings) {
    logError('Missing followings file.');
    return false;
  }

  return true;
}
