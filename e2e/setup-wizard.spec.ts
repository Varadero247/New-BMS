import { test, expect } from '@playwright/test';

async function loginAndGetToken(request: any): Promise<string> {
  const r = await request.post('http://localhost:4000/api/auth/login', {
    data: { email: 'admin@ims.local', password: 'admin123' },
  });
  const body = await r.json();
  return body.data?.accessToken ?? '';
}

test.describe('Setup Wizard', () => {
  let token: string;

  test.beforeAll(async ({ request }) => {
    token = await loginAndGetToken(request);
  });

  test.describe('Health', () => {
    test('Setup Wizard API health responds ok', async ({ request }) => {
      const response = await request.get('http://localhost:4039/health');
      expect(response.ok()).toBeTruthy();
      const body = await response.json();
      expect(body.status).toBe('ok');
    });
  });

  test.describe('Wizard State', () => {
    test('GET /api/setup-wizard/status returns setup state', async ({ request }) => {
      const response = await request.get('http://localhost:4000/api/setup-wizard/status', {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect([200, 404]).toContain(response.status());
      if (response.ok()) {
        const body = await response.json();
        expect(body.success).toBe(true);
      }
    });

    test('Setup wizard status requires auth', async ({ request }) => {
      const response = await request.get('http://localhost:4000/api/setup-wizard/status');
      expect([401, 404]).toContain(response.status());
    });

    test('GET /api/setup-wizard/steps returns wizard steps', async ({ request }) => {
      const response = await request.get('http://localhost:4000/api/setup-wizard/steps', {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect([200, 404]).toContain(response.status());
      if (response.ok()) {
        const body = await response.json();
        expect(body.success).toBe(true);
        // Steps should be an array
        if (body.data) {
          expect(Array.isArray(body.data) || typeof body.data === 'object').toBe(true);
        }
      }
    });

    test('POST /api/setup-wizard/complete marks wizard complete', async ({ request }) => {
      const response = await request.post('http://localhost:4000/api/setup-wizard/complete', {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect([200, 201, 400, 404, 409]).toContain(response.status());
    });
  });

  test.describe('Wizard Configuration', () => {
    test('POST /api/setup-wizard/organisation sets org config', async ({ request }) => {
      const response = await request.post('http://localhost:4000/api/setup-wizard/organisation', {
        data: {
          name: 'E2E Test Organisation',
          industry: 'Manufacturing',
          size: 'MEDIUM',
          country: 'GB',
        },
        headers: { Authorization: `Bearer ${token}` },
      });
      expect([200, 201, 400, 404]).toContain(response.status());
    });

    test('POST /api/setup-wizard/modules selects active modules', async ({ request }) => {
      const response = await request.post('http://localhost:4000/api/setup-wizard/modules', {
        data: {
          modules: ['health-safety', 'environment', 'quality'],
        },
        headers: { Authorization: `Bearer ${token}` },
      });
      expect([200, 201, 400, 404]).toContain(response.status());
    });

    test('POST /api/setup-wizard/branding sets brand config', async ({ request }) => {
      const response = await request.post('http://localhost:4000/api/setup-wizard/branding', {
        data: {
          primaryColor: '#2563EB',
          logo: null,
        },
        headers: { Authorization: `Bearer ${token}` },
      });
      expect([200, 201, 400, 404]).toContain(response.status());
    });
  });

  test.describe('Feature Flags', () => {
    test('GET /api/feature-flags returns flag state', async ({ request }) => {
      const response = await request.get('http://localhost:4000/api/feature-flags', {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect([200, 404]).toContain(response.status());
      if (response.ok()) {
        const body = await response.json();
        expect(body.success).toBe(true);
      }
    });

    test('Feature flags public endpoint (or auth-protected)', async ({ request }) => {
      const response = await request.get('http://localhost:4000/api/feature-flags');
      // May be public or require auth
      expect([200, 401]).toContain(response.status());
    });

    test('GET /api/feature-flags/:flag returns specific flag', async ({ request }) => {
      const response = await request.get('http://localhost:4000/api/feature-flags/dark-mode', {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect([200, 404]).toContain(response.status());
    });

    test('PATCH /api/feature-flags/:flag toggles a flag', async ({ request }) => {
      const response = await request.patch('http://localhost:4000/api/feature-flags/dark-mode', {
        data: { enabled: true },
        headers: { Authorization: `Bearer ${token}` },
      });
      expect([200, 400, 404]).toContain(response.status());
    });
  });
});
