import type { Role } from '@warkop-yareh/database';

export interface WsAuthenticatedUser {
  id: string;
  email: string;
  role: Role;
  branchId: string | null;
}
