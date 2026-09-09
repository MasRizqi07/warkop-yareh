import { describe, expect, it } from 'vitest';
import type { AdminUser } from './api';
import {
  resolveOperationalBranchScope,
  type BranchRecord,
} from './operations-api';

const branches: BranchRecord[] = [
  {
    id: 'branch-a',
    name: 'Branch A',
    slug: 'branch-a',
    address: 'Address A',
    city: 'Surabaya',
    province: 'Jawa Timur',
    isMainBranch: true,
    capacity: 20,
    features: [],
    weekdayHours: '08:00-20:00',
    weekendHours: '08:00-22:00',
  },
  {
    id: 'branch-b',
    name: 'Branch B',
    slug: 'branch-b',
    address: 'Address B',
    city: 'Surabaya',
    province: 'Jawa Timur',
    isMainBranch: false,
    capacity: 10,
    features: [],
    weekdayHours: '09:00-18:00',
    weekendHours: '09:00-18:00',
  },
];

const user = (role: string, branchId: string | null = 'branch-a'): AdminUser => ({
  id: `${role.toLowerCase()}-1`,
  name: role,
  email: `${role.toLowerCase()}@example.com`,
  role,
  branchId,
});

describe('resolveOperationalBranchScope', () => {
  it('keeps global admins on all branches', () => {
    const scope = resolveOperationalBranchScope(user('ADMIN', null), branches);

    expect(scope.branches).toEqual(branches);
    expect(scope.canViewAllBranches).toBe(true);
    expect(scope.canUpdateBranch).toBe(true);
    expect(scope.canUpdateBranchProducts).toBe(true);
    expect(scope.canAccessManagement).toBe(true);
  });

  it('limits managers to their assigned branch and branch-product controls', () => {
    const scope = resolveOperationalBranchScope(user('MANAGER'), branches);

    expect(scope.branches.map((branch) => branch.id)).toEqual(['branch-a']);
    expect(scope.canViewAllBranches).toBe(false);
    expect(scope.canUpdateBranch).toBe(false);
    expect(scope.canUpdateBranchProducts).toBe(true);
    expect(scope.canAccessManagement).toBe(true);
  });

  it('keeps staff read-only except for the dedicated availability control', () => {
    const scope = resolveOperationalBranchScope(user('STAFF'), branches);

    expect(scope.branches.map((branch) => branch.id)).toEqual(['branch-a']);
    expect(scope.canUpdateBranch).toBe(false);
    expect(scope.canUpdateBranchProducts).toBe(false);
    expect(scope.canAccessManagement).toBe(false);
  });

  it('rejects missing or stale branch assignments for scoped roles', () => {
    expect(() => resolveOperationalBranchScope(user('OWNER', null), branches)).toThrow(
      'needs a branch assignment'
    );
    expect(() =>
      resolveOperationalBranchScope(user('OWNER', 'missing'), branches)
    ).toThrow('assigned branch is no longer available');
  });
});
