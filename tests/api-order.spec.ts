/**
 * API-level order flow tests
 * Tests the backend endpoints directly without a browser.
 *
 * Prerequisites:
 *  - Backend running at http://localhost:5000
 *  - MongoDB connected
 *  - Test users exist (buyer@test.com, seller@test.com)
 *    Run: npm run seed:users  (in /backend) to create them if needed
 */

import { test, expect } from '@playwright/test';
import { loginViaApi, authHeaders, TEST_BUYER, TEST_SELLER, API_URL } from './helpers/auth';

let buyerToken = '';
let sellerToken = '';
let createdOrderId = '';
let testProductId = '';

// ─── 1. Health & Prerequisites ───────────────────────────────────────────────

test.describe('1. API Health', () => {
  test('backend is reachable and DB is connected', async ({ request }) => {
    const res = await request.get(`${API_URL}/health`);
    expect(res.status(), 'Health endpoint should return 200').toBe(200);
    const body = await res.json();
    expect(body.status).toBe('OK');
    expect(body.database, 'MongoDB must be connected').toBe('connected');
  });
});

// ─── 2. Authentication ───────────────────────────────────────────────────────

test.describe('2. Authentication', () => {
  test('buyer can login and receives JWT', async ({ request }) => {
    buyerToken = await loginViaApi(request, TEST_BUYER);
    expect(buyerToken).toBeTruthy();
    expect(buyerToken.split('.')).toHaveLength(3); // valid JWT format
  });

  test('seller can login and receives JWT', async ({ request }) => {
    sellerToken = await loginViaApi(request, TEST_SELLER);
    expect(sellerToken).toBeTruthy();
  });

  test('GET /auth/me returns correct buyer profile', async ({ request }) => {
    if (!buyerToken) buyerToken = await loginViaApi(request, TEST_BUYER);
    const res = await request.get(`${API_URL}/auth/me`, {
      headers: authHeaders(buyerToken),
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.email).toBe(TEST_BUYER.email);
    expect(body.role).toBe('buyer');
  });

  test('GET /auth/me returns correct seller profile', async ({ request }) => {
    if (!sellerToken) sellerToken = await loginViaApi(request, TEST_SELLER);
    const res = await request.get(`${API_URL}/auth/me`, {
      headers: authHeaders(sellerToken),
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.email).toBe(TEST_SELLER.email);
    expect(body.role).toBe('seller');
  });

  test('rejects unauthenticated requests', async ({ request }) => {
    const res = await request.get(`${API_URL}/orders/my`);
    expect(res.status()).toBe(401);
  });

  test('rejects buyer accessing seller routes', async ({ request }) => {
    if (!buyerToken) buyerToken = await loginViaApi(request, TEST_BUYER);
    const res = await request.get(`${API_URL}/orders`, {
      headers: authHeaders(buyerToken),
    });
    expect(res.status()).toBe(403);
  });
});

// ─── 3. Products (public) ────────────────────────────────────────────────────

test.describe('3. Product Catalogue', () => {
  test('GET /public/products returns product list', async ({ request }) => {
    const res = await request.get(`${API_URL}/public/products`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
  });

  test('first active product can be fetched by ID', async ({ request }) => {
    const listRes = await request.get(`${API_URL}/public/products?limit=1`);
    const list = await listRes.json();

    if (!list.data || list.data.length === 0) {
      test.skip();
      return;
    }

    testProductId = list.data[0]._id;
    const res = await request.get(`${API_URL}/public/products/${testProductId}`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data._id).toBe(testProductId);
    expect(body.data.name).toBeTruthy();
    expect(body.data.price).toBeGreaterThan(0);
  });
});

// ─── 4. Cart ─────────────────────────────────────────────────────────────────

test.describe('4. Cart', () => {
  test('buyer can add a product to cart', async ({ request }) => {
    if (!buyerToken) buyerToken = await loginViaApi(request, TEST_BUYER);
    if (!testProductId) {
      const listRes = await request.get(`${API_URL}/public/products?limit=1`);
      const list = await listRes.json();
      if (!list.data?.length) { test.skip(); return; }
      testProductId = list.data[0]._id;
    }

    const res = await request.post(`${API_URL}/cart`, {
      headers: authHeaders(buyerToken),
      data: { productId: testProductId, quantity: 1 },
    });
    expect([200, 201]).toContain(res.status());
    const body = await res.json();
    expect(body.success).toBe(true);
  });

  test('buyer can view cart', async ({ request }) => {
    if (!buyerToken) buyerToken = await loginViaApi(request, TEST_BUYER);
    const res = await request.get(`${API_URL}/cart`, {
      headers: authHeaders(buyerToken),
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    // Cart returns { data: { items, cartCount, subtotal } }
    expect(Array.isArray(body.data.items)).toBe(true);
    expect(typeof body.data.cartCount).toBe('number');
    expect(typeof body.data.subtotal).toBe('number');
  });
});

// ─── 5. Order Placement ──────────────────────────────────────────────────────

test.describe('5. Order Placement (Buyer)', () => {
  // Ensure seller1 has an active, in-stock product before placing orders.
  // This guarantees that buyer1's order will land in seller1's queue.
  test.beforeAll(async ({ request }) => {
    sellerToken = await loginViaApi(request, TEST_SELLER);

    // Look for an existing active product owned by seller1
    const prodRes = await request.get(`${API_URL}/products?status=active&limit=5`, {
      headers: authHeaders(sellerToken),
    });
    const prodBody = await prodRes.json();
    const activeSeller1Product = (prodBody.data ?? []).find(
      (p: any) => p.status === 'active' && p.productStatus !== 'DISABLED' && p.stock > 0
    );

    if (activeSeller1Product) {
      testProductId = activeSeller1Product._id;
      console.log(`[setup] Using existing seller1 product: ${activeSeller1Product.name} (${testProductId})`);
      return;
    }

    // No active product found — create one for testing
    const createRes = await request.post(`${API_URL}/products`, {
      headers: authHeaders(sellerToken),
      data: {
        name: 'Playwright Test Product',
        description: 'Auto-created for E2E testing',
        category: 'Parts',
        brand: 'TestBrand',
        price: 500,
        stock: 50,
        status: 'active',
        productStatus: 'ENABLED',
        type: 'product',
      },
    });
    if (createRes.ok()) {
      const created = await createRes.json();
      testProductId = created.data._id;
      console.log(`[setup] Created seller1 test product: ${testProductId}`);
    } else {
      console.warn('[setup] Could not create test product — seller confirm tests may skip');
    }
  });

  test('buyer can place an order for a product', async ({ request }) => {
    if (!buyerToken) buyerToken = await loginViaApi(request, TEST_BUYER);
    if (!testProductId) {
      const listRes = await request.get(`${API_URL}/public/products?limit=1`);
      const list = await listRes.json();
      if (!list.data?.length) { test.skip(); return; }
      testProductId = list.data[0]._id;
    }

    const res = await request.post(`${API_URL}/orders`, {
      headers: authHeaders(buyerToken),
      data: {
        productId: testProductId,
        qty: 1,
        shippingAddress: '123 Test Street, Colombo 03',
        paymentMethod: 'Cash on Delivery',
        notes: 'Playwright test order',
      },
    });

    expect(res.status(), 'Order creation should return 201').toBe(201);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data._id).toBeTruthy();
    expect(body.data.status).toBe('awaiting_seller_confirmation');

    createdOrderId = body.data._id;
  });

  test('new order appears in buyer order list', async ({ request }) => {
    if (!buyerToken) buyerToken = await loginViaApi(request, TEST_BUYER);
    const res = await request.get(`${API_URL}/orders/my`, {
      headers: authHeaders(buyerToken),
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeGreaterThan(0);

    if (createdOrderId) {
      const found = body.data.some((o: any) => o._id === createdOrderId);
      expect(found, 'Created order must appear in buyer order list').toBe(true);
    }
  });

  test('order has correct initial status: awaiting_seller_confirmation', async ({ request }) => {
    if (!buyerToken) buyerToken = await loginViaApi(request, TEST_BUYER);
    if (!createdOrderId) { test.skip(); return; }

    const res = await request.get(`${API_URL}/orders/my`, {
      headers: authHeaders(buyerToken),
    });
    const body = await res.json();
    const order = body.data.find((o: any) => o._id === createdOrderId);
    expect(order).toBeDefined();
    expect(order.status).toBe('awaiting_seller_confirmation');
  });

  test('rejects order without shipping address', async ({ request }) => {
    if (!buyerToken) buyerToken = await loginViaApi(request, TEST_BUYER);
    if (!testProductId) { test.skip(); return; }

    const res = await request.post(`${API_URL}/orders`, {
      headers: authHeaders(buyerToken),
      data: { productId: testProductId, qty: 1 },
    });
    expect(res.status()).toBe(400);
  });

  test('rejects order for non-existent product', async ({ request }) => {
    if (!buyerToken) buyerToken = await loginViaApi(request, TEST_BUYER);
    const res = await request.post(`${API_URL}/orders`, {
      headers: authHeaders(buyerToken),
      data: {
        productId: '000000000000000000000000',
        qty: 1,
        shippingAddress: '123 Test Street',
      },
    });
    expect(res.status()).toBe(404);
  });
});

// ─── 6. Seller Order Management ─────────────────────────────────────────────

test.describe('6. Seller Order Management', () => {
  test('seller can view their orders', async ({ request }) => {
    if (!sellerToken) sellerToken = await loginViaApi(request, TEST_SELLER);
    const res = await request.get(`${API_URL}/orders`, {
      headers: authHeaders(sellerToken),
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
  });

  test('seller can confirm the order (→ confirmed)', async ({ request }) => {
    if (!sellerToken) sellerToken = await loginViaApi(request, TEST_SELLER);

    // Find a pending order that belongs to THIS seller (not necessarily createdOrderId)
    const listRes = await request.get(
      `${API_URL}/orders?status=awaiting_seller_confirmation&limit=10`,
      { headers: authHeaders(sellerToken) }
    );
    const listBody = await listRes.json();
    const pendingOrders = listBody.data?.filter(
      (o: any) => o.status === 'awaiting_seller_confirmation'
    ) ?? [];

    if (pendingOrders.length === 0) {
      console.warn('No awaiting_seller_confirmation orders for seller1 — skipping confirm test');
      test.skip();
      return;
    }

    const targetId = pendingOrders[0]._id;
    createdOrderId = targetId; // keep in sync for next tests

    const res = await request.patch(`${API_URL}/orders/${targetId}/status`, {
      headers: authHeaders(sellerToken),
      data: { status: 'confirmed', note: 'Order confirmed by seller (Playwright test)' },
    });
    expect(res.status(), 'Seller confirm should succeed').toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.status).toBe('confirmed');
  });

  test('seller can mark order as ready_for_dispatch', async ({ request }) => {
    if (!sellerToken) sellerToken = await loginViaApi(request, TEST_SELLER);
    if (!createdOrderId) { test.skip(); return; }

    // The order might already be confirmed from previous test; if not, skip
    const listRes = await request.get(`${API_URL}/orders?limit=20`, {
      headers: authHeaders(sellerToken),
    });
    const listBody = await listRes.json();
    const order = listBody.data?.find((o: any) => o._id === createdOrderId);
    if (!order || !['confirmed', 'processing'].includes(order.status)) {
      console.warn(`Order ${createdOrderId} not in a state for ready_for_dispatch (${order?.status})`);
      test.skip();
      return;
    }

    const res = await request.patch(`${API_URL}/orders/${createdOrderId}/status`, {
      headers: authHeaders(sellerToken),
      data: { status: 'ready_for_dispatch', note: 'Package ready for pickup' },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.status).toBe('ready_for_dispatch');
  });

  test('seller cannot jump to invalid status (out_for_delivery)', async ({ request }) => {
    if (!sellerToken) sellerToken = await loginViaApi(request, TEST_SELLER);

    // Find any confirmed/processing order to attempt the invalid jump
    const listRes = await request.get(`${API_URL}/orders?limit=20`, {
      headers: authHeaders(sellerToken),
    });
    const listBody = await listRes.json();
    const eligibleOrder = listBody.data?.find((o: any) =>
      ['awaiting_seller_confirmation', 'confirmed', 'processing', 'ready_for_dispatch'].includes(o.status)
    );

    if (!eligibleOrder) {
      test.skip();
      return;
    }

    const res = await request.patch(`${API_URL}/orders/${eligibleOrder._id}/status`, {
      headers: authHeaders(sellerToken),
      data: { status: 'out_for_delivery' },
    });
    expect(res.status()).toBe(400);
  });

  test('seller can fetch order statistics', async ({ request }) => {
    if (!sellerToken) sellerToken = await loginViaApi(request, TEST_SELLER);
    const res = await request.get(`${API_URL}/orders/stats`, {
      headers: authHeaders(sellerToken),
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(typeof body.data.totalOrders).toBe('number');
    expect(typeof body.data.totalRevenue).toBe('number');
  });
});

// ─── 7. Buyer Order Actions ──────────────────────────────────────────────────

test.describe('7. Buyer Cancel (separate test order)', () => {
  let cancelOrderId = '';

  test('buyer can cancel a freshly placed order', async ({ request }) => {
    if (!buyerToken) buyerToken = await loginViaApi(request, TEST_BUYER);

    // Find a product from any active seller to place a cancellable order
    if (!testProductId) {
      const listRes = await request.get(`${API_URL}/public/products?limit=1`);
      const list = await listRes.json();
      if (!list.data?.length) { test.skip(); return; }
      testProductId = list.data[0]._id;
    }

    // Place a fresh order to cancel
    const placeRes = await request.post(`${API_URL}/orders`, {
      headers: authHeaders(buyerToken),
      data: {
        productId: testProductId,
        qty: 1,
        shippingAddress: '456 Cancel Street, Colombo',
        paymentMethod: 'Cash on Delivery',
        notes: 'Playwright cancel test',
      },
    });

    if (!placeRes.ok()) { test.skip(); return; }
    const placed = await placeRes.json();
    cancelOrderId = placed.data._id;

    // Cancel it
    const cancelRes = await request.patch(
      `${API_URL}/orders/my/${cancelOrderId}/cancel`,
      { headers: authHeaders(buyerToken) }
    );
    expect(cancelRes.status()).toBe(200);
    const body = await cancelRes.json();
    expect(body.success).toBe(true);
    expect(body.data.status).toBe('cancelled');
  });

  test('buyer cannot cancel an already-cancelled order', async ({ request }) => {
    if (!buyerToken) buyerToken = await loginViaApi(request, TEST_BUYER);
    if (!cancelOrderId) { test.skip(); return; }

    const res = await request.patch(
      `${API_URL}/orders/my/${cancelOrderId}/cancel`,
      { headers: authHeaders(buyerToken) }
    );
    expect(res.status()).toBe(400);
  });
});

// ─── 8. Order Status History ─────────────────────────────────────────────────

test.describe('8. Order Status History', () => {
  test('order has statusHistory entries after transitions', async ({ request }) => {
    if (!buyerToken) buyerToken = await loginViaApi(request, TEST_BUYER);

    const res = await request.get(`${API_URL}/orders/my`, {
      headers: authHeaders(buyerToken),
    });
    const body = await res.json();
    if (!body.data?.length) { test.skip(); return; }

    // Pick any order that has gone through transitions
    const orderWithHistory = body.data.find((o: any) =>
      Array.isArray(o.statusHistory) && o.statusHistory.length >= 2
    );
    if (!orderWithHistory) {
      console.warn('No order with multi-step history found yet — skipping');
      test.skip();
      return;
    }

    expect(Array.isArray(orderWithHistory.statusHistory)).toBe(true);
    expect(orderWithHistory.statusHistory.length).toBeGreaterThanOrEqual(2);
  });
});
