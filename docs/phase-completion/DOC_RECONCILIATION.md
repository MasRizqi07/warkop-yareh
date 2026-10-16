# Source-of-Truth Document Reconciliation Report

**Document Status:** COMPLETE  
**Date:** 2026-10-13  
**Repo:** `MasRizqi07/warkop-yareh`  
**Phase:** Phase 1 — Fix the source-of-truth documents (docs only)  
**Target Files:**  
- `docs/business/BUSINESS_TRUTH.md`
- `docs/business/DATA_CONFIDENCE.md`

---

## 1. Executive Summary

In accordance with Phase 1 directives, the authoritative source-of-truth documents have been reconciled. All bad merges, duplicate headings, duplicated tables, corrupted markdown tables, and overlapping TypeScript declarations have been eliminated. Every conflicting business claim has been resolved toward the **weaker claim (`UNVERIFIED` / `NO CURRENT EVIDENCE`)** in compliance with Rule 3 ("Absence of evidence is not evidence of absence") because no primary authoritative evidence exists to assert `VERIFIED_ABSENT` or `DISPUTED`. Zero new business facts were added.

---

## 2. Document Conflict Resolution Matrix

| File | Attribute / Section | Baseline Value (Conflicted) | Reconciled Value | Resolution Rationale |
| :--- | :--- | :--- | :--- | :--- |
| `BUSINESS_TRUTH.md` | Rule 3 numbering | `3. No Cosmetic Rebranding:` (blank line) followed by `3. Absence of Evidence is NOT Evidence of Absence:` and `4. No Cosmetic Rebranding:` | Clean 1–4 sequential list (Rule 3: Absence of Evidence; Rule 4: No Cosmetic Rebranding) | Merge corruption fix. Removed empty rule 3 duplicate and restored sequential numbering. |
| `BUSINESS_TRUTH.md` | Online Reservations | Identity Table 1: `NONE (...) / VERIFIED_ABSENCE`<br>Identity Table 2: `NO CURRENT EVIDENCE / UNVERIFIED` | `NO CURRENT EVIDENCE / UNVERIFIED` | Rule 3 prohibits `VERIFIED_ABSENT` without written owner declaration or physical audit proof. Resolved to weaker claim `UNVERIFIED`. |
| `BUSINESS_TRUTH.md` | Loyalty Program | Identity Table 1: `NONE (...) / VERIFIED_ABSENCE`<br>Identity Table 2: `NO CURRENT EVIDENCE / UNVERIFIED` | `NO CURRENT EVIDENCE / UNVERIFIED` | Absence of evidence is not evidence of absence. Lacks primary owner proof. Resolved to weaker claim `UNVERIFIED`. |
| `BUSINESS_TRUTH.md` | Meeting / VIP Rooms | Identity Table 1: `NONE (...) / VERIFIED_ABSENCE`<br>Identity Table 2: `NO CURRENT EVIDENCE / UNVERIFIED` | `NO CURRENT EVIDENCE / UNVERIFIED` | Lacks documented physical negative proof. Resolved to weaker claim `UNVERIFIED`. |
| `BUSINESS_TRUTH.md` | Drive-Thru | Identity Table 1: `NONE (...) / VERIFIED_ABSENCE`<br>Identity Table 2: `NO CURRENT EVIDENCE / UNVERIFIED` | `NO CURRENT EVIDENCE / UNVERIFIED` | Lacks documented owner statement. Resolved to weaker claim `UNVERIFIED`. |
| `BUSINESS_TRUTH.md` | Identity Table Duplication | Table 1 (3-column) immediately followed by Table 2 (4-column) with duplicate headers on line 45 | Single unified 4-column Identity Table | Merged into one authoritative table retaining Notes/Temporal Metadata. |
| `BUSINESS_TRUTH.md` | Outlet Tables (Jetis Kulon & Prapen) | Mid-table duplicated headers (`\| :--- \| :--- \| :--- \|`) and duplicate rows for `Services Offered` / `Price Range` | Clean 3-column table per outlet with single header and deduplicated rows | Removed concatenation artifacts; standardized property names to `Services Supported` and `Public Spending Range`. |
| `BUSINESS_TRUTH.md` | Section 4 Headings | `## 4. Product & Menu Ground Truth`<br>`## 4. Menu & Price Semantics Policy` | `## 4. Menu & Price Semantics Policy` | Unified duplicate section 4 headings and numbered policies into a single cohesive section. |
| `BUSINESS_TRUTH.md` | Section 5 Headings | `## 5. Technology & Platform Responsibilities`<br>`## 5. About-Page & Heritage Policy` | `## 5. Technology, About-Page & Heritage Policy` | Unified into single Section 5 with subsections for Platform Responsibilities, Heritage Ground Truth, Permitted Positioning, and Prohibited Buzzwords. |
| `DATA_CONFIDENCE.md` | Section 1 & 2 Headings | `## 1. Confidence Levels`<br>`## 1. Core Evidence Rule` | `## 1. Core Evidence Rule`<br>`## 2. Confidence Level Taxonomy` | Fixed duplicate numbering and cleaned ASCII diagram. |
| `DATA_CONFIDENCE.md` | TypeScript Interfaces | Line 99-100: Interleaved `TraceableBusinessFact<T>` and `DynamicExternalFact<T>` without closing brace (Invalid TS) | Valid TypeScript with distinct `TraceableBusinessFact<T>` and `DynamicExternalFact<T>` | Resolved syntax error; separated both complete interface definitions into valid TypeScript. |
| `DATA_CONFIDENCE.md` | Public Wi-Fi | Table 1: `WiFi in Outlets / PARTIALLY_VERIFIED / CUSTOMER_REVIEW`<br>Table 2: `Public Wi-Fi / UNVERIFIED` | `Public Wi-Fi / UNVERIFIED` | Unauthenticated customer reviews do not constitute verifiable primary evidence. Resolved to weaker claim `UNVERIFIED`. |
| `DATA_CONFIDENCE.md` | VIP / Meeting Rooms | Table 1: `VIP / Meeting Rooms / DISPUTED / Real warkops do not feature VIP rooms`<br>Table 2: `VIP / Meeting Rooms / UNVERIFIED` | `VIP / Meeting Rooms / UNVERIFIED` | "Real warkops do not feature VIP rooms" is an inference, not evidence. Resolved to weaker claim `UNVERIFIED`. |
| `DATA_CONFIDENCE.md` | Entity Classification Matrix | Table 1 (lines 117–130) followed by Table 2 (lines 132–154) | Single unified classification table (Section 5) | Eliminated duplicate matrix; retained verified branch and service metadata while marking unproven services `UNVERIFIED`. |

---

## 3. Downstream Runtime & Audit Impact

An audit of downstream files confirmed that:
1. `scripts/business-integrity-audit.mjs`:
   - Does NOT assert `VERIFIED_ABSENCE` or `DISPUTED` for any entity.
   - Asserts canonical branch fixtures (`Jetis Kulon` and `Prapen`), empty menu seed invariants, unregistered legacy modules, and lack of speculative marketing copy.
   - All 27 checks remain fully intact and operational.
2. `apps/api/src/modules/reality/reality.service.ts`:
   - Operates on `GalleryAsset` and `SiteContent` database entities.
   - Assigns private editorial drafts `UNVERIFIED` by default.
   - Does not encode conflicting identity claims.

---

## 4. Verification Evidence

### 4.1 `git diff --stat`
```text
 docs/business/BUSINESS_TRUTH.md            | 85 ++++++++----------------------
 docs/business/DATA_CONFIDENCE.md           | 69 +++++++-----------------
 docs/phase-completion/DOC_RECONCILIATION.md | 86 ++++++++++++++++++++++++++++++
 3 files changed, 120 insertions(+), 120 deletions(-)
```

### 4.2 `pnpm audit:reality`
The audit passes 27/27 with zero failures after these changes.

---

## 5. Phase 3 (Revised) Evidence Intake Reconciliation

**Date:** 2026-10-16  
**Source Baseline:** Raw photographic artifacts in `evidence-raw/` (arrived in commit `6aabb9e`)

| Evidence Artifact / Input | Prior / Raw Input Claim | Authoritative Reconciliation | Confidence Level | Resolution Rationale |
| :--- | :--- | :--- | :--- | :--- |
| Co-brand "Bebek Goreng Kak Toan" | Signage on storefront photos (`images.jpg`, `images (1).jpg`) and header on printed menus (`unnamed (1).webp`, `unnamed (2).webp`) display "WARKOP YA'REH + BEBEK GORENG KAK TOAN". Google Maps listing categorizes Jetis as "Kedai Kopi". | Recorded as operational conflict. No mention added to public site copy pending owner clarification. | `UNVERIFIED` | Relationship (joint venture, shared premises, or sub-brand) and branch applicability are unknown. |
| Prapen Instagram (`@warkopyareh2prapen`) | Instagram profile with reel `DYhZY0gNIp1` | Recognized strictly as Prapen outlet social profile, not brand-wide. Lacks owner confirmation. | `UNVERIFIED` (`OFFICIAL_SOCIAL_MEDIA`) | Cannot be applied brand-wide to Jetis Kulon. Proposed minimal outlet-specific link pending owner verification. |
| Bio Claim "sudah berdiri 1 tahun" | Profile bio on `@warkopyareh2prapen` states "sudah berdiri 1 tahun" | Conflict with web search snippet (14 Mar 2026 "Kak Toan 2 hadir di Surabaya Selatan") and undated snapshot. | `DISPUTED` | Rule 5 ("Shared brand does not claim an unverified founding year") remains strictly enforced. |
| "FREE WIFI" sign (`unnamed (5).webp`) | Wall/counter printed notice stating "FREE WIFI" | Kept as unverified observation. No facility list or Wi-Fi claims added to customer web application. | `UNVERIFIED` | Exact branch, date, network availability, and customer accessibility remain unverified. |
| Counter Payment QR Code (`unnamed (5).webp`) | Standee QR payment barcode visible on order counter | Do not claim or document specific digital payment gateway methods on public site. | `UNVERIFIED` | Destination merchant account, bank network, and branch applicability unverified. |
| Google Maps Rating & Popular Times | Google Maps listing shows rating 3.9, 19 reviews, and peak hours 11:00–19:00 | Excluded from codebase, marketing pages, and structured data schemas. | `DYNAMIC_EXTERNAL_DATA` | Third-party temporal data subject to external fluctuations; prohibited from hardcoding by DATA_CONFIDENCE section 3. |
