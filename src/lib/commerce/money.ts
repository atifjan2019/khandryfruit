import type { AppLocale } from "@/config/site";

export function formatMoney(
  cents: number,
  locale: AppLocale = "de",
  currency = "EUR",
) {
  return new Intl.NumberFormat(locale === "de" ? "de-DE" : "en-DE", {
    style: "currency",
    currency,
  }).format(cents / 100);
}

export function unitPricePerKg(priceCents: number, weightGrams: number) {
  if (!Number.isInteger(priceCents) || priceCents < 0)
    throw new Error("INVALID_PRICE");
  if (!Number.isInteger(weightGrams) || weightGrams <= 0)
    throw new Error("INVALID_WEIGHT");
  return Math.round((priceCents * 1000) / weightGrams);
}

export function includedTax(grossCents: number, vatRateBps: number) {
  if (grossCents < 0 || vatRateBps < 0) throw new Error("INVALID_TAX_INPUT");
  return Math.round(grossCents - grossCents / (1 + vatRateBps / 10_000));
}
