/* ============================================
   WARKOP YA'REH TYPE DEFINITIONS
   ============================================ */

// ---- User & Auth ----
export type Role =
  | 'CUSTOMER'
  | 'STAFF'
  | 'CASHIER'
  | 'KITCHEN'
  | 'MANAGER'
  | 'ADMIN'
  | 'OWNER'
  | 'SUPERADMIN';

export type MembershipTier = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  avatar?: string | null;
  role: Role;
  membershipTier: MembershipTier;
  loyaltyPoints: number;
  joinedAt: string;
  branchId?: string | null;
}

// ---- Products ----
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  tags: string[];
  isPopular: boolean;
  isNew: boolean;
  rating: number;
  reviewCount: number;
  preparationTime: number; // minutes
  calories?: number;
  ingredients?: string[];
  customizations?: ProductCustomization[];
  branchAvailability: string[];
}

export interface ProductCustomization {
  id: string;
  name: string;
  options: { label: string; price: number }[];
}

// ---- Cart & Orders ----
export interface CartItem {
  product: Product;
  quantity: number;
  customizations?: Record<string, string>;
  notes?: string;
}

export type OrderStatus =
  'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  status: OrderStatus;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  branchId: string;
  pickupTime?: string;
  createdAt: string;
  updatedAt: string;
  loyaltyPointsEarned: number;
}

// ---- Reservations ----
export interface Reservation {
  id: string;
  userId: string;
  branchId: string;
  date: string;
  timeSlot: string;
  guestCount: number;
  tableType: 'indoor' | 'outdoor' | 'vip' | 'meeting-room';
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  specialRequests?: string;
  createdAt: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
  capacity: number;
}

// ---- Events ----
export type EventCategory =
  'workshop' | 'music' | 'community' | 'business' | 'art' | 'tech' | 'food';

export interface Event {
  id: string;
  title: string;
  description: string;
  longDescription?: string;
  image: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  branchId: string;
  category: EventCategory;
  capacity: number;
  registered: number;
  price: number;
  isFree: boolean;
  isOnline: boolean;
  speakers?: EventSpeaker[];
  tags: string[];
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
}

export interface EventSpeaker {
  name: string;
  role: string;
  avatar: string;
}

// ---- Community ----
export interface CommunityGroup {
  id: string;
  name: string;
  description: string;
  image: string;
  memberCount: number;
  category: string;
  isActive: boolean;
  createdAt: string;
  tags: string[];
}

export interface CommunityPost {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  groupId: string;
  content: string;
  image?: string;
  likes: number;
  comments: number;
  createdAt: string;
}

// ---- Blog ----
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image: string;
  author: {
    name: string;
    avatar: string;
    role: string;
  };
  category: string;
  tags: string[];
  readTime: number;
  publishedAt: string;
  updatedAt?: string;
}

// ---- Loyalty ----
export interface LoyaltyTransaction {
  id: string;
  userId: string;
  type: 'earned' | 'redeemed' | 'expired' | 'bonus';
  points: number;
  description: string;
  orderId?: string;
  createdAt: string;
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  image: string;
  pointsCost: number;
  category: string;
  tier: MembershipTier;
  isAvailable: boolean;
  expiresAt?: string;
}

// ---- Reviews ----
export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  productId?: string;
  branchId?: string;
  rating: number;
  comment: string;
  images?: string[];
  createdAt: string;
  helpful: number;
}

// ---- Notifications ----
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'order' | 'event' | 'loyalty' | 'community' | 'promo' | 'system';
  isRead: boolean;
  actionUrl?: string;
  createdAt: string;
}

// ---- Analytics (Admin) ----
export interface AnalyticsOverview {
  totalRevenue: number;
  revenueGrowth: number;
  totalOrders: number;
  orderGrowth: number;
  totalCustomers: number;
  customerGrowth: number;
  averageOrderValue: number;
  aovGrowth: number;
}

export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

// ---- Branch ----
export interface Branch {
  id: string;
  name: string;
  address: string;
  city: string;
  coordinates?: { lat: number; lng: number };
  phone?: string | null;
  isMainBranch: boolean;
  capacity?: number;
  features?: string[];
  plusCode?: string;
  brandName?: string;
  publicSpendingRange?: string;
  operatingHours: {
    weekday: string;
    weekend: string;
  };
}

// ============================================
// DATA CONFIDENCE & SOURCE TRACEABILITY
// ============================================

export type DataConfidenceLevel =
  | 'VERIFIED'
  | 'PARTIALLY_VERIFIED'
  | 'UNVERIFIED'
  | 'VERIFIED_ABSENT'
  | 'DISPUTED'
  | 'DEPRECATED';

export type BusinessSourceType =
  | 'BUSINESS_OWNER'
  | 'IN_STORE_OBSERVATION'
  | 'OFFICIAL_MENU'
  | 'OFFICIAL_SOCIAL_MEDIA'
  | 'GOOGLE_MAPS'
  | 'CUSTOMER_REVIEW'
  | 'THIRD_PARTY_PLATFORM';

export interface DynamicExternalFact<T> {
  value: T;
  confidence: DataConfidenceLevel;
  sourceType: BusinessSourceType;
  sourceReference: string;
  capturedAt: string;     // ISO 8601 string
  lastVerifiedAt: string; // ISO 8601 string
  notes?: string;
}

export interface VerifiedBranchFixture {
  id: string;
  slug: string;
  name: string;
  brandName: string;
  address: {
    street: string;
    subdistrict: string;
    district: string;
    city: string;
    province: string;
    postalCode: string;
  };
  plusCode: string;
  phone: string | null;
  operatingHours: string;
  servicesSupported: ('DINE_IN' | 'TAKEAWAY')[];
  publicSpendingRange: string;
  isMainBranch: boolean;
  confidence: DataConfidenceLevel;
  source: {
    sourceType: BusinessSourceType;
    capturedAt: string;
    lastVerifiedAt: string;
  };
}

export const VERIFIED_BRANCHES: readonly VerifiedBranchFixture[] = [
  {
    id: 'jetis-kulon',
    slug: 'jetis-kulon',
    name: "WARKOP YA'REH",
    brandName: "Warkop Ya'reh",
    address: {
      street: 'Jl. Raya Jetis Kulon I No.38',
      subdistrict: 'Wonokromo',
      district: 'Kec. Wonokromo',
      city: 'Surabaya',
      province: 'Jawa Timur',
      postalCode: '60243',
    },
    plusCode: 'MPVJ+2G Wonokromo, Surabaya, Jawa Timur',
    phone: null,
    operatingHours: '24 Hours',
    servicesSupported: ['DINE_IN', 'TAKEAWAY'],
    publicSpendingRange: 'Rp1–25.000 per orang',
    isMainBranch: true,
    confidence: 'VERIFIED',
    source: {
      sourceType: 'GOOGLE_MAPS',
      capturedAt: '2026-09-17',
      lastVerifiedAt: '2026-09-17',
    },
  },
  {
    id: 'prapen',
    slug: 'prapen',
    name: "WARKOP YA'REH 2 PRAPEN",
    brandName: "Warkop Ya'reh",
    address: {
      street: 'Jl. Raya Prapen No.39',
      subdistrict: 'Prapen',
      district: 'Kec. Tenggilis Mejoyo',
      city: 'Surabaya',
      province: 'Jawa Timur',
      postalCode: '60239',
    },
    plusCode: 'MQM3+XJ Prapen, Surabaya, Jawa Timur',
    phone: '0821-3735-4606',
    operatingHours: '24 Hours',
    servicesSupported: ['DINE_IN', 'TAKEAWAY'],
    publicSpendingRange: 'Rp1–25.000 per orang',
    isMainBranch: false,
    confidence: 'VERIFIED',
    source: {
      sourceType: 'GOOGLE_MAPS',
      capturedAt: '2026-09-17',
      lastVerifiedAt: '2026-09-17',
    },
  },
] as const;

