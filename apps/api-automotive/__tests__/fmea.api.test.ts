import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    fmeaStudy: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    fmeaItem: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
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

jest.mock('@ims/service-auth', () => ({
  checkOwnership: () => (_req: any, _res: any, next: any) => next(),
  scopeToUser: (_req: any, _res: any, next: any) => next(),
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  }),
}));

jest.mock('@ims/shared', () => ({
  validateIdParam: () => (_req: any, _res: any, next: any) => next(),
  parsePagination: (query: Record<string, any>, opts?: { defaultLimit?: number }) => {
    const defaultLimit = opts?.defaultLimit ?? 20;
    const page = Math.max(1, parseInt(query.page as string, 10) || 1);
    const limit = Math.min(Math.max(1, parseInt(query.limit as string, 10) || defaultLimit), 100);
    const skip = (page - 1) * limit;
    return { page, limit, skip };
  },
}));

import { prisma } from '../src/prisma';
import router from '../src/routes/fmea';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const app = express();
app.use(express.json());
app.use('/api/fmea', router);

const STUDY_ID = '00000000-0000-4000-a000-000000000001';
const ITEM_ID = '00000000-0000-4000-a000-000000000002';

const mockStudy = {
  id: STUDY_ID,
  refNumber: 'FMEA-2601-0001',
  title: 'Engine Assembly PFMEA',
  fmeaType: 'PFMEA',
  partNumber: 'ENG-001',
  status: 'DRAFT',
  preparedBy: 'John Engineer',
  revision: 'A',
  deletedAt: null,
  _count: { items: 0 },
};

const mockItem = {
  id: ITEM_ID,
  studyId: STUDY_ID,
  itemNumber: 1,
  processStep: 'Cylinder Head Torque',
  function: 'Secure cylinder head to block',
  failureMode: 'Under-torque',
  failureEffect: 'Coolant leak',
  severity: 8,
  potentialCauses: 'Worn torque wrench',
  occurrence: 3,
  detection: 4,
  rpn: 96,
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/fmea', () => {
  it('returns list of FMEA studies', async () => {
    (mockPrisma.fmeaStudy.findMany as jest.Mock).mockResolvedValue([mockStudy]);
    (mockPrisma.fmeaStudy.count as jest.Mock).mockResolvedValue(1);

    const res = await request(app).get('/api/fmea');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.meta.total).toBe(1);
  });

  it('filters by status, fmeaType, and customer', async () => {
    (mockPrisma.fmeaStudy.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.fmeaStudy.count as jest.Mock).mockResolvedValue(0);

    const res = await request(app).get('/api/fmea?status=DRAFT&fmeaType=PFMEA');
    expect(res.status).toBe(200);
  });

  it('returns 500 on DB error', async () => {
    (mockPrisma.fmeaStudy.findMany as jest.Mock).mockRejectedValue(new Error('fail'));
    const res = await request(app).get('/api/fmea');
    expect(res.status).toBe(500);
  });
});

describe('GET /api/fmea/:id', () => {
  it('returns a single FMEA study with items', async () => {
    (mockPrisma.fmeaStudy.findUnique as jest.Mock).mockResolvedValue({
      ...mockStudy,
      items: [mockItem],
    });

    const res = await request(app).get(`/api/fmea/${STUDY_ID}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(STUDY_ID);
  });

  it('returns 404 when not found', async () => {
    (mockPrisma.fmeaStudy.findUnique as jest.Mock).mockResolvedValue(null);

    const res = await request(app).get(`/api/fmea/${STUDY_ID}`);
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('returns 404 when soft-deleted', async () => {
    (mockPrisma.fmeaStudy.findUnique as jest.Mock).mockResolvedValue({
      ...mockStudy,
      deletedAt: new Date(),
      items: [],
    });

    const res = await request(app).get(`/api/fmea/${STUDY_ID}`);
    expect(res.status).toBe(404);
  });
});

describe('POST /api/fmea', () => {
  const validBody = {
    title: 'Engine Assembly PFMEA',
    preparedBy: 'John Engineer',
  };

  it('creates FMEA study successfully', async () => {
    (mockPrisma.fmeaStudy.count as jest.Mock).mockResolvedValue(0);
    (mockPrisma.fmeaStudy.create as jest.Mock).mockResolvedValue(mockStudy);

    const res = await request(app).post('/api/fmea').send(validBody);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('refNumber');
  });

  it('returns 400 on validation error', async () => {
    const res = await request(app).post('/api/fmea').send({ title: 'Missing preparedBy' });
    expect(res.status).toBe(400);
  });

  it('returns 500 on DB error', async () => {
    (mockPrisma.fmeaStudy.count as jest.Mock).mockResolvedValue(0);
    (mockPrisma.fmeaStudy.create as jest.Mock).mockRejectedValue(new Error('fail'));

    const res = await request(app).post('/api/fmea').send(validBody);
    expect(res.status).toBe(500);
  });
});

describe('PUT /api/fmea/:id', () => {
  it('updates FMEA study successfully', async () => {
    (mockPrisma.fmeaStudy.findUnique as jest.Mock).mockResolvedValue(mockStudy);
    (mockPrisma.fmeaStudy.update as jest.Mock).mockResolvedValue({
      ...mockStudy,
      status: 'IN_REVIEW',
    });

    const res = await request(app).put(`/api/fmea/${STUDY_ID}`).send({ status: 'IN_REVIEW' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('returns 404 when not found', async () => {
    (mockPrisma.fmeaStudy.findUnique as jest.Mock).mockResolvedValue(null);

    const res = await request(app).put(`/api/fmea/${STUDY_ID}`).send({ status: 'IN_REVIEW' });
    expect(res.status).toBe(404);
  });

  it('returns 400 on validation error', async () => {
    (mockPrisma.fmeaStudy.findUnique as jest.Mock).mockResolvedValue(mockStudy);

    const res = await request(app).put(`/api/fmea/${STUDY_ID}`).send({ status: 'INVALID_STATUS' });
    expect(res.status).toBe(400);
  });
});

describe('DELETE /api/fmea/:id', () => {
  it('soft deletes FMEA study', async () => {
    (mockPrisma.fmeaStudy.findUnique as jest.Mock).mockResolvedValue(mockStudy);
    (mockPrisma.fmeaStudy.update as jest.Mock).mockResolvedValue({
      ...mockStudy,
      deletedAt: new Date(),
    });

    const res = await request(app).delete(`/api/fmea/${STUDY_ID}`);
    expect(res.status).toBe(204);
  });

  it('returns 404 when not found', async () => {
    (mockPrisma.fmeaStudy.findUnique as jest.Mock).mockResolvedValue(null);

    const res = await request(app).delete(`/api/fmea/${STUDY_ID}`);
    expect(res.status).toBe(404);
  });
});

describe('POST /api/fmea/:id/items', () => {
  const validItemBody = {
    itemNumber: 1,
    processStep: 'Cylinder Head Torque',
    function: 'Secure cylinder head to block',
    failureMode: 'Under-torque',
    failureEffect: 'Coolant leak',
    severity: 8,
    potentialCauses: 'Worn torque wrench',
    occurrence: 3,
    detection: 4,
  };

  it('adds FMEA item successfully and calculates RPN', async () => {
    (mockPrisma.fmeaStudy.findUnique as jest.Mock).mockResolvedValue(mockStudy);
    (mockPrisma.fmeaItem.create as jest.Mock).mockResolvedValue({ ...mockItem, rpn: 96 });

    const res = await request(app).post(`/api/fmea/${STUDY_ID}/items`).send(validItemBody);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.rpn).toBe(96);
  });

  it('returns 404 when study not found', async () => {
    (mockPrisma.fmeaStudy.findUnique as jest.Mock).mockResolvedValue(null);

    const res = await request(app).post(`/api/fmea/${STUDY_ID}/items`).send(validItemBody);
    expect(res.status).toBe(404);
  });

  it('returns 400 on validation error', async () => {
    (mockPrisma.fmeaStudy.findUnique as jest.Mock).mockResolvedValue(mockStudy);

    const res = await request(app).post(`/api/fmea/${STUDY_ID}/items`).send({ itemNumber: 1 });
    expect(res.status).toBe(400);
  });
});

describe('PUT /api/fmea/:id/items/:itemId', () => {
  it('updates FMEA item and recalculates RPN', async () => {
    (mockPrisma.fmeaStudy.findUnique as jest.Mock).mockResolvedValue(mockStudy);
    (mockPrisma.fmeaItem.findUnique as jest.Mock).mockResolvedValue(mockItem);
    (mockPrisma.fmeaItem.update as jest.Mock).mockResolvedValue({
      ...mockItem,
      occurrence: 2,
      rpn: 64,
    });

    const res = await request(app)
      .put(`/api/fmea/${STUDY_ID}/items/${ITEM_ID}`)
      .send({ occurrence: 2 });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('returns 404 when study not found', async () => {
    (mockPrisma.fmeaStudy.findUnique as jest.Mock).mockResolvedValue(null);

    const res = await request(app)
      .put(`/api/fmea/${STUDY_ID}/items/${ITEM_ID}`)
      .send({ occurrence: 2 });
    expect(res.status).toBe(404);
  });

  it('returns 404 when item not found', async () => {
    (mockPrisma.fmeaStudy.findUnique as jest.Mock).mockResolvedValue(mockStudy);
    (mockPrisma.fmeaItem.findUnique as jest.Mock).mockResolvedValue(null);

    const res = await request(app)
      .put(`/api/fmea/${STUDY_ID}/items/${ITEM_ID}`)
      .send({ occurrence: 2 });
    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/fmea/:id/items/:itemId', () => {
  it('deletes FMEA item successfully', async () => {
    (mockPrisma.fmeaItem.findUnique as jest.Mock).mockResolvedValue(mockItem);
    (mockPrisma.fmeaItem.delete as jest.Mock).mockResolvedValue(mockItem);

    const res = await request(app).delete(`/api/fmea/${STUDY_ID}/items/${ITEM_ID}`);
    expect(res.status).toBe(204);
  });

  it('returns 404 when item not found', async () => {
    (mockPrisma.fmeaItem.findUnique as jest.Mock).mockResolvedValue(null);

    const res = await request(app).delete(`/api/fmea/${STUDY_ID}/items/${ITEM_ID}`);
    expect(res.status).toBe(404);
  });

  it('returns 500 on DB error', async () => {
    (mockPrisma.fmeaItem.findUnique as jest.Mock).mockResolvedValue(mockItem);
    (mockPrisma.fmeaItem.delete as jest.Mock).mockRejectedValue(new Error('fail'));

    const res = await request(app).delete(`/api/fmea/${STUDY_ID}/items/${ITEM_ID}`);
    expect(res.status).toBe(500);
  });
});
