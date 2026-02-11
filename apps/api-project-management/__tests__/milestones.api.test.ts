import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    projectMilestone: {
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
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

import { prisma } from '../src/prisma';
import milestonesRouter from '../src/routes/milestones';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const mockMilestone = {
  id: 'ms-001',
  projectId: 'proj-001',
  milestoneName: 'Phase 1 Complete',
  milestoneDescription: 'All phase 1 deliverables completed',
  plannedDate: '2025-06-30T00:00:00.000Z',
  actualDate: null,
  baselineDate: '2025-06-30T00:00:00.000Z',
  deliverables: 'Design docs, Prototype',
  requiresApproval: true,
  isCritical: true,
  status: 'UPCOMING',
  approvalStatus: 'PENDING',
  approvedBy: null,
  approvedAt: null,
  achievementPercentage: 0,
  createdAt: '2025-01-15T00:00:00.000Z',
  updatedAt: '2025-01-15T00:00:00.000Z',
};

describe('Milestones API Routes', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/milestones', milestonesRouter);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ========== GET / ==========

  describe('GET /api/milestones', () => {
    it('should list milestones for a given projectId', async () => {
      (mockPrisma.projectMilestone.findMany as jest.Mock).mockResolvedValueOnce([mockMilestone]);
      (mockPrisma.projectMilestone.count as jest.Mock).mockResolvedValueOnce(1);

      const res = await request(app).get('/api/milestones?projectId=proj-001');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].milestoneName).toBe('Phase 1 Complete');
      expect(res.body.meta).toEqual({ page: 1, limit: 50, total: 1, totalPages: 1 });
    });

    it('should return 400 when projectId is missing', async () => {
      const res = await request(app).get('/api/milestones');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
      expect(res.body.error.message).toBe('projectId query parameter is required');
    });

    it('should return 500 on database error', async () => {
      (mockPrisma.projectMilestone.findMany as jest.Mock).mockRejectedValueOnce(new Error('DB failure'));
      (mockPrisma.projectMilestone.count as jest.Mock).mockRejectedValueOnce(new Error('DB failure'));

      const res = await request(app).get('/api/milestones?projectId=proj-001');

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // ========== POST / ==========

  describe('POST /api/milestones', () => {
    it('should create a milestone successfully', async () => {
      (mockPrisma.projectMilestone.create as jest.Mock).mockResolvedValueOnce(mockMilestone);

      const res = await request(app).post('/api/milestones').send({
        projectId: 'proj-001',
        milestoneName: 'Phase 1 Complete',
        plannedDate: '2025-06-30',
        deliverables: 'Design docs, Prototype',
        requiresApproval: true,
        isCritical: true,
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.milestoneName).toBe('Phase 1 Complete');
      expect(mockPrisma.projectMilestone.create as jest.Mock).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            projectId: 'proj-001',
            milestoneName: 'Phase 1 Complete',
            requiresApproval: true,
            isCritical: true,
            status: 'UPCOMING',
            approvalStatus: 'PENDING',
            achievementPercentage: 0,
          }),
        }),
      );
    });

    it('should return 400 for missing required fields', async () => {
      const res = await request(app).post('/api/milestones').send({
        milestoneName: 'Missing projectId and plannedDate',
        // missing projectId and plannedDate
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
      expect(res.body.error.details).toBeDefined();
    });

    it('should return 500 on database error during create', async () => {
      (mockPrisma.projectMilestone.create as jest.Mock).mockRejectedValueOnce(new Error('DB failure'));

      const res = await request(app).post('/api/milestones').send({
        projectId: 'proj-001',
        milestoneName: 'Phase 2 Complete',
        plannedDate: '2025-09-30',
      });

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // ========== PUT /:id ==========

  describe('PUT /api/milestones/:id', () => {
    it('should update a milestone successfully', async () => {
      (mockPrisma.projectMilestone.findUnique as jest.Mock).mockResolvedValueOnce(mockMilestone);
      (mockPrisma.projectMilestone.update as jest.Mock).mockResolvedValueOnce({
        ...mockMilestone,
        milestoneName: 'Updated Milestone Name',
      });

      const res = await request(app).put('/api/milestones/ms-001').send({
        milestoneName: 'Updated Milestone Name',
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.milestoneName).toBe('Updated Milestone Name');
    });

    it('should return 404 if milestone not found', async () => {
      (mockPrisma.projectMilestone.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app).put('/api/milestones/nonexistent').send({
        milestoneName: 'Updated',
      });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('should auto-set achievementPercentage to 100 and actualDate when status is ACHIEVED', async () => {
      const upcomingMilestone = { ...mockMilestone, status: 'UPCOMING', achievementPercentage: 0 };
      (mockPrisma.projectMilestone.findUnique as jest.Mock).mockResolvedValueOnce(upcomingMilestone);
      (mockPrisma.projectMilestone.update as jest.Mock).mockResolvedValueOnce({
        ...upcomingMilestone,
        status: 'ACHIEVED',
        achievementPercentage: 100,
        actualDate: new Date(),
      });

      const res = await request(app).put('/api/milestones/ms-001').send({
        status: 'ACHIEVED',
      });

      expect(res.status).toBe(200);
      const updateCall = (mockPrisma.projectMilestone.update as jest.Mock).mock.calls[0][0];
      expect(updateCall.data.achievementPercentage).toBe(100);
      expect(updateCall.data.actualDate).toBeInstanceOf(Date);
    });

    it('should not auto-set achievement if already ACHIEVED', async () => {
      const achievedMilestone = { ...mockMilestone, status: 'ACHIEVED', achievementPercentage: 100 };
      (mockPrisma.projectMilestone.findUnique as jest.Mock).mockResolvedValueOnce(achievedMilestone);
      (mockPrisma.projectMilestone.update as jest.Mock).mockResolvedValueOnce({
        ...achievedMilestone,
        milestoneName: 'Renamed',
      });

      const res = await request(app).put('/api/milestones/ms-001').send({
        status: 'ACHIEVED',
        milestoneName: 'Renamed',
      });

      expect(res.status).toBe(200);
      const updateCall = (mockPrisma.projectMilestone.update as jest.Mock).mock.calls[0][0];
      // achievementPercentage should not be auto-set since existing status is already ACHIEVED
      expect(updateCall.data.achievementPercentage).toBeUndefined();
    });

    it('should return 500 on database error during update', async () => {
      (mockPrisma.projectMilestone.findUnique as jest.Mock).mockResolvedValueOnce(mockMilestone);
      (mockPrisma.projectMilestone.update as jest.Mock).mockRejectedValueOnce(new Error('DB failure'));

      const res = await request(app).put('/api/milestones/ms-001').send({
        milestoneName: 'Updated',
      });

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // ========== PUT /:id/approve ==========

  describe('PUT /api/milestones/:id/approve', () => {
    it('should approve a milestone successfully', async () => {
      (mockPrisma.projectMilestone.findUnique as jest.Mock).mockResolvedValueOnce(mockMilestone);
      (mockPrisma.projectMilestone.update as jest.Mock).mockResolvedValueOnce({
        ...mockMilestone,
        approvalStatus: 'APPROVED',
        approvedBy: 'user-123',
        approvedAt: new Date(),
      });

      const res = await request(app).put('/api/milestones/ms-001/approve');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.approvalStatus).toBe('APPROVED');
      expect(res.body.data.approvedBy).toBe('user-123');
      expect(mockPrisma.projectMilestone.update as jest.Mock).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'ms-001' },
          data: expect.objectContaining({
            approvalStatus: 'APPROVED',
            approvedBy: 'user-123',
          }),
        }),
      );
    });

    it('should return 404 if milestone not found for approval', async () => {
      (mockPrisma.projectMilestone.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app).put('/api/milestones/nonexistent/approve');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 500 on database error during approval', async () => {
      (mockPrisma.projectMilestone.findUnique as jest.Mock).mockResolvedValueOnce(mockMilestone);
      (mockPrisma.projectMilestone.update as jest.Mock).mockRejectedValueOnce(new Error('DB failure'));

      const res = await request(app).put('/api/milestones/ms-001/approve');

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // ========== DELETE /:id ==========

  describe('DELETE /api/milestones/:id', () => {
    it('should delete a milestone successfully', async () => {
      (mockPrisma.projectMilestone.findUnique as jest.Mock).mockResolvedValueOnce(mockMilestone);
      (mockPrisma.projectMilestone.delete as jest.Mock).mockResolvedValueOnce(mockMilestone);

      const res = await request(app).delete('/api/milestones/ms-001');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.message).toBe('Milestone deleted successfully');
    });

    it('should return 404 if milestone not found', async () => {
      (mockPrisma.projectMilestone.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app).delete('/api/milestones/nonexistent');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 500 on database error during delete', async () => {
      (mockPrisma.projectMilestone.findUnique as jest.Mock).mockResolvedValueOnce(mockMilestone);
      (mockPrisma.projectMilestone.delete as jest.Mock).mockRejectedValueOnce(new Error('DB failure'));

      const res = await request(app).delete('/api/milestones/ms-001');

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INTERNAL_ERROR');
    });
  });
});
