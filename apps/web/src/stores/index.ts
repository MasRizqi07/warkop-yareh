"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, Product } from "@warkop-yareh/types";

// ---- Theme Store ----
interface ThemeStore {
  isDark: boolean;
  toggle: () => void;
  setDark: (dark: boolean) => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      isDark: false,
      toggle: () =>
        set((state) => {
          const newDark = !state.isDark;
          if (typeof document !== "undefined") {
            document.documentElement.classList.toggle("dark", newDark);
          }
          return { isDark: newDark };
        }),
      setDark: (dark: boolean) => {
        if (typeof document !== "undefined") {
          document.documentElement.classList.toggle("dark", dark);
        }
        set({ isDark: dark });
      },
    }),
    { name: "warkop-theme" },
  ),
);

export function getCartItemId(
  productId: string,
  customizations?: Record<string, string>,
  notes?: string,
): string {
  if (!customizations && !notes) return productId;
  const parts: string[] = [productId];
  if (customizations) {
    const sortedKeys = Object.keys(customizations).sort();
    const custStr = sortedKeys
      .map((k) => `${k}:${customizations[k]}`)
      .join(",");
    parts.push(`customizations:${custStr}`);
  }
  if (notes) {
    parts.push(`notes:${notes}`);
  }
  return parts.join("?");
}

// ---- Cart Store ----
interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (
    product: Product,
    quantity?: number,
    customizations?: Record<string, string>,
    notes?: string,
  ) => void;
  removeItem: (
    productId: string,
    customizations?: Record<string, string>,
    notes?: string,
  ) => void;
  updateQuantity: (
    productId: string,
    quantity: number,
    customizations?: Record<string, string>,
    notes?: string,
  ) => void;
  clearCart: () => void;
  toggleCart: () => void;
  setCartOpen: (open: boolean) => void;
  total: () => number;
  itemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      addItem: (product, quantity = 1, customizations, notes) =>
        set((state) => {
          const itemKey = getCartItemId(product.id, customizations, notes);
          const existingIndex = state.items.findIndex(
            (item) =>
              getCartItemId(
                item.product.id,
                item.customizations,
                item.notes,
              ) === itemKey,
          );
          if (existingIndex > -1) {
            const updatedItems = [...state.items];
            updatedItems[existingIndex] = {
              ...updatedItems[existingIndex],
              quantity: updatedItems[existingIndex].quantity + quantity,
            };
            return { items: updatedItems };
          }
          return {
            items: [
              ...state.items,
              { product, quantity, customizations, notes },
            ],
          };
        }),
      removeItem: (productId, customizations, notes) =>
        set((state) => {
          const itemKey = getCartItemId(productId, customizations, notes);
          return {
            items: state.items.filter(
              (item) =>
                getCartItemId(
                  item.product.id,
                  item.customizations,
                  item.notes,
                ) !== itemKey,
            ),
          };
        }),
      updateQuantity: (productId, quantity, customizations, notes) =>
        set((state) => {
          const itemKey = getCartItemId(productId, customizations, notes);
          return {
            items:
              quantity <= 0
                ? state.items.filter(
                    (item) =>
                      getCartItemId(
                        item.product.id,
                        item.customizations,
                        item.notes,
                      ) !== itemKey,
                  )
                : state.items.map((item) =>
                    getCartItemId(
                      item.product.id,
                      item.customizations,
                      item.notes,
                    ) === itemKey
                      ? { ...item, quantity }
                      : item,
                  ),
          };
        }),
      clearCart: () => set({ items: [] }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      setCartOpen: (open) => set({ isOpen: open }),
      total: () =>
        get().items.reduce(
          (sum, item) => sum + item.product.price * item.quantity,
          0,
        ),
      itemCount: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),
    }),
    { name: "warkop-cart" },
  ),
);

export * from "./useUserStore";
export * from "./useReservationStore";

// ---- UI Store ----
interface UIStore {
  isMobileMenuOpen: boolean;
  isSearchOpen: boolean;
  activeModal: string | null;
  setMobileMenu: (open: boolean) => void;
  setSearchOpen: (open: boolean) => void;
  openModal: (id: string) => void;
  closeModal: () => void;
}

export const useUIStore = create<UIStore>()((set) => ({
  isMobileMenuOpen: false,
  isSearchOpen: false,
  activeModal: null,
  setMobileMenu: (open) => set({ isMobileMenuOpen: open }),
  setSearchOpen: (open) => set({ isSearchOpen: open }),
  openModal: (id) => set({ activeModal: id }),
  closeModal: () => set({ activeModal: null }),
}));
