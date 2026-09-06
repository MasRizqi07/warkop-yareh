'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type FulfillmentType =
  | 'dine-in'
  | 'pickup'
  | 'drive-thru'
  | 'delivery';

interface CheckoutState {
  fulfillmentType: FulfillmentType;
  tableId: string | null;
  tableLabel: string;
  deliveryAddress: string;
  splitBillCount: number;
  setFulfillmentType: (type: FulfillmentType) => void;
  setTable: (tableId: string | null, tableLabel?: string) => void;
  setDeliveryAddress: (address: string) => void;
  setSplitBillCount: (count: number) => void;
  resetCheckout: () => void;
}

const initialState = {
  fulfillmentType: 'pickup' as FulfillmentType,
  tableId: null,
  tableLabel: '',
  deliveryAddress: '',
  splitBillCount: 1,
};

export const useCheckoutStore = create<CheckoutState>()(
  persist(
    (set) => ({
      ...initialState,
      setFulfillmentType: (fulfillmentType) => set({ fulfillmentType }),
      setTable: (tableId, tableLabel = '') => set({ tableId, tableLabel }),
      setDeliveryAddress: (deliveryAddress) => set({ deliveryAddress }),
      setSplitBillCount: (count) =>
        set({ splitBillCount: Math.min(10, Math.max(1, (Number.isFinite(count) ? Math.trunc(count) : 1))) }),
      resetCheckout: () => set(initialState),
    }),
    {
      name: 'warkop-checkout',
      version: 1,
      storage: createJSONStorage(() => window.localStorage),
    },
  ),
);

