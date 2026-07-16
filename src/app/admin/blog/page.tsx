import { db } from "@/lib/db/client";
import { requireAdmin } from "@/server/policies/authorization";

export default async function BlogAdminPage() {
  await requireAdmin("blog");
  const posts = await db.blogPost.findMany({
    include: { translations: true },
    orderBy: { updatedAt: "desc" },
  });
  return (
    <div className="admin-page-v2">
      <div className="admin-page-heading">
        <div>
          <p className="eyebrow">Content</p>
          <h1>Blog</h1>
          <p>Bilingual publication state and scheduled content.</p>
        </div>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Locales</th>
              <th>Category</th>
              <th>Status</th>
              <th>Publication</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id}>
                <td>
                  <strong>
                    {post.translations.find((item) => item.locale === "en")
                      ?.title ??
                      post.translations[0]?.title ??
                      "Untitled"}
                  </strong>
                </td>
                <td>
                  {post.translations
                    .map((item) => item.locale.toUpperCase())
                    .join(", ") || "Missing"}
                </td>
                <td>{post.category}</td>
                <td>
                  <span className="admin-status">{post.status}</span>
                </td>
                <td>
                  {post.scheduledFor?.toLocaleString("en-GB") ??
                    post.publishedAt?.toLocaleString("en-GB") ??
                    "Not scheduled"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!posts.length && <p className="admin-empty">No blog posts exist.</p>}
      </div>
    </div>
  );
}
