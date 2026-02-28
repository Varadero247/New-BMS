import { LoginAttemptResult, PasswordValidationResult } from './types';

interface CredConfig {
  maxFailedAttempts: number;
  lockoutDurationMs: number;
  minPasswordLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
}

interface AttemptRecord {
  count: number;
  lockedUntil?: Date;
  lastAttempt: Date;
}

export class CredentialProtectionService {
  private readonly config: CredConfig;
  private readonly attempts = new Map<string, AttemptRecord>();
  private readonly COMMON_PASSWORDS = new Set([
    'password', 'password123', '123456', '12345678', 'qwerty', 'abc123',
    'letmein', 'admin', 'welcome', 'monkey', 'dragon', 'master',
    'nexara123', 'nexara', 'imspassword', 'admin123', 'pass@word1',
  ]);

  constructor(config: Partial<CredConfig> = {}) {
    this.config = {
      maxFailedAttempts: config.maxFailedAttempts ?? 5,
      lockoutDurationMs: config.lockoutDurationMs ?? 15 * 60 * 1000,
      minPasswordLength: config.minPasswordLength ?? 12,
      requireUppercase: config.requireUppercase ?? true,
      requireLowercase: config.requireLowercase ?? true,
      requireNumbers: config.requireNumbers ?? true,
      requireSpecialChars: config.requireSpecialChars ?? true,
    };
  }

  checkLoginAttempt(identifier: string, ipAddress?: string): LoginAttemptResult {
    const key = ipAddress ? `${identifier}:${ipAddress}` : identifier;
    const record = this.attempts.get(key);
    const now = new Date();

    if (record?.lockedUntil && record.lockedUntil > now) {
      return {
        allowed: false,
        failedAttempts: record.count,
        lockedUntil: record.lockedUntil,
        reason: `Account locked until ${record.lockedUntil.toISOString()}`,
      };
    }

    // Reset if lock has expired
    if (record?.lockedUntil && record.lockedUntil <= now) {
      this.attempts.delete(key);
    }

    const current = this.attempts.get(key);
    return {
      allowed: true,
      failedAttempts: current?.count ?? 0,
    };
  }

  recordFailedAttempt(identifier: string, ipAddress?: string): LoginAttemptResult {
    const key = ipAddress ? `${identifier}:${ipAddress}` : identifier;
    const existing = this.attempts.get(key);
    const count = (existing?.count ?? 0) + 1;
    const now = new Date();

    if (count >= this.config.maxFailedAttempts) {
      const lockedUntil = new Date(now.getTime() + this.config.lockoutDurationMs);
      this.attempts.set(key, { count, lockedUntil, lastAttempt: now });
      return { allowed: false, failedAttempts: count, lockedUntil, reason: 'Too many failed attempts' };
    }

    this.attempts.set(key, { count, lastAttempt: now });
    return { allowed: true, failedAttempts: count };
  }

  recordSuccessfulLogin(identifier: string, ipAddress?: string): void {
    const key = ipAddress ? `${identifier}:${ipAddress}` : identifier;
    this.attempts.delete(key);
  }

  validatePassword(password: string, userInfo?: { username?: string; email?: string }): PasswordValidationResult {
    const errors: string[] = [];
    const suggestions: string[] = [];
    let score = 100;

    if (password.length < this.config.minPasswordLength) {
      errors.push(`Password must be at least ${this.config.minPasswordLength} characters`);
      score -= 30;
    }
    if (this.config.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
      score -= 15;
    }
    if (this.config.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
      score -= 15;
    }
    if (this.config.requireNumbers && !/\d/.test(password)) {
      errors.push('Password must contain at least one number');
      score -= 15;
    }
    if (this.config.requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character');
      score -= 15;
    }
    if (this.COMMON_PASSWORDS.has(password.toLowerCase())) {
      errors.push('Password is too common — choose a different password');
      score -= 40;
    }
    if (userInfo?.username && password.toLowerCase().includes(userInfo.username.toLowerCase())) {
      errors.push('Password must not contain your username');
      score -= 20;
    }
    if (userInfo?.email) {
      const emailLocal = userInfo.email.split('@')[0];
      if (emailLocal && password.toLowerCase().includes(emailLocal.toLowerCase())) {
        errors.push('Password must not contain your email address');
        score -= 20;
      }
    }
    if (password.length >= 16) { suggestions.push('Great length!'); score = Math.min(100, score + 10); }
    if (/[!@#$%^&*]{2,}/.test(password)) { suggestions.push('Multiple special chars — strong!'); score = Math.min(100, score + 5); }

    return { isValid: errors.length === 0, score: Math.max(0, score), errors, suggestions };
  }

  getFailedAttempts(identifier: string, ipAddress?: string): number {
    const key = ipAddress ? `${identifier}:${ipAddress}` : identifier;
    return this.attempts.get(key)?.count ?? 0;
  }

  isLocked(identifier: string, ipAddress?: string): boolean {
    const key = ipAddress ? `${identifier}:${ipAddress}` : identifier;
    const record = this.attempts.get(key);
    if (!record?.lockedUntil) return false;
    return record.lockedUntil > new Date();
  }

  unlock(identifier: string, ipAddress?: string): void {
    const key = ipAddress ? `${identifier}:${ipAddress}` : identifier;
    this.attempts.delete(key);
  }

  getConfig(): CredConfig { return { ...this.config }; }
}
