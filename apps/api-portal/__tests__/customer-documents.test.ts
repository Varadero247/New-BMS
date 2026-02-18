import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    portalDocument: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
  },
  Prisma: { Decimal: jest.fn((v: any) => v) },
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

import customerDocumentsRouter from '../src/routes/customer-documents';
import { prisma } from '../src/prisma';

const app = express();
app.use(express.json());
app.use('/api/customer/documents', customerDocumentsRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/customer/documents', () => {
  it('should list shared documents', async () => {
    const items = [
      { id: '00000000-0000-0000-0000-000000000001', title: 'Spec Sheet', category: 'SPECIFICATION', visibility: 'PUBLIC' },
      { id: 'd-2', title: 'Contract', category: 'CONTRACT', visibility: 'SHARED' },
    ];
    (prisma as any).portalDocument.findMany.mockResolvedValue(items);
    (prisma as any).portalDocument.count.mockResolvedValue(2);

    const res = await request(app).get('/api/customer/documents');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(2);
  });

  it('should filter by category', async () => {
    (prisma as any).portalDocument.findMany.mockResolvedValue([]);
    (prisma as any).portalDocument.count.mockResolvedValue(0);

    const res = await request(app).get('/api/customer/documents?category=CONTRACT');

    expect(res.status).toBe(200);
    expect((prisma as any).portalDocument.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ category: 'CONTRACT' }) })
    );
  });

  it('should handle pagination', async () => {
    (prisma as any).portalDocument.findMany.mockResolvedValue([]);
    (prisma as any).portalDocument.count.mockResolvedValue(50);

    const res = await request(app).get('/api/customer/documents?page=3&limit=10');

    expect(res.status).toBe(200);
    expect(res.body.pagination.totalPages).toBe(5);
  });

  it('should handle server error', async () => {
    (prisma as any).portalDocument.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/customer/documents');

    expect(res.status).toBe(500);
  });
});

describe('GET /api/customer/documents/:id', () => {
  it('should return a document', async () => {
    const doc = { id: '00000000-0000-0000-0000-000000000001', title: 'Spec Sheet', visibility: 'PUBLIC', portalType: 'CUSTOMER' };
    (prisma as any).portalDocument.findFirst.mockResolvedValue(doc);

    const res = await request(app).get('/api/customer/documents/00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
  });

  it('should return 404 if not found', async () => {
    (prisma as any).portalDocument.findFirst.mockResolvedValue(null);

    const res = await request(app).get('/api/customer/documents/00000000-0000-0000-0000-000000000099');

    expect(res.status).toBe(404);
  });

  it('should handle server error on fetch', async () => {
    (prisma as any).portalDocument.findFirst.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/customer/documents/00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(500);
  });

  it('should return pagination info', async () => {
    (prisma as any).portalDocument.findMany.mockResolvedValue([]);
    (prisma as any).portalDocument.count.mockResolvedValue(0);

    const res = await request(app).get('/api/customer/documents');

    expect(res.body.pagination).toHaveProperty('page');
    expect(res.body.pagination).toHaveProperty('limit');
  });
});
