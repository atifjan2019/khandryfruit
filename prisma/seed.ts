import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is required for seeding");
const db = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

const auth = betterAuth({
  secret:
    process.env.BETTER_AUTH_SECRET ??
    "development-only-seed-secret-at-least-32-chars",
  database: prismaAdapter(db, { provider: "postgresql" }),
  emailAndPassword: { enabled: true, minPasswordLength: 12 },
});

const products = [
  [
    "black-raisins",
    "Schwarze Rosinen",
    "Black Raisins",
    "schwarze-rosinen",
    "black-raisins",
    "Kabul",
    "raisins",
    "Rosinen",
    "Raisins",
    899,
  ],
  [
    "green-raisins",
    "Grüne Rosinen",
    "Green Raisins",
    "gruene-rosinen",
    "green-raisins",
    "Kabul",
    "raisins",
    "Rosinen",
    "Raisins",
    999,
  ],
  [
    "afghan-figs",
    "Afghanische Feigen",
    "Afghan Figs",
    "afghanische-feigen",
    "afghan-figs",
    "Kandahar",
    "figs",
    "Feigen",
    "Figs",
    1299,
  ],
  [
    "dried-mulberries",
    "Getrocknete Maulbeeren",
    "Dried Mulberries",
    "getrocknete-maulbeeren",
    "dried-mulberries",
    "Shamali",
    "mulberries",
    "Maulbeeren",
    "Mulberries",
    1099,
  ],
  [
    "dried-peaches",
    "Getrocknete Pfirsiche",
    "Dried Peaches",
    "getrocknete-pfirsiche",
    "dried-peaches",
    "Logar",
    "peaches",
    "Pfirsiche",
    "Peaches",
    1199,
  ],
  [
    "dried-apricots",
    "Getrocknete Aprikosen",
    "Dried Apricots",
    "getrocknete-aprikosen",
    "dried-apricots",
    "[REGION REQUIRED]",
    "apricots",
    "Aprikosen",
    "Apricots",
    999,
  ],
] as const;

async function seedUsers() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@khandryfruit.local";
  const adminPassword =
    process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe-Local-Only-2026!";
  const customerEmail =
    process.env.SEED_CUSTOMER_EMAIL ?? "customer@khandryfruit.local";
  const customerPassword =
    process.env.SEED_CUSTOMER_PASSWORD ?? "ChangeMe-Local-Only-2026!";
  if (!(await db.user.findUnique({ where: { email: adminEmail } })))
    await auth.api.signUpEmail({
      body: {
        name: "Local Store Administrator",
        email: adminEmail,
        password: adminPassword,
      },
    });
  await db.user.update({
    where: { email: adminEmail },
    data: { role: "SUPER_ADMIN", emailVerified: true },
  });
  if (!(await db.user.findUnique({ where: { email: customerEmail } })))
    await auth.api.signUpEmail({
      body: {
        name: "Development Customer",
        email: customerEmail,
        password: customerPassword,
      },
    });
  await db.user.update({
    where: { email: customerEmail },
    data: { role: "CUSTOMER", emailVerified: true },
  });
  console.info(`Development admin: ${adminEmail}`);
  console.info(`Development customer: ${customerEmail}`);
  console.info(
    "Passwords come from SEED_*_PASSWORD and must never be used outside local development.",
  );
}

async function seedRoles() {
  for (const name of [
    "CUSTOMER",
    "WHOLESALE_CUSTOMER",
    "CONTENT_EDITOR",
    "ORDER_MANAGER",
    "ADMIN",
    "SUPER_ADMIN",
  ])
    await db.role.upsert({
      where: { name },
      update: {},
      create: {
        name,
        description: `${name.replaceAll("_", " ").toLowerCase()} role`,
      },
    });
  for (const key of [
    "catalogue.read",
    "catalogue.write",
    "inventory.write",
    "orders.write",
    "content.write",
    "settings.write",
    "users.manage",
    "audit.read",
  ])
    await db.permission.upsert({ where: { key }, update: {}, create: { key } });
}

async function seedCatalogue() {
  const categories = new Map<string, string>();
  for (const item of products) {
    const [, , , , , , categoryKey, nameDe, nameEn] = item;
    if (categories.has(categoryKey)) continue;
    const category = await db.category.upsert({
      where: { id: `cat-${categoryKey}` },
      update: {},
      create: {
        id: `cat-${categoryKey}`,
        internalName: categoryKey,
        translations: {
          create: [
            {
              locale: "de",
              name: nameDe,
              slug:
                categoryKey === "raisins"
                  ? "rosinen"
                  : categoryKey === "figs"
                    ? "feigen"
                    : categoryKey === "mulberries"
                      ? "maulbeeren"
                      : categoryKey === "peaches"
                        ? "pfirsiche"
                        : "aprikosen",
              description: `${nameDe} – Entwicklungsinhalt.`,
              seoTitle: `${nameDe} kaufen | Khan Dry Fruit`,
              metaDescription: `${nameDe} von Khan Dry Fruit. Produktdaten vor Veröffentlichung prüfen.`,
            },
            {
              locale: "en",
              name: nameEn,
              slug: categoryKey,
              description: `${nameEn} – development content.`,
              seoTitle: `${nameEn} | Khan Dry Fruit`,
              metaDescription: `${nameEn} from Khan Dry Fruit. Verify product data before publication.`,
            },
          ],
        },
      },
    });
    categories.set(categoryKey, category.id);
  }
  for (const [
    key,
    nameDe,
    nameEn,
    slugDe,
    slugEn,
    region,
    categoryKey,
    ,
    ,
    priceCents,
  ] of products) {
    await db.product.upsert({
      where: { id: `prod-${key}` },
      update: {},
      create: {
        id: `prod-${key}`,
        internalName: key,
        status: "DRAFT",
        featured: true,
        bestseller: ["black-raisins", "afghan-figs"].includes(key),
        countryOfOrigin: "Afghanistan",
        regionOfOrigin: region,
        translations: {
          create: [
            {
              locale: "de",
              name: nameDe,
              slug: slugDe,
              alternativeNames: [],
              keywords: [nameDe, region],
              shortDescription: `${nameDe} aus ${region}; Entwicklungsprodukt bis alle Pflichtdaten bestätigt sind.`,
              description: `Die Herkunftsangabe ${region} ist ${region.startsWith("[") ? "noch nicht bestätigt" : "als Beispiel bestätigt"}. Weitere Produktdaten benötigen Freigabe.`,
              ingredients: "[ZUTATEN VOR VERÖFFENTLICHUNG BESTÄTIGEN]",
              allergenStatement: "[ALLERGENINFORMATION ERFORDERLICH]",
              storageInstructions: "[LAGERHINWEISE ERFORDERLICH]",
              seoTitle: `${nameDe} | Khan Dry Fruit`,
              metaDescription: `${nameDe} als Entwicklungsprodukt. Pflichtangaben werden vor Veröffentlichung geprüft.`,
            },
            {
              locale: "en",
              name: nameEn,
              slug: slugEn,
              alternativeNames: [],
              keywords: [nameEn, region],
              shortDescription: `${nameEn} from ${region}; development product until mandatory data is confirmed.`,
              description: `The ${region} sourcing entry is ${region.startsWith("[") ? "not yet confirmed" : "confirmed as an example"}. Further product data requires approval.`,
              ingredients: "[CONFIRM INGREDIENTS BEFORE PUBLICATION]",
              allergenStatement: "[ALLERGEN INFORMATION REQUIRED]",
              storageInstructions: "[STORAGE INSTRUCTIONS REQUIRED]",
              seoTitle: `${nameEn} | Khan Dry Fruit`,
              metaDescription: `${nameEn} as a development product. Mandatory data will be checked before publication.`,
            },
          ],
        },
        categories: {
          create: { categoryId: categories.get(categoryKey)!, isPrimary: true },
        },
        variants: {
          create: [
            {
              sku: `DEV-${key.toUpperCase()}-500`,
              weightGrams: 500,
              shippingWeightG: 540,
              priceCents,
              vatRateBps: 700,
              inventory: {
                create: { onHand: 20, reserved: 0, lowStockThreshold: 5 },
              },
            },
            {
              sku: `DEV-${key.toUpperCase()}-1000`,
              weightGrams: 1000,
              shippingWeightG: 1060,
              priceCents: Math.round(priceCents * 1.8),
              vatRateBps: 700,
              inventory: {
                create: { onHand: 8, reserved: 0, lowStockThreshold: 3 },
              },
            },
          ],
        },
      },
    });
  }
}

async function seedOperations() {
  const zone = await db.shippingZone.upsert({
    where: { id: "zone-de" },
    update: {},
    create: { id: "zone-de", name: "Germany", countries: ["DE"] },
  });
  const method = await db.shippingMethod.upsert({
    where: { id: "shipping-de-standard" },
    update: {},
    create: {
      id: "shipping-de-standard",
      zoneId: zone.id,
      nameDe: "Standard Deutschland",
      nameEn: "Germany standard",
      provider: "mock",
      deliveryDaysMin: 3,
      deliveryDaysMax: 4,
    },
  });
  await db.shippingRate.upsert({
    where: { id: "rate-de-standard" },
    update: {},
    create: {
      id: "rate-de-standard",
      methodId: method.id,
      minWeightG: 0,
      maxWeightG: 2000,
      priceCents: 499,
    },
  });
  await db.coupon.upsert({
    where: { code: "DEV10" },
    update: {},
    create: {
      code: "DEV10",
      type: "PERCENTAGE",
      value: 1000,
      active: true,
      usageLimit: 100,
      perCustomerLimit: 1,
      minimumOrderCents: 2500,
      maximumDiscountCents: 1500,
    },
  });
  const flags = [
    "wholesaleAccounts",
    "customGiftBoxes",
    "productReviews",
    "subscriptions",
    "loyaltyPoints",
    "clickAndCollect",
    "localDelivery",
    "liveStockDisplay",
    "abandonedCartEmails",
    "austriaShipping",
    "switzerlandShipping",
    "euShipping",
    "englishLanguage",
    "futureLanguages",
  ];
  for (const key of flags)
    await db.featureFlag.upsert({
      where: { key },
      update: {},
      create: {
        key,
        enabled: key === "englishLanguage",
        description: `${key} feature switch`,
      },
    });
  const settings = [
    ["business.tradingName", "Khan Dry Fruit", "business", true],
    ["business.owner", "Shoaib Khan Safi", "business", true],
    ["business.phone", "+49 176 21809185", "business", true],
    ["business.address", "", "business", false],
    ["business.email", "orders@example.com", "business", false],
    ["commerce.currency", "EUR", "commerce", true],
    ["commerce.vatMode", "UNCONFIRMED", "commerce", false],
    ["commerce.stockReservationMinutes", 30, "commerce", false],
    ["shipping.dispatchPromiseEnabled", false, "shipping", true],
  ] as const;
  for (const [key, value, group, isPublic] of settings)
    await db.siteSetting.upsert({
      where: { key },
      update: {},
      create: {
        key,
        value,
        group,
        public: isPublic,
        type:
          typeof value === "boolean"
            ? "BOOLEAN"
            : typeof value === "number"
              ? "NUMBER"
              : "STRING",
      },
    });
  for (const key of [
    "impressum",
    "privacy",
    "terms",
    "withdrawal",
    "shipping",
    "returns",
    "cookies",
  ])
    for (const locale of ["de", "en"] as const)
      await db.legalDocument.upsert({
        where: { key_locale: { key, locale } },
        update: {},
        create: {
          key,
          locale,
          title: `${key} [DEVELOPMENT]`,
          contentJson: {
            type: "placeholder",
            text: "[LEGAL TEXT REQUIRED BEFORE LAUNCH]",
          },
          complete: false,
          version: "development-1",
        },
      });
}

async function main() {
  await seedRoles();
  await seedUsers();
  await seedCatalogue();
  await seedOperations();
}
main()
  .then(() => console.info("Khan Dry Fruit development seed completed."))
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => db.$disconnect());
