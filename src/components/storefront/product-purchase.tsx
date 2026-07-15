"use client";

import { useState } from "react";
import { Check, Minus, Plus, ShoppingBag } from "lucide-react";
import type { AppLocale } from "@/config/site";
import { useCart } from "@/features/cart/store";
import { formatMoney, unitPricePerKg } from "@/lib/commerce/money";
import type { CatalogueProduct } from "@/types/commerce";

export function ProductPurchase({
  product,
  locale,
}: {
  product: CatalogueProduct;
  locale: AppLocale;
}) {
  const [variantId, setVariantId] = useState(product.variants[0]?.id ?? "");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const add = useCart((state) => state.add);
  const variant = product.variants.find((item) => item.id === variantId);
  if (!variant) return null;
  const addItem = () => {
    add(
      {
        variantId: variant.id,
        productId: product.id,
        slug: product.slug,
        name: product.name,
        weightGrams: variant.weightGrams,
        unitPriceCents: variant.priceCents,
        image: product.image,
      },
      quantity,
    );
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  };
  return (
    <div className="purchase-panel">
      {product.status === "DRAFT" && (
        <div className="warning-box">
          <strong>
            {locale === "de" ? "Entwicklungsprodukt" : "Development product"}
          </strong>
          <span>
            {locale === "de"
              ? "Preis und Pflichtangaben sind noch nicht freigegeben."
              : "Price and mandatory food data are not approved yet."}
          </span>
        </div>
      )}
      <div className="purchase-price">
        <strong>{formatMoney(variant.priceCents, locale)}</strong>
        <span>
          {formatMoney(
            unitPricePerKg(variant.priceCents, variant.weightGrams),
            locale,
          )}
          /kg
        </span>
      </div>
      <p className="muted">
        {locale === "de"
          ? "inkl. MwSt., sofern anwendbar · zzgl. Versand"
          : "incl. VAT where applicable · plus shipping"}
      </p>
      <fieldset>
        <legend>{locale === "de" ? "Gewicht" : "Weight"}</legend>
        <div className="variant-grid">
          {product.variants.map((item) => (
            <button
              type="button"
              key={item.id}
              className={item.id === variantId ? "selected" : ""}
              onClick={() => setVariantId(item.id)}
            >
              {item.weightGrams >= 1000
                ? `${item.weightGrams / 1000} kg`
                : `${item.weightGrams} g`}
            </button>
          ))}
        </div>
      </fieldset>
      <div className="stock-line">
        <Check size={17} />{" "}
        {variant.available > 0
          ? locale === "de"
            ? "Im Entwicklungslager verfügbar"
            : "Available in development inventory"
          : locale === "de"
            ? "Nicht verfügbar"
            : "Unavailable"}
      </div>
      <div className="purchase-actions">
        <div className="quantity">
          <button
            aria-label={
              locale === "de" ? "Menge verringern" : "Decrease quantity"
            }
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
          >
            <Minus size={16} />
          </button>
          <output aria-live="polite">{quantity}</output>
          <button
            aria-label={locale === "de" ? "Menge erhöhen" : "Increase quantity"}
            onClick={() => setQuantity(Math.min(20, quantity + 1))}
          >
            <Plus size={16} />
          </button>
        </div>
        <button
          className="button add-button"
          onClick={addItem}
          disabled={variant.available < quantity}
        >
          {added ? (
            <>
              <Check size={18} /> {locale === "de" ? "Hinzugefügt" : "Added"}
            </>
          ) : (
            <>
              <ShoppingBag size={18} />{" "}
              {locale === "de" ? "In den Warenkorb" : "Add to cart"}
            </>
          )}
        </button>
      </div>
      <div className="trust-note">
        {locale === "de"
          ? "Sichere Zahlung über Stripe · Preise werden serverseitig geprüft"
          : "Secure Stripe payment · Prices are verified server-side"}
      </div>
    </div>
  );
}
