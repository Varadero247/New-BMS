import { ConsentRecord, LegalBasis, ConsentStatus } from './types';

let _seq = 0;

export class ConsentManager {
  private readonly records = new Map<string, ConsentRecord>();

  grant(subjectId: string, purpose: string, legalBasis: LegalBasis, opts: { expiryDays?: number; version?: string } = {}): ConsentRecord {
    const id = `consent-${++_seq}-${Date.now()}`;
    const now = new Date();
    const record: ConsentRecord = {
      id, subjectId, purpose, legalBasis,
      status: 'GIVEN',
      givenAt: now,
      version: opts.version ?? '1.0',
      expiresAt: opts.expiryDays ? new Date(now.getTime() + opts.expiryDays * 86400000) : undefined,
    };
    this.records.set(id, record);
    return record;
  }

  withdraw(id: string): boolean {
    const r = this.records.get(id);
    if (!r) return false;
    this.records.set(id, { ...r, status: 'WITHDRAWN', withdrawnAt: new Date() });
    return true;
  }

  isValid(id: string): boolean {
    const r = this.records.get(id);
    if (!r || r.status !== 'GIVEN') return false;
    if (r.expiresAt && r.expiresAt < new Date()) {
      this.records.set(id, { ...r, status: 'EXPIRED' });
      return false;
    }
    return true;
  }

  getBySubject(subjectId: string): ConsentRecord[] {
    return Array.from(this.records.values()).filter(r => r.subjectId === subjectId);
  }

  getByPurpose(purpose: string): ConsentRecord[] {
    return Array.from(this.records.values()).filter(r => r.purpose === purpose);
  }

  getActive(): ConsentRecord[] {
    return Array.from(this.records.values()).filter(r => r.status === 'GIVEN');
  }

  getByStatus(status: ConsentStatus): ConsentRecord[] {
    return Array.from(this.records.values()).filter(r => r.status === status);
  }

  get(id: string): ConsentRecord | undefined { return this.records.get(id); }
  getAll(): ConsentRecord[] { return Array.from(this.records.values()); }
  getCount(): number { return this.records.size; }
}
