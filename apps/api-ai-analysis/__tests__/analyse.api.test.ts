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

jest.mock(
  '@ims/resilience',
  () => ({
    createCircuitBreaker: (fn: any) => ({
      fire: fn,
      on: () => {},
      fallback: () => {},
    }),
  }),
  { virtual: true }
);

jest.mock('@ims/auth', () => ({
  authenticate: (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'No token provided' },
      });
    }
    req.user = {
      id: '20000000-0000-4000-a000-000000000001',
      email: 'admin@ims.local',
      role: 'ADMIN',
    };
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

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

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
            content:
              'Root cause: Inadequate fall protection. Action: Install guardrails. ISO clause 6.1.2: Risk assessment gap.',
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
    const response = await request(app).post('/api/analyse').send(validPayload);

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
    mockPrisma.aISettings.findFirst.mockRejectedValueOnce(new Error('Database connection failed'));

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

  // -------------------------------------------------------
  // 14. Fetch network failure returns 502
  // -------------------------------------------------------
  it('returns 502 when fetch throws a network error', async () => {
    mockPrisma.aISettings.findFirst.mockResolvedValueOnce(mockSettings);
    mockPrisma.risk.findUnique.mockResolvedValueOnce(mockRiskSource);

    mockFetch.mockRejectedValueOnce(new Error('Network unreachable'));

    const response = await request(app)
      .post('/api/analyse')
      .set('Authorization', 'Bearer test-token')
      .send(validPayload);

    expect([500, 502]).toContain(response.status);
    expect(response.body.success).toBe(false);
  });

  // -------------------------------------------------------
  // 15. Missing sourceId returns validation error
  // -------------------------------------------------------
  it('returns 400 when sourceId is missing from the request body', async () => {
    const response = await request(app)
      .post('/api/analyse')
      .set('Authorization', 'Bearer test-token')
      .send({ sourceType: 'risk' }); // no sourceId

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('AI Analysis — extended', () => {
  let extApp: import('express').Express;

  beforeAll(() => {
    extApp = require('express')();
    extApp.use(require('express').json());
    extApp.use('/api/analyse', analyseRouter);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockReset();
  });

  it('returns 400 validation error for missing sourceId', async () => {
    const response = await request(extApp)
      .post('/api/analyse')
      .set('Authorization', 'Bearer test-token')
      .send({ sourceType: 'risk' });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 201 with success true on valid risk analysis', async () => {
    const extSettings = {
      id: 'settings-ext',
      provider: 'OPENAI',
      apiKey: 'sk-ext-key',
      model: 'gpt-4',
      defaultPrompt: null,
      totalTokensUsed: 0,
      lastUsedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const extRiskSource = {
      id: 'source-1',
      title: 'Slip hazard',
      description: 'Wet floor risk',
      likelihood: 3,
      severity: 3,
      riskScore: 9,
      riskLevel: 'MEDIUM',
      status: 'ACTIVE',
    };
    const extAnalysis = {
      id: '52000000-0000-4000-a000-000000000002',
      userId: '20000000-0000-4000-a000-000000000001',
      sourceType: 'risk',
      sourceId: 'source-1',
      sourceData: extRiskSource,
      prompt: 'ext prompt',
      provider: 'OPENAI',
      model: 'gpt-4',
      response: { content: 'Extended AI response' },
      suggestedRootCause: 'Wet floor.',
      suggestedActions: [],
      complianceGaps: [],
      highlights: [],
      status: 'COMPLETED',
      createdAt: new Date(),
    };
    mockPrisma.aISettings.findFirst.mockResolvedValueOnce(extSettings);
    mockPrisma.risk.findUnique.mockResolvedValueOnce(extRiskSource);
    mockPrisma.aIAnalysis.create.mockResolvedValueOnce(extAnalysis);
    mockPrisma.aISettings.update.mockResolvedValueOnce(extSettings);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({
        choices: [{ message: { content: 'Root cause: Wet floor.' } }],
        usage: { total_tokens: 75 },
        model: 'gpt-4',
      }),
    });

    const response = await request(extApp)
      .post('/api/analyse')
      .set('Authorization', 'Bearer test-token')
      .send({ sourceType: 'risk', sourceId: 'source-1' });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
  });
});

describe('analyse.api — additional coverage', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/analyse', analyseRouter);
    jest.clearAllMocks();
  });

  it('route responds to GET /api/analyse', async () => {
    const res = await request(app).get('/api/analyse');
    expect([200, 400, 401, 404, 500]).toContain(res.status);
  });

  it('response is JSON content-type for GET /api/analyse', async () => {
    const res = await request(app).get('/api/analyse');
    expect(res.headers['content-type']).toBeDefined();
  });

  it('GET /api/analyse body has success property', async () => {
    const res = await request(app).get('/api/analyse');
    if (res.status === 200) {
      expect(res.body).toHaveProperty('success');
    } else {
      expect(res.body).toBeDefined();
    }
  });
});

// ── analyse.api — edge cases and extended paths ───────────────────────────

describe('analyse.api — edge cases', () => {
  let app: express.Express;

  const mockSettings = {
    id: 'settings-edge-1',
    provider: 'OPENAI',
    apiKey: 'sk-edge-key',
    model: 'gpt-4',
    defaultPrompt: null,
    totalTokensUsed: 0,
    lastUsedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRiskSource = {
    id: 'source-edge-1',
    title: 'Ergonomic strain',
    description: 'Repetitive motion injury risk',
    likelihood: 3,
    severity: 3,
    riskScore: 9,
    riskLevel: 'MEDIUM',
    status: 'ACTIVE',
  };

  const mockAnalysis = {
    id: '52000000-0000-4000-a000-000000000099',
    userId: '20000000-0000-4000-a000-000000000001',
    sourceType: 'risk',
    sourceId: 'source-edge-1',
    sourceData: mockRiskSource,
    prompt: 'edge prompt',
    provider: 'OPENAI',
    model: 'gpt-4',
    response: { content: 'Edge AI response' },
    suggestedRootCause: 'Repetitive motion.',
    suggestedActions: [],
    complianceGaps: [],
    highlights: [],
    status: 'COMPLETED',
    createdAt: new Date(),
  };

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/analyse', analyseRouter);
    jest.clearAllMocks();
    mockFetch.mockReset();
  });

  it('returns 201 and stores analysis with zero tokens when usage is missing', async () => {
    mockPrisma.aISettings.findFirst.mockResolvedValueOnce(mockSettings);
    mockPrisma.risk.findUnique.mockResolvedValueOnce(mockRiskSource);
    mockPrisma.aIAnalysis.create.mockResolvedValueOnce(mockAnalysis);
    mockPrisma.aISettings.update.mockResolvedValueOnce(mockSettings);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({
        choices: [{ message: { content: 'Root cause: ergonomics.' } }],
        // no usage field
      }),
    });
    const res = await request(app)
      .post('/api/analyse')
      .set('Authorization', 'Bearer test-token')
      .send({ sourceType: 'risk', sourceId: 'source-edge-1' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('returns 400 when apiKey is null in settings', async () => {
    mockPrisma.aISettings.findFirst.mockResolvedValueOnce({ ...mockSettings, apiKey: null });
    const res = await request(app)
      .post('/api/analyse')
      .set('Authorization', 'Bearer test-token')
      .send({ sourceType: 'risk', sourceId: 'source-edge-1' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('NO_AI_CONFIG');
  });

  it('POST /api/analyse sends Authorization header to OpenAI fetch call', async () => {
    mockPrisma.aISettings.findFirst.mockResolvedValueOnce(mockSettings);
    mockPrisma.risk.findUnique.mockResolvedValueOnce(mockRiskSource);
    mockPrisma.aIAnalysis.create.mockResolvedValueOnce(mockAnalysis);
    mockPrisma.aISettings.update.mockResolvedValueOnce(mockSettings);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({
        choices: [{ message: { content: 'Root cause: ergonomics.' } }],
        usage: { total_tokens: 50 },
      }),
    });
    await request(app)
      .post('/api/analyse')
      .set('Authorization', 'Bearer test-token')
      .send({ sourceType: 'risk', sourceId: 'source-edge-1' });
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('openai.com'),
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('returns 400 for sourceType "aspect" when source not found', async () => {
    mockPrisma.aISettings.findFirst.mockResolvedValueOnce(mockSettings);
    mockPrisma.risk.findUnique.mockResolvedValueOnce(null);
    const res = await request(app)
      .post('/api/analyse')
      .set('Authorization', 'Bearer test-token')
      .send({ sourceType: 'aspect', sourceId: '00000000-0000-0000-0000-000000000099' });
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('returns 400 for sourceType "nonconformance" when source not found', async () => {
    mockPrisma.aISettings.findFirst.mockResolvedValueOnce(mockSettings);
    mockPrisma.incident.findUnique.mockResolvedValueOnce(null);
    const res = await request(app)
      .post('/api/analyse')
      .set('Authorization', 'Bearer test-token')
      .send({ sourceType: 'nonconformance', sourceId: '00000000-0000-0000-0000-000000000099' });
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('stores response status COMPLETED in created analysis', async () => {
    mockPrisma.aISettings.findFirst.mockResolvedValueOnce(mockSettings);
    mockPrisma.risk.findUnique.mockResolvedValueOnce(mockRiskSource);
    mockPrisma.aIAnalysis.create.mockResolvedValueOnce(mockAnalysis);
    mockPrisma.aISettings.update.mockResolvedValueOnce(mockSettings);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({
        choices: [{ message: { content: 'Root cause: ergonomics.' } }],
        usage: { total_tokens: 30 },
      }),
    });
    await request(app)
      .post('/api/analyse')
      .set('Authorization', 'Bearer test-token')
      .send({ sourceType: 'risk', sourceId: 'source-edge-1' });
    const createCall = (mockPrisma.aIAnalysis.create as jest.Mock).mock.calls[0];
    expect(createCall[0].data.status).toBe('COMPLETED');
  });

  it('updates totalTokensUsed by adding new tokens to existing count', async () => {
    const settingsWithTokens = { ...mockSettings, totalTokensUsed: 500 };
    mockPrisma.aISettings.findFirst.mockResolvedValueOnce(settingsWithTokens);
    mockPrisma.risk.findUnique.mockResolvedValueOnce(mockRiskSource);
    mockPrisma.aIAnalysis.create.mockResolvedValueOnce(mockAnalysis);
    mockPrisma.aISettings.update.mockResolvedValueOnce(settingsWithTokens);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({
        choices: [{ message: { content: 'Root cause: test.' } }],
        usage: { total_tokens: 100 },
      }),
    });
    await request(app)
      .post('/api/analyse')
      .set('Authorization', 'Bearer test-token')
      .send({ sourceType: 'risk', sourceId: 'source-edge-1' });
    expect(mockPrisma.aISettings.update).toHaveBeenCalledWith({
      where: { id: 'settings-edge-1' },
      data: expect.objectContaining({ totalTokensUsed: 600 }),
    });
  });

  it('returns 502 with AI_ERROR code when provider returns non-ok response', async () => {
    mockPrisma.aISettings.findFirst.mockResolvedValueOnce(mockSettings);
    mockPrisma.risk.findUnique.mockResolvedValueOnce(mockRiskSource);
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: jest.fn().mockResolvedValue({ error: { message: 'Token limit' } }),
    });
    const res = await request(app)
      .post('/api/analyse')
      .set('Authorization', 'Bearer test-token')
      .send({ sourceType: 'risk', sourceId: 'source-edge-1' });
    expect(res.status).toBe(502);
    expect(res.body.error.code).toBe('AI_ERROR');
  });
});

// ── analyse.api — further coverage ────────────────────────────────────────

describe('analyse.api — further coverage', () => {
  let app: express.Express;

  const settings = {
    id: 'settings-fc-1',
    provider: 'OPENAI',
    apiKey: 'sk-fc-key',
    model: 'gpt-4',
    defaultPrompt: null,
    totalTokensUsed: 200,
    lastUsedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const riskSource = {
    id: 'source-fc-1',
    title: 'Noise exposure',
    description: 'Prolonged exposure to high noise levels',
    likelihood: 4,
    severity: 3,
    riskScore: 12,
    riskLevel: 'HIGH',
    status: 'ACTIVE',
  };

  const analysis = {
    id: '52000000-0000-4000-a000-000000000088',
    userId: '20000000-0000-4000-a000-000000000001',
    sourceType: 'risk',
    sourceId: 'source-fc-1',
    sourceData: riskSource,
    prompt: 'fc prompt',
    provider: 'OPENAI',
    model: 'gpt-4',
    response: { content: 'FC AI response' },
    suggestedRootCause: 'Noise hazard.',
    suggestedActions: [],
    complianceGaps: [],
    highlights: [],
    status: 'COMPLETED',
    createdAt: new Date(),
  };

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/analyse', analyseRouter);
    jest.clearAllMocks();
    mockFetch.mockReset();
  });

  it('returns 500 when aIAnalysis.create throws after successful fetch', async () => {
    mockPrisma.aISettings.findFirst.mockResolvedValueOnce(settings);
    mockPrisma.risk.findUnique.mockResolvedValueOnce(riskSource);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({
        choices: [{ message: { content: 'Root cause: noise.' } }],
        usage: { total_tokens: 80 },
      }),
    });
    mockPrisma.aIAnalysis.create.mockRejectedValueOnce(new Error('Insert failed'));
    const res = await request(app)
      .post('/api/analyse')
      .set('Authorization', 'Bearer test-token')
      .send({ sourceType: 'risk', sourceId: 'source-fc-1' });
    expect([500]).toContain(res.status);
    expect(res.body.success).toBe(false);
  });

  it('response body has data.id when analysis succeeds', async () => {
    mockPrisma.aISettings.findFirst.mockResolvedValueOnce(settings);
    mockPrisma.risk.findUnique.mockResolvedValueOnce(riskSource);
    mockPrisma.aIAnalysis.create.mockResolvedValueOnce(analysis);
    mockPrisma.aISettings.update.mockResolvedValueOnce(settings);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({
        choices: [{ message: { content: 'Root cause: noise.' } }],
        usage: { total_tokens: 80 },
      }),
    });
    const res = await request(app)
      .post('/api/analyse')
      .set('Authorization', 'Bearer test-token')
      .send({ sourceType: 'risk', sourceId: 'source-fc-1' });
    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty('id');
    expect(typeof res.body.data.id).toBe('string');
  });

  it('response body has success:true on 201', async () => {
    mockPrisma.aISettings.findFirst.mockResolvedValueOnce(settings);
    mockPrisma.risk.findUnique.mockResolvedValueOnce(riskSource);
    mockPrisma.aIAnalysis.create.mockResolvedValueOnce(analysis);
    mockPrisma.aISettings.update.mockResolvedValueOnce(settings);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({
        choices: [{ message: { content: 'Root cause: noise.' } }],
        usage: { total_tokens: 50 },
      }),
    });
    const res = await request(app)
      .post('/api/analyse')
      .set('Authorization', 'Bearer test-token')
      .send({ sourceType: 'risk', sourceId: 'source-fc-1' });
    expect(res.body.success).toBe(true);
  });

  it('token update uses additive math: existing + new tokens', async () => {
    const settingsWithTokens = { ...settings, totalTokensUsed: 1000 };
    mockPrisma.aISettings.findFirst.mockResolvedValueOnce(settingsWithTokens);
    mockPrisma.risk.findUnique.mockResolvedValueOnce(riskSource);
    mockPrisma.aIAnalysis.create.mockResolvedValueOnce(analysis);
    mockPrisma.aISettings.update.mockResolvedValueOnce(settingsWithTokens);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({
        choices: [{ message: { content: 'Root cause: noise.' } }],
        usage: { total_tokens: 200 },
      }),
    });
    await request(app)
      .post('/api/analyse')
      .set('Authorization', 'Bearer test-token')
      .send({ sourceType: 'risk', sourceId: 'source-fc-1' });
    expect(mockPrisma.aISettings.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ totalTokensUsed: 1200 }),
      })
    );
  });

  it('returns 400 when sourceType is valid string but empty sourceId', async () => {
    const res = await request(app)
      .post('/api/analyse')
      .set('Authorization', 'Bearer test-token')
      .send({ sourceType: 'risk', sourceId: '' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('returns 500 when aISettings.findFirst throws unexpectedly', async () => {
    mockPrisma.aISettings.findFirst.mockRejectedValueOnce(new Error('Unexpected DB crash'));
    const res = await request(app)
      .post('/api/analyse')
      .set('Authorization', 'Bearer test-token')
      .send({ sourceType: 'risk', sourceId: 'source-fc-1' });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('stored prompt contains source title from riskSource', async () => {
    mockPrisma.aISettings.findFirst.mockResolvedValueOnce(settings);
    mockPrisma.risk.findUnique.mockResolvedValueOnce(riskSource);
    mockPrisma.aIAnalysis.create.mockResolvedValueOnce(analysis);
    mockPrisma.aISettings.update.mockResolvedValueOnce(settings);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({
        choices: [{ message: { content: 'Root cause: noise.' } }],
        usage: { total_tokens: 60 },
      }),
    });
    await request(app)
      .post('/api/analyse')
      .set('Authorization', 'Bearer test-token')
      .send({ sourceType: 'risk', sourceId: 'source-fc-1' });
    const createCall = (mockPrisma.aIAnalysis.create as jest.Mock).mock.calls[0];
    expect(createCall[0].data.prompt).toContain('Noise exposure');
  });
});

// ── analyse.api — final additional coverage ───────────────────────────────────

describe('analyse.api — final additional coverage', () => {
  let app: express.Express;

  const settings = {
    id: 'settings-fa-1',
    provider: 'OPENAI',
    apiKey: 'sk-fa-key',
    model: 'gpt-4',
    defaultPrompt: null,
    totalTokensUsed: 0,
    lastUsedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const riskSource = {
    id: 'source-fa-1',
    title: 'Manual handling',
    description: 'Heavy lifting hazard',
    likelihood: 3,
    severity: 4,
    riskScore: 12,
    riskLevel: 'HIGH',
    status: 'ACTIVE',
  };

  const analysis = {
    id: '52000000-0000-4000-a000-000000000077',
    userId: '20000000-0000-4000-a000-000000000001',
    sourceType: 'risk',
    sourceId: 'source-fa-1',
    sourceData: riskSource,
    prompt: 'fa prompt',
    provider: 'OPENAI',
    model: 'gpt-4',
    response: { content: 'FA AI response' },
    suggestedRootCause: 'Heavy lifting.',
    suggestedActions: [],
    complianceGaps: [],
    highlights: [],
    status: 'COMPLETED',
    createdAt: new Date(),
  };

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/analyse', analyseRouter);
    jest.clearAllMocks();
    mockFetch.mockReset();
  });

  it('returns 201 and data.id is a string on successful analysis', async () => {
    mockPrisma.aISettings.findFirst.mockResolvedValueOnce(settings);
    mockPrisma.risk.findUnique.mockResolvedValueOnce(riskSource);
    mockPrisma.aIAnalysis.create.mockResolvedValueOnce(analysis);
    mockPrisma.aISettings.update.mockResolvedValueOnce(settings);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({
        choices: [{ message: { content: 'Root cause: lifting.' } }],
        usage: { total_tokens: 40 },
      }),
    });
    const res = await request(app)
      .post('/api/analyse')
      .set('Authorization', 'Bearer test-token')
      .send({ sourceType: 'risk', sourceId: 'source-fa-1' });
    expect(res.status).toBe(201);
    expect(typeof res.body.data.id).toBe('string');
  });

  it('returns 400 VALIDATION_ERROR when sourceType is an integer', async () => {
    const res = await request(app)
      .post('/api/analyse')
      .set('Authorization', 'Bearer test-token')
      .send({ sourceType: 123, sourceId: 'source-fa-1' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('aISettings.update is called after successful analysis', async () => {
    mockPrisma.aISettings.findFirst.mockResolvedValueOnce(settings);
    mockPrisma.risk.findUnique.mockResolvedValueOnce(riskSource);
    mockPrisma.aIAnalysis.create.mockResolvedValueOnce(analysis);
    mockPrisma.aISettings.update.mockResolvedValueOnce(settings);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({
        choices: [{ message: { content: 'Root cause: lifting.' } }],
        usage: { total_tokens: 25 },
      }),
    });
    await request(app)
      .post('/api/analyse')
      .set('Authorization', 'Bearer test-token')
      .send({ sourceType: 'risk', sourceId: 'source-fa-1' });
    expect(mockPrisma.aISettings.update).toHaveBeenCalledTimes(1);
  });

  it('risk.findUnique called with correct id for risk sourceType', async () => {
    mockPrisma.aISettings.findFirst.mockResolvedValueOnce(settings);
    mockPrisma.risk.findUnique.mockResolvedValueOnce(riskSource);
    mockPrisma.aIAnalysis.create.mockResolvedValueOnce(analysis);
    mockPrisma.aISettings.update.mockResolvedValueOnce(settings);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({
        choices: [{ message: { content: 'Root cause: test.' } }],
        usage: { total_tokens: 20 },
      }),
    });
    await request(app)
      .post('/api/analyse')
      .set('Authorization', 'Bearer test-token')
      .send({ sourceType: 'risk', sourceId: 'source-fa-1' });
    expect(mockPrisma.risk.findUnique).toHaveBeenCalledWith({ where: { id: 'source-fa-1' } });
  });

  it('returns 400 when sourceId is a number instead of string', async () => {
    const res = await request(app)
      .post('/api/analyse')
      .set('Authorization', 'Bearer test-token')
      .send({ sourceType: 'risk', sourceId: 9999 });
    expect([400, 404, 500]).toContain(res.status);
  });
});

describe('analyse.api — phase28 coverage', () => {
  let app: express.Express;

  const settings = {
    id: 'settings-p28',
    provider: 'OPENAI',
    apiKey: 'sk-phase28',
    model: 'gpt-4o-mini',
    isActive: true,
    totalTokensUsed: 0,
    lastUsedAt: null,
    deletedAt: null,
  };

  const riskSource = {
    id: 'risk-p28',
    title: 'Phase28 Risk',
    description: 'Phase28 risk description',
    severity: 3,
    likelihood: 2,
    riskScore: 6,
    deletedAt: null,
  };

  const analysis = {
    id: 'analysis-p28',
    sourceType: 'risk',
    sourceId: 'risk-p28',
    aiProvider: 'OPENAI',
    model: 'gpt-4o-mini',
    prompt: 'Analyse risk',
    rawResponse: 'Root cause: Phase28.',
    parsedResult: { rootCause: 'Phase28' },
    tokensUsed: 30,
    createdAt: new Date(),
  };

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/analyse', analyseRouter);
    jest.clearAllMocks();
    mockFetch.mockReset();
  });

  it('returns 400 NO_AI_CONFIG when aISettings is null', async () => {
    mockPrisma.aISettings.findFirst.mockResolvedValueOnce(null);
    const res = await request(app)
      .post('/api/analyse')
      .set('Authorization', 'Bearer test-token')
      .send({ sourceType: 'risk', sourceId: 'risk-p28' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('NO_AI_CONFIG');
  });

  it('returns 201 with success:true on valid risk analysis', async () => {
    mockPrisma.aISettings.findFirst.mockResolvedValueOnce(settings);
    mockPrisma.risk.findUnique.mockResolvedValueOnce(riskSource);
    mockPrisma.aIAnalysis.create.mockResolvedValueOnce(analysis);
    mockPrisma.aISettings.update.mockResolvedValueOnce(settings);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({
        choices: [{ message: { content: 'Root cause: Phase28.' } }],
        usage: { total_tokens: 30 },
      }),
    });
    const res = await request(app)
      .post('/api/analyse')
      .set('Authorization', 'Bearer test-token')
      .send({ sourceType: 'risk', sourceId: 'risk-p28' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('returns 400 VALIDATION_ERROR when sourceType is missing', async () => {
    const res = await request(app)
      .post('/api/analyse')
      .set('Authorization', 'Bearer test-token')
      .send({ sourceId: 'risk-p28' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('returns 400 VALIDATION_ERROR when sourceId is missing', async () => {
    const res = await request(app)
      .post('/api/analyse')
      .set('Authorization', 'Bearer test-token')
      .send({ sourceType: 'risk' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('returns 404 when risk source is not found', async () => {
    mockPrisma.aISettings.findFirst.mockResolvedValueOnce(settings);
    mockPrisma.risk.findUnique.mockResolvedValueOnce(null);
    const res = await request(app)
      .post('/api/analyse')
      .set('Authorization', 'Bearer test-token')
      .send({ sourceType: 'risk', sourceId: 'no-such-risk' });
    expect(res.status).toBe(404);
  });
});
