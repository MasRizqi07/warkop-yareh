import { AsyncLocalStorage } from 'async_hooks';

export interface TenantContext {
  userId?: string;
  branchId?: string;
  role?: string;
}

export const tenantContext = new AsyncLocalStorage<TenantContext>();
