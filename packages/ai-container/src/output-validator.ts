export interface OutputValidationResult {
  isValid: boolean;
  confidence: number;
  requiresHumanReview: boolean;
  errors: string[];
  warnings: string[];
  hallucinationRisk: 'LOW' | 'MEDIUM' | 'HIGH';
}

export class OutputValidator {
  private readonly CONFIDENCE_THRESHOLD: number;
  private readonly APPROVAL_THRESHOLD: number;

  private readonly LOW_CONFIDENCE_PHRASES = [
    'maybe', 'possibly', 'might be', 'could be', 'not sure', 'uncertain',
    "don't know", 'i guess', 'approximately', 'i think', 'i believe',
    'it seems', 'perhaps', 'probably', 'likely', 'i cannot be certain',
  ];

  private readonly REFUSAL_PHRASES = [
    'i cannot', 'i am unable', 'i will not', 'i should not',
    'as an ai', 'as a language model', 'i apologize',
  ];

  constructor(confidenceThreshold = 0.7, approvalThreshold = 0.85) {
    this.CONFIDENCE_THRESHOLD = confidenceThreshold;
    this.APPROVAL_THRESHOLD = approvalThreshold;
  }

  validate(output: string): OutputValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const lowerOutput = output.toLowerCase();

    for (const phrase of this.REFUSAL_PHRASES) {
      if (lowerOutput.includes(phrase)) {
        errors.push(`AI refused to complete task: "${phrase}"`);
      }
    }

    const lowConfidenceMatches: string[] = [];
    for (const phrase of this.LOW_CONFIDENCE_PHRASES) {
      if (lowerOutput.includes(phrase)) {
        lowConfidenceMatches.push(phrase);
      }
    }
    if (lowConfidenceMatches.length > 0) {
      warnings.push(`Low confidence language detected: ${lowConfidenceMatches.join(', ')}`);
    }

    if (!output || output.trim().length === 0) {
      errors.push('Empty output from AI');
    }

    if (/\b\d{3}-\d{2}-\d{4}\b/.test(output)) {
      warnings.push('Possible SSN in output — verify data minimisation');
    }
    if (/\b\d{4}[\s-]\d{4}[\s-]\d{4}[\s-]\d{4}\b/.test(output)) {
      errors.push('Possible credit card number in output — BLOCKED');
    }

    const confidence = this.estimateConfidence(output, lowConfidenceMatches, errors);
    const hallucinationRisk = this.assessHallucinationRisk(lowConfidenceMatches);

    return {
      isValid: errors.length === 0,
      confidence,
      requiresHumanReview: confidence < this.APPROVAL_THRESHOLD || hallucinationRisk === 'HIGH',
      errors,
      warnings,
      hallucinationRisk,
    };
  }

  private estimateConfidence(output: string, lowConfidenceMatches: string[], errors: string[]): number {
    let score = 1.0;
    score -= lowConfidenceMatches.length * 0.05;
    score -= errors.length * 0.2;
    if (output.trim().length < 10) score -= 0.3;
    return Math.max(0, Math.min(1, score));
  }

  private assessHallucinationRisk(lowConfidenceMatches: string[]): 'LOW' | 'MEDIUM' | 'HIGH' {
    if (lowConfidenceMatches.length >= 3) return 'HIGH';
    if (lowConfidenceMatches.length >= 1) return 'MEDIUM';
    return 'LOW';
  }
}
