"use client";

import { useState, type ReactNode } from "react";
import { ArrowLeft, SlidersHorizontal } from "lucide-react";
import { useTranslations } from "next-intl";

import type { AppLocale } from "@/config/site";
import { useRouter } from "@/i18n/navigation";
import { formatMoney } from "@/lib/commerce/money";
import type {
  GiftBoxBuilderProduct,
  GiftBoxBuilderTemplate,
  GiftBoxPackagingChoice,
} from "@/types/gift-box";
import { FixedGiftBoxPurchase } from "./fixed-box-purchase";
import { GiftBoxBuilder, type BuilderInitialState } from "./builder";

/**
 * The switchable main area of a curated gift-box page.
 *
 * A curated box is a starting point, not a fixed purchase: the customer opens
 * the builder (pre-filled with this box's contents), adjusts packaging, items,
 * size and message, then adds to the cart. So the product view leads straight
 * into the builder rather than offering its own add-to-cart. Customising takes
 * the full page width, which the builder's two-column layout needs.
 *
 * Adding from the builder redirects to the cart, so the customer never lands on
 * a bare success panel.
 *
 * The rare box that cannot be mapped onto a builder size falls back to a plain
 * fixed purchase so it can still be bought.
 */
export function GiftBoxDetailMain({
  locale,
  slug,
  available,
  basePriceCents,
  packaging,
  templates,
  products,
  initial,
  boxName,
  gallery,
  summary,
  backLink,
}: {
  locale: AppLocale;
  slug: string;
  available: boolean;
  basePriceCents: number;
  packaging: GiftBoxPackagingChoice[];
  templates: GiftBoxBuilderTemplate[];
  products: GiftBoxBuilderProduct[];
  initial: BuilderInitialState | null;
  boxName: string;
  gallery: ReactNode;
  summary: ReactNode;
  backLink: ReactNode;
}) {
  const t = useTranslations("giftBoxes.detail");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [customising, setCustomising] = useState(false);
  const canCustomise = initial !== null && products.length > 0;

  if (customising && canCustomise)
    return (
      <div className="gift-box-customise">
        <button
          type="button"
          className="text-link gift-box-customise-back"
          onClick={() => setCustomising(false)}
        >
          <ArrowLeft size={15} /> {t("customiseBack")}
        </button>
        <div className="gift-box-customise-head">
          <h1>{t("customiseHeading", { name: boxName })}</h1>
          <p className="lead-copy">{t("customiseLead")}</p>
        </div>
        <GiftBoxBuilder
          locale={locale}
          templates={templates}
          products={products}
          packaging={packaging}
          initial={initial}
          onAdded={() => router.push("/cart")}
        />
      </div>
    );

  return (
    <div className="product-main">
      {gallery}
      <div className="product-info">
        {summary}
        <div className="purchase-panel">
          <div className="purchase-price">
            <strong>{formatMoney(basePriceCents, locale)}</strong>
            <span className="muted">{t("priceNote")}</span>
          </div>
          <p className="stock-line">
            {available ? tCommon("inStock") : t("outOfStock")}
          </p>
          {canCustomise ? (
            <>
              <button
                type="button"
                className="button full gift-box-customise-toggle"
                onClick={() => setCustomising(true)}
                disabled={!available}
              >
                <SlidersHorizontal size={16} />{" "}
                {available ? t("customise") : t("outOfStock")}
              </button>
              <p className="muted small-note">{t("customiseHint")}</p>
            </>
          ) : (
            // Fallback: box cannot be edited in the builder, so allow a plain
            // fixed purchase rather than leaving it unbuyable.
            <FixedGiftBoxPurchase
              locale={locale}
              slug={slug}
              available={available}
              basePriceCents={basePriceCents}
              packaging={packaging}
            />
          )}
        </div>
        {backLink}
      </div>
    </div>
  );
}
