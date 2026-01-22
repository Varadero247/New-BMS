import { Router, Response } from 'express';
import type { Router as IRouter } from 'express';
import { prisma } from '@ims/database';
import { authenticate, type AuthRequest } from '@ims/auth';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

const router: IRouter = Router();

router.use(authenticate);

const DEFAULT_AI_PROMPT = `Analyse this incident/non-conformance/environmental aspect against ISO 45001/14001/9001, highlight root causes, suggest actions and ISO clause gaps. Provide:
1. Root cause analysis
2. Suggested corrective actions with priorities
3. ISO clause compliance gaps
4. Key text highlights requiring attention`;

// POST /api/analyse - Perform AI analysis
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      sourceType: z.enum(['risk', 'incident', 'aspect', 'nonconformance']),
      sourceId: z.string(),
      selectedText: z.string().optional(),
      customPrompt: z.string().optional(),
    });

    const data = schema.parse(req.body);

    // Get AI settings
    const settings = await prisma.aISettings.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    if (!settings?.apiKey) {
      return res.status(400).json({
        success: false,
        error: { code: 'NO_AI_CONFIG', message: 'AI provider not configured. Please set up API key in settings.' },
      });
    }

    // Get source data
    let sourceData: any = null;

    if (data.sourceType === 'risk' || data.sourceType === 'aspect') {
      sourceData = await prisma.risk.findUnique({ where: { id: data.sourceId } });
    } else {
      sourceData = await prisma.incident.findUnique({ where: { id: data.sourceId } });
    }

    if (!sourceData) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Source data not found' },
      });
    }

    // Build prompt
    const prompt = data.customPrompt || settings.defaultPrompt || DEFAULT_AI_PROMPT;
    const fullPrompt = `${prompt}\n\nData to analyse:\n${JSON.stringify(sourceData, null, 2)}${
      data.selectedText ? `\n\nUser-highlighted text: "${data.selectedText}"` : ''
    }`;

    // Call AI provider
    let aiResponse: any = null;

    try {
      if (settings.provider === 'OPENAI') {
        aiResponse = await callOpenAI(settings.apiKey, settings.model || 'gpt-4', fullPrompt);
      } else if (settings.provider === 'ANTHROPIC') {
        aiResponse = await callAnthropic(settings.apiKey, settings.model || 'claude-3-sonnet-20240229', fullPrompt);
      } else if (settings.provider === 'GROK') {
        aiResponse = await callGrok(settings.apiKey, fullPrompt);
      }
    } catch (aiError: any) {
      return res.status(502).json({
        success: false,
        error: { code: 'AI_ERROR', message: `AI provider error: ${aiError.message}` },
      });
    }

    // Parse AI response and extract structured data
    const parsedResponse = parseAIResponse(aiResponse);

    // Save analysis
    const analysis = await prisma.aIAnalysis.create({
      data: {
        id: uuidv4(),
        userId: req.user!.id,
        sourceType: data.sourceType,
        sourceId: data.sourceId,
        sourceData: sourceData as any,
        prompt: fullPrompt,
        provider: settings.provider,
        model: settings.model,
        response: aiResponse as any,
        suggestedRootCause: parsedResponse.rootCause,
        suggestedActions: parsedResponse.actions as any,
        complianceGaps: parsedResponse.gaps as any,
        highlights: parsedResponse.highlights as any,
        status: 'COMPLETED',
      },
    });

    // Update token usage
    await prisma.aISettings.update({
      where: { id: settings.id },
      data: {
        totalTokensUsed: settings.totalTokensUsed + (aiResponse.tokensUsed || 0),
        lastUsedAt: new Date(),
      },
    });

    res.status(201).json({ success: true, data: analysis });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors },
      });
    }
    console.error('AI analysis error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to perform AI analysis' },
    });
  }
});

// Helper functions for AI providers
async function callOpenAI(apiKey: string, model: string, prompt: string) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'system',
          content: 'You are an expert ISO management system consultant specializing in ISO 45001, ISO 14001, and ISO 9001. Provide structured analysis with clear root causes, corrective actions, and compliance gaps.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'OpenAI API error');
  }

  const data = await response.json();
  return {
    content: data.choices[0].message.content,
    tokensUsed: data.usage?.total_tokens || 0,
    model: data.model,
  };
}

async function callAnthropic(apiKey: string, model: string, prompt: string) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 2000,
      system: 'You are an expert ISO management system consultant specializing in ISO 45001, ISO 14001, and ISO 9001. Provide structured analysis with clear root causes, corrective actions, and compliance gaps.',
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Anthropic API error');
  }

  const data = await response.json();
  return {
    content: data.content[0].text,
    tokensUsed: data.usage?.input_tokens + data.usage?.output_tokens || 0,
    model: data.model,
  };
}

async function callGrok(apiKey: string, prompt: string) {
  // Grok API (X.AI) - placeholder implementation
  const response = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'grok-beta',
      messages: [
        {
          role: 'system',
          content: 'You are an expert ISO management system consultant.',
        },
        { role: 'user', content: prompt },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Grok API error');
  }

  const data = await response.json();
  return {
    content: data.choices[0].message.content,
    tokensUsed: data.usage?.total_tokens || 0,
    model: 'grok-beta',
  };
}

function parseAIResponse(response: any): {
  rootCause: string;
  actions: any[];
  gaps: any[];
  highlights: any[];
} {
  // Basic parsing - in production this would be more sophisticated
  const content = response.content || '';

  // Extract root cause (look for patterns)
  let rootCause = '';
  const rootCauseMatch = content.match(/root cause[:\s]*([^\n]+)/i);
  if (rootCauseMatch) {
    rootCause = rootCauseMatch[1].trim();
  }

  // Extract actions (look for numbered lists or action keywords)
  const actions: any[] = [];
  const actionMatches = content.matchAll(/(?:action|recommendation)[:\s]*([^\n]+)/gi);
  for (const match of actionMatches) {
    actions.push({
      title: match[1].trim().substring(0, 100),
      description: match[1].trim(),
      priority: 'MEDIUM',
      type: 'CORRECTIVE',
    });
  }

  // Extract compliance gaps
  const gaps: any[] = [];
  const gapMatches = content.matchAll(/(?:ISO|clause)\s*(\d+\.?\d*)[:\s]*([^\n]+)/gi);
  for (const match of gapMatches) {
    gaps.push({
      clause: match[1],
      gap: match[2].trim(),
      recommendation: '',
    });
  }

  // Extract highlights
  const highlights: any[] = [];
  const warningMatches = content.matchAll(/(?:warning|critical|important)[:\s]*([^\n]+)/gi);
  for (const match of warningMatches) {
    highlights.push({
      text: match[1].trim(),
      reason: 'Identified by AI analysis',
      type: 'warning',
    });
  }

  return { rootCause, actions, gaps, highlights };
}

export default router;
