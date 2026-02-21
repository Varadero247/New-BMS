import { test, expect, type APIRequestContext } from '@playwright/test';

/**
 * API input validation tests.
 *
 * Verifies that all services correctly reject malformed / incomplete payloads
 * and accept valid ones, and that pagination meta is consistently returned.
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

// ─── Health & Safety — risk validation ───────────────────────────────────────

test.describe('Input Validation — Health & Safety risks', () => {
  let token: string;

  test.beforeAll(async ({ request }) => {
    token = await loginAndGetToken(request);
  });

  test('POST /api/health-safety/risks missing required title → 400 { success: false }', async ({ request }) => {
    const response = await request.post(`${GATEWAY}/api/health-safety/risks`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { riskType: 'OPERATIONAL', likelihood: 1, consequence: 1 },
    });

    expect(response.status()).toBe(400);

    const body = (await response.json()) as { success: boolean; error?: unknown };
    expect(body.success).toBe(false);
    expect(body.error).toBeDefined();
  });

  test('POST /api/health-safety/risks with empty body → 400', async ({ request }) => {
    const response = await request.post(`${GATEWAY}/api/health-safety/risks`, {
      headers: { Authorization: `Bearer ${token}` },
      data: {},
    });

    expect(response.status()).toBe(400);

    const body = (await response.json()) as { success: boolean };
    expect(body.success).toBe(false);
  });

  test('POST /api/health-safety/risks with invalid enum value → 400', async ({ request }) => {
    const response = await request.post(`${GATEWAY}/api/health-safety/risks`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { title: 'Bad Enum Risk', riskType: 'NOT_A_VALID_TYPE', likelihood: 1, consequence: 1 },
    });

    expect(response.status()).toBe(400);

    const body = (await response.json()) as { success: boolean };
    expect(body.success).toBe(false);
  });

  test('POST /api/health-safety/risks with valid data → 201 + resource with id', async ({ request }) => {
    const response = await request.post(`${GATEWAY}/api/health-safety/risks`, {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        title: 'E2E Valid Risk Creation Test',
        riskType: 'OPERATIONAL',
        likelihood: 2,
        consequence: 3,
      },
    });

    expect(response.status()).toBe(201);

    const body = (await response.json()) as { success: boolean; data?: { id?: string } };
    expect(body.success).toBe(true);
    expect(body.data).toBeDefined();
    expect(body.data?.id).toBeDefined();
  });
});

// ─── Environment — aspect validation ─────────────────────────────────────────

test.describe('Input Validation — Environment aspects', () => {
  let token: string;

  test.beforeAll(async ({ request }) => {
    token = await loginAndGetToken(request);
  });

  test('POST /api/environment/aspects with empty body → 400', async ({ request }) => {
    const response = await request.post(`${GATEWAY}/api/environment/aspects`, {
      headers: { Authorization: `Bearer ${token}` },
      data: {},
    });

    expect(response.status()).toBe(400);

    const body = (await response.json()) as { success: boolean };
    expect(body.success).toBe(false);
  });

  test('POST /api/environment/aspects missing title → 400', async ({ request }) => {
    const response = await request.post(`${GATEWAY}/api/environment/aspects`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { aspectType: 'EMISSIONS', impactType: 'AIR_QUALITY' },
    });

    expect(response.status()).toBe(400);

    const body = (await response.json()) as { success: boolean; error?: unknown };
    expect(body.success).toBe(false);
    expect(body.error).toBeDefined();
  });

  test('POST /api/environment/aspects with invalid enum → 400', async ({ request }) => {
    const response = await request.post(`${GATEWAY}/api/environment/aspects`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { title: 'Bad Aspect', aspectType: 'INVALID_ASPECT_TYPE', impactType: 'AIR_QUALITY' },
    });

    expect(response.status()).toBe(400);
  });
});

// ─── Quality — nonconformance validation ─────────────────────────────────────

test.describe('Input Validation — Quality nonconformances', () => {
  let token: string;

  test.beforeAll(async ({ request }) => {
    token = await loginAndGetToken(request);
  });

  test('POST /api/quality/nonconformances with empty body → 400', async ({ request }) => {
    const response = await request.post(`${GATEWAY}/api/quality/nonconformances`, {
      headers: { Authorization: `Bearer ${token}` },
      data: {},
    });

    expect(response.status()).toBe(400);

    const body = (await response.json()) as { success: boolean };
    expect(body.success).toBe(false);
  });

  test('POST /api/quality/nonconformances missing required fields → 400', async ({ request }) => {
    const response = await request.post(`${GATEWAY}/api/quality/nonconformances`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { description: 'Missing title field' },
    });

    expect(response.status()).toBe(400);
  });

  test('POST /api/quality/nonconformances with valid data → 201 + id', async ({ request }) => {
    const response = await request.post(`${GATEWAY}/api/quality/nonconformances`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { title: 'E2E NC Validation Test', description: 'Created by E2E input-validation spec' },
    });

    expect(response.status()).toBe(201);

    const body = (await response.json()) as { success: boolean; data?: { id?: string } };
    expect(body.success).toBe(true);
    expect(body.data?.id).toBeDefined();
  });
});

// ─── Pagination ───────────────────────────────────────────────────────────────

test.describe('Input Validation — Pagination', () => {
  let token: string;

  test.beforeAll(async ({ request }) => {
    token = await loginAndGetToken(request);
  });

  test('GET /api/health-safety/risks?page=1&limit=10 → returns meta.total, meta.page, meta.limit', async ({ request }) => {
    const response = await request.get(`${GATEWAY}/api/health-safety/risks?page=1&limit=10`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(response.status()).toBe(200);

    const body = (await response.json()) as {
      success: boolean;
      meta?: { total?: number; page?: number; limit?: number };
    };
    expect(body.success).toBe(true);
    expect(body.meta).toBeDefined();
    expect(typeof body.meta?.total).toBe('number');
    expect(body.meta?.page).toBe(1);
    expect(body.meta?.limit).toBe(10);
  });

  test('GET with invalid pagination (page=-1) → 200 with defaults or 400', async ({ request }) => {
    const response = await request.get(`${GATEWAY}/api/health-safety/risks?page=-1&limit=0`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // Must not crash the service
    expect([200, 400]).toContain(response.status());
  });

  test('GET /api/environment/aspects?page=1&limit=5 → at most 5 items returned', async ({ request }) => {
    const response = await request.get(`${GATEWAY}/api/environment/aspects?page=1&limit=5`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(response.status()).toBe(200);

    const body = (await response.json()) as { success: boolean; data?: unknown[] };
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
    expect((body.data ?? []).length).toBeLessThanOrEqual(5);
  });
});
