import Link from "next/link";
import type { Route } from "next";
import { AdminForm } from "@/components/admin/admin-form";
import { AdminSection, Field } from "@/components/admin/product-form";
import { canAccessAdmin, type AdminArea } from "@/config/admin";
import { db } from "@/lib/db/client";
import { env } from "@/lib/env";
import { updateSettingAction } from "@/server/actions/admin";
import { requireAdmin } from "@/server/policies/authorization";

// Entry points for structural/configuration areas that were moved out of the
// sidebar to reduce clutter. The pages themselves are unchanged; these cards
// just surface the existing routes from a single gateway.
const navSections: {
  title: string;
  items: { area: AdminArea; label: string; href: Route; description: string }[];
}[] = [
  {
    title: "Catalogue structure",
    items: [
      {
        area: "categories",
        label: "Categories",
        href: "/admin/categories" as Route,
        description: "Bilingual navigation and product grouping.",
      },
      {
        area: "packaging",
        label: "Packaging",
        href: "/admin/packaging" as Route,
        description: "Packaging options and material details.",
      },
      {
        area: "gift-boxes",
        label: "Gift boxes",
        href: "/admin/gift-boxes" as Route,
        description: "Fixed and configurable gift-box templates.",
      },
      {
        area: "coupons",
        label: "Coupons",
        href: "/admin/coupons" as Route,
        description: "Discount codes and promotion rules.",
      },
    ],
  },
  {
    title: "Legal & content",
    items: [
      {
        area: "legal",
        label: "Legal documents",
        href: "/admin/legal" as Route,
        description: "Impressum, privacy, terms and withdrawal texts.",
      },
      {
        area: "faqs",
        label: "FAQs",
        href: "/admin/faqs" as Route,
        description: "Customer help questions and answers.",
      },
    ],
  },
  {
    title: "Administration",
    items: [
      {
        area: "media",
        label: "Media library",
        href: "/admin/media" as Route,
        description: "Uploaded images and stored assets.",
      },
      {
        area: "audit-logs",
        label: "Audit logs",
        href: "/admin/audit-logs" as Route,
        description: "Security-sensitive administrator action history.",
      },
      {
        area: "system-health",
        label: "System health",
        href: "/admin/system-health" as Route,
        description: "Integration status and runtime diagnostics.",
      },
    ],
  },
];

// Turns a camelCase settings key segment into a sentence-case label
// (e.g. "tradingName" -> "Trading name"), keeping common acronyms uppercase.
function labelizeKey(key: string) {
  const segment = key.split(".")[1] ?? key;
  const words = segment
    .replace(/([A-Z])/g, " $1")
    .trim()
    .toLowerCase();
  const sentence = words.charAt(0).toUpperCase() + words.slice(1);
  return sentence
    .replace(/\bvat\b/gi, "VAT")
    .replace(/\bid\b/gi, "ID")
    .replace(/\bwhatsapp\b/gi, "WhatsApp");
}

const groups = {
  Business: [
    "business.tradingName",
    "business.registeredName",
    "business.owner",
    "business.address",
    "business.phone",
    "business.whatsapp",
    "business.email",
    "business.registrationNumber",
    "business.vatId",
    "business.taxNumber",
    "business.lucidNumber",
    "business.foodBusinessRegistration",
  ],
  Commerce: [
    "commerce.currency",
    "commerce.vatMode",
    "commerce.minimumOrderCents",
    "commerce.freeShippingThresholdCents",
    "commerce.stockReservationMinutes",
  ],
  Shipping: ["shipping.dispatchEstimate", "shipping.deliveryEstimate"],
  Brand: ["brand.socialHandle"],
  Compliance: ["compliance.cookieConsentVersion"],
} as const;
const display = (value: unknown) =>
  typeof value === "string"
    ? value
    : value == null
      ? ""
      : JSON.stringify(value);
export default async function SettingsPage() {
  const session = await requireAdmin("settings");
  const role = String(session.user.role);
  const settings = await db.siteSetting.findMany();
  const values = new Map(settings.map((s) => [s.key, display(s.value)]));
  const integrations = [
    { name: "Database", ok: Boolean(env.DATABASE_URL) },
    {
      name: "Stripe",
      ok: Boolean(env.STRIPE_SECRET_KEY && env.STRIPE_WEBHOOK_SECRET),
    },
    { name: "Email", ok: Boolean(env.AWS_SES_FROM_EMAIL) },
    {
      name: "Cloudflare R2",
      ok: Boolean(env.CLOUDFLARE_R2_BUCKET && env.CLOUDFLARE_R2_ACCESS_KEY_ID),
    },
    { name: "Analytics", ok: Boolean(env.GOOGLE_ANALYTICS_ID) },
  ];
  return (
    <div className="admin-page-v2">
      <div className="admin-page-heading">
        <div>
          <p className="eyebrow">Super administrator</p>
          <h1>Site settings</h1>
          <p>
            Secret values are never rendered. Integration cards report
            configuration status only.
          </p>
        </div>
      </div>
      <section className="admin-card">
        <header>
          <h2>Integration status</h2>
        </header>
        {integrations.map((i) => (
          <div className="admin-list-row" key={i.name}>
            <strong>{i.name}</strong>
            <span
              className={`admin-status ${i.ok ? "is-positive" : "is-negative"}`}
            >
              {i.ok ? "Configured" : "Not configured"}
            </span>
          </div>
        ))}
      </section>
      {navSections.map((section) => {
        const items = section.items.filter((item) =>
          canAccessAdmin(role, item.area),
        );
        if (!items.length) return null;
        return (
          <section className="admin-card" key={section.title}>
            <header>
              <h2>{section.title}</h2>
            </header>
            {items.map((item) => (
              <div className="admin-list-row" key={item.area}>
                <span>
                  <strong>{item.label}</strong>
                  <small>{item.description}</small>
                </span>
                <Link className="table-action" href={item.href}>
                  Open
                </Link>
              </div>
            ))}
          </section>
        );
      })}
      {Object.entries(groups).map(([group, keys]) => (
        <section className="admin-card" key={group}>
          <header>
            <h2>{group}</h2>
          </header>
          {keys.map((key) => (
            <AdminForm
              key={key}
              action={updateSettingAction}
              submitLabel="Save"
            >
              <input type="hidden" name="key" value={key} />
              <AdminSection title={labelizeKey(key)}>
                <Field
                  label="Value"
                  name="value"
                  defaultValue={values.get(key) ?? ""}
                  wide
                />
              </AdminSection>
            </AdminForm>
          ))}
        </section>
      ))}
    </div>
  );
}
