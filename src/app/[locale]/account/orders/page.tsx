import { notFound } from "next/navigation";
import { ArrowLeft, ChevronRight, PackageOpen } from "lucide-react";

import { isLocale } from "@/config/site";
import { formatOrderNumber } from "@/lib/commerce/address";
import { formatMoney } from "@/lib/commerce/money";
import {
  orderStatusLabel,
  paymentPillClass,
  paymentStatusLabel,
} from "@/lib/commerce/order-labels";
import { Link } from "@/i18n/navigation";
import { requireUser } from "@/server/policies/authorization";
import { getOrdersForUser } from "@/server/services/order-access";

export const metadata = {
  title: "Your orders",
  robots: { index: false, follow: false },
};

export default async function AccountOrdersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const session = await requireUser(locale);
  const orders = await getOrdersForUser(session.user.id);
  const de = locale === "de";

  return (
    <div className="page-shell account-orders container">
      <header className="page-hero account-subhero">
        <Link className="account-back" href="/account" locale={locale}>
          <ArrowLeft size={15} aria-hidden="true" />{" "}
          {de ? "Zum Konto" : "Back to account"}
        </Link>
        <h1>{de ? "Ihre Bestellungen" : "Your orders"}</h1>
        <p>
          {de
            ? "Verlauf und Status Ihrer Bestellungen."
            : "Your order history and current status."}
        </p>
      </header>

      {orders.length ? (
        <div className="account-order-list">
          {orders.map((order) => {
            const itemCount =
              order._count.items + order._count.giftBoxOrderItems;
            return (
              <Link
                key={order.id}
                className="account-order-row"
                href={`/account/orders/${order.number}`}
                locale={locale}
              >
                <div className="account-order-main">
                  <strong>
                    {de ? "Bestellung" : "Order"}{" "}
                    {formatOrderNumber(order.number)}
                  </strong>
                  <small>
                    {order.createdAt.toLocaleDateString(
                      de ? "de-DE" : "en-GB",
                      { dateStyle: "medium" },
                    )}{" "}
                    · {itemCount}{" "}
                    {de ? "Artikel" : itemCount === 1 ? "item" : "items"}
                  </small>
                </div>
                <div className="account-order-meta">
                  <span className={`order-pill ${paymentPillClass(order)}`}>
                    {paymentStatusLabel(order.paymentStatus, locale)}
                  </span>
                  <span className="account-order-status">
                    {orderStatusLabel(order.status, locale)}
                  </span>
                  <strong className="account-order-total">
                    {formatMoney(order.totalCents, locale, order.currency)}
                  </strong>
                  <ChevronRight size={17} aria-hidden="true" />
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="empty-state">
          <PackageOpen size={40} aria-hidden="true" />
          <h2>{de ? "Noch keine Bestellungen" : "No orders yet"}</h2>
          <p>
            {de
              ? "Sobald Sie bestellen, erscheinen Ihre Bestellungen hier."
              : "Once you place an order, it will appear here."}
          </p>
          <Link className="button" href="/shop" locale={locale}>
            {de ? "Zum Shop" : "Browse shop"}
          </Link>
        </div>
      )}
    </div>
  );
}
