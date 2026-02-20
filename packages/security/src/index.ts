export {
  createRasp,
  scanValue,
  scanRequest,
  type RaspOptions,
  type RaspThreat,
  type RaspThreatType,
} from './rasp';

export {
  buildProfile,
  detectAnomaly,
  BehaviorProfileStore,
  type ActivityEvent,
  type BehaviorProfile,
  type AnomalyResult,
  type AnomalyLevel,
} from './behavioral-analytics';

export {
  SiemEngine,
  globalSiem,
  DEFAULT_RULES,
  type SiemEvent,
  type SiemRule,
  type SiemAlert,
  type SiemEventType,
  type AlertSeverity,
  type RuleType,
  type SiemEngineOptions,
} from './siem';

export {
  encryptEnvelope,
  decryptEnvelope,
  decryptEnvelopeToString,
  rotateKek,
  deriveKey,
  type EncryptedEnvelope,
  type EnvelopeOptions,
  type KeyRotationResult,
} from './envelope-encryption';

export {
  createCredentialScanner,
  scan,
  scanString,
  deepScanValue,
  type CredentialType,
  type CredentialMatch,
  type ScanResult,
  type CredentialScannerOptions,
} from './credential-scanner';
