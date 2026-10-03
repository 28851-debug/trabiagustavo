import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { createTestApp } from "../helpers/test-app.js";
import { createTestDb } from "../helpers/test-database.js";

describe("inventory API", () => {
  let database, app, categoryId;
  beforeAll(async () => { database=await createTestDb(); app=createTestApp(database.db); });
  beforeEach(async () => { await database.reset(); categoryId=(await database.client.query("INSERT INTO categories(name) VALUES ('Cabos') RETURNING id")).rows[0].id; });
  afterAll(async () => database.close());
  async function create(quantity) { return (await request(app).post("/api/products").send({ sku:`CAB-${quantity}`, name:"Cabo", category_id:categoryId, cost_price_cents:1000, sale_price_cents:2000, quantity, minimum_stock:5 })).body; }

  it("adds and removes stock using movement quantities", async () => {
    const p=await create(200);
    expect((await request(app).post(`/api/products/${p.id}/stock/add`).send({quantity:20})).body).toMatchObject({previous_stock:200,new_stock:220});
    expect((await request(app).post(`/api/products/${p.id}/stock/add`).send({quantity:30})).body.new_stock).toBe(250);
    expect((await request(app).post(`/api/products/${p.id}/stock/remove`).send({quantity:50})).body.new_stock).toBe(200);
  });

  it("rejects insufficient and invalid quantities without changing stock", async () => {
    const p=await create(5);
    const denied=await request(app).post(`/api/products/${p.id}/stock/remove`).send({quantity:10});
    expect(denied.status).toBe(409); expect(denied.body.error.code).toBe("INSUFFICIENT_STOCK");
    for (const quantity of [0,-1,1.5]) expect((await request(app).post(`/api/products/${p.id}/stock/add`).send({quantity})).status).toBe(400);
    expect((await request(app).get(`/api/products/${p.id}`)).body.quantity).toBe(5);
  });

  it("adjusts absolute stock and requires a meaningful reason", async () => {
    const p=await create(20);
    const adjusted=await request(app).post(`/api/products/${p.id}/stock/adjust`).send({new_stock:17,reason:"Contagem física"});
    expect(adjusted.body).toMatchObject({type:"ADJUSTMENT",quantity:3,previous_stock:20,new_stock:17});
    expect((await request(app).post(`/api/products/${p.id}/stock/adjust`).send({new_stock:17,reason:"igual"})).status).toBe(409);
    expect((await request(app).post(`/api/products/${p.id}/stock/adjust`).send({new_stock:10,reason:" "})).status).toBe(400);
  });

  it("lists product and global movement history", async () => {
    const p=await create(2); await request(app).post(`/api/products/${p.id}/stock/remove`).send({quantity:1,note:"Venda"});
    const own=(await request(app).get(`/api/products/${p.id}/movements`)).body;
    expect(own.items.map((m)=>m.type)).toEqual(["OUT","IN"]);
    expect((await request(app).get("/api/inventory/movements?page=1&pageSize=1")).body.meta.total).toBe(2);
  });

  it("rejects movements for archived products", async () => {
    const p=await create(1); await request(app).delete(`/api/products/${p.id}`);
    expect((await request(app).post(`/api/products/${p.id}/stock/add`).send({quantity:1})).status).toBe(404);
  });
});
