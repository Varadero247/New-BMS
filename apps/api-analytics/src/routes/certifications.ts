import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { authenticate } from '@ims/auth';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('certifications');
const router: Router = Router();
router.use(authenticate);

// ---------------------------------------------------------------------------
// GET / — List compliance deadlines with pagination, filter by status/category
// ---------------------------------------------------------------------------
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));
    const skip = (page - 1) * limit;
    const status = req.query.status as string | undefined;
    const category = req.query.category as string | undefined;

    const where: any = {};
    if (status) where.status = status;
    if (category) where.category = category;

    const [deadlines, total] = await Promise.all([
      prisma.complianceDeadline.findMany({
        where,
        orderBy: { dueDate: 'asc' },
        skip,
        take: limit,
      }),
      prisma.complianceDeadline.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        deadlines,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      },
    });
  } catch (err) {
    logger.error('Failed to list compliance deadlines', { error: String(err) });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list deadlines' } });
  }
});

// ---------------------------------------------------------------------------
// GET /seed — Seed 5 compliance deadlines (named route BEFORE /:id)
// ---------------------------------------------------------------------------
router.get('/seed', async (_req: Request, res: Response) => {
  try {
    const seeds = [
      { name: 'CREST Pen Test', category: 'SECURITY', dueDate: new Date('2026-06-15'), renewalFrequency: 'ANNUAL', ownerEmail: 'infosec@ims.local', status: 'UPCOMING' },
      { name: 'SOC 2 Type II Audit', category: 'COMPLIANCE', dueDate: new Date('2026-09-01'), renewalFrequency: 'ANNUAL', ownerEmail: 'compliance@ims.local', status: 'UPCOMING' },
      { name: 'ISO 27001 Surveillance Audit', category: 'COMPLIANCE', dueDate: new Date('2026-07-01'), renewalFrequency: 'ANNUAL', ownerEmail: 'quality@ims.local', status: 'UPCOMING' },
      { name: 'DMCC Licence Renewal', category: 'LICENCE', dueDate: new Date('2026-06-01'), renewalFrequency: 'ANNUAL', ownerEmail: 'operations@ims.local', status: 'UPCOMING' },
      { name: 'QFZP Regulatory Reviews', category: 'REGULATORY', dueDate: new Date('2026-04-01'), renewalFrequency: 'QUARTERLY', ownerEmail: 'compliance@ims.local', status: 'UPCOMING' },
    ];

    const result = await prisma.complianceDeadline.createMany({
      data: seeds,
      skipDuplicates: true,
    });

    logger.info('Compliance deadlines seeded', { count: result.count });
    res.json({ success: true, data: { created: result.count, total: seeds.length } });
  } catch (err) {
    logger.error('Failed to seed compliance deadlines', { error: String(err) });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to seed deadlines' } });
  }
});

// ---------------------------------------------------------------------------
// GET /:id — Get single compliance deadline
// ---------------------------------------------------------------------------
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const deadline = await prisma.complianceDeadline.findUnique({ where: { id: req.params.id } });
    if (!deadline) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Deadline not found' } });
    }
    res.json({ success: true, data: { deadline } });
  } catch (err) {
    logger.error('Failed to get compliance deadline', { error: String(err) });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get deadline' } });
  }
});

// ---------------------------------------------------------------------------
// POST / — Create compliance deadline
// ---------------------------------------------------------------------------
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, category, dueDate, renewalFrequency, ownerEmail, status, notes } = req.body;
    if (!name || !category || !dueDate) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'name, category, and dueDate are required' } });
    }

    const deadline = await prisma.complianceDeadline.create({
      data: {
        name,
        category,
        dueDate: new Date(dueDate),
        renewalFrequency: renewalFrequency || null,
        ownerEmail: ownerEmail || null,
        status: status || 'UPCOMING',
        notes: notes || null,
      },
    });

    logger.info('Compliance deadline created', { id: deadline.id, name });
    res.status(201).json({ success: true, data: { deadline } });
  } catch (err) {
    logger.error('Failed to create compliance deadline', { error: String(err) });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create deadline' } });
  }
});

// ---------------------------------------------------------------------------
// PATCH /:id — Update compliance deadline
// ---------------------------------------------------------------------------
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.complianceDeadline.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Deadline not found' } });
    }

    const { name, category, dueDate, renewalFrequency, ownerEmail, status, notes, lastCompletedAt } = req.body;
    const data: any = {};
    if (name !== undefined) data.name = name;
    if (category !== undefined) data.category = category;
    if (dueDate !== undefined) data.dueDate = new Date(dueDate);
    if (renewalFrequency !== undefined) data.renewalFrequency = renewalFrequency;
    if (ownerEmail !== undefined) data.ownerEmail = ownerEmail;
    if (status !== undefined) data.status = status;
    if (notes !== undefined) data.notes = notes;
    if (lastCompletedAt !== undefined) data.lastCompletedAt = new Date(lastCompletedAt);

    const deadline = await prisma.complianceDeadline.update({
      where: { id: req.params.id },
      data,
    });

    logger.info('Compliance deadline updated', { id: deadline.id });
    res.json({ success: true, data: { deadline } });
  } catch (err) {
    logger.error('Failed to update compliance deadline', { error: String(err) });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update deadline' } });
  }
});

export default router;
