import { createResourceController } from "./resource-controller.js";
import { createSupplierRepository } from "../repositories/supplier-repository.js";
import { supplierInputSchema } from "../schemas/supplier-schema.js";
import { createSupplierService } from "../services/supplier-service.js";
export const createSupplierController = (db) => createResourceController({ service: createSupplierService(createSupplierRepository(db)), schema: supplierInputSchema });
