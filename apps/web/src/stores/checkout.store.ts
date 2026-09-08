'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { getPersistStorage } from './persist-storage';

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

type PersistedCheckoutState = Pick<
  CheckoutState,
  | 'fulfillmentType'
  | 'tableId'
  | 'tableLabel'
  | 'deliveryAddress'
  | 'splitBillCount'
>;

const initialState: PersistedCheckoutState = {
  fulfillmentType: 'pickup' as FulfillmentType,
  tableId: null,
  tableLabel: '',
  deliveryAddress: '',
  splitBillCount: 1,
};

const fulfillmentTypes: ReadonlySet<string> = new Set([
  'dine-in',
  'pickup',
  'drive-thru',
  'delivery',
]);

function migrateCheckoutState(persistedState: unknown): PersistedCheckoutState {
  const candidate =
    persistedState && typeof persistedState === 'object'
      ? (persistedState as Record<string, unknown>)
      : {};
  const rawSplitBillCount = Number(candidate.splitBillCount);

  return {
    fulfillmentType:
      typeof candidate.fulfillmentType === 'string' &&
      fulfillmentTypes.has(candidate.fulfillmentType)
        ? (candidate.fulfillmentType as FulfillmentType)
        : initialState.fulfillmentType,
    tableId: typeof candidate.tableId === 'string' ? candidate.tableId : null,
    tableLabel:
      typeof candidate.tableLabel === 'string' ? candidate.tableLabel : '',
    deliveryAddress:
      typeof candidate.deliveryAddress === 'string'
        ? candidate.deliveryAddress
        : '',
    splitBillCount: Number.isFinite(rawSplitBillCount)
      ? Math.min(10, Math.max(1, Math.trunc(rawSplitBillCount)))
      : 1,
  };
}

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
      storage: createJSONStorage<PersistedCheckoutState>(getPersistStorage),
      partialize: (state) => ({
        fulfillmentType: state.fulfillmentType,
        tableId: state.tableId,
        tableLabel: state.tableLabel,
        deliveryAddress: state.deliveryAddress,
        splitBillCount: state.splitBillCount,
      }),
      migrate: migrateCheckoutState,
    },
  ),
);

