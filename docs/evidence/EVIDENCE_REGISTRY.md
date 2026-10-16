# Evidence Registry — Photographic & Documentary Artifacts

**Document Status:** ACTIVE / RESTRICTED REFERENCE  
**Date:** 2026-10-16  
**Source Baseline:** `origin/main@6aabb9e`  
**Storage Location:** `evidence-raw/` (quarantined on local disk, excluded from git tracking via `.gitignore`)  
**Allowed Use:** `INTERNAL_REFERENCE_ONLY` (none of these files may ever appear under `apps/*/public`, in the gallery, in `seed.ts`, in migrations, or in test fixtures)

---

## 1. Registry Table

| File | SHA256 (First 16) | SHA256 (Full) | Pixel Size | Visible Content | Burned-in Date | Branch | Source Type | Rights | Flags | Allowed Use |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `images.jpg` | `2afe70edff2216d4` | `2afe70edff2216d4b6b0b046cd2495a181872b10e8152d215e15a360360e4bfb` | 300x300 | Night storefront, illuminated fascia sign "WARKOP YA'REH +" with yellow typography, duck mascot logo, "BUKA 24 JAM" | None | `UNKNOWN` | Public social / Maps thumbnail | `UNKNOWN` | `low-res` | `INTERNAL_REFERENCE_ONLY` |
| `images (1).jpg` | `b34995d3db09ae99` | `b34995d3db09ae996aea851197b88693e1290b9c215d58f2e232f9adc0874ac8` | 415x739 | Daytime storefront, fascia sign "WARKOP YA'REH + BEBEK GORENG KAK TOAN" | None | `UNKNOWN` | TikTok screenshot | `UNKNOWN` | `third-party-caption` | `INTERNAL_REFERENCE_ONLY` |
| `images (2).jpg` | `3aaf51e7efaf3295` | `3aaf51e7efaf32953c60c42ce7bb209a8ceaab8d263caa748cd90a4379f6896a` | 415x739 | Night storefront from road, burned-in TikTok caption mentioning "Jetis Kulon" | None | Jetis Kulon (caption claim) | TikTok screenshot | `UNKNOWN` | `third-party-caption` | `INTERNAL_REFERENCE_ONLY` |
| `images (3).jpg` | `64f1814e1285dd89` | `64f1814e1285dd89f5b0228adf08d7d9873701d05d94f0fb6d0948684429be23` | 516x387 | Wall banner drinks menu titled "MINUMAN", red header "BUKA 24 JAM", electric wall fan | None | `UNKNOWN` | Contributor photo | `UNKNOWN` | `low-res-unreadable-prices` | `INTERNAL_REFERENCE_ONLY` |
| `unnamed.webp` | `c5c05931f56868ec` | `c5c05931f56868ecef396e3c1c31e777a741935e3f73f9624de03132b19ea834` | 765x1020 | Storefront exterior at night in wet weather, lit sign "WARKOP YA'REH +", partial figure of passerby/customer | None | `UNKNOWN` | Contributor photo | `UNKNOWN` | `person-partly-visible` | `INTERNAL_REFERENCE_ONLY` |
| `unnamed (1).webp` | `7e7b911d42cb3895` | `7e7b911d42cb38958e2b16bebccf06f245e1edbffafe9598d9a807c643e13f87` | 765x1020 | Laminated printed food menu titled "MAKANAN", co-brand logo "BEBEK GORENG KAK TOAN", categories Sambelan, Mie, Toping, Snack | 2025/12/06 09:19 | `UNKNOWN` | Contributor / Owner snapshot | `UNKNOWN` | `timestamped-draft`, `co-brand-kak-toan` | `INTERNAL_REFERENCE_ONLY` |
| `unnamed (2).webp` | `c373fbf6cf119d73` | `c373fbf6cf119d730c9d6a3a37f78caa75ec13e595d6d0de892c02f195a569f6` | 765x1020 | Laminated printed drinks menu titled "MINUMAN", co-brand logo "BEBEK GORENG KAK TOAN", categories Coffe, Non Coffe, Tea, Fresh Milk, Yakult, Milkshake, Squash, Juice | 2025/12/06 09:19 | `UNKNOWN` | Contributor / Owner snapshot | `UNKNOWN` | `timestamped-draft`, `duplicate-category-header` | `INTERNAL_REFERENCE_ONLY` |
| `unnamed (3).webp` | `432b5c121fbc35f1` | `432b5c121fbc35f1bc8a5f018a5546bf4ad5ddf8f1a552c7549e1c92349e5d82` | 574x1020 | Interior seating area, wooden paneled walls, sofas, numbered tables 7 and 8 | None | `UNKNOWN` | Contributor photo | `UNKNOWN` | `branch-unverified` | `INTERNAL_REFERENCE_ONLY` |
| `unnamed (4).webp` | `e0edef60550c6f7b` | `e0edef60550c6f7b817fdacee731f89c94379b2098b4604e1dc7f88875fade29` | 765x1020 | Interior dining/working space showing patrons seated with open laptop screens | None | `UNKNOWN` | Contributor photo | `UNKNOWN` | **`CRITICAL_PRIVACY: identifiable-faces-and-screen-content`** | `INTERNAL_REFERENCE_ONLY` |
| `unnamed (5).webp` | `22ade56d97982700` | `22ade56d97982700ed231184c669678bc6991b052166ec36ab76baed313ab841` | 574x1020 | Order counter ("KASIR"), overhead menu boards, printed "FREE WIFI" sign, standee QR payment barcode on counter | None | `UNKNOWN` | Contributor photo | `UNKNOWN` | **`CRITICAL_SECURITY: visible-payment-qr-code`** | `INTERNAL_REFERENCE_ONLY` |

---

## 2. Provenance & Risk Assessment

1. **Naming Patterns:** Files named `images*.jpg` and `unnamed*.webp` strongly indicate automated downloads from third-party social media (TikTok) and Google Maps user contributions.
2. **Copyright & Rights:** Provenance and intellectual property ownership are completely unverified (`UNKNOWN`). There is no release or license from photographers or patrons.
3. **Privacy & Security Risks:**
   - `unnamed (4).webp` contains clear, identifiable customer faces and visible laptop displays without consent.
   - `unnamed (5).webp` displays a merchant payment QR code whose provenance, destination account, and validity are unknown.
4. **Quarantine Rule:** These files must remain quarantined in `evidence-raw/` and excluded from repository tracking. They are never to be served on public web routes, added to gallery assets, or referenced in production schemas or fixtures.
