import type { Metadata } from "next";
import { ChevronRight, Heart, MessageCircle } from "lucide-react";
import { notFound } from "next/navigation";
import { ProductPurchase } from "@/components/storefront/product-purchase";
import { isLocale } from "@/config/site";
import { Link } from "@/i18n/navigation";
import { getProductBySlug } from "@/server/repositories/catalogue";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const product = await getProductBySlug(locale, slug);
  if (!product) return {};
  return {
    title: product.name,
    description: product.shortDescription,
    robots:
      product.status === "DRAFT" ? { index: false, follow: false } : undefined,
    alternates: { canonical: `/${locale}/product/${slug}` },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const product = await getProductBySlug(locale, slug);
  if (!product) notFound();
  const de = locale === "de";
  const jsonLd =
    product.status === "ACTIVE"
      ? {
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.name,
          description: product.shortDescription,
          sku: product.variants[0]?.sku,
          brand: { "@type": "Brand", name: "Khan Dry Fruit" },
          offers: product.variants[0]
            ? {
                "@type": "Offer",
                priceCurrency: "EUR",
                price: (product.variants[0].priceCents / 100).toFixed(2),
                availability:
                  product.variants[0].available > 0
                    ? "https://schema.org/InStock"
                    : "https://schema.org/OutOfStock",
              }
            : undefined,
        }
      : null;
  return (
    <div className="product-page container">
      <nav
        className="breadcrumbs"
        aria-label={de ? "Brotkrümelnavigation" : "Breadcrumbs"}
      >
        <Link href="/" locale={locale}>
          Home
        </Link>
        <ChevronRight size={14} />
        <Link href="/shop" locale={locale}>
          Shop
        </Link>
        <ChevronRight size={14} />
        <span>{product.name}</span>
      </nav>
      <div className="product-main">
        <div className={`product-gallery fruit-${product.categorySlug}`}>
          <span className="large-fruit-shape" />
          <span className="gallery-origin">
            {product.originRegion} · {product.originCountry}
          </span>
        </div>
        <div className="product-info">
          <p className="eyebrow">
            {product.category} · {product.originRegion}
          </p>
          <h1>{product.name}</h1>
          <p className="product-lead">{product.shortDescription}</p>
          <div className="product-quick-actions">
            <button>
              <Heart size={17} /> {de ? "Merken" : "Save"}
            </button>
            <a
              href="https://wa.me/4917621809185"
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle size={17} />{" "}
              {de ? "Frage stellen" : "Ask a question"}
            </a>
          </div>
          <ProductPurchase product={product} locale={locale} />
        </div>
      </div>
      <div className="product-details">
        <section>
          <p className="eyebrow">{de ? "Produkt" : "Product"}</p>
          <h2>{de ? "Beschreibung & Herkunft" : "Description & origin"}</h2>
          <p>{product.description}</p>
          <dl>
            <div>
              <dt>{de ? "Ursprungsland" : "Country of origin"}</dt>
              <dd>{product.originCountry}</dd>
            </div>
            <div>
              <dt>{de ? "Region" : "Region"}</dt>
              <dd>{product.originRegion}</dd>
            </div>
            <div>
              <dt>
                {de
                  ? "Verantwortlicher Lebensmittelunternehmer"
                  : "Responsible food business"}
              </dt>
              <dd>
                [
                {de
                  ? "ANGABE VOR VERÖFFENTLICHUNG ERFORDERLICH"
                  : "REQUIRED BEFORE PUBLICATION"}
                ]
              </dd>
            </div>
          </dl>
        </section>
        <section>
          <p className="eyebrow">
            {de ? "Lebensmittelangaben" : "Food information"}
          </p>
          <h2>{de ? "Zutaten & Allergene" : "Ingredients & allergens"}</h2>
          <h3>{de ? "Zutaten" : "Ingredients"}</h3>
          <p>{product.ingredients}</p>
          <h3>{de ? "Allergene" : "Allergens"}</h3>
          <p>{product.allergenStatement}</p>
          <h3>{de ? "Lagerung" : "Storage"}</h3>
          <p>{product.storageInstructions}</p>
        </section>
        <section className="nutrition">
          <p className="eyebrow">{de ? "Je 100 g" : "Per 100g"}</p>
          <h2>{de ? "Nährwerte" : "Nutrition"}</h2>
          <div className="warning-box">
            {de
              ? "[NÄHRWERTDATEN VOR VERÖFFENTLICHUNG ERFORDERLICH]"
              : "[NUTRITION DATA REQUIRED BEFORE PUBLICATION]"}
          </div>
        </section>
      </div>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />
      )}
    </div>
  );
}
