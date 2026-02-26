// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
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
export { PLATFORM_ROLES, getRoleById, getRolesByIds } from './roles';

// Permissions
export { resolvePermissions, hasPermission, mergePermissions, mapLegacyRole } from './permissions';

// Express Middleware
export { requirePermission, requireOwnership, attachPermissions } from './middleware';

// Ownership Scope
export { scopeByPermission, ownershipFilter } from './ownership-scope';
