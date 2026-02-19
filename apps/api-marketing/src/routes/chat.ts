import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';
import { prisma } from '../prisma';

const logger = createLogger('api-marketing:chat');
const router = Router();
router.param('id', validateIdParam());

const SYSTEM_PROMPT = `You are Aria, a friendly sales assistant for Nexara IMS — the world's most comprehensive Integrated Management System platform covering 12 ISO standards with AI-native features. Your job is to qualify website visitors and capture their contact details.

Follow this exact conversation flow:
1. Greet warmly, ask what brings them to Nexara today
2. Ask which ISO standards they currently manage (9001, 14001, 45001, 27001, 13485, AS9100D, IATF 16949, 42001, 37001, 22000, 50001, 21502 — or say if none)
3. Ask their company size (number of employees)
4. Ask if they are the decision-maker for software purchases
5. If decision-maker: ask for their name, email, and preferred time for a demo (morning/afternoon, which days)
6. If not decision-maker: ask who is, and offer to send them information to forward
7. Once you have name + email: confirm you will send them a personalised demo link and say a team member will confirm within 24 hours
8. Always be warm, concise (max 2 sentences per response), and never pushy.
9. If asked about pricing, give the three tiers: Starter £39/user/month, Professional £29/user/month, Enterprise £19/user/month — all modules included.
10. If asked a technical question you cannot answer, say you'll make sure their question is covered in the demo.

When you have captured name + email, include this exact JSON in your response (invisible to user, parsed by system):
CAPTURE:{"name":"[name]","email":"[email]","isoStandards":"[list]","companySize":"[size]","isDecisionMaker":[true/false],"preferredDemoTime":"[time]"}`;

const chatStartSchema = z.object({
  visitorId: z.string().trim().optional(),
});

const chatMessageSchema = z.object({
  sessionId: z.string().trim(),
  message: z.string().trim().min(1).max(2000),
});

// POST /api/chat/start
router.post('/start', async (req: Request, res: Response) => {
  try {
    const parsed = chatStartSchema.safeParse(req.body);
    const session = await prisma.mktChatSession.create({
      data: {
        visitorId: parsed.success ? parsed.data.visitorId : undefined,
        messages: JSON.stringify([]),
      },
    });

    // Generate initial greeting
    const greeting = "Hi there! I'm Aria from Nexara. What brings you to our platform today?";
    const messages = [{ role: 'assistant', content: greeting }];

    await prisma.mktChatSession.update({
      where: { id: session.id },
      data: { messages: JSON.stringify(messages) },
    });

    res.json({
      success: true,
      data: {
        sessionId: session.id,
        message: greeting,
      },
    });
  } catch (error) {
    logger.error('Chat start failed', { error: String(error) });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to start chat' },
    });
  }
});

// POST /api/chat/message
router.post('/message', async (req: Request, res: Response) => {
  try {
    const parsed = chatMessageSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message },
      });
    }

    const { sessionId, message } = parsed.data;

    const session = await prisma.mktChatSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Chat session not found' },
      });
    }

    const history = JSON.parse(session.messages as string) as Array<{
      role: string;
      content: string;
    }>;
    history.push({ role: 'user', content: message });

    // Call Anthropic API
    let assistantMessage = 'Thank you for your interest! Let me help you find the right solution.';
    try {
      const apiKey = process.env.ANTHROPIC_API_KEY;
      if (apiKey) {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 300,
            system: SYSTEM_PROMPT,
            messages: history.map((m) => ({
              role: m.role === 'assistant' ? 'assistant' : 'user',
              content: m.content,
            })),
          }),
        });

        if (response.ok) {
          const data = await response.json() as { content?: Array<{ text?: string }> };
          assistantMessage = data.content?.[0]?.text || assistantMessage;
        }
      }
    } catch (aiErr) {
      logger.error('Anthropic API call failed', { error: String(aiErr) });
    }

    // Check for CAPTURE JSON in response
    let capturedData = null;
    const captureMatch = assistantMessage.match(/CAPTURE:(\{[^}]+\})/);
    if (captureMatch) {
      try {
        capturedData = JSON.parse(captureMatch[1]);
        // Strip CAPTURE from displayed message
        assistantMessage = assistantMessage.replace(/CAPTURE:\{[^}]+\}/, '').trim();

        // Save lead
        await prisma.mktLead
          .create({
            data: {
              email: capturedData.email,
              name: capturedData.name,
              source: 'CHATBOT',
              isoCount: capturedData.isoStandards
                ? capturedData.isoStandards.split(',').length
                : null,
              employeeCount: capturedData.companySize || null,
            },
          })
          .catch((err: unknown) =>
            logger.error('Failed to save chatbot lead', { error: String(err) })
          );
      } catch {
        logger.warn('Failed to parse CAPTURE JSON');
      }
    }

    history.push({ role: 'assistant', content: assistantMessage });

    await prisma.mktChatSession.update({
      where: { id: sessionId },
      data: {
        messages: JSON.stringify(history),
        ...(capturedData ? { captured: true, capturedData: capturedData as any } : {}),
      },
    });

    res.json({
      success: true,
      data: {
        message: assistantMessage,
        captured: !!capturedData,
      },
    });
  } catch (error) {
    logger.error('Chat message failed', { error: String(error) });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to process message' },
    });
  }
});

// GET /api/chat/session/:id — returns only message history (no captured PII)
router.get('/session/:id', async (req: Request, res: Response) => {
  try {
    const session = await prisma.mktChatSession.findUnique({
      where: { id: req.params.id },
      select: { id: true, messages: true, createdAt: true },
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Session not found' },
      });
    }

    res.json({
      success: true,
      data: {
        id: session.id,
        messages: JSON.parse(session.messages as string),
        createdAt: session.createdAt,
      },
    });
  } catch (error) {
    logger.error('Failed to fetch session', { error: String(error) });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch session' },
    });
  }
});

export default router;
