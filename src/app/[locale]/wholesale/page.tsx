import type { Metadata } from "next";
import {
  Boxes,
  Candy,
  ChevronRight,
  Coffee,
  Croissant,
  Gift,
  Phone,
  ReceiptText,
  ShoppingBag,
  Store,
  Truck,
  UtensilsCrossed,
} from "lucide-react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { localizedHref, localizedPath } from "@/config/routes";
import { isLocale, siteConfig, type AppLocale } from "@/config/site";
import { WholesaleForm } from "@/features/wholesale/wholesale-form";
import { Link } from "@/i18n/navigation";
import { getProducts } from "@/server/repositories/catalogue";
import { getSession } from "@/server/policies/authorization";

const CUSTOMER_KEYS = [
  { key: "grocery", icon: Store },
  { key: "retail", icon: ShoppingBag },
  { key: "restaurant", icon: UtensilsCrossed },
  { key: "cafe", icon: Coffee },
  { key: "bakery", icon: Croissant },
  { key: "confectioner", icon: Candy },
  { key: "corporate", icon: Gift },
  { key: "bulk", icon: Boxes },
] as const;

const PROCESS_STEPS = [1, 2, 3, 4] as const;
const FAQ_ITEMS = [1, 2, 3, 4, 5, 6] as const;

const FALLBACK_PRODUCT_OPTIONS: Record<AppLocale, string[]> = {
  de: ["Rosinen", "Feigen", "Maulbeeren", "Aprikosen", "Pfirsiche"],
  en: ["Raisins", "Figs", "Mulberries", "Apricots", "Peaches"],
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = await getTranslations({ locale, namespace: "wholesale" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: {
      canonical: localizedHref("wholesale", locale),
      languages: {
        de: localizedHref("wholesale", "de"),
        en: localizedHref("wholesale", "en"),
      },
    },
  };
}

export default async function WholesalePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations("wholesale");
  const tCommon = await getTranslations("common");
  const tNav = await getTranslations("nav");
  const tProduct = await getTranslations("product");

  const products = await getProducts(locale);
  const categories = Array.from(
    new Set(products.map((product) => product.category).filter(Boolean)),
  );
  const productOptions = categories.length
    ? categories
    : FALLBACK_PRODUCT_OPTIONS[locale];
  // One representative photo per category, taken from the real catalogue so the
  // imagery always matches what is actually on sale.
  const categoryCards = Array.from(
    products
      .reduce((map, product) => {
        if (product.category && !map.has(product.category))
          map.set(product.category, product);
        return map;
      }, new Map<string, (typeof products)[number]>())
      .values(),
  ).slice(0, 6);
  const session = await getSession();
  const isAuthenticated = Boolean(session);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const faqEntries = FAQ_ITEMS.map((n) => ({
    question: t(`faq.q${n}`),
    answer: t(`faq.a${n}`),
  }));
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqEntries.map((entry) => ({
      "@type": "Question",
      name: entry.question,
      acceptedAnswer: { "@type": "Answer", text: entry.answer },
    })),
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: tCommon("breadcrumbHome"),
        item: `${siteUrl}/${locale}`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: tNav("wholesale"),
        item: `${siteUrl}${localizedHref("wholesale", locale)}`,
      },
    ],
  };

  return (
    <div className="wholesale-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <header className="wholesale-hero">
        <div className="container">
          <nav className="breadcrumbs" aria-label={tProduct("breadcrumbs")}>
            <Link href="/" locale={locale}>
              {tCommon("breadcrumbHome")}
            </Link>
            <ChevronRight size={14} />
            <span>{tNav("wholesale")}</span>
          </nav>
          <div className="wholesale-hero-grid">
            <div>
              <p className="eyebrow gold">{t("eyebrow")}</p>
              <h1>{t("title")}</h1>
              <p className="lead-copy">{t("lead")}</p>
              <div className="content-actions">
                <a className="button" href="#apply">
                  {t("ctaButton")}
                </a>
                <Link
                  className="button secondary"
                  href={localizedPath("contact", locale)}
                  locale={locale}
                >
                  {t("contactCta")}
                </Link>
              </div>
            </div>
            <figure className="wholesale-hero-photo">
              <Image
                src="/images/products/almonds.webp"
                alt={
                  locale === "de"
                    ? "Mandeln in Großgebinde-Menge"
                    : "Almonds in bulk quantity"
                }
                fill
                sizes="(max-width: 900px) 100vw, 42vw"
                priority
              />
            </figure>
          </div>
        </div>
      </header>

      <section className="section">
        <div className="wholesale-intro container">
          <div>
            <div className="section-heading">
              <h2>{t("introTitle")}</h2>
            </div>
            <p className="lead-copy">{t("introBody1")}</p>
            <p>{t("introBody2")}</p>
          </div>
          <figure className="wholesale-intro-photo">
            <Image
              src="/images/products/figs.webp"
              alt={
                locale === "de"
                  ? "Getrocknete Feigen aus Kandahar"
                  : "Dried figs from Kandahar"
              }
              fill
              sizes="(max-width: 900px) 100vw, 38vw"
            />
          </figure>
        </div>
      </section>

      <section className="section wholesale-band">
        <div className="container">
          <div className="section-heading">
            <h2>{t("categoriesTitle")}</h2>
          </div>
          <p>{t("categoriesLead")}</p>
          {categoryCards.length > 0 ? (
            <div className="wholesale-range">
              {categoryCards.map((product) => (
                <figure key={product.category}>
                  <Image
                    src={product.image}
                    alt={product.imageAlt}
                    fill
                    sizes="(max-width: 760px) 50vw, 25vw"
                  />
                  <figcaption>{product.category}</figcaption>
                </figure>
              ))}
            </div>
          ) : (
            categories.length > 0 && (
              <ul className="pill-list">
                {categories.map((category) => (
                  <li key={category}>{category}</li>
                ))}
              </ul>
            )
          )}
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-heading">
            <h2>{t("customersTitle")}</h2>
          </div>
          <p>{t("customersLead")}</p>
          <div className="wholesale-customers">
            {CUSTOMER_KEYS.map(({ key, icon: Icon }) => (
              <div key={key}>
                <span className="wholesale-customer-icon">
                  <Icon size={19} />
                </span>
                <h3>{t(`customers.${key}`)}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section wholesale-band-ivory">
        <div className="container">
          <div className="section-heading">
            <h2>{t("processTitle")}</h2>
          </div>
          <ol className="wholesale-steps">
            {PROCESS_STEPS.map((step) => (
              <li key={step}>
                <span className="wholesale-step-number">{step}</span>
                {/* The number renders as the marker, so strip it from the title. */}
                <h3>
                  {t(`process.step${step}Title`).replace(/^\d+\.\s*/, "")}
                </h3>
                <p>{t(`process.step${step}Body`)}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section">
        <div className="wholesale-info container">
          <div>
            <span className="wholesale-customer-icon">
              <Truck size={19} />
            </span>
            <h2>{t("deliveryTitle")}</h2>
            <p>{t("deliveryBody")}</p>
          </div>
          <div>
            <span className="wholesale-customer-icon">
              <ReceiptText size={19} />
            </span>
            <h2>{t("pricingTitle")}</h2>
            <p>{t("pricingBody1")}</p>
            <p>{t("pricingBody2")}</p>
          </div>
        </div>
      </section>

      <section className="section wholesale-band">
        <div className="container">
          <div className="section-heading">
            <h2>{t("faqTitle")}</h2>
          </div>
          <div className="faq-list">
            {faqEntries.map((entry) => (
              <details key={entry.question}>
                <summary>{entry.question}</summary>
                <p>{entry.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-cta">
            <div>
              <h2>{t("ctaTitle")}</h2>
              <p>{t("ctaBody")}</p>
            </div>
            <a className="button light" href="#apply">
              {t("ctaButton")}
            </a>
          </div>
          <div className="wholesale-contact">
            <div>
              <h2>{t("contactTitle")}</h2>
              <p>{t("contactBody")}</p>
            </div>
            <div className="content-actions">
              <a
                className="button secondary"
                href={`tel:${siteConfig.phoneHref}`}
              >
                <Phone size={16} /> {siteConfig.phoneDisplay}
              </a>
              <Link
                className="button secondary"
                href={localizedPath("contact", locale)}
                locale={locale}
              >
                {t("contactCta")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section wholesale-band" id="apply">
        <div className="container">
          <div className="section-heading">
            <h2>{t("applyTitle")}</h2>
          </div>
          <p>{t("applyLead")}</p>
          <p className="muted">{tCommon("requiredFieldsNote")}</p>
          <WholesaleForm
            locale={locale}
            productOptions={productOptions}
            isAuthenticated={isAuthenticated}
          />
        </div>
      </section>
    </div>
  );
}
