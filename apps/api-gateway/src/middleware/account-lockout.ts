import type { Request, Response, NextFunction } from 'express';
import Redis from 'ioredis';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('account-lockout');

export interface LockoutConfig {
  maxAttempts: number;
  lockoutDuration: number; // seconds
  redis?: Redis;
}

const DEFAULT_CONFIG: LockoutConfig = {
  maxAttempts: 5,
  lockoutDuration: 30 * 60, // 30 minutes
};

/**
 * Account Lockout Manager
 *
 * Tracks failed login attempts and temporarily locks accounts
 * after too many failed attempts.
 */
export class AccountLockoutManager {
  private redis: Redis | null;
  private maxAttempts: number;
  private lockoutDuration: number;
  private memoryStore: Map<string, { attempts: number; lockedUntil: number | null }>;

  constructor(config: Partial<LockoutConfig> = {}) {
    const { maxAttempts, lockoutDuration, redis } = { ...DEFAULT_CONFIG, ...config };
    this.maxAttempts = maxAttempts;
    this.lockoutDuration = lockoutDuration;
    this.redis = redis || null;
    this.memoryStore = new Map();

    // Initialize Redis if URL is provided
    if (!this.redis && process.env.REDIS_URL) {
      try {
        this.redis = new Redis(process.env.REDIS_URL, {
          maxRetriesPerRequest: 3,
          lazyConnect: true,
        });
      } catch {
        logger.warn('Failed to connect to Redis, using in-memory store for lockout');
      }
    }
  }

  private getKey(email: string): string {
    return `lockout:${email.toLowerCase()}`;
  }

  /**
   * Record a failed login attempt
   */
  async recordFailedAttempt(email: string): Promise<{ locked: boolean; remainingAttempts: number }> {
    const key = this.getKey(email);

    if (this.redis) {
      try {
        // Increment attempt counter
        const attempts = await this.redis.incr(`${key}:attempts`);

        // Set expiry on first attempt (sliding window)
        if (attempts === 1) {
          await this.redis.expire(`${key}:attempts`, this.lockoutDuration);
        }

        // Check if should lock
        if (attempts >= this.maxAttempts) {
          await this.redis.set(`${key}:locked`, '1', 'EX', this.lockoutDuration);
          logger.warn('Account locked due to failed attempts', { email, attempts });
          return { locked: true, remainingAttempts: 0 };
        }

        const remaining = this.maxAttempts - attempts;
        logger.info('Failed login attempt recorded', { email, attempts, remaining });
        return { locked: false, remainingAttempts: remaining };
      } catch (error) {
        logger.error('Redis error in recordFailedAttempt', { error, email });
        // Fall through to memory store
      }
    }

    // In-memory fallback
    const now = Date.now();
    let record = this.memoryStore.get(key);

    if (!record || (record.lockedUntil && record.lockedUntil < now)) {
      record = { attempts: 0, lockedUntil: null };
    }

    record.attempts++;

    if (record.attempts >= this.maxAttempts) {
      record.lockedUntil = now + this.lockoutDuration * 1000;
      this.memoryStore.set(key, record);
      logger.warn('Account locked due to failed attempts (memory store)', { email });
      return { locked: true, remainingAttempts: 0 };
    }

    this.memoryStore.set(key, record);
    return { locked: false, remainingAttempts: this.maxAttempts - record.attempts };
  }

  /**
   * Check if an account is currently locked
   */
  async isLocked(email: string): Promise<boolean> {
    const key = this.getKey(email);

    if (this.redis) {
      try {
        const locked = await this.redis.get(`${key}:locked`);
        return locked === '1';
      } catch (error) {
        logger.error('Redis error in isLocked', { error, email });
        // Fall through to memory store
      }
    }

    // In-memory fallback
    const record = this.memoryStore.get(key);
    if (!record || !record.lockedUntil) return false;

    if (record.lockedUntil < Date.now()) {
      // Lock expired, clean up
      this.memoryStore.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Reset lockout for an account (on successful login)
   */
  async reset(email: string): Promise<void> {
    const key = this.getKey(email);

    if (this.redis) {
      try {
        await this.redis.del(`${key}:attempts`, `${key}:locked`);
        logger.info('Account lockout reset', { email });
        return;
      } catch (error) {
        logger.error('Redis error in reset', { error, email });
      }
    }

    // In-memory fallback
    this.memoryStore.delete(key);
    logger.info('Account lockout reset (memory store)', { email });
  }

  /**
   * Get remaining attempts for an account
   */
  async getRemainingAttempts(email: string): Promise<number> {
    const key = this.getKey(email);

    if (this.redis) {
      try {
        const attemptsStr = await this.redis.get(`${key}:attempts`);
        const attempts = attemptsStr ? parseInt(attemptsStr, 10) : 0;
        return Math.max(0, this.maxAttempts - attempts);
      } catch (error) {
        logger.error('Redis error in getRemainingAttempts', { error, email });
      }
    }

    // In-memory fallback
    const record = this.memoryStore.get(key);
    if (!record) return this.maxAttempts;
    return Math.max(0, this.maxAttempts - record.attempts);
  }

  /**
   * Get time until lockout expires (in seconds)
   */
  async getLockoutTimeRemaining(email: string): Promise<number> {
    const key = this.getKey(email);

    if (this.redis) {
      try {
        const ttl = await this.redis.ttl(`${key}:locked`);
        return ttl > 0 ? ttl : 0;
      } catch (error) {
        logger.error('Redis error in getLockoutTimeRemaining', { error, email });
      }
    }

    // In-memory fallback
    const record = this.memoryStore.get(key);
    if (!record || !record.lockedUntil) return 0;

    const remaining = Math.ceil((record.lockedUntil - Date.now()) / 1000);
    return remaining > 0 ? remaining : 0;
  }

  /**
   * Close Redis connection
   */
  async close(): Promise<void> {
    if (this.redis) {
      await this.redis.quit();
      this.redis = null;
    }
    this.memoryStore.clear();
  }
}

// Default singleton instance
let defaultManager: AccountLockoutManager | null = null;

/**
 * Get the default AccountLockoutManager instance
 */
export function getAccountLockoutManager(): AccountLockoutManager {
  if (!defaultManager) {
    defaultManager = new AccountLockoutManager();
  }
  return defaultManager;
}

/**
 * Middleware to check account lockout before login
 */
export function checkAccountLockout(manager?: AccountLockoutManager) {
  const lockoutManager = manager || getAccountLockoutManager();

  return async (req: Request, res: Response, next: NextFunction) => {
    const email = req.body?.email;

    if (!email) {
      return next();
    }

    try {
      const isLocked = await lockoutManager.isLocked(email);

      if (isLocked) {
        const timeRemaining = await lockoutManager.getLockoutTimeRemaining(email);
        const minutes = Math.ceil(timeRemaining / 60);

        return res.status(423).json({
          success: false,
          error: {
            code: 'ACCOUNT_LOCKED',
            message: `Account temporarily locked due to too many failed attempts. Try again in ${minutes} minutes.`,
            retryAfter: timeRemaining,
          },
        });
      }

      next();
    } catch (error) {
      logger.error('Error checking account lockout', { error, email });
      // Don't block login on lockout check failure
      next();
    }
  };
}

/**
 * Reset default manager (for testing)
 */
export function resetAccountLockoutManager(): void {
  if (defaultManager) {
    defaultManager.close();
    defaultManager = null;
  }
}
