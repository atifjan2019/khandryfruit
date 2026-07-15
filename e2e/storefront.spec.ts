import { expect, test } from "@playwright/test";
test("browses the German catalogue and product", async ({ page }) => {
  await page.goto("/de");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Premium",
  );
  await page.getByRole("link", { name: /Jetzt einkaufen/i }).click();
  await expect(page).toHaveURL(/\/de\/shop/);
  await page
    .getByRole("link", { name: /Schwarze Rosinen/ })
    .first()
    .click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Schwarze Rosinen",
  );
});
test("switches language", async ({ page }) => {
  await page.goto("/de");
  await page.getByRole("link", { name: /EN/ }).click();
  await expect(page).toHaveURL(/\/en/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Premium Afghan",
  );
});
