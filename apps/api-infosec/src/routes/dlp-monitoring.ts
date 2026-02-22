import { Router, Request, Response } from 'express';
import type { Router as IRouter } from 'express';
import { prisma } from '../prisma';
import { authenticate } from '@ims/auth';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { createLogger } from '@ims/monitoring';
import { validateIdParam, parsePagination } from '@ims/shared';

const logger = createLogger('api-infosec');
const router: IRouter = Router();
router.use(authenticate);
router.param('id', validateIdParam());

// ISO 27001:2022 A.7.4 — Physical Security Monitoring
// ISO 27001:2022 A.8.9 — Configuration Management
// ISO 27001:2022 A.8.10 — Information Deletion
// ISO 27001:2022 A.8.12 — Data Leakage Prevention
// ISO 27001:2022 A.8.16 — Monitoring Activities

const dlpPolicySchema = z.object({
  name: z.string().trim().min(1),
  scope: z.enum(['ENDPOINT', 'EMAIL', 'CLOUD', 'NETWORK', 'ALL']),
  dataTypes: z.array(z.string()).min(1),
  action: z.enum(['MONITOR', 'ALERT', 'BLOCK', 'QUARANTINE']),
  description: z.string().trim().min(1),
  owner: z.string().trim().min(1),
  enabled: z.boolean().optional(),
});

const dlpIncidentSchema = z.object({
  policyId: z.string().uuid().optional(),
  policyName: z.string().trim().min(1),
  eventDate: z.string().refine((s) => !isNaN(Date.parse(s)), 'Invalid date'),
  dataType: z.string().trim().min(1),
  channel: z.enum(['EMAIL', 'USB', 'CLOUD_UPLOAD', 'PRINT', 'COPY_PASTE', 'SCREENSHOT', 'OTHER']),
  userIdentifier: z.string().trim().min(1),
  dataVolume: z.string().trim().optional(),
  destination: z.string().trim().optional(),
  blocked: z.boolean().optional(),
  falsePositive: z.boolean().optional(),
  investigationNotes: z.string().trim().optional(),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  detectedBy: z.string().trim().min(1),
});

const configBaselineSchema = z.object({
  systemName: z.string().trim().min(1),
  systemType: z.string().trim().min(1),
  baselineVersion: z.string().trim().min(1),
  baselineDate: z.string().refine((s) => !isNaN(Date.parse(s)), 'Invalid date'),
  configurationItems: z.array(z.string()).min(1),
  deviations: z.string().trim().optional(),
  complianceScore: z.number().min(0).max(100).optional(),
  reviewedBy: z.string().trim().min(1),
  nextReviewDate: z.string().refine((s) => !isNaN(Date.parse(s))).optional(),
});

const infoDeletionSchema = z.object({
  assetDescription: z.string().trim().min(1),
  assetType: z.enum(['HDD', 'SSD', 'TAPE', 'OPTICAL', 'USB', 'MOBILE', 'CLOUD', 'PAPER', 'OTHER']),
  dataClassification: z.enum(['PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED']),
  deletionMethod: z.enum(['OVERWRITE', 'DEGAUSSING', 'PHYSICAL_DESTRUCTION', 'CRYPTO_ERASE', 'CLOUD_DELETE', 'SHREDDING', 'OTHER']),
  deletionDate: z.string().refine((s) => !isNaN(Date.parse(s)), 'Invalid date'),
  performedBy: z.string().trim().min(1),
  witnessedBy: z.string().trim().optional(),
  certificateRef: z.string().trim().optional(),
  quantity: z.number().int().min(1).optional(),
  verifiedComplete: z.boolean().optional(),
});

const monitoringReviewSchema = z.object({
  reviewType: z.enum(['LOG_REVIEW', 'IDS_REVIEW', 'ACCESS_REVIEW', 'ANOMALY_REVIEW', 'PHYSICAL_CCTV', 'NETWORK_FLOW', 'OTHER']),
  reviewDate: z.string().refine((s) => !isNaN(Date.parse(s)), 'Invalid date'),
  systemsCovered: z.array(z.string()).min(1),
  period: z.string().trim().min(1),
  findings: z.string().trim().optional(),
  anomaliesDetected: z.number().int().min(0).optional(),
  actionsTaken: z.string().trim().optional(),
  reviewedBy: z.string().trim().min(1),
  nextReviewDate: z.string().refine((s) => !isNaN(Date.parse(s))).optional(),
});

// ── DLP Policies (A.8.12) ─────────────────────────────────────────────────

router.get('/dlp-policies', async (req: Request, res: Response) => {
  try {
    const { scope } = req.query;
    const { skip, limit, page } = parsePagination(req.query);
    const where: Record<string, unknown> = { deletedAt: null };
    if (scope) where.scope = scope;
    const [policies, total] = await Promise.all([
      prisma.isDlpPolicy.findMany({ where, skip, take: limit, orderBy: { name: 'asc' } }),
      prisma.isDlpPolicy.count({ where }),
    ]);
    res.json({ success: true, data: policies, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error: unknown) {
    logger.error('Failed to list DLP policies', { error: error instanceof Error ? error.message : 'Unknown' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list DLP policies' } });
  }
});

router.post('/dlp-policies', async (req: Request, res: Response) => {
  try {
    const parsed = dlpPolicySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed' }, details: parsed.error.flatten() });
    }
    const policy = await prisma.isDlpPolicy.create({ data: { id: uuidv4(), ...parsed.data, enabled: parsed.data.enabled ?? true } });
    logger.info('DLP policy created', { name: parsed.data.name });
    res.status(201).json({ success: true, data: policy });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create DLP policy' } });
  }
});

router.get('/dlp-policies/:id', async (req: Request, res: Response) => {
  try {
    const policy = await prisma.isDlpPolicy.findUnique({ where: { id: req.params.id } });
    if (!policy || policy.deletedAt) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'DLP policy not found' } });
    res.json({ success: true, data: policy });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get DLP policy' } });
  }
});

router.put('/dlp-policies/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.isDlpPolicy.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.deletedAt) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'DLP policy not found' } });
    const parsed = dlpPolicySchema.partial().safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed' }, details: parsed.error.flatten() });
    const updated = await prisma.isDlpPolicy.update({ where: { id: req.params.id }, data: parsed.data });
    res.json({ success: true, data: updated });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update DLP policy' } });
  }
});

// ── DLP Incidents ─────────────────────────────────────────────────────────

router.get('/dlp-incidents', async (req: Request, res: Response) => {
  try {
    const { severity, channel } = req.query;
    const { skip, limit, page } = parsePagination(req.query);
    const where: Record<string, unknown> = { deletedAt: null };
    if (severity) where.severity = severity;
    if (channel) where.channel = channel;
    const [incidents, total] = await Promise.all([
      prisma.isDlpIncident.findMany({ where, skip, take: limit, orderBy: { eventDate: 'desc' } }),
      prisma.isDlpIncident.count({ where }),
    ]);
    res.json({ success: true, data: incidents, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list DLP incidents' } });
  }
});

router.post('/dlp-incidents', async (req: Request, res: Response) => {
  try {
    const parsed = dlpIncidentSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed' }, details: parsed.error.flatten() });
    const incident = await prisma.isDlpIncident.create({
      data: { id: uuidv4(), ...parsed.data, eventDate: new Date(parsed.data.eventDate), status: 'OPEN' },
    });
    logger.info('DLP incident logged', { channel: parsed.data.channel, severity: parsed.data.severity });
    res.status(201).json({ success: true, data: incident });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to log DLP incident' } });
  }
});

// ── Configuration Baselines (A.8.9) ───────────────────────────────────────

router.get('/config-baselines', async (req: Request, res: Response) => {
  try {
    const { skip, limit, page } = parsePagination(req.query);
    const [baselines, total] = await Promise.all([
      prisma.isConfigBaseline.findMany({ where: { deletedAt: null }, skip, take: limit, orderBy: { systemName: 'asc' } }),
      prisma.isConfigBaseline.count({ where: { deletedAt: null } }),
    ]);
    res.json({ success: true, data: baselines, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list config baselines' } });
  }
});

router.post('/config-baselines', async (req: Request, res: Response) => {
  try {
    const parsed = configBaselineSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed' }, details: parsed.error.flatten() });
    const baseline = await prisma.isConfigBaseline.create({
      data: {
        id: uuidv4(), ...parsed.data,
        baselineDate: new Date(parsed.data.baselineDate),
        nextReviewDate: parsed.data.nextReviewDate ? new Date(parsed.data.nextReviewDate) : undefined,
      },
    });
    logger.info('Config baseline created', { systemName: parsed.data.systemName });
    res.status(201).json({ success: true, data: baseline });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create config baseline' } });
  }
});

// ── Information Deletion Records (A.8.10) ─────────────────────────────────

router.get('/info-deletion', async (req: Request, res: Response) => {
  try {
    const { assetType } = req.query;
    const { skip, limit, page } = parsePagination(req.query);
    const where: Record<string, unknown> = { deletedAt: null };
    if (assetType) where.assetType = assetType;
    const [records, total] = await Promise.all([
      prisma.isInfoDeletion.findMany({ where, skip, take: limit, orderBy: { deletionDate: 'desc' } }),
      prisma.isInfoDeletion.count({ where }),
    ]);
    res.json({ success: true, data: records, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list info deletion records' } });
  }
});

router.post('/info-deletion', async (req: Request, res: Response) => {
  try {
    const parsed = infoDeletionSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed' }, details: parsed.error.flatten() });
    const record = await prisma.isInfoDeletion.create({
      data: { id: uuidv4(), ...parsed.data, deletionDate: new Date(parsed.data.deletionDate) },
    });
    logger.info('Information deletion recorded', { assetType: parsed.data.assetType, method: parsed.data.deletionMethod });
    res.status(201).json({ success: true, data: record });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to record info deletion' } });
  }
});

// ── Monitoring Reviews (A.8.16) ───────────────────────────────────────────

router.get('/monitoring-reviews', async (req: Request, res: Response) => {
  try {
    const { reviewType } = req.query;
    const { skip, limit, page } = parsePagination(req.query);
    const where: Record<string, unknown> = { deletedAt: null };
    if (reviewType) where.reviewType = reviewType;
    const [reviews, total] = await Promise.all([
      prisma.isMonitoringReview.findMany({ where, skip, take: limit, orderBy: { reviewDate: 'desc' } }),
      prisma.isMonitoringReview.count({ where }),
    ]);
    res.json({ success: true, data: reviews, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list monitoring reviews' } });
  }
});

router.post('/monitoring-reviews', async (req: Request, res: Response) => {
  try {
    const parsed = monitoringReviewSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed' }, details: parsed.error.flatten() });
    const review = await prisma.isMonitoringReview.create({
      data: {
        id: uuidv4(), ...parsed.data,
        reviewDate: new Date(parsed.data.reviewDate),
        nextReviewDate: parsed.data.nextReviewDate ? new Date(parsed.data.nextReviewDate) : undefined,
      },
    });
    logger.info('Monitoring review recorded', { reviewType: parsed.data.reviewType });
    res.status(201).json({ success: true, data: review });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create monitoring review' } });
  }
});

export default router;
