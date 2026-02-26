// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
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

// Advanced auth features
export { JwtKeyRotationManager, jwtKeyManager, type JwtKeyRecord } from './jwt-rotation';
export {
  generateMagicLink,
  verifyMagicLinkToken,
  hashMagicLinkToken,
  InMemoryMagicLinkStore,
  type MagicLinkRecord,
  type MagicLinkOptions,
} from './magic-link';
export {
  assessLoginRisk,
  riskScoreToAction,
  type LoginContext,
  type RiskAssessment,
  type RiskFactor,
  type RiskAction,
} from './adaptive-auth';
export {
  continuousVerification,
  InMemoryRevocationList,
  type ContinuousVerificationOptions,
} from './continuous-verification';

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
