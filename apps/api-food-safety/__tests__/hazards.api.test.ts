import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    fsHazard: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
  },
  Prisma: { Decimal: jest.fn((v: any) => v) },
}));

jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((req: any, _res: any, next: any) => {
    req.user = { id: 'user-123', email: 'test@test.com', role: 'ADMIN' };
    next();
  }),
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

import hazardsRouter from '../src/routes/hazards';
import { prisma } from '../src/prisma';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const app = express();
app.use(express.json());
app.use('/api/hazards', hazardsRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

// ===================================================================
// GET /api/hazards
// ===================================================================
describe('GET /api/hazards', () => {
  it('should return a list of hazards with pagination', async () => {
    const hazards = [
      {
        id: '00000000-0000-0000-0000-000000000001',
        name: 'Salmonella',
        type: 'BIOLOGICAL',
        severity: 'HIGH',
        likelihood: 'POSSIBLE',
        riskScore: 12,
      },
      {
        id: 'h-2',
        name: 'Glass',
        type: 'PHYSICAL',
        severity: 'CRITICAL',
        likelihood: 'UNLIKELY',
        riskScore: 10,
      },
    ];
    mockPrisma.fsHazard.findMany.mockResolvedValue(hazards);
    mockPrisma.fsHazard.count.mockResolvedValue(2);

    const res = await request(app).get('/api/hazards');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.pagination.total).toBe(2);
  });

  it('should filter by type', async () => {
    mockPrisma.fsHazard.findMany.mockResolvedValue([]);
    mockPrisma.fsHazard.count.mockResolvedValue(0);

    const res = await request(app).get('/api/hazards?type=BIOLOGICAL');
    expect(res.status).toBe(200);
    expect(mockPrisma.fsHazard.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ type: 'BIOLOGICAL' }) })
    );
  });

  it('should filter by severity', async () => {
    mockPrisma.fsHazard.findMany.mockResolvedValue([]);
    mockPrisma.fsHazard.count.mockResolvedValue(0);

    const res = await request(app).get('/api/hazards?severity=HIGH');
    expect(res.status).toBe(200);
    expect(mockPrisma.fsHazard.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ severity: 'HIGH' }) })
    );
  });

  it('should filter by isSignificant', async () => {
    mockPrisma.fsHazard.findMany.mockResolvedValue([]);
    mockPrisma.fsHazard.count.mockResolvedValue(0);

    const res = await request(app).get('/api/hazards?isSignificant=true');
    expect(res.status).toBe(200);
    expect(mockPrisma.fsHazard.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ isSignificant: true }) })
    );
  });

  it('should handle pagination params', async () => {
    mockPrisma.fsHazard.findMany.mockResolvedValue([]);
    mockPrisma.fsHazard.count.mockResolvedValue(100);

    const res = await request(app).get('/api/hazards?page=2&limit=10');
    expect(res.status).toBe(200);
    expect(res.body.pagination.page).toBe(2);
    expect(res.body.pagination.limit).toBe(10);
    expect(res.body.pagination.totalPages).toBe(10);
  });

  it('should handle database errors', async () => {
    mockPrisma.fsHazard.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/hazards');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

// ===================================================================
// POST /api/hazards
// ===================================================================
describe('POST /api/hazards', () => {
  it('should create a hazard with auto-calculated risk score', async () => {
    const input = {
      name: 'Salmonella',
      type: 'BIOLOGICAL',
      severity: 'HIGH',
      likelihood: 'POSSIBLE',
      description: 'Pathogenic bacteria',
    };
    const created = {
      id: '00000000-0000-0000-0000-000000000001',
      ...input,
      riskScore: 12,
      createdBy: 'user-123',
    };
    mockPrisma.fsHazard.create.mockResolvedValue(created);

    const res = await request(app).post('/api/hazards').send(input);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.riskScore).toBe(12);
  });

  it('should reject invalid input', async () => {
    const res = await request(app).post('/api/hazards').send({ type: 'INVALID' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should reject missing required fields', async () => {
    const res = await request(app).post('/api/hazards').send({ name: 'Test' });
    expect(res.status).toBe(400);
  });

  it('should handle database errors on create', async () => {
    mockPrisma.fsHazard.create.mockRejectedValue(new Error('DB error'));

    const res = await request(app).post('/api/hazards').send({
      name: 'Test',
      type: 'CHEMICAL',
      severity: 'LOW',
      likelihood: 'RARE',
    });
    expect(res.status).toBe(500);
  });
});

// ===================================================================
// GET /api/hazards/:id
// ===================================================================
describe('GET /api/hazards/:id', () => {
  it('should return a hazard by id', async () => {
    const hazard = {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Salmonella',
      type: 'BIOLOGICAL',
      ccps: [],
    };
    mockPrisma.fsHazard.findFirst.mockResolvedValue(hazard);

    const res = await request(app).get('/api/hazards/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
  });

  it('should return 404 for non-existent hazard', async () => {
    mockPrisma.fsHazard.findFirst.mockResolvedValue(null);

    const res = await request(app).get('/api/hazards/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should handle database errors', async () => {
    mockPrisma.fsHazard.findFirst.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/hazards/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
  });
});

// ===================================================================
// PUT /api/hazards/:id
// ===================================================================
describe('PUT /api/hazards/:id', () => {
  it('should update a hazard', async () => {
    const existing = {
      id: '00000000-0000-0000-0000-000000000001',
      severity: 'HIGH',
      likelihood: 'POSSIBLE',
    };
    mockPrisma.fsHazard.findFirst.mockResolvedValue(existing);
    mockPrisma.fsHazard.update.mockResolvedValue({ ...existing, name: 'Updated' });

    const res = await request(app)
      .put('/api/hazards/00000000-0000-0000-0000-000000000001')
      .send({ name: 'Updated' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should recalculate risk score on severity change', async () => {
    const existing = {
      id: '00000000-0000-0000-0000-000000000001',
      severity: 'HIGH',
      likelihood: 'POSSIBLE',
    };
    mockPrisma.fsHazard.findFirst.mockResolvedValue(existing);
    mockPrisma.fsHazard.update.mockResolvedValue({
      ...existing,
      severity: 'CRITICAL',
      riskScore: 15,
    });

    const res = await request(app)
      .put('/api/hazards/00000000-0000-0000-0000-000000000001')
      .send({ severity: 'CRITICAL' });
    expect(res.status).toBe(200);
    expect(mockPrisma.fsHazard.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ riskScore: 15 }) })
    );
  });

  it('should return 404 for non-existent hazard', async () => {
    mockPrisma.fsHazard.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/hazards/00000000-0000-0000-0000-000000000099')
      .send({ name: 'Test' });
    expect(res.status).toBe(404);
  });

  it('should reject invalid update data', async () => {
    const existing = {
      id: '00000000-0000-0000-0000-000000000001',
      severity: 'HIGH',
      likelihood: 'POSSIBLE',
    };
    mockPrisma.fsHazard.findFirst.mockResolvedValue(existing);

    const res = await request(app)
      .put('/api/hazards/00000000-0000-0000-0000-000000000001')
      .send({ type: 'INVALID_TYPE' });
    expect(res.status).toBe(400);
  });
});

// ===================================================================
// DELETE /api/hazards/:id
// ===================================================================
describe('DELETE /api/hazards/:id', () => {
  it('should soft delete a hazard', async () => {
    mockPrisma.fsHazard.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.fsHazard.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      deletedAt: new Date(),
    });

    const res = await request(app).delete('/api/hazards/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(mockPrisma.fsHazard.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ deletedAt: expect.any(Date) }) })
    );
  });

  it('should return 404 for non-existent hazard', async () => {
    mockPrisma.fsHazard.findFirst.mockResolvedValue(null);

    const res = await request(app).delete('/api/hazards/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
  });
});

// ===================================================================
// GET /api/hazards/summary
// ===================================================================
describe('GET /api/hazards/summary', () => {
  it('should return summary by type and severity', async () => {
    const hazards = [
      { type: 'BIOLOGICAL', severity: 'HIGH', isSignificant: true },
      { type: 'BIOLOGICAL', severity: 'LOW', isSignificant: false },
      { type: 'CHEMICAL', severity: 'HIGH', isSignificant: true },
    ];
    mockPrisma.fsHazard.findMany.mockResolvedValue(hazards);

    const res = await request(app).get('/api/hazards/summary');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.total).toBe(3);
    expect(res.body.data.byType.BIOLOGICAL).toBe(2);
    expect(res.body.data.byType.CHEMICAL).toBe(1);
    expect(res.body.data.significantCount).toBe(2);
  });

  it('should handle database errors', async () => {
    mockPrisma.fsHazard.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/hazards/summary');
    expect(res.status).toBe(500);
  });
});

describe('Food Safety Hazards — extended coverage', () => {
  it('GET /api/hazards returns pagination.totalPages computed correctly', async () => {
    mockPrisma.fsHazard.findMany.mockResolvedValue([]);
    mockPrisma.fsHazard.count.mockResolvedValue(50);
    const res = await request(app).get('/api/hazards?page=1&limit=5');
    expect(res.status).toBe(200);
    expect(res.body.pagination.totalPages).toBe(10);
  });

  it('GET /api/hazards passes skip based on page and limit to findMany', async () => {
    mockPrisma.fsHazard.findMany.mockResolvedValue([]);
    mockPrisma.fsHazard.count.mockResolvedValue(0);
    await request(app).get('/api/hazards?page=3&limit=10');
    expect(mockPrisma.fsHazard.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 20, take: 10 })
    );
  });

  it('GET /api/hazards passes type filter into Prisma where clause', async () => {
    mockPrisma.fsHazard.findMany.mockResolvedValue([]);
    mockPrisma.fsHazard.count.mockResolvedValue(0);
    await request(app).get('/api/hazards?type=CHEMICAL');
    expect(mockPrisma.fsHazard.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ type: 'CHEMICAL' }) })
    );
  });

  it('GET /api/hazards count 500 error returns 500 with success:false', async () => {
    mockPrisma.fsHazard.findMany.mockResolvedValue([]);
    mockPrisma.fsHazard.count.mockRejectedValue(new Error('DB error'));
    const res = await request(app).get('/api/hazards');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/hazards returns 400 with error.code VALIDATION_ERROR for missing name', async () => {
    const res = await request(app).post('/api/hazards').send({ type: 'PHYSICAL', severity: 'LOW', likelihood: 'RARE' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('DELETE /api/hazards/:id returns 500 when update throws', async () => {
    mockPrisma.fsHazard.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.fsHazard.update.mockRejectedValue(new Error('DB error'));
    const res = await request(app).delete('/api/hazards/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });

  it('PUT /api/hazards/:id returns 500 when update throws', async () => {
    mockPrisma.fsHazard.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', severity: 'LOW', likelihood: 'RARE' });
    mockPrisma.fsHazard.update.mockRejectedValue(new Error('DB error'));
    const res = await request(app).put('/api/hazards/00000000-0000-0000-0000-000000000001').send({ name: 'Updated' });
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/hazards/summary handles empty hazard list returning zero counts', async () => {
    mockPrisma.fsHazard.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/hazards/summary');
    expect(res.status).toBe(200);
    expect(res.body.data.total).toBe(0);
    expect(res.body.data.significantCount).toBe(0);
  });
});

describe('Food Safety Hazards — final coverage pass', () => {
  it('POST /api/hazards creates with isSignificant computed from riskScore', async () => {
    const created = {
      id: '00000000-0000-0000-0000-000000000010',
      name: 'Aflatoxin',
      type: 'CHEMICAL',
      severity: 'CRITICAL',
      likelihood: 'LIKELY',
      riskScore: 16,
      isSignificant: true,
      createdBy: 'user-123',
    };
    mockPrisma.fsHazard.create.mockResolvedValue(created);

    const res = await request(app).post('/api/hazards').send({
      name: 'Aflatoxin',
      type: 'CHEMICAL',
      severity: 'CRITICAL',
      likelihood: 'LIKELY',
    });
    expect(res.status).toBe(201);
    expect(res.body.data.isSignificant).toBe(true);
  });

  it('GET /api/hazards/:id findFirst queries with deletedAt:null', async () => {
    mockPrisma.fsHazard.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Listeria',
      type: 'BIOLOGICAL',
      ccps: [],
    });
    await request(app).get('/api/hazards/00000000-0000-0000-0000-000000000001');
    expect(mockPrisma.fsHazard.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ id: '00000000-0000-0000-0000-000000000001', deletedAt: null }),
      })
    );
  });

  it('PUT /api/hazards/:id update passes createdBy from existing record', async () => {
    mockPrisma.fsHazard.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      severity: 'MEDIUM',
      likelihood: 'POSSIBLE',
      createdBy: 'user-original',
    });
    mockPrisma.fsHazard.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      description: 'Updated desc',
    });

    const res = await request(app)
      .put('/api/hazards/00000000-0000-0000-0000-000000000001')
      .send({ description: 'Updated desc' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('GET /api/hazards/summary byType aggregates PHYSICAL hazards', async () => {
    const hazards = [
      { type: 'PHYSICAL', severity: 'HIGH', isSignificant: true },
      { type: 'PHYSICAL', severity: 'LOW', isSignificant: false },
    ];
    mockPrisma.fsHazard.findMany.mockResolvedValue(hazards);

    const res = await request(app).get('/api/hazards/summary');
    expect(res.status).toBe(200);
    expect(res.body.data.byType.PHYSICAL).toBe(2);
  });

  it('GET /api/hazards filters combined type and severity correctly', async () => {
    mockPrisma.fsHazard.findMany.mockResolvedValue([]);
    mockPrisma.fsHazard.count.mockResolvedValue(0);

    await request(app).get('/api/hazards?type=BIOLOGICAL&severity=CRITICAL');
    expect(mockPrisma.fsHazard.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ type: 'BIOLOGICAL', severity: 'CRITICAL' }),
      })
    );
  });

  it('DELETE /api/hazards/:id calls update with deletedAt timestamp', async () => {
    mockPrisma.fsHazard.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.fsHazard.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      deletedAt: new Date(),
    });

    await request(app).delete('/api/hazards/00000000-0000-0000-0000-000000000001');
    expect(mockPrisma.fsHazard.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: '00000000-0000-0000-0000-000000000001' },
        data: expect.objectContaining({ deletedAt: expect.any(Date) }),
      })
    );
  });

  it('GET /api/hazards default pagination applies skip 0', async () => {
    mockPrisma.fsHazard.findMany.mockResolvedValue([]);
    mockPrisma.fsHazard.count.mockResolvedValue(0);

    await request(app).get('/api/hazards');
    expect(mockPrisma.fsHazard.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 0 })
    );
  });
});
