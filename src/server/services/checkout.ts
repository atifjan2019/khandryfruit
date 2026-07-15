import "server-only";

import { includedTax } from "@/lib/commerce/money";
import { MockShippingProvider } from "@/lib/commerce/shipping";
import { getVariantsByIds } from "@/server/repositories/catalogue";
import type { AppLocale } from "@/config/site";
import type { CartCalculation, CartLineInput } from "@/types/commerce";

export class CommerceError extends Error {
  constructor(
    readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "CommerceError";
  }
}

export async function calculateCart(
  locale: AppLocale,
  inputs: CartLineInput[],
  countryCode = "DE",
): Promise<CartCalculation> {
  const uniqueIds = [...new Set(inputs.map((line) => line.variantId))];
  const records = await getVariantsByIds(locale, uniqueIds);
  if (records.length !== uniqueIds.length)
    throw new CommerceError(
      "VARIANT_UNAVAILABLE",
      "One or more products are unavailable.",
    );

  const lines = inputs.map((input) => {
    const record = records.find(
      ({ variant }) => variant.id === input.variantId,
    );
    if (!record)
      throw new CommerceError(
        "VARIANT_UNAVAILABLE",
        "Product variant not found.",
      );
    if (
      !Number.isInteger(input.quantity) ||
      input.quantity < 1 ||
      input.quantity > 20
    )
      throw new CommerceError("INVALID_QUANTITY", "Invalid quantity.");
    if (record.variant.available < input.quantity)
      throw new CommerceError(
        "INSUFFICIENT_STOCK",
        `${record.product.name} does not have enough available stock.`,
      );
    const lineTotalCents = record.variant.priceCents * input.quantity;
    return {
      variantId: record.variant.id,
      productId: record.product.id,
      name: record.product.name,
      sku: record.variant.sku,
      weightGrams: record.variant.weightGrams,
      quantity: input.quantity,
      unitPriceCents: record.variant.priceCents,
      lineTotalCents,
      taxCents: includedTax(lineTotalCents, record.variant.vatRateBps),
    };
  });
  const subtotalCents = lines.reduce(
    (sum, line) => sum + line.lineTotalCents,
    0,
  );
  const weightGrams = lines.reduce(
    (sum, line) => sum + line.weightGrams * line.quantity,
    0,
  );
  const [shipping] = await new MockShippingProvider().calculateRates({
    countryCode,
    weightGrams,
    subtotalCents,
  });
  if (!shipping)
    throw new CommerceError(
      "SHIPPING_UNAVAILABLE",
      "Shipping is not available for this destination.",
    );
  const taxCents = lines.reduce((sum, line) => sum + line.taxCents, 0);
  return {
    lines,
    subtotalCents,
    discountCents: 0,
    shippingCents: shipping.priceCents,
    taxCents,
    totalCents: subtotalCents + shipping.priceCents,
    currency: "EUR",
  };
}
