import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    ismsAudit: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    auditFinding: {
      findMany: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
    },
    vulnerabilityScan: {
      findMany: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
    },
    penetrationTest: {
      findMany: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
    },
  },
  Prisma: { Decimal: jest.fn((v: any) => v) },
}));

jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((req: any, _res: any, next: any) => {
    req.user = { id: 'user-123', email: 'test@test.com', role: 'ADMIN' };
    next();
  }),
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

import router from '../src/routes/audits';
import { prisma } from '../src/prisma';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const app = express();
app.use(express.json());
app.use('/api/audits', router);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('InfoSec Audits API', () => {
  const mockAudit = {
    id: 'audit-1',
    refNumber: 'ISA-2602-4567',
    title: 'Annual ISMS Internal Audit',
    description: 'Comprehensive ISMS audit',
    auditDate: '2026-03-15T00:00:00.000Z',
    leadAuditor: 'Jane Smith',
    auditTeam: ['Jane Smith', 'Bob Wilson'],
    scope: 'Full ISMS scope',
    auditType: 'INTERNAL',
    status: 'PLANNED',
    summary: null,
    overallConclusion: null,
    completedAt: null,
    createdBy: 'user-123',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
    findings: [],
  };

  const mockFinding = {
    id: 'finding-1',
    auditId: 'audit-1',
    clause: '6.1',
    type: 'NONCONFORMITY_MINOR',
    description: 'Risk assessment not covering all assets',
    evidence: 'Asset register incomplete',
    recommendation: 'Complete asset register',
    status: 'OPEN',
    createdBy: 'user-123',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockScan = {
    id: 'scan-1',
    refNumber: 'VS-2602-1234',
    scanName: 'Q1 2026 Vulnerability Scan',
    scanDate: '2026-01-15T00:00:00.000Z',
    scanner: 'Nessus',
    targetSystems: ['web-server', 'db-server'],
    criticalCount: 2,
    highCount: 5,
    mediumCount: 12,
    lowCount: 25,
    infoCount: 50,
    summary: 'Found 2 critical vulnerabilities',
    reportUrl: null,
    createdBy: 'user-123',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockPenTest = {
    id: 'pt-1',
    refNumber: 'PT-2602-5678',
    testName: 'Annual Penetration Test',
    testDate: '2026-02-01T00:00:00.000Z',
    tester: 'External Pen Test Co.',
    methodology: 'OWASP',
    scope: 'External-facing applications',
    findingsCount: 8,
    criticalFindings: 1,
    highFindings: 3,
    summary: '1 critical finding in auth module',
    reportUrl: null,
    status: 'COMPLETED',
    createdBy: 'user-123',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // ---- POST /api/audits ----

  describe('POST /api/audits', () => {
    it('should create audit', async () => {
      (mockPrisma.ismsAudit.create as jest.Mock).mockResolvedValueOnce(mockAudit);

      const res = await request(app)
        .post('/api/audits')
        .send({
          title: 'Annual ISMS Internal Audit',
          auditDate: '2026-03-15',
          leadAuditor: 'Jane Smith',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual(mockAudit);
    });

    it('should return 400 for missing title', async () => {
      const res = await request(app)
        .post('/api/audits')
        .send({ auditDate: '2026-03-15', leadAuditor: 'Jane' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 for missing auditDate', async () => {
      const res = await request(app)
        .post('/api/audits')
        .send({ title: 'Test Audit', leadAuditor: 'Jane' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 for missing leadAuditor', async () => {
      const res = await request(app)
        .post('/api/audits')
        .send({ title: 'Test Audit', auditDate: '2026-03-15' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should generate ref number starting with ISA-', async () => {
      (mockPrisma.ismsAudit.create as jest.Mock).mockResolvedValueOnce(mockAudit);

      await request(app)
        .post('/api/audits')
        .send({ title: 'Audit', auditDate: '2026-03-15', leadAuditor: 'Jane' });

      const createCall = (mockPrisma.ismsAudit.create as jest.Mock).mock.calls[0][0];
      expect(createCall.data.refNumber).toMatch(/^ISA-/);
    });

    it('should set status to PLANNED on create', async () => {
      (mockPrisma.ismsAudit.create as jest.Mock).mockResolvedValueOnce(mockAudit);

      await request(app)
        .post('/api/audits')
        .send({ title: 'Audit', auditDate: '2026-03-15', leadAuditor: 'Jane' });

      const createCall = (mockPrisma.ismsAudit.create as jest.Mock).mock.calls[0][0];
      expect(createCall.data.status).toBe('PLANNED');
    });

    it('should return 500 on database error', async () => {
      (mockPrisma.ismsAudit.create as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const res = await request(app)
        .post('/api/audits')
        .send({ title: 'Audit', auditDate: '2026-03-15', leadAuditor: 'Jane' });

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  // ---- GET /api/audits ----

  describe('GET /api/audits', () => {
    it('should return paginated list', async () => {
      (mockPrisma.ismsAudit.findMany as jest.Mock).mockResolvedValueOnce([mockAudit]);
      (mockPrisma.ismsAudit.count as jest.Mock).mockResolvedValueOnce(1);

      const res = await request(app).get('/api/audits');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.pagination).toBeDefined();
    });

    it('should filter by status', async () => {
      (mockPrisma.ismsAudit.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.ismsAudit.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app).get('/api/audits?status=COMPLETED');

      const findCall = (mockPrisma.ismsAudit.findMany as jest.Mock).mock.calls[0][0];
      expect(findCall.where.status).toBe('COMPLETED');
    });

    it('should filter by auditType', async () => {
      (mockPrisma.ismsAudit.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.ismsAudit.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app).get('/api/audits?auditType=EXTERNAL');

      const findCall = (mockPrisma.ismsAudit.findMany as jest.Mock).mock.calls[0][0];
      expect(findCall.where.auditType).toBe('EXTERNAL');
    });

    it('should exclude soft-deleted audits', async () => {
      (mockPrisma.ismsAudit.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.ismsAudit.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app).get('/api/audits');

      const findCall = (mockPrisma.ismsAudit.findMany as jest.Mock).mock.calls[0][0];
      expect(findCall.where.deletedAt).toBeNull();
    });

    it('should return 500 on database error', async () => {
      (mockPrisma.ismsAudit.findMany as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const res = await request(app).get('/api/audits');

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  // ---- GET /api/audits/:id ----

  describe('GET /api/audits/:id', () => {
    it('should return audit with findings', async () => {
      (mockPrisma.ismsAudit.findFirst as jest.Mock).mockResolvedValueOnce({
        ...mockAudit,
        findings: [mockFinding],
      });

      const res = await request(app).get('/api/audits/audit-1');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.findings).toHaveLength(1);
    });

    it('should return 404 when audit not found', async () => {
      (mockPrisma.ismsAudit.findFirst as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app).get('/api/audits/nonexistent');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should include findings ordered by createdAt', async () => {
      (mockPrisma.ismsAudit.findFirst as jest.Mock).mockResolvedValueOnce(mockAudit);

      await request(app).get('/api/audits/audit-1');

      const findCall = (mockPrisma.ismsAudit.findFirst as jest.Mock).mock.calls[0][0];
      expect(findCall.include.findings).toBeDefined();
    });
  });

  // ---- GET /api/audits/:id/checklist ----

  describe('GET /api/audits/:id/checklist', () => {
    it('should return clause checklist', async () => {
      (mockPrisma.ismsAudit.findFirst as jest.Mock).mockResolvedValueOnce(mockAudit);

      const res = await request(app).get('/api/audits/audit-1/checklist');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.standard).toBe('ISO 27001:2022');
      expect(res.body.data.clauses).toBeDefined();
      expect(res.body.data.clauses.length).toBeGreaterThan(0);
    });

    it('should return 404 when audit not found', async () => {
      (mockPrisma.ismsAudit.findFirst as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app).get('/api/audits/nonexistent/checklist');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should include auditId in response', async () => {
      (mockPrisma.ismsAudit.findFirst as jest.Mock).mockResolvedValueOnce(mockAudit);

      const res = await request(app).get('/api/audits/audit-1/checklist');

      expect(res.body.data.auditId).toBe('audit-1');
    });
  });

  // ---- POST /api/audits/:id/findings ----

  describe('POST /api/audits/:id/findings', () => {
    it('should add finding to audit', async () => {
      (mockPrisma.ismsAudit.findFirst as jest.Mock).mockResolvedValueOnce(mockAudit);
      (mockPrisma.auditFinding.create as jest.Mock).mockResolvedValueOnce(mockFinding);

      const res = await request(app)
        .post('/api/audits/audit-1/findings')
        .send({
          clause: '6.1',
          type: 'NONCONFORMITY_MINOR',
          description: 'Risk assessment not covering all assets',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual(mockFinding);
    });

    it('should return 400 for missing description', async () => {
      const res = await request(app)
        .post('/api/audits/audit-1/findings')
        .send({ clause: '6.1', type: 'NONCONFORMITY_MINOR' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 for missing clause', async () => {
      const res = await request(app)
        .post('/api/audits/audit-1/findings')
        .send({ type: 'NONCONFORMITY_MINOR', description: 'Test finding' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 for invalid finding type', async () => {
      const res = await request(app)
        .post('/api/audits/audit-1/findings')
        .send({ clause: '6.1', type: 'INVALID', description: 'Test' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 404 when audit not found', async () => {
      (mockPrisma.ismsAudit.findFirst as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app)
        .post('/api/audits/nonexistent/findings')
        .send({ clause: '6.1', type: 'NONCONFORMITY_MINOR', description: 'Test' });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should set finding status to OPEN', async () => {
      (mockPrisma.ismsAudit.findFirst as jest.Mock).mockResolvedValueOnce(mockAudit);
      (mockPrisma.auditFinding.create as jest.Mock).mockResolvedValueOnce(mockFinding);

      await request(app)
        .post('/api/audits/audit-1/findings')
        .send({ clause: '6.1', type: 'OBSERVATION', description: 'Minor observation' });

      const createCall = (mockPrisma.auditFinding.create as jest.Mock).mock.calls[0][0];
      expect(createCall.data.status).toBe('OPEN');
    });
  });

  // ---- PUT /api/audits/:id/complete ----

  describe('PUT /api/audits/:id/complete', () => {
    it('should complete audit with summary', async () => {
      (mockPrisma.ismsAudit.findFirst as jest.Mock).mockResolvedValueOnce(mockAudit);
      (mockPrisma.ismsAudit.update as jest.Mock).mockResolvedValueOnce({
        ...mockAudit,
        summary: 'Audit completed successfully',
        status: 'COMPLETED',
        completedAt: new Date().toISOString(),
      });

      const res = await request(app)
        .put('/api/audits/audit-1/complete')
        .send({ summary: 'Audit completed successfully' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      const updateCall = (mockPrisma.ismsAudit.update as jest.Mock).mock.calls[0][0];
      expect(updateCall.data.status).toBe('COMPLETED');
    });

    it('should return 400 for missing summary', async () => {
      const res = await request(app)
        .put('/api/audits/audit-1/complete')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 404 when audit not found', async () => {
      (mockPrisma.ismsAudit.findFirst as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app)
        .put('/api/audits/nonexistent/complete')
        .send({ summary: 'Done' });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should set completedAt timestamp', async () => {
      (mockPrisma.ismsAudit.findFirst as jest.Mock).mockResolvedValueOnce(mockAudit);
      (mockPrisma.ismsAudit.update as jest.Mock).mockResolvedValueOnce(mockAudit);

      await request(app)
        .put('/api/audits/audit-1/complete')
        .send({ summary: 'Completed' });

      const updateCall = (mockPrisma.ismsAudit.update as jest.Mock).mock.calls[0][0];
      expect(updateCall.data.completedAt).toBeDefined();
    });
  });

  // ---- GET /api/audits/vulnerability-scans ----

  describe('GET /api/audits/vulnerability-scans', () => {
    it('should list vulnerability scans', async () => {
      (mockPrisma.vulnerabilityScan.findMany as jest.Mock).mockResolvedValueOnce([mockScan]);
      (mockPrisma.vulnerabilityScan.count as jest.Mock).mockResolvedValueOnce(1);

      const res = await request(app).get('/api/audits/vulnerability-scans');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.pagination).toBeDefined();
    });

    it('should return 500 on database error', async () => {
      (mockPrisma.vulnerabilityScan.findMany as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const res = await request(app).get('/api/audits/vulnerability-scans');

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  // ---- POST /api/audits/vulnerability-scans ----

  describe('POST /api/audits/vulnerability-scans', () => {
    it('should create vulnerability scan', async () => {
      (mockPrisma.vulnerabilityScan.create as jest.Mock).mockResolvedValueOnce(mockScan);

      const res = await request(app)
        .post('/api/audits/vulnerability-scans')
        .send({ scanName: 'Q1 Scan', scanDate: '2026-01-15' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('should return 400 for missing scanName', async () => {
      const res = await request(app)
        .post('/api/audits/vulnerability-scans')
        .send({ scanDate: '2026-01-15' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should generate ref number starting with VS-', async () => {
      (mockPrisma.vulnerabilityScan.create as jest.Mock).mockResolvedValueOnce(mockScan);

      await request(app)
        .post('/api/audits/vulnerability-scans')
        .send({ scanName: 'Q1 Scan', scanDate: '2026-01-15' });

      const createCall = (mockPrisma.vulnerabilityScan.create as jest.Mock).mock.calls[0][0];
      expect(createCall.data.refNumber).toMatch(/^VS-/);
    });
  });

  // ---- GET /api/audits/penetration-tests ----

  describe('GET /api/audits/penetration-tests', () => {
    it('should list penetration tests', async () => {
      (mockPrisma.penetrationTest.findMany as jest.Mock).mockResolvedValueOnce([mockPenTest]);
      (mockPrisma.penetrationTest.count as jest.Mock).mockResolvedValueOnce(1);

      const res = await request(app).get('/api/audits/penetration-tests');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
    });

    it('should return 500 on database error', async () => {
      (mockPrisma.penetrationTest.findMany as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const res = await request(app).get('/api/audits/penetration-tests');

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  // ---- POST /api/audits/penetration-tests ----

  describe('POST /api/audits/penetration-tests', () => {
    it('should create penetration test', async () => {
      (mockPrisma.penetrationTest.create as jest.Mock).mockResolvedValueOnce(mockPenTest);

      const res = await request(app)
        .post('/api/audits/penetration-tests')
        .send({ testName: 'Annual Pen Test', testDate: '2026-02-01' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('should return 400 for missing testName', async () => {
      const res = await request(app)
        .post('/api/audits/penetration-tests')
        .send({ testDate: '2026-02-01' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should generate ref number starting with PT-', async () => {
      (mockPrisma.penetrationTest.create as jest.Mock).mockResolvedValueOnce(mockPenTest);

      await request(app)
        .post('/api/audits/penetration-tests')
        .send({ testName: 'Pen Test', testDate: '2026-02-01' });

      const createCall = (mockPrisma.penetrationTest.create as jest.Mock).mock.calls[0][0];
      expect(createCall.data.refNumber).toMatch(/^PT-/);
    });

    it('should accept optional fields', async () => {
      (mockPrisma.penetrationTest.create as jest.Mock).mockResolvedValueOnce(mockPenTest);

      const res = await request(app)
        .post('/api/audits/penetration-tests')
        .send({
          testName: 'Pen Test',
          testDate: '2026-02-01',
          tester: 'External Co.',
          methodology: 'OWASP',
          scope: 'Web apps',
          findingsCount: 5,
          criticalFindings: 1,
          highFindings: 2,
        });

      expect(res.status).toBe(201);
    });

    it('should return 500 on database error', async () => {
      (mockPrisma.penetrationTest.create as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const res = await request(app)
        .post('/api/audits/penetration-tests')
        .send({ testName: 'Pen Test', testDate: '2026-02-01' });

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });
});
