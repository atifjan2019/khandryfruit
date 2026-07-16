import { AdminForm } from "@/components/admin/admin-form";
import {
  AdminSection,
  Checkbox,
  Field,
  SelectField,
} from "@/components/admin/product-form";
import { formatMoney } from "@/lib/commerce/money";
import { db } from "@/lib/db/client";
import { createCouponAction } from "@/server/actions/admin";
import { requireAdmin } from "@/server/policies/authorization";

export default async function CouponsPage() {
  await requireAdmin("coupons");
  const coupons = await db.coupon.findMany({
    include: { _count: { select: { usages: true, eligibleCategories: true } } },
    orderBy: { createdAt: "desc" },
  });
  return (
    <div className="admin-page-v2">
      <div className="admin-page-heading">
        <div>
          <p className="eyebrow">Promotions</p>
          <h1>Coupons</h1>
          <p>
            Rules are validated again during checkout; browser-submitted
            discounts are never trusted.
          </p>
        </div>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Discount</th>
              <th>Window</th>
              <th>Minimum</th>
              <th>Usage</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c.id}>
                <td>
                  <strong>{c.code}</strong>
                </td>
                <td>
                  {c.type === "PERCENTAGE"
                    ? `${c.value / 100}%`
                    : c.type === "FIXED"
                      ? formatMoney(c.value, "en")
                      : "Free shipping"}
                </td>
                <td>
                  {c.startsAt?.toLocaleDateString("en-DE") ?? "Now"} -{" "}
                  {c.expiresAt?.toLocaleDateString("en-DE") ?? "Open"}
                </td>
                <td>
                  {c.minimumOrderCents
                    ? formatMoney(c.minimumOrderCents, "en")
                    : "None"}
                </td>
                <td>
                  {c._count.usages}
                  {c.usageLimit ? ` / ${c.usageLimit}` : ""}
                </td>
                <td>{c.active ? "Active" : "Disabled"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!coupons.length && (
          <p className="admin-empty">No coupons configured.</p>
        )}
      </div>
      <AdminForm action={createCouponAction} submitLabel="Create coupon">
        <AdminSection title="New coupon">
          <div className="admin-field-grid">
            <Field label="Code" name="code" required />
            <SelectField
              label="Discount type"
              name="type"
              required
              options={[
                { value: "PERCENTAGE", label: "Percentage (basis points)" },
                { value: "FIXED", label: "Fixed amount in cents" },
                { value: "FREE_SHIPPING", label: "Free shipping" },
              ]}
            />
            <Field label="Value" name="value" type="number" min={0} required />
            <Field label="Starts at" name="startsAt" type="datetime-local" />
            <Field label="Expires at" name="expiresAt" type="datetime-local" />
            <Field
              label="Minimum order in cents"
              name="minimumOrderCents"
              type="number"
              min={0}
            />
            <Field
              label="Total usage limit"
              name="usageLimit"
              type="number"
              min={1}
            />
            <Field
              label="Per-customer limit"
              name="perCustomerLimit"
              type="number"
              min={1}
            />
            <Checkbox name="active" label="Active" />
          </div>
        </AdminSection>
      </AdminForm>
    </div>
  );
}
