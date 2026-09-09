import { apiFetch } from './api';
import type { Paginated } from './operations-api';

interface Envelope<T> {
  data: T;
  message?: string;
}

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY'
  | 'SERVED'
  | 'COMPLETED'
  | 'CANCELLED';

export interface ProductRecord {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  image: string | null;
  isActive: boolean;
  categoryId: string;
  category: { id: string; name: string; slug: string };
}

export interface CategoryRecord {
  id: string;
  name: string;
  slug: string;
}

export interface OrderRecord {
  id: string;
  orderNumber: string;
  branchId: string | null;
  tableId: string | null;
  status: OrderStatus;
  type: 'DINE_IN' | 'TAKE_AWAY' | 'DRIVE_THRU' | 'DELIVERY';
  subtotal: number;
  tax: number;
  serviceFee: number;
  discount: number;
  total: number;
  paymentStatus: 'UNPAID' | 'PAID' | 'REFUNDED' | 'FAILED';
  customerName: string | null;
  customerPhone: string | null;
  createdAt: string;
  updatedAt: string;
  items: Array<{
    id: string;
    productId: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    snapshotName: string;
    notes: string | null;
  }>;
  user: { id: string; name: string; email: string; phone: string | null } | null;
}

export interface OrderQuote {
  subtotal: number;
  tax: number;
  serviceFee: number;
  discount: number;
  total: number;
  loyaltyPointsUsed: number;
}

export interface TableRecord {
  id: string;
  branchId: string;
  number: string;
  capacity: number;
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'CLEANING' | 'MAINTENANCE';
  isActive: boolean;
  orders: Array<Pick<OrderRecord, 'id' | 'status' | 'total' | 'createdAt'>>;
}

export interface WaiterCallRecord {
  id: string;
  type: 'CALL_WAITER' | 'REQUEST_BILL' | 'NEED_ASSISTANCE';
  status: 'PENDING' | 'RESOLVED';
  createdAt: string;
  resolvedAt: string | null;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  table: Pick<TableRecord, 'id' | 'number' | 'branchId'>;
}

export interface ShiftRecord {
  id: string;
  branchId: string;
  status: 'OPEN' | 'CLOSED';
  openingFloat: number;
  closingCash: number | null;
  expectedCash: number | null;
  variance: number | null;
  openedAt: string;
  closedAt: string | null;
  notes: string | null;
  branch: { id: string; name: string };
  openedBy: { id: string; name: string };
  closedBy: { id: string; name: string } | null;
  movements: Array<{
    id: string;
    type: 'CASH_IN' | 'CASH_OUT';
    amount: number;
    reason: string;
    createdAt: string;
    createdBy: { id: string; name: string };
  }>;
  summary: {
    cashSales: number;
    cashIn: number;
    cashOut: number;
    expectedCash: number;
  };
}

export interface ReservationRecord {
  id: string;
  branchId: string;
  tableId: string | null;
  date: string;
  startTime: string;
  endTime: string;
  guestCount: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';
  specialRequests: string | null;
  user: { id: string; name: string; email: string; phone: string | null };
  table: { id: string; number: string } | null;
}

export interface EventRecord {
  id: string;
  title: string;
  slug: string;
  description: string;
  branchId: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  capacity: number;
  registered: number;
  price: number;
  isFree: boolean;
  category: 'WORKSHOP' | 'MUSIC' | 'COMMUNITY' | 'BUSINESS' | 'ART' | 'TECH' | 'FOOD';
  status: 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
  updatedAt: string;
  branch?: { id: string; name: string; city: string };
  _count?: { registrations: number };
}

export interface EventRegistrationRecord {
  id: string;
  eventId: string;
  userId: string;
  status: 'REGISTERED' | 'WAITLISTED' | 'ATTENDED' | 'CANCELLED';
  createdAt: string;
  user: { id: string; name: string; email: string };
}

export interface CommunityGroupRecord {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  isActive: boolean;
  _count: { memberships: number; posts: number };
}

export interface CommunityPostRecord {
  id: string;
  groupId: string;
  authorId: string;
  content: string;
  createdAt: string;
  author: { id: string; name: string; avatar: string | null };
  group?: { id: string; name: string; slug: string };
}

export interface RewardRecord {
  id: string;
  name: string;
  description: string;
  image: string | null;
  pointsCost: number;
  category: string;
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  isAvailable: boolean;
  expiresAt: string | null;
}

export interface UserRecord {
  id: string;
  email: string;
  phone: string | null;
  name: string;
  avatar: string | null;
  role: string;
  membershipTier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  loyaltyPoints: number;
  branchId: string | null;
  createdAt: string;
}

function queryString(input: Record<string, string | number | undefined>) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(input)) {
    if (value !== undefined && value !== '') query.set(key, String(value));
  }
  const serialized = query.toString();
  return serialized ? `?${serialized}` : '';
}

export async function getProducts(params: { page?: number; limit?: number; search?: string; categoryId?: string } = {}): Promise<Paginated<ProductRecord>> {
  return apiFetch(`/products${queryString({ page: params.page ?? 1, limit: params.limit ?? 100, search: params.search, categoryId: params.categoryId })}`);
}

export async function getCategories(): Promise<CategoryRecord[]> {
  return (await apiFetch<Envelope<CategoryRecord[]>>('/categories')).data;
}

export async function createProduct(input: { name: string; description?: string; price: number; categoryId: string }): Promise<ProductRecord> {
  return (await apiFetch<Envelope<ProductRecord>>('/products', { method: 'POST', body: JSON.stringify(input) })).data;
}

export async function updateProduct(id: string, input: Partial<{ name: string; description: string; price: number; categoryId: string }>): Promise<ProductRecord> {
  return (await apiFetch<Envelope<ProductRecord>>(`/products/${id}`, { method: 'PATCH', body: JSON.stringify(input) })).data;
}

export async function getOrders(params: { branchId?: string; status?: OrderStatus; page?: number; limit?: number } = {}): Promise<Paginated<OrderRecord>> {
  return apiFetch(`/orders${queryString({ branchId: params.branchId, status: params.status, page: params.page ?? 1, limit: params.limit ?? 100 })}`);
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<OrderRecord> {
  return (await apiFetch<Envelope<OrderRecord>>(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) })).data;
}

export async function quoteOrder(input: { branchId: string; items: Array<{ productId: string; quantity: number }>; type: 'DINE_IN' | 'TAKE_AWAY'; tableId?: string; userId?: string }): Promise<OrderQuote> {
  return (await apiFetch<Envelope<OrderQuote>>('/orders/quote', { method: 'POST', body: JSON.stringify(input) })).data;
}

export async function createOrder(input: { branchId: string; items: Array<{ productId: string; quantity: number }>; type: 'DINE_IN' | 'TAKE_AWAY'; tableId?: string; userId?: string; expectedTotal: number }, idempotencyKey: string): Promise<OrderRecord> {
  return (await apiFetch<Envelope<OrderRecord>>('/orders', { method: 'POST', headers: { 'Idempotency-Key': idempotencyKey }, body: JSON.stringify(input) })).data;
}

export async function settleCashPayment(orderId: string, cashReceived: number) {
  return (await apiFetch<Envelope<{ order: OrderRecord; cashReceived: number; change: number }>>('/payments/cash', { method: 'POST', body: JSON.stringify({ orderId, cashReceived }) })).data;
}

export async function getTables(branchId: string): Promise<TableRecord[]> {
  return (await apiFetch<Envelope<TableRecord[]>>(`/tables/branch/${encodeURIComponent(branchId)}`)).data;
}

export async function updateTableStatus(id: string, status: TableRecord['status']): Promise<TableRecord> {
  return (await apiFetch<Envelope<TableRecord>>(`/tables/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) })).data;
}

export async function getWaiterCalls(branchId: string): Promise<WaiterCallRecord[]> {
  return (await apiFetch<Envelope<WaiterCallRecord[]>>(`/tables/branch/${encodeURIComponent(branchId)}/calls`)).data;
}

export async function resolveWaiterCall(id: string): Promise<WaiterCallRecord> {
  return (await apiFetch<Envelope<WaiterCallRecord>>(`/tables/calls/${id}/resolve`, { method: 'PATCH' })).data;
}

export async function getCurrentShift(branchId: string): Promise<ShiftRecord | null> {
  return (await apiFetch<Envelope<ShiftRecord | null>>(`/shifts/current${queryString({ branchId })}`)).data;
}

export async function getShifts(branchId: string): Promise<Paginated<ShiftRecord>> {
  return apiFetch(`/shifts${queryString({ branchId, page: 1, limit: 100 })}`);
}

export async function openShift(branchId: string, openingFloat: number): Promise<ShiftRecord> {
  return (await apiFetch<Envelope<ShiftRecord>>('/shifts/open', { method: 'POST', body: JSON.stringify({ branchId, openingFloat }) })).data;
}

export async function addCashMovement(id: string, input: { type: 'CASH_IN' | 'CASH_OUT'; amount: number; reason: string }) {
  return (await apiFetch<Envelope<ShiftRecord['movements'][number]>>(`/shifts/${id}/movements`, { method: 'POST', body: JSON.stringify(input) })).data;
}

export async function closeShift(id: string, closingCash: number, notes?: string): Promise<ShiftRecord> {
  return (await apiFetch<Envelope<ShiftRecord>>(`/shifts/${id}/close`, { method: 'POST', body: JSON.stringify({ closingCash, notes }) })).data;
}

export async function getReservations(params: { branchId?: string; status?: ReservationRecord['status'] } = {}): Promise<Paginated<ReservationRecord>> {
  return apiFetch(`/reservations${queryString({ branchId: params.branchId, status: params.status, page: 1, limit: 100 })}`);
}

export async function updateReservationStatus(id: string, status: ReservationRecord['status']): Promise<ReservationRecord> {
  return (await apiFetch<Envelope<ReservationRecord>>(`/reservations/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) })).data;
}

export async function getEvents(branchId?: string): Promise<Paginated<EventRecord>> {
  return apiFetch(`/events/manage${queryString({ branchId, page: 1, limit: 100 })}`);
}

export type EventInput = Pick<EventRecord, 'title' | 'description' | 'branchId' | 'startTime' | 'endTime' | 'location' | 'capacity' | 'price' | 'category'> & { date: string };

export async function createEvent(input: EventInput): Promise<EventRecord> {
  return (await apiFetch<Envelope<EventRecord>>('/events', { method: 'POST', body: JSON.stringify(input) })).data;
}

export async function updateEvent(id: string, input: Partial<EventInput & { status: EventRecord['status'] }>): Promise<EventRecord> {
  return (await apiFetch<Envelope<EventRecord>>(`/events/${id}`, { method: 'PATCH', body: JSON.stringify(input) })).data;
}

export async function getEvent(id: string): Promise<EventRecord> {
  return (await apiFetch<Envelope<EventRecord>>(`/events/${id}`)).data;
}

export async function getEventRegistrations(id: string): Promise<EventRegistrationRecord[]> {
  return (await apiFetch<Envelope<EventRegistrationRecord[]>>(`/events/${id}/registrations`)).data;
}

export async function updateEventRegistration(eventId: string, registrationId: string, status: EventRegistrationRecord['status']): Promise<EventRegistrationRecord> {
  return (await apiFetch<Envelope<EventRegistrationRecord>>(`/events/${eventId}/registrations/${registrationId}`, { method: 'PATCH', body: JSON.stringify({ status }) })).data;
}

export async function getCommunityGroups(): Promise<CommunityGroupRecord[]> {
  return (await apiFetch<Envelope<CommunityGroupRecord[]>>('/community/groups')).data;
}

export async function createCommunityGroup(input: { name: string; description?: string; category?: string }): Promise<CommunityGroupRecord> {
  return (await apiFetch<Envelope<CommunityGroupRecord>>('/community/groups', { method: 'POST', body: JSON.stringify(input) })).data;
}

export async function getCommunityPosts(groupId: string): Promise<Paginated<CommunityPostRecord>> {
  return apiFetch(`/community/groups/${groupId}/posts?page=1&limit=100`);
}

export async function getRecentCommunityPosts(): Promise<Paginated<CommunityPostRecord>> {
  return apiFetch('/community/posts/manage?page=1&limit=100');
}

export async function deleteCommunityPost(id: string): Promise<void> {
  await apiFetch(`/community/posts/${id}`, { method: 'DELETE' });
}

export async function getRewards(): Promise<RewardRecord[]> {
  return (await apiFetch<Envelope<RewardRecord[]>>('/loyalty/rewards/manage')).data;
}

export type RewardInput = Pick<RewardRecord, 'name' | 'description' | 'pointsCost' | 'category' | 'tier' | 'isAvailable'> & { image?: string; expiresAt?: string | null };

export async function createReward(input: RewardInput): Promise<RewardRecord> {
  return (await apiFetch<Envelope<RewardRecord>>('/loyalty/rewards', { method: 'POST', body: JSON.stringify(input) })).data;
}

export async function updateReward(id: string, input: Partial<RewardInput>): Promise<RewardRecord> {
  return (await apiFetch<Envelope<RewardRecord>>(`/loyalty/rewards/${id}`, { method: 'PATCH', body: JSON.stringify(input) })).data;
}

export async function getUsers(params: { search?: string; role?: string } = {}): Promise<Paginated<UserRecord>> {
  return apiFetch(`/users${queryString({ search: params.search, role: params.role, page: 1, limit: 100 })}`);
}

export async function awardPoints(userId: string, points: number, reason: string): Promise<unknown> {
  return apiFetch(`/loyalty/users/${userId}/award`, { method: 'POST', body: JSON.stringify({ points, reason }) });
}
