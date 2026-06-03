CREATE TABLE IF NOT EXISTS followers (
  username TEXT PRIMARY KEY,
  ig_from INTEGER NOT NULL,

  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS new_followers (
  username TEXT PRIMARY KEY,
  ig_from INTEGER NOT NULL,

  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS followings (
  username TEXT PRIMARY KEY,
  ig_from INTEGER NOT NULL,

  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);