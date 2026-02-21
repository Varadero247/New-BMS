import { test, expect } from '@playwright/test';

const GATEWAY = 'http://localhost:4000';

test.describe('Performance SLAs', () => {
  let token: string;

  test.beforeAll(async ({ request }) => {
    const r = await request.post(`${GATEWAY}/api/auth/login`, {
      data: { email: 'admin@ims.local', password: 'admin123' },
    });
    token = (await r.json()).data?.accessToken;
  });

  // ── Health checks ─────────────────────────────────────────────────────────────

  test('gateway /health responds within 200ms', async ({ request }) => {
    const start = Date.now();
    const r = await request.get(`${GATEWAY}/health`);
    const elapsed = Date.now() - start;
    expect(r.ok()).toBeTruthy();
    expect(elapsed).toBeLessThan(200);
  });

  test('H&S service health responds within 200ms', async ({ request }) => {
    const start = Date.now();
    const r = await request.get('http://localhost:4001/health');
    const elapsed = Date.now() - start;
    expect(r.ok()).toBeTruthy();
    expect(elapsed).toBeLessThan(200);
  });

  test('Environment service health responds within 200ms', async ({ request }) => {
    const start = Date.now();
    const r = await request.get('http://localhost:4002/health');
    const elapsed = Date.now() - start;
    expect(r.ok()).toBeTruthy();
    expect(elapsed).toBeLessThan(200);
  });

  test('Quality service health responds within 200ms', async ({ request }) => {
    const start = Date.now();
    const r = await request.get('http://localhost:4003/health');
    const elapsed = Date.now() - start;
    expect(r.ok()).toBeTruthy();
    expect(elapsed).toBeLessThan(200);
  });

  test('Inventory service health responds within 200ms', async ({ request }) => {
    const start = Date.now();
    const r = await request.get('http://localhost:4005/health');
    const elapsed = Date.now() - start;
    expect(r.ok()).toBeTruthy();
    expect(elapsed).toBeLessThan(200);
  });

  // ── Auth ──────────────────────────────────────────────────────────────────────

  test('login endpoint responds within 500ms', async ({ request }) => {
    const start = Date.now();
    const r = await request.post(`${GATEWAY}/api/auth/login`, {
      data: { email: 'admin@ims.local', password: 'admin123' },
    });
    const elapsed = Date.now() - start;
    expect(r.ok()).toBeTruthy();
    expect(elapsed).toBeLessThan(500);
  });

  // ── List endpoints ────────────────────────────────────────────────────────────

  test('GET /api/health-safety/risks responds within 1000ms', async ({ request }) => {
    const start = Date.now();
    const r = await request.get(`${GATEWAY}/api/health-safety/risks`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const elapsed = Date.now() - start;
    expect(r.ok()).toBeTruthy();
    expect(elapsed).toBeLessThan(1000);
  });

  test('GET /api/environment/aspects responds within 1000ms', async ({ request }) => {
    const start = Date.now();
    const r = await request.get(`${GATEWAY}/api/environment/aspects`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const elapsed = Date.now() - start;
    expect(r.ok()).toBeTruthy();
    expect(elapsed).toBeLessThan(1000);
  });

  test('GET /api/quality/processes responds within 1000ms', async ({ request }) => {
    const start = Date.now();
    const r = await request.get(`${GATEWAY}/api/quality/processes`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const elapsed = Date.now() - start;
    expect(r.ok()).toBeTruthy();
    expect(elapsed).toBeLessThan(1000);
  });

  test('GET /api/inventory/items responds within 1000ms', async ({ request }) => {
    const start = Date.now();
    const r = await request.get(`${GATEWAY}/api/inventory/items`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const elapsed = Date.now() - start;
    expect(r.ok()).toBeTruthy();
    expect(elapsed).toBeLessThan(1000);
  });

  test('GET /api/hr/employees responds within 1000ms', async ({ request }) => {
    const start = Date.now();
    const r = await request.get(`${GATEWAY}/api/hr/employees`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const elapsed = Date.now() - start;
    expect(r.ok()).toBeTruthy();
    expect(elapsed).toBeLessThan(1000);
  });

  // ── Metrics ───────────────────────────────────────────────────────────────────

  test('gateway /metrics endpoint responds within 500ms', async ({ request }) => {
    const start = Date.now();
    const r = await request.get(`${GATEWAY}/metrics`);
    const elapsed = Date.now() - start;
    // Metrics may require auth or not — the important thing is it responds fast
    expect([200, 401, 403]).toContain(r.status());
    expect(elapsed).toBeLessThan(500);
  });

  // ── Dashboard ─────────────────────────────────────────────────────────────────

  test('GET /api/dashboard/stats responds within 1000ms', async ({ request }) => {
    const start = Date.now();
    const r = await request.get(`${GATEWAY}/api/dashboard/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const elapsed = Date.now() - start;
    expect(r.ok()).toBeTruthy();
    expect(elapsed).toBeLessThan(1000);
  });

  // ── POST operations ───────────────────────────────────────────────────────────

  test('POST /api/health-safety/risks responds within 1000ms', async ({ request }) => {
    const start = Date.now();
    const r = await request.post(`${GATEWAY}/api/health-safety/risks`, {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        title: 'SLA Test Risk',
        description: 'Performance SLA test risk',
        category: 'PHYSICAL',
        likelihood: 2,
        severity: 2,
        status: 'OPEN',
      },
    });
    const elapsed = Date.now() - start;
    // Accept success or validation error — both are fast responses
    expect([200, 201, 400, 422]).toContain(r.status());
    expect(elapsed).toBeLessThan(1000);
  });

  test('POST /api/environment/aspects responds within 1000ms', async ({ request }) => {
    const start = Date.now();
    const r = await request.post(`${GATEWAY}/api/environment/aspects`, {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        title: 'SLA Test Aspect',
        activity: 'Performance testing',
        aspectType: 'EMISSIONS',
        impactType: 'AIR_POLLUTION',
        severity: 2,
        probability: 2,
        duration: 1,
        extent: 1,
        reversibility: 1,
        regulatory: 1,
        stakeholder: 1,
        condition: 'NORMAL',
        status: 'ACTIVE',
      },
    });
    const elapsed = Date.now() - start;
    expect([200, 201, 400, 422]).toContain(r.status());
    expect(elapsed).toBeLessThan(1000);
  });

  // ── Pagination with large page numbers ────────────────────────────────────────

  test('GET /api/health-safety/risks?page=100 responds within 1000ms', async ({ request }) => {
    const start = Date.now();
    const r = await request.get(`${GATEWAY}/api/health-safety/risks?page=100&limit=10`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const elapsed = Date.now() - start;
    expect(r.ok()).toBeTruthy();
    expect(elapsed).toBeLessThan(1000);
  });

  test('GET /api/environment/aspects?page=100 responds within 1000ms', async ({ request }) => {
    const start = Date.now();
    const r = await request.get(`${GATEWAY}/api/environment/aspects?page=100&limit=10`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const elapsed = Date.now() - start;
    expect(r.ok()).toBeTruthy();
    expect(elapsed).toBeLessThan(1000);
  });

  test('GET /api/quality/processes?page=100 responds within 1000ms', async ({ request }) => {
    const start = Date.now();
    const r = await request.get(`${GATEWAY}/api/quality/processes?page=100&limit=10`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const elapsed = Date.now() - start;
    expect(r.ok()).toBeTruthy();
    expect(elapsed).toBeLessThan(1000);
  });

  // ── Additional module endpoints ────────────────────────────────────────────────

  test('GET /api/workflows/workflows responds within 1000ms', async ({ request }) => {
    const start = Date.now();
    const r = await request.get(`${GATEWAY}/api/workflows/workflows`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const elapsed = Date.now() - start;
    expect(r.ok()).toBeTruthy();
    expect(elapsed).toBeLessThan(1000);
  });

  test('GET /api/crm/contacts responds within 1000ms', async ({ request }) => {
    const start = Date.now();
    const r = await request.get(`${GATEWAY}/api/crm/contacts`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const elapsed = Date.now() - start;
    expect(r.ok()).toBeTruthy();
    expect(elapsed).toBeLessThan(1000);
  });

  test('GET /api/medical/devices responds within 1000ms', async ({ request }) => {
    const start = Date.now();
    const r = await request.get(`${GATEWAY}/api/medical/devices`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const elapsed = Date.now() - start;
    expect(r.ok()).toBeTruthy();
    expect(elapsed).toBeLessThan(1000);
  });

  test('GET /api/automotive/vehicles responds within 1000ms', async ({ request }) => {
    const start = Date.now();
    const r = await request.get(`${GATEWAY}/api/automotive/vehicles`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const elapsed = Date.now() - start;
    expect(r.ok()).toBeTruthy();
    expect(elapsed).toBeLessThan(1000);
  });

  test('GET /api/food-safety/hazards responds within 1000ms', async ({ request }) => {
    const start = Date.now();
    const r = await request.get(`${GATEWAY}/api/food-safety/hazards`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const elapsed = Date.now() - start;
    expect(r.ok()).toBeTruthy();
    expect(elapsed).toBeLessThan(1000);
  });

  test('GET /api/energy/meters responds within 1000ms', async ({ request }) => {
    const start = Date.now();
    const r = await request.get(`${GATEWAY}/api/energy/meters`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const elapsed = Date.now() - start;
    expect(r.ok()).toBeTruthy();
    expect(elapsed).toBeLessThan(1000);
  });

  test('GET /api/marketing/campaigns responds within 1000ms', async ({ request }) => {
    const start = Date.now();
    const r = await request.get(`${GATEWAY}/api/marketing/campaigns`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const elapsed = Date.now() - start;
    expect(r.ok()).toBeTruthy();
    expect(elapsed).toBeLessThan(1000);
  });
});
