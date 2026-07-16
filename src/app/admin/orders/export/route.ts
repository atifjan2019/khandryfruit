import { db } from "@/lib/db/client";
import { requireAdmin } from "@/server/policies/authorization";

const csv = (value: unknown) =>
  `"${String(value ?? "").replaceAll('"', '""')}"`;
export async function GET() {
  await requireAdmin("orders");
  const orders = await db.order.findMany({
    include: {
      user: true,
      addresses: { where: { type: "SHIPPING" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
  });
  const rows = [
    [
      "Order",
      "Customer",
      "Email",
      "Created",
      "Payment",
      "Status",
      "Country",
      "Total cents",
    ],
    ...orders.map((o) => [
      o.number,
      o.user?.name ?? "Guest",
      o.email,
      o.createdAt.toISOString(),
      o.paymentStatus,
      o.status,
      o.addresses[0]?.countryCode ?? "",
      o.totalCents,
    ]),
  ];
  return new Response(rows.map((row) => row.map(csv).join(",")).join("\n"), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": 'attachment; filename="orders.csv"',
    },
  });
}
