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
    (prisma as any).boardPack.findMany.mockResolvedValue(boardPacks);
    (prisma as any).boardPack.count.mockResolvedValue(2);

    const res = await request(app).get('/api/board-packs');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.boardPacks).toHaveLength(2);
    expect(res.body.data.pagination.total).toBe(2);
    expect(res.body.data.pagination.page).toBe(1);
  });

  it('should support pagination query params', async () => {
    (prisma as any).boardPack.findMany.mockResolvedValue([]);
    (prisma as any).boardPack.count.mockResolvedValue(0);

    const res = await request(app).get('/api/board-packs?page=2&limit=5');

    expect(res.status).toBe(200);
    expect(res.body.data.pagination.page).toBe(2);
    expect(res.body.data.pagination.limit).toBe(5);
  });

  it('should handle server errors', async () => {
    (prisma as any).boardPack.findMany.mockRejectedValue(new Error('DB error'));

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
    (prisma as any).boardPack.findUnique.mockResolvedValue(boardPack);

    const res = await request(app).get('/api/board-packs/00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
  });

  it('should return 404 for a non-existent board pack', async () => {
    (prisma as any).boardPack.findUnique.mockResolvedValue(null);

    const res = await request(app).get('/api/board-packs/00000000-0000-0000-0000-000000000099');

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should handle server errors', async () => {
    (prisma as any).boardPack.findUnique.mockRejectedValue(new Error('DB error'));

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
    (prisma as any).boardPack.findUnique.mockResolvedValue(existing);
    (prisma as any).boardPack.update.mockResolvedValue(updated);

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
    (prisma as any).boardPack.findUnique.mockResolvedValue(existing);
    (prisma as any).boardPack.update.mockResolvedValue(updated);

    const res = await request(app)
      .patch('/api/board-packs/00000000-0000-0000-0000-000000000001')
      .send({ status: 'DISTRIBUTED' });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('DISTRIBUTED');
  });

  it('should reject invalid status transition (DRAFT to DISTRIBUTED)', async () => {
    const existing = { id: '00000000-0000-0000-0000-000000000001', status: 'DRAFT' };
    (prisma as any).boardPack.findUnique.mockResolvedValue(existing);

    const res = await request(app)
      .patch('/api/board-packs/00000000-0000-0000-0000-000000000001')
      .send({ status: 'DISTRIBUTED' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_TRANSITION');
  });

  it('should reject transition from DISTRIBUTED', async () => {
    const existing = { id: '00000000-0000-0000-0000-000000000001', status: 'DISTRIBUTED' };
    (prisma as any).boardPack.findUnique.mockResolvedValue(existing);

    const res = await request(app)
      .patch('/api/board-packs/00000000-0000-0000-0000-000000000001')
      .send({ status: 'DRAFT' });

    expect(res.status).toBe(400);
  });

  it('should return 404 for a non-existent board pack', async () => {
    (prisma as any).boardPack.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .patch('/api/board-packs/00000000-0000-0000-0000-000000000099')
      .send({ status: 'FINAL' });

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should return 400 for invalid status value', async () => {
    const existing = { id: '00000000-0000-0000-0000-000000000001', status: 'DRAFT' };
    (prisma as any).boardPack.findUnique.mockResolvedValue(existing);

    const res = await request(app)
      .patch('/api/board-packs/00000000-0000-0000-0000-000000000001')
      .send({ status: 'INVALID_STATUS' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should handle server errors', async () => {
    (prisma as any).boardPack.findUnique.mockRejectedValue(new Error('DB error'));

    const res = await request(app)
      .patch('/api/board-packs/00000000-0000-0000-0000-000000000001')
      .send({ status: 'FINAL' });

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});
