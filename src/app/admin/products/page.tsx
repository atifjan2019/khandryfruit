import Link from "next/link";
import { Download, Plus, Search } from "lucide-react";
import { db } from "@/lib/db/client";
import { formatMoney } from "@/lib/commerce/money";
import { getProductReadiness } from "@/server/services/product-readiness";
import { requireAdmin } from "@/server/policies/authorization";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdmin("products");
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : "";
  const status =
    typeof params.status === "string" &&
    ["DRAFT", "ACTIVE", "ARCHIVED"].includes(params.status)
      ? (params.status as "DRAFT" | "ACTIVE" | "ARCHIVED")
      : undefined;
  const page = Math.max(1, Number(params.page) || 1);
  const take = 20;
  const where = {
    deletedAt: null,
    status,
    OR: q
      ? [
          { internalName: { contains: q, mode: "insensitive" as const } },
          {
            translations: {
              some: { name: { contains: q, mode: "insensitive" as const } },
            },
          },
          {
            variants: {
              some: { sku: { contains: q, mode: "insensitive" as const } },
            },
          },
        ]
      : undefined,
  };
  const [products, count] = await Promise.all([
    db.product.findMany({
      where,
      include: {
        translations: true,
        variants: { include: { inventory: true } },
        categories: {
          include: {
            category: {
              include: { translations: { where: { locale: "en" } } },
            },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * take,
      take,
    }),
    db.product.count({ where }),
  ]);
  const readiness = new Map(
    await Promise.all(
      products.map(
        async (product) =>
          [product.id, await getProductReadiness(product.id)] as const,
      ),
    ),
  );
  return (
    <div className="admin-page-v2">
      <div className="admin-page-heading">
        <div>
          <p className="eyebrow">Catalogue</p>
          <h1>Products</h1>
          <p>
            {count} products. Drafts remain private until every publication
            requirement passes.
          </p>
        </div>
        <div className="admin-heading-actions">
          <Link className="button secondary" href="/admin/products/export">
            <Download size={17} /> Export CSV
          </Link>
          <Link className="button" href="/admin/products/new">
            <Plus size={17} /> Add product
          </Link>
        </div>
      </div>
      <form className="admin-filterbar">
        <label>
          <Search size={16} />
          <span className="sr-only">Search products</span>
          <input name="q" defaultValue={q} placeholder="Name or SKU" />
        </label>
        <select name="status" defaultValue={status ?? ""}>
          <option value="">All statuses</option>
          <option>DRAFT</option>
          <option>ACTIVE</option>
          <option>ARCHIVED</option>
        </select>
        <button className="button" type="submit">
          Apply filters
        </button>
        <Link href="/admin/products">Clear</Link>
      </form>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Status</th>
              <th>Category</th>
              <th>Variants</th>
              <th>From</th>
              <th>Available</th>
              <th>Readiness</th>
              <th>
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const name =
                product.translations.find((item) => item.locale === "en")
                  ?.name ??
                product.translations.find((item) => item.locale === "de")
                  ?.name ??
                product.internalName;
              const variants = product.variants.filter((item) => item.active);
              const available = variants.reduce(
                (sum, item) =>
                  sum +
                  Math.max(
                    0,
                    (item.inventory?.onHand ?? 0) -
                      (item.inventory?.reserved ?? 0),
                  ),
                0,
              );
              const ready = readiness.get(product.id);
              return (
                <tr key={product.id}>
                  <td>
                    <strong>{name}</strong>
                    <small>{product.internalName}</small>
                  </td>
                  <td>
                    <span
                      className={`status-pill status-${product.status.toLowerCase()}`}
                    >
                      {product.status}
                    </span>
                  </td>
                  <td>
                    {product.categories[0]?.category.translations[0]?.name ??
                      "—"}
                  </td>
                  <td>{variants.length}</td>
                  <td>
                    {variants.length
                      ? formatMoney(
                          Math.min(...variants.map((item) => item.priceCents)),
                          "en",
                        )
                      : "—"}
                  </td>
                  <td>{available}</td>
                  <td>
                    <div className="readiness-mini">
                      <span style={{ width: `${ready?.score ?? 0}%` }} />
                      <b>{ready?.score ?? 0}%</b>
                    </div>
                  </td>
                  <td>
                    <Link
                      className="table-action"
                      href={`/admin/products/${product.id}`}
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!products.length && (
          <div className="admin-empty-state">
            <h2>No products match these filters</h2>
            <p>Clear filters or create a new draft product.</p>
          </div>
        )}
      </div>
      {count > take && (
        <nav className="admin-pagination" aria-label="Product pages">
          {Array.from({ length: Math.ceil(count / take) }, (_, index) => (
            <Link
              className={page === index + 1 ? "active" : ""}
              key={index}
              href={`/admin/products?page=${index + 1}&q=${encodeURIComponent(q)}${status ? `&status=${status}` : ""}`}
            >
              {index + 1}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}
