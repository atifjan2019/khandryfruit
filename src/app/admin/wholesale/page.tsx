import { AdminForm } from "@/components/admin/admin-form";
import {
  AdminSection,
  Field,
  SelectField,
  TextField,
  Checkbox,
} from "@/components/admin/product-form";
import { formatMoney } from "@/lib/commerce/money";
import { db } from "@/lib/db/client";
import { decideWholesaleAction } from "@/server/actions/admin";
import { requireAdmin } from "@/server/policies/authorization";

export default async function WholesalePage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireAdmin("wholesale");
  const { status = "" } = await searchParams;
  const applications = await db.wholesaleApplication.findMany({
    where: status ? { status: status as never } : undefined,
    include: { user: { include: { wholesaleAccount: true } } },
    orderBy: { createdAt: "desc" },
  });
  return (
    <div className="admin-page-v2">
      <div className="admin-page-heading">
        <div>
          <p className="eyebrow">Trade accounts</p>
          <h1>Wholesale applications</h1>
          <p>
            Every decision and role assignment is recorded in the audit log.
          </p>
        </div>
      </div>
      <form className="admin-filterbar">
        <select name="status" defaultValue={status}>
          <option value="">All statuses</option>
          {[
            "SUBMITTED",
            "UNDER_REVIEW",
            "MORE_INFORMATION_REQUIRED",
            "APPROVED",
            "REJECTED",
          ].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <button className="button">Apply</button>
      </form>
      {applications.map((app) => (
        <div className="admin-two-column" key={app.id}>
          <section className="admin-card">
            <header>
              <h2>{app.companyName}</h2>
              <span className="admin-status">{app.status}</span>
            </header>
            <p>
              <strong>{app.contactName}</strong>
              <br />
              {app.email}
              <br />
              {app.phone}
            </p>
            <p>
              {app.businessAddress}
              {app.city ? `, ${app.city}` : ""} {app.postalCode} ·{" "}
              {app.countryCode}
            </p>
            <p>
              Business type: {app.businessType}
              <br />
              Monthly volume: {app.monthlyOrderVolume}
              <br />
              Products: {app.productsOfInterest.join(", ")}
              <br />
              Delivery: {app.deliveryCountries.join(", ")}
            </p>
            {app.message && <p>{app.message}</p>}
            {app.user?.wholesaleAccount && (
              <p>
                Approved minimum:{" "}
                {formatMoney(
                  app.user.wholesaleAccount.minimumOrderCents ?? 0,
                  "en",
                )}{" "}
                · Invoice:{" "}
                {app.user.wholesaleAccount.invoicePaymentEligible
                  ? "Eligible"
                  : "Disabled"}
              </p>
            )}
          </section>
          {!["APPROVED", "REJECTED"].includes(app.status) && (
            <AdminForm
              action={decideWholesaleAction}
              submitLabel="Save decision"
            >
              <input type="hidden" name="applicationId" value={app.id} />
              <AdminSection title="Review application">
                <SelectField
                  label="Decision"
                  name="status"
                  required
                  options={[
                    "UNDER_REVIEW",
                    "MORE_INFORMATION_REQUIRED",
                    "APPROVED",
                    "REJECTED",
                  ].map((s) => ({ value: s, label: s.replaceAll("_", " ") }))}
                />
                <Field
                  label="Minimum order in cents"
                  name="minimumOrderCents"
                  type="number"
                  min={0}
                />
                <Checkbox
                  label="Invoice payment eligible"
                  name="invoicePaymentEligible"
                />
                <TextField
                  label="Internal notes"
                  name="internalNotes"
                  defaultValue={app.internalNotes}
                  rows={5}
                />
              </AdminSection>
            </AdminForm>
          )}
        </div>
      ))}
      {!applications.length && (
        <p className="admin-empty">
          No wholesale applications match this status.
        </p>
      )}
    </div>
  );
}
