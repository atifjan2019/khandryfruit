import { describe, expect, it } from "vitest";
import { adminVariantSchema, couponAdminSchema } from "./admin-schemas";

describe("admin form validation", () => {
  it("normalises valid variants and rejects invalid weight", () => {
    const valid = adminVariantSchema.parse({
      productId: "p1",
      sku: " sku-500 ",
      weightGrams: "500",
      shippingWeightG: "520",
      priceCents: "1299",
      vatRateBps: "700",
      sortOrder: "0",
      initialStock: "10",
      lowStockThreshold: "3",
      active: "true",
    });
    expect(valid.sku).toBe("SKU-500");
    expect(valid.priceCents).toBe(1299);
    expect(() =>
      adminVariantSchema.parse({ ...valid, weightGrams: 0 }),
    ).toThrow();
  });

  it("rejects percentage coupons above 100 percent", () => {
    expect(() =>
      couponAdminSchema.parse({
        code: "OVER100",
        type: "PERCENTAGE",
        value: 10001,
        active: true,
      }),
    ).toThrow();
    expect(
      couponAdminSchema.parse({
        code: "WELCOME",
        type: "PERCENTAGE",
        value: 1000,
        active: true,
      }).value,
    ).toBe(1000);
  });
});
