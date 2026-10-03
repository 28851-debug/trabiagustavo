import { asc, eq, sql } from "drizzle-orm";
import { categories, products } from "../database/schema.js";

export function createCategoryRepository(db) {
  return {
    list: () => db.select().from(categories).orderBy(asc(categories.name)),
    async findById(id) { return (await db.select().from(categories).where(eq(categories.id, id)).limit(1))[0] ?? null; },
    async findByName(name) { return (await db.select().from(categories).where(sql`lower(btrim(${categories.name})) = lower(btrim(${name}))`).limit(1))[0] ?? null; },
    async create(data) { return (await db.insert(categories).values(data).returning())[0]; },
    async update(id, data) { return (await db.update(categories).set({ ...data, updatedAt: new Date() }).where(eq(categories.id, id)).returning())[0] ?? null; },
    async remove(id) { return (await db.delete(categories).where(eq(categories.id, id)).returning())[0] ?? null; },
    async isUsed(id) { return Number((await db.select({ count: sql`count(*)` }).from(products).where(eq(products.categoryId, id)))[0].count) > 0; },
  };
}
