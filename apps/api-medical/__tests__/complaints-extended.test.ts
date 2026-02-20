import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    complaint: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
  },
  Prisma: { ComplaintWhereInput: {}, ComplaintUpdateInput: {} },
}));

jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((req: any, _res: any, next: any) => {
    req.user = { id: 'user-1', email: 'test@test.com', role: 'ADMIN' };
    next();
  }),
}));

jest.mock('@ims/service-auth', () => ({
  checkOwnership: () => (_req: any, _res: any, next: any) => next(),
  scopeToUser: (_req: any, _res: any, next: any) => next(),
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

jest.mock('@ims/shared', () => ({
  validateIdParam: () => (_req: any, _res: any, next: any) => next(),
  parsePagination: (query: Record<string, any>, opts?: { defaultLimit?: number }) => {
    const defaultLimit = opts?.defaultLimit ?? 20;
    const page = Math.max(1, parseInt(query.page as string, 10) || 1);
    const limit = Math.min(Math.max(1, parseInt(query.limit as string, 10) || defaultLimit), 100);
    const skip = (page - 1) * limit;
    return { page, limit, skip };
  },
}));

import { prisma } from '../src/prisma';
import complaintsRouter from '../src/routes/complaints';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const app = express();
app.use(express.json());
app.use('/api/complaints', complaintsRouter);

describe('Complaints Routes (Medical)', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('POST /api/complaints', () => {
    const validBody = {
      deviceName: 'Cardiac Monitor X200',
      complaintDate: '2026-02-10',
      source: 'CUSTOMER',
      description: 'Device displaying incorrect readings',
    };

    it('should create a complaint', async () => {
      (mockPrisma.complaint.count as jest.Mock).mockResolvedValue(0);
      (mockPrisma.complaint.create as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001',
        refNumber: 'COMP-2602-0001',
        ...validBody,
        status: 'RECEIVED',
      });

      const res = await request(app).post('/api/complaints').send(validBody);
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('should auto-flag for MDR when injury occurred', async () => {
      (mockPrisma.complaint.count as jest.Mock).mockResolvedValue(0);
      (mockPrisma.complaint.create as jest.Mock).mockResolvedValue({
        id: 'c-2',
        status: 'MDR_REVIEW',
      });

      const res = await request(app)
        .post('/api/complaints')
        .send({
          ...validBody,
          injuryOccurred: true,
        });
      expect(res.status).toBe(201);
    });

    it('should auto-flag for MDR when death occurred', async () => {
      (mockPrisma.complaint.count as jest.Mock).mockResolvedValue(0);
      (mockPrisma.complaint.create as jest.Mock).mockResolvedValue({
        id: 'c-3',
        status: 'MDR_REVIEW',
      });

      const res = await request(app)
        .post('/api/complaints')
        .send({
          ...validBody,
          deathOccurred: true,
        });
      expect(res.status).toBe(201);
    });

    it('should auto-flag for MDR when malfunction occurred', async () => {
      (mockPrisma.complaint.count as jest.Mock).mockResolvedValue(0);
      (mockPrisma.complaint.create as jest.Mock).mockResolvedValue({
        id: 'c-4',
        status: 'MDR_REVIEW',
      });

      const res = await request(app)
        .post('/api/complaints')
        .send({
          ...validBody,
          malfunctionOccurred: true,
        });
      expect(res.status).toBe(201);
    });

    it('should return 400 for missing deviceName', async () => {
      const { deviceName, ...noDevice } = validBody;
      const res = await request(app).post('/api/complaints').send(noDevice);
      expect(res.status).toBe(400);
    });

    it('should return 400 for missing complaintDate', async () => {
      const { complaintDate, ...noDate } = validBody;
      const res = await request(app).post('/api/complaints').send(noDate);
      expect(res.status).toBe(400);
    });

    it('should return 400 for invalid source', async () => {
      const res = await request(app)
        .post('/api/complaints')
        .send({
          ...validBody,
          source: 'INVALID',
        });
      expect(res.status).toBe(400);
    });

    it('should accept HEALTHCARE_PROVIDER source', async () => {
      (mockPrisma.complaint.count as jest.Mock).mockResolvedValue(0);
      (mockPrisma.complaint.create as jest.Mock).mockResolvedValue({ id: 'c-5' });

      const res = await request(app)
        .post('/api/complaints')
        .send({
          ...validBody,
          source: 'HEALTHCARE_PROVIDER',
        });
      expect(res.status).toBe(201);
    });

    it('should accept PATIENT source', async () => {
      (mockPrisma.complaint.count as jest.Mock).mockResolvedValue(0);
      (mockPrisma.complaint.create as jest.Mock).mockResolvedValue({ id: 'c-6' });

      const res = await request(app)
        .post('/api/complaints')
        .send({
          ...validBody,
          source: 'PATIENT',
        });
      expect(res.status).toBe(201);
    });

    it('should accept optional severity', async () => {
      (mockPrisma.complaint.count as jest.Mock).mockResolvedValue(0);
      (mockPrisma.complaint.create as jest.Mock).mockResolvedValue({ id: 'c-7' });

      const res = await request(app)
        .post('/api/complaints')
        .send({
          ...validBody,
          severity: 'LIFE_THREATENING',
        });
      expect(res.status).toBe(201);
    });

    it('should return 500 on database error', async () => {
      (mockPrisma.complaint.count as jest.Mock).mockResolvedValue(0);
      (mockPrisma.complaint.create as jest.Mock).mockRejectedValue(new Error('DB'));

      const res = await request(app).post('/api/complaints').send(validBody);
      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/complaints', () => {
    it('should list complaints', async () => {
      (mockPrisma.complaint.findMany as jest.Mock).mockResolvedValue([
        { id: '00000000-0000-0000-0000-000000000001' },
      ]);
      (mockPrisma.complaint.count as jest.Mock).mockResolvedValue(1);

      const res = await request(app).get('/api/complaints');
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.meta.total).toBe(1);
    });

    it('should support pagination', async () => {
      (mockPrisma.complaint.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.complaint.count as jest.Mock).mockResolvedValue(60);

      const res = await request(app).get('/api/complaints?page=3&limit=10');
      expect(res.status).toBe(200);
      expect(res.body.meta.page).toBe(3);
      expect(res.body.meta.totalPages).toBe(6);
    });

    it('should filter by status', async () => {
      (mockPrisma.complaint.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.complaint.count as jest.Mock).mockResolvedValue(0);

      await request(app).get('/api/complaints?status=MDR_REVIEW');
      expect(mockPrisma.complaint.findMany).toHaveBeenCalled();
    });

    it('should filter by severity', async () => {
      (mockPrisma.complaint.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.complaint.count as jest.Mock).mockResolvedValue(0);

      await request(app).get('/api/complaints?severity=CRITICAL');
      expect(mockPrisma.complaint.findMany).toHaveBeenCalled();
    });

    it('should return 500 on error', async () => {
      (mockPrisma.complaint.findMany as jest.Mock).mockRejectedValue(new Error('DB'));
      (mockPrisma.complaint.count as jest.Mock).mockRejectedValue(new Error('DB'));

      const res = await request(app).get('/api/complaints');
      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/complaints/trending', () => {
    it('should return trend data', async () => {
      (mockPrisma.complaint.findMany as jest.Mock).mockResolvedValue([
        {
          complaintDate: new Date('2026-01-15'),
          deviceName: 'X200',
          source: 'CUSTOMER',
          severity: 'MINOR',
        },
        {
          complaintDate: new Date('2026-02-10'),
          deviceName: 'X200',
          source: 'INTERNAL',
          severity: 'MAJOR',
        },
      ]);

      const res = await request(app).get('/api/complaints/trending');
      expect(res.status).toBe(200);
      expect(res.body.data.totalComplaints).toBe(2);
      expect(res.body.data.byMonth).toBeDefined();
      expect(res.body.data.byDevice).toBeDefined();
      expect(res.body.data.bySource).toBeDefined();
    });

    it('should return 500 on error', async () => {
      (mockPrisma.complaint.findMany as jest.Mock).mockRejectedValue(new Error('DB'));

      const res = await request(app).get('/api/complaints/trending');
      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/complaints/mdr-pending', () => {
    it('should list MDR-pending complaints', async () => {
      (mockPrisma.complaint.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.complaint.count as jest.Mock).mockResolvedValue(0);

      const res = await request(app).get('/api/complaints/mdr-pending');
      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/complaints/:id', () => {
    it('should get complaint by id', async () => {
      (mockPrisma.complaint.findUnique as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001',
        deletedAt: null,
      });

      const res = await request(app).get('/api/complaints/00000000-0000-0000-0000-000000000001');
      expect(res.status).toBe(200);
    });

    it('should return 404 if not found', async () => {
      (mockPrisma.complaint.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app).get('/api/complaints/00000000-0000-0000-0000-000000000099');
      expect(res.status).toBe(404);
    });

    it('should return 404 for soft-deleted', async () => {
      (mockPrisma.complaint.findUnique as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001',
        deletedAt: new Date(),
      });

      const res = await request(app).get('/api/complaints/00000000-0000-0000-0000-000000000001');
      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/complaints/:id', () => {
    it('should update complaint investigation', async () => {
      (mockPrisma.complaint.findUnique as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001',
        deletedAt: null,
      });
      (mockPrisma.complaint.update as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001',
        status: 'UNDER_INVESTIGATION',
      });

      const res = await request(app)
        .put('/api/complaints/00000000-0000-0000-0000-000000000001')
        .send({
          status: 'UNDER_INVESTIGATION',
          investigationSummary: 'Investigating root cause',
        });
      expect(res.status).toBe(200);
    });

    it('should return 404 if not found', async () => {
      (mockPrisma.complaint.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .put('/api/complaints/00000000-0000-0000-0000-000000000099')
        .send({ status: 'CLOSED' });
      expect(res.status).toBe(404);
    });

    it('should return 400 for invalid status', async () => {
      (mockPrisma.complaint.findUnique as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001',
        deletedAt: null,
      });

      const res = await request(app)
        .put('/api/complaints/00000000-0000-0000-0000-000000000001')
        .send({ status: 'INVALID' });
      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/complaints/:id/mdr', () => {
    it('should record MDR decision', async () => {
      (mockPrisma.complaint.findUnique as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001',
        deletedAt: null,
      });
      (mockPrisma.complaint.update as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001',
        mdrReportable: true,
      });

      const res = await request(app)
        .post('/api/complaints/00000000-0000-0000-0000-000000000001/mdr')
        .send({ reportable: true });
      expect(res.status).toBe(200);
    });

    it('should return 404 if not found', async () => {
      (mockPrisma.complaint.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .post('/api/complaints/00000000-0000-0000-0000-000000000099/mdr')
        .send({ reportable: true });
      expect(res.status).toBe(404);
    });

    it('should return 400 for missing reportable', async () => {
      (mockPrisma.complaint.findUnique as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001',
        deletedAt: null,
      });

      const res = await request(app)
        .post('/api/complaints/00000000-0000-0000-0000-000000000001/mdr')
        .send({});
      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/complaints/:id/close', () => {
    it('should close a complaint', async () => {
      (mockPrisma.complaint.findUnique as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001',
        deletedAt: null,
        mdrReportable: false,
        rootCause: 'Firmware bug',
        correctiveAction: 'Updated firmware',
      });
      (mockPrisma.complaint.update as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001',
        status: 'CLOSED',
      });

      const res = await request(app)
        .post('/api/complaints/00000000-0000-0000-0000-000000000001/close')
        .send({});
      expect(res.status).toBe(200);
    });

    it('should return 400 if MDR decision not made', async () => {
      (mockPrisma.complaint.findUnique as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001',
        deletedAt: null,
        mdrReportable: null,
        rootCause: 'Bug',
        correctiveAction: 'Fix',
      });

      const res = await request(app)
        .post('/api/complaints/00000000-0000-0000-0000-000000000001/close')
        .send({});
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('MDR_DECISION_REQUIRED');
    });

    it('should return 400 if investigation incomplete', async () => {
      (mockPrisma.complaint.findUnique as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001',
        deletedAt: null,
        mdrReportable: false,
        rootCause: null,
        correctiveAction: null,
      });

      const res = await request(app)
        .post('/api/complaints/00000000-0000-0000-0000-000000000001/close')
        .send({});
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('INVESTIGATION_INCOMPLETE');
    });

    it('should return 404 if not found', async () => {
      (mockPrisma.complaint.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .post('/api/complaints/00000000-0000-0000-0000-000000000099/close')
        .send({});
      expect(res.status).toBe(404);
    });
  });
});
