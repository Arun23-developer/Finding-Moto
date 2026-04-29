#!/usr/bin/env node

import { apiRequest, assert, randomEmail, runTest } from "./test-utils.mjs";

await runTest("Contact form creates visitor message", async () => {
  const { response, data } = await apiRequest("/public/contact", {
    method: "POST",
    body: {
      name: "Visitor Test",
      email: randomEmail("visitor"),
      phone: "+94771234567",
      message: "Testing visitor message creation",
    },
  });

  assert.equal(response.status, 201);
  assert.equal(data.success, true);
  assert.equal(data.data.phone, "+94771234567");
});

await runTest("Contact form rejects invalid name and phone", async () => {
  const { response, data } = await apiRequest("/public/contact", {
    method: "POST",
    body: {
      name: "Visitor123",
      email: randomEmail("visitor-invalid"),
      phone: "0771234567",
      message: "Testing invalid validation",
    },
  });

  assert.equal(response.status, 400);
  assert.equal(data.success, false);
});
