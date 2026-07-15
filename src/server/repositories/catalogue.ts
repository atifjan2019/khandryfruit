import "server-only";

import type { AppLocale } from "@/config/site";
import { db } from "@/lib/db/client";
import { env } from "@/lib/env";
import type { CatalogueProduct } from "@/types/commerce";

const developmentProducts: CatalogueProduct[] = [
  {
    id: "dev-black-raisins",
    slug: "schwarze-rosinen",
    name: "Schwarze Rosinen",
    shortDescription:
      "Dunkle Rosinen aus Kabul mit weicher Textur und ausgewogenem Aroma.",
    description:
      "Ein Entwicklungsbeispiel auf Basis der bestätigten Herkunft Kabul. Produkt- und Lebensmitteldaten müssen vor Veröffentlichung geprüft werden.",
    ingredients: "[ZUTATEN VOR VERÖFFENTLICHUNG BESTÄTIGEN]",
    allergenStatement: "[ALLERGENINFORMATION ERFORDERLICH]",
    storageInstructions: "[LAGERHINWEISE ERFORDERLICH]",
    originCountry: "Afghanistan",
    originRegion: "Kabul",
    image: "/images/product-black-raisins.jpg",
    imageAlt: "Schwarze Rosinen in einer kleinen Schale",
    category: "Rosinen",
    categorySlug: "rosinen",
    featured: true,
    bestseller: true,
    status: "DRAFT",
    variants: [
      {
        id: "dev-black-500",
        sku: "DEV-RAISIN-BLK-500",
        weightGrams: 500,
        priceCents: 899,
        vatRateBps: 700,
        available: 20,
        active: true,
      },
      {
        id: "dev-black-1000",
        sku: "DEV-RAISIN-BLK-1000",
        weightGrams: 1000,
        priceCents: 1599,
        vatRateBps: 700,
        available: 8,
        active: true,
      },
    ],
  },
  {
    id: "dev-green-raisins",
    slug: "gruene-rosinen",
    name: "Grüne Rosinen",
    shortDescription:
      "Helle afghanische Rosinen aus Kabul, als Entwicklungsprodukt angelegt.",
    description:
      "Herkunftsbeispiel bestätigt; alle weiteren Angaben sind vor dem Verkauf zu vervollständigen.",
    ingredients: "[ZUTATEN VOR VERÖFFENTLICHUNG BESTÄTIGEN]",
    allergenStatement: "[ALLERGENINFORMATION ERFORDERLICH]",
    storageInstructions: "[LAGERHINWEISE ERFORDERLICH]",
    originCountry: "Afghanistan",
    originRegion: "Kabul",
    image: "/images/product-green-raisins.jpg",
    imageAlt: "Grüne Rosinen auf hellem Untergrund",
    category: "Rosinen",
    categorySlug: "rosinen",
    featured: true,
    bestseller: false,
    status: "DRAFT",
    variants: [
      {
        id: "dev-green-500",
        sku: "DEV-RAISIN-GRN-500",
        weightGrams: 500,
        priceCents: 999,
        vatRateBps: 700,
        available: 16,
        active: true,
      },
    ],
  },
  {
    id: "dev-figs",
    slug: "afghanische-feigen",
    name: "Afghanische Feigen",
    shortDescription:
      "Feigen aus Kandahar, für den Entwicklungskatalog angelegt.",
    description:
      "Die Region Kandahar ist bestätigt. Lebensmittel-, Preis- und Bilddaten benötigen die Kundenfreigabe.",
    ingredients: "[ZUTATEN VOR VERÖFFENTLICHUNG BESTÄTIGEN]",
    allergenStatement: "[ALLERGENINFORMATION ERFORDERLICH]",
    storageInstructions: "[LAGERHINWEISE ERFORDERLICH]",
    originCountry: "Afghanistan",
    originRegion: "Kandahar",
    image: "/images/product-figs.jpg",
    imageAlt: "Getrocknete Feigen in natürlichem Licht",
    category: "Feigen",
    categorySlug: "feigen",
    featured: true,
    bestseller: true,
    status: "DRAFT",
    variants: [
      {
        id: "dev-fig-500",
        sku: "DEV-FIG-500",
        weightGrams: 500,
        priceCents: 1299,
        vatRateBps: 700,
        available: 12,
        active: true,
      },
    ],
  },
  {
    id: "dev-mulberries",
    slug: "getrocknete-maulbeeren",
    name: "Getrocknete Maulbeeren",
    shortDescription:
      "Maulbeeren aus der Region Shamali, als Entwicklungsbeispiel.",
    description:
      "Die Herkunftsregion ist bestätigt; die übrigen Pflichtangaben sind noch nicht freigegeben.",
    ingredients: "[ZUTATEN VOR VERÖFFENTLICHUNG BESTÄTIGEN]",
    allergenStatement: "[ALLERGENINFORMATION ERFORDERLICH]",
    storageInstructions: "[LAGERHINWEISE ERFORDERLICH]",
    originCountry: "Afghanistan",
    originRegion: "Shamali",
    image: "/images/product-mulberries.jpg",
    imageAlt: "Getrocknete Maulbeeren in einer Schale",
    category: "Maulbeeren",
    categorySlug: "maulbeeren",
    featured: true,
    bestseller: false,
    status: "DRAFT",
    variants: [
      {
        id: "dev-mulberry-500",
        sku: "DEV-MUL-500",
        weightGrams: 500,
        priceCents: 1099,
        vatRateBps: 700,
        available: 10,
        active: true,
      },
    ],
  },
  {
    id: "dev-peaches",
    slug: "getrocknete-pfirsiche",
    name: "Getrocknete Pfirsiche",
    shortDescription:
      "Getrocknete Pfirsiche aus Logar, als Entwicklungsbeispiel.",
    description:
      "Logar ist als Herkunft bestätigt; Pflichtdaten und Verkaufspreis müssen noch geprüft werden.",
    ingredients: "[ZUTATEN VOR VERÖFFENTLICHUNG BESTÄTIGEN]",
    allergenStatement: "[ALLERGENINFORMATION ERFORDERLICH]",
    storageInstructions: "[LAGERHINWEISE ERFORDERLICH]",
    originCountry: "Afghanistan",
    originRegion: "Logar",
    image: "/images/product-peaches.jpg",
    imageAlt: "Getrocknete Pfirsichstücke",
    category: "Pfirsiche",
    categorySlug: "pfirsiche",
    featured: false,
    bestseller: false,
    status: "DRAFT",
    variants: [
      {
        id: "dev-peach-500",
        sku: "DEV-PEACH-500",
        weightGrams: 500,
        priceCents: 1199,
        vatRateBps: 700,
        available: 10,
        active: true,
      },
    ],
  },
  {
    id: "dev-apricots",
    slug: "getrocknete-aprikosen",
    name: "Getrocknete Aprikosen",
    shortDescription:
      "Sorgfältig präsentierte Aprikosen als unvollständiges Entwicklungsprodukt.",
    description:
      "Dieses Produkt ist noch nicht für den Verkauf freigegeben; Herkunft und Lebensmitteldaten fehlen.",
    ingredients: "[ZUTATEN VOR VERÖFFENTLICHUNG BESTÄTIGEN]",
    allergenStatement: "[ALLERGENINFORMATION ERFORDERLICH]",
    storageInstructions: "[LAGERHINWEISE ERFORDERLICH]",
    originCountry: "Afghanistan",
    originRegion: "[REGION ERFORDERLICH]",
    image: "/images/product-apricots.jpg",
    imageAlt: "Getrocknete Aprikosen",
    category: "Aprikosen",
    categorySlug: "aprikosen",
    featured: false,
    bestseller: false,
    status: "DRAFT",
    variants: [
      {
        id: "dev-apricot-500",
        sku: "DEV-APRICOT-500",
        weightGrams: 500,
        priceCents: 999,
        vatRateBps: 700,
        available: 10,
        active: true,
      },
    ],
  },
];

function localiseDevelopment(
  product: CatalogueProduct,
  locale: AppLocale,
): CatalogueProduct {
  if (locale === "de") return product;
  const english: Record<string, [string, string, string]> = {
    "dev-black-raisins": [
      "Black Raisins",
      "Dark raisins from Kabul with a soft texture and balanced character.",
      "Raisins",
    ],
    "dev-green-raisins": [
      "Green Raisins",
      "Light Afghan raisins from Kabul, created as a development product.",
      "Raisins",
    ],
    "dev-figs": [
      "Afghan Figs",
      "Figs from Kandahar, created for the development catalogue.",
      "Figs",
    ],
    "dev-mulberries": [
      "Dried Mulberries",
      "Mulberries from the Shamali region, presented as a development example.",
      "Mulberries",
    ],
    "dev-peaches": [
      "Dried Peaches",
      "Dried peaches from Logar, presented as a development example.",
      "Peaches",
    ],
    "dev-apricots": [
      "Dried Apricots",
      "Carefully presented apricots as an incomplete development product.",
      "Apricots",
    ],
  };
  const values = english[product.id];
  return values
    ? {
        ...product,
        name: values[0],
        shortDescription: values[1],
        category: values[2],
      }
    : product;
}

export async function getProducts(
  locale: AppLocale,
  options?: {
    category?: string;
    query?: string;
    featured?: boolean;
    bestseller?: boolean;
  },
) {
  if (!env.DATABASE_URL)
    return filterDevelopment(
      developmentProducts.map((p) => localiseDevelopment(p, locale)),
      options,
    );
  try {
    const records = await db.product.findMany({
      where: {
        deletedAt: null,
        status:
          env.NODE_ENV === "production"
            ? "ACTIVE"
            : { in: ["ACTIVE", "DRAFT"] },
        featured: options?.featured || undefined,
        bestseller: options?.bestseller || undefined,
        translations: options?.query
          ? {
              some: {
                locale,
                OR: [
                  { name: { contains: options.query, mode: "insensitive" } },
                  { keywords: { has: options.query } },
                ],
              },
            }
          : undefined,
        categories: options?.category
          ? {
              some: {
                category: {
                  translations: { some: { locale, slug: options.category } },
                },
              },
            }
          : undefined,
      },
      include: {
        translations: { where: { locale } },
        variants: {
          where: { active: true },
          include: { inventory: true },
          orderBy: { weightGrams: "asc" },
        },
        images: { orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }] },
        categories: {
          include: {
            category: { include: { translations: { where: { locale } } } },
          },
        },
      },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    });
    return records.flatMap((record) => {
      const tr = record.translations[0];
      if (!tr) return [];
      const category = record.categories[0]?.category.translations[0];
      return [
        {
          id: record.id,
          slug: tr.slug,
          name: tr.name,
          shortDescription: tr.shortDescription,
          description: tr.description,
          ingredients: tr.ingredients,
          allergenStatement: tr.allergenStatement,
          storageInstructions: tr.storageInstructions,
          originCountry: record.countryOfOrigin ?? "",
          originRegion: record.regionOfOrigin ?? "",
          image: record.images[0]?.url ?? "/images/product-placeholder.jpg",
          imageAlt:
            locale === "de"
              ? (record.images[0]?.altDe ?? tr.name)
              : (record.images[0]?.altEn ?? tr.name),
          category: category?.name ?? "",
          categorySlug: category?.slug ?? "",
          featured: record.featured,
          bestseller: record.bestseller,
          status:
            record.status === "ACTIVE"
              ? ("ACTIVE" as const)
              : ("DRAFT" as const),
          variants: record.variants.map((variant) => ({
            id: variant.id,
            sku: variant.sku,
            weightGrams: variant.weightGrams,
            priceCents: variant.priceCents,
            vatRateBps: variant.vatRateBps,
            available:
              (variant.inventory?.onHand ?? 0) -
              (variant.inventory?.reserved ?? 0),
            active: variant.active,
          })),
        },
      ];
    });
  } catch (error) {
    if (env.NODE_ENV === "production") throw error;
    return filterDevelopment(
      developmentProducts.map((p) => localiseDevelopment(p, locale)),
      options,
    );
  }
}

function filterDevelopment(
  products: CatalogueProduct[],
  options?: {
    category?: string;
    query?: string;
    featured?: boolean;
    bestseller?: boolean;
  },
) {
  return products.filter((product) => {
    if (options?.category && product.categorySlug !== options.category)
      return false;
    if (options?.featured && !product.featured) return false;
    if (options?.bestseller && !product.bestseller) return false;
    if (
      options?.query &&
      !`${product.name} ${product.shortDescription} ${product.category}`
        .toLowerCase()
        .includes(options.query.toLowerCase())
    )
      return false;
    return true;
  });
}

export async function getProductBySlug(locale: AppLocale, slug: string) {
  return (
    (await getProducts(locale)).find((product) => product.slug === slug) ?? null
  );
}

export async function getVariantsByIds(locale: AppLocale, ids: string[]) {
  const products = await getProducts(locale);
  return products
    .flatMap((product) =>
      product.variants.map((variant) => ({ product, variant })),
    )
    .filter(({ variant }) => ids.includes(variant.id));
}
