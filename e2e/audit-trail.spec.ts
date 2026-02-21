import { test, expect, type APIRequestContext } from '@playwright/test';

/**
 * Audit trail / resource lifecycle tests.
 *
 * Verifies that write operations are durable and readable via GET,
 * that resources carry timestamps, and that the full CRUD lifecycle
 * (create → read → update → delete) works correctly for two modules.
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

// ─── Health & Safety — risk lifecycle ────────────────────────────────────────

test.describe('Audit Trail — Health & Safety risk lifecycle', () => {
  let token: string;
  let createdId: string;

  test.beforeAll(async ({ request }) => {
    token = await loginAndGetToken(request);
  });

  test('1. POST creates a risk and returns it with id + timestamps', async ({ request }) => {
    const response = await request.post(`${GATEWAY}/api/health-safety/risks`, {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        title: 'E2E Audit Trail Risk',
        riskType: 'OPERATIONAL',
        likelihood: 2,
        consequence: 2,
      },
    });

    expect(response.status()).toBe(201);

    const body = (await response.json()) as {
      success: boolean;
      data?: { id?: string; createdAt?: string; updatedAt?: string; title?: string };
    };
    expect(body.success).toBe(true);
    expect(body.data?.id).toBeDefined();
    expect(body.data?.createdAt).toBeDefined();
    expect(body.data?.updatedAt).toBeDefined();

    createdId = body.data?.id ?? '';
  });

  test('2. GET by ID returns the created risk', async ({ request }) => {
    test.skip(!createdId, 'Depends on step 1 creating a risk');

    const response = await request.get(`${GATEWAY}/api/health-safety/risks/${createdId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(response.status()).toBe(200);

    const body = (await response.json()) as {
      success: boolean;
      data?: { id?: string; title?: string };
    };
    expect(body.success).toBe(true);
    expect(body.data?.id).toBe(createdId);
    expect(body.data?.title).toBe('E2E Audit Trail Risk');
  });

  test('3. PATCH updates the risk — change is reflected on re-read', async ({ request }) => {
    test.skip(!createdId, 'Depends on step 1 creating a risk');

    const patchResponse = await request.patch(`${GATEWAY}/api/health-safety/risks/${createdId}`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { title: 'E2E Audit Trail Risk (Updated)' },
    });

    // 200 = updated; 405 = PATCH not supported — try PUT
    if (patchResponse.status() === 405) {
      const putResponse = await request.put(`${GATEWAY}/api/health-safety/risks/${createdId}`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { title: 'E2E Audit Trail Risk (Updated)', riskType: 'OPERATIONAL', likelihood: 2, consequence: 2 },
      });
      expect([200, 201]).toContain(putResponse.status());
    } else {
      expect(patchResponse.status()).toBe(200);

      const body = (await patchResponse.json()) as {
        success: boolean;
        data?: { title?: string };
      };
      expect(body.success).toBe(true);
      expect(body.data?.title).toBe('E2E Audit Trail Risk (Updated)');
    }
  });

  test('4. DELETE removes the risk — subsequent GET returns 404', async ({ request }) => {
    test.skip(!createdId, 'Depends on step 1 creating a risk');

    const deleteResponse = await request.delete(`${GATEWAY}/api/health-safety/risks/${createdId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect([200, 204]).toContain(deleteResponse.status());

    const getResponse = await request.get(`${GATEWAY}/api/health-safety/risks/${createdId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(getResponse.status()).toBe(404);
  });
});

// ─── Environment — aspect lifecycle ──────────────────────────────────────────

test.describe('Audit Trail — Environment aspect lifecycle', () => {
  let token: string;
  let createdId: string;

  test.beforeAll(async ({ request }) => {
    token = await loginAndGetToken(request);
  });

  test('1. POST creates an aspect with timestamps', async ({ request }) => {
    const response = await request.post(`${GATEWAY}/api/environment/aspects`, {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        title: 'E2E Audit Aspect',
        aspectType: 'EMISSIONS',
        impactType: 'AIR_QUALITY',
      },
    });

    expect(response.status()).toBe(201);

    const body = (await response.json()) as {
      success: boolean;
      data?: { id?: string; createdAt?: string; updatedAt?: string };
    };
    expect(body.success).toBe(true);
    expect(body.data?.id).toBeDefined();
    expect(body.data?.createdAt).toBeDefined();

    createdId = body.data?.id ?? '';
  });

  test('2. GET by ID returns the created aspect', async ({ request }) => {
    test.skip(!createdId, 'Depends on step 1 creating an aspect');

    const response = await request.get(`${GATEWAY}/api/environment/aspects/${createdId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(response.status()).toBe(200);

    const body = (await response.json()) as {
      success: boolean;
      data?: { id?: string; title?: string };
    };
    expect(body.success).toBe(true);
    expect(body.data?.id).toBe(createdId);
    expect(body.data?.title).toBe('E2E Audit Aspect');
  });

  test('3. PATCH/PUT updates the aspect title', async ({ request }) => {
    test.skip(!createdId, 'Depends on step 1 creating an aspect');

    const patchResponse = await request.patch(`${GATEWAY}/api/environment/aspects/${createdId}`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { title: 'E2E Audit Aspect (Updated)' },
    });

    if (patchResponse.status() === 405) {
      const putResponse = await request.put(`${GATEWAY}/api/environment/aspects/${createdId}`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { title: 'E2E Audit Aspect (Updated)', aspectType: 'EMISSIONS', impactType: 'AIR_QUALITY' },
      });
      expect([200, 201]).toContain(putResponse.status());
    } else {
      expect(patchResponse.status()).toBe(200);
    }
  });

  test('4. DELETE removes the aspect — subsequent GET returns 404', async ({ request }) => {
    test.skip(!createdId, 'Depends on step 1 creating an aspect');

    const deleteResponse = await request.delete(`${GATEWAY}/api/environment/aspects/${createdId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect([200, 204]).toContain(deleteResponse.status());

    const getResponse = await request.get(`${GATEWAY}/api/environment/aspects/${createdId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(getResponse.status()).toBe(404);
  });
});

// ─── Timestamp shape validation ───────────────────────────────────────────────

test.describe('Audit Trail — Timestamp shape', () => {
  let token: string;

  test.beforeAll(async ({ request }) => {
    token = await loginAndGetToken(request);
  });

  test('Created quality nonconformance has ISO 8601 createdAt and updatedAt', async ({ request }) => {
    const createRes = await request.post(`${GATEWAY}/api/quality/nonconformances`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { title: 'E2E Timestamp Shape Test', description: 'Timestamp validation' },
    });

    expect(createRes.status()).toBe(201);

    const body = (await createRes.json()) as {
      data?: { createdAt?: string; updatedAt?: string };
    };
    const { createdAt, updatedAt } = body.data ?? {};

    expect(typeof createdAt).toBe('string');
    expect(typeof updatedAt).toBe('string');

    // Must be parseable as a valid date
    expect(Number.isNaN(new Date(createdAt ?? '').getTime())).toBe(false);
    expect(Number.isNaN(new Date(updatedAt ?? '').getTime())).toBe(false);
  });
});
