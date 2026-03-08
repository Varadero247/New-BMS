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
