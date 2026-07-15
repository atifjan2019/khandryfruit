export const orderTransitions = {
  PENDING_PAYMENT: ["PAID", "CANCELLED", "PAYMENT_FAILED"],
  PAYMENT_FAILED: ["PENDING_PAYMENT", "CANCELLED"],
  PAID: ["PROCESSING", "REFUNDED", "PARTIALLY_REFUNDED", "CANCELLED"],
  PROCESSING: ["PACKED", "CANCELLED", "PARTIALLY_REFUNDED"],
  PACKED: ["SHIPPED"],
  SHIPPED: ["DELIVERED", "RETURN_REQUESTED"],
  DELIVERED: ["RETURN_REQUESTED", "PARTIALLY_REFUNDED", "REFUNDED"],
  RETURN_REQUESTED: ["PARTIALLY_REFUNDED", "REFUNDED"],
  CANCELLED: [],
  REFUNDED: [],
  PARTIALLY_REFUNDED: ["REFUNDED"],
} as const;

export type DomainOrderStatus = keyof typeof orderTransitions;

export class InvalidOrderTransitionError extends Error {
  readonly code = "INVALID_ORDER_TRANSITION";

  constructor(from: DomainOrderStatus, to: DomainOrderStatus) {
    super(`Order cannot transition from ${from} to ${to}`);
    this.name = "InvalidOrderTransitionError";
  }
}

export function assertOrderTransition(
  from: DomainOrderStatus,
  to: DomainOrderStatus,
) {
  const allowed = orderTransitions[from] as readonly DomainOrderStatus[];
  if (!allowed.includes(to)) throw new InvalidOrderTransitionError(from, to);
}
