'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface BranchState {
  activeBranchId: string | null;
  setActiveBranchId: (branchId: string) => void;
  clearActiveBranch: () => void;
}

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
      storage: createJSONStorage(() =>
        typeof window !== 'undefined'
          ? window.localStorage
          : {
              getItem: () => null,
              setItem: () => {},
              removeItem: () => {},
            }
      ),
      migrate: (persistedState: any) => {
        return persistedState || { activeBranchId: null };
      },
    },
  ),
);

