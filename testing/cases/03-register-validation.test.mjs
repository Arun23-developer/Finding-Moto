#!/usr/bin/env node

import { apiRequest, assert, randomEmail, runTest } from "./test-utils.mjs";

await runTest("Register rejects first name with numbers", async () => {
  const { response, data } = await apiRequest("/auth/register", {
    method: "POST",
    body: {
      firstName: "John1",
      lastName: "Tester",
      email: randomEmail("bad-name"),
      password: "Pass@1234",
      phone: "+94771234567",
      role: "buyer",
    },
  });

  assert.equal(response.status, 400);
  assert.match(data.message, /first name/i);
});

await runTest("Register rejects weak password", async () => {
  const { response, data } = await apiRequest("/auth/register", {
    method: "POST",
    body: {
      firstName: "John",
      lastName: "Tester",
      email: randomEmail("weak-password"),
      password: "password",
      phone: "+94771234567",
      role: "buyer",
    },
  });

  assert.equal(response.status, 400);
  assert.match(data.message, /password/i);
});
