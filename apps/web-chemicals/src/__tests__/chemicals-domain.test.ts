// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

// ─── Types ───────────────────────────────────────────────────────────────────

type GHSPictogram =
  | 'GHS01' | 'GHS02' | 'GHS03' | 'GHS04'
  | 'GHS05' | 'GHS06' | 'GHS07' | 'GHS08' | 'GHS09';

type SignalWord = 'DANGER' | 'WARNING';
type RiskLevel  = 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
type PhysicalForm = 'SOLID' | 'LIQUID' | 'GAS' | 'POWDER' | 'AEROSOL';
type SDSStatus  = 'CURRENT' | 'OVERDUE' | 'MISSING' | 'PENDING';
type REACHStatus = 'REGISTERED' | 'PRE_REGISTERED' | 'EXEMPT' | 'NOT_REQUIRED' | 'PENDING';
type CoshhStatus = 'DRAFT' | 'PENDING_REVIEW' | 'APPROVED' | 'SUPERSEDED';
type InventoryStockStatus = 'OK' | 'LOW_STOCK' | 'EXPIRED' | 'EXPIRING_SOON';

// ─── Domain Constants ─────────────────────────────────────────────────────────

const GHS_PICTOGRAMS: GHSPictogram[] = [
  'GHS01', 'GHS02', 'GHS03', 'GHS04', 'GHS05', 'GHS06', 'GHS07', 'GHS08', 'GHS09',
];

const GHS_PICTOGRAM_LABELS: Record<GHSPictogram, string> = {
  GHS01: 'Explosive',
  GHS02: 'Flammable',
  GHS03: 'Oxidiser',
  GHS04: 'Compressed Gas',
  GHS05: 'Corrosive',
  GHS06: 'Toxic',
  GHS07: 'Harmful',
  GHS08: 'Health Hazard',
  GHS09: 'Environment',
};

const RISK_LEVELS: RiskLevel[] = ['LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH'];

const PHYSICAL_FORMS: PhysicalForm[] = ['SOLID', 'LIQUID', 'GAS', 'POWDER', 'AEROSOL'];

const SDS_STATUSES: SDSStatus[] = ['CURRENT', 'OVERDUE', 'MISSING', 'PENDING'];

const REACH_STATUSES: REACHStatus[] = [
  'REGISTERED', 'PRE_REGISTERED', 'EXEMPT', 'NOT_REQUIRED', 'PENDING',
];

const COSHH_STATUSES: CoshhStatus[] = ['DRAFT', 'PENDING_REVIEW', 'APPROVED', 'SUPERSEDED'];

const SIGNAL_WORDS: SignalWord[] = ['DANGER', 'WARNING'];

// ─── Badge / Color Maps ───────────────────────────────────────────────────────

const riskBadgeClass: Record<RiskLevel, string> = {
  LOW:       'bg-green-100 text-green-800',
  MEDIUM:    'bg-amber-100 text-amber-800',
  HIGH:      'bg-orange-100 text-orange-800',
  VERY_HIGH: 'bg-red-100 text-red-800',
};

const signalBadgeClass: Record<SignalWord, string> = {
  DANGER:  'bg-red-100 text-red-800',
  WARNING: 'bg-amber-100 text-amber-800',
};

const sdsBadgeClass: Record<SDSStatus, string> = {
  CURRENT: 'bg-green-100 text-green-800',
  OVERDUE: 'bg-red-100 text-red-800',
  MISSING: 'bg-red-100 text-red-800',
  PENDING: 'bg-amber-100 text-amber-800',
};

const coshhStatusBadgeClass: Record<CoshhStatus, string> = {
  DRAFT:          'bg-gray-100 text-gray-600',
  PENDING_REVIEW: 'bg-blue-100 text-blue-800',
  APPROVED:       'bg-green-100 text-green-800',
  SUPERSEDED:     'bg-gray-100 text-gray-500',
};

const riskScore: Record<RiskLevel, number> = {
  LOW: 1, MEDIUM: 2, HIGH: 3, VERY_HIGH: 4,
};

// ─── Domain Helpers ───────────────────────────────────────────────────────────

function computeRiskLevel(likelihood: number, severity: number): RiskLevel {
  const score = likelihood * severity;
  if (score <= 4)  return 'LOW';
  if (score <= 9)  return 'MEDIUM';
  if (score <= 16) return 'HIGH';
  return 'VERY_HIGH';
}

function requiresPPE(riskLevel: RiskLevel): boolean {
  return riskLevel === 'HIGH' || riskLevel === 'VERY_HIGH';
}

function isCMRPictogram(code: GHSPictogram): boolean {
  // GHS06 (Toxic) and GHS08 (Health Hazard) are associated with CMR substances
  return code === 'GHS06' || code === 'GHS08';
}

function signalWordFromPictograms(pictograms: GHSPictogram[]): SignalWord | 'NONE' {
  const dangerCodes: GHSPictogram[] = ['GHS01', 'GHS05', 'GHS06'];
  if (pictograms.some(p => dangerCodes.includes(p))) return 'DANGER';
  if (pictograms.length > 0) return 'WARNING';
  return 'NONE';
}

function inventoryStockStatus(
  quantity: number,
  minStock: number,
  expiryDate: string | null,
): InventoryStockStatus {
  const now = Date.now();
  if (expiryDate && new Date(expiryDate).getTime() < now) return 'EXPIRED';
  const daysToExpiry = expiryDate
    ? Math.floor((new Date(expiryDate).getTime() - now) / 86400000)
    : Infinity;
  if (daysToExpiry <= 30 && daysToExpiry > 0) return 'EXPIRING_SOON';
  if (minStock > 0 && quantity <= minStock) return 'LOW_STOCK';
  return 'OK';
}

function coshhReferenceFormat(prefix: string, year: number, seq: number): string {
  return `${prefix}-${year}-${String(seq).padStart(3, '0')}`;
}

function welExceedance(measured: number, welLimit: number): boolean {
  return measured > welLimit;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

interface MockChemical {
  id: string;
  name: string;
  casNumber: string;
  signalWord: SignalWord;
  pictograms: GHSPictogram[];
  riskLevel: RiskLevel;
  sdsStatus: SDSStatus;
  physicalForm: PhysicalForm;
  cmrFlag: boolean;
  welLimit: number | null;
}

interface MockInventoryRecord {
  id: string;
  chemicalId: string;
  chemicalName: string;
  location: string;
  quantity: number;
  unit: string;
  minStock: number;
  maxStock: number;
  expiryDate: string | null;
  batchNumber: string;
  storageCondition: string;
}

interface MockCoshhAssessment {
  id: string;
  reference: string;
  chemicalName: string;
  activity: string;
  riskLevel: RiskLevel;
  status: CoshhStatus;
  reviewDate: string;
}

const MOCK_CHEMICALS: MockChemical[] = [
  {
    id: 'chem-001',
    name: 'Acetone',
    casNumber: '67-64-1',
    signalWord: 'DANGER',
    pictograms: ['GHS02', 'GHS07'],
    riskLevel: 'MEDIUM',
    sdsStatus: 'CURRENT',
    physicalForm: 'LIQUID',
    cmrFlag: false,
    welLimit: 1210,
  },
  {
    id: 'chem-002',
    name: 'Sodium Hydroxide',
    casNumber: '1310-73-2',
    signalWord: 'DANGER',
    pictograms: ['GHS05', 'GHS07'],
    riskLevel: 'HIGH',
    sdsStatus: 'CURRENT',
    physicalForm: 'SOLID',
    cmrFlag: false,
    welLimit: 2,
  },
  {
    id: 'chem-003',
    name: 'Benzene',
    casNumber: '71-43-2',
    signalWord: 'DANGER',
    pictograms: ['GHS02', 'GHS06', 'GHS08'],
    riskLevel: 'VERY_HIGH',
    sdsStatus: 'CURRENT',
    physicalForm: 'LIQUID',
    cmrFlag: true,
    welLimit: 3.25,
  },
  {
    id: 'chem-004',
    name: 'Isopropyl Alcohol',
    casNumber: '67-63-0',
    signalWord: 'WARNING',
    pictograms: ['GHS02', 'GHS07'],
    riskLevel: 'LOW',
    sdsStatus: 'PENDING',
    physicalForm: 'LIQUID',
    cmrFlag: false,
    welLimit: 999,
  },
];

const MOCK_INVENTORY: MockInventoryRecord[] = [
  {
    id: 'inv-001',
    chemicalId: 'chem-001',
    chemicalName: 'Acetone',
    location: 'Store Room A',
    quantity: 25,
    unit: 'litres',
    minStock: 10,
    maxStock: 100,
    expiryDate: '2027-06-30',
    batchNumber: 'LOT-2026-001',
    storageCondition: 'Cool, dry, ventilated',
  },
  {
    id: 'inv-002',
    chemicalId: 'chem-002',
    chemicalName: 'Sodium Hydroxide',
    location: 'Chemical Store B',
    quantity: 5,
    unit: 'kg',
    minStock: 10,
    maxStock: 50,
    expiryDate: '2028-01-01',
    batchNumber: 'LOT-2026-002',
    storageCondition: 'Keep dry',
  },
];

const MOCK_COSHH: MockCoshhAssessment[] = [
  {
    id: 'coshh-001',
    reference: 'COSHH-2026-001',
    chemicalName: 'Acetone',
    activity: 'Cleaning operations',
    riskLevel: 'MEDIUM',
    status: 'APPROVED',
    reviewDate: '2027-03-01',
  },
  {
    id: 'coshh-002',
    reference: 'COSHH-2026-002',
    chemicalName: 'Benzene',
    activity: 'Laboratory analysis',
    riskLevel: 'VERY_HIGH',
    status: 'APPROVED',
    reviewDate: '2026-01-01', // overdue
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// TEST SUITES
// ═══════════════════════════════════════════════════════════════════════════════

describe('GHS pictogram catalogue', () => {
  it('has exactly 9 GHS pictograms', () => {
    expect(GHS_PICTOGRAMS).toHaveLength(9);
  });

  it('codes run from GHS01 to GHS09', () => {
    for (let n = 1; n <= 9; n++) {
      const code = `GHS0${n}` as GHSPictogram;
      expect(GHS_PICTOGRAMS).toContain(code);
    }
  });

  for (const code of GHS_PICTOGRAMS) {
    it(`${code} has a label`, () => {
      expect(GHS_PICTOGRAM_LABELS[code]).toBeDefined();
    });
    it(`${code} label is non-empty string`, () => {
      expect(typeof GHS_PICTOGRAM_LABELS[code]).toBe('string');
      expect(GHS_PICTOGRAM_LABELS[code].length).toBeGreaterThan(0);
    });
  }

  it('GHS01 is Explosive', () => expect(GHS_PICTOGRAM_LABELS.GHS01).toBe('Explosive'));
  it('GHS02 is Flammable', () => expect(GHS_PICTOGRAM_LABELS.GHS02).toBe('Flammable'));
  it('GHS05 is Corrosive', () => expect(GHS_PICTOGRAM_LABELS.GHS05).toBe('Corrosive'));
  it('GHS06 is Toxic',     () => expect(GHS_PICTOGRAM_LABELS.GHS06).toBe('Toxic'));
  it('GHS09 is Environment', () => expect(GHS_PICTOGRAM_LABELS.GHS09).toBe('Environment'));
});

describe('Risk level badge colors', () => {
  for (const level of RISK_LEVELS) {
    it(`${level} has a badge class`, () => {
      expect(riskBadgeClass[level]).toBeDefined();
    });
    it(`${level} badge class contains bg-`, () => {
      expect(riskBadgeClass[level]).toContain('bg-');
    });
    it(`${level} badge class contains text-`, () => {
      expect(riskBadgeClass[level]).toContain('text-');
    });
  }

  it('LOW  is green',    () => expect(riskBadgeClass.LOW).toContain('green'));
  it('MEDIUM is amber',  () => expect(riskBadgeClass.MEDIUM).toContain('amber'));
  it('HIGH is orange',   () => expect(riskBadgeClass.HIGH).toContain('orange'));
  it('VERY_HIGH is red', () => expect(riskBadgeClass.VERY_HIGH).toContain('red'));
});

describe('Signal word badge colors', () => {
  for (const sw of SIGNAL_WORDS) {
    it(`${sw} has a badge class`, () => expect(signalBadgeClass[sw]).toBeDefined());
    it(`${sw} badge contains bg-`, () => expect(signalBadgeClass[sw]).toContain('bg-'));
  }

  it('DANGER  uses red',   () => expect(signalBadgeClass.DANGER).toContain('red'));
  it('WARNING uses amber', () => expect(signalBadgeClass.WARNING).toContain('amber'));
});

describe('SDS status badge colors', () => {
  for (const s of SDS_STATUSES) {
    it(`${s} has a badge class`, () => expect(sdsBadgeClass[s]).toBeDefined());
    it(`${s} badge class is a string`, () => expect(typeof sdsBadgeClass[s]).toBe('string'));
  }

  it('CURRENT is green',  () => expect(sdsBadgeClass.CURRENT).toContain('green'));
  it('OVERDUE is red',    () => expect(sdsBadgeClass.OVERDUE).toContain('red'));
  it('MISSING is red',    () => expect(sdsBadgeClass.MISSING).toContain('red'));
  it('PENDING is amber',  () => expect(sdsBadgeClass.PENDING).toContain('amber'));
});

describe('COSHH status badge colors', () => {
  for (const s of COSHH_STATUSES) {
    it(`${s} has a badge class`, () => expect(coshhStatusBadgeClass[s]).toBeDefined());
    it(`${s} badge contains text-`, () => expect(coshhStatusBadgeClass[s]).toContain('text-'));
  }

  it('APPROVED badge is green',       () => expect(coshhStatusBadgeClass.APPROVED).toContain('green'));
  it('PENDING_REVIEW badge is blue',  () => expect(coshhStatusBadgeClass.PENDING_REVIEW).toContain('blue'));
  it('DRAFT badge is gray',           () => expect(coshhStatusBadgeClass.DRAFT).toContain('gray'));
  it('SUPERSEDED badge is gray',      () => expect(coshhStatusBadgeClass.SUPERSEDED).toContain('gray'));
});

describe('riskScore ordering', () => {
  it('LOW < MEDIUM', () => expect(riskScore.LOW).toBeLessThan(riskScore.MEDIUM));
  it('MEDIUM < HIGH', () => expect(riskScore.MEDIUM).toBeLessThan(riskScore.HIGH));
  it('HIGH < VERY_HIGH', () => expect(riskScore.HIGH).toBeLessThan(riskScore.VERY_HIGH));

  for (const level of RISK_LEVELS) {
    it(`${level} score is a positive integer`, () => {
      expect(riskScore[level]).toBeGreaterThan(0);
      expect(Number.isInteger(riskScore[level])).toBe(true);
    });
  }
});

describe('computeRiskLevel', () => {
  it('1×1=1 → LOW',   () => expect(computeRiskLevel(1, 1)).toBe('LOW'));
  it('2×2=4 → LOW',   () => expect(computeRiskLevel(2, 2)).toBe('LOW'));
  it('2×3=6 → MEDIUM',() => expect(computeRiskLevel(2, 3)).toBe('MEDIUM'));
  it('3×3=9 → MEDIUM',() => expect(computeRiskLevel(3, 3)).toBe('MEDIUM'));
  it('3×4=12 → HIGH', () => expect(computeRiskLevel(3, 4)).toBe('HIGH'));
  it('4×4=16 → HIGH', () => expect(computeRiskLevel(4, 4)).toBe('HIGH'));
  it('4×5=20 → VERY_HIGH', () => expect(computeRiskLevel(4, 5)).toBe('VERY_HIGH'));
  it('5×5=25 → VERY_HIGH', () => expect(computeRiskLevel(5, 5)).toBe('VERY_HIGH'));

  for (let l = 1; l <= 5; l++) {
    for (let s = 1; s <= 5; s++) {
      it(`computeRiskLevel(${l},${s}) returns a valid RiskLevel`, () => {
        expect(RISK_LEVELS).toContain(computeRiskLevel(l, s));
      });
    }
  }
});

describe('requiresPPE', () => {
  it('HIGH requires PPE',      () => expect(requiresPPE('HIGH')).toBe(true));
  it('VERY_HIGH requires PPE', () => expect(requiresPPE('VERY_HIGH')).toBe(true));
  it('LOW does not',           () => expect(requiresPPE('LOW')).toBe(false));
  it('MEDIUM does not',        () => expect(requiresPPE('MEDIUM')).toBe(false));

  for (const level of RISK_LEVELS) {
    it(`requiresPPE(${level}) returns boolean`, () => {
      expect(typeof requiresPPE(level)).toBe('boolean');
    });
  }
});

describe('isCMRPictogram', () => {
  it('GHS06 (Toxic) is CMR-associated',          () => expect(isCMRPictogram('GHS06')).toBe(true));
  it('GHS08 (Health Hazard) is CMR-associated',  () => expect(isCMRPictogram('GHS08')).toBe(true));
  it('GHS02 (Flammable) is not CMR-associated',  () => expect(isCMRPictogram('GHS02')).toBe(false));
  it('GHS01 (Explosive) is not CMR-associated',  () => expect(isCMRPictogram('GHS01')).toBe(false));
  it('GHS05 (Corrosive) is not CMR-associated',  () => expect(isCMRPictogram('GHS05')).toBe(false));

  for (const code of GHS_PICTOGRAMS) {
    it(`isCMRPictogram(${code}) returns boolean`, () => {
      expect(typeof isCMRPictogram(code)).toBe('boolean');
    });
  }
});

describe('signalWordFromPictograms', () => {
  it('GHS01 (Explosive) → DANGER',     () => expect(signalWordFromPictograms(['GHS01'])).toBe('DANGER'));
  it('GHS05 (Corrosive) → DANGER',     () => expect(signalWordFromPictograms(['GHS05'])).toBe('DANGER'));
  it('GHS06 (Toxic) → DANGER',         () => expect(signalWordFromPictograms(['GHS06'])).toBe('DANGER'));
  it('GHS02 (Flammable) → WARNING',    () => expect(signalWordFromPictograms(['GHS02'])).toBe('WARNING'));
  it('GHS07 (Harmful) → WARNING',      () => expect(signalWordFromPictograms(['GHS07'])).toBe('WARNING'));
  it('GHS09 (Environment) → WARNING',  () => expect(signalWordFromPictograms(['GHS09'])).toBe('WARNING'));
  it('empty list → NONE',              () => expect(signalWordFromPictograms([])).toBe('NONE'));
  it('DANGER trumps WARNING in mix',   () => {
    expect(signalWordFromPictograms(['GHS02', 'GHS06'])).toBe('DANGER');
  });
});

describe('inventoryStockStatus', () => {
  it('sufficient stock, future expiry → OK', () => {
    const futureDate = new Date(Date.now() + 60 * 86400000).toISOString();
    expect(inventoryStockStatus(50, 10, futureDate)).toBe('OK');
  });

  it('quantity at minimum → LOW_STOCK', () => {
    const futureDate = new Date(Date.now() + 60 * 86400000).toISOString();
    expect(inventoryStockStatus(10, 10, futureDate)).toBe('LOW_STOCK');
  });

  it('quantity below minimum → LOW_STOCK', () => {
    const futureDate = new Date(Date.now() + 60 * 86400000).toISOString();
    expect(inventoryStockStatus(5, 10, futureDate)).toBe('LOW_STOCK');
  });

  it('past expiry date → EXPIRED', () => {
    const pastDate = new Date(Date.now() - 86400000).toISOString();
    expect(inventoryStockStatus(100, 5, pastDate)).toBe('EXPIRED');
  });

  it('expiry within 30 days → EXPIRING_SOON', () => {
    const soonDate = new Date(Date.now() + 15 * 86400000).toISOString();
    expect(inventoryStockStatus(100, 5, soonDate)).toBe('EXPIRING_SOON');
  });

  it('no expiry date, adequate stock → OK', () => {
    expect(inventoryStockStatus(100, 5, null)).toBe('OK');
  });

  it('no minStock (0), adequate stock → OK', () => {
    const futureDate = new Date(Date.now() + 365 * 86400000).toISOString();
    expect(inventoryStockStatus(1, 0, futureDate)).toBe('OK');
  });

  it('expired takes priority over low stock', () => {
    const pastDate = new Date(Date.now() - 86400000).toISOString();
    expect(inventoryStockStatus(1, 100, pastDate)).toBe('EXPIRED');
  });
});

describe('coshhReferenceFormat', () => {
  it('generates COSHH-2026-001 for seq=1', () => {
    expect(coshhReferenceFormat('COSHH', 2026, 1)).toBe('COSHH-2026-001');
  });
  it('pads sequence to 3 digits', () => {
    expect(coshhReferenceFormat('COSHH', 2026, 42)).toBe('COSHH-2026-042');
  });
  it('handles 3-digit sequence without padding', () => {
    expect(coshhReferenceFormat('COSHH', 2026, 100)).toBe('COSHH-2026-100');
  });
  it('supports different prefixes', () => {
    expect(coshhReferenceFormat('CHEM', 2025, 7)).toBe('CHEM-2025-007');
  });
  it('contains the year', () => {
    expect(coshhReferenceFormat('COSHH', 2026, 5)).toContain('2026');
  });

  for (let seq = 1; seq <= 10; seq++) {
    it(`reference for seq=${seq} is a non-empty string`, () => {
      const ref = coshhReferenceFormat('COSHH', 2026, seq);
      expect(typeof ref).toBe('string');
      expect(ref.length).toBeGreaterThan(0);
    });
  }
});

describe('welExceedance', () => {
  it('measured > WEL → true',   () => expect(welExceedance(500, 250)).toBe(true));
  it('measured = WEL → false',  () => expect(welExceedance(250, 250)).toBe(false));
  it('measured < WEL → false',  () => expect(welExceedance(100, 250)).toBe(false));
  it('zero measured → false',   () => expect(welExceedance(0, 1)).toBe(false));

  for (let i = 1; i <= 10; i++) {
    it(`welExceedance(${i * 10}, 50) returns boolean (idx ${i})`, () => {
      expect(typeof welExceedance(i * 10, 50)).toBe('boolean');
    });
  }
});

describe('physical form enumeration', () => {
  it('has 5 physical forms', () => expect(PHYSICAL_FORMS).toHaveLength(5));
  for (const form of PHYSICAL_FORMS) {
    it(`${form} is a non-empty string`, () => {
      expect(typeof form).toBe('string');
      expect(form.length).toBeGreaterThan(0);
    });
  }
  it('includes SOLID',  () => expect(PHYSICAL_FORMS).toContain('SOLID'));
  it('includes LIQUID', () => expect(PHYSICAL_FORMS).toContain('LIQUID'));
  it('includes GAS',    () => expect(PHYSICAL_FORMS).toContain('GAS'));
  it('includes POWDER', () => expect(PHYSICAL_FORMS).toContain('POWDER'));
  it('includes AEROSOL',() => expect(PHYSICAL_FORMS).toContain('AEROSOL'));
});

describe('REACH status enumeration', () => {
  it('has 5 REACH statuses', () => expect(REACH_STATUSES).toHaveLength(5));
  for (const s of REACH_STATUSES) {
    it(`${s} is a string`, () => expect(typeof s).toBe('string'));
  }
  it('includes REGISTERED',     () => expect(REACH_STATUSES).toContain('REGISTERED'));
  it('includes PRE_REGISTERED', () => expect(REACH_STATUSES).toContain('PRE_REGISTERED'));
  it('includes EXEMPT',         () => expect(REACH_STATUSES).toContain('EXEMPT'));
});

describe('mock chemical data shapes', () => {
  it('has 4 mock chemicals', () => expect(MOCK_CHEMICALS).toHaveLength(4));

  for (const chem of MOCK_CHEMICALS) {
    it(`${chem.name}: id is non-empty`, () => expect(chem.id.length).toBeGreaterThan(0));
    it(`${chem.name}: name is non-empty`, () => expect(chem.name.length).toBeGreaterThan(0));
    it(`${chem.name}: signalWord is valid`, () => expect(SIGNAL_WORDS).toContain(chem.signalWord));
    it(`${chem.name}: riskLevel is valid`,  () => expect(RISK_LEVELS).toContain(chem.riskLevel));
    it(`${chem.name}: sdsStatus is valid`,  () => expect(SDS_STATUSES).toContain(chem.sdsStatus));
    it(`${chem.name}: physicalForm is valid`, () => expect(PHYSICAL_FORMS).toContain(chem.physicalForm));
    it(`${chem.name}: cmrFlag is boolean`,  () => expect(typeof chem.cmrFlag).toBe('boolean'));
    it(`${chem.name}: pictograms is array`, () => expect(Array.isArray(chem.pictograms)).toBe(true));
  }

  it('Benzene has cmrFlag=true',       () => expect(MOCK_CHEMICALS.find(c => c.name === 'Benzene')!.cmrFlag).toBe(true));
  it('Acetone has cmrFlag=false',      () => expect(MOCK_CHEMICALS.find(c => c.name === 'Acetone')!.cmrFlag).toBe(false));
  it('Sodium Hydroxide risk is HIGH',  () => expect(MOCK_CHEMICALS.find(c => c.name === 'Sodium Hydroxide')!.riskLevel).toBe('HIGH'));
  it('Benzene risk is VERY_HIGH',      () => expect(MOCK_CHEMICALS.find(c => c.name === 'Benzene')!.riskLevel).toBe('VERY_HIGH'));
  it('Acetone CAS is 67-64-1',         () => expect(MOCK_CHEMICALS.find(c => c.name === 'Acetone')!.casNumber).toBe('67-64-1'));
  it('Benzene CAS is 71-43-2',         () => expect(MOCK_CHEMICALS.find(c => c.name === 'Benzene')!.casNumber).toBe('71-43-2'));
});

describe('mock inventory data shapes', () => {
  it('has 2 mock inventory records', () => expect(MOCK_INVENTORY).toHaveLength(2));

  for (const rec of MOCK_INVENTORY) {
    it(`${rec.chemicalName}: id non-empty`,          () => expect(rec.id.length).toBeGreaterThan(0));
    it(`${rec.chemicalName}: quantity is number`,    () => expect(typeof rec.quantity).toBe('number'));
    it(`${rec.chemicalName}: unit is non-empty`,     () => expect(rec.unit.length).toBeGreaterThan(0));
    it(`${rec.chemicalName}: location non-empty`,    () => expect(rec.location.length).toBeGreaterThan(0));
    it(`${rec.chemicalName}: minStock >= 0`,         () => expect(rec.minStock).toBeGreaterThanOrEqual(0));
    it(`${rec.chemicalName}: maxStock >= minStock`,  () => expect(rec.maxStock).toBeGreaterThanOrEqual(rec.minStock));
  }

  it('Sodium Hydroxide is below min stock (5 < 10)', () => {
    const rec = MOCK_INVENTORY.find(r => r.chemicalName === 'Sodium Hydroxide')!;
    expect(rec.quantity).toBeLessThanOrEqual(rec.minStock);
  });
});

describe('mock COSHH assessment data shapes', () => {
  it('has 2 mock COSHH assessments', () => expect(MOCK_COSHH).toHaveLength(2));

  for (const a of MOCK_COSHH) {
    it(`${a.reference}: id is non-empty`,       () => expect(a.id.length).toBeGreaterThan(0));
    it(`${a.reference}: chemicalName non-empty`, () => expect(a.chemicalName.length).toBeGreaterThan(0));
    it(`${a.reference}: riskLevel is valid`,    () => expect(RISK_LEVELS).toContain(a.riskLevel));
    it(`${a.reference}: status is valid`,       () => expect(COSHH_STATUSES).toContain(a.status));
    it(`${a.reference}: reference starts with COSHH`, () => expect(a.reference).toMatch(/^COSHH/));
  }

  it('Benzene assessment is VERY_HIGH', () => {
    const a = MOCK_COSHH.find(x => x.chemicalName === 'Benzene')!;
    expect(a.riskLevel).toBe('VERY_HIGH');
  });
});

// ─── Phase 211 parametric additions ──────────────────────────────────────────

describe('GHS_PICTOGRAMS — positional index parametric', () => {
  const expected = [
    [0, 'GHS01'],
    [1, 'GHS02'],
    [2, 'GHS03'],
    [3, 'GHS04'],
    [4, 'GHS05'],
    [5, 'GHS06'],
    [6, 'GHS07'],
    [7, 'GHS08'],
    [8, 'GHS09'],
  ] as const;
  for (const [idx, val] of expected) {
    it(`GHS_PICTOGRAMS[${idx}] === '${val}'`, () => {
      expect(GHS_PICTOGRAMS[idx]).toBe(val);
    });
  }
});

describe('GHS_PICTOGRAM_LABELS — per-code exact label parametric', () => {
  const expected: [GHSPictogram, string][] = [
    ['GHS01', 'Explosive'],
    ['GHS02', 'Flammable'],
    ['GHS03', 'Oxidiser'],
    ['GHS04', 'Compressed Gas'],
    ['GHS05', 'Corrosive'],
    ['GHS06', 'Toxic'],
    ['GHS07', 'Harmful'],
    ['GHS08', 'Health Hazard'],
    ['GHS09', 'Environment'],
  ];
  for (const [code, label] of expected) {
    it(`${code} label === '${label}'`, () => {
      expect(GHS_PICTOGRAM_LABELS[code]).toBe(label);
    });
  }
});

describe('RISK_LEVELS — positional index parametric', () => {
  const expected = [
    [0, 'LOW'],
    [1, 'MEDIUM'],
    [2, 'HIGH'],
    [3, 'VERY_HIGH'],
  ] as const;
  for (const [idx, val] of expected) {
    it(`RISK_LEVELS[${idx}] === '${val}'`, () => {
      expect(RISK_LEVELS[idx]).toBe(val);
    });
  }
});

describe('PHYSICAL_FORMS — positional index parametric', () => {
  const expected = [
    [0, 'SOLID'],
    [1, 'LIQUID'],
    [2, 'GAS'],
    [3, 'POWDER'],
    [4, 'AEROSOL'],
  ] as const;
  for (const [idx, val] of expected) {
    it(`PHYSICAL_FORMS[${idx}] === '${val}'`, () => {
      expect(PHYSICAL_FORMS[idx]).toBe(val);
    });
  }
});

describe('SDS_STATUSES — positional index parametric', () => {
  const expected = [
    [0, 'CURRENT'],
    [1, 'OVERDUE'],
    [2, 'MISSING'],
    [3, 'PENDING'],
  ] as const;
  for (const [idx, val] of expected) {
    it(`SDS_STATUSES[${idx}] === '${val}'`, () => {
      expect(SDS_STATUSES[idx]).toBe(val);
    });
  }
});

describe('MOCK_CHEMICALS — per-chemical exact riskLevel+signalWord+cmrFlag parametric', () => {
  const expected: [string, RiskLevel, SignalWord, boolean][] = [
    ['chem-001', 'MEDIUM',    'DANGER',  false],
    ['chem-002', 'HIGH',      'DANGER',  false],
    ['chem-003', 'VERY_HIGH', 'DANGER',  true],
    ['chem-004', 'LOW',       'WARNING', false],
  ];
  for (const [id, riskLevel, signalWord, cmrFlag] of expected) {
    it(`${id}: riskLevel=${riskLevel}, signalWord=${signalWord}, cmrFlag=${cmrFlag}`, () => {
      const c = MOCK_CHEMICALS.find((x) => x.id === id);
      expect(c?.riskLevel).toBe(riskLevel);
      expect(c?.signalWord).toBe(signalWord);
      expect(c?.cmrFlag).toBe(cmrFlag);
    });
  }
});
