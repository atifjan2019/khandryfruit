"use client";

import { useEffect } from "react";

import { useCart } from "@/features/cart/store";

/**
 * Empties the cart once an order is confirmed as paid. The success page is a
 * server component and cannot touch the browser-persisted cart, so a paid
 * order would otherwise leave its now-ordered lines (and un-repriceable gift
 * boxes) sitting in the cart. Rendered only when the order is paid, so an
 * unpaid/failed order keeps the cart for a retry.
 */
export function ClearCartOnSuccess() {
  const clear = useCart((state) => state.clear);
  useEffect(() => {
    clear();
  }, [clear]);
  return null;
}
