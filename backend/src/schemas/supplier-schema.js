import { z } from "zod";
const optionalText = (max) => z.string().trim().max(max).nullable().optional();
export const supplierInputSchema = z.object({
  name: z.string().trim().min(1).max(160),
  phone: optionalText(40),
  email: z.union([z.email().max(254), z.literal(""), z.null()]).optional().transform((value) => value || null),
  notes: optionalText(5000),
}).strict();
