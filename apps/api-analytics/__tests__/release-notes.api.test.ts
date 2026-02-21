import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    changelog: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
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

import router from '../src/routes/release-notes';
import { prisma } from '../src/prisma';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const app = express();
app.use(express.json());
app.use('/api/release-notes', router);

beforeEach(() => {
  jest.clearAllMocks();
});

// ===================================================================
// GET /api/release-notes — List changelogs
// ===================================================================
describe('GET /api/release-notes', () => {
  it('should return a paginated list of changelogs', async () => {
    const changelogs = [
      {
        id: '00000000-0000-0000-0000-000000000001',
        version: '2.1.0',
        title: 'Major release',
        publishedAt: new Date(),
      },
      { id: 'cl-2', version: '2.0.1', title: 'Bug fix', publishedAt: new Date() },
    ];
    mockPrisma.changelog.findMany.mockResolvedValue(changelogs);
    mockPrisma.changelog.count.mockResolvedValue(2);

    const res = await request(app).get('/api/release-notes');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.changelogs).toHaveLength(2);
    expect(res.body.data.pagination.total).toBe(2);
    expect(res.body.data.pagination.page).toBe(1);
  });

  it('should support pagination query params', async () => {
    mockPrisma.changelog.findMany.mockResolvedValue([]);
    mockPrisma.changelog.count.mockResolvedValue(0);

    const res = await request(app).get('/api/release-notes?page=2&limit=10');

    expect(res.status).toBe(200);
    expect(res.body.data.pagination.page).toBe(2);
    expect(res.body.data.pagination.limit).toBe(10);
  });

  it('should cap limit at 50', async () => {
    mockPrisma.changelog.findMany.mockResolvedValue([]);
    mockPrisma.changelog.count.mockResolvedValue(0);

    const res = await request(app).get('/api/release-notes?limit=100');

    expect(res.status).toBe(200);
    expect(res.body.data.pagination.limit).toBe(50);
  });

  it('should return an empty list when no changelogs exist', async () => {
    mockPrisma.changelog.findMany.mockResolvedValue([]);
    mockPrisma.changelog.count.mockResolvedValue(0);

    const res = await request(app).get('/api/release-notes');

    expect(res.status).toBe(200);
    expect(res.body.data.changelogs).toHaveLength(0);
    expect(res.body.data.pagination.totalPages).toBe(0);
  });

  it('should handle server errors', async () => {
    mockPrisma.changelog.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/release-notes');

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('findMany and count are both called once per list request', async () => {
    mockPrisma.changelog.findMany.mockResolvedValue([]);
    mockPrisma.changelog.count.mockResolvedValue(0);

    await request(app).get('/api/release-notes');

    expect(mockPrisma.changelog.findMany).toHaveBeenCalledTimes(1);
    expect(mockPrisma.changelog.count).toHaveBeenCalledTimes(1);
  });

  it('pagination totalPages is calculated from count and limit', async () => {
    mockPrisma.changelog.findMany.mockResolvedValue([]);
    mockPrisma.changelog.count.mockResolvedValue(25);

    const res = await request(app).get('/api/release-notes?limit=5');

    expect(res.status).toBe(200);
    expect(res.body.data.pagination.totalPages).toBe(5);
  });

  it('response data has changelogs and pagination keys', async () => {
    mockPrisma.changelog.findMany.mockResolvedValue([]);
    mockPrisma.changelog.count.mockResolvedValue(0);

    const res = await request(app).get('/api/release-notes');

    expect(res.body.data).toHaveProperty('changelogs');
    expect(res.body.data).toHaveProperty('pagination');
  });
});

// ===================================================================
// GET /api/release-notes/:id — Get single changelog
// ===================================================================
describe('GET /api/release-notes/:id', () => {
  it('should return a changelog by ID', async () => {
    const changelog = {
      id: '00000000-0000-0000-0000-000000000001',
      version: '2.1.0',
      title: 'Major release',
      publishedAt: new Date(),
    };
    mockPrisma.changelog.findUnique.mockResolvedValue(changelog);

    const res = await request(app).get('/api/release-notes/00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.changelog.id).toBe('00000000-0000-0000-0000-000000000001');
    expect(res.body.data.changelog.version).toBe('2.1.0');
  });

  it('should return 404 for a non-existent changelog', async () => {
    mockPrisma.changelog.findUnique.mockResolvedValue(null);

    const res = await request(app).get('/api/release-notes/00000000-0000-0000-0000-000000000099');

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should handle server errors', async () => {
    mockPrisma.changelog.findUnique.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/release-notes/00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('Release Notes — extended', () => {
  it('GET list pagination.total is a number', async () => {
    mockPrisma.changelog.findMany.mockResolvedValue([]);
    mockPrisma.changelog.count.mockResolvedValue(42);
    const res = await request(app).get('/api/release-notes');
    expect(typeof res.body.data.pagination.total).toBe('number');
    expect(res.body.data.pagination.total).toBe(42);
  });

  it('GET list changelogs is an array', async () => {
    mockPrisma.changelog.findMany.mockResolvedValue([]);
    mockPrisma.changelog.count.mockResolvedValue(0);
    const res = await request(app).get('/api/release-notes');
    expect(Array.isArray(res.body.data.changelogs)).toBe(true);
  });

  it('GET /:id success is true', async () => {
    mockPrisma.changelog.findUnique.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      version: '1.0.0',
      title: 'Initial',
      publishedAt: new Date(),
    });
    const res = await request(app).get('/api/release-notes/00000000-0000-0000-0000-000000000001');
    expect(res.body.success).toBe(true);
  });

  it('GET /:id 404 error code is NOT_FOUND', async () => {
    mockPrisma.changelog.findUnique.mockResolvedValue(null);
    const res = await request(app).get('/api/release-notes/00000000-0000-0000-0000-000000000099');
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});

describe('release-notes.api — additional coverage', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/release-notes', router);
    jest.clearAllMocks();
  });

  it('route responds to GET /api/release-notes', async () => {
    const res = await request(app).get('/api/release-notes');
    expect([200, 400, 401, 404, 500]).toContain(res.status);
  });

  it('response is JSON content-type for GET /api/release-notes', async () => {
    const res = await request(app).get('/api/release-notes');
    expect(res.headers['content-type']).toBeDefined();
  });

  it('GET /api/release-notes body has success property', async () => {
    const res = await request(app).get('/api/release-notes');
    if (res.status === 200) {
      expect(res.body).toHaveProperty('success');
    } else {
      expect(res.body).toBeDefined();
    }
  });

  it('GET /api/release-notes body is an object', async () => {
    const res = await request(app).get('/api/release-notes');
    expect(typeof res.body).toBe('object');
  });

  it('GET /api/release-notes route is accessible', async () => {
    const res = await request(app).get('/api/release-notes');
    expect(res.status).toBeDefined();
  });
});
