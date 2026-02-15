import { prisma } from '../prisma';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('ai-variance');

interface SnapshotData {
  id: string;
  month: string;
  monthNumber: number;
  mrr: any;
  arr: any;
  customers: number;
  newCustomers: number;
  churnedCustomers: number;
  mrrGrowthPct: any;
  revenueChurnPct: any;
  pipelineValue: any;
  wonDeals: number;
  winRate: any;
  newLeads: number;
  activeTrials: number;
  trialConversionPct: any;
  avgHealthScore: any;
}

interface PlanTargetData {
  plannedMrr: any;
  plannedCustomers: number;
  plannedNewCustomers: number;
  plannedChurnPct: any;
  plannedArpu: any;
}

interface AIAnalysisResult {
  summary: string;
  alerts: string[];
  recommendations: { metric: string; current: number; suggested: number; rationale: string }[];
  trajectory: 'BEHIND' | 'ON_TRACK' | 'AHEAD';
}

export function buildVariancePrompt(snapshot: SnapshotData, planTarget: PlanTargetData): string {
  const mrrVariance = Number(snapshot.mrr) - Number(planTarget.plannedMrr);
  const mrrVariancePct = Number(planTarget.plannedMrr) > 0
    ? ((mrrVariance / Number(planTarget.plannedMrr)) * 100).toFixed(1)
    : '0.0';

  const custVariance = snapshot.customers - planTarget.plannedCustomers;

  return `You are a SaaS metrics analyst for Nexara, an ISO compliance management platform.

Analyse the following Month ${snapshot.monthNumber} performance data and provide a JSON response.

## Actual Performance
- MRR: £${Number(snapshot.mrr).toLocaleString()}
- ARR: £${Number(snapshot.arr).toLocaleString()}
- Customers: ${snapshot.customers}
- New customers: ${snapshot.newCustomers}
- Churned customers: ${snapshot.churnedCustomers}
- MRR growth: ${Number(snapshot.mrrGrowthPct).toFixed(1)}%
- Revenue churn: ${Number(snapshot.revenueChurnPct).toFixed(1)}%
- Pipeline value: £${Number(snapshot.pipelineValue).toLocaleString()}
- Won deals: ${snapshot.wonDeals}
- Win rate: ${Number(snapshot.winRate).toFixed(1)}%
- New leads: ${snapshot.newLeads}
- Active trials: ${snapshot.activeTrials}
- Trial conversion: ${Number(snapshot.trialConversionPct).toFixed(1)}%
- Avg health score: ${Number(snapshot.avgHealthScore).toFixed(0)}

## Dual Loan Status
- Director's Loan (£320K/8%/36mo, starts M3): payment £${Number((snapshot as any).founderDirLoanPayment || 0).toFixed(2)}, balance £${Number((snapshot as any).founderDirLoanBalance || 0).toFixed(2)}
- Starter Loan (£30K/8%/24mo, starts M2): payment £${Number((snapshot as any).founderStarterLoanPayment || 0).toFixed(2)}, balance £${Number((snapshot as any).founderStarterLoanBalance || 0).toFixed(2)}

## Plan Targets (Month ${snapshot.monthNumber})
- Planned MRR: £${Number(planTarget.plannedMrr).toLocaleString()}
- Planned customers: ${planTarget.plannedCustomers}
- Planned new customers: ${planTarget.plannedNewCustomers}
- Planned churn: ${Number(planTarget.plannedChurnPct).toFixed(1)}%
- Planned ARPU: £${Number(planTarget.plannedArpu).toFixed(0)}

## Variance
- MRR variance: £${mrrVariance.toLocaleString()} (${mrrVariancePct}%)
- Customer variance: ${custVariance}

Respond with ONLY valid JSON in this exact format:
{
  "summary": "3 sentence executive summary of the month's performance",
  "alerts": ["red flag 1 with specific action", "red flag 2..."],
  "recommendations": [
    { "metric": "MRR", "current": <current_value>, "suggested": <suggested_target>, "rationale": "why" }
  ],
  "trajectory": "BEHIND" | "ON_TRACK" | "AHEAD"
}

Rules:
- trajectory is BEHIND if MRR is >15% below plan, AHEAD if >15% above, ON_TRACK otherwise
- alerts should be specific and actionable (max 5)
- recommendations should suggest revised 3-month targets for key metrics
- summary should mention the most important variance and its likely cause`;
}

export async function runVarianceAnalysis(snapshot: SnapshotData, planTarget: PlanTargetData): Promise<AIAnalysisResult | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    logger.warn('ANTHROPIC_API_KEY not set, skipping AI variance analysis');
    return null;
  }

  const prompt = buildVariancePrompt(snapshot, planTarget);

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status} ${response.statusText}`);
    }

    const data: any = await response.json();
    const text: string = data.content?.[0]?.text || '';
    const result = parseAIResponse(text);

    // Store results on snapshot
    await prisma.monthlySnapshot.update({
      where: { id: snapshot.id },
      data: {
        aiSummary: result.summary,
        aiAlerts: result.alerts,
        aiRecommendations: result.recommendations,
        trajectory: result.trajectory,
      },
    });

    logger.info('AI variance analysis completed', { snapshotId: snapshot.id, trajectory: result.trajectory });
    return result;
  } catch (err) {
    logger.error('AI variance analysis failed', { error: String(err) });
    throw err;
  }
}

export function parseAIResponse(text: string): AIAnalysisResult {
  // Extract JSON from potential markdown code blocks
  let jsonStr = text.trim();
  const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1].trim();
  }

  try {
    const parsed = JSON.parse(jsonStr);

    // Validate structure
    if (!parsed.summary || !Array.isArray(parsed.alerts) || !Array.isArray(parsed.recommendations)) {
      throw new Error('Invalid AI response structure');
    }

    const validTrajectories = ['BEHIND', 'ON_TRACK', 'AHEAD'];
    if (!validTrajectories.includes(parsed.trajectory)) {
      parsed.trajectory = 'ON_TRACK';
    }

    return {
      summary: String(parsed.summary),
      alerts: parsed.alerts.map(String),
      recommendations: parsed.recommendations.map((r: any) => ({
        metric: String(r.metric || ''),
        current: Number(r.current || 0),
        suggested: Number(r.suggested || 0),
        rationale: String(r.rationale || ''),
      })),
      trajectory: parsed.trajectory,
    };
  } catch (err) {
    logger.error('Failed to parse AI response', { text: text.substring(0, 200), error: String(err) });
    return {
      summary: 'AI analysis unavailable — response could not be parsed.',
      alerts: [],
      recommendations: [],
      trajectory: 'ON_TRACK',
    };
  }
}
