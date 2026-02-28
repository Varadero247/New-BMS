export interface SecureAIRequest {
  useCase: string;
  userId: string;
  tenantId: string;
  input: Record<string, unknown>;
  requiresApproval?: boolean;
  confidenceThreshold?: number;
  maxTokens?: number;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
}

export interface SecureAIResponse {
  output: unknown;
  confidence: number;
  validationPassed: boolean;
  requiresHumanReview: boolean;
  auditId: string;
  processingTimeMs: number;
  tokensUsed: number;
  warnings: string[];
  errors: string[];
}

export interface SecurityIncident {
  type: ThreatEvent;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  userId?: string;
  tenantId?: string;
  details: Record<string, unknown>;
  timestamp: Date;
}

export type ThreatEvent =
  | 'PROMPT_INJECTION_ATTEMPT'
  | 'RATE_LIMIT_EXCEEDED'
  | 'INPUT_TOO_LARGE'
  | 'OUTPUT_VALIDATION_FAILED'
  | 'HALLUCINATION_DETECTED'
  | 'PII_DETECTED'
  | 'API_KEY_MISSING'
  | 'AI_API_ERROR'
  | 'TIMEOUT'
  | 'CONFIDENCE_BELOW_THRESHOLD';

export interface ContainerConfig {
  modelVersion: string;
  maxInputLength: number;
  maxRetries: number;
  timeoutMs: number;
  rateLimitPerUserPerHour: number;
  rateLimitPerTenantPerDay: number;
  confidenceThreshold: number;
  requiresApprovalThreshold: number;
  enablePIIDetection: boolean;
  enableHallucinationDetection: boolean;
  enableImmutableLogging: boolean;
}

export const DEFAULT_CONFIG: ContainerConfig = {
  modelVersion: 'claude-sonnet-4-20250514',
  maxInputLength: 50000,
  maxRetries: 3,
  timeoutMs: 30000,
  rateLimitPerUserPerHour: 100,
  rateLimitPerTenantPerDay: 1000,
  confidenceThreshold: 0.7,
  requiresApprovalThreshold: 0.85,
  enablePIIDetection: true,
  enableHallucinationDetection: true,
  enableImmutableLogging: true,
};
