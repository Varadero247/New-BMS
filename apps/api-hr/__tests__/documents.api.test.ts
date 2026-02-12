import express from 'express';
import request from 'supertest';

// Mock dependencies - routes import from ../prisma (re-exports from @ims/database/hr)
jest.mock('../src/prisma', () => ({
  prisma: {
    employeeDocument: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    employeeQualification: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    employeeAsset: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
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

describe('HR Documents API Routes', () => {
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
        employeeId: '2a000000-0000-4000-a000-000000000001',
        documentType: 'CONTRACT',
        title: 'Employment Contract',
        fileName: 'contract.pdf',
        fileUrl: 'https://files.example.com/contract.pdf',
        status: 'ACTIVE',
        employee: { id: '2a000000-0000-4000-a000-000000000001', firstName: 'John', lastName: 'Doe', employeeNumber: 'EMP001' },
      },
      {
        id: 'doc-2',
        employeeId: 'emp-2',
        documentType: 'NDA',
        title: 'Non-Disclosure Agreement',
        fileName: 'nda.pdf',
        fileUrl: 'https://files.example.com/nda.pdf',
        status: 'ACTIVE',
        employee: { id: 'emp-2', firstName: 'Jane', lastName: 'Smith', employeeNumber: 'EMP002' },
      },
    ];

    it('should return list of documents with pagination', async () => {
      (mockPrisma.employeeDocument.findMany as jest.Mock).mockResolvedValueOnce(mockDocuments);
      (mockPrisma.employeeDocument.count as jest.Mock).mockResolvedValueOnce(2);

      const response = await request(app).get('/api/documents');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.meta).toMatchObject({
        page: 1,
        limit: 20,
        total: 2,
        totalPages: 1,
      });
    });

    it('should support pagination parameters', async () => {
      (mockPrisma.employeeDocument.findMany as jest.Mock).mockResolvedValueOnce([mockDocuments[0]]);
      (mockPrisma.employeeDocument.count as jest.Mock).mockResolvedValueOnce(50);

      const response = await request(app).get('/api/documents?page=2&limit=10');

      expect(response.status).toBe(200);
      expect(response.body.meta.page).toBe(2);
      expect(response.body.meta.limit).toBe(10);
      expect(response.body.meta.totalPages).toBe(5);
    });

    it('should filter by employeeId', async () => {
      (mockPrisma.employeeDocument.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.employeeDocument.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app).get('/api/documents?employeeId=2a000000-0000-4000-a000-000000000001');

      expect(mockPrisma.employeeDocument.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            employeeId: '2a000000-0000-4000-a000-000000000001',
          }),
        })
      );
    });

    it('should filter by documentType', async () => {
      (mockPrisma.employeeDocument.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.employeeDocument.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app).get('/api/documents?documentType=CONTRACT');

      expect(mockPrisma.employeeDocument.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            documentType: 'CONTRACT',
          }),
        })
      );
    });

    it('should filter by status', async () => {
      (mockPrisma.employeeDocument.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.employeeDocument.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app).get('/api/documents?status=ACTIVE');

      expect(mockPrisma.employeeDocument.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'ACTIVE',
          }),
        })
      );
    });

    it('should order by createdAt descending', async () => {
      (mockPrisma.employeeDocument.findMany as jest.Mock).mockResolvedValueOnce(mockDocuments);
      (mockPrisma.employeeDocument.count as jest.Mock).mockResolvedValueOnce(2);

      await request(app).get('/api/documents');

      expect(mockPrisma.employeeDocument.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'desc' },
        })
      );
    });

    it('should handle database errors', async () => {
      (mockPrisma.employeeDocument.findMany as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app).get('/api/documents');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('GET /api/documents/:id', () => {
    const mockDocument = {
      id: '1e000000-0000-4000-a000-000000000001',
      employeeId: '2a000000-0000-4000-a000-000000000001',
      documentType: 'CONTRACT',
      title: 'Employment Contract',
      employee: { id: '2a000000-0000-4000-a000-000000000001', firstName: 'John', lastName: 'Doe', employeeNumber: 'EMP001', departmentId: '2b000000-0000-4000-a000-000000000001' },
    };

    it('should return single document with employee data', async () => {
      (mockPrisma.employeeDocument.findUnique as jest.Mock).mockResolvedValueOnce(mockDocument);

      const response = await request(app).get('/api/documents/1e000000-0000-4000-a000-000000000001');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('1e000000-0000-4000-a000-000000000001');
    });

    it('should return 404 for 00000000-0000-4000-a000-ffffffffffff document', async () => {
      (mockPrisma.employeeDocument.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app).get('/api/documents/00000000-0000-4000-a000-ffffffffffff');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should handle database errors', async () => {
      (mockPrisma.employeeDocument.findUnique as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app).get('/api/documents/1e000000-0000-4000-a000-000000000001');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('POST /api/documents', () => {
    const createPayload = {
      employeeId: '11111111-1111-1111-1111-111111111111',
      documentType: 'CONTRACT',
      title: 'Employment Contract',
      fileName: 'contract.pdf',
      fileUrl: 'https://files.example.com/contract.pdf',
    };

    it('should create document successfully', async () => {
      (mockPrisma.employeeDocument.create as jest.Mock).mockResolvedValueOnce({
        id: 'doc-new',
        ...createPayload,
        status: 'ACTIVE',
        version: 1,
        employee: { firstName: 'John', lastName: 'Doe' },
      });

      const response = await request(app)
        .post('/api/documents')
        .send(createPayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Employment Contract');
    });

    it('should set status to ACTIVE and version to 1', async () => {
      (mockPrisma.employeeDocument.create as jest.Mock).mockResolvedValueOnce({
        id: 'doc-new',
        ...createPayload,
        status: 'ACTIVE',
        version: 1,
      });

      await request(app)
        .post('/api/documents')
        .send(createPayload);

      expect(mockPrisma.employeeDocument.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'ACTIVE',
            version: 1,
          }),
        })
      );
    });

    it('should return 400 for missing employeeId', async () => {
      const response = await request(app)
        .post('/api/documents')
        .send({ documentType: 'CONTRACT', title: 'Test', fileName: 'test.pdf', fileUrl: 'https://files.example.com/test.pdf' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for missing title', async () => {
      const response = await request(app)
        .post('/api/documents')
        .send({ employeeId: '11111111-1111-1111-1111-111111111111', documentType: 'CONTRACT', fileName: 'test.pdf', fileUrl: 'https://files.example.com/test.pdf' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid documentType', async () => {
      const response = await request(app)
        .post('/api/documents')
        .send({ ...createPayload, documentType: 'INVALID_TYPE' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid fileUrl', async () => {
      const response = await request(app)
        .post('/api/documents')
        .send({ ...createPayload, fileUrl: 'not-a-url' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors', async () => {
      (mockPrisma.employeeDocument.create as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .post('/api/documents')
        .send(createPayload);

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('PUT /api/documents/:id', () => {
    it('should update document successfully', async () => {
      (mockPrisma.employeeDocument.update as jest.Mock).mockResolvedValueOnce({
        id: '1e000000-0000-4000-a000-000000000001',
        title: 'Updated Contract',
        status: 'VERIFIED',
      });

      const response = await request(app)
        .put('/api/documents/1e000000-0000-4000-a000-000000000001')
        .send({ title: 'Updated Contract', status: 'VERIFIED' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should set verifiedAt when verifiedById is provided', async () => {
      (mockPrisma.employeeDocument.update as jest.Mock).mockResolvedValueOnce({
        id: '1e000000-0000-4000-a000-000000000001',
        verifiedById: 'admin-1',
        verifiedAt: new Date(),
      });

      await request(app)
        .put('/api/documents/1e000000-0000-4000-a000-000000000001')
        .send({ verifiedById: 'admin-1' });

      expect(mockPrisma.employeeDocument.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            verifiedById: 'admin-1',
            verifiedAt: expect.any(Date),
          }),
        })
      );
    });

    it('should return 400 for invalid status', async () => {
      const response = await request(app)
        .put('/api/documents/1e000000-0000-4000-a000-000000000001')
        .send({ status: 'INVALID' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors', async () => {
      (mockPrisma.employeeDocument.update as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .put('/api/documents/1e000000-0000-4000-a000-000000000001')
        .send({ title: 'Updated' });

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('POST /api/documents/:id/sign', () => {
    it('should sign document successfully', async () => {
      (mockPrisma.employeeDocument.update as jest.Mock).mockResolvedValueOnce({
        id: '1e000000-0000-4000-a000-000000000001',
        signedAt: new Date(),
        signatureUrl: 'https://sigs.example.com/sig1.png',
      });

      const response = await request(app)
        .post('/api/documents/1e000000-0000-4000-a000-000000000001/sign')
        .send({ signatureUrl: 'https://sigs.example.com/sig1.png' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should handle database errors', async () => {
      (mockPrisma.employeeDocument.update as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .post('/api/documents/1e000000-0000-4000-a000-000000000001/sign')
        .send({ signatureUrl: 'https://sigs.example.com/sig1.png' });

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('DELETE /api/documents/:id', () => {
    it('should archive document (soft delete)', async () => {
      (mockPrisma.employeeDocument.update as jest.Mock).mockResolvedValueOnce({
        id: '1e000000-0000-4000-a000-000000000001',
        status: 'ARCHIVED',
      });

      const response = await request(app).delete('/api/documents/1e000000-0000-4000-a000-000000000001');

      expect(response.status).toBe(204);
      expect(mockPrisma.employeeDocument.update).toHaveBeenCalledWith({
        where: { id: '1e000000-0000-4000-a000-000000000001' },
        data: { status: 'ARCHIVED' },
      });
    });

    it('should handle database errors', async () => {
      (mockPrisma.employeeDocument.update as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app).delete('/api/documents/1e000000-0000-4000-a000-000000000001');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('GET /api/documents/qualifications/:employeeId', () => {
    const mockQualifications = [
      {
        id: 'qual-1',
        employeeId: '2a000000-0000-4000-a000-000000000001',
        qualificationType: 'BACHELOR',
        institution: 'MIT',
        degree: 'Computer Science',
      },
    ];

    it('should return qualifications for employee', async () => {
      (mockPrisma.employeeQualification.findMany as jest.Mock).mockResolvedValueOnce(mockQualifications);

      const response = await request(app).get('/api/documents/qualifications/2a000000-0000-4000-a000-000000000001');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
    });

    it('should handle database errors', async () => {
      (mockPrisma.employeeQualification.findMany as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app).get('/api/documents/qualifications/2a000000-0000-4000-a000-000000000001');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('POST /api/documents/qualifications', () => {
    const qualPayload = {
      employeeId: '11111111-1111-1111-1111-111111111111',
      qualificationType: 'BACHELOR',
      institution: 'MIT',
      degree: 'Computer Science',
    };

    it('should create qualification successfully', async () => {
      (mockPrisma.employeeQualification.create as jest.Mock).mockResolvedValueOnce({
        id: 'qual-new',
        ...qualPayload,
      });

      const response = await request(app)
        .post('/api/documents/qualifications')
        .send(qualPayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    it('should return 400 for invalid qualificationType', async () => {
      const response = await request(app)
        .post('/api/documents/qualifications')
        .send({ ...qualPayload, qualificationType: 'INVALID' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors', async () => {
      (mockPrisma.employeeQualification.create as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .post('/api/documents/qualifications')
        .send(qualPayload);

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('GET /api/documents/assets/:employeeId', () => {
    it('should return assets for employee', async () => {
      (mockPrisma.employeeAsset.findMany as jest.Mock).mockResolvedValueOnce([
        { id: '50000000-0000-4000-a000-000000000001', assetTag: 'LAP-001', assetType: 'LAPTOP', name: 'MacBook Pro' },
      ]);

      const response = await request(app).get('/api/documents/assets/2a000000-0000-4000-a000-000000000001');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
    });

    it('should handle database errors', async () => {
      (mockPrisma.employeeAsset.findMany as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app).get('/api/documents/assets/2a000000-0000-4000-a000-000000000001');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('POST /api/documents/assets', () => {
    const assetPayload = {
      employeeId: '11111111-1111-1111-1111-111111111111',
      assetTag: 'LAP-002',
      assetType: 'LAPTOP',
      name: 'ThinkPad X1',
      assignedDate: '2025-01-15',
    };

    it('should create asset assignment successfully', async () => {
      (mockPrisma.employeeAsset.create as jest.Mock).mockResolvedValueOnce({
        id: 'asset-new',
        ...assetPayload,
        assignedDate: new Date(assetPayload.assignedDate),
      });

      const response = await request(app)
        .post('/api/documents/assets')
        .send(assetPayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    it('should return 400 for invalid assetType', async () => {
      const response = await request(app)
        .post('/api/documents/assets')
        .send({ ...assetPayload, assetType: 'INVALID' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors', async () => {
      (mockPrisma.employeeAsset.create as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .post('/api/documents/assets')
        .send(assetPayload);

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('PUT /api/documents/assets/:id/return', () => {
    it('should return asset successfully', async () => {
      (mockPrisma.employeeAsset.update as jest.Mock).mockResolvedValueOnce({
        id: '50000000-0000-4000-a000-000000000001',
        returnDate: new Date(),
        returnCondition: 'GOOD',
        notes: 'In good condition',
      });

      const response = await request(app)
        .put('/api/documents/assets/50000000-0000-4000-a000-000000000001/return')
        .send({ returnCondition: 'GOOD', notes: 'In good condition' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should handle database errors', async () => {
      (mockPrisma.employeeAsset.update as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .put('/api/documents/assets/50000000-0000-4000-a000-000000000001/return')
        .send({ returnCondition: 'GOOD' });

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });
});
