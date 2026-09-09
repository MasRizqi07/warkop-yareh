import { afterEach, describe, expect, it, vi } from 'vitest';
import type { User } from '@warkop-yareh/types';
import { getPersistStorage } from './persist-storage';
import { useAuthStore } from './auth.store';
import { useBranchStore } from './branch.store';
import { useCheckoutStore } from './checkout.store';
import { useCartStore, useThemeStore } from './index';

afterEach(() => {
  vi.unstubAllGlobals();
  window.localStorage.clear();
});

describe('browser-only Zustand persistence', () => {
  it('uses a no-op adapter when window is unavailable', () => {
    vi.stubGlobal('window', undefined);

    const storage = getPersistStorage();

    expect(storage.getItem('state')).toBeNull();
    expect(() => storage.setItem('state', '{}')).not.toThrow();
    expect(() => storage.removeItem('state')).not.toThrow();
  });

  it('never persists access tokens', () => {
    const user = {
      id: 'customer-1',
      name: 'Customer',
      email: 'customer@example.com',
    } as User;

    useAuthStore.getState().setAuth(user, 'secret-access-token');

    const serialized = window.localStorage.getItem('coldnbrew-auth') ?? '';
    expect(serialized).toContain('customer@example.com');
    expect(serialized).not.toContain('secret-access-token');
    expect(serialized).not.toContain('accessToken');
  });

  it('sanitizes legacy persisted values during version migrations', async () => {
    const authMigration = useAuthStore.persist.getOptions().migrate;
    const branchMigration = useBranchStore.persist.getOptions().migrate;
    const checkoutMigration = useCheckoutStore.persist.getOptions().migrate;
    const themeMigration = useThemeStore.persist.getOptions().migrate;
    const cartMigration = useCartStore.persist.getOptions().migrate;

    expect(await authMigration?.('invalid', 1)).toEqual({ user: null });
    expect(await branchMigration?.({ activeBranchId: 12 }, 0)).toEqual({
      activeBranchId: null,
    });
    expect(
      await checkoutMigration?.(
        {
          fulfillmentType: 'teleport',
          tableId: 12,
          tableLabel: null,
          deliveryAddress: false,
          splitBillCount: 99,
        },
        0
      )
    ).toEqual({
      fulfillmentType: 'pickup',
      tableId: null,
      tableLabel: '',
      deliveryAddress: '',
      splitBillCount: 10,
    });
    expect(await themeMigration?.({ isDark: 'yes' }, 0)).toEqual({
      isDark: true,
    });
    expect(await cartMigration?.({ items: 'invalid' }, 1)).toEqual({
      items: [],
    });
  });
});
