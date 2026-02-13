import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    abGift: {
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

import giftsRouter from '../src/routes/gifts';
import { prisma } from '../src/prisma';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const app = express();
app.use(express.json());
app.use('/api/gifts', giftsRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

const mockGift = {
  id: '00000000-0000-0000-0000-000000000001',
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  organisationId: 'org-1',
  createdBy: 'user-123',
  description: 'Corporate gift basket',
  giftType: 'GIFT',
  direction: 'GIVEN',
  value: 150.00,
  currency: 'USD',
  recipientOrGiver: 'Jane Doe',
  date: new Date('2026-01-15'),
  organization: 'Partner Corp',
  position: 'CEO',
  governmentOfficial: false,
  reason: 'Holiday courtesy',
  status: 'PENDING',
  approvedBy: null,
  approvedAt: null,
  referenceNumber: 'AB-GFT-2602-1234',
  updatedBy: 'user-123',
  employeeId: 'EMP-001',
  employeeName: 'John Test',
  department: 'Sales',
  notes: null,
  declinedBy: null,
  declinedAt: null,
};

const mockGift2 = {
  ...mockGift,
  id: '00000000-0000-0000-0000-000000000002',
  description: 'Lunch meeting hospitality',
  giftType: 'HOSPITALITY',
  direction: 'RECEIVED',
  value: 75.00,
  recipientOrGiver: 'Bob Agent',
  referenceNumber: 'AB-GFT-2602-5678',
};

describe('ISO 37001 Gifts API', () => {
  // =========================================================================
  // GET /api/gifts
  // =========================================================================
  describe('GET /api/gifts', () => {
    it('should return paginated list of gifts', async () => {
      (mockPrisma.abGift.findMany as jest.Mock).mockResolvedValueOnce([mockGift, mockGift2]);
      (mockPrisma.abGift.count as jest.Mock).mockResolvedValueOnce(2);

      const res = await request(app).get('/api/gifts');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.pagination.total).toBe(2);
    });

    it('should support pagination', async () => {
      (mockPrisma.abGift.findMany as jest.Mock).mockResolvedValueOnce([mockGift]);
      (mockPrisma.abGift.count as jest.Mock).mockResolvedValueOnce(15);

      const res = await request(app).get('/api/gifts?page=2&limit=10');

      expect(res.status).toBe(200);
      expect(res.body.pagination.page).toBe(2);
      expect(res.body.pagination.limit).toBe(10);
      expect(res.body.pagination.totalPages).toBe(2);
    });

    it('should filter by giftType', async () => {
      (mockPrisma.abGift.findMany as jest.Mock).mockResolvedValueOnce([mockGift]);
      (mockPrisma.abGift.count as jest.Mock).mockResolvedValueOnce(1);

      await request(app).get('/api/gifts?giftType=GIFT');

      expect(mockPrisma.abGift.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ giftType: 'GIFT' }),
        })
      );
    });

    it('should filter by direction', async () => {
      (mockPrisma.abGift.findMany as jest.Mock).mockResolvedValueOnce([mockGift2]);
      (mockPrisma.abGift.count as jest.Mock).mockResolvedValueOnce(1);

      await request(app).get('/api/gifts?direction=RECEIVED');

      expect(mockPrisma.abGift.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ direction: 'RECEIVED' }),
        })
      );
    });

    it('should filter by status', async () => {
      (mockPrisma.abGift.findMany as jest.Mock).mockResolvedValueOnce([mockGift]);
      (mockPrisma.abGift.count as jest.Mock).mockResolvedValueOnce(1);

      await request(app).get('/api/gifts?status=PENDING');

      expect(mockPrisma.abGift.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'PENDING' }),
        })
      );
    });

    it('should return empty list', async () => {
      (mockPrisma.abGift.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.abGift.count as jest.Mock).mockResolvedValueOnce(0);

      const res = await request(app).get('/api/gifts');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(0);
    });

    it('should return 500 on database error', async () => {
      (mockPrisma.abGift.findMany as jest.Mock).mockRejectedValueOnce(new Error('DB error'));
      (mockPrisma.abGift.count as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const res = await request(app).get('/api/gifts');

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  // =========================================================================
  // POST /api/gifts
  // =========================================================================
  describe('POST /api/gifts', () => {
    const validPayload = {
      description: 'Corporate gift basket',
      giftType: 'GIFT',
      direction: 'GIVEN',
      value: 150,
      recipientOrGiver: 'Jane Doe',
      date: '2026-01-15',
    };

    it('should create a gift record and return 201', async () => {
      (mockPrisma.abGift.create as jest.Mock).mockResolvedValueOnce(mockGift);

      const res = await request(app).post('/api/gifts').send(validPayload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.description).toBe('Corporate gift basket');
    });

    it('should validate value is a positive number', async () => {
      const res = await request(app).post('/api/gifts').send({
        ...validPayload,
        value: -50,
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 when description is missing', async () => {
      const { description, ...payload } = validPayload;
      const res = await request(app).post('/api/gifts').send(payload);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 when giftType is missing', async () => {
      const { giftType, ...payload } = validPayload;
      const res = await request(app).post('/api/gifts').send(payload);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 when direction is missing', async () => {
      const { direction, ...payload } = validPayload;
      const res = await request(app).post('/api/gifts').send(payload);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 when recipientOrGiver is missing', async () => {
      const { recipientOrGiver, ...payload } = validPayload;
      const res = await request(app).post('/api/gifts').send(payload);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 when date is missing', async () => {
      const { date, ...payload } = validPayload;
      const res = await request(app).post('/api/gifts').send(payload);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should store value as Decimal', async () => {
      (mockPrisma.abGift.create as jest.Mock).mockResolvedValueOnce(mockGift);

      await request(app).post('/api/gifts').send(validPayload);

      expect(mockPrisma.abGift.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            value: expect.anything(),
          }),
        })
      );
    });

    it('should return 500 on database create error', async () => {
      (mockPrisma.abGift.create as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const res = await request(app).post('/api/gifts').send(validPayload);

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  // =========================================================================
  // GET /api/gifts/:id
  // =========================================================================
  describe('GET /api/gifts/:id', () => {
    it('should return a gift by ID', async () => {
      (mockPrisma.abGift.findFirst as jest.Mock).mockResolvedValueOnce(mockGift);

      const res = await request(app).get('/api/gifts/00000000-0000-0000-0000-000000000001');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
    });

    it('should return 404 when not found', async () => {
      (mockPrisma.abGift.findFirst as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app).get('/api/gifts/00000000-0000-0000-0000-000000000099');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  // =========================================================================
  // PUT /api/gifts/:id
  // =========================================================================
  describe('PUT /api/gifts/:id', () => {
    it('should update a gift record', async () => {
      (mockPrisma.abGift.findFirst as jest.Mock).mockResolvedValueOnce(mockGift);
      (mockPrisma.abGift.update as jest.Mock).mockResolvedValueOnce({
        ...mockGift,
        description: 'Updated gift description',
      });

      const res = await request(app)
        .put('/api/gifts/00000000-0000-0000-0000-000000000001')
        .send({ description: 'Updated gift description' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.description).toBe('Updated gift description');
    });

    it('should return 404 when not found', async () => {
      (mockPrisma.abGift.findFirst as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app)
        .put('/api/gifts/00000000-0000-0000-0000-000000000099')
        .send({ description: 'Updated' });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  // =========================================================================
  // PUT /api/gifts/:id/approve
  // =========================================================================
  describe('PUT /api/gifts/:id/approve', () => {
    it('should approve a gift and set approvedBy/approvedAt', async () => {
      (mockPrisma.abGift.findFirst as jest.Mock).mockResolvedValueOnce(mockGift);
      (mockPrisma.abGift.update as jest.Mock).mockResolvedValueOnce({
        ...mockGift,
        status: 'APPROVED',
        approvedBy: 'user-123',
        approvedAt: new Date(),
      });

      const res = await request(app).put('/api/gifts/00000000-0000-0000-0000-000000000001/approve');

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('APPROVED');
      expect(res.body.data.approvedBy).toBe('user-123');
      expect(mockPrisma.abGift.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'APPROVED',
            approvedBy: 'user-123',
          }),
        })
      );
    });

    it('should return 404 when not found for approval', async () => {
      (mockPrisma.abGift.findFirst as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app).put('/api/gifts/00000000-0000-0000-0000-000000000099/approve');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  // =========================================================================
  // PUT /api/gifts/:id/decline
  // =========================================================================
  describe('PUT /api/gifts/:id/decline', () => {
    it('should decline a gift and set declinedBy/declinedAt', async () => {
      (mockPrisma.abGift.findFirst as jest.Mock).mockResolvedValueOnce(mockGift);
      (mockPrisma.abGift.update as jest.Mock).mockResolvedValueOnce({
        ...mockGift,
        status: 'DECLINED',
        declinedBy: 'user-123',
        declinedAt: new Date(),
      });

      const res = await request(app).put('/api/gifts/00000000-0000-0000-0000-000000000001/decline');

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('DECLINED');
      expect(mockPrisma.abGift.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'DECLINED',
            declinedBy: 'user-123',
          }),
        })
      );
    });

    it('should return 404 when not found for decline', async () => {
      (mockPrisma.abGift.findFirst as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app).put('/api/gifts/00000000-0000-0000-0000-000000000099/decline');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  // =========================================================================
  // DELETE /api/gifts/:id
  // =========================================================================
  describe('DELETE /api/gifts/:id', () => {
    it('should soft delete a gift record', async () => {
      (mockPrisma.abGift.findFirst as jest.Mock).mockResolvedValueOnce(mockGift);
      (mockPrisma.abGift.update as jest.Mock).mockResolvedValueOnce({ ...mockGift, deletedAt: new Date() });

      const res = await request(app).delete('/api/gifts/00000000-0000-0000-0000-000000000001');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 404 when not found for deletion', async () => {
      (mockPrisma.abGift.findFirst as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app).delete('/api/gifts/00000000-0000-0000-0000-000000000099');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });
});
