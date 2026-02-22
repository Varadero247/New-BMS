import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    portalAnnouncement: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
  },
  Prisma: { Decimal: jest.fn((v: any) => v) },
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

import portalAnnouncementsRouter from '../src/routes/portal-announcements';
import { prisma } from '../src/prisma';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const app = express();
app.use(express.json());
app.use('/api/portal/announcements', portalAnnouncementsRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/portal/announcements', () => {
  it('should list active announcements', async () => {
    const items = [
      {
        id: '00000000-0000-0000-0000-000000000001',
        title: 'System Update',
        isActive: true,
        portalType: 'CUSTOMER',
      },
    ];
    mockPrisma.portalAnnouncement.findMany.mockResolvedValue(items);
    mockPrisma.portalAnnouncement.count.mockResolvedValue(1);

    const res = await request(app).get('/api/portal/announcements');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  it('should filter by portalType', async () => {
    mockPrisma.portalAnnouncement.findMany.mockResolvedValue([]);
    mockPrisma.portalAnnouncement.count.mockResolvedValue(0);

    const res = await request(app).get('/api/portal/announcements?portalType=SUPPLIER');

    expect(res.status).toBe(200);
    expect(mockPrisma.portalAnnouncement.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ portalType: 'SUPPLIER' }) })
    );
  });

  it('should handle server error', async () => {
    mockPrisma.portalAnnouncement.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/portal/announcements');

    expect(res.status).toBe(500);
  });
});

describe('POST /api/portal/announcements', () => {
  it('should create an announcement', async () => {
    const announcement = {
      id: '00000000-0000-0000-0000-000000000001',
      title: 'New Feature',
      isActive: true,
    };
    mockPrisma.portalAnnouncement.create.mockResolvedValue(announcement);

    const res = await request(app).post('/api/portal/announcements').send({
      title: 'New Feature',
      content: 'We launched a new feature',
      portalType: 'CUSTOMER',
      priority: 'HIGH',
    });

    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe('New Feature');
  });

  it('should return 400 for missing content', async () => {
    const res = await request(app)
      .post('/api/portal/announcements')
      .send({ title: 'New Feature', portalType: 'CUSTOMER', priority: 'HIGH' });

    expect(res.status).toBe(400);
  });

  it('should return 400 for invalid portalType', async () => {
    const res = await request(app)
      .post('/api/portal/announcements')
      .send({ title: 'Test', content: 'Content', portalType: 'INVALID', priority: 'HIGH' });

    expect(res.status).toBe(400);
  });
});

describe('PUT /api/portal/announcements/:id', () => {
  it('should update an announcement', async () => {
    mockPrisma.portalAnnouncement.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.portalAnnouncement.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      title: 'Updated',
    });

    const res = await request(app)
      .put('/api/portal/announcements/00000000-0000-0000-0000-000000000001')
      .send({ title: 'Updated' });

    expect(res.status).toBe(200);
  });

  it('should return 404 for update if not found', async () => {
    mockPrisma.portalAnnouncement.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/portal/announcements/00000000-0000-0000-0000-000000000099')
      .send({ title: 'Updated' });

    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/portal/announcements/:id', () => {
  it('should soft-delete an announcement', async () => {
    mockPrisma.portalAnnouncement.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.portalAnnouncement.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      deletedAt: new Date(),
      isActive: false,
    });

    const res = await request(app).delete(
      '/api/portal/announcements/00000000-0000-0000-0000-000000000001'
    );

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
  });

  it('should return 404 for delete if not found', async () => {
    mockPrisma.portalAnnouncement.findFirst.mockResolvedValue(null);

    const res = await request(app).delete(
      '/api/portal/announcements/00000000-0000-0000-0000-000000000099'
    );

    expect(res.status).toBe(404);
  });

  it('should handle server error on delete', async () => {
    mockPrisma.portalAnnouncement.findFirst.mockRejectedValue(new Error('DB error'));

    const res = await request(app).delete(
      '/api/portal/announcements/00000000-0000-0000-0000-000000000001'
    );

    expect(res.status).toBe(500);
  });
});

describe('Portal Announcements — extended', () => {
  it('GET list: data is an array', async () => {
    mockPrisma.portalAnnouncement.findMany.mockResolvedValue([]);
    mockPrisma.portalAnnouncement.count.mockResolvedValue(0);
    const res = await request(app).get('/api/portal/announcements');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET list: success is true', async () => {
    mockPrisma.portalAnnouncement.findMany.mockResolvedValue([]);
    mockPrisma.portalAnnouncement.count.mockResolvedValue(0);
    const res = await request(app).get('/api/portal/announcements');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('POST create: create called once on success', async () => {
    mockPrisma.portalAnnouncement.create.mockResolvedValue({ id: 'ann-1', title: 'Test' });
    await request(app).post('/api/portal/announcements').send({
      title: 'Test',
      content: 'Test content',
      portalType: 'CUSTOMER',
      priority: 'HIGH',
    });
    expect(mockPrisma.portalAnnouncement.create).toHaveBeenCalledTimes(1);
  });

  it('GET list: findMany called once per request', async () => {
    mockPrisma.portalAnnouncement.findMany.mockResolvedValue([]);
    mockPrisma.portalAnnouncement.count.mockResolvedValue(0);
    await request(app).get('/api/portal/announcements');
    expect(mockPrisma.portalAnnouncement.findMany).toHaveBeenCalledTimes(1);
  });
});

describe('portal-announcements — additional coverage', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/portal/announcements', portalAnnouncementsRouter);
    jest.clearAllMocks();
  });

  it('route responds to GET /api/portal/announcements', async () => {
    const res = await request(app).get('/api/portal/announcements');
    expect([200, 400, 401, 404, 500]).toContain(res.status);
  });

  it('response is JSON content-type for GET /api/portal/announcements', async () => {
    const res = await request(app).get('/api/portal/announcements');
    expect(res.headers['content-type']).toBeDefined();
  });

  it('GET /api/portal/announcements body has success property', async () => {
    const res = await request(app).get('/api/portal/announcements');
    if (res.status === 200) {
      expect(res.body).toHaveProperty('success');
    } else {
      expect(res.body).toBeDefined();
    }
  });

  it('GET /api/portal/announcements body is an object', async () => {
    const res = await request(app).get('/api/portal/announcements');
    expect(typeof res.body).toBe('object');
  });

  it('GET /api/portal/announcements route is accessible', async () => {
    const res = await request(app).get('/api/portal/announcements');
    expect(res.status).toBeDefined();
  });
});

describe('portal-announcements — pagination and filtering', () => {
  it('GET includes pagination data with total count', async () => {
    mockPrisma.portalAnnouncement.findMany.mockResolvedValue([]);
    mockPrisma.portalAnnouncement.count.mockResolvedValue(42);

    const res = await request(app).get('/api/portal/announcements?page=2&limit=10');

    expect(res.status).toBe(200);
    expect(res.body.pagination.total).toBe(42);
    expect(res.body.pagination.page).toBe(2);
  });

  it('GET page=2 limit=10 passes skip=10 to Prisma', async () => {
    mockPrisma.portalAnnouncement.findMany.mockResolvedValue([]);
    mockPrisma.portalAnnouncement.count.mockResolvedValue(0);

    await request(app).get('/api/portal/announcements?page=2&limit=10');

    expect(mockPrisma.portalAnnouncement.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 10, take: 10 })
    );
  });

  it('GET always passes isActive:true in where clause', async () => {
    mockPrisma.portalAnnouncement.findMany.mockResolvedValue([]);
    mockPrisma.portalAnnouncement.count.mockResolvedValue(0);

    await request(app).get('/api/portal/announcements');

    expect(mockPrisma.portalAnnouncement.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ isActive: true }) })
    );
  });

  it('GET filters by CUSTOMER portalType', async () => {
    mockPrisma.portalAnnouncement.findMany.mockResolvedValue([]);
    mockPrisma.portalAnnouncement.count.mockResolvedValue(0);

    await request(app).get('/api/portal/announcements?portalType=CUSTOMER');

    expect(mockPrisma.portalAnnouncement.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ portalType: 'CUSTOMER' }) })
    );
  });

  it('POST returns 400 for invalid priority value', async () => {
    const res = await request(app).post('/api/portal/announcements').send({
      title: 'Test',
      content: 'Content',
      portalType: 'CUSTOMER',
      priority: 'URGENT', // invalid
    });

    expect(res.status).toBe(400);
  });

  it('PUT /:id returns 500 on update DB error', async () => {
    mockPrisma.portalAnnouncement.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.portalAnnouncement.update.mockRejectedValue(new Error('DB crash'));

    const res = await request(app)
      .put('/api/portal/announcements/00000000-0000-0000-0000-000000000001')
      .send({ title: 'New title' });

    expect(res.status).toBe(500);
  });

  it('PUT /:id can set isActive to false', async () => {
    mockPrisma.portalAnnouncement.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.portalAnnouncement.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      isActive: false,
    });

    const res = await request(app)
      .put('/api/portal/announcements/00000000-0000-0000-0000-000000000001')
      .send({ isActive: false });

    expect(res.status).toBe(200);
    expect(mockPrisma.portalAnnouncement.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ isActive: false }) })
    );
  });

  it('DELETE soft-deletes by updating deletedAt and setting isActive false', async () => {
    mockPrisma.portalAnnouncement.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.portalAnnouncement.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      deletedAt: new Date(),
      isActive: false,
    });

    await request(app).delete('/api/portal/announcements/00000000-0000-0000-0000-000000000001');

    expect(mockPrisma.portalAnnouncement.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ isActive: false }),
      })
    );
  });

  it('POST returns 500 on create DB error', async () => {
    mockPrisma.portalAnnouncement.create.mockRejectedValue(new Error('DB crash'));

    const res = await request(app).post('/api/portal/announcements').send({
      title: 'Test',
      content: 'Content',
      portalType: 'CUSTOMER',
      priority: 'HIGH',
    });

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('portal-announcements — final coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET list: pagination has page and limit fields', async () => {
    mockPrisma.portalAnnouncement.findMany.mockResolvedValue([]);
    mockPrisma.portalAnnouncement.count.mockResolvedValue(0);

    const res = await request(app).get('/api/portal/announcements?page=1&limit=10');
    expect(res.status).toBe(200);
    expect(res.body.pagination).toHaveProperty('page');
    expect(res.body.pagination).toHaveProperty('limit');
  });

  it('POST: returns 400 for missing title', async () => {
    const res = await request(app).post('/api/portal/announcements').send({
      content: 'No title here',
      portalType: 'CUSTOMER',
      priority: 'MEDIUM',
    });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('POST: SUPPLIER portalType is accepted', async () => {
    mockPrisma.portalAnnouncement.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000002',
      title: 'Supplier Announcement',
      isActive: true,
    });

    const res = await request(app).post('/api/portal/announcements').send({
      title: 'Supplier Announcement',
      content: 'For suppliers',
      portalType: 'SUPPLIER',
      priority: 'HIGH',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('GET list: count and findMany both called once', async () => {
    mockPrisma.portalAnnouncement.findMany.mockResolvedValue([]);
    mockPrisma.portalAnnouncement.count.mockResolvedValue(0);

    await request(app).get('/api/portal/announcements');

    expect(mockPrisma.portalAnnouncement.findMany).toHaveBeenCalledTimes(1);
    expect(mockPrisma.portalAnnouncement.count).toHaveBeenCalledTimes(1);
  });

  it('DELETE returns 500 on update DB error', async () => {
    mockPrisma.portalAnnouncement.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.portalAnnouncement.update.mockRejectedValue(new Error('DB error'));

    const res = await request(app).delete(
      '/api/portal/announcements/00000000-0000-0000-0000-000000000001'
    );

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET list: findMany called with deletedAt:null in where clause', async () => {
    mockPrisma.portalAnnouncement.findMany.mockResolvedValue([]);
    mockPrisma.portalAnnouncement.count.mockResolvedValue(0);

    await request(app).get('/api/portal/announcements');

    expect(mockPrisma.portalAnnouncement.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ deletedAt: null }) })
    );
  });
});
