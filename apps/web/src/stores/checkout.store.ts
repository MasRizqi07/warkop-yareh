'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { getPersistStorage } from './persist-storage';

export type FulfillmentType = 'dine-in' | 'pickup';

interface CheckoutState {
  fulfillmentType: FulfillmentType;
  tableId: string | null;
  tableLabel: string;
  splitBillCount: number;
  setFulfillmentType: (type: FulfillmentType) => void;
  setTable: (tableId: string | null, tableLabel?: string) => void;
  setSplitBillCount: (count: number) => void;
  resetCheckout: () => void;
}

type PersistedCheckoutState = Pick<
  CheckoutState,
  | 'fulfillmentType'
  | 'tableId'
  | 'tableLabel'
  | 'splitBillCount'
>;

const initialState: PersistedCheckoutState = {
  fulfillmentType: 'pickup' as FulfillmentType,
  tableId: null,
  tableLabel: '',
  splitBillCount: 1,
};

const fulfillmentTypes: ReadonlySet<string> = new Set([
  'dine-in',
  'pickup',
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
        splitBillCount: state.splitBillCount,
      }),
      migrate: migrateCheckoutState,
    },
  ),
);

