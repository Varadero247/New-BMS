import express from 'express';
import request from 'supertest';

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
      req.user = {
        id: '20000000-0000-4000-a000-000000000001',
        email: 'admin@ims.local',
        role: 'ADMIN',
      };
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

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid-456'),
}));

import { prisma } from '../src/prisma';
import settingsRouter from '../src/routes/settings';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const mockExistingSettings = {
  id: 'settings-1',
  provider: 'OPENAI',
  apiKey: 'sk-real-api-key-abc123',
  model: 'gpt-4',
  defaultPrompt: 'Analyse this data',
  totalTokensUsed: 1200,
  lastUsedAt: new Date('2024-06-15'),
  createdAt: new Date('2024-01-01'),
};

describe('AI Settings API Routes', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/settings', settingsRouter);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // -------------------------------------------------------
  // 1. GET /api/settings returns 401 without auth
  // -------------------------------------------------------
  it('GET /api/settings returns 401 without auth', async () => {
    const response = await request(app).get('/api/settings');

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('UNAUTHORIZED');
  });

  // -------------------------------------------------------
  // 2. GET /api/settings returns default when no settings exist
  // -------------------------------------------------------
  it('GET /api/settings returns default when no settings exist', async () => {
    mockPrisma.aISettings.findFirst.mockResolvedValueOnce(null);

    const response = await request(app)
      .get('/api/settings')
      .set('Authorization', 'Bearer test-token');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.provider).toBeNull();
    expect(response.body.data.model).toBeNull();
    expect(response.body.data.hasApiKey).toBe(false);
    expect(response.body.data.defaultPrompt).toBeNull();
    expect(response.body.data.totalTokensUsed).toBe(0);
    expect(response.body.data.lastUsedAt).toBeNull();
  });

  // -------------------------------------------------------
  // 3. GET /api/settings returns settings with masked API key
  // -------------------------------------------------------
  it('GET /api/settings returns settings with masked API key', async () => {
    mockPrisma.aISettings.findFirst.mockResolvedValueOnce(mockExistingSettings);

    const response = await request(app)
      .get('/api/settings')
      .set('Authorization', 'Bearer test-token');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.id).toBe('settings-1');
    expect(response.body.data.provider).toBe('OPENAI');
    expect(response.body.data.model).toBe('gpt-4');
    expect(response.body.data.hasApiKey).toBe(true);
    expect(response.body.data.totalTokensUsed).toBe(1200);
    // The actual API key should never be exposed
    expect(response.body.data.apiKey).toBeUndefined();
  });

  // -------------------------------------------------------
  // 4. POST /api/settings returns 400 for missing provider
  // -------------------------------------------------------
  it('POST /api/settings returns 400 for missing provider', async () => {
    const response = await request(app)
      .post('/api/settings')
      .set('Authorization', 'Bearer test-token')
      .send({ apiKey: 'sk-test-key' });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  // -------------------------------------------------------
  // 5. POST /api/settings creates new settings
  // -------------------------------------------------------
  it('POST /api/settings creates new settings', async () => {
    const createdSettings = {
      id: 'mock-uuid-456',
      provider: 'OPENAI',
      apiKey: 'sk-new-key-xyz',
      model: 'gpt-4',
      defaultPrompt: null,
      totalTokensUsed: 0,
      lastUsedAt: null,
      createdAt: new Date(),
    };

    mockPrisma.aISettings.findFirst.mockResolvedValueOnce(null);
    mockPrisma.aISettings.create.mockResolvedValueOnce(createdSettings);

    const response = await request(app)
      .post('/api/settings')
      .set('Authorization', 'Bearer test-token')
      .send({ provider: 'OPENAI', apiKey: 'sk-new-key-xyz' });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.provider).toBe('OPENAI');
    expect(response.body.data.hasApiKey).toBe(true);
    expect(response.body.data.totalTokensUsed).toBe(0);
    expect(mockPrisma.aISettings.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        id: 'mock-uuid-456',
        provider: 'OPENAI',
        apiKey: 'sk-new-key-xyz',
        model: 'gpt-4',
        totalTokensUsed: 0,
      }),
    });
  });

  // -------------------------------------------------------
  // 6. POST /api/settings updates existing settings
  // -------------------------------------------------------
  it('POST /api/settings updates existing settings', async () => {
    const updatedSettings = {
      ...mockExistingSettings,
      provider: 'ANTHROPIC',
      apiKey: 'sk-ant-new-key',
      model: 'claude-3-sonnet-20240229',
    };

    mockPrisma.aISettings.findFirst.mockResolvedValueOnce(mockExistingSettings);
    mockPrisma.aISettings.update.mockResolvedValueOnce(updatedSettings);

    const response = await request(app)
      .post('/api/settings')
      .set('Authorization', 'Bearer test-token')
      .send({ provider: 'ANTHROPIC', apiKey: 'sk-ant-new-key' });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.provider).toBe('ANTHROPIC');
    expect(mockPrisma.aISettings.update).toHaveBeenCalledWith({
      where: { id: 'settings-1' },
      data: expect.objectContaining({
        provider: 'ANTHROPIC',
        apiKey: 'sk-ant-new-key',
        model: 'claude-3-sonnet-20240229',
      }),
    });
    expect(mockPrisma.aISettings.create).not.toHaveBeenCalled();
  });

  // -------------------------------------------------------
  // 7. POST /api/settings uses default model for OPENAI
  // -------------------------------------------------------
  it('POST /api/settings uses default model for OPENAI', async () => {
    const createdSettings = {
      id: 'mock-uuid-456',
      provider: 'OPENAI',
      apiKey: 'sk-openai-key',
      model: 'gpt-4',
      defaultPrompt: null,
      totalTokensUsed: 0,
    };

    mockPrisma.aISettings.findFirst.mockResolvedValueOnce(null);
    mockPrisma.aISettings.create.mockResolvedValueOnce(createdSettings);

    await request(app)
      .post('/api/settings')
      .set('Authorization', 'Bearer test-token')
      .send({ provider: 'OPENAI', apiKey: 'sk-openai-key' });

    expect(mockPrisma.aISettings.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        model: 'gpt-4',
      }),
    });
  });

  // -------------------------------------------------------
  // 8. POST /api/settings uses default model for ANTHROPIC
  // -------------------------------------------------------
  it('POST /api/settings uses default model for ANTHROPIC', async () => {
    const createdSettings = {
      id: 'mock-uuid-456',
      provider: 'ANTHROPIC',
      apiKey: 'sk-ant-key',
      model: 'claude-3-sonnet-20240229',
      defaultPrompt: null,
      totalTokensUsed: 0,
    };

    mockPrisma.aISettings.findFirst.mockResolvedValueOnce(null);
    mockPrisma.aISettings.create.mockResolvedValueOnce(createdSettings);

    await request(app)
      .post('/api/settings')
      .set('Authorization', 'Bearer test-token')
      .send({ provider: 'ANTHROPIC', apiKey: 'sk-ant-key' });

    expect(mockPrisma.aISettings.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        model: 'claude-3-sonnet-20240229',
      }),
    });
  });

  // -------------------------------------------------------
  // 9. POST /api/settings uses custom model when provided
  // -------------------------------------------------------
  it('POST /api/settings uses custom model when provided', async () => {
    const createdSettings = {
      id: 'mock-uuid-456',
      provider: 'OPENAI',
      apiKey: 'sk-openai-key',
      model: 'gpt-4-turbo',
      defaultPrompt: null,
      totalTokensUsed: 0,
    };

    mockPrisma.aISettings.findFirst.mockResolvedValueOnce(null);
    mockPrisma.aISettings.create.mockResolvedValueOnce(createdSettings);

    await request(app)
      .post('/api/settings')
      .set('Authorization', 'Bearer test-token')
      .send({ provider: 'OPENAI', apiKey: 'sk-openai-key', model: 'gpt-4-turbo' });

    expect(mockPrisma.aISettings.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        model: 'gpt-4-turbo',
      }),
    });
  });

  // -------------------------------------------------------
  // 10. DELETE /api/settings deletes all settings
  // -------------------------------------------------------
  it('DELETE /api/settings deletes all settings', async () => {
    mockPrisma.aISettings.deleteMany.mockResolvedValueOnce({ count: 1 });

    const response = await request(app)
      .delete('/api/settings')
      .set('Authorization', 'Bearer test-token');

    expect(response.status).toBe(204);
    expect(mockPrisma.aISettings.deleteMany).toHaveBeenCalled();
  });

  // -------------------------------------------------------
  // 11. POST /api/settings returns 400 for invalid input
  // -------------------------------------------------------
  it('POST /api/settings returns 400 for invalid input', async () => {
    const response = await request(app)
      .post('/api/settings')
      .set('Authorization', 'Bearer test-token')
      .send({ provider: 'INVALID_PROVIDER', apiKey: 'sk-key' });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
    expect(response.body.error.fields).toBeDefined();
  });

  // -------------------------------------------------------
  // 12. GET /api/settings returns 500 on error
  // -------------------------------------------------------
  it('GET /api/settings returns 500 on error', async () => {
    mockPrisma.aISettings.findFirst.mockRejectedValueOnce(new Error('Database connection failed'));

    const response = await request(app)
      .get('/api/settings')
      .set('Authorization', 'Bearer test-token');

    expect(response.status).toBe(500);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('INTERNAL_ERROR');
    expect(response.body.error.message).toBe('Failed to get AI settings');
  });

  // -------------------------------------------------------
  // 13. findFirst is called once per GET
  // -------------------------------------------------------
  it('findFirst is called once per GET request', async () => {
    mockPrisma.aISettings.findFirst.mockResolvedValueOnce(null);
    await request(app).get('/api/settings').set('Authorization', 'Bearer test-token');
    expect(mockPrisma.aISettings.findFirst).toHaveBeenCalledTimes(1);
  });

  // -------------------------------------------------------
  // 14. deleteMany is called once per DELETE
  // -------------------------------------------------------
  it('deleteMany is called once per DELETE request', async () => {
    mockPrisma.aISettings.deleteMany.mockResolvedValueOnce({ count: 0 });
    await request(app).delete('/api/settings').set('Authorization', 'Bearer test-token');
    expect(mockPrisma.aISettings.deleteMany).toHaveBeenCalledTimes(1);
  });
});

describe('AI Settings — extended', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/settings', settingsRouter);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('POST /api/settings returns 500 when create throws', async () => {
    mockPrisma.aISettings.findFirst.mockResolvedValueOnce(null);
    mockPrisma.aISettings.create.mockRejectedValueOnce(new Error('DB connection error'));

    const response = await request(app)
      .post('/api/settings')
      .set('Authorization', 'Bearer test-token')
      .send({ provider: 'OPENAI', apiKey: 'sk-test-key' });

    expect(response.status).toBe(500);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('INTERNAL_ERROR');
  });
});

// ─── AI Settings — additional coverage ──────────────────────────────────────
describe('AI Settings — additional coverage', () => {
  let app: import('express').Express;

  beforeAll(() => {
    const express = require('express');
    app = express();
    app.use(express.json());
    const settingsRouter = require('../src/routes/settings').default;
    app.use('/api/settings', settingsRouter);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // 1. Auth enforcement: no Authorization header → 401
  it('GET /api/settings returns 401 without Authorization header', async () => {
    const res = await request(app).get('/api/settings');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  // 2. Missing/invalid fields: missing apiKey in POST body
  it('POST /api/settings returns 400 VALIDATION_ERROR when apiKey is missing', async () => {
    const res = await request(app)
      .post('/api/settings')
      .set('Authorization', 'Bearer valid-token')
      .send({ provider: 'OPENAI' }); // no apiKey
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  // 3. Empty results: GET returns hasApiKey:false and totalTokensUsed:0 when no record exists
  it('GET /api/settings hasApiKey is false and totalTokensUsed is 0 when no settings found', async () => {
    mockPrisma.aISettings.findFirst.mockResolvedValueOnce(null);
    const res = await request(app)
      .get('/api/settings')
      .set('Authorization', 'Bearer valid-token');
    expect(res.status).toBe(200);
    expect(res.body.data.hasApiKey).toBe(false);
    expect(res.body.data.totalTokensUsed).toBe(0);
  });

  // 4. DB error handling: update throws → 500
  it('POST /api/settings returns 500 when update throws', async () => {
    mockPrisma.aISettings.findFirst.mockResolvedValueOnce(mockExistingSettings);
    mockPrisma.aISettings.update.mockRejectedValueOnce(new Error('Deadlock detected'));
    const res = await request(app)
      .post('/api/settings')
      .set('Authorization', 'Bearer valid-token')
      .send({ provider: 'OPENAI', apiKey: 'sk-new-key' });
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  // 5. Positive case: DELETE returns 204 even when no record exists (deleteMany count 0)
  it('DELETE /api/settings returns 204 when no settings to delete', async () => {
    mockPrisma.aISettings.deleteMany.mockResolvedValueOnce({ count: 0 });
    const res = await request(app)
      .delete('/api/settings')
      .set('Authorization', 'Bearer valid-token');
    expect(res.status).toBe(204);
    expect(mockPrisma.aISettings.deleteMany).toHaveBeenCalledTimes(1);
  });
});

// ── AI Settings — further edge cases ─────────────────────────────────────

describe('AI Settings — further edge cases', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/settings', settingsRouter);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /api/settings returns 200 and hasApiKey:true when existing settings found', async () => {
    mockPrisma.aISettings.findFirst.mockResolvedValueOnce(mockExistingSettings);
    const res = await request(app)
      .get('/api/settings')
      .set('Authorization', 'Bearer test-token');
    expect(res.status).toBe(200);
    expect(res.body.data.hasApiKey).toBe(true);
  });

  it('GET /api/settings does not return apiKey field in response', async () => {
    mockPrisma.aISettings.findFirst.mockResolvedValueOnce(mockExistingSettings);
    const res = await request(app)
      .get('/api/settings')
      .set('Authorization', 'Bearer test-token');
    expect(res.status).toBe(200);
    expect(res.body.data.apiKey).toBeUndefined();
  });

  it('POST /api/settings uses GROK default model when no model provided', async () => {
    const createdSettings = {
      id: 'mock-uuid-456',
      provider: 'GROK',
      apiKey: 'grok-api-key',
      model: 'grok-beta',
      defaultPrompt: null,
      totalTokensUsed: 0,
    };
    mockPrisma.aISettings.findFirst.mockResolvedValueOnce(null);
    mockPrisma.aISettings.create.mockResolvedValueOnce(createdSettings);
    await request(app)
      .post('/api/settings')
      .set('Authorization', 'Bearer test-token')
      .send({ provider: 'GROK', apiKey: 'grok-api-key' });
    expect(mockPrisma.aISettings.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ model: 'grok-beta' }),
    });
  });

  it('POST /api/settings stores defaultPrompt when provided', async () => {
    const createdSettings = {
      id: 'mock-uuid-456',
      provider: 'OPENAI',
      apiKey: 'sk-key',
      model: 'gpt-4',
      defaultPrompt: 'Custom system prompt',
      totalTokensUsed: 0,
    };
    mockPrisma.aISettings.findFirst.mockResolvedValueOnce(null);
    mockPrisma.aISettings.create.mockResolvedValueOnce(createdSettings);
    const res = await request(app)
      .post('/api/settings')
      .set('Authorization', 'Bearer test-token')
      .send({ provider: 'OPENAI', apiKey: 'sk-key', defaultPrompt: 'Custom system prompt' });
    expect(res.status).toBe(200);
    expect(mockPrisma.aISettings.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ defaultPrompt: 'Custom system prompt' }),
    });
  });

  it('DELETE /api/settings returns 500 when deleteMany throws', async () => {
    mockPrisma.aISettings.deleteMany.mockRejectedValueOnce(new Error('DB error'));
    const res = await request(app)
      .delete('/api/settings')
      .set('Authorization', 'Bearer test-token');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('POST /api/settings response has hasApiKey:true after create', async () => {
    const createdSettings = {
      id: 'mock-uuid-456',
      provider: 'OPENAI',
      apiKey: 'sk-brand-new-key',
      model: 'gpt-4',
      defaultPrompt: null,
      totalTokensUsed: 0,
    };
    mockPrisma.aISettings.findFirst.mockResolvedValueOnce(null);
    mockPrisma.aISettings.create.mockResolvedValueOnce(createdSettings);
    const res = await request(app)
      .post('/api/settings')
      .set('Authorization', 'Bearer test-token')
      .send({ provider: 'OPENAI', apiKey: 'sk-brand-new-key' });
    expect(res.status).toBe(200);
    expect(res.body.data.hasApiKey).toBe(true);
  });

  it('POST /api/settings response does not expose raw apiKey after update', async () => {
    const updatedSettings = { ...mockExistingSettings, provider: 'OPENAI', apiKey: 'sk-secret-key' };
    mockPrisma.aISettings.findFirst.mockResolvedValueOnce(mockExistingSettings);
    mockPrisma.aISettings.update.mockResolvedValueOnce(updatedSettings);
    const res = await request(app)
      .post('/api/settings')
      .set('Authorization', 'Bearer test-token')
      .send({ provider: 'OPENAI', apiKey: 'sk-secret-key' });
    expect(res.status).toBe(200);
    const bodyStr = JSON.stringify(res.body);
    expect(bodyStr).not.toContain('sk-secret-key');
  });

  it('GET /api/settings response includes lastUsedAt when settings exist', async () => {
    mockPrisma.aISettings.findFirst.mockResolvedValueOnce(mockExistingSettings);
    const res = await request(app)
      .get('/api/settings')
      .set('Authorization', 'Bearer test-token');
    expect(res.status).toBe(200);
    expect(res.body.data.lastUsedAt).toBeDefined();
  });

  it('POST /api/settings returns 400 for empty string apiKey', async () => {
    const res = await request(app)
      .post('/api/settings')
      .set('Authorization', 'Bearer test-token')
      .send({ provider: 'OPENAI', apiKey: '' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});

// ── AI Settings — final additional coverage ─────────────────────────────────

describe('AI Settings — final additional coverage', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/settings', settingsRouter);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('response body always has success property on GET', async () => {
    mockPrisma.aISettings.findFirst.mockResolvedValueOnce(null);
    const res = await request(app).get('/api/settings').set('Authorization', 'Bearer test-token');
    expect(res.body).toHaveProperty('success');
  });

  it('GET /api/settings 200 response data has id field when settings exist', async () => {
    mockPrisma.aISettings.findFirst.mockResolvedValueOnce(mockExistingSettings);
    const res = await request(app).get('/api/settings').set('Authorization', 'Bearer test-token');
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('settings-1');
  });

  it('POST /api/settings response data has provider field after create', async () => {
    const created = { id: 'new-1', provider: 'GROK', apiKey: 'grok-k', model: 'grok-beta', defaultPrompt: null, totalTokensUsed: 0, lastUsedAt: null, createdAt: new Date() };
    mockPrisma.aISettings.findFirst.mockResolvedValueOnce(null);
    mockPrisma.aISettings.create.mockResolvedValueOnce(created);
    const res = await request(app)
      .post('/api/settings')
      .set('Authorization', 'Bearer test-token')
      .send({ provider: 'GROK', apiKey: 'grok-k' });
    expect(res.status).toBe(200);
    expect(res.body.data.provider).toBe('GROK');
  });

  it('DELETE /api/settings returns 401 without auth', async () => {
    const res = await request(app).delete('/api/settings');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('POST /api/settings returns 401 without auth', async () => {
    const res = await request(app).post('/api/settings').send({ provider: 'OPENAI', apiKey: 'sk-key' });
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('GET /api/settings response data totalTokensUsed is a number when settings exist', async () => {
    mockPrisma.aISettings.findFirst.mockResolvedValueOnce(mockExistingSettings);
    const res = await request(app).get('/api/settings').set('Authorization', 'Bearer test-token');
    expect(res.status).toBe(200);
    expect(typeof res.body.data.totalTokensUsed).toBe('number');
  });

  it('DELETE /api/settings returns 500 when deleteMany rejects', async () => {
    mockPrisma.aISettings.deleteMany.mockRejectedValueOnce(new Error('Transaction failed'));
    const res = await request(app).delete('/api/settings').set('Authorization', 'Bearer test-token');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});
