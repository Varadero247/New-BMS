import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    projectIssue: {
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
    req.user = { id: '20000000-0000-4000-a000-000000000123', email: 'test@test.com', role: 'USER' };
    next();
  }),
}));
jest.mock('@ims/service-auth', () => ({
  checkOwnership: () => (_req: any, _res: any, next: any) => next(),
  scopeToUser: (_req: any, _res: any, next: any) => next(),
}));

import { prisma } from '../src/prisma';
import issuesRouter from '../src/routes/issues';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('Project Issues API Routes', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/issues', issuesRouter);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/issues', () => {
    const mockIssues = [
      {
        id: '22000000-0000-4000-a000-000000000001',
        issueCode: 'ISS-001',
        issueTitle: 'Build pipeline failure',
        issueDescription: 'CI/CD pipeline fails intermittently',
        issueType: 'DEFECT',
        severity: 'HIGH',
        priority: 'HIGH',
        status: 'OPEN',
      },
      {
        id: 'issue-2',
        issueCode: 'ISS-002',
        issueTitle: 'Third-party API unavailable',
        issueDescription: 'External dependency is down',
        issueType: 'DEPENDENCY',
        severity: 'MEDIUM',
        priority: 'MEDIUM',
        status: 'OPEN',
      },
    ];

    it('should return list of issues with projectId', async () => {
      (mockPrisma.projectIssue.findMany as jest.Mock).mockResolvedValueOnce(mockIssues);
      (mockPrisma.projectIssue.count as jest.Mock).mockResolvedValueOnce(2);

      const response = await request(app)
        .get('/api/issues?projectId=proj-1')
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
        .get('/api/issues')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.message).toContain('projectId');
    });

    it('should filter by status', async () => {
      (mockPrisma.projectIssue.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.projectIssue.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app)
        .get('/api/issues?projectId=proj-1&status=OPEN')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.projectIssue.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            projectId: 'proj-1',
            status: 'OPEN',
          }),
        })
      );
    });

    it('should filter by severity', async () => {
      (mockPrisma.projectIssue.findMany as jest.Mock).mockResolvedValueOnce([mockIssues[0]]);
      (mockPrisma.projectIssue.count as jest.Mock).mockResolvedValueOnce(1);

      await request(app)
        .get('/api/issues?projectId=proj-1&severity=HIGH')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.projectIssue.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            projectId: 'proj-1',
            severity: 'HIGH',
          }),
        })
      );
    });

    it('should handle database errors', async () => {
      (mockPrisma.projectIssue.findMany as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .get('/api/issues?projectId=proj-1')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('POST /api/issues', () => {
    const createPayload = {
      projectId: 'proj-1',
      issueCode: 'ISS-003',
      issueTitle: 'Scope creep on module B',
      issueDescription: 'Additional requirements added without change request',
      issueType: 'SCOPE_CREEP',
    };

    it('should create an issue with raisedDate auto-set', async () => {
      (mockPrisma.projectIssue.create as jest.Mock).mockResolvedValueOnce({
        id: 'issue-new',
        ...createPayload,
        severity: 'MEDIUM',
        priority: 'MEDIUM',
        status: 'OPEN',
        raisedDate: new Date(),
        reportedBy: '20000000-0000-4000-a000-000000000123',
      });

      const response = await request(app)
        .post('/api/issues')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('OPEN');

      expect(mockPrisma.projectIssue.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          projectId: 'proj-1',
          issueCode: 'ISS-003',
          raisedDate: expect.any(Date),
          status: 'OPEN',
          reportedBy: '20000000-0000-4000-a000-000000000123',
        }),
      });
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/issues')
        .set('Authorization', 'Bearer token')
        .send({ projectId: 'proj-1' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors on create', async () => {
      (mockPrisma.projectIssue.create as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .post('/api/issues')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('PUT /api/issues/:id', () => {
    const existingIssue = {
      id: '22000000-0000-4000-a000-000000000001',
      issueCode: 'ISS-001',
      issueTitle: 'Build pipeline failure',
      issueDescription: 'CI/CD pipeline fails intermittently',
      issueType: 'DEFECT',
      severity: 'HIGH',
      priority: 'HIGH',
      status: 'OPEN',
    };

    it('should update issue successfully', async () => {
      (mockPrisma.projectIssue.findUnique as jest.Mock).mockResolvedValueOnce(existingIssue);
      (mockPrisma.projectIssue.update as jest.Mock).mockResolvedValueOnce({
        ...existingIssue,
        severity: 'CRITICAL',
      });

      const response = await request(app)
        .put('/api/issues/22000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ severity: 'CRITICAL' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 404 for 00000000-0000-4000-a000-ffffffffffff issue', async () => {
      (mockPrisma.projectIssue.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .put('/api/issues/00000000-0000-4000-a000-ffffffffffff')
        .set('Authorization', 'Bearer token')
        .send({ severity: 'LOW' });

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should handle database errors on update', async () => {
      (mockPrisma.projectIssue.findUnique as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .put('/api/issues/22000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ severity: 'LOW' });

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('PUT /api/issues/:id/resolve', () => {
    const existingIssue = {
      id: '22000000-0000-4000-a000-000000000001',
      issueCode: 'ISS-001',
      issueTitle: 'Build pipeline failure',
      status: 'OPEN',
    };

    it('should resolve issue successfully', async () => {
      (mockPrisma.projectIssue.findUnique as jest.Mock).mockResolvedValueOnce(existingIssue);
      (mockPrisma.projectIssue.update as jest.Mock).mockResolvedValueOnce({
        ...existingIssue,
        status: 'RESOLVED',
        resolutionDescription: 'Fixed the pipeline config',
        rootCause: 'Misconfigured build step',
        preventiveAction: 'Add validation to CI config',
        actualResolutionDate: new Date(),
      });

      const response = await request(app)
        .put('/api/issues/22000000-0000-4000-a000-000000000001/resolve')
        .set('Authorization', 'Bearer token')
        .send({
          resolutionDescription: 'Fixed the pipeline config',
          rootCause: 'Misconfigured build step',
          preventiveAction: 'Add validation to CI config',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('RESOLVED');

      expect(mockPrisma.projectIssue.update).toHaveBeenCalledWith({
        where: { id: '22000000-0000-4000-a000-000000000001' },
        data: expect.objectContaining({
          status: 'RESOLVED',
          resolutionDescription: 'Fixed the pipeline config',
          rootCause: 'Misconfigured build step',
          preventiveAction: 'Add validation to CI config',
          actualResolutionDate: expect.any(Date),
        }),
      });
    });

    it('should return 404 for 00000000-0000-4000-a000-ffffffffffff issue on resolve', async () => {
      (mockPrisma.projectIssue.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .put('/api/issues/00000000-0000-4000-a000-ffffffffffff/resolve')
        .set('Authorization', 'Bearer token')
        .send({ resolutionDescription: 'Fixed' });

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should handle database errors on resolve', async () => {
      (mockPrisma.projectIssue.findUnique as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .put('/api/issues/22000000-0000-4000-a000-000000000001/resolve')
        .set('Authorization', 'Bearer token')
        .send({ resolutionDescription: 'Fixed' });

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('DELETE /api/issues/:id', () => {
    it('should delete issue successfully', async () => {
      (mockPrisma.projectIssue.findUnique as jest.Mock).mockResolvedValueOnce({ id: '22000000-0000-4000-a000-000000000001' });
      (mockPrisma.projectIssue.delete as jest.Mock).mockResolvedValueOnce({});

      const response = await request(app)
        .delete('/api/issues/22000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(204);
      expect(mockPrisma.projectIssue.delete).toHaveBeenCalledWith({
        where: { id: '22000000-0000-4000-a000-000000000001' },
      });
    });

    it('should return 404 for 00000000-0000-4000-a000-ffffffffffff issue', async () => {
      (mockPrisma.projectIssue.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .delete('/api/issues/00000000-0000-4000-a000-ffffffffffff')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should handle database errors on delete', async () => {
      (mockPrisma.projectIssue.findUnique as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .delete('/api/issues/22000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });
});
