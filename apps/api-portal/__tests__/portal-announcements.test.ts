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

const app = express();
app.use(express.json());
app.use('/api/portal/announcements', portalAnnouncementsRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/portal/announcements', () => {
  it('should list active announcements', async () => {
    const items = [
      { id: 'a-1', title: 'System Update', isActive: true, portalType: 'CUSTOMER' },
    ];
    (prisma as any).portalAnnouncement.findMany.mockResolvedValue(items);
    (prisma as any).portalAnnouncement.count.mockResolvedValue(1);

    const res = await request(app).get('/api/portal/announcements');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  it('should filter by portalType', async () => {
    (prisma as any).portalAnnouncement.findMany.mockResolvedValue([]);
    (prisma as any).portalAnnouncement.count.mockResolvedValue(0);

    const res = await request(app).get('/api/portal/announcements?portalType=SUPPLIER');

    expect(res.status).toBe(200);
    expect((prisma as any).portalAnnouncement.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ portalType: 'SUPPLIER' }) })
    );
  });

  it('should handle server error', async () => {
    (prisma as any).portalAnnouncement.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/portal/announcements');

    expect(res.status).toBe(500);
  });
});

describe('POST /api/portal/announcements', () => {
  it('should create an announcement', async () => {
    const announcement = { id: 'a-1', title: 'New Feature', isActive: true };
    (prisma as any).portalAnnouncement.create.mockResolvedValue(announcement);

    const res = await request(app)
      .post('/api/portal/announcements')
      .send({ title: 'New Feature', content: 'We launched a new feature', portalType: 'CUSTOMER', priority: 'HIGH' });

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
    (prisma as any).portalAnnouncement.findFirst.mockResolvedValue({ id: 'a-1' });
    (prisma as any).portalAnnouncement.update.mockResolvedValue({ id: 'a-1', title: 'Updated' });

    const res = await request(app)
      .put('/api/portal/announcements/a-1')
      .send({ title: 'Updated' });

    expect(res.status).toBe(200);
  });

  it('should return 404 for update if not found', async () => {
    (prisma as any).portalAnnouncement.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/portal/announcements/nonexistent')
      .send({ title: 'Updated' });

    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/portal/announcements/:id', () => {
  it('should soft-delete an announcement', async () => {
    (prisma as any).portalAnnouncement.findFirst.mockResolvedValue({ id: 'a-1' });
    (prisma as any).portalAnnouncement.update.mockResolvedValue({ id: 'a-1', deletedAt: new Date(), isActive: false });

    const res = await request(app).delete('/api/portal/announcements/a-1');

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('a-1');
  });

  it('should return 404 for delete if not found', async () => {
    (prisma as any).portalAnnouncement.findFirst.mockResolvedValue(null);

    const res = await request(app).delete('/api/portal/announcements/nonexistent');

    expect(res.status).toBe(404);
  });

  it('should handle server error on delete', async () => {
    (prisma as any).portalAnnouncement.findFirst.mockRejectedValue(new Error('DB error'));

    const res = await request(app).delete('/api/portal/announcements/a-1');

    expect(res.status).toBe(500);
  });
});
