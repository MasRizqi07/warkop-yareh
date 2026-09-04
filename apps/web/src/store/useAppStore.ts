"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  MOCK_BRANCHES,
  MOCK_TABLES,
  MOCK_INVENTORY,
  MOCK_VOUCHERS,
  MOCK_COMMUNITY_EVENTS,
  MOCK_FORUM_POSTS,
  MockProduct,
  BranchInfo,
  CafeTable,
  InventoryItem,
  VoucherPromo,
  CommunityEvent,
  ForumPost,
} from "@/lib/mockData";
import { soundEffects } from "@/lib/audioAlerts";

/* =========================================================
   TYPES & INTERFACES
   ========================================================= */

export interface CartCustomization {
  sweetness: "Normal (100%)" | "Less Sweet (50%)" | "Quarter (25%)" | "No Sugar (0%)";
  iceLevel: "Normal Ice" | "Less Ice" | "No Ice" | "Hot";
  milkType: "Fresh Milk" | "Oat Milk (+Rp 6.000)" | "Almond Milk (+Rp 8.000)" | "None";
  beanRoast: "Signature House Blend" | "Single Origin Ijen (+Rp 4.000)" | "Dampit Robusta Dark";
  notes?: string;
}

export interface AppCartItem {
  id: string; // unique item instance id
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  customizations: CartCustomization;
  subtotal: number;
}

export type OrderStatus = "pending" | "confirmed" | "preparing" | "ready" | "completed" | "cancelled";
export type FulfillmentType = "dine-in" | "pickup" | "drive-thru" | "delivery";
export type PaymentMethod = "qris" | "bca-va" | "mandiri-va" | "credit-card" | "cash";

export interface MasterOrder {
  id: string; // e.g. YRH-8492
  createdAt: string;
  customerName: string;
  customerPhone: string;
  branchId: string;
  branchName: string;
  fulfillmentType: FulfillmentType;
  tableNumber?: string;
  deliveryAddress?: string;
  items: AppCartItem[];
  subtotal: number;
  voucherCode?: string;
  voucherDiscount: number;
  pointsRedeemed: number;
  pointsDiscount: number;
  tax: number;
  serviceFee: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: "paid" | "pending" | "failed";
  orderStatus: OrderStatus;
  estimatedMinutes: number;
  isKdsBumped?: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  avatar: string;
  tier: "Bronze" | "Silver" | "Gold" | "Platinum";
  points: number;
  savedAddresses: string[];
  favoriteOrderIds: string[];
  isLoggedIn: boolean;
}

export interface TableReservation {
  id: string;
  code: string;
  branchId: string;
  tableId: string;
  tableLabel: string;
  date: string;
  timeSlot: string;
  guestCount: number;
  customerName: string;
  customerPhone: string;
  notes?: string;
  depositAmount: number;
  status: "confirmed" | "seated" | "completed" | "cancelled";
  createdAt: string;
}

export interface CashierShift {
  id: string;
  cashierName: string;
  branchId: string;
  shiftStart: string;
  shiftEnd?: string;
  openingFloat: number;
  totalCashSales: number;
  totalQrisSales: number;
  cashDrawerActual: number;
  variance: number;
  isClosed: boolean;
  notes?: string;
}

/* =========================================================
   STORE INTERFACE
   ========================================================= */

export interface AppStoreState {
  // 1. Branch Slice
  activeBranchId: string;
  branches: BranchInfo[];
  setActiveBranch: (branchId: string) => void;
  getActiveBranch: () => BranchInfo;

  // 2. Auth Slice
  user: UserProfile;
  login: (phone: string, name?: string) => void;
  logout: () => void;
  updateProfile: (data: Partial<UserProfile>) => void;
  addLoyaltyPoints: (points: number) => void;
  deductLoyaltyPoints: (points: number) => void;

  // 3. Cart Slice
  cartItems: AppCartItem[];
  fulfillmentType: FulfillmentType;
  tableNumber: string;
  deliveryAddress: string;
  appliedVoucher: VoucherPromo | null;
  redeemedPoints: number;
  splitBillCount: number;
  isCartDrawerOpen: boolean;

  setFulfillmentType: (type: FulfillmentType) => void;
  setTableNumber: (table: string) => void;
  setDeliveryAddress: (address: string) => void;
  addToCart: (product: MockProduct, quantity: number, customizations: CartCustomization) => void;
  updateCartQuantity: (itemId: string, delta: number) => void;
  removeCartItem: (itemId: string) => void;
  clearCart: () => void;
  applyVoucher: (code: string) => boolean;
  removeVoucher: () => void;
  setRedeemedPoints: (points: number) => void;
  setSplitBillCount: (count: number) => void;
  setCartDrawerOpen: (open: boolean) => void;
  getCartSubtotal: () => number;
  getCartTotal: () => number;

  // 4. Order Slice (Omnichannel, POS, KDS sync)
  orders: MasterOrder[];
  activeTrackingOrderId: string | null;
  createOrder: (orderParams?: Partial<MasterOrder>) => MasterOrder;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  setActiveTrackingOrder: (orderId: string) => void;
  getOrderById: (orderId: string) => MasterOrder | undefined;

  // 5. Inventory Slice
  inventory: InventoryItem[];
  updateStock: (itemId: string, delta: number) => void;
  reconcileStockOpname: (itemId: string, actualStock: number) => void;

  // 6. Reservation Slice
  tables: CafeTable[];
  reservations: TableReservation[];
  createReservation: (reservation: Omit<TableReservation, "id" | "code" | "createdAt" | "status">) => TableReservation;
  updateReservationStatus: (id: string, status: TableReservation["status"]) => void;

  // 7. Community Slice
  events: CommunityEvent[];
  forumPosts: ForumPost[];
  toggleEventRsvp: (eventId: string) => void;
  togglePostLike: (postId: string) => void;
  addForumPost: (title: string, content: string, tags: string[]) => void;
  addForumReply: (postId: string, content: string) => void;

  // 8. Staff / Shift Slice
  currentShift: CashierShift;
  reconcileShift: (actualCash: number, notes?: string) => void;
}

/* =========================================================
   INITIAL SEED DATA
   ========================================================= */

const INITIAL_USER: UserProfile = {
  id: "user-1",
  name: "Achmad Rizqi",
  phone: "08123456789",
  email: "achmad.rizqi@surabayacreative.id",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&fit=crop&crop=faces",
  tier: "Gold",
  points: 850,
  savedAddresses: [
    "Jl. Mayjen Sungkono No. 102, Surabaya",
    "Spazio Tower Lt. 8, Graha Famili, Surabaya",
  ],
  favoriteOrderIds: ["prod-1", "prod-2", "prod-5"],
  isLoggedIn: true,
};

const INITIAL_ORDERS: MasterOrder[] = [
  {
    id: "YRH-8492",
    createdAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    customerName: "Achmad Rizqi",
    customerPhone: "08123456789",
    branchId: "darmo",
    branchName: "Darmo Flagship",
    fulfillmentType: "dine-in",
    tableNumber: "T-04",
    items: [
      {
        id: "item-init-1",
        productId: "prod-1",
        name: "Kopi Susu Aren Brulee",
        price: 28000,
        image: "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=800&auto=format&fit=crop&q=80",
        quantity: 2,
        customizations: {
          sweetness: "Less Sweet (50%)",
          iceLevel: "Normal Ice",
          milkType: "Fresh Milk",
          beanRoast: "Signature House Blend",
          notes: "Tolong foam brulee-nya agak tebal ya kak",
        },
        subtotal: 56000,
      },
      {
        id: "item-init-2",
        productId: "prod-5",
        name: "Croissant Butter Artisan",
        price: 26000,
        image: "https://images.unsplash.com/photo-1555507036-ab1f4038024a?w=800&auto=format&fit=crop&q=80",
        quantity: 1,
        customizations: {
          sweetness: "No Sugar (0%)",
          iceLevel: "Hot",
          milkType: "None",
          beanRoast: "Signature House Blend",
          notes: "Dipanaskan crispy",
        },
        subtotal: 26000,
      },
    ],
    subtotal: 82000,
    voucherCode: "YAREHHEMAT10",
    voucherDiscount: 8200,
    pointsRedeemed: 200,
    pointsDiscount: 2000,
    tax: 7180,
    serviceFee: 2000,
    total: 80980,
    paymentMethod: "qris",
    paymentStatus: "paid",
    orderStatus: "preparing",
    estimatedMinutes: 6,
    isKdsBumped: false,
  },
  {
    id: "YRH-8491",
    createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    customerName: "Clarissa Putri",
    customerPhone: "08198765432",
    branchId: "darmo",
    branchName: "Darmo Flagship",
    fulfillmentType: "dine-in",
    tableNumber: "T-01",
    items: [
      {
        id: "item-init-3",
        productId: "prod-2",
        name: "Nitro Honey Cold Brew",
        price: 34000,
        image: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=800&auto=format&fit=crop&q=80",
        quantity: 1,
        customizations: {
          sweetness: "Normal (100%)",
          iceLevel: "Normal Ice",
          milkType: "None",
          beanRoast: "Signature House Blend",
        },
        subtotal: 34000,
      },
    ],
    subtotal: 34000,
    voucherDiscount: 0,
    pointsRedeemed: 0,
    pointsDiscount: 0,
    tax: 3400,
    serviceFee: 2000,
    total: 39400,
    paymentMethod: "bca-va",
    paymentStatus: "paid",
    orderStatus: "ready",
    estimatedMinutes: 0,
    isKdsBumped: false,
  },
  {
    id: "YRH-8490",
    createdAt: new Date(Date.now() - 1000 * 60 * 70).toISOString(),
    customerName: "Budi Santoso",
    customerPhone: "08133344455",
    branchId: "darmo",
    branchName: "Darmo Flagship",
    fulfillmentType: "pickup",
    items: [
      {
        id: "item-init-4",
        productId: "prod-6",
        name: "Nasi Kulit Sambal Matah Ya'reh",
        price: 38000,
        image: "https://images.unsplash.com/photo-1562967914-608f82629710?w=800&auto=format&fit=crop&q=80",
        quantity: 1,
        customizations: {
          sweetness: "No Sugar (0%)",
          iceLevel: "Hot",
          milkType: "None",
          beanRoast: "Signature House Blend",
          notes: "Sambal matah dipisah ya",
        },
        subtotal: 38000,
      },
    ],
    subtotal: 38000,
    voucherDiscount: 0,
    pointsRedeemed: 0,
    pointsDiscount: 0,
    tax: 3800,
    serviceFee: 2000,
    total: 43800,
    paymentMethod: "credit-card",
    paymentStatus: "paid",
    orderStatus: "completed",
    estimatedMinutes: 0,
  },
];

const INITIAL_RESERVATIONS: TableReservation[] = [
  {
    id: "res-1",
    code: "RSV-DARMO-01",
    branchId: "darmo",
    tableId: "VIP-01",
    tableLabel: "VIP Suite 01 (Majapahit)",
    date: "2026-09-06",
    timeSlot: "14:00 - 17:00",
    guestCount: 8,
    customerName: "Achmad Rizqi",
    customerPhone: "08123456789",
    notes: "Persiapan meeting pitching agency kreatif. Butuh kabel HDMI & kopi break.",
    depositAmount: 200000,
    status: "confirmed",
    createdAt: new Date(Date.now() - 1000 * 3600 * 12).toISOString(),
  },
];

const INITIAL_SHIFT: CashierShift = {
  id: "shift-20260905-01",
  cashierName: "Siti Rahmawati (Kasir #1)",
  branchId: "darmo",
  shiftStart: "07:00 WIB",
  openingFloat: 500000, // Rp 500.000 modal awal
  totalCashSales: 1240000,
  totalQrisSales: 4680000,
  cashDrawerActual: 1740000, // 500.000 + 1.240.000
  variance: 0,
  isClosed: false,
};

/* =========================================================
   ZUSTAND PERSISTENT STORE CREATION
   ========================================================= */

export const useAppStore = create<AppStoreState>()(
  persist(
    (set, get) => ({
      // 1. Branch Slice
      activeBranchId: "darmo",
      branches: MOCK_BRANCHES,
      setActiveBranch: (branchId: string) => {
        set({ activeBranchId: branchId });
      },
      getActiveBranch: () => {
        const { branches, activeBranchId } = get();
        return branches.find((b) => b.id === activeBranchId) || branches[0];
      },

      // 2. Auth Slice
      user: INITIAL_USER,
      login: (phone: string, name?: string) => {
        set((state) => ({
          user: {
            ...state.user,
            phone,
            name: name || state.user.name,
            isLoggedIn: true,
          },
        }));
      },
      logout: () => {
        set((state) => ({
          user: {
            ...state.user,
            isLoggedIn: false,
          },
        }));
      },
      updateProfile: (data) => {
        set((state) => ({
          user: { ...state.user, ...data },
        }));
      },
      addLoyaltyPoints: (points) => {
        set((state) => ({
          user: { ...state.user, points: state.user.points + points },
        }));
      },
      deductLoyaltyPoints: (points) => {
        set((state) => ({
          user: {
            ...state.user,
            points: Math.max(0, state.user.points - points),
          },
        }));
      },

      // 3. Cart Slice
      cartItems: [],
      fulfillmentType: "dine-in",
      tableNumber: "T-04",
      deliveryAddress: "Jl. Mayjen Sungkono No. 102, Surabaya",
      appliedVoucher: null,
      redeemedPoints: 0,
      splitBillCount: 1,
      isCartDrawerOpen: false,

      setFulfillmentType: (type) => set({ fulfillmentType: type }),
      setTableNumber: (table) => set({ tableNumber: table }),
      setDeliveryAddress: (address) => set({ deliveryAddress: address }),

      addToCart: (product, quantity, customizations) => {
        // compute price additions for customization
        let pricePerUnit = product.price;
        if (customizations.milkType.includes("Oat Milk")) pricePerUnit += 6000;
        if (customizations.milkType.includes("Almond Milk")) pricePerUnit += 8000;
        if (customizations.beanRoast.includes("Single Origin")) pricePerUnit += 4000;

        const subtotal = pricePerUnit * quantity;
        const newItem: AppCartItem = {
          id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          productId: product.id,
          name: product.name,
          price: pricePerUnit,
          image: product.image,
          quantity,
          customizations,
          subtotal,
        };

        set((state) => ({
          cartItems: [...state.cartItems, newItem],
          isCartDrawerOpen: true,
        }));
      },

      updateCartQuantity: (itemId, delta) => {
        set((state) => {
          const updated = state.cartItems
            .map((item) => {
              if (item.id === itemId) {
                const newQty = item.quantity + delta;
                if (newQty <= 0) return null;
                return {
                  ...item,
                  quantity: newQty,
                  subtotal: (item.price * newQty),
                };
              }
              return item;
            })
            .filter(Boolean) as AppCartItem[];
          return { cartItems: updated };
        });
      },

      removeCartItem: (itemId) => {
        set((state) => ({
          cartItems: state.cartItems.filter((i) => i.id !== itemId),
        }));
      },

      clearCart: () => {
        set({
          cartItems: [],
          appliedVoucher: null,
          redeemedPoints: 0,
          splitBillCount: 1,
        });
      },

      applyVoucher: (code: string) => {
        const found = MOCK_VOUCHERS.find(
          (v) => v.code.toUpperCase() === code.trim().toUpperCase()
        );
        if (found) {
          const subtotal = get().getCartSubtotal();
          if (subtotal >= found.minOrder) {
            set({ appliedVoucher: found });
            return true;
          }
        }
        return false;
      },

      removeVoucher: () => set({ appliedVoucher: null }),
      setRedeemedPoints: (points) => set({ redeemedPoints: points }),
      setSplitBillCount: (count) => set({ splitBillCount: Math.max(1, count) }),
      setCartDrawerOpen: (open) => set({ isCartDrawerOpen: open }),

      getCartSubtotal: () => {
        const { cartItems } = get();
        return cartItems.reduce((acc, item) => acc + item.subtotal, 0);
      },

      getCartTotal: () => {
        const subtotal = get().getCartSubtotal();
        if (subtotal === 0) return 0;

        let voucherDiscount = 0;
        const { appliedVoucher, redeemedPoints } = get();
        if (appliedVoucher) {
          if (appliedVoucher.discountType === "percentage") {
            voucherDiscount = (subtotal * appliedVoucher.discountValue) / 100;
          } else {
            voucherDiscount = appliedVoucher.discountValue;
          }
        }

        // Each 10 points = Rp 100 discount (1 pt = Rp 10)
        const pointsDiscount = redeemedPoints * 10;
        const taxable = Math.max(0, subtotal - voucherDiscount - pointsDiscount);
        const tax = Math.round(taxable * 0.1); // 10% PB1 Restaurant Tax
        const serviceFee = 2000;

        return Math.max(0, taxable + tax + serviceFee);
      },

      // 4. Order Slice
      orders: INITIAL_ORDERS,
      activeTrackingOrderId: "YRH-8492",

      createOrder: (customParams) => {
        const state = get();
        const activeBranch = state.getActiveBranch();
        const subtotal = customParams?.subtotal ?? state.getCartSubtotal();
        const total = customParams?.total ?? state.getCartTotal();
        const items = customParams?.items ?? [...state.cartItems];

        // Generate Order ID
        const orderNum = Math.floor(1000 + Math.random() * 9000);
        const orderId = `YRH-${orderNum}`;

        let voucherDiscount = 0;
        if (state.appliedVoucher) {
          voucherDiscount =
            state.appliedVoucher.discountType === "percentage"
              ? (subtotal * state.appliedVoucher.discountValue) / 100
              : state.appliedVoucher.discountValue;
        }

        const pointsDiscount = state.redeemedPoints * 10;
        const tax = Math.round(Math.max(0, subtotal - voucherDiscount - pointsDiscount) * 0.1);

        const newOrder: MasterOrder = {
          id: orderId,
          createdAt: new Date().toISOString(),
          customerName: customParams?.customerName || state.user.name,
          customerPhone: customParams?.customerPhone || state.user.phone,
          branchId: customParams?.branchId || activeBranch.id,
          branchName: customParams?.branchName || activeBranch.name,
          fulfillmentType: customParams?.fulfillmentType || state.fulfillmentType,
          tableNumber:
            customParams?.fulfillmentType === "dine-in" || state.fulfillmentType === "dine-in"
              ? (customParams?.tableNumber || state.tableNumber || "T-04")
              : undefined,
          deliveryAddress:
            customParams?.fulfillmentType === "delivery" || state.fulfillmentType === "delivery"
              ? (customParams?.deliveryAddress || state.deliveryAddress)
              : undefined,
          items: items.length > 0 ? items : [
            {
              id: `item-${Date.now()}`,
              productId: "prod-1",
              name: "Kopi Susu Aren Brulee",
              price: 28000,
              image: "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=800&auto=format&fit=crop&q=80",
              quantity: 1,
              customizations: {
                sweetness: "Normal (100%)",
                iceLevel: "Normal Ice",
                milkType: "Fresh Milk",
                beanRoast: "Signature House Blend",
              },
              subtotal: 28000,
            },
          ],
          subtotal: subtotal > 0 ? subtotal : 28000,
          voucherCode: state.appliedVoucher?.code,
          voucherDiscount,
          pointsRedeemed: state.redeemedPoints,
          pointsDiscount,
          tax: tax > 0 ? tax : 2800,
          serviceFee: 2000,
          total: total > 0 ? total : 32800,
          paymentMethod: customParams?.paymentMethod || "qris",
          paymentStatus: "paid",
          orderStatus: "pending",
          estimatedMinutes: 8,
          isKdsBumped: false,
          ...customParams,
        };

        // Award loyalty points: +10 points per Rp 10.000 spent
        const earnedPoints = Math.floor(newOrder.total / 10000) * 10;
        if (earnedPoints > 0) {
          state.addLoyaltyPoints(earnedPoints);
        }

        // Deduct redeemed points if used
        if (state.redeemedPoints > 0) {
          state.deductLoyaltyPoints(state.redeemedPoints);
        }

        // Auto decrement mock inventory
        newOrder.items.forEach((orderItem) => {
          if (orderItem.name.includes("Kopi") || orderItem.name.includes("Brew") || orderItem.name.includes("V60")) {
            get().updateStock("inv-1", -(0.02 * orderItem.quantity)); // 20g beans per cup
            get().updateStock("inv-6", -orderItem.quantity); // 1 cup
          }
          if (orderItem.customizations.milkType.includes("Oat Milk")) {
            get().updateStock("inv-3", -(0.2 * orderItem.quantity)); // 200ml oat milk
          } else if (orderItem.customizations.milkType.includes("Fresh Milk")) {
            get().updateStock("inv-4", -(0.2 * orderItem.quantity)); // 200ml fresh milk
          }
        });

        // Trigger Audio Chimes
        soundEffects.playSuccessChime();
        soundEffects.playKdsBell();

        set((s) => ({
          orders: [newOrder, ...s.orders],
          activeTrackingOrderId: newOrder.id,
          cartItems: [],
          appliedVoucher: null,
          redeemedPoints: 0,
        }));

        return newOrder;
      },

      updateOrderStatus: (orderId: string, status: OrderStatus) => {
        soundEffects.playKdsBell();
        set((state) => ({
          orders: state.orders.map((ord) => {
            if (ord.id === orderId) {
              return {
                ...ord,
                orderStatus: status,
                estimatedMinutes:
                  status === "completed"
                    ? 0
                    : status === "ready"
                    ? 1
                    : status === "preparing"
                    ? 5
                    : ord.estimatedMinutes,
                isKdsBumped: true,
              };
            }
            return ord;
          }),
        }));
      },

      setActiveTrackingOrder: (orderId) => set({ activeTrackingOrderId: orderId }),

      getOrderById: (orderId) => {
        return get().orders.find((o) => o.id === orderId);
      },

      // 5. Inventory Slice
      inventory: MOCK_INVENTORY,
      updateStock: (itemId, delta) => {
        set((state) => ({
          inventory: state.inventory.map((inv) => {
            if (inv.id === itemId) {
              const newStock = Math.max(0, parseFloat((inv.stock + delta).toFixed(2)));
              return { ...inv, stock: newStock };
            }
            return inv;
          }),
        }));
      },
      reconcileStockOpname: (itemId, actualStock) => {
        set((state) => ({
          inventory: state.inventory.map((inv) => {
            if (inv.id === itemId) {
              return {
                ...inv,
                stock: actualStock,
                lastRestocked: new Date().toISOString().split("T")[0],
              };
            }
            return inv;
          }),
        }));
      },

      // 6. Reservation Slice
      tables: MOCK_TABLES,
      reservations: INITIAL_RESERVATIONS,

      createReservation: (params) => {
        const resNum = Math.floor(100 + Math.random() * 900);
        const newRes: TableReservation = {
          id: `res-${Date.now()}`,
          code: `RSV-${params.branchId.toUpperCase()}-${resNum}`,
          ...params,
          status: "confirmed",
          createdAt: new Date().toISOString(),
        };

        // Mark table as reserved
        set((state) => ({
          reservations: [newRes, ...state.reservations],
          tables: state.tables.map((t) =>
            t.id === params.tableId ? { ...t, status: "reserved" } : t
          ),
        }));

        soundEffects.playSuccessChime();
        return newRes;
      },

      updateReservationStatus: (id, status) => {
        set((state) => ({
          reservations: state.reservations.map((r) =>
            r.id === id ? { ...r, status } : r
          ),
        }));
      },

      // 7. Community Slice
      events: MOCK_COMMUNITY_EVENTS,
      forumPosts: MOCK_FORUM_POSTS,

      toggleEventRsvp: (eventId) => {
        set((state) => ({
          events: state.events.map((ev) => {
            if (ev.id === eventId) {
              const nextState = !ev.isAttending;
              return {
                ...ev,
                isAttending: nextState,
                spotsLeft: nextState ? ev.spotsLeft - 1 : ev.spotsLeft + 1,
                attendeesCount: nextState ? ev.attendeesCount + 1 : ev.attendeesCount - 1,
              };
            }
            return ev;
          }),
        }));
      },

      togglePostLike: (postId) => {
        set((state) => ({
          forumPosts: state.forumPosts.map((post) => {
            if (post.id === postId) {
              const nextLiked = !post.isLiked;
              return {
                ...post,
                isLiked: nextLiked,
                likesCount: nextLiked ? post.likesCount + 1 : post.likesCount - 1,
              };
            }
            return post;
          }),
        }));
      },

      addForumPost: (title, content, tags) => {
        const { user } = get();
        const newPost: ForumPost = {
          id: `post-${Date.now()}`,
          authorName: user.name,
          authorAvatar: user.avatar,
          authorRole: "Active Community Member",
          authorTier: user.tier,
          timestamp: "Baru saja",
          title,
          content,
          tags,
          likesCount: 1,
          repliesCount: 0,
          isLiked: true,
          replies: [],
        };

        set((state) => ({
          forumPosts: [newPost, ...state.forumPosts],
        }));
      },

      addForumReply: (postId, content) => {
        const { user } = get();
        const replyItem = {
          id: `reply-${Date.now()}`,
          authorName: user.name,
          authorAvatar: user.avatar,
          timestamp: "Baru saja",
          content,
        };

        set((state) => ({
          forumPosts: state.forumPosts.map((post) => {
            if (post.id === postId) {
              return {
                ...post,
                repliesCount: post.repliesCount + 1,
                replies: [...post.replies, replyItem],
              };
            }
            return post;
          }),
        }));
      },

      // 8. Staff Shift Slice
      currentShift: INITIAL_SHIFT,
      reconcileShift: (actualCash, notes) => {
        set((state) => {
          const expectedCash = state.currentShift.openingFloat + state.currentShift.totalCashSales;
          const variance = actualCash - expectedCash;
          return {
            currentShift: {
              ...state.currentShift,
              cashDrawerActual: actualCash,
              variance,
              isClosed: true,
              shiftEnd: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB",
              notes: notes || state.currentShift.notes,
            },
          };
        });
      },
    }),
    {
      name: "warkop-yareh-unified-state-v1",
      storage: createJSONStorage(() => window.localStorage),
      partialize: (state) => ({
        activeBranchId: state.activeBranchId,
        user: state.user,
        cartItems: state.cartItems,
        fulfillmentType: state.fulfillmentType,
        tableNumber: state.tableNumber,
        deliveryAddress: state.deliveryAddress,
        orders: state.orders,
        activeTrackingOrderId: state.activeTrackingOrderId,
        inventory: state.inventory,
        reservations: state.reservations,
        events: state.events,
        forumPosts: state.forumPosts,
        currentShift: state.currentShift,
      }),
    }
  )
);
