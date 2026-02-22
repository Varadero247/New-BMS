// Mock dependencies BEFORE imports
jest.mock('@ims/database', () => {
  const mockPrisma = {
    mktPlugin: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      count: jest.fn(),
      aggregate: jest.fn(),
    },
    mktPluginVersion: {
      findMany: jest.fn(),
      create: jest.fn(),
      updateMany: jest.fn(),
    },
    mktPluginInstall: {
      findMany: jest.fn(),
      upsert: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    mktWebhookSubscription: {
      create: jest.fn(),
    },
  };
  return { prisma: mockPrisma, PrismaClient: jest.fn(() => mockPrisma) };
});

jest.mock('@ims/auth', () => ({
  authenticate: (req: any, _res: any, next: any) => {
    req.user = {
      id: '00000000-0000-0000-0000-000000000001',
      email: 'admin@ims.local',
      role: 'ADMIN',
      organisationId: '00000000-0000-0000-0000-000000000099',
    };
    next();
  },
  requireRole: () => (_req: any, _res: any, next: any) => next(),
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
  metricsMiddleware: () => (_req: any, _res: any, next: any) => next(),
  metricsHandler: (_req: any, res: any) => res.json({}),
  correlationIdMiddleware: () => (_req: any, _res: any, next: any) => next(),
  createHealthCheck: () => (_req: any, res: any) => res.json({ status: 'ok' }),
}));

import request from 'supertest';
import express from 'express';
import marketplaceRouter from '../src/routes/marketplace';
import { prisma } from '@ims/database';
const mockPrisma = prisma as Record<string, jest.Mocked<Record<string, jest.Mock>>>;

const app = express();
app.use(express.json());
app.use('/api/marketplace', marketplaceRouter);

const mockPlugin = {
  id: '00000000-0000-0000-0000-000000000010',
  orgId: '00000000-0000-0000-0000-000000000099',
  name: 'Slack Integration',
  slug: 'slack-integration',
  description: 'Send IMS notifications to Slack',
  author: 'IMS Team',
  category: 'COMMUNICATION',
  isPublic: true,
  isVerified: false,
  status: 'PUBLISHED',
  downloads: 42,
  rating: 4.5,
  ratingCount: 10,
  deletedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  versions: [{ id: 'v1', version: '1.0.0', isLatest: true }],
  installs: [],
};

describe('Marketplace Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/marketplace/plugins', () => {
    it('should list plugins', async () => {
      mockPrisma.mktPlugin.findMany.mockResolvedValue([mockPlugin]);
      mockPrisma.mktPlugin.count.mockResolvedValue(1);

      const res = await request(app).get('/api/marketplace/plugins');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.meta.total).toBe(1);
    });

    it('should filter by category', async () => {
      mockPrisma.mktPlugin.findMany.mockResolvedValue([]);
      mockPrisma.mktPlugin.count.mockResolvedValue(0);

      const res = await request(app).get('/api/marketplace/plugins?category=INTEGRATION');
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(0);
    });

    it('should filter by search term', async () => {
      mockPrisma.mktPlugin.findMany.mockResolvedValue([mockPlugin]);
      mockPrisma.mktPlugin.count.mockResolvedValue(1);

      const res = await request(app).get('/api/marketplace/plugins?search=slack');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should paginate results', async () => {
      mockPrisma.mktPlugin.findMany.mockResolvedValue([]);
      mockPrisma.mktPlugin.count.mockResolvedValue(100);

      const res = await request(app).get('/api/marketplace/plugins?page=3&limit=10');
      expect(res.status).toBe(200);
      expect(res.body.meta.page).toBe(3);
      expect(res.body.meta.limit).toBe(10);
    });
  });

  describe('GET /api/marketplace/plugins/search', () => {
    it('should search plugins by query', async () => {
      mockPrisma.mktPlugin.findMany.mockResolvedValue([mockPlugin]);

      const res = await request(app).get('/api/marketplace/plugins/search?q=slack');
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
    });

    it('should require minimum 2 characters', async () => {
      const res = await request(app).get('/api/marketplace/plugins/search?q=a');
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /api/marketplace/plugins/:id', () => {
    it('should return plugin details with install status', async () => {
      mockPrisma.mktPlugin.findUnique.mockResolvedValue({ ...mockPlugin, installs: [] });

      const res = await request(app).get(`/api/marketplace/plugins/${mockPlugin.id}`);
      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('Slack Integration');
      expect(res.body.data.isInstalled).toBe(false);
    });

    it('should return 404 for non-existent plugin', async () => {
      mockPrisma.mktPlugin.findUnique.mockResolvedValue(null);

      const res = await request(app).get(
        '/api/marketplace/plugins/00000000-0000-0000-0000-000000000999'
      );
      expect(res.status).toBe(404);
    });

    it('should return 404 for soft-deleted plugin', async () => {
      mockPrisma.mktPlugin.findUnique.mockResolvedValue({
        ...mockPlugin,
        deletedAt: new Date(),
      });

      const res = await request(app).get(`/api/marketplace/plugins/${mockPlugin.id}`);
      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/marketplace/plugins', () => {
    it('should register a new plugin', async () => {
      mockPrisma.mktPlugin.findUnique.mockResolvedValue(null);
      mockPrisma.mktPlugin.create.mockResolvedValue(mockPlugin);

      const res = await request(app).post('/api/marketplace/plugins').send({
        name: 'Slack Integration',
        slug: 'slack-integration',
        description: 'Send IMS notifications to Slack',
        author: 'IMS Team',
        category: 'COMMUNICATION',
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Slack Integration');
    });

    it('should reject duplicate slug', async () => {
      mockPrisma.mktPlugin.findUnique.mockResolvedValue(mockPlugin);

      const res = await request(app).post('/api/marketplace/plugins').send({
        name: 'Slack Integration',
        slug: 'slack-integration',
        description: 'Duplicate',
        author: 'IMS Team',
        category: 'COMMUNICATION',
      });

      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe('CONFLICT');
    });

    it('should validate required fields', async () => {
      const res = await request(app).post('/api/marketplace/plugins').send({ name: 'Test' });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should validate slug format', async () => {
      const res = await request(app).post('/api/marketplace/plugins').send({
        name: 'Test',
        slug: 'INVALID SLUG!',
        description: 'Test',
        author: 'Test',
        category: 'OTHER',
      });

      expect(res.status).toBe(400);
    });
  });

  describe('PATCH /api/marketplace/plugins/:id', () => {
    it('should update plugin metadata', async () => {
      mockPrisma.mktPlugin.update.mockResolvedValue({ ...mockPlugin, name: 'Updated Name' });

      const res = await request(app)
        .patch(`/api/marketplace/plugins/${mockPlugin.id}`)
        .send({ name: 'Updated Name' });

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('Updated Name');
    });
  });

  describe('POST /api/marketplace/plugins/:id/versions', () => {
    it('should publish a new version', async () => {
      mockPrisma.mktPluginVersion.updateMany.mockResolvedValue({ count: 1 });
      mockPrisma.mktPluginVersion.create.mockResolvedValue({
        id: 'v2',
        pluginId: mockPlugin.id,
        version: '2.0.0',
        isLatest: true,
      });

      const res = await request(app)
        .post(`/api/marketplace/plugins/${mockPlugin.id}/versions`)
        .send({
          version: '2.0.0',
          changelog: 'Major update',
          manifest: { name: 'slack-integration', entry: 'index.js' },
        });

      expect(res.status).toBe(201);
      expect(res.body.data.version).toBe('2.0.0');
      expect(res.body.data.isLatest).toBe(true);
    });

    it('should validate semver format', async () => {
      const res = await request(app)
        .post(`/api/marketplace/plugins/${mockPlugin.id}/versions`)
        .send({ version: 'not-semver', manifest: {} });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/marketplace/plugins/:id/versions', () => {
    it('should list versions', async () => {
      mockPrisma.mktPluginVersion.findMany.mockResolvedValue([
        { id: 'v1', version: '1.0.0', isLatest: false },
        { id: 'v2', version: '2.0.0', isLatest: true },
      ]);

      const res = await request(app).get(`/api/marketplace/plugins/${mockPlugin.id}/versions`);
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(2);
    });
  });

  describe('POST /api/marketplace/plugins/:id/install', () => {
    it('should install plugin for org', async () => {
      mockPrisma.mktPlugin.findUnique.mockResolvedValue(mockPlugin);
      mockPrisma.mktPluginInstall.upsert.mockResolvedValue({
        id: 'inst-1',
        pluginId: mockPlugin.id,
        orgId: '00000000-0000-0000-0000-000000000099',
        status: 'ACTIVE',
      });
      mockPrisma.mktPlugin.update.mockResolvedValue(mockPlugin);

      const res = await request(app)
        .post(`/api/marketplace/plugins/${mockPlugin.id}/install`)
        .send({});

      expect(res.status).toBe(201);
      expect(res.body.data.status).toBe('ACTIVE');
    });

    it('should return 404 for non-existent plugin', async () => {
      mockPrisma.mktPlugin.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/marketplace/plugins/00000000-0000-0000-0000-000000000999/install')
        .send({});

      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/marketplace/plugins/:id/install', () => {
    it('should uninstall plugin', async () => {
      mockPrisma.mktPluginInstall.update.mockResolvedValue({ status: 'UNINSTALLED' });

      const res = await request(app).delete(`/api/marketplace/plugins/${mockPlugin.id}/install`);

      expect(res.status).toBe(200);
      expect(res.body.data.message).toBe('Plugin uninstalled');
    });
  });

  describe('POST /api/marketplace/plugins/:id/webhooks', () => {
    it('should register webhook subscription', async () => {
      mockPrisma.mktWebhookSubscription.create.mockResolvedValue({
        id: 'wh-1',
        pluginId: mockPlugin.id,
        event: 'ncr.created',
        targetUrl: 'https://hooks.example.com/callback',
        secret: 'whsec_abc123',
      });

      const res = await request(app)
        .post(`/api/marketplace/plugins/${mockPlugin.id}/webhooks`)
        .send({
          event: 'ncr.created',
          targetUrl: 'https://hooks.example.com/callback',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.secret).toBeDefined();
      expect(res.body.data.event).toBe('ncr.created');
    });

    it('should validate webhook URL', async () => {
      const res = await request(app)
        .post(`/api/marketplace/plugins/${mockPlugin.id}/webhooks`)
        .send({ event: 'ncr.created', targetUrl: 'not-a-url' });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/marketplace/stats', () => {
    it('should return marketplace statistics', async () => {
      mockPrisma.mktPlugin.count.mockResolvedValueOnce(50).mockResolvedValueOnce(35);
      mockPrisma.mktPluginInstall.count.mockResolvedValue(200);
      mockPrisma.mktPlugin.aggregate.mockResolvedValue({ _sum: { downloads: 5000 } });

      const res = await request(app).get('/api/marketplace/stats');
      expect(res.status).toBe(200);
      expect(res.body.data.totalPlugins).toBe(50);
      expect(res.body.data.publishedPlugins).toBe(35);
      expect(res.body.data.totalInstalls).toBe(200);
      expect(res.body.data.totalDownloads).toBe(5000);
    });
  });

  // ===================================================================
  // Additional coverage: pagination, 500 errors, filter wiring, validation
  // ===================================================================
  describe('Additional marketplace coverage', () => {
    it('GET /api/marketplace/plugins pagination returns correct page and total in meta', async () => {
      mockPrisma.mktPlugin.findMany.mockResolvedValue([]);
      mockPrisma.mktPlugin.count.mockResolvedValue(100);

      const res = await request(app).get('/api/marketplace/plugins?page=2&limit=10');
      expect(res.status).toBe(200);
      expect(res.body.meta.total).toBe(100);
      expect(res.body.meta.page).toBe(2);
      expect(res.body.meta.limit).toBe(10);
    });

    it('GET /api/marketplace/plugins filters by isPublic wired into findMany', async () => {
      mockPrisma.mktPlugin.findMany.mockResolvedValue([]);
      mockPrisma.mktPlugin.count.mockResolvedValue(0);

      const res = await request(app).get('/api/marketplace/plugins?isPublic=true');
      expect(res.status).toBe(200);
      expect(mockPrisma.mktPlugin.findMany).toHaveBeenCalled();
    });

    it('GET /api/marketplace/plugins returns 500 on DB error', async () => {
      mockPrisma.mktPlugin.findMany.mockRejectedValue(new Error('DB fail'));
      mockPrisma.mktPlugin.count.mockRejectedValue(new Error('DB fail'));

      const res = await request(app).get('/api/marketplace/plugins');
      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });

    it('POST /api/marketplace/plugins returns 500 on DB error', async () => {
      mockPrisma.mktPlugin.findUnique.mockResolvedValue(null);
      mockPrisma.mktPlugin.create.mockRejectedValue(new Error('DB fail'));

      const res = await request(app).post('/api/marketplace/plugins').send({
        name: 'Failing Plugin',
        slug: 'failing-plugin',
        description: 'Test',
        author: 'IMS Team',
        category: 'OTHER',
      });
      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });

    it('POST /api/marketplace/plugins/:id/install returns 500 on DB error', async () => {
      mockPrisma.mktPlugin.findUnique.mockResolvedValue(mockPlugin);
      mockPrisma.mktPluginInstall.upsert.mockRejectedValue(new Error('DB fail'));

      const res = await request(app)
        .post(`/api/marketplace/plugins/${mockPlugin.id}/install`)
        .send({});
      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/marketplace/stats returns 500 on DB error', async () => {
      mockPrisma.mktPlugin.count.mockRejectedValue(new Error('DB fail'));

      const res = await request(app).get('/api/marketplace/stats');
      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });

    it('POST /api/marketplace/plugins/:id/versions returns 500 on DB error', async () => {
      mockPrisma.mktPluginVersion.updateMany.mockResolvedValue({ count: 0 });
      mockPrisma.mktPluginVersion.create.mockRejectedValue(new Error('DB fail'));

      const res = await request(app)
        .post(`/api/marketplace/plugins/${mockPlugin.id}/versions`)
        .send({
          version: '3.0.0',
          changelog: 'New version',
          manifest: { name: 'slack-integration', entry: 'index.js' },
        });
      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });

    it('PATCH /api/marketplace/plugins/:id returns 500 on DB error', async () => {
      mockPrisma.mktPlugin.update.mockRejectedValue(new Error('DB fail'));

      const res = await request(app)
        .patch(`/api/marketplace/plugins/${mockPlugin.id}`)
        .send({ name: 'Failing Update' });
      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });
});
