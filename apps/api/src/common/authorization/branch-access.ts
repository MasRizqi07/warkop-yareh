import { ForbiddenException } from '@nestjs/common';
import { Role } from '@warkop-yareh/database';
import type { AuthenticatedUser } from '../interfaces/authenticated-user.interface';

const GLOBAL_BRANCH_ROLES: ReadonlySet<Role> = new Set([
  Role.ADMIN,
  Role.SUPERADMIN,
]);

export function hasGlobalBranchAccess(user: AuthenticatedUser): boolean {
  return GLOBAL_BRANCH_ROLES.has(user.role);
}

export function requireAssignedBranch(user: AuthenticatedUser): string {
  if (!user.branchId) {
    throw new ForbiddenException('A branch assignment is required');
  }
  return user.branchId;
}

export function resolveManagedBranch(
  user: AuthenticatedUser,
  requestedBranchId?: string,
): string | undefined {
  return hasGlobalBranchAccess(user)
    ? requestedBranchId
    : requireAssignedBranch(user);
}

export function assertBranchAccess(
  user: AuthenticatedUser,
  branchId: string,
): void {
  if (hasGlobalBranchAccess(user)) return;
  if (requireAssignedBranch(user) !== branchId) {
    throw new ForbiddenException(
      'You can only access resources assigned to your branch',
    );
  }
}
