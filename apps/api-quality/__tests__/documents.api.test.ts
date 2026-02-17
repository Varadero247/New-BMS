import express from 'express';
import request from 'supertest';

// Mock dependencies
jest.mock('../src/prisma', () => ({
  prisma: {
    qualDocument: {
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

jest.mock('uuid', () => ({
  v4: jest.fn(() => '30000000-0000-4000-a000-000000000123'),
}));

import { prisma } from '../src/prisma';
import documentsRoutes from '../src/routes/documents';

const mockPrisma = prisma as any;

describe('Quality Documents API Routes', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/documents', documentsRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/documents', () => {
    const mockDocuments = [
      {
        id: '1e000000-0000-4000-a000-000000000001',
        referenceNumber: 'QMS-DOC-2026-001',
        title: 'Quality Policy',
        documentType: 'POLICY',
        status: 'APPROVED',
        accessLevel: 'UNRESTRICTED',
        version: '2.0',
        author: 'Jane Doe',
        ownerCustodian: 'Quality Manager',
        updatedAt: new Date('2024-01-15'),
      },
      {
        id: 'doc-2',
        referenceNumber: 'QMS-DOC-2026-002',
        title: 'Inspection Procedure',
        documentType: 'PROCEDURE',
        status: 'DRAFT',
        accessLevel: 'CONTROLLED',
        version: '1.0',
        author: 'John Smith',
        ownerCustodian: 'Quality Engineer',
        updatedAt: new Date('2024-01-14'),
      },
    ];

    it('should return list of documents with pagination', async () => {
      mockPrisma.qualDocument.findMany.mockResolvedValueOnce(mockDocuments);
      mockPrisma.qualDocument.count.mockResolvedValueOnce(2);

      const response = await request(app)
        .get('/api/documents')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.items).toHaveLength(2);
      expect(response.body.data).toMatchObject({
        page: 1,
        limit: 20,
        total: 2,
        totalPages: 1,
      });
    });

    it('should support pagination parameters', async () => {
      mockPrisma.qualDocument.findMany.mockResolvedValueOnce([mockDocuments[0]]);
      mockPrisma.qualDocument.count.mockResolvedValueOnce(50);

      const response = await request(app)
        .get('/api/documents?page=3&limit=10')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.data.page).toBe(3);
      expect(response.body.data.limit).toBe(10);
      expect(response.body.data.totalPages).toBe(5);
    });

    it('should filter by documentType', async () => {
      mockPrisma.qualDocument.findMany.mockResolvedValueOnce([]);
      mockPrisma.qualDocument.count.mockResolvedValueOnce(0);

      await request(app)
        .get('/api/documents?documentType=POLICY')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.qualDocument.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            documentType: 'POLICY',
          }),
        })
      );
    });

    it('should filter by status', async () => {
      mockPrisma.qualDocument.findMany.mockResolvedValueOnce([]);
      mockPrisma.qualDocument.count.mockResolvedValueOnce(0);

      await request(app)
        .get('/api/documents?status=APPROVED')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.qualDocument.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'APPROVED',
          }),
        })
      );
    });

    it('should filter by accessLevel', async () => {
      mockPrisma.qualDocument.findMany.mockResolvedValueOnce([]);
      mockPrisma.qualDocument.count.mockResolvedValueOnce(0);

      await request(app)
        .get('/api/documents?accessLevel=CONTROLLED')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.qualDocument.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            accessLevel: 'CONTROLLED',
          }),
        })
      );
    });

    it('should support search filter', async () => {
      mockPrisma.qualDocument.findMany.mockResolvedValueOnce([]);
      mockPrisma.qualDocument.count.mockResolvedValueOnce(0);

      await request(app)
        .get('/api/documents?search=policy')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.qualDocument.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            title: { contains: 'policy', mode: 'insensitive' },
          }),
        })
      );
    });

    it('should order by updatedAt descending', async () => {
      mockPrisma.qualDocument.findMany.mockResolvedValueOnce(mockDocuments);
      mockPrisma.qualDocument.count.mockResolvedValueOnce(2);

      await request(app)
        .get('/api/documents')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.qualDocument.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { updatedAt: 'desc' },
        })
      );
    });

    it('should handle database errors', async () => {
      mockPrisma.qualDocument.findMany.mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .get('/api/documents')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('GET /api/documents/:id', () => {
    const mockDocument = {
      id: '1e000000-0000-4000-a000-000000000001',
      referenceNumber: 'QMS-DOC-2026-001',
      title: 'Quality Policy',
      documentType: 'POLICY',
      status: 'APPROVED',
    };

    it('should return single document', async () => {
      mockPrisma.qualDocument.findUnique.mockResolvedValueOnce(mockDocument);

      const response = await request(app)
        .get('/api/documents/1e000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('1e000000-0000-4000-a000-000000000001');
    });

    it('should return 404 for 00000000-0000-4000-a000-ffffffffffff document', async () => {
      mockPrisma.qualDocument.findUnique.mockResolvedValueOnce(null);

      const response = await request(app)
        .get('/api/documents/00000000-0000-4000-a000-ffffffffffff')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should handle database errors', async () => {
      mockPrisma.qualDocument.findUnique.mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .get('/api/documents/1e000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('POST /api/documents', () => {
    const createPayload = {
      title: 'New Procedure Document',
      documentType: 'PROCEDURE',
      author: 'Jane Doe',
      ownerCustodian: 'Quality Manager',
    };

    it('should create a document successfully', async () => {
      mockPrisma.qualDocument.count.mockResolvedValueOnce(0);
      mockPrisma.qualDocument.create.mockResolvedValueOnce({
        id: '30000000-0000-4000-a000-000000000123',
        ...createPayload,
        referenceNumber: 'QMS-DOC-2026-001',
        status: 'DRAFT',
        version: '1.0',
        language: 'English',
      });

      const response = await request(app)
        .post('/api/documents')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(createPayload.title);
    });

    it('should generate a reference number', async () => {
      mockPrisma.qualDocument.count.mockResolvedValueOnce(5);
      mockPrisma.qualDocument.create.mockResolvedValueOnce({
        id: '30000000-0000-4000-a000-000000000123',
        referenceNumber: 'QMS-DOC-2026-006',
      });

      await request(app)
        .post('/api/documents')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(mockPrisma.qualDocument.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          referenceNumber: expect.stringMatching(/^QMS-DOC-\d{4}-\d{3}$/),
        }),
      });
    });

    it('should set initial status to DRAFT', async () => {
      mockPrisma.qualDocument.count.mockResolvedValueOnce(0);
      mockPrisma.qualDocument.create.mockResolvedValueOnce({
        id: '30000000-0000-4000-a000-000000000123',
        status: 'DRAFT',
      });

      await request(app)
        .post('/api/documents')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(mockPrisma.qualDocument.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          status: 'DRAFT',
        }),
      });
    });

    it('should return 400 for missing title', async () => {
      const { title, ...payload } = createPayload;

      const response = await request(app)
        .post('/api/documents')
        .set('Authorization', 'Bearer token')
        .send(payload);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for missing author', async () => {
      const { author, ...payload } = createPayload;

      const response = await request(app)
        .post('/api/documents')
        .set('Authorization', 'Bearer token')
        .send(payload);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid documentType', async () => {
      const response = await request(app)
        .post('/api/documents')
        .set('Authorization', 'Bearer token')
        .send({ ...createPayload, documentType: 'INVALID_TYPE' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors', async () => {
      mockPrisma.qualDocument.count.mockResolvedValueOnce(0);
      mockPrisma.qualDocument.create.mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .post('/api/documents')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('PUT /api/documents/:id', () => {
    const existingDocument = {
      id: '1e000000-0000-4000-a000-000000000001',
      title: 'Existing Document',
      status: 'DRAFT',
    };

    it('should update document successfully', async () => {
      mockPrisma.qualDocument.findUnique.mockResolvedValueOnce(existingDocument);
      mockPrisma.qualDocument.update.mockResolvedValueOnce({
        ...existingDocument,
        title: 'Updated Title',
      });

      const response = await request(app)
        .put('/api/documents/1e000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ title: 'Updated Title' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 404 for 00000000-0000-4000-a000-ffffffffffff document', async () => {
      mockPrisma.qualDocument.findUnique.mockResolvedValueOnce(null);

      const response = await request(app)
        .put('/api/documents/00000000-0000-4000-a000-ffffffffffff')
        .set('Authorization', 'Bearer token')
        .send({ title: 'Updated' });

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 400 for invalid status', async () => {
      mockPrisma.qualDocument.findUnique.mockResolvedValueOnce(existingDocument);

      const response = await request(app)
        .put('/api/documents/1e000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ status: 'INVALID_STATUS' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid accessLevel', async () => {
      mockPrisma.qualDocument.findUnique.mockResolvedValueOnce(existingDocument);

      const response = await request(app)
        .put('/api/documents/1e000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ accessLevel: 'INVALID_LEVEL' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors', async () => {
      mockPrisma.qualDocument.findUnique.mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .put('/api/documents/1e000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ title: 'Updated' });

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('DELETE /api/documents/:id', () => {
    it('should delete document successfully', async () => {
      mockPrisma.qualDocument.findUnique.mockResolvedValueOnce({ id: '1e000000-0000-4000-a000-000000000001' });
      mockPrisma.qualDocument.delete.mockResolvedValueOnce({});

      const response = await request(app)
        .delete('/api/documents/1e000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(204);
      expect(mockPrisma.qualDocument.update).toHaveBeenCalledWith({
        where: { id: '1e000000-0000-4000-a000-000000000001' },
        data: { deletedAt: expect.any(Date) },
      });
    });

    it('should return 404 for 00000000-0000-4000-a000-ffffffffffff document', async () => {
      mockPrisma.qualDocument.findUnique.mockResolvedValueOnce(null);

      const response = await request(app)
        .delete('/api/documents/00000000-0000-4000-a000-ffffffffffff')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should handle database errors', async () => {
      mockPrisma.qualDocument.findUnique.mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .delete('/api/documents/1e000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });
});
