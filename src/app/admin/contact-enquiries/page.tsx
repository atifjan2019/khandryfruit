import Link from "next/link";
import { Mail } from "lucide-react";

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

export default async function ContactEnquiriesPage() {
  await requireAdmin("contact-enquiries");
  const enquiries = await db.contactEnquiry.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return (
    <div className="admin-page-v2">
      <div className="admin-page-heading">
        <div>
          <p className="eyebrow">Customer support</p>
          <h1>Contact enquiries</h1>
          <p>Messages sent through the website contact form.</p>
        </div>
        <span className="admin-muted-label">
          {enquiries.length} {enquiries.length === 1 ? "message" : "messages"}
        </span>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>From</th>
              <th>Subject</th>
              <th>Type</th>
              <th>Order</th>
              <th>Received</th>
              <th className="is-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {enquiries.map((enquiry) => (
              <tr key={enquiry.id}>
                <td>
                  <strong>{enquiry.name}</strong>
                  <small>{enquiry.email}</small>
                </td>
                <td>{enquiry.subject || "—"}</td>
                <td>{TYPE_LABELS[enquiry.type] ?? enquiry.type}</td>
                <td>{enquiry.orderNumber ?? "—"}</td>
                <td>
                  {enquiry.createdAt.toLocaleString("en-GB", {
                    dateStyle: "medium",
                    timeStyle: "short",
                    hour12: true,
                  })}
                </td>
                <td className="is-actions">
                  <a
                    className="table-action"
                    href={`mailto:${enquiry.email}?subject=${encodeURIComponent(
                      `Re: ${enquiry.subject || "Your enquiry"}`,
                    )}`}
                  >
                    <Mail size={13} aria-hidden="true" /> Reply
                  </a>
                  <Link
                    className="table-action"
                    href={`/admin/contact-enquiries/${enquiry.id}`}
                  >
                    Open
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!enquiries.length && (
          <p className="admin-empty">No contact enquiries yet.</p>
        )}
      </div>
    </div>
  );
}
