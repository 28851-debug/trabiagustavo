import { z } from "zod";
const cents = z.number().int().nonnegative().safe();
const optionalText = (max) => z.string().trim().max(max).nullable().optional();
const base = {
  sku: z.string().trim().min(1).max(80), name: z.string().trim().min(1).max(200),
  category_id: z.number().int().positive(), brand: optionalText(120), compatibility: optionalText(5000),
  cost_price_cents: cents, sale_price_cents: cents, minimum_stock: z.number().int().nonnegative(),
  supplier_id: z.number().int().positive().nullable().optional(), notes: optionalText(5000),
};
export const productCreateSchema = z.object({ ...base, quantity: z.number().int().nonnegative() }).strict();
export const productUpdateSchema = z.object(base).strict();
export const productQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1), pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().optional(), categoryId: z.coerce.number().int().positive().optional(), brand: z.string().trim().optional(),
  compatibility: z.string().trim().optional(), stockStatus: z.enum(["in", "low", "out"]).optional(),
  minPriceCents: z.coerce.number().int().nonnegative().optional(), maxPriceCents: z.coerce.number().int().nonnegative().optional(),
}).strict().refine((v) => v.minPriceCents === undefined || v.maxPriceCents === undefined || v.minPriceCents <= v.maxPriceCents, { message: "Invalid price range" });
