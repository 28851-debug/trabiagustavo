import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { createTestApp } from "../helpers/test-app.js";
import { createTestDb } from "../helpers/test-database.js";

describe("suppliers API", () => {
  let database;
  let app;
  beforeAll(async () => { database = await createTestDb(); app = createTestApp(database.db); });
  beforeEach(async () => database.reset());
  afterAll(async () => database.close());

  it("creates, lists, updates and deletes a supplier", async () => {
    const created = await request(app).post("/api/suppliers").send({ name: " Distribuidora Sul ", phone: "11999999999", email: "vendas@sul.com" });
    expect(created.status).toBe(201);
    expect(created.body.name).toBe("Distribuidora Sul");
    expect((await request(app).get("/api/suppliers")).body).toHaveLength(1);
    const updated = await request(app).put(`/api/suppliers/${created.body.id}`).send({ name: "Sul", phone: null, email: null, notes: "Preferencial" });
    expect(updated.body.notes).toBe("Preferencial");
    expect((await request(app).delete(`/api/suppliers/${created.body.id}`)).status).toBe(204);
  });

  it("rejects invalid email and normalized duplicate name", async () => {
    expect((await request(app).post("/api/suppliers").send({ name: "X", email: "inválido" })).status).toBe(400);
    await request(app).post("/api/suppliers").send({ name: "Fornecedor" });
    const duplicate = await request(app).post("/api/suppliers").send({ name: " fornecedor " });
    expect(duplicate.status).toBe(409);
    expect(duplicate.body.error.code).toBe("DUPLICATE_SUPPLIER");
  });

  it("returns 404 for missing IDs and protects referenced suppliers", async () => {
    expect((await request(app).delete("/api/suppliers/999")).status).toBe(404);
    const category = await database.client.query("INSERT INTO categories (name) VALUES ('Cabos') RETURNING id");
    const supplier = (await request(app).post("/api/suppliers").send({ name: "Fornecedor" })).body;
    await database.client.query("INSERT INTO products (sku,name,category_id,supplier_id) VALUES ('C','Cabo',$1,$2)", [category.rows[0].id, supplier.id]);
    const response = await request(app).delete(`/api/suppliers/${supplier.id}`);
    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe("RESOURCE_IN_USE");
  });
});
