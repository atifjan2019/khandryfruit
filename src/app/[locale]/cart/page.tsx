import { notFound } from "next/navigation";
import { CartPageClient } from "@/features/cart/cart-page";
import { isLocale } from "@/config/site";
export const metadata = {
  title: "Cart",
  robots: { index: false, follow: false },
};
export default async function CartPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <div className="page-shell container">
      <header className="simple-heading">
        <p className="eyebrow">Khan Dry Fruit</p>
        <h1>{locale === "de" ? "Warenkorb" : "Shopping cart"}</h1>
      </header>
      <CartPageClient locale={locale} />
    </div>
  );
}
