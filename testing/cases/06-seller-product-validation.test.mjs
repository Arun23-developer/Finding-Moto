#!/usr/bin/env node

import { apiRequest, assert, requireEnv, runTest } from "./test-utils.mjs";

const token = requireEnv("SELLER_TOKEN");

await runTest("Seller product create rejects negative price", async () => {
  const { response, data } = await apiRequest("/products", {
    method: "POST",
    token,
    body: {
      name: "Negative Price Test",
      category: "Engine Parts",
      brand: "TestBrand",
      description: "Should fail",
      price: -1,
      originalPrice: 10,
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

await runTest("Seller product create rejects more than 5 images", async () => {
  const { response, data } = await apiRequest("/products", {
    method: "POST",
    token,
    body: {
      name: "Too Many Images Test",
      category: "Engine Parts",
      brand: "TestBrand",
      description: "Should fail",
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
