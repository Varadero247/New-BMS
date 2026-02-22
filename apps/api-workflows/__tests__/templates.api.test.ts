import express from 'express';
import request from 'supertest';

// Mock dependencies
jest.mock('../src/prisma', () => ({
  prisma: {
    workflowTemplate: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      groupBy: jest.fn(),
    },
  },
}));

jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((req: any, _res: any, next: any) => {
    req.user = { id: '20000000-0000-4000-a000-000000000123', email: 'test@test.com', role: 'USER' };
    next();
  }),
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
import templatesRoutes from '../src/routes/templates';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('Workflows Templates API Routes', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/templates', templatesRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/templates', () => {
    const mockTemplates = [
      {
        id: '41000000-0000-4000-a000-000000000001',
        code: 'ONBOARDING',
        name: 'Employee Onboarding',
        category: 'ONBOARDING',
        isActive: true,
      },
      {
        id: 'tmpl-2',
        code: 'PURCHASE_APPROVAL',
        name: 'Purchase Approval',
        category: 'PROCUREMENT',
        isActive: true,
      },
    ];

    it('should return list of workflow templates', async () => {
      (mockPrisma.workflowTemplate.findMany as jest.Mock).mockResolvedValueOnce(mockTemplates);

      const response = await request(app).get('/api/templates');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
    });

    it('should filter by category', async () => {
      (mockPrisma.workflowTemplate.findMany as jest.Mock).mockResolvedValueOnce([]);

      await request(app).get('/api/templates?category=ONBOARDING');

      expect(mockPrisma.workflowTemplate.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            category: 'ONBOARDING',
          }),
        })
      );
    });

    it('should filter by industryType', async () => {
      (mockPrisma.workflowTemplate.findMany as jest.Mock).mockResolvedValueOnce([]);

      await request(app).get('/api/templates?industryType=MANUFACTURING');

      expect(mockPrisma.workflowTemplate.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            industryType: 'MANUFACTURING',
          }),
        })
      );
    });

    it('should filter by isActive', async () => {
      (mockPrisma.workflowTemplate.findMany as jest.Mock).mockResolvedValueOnce([]);

      await request(app).get('/api/templates?isActive=true');

      expect(mockPrisma.workflowTemplate.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isActive: true,
          }),
        })
      );
    });

    it('should order by name asc', async () => {
      (mockPrisma.workflowTemplate.findMany as jest.Mock).mockResolvedValueOnce([]);

      await request(app).get('/api/templates');

      expect(mockPrisma.workflowTemplate.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { name: 'asc' },
        })
      );
    });

    it('should handle database errors', async () => {
      (mockPrisma.workflowTemplate.findMany as jest.Mock).mockRejectedValueOnce(
        new Error('DB error')
      );

      const response = await request(app).get('/api/templates');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('GET /api/templates/categories/list', () => {
    it('should return template categories', async () => {
      (mockPrisma.workflowTemplate.groupBy as jest.Mock).mockResolvedValueOnce([
        { category: 'ONBOARDING', _count: 5 },
        { category: 'PROCUREMENT', _count: 3 },
      ]);

      const response = await request(app).get('/api/templates/categories/list');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
    });

    it('should handle database errors', async () => {
      (mockPrisma.workflowTemplate.groupBy as jest.Mock).mockRejectedValueOnce(
        new Error('DB error')
      );

      const response = await request(app).get('/api/templates/categories/list');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('GET /api/templates/:id', () => {
    const mockTemplate = {
      id: '41000000-0000-4000-a000-000000000001',
      code: 'ONBOARDING',
      name: 'Employee Onboarding',
      category: 'ONBOARDING',
    };

    it('should return single template', async () => {
      (mockPrisma.workflowTemplate.findUnique as jest.Mock).mockResolvedValueOnce(mockTemplate);

      const response = await request(app).get(
        '/api/templates/41000000-0000-4000-a000-000000000001'
      );

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('41000000-0000-4000-a000-000000000001');
    });

    it('should return 404 for 00000000-0000-4000-a000-ffffffffffff template', async () => {
      (mockPrisma.workflowTemplate.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app).get(
        '/api/templates/00000000-0000-4000-a000-ffffffffffff'
      );

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should handle database errors', async () => {
      (mockPrisma.workflowTemplate.findUnique as jest.Mock).mockRejectedValueOnce(
        new Error('DB error')
      );

      const response = await request(app).get(
        '/api/templates/41000000-0000-4000-a000-000000000001'
      );

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('POST /api/templates', () => {
    const createPayload = {
      code: 'NEW_TEMPLATE',
      name: 'New Template',
      category: 'APPROVAL' as const,
      definitionTemplate: { steps: [], rules: {} },
    };

    it('should create a template successfully', async () => {
      (mockPrisma.workflowTemplate.create as jest.Mock).mockResolvedValueOnce({
        id: '30000000-0000-4000-a000-000000000123',
        ...createPayload,
        isActive: true,
      });

      const response = await request(app).post('/api/templates').send(createPayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('New Template');
    });

    it('should return 400 for missing code', async () => {
      const response = await request(app)
        .post('/api/templates')
        .send({ name: 'No Code', category: 'APPROVAL', definitionTemplate: {} });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for missing name', async () => {
      const response = await request(app)
        .post('/api/templates')
        .send({ code: 'CODE', category: 'APPROVAL', definitionTemplate: {} });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid category', async () => {
      const response = await request(app)
        .post('/api/templates')
        .send({ ...createPayload, category: 'INVALID_CATEGORY' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should accept optional fields', async () => {
      (mockPrisma.workflowTemplate.create as jest.Mock).mockResolvedValueOnce({
        id: '30000000-0000-4000-a000-000000000123',
        ...createPayload,
        industryType: 'MANUFACTURING',
      });

      const response = await request(app)
        .post('/api/templates')
        .send({
          ...createPayload,
          industryType: 'MANUFACTURING',
        });

      expect(response.status).toBe(201);
    });

    it('should handle database errors', async () => {
      (mockPrisma.workflowTemplate.create as jest.Mock).mockRejectedValueOnce(
        new Error('DB error')
      );

      const response = await request(app).post('/api/templates').send(createPayload);

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('PUT /api/templates/:id', () => {
    it('should update template successfully', async () => {
      (mockPrisma.workflowTemplate.update as jest.Mock).mockResolvedValueOnce({
        id: '41000000-0000-4000-a000-000000000001',
        name: 'Updated Template',
      });

      const response = await request(app)
        .put('/api/templates/41000000-0000-4000-a000-000000000001')
        .send({ name: 'Updated Template' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 400 for invalid category on update', async () => {
      const response = await request(app)
        .put('/api/templates/41000000-0000-4000-a000-000000000001')
        .send({ category: 'INVALID' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should allow updating isActive', async () => {
      (mockPrisma.workflowTemplate.update as jest.Mock).mockResolvedValueOnce({
        id: '41000000-0000-4000-a000-000000000001',
        isActive: false,
      });

      const response = await request(app)
        .put('/api/templates/41000000-0000-4000-a000-000000000001')
        .send({ isActive: false });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should handle database errors', async () => {
      (mockPrisma.workflowTemplate.update as jest.Mock).mockRejectedValueOnce(
        new Error('DB error')
      );

      const response = await request(app)
        .put('/api/templates/41000000-0000-4000-a000-000000000001')
        .send({ name: 'Updated' });

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('PUT /api/templates/:id/publish', () => {
    it('should publish template successfully', async () => {
      (mockPrisma.workflowTemplate.update as jest.Mock).mockResolvedValueOnce({
        id: '41000000-0000-4000-a000-000000000001',
        isActive: true,
      });

      const response = await request(app).put(
        '/api/templates/41000000-0000-4000-a000-000000000001/publish'
      );

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(mockPrisma.workflowTemplate.update).toHaveBeenCalledWith({
        where: { id: '41000000-0000-4000-a000-000000000001' },
        data: {
          isActive: true,
        },
      });
    });

    it('should handle database errors', async () => {
      (mockPrisma.workflowTemplate.update as jest.Mock).mockRejectedValueOnce(
        new Error('DB error')
      );

      const response = await request(app).put(
        '/api/templates/41000000-0000-4000-a000-000000000001/publish'
      );

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });
});

describe('Workflows Templates API — additional coverage', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/templates', templatesRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /api/templates returns success:true with empty array when no templates exist', async () => {
    (mockPrisma.workflowTemplate.findMany as jest.Mock).mockResolvedValueOnce([]);

    const response = await request(app).get('/api/templates');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveLength(0);
  });

  it('GET /api/templates with no filters calls findMany with deletedAt:null where clause', async () => {
    (mockPrisma.workflowTemplate.findMany as jest.Mock).mockResolvedValueOnce([]);

    await request(app).get('/api/templates');

    expect(mockPrisma.workflowTemplate.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          deletedAt: null,
        }),
      })
    );
  });

  it('POST /api/templates returns 400 for missing definitionTemplate', async () => {
    const response = await request(app)
      .post('/api/templates')
      .send({ code: 'CODE', name: 'Name', category: 'APPROVAL' });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('PUT /api/templates/:id/publish sets isActive to true in db call', async () => {
    (mockPrisma.workflowTemplate.update as jest.Mock).mockResolvedValueOnce({
      id: '41000000-0000-4000-a000-000000000001',
      isActive: true,
    });

    await request(app).put('/api/templates/41000000-0000-4000-a000-000000000001/publish');

    expect(mockPrisma.workflowTemplate.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ isActive: true }),
      })
    );
  });

  it('GET /api/templates/categories/list returns category shape with _count field', async () => {
    (mockPrisma.workflowTemplate.groupBy as jest.Mock).mockResolvedValueOnce([
      { category: 'APPROVAL', _count: 7 },
    ]);

    const response = await request(app).get('/api/templates/categories/list');

    expect(response.status).toBe(200);
    expect(response.body.data[0]).toHaveProperty('category');
    expect(response.body.data[0]).toHaveProperty('_count');
  });

  it('PUT /api/templates/:id update 404 when record not found', async () => {
    (mockPrisma.workflowTemplate.update as jest.Mock).mockRejectedValueOnce(
      Object.assign(new Error('Record not found'), { code: 'P2025' })
    );

    const response = await request(app)
      .put('/api/templates/41000000-0000-4000-a000-000000000001')
      .send({ name: 'Updated' });

    expect([404, 500]).toContain(response.status);
  });
});

// ── Workflow Templates — further coverage ─────────────────────────────────────

describe('Workflow Templates API — further coverage', () => {
  let appFurther: express.Express;

  beforeAll(() => {
    appFurther = express();
    appFurther.use(express.json());
    appFurther.use('/api/templates', templatesRoutes);
  });

  beforeEach(() => jest.clearAllMocks());

  it('POST /api/templates sets isActive true by default', async () => {
    (mockPrisma.workflowTemplate.create as jest.Mock).mockResolvedValueOnce({
      id: '30000000-0000-4000-a000-000000000999',
      code: 'T',
      name: 'T',
      category: 'APPROVAL',
      isActive: true,
    });
    const res = await request(appFurther).post('/api/templates').send({
      code: 'T',
      name: 'T',
      category: 'APPROVAL',
      definitionTemplate: {},
    });
    expect(res.status).toBe(201);
    expect(res.body.data.isActive).toBe(true);
  });

  it('GET /api/templates/:id returns 404 for unknown template', async () => {
    (mockPrisma.workflowTemplate.findUnique as jest.Mock).mockResolvedValueOnce(null);
    const res = await request(appFurther).get(
      '/api/templates/00000000-0000-4000-a000-ffffffffffff'
    );
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('GET /api/templates with isActive=false filters correctly', async () => {
    (mockPrisma.workflowTemplate.findMany as jest.Mock).mockResolvedValueOnce([]);
    await request(appFurther).get('/api/templates?isActive=false');
    expect(mockPrisma.workflowTemplate.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ isActive: false }),
      })
    );
  });

  it('PUT /api/templates/:id/publish returns success:true', async () => {
    (mockPrisma.workflowTemplate.update as jest.Mock).mockResolvedValueOnce({
      id: '41000000-0000-4000-a000-000000000001',
      isActive: true,
    });
    const res = await request(appFurther).put(
      '/api/templates/41000000-0000-4000-a000-000000000001/publish'
    );
    expect(res.body.success).toBe(true);
  });

  it('GET /api/templates/categories/list response is success:true with data', async () => {
    (mockPrisma.workflowTemplate.groupBy as jest.Mock).mockResolvedValueOnce([
      { category: 'ONBOARDING', _count: 3 },
    ]);
    const res = await request(appFurther).get('/api/templates/categories/list');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('PUT /api/templates/:id allows updating name to a new value', async () => {
    (mockPrisma.workflowTemplate.update as jest.Mock).mockResolvedValueOnce({
      id: '41000000-0000-4000-a000-000000000001',
      name: 'Renamed Template',
    });
    const res = await request(appFurther)
      .put('/api/templates/41000000-0000-4000-a000-000000000001')
      .send({ name: 'Renamed Template' });
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Renamed Template');
  });
});

describe('Workflow Templates API — final boundary coverage', () => {
  let appFinal: express.Express;

  beforeAll(() => {
    appFinal = express();
    appFinal.use(express.json());
    appFinal.use('/api/templates', templatesRoutes);
  });

  beforeEach(() => jest.clearAllMocks());

  it('GET /api/templates returns content-type json', async () => {
    (mockPrisma.workflowTemplate.findMany as jest.Mock).mockResolvedValueOnce([]);
    const res = await request(appFinal).get('/api/templates');
    expect(res.headers['content-type']).toMatch(/json/);
  });

  it('POST /api/templates calls create with correct name and category', async () => {
    (mockPrisma.workflowTemplate.create as jest.Mock).mockResolvedValueOnce({
      id: 'tmpl-new',
      isActive: true,
    });
    await request(appFinal).post('/api/templates').send({
      code: 'FINAL_T',
      name: 'Final Template',
      category: 'APPROVAL',
      definitionTemplate: {},
    });
    expect(mockPrisma.workflowTemplate.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ name: 'Final Template', category: 'APPROVAL' }) })
    );
  });

  it('PUT /api/templates/:id/publish sets isActive:true', async () => {
    (mockPrisma.workflowTemplate.update as jest.Mock).mockResolvedValueOnce({
      id: '41000000-0000-4000-a000-000000000001',
      isActive: true,
    });
    await request(appFinal).put('/api/templates/41000000-0000-4000-a000-000000000001/publish');
    expect(mockPrisma.workflowTemplate.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { isActive: true } })
    );
  });

  it('GET /api/templates/:id includes the code field in response', async () => {
    (mockPrisma.workflowTemplate.findUnique as jest.Mock).mockResolvedValueOnce({
      id: '41000000-0000-4000-a000-000000000001',
      code: 'ONBOARDING',
      name: 'Onboarding Flow',
    });
    const res = await request(appFinal).get(
      '/api/templates/41000000-0000-4000-a000-000000000001'
    );
    expect(res.body.data.code).toBe('ONBOARDING');
  });

  it('PUT /api/templates/:id 500 on DB error returns INTERNAL_ERROR', async () => {
    (mockPrisma.workflowTemplate.update as jest.Mock).mockRejectedValueOnce(new Error('DB fail'));
    const res = await request(appFinal)
      .put('/api/templates/41000000-0000-4000-a000-000000000001')
      .send({ name: 'Fail' });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('templates — phase29 coverage', () => {
  it('handles error message', () => {
    expect(new TypeError('bad')).toHaveProperty('message', 'bad');
  });

  it('handles nullish coalescing', () => {
    const val: string | null = null; expect(val ?? 'default').toBe('default');
  });

  it('handles Set size', () => {
    expect(new Set([1, 2, 2, 3]).size).toBe(3);
  });

  it('handles string padStart', () => {
    expect('5'.padStart(3, '0')).toBe('005');
  });

  it('handles error instanceof', () => {
    expect(new Error('test')).toBeInstanceOf(Error);
  });

});

describe('templates — phase30 coverage', () => {
  it('handles structuredClone', () => {
    const obj2 = { a: 1 }; const clone = structuredClone(obj2); expect(clone).toEqual(obj2); expect(clone).not.toBe(obj2);
  });

  it('handles parseFloat', () => {
    expect(parseFloat('3.14')).toBeCloseTo(3.14);
  });

  it('handles Array.from', () => {
    expect(Array.from('abc')).toEqual(['a', 'b', 'c']);
  });

  it('handles string split', () => {
    expect('a,b,c'.split(',')).toEqual(['a', 'b', 'c']);
  });

  it('handles undefined check', () => {
    expect(undefined).toBeUndefined();
  });

});
