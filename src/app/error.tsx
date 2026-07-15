"use client";
export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="empty-state large">
      <p className="eyebrow">500</p>
      <h1>Etwas ist schiefgelaufen</h1>
      <p>
        Something went wrong. No sensitive technical details have been shown.
      </p>
      <button className="button" onClick={reset}>
        Erneut versuchen / Try again
      </button>
    </main>
  );
}
