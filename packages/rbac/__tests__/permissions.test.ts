import {
  resolvePermissions,
  hasPermission,
  mergePermissions,
  mapLegacyRole,
} from '../src/permissions';
import { PermissionLevel } from '../src/types';
import { PLATFORM_ROLES, getRoleById, getRolesByIds } from '../src/roles';

describe('RBAC Permissions', () => {
  describe('resolvePermissions', () => {
    it('resolves super-admin to FULL on all modules', () => {
      const resolved = resolvePermissions(['super-admin']);
      expect(resolved.modules['health-safety']).toBe(PermissionLevel.FULL);
      expect(resolved.modules['finance']).toBe(PermissionLevel.FULL);
      expect(resolved.modules['dashboard']).toBe(PermissionLevel.FULL);
    });

    it('resolves viewer to VIEW on dashboard only, NONE on others', () => {
      const resolved = resolvePermissions(['viewer']);
      expect(resolved.modules['dashboard']).toBe(PermissionLevel.VIEW);
      expect(resolved.modules['finance']).toBe(PermissionLevel.NONE);
      expect(resolved.modules['hr']).toBe(PermissionLevel.NONE);
    });

    it('resolves finance-manager permissions correctly', () => {
      const resolved = resolvePermissions(['finance-manager']);
      expect(resolved.modules['finance']).toBe(PermissionLevel.FULL);
      expect(resolved.modules['payroll']).toBe(PermissionLevel.APPROVE);
      expect(resolved.modules['reports']).toBe(PermissionLevel.FULL);
      expect(resolved.modules['inventory']).toBe(PermissionLevel.EDIT);
    });

    it('resolves accountant permissions correctly', () => {
      const resolved = resolvePermissions(['accountant']);
      expect(resolved.modules['finance']).toBe(PermissionLevel.EDIT);
      expect(resolved.modules['reports']).toBe(PermissionLevel.VIEW);
    });

    it('returns NONE for unknown roles', () => {
      const resolved = resolvePermissions(['nonexistent-role']);
      expect(resolved.modules['finance']).toBe(PermissionLevel.NONE);
    });

    it('handles empty role array', () => {
      const resolved = resolvePermissions([]);
      expect(resolved.modules['finance']).toBe(PermissionLevel.NONE);
      expect(resolved.roles).toEqual([]);
    });
  });

  describe('hasPermission', () => {
    it('returns true when user has sufficient permission', () => {
      const resolved = resolvePermissions(['finance-manager']);
      expect(hasPermission(resolved, 'finance', PermissionLevel.EDIT)).toBe(true);
      expect(hasPermission(resolved, 'finance', PermissionLevel.FULL)).toBe(true);
    });

    it('returns false when user lacks permission', () => {
      const resolved = resolvePermissions(['viewer']);
      expect(hasPermission(resolved, 'finance', PermissionLevel.EDIT)).toBe(false);
    });

    it('VIEW level is satisfied by VIEW permission', () => {
      const resolved = resolvePermissions(['viewer']);
      expect(hasPermission(resolved, 'dashboard', PermissionLevel.VIEW)).toBe(true);
    });
  });

  describe('mergePermissions', () => {
    it('takes the most permissive level from each role', () => {
      const a = resolvePermissions(['hs-officer']);
      const b = resolvePermissions(['accountant']);
      const merged = mergePermissions(a, b);

      // hs-officer has EDIT on health-safety; accountant has EDIT on finance
      expect(merged.modules['health-safety']).toBe(PermissionLevel.EDIT);
      expect(merged.modules['finance']).toBe(PermissionLevel.EDIT);
    });

    it('deduplicates role arrays', () => {
      const a = resolvePermissions(['viewer']);
      const b = resolvePermissions(['viewer']);
      const merged = mergePermissions(a, b);
      expect(merged.roles).toEqual(['viewer']);
    });
  });

  describe('mapLegacyRole', () => {
    it('maps ADMIN to org-admin', () => {
      expect(mapLegacyRole('ADMIN')).toEqual(['org-admin']);
    });

    it('maps MANAGER to compliance-director', () => {
      expect(mapLegacyRole('MANAGER')).toEqual(['compliance-director']);
    });

    it('maps USER to employee', () => {
      expect(mapLegacyRole('USER')).toEqual(['employee']);
    });

    it('maps VIEWER to viewer', () => {
      expect(mapLegacyRole('VIEWER')).toEqual(['viewer']);
    });

    it('defaults unknown roles to viewer', () => {
      expect(mapLegacyRole('UNKNOWN')).toEqual(['viewer']);
    });
  });

  describe('multi-role resolution', () => {
    it('combines hs-officer + accountant permissions', () => {
      const resolved = resolvePermissions(['hs-officer', 'accountant']);
      expect(resolved.modules['health-safety']).toBe(PermissionLevel.EDIT);
      expect(resolved.modules['finance']).toBe(PermissionLevel.EDIT);
    });

    it('finance-manager + hr-manager gives FULL on both', () => {
      const resolved = resolvePermissions(['finance-manager', 'hr-manager']);
      expect(resolved.modules['finance']).toBe(PermissionLevel.FULL);
      expect(resolved.modules['hr']).toBe(PermissionLevel.FULL);
    });
  });

  describe('PLATFORM_ROLES', () => {
    it('has 44 roles', () => {
      expect(PLATFORM_ROLES.length).toBe(44);
    });

    it('all roles have isSystem=true', () => {
      PLATFORM_ROLES.forEach((role) => {
        expect(role.isSystem).toBe(true);
      });
    });

    it('all roles have unique IDs', () => {
      const ids = PLATFORM_ROLES.map((r) => r.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('getRoleById returns correct role', () => {
      const role = getRoleById('super-admin');
      expect(role).toBeDefined();
      expect(role!.name).toBe('Super Administrator');
    });

    it('getRoleById returns undefined for unknown role', () => {
      expect(getRoleById('nonexistent')).toBeUndefined();
    });

    it('getRolesByIds filters unknown roles', () => {
      const roles = getRolesByIds(['super-admin', 'nonexistent', 'viewer']);
      expect(roles).toHaveLength(2);
    });
  });
});
