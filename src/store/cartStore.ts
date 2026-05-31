import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, Product, ProductVariant } from '../types';

function itemKey(productId: string, variantId: string | null | undefined) {
  return `${productId}:${variantId ?? 'base'}`;
}

interface CartState {
  items: CartItem[];
  addItem: (product: Product, variant: ProductVariant | null, quantity?: number) => void;
  removeItem: (productId: string, variantId?: string | null) => void;
  updateQuantity: (productId: string, variantId: string | null | undefined, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  subtotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, variant, quantity = 1) => {
        const key = itemKey(product.id, variant?.id);
        const maxStock = variant ? variant.stock : product.stock;
        set((state) => {
          const existing = state.items.find(
            (i) => itemKey(i.product.id, i.variant?.id) === key
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                itemKey(i.product.id, i.variant?.id) === key
                  ? { ...i, quantity: Math.min(i.quantity + quantity, maxStock) }
                  : i
              ),
            };
          }
          return { items: [...state.items, { product, variant, quantity }] };
        });
      },

      removeItem: (productId, variantId) => {
        const key = itemKey(productId, variantId);
        set((state) => ({
          items: state.items.filter((i) => itemKey(i.product.id, i.variant?.id) !== key),
        }));
      },

      updateQuantity: (productId, variantId, quantity) => {
        const key = itemKey(productId, variantId);
        if (quantity <= 0) {
          get().removeItem(productId, variantId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            itemKey(i.product.id, i.variant?.id) === key ? { ...i, quantity } : i
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      subtotal: () =>
        get().items.reduce(
          (sum, i) => sum + (i.variant ? i.variant.price : i.product.price) * i.quantity,
          0
        ),
    }),
    { name: 'lp_cart' }
  )
);
