# Warkop Ya'reh — Menu & Catalog Source of Truth

**Document Status:** LIVING CATALOG TRUTH  
**Last Updated:** 2026-09-17  
**Policy Level:** STRICT PRODUCTION INVARIANT  

---

## 1. Ground Truth Statement

1. **Verified Price Range:** Rp1 - 25.000 per person across both branches.
2. **Item-Level Verification Status:** `UNVERIFIED`.
1. **Public Venue Spending Range:**  
   The value **`Rp1 - 25.000 per orang`** recorded from public listings is a **venue spending range** (typical expenditure per person per visit). It is **NOT** an item-level menu price.
2. **Item-Level Verification Status:** Currently **`UNVERIFIED`** (No current evidence of official printed menu or itemized receipts).
3. **Official Production Seed Rule:**  
   Because exact item names, ingredients, categorization, and prices have not been validated against direct physical receipts or authenticated merchant records, **the production menu database MUST REMAIN EMPTY**.
   Because exact item names, ingredients, portion options, and item-specific prices have not been validated against direct physical receipts or authenticated merchant records, **the production menu database MUST REMAIN COMPLETELY EMPTY**.

---

## 2. Prohibition of Fictional Items

The previous codebase seeded 32 fictional luxury coffee shop items. All of these are strictly prohibited from appearing in any production database, seed script, API response, or public route:

| Fictional Category | Prohibited Items | Contamination Source |
| :--- | :--- | :--- |
| **Espresso** | Americano, Cappuccino, Caramel Latte, Flat White, Espresso, Macchiato, Cortado, Long Black | `packages/database/prisma/seed.ts` |
| **Cold Brew** | Classic Cold Brew, Cold Brew Tonic, Salted Caramel Cold Brew, Cold Brew Latte, Nitro Cold Brew, Cold Brew Float | `packages/database/prisma/seed.ts` |
| **Pastries / Bakery** | Croissant Mentega, Banana Bread, Cheese Toast, Brownie, Granola Bar, Karipap | `packages/database/prisma/seed.ts` |
| **Western Mains** | Pasta Aglio e Olio, Sandwich Club | `packages/database/prisma/seed.ts` |
| **Desserts** | Lava Cake, Crème Brûlée, Tiramisu, Mochi Ice Cream | `packages/database/prisma/seed.ts` |

**Engineering Rule:** Renaming these items to "Warkop Ya'reh Americano" or "Ya'reh Croissant" is strictly prohibited. Fictional data must be purged, not disguised.

---

## 3. Real Warkop Surabaya Culinary Context (Informative Only)

In traditional Surabaya warkop culture, standard offerings typically include:
- Kopi tubruk / Kopi cangkir / Kopi hitam
- Kopi susu / Kopi sachet
- Es teh / Teh manis hangat
- Minuman jahe / STMJ / Extra Joss susu
- Mie instan (rebus / goreng) dengan telur / kornet
- Gorengan (tempe mendoan, tahu isi, bakwan)

> **CRITICAL CAUTION:**  
> While the items above represent typical Surabaya warkop fare, they are provided here **purely for domain context**. They **MUST NOT** be seeded into the database or hardcoded into the user interface until an official physical audit, photo menu, or merchant verification is completed.

---

## 4. Public Menu Page Behavior (Phase 1)
## 4. Public Menu Page Behavior (`/menu`)

When users visit `/menu` on the customer-facing website:
1. The page must display the **verified price range**: `Rp1 - Rp25.000 per orang`.
2. A transparent, honest status banner must inform visitors:
   > *"Daftar menu lengkap dan harga detail sedang dalam proses verifikasi langsung dari outlet. Kunjungi Warkop Ya'reh Jetis Kulon atau Prapen untuk menikmati sajian kopi dan makanan kami secara langsung (Buka 24 Jam)."*
3. If an empty state component is rendered, it must be informative and welcoming, not a broken UI error.

1. **Primary Status Banner:**  
   `"Menu lengkap sedang diverifikasi langsung dari outlet."`
2. **Public Spending Range Reference:**  
   `"Kisaran pengeluaran yang tercantum pada listing publik: Rp1–25.000 per orang."`
3. **Transparent Guidance:**  
   `"Silakan berkunjung langsung ke Warkop Ya'reh Jetis Kulon atau Prapen untuk memesan aneka minuman dan makanan kami (Buka 24 Jam)."`
4. **No Price Confusion:**  
   Never present Rp1–25.000 as a single product price or suggest that all items start at Rp1.
