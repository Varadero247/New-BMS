import { test, expect, type APIRequestContext } from '@playwright/test';

/**
 * Notification system tests.
 *
 * The gateway handles /api/notifications/* locally (port 4000).
 * Tests verify listing, unread count, mark-as-read, and auth enforcement.
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

// ─── Auth enforcement ─────────────────────────────────────────────────────────

test.describe('Notifications — Authentication', () => {
  test('GET /api/notifications without token → 401', async ({ request }) => {
    const response = await request.get(`${GATEWAY}/api/notifications`);

    expect(response.status()).toBe(401);

    const body = (await response.json()) as { success: boolean };
    expect(body.success).toBe(false);
  });

  test('GET /api/notifications/unread-count without token → 401', async ({ request }) => {
    const response = await request.get(`${GATEWAY}/api/notifications/unread-count`);

    expect(response.status()).toBe(401);

    const body = (await response.json()) as { success: boolean };
    expect(body.success).toBe(false);
  });

  test('POST /api/notifications/mark-all-read without token → 401', async ({ request }) => {
    const response = await request.post(`${GATEWAY}/api/notifications/mark-all-read`);

    expect(response.status()).toBe(401);
  });
});

// ─── List notifications ───────────────────────────────────────────────────────

test.describe('Notifications — Listing', () => {
  let token: string;

  test.beforeAll(async ({ request }) => {
    token = await loginAndGetToken(request);
  });

  test('GET /api/notifications → 200 { success: true, data: array }', async ({ request }) => {
    const response = await request.get(`${GATEWAY}/api/notifications`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(response.status()).toBe(200);

    const body = (await response.json()) as { success: boolean; data?: unknown };
    expect(body.success).toBe(true);
    expect(body.data).toBeDefined();
    expect(Array.isArray(body.data)).toBe(true);
  });

  test('GET /api/notifications items have expected shape if any exist', async ({ request }) => {
    const response = await request.get(`${GATEWAY}/api/notifications`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(response.status()).toBe(200);

    const body = (await response.json()) as {
      success: boolean;
      data?: Array<{ id?: string; read?: boolean }>;
    };
    expect(body.success).toBe(true);

    const items = body.data ?? [];
    // If there are notifications, check they have the required fields
    if (items.length > 0) {
      const first = items[0];
      expect(first).toHaveProperty('id');
      expect(typeof first.read).toBe('boolean');
    }
  });

  test('GET /api/notifications?page=1&limit=10 → returns up to 10 items', async ({ request }) => {
    const response = await request.get(`${GATEWAY}/api/notifications?page=1&limit=10`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(response.status()).toBe(200);

    const body = (await response.json()) as { success: boolean; data?: unknown[] };
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
    expect((body.data ?? []).length).toBeLessThanOrEqual(10);
  });
});

// ─── Unread count ─────────────────────────────────────────────────────────────

test.describe('Notifications — Unread count', () => {
  let token: string;

  test.beforeAll(async ({ request }) => {
    token = await loginAndGetToken(request);
  });

  test('GET /api/notifications/unread-count → 200 { success: true, data: { count: N } }', async ({ request }) => {
    const response = await request.get(`${GATEWAY}/api/notifications/unread-count`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(response.status()).toBe(200);

    const body = (await response.json()) as {
      success: boolean;
      data?: { count?: number };
    };
    expect(body.success).toBe(true);
    expect(body.data).toBeDefined();
    expect(typeof body.data?.count).toBe('number');
    expect((body.data?.count ?? -1)).toBeGreaterThanOrEqual(0);
  });

  test('unread count is consistent with notifications list', async ({ request }) => {
    const [listRes, countRes] = await Promise.all([
      request.get(`${GATEWAY}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      request.get(`${GATEWAY}/api/notifications/unread-count`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);

    expect(listRes.status()).toBe(200);
    expect(countRes.status()).toBe(200);

    const listBody = (await listRes.json()) as { data?: Array<{ read?: boolean }> };
    const countBody = (await countRes.json()) as { data?: { count?: number } };

    const unreadInList = (listBody.data ?? []).filter((n) => n.read === false).length;
    const reportedCount = countBody.data?.count ?? 0;

    // The reported unread count should be >= unread items on first page
    // (there may be more unread on subsequent pages, so we check >=)
    expect(reportedCount).toBeGreaterThanOrEqual(unreadInList);
  });
});

// ─── Mark as read ─────────────────────────────────────────────────────────────

test.describe('Notifications — Mark as read', () => {
  let token: string;

  test.beforeAll(async ({ request }) => {
    token = await loginAndGetToken(request);
  });

  test('POST /api/notifications/mark-all-read → 200', async ({ request }) => {
    const response = await request.post(`${GATEWAY}/api/notifications/mark-all-read`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(response.status()).toBe(200);

    const body = (await response.json()) as { success: boolean };
    expect(body.success).toBe(true);
  });

  test('PATCH /api/notifications/:id/read → 200 or 404 when no notification exists', async ({ request }) => {
    // Use a UUID that is unlikely to exist
    const fakeId = '00000000-0000-0000-0000-000000000001';
    const response = await request.patch(`${GATEWAY}/api/notifications/${fakeId}/read`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // 200 = marked (if by chance it exists); 404 = not found — both are valid
    expect([200, 404]).toContain(response.status());
  });

  test('after mark-all-read, unread count is 0', async ({ request }) => {
    await request.post(`${GATEWAY}/api/notifications/mark-all-read`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const countRes = await request.get(`${GATEWAY}/api/notifications/unread-count`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(countRes.status()).toBe(200);

    const body = (await countRes.json()) as { data?: { count?: number } };
    expect(body.data?.count).toBe(0);
  });
});
