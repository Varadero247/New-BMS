import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate , type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { prisma } from '../prisma';

const router = Router();
const logger = createLogger('incidents-incidents');

const incidentCreateSchema = z.object({
  title: z.string().min(1, 'title is required'),
  description: z.string().optional(),
  type: z.enum(['INJURY', 'NEAR_MISS', 'ENVIRONMENTAL', 'PROPERTY_DAMAGE', 'SECURITY', 'QUALITY', 'VEHICLE', 'OTHER']).optional(),
  severity: z.enum(['MINOR', 'MODERATE', 'MAJOR', 'CRITICAL', 'CATASTROPHIC']).optional(),
  status: z.enum(['REPORTED', 'ACKNOWLEDGED', 'INVESTIGATING', 'ROOT_CAUSE_ANALYSIS', 'CORRECTIVE_ACTION', 'CLOSED', 'REOPENED']).optional(),
  dateOccurred: z.string().min(1, 'dateOccurred is required'),
  timeOccurred: z.string().optional(),
  location: z.string().optional(),
  area: z.string().optional(),
  department: z.string().optional(),
  reportedBy: z.string().optional(),
  reportedByName: z.string().optional(),
  injuredPerson: z.string().optional(),
  injuredPersonRole: z.string().optional(),
  injuryType: z.string().optional(),
  bodyPart: z.string().optional(),
  treatmentGiven: z.string().optional(),
  hospitalized: z.boolean().optional(),
  daysLost: z.number().optional(),
  witnesses: z.array(z.string()).optional(),
  immediateActions: z.string().optional(),
  rootCause: z.string().optional(),
  contributingFactors: z.string().optional(),
  correctiveActions: z.string().optional(),
  preventiveActions: z.string().optional(),
  riddorReportable: z.enum(['YES', 'NO', 'PENDING_ASSESSMENT']).optional(),
  riddorRef: z.string().optional(),
  investigator: z.string().optional(),
  investigatorName: z.string().optional(),
  linkedRiskId: z.string().optional(),
  linkedCapaId: z.string().optional(),
  photoUrls: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

const incidentUpdateSchema = incidentCreateSchema.partial();

async function generateRef(orgId: string): Promise<string> {
  const y = new Date().getFullYear();
  const c = await prisma.incIncident.count({
    where: { orgId, referenceNumber: { startsWith: `INC-${y}` } },
  });
  return `INC-${y}-${String(c + 1).padStart(4, '0')}`;
}

router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as AuthRequest).user as any)?.orgId || 'default';
    const { status, search, page = '1', limit = '20' } = req.query as Record<string, string>;
    const where: Record<string, unknown> = { orgId, deletedAt: null };
    if (status) where.status = status;
    if (search) where.title = { contains: search, mode: 'insensitive' };
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [data, total] = await Promise.all([
      prisma.incIncident.findMany({ where, skip, take: parseInt(limit), orderBy: { createdAt: 'desc' } }),
      prisma.incIncident.count({ where }),
    ]);
    res.json({
      success: true,
      data,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error: unknown) {
    logger.error('Fetch failed', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch incidents' } });
  }
});

router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as AuthRequest).user as any)?.orgId || 'default';
    const item = await prisma.incIncident.findFirst({ where: { id: req.params.id, orgId, deletedAt: null } as any });
    if (!item) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'incident not found' } });
    res.json({ success: true, data: item });
  } catch (error: unknown) {
    logger.error('Request failed', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch incident' } });
  }
});

router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const parsed = incidentCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message },
      });
    }
    const orgId = ((req as AuthRequest).user as any)?.orgId || 'default';
    const referenceNumber = await generateRef(orgId);
    const data = await prisma.incIncident.create({
      data: {
        ...parsed.data,
        orgId,
        referenceNumber,
        createdBy: (req as AuthRequest).user?.id,
        updatedBy: (req as AuthRequest).user?.id,
      },
    });
    res.status(201).json({ success: true, data });
  } catch (error: unknown) {
    res.status(400).json({ success: false, error: { code: 'CREATE_ERROR', message: 'Failed to create resource' } });
  }
});

router.put('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const parsed = incidentUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message },
      });
    }
    const orgId = ((req as AuthRequest).user as any)?.orgId || 'default';
    const existing = await prisma.incIncident.findFirst({ where: { id: req.params.id, orgId, deletedAt: null } as any });
    if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'incident not found' } });
    const data = await prisma.incIncident.update({
      where: { id: req.params.id },
      data: { ...parsed.data, updatedBy: (req as AuthRequest).user?.id },
    });
    res.json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Request failed', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update resource' } });
  }
});

router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as AuthRequest).user as any)?.orgId || 'default';
    const existing = await prisma.incIncident.findFirst({ where: { id: req.params.id, orgId, deletedAt: null } as any });
    if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'incident not found' } });
    await prisma.incIncident.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date(), updatedBy: (req as AuthRequest).user?.id },
    });
    res.json({ success: true, data: { message: 'incident deleted successfully' } });
  } catch (error: unknown) {
    logger.error('Request failed', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete resource' } });
  }
});

export default router;
