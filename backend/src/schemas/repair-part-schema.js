import{z}from"zod";export const repairPartSchema=z.object({product_id:z.number().int().positive(),quantity:z.number().int().positive()}).strict();
