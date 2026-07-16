import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ProductForm,
  AdminSection,
  Field,
  Checkbox,
} from "@/components/admin/product-form";
import { AdminForm, ConfirmForm } from "@/components/admin/admin-form";
import { db } from "@/lib/db/client";
import { formatMoney, unitPricePerKg } from "@/lib/commerce/money";
import {
  addProductImageAction,
  createVariantAction,
  setProductStatusAction,
  updateVariantAction,
  upsertNutritionAction,
  updateProductAction,
} from "@/server/actions/admin";
import { requireAdmin } from "@/server/policies/authorization";
import { getProductReadiness } from "@/server/services/product-readiness";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin("products");
  const { id } = await params;
  const [product, categories, readiness] = await Promise.all([
    db.product.findUnique({
      where: { id },
      include: {
        translations: true,
        categories: true,
        variants: {
          include: { inventory: true },
          orderBy: [{ sortOrder: "asc" }, { weightGrams: "asc" }],
        },
        images: true,
        nutrition: true,
        claims: true,
      },
    }),
    db.category.findMany({
      where: { active: true },
      include: { translations: true },
      orderBy: { sortOrder: "asc" },
    }),
    getProductReadiness(id),
  ]);
  if (!product || !readiness) notFound();
  const de = product.translations.find((item) => item.locale === "de");
  return (
    <div className="admin-page-v2">
      <div className="admin-page-heading">
        <div>
          <p className="eyebrow">{product.status}</p>
          <h1>{de?.name ?? product.internalName}</h1>
          <p>Last updated {product.updatedAt.toLocaleString("en-DE")}</p>
        </div>
        <div className="admin-heading-actions">
          {de?.slug && (
            <Link
              className="button secondary"
              href={`/de/product/${de.slug}`}
              target="_blank"
            >
              Preview
            </Link>
          )}
          <ConfirmForm
            action={setProductStatusAction}
            confirmMessage={
              readiness.ready
                ? "Publish this product?"
                : "This product is not ready and publication will be rejected."
            }
          >
            <input type="hidden" name="productId" value={product.id} />
            <input
              type="hidden"
              name="status"
              value={product.status === "ACTIVE" ? "DRAFT" : "ACTIVE"}
            />
            <button className="button" type="submit">
              {product.status === "ACTIVE" ? "Unpublish" : "Publish"}
            </button>
          </ConfirmForm>
        </div>
      </div>
      <section className="readiness-card">
        <div>
          <strong>{readiness.score}%</strong>
          <span>
            <b>Product readiness</b>
            <small>
              {readiness.ready
                ? "All publication checks pass."
                : `${readiness.blockers.length} blockers must be resolved.`}
            </small>
          </span>
        </div>
        <div className="readiness-bar">
          <span style={{ width: `${readiness.score}%` }} />
        </div>
        {readiness.blockers.length > 0 && (
          <ul>
            {readiness.blockers.map((blocker) => (
              <li key={blocker}>
                {blocker.replaceAll("_", " ").toLowerCase()}
              </li>
            ))}
          </ul>
        )}
      </section>
      <ProductForm
        product={product}
        categories={categories}
        action={updateProductAction}
      />
      <section className="admin-form standalone">
        <AdminSection
          title="Variants, prices and inventory"
          description="Prices are stored in euro cents; unit prices are calculated from server-controlled values."
        >
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Weight</th>
                  <th>Price</th>
                  <th>Price/kg</th>
                  <th>On hand</th>
                  <th>Reserved</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {product.variants.map((variant) => (
                  <tr key={variant.id}>
                    <td>
                      <strong>{variant.sku}</strong>
                    </td>
                    <td>{variant.weightGrams} g</td>
                    <td>{formatMoney(variant.priceCents, "en")}</td>
                    <td>
                      {formatMoney(
                        unitPricePerKg(variant.priceCents, variant.weightGrams),
                        "en",
                      )}
                    </td>
                    <td>{variant.inventory?.onHand ?? "—"}</td>
                    <td>{variant.inventory?.reserved ?? "—"}</td>
                    <td>{variant.active ? "Active" : "Inactive"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AdminSection>
      </section>
      <AdminForm action={createVariantAction} submitLabel="Add variant">
        <input type="hidden" name="productId" value={product.id} />
        <AdminSection
          title="Add variant"
          description="Existing order variants are never deleted from this screen."
        >
          <div className="admin-field-grid">
            <Field label="SKU" name="sku" required />
            <Field
              label="Weight (g)"
              name="weightGrams"
              type="number"
              required
              min={1}
            />
            <Field
              label="Shipping weight (g)"
              name="shippingWeightG"
              type="number"
              required
              min={1}
            />
            <Field
              label="Price (cents)"
              name="priceCents"
              type="number"
              required
              min={0}
            />
            <Field
              label="Compare-at price (cents)"
              name="compareAtCents"
              type="number"
              min={0}
            />
            <Field
              label="Cost (cents)"
              name="costCents"
              type="number"
              min={0}
            />
            <Field
              label="VAT rate (basis points)"
              name="vatRateBps"
              type="number"
              required
              defaultValue={700}
              min={0}
              max={10000}
            />
            <Field label="Barcode / EAN" name="barcode" />
            <Field
              label="Sort order"
              name="sortOrder"
              type="number"
              defaultValue={0}
              min={0}
            />
            <Field
              label="Initial stock"
              name="initialStock"
              type="number"
              defaultValue={0}
              min={0}
            />
            <Field
              label="Low-stock threshold"
              name="lowStockThreshold"
              type="number"
              defaultValue={5}
              min={0}
            />
            <Checkbox name="active" label="Active variant" defaultChecked />
          </div>
        </AdminSection>
      </AdminForm>
      {product.variants.map((variant) => (
        <AdminForm
          key={variant.id}
          action={updateVariantAction}
          submitLabel={`Save ${variant.sku}`}
        >
          <input type="hidden" name="productId" value={product.id} />
          <input type="hidden" name="variantId" value={variant.id} />
          <AdminSection
            title={`Edit variant · ${variant.sku}`}
            description="SKU uniqueness, positive weights and integer prices are validated on the server."
          >
            <div className="admin-field-grid">
              <Field
                label="SKU"
                name="sku"
                required
                defaultValue={variant.sku}
              />
              <Field
                label="Weight (g)"
                name="weightGrams"
                type="number"
                required
                min={1}
                defaultValue={variant.weightGrams}
              />
              <Field
                label="Shipping weight (g)"
                name="shippingWeightG"
                type="number"
                required
                min={1}
                defaultValue={variant.shippingWeightG}
              />
              <Field
                label="Price (cents)"
                name="priceCents"
                type="number"
                required
                min={0}
                defaultValue={variant.priceCents}
              />
              <Field
                label="Compare-at price (cents)"
                name="compareAtCents"
                type="number"
                min={0}
                defaultValue={variant.compareAtCents}
              />
              <Field
                label="Cost (cents)"
                name="costCents"
                type="number"
                min={0}
                defaultValue={variant.costCents}
              />
              <Field
                label="VAT rate (basis points)"
                name="vatRateBps"
                type="number"
                required
                min={0}
                max={10000}
                defaultValue={variant.vatRateBps}
              />
              <Field
                label="Barcode / EAN"
                name="barcode"
                defaultValue={variant.barcode}
              />
              <Field
                label="Sort order"
                name="sortOrder"
                type="number"
                min={0}
                defaultValue={variant.sortOrder}
              />
              <Field
                label="Low-stock threshold"
                name="lowStockThreshold"
                type="number"
                min={0}
                defaultValue={variant.inventory?.lowStockThreshold ?? 5}
              />
              <Checkbox
                name="active"
                label="Active variant"
                defaultChecked={variant.active}
              />
            </div>
          </AdminSection>
        </AdminForm>
      ))}
      <div className="admin-two-column">
        <AdminForm action={addProductImageAction} submitLabel="Add image">
          <input type="hidden" name="productId" value={product.id} />
          <AdminSection
            title="Product images"
            description="Use a trusted HTTPS image URL. Upload integration can replace this field later."
          >
            <Field label="Image URL" name="url" type="url" required />
            <Field label="German alternative text" name="altDe" required />
            <Field label="English alternative text" name="altEn" required />
            <Field
              label="Sort order"
              name="sortOrder"
              type="number"
              min={0}
              defaultValue={product.images.length}
            />
            <Checkbox
              name="isPrimary"
              label="Primary image"
              defaultChecked={!product.images.length}
            />
          </AdminSection>
        </AdminForm>
        <section className="admin-card">
          <header>
            <h2>Current images</h2>
          </header>
          {product.images.map((image) => (
            <div className="admin-list-row" key={image.id}>
              <span>
                <strong>
                  {image.isPrimary
                    ? "Primary image"
                    : `Image ${image.sortOrder + 1}`}
                </strong>
                <small>{image.altEn}</small>
              </span>
              <a href={image.url} target="_blank" rel="noreferrer">
                Open
              </a>
            </div>
          ))}
          {!product.images.length && (
            <p className="admin-empty">No product images yet.</p>
          )}
        </section>
      </div>
      <AdminForm
        action={upsertNutritionAction}
        submitLabel="Save nutrition data"
      >
        <input type="hidden" name="productId" value={product.id} />
        <AdminSection
          title="Nutrition per 100 g"
          description="Enter only verified supplier or laboratory data; never estimate food information."
        >
          <div className="admin-field-grid">
            <Field
              label="Energy (kJ)"
              name="energyKj"
              type="number"
              min={0}
              required
              defaultValue={product.nutrition?.energyKj}
            />
            <Field
              label="Energy (kcal)"
              name="energyKcal"
              type="number"
              min={0}
              required
              defaultValue={product.nutrition?.energyKcal}
            />
            <Field
              label="Fat (g)"
              name="fatG"
              type="number"
              min={0}
              required
              defaultValue={product.nutrition?.fatG?.toString()}
            />
            <Field
              label="Saturated fat (g)"
              name="saturatedFatG"
              type="number"
              min={0}
              required
              defaultValue={product.nutrition?.saturatedFatG?.toString()}
            />
            <Field
              label="Carbohydrates (g)"
              name="carbohydratesG"
              type="number"
              min={0}
              required
              defaultValue={product.nutrition?.carbohydratesG?.toString()}
            />
            <Field
              label="Sugars (g)"
              name="sugarsG"
              type="number"
              min={0}
              required
              defaultValue={product.nutrition?.sugarsG?.toString()}
            />
            <Field
              label="Fibre (g)"
              name="fibreG"
              type="number"
              min={0}
              required
              defaultValue={product.nutrition?.fibreG?.toString()}
            />
            <Field
              label="Protein (g)"
              name="proteinG"
              type="number"
              min={0}
              required
              defaultValue={product.nutrition?.proteinG?.toString()}
            />
            <Field
              label="Salt (g)"
              name="saltG"
              type="number"
              min={0}
              required
              defaultValue={product.nutrition?.saltG?.toString()}
            />
            <Checkbox
              name="verified"
              label="Verified against source documentation"
              defaultChecked={Boolean(product.nutrition?.verifiedAt)}
            />
          </div>
        </AdminSection>
      </AdminForm>
      <ConfirmForm
        action={setProductStatusAction}
        confirmMessage="Archive this product? It will leave public catalogues."
        className="danger-zone"
      >
        <input type="hidden" name="productId" value={product.id} />
        <input type="hidden" name="status" value="ARCHIVED" />
        <div>
          <h2>Archive product</h2>
          <p>Historical order lines remain intact.</p>
        </div>
        <button type="submit">Archive</button>
      </ConfirmForm>
    </div>
  );
}
