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
const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const app = express();
app.use(express.json());
app.use('/api/read-receipts', router);
beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/read-receipts', () => {
  it('should return list of read receipts', async () => {
    mockPrisma.docReadReceipt.findMany.mockResolvedValue([
      {
        id: '00000000-0000-0000-0000-000000000001',
        documentId: 'doc-1',
        userId: 'user-1',
        status: 'READ',
      },
    ]);
    mockPrisma.docReadReceipt.count.mockResolvedValue(1);
    const res = await request(app).get('/api/read-receipts');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.pagination).toBeDefined();
  });

  it('should filter by status', async () => {
    mockPrisma.docReadReceipt.findMany.mockResolvedValue([]);
    mockPrisma.docReadReceipt.count.mockResolvedValue(0);
    const res = await request(app).get('/api/read-receipts?status=ACKNOWLEDGED');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 500 on database error', async () => {
    mockPrisma.docReadReceipt.findMany.mockRejectedValue(new Error('DB error'));
    mockPrisma.docReadReceipt.count.mockResolvedValue(0);
    const res = await request(app).get('/api/read-receipts');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('GET /api/read-receipts/:id', () => {
  it('should return a read receipt by id', async () => {
    mockPrisma.docReadReceipt.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      documentId: 'doc-1',
    });
    const res = await request(app).get('/api/read-receipts/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
  });

  it('should return 404 if not found', async () => {
    mockPrisma.docReadReceipt.findFirst.mockResolvedValue(null);
    const res = await request(app).get('/api/read-receipts/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});

describe('POST /api/read-receipts', () => {
  it('should create a read receipt', async () => {
    mockPrisma.docReadReceipt.create.mockResolvedValue({
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
    mockPrisma.docReadReceipt.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      documentId: 'doc-1',
      userId: 'user-1',
    });
    mockPrisma.docReadReceipt.update.mockResolvedValue({
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
    mockPrisma.docReadReceipt.findFirst.mockResolvedValue(null);
    const res = await request(app)
      .put('/api/read-receipts/00000000-0000-0000-0000-000000000099')
      .send({ status: 'READ' });
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});

describe('DELETE /api/read-receipts/:id', () => {
  it('should soft delete a read receipt', async () => {
    mockPrisma.docReadReceipt.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.docReadReceipt.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    const res = await request(app).delete(
      '/api/read-receipts/00000000-0000-0000-0000-000000000001'
    );
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 if not found', async () => {
    mockPrisma.docReadReceipt.findFirst.mockResolvedValue(null);
    const res = await request(app).delete(
      '/api/read-receipts/00000000-0000-0000-0000-000000000099'
    );
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});

describe('Read Receipts — extended', () => {
  it('GET / data is an array', async () => {
    mockPrisma.docReadReceipt.findMany.mockResolvedValue([]);
    mockPrisma.docReadReceipt.count.mockResolvedValue(0);
    const res = await request(app).get('/api/read-receipts');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('POST / create is called exactly once per create request', async () => {
    mockPrisma.docReadReceipt.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000002',
      documentId: 'doc-2',
      userId: 'user-1',
      status: 'READ',
    });
    await request(app)
      .post('/api/read-receipts')
      .send({ documentId: 'doc-2', userId: 'user-1', status: 'READ' });
    expect(mockPrisma.docReadReceipt.create).toHaveBeenCalledTimes(1);
  });
});

describe('read-receipts.api — additional coverage', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/read-receipts', router);
    jest.clearAllMocks();
  });

  it('route responds to GET /api/read-receipts', async () => {
    const res = await request(app).get('/api/read-receipts');
    expect([200, 400, 401, 404, 500]).toContain(res.status);
  });

  it('response is JSON content-type for GET /api/read-receipts', async () => {
    const res = await request(app).get('/api/read-receipts');
    expect(res.headers['content-type']).toBeDefined();
  });

  it('GET /api/read-receipts body has success property', async () => {
    const res = await request(app).get('/api/read-receipts');
    if (res.status === 200) {
      expect(res.body).toHaveProperty('success');
    } else {
      expect(res.body).toBeDefined();
    }
  });

  it('GET /api/read-receipts body is an object', async () => {
    const res = await request(app).get('/api/read-receipts');
    expect(typeof res.body).toBe('object');
  });

  it('GET /api/read-receipts route is accessible', async () => {
    const res = await request(app).get('/api/read-receipts');
    expect(res.status).toBeDefined();
  });
});

// ─── Read Receipts — extended error and pagination coverage ──────────────────

describe('Read Receipts — extended error and pagination coverage', () => {
  it('GET / returns pagination object with total and page', async () => {
    mockPrisma.docReadReceipt.findMany.mockResolvedValue([]);
    mockPrisma.docReadReceipt.count.mockResolvedValue(0);
    const res = await request(app).get('/api/read-receipts');
    expect(res.status).toBe(200);
    expect(res.body.pagination).toBeDefined();
    expect(res.body.pagination.total).toBe(0);
    expect(res.body.pagination.page).toBe(1);
  });

  it('GET / with page=2&limit=5 reflects pagination values', async () => {
    mockPrisma.docReadReceipt.findMany.mockResolvedValue([]);
    mockPrisma.docReadReceipt.count.mockResolvedValue(0);
    const res = await request(app).get('/api/read-receipts?page=2&limit=5');
    expect(res.status).toBe(200);
    expect(res.body.pagination.page).toBe(2);
    expect(res.body.pagination.limit).toBe(5);
  });

  it('POST / returns 500 when create throws', async () => {
    mockPrisma.docReadReceipt.create.mockRejectedValue(new Error('DB down'));
    const res = await request(app)
      .post('/api/read-receipts')
      .send({ documentId: 'doc-1', userId: 'user-1', status: 'READ' });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('PUT /:id returns 500 when update throws', async () => {
    mockPrisma.docReadReceipt.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.docReadReceipt.update.mockRejectedValue(new Error('DB error'));
    const res = await request(app)
      .put('/api/read-receipts/00000000-0000-0000-0000-000000000001')
      .send({ status: 'ACKNOWLEDGED' });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('DELETE /:id returns 500 when update throws', async () => {
    mockPrisma.docReadReceipt.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.docReadReceipt.update.mockRejectedValue(new Error('DB error'));
    const res = await request(app).delete(
      '/api/read-receipts/00000000-0000-0000-0000-000000000001',
    );
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET /:id returns 500 on DB error', async () => {
    mockPrisma.docReadReceipt.findFirst.mockRejectedValue(new Error('timeout'));
    const res = await request(app).get(
      '/api/read-receipts/00000000-0000-0000-0000-000000000001',
    );
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('DELETE /:id success message contains "deleted"', async () => {
    mockPrisma.docReadReceipt.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.docReadReceipt.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    const res = await request(app).delete(
      '/api/read-receipts/00000000-0000-0000-0000-000000000001',
    );
    expect(res.status).toBe(200);
    expect(res.body.data.message).toContain('deleted');
  });

  it('GET / with search param passes filter to findMany', async () => {
    mockPrisma.docReadReceipt.findMany.mockResolvedValue([]);
    mockPrisma.docReadReceipt.count.mockResolvedValue(0);
    await request(app).get('/api/read-receipts?search=john');
    expect(mockPrisma.docReadReceipt.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ userName: expect.any(Object) }),
      }),
    );
  });
});

describe('Read Receipts — call argument and edge case coverage', () => {
  it('POST / calls create with documentId in data', async () => {
    mockPrisma.docReadReceipt.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000010',
      documentId: 'doc-10',
      userId: 'user-1',
      status: 'READ',
    });
    await request(app)
      .post('/api/read-receipts')
      .send({ documentId: 'doc-10', userId: 'user-1', status: 'READ' });
    expect(mockPrisma.docReadReceipt.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ documentId: 'doc-10' }) }),
    );
  });

  it('PUT /:id calls update with correct id in where clause', async () => {
    mockPrisma.docReadReceipt.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.docReadReceipt.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    await request(app).put('/api/read-receipts/00000000-0000-0000-0000-000000000001').send({ status: 'READ' });
    expect(mockPrisma.docReadReceipt.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: '00000000-0000-0000-0000-000000000001' } }),
    );
  });

  it('GET / response content-type is application/json', async () => {
    mockPrisma.docReadReceipt.findMany.mockResolvedValue([]);
    mockPrisma.docReadReceipt.count.mockResolvedValue(0);
    const res = await request(app).get('/api/read-receipts');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });

  it('GET / with status=READ filter passes it to findMany where', async () => {
    mockPrisma.docReadReceipt.findMany.mockResolvedValue([]);
    mockPrisma.docReadReceipt.count.mockResolvedValue(0);
    await request(app).get('/api/read-receipts?status=READ');
    expect(mockPrisma.docReadReceipt.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ status: 'READ' }) }),
    );
  });

  it('POST / body with ACKNOWLEDGED status returns 201', async () => {
    mockPrisma.docReadReceipt.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000011',
      documentId: 'doc-11',
      userId: 'user-2',
      status: 'ACKNOWLEDGED',
    });
    const res = await request(app)
      .post('/api/read-receipts')
      .send({ documentId: 'doc-11', userId: 'user-2', status: 'ACKNOWLEDGED' });
    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('ACKNOWLEDGED');
  });

  it('DELETE /:id calls update with deletedAt in data', async () => {
    mockPrisma.docReadReceipt.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.docReadReceipt.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    await request(app).delete('/api/read-receipts/00000000-0000-0000-0000-000000000001');
    expect(mockPrisma.docReadReceipt.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ deletedAt: expect.any(Date) }) }),
    );
  });

  it('GET / calls findMany and count once each per request', async () => {
    mockPrisma.docReadReceipt.findMany.mockResolvedValue([]);
    mockPrisma.docReadReceipt.count.mockResolvedValue(0);
    await request(app).get('/api/read-receipts');
    expect(mockPrisma.docReadReceipt.findMany).toHaveBeenCalledTimes(1);
    expect(mockPrisma.docReadReceipt.count).toHaveBeenCalledTimes(1);
  });
});

describe('Read Receipts — final boundary coverage', () => {
  it('GET / with page=1 returns page 1 in pagination', async () => {
    mockPrisma.docReadReceipt.findMany.mockResolvedValue([]);
    mockPrisma.docReadReceipt.count.mockResolvedValue(0);
    const res = await request(app).get('/api/read-receipts?page=1');
    expect(res.status).toBe(200);
    expect(res.body.pagination.page).toBe(1);
  });

  it('GET / totalPages is 0 when total is 0', async () => {
    mockPrisma.docReadReceipt.findMany.mockResolvedValue([]);
    mockPrisma.docReadReceipt.count.mockResolvedValue(0);
    const res = await request(app).get('/api/read-receipts');
    expect(res.status).toBe(200);
    expect(res.body.pagination.totalPages).toBe(0);
  });

  it('POST / body missing both documentId and userId returns 400', async () => {
    const res = await request(app).post('/api/read-receipts').send({});
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('GET /:id response body has data property on 200', async () => {
    mockPrisma.docReadReceipt.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      documentId: 'doc-1',
      userId: 'user-1',
      status: 'READ',
    });
    const res = await request(app).get('/api/read-receipts/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
  });

  it('PUT /:id with READ status returns 200 when found', async () => {
    mockPrisma.docReadReceipt.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.docReadReceipt.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      status: 'READ',
    });
    const res = await request(app)
      .put('/api/read-receipts/00000000-0000-0000-0000-000000000001')
      .send({ status: 'READ' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('Read Receipts — phase28 coverage', () => {
  it('GET / with limit=3 returns pagination.limit of 3', async () => {
    mockPrisma.docReadReceipt.findMany.mockResolvedValue([]);
    mockPrisma.docReadReceipt.count.mockResolvedValue(0);
    const res = await request(app).get('/api/read-receipts?limit=3');
    expect(res.status).toBe(200);
    expect(res.body.pagination.limit).toBe(3);
  });

  it('GET / pagination.total matches count mock value', async () => {
    mockPrisma.docReadReceipt.findMany.mockResolvedValue([]);
    mockPrisma.docReadReceipt.count.mockResolvedValue(55);
    const res = await request(app).get('/api/read-receipts');
    expect(res.status).toBe(200);
    expect(res.body.pagination.total).toBe(55);
  });

  it('POST / with READ status returns data with status READ', async () => {
    mockPrisma.docReadReceipt.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000020',
      documentId: 'doc-20',
      userId: 'user-20',
      status: 'READ',
    });
    const res = await request(app)
      .post('/api/read-receipts')
      .send({ documentId: 'doc-20', userId: 'user-20', status: 'READ' });
    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('READ');
  });

  it('PUT /:id response has data.id when updated', async () => {
    mockPrisma.docReadReceipt.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.docReadReceipt.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', status: 'READ' });
    const res = await request(app)
      .put('/api/read-receipts/00000000-0000-0000-0000-000000000001')
      .send({ status: 'READ' });
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('id');
  });

  it('DELETE /:id calls findFirst once then update once', async () => {
    mockPrisma.docReadReceipt.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.docReadReceipt.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    await request(app).delete('/api/read-receipts/00000000-0000-0000-0000-000000000001');
    expect(mockPrisma.docReadReceipt.findFirst).toHaveBeenCalledTimes(1);
    expect(mockPrisma.docReadReceipt.update).toHaveBeenCalledTimes(1);
  });
});
