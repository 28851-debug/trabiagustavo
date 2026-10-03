import cors from "cors";
import express from "express";
import helmet from "helmet";

import { errorHandler, notFoundHandler } from "./middleware/error-handler.js";
import { createHealthRouter } from "./routes/health-routes.js";
import { createCategoryRouter } from "./routes/category-routes.js";
import { createSupplierRouter } from "./routes/supplier-routes.js";
import { createProductRouter } from "./routes/product-routes.js";
import { createInventoryRouter } from "./routes/inventory-routes.js";
import { createCustomerRouter } from "./routes/customer-routes.js";
import { createRepairRouter } from "./routes/repair-routes.js";
import { createDashboardRouter } from "./routes/dashboard-routes.js";

export function createApp({ app = express(), db = null, logger = console, staticDir = null } = {}) {

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
  if (db) {
    app.use("/api/categories", createCategoryRouter(db));
    app.use("/api/suppliers", createSupplierRouter(db));
    app.use("/api/products", createProductRouter(db));
    app.use("/api/inventory", createInventoryRouter(db));
    app.use("/api/customers", createCustomerRouter(db));
    app.use("/api/repairs", createRepairRouter(db));
    app.use("/api/dashboard", createDashboardRouter(db));
  }

  if (staticDir) {
    app.use(express.static(staticDir));
  }

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
