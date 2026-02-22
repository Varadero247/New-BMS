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

// ISO 27001:2022 Control A.5.7 — Threat Intelligence

const tiSchema = z.object({
  title: z.string().trim().min(1),
  source: z.string().trim().min(1),
  category: z.enum(['TECHNICAL', 'TACTICAL', 'STRATEGIC', 'OPERATIONAL']),
  threatType: z.enum(['MALWARE', 'PHISHING', 'RANSOMWARE', 'APT', 'INSIDER', 'SUPPLY_CHAIN', 'VULNERABILITY', 'DDoS', 'SOCIAL_ENGINEERING', 'OTHER']),
  description: z.string().trim().min(1),
  iocIndicators: z.array(z.string()).optional(),
  affectedSystems: z.array(z.string()).optional(),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  confidence: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  tlpLevel: z.enum(['WHITE', 'GREEN', 'AMBER', 'RED']).optional(),
  recommendedActions: z.string().trim().optional(),
  validUntil: z.string().refine((s) => !isNaN(Date.parse(s))).optional(),
  reportedBy: z.string().trim().min(1),
});

// GET / - list threat intelligence reports
router.get('/', async (req: Request, res: Response) => {
  try {
    const { category, severity, status } = req.query;
    const { skip, limit, page } = parsePagination(req.query);
    const where: Record<string, unknown> = { deletedAt: null };
    if (category) where.category = category;
    if (severity) where.severity = severity;
    if (status) where.status = status;
    const [items, total] = await Promise.all([
      prisma.isThreatIntelligence.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.isThreatIntelligence.count({ where }),
    ]);
    res.json({ success: true, data: items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error: unknown) {
    logger.error('Failed to list threat intelligence', { error: error instanceof Error ? error.message : 'Unknown' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list threat intelligence' } });
  }
});

// POST /
router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = tiSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed' }, details: parsed.error.flatten() });
    }
    const item = await prisma.isThreatIntelligence.create({
      data: {
        id: uuidv4(), ...parsed.data,
        validUntil: parsed.data.validUntil ? new Date(parsed.data.validUntil) : undefined,
        status: 'ACTIVE',
      },
    });
    logger.info('Threat intelligence created', { title: parsed.data.title, severity: parsed.data.severity });
    res.status(201).json({ success: true, data: item });
  } catch (error: unknown) {
    logger.error('Failed to create threat intelligence', { error: error instanceof Error ? error.message : 'Unknown' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create threat intelligence' } });
  }
});

// GET /summary
router.get('/summary', async (_req: Request, res: Response) => {
  try {
    const [total, bySeverity, byCategory] = await Promise.all([
      prisma.isThreatIntelligence.count({ where: { deletedAt: null, status: 'ACTIVE' } }),
      prisma.isThreatIntelligence.groupBy({ by: ['severity'], where: { deletedAt: null }, _count: { id: true } }),
      prisma.isThreatIntelligence.groupBy({ by: ['category'], where: { deletedAt: null }, _count: { id: true } }),
    ]);
    res.json({
      success: true,
      data: {
        total,
        bySeverity: Object.fromEntries(bySeverity.map((b) => [b.severity, b._count.id])),
        byCategory: Object.fromEntries(byCategory.map((b) => [b.category, b._count.id])),
      },
    });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get summary' } });
  }
});

// GET /:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const item = await prisma.isThreatIntelligence.findUnique({ where: { id: req.params.id } });
    if (!item || item.deletedAt) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Threat intelligence not found' } });
    }
    res.json({ success: true, data: item });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get threat intelligence' } });
  }
});

// PUT /:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.isThreatIntelligence.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.deletedAt) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Threat intelligence not found' } });
    }
    const updateSchema = tiSchema.partial().extend({
      status: z.enum(['ACTIVE', 'EXPIRED', 'MITIGATED', 'ARCHIVED']).optional(),
      mitigationNotes: z.string().trim().optional(),
    });
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed' }, details: parsed.error.flatten() });
    }
    const { validUntil, ...rest } = parsed.data;
    const updated = await prisma.isThreatIntelligence.update({
      where: { id: req.params.id },
      data: { ...rest, ...(validUntil ? { validUntil: new Date(validUntil) } : {}) },
    });
    res.json({ success: true, data: updated });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update threat intelligence' } });
  }
});

export default router;
