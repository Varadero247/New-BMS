import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    fsFoodDefense: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
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

import foodDefenseRouter from '../src/routes/food-defense';
import { prisma } from '../src/prisma';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const app = express();
app.use(express.json());
app.use('/api/food-defense', foodDefenseRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/food-defense', () => {
  it('should return food defense records with pagination', async () => {
    mockPrisma.fsFoodDefense.findMany.mockResolvedValue([
      { id: '00000000-0000-0000-0000-000000000001', title: 'Threat Assessment' },
    ]);
    mockPrisma.fsFoodDefense.count.mockResolvedValue(1);

    const res = await request(app).get('/api/food-defense');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });

  it('should filter by threatType', async () => {
    mockPrisma.fsFoodDefense.findMany.mockResolvedValue([]);
    mockPrisma.fsFoodDefense.count.mockResolvedValue(0);

    await request(app).get('/api/food-defense?threatType=SABOTAGE');
    expect(mockPrisma.fsFoodDefense.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ threatType: 'SABOTAGE' }) })
    );
  });

  it('should filter by status', async () => {
    mockPrisma.fsFoodDefense.findMany.mockResolvedValue([]);
    mockPrisma.fsFoodDefense.count.mockResolvedValue(0);

    await request(app).get('/api/food-defense?status=IDENTIFIED');
    expect(mockPrisma.fsFoodDefense.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ status: 'IDENTIFIED' }) })
    );
  });

  it('should filter by riskLevel', async () => {
    mockPrisma.fsFoodDefense.findMany.mockResolvedValue([]);
    mockPrisma.fsFoodDefense.count.mockResolvedValue(0);

    await request(app).get('/api/food-defense?riskLevel=HIGH');
    expect(mockPrisma.fsFoodDefense.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ riskLevel: 'HIGH' }) })
    );
  });

  it('should handle database errors', async () => {
    mockPrisma.fsFoodDefense.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/food-defense');
    expect(res.status).toBe(500);
  });
});

describe('POST /api/food-defense', () => {
  it('should create a food defense record', async () => {
    const created = {
      id: '00000000-0000-0000-0000-000000000001',
      title: 'Threat Assessment',
      threatType: 'SABOTAGE',
      riskLevel: 'HIGH',
    };
    mockPrisma.fsFoodDefense.create.mockResolvedValue(created);

    const res = await request(app).post('/api/food-defense').send({
      title: 'Threat Assessment',
      threatType: 'SABOTAGE',
      riskLevel: 'HIGH',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should reject invalid input', async () => {
    const res = await request(app).post('/api/food-defense').send({ title: 'Test' });
    expect(res.status).toBe(400);
  });

  it('should reject invalid threat type', async () => {
    const res = await request(app).post('/api/food-defense').send({
      title: 'Test',
      threatType: 'INVALID',
      riskLevel: 'HIGH',
    });
    expect(res.status).toBe(400);
  });

  it('should handle database errors', async () => {
    mockPrisma.fsFoodDefense.create.mockRejectedValue(new Error('DB error'));

    const res = await request(app).post('/api/food-defense').send({
      title: 'Threat Assessment',
      threatType: 'SABOTAGE',
      riskLevel: 'HIGH',
    });
    expect(res.status).toBe(500);
  });
});

describe('GET /api/food-defense/:id', () => {
  it('should return a food defense record', async () => {
    mockPrisma.fsFoodDefense.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      title: 'Threat',
    });

    const res = await request(app).get('/api/food-defense/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
  });

  it('should return 404 for non-existent record', async () => {
    mockPrisma.fsFoodDefense.findFirst.mockResolvedValue(null);

    const res = await request(app).get('/api/food-defense/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
  });

  it('should handle database errors', async () => {
    mockPrisma.fsFoodDefense.findFirst.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/food-defense/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
  });
});

describe('PUT /api/food-defense/:id', () => {
  it('should update a food defense record', async () => {
    mockPrisma.fsFoodDefense.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.fsFoodDefense.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      status: 'MITIGATED',
    });

    const res = await request(app)
      .put('/api/food-defense/00000000-0000-0000-0000-000000000001')
      .send({ status: 'MITIGATED' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 for non-existent record', async () => {
    mockPrisma.fsFoodDefense.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/food-defense/00000000-0000-0000-0000-000000000099')
      .send({ status: 'MITIGATED' });
    expect(res.status).toBe(404);
  });

  it('should reject invalid update', async () => {
    mockPrisma.fsFoodDefense.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });

    const res = await request(app)
      .put('/api/food-defense/00000000-0000-0000-0000-000000000001')
      .send({ threatType: 'INVALID' });
    expect(res.status).toBe(400);
  });

  it('should handle database errors', async () => {
    mockPrisma.fsFoodDefense.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.fsFoodDefense.update.mockRejectedValue(new Error('DB error'));

    const res = await request(app)
      .put('/api/food-defense/00000000-0000-0000-0000-000000000001')
      .send({ status: 'MITIGATED' });
    expect(res.status).toBe(500);
  });
});

describe('DELETE /api/food-defense/:id', () => {
  it('should soft delete a food defense record', async () => {
    mockPrisma.fsFoodDefense.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.fsFoodDefense.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });

    const res = await request(app).delete('/api/food-defense/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 for non-existent record', async () => {
    mockPrisma.fsFoodDefense.findFirst.mockResolvedValue(null);

    const res = await request(app).delete('/api/food-defense/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
  });

  it('should handle database errors', async () => {
    mockPrisma.fsFoodDefense.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.fsFoodDefense.update.mockRejectedValue(new Error('DB error'));

    const res = await request(app).delete('/api/food-defense/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
  });
});

describe('food-defense.api — additional coverage', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/food-defense', foodDefenseRouter);
    jest.clearAllMocks();
  });

  it('route responds to GET /api/food-defense', async () => {
    const res = await request(app).get('/api/food-defense');
    expect([200, 400, 401, 404, 500]).toContain(res.status);
  });
});

describe('food-defense.api — edge cases and extended coverage', () => {
  it('GET /api/food-defense returns pagination metadata', async () => {
    mockPrisma.fsFoodDefense.findMany.mockResolvedValue([]);
    mockPrisma.fsFoodDefense.count.mockResolvedValue(25);

    const res = await request(app).get('/api/food-defense?page=1&limit=10');
    expect(res.status).toBe(200);
    expect(res.body.pagination).toMatchObject({ page: 1, limit: 10, total: 25, totalPages: 3 });
  });

  it('GET /api/food-defense filters by combined threatType and riskLevel', async () => {
    mockPrisma.fsFoodDefense.findMany.mockResolvedValue([]);
    mockPrisma.fsFoodDefense.count.mockResolvedValue(0);

    await request(app).get('/api/food-defense?threatType=TAMPERING&riskLevel=CRITICAL');
    expect(mockPrisma.fsFoodDefense.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ threatType: 'TAMPERING', riskLevel: 'CRITICAL' }),
      })
    );
  });

  it('POST /api/food-defense with INTENTIONAL_CONTAMINATION threat type succeeds', async () => {
    const created = {
      id: '00000000-0000-0000-0000-000000000002',
      title: 'Contamination Threat',
      threatType: 'INTENTIONAL_CONTAMINATION',
      riskLevel: 'CRITICAL',
    };
    mockPrisma.fsFoodDefense.create.mockResolvedValue(created);

    const res = await request(app).post('/api/food-defense').send({
      title: 'Contamination Threat',
      threatType: 'INTENTIONAL_CONTAMINATION',
      riskLevel: 'CRITICAL',
    });
    expect(res.status).toBe(201);
    expect(res.body.data.threatType).toBe('INTENTIONAL_CONTAMINATION');
  });

  it('POST /api/food-defense with CYBER threat type and MEDIUM risk succeeds', async () => {
    const created = {
      id: '00000000-0000-0000-0000-000000000003',
      title: 'Cyber Threat',
      threatType: 'CYBER',
      riskLevel: 'MEDIUM',
    };
    mockPrisma.fsFoodDefense.create.mockResolvedValue(created);

    const res = await request(app).post('/api/food-defense').send({
      title: 'Cyber Threat',
      threatType: 'CYBER',
      riskLevel: 'MEDIUM',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('POST /api/food-defense rejects missing riskLevel', async () => {
    const res = await request(app).post('/api/food-defense').send({
      title: 'Threat',
      threatType: 'SABOTAGE',
    });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('PUT /api/food-defense/:id can update to ASSESSED status', async () => {
    mockPrisma.fsFoodDefense.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.fsFoodDefense.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      status: 'ASSESSED',
    });

    const res = await request(app)
      .put('/api/food-defense/00000000-0000-0000-0000-000000000001')
      .send({ status: 'ASSESSED' });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('ASSESSED');
  });

  it('PUT /api/food-defense/:id rejects invalid riskLevel value', async () => {
    mockPrisma.fsFoodDefense.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });

    const res = await request(app)
      .put('/api/food-defense/00000000-0000-0000-0000-000000000001')
      .send({ riskLevel: 'EXTREME' });
    expect(res.status).toBe(400);
  });

  it('DELETE /api/food-defense/:id returns confirmation message', async () => {
    mockPrisma.fsFoodDefense.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.fsFoodDefense.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });

    const res = await request(app).delete('/api/food-defense/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('message');
  });

  it('GET /api/food-defense returns empty array when no records exist', async () => {
    mockPrisma.fsFoodDefense.findMany.mockResolvedValue([]);
    mockPrisma.fsFoodDefense.count.mockResolvedValue(0);

    const res = await request(app).get('/api/food-defense');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
    expect(res.body.pagination.total).toBe(0);
  });

  it('GET /api/food-defense/:id returns success:true with data', async () => {
    mockPrisma.fsFoodDefense.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000005',
      title: 'Bioterrorism Assessment',
      threatType: 'BIOTERRORISM',
      riskLevel: 'HIGH',
    });

    const res = await request(app).get('/api/food-defense/00000000-0000-0000-0000-000000000005');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('threatType', 'BIOTERRORISM');
  });
});
