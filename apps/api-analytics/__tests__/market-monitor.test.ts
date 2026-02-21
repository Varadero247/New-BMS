import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    competitorMonitor: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
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

import competitorsRouter from '../src/routes/competitors';
import { runMarketMonitorJob } from '../src/jobs/market-monitor.job';
import { prisma } from '../src/prisma';

const app = express();
app.use(express.json());
app.use('/api/competitors', competitorsRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

// ---------------------------------------------------------------------------
// Market Monitor Job
// ---------------------------------------------------------------------------
describe('runMarketMonitorJob', () => {
  it('processes competitors and updates lastCheckedAt', async () => {
    const competitors = [
      {
        id: '00000000-0000-0000-0000-000000000001',
        name: 'Acme',
        category: 'DIRECT',
        intel: [{ date: new Date().toISOString(), type: 'PRICING', detail: 'Price increase' }],
        createdAt: new Date(),
      },
    ];
    (prisma.competitorMonitor.findMany as jest.Mock).mockResolvedValue(competitors);
    (prisma.competitorMonitor.update as jest.Mock).mockResolvedValue({
      ...competitors[0],
      lastCheckedAt: new Date(),
    });

    await runMarketMonitorJob();

    expect(prisma.competitorMonitor.findMany).toHaveBeenCalled();
    expect(prisma.competitorMonitor.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: '00000000-0000-0000-0000-000000000001' },
        data: expect.objectContaining({ lastCheckedAt: expect.any(Date) }),
      })
    );
  });

  it('handles empty competitor list gracefully', async () => {
    (prisma.competitorMonitor.findMany as jest.Mock).mockResolvedValue([]);
    await runMarketMonitorJob();
    expect(prisma.competitorMonitor.update).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Competitor CRUD Routes
// ---------------------------------------------------------------------------
describe('GET /api/competitors', () => {
  it('lists competitors with pagination', async () => {
    (prisma.competitorMonitor.findMany as jest.Mock).mockResolvedValue([
      { id: '00000000-0000-0000-0000-000000000001', name: 'Acme' },
    ]);
    (prisma.competitorMonitor.count as jest.Mock).mockResolvedValue(1);

    const res = await request(app).get('/api/competitors');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.competitors).toHaveLength(1);
    expect(res.body.data.pagination.total).toBe(1);
  });
});

describe('GET /api/competitors/:id', () => {
  it('returns a single competitor', async () => {
    (prisma.competitorMonitor.findUnique as jest.Mock).mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Acme',
      intel: [],
    });
    const res = await request(app).get('/api/competitors/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Acme');
  });

  it('returns 404 for missing competitor', async () => {
    (prisma.competitorMonitor.findUnique as jest.Mock).mockResolvedValue(null);
    const res = await request(app).get('/api/competitors/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
  });
});

describe('POST /api/competitors', () => {
  it('creates a new competitor', async () => {
    const created = {
      id: 'comp-new',
      name: 'NewCo',
      website: 'https://newco.com',
      category: 'DIRECT',
      intel: [],
    };
    (prisma.competitorMonitor.create as jest.Mock).mockResolvedValue(created);

    const res = await request(app)
      .post('/api/competitors')
      .send({ name: 'NewCo', website: 'https://newco.com', category: 'DIRECT' });
    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('NewCo');
  });

  it('returns 400 when name is missing', async () => {
    const res = await request(app).post('/api/competitors').send({ website: 'https://x.com' });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/competitors/:id/intel', () => {
  it('adds an intel entry to the competitor', async () => {
    (prisma.competitorMonitor.findUnique as jest.Mock).mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      intel: [],
    });
    (prisma.competitorMonitor.update as jest.Mock).mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      intel: [{ date: expect.any(String), type: 'FEATURE', detail: 'New feature launched' }],
    });

    const res = await request(app)
      .post('/api/competitors/00000000-0000-0000-0000-000000000001/intel')
      .send({ type: 'FEATURE', detail: 'New feature launched' });
    expect(res.status).toBe(201);
    expect(prisma.competitorMonitor.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ intel: expect.any(Array) }) })
    );
  });

  it('returns 400 when type or detail is missing', async () => {
    (prisma.competitorMonitor.findUnique as jest.Mock).mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      intel: [],
    });
    const res = await request(app)
      .post('/api/competitors/00000000-0000-0000-0000-000000000001/intel')
      .send({ type: 'FEATURE' });
    expect(res.status).toBe(400);
  });
});

// ─── 500 error paths ────────────────────────────────────────────────────────

describe('500 error handling', () => {
  it('GET / returns 500 on DB error', async () => {
    (prisma.competitorMonitor.findMany as jest.Mock).mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/api/competitors');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('POST / returns 500 when create fails', async () => {
    (prisma.competitorMonitor.count as jest.Mock).mockResolvedValue(0);
    (prisma.competitorMonitor.create as jest.Mock).mockRejectedValue(new Error('DB down'));
    const res = await request(app).post('/api/competitors').send({ name: 'NewCo', website: 'https://newco.com', category: 'DIRECT' });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('PATCH /:id returns 500 when update fails', async () => {
    (prisma.competitorMonitor.findUnique as jest.Mock).mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    (prisma.competitorMonitor.update as jest.Mock).mockRejectedValue(new Error('DB down'));
    const res = await request(app).patch('/api/competitors/00000000-0000-0000-0000-000000000001').send({ name: 'Updated' });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('Market Monitor — extended', () => {
  it('GET /competitors: competitors field is an array', async () => {
    (prisma.competitorMonitor.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.competitorMonitor.count as jest.Mock).mockResolvedValue(0);
    const res = await request(app).get('/api/competitors');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.competitors)).toBe(true);
  });

  it('GET /competitors/:id: 404 returns NOT_FOUND error code', async () => {
    (prisma.competitorMonitor.findUnique as jest.Mock).mockResolvedValue(null);
    const res = await request(app).get('/api/competitors/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('POST /competitors: create called once on success', async () => {
    (prisma.competitorMonitor.count as jest.Mock).mockResolvedValue(0);
    (prisma.competitorMonitor.create as jest.Mock).mockResolvedValue({ id: 'c1', name: 'BetaCo' });
    await request(app).post('/api/competitors').send({ name: 'BetaCo', website: 'https://beta.com', category: 'INDIRECT' });
    expect(prisma.competitorMonitor.create).toHaveBeenCalledTimes(1);
  });
});
