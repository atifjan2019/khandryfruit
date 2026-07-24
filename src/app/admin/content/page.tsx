import { AdminForm } from "@/components/admin/admin-form";
import {
  AdminSection,
  Checkbox,
  Field,
  TextField,
} from "@/components/admin/product-form";
import { db } from "@/lib/db/client";
import { updateLegalDocumentAction } from "@/server/actions/admin";
import { requireAdmin } from "@/server/policies/authorization";

function textValue(value: unknown) {
  if (value && typeof value === "object" && "text" in value)
    return String((value as { text: unknown }).text ?? "");
  return "";
}
export default async function ContentPage() {
  await requireAdmin("content");
  const [legal, pages, posts] = await Promise.all([
    db.legalDocument.findMany({ orderBy: [{ key: "asc" }, { locale: "asc" }] }),
    db.contentPage.count(),
    db.blogPost.count(),
  ]);
  return (
    <div className="admin-page-v2">
      <div className="admin-page-heading">
        <div>
          <p className="eyebrow">Bilingual publishing</p>
          <h1>Content</h1>
          <p>
            German and English records are edited independently. Rich HTML is
            not accepted by these forms.
          </p>
        </div>
      </div>
      <div className="admin-metric-grid">
        <div className="admin-metric">
          <span>Content pages</span>
          <strong>{pages}</strong>
        </div>
        <div className="admin-metric">
          <span>Blog posts</span>
          <strong>{posts}</strong>
        </div>
        <div className="admin-metric">
          <span>Legal documents</span>
          <strong>{legal.length}</strong>
        </div>
      </div>
      {legal.map((doc) => (
        <AdminForm
          key={doc.id}
          action={updateLegalDocumentAction}
          submitLabel="Save legal document"
        >
          <input type="hidden" name="documentId" value={doc.id} />
          <AdminSection
            title={`${doc.key.replaceAll("-", " ")} · ${doc.locale.toUpperCase()}`}
            description={`Version ${doc.version} · ${doc.complete ? "Approved" : "Incomplete placeholder"}`}
          >
            <Field
              label="Title"
              name="title"
              defaultValue={doc.title}
              required
            />
            <TextField
              label="Plain-text content"
              name="content"
              defaultValue={textValue(doc.contentJson)}
              rows={10}
            />
            <Checkbox
              label="Mark complete and approved"
              name="complete"
              defaultChecked={doc.complete}
            />
          </AdminSection>
        </AdminForm>
      ))}
      {!legal.length && (
        <p className="admin-empty">
          No editable legal documents have been seeded.
        </p>
      )}
    </div>
  );
}
