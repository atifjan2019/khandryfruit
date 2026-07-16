import Link from "next/link";
import { Search } from "lucide-react";
import { db } from "@/lib/db/client";
import { formatMoney } from "@/lib/commerce/money";
import { requireAdmin } from "@/server/policies/authorization";

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; role?: string }>;
}) {
  await requireAdmin("customers");
  const { q = "", role = "" } = await searchParams;
  const customers = await db.user.findMany({
    where: {
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(role
        ? { role }
        : { role: { in: ["CUSTOMER", "WHOLESALE_CUSTOMER"] } }),
    },
    include: {
      profile: true,
      wholesaleAccount: true,
      orders: {
        where: { paymentStatus: "PAID" },
        select: { totalCents: true, createdAt: true },
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return (
    <div className="admin-page-v2">
      <div className="admin-page-heading">
        <div>
          <p className="eyebrow">Customer records</p>
          <h1>Customers</h1>
          <p>
            Profiles, consent and order history without authentication secrets.
          </p>
        </div>
      </div>
      <form className="admin-filterbar">
        <label>
          <Search size={16} />
          <input name="q" defaultValue={q} placeholder="Name or email" />
        </label>
        <select name="role" defaultValue={role}>
          <option value="">Customer accounts</option>
          <option value="CUSTOMER">Retail</option>
          <option value="WHOLESALE_CUSTOMER">Wholesale</option>
        </select>
        <button className="button">Apply</button>
      </form>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Registered</th>
              <th>Orders</th>
              <th>Total spend</th>
              <th>Last order</th>
              <th>Consent</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {customers.map((user) => {
              const total = user.orders.reduce((s, o) => s + o.totalCents, 0);
              return (
                <tr key={user.id}>
                  <td>
                    <strong>{user.name}</strong>
                    <small>{user.email}</small>
                  </td>
                  <td>{user.role.replaceAll("_", " ")}</td>
                  <td>{user.createdAt.toLocaleDateString("en-DE")}</td>
                  <td>{user.orders.length}</td>
                  <td>{formatMoney(total, "en")}</td>
                  <td>
                    {user.orders[0]?.createdAt.toLocaleDateString("en-DE") ??
                      "-"}
                  </td>
                  <td>{user.marketingConsentAt ? "Granted" : "None"}</td>
                  <td>
                    <Link
                      className="table-action"
                      href={`/admin/customers/${user.id}`}
                    >
                      View
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!customers.length && (
          <p className="admin-empty">No customers match these filters.</p>
        )}
      </div>
    </div>
  );
}
