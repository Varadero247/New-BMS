import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    docReadReceipt: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
  },
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

import router from '../src/routes/read-receipts';
import { prisma } from '../src/prisma';
const app = express();
app.use(express.json());
app.use('/api/read-receipts', router);
beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/read-receipts', () => {
  it('should return list of read receipts', async () => {
    (prisma as any).docReadReceipt.findMany.mockResolvedValue([
      {
        id: '00000000-0000-0000-0000-000000000001',
        documentId: 'doc-1',
        userId: 'user-1',
        status: 'READ',
      },
    ]);
    (prisma as any).docReadReceipt.count.mockResolvedValue(1);
    const res = await request(app).get('/api/read-receipts');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.pagination).toBeDefined();
  });

  it('should filter by status', async () => {
    (prisma as any).docReadReceipt.findMany.mockResolvedValue([]);
    (prisma as any).docReadReceipt.count.mockResolvedValue(0);
    const res = await request(app).get('/api/read-receipts?status=ACKNOWLEDGED');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 500 on database error', async () => {
    (prisma as any).docReadReceipt.findMany.mockRejectedValue(new Error('DB error'));
    (prisma as any).docReadReceipt.count.mockResolvedValue(0);
    const res = await request(app).get('/api/read-receipts');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('GET /api/read-receipts/:id', () => {
  it('should return a read receipt by id', async () => {
    (prisma as any).docReadReceipt.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      documentId: 'doc-1',
    });
    const res = await request(app).get('/api/read-receipts/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
  });

  it('should return 404 if not found', async () => {
    (prisma as any).docReadReceipt.findFirst.mockResolvedValue(null);
    const res = await request(app).get('/api/read-receipts/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});

describe('POST /api/read-receipts', () => {
  it('should create a read receipt', async () => {
    (prisma as any).docReadReceipt.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      documentId: 'doc-1',
      userId: 'user-1',
      status: 'READ',
    });
    const res = await request(app)
      .post('/api/read-receipts')
      .send({ documentId: 'doc-1', userId: 'user-1', status: 'READ' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
  });

  it('should return 400 if documentId is missing', async () => {
    const res = await request(app).post('/api/read-receipts').send({ userId: 'user-1' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 400 if userId is missing', async () => {
    const res = await request(app).post('/api/read-receipts').send({ documentId: 'doc-1' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 400 on invalid status enum', async () => {
    const res = await request(app)
      .post('/api/read-receipts')
      .send({ documentId: 'doc-1', userId: 'user-1', status: 'INVALID_STATUS' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('PUT /api/read-receipts/:id', () => {
  it('should update a read receipt', async () => {
    (prisma as any).docReadReceipt.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      documentId: 'doc-1',
      userId: 'user-1',
    });
    (prisma as any).docReadReceipt.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      documentId: 'doc-1',
      userId: 'user-1',
      status: 'ACKNOWLEDGED',
    });
    const res = await request(app)
      .put('/api/read-receipts/00000000-0000-0000-0000-000000000001')
      .send({ status: 'ACKNOWLEDGED' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 if not found', async () => {
    (prisma as any).docReadReceipt.findFirst.mockResolvedValue(null);
    const res = await request(app)
      .put('/api/read-receipts/00000000-0000-0000-0000-000000000099')
      .send({ status: 'READ' });
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});

describe('DELETE /api/read-receipts/:id', () => {
  it('should soft delete a read receipt', async () => {
    (prisma as any).docReadReceipt.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    (prisma as any).docReadReceipt.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    const res = await request(app).delete(
      '/api/read-receipts/00000000-0000-0000-0000-000000000001'
    );
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 if not found', async () => {
    (prisma as any).docReadReceipt.findFirst.mockResolvedValue(null);
    const res = await request(app).delete(
      '/api/read-receipts/00000000-0000-0000-0000-000000000099'
    );
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});
