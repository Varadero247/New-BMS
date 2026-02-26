// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { authenticate, writeRoleGuard, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import {
  analyseFile,
  suggestMappings,
  validateMappings,
  transformRows,
  MigrationExecutor,
  type MigrationJob,
  type MigrationResult,
  type FieldMapping,
  type TargetModule,
} from '@ims/migration-assistant';

const router = Router();
const logger = createLogger('api-gateway:migration');

// In-memory stores (would be Redis/DB in production)
const uploadStore = new Map<string, { filename: string; content: string; orgId: string; uploadedAt: Date }>();
const jobStore = new Map<string, MigrationJob>();
const resultStore = new Map<string, MigrationResult>();

function getUser(req: Request): { orgId: string; userId: string } {
  const user = (req as AuthRequest).user as Record<string, string> | undefined;
  return {
    orgId: user?.organisationId ?? user?.orgId ?? 'default',
    userId: user?.id ?? user?.userId ?? 'unknown',
  };
}

const targetModuleSchema = z.enum([
  'NONCONFORMANCES', 'INCIDENTS', 'RISKS', 'DOCUMENTS',
  'SUPPLIERS', 'EMPLOYEES', 'CALIBRATION', 'AUDITS',
]);

const mappingSchema = z.object({
  sourceField: z.string(),
  targetField: z.string(),
  transform: z.string().optional(),
});

// All migration routes require auth
router.use(authenticate);

// POST /api/migration/upload — store upload metadata (file content as base64 body)
router.post('/upload', writeRoleGuard('ADMIN', 'MANAGER'), async (req: Request, res: Response) => {
  try {
    const bodySchema = z.object({
      filename: z.string().min(1).max(255),
      content: z.string().min(1),  // CSV/JSON content or base64
    });
    const parsed = bodySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.message } });
    }

    const { orgId } = getUser(req);
    const uploadId = `upload_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    uploadStore.set(uploadId, { filename: parsed.data.filename, content: parsed.data.content, orgId, uploadedAt: new Date() });

    logger.info('File uploaded for migration', { uploadId, filename: parsed.data.filename, orgId });
    res.json({ success: true, data: { uploadId, filename: parsed.data.filename, uploadedAt: new Date() } });
  } catch (err) {
    logger.error('Upload failed', { error: String(err) });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Upload failed' } });
  }
});

// GET /api/migration/upload/:uploadId/analysis
router.get('/upload/:uploadId/analysis', async (req: Request, res: Response) => {
  try {
    const upload = uploadStore.get(req.params.uploadId);
    if (!upload) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Upload not found' } });
    }
    const { orgId } = getUser(req);
    if (upload.orgId !== orgId) {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Access denied' } });
    }

    const structure = analyseFile(upload.content, upload.filename, req.params.uploadId);
    res.json({ success: true, data: structure });
  } catch (err) {
    logger.error('Analysis failed', { error: String(err) });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Analysis failed' } });
  }
});

// POST /api/migration/upload/:uploadId/suggest-mappings
router.post('/upload/:uploadId/suggest-mappings', writeRoleGuard('ADMIN', 'MANAGER'), async (req: Request, res: Response) => {
  try {
    const upload = uploadStore.get(req.params.uploadId);
    if (!upload) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Upload not found' } });
    }
    const bodySchema = z.object({ targetModule: targetModuleSchema });
    const parsed = bodySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.message } });
    }

    const structure = analyseFile(upload.content, upload.filename, req.params.uploadId);
    const suggestions = await suggestMappings(structure, parsed.data.targetModule);
    res.json({ success: true, data: suggestions });
  } catch (err) {
    logger.error('Suggest mappings failed', { error: String(err) });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to generate suggestions' } });
  }
});

// POST /api/migration/jobs — create migration job
router.post('/jobs', writeRoleGuard('ADMIN', 'MANAGER'), async (req: Request, res: Response) => {
  try {
    const bodySchema = z.object({
      uploadId: z.string(),
      targetModule: targetModuleSchema,
      mappings: z.array(mappingSchema).min(1),
      options: z.object({ dryRun: z.boolean().optional() }).optional(),
    });
    const parsed = bodySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.message } });
    }

    const upload = uploadStore.get(parsed.data.uploadId);
    if (!upload) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Upload not found' } });
    }

    const { orgId, userId } = getUser(req);
    const validation = validateMappings(parsed.data.mappings as FieldMapping[], parsed.data.targetModule as TargetModule);

    const jobId = `job_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const job: MigrationJob = {
      id: jobId,
      orgId,
      uploadId: parsed.data.uploadId,
      targetModule: parsed.data.targetModule as TargetModule,
      mappings: parsed.data.mappings as FieldMapping[],
      status: validation.valid ? 'READY' : 'FAILED',
      progress: 0,
      errors: validation.errors,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    jobStore.set(jobId, job);

    logger.info('Migration job created', { jobId, orgId, userId, targetModule: parsed.data.targetModule });
    res.status(201).json({ success: true, data: { jobId, status: job.status, validation } });
  } catch (err) {
    logger.error('Create job failed', { error: String(err) });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create job' } });
  }
});

// GET /api/migration/jobs/:jobId
router.get('/jobs/:jobId', async (req: Request, res: Response) => {
  const job = jobStore.get(req.params.jobId);
  if (!job) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Job not found' } });
  }
  const { orgId } = getUser(req);
  if (job.orgId !== orgId) {
    return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Access denied' } });
  }
  res.json({ success: true, data: job });
});

// POST /api/migration/jobs/:jobId/preview
router.post('/jobs/:jobId/preview', writeRoleGuard('ADMIN', 'MANAGER'), async (req: Request, res: Response) => {
  try {
    const job = jobStore.get(req.params.jobId);
    if (!job) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Job not found' } });
    }

    const upload = uploadStore.get(job.uploadId);
    if (!upload) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Upload no longer available' } });
    }

    const structure = analyseFile(upload.content, upload.filename, job.uploadId);
    // Parse rows from content
    const { parseCsv, parseJson } = await import('@ims/migration-assistant');
    const parsed = upload.filename.endsWith('.json') ? parseJson(upload.content) : parseCsv(upload.content);
    const previewRows = parsed.rows.slice(0, 10) as Record<string, unknown>[];
    const transformed = transformRows(previewRows, job.mappings, job.targetModule);

    res.json({
      success: true,
      data: {
        rowCount: structure.rowCount,
        previewCount: previewRows.length,
        transformed: transformed.slice(0, 10),
        hasErrors: transformed.some(r => r.errors.length > 0),
        hasWarnings: transformed.some(r => r.warnings.length > 0),
      },
    });
  } catch (err) {
    logger.error('Preview failed', { error: String(err) });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Preview failed' } });
  }
});

// POST /api/migration/jobs/:jobId/execute
router.post('/jobs/:jobId/execute', writeRoleGuard('ADMIN', 'MANAGER'), async (req: Request, res: Response) => {
  try {
    const job = jobStore.get(req.params.jobId);
    if (!job) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Job not found' } });
    }
    if (job.status !== 'READY') {
      return res.status(400).json({ success: false, error: { code: 'INVALID_STATE', message: `Job is in ${job.status} state, must be READY` } });
    }

    job.status = 'RUNNING';
    job.updatedAt = new Date();
    jobStore.set(job.id, job);

    const upload = uploadStore.get(job.uploadId);
    if (!upload) {
      job.status = 'FAILED';
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Upload no longer available' } });
    }

    const { parseCsv, parseJson } = await import('@ims/migration-assistant');
    const parsed = upload.filename.endsWith('.json') ? parseJson(upload.content) : parseCsv(upload.content);
    const rows = parsed.rows as Record<string, unknown>[];
    const transformedRows = transformRows(rows, job.mappings, job.targetModule);

    const executor = new MigrationExecutor();
    const result = await executor.executeSync(job, transformedRows);
    resultStore.set(job.id, result);

    job.status = 'COMPLETED';
    job.progress = 100;
    job.result = result;
    job.updatedAt = new Date();
    jobStore.set(job.id, job);

    logger.info('Migration job completed', { jobId: job.id, created: result.created, failed: result.failed });
    res.json({ success: true, data: result });
  } catch (err) {
    logger.error('Execute failed', { error: String(err) });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Execution failed' } });
  }
});

// GET /api/migration/jobs/:jobId/result
router.get('/jobs/:jobId/result', async (req: Request, res: Response) => {
  const job = jobStore.get(req.params.jobId);
  if (!job) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Job not found' } });
  }
  const result = resultStore.get(req.params.jobId);
  if (!result) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Result not available yet' } });
  }
  res.json({ success: true, data: result });
});

export default router;
