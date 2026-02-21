jest.mock('../src/prisma', () => ({
  prisma: {
    monthlySnapshot: {
      update: jest.fn(),
    },
  },
  Prisma: {
    Decimal: jest.fn((v: any) => v),
  },
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

import { buildVariancePrompt, parseAIResponse, runVarianceAnalysis } from '../src/jobs/ai-variance';
import { prisma } from '../src/prisma';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('buildVariancePrompt', () => {
  const snapshot = {
    id: 'snap-1',
    month: '2026-05',
    monthNumber: 3,
    mrr: 1500,
    arr: 18000,
    customers: 5,
    newCustomers: 3,
    churnedCustomers: 0,
    mrrGrowthPct: 200,
    revenueChurnPct: 0,
    pipelineValue: 25000,
    wonDeals: 2,
    winRate: 40,
    newLeads: 15,
    activeTrials: 3,
    trialConversionPct: 66.7,
    avgHealthScore: 85,
  };

  const planTarget = {
    plannedMrr: 1500,
    plannedCustomers: 5,
    plannedNewCustomers: 3,
    plannedChurnPct: 0,
    plannedArpu: 300,
  };

  it('includes all snapshot metrics in prompt', () => {
    const prompt = buildVariancePrompt(snapshot, planTarget);
    expect(prompt).toContain('Month 3');
    expect(prompt).toContain('MRR:');
    expect(prompt).toContain('ARR:');
    expect(prompt).toContain('Customers: 5');
    expect(prompt).toContain('Planned MRR:');
  });

  it('calculates variance percentage', () => {
    const prompt = buildVariancePrompt(snapshot, planTarget);
    expect(prompt).toContain('MRR variance:');
    expect(prompt).toContain('0.0%');
  });

  it('includes trajectory classification instructions', () => {
    const prompt = buildVariancePrompt(snapshot, planTarget);
    expect(prompt).toContain('BEHIND');
    expect(prompt).toContain('ON_TRACK');
    expect(prompt).toContain('AHEAD');
  });

  it('includes negative variance when MRR is below plan', () => {
    const lowSnapshot = { ...snapshot, mrr: 750 };
    const prompt = buildVariancePrompt(lowSnapshot, planTarget);
    expect(prompt).toContain('MRR variance:');
    expect(prompt).toContain('-50.0%');
  });
});

describe('parseAIResponse', () => {
  it('parses valid JSON response', () => {
    const json = JSON.stringify({
      summary: 'Month 3 performance is on track.',
      alerts: ['Pipeline needs attention'],
      recommendations: [
        { metric: 'MRR', current: 1500, suggested: 2000, rationale: 'Growth trend' },
      ],
      trajectory: 'ON_TRACK',
    });

    const result = parseAIResponse(json);
    expect(result.summary).toBe('Month 3 performance is on track.');
    expect(result.alerts).toHaveLength(1);
    expect(result.recommendations).toHaveLength(1);
    expect(result.trajectory).toBe('ON_TRACK');
  });

  it('handles JSON in markdown code blocks', () => {
    const text =
      '```json\n{"summary":"Test","alerts":[],"recommendations":[],"trajectory":"AHEAD"}\n```';
    const result = parseAIResponse(text);
    expect(result.summary).toBe('Test');
    expect(result.trajectory).toBe('AHEAD');
  });

  it('returns fallback for malformed JSON', () => {
    const result = parseAIResponse('This is not JSON at all');
    expect(result.summary).toContain('unavailable');
    expect(result.alerts).toHaveLength(0);
    expect(result.recommendations).toHaveLength(0);
    expect(result.trajectory).toBe('ON_TRACK');
  });

  it('returns fallback for incomplete structure', () => {
    const result = parseAIResponse('{"summary":"ok"}');
    expect(result.summary).toContain('unavailable');
  });

  it('defaults invalid trajectory to ON_TRACK', () => {
    const json = JSON.stringify({
      summary: 'test',
      alerts: [],
      recommendations: [],
      trajectory: 'INVALID',
    });
    const result = parseAIResponse(json);
    expect(result.trajectory).toBe('ON_TRACK');
  });

  it('preserves BEHIND trajectory', () => {
    const json = JSON.stringify({
      summary: 'Behind plan',
      alerts: ['Missed targets'],
      recommendations: [],
      trajectory: 'BEHIND',
    });
    const result = parseAIResponse(json);
    expect(result.trajectory).toBe('BEHIND');
  });
});

describe('runVarianceAnalysis', () => {
  it('returns null when API key is not set', async () => {
    delete process.env.ANTHROPIC_API_KEY;

    const result = await runVarianceAnalysis(
      {
        id: 'snap-1',
        month: '2026-05',
        monthNumber: 3,
        mrr: 1500,
        arr: 18000,
        customers: 5,
        newCustomers: 3,
        churnedCustomers: 0,
        mrrGrowthPct: 200,
        revenueChurnPct: 0,
        pipelineValue: 25000,
        wonDeals: 2,
        winRate: 40,
        newLeads: 15,
        activeTrials: 3,
        trialConversionPct: 66.7,
        avgHealthScore: 85,
      },
      {
        plannedMrr: 1500,
        plannedCustomers: 5,
        plannedNewCustomers: 3,
        plannedChurnPct: 0,
        plannedArpu: 300,
      }
    );
    expect(result).toBeNull();
    expect(prisma.monthlySnapshot.update).not.toHaveBeenCalled();
  });

  it('calls Anthropic API when key is set', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key';

    // Mock global fetch
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          content: [
            {
              text: JSON.stringify({
                summary: 'AI test',
                alerts: ['alert1'],
                recommendations: [
                  { metric: 'MRR', current: 1500, suggested: 2000, rationale: 'test' },
                ],
                trajectory: 'ON_TRACK',
              }),
            },
          ],
        }),
    });
    global.fetch = mockFetch;

    (prisma.monthlySnapshot.update as jest.Mock).mockResolvedValue({});

    const result = await runVarianceAnalysis(
      {
        id: 'snap-1',
        month: '2026-05',
        monthNumber: 3,
        mrr: 1500,
        arr: 18000,
        customers: 5,
        newCustomers: 3,
        churnedCustomers: 0,
        mrrGrowthPct: 200,
        revenueChurnPct: 0,
        pipelineValue: 25000,
        wonDeals: 2,
        winRate: 40,
        newLeads: 15,
        activeTrials: 3,
        trialConversionPct: 66.7,
        avgHealthScore: 85,
      },
      {
        plannedMrr: 1500,
        plannedCustomers: 5,
        plannedNewCustomers: 3,
        plannedChurnPct: 0,
        plannedArpu: 300,
      }
    );

    expect(result).not.toBeNull();
    expect(result!.summary).toBe('AI test');
    expect(prisma.monthlySnapshot.update).toHaveBeenCalled();
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.anthropic.com/v1/messages',
      expect.objectContaining({ method: 'POST' })
    );

    delete process.env.ANTHROPIC_API_KEY;
  });

  it('throws on API error', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key';
    global.fetch = jest
      .fn()
      .mockResolvedValue({ ok: false, status: 500, statusText: 'Internal Error' });

    await expect(
      runVarianceAnalysis(
        {
          id: 'snap-1',
          month: '2026-05',
          monthNumber: 3,
          mrr: 1500,
          arr: 18000,
          customers: 5,
          newCustomers: 3,
          churnedCustomers: 0,
          mrrGrowthPct: 200,
          revenueChurnPct: 0,
          pipelineValue: 25000,
          wonDeals: 2,
          winRate: 40,
          newLeads: 15,
          activeTrials: 3,
          trialConversionPct: 66.7,
          avgHealthScore: 85,
        },
        {
          plannedMrr: 1500,
          plannedCustomers: 5,
          plannedNewCustomers: 3,
          plannedChurnPct: 0,
          plannedArpu: 300,
        }
      )
    ).rejects.toThrow('Anthropic API error');

    delete process.env.ANTHROPIC_API_KEY;
  });
});

describe('AI Variance — extended', () => {
  const baseSnapshot = {
    id: 'snap-ext',
    month: '2026-06',
    monthNumber: 4,
    mrr: 2000,
    arr: 24000,
    customers: 8,
    newCustomers: 2,
    churnedCustomers: 0,
    mrrGrowthPct: 33.3,
    revenueChurnPct: 0,
    pipelineValue: 30000,
    wonDeals: 3,
    winRate: 50,
    newLeads: 20,
    activeTrials: 4,
    trialConversionPct: 75,
    avgHealthScore: 90,
  };
  const basePlan = {
    plannedMrr: 2000,
    plannedCustomers: 8,
    plannedNewCustomers: 2,
    plannedChurnPct: 0,
    plannedArpu: 250,
  };

  it('buildVariancePrompt includes winRate in prompt text', () => {
    const prompt = buildVariancePrompt(baseSnapshot, basePlan);
    expect(prompt.toLowerCase()).toContain('win rate');
  });

  it('parseAIResponse handles JSON with no alerts array gracefully via fallback', () => {
    const result = parseAIResponse('{"summary":"ok","trajectory":"ON_TRACK"}');
    expect(result.trajectory).toBe('ON_TRACK');
    expect(result.alerts).toBeDefined();
  });
});

describe('ai-variance.test.ts — additional coverage', () => {
  const baseSnapshot = {
    id: 'snap-cov',
    month: '2026-07',
    monthNumber: 5,
    mrr: 3000,
    arr: 36000,
    customers: 10,
    newCustomers: 3,
    churnedCustomers: 1,
    mrrGrowthPct: 50,
    revenueChurnPct: 5,
    pipelineValue: 40000,
    wonDeals: 4,
    winRate: 45,
    newLeads: 25,
    activeTrials: 5,
    trialConversionPct: 60,
    avgHealthScore: 80,
  };
  const basePlan = {
    plannedMrr: 4000,
    plannedCustomers: 12,
    plannedNewCustomers: 4,
    plannedChurnPct: 2,
    plannedArpu: 300,
  };

  it('buildVariancePrompt shows positive variance when MRR exceeds plan', () => {
    const aheadSnapshot = { ...baseSnapshot, mrr: 5000 };
    const prompt = buildVariancePrompt(aheadSnapshot, { ...basePlan, plannedMrr: 4000 });
    expect(prompt).toContain('25.0%');
  });

  it('parseAIResponse defaults missing trajectory to ON_TRACK without fallback path', () => {
    const json = JSON.stringify({ summary: 'ok', alerts: [], recommendations: [] });
    const result = parseAIResponse(json);
    // missing trajectory is not in validTrajectories — defaults to ON_TRACK
    expect(result.trajectory).toBe('ON_TRACK');
    // summary is preserved (not the fallback) because the structure is valid
    expect(result.summary).toBe('ok');
  });

  it('runVarianceAnalysis returns null immediately when ANTHROPIC_API_KEY is empty string', async () => {
    process.env.ANTHROPIC_API_KEY = '';
    const result = await runVarianceAnalysis(baseSnapshot, basePlan);
    expect(result).toBeNull();
    expect(prisma.monthlySnapshot.update).not.toHaveBeenCalled();
    delete process.env.ANTHROPIC_API_KEY;
  });

  it('buildVariancePrompt includes planned customers count in output', () => {
    const prompt = buildVariancePrompt(baseSnapshot, basePlan);
    expect(prompt).toContain('12');
  });

  it('parseAIResponse handles AHEAD trajectory correctly', () => {
    const json = JSON.stringify({
      summary: 'Ahead of plan',
      alerts: [],
      recommendations: [{ metric: 'ARR', current: 36000, suggested: 40000, rationale: 'Keep growing' }],
      trajectory: 'AHEAD',
    });
    const result = parseAIResponse(json);
    expect(result.trajectory).toBe('AHEAD');
    expect(result.recommendations).toHaveLength(1);
  });
});
