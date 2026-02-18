import { Router, Response } from 'express';
import { authenticate, requireRole, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { z } from 'zod';
import {
  parseCSV,
  importRecords,
  getTemplateHeaders,
  getImportSchema,
  IMPORT_SCHEMAS,
} from '@ims/csv-import';

const logger = createLogger('api-gateway:import');
const router = Router();

// All routes require authentication + admin role
router.use(authenticate);

// ─── Validation Schemas ─────────────────────────────────────────────────────

const validateSchema = z.object({
  csvData: z.string().trim().min(1, 'CSV data is required'),
  recordType: z.string().trim().min(1, 'Record type is required'),
});

const executeSchema = z.object({
  rows: z.array(z.record(z.unknown())).min(1, 'At least one row is required'),
  recordType: z.string().trim().min(1, 'Record type is required'),
});

// ─── Routes ─────────────────────────────────────────────────────────────────

// GET /api/admin/import/schemas — List available import schemas
router.get('/schemas', requireRole('ADMIN'), (_req: AuthRequest, res: Response) => {
  try {
    const schemas = IMPORT_SCHEMAS.map((s) => ({
      recordType: s.recordType,
      label: s.label,
      fieldCount: s.fields.length,
      requiredFields: s.fields.filter((f) => f.required).map((f) => f.name),
    }));

    res.json({ success: true, data: schemas });
  } catch (error: unknown) {
    logger.error('Failed to list import schemas', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list import schemas' },
    });
  }
});

// POST /api/admin/import/validate — Validate CSV data
router.post('/validate', requireRole('ADMIN'), (req: AuthRequest, res: Response) => {
  try {
    const parsed = validateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
          details: parsed.error.flatten(),
        },
      });
    }

    const { csvData, recordType } = parsed.data;
    const schema = getImportSchema(recordType);
    if (!schema) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_RECORD_TYPE', message: `Unknown record type: "${recordType}"` },
      });
    }

    const result = parseCSV(csvData, recordType);

    logger.info('CSV validation completed', {
      recordType,
      totalRows: result.totalRows,
      validRows: result.valid.length,
      errorCount: result.errors.length,
      userId: req.user?.id,
    });

    res.json({
      success: true,
      data: {
        valid: result.valid,
        errors: result.errors,
        totalRows: result.totalRows,
        validCount: result.valid.length,
        errorCount: result.errors.length,
      },
    });
  } catch (error: unknown) {
    logger.error('CSV validation failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'CSV validation failed' },
    });
  }
});

// POST /api/admin/import/execute — Execute import
router.post('/execute', requireRole('ADMIN'), (req: AuthRequest, res: Response) => {
  try {
    const parsed = executeSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
          details: parsed.error.flatten(),
        },
      });
    }

    const { rows, recordType } = parsed.data;
    const orgId = (req.user as any)?.orgId || 'default';

    const result = importRecords(rows as any[], recordType, orgId);

    logger.info('Import executed', {
      recordType,
      imported: result.imported,
      orgId,
      userId: req.user?.id,
    });

    res.json({ success: true, data: result });
  } catch (error: unknown) {
    logger.error('Import execution failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Import execution failed' },
    });
  }
});

// GET /api/admin/import/templates/:type — Get CSV template for a record type
router.get('/templates/:type', requireRole('ADMIN'), (req: AuthRequest, res: Response) => {
  try {
    const { type } = req.params;
    const headers = getTemplateHeaders(type);

    if (!headers) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: `No template found for record type: "${type}"` },
      });
    }

    const schema = getImportSchema(type);

    res.json({
      success: true,
      data: {
        recordType: type,
        label: schema?.label,
        headers,
        fields: schema?.fields,
      },
    });
  } catch (error: unknown) {
    logger.error('Failed to get template', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get template' },
    });
  }
});

export default router;
