import { resolve } from "node:path";
import { createApp } from "../../backend/src/app.js";
import { createTestDb } from "../helpers/test-database.js";
import { seedDatabase } from "../../backend/src/database/seed.js";

const database = await createTestDb();
await seedDatabase(database.db, { demo: false });
const app = createApp({ db: database.db, staticDir: resolve("frontend") });
const server = app.listen(4173, "127.0.0.1");
const close = () => server.close(async () => { await database.close(); process.exit(0); });
process.on("SIGTERM", close);
process.on("SIGINT", close);
