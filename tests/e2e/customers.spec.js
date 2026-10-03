import { expect, test } from "@playwright/test";

test("creates, searches and edits a customer", async ({ page }) => {
  await page.goto("/customers.html");
  await page.getByRole("button", { name: "Novo cliente" }).click();
  await page.getByLabel("Nome").fill("Ana Cliente E2E");
  await page.getByLabel("Telefone").fill("(11) 99999-0000");
  await page.getByLabel("E-mail").fill("ana.e2e@example.com");
  await page.getByRole("button", { name: "Salvar cliente" }).click();
  await expect(page.getByText("Ana Cliente E2E")).toBeVisible();

  await page.getByPlaceholder("Nome ou telefone").fill("99999-0000");
  await expect(page.locator("tbody tr")).toHaveCount(1);
  await page.getByRole("button", { name: "Editar" }).click();
  await page.getByLabel("Telefone").fill("(11) 98888-1111");
  await page.getByRole("button", { name: "Salvar cliente" }).click();
  await expect(page.locator("#customer-dialog")).not.toBeVisible();
  await page.getByPlaceholder("Nome ou telefone").fill("98888-1111");
  await expect(page.getByText("(11) 98888-1111")).toBeVisible();
});
