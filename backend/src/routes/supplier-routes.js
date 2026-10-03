import { Router } from "express";
import { createSupplierController } from "../controllers/supplier-controller.js";
export function createSupplierRouter(db) { const r = Router(); const c = createSupplierController(db); r.get("/", c.list); r.post("/", c.create); r.put("/:id", c.update); r.delete("/:id", c.remove); return r; }
