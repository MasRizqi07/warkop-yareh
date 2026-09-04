/* ============================================
   WARKOP YA'REH DIGITAL PLATFORM — CONSTANTS
   ============================================ */

export const SITE = {
  name: "Warkop Ya'reh",
  tagline: "Lebih dari Sekadar Warkop",
  description:
    "Platform digital ekosistem Warkop Ya'reh Wonokromo — kopi premium, coworking space, community hub, loyalty rewards, dan event platform di Surabaya.",
  url: "https://warkopyareh.id",
  email: "hello@warkopyareh.id",
  phone: "+62 812-3456-7890",
  whatsapp: "6281234567890",
  address: "Jl. Raya Wonokromo No. 42, Wonokromo, Surabaya, Jawa Timur 60243",
  coordinates: { lat: -7.2963, lng: 112.7378 },
  social: {
    instagram: "https://instagram.com/warkopyareh",
    tiktok: "https://tiktok.com/@warkopyareh",
    twitter: "https://twitter.com/warkopyareh",
    youtube: "https://youtube.com/@warkopyareh",
  },
  operatingHours: {
    weekday: "07:00 - 02:00",
    weekend: "07:00 - 03:00",
    note: "Buka Setiap Hari",
  },
} as const;

export const NAV_LINKS = [
  { label: "Menu", href: "/menu", icon: "Coffee" },
  { label: "Workspace & VIP", href: "/booking", icon: "CalendarCheck" },
  { label: "Community Hub", href: "/community", icon: "Users" },
  { label: "Loyalty Tier", href: "/loyalty", icon: "Award" },
  { label: "About", href: "/about", icon: "Info" },
] as const;

export const MEMBERSHIP_TIERS = [
  {
    name: "Bronze",
    color: "var(--accent-fill)",
    minPoints: 0,
    perks: ["5% diskon minuman", "Birthday reward", "Early access promo"],
    multiplier: 1,
  },
  {
    name: "Silver",
    color: "var(--text-secondary)",
    minPoints: 500,
    perks: [
      "10% diskon semua menu",
      "Priority queue",
      "Free size upgrade",
      "Monthly special offer",
    ],
    multiplier: 1.5,
  },
  {
    name: "Gold",
    color: "var(--gold-highlight)",
    minPoints: 2000,
    perks: [
      "15% diskon semua menu",
      "Free delivery",
      "Exclusive member events",
      "Personal barista note",
    ],
    multiplier: 2,
  },
  {
    name: "Platinum",
    color: "var(--primary-fixed)",
    minPoints: 5000,
    perks: [
      "20% diskon semua menu",
      "VIP lounge access",
      "Private event hosting",
      "Concierge service",
      "Annual Brew Retreat invite",
    ],
    multiplier: 3,
  },
] as const;

export const MENU_CATEGORIES = [
  { id: "all", name: "Semua", icon: "✨", count: 0 },
  { id: "coffee", name: "Coffee", icon: "☕", count: 8 },
  { id: "non-coffee", name: "Non-Coffee", icon: "🧋", count: 7 },
  { id: "food", name: "Food", icon: "🍽️", count: 5 },
  { id: "snacks", name: "Snacks", icon: "🍪", count: 6 },
  { id: "tea", name: "Tea", icon: "🍵", count: 4 },
  { id: "desserts", name: "Desserts", icon: "🍰", count: 5 },
] as const;

export const STATS = [
  { label: "Cups Served", value: 3000, suffix: "+", icon: "Coffee" },
  { label: "Komunitas Aktif", value: 15, suffix: "+", icon: "Users" },
  { label: "Rating", value: 4.9, suffix: "★", icon: "Star", isDecimal: true },
  { label: "Cabang", value: 3, suffix: "", icon: "MapPin" },
] as const;

export const BRANCH_LOCATIONS = [
  {
    id: "darmo",
    name: "Warkop Ya'reh Darmo",
    address: "Jl. Raya Darmo No. 18",
    city: "Surabaya",
    isMainBranch: true,
    capacity: 80,
    features: [
      "WiFi Kencang",
      "Meeting Room",
      "Event Space",
      "Indoor & Outdoor",
    ],
  },
  {
    id: "wonokromo",
    name: "Warkop Ya'reh Wonokromo",
    address: "Jl. Raya Wonokromo No. 42",
    city: "Surabaya",
    isMainBranch: false,
    capacity: 60,
    features: [
      "WiFi Kencang",
      "Coworking Space",
      "Indoor Seating",
    ],
  },
  {
    id: "dharmahusada",
    name: "Warkop Ya'reh Dharmahusada",
    address: "Jl. Dharmahusada No. 55",
    city: "Surabaya",
    isMainBranch: false,
    capacity: 50,
    features: [
      "WiFi Kencang",
      "Outdoor Garden",
      "Study Corner",
    ],
  },
] as const;

export const TAX_RATE = 0.11; // PPN 11%

export const ORDER_TYPES = [
  { id: "DINE_IN", label: "Dine In", icon: "UtensilsCrossed", description: "Makan di tempat" },
  { id: "TAKE_AWAY", label: "Take Away", icon: "Package", description: "Dibawa pulang" },
  { id: "DELIVERY", label: "Delivery", icon: "MapPin", description: "Diantar ke lokasi" },
] as const;
