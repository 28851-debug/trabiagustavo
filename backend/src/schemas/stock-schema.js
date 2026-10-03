import { z } from "zod";
export const stockMovementSchema = z.object({ quantity:z.number().int().positive(), note:z.string().trim().max(2000).nullable().optional() }).strict();
export const stockAdjustmentSchema = z.object({ new_stock:z.number().int().nonnegative(), reason:z.string().trim().min(1).max(2000) }).strict();
export const movementQuerySchema = z.object({ page:z.coerce.number().int().positive().default(1), pageSize:z.coerce.number().int().min(1).max(100).default(20) }).strict();
