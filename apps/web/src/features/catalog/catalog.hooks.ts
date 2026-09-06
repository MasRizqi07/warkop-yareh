'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getBranches, getCatalog, toUiProduct } from './catalog.api';
import { useBranchStore } from '@/stores/branch.store';

export const catalogKeys = {
  branches: ['branches'] as const,
  catalog: (branchId: string) => ['catalog', branchId] as const,
};

export function useBranches() {
  return useQuery({
    queryKey: catalogKeys.branches,
    queryFn: getBranches,
    staleTime: 5 * 60_000,
  });
}

export function useActiveBranch() {
  const query = useBranches();
  const activeBranchId = useBranchStore((state) => state.activeBranchId);
  const setActiveBranchId = useBranchStore((state) => state.setActiveBranchId);
  const activeBranch =
    query.data?.find((branch) => branch.id === activeBranchId) ??
    query.data?.find((branch) => branch.isMainBranch) ??
    query.data?.[0] ??
    null;

  useEffect(() => {
    if (activeBranch && activeBranch.id !== activeBranchId) {
      setActiveBranchId(activeBranch.id);
    }
  }, [activeBranch, activeBranchId, setActiveBranchId]);

  return { ...query, activeBranch };
}

export function useCatalog(branchId: string | null | undefined) {
  return useQuery({
    queryKey: catalogKeys.catalog(branchId ?? 'none'),
    queryFn: () => getCatalog(branchId!),
    enabled: Boolean(branchId),
    select: (catalog) => ({
      ...catalog,
      products: catalog.products.map((product) =>
        toUiProduct(product, branchId!),
      ),
    }),
    staleTime: 60_000,
  });
}

