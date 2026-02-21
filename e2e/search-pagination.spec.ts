import { test, expect, type APIRequestContext } from '@playwright/test';

/**
 * Search and pagination tests across multiple modules.
 *
 * Verifies that pagination meta (total, page, limit, totalPages) is returned
 * consistently, that page size is respected, that edge-case values are handled
 * gracefully, and that filtering/search parameters narrow results correctly.
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

// ─── Basic pagination ─────────────────────────────────────────────────────────

test.describe('Search & Pagination — Basic page + limit', () => {
  let token: string;

  test.beforeAll(async ({ request }) => {
    token = await loginAndGetToken(request);
  });

  test('GET /api/health-safety/risks?page=1&limit=5 → ≤5 items + meta.total', async ({ request }) => {
    const response = await request.get(`${GATEWAY}/api/health-safety/risks?page=1&limit=5`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(response.status()).toBe(200);

    const body = (await response.json()) as {
      success: boolean;
      data?: unknown[];
      meta?: { total?: number; page?: number; limit?: number };
    };
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
    expect((body.data ?? []).length).toBeLessThanOrEqual(5);
    expect(typeof body.meta?.total).toBe('number');
    expect(body.meta?.page).toBe(1);
    expect(body.meta?.limit).toBe(5);
  });

  test('GET /api/quality/processes?page=1&limit=10 → returns meta shape', async ({ request }) => {
    const response = await request.get(`${GATEWAY}/api/quality/processes?page=1&limit=10`, {
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

  test('GET /api/environment/aspects?page=1&limit=5 → at most 5 items', async ({ request }) => {
    const response = await request.get(`${GATEWAY}/api/environment/aspects?page=1&limit=5`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(response.status()).toBe(200);

    const body = (await response.json()) as { success: boolean; data?: unknown[] };
    expect(body.success).toBe(true);
    expect((body.data ?? []).length).toBeLessThanOrEqual(5);
  });

  test('GET /api/inventory/items?limit=100 → no server error', async ({ request }) => {
    const response = await request.get(`${GATEWAY}/api/inventory/items?limit=100`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // Must not crash — 200 or 400 (if limit too high) are both fine
    expect([200, 400]).toContain(response.status());
    expect(response.status()).not.toBe(500);
  });
});

// ─── Page 2 navigation ────────────────────────────────────────────────────────

test.describe('Search & Pagination — Page 2', () => {
  let token: string;

  test.beforeAll(async ({ request }) => {
    token = await loginAndGetToken(request);
  });

  test('GET /api/environment/aspects?page=2&limit=5 — page 2 items differ from page 1', async ({ request }) => {
    const [page1Res, page2Res] = await Promise.all([
      request.get(`${GATEWAY}/api/environment/aspects?page=1&limit=5`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      request.get(`${GATEWAY}/api/environment/aspects?page=2&limit=5`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);

    expect(page1Res.status()).toBe(200);
    expect(page2Res.status()).toBe(200);

    const page1 = (await page1Res.json()) as { meta?: { total?: number }; data?: Array<{ id?: string }> };
    const page2 = (await page2Res.json()) as { data?: Array<{ id?: string }> };

    const total = page1.meta?.total ?? 0;
    if (total > 5) {
      // Page 2 must not be empty if there are more than 5 items
      expect((page2.data ?? []).length).toBeGreaterThan(0);

      // IDs on page 2 must not overlap with page 1
      const page1Ids = new Set((page1.data ?? []).map((item) => item.id));
      const page2Ids = (page2.data ?? []).map((item) => item.id);
      for (const id of page2Ids) {
        expect(page1Ids.has(id)).toBe(false);
      }
    } else {
      // Fewer than 6 total items — page 2 should be empty or 200 with []
      expect((page2.data ?? []).length).toBe(0);
    }
  });

  test('GET /api/health-safety/risks — pages together cover total items', async ({ request }) => {
    const page1Res = await request.get(`${GATEWAY}/api/health-safety/risks?page=1&limit=5`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(page1Res.status()).toBe(200);

    const page1 = (await page1Res.json()) as {
      data?: unknown[];
      meta?: { total?: number };
    };
    const total = page1.meta?.total ?? 0;
    const page1Count = (page1.data ?? []).length;

    if (total <= 5) {
      // All items fit on page 1
      expect(page1Count).toBe(total);
    } else {
      // Page 1 must be full (5 items)
      expect(page1Count).toBe(5);
    }
  });
});

// ─── Filter / search parameters ──────────────────────────────────────────────

test.describe('Search & Pagination — Filtering', () => {
  let token: string;

  test.beforeAll(async ({ request }) => {
    token = await loginAndGetToken(request);
  });

  test('GET /api/quality/nonconformances?status=OPEN — returns only OPEN records if any', async ({ request }) => {
    const response = await request.get(`${GATEWAY}/api/quality/nonconformances?status=OPEN`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(response.status()).toBe(200);

    const body = (await response.json()) as {
      success: boolean;
      data?: Array<{ status?: string }>;
    };
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);

    // Every returned item must have status OPEN
    for (const item of body.data ?? []) {
      expect(item.status).toBe('OPEN');
    }
  });

  test('GET /api/hr/employees?search=admin — returns filtered results (0 or more)', async ({ request }) => {
    const response = await request.get(`${GATEWAY}/api/hr/employees?search=admin`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // Filter returning no matches is still 200
    expect([200, 400]).toContain(response.status());
    if (response.status() === 200) {
      const body = (await response.json()) as { success: boolean; data?: unknown[] };
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
    }
  });

  test('GET /api/risk/risks?sortBy=createdAt&order=desc — does not error', async ({ request }) => {
    const response = await request.get(`${GATEWAY}/api/risk/risks?sortBy=createdAt&order=desc`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect([200, 400]).toContain(response.status());
    expect(response.status()).not.toBe(500);
  });
});

// ─── Edge-case page/limit values ─────────────────────────────────────────────

test.describe('Search & Pagination — Edge cases', () => {
  let token: string;

  test.beforeAll(async ({ request }) => {
    token = await loginAndGetToken(request);
  });

  test('limit=0 — returns 200 with default page size or 400', async ({ request }) => {
    const response = await request.get(`${GATEWAY}/api/health-safety/risks?limit=0`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect([200, 400]).toContain(response.status());
    expect(response.status()).not.toBe(500);
  });

  test('limit=-1 — handled gracefully (not 500)', async ({ request }) => {
    const response = await request.get(`${GATEWAY}/api/environment/aspects?limit=-1`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect([200, 400]).toContain(response.status());
    expect(response.status()).not.toBe(500);
  });

  test('page=9999 beyond total — returns empty data array (not 500)', async ({ request }) => {
    const response = await request.get(`${GATEWAY}/api/health-safety/risks?page=9999&limit=10`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect([200, 404]).toContain(response.status());
    expect(response.status()).not.toBe(500);

    if (response.status() === 200) {
      const body = (await response.json()) as { data?: unknown[] };
      // Far-out page should return empty results
      expect((body.data ?? []).length).toBe(0);
    }
  });

  test('meta.totalPages is consistent with total and limit', async ({ request }) => {
    const response = await request.get(`${GATEWAY}/api/health-safety/risks?page=1&limit=5`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(response.status()).toBe(200);

    const body = (await response.json()) as {
      meta?: { total?: number; limit?: number; totalPages?: number };
    };
    const { total = 0, limit = 5, totalPages } = body.meta ?? {};

    if (totalPages !== undefined) {
      const expectedPages = Math.ceil(total / limit);
      expect(totalPages).toBe(expectedPages);
    }
  });
});
