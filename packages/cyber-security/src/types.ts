export interface LoginAttemptResult {
  allowed: boolean;
  failedAttempts: number;
  lockedUntil?: Date;
  reason?: string;
}

export interface PasswordValidationResult {
  isValid: boolean;
  score: number; // 0-100
  errors: string[];
  suggestions: string[];
}

export interface PhishingCheckResult {
  isSuspicious: boolean;
  threats: string[];
  riskScore: number;
}

export interface URLReputationResult {
  isPhishing: boolean;
  isSpoofed: boolean;
  hasValidSSL: boolean;
  reasons: string[];
}

export interface EmailAuthResult {
  spfValid: boolean;
  dkimValid: boolean;
  dmarcValid: boolean;
  isAuthentic: boolean;
}

export interface SessionConfig {
  idLength: number;
  expiryMs: number;
  absoluteExpiryMs: number;
  bindToIP: boolean;
  bindToUserAgent: boolean;
}

export interface Session {
  id: string;
  userId: string;
  ipHash: string;
  userAgentHash: string;
  createdAt: Date;
  expiresAt: Date;
  absoluteExpiresAt: Date;
  isActive: boolean;
  rotationCount: number;
}

export interface SessionValidationResult {
  valid: boolean;
  reason?: string;
  session?: Session;
}

export type RiskAction = 'ALLOW' | 'NOTIFY' | 'CHALLENGE' | 'BLOCK';

export interface RiskAssessment {
  score: number; // 0-100
  level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  action: RiskAction;
  factors: string[];
}

export interface LoginRecord {
  userId: string;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  success: boolean;
  country?: string;
}

export interface ZeroTrustContext {
  userId: string;
  resourceId: string;
  action: string;
  ipAddress: string;
  userAgent: string;
  mfaVerified: boolean;
  sessionAge: number; // ms
  previousFailures: number;
}

export interface TrustDecision {
  allowed: boolean;
  trustScore: number; // 0-100
  requiredActions: string[];
  reason: string;
}
