import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface CartItem {
  id: string;
  title: string;
  slug: string;
  price: string;
  fileKey: string;
}

interface CartState {
  items: CartItem[];
  shippingFee: number;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  setShippingFee: (fee: number) => void;
  getTotalItems: () => number;
  getSubtotal: () => number;
  getTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      shippingFee: 0,

      addItem: (item) => {
        const items = get().items;
        const existingItem = items.find((i) => i.id === item.id);

        // Không cho phép thêm cùng khóa học 2 lần
        if (!existingItem) {
          set({
            items: [...items, item],
          });
        }
      },

      removeItem: (id) => {
        set({
          items: get().items.filter((item) => item.id !== id),
        });
      },

      clearCart: () => {
        set({
          items: [],
        });
      },

      setShippingFee: (fee) => {
        set({ shippingFee: fee });
      },

      getTotalItems: () => {
        return get().items.length;
      },

      getSubtotal: () => {
        return get().items.reduce(
          (total, item) => total + parseFloat(item.price),
          0
        );
      },

      getTotal: () => {
        const subtotal = get().getSubtotal();
        const shipping = get().shippingFee;
        return Math.max(0, subtotal + shipping);
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
