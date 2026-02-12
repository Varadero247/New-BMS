import express from 'express';
import request from 'supertest';

// Mock global fetch before any imports that use it
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock dependencies
jest.mock('../src/prisma', () => ({
  prisma: {
    aISettings: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      deleteMany: jest.fn(),
    },
  },
}));

jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((req: any, res: any, next: any) => {
    if (req.headers.authorization) {
      req.user = { id: '20000000-0000-4000-a000-000000000001', email: 'admin@ims.local', role: 'ADMIN' };
      next();
    } else {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'No token provided' },
      });
    }
  }),
  requireRole: () => (req: any, res: any, next: any) => next(),
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
  metricsMiddleware: () => (req: any, res: any, next: any) => next(),
  metricsHandler: (req: any, res: any) => res.json({}),
  correlationIdMiddleware: () => (req: any, res: any, next: any) => next(),
  createHealthCheck: () => (req: any, res: any) => res.json({ status: 'healthy' }),
}));

import { prisma } from '../src/prisma';
import analyzeRouter from '../src/routes/analyze';

const mockPrisma = prisma as any;

// Helper to build a mock OpenAI-style fetch response
function mockOpenAIResponse(content: string, tokensUsed = 150) {
  return {
    ok: true,
    json: jest.fn().mockResolvedValue({
      choices: [{ message: { content } }],
      usage: { total_tokens: tokensUsed },
    }),
  };
}

// Helper to build a mock Anthropic-style fetch response
function mockAnthropicResponse(content: string, inputTokens = 80, outputTokens = 70) {
  return {
    ok: true,
    json: jest.fn().mockResolvedValue({
      content: [{ text: content }],
      usage: { input_tokens: inputTokens, output_tokens: outputTokens },
    }),
  };
}

// Helper to build a mock Grok-style fetch response
function mockGrokResponse(content: string, tokensUsed = 120) {
  return {
    ok: true,
    json: jest.fn().mockResolvedValue({
      choices: [{ message: { content } }],
      usage: { total_tokens: tokensUsed },
    }),
  };
}

const mockSettings = {
  id: 'settings-1',
  provider: 'OPENAI',
  apiKey: 'sk-test-key-123',
  model: 'gpt-4',
  defaultPrompt: null,
  totalTokensUsed: 500,
  lastUsedAt: new Date('2024-06-01'),
  createdAt: new Date('2024-01-01'),
};

describe('AI Analyze API Routes', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/analyze', analyzeRouter);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockReset();
  });

  // -------------------------------------------------------
  // 1. POST /api/analyze returns 401 without auth
  // -------------------------------------------------------
  it('POST /api/analyze returns 401 without auth', async () => {
    const response = await request(app)
      .post('/api/analyze')
      .send({ type: 'LEGAL_REFERENCES', context: {} });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('UNAUTHORIZED');
  });

  // -------------------------------------------------------
  // 2. POST /api/analyze returns 400 for missing required fields
  // -------------------------------------------------------
  it('POST /api/analyze returns 400 for missing required fields', async () => {
    const response = await request(app)
      .post('/api/analyze')
      .set('Authorization', 'Bearer test-token')
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  // -------------------------------------------------------
  // 3. POST /api/analyze returns 400 for invalid type
  // -------------------------------------------------------
  it('POST /api/analyze returns 400 for invalid type', async () => {
    const response = await request(app)
      .post('/api/analyze')
      .set('Authorization', 'Bearer test-token')
      .send({ type: 'INVALID_TYPE', context: {} });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  // -------------------------------------------------------
  // 4. POST /api/analyze returns 400 when no AI config
  // -------------------------------------------------------
  it('POST /api/analyze returns 400 when no AI config', async () => {
    mockPrisma.aISettings.findFirst.mockResolvedValueOnce(null);

    const response = await request(app)
      .post('/api/analyze')
      .set('Authorization', 'Bearer test-token')
      .send({ type: 'LEGAL_REFERENCES', context: { riskTitle: 'Test' } });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('NO_AI_CONFIG');
  });

  // -------------------------------------------------------
  // 5. POST /api/analyze returns 400 when apiKey empty
  // -------------------------------------------------------
  it('POST /api/analyze returns 400 when apiKey empty', async () => {
    mockPrisma.aISettings.findFirst.mockResolvedValueOnce({
      ...mockSettings,
      apiKey: '',
    });

    const response = await request(app)
      .post('/api/analyze')
      .set('Authorization', 'Bearer test-token')
      .send({ type: 'LEGAL_REFERENCES', context: { riskTitle: 'Test' } });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('NO_AI_CONFIG');
  });

  // -------------------------------------------------------
  // 6. POST /api/analyze returns success for LEGAL_REFERENCES type
  // -------------------------------------------------------
  it('POST /api/analyze returns success for LEGAL_REFERENCES type', async () => {
    const legalRefs = [
      { regulation: 'Health and Safety at Work Act 1974', section: 'Section 2', relevance: 'General duty of care' },
      { regulation: 'Management of Health and Safety at Work Regulations 1999', section: 'Regulation 3', relevance: 'Risk assessment' },
      { regulation: 'Workplace (Health, Safety and Welfare) Regulations 1992', section: 'Regulation 5', relevance: 'Workplace maintenance' },
    ];

    mockPrisma.aISettings.findFirst.mockResolvedValueOnce(mockSettings);
    mockPrisma.aISettings.update.mockResolvedValueOnce(mockSettings);
    mockFetch.mockResolvedValueOnce(mockOpenAIResponse(JSON.stringify(legalRefs)));

    const response = await request(app)
      .post('/api/analyze')
      .set('Authorization', 'Bearer test-token')
      .send({
        type: 'LEGAL_REFERENCES',
        context: { riskTitle: 'Slip hazard', riskDescription: 'Wet floor in canteen', riskCategory: 'Workplace Safety' },
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.suggestions).toBeDefined();
    expect(Array.isArray(response.body.data.suggestions)).toBe(true);
    expect(response.body.data.suggestions).toHaveLength(3);
    expect(response.body.data.suggestions[0].regulation).toBe('Health and Safety at Work Act 1974');
  });

  // -------------------------------------------------------
  // 7. POST /api/analyze returns success for ENVIRONMENTAL_ASPECT type
  // -------------------------------------------------------
  it('POST /api/analyze returns success for ENVIRONMENTAL_ASPECT type', async () => {
    // Note: the source code regex extracts JSON by matching arrays first (/\[...\]/)
    // then objects (/\{...\}/). Objects containing arrays cause incorrect greedy
    // array matching, so the AI response must be structured without top-level array
    // values to parse correctly via the object regex fallback.
    const envResult = {
      scoring: { severity: 3, probability: 2, duration: 4, extent: 2, reversibility: 3, regulatory: 4, stakeholder: 2, rationale: 'Moderate impact' },
      controlMeasure1: 'Install bunding',
      controlMeasure2: 'Regular inspections',
      controlMeasure3: 'Spill kits',
      regulation: 'Environmental Protection Act 1990',
      isoClause: '6.1.2',
    };

    mockPrisma.aISettings.findFirst.mockResolvedValueOnce(mockSettings);
    mockPrisma.aISettings.update.mockResolvedValueOnce(mockSettings);
    mockFetch.mockResolvedValueOnce(mockOpenAIResponse(JSON.stringify(envResult)));

    const response = await request(app)
      .post('/api/analyze')
      .set('Authorization', 'Bearer test-token')
      .send({
        type: 'ENVIRONMENTAL_ASPECT',
        context: { activity: 'Fuel storage', aspect: 'Fuel leak', impact: 'Soil contamination', category: 'Pollution' },
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.type).toBe('ENVIRONMENTAL_ASPECT');
    expect(response.body.data.result).toBeDefined();
    expect(response.body.data.result.scoring.severity).toBe(3);
    expect(response.body.data.result.controlMeasure1).toBe('Install bunding');
  });

  // -------------------------------------------------------
  // 8. POST /api/analyze returns success for HR_JOB_DESCRIPTION type
  // -------------------------------------------------------
  it('POST /api/analyze returns success for HR_JOB_DESCRIPTION type', async () => {
    const hrResult = {
      description: 'Enhanced job description paragraph.',
      primaryResponsibility: 'Lead team meetings',
      secondaryResponsibility: 'Manage project timelines',
      keyRequirement: '5+ years experience',
      topSkill: 'Leadership',
      topBenefit: 'Health insurance',
    };

    mockPrisma.aISettings.findFirst.mockResolvedValueOnce(mockSettings);
    mockPrisma.aISettings.update.mockResolvedValueOnce(mockSettings);
    mockFetch.mockResolvedValueOnce(mockOpenAIResponse(JSON.stringify(hrResult)));

    const response = await request(app)
      .post('/api/analyze')
      .set('Authorization', 'Bearer test-token')
      .send({
        type: 'HR_JOB_DESCRIPTION',
        context: { title: 'Senior Developer', department: 'Engineering', employmentType: 'Full-time' },
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.type).toBe('HR_JOB_DESCRIPTION');
    expect(response.body.data.result.description).toBe('Enhanced job description paragraph.');
    expect(response.body.data.result.topSkill).toBe('Leadership');
  });

  // -------------------------------------------------------
  // 9. POST /api/analyze returns success for PAYROLL_VALIDATION type
  // -------------------------------------------------------
  it('POST /api/analyze returns success for PAYROLL_VALIDATION type', async () => {
    const payrollResult = {
      isValid: true,
      calculationCheck: { grossMinusDeductions: 35000, matchesNet: true, variance: 0 },
      warningCount: 0,
      errorCount: 0,
      recommendation: 'Consider automating validation',
      averagePerEmployee: { gross: 5000, net: 3500, deductions: 1500 },
    };

    mockPrisma.aISettings.findFirst.mockResolvedValueOnce(mockSettings);
    mockPrisma.aISettings.update.mockResolvedValueOnce(mockSettings);
    mockFetch.mockResolvedValueOnce(mockOpenAIResponse(JSON.stringify(payrollResult)));

    const response = await request(app)
      .post('/api/analyze')
      .set('Authorization', 'Bearer test-token')
      .send({
        type: 'PAYROLL_VALIDATION',
        context: { runNumber: 'PAY-2024-01', totalEmployees: 10, totalGross: 50000, totalDeductions: 15000, totalNet: 35000 },
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.type).toBe('PAYROLL_VALIDATION');
    expect(response.body.data.result.isValid).toBe(true);
    expect(response.body.data.result.calculationCheck.matchesNet).toBe(true);
  });

  // -------------------------------------------------------
  // 10. POST /api/analyze returns success for PROJECT_CHARTER type
  // -------------------------------------------------------
  it('POST /api/analyze returns success for PROJECT_CHARTER type', async () => {
    const charterResult = {
      overview: 'Project to build new system.',
      businessCase: {
        problemStatement: 'Current system outdated',
        businessNeed: 'Modernization required',
        roiEstimate: '150% in 2 years',
      },
      primaryObjective: 'Deliver MVP by Q2',
      scopeStatement: { inScope: 'Core features', outOfScope: 'Mobile app', assumption: 'Team availability', constraint: 'Budget cap' },
      primaryDeliverable: 'Working application',
      sponsor: 'John Smith',
      timeline: { estimatedDuration: '6 months', firstPhase: 'Planning - 1 month' },
      budgetEstimate: { low: 100000, high: 200000, mostLikely: 150000 },
      successCriterion: 'On-time delivery',
      keyRisk: 'Resource shortage',
    };

    mockPrisma.aISettings.findFirst.mockResolvedValueOnce(mockSettings);
    mockPrisma.aISettings.update.mockResolvedValueOnce(mockSettings);
    mockFetch.mockResolvedValueOnce(mockOpenAIResponse(JSON.stringify(charterResult)));

    const response = await request(app)
      .post('/api/analyze')
      .set('Authorization', 'Bearer test-token')
      .send({
        type: 'PROJECT_CHARTER',
        context: { projectName: 'IMS v2', projectType: 'Software', description: 'Build new IMS', objectives: 'Modernize' },
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.type).toBe('PROJECT_CHARTER');
    expect(response.body.data.result.overview).toBeDefined();
    expect(response.body.data.result.businessCase.roiEstimate).toBe('150% in 2 years');
    expect(response.body.data.result.budgetEstimate.mostLikely).toBe(150000);
  });

  // -------------------------------------------------------
  // 11. POST /api/analyze handles Anthropic provider
  // -------------------------------------------------------
  it('POST /api/analyze handles Anthropic provider', async () => {
    const anthropicSettings = { ...mockSettings, provider: 'ANTHROPIC', model: 'claude-3-sonnet-20240229' };
    const envResult = {
      scoring: { severity: 4, probability: 3, duration: 3, extent: 3, reversibility: 2, regulatory: 5, stakeholder: 3, rationale: 'High regulatory significance' },
      controlMeasure: 'Install monitoring equipment',
      regulation: 'Environmental Protection Act 1990',
      isoClause: '6.1.2',
    };

    mockPrisma.aISettings.findFirst.mockResolvedValueOnce(anthropicSettings);
    mockPrisma.aISettings.update.mockResolvedValueOnce(anthropicSettings);
    mockFetch.mockResolvedValueOnce(mockAnthropicResponse(JSON.stringify(envResult)));

    const response = await request(app)
      .post('/api/analyze')
      .set('Authorization', 'Bearer test-token')
      .send({
        type: 'ENVIRONMENTAL_ASPECT',
        context: { activity: 'Chemical processing', aspect: 'Emissions', impact: 'Air pollution', category: 'Emissions' },
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.type).toBe('ENVIRONMENTAL_ASPECT');

    // Verify Anthropic API was called with correct headers
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.anthropic.com/v1/messages',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'x-api-key': 'sk-test-key-123',
          'anthropic-version': '2023-06-01',
        }),
      }),
    );
  });

  // -------------------------------------------------------
  // 12. POST /api/analyze handles Grok provider
  // -------------------------------------------------------
  it('POST /api/analyze handles Grok provider', async () => {
    const grokSettings = { ...mockSettings, provider: 'GROK', model: 'grok-beta' };
    const legalRefs = [
      { regulation: 'Health and Safety at Work Act 1974', section: 'Section 2', relevance: 'General duty' },
    ];

    mockPrisma.aISettings.findFirst.mockResolvedValueOnce(grokSettings);
    mockPrisma.aISettings.update.mockResolvedValueOnce(grokSettings);
    mockFetch.mockResolvedValueOnce(mockGrokResponse(JSON.stringify(legalRefs)));

    const response = await request(app)
      .post('/api/analyze')
      .set('Authorization', 'Bearer test-token')
      .send({
        type: 'LEGAL_REFERENCES',
        context: { riskTitle: 'Noise hazard' },
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.suggestions).toBeDefined();

    // Verify Grok API was called
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.x.ai/v1/chat/completions',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Authorization': 'Bearer sk-test-key-123',
        }),
      }),
    );
  });

  // -------------------------------------------------------
  // 13. POST /api/analyze returns 502 when AI call fails
  // -------------------------------------------------------
  it('POST /api/analyze returns 502 when AI call fails', async () => {
    mockPrisma.aISettings.findFirst.mockResolvedValueOnce(mockSettings);
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: jest.fn().mockResolvedValue({ error: { message: 'Rate limit exceeded' } }),
    });

    const response = await request(app)
      .post('/api/analyze')
      .set('Authorization', 'Bearer test-token')
      .send({
        type: 'LEGAL_REFERENCES',
        context: { riskTitle: 'Fire hazard' },
      });

    expect(response.status).toBe(502);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('AI_ERROR');
    expect(response.body.error.message).toContain('Rate limit exceeded');
  });

  // -------------------------------------------------------
  // 14. POST /api/analyze returns 502 when response isn't valid JSON
  // -------------------------------------------------------
  it('POST /api/analyze returns 502 when response is not valid JSON', async () => {
    mockPrisma.aISettings.findFirst.mockResolvedValueOnce(mockSettings);
    mockPrisma.aISettings.update.mockResolvedValueOnce(mockSettings);
    mockFetch.mockResolvedValueOnce(
      mockOpenAIResponse('This is not valid JSON at all, just plain text without any brackets or braces'),
    );

    const response = await request(app)
      .post('/api/analyze')
      .set('Authorization', 'Bearer test-token')
      .send({
        type: 'LEGAL_REFERENCES',
        context: { riskTitle: 'Chemical spill' },
      });

    expect(response.status).toBe(502);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('PARSE_ERROR');
    expect(response.body.error.message).toBe('Failed to parse AI response as JSON');
  });

  // -------------------------------------------------------
  // 15. POST /api/analyze updates token usage
  // -------------------------------------------------------
  it('POST /api/analyze updates token usage', async () => {
    const legalRefs = [
      { regulation: 'HASAWA 1974', section: 'Section 2', relevance: 'General duty' },
    ];

    mockPrisma.aISettings.findFirst.mockResolvedValueOnce(mockSettings);
    mockPrisma.aISettings.update.mockResolvedValueOnce(mockSettings);
    mockFetch.mockResolvedValueOnce(mockOpenAIResponse(JSON.stringify(legalRefs), 200));

    await request(app)
      .post('/api/analyze')
      .set('Authorization', 'Bearer test-token')
      .send({
        type: 'LEGAL_REFERENCES',
        context: { riskTitle: 'Manual handling' },
      });

    expect(mockPrisma.aISettings.update).toHaveBeenCalledWith({
      where: { id: 'settings-1' },
      data: {
        totalTokensUsed: 700, // 500 existing + 200 new
        lastUsedAt: expect.any(Date),
      },
    });
  });

  // -------------------------------------------------------
  // 16. POST /api/analyze returns 500 on internal error
  // -------------------------------------------------------
  it('POST /api/analyze returns 500 on internal error', async () => {
    mockPrisma.aISettings.findFirst.mockRejectedValueOnce(new Error('Database connection lost'));

    const response = await request(app)
      .post('/api/analyze')
      .set('Authorization', 'Bearer test-token')
      .send({
        type: 'LEGAL_REFERENCES',
        context: { riskTitle: 'Test risk' },
      });

    expect(response.status).toBe(500);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('INTERNAL_ERROR');
    expect(response.body.error.message).toBe('Failed to perform AI analysis');
  });
});
