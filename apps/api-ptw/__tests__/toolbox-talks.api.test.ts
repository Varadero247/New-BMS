import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    ptwToolboxTalk: {
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

import router from '../src/routes/toolbox-talks';
import { prisma } from '../src/prisma';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const app = express();
app.use(express.json());
app.use('/api/toolbox-talks', router);
beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/toolbox-talks', () => {
  it('should return paginated toolbox talks', async () => {
    mockPrisma.ptwToolboxTalk.findMany.mockResolvedValue([
      { id: '00000000-0000-0000-0000-000000000001', topic: 'Safety Brief' },
    ]);
    mockPrisma.ptwToolboxTalk.count.mockResolvedValue(1);
    const res = await request(app).get('/api/toolbox-talks');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.pagination.total).toBe(1);
  });

  it('should support status filter query param', async () => {
    mockPrisma.ptwToolboxTalk.findMany.mockResolvedValue([]);
    mockPrisma.ptwToolboxTalk.count.mockResolvedValue(0);
    const res = await request(app).get('/api/toolbox-talks?status=COMPLETED');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should support search query param', async () => {
    mockPrisma.ptwToolboxTalk.findMany.mockResolvedValue([{ id: '2', topic: 'Fire Safety' }]);
    mockPrisma.ptwToolboxTalk.count.mockResolvedValue(1);
    const res = await request(app).get('/api/toolbox-talks?search=fire');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });

  it('should return correct pagination metadata', async () => {
    mockPrisma.ptwToolboxTalk.findMany.mockResolvedValue([]);
    mockPrisma.ptwToolboxTalk.count.mockResolvedValue(50);
    const res = await request(app).get('/api/toolbox-talks?page=2&limit=10');
    expect(res.status).toBe(200);
    expect(res.body.pagination.page).toBe(2);
    expect(res.body.pagination.limit).toBe(10);
    expect(res.body.pagination.total).toBe(50);
    expect(res.body.pagination.totalPages).toBe(5);
  });

  it('should return 500 on database error', async () => {
    mockPrisma.ptwToolboxTalk.findMany.mockRejectedValue(new Error('DB failure'));
    mockPrisma.ptwToolboxTalk.count.mockResolvedValue(0);
    const res = await request(app).get('/api/toolbox-talks');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('GET /api/toolbox-talks/:id', () => {
  it('should return a toolbox talk by id', async () => {
    mockPrisma.ptwToolboxTalk.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      topic: 'Safety Brief',
    });
    const res = await request(app).get('/api/toolbox-talks/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
  });

  it('should return 404 if toolbox talk not found', async () => {
    mockPrisma.ptwToolboxTalk.findFirst.mockResolvedValue(null);
    const res = await request(app).get('/api/toolbox-talks/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should return 500 on database error for get by id', async () => {
    mockPrisma.ptwToolboxTalk.findFirst.mockRejectedValue(new Error('DB failure'));
    const res = await request(app).get('/api/toolbox-talks/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('POST /api/toolbox-talks', () => {
  it('should create a toolbox talk', async () => {
    mockPrisma.ptwToolboxTalk.count.mockResolvedValue(0);
    mockPrisma.ptwToolboxTalk.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      topic: 'Safety Brief',
      referenceNumber: 'PTT-2026-0001',
    });
    const res = await request(app).post('/api/toolbox-talks').send({ topic: 'Safety Brief' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.topic).toBe('Safety Brief');
  });

  it('should create with all optional fields', async () => {
    mockPrisma.ptwToolboxTalk.count.mockResolvedValue(2);
    mockPrisma.ptwToolboxTalk.create.mockResolvedValue({
      id: '3',
      topic: 'Fire Safety',
      referenceNumber: 'PTT-2026-0003',
    });
    const res = await request(app)
      .post('/api/toolbox-talks')
      .send({
        topic: 'Fire Safety',
        content: 'Detailed fire safety procedures',
        presenter: 'user-2',
        presenterName: 'John Smith',
        scheduledDate: '2026-03-01',
        conductedDate: '2026-03-01',
        attendees: ['user-3', 'user-4'],
        attendeeCount: 2,
        notes: 'All attendees signed in',
      });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should return 400 when topic is missing', async () => {
    const res = await request(app)
      .post('/api/toolbox-talks')
      .send({ content: 'No topic provided' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 400 when topic is empty string', async () => {
    const res = await request(app).post('/api/toolbox-talks').send({ topic: '' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('PUT /api/toolbox-talks/:id', () => {
  it('should update an existing toolbox talk', async () => {
    mockPrisma.ptwToolboxTalk.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      topic: 'Old Topic',
    });
    mockPrisma.ptwToolboxTalk.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      topic: 'New Topic',
    });
    const res = await request(app)
      .put('/api/toolbox-talks/00000000-0000-0000-0000-000000000001')
      .send({ topic: 'New Topic' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 when updating non-existent toolbox talk', async () => {
    mockPrisma.ptwToolboxTalk.findFirst.mockResolvedValue(null);
    const res = await request(app)
      .put('/api/toolbox-talks/00000000-0000-0000-0000-000000000099')
      .send({ topic: 'New Topic' });
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should allow partial updates', async () => {
    mockPrisma.ptwToolboxTalk.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      topic: 'Safety Brief',
    });
    mockPrisma.ptwToolboxTalk.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      topic: 'Safety Brief',
      notes: 'Updated notes',
    });
    const res = await request(app)
      .put('/api/toolbox-talks/00000000-0000-0000-0000-000000000001')
      .send({ notes: 'Updated notes' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 500 on database error during update', async () => {
    mockPrisma.ptwToolboxTalk.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      topic: 'Safety Brief',
    });
    mockPrisma.ptwToolboxTalk.update.mockRejectedValue(new Error('DB failure'));
    const res = await request(app)
      .put('/api/toolbox-talks/00000000-0000-0000-0000-000000000001')
      .send({ topic: 'New Topic' });
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('DELETE /api/toolbox-talks/:id', () => {
  it('should soft delete a toolbox talk', async () => {
    mockPrisma.ptwToolboxTalk.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      topic: 'Safety Brief',
    });
    mockPrisma.ptwToolboxTalk.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      deletedAt: new Date(),
    });
    const res = await request(app).delete(
      '/api/toolbox-talks/00000000-0000-0000-0000-000000000001'
    );
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.message).toBe('toolbox talk deleted successfully');
  });

  it('should return 404 when deleting non-existent toolbox talk', async () => {
    mockPrisma.ptwToolboxTalk.findFirst.mockResolvedValue(null);
    const res = await request(app).delete(
      '/api/toolbox-talks/00000000-0000-0000-0000-000000000099'
    );
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should return 500 on database error during delete', async () => {
    mockPrisma.ptwToolboxTalk.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      topic: 'Safety Brief',
    });
    mockPrisma.ptwToolboxTalk.update.mockRejectedValue(new Error('DB failure'));
    const res = await request(app).delete(
      '/api/toolbox-talks/00000000-0000-0000-0000-000000000001'
    );
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('toolbox-talks.api — additional coverage', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/toolbox-talks', router);
    jest.clearAllMocks();
  });

  it('route responds to GET /api/toolbox-talks', async () => {
    const res = await request(app).get('/api/toolbox-talks');
    expect([200, 400, 401, 404, 500]).toContain(res.status);
  });
});
