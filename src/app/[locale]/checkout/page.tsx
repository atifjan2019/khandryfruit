import { notFound } from "next/navigation";
import { CheckoutReview } from "@/features/checkout/checkout-review";
import { isLocale } from "@/config/site";
export const metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};
export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <div className="page-shell narrow container">
      <header className="simple-heading">
        <p className="eyebrow">Stripe Checkout</p>
        <h1>{locale === "de" ? "Bestellung prüfen" : "Review your order"}</h1>
        <p>
          {locale === "de"
            ? "Prüfen Sie Ihre Auswahl, bevor Sie zur sicheren Stripe-Zahlung wechseln."
            : "Review your selection before continuing to secure Stripe payment."}
        </p>
      </header>
      <CheckoutReview locale={locale} />
    </div>
  );
}
