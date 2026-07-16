import { describe, expect, it } from "vitest";
import { canAccessAdmin, visibleAdminAreas } from "./admin";

describe("admin role permissions", () => {
  it("denies customer roles", () => {
    expect(visibleAdminAreas("CUSTOMER")).toEqual([]);
    expect(visibleAdminAreas("WHOLESALE_CUSTOMER")).toEqual([]);
  });

  it("limits editors and order managers", () => {
    expect(canAccessAdmin("CONTENT_EDITOR", "content")).toBe(true);
    expect(canAccessAdmin("CONTENT_EDITOR", "orders")).toBe(false);
    expect(canAccessAdmin("ORDER_MANAGER", "orders")).toBe(true);
    expect(canAccessAdmin("ORDER_MANAGER", "products")).toBe(false);
  });

  it("reserves critical settings for super administrators", () => {
    expect(canAccessAdmin("ADMIN", "settings")).toBe(false);
    expect(canAccessAdmin("SUPER_ADMIN", "settings")).toBe(true);
    expect(visibleAdminAreas("SUPER_ADMIN")).toHaveLength(13);
  });
});
