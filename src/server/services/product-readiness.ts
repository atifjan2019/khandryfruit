import "server-only";
import { db } from "@/lib/db/client";
import { productPublicationBlockers } from "@/lib/commerce/publication";
import { isPlaceholder } from "@/lib/i18n/content";

export async function getProductReadiness(productId: string) {
  const product = await db.product.findUnique({
    where: { id: productId },
    include: {
      translations: true,
      variants: { include: { inventory: true } },
      images: true,
      nutrition: true,
      categories: true,
      claims: true,
    },
  });
  if (!product) return null;
  const german = product.translations.find(
    (translation) => translation.locale === "de",
  );
  const english = product.translations.find(
    (translation) => translation.locale === "en",
  );
  const blockers = productPublicationBlockers({
    germanName: german?.name,
    germanSlug: german?.slug,
    englishName: english?.name,
    englishSlug: english?.slug,
    categoryId: product.categories[0]?.categoryId,
    variants: product.variants
      .filter((variant) => variant.active)
      .map((variant) => ({
        priceCents: variant.priceCents,
        weightGrams: variant.weightGrams,
        sku: variant.sku,
        inventoryConfigured: Boolean(variant.inventory),
        available:
          (variant.inventory?.onHand ?? 0) - (variant.inventory?.reserved ?? 0),
        backorderAllowed: variant.inventory?.backorderAllowed ?? false,
      })),
    ingredientsDe: cleanPlaceholder(german?.ingredients),
    allergenDe: cleanPlaceholder(german?.allergenStatement),
    storageDe: cleanPlaceholder(german?.storageInstructions),
    ingredientsEn: cleanPlaceholder(english?.ingredients),
    allergenEn: cleanPlaceholder(english?.allergenStatement),
    storageEn: cleanPlaceholder(english?.storageInstructions),
    nutritionComplete: Boolean(product.nutrition),
    countryOfOrigin: product.countryOfOrigin ?? undefined,
    responsibleFoodBusiness: product.responsibleFoodBusiness ?? undefined,
    imageCount: product.images.length,
    seoTitleDe: german?.seoTitle,
    metaDescriptionDe: german?.metaDescription,
    seoTitleEn: english?.seoTitle,
    metaDescriptionEn: english?.metaDescription,
    claims: product.claims.map((claim) => ({
      enabled: claim.enabled,
      verified: claim.verified,
    })),
  });
  const totalChecks = 16;
  return {
    product,
    blockers,
    score: Math.max(
      0,
      Math.round(
        ((totalChecks - Math.min(blockers.length, totalChecks)) / totalChecks) *
          100,
      ),
    ),
    ready: blockers.length === 0,
  };
}

function cleanPlaceholder(value?: string) {
  return value && !isPlaceholder(value) ? value : undefined;
}

export async function countBlockedProducts() {
  const ids = await db.product.findMany({
    where: { status: { in: ["DRAFT", "ACTIVE"] }, deletedAt: null },
    select: { id: true },
  });
  const results = await Promise.all(
    ids.map(({ id }) => getProductReadiness(id)),
  );
  return results.filter((result) => result && !result.ready).length;
}
