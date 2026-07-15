import { describe, expect, it } from "vitest";
import { productPublicationBlockers } from "./publication";
describe("product publication", () => {
  it("blocks incomplete food products", () => {
    const blockers = productPublicationBlockers({
      variants: [],
      nutritionComplete: false,
      imageCount: 0,
      claims: [{ enabled: true, verified: false }],
    });
    expect(blockers).toContain("NUTRITION_REQUIRED");
    expect(blockers).toContain("UNVERIFIED_CLAIM");
  });
  it("allows a complete verified product", () =>
    expect(
      productPublicationBlockers({
        germanName: "Feigen",
        germanSlug: "feigen",
        categoryId: "cat",
        variants: [
          { priceCents: 1299, weightGrams: 500, inventoryConfigured: true },
        ],
        ingredientsDe: "Feigen",
        allergenDe: "Keine bekannten",
        nutritionComplete: true,
        countryOfOrigin: "Afghanistan",
        responsibleFoodBusiness: "Verified business",
        imageCount: 1,
        seoTitleDe: "Feigen kaufen",
        metaDescriptionDe: "Afghanische Feigen",
        claims: [{ enabled: false, verified: false }],
      }),
    ).toEqual([]));
});
