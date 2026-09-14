function requireEnvironmentVariable(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required`);
  return value;
}

async function run() {
  const baseUrl = 'http://localhost:4000/api/v1';
  const adminEmail = requireEnvironmentVariable('PHASE1_ADMIN_EMAIL');
  const adminPassword = requireEnvironmentVariable('PHASE1_ADMIN_PASSWORD');

  console.log('====================================================');
  console.log("  WARKOP YA'REH — PHASE 1 E2E VERIFICATION SUITE");
  console.log('====================================================\n');

  // --- Step 1: Authenticate ---
  console.log('--- 1. Authenticating as Staff / Admin ---');
  const loginRes = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: adminEmail,
      password: adminPassword,
    }),
  });
  const loginJson = await loginRes.json();
  const token =
    loginJson.data?.tokens?.accessToken || loginJson.data?.accessToken;
  console.log('Login Status:', loginRes.status);
  console.log('User Role:', loginJson.data?.user?.role);
  console.log('Token Received:', token ? 'YES (Bearer JWT)' : 'NO');

  if (!token) {
    throw new Error('Failed to obtain auth token for test');
  }

  // --- Step 2: Catalog verification ---
  console.log('\n--- 2. Fetching Catalog from GET /catalog ---');
  const catRes = await fetch(`${baseUrl}/catalog`);
  const catJson = await catRes.json();
  const categories = catJson.data?.categories || [];
  const products = catJson.data?.products || [];
  console.log(`Categories found: ${categories.length}`);
  console.log(`Products found: ${products.length}`);
  const sampleProduct = products[0];
  console.log('Sample Product Selected:', {
    id: sampleProduct.id,
    name: sampleProduct.name,
    price: sampleProduct.price,
  });

  // --- Step 3: Create real order ---
  console.log('\n--- 3. Creating Real Order via POST /orders ---');
  const orderPayload = {
    branchId: 'coldnbrew-gubeng-001',
    type: 'DINE_IN',
    notes: 'Table 7 - Live Phase 1 Test Order',
    items: [
      {
        productId: sampleProduct.id,
        quantity: 2,
        notes: 'Less sugar, hot',
      },
    ],
  };

  const createRes = await fetch(`${baseUrl}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(orderPayload),
  });
  const createJson = await createRes.json();
  console.log('Order Creation Status:', createRes.status);
  const createdOrder = createJson.data;
  console.log('Created Order ID:', createdOrder?.id);
  console.log('Created Order Number:', createdOrder?.orderNumber);
  console.log('Computed Subtotal:', createdOrder?.subtotal);
  console.log('Computed Tax (PPN 11%):', createdOrder?.tax);
  console.log('Authoritative Total:', createdOrder?.total);

  const orderId = createdOrder?.id;
  const dbTotal = createdOrder?.total;

  // --- Step 4: Midtrans Snap Tamper Rejection ---
  console.log(
    '\n--- 4. Midtrans Snap Tampered Amount Rejection (Client sends grossAmount: 500) ---'
  );
  const tamperRes = await fetch(`${baseUrl}/payments/midtrans/snap`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      orderId: orderId,
      grossAmount: 500, // Tampered client amount!
    }),
  });
  const tamperJson = await tamperRes.json();
  console.log('Tamper Rejection HTTP Status:', tamperRes.status);
  console.log('Tamper Rejection Body:', JSON.stringify(tamperJson, null, 2));

  // --- Step 5: Midtrans Snap Missing Order Rejection ---
  console.log(
    '\n--- 5. Midtrans Snap Non-Existent Order (orderId: "non-existent-id-999") ---'
  );
  const missingRes = await fetch(`${baseUrl}/payments/midtrans/snap`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      orderId: 'non-existent-id-999',
    }),
  });
  const missingJson = await missingRes.json();
  console.log('Missing Order HTTP Status:', missingRes.status);
  console.log('Missing Order Body:', JSON.stringify(missingJson, null, 2));

  // --- Step 6: Midtrans Snap Server-Side Authoritative Total ---
  console.log(
    '\n--- 6. Midtrans Snap Authoritative Server Generation (grossAmount omitted) ---'
  );
  const validRes = await fetch(`${baseUrl}/payments/midtrans/snap`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      orderId: orderId,
      customerDetails: {
        firstName: 'Rizqi',
        email: 'rizqi@warkopyareh.com',
        phone: '+628123456789',
      },
    }),
  });
  const validJson = await validRes.json();
  console.log('Valid Snap Token HTTP Status:', validRes.status);
  console.log('Snap Token Generated:', Boolean(validJson.data?.token));
  console.log('Snap Redirect URL Generated:', Boolean(validJson.data?.redirect_url));
  console.log(
    'Authoritative Gross Amount in Snap:',
    validJson.data?.grossAmount
  );
  console.log(
    'Exact Match with DB Total:',
    validJson.data?.grossAmount === dbTotal ? 'YES' : 'NO'
  );

  // --- Step 7: Order visible in GET /orders ---
  console.log(
    '\n--- 7. Verifying Order in Admin / Cashier Order List (GET /orders) ---'
  );
  const listRes = await fetch(`${baseUrl}/orders`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const listJson = await listRes.json();
  interface OrderSummary {
    id: string;
    orderNumber?: string;
    status?: string;
    items?: unknown[];
    total?: number;
  }
  const listOrders: OrderSummary[] = Array.isArray(listJson.data)
    ? listJson.data.filter(
        (value: unknown): value is OrderSummary =>
          typeof value === 'object' &&
          value !== null &&
          typeof (value as { id?: unknown }).id === 'string'
      )
    : [];
  const foundOrder = listOrders.find((order) => order.id === orderId);
  console.log('Order Found in Admin List:', foundOrder ? 'YES' : 'NO');
  if (foundOrder) {
    console.log({
      id: foundOrder.id,
      orderNumber: foundOrder.orderNumber,
      status: foundOrder.status,
      itemsCount: foundOrder.items?.length,
      total: foundOrder.total,
    });
  }

  // --- Step 8: Status Transitions ---
  console.log(
    '\n--- 8. Testing Admin Order Lifecycle Status Transitions (PATCH /orders/:id/status) ---'
  );
  for (const nextStatus of ['CONFIRMED', 'PREPARING', 'READY', 'COMPLETED']) {
    const patchRes = await fetch(`${baseUrl}/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status: nextStatus }),
    });
    const patchJson = await patchRes.json();
    console.log(
      `Status Transition -> ${nextStatus}: HTTP ${patchRes.status} (Current: ${patchJson.data?.status})`
    );
  }

  console.log('\n====================================================');
  console.log('  ALL PHASE 1 RUNTIME VERIFICATIONS COMPLETED');
  console.log('====================================================\n');
}

void run().catch((error: unknown) => {
  console.error(
    'Phase 1 runtime verification failed:',
    error instanceof Error ? error.message : 'Unknown failure',
  );
  process.exitCode = 1;
});
