import { test, expect } from '@playwright/test';

async function loginAndGetToken(request: any): Promise<string> {
  const r = await request.post('http://localhost:4000/api/auth/login', {
    data: { email: 'admin@ims.local', password: 'admin123' },
  });
  const body = await r.json();
  return body.data?.accessToken ?? '';
}

test.describe('ISO Standards Compliance Modules', () => {
  let token: string;

  test.beforeAll(async ({ request }) => {
    token = await loginAndGetToken(request);
  });

  test.describe('ISO 42001 (AI Management)', () => {
    test('Health endpoint responds ok', async ({ request }) => {
      const response = await request.get('http://localhost:4023/health');
      expect(response.ok()).toBeTruthy();
      const body = await response.json();
      expect(body.status).toBe('ok');
    });

    test('GET /api/iso42001 lists AI management items', async ({ request }) => {
      const response = await request.get('http://localhost:4000/api/iso42001', {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect([200, 404]).toContain(response.status());
      if (response.ok()) {
        const body = await response.json();
        expect(body.success).toBe(true);
      }
    });

    test('ISO 42001 endpoints require auth', async ({ request }) => {
      const response = await request.get('http://localhost:4000/api/iso42001');
      expect(response.status()).toBe(401);
    });

    test('GET /api/iso42001 with pagination', async ({ request }) => {
      const response = await request.get('http://localhost:4000/api/iso42001?page=1&limit=10', {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect([200, 404]).toContain(response.status());
    });
  });

  test.describe('ISO 37001 (Anti-Bribery)', () => {
    test('Health endpoint responds ok', async ({ request }) => {
      const response = await request.get('http://localhost:4024/health');
      expect(response.ok()).toBeTruthy();
      const body = await response.json();
      expect(body.status).toBe('ok');
    });

    test('GET /api/iso37001 returns anti-bribery items', async ({ request }) => {
      const response = await request.get('http://localhost:4000/api/iso37001', {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect([200, 404]).toContain(response.status());
      if (response.ok()) {
        const body = await response.json();
        expect(body.success).toBe(true);
      }
    });

    test('ISO 37001 endpoints require auth', async ({ request }) => {
      const response = await request.get('http://localhost:4000/api/iso37001');
      expect(response.status()).toBe(401);
    });
  });

  test.describe('ESG Reporting (ISO 26000 aligned)', () => {
    test('Health endpoint responds ok', async ({ request }) => {
      const response = await request.get('http://localhost:4016/health');
      expect(response.ok()).toBeTruthy();
    });

    test('GET /api/esg/reports returns ESG reports', async ({ request }) => {
      const response = await request.get('http://localhost:4000/api/esg/reports', {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(response.ok()).toBeTruthy();
      const body = await response.json();
      expect(body.success).toBe(true);
    });

    test('GET /api/esg/metrics returns ESG metrics', async ({ request }) => {
      const response = await request.get('http://localhost:4000/api/esg/metrics', {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect([200, 404]).toContain(response.status());
    });

    test('ESG endpoints require auth', async ({ request }) => {
      const response = await request.get('http://localhost:4000/api/esg/reports');
      expect(response.status()).toBe(401);
    });
  });

  test.describe('InfoSec (ISO 27001)', () => {
    test('Health endpoint responds ok', async ({ request }) => {
      const response = await request.get('http://localhost:4015/health');
      expect(response.ok()).toBeTruthy();
    });

    test('GET /api/infosec/risks returns risks', async ({ request }) => {
      const response = await request.get('http://localhost:4000/api/infosec/risks', {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect([200, 404]).toContain(response.status());
    });

    test('GET /api/infosec/controls returns security controls', async ({ request }) => {
      const response = await request.get('http://localhost:4000/api/infosec/controls', {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect([200, 404]).toContain(response.status());
    });

    test('GET /api/infosec/audits returns audit programme', async ({ request }) => {
      const response = await request.get('http://localhost:4000/api/infosec/audits', {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect([200, 404]).toContain(response.status());
    });

    test('InfoSec endpoints require auth', async ({ request }) => {
      const response = await request.get('http://localhost:4000/api/infosec/risks');
      expect(response.status()).toBe(401);
    });
  });

  test.describe('Regulatory Monitoring', () => {
    test('Health endpoint responds ok', async ({ request }) => {
      const response = await request.get('http://localhost:4035/health');
      expect(response.ok()).toBeTruthy();
    });

    test('GET /api/reg-monitor/requirements returns requirements', async ({ request }) => {
      const response = await request.get('http://localhost:4000/api/reg-monitor/requirements', {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect([200, 404]).toContain(response.status());
      if (response.ok()) {
        const body = await response.json();
        expect(body.success).toBe(true);
      }
    });

    test('GET /api/reg-monitor/updates returns regulatory updates', async ({ request }) => {
      const response = await request.get('http://localhost:4000/api/reg-monitor/updates', {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect([200, 404]).toContain(response.status());
    });

    test('RegMonitor endpoints require auth', async ({ request }) => {
      const response = await request.get('http://localhost:4000/api/reg-monitor/requirements');
      expect(response.status()).toBe(401);
    });
  });

  test.describe('Management Review', () => {
    test('Health endpoint responds ok', async ({ request }) => {
      const response = await request.get('http://localhost:4038/health');
      expect(response.ok()).toBeTruthy();
    });

    test('GET /api/mgmt-review/reviews returns reviews', async ({ request }) => {
      const response = await request.get('http://localhost:4000/api/mgmt-review/reviews', {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect([200, 404]).toContain(response.status());
      if (response.ok()) {
        const body = await response.json();
        expect(body.success).toBe(true);
      }
    });

    test('MgmtReview endpoints require auth', async ({ request }) => {
      const response = await request.get('http://localhost:4000/api/mgmt-review/reviews');
      expect(response.status()).toBe(401);
    });
  });
});
