import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { prisma } from '../prisma';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';
const logger = createLogger('api-mgmt-review');

const router = Router();
router.param('id', validateIdParam());

const generateAgendaSchema = z.object({
  customItems: z.array(z.string().trim()).optional(),
  includeAiNote: z.boolean().optional(),
});

router.post('/:id/generate', authenticate, async (req: Request, res: Response) => {
  try {
    const parsed = generateAgendaSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: parsed.error.errors[0]?.message || 'Invalid input',
        },
      });
    }

    const orgId = ((req as AuthRequest).user as { orgId?: string })?.orgId || 'default';
    const review = await prisma.mgmtReview.findFirst({
      where: { id: req.params.id, orgId, deletedAt: null },
    });
    if (!review)
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Review not found' } });

    const reviewRecord = review as Record<string, unknown>;
    const customItems: string[] = parsed.data.customItems ?? [];
    const baseItems = [
      '1. Review of actions from previous management review',
      '2. Changes in external and internal issues relevant to the IMS',
      '3. Audit results (internal and external)',
      '4. Performance and effectiveness of the IMS — KPIs and objectives',
      '5. Nonconformities and corrective actions (CAPA effectiveness)',
      '6. Risk register status and emerging risks',
      '7. Incident and near-miss trend analysis',
      '8. Customer feedback and satisfaction results',
      '9. Supplier and contractor performance review',
      '10. Training compliance and competence assessment',
      '11. Opportunities for improvement',
      '12. Resource requirements and adequacy',
      '13. Any changes that could affect the IMS',
      ...customItems.map((item, i) => `${14 + i}. ${item}`),
      `${14 + customItems.length}. Actions arising, owners, and next review date`,
    ];

    const agenda = {
      title: `Management Review Agenda — ${reviewRecord.title}`,
      reviewType: reviewRecord.reviewType ?? 'ANNUAL',
      scheduledDate: reviewRecord.scheduledDate ?? null,
      location: reviewRecord.location ?? null,
      chairperson: reviewRecord.chairperson ?? null,
      items: baseItems,
      generatedAt: new Date().toISOString(),
    };

    await prisma.mgmtReview.update({
      where: { id: req.params.id },
      data: { aiGeneratedAgenda: JSON.stringify(agenda) },
    });
    res.json({ success: true, data: agenda });
  } catch (error: unknown) {
    logger.error('Request failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to generate resource' },
    });
  }
});

export default router;
