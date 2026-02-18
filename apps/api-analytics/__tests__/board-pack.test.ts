import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    boardPack: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    monthlySnapshot: {
      findMany: jest.fn(),
    },
  },
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

jest.mock('@ims/auth', () => ({
  authenticate: (_req: any, _res: any, next: any) => {
    _req.user = { id: 'user-1', email: 'a@b.com' };
    next();
  },
}));

import boardPacksRouter from '../src/routes/board-packs';
import { runBoardPackJob } from '../src/jobs/board-pack.job';
import { prisma } from '../src/prisma';

const app = express();
app.use(express.json());
app.use('/api/board-packs', boardPacksRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

// ---------------------------------------------------------------------------
// Board Pack Job
// ---------------------------------------------------------------------------
describe('runBoardPackJob', () => {
  it('creates a board pack with aggregated snapshot data', async () => {
    const snapshots = [
      {
        id: 's1',
        mrr: 5000,
        customers: 10,
        mrrGrowthPct: 5,
        newCustomers: 2,
        revenueChurnPct: 1,
        ndr: 110,
        founderDraw: 3000,
        trajectory: 'ON_TRACK',
        monthNumber: 3,
      },
      {
        id: 's2',
        mrr: 4500,
        customers: 9,
        mrrGrowthPct: 4,
        newCustomers: 1,
        revenueChurnPct: 2,
        ndr: 105,
        founderDraw: 2800,
        trajectory: 'BEHIND',
        monthNumber: 2,
      },
    ];
    (prisma.monthlySnapshot.findMany as jest.Mock).mockResolvedValue(snapshots);
    (prisma.boardPack.create as jest.Mock).mockResolvedValue({
      id: 'bp-1',
      title: 'Q1 2026 Board Pack',
      status: 'DRAFT',
    });

    const id = await runBoardPackJob();
    expect(id).toBe('bp-1');
    expect(prisma.boardPack.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'DRAFT', sections: expect.any(Object) }),
      })
    );
  });

  it('handles no snapshots gracefully', async () => {
    (prisma.monthlySnapshot.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.boardPack.create as jest.Mock).mockResolvedValue({ id: 'bp-2', status: 'DRAFT' });

    const id = await runBoardPackJob();
    expect(id).toBe('bp-2');
  });

  it('sets status to DRAFT', async () => {
    (prisma.monthlySnapshot.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.boardPack.create as jest.Mock).mockResolvedValue({ id: 'bp-3', status: 'DRAFT' });

    await runBoardPackJob();
    expect(prisma.boardPack.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: 'DRAFT' }) })
    );
  });
});

// ---------------------------------------------------------------------------
// Board Pack Routes
// ---------------------------------------------------------------------------
describe('GET /api/board-packs', () => {
  it('lists board packs newest first', async () => {
    (prisma.boardPack.findMany as jest.Mock).mockResolvedValue([
      { id: '00000000-0000-0000-0000-000000000001', title: 'Q1 2026' },
    ]);
    (prisma.boardPack.count as jest.Mock).mockResolvedValue(1);

    const res = await request(app).get('/api/board-packs');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.boardPacks).toHaveLength(1);
  });
});

describe('GET /api/board-packs/:id', () => {
  it('returns a single board pack with sections', async () => {
    (prisma.boardPack.findUnique as jest.Mock).mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      title: 'Q1 2026',
      sections: { executiveSummary: { title: 'Executive Summary' } },
    });

    const res = await request(app).get('/api/board-packs/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.data.sections).toBeDefined();
  });

  it('returns 404 for missing board pack', async () => {
    (prisma.boardPack.findUnique as jest.Mock).mockResolvedValue(null);
    const res = await request(app).get('/api/board-packs/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
  });
});

describe('PATCH /api/board-packs/:id', () => {
  it('transitions DRAFT to FINAL', async () => {
    (prisma.boardPack.findUnique as jest.Mock).mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      status: 'DRAFT',
    });
    (prisma.boardPack.update as jest.Mock).mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      status: 'FINAL',
    });

    const res = await request(app)
      .patch('/api/board-packs/00000000-0000-0000-0000-000000000001')
      .send({ status: 'FINAL' });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('FINAL');
  });

  it('transitions FINAL to DISTRIBUTED', async () => {
    (prisma.boardPack.findUnique as jest.Mock).mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      status: 'FINAL',
    });
    (prisma.boardPack.update as jest.Mock).mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      status: 'DISTRIBUTED',
    });

    const res = await request(app)
      .patch('/api/board-packs/00000000-0000-0000-0000-000000000001')
      .send({ status: 'DISTRIBUTED' });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('DISTRIBUTED');
  });

  it('rejects invalid status transition', async () => {
    (prisma.boardPack.findUnique as jest.Mock).mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      status: 'DRAFT',
    });

    const res = await request(app)
      .patch('/api/board-packs/00000000-0000-0000-0000-000000000001')
      .send({ status: 'DISTRIBUTED' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_TRANSITION');
  });
});
