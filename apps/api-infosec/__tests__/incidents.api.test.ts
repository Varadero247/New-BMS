import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    isIncident: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
  },
  Prisma: { Decimal: jest.fn((v: any) => v) },
}));

jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((req: any, _res: any, next: any) => {
    req.user = { id: 'user-123', email: 'test@test.com', role: 'ADMIN' };
    next();
  }),
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

import router from '../src/routes/incidents';
import { prisma } from '../src/prisma';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const app = express();
app.use(express.json());
app.use('/api/incidents', router);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('InfoSec Incidents API', () => {
  const mockIncident = {
    id: 'inc-1',
    refNumber: 'ISI-2602-5678',
    title: 'Phishing attack on finance team',
    description: 'Multiple finance team members received targeted phishing emails',
    type: 'PHISHING',
    severity: 'HIGH',
    status: 'REPORTED',
    affectedSystems: ['email'],
    affectedAssetIds: [],
    personalDataInvolved: false,
    gdprBreachNotification: false,
    gdprNotificationDeadline: null,
    gdprNotifiedAt: null,
    reportedBy: null,
    detectedAt: new Date().toISOString(),
    investigationNotes: null,
    rootCause: null,
    containmentActions: null,
    assignedTo: null,
    lessonsLearned: null,
    correctiveActions: null,
    preventiveActions: null,
    closedAt: null,
    closedBy: null,
    createdBy: 'user-123',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
  };

  const validCreatePayload = {
    title: 'Phishing attack on finance team',
    type: 'PHISHING',
    severity: 'HIGH',
  };

  // ---- POST /api/incidents ----

  describe('POST /api/incidents', () => {
    it('should create incident', async () => {
      (mockPrisma.isIncident.create as jest.Mock).mockResolvedValueOnce(mockIncident);

      const res = await request(app)
        .post('/api/incidents')
        .send(validCreatePayload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual(mockIncident);
    });

    it('should return 400 for missing title', async () => {
      const res = await request(app)
        .post('/api/incidents')
        .send({ type: 'PHISHING', severity: 'HIGH' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 for missing type', async () => {
      const res = await request(app)
        .post('/api/incidents')
        .send({ title: 'Test', severity: 'HIGH' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 for invalid type value', async () => {
      const res = await request(app)
        .post('/api/incidents')
        .send({ title: 'Test', type: 'UNKNOWN', severity: 'HIGH' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 for invalid severity value', async () => {
      const res = await request(app)
        .post('/api/incidents')
        .send({ title: 'Test', type: 'PHISHING', severity: 'EXTREME' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should set GDPR deadline when personalDataInvolved=true', async () => {
      const gdprIncident = {
        ...mockIncident,
        personalDataInvolved: true,
        gdprBreachNotification: true,
        gdprNotificationDeadline: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
      };
      (mockPrisma.isIncident.create as jest.Mock).mockResolvedValueOnce(gdprIncident);

      const res = await request(app)
        .post('/api/incidents')
        .send({ ...validCreatePayload, personalDataInvolved: true });

      expect(res.status).toBe(201);
      const createCall = (mockPrisma.isIncident.create as jest.Mock).mock.calls[0][0];
      expect(createCall.data.gdprBreachNotification).toBe(true);
      expect(createCall.data.gdprNotificationDeadline).toBeDefined();
    });

    it('should NOT set GDPR deadline when personalDataInvolved=false', async () => {
      (mockPrisma.isIncident.create as jest.Mock).mockResolvedValueOnce(mockIncident);

      await request(app)
        .post('/api/incidents')
        .send({ ...validCreatePayload, personalDataInvolved: false });

      const createCall = (mockPrisma.isIncident.create as jest.Mock).mock.calls[0][0];
      expect(createCall.data.gdprBreachNotification).toBeUndefined();
      expect(createCall.data.gdprNotificationDeadline).toBeUndefined();
    });

    it('should NOT set GDPR deadline when personalDataInvolved is omitted', async () => {
      (mockPrisma.isIncident.create as jest.Mock).mockResolvedValueOnce(mockIncident);

      await request(app)
        .post('/api/incidents')
        .send(validCreatePayload);

      const createCall = (mockPrisma.isIncident.create as jest.Mock).mock.calls[0][0];
      expect(createCall.data.gdprNotificationDeadline).toBeUndefined();
    });

    it('should generate ref number starting with ISI-', async () => {
      (mockPrisma.isIncident.create as jest.Mock).mockResolvedValueOnce(mockIncident);

      await request(app)
        .post('/api/incidents')
        .send(validCreatePayload);

      const createCall = (mockPrisma.isIncident.create as jest.Mock).mock.calls[0][0];
      expect(createCall.data.refNumber).toMatch(/^ISI-/);
    });

    it('should set status to REPORTED on create', async () => {
      (mockPrisma.isIncident.create as jest.Mock).mockResolvedValueOnce(mockIncident);

      await request(app)
        .post('/api/incidents')
        .send(validCreatePayload);

      const createCall = (mockPrisma.isIncident.create as jest.Mock).mock.calls[0][0];
      expect(createCall.data.status).toBe('REPORTED');
    });

    it('should return 500 on database error', async () => {
      (mockPrisma.isIncident.create as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const res = await request(app)
        .post('/api/incidents')
        .send(validCreatePayload);

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  // ---- GET /api/incidents ----

  describe('GET /api/incidents', () => {
    it('should return paginated list', async () => {
      (mockPrisma.isIncident.findMany as jest.Mock).mockResolvedValueOnce([mockIncident]);
      (mockPrisma.isIncident.count as jest.Mock).mockResolvedValueOnce(1);

      const res = await request(app).get('/api/incidents');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.pagination).toBeDefined();
    });

    it('should filter by type', async () => {
      (mockPrisma.isIncident.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.isIncident.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app).get('/api/incidents?type=MALWARE');

      const findCall = (mockPrisma.isIncident.findMany as jest.Mock).mock.calls[0][0];
      expect(findCall.where.type).toBe('MALWARE');
    });

    it('should filter by severity', async () => {
      (mockPrisma.isIncident.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.isIncident.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app).get('/api/incidents?severity=CRITICAL');

      const findCall = (mockPrisma.isIncident.findMany as jest.Mock).mock.calls[0][0];
      expect(findCall.where.severity).toBe('CRITICAL');
    });

    it('should filter by status', async () => {
      (mockPrisma.isIncident.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.isIncident.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app).get('/api/incidents?status=INVESTIGATING');

      const findCall = (mockPrisma.isIncident.findMany as jest.Mock).mock.calls[0][0];
      expect(findCall.where.status).toBe('INVESTIGATING');
    });

    it('should support search', async () => {
      (mockPrisma.isIncident.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.isIncident.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app).get('/api/incidents?search=phishing');

      const findCall = (mockPrisma.isIncident.findMany as jest.Mock).mock.calls[0][0];
      expect(findCall.where.OR).toBeDefined();
    });

    it('should exclude soft-deleted incidents', async () => {
      (mockPrisma.isIncident.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.isIncident.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app).get('/api/incidents');

      const findCall = (mockPrisma.isIncident.findMany as jest.Mock).mock.calls[0][0];
      expect(findCall.where.deletedAt).toBeNull();
    });

    it('should return 500 on database error', async () => {
      (mockPrisma.isIncident.findMany as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const res = await request(app).get('/api/incidents');

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  // ---- GET /api/incidents/:id ----

  describe('GET /api/incidents/:id', () => {
    it('should return incident detail', async () => {
      (mockPrisma.isIncident.findFirst as jest.Mock).mockResolvedValueOnce(mockIncident);

      const res = await request(app).get('/api/incidents/inc-1');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe(mockIncident.title);
    });

    it('should return 404 when incident not found', async () => {
      (mockPrisma.isIncident.findFirst as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app).get('/api/incidents/nonexistent');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  // ---- PUT /api/incidents/:id/investigate ----

  describe('PUT /api/incidents/:id/investigate', () => {
    it('should update investigation notes and set status', async () => {
      (mockPrisma.isIncident.findFirst as jest.Mock).mockResolvedValueOnce(mockIncident);
      (mockPrisma.isIncident.update as jest.Mock).mockResolvedValueOnce({
        ...mockIncident,
        investigationNotes: 'Analyzed email headers',
        status: 'INVESTIGATING',
      });

      const res = await request(app)
        .put('/api/incidents/inc-1/investigate')
        .send({ investigationNotes: 'Analyzed email headers' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      const updateCall = (mockPrisma.isIncident.update as jest.Mock).mock.calls[0][0];
      expect(updateCall.data.status).toBe('INVESTIGATING');
    });

    it('should return 400 for missing investigationNotes', async () => {
      const res = await request(app)
        .put('/api/incidents/inc-1/investigate')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 404 when incident not found', async () => {
      (mockPrisma.isIncident.findFirst as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app)
        .put('/api/incidents/nonexistent/investigate')
        .send({ investigationNotes: 'Test' });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should accept optional rootCause and containmentActions', async () => {
      (mockPrisma.isIncident.findFirst as jest.Mock).mockResolvedValueOnce(mockIncident);
      (mockPrisma.isIncident.update as jest.Mock).mockResolvedValueOnce(mockIncident);

      const res = await request(app)
        .put('/api/incidents/inc-1/investigate')
        .send({
          investigationNotes: 'Analyzed headers',
          rootCause: 'Spoofed sender',
          containmentActions: 'Blocked domain',
        });

      expect(res.status).toBe(200);
    });
  });

  // ---- PUT /api/incidents/:id/close ----

  describe('PUT /api/incidents/:id/close', () => {
    it('should close with lessons learned', async () => {
      (mockPrisma.isIncident.findFirst as jest.Mock).mockResolvedValueOnce(mockIncident);
      (mockPrisma.isIncident.update as jest.Mock).mockResolvedValueOnce({
        ...mockIncident,
        lessonsLearned: 'Improve email filtering',
        status: 'CLOSED',
        closedAt: new Date().toISOString(),
      });

      const res = await request(app)
        .put('/api/incidents/inc-1/close')
        .send({ lessonsLearned: 'Improve email filtering' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      const updateCall = (mockPrisma.isIncident.update as jest.Mock).mock.calls[0][0];
      expect(updateCall.data.status).toBe('CLOSED');
      expect(updateCall.data.closedAt).toBeDefined();
    });

    it('should return 400 for missing lessonsLearned', async () => {
      const res = await request(app)
        .put('/api/incidents/inc-1/close')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 404 when incident not found', async () => {
      (mockPrisma.isIncident.findFirst as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app)
        .put('/api/incidents/nonexistent/close')
        .send({ lessonsLearned: 'Test' });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should accept optional correctiveActions and preventiveActions', async () => {
      (mockPrisma.isIncident.findFirst as jest.Mock).mockResolvedValueOnce(mockIncident);
      (mockPrisma.isIncident.update as jest.Mock).mockResolvedValueOnce(mockIncident);

      const res = await request(app)
        .put('/api/incidents/inc-1/close')
        .send({
          lessonsLearned: 'Better training needed',
          correctiveActions: 'Updated SPF records',
          preventiveActions: 'Monthly phishing simulations',
        });

      expect(res.status).toBe(200);
    });
  });

  // ---- POST /api/incidents/:id/notify ----

  describe('POST /api/incidents/:id/notify', () => {
    it('should log GDPR notification', async () => {
      const gdprIncident = { ...mockIncident, gdprBreachNotification: true };
      (mockPrisma.isIncident.findFirst as jest.Mock).mockResolvedValueOnce(gdprIncident);
      (mockPrisma.isIncident.update as jest.Mock).mockResolvedValueOnce({
        ...gdprIncident,
        gdprNotifiedAt: new Date().toISOString(),
      });

      const res = await request(app)
        .post('/api/incidents/inc-1/notify')
        .send({});

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      const updateCall = (mockPrisma.isIncident.update as jest.Mock).mock.calls[0][0];
      expect(updateCall.data.gdprNotifiedAt).toBeDefined();
    });

    it('should return 404 when incident not found', async () => {
      (mockPrisma.isIncident.findFirst as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app)
        .post('/api/incidents/nonexistent/notify')
        .send({});

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 when incident does not require GDPR notification', async () => {
      (mockPrisma.isIncident.findFirst as jest.Mock).mockResolvedValueOnce({
        ...mockIncident,
        gdprBreachNotification: false,
      });

      const res = await request(app)
        .post('/api/incidents/inc-1/notify')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 500 on database error', async () => {
      const gdprIncident = { ...mockIncident, gdprBreachNotification: true };
      (mockPrisma.isIncident.findFirst as jest.Mock).mockResolvedValueOnce(gdprIncident);
      (mockPrisma.isIncident.update as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const res = await request(app)
        .post('/api/incidents/inc-1/notify')
        .send({});

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });
});
