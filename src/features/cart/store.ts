"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type CartItem = {
  variantId: string;
  productId: string;
  slug: string;
  name: string;
  weightGrams: number;
  unitPriceCents: number;
  image: string;
  quantity: number;
};
type CartState = {
  items: CartItem[];
  add: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  update: (variantId: string, quantity: number) => void;
  remove: (variantId: string) => void;
  clear: () => void;
};

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      add: (item, quantity = 1) =>
        set((state) => {
          const current = state.items.find(
            (line) => line.variantId === item.variantId,
          );
          return {
            items: current
              ? state.items.map((line) =>
                  line.variantId === item.variantId
                    ? {
                        ...line,
                        quantity: Math.min(20, line.quantity + quantity),
                      }
                    : line,
                )
              : [...state.items, { ...item, quantity }],
          };
        }),
      update: (variantId, quantity) =>
        set((state) => ({
          items:
            quantity < 1
              ? state.items.filter((line) => line.variantId !== variantId)
              : state.items.map((line) =>
                  line.variantId === variantId
                    ? { ...line, quantity: Math.min(20, quantity) }
                    : line,
                ),
        })),
      remove: (variantId) =>
        set((state) => ({
          items: state.items.filter((line) => line.variantId !== variantId),
        })),
      clear: () => set({ items: [] }),
    }),
    { name: "khan-dry-fruit-cart", version: 1 },
  ),
);
