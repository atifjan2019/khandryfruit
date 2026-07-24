"use client";

import { useState } from "react";
import { FolderPlus, Pencil, Plus } from "lucide-react";

import { AdminForm } from "@/components/admin/admin-form";
import { Field, SelectField, TextField } from "@/components/admin/product-form";
import { Modal } from "@/components/admin/modal";
import {
  archiveCategoryAction,
  createCategoryAction,
  updateCategoryAction,
} from "@/server/actions/admin";

type CategoryTranslation = {
  name: string;
  slug: string;
  description: string;
  seoTitle: string;
  metaDescription: string;
};

export type CategoryRow = {
  id: string;
  internalName: string;
  active: boolean;
  productCount: number;
  parentId: string | null;
  de: CategoryTranslation;
  en: CategoryTranslation;
};

type Editing = { mode: "create" } | { mode: "edit"; category: CategoryRow };

export function CategoryManager({ categories }: { categories: CategoryRow[] }) {
  const [editing, setEditing] = useState<Editing | null>(null);
  const close = () => setEditing(null);

  const parentOptions = (excludeId?: string) => [
    { value: "", label: "No parent" },
    ...categories
      .filter((category) => category.id !== excludeId)
      .map((category) => ({
        value: category.id,
        label: category.en.name || category.internalName,
      })),
  ];

  return (
    <div className="admin-page-v2">
      <div className="admin-page-heading">
        <div>
          <p className="eyebrow">Catalogue structure</p>
          <h1>Categories</h1>
          <p>
            Bilingual navigation and product grouping. A category with products
            cannot be archived.
          </p>
        </div>
        <button
          type="button"
          className="button"
          onClick={() => setEditing({ mode: "create" })}
        >
          <Plus size={17} /> New category
        </button>
      </div>

      <section className="admin-card">
        <header>
          <h2>Current categories</h2>
          <span className="admin-muted-label">
            {categories.length}{" "}
            {categories.length === 1 ? "category" : "categories"}
          </span>
        </header>
        {categories.length ? (
          <div className="admin-table-wrap">
            <table className="admin-table category-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>German</th>
                  <th>Products</th>
                  <th>Status</th>
                  <th className="is-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category.id}>
                    <td>
                      <strong>
                        {category.en.name || category.internalName}
                      </strong>
                      <small className="admin-mono">{category.en.slug}</small>
                    </td>
                    <td>{category.de.name}</td>
                    <td>{category.productCount}</td>
                    <td>
                      <span
                        className={`admin-status ${
                          category.active ? "is-positive" : "is-warning"
                        }`}
                      >
                        {category.active ? "Active" : "Archived"}
                      </span>
                    </td>
                    <td className="is-actions">
                      <button
                        type="button"
                        className="table-action"
                        onClick={() => setEditing({ mode: "edit", category })}
                      >
                        <Pencil size={13} /> Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="admin-empty-cta">
            <FolderPlus size={26} aria-hidden="true" />
            <p>No categories yet.</p>
            <button
              type="button"
              className="button"
              onClick={() => setEditing({ mode: "create" })}
            >
              <Plus size={16} /> Create your first category
            </button>
          </div>
        )}
      </section>

      <Modal
        open={editing !== null}
        onClose={close}
        title={editing?.mode === "edit" ? "Edit category" : "New category"}
        description="German and English content are stored separately."
      >
        {editing && (
          <AdminForm
            action={
              editing.mode === "edit"
                ? updateCategoryAction
                : createCategoryAction
            }
            submitLabel={
              editing.mode === "edit" ? "Save changes" : "Create category"
            }
            onSuccess={close}
          >
            {editing.mode === "edit" && (
              <input
                type="hidden"
                name="categoryId"
                value={editing.category.id}
              />
            )}
            <CategoryFields
              category={editing.mode === "edit" ? editing.category : null}
              parentOptions={parentOptions(
                editing.mode === "edit" ? editing.category.id : undefined,
              )}
            />
          </AdminForm>
        )}

        {/* Archive lives here rather than in the table: it is rare and
            destructive, so it sits with the rest of a category's controls. */}
        {editing?.mode === "edit" && editing.category.active && (
          <div className="admin-modal-danger">
            {editing.category.productCount > 0 ? (
              <p className="admin-note-muted">
                Categories with products cannot be archived. Move or remove its{" "}
                {editing.category.productCount} product
                {editing.category.productCount === 1 ? "" : "s"} first.
              </p>
            ) : (
              <AdminForm
                action={archiveCategoryAction}
                submitLabel="Archive category"
                submitClassName="button danger"
                confirmMessage="Archive this empty category?"
                onSuccess={close}
                className="admin-form admin-form-inline"
              >
                <input
                  type="hidden"
                  name="categoryId"
                  value={editing.category.id}
                />
              </AdminForm>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

function CategoryFields({
  category,
  parentOptions,
}: {
  category: CategoryRow | null;
  parentOptions: { value: string; label: string }[];
}) {
  return (
    <div className="admin-field-grid">
      <Field
        label="German name"
        name="nameDe"
        required
        defaultValue={category?.de.name}
      />
      <Field
        label="English name"
        name="nameEn"
        required
        defaultValue={category?.en.name}
      />
      <Field
        label="German slug"
        name="slugDe"
        required
        defaultValue={category?.de.slug}
      />
      <Field
        label="English slug"
        name="slugEn"
        required
        defaultValue={category?.en.slug}
      />
      <SelectField
        label="Parent category"
        name="parentId"
        defaultValue={category?.parentId ?? ""}
        options={parentOptions}
      />
      <div className="admin-field-spacer" aria-hidden="true" />
      <TextField
        label="German description"
        name="descriptionDe"
        defaultValue={category?.de.description}
      />
      <TextField
        label="English description"
        name="descriptionEn"
        defaultValue={category?.en.description}
      />
      <Field
        label="German SEO title"
        name="seoTitleDe"
        defaultValue={category?.de.seoTitle}
      />
      <Field
        label="English SEO title"
        name="seoTitleEn"
        defaultValue={category?.en.seoTitle}
      />
      <TextField
        label="German meta description"
        name="metaDescriptionDe"
        defaultValue={category?.de.metaDescription}
      />
      <TextField
        label="English meta description"
        name="metaDescriptionEn"
        defaultValue={category?.en.metaDescription}
      />
    </div>
  );
}
