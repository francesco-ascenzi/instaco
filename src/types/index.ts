export interface ParsedData {
  username: any;
  timestamp: any;
};

export type FileType = {
  path: string;
  type: 'followers' | 'followings';
};