import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User } from '@warkop-yareh/types';

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
      storage: createJSONStorage(() =>
        typeof window !== 'undefined'
          ? window.localStorage
          : {
              getItem: () => null,
              setItem: () => {},
              removeItem: () => {},
            }
      ),
      migrate: (persistedState: any) => {
        return persistedState || { user: null };
      },
      // We purposefully DO NOT persist the access token in localStorage for security (XSS prevention)
      // The httpOnly refresh cookie will handle getting a new access token on reload
      partialize: (state) => ({ user: state.user }),
    }
  )
);
