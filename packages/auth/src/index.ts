// Types
export type { AuthRequest, JWTPayload, TokenPair } from './types';

// JWT utilities
export {
  generateToken,
  generateRefreshToken,
  verifyToken,
  verifyRefreshToken,
  decodeToken,
  getTokenExpiry,
} from './jwt';

// Password utilities
export {
  hashPassword,
  comparePassword,
  validatePasswordStrength,
} from './password';

// Express middleware
export {
  authenticate,
  requireRole,
  optionalAuth,
} from './middleware';
