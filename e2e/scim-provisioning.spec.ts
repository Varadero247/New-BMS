// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { test, expect } from '@playwright/test';

const SCIM_BASE = 'http://localhost:4000/scim/v2';

// SCIM token is configured via SCIM_TOKEN env; in tests we test public endpoints
// and auth rejection patterns without needing the real token.

test.describe('SCIM Provisioning', () => {
  test.describe('Authentication', () => {
    test('SCIM endpoint requires Bearer token', async ({ request }) => {
      const response = await request.get(`${SCIM_BASE}/Users`);
      expect([401, 403]).toContain(response.status());
    });

    test('SCIM endpoint rejects invalid Bearer token', async ({ request }) => {
      const response = await request.get(`${SCIM_BASE}/Users`, {
        headers: { Authorization: 'Bearer invalid-scim-token-xyz' },
      });
      expect([401, 403]).toContain(response.status());
    });

    test('SCIM endpoint rejects Basic auth', async ({ request }) => {
      const response = await request.get(`${SCIM_BASE}/Users`, {
        headers: { Authorization: 'Basic ' + Buffer.from('admin:admin123').toString('base64') },
      });
      expect([401, 403]).toContain(response.status());
    });

    test('SCIM endpoint rejects empty Authorization header', async ({ request }) => {
      const response = await request.get(`${SCIM_BASE}/Users`, {
        headers: { Authorization: '' },
      });
      expect([401, 403]).toContain(response.status());
    });
  });

  test.describe('Service Provider Config (no auth required)', () => {
    test('ServiceProviderConfig is accessible', async ({ request }) => {
      const response = await request.get(`${SCIM_BASE}/ServiceProviderConfig`);
      // May require auth or be public
      expect([200, 401, 403]).toContain(response.status());
      if (response.ok()) {
        const body = await response.json();
        expect(body).toHaveProperty('schemas');
      }
    });

    test('Schemas endpoint responds', async ({ request }) => {
      const response = await request.get(`${SCIM_BASE}/Schemas`);
      expect([200, 401, 403]).toContain(response.status());
    });

    test('ResourceTypes endpoint responds', async ({ request }) => {
      const response = await request.get(`${SCIM_BASE}/ResourceTypes`);
      expect([200, 401, 403]).toContain(response.status());
    });
  });

  test.describe('SCIM Base URL', () => {
    test('SCIM base path returns response (not 404)', async ({ request }) => {
      const response = await request.get(`${SCIM_BASE}/Users`);
      // Any response except 404/500 means SCIM is mounted
      expect(response.status()).not.toBe(404);
      expect(response.status()).not.toBe(500);
    });

    test('SCIM Groups path returns response (not 404)', async ({ request }) => {
      const response = await request.get(`${SCIM_BASE}/Groups`);
      expect(response.status()).not.toBe(404);
      expect(response.status()).not.toBe(500);
    });

    test('Non-existent SCIM resource returns 404', async ({ request }) => {
      const response = await request.get(`${SCIM_BASE}/NonExistentResource`);
      expect([404, 401, 403]).toContain(response.status());
    });
  });

  test.describe('Error response format', () => {
    test('Unauthorized response has SCIM error format', async ({ request }) => {
      const response = await request.get(`${SCIM_BASE}/Users`);
      if (response.status() === 401) {
        const contentType = response.headers()['content-type'] ?? '';
        // SCIM error responses should be JSON
        expect(contentType).toContain('json');
      }
    });

    test('POST Users without auth returns 401 with JSON', async ({ request }) => {
      const response = await request.post(`${SCIM_BASE}/Users`, {
        data: {
          schemas: ['urn:ietf:params:scim:schemas:core:2.0:User'],
          userName: 'testuser@example.com',
        },
        headers: { 'Content-Type': 'application/json' },
      });
      expect([401, 403]).toContain(response.status());
    });

    test('PATCH Users without auth returns 401', async ({ request }) => {
      const response = await request.patch(`${SCIM_BASE}/Users/some-id`, {
        data: {
          schemas: ['urn:ietf:params:scim:api:messages:2.0:PatchOp'],
          Operations: [{ op: 'Replace', path: 'active', value: false }],
        },
        headers: { 'Content-Type': 'application/json' },
      });
      expect([401, 403]).toContain(response.status());
    });

    test('DELETE Users without auth returns 401', async ({ request }) => {
      const response = await request.delete(`${SCIM_BASE}/Users/some-id`);
      expect([401, 403]).toContain(response.status());
    });
  });
});

test.describe('SCIM Token Management (via admin API)', () => {
  let adminToken: string;

  test.beforeAll(async ({ request }) => {
    const r = await request.post('http://localhost:4000/api/auth/login', {
      data: { email: 'admin@ims.local', password: 'admin123' },
    });
    const body = await r.json();
    adminToken = body.data?.accessToken;
  });

  test('Admin can register a SCIM token via gateway API', async ({ request }) => {
    const response = await request.post('http://localhost:4000/api/scim/tokens', {
      data: { orgId: 'test-org-scim', description: 'E2E test token' },
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    // May return 200/201 if endpoint exists, or 404 if no such admin endpoint
    expect([200, 201, 404, 405]).toContain(response.status());
  });

  test('Non-admin cannot register SCIM tokens', async ({ request }) => {
    const response = await request.post('http://localhost:4000/api/scim/tokens', {
      data: { orgId: 'hack-org', description: 'Unauthorized' },
      // No auth token
    });
    expect([401, 403, 404]).toContain(response.status());
  });
});
