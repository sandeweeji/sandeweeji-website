"use client";

/* ================================
   SANDWEEJI — Cart Store (Zustand)
   ================================ */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "./types";

interface CartStore {
  items: CartItem[];
  isOpen: boolean;

  // Actions
  addItem: (item: Omit<CartItem, "id">) => void;
  updateItem: (id: string, item: Omit<CartItem, "id">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  updateNotes: (id: string, notes: string) => void;
  clearCart: () => void;

  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;

  // Computed
  totalItems: () => number;
  subtotal: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item) => {
        const extrasKey = [...item.extras]
          .sort((a, b) => a.id.localeCompare(b.id))
          .map((e) => e.id)
          .join(",");

        const entryId = `${item.productId}__${extrasKey}`;

        set((state) => {
          const existing = state.items.find((i) => i.id === entryId);

          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === entryId
                  ? {
                      ...i,
                      quantity: i.quantity + item.quantity,
                      notes: item.notes || i.notes,
                    }
                  : i,
              ),
              isOpen: true,
            };
          }

          return {
            items: [
              ...state.items,
              {
                ...item,
                id: entryId,
              },
            ],
            isOpen: true,
          };
        });
      },

      updateItem: (id, item) => {
        const extrasKey = [...item.extras]
          .sort((a, b) => a.id.localeCompare(b.id))
          .map((e) => e.id)
          .join(",");

        const newId = `${item.productId}__${extrasKey}`;

        set((state) => {
          // If the edited configuration already exists as another
          // cart line, merge the quantities instead of creating duplicates.
          const duplicate = state.items.find(
            (i) => i.id === newId && i.id !== id,
          );

          if (duplicate) {
            return {
              items: state.items
                .filter((i) => i.id !== id)
                .map((i) =>
                  i.id === newId
                    ? {
                        ...i,
                        quantity: i.quantity + item.quantity,
                        notes: item.notes || i.notes,
                      }
                    : i,
                ),
            };
          }

          return {
            items: state.items.map((i) =>
              i.id === id
                ? {
                    ...item,
                    id: newId,
                  }
                : i,
            ),
          };
        });
      },

      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        })),

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }

        set((state) => ({
          items: state.items.map((i) =>
            i.id === id
              ? {
                  ...i,
                  quantity,
                }
              : i,
          ),
        }));
      },

      updateNotes: (id, notes) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id
              ? {
                  ...i,
                  notes,
                }
              : i,
          ),
        })),

      clearCart: () =>
        set({
          items: [],
        }),

      openCart: () =>
        set({
          isOpen: true,
        }),

      closeCart: () =>
        set({
          isOpen: false,
        }),

      toggleCart: () =>
        set((state) => ({
          isOpen: !state.isOpen,
        })),

      totalItems: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),

      subtotal: () =>
        get().items.reduce((sum, item) => {
          const extrasTotal = item.extras.reduce(
            (extraSum, extra) => extraSum + extra.price,
            0,
          );

          return sum + (item.price + extrasTotal) * item.quantity;
        }, 0),
    }),
    {
      name: "sandweeji-cart",

      partialize: (state) => ({
        items: state.items,
      }),
    },
  ),
);
