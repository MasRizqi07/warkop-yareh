import { afterEach, describe, expect, it } from 'vitest';
import { type AppCartItem, useAppStore } from './useAppStore';

const cartItem: AppCartItem = {
  id: 'item-1',
  productId: 'product-1',
  name: 'Audit Coffee',
  price: 100_000,
  image: '/images/audit-coffee.png',
  quantity: 1,
  customizations: {
    sweetness: 'Normal (100%)',
    iceLevel: 'Normal Ice',
    milkType: 'Fresh Milk',
    beanRoast: 'Signature House Blend',
  },
  subtotal: 100_000,
};

const initialUser = useAppStore.getState().user;

afterEach(() => {
  useAppStore.setState({
    cartItems: [],
    appliedVoucher: null,
    redeemedPoints: 0,
    splitBillCount: 1,
    user: initialUser,
  });
});

describe('legacy client checkout state', () => {
  it('uses the production fee and loyalty contract and caps points by balance', () => {
    useAppStore.setState({
      cartItems: [cartItem],
      appliedVoucher: null,
      redeemedPoints: 0,
      user: { ...initialUser, points: 300 },
    });

    useAppStore.getState().setRedeemedPoints(500);

    expect(useAppStore.getState().redeemedPoints).toBe(300);
    expect(useAppStore.getState().getCartTotal()).toBe(86_000);
  });

  it('normalizes invalid split-bill values', () => {
    useAppStore.getState().setSplitBillCount(Number.POSITIVE_INFINITY);
    expect(useAppStore.getState().splitBillCount).toBe(1);

    useAppStore.getState().setSplitBillCount(99);
    expect(useAppStore.getState().splitBillCount).toBe(10);
  });
});
