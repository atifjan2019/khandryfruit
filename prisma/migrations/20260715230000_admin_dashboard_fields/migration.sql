-- Additive fields required by the production admin dashboard.
ALTER TABLE "ProductVariant" ADD COLUMN "sortOrder" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "InventoryAdjustment" ADD COLUMN "internalNote" TEXT;
ALTER TABLE "WholesaleApplication" ADD COLUMN "internalNotes" TEXT;
ALTER TABLE "WholesaleApplication" ADD COLUMN "reviewedAt" TIMESTAMP(3);
