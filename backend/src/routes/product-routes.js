import { Router } from "express";
import { createProductController } from "../controllers/product-controller.js";
export function createProductRouter(db) { const r=Router(), c=createProductController(db); r.get("/",c.list); r.get("/:id",c.detail); r.post("/",c.create); r.put("/:id",c.update); r.delete("/:id",c.remove); return r; }
