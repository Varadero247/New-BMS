import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    hSContractor: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    hSContractorInspection: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  },
}));

jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((_req: any, _res: any, next: any) => {
    _req.user = { id: 'user-1', orgId: 'org-1', role: 'ADMIN' };
    next();
  }),
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

jest.mock('@ims/shared', () => ({
  validateIdParam: () => (_req: any, _res: any, next: any) => next(),
  parsePagination: (query: Record<string, any>) => {
    const page = Math.max(1, parseInt(query.page as string, 10) || 1);
    const limit = Math.min(Math.max(1, parseInt(query.limit as string, 10) || 20), 100);
    return { skip: (page - 1) * limit, limit, page };
  },
}));

import router from '../src/routes/contractor-management';
const { prisma } = require('../src/prisma');

const app = express();
app.use(express.json());
app.use('/', router);

const contractorPayload = {
  companyName: 'Safe Build Ltd',
  contactName: 'Tom Contractor',
  contactEmail: 'tom@safebuild.com',
  workType: 'Electrical installation',
  workLocation: 'Building A',
  startDate: '2026-02-01',
  ohsRequirements: 'Hard hat, safety boots, safety harness required',
};

const mockContractor = {
  id: 'cont-1',
  ...contractorPayload,
  status: 'ACTIVE',
  deletedAt: null,
  inspections: [],
};

describe('ISO 45001 Contractor Management Routes', () => {
  beforeEach(() => jest.clearAllMocks());

  // GET /
  it('GET / returns paginated contractor list with inspections', async () => {
    prisma.hSContractor.findMany.mockResolvedValue([mockContractor]);
    prisma.hSContractor.count.mockResolvedValue(1);
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.pagination).toBeDefined();
  });

  it('GET / filters by status', async () => {
    prisma.hSContractor.findMany.mockResolvedValue([]);
    prisma.hSContractor.count.mockResolvedValue(0);
    const res = await request(app).get('/?status=SUSPENDED');
    expect(res.status).toBe(200);
  });

  it('GET / filters by workLocation', async () => {
    prisma.hSContractor.findMany.mockResolvedValue([]);
    prisma.hSContractor.count.mockResolvedValue(0);
    const res = await request(app).get('/?workLocation=Building+A');
    expect(res.status).toBe(200);
  });

  it('GET / returns 500 on DB error', async () => {
    prisma.hSContractor.findMany.mockRejectedValue(new Error('fail'));
    const res = await request(app).get('/');
    expect(res.status).toBe(500);
  });

  // POST /
  it('POST / registers a contractor with ACTIVE status', async () => {
    prisma.hSContractor.create.mockResolvedValue({ ...mockContractor, status: 'ACTIVE' });
    const res = await request(app).post('/').send(contractorPayload);
    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('ACTIVE');
  });

  it('POST / returns 400 on missing companyName', async () => {
    const { companyName: _c, ...body } = contractorPayload;
    const res = await request(app).post('/').send(body);
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('POST / returns 400 on invalid contactEmail', async () => {
    const res = await request(app).post('/').send({ ...contractorPayload, contactEmail: 'not-email' });
    expect(res.status).toBe(400);
  });

  it('POST / returns 400 on missing ohsRequirements', async () => {
    const { ohsRequirements: _r, ...body } = contractorPayload;
    const res = await request(app).post('/').send(body);
    expect(res.status).toBe(400);
  });

  // GET /stats
  it('GET /stats returns aggregate contractor counts', async () => {
    prisma.hSContractor.count
      .mockResolvedValueOnce(10)
      .mockResolvedValueOnce(7)
      .mockResolvedValueOnce(1)
      .mockResolvedValueOnce(2)
      .mockResolvedValueOnce(3);
    const res = await request(app).get('/stats');
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ total: 10, active: 7, suspended: 1, completed: 2, uninductedActive: 3 });
  });

  // GET /:id
  it('GET /:id returns contractor with inspections', async () => {
    prisma.hSContractor.findUnique.mockResolvedValue({ ...mockContractor, inspections: [] });
    const res = await request(app).get('/cont-1');
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('cont-1');
    expect(res.body.data).toHaveProperty('inspections');
  });

  it('GET /:id returns 404 for missing contractor', async () => {
    prisma.hSContractor.findUnique.mockResolvedValue(null);
    const res = await request(app).get('/nonexistent');
    expect(res.status).toBe(404);
  });

  it('GET /:id returns 404 for soft-deleted contractor', async () => {
    prisma.hSContractor.findUnique.mockResolvedValue({ ...mockContractor, deletedAt: new Date() });
    const res = await request(app).get('/cont-1');
    expect(res.status).toBe(404);
  });

  // PUT /:id
  it('PUT /:id updates contractor fields', async () => {
    prisma.hSContractor.findUnique.mockResolvedValue(mockContractor);
    prisma.hSContractor.update.mockResolvedValue({ ...mockContractor, inductionCompleted: true });
    const res = await request(app).put('/cont-1').send({ inductionCompleted: true });
    expect(res.status).toBe(200);
  });

  it('PUT /:id updates status to SUSPENDED', async () => {
    prisma.hSContractor.findUnique.mockResolvedValue(mockContractor);
    prisma.hSContractor.update.mockResolvedValue({ ...mockContractor, status: 'SUSPENDED' });
    const res = await request(app).put('/cont-1').send({ status: 'SUSPENDED' });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('SUSPENDED');
  });

  it('PUT /:id returns 400 on invalid status', async () => {
    prisma.hSContractor.findUnique.mockResolvedValue(mockContractor);
    const res = await request(app).put('/cont-1').send({ status: 'INVALID' });
    expect(res.status).toBe(400);
  });

  it('PUT /:id returns 404 for unknown contractor', async () => {
    prisma.hSContractor.findUnique.mockResolvedValue(null);
    const res = await request(app).put('/unknown').send({ status: 'COMPLETED' });
    expect(res.status).toBe(404);
  });

  // POST /:id/inspections
  it('POST /:id/inspections records SATISFACTORY inspection', async () => {
    prisma.hSContractor.findUnique.mockResolvedValue(mockContractor);
    prisma.hSContractorInspection.create.mockResolvedValue({
      id: 'insp-1', contractorId: '00000000-0000-0000-0000-000000000001', outcome: 'SATISFACTORY', inspectionDate: new Date(),
    });
    const res = await request(app).post('/00000000-0000-0000-0000-000000000001/inspections').send({
      inspectedBy: 'HSE Officer',
      inspectionDate: '2026-02-15',
      findings: 'All PPE in place, work area safe',
      outcome: 'SATISFACTORY',
    });
    expect(res.status).toBe(201);
    expect(res.body.data.outcome).toBe('SATISFACTORY');
  });

  it('POST /:id/inspections auto-suspends contractor on SUSPENDED outcome', async () => {
    prisma.hSContractor.findUnique.mockResolvedValue(mockContractor);
    prisma.hSContractorInspection.create.mockResolvedValue({ id: 'insp-2', outcome: 'SUSPENDED' });
    prisma.hSContractor.update.mockResolvedValue({ ...mockContractor, status: 'SUSPENDED' });
    await request(app).post('/00000000-0000-0000-0000-000000000001/inspections').send({
      inspectedBy: 'HSE Officer',
      inspectionDate: '2026-02-15',
      findings: 'Multiple safety violations',
      outcome: 'SUSPENDED',
    });
    expect(prisma.hSContractor.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: 'SUSPENDED' }) })
    );
  });

  it('POST /:id/inspections returns 400 on invalid outcome', async () => {
    prisma.hSContractor.findUnique.mockResolvedValue(mockContractor);
    const res = await request(app).post('/cont-1/inspections').send({
      inspectedBy: 'HSE',
      inspectionDate: '2026-02-15',
      findings: 'OK',
      outcome: 'INVALID',
    });
    expect(res.status).toBe(400);
  });

  it('POST /:id/inspections returns 404 for unknown contractor', async () => {
    prisma.hSContractor.findUnique.mockResolvedValue(null);
    const res = await request(app).post('/unknown/inspections').send({
      inspectedBy: 'HSE', inspectionDate: '2026-02-15', findings: 'OK', outcome: 'SATISFACTORY',
    });
    expect(res.status).toBe(404);
  });

  // GET /:id/inspections
  it('GET /:id/inspections returns inspection history', async () => {
    prisma.hSContractorInspection.findMany.mockResolvedValue([{ id: 'insp-1', outcome: 'SATISFACTORY' }]);
    const res = await request(app).get('/cont-1/inspections');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  // Extended coverage
  it('GET / returns correct totalPages when count=30 and limit=10', async () => {
    prisma.hSContractor.findMany.mockResolvedValue([]);
    prisma.hSContractor.count.mockResolvedValue(30);
    const res = await request(app).get('/?page=1&limit=10');
    expect(res.status).toBe(200);
    expect(res.body.pagination.totalPages).toBe(3);
  });

  it('GET / passes skip=10 to findMany when page=2 and limit=10', async () => {
    prisma.hSContractor.findMany.mockResolvedValue([]);
    prisma.hSContractor.count.mockResolvedValue(0);
    await request(app).get('/?page=2&limit=10');
    expect(prisma.hSContractor.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 10, take: 10 })
    );
  });

  it('GET / filters by workLocation wired into Prisma where', async () => {
    prisma.hSContractor.findMany.mockResolvedValue([]);
    prisma.hSContractor.count.mockResolvedValue(0);
    await request(app).get('/?workLocation=SiteB');
    expect(prisma.hSContractor.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ workLocation: 'SiteB' }) })
    );
  });

  it('POST / returns 500 on DB create error', async () => {
    prisma.hSContractor.create.mockRejectedValue(new Error('DB error'));
    const res = await request(app).post('/').send(contractorPayload);
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });

  it('PUT /:id returns 500 on DB update error', async () => {
    prisma.hSContractor.findUnique.mockResolvedValue(mockContractor);
    prisma.hSContractor.update.mockRejectedValue(new Error('DB error'));
    const res = await request(app).put('/cont-1').send({ inductionCompleted: true });
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });

  it('POST /:id/inspections returns 500 on DB create error', async () => {
    prisma.hSContractor.findUnique.mockResolvedValue(mockContractor);
    prisma.hSContractorInspection.create.mockRejectedValue(new Error('DB error'));
    const res = await request(app).post('/00000000-0000-0000-0000-000000000001/inspections').send({
      inspectedBy: 'Officer', inspectionDate: '2026-02-15',
      findings: 'All good', outcome: 'SATISFACTORY',
    });
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });

  it('GET /stats returns 500 on DB error', async () => {
    prisma.hSContractor.count.mockRejectedValue(new Error('DB error'));
    const res = await request(app).get('/stats');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});
