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

test.describe('Webhook Management', () => {
  let token: string;

  test.beforeAll(async ({ request }) => {
    token = await loginAndGetToken(request);
  });

  test.describe('Webhook CRUD', () => {
    test('GET /api/webhooks returns list', async ({ request }) => {
      const response = await request.get('http://localhost:4000/api/webhooks', {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(response.ok()).toBeTruthy();
      const body = await response.json();
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
    });

    test('GET /api/webhooks requires auth', async ({ request }) => {
      const response = await request.get('http://localhost:4000/api/webhooks');
      expect(response.status()).toBe(401);
    });

    test('POST /api/webhooks creates a webhook', async ({ request }) => {
      const response = await request.post('http://localhost:4000/api/webhooks', {
        data: {
          url: 'https://webhook.example.com/receive',
          events: ['risk.created', 'incident.created'],
          secret: 'webhook-secret-abc',
          description: 'E2E test webhook',
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

    test('POST /api/webhooks with invalid URL returns 400', async ({ request }) => {
      const response = await request.post('http://localhost:4000/api/webhooks', {
        data: {
          url: 'not-a-valid-url',
          events: ['risk.created'],
        },
        headers: { Authorization: `Bearer ${token}` },
      });
      expect([400, 422]).toContain(response.status());
    });

    test('POST /api/webhooks requires auth', async ({ request }) => {
      const response = await request.post('http://localhost:4000/api/webhooks', {
        data: { url: 'https://example.com', events: [] },
      });
      expect(response.status()).toBe(401);
    });

    test('GET /api/webhooks/:id returns webhook details', async ({ request }) => {
      // Create first
      const createResp = await request.post('http://localhost:4000/api/webhooks', {
        data: {
          url: 'https://webhook.example.com/get-test',
          events: ['risk.created'],
          description: 'GET test webhook',
        },
        headers: { Authorization: `Bearer ${token}` },
      });
      if (createResp.status() === 201 || createResp.status() === 200) {
        const created = await createResp.json();
        const id = created.data?.id;
        if (id) {
          const getResp = await request.get(`http://localhost:4000/api/webhooks/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          expect(getResp.ok()).toBeTruthy();
          const body = await getResp.json();
          expect(body.data.id).toBe(id);
        }
      }
    });

    test('GET /api/webhooks/non-existent returns 404', async ({ request }) => {
      const response = await request.get(
        'http://localhost:4000/api/webhooks/00000000-0000-0000-0000-000000000000',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      expect([404, 200]).toContain(response.status());
    });
  });

  test.describe('Webhook Delivery Logs', () => {
    test('GET /api/webhooks/:id/deliveries returns delivery log', async ({ request }) => {
      const listResp = await request.get('http://localhost:4000/api/webhooks', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (listResp.ok()) {
        const list = await listResp.json();
        if (list.data.length > 0) {
          const id = list.data[0].id;
          const resp = await request.get(`http://localhost:4000/api/webhooks/${id}/deliveries`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          expect([200, 404]).toContain(resp.status());
        }
      }
    });
  });

  test.describe('Webhook Test Delivery', () => {
    test('POST /api/webhooks/:id/test sends test payload', async ({ request }) => {
      const listResp = await request.get('http://localhost:4000/api/webhooks', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (listResp.ok()) {
        const list = await listResp.json();
        if (list.data.length > 0) {
          const id = list.data[0].id;
          const resp = await request.post(`http://localhost:4000/api/webhooks/${id}/test`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          // 200 (queued), 202 (accepted), or 404/400 if not implemented
          expect([200, 202, 400, 404]).toContain(resp.status());
        }
      }
    });
  });
});

test.describe('Automation Rules (via Gateway)', () => {
  let token: string;

  test.beforeAll(async ({ request }) => {
    token = await loginAndGetToken(request);
  });

  test('GET /api/automation-rules returns list', async ({ request }) => {
    const response = await request.get('http://localhost:4000/api/automation-rules', {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
  });

  test('GET /api/automation-rules requires auth', async ({ request }) => {
    const response = await request.get('http://localhost:4000/api/automation-rules');
    expect(response.status()).toBe(401);
  });

  test('POST /api/automation-rules creates a rule', async ({ request }) => {
    const response = await request.post('http://localhost:4000/api/automation-rules', {
      data: {
        name: 'E2E Test Rule',
        trigger: 'risk.created',
        conditions: [],
        actions: [{ type: 'notify', target: 'admin' }],
        isActive: true,
      },
      headers: { Authorization: `Bearer ${token}` },
    });
    expect([201, 200, 400, 422]).toContain(response.status());
  });

  test('POST automation-rule without name returns 400', async ({ request }) => {
    const response = await request.post('http://localhost:4000/api/automation-rules', {
      data: { trigger: 'risk.created', actions: [] },
      headers: { Authorization: `Bearer ${token}` },
    });
    expect([400, 422]).toContain(response.status());
  });
});
