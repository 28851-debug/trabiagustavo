import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { getConfig } from "../config.js";
import * as schema from "./schema.js";

export function createProductionDb(env = process.env) {
  const config = getConfig(env);

  if (!config.databaseUrl) {
    throw new Error("DATABASE_URL is required.");
  }

  const client = postgres(config.databaseUrl, {
    max: 5,
    prepare: false,
  });

  return {
    client,
    db: drizzle(client, { schema }),
  };
}
