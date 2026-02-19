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
