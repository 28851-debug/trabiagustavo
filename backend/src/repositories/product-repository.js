import { and, asc, eq, gte, isNull, lte, or, sql } from "drizzle-orm";
import { categories, inventoryMovements, products, suppliers } from "../database/schema.js";

const selection = {
  id: products.id, sku: products.sku, name: products.name, category_id: products.categoryId,
  category_name: categories.name, brand: products.brand, compatibility: products.compatibility,
  cost_price_cents: products.costPriceCents, sale_price_cents: products.salePriceCents,
  quantity: products.quantity, minimum_stock: products.minimumStock, supplier_id: products.supplierId,
  supplier_name: suppliers.name, notes: products.notes, created_at: products.createdAt, updated_at: products.updatedAt,
};
const present = (row) => row && ({ ...row, inventory_cost_cents: row.cost_price_cents * row.quantity, potential_retail_cents: row.sale_price_cents * row.quantity });
const escapeLike = (value) => value.replace(/[\\%_]/g, "\\$&");

export function createProductRepository(db) {
  const conditions = (query) => {
    const list = [isNull(products.archivedAt)];
    if (query.search) { const p = `%${escapeLike(query.search)}%`; list.push(sql`(${products.name} ILIKE ${p} ESCAPE '\\' OR ${products.sku} ILIKE ${p} ESCAPE '\\' OR ${products.brand} ILIKE ${p} ESCAPE '\\' OR ${products.compatibility} ILIKE ${p} ESCAPE '\\' OR ${categories.name} ILIKE ${p} ESCAPE '\\')`); }
    if (query.categoryId) list.push(eq(products.categoryId, query.categoryId));
    if (query.brand) list.push(sql`${products.brand} ILIKE ${`%${escapeLike(query.brand)}%`} ESCAPE '\\'`);
    if (query.compatibility) list.push(sql`${products.compatibility} ILIKE ${`%${escapeLike(query.compatibility)}%`} ESCAPE '\\'`);
    if (query.stockStatus === "out") list.push(eq(products.quantity, 0));
    if (query.stockStatus === "in") list.push(sql`${products.quantity} > 0`);
    if (query.stockStatus === "low") list.push(sql`${products.quantity} > 0 AND ${products.quantity} <= ${products.minimumStock}`);
    if (query.minPriceCents !== undefined) list.push(gte(products.salePriceCents, query.minPriceCents));
    if (query.maxPriceCents !== undefined) list.push(lte(products.salePriceCents, query.maxPriceCents));
    return and(...list);
  };
  return {
    db,
    async list(query) {
      const where = conditions(query);
      const [items, count] = await Promise.all([
        db.select(selection).from(products).innerJoin(categories, eq(products.categoryId, categories.id)).leftJoin(suppliers, eq(products.supplierId, suppliers.id)).where(where).orderBy(asc(products.name)).limit(query.pageSize).offset((query.page - 1) * query.pageSize),
        db.select({ count: sql`count(*)` }).from(products).innerJoin(categories, eq(products.categoryId, categories.id)).where(where),
      ]);
      const total = Number(count[0].count);
      return { items: items.map(present), meta: { page: query.page, page_size: query.pageSize, total, total_pages: Math.ceil(total / query.pageSize) } };
    },
    async findById(id, includeArchived = false) { const row = (await db.select(selection).from(products).innerJoin(categories, eq(products.categoryId, categories.id)).leftJoin(suppliers, eq(products.supplierId, suppliers.id)).where(and(eq(products.id, id), ...(includeArchived ? [] : [isNull(products.archivedAt)]))).limit(1))[0]; return present(row); },
    async findBySku(sku) { return (await db.select().from(products).where(sql`lower(btrim(${products.sku})) = lower(btrim(${sku}))`).limit(1))[0] ?? null; },
    async categoryExists(id) { return Boolean((await db.select({ id: categories.id }).from(categories).where(eq(categories.id, id)).limit(1))[0]); },
    async supplierExists(id) { return Boolean((await db.select({ id: suppliers.id }).from(suppliers).where(eq(suppliers.id, id)).limit(1))[0]); },
    async create(data) { return db.transaction(async (tx) => { const row = (await tx.insert(products).values(data).returning())[0]; if (row.quantity > 0) await tx.insert(inventoryMovements).values({ productId: row.id, type: "IN", quantity: row.quantity, previousStock: 0, newStock: row.quantity, note: "Estoque inicial" }); return row.id; }); },
    async update(id, data) { return (await db.update(products).set({ ...data, updatedAt: new Date() }).where(and(eq(products.id, id), isNull(products.archivedAt))).returning({ id: products.id }))[0] ?? null; },
    async archive(id) { return (await db.update(products).set({ archivedAt: new Date(), updatedAt: new Date() }).where(and(eq(products.id, id), isNull(products.archivedAt))).returning({ id: products.id }))[0] ?? null; },
  };
}
