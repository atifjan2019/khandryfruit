import { describe, expect, it } from "vitest";
import { formatMoney, includedTax, unitPricePerKg } from "./money";
describe("money", () => {
  it("calculates price per kilogram in minor units", () =>
    expect(unitPricePerKg(800, 500)).toBe(1600));
  it("extracts included VAT", () => expect(includedTax(1070, 700)).toBe(70));
  it("formats German currency", () =>
    expect(formatMoney(1299, "de")).toContain("12,99"));
  it("rejects invalid weights", () =>
    expect(() => unitPricePerKg(500, 0)).toThrow("INVALID_WEIGHT"));
});
