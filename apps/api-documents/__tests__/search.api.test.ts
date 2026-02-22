import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: { docDocument: { findMany: jest.fn() } },
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

import router from '../src/routes/search';
import { prisma } from '../src/prisma';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const app = express();
app.use(express.json());
app.use('/api/search', router);
beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/search', () => {
  it('should return empty array when no query provided', async () => {
    const res = await request(app).get('/api/search');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual([]);
  });

  it('should return matching documents for a query', async () => {
    mockPrisma.docDocument.findMany.mockResolvedValue([
      { id: '1', title: 'Safety Policy', description: 'Health and safety policy document' },
      { id: '2', title: 'Safety Procedure', description: 'Procedure for safety checks' },
    ]);
    const res = await request(app).get('/api/search?q=safety');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.data[0].title).toBe('Safety Policy');
  });

  it('should return empty array when no documents match the query', async () => {
    mockPrisma.docDocument.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/search?q=nonexistent');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual([]);
  });

  it('should return 500 on database error', async () => {
    mockPrisma.docDocument.findMany.mockRejectedValue(new Error('DB error'));
    const res = await request(app).get('/api/search?q=test');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('should call findMany with correct orgId filter', async () => {
    mockPrisma.docDocument.findMany.mockResolvedValue([]);
    await request(app).get('/api/search?q=report');
    expect(mockPrisma.docDocument.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ orgId: 'org-1', deletedAt: null }),
      })
    );
  });

  it('findMany is NOT called when query is absent', async () => {
    const res = await request(app).get('/api/search');
    expect(res.status).toBe(200);
    expect(mockPrisma.docDocument.findMany).not.toHaveBeenCalled();
  });

  it('returns a single document result', async () => {
    mockPrisma.docDocument.findMany.mockResolvedValue([
      { id: 'd-1', title: 'ISO 9001 Manual', description: 'Quality management system manual' },
    ]);
    const res = await request(app).get('/api/search?q=ISO');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].title).toBe('ISO 9001 Manual');
  });

  it('findMany is called once when query is present', async () => {
    mockPrisma.docDocument.findMany.mockResolvedValue([]);
    await request(app).get('/api/search?q=policy');
    expect(mockPrisma.docDocument.findMany).toHaveBeenCalledTimes(1);
  });

  it('response data is an array', async () => {
    mockPrisma.docDocument.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/search?q=anything');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('success is true on 200 response', async () => {
    mockPrisma.docDocument.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/search?q=test');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('Search — extended', () => {
  it('returns multiple results matching the query', async () => {
    mockPrisma.docDocument.findMany.mockResolvedValue([
      { id: 'd-1', title: 'Doc A', description: 'desc a' },
      { id: 'd-2', title: 'Doc B', description: 'desc b' },
      { id: 'd-3', title: 'Doc C', description: 'desc c' },
    ]);
    const res = await request(app).get('/api/search?q=doc');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(3);
  });

  it('data length matches mock count', async () => {
    mockPrisma.docDocument.findMany.mockResolvedValue([
      { id: 'd-1', title: 'Alpha', description: 'alpha desc' },
      { id: 'd-2', title: 'Beta', description: 'beta desc' },
    ]);
    const res = await request(app).get('/api/search?q=alpha');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
  });

  it('success is false on 500', async () => {
    mockPrisma.docDocument.findMany.mockRejectedValue(new Error('unexpected error'));
    const res = await request(app).get('/api/search?q=error');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });

  it('returned documents have id and title fields', async () => {
    mockPrisma.docDocument.findMany.mockResolvedValue([
      { id: 'abc-123', title: 'Quality Manual', description: 'manual' },
    ]);
    const res = await request(app).get('/api/search?q=quality');
    expect(res.status).toBe(200);
    expect(res.body.data[0]).toHaveProperty('id');
    expect(res.body.data[0]).toHaveProperty('title');
  });

  it('findMany not called when q param is empty string', async () => {
    const res = await request(app).get('/api/search?q=');
    expect(res.status).toBe(200);
    expect(mockPrisma.docDocument.findMany).not.toHaveBeenCalled();
  });
});

// ─── Additional coverage ─────────────────────────────────────────────────────

describe('Search — additional coverage', () => {
  it('returns 401 when authenticate rejects the request', async () => {
    const { authenticate: mockAuth } = require('@ims/auth');
    (mockAuth as jest.Mock).mockImplementationOnce(
      (_req: any, res: any, _next: any) => {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'No token' } });
      }
    );
    const res = await request(app).get('/api/search?q=anything');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('returns empty array (not null) when q is absent — empty list response', async () => {
    const res = await request(app).get('/api/search');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).not.toBeNull();
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(0);
  });

  it('returns 500 with INTERNAL_ERROR code on DB failure', async () => {
    mockPrisma.docDocument.findMany.mockRejectedValue(new Error('connection refused'));
    const res = await request(app).get('/api/search?q=policy');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('each returned document has a description field', async () => {
    mockPrisma.docDocument.findMany.mockResolvedValue([
      { id: 'd-10', title: 'Environmental Policy', description: 'ISO 14001 policy doc' },
      { id: 'd-11', title: 'Safety Manual', description: 'Comprehensive safety guide' },
    ]);
    const res = await request(app).get('/api/search?q=policy');
    expect(res.status).toBe(200);
    for (const doc of res.body.data) {
      expect(doc).toHaveProperty('description');
    }
  });

  it('findMany called with OR filter containing both title and description', async () => {
    mockPrisma.docDocument.findMany.mockResolvedValue([]);
    await request(app).get('/api/search?q=manual');
    expect(mockPrisma.docDocument.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: expect.arrayContaining([
            expect.objectContaining({ title: expect.any(Object) }),
            expect.objectContaining({ description: expect.any(Object) }),
          ]),
        }),
      })
    );
  });
});

// ─── Search — take limit and response shape coverage ─────────────────────────

describe('Search — take limit and response shape coverage', () => {
  it('findMany called with take: 20 to enforce result limit', async () => {
    mockPrisma.docDocument.findMany.mockResolvedValue([]);
    await request(app).get('/api/search?q=limit');
    expect(mockPrisma.docDocument.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 20 }),
    );
  });

  it('findMany called with deletedAt: null to exclude soft-deleted docs', async () => {
    mockPrisma.docDocument.findMany.mockResolvedValue([]);
    await request(app).get('/api/search?q=active');
    expect(mockPrisma.docDocument.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ deletedAt: null }),
      }),
    );
  });

  it('response body has success property on 200', async () => {
    mockPrisma.docDocument.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/search?q=test');
    expect(res.body).toHaveProperty('success');
  });

  it('response body has data property on 200', async () => {
    mockPrisma.docDocument.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/search?q=test');
    expect(res.body).toHaveProperty('data');
  });

  it('500 response has error.message field', async () => {
    mockPrisma.docDocument.findMany.mockRejectedValue(new Error('DB fail'));
    const res = await request(app).get('/api/search?q=fail');
    expect(res.status).toBe(500);
    expect(res.body.error).toHaveProperty('message');
  });

  it('returns multiple documents with correct id and title fields', async () => {
    mockPrisma.docDocument.findMany.mockResolvedValue([
      { id: '00000000-0000-0000-0000-000000000010', title: 'Policy A', description: 'desc a' },
      { id: '00000000-0000-0000-0000-000000000011', title: 'Policy B', description: 'desc b' },
    ]);
    const res = await request(app).get('/api/search?q=policy');
    expect(res.status).toBe(200);
    expect(res.body.data[0].id).toBe('00000000-0000-0000-0000-000000000010');
    expect(res.body.data[1].id).toBe('00000000-0000-0000-0000-000000000011');
  });

  it('response content-type is JSON', async () => {
    mockPrisma.docDocument.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/search?q=json');
    expect(res.headers['content-type']).toMatch(/json/);
  });

  it('findMany called with orderBy: createdAt desc', async () => {
    mockPrisma.docDocument.findMany.mockResolvedValue([]);
    await request(app).get('/api/search?q=order');
    expect(mockPrisma.docDocument.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { createdAt: 'desc' } }),
    );
  });
});

describe('Search — additional query and response coverage', () => {
  it('GET /search?q=test response body is an object', async () => {
    mockPrisma.docDocument.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/search?q=test');
    expect(typeof res.body).toBe('object');
  });

  it('GET /search?q=multi returns data length matching mock', async () => {
    mockPrisma.docDocument.findMany.mockResolvedValue([
      { id: 'd-1', title: 'Doc A', description: 'desc a' },
      { id: 'd-2', title: 'Doc B', description: 'desc b' },
      { id: 'd-3', title: 'Doc C', description: 'desc c' },
      { id: 'd-4', title: 'Doc D', description: 'desc d' },
    ]);
    const res = await request(app).get('/api/search?q=multi');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(4);
  });

  it('GET /search?q=test findMany called with orgId filter', async () => {
    mockPrisma.docDocument.findMany.mockResolvedValue([]);
    await request(app).get('/api/search?q=test');
    expect(mockPrisma.docDocument.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ orgId: 'org-1' }) }),
    );
  });

  it('500 response success is false', async () => {
    mockPrisma.docDocument.findMany.mockRejectedValue(new Error('crash'));
    const res = await request(app).get('/api/search?q=crash');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });

  it('returns first document id correctly from mock', async () => {
    mockPrisma.docDocument.findMany.mockResolvedValue([
      { id: '00000000-0000-0000-0000-000000000099', title: 'First', description: 'desc' },
    ]);
    const res = await request(app).get('/api/search?q=first');
    expect(res.status).toBe(200);
    expect(res.body.data[0].id).toBe('00000000-0000-0000-0000-000000000099');
  });

  it('returns 200 with success:true even when q contains only letters', async () => {
    mockPrisma.docDocument.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/search?q=xyz');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET / without q param returns empty array not null', async () => {
    const res = await request(app).get('/api/search');
    expect(res.status).toBe(200);
    expect(res.body.data).not.toBeNull();
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
