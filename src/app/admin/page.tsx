import { db } from "@/lib/db/client";
export default async function AdminPage() {
  const [products, orders, lowStock, applications] = await Promise.all([
    db.product.count(),
    db.order.count(),
    db.inventory.count({ where: { onHand: { lte: 5 } } }),
    db.wholesaleApplication.count({ where: { status: "SUBMITTED" } }),
  ]);
  return (
    <div className="admin-page">
      <header>
        <p className="eyebrow">Overview</p>
        <h1>Store dashboard</h1>
        <p>Operational data from the connected Supabase database.</p>
      </header>
      <div className="metric-grid">
        {[
          ["Products", products],
          ["Orders", orders],
          ["Low stock", lowStock],
          ["Trade applications", applications],
        ].map(([label, value]) => (
          <section key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </section>
        ))}
      </div>
      <section className="admin-panel">
        <h2>Launch readiness</h2>
        <ul>
          <li className="blocked">Business address required</li>
          <li className="blocked">VAT mode requires confirmation</li>
          <li className="blocked">Legal documents require approval</li>
          <li className="blocked">Shipping rates require confirmation</li>
          <li className="blocked">Published product food data incomplete</li>
        </ul>
      </section>
    </div>
  );
}
