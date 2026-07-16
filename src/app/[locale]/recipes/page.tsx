import type { Metadata } from "next";
import { Clock, Users } from "lucide-react";
import { notFound } from "next/navigation";

import { isLocale } from "@/config/site";
import { db } from "@/lib/db/client";
import { env } from "@/lib/env";
import { Link } from "@/i18n/navigation";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/recipes">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return {
    title:
      locale === "de" ? "Rezepte & Servierideen" : "Recipes & serving ideas",
    description:
      locale === "de"
        ? "Entdecken Sie geprüfte Rezepte und Servierideen mit Trockenfrüchten."
        : "Discover reviewed recipes and serving ideas featuring dry fruits.",
  };
}

async function publishedRecipes(locale: "de" | "en") {
  if (!env.DATABASE_URL) return [];
  try {
    return await db.recipe.findMany({
      where: {
        status: "PUBLISHED",
        publishedAt: { lte: new Date() },
        translations: { some: { locale } },
      },
      select: {
        id: true,
        imageUrl: true,
        prepMinutes: true,
        cookMinutes: true,
        servings: true,
        translations: {
          where: { locale },
          select: { title: true, description: true, slug: true },
        },
      },
      orderBy: { publishedAt: "desc" },
    });
  } catch (error) {
    if (env.NODE_ENV === "production") throw error;
    return [];
  }
}

export default async function RecipesPage({
  params,
}: PageProps<"/[locale]/recipes">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const recipes = await publishedRecipes(locale);
  const de = locale === "de";

  return (
    <main className="section container">
      <header className="page-hero">
        <p className="eyebrow">
          {de ? "Ideen für Ihre Auswahl" : "Ideas for your selection"}
        </p>
        <h1>{de ? "Rezepte & Servierideen" : "Recipes & serving ideas"}</h1>
        <p>
          {de
            ? "Redaktionell geprüfte Ideen für Trockenfrüchte – ohne medizinische Wirkversprechen."
            : "Editorially reviewed ways to enjoy dry fruits, without medical outcome claims."}
        </p>
      </header>

      {recipes.length ? (
        <div className="feature-grid">
          {recipes.map((recipe) => {
            const translation = recipe.translations[0];
            if (!translation) return null;
            const minutes =
              (recipe.prepMinutes ?? 0) + (recipe.cookMinutes ?? 0);
            return (
              <article className="feature-card" key={recipe.id}>
                <p className="eyebrow">{de ? "Rezept" : "Recipe"}</p>
                <h2>{translation.title}</h2>
                <p>{translation.description}</p>
                <p className="recipe-meta">
                  {minutes > 0 && (
                    <span>
                      <Clock size={16} /> {minutes} min
                    </span>
                  )}
                  {recipe.servings && (
                    <span>
                      <Users size={16} /> {recipe.servings}
                    </span>
                  )}
                </p>
              </article>
            );
          })}
        </div>
      ) : (
        <section className="empty-state large">
          <h2>
            {de ? "Rezepte werden vorbereitet" : "Recipes are being prepared"}
          </h2>
          <p>
            {de
              ? "Hier erscheinen Rezepte erst nach vollständiger redaktioneller Prüfung in der gewählten Sprache."
              : "Recipes appear here only after complete editorial review in the selected language."}
          </p>
          <Link className="button" href="/shop" locale={locale}>
            {de ? "Produkte entdecken" : "Explore products"}
          </Link>
        </section>
      )}
    </main>
  );
}
