import { Router } from "express";
import { createCategoryController } from "../controllers/category-controller.js";
export function createCategoryRouter(db) { const r = Router(); const c = createCategoryController(db); r.get("/", c.list); r.post("/", c.create); r.put("/:id", c.update); r.delete("/:id", c.remove); return r; }
