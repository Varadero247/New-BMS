import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: { audAudit: { findFirst: jest.fn() } },
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

import router from '../src/routes/pre-audit';
import { prisma } from '../src/prisma';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const app = express();
app.use(express.json());
app.use('/api/pre-audit', router);
beforeEach(() => {
  jest.clearAllMocks();
});

const AUDIT_ID = '00000000-0000-0000-0000-000000000001';

function makeAudit(overrides: Record<string, unknown> = {}) {
  return {
    id: AUDIT_ID,
    referenceNumber: 'AUD-2026-0001',
    title: 'Annual Audit',
    scope: 'Quality Management',
    standard: 'ISO 9001:2015',
    type: 'INTERNAL',
    status: 'SCHEDULED',
    ...overrides,
  };
}

describe('POST /api/pre-audit/:id/generate', () => {
  it('should generate a pre-audit report for a valid audit', async () => {
    mockPrisma.audAudit.findFirst.mockResolvedValue(makeAudit());
    const res = await request(app).post(`/api/pre-audit/${AUDIT_ID}/generate`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.auditRef).toBe('AUD-2026-0001');
    expect(res.body.data.title).toBe('Annual Audit');
    expect(Array.isArray(res.body.data.recommendations)).toBe(true);
    expect(res.body.data.recommendations.length).toBeGreaterThan(0);
    expect(Array.isArray(res.body.data.checklist)).toBe(true);
    expect(res.body.data.generatedAt).toBeDefined();
    expect(res.body.data.estimatedDurationHours).toBeGreaterThan(0);
  });

  it('should return 404 when audit not found', async () => {
    mockPrisma.audAudit.findFirst.mockResolvedValue(null);
    const res = await request(app).post(`/api/pre-audit/${AUDIT_ID}/generate`);
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should return 500 on database error', async () => {
    mockPrisma.audAudit.findFirst.mockRejectedValue(new Error('DB connection failed'));
    const res = await request(app).post(`/api/pre-audit/${AUDIT_ID}/generate`);
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  // ── Standard-specific recommendations ────────────────────────────

  it('ISO 9001 audit includes quality management recommendations', async () => {
    mockPrisma.audAudit.findFirst.mockResolvedValue(makeAudit({ standard: 'ISO 9001:2015' }));
    const res = await request(app).post(`/api/pre-audit/${AUDIT_ID}/generate`);
    expect(res.status).toBe(200);
    const recs: string[] = res.body.data.recommendations;
    expect(recs.some((r) => r.toLowerCase().includes('quality management'))).toBe(true);
    expect(recs.some((r) => r.toLowerCase().includes('customer satisfaction'))).toBe(true);
  });

  it('ISO 14001 audit includes environmental management recommendations', async () => {
    mockPrisma.audAudit.findFirst.mockResolvedValue(makeAudit({ standard: 'ISO 14001:2015' }));
    const res = await request(app).post(`/api/pre-audit/${AUDIT_ID}/generate`);
    expect(res.status).toBe(200);
    const recs: string[] = res.body.data.recommendations;
    expect(recs.some((r) => r.toLowerCase().includes('environmental'))).toBe(true);
  });

  it('ISO 45001 audit includes health & safety recommendations', async () => {
    mockPrisma.audAudit.findFirst.mockResolvedValue(makeAudit({ standard: 'ISO 45001:2018' }));
    const res = await request(app).post(`/api/pre-audit/${AUDIT_ID}/generate`);
    expect(res.status).toBe(200);
    const recs: string[] = res.body.data.recommendations;
    expect(recs.some((r) => r.toLowerCase().includes('hazard') || r.toLowerCase().includes('incident'))).toBe(true);
  });

  it('ISO 27001 audit includes information security recommendations', async () => {
    mockPrisma.audAudit.findFirst.mockResolvedValue(makeAudit({ standard: 'ISO/IEC 27001:2022' }));
    const res = await request(app).post(`/api/pre-audit/${AUDIT_ID}/generate`);
    expect(res.status).toBe(200);
    const recs: string[] = res.body.data.recommendations;
    expect(recs.some((r) => r.toLowerCase().includes('statement of applicability') || r.toLowerCase().includes('soa'))).toBe(true);
  });

  it('ISO 22301 audit includes business continuity recommendations', async () => {
    mockPrisma.audAudit.findFirst.mockResolvedValue(makeAudit({ standard: 'ISO 22301:2019' }));
    const res = await request(app).post(`/api/pre-audit/${AUDIT_ID}/generate`);
    expect(res.status).toBe(200);
    const recs: string[] = res.body.data.recommendations;
    expect(recs.some((r) => r.toLowerCase().includes('business continuity'))).toBe(true);
  });

  it('unknown standard uses generic recommendations', async () => {
    mockPrisma.audAudit.findFirst.mockResolvedValue(makeAudit({ standard: 'CUSTOM-STD' }));
    const res = await request(app).post(`/api/pre-audit/${AUDIT_ID}/generate`);
    expect(res.status).toBe(200);
    const recs: string[] = res.body.data.recommendations;
    expect(recs.some((r) => r.toLowerCase().includes('procedures') || r.toLowerCase().includes('management system'))).toBe(true);
  });

  // ── Type-specific recommendations ─────────────────────────────────

  it('CERTIFICATION type includes gap assessment recommendation', async () => {
    mockPrisma.audAudit.findFirst.mockResolvedValue(makeAudit({ type: 'CERTIFICATION' }));
    const res = await request(app).post(`/api/pre-audit/${AUDIT_ID}/generate`);
    expect(res.status).toBe(200);
    const recs: string[] = res.body.data.recommendations;
    expect(recs.some((r) => r.toLowerCase().includes('gap assessment') || r.toLowerCase().includes('nonconformit'))).toBe(true);
  });

  it('EXTERNAL type includes process owner notification recommendation', async () => {
    mockPrisma.audAudit.findFirst.mockResolvedValue(makeAudit({ type: 'EXTERNAL' }));
    const res = await request(app).post(`/api/pre-audit/${AUDIT_ID}/generate`);
    expect(res.status).toBe(200);
    const recs: string[] = res.body.data.recommendations;
    expect(recs.some((r) => r.toLowerCase().includes('process owner'))).toBe(true);
  });

  it('SUPPLIER type includes self-assessment questionnaire recommendation', async () => {
    mockPrisma.audAudit.findFirst.mockResolvedValue(makeAudit({ type: 'SUPPLIER' }));
    const res = await request(app).post(`/api/pre-audit/${AUDIT_ID}/generate`);
    expect(res.status).toBe(200);
    const recs: string[] = res.body.data.recommendations;
    expect(recs.some((r) => r.toLowerCase().includes('self-assessment') || r.toLowerCase().includes('supplier'))).toBe(true);
  });

  // ── Duration estimation ────────────────────────────────────────────

  it('CERTIFICATION audits are estimated at 16 hours', async () => {
    mockPrisma.audAudit.findFirst.mockResolvedValue(makeAudit({ type: 'CERTIFICATION' }));
    const res = await request(app).post(`/api/pre-audit/${AUDIT_ID}/generate`);
    expect(res.body.data.estimatedDurationHours).toBe(16);
  });

  it('EXTERNAL audits are estimated at 8 hours', async () => {
    mockPrisma.audAudit.findFirst.mockResolvedValue(makeAudit({ type: 'EXTERNAL' }));
    const res = await request(app).post(`/api/pre-audit/${AUDIT_ID}/generate`);
    expect(res.body.data.estimatedDurationHours).toBe(8);
  });

  it('SUPPLIER audits are estimated at 6 hours', async () => {
    mockPrisma.audAudit.findFirst.mockResolvedValue(makeAudit({ type: 'SUPPLIER' }));
    const res = await request(app).post(`/api/pre-audit/${AUDIT_ID}/generate`);
    expect(res.body.data.estimatedDurationHours).toBe(6);
  });

  it('INTERNAL audits are estimated at 4 hours', async () => {
    mockPrisma.audAudit.findFirst.mockResolvedValue(makeAudit({ type: 'INTERNAL' }));
    const res = await request(app).post(`/api/pre-audit/${AUDIT_ID}/generate`);
    expect(res.body.data.estimatedDurationHours).toBe(4);
  });

  // ── Checklist ──────────────────────────────────────────────────────

  it('CERTIFICATION type adds extra checklist items', async () => {
    mockPrisma.audAudit.findFirst.mockResolvedValue(makeAudit({ type: 'CERTIFICATION' }));
    const res = await request(app).post(`/api/pre-audit/${AUDIT_ID}/generate`);
    expect(res.body.data.checklist.length).toBeGreaterThan(6); // base 6 + 2 extra
    const checklist: string[] = res.body.data.checklist;
    expect(checklist.some((c) => c.toLowerCase().includes('statement of applicability') || c.toLowerCase().includes('risk register'))).toBe(true);
  });

  it('non-CERTIFICATION types have base checklist (6 items)', async () => {
    mockPrisma.audAudit.findFirst.mockResolvedValue(makeAudit({ type: 'INTERNAL' }));
    const res = await request(app).post(`/api/pre-audit/${AUDIT_ID}/generate`);
    expect(res.body.data.checklist.length).toBe(6);
  });

  // ── Scope-specific recommendations ────────────────────────────────

  it('includes scope-specific recommendation when scope > 10 chars', async () => {
    mockPrisma.audAudit.findFirst.mockResolvedValue(
      makeAudit({ scope: 'Complete Quality Management System including all departments' })
    );
    const res = await request(app).post(`/api/pre-audit/${AUDIT_ID}/generate`);
    expect(res.status).toBe(200);
    const recs: string[] = res.body.data.recommendations;
    expect(recs.some((r) => r.includes('Review all processes within scope'))).toBe(true);
  });

  it('omits scope recommendation when scope is null or short', async () => {
    mockPrisma.audAudit.findFirst.mockResolvedValue(makeAudit({ scope: null }));
    const res = await request(app).post(`/api/pre-audit/${AUDIT_ID}/generate`);
    expect(res.status).toBe(200);
    const recs: string[] = res.body.data.recommendations;
    expect(recs.some((r) => r.includes('Review all processes within scope'))).toBe(false);
  });
});

describe('POST /api/pre-audit/:id/generate — additional edge cases', () => {
  it('returns success:true in response body', async () => {
    mockPrisma.audAudit.findFirst.mockResolvedValue(makeAudit());
    const res = await request(app).post(`/api/pre-audit/${AUDIT_ID}/generate`);
    expect(res.body.success).toBe(true);
  });

  it('response includes standard field from the audit record', async () => {
    mockPrisma.audAudit.findFirst.mockResolvedValue(makeAudit({ standard: 'ISO 9001:2015' }));
    const res = await request(app).post(`/api/pre-audit/${AUDIT_ID}/generate`);
    expect(res.body.data.standard).toBe('ISO 9001:2015');
  });

  it('response includes type field from the audit record', async () => {
    mockPrisma.audAudit.findFirst.mockResolvedValue(makeAudit({ type: 'EXTERNAL' }));
    const res = await request(app).post(`/api/pre-audit/${AUDIT_ID}/generate`);
    expect(res.body.data.type).toBe('EXTERNAL');
  });

  it('ISO 50001 audit falls through to generic recommendations', async () => {
    mockPrisma.audAudit.findFirst.mockResolvedValue(makeAudit({ standard: 'ISO 50001:2018' }));
    const res = await request(app).post(`/api/pre-audit/${AUDIT_ID}/generate`);
    expect(res.status).toBe(200);
    const recs: string[] = res.body.data.recommendations;
    expect(recs.some((r) => r.toLowerCase().includes('procedures') || r.toLowerCase().includes('management system'))).toBe(true);
  });

  it('SURVEILLANCE type includes process owner notification recommendation', async () => {
    mockPrisma.audAudit.findFirst.mockResolvedValue(makeAudit({ type: 'SURVEILLANCE' }));
    const res = await request(app).post(`/api/pre-audit/${AUDIT_ID}/generate`);
    expect(res.status).toBe(200);
    const recs: string[] = res.body.data.recommendations;
    expect(recs.some((r) => r.toLowerCase().includes('process owner'))).toBe(true);
  });

  it('SURVEILLANCE type returns 8 hours estimated duration', async () => {
    mockPrisma.audAudit.findFirst.mockResolvedValue(makeAudit({ type: 'SURVEILLANCE' }));
    const res = await request(app).post(`/api/pre-audit/${AUDIT_ID}/generate`);
    expect(res.body.data.estimatedDurationHours).toBe(8);
  });

  it('checklist always includes document pack compilation step', async () => {
    mockPrisma.audAudit.findFirst.mockResolvedValue(makeAudit());
    const res = await request(app).post(`/api/pre-audit/${AUDIT_ID}/generate`);
    const checklist: string[] = res.body.data.checklist;
    expect(checklist.some((c) => c.toLowerCase().includes('document'))).toBe(true);
  });

  it('recommendations always include best-practice entries for any audit type', async () => {
    mockPrisma.audAudit.findFirst.mockResolvedValue(makeAudit({ type: 'INTERNAL', standard: 'ISO 9001:2015' }));
    const res = await request(app).post(`/api/pre-audit/${AUDIT_ID}/generate`);
    const recs: string[] = res.body.data.recommendations;
    expect(recs.some((r) => r.toLowerCase().includes('availability') || r.toLowerCase().includes('personnel'))).toBe(true);
    expect(recs.some((r) => r.toLowerCase().includes('document evidence') || r.toLowerCase().includes('evidence pack'))).toBe(true);
  });

  it('scope exactly 10 chars does not add scope recommendation', async () => {
    mockPrisma.audAudit.findFirst.mockResolvedValue(makeAudit({ scope: '1234567890' }));
    const res = await request(app).post(`/api/pre-audit/${AUDIT_ID}/generate`);
    expect(res.status).toBe(200);
    const recs: string[] = res.body.data.recommendations;
    expect(recs.some((r) => r.includes('Review all processes within scope'))).toBe(false);
  });

  it('generatedAt field is an ISO string', async () => {
    mockPrisma.audAudit.findFirst.mockResolvedValue(makeAudit());
    const res = await request(app).post(`/api/pre-audit/${AUDIT_ID}/generate`);
    expect(() => new Date(res.body.data.generatedAt)).not.toThrow();
    expect(new Date(res.body.data.generatedAt).toISOString()).toBe(res.body.data.generatedAt);
  });
});

describe('POST /api/pre-audit/:id/generate — further coverage', () => {
  it('recommendations array is non-empty for any supported standard', async () => {
    mockPrisma.audAudit.findFirst.mockResolvedValue(makeAudit({ standard: 'ISO 9001:2015' }));
    const res = await request(app).post(`/api/pre-audit/${AUDIT_ID}/generate`);
    expect(res.status).toBe(200);
    expect(res.body.data.recommendations.length).toBeGreaterThan(0);
  });

  it('checklist is an array for every audit type', async () => {
    for (const type of ['INTERNAL', 'EXTERNAL', 'CERTIFICATION', 'SUPPLIER']) {
      mockPrisma.audAudit.findFirst.mockResolvedValue(makeAudit({ type }));
      const res = await request(app).post(`/api/pre-audit/${AUDIT_ID}/generate`);
      expect(Array.isArray(res.body.data.checklist)).toBe(true);
    }
  });

  it('response contains auditRef matching referenceNumber from DB record', async () => {
    mockPrisma.audAudit.findFirst.mockResolvedValue(makeAudit({ referenceNumber: 'AUD-2026-0042' }));
    const res = await request(app).post(`/api/pre-audit/${AUDIT_ID}/generate`);
    expect(res.status).toBe(200);
    expect(res.body.data.auditRef).toBe('AUD-2026-0042');
  });

  it('DB error returns 500 with error.code INTERNAL_ERROR', async () => {
    mockPrisma.audAudit.findFirst.mockRejectedValue(new Error('timeout'));
    const res = await request(app).post(`/api/pre-audit/${AUDIT_ID}/generate`);
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('null findFirst returns 404 with NOT_FOUND code', async () => {
    mockPrisma.audAudit.findFirst.mockResolvedValue(null);
    const res = await request(app).post(`/api/pre-audit/${AUDIT_ID}/generate`);
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('estimatedDurationHours is a positive integer for all audit types', async () => {
    for (const type of ['INTERNAL', 'EXTERNAL', 'CERTIFICATION', 'SUPPLIER', 'SURVEILLANCE']) {
      mockPrisma.audAudit.findFirst.mockResolvedValue(makeAudit({ type }));
      const res = await request(app).post(`/api/pre-audit/${AUDIT_ID}/generate`);
      expect(res.body.data.estimatedDurationHours).toBeGreaterThan(0);
      expect(Number.isInteger(res.body.data.estimatedDurationHours)).toBe(true);
    }
  });
});
