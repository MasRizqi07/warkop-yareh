import type { StateStorage } from 'zustand/middleware';

const serverStorage: StateStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
};

export const LEGACY_AUTH_STORAGE_KEY = 'coldnbrew-auth';
export const TARGET_AUTH_STORAGE_KEY = 'warkop-yareh-auth';

/**
 * Zustand initializes stores while Next.js renders on the server. Returning a
 * stable no-op adapter there keeps persistence browser-only without touching
 * the global `window` object during module evaluation.
 *
 * In browser environments, provides automatic forward-migration from legacy
 * `coldnbrew-auth` to `warkop-yareh-auth`.
 */
export function getPersistStorage(): StateStorage {
  if (typeof window === 'undefined') {
    return serverStorage;
  }

  return {
    getItem: (name: string): string | null => {
      try {
        const currentData = window.localStorage.getItem(name);
        if (currentData !== null) {
          return currentData;
        }

        // Automatic legacy migration for auth storage
        if (name === TARGET_AUTH_STORAGE_KEY) {
          const legacyData = window.localStorage.getItem(LEGACY_AUTH_STORAGE_KEY);
          if (legacyData !== null) {
            try {
              const parsed = JSON.parse(legacyData);
              if (parsed && typeof parsed === 'object') {
                if (parsed.state?.user) {
                  delete parsed.state.user.membershipTier;
                  delete parsed.state.user.loyaltyPoints;
                  delete parsed.state.user.referralCode;
                }
                const migratedString = JSON.stringify(parsed);
                window.localStorage.setItem(TARGET_AUTH_STORAGE_KEY, migratedString);
                window.localStorage.removeItem(LEGACY_AUTH_STORAGE_KEY);
                return migratedString;
              }
            } catch {
              window.localStorage.removeItem(LEGACY_AUTH_STORAGE_KEY);
            }
          }
        }

        return null;
      } catch {
        return null;
      }
    },
    setItem: (name: string, value: string): void => {
      try {
        window.localStorage.setItem(name, value);
      } catch {
        // Ignore quota/storage access errors in private browsing
      }
    },
    removeItem: (name: string): void => {
      try {
        window.localStorage.removeItem(name);
      } catch {
        // No-op
      }
    },
  };
}
