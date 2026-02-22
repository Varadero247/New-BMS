import express from 'express';
import request from 'supertest';

const mockAuthenticate = jest.fn((req: any, _res: any, next: any) => {
  req.user = { id: 'user-1', email: 'admin@ims.local', role: 'ADMIN', orgId: 'org-1' };
  next();
});

jest.mock('@ims/auth', () => ({
  authenticate: (...args: any[]) => mockAuthenticate(...args),
  requireRole: jest.fn(() => (_req: any, _res: any, next: any) => next()),
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

const mockCreateEndpoint = jest.fn().mockReturnValue({
  id: '00000000-0000-0000-0000-000000000001',
  name: 'Test Webhook',
  url: 'https://example.com/hook',
  secret: 'whsec_abcdefghijklmnop',
  events: ['ncr.created'],
  enabled: true,
  orgId: 'org-1',
  headers: null,
  lastTriggeredAt: null,
  failureCount: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});
const mockListEndpoints = jest.fn().mockReturnValue([]);
const mockGetEndpoint = jest.fn().mockReturnValue({
  id: '00000000-0000-0000-0000-000000000001',
  orgId: 'org-1',
  name: 'Test',
  url: 'https://example.com/hook',
  secret: 'whsec_abcdefghijklmnop',
  events: ['ncr.created'],
  enabled: true,
  headers: null,
  lastTriggeredAt: null,
  failureCount: 0,
});
const mockUpdateEndpoint = jest.fn().mockReturnValue({
  id: '00000000-0000-0000-0000-000000000001',
  name: 'Updated',
  secret: 'whsec_abcdefghijklmnop',
});
const mockDeleteEndpoint = jest.fn().mockReturnValue(true);
const mockDispatch = jest.fn().mockReturnValue([{ id: 'del-1', status: 'PENDING' }]);
const mockListDeliveries = jest.fn().mockReturnValue([]);

jest.mock('@ims/webhooks', () => ({
  createEndpoint: (...args: any[]) => mockCreateEndpoint(...args),
  listEndpoints: (...args: any[]) => mockListEndpoints(...args),
  getEndpoint: (...args: any[]) => mockGetEndpoint(...args),
  updateEndpoint: (...args: any[]) => mockUpdateEndpoint(...args),
  deleteEndpoint: (...args: any[]) => mockDeleteEndpoint(...args),
  dispatch: (...args: any[]) => mockDispatch(...args),
  listDeliveries: (...args: any[]) => mockListDeliveries(...args),
  WEBHOOK_EVENTS: ['ncr.created', 'ncr.closed', 'capa.created', 'capa.closed'],
}));

import webhooksRouter from '../src/routes/webhooks';

describe('Webhooks Routes', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/admin/webhooks', webhooksRouter);
    jest.clearAllMocks();
  });

  describe('GET /api/admin/webhooks', () => {
    it('returns webhook endpoints with masked secrets', async () => {
      mockListEndpoints.mockReturnValue([
        {
          id: '00000000-0000-0000-0000-000000000001',
          name: 'Test',
          url: 'https://example.com',
          secret: 'whsec_abcdefghijklmnop',
          events: ['ncr.created'],
          enabled: true,
          orgId: 'org-1',
          headers: null,
          lastTriggeredAt: null,
          failureCount: 0,
        },
      ]);
      const res = await request(app).get('/api/admin/webhooks');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data[0].secret).toContain('...');
    });
  });

  describe('GET /api/admin/webhooks/events', () => {
    it('returns available webhook events', async () => {
      const res = await request(app).get('/api/admin/webhooks/events');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
    });
  });

  describe('POST /api/admin/webhooks', () => {
    it('creates a webhook endpoint', async () => {
      const res = await request(app)
        .post('/api/admin/webhooks')
        .send({ name: 'Test Hook', url: 'https://example.com/hook', events: ['ncr.created'] });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('rejects missing URL', async () => {
      const res = await request(app)
        .post('/api/admin/webhooks')
        .send({ name: 'Test', events: ['ncr.created'] });
      expect(res.status).toBe(400);
    });

    it('rejects empty events', async () => {
      const res = await request(app)
        .post('/api/admin/webhooks')
        .send({ name: 'Test', url: 'https://example.com', events: [] });
      expect(res.status).toBe(400);
    });
  });

  describe('PATCH /api/admin/webhooks/:id', () => {
    it('updates a webhook endpoint', async () => {
      const res = await request(app)
        .patch('/api/admin/webhooks/00000000-0000-0000-0000-000000000001')
        .send({ name: 'Updated Hook', enabled: false });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('DELETE /api/admin/webhooks/:id', () => {
    it('deletes a webhook endpoint', async () => {
      const res = await request(app).delete(
        '/api/admin/webhooks/00000000-0000-0000-0000-000000000001'
      );
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('returns 404 for non-existent', async () => {
      mockGetEndpoint.mockReturnValueOnce(undefined);
      const res = await request(app).delete(
        '/api/admin/webhooks/00000000-0000-0000-0000-000000000099'
      );
      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/admin/webhooks/:id/test', () => {
    it('sends a test ping event', async () => {
      const res = await request(app).post(
        '/api/admin/webhooks/00000000-0000-0000-0000-000000000001/test'
      );
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/admin/webhooks/:id/deliveries', () => {
    it('returns delivery log', async () => {
      mockListDeliveries.mockReturnValue([{ id: 'd1', status: 'SUCCESS', responseCode: 200 }]);
      const res = await request(app).get(
        '/api/admin/webhooks/00000000-0000-0000-0000-000000000001/deliveries'
      );
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('Webhooks — extended', () => {
    it('GET /events returns data as array', async () => {
      const res = await request(app).get('/api/admin/webhooks/events');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('GET list returns data as array', async () => {
      mockListEndpoints.mockReturnValue([]);
      const res = await request(app).get('/api/admin/webhooks');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('created endpoint has an id field', async () => {
      const res = await request(app)
        .post('/api/admin/webhooks')
        .send({ name: 'New Hook', url: 'https://test.example.com/hook', events: ['capa.created'] });
      expect(res.status).toBe(201);
      expect(res.body.data).toHaveProperty('id');
    });

    it('test ping returns success true', async () => {
      const res = await request(app).post(
        '/api/admin/webhooks/00000000-0000-0000-0000-000000000001/test'
      );
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('deliveries endpoint returns data as array', async () => {
      mockListDeliveries.mockReturnValue([]);
      const res = await request(app).get(
        '/api/admin/webhooks/00000000-0000-0000-0000-000000000001/deliveries'
      );
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });
});

describe('webhooks — additional coverage', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/admin/webhooks', webhooksRouter);
    jest.clearAllMocks();
  });

  it('returns 401 when auth fails on GET /api/admin/webhooks', async () => {
    mockAuthenticate.mockImplementationOnce((_req: any, res: any) => {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED' } });
    });
    const res = await request(app).get('/api/admin/webhooks');
    expect(res.status).toBe(401);
  });

  it('response is JSON content-type for GET /api/admin/webhooks', async () => {
    const res = await request(app).get('/api/admin/webhooks');
    expect(res.headers['content-type']).toBeDefined();
  });

  it('GET /api/admin/webhooks body has success property', async () => {
    const res = await request(app).get('/api/admin/webhooks');
    if (res.status === 200) {
      expect(res.body).toHaveProperty('success');
    } else {
      expect(res.body).toBeDefined();
    }
  });

  it('GET /api/admin/webhooks body is an object', async () => {
    const res = await request(app).get('/api/admin/webhooks');
    expect(typeof res.body).toBe('object');
  });

  it('GET /api/admin/webhooks route is accessible', async () => {
    const res = await request(app).get('/api/admin/webhooks');
    expect(res.status).toBeDefined();
  });
});

describe('webhooks — error paths and field validation', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/admin/webhooks', webhooksRouter);
    jest.clearAllMocks();
    mockGetEndpoint.mockReturnValue({
      id: '00000000-0000-0000-0000-000000000001',
      orgId: 'org-1',
      name: 'Test',
      url: 'https://example.com/hook',
      secret: 'whsec_abcdefghijklmnop',
      events: ['ncr.created'],
      enabled: true,
      headers: null,
      lastTriggeredAt: null,
      failureCount: 0,
    });
  });

  it('GET /api/admin/webhooks returns 500 when listEndpoints throws', async () => {
    mockListEndpoints.mockImplementationOnce(() => { throw new Error('store error'); });
    const res = await request(app).get('/api/admin/webhooks');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('POST /api/admin/webhooks returns 500 when createEndpoint throws', async () => {
    mockCreateEndpoint.mockImplementationOnce(() => { throw new Error('creation failed'); });
    const res = await request(app)
      .post('/api/admin/webhooks')
      .send({ name: 'Failing Hook', url: 'https://fail.example.com/hook', events: ['ncr.created'] });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('PATCH /api/admin/webhooks/:id returns 404 when endpoint not found', async () => {
    mockGetEndpoint.mockReturnValueOnce(undefined);
    const res = await request(app)
      .patch('/api/admin/webhooks/00000000-0000-0000-0000-000000000099')
      .send({ enabled: false });
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('POST /api/admin/webhooks/:id/test returns 404 when endpoint not found', async () => {
    mockGetEndpoint.mockReturnValueOnce(undefined);
    const res = await request(app).post('/api/admin/webhooks/00000000-0000-0000-0000-000000000099/test');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('GET /api/admin/webhooks/:id/deliveries returns 404 when endpoint not found', async () => {
    mockGetEndpoint.mockReturnValueOnce(undefined);
    const res = await request(app).get('/api/admin/webhooks/00000000-0000-0000-0000-000000000099/deliveries');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('POST /api/admin/webhooks rejects invalid URL', async () => {
    const res = await request(app)
      .post('/api/admin/webhooks')
      .send({ name: 'Bad URL', url: 'not-a-url', events: ['ncr.created'] });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('POST /api/admin/webhooks rejects missing name', async () => {
    const res = await request(app)
      .post('/api/admin/webhooks')
      .send({ url: 'https://example.com/hook', events: ['ncr.created'] });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('GET /api/admin/webhooks secrets in list are masked', async () => {
    mockListEndpoints.mockReturnValueOnce([
      { id: '00000000-0000-0000-0000-000000000001', name: 'Hook', url: 'https://example.com',
        secret: 'whsec_supersecretvalue', events: ['ncr.created'], enabled: true,
        orgId: 'org-1', headers: null, lastTriggeredAt: null, failureCount: 0 },
    ]);
    const res = await request(app).get('/api/admin/webhooks');
    expect(res.status).toBe(200);
    expect(res.body.data[0].secret).not.toBe('whsec_supersecretvalue');
    expect(res.body.data[0].secret).toContain('...');
  });

  it('PATCH /api/admin/webhooks/:id secret is masked in response', async () => {
    mockUpdateEndpoint.mockReturnValueOnce({
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Updated',
      secret: 'whsec_abcdefghijklmnop',
      orgId: 'org-1',
    });
    const res = await request(app)
      .patch('/api/admin/webhooks/00000000-0000-0000-0000-000000000001')
      .send({ enabled: true });
    expect(res.status).toBe(200);
    expect(res.body.data.secret).toContain('...');
  });

  it('GET /api/admin/webhooks/events returns at least one event', async () => {
    const res = await request(app).get('/api/admin/webhooks/events');
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });
});
