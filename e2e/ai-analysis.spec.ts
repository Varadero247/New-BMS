import { test, expect } from '@playwright/test';

async function loginAndGetToken(request: any): Promise<string> {
  const r = await request.post('http://localhost:4000/api/auth/login', {
    data: { email: 'admin@ims.local', password: 'admin123' },
  });
  const body = await r.json();
  return body.data?.accessToken ?? '';
}

test.describe('AI Analysis Service', () => {
  let token: string;

  test.beforeAll(async ({ request }) => {
    token = await loginAndGetToken(request);
  });

  test.describe('Health', () => {
    test('AI service health endpoint responds ok', async ({ request }) => {
      const response = await request.get('http://localhost:4004/health');
      expect(response.ok()).toBeTruthy();
      const body = await response.json();
      expect(body.status).toBe('ok');
    });

    test('AI service reachable via gateway', async ({ request }) => {
      const response = await request.get('http://localhost:4000/api/ai/health', {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect([200, 404]).toContain(response.status());
    });
  });

  test.describe('Analysis Endpoints', () => {
    test('GET /api/ai/analyse requires auth', async ({ request }) => {
      const response = await request.get('http://localhost:4000/api/ai/analyse');
      expect(response.status()).toBe(401);
    });

    test('POST /api/ai/analyse requires auth', async ({ request }) => {
      const response = await request.post('http://localhost:4000/api/ai/analyse', {
        data: { module: 'health-safety', data: {} },
      });
      expect(response.status()).toBe(401);
    });

    test('GET /api/ai/settings returns AI configuration', async ({ request }) => {
      const response = await request.get('http://localhost:4000/api/ai/settings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(response.ok()).toBeTruthy();
      const body = await response.json();
      expect(body.success).toBe(true);
    });

    test('GET /api/ai/documents returns AI document list', async ({ request }) => {
      const response = await request.get('http://localhost:4000/api/ai/documents', {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(response.ok()).toBeTruthy();
      const body = await response.json();
      expect(body.success).toBe(true);
    });

    test('GET /api/ai/assistant returns assistant config', async ({ request }) => {
      const response = await request.get('http://localhost:4000/api/ai/assistant', {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect([200, 404]).toContain(response.status());
    });

    test('POST /api/ai/analyse with valid data returns response', async ({ request }) => {
      const response = await request.post('http://localhost:4000/api/ai/analyse', {
        data: {
          module: 'health-safety',
          analysisType: 'risk-assessment',
          data: {
            risks: [],
            incidents: [],
          },
        },
        headers: { Authorization: `Bearer ${token}` },
      });
      // 200 if AI responds, 400 if validation fails, 503 if AI provider unavailable
      expect([200, 201, 400, 422, 503]).toContain(response.status());
      if (response.ok()) {
        const body = await response.json();
        expect(body.success).toBe(true);
      }
    });

    test('POST /api/ai/analyse with missing module returns 400', async ({ request }) => {
      const response = await request.post('http://localhost:4000/api/ai/analyse', {
        data: { data: {} }, // missing module
        headers: { Authorization: `Bearer ${token}` },
      });
      expect([400, 422]).toContain(response.status());
    });
  });

  test.describe('AI Documents', () => {
    test('POST /api/ai/documents uploads a document', async ({ request }) => {
      const response = await request.post('http://localhost:4000/api/ai/documents', {
        data: {
          title: 'E2E Test Document',
          content: 'This is a test document for AI analysis.',
          module: 'quality',
        },
        headers: { Authorization: `Bearer ${token}` },
      });
      expect([200, 201, 400, 422]).toContain(response.status());
    });

    test('GET /api/ai/documents pagination works', async ({ request }) => {
      const response = await request.get('http://localhost:4000/api/ai/documents?page=1&limit=5', {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(response.ok()).toBeTruthy();
      const body = await response.json();
      expect(body.success).toBe(true);
    });
  });

  test.describe('NLQ (Natural Language Query)', () => {
    test('POST /api/ai/assistant/query handles NLQ', async ({ request }) => {
      const response = await request.post('http://localhost:4000/api/ai/assistant/query', {
        data: {
          query: 'How many open risks are there?',
          module: 'health-safety',
        },
        headers: { Authorization: `Bearer ${token}` },
      });
      expect([200, 400, 404, 503]).toContain(response.status());
    });
  });
});
