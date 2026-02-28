import { randomBytes } from 'crypto';
import { InputValidator } from './input-validator';
import { OutputValidator } from './output-validator';
import { RateLimiter } from './rate-limiter';
import { AIAuditLogger } from './audit-logger';
import { SecureAIRequest, SecureAIResponse, ContainerConfig, DEFAULT_CONFIG } from './types';

export class SecureAIContainer {
  private readonly inputValidator: InputValidator;
  private readonly outputValidator: OutputValidator;
  private readonly rateLimiter: RateLimiter;
  private readonly auditLogger: AIAuditLogger;
  private readonly config: ContainerConfig;
  private requestCount = 0;
  private totalTokensUsed = 0;

  constructor(config: Partial<ContainerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.inputValidator = new InputValidator(this.config.maxInputLength);
    this.outputValidator = new OutputValidator(this.config.confidenceThreshold, this.config.requiresApprovalThreshold);
    this.rateLimiter = new RateLimiter({
      maxPerUserPerHour: this.config.rateLimitPerUserPerHour,
      maxPerTenantPerDay: this.config.rateLimitPerTenantPerDay,
    });
    this.auditLogger = new AIAuditLogger();
  }

  async process(request: SecureAIRequest): Promise<SecureAIResponse> {
    const startTime = Date.now();
    const auditId = randomBytes(8).toString('hex');

    // Layer 1: Rate limiting
    const userLimit = this.rateLimiter.checkUserLimit(request.userId);
    if (!userLimit.allowed) {
      this.auditLogger.logIncident({
        type: 'RATE_LIMIT_EXCEEDED',
        severity: 'MEDIUM',
        userId: request.userId,
        tenantId: request.tenantId,
        details: { useCase: request.useCase, reason: userLimit.reason ?? 'rate limit exceeded' },
      });
      return {
        output: null,
        confidence: 0,
        validationPassed: false,
        requiresHumanReview: false,
        auditId,
        processingTimeMs: Date.now() - startTime,
        tokensUsed: 0,
        warnings: [],
        errors: [`Rate limit exceeded: ${userLimit.reason}`],
      };
    }

    const tenantLimit = this.rateLimiter.checkTenantLimit(request.tenantId);
    if (!tenantLimit.allowed) {
      return {
        output: null,
        confidence: 0,
        validationPassed: false,
        requiresHumanReview: false,
        auditId,
        processingTimeMs: Date.now() - startTime,
        tokensUsed: 0,
        warnings: [],
        errors: ['Tenant daily limit exceeded'],
      };
    }

    // Layer 2: Input validation
    const inputStr = JSON.stringify(request.input);
    const inputValidation = this.inputValidator.validate(inputStr);

    if (this.inputValidator.containsHighSeverityThreat(inputValidation)) {
      this.auditLogger.logIncident({
        type: 'PROMPT_INJECTION_ATTEMPT',
        severity: 'HIGH',
        userId: request.userId,
        tenantId: request.tenantId,
        details: { threats: inputValidation.threats, useCase: request.useCase },
      });
      return {
        output: null,
        confidence: 0,
        validationPassed: false,
        requiresHumanReview: false,
        auditId,
        processingTimeMs: Date.now() - startTime,
        tokensUsed: 0,
        warnings: [],
        errors: inputValidation.threats.map(t => `Security threat detected: ${t.type}`),
      };
    }

    // Layer 3: Build mock output (real impl would call Anthropic SDK)
    const mockOutput = this.buildMockOutput(request);
    const tokensUsed = Math.floor(inputStr.length / 4) + 50;

    // Layer 4: Output validation
    const outputStr = JSON.stringify(mockOutput);
    const outputValidation = this.outputValidator.validate(outputStr);

    this.requestCount++;
    this.totalTokensUsed += tokensUsed;

    const warnings: string[] = [
      ...inputValidation.piiTypes.map(t => `PII detected in input: ${t}`),
      ...outputValidation.warnings,
    ];

    // Layer 5: Immutable audit log
    this.auditLogger.log({
      userId: request.userId,
      tenantId: request.tenantId,
      useCase: request.useCase,
      input: request.input,
      output: mockOutput,
      validationResult: { input: inputValidation, output: outputValidation },
      threats: inputValidation.threats.map(t => t.type),
      tokensUsed,
      processingTimeMs: Date.now() - startTime,
      timestamp: new Date(),
    });

    return {
      output: mockOutput,
      confidence: outputValidation.confidence,
      validationPassed: outputValidation.isValid,
      requiresHumanReview: outputValidation.requiresHumanReview || (request.requiresApproval ?? false),
      auditId,
      processingTimeMs: Date.now() - startTime,
      tokensUsed,
      warnings,
      errors: outputValidation.errors,
    };
  }

  private buildMockOutput(request: SecureAIRequest): Record<string, unknown> {
    return {
      useCase: request.useCase,
      result: 'Analysis complete',
      confidence: 0.92,
      recommendations: ['Review findings', 'Apply corrective action'],
      generatedAt: new Date().toISOString(),
    };
  }

  getAuditLogger(): AIAuditLogger { return this.auditLogger; }
  getRateLimiter(): RateLimiter { return this.rateLimiter; }
  getStats(): { requestCount: number; totalTokensUsed: number; incidents: number } {
    return { requestCount: this.requestCount, totalTokensUsed: this.totalTokensUsed, incidents: this.auditLogger.getStats().totalIncidents };
  }
  getModelVersion(): string { return this.config.modelVersion; }
  getConfig(): ContainerConfig { return { ...this.config }; }
  resetRateLimits(userId?: string): void { this.rateLimiter.reset(userId); }
}
