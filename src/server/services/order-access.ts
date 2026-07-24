import "server-only";

import { createHash, timingSafeEqual } from "node:crypto";

import { db } from "@/lib/db/client";

/**
 * Loads an order for the customer-facing confirmation page.
 *
 * Guest checkouts have no session, so the only credential is the single-use
 * access token minted at checkout and handed back through the Stripe return
 * URL. Only its SHA-256 hash is stored, so we hash the candidate and compare
 * in constant time; the token also expires 24 hours after checkout.
 *
 * Returns null for every failure mode — unknown order, wrong token, expired
 * token — so the page cannot be used to probe which order numbers exist.
 */
export async function getOrderForAccessToken(
  orderNumber: string,
  accessToken: string,
) {
  if (!orderNumber || !accessToken) return null;
  if (!process.env.DATABASE_URL) return null;

  const order = await db.order.findUnique({
    where: { number: orderNumber },
    include: {
      items: true,
      addresses: true,
      giftBoxOrderItems: true,
      payments: { include: { refunds: true } },
      shipments: true,
    },
  });
  if (!order?.accessTokenHash) return null;
  if (order.accessTokenExpiresAt && order.accessTokenExpiresAt < new Date())
    return null;

  const expected = Buffer.from(order.accessTokenHash, "hex");
  const candidate = createHash("sha256").update(accessToken).digest();
  if (expected.length !== candidate.length) return null;
  if (!timingSafeEqual(expected, candidate)) return null;

  return order;
}

export type CustomerOrder = NonNullable<
  Awaited<ReturnType<typeof getOrderForAccessToken>>
>;

/**
 * Orders belonging to a signed-in customer, newest first, for the account
 * order-history list. Scoped by userId, so it only ever returns the caller's
 * own orders.
 */
export async function getOrdersForUser(userId: string) {
  if (!process.env.DATABASE_URL) return [];
  return db.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      number: true,
      createdAt: true,
      status: true,
      paymentStatus: true,
      totalCents: true,
      currency: true,
      _count: { select: { items: true, giftBoxOrderItems: true } },
    },
  });
}

export type CustomerOrderSummary = Awaited<
  ReturnType<typeof getOrdersForUser>
>[number];

/**
 * A single order for the signed-in customer, or null when it does not belong
 * to them. The ownership check (order.userId === userId) is what lets the
 * account order page trust the order number taken from the URL.
 */
export async function getOrderForUser(userId: string, orderNumber: string) {
  if (!orderNumber) return null;
  if (!process.env.DATABASE_URL) return null;
  const order = await db.order.findUnique({
    where: { number: orderNumber },
    include: {
      items: true,
      addresses: true,
      giftBoxOrderItems: true,
      payments: { include: { refunds: true } },
      shipments: true,
    },
  });
  if (!order || order.userId !== userId) return null;
  return order;
}
