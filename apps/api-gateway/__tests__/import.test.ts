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

const mockParseCSV = jest
  .fn()
  .mockReturnValue({ valid: [{ name: 'Test' }], errors: [], totalRows: 1 });
const mockImportRecords = jest.fn().mockReturnValue({ imported: 5, skipped: 0, errors: [] });
const mockGetTemplateHeaders = jest.fn().mockReturnValue('name,code,type,status,country,contact');
const mockGetImportSchema = jest.fn().mockReturnValue({
  recordType: 'suppliers',
  label: 'Suppliers',
  fields: [
    { name: 'name', required: true },
    { name: 'code', required: true },
  ],
});

jest.mock('@ims/csv-import', () => ({
  parseCSV: (...args: any[]) => mockParseCSV(...args),
  importRecords: (...args: any[]) => mockImportRecords(...args),
  getTemplateHeaders: (...args: any[]) => mockGetTemplateHeaders(...args),
  getImportSchema: (...args: any[]) => mockGetImportSchema(...args),
  IMPORT_SCHEMAS: [
    { recordType: 'suppliers', label: 'Suppliers', fields: [{ name: 'name', required: true }] },
    {
      recordType: 'employees',
      label: 'Employees',
      fields: [{ name: 'firstName', required: true }],
    },
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
      const res = await request(app).get(
        '/api/admin/import/templates/00000000-0000-0000-0000-000000000099'
      );
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

  describe('Import Routes — extended', () => {
    it('schemas list is an array', async () => {
      const res = await request(app).get('/api/admin/import/schemas');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('execute import returns imported count', async () => {
      const res = await request(app)
        .post('/api/admin/import/execute')
        .send({ recordType: 'suppliers', rows: [{ name: 'Alpha Ltd', code: 'ALP-001' }] });
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('imported');
    });

    it('schemas endpoint returns success true', async () => {
      const res = await request(app).get('/api/admin/import/schemas');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('Import Routes — further extended', () => {
    it('execute import returns skipped field', async () => {
      const res = await request(app)
        .post('/api/admin/import/execute')
        .send({ recordType: 'employees', rows: [{ firstName: 'Alice' }] });
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('skipped');
    });

    it('schemas endpoint returns array of supported types', async () => {
      const res = await request(app).get('/api/admin/import/schemas');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('template for known type returns success true', async () => {
      const res = await request(app).get('/api/admin/import/templates/employees');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('validate success is true', async () => {
      const res = await request(app)
        .post('/api/admin/import/validate')
        .send({ recordType: 'suppliers', csvData: 'name,code\nTest,TST' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('execute import errors field is an array', async () => {
      const res = await request(app)
        .post('/api/admin/import/execute')
        .send({ recordType: 'suppliers', rows: [{ name: 'Gamma', code: 'GAM-001' }] });
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data.errors)).toBe(true);
    });
  });
});


describe('Import Routes — additional coverage', () => {
  let app: any;

  beforeEach(() => {
    const express = require('express');
    app = express();
    app.use(express.json());
    const importRouter = require('../src/routes/import').default;
    app.use('/api/admin/import', importRouter);
    jest.clearAllMocks();
  });

  it('validate endpoint returns validCount and errorCount in data', async () => {
    const request = require('supertest');
    const res = await request(app)
      .post('/api/admin/import/validate')
      .send({ recordType: 'suppliers', csvData: 'name,code\nTest Inc,TST-001' });
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('validCount');
    expect(res.body.data).toHaveProperty('errorCount');
  });

  it('execute import with employees type returns success true', async () => {
    const request = require('supertest');
    const res = await request(app)
      .post('/api/admin/import/execute')
      .send({ recordType: 'employees', rows: [{ firstName: 'Bob' }] });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('execute import with missing rows rejects with 400', async () => {
    const request = require('supertest');
    const res = await request(app)
      .post('/api/admin/import/execute')
      .send({ recordType: 'suppliers' });
    expect(res.status).toBe(400);
  });

  it('template endpoint returns recordType and headers in data', async () => {
    const request = require('supertest');
    const res = await request(app).get('/api/admin/import/templates/suppliers');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('recordType');
    expect(res.body.data).toHaveProperty('headers');
  });

  it('validate with unknown recordType returns 400 INVALID_RECORD_TYPE', async () => {
    mockGetImportSchema.mockReturnValueOnce(undefined);

    const request = require('supertest');
    const res = await request(app)
      .post('/api/admin/import/validate')
      .send({ recordType: 'nonexistent-type', csvData: 'name\nTest' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_RECORD_TYPE');
  });
});
