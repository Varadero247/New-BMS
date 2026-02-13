import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    esgStakeholder: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
  },
  Prisma: {
    Decimal: jest.fn((v: any) => v),
  },
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

import stakeholdersRouter from '../src/routes/stakeholders';
import { prisma } from '../src/prisma';

const app = express();
app.use(express.json());
app.use('/api/stakeholders', stakeholdersRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

const mockStakeholder = {
  id: 'stk-1',
  name: 'Acme Investors',
  type: 'INVESTOR',
  contactEmail: 'invest@acme.com',
  engagementLevel: 'HIGH',
  lastEngagement: new Date('2026-01-15'),
  notes: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  createdBy: 'user-123',
};

describe('GET /api/stakeholders', () => {
  it('should return paginated stakeholders list', async () => {
    (prisma.esgStakeholder.findMany as jest.Mock).mockResolvedValue([mockStakeholder]);
    (prisma.esgStakeholder.count as jest.Mock).mockResolvedValue(1);

    const res = await request(app).get('/api/stakeholders');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });

  it('should filter by type', async () => {
    (prisma.esgStakeholder.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.esgStakeholder.count as jest.Mock).mockResolvedValue(0);

    await request(app).get('/api/stakeholders?type=INVESTOR');
    expect(prisma.esgStakeholder.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ type: 'INVESTOR' }) })
    );
  });

  it('should filter by engagementLevel', async () => {
    (prisma.esgStakeholder.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.esgStakeholder.count as jest.Mock).mockResolvedValue(0);

    await request(app).get('/api/stakeholders?engagementLevel=HIGH');
    expect(prisma.esgStakeholder.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ engagementLevel: 'HIGH' }) })
    );
  });

  it('should return empty list', async () => {
    (prisma.esgStakeholder.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.esgStakeholder.count as jest.Mock).mockResolvedValue(0);

    const res = await request(app).get('/api/stakeholders');
    expect(res.body.data).toHaveLength(0);
  });
});

describe('POST /api/stakeholders', () => {
  it('should create a stakeholder', async () => {
    (prisma.esgStakeholder.create as jest.Mock).mockResolvedValue(mockStakeholder);

    const res = await request(app).post('/api/stakeholders').send({
      name: 'Acme Investors',
      type: 'INVESTOR',
      contactEmail: 'invest@acme.com',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should return 400 for missing name', async () => {
    const res = await request(app).post('/api/stakeholders').send({
      type: 'INVESTOR',
    });

    expect(res.status).toBe(400);
  });

  it('should return 400 for invalid type', async () => {
    const res = await request(app).post('/api/stakeholders').send({
      name: 'Test',
      type: 'INVALID',
    });

    expect(res.status).toBe(400);
  });
});

describe('GET /api/stakeholders/:id', () => {
  it('should return a single stakeholder', async () => {
    (prisma.esgStakeholder.findFirst as jest.Mock).mockResolvedValue(mockStakeholder);

    const res = await request(app).get('/api/stakeholders/stk-1');
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('stk-1');
  });

  it('should return 404 when not found', async () => {
    (prisma.esgStakeholder.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await request(app).get('/api/stakeholders/nonexistent');
    expect(res.status).toBe(404);
  });
});

describe('PUT /api/stakeholders/:id', () => {
  it('should update a stakeholder', async () => {
    (prisma.esgStakeholder.findFirst as jest.Mock).mockResolvedValue(mockStakeholder);
    (prisma.esgStakeholder.update as jest.Mock).mockResolvedValue({ ...mockStakeholder, engagementLevel: 'MEDIUM' });

    const res = await request(app).put('/api/stakeholders/stk-1').send({ engagementLevel: 'MEDIUM' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 when not found', async () => {
    (prisma.esgStakeholder.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await request(app).put('/api/stakeholders/nonexistent').send({ name: 'Updated' });
    expect(res.status).toBe(404);
  });

  it('should return 400 for invalid data', async () => {
    const res = await request(app).put('/api/stakeholders/stk-1').send({ type: 'INVALID' });
    expect(res.status).toBe(400);
  });
});

describe('DELETE /api/stakeholders/:id', () => {
  it('should soft delete a stakeholder', async () => {
    (prisma.esgStakeholder.findFirst as jest.Mock).mockResolvedValue(mockStakeholder);
    (prisma.esgStakeholder.update as jest.Mock).mockResolvedValue({ ...mockStakeholder, deletedAt: new Date() });

    const res = await request(app).delete('/api/stakeholders/stk-1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 when not found', async () => {
    (prisma.esgStakeholder.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await request(app).delete('/api/stakeholders/nonexistent');
    expect(res.status).toBe(404);
  });
});
