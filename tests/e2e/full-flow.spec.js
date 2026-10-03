import { expect, test } from "@playwright/test";

test("runs the complete stock-to-repair flow", async ({ page, request }) => {
  const customer = await (await request.post("/api/customers", { data: { name: "Fluxo Completo E2E", phone: "11912345678" } })).json();

  await page.goto("/products.html");
  await page.getByRole("button", { name: "Novo produto" }).click();
  await page.getByLabel("SKU").fill("FLOW-E2E");
  await page.getByLabel("Nome").fill("Peça Fluxo Completo");
  await page.locator("#product-dialog").getByLabel("Categoria").selectOption({ index: 1 });
  await page.getByLabel("Preço de custo").fill("25,00");
  await page.getByLabel("Preço de venda").fill("60,00");
  await page.getByLabel("Estoque inicial").fill("5");
  await page.getByLabel("Estoque mínimo").fill("1");
  await page.getByRole("button", { name: "Salvar produto" }).click();
  const productRow = page.getByRole("row").filter({ has: page.getByRole("cell", { name: "FLOW-E2E", exact: true }) });
  await productRow.getByRole("button", { name: "Entrada" }).click();
  await page.getByLabel("Quantidade").fill("2");
  await page.getByRole("button", { name: "Confirmar entrada" }).click();
  await expect(productRow.getByText("7", { exact: true })).toBeVisible();

  await page.goto("/repairs.html");
  await page.getByRole("button", { name: "Nova ordem" }).click();
  await page.getByLabel("Cliente").selectOption(String(customer.id));
  await page.getByLabel("Aparelho").fill("Aparelho do fluxo E2E");
  await page.getByLabel("Problema relatado").fill("Troca de componente");
  await page.getByRole("button", { name: "Salvar ordem" }).click();
  await page.getByRole("button", { name: "Detalhes" }).click();
  await page.getByRole("button", { name: "Adicionar peça" }).click();
  await page.getByLabel("Produto").selectOption({ index: 0 });
  await page.getByRole("button", { name: "Confirmar peça" }).click();
  await expect(page.locator("#parts-list").getByText("Peça Fluxo Completo", { exact: true })).toBeVisible();

  await page.goto("/products.html?search=FLOW-E2E");
  await expect(page.getByText("6", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Histórico" }).click();
  await expect(page.locator("#history-list").getByText("REPAIR_USAGE")).toBeVisible();

  await page.goto("/");
  await expect(page.locator("#activity").getByText("Peça Fluxo Completo").first()).toBeVisible();
});
