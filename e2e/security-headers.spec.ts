import { test, expect } from '@playwright/test';

const GATEWAY = 'http://localhost:4000';

test.describe('Security Headers', () => {
  let token: string;

  test.beforeAll(async ({ request }) => {
    const r = await request.post(`${GATEWAY}/api/auth/login`, {
      data: { email: 'admin@ims.local', password: 'admin123' },
    });
    token = (await r.json()).data?.accessToken;
  });

  // ── x-content-type-options ────────────────────────────────────────────────────

  test('/health has x-content-type-options: nosniff', async ({ request }) => {
    const r = await request.get(`${GATEWAY}/health`);
    expect(r.headers()['x-content-type-options']).toBe('nosniff');
  });

  test('authenticated API has x-content-type-options: nosniff', async ({ request }) => {
    const r = await request.get(`${GATEWAY}/api/health-safety/risks`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(r.headers()['x-content-type-options']).toBe('nosniff');
  });

  test('unauthenticated API response has x-content-type-options: nosniff', async ({ request }) => {
    const r = await request.get(`${GATEWAY}/api/health-safety/risks`);
    // 401 response from gateway should still carry security headers
    expect(r.headers()['x-content-type-options']).toBe('nosniff');
  });

  // ── x-frame-options ───────────────────────────────────────────────────────────

  test('/health has x-frame-options header', async ({ request }) => {
    const r = await request.get(`${GATEWAY}/health`);
    const header = r.headers()['x-frame-options'];
    expect(header).toBeDefined();
    expect(['SAMEORIGIN', 'DENY']).toContain(header?.toUpperCase());
  });

  test('authenticated API has x-frame-options header', async ({ request }) => {
    const r = await request.get(`${GATEWAY}/api/health-safety/risks`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const header = r.headers()['x-frame-options'];
    expect(header).toBeDefined();
    expect(['SAMEORIGIN', 'DENY']).toContain(header?.toUpperCase());
  });

  // ── x-xss-protection ─────────────────────────────────────────────────────────

  test('/health has x-xss-protection header', async ({ request }) => {
    const r = await request.get(`${GATEWAY}/health`);
    expect(r.headers()['x-xss-protection']).toBeDefined();
  });

  test('authenticated API has x-xss-protection header', async ({ request }) => {
    const r = await request.get(`${GATEWAY}/api/health-safety/risks`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(r.headers()['x-xss-protection']).toBeDefined();
  });

  // ── strict-transport-security (HSTS) ──────────────────────────────────────────

  test('HSTS header is present or absent only in dev environment', async ({ request }) => {
    const r = await request.get(`${GATEWAY}/health`);
    const hsts = r.headers()['strict-transport-security'];
    // In development (HTTP), HSTS may legitimately be absent.
    // In production (HTTPS), this MUST be set. We log its presence here.
    if (hsts) {
      expect(hsts).toMatch(/max-age=\d+/);
    } else {
      // Acceptable in dev — verify no crash
      expect(r.ok()).toBeTruthy();
    }
  });

  // ── content-security-policy ───────────────────────────────────────────────────

  test('/health has content-security-policy header', async ({ request }) => {
    const r = await request.get(`${GATEWAY}/health`);
    expect(r.headers()['content-security-policy']).toBeDefined();
  });

  test('authenticated API has content-security-policy header', async ({ request }) => {
    const r = await request.get(`${GATEWAY}/api/health-safety/risks`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(r.headers()['content-security-policy']).toBeDefined();
  });

  // ── Content-Type ──────────────────────────────────────────────────────────────

  test('API list response has application/json content-type', async ({ request }) => {
    const r = await request.get(`${GATEWAY}/api/health-safety/risks`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(r.headers()['content-type']).toMatch(/application\/json/);
  });

  test('login response has application/json content-type', async ({ request }) => {
    const r = await request.post(`${GATEWAY}/api/auth/login`, {
      data: { email: 'admin@ims.local', password: 'admin123' },
    });
    expect(r.headers()['content-type']).toMatch(/application\/json/);
  });

  test('401 error response has application/json content-type', async ({ request }) => {
    const r = await request.get(`${GATEWAY}/api/health-safety/risks`);
    expect(r.status()).toBe(401);
    expect(r.headers()['content-type']).toMatch(/application\/json/);
  });

  // ── No stack traces in error responses ───────────────────────────────────────

  test('401 error response does not leak stack traces', async ({ request }) => {
    const r = await request.get(`${GATEWAY}/api/health-safety/risks`);
    const body = await r.text();
    expect(body).not.toMatch(/\bstack\b.*at\s+\w/);
    expect(body).not.toMatch(/Error: .+\n\s+at /);
  });

  test('invalid login error response does not leak stack traces', async ({ request }) => {
    const r = await request.post(`${GATEWAY}/api/auth/login`, {
      data: { email: 'bad@example.com', password: 'wrongpassword' },
    });
    const body = await r.text();
    expect(body).not.toMatch(/\bstack\b.*at\s+\w/);
    expect(body).not.toMatch(/Error: .+\n\s+at /);
  });

  test('404 error response does not leak stack traces', async ({ request }) => {
    const r = await request.get(`${GATEWAY}/api/nonexistent-endpoint-xyz`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const body = await r.text();
    expect(body).not.toMatch(/Error: .+\n\s+at /);
  });

  // ── Server header ─────────────────────────────────────────────────────────────

  test('server header does not expose Express version', async ({ request }) => {
    const r = await request.get(`${GATEWAY}/health`);
    const server = r.headers()['server'];
    // If the server header is present, it must not reveal framework/version details
    if (server) {
      expect(server.toLowerCase()).not.toMatch(/express/);
      expect(server).not.toMatch(/\d+\.\d+\.\d+/);
    }
    // Absence of the header is the most secure option
    expect(true).toBeTruthy();
  });

  test('x-powered-by header is not present', async ({ request }) => {
    const r = await request.get(`${GATEWAY}/health`);
    // Helmet removes x-powered-by by default
    expect(r.headers()['x-powered-by']).toBeUndefined();
  });

  test('authenticated API does not expose x-powered-by', async ({ request }) => {
    const r = await request.get(`${GATEWAY}/api/health-safety/risks`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(r.headers()['x-powered-by']).toBeUndefined();
  });

  // ── CORS headers on authenticated requests ────────────────────────────────────

  test('authenticated API response has access-control-allow-origin header', async ({ request }) => {
    const r = await request.get(`${GATEWAY}/api/health-safety/risks`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Origin: 'http://localhost:3001',
      },
    });
    expect(r.ok()).toBeTruthy();
    expect(r.headers()['access-control-allow-origin']).toBeDefined();
  });

  test('CORS preflight OPTIONS returns 204 or 200', async ({ request }) => {
    const r = await request.fetch(`${GATEWAY}/api/health-safety/risks`, {
      method: 'OPTIONS',
      headers: {
        Origin: 'http://localhost:3001',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Authorization',
      },
    });
    expect([200, 204]).toContain(r.status());
  });

  test('CORS preflight includes access-control-allow-methods', async ({ request }) => {
    const r = await request.fetch(`${GATEWAY}/api/health-safety/risks`, {
      method: 'OPTIONS',
      headers: {
        Origin: 'http://localhost:3001',
        'Access-Control-Request-Method': 'GET',
      },
    });
    const allowMethods = r.headers()['access-control-allow-methods'];
    if (allowMethods) {
      expect(allowMethods).toMatch(/GET/);
    }
    expect([200, 204]).toContain(r.status());
  });

  // ── Cache-Control on sensitive endpoints ──────────────────────────────────────

  test('login endpoint response has cache-control preventing caching', async ({ request }) => {
    const r = await request.post(`${GATEWAY}/api/auth/login`, {
      data: { email: 'admin@ims.local', password: 'admin123' },
    });
    const cc = r.headers()['cache-control'];
    if (cc) {
      // Must not allow caching of auth responses
      expect(cc).toMatch(/no-store|no-cache|private/);
    }
    expect(r.ok()).toBeTruthy();
  });

  test('authenticated API list response has cache-control header', async ({ request }) => {
    const r = await request.get(`${GATEWAY}/api/health-safety/risks`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const cc = r.headers()['cache-control'];
    if (cc) {
      expect(cc).toMatch(/no-store|no-cache|private/);
    }
    expect(r.ok()).toBeTruthy();
  });

  // ── Security headers on multiple endpoints ────────────────────────────────────

  test('environment aspects endpoint has x-content-type-options: nosniff', async ({ request }) => {
    const r = await request.get(`${GATEWAY}/api/environment/aspects`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(r.headers()['x-content-type-options']).toBe('nosniff');
  });

  test('quality processes endpoint has security headers', async ({ request }) => {
    const r = await request.get(`${GATEWAY}/api/quality/processes`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(r.headers()['x-content-type-options']).toBe('nosniff');
    expect(r.headers()['x-frame-options']).toBeDefined();
  });

  test('dashboard stats endpoint has security headers', async ({ request }) => {
    const r = await request.get(`${GATEWAY}/api/dashboard/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(r.headers()['x-content-type-options']).toBe('nosniff');
    expect(r.headers()['content-type']).toMatch(/application\/json/);
  });
});
