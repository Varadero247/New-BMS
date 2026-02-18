import { Router, Response } from 'express';
import type { Router as IRouter } from 'express';
import { prisma, Prisma } from '../prisma';
import { authenticate, type AuthRequest } from '@ims/auth';
import { z } from 'zod';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';
import { checkOwnership, scopeToUser } from '@ims/service-auth';

const logger = createLogger('api-medical');
const router: IRouter = Router();
router.use(authenticate);
router.param('id', validateIdParam());

// ============================================
// HELPERS
// ============================================

const SOFTWARE_SAFETY_CLASSES = ['CLASS_A', 'CLASS_B', 'CLASS_C'] as const;

const SOFTWARE_PHASES = [
  'PLANNING', 'REQUIREMENTS', 'ARCHITECTURE', 'DETAILED_DESIGN',
  'IMPLEMENTATION', 'UNIT_TESTING', 'INTEGRATION_TESTING',
  'SYSTEM_TESTING', 'RELEASE',
] as const;

const SOFTWARE_PROJECT_STATUSES = ['ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED'] as const;

const ANOMALY_SEVERITIES = ['COSMETIC', 'MINOR', 'MAJOR', 'CRITICAL'] as const;

const ANOMALY_STATUSES = ['OPEN', 'INVESTIGATING', 'RESOLVED', 'CLOSED', 'WONT_FIX'] as const;

const PHASE_DOC_STATUSES = ['NOT_STARTED', 'IN_PROGRESS', 'REVIEW', 'APPROVED'] as const;

/**
 * Generate reference number: SW-YYMM-XXXX
 */
async function generateProjectRefNumber(): Promise<string> {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const prefix = `SW-${yy}${mm}`;

  const count = await prisma.softwareProject.count({
    where: { refNumber: { startsWith: prefix } },
  });

  return `${prefix}-${String(count + 1).padStart(4, '0')}`;
}

/**
 * Generate anomaly reference number: SW-ANM-YYMM-XXXX
 */
async function generateAnomalyRefNumber(): Promise<string> {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const prefix = `SW-ANM-${yy}${mm}`;

  const count = await prisma.softwareAnomaly.count({
    where: { refNumber: { startsWith: prefix } },
  });

  return `${prefix}-${String(count + 1).padStart(4, '0')}`;
}

// ============================================
// 1. POST /projects - Create software project
// ============================================
router.post('/projects', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      title: z.string().trim().min(1).max(200),
      description: z.string().optional(),
      safetyClass: z.enum(SOFTWARE_SAFETY_CLASSES),
      currentPhase: z.enum(SOFTWARE_PHASES).optional(),
      status: z.enum(SOFTWARE_PROJECT_STATUSES).optional(),
    });

    const data = schema.parse(req.body);
    const refNumber = await generateProjectRefNumber();

    const project = await prisma.softwareProject.create({
      data: {
        refNumber,
        title: data.title,
        description: data.description,
        safetyClass: data.safetyClass,
        currentPhase: data.currentPhase || 'PLANNING',
        status: data.status || 'ACTIVE',
        createdBy: req.user?.id,
      },
    });

    res.status(201).json({ success: true, data: project });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) },
      });
    }
    logger.error('Create software project error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create software project' } });
  }
});

// ============================================
// 2. GET /projects - List projects with pagination
// ============================================
router.get('/projects', scopeToUser, async (req: AuthRequest, res: Response) => {
  try {
    const {
      page = '1', limit = '20', status, safetyClass, currentPhase,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(Math.max(1, parseInt(limit as string, 10) || 20), 100);
    const skip = (pageNum - 1) * limitNum;

    const where: any = { deletedAt: null };

    if (status) where.status = status as any;
    if (safetyClass) where.safetyClass = safetyClass as any;
    if (currentPhase) where.currentPhase = currentPhase as any;

    const [projects, total] = await Promise.all([
      prisma.softwareProject.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.softwareProject.count({ where }),
    ]);

    res.json({
      success: true,
      data: projects,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    logger.error('List software projects error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list software projects' } });
  }
});

// ============================================
// 3. GET /projects/:id - Get with SOUP items, anomalies, phase docs
// ============================================
router.get('/projects/:id', checkOwnership(prisma.softwareProject), async (req: AuthRequest, res: Response) => {
  try {
    const project = await prisma.softwareProject.findUnique({
      where: { id: req.params.id },
      include: {
        soupItems: { orderBy: { createdAt: 'desc' } },
        anomalies: { orderBy: { createdAt: 'desc' } },
        phases: { orderBy: { phase: 'asc' } },
      },
    });

    if (!project || project.deletedAt) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Software project not found' } });
    }

    res.json({ success: true, data: project });
  } catch (error) {
    logger.error('Get software project error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get software project' } });
  }
});

// ============================================
// 4. POST /projects/:id/soup - Add SOUP item
// ============================================
router.post('/projects/:id/soup', async (req: AuthRequest, res: Response) => {
  try {
    const project = await prisma.softwareProject.findUnique({ where: { id: req.params.id } });
    if (!project || project.deletedAt) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Software project not found' } });
    }

    const schema = z.object({
      title: z.string().trim().min(1).max(200),
      vendor: z.string().optional(),
      version: z.string().trim().min(1).max(200),
      intendedUse: z.string().optional(),
      knownAnomalies: z.string().optional(),
      riskAcceptable: z.boolean().optional(),
      verifiedDate: z.string().optional(),
    });

    const data = schema.parse(req.body);

    const soupItem = await prisma.soupItem.create({
      data: {
        projectId: req.params.id,
        title: data.title,
        vendor: data.vendor,
        version: data.version,
        intendedUse: data.intendedUse,
        knownAnomalies: data.knownAnomalies,
        riskAcceptable: data.riskAcceptable ?? false,
        verifiedDate: data.verifiedDate ? new Date(data.verifiedDate) : undefined,
      },
    });

    res.status(201).json({ success: true, data: soupItem });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) },
      });
    }
    logger.error('Create SOUP item error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create SOUP item' } });
  }
});

// ============================================
// 5. PUT /projects/:id/phase/:phase - Update lifecycle phase docs
// ============================================
router.put('/projects/:id/phase/:phase', async (req: AuthRequest, res: Response) => {
  try {
    const project = await prisma.softwareProject.findUnique({ where: { id: req.params.id } });
    if (!project || project.deletedAt) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Software project not found' } });
    }

    const phaseParam = req.params.phase;

    // Validate phase is a valid SoftwarePhase enum value
    const phaseSchema = z.enum(SOFTWARE_PHASES);
    const validPhase = phaseSchema.parse(phaseParam);

    const schema = z.object({
      documentRef: z.string().optional(),
      content: z.string().optional(),
      status: z.enum(PHASE_DOC_STATUSES).optional(),
      reviewedBy: z.string().optional(),
      reviewedDate: z.string().optional(),
    });

    const data = schema.parse(req.body);

    // Upsert: create or update the phase document
    const phaseDoc = await prisma.softwarePhaseDoc.upsert({
      where: {
        projectId_phase: {
          projectId: req.params.id,
          phase: validPhase,
        },
      },
      create: {
        projectId: req.params.id,
        phase: validPhase,
        documentRef: data.documentRef,
        content: data.content,
        status: data.status || 'IN_PROGRESS',
        reviewedBy: data.reviewedBy,
        reviewedDate: data.reviewedDate ? new Date(data.reviewedDate) : undefined,
      },
      update: {
        ...(data.documentRef !== undefined && { documentRef: data.documentRef }),
        ...(data.content !== undefined && { content: data.content }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.reviewedBy !== undefined && { reviewedBy: data.reviewedBy }),
        ...(data.reviewedDate !== undefined && { reviewedDate: new Date(data.reviewedDate) }),
      },
    });

    res.json({ success: true, data: phaseDoc });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) },
      });
    }
    logger.error('Update phase doc error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update phase document' } });
  }
});

// ============================================
// 6. POST /projects/:id/anomalies - Report anomaly
// ============================================
router.post('/projects/:id/anomalies', async (req: AuthRequest, res: Response) => {
  try {
    const project = await prisma.softwareProject.findUnique({ where: { id: req.params.id } });
    if (!project || project.deletedAt) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Software project not found' } });
    }

    const schema = z.object({
      title: z.string().trim().min(1).max(200),
      description: z.string().trim().min(1).max(2000),
      severity: z.enum(ANOMALY_SEVERITIES).optional(),
      status: z.enum(ANOMALY_STATUSES).optional(),
      resolution: z.string().optional(),
    });

    const data = schema.parse(req.body);
    const refNumber = await generateAnomalyRefNumber();

    const anomaly = await prisma.softwareAnomaly.create({
      data: {
        projectId: req.params.id,
        refNumber,
        title: data.title,
        description: data.description,
        severity: data.severity || 'MINOR',
        status: data.status || 'OPEN',
        resolution: data.resolution,
        createdBy: req.user?.id,
      },
    });

    res.status(201).json({ success: true, data: anomaly });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) },
      });
    }
    logger.error('Create software anomaly error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create software anomaly' } });
  }
});

// ============================================
// 7. GET /projects/:id/anomalies - List anomalies with filters
// ============================================
router.get('/projects/:id/anomalies', async (req: AuthRequest, res: Response) => {
  try {
    const project = await prisma.softwareProject.findUnique({ where: { id: req.params.id } });
    if (!project || project.deletedAt) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Software project not found' } });
    }

    const {
      page = '1', limit = '20', severity, status,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(Math.max(1, parseInt(limit as string, 10) || 20), 100);
    const skip = (pageNum - 1) * limitNum;

    const where: any = { projectId: req.params.id };

    if (severity) where.severity = severity as any;
    if (status) where.status = status as any;

    const [anomalies, total] = await Promise.all([
      prisma.softwareAnomaly.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.softwareAnomaly.count({ where }),
    ]);

    res.json({
      success: true,
      data: anomalies,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    logger.error('List software anomalies error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list software anomalies' } });
  }
});

export default router;
