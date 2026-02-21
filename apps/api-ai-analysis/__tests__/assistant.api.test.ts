import express from 'express';
import request from 'supertest';

const mockFetch = jest.fn();
global.fetch = mockFetch;

jest.mock('../src/prisma', () => ({
  prisma: {
    aISettings: {
      findFirst: jest.fn(),
    },
  },
}));

jest.mock('@ims/resilience', () => ({
  createCircuitBreaker: (fn: any) => ({
    fire: fn,
    on: () => {},
  }),
}));

jest.mock('@ims/auth', () => ({
  authenticate: (_req: any, _res: any, next: any) => next(),
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
  metricsMiddleware: () => (_req: any, _res: any, next: any) => next(),
  metricsHandler: (_req: any, res: any) => res.json({}),
  correlationIdMiddleware: () => (_req: any, _res: any, next: any) => next(),
  createHealthCheck: () => (_req: any, res: any) => res.json({ status: 'ok' }),
}));

jest.mock('@ims/validation', () => ({
  sanitizeMiddleware: () => (_req: any, _res: any, next: any) => next(),
  sanitizeQueryMiddleware: () => (_req: any, _res: any, next: any) => next(),
}));

jest.mock('@ims/service-auth', () => ({
  optionalServiceAuth: (_req: any, _res: any, next: any) => next(),
}));

jest.mock('@ims/rbac', () => ({
  attachPermissions: () => (_req: any, _res: any, next: any) => next(),
}));

import assistantRouter from '../src/routes/assistant';
const { prisma } = require('../src/prisma');

function createApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/assistant', assistantRouter);
  return app;
}

describe('POST /api/assistant', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockReset();
  });

  it('returns FAQ answer for matching question', async () => {
    const app = createApp();
    const res = await request(app)
      .post('/api/assistant')
      .send({ question: 'How many modules does Nexara have?' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.answer).toContain('42+');
  });

  it('returns FAQ answer for ISO standards question', async () => {
    const app = createApp();
    const res = await request(app)
      .post('/api/assistant')
      .send({ question: 'What ISO standards are supported?' });

    expect(res.status).toBe(200);
    expect(res.body.data.answer).toContain('ISO 45001');
    expect(res.body.data.answer).toContain('ISO 14001');
  });

  it('returns FAQ answer for CAPA question', async () => {
    const app = createApp();
    const res = await request(app).post('/api/assistant').send({ question: 'What is CAPA?' });

    expect(res.status).toBe(200);
    expect(res.body.data.answer).toContain('Corrective and Preventive Action');
  });

  it('returns module-based answer for relevant keywords', async () => {
    const app = createApp();
    prisma.aISettings.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/assistant')
      .send({ question: 'Tell me about inventory management features' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.answer).toBeTruthy();
    expect(res.body.data.suggestedModules).toBeDefined();
  });

  it('uses AI provider when available', async () => {
    const app = createApp();
    prisma.aISettings.findFirst.mockResolvedValue({
      provider: 'OPENAI',
      apiKey: 'sk-test',
      model: 'gpt-4o-mini',
      isActive: true,
    });

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: 'AI-generated answer about inventory' } }],
      }),
    });

    const res = await request(app)
      .post('/api/assistant')
      .send({ question: 'How do I track spare parts?' });

    expect(res.status).toBe(200);
    expect(res.body.data.answer).toBe('AI-generated answer about inventory');
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.openai.com/v1/chat/completions',
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('falls back to module KB when AI provider fails', async () => {
    const app = createApp();
    prisma.aISettings.findFirst.mockResolvedValue({
      provider: 'OPENAI',
      apiKey: 'sk-test',
      model: 'gpt-4o-mini',
      isActive: true,
    });

    mockFetch.mockRejectedValue(new Error('Network error'));

    const res = await request(app)
      .post('/api/assistant')
      .send({ question: 'Tell me about payroll features' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.answer).toBeTruthy();
  });

  it('returns generic fallback for unknown topics', async () => {
    const app = createApp();
    prisma.aISettings.findFirst.mockResolvedValue(null);

    const res = await request(app).post('/api/assistant').send({ question: 'xyzzy' });

    expect(res.status).toBe(200);
    expect(res.body.data.answer).toContain('not sure');
  });

  it('validates empty question', async () => {
    const app = createApp();
    const res = await request(app).post('/api/assistant').send({ question: '' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('validates missing question field', async () => {
    const app = createApp();
    const res = await request(app).post('/api/assistant').send({});

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('handles Anthropic provider', async () => {
    const app = createApp();
    prisma.aISettings.findFirst.mockResolvedValue({
      provider: 'ANTHROPIC',
      apiKey: 'sk-ant-test',
      model: 'claude-sonnet-4-5-20250929',
      isActive: true,
    });

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        content: [{ text: 'Anthropic answer about risk management' }],
      }),
    });

    const res = await request(app)
      .post('/api/assistant')
      .send({ question: 'How does risk management work?' });

    expect(res.status).toBe(200);
    expect(res.body.data.answer).toBe('Anthropic answer about risk management');
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.anthropic.com/v1/messages',
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('accepts optional context parameter', async () => {
    const app = createApp();
    const res = await request(app)
      .post('/api/assistant')
      .send({ question: 'What is CAPA?', context: 'Step 2 of wizard' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('returns suggestedModules in response', async () => {
    const app = createApp();
    const res = await request(app)
      .post('/api/assistant')
      .send({ question: 'How many modules does Nexara have?' });

    expect(res.status).toBe(200);
    expect(res.body.data.suggestedModules).toBeDefined();
    expect(Array.isArray(res.body.data.suggestedModules)).toBe(true);
  });

  it('answer is always a string', async () => {
    const app = createApp();
    prisma.aISettings.findFirst.mockResolvedValue(null);
    const res = await request(app)
      .post('/api/assistant')
      .send({ question: 'What is ISO 9001?' });
    expect(res.status).toBe(200);
    expect(typeof res.body.data.answer).toBe('string');
  });

  it('findFirst is called once per request for non-FAQ questions', async () => {
    const app = createApp();
    prisma.aISettings.findFirst.mockResolvedValue(null);
    await request(app).post('/api/assistant').send({ question: 'Tell me about inventory management features' });
    expect(prisma.aISettings.findFirst).toHaveBeenCalledTimes(1);
  });
});

describe('AI Assistant — extended', () => {
  it('returns 200 with a non-empty answer for payroll keyword without AI provider', async () => {
    const app = createApp();
    prisma.aISettings.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/assistant')
      .send({ question: 'How does payroll processing work?' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.answer.length).toBeGreaterThan(0);
  });
});
