import express from 'express';
import request from 'supertest';

// Mock dependencies
jest.mock('../src/prisma', () => ({
  prisma: {
    automationRule: {
      findMany: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
    },
    automationExecution: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  },
}));

jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((req: any, _res: any, next: any) => {
    req.user = { id: '20000000-0000-4000-a000-000000000123', email: 'test@test.com', role: 'ADMIN' };
    next();
  }),
}));

jest.mock('@ims/service-auth', () => ({
  checkOwnership: () => (_req: any, _res: any, next: any) => next(),
  scopeToUser: (_req: any, _res: any, next: any) => next(),
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
  metricsMiddleware: () => (req: any, res: any, next: any) => next(),
  metricsHandler: (req: any, res: any) => res.json({}),
  correlationIdMiddleware: () => (req: any, res: any, next: any) => next(),
  createHealthCheck: () => (req: any, res: any) => res.json({ status: 'healthy' }),
}));

jest.mock('@ims/shared', () => ({
  validateIdParam: () => (_req: any, _res: any, next: any) => next(),
}));

import { prisma } from '../src/prisma';
import adminRouter from '../src/routes/admin';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

// ── Test data ────────────────────────────────────────────────────────

const RULE_ID = '00000000-0000-0000-0000-000000000001';
const EXECUTION_ID = '00000000-0000-0000-0000-000000000002';

const mockRule = {
  id: RULE_ID,
  name: 'Auto Escalation Rule',
  isActive: true,
  priority: 10,
  triggerType: 'EVENT',
  deletedAt: null,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-15'),
  _count: { executions: 5 },
};

const mockExecution = {
  id: EXECUTION_ID,
  ruleId: RULE_ID,
  triggerType: 'EVENT',
  status: 'COMPLETED',
  startedAt: new Date('2026-02-01T10:00:00Z'),
  completedAt: new Date('2026-02-01T10:00:01Z'),
  result: { message: 'Rule executed successfully', mock: true },
  createdAt: new Date('2026-02-01'),
};

describe('Admin Automation Rules API Routes', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/admin/automation-rules', adminRouter);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── GET /api/admin/automation-rules ──────────────────────────────────
  describe('GET /api/admin/automation-rules', () => {
    it('should return 200 with list of all automation rules', async () => {
      (mockPrisma.automationRule.findMany as jest.Mock).mockResolvedValueOnce([mockRule]);

      const response = await request(app).get('/api/admin/automation-rules');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].name).toBe('Auto Escalation Rule');
    });

    it('should return 200 with empty array when no rules', async () => {
      (mockPrisma.automationRule.findMany as jest.Mock).mockResolvedValueOnce([]);

      const response = await request(app).get('/api/admin/automation-rules');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(0);
    });

    it('should fetch rules with no org scope filter (admin view)', async () => {
      (mockPrisma.automationRule.findMany as jest.Mock).mockResolvedValueOnce([mockRule]);

      await request(app).get('/api/admin/automation-rules');

      expect(mockPrisma.automationRule.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { deletedAt: null },
          include: { _count: { select: { executions: true } } },
        })
      );
    });

    it('should return rules ordered by priority desc then name asc', async () => {
      (mockPrisma.automationRule.findMany as jest.Mock).mockResolvedValueOnce([mockRule]);

      await request(app).get('/api/admin/automation-rules');

      expect(mockPrisma.automationRule.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: [{ priority: 'desc' }, { name: 'asc' }],
        })
      );
    });

    it('should include execution count in returned data', async () => {
      (mockPrisma.automationRule.findMany as jest.Mock).mockResolvedValueOnce([mockRule]);

      const response = await request(app).get('/api/admin/automation-rules');

      expect(response.body.data[0]._count.executions).toBe(5);
    });
  });

  // ── POST /api/admin/automation-rules/:id/enable ───────────────────────
  describe('POST /api/admin/automation-rules/:id/enable', () => {
    it('should enable the rule and return 200', async () => {
      const enabledRule = { ...mockRule, isActive: true };
      (mockPrisma.automationRule.update as jest.Mock).mockResolvedValueOnce(enabledRule);

      const response = await request(app)
        .post(`/api/admin/automation-rules/${RULE_ID}/enable`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.isActive).toBe(true);
    });

    it('should call update with isActive: true for enable action', async () => {
      (mockPrisma.automationRule.update as jest.Mock).mockResolvedValueOnce({
        ...mockRule,
        isActive: true,
      });

      await request(app).post(`/api/admin/automation-rules/${RULE_ID}/enable`);

      expect(mockPrisma.automationRule.update).toHaveBeenCalledWith({
        where: { id: RULE_ID },
        data: { isActive: true },
      });
    });
  });

  // ── POST /api/admin/automation-rules/:id/disable ──────────────────────
  describe('POST /api/admin/automation-rules/:id/disable', () => {
    it('should disable the rule and return 200', async () => {
      const disabledRule = { ...mockRule, isActive: false };
      (mockPrisma.automationRule.update as jest.Mock).mockResolvedValueOnce(disabledRule);

      const response = await request(app)
        .post(`/api/admin/automation-rules/${RULE_ID}/disable`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.isActive).toBe(false);
    });

    it('should call update with isActive: false for disable action', async () => {
      (mockPrisma.automationRule.update as jest.Mock).mockResolvedValueOnce({
        ...mockRule,
        isActive: false,
      });

      await request(app).post(`/api/admin/automation-rules/${RULE_ID}/disable`);

      expect(mockPrisma.automationRule.update).toHaveBeenCalledWith({
        where: { id: RULE_ID },
        data: { isActive: false },
      });
    });
  });

  // ── POST /api/admin/automation-rules/:id/execute ──────────────────────
  describe('POST /api/admin/automation-rules/:id/execute', () => {
    it('should execute the rule and return 200 with execution record', async () => {
      (mockPrisma.automationRule.findUnique as jest.Mock).mockResolvedValueOnce(mockRule);
      (mockPrisma.automationExecution.create as jest.Mock).mockResolvedValueOnce(mockExecution);

      const response = await request(app)
        .post(`/api/admin/automation-rules/${RULE_ID}/execute`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('COMPLETED');
      expect(response.body.data.ruleId).toBe(RULE_ID);
    });

    it('should return 404 when rule not found for execute', async () => {
      (mockPrisma.automationRule.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .post(`/api/admin/automation-rules/${RULE_ID}/execute`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should create execution record with COMPLETED status', async () => {
      (mockPrisma.automationRule.findUnique as jest.Mock).mockResolvedValueOnce(mockRule);
      (mockPrisma.automationExecution.create as jest.Mock).mockResolvedValueOnce(mockExecution);

      await request(app).post(`/api/admin/automation-rules/${RULE_ID}/execute`);

      expect(mockPrisma.automationExecution.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            ruleId: RULE_ID,
            status: 'COMPLETED',
            triggerType: 'EVENT',
          }),
        })
      );
    });
  });

  // ── POST /api/admin/automation-rules/:id/test ─────────────────────────
  describe('POST /api/admin/automation-rules/:id/test', () => {
    it('should test the rule and return 200 with execution record', async () => {
      (mockPrisma.automationRule.findUnique as jest.Mock).mockResolvedValueOnce(mockRule);
      (mockPrisma.automationExecution.create as jest.Mock).mockResolvedValueOnce({
        ...mockExecution,
        result: { message: 'Rule testd successfully', mock: true },
      });

      const response = await request(app)
        .post(`/api/admin/automation-rules/${RULE_ID}/test`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 404 when rule not found for test action', async () => {
      (mockPrisma.automationRule.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .post(`/api/admin/automation-rules/${RULE_ID}/test`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  // ── POST /api/admin/automation-rules/:id/:unknown-action ──────────────
  describe('POST /api/admin/automation-rules/:id/:action — unknown action', () => {
    it('should return 400 for unknown action', async () => {
      const response = await request(app)
        .post(`/api/admin/automation-rules/${RULE_ID}/launch`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_ACTION');
    });
  });

  // ── GET /api/admin/automation-rules/:id/log ───────────────────────────
  describe('GET /api/admin/automation-rules/:id/log', () => {
    it('should return 200 with execution log for a rule', async () => {
      (mockPrisma.automationExecution.findMany as jest.Mock).mockResolvedValueOnce([mockExecution]);

      const response = await request(app)
        .get(`/api/admin/automation-rules/${RULE_ID}/log`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].ruleId).toBe(RULE_ID);
    });

    it('should return 200 with empty array when no executions logged', async () => {
      (mockPrisma.automationExecution.findMany as jest.Mock).mockResolvedValueOnce([]);

      const response = await request(app)
        .get(`/api/admin/automation-rules/${RULE_ID}/log`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(0);
    });

    it('should query executions by ruleId and order by startedAt desc', async () => {
      (mockPrisma.automationExecution.findMany as jest.Mock).mockResolvedValueOnce([mockExecution]);

      await request(app).get(`/api/admin/automation-rules/${RULE_ID}/log`);

      expect(mockPrisma.automationExecution.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { ruleId: RULE_ID },
          orderBy: { startedAt: 'desc' },
        })
      );
    });

    it('should respect limit query parameter', async () => {
      (mockPrisma.automationExecution.findMany as jest.Mock).mockResolvedValueOnce([mockExecution]);

      await request(app).get(`/api/admin/automation-rules/${RULE_ID}/log?limit=5`);

      expect(mockPrisma.automationExecution.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 5 })
      );
    });

    it('should default to limit 10 when not specified', async () => {
      (mockPrisma.automationExecution.findMany as jest.Mock).mockResolvedValueOnce([]);

      await request(app).get(`/api/admin/automation-rules/${RULE_ID}/log`);

      expect(mockPrisma.automationExecution.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 10 })
      );
    });
  });
});

// ─── 500 error paths ────────────────────────────────────────────────────────

describe('500 error handling', () => {
  let app500: express.Express;

  beforeAll(() => {
    app500 = express();
    app500.use(express.json());
    app500.use('/api/admin/automation-rules', adminRouter);
  });

  it('GET / returns 500 on DB error', async () => {
    mockPrisma.automationRule.findMany.mockRejectedValue(new Error('DB down'));
    const res = await request(app500).get('/api/admin/automation-rules');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET /:id/log returns 500 on DB error', async () => {
    mockPrisma.automationRule.findUnique.mockResolvedValue({ id: 'rule-1', isActive: true });
    mockPrisma.automationExecution.findMany.mockRejectedValue(new Error('DB down'));
    const res = await request(app500).get('/api/admin/automation-rules/rule-1/log');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('POST /:id/enable returns 500 when update fails', async () => {
    mockPrisma.automationRule.findUnique.mockResolvedValue({ id: 'rule-1', isActive: false });
    mockPrisma.automationRule.update.mockRejectedValue(new Error('DB down'));
    const res = await request(app500).post('/api/admin/automation-rules/rule-1/enable');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

// ── Additional coverage ──────────────────────────────────────────────────────

describe('Admin Automation Rules — additional coverage', () => {
  let appExtra: express.Express;

  beforeAll(() => {
    appExtra = express();
    appExtra.use(express.json());
    appExtra.use('/api/admin/automation-rules', adminRouter);
  });

  beforeEach(() => jest.clearAllMocks());

  it('POST /:id/disable returns 500 when update throws', async () => {
    (mockPrisma.automationRule.update as jest.Mock).mockRejectedValueOnce(new Error('DB down'));
    const res = await request(appExtra).post(`/api/admin/automation-rules/${RULE_ID}/disable`);
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('POST /:id/execute returns 500 when execution create throws', async () => {
    (mockPrisma.automationRule.findUnique as jest.Mock).mockResolvedValueOnce(mockRule);
    (mockPrisma.automationExecution.create as jest.Mock).mockRejectedValueOnce(new Error('write fail'));
    const res = await request(appExtra).post(`/api/admin/automation-rules/${RULE_ID}/execute`);
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('POST /:id/test returns 500 when execution create throws', async () => {
    (mockPrisma.automationRule.findUnique as jest.Mock).mockResolvedValueOnce(mockRule);
    (mockPrisma.automationExecution.create as jest.Mock).mockRejectedValueOnce(new Error('write fail'));
    const res = await request(appExtra).post(`/api/admin/automation-rules/${RULE_ID}/test`);
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET /:id/log response has success:true and data array', async () => {
    (mockPrisma.automationExecution.findMany as jest.Mock).mockResolvedValueOnce([mockExecution]);
    const res = await request(appExtra).get(`/api/admin/automation-rules/${RULE_ID}/log`);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET / response data items include isActive and priority fields', async () => {
    (mockPrisma.automationRule.findMany as jest.Mock).mockResolvedValueOnce([mockRule]);
    const res = await request(appExtra).get('/api/admin/automation-rules');
    expect(res.status).toBe(200);
    expect(res.body.data[0]).toHaveProperty('isActive');
    expect(res.body.data[0]).toHaveProperty('priority');
  });

  it('POST /:id/enable returns success:true on success', async () => {
    (mockPrisma.automationRule.update as jest.Mock).mockResolvedValueOnce({ ...mockRule, isActive: true });
    const res = await request(appExtra).post(`/api/admin/automation-rules/${RULE_ID}/enable`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('POST /:id/disable returns success:true with isActive false', async () => {
    (mockPrisma.automationRule.update as jest.Mock).mockResolvedValueOnce({ ...mockRule, isActive: false });
    const res = await request(appExtra).post(`/api/admin/automation-rules/${RULE_ID}/disable`);
    expect(res.status).toBe(200);
    expect(res.body.data.isActive).toBe(false);
  });
});

// ── Further coverage ──────────────────────────────────────────────────────────

describe('Admin Automation Rules — further coverage', () => {
  let appFurther: express.Express;

  beforeAll(() => {
    appFurther = express();
    appFurther.use(express.json());
    appFurther.use('/api/admin/automation-rules', adminRouter);
  });

  beforeEach(() => jest.clearAllMocks());

  it('GET / response includes triggerType field on each rule', async () => {
    (mockPrisma.automationRule.findMany as jest.Mock).mockResolvedValueOnce([mockRule]);
    const res = await request(appFurther).get('/api/admin/automation-rules');
    expect(res.body.data[0]).toHaveProperty('triggerType');
  });

  it('POST /:id/execute — stores triggerType from found rule in execution', async () => {
    const ruleWithTrigger = { ...mockRule, triggerType: 'SCHEDULE' };
    (mockPrisma.automationRule.findUnique as jest.Mock).mockResolvedValueOnce(ruleWithTrigger);
    (mockPrisma.automationExecution.create as jest.Mock).mockResolvedValueOnce({
      ...mockExecution,
      triggerType: 'SCHEDULE',
    });

    await request(appFurther).post(`/api/admin/automation-rules/${RULE_ID}/execute`);

    expect(mockPrisma.automationExecution.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ triggerType: 'SCHEDULE' }),
      })
    );
  });

  it('POST /:id/test — result contains mock:true in execution result', async () => {
    (mockPrisma.automationRule.findUnique as jest.Mock).mockResolvedValueOnce(mockRule);
    (mockPrisma.automationExecution.create as jest.Mock).mockResolvedValueOnce({
      ...mockExecution,
      result: { message: 'Rule testd successfully', mock: true },
    });

    const res = await request(appFurther).post(`/api/admin/automation-rules/${RULE_ID}/test`);
    expect(res.status).toBe(200);
    expect(res.body.data.result.mock).toBe(true);
  });

  it('GET /:id/log respects limit=1 returning only one execution', async () => {
    (mockPrisma.automationExecution.findMany as jest.Mock).mockResolvedValueOnce([mockExecution]);

    await request(appFurther).get(`/api/admin/automation-rules/${RULE_ID}/log?limit=1`);

    expect(mockPrisma.automationExecution.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 1 })
    );
  });

  it('POST /:id/unknown-action returns error.code INVALID_ACTION', async () => {
    const res = await request(appFurther).post(`/api/admin/automation-rules/${RULE_ID}/restart`);
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_ACTION');
  });
});
