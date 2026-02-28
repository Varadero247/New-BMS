export type ThreatType =
  | 'PROMPT_INJECTION'
  | 'CODE_INJECTION'
  | 'DATA_EXFILTRATION'
  | 'SYSTEM_OVERRIDE'
  | 'PII_EXPOSURE'
  | 'EXCESSIVE_LENGTH';

export interface ValidationResult {
  isValid: boolean;
  threats: Array<{ type: ThreatType; pattern: string; severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' }>;
  sanitizedInput: string;
  piiDetected: boolean;
  piiTypes: string[];
}

export class InputValidator {
  private readonly MAX_INPUT_LENGTH: number;

  private readonly INJECTION_PATTERNS: Array<{ pattern: RegExp; type: ThreatType; severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' }> = [
    { pattern: /ignore\s+(all\s+)?(previous|all|above)\s+(previous\s+)?instructions?/i, type: 'PROMPT_INJECTION', severity: 'CRITICAL' },
    { pattern: /disregard\s+(previous|all|above|your)/i, type: 'PROMPT_INJECTION', severity: 'CRITICAL' },
    { pattern: /you\s+are\s+now\s+(a|an|the)\s+/i, type: 'SYSTEM_OVERRIDE', severity: 'CRITICAL' },
    { pattern: /forget\s+(everything|all|your\s+previous)/i, type: 'PROMPT_INJECTION', severity: 'CRITICAL' },
    { pattern: /new\s+(system\s+)?prompt:/i, type: 'SYSTEM_OVERRIDE', severity: 'CRITICAL' },
    { pattern: /\[system\]/i, type: 'SYSTEM_OVERRIDE', severity: 'HIGH' },
    { pattern: /act\s+as\s+(if\s+you\s+were|a)\s+/i, type: 'SYSTEM_OVERRIDE', severity: 'HIGH' },
    { pattern: /pretend\s+(you\s+are|to\s+be)/i, type: 'SYSTEM_OVERRIDE', severity: 'HIGH' },
    { pattern: /jailbreak/i, type: 'PROMPT_INJECTION', severity: 'CRITICAL' },
    { pattern: /dan\s+mode/i, type: 'PROMPT_INJECTION', severity: 'CRITICAL' },
    { pattern: /<script[^>]*>/i, type: 'CODE_INJECTION', severity: 'HIGH' },
    { pattern: /javascript\s*:/i, type: 'CODE_INJECTION', severity: 'HIGH' },
    { pattern: /on(load|error|click|submit)\s*=/i, type: 'CODE_INJECTION', severity: 'MEDIUM' },
    { pattern: /eval\s*\(/i, type: 'CODE_INJECTION', severity: 'HIGH' },
    { pattern: /exec\s*\(/i, type: 'CODE_INJECTION', severity: 'HIGH' },
    { pattern: /send\s+(to|email|via)\s+[\w.\-]+@[\w.\-]+/i, type: 'DATA_EXFILTRATION', severity: 'CRITICAL' },
    { pattern: /export\s+(all|every|the\s+entire)\s+(data|records?|database)/i, type: 'DATA_EXFILTRATION', severity: 'CRITICAL' },
    { pattern: /list\s+all\s+(users?|records?|data|passwords?|keys?)/i, type: 'DATA_EXFILTRATION', severity: 'HIGH' },
    { pattern: /dump\s+(the\s+)?(entire\s+)?(database|tables?|schema)/i, type: 'DATA_EXFILTRATION', severity: 'CRITICAL' },
  ];

  private readonly PII_PATTERNS: Array<{ pattern: RegExp; type: string }> = [
    { pattern: /\b\d{3}-\d{2}-\d{4}\b/, type: 'SSN' },
    { pattern: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/, type: 'CREDIT_CARD' },
    { pattern: /password\s*[:=]\s*\S+/i, type: 'PASSWORD' },
    { pattern: /api[_-]?key\s*[:=]\s*\S+/i, type: 'API_KEY' },
    { pattern: /secret\s*[:=]\s*\S+/i, type: 'SECRET' },
    { pattern: /token\s*[:=]\s*[a-zA-Z0-9+/=]{20,}/i, type: 'TOKEN' },
  ];

  constructor(maxInputLength = 50000) {
    this.MAX_INPUT_LENGTH = maxInputLength;
  }

  validate(input: string): ValidationResult {
    const threats: ValidationResult['threats'] = [];
    const piiTypes: string[] = [];

    if (input.length > this.MAX_INPUT_LENGTH) {
      threats.push({ type: 'EXCESSIVE_LENGTH', pattern: 'length_exceeded', severity: 'MEDIUM' });
    }

    for (const { pattern, type, severity } of this.INJECTION_PATTERNS) {
      if (pattern.test(input)) {
        threats.push({ type, pattern: pattern.source, severity });
      }
    }

    for (const { pattern, type } of this.PII_PATTERNS) {
      if (pattern.test(input)) {
        piiTypes.push(type);
      }
    }

    return {
      isValid: threats.filter(t => t.severity === 'CRITICAL' || t.severity === 'HIGH').length === 0,
      threats,
      sanitizedInput: this.sanitize(input),
      piiDetected: piiTypes.length > 0,
      piiTypes,
    };
  }

  sanitize(input: string): string {
    return input
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '[REMOVED:SCRIPT]')
      .replace(/javascript\s*:/gi, '[REMOVED:JS]')
      .replace(/on(load|error|click|submit)\s*=\s*["'][^"']*["']/gi, '[REMOVED:EVENT]')
      .slice(0, this.MAX_INPUT_LENGTH);
  }

  containsHighSeverityThreat(result: ValidationResult): boolean {
    return result.threats.some(t => t.severity === 'CRITICAL' || t.severity === 'HIGH');
  }
}
