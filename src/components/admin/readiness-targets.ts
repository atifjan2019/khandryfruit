// Maps each product publication blocker code to the DOM id of the form field or
// section that resolves it, so the readiness card can scroll to and focus it.
// The empty string means there is no editable target on this screen.
export const readinessTargetId: Record<string, string> = {
  GERMAN_NAME_REQUIRED: "rf-nameDe",
  GERMAN_SLUG_REQUIRED: "rf-slugDe",
  ENGLISH_CONTENT_REQUIRED: "rf-nameEn",
  CATEGORY_REQUIRED: "rf-categoryId",
  VALID_VARIANT_REQUIRED: "rf-variants",
  INGREDIENTS_REQUIRED: "rf-ingredientsDe",
  ALLERGEN_INFORMATION_REQUIRED: "rf-allergenDe",
  STORAGE_REQUIRED: "rf-storageDe",
  ENGLISH_FOOD_INFORMATION_REQUIRED: "rf-ingredientsEn",
  NUTRITION_REQUIRED: "rf-nutrition",
  ORIGIN_REQUIRED: "rf-countryOfOrigin",
  RESPONSIBLE_BUSINESS_REQUIRED: "rf-responsibleFoodBusiness",
  IMAGE_REQUIRED: "rf-images",
  GERMAN_SEO_REQUIRED: "rf-seoTitleDe",
  ENGLISH_SEO_REQUIRED: "rf-seoTitleEn",
  UNVERIFIED_CLAIM: "",
};
