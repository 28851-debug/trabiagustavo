import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { fileURLToPath } from "node:url";

import * as schema from "../../backend/src/database/schema.js";

const migrationsFolder = fileURLToPath(
  new URL("../../backend/src/database/migrations", import.meta.url),
);

export async function createTestDb() {
  const client = new PGlite();
  const db = drizzle(client, { schema });

  await migrate(db, { migrationsFolder });

  return {
    db,
    client,
    async reset() {
      await client.exec(`
        TRUNCATE TABLE
          repair_parts,
          inventory_movements,
          repair_orders,
          customers,
          products,
          suppliers,
          categories
        RESTART IDENTITY CASCADE
      `);
    },
    async close() {
      await client.close();
    },
  };
}
