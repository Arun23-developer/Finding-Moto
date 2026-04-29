#!/usr/bin/env node

/**
 * Finding Moto API smoke/regression tests.
 *
 * Requirements:
 * - Backend server running, default: http://127.0.0.1:5000
 * - Node 18+ because this uses built-in fetch
 *
 * Optional environment variables:
 * - API_URL=http://127.0.0.1:5000/api
 * - SELLER_TOKEN=jwt-token-for-seller-or-mechanic
 * - BUYER_TOKEN=jwt-token-for-buyer
 * - DELIVERED_ORDER_ID=buyer-delivered-order-id
 * - TEST_PRODUCT_ID=public-product-id
 */

import assert from "node:assert/strict";

const API_URL = (process.env.API_URL || "http://127.0.0.1:5000/api").replace(/\/$/, "");
const SELLER_TOKEN = process.env.SELLER_TOKEN || "";
const BUYER_TOKEN = process.env.BUYER_TOKEN || "";
const DELIVERED_ORDER_ID = process.env.DELIVERED_ORDER_ID || "";
const TEST_PRODUCT_ID = process.env.TEST_PRODUCT_ID || "";

const results = [];

function randomEmail(prefix) {
  return `${prefix}.${Date.now()}.${Math.floor(Math.random() * 10000)}@gmail.com`;
}

async function request(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    body: options.body && typeof options.body !== "string" ? JSON.stringify(options.body) : options.body,
  });

  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  return { response, data };
}

async function test(name, fn) {
  const started = Date.now();
  try {
    await fn();
    results.push({ name, status: "PASS", duration: Date.now() - started });
    console.log(`PASS ${name}`);
  } catch (error) {
    results.push({ name, status: "FAIL", duration: Date.now() - started, error });
    console.error(`FAIL ${name}`);
    console.error(`     ${error?.message || error}`);
  }
}

async function optionalTest(name, condition, fn) {
  if (!condition) {
    results.push({ name, status: "SKIP", duration: 0 });
    console.log(`SKIP ${name}`);
    return;
  }
  await test(name, fn);
}

await test("API health is reachable", async () => {
  const { response, data } = await request("/health");
  assert.equal(response.status, 200);
  assert.equal(data.status, "OK");
});

await test("Contact form accepts valid visitor message", async () => {
  const { response, data } = await request("/public/contact", {
    method: "POST",
    body: {
      name: "Test Visitor",
      email: randomEmail("visitor"),
      phone: "+94771234567",
      message: "Smoke test contact message",
    },
  });

  assert.equal(response.status, 201);
  assert.equal(data.success, true);
  assert.equal(data.data.phone, "+94771234567");
});

await test("Contact form rejects invalid phone", async () => {
  const { response, data } = await request("/public/contact", {
    method: "POST",
    body: {
      name: "Test Visitor",
      email: randomEmail("visitor.invalid"),
      phone: "0771234567",
      message: "Invalid phone test",
    },
  });

  assert.equal(response.status, 400);
  assert.equal(data.success, false);
  assert.match(data.message, /\+94/i);
});

await test("Registration rejects numeric first name", async () => {
  const { response, data } = await request("/auth/register", {
    method: "POST",
    body: {
      firstName: "John1",
      lastName: "Tester",
      email: randomEmail("badname"),
      password: "Pass@1234",
      confirmPassword: "Pass@1234",
      phone: "+94771234567",
      role: "buyer",
    },
  });

  assert.equal(response.status, 400);
  assert.match(data.message, /first name/i);
});

await test("Registration rejects weak password", async () => {
  const { response, data } = await request("/auth/register", {
    method: "POST",
    body: {
      firstName: "John",
      lastName: "Tester",
      email: randomEmail("weakpass"),
      password: "password",
      phone: "+94771234567",
      role: "buyer",
    },
  });

  assert.equal(response.status, 400);
  assert.match(data.message, /password/i);
});

await test("Public products endpoint returns list shape", async () => {
  const { response, data } = await request("/public/products?page=1&limit=3&sort=newest");
  assert.equal(response.status, 200);
  assert.equal(data.success, true);
  assert.ok(Array.isArray(data.data));
  assert.ok(data.meta);
});

await optionalTest("Public product detail exposes image array", Boolean(TEST_PRODUCT_ID), async () => {
  const { response, data } = await request(`/public/products/${TEST_PRODUCT_ID}`);
  assert.equal(response.status, 200);
  assert.equal(data.success, true);
  assert.ok(Array.isArray(data.data.images), "product.images should be an array");
});

await optionalTest("Seller product create rejects negative price", Boolean(SELLER_TOKEN), async () => {
  const { response, data } = await request("/products", {
    method: "POST",
    token: SELLER_TOKEN,
    body: {
      name: "Negative Price Test",
      category: "Engine Parts",
      brand: "TestBrand",
      description: "Should be rejected",
      price: -10,
      originalPrice: 20,
      stock: 5,
      images: [],
      type: "product",
      status: "active",
      productStatus: "ENABLED",
    },
  });

  assert.equal(response.status, 400);
  assert.match(data.message, /price/i);
});

await optionalTest("Seller product create rejects more than 5 images", Boolean(SELLER_TOKEN), async () => {
  const { response, data } = await request("/products", {
    method: "POST",
    token: SELLER_TOKEN,
    body: {
      name: "Too Many Images Test",
      category: "Engine Parts",
      brand: "TestBrand",
      description: "Should be rejected",
      price: 100,
      originalPrice: 120,
      stock: 5,
      images: [
        "https://example.com/1.jpg",
        "https://example.com/2.jpg",
        "https://example.com/3.jpg",
        "https://example.com/4.jpg",
        "https://example.com/5.jpg",
        "https://example.com/6.jpg",
      ],
      type: "product",
      status: "active",
      productStatus: "ENABLED",
    },
  });

  assert.equal(response.status, 400);
  assert.match(data.message, /maximum 5/i);
});

await optionalTest(
  "Return form rejects fewer than 5 images",
  Boolean(BUYER_TOKEN && DELIVERED_ORDER_ID),
  async () => {
    const { response, data } = await request("/returns", {
      method: "POST",
      token: BUYER_TOKEN,
      body: {
        orderId: DELIVERED_ORDER_ID,
        reason: "Damaged Product",
        description: "Testing image count validation",
        referencePhotos: [
          "https://example.com/1.jpg",
          "https://example.com/2.jpg",
        ],
        bankDetails: {
          accountHolderName: "Test Buyer",
          bankName: "Test Bank",
          accountNumber: "12345678",
        },
      },
    });

    assert.equal(response.status, 400);
    assert.match(data.message, /image|photo/i);
  }
);

const passed = results.filter((item) => item.status === "PASS").length;
const failed = results.filter((item) => item.status === "FAIL").length;
const skipped = results.filter((item) => item.status === "SKIP").length;

console.log("");
console.log(`Summary: ${passed} passed, ${failed} failed, ${skipped} skipped`);

if (failed > 0) {
  process.exitCode = 1;
}
