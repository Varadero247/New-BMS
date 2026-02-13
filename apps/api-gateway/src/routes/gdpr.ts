import { Router, Response } from 'express';
import { prisma } from '@ims/database';
import { authenticate, requireRole, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { z } from 'zod';

const logger = createLogger('gdpr');
const router = Router();

// All GDPR routes require authentication + ADMIN role
router.use(authenticate);
router.use(requireRole('ADMIN'));

// ---------------------------------------------------------------------------
// Data map — describes what personal data is stored per module
// ---------------------------------------------------------------------------
const DATA_MAP = [
  {
    module: 'core',
    description: 'Core user management and authentication',
    personalFields: [
      { field: 'email', table: 'users', purpose: 'Account identification and communication', legalBasis: 'Contract performance (Art 6(1)(b))' },
      { field: 'firstName', table: 'users', purpose: 'User identification', legalBasis: 'Contract performance (Art 6(1)(b))' },
      { field: 'lastName', table: 'users', purpose: 'User identification', legalBasis: 'Contract performance (Art 6(1)(b))' },
      { field: 'phone', table: 'users', purpose: 'Contact information', legalBasis: 'Legitimate interest (Art 6(1)(f))' },
      { field: 'department', table: 'users', purpose: 'Organizational assignment', legalBasis: 'Legitimate interest (Art 6(1)(f))' },
      { field: 'jobTitle', table: 'users', purpose: 'Role identification', legalBasis: 'Legitimate interest (Art 6(1)(f))' },
      { field: 'ipAddress', table: 'sessions', purpose: 'Security auditing', legalBasis: 'Legitimate interest (Art 6(1)(f))' },
      { field: 'userAgent', table: 'sessions', purpose: 'Security auditing', legalBasis: 'Legitimate interest (Art 6(1)(f))' },
    ],
  },
  {
    module: 'audit',
    description: 'Audit logging and compliance trail',
    personalFields: [
      { field: 'userId', table: 'audit_logs', purpose: 'Accountability and traceability', legalBasis: 'Legal obligation (Art 6(1)(c))' },
      { field: 'ipAddress', table: 'audit_logs', purpose: 'Security auditing', legalBasis: 'Legitimate interest (Art 6(1)(f))' },
      { field: 'userEmail', table: 'enhanced_audit_trail', purpose: 'Regulatory compliance (21 CFR Part 11)', legalBasis: 'Legal obligation (Art 6(1)(c))' },
      { field: 'userFullName', table: 'enhanced_audit_trail', purpose: 'Regulatory compliance (21 CFR Part 11)', legalBasis: 'Legal obligation (Art 6(1)(c))' },
    ],
  },
  {
    module: 'health-safety',
    description: 'Health & Safety incident management (ISO 45001)',
    personalFields: [
      { field: 'reporterId', table: 'incidents', purpose: 'Incident accountability', legalBasis: 'Legal obligation (Art 6(1)(c))' },
      { field: 'investigatorId', table: 'incidents', purpose: 'Investigation assignment', legalBasis: 'Legitimate interest (Art 6(1)(f))' },
      { field: 'personsInvolved', table: 'incidents', purpose: 'Incident investigation', legalBasis: 'Legal obligation (Art 6(1)(c))' },
    ],
  },
  {
    module: 'environment',
    description: 'Environmental management (ISO 14001)',
    personalFields: [
      { field: 'createdBy', table: 'env_aspects', purpose: 'Record ownership', legalBasis: 'Legitimate interest (Art 6(1)(f))' },
      { field: 'assignedTo', table: 'env_actions', purpose: 'Task assignment', legalBasis: 'Legitimate interest (Art 6(1)(f))' },
    ],
  },
  {
    module: 'quality',
    description: 'Quality management (ISO 9001)',
    personalFields: [
      { field: 'ownerId', table: 'actions', purpose: 'Action ownership', legalBasis: 'Legitimate interest (Art 6(1)(f))' },
      { field: 'createdById', table: 'actions', purpose: 'Record accountability', legalBasis: 'Legitimate interest (Art 6(1)(f))' },
    ],
  },
  {
    module: 'hr',
    description: 'Human Resources management',
    personalFields: [
      { field: 'employee records', table: 'hr_employees', purpose: 'Employment management', legalBasis: 'Contract performance (Art 6(1)(b))' },
    ],
  },
  {
    module: 'payroll',
    description: 'Payroll processing',
    personalFields: [
      { field: 'salary data', table: 'payroll_records', purpose: 'Compensation processing', legalBasis: 'Contract performance (Art 6(1)(b))' },
    ],
  },
];

// ---------------------------------------------------------------------------
// Validation schemas
// ---------------------------------------------------------------------------
const erasureRequestSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  userEmail: z.string().email('Valid email is required'),
  reason: z.string().max(2000).optional(),
});

const processErasureSchema = z.object({
  status: z.enum(['IN_PROGRESS', 'COMPLETED', 'REJECTED']),
  notes: z.string().max(2000).optional(),
});

const retentionPolicySchema = z.object({
  dataCategory: z.string().min(1, 'Data category is required').max(100),
  module: z.string().min(1, 'Module is required').max(100),
  retentionDays: z.number().int().min(1, 'Retention days must be at least 1').max(36500),
  action: z.enum(['ARCHIVE', 'DELETE', 'ANONYMIZE']),
  legalBasis: z.string().max(500).optional(),
  isActive: z.boolean().optional(),
});

// ---------------------------------------------------------------------------
// GET /data-export/:userId — Export all personal data for a user (GDPR Art 20)
// ---------------------------------------------------------------------------
router.get('/data-export/:userId', async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;

    // Fetch user record
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        department: true,
        jobTitle: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: `User '${userId}' not found` },
      });
    }

    // Fetch audit logs for the user
    const auditLogs = await prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 1000,
      select: {
        id: true,
        action: true,
        entity: true,
        entityId: true,
        ipAddress: true,
        createdAt: true,
      },
    });

    // Fetch sessions for the user
    const sessions = await prisma.session.findMany({
      where: { userId },
      select: {
        id: true,
        lastActivityAt: true,
        userAgent: true,
        ipAddress: true,
        createdAt: true,
        expiresAt: true,
      },
    });

    const exportData = {
      exportDate: new Date().toISOString(),
      dataSubject: user,
      auditLogs: {
        count: auditLogs.length,
        records: auditLogs,
      },
      sessions: {
        count: sessions.length,
        records: sessions,
      },
    };

    logger.info('GDPR data export generated', {
      targetUserId: userId,
      requestedBy: req.user?.id,
      auditLogCount: auditLogs.length,
      sessionCount: sessions.length,
    });

    res.json({ success: true, data: exportData });
  } catch (error) {
    logger.error('Failed to export user data', { error: error instanceof Error ? error.message : String(error) });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to export user data' },
    });
  }
});

// ---------------------------------------------------------------------------
// POST /erasure-request — Submit right-to-erasure request (GDPR Art 17)
// ---------------------------------------------------------------------------
router.post('/erasure-request', async (req: AuthRequest, res: Response) => {
  try {
    const data = erasureRequestSchema.parse(req.body);

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: data.userId },
      select: { id: true, email: true },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: `User '${data.userId}' not found` },
      });
    }

    const erasureRequest = await prisma.erasureRequest.create({
      data: {
        userId: data.userId,
        userEmail: data.userEmail,
        reason: data.reason,
        status: 'PENDING',
      },
    });

    logger.info('Erasure request created', {
      requestId: erasureRequest.id,
      targetUserId: data.userId,
      requestedBy: req.user?.id,
    });

    res.status(201).json({ success: true, data: erasureRequest });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
          fields: error.errors.map((e) => ({ path: e.path.join('.'), message: e.message })),
        },
      });
    }
    logger.error('Failed to create erasure request', { error: error instanceof Error ? error.message : String(error) });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create erasure request' },
    });
  }
});

// ---------------------------------------------------------------------------
// GET /erasure-request — List all erasure requests
// ---------------------------------------------------------------------------
router.get('/erasure-request', async (req: AuthRequest, res: Response) => {
  try {
    const { status, page = '1', limit = '20' } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(parseInt(limit as string, 10) || 20, 100);
    const skip = (pageNum - 1) * limitNum;

    const where: Record<string, unknown> = {};
    if (status) {
      where.status = status;
    }

    const [requests, total] = await Promise.all([
      prisma.erasureRequest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.erasureRequest.count({ where }),
    ]);

    res.json({
      success: true,
      data: requests,
      meta: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    logger.error('Failed to list erasure requests', { error: error instanceof Error ? error.message : String(error) });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list erasure requests' },
    });
  }
});

// ---------------------------------------------------------------------------
// PUT /erasure-request/:id — Process/complete an erasure request
// ---------------------------------------------------------------------------
router.put('/erasure-request/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const data = processErasureSchema.parse(req.body);

    const existing = await prisma.erasureRequest.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: `Erasure request '${id}' not found` },
      });
    }

    if (existing.status === 'COMPLETED') {
      return res.status(400).json({
        success: false,
        error: { code: 'ALREADY_PROCESSED', message: 'This erasure request has already been completed' },
      });
    }

    const updateData: Record<string, unknown> = {
      status: data.status,
      notes: data.notes,
      processedBy: req.user!.id,
    };

    if (data.status === 'COMPLETED' || data.status === 'REJECTED') {
      updateData.processedAt = new Date();
    }

    const updated = await prisma.erasureRequest.update({
      where: { id },
      data: updateData,
    });

    logger.info('Erasure request updated', {
      requestId: id,
      newStatus: data.status,
      processedBy: req.user?.id,
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
          fields: error.errors.map((e) => ({ path: e.path.join('.'), message: e.message })),
        },
      });
    }
    logger.error('Failed to process erasure request', { error: error instanceof Error ? error.message : String(error) });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to process erasure request' },
    });
  }
});

// ---------------------------------------------------------------------------
// GET /retention-policies — List all data retention policies
// ---------------------------------------------------------------------------
router.get('/retention-policies', async (req: AuthRequest, res: Response) => {
  try {
    const { module, isActive, page = '1', limit = '50' } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(parseInt(limit as string, 10) || 50, 100);
    const skip = (pageNum - 1) * limitNum;

    const where: Record<string, unknown> = {};
    if (module) {
      where.module = module;
    }
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const [policies, total] = await Promise.all([
      prisma.dataRetentionPolicy.findMany({
        where,
        orderBy: [{ module: 'asc' }, { dataCategory: 'asc' }],
        skip,
        take: limitNum,
      }),
      prisma.dataRetentionPolicy.count({ where }),
    ]);

    res.json({
      success: true,
      data: policies,
      meta: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    logger.error('Failed to list retention policies', { error: error instanceof Error ? error.message : String(error) });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list retention policies' },
    });
  }
});

// ---------------------------------------------------------------------------
// POST /retention-policies — Create or update a retention policy
// ---------------------------------------------------------------------------
router.post('/retention-policies', async (req: AuthRequest, res: Response) => {
  try {
    const data = retentionPolicySchema.parse(req.body);

    const policy = await prisma.dataRetentionPolicy.upsert({
      where: {
        dataCategory_module: {
          dataCategory: data.dataCategory,
          module: data.module,
        },
      },
      update: {
        retentionDays: data.retentionDays,
        action: data.action,
        legalBasis: data.legalBasis,
        isActive: data.isActive ?? true,
      },
      create: {
        dataCategory: data.dataCategory,
        module: data.module,
        retentionDays: data.retentionDays,
        action: data.action,
        legalBasis: data.legalBasis,
        isActive: data.isActive ?? true,
      },
    });

    logger.info('Retention policy upserted', {
      policyId: policy.id,
      dataCategory: data.dataCategory,
      module: data.module,
      updatedBy: req.user?.id,
    });

    res.status(201).json({ success: true, data: policy });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
          fields: error.errors.map((e) => ({ path: e.path.join('.'), message: e.message })),
        },
      });
    }
    logger.error('Failed to upsert retention policy', { error: error instanceof Error ? error.message : String(error) });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create/update retention policy' },
    });
  }
});

// ---------------------------------------------------------------------------
// GET /data-map — Show what personal data is stored where
// ---------------------------------------------------------------------------
router.get('/data-map', async (_req: AuthRequest, res: Response) => {
  try {
    // Enrich with retention policies from database
    const policies = await prisma.dataRetentionPolicy.findMany({
      where: { isActive: true },
    });

    const policyMap = new Map(
      policies.map((p) => [`${p.module}:${p.dataCategory}`, p])
    );

    const enrichedMap = DATA_MAP.map((entry) => ({
      ...entry,
      retentionPolicies: policies
        .filter((p) => p.module === entry.module)
        .map((p) => ({
          dataCategory: p.dataCategory,
          retentionDays: p.retentionDays,
          action: p.action,
          legalBasis: p.legalBasis,
        })),
    }));

    res.json({
      success: true,
      data: {
        lastUpdated: new Date().toISOString(),
        modules: enrichedMap,
        totalModules: enrichedMap.length,
        totalPersonalFields: enrichedMap.reduce(
          (sum, m) => sum + m.personalFields.length,
          0
        ),
      },
    });
  } catch (error) {
    logger.error('Failed to generate data map', { error: error instanceof Error ? error.message : String(error) });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to generate data map' },
    });
  }
});

export default router;
