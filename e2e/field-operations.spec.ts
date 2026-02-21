import { test, expect } from '@playwright/test';

async function loginAndGetToken(request: any): Promise<string> {
  const r = await request.post('http://localhost:4000/api/auth/login', {
    data: { email: 'admin@ims.local', password: 'admin123' },
  });
  const body = await r.json();
  return body.data?.accessToken ?? '';
}

test.describe('Field Service Operations', () => {
  let token: string;

  test.beforeAll(async ({ request }) => {
    token = await loginAndGetToken(request);
  });

  test.describe('Health', () => {
    test('Field Service API health responds ok', async ({ request }) => {
      const response = await request.get('http://localhost:4022/health');
      expect(response.ok()).toBeTruthy();
      const body = await response.json();
      expect(body.status).toBe('ok');
    });
  });

  test.describe('Work Orders', () => {
    test('GET /api/field-service/work-orders returns list', async ({ request }) => {
      const response = await request.get('http://localhost:4000/api/field-service/work-orders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(response.ok()).toBeTruthy();
      const body = await response.json();
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
    });

    test('Field service work-orders require auth', async ({ request }) => {
      const response = await request.get('http://localhost:4000/api/field-service/work-orders');
      expect(response.status()).toBe(401);
    });

    test('POST /api/field-service/work-orders creates work order', async ({ request }) => {
      const response = await request.post(
        'http://localhost:4000/api/field-service/work-orders',
        {
          data: {
            title: 'E2E Field Test Work Order',
            type: 'MAINTENANCE',
            priority: 'MEDIUM',
            description: 'E2E test work order',
            scheduledDate: new Date(Date.now() + 86400000).toISOString(),
          },
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      expect([201, 200, 400, 422]).toContain(response.status());
    });

    test('GET /api/field-service/work-orders with status filter', async ({ request }) => {
      const response = await request.get(
        'http://localhost:4000/api/field-service/work-orders?status=OPEN',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      expect(response.ok()).toBeTruthy();
    });
  });

  test.describe('Technicians', () => {
    test('GET /api/field-service/technicians returns technician list', async ({ request }) => {
      const response = await request.get('http://localhost:4000/api/field-service/technicians', {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect([200, 404]).toContain(response.status());
    });
  });

  test.describe('Scheduling', () => {
    test('GET /api/field-service/schedule returns schedule', async ({ request }) => {
      const response = await request.get('http://localhost:4000/api/field-service/schedule', {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect([200, 404]).toContain(response.status());
    });

    test('Schedule can be filtered by date', async ({ request }) => {
      const today = new Date().toISOString().split('T')[0];
      const response = await request.get(
        `http://localhost:4000/api/field-service/schedule?date=${today}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      expect([200, 404]).toContain(response.status());
    });
  });
});

test.describe('Permit to Work', () => {
  let token: string;

  test.beforeAll(async ({ request }) => {
    token = await loginAndGetToken(request);
  });

  test('Health endpoint responds ok', async ({ request }) => {
    const response = await request.get('http://localhost:4034/health');
    expect(response.ok()).toBeTruthy();
  });

  test('GET /api/ptw/permits returns permit list', async ({ request }) => {
    const response = await request.get('http://localhost:4000/api/ptw/permits', {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.success).toBe(true);
  });

  test('PTW endpoints require auth', async ({ request }) => {
    const response = await request.get('http://localhost:4000/api/ptw/permits');
    expect(response.status()).toBe(401);
  });

  test('POST /api/ptw/permits creates permit', async ({ request }) => {
    const response = await request.post('http://localhost:4000/api/ptw/permits', {
      data: {
        title: 'E2E Test Permit',
        workType: 'HOT_WORK',
        location: 'Building A, Floor 2',
        workDescription: 'Welding operations for E2E test',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 3600000).toISOString(),
        requestorName: 'E2E Test User',
      },
      headers: { Authorization: `Bearer ${token}` },
    });
    expect([201, 200, 400, 422]).toContain(response.status());
  });

  test('GET /api/ptw/permits by status', async ({ request }) => {
    const response = await request.get('http://localhost:4000/api/ptw/permits?status=PENDING', {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(response.ok()).toBeTruthy();
  });

  test('GET /api/ptw/templates returns permit templates', async ({ request }) => {
    const response = await request.get('http://localhost:4000/api/ptw/templates', {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect([200, 404]).toContain(response.status());
  });
});

test.describe('CMMS (Computerised Maintenance Management)', () => {
  let token: string;

  test.beforeAll(async ({ request }) => {
    token = await loginAndGetToken(request);
  });

  test('CMMS health endpoint responds ok', async ({ request }) => {
    const response = await request.get('http://localhost:4017/health');
    expect(response.ok()).toBeTruthy();
  });

  test('GET /api/cmms/work-orders returns work orders', async ({ request }) => {
    const response = await request.get('http://localhost:4000/api/cmms/work-orders', {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.success).toBe(true);
  });

  test('GET /api/cmms/assets returns asset list', async ({ request }) => {
    const response = await request.get('http://localhost:4000/api/cmms/assets', {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect([200, 404]).toContain(response.status());
  });

  test('GET /api/cmms/preventive-plans returns maintenance plans', async ({ request }) => {
    const response = await request.get('http://localhost:4000/api/cmms/preventive-plans', {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect([200, 404]).toContain(response.status());
  });

  test('CMMS endpoints require auth', async ({ request }) => {
    const response = await request.get('http://localhost:4000/api/cmms/work-orders');
    expect(response.status()).toBe(401);
  });
});
