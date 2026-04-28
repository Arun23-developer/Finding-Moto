import { APIRequestContext } from '@playwright/test';

export const API_URL = 'http://localhost:5000/api';
export const FRONTEND_URL = 'http://localhost:5173';

export interface TestCredentials {
  email: string;
  password: string;
  role: string;
}

export const TEST_BUYER: TestCredentials = {
  email: process.env.TEST_BUYER_EMAIL || 'buyer1@samplemail.com',
  password: process.env.TEST_BUYER_PASSWORD || 'Buyer@123',
  role: 'buyer',
};

export const TEST_SELLER: TestCredentials = {
  email: process.env.TEST_SELLER_EMAIL || 'seller1@samplemail.com',
  password: process.env.TEST_SELLER_PASSWORD || 'Seller@123',
  role: 'seller',
};

export const TEST_DELIVERY_AGENT: TestCredentials = {
  email: process.env.TEST_DELIVERY_EMAIL || 'delivery1@samplemail.com',
  password: process.env.TEST_DELIVERY_PASSWORD || 'Delivery@123',
  role: 'delivery_agent',
};

/**
 * Login via API and return the JWT token.
 */
export async function loginViaApi(
  request: APIRequestContext,
  creds: TestCredentials
): Promise<string> {
  const res = await request.post(`${API_URL}/auth/login`, {
    data: { email: creds.email, password: creds.password, role: creds.role },
  });

  if (!res.ok()) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      `Login failed for ${creds.email} [${res.status()}]: ${JSON.stringify(body)}`
    );
  }

  const body = await res.json();
  if (!body.token) {
    throw new Error(`No token returned for ${creds.email}: ${JSON.stringify(body)}`);
  }
  return body.token as string;
}

/**
 * Return Axios-style auth headers for raw API requests.
 */
export function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` };
}
