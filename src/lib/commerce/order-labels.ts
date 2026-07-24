import type { AppLocale } from "@/config/site";

/** Bilingual [de, en] labels for the fulfilment status. */
const STATUS_LABELS: Record<string, [string, string]> = {
  PENDING: ["Zahlung ausstehend", "Awaiting payment"],
  CONFIRMED: ["Bestätigt", "Confirmed"],
  PROCESSING: ["In Bearbeitung", "Processing"],
  SHIPPED: ["Versendet", "Shipped"],
  DELIVERED: ["Zugestellt", "Delivered"],
  COMPLETED: ["Abgeschlossen", "Completed"],
  CANCELLED: ["Storniert", "Cancelled"],
};

/** Bilingual [de, en] labels for the payment status. */
const PAYMENT_LABELS: Record<string, [string, string]> = {
  UNPAID: ["Offen", "Unpaid"],
  PAID: ["Bezahlt", "Paid"],
  REFUNDED: ["Erstattet", "Refunded"],
};

export function orderStatusLabel(status: string, locale: AppLocale) {
  const label = STATUS_LABELS[status];
  return label ? (locale === "de" ? label[0] : label[1]) : status;
}

export function paymentStatusLabel(status: string, locale: AppLocale) {
  const label = PAYMENT_LABELS[status];
  return label ? (locale === "de" ? label[0] : label[1]) : status;
}

/** Pill modifier class shared by the account order list and detail pages. */
export function paymentPillClass(order: {
  paymentStatus: string;
  status: string;
}) {
  if (order.paymentStatus === "PAID") return "is-paid";
  if (order.status === "CANCELLED") return "is-failed";
  return "is-pending";
}
