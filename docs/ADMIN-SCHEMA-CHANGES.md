# Admin dashboard schema changes

The admin implementation reuses all existing commerce and identity models. No duplicate product, order, user, category, variant, inventory, customer, wholesale, content, coupon, gift-box or audit tables are introduced.

The following additive, backwards-compatible fields are required:

- `ProductVariant.sortOrder Int @default(0)` — deterministic variant ordering in product editors and storefront selectors.
- `InventoryAdjustment.internalNote String?` — private context for manual adjustments without overloading the customer-neutral reason field.
- `WholesaleApplication.internalNotes String?` and `reviewedAt DateTime?` — preserve admin review context and decision time.

Existing structures are reused: category archival uses `active`, gift-box status uses `active`, publication reads existing food relations, orders use `OrderStatusHistory`, customer notes use `CustomerProfile.internalNotes`, and every mutation writes the existing `AuditLog` model. Integration secrets are never stored or displayed.

Migration: `prisma/migrations/20260715230000_admin_dashboard_fields/migration.sql`.
