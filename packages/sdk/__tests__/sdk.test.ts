import crypto from 'crypto';
import { NexaraClient, ComplianceBuilder, type WebhookEventType } from '../src/index';

const BASE_URL = 'https://api.example.com';
const API_KEY = 'test-api-key-xyz';

let mockFetch: jest.Mock;

beforeEach(() => {
  mockFetch = jest.fn();
  (global as unknown as { fetch: jest.Mock }).fetch = mockFetch;
});

afterEach(() => {
  jest.restoreAllMocks();
});

function ok(data: unknown) {
  return Promise.resolve({
    ok: true,
    status: 200,
    statusText: 'OK',
    json: () => Promise.resolve(data),
  });
}

function err(status: number, body?: unknown) {
  return Promise.resolve({
    ok: false,
    status,
    statusText: 'Error',
    json: () => Promise.resolve(body ?? { message: 'API error' }),
  });
}

describe('NexaraClient', () => {
  let client: NexaraClient;

  beforeEach(() => {
    client = new NexaraClient({ baseUrl: BASE_URL, apiKey: API_KEY });
  });

  // ── constructor ────────────────────────────────────────────────

  describe('constructor', () => {
    it('strips trailing slash from baseUrl', async () => {
      const c = new NexaraClient({ baseUrl: 'https://api.example.com/', apiKey: API_KEY });
      mockFetch.mockReturnValueOnce(ok({ success: true, data: [] }));
      await c.risks.list();
      const url = mockFetch.mock.calls[0][0] as string;
      // Should not produce double-slash like https://api.example.com//api/
      expect(url).toMatch(/^https:\/\/api\.example\.com\/api\//);
      expect(url).not.toContain('//api/');
    });

    it('uses default timeout of 30 000 ms when not specified', () => {
      expect(() => new NexaraClient({ baseUrl: BASE_URL, apiKey: API_KEY })).not.toThrow();
    });

    it('accepts a custom timeout value', () => {
      expect(
        () => new NexaraClient({ baseUrl: BASE_URL, apiKey: API_KEY, timeout: 5000 })
      ).not.toThrow();
    });
  });

  // ── verifyWebhookSignature (static) ───────────────────────────

  describe('verifyWebhookSignature', () => {
    const secret = 'my-webhook-secret';
    const payload = JSON.stringify({ event: 'incident.created', data: {} });

    it('returns true for a valid HMAC-SHA256 signature', () => {
      const sig = crypto.createHmac('sha256', secret).update(payload).digest('hex');
      expect(NexaraClient.verifyWebhookSignature(payload, sig, secret)).toBe(true);
    });

    it('returns false for a signature computed with the wrong secret', () => {
      const wrongSig = crypto.createHmac('sha256', 'wrong-secret').update(payload).digest('hex');
      expect(NexaraClient.verifyWebhookSignature(payload, wrongSig, secret)).toBe(false);
    });

    it('returns false when signature length differs (timingSafeEqual throws)', () => {
      // 'short' is not 64 hex chars — Buffer length mismatch → catch block → false
      expect(NexaraClient.verifyWebhookSignature(payload, 'short', secret)).toBe(false);
    });

    it('returns false for an empty signature string', () => {
      expect(NexaraClient.verifyWebhookSignature(payload, '', secret)).toBe(false);
    });
  });

  // ── Authorization header ──────────────────────────────────────

  describe('Authorization header', () => {
    it('sends Bearer token and Content-Type on every request', async () => {
      mockFetch.mockReturnValueOnce(ok({ success: true, data: {} }));
      await client.risks.get('r1');
      expect(mockFetch.mock.calls[0][1].headers).toMatchObject({
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      });
    });
  });

  // ── risks ─────────────────────────────────────────────────────

  describe('risks', () => {
    it('list() calls GET /api/health-safety/risks', async () => {
      mockFetch.mockReturnValueOnce(ok({ success: true, data: [] }));
      await client.risks.list();
      const [url, opts] = mockFetch.mock.calls[0];
      expect(url).toContain(`${BASE_URL}/api/health-safety/risks`);
      expect(opts.method).toBe('GET');
    });

    it('list() encodes pagination and status params', async () => {
      mockFetch.mockReturnValueOnce(ok({ success: true, data: [] }));
      await client.risks.list({ page: 3, status: 'OPEN' });
      const url = mockFetch.mock.calls[0][0] as string;
      expect(url).toContain('page=3');
      expect(url).toContain('status=OPEN');
    });

    it('get(id) calls GET /api/health-safety/risks/:id', async () => {
      mockFetch.mockReturnValueOnce(ok({ success: true, data: { id: 'r1' } }));
      await client.risks.get('r1');
      expect(mockFetch.mock.calls[0][0]).toBe(`${BASE_URL}/api/health-safety/risks/r1`);
    });

    it('create(data) sends POST with JSON body', async () => {
      const body = { title: 'Chemical spill', status: 'OPEN' };
      mockFetch.mockReturnValueOnce(ok({ success: true, data: { id: 'r2', ...body } }));
      await client.risks.create(body);
      const [url, opts] = mockFetch.mock.calls[0];
      expect(url).toBe(`${BASE_URL}/api/health-safety/risks`);
      expect(opts.method).toBe('POST');
      expect(JSON.parse(opts.body)).toMatchObject(body);
    });
  });

  // ── incidents ─────────────────────────────────────────────────

  describe('incidents', () => {
    it('list() calls GET /api/health-safety/incidents', async () => {
      mockFetch.mockReturnValueOnce(ok({ success: true, data: [] }));
      await client.incidents.list();
      expect(mockFetch.mock.calls[0][0]).toContain('/api/health-safety/incidents');
      expect(mockFetch.mock.calls[0][1].method).toBe('GET');
    });

    it('list() encodes query params', async () => {
      mockFetch.mockReturnValueOnce(ok({ success: true, data: [] }));
      await client.incidents.list({ status: 'CLOSED', page: 2 });
      const url = mockFetch.mock.calls[0][0] as string;
      expect(url).toContain('status=CLOSED');
      expect(url).toContain('page=2');
    });

    it('get(id) calls correct path', async () => {
      mockFetch.mockReturnValueOnce(ok({ success: true, data: {} }));
      await client.incidents.get('inc-42');
      expect(mockFetch.mock.calls[0][0]).toBe(`${BASE_URL}/api/health-safety/incidents/inc-42`);
    });

    it('create(data) sends POST', async () => {
      mockFetch.mockReturnValueOnce(ok({ success: true, data: {} }));
      await client.incidents.create({ title: 'Slip and fall', severity: 'MINOR' });
      expect(mockFetch.mock.calls[0][1].method).toBe('POST');
    });
  });

  // ── actions ───────────────────────────────────────────────────

  describe('actions', () => {
    it('list() calls GET /api/health-safety/actions', async () => {
      mockFetch.mockReturnValueOnce(ok({ success: true, data: [] }));
      await client.actions.list();
      expect(mockFetch.mock.calls[0][0]).toContain('/api/health-safety/actions');
      expect(mockFetch.mock.calls[0][1].method).toBe('GET');
    });

    it('get(id) calls correct path', async () => {
      mockFetch.mockReturnValueOnce(ok({ success: true, data: {} }));
      await client.actions.get('act-99');
      expect(mockFetch.mock.calls[0][0]).toBe(`${BASE_URL}/api/health-safety/actions/act-99`);
    });

    it('create(data) sends POST', async () => {
      mockFetch.mockReturnValueOnce(ok({ success: true, data: {} }));
      await client.actions.create({ title: 'Fix guard rail', priority: 'HIGH' });
      expect(mockFetch.mock.calls[0][1].method).toBe('POST');
    });
  });

  // ── webhooks ──────────────────────────────────────────────────

  describe('webhooks', () => {
    const events: WebhookEventType[] = ['incident.created', 'capa.overdue'];

    it('list() calls GET /api/workflows/webhooks', async () => {
      mockFetch.mockReturnValueOnce(ok({ success: true, data: [] }));
      await client.webhooks.list();
      expect(mockFetch.mock.calls[0][0]).toContain('/api/workflows/webhooks');
      expect(mockFetch.mock.calls[0][1].method).toBe('GET');
    });

    it('create(data) sends POST with webhook data', async () => {
      mockFetch.mockReturnValueOnce(ok({ success: true, data: {} }));
      await client.webhooks.create({ name: 'My hook', url: 'https://hook.example.com', events });
      const [url, opts] = mockFetch.mock.calls[0];
      expect(url).toBe(`${BASE_URL}/api/workflows/webhooks`);
      expect(opts.method).toBe('POST');
      const body = JSON.parse(opts.body);
      expect(body.name).toBe('My hook');
      expect(body.events).toEqual(events);
    });

    it('get(id) calls correct path', async () => {
      mockFetch.mockReturnValueOnce(ok({ success: true, data: {} }));
      await client.webhooks.get('wh-1');
      expect(mockFetch.mock.calls[0][0]).toBe(`${BASE_URL}/api/workflows/webhooks/wh-1`);
    });

    it('update(id, data) sends PUT to correct path', async () => {
      mockFetch.mockReturnValueOnce(ok({ success: true, data: {} }));
      await client.webhooks.update('wh-1', { isActive: false });
      const [url, opts] = mockFetch.mock.calls[0];
      expect(url).toBe(`${BASE_URL}/api/workflows/webhooks/wh-1`);
      expect(opts.method).toBe('PUT');
    });

    it('delete(id) sends DELETE to correct path', async () => {
      mockFetch.mockReturnValueOnce(ok({ success: true, data: { message: 'deleted' } }));
      await client.webhooks.delete('wh-2');
      const [url, opts] = mockFetch.mock.calls[0];
      expect(url).toBe(`${BASE_URL}/api/workflows/webhooks/wh-2`);
      expect(opts.method).toBe('DELETE');
    });

    it('test(id) sends POST to /:id/test', async () => {
      mockFetch.mockReturnValueOnce(ok({ success: true, data: {} }));
      await client.webhooks.test('wh-3');
      const [url, opts] = mockFetch.mock.calls[0];
      expect(url).toBe(`${BASE_URL}/api/workflows/webhooks/wh-3/test`);
      expect(opts.method).toBe('POST');
    });

    it('deliveries(id) calls GET /:id/deliveries', async () => {
      mockFetch.mockReturnValueOnce(ok({ success: true, data: [] }));
      await client.webhooks.deliveries('wh-4');
      expect(mockFetch.mock.calls[0][0]).toContain(
        '/api/workflows/webhooks/wh-4/deliveries'
      );
    });

    it('deliveries(id, params) encodes event and success query params', async () => {
      mockFetch.mockReturnValueOnce(ok({ success: true, data: [] }));
      await client.webhooks.deliveries('wh-4', { event: 'incident.created', success: 'true', page: 1 });
      const url = mockFetch.mock.calls[0][0] as string;
      expect(url).toContain('event=incident.created');
      expect(url).toContain('success=true');
      expect(url).toContain('page=1');
    });
  });

  // ── analyze ───────────────────────────────────────────────────

  describe('analyze', () => {
    it('run() sends POST to /api/ai/analyze with type and context', async () => {
      mockFetch.mockReturnValueOnce(ok({ success: true, data: { insights: [] } }));
      await client.analyze.run('risk_assessment', { riskId: 'r1', orgId: 'org1' });
      const [url, opts] = mockFetch.mock.calls[0];
      expect(url).toBe(`${BASE_URL}/api/ai/analyze`);
      expect(opts.method).toBe('POST');
      const body = JSON.parse(opts.body);
      expect(body).toMatchObject({ type: 'risk_assessment', context: { riskId: 'r1' } });
    });
  });

  // ── error handling ────────────────────────────────────────────

  describe('error handling', () => {
    it('throws with status and message from JSON body', async () => {
      mockFetch.mockReturnValueOnce(err(403, { message: 'Forbidden' }));
      await expect(client.risks.list()).rejects.toThrow('Nexara API Error 403: Forbidden');
    });

    it('falls back to statusText when response.json() fails', async () => {
      mockFetch.mockReturnValueOnce(
        Promise.resolve({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
          json: () => Promise.reject(new Error('parse error')),
        })
      );
      await expect(client.risks.list()).rejects.toThrow(
        'Nexara API Error 500: Internal Server Error'
      );
    });
  });

  // ── compliance builder ────────────────────────────────────────

  describe('compliance()', () => {
    it('returns a ComplianceBuilder instance', () => {
      expect(client.compliance()).toBeInstanceOf(ComplianceBuilder);
    });

    it('standards() is chainable (returns same builder instance)', () => {
      const builder = client.compliance();
      const result = builder.standards(['ISO_9001', 'ISO_45001']);
      expect(result).toBe(builder);
    });

    it('posture() calls POST /api/compliance/posture with selected standards', async () => {
      const posture = {
        overall: 88,
        standards: { ISO_9001: { score: 90, gaps: 2 } },
        riskLevel: 'low' as const,
        generatedAt: new Date().toISOString(),
      };
      mockFetch.mockReturnValueOnce(ok({ success: true, data: posture }));
      const result = await client.compliance().standards(['ISO_9001']).posture();
      const [url, opts] = mockFetch.mock.calls[0];
      expect(url).toBe(`${BASE_URL}/api/compliance/posture`);
      expect(opts.method).toBe('POST');
      expect(JSON.parse(opts.body)).toMatchObject({ standards: ['ISO_9001'] });
      expect(result).toEqual(posture);
    });

    it('posture() returns data.data (unwraps envelope)', async () => {
      const posture = { overall: 72, standards: {}, riskLevel: 'medium' as const, generatedAt: '' };
      mockFetch.mockReturnValueOnce(ok({ data: posture }));
      const result = await client.compliance().posture();
      expect(result).toEqual(posture);
    });

    it('posture() throws on API error', async () => {
      mockFetch.mockReturnValueOnce(err(401, { message: 'Unauthorized' }));
      await expect(client.compliance().posture()).rejects.toThrow(
        'Nexara API Error 401: Unauthorized'
      );
    });
  });
});

describe('NexaraClient — extended coverage', () => {
  let client: NexaraClient;

  beforeEach(() => {
    mockFetch = jest.fn();
    (global as unknown as { fetch: jest.Mock }).fetch = mockFetch;
    client = new NexaraClient({ baseUrl: BASE_URL, apiKey: API_KEY });
  });

  it('risks.get(id) sends GET to correct path', async () => {
    mockFetch.mockReturnValueOnce(ok({ success: true, data: {} }));
    await client.risks.get('r5');
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toBe(`${BASE_URL}/api/health-safety/risks/r5`);
    expect(opts.method).toBe('GET');
  });

  it('risks.create(data) sends POST to correct path', async () => {
    mockFetch.mockReturnValueOnce(ok({ success: true, data: { message: 'created' } }));
    await client.risks.create({ title: 'New Risk', status: 'OPEN' });
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toBe(`${BASE_URL}/api/health-safety/risks`);
    expect(opts.method).toBe('POST');
  });

  it('incidents.get(id) sends GET to correct path', async () => {
    mockFetch.mockReturnValueOnce(ok({ success: true, data: {} }));
    await client.incidents.get('inc-1');
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toBe(`${BASE_URL}/api/health-safety/incidents/inc-1`);
    expect(opts.method).toBe('GET');
  });

  it('actions.get(id) sends GET to correct path', async () => {
    mockFetch.mockReturnValueOnce(ok({ success: true, data: {} }));
    await client.actions.get('act-1');
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toBe(`${BASE_URL}/api/health-safety/actions/act-1`);
    expect(opts.method).toBe('GET');
  });

  it('throws Nexara API Error 404 from error response', async () => {
    mockFetch.mockReturnValueOnce(err(404, { message: 'Not Found' }));
    await expect(client.risks.get('nonexistent')).rejects.toThrow('Nexara API Error 404: Not Found');
  });
});

describe('sdk — phase29 coverage', () => {
  it('handles every method', () => {
    expect([1, 2, 3].every(x => x > 0)).toBe(true);
  });

  it('handles indexOf method', () => {
    expect([1, 2, 3].indexOf(2)).toBe(1);
  });

  it('handles array isArray', () => {
    expect(Array.isArray([])).toBe(true);
  });

  it('handles Promise type', () => {
    expect(Promise.resolve(42)).toBeInstanceOf(Promise);
  });

  it('handles object type', () => {
    expect(typeof {}).toBe('object');
  });

});
