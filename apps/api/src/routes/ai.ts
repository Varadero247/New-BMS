import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '@new-bms/database';
import { authenticate, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

// Default analysis prompt
const DEFAULT_PROMPT = `Analyse this incident/non-conformance/environmental aspect against ISO 45001/14001/9001, highlight root causes, suggest actions and ISO clause gaps. Provide:
1. Root cause analysis
2. Suggested corrective actions with priorities
3. ISO clause compliance gaps
4. Key text highlights requiring attention

Format your response as JSON with the following structure:
{
  "rootCause": "string",
  "suggestedActions": [{"title": "string", "description": "string", "priority": "LOW|MEDIUM|HIGH|CRITICAL", "type": "CORRECTIVE|PREVENTIVE|IMPROVEMENT"}],
  "complianceGaps": [{"clause": "string", "gap": "string", "recommendation": "string"}],
  "highlights": [{"text": "string", "reason": "string", "type": "warning|critical|improvement"}],
  "summary": "string"
}`;

// Validation schemas
const settingsSchema = z.object({
  provider: z.enum(['OPENAI', 'ANTHROPIC', 'GROK']),
  apiKey: z.string().optional(),
  model: z.string().optional(),
  defaultPrompt: z.string().optional(),
});

const analyseSchema = z.object({
  sourceType: z.enum(['risk', 'incident', 'aspect', 'nonconformance']),
  sourceId: z.string(),
  selectedText: z.string().optional(),
  customPrompt: z.string().optional(),
});

// Helper function to call AI providers
async function callAIProvider(
  provider: string,
  apiKey: string,
  model: string | null,
  prompt: string,
  content: string
): Promise<{ content: string; tokensUsed?: number; model?: string }> {
  const fullPrompt = `${prompt}\n\nContent to analyze:\n${content}`;

  if (provider === 'OPENAI') {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model || 'gpt-4o',
        messages: [{ role: 'user', content: fullPrompt }],
        temperature: 0.7,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      content: data.choices[0].message.content,
      tokensUsed: data.usage?.total_tokens,
      model: data.model,
    };
  }

  if (provider === 'ANTHROPIC') {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: model || 'claude-3-sonnet-20240229',
        max_tokens: 4096,
        messages: [{ role: 'user', content: fullPrompt }],
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      content: data.content[0].text,
      tokensUsed: data.usage?.input_tokens + data.usage?.output_tokens,
      model: data.model,
    };
  }

  if (provider === 'GROK') {
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model || 'grok-beta',
        messages: [{ role: 'user', content: fullPrompt }],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`Grok API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      content: data.choices[0].message.content,
      tokensUsed: data.usage?.total_tokens,
      model: data.model,
    };
  }

  throw new Error(`Unsupported provider: ${provider}`);
}

// GET /api/ai/settings - Get AI settings
router.get('/settings', authenticate, requireRole(['ADMIN', 'MANAGER']), async (req, res, next) => {
  try {
    let settings = await prisma.aISettings.findFirst();

    if (!settings) {
      settings = await prisma.aISettings.create({
        data: {
          provider: 'OPENAI',
          defaultPrompt: DEFAULT_PROMPT,
        },
      });
    }

    // Mask API key
    const maskedSettings = {
      ...settings,
      apiKey: settings.apiKey ? '••••••••' + settings.apiKey.slice(-4) : null,
    };

    res.json({ success: true, data: maskedSettings });
  } catch (error) {
    next(error);
  }
});

// PUT /api/ai/settings - Update AI settings
router.put('/settings', authenticate, requireRole(['ADMIN']), validate(settingsSchema), async (req, res, next) => {
  try {
    let settings = await prisma.aISettings.findFirst();

    if (!settings) {
      settings = await prisma.aISettings.create({
        data: {
          ...req.body,
          defaultPrompt: req.body.defaultPrompt || DEFAULT_PROMPT,
        },
      });
    } else {
      // Only update API key if provided and not masked
      const updateData: any = { ...req.body };
      if (!req.body.apiKey || req.body.apiKey.startsWith('••••')) {
        delete updateData.apiKey;
      }

      settings = await prisma.aISettings.update({
        where: { id: settings.id },
        data: updateData,
      });
    }

    // Mask API key in response
    const maskedSettings = {
      ...settings,
      apiKey: settings.apiKey ? '••••••••' + settings.apiKey.slice(-4) : null,
    };

    res.json({ success: true, data: maskedSettings });
  } catch (error) {
    next(error);
  }
});

// POST /api/ai/analyse - Run AI analysis
router.post('/analyse', authenticate, validate(analyseSchema), async (req, res, next) => {
  try {
    const { sourceType, sourceId, selectedText, customPrompt } = req.body;

    // Get AI settings
    const settings = await prisma.aISettings.findFirst();
    if (!settings?.apiKey) {
      return res.status(400).json({
        success: false,
        error: { code: 'NO_API_KEY', message: 'AI API key not configured. Please configure in Settings.' },
      });
    }

    // Get source data
    let sourceData: any;
    let standardContext = '';

    if (sourceType === 'risk' || sourceType === 'aspect') {
      sourceData = await prisma.risk.findUnique({ where: { id: sourceId } });
      if (sourceData) {
        standardContext = `ISO Standard: ${sourceData.standard}`;
      }
    } else if (sourceType === 'incident' || sourceType === 'nonconformance') {
      sourceData = await prisma.incident.findUnique({
        where: { id: sourceId },
        include: {
          reporter: { select: { firstName: true, lastName: true } },
          actions: true,
        },
      });
      if (sourceData) {
        standardContext = `ISO Standard: ${sourceData.standard}`;
      }
    }

    if (!sourceData) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Source record not found' },
      });
    }

    // Prepare content for analysis
    const contentToAnalyze = selectedText || JSON.stringify(sourceData, null, 2);
    const prompt = customPrompt || settings.defaultPrompt || DEFAULT_PROMPT;
    const fullPrompt = `${standardContext}\n\n${prompt}`;

    // Create pending analysis record
    const analysis = await prisma.aIAnalysis.create({
      data: {
        userId: req.user!.id,
        sourceType,
        sourceId,
        sourceData: sourceData as any,
        prompt: fullPrompt,
        provider: settings.provider,
        model: settings.model,
        response: {},
        status: 'PENDING',
      },
    });

    try {
      // Call AI provider
      const aiResponse = await callAIProvider(
        settings.provider,
        settings.apiKey,
        settings.model,
        fullPrompt,
        contentToAnalyze
      );

      // Parse response
      let parsedResponse: any;
      try {
        parsedResponse = JSON.parse(aiResponse.content);
      } catch {
        // If not valid JSON, wrap in structure
        parsedResponse = {
          summary: aiResponse.content,
          rootCause: null,
          suggestedActions: [],
          complianceGaps: [],
          highlights: [],
        };
      }

      // Update analysis with response
      const updatedAnalysis = await prisma.aIAnalysis.update({
        where: { id: analysis.id },
        data: {
          response: {
            content: aiResponse.content,
            tokensUsed: aiResponse.tokensUsed,
            model: aiResponse.model,
          },
          suggestedRootCause: parsedResponse.rootCause,
          suggestedActions: parsedResponse.suggestedActions,
          complianceGaps: parsedResponse.complianceGaps,
          highlights: parsedResponse.highlights,
          status: 'COMPLETED',
        },
      });

      // Update token usage
      if (aiResponse.tokensUsed) {
        await prisma.aISettings.update({
          where: { id: settings.id },
          data: {
            totalTokensUsed: { increment: aiResponse.tokensUsed },
            lastUsedAt: new Date(),
          },
        });
      }

      res.json({ success: true, data: updatedAnalysis });
    } catch (aiError: any) {
      // Update analysis with error
      await prisma.aIAnalysis.update({
        where: { id: analysis.id },
        data: {
          response: { error: aiError.message },
          status: 'ERROR',
        },
      });

      throw aiError;
    }
  } catch (error) {
    next(error);
  }
});

// GET /api/ai/analyses - List AI analyses
router.get('/analyses', authenticate, async (req, res, next) => {
  try {
    const {
      sourceType,
      sourceId,
      status,
      page = '1',
      limit = '20',
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (sourceType) where.sourceType = sourceType;
    if (sourceId) where.sourceId = sourceId;
    if (status) where.status = status;

    const [analyses, total] = await Promise.all([
      prisma.aIAnalysis.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
      }),
      prisma.aIAnalysis.count({ where }),
    ]);

    res.json({
      success: true,
      data: analyses,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/ai/analyses/:id - Get single analysis
router.get('/analyses/:id', authenticate, async (req, res, next) => {
  try {
    const analysis = await prisma.aIAnalysis.findUnique({
      where: { id: req.params.id },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        actions: true,
      },
    });

    if (!analysis) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'AI analysis not found' },
      });
    }

    res.json({ success: true, data: analysis });
  } catch (error) {
    next(error);
  }
});

// POST /api/ai/analyses/:id/accept - Accept AI analysis suggestions
router.post('/analyses/:id/accept', authenticate, async (req, res, next) => {
  try {
    const { selectedActions, acceptAll } = req.body;

    const analysis = await prisma.aIAnalysis.findUnique({
      where: { id: req.params.id },
    });

    if (!analysis) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'AI analysis not found' },
      });
    }

    if (analysis.status !== 'COMPLETED') {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_STATUS', message: 'Analysis must be completed to accept' },
      });
    }

    // Get source standard
    let standard = 'ISO_45001';
    if (analysis.sourceType === 'risk' || analysis.sourceType === 'aspect') {
      const risk = await prisma.risk.findUnique({ where: { id: analysis.sourceId } });
      if (risk) standard = risk.standard;
    } else {
      const incident = await prisma.incident.findUnique({ where: { id: analysis.sourceId } });
      if (incident) standard = incident.standard;
    }

    // Create actions from suggestions
    const suggestedActions = analysis.suggestedActions as any[] || [];
    const actionsToCreate = acceptAll
      ? suggestedActions
      : suggestedActions.filter((_, i) => selectedActions?.includes(i));

    const createdActions = [];
    for (const suggestion of actionsToCreate) {
      const action = await prisma.action.create({
        data: {
          standard: standard as any,
          referenceNumber: `AI-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
          title: suggestion.title,
          description: suggestion.description,
          type: suggestion.type || 'CORRECTIVE',
          priority: suggestion.priority || 'MEDIUM',
          ownerId: req.user!.id,
          createdById: req.user!.id,
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          aiAnalysisId: analysis.id,
          ...(analysis.sourceType === 'incident' || analysis.sourceType === 'nonconformance'
            ? { incidentId: analysis.sourceId }
            : { riskId: analysis.sourceId }),
        },
      });
      createdActions.push(action);
    }

    // Update analysis status
    const updatedAnalysis = await prisma.aIAnalysis.update({
      where: { id: req.params.id },
      data: {
        status: acceptAll ? 'ACCEPTED' : 'PARTIALLY_ACCEPTED',
        acceptedAt: new Date(),
      },
    });

    res.json({
      success: true,
      data: {
        analysis: updatedAnalysis,
        createdActions,
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/ai/analyses/:id/reject - Reject AI analysis
router.post('/analyses/:id/reject', authenticate, async (req, res, next) => {
  try {
    const analysis = await prisma.aIAnalysis.update({
      where: { id: req.params.id },
      data: {
        status: 'REJECTED',
        rejectedAt: new Date(),
      },
    });

    res.json({ success: true, data: analysis });
  } catch (error) {
    next(error);
  }
});

export default router;
