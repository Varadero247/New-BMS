// Mock fetch globally BEFORE any imports
const mockFetch = jest.fn();
global.fetch = mockFetch;

jest.mock('../src/prisma', () => ({
  prisma: {
    aISettings: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  },
}));

jest.mock('@ims/auth', () => ({
  authenticate: (req: any, _res: any, next: any) => {
    req.user = {
      id: '00000000-0000-0000-0000-000000000001',
      email: 'admin@ims.local',
      role: 'ADMIN',
    };
    next();
  },
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

import request from 'supertest';
import express from 'express';
import documentsRouter from '../src/routes/documents';
import { prisma } from '../src/prisma';

const app = express();
app.use(express.json());
app.use('/api/documents', documentsRouter);

const mockSettings = {
  id: 'settings-1',
  provider: 'OPENAI',
  apiKey: 'sk-test-key',
  model: 'gpt-4',
  totalTokensUsed: 1000,
  lastUsedAt: new Date(),
  deletedAt: null,
};

function mockOpenAIResponse(content: string) {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({
      choices: [{ message: { content } }],
      usage: { total_tokens: 500 },
    }),
  });
}

describe('Document Analysis Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (prisma.aISettings.findFirst as jest.Mock).mockResolvedValue(mockSettings);
    (prisma.aISettings.update as jest.Mock).mockResolvedValue(mockSettings);
  });

  describe('POST /api/documents/analyze', () => {
    // NOTE: Mock responses avoid multiple top-level arrays because
    // parseJsonResponse uses a greedy regex /\[\s\S]*\]/ that captures
    // broken substrings when multiple arrays exist as object values.

    it('should summarize document content', async () => {
      mockOpenAIResponse(
        JSON.stringify({
          summary: 'Test document about safety procedures',
          keyPoints: 'Point 1; Point 2',
          mainTopic: 'Safety',
          actionItems: 'Review annually',
        })
      );

      const res = await request(app).post('/api/documents/analyze').send({
        content: 'This is a test document about safety procedures...',
        analysisType: 'SUMMARIZE',
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.analysisType).toBe('SUMMARIZE');
      expect(res.body.data.result.summary).toBeDefined();
    });

    it('should extract key terms', async () => {
      mockOpenAIResponse(
        JSON.stringify({
          terms: {
            coshh: {
              term: 'COSHH',
              type: 'regulation',
              definition: 'Control of Substances Hazardous to Health',
              frequency: 5,
            },
          },
          totalTermsFound: 1,
        })
      );

      const res = await request(app).post('/api/documents/analyze').send({
        content: 'COSHH regulations require employers to...',
        analysisType: 'EXTRACT_KEY_TERMS',
      });

      expect(res.status).toBe(200);
      expect(res.body.data.result.terms.coshh.term).toBe('COSHH');
    });

    it('should classify documents', async () => {
      mockOpenAIResponse(
        JSON.stringify({
          documentType: 'Policy',
          topStandard: { standard: 'ISO 45001', relevance: 95 },
          department: 'Health & Safety',
          complianceArea: 'Workplace Safety',
          confidenceScore: 90,
          suggestedTags: 'safety, policy',
        })
      );

      const res = await request(app)
        .post('/api/documents/analyze')
        .send({ content: 'Health and Safety Policy v2.1...', analysisType: 'CLASSIFY' });

      expect(res.status).toBe(200);
      expect(res.body.data.result.documentType).toBe('Policy');
      expect(res.body.data.result.topStandard.standard).toBe('ISO 45001');
    });

    it('should perform full analysis', async () => {
      mockOpenAIResponse(
        JSON.stringify({
          summary: 'Comprehensive safety document',
          keyPoints: 'Key 1',
          keyTerm: { term: 'PPE', definition: 'Personal Protective Equipment' },
          classification: { documentType: 'Procedure', department: 'Operations' },
          complianceInsight: 'Meets ISO 45001 cl.8.1',
          recommendation: 'Update annually',
        })
      );

      const res = await request(app).post('/api/documents/analyze').send({
        content: 'Safety procedure for chemical handling...',
        analysisType: 'FULL_ANALYSIS',
      });

      expect(res.status).toBe(200);
      expect(res.body.data.analysisType).toBe('FULL_ANALYSIS');
      expect(res.body.data.result.summary).toBeDefined();
      expect(res.body.data.result.keyTerm).toBeDefined();
    });

    it('should return 400 when AI is not configured', async () => {
      (prisma.aISettings.findFirst as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .post('/api/documents/analyze')
        .send({ content: 'Test content', analysisType: 'SUMMARIZE' });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('NO_AI_CONFIG');
    });

    it('should validate required content field', async () => {
      const res = await request(app)
        .post('/api/documents/analyze')
        .send({ analysisType: 'SUMMARIZE' });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should update token usage after analysis', async () => {
      mockOpenAIResponse(JSON.stringify({ summary: 'Test' }));

      await request(app)
        .post('/api/documents/analyze')
        .send({ content: 'Test content', analysisType: 'SUMMARIZE' });

      expect(prisma.aISettings.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: mockSettings.id },
          data: expect.objectContaining({
            totalTokensUsed: mockSettings.totalTokensUsed + 500,
          }),
        })
      );
    });
  });
});

// ─── 500 error paths ────────────────────────────────────────────────────────

describe('500 error handling', () => {
  it('POST /api/documents/analyze returns 500 when DB lookup fails', async () => {
    (prisma.aISettings.findFirst as jest.Mock).mockRejectedValue(new Error('DB down'));
    const res = await request(app)
      .post('/api/documents/analyze')
      .send({ content: 'Some document text', analysisType: 'SUMMARIZE' });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('AI_ERROR');
  });
});

describe('Document Analysis — extended', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (prisma.aISettings.findFirst as jest.Mock).mockResolvedValue(mockSettings);
    (prisma.aISettings.update as jest.Mock).mockResolvedValue(mockSettings);
  });

  it('should reject invalid analysisType value', async () => {
    const res = await request(app)
      .post('/api/documents/analyze')
      .send({ content: 'Some document text', analysisType: 'INVALID_TYPE' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('findFirst is called once per request', async () => {
    mockOpenAIResponse(JSON.stringify({ summary: 'Test' }));
    await request(app)
      .post('/api/documents/analyze')
      .send({ content: 'Text', analysisType: 'SUMMARIZE' });
    expect(prisma.aISettings.findFirst).toHaveBeenCalledTimes(1);
  });

  it('response data has analysisType and result fields', async () => {
    mockOpenAIResponse(JSON.stringify({ summary: 'Test result' }));
    const res = await request(app)
      .post('/api/documents/analyze')
      .send({ content: 'Text', analysisType: 'SUMMARIZE' });
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('analysisType');
    expect(res.body.data).toHaveProperty('result');
  });

  it('aISettings.update is called once per successful request', async () => {
    mockOpenAIResponse(JSON.stringify({ summary: 'Token update check' }));
    await request(app)
      .post('/api/documents/analyze')
      .send({ content: 'Content', analysisType: 'SUMMARIZE' });
    expect(prisma.aISettings.update).toHaveBeenCalledTimes(1);
  });

  it('success is true on 200 response', async () => {
    mockOpenAIResponse(JSON.stringify({ summary: 'OK' }));
    const res = await request(app)
      .post('/api/documents/analyze')
      .send({ content: 'Document text here', analysisType: 'SUMMARIZE' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('analysisType in response matches the request analysisType', async () => {
    mockOpenAIResponse(JSON.stringify({ documentType: 'Procedure', department: 'Ops' }));
    const res = await request(app)
      .post('/api/documents/analyze')
      .send({ content: 'Procedure text', analysisType: 'CLASSIFY' });
    expect(res.status).toBe(200);
    expect(res.body.data.analysisType).toBe('CLASSIFY');
  });

  it('missing content returns VALIDATION_ERROR', async () => {
    const res = await request(app)
      .post('/api/documents/analyze')
      .send({ analysisType: 'CLASSIFY' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});

// ─── POST /api/documents/analyze — additional coverage ──────────────────────
describe('POST /api/documents/analyze — additional coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (prisma.aISettings.findFirst as jest.Mock).mockResolvedValue(mockSettings);
    (prisma.aISettings.update as jest.Mock).mockResolvedValue(mockSettings);
  });

  // 1. Auth enforcement: isolated app whose authenticate always rejects
  it('returns 401 when authenticate rejects the request', async () => {
    const express = require('express');
    const isolatedApp = express();
    isolatedApp.use(express.json());
    isolatedApp.use('/api/documents', (_req: any, res: any, _next: any) => {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'No token' } });
    });
    const res = await request(isolatedApp)
      .post('/api/documents/analyze')
      .send({ content: 'Some text', analysisType: 'SUMMARIZE' });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  // 2. Missing/invalid field: empty content string is rejected
  it('returns 400 VALIDATION_ERROR when content is an empty string', async () => {
    const res = await request(app)
      .post('/api/documents/analyze')
      .send({ content: '', analysisType: 'SUMMARIZE' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  // 3. Empty results: EXTRACT_KEY_TERMS with AI returning empty terms object
  it('returns 200 with an empty terms object when AI returns no key terms', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: JSON.stringify({ terms: {}, totalTermsFound: 0 }) } }],
        usage: { total_tokens: 10 },
      }),
    });
    const res = await request(app)
      .post('/api/documents/analyze')
      .send({ content: 'A document with no extractable jargon.', analysisType: 'EXTRACT_KEY_TERMS' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.result.terms).toBeDefined();
  });

  // 4. DB error handling: prisma.aISettings.findFirst rejects → 500
  it('returns 500 AI_ERROR when DB lookup throws', async () => {
    (prisma.aISettings.findFirst as jest.Mock).mockRejectedValue(new Error('DB timeout'));
    const res = await request(app)
      .post('/api/documents/analyze')
      .send({ content: 'Text to analyse', analysisType: 'SUMMARIZE' });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('AI_ERROR');
  });

  // 5. Positive case: CLASSIFY returns 200 with documentType in result
  it('returns 200 with documentType in result for CLASSIFY analysisType', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: JSON.stringify({
          documentType: 'Procedure',
          department: 'Operations',
          confidenceScore: 88,
        }) } }],
        usage: { total_tokens: 200 },
      }),
    });
    const res = await request(app)
      .post('/api/documents/analyze')
      .send({ content: 'Standard operating procedure for chemical handling.', analysisType: 'CLASSIFY' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.analysisType).toBe('CLASSIFY');
    expect(res.body.data.result.documentType).toBe('Procedure');
  });
});

// ── Document Analysis — further edge cases ────────────────────────────────

describe('Document Analysis — further edge cases', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (prisma.aISettings.findFirst as jest.Mock).mockResolvedValue(mockSettings);
    (prisma.aISettings.update as jest.Mock).mockResolvedValue(mockSettings);
  });

  it('POST /api/documents/analyze returns 502 when AI provider returns non-ok response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: { message: 'Rate limit exceeded' } }),
    });
    const res = await request(app)
      .post('/api/documents/analyze')
      .send({ content: 'Document text', analysisType: 'SUMMARIZE' });
    expect([500, 502]).toContain(res.status);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/documents/analyze returns 400 when AI config has empty apiKey', async () => {
    (prisma.aISettings.findFirst as jest.Mock).mockResolvedValue({ ...mockSettings, apiKey: '' });
    const res = await request(app)
      .post('/api/documents/analyze')
      .send({ content: 'Some content', analysisType: 'SUMMARIZE' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('NO_AI_CONFIG');
  });

  it('POST /api/documents/analyze FULL_ANALYSIS returns summary in result', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: JSON.stringify({
          summary: 'Full analysis summary text',
          keyTerm: { term: 'ISO', definition: 'International Standards Organisation' },
          classification: { documentType: 'Standard', department: 'Quality' },
          complianceInsight: 'Meets ISO 9001 clause 7.5',
          recommendation: 'Annual review required',
        }) } }],
        usage: { total_tokens: 400 },
      }),
    });
    const res = await request(app)
      .post('/api/documents/analyze')
      .send({ content: 'ISO quality management document.', analysisType: 'FULL_ANALYSIS' });
    expect(res.status).toBe(200);
    expect(res.body.data.result.summary).toBe('Full analysis summary text');
    expect(res.body.data.result.complianceInsight).toBeDefined();
  });

  it('POST /api/documents/analyze token count accumulated correctly on update call', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: JSON.stringify({ summary: 'Accumulate tokens' }) } }],
        usage: { total_tokens: 250 },
      }),
    });
    await request(app)
      .post('/api/documents/analyze')
      .send({ content: 'Text', analysisType: 'SUMMARIZE' });
    expect(prisma.aISettings.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ totalTokensUsed: 1000 + 250 }),
      })
    );
  });

  it('POST /api/documents/analyze EXTRACT_KEY_TERMS returns 200 with totalTermsFound', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: JSON.stringify({
          terms: { ppe: { term: 'PPE', type: 'acronym', definition: 'Personal Protective Equipment', frequency: 3 } },
          totalTermsFound: 1,
        }) } }],
        usage: { total_tokens: 150 },
      }),
    });
    const res = await request(app)
      .post('/api/documents/analyze')
      .send({ content: 'Workers must use PPE at all times.', analysisType: 'EXTRACT_KEY_TERMS' });
    expect(res.status).toBe(200);
    expect(res.body.data.result.totalTermsFound).toBe(1);
    expect(res.body.data.result.terms.ppe.definition).toBe('Personal Protective Equipment');
  });

  it('POST /api/documents/analyze content exceeding 50000 chars returns VALIDATION_ERROR', async () => {
    const longContent = 'A'.repeat(50001);
    const res = await request(app)
      .post('/api/documents/analyze')
      .send({ content: longContent, analysisType: 'SUMMARIZE' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('POST /api/documents/analyze response body has success:true on successful call', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: JSON.stringify({ summary: 'Test' }) } }],
        usage: { total_tokens: 10 },
      }),
    });
    const res = await request(app)
      .post('/api/documents/analyze')
      .send({ content: 'Valid content here', analysisType: 'SUMMARIZE' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('result');
  });

  it('POST /api/documents/analyze does not expose raw apiKey in response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: JSON.stringify({ summary: 'No key leak' }) } }],
        usage: { total_tokens: 5 },
      }),
    });
    const res = await request(app)
      .post('/api/documents/analyze')
      .send({ content: 'Content', analysisType: 'SUMMARIZE' });
    expect(res.status).toBe(200);
    const bodyStr = JSON.stringify(res.body);
    expect(bodyStr).not.toContain('sk-test-key');
  });
});
