import { Router, Response } from 'express';
import type { Router as IRouter } from 'express';
import { prisma } from '../prisma';
import { authenticate, type AuthRequest } from '@ims/auth';
import { z } from 'zod';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('api-ai-analysis:documents');
const router: IRouter = Router();
router.use(authenticate);

interface AIProviderResponse {
  content: string;
  tokensUsed: number;
}

async function getSettings() {
  const settings = await prisma.aISettings.findFirst({
    where: { deletedAt: null } as any,
    orderBy: { createdAt: 'desc' },
  });
  return settings;
}

async function callProvider(apiKey: string, model: string, provider: string, prompt: string): Promise<AIProviderResponse> {
  if (provider === 'OPENAI') {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model: model || 'gpt-4', messages: [{ role: 'user', content: prompt }], max_tokens: 4096 }),
    });
    const json = await res.json() as any;
    return { content: json.choices?.[0]?.message?.content || '', tokensUsed: json.usage?.total_tokens || 0 };
  } else if (provider === 'ANTHROPIC') {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: model || 'claude-3-sonnet-20240229', max_tokens: 4096, messages: [{ role: 'user', content: prompt }] }),
    });
    const json = await res.json() as any;
    return { content: json.content?.[0]?.text || '', tokensUsed: (json.usage?.input_tokens || 0) + (json.usage?.output_tokens || 0) };
  }
  throw new Error(`Unsupported provider: ${provider}`);
}

function parseJsonResponse(content: string): unknown {
  const jsonMatch = content.match(/\[[\s\S]*\]/) || content.match(/\{[\s\S]*\}/);
  return jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content);
}

// POST /api/documents/analyze — Analyze document content
router.post('/analyze', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      content: z.string().min(1).max(50000),
      analysisType: z.enum(['SUMMARIZE', 'EXTRACT_KEY_TERMS', 'CLASSIFY', 'FULL_ANALYSIS']).default('FULL_ANALYSIS'),
      context: z.record(z.unknown()).optional(),
    });

    const data = schema.parse(req.body);
    const settings = await getSettings();
    if (!settings?.apiKey) {
      return res.status(400).json({ success: false, error: { code: 'NO_AI_CONFIG', message: 'AI provider not configured' } });
    }

    let prompt = '';
    const contentSnippet = data.content.substring(0, 10000); // Limit context to 10k chars

    if (data.analysisType === 'SUMMARIZE') {
      prompt = `Summarize the following document in 3-5 key bullet points. Identify the main topic, key requirements, and any action items.\n\nDocument:\n${contentSnippet}\n\nRespond with ONLY valid JSON:\n{"summary": "...", "keyPoints": ["..."], "mainTopic": "...", "actionItems": ["..."]}`;
    } else if (data.analysisType === 'EXTRACT_KEY_TERMS') {
      prompt = `Extract key terms, definitions, and important phrases from the following document. Categorize them by type (technical term, regulation, standard, acronym, person, organization, date).\n\nDocument:\n${contentSnippet}\n\nRespond with ONLY valid JSON:\n{"terms": [{"term": "...", "type": "...", "definition": "...", "frequency": <number>}], "totalTermsFound": <number>}`;
    } else if (data.analysisType === 'CLASSIFY') {
      prompt = `Classify this document by ISO standard relevance, document type, department, and compliance area. Rate confidence 0-100.\n\nDocument:\n${contentSnippet}\n\nRespond with ONLY valid JSON:\n{"documentType": "...", "isoStandards": [{"standard": "...", "relevance": <0-100>}], "departments": ["..."], "complianceAreas": ["..."], "confidenceScore": <0-100>, "suggestedTags": ["..."]}`;
    } else {
      prompt = `You are an IMS document analysis expert. Perform a comprehensive analysis of this document covering: summary, key terms extraction, classification, compliance relevance, and recommendations.\n\nDocument:\n${contentSnippet}\n\nRespond with ONLY valid JSON:\n{"summary": "...", "keyPoints": ["..."], "keyTerms": [{"term": "...", "definition": "..."}], "classification": {"documentType": "...", "departments": ["..."], "isoStandards": [{"standard": "...", "relevance": <0-100>}]}, "complianceInsights": ["..."], "recommendations": ["..."], "riskFlags": ["..."]}`;
    }

    const aiResponse = await callProvider(settings.apiKey, settings.model || '', settings.provider, prompt);
    const result = parseJsonResponse(aiResponse.content);

    await prisma.aISettings.update({
      where: { id: settings.id },
      data: { totalTokensUsed: settings.totalTokensUsed + (aiResponse.tokensUsed || 0), lastUsedAt: new Date() },
    });

    res.json({ success: true, data: { analysisType: data.analysisType, result } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) } });
    }
    logger.error('Document analysis failed', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'AI_ERROR', message: 'Document analysis failed' } });
  }
});

export default router;
