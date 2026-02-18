import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: { audAudit: { findFirst: jest.fn() } },
  Prisma: {},
}));
jest.mock('@ims/auth', () => ({ authenticate: jest.fn((_req: any, _res: any, next: any) => { _req.user = { id: 'user-1', orgId: 'org-1', role: 'ADMIN' }; next(); }) }));
jest.mock('@ims/monitoring', () => ({ createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }) }));

import router from '../src/routes/pre-audit';
import { prisma } from '../src/prisma';
const app = express(); app.use(express.json()); app.use('/api/pre-audit', router);
beforeEach(() => { jest.clearAllMocks(); });

describe('POST /api/pre-audit/:id/generate', () => {
  it('should generate a pre-audit report for a valid audit', async () => {
    (prisma as any).audAudit.findFirst.mockResolvedValue({
      id: 'audit-1',
      referenceNumber: 'AUD-2026-0001',
      title: 'Annual ISO 9001 Audit',
      scope: 'Quality Management',
      standard: 'ISO 9001:2015',
    });
    const res = await request(app).post('/api/pre-audit/audit-1/generate');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.auditRef).toBe('AUD-2026-0001');
    expect(res.body.data.title).toBe('Annual ISO 9001 Audit');
    expect(res.body.data.scope).toBe('Quality Management');
    expect(res.body.data.standard).toBe('ISO 9001:2015');
    expect(Array.isArray(res.body.data.recommendations)).toBe(true);
    expect(res.body.data.recommendations.length).toBeGreaterThan(0);
    expect(Array.isArray(res.body.data.checklist)).toBe(true);
    expect(res.body.data.generatedAt).toBeDefined();
    expect(res.body.data.preparedDate).toBeDefined();
    expect(res.body.data.estimatedDurationHours).toBeGreaterThan(0);
  });

  it('should return 404 when audit not found', async () => {
    (prisma as any).audAudit.findFirst.mockResolvedValue(null);
    const res = await request(app).post('/api/pre-audit/nonexistent/generate');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
    expect(res.body.error.message).toBe('Audit not found');
  });

  it('should return 500 on database error', async () => {
    (prisma as any).audAudit.findFirst.mockRejectedValue(new Error('DB connection failed'));
    const res = await request(app).post('/api/pre-audit/audit-1/generate');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});
