import { createApp } from "../../backend/src/app.js";

export function createTestApp(db = null) {
  return createApp({
    db,
    logger: { error() {}, info() {} },
    staticDir: null,
  });
}
