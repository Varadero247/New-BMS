import { Router, Request, Response } from 'express';
import { authenticate } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { prisma } from '../prisma';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

const router = Router();
const logger = createLogger('api-crm:deals');

router.use(authenticate);

function generateRefNumber(): string {
  const now = new Date();
  const yy = now.getFullYear().toString().slice(-2);
  const mm = (now.getMonth() + 1).toString().padStart(2, '0');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `DEAL-${yy}${mm}-${rand}`;
}

const RESERVED_PATHS = new Set(['pipelines', 'forecast', 'board']);

const createPipelineSchema = z.object({
  name: z.string().min(1, 'Pipeline name is required'),
  description: z.string().optional(),
  stages: z.array(z.object({
    name: z.string().min(1),
    order: z.number().int().min(0),
    probability: z.number().min(0).max(100).optional(),
  })).min(1, 'At least one stage is required'),
});

const updateStagesSchema = z.object({
  stages: z.array(z.object({
    id: z.string().uuid().optional(),
    name: z.string().min(1),
    order: z.number().int().min(0),
    probability: z.number().min(0).max(100).optional(),
  })).min(1, 'At least one stage is required'),
});

const createDealSchema = z.object({
  title: z.string().min(1, 'Deal title is required'),
  value: z.number().min(0, 'Value is required'),
  currency: z.string().default('USD'),
  accountId: z.string().uuid().optional(),
  contactId: z.string().uuid().optional(),
  pipelineId: z.string().uuid().optional(),
  stageId: z.string().uuid().optional(),
  probability: z.number().min(0).max(100).optional(),
  expectedCloseDate: z.string().datetime().optional(),
  assignedTo: z.string().optional(),
  source: z.string().optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

const updateDealSchema = createDealSchema.partial();

// GET /pipelines — List pipelines
router.get('/pipelines', async (_req: Request, res: Response) => {
  try {
    const pipelines = await prisma.crmPipeline.findMany({
      include: { stages: { orderBy: { order: 'asc' } } },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ success: true, data: pipelines });
  } catch (error: any) {
    logger.error('Failed to list pipelines', { error: error.message });
    return res.status(500).json({ success: false, error: 'Failed to list pipelines' });
  }
});

// POST /pipelines — Create pipeline
router.post('/pipelines', async (req: Request, res: Response) => {
  try {
    const validation = createPipelineSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: validation.error.errors.map((e) => e.message).join(', '),
      });
    }

    const { stages, ...pipelineData } = validation.data;

    const pipeline = await prisma.crmPipeline.create({
      data: {
        id: uuidv4(),
        ...pipelineData,
        createdBy: (req as any).user?.id || 'system',
        stages: {
          create: stages.map((stage) => ({
            id: uuidv4(),
            ...stage,
          })),
        },
      },
      include: { stages: { orderBy: { order: 'asc' } } },
    });

    logger.info('Pipeline created', { pipelineId: pipeline.id });
    return res.status(201).json({ success: true, data: pipeline });
  } catch (error: any) {
    logger.error('Failed to create pipeline', { error: error.message });
    return res.status(500).json({ success: false, error: 'Failed to create pipeline' });
  }
});

// PUT /pipelines/:id/stages — Update stages
router.put('/pipelines/:id/stages', async (req: Request, res: Response) => {
  try {
    const validation = updateStagesSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: validation.error.errors.map((e) => e.message).join(', '),
      });
    }

    const pipeline = await prisma.crmPipeline.findUnique({
      where: { id: req.params.id },
    });

    if (!pipeline) {
      return res.status(404).json({ success: false, error: 'Pipeline not found' });
    }

    // Delete existing stages and recreate
    await prisma.crmPipelineStage.deleteMany({
      where: { pipelineId: req.params.id },
    });

    await prisma.crmPipelineStage.createMany({
      data: validation.data.stages.map((stage) => ({
        id: stage.id || uuidv4(),
        pipelineId: req.params.id,
        name: stage.name,
        order: stage.order,
        probability: stage.probability,
      })),
    });

    const updated = await prisma.crmPipeline.findUnique({
      where: { id: req.params.id },
      include: { stages: { orderBy: { order: 'asc' } } },
    });

    logger.info('Pipeline stages updated', { pipelineId: req.params.id });
    return res.json({ success: true, data: updated });
  } catch (error: any) {
    logger.error('Failed to update pipeline stages', { error: error.message });
    return res.status(500).json({ success: false, error: 'Failed to update pipeline stages' });
  }
});

// GET /forecast — Weighted pipeline forecast
router.get('/forecast', async (_req: Request, res: Response) => {
  try {
    const deals = await prisma.crmDeal.findMany({
      where: { status: 'OPEN', deletedAt: null },
      select: { value: true, probability: true, currency: true },
    });

    const forecast = deals.reduce(
      (acc, deal) => {
        const weighted = (deal.value || 0) * ((deal.probability || 0) / 100);
        acc.totalValue += deal.value || 0;
        acc.weightedValue += weighted;
        acc.dealCount += 1;
        return acc;
      },
      { totalValue: 0, weightedValue: 0, dealCount: 0 }
    );

    return res.json({ success: true, data: forecast });
  } catch (error: any) {
    logger.error('Failed to get forecast', { error: error.message });
    return res.status(500).json({ success: false, error: 'Failed to get forecast' });
  }
});

// GET /board — Kanban board data
router.get('/board', async (req: Request, res: Response) => {
  try {
    const pipelineId = req.query.pipelineId as string;

    const where: any = { deletedAt: null, status: 'OPEN' };
    if (pipelineId) {
      where.pipelineId = pipelineId;
    }

    const deals = await prisma.crmDeal.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
    });

    // Group by stageId
    const board: Record<string, any[]> = {};
    for (const deal of deals) {
      const stageKey = deal.stageId || 'unassigned';
      if (!board[stageKey]) {
        board[stageKey] = [];
      }
      board[stageKey].push(deal);
    }

    return res.json({ success: true, data: board });
  } catch (error: any) {
    logger.error('Failed to get board data', { error: error.message });
    return res.status(500).json({ success: false, error: 'Failed to get board data' });
  }
});

// POST / — Create deal
router.post('/', async (req: Request, res: Response) => {
  try {
    const validation = createDealSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: validation.error.errors.map((e) => e.message).join(', '),
      });
    }

    const deal = await prisma.crmDeal.create({
      data: {
        id: uuidv4(),
        refNumber: generateRefNumber(),
        ...validation.data,
        status: 'OPEN',
        expectedCloseDate: validation.data.expectedCloseDate
          ? new Date(validation.data.expectedCloseDate)
          : undefined,
        createdBy: (req as any).user?.id || 'system',
        updatedBy: (req as any).user?.id || 'system',
      },
    });

    logger.info('Deal created', { dealId: deal.id, refNumber: deal.refNumber });
    return res.status(201).json({ success: true, data: deal });
  } catch (error: any) {
    logger.error('Failed to create deal', { error: error.message });
    return res.status(500).json({ success: false, error: 'Failed to create deal' });
  }
});

// GET / — List deals
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const skip = (page - 1) * limit;
    const pipelineId = req.query.pipelineId as string;
    const stageId = req.query.stageId as string;
    const assignedTo = req.query.assignedTo as string;
    const status = req.query.status as string;

    const where: any = { deletedAt: null };

    if (pipelineId) where.pipelineId = pipelineId;
    if (stageId) where.stageId = stageId;
    if (assignedTo) where.assignedTo = assignedTo;
    if (status) where.status = status;

    const [deals, total] = await Promise.all([
      prisma.crmDeal.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.crmDeal.count({ where }),
    ]);

    return res.json({
      success: true,
      data: deals,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    logger.error('Failed to list deals', { error: error.message });
    return res.status(500).json({ success: false, error: 'Failed to list deals' });
  }
});

// GET /:id — Deal detail
router.get('/:id', async (req: Request, res: Response) => {
  if (RESERVED_PATHS.has(req.params.id)) return (res as any).next('route');
  try {
    const deal = await prisma.crmDeal.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });

    if (!deal) {
      return res.status(404).json({ success: false, error: 'Deal not found' });
    }

    // Fetch related activities and contacts
    const [activities, contacts] = await Promise.all([
      prisma.crmActivity.findMany({
        where: { dealId: req.params.id },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
      deal.contactId
        ? prisma.crmContact.findMany({
            where: { id: deal.contactId, deletedAt: null },
          })
        : Promise.resolve([]),
    ]);

    return res.json({
      success: true,
      data: { ...deal, activities, contacts },
    });
  } catch (error: any) {
    logger.error('Failed to get deal', { error: error.message });
    return res.status(500).json({ success: false, error: 'Failed to get deal' });
  }
});

// PUT /:id — Update deal
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const validation = updateDealSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: validation.error.errors.map((e) => e.message).join(', '),
      });
    }

    const existing = await prisma.crmDeal.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });

    if (!existing) {
      return res.status(404).json({ success: false, error: 'Deal not found' });
    }

    const data: any = { ...validation.data, updatedBy: (req as any).user?.id || 'system' };
    if (data.expectedCloseDate) {
      data.expectedCloseDate = new Date(data.expectedCloseDate);
    }

    const deal = await prisma.crmDeal.update({
      where: { id: req.params.id },
      data,
    });

    logger.info('Deal updated', { dealId: deal.id });
    return res.json({ success: true, data: deal });
  } catch (error: any) {
    logger.error('Failed to update deal', { error: error.message });
    return res.status(500).json({ success: false, error: 'Failed to update deal' });
  }
});

// PUT /:id/stage — Move to stage
router.put('/:id/stage', async (req: Request, res: Response) => {
  try {
    const { stageId } = req.body;
    if (!stageId) {
      return res.status(400).json({ success: false, error: 'stageId is required' });
    }

    const existing = await prisma.crmDeal.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });

    if (!existing) {
      return res.status(404).json({ success: false, error: 'Deal not found' });
    }

    const deal = await prisma.crmDeal.update({
      where: { id: req.params.id },
      data: {
        stageId,
        updatedBy: (req as any).user?.id || 'system',
      },
    });

    // Log stage change activity
    await prisma.crmActivity.create({
      data: {
        id: uuidv4(),
        dealId: req.params.id,
        contactId: deal.contactId || undefined,
        type: 'NOTE',
        subject: `Deal moved to new stage`,
        description: `Stage changed to ${stageId}`,
        createdBy: (req as any).user?.id || 'system',
      },
    });

    logger.info('Deal stage updated', { dealId: deal.id, stageId });
    return res.json({ success: true, data: deal });
  } catch (error: any) {
    logger.error('Failed to update deal stage', { error: error.message });
    return res.status(500).json({ success: false, error: 'Failed to update deal stage' });
  }
});

// PUT /:id/won — Close won
router.put('/:id/won', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.crmDeal.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });

    if (!existing) {
      return res.status(404).json({ success: false, error: 'Deal not found' });
    }

    const deal = await prisma.crmDeal.update({
      where: { id: req.params.id },
      data: {
        status: 'WON',
        actualCloseDate: new Date(),
        probability: 100,
        updatedBy: (req as any).user?.id || 'system',
      },
    });

    await prisma.crmActivity.create({
      data: {
        id: uuidv4(),
        dealId: req.params.id,
        contactId: deal.contactId || undefined,
        type: 'NOTE',
        subject: 'Deal closed — Won',
        createdBy: (req as any).user?.id || 'system',
      },
    });

    logger.info('Deal closed won', { dealId: deal.id });
    return res.json({ success: true, data: deal });
  } catch (error: any) {
    logger.error('Failed to close deal as won', { error: error.message });
    return res.status(500).json({ success: false, error: 'Failed to close deal as won' });
  }
});

// PUT /:id/lost — Close lost
router.put('/:id/lost', async (req: Request, res: Response) => {
  try {
    const { lostReason } = req.body;
    if (!lostReason) {
      return res.status(400).json({ success: false, error: 'lostReason is required' });
    }

    const existing = await prisma.crmDeal.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });

    if (!existing) {
      return res.status(404).json({ success: false, error: 'Deal not found' });
    }

    const deal = await prisma.crmDeal.update({
      where: { id: req.params.id },
      data: {
        status: 'LOST',
        actualCloseDate: new Date(),
        lostReason,
        probability: 0,
        updatedBy: (req as any).user?.id || 'system',
      },
    });

    await prisma.crmActivity.create({
      data: {
        id: uuidv4(),
        dealId: req.params.id,
        contactId: deal.contactId || undefined,
        type: 'NOTE',
        subject: `Deal closed — Lost: ${lostReason}`,
        createdBy: (req as any).user?.id || 'system',
      },
    });

    logger.info('Deal closed lost', { dealId: deal.id, lostReason });
    return res.json({ success: true, data: deal });
  } catch (error: any) {
    logger.error('Failed to close deal as lost', { error: error.message });
    return res.status(500).json({ success: false, error: 'Failed to close deal as lost' });
  }
});

export default router;
