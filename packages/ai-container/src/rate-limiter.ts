export interface RateLimitConfig {
  maxPerUserPerHour: number;
  maxPerTenantPerDay: number;
  windowSizeMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
  reason?: string;
}

interface RequestRecord {
  count: number;
  windowStart: number;
}

export class RateLimiter {
  private readonly userWindows = new Map<string, RequestRecord>();
  private readonly tenantWindows = new Map<string, RequestRecord>();
  private readonly config: RateLimitConfig;

  constructor(config: Partial<RateLimitConfig> = {}) {
    this.config = {
      maxPerUserPerHour: config.maxPerUserPerHour ?? 100,
      maxPerTenantPerDay: config.maxPerTenantPerDay ?? 1000,
      windowSizeMs: config.windowSizeMs ?? 60 * 60 * 1000,
    };
  }

  checkUserLimit(userId: string): RateLimitResult {
    return this.checkLimit(this.userWindows, userId, this.config.maxPerUserPerHour, this.config.windowSizeMs);
  }

  checkTenantLimit(tenantId: string): RateLimitResult {
    const dayMs = 24 * 60 * 60 * 1000;
    return this.checkLimit(this.tenantWindows, tenantId, this.config.maxPerTenantPerDay, dayMs);
  }

  private checkLimit(store: Map<string, RequestRecord>, key: string, max: number, windowMs: number): RateLimitResult {
    const now = Date.now();
    const record = store.get(key);

    if (!record || now - record.windowStart >= windowMs) {
      store.set(key, { count: 1, windowStart: now });
      return { allowed: true, remaining: max - 1, resetAt: new Date(now + windowMs) };
    }

    if (record.count >= max) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: new Date(record.windowStart + windowMs),
        reason: `Rate limit exceeded: ${record.count}/${max} requests in window`,
      };
    }

    record.count++;
    return { allowed: true, remaining: max - record.count, resetAt: new Date(record.windowStart + windowMs) };
  }

  reset(userId?: string): void {
    if (userId) {
      this.userWindows.delete(userId);
      this.tenantWindows.delete(userId);
    } else {
      this.userWindows.clear();
      this.tenantWindows.clear();
    }
  }

  getUsage(userId: string): { userRequests: number; windowStart: number } {
    const record = this.userWindows.get(userId);
    return { userRequests: record?.count ?? 0, windowStart: record?.windowStart ?? 0 };
  }
}
