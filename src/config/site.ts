export const locales = ["de", "en"] as const;
export type AppLocale = (typeof locales)[number];

export const defaultLocale: AppLocale = "de";

export const siteConfig = {
  name: "Khan Dry Fruit",
  owner: "Shoaib Khan Safi",
  city: "Duisburg",
  country: "Germany",
  currency: "EUR",
  phoneDisplay: "+49 176 21809185",
  phoneHref: "+4917621809185",
  whatsapp: "4917621809185",
  socialHandle: "@khandryfruit",
} as const;

export function isLocale(value: string): value is AppLocale {
  return locales.includes(value as AppLocale);
}
