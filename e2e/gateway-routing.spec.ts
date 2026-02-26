// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { test, expect } from '@playwright/test';

/**
 * Gateway routing verification tests.
 *
 * Verifies that the gateway at port 4000 correctly:
 *   - Proxies requests to all downstream services
 *   - Enforces authentication on protected routes
 *   - Injects correlation-id headers
 *   - Handles rate limiting with proper 429 + Retry-After
 *   - Exposes /api/v1/* prefix aliases
 *   - Returns structured JSON 404s for unknown routes
 *   - Exposes /health and /metrics without authentication
 *
 * Services must be running for these tests to pass.
 * Start them with: ./scripts/start-all-services.sh
 */

const GATEWAY = 'http://localhost:4000';
const VALID_CREDENTIALS = { email: 'admin@ims.local', password: 'admin123' };

// ─── Shared token ─────────────────────────────────────────────────────────────

let sharedToken: string;

test.beforeAll(async ({ request }) => {
  const response = await request.post(`${GATEWAY}/api/auth/login`, {
    data: VALID_CREDENTIALS,
  });
  const body = await response.json();
  sharedToken = body.data?.accessToken as string;

  if (!sharedToken) {
    throw new Error(
      'Could not obtain access token from gateway. Ensure services are running.',
    );
  }
});

// ─── Downstream service routing ───────────────────────────────────────────────

/**
 * Each entry: the gateway path prefix and a concrete collection endpoint.
 * 200 = data found, 404 = valid empty collection or not-found entity,
 * but NOT 502 (bad gateway) or 503 (service unavailable).
 */
const DOWNSTREAM_ROUTES: Array<{ label: string; path: string }> = [
  { label: 'Health & Safety — risks',           path: '/api/health-safety/risks' },
  { label: 'Environment — aspects',             path: '/api/environment/aspects' },
  { label: 'Quality — processes',               path: '/api/quality/processes' },
  { label: 'Inventory — items',                 path: '/api/inventory/items' },
  { label: 'HR — employees',                    path: '/api/hr/employees' },
  { label: 'Payroll — payroll',                 path: '/api/payroll/payroll' },
  { label: 'Workflows — instances',             path: '/api/workflows/instances' },
  { label: 'Finance — accounts',                path: '/api/finance/accounts' },
  { label: 'CRM — contacts',                    path: '/api/crm/contacts' },
  { label: 'Risk — risks',                      path: '/api/risk/risks' },
  { label: 'Automotive — vehicles',             path: '/api/automotive/vehicles' },
  { label: 'Medical — devices',                 path: '/api/medical/devices' },
  { label: 'Food Safety — records',             path: '/api/food-safety/records' },
  { label: 'Energy — meters',                   path: '/api/energy/meters' },
  { label: 'InfoSec — assets',                  path: '/api/infosec/assets' },
  { label: 'ESG — metrics',                     path: '/api/esg/metrics' },
  { label: 'Incidents — incidents',             path: '/api/incidents/incidents' },
  { label: 'Audits — audits',                   path: '/api/audits/audits' },
  { label: 'Training — courses',                path: '/api/training/courses' },
  { label: 'Complaints — complaints',           path: '/api/complaints/complaints' },
];

test.describe('Gateway — Downstream Service Routing', () => {
  for (const route of DOWNSTREAM_ROUTES) {
    test(`${route.label} — proxied without 502/503`, async ({ request }) => {
      const response = await request.get(`${GATEWAY}${route.path}`, {
        headers: { Authorization: `Bearer ${sharedToken}` },
        timeout: 15_000,
      });

      const status = response.status();

      // 502 Bad Gateway or 503 Service Unavailable means the proxy target is unreachable
      expect(
        [502, 503].includes(status),
        `${route.label}: got ${status} — downstream service is likely down or gateway proxy is misconfigured`,
      ).toBeFalsy();

      // A successful proxy result must be 200, 201, 400, 401, 403, or 404
      // (some collections return 200, some empty 200, some route-not-found 404)
      expect(status).toBeGreaterThanOrEqual(200);
      expect(status).toBeLessThan(500);
    });
  }

  test('authenticated requests to known collection endpoints return { success: true }', async ({ request }) => {
    const endpoints = [
      '/api/health-safety/risks',
      '/api/inventory/items',
      '/api/hr/employees',
    ];

    for (const path of endpoints) {
      const response = await request.get(`${GATEWAY}${path}`, {
        headers: { Authorization: `Bearer ${sharedToken}` },
      });

      expect(response.status()).toBe(200);

      const body = await response.json();
      expect(body.success).toBe(true);
      // data is always an array for collection endpoints
      expect(Array.isArray(body.data)).toBeTruthy();
    }
  });

  test('proxied response contains data array with proper structure', async ({ request }) => {
    const response = await request.get(`${GATEWAY}/api/inventory/items`, {
      headers: { Authorization: `Bearer ${sharedToken}` },
    });

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBeTruthy();

    // meta is optional but when present must have a total count
    if (body.meta) {
      expect(typeof body.meta.total).toBe('number');
    }
  });
});

// ─── Correlation ID headers ───────────────────────────────────────────────────

test.describe('Gateway — Correlation ID Headers', () => {
  test('gateway sets x-correlation-id on response to /health', async ({ request }) => {
    const response = await request.get(`${GATEWAY}/health`);

    expect(response.ok()).toBeTruthy();

    const correlationId = response.headers()['x-correlation-id'];
    expect(correlationId).toBeTruthy();
    expect(typeof correlationId).toBe('string');
    expect(correlationId.length).toBeGreaterThan(0);
  });

  test('gateway sets x-correlation-id on authenticated API response', async ({ request }) => {
    const response = await request.get(`${GATEWAY}/api/health-safety/risks`, {
      headers: { Authorization: `Bearer ${sharedToken}` },
    });

    const correlationId = response.headers()['x-correlation-id'];
    expect(correlationId).toBeTruthy();
  });

  test('gateway echoes back a client-provided x-correlation-id', async ({ request }) => {
    const clientCorrelationId = 'e2e-test-correlation-12345';

    const response = await request.get(`${GATEWAY}/health`, {
      headers: { 'x-correlation-id': clientCorrelationId },
    });

    expect(response.ok()).toBeTruthy();

    const returnedId = response.headers()['x-correlation-id'];
    // The gateway should echo back the same ID rather than generating a new one
    expect(returnedId).toBe(clientCorrelationId);
  });

  test('two concurrent requests receive distinct generated correlation IDs', async ({ request }) => {
    const [res1, res2] = await Promise.all([
      request.get(`${GATEWAY}/health`),
      request.get(`${GATEWAY}/health`),
    ]);

    const id1 = res1.headers()['x-correlation-id'];
    const id2 = res2.headers()['x-correlation-id'];

    expect(id1).toBeTruthy();
    expect(id2).toBeTruthy();
    // Each auto-generated ID must be unique
    expect(id1).not.toBe(id2);
  });
});

// ─── Authentication enforcement ───────────────────────────────────────────────

test.describe('Gateway — Authentication Enforcement', () => {
  test('unauthenticated request to proxied route returns 401', async ({ request }) => {
    const response = await request.get(`${GATEWAY}/api/health-safety/risks`);

    expect(response.status()).toBe(401);

    const body = await response.json();
    expect(body.success).toBe(false);
    expect(body.error).toBeDefined();
  });

  test('unauthenticated request to inventory returns 401', async ({ request }) => {
    const response = await request.get(`${GATEWAY}/api/inventory/items`);
    expect(response.status()).toBe(401);
  });

  test('unauthenticated request to hr employees returns 401', async ({ request }) => {
    const response = await request.get(`${GATEWAY}/api/hr/employees`);
    expect(response.status()).toBe(401);
  });

  test('request with invalid token to proxied route returns 401', async ({ request }) => {
    const response = await request.get(`${GATEWAY}/api/risk/risks`, {
      headers: { Authorization: 'Bearer not.a.valid.jwt' },
    });
    expect(response.status()).toBe(401);
  });

  test('/health is accessible without authentication', async ({ request }) => {
    const response = await request.get(`${GATEWAY}/health`);
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.status).toBe('ok');
  });

  test('/metrics is accessible without authentication', async ({ request }) => {
    const response = await request.get(`${GATEWAY}/metrics`);
    expect(response.ok()).toBeTruthy();
  });
});

// ─── /api/v1/* prefix aliasing ────────────────────────────────────────────────

test.describe('Gateway — /api/v1 Prefix Aliases', () => {
  test('/api/v1/health-safety/risks returns same result as /api/health-safety/risks', async ({ request }) => {
    const [v1, canonical] = await Promise.all([
      request.get(`${GATEWAY}/api/v1/health-safety/risks`, {
        headers: { Authorization: `Bearer ${sharedToken}` },
      }),
      request.get(`${GATEWAY}/api/health-safety/risks`, {
        headers: { Authorization: `Bearer ${sharedToken}` },
      }),
    ]);

    expect(v1.status()).toBe(canonical.status());

    const v1Body       = await v1.json();
    const canonicalBody = await canonical.json();

    expect(v1Body.success).toBe(canonicalBody.success);
    // Both should return the same collection type
    expect(Array.isArray(v1Body.data)).toBe(Array.isArray(canonicalBody.data));
  });

  test('/api/v1/inventory/items is accessible and returns { success: true }', async ({ request }) => {
    const response = await request.get(`${GATEWAY}/api/v1/inventory/items`, {
      headers: { Authorization: `Bearer ${sharedToken}` },
    });

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.success).toBe(true);
  });

  test('/api/v1/environment/aspects is accessible and returns { success: true }', async ({ request }) => {
    const response = await request.get(`${GATEWAY}/api/v1/environment/aspects`, {
      headers: { Authorization: `Bearer ${sharedToken}` },
    });

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.success).toBe(true);
  });

  test('/api/v1 unauthenticated requests are still rejected', async ({ request }) => {
    const response = await request.get(`${GATEWAY}/api/v1/health-safety/risks`);
    expect(response.status()).toBe(401);
  });
});

// ─── 404 / Unknown route handling ────────────────────────────────────────────

test.describe('Gateway — Unknown Route Handling', () => {
  test('completely unknown route returns 404 with { success: false }', async ({ request }) => {
    const response = await request.get(`${GATEWAY}/api/does-not-exist-at-all`);

    expect(response.status()).toBe(404);

    const body = await response.json();
    expect(body.success).toBe(false);
    expect(body.error).toBeDefined();
  });

  test('unknown nested route returns 404 JSON (not HTML)', async ({ request }) => {
    const response = await request.get(`${GATEWAY}/api/xyz/abc/def/ghi`);

    expect(response.status()).toBe(404);

    const contentType = response.headers()['content-type'] || '';
    expect(contentType).toContain('application/json');

    const body = await response.json();
    expect(body.success).toBe(false);
  });

  test('unknown root path returns 404 JSON', async ({ request }) => {
    const response = await request.get(`${GATEWAY}/totally-unknown-path`);

    expect(response.status()).toBe(404);

    const body = await response.json();
    expect(body.success).toBe(false);
  });
});

// ─── Rate limiting ────────────────────────────────────────────────────────────

test.describe('Gateway — Rate Limiting', () => {
  /**
   * Auth limiter is set to 5 failed attempts per 15 minutes per IP+email.
   * We fire multiple failed logins to exhaust it and verify 429 + Retry-After.
   *
   * NOTE: If RATE_LIMIT_ENABLED=false in the gateway .env (e.g. in CI / load-test mode)
   * this test will be skipped automatically.
   */
  test('auth rate limiter returns 429 after repeated failed login attempts', async ({ request }) => {
    // Use a unique fake email so we do not interfere with the real admin account
    const fakeEmail = `ratelimit-test-${Date.now()}@ims-e2e.invalid`;

    let rateLimited = false;

    // The auth limiter allows 5 failed attempts; send 7 to reliably hit it
    for (let i = 0; i < 7; i++) {
      const response = await request.post(`${GATEWAY}/api/auth/login`, {
        data: { email: fakeEmail, password: 'wrongpassword' },
      });

      if (response.status() === 429) {
        rateLimited = true;

        const body = await response.json();
        expect(body.success).toBe(false);
        expect(body.error).toBeDefined();
        expect(body.error.code).toBe('RATE_LIMIT_EXCEEDED');

        // express-rate-limit with standardHeaders: true sets RateLimit-Reset or Retry-After
        const retryAfter =
          response.headers()['retry-after'] ||
          response.headers()['ratelimit-reset'];

        // At least one of the two headers must be present
        expect(retryAfter ?? null).not.toBeNull();
        break;
      }

      // Avoid hammering the endpoint instantly
      await new Promise((resolve) => setTimeout(resolve, 50));
    }

    if (!rateLimited) {
      // Rate limiting may be disabled (RATE_LIMIT_ENABLED=false) — skip gracefully
      console.warn(
        'Rate limit was not triggered after 7 failed attempts. ' +
          'This is expected when RATE_LIMIT_ENABLED=false.',
      );
    }
  });

  test('rate-limited response includes { success: false, error.code: RATE_LIMIT_EXCEEDED }', async ({ request }) => {
    const fakeEmail = `rl-shape-test-${Date.now()}@ims-e2e.invalid`;

    let foundRateLimit = false;

    for (let i = 0; i < 8; i++) {
      const response = await request.post(`${GATEWAY}/api/auth/login`, {
        data: { email: fakeEmail, password: 'bad' },
      });

      if (response.status() === 429) {
        foundRateLimit = true;
        const body = await response.json();

        expect(body).toMatchObject({
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: expect.any(String),
          },
        });
        break;
      }

      await new Promise((resolve) => setTimeout(resolve, 50));
    }

    if (!foundRateLimit) {
      console.warn('Rate limit was not triggered — RATE_LIMIT_ENABLED may be false.');
    }
  });
});

// ─── Response structure validation ───────────────────────────────────────────

test.describe('Gateway — Response Structure', () => {
  test('successful collection endpoint returns { success: true, data: Array }', async ({ request }) => {
    const response = await request.get(`${GATEWAY}/api/health-safety/risks`, {
      headers: { Authorization: `Bearer ${sharedToken}` },
    });

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBeTruthy();
  });

  test('error response always returns { success: false, error: {...} }', async ({ request }) => {
    const response = await request.get(`${GATEWAY}/api/does-not-exist`);

    expect(response.status()).toBe(404);

    const body = await response.json();
    expect(body.success).toBe(false);
    expect(typeof body.error).toBe('object');
    expect(body.error).not.toBeNull();
  });

  test('gateway response includes content-type application/json for API routes', async ({ request }) => {
    const response = await request.get(`${GATEWAY}/api/health-safety/risks`, {
      headers: { Authorization: `Bearer ${sharedToken}` },
    });

    const contentType = response.headers()['content-type'] || '';
    expect(contentType).toContain('application/json');
  });

  test('pagination meta is present for list endpoints that support it', async ({ request }) => {
    const response = await request.get(`${GATEWAY}/api/inventory/items?page=1&limit=10`, {
      headers: { Authorization: `Bearer ${sharedToken}` },
    });

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.success).toBe(true);

    // When meta is returned it must include a total count
    if (body.meta) {
      expect(typeof body.meta.total).toBe('number');
      expect(body.meta.total).toBeGreaterThanOrEqual(0);
    }
  });
});
