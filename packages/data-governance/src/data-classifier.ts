import { DataAsset, DataSensitivity, PIICategory } from './types';

let _assetSeq = 0;

export class DataClassifier {
  private readonly assets = new Map<string, DataAsset>();

  private readonly SENSITIVITY_ORDER: DataSensitivity[] = ['PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED', 'TOP_SECRET'];

  classify(name: string, piiCategories: PIICategory[], opts: {
    owner?: string; retentionDays?: number; sensitivity?: DataSensitivity;
  } = {}): DataAsset {
    const id = `asset-${++_assetSeq}`;
    const autoSensitivity = this.inferSensitivity(piiCategories);
    const sensitivity = opts.sensitivity ?? autoSensitivity;
    const asset: DataAsset = {
      id, name, sensitivity, piiCategories,
      retentionDays: opts.retentionDays ?? this.defaultRetention(sensitivity),
      encryptionRequired: this.requiresEncryption(sensitivity),
      owner: opts.owner ?? 'unassigned',
      createdAt: new Date(),
    };
    this.assets.set(id, asset);
    return asset;
  }

  private inferSensitivity(cats: PIICategory[]): DataSensitivity {
    if (cats.some(c => ['SSN', 'BIOMETRIC', 'HEALTH', 'FINANCIAL'].includes(c))) return 'RESTRICTED';
    if (cats.some(c => ['DOB', 'PHONE', 'ADDRESS'].includes(c))) return 'CONFIDENTIAL';
    if (cats.some(c => ['NAME', 'EMAIL'].includes(c))) return 'INTERNAL';
    return 'PUBLIC';
  }

  private defaultRetention(s: DataSensitivity): number {
    const map: Record<DataSensitivity, number> = { PUBLIC: 365, INTERNAL: 730, CONFIDENTIAL: 1095, RESTRICTED: 1825, TOP_SECRET: 2555 };
    return map[s];
  }

  private requiresEncryption(s: DataSensitivity): boolean {
    return ['CONFIDENTIAL', 'RESTRICTED', 'TOP_SECRET'].includes(s);
  }

  get(id: string): DataAsset | undefined { return this.assets.get(id); }
  getAll(): DataAsset[] { return Array.from(this.assets.values()); }
  getBySensitivity(s: DataSensitivity): DataAsset[] { return Array.from(this.assets.values()).filter(a => a.sensitivity === s); }
  getRequiringEncryption(): DataAsset[] { return Array.from(this.assets.values()).filter(a => a.encryptionRequired); }
  getByOwner(owner: string): DataAsset[] { return Array.from(this.assets.values()).filter(a => a.owner === owner); }

  compareSensitivity(a: DataSensitivity, b: DataSensitivity): number {
    return this.SENSITIVITY_ORDER.indexOf(a) - this.SENSITIVITY_ORDER.indexOf(b);
  }

  isHigherSensitivity(a: DataSensitivity, b: DataSensitivity): boolean {
    return this.compareSensitivity(a, b) > 0;
  }

  getCount(): number { return this.assets.size; }
}
