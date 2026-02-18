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

const mockPrisma = prisma as any;

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
});
