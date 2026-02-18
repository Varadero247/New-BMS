import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { prisma } from '../prisma';
import { AutomationConfig } from '../config';

const logger = createLogger('api-marketing:linkedin');
const router = Router();

const outreachSchema = z.object({
  prospectName: z.string().trim().min(1),
  prospectTitle: z.string().optional(),
  company: z.string().trim().min(1),
  linkedinUrl: z.string().url('Invalid URL').trim().min(1),
  template: z.enum(['ISO_CONSULTANT', 'QUALITY_MANAGER', 'EHS_MANAGER', 'GCC_PROCUREMENT', 'CERTIFICATION_BODY']),
  customContext: z.string().optional(),
});

const statusUpdateSchema = z.object({
  status: z.enum(['PENDING', 'SENT', 'CONNECTED', 'REPLIED', 'MEETING', 'CLOSED_WON', 'CLOSED_LOST']),
  notes: z.string().optional(),
});

// POST /api/linkedin/outreach
router.post('/outreach', authenticate, async (req: Request, res: Response) => {
  try {
    const parsed = outreachSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message },
      });
    }

    const data = parsed.data;
    const userId = (req as AuthRequest).user?.id || 'system';

    // Check daily limit
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayCount = await prisma.mktLinkedInOutreach.count({
      where: {
        createdBy: userId,
        createdAt: { gte: today },
      },
    });

    if (todayCount >= AutomationConfig.linkedin.dailyOutreachLimit) {
      return res.status(429).json({
        success: false,
        error: {
          code: 'DAILY_LIMIT_REACHED',
          message: `Daily LinkedIn limit reached (${AutomationConfig.linkedin.dailyOutreachLimit}). Outreach scheduled for tomorrow.`,
        },
      });
    }

    // Generate message with AI
    let generatedMsg = `Hi ${data.prospectName}, I noticed your work at ${data.company}. Would love to connect and share insights on compliance management.`;

    try {
      const apiKey = process.env.ANTHROPIC_API_KEY;
      if (apiKey) {
        const prompt = `Write a LinkedIn connection request message for ${data.prospectName} who is a ${data.prospectTitle || 'professional'} at ${data.company}.
Template type: ${data.template}
Context: ${data.customContext || 'none'}

Rules:
- Maximum 280 characters (LinkedIn limit)
- Must feel personal and specific, not templated
- Reference something specific about their role or industry
- End with a question or soft observation, not a pitch
- Do NOT mention Nexara by name in the connection request

Return only the message text, nothing else.`;

        const resp = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 100,
            messages: [{ role: 'user', content: prompt }],
          }),
        });

        if (resp.ok) {
          const aiData = await resp.json() as any;
          const text = aiData.content?.[0]?.text || '';
          if (text.length > 0 && text.length <= 300) {
            generatedMsg = text.trim();
          }
        }
      }
    } catch (err) {
      logger.warn('AI message generation failed', { error: String(err) });
    }

    const outreach = await prisma.mktLinkedInOutreach.create({
      data: {
        ...data,
        generatedMsg,
        createdBy: userId,
      },
    });

    res.status(201).json({
      success: true,
      data: { ...outreach, dailyCount: todayCount + 1, dailyLimit: AutomationConfig.linkedin.dailyOutreachLimit },
    });
  } catch (error) {
    logger.error('LinkedIn outreach creation failed', { error: String(error) });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create outreach' },
    });
  }
});

// GET /api/linkedin/outreach
router.get('/outreach', authenticate, async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    const where: Record<string, unknown> = {};
    if (status) where.status = status;

    const outreach = await prisma.mktLinkedInOutreach.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    // Daily stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayCount = await prisma.mktLinkedInOutreach.count({
      where: { createdAt: { gte: today } },
    });

    res.json({
      success: true,
      data: {
        outreach,
        stats: {
          todayCount,
          dailyLimit: AutomationConfig.linkedin.dailyOutreachLimit,
        },
      },
    });
  } catch (error) {
    logger.error('Failed to fetch outreach', { error: String(error) });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch outreach' },
    });
  }
});

// PATCH /api/linkedin/outreach/:id
router.patch('/outreach/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const parsed = statusUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message },
      });
    }

    const existing = await prisma.mktLinkedInOutreach.findUnique({
      where: { id: req.params.id },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Outreach not found' },
      });
    }

    const updateData: Record<string, unknown> = { status: parsed.data.status };
    if (parsed.data.notes) updateData.notes = parsed.data.notes;

    // Set timestamp fields based on status
    const now = new Date();
    switch (parsed.data.status) {
      case 'SENT': updateData.sentAt = now; break;
      case 'CONNECTED': updateData.connectedAt = now; break;
      case 'REPLIED': updateData.repliedAt = now; break;
      case 'MEETING': updateData.meetingAt = now; break;
      case 'CLOSED_WON':
      case 'CLOSED_LOST': updateData.closedAt = now; break;
    }

    const updated = await prisma.mktLinkedInOutreach.update({
      where: { id: req.params.id },
      data: updateData,
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    logger.error('Failed to update outreach', { error: String(error) });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update outreach' },
    });
  }
});

export default router;
