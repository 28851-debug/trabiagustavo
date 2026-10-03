import { expect, test } from "@playwright/test";

test("creates and searches a product", async ({ page }) => {
  await page.goto("/products.html");
  await page.getByRole("button", { name: "Novo produto" }).click();
  await page.getByLabel("SKU").fill("CASE-E2E");
  await page.getByLabel("Nome").fill("Capa iPhone 13 E2E");
  await page.locator("#product-dialog").getByLabel("Categoria").selectOption({ index: 1 });
  await page.getByLabel("Compatibilidade").fill("iPhone 13");
  await page.getByLabel("Preço de custo").fill("20,00");
  await page.getByLabel("Preço de venda").fill("49,90");
  await page.getByLabel("Estoque inicial").fill("5");
  await page.getByLabel("Estoque mínimo").fill("2");
  await page.getByRole("button", { name: "Salvar produto" }).click();
  await expect(page.getByText("Capa iPhone 13 E2E")).toBeVisible();
  await page.getByPlaceholder("Nome, SKU, marca ou compatibilidade").fill("iPhone 13");
  await expect(page.locator("tbody tr")).toHaveCount(1);
});

test("shows the responsive product view", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/products.html");
  await expect(page.getByRole("heading", { name: "Produtos" })).toBeVisible();
  await expect(page.locator(".table-wrap")).toBeVisible();
});
