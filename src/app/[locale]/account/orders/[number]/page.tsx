import { notFound } from "next/navigation";
import { ArrowLeft, CreditCard, MapPin, Receipt } from "lucide-react";

import { isLocale, type AppLocale } from "@/config/site";
import { formatAddressLines, formatOrderNumber } from "@/lib/commerce/address";
import { readGiftBoxContents } from "@/lib/commerce/gift-box";
import { formatMoney } from "@/lib/commerce/money";
import {
  orderStatusLabel,
  paymentPillClass,
  paymentStatusLabel,
} from "@/lib/commerce/order-labels";
import { Link } from "@/i18n/navigation";
import { requireUser } from "@/server/policies/authorization";
import { getOrderForUser } from "@/server/services/order-access";

export const metadata = {
  title: "Order details",
  robots: { index: false, follow: false },
};

const t = (locale: AppLocale, de: string, en: string) =>
  locale === "de" ? de : en;

export default async function AccountOrderDetailPage({
  params,
}: {
  params: Promise<{ locale: string; number: string }>;
}) {
  const { locale, number } = await params;
  if (!isLocale(locale)) notFound();
  const session = await requireUser(locale);
  const order = await getOrderForUser(session.user.id, number);
  if (!order) notFound();

  const shipping =
    order.addresses.find((address) => address.type === "SHIPPING") ??
    order.addresses[0];
  const addressLines = shipping ? formatAddressLines(shipping) : [];
  const payment = order.payments[0];
  const refunded = order.payments
    .flatMap((item) => item.refunds)
    .reduce((sum, item) => sum + item.amountCents, 0);
  const orderDate = order.createdAt.toLocaleString(
    locale === "de" ? "de-DE" : "en-GB",
    { dateStyle: "medium", timeStyle: "short", hour12: true },
  );

  return (
    <div className="page-shell account-order-detail container">
      <header className="page-hero account-subhero">
        <Link className="account-back" href="/account/orders" locale={locale}>
          <ArrowLeft size={15} aria-hidden="true" />{" "}
          {t(locale, "Zu den Bestellungen", "Back to orders")}
        </Link>
        <h1>
          {t(locale, "Bestellung", "Order")} {formatOrderNumber(order.number)}
        </h1>
        <div className="account-order-detail-meta">
          <span>{orderDate}</span>
          <span className={`order-pill ${paymentPillClass(order)}`}>
            {paymentStatusLabel(order.paymentStatus, locale)}
          </span>
          <span className="account-order-status">
            {orderStatusLabel(order.status, locale)}
          </span>
        </div>
      </header>

      <div className="order-grid">
        <div className="order-column">
          <section className="order-card">
            <h2>
              <Receipt size={18} aria-hidden="true" />
              {t(locale, "Bestellübersicht", "Order summary")}
            </h2>

            {order.items.map((item) => (
              <div className="order-line" key={item.id}>
                <span className="order-line-qty">{item.quantity}×</span>
                <span className="order-line-body">
                  <strong>{item.productName}</strong>
                  <small>
                    {item.sku} · {item.weightGrams} g ·{" "}
                    {formatMoney(item.unitPriceCents, locale, order.currency)}{" "}
                    {t(locale, "je Stück", "each")}
                  </small>
                </span>
                <span className="order-line-price">
                  {formatMoney(item.lineTotalCents, locale, order.currency)}
                </span>
              </div>
            ))}

            {order.giftBoxOrderItems.map((box) => (
              <div className="order-line" key={box.id}>
                <span className="order-line-qty">{box.quantity}×</span>
                <span className="order-line-body">
                  <strong>{box.giftBoxName}</strong>
                  <small>
                    {t(locale, "Geschenkbox", "Gift box")} · {box.sizeName}
                    {box.packagingName ? ` · ${box.packagingName}` : ""} ·{" "}
                    {formatMoney(box.unitPriceCents, locale, order.currency)}{" "}
                    {t(locale, "je Stück", "each")}
                  </small>
                  {readGiftBoxContents(box.snapshot).map((content) => (
                    <small className="order-line-content" key={content.name}>
                      {content.quantity}× {content.name}
                      {content.weightGrams ? ` (${content.weightGrams} g)` : ""}
                    </small>
                  ))}
                  {box.giftMessage && (
                    <small className="order-line-gift">
                      {t(locale, "Grußtext", "Gift message")}: “
                      {box.giftMessage}”
                    </small>
                  )}
                </span>
                <span className="order-line-price">
                  {formatMoney(box.totalCents, locale, order.currency)}
                </span>
              </div>
            ))}

            <dl className="order-totals">
              <div>
                <dt>{t(locale, "Zwischensumme", "Subtotal")}</dt>
                <dd>
                  {formatMoney(order.subtotalCents, locale, order.currency)}
                </dd>
              </div>
              {order.discountCents > 0 && (
                <div>
                  <dt>
                    {t(locale, "Rabatt", "Discount")}
                    {order.couponCode ? ` · ${order.couponCode}` : ""}
                  </dt>
                  <dd>
                    −{formatMoney(order.discountCents, locale, order.currency)}
                  </dd>
                </div>
              )}
              <div>
                <dt>{t(locale, "Versand", "Shipping")}</dt>
                <dd>
                  {order.shippingCents === 0
                    ? t(locale, "Kostenlos", "Free")
                    : formatMoney(order.shippingCents, locale, order.currency)}
                </dd>
              </div>
              <div className="is-tax">
                <dt>{t(locale, "Enthaltene MwSt.", "VAT included")}</dt>
                <dd>{formatMoney(order.taxCents, locale, order.currency)}</dd>
              </div>
              <div className="is-total">
                <dt>{t(locale, "Gesamtbetrag", "Total")}</dt>
                <dd>{formatMoney(order.totalCents, locale, order.currency)}</dd>
              </div>
              {refunded > 0 && (
                <div>
                  <dt>{t(locale, "Erstattet", "Refunded")}</dt>
                  <dd>−{formatMoney(refunded, locale, order.currency)}</dd>
                </div>
              )}
            </dl>
          </section>
        </div>

        <div className="order-column side">
          <section className="order-card">
            <h2>
              <MapPin size={18} aria-hidden="true" />
              {t(locale, "Lieferadresse", "Delivery address")}
            </h2>
            {addressLines.length ? (
              <address className="order-address">
                {addressLines.map((line, index) => (
                  <span
                    key={line}
                    className={index === 0 ? "order-address-name" : undefined}
                  >
                    {line}
                    <br />
                  </span>
                ))}
                {shipping?.phone && (
                  <span className="order-address-phone">{shipping.phone}</span>
                )}
              </address>
            ) : (
              <p className="order-note">
                {t(
                  locale,
                  "Keine Lieferadresse hinterlegt.",
                  "No delivery address recorded.",
                )}
              </p>
            )}
          </section>

          <section className="order-card">
            <h2>
              <CreditCard size={18} aria-hidden="true" />
              {t(locale, "Zahlung", "Payment")}
            </h2>
            <dl className="order-facts">
              <div>
                <dt>{t(locale, "Status", "Status")}</dt>
                <dd>
                  <span className={`order-pill ${paymentPillClass(order)}`}>
                    {paymentStatusLabel(order.paymentStatus, locale)}
                  </span>
                </dd>
              </div>
              <div>
                <dt>{t(locale, "Betrag", "Amount")}</dt>
                <dd>{formatMoney(order.totalCents, locale, order.currency)}</dd>
              </div>
              {order.paidAt && (
                <div>
                  <dt>{t(locale, "Bezahlt am", "Paid on")}</dt>
                  <dd>
                    {order.paidAt.toLocaleDateString(
                      locale === "de" ? "de-DE" : "en-GB",
                      { dateStyle: "medium" },
                    )}
                  </dd>
                </div>
              )}
              {payment?.failureMessage && (
                <div>
                  <dt>{t(locale, "Hinweis", "Note")}</dt>
                  <dd>{payment.failureMessage}</dd>
                </div>
              )}
            </dl>
          </section>
        </div>
      </div>
    </div>
  );
}
