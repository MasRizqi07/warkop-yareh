# Phase 0 - source and baseline evidence

FASE - 0: read-only verification before application edits.
KLAIM - inventory checked against source; no remediation implemented at this point.
LADDER CHECK - reuse current contracts, installed test runners, and existing UI package.

Source checkout: feat/phase-1-remediation at f7c76db4604bd7e80287be6829558609c4f59cd4, two pre-existing package script edits preserved. Original .git/index was zero bytes and was backed up as .git/index.corrupt-phase6-backup; rebuilt index from HEAD without changing files. Lost staging information cannot be reconstructed from an empty index.

Remediation checkout: codex/phase6-remediation at 90c4366792b6408cfdf8660981f13c45f3a355d1. Clean worktree before baseline. This merges origin/main 0b3efd9e3b97ad8711e1f77ecbc22d4eebcf91d3 with the three later source commits; its file tree equals f7c76db. A separate branch is intentional to preserve the user's original checkout. Remote refs refreshed with git fetch origin.

The audit is input evidence, not assumed-current truth. Cart currently calculates 11%/5% locally (not the audit's older 10%/flat fee). It still does not request the server quote. The API package is @warkop-yareh/api, not api. checkout.e2e-spec.ts is NOT included by pnpm turbo run test: the default Jest rootDir is src and testRegex scans .spec.ts there. Both integration configs are separate. jest-checkout.json has maxWorkers: 1 and testTimeout: 30000; it contains no comments.

The old app.e2e-spec.ts expects GET / -> Hello World although AppModule has no root controller. Its smoke assertion must be updated to the live health endpoint, while the checkout/RLS assertions must remain unchanged.

Initial pnpm shim selected Laragon Node 22 even after fnm use 24. Baseline repeated using temporary Corepack shims and verified pnpm exec node --version = v24.20.0. Temporary test credentials are not production configuration. Prisma client generated before baseline, matching CI.

GitHub CLI is not authenticated. Docker Desktop was started and is available; isolated postgres:16 will be used for the integration gate. No GitHub CI or staging success is claimed.

## Original source excerpts (line numbers refer to this audited tree)

### apps/web/src/app/cart/page.tsx

```text
48:   const tableLabel = useCheckoutStore((state) => state.tableLabel);
49:   const { activeBranch } = useActiveBranch();
50:   const estimatedTax = Math.round((subtotal * 11) / 100);
51:   const estimatedServiceFee = Math.round((subtotal * 5) / 100);
52:   const estimatedTotal = subtotal + estimatedTax + estimatedServiceFee;
53:   const perPersonShare = Math.ceil(estimatedTotal / splitBillCount);
54: 
55:   return (
56:     <main className="mx-auto min-h-screen max-w-7xl bg-canvas-obsidian px-4 pb-32 pt-8 text-text-primary transition-colors sm:px-6 sm:pt-10 lg:px-8">
57:       {/* Breadcrumb Navigation */}
58:       <nav
59:         aria-label="Breadcrumb"
60:         className="mb-6 flex items-center gap-2 font-mono text-xs text-text-muted"
61:       >
```

### apps/web/src/features/orders/checkout-page.tsx

```text
38:   const attempt = useRef<{ fingerprint: string; key: string } | null>(null);
39:   const request = useMemo<CreateOrderRequest>(() => ({
40:     branchId: branches.activeBranch?.id ?? '', type: TYPES[checkout.fulfillmentType],
41:     ...(checkout.fulfillmentType === 'dine-in' && checkout.tableId ? { tableId: checkout.tableId } : {}),
42:     notes: [notes.trim(), checkout.fulfillmentType === 'delivery' ? `Alamat: ${checkout.deliveryAddress.trim()}` : '', checkout.fulfillmentType === 'drive-thru' ? `Kendaraan: ${plate.trim().toUpperCase()}` : ''].filter(Boolean).join('\n'),
43:     ...(voucherCode ? { voucherCode } : {}), ...(points > 0 ? { loyaltyPointsUsed: points } : {}),
44:     items: items.map((item) => ({ productId: item.product.id, quantity: item.quantity, customizations: item.customizations, notes: item.notes })),
45:   }), [branches.activeBranch?.id, checkout.fulfillmentType, checkout.tableId, checkout.deliveryAddress, items, notes, plate, points, voucherCode]);
46:   const ready = initialized && authenticated && Boolean(branches.activeBranch) && items.length > 0;
47:   const quote = useQuery({ queryKey: ['checkout-quote', user?.id, request], queryFn: () => quoteOrder(request), enabled: ready, retry: false, staleTime: 0 });
48:   const purchase = useMutation({ mutationFn: async () => {
49:     if (!ready || !quote.data || quote.isFetching || quote.isError) throw new Error('Tunggu ringkasan harga selesai diperbarui.');
50:     if (checkout.fulfillmentType === 'dine-in' && !checkout.tableId) throw new Error('Pindai QR meja untuk pesanan dine-in.');
51:     if (checkout.fulfillmentType === 'delivery' && checkout.deliveryAddress.trim().length < 10) throw new Error('Isi alamat lengkap, minimal 10 karakter.');
52:     if (checkout.fulfillmentType === 'drive-thru' && plate.trim().length < 3) throw new Error('Isi nomor kendaraan untuk drive-thru.');
53:     const payload = { ...request, expectedTotal: quote.data.total };
54:     const fingerprint = JSON.stringify({ userId: user?.id, payload });
55:     if (!attempt.current) {
56:       try { const previous: unknown = JSON.parse(sessionStorage.getItem('warkop-checkout-attempt') ?? 'null'); if (previous && typeof previous === 'object' && 'fingerprint' in previous && previous.fingerprint === fingerprint && 'key' in previous && typeof previous.key === 'string' && previous.key.length >= 8 && previous.key.length <= 128) attempt.current = { fingerprint, key: previous.key }; } catch { attempt.current = null; }
57:     }
58:     if (attempt.current?.fingerprint !== fingerprint) attempt.current = { fingerprint, key: crypto.randomUUID() };
```

### apps/web/src/features/orders/orders.api.ts

```text
13:   expectedTotal?: number;
14:   voucherCode?: string;
15:   loyaltyPointsUsed?: number;
16:   branchId: string;
17:   items: Array<{
18:     productId: string;
19:     quantity: number;
20:     customizations?: Record<string, string>;
21:     notes?: string;
22:   }>;
23:   type: ApiOrderType;
24:   tableId?: string;
25:   notes?: string;
26: }
27: 
28: export interface OrderQuote {
29:   subtotal: number; tax: number; serviceFee: number; voucherDiscount: number;
30:   pointsDiscount: number; discount: number; loyaltyPointsUsed: number;
31:   maxRedeemablePoints: number; total: number;
32: }
33: 
34: export async function quoteOrder(request: CreateOrderRequest): Promise<OrderQuote> {
35:   return (await api.post<ApiEnvelope<OrderQuote>>('/orders/quote', request)).data.data;
36: }
37: 
38: export async function createOrder(
39:   request: CreateOrderRequest,
40:   idempotencyKey: string,
41: ): Promise<OrderDto> {
42:   const response = await api.post<ApiEnvelope<OrderDto>>('/orders', request, {
43:     headers: { 'Idempotency-Key': idempotencyKey },
44:   });
45:   return response.data.data;
46: }
```

### apps/api/src/modules/ordering/domain/checkout-pricing.ts

```text
15: export function calculateCheckout(
16:   subtotal: number,
17:   voucherDiscount = 0,
18:   points = 0,
19:   balance = 0,
20: ): OrderQuote {
21:   if (
22:     ![subtotal, voucherDiscount, points].every(
23:       (value) => Number.isSafeInteger(value) && value >= 0,
24:     ) ||
25:     !Number.isSafeInteger(balance) ||
26:     subtotal < 1 ||
27:     subtotal > 1_000_000_000
28:   ) {
29:     throw new BadRequestException('Invalid checkout amount');
30:   }
31:   const appliedVoucher = Math.min(subtotal, voucherDiscount);
32:   const maxRedeemablePoints = Math.min(
33:     Math.max(0, balance),
34:     Math.floor((subtotal - appliedVoucher) / 100),
35:   );
36:   if (points > maxRedeemablePoints)
37:     throw new BadRequestException(
38:       `Maximum redeemable points: ${maxRedeemablePoints}`,
39:     );
40:   const tax = Math.round((subtotal * 11) / 100);
41:   const serviceFee = Math.round((subtotal * 5) / 100);
42:   const pointsDiscount = points * 100;
43:   const discount = appliedVoucher + pointsDiscount;
44:   return {
45:     subtotal,
46:     tax,
47:     serviceFee,
48:     voucherDiscount: appliedVoucher,
49:     pointsDiscount,
50:     discount,
51:     loyaltyPointsUsed: points,
52:     maxRedeemablePoints,
53:     total: subtotal + tax + serviceFee - discount,
54:   };
55: }
```

### apps/api/src/modules/ordering/application/services/ordering.service.ts

```text
179:       };
180:     });
181: 
182:     const subtotal = new Order(
183:       OrderStatus.PENDING,
184:       orderItems,
185:     ).calculateTotal();
186:     const { tax, serviceFee, total } = calculateCheckout(subtotal);
187:     const orderNumber = this.createOrderNumber();
188:     const orderData = {
189:       expectedTotal: data.expectedTotal,
190:       orderNumber,
191:       ...(data.userId ? { userId: data.userId } : {}),
192:       branchId: data.branchId,
193:       ...(data.tableId ? { tableId: data.tableId } : {}),
194:       type,
195:       subtotal,
196:       tax,
197:       serviceFee,
198:       total,
199:       ...(data.voucherCode?.trim()
200:         ? { voucherCode: data.voucherCode.trim().toUpperCase() }
201:         : {}),
202:       ...(data.loyaltyPointsUsed
203:         ? { loyaltyPointsUsed: data.loyaltyPointsUsed }
204:         : {}),
205:       ...(data.notes?.trim() ? { notes: data.notes.trim() } : {}),
206:       idempotencyKeyHash,
207:       requestFingerprint,
208:     };
209: 
210:     if (quoteOnly) return this.orderingRepo.quoteOrder(orderData);
211: 
212:     try {
213:       const order = await this.orderingRepo.createOrder(orderData, orderItems, {
214:         ...(data.userId ? { userId: data.userId } : {}),
215:         branchId: data.branchId,
216:         total,
217:         itemCount: normalizedItems.length,
218:         type,
219:       });
220:       this.eventsGateway.broadcastOrderCreated(order);
221:       return order;
222:     } catch (error) {
223:       if (this.isDuplicateIdempotencyError(error)) {
224:         const racedOrder =
225:           await this.orderingRepo.findByIdempotencyKeyHash(idempotencyKeyHash);
226:         if (racedOrder) {
227:           return this.replayIdempotentOrder(racedOrder, requestFingerprint);
228:         }
229:       }
230:       throw error;
231:     }
232:   }
233: 
234:   async getOrder(id: string) {
235:     return this.orderingRepo.getOrder(id);
236:   }
237: 
238:   async listOrders(params: {
```

### apps/api/src/modules/ordering/infrastructure/repositories/prisma-ordering.repository.ts

```text
104:             code: 'PRICE_CHANGED',
105:             message:
106:               'Checkout total changed; refresh the quote before ordering',
107:             details: { total: quote.total },
108:           });
109:         }
110:         const order = await tx.order.create({
111:           data: {
112:             ...persistedData,
113:             tax: quote.tax,
114:             serviceFee: quote.serviceFee,
115:             discount: quote.discount,
116:             total: quote.total,
117:             loyaltyPointsUsed: quote.loyaltyPointsUsed,
118:             items: {
119:               create: orderItems.map((item) => ({
120:                 ...item,
121:                 customizations: item.customizations ?? Prisma.JsonNull,
122:               })),
123:             },
124:           },
125:           include: orderDetailsInclude,
126:         });
127: 
128:         if (quote.loyaltyPointsUsed > 0) {
129:           if (!data.userId) {
130:             throw new BadRequestException(
131:               'Guest orders cannot redeem loyalty points',
132:             );
133:           }
134:           const deducted = await tx.user.updateMany({
135:             where: {
136:               id: data.userId,
137:               deletedAt: null,
138:               loyaltyPoints: { gte: quote.loyaltyPointsUsed },
139:             },
```

### apps/api/test/checkout.e2e-spec.ts

```text
28:   let repository: PrismaOrderingRepository;
29: 
30:   beforeAll(async () => {
31:     const url = process.env.DATABASE_URL;
32:     if (!url || new URL(url).pathname !== '/warkop_audit')
33:       throw new Error(
34:         'Checkout integration tests require the isolated warkop_audit database',
35:       );
36:     admin = new PrismaClient();
37:     database = new DatabaseService();
38:     await database.onModuleInit();
39:     repository = new PrismaOrderingRepository(database);
40:     await admin.branch.create({
41:       data: {
```

### apps/api/test/jest-e2e.json

```text
1: {
2:   "moduleFileExtensions": ["js", "json", "ts"],
3:   "rootDir": ".",
4:   "testEnvironment": "node",
5:   "testRegex": ".e2e-spec.ts$",
6:   "transform": {
7:     "^.+\\.(t|j)s$": "ts-jest"
8:   }
9: }
```

### apps/api/test/jest-checkout.json

```text
1: {
2:   "moduleFileExtensions": ["js", "json", "ts"],
3:   "rootDir": "..",
4:   "testEnvironment": "node",
5:   "testRegex": "checkout\\.e2e-spec\\.ts$",
6:   "transform": { "^.+\\.(t|j)s$": "ts-jest" },
7:   "maxWorkers": 1,
8:   "testTimeout": 30000
9: }
```

### apps/api/package.json

```text
1: {
2:   "name": "@warkop-yareh/api",
3:   "version": "0.0.1",
4:   "description": "",
5:   "author": "",
6:   "private": true,
7:   "license": "UNLICENSED",
8:   "scripts": {
9:     "dev": "nest start --watch",
10:     "build": "nest build",
11:     "format": "prettier --write \"src/**/*.ts\" \"test/**/*.ts\"",
12:     "start": "nest start",
13:     "start:dev": "nest start --watch",
14:     "start:debug": "nest start --debug --watch",
15:     "start:prod": "node dist/main",
16:     "typecheck": "tsc --noEmit",
17:     "lint": "eslint \"{src,apps,libs,test}/**/*.ts\"",
18:     "lint:fix": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix",
19:     "test": "jest",
20:     "test:watch": "jest --watch",
21:     "test:cov": "jest --coverage",
22:     "test:debug": "node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand",
23:     "test:e2e": "jest --config ./test/jest-e2e.json"
24:   },
25:   "dependencies": {
26:     "@nestjs/bullmq": "^11.0.5",
27:     "@nestjs/common": "^11.2.3",
28:     "@nestjs/config": "^4.0.4",
29:     "@nestjs/core": "^11.2.3",
30:     "@nestjs/jwt": "^11.0.2",
31:     "@nestjs/passport": "^11.0.5",
32:     "@nestjs/platform-express": "^11.2.3",
33:     "@nestjs/platform-socket.io": "^11.2.3",
34:     "@nestjs/swagger": "^11.4.7",
35:     "@nestjs/throttler": "^6.5.0",
36:     "@nestjs/websockets": "^11.2.3",
37:     "@warkop-yareh/database": "workspace:*",
38:     "@warkop-yareh/types": "workspace:^",
39:     "bcrypt": "^6.0.0",
40:     "bullmq": "^5.81.4",
41:     "class-transformer": "^0.5.1",
42:     "class-validator": "^0.15.1",
43:     "cookie-parser": "^1.4.7",
44:     "helmet": "^8.3.0",
45:     "ioredis": "^5.11.1",
46:     "midtrans-client": "^1.4.3",
47:     "passport": "^0.7.0",
48:     "passport-google-oauth20": "^2.0.0",
49:     "passport-jwt": "^4.0.1",
50:     "reflect-metadata": "^0.2.2",
51:     "rxjs": "^7.8.2",
52:     "socket.io": "^4.8.3"
53:   },
54:   "devDependencies": {
55:     "@eslint/eslintrc": "^3.3.7",
56:     "@eslint/js": "^9.39.5",
57:     "@nestjs/cli": "^11.0.24",
58:     "@nestjs/schematics": "^11.1.0",
59:     "@nestjs/testing": "^11.2.3",
60:     "@types/bcrypt": "^5.0.2",
61:     "@types/cookie-parser": "^1.4.10",
62:     "@types/express": "^5.0.6",
63:     "@types/jest": "^30.0.0",
64:     "@types/midtrans-client": "^1.4.0",
65:     "@types/node": "^24.13.3",
66:     "@types/passport-google-oauth20": "^2.0.17",
67:     "@types/passport-jwt": "^4.0.1",
68:     "@types/supertest": "^7.2.1",
69:     "eslint": "^9.39.5",
70:     "eslint-config-prettier": "^10.1.8",
71:     "eslint-plugin-prettier": "^5.5.6",
72:     "globals": "^17.12.0",
73:     "jest": "^30.5.1",
74:     "prettier": "^3.9.6",
75:     "source-map-support": "^0.5.21",
76:     "supertest": "^7.2.2",
77:     "ts-jest": "^29.4.12",
78:     "ts-loader": "^9.6.2",
79:     "ts-node": "^10.9.2",
80:     "tsconfig-paths": "^4.2.0",
81:     "typescript": "^5.9.3",
82:     "typescript-eslint": "^8.69.0"
83:   },
84:   "jest": {
85:     "moduleFileExtensions": [
86:       "js",
87:       "json",
88:       "ts"
89:     ],
90:     "rootDir": "src",
91:     "testRegex": ".*\\.spec\\.ts$",
92:     "transform": {
93:       "^.+\\.(t|j)s$": "ts-jest"
94:     },
95:     "collectCoverageFrom": [
96:       "**/*.(t|j)s"
97:     ],
98:     "coverageDirectory": "../coverage",
99:     "testEnvironment": "node"
100:   }
101: }
```

### .github/workflows/ci.yml

```text
1: name: CI
2: 
3: on:
4:   pull_request:
5:     branches: [main]
6:   push:
7:     branches: [main]
8: 
9: jobs:
10:   ci:
11:     runs-on: ubuntu-latest
12:     timeout-minutes: 15
13: 
14:     steps:
15:       - name: Checkout
16:         uses: actions/checkout@v4
17: 
18:       - name: Setup pnpm
19:         uses: pnpm/action-setup@v4
20:         with:
21:           version: 9.0.0
22: 
23:       - name: Setup Node
24:         uses: actions/setup-node@v4
25:         with:
26:           node-version: 24
27:           cache: 'pnpm'
28: 
29:       - name: Install dependencies
30:         run: pnpm install --frozen-lockfile
31: 
32:       # Prisma output is intentionally gitignored and must be generated for
33:       # the runner platform before typechecking or building.
34:       - name: Generate Prisma Client
35:         run: pnpm --filter @warkop-yareh/database run db:generate
36: 
37:       - name: Typecheck
38:         run: pnpm turbo run typecheck
39: 
40:       - name: Lint
41:         run: pnpm turbo run lint
42: 
43:       - name: Build
44:         run: pnpm turbo run build
45: 
46:       - name: Test
47:         run: pnpm turbo run test
48:         env:
49:           # Dummy values only — no real DB/Redis container here because every
50:           # spec Claude inspected mocks PrismaService directly. If a real
51:           # integration/e2e suite against a live Postgres gets added later,
52:           # add a `services: postgres:` block then — not before (YAGNI).
53:           DATABASE_URL: postgresql://ci:ci@localhost:5432/ci_placeholder
54:           JWT_SECRET: ci-placeholder-secret-not-for-real-use-min-32-chars
55:           JWT_REFRESH_SECRET: ci-placeholder-refresh-secret-not-for-real-use
56:           MIDTRANS_SERVER_KEY: ci-placeholder-midtrans-key
57:           NODE_ENV: test
```

### turbo.json

```text
1: {
2:   "$schema": "https://turbo.build/schema.json",
3:   "tasks": {
4:     "build": {
5:       "dependsOn": ["^build"],
6:       "outputs": [".next/**", "!.next/cache/**", "dist/**"]
7:     },
8:     "lint": {
9:       "dependsOn": ["^lint"]
10:     },
11:     "@warkop-yareh/ui#build": {
12:       "outputs": []
13:     },
14:     "typecheck": {
15:       "dependsOn": ["^typecheck"]
16:     },
17:     "dev": {
18:       "cache": false,
19:       "persistent": true
20:     },
21:     "test": {
22:       "dependsOn": ["^build"],
23:       "outputs": [],
24:       "passThroughEnv": [
25:         "DATABASE_URL",
26:         "JWT_SECRET",
27:         "JWT_REFRESH_SECRET",
28:         "MIDTRANS_SERVER_KEY",
29:         "NODE_ENV"
30:       ]
31:     }
32:   }
33: }
```

## Raw command: pnpm install --frozen-lockfile

```text
Scope: all 7 workspace projects
(node:17736) [DEP0169] DeprecationWarning: `url.parse()` behavior is not standardized and prone to errors that have security implications. Use the WHATWG URL API instead. CVEs are not issued for `url.parse()` vulnerabilities.
(Use `node --trace-deprecation ...` to show where the warning was created)
Lockfile is up to date, resolution step is skipped
Already up to date

devDependencies:
+ @axe-core/playwright 4.13.0
+ @eslint/eslintrc 3.3.7
+ playwright 1.62.1
+ prettier 3.9.6
+ turbo 2.10.12

Done in 2.1s
EXIT_CODE=0

```

## Raw command: pnpm turbo run typecheck

```text
• turbo 2.10.12

   • Packages in scope: @warkop-yareh/admin, @warkop-yareh/api, @warkop-yareh/database, @warkop-yareh/types, @warkop-yareh/ui, @warkop-yareh/web
   • Running typecheck in 6 packages
   • Remote caching disabled, using shared worktree cache

@warkop-yareh/ui:typecheck: cache bypass, force executing 27305d4eca47f53b
@warkop-yareh/api:typecheck: cache bypass, force executing 6ddb7fd0f6c02cb5
@warkop-yareh/ui:typecheck: 
@warkop-yareh/ui:typecheck: > @warkop-yareh/ui@0.1.0 typecheck D:\MY CODE\ANTIGRAVITY\01-production\warkop-yareh-phase6\packages\ui
@warkop-yareh/ui:typecheck: > tsc --noEmit
@warkop-yareh/ui:typecheck: 
@warkop-yareh/api:typecheck: 
@warkop-yareh/api:typecheck: > @warkop-yareh/api@0.0.1 typecheck D:\MY CODE\ANTIGRAVITY\01-production\warkop-yareh-phase6\apps\api
@warkop-yareh/api:typecheck: > tsc --noEmit
@warkop-yareh/api:typecheck: 
@warkop-yareh/admin:typecheck: cache bypass, force executing 3c64d0c2b9c727ae
@warkop-yareh/web:typecheck: cache bypass, force executing 5c5fe146dfa35c06
@warkop-yareh/admin:typecheck: 
@warkop-yareh/admin:typecheck: > @warkop-yareh/admin@0.1.0 typecheck D:\MY CODE\ANTIGRAVITY\01-production\warkop-yareh-phase6\apps\admin
@warkop-yareh/admin:typecheck: > tsc --noEmit
@warkop-yareh/admin:typecheck: 
@warkop-yareh/web:typecheck: 
@warkop-yareh/web:typecheck: > @warkop-yareh/web@0.1.0 typecheck D:\MY CODE\ANTIGRAVITY\01-production\warkop-yareh-phase6\apps\web
@warkop-yareh/web:typecheck: > tsc --noEmit
@warkop-yareh/web:typecheck: 

 Tasks:    4 successful, 4 total
Cached:    0 cached, 4 total
  Time:    34.199s 

EXIT_CODE=0

```

## Raw command: pnpm turbo run lint

```text
• turbo 2.10.12

   • Packages in scope: @warkop-yareh/admin, @warkop-yareh/api, @warkop-yareh/database, @warkop-yareh/types, @warkop-yareh/ui, @warkop-yareh/web
   • Running lint in 6 packages
   • Remote caching disabled, using shared worktree cache

@warkop-yareh/admin:lint: cache bypass, force executing c1dd0aadb1585930
@warkop-yareh/api:lint: cache bypass, force executing 3f55d9cebd61c0ec
@warkop-yareh/web:lint: cache bypass, force executing 103570c761e5f5cb
@warkop-yareh/admin:lint: 
@warkop-yareh/admin:lint: > @warkop-yareh/admin@0.1.0 lint D:\MY CODE\ANTIGRAVITY\01-production\warkop-yareh-phase6\apps\admin
@warkop-yareh/admin:lint: > eslint
@warkop-yareh/admin:lint: 
@warkop-yareh/api:lint: 
@warkop-yareh/api:lint: > @warkop-yareh/api@0.0.1 lint D:\MY CODE\ANTIGRAVITY\01-production\warkop-yareh-phase6\apps\api
@warkop-yareh/api:lint: > eslint "{src,apps,libs,test}/**/*.ts"
@warkop-yareh/api:lint: 
@warkop-yareh/web:lint: 
@warkop-yareh/web:lint: > @warkop-yareh/web@0.1.0 lint D:\MY CODE\ANTIGRAVITY\01-production\warkop-yareh-phase6\apps\web
@warkop-yareh/web:lint: > eslint
@warkop-yareh/web:lint: 

 Tasks:    3 successful, 3 total
Cached:    0 cached, 3 total
  Time:    1m1.426s 

EXIT_CODE=0

```

## Raw command: pnpm turbo run test

```text
• turbo 2.10.12

   • Packages in scope: @warkop-yareh/admin, @warkop-yareh/api, @warkop-yareh/database, @warkop-yareh/types, @warkop-yareh/ui, @warkop-yareh/web
   • Running test in 6 packages
   • Remote caching disabled, using shared worktree cache

@warkop-yareh/ui:build: cache bypass, force executing 002979f03f30d306
@warkop-yareh/api:test: cache bypass, force executing 01c032aa9fe0140c
@warkop-yareh/ui:build: 
@warkop-yareh/ui:build: > @warkop-yareh/ui@0.1.0 build D:\MY CODE\ANTIGRAVITY\01-production\warkop-yareh-phase6\packages\ui
@warkop-yareh/ui:build: > tsc
@warkop-yareh/ui:build: 
@warkop-yareh/api:test: 
@warkop-yareh/api:test: > @warkop-yareh/api@0.0.1 test D:\MY CODE\ANTIGRAVITY\01-production\warkop-yareh-phase6\apps\api
@warkop-yareh/api:test: > jest
@warkop-yareh/api:test: 
@warkop-yareh/admin:test: cache bypass, force executing bc1d913304d13b1e
@warkop-yareh/web:test: cache bypass, force executing b451f30114518262
@warkop-yareh/api:test: PASS src/modules/catalog/application/services/catalog.service.spec.ts
@warkop-yareh/admin:test: 
@warkop-yareh/admin:test: > @warkop-yareh/admin@0.1.0 test D:\MY CODE\ANTIGRAVITY\01-production\warkop-yareh-phase6\apps\admin
@warkop-yareh/admin:test: > vitest run
@warkop-yareh/admin:test: 
@warkop-yareh/web:test: 
@warkop-yareh/web:test: > @warkop-yareh/web@0.1.0 test D:\MY CODE\ANTIGRAVITY\01-production\warkop-yareh-phase6\apps\web
@warkop-yareh/web:test: > vitest run
@warkop-yareh/web:test: 
@warkop-yareh/api:test: PASS src/modules/websockets/events.gateway.spec.ts
@warkop-yareh/admin:test: 
@warkop-yareh/admin:test:  RUN  v4.1.11 D:/MY CODE/ANTIGRAVITY/01-production/warkop-yareh-phase6/apps/admin
@warkop-yareh/admin:test: 
@warkop-yareh/api:test: PASS src/modules/tables/application/services/table.service.spec.ts
@warkop-yareh/web:test: 
@warkop-yareh/web:test:  RUN  v4.1.11 D:/MY CODE/ANTIGRAVITY/01-production/warkop-yareh-phase6/apps/web
@warkop-yareh/web:test: 
@warkop-yareh/api:test: [Nest] 23284  - 09/09/2026, 14.07.32    WARN [MarketingService] Campaign campaign-1 was delivered to user customer-1, but the in-app notification failed: notification storage unavailable
@warkop-yareh/api:test: PASS src/modules/marketing/application/services/marketing.service.spec.ts
@warkop-yareh/api:test: PASS src/infrastructure/payment/payment.service.spec.ts (5.604 s)
@warkop-yareh/api:test: PASS src/modules/ordering/application/services/ordering.service.spec.ts (6.239 s)
@warkop-yareh/web:test:  ✓ src/features/orders/payment-navigation.test.ts (7 tests) 139ms
@warkop-yareh/admin:test:  ✓ src/lib/operations-api.test.ts (4 tests) 236ms
@warkop-yareh/web:test:  ✓ src/stores/auth.store.test.ts (4 tests) 210ms
@warkop-yareh/web:test:  ✓ src/lib/client-checkout-estimate.test.ts (3 tests) 234ms
@warkop-yareh/admin:test: 
@warkop-yareh/admin:test:  Test Files  1 passed (1)
@warkop-yareh/admin:test:       Tests  4 passed (4)
@warkop-yareh/admin:test:    Start at  14:07:31
@warkop-yareh/admin:test:    Duration  5.69s (transform 1.49s, setup 572ms, import 1.49s, tests 236ms, environment 2.48s)
@warkop-yareh/admin:test: 
@warkop-yareh/api:test: PASS src/modules/loyalty/application/services/loyalty.service.spec.ts
@warkop-yareh/web:test:  ✓ src/stores/persist-storage.test.ts (3 tests) 165ms
@warkop-yareh/api:test: PASS src/modules/reservation/application/services/reservation.service.spec.ts
@warkop-yareh/web:test:  ✓ src/lib/api.test.ts (3 tests) 188ms
@warkop-yareh/web:test: 
@warkop-yareh/web:test:  Test Files  5 passed (5)
@warkop-yareh/web:test:       Tests  20 passed (20)
@warkop-yareh/web:test:    Start at  14:07:31
@warkop-yareh/web:test:    Duration  8.71s (transform 8.67s, setup 3.87s, import 11.70s, tests 935ms, environment 12.25s)
@warkop-yareh/web:test: 
@warkop-yareh/api:test: PASS src/modules/event/application/services/event.service.spec.ts
@warkop-yareh/api:test: PASS src/modules/identity/presentation/controllers/users.controller.spec.ts (14.354 s)
@warkop-yareh/api:test: PASS src/modules/catalog/presentation/controllers/catalog.controller.spec.ts (14.588 s)
@warkop-yareh/api:test: PASS src/modules/identity/presentation/controllers/auth.controller.spec.ts (16.951 s)
@warkop-yareh/api:test: PASS src/modules/event/presentation/controllers/event.controller.spec.ts (17.901 s)
@warkop-yareh/api:test: PASS src/modules/ordering/presentation/controllers/orders.controller.spec.ts (20.502 s)
@warkop-yareh/api:test: PASS src/modules/franchise/presentation/controllers/franchise.controller.spec.ts (18.922 s)
@warkop-yareh/api:test: PASS src/modules/community/presentation/controllers/community.controller.spec.ts (18.633 s)
@warkop-yareh/api:test: PASS src/modules/branch/presentation/controllers/branch.controller.spec.ts (8.634 s)
@warkop-yareh/api:test: PASS src/modules/reservation/presentation/controllers/reservations.controller.spec.ts (17.755 s)
@warkop-yareh/api:test: PASS src/infrastructure/payment/payment.controller.spec.ts (12.483 s)
@warkop-yareh/api:test: PASS src/modules/community/application/services/community.service.spec.ts
@warkop-yareh/api:test: PASS src/modules/ai/ai.service.spec.ts (9.258 s)
@warkop-yareh/api:test: PASS src/modules/branch/application/services/branch.service.spec.ts
@warkop-yareh/api:test: PASS src/modules/content/application/services/content.service.spec.ts
@warkop-yareh/api:test: PASS src/modules/health/health.controller.spec.ts
@warkop-yareh/api:test: PASS src/modules/tables/presentation/controllers/table.controller.spec.ts (9.252 s)
@warkop-yareh/api:test: PASS src/modules/identity/application/services/identity.service.spec.ts
@warkop-yareh/api:test: PASS src/modules/operations/application/services/shift.service.spec.ts
@warkop-yareh/api:test: PASS src/config/environment.validation.spec.ts
@warkop-yareh/api:test: PASS src/infrastructure/payment/cash-payment.controller.spec.ts (6.928 s)
@warkop-yareh/api:test: PASS src/modules/analytics/application/services/analytics.service.spec.ts
@warkop-yareh/api:test: PASS src/modules/franchise/application/services/franchise.service.spec.ts
@warkop-yareh/api:test: PASS src/common/guards/roles.guard.spec.ts
@warkop-yareh/api:test: PASS src/modules/marketing/application/processors/marketing-dispatch.processor.spec.ts
@warkop-yareh/api:test: PASS src/modules/ordering/domain/checkout-pricing.spec.ts
@warkop-yareh/api:test: PASS src/modules/marketing/infrastructure/whatsapp-cloud.service.spec.ts
@warkop-yareh/api:test: PASS src/infrastructure/auth/ws-jwt.guard.spec.ts
@warkop-yareh/api:test: [Nest] 12608  - 09/09/2026, 14.07.52    WARN [WsJwtGuard] WsJwtGuard rejected a message: Missing authenticated socket session
@warkop-yareh/api:test: [Nest] 12608  - 09/09/2026, 14.07.52    WARN [WsJwtGuard] WsJwtGuard rejected a message: Socket session expired
@warkop-yareh/api:test: PASS src/modules/identity/application/services/auth.service.spec.ts (24.631 s)
@warkop-yareh/api:test: 
@warkop-yareh/api:test: Test Suites: 37 passed, 37 total
@warkop-yareh/api:test: Tests:       237 passed, 237 total
@warkop-yareh/api:test: Snapshots:   0 total
@warkop-yareh/api:test: Time:        25.869 s
@warkop-yareh/api:test: Ran all test suites.

 Tasks:    4 successful, 4 total
Cached:    0 cached, 4 total
  Time:    27.607s 

EXIT_CODE=0

```

## Raw command: pnpm turbo run build

```text
• turbo 2.10.12

   • Packages in scope: @warkop-yareh/admin, @warkop-yareh/api, @warkop-yareh/database, @warkop-yareh/types, @warkop-yareh/ui, @warkop-yareh/web
   • Running build in 6 packages
   • Remote caching disabled, using shared worktree cache

@warkop-yareh/ui:build: cache bypass, force executing 002979f03f30d306
@warkop-yareh/api:build: cache bypass, force executing 217b62f8f48f5e94
@warkop-yareh/ui:build: 
@warkop-yareh/ui:build: > @warkop-yareh/ui@0.1.0 build D:\MY CODE\ANTIGRAVITY\01-production\warkop-yareh-phase6\packages\ui
@warkop-yareh/ui:build: > tsc
@warkop-yareh/ui:build: 
@warkop-yareh/api:build: 
@warkop-yareh/api:build: > @warkop-yareh/api@0.0.1 build D:\MY CODE\ANTIGRAVITY\01-production\warkop-yareh-phase6\apps\api
@warkop-yareh/api:build: > nest build
@warkop-yareh/api:build: 
@warkop-yareh/web:build: cache bypass, force executing 80b42429e5e51f6d
@warkop-yareh/admin:build: cache bypass, force executing a8c5e45c65900944
@warkop-yareh/web:build: 
@warkop-yareh/web:build: > @warkop-yareh/web@0.1.0 build D:\MY CODE\ANTIGRAVITY\01-production\warkop-yareh-phase6\apps\web
@warkop-yareh/web:build: > next build
@warkop-yareh/web:build: 
@warkop-yareh/admin:build: 
@warkop-yareh/admin:build: > @warkop-yareh/admin@0.1.0 build D:\MY CODE\ANTIGRAVITY\01-production\warkop-yareh-phase6\apps\admin
@warkop-yareh/admin:build: > next build
@warkop-yareh/admin:build: 
@warkop-yareh/admin:build: ▲ Next.js 16.3.4 (Turbopack)
@warkop-yareh/web:build: ▲ Next.js 16.3.4 (Turbopack)
@warkop-yareh/web:build: ✓ Running next.config.mjs took 44ms
@warkop-yareh/admin:build: ✓ Running next.config.ts took 187ms
@warkop-yareh/web:build: 
@warkop-yareh/admin:build: 
@warkop-yareh/web:build:   Creating an optimized production build ...
@warkop-yareh/admin:build:   Creating an optimized production build ...
@warkop-yareh/admin:build: ✓ Compiled successfully in 1366ms
@warkop-yareh/admin:build:   Running TypeScript ...
@warkop-yareh/web:build: ✓ Compiled successfully in 1471ms
@warkop-yareh/web:build:   Running TypeScript ...
@warkop-yareh/admin:build:   Finished TypeScript in 3.1s ...
@warkop-yareh/admin:build:   Collecting page data using 11 workers ...
@warkop-yareh/web:build:   Finished TypeScript in 3.5s ...
@warkop-yareh/web:build:   Collecting page data using 11 workers ...
@warkop-yareh/admin:build:   Generating static pages using 11 workers (0/23) ...
@warkop-yareh/web:build:   Generating static pages using 11 workers (0/30) ...
@warkop-yareh/admin:build:   Generating static pages using 11 workers (5/23) 
@warkop-yareh/admin:build:   Generating static pages using 11 workers (11/23) 
@warkop-yareh/admin:build:   Generating static pages using 11 workers (17/23) 
@warkop-yareh/web:build:   Generating static pages using 11 workers (7/30) 
@warkop-yareh/admin:build: ✓ Generating static pages using 11 workers (23/23) in 1124ms
@warkop-yareh/admin:build:   Finalizing page optimization ...
@warkop-yareh/web:build:   Generating static pages using 11 workers (14/30) 
@warkop-yareh/admin:build: 
@warkop-yareh/admin:build: Route (app)
@warkop-yareh/admin:build: ┌ ○ /
@warkop-yareh/admin:build: ├ ○ /_not-found
@warkop-yareh/admin:build: ├ ○ /analytics
@warkop-yareh/admin:build: ├ ○ /branches
@warkop-yareh/admin:build: ├ ○ /community
@warkop-yareh/admin:build: ├ ○ /crm
@warkop-yareh/admin:build: ├ ○ /events
@warkop-yareh/admin:build: ├ ƒ /events/[id]
@warkop-yareh/admin:build: ├ ○ /inventory
@warkop-yareh/admin:build: ├ ○ /kitchen
@warkop-yareh/admin:build: ├ ○ /login
@warkop-yareh/admin:build: ├ ○ /loyalty
@warkop-yareh/admin:build: ├ ○ /marketing
@warkop-yareh/admin:build: ├ ○ /orders
@warkop-yareh/admin:build: ├ ○ /pos
@warkop-yareh/admin:build: ├ ○ /pos/shifts
@warkop-yareh/admin:build: ├ ○ /products
@warkop-yareh/admin:build: ├ ○ /reservations
@warkop-yareh/admin:build: ├ ○ /settings
@warkop-yareh/admin:build: ├ ○ /shifts
@warkop-yareh/admin:build: ├ ○ /tables
@warkop-yareh/admin:build: └ ○ /users
@warkop-yareh/admin:build: 
@warkop-yareh/admin:build: 
@warkop-yareh/admin:build: ○  (Static)   prerendered as static content
@warkop-yareh/admin:build: ƒ  (Dynamic)  server-rendered on demand
@warkop-yareh/admin:build: 
@warkop-yareh/web:build:   Generating static pages using 11 workers (22/30) 
@warkop-yareh/web:build: ✓ Generating static pages using 11 workers (30/30) in 905ms
@warkop-yareh/web:build:   Finalizing page optimization ...
@warkop-yareh/web:build: 
@warkop-yareh/web:build: Route (app)
@warkop-yareh/web:build: ┌ ○ /
@warkop-yareh/web:build: ├ ○ /_not-found
@warkop-yareh/web:build: ├ ○ /about
@warkop-yareh/web:build: ├ ○ /account
@warkop-yareh/web:build: ├ ○ /auth
@warkop-yareh/web:build: ├ ○ /blog
@warkop-yareh/web:build: ├ ƒ /blog/[slug]
@warkop-yareh/web:build: ├ ○ /booking
@warkop-yareh/web:build: ├ ○ /cart
@warkop-yareh/web:build: ├ ○ /checkout
@warkop-yareh/web:build: ├ ƒ /checkout/status
@warkop-yareh/web:build: ├ ƒ /checkout/success
@warkop-yareh/web:build: ├ ○ /community
@warkop-yareh/web:build: ├ ƒ /community/groups/[id]
@warkop-yareh/web:build: ├ ○ /contact
@warkop-yareh/web:build: ├ ○ /events
@warkop-yareh/web:build: ├ ƒ /events/[id]
@warkop-yareh/web:build: ├ ○ /login
@warkop-yareh/web:build: ├ ○ /loyalty
@warkop-yareh/web:build: ├ ○ /menu
@warkop-yareh/web:build: ├ ○ /ops/kds
@warkop-yareh/web:build: ├ ○ /ops/pos
@warkop-yareh/web:build: ├ ○ /ops/shift
@warkop-yareh/web:build: ├ ƒ /order/track/[orderId]
@warkop-yareh/web:build: ├ ○ /orders
@warkop-yareh/web:build: ├ ƒ /orders/[id]
@warkop-yareh/web:build: ├ ƒ /orders/[id]/thankyou
@warkop-yareh/web:build: ├ ○ /otp
@warkop-yareh/web:build: ├ ƒ /payment/status
@warkop-yareh/web:build: ├ ○ /profile
@warkop-yareh/web:build: ├ ƒ /qr/[code]
@warkop-yareh/web:build: ├ ○ /register
@warkop-yareh/web:build: ├ ○ /reservations
@warkop-yareh/web:build: ├ ○ /robots.txt
@warkop-yareh/web:build: ├ ○ /sitemap.xml
@warkop-yareh/web:build: └ ƒ /table/[tableId]
@warkop-yareh/web:build: 
@warkop-yareh/web:build: 
@warkop-yareh/web:build: ○  (Static)   prerendered as static content
@warkop-yareh/web:build: ƒ  (Dynamic)  server-rendered on demand
@warkop-yareh/web:build: 

 Tasks:    4 successful, 4 total
Cached:    0 cached, 4 total
  Time:    14.72s 

EXIT_CODE=0

```

STATUS - verified-done for source inventory and the four local baseline gates only. Integration, browser runtime, CI and staging are not verified by this baseline.
