export type PublicationInput = {
  germanName?: string;
  germanSlug?: string;
  englishName?: string;
  englishSlug?: string;
  categoryId?: string;
  variants: {
    priceCents: number;
    weightGrams: number;
    inventoryConfigured: boolean;
    sku?: string;
    available: number;
    backorderAllowed: boolean;
  }[];
  ingredientsDe?: string;
  allergenDe?: string;
  storageDe?: string;
  ingredientsEn?: string;
  allergenEn?: string;
  storageEn?: string;
  nutritionComplete: boolean;
  countryOfOrigin?: string;
  responsibleFoodBusiness?: string;
  imageCount: number;
  seoTitleDe?: string;
  metaDescriptionDe?: string;
  seoTitleEn?: string;
  metaDescriptionEn?: string;
  claims: { enabled: boolean; verified: boolean }[];
};
export function productPublicationBlockers(input: PublicationInput) {
  const blockers: string[] = [];
  if (!input.germanName) blockers.push("GERMAN_NAME_REQUIRED");
  if (!input.germanSlug) blockers.push("GERMAN_SLUG_REQUIRED");
  if (!input.englishName || !input.englishSlug)
    blockers.push("ENGLISH_CONTENT_REQUIRED");
  if (!input.categoryId) blockers.push("CATEGORY_REQUIRED");
  if (
    !input.variants.length ||
    input.variants.some(
      (v) =>
        v.priceCents <= 0 ||
        v.weightGrams <= 0 ||
        !v.sku ||
        !v.inventoryConfigured ||
        (v.available <= 0 && !v.backorderAllowed),
    )
  )
    blockers.push("VALID_VARIANT_REQUIRED");
  if (!input.ingredientsDe) blockers.push("INGREDIENTS_REQUIRED");
  if (!input.allergenDe) blockers.push("ALLERGEN_INFORMATION_REQUIRED");
  if (!input.storageDe) blockers.push("STORAGE_REQUIRED");
  if (!input.ingredientsEn || !input.allergenEn || !input.storageEn)
    blockers.push("ENGLISH_FOOD_INFORMATION_REQUIRED");
  if (!input.nutritionComplete) blockers.push("NUTRITION_REQUIRED");
  if (!input.countryOfOrigin) blockers.push("ORIGIN_REQUIRED");
  if (!input.responsibleFoodBusiness)
    blockers.push("RESPONSIBLE_BUSINESS_REQUIRED");
  if (input.imageCount < 1) blockers.push("IMAGE_REQUIRED");
  if (!input.seoTitleDe || !input.metaDescriptionDe)
    blockers.push("GERMAN_SEO_REQUIRED");
  if (!input.seoTitleEn || !input.metaDescriptionEn)
    blockers.push("ENGLISH_SEO_REQUIRED");
  if (input.claims.some((claim) => claim.enabled && !claim.verified))
    blockers.push("UNVERIFIED_CLAIM");
  return blockers;
}
