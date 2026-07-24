"use client";

import { useEffect, useState, type InputHTMLAttributes } from "react";
import { LockKeyhole, Tag, X } from "lucide-react";
import Image from "next/image";
import type { AppLocale } from "@/config/site";
import { useCart } from "@/features/cart/store";
import { formatMoney } from "@/lib/commerce/money";
import { localiseCheckoutError } from "@/lib/i18n/content";
import {
  previewCartAction,
  previewCouponAction,
  type CartPreview,
  type CouponPreview,
} from "@/server/actions/checkout";

function Field({
  id,
  label,
  value,
  onChange,
  type = "text",
  ...rest
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "tel";
} & Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "id" | "value" | "onChange" | "type"
>) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        {...rest}
      />
    </div>
  );
}

const emptyAddress = {
  firstName: "",
  lastName: "",
  company: "",
  line1: "",
  line2: "",
  postalCode: "",
  city: "",
  phone: "",
};
type AddressField = keyof typeof emptyAddress;

export function CheckoutReview({ locale }: { locale: AppLocale }) {
  const items = useCart((state) => state.items);
  const giftBoxes = useCart((state) => state.giftBoxes);
  const removeGiftBox = useCart((state) => state.removeGiftBox);
  const de = locale === "de";
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState(emptyAddress);
  const [accepted, setAccepted] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [couponPending, setCouponPending] = useState(false);
  const [couponError, setCouponError] = useState("");
  // The applied coupon; totals come from the server so the client never
  // computes a discount itself.
  const [coupon, setCoupon] = useState<(CouponPreview & { ok: true }) | null>(
    null,
  );
  const setField = (field: AddressField) => (value: string) =>
    setAddress((current) => ({ ...current, [field]: value }));
  // Mirrors checkoutAddressSchema so the button only submits shippable input.
  const addressComplete =
    address.firstName.trim().length >= 2 &&
    address.lastName.trim().length >= 2 &&
    address.line1.trim().length >= 3 &&
    /^\d{5}$/.test(address.postalCode.trim()) &&
    address.city.trim().length >= 2 &&
    (!address.phone.trim() || /^\+[1-9]\d{7,14}$/.test(address.phone.trim()));
  // Client-side estimate shown instantly; the server re-prices for real below.
  const itemsSubtotal =
    items.reduce((sum, item) => sum + item.unitPriceCents * item.quantity, 0) +
    giftBoxes.reduce((sum, box) => sum + box.totalCents * box.quantity, 0);

  const cartPayload = () => ({
    lines: items.map(({ variantId, quantity }) => ({ variantId, quantity })),
    giftBoxes: giftBoxes.map(({ configurationId, quantity }) => ({
      configurationId,
      quantity,
    })),
  });

  // Authoritative shipping / VAT / total (same pricing as the checkout route),
  // used for the no-coupon breakdown; the coupon preview supersedes it.
  const [priced, setPriced] = useState<(CartPreview & { ok: true }) | null>(
    null,
  );
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
        // Prune gift boxes the server can no longer price so they can't block
        // checkout; removing them re-runs this effect to price what remains.
        if (result.unavailableGiftBoxIds.length) {
          result.unavailableGiftBoxIds.forEach(removeGiftBox);
          return;
        }
        setPriced(result.ok ? result : null);
      })
      .catch(() => {
        if (active) setPriced(null);
      });
    return () => {
      active = false;
    };
  }, [items, giftBoxes, locale, removeGiftBox]);

  // Coupon preview wins (it reflects the discount); otherwise the server cart
  // price; otherwise the instant client estimate.
  const summarySubtotalCents =
    coupon?.subtotalCents ?? priced?.subtotalCents ?? itemsSubtotal;
  const summaryShippingCents = coupon
    ? coupon.shippingCents
    : (priced?.shippingCents ?? null);
  const summaryTotalCents =
    coupon?.totalCents ?? priced?.totalCents ?? itemsSubtotal;
  const summaryHasRealTotal = Boolean(coupon || priced);

  const applyCoupon = async () => {
    const code = couponCode.trim();
    if (!code) return;
    setCouponPending(true);
    setCouponError("");
    try {
      const result = await previewCouponAction({
        locale,
        code,
        ...cartPayload(),
      });
      if (result.ok) {
        setCoupon(result);
        setCouponError("");
      } else {
        setCoupon(null);
        setCouponError(result.reason);
      }
    } catch {
      setCouponError(
        de ? "Code konnte nicht geprüft werden." : "Could not check the code.",
      );
    } finally {
      setCouponPending(false);
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
    setCouponCode("");
    setCouponError("");
  };

  const startCheckout = async () => {
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          locale,
          email,
          countryCode: "DE",
          shippingAddress: address,
          shippingMethodId: "de-standard",
          legalAccepted: accepted,
          ...(coupon ? { couponCode: coupon.code } : {}),
          ...cartPayload(),
        }),
      });
      const result = (await response.json()) as {
        success: boolean;
        data?: { url: string };
        error?: { code: string };
      };
      if (!response.ok || !result.success || !result.data)
        throw new Error(localiseCheckoutError(locale, result.error?.code));
      window.location.assign(result.data.url);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : localiseCheckoutError(locale, "CHECKOUT_FAILED"),
      );
      setPending(false);
    }
  };
  if (!items.length && !giftBoxes.length)
    return (
      <div className="empty-state">
        <h2>{de ? "Keine Artikel zur Kasse" : "No items to check out"}</h2>
        <a href={`/${locale}/shop`} className="button">
          {de ? "Zum Shop" : "Browse shop"}
        </a>
      </div>
    );
  return (
    <div className="checkout-grid">
      <section className="checkout-form">
        <h2>{de ? "Kontaktdaten" : "Contact details"}</h2>
        <label htmlFor="checkout-email">E-Mail</label>
        <input
          id="checkout-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          required
        />
        <h2>{de ? "Lieferadresse" : "Delivery address"}</h2>
        <div className="field-row">
          <Field
            id="checkout-first-name"
            label={de ? "Vorname" : "First name"}
            value={address.firstName}
            onChange={setField("firstName")}
            autoComplete="given-name"
            required
          />
          <Field
            id="checkout-last-name"
            label={de ? "Nachname" : "Last name"}
            value={address.lastName}
            onChange={setField("lastName")}
            autoComplete="family-name"
            required
          />
        </div>
        <Field
          id="checkout-company"
          label={de ? "Firma (optional)" : "Company (optional)"}
          value={address.company}
          onChange={setField("company")}
          autoComplete="organization"
        />
        <Field
          id="checkout-line1"
          label={de ? "Straße und Hausnummer" : "Street and house number"}
          value={address.line1}
          onChange={setField("line1")}
          autoComplete="address-line1"
          required
        />
        <Field
          id="checkout-line2"
          label={de ? "Adresszusatz (optional)" : "Address line 2 (optional)"}
          value={address.line2}
          onChange={setField("line2")}
          autoComplete="address-line2"
        />
        <div className="field-row postal">
          <Field
            id="checkout-postal-code"
            label={de ? "PLZ" : "Postcode"}
            value={address.postalCode}
            onChange={setField("postalCode")}
            autoComplete="postal-code"
            inputMode="numeric"
            required
          />
          <Field
            id="checkout-city"
            label={de ? "Stadt" : "City"}
            value={address.city}
            onChange={setField("city")}
            autoComplete="address-level2"
            required
          />
        </div>
        <Field
          id="checkout-phone"
          label={
            de
              ? "Telefon für Zustellhinweise (optional)"
              : "Phone for delivery updates (optional)"
          }
          value={address.phone}
          onChange={setField("phone")}
          type="tel"
          autoComplete="tel"
          placeholder="+4915112345678"
        />
        <p className="field-hint">
          {de
            ? "Wir liefern derzeit ausschließlich innerhalb Deutschlands."
            : "We currently deliver within Germany only."}
        </p>
        <h2>{de ? "Versand" : "Shipping"}</h2>
        <div className="selected-shipping">
          <span>
            <strong>{de ? "Standard Deutschland" : "Germany standard"}</strong>
            <small>
              {de
                ? "Ziel 3–4 Werktage, noch nicht als Versandversprechen freigegeben"
                : "3–4 working day target, not yet enabled as a shipping promise"}
            </small>
          </span>
          <b>{de ? "berechnet" : "calculated"}</b>
        </div>
        <h2>{de ? "Gutschein" : "Coupon"}</h2>
        <div className="coupon-box">
          {coupon ? (
            <div className="coupon-applied">
              <span>
                <Tag size={16} /> <strong>{coupon.code}</strong>
                <small>
                  {coupon.freeShipping
                    ? de
                      ? "Kostenloser Versand"
                      : "Free shipping"
                    : `−${formatMoney(coupon.discountCents, locale)}`}
                </small>
              </span>
              <button
                type="button"
                className="coupon-remove"
                onClick={removeCoupon}
                aria-label={de ? "Gutschein entfernen" : "Remove coupon"}
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div className="coupon-entry">
              <Tag size={17} className="coupon-icon" aria-hidden="true" />
              <input
                type="text"
                value={couponCode}
                onChange={(event) =>
                  setCouponCode(event.target.value.toUpperCase())
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    applyCoupon();
                  }
                }}
                placeholder={
                  de ? "Gutscheincode eingeben" : "Enter coupon code"
                }
                autoComplete="off"
                maxLength={32}
              />
              <button
                type="button"
                className="button secondary"
                onClick={applyCoupon}
                disabled={couponPending || !couponCode.trim()}
              >
                {couponPending
                  ? de
                    ? "Prüfen…"
                    : "Checking…"
                  : de
                    ? "Anwenden"
                    : "Apply"}
              </button>
            </div>
          )}
          {couponError && (
            <p className="coupon-error" role="alert">
              {couponError}
            </p>
          )}
        </div>

        <label className="consent-row">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(event) => setAccepted(event.target.checked)}
          />
          <span>
            {de
              ? "Ich akzeptiere die AGB und bestätige, die Widerrufsbelehrung gelesen zu haben."
              : "I accept the terms and confirm that I have read the withdrawal information."}
          </span>
        </label>
        {error && (
          <div className="form-error" role="alert">
            {error}
          </div>
        )}
        <button
          className="button full"
          onClick={startCheckout}
          disabled={pending || !accepted || !email || !addressComplete}
        >
          <LockKeyhole size={18} />{" "}
          {pending
            ? de
              ? "Wird geprüft…"
              : "Validating…"
            : de
              ? "Sicher mit Stripe bezahlen"
              : "Pay securely with Stripe"}
        </button>
      </section>
      <aside className="order-summary">
        <h2>{de ? "Ihre Bestellung" : "Your order"}</h2>
        {items.map((item) => (
          <div className="review-line" key={item.variantId}>
            <div className="review-product">
              <Image src={item.image} alt="" width={44} height={44} />
              <span>
                {item.quantity}× {item.name}
                <small>{item.weightGrams} g</small>
              </span>
            </div>
            <strong>
              {formatMoney(item.unitPriceCents * item.quantity, locale)}
            </strong>
          </div>
        ))}
        {giftBoxes.map((box) => (
          <div className="review-line" key={box.configurationId}>
            <span>
              {box.quantity}× {box.name}
              <small>
                {de ? "Geschenkbox" : "Gift box"} · {box.sizeName}
              </small>
            </span>
            <strong>
              {formatMoney(box.totalCents * box.quantity, locale)}
            </strong>
          </div>
        ))}

        <dl className="review-summary">
          <div>
            <dt>{de ? "Zwischensumme" : "Subtotal"}</dt>
            <dd>{formatMoney(summarySubtotalCents, locale)}</dd>
          </div>
          {coupon && (
            <div className="review-discount">
              <dt>
                {de ? "Rabatt" : "Discount"} · {coupon.code}
              </dt>
              <dd>
                {coupon.freeShipping && coupon.discountCents === 0
                  ? de
                    ? "Gratis Versand"
                    : "Free shipping"
                  : `−${formatMoney(coupon.discountCents, locale)}`}
              </dd>
            </div>
          )}
          <div>
            <dt>{de ? "Versand" : "Shipping"}</dt>
            <dd>
              {summaryShippingCents === null
                ? de
                  ? "Wird berechnet…"
                  : "Calculating…"
                : summaryShippingCents === 0
                  ? de
                    ? "Kostenlos"
                    : "Free"
                  : formatMoney(summaryShippingCents, locale)}
            </dd>
          </div>
          {priced && (
            <div>
              <dt>{de ? "Enthaltene MwSt." : "Included VAT"}</dt>
              <dd>{formatMoney(priced.taxCents, locale)}</dd>
            </div>
          )}
          <div className="review-total">
            <dt>
              {summaryHasRealTotal
                ? de
                  ? "Gesamt"
                  : "Total"
                : de
                  ? "Vorläufig gesamt"
                  : "Estimated total"}
            </dt>
            <dd>{formatMoney(summaryTotalCents, locale)}</dd>
          </div>
        </dl>

        <p className="muted small">
          {de
            ? "Alle Beträge werden vor der Zahlung serverseitig geprüft."
            : "All amounts are verified on the server before payment."}
        </p>
      </aside>
    </div>
  );
}
