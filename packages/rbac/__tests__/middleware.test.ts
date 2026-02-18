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
        res.json({ success: true, permissions: (_req as any).permissions });
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
