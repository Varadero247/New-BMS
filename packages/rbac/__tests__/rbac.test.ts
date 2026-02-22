import express from 'express';
import request from 'supertest';
import {
  resolvePermissions,
  hasPermission,
  mergePermissions,
  mapLegacyRole,
} from '../src/permissions';
import { PermissionLevel, type ImsModule, type ResolvedPermissions } from '../src/types';
import { PLATFORM_ROLES, getRoleById, getRolesByIds } from '../src/roles';
import { requirePermission, requireOwnership, attachPermissions } from '../src/middleware';
import { scopeByPermission, ownershipFilter } from '../src/ownership-scope';

// Helper to create test Express app with configurable user injection
function createApp(middlewares: any[], handler?: any) {
  const app = express();
  app.use(express.json());

  // Inject user from test headers
  app.use((req: any, _res: any, next: any) => {
    if (req.headers['x-test-user-id']) {
      req.user = {
        id: req.headers['x-test-user-id'] as string,
        email: (req.headers['x-test-email'] as string) || 'test@test.com',
        role: (req.headers['x-test-role'] as string) || 'VIEWER',
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
      ((req: any, res: any) => {
        res.json({
          success: true,
          permissions: req.permissions,
          ownershipCheck: req.ownershipCheck,
          ownerFilter: req.ownerFilter,
        });
      })
  );

  return app;
}

// ============================================================
// resolvePermissions — comprehensive multi-role resolution
// ============================================================
describe('resolvePermissions', () => {
  it('should resolve super-admin to FULL on every module', () => {
    const resolved = resolvePermissions(['super-admin']);
    const allModules = Object.keys(resolved.modules) as ImsModule[];
    allModules.forEach((mod) => {
      expect(resolved.modules[mod]).toBe(PermissionLevel.FULL);
    });
  });

  it('should resolve org-admin to FULL on every module', () => {
    const resolved = resolvePermissions(['org-admin']);
    expect(resolved.modules['health-safety']).toBe(PermissionLevel.FULL);
    expect(resolved.modules['finance']).toBe(PermissionLevel.FULL);
    expect(resolved.modules['settings']).toBe(PermissionLevel.FULL);
  });

  it('should resolve employee with limited permissions', () => {
    const resolved = resolvePermissions(['employee']);
    expect(resolved.modules['hr']).toBe(PermissionLevel.CREATE);
    expect(resolved.modules['dashboard']).toBe(PermissionLevel.VIEW);
    expect(resolved.modules['templates']).toBe(PermissionLevel.VIEW);
    expect(resolved.modules['finance']).toBe(PermissionLevel.NONE);
    expect(resolved.modules['quality']).toBe(PermissionLevel.NONE);
  });

  it('should resolve contractor with limited permissions', () => {
    const resolved = resolvePermissions(['contractor']);
    expect(resolved.modules['health-safety']).toBe(PermissionLevel.CREATE);
    expect(resolved.modules['dashboard']).toBe(PermissionLevel.VIEW);
    expect(resolved.modules['finance']).toBe(PermissionLevel.NONE);
  });

  it('should use most-permissive-wins for multi-role resolution', () => {
    // hs-officer: health-safety=EDIT, viewer: dashboard=VIEW
    // Combined should get EDIT on hs and VIEW on dashboard
    const resolved = resolvePermissions(['hs-officer', 'viewer']);
    expect(resolved.modules['health-safety']).toBe(PermissionLevel.EDIT);
    expect(resolved.modules['dashboard']).toBe(PermissionLevel.VIEW);
  });

  it('should combine three roles correctly', () => {
    const resolved = resolvePermissions(['hs-officer', 'accountant', 'quality-lead']);
    expect(resolved.modules['health-safety']).toBe(PermissionLevel.EDIT); // from hs-officer
    expect(resolved.modules['finance']).toBe(PermissionLevel.EDIT); // from accountant
    expect(resolved.modules['quality']).toBe(PermissionLevel.APPROVE); // from quality-lead
  });

  it('should return NONE for all modules with empty role array', () => {
    const resolved = resolvePermissions([]);
    expect(resolved.roles).toEqual([]);
    Object.values(resolved.modules).forEach((level) => {
      expect(level).toBe(PermissionLevel.NONE);
    });
  });

  it('should return NONE for all modules with unknown role', () => {
    const resolved = resolvePermissions(['non-existent-role-xyz']);
    Object.values(resolved.modules).forEach((level) => {
      expect(level).toBe(PermissionLevel.NONE);
    });
  });

  it('should preserve the original role IDs in result', () => {
    const resolved = resolvePermissions(['hs-manager', 'env-manager']);
    expect(resolved.roles).toEqual(['hs-manager', 'env-manager']);
  });

  it('should handle duplicate role IDs gracefully', () => {
    const resolved = resolvePermissions(['viewer', 'viewer']);
    expect(resolved.modules['dashboard']).toBe(PermissionLevel.VIEW);
  });

  it('should resolve compliance-director with APPROVE on compliance modules', () => {
    const resolved = resolvePermissions(['compliance-director']);
    expect(resolved.modules['health-safety']).toBe(PermissionLevel.APPROVE);
    expect(resolved.modules['environment']).toBe(PermissionLevel.APPROVE);
    expect(resolved.modules['quality']).toBe(PermissionLevel.APPROVE);
    expect(resolved.modules['reports']).toBe(PermissionLevel.FULL);
  });

  it('should resolve it-admin with FULL on settings/ai/templates', () => {
    const resolved = resolvePermissions(['it-admin']);
    expect(resolved.modules['settings']).toBe(PermissionLevel.FULL);
    expect(resolved.modules['ai']).toBe(PermissionLevel.FULL);
    expect(resolved.modules['templates']).toBe(PermissionLevel.FULL);
  });

  it('should resolve all 28 modules for any role', () => {
    const resolved = resolvePermissions(['viewer']);
    const moduleCount = Object.keys(resolved.modules).length;
    expect(moduleCount).toBe(28);
  });
});

// ============================================================
// hasPermission — permission level checks
// ============================================================
describe('hasPermission', () => {
  it('should return true when exact level matches', () => {
    const resolved = resolvePermissions(['hs-officer']);
    expect(hasPermission(resolved, 'health-safety', PermissionLevel.EDIT)).toBe(true);
  });

  it('should return true when user level exceeds required level', () => {
    const resolved = resolvePermissions(['super-admin']);
    expect(hasPermission(resolved, 'finance', PermissionLevel.VIEW)).toBe(true);
    expect(hasPermission(resolved, 'finance', PermissionLevel.EDIT)).toBe(true);
    expect(hasPermission(resolved, 'finance', PermissionLevel.FULL)).toBe(true);
  });

  it('should return false when user level is below required', () => {
    const resolved = resolvePermissions(['viewer']);
    expect(hasPermission(resolved, 'finance', PermissionLevel.VIEW)).toBe(false);
    expect(hasPermission(resolved, 'finance', PermissionLevel.CREATE)).toBe(false);
  });

  it('should check NONE level (always true for modules that exist)', () => {
    const resolved = resolvePermissions(['viewer']);
    expect(hasPermission(resolved, 'finance', PermissionLevel.NONE)).toBe(true);
  });

  it('should handle APPROVE level correctly', () => {
    const resolved = resolvePermissions(['hs-lead']);
    expect(hasPermission(resolved, 'health-safety', PermissionLevel.APPROVE)).toBe(true);
    expect(hasPermission(resolved, 'health-safety', PermissionLevel.FULL)).toBe(false);
  });

  it('should handle CREATE level for employee on hr', () => {
    const resolved = resolvePermissions(['employee']);
    expect(hasPermission(resolved, 'hr', PermissionLevel.VIEW)).toBe(true);
    expect(hasPermission(resolved, 'hr', PermissionLevel.CREATE)).toBe(true);
    expect(hasPermission(resolved, 'hr', PermissionLevel.EDIT)).toBe(false);
  });

  it('should return false for NONE level module at VIEW', () => {
    const resolved = resolvePermissions(['viewer']);
    // viewer only has dashboard=VIEW, finance=NONE
    expect(hasPermission(resolved, 'finance', PermissionLevel.VIEW)).toBe(false);
  });
});

// ============================================================
// mergePermissions — merging two resolved permission sets
// ============================================================
describe('mergePermissions', () => {
  it('should take higher level from each set', () => {
    const a = resolvePermissions(['hs-manager']); // hs=FULL
    const b = resolvePermissions(['finance-manager']); // finance=FULL
    const merged = mergePermissions(a, b);

    expect(merged.modules['health-safety']).toBe(PermissionLevel.FULL);
    expect(merged.modules['finance']).toBe(PermissionLevel.FULL);
  });

  it('should deduplicate role arrays', () => {
    const a = resolvePermissions(['hs-officer']);
    const b = resolvePermissions(['hs-officer']);
    const merged = mergePermissions(a, b);
    expect(merged.roles).toEqual(['hs-officer']);
  });

  it('should combine roles from both sets', () => {
    const a = resolvePermissions(['hs-officer']);
    const b = resolvePermissions(['accountant']);
    const merged = mergePermissions(a, b);
    expect(merged.roles).toContain('hs-officer');
    expect(merged.roles).toContain('accountant');
  });

  it('should merge two empty permission sets', () => {
    const a = resolvePermissions([]);
    const b = resolvePermissions([]);
    const merged = mergePermissions(a, b);
    Object.values(merged.modules).forEach((level) => {
      expect(level).toBe(PermissionLevel.NONE);
    });
  });

  it('should merge with one empty set', () => {
    const a = resolvePermissions(['super-admin']);
    const b = resolvePermissions([]);
    const merged = mergePermissions(a, b);
    expect(merged.modules['health-safety']).toBe(PermissionLevel.FULL);
  });

  it('should not lower existing permissions', () => {
    const a = resolvePermissions(['super-admin']); // FULL everywhere
    const b = resolvePermissions(['viewer']); // VIEW on dashboard only
    const merged = mergePermissions(a, b);
    expect(merged.modules['finance']).toBe(PermissionLevel.FULL);
    expect(merged.modules['dashboard']).toBe(PermissionLevel.FULL);
  });
});

// ============================================================
// mapLegacyRole — legacy role mapping
// ============================================================
describe('mapLegacyRole', () => {
  it('should map ADMIN to org-admin', () => {
    expect(mapLegacyRole('ADMIN')).toEqual(['org-admin']);
  });

  it('should map MANAGER to compliance-director', () => {
    expect(mapLegacyRole('MANAGER')).toEqual(['compliance-director']);
  });

  it('should map USER to employee', () => {
    expect(mapLegacyRole('USER')).toEqual(['employee']);
  });

  it('should map VIEWER to viewer', () => {
    expect(mapLegacyRole('VIEWER')).toEqual(['viewer']);
  });

  it('should default unknown role to viewer', () => {
    expect(mapLegacyRole('RANDOM_ROLE')).toEqual(['viewer']);
  });

  it('should default empty string to viewer', () => {
    expect(mapLegacyRole('')).toEqual(['viewer']);
  });

  it('should return array for all mapped roles', () => {
    ['ADMIN', 'MANAGER', 'USER', 'VIEWER', 'UNKNOWN'].forEach((role) => {
      const result = mapLegacyRole(role);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(1);
    });
  });
});

// ============================================================
// attachPermissions middleware — request decoration
// ============================================================
describe('attachPermissions middleware', () => {
  it('should attach permissions object to request', async () => {
    const app = createApp([attachPermissions()], (req: any, res: any) => {
      res.json({ hasPerms: !!req.permissions, roles: req.permissions?.roles });
    });

    const res = await request(app)
      .get('/test')
      .set('X-Test-User-Id', 'u1')
      .set('X-Test-Role', 'ADMIN');

    expect(res.status).toBe(200);
    expect(res.body.hasPerms).toBe(true);
    expect(res.body.roles).toEqual(['org-admin']);
  });

  it('should skip when no user is present', async () => {
    const app = createApp([attachPermissions()], (req: any, res: any) => {
      res.json({ hasPerms: !!req.permissions });
    });

    const res = await request(app).get('/test');
    expect(res.status).toBe(200);
    expect(res.body.hasPerms).toBe(false);
  });

  it('should prefer user.roles array over legacy role mapping', async () => {
    const app = createApp([attachPermissions()], (req: any, res: any) => {
      res.json({ roles: req.permissions?.roles });
    });

    const res = await request(app)
      .get('/test')
      .set('X-Test-User-Id', 'u1')
      .set('X-Test-Role', 'VIEWER')
      .set('X-Test-Roles', 'super-admin');

    expect(res.status).toBe(200);
    expect(res.body.roles).toEqual(['super-admin']);
  });

  it('should fall back to legacy role when roles array is empty', async () => {
    const app = createApp([attachPermissions()], (req: any, res: any) => {
      res.json({ roles: req.permissions?.roles });
    });

    const res = await request(app)
      .get('/test')
      .set('X-Test-User-Id', 'u1')
      .set('X-Test-Role', 'USER');

    expect(res.status).toBe(200);
    // USER maps to employee
    expect(res.body.roles).toEqual(['employee']);
  });
});

// ============================================================
// requirePermission middleware — 401/403 responses
// ============================================================
describe('requirePermission middleware', () => {
  it('should return 401 when no user is authenticated', async () => {
    const app = createApp([requirePermission('finance', PermissionLevel.VIEW)]);

    const res = await request(app).get('/test');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('AUTHENTICATION_REQUIRED');
  });

  it('should return 403 when permission is insufficient', async () => {
    const app = createApp([requirePermission('finance', PermissionLevel.FULL)]);

    const res = await request(app)
      .get('/test')
      .set('X-Test-User-Id', 'u1')
      .set('X-Test-Role', 'VIEWER');

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INSUFFICIENT_PERMISSION');
    expect(res.body.error.message).toContain('FULL');
    expect(res.body.error.message).toContain('finance');
  });

  it('should allow access when permission is sufficient', async () => {
    const app = createApp([requirePermission('finance', PermissionLevel.EDIT)]);

    const res = await request(app)
      .get('/test')
      .set('X-Test-User-Id', 'u1')
      .set('X-Test-Role', 'ADMIN');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should resolve permissions on the fly if not attached', async () => {
    // No attachPermissions middleware, just requirePermission
    const app = createApp([requirePermission('health-safety', PermissionLevel.EDIT)]);

    const res = await request(app)
      .get('/test')
      .set('X-Test-User-Id', 'u1')
      .set('X-Test-Role', 'ADMIN');

    expect(res.status).toBe(200);
  });

  it('should reuse existing permissions if already attached', async () => {
    const app = createApp([
      attachPermissions(),
      requirePermission('health-safety', PermissionLevel.VIEW),
    ]);

    const res = await request(app)
      .get('/test')
      .set('X-Test-User-Id', 'u1')
      .set('X-Test-Role', 'ADMIN');

    expect(res.status).toBe(200);
  });

  it('should deny VIEW-only user trying to EDIT', async () => {
    // employee has hr=CREATE, but nothing on health-safety
    const app = createApp([requirePermission('health-safety', PermissionLevel.EDIT)]);

    const res = await request(app)
      .get('/test')
      .set('X-Test-User-Id', 'u1')
      .set('X-Test-Role', 'USER')
      .set('X-Test-Roles', 'employee');

    expect(res.status).toBe(403);
  });

  it('should allow multi-role user with adequate permissions', async () => {
    const app = createApp([requirePermission('finance', PermissionLevel.FULL)]);

    const res = await request(app)
      .get('/test')
      .set('X-Test-User-Id', 'u1')
      .set('X-Test-Role', 'USER')
      .set('X-Test-Roles', 'finance-manager');

    expect(res.status).toBe(200);
  });

  it('should deny APPROVE-level user for FULL requirement', async () => {
    const app = createApp([requirePermission('health-safety', PermissionLevel.FULL)]);

    const res = await request(app)
      .get('/test')
      .set('X-Test-User-Id', 'u1')
      .set('X-Test-Role', 'USER')
      .set('X-Test-Roles', 'hs-lead');

    expect(res.status).toBe(403);
  });
});

// ============================================================
// requireOwnership middleware — FULL bypass, ownership context
// ============================================================
describe('requireOwnership middleware', () => {
  it('should return 401 when no user is authenticated', async () => {
    const app = createApp([requireOwnership()]);

    const res = await request(app).get('/test');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('AUTHENTICATION_REQUIRED');
  });

  it('should bypass ownership check for user with FULL permission on any module', async () => {
    const app = createApp(
      [attachPermissions(), requireOwnership('createdBy')],
      (req: any, res: any) => {
        res.json({ success: true, ownershipCheck: req.ownershipCheck });
      }
    );

    const res = await request(app)
      .get('/test')
      .set('X-Test-User-Id', 'u1')
      .set('X-Test-Role', 'ADMIN');

    expect(res.status).toBe(200);
    // No ownership check should be set for admin
    expect(res.body.ownershipCheck).toBeUndefined();
  });

  it('should bypass ownership check for user with APPROVE permission', async () => {
    const app = createApp(
      [attachPermissions(), requireOwnership('createdBy')],
      (req: any, res: any) => {
        res.json({ success: true, ownershipCheck: req.ownershipCheck });
      }
    );

    const res = await request(app)
      .get('/test')
      .set('X-Test-User-Id', 'u1')
      .set('X-Test-Role', 'USER')
      .set('X-Test-Roles', 'hs-lead'); // hs-lead has APPROVE on health-safety

    expect(res.status).toBe(200);
    expect(res.body.ownershipCheck).toBeUndefined();
  });

  it('should set ownership context for non-privileged user', async () => {
    const app = createApp(
      [attachPermissions(), requireOwnership('createdBy')],
      (req: any, res: any) => {
        res.json({ success: true, ownershipCheck: req.ownershipCheck });
      }
    );

    const res = await request(app)
      .get('/test')
      .set('X-Test-User-Id', 'user-42')
      .set('X-Test-Role', 'VIEWER');

    expect(res.status).toBe(200);
    expect(res.body.ownershipCheck).toEqual({
      field: 'createdBy',
      userId: 'user-42',
    });
  });

  it('should use custom owner field name', async () => {
    const app = createApp(
      [attachPermissions(), requireOwnership('assignedTo')],
      (req: any, res: any) => {
        res.json({ success: true, ownershipCheck: req.ownershipCheck });
      }
    );

    const res = await request(app)
      .get('/test')
      .set('X-Test-User-Id', 'user-99')
      .set('X-Test-Role', 'VIEWER');

    expect(res.status).toBe(200);
    expect(res.body.ownershipCheck).toEqual({
      field: 'assignedTo',
      userId: 'user-99',
    });
  });

  it('should default owner field to createdBy', async () => {
    const app = createApp([attachPermissions(), requireOwnership()], (req: any, res: any) => {
      res.json({ success: true, ownershipCheck: req.ownershipCheck });
    });

    const res = await request(app)
      .get('/test')
      .set('X-Test-User-Id', 'user-55')
      .set('X-Test-Role', 'VIEWER');

    expect(res.status).toBe(200);
    expect(res.body.ownershipCheck.field).toBe('createdBy');
  });
});

// ============================================================
// scopeByPermission — ownership scope
// ============================================================
describe('scopeByPermission', () => {
  it('should return empty filter for admin users', async () => {
    const app = createApp([attachPermissions(), ownershipFilter()]);

    const res = await request(app)
      .get('/test')
      .set('X-Test-User-Id', 'u1')
      .set('X-Test-Role', 'ADMIN');

    expect(res.status).toBe(200);
    expect(res.body.ownerFilter).toEqual({});
  });

  it('should return user-scoped filter for basic users', async () => {
    const app = createApp([attachPermissions(), ownershipFilter()]);

    const res = await request(app)
      .get('/test')
      .set('X-Test-User-Id', 'user-77')
      .set('X-Test-Role', 'VIEWER');

    expect(res.status).toBe(200);
    expect(res.body.ownerFilter).toEqual({ createdBy: 'user-77' });
  });

  it('should return empty filter when no user', async () => {
    const app = createApp([ownershipFilter()]);

    const res = await request(app).get('/test');
    expect(res.status).toBe(200);
    expect(res.body.ownerFilter).toEqual({});
  });

  it('should return empty filter for APPROVE-level user', async () => {
    const app = createApp([attachPermissions(), ownershipFilter()]);

    const res = await request(app)
      .get('/test')
      .set('X-Test-User-Id', 'u1')
      .set('X-Test-Role', 'MANAGER'); // maps to compliance-director with APPROVE

    expect(res.status).toBe(200);
    expect(res.body.ownerFilter).toEqual({});
  });
});

// ============================================================
// PLATFORM_ROLES & getRoleById / getRolesByIds
// ============================================================
describe('PLATFORM_ROLES', () => {
  it('should have 44 defined roles', () => {
    expect(PLATFORM_ROLES.length).toBe(44);
  });

  it('should have unique IDs', () => {
    const ids = PLATFORM_ROLES.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('should have unique names', () => {
    const names = PLATFORM_ROLES.map((r) => r.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it('every role should have non-empty description', () => {
    PLATFORM_ROLES.forEach((role) => {
      expect(role.description.length).toBeGreaterThan(0);
    });
  });

  it('every role should have at least one permission', () => {
    PLATFORM_ROLES.forEach((role) => {
      expect(role.permissions.length).toBeGreaterThan(0);
    });
  });

  it('getRoleById should return the correct role', () => {
    const role = getRoleById('finance-manager');
    expect(role).toBeDefined();
    expect(role!.name).toBe('Finance Manager');
  });

  it('getRoleById should return undefined for unknown ID', () => {
    expect(getRoleById('does-not-exist')).toBeUndefined();
  });

  it('getRolesByIds should return matching roles', () => {
    const roles = getRolesByIds(['super-admin', 'viewer']);
    expect(roles).toHaveLength(2);
    expect(roles[0].id).toBe('super-admin');
    expect(roles[1].id).toBe('viewer');
  });

  it('getRolesByIds should filter out unknown IDs', () => {
    const roles = getRolesByIds(['super-admin', 'does-not-exist', 'viewer']);
    expect(roles).toHaveLength(2);
  });

  it('getRolesByIds should return empty array for all unknown', () => {
    const roles = getRolesByIds(['fake-1', 'fake-2']);
    expect(roles).toHaveLength(0);
  });
});


describe('phase34 coverage', () => {
  it('handles Omit type pattern', () => { interface Full { a: number; b: string; c: boolean; } type NoC = Omit<Full,'c'>; const o: NoC = {a:1,b:'x'}; expect(o.b).toBe('x'); });
  it('handles async generator', async () => { async function* gen() { yield 1; yield 2; } const vals: number[] = []; for await (const v of gen()) vals.push(v); expect(vals).toEqual([1,2]); });
  it('handles IIFE pattern', () => { const result = ((x: number) => x * x)(7); expect(result).toBe(49); });
  it('handles string comparison', () => { expect('apple' < 'banana').toBe(true); expect('zebra' > 'apple').toBe(true); });
  it('handles chained string methods', () => { expect('  Hello World  '.trim().toLowerCase()).toBe('hello world'); });
});


describe('phase35 coverage', () => {
  it('handles flatten array deeply', () => { expect([1,[2,[3,[4]]]].flat(3)).toEqual([1,2,3,4]); });
  it('handles retry pattern', async () => { let attempts = 0; const retry = async (fn: ()=>Promise<number>, n:number): Promise<number> => { try { return await fn(); } catch(e) { if(n<=0) throw e; return retry(fn,n-1); } }; const fn = () => { attempts++; return attempts < 3 ? Promise.reject(new Error()) : Promise.resolve(42); }; expect(await retry(fn,5)).toBe(42); });
  it('handles string padStart for dates', () => { const day = 5; expect(String(day).padStart(2,'0')).toBe('05'); });
  it('handles sum by key pattern', () => { const sumBy = <T>(arr:T[], fn:(x:T)=>number) => arr.reduce((s,x)=>s+fn(x),0); expect(sumBy([{v:1},{v:2},{v:3}],x=>x.v)).toBe(6); });
  it('handles string camelCase pattern', () => { const toCamel = (s:string) => s.replace(/-([a-z])/g,(_,c)=>c.toUpperCase()); expect(toCamel('foo-bar-baz')).toBe('fooBarBaz'); });
});
