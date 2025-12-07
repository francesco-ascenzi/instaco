import { Db } from "mongodb";

// Interfaces
export interface Settings {
  connection: {
    uri: string,
    db: string,
    collection: string
  },
  maxFileBatchSize: number,
  inputFilesPath: string,
  outputListPath: string,
  skipSettings: boolean
};

// Types
export type StdResponse<T> = {
  ok: true,
  value: T
} | {
  ok: false,
  msg: string
};

export type OpenConnectionResponse = {
  ok: true,
  db: Db
} | {
  ok: false,
  msg: string
};