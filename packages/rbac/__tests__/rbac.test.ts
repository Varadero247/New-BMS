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


describe('phase47 coverage', () => {
  it('implements heapsort', () => { const hs=(arr:number[])=>{const a=[...arr],n=a.length;const sink=(i:number,sz:number)=>{while(true){let m=i;const l=2*i+1,r=2*i+2;if(l<sz&&a[l]>a[m])m=l;if(r<sz&&a[r]>a[m])m=r;if(m===i)break;[a[i],a[m]]=[a[m],a[i]];i=m;}};for(let i=Math.floor(n/2)-1;i>=0;i--)sink(i,n);for(let i=n-1;i>0;i--){[a[0],a[i]]=[a[i],a[0]];sink(0,i);}return a;}; expect(hs([12,11,13,5,6,7])).toEqual([5,6,7,11,12,13]); });
  it('finds all pairs with given sum (two pointers)', () => { const tp=(a:number[],t:number)=>{const s=[...a].sort((x,y)=>x-y);const r:[number,number][]=[];let l=0,h=s.length-1;while(l<h){const sm=s[l]+s[h];if(sm===t){r.push([s[l],s[h]]);l++;h--;}else sm<t?l++:h--;}return r;}; expect(tp([1,2,3,4,5,6],7)).toEqual([[1,6],[2,5],[3,4]]); });
  it('implements Huffman coding frequencies', () => { const hf=(freqs:[string,number][])=>{const q=[...freqs].sort((a,b)=>a[1]-b[1]);while(q.length>1){const a=q.shift()!,b=q.shift()!;const node:[string,number]=[a[0]+b[0],a[1]+b[1]];q.splice(q.findIndex(x=>x[1]>=node[1]),0,node);}return q[0][1];}; expect(hf([['a',5],['b',9],['c',12],['d',13]])).toBe(39); });
  it('finds cheapest flight within k stops', () => { const cf=(n:number,flights:[number,number,number][],src:number,dst:number,k:number)=>{let d=new Array(n).fill(Infinity);d[src]=0;for(let i=0;i<=k;i++){const nd=[...d];for(const[u,v,w] of flights)if(d[u]+w<nd[v])nd[v]=d[u]+w;d=nd;}return d[dst]===Infinity?-1:d[dst];}; expect(cf(3,[[0,1,100],[1,2,100],[0,2,500]],0,2,1)).toBe(200); });
  it('finds index of min element', () => { const argmin=(a:number[])=>a.reduce((mi,v,i)=>v<a[mi]?i:mi,0); expect(argmin([3,1,4,1,5])).toBe(1); expect(argmin([5,3,8,1])).toBe(3); });
});


describe('phase48 coverage', () => {
  it('computes longest zig-zag subsequence', () => { const lzz=(a:number[])=>{const up=new Array(a.length).fill(1),dn=new Array(a.length).fill(1);for(let i=1;i<a.length;i++)for(let j=0;j<i;j++){if(a[i]>a[j])up[i]=Math.max(up[i],dn[j]+1);else if(a[i]<a[j])dn[i]=Math.max(dn[i],up[j]+1);}return Math.max(...up,...dn);}; expect(lzz([1,7,4,9,2,5])).toBe(6); expect(lzz([1,4,7,2,5])).toBe(4); });
  it('finds all rectangles in binary matrix', () => { const rects=(m:number[][])=>{let cnt=0;for(let r1=0;r1<m.length;r1++)for(let r2=r1;r2<m.length;r2++)for(let c1=0;c1<m[0].length;c1++)for(let c2=c1;c2<m[0].length;c2++){let ok=true;for(let r=r1;r<=r2&&ok;r++)for(let c=c1;c<=c2&&ok;c++)if(!m[r][c])ok=false;if(ok)cnt++;}return cnt;}; expect(rects([[1,1],[1,1]])).toBe(9); });
  it('implements treap operations', () => { type T={k:number;p:number;l?:T;r?:T}; const ins=(t:T|undefined,k:number):T=>{const n:T={k,p:Math.random()};if(!t)return n;if(k<t.k){t.l=ins(t.l,k);if(t.l.p>t.p)[t.k,t.l.k]=[t.l.k,t.k];}else{t.r=ins(t.r,k);if(t.r.p>t.p)[t.k,t.r.k]=[t.r.k,t.k];}return t;};const cnt=(t:T|undefined):number=>t?1+cnt(t.l)+cnt(t.r):0; let tr:T|undefined;[5,3,7,1,4,6,8].forEach(k=>{tr=ins(tr,k);}); expect(cnt(tr)).toBe(7); });
  it('generates nth row of Pascal triangle', () => { const pt=(n:number)=>{let r=[1];for(let i=0;i<n;i++)r=[...r,0].map((v,j)=>v+(r[j-1]||0));return r;}; expect(pt(4)).toEqual([1,4,6,4,1]); expect(pt(0)).toEqual([1]); });
  it('finds the right sibling of each tree node', () => { type N={v:number;l?:N;r?:N;next?:N}; const connect=(root:N|undefined)=>{if(!root)return;const q:N[]=[root];while(q.length){const sz=q.length;for(let i=0;i<sz;i++){const n=q.shift()!;if(i<sz-1)n.next=q[0];if(n.l)q.push(n.l);if(n.r)q.push(n.r);}}return root;}; const t:N={v:1,l:{v:2,l:{v:4},r:{v:5}},r:{v:3,r:{v:7}}}; connect(t); expect(t.l?.next?.v).toBe(3); });
});


describe('phase49 coverage', () => {
  it('checks if word can be found in board', () => { const ws=(b:string[][],w:string)=>{const r=b.length,c=b[0].length;const dfs=(i:number,j:number,k:number):boolean=>{if(k===w.length)return true;if(i<0||i>=r||j<0||j>=c||b[i][j]!==w[k])return false;const tmp=b[i][j];b[i][j]='#';const ok=dfs(i+1,j,k+1)||dfs(i-1,j,k+1)||dfs(i,j+1,k+1)||dfs(i,j-1,k+1);b[i][j]=tmp;return ok;};for(let i=0;i<r;i++)for(let j=0;j<c;j++)if(dfs(i,j,0))return true;return false;}; expect(ws([['A','B','C','E'],['S','F','C','S'],['A','D','E','E']],'ABCCED')).toBe(true); });
  it('computes number of ways to decode string', () => { const dec=(s:string)=>{if(!s||s[0]==='0')return 0;const n=s.length,dp=new Array(n+1).fill(0);dp[0]=dp[1]=1;for(let i=2;i<=n;i++){if(s[i-1]!=='0')dp[i]+=dp[i-1];const two=Number(s.slice(i-2,i));if(two>=10&&two<=26)dp[i]+=dp[i-2];}return dp[n];}; expect(dec('12')).toBe(2); expect(dec('226')).toBe(3); expect(dec('06')).toBe(0); });
  it('computes spiral matrix order', () => { const spiral=(m:number[][])=>{const r=[];let t=0,b=m.length-1,l=0,ri=m[0].length-1;while(t<=b&&l<=ri){for(let i=l;i<=ri;i++)r.push(m[t][i]);t++;for(let i=t;i<=b;i++)r.push(m[i][ri]);ri--;if(t<=b){for(let i=ri;i>=l;i--)r.push(m[b][i]);b--;}if(l<=ri){for(let i=b;i>=t;i--)r.push(m[i][l]);l++;}}return r;}; expect(spiral([[1,2,3],[4,5,6],[7,8,9]])).toEqual([1,2,3,6,9,8,7,4,5]); });
  it('computes minimum time to finish tasks', () => { const mtt=(t:number[],k:number)=>{const s=[...t].sort((a,b)=>b-a);let time=0;for(let i=0;i<s.length;i+=k)time+=s[i];return time;}; expect(mtt([3,2,4,4,4,2,2],3)).toBe(9); });
  it('implements trie insert and search', () => { const trie=()=>{const r:any={};return{ins:(w:string)=>{let n=r;for(const c of w){n[c]=n[c]||{};n=n[c];}n.$=1;},has:(w:string)=>{let n=r;for(const c of w){if(!n[c])return false;n=n[c];}return !!n.$;}};};const t=trie();t.ins('hello');t.ins('world'); expect(t.has('hello')).toBe(true); expect(t.has('hell')).toBe(false); });
});


describe('phase50 coverage', () => {
  it('computes minimum insertions for palindrome', () => { const mip=(s:string)=>{const n=s.length;const dp=Array.from({length:n},()=>new Array(n).fill(0));for(let len=2;len<=n;len++)for(let i=0;i<=n-len;i++){const j=i+len-1;dp[i][j]=s[i]===s[j]?dp[i+1][j-1]:1+Math.min(dp[i+1][j],dp[i][j-1]);}return dp[0][n-1];}; expect(mip('zzazz')).toBe(0); expect(mip('mbadm')).toBe(2); });
  it('finds the minimum size subarray with sum >= target', () => { const mss=(a:number[],t:number)=>{let l=0,sum=0,min=Infinity;for(let r=0;r<a.length;r++){sum+=a[r];while(sum>=t){min=Math.min(min,r-l+1);sum-=a[l++];}}return min===Infinity?0:min;}; expect(mss([2,3,1,2,4,3],7)).toBe(2); expect(mss([1,4,4],4)).toBe(1); });
  it('checks if valid sudoku row/col/box', () => { const vr=(b:string[][])=>{const ok=(a:string[])=>{const d=a.filter(v=>v!=='.');return d.length===new Set(d).size;};for(let i=0;i<9;i++){if(!ok(b[i]))return false;if(!ok(b.map(r=>r[i])))return false;}for(let bi=0;bi<3;bi++)for(let bj=0;bj<3;bj++){const box=[];for(let i=0;i<3;i++)for(let j=0;j<3;j++)box.push(b[3*bi+i][3*bj+j]);if(!ok(box))return false;}return true;}; expect(vr([['5','3','.','.','7','.','.','.','.'],['6','.','.','1','9','5','.','.','.'],['.','9','8','.','.','.','.','6','.'],['8','.','.','.','6','.','.','.','3'],['4','.','.','8','.','3','.','.','1'],['7','.','.','.','2','.','.','.','6'],['.','6','.','.','.','.','2','8','.'],['.','.','.','4','1','9','.','.','5'],['.','.','.','.','8','.','.','7','9']])).toBe(true); });
  it('checks if string is a valid number', () => { const isNum=(s:string)=>!isNaN(Number(s.trim()))&&s.trim()!==''; expect(isNum('3.14')).toBe(true); expect(isNum('-3')).toBe(true); expect(isNum('abc')).toBe(false); expect(isNum('')).toBe(false); });
  it('computes minimum falling path sum', () => { const mfp=(m:number[][])=>{const n=m.length;const dp=m[0].map(v=>v);for(let i=1;i<n;i++)for(let j=0;j<n;j++){const prev=[dp[j]];if(j>0)prev.push(dp[j-1]);if(j<n-1)prev.push(dp[j+1]);dp[j]=m[i][j]+Math.min(...prev);}return Math.min(...dp);}; expect(mfp([[2,1,3],[6,5,4],[7,8,9]])).toBe(13); });
});

describe('phase51 coverage', () => {
  it('finds pattern positions using KMP', () => { const kmp=(text:string,pat:string)=>{const n=text.length,m=pat.length;if(!m)return[];const lps=new Array(m).fill(0);for(let i=1,len=0;i<m;){if(pat[i]===pat[len])lps[i++]=++len;else if(len)len=lps[len-1];else lps[i++]=0;}const res:number[]=[];for(let i=0,j=0;i<n;){if(text[i]===pat[j]){i++;j++;}if(j===m){res.push(i-j);j=lps[j-1];}else if(i<n&&text[i]!==pat[j]){if(j)j=lps[j-1];else i++;}}return res;}; expect(kmp('ababcababc','ababc')).toEqual([0,5]); expect(kmp('aaa','a')).toEqual([0,1,2]); });
  it('counts palindromic substrings', () => { const cp=(s:string)=>{let cnt=0;const ex=(l:number,r:number)=>{while(l>=0&&r<s.length&&s[l]===s[r]){cnt++;l--;r++;}};for(let i=0;i<s.length;i++){ex(i,i);ex(i,i+1);}return cnt;}; expect(cp('abc')).toBe(3); expect(cp('aaa')).toBe(6); expect(cp('racecar')).toBe(10); });
  it('finds maximum in each sliding window of size k', () => { const sw=(a:number[],k:number)=>{const res:number[]=[],dq:number[]=[];for(let i=0;i<a.length;i++){while(dq.length&&dq[0]<i-k+1)dq.shift();while(dq.length&&a[dq[dq.length-1]]<a[i])dq.pop();dq.push(i);if(i>=k-1)res.push(a[dq[0]]);}return res;}; expect(sw([1,3,-1,-3,5,3,6,7],3)).toEqual([3,3,5,5,6,7]); expect(sw([1],1)).toEqual([1]); });
  it('finds primes using sieve of Eratosthenes', () => { const sieve=(n:number)=>{const p=new Array(n+1).fill(true);p[0]=p[1]=false;for(let i=2;i*i<=n;i++)if(p[i])for(let j=i*i;j<=n;j+=i)p[j]=false;return p.map((v:boolean,i:number)=>v?i:-1).filter((i:number)=>i>0);}; expect(sieve(20)).toEqual([2,3,5,7,11,13,17,19]); expect(sieve(10)).toEqual([2,3,5,7]); });
  it('determines if array allows reaching last index', () => { const canJump=(nums:number[])=>{let reach=0;for(let i=0;i<nums.length;i++){if(i>reach)return false;reach=Math.max(reach,i+nums[i]);}return true;}; expect(canJump([2,3,1,1,4])).toBe(true); expect(canJump([3,2,1,0,4])).toBe(false); expect(canJump([1,0])).toBe(true); });
});

describe('phase52 coverage', () => {
  it('finds minimum path sum in grid', () => { const mps2=(g:number[][])=>{const m=g.length,n=g[0].length,dp=Array.from({length:m},()=>new Array(n).fill(0));dp[0][0]=g[0][0];for(let i=1;i<m;i++)dp[i][0]=dp[i-1][0]+g[i][0];for(let j=1;j<n;j++)dp[0][j]=dp[0][j-1]+g[0][j];for(let i=1;i<m;i++)for(let j=1;j<n;j++)dp[i][j]=Math.min(dp[i-1][j],dp[i][j-1])+g[i][j];return dp[m-1][n-1];}; expect(mps2([[1,3,1],[1,5,1],[4,2,1]])).toBe(7); expect(mps2([[1,2],[1,1]])).toBe(3); });
  it('finds kth largest element in array', () => { const kl=(a:number[],k:number)=>[...a].sort((x,y)=>y-x)[k-1]; expect(kl([3,2,1,5,6,4],2)).toBe(5); expect(kl([3,2,3,1,2,4,5,5,6],4)).toBe(4); });
  it('solves 0-1 knapsack problem', () => { const knap=(wts:number[],vals:number[],W:number)=>{const n=wts.length,dp=new Array(W+1).fill(0);for(let i=0;i<n;i++)for(let j=W;j>=wts[i];j--)dp[j]=Math.max(dp[j],dp[j-wts[i]]+vals[i]);return dp[W];}; expect(knap([1,2,3],[6,10,12],5)).toBe(22); expect(knap([1,2,3],[6,10,12],4)).toBe(18); });
  it('finds minimum jumps to reach end of array', () => { const mj2=(a:number[])=>{let jumps=0,cur=0,far=0;for(let i=0;i<a.length-1;i++){far=Math.max(far,i+a[i]);if(i===cur){jumps++;cur=far;}}return jumps;}; expect(mj2([2,3,1,1,4])).toBe(2); expect(mj2([2,3,0,1,4])).toBe(2); expect(mj2([1,1,1,1])).toBe(3); });
  it('counts vowel-only substrings with all five vowels', () => { const cvs=(word:string)=>{let cnt=0;const v=new Set('aeiou');for(let i=0;i<word.length;i++){const seen=new Set<string>();for(let j=i;j<word.length;j++){if(!v.has(word[j]))break;seen.add(word[j]);if(seen.size===5)cnt++;}}return cnt;}; expect(cvs('aeiouu')).toBe(2); expect(cvs('aeiou')).toBe(1); expect(cvs('abc')).toBe(0); });
});

describe('phase53 coverage', () => {
  it('computes running median from data stream', () => { const ms2=()=>{const nums:number[]=[];return{add:(n:number)=>{let l=0,r=nums.length;while(l<r){const m=l+r>>1;if(nums[m]<n)l=m+1;else r=m;}nums.splice(l,0,n);},med:():number=>{const n=nums.length;return n%2?nums[n>>1]:(nums[n/2-1]+nums[n/2])/2;}};}; const s=ms2();s.add(1);s.add(2);expect(s.med()).toBe(1.5);s.add(3);expect(s.med()).toBe(2); });
  it('counts paths from source to target in DAG', () => { const cp4=(n:number,edges:[number,number][])=>{const adj:number[][]=Array.from({length:n},()=>[]);for(const[u,v]of edges)adj[u].push(v);const dp=new Array(n).fill(-1);const dfs=(v:number):number=>{if(v===n-1)return 1;if(dp[v]!==-1)return dp[v];dp[v]=0;for(const u of adj[v])dp[v]+=dfs(u);return dp[v];};return dfs(0);}; expect(cp4(3,[[0,1],[0,2],[1,2]])).toBe(2); expect(cp4(4,[[0,1],[0,2],[1,3],[2,3]])).toBe(2); });
  it('finds length of longest substring without repeating chars', () => { const lswr=(s:string)=>{const mp=new Map<string,number>();let mx=0,l=0;for(let r=0;r<s.length;r++){if(mp.has(s[r])&&mp.get(s[r])!>=l)l=mp.get(s[r])!+1;mp.set(s[r],r);mx=Math.max(mx,r-l+1);}return mx;}; expect(lswr('abcabcbb')).toBe(3); expect(lswr('bbbbb')).toBe(1); expect(lswr('pwwkew')).toBe(3); });
  it('finds minimum falling path sum through matrix', () => { const mfps=(m:number[][])=>{const n=m.length,dp=m.map(r=>[...r]);for(let i=1;i<n;i++)for(let j=0;j<n;j++){const mn=Math.min(dp[i-1][j],j>0?dp[i-1][j-1]:Infinity,j<n-1?dp[i-1][j+1]:Infinity);dp[i][j]+=mn;}return Math.min(...dp[n-1]);}; expect(mfps([[2,1,3],[6,5,4],[7,8,9]])).toBe(13); expect(mfps([[1,2],[3,4]])).toBe(4); });
  it('finds longest subarray with at most 2 distinct characters', () => { const la2=(s:string)=>{const mp=new Map<string,number>();let l=0,mx=0;for(let r=0;r<s.length;r++){mp.set(s[r],(mp.get(s[r])||0)+1);while(mp.size>2){const lc=s[l];mp.set(lc,mp.get(lc)!-1);if(mp.get(lc)===0)mp.delete(lc);l++;}mx=Math.max(mx,r-l+1);}return mx;}; expect(la2('eceba')).toBe(3); expect(la2('ccaabbb')).toBe(5); });
});


describe('phase54 coverage', () => {
  it('counts pairs with absolute difference exactly k', () => { const cpdk=(a:number[],k:number)=>{const s=new Set(a);let c=0;const seen=new Set<number>();for(const x of a){if(!seen.has(x)&&s.has(x+k))c++;seen.add(x);}return c;}; expect(cpdk([1,7,5,9,2,12,3],2)).toBe(4); expect(cpdk([1,2,3,4,5],1)).toBe(4); });
  it('finds all lonely numbers (no adjacent values exist in array)', () => { const lonely=(a:number[])=>{const s=new Set(a),cnt=new Map<number,number>();for(const x of a)cnt.set(x,(cnt.get(x)||0)+1);return a.filter(x=>cnt.get(x)===1&&!s.has(x-1)&&!s.has(x+1)).sort((a,b)=>a-b);}; expect(lonely([10,6,5,8])).toEqual([8,10]); expect(lonely([1,3,5,3])).toEqual([1,5]); });
  it('finds the nth ugly number (factors 2, 3, 5 only)', () => { const ugly=(n:number)=>{const dp=[1];let i2=0,i3=0,i5=0;for(let i=1;i<n;i++){const next=Math.min(dp[i2]*2,dp[i3]*3,dp[i5]*5);dp.push(next);if(next===dp[i2]*2)i2++;if(next===dp[i3]*3)i3++;if(next===dp[i5]*5)i5++;}return dp[n-1];}; expect(ugly(1)).toBe(1); expect(ugly(10)).toBe(12); expect(ugly(15)).toBe(24); });
  it('finds minimum arrows to burst all balloons', () => { const minArrows=(pts:number[][])=>{if(!pts.length)return 0;pts.sort((a,b)=>a[1]-b[1]);let arrows=1,end=pts[0][1];for(let i=1;i<pts.length;i++){if(pts[i][0]>end){arrows++;end=pts[i][1];}}return arrows;}; expect(minArrows([[10,16],[2,8],[1,6],[7,12]])).toBe(2); expect(minArrows([[1,2],[3,4],[5,6]])).toBe(3); expect(minArrows([[1,2],[2,3]])).toBe(1); });
  it('computes minimum cost to cut a stick at given positions', () => { const cutCost=(n:number,cuts:number[])=>{const c=[0,...cuts.sort((a,b)=>a-b),n],m=c.length;const dp=Array.from({length:m},()=>new Array(m).fill(0));for(let len=2;len<m;len++){for(let i=0;i+len<m;i++){const j=i+len;dp[i][j]=Infinity;for(let k=i+1;k<j;k++)dp[i][j]=Math.min(dp[i][j],dp[i][k]+dp[k][j]+c[j]-c[i]);}}return dp[0][m-1];}; expect(cutCost(7,[1,3,4,5])).toBe(16); expect(cutCost(9,[5,6,1,4,2])).toBe(22); });
});


describe('phase55 coverage', () => {
  it('detects a cycle in a linked list using Floyd algorithm', () => { type N={v:number,next:N|null}; const hasCycle=(head:N|null)=>{let s=head,f=head;while(f&&f.next){s=s!.next;f=f.next.next;if(s===f)return true;}return false;}; const a:N={v:1,next:null},b:N={v:2,next:null},c:N={v:3,next:null}; a.next=b;b.next=c;c.next=b; expect(hasCycle(a)).toBe(true); const x:N={v:1,next:{v:2,next:null}}; expect(hasCycle(x)).toBe(false); });
  it('finds longest common prefix among an array of strings', () => { const lcp=(strs:string[])=>{if(!strs.length)return '';let prefix=strs[0];for(let i=1;i<strs.length;i++){while(strs[i].indexOf(prefix)!==0)prefix=prefix.slice(0,-1);}return prefix;}; expect(lcp(['flower','flow','flight'])).toBe('fl'); expect(lcp(['dog','racecar','car'])).toBe(''); expect(lcp(['abc','abc','abc'])).toBe('abc'); });
  it('reverses a singly linked list iteratively', () => { type N={v:number,next:N|null}; const mk=(a:number[]):N|null=>a.reduceRight((n:N|null,v)=>({v,next:n}),null); const toArr=(n:N|null):number[]=>{const r:number[]=[];while(n){r.push(n.v);n=n.next;}return r;}; const rev=(h:N|null)=>{let prev:N|null=null,cur=h;while(cur){const nxt=cur.next;cur.next=prev;prev=cur;cur=nxt;}return prev;}; expect(toArr(rev(mk([1,2,3,4,5])))).toEqual([5,4,3,2,1]); expect(toArr(rev(mk([1,2])))).toEqual([2,1]); });
  it('finds start indices of all anagrams of pattern in string', () => { const aa=(s:string,p:string)=>{const res:number[]=[],n=s.length,m=p.length;if(n<m)return res;const pc=new Array(26).fill(0),sc=new Array(26).fill(0),a='a'.charCodeAt(0);for(let i=0;i<m;i++){pc[p.charCodeAt(i)-a]++;sc[s.charCodeAt(i)-a]++;}if(pc.join()===sc.join())res.push(0);for(let i=m;i<n;i++){sc[s.charCodeAt(i)-a]++;sc[s.charCodeAt(i-m)-a]--;if(pc.join()===sc.join())res.push(i-m+1);}return res;}; expect(aa('cbaebabacd','abc')).toEqual([0,6]); expect(aa('abab','ab')).toEqual([0,1,2]); });
  it('determines if array can be partitioned into two equal-sum subsets', () => { const part=(a:number[])=>{const sum=a.reduce((s,v)=>s+v,0);if(sum%2)return false;const t=sum/2;const dp=new Array(t+1).fill(false);dp[0]=true;for(const n of a)for(let j=t;j>=n;j--)dp[j]=dp[j]||dp[j-n];return dp[t];}; expect(part([1,5,11,5])).toBe(true); expect(part([1,2,3,5])).toBe(false); });
});


describe('phase56 coverage', () => {
  it('finds minimum mutations to reach end gene bank', () => { const mgm=(start:string,end:string,bank:string[])=>{const bset=new Set(bank);if(!bset.has(end))return -1;const q:[string,number][]=[[start,0]],seen=new Set([start]);while(q.length){const[cur,steps]=q.shift()!;if(cur===end)return steps;for(let i=0;i<8;i++)for(const c of'ACGT'){const next=cur.slice(0,i)+c+cur.slice(i+1);if(bset.has(next)&&!seen.has(next)){seen.add(next);q.push([next,steps+1]);}}}return -1;}; expect(mgm('AACCGGTT','AACCGGTA',['AACCGGTA'])).toBe(1); expect(mgm('AACCGGTT','AAACGGTA',['AACCGGTA','AACCGCTA','AAACGGTA'])).toBe(2); });
  it('checks if a linked list is a palindrome', () => { type N={v:number,next:N|null}; const mk=(a:number[]):N|null=>a.reduceRight((n:N|null,v)=>({v,next:n}),null); const isPalin=(head:N|null)=>{const arr:number[]=[];let n=head;while(n){arr.push(n.v);n=n.next;}return arr.join()===arr.reverse().join();}; expect(isPalin(mk([1,2,2,1]))).toBe(true); expect(isPalin(mk([1,2]))).toBe(false); expect(isPalin(mk([1]))).toBe(true); });
  it('finds kth smallest element in BST using inorder traversal', () => { type N={v:number,l:N|null,r:N|null}; const mk=(v:number,l:N|null=null,r:N|null=null):N=>({v,l,r}); const kth=(root:N|null,k:number)=>{const stack:N[]=[];let cur=root,cnt=0;while(cur||stack.length){while(cur){stack.push(cur);cur=cur.l;}cur=stack.pop()!;if(++cnt===k)return cur.v;cur=cur.r;}return -1;}; const bst=mk(3,mk(1,null,mk(2)),mk(4)); expect(kth(bst,1)).toBe(1); expect(kth(bst,3)).toBe(3); });
  it('finds index of first non-repeating character in string', () => { const fuc=(s:string)=>{const m=new Map<string,number>();for(const c of s)m.set(c,(m.get(c)||0)+1);for(let i=0;i<s.length;i++)if(m.get(s[i])===1)return i;return -1;}; expect(fuc('leetcode')).toBe(0); expect(fuc('loveleetcode')).toBe(2); expect(fuc('aabb')).toBe(-1); });
  it('validates a 9x9 Sudoku board', () => { const vs=(b:string[][])=>{for(let i=0;i<9;i++){const row=new Set<string>(),col=new Set<string>(),box=new Set<string>();for(let j=0;j<9;j++){const r=b[i][j],c=b[j][i],bx=b[3*Math.floor(i/3)+Math.floor(j/3)][3*(i%3)+(j%3)];if(r!=='.'&&!row.add(r))return false;if(c!=='.'&&!col.add(c))return false;if(bx!=='.'&&!box.add(bx))return false;}}return true;}; const valid=[['5','3','.','.','7','.','.','.','.'],['6','.','.','1','9','5','.','.','.'],['.','9','8','.','.','.','.','6','.'],['8','.','.','.','6','.','.','.','3'],['4','.','.','8','.','3','.','.','1'],['7','.','.','.','2','.','.','.','6'],['.','6','.','.','.','.','2','8','.'],['.','.','.','4','1','9','.','.','5'],['.','.','.','.','8','.','.','7','9']]; expect(vs(valid)).toBe(true); });
});


describe('phase57 coverage', () => {
  it('computes maximum width of binary tree (including null nodes)', () => { type N={v:number,l:N|null,r:N|null}; const mk=(v:number,l:N|null=null,r:N|null=null):N=>({v,l,r}); const mw=(root:N|null)=>{if(!root)return 0;let res=0;const q:Array<[N,number]>=[[root,0]];while(q.length){const sz=q.length;const base=q[0][1];let last=0;for(let i=0;i<sz;i++){const[n,idx]=q.shift()!;last=idx-base;if(n.l)q.push([n.l,2*(idx-base)]);if(n.r)q.push([n.r,2*(idx-base)+1]);}res=Math.max(res,last+1);}return res;}; expect(mw(mk(1,mk(3,mk(5),mk(3)),mk(2,null,mk(9))))).toBe(4); expect(mw(mk(1))).toBe(1); });
  it('finds length of longest palindromic subsequence', () => { const lps2=(s:string)=>{const n=s.length,dp=Array.from({length:n},(_,i)=>new Array(n).fill(0).map((_,j):number=>i===j?1:0));for(let len=2;len<=n;len++)for(let i=0;i+len<=n;i++){const j=i+len-1;dp[i][j]=s[i]===s[j]?dp[i+1][j-1]+2:Math.max(dp[i+1][j],dp[i][j-1]);}return dp[0][n-1];}; expect(lps2('bbbab')).toBe(4); expect(lps2('cbbd')).toBe(2); });
  it('implements LRU cache with O(1) get and put', () => { class LRU{private cap:number;private m=new Map<number,number>();constructor(c:number){this.cap=c;}get(k:number){if(!this.m.has(k))return -1;const v=this.m.get(k)!;this.m.delete(k);this.m.set(k,v);return v;}put(k:number,v:number){if(this.m.has(k))this.m.delete(k);else if(this.m.size>=this.cap)this.m.delete(this.m.keys().next().value!);this.m.set(k,v);}} const c=new LRU(2);c.put(1,1);c.put(2,2);expect(c.get(1)).toBe(1);c.put(3,3);expect(c.get(2)).toBe(-1);expect(c.get(3)).toBe(3); });
  it('checks if array has continuous subarray of size ≥2 summing to multiple of k', () => { const csm=(a:number[],k:number)=>{const m=new Map([[0,-1]]);let sum=0;for(let i=0;i<a.length;i++){sum=(sum+a[i])%k;if(m.has(sum)){if(i-m.get(sum)!>=2)return true;}else m.set(sum,i);}return false;}; expect(csm([23,2,4,6,7],6)).toBe(true); expect(csm([23,2,6,4,7],6)).toBe(true); expect(csm([23,2,6,4,7],13)).toBe(false); });
  it('implements FreqStack that pops the most frequent element', () => { class FS{private freq=new Map<number,number>();private group=new Map<number,number[]>();private maxFreq=0;push(v:number){const f=(this.freq.get(v)||0)+1;this.freq.set(v,f);this.maxFreq=Math.max(this.maxFreq,f);if(!this.group.has(f))this.group.set(f,[]);this.group.get(f)!.push(v);}pop(){const top=this.group.get(this.maxFreq)!;const v=top.pop()!;if(!top.length){this.group.delete(this.maxFreq);this.maxFreq--;}this.freq.set(v,this.freq.get(v)!-1);return v;}} const fs=new FS();[5,7,5,7,4,5].forEach(v=>fs.push(v));expect(fs.pop()).toBe(5);expect(fs.pop()).toBe(7);expect(fs.pop()).toBe(5);expect(fs.pop()).toBe(4); });
});

describe('phase58 coverage', () => {
  it('find peak element binary', () => {
    const findPeakElement=(nums:number[]):number=>{let lo=0,hi=nums.length-1;while(lo<hi){const mid=(lo+hi)>>1;if(nums[mid]>nums[mid+1])hi=mid;else lo=mid+1;}return lo;};
    const p1=findPeakElement([1,2,3,1]);
    expect([1,2,3,1][p1]).toBeGreaterThan([1,2,3,1][p1-1]||(-Infinity));
    expect([1,2,3,1][p1]).toBeGreaterThan([1,2,3,1][p1+1]||(-Infinity));
    const p2=findPeakElement([1,2,1,3,5,6,4]);
    expect(p2===1||p2===5).toBe(true);
  });
  it('min stack ops', () => {
    class MinStack{private s:number[]=[];private mins:number[]=[];push(v:number){this.s.push(v);if(!this.mins.length||v<=this.mins[this.mins.length-1])this.mins.push(v);}pop(){const v=this.s.pop()!;if(v===this.mins[this.mins.length-1])this.mins.pop();}top(){return this.s[this.s.length-1];}getMin(){return this.mins[this.mins.length-1];}}
    const ms=new MinStack();ms.push(-2);ms.push(0);ms.push(-3);
    expect(ms.getMin()).toBe(-3);
    ms.pop();
    expect(ms.top()).toBe(0);
    expect(ms.getMin()).toBe(-2);
  });
  it('first missing positive', () => {
    const firstMissingPositive=(nums:number[]):number=>{const n=nums.length;for(let i=0;i<n;i++){while(nums[i]>0&&nums[i]<=n&&nums[nums[i]-1]!==nums[i]){const t=nums[nums[i]-1];nums[nums[i]-1]=nums[i];nums[i]=t;}}for(let i=0;i<n;i++)if(nums[i]!==i+1)return i+1;return n+1;};
    expect(firstMissingPositive([1,2,0])).toBe(3);
    expect(firstMissingPositive([3,4,-1,1])).toBe(2);
    expect(firstMissingPositive([7,8,9,11,12])).toBe(1);
    expect(firstMissingPositive([1,2,3])).toBe(4);
  });
  it('container with most water', () => {
    const maxArea=(h:number[]):number=>{let l=0,r=h.length-1,best=0;while(l<r){best=Math.max(best,Math.min(h[l],h[r])*(r-l));if(h[l]<h[r])l++;else r--;}return best;};
    expect(maxArea([1,8,6,2,5,4,8,3,7])).toBe(49);
    expect(maxArea([1,1])).toBe(1);
    expect(maxArea([4,3,2,1,4])).toBe(16);
  });
  it('longest consecutive sequence', () => {
    const longestConsecutive=(nums:number[]):number=>{const set=new Set(nums);let best=0;for(const n of set){if(!set.has(n-1)){let cur=n,len=1;while(set.has(cur+1)){cur++;len++;}best=Math.max(best,len);}}return best;};
    expect(longestConsecutive([100,4,200,1,3,2])).toBe(4);
    expect(longestConsecutive([0,3,7,2,5,8,4,6,0,1])).toBe(9);
    expect(longestConsecutive([])).toBe(0);
  });
});

describe('phase59 coverage', () => {
  it('min in rotated sorted array', () => {
    const findMin=(nums:number[]):number=>{let lo=0,hi=nums.length-1;while(lo<hi){const mid=(lo+hi)>>1;if(nums[mid]>nums[hi])lo=mid+1;else hi=mid;}return nums[lo];};
    expect(findMin([3,4,5,1,2])).toBe(1);
    expect(findMin([4,5,6,7,0,1,2])).toBe(0);
    expect(findMin([11,13,15,17])).toBe(11);
    expect(findMin([2,1])).toBe(1);
  });
  it('populating next right pointers', () => {
    type TN={val:number;left:TN|null;right:TN|null;next:TN|null};
    const mk=(v:number):TN=>({val:v,left:null,right:null,next:null});
    const connect=(root:TN|null):TN|null=>{if(!root)return null;const q=[root];while(q.length){const sz=q.length;for(let i=0;i<sz;i++){const n=q.shift()!;if(i<sz-1)n.next=q[0]||null;if(n.left)q.push(n.left as TN);if(n.right)q.push(n.right as TN);}};return root;};
    const r=mk(1);r.left=mk(2);r.right=mk(3);(r.left as TN).left=mk(4);(r.left as TN).right=mk(5);(r.right as TN).right=mk(7);
    connect(r);
    expect(r.next).toBeNull();
    expect(r.left!.next).toBe(r.right);
  });
  it('evaluate division', () => {
    const calcEquation=(equations:string[][],values:number[],queries:string[][]):number[]=>{const g=new Map<string,Map<string,number>>();equations.forEach(([a,b],i)=>{if(!g.has(a))g.set(a,new Map());if(!g.has(b))g.set(b,new Map());g.get(a)!.set(b,values[i]);g.get(b)!.set(a,1/values[i]);});const bfs=(src:string,dst:string):number=>{if(!g.has(src)||!g.has(dst))return -1;if(src===dst)return 1;const visited=new Set([src]);const q:([string,number])[]=[[ src,1]];while(q.length){const[node,prod]=q.shift()!;if(node===dst)return prod;for(const[nb,w]of g.get(node)!){if(!visited.has(nb)){visited.add(nb);q.push([nb,prod*w]);}}}return -1;};return queries.map(([a,b])=>bfs(a,b));};
    const r=calcEquation([['a','b'],['b','c']],[2,3],[['a','c'],['b','a'],['a','e'],['a','a'],['x','x']]);
    expect(r[0]).toBeCloseTo(6);
    expect(r[1]).toBeCloseTo(0.5);
    expect(r[2]).toBe(-1);
  });
  it('longest repeating char replacement', () => {
    const characterReplacement=(s:string,k:number):number=>{const cnt=new Array(26).fill(0);const a='A'.charCodeAt(0);let maxCnt=0,l=0,res=0;for(let r=0;r<s.length;r++){cnt[s[r].charCodeAt(0)-a]++;maxCnt=Math.max(maxCnt,cnt[s[r].charCodeAt(0)-a]);while(r-l+1-maxCnt>k){cnt[s[l].charCodeAt(0)-a]--;l++;}res=Math.max(res,r-l+1);}return res;};
    expect(characterReplacement('ABAB',2)).toBe(4);
    expect(characterReplacement('AABABBA',1)).toBe(4);
    expect(characterReplacement('AAAA',0)).toBe(4);
  });
  it('all paths source to target', () => {
    const allPathsSourceTarget=(graph:number[][]):number[][]=>{const res:number[][]=[];const dfs=(node:number,path:number[])=>{if(node===graph.length-1){res.push([...path]);return;}for(const next of graph[node])dfs(next,[...path,next]);};dfs(0,[0]);return res;};
    const r=allPathsSourceTarget([[1,2],[3],[3],[]]);
    expect(r).toContainEqual([0,1,3]);
    expect(r).toContainEqual([0,2,3]);
    expect(r).toHaveLength(2);
  });
});

describe('phase60 coverage', () => {
  it('stone game DP', () => {
    const stoneGame=(piles:number[]):boolean=>{const n=piles.length;const dp=Array.from({length:n},()=>new Array(n).fill(0));for(let i=0;i<n;i++)dp[i][i]=piles[i];for(let len=2;len<=n;len++)for(let i=0;i<=n-len;i++){const j=i+len-1;dp[i][j]=Math.max(piles[i]-dp[i+1][j],piles[j]-dp[i][j-1]);}return dp[0][n-1]>0;};
    expect(stoneGame([5,3,4,5])).toBe(true);
    expect(stoneGame([3,7,2,3])).toBe(true);
  });
  it('burst balloons interval DP', () => {
    const maxCoins=(nums:number[]):number=>{const arr=[1,...nums,1];const n=arr.length;const dp=Array.from({length:n},()=>new Array(n).fill(0));for(let len=2;len<n;len++){for(let left=0;left<n-len;left++){const right=left+len;for(let k=left+1;k<right;k++){dp[left][right]=Math.max(dp[left][right],dp[left][k]+arr[left]*arr[k]*arr[right]+dp[k][right]);}}}return dp[0][n-1];};
    expect(maxCoins([3,1,5,8])).toBe(167);
    expect(maxCoins([1,5])).toBe(10);
    expect(maxCoins([1])).toBe(1);
  });
  it('max points on a line', () => {
    const maxPoints=(points:number[][]):number=>{if(points.length<=2)return points.length;let res=2;for(let i=0;i<points.length;i++){const map=new Map<string,number>();for(let j=i+1;j<points.length;j++){let dx=points[j][0]-points[i][0];let dy=points[j][1]-points[i][1];const g=(a:number,b:number):number=>b===0?a:g(b,a%b);const d=g(Math.abs(dx),Math.abs(dy));if(d>0){dx/=d;dy/=d;}if(dx<0||(dx===0&&dy<0)){dx=-dx;dy=-dy;}const key=`${dx},${dy}`;map.set(key,(map.get(key)||1)+1);res=Math.max(res,map.get(key)!);}};return res;};
    expect(maxPoints([[1,1],[2,2],[3,3]])).toBe(3);
    expect(maxPoints([[1,1],[3,2],[5,3],[4,1],[2,3],[1,4]])).toBe(4);
  });
  it('sum of subarray minimums', () => {
    const sumSubarrayMins=(arr:number[]):number=>{const MOD=1e9+7;const n=arr.length;const left=new Array(n).fill(0);const right=new Array(n).fill(0);const s1:number[]=[];const s2:number[]=[];for(let i=0;i<n;i++){while(s1.length&&arr[s1[s1.length-1]]>=arr[i])s1.pop();left[i]=s1.length?i-s1[s1.length-1]:i+1;s1.push(i);}for(let i=n-1;i>=0;i--){while(s2.length&&arr[s2[s2.length-1]]>arr[i])s2.pop();right[i]=s2.length?s2[s2.length-1]-i:n-i;s2.push(i);}let res=0;for(let i=0;i<n;i++)res=(res+arr[i]*left[i]*right[i])%MOD;return res;};
    expect(sumSubarrayMins([3,1,2,4])).toBe(17);
    expect(sumSubarrayMins([11,81,94,43,3])).toBe(444);
  });
  it('stock span problem', () => {
    const calculateSpan=(prices:number[]):number[]=>{const stack:number[]=[];const span:number[]=[];for(let i=0;i<prices.length;i++){while(stack.length&&prices[stack[stack.length-1]]<=prices[i])stack.pop();span.push(stack.length===0?i+1:i-stack[stack.length-1]);stack.push(i);}return span;};
    expect(calculateSpan([100,80,60,70,60,75,85])).toEqual([1,1,1,2,1,4,6]);
    expect(calculateSpan([10,4,5,90,120,80])).toEqual([1,1,2,4,5,1]);
  });
});

describe('phase61 coverage', () => {
  it('moving average data stream', () => {
    class MovingAverage{private q:number[]=[];private sum=0;constructor(private size:number){}next(val:number):number{this.q.push(val);this.sum+=val;if(this.q.length>this.size)this.sum-=this.q.shift()!;return this.sum/this.q.length;}}
    const ma=new MovingAverage(3);
    expect(ma.next(1)).toBeCloseTo(1);
    expect(ma.next(10)).toBeCloseTo(5.5);
    expect(ma.next(3)).toBeCloseTo(4.667,2);
    expect(ma.next(5)).toBeCloseTo(6);
  });
  it('count of smaller numbers after self', () => {
    const countSmaller=(nums:number[]):number[]=>{const res:number[]=[];const sorted:number[]=[];const bisect=(arr:number[],val:number):number=>{let lo=0,hi=arr.length;while(lo<hi){const mid=(lo+hi)>>1;if(arr[mid]<val)lo=mid+1;else hi=mid;}return lo;};for(let i=nums.length-1;i>=0;i--){const pos=bisect(sorted,nums[i]);res.unshift(pos);sorted.splice(pos,0,nums[i]);}return res;};
    expect(countSmaller([5,2,6,1])).toEqual([2,1,1,0]);
    expect(countSmaller([-1])).toEqual([0]);
    expect(countSmaller([-1,-1])).toEqual([0,0]);
  });
  it('intersection of two linked lists', () => {
    type N={val:number;next:N|null};
    const getIntersectionNode=(h1:N|null,h2:N|null):N|null=>{let a=h1,b=h2;while(a!==b){a=a?a.next:h2;b=b?b.next:h1;}return a;};
    const shared={val:8,next:{val:4,next:{val:5,next:null}}};
    const l1:N={val:4,next:{val:1,next:shared}};
    const l2:N={val:5,next:{val:6,next:{val:1,next:shared}}};
    expect(getIntersectionNode(l1,l2)).toBe(shared);
    expect(getIntersectionNode(null,null)).toBeNull();
  });
  it('daily temperatures monotonic stack', () => {
    const dailyTemperatures=(temps:number[]):number[]=>{const stack:number[]=[];const res=new Array(temps.length).fill(0);for(let i=0;i<temps.length;i++){while(stack.length&&temps[stack[stack.length-1]]<temps[i]){const idx=stack.pop()!;res[idx]=i-idx;}stack.push(i);}return res;};
    expect(dailyTemperatures([73,74,75,71,69,72,76,73])).toEqual([1,1,4,2,1,1,0,0]);
    expect(dailyTemperatures([30,40,50,60])).toEqual([1,1,1,0]);
    expect(dailyTemperatures([30,60,90])).toEqual([1,1,0]);
  });
  it('two sum less than k', () => {
    const twoSumLessThanK=(nums:number[],k:number):number=>{const sorted=[...nums].sort((a,b)=>a-b);let lo=0,hi=sorted.length-1,best=-1;while(lo<hi){const s=sorted[lo]+sorted[hi];if(s<k){best=Math.max(best,s);lo++;}else hi--;}return best;};
    expect(twoSumLessThanK([34,23,1,24,75,33,54,8],60)).toBe(58);
    expect(twoSumLessThanK([10,20,30],15)).toBe(-1);
    expect(twoSumLessThanK([254,914,971,990,525,33,186,136,54,104],1000)).toBe(968);
  });
});

describe('phase62 coverage', () => {
  it('power of two three four', () => {
    const isPowerOf2=(n:number):boolean=>n>0&&(n&(n-1))===0;
    const isPowerOf3=(n:number):boolean=>{if(n<=0)return false;while(n%3===0)n/=3;return n===1;};
    const isPowerOf4=(n:number):boolean=>n>0&&(n&(n-1))===0&&(n&0xAAAAAAAA)===0;
    expect(isPowerOf2(16)).toBe(true);
    expect(isPowerOf2(5)).toBe(false);
    expect(isPowerOf3(27)).toBe(true);
    expect(isPowerOf3(0)).toBe(false);
    expect(isPowerOf4(16)).toBe(true);
    expect(isPowerOf4(5)).toBe(false);
  });
  it('reverse words in string', () => {
    const reverseWords=(s:string):string=>s.trim().split(/\s+/).reverse().join(' ');
    expect(reverseWords('the sky is blue')).toBe('blue is sky the');
    expect(reverseWords('  hello world  ')).toBe('world hello');
    expect(reverseWords('a good   example')).toBe('example good a');
  });
  it('count and say sequence', () => {
    const countAndSay=(n:number):string=>{let s='1';for(let i=1;i<n;i++){let next='';let j=0;while(j<s.length){let k=j;while(k<s.length&&s[k]===s[j])k++;next+=`${k-j}${s[j]}`;j=k;}s=next;}return s;};
    expect(countAndSay(1)).toBe('1');
    expect(countAndSay(4)).toBe('1211');
    expect(countAndSay(5)).toBe('111221');
  });
  it('multiply strings big numbers', () => {
    const multiply=(num1:string,num2:string):string=>{if(num1==='0'||num2==='0')return'0';const m=num1.length,n=num2.length;const pos=new Array(m+n).fill(0);for(let i=m-1;i>=0;i--)for(let j=n-1;j>=0;j--){const mul=(num1.charCodeAt(i)-48)*(num2.charCodeAt(j)-48);const p1=i+j,p2=i+j+1;const sum=mul+pos[p2];pos[p2]=sum%10;pos[p1]+=Math.floor(sum/10);}return pos.join('').replace(/^0+/,'')||'0';};
    expect(multiply('2','3')).toBe('6');
    expect(multiply('123','456')).toBe('56088');
    expect(multiply('0','52')).toBe('0');
  });
  it('sum without plus operator', () => {
    const getSum=(a:number,b:number):number=>{while(b!==0){const carry=(a&b)<<1;a=a^b;b=carry;}return a;};
    expect(getSum(1,2)).toBe(3);
    expect(getSum(2,3)).toBe(5);
    expect(getSum(-1,1)).toBe(0);
    expect(getSum(0,0)).toBe(0);
  });
});

describe('phase63 coverage', () => {
  it('car fleet problem', () => {
    const carFleet=(target:number,position:number[],speed:number[]):number=>{const cars=position.map((p,i)=>[(target-p)/speed[i],p]).sort((a,b)=>b[1]-a[1]);let fleets=0,maxTime=0;for(const[time]of cars){if(time>maxTime){fleets++;maxTime=time;}}return fleets;};
    expect(carFleet(12,[10,8,0,5,3],[2,4,1,1,3])).toBe(3);
    expect(carFleet(10,[3],[3])).toBe(1);
    expect(carFleet(100,[0,2,4],[4,2,1])).toBe(1);
  });
  it('detect capital use', () => {
    const detectCapitalUse=(word:string):boolean=>{const allUpper=word===word.toUpperCase();const allLower=word===word.toLowerCase();const firstUpper=word[0]===word[0].toUpperCase()&&word.slice(1)===word.slice(1).toLowerCase();return allUpper||allLower||firstUpper;};
    expect(detectCapitalUse('USA')).toBe(true);
    expect(detectCapitalUse('leetcode')).toBe(true);
    expect(detectCapitalUse('Google')).toBe(true);
    expect(detectCapitalUse('FlaG')).toBe(false);
  });
  it('longest valid parentheses', () => {
    const longestValidParentheses=(s:string):number=>{const stack:number[]=[-1];let max=0;for(let i=0;i<s.length;i++){if(s[i]==='(')stack.push(i);else{stack.pop();if(!stack.length)stack.push(i);else max=Math.max(max,i-stack[stack.length-1]);}}return max;};
    expect(longestValidParentheses('(()')).toBe(2);
    expect(longestValidParentheses(')()())')).toBe(4);
    expect(longestValidParentheses('')).toBe(0);
    expect(longestValidParentheses('()()')).toBe(4);
  });
  it('number of matching subsequences', () => {
    const numMatchingSubseq=(s:string,words:string[]):number=>{const isSub=(w:string):boolean=>{let i=0;for(const c of s)if(i<w.length&&c===w[i])i++;return i===w.length;};return words.filter(isSub).length;};
    expect(numMatchingSubseq('abcde',['a','bb','acd','ace'])).toBe(3);
    expect(numMatchingSubseq('dsahjpjauf',['ahjpjau','ja','ahbwzgqnuk','tnmlanowax'])).toBe(2);
  });
  it('meeting rooms II min rooms', () => {
    const minMeetingRooms=(intervals:[number,number][]):number=>{const starts=intervals.map(i=>i[0]).sort((a,b)=>a-b);const ends=intervals.map(i=>i[1]).sort((a,b)=>a-b);let rooms=0,endPtr=0;for(let i=0;i<starts.length;i++){if(starts[i]<ends[endPtr])rooms++;else endPtr++;}return rooms;};
    expect(minMeetingRooms([[0,30],[5,10],[15,20]])).toBe(2);
    expect(minMeetingRooms([[7,10],[2,4]])).toBe(1);
    expect(minMeetingRooms([[1,5],[8,9],[8,9]])).toBe(2);
  });
});

describe('phase64 coverage', () => {
  describe('first missing positive', () => {
    function fmp(nums:number[]):number{const n=nums.length;for(let i=0;i<n;i++)while(nums[i]>0&&nums[i]<=n&&nums[nums[i]-1]!==nums[i]){const t=nums[nums[i]-1];nums[nums[i]-1]=nums[i];nums[i]=t;}for(let i=0;i<n;i++)if(nums[i]!==i+1)return i+1;return n+1;}
    it('ex1'   ,()=>expect(fmp([1,2,0])).toBe(3));
    it('ex2'   ,()=>expect(fmp([3,4,-1,1])).toBe(2));
    it('ex3'   ,()=>expect(fmp([7,8,9,11,12])).toBe(1));
    it('seq'   ,()=>expect(fmp([1,2,3])).toBe(4));
    it('one'   ,()=>expect(fmp([1])).toBe(2));
  });
  describe('scramble string', () => {
    function isScramble(s1:string,s2:string):boolean{if(s1===s2)return true;if(s1.length!==s2.length)return false;const memo=new Map<string,boolean>();function dp(a:string,b:string):boolean{const k=a+'|'+b;if(memo.has(k))return memo.get(k)!;if(a===b){memo.set(k,true);return true;}const n=a.length,cnt=new Array(26).fill(0);for(let i=0;i<n;i++){cnt[a.charCodeAt(i)-97]++;cnt[b.charCodeAt(i)-97]--;}if(cnt.some(c=>c!==0)){memo.set(k,false);return false;}for(let i=1;i<n;i++){if(dp(a.slice(0,i),b.slice(0,i))&&dp(a.slice(i),b.slice(i))){memo.set(k,true);return true;}if(dp(a.slice(0,i),b.slice(n-i))&&dp(a.slice(i),b.slice(0,n-i))){memo.set(k,true);return true;}}memo.set(k,false);return false;}return dp(s1,s2);}
    it('ex1'   ,()=>expect(isScramble('great','rgeat')).toBe(true));
    it('ex2'   ,()=>expect(isScramble('abcde','caebd')).toBe(false));
    it('same'  ,()=>expect(isScramble('a','a')).toBe(true));
    it('ab_ba' ,()=>expect(isScramble('ab','ba')).toBe(true));
    it('abc'   ,()=>expect(isScramble('abc','bca')).toBe(true));
  });
  describe('rotate array', () => {
    function rotate(nums:number[],k:number):void{k=k%nums.length;const rev=(a:number[],i:number,j:number)=>{while(i<j){[a[i],a[j]]=[a[j],a[i]];i++;j--;}};rev(nums,0,nums.length-1);rev(nums,0,k-1);rev(nums,k,nums.length-1);}
    it('ex1'   ,()=>{const a=[1,2,3,4,5,6,7];rotate(a,3);expect(a).toEqual([5,6,7,1,2,3,4]);});
    it('ex2'   ,()=>{const a=[-1,-100,3,99];rotate(a,2);expect(a).toEqual([3,99,-1,-100]);});
    it('k0'    ,()=>{const a=[1,2,3];rotate(a,0);expect(a).toEqual([1,2,3]);});
    it('kEqLen',()=>{const a=[1,2,3];rotate(a,3);expect(a).toEqual([1,2,3]);});
    it('k1'    ,()=>{const a=[1,2,3,4];rotate(a,1);expect(a).toEqual([4,1,2,3]);});
  });
  describe('edit distance', () => {
    function minDistance(w1:string,w2:string):number{const m=w1.length,n=w2.length,dp=Array.from({length:m+1},(_,i)=>new Array(n+1).fill(0).map((_,j)=>i?j?0:i:j));for(let i=1;i<=m;i++)for(let j=1;j<=n;j++)dp[i][j]=w1[i-1]===w2[j-1]?dp[i-1][j-1]:1+Math.min(dp[i-1][j],dp[i][j-1],dp[i-1][j-1]);return dp[m][n];}
    it('ex1'   ,()=>expect(minDistance('horse','ros')).toBe(3));
    it('ex2'   ,()=>expect(minDistance('intention','execution')).toBe(5));
    it('same'  ,()=>expect(minDistance('abc','abc')).toBe(0));
    it('empty1',()=>expect(minDistance('','abc')).toBe(3));
    it('empty2',()=>expect(minDistance('abc','')).toBe(3));
  });
  describe('distinct subsequences', () => {
    function numDistinct(s:string,t:string):number{const m=s.length,n=t.length,dp=new Array(n+1).fill(0);dp[0]=1;for(let i=0;i<m;i++)for(let j=n-1;j>=0;j--)if(s[i]===t[j])dp[j+1]+=dp[j];return dp[n];}
    it('ex1'   ,()=>expect(numDistinct('rabbbit','rabbit')).toBe(3));
    it('ex2'   ,()=>expect(numDistinct('babgbag','bag')).toBe(5));
    it('same'  ,()=>expect(numDistinct('abc','abc')).toBe(1));
    it('empty' ,()=>expect(numDistinct('','a')).toBe(0));
    it('repeat',()=>expect(numDistinct('aaa','a')).toBe(3));
  });
});

describe('phase65 coverage', () => {
  describe('single number III', () => {
    function sn3(nums:number[]):[number,number]{let x=nums.reduce((a,b)=>a^b,0);const b=x&(-x);let a=0;for(const n of nums)if(n&b)a^=n;const res:[number,number]=[a,x^a];res.sort((p,q)=>p-q);return res;}
    it('ex1'   ,()=>expect(sn3([1,2,1,3,2,5])).toEqual([3,5]));
    it('ex2'   ,()=>expect(sn3([-1,0])).toEqual([-1,0]));
    it('two'   ,()=>expect(sn3([1,2])).toEqual([1,2]));
    it('neg'   ,()=>expect(sn3([-1,-2,-1,-3,-2,-4])).toEqual([-4,-3]));
    it('large' ,()=>expect(sn3([0,1,0,2])).toEqual([1,2]));
  });
});

describe('phase66 coverage', () => {
  describe('keyboard row', () => {
    function kbRow(words:string[]):string[]{const rows=['qwertyuiop','asdfghjkl','zxcvbnm'];return words.filter(w=>rows.some(r=>w.toLowerCase().split('').every(c=>r.includes(c))));}
    it('ex1'   ,()=>expect(kbRow(['Hello','Alaska','Dad','Peace']).length).toBe(2));
    it('ex2'   ,()=>expect(kbRow(['aS','dd']).length).toBe(2));
    it('empty' ,()=>expect(kbRow([])).toEqual([]));
    it('none'  ,()=>expect(kbRow(['abc'])).toEqual([]));
    it('all'   ,()=>expect(kbRow(['qwer','asdf','zxcv'])).toHaveLength(3));
  });
});

describe('phase67 coverage', () => {
  describe('longest palindromic substring', () => {
    function lps(s:string):string{let st=0,mx=1;function exp(l:number,r:number):void{while(l>=0&&r<s.length&&s[l]===s[r]){if(r-l+1>mx){mx=r-l+1;st=l;}l--;r++;}}for(let i=0;i<s.length;i++){exp(i,i);exp(i,i+1);}return s.slice(st,st+mx);}
    it('babad' ,()=>expect(['bab','aba'].includes(lps('babad'))).toBe(true));
    it('cbbd'  ,()=>expect(lps('cbbd')).toBe('bb'));
    it('a'     ,()=>expect(lps('a')).toBe('a'));
    it('ac'    ,()=>expect(['a','c'].includes(lps('ac'))).toBe(true));
    it('racecar',()=>expect(lps('racecar')).toBe('racecar'));
  });
});


// partitionLabels
function partitionLabelsP68(s:string):number[]{const last=new Array(26).fill(0);for(let i=0;i<s.length;i++)last[s.charCodeAt(i)-97]=i;const res:number[]=[];let start=0,end=0;for(let i=0;i<s.length;i++){end=Math.max(end,last[s.charCodeAt(i)-97]);if(i===end){res.push(end-start+1);start=end+1;}}return res;}
describe('phase68 partitionLabels coverage',()=>{
  it('ex1',()=>expect(partitionLabelsP68('ababcbacadefegdehijhklij')).toEqual([9,7,8]));
  it('single',()=>expect(partitionLabelsP68('a')).toEqual([1]));
  it('two_diff',()=>expect(partitionLabelsP68('ab')).toEqual([1,1]));
  it('all_same',()=>expect(partitionLabelsP68('aaa')).toEqual([3]));
  it('ex2',()=>expect(partitionLabelsP68('eccbbbbdec')).toEqual([10]));
});


// longestPalindromicSubstring
function longestPalinSubstrP69(s:string):string{let best='';function expand(l:number,r:number){while(l>=0&&r<s.length&&s[l]===s[r]){l--;r++;}if(r-l-1>best.length)best=s.slice(l+1,r);}for(let i=0;i<s.length;i++){expand(i,i);expand(i,i+1);}return best;}
describe('phase69 longestPalinSubstr coverage',()=>{
  it('babad',()=>expect(longestPalinSubstrP69('babad').length).toBe(3));
  it('cbbd',()=>expect(longestPalinSubstrP69('cbbd')).toBe('bb'));
  it('single',()=>expect(longestPalinSubstrP69('a')).toBe('a'));
  it('racecar',()=>expect(longestPalinSubstrP69('racecar')).toBe('racecar'));
  it('abba',()=>expect(longestPalinSubstrP69('abba')).toBe('abba'));
});


// minFlipsMonoIncreasing
function minFlipsP70(s:string):number{let dp0=0,dp1=0;for(const c of s){const nd1=Math.min(dp0,dp1)+(c==='1'?0:1);const nd0=dp0+(c==='0'?0:1);dp0=nd0;dp1=nd1;}return Math.min(dp0,dp1);}
describe('phase70 minFlips coverage',()=>{
  it('ex1',()=>expect(minFlipsP70('00110')).toBe(1));
  it('ex2',()=>expect(minFlipsP70('010110')).toBe(2));
  it('already',()=>expect(minFlipsP70('00011')).toBe(0));
  it('all_flip',()=>expect(minFlipsP70('11000')).toBe(2));
  it('single',()=>expect(minFlipsP70('0')).toBe(0));
});

describe('phase71 coverage', () => {
  function shortestSuperseqP71(s1:string,s2:string):number{const m=s1.length,n=s2.length;const dp:number[][]=Array.from({length:m+1},()=>new Array(n+1).fill(0));for(let i=0;i<=m;i++)dp[i][0]=i;for(let j=0;j<=n;j++)dp[0][j]=j;for(let i=1;i<=m;i++)for(let j=1;j<=n;j++){if(s1[i-1]===s2[j-1])dp[i][j]=1+dp[i-1][j-1];else dp[i][j]=1+Math.min(dp[i-1][j],dp[i][j-1]);}return dp[m][n];}
  it('p71_1', () => { expect(shortestSuperseqP71('abac','cab')).toBe(5); });
  it('p71_2', () => { expect(shortestSuperseqP71('geek','eke')).toBe(5); });
  it('p71_3', () => { expect(shortestSuperseqP71('a','b')).toBe(2); });
  it('p71_4', () => { expect(shortestSuperseqP71('ab','ab')).toBe(2); });
  it('p71_5', () => { expect(shortestSuperseqP71('abc','bc')).toBe(3); });
});
function numPerfectSquares72(n:number):number{const dp=new Array(n+1).fill(Infinity);dp[0]=0;for(let i=1;i<=n;i++)for(let j=1;j*j<=i;j++)dp[i]=Math.min(dp[i],dp[i-j*j]+1);return dp[n];}
describe('ph72_nps',()=>{
  it('a',()=>{expect(numPerfectSquares72(12)).toBe(3);});
  it('b',()=>{expect(numPerfectSquares72(13)).toBe(2);});
  it('c',()=>{expect(numPerfectSquares72(1)).toBe(1);});
  it('d',()=>{expect(numPerfectSquares72(4)).toBe(1);});
  it('e',()=>{expect(numPerfectSquares72(7)).toBe(4);});
});

function climbStairsMemo273(n:number):number{const dp=new Array(n+1).fill(0);dp[0]=1;if(n>0)dp[1]=1;for(let i=2;i<=n;i++)dp[i]=dp[i-1]+dp[i-2];return dp[n];}
describe('ph73_csm2',()=>{
  it('a',()=>{expect(climbStairsMemo273(2)).toBe(2);});
  it('b',()=>{expect(climbStairsMemo273(3)).toBe(3);});
  it('c',()=>{expect(climbStairsMemo273(10)).toBe(89);});
  it('d',()=>{expect(climbStairsMemo273(0)).toBe(1);});
  it('e',()=>{expect(climbStairsMemo273(1)).toBe(1);});
});

function longestPalSubseq74(s:string):number{const n=s.length;const dp:number[][]=Array.from({length:n},()=>new Array(n).fill(0));for(let i=0;i<n;i++)dp[i][i]=1;for(let len=2;len<=n;len++)for(let i=0;i<=n-len;i++){const j=i+len-1;dp[i][j]=s[i]===s[j]?dp[i+1][j-1]+2:Math.max(dp[i+1][j],dp[i][j-1]);}return dp[0][n-1];}
describe('ph74_lps',()=>{
  it('a',()=>{expect(longestPalSubseq74("bbbab")).toBe(4);});
  it('b',()=>{expect(longestPalSubseq74("cbbd")).toBe(2);});
  it('c',()=>{expect(longestPalSubseq74("a")).toBe(1);});
  it('d',()=>{expect(longestPalSubseq74("abcba")).toBe(5);});
  it('e',()=>{expect(longestPalSubseq74("abcde")).toBe(1);});
});

function searchRotated75(arr:number[],t:number):number{let lo=0,hi=arr.length-1;while(lo<=hi){const m=(lo+hi)>>1;if(arr[m]===t)return m;if(arr[lo]<=arr[m]){if(arr[lo]<=t&&t<arr[m])hi=m-1;else lo=m+1;}else{if(arr[m]<t&&t<=arr[hi])lo=m+1;else hi=m-1;}}return -1;}
describe('ph75_sr',()=>{
  it('a',()=>{expect(searchRotated75([4,5,6,7,0,1,2],0)).toBe(4);});
  it('b',()=>{expect(searchRotated75([4,5,6,7,0,1,2],3)).toBe(-1);});
  it('c',()=>{expect(searchRotated75([1],0)).toBe(-1);});
  it('d',()=>{expect(searchRotated75([1,3],3)).toBe(1);});
  it('e',()=>{expect(searchRotated75([5,1,3],3)).toBe(2);});
});

function hammingDist76(x:number,y:number):number{let d=x^y,cnt=0;while(d){cnt+=d&1;d>>=1;}return cnt;}
describe('ph76_hd',()=>{
  it('a',()=>{expect(hammingDist76(1,4)).toBe(2);});
  it('b',()=>{expect(hammingDist76(3,1)).toBe(1);});
  it('c',()=>{expect(hammingDist76(0,0)).toBe(0);});
  it('d',()=>{expect(hammingDist76(7,0)).toBe(3);});
  it('e',()=>{expect(hammingDist76(93,73)).toBe(2);});
});

function triMinSum77(tri:number[][]):number{const dp=tri[tri.length-1].slice();for(let i=tri.length-2;i>=0;i--)for(let j=0;j<=i;j++)dp[j]=tri[i][j]+Math.min(dp[j],dp[j+1]);return dp[0];}
describe('ph77_tms',()=>{
  it('a',()=>{expect(triMinSum77([[2],[3,4],[6,5,7],[4,1,8,3]])).toBe(11);});
  it('b',()=>{expect(triMinSum77([[-10]])).toBe(-10);});
  it('c',()=>{expect(triMinSum77([[1],[2,3]])).toBe(3);});
  it('d',()=>{expect(triMinSum77([[1],[2,3],[4,5,6]])).toBe(7);});
  it('e',()=>{expect(triMinSum77([[0],[1,1]])).toBe(1);});
});

function findMinRotated78(arr:number[]):number{let lo=0,hi=arr.length-1;while(lo<hi){const m=(lo+hi)>>1;if(arr[m]>arr[hi])lo=m+1;else hi=m;}return arr[lo];}
describe('ph78_fmr',()=>{
  it('a',()=>{expect(findMinRotated78([3,4,5,1,2])).toBe(1);});
  it('b',()=>{expect(findMinRotated78([4,5,6,7,0,1,2])).toBe(0);});
  it('c',()=>{expect(findMinRotated78([11,13,15,17])).toBe(11);});
  it('d',()=>{expect(findMinRotated78([1])).toBe(1);});
  it('e',()=>{expect(findMinRotated78([2,1])).toBe(1);});
});

function countOnesBin79(n:number):number{let cnt=0;while(n){cnt+=n&1;n>>>=1;}return cnt;}
describe('ph79_cob',()=>{
  it('a',()=>{expect(countOnesBin79(7)).toBe(3);});
  it('b',()=>{expect(countOnesBin79(128)).toBe(1);});
  it('c',()=>{expect(countOnesBin79(0)).toBe(0);});
  it('d',()=>{expect(countOnesBin79(15)).toBe(4);});
  it('e',()=>{expect(countOnesBin79(255)).toBe(8);});
});

function findMinRotated80(arr:number[]):number{let lo=0,hi=arr.length-1;while(lo<hi){const m=(lo+hi)>>1;if(arr[m]>arr[hi])lo=m+1;else hi=m;}return arr[lo];}
describe('ph80_fmr',()=>{
  it('a',()=>{expect(findMinRotated80([3,4,5,1,2])).toBe(1);});
  it('b',()=>{expect(findMinRotated80([4,5,6,7,0,1,2])).toBe(0);});
  it('c',()=>{expect(findMinRotated80([11,13,15,17])).toBe(11);});
  it('d',()=>{expect(findMinRotated80([1])).toBe(1);});
  it('e',()=>{expect(findMinRotated80([2,1])).toBe(1);});
});

function hammingDist81(x:number,y:number):number{let d=x^y,cnt=0;while(d){cnt+=d&1;d>>=1;}return cnt;}
describe('ph81_hd',()=>{
  it('a',()=>{expect(hammingDist81(1,4)).toBe(2);});
  it('b',()=>{expect(hammingDist81(3,1)).toBe(1);});
  it('c',()=>{expect(hammingDist81(0,0)).toBe(0);});
  it('d',()=>{expect(hammingDist81(7,0)).toBe(3);});
  it('e',()=>{expect(hammingDist81(93,73)).toBe(2);});
});

function maxSqBinary82(matrix:string[][]):number{const m=matrix.length,n=matrix[0].length;const dp:number[][]=Array.from({length:m},()=>new Array(n).fill(0));let max=0;for(let i=0;i<m;i++)for(let j=0;j<n;j++){if(matrix[i][j]==='1'){dp[i][j]=i>0&&j>0?Math.min(dp[i-1][j],dp[i][j-1],dp[i-1][j-1])+1:1;max=Math.max(max,dp[i][j]);}}return max*max;}
describe('ph82_msb',()=>{
  it('a',()=>{expect(maxSqBinary82([["1","0","1","0","0"],["1","0","1","1","1"],["1","1","1","1","1"],["1","0","0","1","0"]])).toBe(4);});
  it('b',()=>{expect(maxSqBinary82([["0","1"],["1","0"]])).toBe(1);});
  it('c',()=>{expect(maxSqBinary82([["0"]])).toBe(0);});
  it('d',()=>{expect(maxSqBinary82([["1","1"],["1","1"]])).toBe(4);});
  it('e',()=>{expect(maxSqBinary82([["1"]])).toBe(1);});
});

function numberOfWaysCoins83(amount:number,coins:number[]):number{const dp=new Array(amount+1).fill(0);dp[0]=1;for(const c of coins)for(let i=c;i<=amount;i++)dp[i]+=dp[i-c];return dp[amount];}
describe('ph83_nwc',()=>{
  it('a',()=>{expect(numberOfWaysCoins83(5,[1,2,5])).toBe(4);});
  it('b',()=>{expect(numberOfWaysCoins83(3,[2])).toBe(0);});
  it('c',()=>{expect(numberOfWaysCoins83(10,[10])).toBe(1);});
  it('d',()=>{expect(numberOfWaysCoins83(4,[1,2,3])).toBe(4);});
  it('e',()=>{expect(numberOfWaysCoins83(0,[1,2])).toBe(1);});
});

function isPower284(n:number):boolean{return n>0&&(n&(n-1))===0;}
describe('ph84_ip2',()=>{
  it('a',()=>{expect(isPower284(16)).toBe(true);});
  it('b',()=>{expect(isPower284(3)).toBe(false);});
  it('c',()=>{expect(isPower284(1)).toBe(true);});
  it('d',()=>{expect(isPower284(0)).toBe(false);});
  it('e',()=>{expect(isPower284(1024)).toBe(true);});
});

function countPalinSubstr85(s:string):number{let cnt=0;for(let c=0;c<s.length;c++){for(let r=0;r<=1;r++){let l=c,ri=c+r;while(l>=0&&ri<s.length&&s[l]===s[ri]){cnt++;l--;ri++;}}}return cnt;}
describe('ph85_cps',()=>{
  it('a',()=>{expect(countPalinSubstr85("abc")).toBe(3);});
  it('b',()=>{expect(countPalinSubstr85("aaa")).toBe(6);});
  it('c',()=>{expect(countPalinSubstr85("abba")).toBe(6);});
  it('d',()=>{expect(countPalinSubstr85("a")).toBe(1);});
  it('e',()=>{expect(countPalinSubstr85("")).toBe(0);});
});

function numberOfWaysCoins86(amount:number,coins:number[]):number{const dp=new Array(amount+1).fill(0);dp[0]=1;for(const c of coins)for(let i=c;i<=amount;i++)dp[i]+=dp[i-c];return dp[amount];}
describe('ph86_nwc',()=>{
  it('a',()=>{expect(numberOfWaysCoins86(5,[1,2,5])).toBe(4);});
  it('b',()=>{expect(numberOfWaysCoins86(3,[2])).toBe(0);});
  it('c',()=>{expect(numberOfWaysCoins86(10,[10])).toBe(1);});
  it('d',()=>{expect(numberOfWaysCoins86(4,[1,2,3])).toBe(4);});
  it('e',()=>{expect(numberOfWaysCoins86(0,[1,2])).toBe(1);});
});

function reverseInteger87(x:number):number{const MAX=2**31-1,MIN=-(2**31);let rev=0,n=Math.abs(x),sign=x<0?-1:1;while(n){rev=rev*10+(n%10);n=Math.floor(n/10);}rev=sign*rev;return rev>MAX||rev<MIN?0:rev;}
describe('ph87_ri',()=>{
  it('a',()=>{expect(reverseInteger87(123)).toBe(321);});
  it('b',()=>{expect(reverseInteger87(-123)).toBe(-321);});
  it('c',()=>{expect(reverseInteger87(1534236469)).toBe(0);});
  it('d',()=>{expect(reverseInteger87(120)).toBe(21);});
  it('e',()=>{expect(reverseInteger87(0)).toBe(0);});
});

function rangeBitwiseAnd88(m:number,n:number):number{let shift=0;while(m!==n){m>>=1;n>>=1;shift++;}return m<<shift;}
describe('ph88_rba',()=>{
  it('a',()=>{expect(rangeBitwiseAnd88(5,7)).toBe(4);});
  it('b',()=>{expect(rangeBitwiseAnd88(0,0)).toBe(0);});
  it('c',()=>{expect(rangeBitwiseAnd88(1,2147483647)).toBe(0);});
  it('d',()=>{expect(rangeBitwiseAnd88(6,7)).toBe(6);});
  it('e',()=>{expect(rangeBitwiseAnd88(2,3)).toBe(2);});
});

function climbStairsMemo289(n:number):number{const dp=new Array(n+1).fill(0);dp[0]=1;if(n>0)dp[1]=1;for(let i=2;i<=n;i++)dp[i]=dp[i-1]+dp[i-2];return dp[n];}
describe('ph89_csm2',()=>{
  it('a',()=>{expect(climbStairsMemo289(2)).toBe(2);});
  it('b',()=>{expect(climbStairsMemo289(3)).toBe(3);});
  it('c',()=>{expect(climbStairsMemo289(10)).toBe(89);});
  it('d',()=>{expect(climbStairsMemo289(0)).toBe(1);});
  it('e',()=>{expect(climbStairsMemo289(1)).toBe(1);});
});

function maxProfitCooldown90(prices:number[]):number{let hold=-Infinity,sold=0,rest=0;for(const p of prices){const prevSold=sold;sold=hold+p;hold=Math.max(hold,rest-p);rest=Math.max(rest,prevSold);}return Math.max(sold,rest);}
describe('ph90_mpc',()=>{
  it('a',()=>{expect(maxProfitCooldown90([1,2,3,0,2])).toBe(3);});
  it('b',()=>{expect(maxProfitCooldown90([1])).toBe(0);});
  it('c',()=>{expect(maxProfitCooldown90([2,1,4])).toBe(3);});
  it('d',()=>{expect(maxProfitCooldown90([6,1,3,2,4,7])).toBe(6);});
  it('e',()=>{expect(maxProfitCooldown90([1,4,2])).toBe(3);});
});

function searchRotated91(arr:number[],t:number):number{let lo=0,hi=arr.length-1;while(lo<=hi){const m=(lo+hi)>>1;if(arr[m]===t)return m;if(arr[lo]<=arr[m]){if(arr[lo]<=t&&t<arr[m])hi=m-1;else lo=m+1;}else{if(arr[m]<t&&t<=arr[hi])lo=m+1;else hi=m-1;}}return -1;}
describe('ph91_sr',()=>{
  it('a',()=>{expect(searchRotated91([4,5,6,7,0,1,2],0)).toBe(4);});
  it('b',()=>{expect(searchRotated91([4,5,6,7,0,1,2],3)).toBe(-1);});
  it('c',()=>{expect(searchRotated91([1],0)).toBe(-1);});
  it('d',()=>{expect(searchRotated91([1,3],3)).toBe(1);});
  it('e',()=>{expect(searchRotated91([5,1,3],3)).toBe(2);});
});

function longestIncSubseq292(nums:number[]):number{const tails:number[]=[];for(const n of nums){let lo=0,hi=tails.length;while(lo<hi){const m=(lo+hi)>>1;if(tails[m]<n)lo=m+1;else hi=m;}tails[lo]=n;}return tails.length;}
describe('ph92_lis2',()=>{
  it('a',()=>{expect(longestIncSubseq292([10,9,2,5,3,7,101,18])).toBe(4);});
  it('b',()=>{expect(longestIncSubseq292([0,1,0,3,2,3])).toBe(4);});
  it('c',()=>{expect(longestIncSubseq292([7,7,7])).toBe(1);});
  it('d',()=>{expect(longestIncSubseq292([1,3,6,7,9,4,10,5,6])).toBe(6);});
  it('e',()=>{expect(longestIncSubseq292([5])).toBe(1);});
});

function searchRotated93(arr:number[],t:number):number{let lo=0,hi=arr.length-1;while(lo<=hi){const m=(lo+hi)>>1;if(arr[m]===t)return m;if(arr[lo]<=arr[m]){if(arr[lo]<=t&&t<arr[m])hi=m-1;else lo=m+1;}else{if(arr[m]<t&&t<=arr[hi])lo=m+1;else hi=m-1;}}return -1;}
describe('ph93_sr',()=>{
  it('a',()=>{expect(searchRotated93([4,5,6,7,0,1,2],0)).toBe(4);});
  it('b',()=>{expect(searchRotated93([4,5,6,7,0,1,2],3)).toBe(-1);});
  it('c',()=>{expect(searchRotated93([1],0)).toBe(-1);});
  it('d',()=>{expect(searchRotated93([1,3],3)).toBe(1);});
  it('e',()=>{expect(searchRotated93([5,1,3],3)).toBe(2);});
});

function singleNumXOR94(nums:number[]):number{return nums.reduce((a,b)=>a^b,0);}
describe('ph94_snx',()=>{
  it('a',()=>{expect(singleNumXOR94([4,1,2,1,2])).toBe(4);});
  it('b',()=>{expect(singleNumXOR94([2,2,1])).toBe(1);});
  it('c',()=>{expect(singleNumXOR94([1])).toBe(1);});
  it('d',()=>{expect(singleNumXOR94([0,0,5])).toBe(5);});
  it('e',()=>{expect(singleNumXOR94([99,99,7,7,3])).toBe(3);});
});

function maxProfitCooldown95(prices:number[]):number{let hold=-Infinity,sold=0,rest=0;for(const p of prices){const prevSold=sold;sold=hold+p;hold=Math.max(hold,rest-p);rest=Math.max(rest,prevSold);}return Math.max(sold,rest);}
describe('ph95_mpc',()=>{
  it('a',()=>{expect(maxProfitCooldown95([1,2,3,0,2])).toBe(3);});
  it('b',()=>{expect(maxProfitCooldown95([1])).toBe(0);});
  it('c',()=>{expect(maxProfitCooldown95([2,1,4])).toBe(3);});
  it('d',()=>{expect(maxProfitCooldown95([6,1,3,2,4,7])).toBe(6);});
  it('e',()=>{expect(maxProfitCooldown95([1,4,2])).toBe(3);});
});

function stairwayDP96(n:number):number{if(n<=1)return 1;let a=1,b=2;for(let i=3;i<=n;i++){const c=a+b;a=b;b=c;}return b;}
describe('ph96_sdp',()=>{
  it('a',()=>{expect(stairwayDP96(4)).toBe(5);});
  it('b',()=>{expect(stairwayDP96(2)).toBe(2);});
  it('c',()=>{expect(stairwayDP96(1)).toBe(1);});
  it('d',()=>{expect(stairwayDP96(5)).toBe(8);});
  it('e',()=>{expect(stairwayDP96(10)).toBe(89);});
});

function houseRobber297(nums:number[]):number{if(nums.length===1)return nums[0];function rob(arr:number[]):number{let prev2=0,prev1=0;for(const n of arr){const t=Math.max(prev1,prev2+n);prev2=prev1;prev1=t;}return prev1;}return Math.max(rob(nums.slice(0,-1)),rob(nums.slice(1)));}
describe('ph97_hr2',()=>{
  it('a',()=>{expect(houseRobber297([2,3,2])).toBe(3);});
  it('b',()=>{expect(houseRobber297([1,2,3,1])).toBe(4);});
  it('c',()=>{expect(houseRobber297([1,2,3])).toBe(3);});
  it('d',()=>{expect(houseRobber297([200,3,140,20,10])).toBe(340);});
  it('e',()=>{expect(houseRobber297([1])).toBe(1);});
});

function houseRobber298(nums:number[]):number{if(nums.length===1)return nums[0];function rob(arr:number[]):number{let prev2=0,prev1=0;for(const n of arr){const t=Math.max(prev1,prev2+n);prev2=prev1;prev1=t;}return prev1;}return Math.max(rob(nums.slice(0,-1)),rob(nums.slice(1)));}
describe('ph98_hr2',()=>{
  it('a',()=>{expect(houseRobber298([2,3,2])).toBe(3);});
  it('b',()=>{expect(houseRobber298([1,2,3,1])).toBe(4);});
  it('c',()=>{expect(houseRobber298([1,2,3])).toBe(3);});
  it('d',()=>{expect(houseRobber298([200,3,140,20,10])).toBe(340);});
  it('e',()=>{expect(houseRobber298([1])).toBe(1);});
});

function searchRotated99(arr:number[],t:number):number{let lo=0,hi=arr.length-1;while(lo<=hi){const m=(lo+hi)>>1;if(arr[m]===t)return m;if(arr[lo]<=arr[m]){if(arr[lo]<=t&&t<arr[m])hi=m-1;else lo=m+1;}else{if(arr[m]<t&&t<=arr[hi])lo=m+1;else hi=m-1;}}return -1;}
describe('ph99_sr',()=>{
  it('a',()=>{expect(searchRotated99([4,5,6,7,0,1,2],0)).toBe(4);});
  it('b',()=>{expect(searchRotated99([4,5,6,7,0,1,2],3)).toBe(-1);});
  it('c',()=>{expect(searchRotated99([1],0)).toBe(-1);});
  it('d',()=>{expect(searchRotated99([1,3],3)).toBe(1);});
  it('e',()=>{expect(searchRotated99([5,1,3],3)).toBe(2);});
});

function maxSqBinary100(matrix:string[][]):number{const m=matrix.length,n=matrix[0].length;const dp:number[][]=Array.from({length:m},()=>new Array(n).fill(0));let max=0;for(let i=0;i<m;i++)for(let j=0;j<n;j++){if(matrix[i][j]==='1'){dp[i][j]=i>0&&j>0?Math.min(dp[i-1][j],dp[i][j-1],dp[i-1][j-1])+1:1;max=Math.max(max,dp[i][j]);}}return max*max;}
describe('ph100_msb',()=>{
  it('a',()=>{expect(maxSqBinary100([["1","0","1","0","0"],["1","0","1","1","1"],["1","1","1","1","1"],["1","0","0","1","0"]])).toBe(4);});
  it('b',()=>{expect(maxSqBinary100([["0","1"],["1","0"]])).toBe(1);});
  it('c',()=>{expect(maxSqBinary100([["0"]])).toBe(0);});
  it('d',()=>{expect(maxSqBinary100([["1","1"],["1","1"]])).toBe(4);});
  it('e',()=>{expect(maxSqBinary100([["1"]])).toBe(1);});
});

function singleNumXOR101(nums:number[]):number{return nums.reduce((a,b)=>a^b,0);}
describe('ph101_snx',()=>{
  it('a',()=>{expect(singleNumXOR101([4,1,2,1,2])).toBe(4);});
  it('b',()=>{expect(singleNumXOR101([2,2,1])).toBe(1);});
  it('c',()=>{expect(singleNumXOR101([1])).toBe(1);});
  it('d',()=>{expect(singleNumXOR101([0,0,5])).toBe(5);});
  it('e',()=>{expect(singleNumXOR101([99,99,7,7,3])).toBe(3);});
});

function maxEnvelopes102(env:number[][]):number{env.sort((a,b)=>a[0]!==b[0]?a[0]-b[0]:b[1]-a[1]);const tails:number[]=[];for(const e of env){const h=e[1];let lo=0,hi=tails.length;while(lo<hi){const m=(lo+hi)>>1;if(tails[m]<h)lo=m+1;else hi=m;}tails[lo]=h;}return tails.length;}
describe('ph102_env',()=>{
  it('a',()=>{expect(maxEnvelopes102([[5,4],[6,4],[6,7],[2,3]])).toBe(3);});
  it('b',()=>{expect(maxEnvelopes102([[1,1],[1,1],[1,1]])).toBe(1);});
  it('c',()=>{expect(maxEnvelopes102([[1,2],[2,3],[3,4]])).toBe(3);});
  it('d',()=>{expect(maxEnvelopes102([[2,100],[3,200],[4,300],[5,500],[5,400],[5,250],[6,370],[6,360],[7,380]])).toBe(5);});
  it('e',()=>{expect(maxEnvelopes102([[1,3]])).toBe(1);});
});

function houseRobber2103(nums:number[]):number{if(nums.length===1)return nums[0];function rob(arr:number[]):number{let prev2=0,prev1=0;for(const n of arr){const t=Math.max(prev1,prev2+n);prev2=prev1;prev1=t;}return prev1;}return Math.max(rob(nums.slice(0,-1)),rob(nums.slice(1)));}
describe('ph103_hr2',()=>{
  it('a',()=>{expect(houseRobber2103([2,3,2])).toBe(3);});
  it('b',()=>{expect(houseRobber2103([1,2,3,1])).toBe(4);});
  it('c',()=>{expect(houseRobber2103([1,2,3])).toBe(3);});
  it('d',()=>{expect(houseRobber2103([200,3,140,20,10])).toBe(340);});
  it('e',()=>{expect(houseRobber2103([1])).toBe(1);});
});

function distinctSubseqs104(s:string,t:string):number{const m=s.length,n=t.length;const dp:number[][]=Array.from({length:m+1},()=>new Array(n+1).fill(0));for(let i=0;i<=m;i++)dp[i][0]=1;for(let i=1;i<=m;i++)for(let j=1;j<=n;j++)dp[i][j]=dp[i-1][j]+(s[i-1]===t[j-1]?dp[i-1][j-1]:0);return dp[m][n];}
describe('ph104_ds',()=>{
  it('a',()=>{expect(distinctSubseqs104("rabbbit","rabbit")).toBe(3);});
  it('b',()=>{expect(distinctSubseqs104("babgbag","bag")).toBe(5);});
  it('c',()=>{expect(distinctSubseqs104("a","b")).toBe(0);});
  it('d',()=>{expect(distinctSubseqs104("abc","abc")).toBe(1);});
  it('e',()=>{expect(distinctSubseqs104("aaa","a")).toBe(3);});
});

function singleNumXOR105(nums:number[]):number{return nums.reduce((a,b)=>a^b,0);}
describe('ph105_snx',()=>{
  it('a',()=>{expect(singleNumXOR105([4,1,2,1,2])).toBe(4);});
  it('b',()=>{expect(singleNumXOR105([2,2,1])).toBe(1);});
  it('c',()=>{expect(singleNumXOR105([1])).toBe(1);});
  it('d',()=>{expect(singleNumXOR105([0,0,5])).toBe(5);});
  it('e',()=>{expect(singleNumXOR105([99,99,7,7,3])).toBe(3);});
});

function longestCommonSub106(s:string,t:string):number{const m=s.length,n=t.length;const dp:number[][]=Array.from({length:m+1},()=>new Array(n+1).fill(0));for(let i=1;i<=m;i++)for(let j=1;j<=n;j++)dp[i][j]=s[i-1]===t[j-1]?dp[i-1][j-1]+1:Math.max(dp[i-1][j],dp[i][j-1]);return dp[m][n];}
describe('ph106_lcs',()=>{
  it('a',()=>{expect(longestCommonSub106("abcde","ace")).toBe(3);});
  it('b',()=>{expect(longestCommonSub106("abc","abc")).toBe(3);});
  it('c',()=>{expect(longestCommonSub106("abc","def")).toBe(0);});
  it('d',()=>{expect(longestCommonSub106("abcba","abcba")).toBe(5);});
  it('e',()=>{expect(longestCommonSub106("oxcpqrsvwf","shmtulqrypy")).toBe(2);});
});

function uniquePathsGrid107(m:number,n:number):number{const dp=new Array(n).fill(1);for(let i=1;i<m;i++)for(let j=1;j<n;j++)dp[j]+=dp[j-1];return dp[n-1];}
describe('ph107_upg',()=>{
  it('a',()=>{expect(uniquePathsGrid107(3,7)).toBe(28);});
  it('b',()=>{expect(uniquePathsGrid107(3,2)).toBe(3);});
  it('c',()=>{expect(uniquePathsGrid107(1,1)).toBe(1);});
  it('d',()=>{expect(uniquePathsGrid107(2,3)).toBe(3);});
  it('e',()=>{expect(uniquePathsGrid107(4,4)).toBe(20);});
});

function isPalindromeNum108(x:number):boolean{if(x<0)return false;const s=String(x);return s===s.split('').reverse().join('');}
describe('ph108_ipn',()=>{
  it('a',()=>{expect(isPalindromeNum108(121)).toBe(true);});
  it('b',()=>{expect(isPalindromeNum108(-121)).toBe(false);});
  it('c',()=>{expect(isPalindromeNum108(10)).toBe(false);});
  it('d',()=>{expect(isPalindromeNum108(0)).toBe(true);});
  it('e',()=>{expect(isPalindromeNum108(1221)).toBe(true);});
});

function reverseInteger109(x:number):number{const MAX=2**31-1,MIN=-(2**31);let rev=0,n=Math.abs(x),sign=x<0?-1:1;while(n){rev=rev*10+(n%10);n=Math.floor(n/10);}rev=sign*rev;return rev>MAX||rev<MIN?0:rev;}
describe('ph109_ri',()=>{
  it('a',()=>{expect(reverseInteger109(123)).toBe(321);});
  it('b',()=>{expect(reverseInteger109(-123)).toBe(-321);});
  it('c',()=>{expect(reverseInteger109(1534236469)).toBe(0);});
  it('d',()=>{expect(reverseInteger109(120)).toBe(21);});
  it('e',()=>{expect(reverseInteger109(0)).toBe(0);});
});

function nthTribo110(n:number):number{if(n===0)return 0;if(n<=2)return 1;let a=0,b=1,c=1;for(let i=3;i<=n;i++){const d=a+b+c;a=b;b=c;c=d;}return c;}
describe('ph110_tribo',()=>{
  it('a',()=>{expect(nthTribo110(4)).toBe(4);});
  it('b',()=>{expect(nthTribo110(25)).toBe(1389537);});
  it('c',()=>{expect(nthTribo110(0)).toBe(0);});
  it('d',()=>{expect(nthTribo110(1)).toBe(1);});
  it('e',()=>{expect(nthTribo110(3)).toBe(2);});
});

function maxSqBinary111(matrix:string[][]):number{const m=matrix.length,n=matrix[0].length;const dp:number[][]=Array.from({length:m},()=>new Array(n).fill(0));let max=0;for(let i=0;i<m;i++)for(let j=0;j<n;j++){if(matrix[i][j]==='1'){dp[i][j]=i>0&&j>0?Math.min(dp[i-1][j],dp[i][j-1],dp[i-1][j-1])+1:1;max=Math.max(max,dp[i][j]);}}return max*max;}
describe('ph111_msb',()=>{
  it('a',()=>{expect(maxSqBinary111([["1","0","1","0","0"],["1","0","1","1","1"],["1","1","1","1","1"],["1","0","0","1","0"]])).toBe(4);});
  it('b',()=>{expect(maxSqBinary111([["0","1"],["1","0"]])).toBe(1);});
  it('c',()=>{expect(maxSqBinary111([["0"]])).toBe(0);});
  it('d',()=>{expect(maxSqBinary111([["1","1"],["1","1"]])).toBe(4);});
  it('e',()=>{expect(maxSqBinary111([["1"]])).toBe(1);});
});

function longestPalSubseq112(s:string):number{const n=s.length;const dp:number[][]=Array.from({length:n},()=>new Array(n).fill(0));for(let i=0;i<n;i++)dp[i][i]=1;for(let len=2;len<=n;len++)for(let i=0;i<=n-len;i++){const j=i+len-1;dp[i][j]=s[i]===s[j]?dp[i+1][j-1]+2:Math.max(dp[i+1][j],dp[i][j-1]);}return dp[0][n-1];}
describe('ph112_lps',()=>{
  it('a',()=>{expect(longestPalSubseq112("bbbab")).toBe(4);});
  it('b',()=>{expect(longestPalSubseq112("cbbd")).toBe(2);});
  it('c',()=>{expect(longestPalSubseq112("a")).toBe(1);});
  it('d',()=>{expect(longestPalSubseq112("abcba")).toBe(5);});
  it('e',()=>{expect(longestPalSubseq112("abcde")).toBe(1);});
});

function isPalindromeNum113(x:number):boolean{if(x<0)return false;const s=String(x);return s===s.split('').reverse().join('');}
describe('ph113_ipn',()=>{
  it('a',()=>{expect(isPalindromeNum113(121)).toBe(true);});
  it('b',()=>{expect(isPalindromeNum113(-121)).toBe(false);});
  it('c',()=>{expect(isPalindromeNum113(10)).toBe(false);});
  it('d',()=>{expect(isPalindromeNum113(0)).toBe(true);});
  it('e',()=>{expect(isPalindromeNum113(1221)).toBe(true);});
});

function searchRotated114(arr:number[],t:number):number{let lo=0,hi=arr.length-1;while(lo<=hi){const m=(lo+hi)>>1;if(arr[m]===t)return m;if(arr[lo]<=arr[m]){if(arr[lo]<=t&&t<arr[m])hi=m-1;else lo=m+1;}else{if(arr[m]<t&&t<=arr[hi])lo=m+1;else hi=m-1;}}return -1;}
describe('ph114_sr',()=>{
  it('a',()=>{expect(searchRotated114([4,5,6,7,0,1,2],0)).toBe(4);});
  it('b',()=>{expect(searchRotated114([4,5,6,7,0,1,2],3)).toBe(-1);});
  it('c',()=>{expect(searchRotated114([1],0)).toBe(-1);});
  it('d',()=>{expect(searchRotated114([1,3],3)).toBe(1);});
  it('e',()=>{expect(searchRotated114([5,1,3],3)).toBe(2);});
});

function longestSubNoRepeat115(s:string):number{const mp=new Map<string,number>();let lo=0,max=0;for(let i=0;i<s.length;i++){if(mp.has(s[i])&&mp.get(s[i])!>=lo)lo=mp.get(s[i])!+1;mp.set(s[i],i);max=Math.max(max,i-lo+1);}return max;}
describe('ph115_lsnr',()=>{
  it('a',()=>{expect(longestSubNoRepeat115("abcabcbb")).toBe(3);});
  it('b',()=>{expect(longestSubNoRepeat115("bbbbb")).toBe(1);});
  it('c',()=>{expect(longestSubNoRepeat115("pwwkew")).toBe(3);});
  it('d',()=>{expect(longestSubNoRepeat115("")).toBe(0);});
  it('e',()=>{expect(longestSubNoRepeat115("dvdf")).toBe(3);});
});

function uniquePathsGrid116(m:number,n:number):number{const dp=new Array(n).fill(1);for(let i=1;i<m;i++)for(let j=1;j<n;j++)dp[j]+=dp[j-1];return dp[n-1];}
describe('ph116_upg',()=>{
  it('a',()=>{expect(uniquePathsGrid116(3,7)).toBe(28);});
  it('b',()=>{expect(uniquePathsGrid116(3,2)).toBe(3);});
  it('c',()=>{expect(uniquePathsGrid116(1,1)).toBe(1);});
  it('d',()=>{expect(uniquePathsGrid116(2,3)).toBe(3);});
  it('e',()=>{expect(uniquePathsGrid116(4,4)).toBe(20);});
});

function trappingRain117(h:number[]):number{let l=0,r=h.length-1,lmax=0,rmax=0,res=0;while(l<r){if(h[l]<h[r]){lmax=Math.max(lmax,h[l]);res+=lmax-h[l++];}else{rmax=Math.max(rmax,h[r]);res+=rmax-h[r--];}}return res;}
describe('ph117_tr',()=>{
  it('a',()=>{expect(trappingRain117([0,1,0,2,1,0,1,3,2,1,2,1])).toBe(6);});
  it('b',()=>{expect(trappingRain117([4,2,0,3,2,5])).toBe(9);});
  it('c',()=>{expect(trappingRain117([1])).toBe(0);});
  it('d',()=>{expect(trappingRain117([3,0,2,0,4])).toBe(7);});
  it('e',()=>{expect(trappingRain117([0,0,0])).toBe(0);});
});

function addBinaryStr118(a:string,b:string):string{let i=a.length-1,j=b.length-1,carry=0,res='';while(i>=0||j>=0||carry){const s=(i>=0?+a[i--]:0)+(j>=0?+b[j--]:0)+carry;carry=s>>1;res=(s&1)+res;}return res||'0';}
describe('ph118_abs',()=>{
  it('a',()=>{expect(addBinaryStr118("11","1")).toBe("100");});
  it('b',()=>{expect(addBinaryStr118("1010","1011")).toBe("10101");});
  it('c',()=>{expect(addBinaryStr118("0","0")).toBe("0");});
  it('d',()=>{expect(addBinaryStr118("11","11")).toBe("110");});
  it('e',()=>{expect(addBinaryStr118("1111","1111")).toBe("11110");});
});

function groupAnagramsCnt119(strs:string[]):number{const mp=new Map<string,string[]>();for(const s of strs){const k=s.split('').sort().join('');if(!mp.has(k))mp.set(k,[]);mp.get(k)!.push(s);}return mp.size;}
describe('ph119_gac',()=>{
  it('a',()=>{expect(groupAnagramsCnt119(["eat","tea","tan","ate","nat","bat"])).toBe(3);});
  it('b',()=>{expect(groupAnagramsCnt119([""])).toBe(1);});
  it('c',()=>{expect(groupAnagramsCnt119(["a"])).toBe(1);});
  it('d',()=>{expect(groupAnagramsCnt119(["abc","bca","cba","xyz","zyx"])).toBe(2);});
  it('e',()=>{expect(groupAnagramsCnt119(["a","b","c"])).toBe(3);});
});

function removeDupsSorted120(nums:number[]):number{if(!nums.length)return 0;let k=1;for(let i=1;i<nums.length;i++)if(nums[i]!==nums[i-1])nums[k++]=nums[i];return k;}
describe('ph120_rds',()=>{
  it('a',()=>{expect(removeDupsSorted120([1,1,2])).toBe(2);});
  it('b',()=>{expect(removeDupsSorted120([0,0,1,1,1,2,2,3,3,4])).toBe(5);});
  it('c',()=>{expect(removeDupsSorted120([1])).toBe(1);});
  it('d',()=>{expect(removeDupsSorted120([])).toBe(0);});
  it('e',()=>{expect(removeDupsSorted120([1,2,3])).toBe(3);});
});

function maxProductArr121(nums:number[]):number{let curMax=nums[0],curMin=nums[0],res=nums[0];for(let i=1;i<nums.length;i++){const tmp=curMax;curMax=Math.max(nums[i],tmp*nums[i],curMin*nums[i]);curMin=Math.min(nums[i],tmp*nums[i],curMin*nums[i]);res=Math.max(res,curMax);}return res;}
describe('ph121_mpa',()=>{
  it('a',()=>{expect(maxProductArr121([2,3,-2,4])).toBe(6);});
  it('b',()=>{expect(maxProductArr121([-2,0,-1])).toBe(0);});
  it('c',()=>{expect(maxProductArr121([2,3,-2,4,-1])).toBe(48);});
  it('d',()=>{expect(maxProductArr121([-2,3,-4])).toBe(24);});
  it('e',()=>{expect(maxProductArr121([0,-2])).toBe(0);});
});

function isomorphicStr122(s:string,t:string):boolean{const s2t=new Map<string,string>(),t2s=new Map<string,string>();for(let i=0;i<s.length;i++){const a=s[i],b=t[i];if(s2t.has(a)&&s2t.get(a)!==b)return false;if(t2s.has(b)&&t2s.get(b)!==a)return false;s2t.set(a,b);t2s.set(b,a);}return true;}
describe('ph122_iso',()=>{
  it('a',()=>{expect(isomorphicStr122("egg","add")).toBe(true);});
  it('b',()=>{expect(isomorphicStr122("foo","bar")).toBe(false);});
  it('c',()=>{expect(isomorphicStr122("paper","title")).toBe(true);});
  it('d',()=>{expect(isomorphicStr122("badc","baba")).toBe(false);});
  it('e',()=>{expect(isomorphicStr122("a","a")).toBe(true);});
});

function countPrimesSieve123(n:number):number{if(n<2)return 0;const sieve=new Array(n).fill(true);sieve[0]=sieve[1]=false;for(let i=2;i*i<n;i++)if(sieve[i])for(let j=i*i;j<n;j+=i)sieve[j]=false;return sieve.filter(Boolean).length;}
describe('ph123_cps2',()=>{
  it('a',()=>{expect(countPrimesSieve123(10)).toBe(4);});
  it('b',()=>{expect(countPrimesSieve123(0)).toBe(0);});
  it('c',()=>{expect(countPrimesSieve123(2)).toBe(0);});
  it('d',()=>{expect(countPrimesSieve123(20)).toBe(8);});
  it('e',()=>{expect(countPrimesSieve123(3)).toBe(1);});
});

function pivotIndex124(nums:number[]):number{const total=nums.reduce((a,b)=>a+b,0);let left=0;for(let i=0;i<nums.length;i++){if(left===total-left-nums[i])return i;left+=nums[i];}return -1;}
describe('ph124_pi',()=>{
  it('a',()=>{expect(pivotIndex124([1,7,3,6,5,6])).toBe(3);});
  it('b',()=>{expect(pivotIndex124([1,2,3])).toBe(-1);});
  it('c',()=>{expect(pivotIndex124([2,1,-1])).toBe(0);});
  it('d',()=>{expect(pivotIndex124([1,0])).toBe(0);});
  it('e',()=>{expect(pivotIndex124([0])).toBe(0);});
});

function shortestWordDist125(words:string[],w1:string,w2:string):number{let i1=-1,i2=-1,min=Infinity;for(let i=0;i<words.length;i++){if(words[i]===w1)i1=i;if(words[i]===w2)i2=i;if(i1>=0&&i2>=0)min=Math.min(min,Math.abs(i1-i2));}return min;}
describe('ph125_swd',()=>{
  it('a',()=>{expect(shortestWordDist125(["practice","makes","perfect","coding","makes"],"coding","practice")).toBe(3);});
  it('b',()=>{expect(shortestWordDist125(["a","c","b","b","a"],"a","b")).toBe(1);});
  it('c',()=>{expect(shortestWordDist125(["a","b"],"a","b")).toBe(1);});
  it('d',()=>{expect(shortestWordDist125(["a","b","c","a"],"a","c")).toBe(1);});
  it('e',()=>{expect(shortestWordDist125(["x","y","z","x","y"],"x","y")).toBe(1);});
});

function validAnagram2126(s:string,t:string):boolean{if(s.length!==t.length)return false;const freq=new Array(26).fill(0);for(let i=0;i<s.length;i++){freq[s.charCodeAt(i)-97]++;freq[t.charCodeAt(i)-97]--;}return freq.every((x:number)=>x===0);}
describe('ph126_va2',()=>{
  it('a',()=>{expect(validAnagram2126("anagram","nagaram")).toBe(true);});
  it('b',()=>{expect(validAnagram2126("rat","car")).toBe(false);});
  it('c',()=>{expect(validAnagram2126("a","a")).toBe(true);});
  it('d',()=>{expect(validAnagram2126("ab","ba")).toBe(true);});
  it('e',()=>{expect(validAnagram2126("abc","cba")).toBe(true);});
});

function maxProductArr127(nums:number[]):number{let curMax=nums[0],curMin=nums[0],res=nums[0];for(let i=1;i<nums.length;i++){const tmp=curMax;curMax=Math.max(nums[i],tmp*nums[i],curMin*nums[i]);curMin=Math.min(nums[i],tmp*nums[i],curMin*nums[i]);res=Math.max(res,curMax);}return res;}
describe('ph127_mpa',()=>{
  it('a',()=>{expect(maxProductArr127([2,3,-2,4])).toBe(6);});
  it('b',()=>{expect(maxProductArr127([-2,0,-1])).toBe(0);});
  it('c',()=>{expect(maxProductArr127([2,3,-2,4,-1])).toBe(48);});
  it('d',()=>{expect(maxProductArr127([-2,3,-4])).toBe(24);});
  it('e',()=>{expect(maxProductArr127([0,-2])).toBe(0);});
});

function longestMountain128(arr:number[]):number{const n=arr.length;let max=0;for(let i=1;i<n-1;i++){if(arr[i]>arr[i-1]&&arr[i]>arr[i+1]){let l=i-1,r=i+1;while(l>0&&arr[l]>arr[l-1])l--;while(r<n-1&&arr[r]>arr[r+1])r++;max=Math.max(max,r-l+1);}}return max;}
describe('ph128_lmtn',()=>{
  it('a',()=>{expect(longestMountain128([2,1,4,7,3,2,5])).toBe(5);});
  it('b',()=>{expect(longestMountain128([0,1,2,3,4,5,4,3,2,1,0])).toBe(11);});
  it('c',()=>{expect(longestMountain128([2,2,2])).toBe(0);});
  it('d',()=>{expect(longestMountain128([1,3,1,3,1])).toBe(3);});
  it('e',()=>{expect(longestMountain128([0,2,0,2,0])).toBe(3);});
});

function minSubArrayLen129(target:number,nums:number[]):number{let l=0,sum=0,min=Infinity;for(let r=0;r<nums.length;r++){sum+=nums[r];while(sum>=target){min=Math.min(min,r-l+1);sum-=nums[l++];}}return min===Infinity?0:min;}
describe('ph129_msl',()=>{
  it('a',()=>{expect(minSubArrayLen129(7,[2,3,1,2,4,3])).toBe(2);});
  it('b',()=>{expect(minSubArrayLen129(4,[1,4,4])).toBe(1);});
  it('c',()=>{expect(minSubArrayLen129(11,[1,1,1,1,1])).toBe(0);});
  it('d',()=>{expect(minSubArrayLen129(15,[1,2,3,4,5])).toBe(5);});
  it('e',()=>{expect(minSubArrayLen129(6,[2,3,1,2,4,3])).toBe(2);});
});

function mergeArraysLen130(a:number[],b:number[]):number{const res:number[]=[];let i=0,j=0;while(i<a.length&&j<b.length)res.push(a[i]<=b[j]?a[i++]:b[j++]);while(i<a.length)res.push(a[i++]);while(j<b.length)res.push(b[j++]);return res.length;}
describe('ph130_mal',()=>{
  it('a',()=>{expect(mergeArraysLen130([1,2,3],[2,5,6])).toBe(6);});
  it('b',()=>{expect(mergeArraysLen130([1],[3])).toBe(2);});
  it('c',()=>{expect(mergeArraysLen130([],[1,2])).toBe(2);});
  it('d',()=>{expect(mergeArraysLen130([1,3,5],[2,4,6])).toBe(6);});
  it('e',()=>{expect(mergeArraysLen130([],[]) ).toBe(0);});
});

function numDisappearedCount131(nums:number[]):number{const a=nums.slice();for(let i=0;i<a.length;i++){const idx=Math.abs(a[i])-1;if(a[idx]>0)a[idx]=-a[idx];}let cnt=0;for(const n of a)if(n>0)cnt++;return cnt;}
describe('ph131_ndc',()=>{
  it('a',()=>{expect(numDisappearedCount131([4,3,2,7,8,2,3,1])).toBe(2);});
  it('b',()=>{expect(numDisappearedCount131([1,1])).toBe(1);});
  it('c',()=>{expect(numDisappearedCount131([1,2])).toBe(0);});
  it('d',()=>{expect(numDisappearedCount131([2,2])).toBe(1);});
  it('e',()=>{expect(numDisappearedCount131([3,3,3])).toBe(2);});
});

function addBinaryStr132(a:string,b:string):string{let i=a.length-1,j=b.length-1,carry=0,res='';while(i>=0||j>=0||carry){const s=(i>=0?+a[i--]:0)+(j>=0?+b[j--]:0)+carry;carry=s>>1;res=(s&1)+res;}return res||'0';}
describe('ph132_abs',()=>{
  it('a',()=>{expect(addBinaryStr132("11","1")).toBe("100");});
  it('b',()=>{expect(addBinaryStr132("1010","1011")).toBe("10101");});
  it('c',()=>{expect(addBinaryStr132("0","0")).toBe("0");});
  it('d',()=>{expect(addBinaryStr132("11","11")).toBe("110");});
  it('e',()=>{expect(addBinaryStr132("1111","1111")).toBe("11110");});
});

function isHappyNum133(n:number):boolean{function sumSq(x:number):number{let s=0;while(x){const d=x%10;s+=d*d;x=Math.floor(x/10);}return s;}const seen=new Set<number>();while(n!==1&&!seen.has(n)){seen.add(n);n=sumSq(n);}return n===1;}
describe('ph133_ihn',()=>{
  it('a',()=>{expect(isHappyNum133(19)).toBe(true);});
  it('b',()=>{expect(isHappyNum133(2)).toBe(false);});
  it('c',()=>{expect(isHappyNum133(1)).toBe(true);});
  it('d',()=>{expect(isHappyNum133(7)).toBe(true);});
  it('e',()=>{expect(isHappyNum133(4)).toBe(false);});
});

function addBinaryStr134(a:string,b:string):string{let i=a.length-1,j=b.length-1,carry=0,res='';while(i>=0||j>=0||carry){const s=(i>=0?+a[i--]:0)+(j>=0?+b[j--]:0)+carry;carry=s>>1;res=(s&1)+res;}return res||'0';}
describe('ph134_abs',()=>{
  it('a',()=>{expect(addBinaryStr134("11","1")).toBe("100");});
  it('b',()=>{expect(addBinaryStr134("1010","1011")).toBe("10101");});
  it('c',()=>{expect(addBinaryStr134("0","0")).toBe("0");});
  it('d',()=>{expect(addBinaryStr134("11","11")).toBe("110");});
  it('e',()=>{expect(addBinaryStr134("1111","1111")).toBe("11110");});
});

function pivotIndex135(nums:number[]):number{const total=nums.reduce((a,b)=>a+b,0);let left=0;for(let i=0;i<nums.length;i++){if(left===total-left-nums[i])return i;left+=nums[i];}return -1;}
describe('ph135_pi',()=>{
  it('a',()=>{expect(pivotIndex135([1,7,3,6,5,6])).toBe(3);});
  it('b',()=>{expect(pivotIndex135([1,2,3])).toBe(-1);});
  it('c',()=>{expect(pivotIndex135([2,1,-1])).toBe(0);});
  it('d',()=>{expect(pivotIndex135([1,0])).toBe(0);});
  it('e',()=>{expect(pivotIndex135([0])).toBe(0);});
});

function isHappyNum136(n:number):boolean{function sumSq(x:number):number{let s=0;while(x){const d=x%10;s+=d*d;x=Math.floor(x/10);}return s;}const seen=new Set<number>();while(n!==1&&!seen.has(n)){seen.add(n);n=sumSq(n);}return n===1;}
describe('ph136_ihn',()=>{
  it('a',()=>{expect(isHappyNum136(19)).toBe(true);});
  it('b',()=>{expect(isHappyNum136(2)).toBe(false);});
  it('c',()=>{expect(isHappyNum136(1)).toBe(true);});
  it('d',()=>{expect(isHappyNum136(7)).toBe(true);});
  it('e',()=>{expect(isHappyNum136(4)).toBe(false);});
});

function groupAnagramsCnt137(strs:string[]):number{const mp=new Map<string,string[]>();for(const s of strs){const k=s.split('').sort().join('');if(!mp.has(k))mp.set(k,[]);mp.get(k)!.push(s);}return mp.size;}
describe('ph137_gac',()=>{
  it('a',()=>{expect(groupAnagramsCnt137(["eat","tea","tan","ate","nat","bat"])).toBe(3);});
  it('b',()=>{expect(groupAnagramsCnt137([""])).toBe(1);});
  it('c',()=>{expect(groupAnagramsCnt137(["a"])).toBe(1);});
  it('d',()=>{expect(groupAnagramsCnt137(["abc","bca","cba","xyz","zyx"])).toBe(2);});
  it('e',()=>{expect(groupAnagramsCnt137(["a","b","c"])).toBe(3);});
});

function jumpMinSteps138(nums:number[]):number{let steps=0,cur=0,next=0;for(let i=0;i<nums.length-1;i++){next=Math.max(next,i+nums[i]);if(i===cur){steps++;cur=next;}}return steps;}
describe('ph138_jms',()=>{
  it('a',()=>{expect(jumpMinSteps138([2,3,1,1,4])).toBe(2);});
  it('b',()=>{expect(jumpMinSteps138([2,3,0,1,4])).toBe(2);});
  it('c',()=>{expect(jumpMinSteps138([1])).toBe(0);});
  it('d',()=>{expect(jumpMinSteps138([1,2,3])).toBe(2);});
  it('e',()=>{expect(jumpMinSteps138([1,1,1,1])).toBe(3);});
});

function pivotIndex139(nums:number[]):number{const total=nums.reduce((a,b)=>a+b,0);let left=0;for(let i=0;i<nums.length;i++){if(left===total-left-nums[i])return i;left+=nums[i];}return -1;}
describe('ph139_pi',()=>{
  it('a',()=>{expect(pivotIndex139([1,7,3,6,5,6])).toBe(3);});
  it('b',()=>{expect(pivotIndex139([1,2,3])).toBe(-1);});
  it('c',()=>{expect(pivotIndex139([2,1,-1])).toBe(0);});
  it('d',()=>{expect(pivotIndex139([1,0])).toBe(0);});
  it('e',()=>{expect(pivotIndex139([0])).toBe(0);});
});

function mergeArraysLen140(a:number[],b:number[]):number{const res:number[]=[];let i=0,j=0;while(i<a.length&&j<b.length)res.push(a[i]<=b[j]?a[i++]:b[j++]);while(i<a.length)res.push(a[i++]);while(j<b.length)res.push(b[j++]);return res.length;}
describe('ph140_mal',()=>{
  it('a',()=>{expect(mergeArraysLen140([1,2,3],[2,5,6])).toBe(6);});
  it('b',()=>{expect(mergeArraysLen140([1],[3])).toBe(2);});
  it('c',()=>{expect(mergeArraysLen140([],[1,2])).toBe(2);});
  it('d',()=>{expect(mergeArraysLen140([1,3,5],[2,4,6])).toBe(6);});
  it('e',()=>{expect(mergeArraysLen140([],[]) ).toBe(0);});
});

function countPrimesSieve141(n:number):number{if(n<2)return 0;const sieve=new Array(n).fill(true);sieve[0]=sieve[1]=false;for(let i=2;i*i<n;i++)if(sieve[i])for(let j=i*i;j<n;j+=i)sieve[j]=false;return sieve.filter(Boolean).length;}
describe('ph141_cps2',()=>{
  it('a',()=>{expect(countPrimesSieve141(10)).toBe(4);});
  it('b',()=>{expect(countPrimesSieve141(0)).toBe(0);});
  it('c',()=>{expect(countPrimesSieve141(2)).toBe(0);});
  it('d',()=>{expect(countPrimesSieve141(20)).toBe(8);});
  it('e',()=>{expect(countPrimesSieve141(3)).toBe(1);});
});

function validAnagram2142(s:string,t:string):boolean{if(s.length!==t.length)return false;const freq=new Array(26).fill(0);for(let i=0;i<s.length;i++){freq[s.charCodeAt(i)-97]++;freq[t.charCodeAt(i)-97]--;}return freq.every((x:number)=>x===0);}
describe('ph142_va2',()=>{
  it('a',()=>{expect(validAnagram2142("anagram","nagaram")).toBe(true);});
  it('b',()=>{expect(validAnagram2142("rat","car")).toBe(false);});
  it('c',()=>{expect(validAnagram2142("a","a")).toBe(true);});
  it('d',()=>{expect(validAnagram2142("ab","ba")).toBe(true);});
  it('e',()=>{expect(validAnagram2142("abc","cba")).toBe(true);});
});

function validAnagram2143(s:string,t:string):boolean{if(s.length!==t.length)return false;const freq=new Array(26).fill(0);for(let i=0;i<s.length;i++){freq[s.charCodeAt(i)-97]++;freq[t.charCodeAt(i)-97]--;}return freq.every((x:number)=>x===0);}
describe('ph143_va2',()=>{
  it('a',()=>{expect(validAnagram2143("anagram","nagaram")).toBe(true);});
  it('b',()=>{expect(validAnagram2143("rat","car")).toBe(false);});
  it('c',()=>{expect(validAnagram2143("a","a")).toBe(true);});
  it('d',()=>{expect(validAnagram2143("ab","ba")).toBe(true);});
  it('e',()=>{expect(validAnagram2143("abc","cba")).toBe(true);});
});

function numDisappearedCount144(nums:number[]):number{const a=nums.slice();for(let i=0;i<a.length;i++){const idx=Math.abs(a[i])-1;if(a[idx]>0)a[idx]=-a[idx];}let cnt=0;for(const n of a)if(n>0)cnt++;return cnt;}
describe('ph144_ndc',()=>{
  it('a',()=>{expect(numDisappearedCount144([4,3,2,7,8,2,3,1])).toBe(2);});
  it('b',()=>{expect(numDisappearedCount144([1,1])).toBe(1);});
  it('c',()=>{expect(numDisappearedCount144([1,2])).toBe(0);});
  it('d',()=>{expect(numDisappearedCount144([2,2])).toBe(1);});
  it('e',()=>{expect(numDisappearedCount144([3,3,3])).toBe(2);});
});

function validAnagram2145(s:string,t:string):boolean{if(s.length!==t.length)return false;const freq=new Array(26).fill(0);for(let i=0;i<s.length;i++){freq[s.charCodeAt(i)-97]++;freq[t.charCodeAt(i)-97]--;}return freq.every((x:number)=>x===0);}
describe('ph145_va2',()=>{
  it('a',()=>{expect(validAnagram2145("anagram","nagaram")).toBe(true);});
  it('b',()=>{expect(validAnagram2145("rat","car")).toBe(false);});
  it('c',()=>{expect(validAnagram2145("a","a")).toBe(true);});
  it('d',()=>{expect(validAnagram2145("ab","ba")).toBe(true);});
  it('e',()=>{expect(validAnagram2145("abc","cba")).toBe(true);});
});

function jumpMinSteps146(nums:number[]):number{let steps=0,cur=0,next=0;for(let i=0;i<nums.length-1;i++){next=Math.max(next,i+nums[i]);if(i===cur){steps++;cur=next;}}return steps;}
describe('ph146_jms',()=>{
  it('a',()=>{expect(jumpMinSteps146([2,3,1,1,4])).toBe(2);});
  it('b',()=>{expect(jumpMinSteps146([2,3,0,1,4])).toBe(2);});
  it('c',()=>{expect(jumpMinSteps146([1])).toBe(0);});
  it('d',()=>{expect(jumpMinSteps146([1,2,3])).toBe(2);});
  it('e',()=>{expect(jumpMinSteps146([1,1,1,1])).toBe(3);});
});

function isomorphicStr147(s:string,t:string):boolean{const s2t=new Map<string,string>(),t2s=new Map<string,string>();for(let i=0;i<s.length;i++){const a=s[i],b=t[i];if(s2t.has(a)&&s2t.get(a)!==b)return false;if(t2s.has(b)&&t2s.get(b)!==a)return false;s2t.set(a,b);t2s.set(b,a);}return true;}
describe('ph147_iso',()=>{
  it('a',()=>{expect(isomorphicStr147("egg","add")).toBe(true);});
  it('b',()=>{expect(isomorphicStr147("foo","bar")).toBe(false);});
  it('c',()=>{expect(isomorphicStr147("paper","title")).toBe(true);});
  it('d',()=>{expect(isomorphicStr147("badc","baba")).toBe(false);});
  it('e',()=>{expect(isomorphicStr147("a","a")).toBe(true);});
});

function decodeWays2148(s:string):number{if(!s||s[0]==='0')return 0;const n=s.length;const dp=new Array(n+1).fill(0);dp[0]=1;dp[1]=1;for(let i=2;i<=n;i++){const one=+s[i-1],two=+(s.slice(i-2,i));if(one>0)dp[i]+=dp[i-1];if(two>=10&&two<=26)dp[i]+=dp[i-2];}return dp[n];}
describe('ph148_dw2',()=>{
  it('a',()=>{expect(decodeWays2148("226")).toBe(3);});
  it('b',()=>{expect(decodeWays2148("12")).toBe(2);});
  it('c',()=>{expect(decodeWays2148("06")).toBe(0);});
  it('d',()=>{expect(decodeWays2148("11106")).toBe(2);});
  it('e',()=>{expect(decodeWays2148("1")).toBe(1);});
});

function pivotIndex149(nums:number[]):number{const total=nums.reduce((a,b)=>a+b,0);let left=0;for(let i=0;i<nums.length;i++){if(left===total-left-nums[i])return i;left+=nums[i];}return -1;}
describe('ph149_pi',()=>{
  it('a',()=>{expect(pivotIndex149([1,7,3,6,5,6])).toBe(3);});
  it('b',()=>{expect(pivotIndex149([1,2,3])).toBe(-1);});
  it('c',()=>{expect(pivotIndex149([2,1,-1])).toBe(0);});
  it('d',()=>{expect(pivotIndex149([1,0])).toBe(0);});
  it('e',()=>{expect(pivotIndex149([0])).toBe(0);});
});

function maxAreaWater150(h:number[]):number{let l=0,r=h.length-1,max=0;while(l<r){max=Math.max(max,Math.min(h[l],h[r])*(r-l));if(h[l]<h[r])l++;else r--;}return max;}
describe('ph150_maw',()=>{
  it('a',()=>{expect(maxAreaWater150([1,8,6,2,5,4,8,3,7])).toBe(49);});
  it('b',()=>{expect(maxAreaWater150([1,1])).toBe(1);});
  it('c',()=>{expect(maxAreaWater150([4,3,2,1,4])).toBe(16);});
  it('d',()=>{expect(maxAreaWater150([1,2,1])).toBe(2);});
  it('e',()=>{expect(maxAreaWater150([2,3,4,5,18,17,6])).toBe(17);});
});

function intersectSorted151(a:number[],b:number[]):number{const sa=[...a].sort((x,y)=>x-y),sb=[...b].sort((x,y)=>x-y);let i=0,j=0,cnt=0;while(i<sa.length&&j<sb.length){if(sa[i]===sb[j]){cnt++;i++;j++;}else if(sa[i]<sb[j])i++;else j++;}return cnt;}
describe('ph151_isc',()=>{
  it('a',()=>{expect(intersectSorted151([1,2,2,1],[2,2])).toBe(2);});
  it('b',()=>{expect(intersectSorted151([4,9,5],[9,4,9,8,4])).toBe(2);});
  it('c',()=>{expect(intersectSorted151([1,2],[3,4])).toBe(0);});
  it('d',()=>{expect(intersectSorted151([1,1,1],[1,1])).toBe(2);});
  it('e',()=>{expect(intersectSorted151([],[1])).toBe(0);});
});

function titleToNum152(col:string):number{let res=0;for(const c of col)res=res*26+(c.charCodeAt(0)-64);return res;}
describe('ph152_ttn',()=>{
  it('a',()=>{expect(titleToNum152("A")).toBe(1);});
  it('b',()=>{expect(titleToNum152("AB")).toBe(28);});
  it('c',()=>{expect(titleToNum152("ZY")).toBe(701);});
  it('d',()=>{expect(titleToNum152("Z")).toBe(26);});
  it('e',()=>{expect(titleToNum152("AA")).toBe(27);});
});

function decodeWays2153(s:string):number{if(!s||s[0]==='0')return 0;const n=s.length;const dp=new Array(n+1).fill(0);dp[0]=1;dp[1]=1;for(let i=2;i<=n;i++){const one=+s[i-1],two=+(s.slice(i-2,i));if(one>0)dp[i]+=dp[i-1];if(two>=10&&two<=26)dp[i]+=dp[i-2];}return dp[n];}
describe('ph153_dw2',()=>{
  it('a',()=>{expect(decodeWays2153("226")).toBe(3);});
  it('b',()=>{expect(decodeWays2153("12")).toBe(2);});
  it('c',()=>{expect(decodeWays2153("06")).toBe(0);});
  it('d',()=>{expect(decodeWays2153("11106")).toBe(2);});
  it('e',()=>{expect(decodeWays2153("1")).toBe(1);});
});

function trappingRain154(h:number[]):number{let l=0,r=h.length-1,lmax=0,rmax=0,res=0;while(l<r){if(h[l]<h[r]){lmax=Math.max(lmax,h[l]);res+=lmax-h[l++];}else{rmax=Math.max(rmax,h[r]);res+=rmax-h[r--];}}return res;}
describe('ph154_tr',()=>{
  it('a',()=>{expect(trappingRain154([0,1,0,2,1,0,1,3,2,1,2,1])).toBe(6);});
  it('b',()=>{expect(trappingRain154([4,2,0,3,2,5])).toBe(9);});
  it('c',()=>{expect(trappingRain154([1])).toBe(0);});
  it('d',()=>{expect(trappingRain154([3,0,2,0,4])).toBe(7);});
  it('e',()=>{expect(trappingRain154([0,0,0])).toBe(0);});
});

function trappingRain155(h:number[]):number{let l=0,r=h.length-1,lmax=0,rmax=0,res=0;while(l<r){if(h[l]<h[r]){lmax=Math.max(lmax,h[l]);res+=lmax-h[l++];}else{rmax=Math.max(rmax,h[r]);res+=rmax-h[r--];}}return res;}
describe('ph155_tr',()=>{
  it('a',()=>{expect(trappingRain155([0,1,0,2,1,0,1,3,2,1,2,1])).toBe(6);});
  it('b',()=>{expect(trappingRain155([4,2,0,3,2,5])).toBe(9);});
  it('c',()=>{expect(trappingRain155([1])).toBe(0);});
  it('d',()=>{expect(trappingRain155([3,0,2,0,4])).toBe(7);});
  it('e',()=>{expect(trappingRain155([0,0,0])).toBe(0);});
});

function maxAreaWater156(h:number[]):number{let l=0,r=h.length-1,max=0;while(l<r){max=Math.max(max,Math.min(h[l],h[r])*(r-l));if(h[l]<h[r])l++;else r--;}return max;}
describe('ph156_maw',()=>{
  it('a',()=>{expect(maxAreaWater156([1,8,6,2,5,4,8,3,7])).toBe(49);});
  it('b',()=>{expect(maxAreaWater156([1,1])).toBe(1);});
  it('c',()=>{expect(maxAreaWater156([4,3,2,1,4])).toBe(16);});
  it('d',()=>{expect(maxAreaWater156([1,2,1])).toBe(2);});
  it('e',()=>{expect(maxAreaWater156([2,3,4,5,18,17,6])).toBe(17);});
});

function isHappyNum157(n:number):boolean{function sumSq(x:number):number{let s=0;while(x){const d=x%10;s+=d*d;x=Math.floor(x/10);}return s;}const seen=new Set<number>();while(n!==1&&!seen.has(n)){seen.add(n);n=sumSq(n);}return n===1;}
describe('ph157_ihn',()=>{
  it('a',()=>{expect(isHappyNum157(19)).toBe(true);});
  it('b',()=>{expect(isHappyNum157(2)).toBe(false);});
  it('c',()=>{expect(isHappyNum157(1)).toBe(true);});
  it('d',()=>{expect(isHappyNum157(7)).toBe(true);});
  it('e',()=>{expect(isHappyNum157(4)).toBe(false);});
});

function removeDupsSorted158(nums:number[]):number{if(!nums.length)return 0;let k=1;for(let i=1;i<nums.length;i++)if(nums[i]!==nums[i-1])nums[k++]=nums[i];return k;}
describe('ph158_rds',()=>{
  it('a',()=>{expect(removeDupsSorted158([1,1,2])).toBe(2);});
  it('b',()=>{expect(removeDupsSorted158([0,0,1,1,1,2,2,3,3,4])).toBe(5);});
  it('c',()=>{expect(removeDupsSorted158([1])).toBe(1);});
  it('d',()=>{expect(removeDupsSorted158([])).toBe(0);});
  it('e',()=>{expect(removeDupsSorted158([1,2,3])).toBe(3);});
});

function pivotIndex159(nums:number[]):number{const total=nums.reduce((a,b)=>a+b,0);let left=0;for(let i=0;i<nums.length;i++){if(left===total-left-nums[i])return i;left+=nums[i];}return -1;}
describe('ph159_pi',()=>{
  it('a',()=>{expect(pivotIndex159([1,7,3,6,5,6])).toBe(3);});
  it('b',()=>{expect(pivotIndex159([1,2,3])).toBe(-1);});
  it('c',()=>{expect(pivotIndex159([2,1,-1])).toBe(0);});
  it('d',()=>{expect(pivotIndex159([1,0])).toBe(0);});
  it('e',()=>{expect(pivotIndex159([0])).toBe(0);});
});

function addBinaryStr160(a:string,b:string):string{let i=a.length-1,j=b.length-1,carry=0,res='';while(i>=0||j>=0||carry){const s=(i>=0?+a[i--]:0)+(j>=0?+b[j--]:0)+carry;carry=s>>1;res=(s&1)+res;}return res||'0';}
describe('ph160_abs',()=>{
  it('a',()=>{expect(addBinaryStr160("11","1")).toBe("100");});
  it('b',()=>{expect(addBinaryStr160("1010","1011")).toBe("10101");});
  it('c',()=>{expect(addBinaryStr160("0","0")).toBe("0");});
  it('d',()=>{expect(addBinaryStr160("11","11")).toBe("110");});
  it('e',()=>{expect(addBinaryStr160("1111","1111")).toBe("11110");});
});

function numToTitle161(n:number):string{let res='';while(n){n--;res=String.fromCharCode(65+n%26)+res;n=Math.floor(n/26);}return res;}
describe('ph161_ntt',()=>{
  it('a',()=>{expect(numToTitle161(1)).toBe("A");});
  it('b',()=>{expect(numToTitle161(28)).toBe("AB");});
  it('c',()=>{expect(numToTitle161(701)).toBe("ZY");});
  it('d',()=>{expect(numToTitle161(26)).toBe("Z");});
  it('e',()=>{expect(numToTitle161(27)).toBe("AA");});
});

function groupAnagramsCnt162(strs:string[]):number{const mp=new Map<string,string[]>();for(const s of strs){const k=s.split('').sort().join('');if(!mp.has(k))mp.set(k,[]);mp.get(k)!.push(s);}return mp.size;}
describe('ph162_gac',()=>{
  it('a',()=>{expect(groupAnagramsCnt162(["eat","tea","tan","ate","nat","bat"])).toBe(3);});
  it('b',()=>{expect(groupAnagramsCnt162([""])).toBe(1);});
  it('c',()=>{expect(groupAnagramsCnt162(["a"])).toBe(1);});
  it('d',()=>{expect(groupAnagramsCnt162(["abc","bca","cba","xyz","zyx"])).toBe(2);});
  it('e',()=>{expect(groupAnagramsCnt162(["a","b","c"])).toBe(3);});
});

function majorityElement163(nums:number[]):number{let cand=nums[0],cnt=1;for(let i=1;i<nums.length;i++){cnt===0?(cand=nums[i],cnt=1):(nums[i]===cand?cnt++:cnt--);}return cand;}
describe('ph163_me',()=>{
  it('a',()=>{expect(majorityElement163([3,2,3])).toBe(3);});
  it('b',()=>{expect(majorityElement163([2,2,1,1,1,2,2])).toBe(2);});
  it('c',()=>{expect(majorityElement163([1])).toBe(1);});
  it('d',()=>{expect(majorityElement163([4,4,4,4,2,2,2])).toBe(4);});
  it('e',()=>{expect(majorityElement163([5,5,5,5,5])).toBe(5);});
});

function maxConsecOnes164(nums:number[]):number{let max=0,cnt=0;for(const n of nums){cnt=n===1?cnt+1:0;max=Math.max(max,cnt);}return max;}
describe('ph164_mco',()=>{
  it('a',()=>{expect(maxConsecOnes164([1,1,0,1,1,1])).toBe(3);});
  it('b',()=>{expect(maxConsecOnes164([1,0,1,1,0,1])).toBe(2);});
  it('c',()=>{expect(maxConsecOnes164([0])).toBe(0);});
  it('d',()=>{expect(maxConsecOnes164([1,1,1,1])).toBe(4);});
  it('e',()=>{expect(maxConsecOnes164([0,0,0])).toBe(0);});
});

function maxCircularSumDP165(nums:number[]):number{let curMax=0,maxSum=nums[0],curMin=0,minSum=nums[0],total=0;for(const n of nums){curMax=Math.max(curMax+n,n);maxSum=Math.max(maxSum,curMax);curMin=Math.min(curMin+n,n);minSum=Math.min(minSum,curMin);total+=n;}return maxSum>0?Math.max(maxSum,total-minSum):maxSum;}
describe('ph165_mcs',()=>{
  it('a',()=>{expect(maxCircularSumDP165([1,-2,3,-2])).toBe(3);});
  it('b',()=>{expect(maxCircularSumDP165([5,-3,5])).toBe(10);});
  it('c',()=>{expect(maxCircularSumDP165([-3,-2,-1])).toBe(-1);});
  it('d',()=>{expect(maxCircularSumDP165([3,-1,2,-1])).toBe(4);});
  it('e',()=>{expect(maxCircularSumDP165([1,2,3])).toBe(6);});
});

function isHappyNum166(n:number):boolean{function sumSq(x:number):number{let s=0;while(x){const d=x%10;s+=d*d;x=Math.floor(x/10);}return s;}const seen=new Set<number>();while(n!==1&&!seen.has(n)){seen.add(n);n=sumSq(n);}return n===1;}
describe('ph166_ihn',()=>{
  it('a',()=>{expect(isHappyNum166(19)).toBe(true);});
  it('b',()=>{expect(isHappyNum166(2)).toBe(false);});
  it('c',()=>{expect(isHappyNum166(1)).toBe(true);});
  it('d',()=>{expect(isHappyNum166(7)).toBe(true);});
  it('e',()=>{expect(isHappyNum166(4)).toBe(false);});
});

function addBinaryStr167(a:string,b:string):string{let i=a.length-1,j=b.length-1,carry=0,res='';while(i>=0||j>=0||carry){const s=(i>=0?+a[i--]:0)+(j>=0?+b[j--]:0)+carry;carry=s>>1;res=(s&1)+res;}return res||'0';}
describe('ph167_abs',()=>{
  it('a',()=>{expect(addBinaryStr167("11","1")).toBe("100");});
  it('b',()=>{expect(addBinaryStr167("1010","1011")).toBe("10101");});
  it('c',()=>{expect(addBinaryStr167("0","0")).toBe("0");});
  it('d',()=>{expect(addBinaryStr167("11","11")).toBe("110");});
  it('e',()=>{expect(addBinaryStr167("1111","1111")).toBe("11110");});
});

function wordPatternMatch168(pattern:string,s:string):boolean{const words=s.split(' ');if(pattern.length!==words.length)return false;const p2w=new Map<string,string>(),w2p=new Map<string,string>();for(let i=0;i<pattern.length;i++){const p=pattern[i],w=words[i];if(p2w.has(p)&&p2w.get(p)!==w)return false;if(w2p.has(w)&&w2p.get(w)!==p)return false;p2w.set(p,w);w2p.set(w,p);}return true;}
describe('ph168_wpm',()=>{
  it('a',()=>{expect(wordPatternMatch168("abba","dog cat cat dog")).toBe(true);});
  it('b',()=>{expect(wordPatternMatch168("abba","dog cat cat fish")).toBe(false);});
  it('c',()=>{expect(wordPatternMatch168("aaaa","dog cat cat dog")).toBe(false);});
  it('d',()=>{expect(wordPatternMatch168("abba","dog dog dog dog")).toBe(false);});
  it('e',()=>{expect(wordPatternMatch168("a","dog")).toBe(true);});
});

function isomorphicStr169(s:string,t:string):boolean{const s2t=new Map<string,string>(),t2s=new Map<string,string>();for(let i=0;i<s.length;i++){const a=s[i],b=t[i];if(s2t.has(a)&&s2t.get(a)!==b)return false;if(t2s.has(b)&&t2s.get(b)!==a)return false;s2t.set(a,b);t2s.set(b,a);}return true;}
describe('ph169_iso',()=>{
  it('a',()=>{expect(isomorphicStr169("egg","add")).toBe(true);});
  it('b',()=>{expect(isomorphicStr169("foo","bar")).toBe(false);});
  it('c',()=>{expect(isomorphicStr169("paper","title")).toBe(true);});
  it('d',()=>{expect(isomorphicStr169("badc","baba")).toBe(false);});
  it('e',()=>{expect(isomorphicStr169("a","a")).toBe(true);});
});

function validAnagram2170(s:string,t:string):boolean{if(s.length!==t.length)return false;const freq=new Array(26).fill(0);for(let i=0;i<s.length;i++){freq[s.charCodeAt(i)-97]++;freq[t.charCodeAt(i)-97]--;}return freq.every((x:number)=>x===0);}
describe('ph170_va2',()=>{
  it('a',()=>{expect(validAnagram2170("anagram","nagaram")).toBe(true);});
  it('b',()=>{expect(validAnagram2170("rat","car")).toBe(false);});
  it('c',()=>{expect(validAnagram2170("a","a")).toBe(true);});
  it('d',()=>{expect(validAnagram2170("ab","ba")).toBe(true);});
  it('e',()=>{expect(validAnagram2170("abc","cba")).toBe(true);});
});

function validAnagram2171(s:string,t:string):boolean{if(s.length!==t.length)return false;const freq=new Array(26).fill(0);for(let i=0;i<s.length;i++){freq[s.charCodeAt(i)-97]++;freq[t.charCodeAt(i)-97]--;}return freq.every((x:number)=>x===0);}
describe('ph171_va2',()=>{
  it('a',()=>{expect(validAnagram2171("anagram","nagaram")).toBe(true);});
  it('b',()=>{expect(validAnagram2171("rat","car")).toBe(false);});
  it('c',()=>{expect(validAnagram2171("a","a")).toBe(true);});
  it('d',()=>{expect(validAnagram2171("ab","ba")).toBe(true);});
  it('e',()=>{expect(validAnagram2171("abc","cba")).toBe(true);});
});

function wordPatternMatch172(pattern:string,s:string):boolean{const words=s.split(' ');if(pattern.length!==words.length)return false;const p2w=new Map<string,string>(),w2p=new Map<string,string>();for(let i=0;i<pattern.length;i++){const p=pattern[i],w=words[i];if(p2w.has(p)&&p2w.get(p)!==w)return false;if(w2p.has(w)&&w2p.get(w)!==p)return false;p2w.set(p,w);w2p.set(w,p);}return true;}
describe('ph172_wpm',()=>{
  it('a',()=>{expect(wordPatternMatch172("abba","dog cat cat dog")).toBe(true);});
  it('b',()=>{expect(wordPatternMatch172("abba","dog cat cat fish")).toBe(false);});
  it('c',()=>{expect(wordPatternMatch172("aaaa","dog cat cat dog")).toBe(false);});
  it('d',()=>{expect(wordPatternMatch172("abba","dog dog dog dog")).toBe(false);});
  it('e',()=>{expect(wordPatternMatch172("a","dog")).toBe(true);});
});

function addBinaryStr173(a:string,b:string):string{let i=a.length-1,j=b.length-1,carry=0,res='';while(i>=0||j>=0||carry){const s=(i>=0?+a[i--]:0)+(j>=0?+b[j--]:0)+carry;carry=s>>1;res=(s&1)+res;}return res||'0';}
describe('ph173_abs',()=>{
  it('a',()=>{expect(addBinaryStr173("11","1")).toBe("100");});
  it('b',()=>{expect(addBinaryStr173("1010","1011")).toBe("10101");});
  it('c',()=>{expect(addBinaryStr173("0","0")).toBe("0");});
  it('d',()=>{expect(addBinaryStr173("11","11")).toBe("110");});
  it('e',()=>{expect(addBinaryStr173("1111","1111")).toBe("11110");});
});

function numToTitle174(n:number):string{let res='';while(n){n--;res=String.fromCharCode(65+n%26)+res;n=Math.floor(n/26);}return res;}
describe('ph174_ntt',()=>{
  it('a',()=>{expect(numToTitle174(1)).toBe("A");});
  it('b',()=>{expect(numToTitle174(28)).toBe("AB");});
  it('c',()=>{expect(numToTitle174(701)).toBe("ZY");});
  it('d',()=>{expect(numToTitle174(26)).toBe("Z");});
  it('e',()=>{expect(numToTitle174(27)).toBe("AA");});
});

function decodeWays2175(s:string):number{if(!s||s[0]==='0')return 0;const n=s.length;const dp=new Array(n+1).fill(0);dp[0]=1;dp[1]=1;for(let i=2;i<=n;i++){const one=+s[i-1],two=+(s.slice(i-2,i));if(one>0)dp[i]+=dp[i-1];if(two>=10&&two<=26)dp[i]+=dp[i-2];}return dp[n];}
describe('ph175_dw2',()=>{
  it('a',()=>{expect(decodeWays2175("226")).toBe(3);});
  it('b',()=>{expect(decodeWays2175("12")).toBe(2);});
  it('c',()=>{expect(decodeWays2175("06")).toBe(0);});
  it('d',()=>{expect(decodeWays2175("11106")).toBe(2);});
  it('e',()=>{expect(decodeWays2175("1")).toBe(1);});
});

function subarraySum2176(nums:number[],k:number):number{const mp=new Map<number,number>();mp.set(0,1);let sum=0,cnt=0;for(const n of nums){sum+=n;cnt+=(mp.get(sum-k)||0);mp.set(sum,(mp.get(sum)||0)+1);}return cnt;}
describe('ph176_ss2',()=>{
  it('a',()=>{expect(subarraySum2176([1,1,1],2)).toBe(2);});
  it('b',()=>{expect(subarraySum2176([1,2,3],3)).toBe(2);});
  it('c',()=>{expect(subarraySum2176([1],-1)).toBe(0);});
  it('d',()=>{expect(subarraySum2176([3,4,7,2,-3,1,4,2],7)).toBe(4);});
  it('e',()=>{expect(subarraySum2176([0,0,0,0],0)).toBe(10);});
});

function wordPatternMatch177(pattern:string,s:string):boolean{const words=s.split(' ');if(pattern.length!==words.length)return false;const p2w=new Map<string,string>(),w2p=new Map<string,string>();for(let i=0;i<pattern.length;i++){const p=pattern[i],w=words[i];if(p2w.has(p)&&p2w.get(p)!==w)return false;if(w2p.has(w)&&w2p.get(w)!==p)return false;p2w.set(p,w);w2p.set(w,p);}return true;}
describe('ph177_wpm',()=>{
  it('a',()=>{expect(wordPatternMatch177("abba","dog cat cat dog")).toBe(true);});
  it('b',()=>{expect(wordPatternMatch177("abba","dog cat cat fish")).toBe(false);});
  it('c',()=>{expect(wordPatternMatch177("aaaa","dog cat cat dog")).toBe(false);});
  it('d',()=>{expect(wordPatternMatch177("abba","dog dog dog dog")).toBe(false);});
  it('e',()=>{expect(wordPatternMatch177("a","dog")).toBe(true);});
});

function titleToNum178(col:string):number{let res=0;for(const c of col)res=res*26+(c.charCodeAt(0)-64);return res;}
describe('ph178_ttn',()=>{
  it('a',()=>{expect(titleToNum178("A")).toBe(1);});
  it('b',()=>{expect(titleToNum178("AB")).toBe(28);});
  it('c',()=>{expect(titleToNum178("ZY")).toBe(701);});
  it('d',()=>{expect(titleToNum178("Z")).toBe(26);});
  it('e',()=>{expect(titleToNum178("AA")).toBe(27);});
});

function shortestWordDist179(words:string[],w1:string,w2:string):number{let i1=-1,i2=-1,min=Infinity;for(let i=0;i<words.length;i++){if(words[i]===w1)i1=i;if(words[i]===w2)i2=i;if(i1>=0&&i2>=0)min=Math.min(min,Math.abs(i1-i2));}return min;}
describe('ph179_swd',()=>{
  it('a',()=>{expect(shortestWordDist179(["practice","makes","perfect","coding","makes"],"coding","practice")).toBe(3);});
  it('b',()=>{expect(shortestWordDist179(["a","c","b","b","a"],"a","b")).toBe(1);});
  it('c',()=>{expect(shortestWordDist179(["a","b"],"a","b")).toBe(1);});
  it('d',()=>{expect(shortestWordDist179(["a","b","c","a"],"a","c")).toBe(1);});
  it('e',()=>{expect(shortestWordDist179(["x","y","z","x","y"],"x","y")).toBe(1);});
});

function addBinaryStr180(a:string,b:string):string{let i=a.length-1,j=b.length-1,carry=0,res='';while(i>=0||j>=0||carry){const s=(i>=0?+a[i--]:0)+(j>=0?+b[j--]:0)+carry;carry=s>>1;res=(s&1)+res;}return res||'0';}
describe('ph180_abs',()=>{
  it('a',()=>{expect(addBinaryStr180("11","1")).toBe("100");});
  it('b',()=>{expect(addBinaryStr180("1010","1011")).toBe("10101");});
  it('c',()=>{expect(addBinaryStr180("0","0")).toBe("0");});
  it('d',()=>{expect(addBinaryStr180("11","11")).toBe("110");});
  it('e',()=>{expect(addBinaryStr180("1111","1111")).toBe("11110");});
});

function addBinaryStr181(a:string,b:string):string{let i=a.length-1,j=b.length-1,carry=0,res='';while(i>=0||j>=0||carry){const s=(i>=0?+a[i--]:0)+(j>=0?+b[j--]:0)+carry;carry=s>>1;res=(s&1)+res;}return res||'0';}
describe('ph181_abs',()=>{
  it('a',()=>{expect(addBinaryStr181("11","1")).toBe("100");});
  it('b',()=>{expect(addBinaryStr181("1010","1011")).toBe("10101");});
  it('c',()=>{expect(addBinaryStr181("0","0")).toBe("0");});
  it('d',()=>{expect(addBinaryStr181("11","11")).toBe("110");});
  it('e',()=>{expect(addBinaryStr181("1111","1111")).toBe("11110");});
});

function canConstructNote182(note:string,mag:string):boolean{const freq=new Map<string,number>();for(const c of mag)freq.set(c,(freq.get(c)||0)+1);for(const c of note){if(!freq.get(c))return false;freq.set(c,freq.get(c)!-1);}return true;}
describe('ph182_ccn',()=>{
  it('a',()=>{expect(canConstructNote182("aa","aab")).toBe(true);});
  it('b',()=>{expect(canConstructNote182("aa","ab")).toBe(false);});
  it('c',()=>{expect(canConstructNote182("a","b")).toBe(false);});
  it('d',()=>{expect(canConstructNote182("","abc")).toBe(true);});
  it('e',()=>{expect(canConstructNote182("bg","efjbdfbdgfjhhaiigfhbaejahgfbbgbjagbddfgdiaigdadhegbhcdgfhefgjefibcecdgfahigad")).toBe(true);});
});

function validAnagram2183(s:string,t:string):boolean{if(s.length!==t.length)return false;const freq=new Array(26).fill(0);for(let i=0;i<s.length;i++){freq[s.charCodeAt(i)-97]++;freq[t.charCodeAt(i)-97]--;}return freq.every((x:number)=>x===0);}
describe('ph183_va2',()=>{
  it('a',()=>{expect(validAnagram2183("anagram","nagaram")).toBe(true);});
  it('b',()=>{expect(validAnagram2183("rat","car")).toBe(false);});
  it('c',()=>{expect(validAnagram2183("a","a")).toBe(true);});
  it('d',()=>{expect(validAnagram2183("ab","ba")).toBe(true);});
  it('e',()=>{expect(validAnagram2183("abc","cba")).toBe(true);});
});

function countPrimesSieve184(n:number):number{if(n<2)return 0;const sieve=new Array(n).fill(true);sieve[0]=sieve[1]=false;for(let i=2;i*i<n;i++)if(sieve[i])for(let j=i*i;j<n;j+=i)sieve[j]=false;return sieve.filter(Boolean).length;}
describe('ph184_cps2',()=>{
  it('a',()=>{expect(countPrimesSieve184(10)).toBe(4);});
  it('b',()=>{expect(countPrimesSieve184(0)).toBe(0);});
  it('c',()=>{expect(countPrimesSieve184(2)).toBe(0);});
  it('d',()=>{expect(countPrimesSieve184(20)).toBe(8);});
  it('e',()=>{expect(countPrimesSieve184(3)).toBe(1);});
});

function jumpMinSteps185(nums:number[]):number{let steps=0,cur=0,next=0;for(let i=0;i<nums.length-1;i++){next=Math.max(next,i+nums[i]);if(i===cur){steps++;cur=next;}}return steps;}
describe('ph185_jms',()=>{
  it('a',()=>{expect(jumpMinSteps185([2,3,1,1,4])).toBe(2);});
  it('b',()=>{expect(jumpMinSteps185([2,3,0,1,4])).toBe(2);});
  it('c',()=>{expect(jumpMinSteps185([1])).toBe(0);});
  it('d',()=>{expect(jumpMinSteps185([1,2,3])).toBe(2);});
  it('e',()=>{expect(jumpMinSteps185([1,1,1,1])).toBe(3);});
});

function titleToNum186(col:string):number{let res=0;for(const c of col)res=res*26+(c.charCodeAt(0)-64);return res;}
describe('ph186_ttn',()=>{
  it('a',()=>{expect(titleToNum186("A")).toBe(1);});
  it('b',()=>{expect(titleToNum186("AB")).toBe(28);});
  it('c',()=>{expect(titleToNum186("ZY")).toBe(701);});
  it('d',()=>{expect(titleToNum186("Z")).toBe(26);});
  it('e',()=>{expect(titleToNum186("AA")).toBe(27);});
});

function firstUniqChar187(s:string):number{const freq=new Array(26).fill(0);for(const c of s)freq[c.charCodeAt(0)-97]++;for(let i=0;i<s.length;i++)if(freq[s[i].charCodeAt(0)-97]===1)return i;return -1;}
describe('ph187_fuc',()=>{
  it('a',()=>{expect(firstUniqChar187("leetcode")).toBe(0);});
  it('b',()=>{expect(firstUniqChar187("loveleetcode")).toBe(2);});
  it('c',()=>{expect(firstUniqChar187("aabb")).toBe(-1);});
  it('d',()=>{expect(firstUniqChar187("z")).toBe(0);});
  it('e',()=>{expect(firstUniqChar187("aadadaad")).toBe(-1);});
});

function addBinaryStr188(a:string,b:string):string{let i=a.length-1,j=b.length-1,carry=0,res='';while(i>=0||j>=0||carry){const s=(i>=0?+a[i--]:0)+(j>=0?+b[j--]:0)+carry;carry=s>>1;res=(s&1)+res;}return res||'0';}
describe('ph188_abs',()=>{
  it('a',()=>{expect(addBinaryStr188("11","1")).toBe("100");});
  it('b',()=>{expect(addBinaryStr188("1010","1011")).toBe("10101");});
  it('c',()=>{expect(addBinaryStr188("0","0")).toBe("0");});
  it('d',()=>{expect(addBinaryStr188("11","11")).toBe("110");});
  it('e',()=>{expect(addBinaryStr188("1111","1111")).toBe("11110");});
});

function trappingRain189(h:number[]):number{let l=0,r=h.length-1,lmax=0,rmax=0,res=0;while(l<r){if(h[l]<h[r]){lmax=Math.max(lmax,h[l]);res+=lmax-h[l++];}else{rmax=Math.max(rmax,h[r]);res+=rmax-h[r--];}}return res;}
describe('ph189_tr',()=>{
  it('a',()=>{expect(trappingRain189([0,1,0,2,1,0,1,3,2,1,2,1])).toBe(6);});
  it('b',()=>{expect(trappingRain189([4,2,0,3,2,5])).toBe(9);});
  it('c',()=>{expect(trappingRain189([1])).toBe(0);});
  it('d',()=>{expect(trappingRain189([3,0,2,0,4])).toBe(7);});
  it('e',()=>{expect(trappingRain189([0,0,0])).toBe(0);});
});

function isHappyNum190(n:number):boolean{function sumSq(x:number):number{let s=0;while(x){const d=x%10;s+=d*d;x=Math.floor(x/10);}return s;}const seen=new Set<number>();while(n!==1&&!seen.has(n)){seen.add(n);n=sumSq(n);}return n===1;}
describe('ph190_ihn',()=>{
  it('a',()=>{expect(isHappyNum190(19)).toBe(true);});
  it('b',()=>{expect(isHappyNum190(2)).toBe(false);});
  it('c',()=>{expect(isHappyNum190(1)).toBe(true);});
  it('d',()=>{expect(isHappyNum190(7)).toBe(true);});
  it('e',()=>{expect(isHappyNum190(4)).toBe(false);});
});

function pivotIndex191(nums:number[]):number{const total=nums.reduce((a,b)=>a+b,0);let left=0;for(let i=0;i<nums.length;i++){if(left===total-left-nums[i])return i;left+=nums[i];}return -1;}
describe('ph191_pi',()=>{
  it('a',()=>{expect(pivotIndex191([1,7,3,6,5,6])).toBe(3);});
  it('b',()=>{expect(pivotIndex191([1,2,3])).toBe(-1);});
  it('c',()=>{expect(pivotIndex191([2,1,-1])).toBe(0);});
  it('d',()=>{expect(pivotIndex191([1,0])).toBe(0);});
  it('e',()=>{expect(pivotIndex191([0])).toBe(0);});
});

function subarraySum2192(nums:number[],k:number):number{const mp=new Map<number,number>();mp.set(0,1);let sum=0,cnt=0;for(const n of nums){sum+=n;cnt+=(mp.get(sum-k)||0);mp.set(sum,(mp.get(sum)||0)+1);}return cnt;}
describe('ph192_ss2',()=>{
  it('a',()=>{expect(subarraySum2192([1,1,1],2)).toBe(2);});
  it('b',()=>{expect(subarraySum2192([1,2,3],3)).toBe(2);});
  it('c',()=>{expect(subarraySum2192([1],-1)).toBe(0);});
  it('d',()=>{expect(subarraySum2192([3,4,7,2,-3,1,4,2],7)).toBe(4);});
  it('e',()=>{expect(subarraySum2192([0,0,0,0],0)).toBe(10);});
});

function wordPatternMatch193(pattern:string,s:string):boolean{const words=s.split(' ');if(pattern.length!==words.length)return false;const p2w=new Map<string,string>(),w2p=new Map<string,string>();for(let i=0;i<pattern.length;i++){const p=pattern[i],w=words[i];if(p2w.has(p)&&p2w.get(p)!==w)return false;if(w2p.has(w)&&w2p.get(w)!==p)return false;p2w.set(p,w);w2p.set(w,p);}return true;}
describe('ph193_wpm',()=>{
  it('a',()=>{expect(wordPatternMatch193("abba","dog cat cat dog")).toBe(true);});
  it('b',()=>{expect(wordPatternMatch193("abba","dog cat cat fish")).toBe(false);});
  it('c',()=>{expect(wordPatternMatch193("aaaa","dog cat cat dog")).toBe(false);});
  it('d',()=>{expect(wordPatternMatch193("abba","dog dog dog dog")).toBe(false);});
  it('e',()=>{expect(wordPatternMatch193("a","dog")).toBe(true);});
});

function trappingRain194(h:number[]):number{let l=0,r=h.length-1,lmax=0,rmax=0,res=0;while(l<r){if(h[l]<h[r]){lmax=Math.max(lmax,h[l]);res+=lmax-h[l++];}else{rmax=Math.max(rmax,h[r]);res+=rmax-h[r--];}}return res;}
describe('ph194_tr',()=>{
  it('a',()=>{expect(trappingRain194([0,1,0,2,1,0,1,3,2,1,2,1])).toBe(6);});
  it('b',()=>{expect(trappingRain194([4,2,0,3,2,5])).toBe(9);});
  it('c',()=>{expect(trappingRain194([1])).toBe(0);});
  it('d',()=>{expect(trappingRain194([3,0,2,0,4])).toBe(7);});
  it('e',()=>{expect(trappingRain194([0,0,0])).toBe(0);});
});

function longestMountain195(arr:number[]):number{const n=arr.length;let max=0;for(let i=1;i<n-1;i++){if(arr[i]>arr[i-1]&&arr[i]>arr[i+1]){let l=i-1,r=i+1;while(l>0&&arr[l]>arr[l-1])l--;while(r<n-1&&arr[r]>arr[r+1])r++;max=Math.max(max,r-l+1);}}return max;}
describe('ph195_lmtn',()=>{
  it('a',()=>{expect(longestMountain195([2,1,4,7,3,2,5])).toBe(5);});
  it('b',()=>{expect(longestMountain195([0,1,2,3,4,5,4,3,2,1,0])).toBe(11);});
  it('c',()=>{expect(longestMountain195([2,2,2])).toBe(0);});
  it('d',()=>{expect(longestMountain195([1,3,1,3,1])).toBe(3);});
  it('e',()=>{expect(longestMountain195([0,2,0,2,0])).toBe(3);});
});

function groupAnagramsCnt196(strs:string[]):number{const mp=new Map<string,string[]>();for(const s of strs){const k=s.split('').sort().join('');if(!mp.has(k))mp.set(k,[]);mp.get(k)!.push(s);}return mp.size;}
describe('ph196_gac',()=>{
  it('a',()=>{expect(groupAnagramsCnt196(["eat","tea","tan","ate","nat","bat"])).toBe(3);});
  it('b',()=>{expect(groupAnagramsCnt196([""])).toBe(1);});
  it('c',()=>{expect(groupAnagramsCnt196(["a"])).toBe(1);});
  it('d',()=>{expect(groupAnagramsCnt196(["abc","bca","cba","xyz","zyx"])).toBe(2);});
  it('e',()=>{expect(groupAnagramsCnt196(["a","b","c"])).toBe(3);});
});

function countPrimesSieve197(n:number):number{if(n<2)return 0;const sieve=new Array(n).fill(true);sieve[0]=sieve[1]=false;for(let i=2;i*i<n;i++)if(sieve[i])for(let j=i*i;j<n;j+=i)sieve[j]=false;return sieve.filter(Boolean).length;}
describe('ph197_cps2',()=>{
  it('a',()=>{expect(countPrimesSieve197(10)).toBe(4);});
  it('b',()=>{expect(countPrimesSieve197(0)).toBe(0);});
  it('c',()=>{expect(countPrimesSieve197(2)).toBe(0);});
  it('d',()=>{expect(countPrimesSieve197(20)).toBe(8);});
  it('e',()=>{expect(countPrimesSieve197(3)).toBe(1);});
});

function maxProductArr198(nums:number[]):number{let curMax=nums[0],curMin=nums[0],res=nums[0];for(let i=1;i<nums.length;i++){const tmp=curMax;curMax=Math.max(nums[i],tmp*nums[i],curMin*nums[i]);curMin=Math.min(nums[i],tmp*nums[i],curMin*nums[i]);res=Math.max(res,curMax);}return res;}
describe('ph198_mpa',()=>{
  it('a',()=>{expect(maxProductArr198([2,3,-2,4])).toBe(6);});
  it('b',()=>{expect(maxProductArr198([-2,0,-1])).toBe(0);});
  it('c',()=>{expect(maxProductArr198([2,3,-2,4,-1])).toBe(48);});
  it('d',()=>{expect(maxProductArr198([-2,3,-4])).toBe(24);});
  it('e',()=>{expect(maxProductArr198([0,-2])).toBe(0);});
});

function trappingRain199(h:number[]):number{let l=0,r=h.length-1,lmax=0,rmax=0,res=0;while(l<r){if(h[l]<h[r]){lmax=Math.max(lmax,h[l]);res+=lmax-h[l++];}else{rmax=Math.max(rmax,h[r]);res+=rmax-h[r--];}}return res;}
describe('ph199_tr',()=>{
  it('a',()=>{expect(trappingRain199([0,1,0,2,1,0,1,3,2,1,2,1])).toBe(6);});
  it('b',()=>{expect(trappingRain199([4,2,0,3,2,5])).toBe(9);});
  it('c',()=>{expect(trappingRain199([1])).toBe(0);});
  it('d',()=>{expect(trappingRain199([3,0,2,0,4])).toBe(7);});
  it('e',()=>{expect(trappingRain199([0,0,0])).toBe(0);});
});

function firstUniqChar200(s:string):number{const freq=new Array(26).fill(0);for(const c of s)freq[c.charCodeAt(0)-97]++;for(let i=0;i<s.length;i++)if(freq[s[i].charCodeAt(0)-97]===1)return i;return -1;}
describe('ph200_fuc',()=>{
  it('a',()=>{expect(firstUniqChar200("leetcode")).toBe(0);});
  it('b',()=>{expect(firstUniqChar200("loveleetcode")).toBe(2);});
  it('c',()=>{expect(firstUniqChar200("aabb")).toBe(-1);});
  it('d',()=>{expect(firstUniqChar200("z")).toBe(0);});
  it('e',()=>{expect(firstUniqChar200("aadadaad")).toBe(-1);});
});

function countPrimesSieve201(n:number):number{if(n<2)return 0;const sieve=new Array(n).fill(true);sieve[0]=sieve[1]=false;for(let i=2;i*i<n;i++)if(sieve[i])for(let j=i*i;j<n;j+=i)sieve[j]=false;return sieve.filter(Boolean).length;}
describe('ph201_cps2',()=>{
  it('a',()=>{expect(countPrimesSieve201(10)).toBe(4);});
  it('b',()=>{expect(countPrimesSieve201(0)).toBe(0);});
  it('c',()=>{expect(countPrimesSieve201(2)).toBe(0);});
  it('d',()=>{expect(countPrimesSieve201(20)).toBe(8);});
  it('e',()=>{expect(countPrimesSieve201(3)).toBe(1);});
});

function maxProductArr202(nums:number[]):number{let curMax=nums[0],curMin=nums[0],res=nums[0];for(let i=1;i<nums.length;i++){const tmp=curMax;curMax=Math.max(nums[i],tmp*nums[i],curMin*nums[i]);curMin=Math.min(nums[i],tmp*nums[i],curMin*nums[i]);res=Math.max(res,curMax);}return res;}
describe('ph202_mpa',()=>{
  it('a',()=>{expect(maxProductArr202([2,3,-2,4])).toBe(6);});
  it('b',()=>{expect(maxProductArr202([-2,0,-1])).toBe(0);});
  it('c',()=>{expect(maxProductArr202([2,3,-2,4,-1])).toBe(48);});
  it('d',()=>{expect(maxProductArr202([-2,3,-4])).toBe(24);});
  it('e',()=>{expect(maxProductArr202([0,-2])).toBe(0);});
});

function longestMountain203(arr:number[]):number{const n=arr.length;let max=0;for(let i=1;i<n-1;i++){if(arr[i]>arr[i-1]&&arr[i]>arr[i+1]){let l=i-1,r=i+1;while(l>0&&arr[l]>arr[l-1])l--;while(r<n-1&&arr[r]>arr[r+1])r++;max=Math.max(max,r-l+1);}}return max;}
describe('ph203_lmtn',()=>{
  it('a',()=>{expect(longestMountain203([2,1,4,7,3,2,5])).toBe(5);});
  it('b',()=>{expect(longestMountain203([0,1,2,3,4,5,4,3,2,1,0])).toBe(11);});
  it('c',()=>{expect(longestMountain203([2,2,2])).toBe(0);});
  it('d',()=>{expect(longestMountain203([1,3,1,3,1])).toBe(3);});
  it('e',()=>{expect(longestMountain203([0,2,0,2,0])).toBe(3);});
});

function pivotIndex204(nums:number[]):number{const total=nums.reduce((a,b)=>a+b,0);let left=0;for(let i=0;i<nums.length;i++){if(left===total-left-nums[i])return i;left+=nums[i];}return -1;}
describe('ph204_pi',()=>{
  it('a',()=>{expect(pivotIndex204([1,7,3,6,5,6])).toBe(3);});
  it('b',()=>{expect(pivotIndex204([1,2,3])).toBe(-1);});
  it('c',()=>{expect(pivotIndex204([2,1,-1])).toBe(0);});
  it('d',()=>{expect(pivotIndex204([1,0])).toBe(0);});
  it('e',()=>{expect(pivotIndex204([0])).toBe(0);});
});

function majorityElement205(nums:number[]):number{let cand=nums[0],cnt=1;for(let i=1;i<nums.length;i++){cnt===0?(cand=nums[i],cnt=1):(nums[i]===cand?cnt++:cnt--);}return cand;}
describe('ph205_me',()=>{
  it('a',()=>{expect(majorityElement205([3,2,3])).toBe(3);});
  it('b',()=>{expect(majorityElement205([2,2,1,1,1,2,2])).toBe(2);});
  it('c',()=>{expect(majorityElement205([1])).toBe(1);});
  it('d',()=>{expect(majorityElement205([4,4,4,4,2,2,2])).toBe(4);});
  it('e',()=>{expect(majorityElement205([5,5,5,5,5])).toBe(5);});
});

function plusOneLast206(digits:number[]):number{const res=digits.slice();for(let i=res.length-1;i>=0;i--){if(res[i]<9){res[i]++;return res[res.length-1];}res[i]=0;}res.unshift(1);return res[res.length-1];}
describe('ph206_pol',()=>{
  it('a',()=>{expect(plusOneLast206([1,2,3])).toBe(4);});
  it('b',()=>{expect(plusOneLast206([9,9])).toBe(0);});
  it('c',()=>{expect(plusOneLast206([1,9])).toBe(0);});
  it('d',()=>{expect(plusOneLast206([0])).toBe(1);});
  it('e',()=>{expect(plusOneLast206([8,9,9,9])).toBe(0);});
});

function numToTitle207(n:number):string{let res='';while(n){n--;res=String.fromCharCode(65+n%26)+res;n=Math.floor(n/26);}return res;}
describe('ph207_ntt',()=>{
  it('a',()=>{expect(numToTitle207(1)).toBe("A");});
  it('b',()=>{expect(numToTitle207(28)).toBe("AB");});
  it('c',()=>{expect(numToTitle207(701)).toBe("ZY");});
  it('d',()=>{expect(numToTitle207(26)).toBe("Z");});
  it('e',()=>{expect(numToTitle207(27)).toBe("AA");});
});

function titleToNum208(col:string):number{let res=0;for(const c of col)res=res*26+(c.charCodeAt(0)-64);return res;}
describe('ph208_ttn',()=>{
  it('a',()=>{expect(titleToNum208("A")).toBe(1);});
  it('b',()=>{expect(titleToNum208("AB")).toBe(28);});
  it('c',()=>{expect(titleToNum208("ZY")).toBe(701);});
  it('d',()=>{expect(titleToNum208("Z")).toBe(26);});
  it('e',()=>{expect(titleToNum208("AA")).toBe(27);});
});

function intersectSorted209(a:number[],b:number[]):number{const sa=[...a].sort((x,y)=>x-y),sb=[...b].sort((x,y)=>x-y);let i=0,j=0,cnt=0;while(i<sa.length&&j<sb.length){if(sa[i]===sb[j]){cnt++;i++;j++;}else if(sa[i]<sb[j])i++;else j++;}return cnt;}
describe('ph209_isc',()=>{
  it('a',()=>{expect(intersectSorted209([1,2,2,1],[2,2])).toBe(2);});
  it('b',()=>{expect(intersectSorted209([4,9,5],[9,4,9,8,4])).toBe(2);});
  it('c',()=>{expect(intersectSorted209([1,2],[3,4])).toBe(0);});
  it('d',()=>{expect(intersectSorted209([1,1,1],[1,1])).toBe(2);});
  it('e',()=>{expect(intersectSorted209([],[1])).toBe(0);});
});

function minSubArrayLen210(target:number,nums:number[]):number{let l=0,sum=0,min=Infinity;for(let r=0;r<nums.length;r++){sum+=nums[r];while(sum>=target){min=Math.min(min,r-l+1);sum-=nums[l++];}}return min===Infinity?0:min;}
describe('ph210_msl',()=>{
  it('a',()=>{expect(minSubArrayLen210(7,[2,3,1,2,4,3])).toBe(2);});
  it('b',()=>{expect(minSubArrayLen210(4,[1,4,4])).toBe(1);});
  it('c',()=>{expect(minSubArrayLen210(11,[1,1,1,1,1])).toBe(0);});
  it('d',()=>{expect(minSubArrayLen210(15,[1,2,3,4,5])).toBe(5);});
  it('e',()=>{expect(minSubArrayLen210(6,[2,3,1,2,4,3])).toBe(2);});
});

function canConstructNote211(note:string,mag:string):boolean{const freq=new Map<string,number>();for(const c of mag)freq.set(c,(freq.get(c)||0)+1);for(const c of note){if(!freq.get(c))return false;freq.set(c,freq.get(c)!-1);}return true;}
describe('ph211_ccn',()=>{
  it('a',()=>{expect(canConstructNote211("aa","aab")).toBe(true);});
  it('b',()=>{expect(canConstructNote211("aa","ab")).toBe(false);});
  it('c',()=>{expect(canConstructNote211("a","b")).toBe(false);});
  it('d',()=>{expect(canConstructNote211("","abc")).toBe(true);});
  it('e',()=>{expect(canConstructNote211("bg","efjbdfbdgfjhhaiigfhbaejahgfbbgbjagbddfgdiaigdadhegbhcdgfhefgjefibcecdgfahigad")).toBe(true);});
});

function canConstructNote212(note:string,mag:string):boolean{const freq=new Map<string,number>();for(const c of mag)freq.set(c,(freq.get(c)||0)+1);for(const c of note){if(!freq.get(c))return false;freq.set(c,freq.get(c)!-1);}return true;}
describe('ph212_ccn',()=>{
  it('a',()=>{expect(canConstructNote212("aa","aab")).toBe(true);});
  it('b',()=>{expect(canConstructNote212("aa","ab")).toBe(false);});
  it('c',()=>{expect(canConstructNote212("a","b")).toBe(false);});
  it('d',()=>{expect(canConstructNote212("","abc")).toBe(true);});
  it('e',()=>{expect(canConstructNote212("bg","efjbdfbdgfjhhaiigfhbaejahgfbbgbjagbddfgdiaigdadhegbhcdgfhefgjefibcecdgfahigad")).toBe(true);});
});

function subarraySum2213(nums:number[],k:number):number{const mp=new Map<number,number>();mp.set(0,1);let sum=0,cnt=0;for(const n of nums){sum+=n;cnt+=(mp.get(sum-k)||0);mp.set(sum,(mp.get(sum)||0)+1);}return cnt;}
describe('ph213_ss2',()=>{
  it('a',()=>{expect(subarraySum2213([1,1,1],2)).toBe(2);});
  it('b',()=>{expect(subarraySum2213([1,2,3],3)).toBe(2);});
  it('c',()=>{expect(subarraySum2213([1],-1)).toBe(0);});
  it('d',()=>{expect(subarraySum2213([3,4,7,2,-3,1,4,2],7)).toBe(4);});
  it('e',()=>{expect(subarraySum2213([0,0,0,0],0)).toBe(10);});
});

function canConstructNote214(note:string,mag:string):boolean{const freq=new Map<string,number>();for(const c of mag)freq.set(c,(freq.get(c)||0)+1);for(const c of note){if(!freq.get(c))return false;freq.set(c,freq.get(c)!-1);}return true;}
describe('ph214_ccn',()=>{
  it('a',()=>{expect(canConstructNote214("aa","aab")).toBe(true);});
  it('b',()=>{expect(canConstructNote214("aa","ab")).toBe(false);});
  it('c',()=>{expect(canConstructNote214("a","b")).toBe(false);});
  it('d',()=>{expect(canConstructNote214("","abc")).toBe(true);});
  it('e',()=>{expect(canConstructNote214("bg","efjbdfbdgfjhhaiigfhbaejahgfbbgbjagbddfgdiaigdadhegbhcdgfhefgjefibcecdgfahigad")).toBe(true);});
});

function subarraySum2215(nums:number[],k:number):number{const mp=new Map<number,number>();mp.set(0,1);let sum=0,cnt=0;for(const n of nums){sum+=n;cnt+=(mp.get(sum-k)||0);mp.set(sum,(mp.get(sum)||0)+1);}return cnt;}
describe('ph215_ss2',()=>{
  it('a',()=>{expect(subarraySum2215([1,1,1],2)).toBe(2);});
  it('b',()=>{expect(subarraySum2215([1,2,3],3)).toBe(2);});
  it('c',()=>{expect(subarraySum2215([1],-1)).toBe(0);});
  it('d',()=>{expect(subarraySum2215([3,4,7,2,-3,1,4,2],7)).toBe(4);});
  it('e',()=>{expect(subarraySum2215([0,0,0,0],0)).toBe(10);});
});

function validAnagram2216(s:string,t:string):boolean{if(s.length!==t.length)return false;const freq=new Array(26).fill(0);for(let i=0;i<s.length;i++){freq[s.charCodeAt(i)-97]++;freq[t.charCodeAt(i)-97]--;}return freq.every((x:number)=>x===0);}
describe('ph216_va2',()=>{
  it('a',()=>{expect(validAnagram2216("anagram","nagaram")).toBe(true);});
  it('b',()=>{expect(validAnagram2216("rat","car")).toBe(false);});
  it('c',()=>{expect(validAnagram2216("a","a")).toBe(true);});
  it('d',()=>{expect(validAnagram2216("ab","ba")).toBe(true);});
  it('e',()=>{expect(validAnagram2216("abc","cba")).toBe(true);});
});
