import { describe, expect, it } from "vitest";
import {
  applyStockAdjustment,
  assertWholesaleTransition,
  canArchiveCategory,
  validateRefund,
} from "./admin-rules";

describe("admin commerce rules", () => {
  it("adjusts available stock without crossing reserved stock", () => {
    expect(applyStockAdjustment(20, 5, -10)).toEqual({
      onHand: 10,
      available: 5,
    });
    expect(() => applyStockAdjustment(10, 8, -3)).toThrow(
      "INSUFFICIENT_ON_HAND_STOCK",
    );
  });

  it("validates partial and excessive refunds", () => {
    expect(validateRefund(2500, 10000, 1000)).toBe(6500);
    expect(() => validateRefund(9500, 10000, 1000)).toThrow(
      "REFUND_EXCEEDS_AVAILABLE",
    );
  });

  it("enforces wholesale transitions and safe category archival", () => {
    expect(() =>
      assertWholesaleTransition("SUBMITTED", "APPROVED"),
    ).not.toThrow();
    expect(() => assertWholesaleTransition("APPROVED", "REJECTED")).toThrow(
      "INVALID_WHOLESALE_TRANSITION",
    );
    expect(canArchiveCategory(0)).toBe(true);
    expect(canArchiveCategory(1)).toBe(false);
  });
});
