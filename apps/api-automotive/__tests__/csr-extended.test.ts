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
  parsePagination: (query: Record<string, any>, opts?: { defaultLimit?: number }) => {
    const defaultLimit = opts?.defaultLimit ?? 20;
    const page = Math.max(1, parseInt(query.page as string, 10) || 1);
    const limit = Math.min(Math.max(1, parseInt(query.limit as string, 10) || defaultLimit), 100);
    const skip = (page - 1) * limit;
    return { page, limit, skip };
  },
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

describe('CSR Routes — additional edge cases', () => {
  it('GET /api/csr/gaps returns success:false and INTERNAL_ERROR on db error', async () => {
    (mockPrisma.csrRequirement.findMany as jest.Mock).mockRejectedValue(new Error('timeout'));
    (mockPrisma.csrRequirement.count as jest.Mock).mockRejectedValue(new Error('timeout'));
    const res = await request(app).get('/api/csr/gaps');
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET /api/csr/oems returns success:true with data array', async () => {
    (mockPrisma.csrRequirement.findMany as jest.Mock).mockResolvedValue([{ oem: 'Honda' }, { oem: 'Nissan' }]);
    const res = await request(app).get('/api/csr/oems');
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data).toEqual(['Honda', 'Nissan']);
  });

  it('GET /api/csr/oems/:oem returns meta with totalPages', async () => {
    (mockPrisma.csrRequirement.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.csrRequirement.count as jest.Mock).mockResolvedValue(30);
    const res = await request(app).get('/api/csr/oems/BMW?limit=10');
    expect(res.status).toBe(200);
    expect(res.body.meta.totalPages).toBe(3);
  });

  it('GET /api/csr/gaps returns empty data with total 0 when no gaps', async () => {
    (mockPrisma.csrRequirement.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.csrRequirement.count as jest.Mock).mockResolvedValue(0);
    const res = await request(app).get('/api/csr/gaps');
    expect(res.body.data).toEqual([]);
    expect(res.body.meta.total).toBe(0);
    expect(res.body.meta.totalPages).toBe(0);
  });

  it('PUT /api/csr/:id/status returns 400 when body is empty', async () => {
    (mockPrisma.csrRequirement.findUnique as jest.Mock).mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    const res = await request(app)
      .put('/api/csr/00000000-0000-0000-0000-000000000001/status')
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('PUT /api/csr/:id/status returns 400 for completely invalid status string', async () => {
    (mockPrisma.csrRequirement.findUnique as jest.Mock).mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    const res = await request(app)
      .put('/api/csr/00000000-0000-0000-0000-000000000001/status')
      .send({ complianceStatus: 'UNKNOWN_VALUE' });
    expect(res.status).toBe(400);
  });

  it('GET /api/csr/oems/:oem returns 500 when db throws', async () => {
    (mockPrisma.csrRequirement.findMany as jest.Mock).mockRejectedValue(new Error('crash'));
    (mockPrisma.csrRequirement.count as jest.Mock).mockRejectedValue(new Error('crash'));
    const res = await request(app).get('/api/csr/oems/BMW');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET /api/csr/gaps page defaults to 1 when not specified', async () => {
    (mockPrisma.csrRequirement.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.csrRequirement.count as jest.Mock).mockResolvedValue(0);
    const res = await request(app).get('/api/csr/gaps');
    expect(res.body.meta.page).toBe(1);
  });

  it('PUT /api/csr/:id/status update call passes correct id in where', async () => {
    const cid = '00000000-0000-0000-0000-000000000002';
    (mockPrisma.csrRequirement.findUnique as jest.Mock).mockResolvedValue({ id: cid });
    (mockPrisma.csrRequirement.update as jest.Mock).mockResolvedValue({ id: cid, complianceStatus: 'COMPLIANT' });
    await request(app)
      .put(`/api/csr/${cid}/status`)
      .send({ complianceStatus: 'COMPLIANT' });
    expect(mockPrisma.csrRequirement.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: cid } })
    );
  });
});

describe('CSR Routes — final coverage block', () => {
  beforeEach(() => jest.clearAllMocks());

  it('GET /api/csr/oems findMany is called with distinct and select params', async () => {
    (mockPrisma.csrRequirement.findMany as jest.Mock).mockResolvedValue([{ oem: 'Volvo' }]);
    await request(app).get('/api/csr/oems');
    expect(mockPrisma.csrRequirement.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ distinct: ['oem'], select: { oem: true } })
    );
  });

  it('GET /api/csr/gaps where clause excludes COMPLIANT and NOT_ASSESSED', async () => {
    (mockPrisma.csrRequirement.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.csrRequirement.count as jest.Mock).mockResolvedValue(0);
    await request(app).get('/api/csr/gaps');
    expect(mockPrisma.csrRequirement.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { complianceStatus: { notIn: ['COMPLIANT', 'NOT_ASSESSED'] } },
      })
    );
  });

  it('PUT /api/csr/:id/status update passes gapNotes in data object', async () => {
    const id = '00000000-0000-0000-0000-000000000001';
    (mockPrisma.csrRequirement.findUnique as jest.Mock).mockResolvedValue({ id });
    (mockPrisma.csrRequirement.update as jest.Mock).mockResolvedValue({ id, complianceStatus: 'PARTIAL', gapNotes: 'In progress' });
    await request(app)
      .put(`/api/csr/${id}/status`)
      .send({ complianceStatus: 'PARTIAL', gapNotes: 'In progress' });
    expect(mockPrisma.csrRequirement.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ gapNotes: 'In progress' }) })
    );
  });

  it('GET /api/csr/oems/:oem findMany includes oem insensitive filter', async () => {
    (mockPrisma.csrRequirement.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.csrRequirement.count as jest.Mock).mockResolvedValue(0);
    await request(app).get('/api/csr/oems/BMW');
    expect(mockPrisma.csrRequirement.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ oem: { equals: 'BMW', mode: 'insensitive' } }),
      })
    );
  });

  it('GET /api/csr/gaps returns success:true in body', async () => {
    (mockPrisma.csrRequirement.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.csrRequirement.count as jest.Mock).mockResolvedValue(0);
    const res = await request(app).get('/api/csr/gaps');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('PUT /api/csr/:id/status findUnique called with correct id', async () => {
    const id = '00000000-0000-0000-0000-000000000003';
    (mockPrisma.csrRequirement.findUnique as jest.Mock).mockResolvedValue({ id });
    (mockPrisma.csrRequirement.update as jest.Mock).mockResolvedValue({ id, complianceStatus: 'COMPLIANT' });
    await request(app).put(`/api/csr/${id}/status`).send({ complianceStatus: 'COMPLIANT' });
    expect(mockPrisma.csrRequirement.findUnique).toHaveBeenCalledWith({ where: { id } });
  });
});

describe('CSR Routes — extra coverage', () => {
  beforeEach(() => jest.clearAllMocks());

  it('GET /api/csr/oems returns success:true on empty result', async () => {
    (mockPrisma.csrRequirement.findMany as jest.Mock).mockResolvedValue([]);
    const res = await request(app).get('/api/csr/oems');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('GET /api/csr/gaps meta.totalPages is 0 when total is 0', async () => {
    (mockPrisma.csrRequirement.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.csrRequirement.count as jest.Mock).mockResolvedValue(0);
    const res = await request(app).get('/api/csr/gaps');
    expect(res.status).toBe(200);
    expect(res.body.meta.totalPages).toBe(0);
  });

  it('GET /api/csr/oems/:oem returns success:true', async () => {
    (mockPrisma.csrRequirement.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.csrRequirement.count as jest.Mock).mockResolvedValue(0);
    const res = await request(app).get('/api/csr/oems/Audi');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('PUT /api/csr/:id/status returns 500 with INTERNAL_ERROR when update rejects', async () => {
    const id = '00000000-0000-0000-0000-000000000001';
    (mockPrisma.csrRequirement.findUnique as jest.Mock).mockResolvedValue({ id });
    (mockPrisma.csrRequirement.update as jest.Mock).mockRejectedValue(new Error('DB crash'));
    const res = await request(app).put(`/api/csr/${id}/status`).send({ complianceStatus: 'COMPLIANT' });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET /api/csr/gaps findMany is called once per request', async () => {
    (mockPrisma.csrRequirement.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.csrRequirement.count as jest.Mock).mockResolvedValue(0);
    await request(app).get('/api/csr/gaps');
    expect(mockPrisma.csrRequirement.findMany).toHaveBeenCalledTimes(1);
  });
});
