import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { prisma } from '../prisma';
import { createLogger } from '@ims/monitoring';
const logger = createLogger('api-esg');

const router = Router();

const generateSchema = z.object({
  title: z.string().optional(),
  framework: z.string().min(1, 'Framework is required'),
  period: z.string().min(1, 'Period is required'),
});

router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = (req as any).user?.orgId || 'default';
    const data = await prisma.esgReport.findMany({ where: { orgId, deletedAt: null } as any as any, orderBy: { createdAt: 'desc' } });
    res.json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Request failed', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed' } });
  }
});

router.post('/generate', authenticate, async (req: Request, res: Response) => {
  try {
    const parsed = generateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } });
    }
    const orgId = (req as any).user?.orgId || 'default';
    const y = new Date().getFullYear();
    const c = await prisma.esgReport.count({ where: { orgId } as any });
    const { title, framework, period } = parsed.data;
    const data = await prisma.esgReport.create({
      data: {
        orgId,
        referenceNumber: `ESGR-${y}-${String(c + 1).padStart(4, '0')}`,
        title: title || `ESG Report ${y}`,
        framework,
        period,
        status: 'DRAFT',
        aiGenerated: true,
        createdBy: (req as AuthRequest).user?.id,
      } as any,
    });
    res.status(201).json({ success: true, data });
  } catch (error: unknown) {
    res.status(400).json({ success: false, error: { code: 'CREATE_ERROR', message: 'Failed to create resource' } });
  }
});

export default router;
