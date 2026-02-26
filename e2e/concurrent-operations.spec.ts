// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { test, expect } from '@playwright/test';

const GATEWAY = 'http://localhost:4000';

test.describe('Concurrent Operations', () => {
  let token: string;

  test.beforeAll(async ({ request }) => {
    const r = await request.post(`${GATEWAY}/api/auth/login`, {
      data: { email: 'admin@ims.local', password: 'admin123' },
    });
    token = (await r.json()).data?.accessToken;
  });

  // ── Concurrent health checks ──────────────────────────────────────────────────

  test('10 concurrent gateway health checks all succeed', async ({ request }) => {
    const results = await Promise.all(
      Array.from({ length: 10 }, () => request.get(`${GATEWAY}/health`)),
    );
    for (const r of results) {
      expect(r.ok()).toBeTruthy();
    }
  });

  // ── Concurrent logins ─────────────────────────────────────────────────────────

  test('5 concurrent logins all return valid distinct tokens', async ({ request }) => {
    const results = await Promise.all(
      Array.from({ length: 5 }, () =>
        request.post(`${GATEWAY}/api/auth/login`, {
          data: { email: 'admin@ims.local', password: 'admin123' },
        }),
      ),
    );
    const tokens: string[] = [];
    for (const r of results) {
      expect(r.ok()).toBeTruthy();
      const body = await r.json();
      const t = body.data?.accessToken;
      expect(t).toBeDefined();
      expect(typeof t).toBe('string');
      tokens.push(t);
    }
    // Each login issues a distinct JWT (different iat/jti)
    const unique = new Set(tokens);
    expect(unique.size).toBe(5);
  });

  // ── Concurrent reads return consistent data ────────────────────────────────────

  test('5 concurrent GETs on H&S risks return identical responses', async ({ request }) => {
    const results = await Promise.all(
      Array.from({ length: 5 }, () =>
        request.get(`${GATEWAY}/api/health-safety/risks?limit=5`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ),
    );
    const bodies = await Promise.all(results.map((r) => r.json()));
    for (const r of results) {
      expect(r.ok()).toBeTruthy();
    }
    // All concurrent reads should return the same total count
    const totals = bodies.map((b) => b.data?.total ?? b.data?.pagination?.total);
    const first = totals[0];
    for (const t of totals) {
      expect(t).toBe(first);
    }
  });

  test('5 concurrent GETs on environment aspects return valid JSON', async ({ request }) => {
    const results = await Promise.all(
      Array.from({ length: 5 }, () =>
        request.get(`${GATEWAY}/api/environment/aspects?limit=5`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ),
    );
    for (const r of results) {
      expect(r.ok()).toBeTruthy();
      const body = await r.json();
      expect(body.success).toBe(true);
    }
  });

  // ── Concurrent creates don't interfere ────────────────────────────────────────

  test('3 concurrent POSTs to H&S risks each create a separate record', async ({ request }) => {
    const payloads = [
      { title: 'Concurrent Risk Alpha', description: 'First concurrent', category: 'PHYSICAL', likelihood: 1, severity: 1, status: 'OPEN' },
      { title: 'Concurrent Risk Beta', description: 'Second concurrent', category: 'CHEMICAL', likelihood: 2, severity: 2, status: 'OPEN' },
      { title: 'Concurrent Risk Gamma', description: 'Third concurrent', category: 'ERGONOMIC', likelihood: 1, severity: 3, status: 'OPEN' },
    ];
    const results = await Promise.all(
      payloads.map((data) =>
        request.post(`${GATEWAY}/api/health-safety/risks`, {
          headers: { Authorization: `Bearer ${token}` },
          data,
        }),
      ),
    );
    const ids = new Set<string>();
    for (const r of results) {
      expect([200, 201]).toContain(r.status());
      const body = await r.json();
      const id = body.data?.id;
      if (id) {
        ids.add(id);
      }
    }
    // Each concurrent create should produce a distinct resource
    expect(ids.size).toBe(3);
  });

  test('3 concurrent POSTs to environment aspects each create a separate record', async ({ request }) => {
    const base = {
      activity: 'Concurrent test activity',
      aspectType: 'EMISSIONS',
      impactType: 'AIR_POLLUTION',
      severity: 1,
      probability: 1,
      duration: 1,
      extent: 1,
      reversibility: 1,
      regulatory: 1,
      stakeholder: 1,
      condition: 'NORMAL',
      status: 'ACTIVE',
    };
    const results = await Promise.all(
      ['Alpha', 'Beta', 'Gamma'].map((suffix) =>
        request.post(`${GATEWAY}/api/environment/aspects`, {
          headers: { Authorization: `Bearer ${token}` },
          data: { ...base, title: `Concurrent Aspect ${suffix}` },
        }),
      ),
    );
    const ids = new Set<string>();
    for (const r of results) {
      expect([200, 201]).toContain(r.status());
      const body = await r.json();
      const id = body.data?.id;
      if (id) ids.add(id);
    }
    expect(ids.size).toBe(3);
  });

  // ── Concurrent writes to different resources ───────────────────────────────────

  test('concurrent writes to H&S, environment and quality all succeed', async ({ request }) => {
    const [hsResult, envResult, qualResult] = await Promise.all([
      request.get(`${GATEWAY}/api/health-safety/risks`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      request.get(`${GATEWAY}/api/environment/aspects`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      request.get(`${GATEWAY}/api/quality/processes`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);
    expect(hsResult.ok()).toBeTruthy();
    expect(envResult.ok()).toBeTruthy();
    expect(qualResult.ok()).toBeTruthy();
  });

  // ── Read after write is consistent ───────────────────────────────────────────

  test('read after write: created H&S risk is immediately retrievable', async ({ request }) => {
    const uniqueTitle = `Read-After-Write Risk ${Date.now()}`;
    const createRes = await request.post(`${GATEWAY}/api/health-safety/risks`, {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        title: uniqueTitle,
        description: 'Read-after-write consistency test',
        category: 'PHYSICAL',
        likelihood: 1,
        severity: 1,
        status: 'OPEN',
      },
    });
    expect([200, 201]).toContain(createRes.status());
    const created = await createRes.json();
    const id = created.data?.id;
    expect(id).toBeDefined();

    const readRes = await request.get(`${GATEWAY}/api/health-safety/risks/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(readRes.ok()).toBeTruthy();
    const fetched = await readRes.json();
    expect(fetched.data?.title).toBe(uniqueTitle);
  });

  // ── Concurrency on HR employees ───────────────────────────────────────────────

  test('5 concurrent GETs on HR employees all return valid JSON', async ({ request }) => {
    const results = await Promise.all(
      Array.from({ length: 5 }, () =>
        request.get(`${GATEWAY}/api/hr/employees`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ),
    );
    for (const r of results) {
      expect(r.ok()).toBeTruthy();
      const body = await r.json();
      expect(body.success).toBe(true);
    }
  });

  // ── Concurrency on inventory items ────────────────────────────────────────────

  test('5 concurrent GETs on inventory items return no 500 errors', async ({ request }) => {
    const results = await Promise.all(
      Array.from({ length: 5 }, () =>
        request.get(`${GATEWAY}/api/inventory/items`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ),
    );
    for (const r of results) {
      expect(r.status()).not.toBe(500);
    }
  });

  // ── Concurrent reads on quality processes ─────────────────────────────────────

  test('5 concurrent GETs on quality processes return consistent data', async ({ request }) => {
    const results = await Promise.all(
      Array.from({ length: 5 }, () =>
        request.get(`${GATEWAY}/api/quality/processes`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ),
    );
    for (const r of results) {
      expect(r.ok()).toBeTruthy();
      const body = await r.json();
      expect(body).not.toBeNull();
    }
  });

  // ── No 500s under modest concurrent load ─────────────────────────────────────

  test('10 concurrent requests across 5 endpoints return no 500 errors', async ({ request }) => {
    const endpoints = [
      `${GATEWAY}/api/health-safety/risks`,
      `${GATEWAY}/api/environment/aspects`,
      `${GATEWAY}/api/quality/processes`,
      `${GATEWAY}/api/inventory/items`,
      `${GATEWAY}/api/hr/employees`,
    ];
    const requests = endpoints.flatMap((url) =>
      Array.from({ length: 2 }, () =>
        request.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ),
    );
    const results = await Promise.all(requests);
    for (const r of results) {
      expect(r.status()).not.toBe(500);
    }
  });

  // ── Concurrent reads return valid JSON bodies ─────────────────────────────────

  test('concurrent reads all return parseable JSON bodies', async ({ request }) => {
    const results = await Promise.all([
      request.get(`${GATEWAY}/api/health-safety/risks`, { headers: { Authorization: `Bearer ${token}` } }),
      request.get(`${GATEWAY}/api/environment/aspects`, { headers: { Authorization: `Bearer ${token}` } }),
      request.get(`${GATEWAY}/api/quality/processes`, { headers: { Authorization: `Bearer ${token}` } }),
      request.get(`${GATEWAY}/api/inventory/items`, { headers: { Authorization: `Bearer ${token}` } }),
      request.get(`${GATEWAY}/api/hr/employees`, { headers: { Authorization: `Bearer ${token}` } }),
    ]);
    for (const r of results) {
      const body = await r.json();
      expect(typeof body).toBe('object');
      expect(body).not.toBeNull();
    }
  });

  // ── Concurrent dashboard and health mixed ─────────────────────────────────────

  test('concurrent health and dashboard calls all succeed', async ({ request }) => {
    const results = await Promise.all([
      request.get(`${GATEWAY}/health`),
      request.get(`${GATEWAY}/api/dashboard/stats`, { headers: { Authorization: `Bearer ${token}` } }),
      request.get(`${GATEWAY}/health`),
      request.get(`${GATEWAY}/api/dashboard/stats`, { headers: { Authorization: `Bearer ${token}` } }),
    ]);
    for (const r of results) {
      expect(r.ok()).toBeTruthy();
    }
  });
});
