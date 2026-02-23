/**
 * k6 Authentication Flow Load Test
 *
 * Tests the complete auth lifecycle under load:
 *   1. Login  →  2. Get current user  →  3. Refresh token  →  4. Logout
 *
 * Run: k6 run tests/load/scenarios/auth.js
 */
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';
import { BASE_URL } from '../helpers/auth.js';

const authErrorRate = new Rate('auth_error_rate');

export const options = {
  vus: 5,
  duration: '2m',
  thresholds: {
    'auth_error_rate': [{ threshold: 'rate<0.02', abortOnFail: true }],
    'http_req_duration': [
      { threshold: 'p(95)<1000', abortOnFail: false },
    ],
    'http_req_failed': [{ threshold: 'rate<0.02', abortOnFail: true }],
  },
};

export default function () {
  const headers = { 'Content-Type': 'application/json' };

  // ── Step 1: Login ──────────────────────────────────────────────────────
  const loginRes = http.post(
    `${BASE_URL}/api/auth/login`,
    JSON.stringify({ email: 'admin@ims.local', password: 'admin123' }),
    { headers },
  );

  authErrorRate.add(loginRes.status >= 400);
  const loginOk = check(loginRes, {
    'login 200': (r) => r.status === 200,
    'login returns accessToken': (r) => {
      try { return !!JSON.parse(r.body)?.data?.accessToken; } catch { return false; }
    },
  });

  if (!loginOk) {
    sleep(2);
    return;
  }

  let accessToken, refreshToken;
  try {
    const body = JSON.parse(loginRes.body);
    accessToken = body?.data?.accessToken;
    refreshToken = body?.data?.refreshToken;
  } catch (_) {
    sleep(2);
    return;
  }

  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`,
  };

  sleep(0.2);

  // ── Step 2: Get current user ────────────────────────────────────────────
  const meRes = http.get(`${BASE_URL}/api/auth/me`, { headers: authHeaders });
  authErrorRate.add(meRes.status >= 400);
  check(meRes, {
    '/me returns 200': (r) => r.status === 200,
    '/me returns user object': (r) => {
      try { return !!JSON.parse(r.body)?.data?.id; } catch { return false; }
    },
  });

  sleep(0.3);

  // ── Step 3: Refresh token ───────────────────────────────────────────────
  if (refreshToken) {
    const refreshRes = http.post(
      `${BASE_URL}/api/auth/refresh`,
      JSON.stringify({ refreshToken }),
      { headers },
    );
    authErrorRate.add(refreshRes.status >= 400);
    check(refreshRes, {
      'token refresh 200': (r) => r.status === 200,
      'refresh returns new accessToken': (r) => {
        try { return !!JSON.parse(r.body)?.data?.accessToken; } catch { return false; }
      },
    });

    // Use refreshed token from here
    try {
      const newToken = JSON.parse(refreshRes.body)?.data?.accessToken;
      if (newToken) {
        authHeaders['Authorization'] = `Bearer ${newToken}`;
      }
    } catch (_) { /* ignore */ }
  }

  sleep(0.3);

  // ── Step 4: Logout ──────────────────────────────────────────────────────
  const logoutRes = http.post(`${BASE_URL}/api/auth/logout`, '{}', { headers: authHeaders });
  authErrorRate.add(logoutRes.status >= 400);
  check(logoutRes, { 'logout 200': (r) => r.status === 200 });

  sleep(1);
}
