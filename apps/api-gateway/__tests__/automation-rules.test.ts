import express from 'express';
import request from 'supertest';

const mockAuthenticate = jest.fn((req: any, _res: any, next: any) => {
  req.user = { id: 'user-1', email: 'admin@ims.local', role: 'ADMIN', orgId: 'org-1' };
  next();
});

jest.mock('@ims/auth', () => ({
  authenticate: (...args: any[]) => mockAuthenticate(...args),
  requireRole: jest.fn(() => (_req: any, _res: any, next: any) => next()),
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

const mockListRules = jest.fn().mockReturnValue([
  {
    id: '00000000-0000-0000-0000-000000000001',
    name: 'Critical NCR → Auto-CAPA',
    description: 'Auto-creates CAPA',
    enabled: false,
    isBuiltIn: true,
  },
]);
const mockEnableRule = jest.fn().mockReturnValue(true);
const mockDisableRule = jest.fn().mockReturnValue(true);
const mockGetRuleById = jest.fn().mockReturnValue({
  id: '00000000-0000-0000-0000-000000000001',
  name: 'Critical NCR → Auto-CAPA',
});
const mockGetExecutionLog = jest.fn().mockReturnValue([]);

jest.mock('@ims/automation-rules', () => ({
  listRules: (...args: any[]) => mockListRules(...args),
  enableRule: (...args: any[]) => mockEnableRule(...args),
  disableRule: (...args: any[]) => mockDisableRule(...args),
  getRuleById: (...args: any[]) => mockGetRuleById(...args),
  getExecutionLog: (...args: any[]) => mockGetExecutionLog(...args),
}));

import automationRulesRouter from '../src/routes/automation-rules';

describe('Automation Rules Routes', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/automation-rules', automationRulesRouter);
    jest.clearAllMocks();
  });

  describe('GET /api/automation-rules', () => {
    it('returns all automation rules', async () => {
      const res = await request(app).get('/api/automation-rules');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
    });

    it('data is an array', async () => {
      const res = await request(app).get('/api/automation-rules');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('listRules called once per GET request', async () => {
      await request(app).get('/api/automation-rules');
      expect(mockListRules).toHaveBeenCalledTimes(1);
    });
  });

  describe('POST /api/automation-rules/:id/enable', () => {
    it('enables a rule', async () => {
      const res = await request(app).post(
        '/api/automation-rules/00000000-0000-0000-0000-000000000001/enable'
      );
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('returns 404 for non-existent rule', async () => {
      mockEnableRule.mockReturnValueOnce(false);
      mockGetRuleById.mockReturnValueOnce(undefined);
      const res = await request(app).post(
        '/api/automation-rules/00000000-0000-0000-0000-000000000099/enable'
      );
      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/automation-rules/:id/disable', () => {
    it('disables a rule', async () => {
      const res = await request(app).post(
        '/api/automation-rules/00000000-0000-0000-0000-000000000001/disable'
      );
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('returns 404 for non-existent rule on disable', async () => {
      mockDisableRule.mockReturnValueOnce(false);
      mockGetRuleById.mockReturnValueOnce(undefined);
      const res = await request(app).post(
        '/api/automation-rules/00000000-0000-0000-0000-000000000099/disable'
      );
      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/automation-rules/:id/log', () => {
    it('returns execution log for a rule', async () => {
      mockGetExecutionLog.mockReturnValue([
        { id: 'log-1', ruleId: 'rule-1', status: 'SUCCESS', executedAt: new Date().toISOString() },
      ]);
      const res = await request(app).get(
        '/api/automation-rules/00000000-0000-0000-0000-000000000001/log'
      );
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('execution log data is an array', async () => {
      mockGetExecutionLog.mockReturnValue([]);
      const res = await request(app).get(
        '/api/automation-rules/00000000-0000-0000-0000-000000000001/log'
      );
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });
});

describe('Automation Rules — extended', () => {
  let app: express.Express;
  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/automation-rules', automationRulesRouter);
    jest.clearAllMocks();
  });

  it('first rule has name property', async () => {
    const res = await request(app).get('/api/automation-rules');
    expect(res.status).toBe(200);
    expect(res.body.data[0]).toHaveProperty('name');
  });

  it('enableRule called once on enable request', async () => {
    await request(app).post('/api/automation-rules/00000000-0000-0000-0000-000000000001/enable');
    expect(mockEnableRule).toHaveBeenCalledTimes(1);
  });

  it('disableRule called once on disable request', async () => {
    await request(app).post('/api/automation-rules/00000000-0000-0000-0000-000000000001/disable');
    expect(mockDisableRule).toHaveBeenCalledTimes(1);
  });
});

describe('Automation Rules — extra', () => {
  let extApp: express.Express;
  beforeEach(() => {
    extApp = express();
    extApp.use(express.json());
    extApp.use('/api/automation-rules', automationRulesRouter);
    jest.clearAllMocks();
  });

  it('GET / returns at least one rule in data', async () => {
    const res = await request(extApp).get('/api/automation-rules');
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('GET /:id/log returns success true when rule exists', async () => {
    mockGetExecutionLog.mockReturnValue([]);
    const res = await request(extApp).get(
      '/api/automation-rules/00000000-0000-0000-0000-000000000001/log'
    );
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('first rule in list has an id property', async () => {
    const res = await request(extApp).get('/api/automation-rules');
    expect(res.status).toBe(200);
    expect(res.body.data[0]).toHaveProperty('id');
  });
});
