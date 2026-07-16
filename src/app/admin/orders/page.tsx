import Link from "next/link";
import { Download, Search } from "lucide-react";
import { db } from "@/lib/db/client";
import { formatMoney } from "@/lib/commerce/money";
import { requireAdmin } from "@/server/policies/authorization";

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdmin("orders");
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : "";
  const status = typeof params.status === "string" ? params.status : "";
  const payment = typeof params.payment === "string" ? params.payment : "";
  const page = Math.max(1, Number(params.page) || 1);
  const take = 25;
  const where = {
    ...(q
      ? {
          OR: [
            { number: { contains: q, mode: "insensitive" as const } },
            { email: { contains: q, mode: "insensitive" as const } },
            { user: { name: { contains: q, mode: "insensitive" as const } } },
          ],
        }
      : {}),
    ...(status ? { status: status as never } : {}),
    ...(payment ? { paymentStatus: payment as never } : {}),
  };
  const [orders, count] = await Promise.all([
    db.order.findMany({
      where,
      include: {
        user: true,
        addresses: { where: { type: "SHIPPING" }, take: 1 },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * take,
      take,
    }),
    db.order.count({ where }),
  ]);
  return (
    <div className="admin-page-v2">
      <div className="admin-page-heading">
        <div>
          <p className="eyebrow">Fulfilment</p>
          <h1>Orders</h1>
          <p>{count} orders with server-validated status transitions.</p>
        </div>
        <Link className="button secondary" href="/admin/orders/export">
          <Download size={17} /> Export CSV
        </Link>
      </div>
      <form className="admin-filterbar">
        <label>
          <Search size={16} />
          <input
            name="q"
            defaultValue={q}
            placeholder="Order, customer or email"
          />
        </label>
        <select name="status" defaultValue={status}>
          <option value="">All fulfilment states</option>
          {[
            "PENDING_PAYMENT",
            "PAID",
            "PROCESSING",
            "PACKED",
            "SHIPPED",
            "DELIVERED",
            "CANCELLED",
            "REFUNDED",
            "PARTIALLY_REFUNDED",
          ].map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
        <select name="payment" defaultValue={payment}>
          <option value="">All payment states</option>
          {["PENDING", "PAID", "FAILED", "REFUNDED", "PARTIALLY_REFUNDED"].map(
            (item) => (
              <option key={item}>{item}</option>
            ),
          )}
        </select>
        <button className="button">Apply</button>
      </form>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Payment</th>
              <th>Fulfilment</th>
              <th>Country</th>
              <th>Total</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>
                  <strong>{order.number}</strong>
                </td>
                <td>
                  {order.user?.name ?? "Guest"}
                  <small>{order.email}</small>
                </td>
                <td>{order.createdAt.toLocaleDateString("en-DE")}</td>
                <td>
                  <span className="admin-status">{order.paymentStatus}</span>
                </td>
                <td>
                  <span className="admin-status">{order.status}</span>
                </td>
                <td>{order.addresses[0]?.countryCode ?? "-"}</td>
                <td>{formatMoney(order.totalCents, "en", order.currency)}</td>
                <td>
                  <Link
                    className="table-action"
                    href={`/admin/orders/${order.id}`}
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!orders.length && (
          <p className="admin-empty">No orders match these filters.</p>
        )}
      </div>
    </div>
  );
}
