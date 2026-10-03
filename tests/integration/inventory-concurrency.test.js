import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createTestApp } from "../helpers/test-app.js";
import { createTestDb } from "../helpers/test-database.js";

describe("inventory concurrency", () => {
  let database, app;
  beforeAll(async () => { database=await createTestDb(); app=createTestApp(database.db); });
  afterAll(async () => database.close());
  it("allows only one simultaneous removal of the last unit", async () => {
    const category=(await database.client.query("INSERT INTO categories(name) VALUES ('Peças') RETURNING id")).rows[0].id;
    const p=(await request(app).post("/api/products").send({sku:"LAST",name:"Última peça",category_id:category,cost_price_cents:1,sale_price_cents:2,quantity:1,minimum_stock:0})).body;
    const responses=await Promise.all([1,2].map(()=>request(app).post(`/api/products/${p.id}/stock/remove`).send({quantity:1})));
    expect(responses.map((r)=>r.status).sort()).toEqual([200,409]);
    expect((await request(app).get(`/api/products/${p.id}`)).body.quantity).toBe(0);
    const rows=await database.client.query("SELECT count(*)::int AS count FROM inventory_movements WHERE type='OUT'");
    expect(rows.rows[0].count).toBe(1);
  });
});
