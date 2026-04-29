#!/usr/bin/env node

import { apiRequest, assert, runTest } from "./test-utils.mjs";

await runTest("Public products endpoint returns paginated product list", async () => {
  const { response, data } = await apiRequest("/public/products?page=1&limit=5&sort=newest");

  assert.equal(response.status, 200);
  assert.equal(data.success, true);
  assert.ok(Array.isArray(data.data));
  assert.ok(data.meta);
  assert.equal(typeof data.meta.page, "number");
});
