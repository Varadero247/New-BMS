import express from 'express';
import request from 'supertest';

// Mock all external dependencies before importing routes
jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
  metricsMiddleware: () => (_req: any, _res: any, next: any) => next(),
  correlationIdMiddleware: (_req: any, _res: any, next: any) => next(),
  createHealthCheck: () => () => ({ status: 'ok' }),
}));

jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((req: any, _res: any, next: any) => {
    req.user = { id: 'user-1', email: 'admin@ims.local', role: 'ADMIN', orgId: 'org-1' };
    next();
  }),
  requireRole: jest.fn(() => (_req: any, _res: any, next: any) => next()),
  generateToken: jest.fn().mockReturnValue('mock-token'),
  generateRefreshToken: jest.fn().mockReturnValue('mock-refresh-token'),
  verifyRefreshToken: jest.fn().mockReturnValue({ userId: 'user-1' }),
  hashPassword: jest.fn().mockResolvedValue('hashed-password'),
  comparePassword: jest.fn().mockResolvedValue(true),
  validatePasswordStrength: jest.fn().mockReturnValue({ valid: true, errors: [] }),
}));

jest.mock('@ims/database', () => ({
  prisma: {
    user: {
      findUnique: jest.fn().mockResolvedValue({
        id: 'user-1',
        email: 'admin@ims.local',
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
        password: 'hashed-password',
        active: true,
      }),
      create: jest.fn().mockResolvedValue({ id: 'user-1' }),
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
      update: jest.fn().mockResolvedValue({ id: 'user-1' }),
    },
    session: {
      create: jest.fn().mockResolvedValue({ id: 'sess-1' }),
      findFirst: jest.fn().mockResolvedValue(null),
      delete: jest.fn().mockResolvedValue({ id: 'sess-1' }),
      deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
      update: jest.fn().mockResolvedValue({ id: 'sess-1' }),
      findMany: jest.fn().mockResolvedValue([]),
    },
    auditLog: {
      create: jest.fn().mockResolvedValue({ id: 'log-1' }),
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
    },
    eSignature: {
      create: jest.fn().mockResolvedValue({ id: 'sig-1' }),
      findUnique: jest.fn().mockResolvedValue(null),
    },
    documentTemplate: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({ id: 'tmpl-1' }),
      update: jest.fn().mockResolvedValue({ id: 'tmpl-1' }),
      delete: jest.fn().mockResolvedValue({ id: 'tmpl-1' }),
      count: jest.fn().mockResolvedValue(0),
    },
    complianceRecord: {
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
    },
    role: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({ id: 'role-1' }),
      update: jest.fn().mockResolvedValue({ id: 'role-1' }),
      delete: jest.fn().mockResolvedValue({ id: 'role-1' }),
    },
  },
}));

jest.mock('@ims/audit', () => ({
  createEnhancedAuditService: jest.fn().mockReturnValue({
    query: jest.fn().mockResolvedValue({ entries: [], total: 0 }),
    getResourceHistory: jest.fn().mockResolvedValue({ entries: [], total: 0 }),
    verifyEntry: jest.fn().mockResolvedValue({ valid: true }),
    createEntry: jest.fn().mockResolvedValue({ id: 'entry-1' }),
  }),
}));

jest.mock('@ims/esig', () => ({
  createSignature: jest.fn().mockResolvedValue({ signature: null, error: 'Not implemented' }),
  verifySignature: jest.fn().mockReturnValue({ valid: true }),
  isValidMeaning: jest.fn().mockReturnValue(true),
}));

jest.mock('@ims/templates', () => ({
  renderTemplateToHtml: jest.fn().mockReturnValue('<p>Rendered</p>'),
  getTemplate: jest.fn().mockReturnValue(null),
  listTemplates: jest.fn().mockReturnValue([]),
}));

jest.mock('../src/middleware/rate-limiter', () => ({
  authLimiter: (_req: any, _res: any, next: any) => next(),
  registerLimiter: (_req: any, _res: any, next: any) => next(),
  passwordResetLimiter: (_req: any, _res: any, next: any) => next(),
  apiLimiter: (_req: any, _res: any, next: any) => next(),
}));

jest.mock('../src/middleware/account-lockout', () => ({
  getAccountLockoutManager: () => ({
    recordFailedAttempt: jest.fn().mockResolvedValue({ locked: false, remainingAttempts: 4 }),
    getRemainingAttempts: jest.fn().mockResolvedValue(4),
    getLockoutTimeRemaining: jest.fn().mockResolvedValue(0),
    reset: jest.fn().mockResolvedValue(undefined),
    isLocked: jest.fn().mockResolvedValue(false),
  }),
  checkAccountLockout: () => (_req: any, _res: any, next: any) => next(),
}));

import v1Router from '../src/routes/v1';

describe('V1 Router', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/v1', v1Router);
  });

  describe('Auth routes mounted at /api/v1/auth', () => {
    it('responds to POST /api/v1/auth/login (not 404)', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'admin@ims.local', password: 'admin123' });
      // Should get a response (not 404 — route is mounted)
      expect(res.status).not.toBe(404);
    });
  });

  describe('User routes mounted at /api/v1/users', () => {
    it('responds to GET /api/v1/users (requires auth)', async () => {
      const res = await request(app)
        .get('/api/v1/users')
        .set('Authorization', 'Bearer mock-token');
      expect(res.status).not.toBe(404);
    });
  });

  describe('Audit routes mounted at /api/v1/audit', () => {
    it('responds to GET /api/v1/audit/trail', async () => {
      const res = await request(app)
        .get('/api/v1/audit/trail')
        .set('Authorization', 'Bearer mock-token');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('Unified audit routes mounted at /api/v1/unified-audit', () => {
    it('responds to GET /api/v1/unified-audit/standards', async () => {
      const res = await request(app)
        .get('/api/v1/unified-audit/standards')
        .set('Authorization', 'Bearer mock-token');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GDPR routes mounted at /api/v1/gdpr', () => {
    it('responds to GET /api/v1/gdpr/data-map (not 404)', async () => {
      const res = await request(app)
        .get('/api/v1/gdpr/data-map')
        .set('Authorization', 'Bearer mock-token');
      expect(res.status).not.toBe(404);
    });
  });

  describe('Session routes mounted at /api/v1/sessions', () => {
    it('responds to GET /api/v1/sessions (not 404)', async () => {
      const res = await request(app)
        .get('/api/v1/sessions')
        .set('Authorization', 'Bearer mock-token');
      expect(res.status).not.toBe(404);
    });
  });

  describe('Security controls mounted at /api/v1/security-controls', () => {
    it('responds to GET /api/v1/security-controls (not 404)', async () => {
      const res = await request(app)
        .get('/api/v1/security-controls')
        .set('Authorization', 'Bearer mock-token');
      expect(res.status).not.toBe(404);
    });
  });

  describe('Template routes mounted at /api/v1/templates', () => {
    it('responds to GET /api/v1/templates (not 404)', async () => {
      const res = await request(app)
        .get('/api/v1/templates')
        .set('Authorization', 'Bearer mock-token');
      expect(res.status).not.toBe(404);
    });
  });

  describe('Reports routes mounted at /api/v1/reports', () => {
    it('responds to GET /api/v1/reports (not 404)', async () => {
      const res = await request(app)
        .get('/api/v1/reports')
        .set('Authorization', 'Bearer mock-token');
      expect(res.status).not.toBe(404);
    });
  });

  describe('Unknown routes return 404', () => {
    it('returns 404 for completely unknown path', async () => {
      const res = await request(app).get('/api/v1/nonexistent-route-xyz-abc');
      expect(res.status).toBe(404);
    });
  });
});
