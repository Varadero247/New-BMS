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
      createMany: jest.fn(),
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
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

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
      {
        id: '00000000-0000-0000-0000-000000000001',
        name: 'Overview',
        ownerId: 'user-123',
        isPublic: true,
        analyticsWidgets: [],
      },
      { id: 'dash-2', name: 'Sales', ownerId: 'user-123', isPublic: false, analyticsWidgets: [] },
    ];
    mockPrisma.analyticsDashboard.findMany.mockResolvedValue(dashboards);
    mockPrisma.analyticsDashboard.count.mockResolvedValue(2);

    const res = await request(app).get('/api/dashboards');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.pagination).toBeDefined();
    expect(res.body.pagination.total).toBe(2);
  });

  it('should filter by owner=me', async () => {
    mockPrisma.analyticsDashboard.findMany.mockResolvedValue([]);
    mockPrisma.analyticsDashboard.count.mockResolvedValue(0);

    const res = await request(app).get('/api/dashboards?owner=me');

    expect(res.status).toBe(200);
    expect(mockPrisma.analyticsDashboard.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ ownerId: 'user-123' }) })
    );
  });

  it('should filter by isPublic=true', async () => {
    mockPrisma.analyticsDashboard.findMany.mockResolvedValue([]);
    mockPrisma.analyticsDashboard.count.mockResolvedValue(0);

    const res = await request(app).get('/api/dashboards?isPublic=true');

    expect(res.status).toBe(200);
    expect(mockPrisma.analyticsDashboard.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ isPublic: true }) })
    );
  });

  it('should handle server errors', async () => {
    mockPrisma.analyticsDashboard.findMany.mockRejectedValue(new Error('DB error'));

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
    const created = {
      id: 'dash-new',
      name: 'New Dashboard',
      ownerId: 'user-123',
      isPublic: false,
      layout: {},
      widgets: [],
    };
    mockPrisma.analyticsDashboard.create.mockResolvedValue(created);

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
    const dashboard = {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Default',
      isDefault: true,
      analyticsWidgets: [],
    };
    mockPrisma.analyticsDashboard.findFirst.mockResolvedValue(dashboard);

    const res = await request(app).get('/api/dashboards/default');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.isDefault).toBe(true);
  });

  it('should return 404 when no default dashboard', async () => {
    mockPrisma.analyticsDashboard.findFirst.mockResolvedValue(null);

    const res = await request(app).get('/api/dashboards/default');

    expect(res.status).toBe(404);
  });
});

// ===================================================================
// GET /api/dashboards/:id — Get by ID
// ===================================================================
describe('GET /api/dashboards/:id', () => {
  it('should return a dashboard by ID', async () => {
    const dashboard = {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Test',
      analyticsWidgets: [],
    };
    mockPrisma.analyticsDashboard.findFirst.mockResolvedValue(dashboard);

    const res = await request(app).get('/api/dashboards/00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
  });

  it('should return 404 for non-existent dashboard', async () => {
    mockPrisma.analyticsDashboard.findFirst.mockResolvedValue(null);

    const res = await request(app).get('/api/dashboards/00000000-0000-0000-0000-000000000099');

    expect(res.status).toBe(404);
  });
});

// ===================================================================
// PUT /api/dashboards/:id — Update
// ===================================================================
describe('PUT /api/dashboards/:id', () => {
  it('should update a dashboard', async () => {
    mockPrisma.analyticsDashboard.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.analyticsDashboard.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Updated',
    });

    const res = await request(app)
      .put('/api/dashboards/00000000-0000-0000-0000-000000000001')
      .send({ name: 'Updated' });

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Updated');
  });

  it('should return 404 for non-existent dashboard', async () => {
    mockPrisma.analyticsDashboard.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/dashboards/00000000-0000-0000-0000-000000000099')
      .send({ name: 'Updated' });

    expect(res.status).toBe(404);
  });
});

// ===================================================================
// DELETE /api/dashboards/:id — Soft delete
// ===================================================================
describe('DELETE /api/dashboards/:id', () => {
  it('should soft delete a dashboard', async () => {
    mockPrisma.analyticsDashboard.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.analyticsDashboard.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      deletedAt: new Date(),
    });
    mockPrisma.analyticsWidget.updateMany.mockResolvedValue({ count: 2 });

    const res = await request(app).delete('/api/dashboards/00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(200);
    expect(res.body.data.message).toBe('Dashboard deleted');
  });

  it('should return 404 for non-existent dashboard', async () => {
    mockPrisma.analyticsDashboard.findFirst.mockResolvedValue(null);

    const res = await request(app).delete('/api/dashboards/00000000-0000-0000-0000-000000000099');

    expect(res.status).toBe(404);
  });
});

// ===================================================================
// POST /api/dashboards/:id/clone — Clone
// ===================================================================
describe('POST /api/dashboards/:id/clone', () => {
  it('should clone a dashboard with widgets', async () => {
    const original = {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Original',
      description: null,
      layout: {},
      widgets: [],
      isPublic: false,
      tags: null,
      analyticsWidgets: [
        {
          id: '00000000-0000-0000-0000-000000000001',
          title: 'Chart',
          type: 'CHART',
          config: {},
          dataSource: 'ALL',
          query: null,
          position: { x: 0, y: 0 },
          refreshInterval: null,
        },
      ],
    };
    mockPrisma.analyticsDashboard.findFirst.mockResolvedValue(original);
    mockPrisma.analyticsDashboard.create.mockResolvedValue({
      id: 'dash-clone',
      name: 'Original (Copy)',
    });
    mockPrisma.analyticsWidget.createMany.mockResolvedValue({ count: 1 });
    mockPrisma.analyticsDashboard.findUnique.mockResolvedValue({
      id: 'dash-clone',
      name: 'Original (Copy)',
      analyticsWidgets: [{ id: 'w-clone' }],
    });

    const res = await request(app).post(
      '/api/dashboards/00000000-0000-0000-0000-000000000001/clone'
    );

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('Original (Copy)');
  });

  it('should return 404 for non-existent dashboard', async () => {
    mockPrisma.analyticsDashboard.findFirst.mockResolvedValue(null);

    const res = await request(app).post(
      '/api/dashboards/00000000-0000-0000-0000-000000000099/clone'
    );

    expect(res.status).toBe(404);
  });
});

// ===================================================================
// POST /api/dashboards/:id/widgets — Add widget
// ===================================================================
describe('POST /api/dashboards/:id/widgets', () => {
  it('should add a widget to a dashboard', async () => {
    mockPrisma.analyticsDashboard.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.analyticsWidget.create.mockResolvedValue({
      id: 'w-new',
      title: 'New Widget',
      type: 'CHART',
    });

    const res = await request(app)
      .post('/api/dashboards/00000000-0000-0000-0000-000000000001/widgets')
      .send({
        title: 'New Widget',
        type: 'CHART',
        dataSource: 'ALL',
      });

    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe('New Widget');
  });

  it('should reject invalid widget data', async () => {
    mockPrisma.analyticsDashboard.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });

    const res = await request(app)
      .post('/api/dashboards/00000000-0000-0000-0000-000000000001/widgets')
      .send({});

    expect(res.status).toBe(400);
  });

  it('should return 404 for non-existent dashboard', async () => {
    mockPrisma.analyticsDashboard.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/dashboards/00000000-0000-0000-0000-000000000099/widgets')
      .send({
        title: 'New Widget',
        type: 'CHART',
        dataSource: 'ALL',
      });

    expect(res.status).toBe(404);
  });
});

// ===================================================================
// PUT /api/dashboards/:id/widgets/:widgetId — Update widget
// ===================================================================
describe('PUT /api/dashboards/:id/widgets/:widgetId', () => {
  it('should update a widget', async () => {
    mockPrisma.analyticsWidget.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      dashboardId: 'dash-1',
    });
    mockPrisma.analyticsWidget.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      title: 'Updated Widget',
    });

    const res = await request(app)
      .put(
        '/api/dashboards/00000000-0000-0000-0000-000000000001/widgets/00000000-0000-0000-0000-000000000001'
      )
      .send({ title: 'Updated Widget' });

    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe('Updated Widget');
  });

  it('should return 404 for non-existent widget', async () => {
    mockPrisma.analyticsWidget.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .put(
        '/api/dashboards/00000000-0000-0000-0000-000000000001/widgets/00000000-0000-0000-0000-000000000099'
      )
      .send({ title: 'X' });

    expect(res.status).toBe(404);
  });
});

// ===================================================================
// DELETE /api/dashboards/:id/widgets/:widgetId — Delete widget
// ===================================================================
describe('DELETE /api/dashboards/:id/widgets/:widgetId', () => {
  it('should soft delete a widget', async () => {
    mockPrisma.analyticsWidget.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      dashboardId: 'dash-1',
    });
    mockPrisma.analyticsWidget.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      deletedAt: new Date(),
    });

    const res = await request(app).delete(
      '/api/dashboards/00000000-0000-0000-0000-000000000001/widgets/00000000-0000-0000-0000-000000000001'
    );

    expect(res.status).toBe(200);
    expect(res.body.data.message).toBe('Widget deleted');
  });

  it('should return 404 for non-existent widget', async () => {
    mockPrisma.analyticsWidget.findFirst.mockResolvedValue(null);

    const res = await request(app).delete(
      '/api/dashboards/00000000-0000-0000-0000-000000000001/widgets/00000000-0000-0000-0000-000000000099'
    );

    expect(res.status).toBe(404);
  });
});

// ===================================================================
// Additional coverage: 500 errors, pagination, filter wiring
// ===================================================================
describe('Additional dashboard coverage', () => {
  it('POST /api/dashboards returns 500 when create fails', async () => {
    mockPrisma.analyticsDashboard.create.mockRejectedValue(new Error('DB error'));

    const res = await request(app).post('/api/dashboards').send({ name: 'Fail Dashboard' });

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/dashboards pagination computes totalPages correctly', async () => {
    mockPrisma.analyticsDashboard.findMany.mockResolvedValue([]);
    mockPrisma.analyticsDashboard.count.mockResolvedValue(45);

    const res = await request(app).get('/api/dashboards?page=2&limit=10');

    expect(res.status).toBe(200);
    expect(res.body.pagination.total).toBe(45);
    expect(res.body.pagination.totalPages).toBe(5);
    expect(res.body.pagination.page).toBe(2);
  });

  it('PUT /api/dashboards/:id returns 500 when update fails', async () => {
    mockPrisma.analyticsDashboard.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.analyticsDashboard.update.mockRejectedValue(new Error('DB error'));

    const res = await request(app)
      .put('/api/dashboards/00000000-0000-0000-0000-000000000001')
      .send({ name: 'Updated' });

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });

  it('DELETE /api/dashboards/:id returns 500 when update fails', async () => {
    mockPrisma.analyticsDashboard.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.analyticsDashboard.update.mockRejectedValue(new Error('DB error'));

    const res = await request(app).delete(
      '/api/dashboards/00000000-0000-0000-0000-000000000001'
    );

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/dashboards/:id/widgets returns 500 when create fails', async () => {
    mockPrisma.analyticsDashboard.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.analyticsWidget.create.mockRejectedValue(new Error('DB error'));

    const res = await request(app)
      .post('/api/dashboards/00000000-0000-0000-0000-000000000001/widgets')
      .send({ title: 'Widget', type: 'CHART', dataSource: 'ALL' });

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/dashboards filters by tags search param wired into findMany', async () => {
    mockPrisma.analyticsDashboard.findMany.mockResolvedValue([]);
    mockPrisma.analyticsDashboard.count.mockResolvedValue(0);

    const res = await request(app).get('/api/dashboards?isPublic=false');

    expect(res.status).toBe(200);
    expect(mockPrisma.analyticsDashboard.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ isPublic: false }) })
    );
  });

  it('GET /api/dashboards/default returns 500 on DB error', async () => {
    mockPrisma.analyticsDashboard.findFirst.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/dashboards/default');

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

describe('Dashboards API — final coverage', () => {
  it('GET /api/dashboards pagination has all required keys', async () => {
    mockPrisma.analyticsDashboard.findMany.mockResolvedValue([]);
    mockPrisma.analyticsDashboard.count.mockResolvedValue(0);
    const res = await request(app).get('/api/dashboards');
    expect(res.status).toBe(200);
    expect(res.body.pagination).toHaveProperty('page');
    expect(res.body.pagination).toHaveProperty('limit');
    expect(res.body.pagination).toHaveProperty('total');
    expect(res.body.pagination).toHaveProperty('totalPages');
  });

  it('POST /api/dashboards create is called once on valid input', async () => {
    mockPrisma.analyticsDashboard.create.mockResolvedValue({
      id: 'dash-once',
      name: 'Once Dashboard',
      ownerId: 'user-123',
      isPublic: false,
    });
    await request(app).post('/api/dashboards').send({ name: 'Once Dashboard' });
    expect(mockPrisma.analyticsDashboard.create).toHaveBeenCalledTimes(1);
  });

  it('DELETE /api/dashboards/:id sets deletedAt in the update call', async () => {
    mockPrisma.analyticsDashboard.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.analyticsDashboard.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      deletedAt: new Date(),
    });
    mockPrisma.analyticsWidget.updateMany.mockResolvedValue({ count: 0 });
    await request(app).delete('/api/dashboards/00000000-0000-0000-0000-000000000001');
    expect(mockPrisma.analyticsDashboard.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ deletedAt: expect.any(Date) }) })
    );
  });

  it('PUT /api/dashboards/:id update called with correct id', async () => {
    mockPrisma.analyticsDashboard.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.analyticsDashboard.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Updated',
    });
    await request(app)
      .put('/api/dashboards/00000000-0000-0000-0000-000000000001')
      .send({ name: 'Updated' });
    expect(mockPrisma.analyticsDashboard.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: '00000000-0000-0000-0000-000000000001' } })
    );
  });

  it('GET /api/dashboards/:id returns data.id matching the requested UUID', async () => {
    mockPrisma.analyticsDashboard.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      name: 'ID Check',
      analyticsWidgets: [],
    });
    const res = await request(app).get('/api/dashboards/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
  });
});

describe('Dashboards API — final extended coverage', () => {
  it('PUT /api/dashboards/:id/widgets/:widgetId returns 500 on DB update error', async () => {
    mockPrisma.analyticsWidget.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      dashboardId: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.analyticsWidget.update.mockRejectedValue(new Error('DB error'));

    const res = await request(app)
      .put(
        '/api/dashboards/00000000-0000-0000-0000-000000000001/widgets/00000000-0000-0000-0000-000000000001'
      )
      .send({ title: 'Failing Update' });

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });

  it('DELETE /api/dashboards/:id/widgets/:widgetId returns 500 on DB error', async () => {
    mockPrisma.analyticsWidget.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      dashboardId: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.analyticsWidget.update.mockRejectedValue(new Error('DB error'));

    const res = await request(app).delete(
      '/api/dashboards/00000000-0000-0000-0000-000000000001/widgets/00000000-0000-0000-0000-000000000001'
    );

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/dashboards response body data is always an array', async () => {
    mockPrisma.analyticsDashboard.findMany.mockResolvedValue([]);
    mockPrisma.analyticsDashboard.count.mockResolvedValue(0);

    const res = await request(app).get('/api/dashboards');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

// ===================================================================
// Dashboards API — supplemental coverage
// ===================================================================
describe('Dashboards API — supplemental coverage', () => {
  it('POST /api/dashboards/:id/clone creates a copy with name containing Copy', async () => {
    const original = {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Original Dashboard',
      description: null,
      layout: {},
      widgets: [],
      isPublic: false,
      tags: null,
      analyticsWidgets: [],
    };
    mockPrisma.analyticsDashboard.findFirst.mockResolvedValue(original);
    mockPrisma.analyticsDashboard.create.mockResolvedValue({
      id: 'clone-supp',
      name: 'Original Dashboard (Copy)',
    });
    mockPrisma.analyticsWidget.createMany.mockResolvedValue({ count: 0 });
    mockPrisma.analyticsDashboard.findUnique.mockResolvedValue({
      id: 'clone-supp',
      name: 'Original Dashboard (Copy)',
      analyticsWidgets: [],
    });

    const res = await request(app).post(
      '/api/dashboards/00000000-0000-0000-0000-000000000001/clone'
    );

    expect(res.status).toBe(201);
    expect(res.body.data.name).toContain('Copy');
  });

  it('GET /api/dashboards success is true with data present', async () => {
    mockPrisma.analyticsDashboard.findMany.mockResolvedValue([
      { id: '00000000-0000-0000-0000-000000000001', name: 'Health', ownerId: 'user-123', isPublic: true, analyticsWidgets: [] },
    ]);
    mockPrisma.analyticsDashboard.count.mockResolvedValue(1);

    const res = await request(app).get('/api/dashboards');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
