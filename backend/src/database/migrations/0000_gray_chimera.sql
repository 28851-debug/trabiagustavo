CREATE TYPE "public"."inventory_movement_type" AS ENUM('IN', 'OUT', 'ADJUSTMENT', 'REPAIR_USAGE', 'RETURN');--> statement-breakpoint
CREATE TYPE "public"."repair_status" AS ENUM('RECEIVED', 'DIAGNOSIS', 'WAITING_APPROVAL', 'WAITING_PART', 'IN_REPAIR', 'READY', 'DELIVERED', 'CANCELLED');--> statement-breakpoint
CREATE TABLE "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(120) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "categories_name_not_blank" CHECK (length(btrim("categories"."name")) > 0)
);
--> statement-breakpoint
CREATE TABLE "customers" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(180) NOT NULL,
	"phone" varchar(40) NOT NULL,
	"email" varchar(254),
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "customers_name_not_blank" CHECK (length(btrim("customers"."name")) > 0),
	CONSTRAINT "customers_phone_not_blank" CHECK (length(btrim("customers"."phone")) > 0)
);
--> statement-breakpoint
CREATE TABLE "inventory_movements" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"type" "inventory_movement_type" NOT NULL,
	"quantity" integer NOT NULL,
	"previous_stock" integer NOT NULL,
	"new_stock" integer NOT NULL,
	"reference_type" varchar(60),
	"reference_id" integer,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "inventory_movements_quantity_positive" CHECK ("inventory_movements"."quantity" > 0),
	CONSTRAINT "inventory_movements_previous_nonnegative" CHECK ("inventory_movements"."previous_stock" >= 0),
	CONSTRAINT "inventory_movements_new_nonnegative" CHECK ("inventory_movements"."new_stock" >= 0)
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"sku" varchar(80) NOT NULL,
	"name" varchar(200) NOT NULL,
	"category_id" integer NOT NULL,
	"brand" varchar(120),
	"compatibility" text,
	"cost_price_cents" integer DEFAULT 0 NOT NULL,
	"sale_price_cents" integer DEFAULT 0 NOT NULL,
	"quantity" integer DEFAULT 0 NOT NULL,
	"minimum_stock" integer DEFAULT 0 NOT NULL,
	"supplier_id" integer,
	"notes" text,
	"archived_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "products_sku_not_blank" CHECK (length(btrim("products"."sku")) > 0),
	CONSTRAINT "products_name_not_blank" CHECK (length(btrim("products"."name")) > 0),
	CONSTRAINT "products_cost_nonnegative" CHECK ("products"."cost_price_cents" >= 0),
	CONSTRAINT "products_sale_nonnegative" CHECK ("products"."sale_price_cents" >= 0),
	CONSTRAINT "products_quantity_nonnegative" CHECK ("products"."quantity" >= 0),
	CONSTRAINT "products_minimum_stock_nonnegative" CHECK ("products"."minimum_stock" >= 0)
);
--> statement-breakpoint
CREATE TABLE "repair_orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_id" integer NOT NULL,
	"device" varchar(160) NOT NULL,
	"brand" varchar(120),
	"model" varchar(160),
	"color" varchar(80),
	"serial_number" varchar(120),
	"reported_problem" text NOT NULL,
	"diagnosis" text,
	"technician" varchar(160),
	"technician_notes" text,
	"price_cents" integer DEFAULT 0 NOT NULL,
	"cost_cents" integer DEFAULT 0 NOT NULL,
	"status" "repair_status" DEFAULT 'RECEIVED' NOT NULL,
	"entry_date" timestamp with time zone DEFAULT now() NOT NULL,
	"estimated_completion" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "repair_orders_device_not_blank" CHECK (length(btrim("repair_orders"."device")) > 0),
	CONSTRAINT "repair_orders_problem_not_blank" CHECK (length(btrim("repair_orders"."reported_problem")) > 0),
	CONSTRAINT "repair_orders_price_nonnegative" CHECK ("repair_orders"."price_cents" >= 0),
	CONSTRAINT "repair_orders_cost_nonnegative" CHECK ("repair_orders"."cost_cents" >= 0)
);
--> statement-breakpoint
CREATE TABLE "repair_parts" (
	"id" serial PRIMARY KEY NOT NULL,
	"repair_order_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"quantity" integer NOT NULL,
	"unit_cost_cents" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "repair_parts_quantity_positive" CHECK ("repair_parts"."quantity" > 0),
	CONSTRAINT "repair_parts_unit_cost_nonnegative" CHECK ("repair_parts"."unit_cost_cents" >= 0)
);
--> statement-breakpoint
CREATE TABLE "suppliers" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(160) NOT NULL,
	"phone" varchar(40),
	"email" varchar(254),
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "suppliers_name_not_blank" CHECK (length(btrim("suppliers"."name")) > 0)
);
--> statement-breakpoint
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "repair_orders" ADD CONSTRAINT "repair_orders_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "repair_parts" ADD CONSTRAINT "repair_parts_repair_order_id_repair_orders_id_fk" FOREIGN KEY ("repair_order_id") REFERENCES "public"."repair_orders"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "repair_parts" ADD CONSTRAINT "repair_parts_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "categories_name_normalized_unique" ON "categories" USING btree (lower(btrim("name")));--> statement-breakpoint
CREATE INDEX "customers_name_idx" ON "customers" USING btree ("name");--> statement-breakpoint
CREATE INDEX "customers_phone_idx" ON "customers" USING btree ("phone");--> statement-breakpoint
CREATE INDEX "inventory_movements_product_idx" ON "inventory_movements" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "inventory_movements_created_at_idx" ON "inventory_movements" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "inventory_movements_reference_idx" ON "inventory_movements" USING btree ("reference_type","reference_id");--> statement-breakpoint
CREATE UNIQUE INDEX "products_sku_normalized_unique" ON "products" USING btree (lower(btrim("sku")));--> statement-breakpoint
CREATE INDEX "products_category_idx" ON "products" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "products_supplier_idx" ON "products" USING btree ("supplier_id");--> statement-breakpoint
CREATE INDEX "repair_orders_customer_idx" ON "repair_orders" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "repair_orders_status_idx" ON "repair_orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "repair_orders_entry_date_idx" ON "repair_orders" USING btree ("entry_date");--> statement-breakpoint
CREATE INDEX "repair_parts_repair_idx" ON "repair_parts" USING btree ("repair_order_id");--> statement-breakpoint
CREATE INDEX "repair_parts_product_idx" ON "repair_parts" USING btree ("product_id");--> statement-breakpoint
CREATE UNIQUE INDEX "suppliers_name_normalized_unique" ON "suppliers" USING btree (lower(btrim("name")));