#!/usr/bin/env node

import { apiRequest, assert, requireEnv, runTest } from "./test-utils.mjs";

const productId = requireEnv("TEST_PRODUCT_ID");

await runTest("Public product detail returns all product images", async () => {
  const { response, data } = await apiRequest(`/public/products/${productId}`);

  assert.equal(response.status, 200);
  assert.equal(data.success, true);
  assert.ok(Array.isArray(data.data.images), "images must be an array");
  assert.ok(data.data.images.length >= 1, "product should have at least one image for gallery testing");
});
