import { Router } from "express";
import { createInventoryController } from "../controllers/inventory-controller.js";
export function createInventoryRouter(db){const r=Router(),c=createInventoryController(db);r.get("/movements",c.list);return r;}
export function mountProductInventoryRoutes(router,db){const c=createInventoryController(db);router.post("/:id/stock/add",c.add);router.post("/:id/stock/remove",c.remove);router.post("/:id/stock/adjust",c.adjust);router.get("/:id/movements",c.productList);}
