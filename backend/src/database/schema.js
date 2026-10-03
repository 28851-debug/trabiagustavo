import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

export const inventoryMovementType = pgEnum("inventory_movement_type", [
  "IN",
  "OUT",
  "ADJUSTMENT",
  "REPAIR_USAGE",
  "RETURN",
]);

export const repairStatus = pgEnum("repair_status", [
  "RECEIVED",
  "DIAGNOSIS",
  "WAITING_APPROVAL",
  "WAITING_PART",
  "IN_REPAIR",
  "READY",
  "DELIVERED",
  "CANCELLED",
]);

const auditColumns = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
};

export const categories = pgTable(
  "categories",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 120 }).notNull(),
    ...auditColumns,
  },
  (table) => [
    uniqueIndex("categories_name_normalized_unique").on(
      sql`lower(btrim(${table.name}))`,
    ),
    check("categories_name_not_blank", sql`length(btrim(${table.name})) > 0`),
  ],
);

export const suppliers = pgTable(
  "suppliers",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 160 }).notNull(),
    phone: varchar("phone", { length: 40 }),
    email: varchar("email", { length: 254 }),
    notes: text("notes"),
    ...auditColumns,
  },
  (table) => [
    uniqueIndex("suppliers_name_normalized_unique").on(
      sql`lower(btrim(${table.name}))`,
    ),
    check("suppliers_name_not_blank", sql`length(btrim(${table.name})) > 0`),
  ],
);

export const products = pgTable(
  "products",
  {
    id: serial("id").primaryKey(),
    sku: varchar("sku", { length: 80 }).notNull(),
    name: varchar("name", { length: 200 }).notNull(),
    categoryId: integer("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "restrict" }),
    brand: varchar("brand", { length: 120 }),
    compatibility: text("compatibility"),
    costPriceCents: integer("cost_price_cents").notNull().default(0),
    salePriceCents: integer("sale_price_cents").notNull().default(0),
    quantity: integer("quantity").notNull().default(0),
    minimumStock: integer("minimum_stock").notNull().default(0),
    supplierId: integer("supplier_id").references(() => suppliers.id, {
      onDelete: "restrict",
    }),
    notes: text("notes"),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    ...auditColumns,
  },
  (table) => [
    uniqueIndex("products_sku_normalized_unique").on(
      sql`lower(btrim(${table.sku}))`,
    ),
    index("products_category_idx").on(table.categoryId),
    index("products_supplier_idx").on(table.supplierId),
    check("products_sku_not_blank", sql`length(btrim(${table.sku})) > 0`),
    check("products_name_not_blank", sql`length(btrim(${table.name})) > 0`),
    check("products_cost_nonnegative", sql`${table.costPriceCents} >= 0`),
    check("products_sale_nonnegative", sql`${table.salePriceCents} >= 0`),
    check("products_quantity_nonnegative", sql`${table.quantity} >= 0`),
    check("products_minimum_stock_nonnegative", sql`${table.minimumStock} >= 0`),
  ],
);

export const customers = pgTable(
  "customers",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 180 }).notNull(),
    phone: varchar("phone", { length: 40 }).notNull(),
    email: varchar("email", { length: 254 }),
    notes: text("notes"),
    ...auditColumns,
  },
  (table) => [
    index("customers_name_idx").on(table.name),
    index("customers_phone_idx").on(table.phone),
    check("customers_name_not_blank", sql`length(btrim(${table.name})) > 0`),
    check("customers_phone_not_blank", sql`length(btrim(${table.phone})) > 0`),
  ],
);

export const repairOrders = pgTable(
  "repair_orders",
  {
    id: serial("id").primaryKey(),
    customerId: integer("customer_id")
      .notNull()
      .references(() => customers.id, { onDelete: "restrict" }),
    device: varchar("device", { length: 160 }).notNull(),
    brand: varchar("brand", { length: 120 }),
    model: varchar("model", { length: 160 }),
    color: varchar("color", { length: 80 }),
    serialNumber: varchar("serial_number", { length: 120 }),
    reportedProblem: text("reported_problem").notNull(),
    diagnosis: text("diagnosis"),
    technician: varchar("technician", { length: 160 }),
    technicianNotes: text("technician_notes"),
    priceCents: integer("price_cents").notNull().default(0),
    costCents: integer("cost_cents").notNull().default(0),
    status: repairStatus("status").notNull().default("RECEIVED"),
    entryDate: timestamp("entry_date", { withTimezone: true }).notNull().defaultNow(),
    estimatedCompletion: timestamp("estimated_completion", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    ...auditColumns,
  },
  (table) => [
    index("repair_orders_customer_idx").on(table.customerId),
    index("repair_orders_status_idx").on(table.status),
    index("repair_orders_entry_date_idx").on(table.entryDate),
    check("repair_orders_device_not_blank", sql`length(btrim(${table.device})) > 0`),
    check(
      "repair_orders_problem_not_blank",
      sql`length(btrim(${table.reportedProblem})) > 0`,
    ),
    check("repair_orders_price_nonnegative", sql`${table.priceCents} >= 0`),
    check("repair_orders_cost_nonnegative", sql`${table.costCents} >= 0`),
  ],
);

export const inventoryMovements = pgTable(
  "inventory_movements",
  {
    id: serial("id").primaryKey(),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "restrict" }),
    type: inventoryMovementType("type").notNull(),
    quantity: integer("quantity").notNull(),
    previousStock: integer("previous_stock").notNull(),
    newStock: integer("new_stock").notNull(),
    referenceType: varchar("reference_type", { length: 60 }),
    referenceId: integer("reference_id"),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("inventory_movements_product_idx").on(table.productId),
    index("inventory_movements_created_at_idx").on(table.createdAt),
    index("inventory_movements_reference_idx").on(
      table.referenceType,
      table.referenceId,
    ),
    check("inventory_movements_quantity_positive", sql`${table.quantity} > 0`),
    check("inventory_movements_previous_nonnegative", sql`${table.previousStock} >= 0`),
    check("inventory_movements_new_nonnegative", sql`${table.newStock} >= 0`),
  ],
);

export const repairParts = pgTable(
  "repair_parts",
  {
    id: serial("id").primaryKey(),
    repairOrderId: integer("repair_order_id")
      .notNull()
      .references(() => repairOrders.id, { onDelete: "restrict" }),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "restrict" }),
    quantity: integer("quantity").notNull(),
    unitCostCents: integer("unit_cost_cents").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("repair_parts_repair_idx").on(table.repairOrderId),
    index("repair_parts_product_idx").on(table.productId),
    check("repair_parts_quantity_positive", sql`${table.quantity} > 0`),
    check("repair_parts_unit_cost_nonnegative", sql`${table.unitCostCents} >= 0`),
  ],
);
