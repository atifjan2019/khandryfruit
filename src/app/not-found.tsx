import Link from "next/link";
export default function NotFound() {
  return (
    <main className="empty-state large">
      <p className="eyebrow">404</p>
      <h1>Diese Seite wurde nicht gefunden</h1>
      <p>The requested page could not be found.</p>
      <Link className="button" href="/de">
        Zur Startseite / Home
      </Link>
    </main>
  );
}
