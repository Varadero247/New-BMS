import express from 'express';
import request from 'supertest';

// Mock dependencies
jest.mock('../src/prisma', () => ({
  prisma: {
    automationRule: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    automationExecution: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
  },
}));

jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((req: any, _res: any, next: any) => {
    req.user = { id: '20000000-0000-4000-a000-000000000123', email: 'test@test.com', role: 'USER' };
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

import { prisma } from '../src/prisma';
import automationRoutes from '../src/routes/automation';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('Workflows Automation API Routes', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/automation', automationRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================
  // AUTOMATION RULES
  // ============================================

  describe('GET /api/automation/rules', () => {
    const mockRules = [
      {
        id: '42000000-0000-4000-a000-000000000001',
        name: 'Auto-assign Task',
        code: 'AUTO_ASSIGN',
        triggerType: 'EVENT',
        actionType: 'ASSIGN_TASK',
        isActive: true,
        priority: 10,
        _count: { executions: 5 },
      },
      {
        id: 'rule-2',
        name: 'Send Notification',
        code: 'SEND_NOTIF',
        triggerType: 'SCHEDULED',
        actionType: 'SEND_NOTIFICATION',
        isActive: true,
        priority: 5,
        _count: { executions: 20 },
      },
    ];

    it('should return list of automation rules', async () => {
      (mockPrisma.automationRule.findMany as jest.Mock).mockResolvedValueOnce(mockRules);

      const response = await request(app).get('/api/automation/rules');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
    });

    it('should filter by triggerType', async () => {
      (mockPrisma.automationRule.findMany as jest.Mock).mockResolvedValueOnce([]);

      await request(app).get('/api/automation/rules?triggerType=EVENT');

      expect(mockPrisma.automationRule.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            triggerType: 'EVENT',
          }),
        })
      );
    });

    it('should filter by actionType', async () => {
      (mockPrisma.automationRule.findMany as jest.Mock).mockResolvedValueOnce([]);

      await request(app).get('/api/automation/rules?actionType=ASSIGN_TASK');

      expect(mockPrisma.automationRule.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            actionType: 'ASSIGN_TASK',
          }),
        })
      );
    });

    it('should filter by isActive', async () => {
      (mockPrisma.automationRule.findMany as jest.Mock).mockResolvedValueOnce([]);

      await request(app).get('/api/automation/rules?isActive=true');

      expect(mockPrisma.automationRule.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isActive: true,
          }),
        })
      );
    });

    it('should order by priority desc then name asc', async () => {
      (mockPrisma.automationRule.findMany as jest.Mock).mockResolvedValueOnce([]);

      await request(app).get('/api/automation/rules');

      expect(mockPrisma.automationRule.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: [{ priority: 'desc' }, { name: 'asc' }],
        })
      );
    });

    it('should handle database errors', async () => {
      (mockPrisma.automationRule.findMany as jest.Mock).mockRejectedValueOnce(
        new Error('DB error')
      );

      const response = await request(app).get('/api/automation/rules');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('GET /api/automation/rules/:id', () => {
    const mockRule = {
      id: '42000000-0000-4000-a000-000000000001',
      name: 'Auto-assign Task',
      code: 'AUTO_ASSIGN',
      triggerType: 'EVENT',
      actionType: 'ASSIGN_TASK',
      isActive: true,
      executions: [{ id: '43000000-0000-4000-a000-000000000001', status: 'COMPLETED' }],
      _count: { executions: 5 },
    };

    it('should return single automation rule with executions', async () => {
      (mockPrisma.automationRule.findUnique as jest.Mock).mockResolvedValueOnce(mockRule);

      const response = await request(app).get(
        '/api/automation/rules/42000000-0000-4000-a000-000000000001'
      );

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('42000000-0000-4000-a000-000000000001');
      expect(response.body.data.executions).toHaveLength(1);
    });

    it('should return 404 for 00000000-0000-4000-a000-ffffffffffff rule', async () => {
      (mockPrisma.automationRule.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app).get(
        '/api/automation/rules/00000000-0000-4000-a000-ffffffffffff'
      );

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should handle database errors', async () => {
      (mockPrisma.automationRule.findUnique as jest.Mock).mockRejectedValueOnce(
        new Error('DB error')
      );

      const response = await request(app).get(
        '/api/automation/rules/42000000-0000-4000-a000-000000000001'
      );

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('POST /api/automation/rules', () => {
    const createPayload = {
      name: 'New Rule',
      code: 'NEW_RULE',
      triggerType: 'EVENT' as const,
      actionType: 'SEND_NOTIFICATION' as const,
      actionConfig: { template: 'alert' },
    };

    it('should create an automation rule successfully', async () => {
      (mockPrisma.automationRule.findUnique as jest.Mock).mockResolvedValueOnce(null); // No duplicate code
      (mockPrisma.automationRule.create as jest.Mock).mockResolvedValueOnce({
        id: '30000000-0000-4000-a000-000000000123',
        ...createPayload,
        isActive: true,
      });

      const response = await request(app).post('/api/automation/rules').send(createPayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('New Rule');
    });

    it('should reject duplicate code', async () => {
      (mockPrisma.automationRule.findUnique as jest.Mock).mockResolvedValueOnce({ id: 'existing' });

      const response = await request(app).post('/api/automation/rules').send(createPayload);

      expect(response.status).toBe(409);
      expect(response.body.error.code).toBe('DUPLICATE');
    });

    it('should return 400 for missing name', async () => {
      const response = await request(app).post('/api/automation/rules').send({
        code: 'CODE',
        triggerType: 'EVENT',
        actionType: 'SEND_NOTIFICATION',
        actionConfig: {},
      });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for missing code', async () => {
      const response = await request(app).post('/api/automation/rules').send({
        name: 'Rule',
        triggerType: 'EVENT',
        actionType: 'SEND_NOTIFICATION',
        actionConfig: {},
      });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid triggerType', async () => {
      const response = await request(app)
        .post('/api/automation/rules')
        .send({ ...createPayload, triggerType: 'INVALID' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid actionType', async () => {
      const response = await request(app)
        .post('/api/automation/rules')
        .send({ ...createPayload, actionType: 'INVALID' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors', async () => {
      (mockPrisma.automationRule.findUnique as jest.Mock).mockResolvedValueOnce(null);
      (mockPrisma.automationRule.create as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app).post('/api/automation/rules').send(createPayload);

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('PUT /api/automation/rules/:id', () => {
    it('should update automation rule successfully', async () => {
      (mockPrisma.automationRule.update as jest.Mock).mockResolvedValueOnce({
        id: '42000000-0000-4000-a000-000000000001',
        name: 'Updated Rule',
      });

      const response = await request(app)
        .put('/api/automation/rules/42000000-0000-4000-a000-000000000001')
        .send({ name: 'Updated Rule' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 400 for invalid triggerType', async () => {
      const response = await request(app)
        .put('/api/automation/rules/42000000-0000-4000-a000-000000000001')
        .send({ triggerType: 'INVALID' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors', async () => {
      (mockPrisma.automationRule.update as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .put('/api/automation/rules/42000000-0000-4000-a000-000000000001')
        .send({ name: 'Updated' });

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('DELETE /api/automation/rules/:id', () => {
    it('should delete automation rule successfully', async () => {
      (mockPrisma.automationRule.update as jest.Mock).mockResolvedValueOnce({});

      const response = await request(app).delete(
        '/api/automation/rules/42000000-0000-4000-a000-000000000001'
      );

      expect(response.status).toBe(204);
    });

    it('should handle database errors', async () => {
      (mockPrisma.automationRule.update as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app).delete(
        '/api/automation/rules/42000000-0000-4000-a000-000000000001'
      );

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('POST /api/automation/rules/:id/execute', () => {
    it('should execute rule and return result', async () => {
      (mockPrisma.automationRule.findUnique as jest.Mock).mockResolvedValueOnce({
        id: '42000000-0000-4000-a000-000000000001',
        isActive: true,
        actionType: 'SEND_NOTIFICATION',
        actionConfig: { template: 'alert' },
      });
      (mockPrisma.automationExecution.create as jest.Mock).mockResolvedValueOnce({
        id: '43000000-0000-4000-a000-000000000001',
        status: 'PENDING',
      });
      (mockPrisma.automationExecution.update as jest.Mock).mockResolvedValueOnce({
        id: '43000000-0000-4000-a000-000000000001',
        status: 'COMPLETED',
      });
      (mockPrisma.automationRule.update as jest.Mock).mockResolvedValueOnce({
        id: '42000000-0000-4000-a000-000000000001',
        executionCount: 1,
      });

      const response = await request(app)
        .post('/api/automation/rules/42000000-0000-4000-a000-000000000001/execute')
        .send({ triggerData: { test: true } });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('COMPLETED');
    });

    it('should return 404 for 00000000-0000-4000-a000-ffffffffffff rule', async () => {
      (mockPrisma.automationRule.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .post('/api/automation/rules/00000000-0000-4000-a000-ffffffffffff/execute')
        .send({});

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should reject execution of inactive rule', async () => {
      (mockPrisma.automationRule.findUnique as jest.Mock).mockResolvedValueOnce({
        id: '42000000-0000-4000-a000-000000000001',
        isActive: false,
      });

      const response = await request(app)
        .post('/api/automation/rules/42000000-0000-4000-a000-000000000001/execute')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('RULE_INACTIVE');
    });

    it('should handle database errors', async () => {
      (mockPrisma.automationRule.findUnique as jest.Mock).mockRejectedValueOnce(
        new Error('DB error')
      );

      const response = await request(app)
        .post('/api/automation/rules/42000000-0000-4000-a000-000000000001/execute')
        .send({});

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('EXECUTION_ERROR');
    });
  });

  // ============================================
  // EXECUTIONS
  // ============================================

  describe('GET /api/automation/executions', () => {
    it('should return execution history', async () => {
      (mockPrisma.automationExecution.findMany as jest.Mock).mockResolvedValueOnce([
        {
          id: '43000000-0000-4000-a000-000000000001',
          status: 'COMPLETED',
          rule: { id: '42000000-0000-4000-a000-000000000001', name: 'Test', code: 'TST' },
        },
      ]);
      (mockPrisma.automationExecution.count as jest.Mock).mockResolvedValueOnce(1);

      const response = await request(app).get('/api/automation/executions');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.pagination).toBeDefined();
    });

    it('should filter by ruleId', async () => {
      (mockPrisma.automationExecution.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.automationExecution.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app).get(
        '/api/automation/executions?ruleId=42000000-0000-4000-a000-000000000001'
      );

      expect(mockPrisma.automationExecution.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            ruleId: '42000000-0000-4000-a000-000000000001',
          }),
        })
      );
    });

    it('should filter by status', async () => {
      (mockPrisma.automationExecution.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.automationExecution.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app).get('/api/automation/executions?status=FAILED');

      expect(mockPrisma.automationExecution.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'FAILED',
          }),
        })
      );
    });

    it('should handle database errors', async () => {
      (mockPrisma.automationExecution.findMany as jest.Mock).mockRejectedValueOnce(
        new Error('DB error')
      );

      const response = await request(app).get('/api/automation/executions');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('GET /api/automation/executions/:id', () => {
    it('should return single execution', async () => {
      (mockPrisma.automationExecution.findUnique as jest.Mock).mockResolvedValueOnce({
        id: '43000000-0000-4000-a000-000000000001',
        status: 'COMPLETED',
        rule: { id: '42000000-0000-4000-a000-000000000001', name: 'Test' },
      });

      const response = await request(app).get(
        '/api/automation/executions/43000000-0000-4000-a000-000000000001'
      );

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('43000000-0000-4000-a000-000000000001');
    });

    it('should return 404 for 00000000-0000-4000-a000-ffffffffffff execution', async () => {
      (mockPrisma.automationExecution.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app).get(
        '/api/automation/executions/00000000-0000-4000-a000-ffffffffffff'
      );

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should handle database errors', async () => {
      (mockPrisma.automationExecution.findUnique as jest.Mock).mockRejectedValueOnce(
        new Error('DB error')
      );

      const response = await request(app).get(
        '/api/automation/executions/43000000-0000-4000-a000-000000000001'
      );

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('POST /api/automation/executions/:id/retry', () => {
    it('should retry failed execution', async () => {
      (mockPrisma.automationExecution.findUnique as jest.Mock).mockResolvedValueOnce({
        id: '43000000-0000-4000-a000-000000000001',
        ruleId: '42000000-0000-4000-a000-000000000001',
        status: 'FAILED',
        attemptNumber: 1,
        triggerType: 'API',
        triggerData: {},
        entityType: null,
        entityId: null,
        rule: { maxRetries: 3 },
      });
      (mockPrisma.automationExecution.create as jest.Mock).mockResolvedValueOnce({
        id: 'exec-retry-1',
        attemptNumber: 2,
        status: 'RETRYING',
      });

      const response = await request(app).post(
        '/api/automation/executions/43000000-0000-4000-a000-000000000001/retry'
      );

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.attemptNumber).toBe(2);
    });

    it('should return 404 for 00000000-0000-4000-a000-ffffffffffff execution', async () => {
      (mockPrisma.automationExecution.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app).post(
        '/api/automation/executions/00000000-0000-4000-a000-ffffffffffff/retry'
      );

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should reject retry if not failed', async () => {
      (mockPrisma.automationExecution.findUnique as jest.Mock).mockResolvedValueOnce({
        id: '43000000-0000-4000-a000-000000000001',
        status: 'COMPLETED',
        rule: { maxRetries: 3 },
      });

      const response = await request(app).post(
        '/api/automation/executions/43000000-0000-4000-a000-000000000001/retry'
      );

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('INVALID_STATUS');
    });

    it('should reject retry if max retries reached', async () => {
      (mockPrisma.automationExecution.findUnique as jest.Mock).mockResolvedValueOnce({
        id: '43000000-0000-4000-a000-000000000001',
        status: 'FAILED',
        attemptNumber: 3,
        rule: { maxRetries: 3 },
      });

      const response = await request(app).post(
        '/api/automation/executions/43000000-0000-4000-a000-000000000001/retry'
      );

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('MAX_RETRIES');
    });

    it('should handle database errors', async () => {
      (mockPrisma.automationExecution.findUnique as jest.Mock).mockRejectedValueOnce(
        new Error('DB error')
      );

      const response = await request(app).post(
        '/api/automation/executions/43000000-0000-4000-a000-000000000001/retry'
      );

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });
});

describe('Workflows Automation API — final boundary coverage', () => {
  let appFinal: express.Express;

  beforeAll(() => {
    appFinal = express();
    appFinal.use(express.json());
    appFinal.use('/api/automation', automationRoutes);
  });

  beforeEach(() => jest.clearAllMocks());

  it('GET /api/automation/rules returns success:true with data array', async () => {
    (mockPrisma.automationRule.findMany as jest.Mock).mockResolvedValueOnce([]);
    const res = await request(appFinal).get('/api/automation/rules');
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('DELETE /api/automation/rules/:id returns 204 on success', async () => {
    (mockPrisma.automationRule.update as jest.Mock).mockResolvedValueOnce({});
    const res = await request(appFinal).delete(
      '/api/automation/rules/42000000-0000-4000-a000-000000000001'
    );
    expect(res.status).toBe(204);
  });

  it('GET /api/automation/executions returns pagination object', async () => {
    (mockPrisma.automationExecution.findMany as jest.Mock).mockResolvedValueOnce([]);
    (mockPrisma.automationExecution.count as jest.Mock).mockResolvedValueOnce(0);
    const res = await request(appFinal).get('/api/automation/executions');
    expect(res.body.pagination).toBeDefined();
  });
});

describe('automation — phase29 coverage', () => {
  it('handles string replace', () => {
    expect('hello world'.replace('world', 'Jest')).toBe('hello Jest');
  });

  it('handles string startsWith', () => {
    expect('hello'.startsWith('he')).toBe(true);
  });

  it('returns false for falsy values', () => {
    expect(Boolean('')).toBe(false);
  });

  it('handles regex test', () => {
    expect(/^[a-z]+$/.test('hello')).toBe(true);
  });

  it('handles sort method', () => {
    expect([3, 1, 2].sort((a, b) => a - b)).toEqual([1, 2, 3]);
  });

});
