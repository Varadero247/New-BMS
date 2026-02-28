import { createHash, randomBytes } from 'crypto';
import { SecurityIncident, ThreatEvent } from './types';

export interface AuditEntry {
  id: string;
  requestHash: string;
  previousHash: string;
  userId: string;
  tenantId: string;
  useCase: string;
  input: unknown;
  output: unknown;
  validationResult: unknown;
  threats: string[];
  tokensUsed: number;
  processingTimeMs: number;
  timestamp: Date;
  integrityVerified: boolean;
}

export class AIAuditLogger {
  private readonly entries: AuditEntry[] = [];
  private lastHash = 'GENESIS';
  private readonly incidents: SecurityIncident[] = [];

  log(entry: Omit<AuditEntry, 'id' | 'requestHash' | 'previousHash' | 'integrityVerified'>): AuditEntry {
    const id = randomBytes(16).toString('hex');
    const requestHash = createHash('sha256')
      .update(JSON.stringify({ userId: entry.userId, useCase: entry.useCase, input: entry.input, timestamp: entry.timestamp }))
      .digest('hex');

    const fullEntry: AuditEntry = {
      ...entry,
      id,
      requestHash,
      previousHash: this.lastHash,
      integrityVerified: true,
    };

    this.lastHash = requestHash;
    this.entries.push(fullEntry);
    return fullEntry;
  }

  logIncident(incident: Omit<SecurityIncident, 'timestamp'>): void {
    this.incidents.push({ ...incident, timestamp: new Date() });
  }

  getEntries(filters?: { userId?: string; tenantId?: string; useCase?: string }): AuditEntry[] {
    if (!filters) return [...this.entries];
    return this.entries.filter(e => {
      if (filters.userId && e.userId !== filters.userId) return false;
      if (filters.tenantId && e.tenantId !== filters.tenantId) return false;
      if (filters.useCase && e.useCase !== filters.useCase) return false;
      return true;
    });
  }

  getIncidents(severity?: SecurityIncident['severity']): SecurityIncident[] {
    if (!severity) return [...this.incidents];
    return this.incidents.filter(i => i.severity === severity);
  }

  verifyChainIntegrity(): { valid: boolean; brokenAt?: number } {
    let prevHash = 'GENESIS';
    for (let i = 0; i < this.entries.length; i++) {
      const entry = this.entries[i];
      if (entry.previousHash !== prevHash) {
        return { valid: false, brokenAt: i };
      }
      prevHash = createHash('sha256')
        .update(JSON.stringify({ userId: entry.userId, useCase: entry.useCase, input: entry.input, timestamp: entry.timestamp }))
        .digest('hex');
    }
    return { valid: true };
  }

  getStats(): { totalRequests: number; totalIncidents: number; criticalIncidents: number } {
    return {
      totalRequests: this.entries.length,
      totalIncidents: this.incidents.length,
      criticalIncidents: this.incidents.filter(i => i.severity === 'CRITICAL').length,
    };
  }

  clear(): void {
    this.entries.length = 0;
    this.incidents.length = 0;
    this.lastHash = 'GENESIS';
  }
}
