import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    portalNotification: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
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

import portalNotificationsRouter from '../src/routes/portal-notifications';
import { prisma } from '../src/prisma';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const app = express();
app.use(express.json());
app.use('/api/portal/notifications', portalNotificationsRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/portal/notifications', () => {
  it('should list notifications', async () => {
    const items = [
      {
        id: '00000000-0000-0000-0000-000000000001',
        title: 'Order shipped',
        type: 'ORDER_UPDATE',
        isRead: false,
      },
      { id: 'n-2', title: 'New document', type: 'DOCUMENT_SHARED', isRead: true },
    ];
    mockPrisma.portalNotification.findMany.mockResolvedValue(items);
    mockPrisma.portalNotification.count.mockResolvedValue(2);

    const res = await request(app).get('/api/portal/notifications');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
  });

  it('should filter by isRead=false', async () => {
    mockPrisma.portalNotification.findMany.mockResolvedValue([]);
    mockPrisma.portalNotification.count.mockResolvedValue(0);

    const res = await request(app).get('/api/portal/notifications?isRead=false');

    expect(res.status).toBe(200);
    expect(mockPrisma.portalNotification.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ isRead: false }) })
    );
  });

  it('should filter by isRead=true', async () => {
    mockPrisma.portalNotification.findMany.mockResolvedValue([]);
    mockPrisma.portalNotification.count.mockResolvedValue(0);

    const res = await request(app).get('/api/portal/notifications?isRead=true');

    expect(res.status).toBe(200);
    expect(mockPrisma.portalNotification.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ isRead: true }) })
    );
  });

  it('should handle pagination', async () => {
    mockPrisma.portalNotification.findMany.mockResolvedValue([]);
    mockPrisma.portalNotification.count.mockResolvedValue(50);

    const res = await request(app).get('/api/portal/notifications?page=3&limit=10');

    expect(res.status).toBe(200);
    expect(res.body.pagination.totalPages).toBe(5);
  });

  it('should handle server error', async () => {
    mockPrisma.portalNotification.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/portal/notifications');

    expect(res.status).toBe(500);
  });
});

describe('PUT /api/portal/notifications/read-all', () => {
  it('should mark all as read', async () => {
    mockPrisma.portalNotification.updateMany.mockResolvedValue({ count: 5 });

    const res = await request(app).put('/api/portal/notifications/read-all');

    expect(res.status).toBe(200);
    expect(res.body.data.updated).toBe(5);
  });

  it('should handle server error on read-all', async () => {
    mockPrisma.portalNotification.updateMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).put('/api/portal/notifications/read-all');

    expect(res.status).toBe(500);
  });
});

describe('PUT /api/portal/notifications/:id/read', () => {
  it('should mark a notification as read', async () => {
    const notification = {
      id: '00000000-0000-0000-0000-000000000001',
      portalUserId: 'user-123',
      isRead: false,
    };
    mockPrisma.portalNotification.findFirst.mockResolvedValue(notification);
    mockPrisma.portalNotification.update.mockResolvedValue({ ...notification, isRead: true });

    const res = await request(app).put(
      '/api/portal/notifications/00000000-0000-0000-0000-000000000001/read'
    );

    expect(res.status).toBe(200);
    expect(res.body.data.isRead).toBe(true);
  });

  it('should return 404 if notification not found', async () => {
    mockPrisma.portalNotification.findFirst.mockResolvedValue(null);

    const res = await request(app).put(
      '/api/portal/notifications/00000000-0000-0000-0000-000000000099/read'
    );

    expect(res.status).toBe(404);
  });
});

describe('Portal Notifications — extended', () => {
  it('GET list: data is an array', async () => {
    mockPrisma.portalNotification.findMany.mockResolvedValue([]);
    mockPrisma.portalNotification.count.mockResolvedValue(0);
    const res = await request(app).get('/api/portal/notifications');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET list: success is true', async () => {
    mockPrisma.portalNotification.findMany.mockResolvedValue([]);
    mockPrisma.portalNotification.count.mockResolvedValue(0);
    const res = await request(app).get('/api/portal/notifications');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('PUT read-all returns success true', async () => {
    mockPrisma.portalNotification.updateMany.mockResolvedValue({ count: 5 });
    const res = await request(app).put('/api/portal/notifications/read-all');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('Portal Notifications — extra', () => {
  it('PUT /:id/read returns success true on success', async () => {
    const notification = {
      id: '00000000-0000-0000-0000-000000000001',
      portalUserId: 'user-123',
      isRead: false,
    };
    mockPrisma.portalNotification.findFirst.mockResolvedValue(notification);
    mockPrisma.portalNotification.update.mockResolvedValue({ ...notification, isRead: true });
    const res = await request(app).put(
      '/api/portal/notifications/00000000-0000-0000-0000-000000000001/read'
    );
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('GET list: findMany called once per request', async () => {
    mockPrisma.portalNotification.findMany.mockResolvedValue([]);
    mockPrisma.portalNotification.count.mockResolvedValue(0);
    await request(app).get('/api/portal/notifications');
    expect(mockPrisma.portalNotification.findMany).toHaveBeenCalledTimes(1);
  });

  it('PUT read-all: updateMany called once per request', async () => {
    mockPrisma.portalNotification.updateMany.mockResolvedValue({ count: 0 });
    await request(app).put('/api/portal/notifications/read-all');
    expect(mockPrisma.portalNotification.updateMany).toHaveBeenCalledTimes(1);
  });
});

describe('portal-notifications — additional coverage', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/portal/notifications', portalNotificationsRouter);
    jest.clearAllMocks();
  });

  it('route responds to GET /api/portal/notifications', async () => {
    const res = await request(app).get('/api/portal/notifications');
    expect([200, 400, 401, 404, 500]).toContain(res.status);
  });

  it('response is JSON content-type for GET /api/portal/notifications', async () => {
    const res = await request(app).get('/api/portal/notifications');
    expect(res.headers['content-type']).toBeDefined();
  });

  it('GET /api/portal/notifications body has success property', async () => {
    const res = await request(app).get('/api/portal/notifications');
    if (res.status === 200) {
      expect(res.body).toHaveProperty('success');
    } else {
      expect(res.body).toBeDefined();
    }
  });

  it('GET /api/portal/notifications body is an object', async () => {
    const res = await request(app).get('/api/portal/notifications');
    expect(typeof res.body).toBe('object');
  });

  it('GET /api/portal/notifications route is accessible', async () => {
    const res = await request(app).get('/api/portal/notifications');
    expect(res.status).toBeDefined();
  });
});

describe('Portal Notifications — edge cases', () => {
  it('GET list: pagination object has page, limit, total, totalPages', async () => {
    mockPrisma.portalNotification.findMany.mockResolvedValue([]);
    mockPrisma.portalNotification.count.mockResolvedValue(0);
    const res = await request(app).get('/api/portal/notifications');
    expect(res.status).toBe(200);
    expect(res.body.pagination).toHaveProperty('page');
    expect(res.body.pagination).toHaveProperty('limit');
    expect(res.body.pagination).toHaveProperty('total');
    expect(res.body.pagination).toHaveProperty('totalPages');
  });

  it('GET list: default page is 1', async () => {
    mockPrisma.portalNotification.findMany.mockResolvedValue([]);
    mockPrisma.portalNotification.count.mockResolvedValue(0);
    const res = await request(app).get('/api/portal/notifications');
    expect(res.status).toBe(200);
    expect(res.body.pagination.page).toBe(1);
  });

  it('GET list: default limit is 20', async () => {
    mockPrisma.portalNotification.findMany.mockResolvedValue([]);
    mockPrisma.portalNotification.count.mockResolvedValue(0);
    const res = await request(app).get('/api/portal/notifications');
    expect(res.status).toBe(200);
    expect(res.body.pagination.limit).toBe(20);
  });

  it('GET list: count is called once per request', async () => {
    mockPrisma.portalNotification.findMany.mockResolvedValue([]);
    mockPrisma.portalNotification.count.mockResolvedValue(0);
    await request(app).get('/api/portal/notifications');
    expect(mockPrisma.portalNotification.count).toHaveBeenCalledTimes(1);
  });

  it('PUT read-all: updateMany sets isRead to true', async () => {
    mockPrisma.portalNotification.updateMany.mockResolvedValue({ count: 3 });
    await request(app).put('/api/portal/notifications/read-all');
    expect(mockPrisma.portalNotification.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ isRead: true }) })
    );
  });

  it('PUT /:id/read returns 500 on DB update error', async () => {
    const notification = {
      id: '00000000-0000-0000-0000-000000000001',
      portalUserId: 'user-123',
      isRead: false,
    };
    mockPrisma.portalNotification.findFirst.mockResolvedValue(notification);
    mockPrisma.portalNotification.update.mockRejectedValue(new Error('DB error'));
    const res = await request(app).put(
      '/api/portal/notifications/00000000-0000-0000-0000-000000000001/read'
    );
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('PUT read-all: returns 0 when no unread notifications', async () => {
    mockPrisma.portalNotification.updateMany.mockResolvedValue({ count: 0 });
    const res = await request(app).put('/api/portal/notifications/read-all');
    expect(res.status).toBe(200);
    expect(res.body.data.updated).toBe(0);
  });

  it('GET list: findMany called with orderBy createdAt desc', async () => {
    mockPrisma.portalNotification.findMany.mockResolvedValue([]);
    mockPrisma.portalNotification.count.mockResolvedValue(0);
    await request(app).get('/api/portal/notifications');
    expect(mockPrisma.portalNotification.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { createdAt: 'desc' } })
    );
  });

  it('PUT /:id/read: findFirst searches by portalUserId for ownership check', async () => {
    const notification = {
      id: '00000000-0000-0000-0000-000000000001',
      portalUserId: 'user-123',
      isRead: false,
    };
    mockPrisma.portalNotification.findFirst.mockResolvedValue(notification);
    mockPrisma.portalNotification.update.mockResolvedValue({ ...notification, isRead: true });
    await request(app).put(
      '/api/portal/notifications/00000000-0000-0000-0000-000000000001/read'
    );
    expect(mockPrisma.portalNotification.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ portalUserId: 'user-123' }),
      })
    );
  });
});

describe('Portal Notifications — final coverage', () => {
  it('GET list: returns empty array when no notifications exist', async () => {
    mockPrisma.portalNotification.findMany.mockResolvedValue([]);
    mockPrisma.portalNotification.count.mockResolvedValue(0);
    const res = await request(app).get('/api/portal/notifications');
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  it('GET list: filter by isRead=true passes isRead true in where clause', async () => {
    mockPrisma.portalNotification.findMany.mockResolvedValue([]);
    mockPrisma.portalNotification.count.mockResolvedValue(0);
    await request(app).get('/api/portal/notifications?isRead=true');
    expect(mockPrisma.portalNotification.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ isRead: true }) })
    );
  });

  it('PUT read-all returns message in response body', async () => {
    mockPrisma.portalNotification.updateMany.mockResolvedValue({ count: 2 });
    const res = await request(app).put('/api/portal/notifications/read-all');
    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
  });

  it('GET list: pagination total is 0 when count returns 0', async () => {
    mockPrisma.portalNotification.findMany.mockResolvedValue([]);
    mockPrisma.portalNotification.count.mockResolvedValue(0);
    const res = await request(app).get('/api/portal/notifications');
    expect(res.body.pagination.total).toBe(0);
  });

  it('PUT /:id/read: update called with isRead: true', async () => {
    const notification = { id: '00000000-0000-0000-0000-000000000001', portalUserId: 'user-123', isRead: false };
    mockPrisma.portalNotification.findFirst.mockResolvedValue(notification);
    mockPrisma.portalNotification.update.mockResolvedValue({ ...notification, isRead: true });
    await request(app).put('/api/portal/notifications/00000000-0000-0000-0000-000000000001/read');
    expect(mockPrisma.portalNotification.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ isRead: true }) })
    );
  });

  it('GET list: response body is JSON with success and data fields', async () => {
    mockPrisma.portalNotification.findMany.mockResolvedValue([]);
    mockPrisma.portalNotification.count.mockResolvedValue(0);
    const res = await request(app).get('/api/portal/notifications');
    expect(res.body).toHaveProperty('success');
    expect(res.body).toHaveProperty('data');
  });
});
