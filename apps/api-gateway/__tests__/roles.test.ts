import express from 'express';
import request from 'supertest';

// Mock dependencies
const mockAuthenticate = jest.fn((req: any, _res: any, next: any) => {
  req.user = {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'admin@ims.local',
    role: 'ADMIN',
  };
  next();
});

const mockRequireRole = jest.fn((...roles: string[]) => {
  return (req: any, res: any, next: any) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
      });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Insufficient permissions' },
      });
    }
    next();
  };
});

jest.mock('@ims/auth', () => ({
  authenticate: (...args: any[]) => mockAuthenticate(...args),
  requireRole: (...args: any[]) => mockRequireRole(...args),
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  }),
}));

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
  },
  customRole: {
    findMany: jest.fn().mockResolvedValue([]),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  accessLog: {
    findMany: jest.fn().mockResolvedValue([]),
    create: jest.fn(),
    count: jest.fn().mockResolvedValue(0),
  },
};

jest.mock('@ims/database', () => ({
  prisma: mockPrisma,
}));

import rolesRouter from '../src/routes/roles';

describe('Roles Routes', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    // Mount at /api so all router sub-paths are reachable
    // (In production, it's dual-mounted at /api/roles and /api/access-log)
    app.use('/api', rolesRouter);
  });

  afterEach(() => {
    jest.clearAllMocks();
    // Reset authenticate to default admin user
    mockAuthenticate.mockImplementation((req: any, _res: any, next: any) => {
      req.user = {
        id: '00000000-0000-0000-0000-000000000001',
        email: 'admin@ims.local',
        role: 'ADMIN',
      };
      next();
    });
  });

  // ==========================================
  // GET /api/roles — List all platform roles
  // ==========================================
  describe('GET /api/roles', () => {
    it('should return an array of roles', async () => {
      const response = await request(app).get('/api').set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.meta.total).toBe(response.body.data.length);
    });

    it('should return roles with correct shape', async () => {
      const response = await request(app).get('/api').set('Authorization', 'Bearer token');

      const role = response.body.data[0];
      expect(role).toHaveProperty('id');
      expect(role).toHaveProperty('name');
      expect(role).toHaveProperty('description');
      expect(role).toHaveProperty('isSystem');
      expect(role).toHaveProperty('permissionCount');
      expect(role).toHaveProperty('permissions');
      expect(Array.isArray(role.permissions)).toBe(true);
    });

    it('should include permission details for each role', async () => {
      const response = await request(app).get('/api').set('Authorization', 'Bearer token');

      const superAdmin = response.body.data.find((r: any) => r.id === 'super-admin');
      expect(superAdmin).toBeDefined();
      expect(superAdmin.name).toBe('Super Administrator');
      expect(superAdmin.permissionCount).toBeGreaterThan(0);
      expect(superAdmin.permissions[0]).toHaveProperty('module');
      expect(superAdmin.permissions[0]).toHaveProperty('level');
      expect(superAdmin.permissions[0]).toHaveProperty('levelName');
    });

    it('should return all expected role tiers', async () => {
      const response = await request(app).get('/api').set('Authorization', 'Bearer token');

      const roleIds = response.body.data.map((r: any) => r.id);
      // Check representative roles from each tier
      expect(roleIds).toContain('super-admin');
      expect(roleIds).toContain('org-admin');
      expect(roleIds).toContain('hs-manager');
      expect(roleIds).toContain('hs-lead');
      expect(roleIds).toContain('hs-officer');
      expect(roleIds).toContain('employee');
      expect(roleIds).toContain('viewer');
    });

    it('should mark all built-in roles as system roles', async () => {
      const response = await request(app).get('/api').set('Authorization', 'Bearer token');

      response.body.data.forEach((role: any) => {
        expect(role.isSystem).toBe(true);
      });
    });
  });

  // ==========================================
  // GET /api/modules — List all IMS modules
  // ==========================================
  describe('GET /api/modules', () => {
    it('should return list of all IMS modules', async () => {
      const response = await request(app).get('/api/modules').set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should return modules with id and formatted name', async () => {
      const response = await request(app).get('/api/modules').set('Authorization', 'Bearer token');

      const module = response.body.data[0];
      expect(module).toHaveProperty('id');
      expect(module).toHaveProperty('name');
    });

    it('should include known modules', async () => {
      const response = await request(app).get('/api/modules').set('Authorization', 'Bearer token');

      const moduleIds = response.body.data.map((m: any) => m.id);
      expect(moduleIds).toContain('health-safety');
      expect(moduleIds).toContain('environment');
      expect(moduleIds).toContain('quality');
      expect(moduleIds).toContain('hr');
      expect(moduleIds).toContain('finance');
      expect(moduleIds).toContain('dashboard');
    });

    it('should format module names with title case', async () => {
      const response = await request(app).get('/api/modules').set('Authorization', 'Bearer token');

      const hsModule = response.body.data.find((m: any) => m.id === 'health-safety');
      expect(hsModule).toBeDefined();
      expect(hsModule.name).toBe('Health Safety');
    });
  });

  // ==========================================
  // GET /api/:id — Get role detail
  // ==========================================
  describe('GET /api/:id', () => {
    it('should return role details for valid ID', async () => {
      const response = await request(app)
        .get('/api/super-admin')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('super-admin');
      expect(response.body.data.name).toBe('Super Administrator');
      expect(response.body.data.description).toBe('Full system access');
      expect(response.body.data.isSystem).toBe(true);
      expect(Array.isArray(response.body.data.permissions)).toBe(true);
    });

    it('should return permissions with module/level/levelName', async () => {
      const response = await request(app)
        .get('/api/hs-manager')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      const perm = response.body.data.permissions[0];
      expect(perm).toHaveProperty('module');
      expect(perm).toHaveProperty('level');
      expect(perm).toHaveProperty('levelName');
    });

    it('should return 404 for non-existent role', async () => {
      const response = await request(app)
        .get('/api/non-existent-role')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
      expect(response.body.error.message).toContain('non-existent-role');
    });

    it('should return 404 for empty role ID', async () => {
      const response = await request(app)
        .get('/api/xyz-invalid-123')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  // ==========================================
  // POST /api/resolve — Resolve permissions for role IDs
  // ==========================================
  describe('POST /api/resolve', () => {
    it('should resolve permissions for valid role IDs', async () => {
      const response = await request(app)
        .post('/api/resolve')
        .set('Authorization', 'Bearer token')
        .send({ roles: ['super-admin'] });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('roles');
      expect(response.body.data).toHaveProperty('modules');
      expect(response.body.data.roles).toContain('super-admin');
    });

    it('should return module permissions with level and name', async () => {
      const response = await request(app)
        .post('/api/resolve')
        .set('Authorization', 'Bearer token')
        .send({ roles: ['hs-manager'] });

      expect(response.status).toBe(200);
      const modules = response.body.data.modules;
      expect(modules['health-safety']).toBeDefined();
      expect(modules['health-safety']).toHaveProperty('level');
      expect(modules['health-safety']).toHaveProperty('name');
    });

    it('should merge permissions for multiple roles (most permissive wins)', async () => {
      const response = await request(app)
        .post('/api/resolve')
        .set('Authorization', 'Bearer token')
        .send({ roles: ['hs-officer', 'env-officer'] });

      expect(response.status).toBe(200);
      const modules = response.body.data.modules;
      // Both officers have EDIT on their respective modules
      expect(modules['health-safety'].level).toBeGreaterThanOrEqual(3); // EDIT
      expect(modules['environment'].level).toBeGreaterThanOrEqual(3); // EDIT
    });

    it('should return 400 for empty roles array', async () => {
      const response = await request(app)
        .post('/api/resolve')
        .set('Authorization', 'Bearer token')
        .send({ roles: [] });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for missing roles field', async () => {
      const response = await request(app)
        .post('/api/resolve')
        .set('Authorization', 'Bearer token')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid role IDs', async () => {
      const response = await request(app)
        .post('/api/resolve')
        .set('Authorization', 'Bearer token')
        .send({ roles: ['totally-fake-role'] });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_ROLES');
      expect(response.body.error.message).toContain('totally-fake-role');
    });

    it('should return 400 when some role IDs are invalid', async () => {
      const response = await request(app)
        .post('/api/resolve')
        .set('Authorization', 'Bearer token')
        .send({ roles: ['super-admin', 'nonexistent'] });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_ROLES');
      expect(response.body.error.message).toContain('nonexistent');
    });

    it('should return 400 for non-array roles', async () => {
      const response = await request(app)
        .post('/api/resolve')
        .set('Authorization', 'Bearer token')
        .send({ roles: 'super-admin' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  // ==========================================
  // GET /api/users/:userId/permissions — Get user permissions
  // ==========================================
  describe('GET /api/users/:userId/permissions', () => {
    const userId = '00000000-0000-0000-0000-000000000001';
    const otherUserId = '00000000-0000-0000-0000-000000000002';

    it('should return permissions for own user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: userId,
        email: 'admin@ims.local',
        role: 'ADMIN',
        firstName: 'Admin',
        lastName: 'User',
      });

      const response = await request(app)
        .get(`/api/users/${userId}/permissions`)
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.userId).toBe(userId);
      expect(response.body.data.email).toBe('admin@ims.local');
      expect(response.body.data.name).toBe('Admin User');
      expect(response.body.data.legacyRole).toBe('ADMIN');
      expect(response.body.data.rbacRoles).toBeDefined();
      expect(response.body.data.modules).toBeDefined();
    });

    it('should allow admin to view other user permissions', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: otherUserId,
        email: 'user@ims.local',
        role: 'USER',
        firstName: 'Normal',
        lastName: 'User',
      });

      const response = await request(app)
        .get(`/api/users/${otherUserId}/permissions`)
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.userId).toBe(otherUserId);
      expect(response.body.data.legacyRole).toBe('USER');
    });

    it('should allow manager to view other user permissions', async () => {
      mockAuthenticate.mockImplementation((req: any, _res: any, next: any) => {
        req.user = {
          id: '00000000-0000-0000-0000-000000000003',
          email: 'manager@ims.local',
          role: 'MANAGER',
        };
        next();
      });

      mockPrisma.user.findUnique.mockResolvedValue({
        id: otherUserId,
        email: 'user@ims.local',
        role: 'USER',
        firstName: 'Normal',
        lastName: 'User',
      });

      const response = await request(app)
        .get(`/api/users/${otherUserId}/permissions`)
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 403 for non-admin viewing other user permissions', async () => {
      mockAuthenticate.mockImplementation((req: any, _res: any, next: any) => {
        req.user = {
          id: '00000000-0000-0000-0000-000000000005',
          email: 'viewer@ims.local',
          role: 'VIEWER',
        };
        next();
      });

      const response = await request(app)
        .get(`/api/users/${otherUserId}/permissions`)
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('FORBIDDEN');
    });

    it('should return 404 for non-existent user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .get(`/api/users/${userId}/permissions`)
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should return modules with level and name in permissions', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: userId,
        email: 'admin@ims.local',
        role: 'ADMIN',
        firstName: 'Admin',
        lastName: 'User',
      });

      const response = await request(app)
        .get(`/api/users/${userId}/permissions`)
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      const modules = response.body.data.modules;
      // ADMIN maps to org-admin which has FULL on everything
      const firstModule = Object.values(modules)[0] as Record<string, unknown>;
      expect(firstModule).toHaveProperty('level');
      expect(firstModule).toHaveProperty('name');
    });

    it('should handle prisma errors gracefully', async () => {
      mockPrisma.user.findUnique.mockRejectedValue(new Error('DB error'));

      const response = await request(app)
        .get(`/api/users/${userId}/permissions`)
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // ==========================================
  // PATCH /api/users/:userId/roles — Update user roles (Admin only)
  // ==========================================
  describe('PATCH /api/users/:userId/roles', () => {
    const targetUserId = '00000000-0000-0000-0000-000000000010';

    it('should update user roles as admin', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: targetUserId,
        email: 'target@ims.local',
        firstName: 'Target',
        lastName: 'User',
        role: 'USER',
      });

      const response = await request(app)
        .patch(`/api/users/${targetUserId}/roles`)
        .set('Authorization', 'Bearer token')
        .send({ roles: ['hs-manager', 'env-officer'] });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.userId).toBe(targetUserId);
      expect(response.body.data.email).toBe('target@ims.local');
      expect(response.body.data.assignedRoles).toEqual(['hs-manager', 'env-officer']);
      expect(response.body.data.effectivePermissions).toBeDefined();
    });

    it('should return 403 for non-admin users', async () => {
      mockAuthenticate.mockImplementation((req: any, _res: any, next: any) => {
        req.user = {
          id: '00000000-0000-0000-0000-000000000005',
          email: 'user@ims.local',
          role: 'USER',
        };
        next();
      });

      const response = await request(app)
        .patch(`/api/users/${targetUserId}/roles`)
        .set('Authorization', 'Bearer token')
        .send({ roles: ['hs-manager'] });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('FORBIDDEN');
    });

    it('should return 400 for empty roles array', async () => {
      const response = await request(app)
        .patch(`/api/users/${targetUserId}/roles`)
        .set('Authorization', 'Bearer token')
        .send({ roles: [] });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid role IDs', async () => {
      const response = await request(app)
        .patch(`/api/users/${targetUserId}/roles`)
        .set('Authorization', 'Bearer token')
        .send({ roles: ['fake-role'] });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_ROLES');
    });

    it('should return 400 for missing roles field', async () => {
      const response = await request(app)
        .patch(`/api/users/${targetUserId}/roles`)
        .set('Authorization', 'Bearer token')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 404 for non-existent user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .patch(`/api/users/${targetUserId}/roles`)
        .set('Authorization', 'Bearer token')
        .send({ roles: ['hs-manager'] });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should return effective permissions in response', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: targetUserId,
        email: 'target@ims.local',
        firstName: 'Target',
        lastName: 'User',
        role: 'USER',
      });

      const response = await request(app)
        .patch(`/api/users/${targetUserId}/roles`)
        .set('Authorization', 'Bearer token')
        .send({ roles: ['super-admin'] });

      expect(response.status).toBe(200);
      const perms = response.body.data.effectivePermissions;
      expect(perms['health-safety']).toBeDefined();
      expect(perms['health-safety'].level).toBe(6); // FULL
      expect(perms['health-safety'].name).toBe('FULL');
    });

    it('should handle prisma errors gracefully', async () => {
      mockPrisma.user.findUnique.mockRejectedValue(new Error('DB error'));

      const response = await request(app)
        .patch(`/api/users/${targetUserId}/roles`)
        .set('Authorization', 'Bearer token')
        .send({ roles: ['hs-manager'] });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // ==========================================
  // GET /api/access-log — List audit entries
  // access-log routes are defined before /:id in the router
  // ==========================================
  describe('GET /api/access-log', () => {
    beforeAll(async () => {
      // Seed multiple entries
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post('/api/access-log')
          .set('Authorization', 'Bearer token')
          .send({
            module: i < 3 ? 'health-safety' : 'quality',
            action: i < 2 ? 'VIEW' : 'EDIT',
            resource: `record-${i}`,
            details: `Test entry ${i}`,
          });
      }
    });

    it('should return paginated audit entries', async () => {
      const response = await request(app)
        .get('/api/access-log')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.meta).toBeDefined();
      expect(response.body.meta.page).toBe(1);
      expect(response.body.meta.limit).toBe(50);
      expect(response.body.meta.total).toBeDefined();
      expect(response.body.meta.totalPages).toBeDefined();
    });

    it('should support pagination parameters', async () => {
      const response = await request(app)
        .get('/api/access-log?page=1&limit=2')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.meta.page).toBe(1);
      expect(response.body.meta.limit).toBe(2);
      expect(response.body.data.length).toBeLessThanOrEqual(2);
    });

    it('should cap limit at 200', async () => {
      const response = await request(app)
        .get('/api/access-log?limit=500')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.meta.limit).toBe(200);
    });

    it('should default page to 1 for invalid values', async () => {
      const response = await request(app)
        .get('/api/access-log?page=-1')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.meta.page).toBe(1);
    });

    it('should filter by action', async () => {
      const response = await request(app)
        .get('/api/access-log?action=VIEW')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      if (response.body.data.length > 0) {
        response.body.data.forEach((entry: any) => {
          expect(entry.action).toBe('VIEW');
        });
      }
    });

    it('should filter by module', async () => {
      const response = await request(app)
        .get('/api/access-log?module=health-safety')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      if (response.body.data.length > 0) {
        response.body.data.forEach((entry: any) => {
          expect(entry.module).toBe('health-safety');
        });
      }
    });

    it('should return entries with correct shape', async () => {
      const response = await request(app)
        .get('/api/access-log')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      if (response.body.data.length > 0) {
        const entry = response.body.data[0];
        expect(entry).toHaveProperty('id');
        expect(entry).toHaveProperty('userId');
        expect(entry).toHaveProperty('userEmail');
        expect(entry).toHaveProperty('module');
        expect(entry).toHaveProperty('action');
        expect(entry).toHaveProperty('timestamp');
      }
    });
  });

  // ==========================================
  // POST /api/access-log — Record audit entry
  // ==========================================
  describe('POST /api/access-log', () => {
    it('should create an audit entry', async () => {
      const response = await request(app)
        .post('/api/access-log')
        .set('Authorization', 'Bearer token')
        .send({
          module: 'health-safety',
          action: 'CREATE',
          resource: 'risk-assessment-1',
          details: 'Created new risk assessment',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.userId).toBe('00000000-0000-0000-0000-000000000001');
      expect(response.body.data.userEmail).toBe('admin@ims.local');
      expect(response.body.data.module).toBe('health-safety');
      expect(response.body.data.action).toBe('CREATE');
      expect(response.body.data.resource).toBe('risk-assessment-1');
      expect(response.body.data.details).toBe('Created new risk assessment');
      expect(response.body.data.timestamp).toBeDefined();
    });

    it('should create entry with required fields only', async () => {
      const response = await request(app)
        .post('/api/access-log')
        .set('Authorization', 'Bearer token')
        .send({
          module: 'quality',
          action: 'VIEW',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.module).toBe('quality');
      expect(response.body.data.action).toBe('VIEW');
    });

    it('should return 400 for missing module', async () => {
      const response = await request(app)
        .post('/api/access-log')
        .set('Authorization', 'Bearer token')
        .send({ action: 'VIEW' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for missing action', async () => {
      const response = await request(app)
        .post('/api/access-log')
        .set('Authorization', 'Bearer token')
        .send({ module: 'quality' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for empty module string', async () => {
      const response = await request(app)
        .post('/api/access-log')
        .set('Authorization', 'Bearer token')
        .send({ module: '', action: 'VIEW' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for empty action string', async () => {
      const response = await request(app)
        .post('/api/access-log')
        .set('Authorization', 'Bearer token')
        .send({ module: 'quality', action: '' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for empty body', async () => {
      const response = await request(app)
        .post('/api/access-log')
        .set('Authorization', 'Bearer token')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should include user email from authenticated user', async () => {
      mockAuthenticate.mockImplementation((req: any, _res: any, next: any) => {
        req.user = {
          id: '00000000-0000-0000-0000-000000000099',
          email: 'custom@ims.local',
          role: 'ADMIN',
        };
        next();
      });

      const response = await request(app)
        .post('/api/access-log')
        .set('Authorization', 'Bearer token')
        .send({ module: 'hr', action: 'DELETE' });

      expect(response.status).toBe(201);
      expect(response.body.data.userId).toBe('00000000-0000-0000-0000-000000000099');
      expect(response.body.data.userEmail).toBe('custom@ims.local');
    });
  });
});
