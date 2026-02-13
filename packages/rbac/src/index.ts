// Types
export {
  PermissionLevel,
  type ImsModule,
  type ModulePermissions,
  type RoleDefinition,
  type ResolvedPermissions,
  type RBACUser,
} from './types';

// Roles
export {
  PLATFORM_ROLES,
  getRoleById,
  getRolesByIds,
} from './roles';

// Permissions
export {
  resolvePermissions,
  hasPermission,
  mergePermissions,
  mapLegacyRole,
} from './permissions';

// Express Middleware
export {
  requirePermission,
  requireOwnership,
  attachPermissions,
} from './middleware';

// Ownership Scope
export {
  scopeByPermission,
  ownershipFilter,
} from './ownership-scope';
