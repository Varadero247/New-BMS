import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    counterfeitReport: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), count: jest.fn() },
    quarantineRecord: { create: jest.fn(), count: jest.fn() },
    approvedSource: { findMany: jest.fn(), create: jest.fn(), count: jest.fn() },
  },
  Prisma: { CounterfeitReportWhereInput: {}, ApprovedSourceWhereInput: {} },
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
}));

import { prisma } from '../src/prisma';
import counterfeitRouter from '../src/routes/counterfeit';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const app = express();
app.use(express.json());
app.use('/api/counterfeit', counterfeitRouter);

describe('Counterfeit Prevention Routes', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('POST /api/counterfeit/reports', () => {
    const validBody = {
      partNumber: 'IC-555',
      manufacturer: 'Texas Instruments',
      suspicionReason: 'Inconsistent markings',
    };

    it('should create a counterfeit report', async () => {
      (mockPrisma.counterfeitReport.count as jest.Mock).mockResolvedValue(0);
      (mockPrisma.counterfeitReport.create as jest.Mock).mockResolvedValue({
        id: 'cf-1', refNumber: 'SUCP-2602-0001', ...validBody, status: 'REPORTED',
      });

      const res = await request(app).post('/api/counterfeit/reports').send(validBody);
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('should return 400 for missing partNumber', async () => {
      const { partNumber, ...no } = validBody;
      const res = await request(app).post('/api/counterfeit/reports').send(no);
      expect(res.status).toBe(400);
    });

    it('should return 400 for missing manufacturer', async () => {
      const { manufacturer, ...no } = validBody;
      const res = await request(app).post('/api/counterfeit/reports').send(no);
      expect(res.status).toBe(400);
    });

    it('should return 400 for missing suspicionReason', async () => {
      const { suspicionReason, ...no } = validBody;
      const res = await request(app).post('/api/counterfeit/reports').send(no);
      expect(res.status).toBe(400);
    });

    it('should accept optional fields', async () => {
      (mockPrisma.counterfeitReport.count as jest.Mock).mockResolvedValue(0);
      (mockPrisma.counterfeitReport.create as jest.Mock).mockResolvedValue({ id: 'cf-2' });

      const res = await request(app).post('/api/counterfeit/reports').send({
        ...validBody,
        partName: 'Timer IC',
        distributor: 'Arrow Electronics',
        lotNumber: 'LOT-2024',
        serialNumber: 'SN-12345',
        evidence: 'Photos of marking inconsistencies attached',
      });
      expect(res.status).toBe(201);
    });

    it('should return 500 on database error', async () => {
      (mockPrisma.counterfeitReport.count as jest.Mock).mockResolvedValue(0);
      (mockPrisma.counterfeitReport.create as jest.Mock).mockRejectedValue(new Error('DB'));

      const res = await request(app).post('/api/counterfeit/reports').send(validBody);
      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/counterfeit/reports', () => {
    it('should list counterfeit reports', async () => {
      (mockPrisma.counterfeitReport.findMany as jest.Mock).mockResolvedValue([{ id: 'cf-1' }]);
      (mockPrisma.counterfeitReport.count as jest.Mock).mockResolvedValue(1);

      const res = await request(app).get('/api/counterfeit/reports');
      expect(res.status).toBe(200);
      expect(res.body.data.items).toHaveLength(1);
    });

    it('should support pagination', async () => {
      (mockPrisma.counterfeitReport.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.counterfeitReport.count as jest.Mock).mockResolvedValue(50);

      const res = await request(app).get('/api/counterfeit/reports?page=2&limit=10');
      expect(res.status).toBe(200);
      expect(res.body.data.page).toBe(2);
    });

    it('should return 500 on error', async () => {
      (mockPrisma.counterfeitReport.findMany as jest.Mock).mockRejectedValue(new Error('DB'));
      (mockPrisma.counterfeitReport.count as jest.Mock).mockRejectedValue(new Error('DB'));

      const res = await request(app).get('/api/counterfeit/reports');
      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/counterfeit/reports/:id', () => {
    it('should get report details', async () => {
      (mockPrisma.counterfeitReport.findUnique as jest.Mock).mockResolvedValue({
        id: 'cf-1', deletedAt: null,
      });

      const res = await request(app).get('/api/counterfeit/reports/cf-1');
      expect(res.status).toBe(200);
    });

    it('should return 404 if not found', async () => {
      (mockPrisma.counterfeitReport.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app).get('/api/counterfeit/reports/fake');
      expect(res.status).toBe(404);
    });

    it('should return 404 for soft-deleted', async () => {
      (mockPrisma.counterfeitReport.findUnique as jest.Mock).mockResolvedValue({
        id: 'cf-1', deletedAt: new Date(),
      });

      const res = await request(app).get('/api/counterfeit/reports/cf-1');
      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/counterfeit/reports/:id', () => {
    it('should update investigation', async () => {
      (mockPrisma.counterfeitReport.findUnique as jest.Mock).mockResolvedValue({ id: 'cf-1', deletedAt: null });
      (mockPrisma.counterfeitReport.update as jest.Mock).mockResolvedValue({ id: 'cf-1', status: 'UNDER_INVESTIGATION' });

      const res = await request(app).put('/api/counterfeit/reports/cf-1').send({
        status: 'UNDER_INVESTIGATION',
        investigationNotes: 'XRF analysis scheduled',
      });
      expect(res.status).toBe(200);
    });

    it('should return 404 if not found', async () => {
      (mockPrisma.counterfeitReport.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app).put('/api/counterfeit/reports/fake').send({ status: 'CLOSED' });
      expect(res.status).toBe(404);
    });

    it('should accept CONFIRMED_COUNTERFEIT status', async () => {
      (mockPrisma.counterfeitReport.findUnique as jest.Mock).mockResolvedValue({ id: 'cf-1', deletedAt: null });
      (mockPrisma.counterfeitReport.update as jest.Mock).mockResolvedValue({ id: 'cf-1' });

      const res = await request(app).put('/api/counterfeit/reports/cf-1').send({
        status: 'CONFIRMED_COUNTERFEIT',
      });
      expect(res.status).toBe(200);
    });

    it('should accept CONFIRMED_AUTHENTIC status', async () => {
      (mockPrisma.counterfeitReport.findUnique as jest.Mock).mockResolvedValue({ id: 'cf-1', deletedAt: null });
      (mockPrisma.counterfeitReport.update as jest.Mock).mockResolvedValue({ id: 'cf-1' });

      const res = await request(app).put('/api/counterfeit/reports/cf-1').send({
        status: 'CONFIRMED_AUTHENTIC',
      });
      expect(res.status).toBe(200);
    });

    it('should accept disposition DESTROY', async () => {
      (mockPrisma.counterfeitReport.findUnique as jest.Mock).mockResolvedValue({ id: 'cf-1', deletedAt: null });
      (mockPrisma.counterfeitReport.update as jest.Mock).mockResolvedValue({ id: 'cf-1' });

      const res = await request(app).put('/api/counterfeit/reports/cf-1').send({
        disposition: 'DESTROY',
      });
      expect(res.status).toBe(200);
    });

    it('should accept disposition RETURN_TO_SUPPLIER', async () => {
      (mockPrisma.counterfeitReport.findUnique as jest.Mock).mockResolvedValue({ id: 'cf-1', deletedAt: null });
      (mockPrisma.counterfeitReport.update as jest.Mock).mockResolvedValue({ id: 'cf-1' });

      const res = await request(app).put('/api/counterfeit/reports/cf-1').send({
        disposition: 'RETURN_TO_SUPPLIER',
      });
      expect(res.status).toBe(200);
    });

    it('should return 400 for invalid status', async () => {
      (mockPrisma.counterfeitReport.findUnique as jest.Mock).mockResolvedValue({ id: 'cf-1', deletedAt: null });

      const res = await request(app).put('/api/counterfeit/reports/cf-1').send({
        status: 'INVALID_STATUS',
      });
      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/counterfeit/reports/:id/quarantine', () => {
    it('should quarantine a part', async () => {
      (mockPrisma.counterfeitReport.findUnique as jest.Mock).mockResolvedValue({
        id: 'cf-1', deletedAt: null, partNumber: 'IC-555', refNumber: 'SUCP-2602-0001',
      });
      (mockPrisma.quarantineRecord.count as jest.Mock).mockResolvedValue(0);
      (mockPrisma.quarantineRecord.create as jest.Mock).mockResolvedValue({ id: 'qr-1', status: 'QUARANTINED' });
      (mockPrisma.counterfeitReport.update as jest.Mock).mockResolvedValue({ id: 'cf-1' });

      const res = await request(app).post('/api/counterfeit/reports/cf-1/quarantine').send({
        quantity: 100, location: 'Quarantine Bay A',
      });
      expect(res.status).toBe(201);
    });

    it('should return 404 if report not found', async () => {
      (mockPrisma.counterfeitReport.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app).post('/api/counterfeit/reports/fake/quarantine').send({
        quantity: 10, location: 'Bay A',
      });
      expect(res.status).toBe(404);
    });

    it('should return 400 for missing quantity', async () => {
      (mockPrisma.counterfeitReport.findUnique as jest.Mock).mockResolvedValue({ id: 'cf-1', deletedAt: null });

      const res = await request(app).post('/api/counterfeit/reports/cf-1/quarantine').send({
        location: 'Bay A',
      });
      expect(res.status).toBe(400);
    });

    it('should return 400 for missing location', async () => {
      (mockPrisma.counterfeitReport.findUnique as jest.Mock).mockResolvedValue({ id: 'cf-1', deletedAt: null });

      const res = await request(app).post('/api/counterfeit/reports/cf-1/quarantine').send({
        quantity: 10,
      });
      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/counterfeit/reports/:id/notify', () => {
    it('should update GIDEP notification', async () => {
      (mockPrisma.counterfeitReport.findUnique as jest.Mock).mockResolvedValue({ id: 'cf-1', deletedAt: null });
      (mockPrisma.counterfeitReport.update as jest.Mock).mockResolvedValue({ id: 'cf-1', gidepReported: true });

      const res = await request(app).post('/api/counterfeit/reports/cf-1/notify').send({
        notifyGidep: true, gidepRef: 'GIDEP-2026-001',
      });
      expect(res.status).toBe(200);
    });

    it('should return 404 if not found', async () => {
      (mockPrisma.counterfeitReport.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app).post('/api/counterfeit/reports/fake/notify').send({ notifyGidep: true });
      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/counterfeit/approved-sources', () => {
    const validBody = {
      companyName: 'Digi-Key Electronics',
      partNumbers: ['IC-555', 'IC-741'],
      certifications: ['ISO 9001', 'AS6081'],
      approvalDate: '2026-01-01',
    };

    it('should add an approved source', async () => {
      (mockPrisma.approvedSource.create as jest.Mock).mockResolvedValue({
        id: 'as-1', ...validBody, status: 'APPROVED',
      });

      const res = await request(app).post('/api/counterfeit/approved-sources').send(validBody);
      expect(res.status).toBe(201);
    });

    it('should return 400 for missing companyName', async () => {
      const { companyName, ...no } = validBody;
      const res = await request(app).post('/api/counterfeit/approved-sources').send(no);
      expect(res.status).toBe(400);
    });

    it('should accept optional fields', async () => {
      (mockPrisma.approvedSource.create as jest.Mock).mockResolvedValue({ id: 'as-2' });

      const res = await request(app).post('/api/counterfeit/approved-sources').send({
        ...validBody,
        cageCode: '1ABC2',
        riskRating: 'MEDIUM',
        expiryDate: '2027-01-01',
        notes: 'Authorized distributor',
      });
      expect(res.status).toBe(201);
    });

    it('should return 500 on database error', async () => {
      (mockPrisma.approvedSource.create as jest.Mock).mockRejectedValue(new Error('DB'));

      const res = await request(app).post('/api/counterfeit/approved-sources').send(validBody);
      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/counterfeit/approved-sources', () => {
    it('should list approved sources', async () => {
      (mockPrisma.approvedSource.findMany as jest.Mock).mockResolvedValue([{ id: 'as-1' }]);
      (mockPrisma.approvedSource.count as jest.Mock).mockResolvedValue(1);

      const res = await request(app).get('/api/counterfeit/approved-sources');
      expect(res.status).toBe(200);
      expect(res.body.data.items).toHaveLength(1);
    });

    it('should support pagination', async () => {
      (mockPrisma.approvedSource.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.approvedSource.count as jest.Mock).mockResolvedValue(50);

      const res = await request(app).get('/api/counterfeit/approved-sources?page=2&limit=10');
      expect(res.status).toBe(200);
      expect(res.body.data.page).toBe(2);
    });

    it('should return 500 on error', async () => {
      (mockPrisma.approvedSource.findMany as jest.Mock).mockRejectedValue(new Error('DB'));
      (mockPrisma.approvedSource.count as jest.Mock).mockRejectedValue(new Error('DB'));

      const res = await request(app).get('/api/counterfeit/approved-sources');
      expect(res.status).toBe(500);
    });
  });
});
