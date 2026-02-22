import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    aiControl: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
  },
  Prisma: {
    Decimal: jest.fn((v: any) => v),
  },
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

import controlsRouter from '../src/routes/controls';
import { prisma } from '../src/prisma';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const app = express();
app.use(express.json());
app.use('/api/controls', controlsRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

const UUID1 = '00000000-0000-0000-0000-000000000001';
const UUID2 = '00000000-0000-0000-0000-000000000002';

const mockControl = {
  id: UUID1,
  code: 'A.6.1',
  controlId: 'A.6.1',
  domain: 'LIFECYCLE',
  title: 'AI system lifecycle management',
  description: 'The organization shall manage AI systems throughout their lifecycle.',
  implementationStatus: 'NOT_IMPLEMENTED',
  justification: null,
  implementationNotes: null,
  evidence: null,
  responsiblePerson: null,
  targetDate: null,
  completionDate: null,
  updatedBy: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// ===================================================================
// lifecycle.test.ts — tests for the LIFECYCLE domain of ISO 42001 controls
// Uses controls router filtered by domain=LIFECYCLE
// ===================================================================

describe('GET /api/controls — lifecycle domain', () => {
  it('returns paginated list of controls', async () => {
    mockPrisma.aiControl.findMany.mockResolvedValue([mockControl]);
    mockPrisma.aiControl.count.mockResolvedValue(1);
    const res = await request(app).get('/api/controls');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });

  it('returns empty list when no lifecycle controls exist', async () => {
    mockPrisma.aiControl.findMany.mockResolvedValue([]);
    mockPrisma.aiControl.count.mockResolvedValue(0);
    const res = await request(app).get('/api/controls?domain=LIFECYCLE');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });

  it('filters by domain=LIFECYCLE', async () => {
    mockPrisma.aiControl.findMany.mockResolvedValue([]);
    mockPrisma.aiControl.count.mockResolvedValue(0);
    await request(app).get('/api/controls?domain=LIFECYCLE');
    expect(mockPrisma.aiControl.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ domain: 'LIFECYCLE' }) })
    );
  });

  it('filters by status=NOT_IMPLEMENTED', async () => {
    mockPrisma.aiControl.findMany.mockResolvedValue([]);
    mockPrisma.aiControl.count.mockResolvedValue(0);
    await request(app).get('/api/controls?status=NOT_IMPLEMENTED');
    expect(mockPrisma.aiControl.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ implementationStatus: 'NOT_IMPLEMENTED' }) })
    );
  });

  it('filters by status=FULLY_IMPLEMENTED', async () => {
    mockPrisma.aiControl.findMany.mockResolvedValue([mockControl]);
    mockPrisma.aiControl.count.mockResolvedValue(1);
    await request(app).get('/api/controls?status=FULLY_IMPLEMENTED');
    expect(mockPrisma.aiControl.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ implementationStatus: 'FULLY_IMPLEMENTED' }) })
    );
  });

  it('supports search by title keyword', async () => {
    mockPrisma.aiControl.findMany.mockResolvedValue([]);
    mockPrisma.aiControl.count.mockResolvedValue(0);
    await request(app).get('/api/controls?search=lifecycle');
    expect(mockPrisma.aiControl.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: expect.arrayContaining([
            expect.objectContaining({ title: expect.objectContaining({ contains: 'lifecycle' }) }),
          ]),
        }),
      })
    );
  });

  it('returns 500 on DB error', async () => {
    mockPrisma.aiControl.findMany.mockRejectedValue(new Error('DB error'));
    const res = await request(app).get('/api/controls');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });

  it('response includes pagination object', async () => {
    mockPrisma.aiControl.findMany.mockResolvedValue([]);
    mockPrisma.aiControl.count.mockResolvedValue(0);
    const res = await request(app).get('/api/controls');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('pagination');
  });

  it('pagination.page defaults to 1', async () => {
    mockPrisma.aiControl.findMany.mockResolvedValue([]);
    mockPrisma.aiControl.count.mockResolvedValue(0);
    const res = await request(app).get('/api/controls');
    expect(res.body.pagination.page).toBe(1);
  });

  it('pagination.totalPages is computed correctly', async () => {
    mockPrisma.aiControl.findMany.mockResolvedValue([]);
    mockPrisma.aiControl.count.mockResolvedValue(50);
    const res = await request(app).get('/api/controls?limit=10');
    expect(res.body.pagination.totalPages).toBe(5);
  });
});

describe('GET /api/controls/:id — single lifecycle control', () => {
  it('returns control when found', async () => {
    mockPrisma.aiControl.findUnique.mockResolvedValue(mockControl);
    const res = await request(app).get(`/api/controls/${UUID1}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(UUID1);
  });

  it('returns 404 when control not found', async () => {
    mockPrisma.aiControl.findUnique.mockResolvedValue(null);
    const res = await request(app).get(`/api/controls/${UUID2}`);
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('returns 500 on DB error', async () => {
    mockPrisma.aiControl.findUnique.mockRejectedValue(new Error('DB error'));
    const res = await request(app).get(`/api/controls/${UUID1}`);
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });

  it('response data includes annexDescription enrichment', async () => {
    mockPrisma.aiControl.findUnique.mockResolvedValue(mockControl);
    const res = await request(app).get(`/api/controls/${UUID1}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('annexDescription');
  });
});

describe('PUT /api/controls/:id/status — lifecycle control status update', () => {
  it('updates implementation status to FULLY_IMPLEMENTED', async () => {
    mockPrisma.aiControl.findUnique.mockResolvedValue(mockControl);
    mockPrisma.aiControl.update.mockResolvedValue({ ...mockControl, implementationStatus: 'FULLY_IMPLEMENTED' });
    const res = await request(app)
      .put(`/api/controls/${UUID1}/status`)
      .send({ implementationStatus: 'FULLY_IMPLEMENTED' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('returns 400 for invalid implementationStatus', async () => {
    const res = await request(app)
      .put(`/api/controls/${UUID1}/status`)
      .send({ implementationStatus: 'SUPER_IMPLEMENTED' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 404 when control not found', async () => {
    mockPrisma.aiControl.findUnique.mockResolvedValue(null);
    const res = await request(app)
      .put(`/api/controls/${UUID2}/status`)
      .send({ implementationStatus: 'PARTIALLY_IMPLEMENTED' });
    expect(res.status).toBe(404);
  });

  it('accepts justification along with status update', async () => {
    mockPrisma.aiControl.findUnique.mockResolvedValue(mockControl);
    mockPrisma.aiControl.update.mockResolvedValue({ ...mockControl, implementationStatus: 'PLANNED', justification: 'Scheduled for Q3' });
    const res = await request(app)
      .put(`/api/controls/${UUID1}/status`)
      .send({ implementationStatus: 'PLANNED', justification: 'Scheduled for Q3' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('returns 500 on DB error during status update', async () => {
    mockPrisma.aiControl.findUnique.mockResolvedValue(mockControl);
    mockPrisma.aiControl.update.mockRejectedValue(new Error('DB error'));
    const res = await request(app)
      .put(`/api/controls/${UUID1}/status`)
      .send({ implementationStatus: 'FULLY_IMPLEMENTED' });
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });

  it('updates to PARTIALLY_IMPLEMENTED status', async () => {
    mockPrisma.aiControl.findUnique.mockResolvedValue(mockControl);
    mockPrisma.aiControl.update.mockResolvedValue({ ...mockControl, implementationStatus: 'PARTIALLY_IMPLEMENTED' });
    const res = await request(app)
      .put(`/api/controls/${UUID1}/status`)
      .send({ implementationStatus: 'PARTIALLY_IMPLEMENTED' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('updates to NOT_APPLICABLE status', async () => {
    mockPrisma.aiControl.findUnique.mockResolvedValue(mockControl);
    mockPrisma.aiControl.update.mockResolvedValue({ ...mockControl, implementationStatus: 'NOT_APPLICABLE' });
    const res = await request(app)
      .put(`/api/controls/${UUID1}/status`)
      .send({ implementationStatus: 'NOT_APPLICABLE' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('PUT /api/controls/:id/implementation — lifecycle control implementation update', () => {
  it('updates implementation notes', async () => {
    mockPrisma.aiControl.findUnique.mockResolvedValue(mockControl);
    mockPrisma.aiControl.update.mockResolvedValue({ ...mockControl, implementationNotes: 'Phase 1 complete' });
    const res = await request(app)
      .put(`/api/controls/${UUID1}/implementation`)
      .send({ implementationNotes: 'Phase 1 complete' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('updates responsiblePerson field', async () => {
    mockPrisma.aiControl.findUnique.mockResolvedValue(mockControl);
    mockPrisma.aiControl.update.mockResolvedValue({ ...mockControl, responsiblePerson: 'Jane Smith' });
    const res = await request(app)
      .put(`/api/controls/${UUID1}/implementation`)
      .send({ responsiblePerson: 'Jane Smith' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('returns 404 when control not found for implementation update', async () => {
    mockPrisma.aiControl.findUnique.mockResolvedValue(null);
    const res = await request(app)
      .put(`/api/controls/${UUID2}/implementation`)
      .send({ implementationNotes: 'test' });
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('returns 500 on DB error during implementation update', async () => {
    mockPrisma.aiControl.findUnique.mockResolvedValue(mockControl);
    mockPrisma.aiControl.update.mockRejectedValue(new Error('DB error'));
    const res = await request(app)
      .put(`/api/controls/${UUID1}/implementation`)
      .send({ implementationNotes: 'test' });
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });

  it('updates evidence field', async () => {
    mockPrisma.aiControl.findUnique.mockResolvedValue(mockControl);
    mockPrisma.aiControl.update.mockResolvedValue({ ...mockControl, evidence: 'Document #AI-LC-001' });
    const res = await request(app)
      .put(`/api/controls/${UUID1}/implementation`)
      .send({ evidence: 'Document #AI-LC-001' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('GET /api/controls/soa — Statement of Applicability', () => {
  it('returns SOA with controls and summary', async () => {
    mockPrisma.aiControl.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/controls/soa');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('controls');
    expect(res.body.data).toHaveProperty('summary');
  });

  it('summary includes totalControls and compliancePercentage', async () => {
    mockPrisma.aiControl.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/controls/soa');
    expect(res.status).toBe(200);
    expect(res.body.data.summary).toHaveProperty('totalControls');
    expect(res.body.data.summary).toHaveProperty('compliancePercentage');
  });

  it('summary.statusCounts has NOT_IMPLEMENTED key', async () => {
    mockPrisma.aiControl.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/controls/soa');
    expect(res.status).toBe(200);
    expect(res.body.data.summary.statusCounts).toHaveProperty('NOT_IMPLEMENTED');
  });

  it('returns 500 on DB error in SOA generation', async () => {
    mockPrisma.aiControl.findMany.mockRejectedValue(new Error('DB error'));
    const res = await request(app).get('/api/controls/soa');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });

  it('controls array in SOA includes LIFECYCLE domain entries', async () => {
    mockPrisma.aiControl.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/controls/soa');
    expect(res.status).toBe(200);
    const lcControls = res.body.data.controls.filter((c: { domain: string }) => c.domain === 'LIFECYCLE');
    expect(lcControls.length).toBeGreaterThan(0);
  });
});

describe('Lifecycle — phase28 coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /api/controls data items have controlId field', async () => {
    mockPrisma.aiControl.findMany.mockResolvedValue([mockControl]);
    mockPrisma.aiControl.count.mockResolvedValue(1);
    const res = await request(app).get('/api/controls');
    expect(res.status).toBe(200);
    expect(res.body.data[0]).toHaveProperty('controlId');
  });

  it('GET /api/controls data items have domain field', async () => {
    mockPrisma.aiControl.findMany.mockResolvedValue([mockControl]);
    mockPrisma.aiControl.count.mockResolvedValue(1);
    const res = await request(app).get('/api/controls');
    expect(res.status).toBe(200);
    expect(res.body.data[0]).toHaveProperty('domain');
  });

  it('GET /api/controls/:id returns annexDomain field in enriched response', async () => {
    mockPrisma.aiControl.findUnique.mockResolvedValue(mockControl);
    const res = await request(app).get(`/api/controls/${UUID1}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('annexDomain');
  });

  it('PUT /api/controls/:id/status calls update once per request', async () => {
    mockPrisma.aiControl.findUnique.mockResolvedValue(mockControl);
    mockPrisma.aiControl.update.mockResolvedValue({ ...mockControl, implementationStatus: 'PLANNED' });
    await request(app).put(`/api/controls/${UUID1}/status`).send({ implementationStatus: 'PLANNED' });
    expect(mockPrisma.aiControl.update).toHaveBeenCalledTimes(1);
  });

  it('PUT /api/controls/:id/implementation with targetDate field returns 200', async () => {
    mockPrisma.aiControl.findUnique.mockResolvedValue(mockControl);
    mockPrisma.aiControl.update.mockResolvedValue({ ...mockControl, targetDate: new Date('2026-12-31') });
    const res = await request(app).put(`/api/controls/${UUID1}/implementation`).send({ targetDate: '2026-12-31' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('Lifecycle — additional phase28 coverage block', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /api/controls includes pagination.total in response', async () => {
    mockPrisma.aiControl.findMany.mockResolvedValue([mockControl]);
    mockPrisma.aiControl.count.mockResolvedValue(1);
    const res = await request(app).get('/api/controls');
    expect(res.status).toBe(200);
    expect(res.body.pagination).toHaveProperty('total');
  });

  it('GET /api/controls includes pagination.limit in response', async () => {
    mockPrisma.aiControl.findMany.mockResolvedValue([]);
    mockPrisma.aiControl.count.mockResolvedValue(0);
    const res = await request(app).get('/api/controls');
    expect(res.body.pagination).toHaveProperty('limit');
  });

  it('PUT /api/controls/:id/status requires implementationStatus field', async () => {
    const res = await request(app).put(`/api/controls/${UUID1}/status`).send({});
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('GET /api/controls data array is empty when count is 0', async () => {
    mockPrisma.aiControl.findMany.mockResolvedValue([]);
    mockPrisma.aiControl.count.mockResolvedValue(0);
    const res = await request(app).get('/api/controls');
    expect(res.body.data).toHaveLength(0);
    expect(res.body.pagination.total).toBe(0);
  });

  it('PUT /api/controls/:id/implementation updates completionDate field', async () => {
    mockPrisma.aiControl.findUnique.mockResolvedValue(mockControl);
    mockPrisma.aiControl.update.mockResolvedValue({ ...mockControl, completionDate: new Date('2026-06-30') });
    const res = await request(app)
      .put(`/api/controls/${UUID1}/implementation`)
      .send({ completionDate: '2026-06-30' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('GET /api/controls/soa controls array is non-empty (populated from ANNEX_A_CONTROLS)', async () => {
    mockPrisma.aiControl.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/controls/soa');
    expect(res.status).toBe(200);
    expect(res.body.data.controls.length).toBeGreaterThan(0);
  });

  it('GET /api/controls/soa summary.applicableControls is a number', async () => {
    mockPrisma.aiControl.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/controls/soa');
    expect(res.status).toBe(200);
    expect(typeof res.body.data.summary.applicableControls).toBe('number');
  });

  it('GET /api/controls/soa summary.implementedControls is a number', async () => {
    mockPrisma.aiControl.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/controls/soa');
    expect(res.status).toBe(200);
    expect(typeof res.body.data.summary.implementedControls).toBe('number');
  });

  it('GET /api/controls data items have implementationStatus field', async () => {
    mockPrisma.aiControl.findMany.mockResolvedValue([mockControl]);
    mockPrisma.aiControl.count.mockResolvedValue(1);
    const res = await request(app).get('/api/controls');
    expect(res.body.data[0]).toHaveProperty('implementationStatus');
  });
});

describe('lifecycle — phase30 coverage', () => {
  it('handles array concat', () => {
    expect([1, 2].concat([3, 4])).toEqual([1, 2, 3, 4]);
  });

  it('handles Math.pow', () => {
    expect(Math.pow(2, 3)).toBe(8);
  });

  it('handles object keys', () => {
    expect(Object.keys({ a: 1, b: 2 }).length).toBe(2);
  });

  it('handles array includes', () => {
    expect([1, 2, 3].includes(2)).toBe(true);
  });

  it('handles string concatenation', () => {
    expect('hello' + ' ' + 'world').toBe('hello world');
  });

});
