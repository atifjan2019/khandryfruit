import type { Metadata } from "next";
import {
  AtSign,
  Clock,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { localizedHref, localizedPath } from "@/config/routes";
import { isLocale, siteConfig } from "@/config/site";
import { ContactForm } from "@/features/contact/contact-form";
import { Link } from "@/i18n/navigation";
import { env } from "@/lib/env";

const PLACEHOLDER_ADMIN_EMAIL = "orders@example.com";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = await getTranslations({ locale, namespace: "contact" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: {
      canonical: localizedHref("contact", locale),
      languages: {
        de: localizedHref("contact", "de"),
        en: localizedHref("contact", "en"),
      },
    },
  };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations("contact");
  const common = await getTranslations("common");
  // LocalBusiness JSON-LD and a map embed are added only once the business address is verified.
  const emailConfigured = env.ADMIN_EMAIL !== PLACEHOLDER_ADMIN_EMAIL;
  const whatsappHref = `https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(
    t("channels.whatsappMessage"),
  )}`;
  const channels = [
    {
      key: "phone",
      icon: Phone,
      title: t("channels.phoneTitle"),
      href: `tel:${siteConfig.phoneHref}`,
      value: siteConfig.phoneDisplay,
    },
    {
      key: "whatsapp",
      icon: MessageCircle,
      title: t("channels.whatsappTitle"),
      href: whatsappHref,
      value: t("channels.whatsappCta"),
      external: true,
      aria: t("channels.whatsappAria"),
    },
    {
      key: "email",
      icon: Mail,
      title: t("channels.emailTitle"),
      href: emailConfigured ? `mailto:${env.ADMIN_EMAIL}` : undefined,
      value: emailConfigured ? env.ADMIN_EMAIL : t("channels.emailPending"),
      note: emailConfigured ? t("channels.emailNote") : undefined,
      pending: !emailConfigured,
    },
    {
      key: "social",
      icon: AtSign,
      title: t("channels.socialTitle"),
      value: siteConfig.socialHandle,
    },
  ];

  return (
    <div className="page-shell contact-page container">
      <header className="page-hero contact-hero">
        <p className="eyebrow">{t("eyebrow")}</p>
        <h1>{t("title")}</h1>
        <p className="lead-copy">{t("lead")}</p>
      </header>

      <section className="contact-options">
        <div className="section-heading">
          <h2>{t("options.title")}</h2>
        </div>
        <div className="feature-grid">
          <div className="feature-card">
            <h3>{t("options.orderTitle")}</h3>
            <p>{t("options.orderBody")}</p>
          </div>
          <div className="feature-card">
            <h3>{t("options.wholesaleTitle")}</h3>
            <p>{t("options.wholesaleBody")}</p>
            <Link
              className="text-link"
              href={localizedPath("wholesale", locale)}
              locale={locale}
            >
              {t("options.wholesaleCta")} →
            </Link>
          </div>
          <div className="feature-card">
            <h3>{t("options.generalTitle")}</h3>
            <p>{t("options.generalBody")}</p>
          </div>
        </div>
      </section>

      <section className="contact-layout">
        <aside className="contact-info">
          <div className="contact-info-head">
            <h2>{t("channels.title")}</h2>
            <p>{t("channels.lead")}</p>
          </div>
          <ul className="contact-info-list">
            {channels.map((channel) => {
              const Icon = channel.icon;
              return (
                <li className="contact-info-row" key={channel.key}>
                  <span className="contact-info-icon" aria-hidden="true">
                    <Icon size={18} />
                  </span>
                  <div className="contact-info-body">
                    <span className="contact-info-label">{channel.title}</span>
                    {channel.href ? (
                      <a
                        href={channel.href}
                        {...(channel.external
                          ? {
                              target: "_blank",
                              rel: "noopener noreferrer",
                              "aria-label": channel.aria,
                            }
                          : {})}
                      >
                        {channel.value}
                      </a>
                    ) : channel.pending ? (
                      <small className="contact-info-pending">
                        {channel.value}
                      </small>
                    ) : (
                      <span className="contact-info-value">
                        {channel.value}
                      </span>
                    )}
                    {channel.note && (
                      <small className="contact-info-note">
                        {channel.note}
                      </small>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="contact-info-pending-group">
            <div className="contact-pending-item">
              <MapPin size={16} aria-hidden="true" />
              <div>
                <strong>{t("channels.addressTitle")}</strong>
                <span>{t("channels.addressPending")}</span>
              </div>
            </div>
            <div className="contact-pending-item">
              <Clock size={16} aria-hidden="true" />
              <div>
                <strong>{t("channels.hoursTitle")}</strong>
                <span>{t("channels.hoursPending")}</span>
              </div>
            </div>
          </div>
        </aside>

        <div className="contact-form-card">
          <div className="contact-form-head">
            <h2>{t("formTitle")}</h2>
            <p>{t("formLead")}</p>
            <p className="muted">{common("requiredFieldsNote")}</p>
          </div>
          <ContactForm locale={locale} />
        </div>
      </section>
    </div>
  );
}
