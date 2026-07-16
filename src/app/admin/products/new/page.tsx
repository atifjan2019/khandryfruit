import { ProductForm } from "@/components/admin/product-form";
import { db } from "@/lib/db/client";
import { createProductAction } from "@/server/actions/admin";
import { requireAdmin } from "@/server/policies/authorization";
export default async function NewProductPage() {
  await requireAdmin("products");
  const categories = await db.category.findMany({
    where: { active: true },
    include: { translations: true },
    orderBy: { sortOrder: "asc" },
  });
  return (
    <div className="admin-page-v2">
      <div className="admin-page-heading">
        <div>
          <p className="eyebrow">Catalogue</p>
          <h1>New product</h1>
          <p>
            Create a safe draft. Missing food information is never invented.
          </p>
        </div>
      </div>
      <ProductForm categories={categories} action={createProductAction} />
    </div>
  );
}
