import { Router } from "express";
import { createProductController } from "../controllers/product-controller.js";
import { mountProductInventoryRoutes } from "./inventory-routes.js";
export function createProductRouter(db) { const r=Router(), c=createProductController(db); r.get("/",c.list); r.post("/",c.create); mountProductInventoryRoutes(r,db); r.get("/:id",c.detail); r.put("/:id",c.update); r.delete("/:id",c.remove); return r; }
