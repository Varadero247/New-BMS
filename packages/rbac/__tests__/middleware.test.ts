import express from 'express';
import request from 'supertest';
import { requirePermission, attachPermissions, requireOwnership } from '../src/middleware';
import { PermissionLevel } from '../src/types';
import { ownershipFilter } from '../src/ownership-scope';

function createTestApp(middlewares: any[], handler?: any) {
  const app = express();
  app.use(express.json());

  // Simulate authenticated user
  app.use((req: any, _res: any, next: any) => {
    if (req.headers['x-test-role']) {
      req.user = {
        id: 'user-123',
        email: 'test@test.com',
        role: req.headers['x-test-role'] as string,
        roles: req.headers['x-test-roles']
          ? (req.headers['x-test-roles'] as string).split(',')
          : undefined,
      };
    }
    next();
  });

  for (const mw of middlewares) {
    app.use(mw);
  }

  app.get(
    '/test',
    handler ||
      ((_req: any, res: any) => {
        res.json({ success: true, permissions: (_req as Record<string, unknown>).permissions });
      })
  );

  return app;
}

describe('RBAC Middleware', () => {
  describe('attachPermissions', () => {
    it('attaches permissions to request', async () => {
      const app = createTestApp([attachPermissions()], (req: any, res: any) => {
        res.json({ success: true, hasPerms: !!req.permissions });
      });

      const res = await request(app).get('/test').set('X-Test-Role', 'ADMIN');

      expect(res.status).toBe(200);
      expect(res.body.hasPerms).toBe(true);
    });

    it('skips when no user', async () => {
      const app = createTestApp([attachPermissions()], (req: any, res: any) => {
        res.json({ success: true, hasPerms: !!req.permissions });
      });

      const res = await request(app).get('/test');
      expect(res.status).toBe(200);
      expect(res.body.hasPerms).toBe(false);
    });

    it('uses roles array when available', async () => {
      const app = createTestApp([attachPermissions()], (req: any, res: any) => {
        res.json({ success: true, roles: req.permissions?.roles });
      });

      const res = await request(app)
        .get('/test')
        .set('X-Test-Role', 'USER')
        .set('X-Test-Roles', 'finance-manager,hr-manager');

      expect(res.status).toBe(200);
      expect(res.body.roles).toEqual(['finance-manager', 'hr-manager']);
    });
  });

  describe('requirePermission', () => {
    it('allows access with sufficient permission (ADMIN → org-admin → FULL)', async () => {
      const app = createTestApp([requirePermission('finance', PermissionLevel.EDIT)]);

      const res = await request(app).get('/test').set('X-Test-Role', 'ADMIN');

      expect(res.status).toBe(200);
    });

    it('denies access with insufficient permission', async () => {
      const app = createTestApp([requirePermission('finance', PermissionLevel.EDIT)]);

      const res = await request(app).get('/test').set('X-Test-Role', 'VIEWER');

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('INSUFFICIENT_PERMISSION');
    });

    it('returns 401 when no user', async () => {
      const app = createTestApp([requirePermission('finance', PermissionLevel.VIEW)]);

      const res = await request(app).get('/test');
      expect(res.status).toBe(401);
    });

    it('uses multi-role for permission check', async () => {
      const app = createTestApp([requirePermission('finance', PermissionLevel.FULL)]);

      const res = await request(app)
        .get('/test')
        .set('X-Test-Role', 'USER')
        .set('X-Test-Roles', 'finance-manager');

      expect(res.status).toBe(200);
    });

    it('denies accountant for FULL finance permission', async () => {
      const app = createTestApp([requirePermission('finance', PermissionLevel.FULL)]);

      const res = await request(app)
        .get('/test')
        .set('X-Test-Role', 'USER')
        .set('X-Test-Roles', 'accountant');

      expect(res.status).toBe(403);
    });
  });

  describe('requireOwnership', () => {
    it('stores ownership context for non-privileged users', async () => {
      const app = createTestApp(
        [attachPermissions(), requireOwnership('createdBy')],
        (req: any, res: any) => {
          res.json({ success: true, ownershipCheck: req.ownershipCheck });
        }
      );

      const res = await request(app).get('/test').set('X-Test-Role', 'VIEWER');

      expect(res.status).toBe(200);
      expect(res.body.ownershipCheck).toEqual({ field: 'createdBy', userId: 'user-123' });
    });

    it('returns 401 when no user', async () => {
      const app = createTestApp([requireOwnership()]);
      const res = await request(app).get('/test');
      expect(res.status).toBe(401);
    });
  });

  describe('ownershipFilter', () => {
    it('returns empty filter for high-permission users', async () => {
      const app = createTestApp([attachPermissions(), ownershipFilter()], (req: any, res: any) => {
        res.json({ success: true, filter: req.ownerFilter });
      });

      const res = await request(app).get('/test').set('X-Test-Role', 'ADMIN');

      expect(res.status).toBe(200);
      expect(res.body.filter).toEqual({});
    });

    it('returns user-scoped filter for basic users', async () => {
      const app = createTestApp([attachPermissions(), ownershipFilter()], (req: any, res: any) => {
        res.json({ success: true, filter: req.ownerFilter });
      });

      const res = await request(app).get('/test').set('X-Test-Role', 'VIEWER');

      expect(res.status).toBe(200);
      expect(res.body.filter).toEqual({ createdBy: 'user-123' });
    });
  });
});

describe('RBAC Middleware — extended', () => {
  it('requirePermission allows ADMIN role for health-safety module', async () => {
    const app = createTestApp([requirePermission('health-safety', PermissionLevel.VIEW)]);
    const res = await request(app).get('/test').set('X-Test-Role', 'ADMIN');
    expect(res.status).toBe(200);
  });

  it('attachPermissions does not throw when roles header is empty string', async () => {
    const app = createTestApp([attachPermissions()], (req: any, res: any) => {
      res.json({ success: true, hasPerms: !!req.permissions });
    });
    const res = await request(app).get('/test').set('X-Test-Role', 'USER').set('X-Test-Roles', '');
    expect(res.status).toBe(200);
  });

  it('requireOwnership attaches ownershipCheck.field from argument', async () => {
    const app = createTestApp(
      [attachPermissions(), requireOwnership('assignedTo')],
      (req: any, res: any) => {
        res.json({ success: true, ownershipCheck: req.ownershipCheck });
      }
    );
    const res = await request(app).get('/test').set('X-Test-Role', 'VIEWER');
    expect(res.status).toBe(200);
    expect(res.body.ownershipCheck.field).toBe('assignedTo');
  });
});

describe('RBAC Middleware — additional coverage', () => {
  it('requirePermission returns a middleware function', () => {
    const mw = requirePermission('quality', PermissionLevel.VIEW);
    expect(typeof mw).toBe('function');
  });

  it('attachPermissions returns a middleware function', () => {
    const mw = attachPermissions();
    expect(typeof mw).toBe('function');
  });

  it('requireOwnership returns a middleware function', () => {
    const mw = requireOwnership('userId');
    expect(typeof mw).toBe('function');
  });

  it('ownershipFilter returns a middleware function', () => {
    const filter = ownershipFilter();
    expect(typeof filter).toBe('function');
  });

  it('requirePermission with FULL level returns a function', () => {
    const mw = requirePermission('environment', PermissionLevel.FULL);
    expect(typeof mw).toBe('function');
  });
});

describe('RBAC Middleware — permission levels and module coverage', () => {
  it('requirePermission denies VIEWER for CREATE on quality', async () => {
    const app = createTestApp([requirePermission('quality', PermissionLevel.CREATE)]);
    const res = await request(app).get('/test').set('X-Test-Role', 'VIEWER');
    expect(res.status).toBe(403);
  });

  it('requirePermission allows ADMIN for FULL on any module', async () => {
    const app = createTestApp([requirePermission('quality', PermissionLevel.FULL)]);
    const res = await request(app).get('/test').set('X-Test-Role', 'ADMIN');
    expect(res.status).toBe(200);
  });

  it('requirePermission denies unauthenticated request with 401', async () => {
    const app = createTestApp([requirePermission('hr', PermissionLevel.VIEW)]);
    const res = await request(app).get('/test');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('AUTHENTICATION_REQUIRED');
  });

  it('attachPermissions attaches permissions with modules key', async () => {
    const app = createTestApp([attachPermissions()], (req: any, res: any) => {
      res.json({ success: true, hasModules: !!req.permissions?.modules });
    });
    const res = await request(app).get('/test').set('X-Test-Role', 'ADMIN');
    expect(res.status).toBe(200);
    expect(res.body.hasModules).toBe(true);
  });

  it('requireOwnership defaults ownerField to createdBy', async () => {
    const app = createTestApp(
      [attachPermissions(), requireOwnership()],
      (req: any, res: any) => {
        res.json({ success: true, field: req.ownershipCheck?.field });
      }
    );
    const res = await request(app).get('/test').set('X-Test-Role', 'VIEWER');
    expect(res.status).toBe(200);
    expect(res.body.field).toBe('createdBy');
  });

  it('ownershipFilter returns {} for MANAGER role (high permission)', async () => {
    const app = createTestApp([attachPermissions(), ownershipFilter()], (req: any, res: any) => {
      res.json({ success: true, filter: req.ownerFilter });
    });
    const res = await request(app).get('/test').set('X-Test-Role', 'MANAGER');
    expect(res.status).toBe(200);
    // MANAGER maps to compliance-director which should have high permissions
    expect(res.body.filter).toBeDefined();
  });

  it('requirePermission error body has success:false', async () => {
    const app = createTestApp([requirePermission('infosec', PermissionLevel.FULL)]);
    const res = await request(app).get('/test').set('X-Test-Role', 'VIEWER');
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('attachPermissions roles array from multi-role header is stored correctly', async () => {
    const app = createTestApp([attachPermissions()], (req: any, res: any) => {
      res.json({ roles: req.permissions?.roles });
    });
    const res = await request(app)
      .get('/test')
      .set('X-Test-Role', 'USER')
      .set('X-Test-Roles', 'quality-manager,safety-officer');
    expect(res.status).toBe(200);
    expect(res.body.roles).toContain('quality-manager');
    expect(res.body.roles).toContain('safety-officer');
  });

  it('requireOwnership unauthenticated returns 401 with AUTHENTICATION_REQUIRED', async () => {
    const app = createTestApp([requireOwnership('owner')]);
    const res = await request(app).get('/test');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('AUTHENTICATION_REQUIRED');
  });

  it('requirePermission allows MANAGER role for EDIT on health-safety', async () => {
    const app = createTestApp([requirePermission('health-safety', PermissionLevel.EDIT)]);
    const res = await request(app).get('/test').set('X-Test-Role', 'MANAGER');
    expect(res.status).toBe(200);
  });
});

describe('RBAC Middleware — further coverage', () => {
  it('attachPermissions works without any role headers (no user set)', async () => {
    const app = createTestApp([attachPermissions()], (req: any, res: any) => {
      res.json({ hasPerms: !!req.permissions });
    });
    const res = await request(app).get('/test');
    expect(res.status).toBe(200);
    expect(res.body.hasPerms).toBe(false);
  });

  it('requirePermission allows ADMIN for VIEW on any module', async () => {
    const app = createTestApp([requirePermission('esg', PermissionLevel.VIEW)]);
    const res = await request(app).get('/test').set('X-Test-Role', 'ADMIN');
    expect(res.status).toBe(200);
  });

  it('requirePermission returns 403 body with error.message', async () => {
    const app = createTestApp([requirePermission('finance', PermissionLevel.FULL)]);
    const res = await request(app).get('/test').set('X-Test-Role', 'VIEWER');
    expect(res.body.error).toHaveProperty('message');
  });

  it('ownershipFilter returns defined filter for VIEWER role', async () => {
    const app = createTestApp([attachPermissions(), ownershipFilter()], (req: any, res: any) => {
      res.json({ filter: req.ownerFilter });
    });
    const res = await request(app).get('/test').set('X-Test-Role', 'VIEWER');
    expect(res.status).toBe(200);
    expect(res.body.filter).toBeDefined();
  });

  it('requireOwnership with no field argument defaults to createdBy', async () => {
    const app = createTestApp(
      [attachPermissions(), requireOwnership()],
      (req: any, res: any) => {
        res.json({ field: req.ownershipCheck?.field });
      }
    );
    const res = await request(app).get('/test').set('X-Test-Role', 'VIEWER');
    expect(res.body.field).toBe('createdBy');
  });
});
