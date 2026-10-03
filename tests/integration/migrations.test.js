import { afterEach, describe, expect, it } from "vitest";

import { createTestDb } from "../helpers/test-database.js";

describe("database migrations", () => {
  let database;

  afterEach(async () => {
    await database?.close();
  });

  it("creates every domain table", async () => {
    database = await createTestDb();

    const result = await database.client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);

    expect(result.rows.map((row) => row.table_name)).toEqual([
      "categories",
      "customers",
      "inventory_movements",
      "products",
      "repair_orders",
      "repair_parts",
      "suppliers",
    ]);
  });

  it("creates the inventory and repair status enums", async () => {
    database = await createTestDb();

    const result = await database.client.query(`
      SELECT t.typname, e.enumlabel
      FROM pg_type t
      JOIN pg_enum e ON e.enumtypid = t.oid
      WHERE t.typname IN ('inventory_movement_type', 'repair_status')
      ORDER BY t.typname, e.enumsortorder
    `);

    const valuesByType = Object.groupBy(
      result.rows,
      (row) => row.typname,
    );

    expect(valuesByType.inventory_movement_type.map((row) => row.enumlabel)).toEqual([
      "IN",
      "OUT",
      "ADJUSTMENT",
      "REPAIR_USAGE",
      "RETURN",
    ]);
    expect(valuesByType.repair_status.map((row) => row.enumlabel)).toEqual([
      "RECEIVED",
      "DIAGNOSIS",
      "WAITING_APPROVAL",
      "WAITING_PART",
      "IN_REPAIR",
      "READY",
      "DELIVERED",
      "CANCELLED",
    ]);
  });

  it("enforces non-negative product stock in the database", async () => {
    database = await createTestDb();

    const category = await database.client.query(
      "INSERT INTO categories (name) VALUES ('Capas') RETURNING id",
    );

    await expect(
      database.client.query(
        `INSERT INTO products
          (sku, name, category_id, cost_price_cents, sale_price_cents, quantity, minimum_stock)
         VALUES ('CASE-1', 'Capa', $1, 1000, 2000, -1, 0)`,
        [category.rows[0].id],
      ),
    ).rejects.toThrow();
  });
});
