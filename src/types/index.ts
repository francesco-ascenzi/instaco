import z from 'zod';

import type { ConfigSchema } from '../config/env.js';

// Interfaces
export interface ParsedData {
  timestamp: any;
  username: any;
}

// Types
export type ConfigType = z.infer<typeof ConfigSchema>;

export type FileType = {
  name: string;
  path: string;
  type: 'followers' | 'followings';
};
