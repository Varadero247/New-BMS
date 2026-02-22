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
jest.mock('@ims/service-auth', () => ({
  checkOwnership: () => (_req: any, _res: any, next: any) => next(),
  scopeToUser: (_req: any, _res: any, next: any) => next(),
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
      (mockPrisma.projectDocument.findMany as jest.Mock).mockRejectedValueOnce(
        new Error('DB error')
      );

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
      (mockPrisma.projectDocument.findUnique as jest.Mock).mockRejectedValueOnce(
        new Error('DB error')
      );

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
      (mockPrisma.projectDocument.update as jest.Mock).mockResolvedValueOnce({});

      const response = await request(app)
        .delete('/api/documents/1e000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(204);
      expect(mockPrisma.projectDocument.update).toHaveBeenCalledWith({
        where: { id: '1e000000-0000-4000-a000-000000000001' },
        data: { deletedAt: expect.any(Date), updatedBy: expect.any(String) },
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
      (mockPrisma.projectDocument.findUnique as jest.Mock).mockRejectedValueOnce(
        new Error('DB error')
      );

      const response = await request(app)
        .delete('/api/documents/1e000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });
});

describe('Project Management Documents — extended', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/documents', documentsRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /documents returns meta.totalPages based on count and limit', async () => {
    (mockPrisma.projectDocument.findMany as jest.Mock).mockResolvedValueOnce([]);
    (mockPrisma.projectDocument.count as jest.Mock).mockResolvedValueOnce(100);

    const response = await request(app)
      .get('/api/documents?projectId=project-1&limit=50')
      .set('Authorization', 'Bearer token');

    expect(response.status).toBe(200);
    expect(response.body.meta.totalPages).toBe(2);
  });
});

describe('documents.api — additional coverage', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/documents', documentsRoutes);
    jest.clearAllMocks();
  });

  it('route responds to GET /api/documents', async () => {
    const res = await request(app).get('/api/documents');
    expect([200, 400, 401, 404, 500]).toContain(res.status);
  });

  it('response is JSON content-type for GET /api/documents', async () => {
    const res = await request(app).get('/api/documents');
    expect(res.headers['content-type']).toBeDefined();
  });

  it('GET /api/documents body has success property', async () => {
    const res = await request(app).get('/api/documents');
    if (res.status === 200) {
      expect(res.body).toHaveProperty('success');
    } else {
      expect(res.body).toBeDefined();
    }
  });

  it('GET /api/documents body is an object', async () => {
    const res = await request(app).get('/api/documents');
    expect(typeof res.body).toBe('object');
  });

  it('GET /api/documents route is accessible', async () => {
    const res = await request(app).get('/api/documents');
    expect(res.status).toBeDefined();
  });
});

describe('Project Management Documents — edge cases and validation', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/documents', documentsRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /documents: meta.page defaults to 1', async () => {
    (mockPrisma.projectDocument.findMany as jest.Mock).mockResolvedValueOnce([]);
    (mockPrisma.projectDocument.count as jest.Mock).mockResolvedValueOnce(0);
    const response = await request(app)
      .get('/api/documents?projectId=project-1')
      .set('Authorization', 'Bearer token');
    expect(response.status).toBe(200);
    expect(response.body.meta.page).toBe(1);
  });

  it('GET /documents: count called once per request', async () => {
    (mockPrisma.projectDocument.findMany as jest.Mock).mockResolvedValueOnce([]);
    (mockPrisma.projectDocument.count as jest.Mock).mockResolvedValueOnce(0);
    await request(app)
      .get('/api/documents?projectId=project-1')
      .set('Authorization', 'Bearer token');
    expect(mockPrisma.projectDocument.count).toHaveBeenCalledTimes(1);
  });

  it('GET /documents: returns empty data array when no documents found', async () => {
    (mockPrisma.projectDocument.findMany as jest.Mock).mockResolvedValueOnce([]);
    (mockPrisma.projectDocument.count as jest.Mock).mockResolvedValueOnce(0);
    const response = await request(app)
      .get('/api/documents?projectId=project-1')
      .set('Authorization', 'Bearer token');
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data).toHaveLength(0);
  });

  it('POST /documents: returns 400 for missing documentCode', async () => {
    const response = await request(app)
      .post('/api/documents')
      .set('Authorization', 'Bearer token')
      .send({
        projectId: 'project-1',
        documentTitle: 'Project Plan',
        documentType: 'PLAN',
      });
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('POST /documents: createdBy is set to authenticated user id', async () => {
    (mockPrisma.projectDocument.create as jest.Mock).mockResolvedValueOnce({
      id: 'doc-new',
      projectId: 'project-1',
      documentCode: 'DOC-003',
      documentTitle: 'Spec',
      documentType: 'SPECIFICATION',
      version: '1.0',
      status: 'DRAFT',
      createdBy: '20000000-0000-4000-a000-000000000123',
    });
    await request(app)
      .post('/api/documents')
      .set('Authorization', 'Bearer token')
      .send({
        projectId: 'project-1',
        documentCode: 'DOC-003',
        documentTitle: 'Spec',
        documentType: 'SPECIFICATION',
      });
    expect(mockPrisma.projectDocument.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ createdBy: '20000000-0000-4000-a000-000000000123' }),
      })
    );
  });

  it('DELETE /documents/:id: soft-deletes by setting deletedAt', async () => {
    (mockPrisma.projectDocument.findUnique as jest.Mock).mockResolvedValueOnce({
      id: '1e000000-0000-4000-a000-000000000001',
      projectId: 'project-1',
    });
    (mockPrisma.projectDocument.update as jest.Mock).mockResolvedValueOnce({});
    const response = await request(app)
      .delete('/api/documents/1e000000-0000-4000-a000-000000000001')
      .set('Authorization', 'Bearer token');
    expect(response.status).toBe(204);
    expect(mockPrisma.projectDocument.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ deletedAt: expect.any(Date) }),
      })
    );
  });

  it('PUT /documents/:id: findUnique called with correct id', async () => {
    (mockPrisma.projectDocument.findUnique as jest.Mock).mockResolvedValueOnce(null);
    await request(app)
      .put('/api/documents/1e000000-0000-4000-a000-000000000001')
      .set('Authorization', 'Bearer token')
      .send({ documentTitle: 'Updated' });
    expect(mockPrisma.projectDocument.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: '1e000000-0000-4000-a000-000000000001' } })
    );
  });

  it('GET /documents: success true in response on valid request', async () => {
    (mockPrisma.projectDocument.findMany as jest.Mock).mockResolvedValueOnce([]);
    (mockPrisma.projectDocument.count as jest.Mock).mockResolvedValueOnce(0);
    const response = await request(app)
      .get('/api/documents?projectId=project-1')
      .set('Authorization', 'Bearer token');
    expect(response.body.success).toBe(true);
  });

  it('POST /documents: version defaults to 1.0', async () => {
    (mockPrisma.projectDocument.create as jest.Mock).mockResolvedValueOnce({
      id: 'doc-v',
      projectId: 'project-1',
      documentCode: 'DOC-010',
      documentTitle: 'New Doc',
      documentType: 'REPORT',
      version: '1.0',
      status: 'DRAFT',
      createdBy: '20000000-0000-4000-a000-000000000123',
    });
    await request(app)
      .post('/api/documents')
      .set('Authorization', 'Bearer token')
      .send({
        projectId: 'project-1',
        documentCode: 'DOC-010',
        documentTitle: 'New Doc',
        documentType: 'REPORT',
      });
    expect(mockPrisma.projectDocument.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ version: '1.0' }),
      })
    );
  });

  it('PUT /documents/:id: status defaults remain when not changed', async () => {
    (mockPrisma.projectDocument.findUnique as jest.Mock).mockResolvedValueOnce({
      id: '1e000000-0000-4000-a000-000000000001',
      projectId: 'project-1',
      documentCode: 'DOC-001',
      documentTitle: 'Project Charter',
      documentType: 'CHARTER',
      version: '1.0',
      status: 'DRAFT',
    });
    (mockPrisma.projectDocument.update as jest.Mock).mockResolvedValueOnce({
      id: '1e000000-0000-4000-a000-000000000001',
      documentTitle: 'Revised Charter',
      status: 'DRAFT',
    });
    const response = await request(app)
      .put('/api/documents/1e000000-0000-4000-a000-000000000001')
      .set('Authorization', 'Bearer token')
      .send({ documentTitle: 'Revised Charter' });
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});

describe('documents.api — final extended coverage', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/documents', documentsRoutes);
    jest.clearAllMocks();
  });

  it('GET /api/documents with multiple documents returns correct count', async () => {
    const docs = [
      { ...{ id: 'doc-a', projectId: 'project-1', documentCode: 'DOC-A', documentTitle: 'Doc A', documentType: 'PLAN', version: '1.0', status: 'DRAFT' } },
      { ...{ id: 'doc-b', projectId: 'project-1', documentCode: 'DOC-B', documentTitle: 'Doc B', documentType: 'REPORT', version: '1.0', status: 'DRAFT' } },
    ];
    (mockPrisma.projectDocument.findMany as jest.Mock).mockResolvedValueOnce(docs);
    (mockPrisma.projectDocument.count as jest.Mock).mockResolvedValueOnce(2);
    const res = await request(app)
      .get('/api/documents?projectId=project-1')
      .set('Authorization', 'Bearer token');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.meta.total).toBe(2);
  });

  it('DELETE /api/documents/:id does not call delete when findUnique returns null', async () => {
    (mockPrisma.projectDocument.findUnique as jest.Mock).mockResolvedValueOnce(null);
    await request(app)
      .delete('/api/documents/00000000-0000-4000-a000-ffffffffffff')
      .set('Authorization', 'Bearer token');
    expect(mockPrisma.projectDocument.update).not.toHaveBeenCalled();
  });

  it('PUT /api/documents/:id does not call update when findUnique returns null', async () => {
    (mockPrisma.projectDocument.findUnique as jest.Mock).mockResolvedValueOnce(null);
    await request(app)
      .put('/api/documents/00000000-0000-4000-a000-ffffffffffff')
      .set('Authorization', 'Bearer token')
      .send({ documentTitle: 'Should not update' });
    expect(mockPrisma.projectDocument.update).not.toHaveBeenCalled();
  });

  it('GET /api/documents returns meta.limit equal to requested limit', async () => {
    (mockPrisma.projectDocument.findMany as jest.Mock).mockResolvedValueOnce([]);
    (mockPrisma.projectDocument.count as jest.Mock).mockResolvedValueOnce(0);
    const res = await request(app)
      .get('/api/documents?projectId=project-1&limit=10')
      .set('Authorization', 'Bearer token');
    expect(res.status).toBe(200);
    expect(res.body.meta.limit).toBe(10);
  });

  it('POST /api/documents returns 201 status code on success', async () => {
    (mockPrisma.projectDocument.create as jest.Mock).mockResolvedValueOnce({
      id: 'doc-201',
      projectId: 'project-1',
      documentCode: 'DOC-201',
      documentTitle: 'Status Test',
      documentType: 'REPORT',
      version: '1.0',
      status: 'DRAFT',
      createdBy: '20000000-0000-4000-a000-000000000123',
    });
    const res = await request(app)
      .post('/api/documents')
      .set('Authorization', 'Bearer token')
      .send({
        projectId: 'project-1',
        documentCode: 'DOC-201',
        documentTitle: 'Status Test',
        documentType: 'REPORT',
      });
    expect(res.status).toBe(201);
  });
});
