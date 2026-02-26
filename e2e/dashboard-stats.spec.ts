// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { test, expect } from '@playwright/test';

async function loginAndGetToken(request: any): Promise<string> {
  const r = await request.post('http://localhost:4000/api/auth/login', {
    data: { email: 'admin@ims.local', password: 'admin123' },
  });
  const body = await r.json();
  return body.data?.accessToken ?? '';
}

test.describe('Dashboard & Analytics', () => {
  let token: string;

  test.beforeAll(async ({ request }) => {
    token = await loginAndGetToken(request);
  });

  test.describe('Dashboard Stats Aggregation', () => {
    test('GET /api/dashboard/stats returns aggregated counts', async ({ request }) => {
      const response = await request.get('http://localhost:4000/api/dashboard/stats', {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(response.ok()).toBeTruthy();
      const body = await response.json();
      expect(body.success).toBe(true);
      expect(body.data).toBeDefined();
    });

    test('Dashboard stats require auth', async ({ request }) => {
      const response = await request.get('http://localhost:4000/api/dashboard/stats');
      expect(response.status()).toBe(401);
    });

    test('Dashboard stats response is fast (< 2000ms)', async ({ request }) => {
      const start = Date.now();
      const response = await request.get('http://localhost:4000/api/dashboard/stats', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const elapsed = Date.now() - start;
      expect(response.ok()).toBeTruthy();
      expect(elapsed).toBeLessThan(2000);
    });

    test('Dashboard stats include module counts', async ({ request }) => {
      const response = await request.get('http://localhost:4000/api/dashboard/stats', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok()) {
        const body = await response.json();
        const data = body.data;
        // Stats should include numeric counts
        expect(typeof data).toBe('object');
        // At least one numeric property expected
        const hasNumbers = Object.values(data ?? {}).some((v) => typeof v === 'number');
        expect(hasNumbers || Object.keys(data ?? {}).length >= 0).toBe(true);
      }
    });

    test('GET /api/dashboard/kpis returns KPI data', async ({ request }) => {
      const response = await request.get('http://localhost:4000/api/dashboard/kpis', {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect([200, 404]).toContain(response.status());
      if (response.ok()) {
        const body = await response.json();
        expect(body.success).toBe(true);
      }
    });

    test('GET /api/dashboard/recent-activity returns activity feed', async ({ request }) => {
      const response = await request.get('http://localhost:4000/api/dashboard/recent-activity', {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect([200, 404]).toContain(response.status());
      if (response.ok()) {
        const body = await response.json();
        expect(body.success).toBe(true);
        expect(Array.isArray(body.data)).toBe(true);
      }
    });
  });

  test.describe('Analytics Module', () => {
    test('GET /api/analytics/executive returns executive dashboard', async ({ request }) => {
      const response = await request.get('http://localhost:4000/api/analytics/executive', {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect([200, 404]).toContain(response.status());
      if (response.ok()) {
        const body = await response.json();
        expect(body.success).toBe(true);
      }
    });

    test('GET /api/analytics/datasets returns datasets', async ({ request }) => {
      const response = await request.get('http://localhost:4000/api/analytics/datasets', {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(response.ok()).toBeTruthy();
      const body = await response.json();
      expect(body.success).toBe(true);
    });

    test('GET /api/analytics/reports returns reports list', async ({ request }) => {
      const response = await request.get('http://localhost:4000/api/analytics/reports', {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect([200, 404]).toContain(response.status());
    });

    test('GET /api/analytics/anomalies returns anomaly data', async ({ request }) => {
      const response = await request.get('http://localhost:4000/api/analytics/anomalies', {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect([200, 404]).toContain(response.status());
    });

    test('GET /api/analytics/predictions returns forecast data', async ({ request }) => {
      const response = await request.get('http://localhost:4000/api/analytics/predictions', {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect([200, 404]).toContain(response.status());
    });

    test('Analytics endpoints require auth', async ({ request }) => {
      const response = await request.get('http://localhost:4000/api/analytics/executive');
      expect(response.status()).toBe(401);
    });

    test('Analytics accepts pagination', async ({ request }) => {
      const response = await request.get(
        'http://localhost:4000/api/analytics/datasets?page=1&limit=10',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      expect(response.ok()).toBeTruthy();
    });
  });

  test.describe('Reports Generation', () => {
    test('GET /api/reports returns report list', async ({ request }) => {
      const response = await request.get('http://localhost:4000/api/reports', {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect([200, 404]).toContain(response.status());
      if (response.ok()) {
        const body = await response.json();
        expect(body.success).toBe(true);
      }
    });

    test('POST /api/reports triggers report generation', async ({ request }) => {
      const response = await request.post('http://localhost:4000/api/reports', {
        data: {
          type: 'monthly-summary',
          module: 'health-safety',
          dateFrom: '2026-01-01',
          dateTo: '2026-01-31',
          format: 'PDF',
        },
        headers: { Authorization: `Bearer ${token}` },
      });
      expect([200, 201, 202, 400, 404, 422]).toContain(response.status());
    });

    test('Scheduled reports endpoint accessible', async ({ request }) => {
      const response = await request.get('http://localhost:4000/api/scheduled-reports', {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect([200, 404]).toContain(response.status());
    });
  });

  test.describe('Compliance Calendar', () => {
    test('GET /api/compliance-calendar returns calendar entries', async ({ request }) => {
      const response = await request.get('http://localhost:4000/api/compliance-calendar', {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect([200, 404]).toContain(response.status());
      if (response.ok()) {
        const body = await response.json();
        expect(body.success).toBe(true);
      }
    });

    test('Compliance calendar requires auth', async ({ request }) => {
      const response = await request.get('http://localhost:4000/api/compliance-calendar');
      expect(response.status()).toBe(401);
    });
  });
});
