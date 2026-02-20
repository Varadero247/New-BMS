// Types
export type { AuthRequest, JWTPayload, TokenPair } from './types';

// JWT utilities
export {
  generateToken,
  generateRefreshToken,
  generateTokenPair,
  verifyToken,
  verifyRefreshToken,
  decodeToken,
  getTokenExpiry,
  refreshAccessToken,
  type TokenPairResult,
} from './jwt';

// Password utilities
export { hashPassword, comparePassword, validatePasswordStrength } from './password';

// Express middleware
export { authenticate, requireRole, optionalAuth, writeRoleGuard } from './middleware';

// RBAC (re-exported from @ims/rbac)
export {
  requirePermission,
  requireOwnership,
  attachPermissions,
  PermissionLevel,
  type ImsModule,
  type ModulePermissions,
  type RoleDefinition,
  type ResolvedPermissions,
} from '@ims/rbac';
