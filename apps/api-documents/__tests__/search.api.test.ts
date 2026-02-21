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
