// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
/**
 * k6 authentication helpers
 * Shared across all load test scenarios
 */

import http from 'k6/http';
import { check } from 'k6';

export const BASE_URL = __ENV.BASE_URL || 'http://localhost:4000';

export const DEFAULT_CREDENTIALS = {
  email: __ENV.TEST_EMAIL || 'admin@ims.local',
  password: __ENV.TEST_PASSWORD || 'admin123',
};

/**
 * Obtain a bearer token via the /api/auth/login endpoint.
 * Returns the token string or null on failure.
 */
export function login(credentials = DEFAULT_CREDENTIALS) {
  const res = http.post(
    `${BASE_URL}/api/auth/login`,
    JSON.stringify(credentials),
    { headers: { 'Content-Type': 'application/json' } }
  );

  const ok = check(res, {
    'login status 200': (r) => r.status === 200,
    'login returns token': (r) => {
      try {
        const body = JSON.parse(r.body);
        return !!(body?.data?.accessToken);
      } catch {
        return false;
      }
    },
  });

  if (!ok) return null;
  return JSON.parse(res.body).data.accessToken;
}

/**
 * Build standard auth headers from a token.
 */
export function authHeaders(token) {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}
