import { notFound } from "next/navigation";
import { AdminForm } from "@/components/admin/admin-form";
import {
  AdminSection,
  Field,
  SelectField,
  TextField,
} from "@/components/admin/product-form";
import { formatMoney } from "@/lib/commerce/money";
import {
  orderTransitions,
  type DomainOrderStatus,
} from "@/lib/commerce/order-state";
import { db } from "@/lib/db/client";
import {
  addTrackingAction,
  refundOrderAction,
  transitionOrderAction,
} from "@/server/actions/admin";
import { requireAdmin } from "@/server/policies/authorization";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin("orders");
  const { id } = await params;
  const order = await db.order.findUnique({
    where: { id },
    include: {
      user: true,
      items: true,
      addresses: true,
      payments: { include: { refunds: true } },
      shipments: true,
      statusHistory: {
        include: { actor: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!order) notFound();
  const allowed = orderTransitions[order.status as DomainOrderStatus] ?? [];
  const paid = order.payments.reduce(
    (sum, item) =>
      sum +
      (item.status === "PAID" ||
      item.status === "PARTIALLY_REFUNDED" ||
      item.status === "REFUNDED"
        ? item.amountCents
        : 0),
    0,
  );
  const refunded = order.payments
    .flatMap((item) => item.refunds)
    .reduce((sum, item) => sum + item.amountCents, 0);
  return (
    <div className="admin-page-v2">
      <div className="admin-page-heading">
        <div>
          <p className="eyebrow">Order {order.number}</p>
          <h1>{order.user?.name ?? order.email}</h1>
          <p>
            Created {order.createdAt.toLocaleString("en-DE")} · {order.status}
          </p>
        </div>
      </div>
      <div className="admin-two-column">
        <section className="admin-card">
          <header>
            <h2>Items and totals</h2>
          </header>
          {order.items.map((item) => (
            <div className="admin-list-row" key={item.id}>
              <span>
                <strong>{item.productName}</strong>
                <small>
                  {item.sku} · {item.weightGrams} g · {item.quantity} units
                </small>
              </span>
              <b>{formatMoney(item.lineTotalCents, "en", order.currency)}</b>
            </div>
          ))}
          <dl className="admin-summary">
            <div>
              <dt>Subtotal</dt>
              <dd>{formatMoney(order.subtotalCents, "en")}</dd>
            </div>
            <div>
              <dt>Discount</dt>
              <dd>-{formatMoney(order.discountCents, "en")}</dd>
            </div>
            <div>
              <dt>Shipping</dt>
              <dd>{formatMoney(order.shippingCents, "en")}</dd>
            </div>
            <div>
              <dt>VAT included</dt>
              <dd>{formatMoney(order.taxCents, "en")}</dd>
            </div>
            <div>
              <dt>Total</dt>
              <dd>
                <strong>{formatMoney(order.totalCents, "en")}</strong>
              </dd>
            </div>
          </dl>
        </section>
        <section className="admin-card">
          <header>
            <h2>Customer and addresses</h2>
          </header>
          <p>
            <strong>{order.user?.name ?? "Guest checkout"}</strong>
            <br />
            {order.email}
          </p>
          {order.addresses.map((address) => (
            <address key={address.id}>
              <strong>{address.type}</strong>
              <br />
              {address.firstName} {address.lastName}
              <br />
              {address.company && (
                <>
                  {address.company}
                  <br />
                </>
              )}
              {address.line1}
              <br />
              {address.postalCode} {address.city}
              <br />
              {address.countryCode}
            </address>
          ))}
        </section>
      </div>
      <div className="admin-two-column">
        <AdminForm
          action={transitionOrderAction}
          submitLabel="Update order status"
        >
          <input type="hidden" name="orderId" value={order.id} />
          <AdminSection
            title="Fulfilment status"
            description="Only valid transitions are offered."
          >
            <SelectField
              label="Next status"
              name="status"
              required
              options={allowed
                .filter((item) =>
                  [
                    "PROCESSING",
                    "PACKED",
                    "SHIPPED",
                    "DELIVERED",
                    "CANCELLED",
                    "RETURN_REQUESTED",
                  ].includes(item),
                )
                .map((item) => ({
                  value: item,
                  label: item.replaceAll("_", " "),
                }))}
            />
            <TextField label="Internal note" name="note" />
          </AdminSection>
        </AdminForm>
        <AdminForm action={addTrackingAction} submitLabel="Add tracking">
          <input type="hidden" name="orderId" value={order.id} />
          <AdminSection title="Shipment tracking">
            <Field label="Provider" name="provider" required />
            <Field label="Tracking number" name="trackingNumber" required />
            <Field label="Tracking URL" name="trackingUrl" type="url" />
          </AdminSection>
        </AdminForm>
      </div>
      <div className="admin-two-column">
        <AdminForm action={refundOrderAction} submitLabel="Issue refund">
          <input type="hidden" name="orderId" value={order.id} />
          <AdminSection
            title="Stripe refund"
            description={`${formatMoney(Math.max(0, paid - refunded), "en")} currently refundable. Amounts use cents.`}
          >
            <Field
              label="Amount in cents"
              name="amountCents"
              required
              type="number"
              min={1}
              max={Math.max(0, paid - refunded)}
            />
            <TextField label="Reason" name="reason" />
          </AdminSection>
        </AdminForm>
        <section className="admin-card">
          <header>
            <h2>Timeline</h2>
          </header>
          {order.statusHistory.map((event) => (
            <div className="admin-list-row" key={event.id}>
              <span>
                <strong>
                  {event.oldStatus} → {event.newStatus}
                </strong>
                <small>
                  {event.reason} · {event.actor?.name ?? "System"}
                </small>
              </span>
              <time>{event.createdAt.toLocaleString("en-DE")}</time>
            </div>
          ))}
          {!order.statusHistory.length && (
            <p className="admin-empty">No status changes recorded yet.</p>
          )}
        </section>
      </div>
    </div>
  );
}
