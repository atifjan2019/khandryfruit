"use client";

import { useParams } from "next/navigation";
import { usePathname } from "next/navigation";
import { Globe2 } from "lucide-react";

export function LanguageSwitcher() {
  const params = useParams<{ locale: string }>();
  const pathname = usePathname();
  const nextLocale = params.locale === "en" ? "de" : "en";
  const target = pathname.replace(/^\/(de|en)(?=\/|$)/, `/${nextLocale}`);
  return (
    <a className="language-switcher" href={target} hrefLang={nextLocale}>
      <Globe2 size={17} aria-hidden="true" /> {nextLocale.toUpperCase()}
    </a>
  );
}
