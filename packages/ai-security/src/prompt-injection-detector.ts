import { InjectionResult } from './types';

interface PatternRule {
  pattern: RegExp;
  type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  weight: number;
}

export class PromptInjectionDetector {
  private readonly rules: PatternRule[] = [
    { pattern: /ignore\s+(all\s+)?(previous|all|above)\s+(previous\s+)?instructions?/i, type: 'SYSTEM_OVERRIDE', severity: 'CRITICAL', weight: 10 },
    { pattern: /disregard\s+(previous|all|your)/i, type: 'SYSTEM_OVERRIDE', severity: 'CRITICAL', weight: 10 },
    { pattern: /you\s+are\s+now\s+(a|an|the)\s+/i, type: 'SYSTEM_OVERRIDE', severity: 'CRITICAL', weight: 9 },
    { pattern: /forget\s+(everything|all|previous)/i, type: 'SYSTEM_OVERRIDE', severity: 'CRITICAL', weight: 9 },
    { pattern: /new\s+(system\s+)?prompt:/i, type: 'SYSTEM_OVERRIDE', severity: 'CRITICAL', weight: 10 },
    { pattern: /\[system\]/i, type: 'SYSTEM_OVERRIDE', severity: 'HIGH', weight: 7 },
    { pattern: /override\s+(safety|guidelines|restrictions)/i, type: 'SYSTEM_OVERRIDE', severity: 'CRITICAL', weight: 10 },
    { pattern: /jailbreak/i, type: 'JAILBREAK', severity: 'CRITICAL', weight: 10 },
    { pattern: /dan\s+mode/i, type: 'JAILBREAK', severity: 'CRITICAL', weight: 10 },
    { pattern: /developer\s+mode/i, type: 'JAILBREAK', severity: 'HIGH', weight: 8 },
    { pattern: /act\s+as\s+(if|a|an)\s+/i, type: 'ROLEPLAY_INJECTION', severity: 'HIGH', weight: 7 },
    { pattern: /pretend\s+(you\s+are|to\s+be)/i, type: 'ROLEPLAY_INJECTION', severity: 'HIGH', weight: 7 },
    { pattern: /simulate\s+(being|a)\s+/i, type: 'ROLEPLAY_INJECTION', severity: 'MEDIUM', weight: 5 },
    { pattern: /roleplay\s+as\s+/i, type: 'ROLEPLAY_INJECTION', severity: 'MEDIUM', weight: 5 },
    { pattern: /<script[^>]*>/i, type: 'CODE_INJECTION', severity: 'HIGH', weight: 8 },
    { pattern: /javascript\s*:/i, type: 'CODE_INJECTION', severity: 'HIGH', weight: 8 },
    { pattern: /eval\s*\(/i, type: 'CODE_INJECTION', severity: 'HIGH', weight: 8 },
    { pattern: /exec\s*\(/i, type: 'CODE_INJECTION', severity: 'HIGH', weight: 8 },
    { pattern: /on(load|error|click|submit)\s*=/i, type: 'CODE_INJECTION', severity: 'MEDIUM', weight: 6 },
    { pattern: /\$\{[^}]+\}/i, type: 'CODE_INJECTION', severity: 'MEDIUM', weight: 5 },
    { pattern: /send\s+(to|email|via)\s+[\w.\-]+@[\w.\-]+/i, type: 'DATA_EXFILTRATION', severity: 'CRITICAL', weight: 10 },
    { pattern: /export\s+(all|every)\s+(data|records?|database)/i, type: 'DATA_EXFILTRATION', severity: 'CRITICAL', weight: 10 },
    { pattern: /list\s+all\s+(users?|records?|passwords?|keys?)/i, type: 'DATA_EXFILTRATION', severity: 'HIGH', weight: 8 },
    { pattern: /dump\s+(the\s+)?(entire\s+)?(database|tables?|schema)/i, type: 'DATA_EXFILTRATION', severity: 'CRITICAL', weight: 10 },
    { pattern: /reveal\s+(all\s+)?(your\s+|the\s+)?(secrets?|data|keys?)/i, type: 'DATA_EXFILTRATION', severity: 'CRITICAL', weight: 10 },
    { pattern: /repeat\s+(your\s+)?(training|system)\s+prompt/i, type: 'TRAINING_EXTRACTION', severity: 'HIGH', weight: 8 },
    { pattern: /what\s+(was|were)\s+you\s+trained\s+on/i, type: 'TRAINING_EXTRACTION', severity: 'MEDIUM', weight: 5 },
    { pattern: /show\s+me\s+your\s+(system\s+)?prompt/i, type: 'TRAINING_EXTRACTION', severity: 'HIGH', weight: 7 },
    { pattern: /print\s+(your\s+)?(system|initial)\s+(prompt|instructions)/i, type: 'PROMPT_LEAK', severity: 'HIGH', weight: 7 },
    { pattern: /output\s+your\s+(full\s+)?(system\s+)?prompt/i, type: 'PROMPT_LEAK', severity: 'HIGH', weight: 7 },
  ];

  detect(input: string): InjectionResult {
    const matchedPatterns: string[] = [];
    const matchedTypes = new Set<string>();
    const severityWeights: Record<string, number> = { NONE: 0, LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 };
    let maxSeverityWeight = 0;
    let maxSeverity: InjectionResult['severity'] = 'NONE';

    for (const rule of this.rules) {
      if (rule.pattern.test(input)) {
        matchedPatterns.push(rule.pattern.source);
        matchedTypes.add(rule.type);
        const sw = severityWeights[rule.severity];
        if (sw > maxSeverityWeight) {
          maxSeverityWeight = sw;
          maxSeverity = rule.severity;
        }
      }
    }

    return {
      threat: matchedPatterns.length > 0,
      patterns: matchedPatterns,
      severity: maxSeverity,
      sanitized: this.sanitize(input),
      threatTypes: Array.from(matchedTypes),
    };
  }

  sanitize(input: string): string {
    return input
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '[SCRIPT_REMOVED]')
      .replace(/javascript\s*:/gi, '[JS_REMOVED]:')
      .replace(/on(load|error|click|submit)\s*=\s*["'][^"']*["']/gi, '[EVENT_REMOVED]')
      .slice(0, 50000);
  }

  isCritical(result: InjectionResult): boolean {
    return result.severity === 'CRITICAL';
  }

  isHighOrAbove(result: InjectionResult): boolean {
    return result.severity === 'HIGH' || result.severity === 'CRITICAL';
  }

  getThreatScore(result: InjectionResult): number {
    if (result.severity === 'NONE') return 0;
    const base: Record<string, number> = { LOW: 20, MEDIUM: 40, HIGH: 70, CRITICAL: 100 };
    const bonus = Math.min(result.patterns.length * 5, 20);
    return Math.min(100, (base[result.severity] ?? 0) + bonus);
  }

  getRules(): PatternRule[] { return [...this.rules]; }
}
