import { MessageCircle } from "lucide-react";
import type { AppLocale } from "@/config/site";
import { siteConfig } from "@/config/site";

export function WhatsAppButton({ locale }: { locale: AppLocale }) {
  const message =
    locale === "de"
      ? "Hallo, ich habe eine Frage zu Khan Dry Fruit."
      : "Hello, I have a question about Khan Dry Fruit.";
  return (
    <a
      className="whatsapp"
      href={`https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(message)}`}
      target="_blank"
      rel="noreferrer noopener"
      aria-label={
        locale === "de"
          ? "Khan Dry Fruit über WhatsApp kontaktieren (öffnet neuen Tab)"
          : "Contact Khan Dry Fruit on WhatsApp (opens a new tab)"
      }
    >
      <MessageCircle size={22} />
      <span>WhatsApp</span>
    </a>
  );
}
