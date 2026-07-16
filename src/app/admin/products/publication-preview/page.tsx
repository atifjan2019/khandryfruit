import Link from "next/link";

import { db } from "@/lib/db/client";
import { requireAdmin } from "@/server/policies/authorization";
import { getProductReadiness } from "@/server/services/product-readiness";

export default async function PublicationPreviewPage() {
  await requireAdmin("products");
  const products = await db.product.findMany({
    where: { status: "DRAFT", deletedAt: null },
    select: { id: true, internalName: true },
    orderBy: { updatedAt: "desc" },
  });
  const rows = await Promise.all(
    products.map(async (product) => ({
      ...product,
      readiness: await getProductReadiness(product.id),
    })),
  );
  return (
    <div className="admin-page-v2">
      <div className="admin-page-heading">
        <div>
          <p className="eyebrow">Controlled publication</p>
          <h1>Bulk publication preview</h1>
          <p>
            This report never publishes products. Resolve every blocker on the
            individual product before activation.
          </p>
        </div>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Score</th>
              <th>Result</th>
              <th>Blockers</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map(({ id, internalName, readiness }) => (
              <tr key={id}>
                <td>
                  <strong>{internalName}</strong>
                </td>
                <td>{readiness?.score ?? 0}%</td>
                <td>
                  <span className="admin-status">
                    {readiness?.ready ? "Ready" : "Blocked"}
                  </span>
                </td>
                <td>{readiness?.blockers.join(", ") || "None"}</td>
                <td>
                  <Link href={`/admin/products/${id}`}>Review</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!rows.length && (
          <p className="admin-empty">No draft products require review.</p>
        )}
      </div>
    </div>
  );
}
