import { notFound } from "next/navigation";
import { isLocale } from "@/config/site";
import { requireUser } from "@/server/policies/authorization";
export const metadata = {
  title: "Account",
  robots: { index: false, follow: false },
};
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const session = await requireUser(locale);
  const de = locale === "de";
  return (
    <div className="page-shell container">
      <header className="page-hero">
        <p className="eyebrow">{de ? "Kundenkonto" : "Customer account"}</p>
        <h1>
          {de ? `Hallo, ${session.user.name}` : `Hello, ${session.user.name}`}
        </h1>
        <p>{session.user.email}</p>
      </header>
      <div className="account-grid">
        {[
          [
            de ? "Bestellungen" : "Orders",
            de
              ? "Bestellverlauf und Status ansehen"
              : "View order history and status",
          ],
          [
            de ? "Adressen" : "Addresses",
            de
              ? "Liefer- und Rechnungsadressen verwalten"
              : "Manage shipping and billing addresses",
          ],
          [
            de ? "Profil & Sicherheit" : "Profile & security",
            de
              ? "Kontodaten und Passwort verwalten"
              : "Manage profile and password",
          ],
          [
            de ? "Datenschutz" : "Privacy",
            de
              ? "Datenexport oder Löschung anfragen"
              : "Request export or deletion",
          ],
        ].map(([title, body]) => (
          <section className="account-card" key={title}>
            <h2>{title}</h2>
            <p>{body}</p>
            <button className="text-link">{de ? "Öffnen" : "Open"} →</button>
          </section>
        ))}
      </div>
    </div>
  );
}
