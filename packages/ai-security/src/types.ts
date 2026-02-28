export interface InjectionResult {
  threat: boolean;
  patterns: string[];
  severity: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  sanitized: string;
  threatTypes: string[];
}

export interface DriftConfig {
  baselineWindow: number;
  alertThreshold: number;
  criticalThreshold: number;
  minSamples: number;
}

export interface DriftMetrics {
  mean: number;
  stdDev: number;
  min: number;
  max: number;
  sampleCount: number;
  upperControlLimit: number;
  lowerControlLimit: number;
}

export interface DriftAlert {
  type: 'DRIFT_DETECTED' | 'CONTROL_LIMIT_BREACH' | 'DEGRADATION' | 'IMPROVEMENT';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  metric: string;
  currentValue: number;
  baselineValue: number;
  deviationPercent: number;
  message: string;
  timestamp: Date;
}

export type AIThreatType =
  | 'PROMPT_INJECTION'
  | 'API_KEY_THEFT'
  | 'MODEL_DRIFT'
  | 'DATA_POISONING'
  | 'MODEL_INVERSION'
  | 'ADVERSARIAL_INPUT'
  | 'UNAUTHORIZED_ACCESS'
  | 'COST_ABUSE'
  | 'HALLUCINATION'
  | 'UNKNOWN';

export interface ThreatScore {
  type: AIThreatType;
  score: number;
  confidence: number;
  indicators: string[];
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  action: 'ALLOW' | 'MONITOR' | 'CHALLENGE' | 'BLOCK';
}

export interface KeyRecord {
  id: string;
  service: string;
  environment: 'development' | 'staging' | 'production';
  keyHash: string;
  createdAt: Date;
  expiresAt: Date;
  lastRotatedAt: Date;
  isActive: boolean;
  accessCount: number;
  rotationCount: number;
}

export interface KeyRotationPolicy {
  service: string;
  rotationDays: number;
  alertDaysBeforeExpiry: number;
  autoRotate: boolean;
}

export interface VaultConfig {
  rotationDays: number;
  maxKeysPerService: number;
  requireEncryption: boolean;
}
