"use server";

import { z } from "zod";

import {
  cartLineSchema,
  checkoutGiftBoxSchema,
  localeSchema,
} from "@/lib/validation/schemas";
import { checkRateLimit } from "@/lib/rate-limit";
import { logger } from "@/lib/logging/logger";
import { publicRequestMeta } from "@/server/actions/shared";
import { calculateCart, CommerceError } from "@/server/services/checkout";
import { resolveCoupon } from "@/server/services/coupon";
import {
  findUnavailableConfigurationIds,
  loadGiftBoxCheckoutLines,
} from "@/server/services/gift-box";

// Coupon checks are cheap but guessable, so cap attempts per IP.
const RATE_LIMIT = { limit: 20, windowMs: 10 * 60_000 };
// Cart pricing just re-reads the catalogue and fires on every cart change, so
// its bucket is far more generous than the coupon guard.
const CART_RATE_LIMIT = { limit: 120, windowMs: 60_000 };

const schema = z.object({
  locale: localeSchema,
  code: z.string().trim().min(1).max(32),
  lines: z.array(cartLineSchema).max(50).default([]),
  giftBoxes: z.array(checkoutGiftBoxSchema).max(10).default([]),
});

const cartSchema = z.object({
  locale: localeSchema,
  lines: z.array(cartLineSchema).max(50).default([]),
  giftBoxes: z.array(checkoutGiftBoxSchema).max(10).default([]),
});

export type CartPreview =
  | {
      ok: true;
      subtotalCents: number;
      shippingCents: number;
      taxCents: number;
      totalCents: number;
      /** Cart gift boxes that were already ordered/expired and got skipped. */
      unavailableGiftBoxIds: string[];
    }
  | { ok: false; unavailableGiftBoxIds: string[] };

/**
 * Prices the current cart server-side so the cart and checkout summaries can
 * show real shipping, included VAT and total before payment — using the same
 * {@link calculateCart} the checkout route trusts, so the numbers never drift
 * from what Stripe is finally charged.
 *
 * Gift boxes that can no longer be priced (already ordered, expired) are
 * reported in `unavailableGiftBoxIds` and excluded from the total, so the cart
 * can prune the stale line rather than the whole preview failing. Returns
 * `{ ok: false }` only when nothing priceable remains.
 */
export async function previewCartAction(
  rawInput: unknown,
): Promise<CartPreview> {
  const meta = await publicRequestMeta();
  try {
    const rate = await checkRateLimit(
      `cart:${meta.ipAddress}`,
      CART_RATE_LIMIT,
    );
    if (!rate.allowed) return { ok: false, unavailableGiftBoxIds: [] };

    const input = cartSchema.parse(rawInput);

    const unavailableGiftBoxIds = await findUnavailableConfigurationIds(
      input.giftBoxes.map((box) => box.configurationId),
    );
    const validGiftBoxes = input.giftBoxes.filter(
      (box) => !unavailableGiftBoxIds.includes(box.configurationId),
    );

    if (input.lines.length === 0 && validGiftBoxes.length === 0)
      return { ok: false, unavailableGiftBoxIds };

    const giftBoxLines = await loadGiftBoxCheckoutLines(
      input.locale,
      validGiftBoxes,
    );
    const calculation = await calculateCart(
      input.locale,
      input.lines,
      "DE",
      giftBoxLines,
    );
    return {
      ok: true,
      subtotalCents: calculation.subtotalCents,
      shippingCents: calculation.shippingCents,
      taxCents: calculation.taxCents,
      totalCents: calculation.totalCents,
      unavailableGiftBoxIds,
    };
  } catch (error) {
    if (error instanceof CommerceError)
      return { ok: false, unavailableGiftBoxIds: [] };
    logger.error("cart_preview_failed", {
      correlationId: meta.correlationId,
      errorType: error instanceof Error ? error.name : "unknown",
    });
    return { ok: false, unavailableGiftBoxIds: [] };
  }
}

export type CouponPreview =
  | {
      ok: true;
      code: string;
      discountCents: number;
      freeShipping: boolean;
      subtotalCents: number;
      shippingCents: number;
      totalCents: number;
    }
  | { ok: false; reason: string };

/**
 * Validates a coupon against the current cart and returns the resulting
 * discount, so the checkout page can preview it before payment. The route
 * re-validates on submit, so this is a convenience, not a source of truth.
 */
export async function previewCouponAction(
  rawInput: unknown,
): Promise<CouponPreview> {
  const meta = await publicRequestMeta();
  try {
    const rate = await checkRateLimit(`coupon:${meta.ipAddress}`, RATE_LIMIT);
    if (!rate.allowed)
      return { ok: false, reason: "Too many attempts. Please wait a moment." };

    const input = schema.parse(rawInput);
    if (input.lines.length === 0 && input.giftBoxes.length === 0)
      return { ok: false, reason: "Your cart is empty." };

    const giftBoxLines = await loadGiftBoxCheckoutLines(
      input.locale,
      input.giftBoxes,
    );
    const calculation = await calculateCart(
      input.locale,
      input.lines,
      "DE",
      giftBoxLines,
    );

    const resolved = await resolveCoupon(input.code, calculation.subtotalCents);
    if (!resolved.ok) return { ok: false, reason: resolved.reason };

    const shippingCents = resolved.freeShipping ? 0 : calculation.shippingCents;
    return {
      ok: true,
      code: resolved.code,
      discountCents: resolved.discountCents,
      freeShipping: resolved.freeShipping,
      subtotalCents: calculation.subtotalCents,
      shippingCents,
      totalCents:
        calculation.subtotalCents - resolved.discountCents + shippingCents,
    };
  } catch (error) {
    if (error instanceof CommerceError)
      return { ok: false, reason: "Your cart could not be priced." };
    logger.error("coupon_preview_failed", {
      correlationId: meta.correlationId,
      errorType: error instanceof Error ? error.name : "unknown",
    });
    return { ok: false, reason: "The code could not be checked. Try again." };
  }
}
