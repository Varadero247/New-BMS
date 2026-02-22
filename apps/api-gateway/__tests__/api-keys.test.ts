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

const mockApiKey = {
  create: jest.fn(),
  findMany: jest.fn(),
  findUnique: jest.fn(),
  update: jest.fn(),
};

jest.mock('@ims/database', () => ({
  prisma: {
    apiKey: mockApiKey,
    $use: jest.fn(),
  },
}));

import apiKeysRouter from '../src/routes/api-keys';

const mockRecord = {
  id: 'key-1',
  name: 'Power BI Connector',
  keyHash: '$2b$10$hashedvalue',
  prefix: 'rxk_abcdef12',
  permissions: ['read:quality', 'read:analytics'],
  orgId: 'org-1',
  createdById: 'user-1',
  usageCount: 0,
  isActive: true,
  revokedAt: null,
  lastUsedAt: null,
  createdAt: new Date('2026-01-01T00:00:00Z'),
  updatedAt: new Date('2026-01-01T00:00:00Z'),
  expiresAt: null,
};

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
      mockApiKey.create.mockResolvedValue(mockRecord);

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
      const res = await request(app).post('/api/admin/api-keys').send({ name: 'Test', scopes: [] });
      expect(res.status).toBe(400);
    });

    it('calls prisma.apiKey.create once on success', async () => {
      mockApiKey.create.mockResolvedValue(mockRecord);
      await request(app)
        .post('/api/admin/api-keys')
        .send({ name: 'Test Key', scopes: ['read:hr'] });
      expect(mockApiKey.create).toHaveBeenCalledTimes(1);
    });

    it('stores permissions from scopes input', async () => {
      mockApiKey.create.mockResolvedValue(mockRecord);
      await request(app)
        .post('/api/admin/api-keys')
        .send({ name: 'Test', scopes: ['read:quality', 'read:hr'] });
      expect(mockApiKey.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ permissions: ['read:quality', 'read:hr'] }),
        })
      );
    });

    it('returns 500 when create throws', async () => {
      mockApiKey.create.mockRejectedValue(new Error('DB error'));
      const res = await request(app)
        .post('/api/admin/api-keys')
        .send({ name: 'Test', scopes: ['read:hr'] });
      expect(res.status).toBe(500);
      expect(res.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('GET /api/admin/api-keys', () => {
    it('lists API keys', async () => {
      mockApiKey.findMany.mockResolvedValue([mockRecord]);

      const res = await request(app).get('/api/admin/api-keys');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data).toHaveLength(1);
    });

    it('returns empty array when no keys', async () => {
      mockApiKey.findMany.mockResolvedValue([]);
      const res = await request(app).get('/api/admin/api-keys');
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(0);
    });

    it('filters by orgId', async () => {
      mockApiKey.findMany.mockResolvedValue([]);
      await request(app).get('/api/admin/api-keys');
      expect(mockApiKey.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ orgId: 'org-1' }) })
      );
    });

    it('returns 500 when findMany throws', async () => {
      mockApiKey.findMany.mockRejectedValue(new Error('DB error'));
      const res = await request(app).get('/api/admin/api-keys');
      expect(res.status).toBe(500);
    });
  });

  describe('DELETE /api/admin/api-keys/:id', () => {
    it('revokes an API key', async () => {
      mockApiKey.findUnique.mockResolvedValue(mockRecord);
      mockApiKey.update.mockResolvedValue({ ...mockRecord, isActive: false, revokedAt: new Date() });

      const res = await request(app).delete('/api/admin/api-keys/key-1');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('revoked');
    });

    it('returns 404 for non-existent key', async () => {
      mockApiKey.findUnique.mockResolvedValue(null);
      const res = await request(app).delete('/api/admin/api-keys/00000000-0000-0000-0000-000000000099');
      expect(res.status).toBe(404);
    });

    it('returns 409 when key already revoked', async () => {
      mockApiKey.findUnique.mockResolvedValue({ ...mockRecord, isActive: false });
      const res = await request(app).delete('/api/admin/api-keys/key-1');
      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe('ALREADY_REVOKED');
    });

    it('sets isActive to false in DB', async () => {
      mockApiKey.findUnique.mockResolvedValue(mockRecord);
      mockApiKey.update.mockResolvedValue({ ...mockRecord, isActive: false });
      await request(app).delete('/api/admin/api-keys/key-1');
      expect(mockApiKey.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ isActive: false }) })
      );
    });

    it('returns 500 when update throws', async () => {
      mockApiKey.findUnique.mockResolvedValue(mockRecord);
      mockApiKey.update.mockRejectedValue(new Error('DB error'));
      const res = await request(app).delete('/api/admin/api-keys/key-1');
      expect(res.status).toBe(500);
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

  describe('API Keys — extended', () => {
    it('GET /api/admin/api-keys returns success true', async () => {
      mockApiKey.findMany.mockResolvedValue([]);
      const res = await request(app).get('/api/admin/api-keys');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('created key has an id field', async () => {
      mockApiKey.create.mockResolvedValue(mockRecord);
      const res = await request(app)
        .post('/api/admin/api-keys')
        .send({ name: 'Analytics Key', scopes: ['read:analytics'] });
      expect(res.status).toBe(201);
      expect(res.body.data).toHaveProperty('id');
    });

    it('created key stores the given scopes', async () => {
      mockApiKey.create.mockResolvedValue({ ...mockRecord, permissions: ['read:quality', 'read:hr'] });
      const res = await request(app)
        .post('/api/admin/api-keys')
        .send({ name: 'Multi-scope Key', scopes: ['read:quality', 'read:hr'] });
      expect(res.status).toBe(201);
      expect(res.body.data.scopes).toEqual(['read:quality', 'read:hr']);
    });
  });

  describe('API Keys — further extended', () => {
    it('GET returns data as an array', async () => {
      mockApiKey.findMany.mockResolvedValue([]);
      const res = await request(app).get('/api/admin/api-keys');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('created key field starts with rxk_', async () => {
      mockApiKey.create.mockResolvedValue(mockRecord);
      const res = await request(app)
        .post('/api/admin/api-keys')
        .send({ name: 'Prefix Check', scopes: ['read:inventory'] });
      expect(res.status).toBe(201);
      expect(res.body.data.key).toMatch(/^rxk_/);
    });

    it('created key name matches submitted name', async () => {
      mockApiKey.create.mockResolvedValue({ ...mockRecord, name: 'My Integration' });
      const res = await request(app)
        .post('/api/admin/api-keys')
        .send({ name: 'My Integration', scopes: ['read:hr'] });
      expect(res.status).toBe(201);
      expect(res.body.data.name).toBe('My Integration');
    });

    it('POST with missing scopes returns 400', async () => {
      const res = await request(app).post('/api/admin/api-keys').send({ name: 'No Scopes' });
      expect(res.status).toBe(400);
    });

    it('DELETE non-existent key returns 404', async () => {
      mockApiKey.findUnique.mockResolvedValue(null);
      const res = await request(app).delete('/api/admin/api-keys/00000000-0000-0000-0000-000000000099');
      expect(res.status).toBe(404);
    });
  });

  describe('API Keys — boundary and business logic', () => {
    it('POST rejects name longer than 100 characters', async () => {
      const longName = 'A'.repeat(101);
      const res = await request(app)
        .post('/api/admin/api-keys')
        .send({ name: longName, scopes: ['read:quality'] });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('POST with name exactly 100 characters succeeds', async () => {
      const maxName = 'A'.repeat(100);
      mockApiKey.create.mockResolvedValue({ ...mockRecord, name: maxName });
      const res = await request(app)
        .post('/api/admin/api-keys')
        .send({ name: maxName, scopes: ['read:hr'] });
      expect(res.status).toBe(201);
    });

    it('GET response includes meta.total field', async () => {
      mockApiKey.findMany.mockResolvedValue([mockRecord, mockRecord]);
      const res = await request(app).get('/api/admin/api-keys');
      expect(res.status).toBe(200);
      expect(res.body.meta).toHaveProperty('total', 2);
    });

    it('GET list response never includes keyHash field', async () => {
      mockApiKey.findMany.mockResolvedValue([mockRecord]);
      const res = await request(app).get('/api/admin/api-keys');
      expect(res.status).toBe(200);
      for (const item of res.body.data) {
        expect(item).not.toHaveProperty('keyHash');
      }
    });

    it('created key response includes status field set to active', async () => {
      mockApiKey.create.mockResolvedValue(mockRecord);
      const res = await request(app)
        .post('/api/admin/api-keys')
        .send({ name: 'Status Check', scopes: ['read:inventory'] });
      expect(res.status).toBe(201);
      expect(res.body.data.status).toBe('active');
    });

    it('revoked key response includes revokedAt timestamp', async () => {
      const revokedAt = new Date('2026-01-15T12:00:00Z');
      mockApiKey.findUnique.mockResolvedValue(mockRecord);
      mockApiKey.update.mockResolvedValue({
        ...mockRecord,
        isActive: false,
        revokedAt,
      });
      const res = await request(app).delete('/api/admin/api-keys/key-1');
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('revokedAt');
    });

    it('GET list filters keys by orgId of authenticated user', async () => {
      mockApiKey.findMany.mockResolvedValue([]);
      await request(app).get('/api/admin/api-keys');
      expect(mockApiKey.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ orgId: 'org-1' }),
        })
      );
    });

    it('POST with empty name string returns 400', async () => {
      const res = await request(app)
        .post('/api/admin/api-keys')
        .send({ name: '', scopes: ['read:hr'] });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('created key response includes keyPrefix field', async () => {
      mockApiKey.create.mockResolvedValue({ ...mockRecord, prefix: 'rxk_abcdef12' });
      const res = await request(app)
        .post('/api/admin/api-keys')
        .send({ name: 'Prefix Field Test', scopes: ['read:analytics'] });
      expect(res.status).toBe(201);
      expect(res.body.data).toHaveProperty('keyPrefix');
    });

    it('GET list response for active keys shows status active', async () => {
      mockApiKey.findMany.mockResolvedValue([mockRecord]);
      const res = await request(app).get('/api/admin/api-keys');
      expect(res.status).toBe(200);
      expect(res.body.data[0].status).toBe('active');
    });
  });
});
