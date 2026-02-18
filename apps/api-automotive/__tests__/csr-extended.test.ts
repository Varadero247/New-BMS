import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    csrRequirement: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
  },
  Prisma: { CsrRequirementWhereInput: {} },
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
import csrRouter from '../src/routes/csr';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const app = express();
app.use(express.json());
app.use('/api/csr', csrRouter);

describe('CSR Routes', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('GET /api/csr/oems', () => {
    it('should list distinct OEM names', async () => {
      (mockPrisma.csrRequirement.findMany as jest.Mock).mockResolvedValue([
        { oem: 'BMW' },
        { oem: 'Ford' },
        { oem: 'Toyota' },
      ]);

      const res = await request(app).get('/api/csr/oems');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual(['BMW', 'Ford', 'Toyota']);
    });

    it('should return empty array if no OEMs', async () => {
      (mockPrisma.csrRequirement.findMany as jest.Mock).mockResolvedValue([]);

      const res = await request(app).get('/api/csr/oems');
      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
    });

    it('should return 500 on error', async () => {
      (mockPrisma.csrRequirement.findMany as jest.Mock).mockRejectedValue(new Error('DB'));

      const res = await request(app).get('/api/csr/oems');
      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/csr/gaps', () => {
    it('should list non-compliant CSRs', async () => {
      (mockPrisma.csrRequirement.findMany as jest.Mock).mockResolvedValue([
        { id: '00000000-0000-0000-0000-000000000001', complianceStatus: 'PARTIAL' },
      ]);
      (mockPrisma.csrRequirement.count as jest.Mock).mockResolvedValue(1);

      const res = await request(app).get('/api/csr/gaps');
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.meta.total).toBe(1);
    });

    it('should support pagination', async () => {
      (mockPrisma.csrRequirement.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.csrRequirement.count as jest.Mock).mockResolvedValue(50);

      const res = await request(app).get('/api/csr/gaps?page=3&limit=10');
      expect(res.status).toBe(200);
      expect(res.body.meta.page).toBe(3);
      expect(res.body.meta.limit).toBe(10);
    });

    it('should return 500 on error', async () => {
      (mockPrisma.csrRequirement.findMany as jest.Mock).mockRejectedValue(new Error('DB'));
      (mockPrisma.csrRequirement.count as jest.Mock).mockRejectedValue(new Error('DB'));

      const res = await request(app).get('/api/csr/gaps');
      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/csr/oems/:oem', () => {
    it('should list CSRs for a specific OEM', async () => {
      (mockPrisma.csrRequirement.findMany as jest.Mock).mockResolvedValue([
        { id: '00000000-0000-0000-0000-000000000001', oem: 'BMW' },
      ]);
      (mockPrisma.csrRequirement.count as jest.Mock).mockResolvedValue(1);

      const res = await request(app).get('/api/csr/oems/BMW');
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
    });

    it('should filter by complianceStatus', async () => {
      (mockPrisma.csrRequirement.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.csrRequirement.count as jest.Mock).mockResolvedValue(0);

      await request(app).get('/api/csr/oems/Ford?complianceStatus=COMPLIANT');
      expect(mockPrisma.csrRequirement.findMany).toHaveBeenCalled();
    });

    it('should filter by iatfClause', async () => {
      (mockPrisma.csrRequirement.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.csrRequirement.count as jest.Mock).mockResolvedValue(0);

      await request(app).get('/api/csr/oems/Toyota?iatfClause=8.3');
      expect(mockPrisma.csrRequirement.findMany).toHaveBeenCalled();
    });

    it('should support pagination', async () => {
      (mockPrisma.csrRequirement.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.csrRequirement.count as jest.Mock).mockResolvedValue(100);

      const res = await request(app).get('/api/csr/oems/BMW?page=2&limit=10');
      expect(res.status).toBe(200);
      expect(res.body.meta.page).toBe(2);
    });

    it('should return 500 on error', async () => {
      (mockPrisma.csrRequirement.findMany as jest.Mock).mockRejectedValue(new Error('DB'));
      (mockPrisma.csrRequirement.count as jest.Mock).mockRejectedValue(new Error('DB'));

      const res = await request(app).get('/api/csr/oems/BMW');
      expect(res.status).toBe(500);
    });
  });

  describe('PUT /api/csr/:id/status', () => {
    it('should update compliance status', async () => {
      (mockPrisma.csrRequirement.findUnique as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001',
      });
      (mockPrisma.csrRequirement.update as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001',
        complianceStatus: 'COMPLIANT',
      });

      const res = await request(app)
        .put('/api/csr/00000000-0000-0000-0000-000000000001/status')
        .send({ complianceStatus: 'COMPLIANT' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 404 if not found', async () => {
      (mockPrisma.csrRequirement.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .put('/api/csr/00000000-0000-0000-0000-000000000099/status')
        .send({ complianceStatus: 'COMPLIANT' });
      expect(res.status).toBe(404);
    });

    it('should return 400 for invalid complianceStatus', async () => {
      (mockPrisma.csrRequirement.findUnique as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001',
      });

      const res = await request(app)
        .put('/api/csr/00000000-0000-0000-0000-000000000001/status')
        .send({ complianceStatus: 'INVALID' });
      expect(res.status).toBe(400);
    });

    it('should accept PARTIAL status', async () => {
      (mockPrisma.csrRequirement.findUnique as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001',
      });
      (mockPrisma.csrRequirement.update as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001',
        complianceStatus: 'PARTIAL',
      });

      const res = await request(app)
        .put('/api/csr/00000000-0000-0000-0000-000000000001/status')
        .send({ complianceStatus: 'PARTIAL' });
      expect(res.status).toBe(200);
    });

    it('should accept NON_COMPLIANT status', async () => {
      (mockPrisma.csrRequirement.findUnique as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001',
      });
      (mockPrisma.csrRequirement.update as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001',
        complianceStatus: 'NON_COMPLIANT',
      });

      const res = await request(app)
        .put('/api/csr/00000000-0000-0000-0000-000000000001/status')
        .send({ complianceStatus: 'NON_COMPLIANT' });
      expect(res.status).toBe(200);
    });

    it('should accept NOT_ASSESSED status', async () => {
      (mockPrisma.csrRequirement.findUnique as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001',
      });
      (mockPrisma.csrRequirement.update as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001',
        complianceStatus: 'NOT_ASSESSED',
      });

      const res = await request(app)
        .put('/api/csr/00000000-0000-0000-0000-000000000001/status')
        .send({ complianceStatus: 'NOT_ASSESSED' });
      expect(res.status).toBe(200);
    });

    it('should accept optional gapNotes', async () => {
      (mockPrisma.csrRequirement.findUnique as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001',
      });
      (mockPrisma.csrRequirement.update as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001',
      });

      const res = await request(app)
        .put('/api/csr/00000000-0000-0000-0000-000000000001/status')
        .send({
          complianceStatus: 'PARTIAL',
          gapNotes: 'Need to implement PPAP process',
        });
      expect(res.status).toBe(200);
    });

    it('should accept optional actionRequired', async () => {
      (mockPrisma.csrRequirement.findUnique as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001',
      });
      (mockPrisma.csrRequirement.update as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001',
      });

      const res = await request(app)
        .put('/api/csr/00000000-0000-0000-0000-000000000001/status')
        .send({
          complianceStatus: 'NON_COMPLIANT',
          actionRequired: 'Implement SPC for critical characteristics',
        });
      expect(res.status).toBe(200);
    });

    it('should return 500 on database error', async () => {
      (mockPrisma.csrRequirement.findUnique as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001',
      });
      (mockPrisma.csrRequirement.update as jest.Mock).mockRejectedValue(new Error('DB'));

      const res = await request(app)
        .put('/api/csr/00000000-0000-0000-0000-000000000001/status')
        .send({ complianceStatus: 'COMPLIANT' });
      expect(res.status).toBe(500);
    });
  });
});
