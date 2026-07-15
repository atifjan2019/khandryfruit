export const adminAreas = [
  "dashboard", "products", "categories", "inventory", "orders", "customers", "wholesale", "gift-boxes", "coupons", "reviews", "content", "settings", "audit-logs"
] as const;
export type AdminArea = (typeof adminAreas)[number];
export type AppRole = "CUSTOMER" | "WHOLESALE_CUSTOMER" | "CONTENT_EDITOR" | "ORDER_MANAGER" | "ADMIN" | "SUPER_ADMIN";

const permissions: Record<AppRole, ReadonlySet<AdminArea>> = {
  CUSTOMER: new Set(), WHOLESALE_CUSTOMER: new Set(),
  CONTENT_EDITOR: new Set(["dashboard", "content", "reviews"]),
  ORDER_MANAGER: new Set(["dashboard", "orders", "customers"]),
  ADMIN: new Set(["dashboard", "products", "categories", "inventory", "orders", "customers", "wholesale", "gift-boxes", "coupons", "reviews", "content", "audit-logs"]),
  SUPER_ADMIN: new Set(adminAreas)
};

export function isAppRole(value: string): value is AppRole { return value in permissions; }
export function canAccessAdmin(role: string, area: AdminArea) { return isAppRole(role) && permissions[role].has(area); }
export function visibleAdminAreas(role: string) { return adminAreas.filter((area) => canAccessAdmin(role, area)); }
