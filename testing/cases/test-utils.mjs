import assert from "node:assert/strict";

export const API_URL = (process.env.API_URL || "http://127.0.0.1:5000/api").replace(/\/$/, "");

export function randomEmail(prefix = "test") {
  return `${prefix}.${Date.now()}.${Math.floor(Math.random() * 10000)}@gmail.com`;
}

export async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      ...(options.headers || {}),
    },
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

export async function runTest(name, fn) {
  try {
    await fn();
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    console.error(error?.message || error);
    process.exitCode = 1;
  }
}

export function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    console.log(`SKIP missing ${name}`);
    process.exit(0);
  }
  return value;
}

export { assert };
