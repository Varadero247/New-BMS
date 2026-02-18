import { Router, Response } from 'express';
import type { Router as IRouter } from 'express';
import { prisma, Prisma } from '../prisma';
import { authenticate, type AuthRequest } from '@ims/auth';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { createLogger } from '@ims/monitoring';
import { createCircuitBreaker } from '@ims/resilience';
import { checkOwnership, scopeToUser } from '@ims/service-auth';

interface AIProviderResponse {
  content: string;
  tokensUsed: number;
  model: string;
}

interface SuggestedAction {
  title: string;
  description: string;
  priority: string;
  type: string;
}

interface ComplianceGap {
  clause: string;
  gap: string;
  recommendation: string;
}

interface AIHighlight {
  text: string;
  reason: string;
  type: string;
}

interface ParsedAIResponse {
  rootCause: string;
  actions: SuggestedAction[];
  gaps: ComplianceGap[];
  highlights: AIHighlight[];
}

const logger = createLogger('api-ai-analysis');

// Circuit breakers for AI providers
const openAIBreaker = createCircuitBreaker(
  async (apiKey: string, model: string, prompt: string) => callOpenAIImpl(apiKey, model, prompt),
  { timeout: 30000, errorThresholdPercentage: 50, resetTimeout: 60000, name: 'openai' },
  {
    onOpen: (name) => logger.warn(`Circuit breaker ${name} opened`),
    onClose: (name) => logger.info(`Circuit breaker ${name} closed`),
    onHalfOpen: (name) => logger.info(`Circuit breaker ${name} half-open`),
  }
);

const anthropicBreaker = createCircuitBreaker(
  async (apiKey: string, model: string, prompt: string) => callAnthropicImpl(apiKey, model, prompt),
  { timeout: 30000, errorThresholdPercentage: 50, resetTimeout: 60000, name: 'anthropic' },
  {
    onOpen: (name) => logger.warn(`Circuit breaker ${name} opened`),
    onClose: (name) => logger.info(`Circuit breaker ${name} closed`),
  }
);

const grokBreaker = createCircuitBreaker(
  async (apiKey: string, prompt: string) => callGrokImpl(apiKey, prompt),
  { timeout: 30000, errorThresholdPercentage: 50, resetTimeout: 60000, name: 'grok' },
  {
    onOpen: (name) => logger.warn(`Circuit breaker ${name} opened`),
    onClose: (name) => logger.info(`Circuit breaker ${name} closed`),
  }
);

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
      where: { deletedAt: null } as any,
      orderBy: { createdAt: 'desc' },
    });

    if (!settings?.apiKey) {
      return res.status(400).json({
        success: false,
        error: { code: 'NO_AI_CONFIG', message: 'AI provider not configured. Please set up API key in settings.' },
      });
    }

    // Get source data
    let sourceData: Record<string, unknown> | null = null;

    if (data.sourceType === 'risk' || data.sourceType === 'aspect') {
      sourceData = await (prisma as any).risk.findUnique({ where: { id: data.sourceId } });
    } else {
      sourceData = await (prisma as any).incident.findUnique({ where: { id: data.sourceId } });
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
    let aiResponse: AIProviderResponse | null = null;

    try {
      if (settings.provider === 'OPENAI') {
        aiResponse = await openAIBreaker.fire(settings.apiKey, settings.model || 'gpt-4', fullPrompt);
      } else if (settings.provider === 'ANTHROPIC') {
        aiResponse = await anthropicBreaker.fire(settings.apiKey, settings.model || 'claude-3-sonnet-20240229', fullPrompt);
      } else if (settings.provider === 'GROK') {
        aiResponse = await grokBreaker.fire(settings.apiKey, fullPrompt);
      }
    } catch (aiError: unknown) {
      const errorMessage = aiError instanceof Error ? aiError.message : 'Unknown AI error';
      logger.error('AI provider error', { error: errorMessage, provider: settings.provider });
      return res.status(502).json({
        success: false,
        error: { code: 'AI_ERROR', message: 'AI analysis failed. Please try again later.' },
      });
    }

    // Parse AI response and extract structured data
    const parsedResponse = parseAIResponse(aiResponse!);

    // Save analysis
    const analysis = await prisma.aIAnalysis.create({
      data: {
        id: uuidv4(),
        userId: req.user!.id,
        sourceType: data.sourceType,
        sourceId: data.sourceId,
        sourceData: sourceData as Prisma.InputJsonValue,
        prompt: fullPrompt,
        provider: settings.provider,
        model: settings.model,
        response: aiResponse as unknown as Prisma.InputJsonValue,
        suggestedRootCause: parsedResponse.rootCause,
        suggestedActions: parsedResponse.actions as unknown as Prisma.InputJsonValue,
        complianceGaps: parsedResponse.gaps as unknown as Prisma.InputJsonValue,
        highlights: parsedResponse.highlights as unknown as Prisma.InputJsonValue,
        status: 'COMPLETED',
      },
    });

    // Update token usage
    await prisma.aISettings.update({
      where: { id: settings.id },
      data: {
        totalTokensUsed: settings.totalTokensUsed + (aiResponse!.tokensUsed || 0),
        lastUsedAt: new Date(),
      },
    });

    res.status(201).json({ success: true, data: analysis });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fields = error.errors.map(e => e.path.join('.'));
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields },
      });
    }
    logger.error('AI analysis error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to perform AI analysis' },
    });
  }
});

// Helper functions for AI providers
async function callOpenAIImpl(apiKey: string, model: string, prompt: string): Promise<AIProviderResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);
  try {
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
    signal: controller.signal,
  });

    if (!response.ok) {
      let errorMessage = 'OpenAI API error';
      try {
        const errBody: any = await response.json();
        errorMessage = errBody.error?.message || errorMessage;
      } catch { /* non-JSON error response */ }
      throw new Error(errorMessage);
    }

    let data: any;
    try {
      data = await response.json();
    } catch {
      throw new Error('Invalid response from OpenAI');
    }
    const choices = data.choices as Array<{ message: { content: string } }>;
    const usage = data.usage as { total_tokens?: number } | undefined;
    return {
      content: choices[0].message.content,
      tokensUsed: usage?.total_tokens || 0,
      model: data.model as string,
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

async function callAnthropicImpl(apiKey: string, model: string, prompt: string): Promise<AIProviderResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);
  try {
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
    signal: controller.signal,
  });

    if (!response.ok) {
      let errorMessage = 'Anthropic API error';
      try {
        const errBody: any = await response.json();
        errorMessage = errBody.error?.message || errorMessage;
      } catch { /* non-JSON error response */ }
      throw new Error(errorMessage);
    }

    let data: any;
    try {
      data = await response.json();
    } catch {
      throw new Error('Invalid response from Anthropic');
    }
    const content = data.content as Array<{ text: string }>;
    const usage = data.usage as { input_tokens?: number; output_tokens?: number } | undefined;
    return {
      content: content[0].text,
      tokensUsed: (usage?.input_tokens || 0) + (usage?.output_tokens || 0),
      model: data.model as string,
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

async function callGrokImpl(apiKey: string, prompt: string): Promise<AIProviderResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);
  try {
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
    signal: controller.signal,
  });

    if (!response.ok) {
      let errorMessage = 'Grok API error';
      try {
        const errBody: any = await response.json();
        errorMessage = errBody.error?.message || errorMessage;
      } catch { /* non-JSON error response */ }
      throw new Error(errorMessage);
    }

    let data: any;
    try {
      data = await response.json();
    } catch {
      throw new Error('Invalid response from Grok');
    }
    const choices = data.choices as Array<{ message: { content: string } }>;
    const usage = data.usage as { total_tokens?: number } | undefined;
    return {
      content: choices[0].message.content,
      tokensUsed: usage?.total_tokens || 0,
      model: 'grok-beta',
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

function parseAIResponse(response: AIProviderResponse): ParsedAIResponse {
  // Basic parsing - in production this would be more sophisticated
  const content = response.content || '';

  // Extract root cause (look for patterns)
  let rootCause = '';
  const rootCauseMatch = content.match(/root cause[:\s]*([^\n]+)/i);
  if (rootCauseMatch) {
    rootCause = rootCauseMatch[1].trim();
  }

  // Extract actions (look for numbered lists or action keywords)
  const actions: SuggestedAction[] = [];
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
  const gaps: ComplianceGap[] = [];
  const gapMatches = content.matchAll(/(?:ISO|clause)\s*(\d+\.?\d*)[:\s]*([^\n]+)/gi);
  for (const match of gapMatches) {
    gaps.push({
      clause: match[1],
      gap: match[2].trim(),
      recommendation: '',
    });
  }

  // Extract highlights
  const highlights: AIHighlight[] = [];
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
