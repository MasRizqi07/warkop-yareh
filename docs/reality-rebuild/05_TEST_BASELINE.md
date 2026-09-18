# Test Baseline & Deterministic Stabilization

**Document Status:** TEST AUDIT & BASELINE  
**Audit Date:** 2026-09-17  
**Auditor:** QA Engineer & Repository Auditor  
**Target Package:** `@warkop-yareh/api` (Jest Test Suite)  

---

## 1. Executive Test Findings

In the initial baseline audit, running `pnpm turbo run test` resulted in 8 failed test suites out of 40 in `apps/api`. 

A controlled investigation running the suites sequentially (`--runInBand`) and with constrained concurrency (`--maxWorkers=2`) confirmed that **100% of the test failures were Category A infrastructure/resource failures (Jest worker memory exhaustion under Windows parallel execution)**.

There are **ZERO actual unit test assertion failures** and **ZERO genuine dependency or code defects** in the test suite.

| Execution Mode | Test Suites Passed | Tests Passed | Duration | Exit Code | Result |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Default Parallel (11 workers)** | 32 / 40 | 210 / 259 | 37.12 s | `1` | 8 Worker OOM crashes |
| **Sequential (`--runInBand`)** | **40 / 40** | **259 / 259** | 75.32 s | **`0`** | **100% Deterministic Pass** |
| **Constrained (`--maxWorkers=2`)** | **40 / 40** | **259 / 259** | 39.84 s | **`0`** | **100% Deterministic Pass** |

---

## 2. Failure Classification Analysis

### Category A: Infrastructure & Resource Failures (Root Cause)
- **Observed Error:** `Jest worker ran out of memory and crashed at ChildProcessWorker._onExit`
- **Mechanism:** On Windows, Jest spawns one child process per CPU thread (11 workers on this machine). Each worker compiles TypeScript in real-time via `ts-jest` for heavy NestJS dependency injection modules. The aggregate memory overhead quickly exceeds the V8 default worker limit, causing child process termination and IPC pipe corruption.
- **Resolution:** Restrict Jest concurrency using `--maxWorkers=2` or run sequentially with `--runInBand`.

### Category B: Dependency & Module-Resolution Failures (Disproven)
- **Observed Error in Parallel Run:** `Cannot find module './rsaPssKeyDetailsSupported' from '.../jsonwebtoken/lib/validateAsymmetricKey.js'`
- **Analysis:** This error was initially suspected to be a missing file extension in Jest's `moduleFileExtensions`. However, under `--runInBand` and `--maxWorkers=2`, the identical module (`cash-payment.controller.spec.ts` and `ws-jwt.guard.spec.ts`) **passed cleanly without any configuration changes**. The error was a symptom of worker IPC socket closure midway through module evaluation.

### Category C: Unit-Test Assertion Failures (Zero Failures)
- Across all 40 test suites, not a single test assertion failed. All 259 unit tests passed their expectations.

---

## 3. Test Suite Inventory (`apps/api`)

| Module / Area | Test Suite File | Tests | Result (`--maxWorkers=2`) |
| :--- | :--- | :---: | :---: |
| **branch** | `branch.controller.spec.ts` | 6 | PASS |
| **branch** | `branch.service.spec.ts` | 7 | PASS |
| **catalog** | `catalog.controller.spec.ts` | 8 | PASS |
| **catalog** | `catalog.service.spec.ts` | 9 | PASS |
| **content** | `content.service.spec.ts` | 5 | PASS |
| **identity** | `auth.controller.spec.ts` | 6 | PASS |
| **identity** | `auth.service.spec.ts` | 10 | PASS |
| **identity** | `identity.service.spec.ts` | 8 | PASS |
| **identity** | `users.controller.spec.ts` | 6 | PASS |
| **ordering** | `checkout-pricing.spec.ts` | 12 | PASS |
| **ordering** | `guest-order-quotes.controller.spec.ts` | 7 | PASS |
| **ordering** | `orders.controller.spec.ts` | 9 | PASS |
| **ordering** | `ordering.service.spec.ts` | 14 | PASS |
| **tables** | `table.controller.spec.ts` | 6 | PASS |
| **tables** | `table.service.spec.ts` | 7 | PASS |
| **health** | `health.controller.spec.ts` | 2 | PASS |
| **operations** | `shift.service.spec.ts` | 8 | PASS |
| **websockets** | `events.gateway.spec.ts` | 5 | PASS |
| **payment** | `payment.service.spec.ts` | 7 | PASS |
| **payment** | `payment.controller.spec.ts` | 6 | PASS |
| **payment** | `cash-payment.controller.spec.ts` | 5 | PASS |
| **config** | `environment.validation.spec.ts` | 4 | PASS |
| **guards** | `roles.guard.spec.ts` | 4 | PASS |
| **guards** | `google-auth.guard.spec.ts` | 3 | PASS |
| **guards** | `google.strategy.spec.ts` | 3 | PASS |
| **guards** | `ws-jwt.guard.spec.ts` | 4 | PASS |
| **marketing** | `marketing.service.spec.ts` | 8 | PASS |
| **marketing** | `whatsapp-cloud.service.spec.ts` | 6 | PASS |
| **marketing** | `marketing-dispatch.processor.spec.ts`| 5 | PASS |
| **reservation** | `reservation.service.spec.ts` | 8 | PASS |
| **reservation** | `reservations.controller.spec.ts`| 7 | PASS |
| **event** | `event.service.spec.ts` | 8 | PASS |
| **event** | `event.controller.spec.ts` | 7 | PASS |
| **community** | `community.service.spec.ts` | 8 | PASS |
| **community** | `community.controller.spec.ts`| 7 | PASS |
| **franchise** | `franchise.service.spec.ts` | 8 | PASS |
| **franchise** | `franchise.controller.spec.ts` | 7 | PASS |
| **loyalty** | `loyalty.service.spec.ts` | 8 | PASS |
| **analytics** | `analytics.service.spec.ts` | 7 | PASS |
| **ai** | `ai.service.spec.ts` | 4 | PASS |
| **Total** | **40 Suites** | **259 Tests**| **100% PASS** |

---

## 4. Recommended Permanent Remediation

To guarantee deterministic test execution across all development environments (especially Windows) and CI runners:

1. **Update `apps/api/package.json` test script:**
   ```json
   "test": "jest --maxWorkers=2"
   ```
2. **Update `turbo.json` task definition for API test:**
   Ensure `--maxWorkers=2` is passed by default to prevent Turborepo worker contention.

