import { api } from '@/lib/api';
import type { ApiEnvelope, PaginatedApiEnvelope } from '@/features/api/contracts';

export type EventCategory = 'WORKSHOP' | 'MUSIC' | 'COMMUNITY' | 'BUSINESS' | 'ART' | 'TECH' | 'FOOD';

export interface PublicEvent {
  id: string;
  title: string;
  slug: string;
  description: string;
  longDescription: string | null;
  image: string | null;
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
  tags: string[];
  status: 'UPCOMING' | 'ONGOING';
  branch?: { id: string; name: string; city: string };
  _count: { registrations: number };
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image: string | null;
  authorName: string;
  authorAvatar: string | null;
  authorRole: string | null;
  category: string;
  tags: string[];
  readTime: number;
  publishedAt: string;
}

export interface VerifiedReview {
  id: string;
  rating: number;
  comment: string;
  helpful: number;
  createdAt: string;
  user: { id: string; name: string; avatar: string | null };
  product: { id: string; name: string } | null;
}

export interface CommunityGroup {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string | null;
  category: string;
  tags: string[];
  _count: { memberships: number; posts: number };
}

export interface CommunityPost {
  id: string;
  groupId: string;
  authorId: string;
  content: string;
  image: string | null;
  likes: number;
  comments: number;
  createdAt: string;
  author: { id: string; name: string; avatar: string | null };
}

export interface CommunityMembership {
  id: string;
  role: 'MEMBER' | 'MODERATOR' | 'ADMIN';
  joinedAt: string;
}

export interface PublicTable {
  id: string;
  branchId: string;
  number: string;
  capacity: number;
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'CLEANING' | 'MAINTENANCE';
}

export async function listEvents(params: { category?: EventCategory; branchId?: string } = {}): Promise<PublicEvent[]> {
  const response = await api.get<PaginatedApiEnvelope<PublicEvent>>('/events', {
    params: { ...params, page: 1, limit: 100 },
  });
  return response.data.data;
}

export async function getEvent(id: string): Promise<PublicEvent> {
  return (await api.get<ApiEnvelope<PublicEvent>>(`/events/${id}`)).data.data;
}

export async function registerForEvent(id: string): Promise<void> {
  await api.post(`/events/${id}/register`);
}

export async function listBlogPosts(params: { category?: string; search?: string } = {}): Promise<BlogPost[]> {
  const response = await api.get<PaginatedApiEnvelope<BlogPost>>('/content/blog', {
    params: { ...params, page: 1, limit: 100 },
  });
  return response.data.data;
}

export async function getBlogPost(slug: string): Promise<BlogPost> {
  return (await api.get<ApiEnvelope<BlogPost>>(`/content/blog/${encodeURIComponent(slug)}`)).data.data;
}

export async function listVerifiedReviews(branchId?: string): Promise<VerifiedReview[]> {
  return (await api.get<ApiEnvelope<VerifiedReview[]>>('/content/reviews', { params: { branchId, limit: 20 } })).data.data;
}

export async function listCommunityGroups(category?: string): Promise<CommunityGroup[]> {
  return (await api.get<ApiEnvelope<CommunityGroup[]>>('/community/groups', { params: { category } })).data.data;
}

export async function getCommunityGroup(idOrSlug: string): Promise<CommunityGroup> {
  return (await api.get<ApiEnvelope<CommunityGroup>>(`/community/groups/${encodeURIComponent(idOrSlug)}`)).data.data;
}

export async function getCommunityMembership(idOrSlug: string): Promise<CommunityMembership | null> {
  return (await api.get<ApiEnvelope<CommunityMembership | null>>(`/community/groups/${encodeURIComponent(idOrSlug)}/membership`)).data.data;
}

export async function joinCommunityGroup(id: string): Promise<void> {
  await api.post(`/community/groups/${id}/join`);
}

export async function listCommunityPosts(groupId: string): Promise<CommunityPost[]> {
  const response = await api.get<PaginatedApiEnvelope<CommunityPost>>(`/community/groups/${groupId}/posts`, { params: { page: 1, limit: 100 } });
  return response.data.data;
}

export async function createCommunityPost(groupId: string, content: string): Promise<CommunityPost> {
  return (await api.post<ApiEnvelope<CommunityPost>>('/community/posts', { groupId, content })).data.data;
}

export async function getPublicTable(id: string): Promise<PublicTable> {
  return (await api.get<ApiEnvelope<PublicTable>>(`/tables/public/${encodeURIComponent(id)}`)).data.data;
}

export async function resolveTableQr(code: string): Promise<PublicTable> {
  return (await api.get<ApiEnvelope<PublicTable>>(`/tables/qr/${encodeURIComponent(code)}`)).data.data;
}

export async function createWaiterCall(id: string, type: 'CALL_WAITER' | 'REQUEST_BILL' | 'NEED_ASSISTANCE'): Promise<void> {
  await api.post(`/tables/${id}/call`, { type });
}
