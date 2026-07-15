export type CouponInput = {
  type: "PERCENTAGE" | "FIXED" | "FREE_SHIPPING";
  value: number;
  active: boolean;
  startsAt?: Date;
  expiresAt?: Date;
  usageCount: number;
  usageLimit?: number;
  customerUsageCount: number;
  perCustomerLimit?: number;
  minimumOrderCents?: number;
  maximumDiscountCents?: number;
};
export function calculateDiscount(
  coupon: CouponInput,
  subtotalCents: number,
  now = new Date(),
) {
  if (!coupon.active) throw new Error("COUPON_INACTIVE");
  if (coupon.startsAt && now < coupon.startsAt)
    throw new Error("COUPON_NOT_STARTED");
  if (coupon.expiresAt && now > coupon.expiresAt)
    throw new Error("COUPON_EXPIRED");
  if (coupon.usageLimit !== undefined && coupon.usageCount >= coupon.usageLimit)
    throw new Error("COUPON_USAGE_LIMIT");
  if (
    coupon.perCustomerLimit !== undefined &&
    coupon.customerUsageCount >= coupon.perCustomerLimit
  )
    throw new Error("CUSTOMER_USAGE_LIMIT");
  if (
    coupon.minimumOrderCents !== undefined &&
    subtotalCents < coupon.minimumOrderCents
  )
    throw new Error("MINIMUM_ORDER_NOT_MET");
  let discount =
    coupon.type === "PERCENTAGE"
      ? Math.round((subtotalCents * coupon.value) / 10_000)
      : coupon.type === "FIXED"
        ? coupon.value
        : 0;
  if (coupon.maximumDiscountCents !== undefined)
    discount = Math.min(discount, coupon.maximumDiscountCents);
  return Math.min(discount, subtotalCents);
}
