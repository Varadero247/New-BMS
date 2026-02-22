import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    isDpo: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
    isDpa: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), count: jest.fn() },
    isInternationalTransfer: { findMany: jest.fn(), create: jest.fn(), count: jest.fn() },
    isPrivacyByDesign: { findMany: jest.fn(), create: jest.fn(), count: jest.fn() },
    isSaComplaint: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), count: jest.fn() },
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

import router from '../src/routes/gdpr-extended';
const { prisma } = require('../src/prisma');

const app = express();
app.use(express.json());
app.use('/', router);

const dpoPayload = { name: 'Alice Smith', email: 'dpo@company.com', appointmentDate: '2026-01-01' };
const dpaPayload = {
  processorName: 'Acme Analytics', processingActivities: 'Analytics', dataCategories: ['email'],
  effectiveDate: '2026-01-01', createdBy: 'legal@company.com',
};
const transferPayload = {
  recipientCountry: 'USA', recipientOrg: 'Acme US', transferMechanism: 'STANDARD_CONTRACTUAL_CLAUSES',
  dataCategories: ['personal data'], purpose: 'Analytics', validFrom: '2026-01-01', createdBy: 'legal@company.com',
};
const pbdPayload = { projectName: 'New CRM', projectDescription: 'CRM system', createdBy: 'dev@company.com' };
const saComplaintPayload = {
  complainantType: 'DATA_SUBJECT', supervisoryAuthority: 'ICO', receivedDate: '2026-02-01',
  subject: 'Data deletion request not fulfilled', description: 'Subject requested deletion 30 days ago',
  createdBy: 'dpo@company.com',
};

describe('GDPR Extended Routes', () => {
  beforeEach(() => jest.clearAllMocks());

  // DPO
  it('GET /dpo returns list of DPOs', async () => {
    prisma.isDpo.findMany.mockResolvedValue([{ id: 'dpo-1', ...dpoPayload, status: 'ACTIVE' }]);
    const res = await request(app).get('/dpo');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  it('POST /dpo registers a DPO', async () => {
    prisma.isDpo.create.mockResolvedValue({ id: 'dpo-1', ...dpoPayload, status: 'ACTIVE' });
    const res = await request(app).post('/dpo').send(dpoPayload);
    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('ACTIVE');
  });

  it('POST /dpo returns 400 on missing name', async () => {
    const { name: _n, ...body } = dpoPayload;
    const res = await request(app).post('/dpo').send(body);
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('POST /dpo returns 400 on invalid email', async () => {
    const res = await request(app).post('/dpo').send({ ...dpoPayload, email: 'not-email' });
    expect(res.status).toBe(400);
  });

  it('GET /dpo/:id returns DPO details', async () => {
    prisma.isDpo.findUnique.mockResolvedValue({ id: 'dpo-1', ...dpoPayload, deletedAt: null });
    const res = await request(app).get('/dpo/dpo-1');
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('dpo-1');
  });

  it('GET /dpo/:id returns 404 for missing DPO', async () => {
    prisma.isDpo.findUnique.mockResolvedValue(null);
    const res = await request(app).get('/dpo/unknown');
    expect(res.status).toBe(404);
  });

  it('PUT /dpo/:id updates DPO status', async () => {
    prisma.isDpo.findUnique.mockResolvedValue({ id: 'dpo-1', deletedAt: null });
    prisma.isDpo.update.mockResolvedValue({ id: 'dpo-1', status: 'RESIGNED' });
    const res = await request(app).put('/dpo/dpo-1').send({ status: 'RESIGNED' });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('RESIGNED');
  });

  // DPA
  it('GET /dpa returns paginated DPA list', async () => {
    prisma.isDpa.findMany.mockResolvedValue([{ id: 'dpa-1', ...dpaPayload, status: 'ACTIVE' }]);
    prisma.isDpa.count.mockResolvedValue(1);
    const res = await request(app).get('/dpa');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.pagination).toBeDefined();
  });

  it('POST /dpa creates a DPA', async () => {
    prisma.isDpa.create.mockResolvedValue({ id: 'dpa-1', ...dpaPayload, status: 'ACTIVE' });
    const res = await request(app).post('/dpa').send(dpaPayload);
    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('ACTIVE');
  });

  it('POST /dpa returns 400 on empty dataCategories', async () => {
    const res = await request(app).post('/dpa').send({ ...dpaPayload, dataCategories: [] });
    expect(res.status).toBe(400);
  });

  it('GET /dpa/:id returns DPA details', async () => {
    prisma.isDpa.findUnique.mockResolvedValue({ id: 'dpa-1', ...dpaPayload, deletedAt: null });
    const res = await request(app).get('/dpa/dpa-1');
    expect(res.status).toBe(200);
  });

  it('GET /dpa/:id returns 404 for missing DPA', async () => {
    prisma.isDpa.findUnique.mockResolvedValue(null);
    const res = await request(app).get('/dpa/unknown');
    expect(res.status).toBe(404);
  });

  // International Transfers
  it('POST /transfers creates international transfer record', async () => {
    prisma.isInternationalTransfer.create.mockResolvedValue({ id: 'xfer-1', ...transferPayload, status: 'ACTIVE' });
    const res = await request(app).post('/transfers').send(transferPayload);
    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('ACTIVE');
  });

  it('POST /transfers returns 400 on invalid transferMechanism', async () => {
    const res = await request(app).post('/transfers').send({ ...transferPayload, transferMechanism: 'INVALID' });
    expect(res.status).toBe(400);
  });

  it('GET /transfers returns paginated list', async () => {
    prisma.isInternationalTransfer.findMany.mockResolvedValue([]);
    prisma.isInternationalTransfer.count.mockResolvedValue(0);
    const res = await request(app).get('/transfers');
    expect(res.status).toBe(200);
  });

  // Privacy by Design
  it('POST /privacy-by-design creates DPIA record', async () => {
    prisma.isPrivacyByDesign.create.mockResolvedValue({ id: 'pbd-1', ...pbdPayload, status: 'IN_PROGRESS' });
    const res = await request(app).post('/privacy-by-design').send(pbdPayload);
    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('IN_PROGRESS');
  });

  it('POST /privacy-by-design returns 400 on missing projectName', async () => {
    const { projectName: _p, ...body } = pbdPayload;
    const res = await request(app).post('/privacy-by-design').send(body);
    expect(res.status).toBe(400);
  });

  it('GET /privacy-by-design returns paginated list', async () => {
    prisma.isPrivacyByDesign.findMany.mockResolvedValue([]);
    prisma.isPrivacyByDesign.count.mockResolvedValue(0);
    const res = await request(app).get('/privacy-by-design');
    expect(res.status).toBe(200);
  });

  // SA Complaints
  it('POST /sa-complaints registers a complaint', async () => {
    prisma.isSaComplaint.create.mockResolvedValue({ id: 'sc-1', ...saComplaintPayload, status: 'OPEN' });
    const res = await request(app).post('/sa-complaints').send(saComplaintPayload);
    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('OPEN');
  });

  it('POST /sa-complaints returns 400 on invalid complainantType', async () => {
    const res = await request(app).post('/sa-complaints').send({ ...saComplaintPayload, complainantType: 'INVALID' });
    expect(res.status).toBe(400);
  });

  it('GET /sa-complaints returns paginated list', async () => {
    prisma.isSaComplaint.findMany.mockResolvedValue([]);
    prisma.isSaComplaint.count.mockResolvedValue(0);
    const res = await request(app).get('/sa-complaints');
    expect(res.status).toBe(200);
  });

  it('PUT /sa-complaints/:id updates complaint status', async () => {
    prisma.isSaComplaint.findUnique.mockResolvedValue({ id: 'sc-1', deletedAt: null });
    prisma.isSaComplaint.update.mockResolvedValue({ id: 'sc-1', status: 'RESPONDED' });
    const res = await request(app).put('/sa-complaints/sc-1').send({ status: 'RESPONDED', responseNotes: 'Data deleted as requested' });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('RESPONDED');
  });

  it('PUT /sa-complaints/:id returns 404 for unknown complaint', async () => {
    prisma.isSaComplaint.findUnique.mockResolvedValue(null);
    const res = await request(app).put('/sa-complaints/unknown').send({ status: 'CLOSED' });
    expect(res.status).toBe(404);
  });

  it('PUT /sa-complaints/:id returns 400 on invalid status', async () => {
    prisma.isSaComplaint.findUnique.mockResolvedValue({ id: 'sc-1', deletedAt: null });
    const res = await request(app).put('/sa-complaints/sc-1').send({ status: 'INVALID' });
    expect(res.status).toBe(400);
  });
});

describe('GDPR Extended Routes — additional coverage', () => {
  beforeEach(() => jest.clearAllMocks());

  it('GET /dpa returns correct pagination totalPages', async () => {
    prisma.isDpa.findMany.mockResolvedValue([]);
    prisma.isDpa.count.mockResolvedValue(40);
    const res = await request(app).get('/dpa?page=1&limit=10');
    expect(res.status).toBe(200);
    expect(res.body.pagination.totalPages).toBe(4);
  });

  it('GET /transfers returns correct pagination totalPages', async () => {
    prisma.isInternationalTransfer.findMany.mockResolvedValue([]);
    prisma.isInternationalTransfer.count.mockResolvedValue(30);
    const res = await request(app).get('/transfers?page=1&limit=10');
    expect(res.status).toBe(200);
    expect(res.body.pagination.totalPages).toBe(3);
  });

  it('GET /sa-complaints returns correct pagination totalPages', async () => {
    prisma.isSaComplaint.findMany.mockResolvedValue([]);
    prisma.isSaComplaint.count.mockResolvedValue(25);
    const res = await request(app).get('/sa-complaints?page=1&limit=5');
    expect(res.status).toBe(200);
    expect(res.body.pagination.totalPages).toBe(5);
  });

  it('POST /dpo returns 500 on DB create error', async () => {
    prisma.isDpo.create.mockRejectedValue(new Error('DB error'));
    const res = await request(app).post('/dpo').send(dpoPayload);
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });

  it('POST /dpa returns 500 on DB create error', async () => {
    prisma.isDpa.create.mockRejectedValue(new Error('DB error'));
    const res = await request(app).post('/dpa').send(dpaPayload);
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });

  it('POST /transfers returns 500 on DB create error', async () => {
    prisma.isInternationalTransfer.create.mockRejectedValue(new Error('DB error'));
    const res = await request(app).post('/transfers').send(transferPayload);
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });

  it('GET /dpo returns 500 on DB findMany error', async () => {
    prisma.isDpo.findMany.mockRejectedValue(new Error('DB error'));
    const res = await request(app).get('/dpo');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});
