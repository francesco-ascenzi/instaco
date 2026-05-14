import z from 'zod';

// Zod schemas
export const ConfigSchema = z.object({
  DB_FILE_PATH: z.string().min(1).default('./db/sql.db'),
  MAX_BATCH_SIZE: z.coerce.number().int().positive().default(500),
  INPUT_PATH: z.string().min(1).default('data'),
  OUTPUT_PATH: z.string().min(1).default('data/list'),
});

export const FollowersFileStruct = z.object({
  string_list_data: z
    .array(
      z.object({
        value: z.string().min(1),
        timestamp: z.int(),
      }),
    )
    .min(1),
});

export const FollowingsFileStruct = z.object({
  title: z.string().min(1),
  string_list_data: z
    .array(
      z.object({
        timestamp: z.int(),
      }),
    )
    .min(1),
});

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
