import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductCard } from "@/components/storefront/product-card";
import { isLocale } from "@/config/site";
import { Link } from "@/i18n/navigation";
import { getProducts } from "@/server/repositories/catalogue";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/bestsellers">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return {
    title: locale === "de" ? "Bestseller" : "Bestsellers",
    description:
      locale === "de"
        ? "Entdecken Sie die beliebtesten freigegebenen Trockenfrüchte und Geschenkideen von Khan Dry Fruit."
        : "Discover Khan Dry Fruit’s most popular approved dry fruits and gifting favourites.",
  };
}

export default async function BestsellersPage({
  params,
}: PageProps<"/[locale]/bestsellers">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const products = await getProducts(locale, { bestseller: true });
  const de = locale === "de";

  return (
    <main className="section container">
      <header className="page-hero">
        <p className="eyebrow">Khan Dry Fruit · Duisburg</p>
        <h1>{de ? "Unsere Bestseller" : "Our bestsellers"}</h1>
        <p>
          {de
            ? "Eine Auswahl unserer beliebtesten freigegebenen Produkte. Verfügbarkeit und Preise werden direkt aus dem aktuellen Katalog geladen."
            : "A selection of our most popular approved products. Availability and prices come directly from the current catalogue."}
        </p>
      </header>

      {products.length ? (
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} locale={locale} />
          ))}
        </div>
      ) : (
        <section className="empty-state large">
          <h2>
            {de
              ? "Noch keine Bestseller veröffentlicht"
              : "No bestsellers published yet"}
          </h2>
          <p>
            {de
              ? "Produkte erscheinen hier, sobald sie vollständig geprüft und als Bestseller freigegeben wurden."
              : "Products will appear here after they are fully reviewed and approved as bestsellers."}
          </p>
          <Link className="button" href="/shop" locale={locale}>
            {de ? "Zum gesamten Sortiment" : "Browse the full shop"}
          </Link>
        </section>
      )}
    </main>
  );
}
