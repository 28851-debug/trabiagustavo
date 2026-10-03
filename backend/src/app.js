import cors from "cors";
import express from "express";
import helmet from "helmet";

import { errorHandler, notFoundHandler } from "./middleware/error-handler.js";
import { createHealthRouter } from "./routes/health-routes.js";

export function createApp({ db = null, logger = console, staticDir = null } = {}) {
  const app = express();

  app.disable("x-powered-by");
  app.locals.db = db;
  app.use((request, response, next) => {
    response.locals.logger = logger;
    next();
  });
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(cors({ origin: false }));
  app.use(express.json({ limit: "256kb" }));

  app.use("/api/health", createHealthRouter());

  if (staticDir) {
    app.use(express.static(staticDir));
  }

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
