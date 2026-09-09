import type { StateStorage } from 'zustand/middleware';

const serverStorage: StateStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
};

/**
 * Zustand initializes stores while Next.js renders on the server. Returning a
 * stable no-op adapter there keeps persistence browser-only without touching
 * the global `window` object during module evaluation.
 */
export function getPersistStorage(): StateStorage {
  return typeof window === 'undefined' ? serverStorage : window.localStorage;
}
