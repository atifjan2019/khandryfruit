import type { MetadataRoute } from "next";
const paths = [
  "",
  "/shop",
  "/gift-boxes",
  "/wholesale",
  "/our-story",
  "/sourcing",
  "/recipes",
  "/blog",
  "/contact",
  "/faq",
  "/shipping",
  "/returns",
  "/privacy",
  "/terms",
  "/withdrawal",
  "/impressum",
];
export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return ["de", "en"].flatMap((locale) =>
    paths.map((path) => ({
      url: `${base}/${locale}${path}`,
      lastModified: new Date(),
      changeFrequency:
        path === "" || path === "/shop"
          ? ("weekly" as const)
          : ("monthly" as const),
      priority: path === "" ? 1 : path === "/shop" ? 0.9 : 0.6,
      alternates: {
        languages: { de: `${base}/de${path}`, en: `${base}/en${path}` },
      },
    })),
  );
}
