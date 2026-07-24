import "server-only";

import { calculateDiscount } from "@/lib/commerce/coupon";
import { db } from "@/lib/db/client";

export type CouponResolution =
  | {
      ok: true;
      couponId: string;
      code: string;
      /** Discount applied to the subtotal, in cents (0 for free shipping). */
      discountCents: number;
      /** Whether the coupon waives the shipping charge. */
      freeShipping: boolean;
    }
  | { ok: false; code: string; reason: string };

const REASONS: Record<string, string> = {
  COUPON_INACTIVE: "This code is no longer active.",
  COUPON_NOT_STARTED: "This code is not active yet.",
  COUPON_EXPIRED: "This code has expired.",
  COUPON_USAGE_LIMIT: "This code has reached its usage limit.",
  CUSTOMER_USAGE_LIMIT: "You have already used this code.",
  MINIMUM_ORDER_NOT_MET: "Your order does not meet the minimum for this code.",
};

/**
 * Validates a coupon code against a subtotal and returns the discount.
 *
 * The single source of truth for whether a coupon applies — used both by the
 * checkout "apply" step (for a friendly preview) and by the checkout route
 * itself, which re-validates so a browser-submitted discount is never trusted.
 *
 * Usage counts come from committed `CouponUsage` rows (redemptions), so a code
 * that has hit its limit is rejected even if the admin's number differs.
 */
export async function resolveCoupon(
  rawCode: string,
  subtotalCents: number,
  userId?: string | null,
): Promise<CouponResolution> {
  const code = rawCode.trim().toUpperCase();
  if (!code) return { ok: false, code, reason: "Enter a code." };

  const coupon = await db.coupon.findUnique({ where: { code } });
  if (!coupon) return { ok: false, code, reason: "This code is not valid." };

  const [usageCount, customerUsageCount] = await Promise.all([
    db.couponUsage.count({ where: { couponId: coupon.id } }),
    userId
      ? db.couponUsage.count({ where: { couponId: coupon.id, userId } })
      : Promise.resolve(0),
  ]);

  try {
    const discount = calculateDiscount(
      {
        type: coupon.type,
        value: coupon.value,
        active: coupon.active,
        startsAt: coupon.startsAt ?? undefined,
        expiresAt: coupon.expiresAt ?? undefined,
        usageCount,
        usageLimit: coupon.usageLimit ?? undefined,
        customerUsageCount,
        perCustomerLimit: coupon.perCustomerLimit ?? undefined,
        minimumOrderCents: coupon.minimumOrderCents ?? undefined,
        maximumDiscountCents: coupon.maximumDiscountCents ?? undefined,
      },
      subtotalCents,
    );
    return {
      ok: true,
      couponId: coupon.id,
      code,
      discountCents: coupon.type === "FREE_SHIPPING" ? 0 : discount,
      freeShipping: coupon.type === "FREE_SHIPPING",
    };
  } catch (error) {
    const key = error instanceof Error ? error.message : "COUPON_INVALID";
    return {
      ok: false,
      code,
      reason: REASONS[key] ?? "This code cannot be applied.",
    };
  }
}

/**
 * Records a coupon redemption when an order is paid.
 *
 * Idempotent via the unique (couponId, orderId) constraint, so a redelivered
 * webhook cannot double-count usage. Called from payment confirmation.
 */
export async function recordCouponRedemption(
  tx: Parameters<Parameters<typeof db.$transaction>[0]>[0],
  input: {
    code: string;
    orderId: string;
    userId: string | null;
    amountCents: number;
  },
) {
  const coupon = await tx.coupon.findUnique({ where: { code: input.code } });
  if (!coupon) return;
  await tx.couponUsage.upsert({
    where: {
      couponId_orderId: { couponId: coupon.id, orderId: input.orderId },
    },
    create: {
      couponId: coupon.id,
      orderId: input.orderId,
      userId: input.userId,
      amountCents: input.amountCents,
    },
    update: {},
  });
}
