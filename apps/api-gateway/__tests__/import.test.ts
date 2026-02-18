import express from 'express';
import request from 'supertest';

const mockAuthenticate = jest.fn((req: any, _res: any, next: any) => {
  req.user = { id: 'user-1', email: 'admin@ims.local', role: 'ADMIN', orgId: 'org-1' };
  next();
});

const mockRequireRole = jest.fn((...roles: string[]) => {
  return (req: any, res: any, next: any) => {
    if (!roles.includes(req.user?.role)) {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN' } });
    }
    next();
  };
});

jest.mock('@ims/auth', () => ({
  authenticate: (...args: any[]) => mockAuthenticate(...args),
  requireRole: (...args: any[]) => mockRequireRole(...args),
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

const mockParseCSV = jest.fn().mockReturnValue({ valid: [{ name: 'Test' }], errors: [], totalRows: 1 });
const mockImportRecords = jest.fn().mockReturnValue({ imported: 5, skipped: 0, errors: [] });
const mockGetTemplateHeaders = jest.fn().mockReturnValue('name,code,type,status,country,contact');
const mockGetImportSchema = jest.fn().mockReturnValue({
  recordType: 'suppliers', label: 'Suppliers', fields: [{ name: 'name', required: true }, { name: 'code', required: true }],
});

jest.mock('@ims/csv-import', () => ({
  parseCSV: (...args: any[]) => mockParseCSV(...args),
  importRecords: (...args: any[]) => mockImportRecords(...args),
  getTemplateHeaders: (...args: any[]) => mockGetTemplateHeaders(...args),
  getImportSchema: (...args: any[]) => mockGetImportSchema(...args),
  IMPORT_SCHEMAS: [
    { recordType: 'suppliers', label: 'Suppliers', fields: [{ name: 'name', required: true }] },
    { recordType: 'employees', label: 'Employees', fields: [{ name: 'firstName', required: true }] },
  ],
  getImportedRecords: jest.fn().mockReturnValue([]),
}));

import importRouter from '../src/routes/import';

describe('Import Routes', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/admin/import', importRouter);
    jest.clearAllMocks();
  });

  describe('GET /api/admin/import/schemas', () => {
    it('returns available import schemas', async () => {
      const res = await request(app).get('/api/admin/import/schemas');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
    });
  });

  describe('POST /api/admin/import/validate', () => {
    it('validates CSV data', async () => {
      const res = await request(app)
        .post('/api/admin/import/validate')
        .send({ recordType: 'suppliers', csvData: 'name,code\nTest Inc,TST-001' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('rejects missing recordType', async () => {
      const res = await request(app)
        .post('/api/admin/import/validate')
        .send({ csvData: 'name,code\nTest,TST' });
      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/admin/import/execute', () => {
    it('executes import', async () => {
      const res = await request(app)
        .post('/api/admin/import/execute')
        .send({ recordType: 'suppliers', rows: [{ name: 'Test Inc', code: 'TST-001' }] });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/admin/import/templates/:type', () => {
    it('returns CSV template for record type', async () => {
      const res = await request(app).get('/api/admin/import/templates/suppliers');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('returns 404 for unknown type', async () => {
      mockGetTemplateHeaders.mockReturnValueOnce(null);
      mockGetImportSchema.mockReturnValueOnce(undefined);
      const res = await request(app).get('/api/admin/import/templates/00000000-0000-0000-0000-000000000099');
      expect(res.status).toBe(404);
    });
  });

  describe('Auth enforcement', () => {
    it('requires ADMIN role', async () => {
      mockAuthenticate.mockImplementationOnce((req: any, _res: any, next: any) => {
        req.user = { id: 'u2', email: 'user@ims.local', role: 'USER', orgId: 'org-1' };
        next();
      });
      const res = await request(app).get('/api/admin/import/schemas');
      expect(res.status).toBe(403);
    });
  });
});
