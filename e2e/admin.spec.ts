import { expect, test } from "@playwright/test";

test("protects the admin dashboard from unauthenticated users", async ({
  page,
}) => {
  const response = await page.goto("/admin");
  expect(response?.status()).toBe(401);
  await expect(
    page.getByRole("heading", { name: /sign in required/i }),
  ).toBeVisible();
});

test.describe("authenticated admin workflows", () => {
  test.skip(
    !process.env.ADMIN_E2E_EMAIL || !process.env.ADMIN_E2E_PASSWORD,
    "Set ADMIN_E2E_EMAIL and ADMIN_E2E_PASSWORD against an isolated test database.",
  );

  test.beforeEach(async ({ page }) => {
    await page.goto("/en/sign-in");
    await page.getByLabel(/email/i).fill(process.env.ADMIN_E2E_EMAIL!);
    await page.getByLabel(/password/i).fill(process.env.ADMIN_E2E_PASSWORD!);
    await page.getByRole("button", { name: /sign in/i }).click();
    await page.goto("/admin");
  });

  test("opens dashboard and every management area", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: /operations dashboard/i }),
    ).toBeVisible();
    for (const path of [
      "products",
      "categories",
      "inventory",
      "orders",
      "customers",
      "wholesale",
      "gift-boxes",
      "coupons",
      "reviews",
      "content",
      "settings",
      "audit-logs",
    ]) {
      await page.goto(`/admin/${path}`);
      await expect(page.locator("h1")).toBeVisible();
    }
  });
});
