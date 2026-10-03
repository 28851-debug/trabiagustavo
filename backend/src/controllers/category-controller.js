import { createResourceController } from "./resource-controller.js";
import { createCategoryRepository } from "../repositories/category-repository.js";
import { categoryInputSchema } from "../schemas/category-schema.js";
import { createCategoryService } from "../services/category-service.js";
export const createCategoryController = (db) => createResourceController({ service: createCategoryService(createCategoryRepository(db)), schema: categoryInputSchema });
