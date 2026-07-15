import { describe, expect, it } from "vitest";
import { calculateDiscount } from "./coupon";
describe("coupon rules", () => {
  it("caps percentage discounts", () =>
    expect(
      calculateDiscount(
        {
          type: "PERCENTAGE",
          value: 2000,
          active: true,
          usageCount: 0,
          customerUsageCount: 0,
          maximumDiscountCents: 500,
        },
        5000,
      ),
    ).toBe(500));
  it("rejects expired coupons", () =>
    expect(() =>
      calculateDiscount(
        {
          type: "FIXED",
          value: 500,
          active: true,
          expiresAt: new Date("2020-01-01"),
          usageCount: 0,
          customerUsageCount: 0,
        },
        5000,
      ),
    ).toThrow("COUPON_EXPIRED"));
});
