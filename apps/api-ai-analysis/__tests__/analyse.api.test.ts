import express from 'express';
import request from 'supertest';

// Mock global fetch before any imports that use it
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock prisma - must use ../src/prisma (NOT @ims/database)
jest.mock('../src/prisma', () => ({
  prisma: {
    aISettings: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    aIAnalysis: {
      create: jest.fn(),
    },
    risk: {
      findUnique: jest.fn(),
    },
    incident: {
      findUnique: jest.fn(),
    },
  },
}));

jest.mock('@ims/resilience', () => ({
  createCircuitBreaker: (fn: any) => ({
    fire: fn,
    on: () => {},
    fallback: () => {},
  }),
}), { virtual: true });

jest.mock('@ims/auth', () => ({
  authenticate: (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'No token provided' },
      });
    }
    req.user = { id: '20000000-0000-4000-a000-000000000001', email: 'admin@ims.local', role: 'ADMIN' };
    next();
  },
  requireRole: () => (req: any, res: any, next: any) => next(),
}));
jest.mock('@ims/service-auth', () => ({
  checkOwnership: () => (_req: any, _res: any, next: any) => next(),
  scopeToUser: (_req: any, _res: any, next: any) => next(),
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
  metricsMiddleware: () => (req: any, res: any, next: any) => next(),
  metricsHandler: (req: any, res: any) => res.json({}),
  correlationIdMiddleware: () => (req: any, res: any, next: any) => next(),
  createHealthCheck: () => (req: any, res: any) => res.json({ status: 'healthy' }),
}));

import { prisma } from '../src/prisma';
import analyseRouter from '../src/routes/analyse';

const mockPrisma = prisma as any;

describe('POST /api/analyse', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/analyse', analyseRouter);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockReset();
  });

  const validPayload = {
    sourceType: 'risk',
    sourceId: 'source-1',
  };

  const mockSettings = {
    id: 'settings-1',
    provider: 'OPENAI',
    apiKey: 'sk-test-key-123',
    model: 'gpt-4',
    defaultPrompt: null,
    totalTokensUsed: 100,
    lastUsedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRiskSource = {
    id: 'source-1',
    title: 'Fall from height',
    description: 'Risk of falling when working at height',
    likelihood: 4,
    severity: 5,
    riskScore: 20,
    riskLevel: 'HIGH',
    status: 'ACTIVE',
  };

  const mockIncidentSource = {
    id: 'source-2',
    title: 'Chemical spill in lab',
    description: 'Minor chemical spill during transfer',
    dateOccurred: new Date(),
    severity: 'MODERATE',
    status: 'OPEN',
  };

  const mockOpenAIFetchResponse = {
    ok: true,
    json: jest.fn().mockResolvedValue({
      choices: [
        {
          message: {
            content: 'Root cause: Inadequate fall protection. Action: Install guardrails. ISO clause 6.1.2: Risk assessment gap.',
          },
        },
      ],
      usage: { total_tokens: 250 },
      model: 'gpt-4',
    }),
  };

  const mockAnalysis = {
    id: '52000000-0000-4000-a000-000000000001',
    userId: '20000000-0000-4000-a000-000000000001',
    sourceType: 'risk',
    sourceId: 'source-1',
    sourceData: mockRiskSource,
    prompt: 'some prompt',
    provider: 'OPENAI',
    model: 'gpt-4',
    response: { content: 'AI response' },
    suggestedRootCause: 'Inadequate fall protection.',
    suggestedActions: [],
    complianceGaps: [],
    highlights: [],
    status: 'COMPLETED',
    createdAt: new Date(),
  };

  // -------------------------------------------------------
  // 1. Returns 401 without auth
  // -------------------------------------------------------
  it('returns 401 without auth', async () => {
    const response = await request(app)
      .post('/api/analyse')
      .send(validPayload);

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('UNAUTHORIZED');
  });

  // -------------------------------------------------------
  // 2. Returns 400 for missing required fields
  // -------------------------------------------------------
  it('returns 400 for missing required fields', async () => {
    const response = await request(app)
      .post('/api/analyse')
      .set('Authorization', 'Bearer test-token')
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  // -------------------------------------------------------
  // 3. Returns 400 for invalid sourceType
  // -------------------------------------------------------
  it('returns 400 for invalid sourceType', async () => {
    const response = await request(app)
      .post('/api/analyse')
      .set('Authorization', 'Bearer test-token')
      .send({ sourceType: 'invalid', sourceId: 'source-1' });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  // -------------------------------------------------------
  // 4. Returns 400 when no AI config exists
  // -------------------------------------------------------
  it('returns 400 when no AI config exists', async () => {
    mockPrisma.aISettings.findFirst.mockResolvedValueOnce(null);

    const response = await request(app)
      .post('/api/analyse')
      .set('Authorization', 'Bearer test-token')
      .send(validPayload);

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('NO_AI_CONFIG');
    expect(response.body.error.message).toContain('AI provider not configured');
  });

  // -------------------------------------------------------
  // 5. Returns 400 when AI config has no apiKey
  // -------------------------------------------------------
  it('returns 400 when AI config has no apiKey', async () => {
    mockPrisma.aISettings.findFirst.mockResolvedValueOnce({
      ...mockSettings,
      apiKey: '',
    });

    const response = await request(app)
      .post('/api/analyse')
      .set('Authorization', 'Bearer test-token')
      .send(validPayload);

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('NO_AI_CONFIG');
  });

  // -------------------------------------------------------
  // 6. Returns 404 when source not found
  // -------------------------------------------------------
  it('returns 404 when source not found', async () => {
    mockPrisma.aISettings.findFirst.mockResolvedValueOnce(mockSettings);
    mockPrisma.risk.findUnique.mockResolvedValueOnce(null);

    const response = await request(app)
      .post('/api/analyse')
      .set('Authorization', 'Bearer test-token')
      .send(validPayload);

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('NOT_FOUND');
    expect(response.body.error.message).toBe('Source data not found');
  });

  // -------------------------------------------------------
  // 7. Returns 201 on successful analysis with risk sourceType
  // -------------------------------------------------------
  it('returns 201 on successful analysis with risk sourceType', async () => {
    mockPrisma.aISettings.findFirst.mockResolvedValueOnce(mockSettings);
    mockPrisma.risk.findUnique.mockResolvedValueOnce(mockRiskSource);
    mockPrisma.aIAnalysis.create.mockResolvedValueOnce(mockAnalysis);
    mockPrisma.aISettings.update.mockResolvedValueOnce(mockSettings);

    mockFetch.mockResolvedValueOnce(mockOpenAIFetchResponse);

    const response = await request(app)
      .post('/api/analyse')
      .set('Authorization', 'Bearer test-token')
      .send(validPayload);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeDefined();
    expect(response.body.data.id).toBe('52000000-0000-4000-a000-000000000001');

    // Verify prisma.risk.findUnique was called for risk sourceType
    expect(mockPrisma.risk.findUnique).toHaveBeenCalledWith({
      where: { id: 'source-1' },
    });
    expect(mockPrisma.incident.findUnique).not.toHaveBeenCalled();

    // Verify analysis was saved
    expect(mockPrisma.aIAnalysis.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: '20000000-0000-4000-a000-000000000001',
        sourceType: 'risk',
        sourceId: 'source-1',
        provider: 'OPENAI',
        model: 'gpt-4',
        status: 'COMPLETED',
      }),
    });

    // Verify token usage was updated
    expect(mockPrisma.aISettings.update).toHaveBeenCalledWith({
      where: { id: 'settings-1' },
      data: expect.objectContaining({
        totalTokensUsed: 350, // 100 + 250
      }),
    });
  });

  // -------------------------------------------------------
  // 8. Handles aspect sourceType (uses prisma.risk)
  // -------------------------------------------------------
  it('handles aspect sourceType by using prisma.risk', async () => {
    mockPrisma.aISettings.findFirst.mockResolvedValueOnce(mockSettings);
    mockPrisma.risk.findUnique.mockResolvedValueOnce(mockRiskSource);
    mockPrisma.aIAnalysis.create.mockResolvedValueOnce(mockAnalysis);
    mockPrisma.aISettings.update.mockResolvedValueOnce(mockSettings);

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({
        choices: [{ message: { content: 'Root cause: Test analysis.' } }],
        usage: { total_tokens: 100 },
        model: 'gpt-4',
      }),
    });

    const response = await request(app)
      .post('/api/analyse')
      .set('Authorization', 'Bearer test-token')
      .send({ sourceType: 'aspect', sourceId: 'source-1' });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);

    // For 'aspect', the code uses prisma.risk.findUnique
    expect(mockPrisma.risk.findUnique).toHaveBeenCalledWith({
      where: { id: 'source-1' },
    });
    expect(mockPrisma.incident.findUnique).not.toHaveBeenCalled();
  });

  // -------------------------------------------------------
  // 9. Handles incident sourceType (uses prisma.incident)
  // -------------------------------------------------------
  it('handles incident sourceType by using prisma.incident', async () => {
    mockPrisma.aISettings.findFirst.mockResolvedValueOnce(mockSettings);
    mockPrisma.incident.findUnique.mockResolvedValueOnce(mockIncidentSource);
    mockPrisma.aIAnalysis.create.mockResolvedValueOnce({
      ...mockAnalysis,
      sourceType: 'incident',
      sourceId: 'source-2',
    });
    mockPrisma.aISettings.update.mockResolvedValueOnce(mockSettings);

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({
        choices: [{ message: { content: 'Root cause: Improper handling.' } }],
        usage: { total_tokens: 200 },
        model: 'gpt-4',
      }),
    });

    const response = await request(app)
      .post('/api/analyse')
      .set('Authorization', 'Bearer test-token')
      .send({ sourceType: 'incident', sourceId: 'source-2' });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);

    // For 'incident', the code uses prisma.incident.findUnique
    expect(mockPrisma.incident.findUnique).toHaveBeenCalledWith({
      where: { id: 'source-2' },
    });
    expect(mockPrisma.risk.findUnique).not.toHaveBeenCalled();
  });

  // -------------------------------------------------------
  // 10. Handles nonconformance sourceType (uses prisma.incident)
  // -------------------------------------------------------
  it('handles nonconformance sourceType by using prisma.incident', async () => {
    mockPrisma.aISettings.findFirst.mockResolvedValueOnce(mockSettings);
    mockPrisma.incident.findUnique.mockResolvedValueOnce(mockIncidentSource);
    mockPrisma.aIAnalysis.create.mockResolvedValueOnce({
      ...mockAnalysis,
      sourceType: 'nonconformance',
    });
    mockPrisma.aISettings.update.mockResolvedValueOnce(mockSettings);

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({
        choices: [{ message: { content: 'Root cause: Process failure.' } }],
        usage: { total_tokens: 180 },
        model: 'gpt-4',
      }),
    });

    const response = await request(app)
      .post('/api/analyse')
      .set('Authorization', 'Bearer test-token')
      .send({ sourceType: 'nonconformance', sourceId: 'source-2' });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);

    // For 'nonconformance', the code uses prisma.incident.findUnique
    expect(mockPrisma.incident.findUnique).toHaveBeenCalledWith({
      where: { id: 'source-2' },
    });
    expect(mockPrisma.risk.findUnique).not.toHaveBeenCalled();
  });

  // -------------------------------------------------------
  // 11. Returns 502 when AI provider call fails
  // -------------------------------------------------------
  it('returns 502 when AI provider call fails', async () => {
    mockPrisma.aISettings.findFirst.mockResolvedValueOnce(mockSettings);
    mockPrisma.risk.findUnique.mockResolvedValueOnce(mockRiskSource);

    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: jest.fn().mockResolvedValue({ error: { message: 'Rate limit exceeded' } }),
    });

    const response = await request(app)
      .post('/api/analyse')
      .set('Authorization', 'Bearer test-token')
      .send(validPayload);

    expect(response.status).toBe(502);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('AI_ERROR');
    expect(response.body.error.message).toContain('AI analysis failed');
  });

  // -------------------------------------------------------
  // 12. Returns 500 on internal error
  // -------------------------------------------------------
  it('returns 500 on internal error', async () => {
    mockPrisma.aISettings.findFirst.mockRejectedValueOnce(
      new Error('Database connection failed')
    );

    const response = await request(app)
      .post('/api/analyse')
      .set('Authorization', 'Bearer test-token')
      .send(validPayload);

    expect(response.status).toBe(500);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('INTERNAL_ERROR');
    expect(response.body.error.message).toBe('Failed to perform AI analysis');
  });

  // -------------------------------------------------------
  // 13. Passes selectedText and customPrompt to the AI prompt
  // -------------------------------------------------------
  it('passes selectedText and customPrompt to the AI prompt', async () => {
    mockPrisma.aISettings.findFirst.mockResolvedValueOnce(mockSettings);
    mockPrisma.risk.findUnique.mockResolvedValueOnce(mockRiskSource);
    mockPrisma.aIAnalysis.create.mockResolvedValueOnce(mockAnalysis);
    mockPrisma.aISettings.update.mockResolvedValueOnce(mockSettings);

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({
        choices: [{ message: { content: 'Root cause: Electrical hazard.' } }],
        usage: { total_tokens: 150 },
        model: 'gpt-4',
      }),
    });

    const response = await request(app)
      .post('/api/analyse')
      .set('Authorization', 'Bearer test-token')
      .send({
        sourceType: 'risk',
        sourceId: 'source-1',
        selectedText: 'highlighted text here',
        customPrompt: 'Focus on electrical hazards',
      });

    expect(response.status).toBe(201);

    // Verify the prompt stored includes the custom prompt and selected text
    expect(mockPrisma.aIAnalysis.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        prompt: expect.stringContaining('Focus on electrical hazards'),
      }),
    });
    expect(mockPrisma.aIAnalysis.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        prompt: expect.stringContaining('highlighted text here'),
      }),
    });
  });
});
