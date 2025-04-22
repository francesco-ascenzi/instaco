// Interfaces
export interface settings {
  connection: {
    uri: string,
    db: string,
    collection: string
  },
  files: {
    batchSize: number,
    inputFiles: string,
    outputList: string
  }
};

// Types
export type extStdResponse<T> = {
  ok: true,
  msg: string,
  value: T
} | {
  ok: false,
  msg: string;
};

export type minStdResponse = {
  ok: true
} | {
  ok: false,
  msg: string
};

export type objKeyString = {
  [key: string]: any;
};

export type stdResponse<T> = {
  ok: true,
  value: T
} | {
  ok: false,
  msg: string;
};