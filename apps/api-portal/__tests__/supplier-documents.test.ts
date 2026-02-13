import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    portalDocument: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
  },
  Prisma: { Decimal: jest.fn((v: any) => v) },
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

import supplierDocumentsRouter from '../src/routes/supplier-documents';
import { prisma } from '../src/prisma';

const app = express();
app.use(express.json());
app.use('/api/supplier/documents', supplierDocumentsRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('POST /api/supplier/documents', () => {
  it('should upload a document', async () => {
    const doc = { id: 'd-1', title: 'ISO 9001 Cert', category: 'CERTIFICATE', portalType: 'SUPPLIER' };
    (prisma as any).portalDocument.create.mockResolvedValue(doc);

    const res = await request(app)
      .post('/api/supplier/documents')
      .send({
        title: 'ISO 9001 Cert',
        fileName: 'cert.pdf',
        fileSize: 1024,
        mimeType: 'application/pdf',
        category: 'CERTIFICATE',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.category).toBe('CERTIFICATE');
  });

  it('should return 400 for missing title', async () => {
    const res = await request(app)
      .post('/api/supplier/documents')
      .send({ fileName: 'cert.pdf', fileSize: 1024, mimeType: 'application/pdf', category: 'CERTIFICATE' });

    expect(res.status).toBe(400);
  });

  it('should return 400 for invalid category', async () => {
    const res = await request(app)
      .post('/api/supplier/documents')
      .send({ title: 'Test', fileName: 'test.pdf', fileSize: 1024, mimeType: 'application/pdf', category: 'INVALID' });

    expect(res.status).toBe(400);
  });

  it('should handle server error on upload', async () => {
    (prisma as any).portalDocument.create.mockRejectedValue(new Error('DB error'));

    const res = await request(app)
      .post('/api/supplier/documents')
      .send({ title: 'Test', fileName: 'test.pdf', fileSize: 1024, mimeType: 'application/pdf', category: 'CERTIFICATE' });

    expect(res.status).toBe(500);
  });
});

describe('GET /api/supplier/documents', () => {
  it('should list supplier documents', async () => {
    const items = [{ id: 'd-1', title: 'ISO Cert', category: 'CERTIFICATE' }];
    (prisma as any).portalDocument.findMany.mockResolvedValue(items);
    (prisma as any).portalDocument.count.mockResolvedValue(1);

    const res = await request(app).get('/api/supplier/documents');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  it('should filter by category', async () => {
    (prisma as any).portalDocument.findMany.mockResolvedValue([]);
    (prisma as any).portalDocument.count.mockResolvedValue(0);

    const res = await request(app).get('/api/supplier/documents?category=CERTIFICATE');

    expect(res.status).toBe(200);
  });

  it('should handle pagination', async () => {
    (prisma as any).portalDocument.findMany.mockResolvedValue([]);
    (prisma as any).portalDocument.count.mockResolvedValue(30);

    const res = await request(app).get('/api/supplier/documents?page=2&limit=10');

    expect(res.status).toBe(200);
    expect(res.body.pagination.totalPages).toBe(3);
  });

  it('should handle server error', async () => {
    (prisma as any).portalDocument.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/supplier/documents');

    expect(res.status).toBe(500);
  });
});
