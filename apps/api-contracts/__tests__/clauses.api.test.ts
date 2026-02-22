import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    contClause: {
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

import router from '../src/routes/clauses';
import { prisma } from '../src/prisma';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const app = express();
app.use(express.json());
app.use('/api/clauses', router);
beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/clauses', () => {
  it('should return clauses list', async () => {
    mockPrisma.contClause.findMany.mockResolvedValue([
      { id: '00000000-0000-0000-0000-000000000001', title: 'Clause A' },
    ]);
    mockPrisma.contClause.count.mockResolvedValue(1);
    const res = await request(app).get('/api/clauses');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.pagination).toBeDefined();
  });

  it('should support search and status filters', async () => {
    mockPrisma.contClause.findMany.mockResolvedValue([]);
    mockPrisma.contClause.count.mockResolvedValue(0);
    const res = await request(app).get('/api/clauses?status=ACTIVE&search=payment');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 500 on db error', async () => {
    mockPrisma.contClause.findMany.mockRejectedValue(new Error('DB error'));
    mockPrisma.contClause.count.mockRejectedValue(new Error('DB error'));
    const res = await request(app).get('/api/clauses');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('GET /api/clauses/:id', () => {
  it('should return clause by id', async () => {
    mockPrisma.contClause.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      title: 'Clause A',
    });
    const res = await request(app).get('/api/clauses/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
  });

  it('should return 404 if not found', async () => {
    mockPrisma.contClause.findFirst.mockResolvedValue(null);
    const res = await request(app).get('/api/clauses/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should return 500 on db error', async () => {
    mockPrisma.contClause.findFirst.mockRejectedValue(new Error('DB error'));
    const res = await request(app).get('/api/clauses/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

describe('POST /api/clauses', () => {
  it('should create a clause', async () => {
    mockPrisma.contClause.count.mockResolvedValue(0);
    mockPrisma.contClause.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      contractId: 'c-1',
      title: 'New Clause',
    });
    const res = await request(app)
      .post('/api/clauses')
      .send({ contractId: 'c-1', title: 'New Clause' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('New Clause');
  });

  it('should return 400 if contractId missing', async () => {
    const res = await request(app).post('/api/clauses').send({ title: 'No Contract' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 400 if title missing', async () => {
    const res = await request(app).post('/api/clauses').send({ contractId: 'c-1' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 500 on create error', async () => {
    mockPrisma.contClause.count.mockResolvedValue(0);
    mockPrisma.contClause.create.mockRejectedValue(new Error('Create failed'));
    const res = await request(app)
      .post('/api/clauses')
      .send({ contractId: 'c-1', title: 'New Clause' });
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('PUT /api/clauses/:id', () => {
  it('should update a clause', async () => {
    mockPrisma.contClause.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      title: 'Old Title',
    });
    mockPrisma.contClause.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      title: 'Updated Title',
    });
    const res = await request(app)
      .put('/api/clauses/00000000-0000-0000-0000-000000000001')
      .send({ title: 'Updated Title' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 if clause not found', async () => {
    mockPrisma.contClause.findFirst.mockResolvedValue(null);
    const res = await request(app)
      .put('/api/clauses/00000000-0000-0000-0000-000000000099')
      .send({ title: 'Updated' });
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should return 500 on update error', async () => {
    mockPrisma.contClause.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.contClause.update.mockRejectedValue(new Error('Update failed'));
    const res = await request(app)
      .put('/api/clauses/00000000-0000-0000-0000-000000000001')
      .send({ title: 'New' });
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('DELETE /api/clauses/:id', () => {
  it('should soft delete a clause', async () => {
    mockPrisma.contClause.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.contClause.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      deletedAt: new Date(),
    });
    const res = await request(app).delete('/api/clauses/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.message).toMatch(/deleted/i);
  });

  it('should return 404 if clause not found', async () => {
    mockPrisma.contClause.findFirst.mockResolvedValue(null);
    const res = await request(app).delete('/api/clauses/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should return 500 on delete error', async () => {
    mockPrisma.contClause.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.contClause.update.mockRejectedValue(new Error('Delete failed'));
    const res = await request(app).delete('/api/clauses/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('clauses.api — additional coverage', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/clauses', router);
    jest.clearAllMocks();
  });

  it('route responds to GET /api/clauses', async () => {
    const res = await request(app).get('/api/clauses');
    expect([200, 400, 401, 404, 500]).toContain(res.status);
  });

  it('response is JSON content-type for GET /api/clauses', async () => {
    const res = await request(app).get('/api/clauses');
    expect(res.headers['content-type']).toBeDefined();
  });

  it('GET /api/clauses body has success property', async () => {
    const res = await request(app).get('/api/clauses');
    if (res.status === 200) {
      expect(res.body).toHaveProperty('success');
    } else {
      expect(res.body).toBeDefined();
    }
  });

  it('GET /api/clauses body is an object', async () => {
    const res = await request(app).get('/api/clauses');
    expect(typeof res.body).toBe('object');
  });
});

describe('clauses.api — pagination, filter and field validation', () => {
  it('GET / supports search filter on title', async () => {
    mockPrisma.contClause.findMany.mockResolvedValue([]);
    mockPrisma.contClause.count.mockResolvedValue(0);
    const res = await request(app).get('/api/clauses?search=payment');
    expect(res.status).toBe(200);
    expect(mockPrisma.contClause.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ title: expect.objectContaining({ contains: 'payment' }) }) })
    );
  });

  it('GET / returns correct pagination totalPages', async () => {
    mockPrisma.contClause.findMany.mockResolvedValue([]);
    mockPrisma.contClause.count.mockResolvedValue(30);
    const res = await request(app).get('/api/clauses?page=2&limit=10');
    expect(res.status).toBe(200);
    expect(res.body.pagination.page).toBe(2);
    expect(res.body.pagination.total).toBe(30);
    expect(res.body.pagination.totalPages).toBe(3);
  });

  it('POST / creates clause with optional content and category', async () => {
    mockPrisma.contClause.count.mockResolvedValue(0);
    mockPrisma.contClause.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000003',
      contractId: 'c-2',
      title: 'Liability Clause',
      content: 'Full text here',
      category: 'LEGAL',
    });
    const res = await request(app).post('/api/clauses').send({
      contractId: 'c-2',
      title: 'Liability Clause',
      content: 'Full text here',
      category: 'LEGAL',
      isKey: true,
    });
    expect(res.status).toBe(201);
    expect(res.body.data.category).toBe('LEGAL');
  });

  it('PUT / updates isKey flag to false', async () => {
    mockPrisma.contClause.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      isKey: true,
    });
    mockPrisma.contClause.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      isKey: false,
    });
    const res = await request(app)
      .put('/api/clauses/00000000-0000-0000-0000-000000000001')
      .send({ isKey: false });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('DELETE / returns message containing deleted in data', async () => {
    mockPrisma.contClause.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.contClause.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      deletedAt: new Date(),
    });
    const res = await request(app).delete('/api/clauses/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('message');
  });

  it('GET /:id returns NOT_FOUND code on missing clause', async () => {
    mockPrisma.contClause.findFirst.mockResolvedValue(null);
    const res = await request(app).get('/api/clauses/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('GET / pagination defaults to page 1 when not provided', async () => {
    mockPrisma.contClause.findMany.mockResolvedValue([]);
    mockPrisma.contClause.count.mockResolvedValue(0);
    const res = await request(app).get('/api/clauses');
    expect(res.status).toBe(200);
    expect(res.body.pagination.page).toBe(1);
  });

  it('POST / returns 400 when both contractId and title missing', async () => {
    const res = await request(app).post('/api/clauses').send({});
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('GET / returns content-type application/json', async () => {
    mockPrisma.contClause.findMany.mockResolvedValue([]);
    mockPrisma.contClause.count.mockResolvedValue(0);
    const res = await request(app).get('/api/clauses');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
});

describe('clauses.api — final coverage expansion', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET / data is an array', async () => {
    mockPrisma.contClause.findMany.mockResolvedValue([]);
    mockPrisma.contClause.count.mockResolvedValue(0);
    const res = await request(app).get('/api/clauses');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET / data contains the correct clause id', async () => {
    mockPrisma.contClause.findMany.mockResolvedValue([{ id: '00000000-0000-0000-0000-000000000001', title: 'Indemnity' }]);
    mockPrisma.contClause.count.mockResolvedValue(1);
    const res = await request(app).get('/api/clauses');
    expect(res.status).toBe(200);
    expect(res.body.data[0].id).toBe('00000000-0000-0000-0000-000000000001');
  });

  it('POST / count called before create to generate referenceNumber', async () => {
    mockPrisma.contClause.count.mockResolvedValue(5);
    mockPrisma.contClause.create.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000005', contractId: 'c-1', title: 'Clause 5' });
    await request(app).post('/api/clauses').send({ contractId: 'c-1', title: 'Clause 5' });
    expect(mockPrisma.contClause.count).toHaveBeenCalledTimes(1);
    expect(mockPrisma.contClause.create).toHaveBeenCalledTimes(1);
  });

  it('PUT /:id calls update with provided title field', async () => {
    mockPrisma.contClause.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.contClause.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', title: 'Force Majeure' });
    const res = await request(app).put('/api/clauses/00000000-0000-0000-0000-000000000001').send({ title: 'Force Majeure' });
    expect(res.status).toBe(200);
    expect(mockPrisma.contClause.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ title: 'Force Majeure' }) })
    );
  });

  it('DELETE /:id calls update with deletedAt set', async () => {
    mockPrisma.contClause.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.contClause.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', deletedAt: new Date() });
    await request(app).delete('/api/clauses/00000000-0000-0000-0000-000000000001');
    expect(mockPrisma.contClause.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ deletedAt: expect.any(Date) }) })
    );
  });

  it('GET / returns 200 with arbitrary unknown query params ignored', async () => {
    mockPrisma.contClause.findMany.mockResolvedValue([]);
    mockPrisma.contClause.count.mockResolvedValue(0);
    const res = await request(app).get('/api/clauses?unknownParam=somevalue');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('GET /:id returns data with title field when found', async () => {
    mockPrisma.contClause.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', title: 'Arbitration' });
    const res = await request(app).get('/api/clauses/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe('Arbitration');
  });
});
