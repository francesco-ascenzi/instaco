import { ConfigType } from "../config/env.js";
import { run } from "../db/query.js";
import { transaction } from "../db/transactions.js";
import { parseFollowers } from "../parser/followers.js";
import { parseFollowings } from "../parser/followings.js";

export async function importer(config: ConfigType, file: string, type: "followers" | "followings") {
  const now = Date.now();
  const batch: any[] = [];

  const parser = type === "followers" ? parseFollowers : parseFollowings;

  for await (const user of parser(file)) {
    batch.push(user);

    if (batch.length >= config.MAX_BATCH_SIZE) {
      flush(batch, type, now);
      batch.length = 0;
    }
  }

  if (batch.length) {
    flush(batch, type, now);
  }
}

function flush(batch: any[], type: string, now: number) {
  const table = type;

  transaction(() => {
    for (const user of batch) {
      run(
        `
        INSERT INTO ${table} (username, ig_from, created_at, updated_at)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(username) DO UPDATE SET
          ig_from = excluded.ig_from,
          updated_at = excluded.updated_at
        `,
        [user.username, user.timestamp, now, now]
      );
    }
  });
}