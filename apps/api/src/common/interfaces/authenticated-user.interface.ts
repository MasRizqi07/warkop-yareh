import type { MembershipTier, Role } from '@warkop-yareh/database';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  branchId: string | null;
  phone?: string | null;
  avatar?: string | null;
  membershipTier?: MembershipTier;
  loyaltyPoints?: number;
}
