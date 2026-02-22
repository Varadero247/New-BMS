import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    boardPack: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
  },
  Prisma: {},
}));

jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((req: any, _res: any, next: any) => {
    req.user = { id: 'user-1', orgId: 'org-1', role: 'ADMIN' };
    next();
  }),
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

import router from '../src/routes/board-packs';
import { prisma } from '../src/prisma';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const app = express();
app.use(express.json());
app.use('/api/board-packs', router);

beforeEach(() => {
  jest.clearAllMocks();
});

// ===================================================================
// GET /api/board-packs — List board packs
// ===================================================================
describe('GET /api/board-packs', () => {
  it('should return a paginated list of board packs', async () => {
    const boardPacks = [
      { id: '00000000-0000-0000-0000-000000000001', status: 'DRAFT', generatedAt: new Date() },
      { id: 'bp-2', status: 'FINAL', generatedAt: new Date() },
    ];
    mockPrisma.boardPack.findMany.mockResolvedValue(boardPacks);
    mockPrisma.boardPack.count.mockResolvedValue(2);

    const res = await request(app).get('/api/board-packs');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.boardPacks).toHaveLength(2);
    expect(res.body.data.pagination.total).toBe(2);
    expect(res.body.data.pagination.page).toBe(1);
  });

  it('should support pagination query params', async () => {
    mockPrisma.boardPack.findMany.mockResolvedValue([]);
    mockPrisma.boardPack.count.mockResolvedValue(0);

    const res = await request(app).get('/api/board-packs?page=2&limit=5');

    expect(res.status).toBe(200);
    expect(res.body.data.pagination.page).toBe(2);
    expect(res.body.data.pagination.limit).toBe(5);
  });

  it('boardPacks is an array', async () => {
    mockPrisma.boardPack.findMany.mockResolvedValue([]);
    mockPrisma.boardPack.count.mockResolvedValue(0);
    const res = await request(app).get('/api/board-packs');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.boardPacks)).toBe(true);
  });

  it('findMany and count are each called once per request', async () => {
    mockPrisma.boardPack.findMany.mockResolvedValue([]);
    mockPrisma.boardPack.count.mockResolvedValue(0);
    await request(app).get('/api/board-packs');
    expect(mockPrisma.boardPack.findMany).toHaveBeenCalledTimes(1);
    expect(mockPrisma.boardPack.count).toHaveBeenCalledTimes(1);
  });

  it('should handle server errors', async () => {
    mockPrisma.boardPack.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/board-packs');

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

// ===================================================================
// GET /api/board-packs/:id — Get single board pack
// ===================================================================
describe('GET /api/board-packs/:id', () => {
  it('should return a board pack by ID', async () => {
    const boardPack = {
      id: '00000000-0000-0000-0000-000000000001',
      status: 'DRAFT',
      generatedAt: new Date(),
    };
    mockPrisma.boardPack.findUnique.mockResolvedValue(boardPack);

    const res = await request(app).get('/api/board-packs/00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
  });

  it('should return 404 for a non-existent board pack', async () => {
    mockPrisma.boardPack.findUnique.mockResolvedValue(null);

    const res = await request(app).get('/api/board-packs/00000000-0000-0000-0000-000000000099');

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should handle server errors', async () => {
    mockPrisma.boardPack.findUnique.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/board-packs/00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

// ===================================================================
// PATCH /api/board-packs/:id — Update status
// ===================================================================
describe('PATCH /api/board-packs/:id', () => {
  it('should transition DRAFT to FINAL', async () => {
    const existing = { id: '00000000-0000-0000-0000-000000000001', status: 'DRAFT' };
    const updated = { id: '00000000-0000-0000-0000-000000000001', status: 'FINAL' };
    mockPrisma.boardPack.findUnique.mockResolvedValue(existing);
    mockPrisma.boardPack.update.mockResolvedValue(updated);

    const res = await request(app)
      .patch('/api/board-packs/00000000-0000-0000-0000-000000000001')
      .send({ status: 'FINAL' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('FINAL');
  });

  it('should transition FINAL to DISTRIBUTED', async () => {
    const existing = { id: '00000000-0000-0000-0000-000000000001', status: 'FINAL' };
    const updated = { id: '00000000-0000-0000-0000-000000000001', status: 'DISTRIBUTED' };
    mockPrisma.boardPack.findUnique.mockResolvedValue(existing);
    mockPrisma.boardPack.update.mockResolvedValue(updated);

    const res = await request(app)
      .patch('/api/board-packs/00000000-0000-0000-0000-000000000001')
      .send({ status: 'DISTRIBUTED' });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('DISTRIBUTED');
  });

  it('should reject invalid status transition (DRAFT to DISTRIBUTED)', async () => {
    const existing = { id: '00000000-0000-0000-0000-000000000001', status: 'DRAFT' };
    mockPrisma.boardPack.findUnique.mockResolvedValue(existing);

    const res = await request(app)
      .patch('/api/board-packs/00000000-0000-0000-0000-000000000001')
      .send({ status: 'DISTRIBUTED' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_TRANSITION');
  });

  it('should reject transition from DISTRIBUTED', async () => {
    const existing = { id: '00000000-0000-0000-0000-000000000001', status: 'DISTRIBUTED' };
    mockPrisma.boardPack.findUnique.mockResolvedValue(existing);

    const res = await request(app)
      .patch('/api/board-packs/00000000-0000-0000-0000-000000000001')
      .send({ status: 'DRAFT' });

    expect(res.status).toBe(400);
  });

  it('should return 404 for a non-existent board pack', async () => {
    mockPrisma.boardPack.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .patch('/api/board-packs/00000000-0000-0000-0000-000000000099')
      .send({ status: 'FINAL' });

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should return 400 for invalid status value', async () => {
    const existing = { id: '00000000-0000-0000-0000-000000000001', status: 'DRAFT' };
    mockPrisma.boardPack.findUnique.mockResolvedValue(existing);

    const res = await request(app)
      .patch('/api/board-packs/00000000-0000-0000-0000-000000000001')
      .send({ status: 'INVALID_STATUS' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should handle server errors', async () => {
    mockPrisma.boardPack.findUnique.mockRejectedValue(new Error('DB error'));

    const res = await request(app)
      .patch('/api/board-packs/00000000-0000-0000-0000-000000000001')
      .send({ status: 'FINAL' });

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('board-packs.api.test.ts — additional coverage', () => {
  it('GET /api/board-packs returns empty boardPacks array when none exist', async () => {
    mockPrisma.boardPack.findMany.mockResolvedValue([]);
    mockPrisma.boardPack.count.mockResolvedValue(0);
    const res = await request(app).get('/api/board-packs');
    expect(res.status).toBe(200);
    expect(res.body.data.boardPacks).toHaveLength(0);
    expect(res.body.data.pagination.total).toBe(0);
  });

  it('PATCH /api/board-packs/:id rejects invalid enum status with VALIDATION_ERROR', async () => {
    const existing = { id: '00000000-0000-0000-0000-000000000001', status: 'DRAFT' };
    mockPrisma.boardPack.findUnique.mockResolvedValue(existing);
    const res = await request(app)
      .patch('/api/board-packs/00000000-0000-0000-0000-000000000001')
      .send({ status: 'PENDING' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('GET /api/board-packs with very large page number returns 200 and empty list', async () => {
    mockPrisma.boardPack.findMany.mockResolvedValue([]);
    mockPrisma.boardPack.count.mockResolvedValue(3);
    const res = await request(app).get('/api/board-packs?page=9999&limit=20');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.boardPacks)).toBe(true);
  });

  it('GET /api/board-packs with page=0 defaults to page 1 (no crash)', async () => {
    mockPrisma.boardPack.findMany.mockResolvedValue([]);
    mockPrisma.boardPack.count.mockResolvedValue(0);
    const res = await request(app).get('/api/board-packs?page=0');
    expect(res.status).toBe(200);
    expect(res.body.data.pagination.page).toBeGreaterThanOrEqual(1);
  });

  it('PATCH /api/board-packs/:id with missing status field returns 400', async () => {
    const existing = { id: '00000000-0000-0000-0000-000000000001', status: 'DRAFT' };
    mockPrisma.boardPack.findUnique.mockResolvedValue(existing);
    const res = await request(app)
      .patch('/api/board-packs/00000000-0000-0000-0000-000000000001')
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('board-packs.api — extended edge cases', () => {
  it('GET /api/board-packs returns success:true', async () => {
    mockPrisma.boardPack.findMany.mockResolvedValue([]);
    mockPrisma.boardPack.count.mockResolvedValue(0);
    const res = await request(app).get('/api/board-packs');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('GET /api/board-packs pagination has limit field', async () => {
    mockPrisma.boardPack.findMany.mockResolvedValue([]);
    mockPrisma.boardPack.count.mockResolvedValue(0);
    const res = await request(app).get('/api/board-packs?limit=10');
    expect(res.status).toBe(200);
    expect(res.body.data.pagination.limit).toBe(10);
  });

  it('GET /api/board-packs/:id returns 500 on DB error with INTERNAL_ERROR code', async () => {
    mockPrisma.boardPack.findUnique.mockRejectedValue(new Error('connection lost'));
    const res = await request(app).get('/api/board-packs/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('PATCH /api/board-packs/:id with valid DRAFT to FINAL updates status', async () => {
    mockPrisma.boardPack.findUnique.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', status: 'DRAFT' });
    mockPrisma.boardPack.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', status: 'FINAL' });
    const res = await request(app)
      .patch('/api/board-packs/00000000-0000-0000-0000-000000000001')
      .send({ status: 'FINAL' });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('FINAL');
  });

  it('PATCH /api/board-packs/:id calls update once on valid transition', async () => {
    mockPrisma.boardPack.findUnique.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', status: 'DRAFT' });
    mockPrisma.boardPack.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', status: 'FINAL' });
    await request(app)
      .patch('/api/board-packs/00000000-0000-0000-0000-000000000001')
      .send({ status: 'FINAL' });
    expect(mockPrisma.boardPack.update).toHaveBeenCalledTimes(1);
  });

  it('PATCH /api/board-packs/:id does NOT call update on invalid transition', async () => {
    mockPrisma.boardPack.findUnique.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', status: 'DRAFT' });
    await request(app)
      .patch('/api/board-packs/00000000-0000-0000-0000-000000000001')
      .send({ status: 'DISTRIBUTED' });
    expect(mockPrisma.boardPack.update).not.toHaveBeenCalled();
  });

  it('GET /api/board-packs returns boardPacks array with correct id', async () => {
    mockPrisma.boardPack.findMany.mockResolvedValue([{ id: '00000000-0000-0000-0000-000000000003', status: 'DRAFT', generatedAt: new Date() }]);
    mockPrisma.boardPack.count.mockResolvedValue(1);
    const res = await request(app).get('/api/board-packs');
    expect(res.status).toBe(200);
    expect(res.body.data.boardPacks[0].id).toBe('00000000-0000-0000-0000-000000000003');
  });

  it('GET /api/board-packs count is called once per request', async () => {
    mockPrisma.boardPack.findMany.mockResolvedValue([]);
    mockPrisma.boardPack.count.mockResolvedValue(0);
    await request(app).get('/api/board-packs');
    expect(mockPrisma.boardPack.count).toHaveBeenCalledTimes(1);
  });
});
