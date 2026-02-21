import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    isScope: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      upsert: jest.fn(),
    },
  },
  Prisma: { Decimal: jest.fn((v: any) => v) },
}));

jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((req: any, _res: any, next: any) => {
    req.user = {
      id: '00000000-0000-4000-a000-000000000123',
      email: 'test@test.com',
      role: 'ADMIN',
    };
    next();
  }),
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

import router from '../src/routes/scope';
import { prisma } from '../src/prisma';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const app = express();
app.use(express.json());
app.use('/api/scope', router);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('InfoSec Scope API', () => {
  const mockScope = {
    id: 'a7000000-0000-4000-a000-000000000001',
    name: 'ISMS Scope',
    description: 'Full organizational ISMS scope',
    boundaries: 'All UK offices',
    inclusions: 'IT systems, personnel',
    exclusions: 'Third-party SaaS',
    justification: 'Business need',
    interestedParties: ['Management', 'Customers'],
    applicableRequirements: ['ISO 27001', 'GDPR'],
    interfaces: ['Cloud providers'],
    status: 'DRAFT',
    createdBy: '00000000-0000-4000-a000-000000000123',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // ---- GET /api/scope ----

  describe('GET /api/scope', () => {
    it('should return the current scope document', async () => {
      (mockPrisma.isScope.findFirst as jest.Mock).mockResolvedValueOnce(mockScope);

      const res = await request(app).get('/api/scope');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual(mockScope);
      expect(mockPrisma.isScope.findFirst).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should return null when no scope exists', async () => {
      (mockPrisma.isScope.findFirst as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app).get('/api/scope');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeNull();
    });

    it('should return 500 on database error', async () => {
      (mockPrisma.isScope.findFirst as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const res = await request(app).get('/api/scope');

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });

    it('findFirst is called once per GET request', async () => {
      (mockPrisma.isScope.findFirst as jest.Mock).mockResolvedValueOnce(null);
      await request(app).get('/api/scope');
      expect(mockPrisma.isScope.findFirst).toHaveBeenCalledTimes(1);
    });
  });

  // ---- PUT /api/scope ----

  describe('PUT /api/scope', () => {
    it('should create scope if none exists', async () => {
      (mockPrisma.isScope.findFirst as jest.Mock).mockResolvedValueOnce(null);
      (mockPrisma.isScope.create as jest.Mock).mockResolvedValueOnce(mockScope);

      const res = await request(app)
        .put('/api/scope')
        .send({ name: 'ISMS Scope', description: 'Full scope' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(mockPrisma.isScope.create).toHaveBeenCalled();
      expect(mockPrisma.isScope.update).not.toHaveBeenCalled();
    });

    it('should update existing scope', async () => {
      (mockPrisma.isScope.findFirst as jest.Mock).mockResolvedValueOnce(mockScope);
      const updated = { ...mockScope, name: 'Updated Scope' };
      (mockPrisma.isScope.update as jest.Mock).mockResolvedValueOnce(updated);

      const res = await request(app).put('/api/scope').send({ name: 'Updated Scope' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(mockPrisma.isScope.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: mockScope.id },
        })
      );
    });

    it('should accept valid status values', async () => {
      (mockPrisma.isScope.findFirst as jest.Mock).mockResolvedValueOnce(mockScope);
      (mockPrisma.isScope.update as jest.Mock).mockResolvedValueOnce({
        ...mockScope,
        status: 'ACTIVE',
      });

      const res = await request(app).put('/api/scope').send({ status: 'ACTIVE' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 400 for invalid status', async () => {
      const res = await request(app).put('/api/scope').send({ status: 'INVALID_STATUS' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should accept arrays for interestedParties', async () => {
      (mockPrisma.isScope.findFirst as jest.Mock).mockResolvedValueOnce(null);
      (mockPrisma.isScope.create as jest.Mock).mockResolvedValueOnce(mockScope);

      const res = await request(app)
        .put('/api/scope')
        .send({
          interestedParties: ['Board', 'Clients'],
          applicableRequirements: ['ISO 27001'],
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 400 when name exceeds max length', async () => {
      const res = await request(app)
        .put('/api/scope')
        .send({ name: 'x'.repeat(201) });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 500 on database error during update', async () => {
      (mockPrisma.isScope.findFirst as jest.Mock).mockResolvedValueOnce(mockScope);
      (mockPrisma.isScope.update as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const res = await request(app).put('/api/scope').send({ name: 'Fail' });

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });

    it('should pass updatedBy from authenticated user when updating', async () => {
      (mockPrisma.isScope.findFirst as jest.Mock).mockResolvedValueOnce(mockScope);
      (mockPrisma.isScope.update as jest.Mock).mockResolvedValueOnce(mockScope);

      await request(app).put('/api/scope').send({ description: 'New desc' });

      const updateCall = (mockPrisma.isScope.update as jest.Mock).mock.calls[0][0];
      expect(updateCall.data.updatedBy).toBe('00000000-0000-4000-a000-000000000123');
    });

    it('should pass createdBy from authenticated user when creating', async () => {
      (mockPrisma.isScope.findFirst as jest.Mock).mockResolvedValueOnce(null);
      (mockPrisma.isScope.create as jest.Mock).mockResolvedValueOnce(mockScope);

      await request(app).put('/api/scope').send({ name: 'New Scope' });

      const createCall = (mockPrisma.isScope.create as jest.Mock).mock.calls[0][0];
      expect(createCall.data.createdBy).toBe('00000000-0000-4000-a000-000000000123');
    });

    it('should return 500 on database error during create', async () => {
      (mockPrisma.isScope.findFirst as jest.Mock).mockResolvedValueOnce(null);
      (mockPrisma.isScope.create as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const res = await request(app).put('/api/scope').send({ name: 'New Scope' });

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });
});

describe('InfoSec Scope — extended', () => {
  it('PUT /scope with interfaces array succeeds and returns success:true', async () => {
    (mockPrisma.isScope.findFirst as jest.Mock).mockResolvedValueOnce(null);
    (mockPrisma.isScope.create as jest.Mock).mockResolvedValueOnce({
      id: 'scope-2',
      title: 'With Interfaces',
      status: 'DRAFT',
      createdBy: '00000000-0000-4000-a000-000000000123',
    });

    const res = await request(app)
      .put('/api/scope')
      .send({ name: 'With Interfaces', interfaces: ['API Gateway', 'LDAP'] });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(mockPrisma.isScope.create).toHaveBeenCalledTimes(1);
  });
});
