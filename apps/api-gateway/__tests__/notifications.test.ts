import express from 'express';
import request from 'supertest';

// Mock dependencies
const mockAuthenticate = jest.fn((req: any, _res: any, next: any) => {
  req.user = {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'admin@ims.local',
    organisationId: 'org-1',
    roles: ['SUPER_ADMIN', 'ORG_ADMIN'],
  };
  next();
});

jest.mock('@ims/auth', () => ({
  authenticate: (...args: any[]) => mockAuthenticate(...args),
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  }),
}));

jest.mock('@ims/database', () => ({
  prisma: {},
}));

import notificationsRouter, { bellState } from '../src/routes/notifications';

// ==========================================
// Tests
// ==========================================

describe('Notifications Routes', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/notifications', notificationsRouter);
  });

  afterEach(() => {
    // Reset authenticate to default admin user
    mockAuthenticate.mockImplementation((req: any, _res: any, next: any) => {
      req.user = {
        id: '00000000-0000-0000-0000-000000000001',
        email: 'admin@ims.local',
        organisationId: 'org-1',
        roles: ['SUPER_ADMIN', 'ORG_ADMIN'],
      };
      next();
    });
    // Clear notification state
    bellState.clear('00000000-0000-0000-0000-000000000001');
    bellState.clear('00000000-0000-0000-0000-000000000002');
    bellState.clear('00000000-0000-0000-0000-000000000099');
  });

  // ==========================================
  // GET /api/notifications
  // ==========================================
  describe('GET /api/notifications', () => {
    it('should return empty list when no notifications exist', async () => {
      const response = await request(app)
        .get('/api/notifications')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.items).toEqual([]);
      expect(response.body.data.total).toBe(0);
      expect(response.body.data.unreadCount).toBe(0);
    });

    it('should return notifications for the authenticated user', async () => {
      // Seed a notification
      bellState.addNotification('00000000-0000-0000-0000-000000000001', {
        id: 'notif-1',
        type: 'INFO',
        title: 'Test',
        message: 'Test message',
        severity: 'LOW',
        createdAt: new Date(),
        read: false,
        module: 'system',
      });

      const response = await request(app)
        .get('/api/notifications')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.items).toHaveLength(1);
      expect(response.body.data.items[0].id).toBe('notif-1');
      expect(response.body.data.total).toBe(1);
      expect(response.body.data.unreadCount).toBe(1);
    });

    it('should support pagination with page and limit', async () => {
      // Seed 5 notifications
      for (let i = 1; i <= 5; i++) {
        bellState.addNotification('00000000-0000-0000-0000-000000000001', {
          id: `notif-page-${i}`,
          type: 'INFO',
          title: `Test ${i}`,
          message: `Message ${i}`,
          severity: 'LOW',
          createdAt: new Date(),
          read: false,
          module: 'system',
        });
      }

      const response = await request(app)
        .get('/api/notifications?page=1&limit=2')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.data.items).toHaveLength(2);
      expect(response.body.data.total).toBe(5);
      expect(response.body.data.page).toBe(1);
      expect(response.body.data.limit).toBe(2);
      expect(response.body.data.totalPages).toBe(3);
    });

    it('should return page 2 of paginated results', async () => {
      for (let i = 1; i <= 5; i++) {
        bellState.addNotification('00000000-0000-0000-0000-000000000001', {
          id: `notif-p2-${i}`,
          type: 'INFO',
          title: `Test ${i}`,
          message: `Message ${i}`,
          severity: 'LOW',
          createdAt: new Date(),
          read: false,
          module: 'system',
        });
      }

      const response = await request(app)
        .get('/api/notifications?page=2&limit=2')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.data.items).toHaveLength(2);
      expect(response.body.data.page).toBe(2);
    });

    it('should default to page 1 and limit 20', async () => {
      const response = await request(app)
        .get('/api/notifications')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.data.page).toBe(1);
      expect(response.body.data.limit).toBe(20);
    });

    it('should not return notifications for other users', async () => {
      bellState.addNotification('00000000-0000-0000-0000-000000000002', {
        id: 'other-user-notif',
        type: 'ALERT',
        title: 'Other user',
        message: 'Not for you',
        severity: 'HIGH',
        createdAt: new Date(),
        read: false,
        module: 'system',
      });

      const response = await request(app)
        .get('/api/notifications')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.data.items).toHaveLength(0);
    });
  });

  // ==========================================
  // GET /api/notifications/unread
  // ==========================================
  describe('GET /api/notifications/unread', () => {
    it('should return 0 unread when no notifications exist', async () => {
      const response = await request(app)
        .get('/api/notifications/unread')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.unreadCount).toBe(0);
    });

    it('should return correct unread count', async () => {
      bellState.addNotification('00000000-0000-0000-0000-000000000001', {
        id: 'unread-1',
        type: 'INFO',
        title: 'Unread 1',
        message: 'Unread',
        severity: 'LOW',
        createdAt: new Date(),
        read: false,
        module: 'system',
      });
      bellState.addNotification('00000000-0000-0000-0000-000000000001', {
        id: 'unread-2',
        type: 'WARNING',
        title: 'Unread 2',
        message: 'Unread',
        severity: 'MEDIUM',
        createdAt: new Date(),
        read: false,
        module: 'system',
      });
      bellState.addNotification('00000000-0000-0000-0000-000000000001', {
        id: 'read-1',
        type: 'SUCCESS',
        title: 'Read',
        message: 'Already read',
        severity: 'LOW',
        createdAt: new Date(),
        read: true,
        module: 'system',
      });

      const response = await request(app)
        .get('/api/notifications/unread')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.data.unreadCount).toBe(2);
    });

    it('should return 0 after marking all as read', async () => {
      bellState.addNotification('00000000-0000-0000-0000-000000000001', {
        id: 'to-mark-1',
        type: 'INFO',
        title: 'To mark',
        message: 'To mark',
        severity: 'LOW',
        createdAt: new Date(),
        read: false,
        module: 'system',
      });

      bellState.markAllRead('00000000-0000-0000-0000-000000000001');

      const response = await request(app)
        .get('/api/notifications/unread')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.data.unreadCount).toBe(0);
    });
  });

  // ==========================================
  // PUT /api/notifications/:id/read
  // ==========================================
  describe('PUT /api/notifications/:id/read', () => {
    it('should mark a notification as read', async () => {
      bellState.addNotification('00000000-0000-0000-0000-000000000001', {
        id: '00000000-0000-0000-0000-000000000001',
        type: 'ALERT',
        title: 'Mark me',
        message: 'Mark me as read',
        severity: 'HIGH',
        createdAt: new Date(),
        read: false,
        module: 'system',
      });

      const response = await request(app)
        .put('/api/notifications/00000000-0000-0000-0000-000000000001/read')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
      expect(response.body.data.read).toBe(true);
    });

    it('should return 404 for non-existent notification', async () => {
      const response = await request(app)
        .put('/api/notifications/00000000-0000-0000-0000-000000000099/read')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should not find notifications belonging to other users', async () => {
      bellState.addNotification('00000000-0000-0000-0000-000000000002', {
        id: '00000000-0000-0000-0000-000000000099',
        type: 'INFO',
        title: 'Other user',
        message: 'Not yours',
        severity: 'LOW',
        createdAt: new Date(),
        read: false,
        module: 'system',
      });

      const response = await request(app)
        .put('/api/notifications/00000000-0000-0000-0000-000000000099/read')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should successfully mark an already read notification', async () => {
      bellState.addNotification('00000000-0000-0000-0000-000000000001', {
        id: '00000000-0000-0000-0000-000000000001',
        type: 'INFO',
        title: 'Already read',
        message: 'Already read',
        severity: 'LOW',
        createdAt: new Date(),
        read: true,
        module: 'system',
      });

      const response = await request(app)
        .put('/api/notifications/00000000-0000-0000-0000-000000000001/read')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  // ==========================================
  // PUT /api/notifications/read-all
  // ==========================================
  describe('PUT /api/notifications/read-all', () => {
    it('should mark all notifications as read', async () => {
      bellState.addNotification('00000000-0000-0000-0000-000000000001', {
        id: 'read-all-1',
        type: 'INFO',
        title: 'Read all 1',
        message: 'Test',
        severity: 'LOW',
        createdAt: new Date(),
        read: false,
        module: 'system',
      });
      bellState.addNotification('00000000-0000-0000-0000-000000000001', {
        id: 'read-all-2',
        type: 'WARNING',
        title: 'Read all 2',
        message: 'Test',
        severity: 'MEDIUM',
        createdAt: new Date(),
        read: false,
        module: 'system',
      });

      const response = await request(app)
        .put('/api/notifications/read-all')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.markedCount).toBe(2);
    });

    it('should return 0 when no unread notifications', async () => {
      const response = await request(app)
        .put('/api/notifications/read-all')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.markedCount).toBe(0);
    });

    it('should only count unread notifications', async () => {
      bellState.addNotification('00000000-0000-0000-0000-000000000001', {
        id: 'mixed-1',
        type: 'INFO',
        title: 'Unread',
        message: 'Test',
        severity: 'LOW',
        createdAt: new Date(),
        read: false,
        module: 'system',
      });
      bellState.addNotification('00000000-0000-0000-0000-000000000001', {
        id: 'mixed-2',
        type: 'INFO',
        title: 'Already read',
        message: 'Test',
        severity: 'LOW',
        createdAt: new Date(),
        read: true,
        module: 'system',
      });

      const response = await request(app)
        .put('/api/notifications/read-all')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.data.markedCount).toBe(1);
    });

    it('should verify unread count is 0 after read-all', async () => {
      bellState.addNotification('00000000-0000-0000-0000-000000000001', {
        id: 'verify-1',
        type: 'ALERT',
        title: 'Verify',
        message: 'Test',
        severity: 'HIGH',
        createdAt: new Date(),
        read: false,
        module: 'system',
      });

      await request(app)
        .put('/api/notifications/read-all')
        .set('Authorization', 'Bearer token');

      const response = await request(app)
        .get('/api/notifications/unread')
        .set('Authorization', 'Bearer token');

      expect(response.body.data.unreadCount).toBe(0);
    });
  });

  // ==========================================
  // POST /api/notifications/test
  // ==========================================
  describe('POST /api/notifications/test', () => {
    it('should create a test notification', async () => {
      const response = await request(app)
        .post('/api/notifications/test')
        .set('Authorization', 'Bearer token')
        .send({
          title: 'Test Notification',
          message: 'This is a test',
          type: 'INFO',
          severity: 'LOW',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.title).toBe('Test Notification');
      expect(response.body.data.message).toBe('This is a test');
      expect(response.body.data.type).toBe('INFO');
      expect(response.body.data.severity).toBe('LOW');
      expect(response.body.data.read).toBe(false);
    });

    it('should default type to INFO and severity to LOW', async () => {
      const response = await request(app)
        .post('/api/notifications/test')
        .set('Authorization', 'Bearer token')
        .send({
          title: 'Defaults Test',
          message: 'Test defaults',
        });

      expect(response.status).toBe(201);
      expect(response.body.data.type).toBe('INFO');
      expect(response.body.data.severity).toBe('LOW');
    });

    it('should reject non-admin users', async () => {
      mockAuthenticate.mockImplementation((req: any, _res: any, next: any) => {
        req.user = {
          id: '00000000-0000-0000-0000-000000000099',
          email: 'viewer@ims.local',
          organisationId: 'org-1',
          roles: ['VIEWER'],
        };
        next();
      });

      const response = await request(app)
        .post('/api/notifications/test')
        .set('Authorization', 'Bearer token')
        .send({
          title: 'Test',
          message: 'Should fail',
        });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('FORBIDDEN');
    });

    it('should require title', async () => {
      const response = await request(app)
        .post('/api/notifications/test')
        .set('Authorization', 'Bearer token')
        .send({
          message: 'No title',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.message).toContain('title');
    });

    it('should require message', async () => {
      const response = await request(app)
        .post('/api/notifications/test')
        .set('Authorization', 'Bearer token')
        .send({
          title: 'No message',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.message).toContain('message');
    });

    it('should reject invalid type', async () => {
      const response = await request(app)
        .post('/api/notifications/test')
        .set('Authorization', 'Bearer token')
        .send({
          title: 'Test',
          message: 'Test',
          type: 'INVALID_TYPE',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject invalid severity', async () => {
      const response = await request(app)
        .post('/api/notifications/test')
        .set('Authorization', 'Bearer token')
        .send({
          title: 'Test',
          message: 'Test',
          severity: 'EXTREME',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should send notification to targetUserId if provided', async () => {
      const response = await request(app)
        .post('/api/notifications/test')
        .set('Authorization', 'Bearer token')
        .send({
          title: 'For other user',
          message: 'Targeted',
          targetUserId: '00000000-0000-0000-0000-000000000002',
        });

      expect(response.status).toBe(201);
      expect(response.body.data.userId).toBe('00000000-0000-0000-0000-000000000002');

      // Verify notification was stored for target user
      const unread = bellState.getUnread('00000000-0000-0000-0000-000000000002');
      expect(unread).toHaveLength(1);
      expect(unread[0].title).toBe('For other user');
    });

    it('should default to sender as recipient when no targetUserId', async () => {
      const response = await request(app)
        .post('/api/notifications/test')
        .set('Authorization', 'Bearer token')
        .send({
          title: 'For self',
          message: 'Self targeted',
        });

      expect(response.status).toBe(201);
      expect(response.body.data.userId).toBe('00000000-0000-0000-0000-000000000001');
    });

    it('should include testNotification flag in data', async () => {
      const response = await request(app)
        .post('/api/notifications/test')
        .set('Authorization', 'Bearer token')
        .send({
          title: 'Data test',
          message: 'Check data',
        });

      expect(response.status).toBe(201);
      expect(response.body.data.data.testNotification).toBe(true);
      expect(response.body.data.data.sentBy).toBe('00000000-0000-0000-0000-000000000001');
    });

    it('should accept all valid notification types', async () => {
      const types = ['ALERT', 'WARNING', 'INFO', 'SUCCESS', 'OVERDUE', 'DUE_SOON', 'ESCALATION'];

      for (const type of types) {
        const response = await request(app)
          .post('/api/notifications/test')
          .set('Authorization', 'Bearer token')
          .send({ title: `${type} test`, message: 'Test', type });

        expect(response.status).toBe(201);
        expect(response.body.data.type).toBe(type);
      }
    });

    it('should accept all valid severity levels', async () => {
      const severities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

      for (const severity of severities) {
        const response = await request(app)
          .post('/api/notifications/test')
          .set('Authorization', 'Bearer token')
          .send({ title: `${severity} test`, message: 'Test', severity });

        expect(response.status).toBe(201);
        expect(response.body.data.severity).toBe(severity);
      }
    });

    it('should reject empty title string', async () => {
      const response = await request(app)
        .post('/api/notifications/test')
        .set('Authorization', 'Bearer token')
        .send({ title: '   ', message: 'Test' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject empty message string', async () => {
      const response = await request(app)
        .post('/api/notifications/test')
        .set('Authorization', 'Bearer token')
        .send({ title: 'Test', message: '   ' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });
});
