'use client';

import { useEffect } from 'react';
import type { User } from '@warkop-yareh/types';
import { api, refreshAccessToken } from '@/lib/api';
import type { ApiEnvelope, SessionUser } from '@/features/api/contracts';
import { useAuthStore } from '@/stores/auth.store';

function toUser(user: SessionUser): User {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone ?? null,
    avatar: user.avatar ?? null,
    role: user.role,
    branchId: user.branchId,
    membershipTier: user.membershipTier ?? 'BRONZE',
    loyaltyPoints: user.loyaltyPoints ?? 0,
    joinedAt: user.joinedAt ?? new Date(0).toISOString(),
  };
}

export function SessionBootstrap() {
  useEffect(() => {
    let active = true;

    const restoreSession = async () => {
      try {
        const accessToken = await refreshAccessToken();
        const response = await api.get<ApiEnvelope<SessionUser>>('/auth/me');
        if (active) {
          useAuthStore.getState().setAuth(toUser(response.data.data), accessToken);
        }
      } catch {
        if (active) useAuthStore.getState().logout();
      } finally {
        if (active) useAuthStore.getState().setInitialized(true);
      }
    };

    void restoreSession();
    return () => {
      active = false;
    };
  }, []);

  return null;
}
