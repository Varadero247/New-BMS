import { test, expect, type APIRequestContext } from '@playwright/test';

/**
 * Complete authentication lifecycle tests.
 *
 * All API-level tests use the `request` fixture and hit the gateway at port 4000.
 * Page-level tests (localStorage) use the `page` fixture and hit the dashboard
 * web app at port 3000.
 *
 * Services must be running for these tests to pass.
 * Start them with: ./scripts/start-all-services.sh
 */

const GATEWAY = 'http://localhost:4000';
const DASHBOARD_URL = 'http://localhost:3000';
const VALID_CREDENTIALS = { email: 'admin@ims.local', password: 'admin123' };

// ─── Helper ───────────────────────────────────────────────────────────────────

async function loginAndGetToken(request: APIRequestContext): Promise<string> {
  const response = await request.post(`${GATEWAY}/api/auth/login`, {
    data: VALID_CREDENTIALS,
  });
  const body = (await response.json()) as { data?: { accessToken?: string } };
  return body.data?.accessToken ?? '';
}

// ─── Login success ────────────────────────────────────────────────────────────

test.describe('Auth — Login success', () => {
  test('valid credentials return HTTP 200 with accessToken', async ({ request }) => {
    const response = await request.post(`${GATEWAY}/api/auth/login`, {
      data: VALID_CREDENTIALS,
    });

    expect(response.status()).toBe(200);

    const body = (await response.json()) as { data?: { accessToken?: string } };
    expect(body.data).toBeDefined();
    expect(typeof body.data?.accessToken).toBe('string');
    expect((body.data?.accessToken ?? '').length).toBeGreaterThan(0);
  });

  test('accessToken has three-part JWT structure (header.payload.signature)', async ({ request }) => {
    const token = await loginAndGetToken(request);

    expect(typeof token).toBe('string');
    const parts = token.split('.');
    expect(parts).toHaveLength(3);

    // Each part must be non-empty base64url
    for (const part of parts) {
      expect(part.length).toBeGreaterThan(0);
      // base64url alphabet: A-Z a-z 0-9 - _ (no + or / or = padding)
      expect(part).toMatch(/^[A-Za-z0-9\-_]+$/);
    }
  });

  test('JWT payload decodes to object with expected claims', async ({ request }) => {
    const token = await loginAndGetToken(request);
    const parts = token.split('.');

    // Decode the payload (second part): base64url → JSON
    const paddedPayload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const jsonStr = Buffer.from(paddedPayload, 'base64').toString('utf-8');
    const payload = JSON.parse(jsonStr) as Record<string, unknown>;

    // Standard JWT claims must be present
    expect(payload).toHaveProperty('sub');  // subject (user id or email)
    expect(payload).toHaveProperty('exp');  // expiry timestamp
    expect(payload).toHaveProperty('iat');  // issued-at timestamp

    const exp = payload['exp'] as number;
    const iat = payload['iat'] as number;

    // Token must not already be expired
    expect(exp).toBeGreaterThan(Date.now() / 1000);
    // Issued-at must be in the past or very close to now
    expect(iat).toBeLessThanOrEqual(Math.ceil(Date.now() / 1000) + 5);
  });

  test('concurrent login requests both succeed independently', async ({ request }) => {
    const [res1, res2] = await Promise.all([
      request.post(`${GATEWAY}/api/auth/login`, { data: VALID_CREDENTIALS }),
      request.post(`${GATEWAY}/api/auth/login`, { data: VALID_CREDENTIALS }),
    ]);

    expect(res1.status()).toBe(200);
    expect(res2.status()).toBe(200);

    const body1 = (await res1.json()) as { data?: { accessToken?: string } };
    const body2 = (await res2.json()) as { data?: { accessToken?: string } };

    expect(typeof body1.data?.accessToken).toBe('string');
    expect(typeof body2.data?.accessToken).toBe('string');

    // Both tokens must be valid 3-part JWTs
    expect((body1.data?.accessToken ?? '').split('.')).toHaveLength(3);
    expect((body2.data?.accessToken ?? '').split('.')).toHaveLength(3);
  });
});

// ─── Login failure ────────────────────────────────────────────────────────────

test.describe('Auth — Login failure', () => {
  test('invalid email returns 401', async ({ request }) => {
    const response = await request.post(`${GATEWAY}/api/auth/login`, {
      data: { email: 'nonexistent@ims.local', password: 'admin123' },
    });

    expect(response.status()).toBe(401);

    const body = (await response.json()) as { success: boolean; error?: unknown };
    expect(body.success).toBe(false);
    expect(body.error).toBeDefined();
  });

  test('wrong password returns 401', async ({ request }) => {
    const response = await request.post(`${GATEWAY}/api/auth/login`, {
      data: { email: VALID_CREDENTIALS.email, password: 'wrongpassword' },
    });

    expect(response.status()).toBe(401);

    const body = (await response.json()) as { success: boolean };
    expect(body.success).toBe(false);
  });

  test('missing email field returns 400 or 401', async ({ request }) => {
    const response = await request.post(`${GATEWAY}/api/auth/login`, {
      data: { password: 'admin123' },
    });

    // Either 400 (validation) or 401 (auth failure) or 422 (unprocessable) is acceptable
    expect([400, 401, 422]).toContain(response.status());

    const body = (await response.json()) as { success: boolean };
    expect(body.success).toBe(false);
  });

  test('empty body returns 400 or 401', async ({ request }) => {
    const response = await request.post(`${GATEWAY}/api/auth/login`, {
      data: {},
    });

    expect([400, 401, 422]).toContain(response.status());
  });
});

// ─── Protected endpoint access ────────────────────────────────────────────────

test.describe('Auth — Protected endpoint access', () => {
  test('request without Authorization header returns 401', async ({ request }) => {
    const response = await request.get(`${GATEWAY}/api/health-safety/risks`);

    expect(response.status()).toBe(401);

    const body = (await response.json()) as { success: boolean; error?: unknown };
    expect(body.success).toBe(false);
  });

  test('request with malformed Bearer token returns 401', async ({ request }) => {
    const response = await request.get(`${GATEWAY}/api/health-safety/risks`, {
      headers: { Authorization: 'Bearer this-is-not-a-valid-jwt' },
    });

    expect(response.status()).toBe(401);

    const body = (await response.json()) as { success: boolean };
    expect(body.success).toBe(false);
  });

  test('request with tampered JWT signature returns 401', async ({ request }) => {
    const token = await loginAndGetToken(request);
    // Replace the signature (3rd part) with garbage to invalidate it
    const [header, payload] = token.split('.');
    const tampered = `${header}.${payload}.invalidsignatureXXXX`;

    const response = await request.get(`${GATEWAY}/api/health-safety/risks`, {
      headers: { Authorization: `Bearer ${tampered}` },
    });

    expect(response.status()).toBe(401);
  });

  test('request with manually built expired JWT returns 401', async ({ request }) => {
    // Construct a JWT-shaped string with a past `exp` claim
    const header  = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const payload = Buffer.from(JSON.stringify({ sub: 'test', exp: 1 })).toString('base64url');
    const fakeToken = `${header}.${payload}.fakesig`;

    const response = await request.get(`${GATEWAY}/api/health-safety/risks`, {
      headers: { Authorization: `Bearer ${fakeToken}` },
    });

    expect(response.status()).toBe(401);
  });

  test('valid token grants access to health-safety risks — returns 200', async ({ request }) => {
    const token = await loginAndGetToken(request);

    const response = await request.get(`${GATEWAY}/api/health-safety/risks`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(response.status()).toBe(200);

    const body = (await response.json()) as { success: boolean; data: unknown };
    expect(body.success).toBe(true);
    expect(body.data).toBeDefined();
  });

  test('valid token grants access to inventory items endpoint — returns 200', async ({ request }) => {
    const token = await loginAndGetToken(request);

    const response = await request.get(`${GATEWAY}/api/inventory/items`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(response.status()).toBe(200);

    const body = (await response.json()) as { success: boolean };
    expect(body.success).toBe(true);
  });

  test('valid token grants access to dashboard stats endpoint — returns 200', async ({ request }) => {
    const token = await loginAndGetToken(request);

    const response = await request.get(`${GATEWAY}/api/dashboard/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(response.status()).toBe(200);

    const body = (await response.json()) as { data: unknown };
    expect(body.data).toBeDefined();
  });
});

// ─── Logout flow ──────────────────────────────────────────────────────────────

test.describe('Auth — Logout flow', () => {
  test('POST /api/auth/logout with valid token returns 200 or 204', async ({ request }) => {
    const token = await loginAndGetToken(request);

    const response = await request.post(`${GATEWAY}/api/auth/logout`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // 200 (with body) or 204 (no content) are both valid logout responses
    expect([200, 204]).toContain(response.status());
  });

  test('DELETE /api/auth/logout with valid token succeeds if endpoint exists', async ({ request }) => {
    const token = await loginAndGetToken(request);

    const response = await request.delete(`${GATEWAY}/api/auth/logout`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // 200/204 = logout succeeded; 404/405 = not implemented as DELETE — all acceptable
    expect([200, 204, 404, 405]).toContain(response.status());
  });

  test('logout without Authorization header returns 401', async ({ request }) => {
    const response = await request.post(`${GATEWAY}/api/auth/logout`);

    expect([401, 403]).toContain(response.status());
  });
});

// ─── Page-based localStorage tests ───────────────────────────────────────────

test.describe('Auth — Browser session (localStorage)', () => {
  test('token is stored in localStorage after successful login via UI', async ({ page }) => {
    await page.goto(DASHBOARD_URL);

    // Fill in the login form — selectors cover common input patterns
    await page.fill('input[type="email"], input[name="email"]', VALID_CREDENTIALS.email);
    await page.fill('input[type="password"], input[name="password"]', VALID_CREDENTIALS.password);
    await page.click('button[type="submit"]');

    // Wait for navigation or a post-login element to appear
    await page.waitForTimeout(2_000);

    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).toBeTruthy();
    expect(typeof token).toBe('string');

    // Must be a valid 3-part JWT
    if (token) {
      expect(token.split('.')).toHaveLength(3);
    }
  });

  test('localStorage token can be used to call API directly', async ({ page }) => {
    // Login via API to obtain a token, then inject it into localStorage
    const response = await page.request.post(`${GATEWAY}/api/auth/login`, {
      data: VALID_CREDENTIALS,
    });
    const body = (await response.json()) as { data?: { accessToken?: string } };
    const token = body.data?.accessToken ?? '';

    await page.goto(DASHBOARD_URL);
    await page.evaluate((t) => localStorage.setItem('token', t), token);
    await page.reload();

    // Use the token directly against the API
    const apiResponse = await page.request.get(`${GATEWAY}/api/health-safety/risks`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(apiResponse.status()).toBe(200);
    const apiBody = (await apiResponse.json()) as { success: boolean };
    expect(apiBody.success).toBe(true);
  });
});
