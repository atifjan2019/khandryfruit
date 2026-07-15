import type { Metadata } from "next";
import { SlidersHorizontal } from "lucide-react";
import { ProductCard } from "@/components/storefront/product-card";
import { isLocale } from "@/config/site";
import { getProducts } from "@/server/repositories/catalogue";
import { notFound } from "next/navigation";

export const metadata: Metadata = { robots: { index: true, follow: true } };

export default async function ShopPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const query = await searchParams;
  const category =
    typeof query.category === "string" ? query.category : undefined;
  const search = typeof query.q === "string" ? query.q : undefined;
  const products = await getProducts(locale, { category, query: search });
  const de = locale === "de";
  return (
    <div className="page-shell container">
      <header className="page-hero">
        <p className="eyebrow">
          {de
            ? "Aus Afghanistan · ausgewählt in Duisburg"
            : "From Afghanistan · selected in Duisburg"}
        </p>
        <h1>{de ? "Trockenfrüchte entdecken" : "Explore dry fruits"}</h1>
        <p>
          {de
            ? "Filtern Sie unsere Entwicklungsprodukte nach Sorte. Artikel werden erst nach vollständiger Lebensmittel- und Geschäftsfreigabe veröffentlicht."
            : "Filter development products by variety. Items are only published after complete food and business approval."}
        </p>
      </header>
      <div className="shop-toolbar">
        <span>
          {products.length} {de ? "Ergebnisse" : "results"}
        </span>
        <button className="filter-button">
          <SlidersHorizontal size={17} /> {de ? "Filter" : "Filters"}
        </button>
        <select aria-label={de ? "Sortierung" : "Sort"}>
          <option>{de ? "Empfohlen" : "Featured"}</option>
          <option>{de ? "Preis aufsteigend" : "Price low to high"}</option>
          <option>{de ? "Name A–Z" : "Name A–Z"}</option>
        </select>
      </div>
      {products.length ? (
        <div className="product-grid shop-grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} locale={locale} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h2>{de ? "Keine Produkte gefunden" : "No products found"}</h2>
          <p>
            {de
              ? "Entfernen Sie Filter oder versuchen Sie einen anderen Suchbegriff."
              : "Clear filters or try another search term."}
          </p>
        </div>
      )}
    </div>
  );
}
