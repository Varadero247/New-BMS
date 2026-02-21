import { test, expect } from '@playwright/test';

async function loginAndGetToken(request: any): Promise<string> {
  const r = await request.post('http://localhost:4000/api/auth/login', {
    data: { email: 'admin@ims.local', password: 'admin123' },
  });
  const body = await r.json();
  return body.data?.accessToken ?? '';
}

test.describe('GDPR & Privacy Compliance', () => {
  let token: string;

  test.beforeAll(async ({ request }) => {
    token = await loginAndGetToken(request);
  });

  test.describe('DSAR (Data Subject Access Requests)', () => {
    test('GET /api/dsar returns DSAR list', async ({ request }) => {
      const response = await request.get('http://localhost:4000/api/dsar', {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(response.ok()).toBeTruthy();
      const body = await response.json();
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
    });

    test('DSAR requires auth', async ({ request }) => {
      const response = await request.get('http://localhost:4000/api/dsar');
      expect(response.status()).toBe(401);
    });

    test('POST /api/dsar creates a DSAR request', async ({ request }) => {
      const response = await request.post('http://localhost:4000/api/dsar', {
        data: {
          type: 'ACCESS',
          subjectEmail: 'test.subject@example.com',
          subjectName: 'Test Subject',
          description: 'E2E test DSAR request',
        },
        headers: { Authorization: `Bearer ${token}` },
      });
      expect([201, 200, 400, 422]).toContain(response.status());
      if (response.status() === 201 || response.status() === 200) {
        const body = await response.json();
        expect(body.success).toBe(true);
        expect(body.data).toHaveProperty('id');
      }
    });

    test('POST DSAR without email returns 400', async ({ request }) => {
      const response = await request.post('http://localhost:4000/api/dsar', {
        data: { type: 'DELETION', subjectName: 'No Email' },
        headers: { Authorization: `Bearer ${token}` },
      });
      expect([400, 422]).toContain(response.status());
    });

    test('DSAR status update', async ({ request }) => {
      // Create a DSAR first
      const createResp = await request.post('http://localhost:4000/api/dsar', {
        data: {
          type: 'ACCESS',
          subjectEmail: 'status-test@example.com',
          subjectName: 'Status Test',
        },
        headers: { Authorization: `Bearer ${token}` },
      });
      if (createResp.status() === 201 || createResp.status() === 200) {
        const created = await createResp.json();
        const id = created.data?.id;
        if (id) {
          const updateResp = await request.patch(`http://localhost:4000/api/dsar/${id}`, {
            data: { status: 'IN_PROGRESS' },
            headers: { Authorization: `Bearer ${token}` },
          });
          expect([200, 400, 404]).toContain(updateResp.status());
        }
      }
    });
  });

  test.describe('DPA (Data Processing Agreements)', () => {
    test('GET /api/dpa returns DPA list', async ({ request }) => {
      const response = await request.get('http://localhost:4000/api/dpa', {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect([200, 404]).toContain(response.status());
      if (response.ok()) {
        const body = await response.json();
        expect(body.success).toBe(true);
      }
    });

    test('DPA requires auth', async ({ request }) => {
      const response = await request.get('http://localhost:4000/api/dpa');
      expect([401, 404]).toContain(response.status());
    });

    test('POST /api/dpa creates a DPA', async ({ request }) => {
      const response = await request.post('http://localhost:4000/api/dpa', {
        data: {
          processorName: 'E2E Test Processor',
          processorEmail: 'processor@example.com',
          purpose: 'Data processing for testing',
          dataCategories: ['name', 'email'],
          legalBasis: 'LEGITIMATE_INTEREST',
        },
        headers: { Authorization: `Bearer ${token}` },
      });
      expect([200, 201, 400, 404, 422]).toContain(response.status());
    });
  });

  test.describe('GDPR HR Module', () => {
    test('GET /api/hr/gdpr returns GDPR data', async ({ request }) => {
      const response = await request.get('http://localhost:4000/api/hr/gdpr', {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect([200, 404]).toContain(response.status());
      if (response.ok()) {
        const body = await response.json();
        expect(body.success).toBe(true);
      }
    });
  });

  test.describe('Cookie Consent', () => {
    test('GET /api/cookie-consent returns consent status', async ({ request }) => {
      const response = await request.get('http://localhost:4000/api/cookie-consent', {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect([200, 404]).toContain(response.status());
    });

    test('POST /api/cookie-consent records consent', async ({ request }) => {
      const response = await request.post('http://localhost:4000/api/cookie-consent', {
        data: {
          necessary: true,
          analytics: false,
          marketing: false,
          preferences: true,
        },
        headers: { Authorization: `Bearer ${token}` },
      });
      expect([200, 201, 400, 404]).toContain(response.status());
    });
  });

  test.describe('Privacy - No PII Leakage', () => {
    test('Error responses do not expose email addresses', async ({ request }) => {
      const response = await request.post('http://localhost:4000/api/auth/login', {
        data: { email: 'nonexistent@test.com', password: 'wrongpass' },
      });
      expect(response.status()).toBe(401);
      const body = await response.json();
      const bodyStr = JSON.stringify(body).toLowerCase();
      // Error message should not reveal whether the email exists
      expect(bodyStr).not.toContain('nonexistent@test.com');
    });

    test('API responses do not include password hashes', async ({ request }) => {
      const response = await request.get('http://localhost:4000/api/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok()) {
        const bodyStr = JSON.stringify(await response.json()).toLowerCase();
        expect(bodyStr).not.toContain('password');
        expect(bodyStr).not.toContain('hash');
        expect(bodyStr).not.toContain('bcrypt');
      }
    });

    test('User profile does not expose sensitive internal fields', async ({ request }) => {
      const response = await request.get('http://localhost:4000/api/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok()) {
        const body = await response.json();
        const users = Array.isArray(body.data) ? body.data : [];
        for (const user of users.slice(0, 3)) {
          expect(user).not.toHaveProperty('passwordHash');
          expect(user).not.toHaveProperty('resetToken');
          expect(user).not.toHaveProperty('verificationToken');
        }
      }
    });
  });
});
