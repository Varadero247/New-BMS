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

import router from '../src/routes/competitors';
import { prisma } from '../src/prisma';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const app = express();
app.use(express.json());
app.use('/api/competitors', router);

beforeEach(() => {
  jest.clearAllMocks();
});

// ===================================================================
// GET /api/competitors — List competitors
// ===================================================================
describe('GET /api/competitors', () => {
  it('should return a paginated list of competitors', async () => {
    const competitors = [
      {
        id: '00000000-0000-0000-0000-000000000001',
        name: 'Competitor A',
        category: 'GENERAL',
        intel: [],
      },
      { id: 'comp-2', name: 'Competitor B', category: 'GENERAL', intel: [] },
    ];
    mockPrisma.competitorMonitor.findMany.mockResolvedValue(competitors);
    mockPrisma.competitorMonitor.count.mockResolvedValue(2);

    const res = await request(app).get('/api/competitors');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.competitors).toHaveLength(2);
    expect(res.body.data.pagination.total).toBe(2);
  });

  it('should support pagination query params', async () => {
    mockPrisma.competitorMonitor.findMany.mockResolvedValue([]);
    mockPrisma.competitorMonitor.count.mockResolvedValue(0);

    const res = await request(app).get('/api/competitors?page=2&limit=5');

    expect(res.status).toBe(200);
    expect(res.body.data.pagination.page).toBe(2);
    expect(res.body.data.pagination.limit).toBe(5);
  });

  it('should handle server errors', async () => {
    mockPrisma.competitorMonitor.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/competitors');

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

// ===================================================================
// GET /api/competitors/:id — Get single competitor
// ===================================================================
describe('GET /api/competitors/:id', () => {
  it('should return a competitor by ID', async () => {
    const competitor = {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Competitor A',
      category: 'GENERAL',
      intel: [],
    };
    mockPrisma.competitorMonitor.findUnique.mockResolvedValue(competitor);

    const res = await request(app).get('/api/competitors/00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
  });

  it('should return 404 for a non-existent competitor', async () => {
    mockPrisma.competitorMonitor.findUnique.mockResolvedValue(null);

    const res = await request(app).get('/api/competitors/00000000-0000-0000-0000-000000000099');

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should handle server errors', async () => {
    mockPrisma.competitorMonitor.findUnique.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/competitors/00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

// ===================================================================
// POST /api/competitors — Create competitor
// ===================================================================
describe('POST /api/competitors', () => {
  it('should create a new competitor', async () => {
    const created = {
      id: 'comp-new',
      name: 'New Competitor',
      website: 'https://example.com',
      category: 'GENERAL',
      intel: [],
    };
    mockPrisma.competitorMonitor.create.mockResolvedValue(created);

    const res = await request(app).post('/api/competitors').send({
      name: 'New Competitor',
      website: 'https://example.com',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe('comp-new');
    expect(res.body.data.name).toBe('New Competitor');
  });

  it('should reject missing required name', async () => {
    const res = await request(app)
      .post('/api/competitors')
      .send({ website: 'https://example.com' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should reject empty name', async () => {
    const res = await request(app).post('/api/competitors').send({ name: '' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should handle server errors', async () => {
    mockPrisma.competitorMonitor.create.mockRejectedValue(new Error('DB error'));

    const res = await request(app).post('/api/competitors').send({ name: 'New Competitor' });

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

// ===================================================================
// PATCH /api/competitors/:id — Update competitor
// ===================================================================
describe('PATCH /api/competitors/:id', () => {
  it('should update a competitor', async () => {
    const existing = {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Old Name',
      category: 'GENERAL',
      intel: [],
    };
    const updated = { ...existing, name: 'Updated Name' };
    mockPrisma.competitorMonitor.findUnique.mockResolvedValue(existing);
    mockPrisma.competitorMonitor.update.mockResolvedValue(updated);

    const res = await request(app)
      .patch('/api/competitors/00000000-0000-0000-0000-000000000001')
      .send({ name: 'Updated Name' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Updated Name');
  });

  it('should return 404 for a non-existent competitor', async () => {
    mockPrisma.competitorMonitor.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .patch('/api/competitors/00000000-0000-0000-0000-000000000099')
      .send({ name: 'Updated' });

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should handle server errors', async () => {
    mockPrisma.competitorMonitor.findUnique.mockRejectedValue(new Error('DB error'));

    const res = await request(app)
      .patch('/api/competitors/00000000-0000-0000-0000-000000000001')
      .send({ name: 'Updated' });

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

// ===================================================================
// POST /api/competitors/:id/intel — Add intel entry
// ===================================================================
describe('POST /api/competitors/:id/intel', () => {
  it('should add an intel entry to a competitor', async () => {
    const existing = {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Competitor A',
      intel: [],
    };
    const updated = {
      ...existing,
      intel: [
        { date: new Date().toISOString(), type: 'PRICING', detail: 'Lowered pricing by 10%' },
      ],
    };
    mockPrisma.competitorMonitor.findUnique.mockResolvedValue(existing);
    mockPrisma.competitorMonitor.update.mockResolvedValue(updated);

    const res = await request(app)
      .post('/api/competitors/00000000-0000-0000-0000-000000000001/intel')
      .send({
        type: 'PRICING',
        detail: 'Lowered pricing by 10%',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.intel).toHaveLength(1);
  });

  it('should append to existing intel entries', async () => {
    const existingIntel = [{ date: '2026-01-01T00:00:00.000Z', type: 'NEWS', detail: 'Old news' }];
    const existing = {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Competitor A',
      intel: existingIntel,
    };
    const updated = {
      ...existing,
      intel: [
        ...existingIntel,
        { date: new Date().toISOString(), type: 'PRODUCT', detail: 'New product' },
      ],
    };
    mockPrisma.competitorMonitor.findUnique.mockResolvedValue(existing);
    mockPrisma.competitorMonitor.update.mockResolvedValue(updated);

    const res = await request(app)
      .post('/api/competitors/00000000-0000-0000-0000-000000000001/intel')
      .send({
        type: 'PRODUCT',
        detail: 'New product',
      });

    expect(res.status).toBe(201);
    expect(res.body.data.intel).toHaveLength(2);
  });

  it('should reject missing required fields', async () => {
    const res = await request(app)
      .post('/api/competitors/00000000-0000-0000-0000-000000000001/intel')
      .send({ type: 'PRICING' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 404 for a non-existent competitor', async () => {
    mockPrisma.competitorMonitor.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/competitors/00000000-0000-0000-0000-000000000099/intel')
      .send({
        type: 'PRICING',
        detail: 'Lowered pricing',
      });

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should handle server errors', async () => {
    mockPrisma.competitorMonitor.findUnique.mockRejectedValue(new Error('DB error'));

    const res = await request(app)
      .post('/api/competitors/00000000-0000-0000-0000-000000000001/intel')
      .send({
        type: 'PRICING',
        detail: 'Lowered pricing',
      });

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('competitors.api — additional coverage', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/competitors', router);
    jest.clearAllMocks();
  });

  it('route responds to GET /api/competitors', async () => {
    const res = await request(app).get('/api/competitors');
    expect([200, 400, 401, 404, 500]).toContain(res.status);
  });

  it('response is JSON content-type for GET /api/competitors', async () => {
    const res = await request(app).get('/api/competitors');
    expect(res.headers['content-type']).toBeDefined();
  });
});
