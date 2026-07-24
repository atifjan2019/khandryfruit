"use client";

import { useState } from "react";
import { Pencil, Plus, TicketPercent } from "lucide-react";

import { AdminForm } from "@/components/admin/admin-form";
import { Checkbox, Field, SelectField } from "@/components/admin/product-form";
import { Modal } from "@/components/admin/modal";
import { formatMoney } from "@/lib/commerce/money";
import {
  createCouponAction,
  deleteCouponAction,
  updateCouponAction,
} from "@/server/actions/admin";

export type CouponRow = {
  id: string;
  code: string;
  type: "PERCENTAGE" | "FIXED" | "FREE_SHIPPING";
  value: number;
  active: boolean;
  startsAt: string | null;
  expiresAt: string | null;
  usageLimit: number | null;
  perCustomerLimit: number | null;
  minimumOrderCents: number | null;
  usageCount: number;
};

const DISCOUNT_OPTIONS = [
  { value: "PERCENTAGE", label: "Percentage (basis points, 1000 = 10%)" },
  { value: "FIXED", label: "Fixed amount in cents" },
  { value: "FREE_SHIPPING", label: "Free shipping" },
];

function discountLabel(coupon: CouponRow) {
  if (coupon.type === "PERCENTAGE") return `${coupon.value / 100}%`;
  if (coupon.type === "FIXED") return formatMoney(coupon.value, "en");
  return "Free shipping";
}

function windowLabel(coupon: CouponRow) {
  const start = coupon.startsAt
    ? new Date(coupon.startsAt).toLocaleDateString("en-GB")
    : "Now";
  const end = coupon.expiresAt
    ? new Date(coupon.expiresAt).toLocaleDateString("en-GB")
    : "Open";
  return `${start} – ${end}`;
}

type Editing = { mode: "create" } | { mode: "edit"; coupon: CouponRow };

export function CouponManager({ coupons }: { coupons: CouponRow[] }) {
  const [editing, setEditing] = useState<Editing | null>(null);
  const close = () => setEditing(null);

  return (
    <div className="admin-page-v2">
      <div className="admin-page-heading">
        <div>
          <p className="eyebrow">Promotions</p>
          <h1>Coupons</h1>
          <p>
            Rules are re-validated at checkout; a browser-submitted discount is
            never trusted.
          </p>
        </div>
        <button
          type="button"
          className="button"
          onClick={() => setEditing({ mode: "create" })}
        >
          <Plus size={17} /> New coupon
        </button>
      </div>

      <section className="admin-card">
        <header>
          <h2>Current coupons</h2>
          <span className="admin-muted-label">
            {coupons.length} {coupons.length === 1 ? "coupon" : "coupons"}
          </span>
        </header>
        {coupons.length ? (
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
                  <th className="is-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((coupon) => (
                  <tr key={coupon.id}>
                    <td>
                      <strong>{coupon.code}</strong>
                    </td>
                    <td>{discountLabel(coupon)}</td>
                    <td>{windowLabel(coupon)}</td>
                    <td>
                      {coupon.minimumOrderCents
                        ? formatMoney(coupon.minimumOrderCents, "en")
                        : "—"}
                    </td>
                    <td>
                      {coupon.usageCount}
                      {coupon.usageLimit ? ` / ${coupon.usageLimit}` : ""}
                    </td>
                    <td>
                      <span
                        className={`admin-status ${
                          coupon.active ? "is-positive" : "is-warning"
                        }`}
                      >
                        {coupon.active ? "Active" : "Disabled"}
                      </span>
                    </td>
                    <td className="is-actions">
                      <button
                        type="button"
                        className="table-action"
                        onClick={() => setEditing({ mode: "edit", coupon })}
                      >
                        <Pencil size={13} /> Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="admin-empty-cta">
            <TicketPercent size={26} aria-hidden="true" />
            <p>No coupons yet.</p>
            <button
              type="button"
              className="button"
              onClick={() => setEditing({ mode: "create" })}
            >
              <Plus size={16} /> Create your first coupon
            </button>
          </div>
        )}
      </section>

      <Modal
        open={editing !== null}
        onClose={close}
        title={editing?.mode === "edit" ? "Edit coupon" : "New coupon"}
        description="Percentage values are basis points — 1000 means 10%."
      >
        {editing && (
          <AdminForm
            action={
              editing.mode === "edit" ? updateCouponAction : createCouponAction
            }
            submitLabel={
              editing.mode === "edit" ? "Save changes" : "Create coupon"
            }
            onSuccess={close}
          >
            {editing.mode === "edit" && (
              <input type="hidden" name="couponId" value={editing.coupon.id} />
            )}
            <CouponFields
              coupon={editing.mode === "edit" ? editing.coupon : null}
            />
          </AdminForm>
        )}

        {editing?.mode === "edit" && (
          <div className="admin-modal-danger">
            {editing.coupon.usageCount > 0 ? (
              <p className="admin-note-muted">
                This coupon has been redeemed {editing.coupon.usageCount} time
                {editing.coupon.usageCount === 1 ? "" : "s"} and cannot be
                deleted. Set it to inactive instead.
              </p>
            ) : (
              <AdminForm
                action={deleteCouponAction}
                submitLabel="Delete coupon"
                submitClassName="button danger"
                confirmMessage="Delete this coupon permanently?"
                onSuccess={close}
                className="admin-form admin-form-inline"
              >
                <input
                  type="hidden"
                  name="couponId"
                  value={editing.coupon.id}
                />
              </AdminForm>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

const toLocalInput = (value: string | null) =>
  value ? new Date(value).toISOString().slice(0, 16) : undefined;

function CouponFields({ coupon }: { coupon: CouponRow | null }) {
  return (
    <div className="admin-field-grid">
      <Field label="Code" name="code" required defaultValue={coupon?.code} />
      <SelectField
        label="Discount type"
        name="type"
        required
        defaultValue={coupon?.type}
        options={DISCOUNT_OPTIONS}
      />
      <Field
        label="Value"
        name="value"
        type="number"
        min={0}
        required
        defaultValue={coupon ? String(coupon.value) : undefined}
        hint="Basis points for %, cents for fixed, 0 for free shipping"
      />
      <Field
        label="Minimum order in cents"
        name="minimumOrderCents"
        type="number"
        min={0}
        defaultValue={
          coupon?.minimumOrderCents
            ? String(coupon.minimumOrderCents)
            : undefined
        }
      />
      <Field
        label="Starts at"
        name="startsAt"
        type="datetime-local"
        defaultValue={toLocalInput(coupon?.startsAt ?? null)}
      />
      <Field
        label="Expires at"
        name="expiresAt"
        type="datetime-local"
        defaultValue={toLocalInput(coupon?.expiresAt ?? null)}
      />
      <Field
        label="Total usage limit"
        name="usageLimit"
        type="number"
        min={1}
        defaultValue={
          coupon?.usageLimit ? String(coupon.usageLimit) : undefined
        }
      />
      <Field
        label="Per-customer limit"
        name="perCustomerLimit"
        type="number"
        min={1}
        defaultValue={
          coupon?.perCustomerLimit ? String(coupon.perCustomerLimit) : undefined
        }
      />
      <Checkbox
        name="active"
        label="Active"
        defaultChecked={coupon?.active ?? true}
      />
    </div>
  );
}
