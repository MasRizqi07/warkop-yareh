# Seed Safety & Replacement Strategy

**Document Status:** TECHNICAL SAFETY SPECIFICATION  
**Target:** `packages/database/prisma/seed.ts`  
**Auditor:** Database Engineer & QA Engineer  

---

## 1. Inventory of Seed Entry Points

| Invocation Command | Target File | Environment Context | Risk Level |
| :--- | :--- | :--- | :---: |
| `pnpm --filter @warkop-yareh/database run db:seed` | `packages/database/prisma/seed.ts` | Local development / test setup | **CRITICAL** |
| `pnpm --filter @warkop-yareh/database run seed` | `packages/database/prisma/seed.ts` | Local manual seeding | **CRITICAL** |
| `npx prisma db seed` | `packages/database/prisma/seed.ts` | Automated Prisma CLI hooks | **CRITICAL** |
| `scripts/test-phase1-e2e.ts` | Custom E2E setup | Test runner | MEDIUM |

---

## 2. Contamination Exposure in Existing Seed

Running the current `packages/database/prisma/seed.ts` unconditionally inserts:
1. **Fictional Branch:** `id: 'coldnbrew-gubeng-001'`, `name: "Warkop Ya'reh Gubeng"`, `address: 'Jl. Gubeng Pojok No. 10'`, fake phone, fake capacity 80, features: `Meeting Room`, `Drive Thru`.
2. **32 Fictional Luxury Menu Items:** Americano, Nitro Cold Brew, Croissant Mentega, Pasta Aglio e Olio, Lava Cake, Crème Brûlée, Tiramisu.
3. **Fictional Meeting Rooms:** Tables `MR-A`, `MR-B` (capacity 10 and 6).
4. **Fictional Staff Emails:** `admin@coldnbrew.id`, `kasir@coldnbrew.id`, `kitchen@coldnbrew.id`.
5. **Fictional Gamified Rewards:** `Nitro Cold Brew` (500 pts), `Toraja V60` (400 pts).
6. **Fictional Tech Community Event:** `Ngopi & Bangun Produk`.

---

## 3. Replacement Seed Strategy (Verified Reality Only)

The replacement seed script (`packages/database/prisma/seed.ts`) will adhere to three inviolable rules:

### Rule 1: Verified Branch Profiles Only
Seed exactly two branches using verified canonical records:
- **Branch 1:** `id: 'jetis-kulon'`, `name: "WARKOP YA'REH"`, `address: 'Jl. Raya Jetis Kulon I No.38, Wonokromo, Surabaya, Jawa Timur 60243'`, Plus Code `MPVJ+2G Wonokromo, Surabaya, Jawa Timur`, 24 hours, Dine-in/Takeaway.
- **Branch 2:** `id: 'prapen'`, `name: "WARKOP YA'REH 2 PRAPEN"`, `address: 'Jl. Raya Prapen No.39, Prapen, Kec. Tenggilis Mejoyo, Surabaya, Jawa Timur 60239'`, Plus Code `MQM3+XJ Prapen, Surabaya, Jawa Timur`, Phone `0821-3735-4606`, 24 hours, Dine-in/Takeaway.

### Rule 2: Production Menu Seed Remains Empty
- Because itemized menu data and prices have not been validated against physical receipts or authenticated merchant menus, **ZERO products will be inserted**.
- Product and category tables remain clean.

### Rule 3: Neutral Administrative Accounts
- Administrative staff seeds will use local internal identifiers (e.g. `admin@warkopyareh.local`).
- Passwords configured strictly via environment variables (`SEED_ADMIN_PASSWORD`).

---

## 4. Temporary Safety Guard Implementation

To prevent accidental execution of legacy seed logic prior to Stage 4 implementation, an assertion guard will be embedded at the head of `seed.ts`:

```typescript
// Guard: Block contaminated legacy seeding
if (BRANCH_ID === 'coldnbrew-gubeng-001' && process.env.ALLOW_LEGACY_SEED !== 'true') {
  console.error('❌ SAFETY GUARD: Legacy seed containing fictional Cold N Brew fixtures is blocked.');
  console.error('   Replace seed.ts with the Phase 1.5 verified reality seed before proceeding.');
  process.exit(1);
}
```

