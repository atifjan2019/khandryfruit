import { notFound } from "next/navigation";
import { AuthForm } from "@/features/auth/auth-form";
import { isLocale } from "@/config/site";
export const metadata = {
  title: "Sign in",
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
        <h1>{de ? "Willkommen zurück" : "Welcome back"}</h1>
        <p>
          {de
            ? "Melden Sie sich an, um Bestellungen und Adressen zu verwalten."
            : "Sign in to manage orders and addresses."}
        </p>
        <AuthForm locale={locale} mode="sign-in" />
        <p>
          {de ? "Noch kein Konto?" : "No account yet?"}{" "}
          <a href={`/${locale}/sign-up`}>
            {de ? "Konto erstellen" : "Create one"}
          </a>
        </p>
      </div>
    </div>
  );
}
