import { createHash } from 'crypto';
import { KeyRecord, KeyRotationPolicy, VaultConfig } from './types';

export { KeyRecord, KeyRotationPolicy };

export class APIKeyVault {
  private readonly keys = new Map<string, KeyRecord>();
  private readonly policies = new Map<string, KeyRotationPolicy>();
  private readonly config: VaultConfig;
  private readonly accessLog: Array<{ keyId: string; timestamp: Date; action: string }> = [];

  constructor(config: Partial<VaultConfig> = {}) {
    this.config = {
      rotationDays: config.rotationDays ?? 90,
      maxKeysPerService: config.maxKeysPerService ?? 3,
      requireEncryption: config.requireEncryption ?? true,
    };
  }

  register(service: string, keyValue: string, environment: KeyRecord['environment'] = 'production'): KeyRecord {
    const id = `${service}-${environment}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const createdAt = new Date();
    const expiresAt = new Date(createdAt.getTime() + this.config.rotationDays * 24 * 60 * 60 * 1000);
    const record: KeyRecord = {
      id, service, environment,
      keyHash: createHash('sha256').update(keyValue).digest('hex'),
      createdAt, expiresAt, lastRotatedAt: createdAt,
      isActive: true, accessCount: 0, rotationCount: 0,
    };
    this.keys.set(id, record);
    return record;
  }

  rotate(keyId: string, newKeyValue: string): KeyRecord {
    const existing = this.keys.get(keyId);
    if (!existing) throw new Error(`Key not found: ${keyId}`);
    const now = new Date();
    const updated: KeyRecord = {
      ...existing,
      keyHash: createHash('sha256').update(newKeyValue).digest('hex'),
      lastRotatedAt: now,
      expiresAt: new Date(now.getTime() + this.config.rotationDays * 24 * 60 * 60 * 1000),
      rotationCount: existing.rotationCount + 1,
    };
    this.keys.set(keyId, updated);
    this.accessLog.push({ keyId, timestamp: now, action: 'ROTATED' });
    return updated;
  }

  revoke(keyId: string): void {
    const record = this.keys.get(keyId);
    if (record) {
      this.keys.set(keyId, { ...record, isActive: false });
      this.accessLog.push({ keyId, timestamp: new Date(), action: 'REVOKED' });
    }
  }

  getExpiringSoon(daysThreshold = 14): KeyRecord[] {
    const threshold = new Date(Date.now() + daysThreshold * 24 * 60 * 60 * 1000);
    return Array.from(this.keys.values()).filter(k => k.isActive && k.expiresAt <= threshold);
  }

  getExpired(): KeyRecord[] {
    const now = new Date();
    return Array.from(this.keys.values()).filter(k => k.isActive && k.expiresAt <= now);
  }

  getByService(service: string): KeyRecord[] {
    return Array.from(this.keys.values()).filter(k => k.service === service);
  }

  recordAccess(keyId: string): void {
    const record = this.keys.get(keyId);
    if (record) {
      this.keys.set(keyId, { ...record, accessCount: record.accessCount + 1 });
      this.accessLog.push({ keyId, timestamp: new Date(), action: 'ACCESSED' });
    }
  }

  isExpired(keyId: string): boolean {
    const record = this.keys.get(keyId);
    if (!record) return true;
    return record.expiresAt <= new Date();
  }

  setPolicy(policy: KeyRotationPolicy): void { this.policies.set(policy.service, policy); }
  getPolicy(service: string): KeyRotationPolicy | undefined { return this.policies.get(service); }
  getAll(): KeyRecord[] { return Array.from(this.keys.values()); }
  getAccessLog() { return [...this.accessLog]; }
  getConfig(): VaultConfig { return { ...this.config }; }
}
