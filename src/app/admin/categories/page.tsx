import {
  CategoryManager,
  type CategoryRow,
} from "@/features/admin/category-manager";
import { db } from "@/lib/db/client";
import { requireAdmin } from "@/server/policies/authorization";

const emptyTranslation = {
  name: "",
  slug: "",
  description: "",
  seoTitle: "",
  metaDescription: "",
};

export default async function CategoriesPage() {
  await requireAdmin("categories");
  const categories = await db.category.findMany({
    include: { translations: true, _count: { select: { products: true } } },
    orderBy: [{ sortOrder: "asc" }, { internalName: "asc" }],
  });

  const rows: CategoryRow[] = categories.map((category) => {
    const translation = (locale: "de" | "en") => {
      const record = category.translations.find(
        (item) => item.locale === locale,
      );
      return record
        ? {
            name: record.name,
            slug: record.slug,
            description: record.description ?? "",
            seoTitle: record.seoTitle ?? "",
            metaDescription: record.metaDescription ?? "",
          }
        : { ...emptyTranslation };
    };
    return {
      id: category.id,
      internalName: category.internalName,
      active: category.active,
      productCount: category._count.products,
      parentId: category.parentId,
      de: translation("de"),
      en: translation("en"),
    };
  });

  return <CategoryManager categories={rows} />;
}
