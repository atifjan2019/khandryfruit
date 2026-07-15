import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/config/site";
import { Link } from "@/i18n/navigation";

const pages: Record<
  string,
  {
    de: [string, string];
    en: [string, string];
    legal?: boolean;
    noindex?: boolean;
  }
> = {
  bestsellers: {
    de: [
      "Bestseller",
      "Unsere als Bestseller markierten Entwicklungsprodukte. Echte Verkaufsdaten ersetzen diese Auswahl nach dem Start.",
    ],
    en: [
      "Bestsellers",
      "Development products currently marked as bestsellers. Genuine sales data will replace this selection after launch.",
    ],
  },
  "gift-boxes": {
    de: [
      "Geschenkboxen",
      "Feste und individuelle Geschenkboxen werden nach Freigabe von Verpackung, Kapazität und Preisen aktiviert.",
    ],
    en: [
      "Gift boxes",
      "Fixed and custom gift boxes will be enabled after packaging, capacity and pricing are approved.",
    ],
  },
  wholesale: {
    de: [
      "Großhandel",
      "Für Händler, Gastronomie und Unternehmen entsteht ein geschützter Bereich mit individuellen Preislisten und Mindestbestellwerten.",
    ],
    en: [
      "Wholesale",
      "A protected trade area with custom price lists and minimum order values is being prepared for retailers, hospitality and businesses.",
    ],
  },
  "our-story": {
    de: [
      "Unsere Geschichte",
      "Khan Dry Fruit präsentiert ausgewählte afghanische Trockenfrüchte in Duisburg. Die vollständige Unternehmensgeschichte wird nach Freigabe durch Shoaib Khan Safi veröffentlicht.",
    ],
    en: [
      "Our story",
      "Khan Dry Fruit presents selected Afghan dry fruits in Duisburg. The complete company story will be published after approval by Shoaib Khan Safi.",
    ],
  },
  sourcing: {
    de: [
      "Herkunft & Qualität",
      "Bestätigte Beispiele: Feigen aus Kandahar, Pfirsiche aus Logar, Rosinen aus Kabul und Maulbeeren aus Shamali. Weitere Aussagen benötigen einen Nachweis.",
    ],
    en: [
      "Sourcing & quality",
      "Confirmed examples: figs from Kandahar, peaches from Logar, raisins from Kabul and mulberries from Shamali. Further claims require evidence.",
    ],
  },
  recipes: {
    de: [
      "Rezepte & Verwendung",
      "Servierideen und Rezepte folgen nach fachlicher Inhaltsprüfung. Es werden keine medizinischen Wirkversprechen veröffentlicht.",
    ],
    en: [
      "Recipes & uses",
      "Serving ideas and recipes will follow editorial review. No medical outcome claims will be published.",
    ],
  },
  blog: {
    de: [
      "Magazin",
      "Herkunft, Lagerung, Sortenkunde und Geschenkideen – redaktionell vorbereitet und vor Veröffentlichung geprüft.",
    ],
    en: [
      "Journal",
      "Sourcing, storage, product guides and gifting ideas—editorially prepared and reviewed before publication.",
    ],
  },
  contact: {
    de: [
      "Kontakt",
      "Telefon und WhatsApp: +49 176 21809185. Geschäftsadresse, E-Mail und Öffnungszeiten werden erst nach Bestätigung veröffentlicht.",
    ],
    en: [
      "Contact",
      "Phone and WhatsApp: +49 176 21809185. Business address, email and opening hours will only be published after confirmation.",
    ],
  },
  faq: {
    de: [
      "Häufige Fragen",
      "Antworten zu Produkten, Zahlung, Versand und Rückgabe werden nach Bestätigung der Geschäftsregeln veröffentlicht.",
    ],
    en: [
      "Frequently asked questions",
      "Answers about products, payment, shipping and returns will be published after business rules are confirmed.",
    ],
  },
  shipping: {
    de: [
      "Versand & Lieferung",
      "[VERSANDDIENSTLEISTER, PREISE UND VERSPRECHEN VOR DEM START BESTÄTIGEN]",
    ],
    en: [
      "Shipping & delivery",
      "[CONFIRM CARRIER, RATES AND PROMISES BEFORE LAUNCH]",
    ],
    legal: true,
  },
  returns: {
    de: [
      "Rückgabe & Erstattung",
      "[RECHTLICH GEPRÜFTE RÜCKGABE- UND ERSTATTUNGSRICHTLINIE VOR DEM START ERFORDERLICH]",
    ],
    en: [
      "Returns & refunds",
      "[LEGALLY REVIEWED RETURNS AND REFUND POLICY REQUIRED BEFORE LAUNCH]",
    ],
    legal: true,
  },
  privacy: {
    de: [
      "Datenschutzerklärung",
      "[RECHTLICH GEPRÜFTE DATENSCHUTZERKLÄRUNG VOR DEM START ERFORDERLICH]",
    ],
    en: [
      "Privacy policy",
      "[LEGALLY REVIEWED PRIVACY POLICY REQUIRED BEFORE LAUNCH]",
    ],
    legal: true,
  },
  terms: {
    de: [
      "Allgemeine Geschäftsbedingungen",
      "[RECHTLICH GEPRÜFTE AGB VOR DEM START ERFORDERLICH]",
    ],
    en: [
      "Terms and conditions",
      "[LEGALLY REVIEWED TERMS REQUIRED BEFORE LAUNCH]",
    ],
    legal: true,
  },
  withdrawal: {
    de: [
      "Widerrufsbelehrung",
      "[RECHTLICH GEPRÜFTE WIDERRUFSBELEHRUNG UND MUSTERFORMULAR VOR DEM START ERFORDERLICH]",
    ],
    en: [
      "Withdrawal policy",
      "[LEGALLY REVIEWED WITHDRAWAL POLICY AND MODEL FORM REQUIRED BEFORE LAUNCH]",
    ],
    legal: true,
  },
  impressum: {
    de: [
      "Impressum",
      "[VOLLSTÄNDIGE ANSCHRIFT, REGISTRIERUNG, USt-ID UND AUFSICHTSANGABEN VOR DEM START ERFORDERLICH]",
    ],
    en: [
      "Legal notice",
      "[FULL ADDRESS, REGISTRATION, VAT ID AND SUPERVISORY DETAILS REQUIRED BEFORE LAUNCH]",
    ],
    legal: true,
  },
  "cookie-settings": {
    de: [
      "Cookie-Einstellungen",
      "Notwendige Cookies sind für Anmeldung und Warenkorb erforderlich. Analyse, Marketing und Präferenzen bleiben deaktiviert, bis Sie ausdrücklich zustimmen.",
    ],
    en: [
      "Cookie settings",
      "Necessary cookies support sign-in and cart functions. Analytics, marketing and preferences remain disabled until you explicitly consent.",
    ],
    noindex: true,
  },
  wishlist: {
    de: [
      "Wunschliste",
      "Melden Sie sich an, um Ihre Wunschliste geräteübergreifend zu speichern.",
    ],
    en: ["Wishlist", "Sign in to save your wishlist across devices."],
    noindex: true,
  },
  search: {
    de: [
      "Suche",
      "Suchen Sie nach Produktnamen, Sorten und Herkunftsregionen.",
    ],
    en: ["Search", "Search by product name, variety and sourcing region."],
    noindex: true,
  },
  "order/cancelled": {
    de: [
      "Zahlung abgebrochen",
      "Ihre Zahlung wurde nicht bestätigt. Reservierter Bestand wird automatisch freigegeben.",
    ],
    en: [
      "Payment cancelled",
      "Your payment was not confirmed. Reserved stock will be released automatically.",
    ],
    noindex: true,
  },
  "order/success": {
    de: [
      "Zahlung wird bestätigt",
      "Wir prüfen die Zahlung anhand des signierten Stripe-Webhooks. Diese Seite allein markiert keine Bestellung als bezahlt.",
    ],
    en: [
      "Your payment is being confirmed",
      "We verify payment through the signed Stripe webhook. This page alone never marks an order as paid.",
    ],
    noindex: true,
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; content: string[] }>;
}): Promise<Metadata> {
  const { locale, content } = await params;
  const page = pages[content.join("/")];
  if (!page || !isLocale(locale)) return {};
  const copy = page[locale];
  return {
    title: copy[0],
    description: copy[1].replace(/\[.*\]/, "Khan Dry Fruit"),
    robots: page.noindex ? { index: false, follow: false } : undefined,
  };
}
export default async function ContentPage({
  params,
}: {
  params: Promise<{ locale: string; content: string[] }>;
}) {
  const { locale, content } = await params;
  if (!isLocale(locale)) notFound();
  const page = pages[content.join("/")];
  if (!page) notFound();
  const [title, body] = page[locale];
  return (
    <div className="content-page container">
      <p className="eyebrow">Khan Dry Fruit · Duisburg</p>
      <h1>{title}</h1>
      {page.legal && (
        <div className="legal-warning">
          {locale === "de"
            ? "Entwicklungsplatzhalter – nicht als Rechtsberatung oder fertiger Rechtstext verwenden."
            : "Development placeholder—not legal advice or production-ready legal text."}
        </div>
      )}
      <p className={body.startsWith("[") ? "placeholder-copy" : "lead-copy"}>
        {body}
      </p>
      <div className="content-actions">
        <Link className="button" href="/shop" locale={locale}>
          {locale === "de" ? "Shop entdecken" : "Explore shop"}
        </Link>
        <Link className="button secondary" href="/contact" locale={locale}>
          {locale === "de" ? "Kontakt" : "Contact"}
        </Link>
      </div>
    </div>
  );
}
