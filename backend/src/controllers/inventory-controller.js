import { AppError } from "../errors/app-error.js";
import { createInventoryRepository } from "../repositories/inventory-repository.js";
import { movementQuerySchema, stockAdjustmentSchema, stockMovementSchema } from "../schemas/stock-schema.js";
import { createInventoryService } from "../services/inventory-service.js";
import { parseId } from "../utils/normalize.js";
const parse=(s,v)=>{const r=s.safeParse(v);if(!r.success)throw new AppError(400,"VALIDATION_ERROR","Dados inválidos.",r.error.flatten());return r.data;};
const id=(v)=>{const n=parseId(v);if(!n)throw new AppError(400,"VALIDATION_ERROR","Identificador inválido.");return n;};
export function createInventoryController(db){const s=createInventoryService(createInventoryRepository(db));return{
 add:async(req,res)=>res.json(await s.add(id(req.params.id),parse(stockMovementSchema,req.body))),
 remove:async(req,res)=>res.json(await s.remove(id(req.params.id),parse(stockMovementSchema,req.body))),
 adjust:async(req,res)=>res.json(await s.adjust(id(req.params.id),parse(stockAdjustmentSchema,req.body))),
 productList:async(req,res)=>res.json(await s.list(id(req.params.id),parse(movementQuerySchema,req.query))),
 list:async(req,res)=>res.json(await s.list(null,parse(movementQuerySchema,req.query))),
};}
