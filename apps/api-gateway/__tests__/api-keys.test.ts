import express from 'express';
import request from 'supertest';

const mockAuthenticate = jest.fn((req: any, _res: any, next: any) => {
  req.user = { id: 'user-1', email: 'admin@ims.local', role: 'ADMIN', orgId: 'org-1' };
  next();
});

const mockRequireRole = jest.fn((...roles: string[]) => {
  return (req: any, res: any, next: any) => {
    if (!roles.includes(req.user?.role)) {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN' } });
    }
    next();
  };
});

jest.mock('@ims/auth', () => ({
  authenticate: (...args: any[]) => mockAuthenticate(...args),
  requireRole: (...args: any[]) => mockRequireRole(...args),
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('$2b$10$hashedvalue'),
  compare: jest.fn().mockResolvedValue(true),
}));

import apiKeysRouter from '../src/routes/api-keys';

describe('API Keys Routes', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/admin/api-keys', apiKeysRouter);
    jest.clearAllMocks();
  });

  describe('POST /api/admin/api-keys', () => {
    it('creates a new API key and returns plaintext once', async () => {
      const res = await request(app)
        .post('/api/admin/api-keys')
        .send({ name: 'Power BI Connector', scopes: ['read:quality', 'read:analytics'] });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.key).toBeDefined();
      expect(res.body.data.key).toMatch(/^rxk_/);
      expect(res.body.data.name).toBe('Power BI Connector');
    });

    it('rejects missing name', async () => {
      const res = await request(app)
        .post('/api/admin/api-keys')
        .send({ scopes: ['read:quality'] });
      expect(res.status).toBe(400);
    });

    it('rejects empty scopes', async () => {
      const res = await request(app)
        .post('/api/admin/api-keys')
        .send({ name: 'Test', scopes: [] });
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/admin/api-keys', () => {
    it('lists API keys', async () => {
      const res = await request(app).get('/api/admin/api-keys');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
    });
  });

  describe('DELETE /api/admin/api-keys/:id', () => {
    it('revokes an API key', async () => {
      // Create first
      const createRes = await request(app)
        .post('/api/admin/api-keys')
        .send({ name: 'To Revoke', scopes: ['read:quality'] });
      const keyId = createRes.body.data.id;

      const res = await request(app).delete(`/api/admin/api-keys/${keyId}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('returns 404 for non-existent key', async () => {
      const res = await request(app).delete('/api/admin/api-keys/nonexistent-id');
      expect(res.status).toBe(404);
    });
  });

  describe('Auth enforcement', () => {
    it('requires ADMIN role', async () => {
      mockAuthenticate.mockImplementationOnce((req: any, _res: any, next: any) => {
        req.user = { id: 'u2', email: 'user@ims.local', role: 'USER', orgId: 'org-1' };
        next();
      });
      const res = await request(app).get('/api/admin/api-keys');
      expect(res.status).toBe(403);
    });
  });
});
