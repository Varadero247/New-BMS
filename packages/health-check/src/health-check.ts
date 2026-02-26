// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

export enum HealthStatus {
  HEALTHY = 'HEALTHY',
  DEGRADED = 'DEGRADED',
  UNHEALTHY = 'UNHEALTHY',
}

export interface HealthResult {
  status: HealthStatus;
  message?: string;
  duration?: number;
  metadata?: Record<string, unknown>;
}

export type HealthCheck = () => Promise<HealthResult> | HealthResult;

export class HealthRegistry {
  private checks: Map<string, HealthCheck> = new Map();

  register(name: string, check: HealthCheck): void {
    this.checks.set(name, check);
  }

  unregister(name: string): boolean {
    return this.checks.delete(name);
  }

  async runCheck(name: string): Promise<HealthResult> {
    const check = this.checks.get(name);
    if (!check) {
      return unhealthy(`No check registered with name: ${name}`);
    }
    const start = Date.now();
    const result = await Promise.resolve(check());
    return { ...result, duration: Date.now() - start };
  }

  async runAll(): Promise<Map<string, HealthResult>> {
    const results = new Map<string, HealthResult>();
    for (const [name] of this.checks) {
      results.set(name, await this.runCheck(name));
    }
    return results;
  }

  async aggregate(): Promise<{ status: HealthStatus; checks: Map<string, HealthResult> }> {
    const checks = await this.runAll();
    let status = HealthStatus.HEALTHY;
    for (const result of checks.values()) {
      if (result.status === HealthStatus.UNHEALTHY) {
        status = HealthStatus.UNHEALTHY;
        break;
      }
      if (result.status === HealthStatus.DEGRADED) {
        status = HealthStatus.DEGRADED;
      }
    }
    return { status, checks };
  }

  names(): string[] {
    return Array.from(this.checks.keys());
  }

  get size(): number {
    return this.checks.size;
  }

  has(name: string): boolean {
    return this.checks.has(name);
  }

  clear(): void {
    this.checks.clear();
  }
}

export function healthy(message?: string): HealthResult {
  return { status: HealthStatus.HEALTHY, ...(message !== undefined ? { message } : {}) };
}

export function degraded(message?: string): HealthResult {
  return { status: HealthStatus.DEGRADED, ...(message !== undefined ? { message } : {}) };
}

export function unhealthy(message?: string): HealthResult {
  return { status: HealthStatus.UNHEALTHY, ...(message !== undefined ? { message } : {}) };
}

export function createRegistry(): HealthRegistry {
  return new HealthRegistry();
}
