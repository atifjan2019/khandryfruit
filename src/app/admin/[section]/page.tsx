import { notFound } from "next/navigation";
const sections = new Set([
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
]);
export default async function AdminSection({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  if (!sections.has(section)) notFound();
  return (
    <div className="admin-page">
      <header>
        <p className="eyebrow">Administration</p>
        <h1>{section.replaceAll("-", " ")}</h1>
        <p>
          This module is protected by a server-side role policy. Use the guided
          actions below after Supabase is migrated and seeded.
        </p>
      </header>
      <section className="admin-panel">
        <div className="admin-toolbar">
          <button className="button">Create / add</button>
          <button className="button secondary">Export CSV</button>
        </div>
        <div className="empty-state">
          <h2>No records to show</h2>
          <p>
            Connect and seed Supabase, or add the first record using the guided
            form.
          </p>
        </div>
      </section>
    </div>
  );
}
