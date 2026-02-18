import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    isRopa: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    isDpia: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    isDsar: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    isConsent: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    isRetentionSchedule: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
  },
  Prisma: { Decimal: jest.fn((v: any) => v) },
}));

jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((req: any, _res: any, next: any) => {
    req.user = {
      id: '00000000-0000-4000-a000-000000000123',
      email: 'test@test.com',
      role: 'ADMIN',
    };
    next();
  }),
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

import router from '../src/routes/privacy';
import { prisma } from '../src/prisma';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const app = express();
app.use(express.json());
app.use('/api/privacy', router);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('InfoSec Privacy API', () => {
  // ===================================================================
  // Mock Data
  // ===================================================================

  const mockRopa = {
    id: 'a5000000-0000-4000-a000-000000000001',
    refNumber: 'ROPA-1234',
    name: 'Customer Data Processing',
    purpose: 'Order fulfillment',
    lawfulBasis: 'CONTRACT',
    dataCategories: ['personal', 'financial'],
    dataSubjects: ['customers'],
    recipients: ['payment provider'],
    retentionPeriod: '7 years',
    transfersOutsideEEA: false,
    safeguards: null,
    controller: 'Company Ltd',
    processor: null,
    description: 'Processing customer orders',
    status: 'ACTIVE',
    createdBy: '00000000-0000-4000-a000-000000000123',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
  };

  const mockDpia = {
    id: 'a5100000-0000-4000-a000-000000000001',
    refNumber: 'DPIA-2602-1234',
    title: 'New CRM System DPIA',
    description: 'DPIA for new customer relationship management system',
    processingDescription: 'Storing and processing customer data',
    necessity: 'Required for business operations',
    risksIdentified: ['Data breach', 'Unauthorized access'],
    mitigationMeasures: ['Encryption', 'Access controls'],
    ropaId: null,
    status: 'DRAFT',
    approvedBy: null,
    approvedAt: null,
    approvalNotes: null,
    createdBy: '00000000-0000-4000-a000-000000000123',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
  };

  const mockDsar = {
    id: 'a5200000-0000-4000-a000-000000000001',
    refNumber: 'DSAR-2602-5678',
    subjectName: 'John Doe',
    subjectEmail: 'john.doe@example.com',
    requestType: 'ACCESS',
    description: 'Request for all personal data',
    identityVerified: false,
    receivedAt: new Date().toISOString(),
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'RECEIVED',
    responseNotes: null,
    actionTaken: null,
    respondedAt: null,
    createdBy: '00000000-0000-4000-a000-000000000123',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockConsent = {
    id: 'a5300000-0000-4000-a000-000000000001',
    subjectName: 'Jane Doe',
    subjectEmail: 'jane@example.com',
    purpose: 'Marketing emails',
    consentGiven: true,
    consentedAt: new Date().toISOString(),
    withdrawnAt: null,
    createdBy: '00000000-0000-4000-a000-000000000123',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockRetention = {
    id: 'a5400000-0000-4000-a000-000000000001',
    dataCategory: 'Financial records',
    retentionPeriod: '7',
    unit: 'YEARS',
    legalBasis: 'Tax legislation',
    reviewDate: null,
    notes: null,
    createdBy: '00000000-0000-4000-a000-000000000123',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // ===================================================================
  // ROPA
  // ===================================================================

  describe('GET /api/privacy/ropa', () => {
    it('should list ROPA entries with pagination', async () => {
      (mockPrisma.isRopa.findMany as jest.Mock).mockResolvedValueOnce([mockRopa]);
      (mockPrisma.isRopa.count as jest.Mock).mockResolvedValueOnce(1);

      const res = await request(app).get('/api/privacy/ropa');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.pagination).toBeDefined();
    });

    it('should filter by status', async () => {
      (mockPrisma.isRopa.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.isRopa.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app).get('/api/privacy/ropa?status=ACTIVE');

      const findCall = (mockPrisma.isRopa.findMany as jest.Mock).mock.calls[0][0];
      expect(findCall.where.status).toBe('ACTIVE');
    });

    it('should support search', async () => {
      (mockPrisma.isRopa.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.isRopa.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app).get('/api/privacy/ropa?search=customer');

      const findCall = (mockPrisma.isRopa.findMany as jest.Mock).mock.calls[0][0];
      expect(findCall.where.OR).toBeDefined();
    });

    it('should exclude soft-deleted entries', async () => {
      (mockPrisma.isRopa.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.isRopa.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app).get('/api/privacy/ropa');

      const findCall = (mockPrisma.isRopa.findMany as jest.Mock).mock.calls[0][0];
      expect(findCall.where.deletedAt).toBeNull();
    });

    it('should return 500 on database error', async () => {
      (mockPrisma.isRopa.findMany as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const res = await request(app).get('/api/privacy/ropa');

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/privacy/ropa', () => {
    it('should create ROPA entry', async () => {
      (mockPrisma.isRopa.create as jest.Mock).mockResolvedValueOnce(mockRopa);

      const res = await request(app).post('/api/privacy/ropa').send({
        name: 'Customer Data Processing',
        purpose: 'Order fulfillment',
        lawfulBasis: 'CONTRACT',
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('should return 400 for missing name', async () => {
      const res = await request(app)
        .post('/api/privacy/ropa')
        .send({ purpose: 'Test', lawfulBasis: 'CONSENT' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 for missing purpose', async () => {
      const res = await request(app)
        .post('/api/privacy/ropa')
        .send({ name: 'Test', lawfulBasis: 'CONSENT' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 for invalid lawfulBasis', async () => {
      const res = await request(app)
        .post('/api/privacy/ropa')
        .send({ name: 'Test', purpose: 'Test', lawfulBasis: 'BECAUSE_I_WANT_TO' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should generate ref number starting with ROPA-', async () => {
      (mockPrisma.isRopa.create as jest.Mock).mockResolvedValueOnce(mockRopa);

      await request(app)
        .post('/api/privacy/ropa')
        .send({ name: 'Test', purpose: 'Test', lawfulBasis: 'CONSENT' });

      const createCall = (mockPrisma.isRopa.create as jest.Mock).mock.calls[0][0];
      expect(createCall.data.refNumber).toMatch(/^ROPA-/);
    });

    it('should set status to ACTIVE on create', async () => {
      (mockPrisma.isRopa.create as jest.Mock).mockResolvedValueOnce(mockRopa);

      await request(app)
        .post('/api/privacy/ropa')
        .send({ name: 'Test', purpose: 'Test', lawfulBasis: 'CONSENT' });

      const createCall = (mockPrisma.isRopa.create as jest.Mock).mock.calls[0][0];
      expect(createCall.data.status).toBe('ACTIVE');
    });

    it('should accept optional arrays', async () => {
      (mockPrisma.isRopa.create as jest.Mock).mockResolvedValueOnce(mockRopa);

      const res = await request(app)
        .post('/api/privacy/ropa')
        .send({
          name: 'Test',
          purpose: 'Test',
          lawfulBasis: 'LEGITIMATE_INTERESTS',
          dataCategories: ['names', 'emails'],
          dataSubjects: ['employees'],
          recipients: ['HR system'],
        });

      expect(res.status).toBe(201);
    });

    it('should return 500 on database error', async () => {
      (mockPrisma.isRopa.create as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const res = await request(app)
        .post('/api/privacy/ropa')
        .send({ name: 'Test', purpose: 'Test', lawfulBasis: 'CONSENT' });

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/privacy/ropa/:id', () => {
    it('should return ROPA detail', async () => {
      (mockPrisma.isRopa.findFirst as jest.Mock).mockResolvedValueOnce(mockRopa);

      const res = await request(app).get('/api/privacy/ropa/a5000000-0000-4000-a000-000000000001');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Customer Data Processing');
    });

    it('should return 404 when ROPA not found', async () => {
      (mockPrisma.isRopa.findFirst as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app).get('/api/privacy/ropa/00000000-0000-0000-0000-000000000099');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('PUT /api/privacy/ropa/:id', () => {
    it('should update ROPA entry', async () => {
      (mockPrisma.isRopa.findFirst as jest.Mock).mockResolvedValueOnce(mockRopa);
      (mockPrisma.isRopa.update as jest.Mock).mockResolvedValueOnce({
        ...mockRopa,
        name: 'Updated',
      });

      const res = await request(app)
        .put('/api/privacy/ropa/a5000000-0000-4000-a000-000000000001')
        .send({ name: 'Updated' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 404 when ROPA not found', async () => {
      (mockPrisma.isRopa.findFirst as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app)
        .put('/api/privacy/ropa/00000000-0000-0000-0000-000000000099')
        .send({ name: 'Updated' });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should accept status update', async () => {
      (mockPrisma.isRopa.findFirst as jest.Mock).mockResolvedValueOnce(mockRopa);
      (mockPrisma.isRopa.update as jest.Mock).mockResolvedValueOnce({
        ...mockRopa,
        status: 'ARCHIVED',
      });

      const res = await request(app)
        .put('/api/privacy/ropa/a5000000-0000-4000-a000-000000000001')
        .send({ status: 'ARCHIVED' });

      expect(res.status).toBe(200);
    });
  });

  // ===================================================================
  // DPIA
  // ===================================================================

  describe('POST /api/privacy/dpia', () => {
    it('should create DPIA', async () => {
      (mockPrisma.isDpia.create as jest.Mock).mockResolvedValueOnce(mockDpia);

      const res = await request(app)
        .post('/api/privacy/dpia')
        .send({ title: 'New CRM System DPIA' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('should return 400 for missing title', async () => {
      const res = await request(app).post('/api/privacy/dpia').send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should set status to DRAFT', async () => {
      (mockPrisma.isDpia.create as jest.Mock).mockResolvedValueOnce(mockDpia);

      await request(app).post('/api/privacy/dpia').send({ title: 'Test DPIA' });

      const createCall = (mockPrisma.isDpia.create as jest.Mock).mock.calls[0][0];
      expect(createCall.data.status).toBe('DRAFT');
    });

    it('should generate ref number starting with DPIA-', async () => {
      (mockPrisma.isDpia.create as jest.Mock).mockResolvedValueOnce(mockDpia);

      await request(app).post('/api/privacy/dpia').send({ title: 'Test DPIA' });

      const createCall = (mockPrisma.isDpia.create as jest.Mock).mock.calls[0][0];
      expect(createCall.data.refNumber).toMatch(/^DPIA-/);
    });

    it('should return 500 on database error', async () => {
      (mockPrisma.isDpia.create as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const res = await request(app).post('/api/privacy/dpia').send({ title: 'Test' });

      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/privacy/dpia', () => {
    it('should list DPIAs with pagination', async () => {
      (mockPrisma.isDpia.findMany as jest.Mock).mockResolvedValueOnce([mockDpia]);
      (mockPrisma.isDpia.count as jest.Mock).mockResolvedValueOnce(1);

      const res = await request(app).get('/api/privacy/dpia');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
    });

    it('should filter by status', async () => {
      (mockPrisma.isDpia.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.isDpia.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app).get('/api/privacy/dpia?status=APPROVED');

      const findCall = (mockPrisma.isDpia.findMany as jest.Mock).mock.calls[0][0];
      expect(findCall.where.status).toBe('APPROVED');
    });

    it('should exclude soft-deleted DPIAs', async () => {
      (mockPrisma.isDpia.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.isDpia.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app).get('/api/privacy/dpia');

      const findCall = (mockPrisma.isDpia.findMany as jest.Mock).mock.calls[0][0];
      expect(findCall.where.deletedAt).toBeNull();
    });
  });

  describe('PUT /api/privacy/dpia/:id/approve', () => {
    it('should approve DPIA', async () => {
      (mockPrisma.isDpia.findFirst as jest.Mock).mockResolvedValueOnce(mockDpia);
      (mockPrisma.isDpia.update as jest.Mock).mockResolvedValueOnce({
        ...mockDpia,
        status: 'APPROVED',
        approvedBy: '00000000-0000-4000-a000-000000000123',
        approvedAt: new Date().toISOString(),
      });

      const res = await request(app)
        .put('/api/privacy/dpia/a5100000-0000-4000-a000-000000000001/approve')
        .send({});

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      const updateCall = (mockPrisma.isDpia.update as jest.Mock).mock.calls[0][0];
      expect(updateCall.data.status).toBe('APPROVED');
      expect(updateCall.data.approvedBy).toBe('00000000-0000-4000-a000-000000000123');
    });

    it('should return 404 when DPIA not found', async () => {
      (mockPrisma.isDpia.findFirst as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app)
        .put('/api/privacy/dpia/00000000-0000-0000-0000-000000000099/approve')
        .send({});

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should set approvedAt timestamp', async () => {
      (mockPrisma.isDpia.findFirst as jest.Mock).mockResolvedValueOnce(mockDpia);
      (mockPrisma.isDpia.update as jest.Mock).mockResolvedValueOnce(mockDpia);

      await request(app)
        .put('/api/privacy/dpia/a5100000-0000-4000-a000-000000000001/approve')
        .send({ approvalNotes: 'Looks good' });

      const updateCall = (mockPrisma.isDpia.update as jest.Mock).mock.calls[0][0];
      expect(updateCall.data.approvedAt).toBeDefined();
    });

    it('should accept optional approvalNotes', async () => {
      (mockPrisma.isDpia.findFirst as jest.Mock).mockResolvedValueOnce(mockDpia);
      (mockPrisma.isDpia.update as jest.Mock).mockResolvedValueOnce(mockDpia);

      const res = await request(app)
        .put('/api/privacy/dpia/a5100000-0000-4000-a000-000000000001/approve')
        .send({ approvalNotes: 'DPO sign-off complete' });

      expect(res.status).toBe(200);
    });
  });

  // ===================================================================
  // DSAR
  // ===================================================================

  describe('POST /api/privacy/dsar', () => {
    it('should create DSAR with 30-day deadline', async () => {
      (mockPrisma.isDsar.create as jest.Mock).mockResolvedValueOnce(mockDsar);

      const res = await request(app).post('/api/privacy/dsar').send({
        subjectName: 'John Doe',
        subjectEmail: 'john@example.com',
        requestType: 'ACCESS',
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      const createCall = (mockPrisma.isDsar.create as jest.Mock).mock.calls[0][0];
      expect(createCall.data.deadline).toBeDefined();
      // Verify deadline is approximately 30 days from now
      const deadlineDate = new Date(createCall.data.deadline);
      const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const diff = Math.abs(deadlineDate.getTime() - thirtyDaysFromNow.getTime());
      expect(diff).toBeLessThan(5000); // within 5 seconds
    });

    it('should return 400 for missing subjectName', async () => {
      const res = await request(app)
        .post('/api/privacy/dsar')
        .send({ subjectEmail: 'test@test.com', requestType: 'ACCESS' });

      expect(res.status).toBe(400);
    });

    it('should return 400 for invalid email', async () => {
      const res = await request(app)
        .post('/api/privacy/dsar')
        .send({ subjectName: 'Test', subjectEmail: 'not-an-email', requestType: 'ACCESS' });

      expect(res.status).toBe(400);
    });

    it('should return 400 for invalid requestType', async () => {
      const res = await request(app)
        .post('/api/privacy/dsar')
        .send({ subjectName: 'Test', subjectEmail: 'test@test.com', requestType: 'INVALID' });

      expect(res.status).toBe(400);
    });

    it('should set status to RECEIVED', async () => {
      (mockPrisma.isDsar.create as jest.Mock).mockResolvedValueOnce(mockDsar);

      await request(app)
        .post('/api/privacy/dsar')
        .send({ subjectName: 'Test', subjectEmail: 'test@test.com', requestType: 'ERASURE' });

      const createCall = (mockPrisma.isDsar.create as jest.Mock).mock.calls[0][0];
      expect(createCall.data.status).toBe('RECEIVED');
    });

    it('should generate ref number starting with DSAR-', async () => {
      (mockPrisma.isDsar.create as jest.Mock).mockResolvedValueOnce(mockDsar);

      await request(app)
        .post('/api/privacy/dsar')
        .send({ subjectName: 'Test', subjectEmail: 'test@test.com', requestType: 'ACCESS' });

      const createCall = (mockPrisma.isDsar.create as jest.Mock).mock.calls[0][0];
      expect(createCall.data.refNumber).toMatch(/^DSAR-/);
    });
  });

  describe('GET /api/privacy/dsar', () => {
    it('should list DSARs with pagination', async () => {
      (mockPrisma.isDsar.findMany as jest.Mock).mockResolvedValueOnce([mockDsar]);
      (mockPrisma.isDsar.count as jest.Mock).mockResolvedValueOnce(1);

      const res = await request(app).get('/api/privacy/dsar');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
    });

    it('should filter by status', async () => {
      (mockPrisma.isDsar.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.isDsar.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app).get('/api/privacy/dsar?status=COMPLETED');

      const findCall = (mockPrisma.isDsar.findMany as jest.Mock).mock.calls[0][0];
      expect(findCall.where.status).toBe('COMPLETED');
    });

    it('should filter by requestType', async () => {
      (mockPrisma.isDsar.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.isDsar.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app).get('/api/privacy/dsar?requestType=ERASURE');

      const findCall = (mockPrisma.isDsar.findMany as jest.Mock).mock.calls[0][0];
      expect(findCall.where.requestType).toBe('ERASURE');
    });

    it('should return 500 on database error', async () => {
      (mockPrisma.isDsar.findMany as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const res = await request(app).get('/api/privacy/dsar');

      expect(res.status).toBe(500);
    });
  });

  describe('PUT /api/privacy/dsar/:id/respond', () => {
    it('should record DSAR response', async () => {
      (mockPrisma.isDsar.findUnique as jest.Mock).mockResolvedValueOnce(mockDsar);
      (mockPrisma.isDsar.update as jest.Mock).mockResolvedValueOnce({
        ...mockDsar,
        responseNotes: 'Data exported and sent',
        status: 'COMPLETED',
        respondedAt: new Date().toISOString(),
      });

      const res = await request(app)
        .put('/api/privacy/dsar/a5200000-0000-4000-a000-000000000001/respond')
        .send({ responseNotes: 'Data exported and sent' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      const updateCall = (mockPrisma.isDsar.update as jest.Mock).mock.calls[0][0];
      expect(updateCall.data.status).toBe('COMPLETED');
      expect(updateCall.data.respondedAt).toBeDefined();
    });

    it('should return 400 for missing responseNotes', async () => {
      const res = await request(app)
        .put('/api/privacy/dsar/a5200000-0000-4000-a000-000000000001/respond')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 404 when DSAR not found', async () => {
      (mockPrisma.isDsar.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app)
        .put('/api/privacy/dsar/00000000-0000-0000-0000-000000000099/respond')
        .send({ responseNotes: 'Test' });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should accept optional actionTaken', async () => {
      (mockPrisma.isDsar.findUnique as jest.Mock).mockResolvedValueOnce(mockDsar);
      (mockPrisma.isDsar.update as jest.Mock).mockResolvedValueOnce(mockDsar);

      const res = await request(app)
        .put('/api/privacy/dsar/a5200000-0000-4000-a000-000000000001/respond')
        .send({
          responseNotes: 'Data exported',
          actionTaken: 'Exported all records to CSV',
        });

      expect(res.status).toBe(200);
    });
  });

  // ===================================================================
  // CONSENTS
  // ===================================================================

  describe('GET /api/privacy/consents', () => {
    it('should list consent records with pagination', async () => {
      (mockPrisma.isConsent.findMany as jest.Mock).mockResolvedValueOnce([mockConsent]);
      (mockPrisma.isConsent.count as jest.Mock).mockResolvedValueOnce(1);

      const res = await request(app).get('/api/privacy/consents');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.pagination).toBeDefined();
    });

    it('should filter by subjectEmail', async () => {
      (mockPrisma.isConsent.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.isConsent.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app).get('/api/privacy/consents?subjectEmail=jane@example.com');

      const findCall = (mockPrisma.isConsent.findMany as jest.Mock).mock.calls[0][0];
      expect(findCall.where.subjectEmail).toBe('jane@example.com');
    });

    it('should support search', async () => {
      (mockPrisma.isConsent.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.isConsent.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app).get('/api/privacy/consents?search=marketing');

      const findCall = (mockPrisma.isConsent.findMany as jest.Mock).mock.calls[0][0];
      expect(findCall.where.OR).toBeDefined();
    });

    it('should return 500 on database error', async () => {
      (mockPrisma.isConsent.findMany as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const res = await request(app).get('/api/privacy/consents');

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  // ===================================================================
  // RETENTION
  // ===================================================================

  describe('GET /api/privacy/retention', () => {
    it('should list retention schedules', async () => {
      (mockPrisma.isRetentionSchedule.findMany as jest.Mock).mockResolvedValueOnce([mockRetention]);
      (mockPrisma.isRetentionSchedule.count as jest.Mock).mockResolvedValueOnce(1);

      const res = await request(app).get('/api/privacy/retention');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
    });

    it('should order by dataCategory ascending', async () => {
      (mockPrisma.isRetentionSchedule.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.isRetentionSchedule.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app).get('/api/privacy/retention');

      const findCall = (mockPrisma.isRetentionSchedule.findMany as jest.Mock).mock.calls[0][0];
      expect(findCall.orderBy).toEqual({ dataCategory: 'asc' });
    });

    it('should return 500 on database error', async () => {
      (mockPrisma.isRetentionSchedule.findMany as jest.Mock).mockRejectedValueOnce(
        new Error('DB error')
      );

      const res = await request(app).get('/api/privacy/retention');

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });
});
