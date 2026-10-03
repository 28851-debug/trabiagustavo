import { expect, test } from "@playwright/test";

test("dashboard renders its operational shell and metrics", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  await expect(page.locator(".metric")).toHaveCount(7);
  await expect(page.getByRole("region", { name: "Indicadores" }).getByText("Produtos", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Produtos" })).toBeVisible();
});

test("mobile navigation can be opened", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Abrir menu" }).click();
  await expect(page.locator("body")).toHaveClass(/nav-open/);
});

test("dashboard exposes API failures", async ({ page }) => {
  await page.route("**/api/dashboard", (route) => route.fulfill({ status: 500, contentType: "application/json", body: JSON.stringify({ error: { message: "Falha simulada" } }) }));
  await page.goto("/");
  await expect(page.getByText("Falha simulada")).toBeVisible();
});
