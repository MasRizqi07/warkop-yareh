# Auth Storage Migration Design: Legacy Key Migration

**Document Status:** TECHNICAL DESIGN SPECIFICATION  
**Target Key Transition:** `coldnbrew-auth` ──► `warkop-yareh-auth`  
**Target Package:** `apps/web` (`src/stores/auth.store.ts`, `src/stores/persist-storage.ts`)  

---

## 1. Objectives & Security Constraints

1. **Security Invariant:** Never persist access tokens in client storage. The application uses HttpOnly refresh cookies for session renewal; local storage stores only non-sensitive user profile metadata.
2. **Seamless Transition:** Existing authenticated users must not experience broken hydration, crashes, or session disruption during the key transition.
3. **No Infinite Loops:** Migration must execute exactly once per client, immediately deleting the old key upon successful transfer.
4. **Resilience:** Gracefully handle corrupt legacy JSON, missing legacy keys, and private browsing / disabled localStorage environments.
5. **SSR Safety:** Must remain a no-op during Next.js server-side rendering without touching `window`.

---

## 2. Migration Architecture

Instead of relying solely on Zustand's internal versioning (which only operates within a single key name), an **atomic storage adapter** will intercept `getItem` calls for `warkop-yareh-auth`:

```
Client calls localStorage.getItem('warkop-yareh-auth')
                        │
                        ▼
       Does 'warkop-yareh-auth' exist?
             │                     │
            YES                    NO
             │                     │
             │                     ▼
             │         Does 'coldnbrew-auth' exist?
             │               │                 │
             │              YES                NO
             │               │                 │
             │               ▼                 ▼
             │       Safely Parse JSON     Return null
             │               │
             │               ▼
             │       Sanitize User Object
             │    (Strip loyalty/membership)
             │               │
             │               ▼
             │       Write to 'warkop-yareh-auth'
             │               │
             │               ▼
             │       Delete 'coldnbrew-auth'
             │               │
             ▼               ▼
      Return validated state to Zustand store
```

---

## 3. Implementation Specification

### 3.1 Migration Storage Adapter (`apps/web/src/stores/persist-storage.ts`)

```typescript
import type { StateStorage } from 'zustand/middleware';

const LEGACY_STORAGE_KEY = 'coldnbrew-auth';
const TARGET_STORAGE_KEY = 'warkop-yareh-auth';

export function getMigratedAuthStorage(): StateStorage {
  if (typeof window === 'undefined') {
    return {
      getItem: () => null,
      setItem: () => undefined,
      removeItem: () => undefined,
    };
  }

  return {
    getItem: (name: string): string | null => {
      try {
        const currentData = window.localStorage.getItem(name);
        if (currentData) return currentData;

        // If target key is missing, check for legacy key
        if (name === TARGET_STORAGE_KEY) {
          const legacyData = window.localStorage.getItem(LEGACY_STORAGE_KEY);
          if (legacyData) {
            try {
              const parsed = JSON.parse(legacyData);
              if (parsed && typeof parsed === 'object') {
                // Sanitize legacy fields
                if (parsed.state?.user) {
                  delete parsed.state.user.membershipTier;
                  delete parsed.state.user.loyaltyPoints;
                  delete parsed.state.user.referralCode;
                }
                const migratedString = JSON.stringify(parsed);
                window.localStorage.setItem(TARGET_STORAGE_KEY, migratedString);
                window.localStorage.removeItem(LEGACY_STORAGE_KEY);
                return migratedString;
              }
            } catch {
              // Corrupt legacy data; safely delete
              window.localStorage.removeItem(LEGACY_STORAGE_KEY);
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
        // Handle quota or private browsing errors gracefully
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
```

---

## 4. Test Verification Cases

The migration logic will be verified in `apps/web/src/stores/persist-storage.test.ts` across four test cases:
1. **Fresh User:** No legacy key exists -> Store initializes with `user: null`, no error.
2. **Legacy User Migration:** `coldnbrew-auth` exists with valid user -> Migrates data to `warkop-yareh-auth`, deletes `coldnbrew-auth`, and strips speculative loyalty fields.
3. **Corrupt Legacy Key:** `coldnbrew-auth` contains invalid JSON -> Removes corrupted key without throwing, returns `user: null`.
4. **Already Migrated:** Both keys exist -> `warkop-yareh-auth` takes precedence.

