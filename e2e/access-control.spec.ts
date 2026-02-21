import { test, expect, type APIRequestContext } from '@playwright/test';

/**
 * RBAC and authentication enforcement tests.
 *
 * Verifies that every protected endpoint correctly rejects unauthenticated /
 * improperly-authenticated requests, that OPTIONS preflights are allowed
 * without auth, and that a valid admin token grants write access.
 */

const GATEWAY = 'http://localhost:4000';
const VALID_CREDENTIALS = { email: 'admin@ims.local', password: 'admin123' };

async function loginAndGetToken(request: APIRequestContext): Promise<string> {
  const response = await request.post(`${GATEWAY}/api/auth/login`, {
    data: VALID_CREDENTIALS,
  });
  const body = (await response.json()) as { data?: { accessToken?: string } };
  return body.data?.accessToken ?? '';
}

// ─── Unauthenticated access ───────────────────────────────────────────────────

test.describe('Access Control — No token', () => {
  test('GET /api/health-safety/risks without token → 401 { success: false }', async ({ request }) => {
    const response = await request.get(`${GATEWAY}/api/health-safety/risks`);

    expect(response.status()).toBe(401);

    const body = (await response.json()) as { success: boolean; error?: unknown };
    expect(body.success).toBe(false);
    expect(body.error).toBeDefined();
  });

  test('GET /api/quality/processes without token → 401', async ({ request }) => {
    const response = await request.get(`${GATEWAY}/api/quality/processes`);

    expect(response.status()).toBe(401);

    const body = (await response.json()) as { success: boolean };
    expect(body.success).toBe(false);
  });

  test('GET /api/environment/aspects without token → 401', async ({ request }) => {
    const response = await request.get(`${GATEWAY}/api/environment/aspects`);

    expect(response.status()).toBe(401);

    const body = (await response.json()) as { success: boolean };
    expect(body.success).toBe(false);
  });
});

// ─── Invalid / malformed token ────────────────────────────────────────────────

test.describe('Access Control — Invalid token', () => {
  test('GET /api/quality/processes with invalid Bearer token → 401', async ({ request }) => {
    const response = await request.get(`${GATEWAY}/api/quality/processes`, {
      headers: { Authorization: 'Bearer this.is.not.valid' },
    });

    expect(response.status()).toBe(401);

    const body = (await response.json()) as { success: boolean };
    expect(body.success).toBe(false);
  });

  test('GET /api/hr/employees with malformed Authorization header → 401', async ({ request }) => {
    const response = await request.get(`${GATEWAY}/api/hr/employees`, {
      headers: { Authorization: 'Token not-a-bearer-token' },
    });

    expect(response.status()).toBe(401);

    const body = (await response.json()) as { success: boolean };
    expect(body.success).toBe(false);
  });

  test('GET /api/inventory/items with tampered JWT → 401', async ({ request }) => {
    const token = await loginAndGetToken(request);
    const [header, payload] = token.split('.');
    const tampered = `${header}.${payload}.invalidsignatureXXX`;

    const response = await request.get(`${GATEWAY}/api/inventory/items`, {
      headers: { Authorization: `Bearer ${tampered}` },
    });

    expect(response.status()).toBe(401);
  });
});

// ─── Auth error shape consistency ─────────────────────────────────────────────

test.describe('Access Control — Consistent 401 shape across services', () => {
  const protectedEndpoints = [
    '/api/health-safety/risks',
    '/api/quality/processes',
    '/api/environment/aspects',
    '/api/inventory/items',
    '/api/hr/employees',
    '/api/workflows/workflows',
  ];

  for (const endpoint of protectedEndpoints) {
    test(`${endpoint} returns { success: false } on 401`, async ({ request }) => {
      const response = await request.get(`${GATEWAY}${endpoint}`);

      expect(response.status()).toBe(401);

      const body = (await response.json()) as { success: boolean };
      expect(body.success).toBe(false);
    });
  }
});

// ─── Write access with valid admin token ──────────────────────────────────────

test.describe('Access Control — Authenticated write access', () => {
  let token: string;

  test.beforeAll(async ({ request }) => {
    token = await loginAndGetToken(request);
  });

  test('POST /api/health-safety/risks with valid token → 201 or 400 (not 401/403)', async ({ request }) => {
    const response = await request.post(`${GATEWAY}/api/health-safety/risks`, {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        title: 'E2E Access Control Test Risk',
        riskType: 'OPERATIONAL',
        likelihood: 2,
        consequence: 2,
      },
    });

    // 201 = created; 400 = validation issue — both confirm auth passed
    expect([201, 400]).toContain(response.status());
    // Confirm it was NOT an auth rejection
    expect([401, 403]).not.toContain(response.status());
  });

  test('Admin token grants read access across 5+ services', async ({ request }) => {
    const endpoints = [
      '/api/health-safety/risks',
      '/api/environment/aspects',
      '/api/quality/processes',
      '/api/inventory/items',
      '/api/hr/employees',
      '/api/finance/accounts',
    ];

    for (const endpoint of endpoints) {
      const response = await request.get(`${GATEWAY}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // 200 = data returned; 404 = no data but auth passed
      expect([200, 404]).toContain(response.status());
      expect(response.status()).not.toBe(401);
      expect(response.status()).not.toBe(403);
    }
  });
});

// ─── CORS preflight (OPTIONS) ─────────────────────────────────────────────────

test.describe('Access Control — CORS preflight', () => {
  test('OPTIONS /api/health-safety/risks does not require Authorization', async ({ request }) => {
    const response = await request.fetch(`${GATEWAY}/api/health-safety/risks`, {
      method: 'OPTIONS',
      headers: {
        Origin: 'http://localhost:3001',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Authorization',
      },
    });

    // Preflight must succeed: 200 or 204 — never 401
    expect([200, 204]).toContain(response.status());
    expect(response.status()).not.toBe(401);
  });

  test('OPTIONS /api/quality/processes preflight succeeds without token', async ({ request }) => {
    const response = await request.fetch(`${GATEWAY}/api/quality/processes`, {
      method: 'OPTIONS',
      headers: {
        Origin: 'http://localhost:3003',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type, Authorization',
      },
    });

    expect([200, 204]).toContain(response.status());
    expect(response.status()).not.toBe(401);
  });
});
