import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { createTestApp } from "../helpers/test-app.js";
import { createTestDb } from "../helpers/test-database.js";

describe("categories API", () => {
  let database;
  let app;
  beforeAll(async () => { database = await createTestDb(); app = createTestApp(database.db); });
  beforeEach(async () => database.reset());
  afterAll(async () => database.close());

  it("creates, lists and updates a category", async () => {
    const created = await request(app).post("/api/categories").send({ name: " Capas " });
    expect(created.status).toBe(201);
    expect(created.body.name).toBe("Capas");
    expect((await request(app).get("/api/categories")).body).toHaveLength(1);
    const updated = await request(app).put(`/api/categories/${created.body.id}`).send({ name: "Películas" });
    expect(updated.body.name).toBe("Películas");
  });

  it("rejects blank and normalized duplicate names", async () => {
    expect((await request(app).post("/api/categories").send({ name: " " })).status).toBe(400);
    await request(app).post("/api/categories").send({ name: "Capas" });
    const duplicate = await request(app).post("/api/categories").send({ name: " capas " });
    expect(duplicate.status).toBe(409);
    expect(duplicate.body.error.code).toBe("DUPLICATE_CATEGORY");
  });

  it("returns 404 for a missing category", async () => {
    expect((await request(app).put("/api/categories/999").send({ name: "X" })).status).toBe(404);
  });

  it("deletes an unused category and protects one referenced by a product", async () => {
    const first = (await request(app).post("/api/categories").send({ name: "Cabos" })).body;
    expect((await request(app).delete(`/api/categories/${first.id}`)).status).toBe(204);
    const used = (await request(app).post("/api/categories").send({ name: "Capas" })).body;
    await database.client.query("INSERT INTO products (sku,name,category_id) VALUES ('A','Produto',$1)", [used.id]);
    const response = await request(app).delete(`/api/categories/${used.id}`);
    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe("RESOURCE_IN_USE");
  });
});
