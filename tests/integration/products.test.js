import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { createTestApp } from "../helpers/test-app.js";
import { createTestDb } from "../helpers/test-database.js";

describe("products API", () => {
  let database, app, categoryId, otherCategoryId;
  beforeAll(async () => { database = await createTestDb(); app = createTestApp(database.db); });
  beforeEach(async () => {
    await database.reset();
    categoryId = (await database.client.query("INSERT INTO categories(name) VALUES ('Capas') RETURNING id")).rows[0].id;
    otherCategoryId = (await database.client.query("INSERT INTO categories(name) VALUES ('Baterias') RETURNING id")).rows[0].id;
  });
  afterAll(async () => database.close());

  const product = (overrides = {}) => ({ sku: "CASE-IP13", name: "Capa iPhone 13", category_id: categoryId, brand: "Generic", compatibility: "iPhone 13", cost_price_cents: 2000, sale_price_cents: 4990, quantity: 5, minimum_stock: 2, ...overrides });

  it("creates a product and records initial stock atomically", async () => {
    const response = await request(app).post("/api/products").send(product());
    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({ sku: "CASE-IP13", quantity: 5, inventory_cost_cents: 10000, potential_retail_cents: 24950 });
    const movements = await database.client.query("SELECT type,quantity,previous_stock,new_stock FROM inventory_movements");
    expect(movements.rows).toEqual([{ type: "IN", quantity: 5, previous_stock: 0, new_stock: 5 }]);
  });

  it("validates required fields, cents, stock and references", async () => {
    expect((await request(app).post("/api/products").send(product({ name: "" }))).status).toBe(400);
    expect((await request(app).post("/api/products").send(product({ sale_price_cents: 1.5 }))).status).toBe(400);
    expect((await request(app).post("/api/products").send(product({ quantity: -1 }))).status).toBe(400);
    expect((await request(app).post("/api/products").send(product({ category_id: 999 }))).status).toBe(404);
  });

  it("rejects duplicate normalized SKU", async () => {
    await request(app).post("/api/products").send(product());
    const response = await request(app).post("/api/products").send(product({ sku: " case-ip13 " }));
    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe("DUPLICATE_SKU");
  });

  it("edits product data but rejects direct stock mutation", async () => {
    const created = (await request(app).post("/api/products").send(product())).body;
    const updated = await request(app).put(`/api/products/${created.id}`).send({ ...product({ name: "Capa Premium", quantity: undefined }), minimum_stock: 3 });
    expect(updated.status).toBe(200);
    expect(updated.body.name).toBe("Capa Premium");
    expect((await request(app).put(`/api/products/${created.id}`).send({ ...product(), quantity: 99 })).status).toBe(400);
  });

  it("searches, filters, paginates and treats wildcard characters literally", async () => {
    await request(app).post("/api/products").send(product());
    await request(app).post("/api/products").send(product({ sku: "BAT-IP11", name: "Bateria", category_id: otherCategoryId, brand: "Apple", compatibility: "iPhone 11", quantity: 0, sale_price_cents: 9000 }));
    expect((await request(app).get("/api/products?search=iPhone%2013")).body.items).toHaveLength(1);
    expect((await request(app).get(`/api/products?categoryId=${otherCategoryId}&stockStatus=out`)).body.items[0].sku).toBe("BAT-IP11");
    expect((await request(app).get("/api/products?brand=Generic&minPriceCents=4000&maxPriceCents=5000")).body.items).toHaveLength(1);
    expect((await request(app).get("/api/products?search=%25_%25")).body.items).toHaveLength(0);
    const page = (await request(app).get("/api/products?page=2&pageSize=1")).body;
    expect(page.meta).toMatchObject({ page: 2, page_size: 1, total: 2, total_pages: 2 });
  });

  it("returns details then archives without deleting history", async () => {
    const created = (await request(app).post("/api/products").send(product())).body;
    expect((await request(app).get(`/api/products/${created.id}`)).body.category_name).toBe("Capas");
    expect((await request(app).delete(`/api/products/${created.id}`)).status).toBe(204);
    expect((await request(app).get("/api/products")).body.items).toHaveLength(0);
    expect((await database.client.query("SELECT count(*)::int AS count FROM products")).rows[0].count).toBe(1);
  });
});
