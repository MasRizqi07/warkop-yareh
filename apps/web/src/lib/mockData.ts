export interface ProductCustomizationOption {
  name: string;
  options: { label: string; value: string; priceDelta?: number }[];
}

export interface MockProduct {
  id: string;
  name: string;
  category: "coffee" | "non-coffee" | "pastry" | "food";
  price: number;
  description: string;
  image: string;
  rating: number;
  reviewCount: number;
  preparationTime: number; // in minutes
  calories: number;
  tags: string[];
  branchAvailability: string[];
  ingredients: string[];
  isPopular?: boolean;
  isNew?: boolean;
}

export interface BranchInfo {
  id: string;
  name: string;
  tagline: string;
  address: string;
  hours: string;
  phone: string;
  wifiName: string;
  wifiPass: string;
  status: "open" | "busy" | "closed";
  seatingCapacity: number;
  currentOccupancy: number;
  priceMultiplier?: number;
  lat: number;
  lng: number;
}

export interface CafeTable {
  id: string;
  label: string;
  zone: "indoor-quiet" | "outdoor-communal" | "vip-suite";
  zoneName: string;
  seats: number;
  powerSockets: number;
  isSmoking: boolean;
  status: "available" | "occupied" | "reserved";
  features: string[];
}

export interface InventoryItem {
  id: string;
  name: string;
  category: "beans" | "dairy" | "syrup" | "packaging" | "food";
  stock: number;
  minThreshold: number;
  unit: string;
  burnRatePerDay: number;
  lastRestocked: string;
}

export interface VoucherPromo {
  code: string;
  title: string;
  description: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minOrder: number;
  expiresAt: string;
}

export interface CommunityEvent {
  id: string;
  title: string;
  speaker: string;
  speakerRole: string;
  date: string;
  time: string;
  branchId: string;
  branchName: string;
  image: string;
  spotsLeft: number;
  totalSpots: number;
  price: number; // 0 for free
  category: "workshop" | "networking" | "coffee" | "creative";
  attendeesCount: number;
  isAttending?: boolean;
}

export interface ForumPost {
  id: string;
  authorName: string;
  authorAvatar: string;
  authorRole: string;
  authorTier: "Bronze" | "Silver" | "Gold" | "Platinum";
  timestamp: string;
  title: string;
  content: string;
  tags: string[];
  likesCount: number;
  repliesCount: number;
  isLiked?: boolean;
  replies: {
    id: string;
    authorName: string;
    authorAvatar: string;
    timestamp: string;
    content: string;
  }[];
}

/* =========================================================
   CORE 7 MOCK PRODUCTS (Indonesian Specialty Coffee Specs)
   ========================================================= */
export const MOCK_PRODUCTS: MockProduct[] = [
  {
    id: "prod-1",
    name: "Kopi Susu Aren Brulee",
    category: "coffee",
    price: 28000,
    description: "Signature espresso, caramelized brown sugar, fresh milk, rich foam dengan taburan gula aren bakar renyah.",
    image: "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=800&auto=format&fit=crop&q=80",
    rating: 4.9,
    reviewCount: 1420,
    preparationTime: 4,
    calories: 180,
    tags: ["Signature", "Bestseller", "Sweet"],
    branchAvailability: ["darmo", "gubeng", "dharmahusada"],
    ingredients: ["Single Espresso", "Gula Aren Organik", "Fresh Milk Pasteurisasi", "Cream Foam Brulee"],
    isPopular: true,
  },
  {
    id: "prod-2",
    name: "Nitro Honey Cold Brew",
    category: "coffee",
    price: 34000,
    description: "16-hour steeped Arabica infused with local forest honey and nitrogen gas untuk tekstur silky bak stout beer.",
    image: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=800&auto=format&fit=crop&q=80",
    rating: 4.8,
    reviewCount: 840,
    preparationTime: 2,
    calories: 95,
    tags: ["Cold Brew", "Nitrogen", "Refreshing"],
    branchAvailability: ["darmo", "gubeng"],
    ingredients: ["Arabica Dampit 16-Hour Steep", "Madu Hutan Liar Jawa Timur", "Nitrogen Infusion"],
    isPopular: true,
    isNew: true,
  },
  {
    id: "prod-3",
    name: "Ijen Single Origin V60",
    category: "coffee",
    price: 32000,
    description: "Tasting notes: Jasmine, Bergamot, Brown Sugar sweetness. Biji kopi dipetik tangan dari lereng Gunung Ijen Jawa Timur.",
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&auto=format&fit=crop&q=80",
    rating: 4.9,
    reviewCount: 630,
    preparationTime: 6,
    calories: 5,
    tags: ["Manual Brew", "Single Origin", "Specialty"],
    branchAvailability: ["darmo", "gubeng", "dharmahusada"],
    ingredients: ["Biji Arabica Blue Mountain Ijen", "Air Mineral TDS 60 Filtered"],
    isPopular: true,
  },
  {
    id: "prod-4",
    name: "Matcha Kyoto Oat Latte",
    category: "non-coffee",
    price: 36000,
    description: "Ceremonial grade Uji matcha whisked fresh dengan steamed oat milk barista edition yang creamy natural.",
    image: "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=800&auto=format&fit=crop&q=80",
    rating: 4.8,
    reviewCount: 520,
    preparationTime: 4,
    calories: 160,
    tags: ["Non-Coffee", "Plant-Based", "Zen"],
    branchAvailability: ["darmo", "gubeng", "dharmahusada"],
    ingredients: ["Ceremonial Uji Matcha 1st Harvest", "Oatside Barista Blend", "Pure Cane Sugar Syrup"],
    isPopular: false,
    isNew: true,
  },
  {
    id: "prod-5",
    name: "Croissant Butter Artisan",
    category: "pastry",
    price: 26000,
    description: "Flaky French butter pastry freshly baked every morning. 48 lapisan laminasi mentega impor Normandie.",
    image: "/images/artisan-toasted-sourdough.png",
    rating: 4.7,
    reviewCount: 710,
    preparationTime: 3,
    calories: 240,
    tags: ["Bakery", "Artisan", "Warm"],
    branchAvailability: ["darmo", "gubeng", "dharmahusada"],
    ingredients: ["French Normandy Butter", "Tepung Gandum Premium", "Ragi Alami"],
    isPopular: false,
  },
  {
    id: "prod-6",
    name: "Nasi Kulit Sambal Matah Ya'reh",
    category: "food",
    price: 38000,
    description: "Crispy chicken skin golden deep-fried, fragrant lime leaves rice, fresh Balinese sambal matah & telor mata sapi.",
    image: "https://images.unsplash.com/photo-1562967914-608f82629710?w=800&auto=format&fit=crop&q=80",
    rating: 4.9,
    reviewCount: 1100,
    preparationTime: 12,
    calories: 480,
    tags: ["Comfort Food", "Spicy", "Heavy Meal"],
    branchAvailability: ["darmo", "gubeng", "dharmahusada"],
    ingredients: ["Kulit Ayam Renyah Bumbu Rempah", "Nasi Daun Jeruk", "Sambal Matah Bali", "Telur Mata Sapi 1/2 Matang"],
    isPopular: true,
  },
  {
    id: "prod-7",
    name: "Tempe Mendoan Crisp",
    category: "food",
    price: 22000,
    description: "Traditional savory tempeh with sweet soy chili dip. Potongan tempe kedelai lokal renyah dengan daun bawang.",
    image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&auto=format&fit=crop&q=80",
    rating: 4.7,
    reviewCount: 890,
    preparationTime: 8,
    calories: 210,
    tags: ["Snack", "Traditional", "Vegetarian"],
    branchAvailability: ["darmo", "gubeng", "dharmahusada"],
    ingredients: ["Tempe Kedelai Artisan", "Adonan Tepung Beras & Daun Bawang", "Sambal Kecap Rawit Merah"],
    isPopular: false,
  },
];

/* =========================================================
   BRANCH LOCATIONS (Surabaya Tri-Hub Network)
   ========================================================= */
export const MOCK_BRANCHES: BranchInfo[] = [
  {
    id: "darmo",
    name: "Darmo Flagship",
    tagline: "Heritage Coffeehouse & Creative Coworking",
    address: "Jl. Raya Darmo No. 42, Surabaya, Jawa Timur 60241",
    hours: "07:00 - 00:00 WIB",
    phone: "+62 812-3456-7890",
    wifiName: "YAREH_DARMO_FLAGSHIP_5G",
    wifiPass: "kopienakdarmo42",
    status: "open",
    seatingCapacity: 85,
    currentOccupancy: 58,
    priceMultiplier: 1.0,
    lat: -7.2882,
    lng: 112.7384,
  },
  {
    id: "gubeng",
    name: "Gubeng 24H Hub",
    tagline: "Round-the-clock Creative Nomad Haven",
    address: "Jl. Sumatra No. 18, Gubeng, Surabaya, Jawa Timur 60281",
    hours: "Buka 24 Jam Non-Stop",
    phone: "+62 812-9876-5432",
    wifiName: "YAREH_GUBENG_24H_FIBER",
    wifiPass: "begadangngopiyareh",
    status: "busy",
    seatingCapacity: 60,
    currentOccupancy: 48,
    priceMultiplier: 1.0,
    lat: -7.2711,
    lng: 112.7523,
  },
  {
    id: "dharmahusada",
    name: "Dharmahusada Campus",
    tagline: "Academic Focus & Student Pods",
    address: "Jl. Dharmahusada No. 88, Mulyorejo, Surabaya, Jawa Timur 60115",
    hours: "08:00 - 23:00 WIB",
    phone: "+62 813-1122-3344",
    wifiName: "YAREH_CAMPUS_HIGH_SPEED",
    wifiPass: "skripsilancaryareh",
    status: "open",
    seatingCapacity: 70,
    currentOccupancy: 32,
    priceMultiplier: 0.95, // 5% student discount default
    lat: -7.2694,
    lng: 112.7758,
  },
];

/* =========================================================
   TABLE CONFIGURATION MATRIX (Indoor, Outdoor, VIP)
   ========================================================= */
export const MOCK_TABLES: CafeTable[] = [
  // Indoor Quiet (T-01 to T-10)
  { id: "T-01", label: "Meja T-01", zone: "indoor-quiet", zoneName: "Indoor Quiet Zone", seats: 2, powerSockets: 4, isSmoking: false, status: "available", features: ["2 Stopkontak", "Kursi Ergonomis", "Pencahayaan Hangat"] },
  { id: "T-02", label: "Meja T-02", zone: "indoor-quiet", zoneName: "Indoor Quiet Zone", seats: 2, powerSockets: 4, isSmoking: false, status: "occupied", features: ["2 Stopkontak", "Kursi Ergonomis", "Pencahayaan Hangat"] },
  { id: "T-03", label: "Meja T-03", zone: "indoor-quiet", zoneName: "Indoor Quiet Zone", seats: 4, powerSockets: 4, isSmoking: false, status: "available", features: ["4 Stopkontak", "Meja Luas Laptop", "Dekat Coffee Bar"] },
  { id: "T-04", label: "Meja T-04", zone: "indoor-quiet", zoneName: "Indoor Quiet Zone", seats: 4, powerSockets: 4, isSmoking: false, status: "available", features: ["4 Stopkontak", "Meja Kayu Jati", "Dekat Rak Buku"] },
  { id: "T-05", label: "Meja T-05", zone: "indoor-quiet", zoneName: "Indoor Quiet Zone", seats: 4, powerSockets: 4, isSmoking: false, status: "reserved", features: ["4 Stopkontak", "Meja Luas Laptop", "Colokan USB-C"] },
  { id: "T-06", label: "Meja T-06", zone: "indoor-quiet", zoneName: "Indoor Quiet Zone", seats: 2, powerSockets: 4, isSmoking: false, status: "available", features: ["2 Stopkontak", "Pojok Tenang Solo Work"] },
  { id: "T-07", label: "Meja T-07", zone: "indoor-quiet", zoneName: "Indoor Quiet Zone", seats: 2, powerSockets: 4, isSmoking: false, status: "available", features: ["2 Stopkontak", "Pojok Tenang Solo Work"] },
  { id: "T-08", label: "Meja T-08", zone: "indoor-quiet", zoneName: "Indoor Quiet Zone", seats: 4, powerSockets: 4, isSmoking: false, status: "available", features: ["4 Stopkontak", "Sofa Lembut", "Dekat Jendela"] },
  { id: "T-09", label: "Meja T-09", zone: "indoor-quiet", zoneName: "Indoor Quiet Zone", seats: 4, powerSockets: 4, isSmoking: false, status: "occupied", features: ["4 Stopkontak", "Sofa Lembut", "Dekat Jendela"] },
  { id: "T-10", label: "Meja T-10", zone: "indoor-quiet", zoneName: "Indoor Quiet Zone", seats: 4, powerSockets: 4, isSmoking: false, status: "available", features: ["4 Stopkontak", "Dekat Toilet & Musholla"] },

  // Outdoor Communal (O-01 to O-08)
  { id: "O-01", label: "Communal O-01", zone: "outdoor-communal", zoneName: "Outdoor Communal & Garden", seats: 6, powerSockets: 6, isSmoking: true, status: "available", features: ["Smoking Friendly", "Breeze Fan", "Stopkontak Tiap Kursi"] },
  { id: "O-02", label: "Communal O-02", zone: "outdoor-communal", zoneName: "Outdoor Communal & Garden", seats: 6, powerSockets: 6, isSmoking: true, status: "occupied", features: ["Smoking Friendly", "Breeze Fan", "Dekat Tanaman Hijau"] },
  { id: "O-03", label: "Communal O-03", zone: "outdoor-communal", zoneName: "Outdoor Communal & Garden", seats: 8, powerSockets: 8, isSmoking: true, status: "available", features: ["Meja Kayu Panjang", "Cocok Group Discussion", "Outdoor Ambient Light"] },
  { id: "O-04", label: "Communal O-04", zone: "outdoor-communal", zoneName: "Outdoor Communal & Garden", seats: 8, powerSockets: 8, isSmoking: true, status: "reserved", features: ["Meja Kayu Panjang", "Cocok Group Discussion", "Outdoor Ambient Light"] },
  { id: "O-05", label: "Communal O-05", zone: "outdoor-communal", zoneName: "Outdoor Communal & Garden", seats: 6, powerSockets: 4, isSmoking: true, status: "available", features: ["Smoking Area", "Kanopi Anti Hujan"] },
  { id: "O-06", label: "Communal O-06", zone: "outdoor-communal", zoneName: "Outdoor Communal & Garden", seats: 6, powerSockets: 4, isSmoking: true, status: "available", features: ["Smoking Area", "Kanopi Anti Hujan"] },
  { id: "O-07", label: "Communal O-07", zone: "outdoor-communal", zoneName: "Outdoor Communal & Garden", seats: 6, powerSockets: 4, isSmoking: true, status: "available", features: ["Smoking Area", "Pojok Santai"] },
  { id: "O-08", label: "Communal O-08", zone: "outdoor-communal", zoneName: "Outdoor Communal & Garden", seats: 8, powerSockets: 6, isSmoking: true, status: "available", features: ["Smoking Area", "Dekat Panggung Akustik"] },

  // VIP Meeting Suites (VIP-01 to VIP-03)
  { id: "VIP-01", label: "VIP Suite 01 (Majapahit)", zone: "vip-suite", zoneName: "VIP Meeting Suite", seats: 10, powerSockets: 10, isSmoking: false, status: "available", features: ["55\" 4K Smart TV", "Apple AirPlay / HDMI", "Magnetic Whiteboard", "Conference Soundbar", "Private Barista Call"] },
  { id: "VIP-02", label: "VIP Suite 02 (Bung Tomo)", zone: "vip-suite", zoneName: "VIP Meeting Suite", seats: 12, powerSockets: 12, isSmoking: false, status: "reserved", features: ["65\" 4K Presentation TV", "Video Conference Camera", "Glass Whiteboard", "Acoustic Wall Panels", "AC Suhu Khusus"] },
  { id: "VIP-03", label: "VIP Suite 03 (Suramadu)", zone: "vip-suite", zoneName: "VIP Meeting Suite", seats: 8, powerSockets: 8, isSmoking: false, status: "available", features: ["50\" Monitor", "Wireless Screencast", "Whiteboard", "Ergonomic Mesh Chairs"] },
];

/* =========================================================
   INVENTORY SEED DATA (Ingredient & Packaging Monitoring)
   ========================================================= */
export const MOCK_INVENTORY: InventoryItem[] = [
  {
    id: "inv-1",
    name: "Biji Kopi Arabica Ijen Blue Mountain",
    category: "beans",
    stock: 18.5,
    minThreshold: 5.0,
    unit: "Kg",
    burnRatePerDay: 2.8,
    lastRestocked: "2026-09-02",
  },
  {
    id: "inv-2",
    name: "Biji Kopi Robusta Dampit Malang",
    category: "beans",
    stock: 24.0,
    minThreshold: 8.0,
    unit: "Kg",
    burnRatePerDay: 4.5,
    lastRestocked: "2026-09-01",
  },
  {
    id: "inv-3",
    name: "Oatside Barista Oat Milk 1L",
    category: "dairy",
    stock: 42,
    minThreshold: 15,
    unit: "Karton/Liter",
    burnRatePerDay: 9,
    lastRestocked: "2026-09-03",
  },
  {
    id: "inv-4",
    name: "Fresh Milk Diamond Pasteurisasi 1L",
    category: "dairy",
    stock: 65,
    minThreshold: 20,
    unit: "Liter",
    burnRatePerDay: 18,
    lastRestocked: "2026-09-04",
  },
  {
    id: "inv-5",
    name: "Sirup Gula Aren Organik Cair 5L",
    category: "syrup",
    stock: 8.2,
    minThreshold: 3.0,
    unit: "Jerigen (5L)",
    burnRatePerDay: 1.4,
    lastRestocked: "2026-08-30",
  },
  {
    id: "inv-6",
    name: "Cup Dingin Biodegradable 16oz + Lid",
    category: "packaging",
    stock: 480,
    minThreshold: 150,
    unit: "Pcs",
    burnRatePerDay: 95,
    lastRestocked: "2026-09-02",
  },
  {
    id: "inv-7",
    name: "Cup Kertas Panas Double Wall 12oz",
    category: "packaging",
    stock: 320,
    minThreshold: 100,
    unit: "Pcs",
    burnRatePerDay: 45,
    lastRestocked: "2026-09-02",
  },
];

/* =========================================================
   PROMO VOUCHERS
   ========================================================= */
export const MOCK_VOUCHERS: VoucherPromo[] = [
  {
    code: "YAREHHEMAT10",
    title: "Diskon 10% Semua Menu",
    description: "Nikmati potongan 10% untuk pesanan minimal Rp 50.000.",
    discountType: "percentage",
    discountValue: 10,
    minOrder: 50000,
    expiresAt: "2026-12-31",
  },
  {
    code: "CREATOR20",
    title: "Voucher Komunitas Kreatif",
    description: "Diskon 20% khusus member Gold & Platinum (min. order Rp 75.000).",
    discountType: "percentage",
    discountValue: 20,
    minOrder: 75000,
    expiresAt: "2026-10-31",
  },
  {
    code: "GRATISONGKIR",
    title: "Gratis Ongkir Surabaya Area",
    description: "Potongan ongkir langsung hingga Rp 15.000 untuk pengiriman instan.",
    discountType: "fixed",
    discountValue: 15000,
    minOrder: 40000,
    expiresAt: "2026-11-30",
  },
];

/* =========================================================
   COMMUNITY EVENTS & FORUM THREADS
   ========================================================= */
export const MOCK_COMMUNITY_EVENTS: CommunityEvent[] = [
  {
    id: "event-1",
    title: "Surabaya Latte Art Jam & Sensory Talk 2026",
    speaker: "Barista Dimas & Senja Roastery",
    speakerRole: "Indonesia Brewers Cup Finalist",
    date: "Sabtu, 12 September 2026",
    time: "15:00 - 18:00 WIB",
    branchId: "darmo",
    branchName: "Darmo Flagship",
    image: "https://images.unsplash.com/photo-1511920170033-f8396924c348?w=800&auto=format&fit=crop&q=80",
    spotsLeft: 6,
    totalSpots: 35,
    price: 0,
    category: "coffee",
    attendeesCount: 29,
    isAttending: true,
  },
  {
    id: "event-2",
    title: "Creative Freelancers Coworking & Pitch Night",
    speaker: "Farhan Hakim (Founder SubSpace)",
    speakerRole: "Design Director & Creative Producer",
    date: "Rabu, 16 September 2026",
    time: "19:00 - 21:30 WIB",
    branchId: "gubeng",
    branchName: "Gubeng 24H Hub",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80",
    spotsLeft: 12,
    totalSpots: 40,
    price: 35000,
    category: "networking",
    attendeesCount: 28,
  },
  {
    id: "event-3",
    title: "Single Origin Cupping: Rahasia Kopi Lereng Ijen",
    speaker: "Pak Karyono (Ketua Koperasi Tani Ijen)",
    speakerRole: "Agronomist & Master Roaster",
    date: "Minggu, 20 September 2026",
    time: "10:00 - 12:30 WIB",
    branchId: "dharmahusada",
    branchName: "Dharmahusada Campus",
    image: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800&auto=format&fit=crop&q=80",
    spotsLeft: 8,
    totalSpots: 25,
    price: 50000,
    category: "workshop",
    attendeesCount: 17,
  },
];

export const MOCK_FORUM_POSTS: ForumPost[] = [
  {
    id: "post-1",
    authorName: "Achmad Rizqi",
    authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&fit=crop&crop=faces",
    authorRole: "Tech Nomad & Regular",
    authorTier: "Gold",
    timestamp: "2 jam yang lalu",
    title: "Spot meja paling tenang buat deep work coding di Darmo Flagship?",
    content: "Halo rek! Buat kalian yang sering laptopan di Darmo, meja T-04 sama T-06 beneran paling adem sinyal WiFi-nya kenceng gak? Rencana mau sprint remote deploy malam ini.",
    tags: ["CoworkingTips", "DarmoHub", "WiFiSpeed"],
    likesCount: 18,
    repliesCount: 4,
    isLiked: false,
    replies: [
      {
        id: "rep-1",
        authorName: "Bagus Setiawan",
        authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&fit=crop&crop=faces",
        timestamp: "1 jam yang lalu",
        content: "Meja T-04 rekomen banget mas Rizqi! Colokannya ada 4 dan persis di bawah AC tapi gak kena hembusan langsung. WiFi 5G tembus 140 Mbps.",
      },
      {
        id: "rep-2",
        authorName: "Barista Seno (Staff)",
        authorAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&fit=crop&crop=faces",
        timestamp: "45 menit yang lalu",
        content: "Bener mas, kalau butuh perpanjangan kabel or colokan ekstra tinggal panggil kami lewat tombol QR meja ya!",
      },
    ],
  },
  {
    id: "post-2",
    authorName: "Clarissa Putri",
    authorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&fit=crop&crop=faces",
    authorRole: "Illustrator & Designer",
    authorTier: "Platinum",
    timestamp: "5 jam yang lalu",
    title: "Nitro Honey Cold Brew + Croissant Butter = Mood booster terbaik!",
    content: "Gak pernah bosan sama kombinasi ini tiap nugas sore di Gubeng 24H. Foam dinginnya Nitro berasa banget pas ketemu gurih renyahnya Croissant Artisan. 10/10!",
    tags: ["MenuFavorite", "Gubeng24H", "FoodPairing"],
    likesCount: 34,
    repliesCount: 3,
    isLiked: true,
    replies: [
      {
        id: "rep-3",
        authorName: "Kevin Sanjaya",
        authorAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&fit=crop&crop=faces",
        timestamp: "3 jam yang lalu",
        content: "Setuju! Apalagi kalau pesan less sweet, rasa madu alaminya makin nonjol.",
      },
    ],
  },
];
