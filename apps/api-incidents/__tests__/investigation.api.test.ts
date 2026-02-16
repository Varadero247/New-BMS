import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: { incIncident: { update: jest.fn() } },
  Prisma: {},
}));
jest.mock('@ims/auth', () => ({ authenticate: jest.fn((_req: any, _res: any, next: any) => { _req.user = { id: 'user-1', orgId: 'org-1', role: 'ADMIN' }; next(); }) }));
jest.mock('@ims/monitoring', () => ({ createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }) }));

import router from '../src/routes/investigation';
import { prisma } from '../src/prisma';
const app = express(); app.use(express.json()); app.use('/api/investigation', router);
beforeEach(() => { jest.clearAllMocks(); });

describe('POST /api/investigation/:id/assign', () => {
  it('should assign an investigator successfully', async () => {
    const updated = { id: 'inc-1', investigator: 'user-2', investigatorName: 'Jane Doe', status: 'INVESTIGATING' };
    (prisma as any).incIncident.update.mockResolvedValue(updated);
    const res = await request(app)
      .post('/api/investigation/inc-1/assign')
      .send({ investigator: 'user-2', investigatorName: 'Jane Doe' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.investigator).toBe('user-2');
    expect((prisma as any).incIncident.update).toHaveBeenCalledWith({
      where: { id: 'inc-1' },
      data: expect.objectContaining({ investigator: 'user-2', status: 'INVESTIGATING' }),
    });
  });

  it('should return 400 if investigator field is missing', async () => {
    const res = await request(app)
      .post('/api/investigation/inc-1/assign')
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 400 if investigator is empty string', async () => {
    const res = await request(app)
      .post('/api/investigation/inc-1/assign')
      .send({ investigator: '' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 500 on database error', async () => {
    (prisma as any).incIncident.update.mockRejectedValue(new Error('DB error'));
    const res = await request(app)
      .post('/api/investigation/inc-1/assign')
      .send({ investigator: 'user-2' });
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('UPDATE_ERROR');
  });
});

describe('PUT /api/investigation/:id/report', () => {
  it('should update investigation report successfully', async () => {
    const updated = {
      id: 'inc-1',
      rootCause: 'Equipment failure',
      contributingFactors: 'Lack of maintenance',
      correctiveActions: 'Replace equipment',
      preventiveActions: 'Regular checks',
      investigationReport: 'Full report text',
      status: 'ROOT_CAUSE_ANALYSIS',
    };
    (prisma as any).incIncident.update.mockResolvedValue(updated);
    const res = await request(app)
      .put('/api/investigation/inc-1/report')
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
    expect((prisma as any).incIncident.update).toHaveBeenCalledWith({
      where: { id: 'inc-1' },
      data: expect.objectContaining({
        rootCause: 'Equipment failure',
        status: 'ROOT_CAUSE_ANALYSIS',
        investigationReport: 'Full report text',
      }),
    });
  });

  it('should accept report with all optional fields omitted', async () => {
    const updated = { id: 'inc-1', status: 'ROOT_CAUSE_ANALYSIS' };
    (prisma as any).incIncident.update.mockResolvedValue(updated);
    const res = await request(app)
      .put('/api/investigation/inc-1/report')
      .send({});
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 500 on database error', async () => {
    (prisma as any).incIncident.update.mockRejectedValue(new Error('DB error'));
    const res = await request(app)
      .put('/api/investigation/inc-1/report')
      .send({ rootCause: 'Equipment failure' });
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('UPDATE_ERROR');
  });
});
