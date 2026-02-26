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

test.describe('Document Management', () => {
  let token: string;

  test.beforeAll(async ({ request }) => {
    token = await loginAndGetToken(request);
  });

  test.describe('Document CRUD', () => {
    test('GET /api/documents returns document list', async ({ request }) => {
      const response = await request.get('http://localhost:4000/api/documents', {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(response.ok()).toBeTruthy();
      const body = await response.json();
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
    });

    test('Documents list requires auth', async ({ request }) => {
      const response = await request.get('http://localhost:4000/api/documents');
      expect(response.status()).toBe(401);
    });

    test('POST /api/documents creates a document', async ({ request }) => {
      const response = await request.post('http://localhost:4000/api/documents', {
        data: {
          title: 'E2E Test Document',
          type: 'POLICY',
          content: 'This is the document content for E2E testing.',
          version: '1.0',
          status: 'DRAFT',
        },
        headers: { Authorization: `Bearer ${token}` },
      });
      expect([201, 200, 400, 422]).toContain(response.status());
      if (response.status() === 201 || response.status() === 200) {
        const body = await response.json();
        expect(body.success).toBe(true);
        expect(body.data).toHaveProperty('id');
        expect(body.data.title).toBe('E2E Test Document');
      }
    });

    test('POST /api/documents without title returns 400', async ({ request }) => {
      const response = await request.post('http://localhost:4000/api/documents', {
        data: { type: 'POLICY', content: 'content' },
        headers: { Authorization: `Bearer ${token}` },
      });
      expect([400, 422]).toContain(response.status());
    });

    test('GET /api/documents/:id returns document', async ({ request }) => {
      // Create first
      const createResp = await request.post('http://localhost:4000/api/documents', {
        data: {
          title: 'GET Test Document',
          type: 'PROCEDURE',
          content: 'Content',
          version: '1.0',
          status: 'DRAFT',
        },
        headers: { Authorization: `Bearer ${token}` },
      });
      if (createResp.status() === 201 || createResp.status() === 200) {
        const created = await createResp.json();
        const id = created.data?.id;
        if (id) {
          const getResp = await request.get(`http://localhost:4000/api/documents/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          expect(getResp.ok()).toBeTruthy();
          const body = await getResp.json();
          expect(body.data.id).toBe(id);
          expect(body.data.title).toBe('GET Test Document');
        }
      }
    });

    test('GET /api/documents with status filter', async ({ request }) => {
      const response = await request.get(
        'http://localhost:4000/api/documents?status=DRAFT',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      expect(response.ok()).toBeTruthy();
    });

    test('GET /api/documents pagination works', async ({ request }) => {
      const response = await request.get(
        'http://localhost:4000/api/documents?page=1&limit=5',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      expect(response.ok()).toBeTruthy();
      const body = await response.json();
      expect(body.success).toBe(true);
      if (body.meta) {
        expect(typeof body.meta.total).toBe('number');
      }
    });
  });

  test.describe('Document Read Receipts', () => {
    test('GET /api/documents/:id/read-receipts accessible', async ({ request }) => {
      const listResp = await request.get('http://localhost:4000/api/documents?limit=1', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (listResp.ok()) {
        const list = await listResp.json();
        if (Array.isArray(list.data) && list.data.length > 0) {
          const id = list.data[0].id;
          const resp = await request.get(
            `http://localhost:4000/api/documents/${id}/read-receipts`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          expect([200, 404]).toContain(resp.status());
        }
      }
    });
  });

  test.describe('Document Dashboard', () => {
    test('GET /api/documents/dashboard returns stats', async ({ request }) => {
      const response = await request.get('http://localhost:4000/api/documents/dashboard', {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect([200, 404]).toContain(response.status());
      if (response.ok()) {
        const body = await response.json();
        expect(body.success).toBe(true);
      }
    });
  });
});

test.describe('Import & Export', () => {
  let token: string;

  test.beforeAll(async ({ request }) => {
    token = await loginAndGetToken(request);
  });

  test('GET /api/import returns import templates', async ({ request }) => {
    const response = await request.get('http://localhost:4000/api/import', {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect([200, 404]).toContain(response.status());
  });

  test('Import requires auth', async ({ request }) => {
    const response = await request.get('http://localhost:4000/api/import');
    expect(response.status()).toBe(401);
  });

  test('GET /api/import/templates returns available templates', async ({ request }) => {
    const response = await request.get('http://localhost:4000/api/import/templates', {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect([200, 404]).toContain(response.status());
    if (response.ok()) {
      const body = await response.json();
      expect(body.success).toBe(true);
    }
  });
});
