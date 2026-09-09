import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User } from '@warkop-yareh/types';
import { getPersistStorage } from './persist-storage';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  setAuth: (user: User, accessToken: string) => void;
  setAccessToken: (token: string) => void;
  setInitialized: (initialized: boolean) => void;
  logout: () => void;
}

type PersistedAuthState = Pick<AuthState, 'user'>;

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isInitialized: false,
      setAuth: (user, accessToken) =>
        set({ user, accessToken, isAuthenticated: true, isInitialized: true }),
      setAccessToken: (accessToken) => set({ accessToken }),
      setInitialized: (isInitialized) => set({ isInitialized }),
      logout: () =>
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          isInitialized: true,
        }),
    }),
    {
      name: 'coldnbrew-auth',
      version: 2,
      storage: createJSONStorage<PersistedAuthState>(getPersistStorage),
      migrate: (persistedState): PersistedAuthState => {
        if (!persistedState || typeof persistedState !== 'object') {
          return { user: null };
        }
        const candidate = persistedState as { user?: unknown };
        return {
          user:
            candidate.user === null || typeof candidate.user === 'object'
              ? (candidate.user as User | null)
              : null,
        };
      },
      // We purposefully DO NOT persist the access token in localStorage for security (XSS prevention)
      // The httpOnly refresh cookie will handle getting a new access token on reload
      partialize: (state) => ({ user: state.user }),
    }
  )
);
