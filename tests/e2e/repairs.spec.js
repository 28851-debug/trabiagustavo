import { expect, test } from "@playwright/test";

test("manages a repair, its status and repair parts", async ({ page, request }) => {
  const customer = await (await request.post("/api/customers", { data: { name: "Carlos Reparo E2E", phone: "11900000000" } })).json();
  const categories = await (await request.get("/api/categories")).json();
  const product = await (await request.post("/api/products", { data: { sku: "PART-E2E", name: "Display E2E", category_id: categories[0].id, cost_price_cents: 8000, sale_price_cents: 16000, quantity: 2, minimum_stock: 1 } })).json();

  await page.goto("/repairs.html");
  await page.getByRole("button", { name: "Nova ordem" }).click();
  await page.getByLabel("Cliente").selectOption(String(customer.id));
  await page.getByLabel("Aparelho").fill("iPhone 13 E2E");
  await page.getByLabel("Problema relatado").fill("Tela quebrada");
  await page.getByLabel("Preço final").fill("550,00");
  await page.getByRole("button", { name: "Salvar ordem" }).click();

  await expect(page.getByText("iPhone 13 E2E")).toBeVisible();
  await expect(page.locator("tbody .badge")).toHaveText("Recebido");
  await page.getByRole("button", { name: "Detalhes" }).click();
  await expect(page.getByText("Tela quebrada")).toBeVisible();
  await page.getByRole("button", { name: "Editar ordem" }).click();
  await page.locator("#repair-dialog").getByLabel("Status").selectOption("READY");
  await page.getByRole("button", { name: "Salvar ordem" }).click();

  await page.getByLabel("Filtrar por status").selectOption("READY");
  await expect(page.locator("tbody .badge")).toHaveText("Pronto para retirada");
  await page.getByRole("button", { name: "Detalhes" }).click();
  await page.getByRole("button", { name: "Adicionar peça" }).click();
  await page.getByLabel("Produto").selectOption(String(product.id));
  await page.getByLabel("Quantidade").fill("1");
  await page.getByRole("button", { name: "Confirmar peça" }).click();
  await expect(page.locator("#parts-list").getByText("Display E2E", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Adicionar peça" }).click();
  await page.getByLabel("Produto").selectOption(String(product.id));
  await page.getByLabel("Quantidade").fill("99");
  await page.getByRole("button", { name: "Confirmar peça" }).click();
  await expect(page.getByText("Estoque insuficiente.")).toBeVisible();
  await page.getByRole("button", { name: "Cancelar" }).click();
  page.once("dialog", (confirmation) => confirmation.accept());
  await page.getByRole("button", { name: "Devolver peça" }).click();
  await expect(page.getByText("Nenhuma peça vinculada.")).toBeVisible();
});

test("shows repair status with text on a narrow screen", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/repairs.html");
  await expect(page.getByRole("heading", { name: "Ordens de serviço" })).toBeVisible();
  await expect(page.getByLabel("Filtrar por status")).toBeVisible();
});
