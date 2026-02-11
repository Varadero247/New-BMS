import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    projectChange: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
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
import changesRouter from '../src/routes/changes';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('Project Changes API Routes', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/changes', changesRouter);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/changes', () => {
    const mockChanges = [
      {
        id: 'change-1',
        changeCode: 'CHG-001',
        changeTitle: 'Add reporting module',
        changeDescription: 'Client requests additional reporting features',
        changeReason: 'New business requirement',
        changeType: 'SCOPE',
        status: 'SUBMITTED',
      },
      {
        id: 'change-2',
        changeCode: 'CHG-002',
        changeTitle: 'Extend timeline by 2 weeks',
        changeDescription: 'Additional time needed for testing',
        changeReason: 'QA resource constraints',
        changeType: 'SCHEDULE',
        status: 'APPROVED',
      },
    ];

    it('should return list of changes with projectId', async () => {
      (mockPrisma.projectChange.findMany as jest.Mock).mockResolvedValueOnce(mockChanges);
      (mockPrisma.projectChange.count as jest.Mock).mockResolvedValueOnce(2);

      const response = await request(app)
        .get('/api/changes?projectId=proj-1')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.meta).toMatchObject({
        page: 1,
        limit: 50,
        total: 2,
        totalPages: 1,
      });
    });

    it('should return 400 without projectId', async () => {
      const response = await request(app)
        .get('/api/changes')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.message).toContain('projectId');
    });

    it('should handle database errors', async () => {
      (mockPrisma.projectChange.findMany as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .get('/api/changes?projectId=proj-1')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('POST /api/changes', () => {
    const createPayload = {
      projectId: 'proj-1',
      changeCode: 'CHG-003',
      changeTitle: 'Budget increase for hardware',
      changeDescription: 'Additional servers needed for deployment',
      changeReason: 'Infrastructure requirements changed',
      changeType: 'BUDGET',
    };

    it('should create change request with auto-set requestDate and SUBMITTED status', async () => {
      (mockPrisma.projectChange.create as jest.Mock).mockResolvedValueOnce({
        id: 'change-new',
        ...createPayload,
        status: 'SUBMITTED',
        requestDate: new Date(),
        requestedBy: 'user-123',
        priority: 'MEDIUM',
        urgency: 'NORMAL',
      });

      const response = await request(app)
        .post('/api/changes')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('SUBMITTED');

      expect(mockPrisma.projectChange.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          projectId: 'proj-1',
          changeCode: 'CHG-003',
          status: 'SUBMITTED',
          requestDate: expect.any(Date),
          requestedBy: 'user-123',
        }),
      });
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/changes')
        .set('Authorization', 'Bearer token')
        .send({ projectId: 'proj-1' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors on create', async () => {
      (mockPrisma.projectChange.create as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .post('/api/changes')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('PUT /api/changes/:id', () => {
    const existingChange = {
      id: 'change-1',
      changeCode: 'CHG-001',
      changeTitle: 'Add reporting module',
      changeDescription: 'Client requests additional reporting features',
      changeReason: 'New business requirement',
      changeType: 'SCOPE',
      status: 'SUBMITTED',
    };

    it('should update change request successfully', async () => {
      (mockPrisma.projectChange.findUnique as jest.Mock).mockResolvedValueOnce(existingChange);
      (mockPrisma.projectChange.update as jest.Mock).mockResolvedValueOnce({
        ...existingChange,
        changeTitle: 'Updated title',
      });

      const response = await request(app)
        .put('/api/changes/change-1')
        .set('Authorization', 'Bearer token')
        .send({ changeTitle: 'Updated title' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 404 for non-existent change', async () => {
      (mockPrisma.projectChange.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .put('/api/changes/non-existent')
        .set('Authorization', 'Bearer token')
        .send({ changeTitle: 'Updated' });

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should handle database errors on update', async () => {
      (mockPrisma.projectChange.findUnique as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .put('/api/changes/change-1')
        .set('Authorization', 'Bearer token')
        .send({ changeTitle: 'Updated' });

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('PUT /api/changes/:id/review', () => {
    const existingChange = {
      id: 'change-1',
      changeCode: 'CHG-001',
      changeTitle: 'Add reporting module',
      status: 'SUBMITTED',
    };

    it('should review change request successfully', async () => {
      (mockPrisma.projectChange.findUnique as jest.Mock).mockResolvedValueOnce(existingChange);
      (mockPrisma.projectChange.update as jest.Mock).mockResolvedValueOnce({
        ...existingChange,
        status: 'UNDER_REVIEW',
        reviewedBy: 'user-123',
        reviewedAt: new Date(),
        reviewerComments: 'Looks reasonable',
      });

      const response = await request(app)
        .put('/api/changes/change-1/review')
        .set('Authorization', 'Bearer token')
        .send({ reviewerComments: 'Looks reasonable' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('UNDER_REVIEW');

      expect(mockPrisma.projectChange.update).toHaveBeenCalledWith({
        where: { id: 'change-1' },
        data: expect.objectContaining({
          status: 'UNDER_REVIEW',
          reviewedBy: 'user-123',
          reviewedAt: expect.any(Date),
          reviewerComments: 'Looks reasonable',
        }),
      });
    });

    it('should return 404 for non-existent change on review', async () => {
      (mockPrisma.projectChange.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .put('/api/changes/non-existent/review')
        .set('Authorization', 'Bearer token')
        .send({ reviewerComments: 'Review' });

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should handle database errors on review', async () => {
      (mockPrisma.projectChange.findUnique as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .put('/api/changes/change-1/review')
        .set('Authorization', 'Bearer token')
        .send({ reviewerComments: 'Review' });

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('PUT /api/changes/:id/approve', () => {
    const existingChange = {
      id: 'change-1',
      changeCode: 'CHG-001',
      changeTitle: 'Add reporting module',
      status: 'UNDER_REVIEW',
    };

    it('should approve change request successfully', async () => {
      (mockPrisma.projectChange.findUnique as jest.Mock).mockResolvedValueOnce(existingChange);
      (mockPrisma.projectChange.update as jest.Mock).mockResolvedValueOnce({
        ...existingChange,
        status: 'APPROVED',
        approvedBy: 'user-123',
        approvedAt: new Date(),
        approvalComments: 'Approved for implementation',
      });

      const response = await request(app)
        .put('/api/changes/change-1/approve')
        .set('Authorization', 'Bearer token')
        .send({ approvalComments: 'Approved for implementation' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('APPROVED');

      expect(mockPrisma.projectChange.update).toHaveBeenCalledWith({
        where: { id: 'change-1' },
        data: expect.objectContaining({
          status: 'APPROVED',
          approvedBy: 'user-123',
          approvedAt: expect.any(Date),
          approvalComments: 'Approved for implementation',
        }),
      });
    });

    it('should return 404 for non-existent change on approve', async () => {
      (mockPrisma.projectChange.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .put('/api/changes/non-existent/approve')
        .set('Authorization', 'Bearer token')
        .send({ approvalComments: 'Approved' });

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should handle database errors on approve', async () => {
      (mockPrisma.projectChange.findUnique as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .put('/api/changes/change-1/approve')
        .set('Authorization', 'Bearer token')
        .send({ approvalComments: 'Approved' });

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('DELETE /api/changes/:id', () => {
    it('should delete change request successfully', async () => {
      (mockPrisma.projectChange.findUnique as jest.Mock).mockResolvedValueOnce({ id: 'change-1' });
      (mockPrisma.projectChange.delete as jest.Mock).mockResolvedValueOnce({});

      const response = await request(app)
        .delete('/api/changes/change-1')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(mockPrisma.projectChange.delete).toHaveBeenCalledWith({
        where: { id: 'change-1' },
      });
    });

    it('should return 404 for non-existent change', async () => {
      (mockPrisma.projectChange.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .delete('/api/changes/non-existent')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should handle database errors on delete', async () => {
      (mockPrisma.projectChange.findUnique as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .delete('/api/changes/change-1')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });
});
