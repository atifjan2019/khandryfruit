import { createHash, randomUUID } from "node:crypto";
import type Stripe from "stripe";
import { db } from "@/lib/db/client";
import { env } from "@/lib/env";
import { logger } from "@/lib/logging/logger";
import { getStripe } from "@/lib/stripe/client";

export async function POST(request: Request) {
  const correlationId = randomUUID();
  const signature = request.headers.get("stripe-signature");
  const body = await request.text();
  if (!signature || !env.STRIPE_WEBHOOK_SECRET)
    return Response.json(
      { error: "Webhook configuration missing" },
      { status: 400 },
    );
  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      env.STRIPE_WEBHOOK_SECRET,
    );
  } catch {
    logger.warn("stripe_webhook_rejected", { correlationId });
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }
  logger.info("stripe_webhook_received", {
    correlationId,
    stripeEventId: event.id,
    eventType: event.type,
  });
  const existing = await db.stripeEvent.findUnique({ where: { id: event.id } });
  if (existing?.processedAt)
    return Response.json({ received: true, duplicate: true });
  await db.stripeEvent.upsert({
    where: { id: event.id },
    create: {
      id: event.id,
      type: event.type,
      livemode: event.livemode,
      payloadHash: createHash("sha256").update(body).digest("hex"),
      attempts: 1,
    },
    update: { attempts: { increment: 1 } },
  });
  try {
    if (
      [
        "checkout.session.completed",
        "checkout.session.async_payment_succeeded",
      ].includes(event.type)
    )
      await confirmCheckout(
        event.data.object as Stripe.Checkout.Session,
        event.id,
      );
    else if (event.type === "checkout.session.async_payment_failed")
      await failCheckout(event.data.object as Stripe.Checkout.Session);
    else if (event.type === "payment_intent.payment_failed")
      await failPayment(event.data.object as Stripe.PaymentIntent);
    else if (event.type === "charge.refunded")
      await recordRefund(event.data.object as Stripe.Charge);
    await db.stripeEvent.update({
      where: { id: event.id },
      data: { processedAt: new Date(), error: null },
    });
    return Response.json({ received: true });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message.slice(0, 500)
        : "Unknown processing error";
    await db.stripeEvent.update({
      where: { id: event.id },
      data: { error: message },
    });
    logger.error("stripe_webhook_failed", {
      correlationId,
      stripeEventId: event.id,
    });
    return Response.json({ error: "Processing failed" }, { status: 500 });
  }
}

async function confirmCheckout(
  session: Stripe.Checkout.Session,
  eventId: string,
) {
  const orderId = session.metadata?.orderId;
  if (!orderId || session.payment_status !== "paid") return;
  await db.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { reservations: true },
    });
    if (!order || order.paymentStatus === "PAID") return;
    for (const reservation of order.reservations.filter(
      (item) => !item.convertedAt && !item.releasedAt,
    )) {
      await tx.inventory.update({
        where: { id: reservation.inventoryId },
        data: {
          onHand: { decrement: reservation.quantity },
          reserved: { decrement: reservation.quantity },
          version: { increment: 1 },
          adjustments: {
            create: {
              type: "SALE",
              quantity: -reservation.quantity,
              reason: "Verified Stripe payment",
              reference: eventId,
            },
          },
        },
      });
      await tx.stockReservation.update({
        where: { id: reservation.id },
        data: { convertedAt: new Date() },
      });
    }
    await tx.order.update({
      where: { id: orderId },
      data: {
        status: "PAID",
        paymentStatus: "PAID",
        paidAt: new Date(),
        payments: {
          updateMany: {
            where: { status: { in: ["PENDING", "PROCESSING"] } },
            data: {
              status: "PAID",
              providerPaymentId:
                typeof session.payment_intent === "string"
                  ? session.payment_intent
                  : session.payment_intent?.id,
              paidAt: new Date(),
            },
          },
        },
        statusHistory: {
          create: {
            oldStatus: order.status,
            newStatus: "PAID",
            reason: "Stripe payment verified",
          },
        },
      },
    });
  });
  logger.info("payment_confirmed", { orderId, stripeEventId: eventId });
}
async function failCheckout(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.orderId;
  if (!orderId) return;
  await db.order.update({
    where: { id: orderId },
    data: {
      status: "PAYMENT_FAILED",
      paymentStatus: "FAILED",
      payments: {
        updateMany: {
          where: { status: { in: ["PENDING", "PROCESSING"] } },
          data: { status: "FAILED" },
        },
      },
      statusHistory: {
        create: {
          oldStatus: "PENDING_PAYMENT",
          newStatus: "PAYMENT_FAILED",
          reason: "Stripe asynchronous payment failed",
        },
      },
    },
  });
}
async function failPayment(intent: Stripe.PaymentIntent) {
  const orderId = intent.metadata.orderId;
  if (!orderId) return;
  await db.payment.updateMany({
    where: { orderId },
    data: {
      status: "FAILED",
      failureCode: intent.last_payment_error?.code,
      failureMessage: intent.last_payment_error?.message?.slice(0, 300),
    },
  });
}
async function recordRefund(charge: Stripe.Charge) {
  const paymentIntent =
    typeof charge.payment_intent === "string"
      ? charge.payment_intent
      : charge.payment_intent?.id;
  if (!paymentIntent || charge.amount_refunded <= 0) return;
  const payment = await db.payment.findUnique({
    where: { providerPaymentId: paymentIntent },
  });
  if (!payment) return;
  const full = charge.amount_refunded >= payment.amountCents;
  await db.order.update({
    where: { id: payment.orderId },
    data: {
      paymentStatus: full ? "REFUNDED" : "PARTIALLY_REFUNDED",
      status: full ? "REFUNDED" : "PARTIALLY_REFUNDED",
    },
  });
}
