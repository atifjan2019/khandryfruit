import { db } from "@/lib/db/client";
import { requireAdmin } from "@/server/policies/authorization";

export default async function RecipesAdminPage() {
  await requireAdmin("recipes");
  const recipes = await db.recipe.findMany({
    include: { translations: true },
    orderBy: { updatedAt: "desc" },
  });
  return (
    <div className="admin-page-v2">
      <div className="admin-page-heading">
        <div>
          <p className="eyebrow">Content</p>
          <h1>Recipes</h1>
          <p>Bilingual recipes and publication state.</p>
        </div>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Locales</th>
              <th>Preparation</th>
              <th>Servings</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {recipes.map((recipe) => (
              <tr key={recipe.id}>
                <td>
                  <strong>
                    {recipe.translations.find((item) => item.locale === "en")
                      ?.title ??
                      recipe.translations[0]?.title ??
                      "Untitled"}
                  </strong>
                </td>
                <td>
                  {recipe.translations
                    .map((item) => item.locale.toUpperCase())
                    .join(", ") || "Missing"}
                </td>
                <td>
                  {(recipe.prepMinutes ?? 0) + (recipe.cookMinutes ?? 0)}{" "}
                  minutes
                </td>
                <td>{recipe.servings ?? "—"}</td>
                <td>
                  <span className="admin-status">{recipe.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!recipes.length && <p className="admin-empty">No recipes exist.</p>}
      </div>
    </div>
  );
}
