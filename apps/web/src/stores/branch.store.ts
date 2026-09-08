'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { getPersistStorage } from './persist-storage';

interface BranchState {
  activeBranchId: string | null;
  setActiveBranchId: (branchId: string) => void;
  clearActiveBranch: () => void;
}

type PersistedBranchState = Pick<BranchState, 'activeBranchId'>;

export const useBranchStore = create<BranchState>()(
  persist(
    (set) => ({
      activeBranchId: null,
      setActiveBranchId: (activeBranchId) => set({ activeBranchId }),
      clearActiveBranch: () => set({ activeBranchId: null }),
    }),
    {
      name: 'warkop-active-branch',
      version: 1,
      storage: createJSONStorage<PersistedBranchState>(getPersistStorage),
      partialize: (state) => ({ activeBranchId: state.activeBranchId }),
      migrate: (persistedState): PersistedBranchState => {
        const candidate =
          persistedState && typeof persistedState === 'object'
            ? (persistedState as { activeBranchId?: unknown })
            : undefined;
        return {
          activeBranchId:
            typeof candidate?.activeBranchId === 'string'
              ? candidate.activeBranchId
              : null,
        };
      },
    },
  ),
);
