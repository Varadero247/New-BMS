import { Router, Response } from 'express';
import type { Router as IRouter } from 'express';
import { prisma } from '../prisma';
import { authenticate, type AuthRequest } from '@ims/auth';
import { z } from 'zod';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('api-ai-analysis:compliance');
const router: IRouter = Router();
router.use(authenticate);

interface AIProviderResponse {
  content: string;
  tokensUsed: number;
}

async function getSettings() {
  return prisma.aISettings.findFirst({ where: { deletedAt: null } as any, orderBy: { createdAt: 'desc' } });
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

// POST /api/compliance/gap-analysis — Cross-standard gap detection
router.post('/gap-analysis', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      standards: z.array(z.string()).min(1).max(10),
      currentEvidence: z.array(z.object({
        clause: z.string(),
        evidence: z.string(),
        status: z.enum(['COMPLIANT', 'PARTIAL', 'NON_COMPLIANT', 'NOT_ASSESSED']).default('NOT_ASSESSED'),
      })),
      organisationContext: z.string().optional(),
    });

    const data = schema.parse(req.body);
    const settings = await getSettings();
    if (!settings?.apiKey) {
      return res.status(400).json({ success: false, error: { code: 'NO_AI_CONFIG', message: 'AI provider not configured' } });
    }

    const prompt = `You are an ISO compliance gap analysis expert covering all major ISO management system standards (9001, 14001, 45001, 27001, 22301, 31000, 42001, 37001, etc.).

Analyse the following organisation's evidence against the requested standards and identify gaps.

Standards to assess: ${data.standards.join(', ')}
Organisation context: ${data.organisationContext || 'Not specified'}

Current evidence:
${data.currentEvidence.map(e => `- Clause ${e.clause}: ${e.evidence} (Status: ${e.status})`).join('\n')}

Perform a comprehensive gap analysis. Respond with ONLY valid JSON:
{
  "overallComplianceScore": <0-100>,
  "standardScores": [
    {"standard": "...", "score": <0-100>, "totalClauses": <number>, "compliant": <number>, "partial": <number>, "gaps": <number>}
  ],
  "gaps": [
    {
      "standard": "...",
      "clause": "...",
      "clauseTitle": "...",
      "severity": "CRITICAL|MAJOR|MINOR|OBSERVATION",
      "currentState": "...",
      "requiredState": "...",
      "recommendation": "...",
      "estimatedEffort": "LOW|MEDIUM|HIGH",
      "evidence": "..."
    }
  ],
  "crossStandardSynergies": [
    {"standards": ["..."], "sharedRequirement": "...", "recommendation": "..."}
  ],
  "prioritizedActions": [
    {"action": "...", "priority": <1-10>, "impactedStandards": ["..."], "estimatedWeeks": <number>}
  ],
  "readinessForCertification": "NOT_READY|NEEDS_WORK|NEARLY_READY|READY"
}`;

    const aiResponse = await callProvider(settings.apiKey, settings.model || '', settings.provider, prompt);
    const result = parseJsonResponse(aiResponse.content);

    await prisma.aISettings.update({
      where: { id: settings.id },
      data: { totalTokensUsed: settings.totalTokensUsed + (aiResponse.tokensUsed || 0), lastUsedAt: new Date() },
    });

    res.json({ success: true, data: { type: 'GAP_ANALYSIS', result } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) } });
    }
    logger.error('Gap analysis failed', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'AI_ERROR', message: 'Gap analysis failed' } });
  }
});

// POST /api/compliance/predictive-risk — Predictive risk scoring
router.post('/predictive-risk', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      historicalIncidents: z.array(z.object({
        type: z.string().trim().min(1).max(100),
        severity: z.string(),
        date: z.string(),
        department: z.string().optional(),
        rootCause: z.string().optional(),
      })).min(1),
      currentRisks: z.array(z.object({
        title: z.string().trim().min(1).max(300),
        category: z.string().trim().min(1).max(100),
        currentScore: z.number().nonnegative(),
      })).optional(),
      timeframeMonths: z.number().min(1).max(24).default(6),
    });

    const data = schema.parse(req.body);
    const settings = await getSettings();
    if (!settings?.apiKey) {
      return res.status(400).json({ success: false, error: { code: 'NO_AI_CONFIG', message: 'AI provider not configured' } });
    }

    const prompt = `You are a predictive risk analytics expert using historical incident data to forecast future risks.

Historical incidents (${data.historicalIncidents.length} records):
${data.historicalIncidents.slice(0, 50).map(i => `- [${i.date}] ${i.type} | Severity: ${i.severity} | Dept: ${i.department || 'N/A'} | Root Cause: ${i.rootCause || 'N/A'}`).join('\n')}

${data.currentRisks ? `Current risk register (${data.currentRisks.length} risks):\n${data.currentRisks.slice(0, 20).map(r => `- ${r.title} (${r.category}) Score: ${r.currentScore}`).join('\n')}` : ''}

Forecast period: ${data.timeframeMonths} months

Provide predictive risk analysis. Respond with ONLY valid JSON:
{
  "predictions": [
    {
      "riskArea": "...",
      "predictedProbability": <0-100>,
      "predictedSeverity": "LOW|MEDIUM|HIGH|CRITICAL",
      "predictedScore": <0-100>,
      "trend": "INCREASING|STABLE|DECREASING",
      "confidence": <0-100>,
      "rationale": "...",
      "earlyWarningIndicators": ["..."]
    }
  ],
  "trendAnalysis": {
    "overallTrend": "IMPROVING|STABLE|DETERIORATING",
    "incidentFrequencyTrend": "...",
    "severityTrend": "...",
    "topRecurringCategories": ["..."]
  },
  "recommendations": [
    {"action": "...", "priority": "CRITICAL|HIGH|MEDIUM|LOW", "expectedImpact": "...", "targetArea": "..."}
  ],
  "seasonalPatterns": [{"pattern": "...", "months": ["..."], "recommendation": "..."}],
  "overallRiskOutlook": "IMPROVING|STABLE|CONCERNING|CRITICAL"
}`;

    const aiResponse = await callProvider(settings.apiKey, settings.model || '', settings.provider, prompt);
    const result = parseJsonResponse(aiResponse.content);

    await prisma.aISettings.update({
      where: { id: settings.id },
      data: { totalTokensUsed: settings.totalTokensUsed + (aiResponse.tokensUsed || 0), lastUsedAt: new Date() },
    });

    res.json({ success: true, data: { type: 'PREDICTIVE_RISK', result } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) } });
    }
    logger.error('Predictive risk analysis failed', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'AI_ERROR', message: 'Predictive risk analysis failed' } });
  }
});

// POST /api/compliance/search — Semantic search across modules
router.post('/search', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      query: z.string().min(3).max(500),
      modules: z.array(z.string()).optional(),
      limit: z.number().min(1).max(50).default(10),
    });

    const data = schema.parse(req.body);
    const settings = await getSettings();
    if (!settings?.apiKey) {
      return res.status(400).json({ success: false, error: { code: 'NO_AI_CONFIG', message: 'AI provider not configured' } });
    }

    const prompt = `You are an IMS platform search assistant. A user has searched for: "${data.query}"
${data.modules ? `Restricted to modules: ${data.modules.join(', ')}` : 'Across all modules'}

Based on this natural language query, generate structured search parameters and suggest which IMS modules, document types, and data categories would be most relevant.

Available modules: Health & Safety, Environment, Quality, HR, Payroll, Finance, CRM, InfoSec, ESG, CMMS, Food Safety, Energy, Analytics, Field Service, Risk Management, Chemicals, Emergency, Training, Suppliers, Documents, Contracts, Audits, Incidents, Complaints, Automotive, Medical, Aerospace.

Respond with ONLY valid JSON:
{
  "interpretation": "...",
  "searchTerms": ["..."],
  "relevantModules": [
    {"module": "...", "relevanceScore": <0-100>, "suggestedEndpoint": "...", "filterParams": {}}
  ],
  "suggestedFilters": {"dateRange": "...", "status": "...", "severity": "...", "category": "..."},
  "relatedSearches": ["..."],
  "isoClausesRelated": ["..."]
}`;

    const aiResponse = await callProvider(settings.apiKey, settings.model || '', settings.provider, prompt);
    const result = parseJsonResponse(aiResponse.content);

    await prisma.aISettings.update({
      where: { id: settings.id },
      data: { totalTokensUsed: settings.totalTokensUsed + (aiResponse.tokensUsed || 0), lastUsedAt: new Date() },
    });

    res.json({ success: true, data: { type: 'SEMANTIC_SEARCH', query: data.query, result } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) } });
    }
    logger.error('Semantic search failed', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'AI_ERROR', message: 'Semantic search failed' } });
  }
});

export default router;
