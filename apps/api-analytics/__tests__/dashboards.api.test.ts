import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    analyticsDashboard: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    analyticsWidget: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      count: jest.fn(),
      deleteMany: jest.fn(),
    },
  },
  Prisma: {
    Decimal: jest.fn((v: any) => v),
  },
}));

jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((req: any, _res: any, next: any) => {
    req.user = { id: 'user-123', email: 'test@test.com', role: 'ADMIN' };
    next();
  }),
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

import dashboardsRouter from '../src/routes/dashboards';
import { prisma } from '../src/prisma';

const app = express();
app.use(express.json());
app.use('/api/dashboards', dashboardsRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

// ===================================================================
// GET /api/dashboards — List dashboards
// ===================================================================
describe('GET /api/dashboards', () => {
  it('should return a list of dashboards with pagination', async () => {
    const dashboards = [
      { id: 'dash-1', name: 'Overview', ownerId: 'user-123', isPublic: true, analyticsWidgets: [] },
      { id: 'dash-2', name: 'Sales', ownerId: 'user-123', isPublic: false, analyticsWidgets: [] },
    ];
    (prisma as any).analyticsDashboard.findMany.mockResolvedValue(dashboards);
    (prisma as any).analyticsDashboard.count.mockResolvedValue(2);

    const res = await request(app).get('/api/dashboards');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.pagination).toBeDefined();
    expect(res.body.pagination.total).toBe(2);
  });

  it('should filter by owner=me', async () => {
    (prisma as any).analyticsDashboard.findMany.mockResolvedValue([]);
    (prisma as any).analyticsDashboard.count.mockResolvedValue(0);

    const res = await request(app).get('/api/dashboards?owner=me');

    expect(res.status).toBe(200);
    expect((prisma as any).analyticsDashboard.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ ownerId: 'user-123' }) })
    );
  });

  it('should filter by isPublic=true', async () => {
    (prisma as any).analyticsDashboard.findMany.mockResolvedValue([]);
    (prisma as any).analyticsDashboard.count.mockResolvedValue(0);

    const res = await request(app).get('/api/dashboards?isPublic=true');

    expect(res.status).toBe(200);
    expect((prisma as any).analyticsDashboard.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ isPublic: true }) })
    );
  });

  it('should handle server errors', async () => {
    (prisma as any).analyticsDashboard.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/dashboards');

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

// ===================================================================
// POST /api/dashboards — Create dashboard
// ===================================================================
describe('POST /api/dashboards', () => {
  it('should create a new dashboard', async () => {
    const created = { id: 'dash-new', name: 'New Dashboard', ownerId: 'user-123', isPublic: false, layout: {}, widgets: [] };
    (prisma as any).analyticsDashboard.create.mockResolvedValue(created);

    const res = await request(app).post('/api/dashboards').send({ name: 'New Dashboard' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('New Dashboard');
  });

  it('should reject invalid input', async () => {
    const res = await request(app).post('/api/dashboards').send({});

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});

// ===================================================================
// GET /api/dashboards/default — Get default dashboard
// ===================================================================
describe('GET /api/dashboards/default', () => {
  it('should return the default dashboard', async () => {
    const dashboard = { id: 'dash-1', name: 'Default', isDefault: true, analyticsWidgets: [] };
    (prisma as any).analyticsDashboard.findFirst.mockResolvedValue(dashboard);

    const res = await request(app).get('/api/dashboards/default');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.isDefault).toBe(true);
  });

  it('should return 404 when no default dashboard', async () => {
    (prisma as any).analyticsDashboard.findFirst.mockResolvedValue(null);

    const res = await request(app).get('/api/dashboards/default');

    expect(res.status).toBe(404);
  });
});

// ===================================================================
// GET /api/dashboards/:id — Get by ID
// ===================================================================
describe('GET /api/dashboards/:id', () => {
  it('should return a dashboard by ID', async () => {
    const dashboard = { id: 'dash-1', name: 'Test', analyticsWidgets: [] };
    (prisma as any).analyticsDashboard.findFirst.mockResolvedValue(dashboard);

    const res = await request(app).get('/api/dashboards/dash-1');

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('dash-1');
  });

  it('should return 404 for non-existent dashboard', async () => {
    (prisma as any).analyticsDashboard.findFirst.mockResolvedValue(null);

    const res = await request(app).get('/api/dashboards/nonexistent');

    expect(res.status).toBe(404);
  });
});

// ===================================================================
// PUT /api/dashboards/:id — Update
// ===================================================================
describe('PUT /api/dashboards/:id', () => {
  it('should update a dashboard', async () => {
    (prisma as any).analyticsDashboard.findFirst.mockResolvedValue({ id: 'dash-1' });
    (prisma as any).analyticsDashboard.update.mockResolvedValue({ id: 'dash-1', name: 'Updated' });

    const res = await request(app).put('/api/dashboards/dash-1').send({ name: 'Updated' });

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Updated');
  });

  it('should return 404 for non-existent dashboard', async () => {
    (prisma as any).analyticsDashboard.findFirst.mockResolvedValue(null);

    const res = await request(app).put('/api/dashboards/nonexistent').send({ name: 'Updated' });

    expect(res.status).toBe(404);
  });
});

// ===================================================================
// DELETE /api/dashboards/:id — Soft delete
// ===================================================================
describe('DELETE /api/dashboards/:id', () => {
  it('should soft delete a dashboard', async () => {
    (prisma as any).analyticsDashboard.findFirst.mockResolvedValue({ id: 'dash-1' });
    (prisma as any).analyticsDashboard.update.mockResolvedValue({ id: 'dash-1', deletedAt: new Date() });
    (prisma as any).analyticsWidget.updateMany.mockResolvedValue({ count: 2 });

    const res = await request(app).delete('/api/dashboards/dash-1');

    expect(res.status).toBe(200);
    expect(res.body.data.message).toBe('Dashboard deleted');
  });

  it('should return 404 for non-existent dashboard', async () => {
    (prisma as any).analyticsDashboard.findFirst.mockResolvedValue(null);

    const res = await request(app).delete('/api/dashboards/nonexistent');

    expect(res.status).toBe(404);
  });
});

// ===================================================================
// POST /api/dashboards/:id/clone — Clone
// ===================================================================
describe('POST /api/dashboards/:id/clone', () => {
  it('should clone a dashboard with widgets', async () => {
    const original = {
      id: 'dash-1', name: 'Original', description: null, layout: {}, widgets: [], isPublic: false,
      tags: null, analyticsWidgets: [
        { id: 'w-1', title: 'Chart', type: 'CHART', config: {}, dataSource: 'ALL', query: null, position: { x: 0, y: 0 }, refreshInterval: null },
      ],
    };
    (prisma as any).analyticsDashboard.findFirst.mockResolvedValue(original);
    (prisma as any).analyticsDashboard.create.mockResolvedValue({ id: 'dash-clone', name: 'Original (Copy)' });
    (prisma as any).analyticsWidget.create.mockResolvedValue({ id: 'w-clone' });
    (prisma as any).analyticsDashboard.findUnique.mockResolvedValue({ id: 'dash-clone', name: 'Original (Copy)', analyticsWidgets: [{ id: 'w-clone' }] });

    const res = await request(app).post('/api/dashboards/dash-1/clone');

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('Original (Copy)');
  });

  it('should return 404 for non-existent dashboard', async () => {
    (prisma as any).analyticsDashboard.findFirst.mockResolvedValue(null);

    const res = await request(app).post('/api/dashboards/nonexistent/clone');

    expect(res.status).toBe(404);
  });
});

// ===================================================================
// POST /api/dashboards/:id/widgets — Add widget
// ===================================================================
describe('POST /api/dashboards/:id/widgets', () => {
  it('should add a widget to a dashboard', async () => {
    (prisma as any).analyticsDashboard.findFirst.mockResolvedValue({ id: 'dash-1' });
    (prisma as any).analyticsWidget.create.mockResolvedValue({ id: 'w-new', title: 'New Widget', type: 'CHART' });

    const res = await request(app).post('/api/dashboards/dash-1/widgets').send({
      title: 'New Widget', type: 'CHART', dataSource: 'ALL',
    });

    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe('New Widget');
  });

  it('should reject invalid widget data', async () => {
    (prisma as any).analyticsDashboard.findFirst.mockResolvedValue({ id: 'dash-1' });

    const res = await request(app).post('/api/dashboards/dash-1/widgets').send({});

    expect(res.status).toBe(400);
  });

  it('should return 404 for non-existent dashboard', async () => {
    (prisma as any).analyticsDashboard.findFirst.mockResolvedValue(null);

    const res = await request(app).post('/api/dashboards/nonexistent/widgets').send({
      title: 'New Widget', type: 'CHART', dataSource: 'ALL',
    });

    expect(res.status).toBe(404);
  });
});

// ===================================================================
// PUT /api/dashboards/:id/widgets/:widgetId — Update widget
// ===================================================================
describe('PUT /api/dashboards/:id/widgets/:widgetId', () => {
  it('should update a widget', async () => {
    (prisma as any).analyticsWidget.findFirst.mockResolvedValue({ id: 'w-1', dashboardId: 'dash-1' });
    (prisma as any).analyticsWidget.update.mockResolvedValue({ id: 'w-1', title: 'Updated Widget' });

    const res = await request(app).put('/api/dashboards/dash-1/widgets/w-1').send({ title: 'Updated Widget' });

    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe('Updated Widget');
  });

  it('should return 404 for non-existent widget', async () => {
    (prisma as any).analyticsWidget.findFirst.mockResolvedValue(null);

    const res = await request(app).put('/api/dashboards/dash-1/widgets/nonexistent').send({ title: 'X' });

    expect(res.status).toBe(404);
  });
});

// ===================================================================
// DELETE /api/dashboards/:id/widgets/:widgetId — Delete widget
// ===================================================================
describe('DELETE /api/dashboards/:id/widgets/:widgetId', () => {
  it('should soft delete a widget', async () => {
    (prisma as any).analyticsWidget.findFirst.mockResolvedValue({ id: 'w-1', dashboardId: 'dash-1' });
    (prisma as any).analyticsWidget.update.mockResolvedValue({ id: 'w-1', deletedAt: new Date() });

    const res = await request(app).delete('/api/dashboards/dash-1/widgets/w-1');

    expect(res.status).toBe(200);
    expect(res.body.data.message).toBe('Widget deleted');
  });

  it('should return 404 for non-existent widget', async () => {
    (prisma as any).analyticsWidget.findFirst.mockResolvedValue(null);

    const res = await request(app).delete('/api/dashboards/dash-1/widgets/nonexistent');

    expect(res.status).toBe(404);
  });
});
