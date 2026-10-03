import { fileURLToPath } from "node:url";

import { migrate } from "drizzle-orm/postgres-js/migrator";

import { createProductionDb } from "./client.js";

const migrationsFolder = fileURLToPath(new URL("./migrations", import.meta.url));

export async function runMigrations(db) {
  await migrate(db, { migrationsFolder });
}

async function main() {
  const { db, client } = createProductionDb();

  try {
    await runMigrations(db);
  } finally {
    await client.end();
  }
}

if (process.argv[1] && import.meta.url === new URL(`file:///${process.argv[1].replaceAll("\\", "/")}`).href) {
  await main();
}
