import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate } from '@ims/auth';
import { prisma } from '../prisma';

const router = Router();

const generateAgendaSchema = z.object({
  customItems: z.array(z.string()).optional(),
  includeAiNote: z.boolean().optional(),
});

router.post('/:id/generate', authenticate, async (req: Request, res: Response) => {
  try {
    const parsed = generateAgendaSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0]?.message || 'Invalid input' } });
    }

    const review = await prisma.mgmtReview.findFirst({ where: { id: req.params.id, deletedAt: null } as any });
    if (!review) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Review not found' } });

    const agenda = {
      title: `Management Review Agenda - ${review.title}`,
      items: [
        '1. Previous review actions',
        '2. Audit results summary',
        '3. Risk register status',
        '4. Incident trends',
        '5. CAPA effectiveness',
        '6. Customer feedback',
        '7. Supplier performance',
        '8. Training compliance',
        '9. KPI review',
        '10. Improvement opportunities',
        '11. Resource needs',
        '12. Actions and next review date',
      ],
      aiNote: 'AI-generated agenda placeholder',
    };

    await prisma.mgmtReview.update({ where: { id: req.params.id }, data: { aiGeneratedAgenda: JSON.stringify(agenda) } });
    res.json({ success: true, data: agenda });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: { code: 'GENERATE_ERROR', message: 'Failed to generate resource' } });
  }
});

export default router;
