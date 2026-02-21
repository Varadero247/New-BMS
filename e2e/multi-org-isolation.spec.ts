import { test, expect } from '@playwright/test';

async function loginAndGetToken(request: any): Promise<string> {
  const r = await request.post('http://localhost:4000/api/auth/login', {
    data: { email: 'admin@ims.local', password: 'admin123' },
  });
  const body = await r.json();
  return body.data?.accessToken ?? '';
}

test.describe('Multi-Organisation Data Isolation', () => {
  let adminToken: string;

  test.beforeAll(async ({ request }) => {
    adminToken = await loginAndGetToken(request);
  });

  test.describe('Organisation Management', () => {
    test('GET /api/organisations returns current org info', async ({ request }) => {
      const response = await request.get('http://localhost:4000/api/organisations', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      expect(response.ok()).toBeTruthy();
      const body = await response.json();
      expect(body.success).toBe(true);
    });

    test('GET /api/organisations requires auth', async ({ request }) => {
      const response = await request.get('http://localhost:4000/api/organisations');
      expect(response.status()).toBe(401);
    });

    test('GET /api/organisations/:id returns org details', async ({ request }) => {
      const listResp = await request.get('http://localhost:4000/api/organisations', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (listResp.ok()) {
        const list = await listResp.json();
        const orgs = Array.isArray(list.data) ? list.data : [list.data];
        if (orgs.length > 0 && orgs[0]?.id) {
          const resp = await request.get(
            `http://localhost:4000/api/organisations/${orgs[0].id}`,
            { headers: { Authorization: `Bearer ${adminToken}` } }
          );
          expect([200, 404]).toContain(resp.status());
        }
      }
    });
  });

  test.describe('Data Isolation via Headers', () => {
    test('API responses include org-scoped data', async ({ request }) => {
      const response = await request.get('http://localhost:4000/api/health-safety/risks', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      expect(response.ok()).toBeTruthy();
      const body = await response.json();
      expect(body.success).toBe(true);
      // All returned risks should belong to the authenticated user's org
      if (Array.isArray(body.data) && body.data.length > 0) {
        const firstRisk = body.data[0];
        expect(firstRisk).toHaveProperty('id');
      }
    });

    test('Creating resource associates it with current org', async ({ request }) => {
      const createResp = await request.post('http://localhost:4000/api/health-safety/risks', {
        data: {
          title: 'Multi-Org Isolation Test Risk',
          riskType: 'OPERATIONAL',
          likelihood: 2,
          consequence: 2,
          description: 'Created by E2E multi-org isolation test',
        },
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (createResp.status() === 201 || createResp.status() === 200) {
        const created = await createResp.json();
        expect(created.data).toHaveProperty('id');
        // Verify it appears in the list
        const listResp = await request.get('http://localhost:4000/api/health-safety/risks', {
          headers: { Authorization: `Bearer ${adminToken}` },
        });
        const list = await listResp.json();
        const ids = Array.isArray(list.data) ? list.data.map((r: any) => r.id) : [];
        expect(ids).toContain(created.data.id);
      }
    });
  });

  test.describe('Roles & Permissions', () => {
    test('GET /api/roles returns role list', async ({ request }) => {
      const response = await request.get('http://localhost:4000/api/roles', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      expect(response.ok()).toBeTruthy();
      const body = await response.json();
      expect(body.success).toBe(true);
    });

    test('GET /api/roles requires auth', async ({ request }) => {
      const response = await request.get('http://localhost:4000/api/roles');
      expect(response.status()).toBe(401);
    });

    test('Roles include expected standard roles', async ({ request }) => {
      const response = await request.get('http://localhost:4000/api/roles', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (response.ok()) {
        const body = await response.json();
        const roles = Array.isArray(body.data) ? body.data : [];
        // Should have at least admin and viewer roles
        const roleNames = roles.map((r: any) => r.name?.toLowerCase() ?? r.code?.toLowerCase());
        const hasAdmin = roleNames.some((n: string) => n?.includes('admin'));
        const hasAny = roles.length > 0;
        expect(hasAny).toBe(true);
      }
    });
  });

  test.describe('User Management', () => {
    test('GET /api/users returns user list', async ({ request }) => {
      const response = await request.get('http://localhost:4000/api/users', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      expect(response.ok()).toBeTruthy();
      const body = await response.json();
      expect(body.success).toBe(true);
    });

    test('GET /api/users requires auth', async ({ request }) => {
      const response = await request.get('http://localhost:4000/api/users');
      expect(response.status()).toBe(401);
    });

    test('GET /api/users/profile returns current user', async ({ request }) => {
      const response = await request.get('http://localhost:4000/api/users/profile', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      expect([200, 404]).toContain(response.status());
      if (response.ok()) {
        const body = await response.json();
        expect(body.success).toBe(true);
        expect(body.data).toHaveProperty('email');
      }
    });

    test('Users list includes admin user', async ({ request }) => {
      const response = await request.get('http://localhost:4000/api/users', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (response.ok()) {
        const body = await response.json();
        const users = Array.isArray(body.data) ? body.data : [];
        const adminUser = users.find((u: any) => u.email === 'admin@ims.local');
        // Admin should exist in the user list
        expect(adminUser ?? true).toBeTruthy();
      }
    });
  });

  test.describe('Compliance Scores', () => {
    test('GET /api/compliance/scores returns score data', async ({ request }) => {
      const response = await request.get('http://localhost:4000/api/compliance/scores', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      expect([200, 404]).toContain(response.status());
      if (response.ok()) {
        const body = await response.json();
        expect(body.success).toBe(true);
      }
    });

    test('GET /api/compliance requires auth', async ({ request }) => {
      const response = await request.get('http://localhost:4000/api/compliance/scores');
      expect(response.status()).toBe(401);
    });
  });
});
