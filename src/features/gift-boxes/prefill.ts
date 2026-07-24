import type { BuilderInitialState } from "./builder";
import type {
  GiftBoxBuilderTemplate,
  GiftBoxCatalogueItem,
} from "@/types/gift-box";

/**
 * Maps a curated gift box onto builder state, so "customise" starts from its
 * contents rather than an empty form.
 *
 * A curated box is a fixed template with its own size; the builder works in
 * sizes the customer can change. We pick the builder size that matches the
 * curated one, falling back to the smallest that can actually hold the
 * contents. Returns null when nothing fits — the caller then leaves the
 * builder empty or hides the option.
 */
export function initialStateFromGiftBox(
  box: Pick<GiftBoxCatalogueItem, "sizeName" | "items">,
  templates: GiftBoxBuilderTemplate[],
): BuilderInitialState | null {
  if (!box.items.length || !templates.length) return null;

  const unitsNeeded = box.items.reduce((sum, item) => sum + item.quantity, 0);
  const bySize = templates.find(
    (template) => template.sizeName === box.sizeName,
  );
  const template =
    bySize && bySize.capacityUnits >= unitsNeeded
      ? bySize
      : [...templates]
          .sort((a, b) => a.capacityUnits - b.capacityUnits)
          .find((entry) => entry.capacityUnits >= unitsNeeded);
  if (!template) return null;

  return {
    replaceConfigurationId: null,
    giftBoxId: template.id,
    packagingOptionId: null,
    occasion: null,
    giftMessage: "",
    items: box.items.map((item) => ({
      variantId: item.variantId,
      quantity: item.quantity,
    })),
  };
}
