import Link from "next/link";
import { requireAdmin } from "@/server/policies/authorization";
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();
  const nav = [
    "dashboard",
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
    "system-health",
  ];
  return (
    <div className="admin-shell">
      <aside>
        <div className="brand admin-brand">
          <span className="brand-mark">K</span>
          <span>
            <strong>Khan</strong>
            <small>Administration</small>
          </span>
        </div>
        <nav>
          {nav.map((item) => (
            <Link
              key={item}
              href={`/admin/${item === "dashboard" ? "" : item}`}
            >
              {item.replaceAll("-", " ")}
            </Link>
          ))}
        </nav>
        <small>{session.user.email}</small>
      </aside>
      <main>{children}</main>
    </div>
  );
}
