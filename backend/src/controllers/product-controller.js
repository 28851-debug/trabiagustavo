import { AppError } from "../errors/app-error.js";
import { createProductRepository } from "../repositories/product-repository.js";
import { productCreateSchema, productQuerySchema, productUpdateSchema } from "../schemas/product-schema.js";
import { createProductService } from "../services/product-service.js";
import { parseId } from "../utils/normalize.js";
const parse = (schema, value) => { const r = schema.safeParse(value); if (!r.success) throw new AppError(400, "VALIDATION_ERROR", "Dados inválidos.", r.error.flatten()); return r.data; };
const id = (v) => { const n = parseId(v); if (!n) throw new AppError(400, "VALIDATION_ERROR", "Identificador inválido."); return n; };
export function createProductController(db) { const s = createProductService(createProductRepository(db)); return {
  list: async (req,res) => res.json(await s.list(parse(productQuerySchema, req.query))),
  detail: async (req,res) => res.json(await s.detail(id(req.params.id))),
  create: async (req,res) => res.status(201).json(await s.create(parse(productCreateSchema, req.body))),
  update: async (req,res) => res.json(await s.update(id(req.params.id), parse(productUpdateSchema, req.body))),
  remove: async (req,res) => { await s.archive(id(req.params.id)); res.status(204).end(); },
}; }
