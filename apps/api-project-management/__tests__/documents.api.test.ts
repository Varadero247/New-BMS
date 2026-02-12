import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    projectDocument: {
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

import { prisma } from '../src/prisma';
import documentsRoutes from '../src/routes/documents';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('Documents API Routes', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/documents', documentsRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockDocument = {
    id: '1e000000-0000-4000-a000-000000000001',
    projectId: 'project-1',
    documentCode: 'DOC-001',
    documentTitle: 'Project Charter',
    documentType: 'CHARTER',
    version: '1.0',
    status: 'DRAFT',
    createdBy: '20000000-0000-4000-a000-000000000123',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe('GET /api/documents', () => {
    it('should return list of documents for a given projectId', async () => {
      (mockPrisma.projectDocument.findMany as jest.Mock).mockResolvedValueOnce([mockDocument]);
      (mockPrisma.projectDocument.count as jest.Mock).mockResolvedValueOnce(1);

      const response = await request(app)
        .get('/api/documents?projectId=project-1')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].id).toBe('1e000000-0000-4000-a000-000000000001');
      expect(response.body.meta).toMatchObject({
        page: 1,
        limit: 50,
        total: 1,
        totalPages: 1,
      });
    });

    it('should return 400 when projectId is missing', async () => {
      const response = await request(app)
        .get('/api/documents')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.message).toBe('projectId query parameter is required');
    });

    it('should handle database errors with 500', async () => {
      (mockPrisma.projectDocument.findMany as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .get('/api/documents?projectId=project-1')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('POST /api/documents', () => {
    const createPayload = {
      projectId: 'project-1',
      documentCode: 'DOC-002',
      documentTitle: 'Project Plan',
      documentType: 'PLAN',
    };

    it('should create a document successfully with defaults', async () => {
      const createdDocument = {
        id: 'doc-2',
        ...createPayload,
        version: '1.0',
        accessLevel: 'PROJECT_TEAM',
        status: 'DRAFT',
        createdBy: '20000000-0000-4000-a000-000000000123',
      };

      (mockPrisma.projectDocument.create as jest.Mock).mockResolvedValueOnce(createdDocument);

      const response = await request(app)
        .post('/api/documents')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('doc-2');
      expect(response.body.data.documentTitle).toBe('Project Plan');
      expect(mockPrisma.projectDocument.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          projectId: 'project-1',
          documentCode: 'DOC-002',
          documentTitle: 'Project Plan',
          documentType: 'PLAN',
          version: '1.0',
          accessLevel: 'PROJECT_TEAM',
          status: 'DRAFT',
          createdBy: '20000000-0000-4000-a000-000000000123',
        }),
      });
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/documents')
        .set('Authorization', 'Bearer token')
        .send({ projectId: 'project-1' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid documentType enum', async () => {
      const response = await request(app)
        .post('/api/documents')
        .set('Authorization', 'Bearer token')
        .send({
          ...createPayload,
          documentType: 'INVALID_TYPE',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors with 500', async () => {
      (mockPrisma.projectDocument.create as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .post('/api/documents')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('PUT /api/documents/:id', () => {
    it('should update a document successfully and set updatedBy', async () => {
      (mockPrisma.projectDocument.findUnique as jest.Mock).mockResolvedValueOnce(mockDocument);
      (mockPrisma.projectDocument.update as jest.Mock).mockResolvedValueOnce({
        ...mockDocument,
        documentTitle: 'Updated Charter',
        updatedBy: '20000000-0000-4000-a000-000000000123',
      });

      const response = await request(app)
        .put('/api/documents/1e000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ documentTitle: 'Updated Charter' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.documentTitle).toBe('Updated Charter');
      expect(mockPrisma.projectDocument.update).toHaveBeenCalledWith({
        where: { id: '1e000000-0000-4000-a000-000000000001' },
        data: expect.objectContaining({
          updatedBy: '20000000-0000-4000-a000-000000000123',
        }),
      });
    });

    it('should return 404 when document does not exist', async () => {
      (mockPrisma.projectDocument.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .put('/api/documents/00000000-0000-4000-a000-ffffffffffff')
        .set('Authorization', 'Bearer token')
        .send({ documentTitle: 'Updated' });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should convert reviewedAt and approvedAt date strings', async () => {
      (mockPrisma.projectDocument.findUnique as jest.Mock).mockResolvedValueOnce(mockDocument);
      (mockPrisma.projectDocument.update as jest.Mock).mockResolvedValueOnce({
        ...mockDocument,
        reviewedAt: new Date('2025-03-15'),
        approvedAt: new Date('2025-03-20'),
      });

      const response = await request(app)
        .put('/api/documents/1e000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({
          reviewedAt: '2025-03-15',
          approvedAt: '2025-03-20',
        });

      expect(response.status).toBe(200);
      expect(mockPrisma.projectDocument.update).toHaveBeenCalledWith({
        where: { id: '1e000000-0000-4000-a000-000000000001' },
        data: expect.objectContaining({
          reviewedAt: expect.any(Date),
          approvedAt: expect.any(Date),
        }),
      });
    });

    it('should handle database errors with 500', async () => {
      (mockPrisma.projectDocument.findUnique as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .put('/api/documents/1e000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ documentTitle: 'Updated' });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('DELETE /api/documents/:id', () => {
    it('should delete a document successfully', async () => {
      (mockPrisma.projectDocument.findUnique as jest.Mock).mockResolvedValueOnce(mockDocument);
      (mockPrisma.projectDocument.delete as jest.Mock).mockResolvedValueOnce({});

      const response = await request(app)
        .delete('/api/documents/1e000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(204);
      expect(mockPrisma.projectDocument.delete).toHaveBeenCalledWith({
        where: { id: '1e000000-0000-4000-a000-000000000001' },
      });
    });

    it('should return 404 when document does not exist', async () => {
      (mockPrisma.projectDocument.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .delete('/api/documents/00000000-0000-4000-a000-ffffffffffff')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should handle database errors with 500', async () => {
      (mockPrisma.projectDocument.findUnique as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .delete('/api/documents/1e000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });
});
