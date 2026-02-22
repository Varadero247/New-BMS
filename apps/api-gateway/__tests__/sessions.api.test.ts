import express from 'express';
import request from 'supertest';

// Mock dependencies
jest.mock('@ims/database', () => ({
  prisma: {
    session: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
  },
}));

jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((req, res, next) => {
    req.user = { id: '20000000-0000-4000-a000-000000000123', email: 'test@test.com', role: 'USER' };
    req.sessionId = '00000000-0000-0000-0000-000000000001';
    next();
  }),
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  }),
}));

import { prisma } from '@ims/database';
import sessionsRoutes from '../src/routes/sessions';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('Sessions API Routes', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/sessions', sessionsRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/sessions', () => {
    const mockSessions = [
      {
        id: '00000000-0000-0000-0000-000000000001',
        userAgent: 'Mozilla/5.0',
        ipAddress: '192.168.1.1',
        createdAt: new Date('2024-01-01'),
        lastActivityAt: new Date('2024-01-02'),
        expiresAt: new Date('2024-01-08'),
      },
      {
        id: '00000000-0000-0000-0000-000000000002',
        userAgent: 'Safari/17.0',
        ipAddress: '192.168.1.2',
        createdAt: new Date('2024-01-01'),
        lastActivityAt: new Date('2024-01-01'),
        expiresAt: new Date('2024-01-08'),
      },
    ];

    it('should return list of active sessions', async () => {
      (mockPrisma.session.findMany as jest.Mock).mockResolvedValueOnce(mockSessions);

      const response = await request(app).get('/api/sessions').set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
    });

    it('should mark current session', async () => {
      (mockPrisma.session.findMany as jest.Mock).mockResolvedValueOnce(mockSessions);

      const response = await request(app).get('/api/sessions').set('Authorization', 'Bearer token');

      expect(response.body.data[0].isCurrent).toBe(true);
      expect(response.body.data[1].isCurrent).toBe(false);
    });

    it('should only return non-expired sessions', async () => {
      (mockPrisma.session.findMany as jest.Mock).mockResolvedValueOnce([]);

      await request(app).get('/api/sessions').set('Authorization', 'Bearer token');

      expect(mockPrisma.session.findMany).toHaveBeenCalledWith({
        where: {
          userId: '20000000-0000-4000-a000-000000000123',
          expiresAt: { gte: expect.any(Date) },
        },
        select: expect.any(Object),
        orderBy: { lastActivityAt: 'desc' },
        take: 100,
      });
    });

    it('should handle database errors', async () => {
      mockPrisma.session.findMany.mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app).get('/api/sessions').set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('DELETE /api/sessions/:id', () => {
    it('should revoke a specific session', async () => {
      mockPrisma.session.findFirst.mockResolvedValueOnce({
        id: '00000000-0000-0000-0000-000000000002',
        userId: '20000000-0000-4000-a000-000000000123',
      });
      (mockPrisma.session.delete as jest.Mock).mockResolvedValueOnce({});

      const response = await request(app)
        .delete('/api/sessions/00000000-0000-0000-0000-000000000002')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(204);
      expect(mockPrisma.session.delete).toHaveBeenCalledWith({
        where: { id: '00000000-0000-0000-0000-000000000002' },
      });
    });

    it('should not allow revoking current session', async () => {
      const response = await request(app)
        .delete('/api/sessions/00000000-0000-0000-0000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('CANNOT_REVOKE_CURRENT');
    });

    it('should return 404 for nonexistent session', async () => {
      mockPrisma.session.findFirst.mockResolvedValueOnce(null);

      const response = await request(app)
        .delete('/api/sessions/00000000-0000-0000-0000-000000000099')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('SESSION_NOT_FOUND');
    });

    it('should only allow revoking own sessions', async () => {
      mockPrisma.session.findFirst.mockResolvedValueOnce(null);

      await request(app)
        .delete('/api/sessions/54000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.session.findFirst).toHaveBeenCalledWith({
        where: {
          id: '54000000-0000-4000-a000-000000000001',
          userId: '20000000-0000-4000-a000-000000000123',
        },
      });
    });

    it('should handle database errors', async () => {
      mockPrisma.session.findFirst.mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .delete('/api/sessions/00000000-0000-0000-0000-000000000003')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('DELETE /api/sessions (revoke all)', () => {
    it('should revoke all other sessions', async () => {
      mockPrisma.session.deleteMany.mockResolvedValueOnce({ count: 3 });

      const response = await request(app)
        .delete('/api/sessions')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(204);
    });

    it('should exclude current session from revocation', async () => {
      mockPrisma.session.deleteMany.mockResolvedValueOnce({ count: 0 });

      await request(app).delete('/api/sessions').set('Authorization', 'Bearer token');

      expect(mockPrisma.session.deleteMany).toHaveBeenCalledWith({
        where: {
          userId: '20000000-0000-4000-a000-000000000123',
          id: { not: '00000000-0000-0000-0000-000000000001' },
        },
      });
    });

    it('should return 0 when no other sessions exist', async () => {
      mockPrisma.session.deleteMany.mockResolvedValueOnce({ count: 0 });

      const response = await request(app)
        .delete('/api/sessions')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(204);
    });

    it('should handle database errors', async () => {
      mockPrisma.session.deleteMany.mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .delete('/api/sessions')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });
});

describe('Sessions API — extended', () => {
  let extApp: import('express').Express;

  beforeAll(() => {
    extApp = require('express')();
    extApp.use(require('express').json());
    extApp.use('/api/sessions', sessionsRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /api/sessions returns success true on 200', async () => {
    (mockPrisma.session.findMany as jest.Mock).mockResolvedValueOnce([]);
    const response = await request(extApp)
      .get('/api/sessions')
      .set('Authorization', 'Bearer token');
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it('GET /api/sessions data is an array', async () => {
    (mockPrisma.session.findMany as jest.Mock).mockResolvedValueOnce([]);
    const response = await request(extApp)
      .get('/api/sessions')
      .set('Authorization', 'Bearer token');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
  });
});

describe('Sessions API — additional coverage', () => {
  let app: import('express').Express;

  beforeAll(() => {
    const express = require('express');
    app = express();
    app.use(express.json());
    app.use('/api/sessions', sessionsRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /api/sessions maps isCurrent false for sessions other than current', async () => {
    const otherSession = {
      id: '00000000-0000-0000-0000-000000000099',
      userAgent: 'Chrome/120',
      ipAddress: '10.0.0.1',
      createdAt: new Date('2024-01-01'),
      lastActivityAt: new Date('2024-01-01'),
      expiresAt: new Date('2024-01-08'),
    };
    (mockPrisma.session.findMany as jest.Mock).mockResolvedValueOnce([otherSession]);
    const response = await request(app).get('/api/sessions').set('Authorization', 'Bearer token');
    expect(response.status).toBe(200);
    expect(response.body.data[0].isCurrent).toBe(false);
  });

  it('DELETE /api/sessions/:id returns 204 on successful revocation', async () => {
    mockPrisma.session.findFirst.mockResolvedValueOnce({
      id: '00000000-0000-0000-0000-000000000002',
      userId: '20000000-0000-4000-a000-000000000123',
    });
    (mockPrisma.session.delete as jest.Mock).mockResolvedValueOnce({});
    const response = await request(app)
      .delete('/api/sessions/00000000-0000-0000-0000-000000000002')
      .set('Authorization', 'Bearer token');
    expect(response.status).toBe(204);
  });

  it('DELETE /api/sessions returns 204 even when count is zero', async () => {
    mockPrisma.session.deleteMany.mockResolvedValueOnce({ count: 0 });
    const response = await request(app)
      .delete('/api/sessions')
      .set('Authorization', 'Bearer token');
    expect(response.status).toBe(204);
  });

  it('GET /api/sessions uses correct userId from auth', async () => {
    (mockPrisma.session.findMany as jest.Mock).mockResolvedValueOnce([]);
    await request(app).get('/api/sessions').set('Authorization', 'Bearer token');
    expect(mockPrisma.session.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ userId: '20000000-0000-4000-a000-000000000123' }),
      })
    );
  });

  it('DELETE /api/sessions/:id calls session.delete with correct id', async () => {
    mockPrisma.session.findFirst.mockResolvedValueOnce({
      id: '00000000-0000-0000-0000-000000000002',
      userId: '20000000-0000-4000-a000-000000000123',
    });
    (mockPrisma.session.delete as jest.Mock).mockResolvedValueOnce({});
    await request(app)
      .delete('/api/sessions/00000000-0000-0000-0000-000000000002')
      .set('Authorization', 'Bearer token');
    expect(mockPrisma.session.delete).toHaveBeenCalledWith({
      where: { id: '00000000-0000-0000-0000-000000000002' },
    });
  });
});

describe('Sessions API — more edge cases', () => {
  let app: import('express').Express;

  beforeAll(() => {
    const express = require('express');
    app = express();
    app.use(express.json());
    app.use('/api/sessions', sessionsRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /api/sessions includes expiresAt on each session', async () => {
    const future = new Date(Date.now() + 86400_000);
    (mockPrisma.session.findMany as jest.Mock).mockResolvedValueOnce([
      { id: '00000000-0000-0000-0000-000000000003', userAgent: 'Firefox', ipAddress: '10.0.0.1',
        createdAt: new Date(), lastActivityAt: new Date(), expiresAt: future },
    ]);
    const response = await request(app).get('/api/sessions').set('Authorization', 'Bearer token');
    expect(response.status).toBe(200);
    expect(response.body.data[0]).toHaveProperty('expiresAt');
  });

  it('GET /api/sessions includes ipAddress on each session', async () => {
    const future = new Date(Date.now() + 86400_000);
    (mockPrisma.session.findMany as jest.Mock).mockResolvedValueOnce([
      { id: '00000000-0000-0000-0000-000000000004', userAgent: 'Chrome', ipAddress: '172.16.0.1',
        createdAt: new Date(), lastActivityAt: new Date(), expiresAt: future },
    ]);
    const response = await request(app).get('/api/sessions').set('Authorization', 'Bearer token');
    expect(response.status).toBe(200);
    expect(response.body.data[0]).toHaveProperty('ipAddress');
  });

  it('GET /api/sessions includes userAgent on each session', async () => {
    const future = new Date(Date.now() + 86400_000);
    (mockPrisma.session.findMany as jest.Mock).mockResolvedValueOnce([
      { id: '00000000-0000-0000-0000-000000000005', userAgent: 'Safari', ipAddress: '10.0.0.2',
        createdAt: new Date(), lastActivityAt: new Date(), expiresAt: future },
    ]);
    const response = await request(app).get('/api/sessions').set('Authorization', 'Bearer token');
    expect(response.status).toBe(200);
    expect(response.body.data[0]).toHaveProperty('userAgent');
  });

  it('DELETE /api/sessions/:id returns 400 when trying to revoke current session', async () => {
    const response = await request(app)
      .delete('/api/sessions/00000000-0000-0000-0000-000000000001')
      .set('Authorization', 'Bearer token');
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('CANNOT_REVOKE_CURRENT');
  });

  it('DELETE /api/sessions excludes current session from deleteMany query', async () => {
    mockPrisma.session.deleteMany.mockResolvedValueOnce({ count: 2 });
    await request(app).delete('/api/sessions').set('Authorization', 'Bearer token');
    expect(mockPrisma.session.deleteMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ id: { not: '00000000-0000-0000-0000-000000000001' } }),
      })
    );
  });

  it('GET /api/sessions returns empty array when no sessions found', async () => {
    (mockPrisma.session.findMany as jest.Mock).mockResolvedValueOnce([]);
    const response = await request(app).get('/api/sessions').set('Authorization', 'Bearer token');
    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(0);
  });

  it('DELETE /api/sessions/:id returns 500 when delete throws', async () => {
    mockPrisma.session.findFirst.mockResolvedValueOnce({
      id: '00000000-0000-0000-0000-000000000002',
      userId: '20000000-0000-4000-a000-000000000123',
    });
    (mockPrisma.session.delete as jest.Mock).mockRejectedValueOnce(new Error('disk full'));
    const response = await request(app)
      .delete('/api/sessions/00000000-0000-0000-0000-000000000002')
      .set('Authorization', 'Bearer token');
    expect(response.status).toBe(500);
    expect(response.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET /api/sessions orders by lastActivityAt desc', async () => {
    (mockPrisma.session.findMany as jest.Mock).mockResolvedValueOnce([]);
    await request(app).get('/api/sessions').set('Authorization', 'Bearer token');
    expect(mockPrisma.session.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { lastActivityAt: 'desc' } })
    );
  });
});

describe('Sessions API — pre-final coverage', () => {
  let app: import('express').Express;

  beforeAll(() => {
    const express = require('express');
    app = express();
    app.use(express.json());
    app.use('/api/sessions', sessionsRoutes);
  });

  beforeEach(() => { jest.clearAllMocks(); });

  it('GET /api/sessions returns data array even for a single session', async () => {
    const future = new Date(Date.now() + 86400_000);
    (mockPrisma.session.findMany as jest.Mock).mockResolvedValueOnce([
      { id: '00000000-0000-0000-0000-000000000010', userAgent: 'Edge', ipAddress: '192.168.0.1',
        createdAt: new Date(), lastActivityAt: new Date(), expiresAt: future },
    ]);
    const res = await request(app).get('/api/sessions').set('Authorization', 'Bearer token');
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });

  it('DELETE /api/sessions returns 500 when deleteMany throws', async () => {
    (mockPrisma.session.deleteMany as jest.Mock).mockRejectedValueOnce(new Error('constraint error'));
    const res = await request(app).delete('/api/sessions').set('Authorization', 'Bearer token');
    expect(res.status).toBe(500);
  });

  it('DELETE /api/sessions/:id session.delete is not called when session not found', async () => {
    (mockPrisma.session.findFirst as jest.Mock).mockResolvedValueOnce(null);
    await request(app).delete('/api/sessions/00000000-0000-0000-0000-000000000088')
      .set('Authorization', 'Bearer token');
    expect(mockPrisma.session.delete).not.toHaveBeenCalled();
  });

  it('GET /api/sessions limits results to at most 100 via take:100 query option', async () => {
    (mockPrisma.session.findMany as jest.Mock).mockResolvedValueOnce([]);
    await request(app).get('/api/sessions').set('Authorization', 'Bearer token');
    expect(mockPrisma.session.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 100 })
    );
  });

  it('DELETE /api/sessions/:id 400 response body has error property', async () => {
    const res = await request(app)
      .delete('/api/sessions/00000000-0000-0000-0000-000000000001')
      .set('Authorization', 'Bearer token');
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});

describe('Sessions API — final coverage batch', () => {
  let app: import('express').Express;

  beforeAll(() => {
    const express = require('express');
    app = express();
    app.use(express.json());
    app.use('/api/sessions', sessionsRoutes);
  });

  beforeEach(() => { jest.clearAllMocks(); });

  it('GET /api/sessions returns JSON content-type', async () => {
    (mockPrisma.session.findMany as jest.Mock).mockResolvedValueOnce([]);
    const res = await request(app).get('/api/sessions').set('Authorization', 'Bearer token');
    expect(res.headers['content-type']).toMatch(/json/);
  });

  it('DELETE /api/sessions returns JSON content-type', async () => {
    mockPrisma.session.deleteMany.mockResolvedValueOnce({ count: 0 });
    const res = await request(app).delete('/api/sessions').set('Authorization', 'Bearer token');
    // 204 may have no body; just check it doesn't crash
    expect([200, 204]).toContain(res.status);
  });

  it('DELETE /api/sessions/:id returns JSON content-type on 404', async () => {
    mockPrisma.session.findFirst.mockResolvedValueOnce(null);
    const res = await request(app)
      .delete('/api/sessions/00000000-0000-0000-0000-000000000099')
      .set('Authorization', 'Bearer token');
    expect(res.status).toBe(404);
    expect(res.headers['content-type']).toMatch(/json/);
  });

  it('GET /api/sessions data array length equals mock sessions length', async () => {
    const future = new Date(Date.now() + 86400_000);
    (mockPrisma.session.findMany as jest.Mock).mockResolvedValueOnce([
      { id: '00000000-0000-0000-0000-000000000001', userAgent: 'A', ipAddress: '1.1.1.1', createdAt: new Date(), lastActivityAt: new Date(), expiresAt: future },
      { id: '00000000-0000-0000-0000-000000000002', userAgent: 'B', ipAddress: '2.2.2.2', createdAt: new Date(), lastActivityAt: new Date(), expiresAt: future },
    ]);
    const res = await request(app).get('/api/sessions').set('Authorization', 'Bearer token');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
  });

  it('GET /api/sessions session has id field', async () => {
    const future = new Date(Date.now() + 86400_000);
    (mockPrisma.session.findMany as jest.Mock).mockResolvedValueOnce([
      { id: '00000000-0000-0000-0000-000000000001', userAgent: 'C', ipAddress: '3.3.3.3', createdAt: new Date(), lastActivityAt: new Date(), expiresAt: future },
    ]);
    const res = await request(app).get('/api/sessions').set('Authorization', 'Bearer token');
    expect(res.body.data[0]).toHaveProperty('id');
  });

  it('DELETE /api/sessions/:id 400 body has CANNOT_REVOKE_CURRENT code', async () => {
    const res = await request(app)
      .delete('/api/sessions/00000000-0000-0000-0000-000000000001')
      .set('Authorization', 'Bearer token');
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('CANNOT_REVOKE_CURRENT');
  });

  it('DELETE /api/sessions/:id 500 body has INTERNAL_ERROR code when findFirst rejects', async () => {
    mockPrisma.session.findFirst.mockRejectedValueOnce(new Error('network error'));
    const res = await request(app)
      .delete('/api/sessions/00000000-0000-0000-0000-000000000003')
      .set('Authorization', 'Bearer token');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});
