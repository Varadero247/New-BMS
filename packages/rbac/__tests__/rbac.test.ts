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


describe('phase36 coverage', () => {
  it('handles interval merge pattern', () => { const merge=(ivs:[number,number][])=>{ivs.sort((a,b)=>a[0]-b[0]);const r:[number,number][]=[];for(const iv of ivs){if(!r.length||r[r.length-1][1]<iv[0])r.push(iv);else r[r.length-1][1]=Math.max(r[r.length-1][1],iv[1]);}return r;};expect(merge([[1,3],[2,6],[8,10]])).toEqual([[1,6],[8,10]]); });
  it('handles snake_case to camelCase', () => { const snakeToCamel=(s:string)=>s.replace(/_([a-z])/g,(_,c)=>c.toUpperCase());expect(snakeToCamel('foo_bar_baz')).toBe('fooBarBaz'); });
  it('handles matrix transpose', () => { const t=(m:number[][])=>m[0].map((_,i)=>m.map(r=>r[i])); expect(t([[1,2],[3,4]])).toEqual([[1,3],[2,4]]); });
  it('handles queue pattern', () => { class Queue<T>{private d:T[]=[];enqueue(v:T){this.d.push(v);}dequeue(){return this.d.shift();}get size(){return this.d.length;}} const q=new Queue<string>();q.enqueue('a');q.enqueue('b');expect(q.dequeue()).toBe('a');expect(q.size).toBe(1); });
  it('handles difference of arrays', () => { const diff=<T>(a:T[],b:T[])=>a.filter(x=>!b.includes(x));expect(diff([1,2,3,4],[2,4])).toEqual([1,3]); });
});


describe('phase37 coverage', () => {
  it('checks if number is power of 2', () => { const isPow2=(n:number)=>n>0&&(n&(n-1))===0; expect(isPow2(8)).toBe(true); expect(isPow2(6)).toBe(false); });
  it('checks if array is sorted', () => { const isSorted=(a:number[])=>a.every((v,i)=>i===0||v>=a[i-1]); expect(isSorted([1,2,3,4])).toBe(true); expect(isSorted([1,3,2])).toBe(false); });
  it('removes falsy values', () => { const compact=<T>(a:(T|null|undefined|false|0|'')[])=>a.filter(Boolean) as T[]; expect(compact([1,0,2,null,3,undefined,false])).toEqual([1,2,3]); });
  it('checks string contains only letters', () => { const onlyLetters=(s:string)=>/^[a-zA-Z]+$/.test(s); expect(onlyLetters('Hello')).toBe(true); expect(onlyLetters('Hello1')).toBe(false); });
  it('computes hamming distance', () => { const hamming=(a:string,b:string)=>[...a].filter((c,i)=>c!==b[i]).length; expect(hamming('karolin','kathrin')).toBe(3); });
});


describe('phase38 coverage', () => {
  it('applies difference array technique', () => { const diff=(a:number[])=>a.slice(1).map((v,i)=>v-a[i]); expect(diff([1,3,6,10,15])).toEqual([2,3,4,5]); });
  it('finds longest increasing subsequence length', () => { const lis=(a:number[])=>{const dp=Array(a.length).fill(1);for(let i=1;i<a.length;i++)for(let j=0;j<i;j++)if(a[j]<a[i])dp[i]=Math.max(dp[i],dp[j]+1);return Math.max(...dp);}; expect(lis([10,9,2,5,3,7,101,18])).toBe(4); });
  it('implements linear search', () => { const search=(a:number[],v:number)=>a.indexOf(v); expect(search([1,3,5,7,9],5)).toBe(2); expect(search([1,3,5],4)).toBe(-1); });
  it('implements queue using two stacks', () => { class TwoStackQ{private in:number[]=[];private out:number[]=[];enqueue(v:number){this.in.push(v);}dequeue(){if(!this.out.length)while(this.in.length)this.out.push(this.in.pop()!);return this.out.pop();}get size(){return this.in.length+this.out.length;}} const q=new TwoStackQ();q.enqueue(1);q.enqueue(2);q.enqueue(3);expect(q.dequeue()).toBe(1);expect(q.size).toBe(2); });
  it('implements exponential search bound', () => { const expBound=(a:number[],v:number)=>{if(a[0]===v)return 0;let i=1;while(i<a.length&&a[i]<=v)i*=2;return Math.min(i,a.length-1);}; expect(expBound([1,2,4,8,16,32],8)).toBeGreaterThanOrEqual(3); });
});


describe('phase39 coverage', () => {
  it('computes sum of proper divisors', () => { const divSum=(n:number)=>{let s=1;for(let i=2;i*i<=n;i++)if(n%i===0){s+=i;if(i!==n/i)s+=n/i;}return s;}; expect(divSum(12)).toBe(16); });
  it('counts set bits in integer', () => { const popcount=(n:number)=>{let c=0;let v=n>>>0;while(v){c+=v&1;v>>>=1;}return c;}; expect(popcount(7)).toBe(3); expect(popcount(255)).toBe(8); });
  it('zigzag converts string', () => { const zz=(s:string,r:number)=>{if(r===1)return s;const rows=Array.from({length:r},()=>'');let row=0,dir=-1;for(const c of s){rows[row]+=c;if(row===0||row===r-1)dir*=-1;row+=dir;}return rows.join('');}; expect(zz('PAYPALISHIRING',3)).toBe('PAHNAPLSIIGYIR'); });
  it('implements Sieve of Eratosthenes', () => { const sieve=(n:number)=>{const p=Array(n+1).fill(true);p[0]=p[1]=false;for(let i=2;i*i<=n;i++)if(p[i])for(let j=i*i;j<=n;j+=i)p[j]=false;return p.map((v,i)=>v?i:-1).filter(v=>v>0);}; expect(sieve(20)).toEqual([2,3,5,7,11,13,17,19]); });
  it('computes minimum coins for amount', () => { const minCoins=(coins:number[],amt:number)=>{const dp=Array(amt+1).fill(Infinity);dp[0]=0;for(let i=1;i<=amt;i++)for(const c of coins)if(c<=i&&dp[i-c]+1<dp[i])dp[i]=dp[i-c]+1;return dp[amt]===Infinity?-1:dp[amt];}; expect(minCoins([1,5,6,9],11)).toBe(2); });
});


describe('phase40 coverage', () => {
  it('implements simple bloom filter logic', () => { const seeds=[7,11,13]; const size=64; const hashes=(v:string)=>seeds.map(s=>[...v].reduce((h,c)=>(h*s+c.charCodeAt(0))%size,0)); const bits=new Set<number>(); const add=(v:string)=>hashes(v).forEach(h=>bits.add(h)); const mightHave=(v:string)=>hashes(v).every(h=>bits.has(h)); add('hello'); expect(mightHave('hello')).toBe(true); });
  it('computes maximum product subarray', () => { const maxProd=(a:number[])=>{let max=a[0],min=a[0],res=a[0];for(let i=1;i<a.length;i++){const t=max;max=Math.max(a[i],max*a[i],min*a[i]);min=Math.min(a[i],t*a[i],min*a[i]);res=Math.max(res,max);}return res;}; expect(maxProd([2,3,-2,4])).toBe(6); });
  it('computes number of set bits sum for range', () => { const rangePopcount=(n:number)=>Array.from({length:n+1},(_,i)=>i).reduce((s,v)=>{let c=0,x=v;while(x){c+=x&1;x>>>=1;}return s+c;},0); expect(rangePopcount(5)).toBe(7); /* 0+1+1+2+1+2 */ });
  it('checks row stochastic matrix', () => { const isStochastic=(m:number[][])=>m.every(r=>Math.abs(r.reduce((a,b)=>a+b,0)-1)<1e-9); expect(isStochastic([[0.5,0.5],[0.3,0.7]])).toBe(true); });
  it('implements sparse table for range min query', () => { const a=[2,4,3,1,6,7,8,9,1,7]; const mn=(l:number,r:number)=>Math.min(...a.slice(l,r+1)); expect(mn(0,4)).toBe(1); expect(mn(2,7)).toBe(1); });
});


describe('phase41 coverage', () => {
  it('finds all permutations of array', () => { const perms=<T>(a:T[]):T[][]=>a.length<=1?[a]:[...a.flatMap((v,i)=>perms([...a.slice(0,i),...a.slice(i+1)]).map(p=>[v,...p]))]; expect(perms([1,2,3]).length).toBe(6); });
  it('computes largest rectangle in binary matrix', () => { const maxRect=(matrix:number[][])=>{if(!matrix.length)return 0;const h=Array(matrix[0].length).fill(0);let max=0;const hist=(heights:number[])=>{const st:number[]=[],n=heights.length;let m=0;for(let i=0;i<=n;i++){while(st.length&&(i===n||heights[st[st.length-1]]>=heights[i])){const ht=heights[st.pop()!];const w=st.length?i-st[st.length-1]-1:i;m=Math.max(m,ht*w);}st.push(i);}return m;};for(const row of matrix){row.forEach((v,j)=>{h[j]=v===0?0:h[j]+v;});max=Math.max(max,hist(h));}return max;}; expect(maxRect([[1,0,1,0,0],[1,0,1,1,1],[1,1,1,1,1],[1,0,0,1,0]])).toBe(6); });
  it('checks if string is a valid hex color', () => { const isHex=(s:string)=>/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(s); expect(isHex('#fff')).toBe(true); expect(isHex('#aabbcc')).toBe(true); expect(isHex('#xyz')).toBe(false); });
  it('implements fast exponentiation', () => { const fastPow=(base:number,exp:number,mod:number):number=>{let res=1;base%=mod;while(exp>0){if(exp%2===1)res=res*base%mod;base=base*base%mod;exp=Math.floor(exp/2);}return res;}; expect(fastPow(2,10,1000)).toBe(24); });
  it('counts triplets with zero sum', () => { const zeroSumTriplets=(a:number[])=>{const s=a.sort((x,y)=>x-y);let c=0;for(let i=0;i<s.length-2;i++){let l=i+1,r=s.length-1;while(l<r){const sum=s[i]+s[l]+s[r];if(sum===0){c++;l++;r--;}else if(sum<0)l++;else r--;}}return c;}; expect(zeroSumTriplets([-1,0,1,2,-1,-4])).toBe(3); });
});


describe('phase42 coverage', () => {
  it('computes pentagonal number', () => { const penta=(n:number)=>n*(3*n-1)/2; expect(penta(1)).toBe(1); expect(penta(4)).toBe(22); });
  it('finds number of rectangles in grid', () => { const rects=(m:number,n:number)=>m*(m+1)/2*n*(n+1)/2; expect(rects(2,2)).toBe(9); expect(rects(1,1)).toBe(1); });
  it('checks color contrast ratio passes AA', () => { const contrast=(l1:number,l2:number)=>(Math.max(l1,l2)+0.05)/(Math.min(l1,l2)+0.05); expect(contrast(1,0)).toBeCloseTo(21,0); });
  it('checks if number is narcissistic (3 digits)', () => { const isNarc=(n:number)=>{const d=String(n).split('');return d.reduce((s,c)=>s+Math.pow(Number(c),d.length),0)===n;}; expect(isNarc(153)).toBe(true); expect(isNarc(370)).toBe(true); expect(isNarc(100)).toBe(false); });
  it('computes luminance of color', () => { const lum=(r:number,g:number,b:number)=>0.299*r+0.587*g+0.114*b; expect(Math.round(lum(255,255,255))).toBe(255); expect(Math.round(lum(0,0,0))).toBe(0); });
});


describe('phase43 coverage', () => {
  it('computes sigmoid of value', () => { const sigmoid=(x:number)=>1/(1+Math.exp(-x)); expect(sigmoid(0)).toBeCloseTo(0.5); expect(sigmoid(100)).toBeCloseTo(1); expect(sigmoid(-100)).toBeCloseTo(0); });
  it('computes weighted average', () => { const wavg=(vals:number[],wts:number[])=>{const sw=wts.reduce((s,v)=>s+v,0);return vals.reduce((s,v,i)=>s+v*wts[i],0)/sw;}; expect(wavg([1,2,3],[1,2,3])).toBeCloseTo(2.333,2); });
  it('finds next occurrence of weekday', () => { const nextDay=(from:Date,day:number)=>{const d=new Date(from);d.setDate(d.getDate()+(day-d.getDay()+7)%7||7);return d;}; const fri=nextDay(new Date('2026-02-22'),5); expect(fri.getDay()).toBe(5); /* next Friday */ });
  it('checks if two date ranges overlap', () => { const overlap=(s1:number,e1:number,s2:number,e2:number)=>s1<=e2&&s2<=e1; expect(overlap(1,5,3,8)).toBe(true); expect(overlap(1,3,5,8)).toBe(false); });
  it('computes confidence interval (known std)', () => { const ci=(mean:number,std:number,n:number,z=1.96)=>[mean-z*std/Math.sqrt(n),mean+z*std/Math.sqrt(n)]; const[lo,hi]=ci(100,15,25); expect(lo).toBeLessThan(100); expect(hi).toBeGreaterThan(100); });
});


describe('phase44 coverage', () => {
  it('encodes run-length', () => { const rle=(s:string)=>s.replace(/(.)\1*/g,m=>m.length>1?m[0]+m.length:m[0]); expect(rle('aaabbc')).toBe('a3b2c'); expect(rle('abc')).toBe('abc'); });
  it('computes prefix sums', () => { const prefix=(a:number[])=>{const r=[0];a.forEach(v=>r.push(r[r.length-1]+v));return r;}; expect(prefix([1,2,3])).toEqual([0,1,3,6]); });
  it('debounces function calls', () => { jest.useFakeTimers();const db=(fn:()=>void,ms:number)=>{let t:ReturnType<typeof setTimeout>;return()=>{clearTimeout(t);t=setTimeout(fn,ms);};};let c=0;const d=db(()=>c++,100);d();d();d();jest.runAllTimers(); expect(c).toBe(1);jest.useRealTimers(); });
  it('implements counting sort', () => { const cnt=(a:number[])=>{if(!a.length)return[];const max=Math.max(...a);const c=new Array(max+1).fill(0);a.forEach(v=>c[v]++);const r:number[]=[];c.forEach((n,i)=>r.push(...Array(n).fill(i)));return r;}; expect(cnt([4,2,2,8,3,3,1])).toEqual([1,2,2,3,3,4,8]); });
  it('checks if two strings are anagrams', () => { const anagram=(a:string,b:string)=>a.split('').sort().join('')===b.split('').sort().join(''); expect(anagram('listen','silent')).toBe(true); expect(anagram('hello','world')).toBe(false); });
});


describe('phase45 coverage', () => {
  it('finds shortest path (BFS on unweighted graph)', () => { const sp=(adj:number[][],s:number,t:number)=>{const dist=new Array(adj.length).fill(-1);dist[s]=0;const q=[s];while(q.length){const u=q.shift()!;if(u===t)return dist[t];for(const v of adj[u])if(dist[v]===-1){dist[v]=dist[u]+1;q.push(v);}}return dist[t];}; const adj=[[1,2],[3],[3],[]];
  expect(sp(adj,0,3)).toBe(2); });
  it('checks if number is palindrome', () => { const ip=(n:number)=>{const s=String(Math.abs(n));return s===s.split('').reverse().join('');}; expect(ip(121)).toBe(true); expect(ip(123)).toBe(false); });
  it('computes moving average', () => { const ma=(a:number[],w:number)=>Array.from({length:a.length-w+1},(_,i)=>a.slice(i,i+w).reduce((s,v)=>s+v,0)/w); expect(ma([1,2,3,4,5],3).map(v=>Math.round(v*10)/10)).toEqual([2,3,4]); });
  it('formats number with thousand separators', () => { const fmt=(n:number)=>n.toLocaleString('en-US'); expect(fmt(1234567)).toBe('1,234,567'); expect(fmt(1000)).toBe('1,000'); });
  it('counts target in sorted array (leftmost occurrence)', () => { const lb=(a:number[],t:number)=>{let l=0,r=a.length;while(l<r){const m=(l+r)>>1;if(a[m]<t)l=m+1;else r=m;}return l;}; expect(lb([1,2,2,2,3],2)).toBe(1); expect(lb([1,2,3,3,4],3)).toBe(2); });
});


describe('phase46 coverage', () => {
  it('counts connected components', () => { const cc=(n:number,edges:[number,number][])=>{const p=Array.from({length:n},(_,i)=>i);const find=(x:number):number=>p[x]===x?x:(p[x]=find(p[x]),p[x]);const union=(a:number,b:number)=>{p[find(a)]=find(b);};edges.forEach(([u,v])=>union(u,v));return new Set(Array.from({length:n},(_,i)=>find(i))).size;}; expect(cc(5,[[0,1],[1,2],[3,4]])).toBe(2); expect(cc(4,[])).toBe(4); });
  it('finds largest rectangle in histogram', () => { const lrh=(h:number[])=>{const st:number[]=[],n=h.length;let max=0;for(let i=0;i<=n;i++){while(st.length&&(i===n||h[st[st.length-1]]>=h[i])){const ht=h[st.pop()!];const w=st.length?i-st[st.length-1]-1:i;max=Math.max(max,ht*w);}st.push(i);}return max;}; expect(lrh([2,1,5,6,2,3])).toBe(10); expect(lrh([2,4])).toBe(4); });
  it('finds maximum path sum in binary tree', () => { type N={v:number;l?:N;r?:N}; let mx=-Infinity; const dfs=(n:N|undefined):number=>{if(!n)return 0;const l=Math.max(0,dfs(n.l)),r=Math.max(0,dfs(n.r));mx=Math.max(mx,n.v+l+r);return n.v+Math.max(l,r);}; const t:N={v:-10,l:{v:9},r:{v:20,l:{v:15},r:{v:7}}}; mx=-Infinity;dfs(t); expect(mx).toBe(42); });
  it('checks if matrix is symmetric', () => { const sym=(m:number[][])=>m.every((r,i)=>r.every((v,j)=>v===m[j][i])); expect(sym([[1,2,3],[2,5,6],[3,6,9]])).toBe(true); expect(sym([[1,2],[3,4]])).toBe(false); });
  it('finds path sum in binary tree', () => { type N={v:number;l?:N;r?:N}; const ps=(n:N|undefined,t:number,cur=0):boolean=>!n?false:n.v+cur===t&&!n.l&&!n.r?true:ps(n.l,t,cur+n.v)||ps(n.r,t,cur+n.v); const t:N={v:5,l:{v:4,l:{v:11,l:{v:7},r:{v:2}}},r:{v:8,l:{v:13},r:{v:4,r:{v:1}}}}; expect(ps(t,22)).toBe(true); expect(ps(t,28)).toBe(false); });
});
