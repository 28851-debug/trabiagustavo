import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { afterEach, describe, expect, it } from "vitest";
import * as schema from "../../backend/src/database/schema.js";

const migrationsFolder = fileURLToPath(new URL("../../backend/src/database/migrations", import.meta.url));
let directory;
afterEach(async () => { if (directory) await rm(directory, { recursive: true, force: true }); });

describe("database persistence", () => {
  it("keeps records after the embedded database is closed and reopened", async () => {
    directory = await mkdtemp(join(tmpdir(), "trabiagustavo-persistence-"));
    let client = new PGlite(directory), db = drizzle(client, { schema });
    await migrate(db, { migrationsFolder });
    await db.insert(schema.categories).values({ name: "Persistente" });
    await client.close();

    client = new PGlite(directory); db = drizzle(client, { schema });
    expect(await db.select().from(schema.categories)).toEqual([expect.objectContaining({ name: "Persistente" })]);
    await client.close();
  }, 15_000);
});
