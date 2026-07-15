import { Download, Search } from "lucide-react";
import Link from "next/link";
import { AdminForm } from "@/components/admin/admin-form";
import {
  AdminSection,
  Field,
  SelectField,
  TextField,
} from "@/components/admin/product-form";
import { db } from "@/lib/db/client";
import { adjustInventoryAction } from "@/server/actions/admin";
import { requireAdmin } from "@/server/policies/authorization";
export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; low?: string }>;
}) {
  await requireAdmin("inventory");
  const { q = "", low } = await searchParams;
  const inventory = await db.inventory.findMany({
    where: q
      ? {
          variant: {
            OR: [
              { sku: { contains: q, mode: "insensitive" } },
              {
                product: {
                  translations: {
                    some: { name: { contains: q, mode: "insensitive" } },
                  },
                },
              },
            ],
          },
        }
      : undefined,
    include: {
      variant: { include: { product: { include: { translations: true } } } },
      adjustments: { take: 1, orderBy: { createdAt: "desc" } },
    },
    orderBy: { updatedAt: "desc" },
  });
  const visible =
    low === "1"
      ? inventory.filter(
          (item) => item.onHand - item.reserved <= item.lowStockThreshold,
        )
      : inventory;
  return (
    <div className="admin-page-v2">
      <div className="admin-page-heading">
        <div>
          <p className="eyebrow">Stock control</p>
          <h1>Inventory</h1>
          <p>Available stock is always calculated as on-hand minus reserved.</p>
        </div>
        <Link className="button secondary" href="/admin/inventory/export">
          <Download size={17} /> Export CSV
        </Link>
      </div>
      <form className="admin-filterbar">
        <label>
          <Search size={16} />
          <input name="q" defaultValue={q} placeholder="Product or SKU" />
        </label>
        <label className="admin-checkbox">
          <input
            name="low"
            value="1"
            type="checkbox"
            defaultChecked={low === "1"}
          />
          <span>Low stock only</span>
        </label>
        <button className="button">Apply</button>
      </form>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>SKU</th>
              <th>Weight</th>
              <th>On hand</th>
              <th>Reserved</th>
              <th>Available</th>
              <th>Threshold</th>
              <th>Last adjustment</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((item) => {
              const available = item.onHand - item.reserved;
              const name =
                item.variant.product.translations.find(
                  (translation) => translation.locale === "en",
                )?.name ?? item.variant.product.internalName;
              return (
                <tr
                  className={
                    available <= item.lowStockThreshold ? "low-stock-row" : ""
                  }
                  key={item.id}
                >
                  <td>
                    <strong>{name}</strong>
                  </td>
                  <td>{item.variant.sku}</td>
                  <td>{item.variant.weightGrams} g</td>
                  <td>{item.onHand}</td>
                  <td>{item.reserved}</td>
                  <td>
                    <strong>{available}</strong>
                  </td>
                  <td>{item.lowStockThreshold}</td>
                  <td>
                    {item.adjustments[0]
                      ? `${item.adjustments[0].quantity > 0 ? "+" : ""}${item.adjustments[0].quantity} · ${item.adjustments[0].reason}`
                      : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!visible.length && (
          <p className="admin-empty">No inventory matches these filters.</p>
        )}
      </div>
      <AdminForm
        action={adjustInventoryAction}
        submitLabel="Record stock adjustment"
      >
        <AdminSection
          title="Adjust stock"
          description="Every change is transactional and preserved in inventory history."
        >
          <div className="admin-field-grid">
            <SelectField
              label="Variant"
              name="inventoryId"
              required
              options={inventory.map((item) => ({
                value: item.id,
                label: `${item.variant.sku} — ${item.variant.product.translations.find((translation) => translation.locale === "en")?.name ?? item.variant.product.internalName}`,
              }))}
            />
            <Field
              label="Quantity change"
              name="quantity"
              type="number"
              required
            />
            <SelectField
              label="Reason"
              name="reason"
              required
              options={[
                "Supplier delivery",
                "Manual correction",
                "Damaged stock",
                "Expired stock",
                "Returned stock",
                "Order adjustment",
                "Stock count correction",
              ].map((value) => ({ value, label: value }))}
            />
            <TextField label="Internal note" name="internalNote" />
          </div>
        </AdminSection>
      </AdminForm>
    </div>
  );
}
