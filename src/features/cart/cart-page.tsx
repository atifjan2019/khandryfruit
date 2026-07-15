"use client";

import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import type { AppLocale } from "@/config/site";
import { useCart } from "@/features/cart/store";
import { formatMoney } from "@/lib/commerce/money";

export function CartPageClient({ locale }: { locale: AppLocale }) {
  const { items, update, remove } = useCart();
  const de = locale === "de";
  const subtotal = items.reduce(
    (sum, item) => sum + item.unitPriceCents * item.quantity,
    0,
  );
  if (!items.length)
    return (
      <div className="empty-state large">
        <ShoppingBag size={42} />
        <h1>{de ? "Ihr Warenkorb ist leer" : "Your cart is empty"}</h1>
        <p>
          {de
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
              <span />
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
      </section>
      <aside className="order-summary">
        <h2>{de ? "Zusammenfassung" : "Summary"}</h2>
        <dl>
          <div>
            <dt>{de ? "Zwischensumme" : "Subtotal"}</dt>
            <dd>{formatMoney(subtotal, locale)}</dd>
          </div>
          <div>
            <dt>{de ? "Versand" : "Shipping"}</dt>
            <dd>{de ? "Im nächsten Schritt" : "Next step"}</dd>
          </div>
          <div>
            <dt>{de ? "Enthaltene MwSt." : "Included VAT"}</dt>
            <dd>
              {de ? "Wird serverseitig berechnet" : "Calculated server-side"}
            </dd>
          </div>
        </dl>
        <div className="summary-total">
          <span>{de ? "Vorläufig gesamt" : "Estimated total"}</span>
          <strong>{formatMoney(subtotal, locale)}</strong>
        </div>
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
