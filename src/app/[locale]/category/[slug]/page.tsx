import { notFound } from "next/navigation";
import { ProductCard } from "@/components/storefront/product-card";
import { isLocale } from "@/config/site";
import { getProducts } from "@/server/repositories/catalogue";
export default async function CategoryPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const products = await getProducts(locale, { category: slug });
  const de = locale === "de";
  const title = products[0]?.category ?? slug;
  return (
    <div className="page-shell container">
      <header className="page-hero">
        <p className="eyebrow">{de ? "Kategorie" : "Category"}</p>
        <h1>{title}</h1>
        <p>
          {de
            ? "Entdecken Sie die verfügbaren Sorten und Gewichte. Filterseiten werden zur Vermeidung doppelter Indexierung kontrolliert."
            : "Explore available varieties and weights. Filtered pages are crawl-controlled to avoid duplicate indexing."}
        </p>
      </header>
      <div className="product-grid">
        {products.map((product) => (
          <ProductCard product={product} locale={locale} key={product.id} />
        ))}
      </div>
    </div>
  );
}
