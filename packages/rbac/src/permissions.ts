import { PermissionLevel, ImsModule, ResolvedPermissions } from './types';
import { getRolesByIds, PLATFORM_ROLES } from './roles';

const ALL_MODULES: ImsModule[] = [
  'health-safety', 'environment', 'quality', 'hr', 'payroll',
  'inventory', 'workflows', 'project-management', 'automotive',
  'medical', 'aerospace', 'finance', 'crm', 'infosec',
  'esg', 'cmms', 'portal', 'food-safety', 'energy',
  'analytics', 'field-service', 'iso42001', 'iso37001',
  'ai', 'settings', 'templates', 'reports', 'dashboard',
];

export function resolvePermissions(roleIds: string[]): ResolvedPermissions {
  const modules = {} as Record<ImsModule, PermissionLevel>;

  // Default: NONE for all modules
  for (const mod of ALL_MODULES) {
    modules[mod] = PermissionLevel.NONE;
  }

  const roles = getRolesByIds(roleIds);

  // Most permissive wins (merge across roles)
  for (const role of roles) {
    for (const perm of role.permissions) {
      if (perm.level > modules[perm.module]) {
        modules[perm.module] = perm.level;
      }
    }
  }

  return { roles: roleIds, modules };
}

export function hasPermission(
  resolved: ResolvedPermissions,
  module: ImsModule,
  requiredLevel: PermissionLevel
): boolean {
  const userLevel = resolved.modules[module] ?? PermissionLevel.NONE;
  return userLevel >= requiredLevel;
}

export function mergePermissions(
  a: ResolvedPermissions,
  b: ResolvedPermissions
): ResolvedPermissions {
  const modules = {} as Record<ImsModule, PermissionLevel>;

  for (const mod of ALL_MODULES) {
    const levelA = a.modules[mod] ?? PermissionLevel.NONE;
    const levelB = b.modules[mod] ?? PermissionLevel.NONE;
    modules[mod] = Math.max(levelA, levelB) as PermissionLevel;
  }

  return {
    roles: [...new Set([...a.roles, ...b.roles])],
    modules,
  };
}

export function mapLegacyRole(role: string): string[] {
  switch (role) {
    case 'ADMIN': return ['org-admin'];
    case 'MANAGER': return ['compliance-director'];
    case 'USER': return ['employee'];
    case 'VIEWER': return ['viewer'];
    default: return ['viewer'];
  }
}
