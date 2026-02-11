import express from 'express';
import request from 'supertest';

// Mock dependencies - use ../prisma (not @ims/database)
jest.mock('../src/prisma', () => ({
  prisma: {
    qualObjective: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    qualMilestone: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((req: any, _res: any, next: any) => {
    req.user = { id: 'user-123', email: 'test@test.com', role: 'USER' };
    next();
  }),
}));

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid-123'),
}));

import { prisma } from '../src/prisma';
import objectivesRoutes from '../src/routes/objectives';

const mockPrisma = prisma as any;

describe('Quality Objectives API Routes', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/objectives', objectivesRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================
  // GET /api/objectives — List objectives
  // ============================================
  describe('GET /api/objectives', () => {
    const mockObjectives = [
      {
        id: 'obj-1',
        referenceNumber: 'QMS-OBJ-2026-001',
        title: 'Reduce customer complaints',
        objectiveStatement: 'Reduce complaints by 30%',
        category: 'CUSTOMER_SATISFACTION',
        status: 'ON_TRACK',
        kpiDescription: 'Monthly complaints count',
        baselineValue: 50,
        targetValue: 35,
        currentValue: 42,
        unit: 'count',
        owner: 'John Doe',
        department: 'Quality',
        progressPercent: 40,
        milestones: [],
      },
      {
        id: 'obj-2',
        referenceNumber: 'QMS-OBJ-2026-002',
        title: 'Achieve ISO certification',
        objectiveStatement: 'Obtain ISO 9001:2015 certification',
        category: 'CERTIFICATION',
        status: 'NOT_STARTED',
        kpiDescription: 'Certification status',
        baselineValue: 0,
        targetValue: 1,
        currentValue: 0,
        unit: 'status',
        owner: 'Jane Smith',
        department: 'QMS',
        progressPercent: 0,
        milestones: [],
      },
    ];

    it('should return list of objectives with pagination', async () => {
      (mockPrisma.qualObjective.findMany as jest.Mock).mockResolvedValueOnce(mockObjectives);
      (mockPrisma.qualObjective.count as jest.Mock).mockResolvedValueOnce(2);

      const response = await request(app)
        .get('/api/objectives')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.items).toHaveLength(2);
      expect(response.body.data.page).toBe(1);
      expect(response.body.data.limit).toBe(20);
      expect(response.body.data.total).toBe(2);
      expect(response.body.data.totalPages).toBe(1);
    });

    it('should support pagination parameters', async () => {
      (mockPrisma.qualObjective.findMany as jest.Mock).mockResolvedValueOnce([mockObjectives[0]]);
      (mockPrisma.qualObjective.count as jest.Mock).mockResolvedValueOnce(30);

      const response = await request(app)
        .get('/api/objectives?page=2&limit=15')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.data.page).toBe(2);
      expect(response.body.data.limit).toBe(15);
      expect(response.body.data.totalPages).toBe(2);
    });

    it('should filter by category', async () => {
      (mockPrisma.qualObjective.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.qualObjective.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app)
        .get('/api/objectives?category=CUSTOMER_SATISFACTION')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.qualObjective.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            category: 'CUSTOMER_SATISFACTION',
          }),
        })
      );
    });

    it('should filter by status', async () => {
      (mockPrisma.qualObjective.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.qualObjective.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app)
        .get('/api/objectives?status=ON_TRACK')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.qualObjective.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'ON_TRACK',
          }),
        })
      );
    });

    it('should filter by search (case-insensitive title search)', async () => {
      (mockPrisma.qualObjective.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.qualObjective.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app)
        .get('/api/objectives?search=complaint')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.qualObjective.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            title: { contains: 'complaint', mode: 'insensitive' },
          }),
        })
      );
    });

    it('should order by createdAt descending and include milestones', async () => {
      (mockPrisma.qualObjective.findMany as jest.Mock).mockResolvedValueOnce(mockObjectives);
      (mockPrisma.qualObjective.count as jest.Mock).mockResolvedValueOnce(2);

      await request(app)
        .get('/api/objectives')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.qualObjective.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'desc' },
          include: { milestones: { orderBy: { targetDate: 'asc' } } },
        })
      );
    });

    it('should handle database errors', async () => {
      (mockPrisma.qualObjective.findMany as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .get('/api/objectives')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // ============================================
  // GET /api/objectives/:id — Get single objective
  // ============================================
  describe('GET /api/objectives/:id', () => {
    const mockObjective = {
      id: 'obj-1',
      referenceNumber: 'QMS-OBJ-2026-001',
      title: 'Reduce customer complaints',
      objectiveStatement: 'Reduce complaints by 30%',
      category: 'CUSTOMER_SATISFACTION',
      kpiDescription: 'Monthly complaints count',
      baselineValue: 50,
      targetValue: 35,
      unit: 'count',
      owner: 'John Doe',
      department: 'Quality',
      milestones: [
        { id: 'ms-1', title: 'Root cause analysis', status: 'COMPLETED' },
      ],
    };

    it('should return single objective with milestones', async () => {
      (mockPrisma.qualObjective.findUnique as jest.Mock).mockResolvedValueOnce(mockObjective);

      const response = await request(app)
        .get('/api/objectives/obj-1')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('obj-1');
      expect(response.body.data.milestones).toHaveLength(1);
      expect(mockPrisma.qualObjective.findUnique).toHaveBeenCalledWith({
        where: { id: 'obj-1' },
        include: { milestones: { orderBy: { targetDate: 'asc' } } },
      });
    });

    it('should return 404 for non-existent objective', async () => {
      (mockPrisma.qualObjective.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .get('/api/objectives/non-existent')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should handle database errors', async () => {
      (mockPrisma.qualObjective.findUnique as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .get('/api/objectives/obj-1')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // ============================================
  // POST /api/objectives — Create objective
  // ============================================
  describe('POST /api/objectives', () => {
    const createPayload = {
      title: 'New Objective',
      objectiveStatement: 'Achieve 99% on-time delivery',
      category: 'ON_TIME_DELIVERY',
      kpiDescription: 'On-time delivery percentage',
      baselineValue: 85,
      targetValue: 99,
      unit: 'percent',
      owner: 'John Doe',
      department: 'Operations',
      targetDate: '2026-12-31',
    };

    it('should create an objective successfully', async () => {
      (mockPrisma.qualObjective.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.qualObjective.create as jest.Mock).mockResolvedValueOnce({
        id: 'mock-uuid-123',
        referenceNumber: 'QMS-OBJ-2026-001',
        ...createPayload,
        status: 'NOT_STARTED',
        progressPercent: 0,
        milestones: [],
      });

      const response = await request(app)
        .post('/api/objectives')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(createPayload.title);
      expect(response.body.data.referenceNumber).toBe('QMS-OBJ-2026-001');
    });

    it('should return 400 for missing title', async () => {
      const response = await request(app)
        .post('/api/objectives')
        .set('Authorization', 'Bearer token')
        .send({
          objectiveStatement: 'Statement',
          category: 'ON_TIME_DELIVERY',
          kpiDescription: 'KPI',
          baselineValue: 0,
          targetValue: 100,
          unit: 'percent',
          owner: 'Test',
          department: 'Dept',
          targetDate: '2026-12-31',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for missing objectiveStatement', async () => {
      const response = await request(app)
        .post('/api/objectives')
        .set('Authorization', 'Bearer token')
        .send({
          title: 'Test',
          category: 'ON_TIME_DELIVERY',
          kpiDescription: 'KPI',
          baselineValue: 0,
          targetValue: 100,
          unit: 'percent',
          owner: 'Test',
          department: 'Dept',
          targetDate: '2026-12-31',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for missing kpiDescription', async () => {
      const response = await request(app)
        .post('/api/objectives')
        .set('Authorization', 'Bearer token')
        .send({
          title: 'Test',
          objectiveStatement: 'Statement',
          category: 'ON_TIME_DELIVERY',
          baselineValue: 0,
          targetValue: 100,
          unit: 'percent',
          owner: 'Test',
          department: 'Dept',
          targetDate: '2026-12-31',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid category', async () => {
      const response = await request(app)
        .post('/api/objectives')
        .set('Authorization', 'Bearer token')
        .send({
          ...createPayload,
          category: 'INVALID_CATEGORY',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors', async () => {
      (mockPrisma.qualObjective.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.qualObjective.create as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .post('/api/objectives')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // ============================================
  // PUT /api/objectives/:id — Update objective
  // ============================================
  describe('PUT /api/objectives/:id', () => {
    const existingObjective = {
      id: 'obj-1',
      title: 'Existing Objective',
      status: 'NOT_STARTED',
      progressPercent: 0,
    };

    it('should update objective successfully', async () => {
      (mockPrisma.qualObjective.findUnique as jest.Mock).mockResolvedValueOnce(existingObjective);
      (mockPrisma.qualObjective.update as jest.Mock).mockResolvedValueOnce({
        ...existingObjective,
        title: 'Updated Objective',
        milestones: [],
      });

      const response = await request(app)
        .put('/api/objectives/obj-1')
        .set('Authorization', 'Bearer token')
        .send({ title: 'Updated Objective' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Updated Objective');
    });

    it('should update status and progress', async () => {
      (mockPrisma.qualObjective.findUnique as jest.Mock).mockResolvedValueOnce(existingObjective);
      (mockPrisma.qualObjective.update as jest.Mock).mockResolvedValueOnce({
        ...existingObjective,
        status: 'ON_TRACK',
        progressPercent: 45,
        milestones: [],
      });

      const response = await request(app)
        .put('/api/objectives/obj-1')
        .set('Authorization', 'Bearer token')
        .send({ status: 'ON_TRACK', progressPercent: 45 });

      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe('ON_TRACK');
      expect(response.body.data.progressPercent).toBe(45);
    });

    it('should return 404 for non-existent objective', async () => {
      (mockPrisma.qualObjective.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .put('/api/objectives/non-existent')
        .set('Authorization', 'Bearer token')
        .send({ title: 'Updated' });

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 400 for invalid status value', async () => {
      (mockPrisma.qualObjective.findUnique as jest.Mock).mockResolvedValueOnce(existingObjective);

      const response = await request(app)
        .put('/api/objectives/obj-1')
        .set('Authorization', 'Bearer token')
        .send({ status: 'INVALID_STATUS' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid category value', async () => {
      (mockPrisma.qualObjective.findUnique as jest.Mock).mockResolvedValueOnce(existingObjective);

      const response = await request(app)
        .put('/api/objectives/obj-1')
        .set('Authorization', 'Bearer token')
        .send({ category: 'INVALID_CATEGORY' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors', async () => {
      (mockPrisma.qualObjective.findUnique as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .put('/api/objectives/obj-1')
        .set('Authorization', 'Bearer token')
        .send({ title: 'Updated' });

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // ============================================
  // DELETE /api/objectives/:id — Delete objective
  // ============================================
  describe('DELETE /api/objectives/:id', () => {
    it('should delete objective successfully', async () => {
      (mockPrisma.qualObjective.findUnique as jest.Mock).mockResolvedValueOnce({ id: 'obj-1' });
      (mockPrisma.qualObjective.delete as jest.Mock).mockResolvedValueOnce({});

      const response = await request(app)
        .delete('/api/objectives/obj-1')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(mockPrisma.qualObjective.delete).toHaveBeenCalledWith({
        where: { id: 'obj-1' },
      });
    });

    it('should return 404 for non-existent objective', async () => {
      (mockPrisma.qualObjective.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .delete('/api/objectives/non-existent')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should handle database errors', async () => {
      (mockPrisma.qualObjective.findUnique as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .delete('/api/objectives/obj-1')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // ============================================
  // POST /api/objectives/:id/milestones — Create milestone
  // ============================================
  describe('POST /api/objectives/:id/milestones', () => {
    const milestonePayload = {
      title: 'Phase 1 Complete',
      targetDate: '2026-06-30',
    };

    it('should create a milestone successfully', async () => {
      (mockPrisma.qualObjective.findUnique as jest.Mock).mockResolvedValueOnce({ id: 'obj-1' });
      (mockPrisma.qualMilestone.create as jest.Mock).mockResolvedValueOnce({
        id: 'ms-1',
        objectiveId: 'obj-1',
        title: 'Phase 1 Complete',
        targetDate: new Date('2026-06-30'),
        status: 'PENDING',
      });

      const response = await request(app)
        .post('/api/objectives/obj-1/milestones')
        .set('Authorization', 'Bearer token')
        .send(milestonePayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Phase 1 Complete');
      expect(response.body.data.objectiveId).toBe('obj-1');
    });

    it('should return 404 when parent objective does not exist', async () => {
      (mockPrisma.qualObjective.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .post('/api/objectives/non-existent/milestones')
        .set('Authorization', 'Bearer token')
        .send(milestonePayload);

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 400 for missing title', async () => {
      (mockPrisma.qualObjective.findUnique as jest.Mock).mockResolvedValueOnce({ id: 'obj-1' });

      const response = await request(app)
        .post('/api/objectives/obj-1/milestones')
        .set('Authorization', 'Bearer token')
        .send({ targetDate: '2026-06-30' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for missing targetDate', async () => {
      (mockPrisma.qualObjective.findUnique as jest.Mock).mockResolvedValueOnce({ id: 'obj-1' });

      const response = await request(app)
        .post('/api/objectives/obj-1/milestones')
        .set('Authorization', 'Bearer token')
        .send({ title: 'Phase 1' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors', async () => {
      (mockPrisma.qualObjective.findUnique as jest.Mock).mockResolvedValueOnce({ id: 'obj-1' });
      (mockPrisma.qualMilestone.create as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .post('/api/objectives/obj-1/milestones')
        .set('Authorization', 'Bearer token')
        .send(milestonePayload);

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // ============================================
  // PUT /api/objectives/:id/milestones/:milestoneId — Update milestone
  // ============================================
  describe('PUT /api/objectives/:id/milestones/:milestoneId', () => {
    const existingMilestone = {
      id: 'ms-1',
      objectiveId: 'obj-1',
      title: 'Phase 1 Complete',
      status: 'PENDING',
    };

    it('should update milestone successfully', async () => {
      (mockPrisma.qualMilestone.findFirst as jest.Mock).mockResolvedValueOnce(existingMilestone);
      (mockPrisma.qualMilestone.update as jest.Mock).mockResolvedValueOnce({
        ...existingMilestone,
        title: 'Phase 1 Updated',
      });

      const response = await request(app)
        .put('/api/objectives/obj-1/milestones/ms-1')
        .set('Authorization', 'Bearer token')
        .send({ title: 'Phase 1 Updated' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Phase 1 Updated');
    });

    it('should update milestone status to COMPLETED', async () => {
      (mockPrisma.qualMilestone.findFirst as jest.Mock).mockResolvedValueOnce(existingMilestone);
      (mockPrisma.qualMilestone.update as jest.Mock).mockResolvedValueOnce({
        ...existingMilestone,
        status: 'COMPLETED',
        completedDate: new Date(),
      });

      const response = await request(app)
        .put('/api/objectives/obj-1/milestones/ms-1')
        .set('Authorization', 'Bearer token')
        .send({ status: 'COMPLETED' });

      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe('COMPLETED');
    });

    it('should return 404 for non-existent milestone', async () => {
      (mockPrisma.qualMilestone.findFirst as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .put('/api/objectives/obj-1/milestones/non-existent')
        .set('Authorization', 'Bearer token')
        .send({ title: 'Updated' });

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 400 for invalid status value', async () => {
      (mockPrisma.qualMilestone.findFirst as jest.Mock).mockResolvedValueOnce(existingMilestone);

      const response = await request(app)
        .put('/api/objectives/obj-1/milestones/ms-1')
        .set('Authorization', 'Bearer token')
        .send({ status: 'INVALID_STATUS' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors', async () => {
      (mockPrisma.qualMilestone.findFirst as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .put('/api/objectives/obj-1/milestones/ms-1')
        .set('Authorization', 'Bearer token')
        .send({ title: 'Updated' });

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // ============================================
  // DELETE /api/objectives/:id/milestones/:milestoneId — Delete milestone
  // ============================================
  describe('DELETE /api/objectives/:id/milestones/:milestoneId', () => {
    it('should delete milestone successfully', async () => {
      (mockPrisma.qualMilestone.findFirst as jest.Mock).mockResolvedValueOnce({ id: 'ms-1', objectiveId: 'obj-1' });
      (mockPrisma.qualMilestone.delete as jest.Mock).mockResolvedValueOnce({});

      const response = await request(app)
        .delete('/api/objectives/obj-1/milestones/ms-1')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(mockPrisma.qualMilestone.delete).toHaveBeenCalledWith({
        where: { id: 'ms-1' },
      });
    });

    it('should return 404 for non-existent milestone', async () => {
      (mockPrisma.qualMilestone.findFirst as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .delete('/api/objectives/obj-1/milestones/non-existent')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should handle database errors', async () => {
      (mockPrisma.qualMilestone.findFirst as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .delete('/api/objectives/obj-1/milestones/ms-1')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });
});
