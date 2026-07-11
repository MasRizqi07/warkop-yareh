
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.22.0
 * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
 */
Prisma.prismaVersion = {
  client: "5.22.0",
  engine: "605197351a3c8bdd595af2d2a9bc3025bca48ea2"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  email: 'email',
  phone: 'phone',
  name: 'name',
  avatar: 'avatar',
  passwordHash: 'passwordHash',
  role: 'role',
  membershipTier: 'membershipTier',
  loyaltyPoints: 'loyaltyPoints',
  referralCode: 'referralCode',
  referredBy: 'referredBy',
  branchId: 'branchId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  deletedAt: 'deletedAt'
};

exports.Prisma.BranchScalarFieldEnum = {
  id: 'id',
  name: 'name',
  slug: 'slug',
  address: 'address',
  city: 'city',
  province: 'province',
  postalCode: 'postalCode',
  phone: 'phone',
  email: 'email',
  latitude: 'latitude',
  longitude: 'longitude',
  isMainBranch: 'isMainBranch',
  isActive: 'isActive',
  capacity: 'capacity',
  features: 'features',
  weekdayHours: 'weekdayHours',
  weekendHours: 'weekendHours',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  deletedAt: 'deletedAt'
};

exports.Prisma.CategoryScalarFieldEnum = {
  id: 'id',
  name: 'name',
  slug: 'slug',
  icon: 'icon',
  sortOrder: 'sortOrder',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ProductScalarFieldEnum = {
  id: 'id',
  name: 'name',
  slug: 'slug',
  description: 'description',
  price: 'price',
  originalPrice: 'originalPrice',
  image: 'image',
  categoryId: 'categoryId',
  tags: 'tags',
  isPopular: 'isPopular',
  isNew: 'isNew',
  isActive: 'isActive',
  rating: 'rating',
  reviewCount: 'reviewCount',
  preparationTime: 'preparationTime',
  calories: 'calories',
  ingredients: 'ingredients',
  sortOrder: 'sortOrder',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  deletedAt: 'deletedAt'
};

exports.Prisma.ProductCustomizationScalarFieldEnum = {
  id: 'id',
  productId: 'productId',
  name: 'name',
  options: 'options',
  createdAt: 'createdAt'
};

exports.Prisma.BranchProductScalarFieldEnum = {
  id: 'id',
  branchId: 'branchId',
  productId: 'productId',
  isAvailable: 'isAvailable',
  priceOverride: 'priceOverride'
};

exports.Prisma.OrderScalarFieldEnum = {
  id: 'id',
  orderNumber: 'orderNumber',
  userId: 'userId',
  branchId: 'branchId',
  tableId: 'tableId',
  type: 'type',
  status: 'status',
  subtotal: 'subtotal',
  tax: 'tax',
  discount: 'discount',
  total: 'total',
  paymentStatus: 'paymentStatus',
  pickupTime: 'pickupTime',
  notes: 'notes',
  customerName: 'customerName',
  customerPhone: 'customerPhone',
  loyaltyPointsEarned: 'loyaltyPointsEarned',
  loyaltyPointsUsed: 'loyaltyPointsUsed',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  deletedAt: 'deletedAt'
};

exports.Prisma.OrderItemScalarFieldEnum = {
  id: 'id',
  orderId: 'orderId',
  productId: 'productId',
  quantity: 'quantity',
  unitPrice: 'unitPrice',
  totalPrice: 'totalPrice',
  customizations: 'customizations',
  notes: 'notes',
  snapshotName: 'snapshotName',
  snapshotPrice: 'snapshotPrice',
  snapshotTax: 'snapshotTax'
};

exports.Prisma.PaymentScalarFieldEnum = {
  id: 'id',
  orderId: 'orderId',
  method: 'method',
  status: 'status',
  amount: 'amount',
  midtransToken: 'midtransToken',
  midtransOrderId: 'midtransOrderId',
  reference: 'reference',
  paidAt: 'paidAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.TableScalarFieldEnum = {
  id: 'id',
  branchId: 'branchId',
  number: 'number',
  name: 'name',
  type: 'type',
  capacity: 'capacity',
  zone: 'zone',
  qrCode: 'qrCode',
  status: 'status',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ReservationScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  branchId: 'branchId',
  tableId: 'tableId',
  date: 'date',
  startTime: 'startTime',
  endTime: 'endTime',
  guestCount: 'guestCount',
  status: 'status',
  specialRequests: 'specialRequests',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.EventScalarFieldEnum = {
  id: 'id',
  title: 'title',
  slug: 'slug',
  description: 'description',
  longDescription: 'longDescription',
  image: 'image',
  date: 'date',
  startTime: 'startTime',
  endTime: 'endTime',
  location: 'location',
  branchId: 'branchId',
  category: 'category',
  capacity: 'capacity',
  registered: 'registered',
  price: 'price',
  isFree: 'isFree',
  isOnline: 'isOnline',
  tags: 'tags',
  status: 'status',
  speakers: 'speakers',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  deletedAt: 'deletedAt'
};

exports.Prisma.EventRegistrationScalarFieldEnum = {
  id: 'id',
  eventId: 'eventId',
  userId: 'userId',
  status: 'status',
  ticketCode: 'ticketCode',
  paidAmount: 'paidAmount',
  createdAt: 'createdAt'
};

exports.Prisma.CommunityGroupScalarFieldEnum = {
  id: 'id',
  name: 'name',
  slug: 'slug',
  description: 'description',
  image: 'image',
  category: 'category',
  isActive: 'isActive',
  tags: 'tags',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  deletedAt: 'deletedAt'
};

exports.Prisma.CommunityMembershipScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  groupId: 'groupId',
  role: 'role',
  joinedAt: 'joinedAt'
};

exports.Prisma.CommunityPostScalarFieldEnum = {
  id: 'id',
  authorId: 'authorId',
  groupId: 'groupId',
  content: 'content',
  image: 'image',
  likes: 'likes',
  comments: 'comments',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.LoyaltyTransactionScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  type: 'type',
  points: 'points',
  description: 'description',
  orderId: 'orderId',
  expiresAt: 'expiresAt',
  createdAt: 'createdAt'
};

exports.Prisma.RewardScalarFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description',
  image: 'image',
  pointsCost: 'pointsCost',
  category: 'category',
  tier: 'tier',
  isAvailable: 'isAvailable',
  expiresAt: 'expiresAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ReviewScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  productId: 'productId',
  branchId: 'branchId',
  rating: 'rating',
  comment: 'comment',
  images: 'images',
  helpful: 'helpful',
  isVerified: 'isVerified',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.NotificationScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  title: 'title',
  message: 'message',
  type: 'type',
  isRead: 'isRead',
  actionUrl: 'actionUrl',
  createdAt: 'createdAt'
};

exports.Prisma.BlogPostScalarFieldEnum = {
  id: 'id',
  title: 'title',
  slug: 'slug',
  excerpt: 'excerpt',
  content: 'content',
  image: 'image',
  authorName: 'authorName',
  authorAvatar: 'authorAvatar',
  authorRole: 'authorRole',
  category: 'category',
  tags: 'tags',
  readTime: 'readTime',
  isPublished: 'isPublished',
  publishedAt: 'publishedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AuditLogScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  action: 'action',
  entity: 'entity',
  entityId: 'entityId',
  details: 'details',
  ipAddress: 'ipAddress',
  userAgent: 'userAgent',
  createdAt: 'createdAt'
};

exports.Prisma.OutboxEventScalarFieldEnum = {
  id: 'id',
  aggregateType: 'aggregateType',
  aggregateId: 'aggregateId',
  eventType: 'eventType',
  payload: 'payload',
  createdAt: 'createdAt',
  processedAt: 'processedAt'
};

exports.Prisma.SessionScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  tokenHash: 'tokenHash',
  userAgent: 'userAgent',
  ipAddress: 'ipAddress',
  expiresAt: 'expiresAt',
  createdAt: 'createdAt',
  revokedAt: 'revokedAt'
};

exports.Prisma.UserDeviceScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  deviceToken: 'deviceToken',
  platform: 'platform',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.FranchiseAgreementScalarFieldEnum = {
  id: 'id',
  branchId: 'branchId',
  ownerName: 'ownerName',
  ownerEmail: 'ownerEmail',
  companyName: 'companyName',
  agreementStart: 'agreementStart',
  agreementEnd: 'agreementEnd',
  monthlyFee: 'monthlyFee',
  revenueShare: 'revenueShare',
  status: 'status',
  terms: 'terms',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.FranchiseBillingScalarFieldEnum = {
  id: 'id',
  agreementId: 'agreementId',
  period: 'period',
  amount: 'amount',
  revenueAmount: 'revenueAmount',
  status: 'status',
  paidAt: 'paidAt',
  dueDate: 'dueDate',
  invoiceUrl: 'invoiceUrl',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.WaiterCallScalarFieldEnum = {
  id: 'id',
  tableId: 'tableId',
  type: 'type',
  status: 'status',
  resolvedAt: 'resolvedAt',
  createdAt: 'createdAt'
};

exports.Prisma.OrderFeedbackScalarFieldEnum = {
  id: 'id',
  orderId: 'orderId',
  productRating: 'productRating',
  serviceRating: 'serviceRating',
  atmosphereRating: 'atmosphereRating',
  comment: 'comment',
  createdAt: 'createdAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.JsonNullValueInput = {
  JsonNull: Prisma.JsonNull
};

exports.Prisma.NullableJsonNullValueInput = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};
exports.Role = exports.$Enums.Role = {
  CUSTOMER: 'CUSTOMER',
  STAFF: 'STAFF',
  CASHIER: 'CASHIER',
  KITCHEN: 'KITCHEN',
  MANAGER: 'MANAGER',
  ADMIN: 'ADMIN',
  OWNER: 'OWNER',
  SUPERADMIN: 'SUPERADMIN'
};

exports.MembershipTier = exports.$Enums.MembershipTier = {
  BRONZE: 'BRONZE',
  SILVER: 'SILVER',
  GOLD: 'GOLD',
  PLATINUM: 'PLATINUM'
};

exports.OrderType = exports.$Enums.OrderType = {
  DINE_IN: 'DINE_IN',
  TAKE_AWAY: 'TAKE_AWAY',
  DRIVE_THRU: 'DRIVE_THRU',
  DELIVERY: 'DELIVERY'
};

exports.OrderStatus = exports.$Enums.OrderStatus = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  PREPARING: 'PREPARING',
  READY: 'READY',
  SERVED: 'SERVED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
};

exports.PaymentStatus = exports.$Enums.PaymentStatus = {
  UNPAID: 'UNPAID',
  PAID: 'PAID',
  REFUNDED: 'REFUNDED',
  FAILED: 'FAILED'
};

exports.PaymentMethod = exports.$Enums.PaymentMethod = {
  CASH: 'CASH',
  QRIS: 'QRIS',
  DEBIT: 'DEBIT',
  CREDIT_CARD: 'CREDIT_CARD',
  E_WALLET: 'E_WALLET'
};

exports.TableType = exports.$Enums.TableType = {
  INDOOR: 'INDOOR',
  OUTDOOR: 'OUTDOOR',
  VIP: 'VIP',
  MEETING_ROOM: 'MEETING_ROOM'
};

exports.TableStatus = exports.$Enums.TableStatus = {
  AVAILABLE: 'AVAILABLE',
  OCCUPIED: 'OCCUPIED',
  RESERVED: 'RESERVED',
  CLEANING: 'CLEANING',
  MAINTENANCE: 'MAINTENANCE'
};

exports.ReservationStatus = exports.$Enums.ReservationStatus = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED',
  NO_SHOW: 'NO_SHOW'
};

exports.EventCategory = exports.$Enums.EventCategory = {
  WORKSHOP: 'WORKSHOP',
  MUSIC: 'MUSIC',
  COMMUNITY: 'COMMUNITY',
  BUSINESS: 'BUSINESS',
  ART: 'ART',
  TECH: 'TECH',
  FOOD: 'FOOD'
};

exports.EventStatus = exports.$Enums.EventStatus = {
  UPCOMING: 'UPCOMING',
  ONGOING: 'ONGOING',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
};

exports.EventRegistrationStatus = exports.$Enums.EventRegistrationStatus = {
  REGISTERED: 'REGISTERED',
  WAITLISTED: 'WAITLISTED',
  CANCELLED: 'CANCELLED',
  ATTENDED: 'ATTENDED'
};

exports.CommunityMemberRole = exports.$Enums.CommunityMemberRole = {
  MEMBER: 'MEMBER',
  MODERATOR: 'MODERATOR',
  ADMIN: 'ADMIN'
};

exports.LoyaltyType = exports.$Enums.LoyaltyType = {
  EARNED: 'EARNED',
  REDEEMED: 'REDEEMED',
  EXPIRED: 'EXPIRED',
  BONUS: 'BONUS',
  REFERRAL: 'REFERRAL'
};

exports.NotificationType = exports.$Enums.NotificationType = {
  ORDER: 'ORDER',
  EVENT: 'EVENT',
  LOYALTY: 'LOYALTY',
  COMMUNITY: 'COMMUNITY',
  PROMO: 'PROMO',
  SYSTEM: 'SYSTEM'
};

exports.FranchiseStatus = exports.$Enums.FranchiseStatus = {
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
  TERMINATED: 'TERMINATED',
  PENDING: 'PENDING'
};

exports.BillingStatus = exports.$Enums.BillingStatus = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  OVERDUE: 'OVERDUE',
  WAIVED: 'WAIVED'
};

exports.WaiterCallType = exports.$Enums.WaiterCallType = {
  CALL_WAITER: 'CALL_WAITER',
  REQUEST_BILL: 'REQUEST_BILL',
  NEED_ASSISTANCE: 'NEED_ASSISTANCE'
};

exports.CallStatus = exports.$Enums.CallStatus = {
  PENDING: 'PENDING',
  RESOLVED: 'RESOLVED'
};

exports.Prisma.ModelName = {
  User: 'User',
  Branch: 'Branch',
  Category: 'Category',
  Product: 'Product',
  ProductCustomization: 'ProductCustomization',
  BranchProduct: 'BranchProduct',
  Order: 'Order',
  OrderItem: 'OrderItem',
  Payment: 'Payment',
  Table: 'Table',
  Reservation: 'Reservation',
  Event: 'Event',
  EventRegistration: 'EventRegistration',
  CommunityGroup: 'CommunityGroup',
  CommunityMembership: 'CommunityMembership',
  CommunityPost: 'CommunityPost',
  LoyaltyTransaction: 'LoyaltyTransaction',
  Reward: 'Reward',
  Review: 'Review',
  Notification: 'Notification',
  BlogPost: 'BlogPost',
  AuditLog: 'AuditLog',
  OutboxEvent: 'OutboxEvent',
  Session: 'Session',
  UserDevice: 'UserDevice',
  FranchiseAgreement: 'FranchiseAgreement',
  FranchiseBilling: 'FranchiseBilling',
  WaiterCall: 'WaiterCall',
  OrderFeedback: 'OrderFeedback'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
