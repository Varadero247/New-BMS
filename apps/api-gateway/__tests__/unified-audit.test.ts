import express from 'express';
import request from 'supertest';

jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((req: any, _res: any, next: any) => {
    req.user = { id: 'user-1', email: 'admin@test.com', role: 'ADMIN' };
    next();
  }),
  requireRole: () => (_req: any, _res: any, next: any) => next(),
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({
    info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn(),
  }),
}));

import unifiedAuditRouter from '../src/routes/unified-audit';

const app = express();
app.use(express.json());
app.use('/api/v1/unified-audit', unifiedAuditRouter);

describe('Unified Audit Routes', () => {
  // ============================================
  // GET /api/v1/unified-audit/standards
  // ============================================
  describe('GET /standards', () => {
    it('should list available standards', async () => {
      const res = await request(app).get('/api/v1/unified-audit/standards');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(6);
    });

    it('should include ISO_9001 in the list', async () => {
      const res = await request(app).get('/api/v1/unified-audit/standards');
      const iso9001 = res.body.data.find((s: any) => s.code === 'ISO_9001');
      expect(iso9001).toBeDefined();
      expect(iso9001.clauseCount).toBeGreaterThan(0);
      expect(iso9001.mandatoryCount).toBeGreaterThan(0);
    });

    it('should include standard metadata for each entry', async () => {
      const res = await request(app).get('/api/v1/unified-audit/standards');
      res.body.data.forEach((s: any) => {
        expect(s.code).toBeDefined();
        expect(s.title).toBeDefined();
        expect(s.version).toBeDefined();
        expect(s.clauseCount).toBeGreaterThan(0);
      });
    });
  });

  // ============================================
  // GET /api/v1/unified-audit/standards/:standard/checklist
  // ============================================
  describe('GET /standards/:standard/checklist', () => {
    it('should return ISO_9001 checklist', async () => {
      const res = await request(app).get('/api/v1/unified-audit/standards/ISO_9001/checklist');
      expect(res.status).toBe(200);
      expect(res.body.data.standard).toBe('ISO_9001');
      expect(res.body.data.clauses.length).toBeGreaterThan(0);
    });

    it('should return ISO_14001 checklist', async () => {
      const res = await request(app).get('/api/v1/unified-audit/standards/ISO_14001/checklist');
      expect(res.status).toBe(200);
      expect(res.body.data.standard).toBe('ISO_14001');
    });

    it('should return 404 for unknown standard', async () => {
      const res = await request(app).get('/api/v1/unified-audit/standards/00000000-0000-0000-0000-000000000099/checklist');
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });
  });

  // ============================================
  // POST /api/v1/unified-audit/plans
  // ============================================
  describe('POST /plans', () => {
    it('should create an audit plan for ISO_9001', async () => {
      const res = await request(app).post('/api/v1/unified-audit/plans').send({
        standard: 'ISO_9001',
        auditType: 'INTERNAL',
        title: 'Q1 2026 Internal Audit',
        scope: 'Full QMS scope',
      });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBeDefined();
      expect(res.body.data.standard).toBe('ISO_9001');
      expect(res.body.data.auditType).toBe('INTERNAL');
    });

    it('should create an audit plan for ISO_14001', async () => {
      const res = await request(app).post('/api/v1/unified-audit/plans').send({
        standard: 'ISO_14001',
        auditType: 'EXTERNAL',
        title: 'EMS External Audit',
        scope: 'Environmental management',
      });
      expect(res.status).toBe(201);
      expect(res.body.data.standard).toBe('ISO_14001');
    });

    it('should return 400 for invalid standard', async () => {
      const res = await request(app).post('/api/v1/unified-audit/plans').send({
        standard: 'INVALID',
        auditType: 'INTERNAL',
        title: 'Test',
        scope: 'Test',
      });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('INVALID_STANDARD');
    });

    it('should return 400 for missing title', async () => {
      const res = await request(app).post('/api/v1/unified-audit/plans').send({
        standard: 'ISO_9001',
        auditType: 'INTERNAL',
        scope: 'Test',
      });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for missing scope', async () => {
      const res = await request(app).post('/api/v1/unified-audit/plans').send({
        standard: 'ISO_9001',
        auditType: 'INTERNAL',
        title: 'Test',
      });
      expect(res.status).toBe(400);
    });

    it('should return 400 for invalid auditType', async () => {
      const res = await request(app).post('/api/v1/unified-audit/plans').send({
        standard: 'ISO_9001',
        auditType: 'INVALID',
        title: 'Test',
        scope: 'Test',
      });
      expect(res.status).toBe(400);
    });

    it('should accept CERTIFICATION audit type', async () => {
      const res = await request(app).post('/api/v1/unified-audit/plans').send({
        standard: 'ISO_9001',
        auditType: 'CERTIFICATION',
        title: 'Cert Audit',
        scope: 'Full',
      });
      expect(res.status).toBe(201);
      expect(res.body.data.auditType).toBe('CERTIFICATION');
    });

    it('should accept SURVEILLANCE audit type', async () => {
      const res = await request(app).post('/api/v1/unified-audit/plans').send({
        standard: 'ISO_9001',
        auditType: 'SURVEILLANCE',
        title: 'Surveillance',
        scope: 'Annual check',
      });
      expect(res.status).toBe(201);
    });
  });

  // ============================================
  // GET /api/v1/unified-audit/plans
  // ============================================
  describe('GET /plans', () => {
    it('should list created audit plans', async () => {
      // Create a plan first
      await request(app).post('/api/v1/unified-audit/plans').send({
        standard: 'ISO_45001',
        auditType: 'INTERNAL',
        title: 'Safety Audit',
        scope: 'OHS',
      });

      const res = await request(app).get('/api/v1/unified-audit/plans');
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.meta).toBeDefined();
      expect(res.body.meta.total).toBeGreaterThan(0);
    });

    it('should support pagination', async () => {
      const res = await request(app).get('/api/v1/unified-audit/plans?page=1&limit=5');
      expect(res.status).toBe(200);
      expect(res.body.meta.page).toBe(1);
      expect(res.body.meta.limit).toBe(5);
    });

    it('should include score summary in list', async () => {
      const res = await request(app).get('/api/v1/unified-audit/plans');
      expect(res.status).toBe(200);
      if (res.body.data.length > 0) {
        const plan = res.body.data[0];
        expect(plan.clauseCount).toBeDefined();
        expect(plan.assessed).toBeDefined();
        expect(plan.conformanceRate).toBeDefined();
      }
    });
  });

  // ============================================
  // GET /api/v1/unified-audit/plans/:id
  // ============================================
  describe('GET /plans/:id', () => {
    it('should get a specific audit plan', async () => {
      const createRes = await request(app).post('/api/v1/unified-audit/plans').send({
        standard: 'IATF_16949',
        auditType: 'INTERNAL',
        title: 'Auto Audit',
        scope: 'Production',
      });
      const planId = createRes.body.data.id;

      const res = await request(app).get(`/api/v1/unified-audit/plans/${planId}`);
      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(planId);
      expect(res.body.data.clauses).toBeDefined();
    });

    it('should return 404 for non-existent plan', async () => {
      const res = await request(app).get('/api/v1/unified-audit/plans/00000000-0000-0000-0000-000000000099');
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });
  });

  // ============================================
  // PATCH /api/v1/unified-audit/plans/:id/clauses/:clause
  // ============================================
  describe('PATCH /plans/:id/clauses/:clause', () => {
    let planId: string;
    let firstClause: string;

    beforeAll(async () => {
      const res = await request(app).post('/api/v1/unified-audit/plans').send({
        standard: 'ISO_9001',
        auditType: 'INTERNAL',
        title: 'Clause Update Test',
        scope: 'Test',
      });
      planId = res.body.data.id;
      firstClause = res.body.data.clauses[0].clause;
    });

    it('should update clause status to CONFORMING', async () => {
      const res = await request(app)
        .patch(`/api/v1/unified-audit/plans/${planId}/clauses/${firstClause}`)
        .send({ status: 'CONFORMING' });
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('CONFORMING');
    });

    it('should update clause status to MINOR_NC', async () => {
      const res = await request(app)
        .patch(`/api/v1/unified-audit/plans/${planId}/clauses/${firstClause}`)
        .send({ status: 'MINOR_NC' });
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('MINOR_NC');
    });

    it('should update findings', async () => {
      const res = await request(app)
        .patch(`/api/v1/unified-audit/plans/${planId}/clauses/${firstClause}`)
        .send({ findings: ['Missing documentation', 'Outdated procedure'] });
      expect(res.status).toBe(200);
      expect(res.body.data.findings).toHaveLength(2);
    });

    it('should update auditorNotes', async () => {
      const res = await request(app)
        .patch(`/api/v1/unified-audit/plans/${planId}/clauses/${firstClause}`)
        .send({ auditorNotes: 'Reviewed with dept manager' });
      expect(res.status).toBe(200);
      expect(res.body.data.auditorNotes).toBe('Reviewed with dept manager');
    });

    it('should return 404 for non-existent plan', async () => {
      const res = await request(app)
        .patch('/api/v1/unified-audit/plans/00000000-0000-0000-0000-000000000099/clauses/4.1')
        .send({ status: 'CONFORMING' });
      expect(res.status).toBe(404);
    });

    it('should return 404 for non-existent clause', async () => {
      const res = await request(app)
        .patch(`/api/v1/unified-audit/plans/${planId}/clauses/99.99`)
        .send({ status: 'CONFORMING' });
      expect(res.status).toBe(404);
    });
  });

  // ============================================
  // GET /api/v1/unified-audit/plans/:id/score
  // ============================================
  describe('GET /plans/:id/score', () => {
    it('should return audit score', async () => {
      const createRes = await request(app).post('/api/v1/unified-audit/plans').send({
        standard: 'ISO_9001',
        auditType: 'INTERNAL',
        title: 'Score Test',
        scope: 'Test',
      });
      const planId = createRes.body.data.id;

      const res = await request(app).get(`/api/v1/unified-audit/plans/${planId}/score`);
      expect(res.status).toBe(200);
      expect(res.body.data.total).toBeGreaterThan(0);
      expect(res.body.data.conformanceRate).toBeDefined();
    });

    it('should return 404 for non-existent plan', async () => {
      const res = await request(app).get('/api/v1/unified-audit/plans/00000000-0000-0000-0000-000000000099/score');
      expect(res.status).toBe(404);
    });
  });

  // ============================================
  // GET /api/v1/unified-audit/plans/:id/gaps
  // ============================================
  describe('GET /plans/:id/gaps', () => {
    it('should return mandatory gaps', async () => {
      const createRes = await request(app).post('/api/v1/unified-audit/plans').send({
        standard: 'ISO_9001',
        auditType: 'INTERNAL',
        title: 'Gaps Test',
        scope: 'Test',
      });
      const planId = createRes.body.data.id;

      const res = await request(app).get(`/api/v1/unified-audit/plans/${planId}/gaps`);
      expect(res.status).toBe(200);
      expect(res.body.data.gapCount).toBeGreaterThan(0);
      expect(res.body.data.gaps.length).toBeGreaterThan(0);
    });

    it('should return 404 for non-existent plan', async () => {
      const res = await request(app).get('/api/v1/unified-audit/plans/00000000-0000-0000-0000-000000000099/gaps');
      expect(res.status).toBe(404);
    });
  });

  // ============================================
  // GET /api/v1/unified-audit/plans/:id/report
  // ============================================
  describe('GET /plans/:id/report', () => {
    it('should generate an audit report', async () => {
      const createRes = await request(app).post('/api/v1/unified-audit/plans').send({
        standard: 'ISO_9001',
        auditType: 'EXTERNAL',
        title: 'Report Test',
        scope: 'Full',
      });
      const planId = createRes.body.data.id;

      const res = await request(app).get(`/api/v1/unified-audit/plans/${planId}/report`);
      expect(res.status).toBe(200);
      expect(res.body.data.recommendation).toBeDefined();
      expect(res.body.data.score).toBeDefined();
      expect(res.body.data.clauseSummary).toBeDefined();
    });

    it('should include INCOMPLETE recommendation for unassessed plans', async () => {
      const createRes = await request(app).post('/api/v1/unified-audit/plans').send({
        standard: 'ISO_9001',
        auditType: 'INTERNAL',
        title: 'Incomplete Test',
        scope: 'Test',
      });
      const planId = createRes.body.data.id;

      const res = await request(app).get(`/api/v1/unified-audit/plans/${planId}/report`);
      expect(res.status).toBe(200);
      expect(res.body.data.recommendation).toContain('INCOMPLETE');
    });

    it('should return 404 for non-existent plan', async () => {
      const res = await request(app).get('/api/v1/unified-audit/plans/00000000-0000-0000-0000-000000000099/report');
      expect(res.status).toBe(404);
    });
  });
});
