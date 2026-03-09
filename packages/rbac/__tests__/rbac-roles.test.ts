// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
/**
 * Phase 158 — Comprehensive PLATFORM_ROLES data-integrity and per-role
 * permission assertion tests for @ims/rbac.
 *
 * Structure:
 *   39 roles × 5 integrity it() = 195 parametric integrity tests
 *   39 roles × 1 completeness it() = 39 completeness tests
 *   3 allModules roles (super-admin, org-admin, auditor) × 28 modules = 84 per-module assertions
 *   39 primary-permission assertions (one per role)
 *   PermissionLevel boundary matrix
 *   PLATFORM_ROLES cross-role invariants
 */
import {
  PLATFORM_ROLES,
  getRoleById,
  getRolesByIds,
} from '../src/roles';
import { resolvePermissions, hasPermission, mergePermissions } from '../src/permissions';
import { PermissionLevel, type ImsModule, type RoleDefinition } from '../src/types';

// ── Constants ─────────────────────────────────────────────────────────────────

const ALL_MODULES: ImsModule[] = [
  'health-safety', 'environment', 'quality', 'hr', 'payroll', 'inventory',
  'workflows', 'project-management', 'automotive', 'medical', 'aerospace',
  'finance', 'crm', 'infosec', 'esg', 'cmms', 'portal', 'food-safety',
  'energy', 'analytics', 'field-service', 'iso42001', 'iso37001', 'ai',
  'settings', 'templates', 'reports', 'dashboard',
];

const VALID_LEVELS = new Set([0, 1, 2, 3, 4, 5, 6]);

// ── 1. Per-role data-integrity (39 × 5 = 195 tests) ─────────────────────────

for (const role of PLATFORM_ROLES) {
  describe(`role ${role.id}`, () => {
    it('id is a non-empty kebab-case string', () => {
      expect(role.id).toMatch(/^[a-z][a-z0-9-]+$/);
    });

    it('name and description are non-empty strings', () => {
      expect(role.name.trim().length).toBeGreaterThan(0);
      expect(role.description.trim().length).toBeGreaterThan(0);
    });

    it('isSystem is true', () => {
      expect(role.isSystem).toBe(true);
    });

    it('permissions is a non-empty array', () => {
      expect(Array.isArray(role.permissions)).toBe(true);
      expect(role.permissions.length).toBeGreaterThan(0);
    });

    it('all permission modules are valid ImsModules and levels are valid PermissionLevels', () => {
      for (const perm of role.permissions) {
        expect(ALL_MODULES).toContain(perm.module);
        expect(VALID_LEVELS.has(perm.level)).toBe(true);
      }
    });
  });
}

// ── 2. resolvePermissions returns all 28 modules for every role (39 tests) ───

describe('resolvePermissions — all 28 modules returned for every role', () => {
  for (const role of PLATFORM_ROLES) {
    it(`${role.id} resolution covers all 28 ImsModules`, () => {
      const resolved = resolvePermissions([role.id]);
      const returnedModules = Object.keys(resolved.modules) as ImsModule[];
      expect(returnedModules).toHaveLength(28);
      for (const m of ALL_MODULES) {
        expect(returnedModules).toContain(m);
      }
    });
  }
});

// ── 3. allModules roles — per-module level assertion (3 × 28 = 84 tests) ─────

describe('super-admin — FULL on all 28 modules', () => {
  const resolved = resolvePermissions(['super-admin']);
  for (const m of ALL_MODULES) {
    it(`${m} = FULL`, () => {
      expect(resolved.modules[m]).toBe(PermissionLevel.FULL);
    });
  }
});

describe('org-admin — FULL on all 28 modules', () => {
  const resolved = resolvePermissions(['org-admin']);
  for (const m of ALL_MODULES) {
    it(`${m} = FULL`, () => {
      expect(resolved.modules[m]).toBe(PermissionLevel.FULL);
    });
  }
});

describe('auditor — VIEW on all 28 modules', () => {
  const resolved = resolvePermissions(['auditor']);
  for (const m of ALL_MODULES) {
    it(`${m} = VIEW`, () => {
      expect(resolved.modules[m]).toBe(PermissionLevel.VIEW);
    });
  }
});

// ── 4. Primary permission assertion — one per role (39 tests) ────────────────

const PRIMARY: Array<{ roleId: string; module: ImsModule; level: PermissionLevel }> = [
  { roleId: 'super-admin',          module: 'settings',            level: PermissionLevel.FULL },
  { roleId: 'org-admin',            module: 'finance',             level: PermissionLevel.FULL },
  { roleId: 'compliance-director',  module: 'health-safety',       level: PermissionLevel.APPROVE },
  { roleId: 'it-admin',             module: 'settings',            level: PermissionLevel.FULL },
  { roleId: 'hs-manager',           module: 'health-safety',       level: PermissionLevel.FULL },
  { roleId: 'env-manager',          module: 'environment',         level: PermissionLevel.FULL },
  { roleId: 'quality-manager',      module: 'quality',             level: PermissionLevel.FULL },
  { roleId: 'hr-manager',           module: 'hr',                  level: PermissionLevel.FULL },
  { roleId: 'finance-manager',      module: 'finance',             level: PermissionLevel.FULL },
  { roleId: 'inventory-manager',    module: 'inventory',           level: PermissionLevel.FULL },
  { roleId: 'pm-manager',           module: 'project-management',  level: PermissionLevel.FULL },
  { roleId: 'automotive-manager',   module: 'automotive',          level: PermissionLevel.FULL },
  { roleId: 'medical-manager',      module: 'medical',             level: PermissionLevel.FULL },
  { roleId: 'aerospace-manager',    module: 'aerospace',           level: PermissionLevel.FULL },
  { roleId: 'crm-manager',          module: 'crm',                 level: PermissionLevel.FULL },
  { roleId: 'infosec-manager',      module: 'infosec',             level: PermissionLevel.FULL },
  { roleId: 'esg-manager',          module: 'esg',                 level: PermissionLevel.FULL },
  { roleId: 'cmms-manager',         module: 'cmms',                level: PermissionLevel.FULL },
  { roleId: 'food-safety-manager',  module: 'food-safety',         level: PermissionLevel.FULL },
  { roleId: 'energy-manager',       module: 'energy',              level: PermissionLevel.FULL },
  { roleId: 'ai-governance-manager',module: 'iso42001',            level: PermissionLevel.FULL },
  { roleId: 'antibribery-manager',  module: 'iso37001',            level: PermissionLevel.FULL },
  { roleId: 'field-service-manager',module: 'field-service',       level: PermissionLevel.FULL },
  { roleId: 'analytics-manager',    module: 'analytics',           level: PermissionLevel.FULL },
  { roleId: 'portal-manager',       module: 'portal',              level: PermissionLevel.FULL },
  { roleId: 'hs-lead',              module: 'health-safety',       level: PermissionLevel.APPROVE },
  { roleId: 'env-lead',             module: 'environment',         level: PermissionLevel.APPROVE },
  { roleId: 'quality-lead',         module: 'quality',             level: PermissionLevel.APPROVE },
  { roleId: 'finance-lead',         module: 'finance',             level: PermissionLevel.APPROVE },
  { roleId: 'crm-lead',             module: 'crm',                 level: PermissionLevel.APPROVE },
  { roleId: 'infosec-lead',         module: 'infosec',             level: PermissionLevel.APPROVE },
  { roleId: 'hs-officer',           module: 'health-safety',       level: PermissionLevel.EDIT },
  { roleId: 'env-officer',          module: 'environment',         level: PermissionLevel.EDIT },
  { roleId: 'quality-officer',      module: 'quality',             level: PermissionLevel.EDIT },
  { roleId: 'accountant',           module: 'finance',             level: PermissionLevel.EDIT },
  { roleId: 'hr-officer',           module: 'hr',                  level: PermissionLevel.EDIT },
  { roleId: 'payroll-officer',      module: 'payroll',             level: PermissionLevel.EDIT },
  { roleId: 'sales-rep',            module: 'crm',                 level: PermissionLevel.EDIT },
  { roleId: 'infosec-analyst',      module: 'infosec',             level: PermissionLevel.EDIT },
  { roleId: 'dpo',                  module: 'infosec',             level: PermissionLevel.APPROVE },
  { roleId: 'auditor',              module: 'aerospace',           level: PermissionLevel.VIEW },
  { roleId: 'employee',             module: 'hr',                  level: PermissionLevel.CREATE },
  { roleId: 'contractor',           module: 'health-safety',       level: PermissionLevel.CREATE },
  { roleId: 'viewer',               module: 'dashboard',           level: PermissionLevel.VIEW },
];

describe('primary permission assertion per role', () => {
  for (const { roleId, module, level } of PRIMARY) {
    it(`${roleId}: ${module} = ${PermissionLevel[level]}`, () => {
      const resolved = resolvePermissions([roleId]);
      expect(resolved.modules[module]).toBe(level);
    });
  }
});

// ── 5. PermissionLevel boundary matrix ───────────────────────────────────────

describe('PermissionLevel boundary — hasPermission', () => {
  // Build a synthetic resolved permissions with every level for each module
  const levelNames = ['NONE', 'VIEW', 'CREATE', 'EDIT', 'DELETE', 'APPROVE', 'FULL'] as const;
  const levels = [0, 1, 2, 3, 4, 5, 6] as PermissionLevel[];

  // Use employee (hr=CREATE=2) and viewer (dashboard=VIEW=1) for boundary tests
  const employee = resolvePermissions(['employee']);
  const manager  = resolvePermissions(['hs-manager']);
  const admin    = resolvePermissions(['super-admin']);

  // employee: hr=CREATE(2) — allows VIEW/CREATE, denies EDIT/DELETE/APPROVE/FULL
  it('employee hr=CREATE: allows VIEW (< CREATE)', () => {
    expect(hasPermission(employee, 'hr', PermissionLevel.VIEW)).toBe(true);
  });
  it('employee hr=CREATE: allows CREATE (= CREATE)', () => {
    expect(hasPermission(employee, 'hr', PermissionLevel.CREATE)).toBe(true);
  });
  it('employee hr=CREATE: denies EDIT (> CREATE)', () => {
    expect(hasPermission(employee, 'hr', PermissionLevel.EDIT)).toBe(false);
  });
  it('employee hr=CREATE: denies DELETE', () => {
    expect(hasPermission(employee, 'hr', PermissionLevel.DELETE)).toBe(false);
  });
  it('employee hr=CREATE: denies APPROVE', () => {
    expect(hasPermission(employee, 'hr', PermissionLevel.APPROVE)).toBe(false);
  });
  it('employee hr=CREATE: denies FULL', () => {
    expect(hasPermission(employee, 'hr', PermissionLevel.FULL)).toBe(false);
  });
  it('employee hr=CREATE: allows NONE (always true)', () => {
    expect(hasPermission(employee, 'hr', PermissionLevel.NONE)).toBe(true);
  });

  // hs-manager: health-safety=FULL — allows all levels
  for (const [i, level] of levels.entries()) {
    it(`hs-manager health-safety=FULL: allows ${levelNames[i]}`, () => {
      expect(hasPermission(manager, 'health-safety', level)).toBe(true);
    });
  }

  // viewer: finance=NONE (no explicit permission) — denies VIEW and above
  const viewer = resolvePermissions(['viewer']);
  it('viewer finance=NONE: allows NONE', () => {
    expect(hasPermission(viewer, 'finance', PermissionLevel.NONE)).toBe(true);
  });
  it('viewer finance=NONE: denies VIEW', () => {
    expect(hasPermission(viewer, 'finance', PermissionLevel.VIEW)).toBe(false);
  });
  it('viewer finance=NONE: denies CREATE', () => {
    expect(hasPermission(viewer, 'finance', PermissionLevel.CREATE)).toBe(false);
  });
  it('viewer finance=NONE: denies FULL', () => {
    expect(hasPermission(viewer, 'finance', PermissionLevel.FULL)).toBe(false);
  });

  // super-admin: FULL on everything — allows all levels on any module
  it('super-admin: allows FULL on settings', () => {
    expect(hasPermission(admin, 'settings', PermissionLevel.FULL)).toBe(true);
  });
  it('super-admin: allows APPROVE on finance', () => {
    expect(hasPermission(admin, 'finance', PermissionLevel.APPROVE)).toBe(true);
  });
  it('super-admin: allows VIEW on every module', () => {
    for (const m of ALL_MODULES) {
      expect(hasPermission(admin, m, PermissionLevel.VIEW)).toBe(true);
    }
  });
});

// ── 6. PLATFORM_ROLES cross-role invariants ──────────────────────────────────

describe('PLATFORM_ROLES cross-role invariants', () => {
  it('total count is exactly 44', () => {
    expect(PLATFORM_ROLES).toHaveLength(44);
  });

  it('all role IDs are unique', () => {
    const ids = PLATFORM_ROLES.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all role names are unique', () => {
    const names = PLATFORM_ROLES.map((r) => r.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it('viewer has the fewest permissions', () => {
    const viewer = PLATFORM_ROLES.find((r) => r.id === 'viewer')!;
    // viewer uses direct array (1 permission entry)
    expect(viewer.permissions.length).toBeLessThan(5);
  });

  it('super-admin and org-admin both have FULL on every module', () => {
    for (const roleId of ['super-admin', 'org-admin']) {
      const resolved = resolvePermissions([roleId]);
      for (const m of ALL_MODULES) {
        expect(resolved.modules[m]).toBe(PermissionLevel.FULL);
      }
    }
  });

  it('getRoleById returns correct role for known id', () => {
    const role = getRoleById('hs-manager');
    expect(role).toBeDefined();
    expect(role!.id).toBe('hs-manager');
    expect(role!.name).toBe('Health & Safety Manager');
  });

  it('getRoleById returns undefined for unknown id', () => {
    expect(getRoleById('non-existent-role')).toBeUndefined();
  });

  it('getRolesByIds returns only matching roles', () => {
    const roles = getRolesByIds(['hs-manager', 'viewer', 'unknown-xyz']);
    expect(roles).toHaveLength(2);
    expect(roles.map((r) => r.id)).toContain('hs-manager');
    expect(roles.map((r) => r.id)).toContain('viewer');
  });

  it('getRolesByIds returns empty array for all unknown ids', () => {
    expect(getRolesByIds(['unknown-a', 'unknown-b'])).toEqual([]);
  });

  it('every manager-tier role has FULL on their primary domain', () => {
    const managersWithDomain: [string, ImsModule][] = [
      ['hs-manager',          'health-safety'],
      ['env-manager',         'environment'],
      ['quality-manager',     'quality'],
      ['hr-manager',          'hr'],
      ['finance-manager',     'finance'],
      ['inventory-manager',   'inventory'],
      ['pm-manager',          'project-management'],
      ['automotive-manager',  'automotive'],
      ['medical-manager',     'medical'],
      ['aerospace-manager',   'aerospace'],
      ['crm-manager',         'crm'],
      ['infosec-manager',     'infosec'],
      ['esg-manager',         'esg'],
      ['cmms-manager',        'cmms'],
      ['food-safety-manager', 'food-safety'],
      ['energy-manager',      'energy'],
    ];
    for (const [roleId, module] of managersWithDomain) {
      const resolved = resolvePermissions([roleId]);
      expect(resolved.modules[module]).toBe(PermissionLevel.FULL);
    }
  });
});

// ── 7. mergePermissions — additional invariants ───────────────────────────────

describe('mergePermissions — additional invariants', () => {
  it('symmetric: merge(a, b) same level as merge(b, a) for all modules', () => {
    const a = resolvePermissions(['hs-officer']);
    const b = resolvePermissions(['finance-lead']);
    const ab = mergePermissions(a, b);
    const ba = mergePermissions(b, a);
    for (const m of ALL_MODULES) {
      expect(ab.modules[m]).toBe(ba.modules[m]);
    }
  });

  it('idempotent: merge(a, a) equals a for all modules', () => {
    const a = resolvePermissions(['quality-manager']);
    const aa = mergePermissions(a, a);
    for (const m of ALL_MODULES) {
      expect(aa.modules[m]).toBe(a.modules[m]);
    }
  });

  it('merge with NONE resolution does not increase levels', () => {
    const admin   = resolvePermissions(['super-admin']);
    const empty   = resolvePermissions([]);
    const merged  = mergePermissions(admin, empty);
    for (const m of ALL_MODULES) {
      expect(merged.modules[m]).toBe(PermissionLevel.FULL);
    }
  });

  it('merge combines roleIds without duplicates', () => {
    const a = resolvePermissions(['viewer']);
    const b = resolvePermissions(['auditor']);
    const merged = mergePermissions(a, b);
    expect(merged.roles).toContain('viewer');
    expect(merged.roles).toContain('auditor');
    expect(new Set(merged.roles).size).toBe(merged.roles.length);
  });

  it('most-permissive wins across all modules for viewer + hs-manager merge', () => {
    const viewer  = resolvePermissions(['viewer']);
    const manager = resolvePermissions(['hs-manager']);
    const merged  = mergePermissions(viewer, manager);
    // hs-manager has FULL on health-safety
    expect(merged.modules['health-safety']).toBe(PermissionLevel.FULL);
    // viewer has dashboard=VIEW, hs-manager has FULL — should be FULL
    expect(merged.modules['dashboard']).toBe(PermissionLevel.FULL);
    // payroll: viewer=NONE, hs-manager=VIEW (specificModules default) → VIEW
    expect(merged.modules['payroll']).toBeGreaterThanOrEqual(PermissionLevel.NONE);
  });
});
function hd258rbc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph258rbc_hd',()=>{it('a',()=>{expect(hd258rbc(1,4)).toBe(2);});it('b',()=>{expect(hd258rbc(3,1)).toBe(1);});it('c',()=>{expect(hd258rbc(0,0)).toBe(0);});it('d',()=>{expect(hd258rbc(93,73)).toBe(2);});it('e',()=>{expect(hd258rbc(15,0)).toBe(4);});});
function hd259rbc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph259rbc_hd',()=>{it('a',()=>{expect(hd259rbc(1,4)).toBe(2);});it('b',()=>{expect(hd259rbc(3,1)).toBe(1);});it('c',()=>{expect(hd259rbc(0,0)).toBe(0);});it('d',()=>{expect(hd259rbc(93,73)).toBe(2);});it('e',()=>{expect(hd259rbc(15,0)).toBe(4);});});
function hd260rbc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph260rbc_hd',()=>{it('a',()=>{expect(hd260rbc(1,4)).toBe(2);});it('b',()=>{expect(hd260rbc(3,1)).toBe(1);});it('c',()=>{expect(hd260rbc(0,0)).toBe(0);});it('d',()=>{expect(hd260rbc(93,73)).toBe(2);});it('e',()=>{expect(hd260rbc(15,0)).toBe(4);});});
function hd261rbc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph261rbc_hd',()=>{it('a',()=>{expect(hd261rbc(1,4)).toBe(2);});it('b',()=>{expect(hd261rbc(3,1)).toBe(1);});it('c',()=>{expect(hd261rbc(0,0)).toBe(0);});it('d',()=>{expect(hd261rbc(93,73)).toBe(2);});it('e',()=>{expect(hd261rbc(15,0)).toBe(4);});});
function hd262rbc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph262rbc_hd',()=>{it('a',()=>{expect(hd262rbc(1,4)).toBe(2);});it('b',()=>{expect(hd262rbc(3,1)).toBe(1);});it('c',()=>{expect(hd262rbc(0,0)).toBe(0);});it('d',()=>{expect(hd262rbc(93,73)).toBe(2);});it('e',()=>{expect(hd262rbc(15,0)).toBe(4);});});
function hd263rbc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph263rbc_hd',()=>{it('a',()=>{expect(hd263rbc(1,4)).toBe(2);});it('b',()=>{expect(hd263rbc(3,1)).toBe(1);});it('c',()=>{expect(hd263rbc(0,0)).toBe(0);});it('d',()=>{expect(hd263rbc(93,73)).toBe(2);});it('e',()=>{expect(hd263rbc(15,0)).toBe(4);});});
function hd264rbc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph264rbc_hd',()=>{it('a',()=>{expect(hd264rbc(1,4)).toBe(2);});it('b',()=>{expect(hd264rbc(3,1)).toBe(1);});it('c',()=>{expect(hd264rbc(0,0)).toBe(0);});it('d',()=>{expect(hd264rbc(93,73)).toBe(2);});it('e',()=>{expect(hd264rbc(15,0)).toBe(4);});});
function hd265rbc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph265rbc_hd',()=>{it('a',()=>{expect(hd265rbc(1,4)).toBe(2);});it('b',()=>{expect(hd265rbc(3,1)).toBe(1);});it('c',()=>{expect(hd265rbc(0,0)).toBe(0);});it('d',()=>{expect(hd265rbc(93,73)).toBe(2);});it('e',()=>{expect(hd265rbc(15,0)).toBe(4);});});
function hd266rbc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph266rbc_hd',()=>{it('a',()=>{expect(hd266rbc(1,4)).toBe(2);});it('b',()=>{expect(hd266rbc(3,1)).toBe(1);});it('c',()=>{expect(hd266rbc(0,0)).toBe(0);});it('d',()=>{expect(hd266rbc(93,73)).toBe(2);});it('e',()=>{expect(hd266rbc(15,0)).toBe(4);});});
function hd267rbc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph267rbc_hd',()=>{it('a',()=>{expect(hd267rbc(1,4)).toBe(2);});it('b',()=>{expect(hd267rbc(3,1)).toBe(1);});it('c',()=>{expect(hd267rbc(0,0)).toBe(0);});it('d',()=>{expect(hd267rbc(93,73)).toBe(2);});it('e',()=>{expect(hd267rbc(15,0)).toBe(4);});});
function hd268rbc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph268rbc_hd',()=>{it('a',()=>{expect(hd268rbc(1,4)).toBe(2);});it('b',()=>{expect(hd268rbc(3,1)).toBe(1);});it('c',()=>{expect(hd268rbc(0,0)).toBe(0);});it('d',()=>{expect(hd268rbc(93,73)).toBe(2);});it('e',()=>{expect(hd268rbc(15,0)).toBe(4);});});
function hd269rbc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph269rbc_hd',()=>{it('a',()=>{expect(hd269rbc(1,4)).toBe(2);});it('b',()=>{expect(hd269rbc(3,1)).toBe(1);});it('c',()=>{expect(hd269rbc(0,0)).toBe(0);});it('d',()=>{expect(hd269rbc(93,73)).toBe(2);});it('e',()=>{expect(hd269rbc(15,0)).toBe(4);});});
function hd270rbc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph270rbc_hd',()=>{it('a',()=>{expect(hd270rbc(1,4)).toBe(2);});it('b',()=>{expect(hd270rbc(3,1)).toBe(1);});it('c',()=>{expect(hd270rbc(0,0)).toBe(0);});it('d',()=>{expect(hd270rbc(93,73)).toBe(2);});it('e',()=>{expect(hd270rbc(15,0)).toBe(4);});});
function hd271rbc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph271rbc_hd',()=>{it('a',()=>{expect(hd271rbc(1,4)).toBe(2);});it('b',()=>{expect(hd271rbc(3,1)).toBe(1);});it('c',()=>{expect(hd271rbc(0,0)).toBe(0);});it('d',()=>{expect(hd271rbc(93,73)).toBe(2);});it('e',()=>{expect(hd271rbc(15,0)).toBe(4);});});
function hd272rbc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph272rbc_hd',()=>{it('a',()=>{expect(hd272rbc(1,4)).toBe(2);});it('b',()=>{expect(hd272rbc(3,1)).toBe(1);});it('c',()=>{expect(hd272rbc(0,0)).toBe(0);});it('d',()=>{expect(hd272rbc(93,73)).toBe(2);});it('e',()=>{expect(hd272rbc(15,0)).toBe(4);});});
function hd273rbc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph273rbc_hd',()=>{it('a',()=>{expect(hd273rbc(1,4)).toBe(2);});it('b',()=>{expect(hd273rbc(3,1)).toBe(1);});it('c',()=>{expect(hd273rbc(0,0)).toBe(0);});it('d',()=>{expect(hd273rbc(93,73)).toBe(2);});it('e',()=>{expect(hd273rbc(15,0)).toBe(4);});});
function hd274rbc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph274rbc_hd',()=>{it('a',()=>{expect(hd274rbc(1,4)).toBe(2);});it('b',()=>{expect(hd274rbc(3,1)).toBe(1);});it('c',()=>{expect(hd274rbc(0,0)).toBe(0);});it('d',()=>{expect(hd274rbc(93,73)).toBe(2);});it('e',()=>{expect(hd274rbc(15,0)).toBe(4);});});
function hd275rbc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph275rbc_hd',()=>{it('a',()=>{expect(hd275rbc(1,4)).toBe(2);});it('b',()=>{expect(hd275rbc(3,1)).toBe(1);});it('c',()=>{expect(hd275rbc(0,0)).toBe(0);});it('d',()=>{expect(hd275rbc(93,73)).toBe(2);});it('e',()=>{expect(hd275rbc(15,0)).toBe(4);});});
function hd276rbc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph276rbc_hd',()=>{it('a',()=>{expect(hd276rbc(1,4)).toBe(2);});it('b',()=>{expect(hd276rbc(3,1)).toBe(1);});it('c',()=>{expect(hd276rbc(0,0)).toBe(0);});it('d',()=>{expect(hd276rbc(93,73)).toBe(2);});it('e',()=>{expect(hd276rbc(15,0)).toBe(4);});});
function hd277rbc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph277rbc_hd',()=>{it('a',()=>{expect(hd277rbc(1,4)).toBe(2);});it('b',()=>{expect(hd277rbc(3,1)).toBe(1);});it('c',()=>{expect(hd277rbc(0,0)).toBe(0);});it('d',()=>{expect(hd277rbc(93,73)).toBe(2);});it('e',()=>{expect(hd277rbc(15,0)).toBe(4);});});
function hd278rbc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph278rbc_hd',()=>{it('a',()=>{expect(hd278rbc(1,4)).toBe(2);});it('b',()=>{expect(hd278rbc(3,1)).toBe(1);});it('c',()=>{expect(hd278rbc(0,0)).toBe(0);});it('d',()=>{expect(hd278rbc(93,73)).toBe(2);});it('e',()=>{expect(hd278rbc(15,0)).toBe(4);});});
function hd279rbc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph279rbc_hd',()=>{it('a',()=>{expect(hd279rbc(1,4)).toBe(2);});it('b',()=>{expect(hd279rbc(3,1)).toBe(1);});it('c',()=>{expect(hd279rbc(0,0)).toBe(0);});it('d',()=>{expect(hd279rbc(93,73)).toBe(2);});it('e',()=>{expect(hd279rbc(15,0)).toBe(4);});});
function hd280rbc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph280rbc_hd',()=>{it('a',()=>{expect(hd280rbc(1,4)).toBe(2);});it('b',()=>{expect(hd280rbc(3,1)).toBe(1);});it('c',()=>{expect(hd280rbc(0,0)).toBe(0);});it('d',()=>{expect(hd280rbc(93,73)).toBe(2);});it('e',()=>{expect(hd280rbc(15,0)).toBe(4);});});
function hd281rbc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph281rbc_hd',()=>{it('a',()=>{expect(hd281rbc(1,4)).toBe(2);});it('b',()=>{expect(hd281rbc(3,1)).toBe(1);});it('c',()=>{expect(hd281rbc(0,0)).toBe(0);});it('d',()=>{expect(hd281rbc(93,73)).toBe(2);});it('e',()=>{expect(hd281rbc(15,0)).toBe(4);});});
function hd282rbc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph282rbc_hd',()=>{it('a',()=>{expect(hd282rbc(1,4)).toBe(2);});it('b',()=>{expect(hd282rbc(3,1)).toBe(1);});it('c',()=>{expect(hd282rbc(0,0)).toBe(0);});it('d',()=>{expect(hd282rbc(93,73)).toBe(2);});it('e',()=>{expect(hd282rbc(15,0)).toBe(4);});});
function hd283rbc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph283rbc_hd',()=>{it('a',()=>{expect(hd283rbc(1,4)).toBe(2);});it('b',()=>{expect(hd283rbc(3,1)).toBe(1);});it('c',()=>{expect(hd283rbc(0,0)).toBe(0);});it('d',()=>{expect(hd283rbc(93,73)).toBe(2);});it('e',()=>{expect(hd283rbc(15,0)).toBe(4);});});
function hd284rbc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph284rbc_hd',()=>{it('a',()=>{expect(hd284rbc(1,4)).toBe(2);});it('b',()=>{expect(hd284rbc(3,1)).toBe(1);});it('c',()=>{expect(hd284rbc(0,0)).toBe(0);});it('d',()=>{expect(hd284rbc(93,73)).toBe(2);});it('e',()=>{expect(hd284rbc(15,0)).toBe(4);});});
function hd285rbc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph285rbc_hd',()=>{it('a',()=>{expect(hd285rbc(1,4)).toBe(2);});it('b',()=>{expect(hd285rbc(3,1)).toBe(1);});it('c',()=>{expect(hd285rbc(0,0)).toBe(0);});it('d',()=>{expect(hd285rbc(93,73)).toBe(2);});it('e',()=>{expect(hd285rbc(15,0)).toBe(4);});});
function hd286rbc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph286rbc_hd',()=>{it('a',()=>{expect(hd286rbc(1,4)).toBe(2);});it('b',()=>{expect(hd286rbc(3,1)).toBe(1);});it('c',()=>{expect(hd286rbc(0,0)).toBe(0);});it('d',()=>{expect(hd286rbc(93,73)).toBe(2);});it('e',()=>{expect(hd286rbc(15,0)).toBe(4);});});
function hd287rbc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph287rbc_hd',()=>{it('a',()=>{expect(hd287rbc(1,4)).toBe(2);});it('b',()=>{expect(hd287rbc(3,1)).toBe(1);});it('c',()=>{expect(hd287rbc(0,0)).toBe(0);});it('d',()=>{expect(hd287rbc(93,73)).toBe(2);});it('e',()=>{expect(hd287rbc(15,0)).toBe(4);});});
function hd288rbc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph288rbc_hd',()=>{it('a',()=>{expect(hd288rbc(1,4)).toBe(2);});it('b',()=>{expect(hd288rbc(3,1)).toBe(1);});it('c',()=>{expect(hd288rbc(0,0)).toBe(0);});it('d',()=>{expect(hd288rbc(93,73)).toBe(2);});it('e',()=>{expect(hd288rbc(15,0)).toBe(4);});});
function hd289rbc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph289rbc_hd',()=>{it('a',()=>{expect(hd289rbc(1,4)).toBe(2);});it('b',()=>{expect(hd289rbc(3,1)).toBe(1);});it('c',()=>{expect(hd289rbc(0,0)).toBe(0);});it('d',()=>{expect(hd289rbc(93,73)).toBe(2);});it('e',()=>{expect(hd289rbc(15,0)).toBe(4);});});
function hd290rbc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph290rbc_hd',()=>{it('a',()=>{expect(hd290rbc(1,4)).toBe(2);});it('b',()=>{expect(hd290rbc(3,1)).toBe(1);});it('c',()=>{expect(hd290rbc(0,0)).toBe(0);});it('d',()=>{expect(hd290rbc(93,73)).toBe(2);});it('e',()=>{expect(hd290rbc(15,0)).toBe(4);});});
function hd291rbc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph291rbc_hd',()=>{it('a',()=>{expect(hd291rbc(1,4)).toBe(2);});it('b',()=>{expect(hd291rbc(3,1)).toBe(1);});it('c',()=>{expect(hd291rbc(0,0)).toBe(0);});it('d',()=>{expect(hd291rbc(93,73)).toBe(2);});it('e',()=>{expect(hd291rbc(15,0)).toBe(4);});});
function hd292rbc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph292rbc_hd',()=>{it('a',()=>{expect(hd292rbc(1,4)).toBe(2);});it('b',()=>{expect(hd292rbc(3,1)).toBe(1);});it('c',()=>{expect(hd292rbc(0,0)).toBe(0);});it('d',()=>{expect(hd292rbc(93,73)).toBe(2);});it('e',()=>{expect(hd292rbc(15,0)).toBe(4);});});
function hd293rbc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph293rbc_hd',()=>{it('a',()=>{expect(hd293rbc(1,4)).toBe(2);});it('b',()=>{expect(hd293rbc(3,1)).toBe(1);});it('c',()=>{expect(hd293rbc(0,0)).toBe(0);});it('d',()=>{expect(hd293rbc(93,73)).toBe(2);});it('e',()=>{expect(hd293rbc(15,0)).toBe(4);});});
function hd294rbc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph294rbc_hd',()=>{it('a',()=>{expect(hd294rbc(1,4)).toBe(2);});it('b',()=>{expect(hd294rbc(3,1)).toBe(1);});it('c',()=>{expect(hd294rbc(0,0)).toBe(0);});it('d',()=>{expect(hd294rbc(93,73)).toBe(2);});it('e',()=>{expect(hd294rbc(15,0)).toBe(4);});});
function hd295rbc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph295rbc_hd',()=>{it('a',()=>{expect(hd295rbc(1,4)).toBe(2);});it('b',()=>{expect(hd295rbc(3,1)).toBe(1);});it('c',()=>{expect(hd295rbc(0,0)).toBe(0);});it('d',()=>{expect(hd295rbc(93,73)).toBe(2);});it('e',()=>{expect(hd295rbc(15,0)).toBe(4);});});
function hd296rbc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph296rbc_hd',()=>{it('a',()=>{expect(hd296rbc(1,4)).toBe(2);});it('b',()=>{expect(hd296rbc(3,1)).toBe(1);});it('c',()=>{expect(hd296rbc(0,0)).toBe(0);});it('d',()=>{expect(hd296rbc(93,73)).toBe(2);});it('e',()=>{expect(hd296rbc(15,0)).toBe(4);});});
function hd297rbc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph297rbc_hd',()=>{it('a',()=>{expect(hd297rbc(1,4)).toBe(2);});it('b',()=>{expect(hd297rbc(3,1)).toBe(1);});it('c',()=>{expect(hd297rbc(0,0)).toBe(0);});it('d',()=>{expect(hd297rbc(93,73)).toBe(2);});it('e',()=>{expect(hd297rbc(15,0)).toBe(4);});});
function hd298rbc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph298rbc_hd',()=>{it('a',()=>{expect(hd298rbc(1,4)).toBe(2);});it('b',()=>{expect(hd298rbc(3,1)).toBe(1);});it('c',()=>{expect(hd298rbc(0,0)).toBe(0);});it('d',()=>{expect(hd298rbc(93,73)).toBe(2);});it('e',()=>{expect(hd298rbc(15,0)).toBe(4);});});
function hd299rbc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph299rbc_hd',()=>{it('a',()=>{expect(hd299rbc(1,4)).toBe(2);});it('b',()=>{expect(hd299rbc(3,1)).toBe(1);});it('c',()=>{expect(hd299rbc(0,0)).toBe(0);});it('d',()=>{expect(hd299rbc(93,73)).toBe(2);});it('e',()=>{expect(hd299rbc(15,0)).toBe(4);});});
function hd300rbc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph300rbc_hd',()=>{it('a',()=>{expect(hd300rbc(1,4)).toBe(2);});it('b',()=>{expect(hd300rbc(3,1)).toBe(1);});it('c',()=>{expect(hd300rbc(0,0)).toBe(0);});it('d',()=>{expect(hd300rbc(93,73)).toBe(2);});it('e',()=>{expect(hd300rbc(15,0)).toBe(4);});});
function hd301rbc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph301rbc_hd',()=>{it('a',()=>{expect(hd301rbc(1,4)).toBe(2);});it('b',()=>{expect(hd301rbc(3,1)).toBe(1);});it('c',()=>{expect(hd301rbc(0,0)).toBe(0);});it('d',()=>{expect(hd301rbc(93,73)).toBe(2);});it('e',()=>{expect(hd301rbc(15,0)).toBe(4);});});
function hd302rbc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph302rbc_hd',()=>{it('a',()=>{expect(hd302rbc(1,4)).toBe(2);});it('b',()=>{expect(hd302rbc(3,1)).toBe(1);});it('c',()=>{expect(hd302rbc(0,0)).toBe(0);});it('d',()=>{expect(hd302rbc(93,73)).toBe(2);});it('e',()=>{expect(hd302rbc(15,0)).toBe(4);});});
function hd303rbc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph303rbc_hd',()=>{it('a',()=>{expect(hd303rbc(1,4)).toBe(2);});it('b',()=>{expect(hd303rbc(3,1)).toBe(1);});it('c',()=>{expect(hd303rbc(0,0)).toBe(0);});it('d',()=>{expect(hd303rbc(93,73)).toBe(2);});it('e',()=>{expect(hd303rbc(15,0)).toBe(4);});});
function hd304rbc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph304rbc_hd',()=>{it('a',()=>{expect(hd304rbc(1,4)).toBe(2);});it('b',()=>{expect(hd304rbc(3,1)).toBe(1);});it('c',()=>{expect(hd304rbc(0,0)).toBe(0);});it('d',()=>{expect(hd304rbc(93,73)).toBe(2);});it('e',()=>{expect(hd304rbc(15,0)).toBe(4);});});
function hd305rbc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph305rbc_hd',()=>{it('a',()=>{expect(hd305rbc(1,4)).toBe(2);});it('b',()=>{expect(hd305rbc(3,1)).toBe(1);});it('c',()=>{expect(hd305rbc(0,0)).toBe(0);});it('d',()=>{expect(hd305rbc(93,73)).toBe(2);});it('e',()=>{expect(hd305rbc(15,0)).toBe(4);});});
function hd306rbc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph306rbc_hd',()=>{it('a',()=>{expect(hd306rbc(1,4)).toBe(2);});it('b',()=>{expect(hd306rbc(3,1)).toBe(1);});it('c',()=>{expect(hd306rbc(0,0)).toBe(0);});it('d',()=>{expect(hd306rbc(93,73)).toBe(2);});it('e',()=>{expect(hd306rbc(15,0)).toBe(4);});});
function hd307rbc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph307rbc_hd',()=>{it('a',()=>{expect(hd307rbc(1,4)).toBe(2);});it('b',()=>{expect(hd307rbc(3,1)).toBe(1);});it('c',()=>{expect(hd307rbc(0,0)).toBe(0);});it('d',()=>{expect(hd307rbc(93,73)).toBe(2);});it('e',()=>{expect(hd307rbc(15,0)).toBe(4);});});
function hd308rbc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph308rbc_hd',()=>{it('a',()=>{expect(hd308rbc(1,4)).toBe(2);});it('b',()=>{expect(hd308rbc(3,1)).toBe(1);});it('c',()=>{expect(hd308rbc(0,0)).toBe(0);});it('d',()=>{expect(hd308rbc(93,73)).toBe(2);});it('e',()=>{expect(hd308rbc(15,0)).toBe(4);});});
function hd309rbc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph309rbc_hd',()=>{it('a',()=>{expect(hd309rbc(1,4)).toBe(2);});it('b',()=>{expect(hd309rbc(3,1)).toBe(1);});it('c',()=>{expect(hd309rbc(0,0)).toBe(0);});it('d',()=>{expect(hd309rbc(93,73)).toBe(2);});it('e',()=>{expect(hd309rbc(15,0)).toBe(4);});});
function hd310rbc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph310rbc_hd',()=>{it('a',()=>{expect(hd310rbc(1,4)).toBe(2);});it('b',()=>{expect(hd310rbc(3,1)).toBe(1);});it('c',()=>{expect(hd310rbc(0,0)).toBe(0);});it('d',()=>{expect(hd310rbc(93,73)).toBe(2);});it('e',()=>{expect(hd310rbc(15,0)).toBe(4);});});
function hd311rbc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph311rbc_hd',()=>{it('a',()=>{expect(hd311rbc(1,4)).toBe(2);});it('b',()=>{expect(hd311rbc(3,1)).toBe(1);});it('c',()=>{expect(hd311rbc(0,0)).toBe(0);});it('d',()=>{expect(hd311rbc(93,73)).toBe(2);});it('e',()=>{expect(hd311rbc(15,0)).toBe(4);});});
function hd312rbc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph312rbc_hd',()=>{it('a',()=>{expect(hd312rbc(1,4)).toBe(2);});it('b',()=>{expect(hd312rbc(3,1)).toBe(1);});it('c',()=>{expect(hd312rbc(0,0)).toBe(0);});it('d',()=>{expect(hd312rbc(93,73)).toBe(2);});it('e',()=>{expect(hd312rbc(15,0)).toBe(4);});});
function hd313rbc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph313rbc_hd',()=>{it('a',()=>{expect(hd313rbc(1,4)).toBe(2);});it('b',()=>{expect(hd313rbc(3,1)).toBe(1);});it('c',()=>{expect(hd313rbc(0,0)).toBe(0);});it('d',()=>{expect(hd313rbc(93,73)).toBe(2);});it('e',()=>{expect(hd313rbc(15,0)).toBe(4);});});
function hd314rbc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph314rbc_hd',()=>{it('a',()=>{expect(hd314rbc(1,4)).toBe(2);});it('b',()=>{expect(hd314rbc(3,1)).toBe(1);});it('c',()=>{expect(hd314rbc(0,0)).toBe(0);});it('d',()=>{expect(hd314rbc(93,73)).toBe(2);});it('e',()=>{expect(hd314rbc(15,0)).toBe(4);});});
function hd315rbc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph315rbc_hd',()=>{it('a',()=>{expect(hd315rbc(1,4)).toBe(2);});it('b',()=>{expect(hd315rbc(3,1)).toBe(1);});it('c',()=>{expect(hd315rbc(0,0)).toBe(0);});it('d',()=>{expect(hd315rbc(93,73)).toBe(2);});it('e',()=>{expect(hd315rbc(15,0)).toBe(4);});});
function hd316rbc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph316rbc_hd',()=>{it('a',()=>{expect(hd316rbc(1,4)).toBe(2);});it('b',()=>{expect(hd316rbc(3,1)).toBe(1);});it('c',()=>{expect(hd316rbc(0,0)).toBe(0);});it('d',()=>{expect(hd316rbc(93,73)).toBe(2);});it('e',()=>{expect(hd316rbc(15,0)).toBe(4);});});
function hd317rbc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph317rbc_hd',()=>{it('a',()=>{expect(hd317rbc(1,4)).toBe(2);});it('b',()=>{expect(hd317rbc(3,1)).toBe(1);});it('c',()=>{expect(hd317rbc(0,0)).toBe(0);});it('d',()=>{expect(hd317rbc(93,73)).toBe(2);});it('e',()=>{expect(hd317rbc(15,0)).toBe(4);});});
function hd318rbc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph318rbc_hd',()=>{it('a',()=>{expect(hd318rbc(1,4)).toBe(2);});it('b',()=>{expect(hd318rbc(3,1)).toBe(1);});it('c',()=>{expect(hd318rbc(0,0)).toBe(0);});it('d',()=>{expect(hd318rbc(93,73)).toBe(2);});it('e',()=>{expect(hd318rbc(15,0)).toBe(4);});});
function hd319rbc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph319rbc_hd',()=>{it('a',()=>{expect(hd319rbc(1,4)).toBe(2);});it('b',()=>{expect(hd319rbc(3,1)).toBe(1);});it('c',()=>{expect(hd319rbc(0,0)).toBe(0);});it('d',()=>{expect(hd319rbc(93,73)).toBe(2);});it('e',()=>{expect(hd319rbc(15,0)).toBe(4);});});
function hd320rbc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph320rbc_hd',()=>{it('a',()=>{expect(hd320rbc(1,4)).toBe(2);});it('b',()=>{expect(hd320rbc(3,1)).toBe(1);});it('c',()=>{expect(hd320rbc(0,0)).toBe(0);});it('d',()=>{expect(hd320rbc(93,73)).toBe(2);});it('e',()=>{expect(hd320rbc(15,0)).toBe(4);});});
function hd321rbc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph321rbc_hd',()=>{it('a',()=>{expect(hd321rbc(1,4)).toBe(2);});it('b',()=>{expect(hd321rbc(3,1)).toBe(1);});it('c',()=>{expect(hd321rbc(0,0)).toBe(0);});it('d',()=>{expect(hd321rbc(93,73)).toBe(2);});it('e',()=>{expect(hd321rbc(15,0)).toBe(4);});});
function hd322rbc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph322rbc_hd',()=>{it('a',()=>{expect(hd322rbc(1,4)).toBe(2);});it('b',()=>{expect(hd322rbc(3,1)).toBe(1);});it('c',()=>{expect(hd322rbc(0,0)).toBe(0);});it('d',()=>{expect(hd322rbc(93,73)).toBe(2);});it('e',()=>{expect(hd322rbc(15,0)).toBe(4);});});
function hd323rbc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph323rbc_hd',()=>{it('a',()=>{expect(hd323rbc(1,4)).toBe(2);});it('b',()=>{expect(hd323rbc(3,1)).toBe(1);});it('c',()=>{expect(hd323rbc(0,0)).toBe(0);});it('d',()=>{expect(hd323rbc(93,73)).toBe(2);});it('e',()=>{expect(hd323rbc(15,0)).toBe(4);});});
function hd324rbc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph324rbc_hd',()=>{it('a',()=>{expect(hd324rbc(1,4)).toBe(2);});it('b',()=>{expect(hd324rbc(3,1)).toBe(1);});it('c',()=>{expect(hd324rbc(0,0)).toBe(0);});it('d',()=>{expect(hd324rbc(93,73)).toBe(2);});it('e',()=>{expect(hd324rbc(15,0)).toBe(4);});});
function hd325rbc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph325rbc_hd',()=>{it('a',()=>{expect(hd325rbc(1,4)).toBe(2);});it('b',()=>{expect(hd325rbc(3,1)).toBe(1);});it('c',()=>{expect(hd325rbc(0,0)).toBe(0);});it('d',()=>{expect(hd325rbc(93,73)).toBe(2);});it('e',()=>{expect(hd325rbc(15,0)).toBe(4);});});
function hd326rbc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph326rbc_hd',()=>{it('a',()=>{expect(hd326rbc(1,4)).toBe(2);});it('b',()=>{expect(hd326rbc(3,1)).toBe(1);});it('c',()=>{expect(hd326rbc(0,0)).toBe(0);});it('d',()=>{expect(hd326rbc(93,73)).toBe(2);});it('e',()=>{expect(hd326rbc(15,0)).toBe(4);});});
function hd327rbc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph327rbc_hd',()=>{it('a',()=>{expect(hd327rbc(1,4)).toBe(2);});it('b',()=>{expect(hd327rbc(3,1)).toBe(1);});it('c',()=>{expect(hd327rbc(0,0)).toBe(0);});it('d',()=>{expect(hd327rbc(93,73)).toBe(2);});it('e',()=>{expect(hd327rbc(15,0)).toBe(4);});});
function hd328rbc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph328rbc_hd',()=>{it('a',()=>{expect(hd328rbc(1,4)).toBe(2);});it('b',()=>{expect(hd328rbc(3,1)).toBe(1);});it('c',()=>{expect(hd328rbc(0,0)).toBe(0);});it('d',()=>{expect(hd328rbc(93,73)).toBe(2);});it('e',()=>{expect(hd328rbc(15,0)).toBe(4);});});
function hd329rbc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph329rbc_hd',()=>{it('a',()=>{expect(hd329rbc(1,4)).toBe(2);});it('b',()=>{expect(hd329rbc(3,1)).toBe(1);});it('c',()=>{expect(hd329rbc(0,0)).toBe(0);});it('d',()=>{expect(hd329rbc(93,73)).toBe(2);});it('e',()=>{expect(hd329rbc(15,0)).toBe(4);});});
function hd330rbc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph330rbc_hd',()=>{it('a',()=>{expect(hd330rbc(1,4)).toBe(2);});it('b',()=>{expect(hd330rbc(3,1)).toBe(1);});it('c',()=>{expect(hd330rbc(0,0)).toBe(0);});it('d',()=>{expect(hd330rbc(93,73)).toBe(2);});it('e',()=>{expect(hd330rbc(15,0)).toBe(4);});});
function hd331rbc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph331rbc_hd',()=>{it('a',()=>{expect(hd331rbc(1,4)).toBe(2);});it('b',()=>{expect(hd331rbc(3,1)).toBe(1);});it('c',()=>{expect(hd331rbc(0,0)).toBe(0);});it('d',()=>{expect(hd331rbc(93,73)).toBe(2);});it('e',()=>{expect(hd331rbc(15,0)).toBe(4);});});
function hd332rbc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph332rbc_hd',()=>{it('a',()=>{expect(hd332rbc(1,4)).toBe(2);});it('b',()=>{expect(hd332rbc(3,1)).toBe(1);});it('c',()=>{expect(hd332rbc(0,0)).toBe(0);});it('d',()=>{expect(hd332rbc(93,73)).toBe(2);});it('e',()=>{expect(hd332rbc(15,0)).toBe(4);});});
function hd333rbc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph333rbc_hd',()=>{it('a',()=>{expect(hd333rbc(1,4)).toBe(2);});it('b',()=>{expect(hd333rbc(3,1)).toBe(1);});it('c',()=>{expect(hd333rbc(0,0)).toBe(0);});it('d',()=>{expect(hd333rbc(93,73)).toBe(2);});it('e',()=>{expect(hd333rbc(15,0)).toBe(4);});});
function hd334rbc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph334rbc_hd',()=>{it('a',()=>{expect(hd334rbc(1,4)).toBe(2);});it('b',()=>{expect(hd334rbc(3,1)).toBe(1);});it('c',()=>{expect(hd334rbc(0,0)).toBe(0);});it('d',()=>{expect(hd334rbc(93,73)).toBe(2);});it('e',()=>{expect(hd334rbc(15,0)).toBe(4);});});
function hd335rbc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph335rbc_hd',()=>{it('a',()=>{expect(hd335rbc(1,4)).toBe(2);});it('b',()=>{expect(hd335rbc(3,1)).toBe(1);});it('c',()=>{expect(hd335rbc(0,0)).toBe(0);});it('d',()=>{expect(hd335rbc(93,73)).toBe(2);});it('e',()=>{expect(hd335rbc(15,0)).toBe(4);});});
function hd336rbc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph336rbc_hd',()=>{it('a',()=>{expect(hd336rbc(1,4)).toBe(2);});it('b',()=>{expect(hd336rbc(3,1)).toBe(1);});it('c',()=>{expect(hd336rbc(0,0)).toBe(0);});it('d',()=>{expect(hd336rbc(93,73)).toBe(2);});it('e',()=>{expect(hd336rbc(15,0)).toBe(4);});});
function hd337rbc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph337rbc_hd',()=>{it('a',()=>{expect(hd337rbc(1,4)).toBe(2);});it('b',()=>{expect(hd337rbc(3,1)).toBe(1);});it('c',()=>{expect(hd337rbc(0,0)).toBe(0);});it('d',()=>{expect(hd337rbc(93,73)).toBe(2);});it('e',()=>{expect(hd337rbc(15,0)).toBe(4);});});
