import { Router, Request, Response } from 'express';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { prisma } from '../prisma';
import { z } from 'zod';

const logger = createLogger('api-infosec');
const router: Router = Router();
router.use(authenticate);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseIntParam(val: unknown, fallback: number): number {
  const n = parseInt(String(val), 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function generateRopaRef(): string {
  const count = Math.floor(1000 + Math.random() * 9000);
  return `ROPA-${count.toString().padStart(4, '0')}`;
}

function generateDpiaRef(): string {
  const now = new Date();
  const yy = now.getFullYear().toString().slice(-2);
  const mm = (now.getMonth() + 1).toString().padStart(2, '0');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `DPIA-${yy}${mm}-${rand}`;
}

function generateDsarRef(): string {
  const now = new Date();
  const yy = now.getFullYear().toString().slice(-2);
  const mm = (now.getMonth() + 1).toString().padStart(2, '0');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `DSAR-${yy}${mm}-${rand}`;
}

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

const ropaCreateSchema = z.object({
  name: z.string().min(1).max(300),
  purpose: z.string().min(1).max(2000),
  lawfulBasis: z.enum(['CONSENT', 'CONTRACT', 'LEGAL_OBLIGATION', 'VITAL_INTERESTS', 'PUBLIC_TASK', 'LEGITIMATE_INTERESTS']),
  dataCategories: z.array(z.string()).optional(),
  dataSubjects: z.array(z.string()).optional(),
  recipients: z.array(z.string()).optional(),
  retentionPeriod: z.string().max(200).optional(),
  transfersOutsideEEA: z.boolean().optional().default(false),
  safeguards: z.string().max(2000).optional(),
  controller: z.string().max(200).optional(),
  processor: z.string().max(200).optional(),
  description: z.string().max(5000).optional(),
});

const ropaUpdateSchema = z.object({
  name: z.string().min(1).max(300).optional(),
  purpose: z.string().min(1).max(2000).optional(),
  lawfulBasis: z.enum(['CONSENT', 'CONTRACT', 'LEGAL_OBLIGATION', 'VITAL_INTERESTS', 'PUBLIC_TASK', 'LEGITIMATE_INTERESTS']).optional(),
  dataCategories: z.array(z.string()).optional(),
  dataSubjects: z.array(z.string()).optional(),
  recipients: z.array(z.string()).optional(),
  retentionPeriod: z.string().max(200).optional(),
  transfersOutsideEEA: z.boolean().optional(),
  safeguards: z.string().max(2000).optional(),
  controller: z.string().max(200).optional(),
  processor: z.string().max(200).optional(),
  description: z.string().max(5000).optional(),
  status: z.enum(['ACTIVE', 'UNDER_REVIEW', 'ARCHIVED']).optional(),
});

const dpiaCreateSchema = z.object({
  title: z.string().min(1).max(300),
  description: z.string().max(5000).optional(),
  processingDescription: z.string().max(5000).optional(),
  necessity: z.string().max(5000).optional(),
  risksIdentified: z.array(z.string()).optional(),
  mitigationMeasures: z.array(z.string()).optional(),
  ropaId: z.string().uuid().optional(),
});

const dpiaApproveSchema = z.object({
  approvalNotes: z.string().max(5000).optional(),
});

const dsarCreateSchema = z.object({
  subjectName: z.string().min(1).max(200),
  subjectEmail: z.string().email().max(200),
  requestType: z.enum(['ACCESS', 'RECTIFICATION', 'ERASURE', 'RESTRICTION', 'PORTABILITY', 'OBJECTION']),
  description: z.string().max(5000).optional(),
  identityVerified: z.boolean().optional().default(false),
});

const dsarRespondSchema = z.object({
  responseNotes: z.string().min(1).max(10000),
  actionTaken: z.string().max(5000).optional(),
});

// ===================================================================
// ROPA — Records of Processing Activities
// ===================================================================

// ---------------------------------------------------------------------------
// GET /ropa — List ROPA entries
// ---------------------------------------------------------------------------
router.get('/ropa', async (req: Request, res: Response) => {
  try {
    const { search, status } = req.query;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 25);
    const skip = (page - 1) * limit;

    const where: any = { deletedAt: null };

    if (status && typeof status === 'string') {
      where.status = status;
    }
    if (search && typeof search === 'string') {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { refNumber: { contains: search, mode: 'insensitive' } },
        { purpose: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [records, total] = await Promise.all([
      prisma.isRopa.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.isRopa.count({ where }),
    ]);

    res.json({
      success: true,
      data: records,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    logger.error('Failed to list ROPA entries', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: 'Failed to list ROPA entries' });
  }
});

// ---------------------------------------------------------------------------
// POST /ropa — Create ROPA entry
// ---------------------------------------------------------------------------
router.post('/ropa', async (req: Request, res: Response) => {
  try {
    const parsed = ropaCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: 'Validation failed', details: parsed.error.flatten() });
    }

    const authReq = req as AuthRequest;
    const refNumber = generateRopaRef();

    const entry = await prisma.isRopa.create({
      data: {
        refNumber,
        name: parsed.data.name,
        purpose: parsed.data.purpose,
        lawfulBasis: parsed.data.lawfulBasis,
        dataCategories: parsed.data.dataCategories || [],
        dataSubjects: parsed.data.dataSubjects || [],
        recipients: parsed.data.recipients || [],
        retentionPeriod: parsed.data.retentionPeriod || null,
        transfersOutsideEEA: parsed.data.transfersOutsideEEA || false,
        safeguards: parsed.data.safeguards || null,
        controller: parsed.data.controller || null,
        processor: parsed.data.processor || null,
        description: parsed.data.description || null,
        status: 'ACTIVE',
        createdBy: authReq.user?.id || 'system',
      },
    });

    logger.info('ROPA entry created', { ropaId: entry.id, refNumber });
    res.status(201).json({ success: true, data: entry });
  } catch (error: unknown) {
    logger.error('Failed to create ROPA entry', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: 'Failed to create ROPA entry' });
  }
});

// ---------------------------------------------------------------------------
// GET /ropa/:id — ROPA detail
// ---------------------------------------------------------------------------
router.get('/ropa/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const entry = await prisma.isRopa.findFirst({
      where: { id, deletedAt: null },
    });

    if (!entry) {
      return res.status(404).json({ success: false, error: 'ROPA entry not found' });
    }

    res.json({ success: true, data: entry });
  } catch (error: unknown) {
    logger.error('Failed to get ROPA entry', { error: error instanceof Error ? error.message : 'Unknown error', id: req.params.id });
    res.status(500).json({ success: false, error: 'Failed to get ROPA entry' });
  }
});

// ---------------------------------------------------------------------------
// PUT /ropa/:id — Update ROPA
// ---------------------------------------------------------------------------
router.put('/ropa/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const parsed = ropaUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: 'Validation failed', details: parsed.error.flatten() });
    }

    const existing = await prisma.isRopa.findFirst({ where: { id, deletedAt: null } });
    if (!existing) {
      return res.status(404).json({ success: false, error: 'ROPA entry not found' });
    }

    const authReq = req as AuthRequest;
    const entry = await prisma.isRopa.update({
      where: { id },
      data: {
        ...parsed.data,
        updatedBy: authReq.user?.id || 'system',
        updatedAt: new Date(),
      },
    });

    logger.info('ROPA entry updated', { ropaId: id });
    res.json({ success: true, data: entry });
  } catch (error: unknown) {
    logger.error('Failed to update ROPA entry', { error: error instanceof Error ? error.message : 'Unknown error', id: req.params.id });
    res.status(500).json({ success: false, error: 'Failed to update ROPA entry' });
  }
});

// ===================================================================
// DPIA — Data Protection Impact Assessment
// ===================================================================

// ---------------------------------------------------------------------------
// POST /dpia — Create DPIA
// ---------------------------------------------------------------------------
router.post('/dpia', async (req: Request, res: Response) => {
  try {
    const parsed = dpiaCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: 'Validation failed', details: parsed.error.flatten() });
    }

    const authReq = req as AuthRequest;
    const refNumber = generateDpiaRef();

    const dpia = await prisma.isDpia.create({
      data: {
        refNumber,
        title: parsed.data.title,
        description: parsed.data.description || null,
        processingDescription: parsed.data.processingDescription || null,
        necessity: parsed.data.necessity || null,
        risksIdentified: parsed.data.risksIdentified || [],
        mitigationMeasures: parsed.data.mitigationMeasures || [],
        ropaId: parsed.data.ropaId || null,
        status: 'DRAFT',
        createdBy: authReq.user?.id || 'system',
      },
    });

    logger.info('DPIA created', { dpiaId: dpia.id, refNumber });
    res.status(201).json({ success: true, data: dpia });
  } catch (error: unknown) {
    logger.error('Failed to create DPIA', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: 'Failed to create DPIA' });
  }
});

// ---------------------------------------------------------------------------
// GET /dpia — List DPIAs
// ---------------------------------------------------------------------------
router.get('/dpia', async (req: Request, res: Response) => {
  try {
    const { status, search } = req.query;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 25);
    const skip = (page - 1) * limit;

    const where: any = { deletedAt: null };

    if (status && typeof status === 'string') {
      where.status = status;
    }
    if (search && typeof search === 'string') {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { refNumber: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [dpias, total] = await Promise.all([
      prisma.isDpia.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.isDpia.count({ where }),
    ]);

    res.json({
      success: true,
      data: dpias,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    logger.error('Failed to list DPIAs', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: 'Failed to list DPIAs' });
  }
});

// ---------------------------------------------------------------------------
// GET /dpia/:id — DPIA detail
// ---------------------------------------------------------------------------
router.get('/dpia/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const dpia = await prisma.isDpia.findFirst({
      where: { id, deletedAt: null },
    });

    if (!dpia) {
      return res.status(404).json({ success: false, error: 'DPIA not found' });
    }

    res.json({ success: true, data: dpia });
  } catch (error: unknown) {
    logger.error('Failed to get DPIA', { error: error instanceof Error ? error.message : 'Unknown error', id: req.params.id });
    res.status(500).json({ success: false, error: 'Failed to get DPIA' });
  }
});

// ---------------------------------------------------------------------------
// PUT /dpia/:id/approve — DPO sign-off
// ---------------------------------------------------------------------------
router.put('/dpia/:id/approve', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const parsed = dpiaApproveSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: 'Validation failed', details: parsed.error.flatten() });
    }

    const existing = await prisma.isDpia.findFirst({ where: { id, deletedAt: null } });
    if (!existing) {
      return res.status(404).json({ success: false, error: 'DPIA not found' });
    }

    const authReq = req as AuthRequest;
    const dpia = await prisma.isDpia.update({
      where: { id },
      data: {
        approvedBy: authReq.user?.id || 'system',
        approvedAt: new Date(),
        approvalNotes: parsed.data.approvalNotes || null,
        status: 'APPROVED',
        updatedBy: authReq.user?.id || 'system',
        updatedAt: new Date(),
      },
    });

    logger.info('DPIA approved', { dpiaId: id, approvedBy: authReq.user?.id });
    res.json({ success: true, data: dpia });
  } catch (error: unknown) {
    logger.error('Failed to approve DPIA', { error: error instanceof Error ? error.message : 'Unknown error', id: req.params.id });
    res.status(500).json({ success: false, error: 'Failed to approve DPIA' });
  }
});

// ===================================================================
// DSAR — Data Subject Access Requests
// ===================================================================

// ---------------------------------------------------------------------------
// GET /dsar — List DSARs
// ---------------------------------------------------------------------------
router.get('/dsar', async (req: Request, res: Response) => {
  try {
    const { status, requestType, search } = req.query;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 25);
    const skip = (page - 1) * limit;

    const where: any = {};

    if (status && typeof status === 'string') {
      where.status = status;
    }
    if (requestType && typeof requestType === 'string') {
      where.requestType = requestType;
    }
    if (search && typeof search === 'string') {
      where.OR = [
        { subjectName: { contains: search, mode: 'insensitive' } },
        { subjectEmail: { contains: search, mode: 'insensitive' } },
        { refNumber: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [dsars, total] = await Promise.all([
      prisma.isDsar.findMany({
        where,
        skip,
        take: limit,
        orderBy: { receivedAt: 'desc' },
      }),
      prisma.isDsar.count({ where }),
    ]);

    res.json({
      success: true,
      data: dsars,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    logger.error('Failed to list DSARs', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: 'Failed to list DSARs' });
  }
});

// ---------------------------------------------------------------------------
// POST /dsar — Log DSAR
// ---------------------------------------------------------------------------
router.post('/dsar', async (req: Request, res: Response) => {
  try {
    const parsed = dsarCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: 'Validation failed', details: parsed.error.flatten() });
    }

    const authReq = req as AuthRequest;
    const refNumber = generateDsarRef();
    const receivedAt = new Date();
    const deadline = new Date(receivedAt.getTime() + 30 * 24 * 60 * 60 * 1000); // +30 days

    const dsar = await prisma.isDsar.create({
      data: {
        refNumber,
        subjectName: parsed.data.subjectName,
        subjectEmail: parsed.data.subjectEmail,
        requestType: parsed.data.requestType,
        description: parsed.data.description || null,
        identityVerified: parsed.data.identityVerified || false,
        receivedAt,
        deadline,
        status: 'RECEIVED',
        createdBy: authReq.user?.id || 'system',
      },
    });

    logger.info('DSAR logged', { dsarId: dsar.id, refNumber, requestType: parsed.data.requestType });
    res.status(201).json({ success: true, data: dsar });
  } catch (error: unknown) {
    logger.error('Failed to log DSAR', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: 'Failed to log DSAR' });
  }
});

// ---------------------------------------------------------------------------
// PUT /dsar/:id/respond — Record response
// ---------------------------------------------------------------------------
router.put('/dsar/:id/respond', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const parsed = dsarRespondSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: 'Validation failed', details: parsed.error.flatten() });
    }

    const existing = await prisma.isDsar.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: 'DSAR not found' });
    }

    const authReq = req as AuthRequest;
    const dsar = await prisma.isDsar.update({
      where: { id },
      data: {
        responseNotes: parsed.data.responseNotes,
        actionTaken: parsed.data.actionTaken || null,
        respondedAt: new Date(),
        status: 'COMPLETED',
        updatedBy: authReq.user?.id || 'system',
        updatedAt: new Date(),
      },
    });

    logger.info('DSAR responded', { dsarId: id });
    res.json({ success: true, data: dsar });
  } catch (error: unknown) {
    logger.error('Failed to respond to DSAR', { error: error instanceof Error ? error.message : 'Unknown error', id: req.params.id });
    res.status(500).json({ success: false, error: 'Failed to respond to DSAR' });
  }
});

// ===================================================================
// CONSENTS & RETENTION
// ===================================================================

// ---------------------------------------------------------------------------
// GET /consents — List consent records
// ---------------------------------------------------------------------------
router.get('/consents', async (req: Request, res: Response) => {
  try {
    const { subjectEmail, search } = req.query;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 25);
    const skip = (page - 1) * limit;

    const where: any = {};

    if (subjectEmail && typeof subjectEmail === 'string') {
      where.subjectEmail = subjectEmail;
    }
    if (search && typeof search === 'string') {
      where.OR = [
        { subjectName: { contains: search, mode: 'insensitive' } },
        { subjectEmail: { contains: search, mode: 'insensitive' } },
        { purpose: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [consents, total] = await Promise.all([
      prisma.isConsent.findMany({
        where,
        skip,
        take: limit,
        orderBy: { consentedAt: 'desc' },
      }),
      prisma.isConsent.count({ where }),
    ]);

    res.json({
      success: true,
      data: consents,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    logger.error('Failed to list consent records', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: 'Failed to list consent records' });
  }
});

// ---------------------------------------------------------------------------
// GET /retention — List data retention schedules
// ---------------------------------------------------------------------------
router.get('/retention', async (req: Request, res: Response) => {
  try {
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 25);
    const skip = (page - 1) * limit;

    const [schedules, total] = await Promise.all([
      prisma.isRetentionSchedule.findMany({
        skip,
        take: limit,
        orderBy: { dataCategory: 'asc' },
      }),
      prisma.isRetentionSchedule.count(),
    ]);

    res.json({
      success: true,
      data: schedules,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    logger.error('Failed to list retention schedules', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: 'Failed to list retention schedules' });
  }
});

export default router;
