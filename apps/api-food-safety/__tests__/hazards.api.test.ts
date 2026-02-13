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
      { id: 'h-1', name: 'Salmonella', type: 'BIOLOGICAL', severity: 'HIGH', likelihood: 'POSSIBLE', riskScore: 12 },
      { id: 'h-2', name: 'Glass', type: 'PHYSICAL', severity: 'CRITICAL', likelihood: 'UNLIKELY', riskScore: 10 },
    ];
    (prisma as any).fsHazard.findMany.mockResolvedValue(hazards);
    (prisma as any).fsHazard.count.mockResolvedValue(2);

    const res = await request(app).get('/api/hazards');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.pagination.total).toBe(2);
  });

  it('should filter by type', async () => {
    (prisma as any).fsHazard.findMany.mockResolvedValue([]);
    (prisma as any).fsHazard.count.mockResolvedValue(0);

    const res = await request(app).get('/api/hazards?type=BIOLOGICAL');
    expect(res.status).toBe(200);
    expect((prisma as any).fsHazard.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ type: 'BIOLOGICAL' }) })
    );
  });

  it('should filter by severity', async () => {
    (prisma as any).fsHazard.findMany.mockResolvedValue([]);
    (prisma as any).fsHazard.count.mockResolvedValue(0);

    const res = await request(app).get('/api/hazards?severity=HIGH');
    expect(res.status).toBe(200);
    expect((prisma as any).fsHazard.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ severity: 'HIGH' }) })
    );
  });

  it('should filter by isSignificant', async () => {
    (prisma as any).fsHazard.findMany.mockResolvedValue([]);
    (prisma as any).fsHazard.count.mockResolvedValue(0);

    const res = await request(app).get('/api/hazards?isSignificant=true');
    expect(res.status).toBe(200);
    expect((prisma as any).fsHazard.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ isSignificant: true }) })
    );
  });

  it('should handle pagination params', async () => {
    (prisma as any).fsHazard.findMany.mockResolvedValue([]);
    (prisma as any).fsHazard.count.mockResolvedValue(100);

    const res = await request(app).get('/api/hazards?page=2&limit=10');
    expect(res.status).toBe(200);
    expect(res.body.pagination.page).toBe(2);
    expect(res.body.pagination.limit).toBe(10);
    expect(res.body.pagination.totalPages).toBe(10);
  });

  it('should handle database errors', async () => {
    (prisma as any).fsHazard.findMany.mockRejectedValue(new Error('DB error'));

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
    const created = { id: 'h-1', ...input, riskScore: 12, createdBy: 'user-123' };
    (prisma as any).fsHazard.create.mockResolvedValue(created);

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
    (prisma as any).fsHazard.create.mockRejectedValue(new Error('DB error'));

    const res = await request(app).post('/api/hazards').send({
      name: 'Test', type: 'CHEMICAL', severity: 'LOW', likelihood: 'RARE',
    });
    expect(res.status).toBe(500);
  });
});

// ===================================================================
// GET /api/hazards/:id
// ===================================================================
describe('GET /api/hazards/:id', () => {
  it('should return a hazard by id', async () => {
    const hazard = { id: 'h-1', name: 'Salmonella', type: 'BIOLOGICAL', ccps: [] };
    (prisma as any).fsHazard.findFirst.mockResolvedValue(hazard);

    const res = await request(app).get('/api/hazards/h-1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe('h-1');
  });

  it('should return 404 for non-existent hazard', async () => {
    (prisma as any).fsHazard.findFirst.mockResolvedValue(null);

    const res = await request(app).get('/api/hazards/non-existent');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should handle database errors', async () => {
    (prisma as any).fsHazard.findFirst.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/hazards/h-1');
    expect(res.status).toBe(500);
  });
});

// ===================================================================
// PUT /api/hazards/:id
// ===================================================================
describe('PUT /api/hazards/:id', () => {
  it('should update a hazard', async () => {
    const existing = { id: 'h-1', severity: 'HIGH', likelihood: 'POSSIBLE' };
    (prisma as any).fsHazard.findFirst.mockResolvedValue(existing);
    (prisma as any).fsHazard.update.mockResolvedValue({ ...existing, name: 'Updated' });

    const res = await request(app).put('/api/hazards/h-1').send({ name: 'Updated' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should recalculate risk score on severity change', async () => {
    const existing = { id: 'h-1', severity: 'HIGH', likelihood: 'POSSIBLE' };
    (prisma as any).fsHazard.findFirst.mockResolvedValue(existing);
    (prisma as any).fsHazard.update.mockResolvedValue({ ...existing, severity: 'CRITICAL', riskScore: 15 });

    const res = await request(app).put('/api/hazards/h-1').send({ severity: 'CRITICAL' });
    expect(res.status).toBe(200);
    expect((prisma as any).fsHazard.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ riskScore: 15 }) })
    );
  });

  it('should return 404 for non-existent hazard', async () => {
    (prisma as any).fsHazard.findFirst.mockResolvedValue(null);

    const res = await request(app).put('/api/hazards/non-existent').send({ name: 'Test' });
    expect(res.status).toBe(404);
  });

  it('should reject invalid update data', async () => {
    const existing = { id: 'h-1', severity: 'HIGH', likelihood: 'POSSIBLE' };
    (prisma as any).fsHazard.findFirst.mockResolvedValue(existing);

    const res = await request(app).put('/api/hazards/h-1').send({ type: 'INVALID_TYPE' });
    expect(res.status).toBe(400);
  });
});

// ===================================================================
// DELETE /api/hazards/:id
// ===================================================================
describe('DELETE /api/hazards/:id', () => {
  it('should soft delete a hazard', async () => {
    (prisma as any).fsHazard.findFirst.mockResolvedValue({ id: 'h-1' });
    (prisma as any).fsHazard.update.mockResolvedValue({ id: 'h-1', deletedAt: new Date() });

    const res = await request(app).delete('/api/hazards/h-1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect((prisma as any).fsHazard.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ deletedAt: expect.any(Date) }) })
    );
  });

  it('should return 404 for non-existent hazard', async () => {
    (prisma as any).fsHazard.findFirst.mockResolvedValue(null);

    const res = await request(app).delete('/api/hazards/non-existent');
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
    (prisma as any).fsHazard.findMany.mockResolvedValue(hazards);

    const res = await request(app).get('/api/hazards/summary');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.total).toBe(3);
    expect(res.body.data.byType.BIOLOGICAL).toBe(2);
    expect(res.body.data.byType.CHEMICAL).toBe(1);
    expect(res.body.data.significantCount).toBe(2);
  });

  it('should handle database errors', async () => {
    (prisma as any).fsHazard.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/hazards/summary');
    expect(res.status).toBe(500);
  });
});
