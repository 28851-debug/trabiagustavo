import { expect, test } from "@playwright/test";

test("adds, removes and adjusts stock through backend operations", async ({ page, request }) => {
  const categories = await (await request.get("/api/categories")).json();
  await request.post("/api/products", { data: { sku: "STOCK-E2E", name: "Cabo Estoque E2E", category_id: categories[0].id, cost_price_cents: 1000, sale_price_cents: 2000, quantity: 200, minimum_stock: 5 } });
  await page.goto("/products.html?search=STOCK-E2E");
  await page.getByRole("button", { name: "Entrada" }).click();
  await page.getByLabel("Quantidade").fill("20");
  await expect(page.getByText("Novo estoque: 220")).toBeVisible();
  await page.getByRole("button", { name: "Confirmar entrada" }).click();
  await expect(page.getByText("220", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Saída" }).click();
  await page.getByLabel("Quantidade").fill("15");
  await page.getByRole("button", { name: "Confirmar saída" }).click();
  await expect(page.getByText("205", { exact: true })).toBeVisible();
});

test("shows insufficient stock feedback and movement history", async ({ page, request }) => {
  const categories = await (await request.get("/api/categories")).json();
  await request.post("/api/products", { data: { sku: "LOW-E2E", name: "Peça baixa E2E", category_id: categories[0].id, cost_price_cents: 100, sale_price_cents: 200, quantity: 1, minimum_stock: 1 } });
  await page.goto("/products.html?search=LOW-E2E");
  await page.getByRole("button", { name: "Saída" }).click();
  await page.getByLabel("Quantidade").fill("2");
  await page.getByRole("button", { name: "Confirmar saída" }).click();
  await expect(page.getByText("Estoque insuficiente.")).toBeVisible();
  await page.getByRole("button", { name: "Cancelar" }).click();
  await page.getByRole("button", { name: "Histórico" }).click();
  await expect(page.locator("#history-list").getByText("Estoque inicial")).toBeVisible();
});
