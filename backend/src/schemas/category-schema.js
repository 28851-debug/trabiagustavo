import { z } from "zod";
export const categoryInputSchema = z.object({ name: z.string().trim().min(1).max(120) }).strict();
