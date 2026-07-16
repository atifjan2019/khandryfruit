import { db } from "@/lib/db/client";
import { requireAdmin } from "@/server/policies/authorization";

export default async function FaqAdminPage() {
  await requireAdmin("faqs");
  const pages = await db.contentPage.findMany({
    where: {
      OR: [
        { key: { contains: "faq", mode: "insensitive" } },
        {
          translations: {
            some: { slug: { contains: "faq", mode: "insensitive" } },
          },
        },
      ],
    },
    include: { translations: true, blocks: { orderBy: { sortOrder: "asc" } } },
    orderBy: { updatedAt: "desc" },
  });
  return (
    <div className="admin-page-v2">
      <div className="admin-page-heading">
        <div>
          <p className="eyebrow">Content</p>
          <h1>FAQs</h1>
          <p>FAQ pages and ordered bilingual content blocks.</p>
        </div>
      </div>
      {pages.map((page) => (
        <section className="admin-card" key={page.id}>
          <header>
            <h2>
              {page.translations.find((item) => item.locale === "en")?.title ??
                page.key}
            </h2>
            <span className="admin-status">{page.status}</span>
          </header>
          <p>
            {page.translations
              .map((item) => item.locale.toUpperCase())
              .join(", ") || "Translations missing"}{" "}
            · {page.blocks.length} blocks
          </p>
        </section>
      ))}
      {!pages.length && (
        <p className="admin-empty">No FAQ content records exist.</p>
      )}
    </div>
  );
}
