import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./backend/src/database/schema.js",
  out: "./backend/src/database/migrations",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "postgresql://localhost/trabiagustavo",
  },
});
