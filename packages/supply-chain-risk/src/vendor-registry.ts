import { VendorRecord, VendorTier, VendorStatus, RiskLevel } from './types';

let _seq = 0;

function scoreToLevel(score: number): RiskLevel {
  if (score < 25) return 'LOW';
  if (score < 50) return 'MEDIUM';
  if (score < 75) return 'HIGH';
  return 'CRITICAL';
}

export class VendorRegistry {
  private readonly vendors = new Map<string, VendorRecord>();

  register(name: string, tier: VendorTier, country: string, categories: string[], initialScore = 50): VendorRecord {
    const id = `vendor-${++_seq}`;
    const record: VendorRecord = {
      id, name, tier, country, categories,
      status: 'ACTIVE',
      riskScore: initialScore,
      riskLevel: scoreToLevel(initialScore),
      onboardedAt: new Date(),
    };
    this.vendors.set(id, record);
    return record;
  }

  updateScore(id: string, score: number): VendorRecord {
    const v = this.vendors.get(id);
    if (!v) throw new Error(`Vendor not found: ${id}`);
    const updated = { ...v, riskScore: score, riskLevel: scoreToLevel(score), lastAssessedAt: new Date() };
    this.vendors.set(id, updated);
    return updated;
  }

  updateStatus(id: string, status: VendorStatus): VendorRecord {
    const v = this.vendors.get(id);
    if (!v) throw new Error(`Vendor not found: ${id}`);
    const updated = { ...v, status };
    this.vendors.set(id, updated);
    return updated;
  }

  get(id: string): VendorRecord | undefined { return this.vendors.get(id); }
  getAll(): VendorRecord[] { return Array.from(this.vendors.values()); }
  getByTier(tier: VendorTier): VendorRecord[] { return Array.from(this.vendors.values()).filter(v => v.tier === tier); }
  getByStatus(status: VendorStatus): VendorRecord[] { return Array.from(this.vendors.values()).filter(v => v.status === status); }
  getByRiskLevel(level: RiskLevel): VendorRecord[] { return Array.from(this.vendors.values()).filter(v => v.riskLevel === level); }
  getByCountry(country: string): VendorRecord[] { return Array.from(this.vendors.values()).filter(v => v.country === country); }
  getCritical(): VendorRecord[] { return this.getByTier('CRITICAL'); }
  getHighRisk(): VendorRecord[] { return Array.from(this.vendors.values()).filter(v => v.riskLevel === 'HIGH' || v.riskLevel === 'CRITICAL'); }
  getCount(): number { return this.vendors.size; }
  getAverageRiskScore(): number {
    const all = Array.from(this.vendors.values());
    if (all.length === 0) return 0;
    return Math.round(all.reduce((s, v) => s + v.riskScore, 0) / all.length);
  }
}
