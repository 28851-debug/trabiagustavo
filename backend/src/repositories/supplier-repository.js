import { asc, eq, sql } from "drizzle-orm";
import { products, suppliers } from "../database/schema.js";

export function createSupplierRepository(db) {
  return {
    list: () => db.select().from(suppliers).orderBy(asc(suppliers.name)),
    async findById(id) { return (await db.select().from(suppliers).where(eq(suppliers.id, id)).limit(1))[0] ?? null; },
    async findByName(name) { return (await db.select().from(suppliers).where(sql`lower(btrim(${suppliers.name})) = lower(btrim(${name}))`).limit(1))[0] ?? null; },
    async create(data) { return (await db.insert(suppliers).values(data).returning())[0]; },
    async update(id, data) { return (await db.update(suppliers).set({ ...data, updatedAt: new Date() }).where(eq(suppliers.id, id)).returning())[0] ?? null; },
    async remove(id) { return (await db.delete(suppliers).where(eq(suppliers.id, id)).returning())[0] ?? null; },
    async isUsed(id) { return Number((await db.select({ count: sql`count(*)` }).from(products).where(eq(products.supplierId, id)))[0].count) > 0; },
  };
}
