import { notFound } from "next/navigation";
import { Mail, MessageCircle, Phone } from "lucide-react";

import { db } from "@/lib/db/client";
import { requireAdmin } from "@/server/policies/authorization";

const TYPE_LABELS: Record<string, string> = {
  GENERAL: "General question",
  ORDER: "Existing order",
  PRODUCT: "Product information",
  DELIVERY: "Delivery question",
  WHOLESALE: "Wholesale",
  GIFT_BOXES: "Gift boxes",
  RETURNS: "Returns",
  OTHER: "Other",
};

export default async function ContactEnquiryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin("contact-enquiries");
  const { id } = await params;
  const enquiry = await db.contactEnquiry.findUnique({ where: { id } });
  if (!enquiry) notFound();
  const relatedOrder = enquiry.orderNumber
    ? await db.order.findUnique({
        where: { number: enquiry.orderNumber },
        select: { number: true },
      })
    : null;

  const replyHref = `mailto:${enquiry.email}?subject=${encodeURIComponent(
    `Re: ${enquiry.subject || "Your enquiry"}`,
  )}`;
  const telHref = enquiry.phone
    ? `tel:${enquiry.phone.replace(/\s+/g, "")}`
    : null;
  const whatsappHref = enquiry.phone
    ? `https://wa.me/${enquiry.phone.replace(/[^0-9]/g, "")}`
    : null;
  const received = enquiry.createdAt.toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    hour12: true,
  });

  return (
    <div className="admin-page-v2 enquiry-detail">
      <div className="admin-page-heading">
        <div>
          <p className="eyebrow">Contact enquiry</p>
          <h1>
            {enquiry.subject || TYPE_LABELS[enquiry.type] || enquiry.type}
          </h1>
          <p>
            {enquiry.name} · {enquiry.email} · {enquiry.locale.toUpperCase()}
          </p>
        </div>
        <a className="button" href={replyHref}>
          <Mail size={16} aria-hidden="true" /> Reply by email
        </a>
      </div>

      <div className="enquiry-grid">
        <section className="admin-card enquiry-message-card">
          <header>
            <h2>Message</h2>
            <span className="admin-muted-label">{received}</span>
          </header>
          <p className="enquiry-message">{enquiry.message}</p>
        </section>

        <aside className="admin-card enquiry-side">
          <header>
            <h2>Details</h2>
          </header>
          <dl className="admin-summary">
            <div>
              <dt>Name</dt>
              <dd>{enquiry.name}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>
                <a href={`mailto:${enquiry.email}`}>{enquiry.email}</a>
              </dd>
            </div>
            <div>
              <dt>Phone</dt>
              <dd>{telHref ? <a href={telHref}>{enquiry.phone}</a> : "—"}</dd>
            </div>
            <div>
              <dt>Preferred contact</dt>
              <dd>{enquiry.preferredContactMethod ?? "—"}</dd>
            </div>
            <div>
              <dt>Type</dt>
              <dd>{TYPE_LABELS[enquiry.type] ?? enquiry.type}</dd>
            </div>
            <div>
              <dt>Order</dt>
              <dd>
                {relatedOrder ? (
                  <a href={`/admin/orders/${relatedOrder.number}`}>
                    {relatedOrder.number}
                  </a>
                ) : (
                  (enquiry.orderNumber ?? "—")
                )}
              </dd>
            </div>
            <div>
              <dt>Received</dt>
              <dd>{received}</dd>
            </div>
          </dl>
          <div className="enquiry-actions">
            <a className="button full" href={replyHref}>
              <Mail size={15} aria-hidden="true" /> Reply by email
            </a>
            {telHref && (
              <a className="button secondary full" href={telHref}>
                <Phone size={15} aria-hidden="true" /> Call
              </a>
            )}
            {whatsappHref && (
              <a
                className="button secondary full"
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle size={15} aria-hidden="true" /> WhatsApp
              </a>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
