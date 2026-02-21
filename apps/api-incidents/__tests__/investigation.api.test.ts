import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: { incIncident: { update: jest.fn() } },
  Prisma: {},
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

import router from '../src/routes/investigation';
import { prisma } from '../src/prisma';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const app = express();
app.use(express.json());
app.use('/api/investigation', router);
beforeEach(() => {
  jest.clearAllMocks();
});

describe('POST /api/investigation/:id/assign', () => {
  it('should assign an investigator successfully', async () => {
    const updated = {
      id: '00000000-0000-0000-0000-000000000001',
      investigator: 'user-2',
      investigatorName: 'Jane Doe',
      status: 'INVESTIGATING',
    };
    mockPrisma.incIncident.update.mockResolvedValue(updated);
    const res = await request(app)
      .post('/api/investigation/00000000-0000-0000-0000-000000000001/assign')
      .send({ investigator: 'user-2', investigatorName: 'Jane Doe' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.investigator).toBe('user-2');
    expect(mockPrisma.incIncident.update).toHaveBeenCalledWith({
      where: { id: '00000000-0000-0000-0000-000000000001' },
      data: expect.objectContaining({ investigator: 'user-2', status: 'INVESTIGATING' }),
    });
  });

  it('should return 400 if investigator field is missing', async () => {
    const res = await request(app)
      .post('/api/investigation/00000000-0000-0000-0000-000000000001/assign')
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 400 if investigator is empty string', async () => {
    const res = await request(app)
      .post('/api/investigation/00000000-0000-0000-0000-000000000001/assign')
      .send({ investigator: '' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 500 on database error', async () => {
    mockPrisma.incIncident.update.mockRejectedValue(new Error('DB error'));
    const res = await request(app)
      .post('/api/investigation/00000000-0000-0000-0000-000000000001/assign')
      .send({ investigator: 'user-2' });
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('PUT /api/investigation/:id/report', () => {
  it('should update investigation report successfully', async () => {
    const updated = {
      id: '00000000-0000-0000-0000-000000000001',
      rootCause: 'Equipment failure',
      contributingFactors: 'Lack of maintenance',
      correctiveActions: 'Replace equipment',
      preventiveActions: 'Regular checks',
      investigationReport: 'Full report text',
      status: 'ROOT_CAUSE_ANALYSIS',
    };
    mockPrisma.incIncident.update.mockResolvedValue(updated);
    const res = await request(app)
      .put('/api/investigation/00000000-0000-0000-0000-000000000001/report')
      .send({
        rootCause: 'Equipment failure',
        contributingFactors: 'Lack of maintenance',
        correctiveActions: 'Replace equipment',
        preventiveActions: 'Regular checks',
        report: 'Full report text',
      });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('ROOT_CAUSE_ANALYSIS');
    expect(mockPrisma.incIncident.update).toHaveBeenCalledWith({
      where: { id: '00000000-0000-0000-0000-000000000001' },
      data: expect.objectContaining({
        rootCause: 'Equipment failure',
        status: 'ROOT_CAUSE_ANALYSIS',
        investigationReport: 'Full report text',
      }),
    });
  });

  it('should accept report with all optional fields omitted', async () => {
    const updated = { id: '00000000-0000-0000-0000-000000000001', status: 'ROOT_CAUSE_ANALYSIS' };
    mockPrisma.incIncident.update.mockResolvedValue(updated);
    const res = await request(app)
      .put('/api/investigation/00000000-0000-0000-0000-000000000001/report')
      .send({});
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 500 on database error', async () => {
    mockPrisma.incIncident.update.mockRejectedValue(new Error('DB error'));
    const res = await request(app)
      .put('/api/investigation/00000000-0000-0000-0000-000000000001/report')
      .send({ rootCause: 'Equipment failure' });
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('Investigation — extended', () => {
  it('update called once on successful assign', async () => {
    mockPrisma.incIncident.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', investigator: 'u2', status: 'INVESTIGATING' });
    await request(app)
      .post('/api/investigation/00000000-0000-0000-0000-000000000001/assign')
      .send({ investigator: 'u2', investigatorName: 'Bob' });
    expect(mockPrisma.incIncident.update).toHaveBeenCalledTimes(1);
  });

  it('update called once on successful report update', async () => {
    mockPrisma.incIncident.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', status: 'ROOT_CAUSE_ANALYSIS' });
    await request(app)
      .put('/api/investigation/00000000-0000-0000-0000-000000000001/report')
      .send({ rootCause: 'Human error' });
    expect(mockPrisma.incIncident.update).toHaveBeenCalledTimes(1);
  });

  it('successful assign returns investigator in data', async () => {
    mockPrisma.incIncident.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', investigator: 'jane@ims.local', status: 'INVESTIGATING' });
    const res = await request(app)
      .post('/api/investigation/00000000-0000-0000-0000-000000000001/assign')
      .send({ investigator: 'jane@ims.local' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('investigator');
  });
});

describe('Investigation — further extended', () => {
  it('assign sets status to INVESTIGATING', async () => {
    mockPrisma.incIncident.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', investigator: 'u3', status: 'INVESTIGATING' });
    const res = await request(app)
      .post('/api/investigation/00000000-0000-0000-0000-000000000001/assign')
      .send({ investigator: 'u3' });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('INVESTIGATING');
  });

  it('report update sets status to ROOT_CAUSE_ANALYSIS', async () => {
    mockPrisma.incIncident.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', status: 'ROOT_CAUSE_ANALYSIS' });
    const res = await request(app)
      .put('/api/investigation/00000000-0000-0000-0000-000000000001/report')
      .send({ rootCause: 'Process gap' });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('ROOT_CAUSE_ANALYSIS');
  });

  it('assign success is false when DB rejects', async () => {
    mockPrisma.incIncident.update.mockRejectedValue(new Error('DB timeout'));
    const res = await request(app)
      .post('/api/investigation/00000000-0000-0000-0000-000000000001/assign')
      .send({ investigator: 'u4' });
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });

  it('report update error code is INTERNAL_ERROR on 500', async () => {
    mockPrisma.incIncident.update.mockRejectedValue(new Error('connection lost'));
    const res = await request(app)
      .put('/api/investigation/00000000-0000-0000-0000-000000000001/report')
      .send({ rootCause: 'Failure' });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('assign data has id field', async () => {
    mockPrisma.incIncident.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', investigator: 'u5', status: 'INVESTIGATING' });
    const res = await request(app)
      .post('/api/investigation/00000000-0000-0000-0000-000000000001/assign')
      .send({ investigator: 'u5' });
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('id');
  });
});
