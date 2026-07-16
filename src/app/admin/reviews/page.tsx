import { AdminForm } from "@/components/admin/admin-form";
import { AdminSection, SelectField } from "@/components/admin/product-form";
import { db } from "@/lib/db/client";
import { moderateReviewAction } from "@/server/actions/admin";
import { requireAdmin } from "@/server/policies/authorization";

export default async function ReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireAdmin("reviews");
  const { status = "PENDING" } = await searchParams;
  const reviews = await db.review.findMany({
    where: status ? { status: status as never } : undefined,
    include: {
      product: { include: { translations: { where: { locale: "en" } } } },
      user: true,
    },
    orderBy: { createdAt: "desc" },
  });
  return (
    <div className="admin-page-v2">
      <div className="admin-page-heading">
        <div>
          <p className="eyebrow">Customer feedback</p>
          <h1>Reviews</h1>
          <p>
            Approve genuine feedback, reject unsuitable submissions, and isolate
            spam.
          </p>
        </div>
      </div>
      <form className="admin-filterbar">
        <select name="status" defaultValue={status}>
          <option value="">All statuses</option>
          {["PENDING", "APPROVED", "REJECTED", "SPAM"].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <button className="button">Apply</button>
      </form>
      {reviews.map((review) => (
        <div className="admin-two-column" key={review.id}>
          <section className="admin-card">
            <header>
              <h2>{review.title}</h2>
              <span className="admin-status">{review.status}</span>
            </header>
            <p>
              {"★".repeat(review.rating)}
              {"☆".repeat(5 - review.rating)} · {review.customerName}{" "}
              {review.verifiedPurchase && "· Verified purchase"}
            </p>
            <p>{review.body}</p>
            <small>
              {review.product.translations[0]?.name ?? "Product"} ·{" "}
              {review.locale} · {review.createdAt.toLocaleString("en-DE")}
            </small>
          </section>
          {review.status === "PENDING" && (
            <AdminForm
              action={moderateReviewAction}
              submitLabel="Moderate review"
            >
              <input type="hidden" name="reviewId" value={review.id} />
              <AdminSection title="Decision">
                <SelectField
                  label="Status"
                  name="status"
                  required
                  options={["APPROVED", "REJECTED", "SPAM"].map((s) => ({
                    value: s,
                    label: s,
                  }))}
                />
              </AdminSection>
            </AdminForm>
          )}
        </div>
      ))}
      {!reviews.length && (
        <p className="admin-empty">No reviews match this status.</p>
      )}
    </div>
  );
}
