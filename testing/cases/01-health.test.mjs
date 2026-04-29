#!/usr/bin/env node

import { apiRequest, assert, runTest } from "./test-utils.mjs";

await runTest("API health endpoint returns OK", async () => {
  const { response, data } = await apiRequest("/health");

  assert.equal(response.status, 200);
  assert.equal(data.status, "OK");
  assert.match(data.message, /Finding Moto API/i);
});
