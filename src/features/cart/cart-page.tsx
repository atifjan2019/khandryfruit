"use client";

import { useEffect, useState } from "react";
import { Gift, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";

import type { AppLocale } from "@/config/site";
import { localizedPath } from "@/config/routes";
import { useCart } from "@/features/cart/store";
import { formatMoney } from "@/lib/commerce/money";
import { previewCartAction, type CartPreview } from "@/server/actions/checkout";

type PricedCart = Extract<CartPreview, { ok: true }>;

export function CartPageClient({ locale }: { locale: AppLocale }) {
  const { items, giftBoxes, update, remove, removeGiftBox } = useCart();
  const tGift = useTranslations("giftBoxCart");
  const de = locale === "de";
  const subtotal =
    items.reduce((sum, item) => sum + item.unitPriceCents * item.quantity, 0) +
    giftBoxes.reduce((sum, line) => sum + line.totalCents * line.quantity, 0);

  // Real shipping / VAT / total come from the server (same pricing as checkout),
  // so the figures shown here match what Stripe finally charges.
  const [priced, setPriced] = useState<PricedCart | null>(null);
  // Starts true (we always price on mount); only flipped false when a result
  // lands, so no synchronous setState runs inside the effect.
  const [pricing, setPricing] = useState(true);
  // Set when a gift box in the cart was already ordered and got pruned.
  const [prunedGiftBox, setPrunedGiftBox] = useState(false);
  useEffect(() => {
    // Empty cart renders the empty state below, so a stale price is never shown.
    if (!items.length && !giftBoxes.length) return;
    let active = true;
    previewCartAction({
      locale,
      lines: items.map(({ variantId, quantity }) => ({ variantId, quantity })),
      giftBoxes: giftBoxes.map(({ configurationId, quantity }) => ({
        configurationId,
        quantity,
      })),
    })
      .then((result) => {
        if (!active) return;
        // Drop gift boxes the server can no longer price (already ordered /
        // expired); removing them re-runs this effect to price what remains.
        if (result.unavailableGiftBoxIds.length) {
          setPrunedGiftBox(true);
          result.unavailableGiftBoxIds.forEach(removeGiftBox);
          return;
        }
        setPriced(result.ok ? result : null);
      })
      .catch(() => {
        if (active) setPriced(null);
      })
      .finally(() => {
        if (active) setPricing(false);
      });
    return () => {
      active = false;
    };
  }, [items, giftBoxes, locale, removeGiftBox]);
  const pendingLabel = de ? "Wird berechnet…" : "Calculating…";
  if (!items.length && !giftBoxes.length)
    return (
      <div className="empty-state large">
        <ShoppingBag size={42} />
        <h1>{de ? "Ihr Warenkorb ist leer" : "Your cart is empty"}</h1>
        <p>
          {prunedGiftBox
            ? de
              ? "Eine bereits bestellte Geschenkbox wurde entfernt. Stellen Sie bei Bedarf eine neue zusammen."
              : "A gift box that was already ordered has been removed. Build a new one if you like."
            : de
              ? "Entdecken Sie unsere Auswahl und fügen Sie eine Variante hinzu."
              : "Explore the selection and add a product variant."}
        </p>
        <a className="button" href={`/${locale}/shop`}>
          {de ? "Zum Shop" : "Browse shop"}
        </a>
      </div>
    );
  return (
    <div className="cart-layout">
      <section
        className="cart-lines"
        aria-label={de ? "Warenkorbartikel" : "Cart items"}
      >
        {items.map((item) => (
          <article className="cart-line" key={item.variantId}>
            <div className="cart-thumb">
              <Image src={item.image} alt="" fill sizes="80px" />
            </div>
            <div>
              <h2>{item.name}</h2>
              <p>
                {item.weightGrams >= 1000
                  ? `${item.weightGrams / 1000} kg`
                  : `${item.weightGrams} g`}
              </p>
              <strong>{formatMoney(item.unitPriceCents, locale)}</strong>
            </div>
            <div className="quantity">
              <button
                onClick={() => update(item.variantId, item.quantity - 1)}
                aria-label={de ? "Menge verringern" : "Decrease quantity"}
              >
                <Minus size={15} />
              </button>
              <output>{item.quantity}</output>
              <button
                onClick={() => update(item.variantId, item.quantity + 1)}
                aria-label={de ? "Menge erhöhen" : "Increase quantity"}
              >
                <Plus size={15} />
              </button>
            </div>
            <strong className="line-total">
              {formatMoney(item.unitPriceCents * item.quantity, locale)}
            </strong>
            <button
              className="remove-button"
              onClick={() => remove(item.variantId)}
              aria-label={`${item.name} ${de ? "entfernen" : "remove"}`}
            >
              <Trash2 size={17} />
            </button>
          </article>
        ))}
        {giftBoxes.map((line) => (
          <article className="cart-line" key={line.configurationId}>
            <div className="cart-thumb">
              <Gift size={22} aria-hidden="true" />
            </div>
            <div>
              <h2>
                {tGift("label")} · {line.name}
              </h2>
              <div className="cart-line-meta">
                <span>
                  {tGift("size")}: {line.sizeName}
                </span>
                {line.packagingName && (
                  <span>
                    {tGift("packaging")}: {line.packagingName}
                  </span>
                )}
                {line.giftMessage && (
                  <span>
                    {tGift("message")}: “{line.giftMessage}”
                  </span>
                )}
              </div>
              <p>{tGift("contents")}:</p>
              <ul className="cart-gift-contents">
                {line.items.map((item, index) => (
                  <li key={`${line.configurationId}-${index}`}>
                    {item.quantity} × {item.name} (
                    {item.weightGrams >= 1000
                      ? `${item.weightGrams / 1000} kg`
                      : `${item.weightGrams} g`}
                    )
                  </li>
                ))}
              </ul>
              <div className="cart-line-actions">
                <a
                  className="text-link"
                  href={`/${locale}${localizedPath("giftBoxBuilder", locale)}?edit=${line.configurationId}`}
                >
                  {tGift("edit")}
                </a>
              </div>
            </div>
            <strong className="line-total">
              {formatMoney(line.totalCents * line.quantity, locale)}
            </strong>
            <button
              className="remove-button"
              onClick={() => removeGiftBox(line.configurationId)}
              aria-label={`${line.name} ${tGift("remove")}`}
            >
              <Trash2 size={17} />
            </button>
          </article>
        ))}
      </section>
      <aside className="order-summary">
        <h2>{de ? "Zusammenfassung" : "Summary"}</h2>
        {prunedGiftBox && (
          <p className="summary-notice">
            {de
              ? "Eine bereits bestellte Geschenkbox wurde aus dem Warenkorb entfernt."
              : "A gift box that was already ordered has been removed from your cart."}
          </p>
        )}
        <dl>
          <div>
            <dt>{de ? "Zwischensumme" : "Subtotal"}</dt>
            <dd>{formatMoney(priced?.subtotalCents ?? subtotal, locale)}</dd>
          </div>
          <div>
            <dt>{de ? "Versand" : "Shipping"}</dt>
            <dd>
              {priced
                ? priced.shippingCents === 0
                  ? de
                    ? "Kostenlos"
                    : "Free"
                  : formatMoney(priced.shippingCents, locale)
                : pricing
                  ? pendingLabel
                  : de
                    ? "Im nächsten Schritt"
                    : "Next step"}
            </dd>
          </div>
          <div>
            <dt>{de ? "Enthaltene MwSt." : "Included VAT"}</dt>
            <dd>
              {priced
                ? formatMoney(priced.taxCents, locale)
                : pricing
                  ? pendingLabel
                  : de
                    ? "Wird serverseitig berechnet"
                    : "Calculated server-side"}
            </dd>
          </div>
        </dl>
        <div className="summary-total">
          <span>{de ? "Gesamt" : "Total"}</span>
          <strong>{formatMoney(priced?.totalCents ?? subtotal, locale)}</strong>
        </div>
        {priced && priced.shippingCents > 0 && (
          <p className="summary-hint">
            {de
              ? "Kostenloser Versand ab 60 €."
              : "Free shipping on orders over €60."}
          </p>
        )}
        <a className="button full" href={`/${locale}/checkout`}>
          {de ? "Weiter zur Kasse" : "Continue to checkout"}
        </a>
        <small>
          {de
            ? "Alle Preise, Rabatte, Versandkosten und Bestände werden vor Stripe erneut auf dem Server geprüft."
            : "All prices, discounts, shipping and stock are revalidated on the server before Stripe."}
        </small>
      </aside>
    </div>
  );
}
