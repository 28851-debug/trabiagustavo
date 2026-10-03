import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

import { createApp } from "./backend/src/app.js";
import { getConfig } from "./backend/src/config.js";
import { createProductionDb } from "./backend/src/database/client.js";

const config = getConfig();
const { db } = createProductionDb();
const publicDirectory = resolve("public");

const app = createApp({
  db,
  staticDir: existsSync(publicDirectory) ? publicDirectory : null,
});

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  app.listen(config.port, () => {
    console.info(`Trabiagustavo disponível em http://localhost:${config.port}`);
  });
}

export default app;
