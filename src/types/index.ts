import z from 'zod';

// Zod schemas
export const ConfigSchema = z
  .object({
    db: z.object({
      path: z.string('db.path must be a string').min(1, 'db.path must be a non-empty string'),
    }),
    globals: z.object({
      inputPath: z
        .string('globals.inputPath must be a string')
        .min(1, 'globals.inputPath must be a non-empty string')
        .default('data'),
      outputPath: z
        .string('globals.outputPath must be a string')
        .min(1, 'globals.outputPath must be a non-empty string')
        .default('data/list'),
      maxBatchSize: z
        .number('globals.maxBatchSize must be a number')
        .int('globals.maxBatchSize must be an integer')
        .min(10, 'globals.maxBatchSize must be >= 10')
        .max(50000, 'globals.maxBatchSize must be <= 50000')
        .default(500),
      debug: z.boolean('globals.debug must be a boolean').default(false),
    }),
  })
  .default({
    db: {
      path: './db/sqlite.db',
    },
    globals: {
      inputPath: './data',
      outputPath: './data/lists',
      maxBatchSize: 500,
      debug: false,
    },
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

// Enums
export enum GenerateFileType {
  PREV_FOLLOWERS = 'followers',
  WHO_UNFOLLOWED_ME = 'followings',
}

export enum TableName {
  FOLLOWERS = 'followers',
  FOLLOWINGS = 'followings',
  NEW_FOLLOWERS = 'new_followers',
}

// Interfaces
export interface ParsedData {
  timestamp: any;
  username: any;
}

export interface TableData {
  username: string;
  ig_from: number;
  created_at: number;
  updated_at: number;
}

// Types
export type ConfigType = z.infer<typeof ConfigSchema>;

export type ExportMap = {
  query: string;
  formatter: (record: any) => string;
};

export type FileType = {
  name: string;
  path: string;
  type: TableName;
};
