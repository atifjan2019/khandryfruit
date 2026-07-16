import { expect, test, type Page } from "@playwright/test";

const adminEmail = process.env.E2E_ADMIN_EMAIL;
const adminPassword = process.env.E2E_ADMIN_PASSWORD;
const customerEmail = process.env.E2E_CUSTOMER_EMAIL;
const customerPassword = process.env.E2E_CUSTOMER_PASSWORD;

async function signIn(page: Page, email: string, password: string) {
  await page.goto("/en/sign-in?callbackURL=/admin");
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/en\/account/);
}

test("anonymous visitors receive a real unauthorised response", async ({
  request,
}) => {
  const response = await request.get("/admin", { maxRedirects: 0 });
  expect(response.status()).toBe(401);
  await expect(response.text()).resolves.toContain("Sign in required");
});

test("admin can sign in and open every protected administration area", async ({
  page,
}) => {
  test.skip(
    !adminEmail || !adminPassword,
    "Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD",
  );
  await signIn(page, adminEmail!, adminPassword!);
  await page.goto("/admin");
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();

  for (const path of [
    "products",
    "categories",
    "inventory",
    "orders",
    "customers",
    "wholesale",
    "contact-enquiries",
    "gift-boxes",
    "packaging",
    "coupons",
    "reviews",
    "content",
    "blog",
    "recipes",
    "faqs",
    "legal",
    "settings",
    "audit-logs",
    "system-health",
  ]) {
    const response = await page.goto(`/admin/${path}`);
    expect(response?.status(), path).toBe(200);
  }
});

test("customer account is forbidden from admin", async ({ page }) => {
  test.skip(
    !customerEmail || !customerPassword,
    "Set E2E_CUSTOMER_EMAIL and E2E_CUSTOMER_PASSWORD",
  );
  await signIn(page, customerEmail!, customerPassword!);
  const response = await page.goto("/admin");
  expect(response?.status()).toBe(403);
  await expect(
    page.getByRole("heading", { name: "Access not permitted" }),
  ).toBeVisible();
});
