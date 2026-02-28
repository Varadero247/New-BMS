export { CredentialProtectionService } from './credential-protection';
export { PhishingProtectionService } from './phishing-protection';
export { SessionSecurityService } from './session-security';
export { AnomalyDetector } from './anomaly-detector';
export { ZeroTrustVerifier } from './zero-trust';
export type {
  LoginAttemptResult, PasswordValidationResult,
  PhishingCheckResult, URLReputationResult, EmailAuthResult,
  SessionConfig, Session, SessionValidationResult,
  RiskAssessment, RiskAction, LoginRecord,
  ZeroTrustContext, TrustDecision,
} from './types';
