import { notFound } from "next/navigation";
import { AuthForm } from "@/features/auth/auth-form";
import { isLocale } from "@/config/site";
export const metadata = {
  title: "Create account",
  robots: { index: false, follow: false },
};
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const de = locale === "de";
  return (
    <div className="auth-shell">
      <div>
        <p className="eyebrow">Khan Dry Fruit</p>
        <h1>{de ? "Konto erstellen" : "Create an account"}</h1>
        <p>
          {de
            ? "Speichern Sie Adressen und sehen Sie Ihre Bestellungen sicher ein."
            : "Save addresses and securely view your orders."}
        </p>
        <AuthForm locale={locale} mode="sign-up" />
        <p>
          {de ? "Bereits registriert?" : "Already registered?"}{" "}
          <a href={`/${locale}/sign-in`}>{de ? "Anmelden" : "Sign in"}</a>
        </p>
      </div>
    </div>
  );
}
