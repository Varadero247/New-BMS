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
  id: '00000000-0000-0000-0000-000000000001', name: 'Test Webhook', url: 'https://example.com/hook',
  secret: 'whsec_abcdefghijklmnop', events: ['ncr.created'], enabled: true, orgId: 'org-1',
  headers: null, lastTriggeredAt: null, failureCount: 0,
  createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
});
const mockListEndpoints = jest.fn().mockReturnValue([]);
const mockGetEndpoint = jest.fn().mockReturnValue({
  id: '00000000-0000-0000-0000-000000000001', orgId: 'org-1', name: 'Test', url: 'https://example.com/hook',
  secret: 'whsec_abcdefghijklmnop', events: ['ncr.created'], enabled: true,
  headers: null, lastTriggeredAt: null, failureCount: 0,
});
const mockUpdateEndpoint = jest.fn().mockReturnValue({
  id: '00000000-0000-0000-0000-000000000001', name: 'Updated', secret: 'whsec_abcdefghijklmnop',
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
      mockListEndpoints.mockReturnValue([{
        id: '00000000-0000-0000-0000-000000000001', name: 'Test', url: 'https://example.com',
        secret: 'whsec_abcdefghijklmnop', events: ['ncr.created'], enabled: true,
        orgId: 'org-1', headers: null, lastTriggeredAt: null, failureCount: 0,
      }]);
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
      const res = await request(app).delete('/api/admin/webhooks/00000000-0000-0000-0000-000000000001');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('returns 404 for non-existent', async () => {
      mockGetEndpoint.mockReturnValueOnce(undefined);
      const res = await request(app).delete('/api/admin/webhooks/00000000-0000-0000-0000-000000000099');
      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/admin/webhooks/:id/test', () => {
    it('sends a test ping event', async () => {
      const res = await request(app).post('/api/admin/webhooks/00000000-0000-0000-0000-000000000001/test');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/admin/webhooks/:id/deliveries', () => {
    it('returns delivery log', async () => {
      mockListDeliveries.mockReturnValue([{ id: 'd1', status: 'SUCCESS', responseCode: 200 }]);
      const res = await request(app).get('/api/admin/webhooks/00000000-0000-0000-0000-000000000001/deliveries');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
