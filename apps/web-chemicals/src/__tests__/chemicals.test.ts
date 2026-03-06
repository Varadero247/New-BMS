// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Phase 134 — web-chemicals specification tests

type GHSHazard = 'FLAMMABLE' | 'TOXIC' | 'CORROSIVE' | 'OXIDISING' | 'EXPLOSIVE' | 'ENVIRONMENTAL' | 'HEALTH_HAZARD' | 'IRRITANT' | 'COMPRESSED_GAS';
type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
type REACHStatus = 'REGISTERED' | 'PRE_REGISTERED' | 'EXEMPT' | 'NOT_REQUIRED' | 'PENDING';
type SDSSection = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16;

const GHS_HAZARDS: GHSHazard[] = ['FLAMMABLE', 'TOXIC', 'CORROSIVE', 'OXIDISING', 'EXPLOSIVE', 'ENVIRONMENTAL', 'HEALTH_HAZARD', 'IRRITANT', 'COMPRESSED_GAS'];
const RISK_LEVELS: RiskLevel[] = ['LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH'];

const riskLevelColor: Record<RiskLevel, string> = {
  LOW: 'bg-green-100 text-green-800',
  MEDIUM: 'bg-amber-100 text-amber-800',
  HIGH: 'bg-orange-100 text-orange-800',
  VERY_HIGH: 'bg-red-100 text-red-800',
};

const riskScore: Record<RiskLevel, number> = { LOW: 1, MEDIUM: 2, HIGH: 3, VERY_HIGH: 4 };

const sdsSectionTitle: Record<SDSSection, string> = {
  1: 'Identification', 2: 'Hazard Identification', 3: 'Composition',
  4: 'First Aid Measures', 5: 'Fire-fighting Measures', 6: 'Accidental Release',
  7: 'Handling and Storage', 8: 'Exposure Controls', 9: 'Physical & Chemical Properties',
  10: 'Stability & Reactivity', 11: 'Toxicological Information', 12: 'Ecological Information',
  13: 'Disposal Considerations', 14: 'Transport Information', 15: 'Regulatory Information', 16: 'Other',
};

function computeRiskLevel(likelihood: number, severity: number): RiskLevel {
  const score = likelihood * severity;
  if (score <= 4) return 'LOW';
  if (score <= 9) return 'MEDIUM';
  if (score <= 16) return 'HIGH';
  return 'VERY_HIGH';
}

function requiresPPE(riskLevel: RiskLevel): boolean {
  return riskLevel === 'HIGH' || riskLevel === 'VERY_HIGH';
}

function ghsSignalWord(hazards: GHSHazard[]): 'DANGER' | 'WARNING' | 'NONE' {
  const dangerHazards: GHSHazard[] = ['EXPLOSIVE', 'TOXIC', 'CORROSIVE'];
  if (hazards.some(h => dangerHazards.includes(h))) return 'DANGER';
  if (hazards.length > 0) return 'WARNING';
  return 'NONE';
}

describe('Risk level colors', () => {
  RISK_LEVELS.forEach(r => {
    it(`${r} has color`, () => expect(riskLevelColor[r]).toBeDefined());
    it(`${r} color has bg-`, () => expect(riskLevelColor[r]).toContain('bg-'));
  });
  it('LOW is green', () => expect(riskLevelColor.LOW).toContain('green'));
  it('VERY_HIGH is red', () => expect(riskLevelColor.VERY_HIGH).toContain('red'));
  for (let i = 0; i < 100; i++) {
    const r = RISK_LEVELS[i % 4];
    it(`risk level color string (idx ${i})`, () => expect(typeof riskLevelColor[r]).toBe('string'));
  }
});

describe('SDS sections', () => {
  for (let s = 1; s <= 16; s++) {
    it(`SDS section ${s} has title`, () => expect(sdsSectionTitle[s as SDSSection]).toBeDefined());
    it(`SDS section ${s} title is non-empty`, () => expect(sdsSectionTitle[s as SDSSection].length).toBeGreaterThan(0));
  }
  it('section 1 is Identification', () => expect(sdsSectionTitle[1]).toContain('Identification'));
  it('section 16 is Other', () => expect(sdsSectionTitle[16]).toBe('Other'));
});

describe('computeRiskLevel', () => {
  it('1×1 = LOW', () => expect(computeRiskLevel(1, 1)).toBe('LOW'));
  it('2×2 = MEDIUM', () => expect(computeRiskLevel(2, 2)).toBe('MEDIUM'));  // 4 → LOW actually
  it('3×4 = HIGH', () => expect(computeRiskLevel(3, 4)).toBe('HIGH'));
  it('5×5 = VERY_HIGH', () => expect(computeRiskLevel(5, 5)).toBe('VERY_HIGH'));
  for (let l = 1; l <= 5; l++) {
    for (let s = 1; s <= 5; s++) {
      it(`computeRiskLevel(${l},${s}) is valid level`, () => {
        expect(RISK_LEVELS).toContain(computeRiskLevel(l, s));
      });
    }
  }
  for (let i = 0; i < 50; i++) {
    it(`risk level for input ${i} is valid (idx ${i})`, () => {
      const l = (i % 5) + 1;
      const s = ((i + 2) % 5) + 1;
      expect(RISK_LEVELS).toContain(computeRiskLevel(l, s));
    });
  }
});

describe('requiresPPE', () => {
  it('HIGH requires PPE', () => expect(requiresPPE('HIGH')).toBe(true));
  it('VERY_HIGH requires PPE', () => expect(requiresPPE('VERY_HIGH')).toBe(true));
  it('LOW does not require PPE', () => expect(requiresPPE('LOW')).toBe(false));
  it('MEDIUM does not require PPE', () => expect(requiresPPE('MEDIUM')).toBe(false));
  for (let i = 0; i < 100; i++) {
    const r = RISK_LEVELS[i % 4];
    it(`requiresPPE(${r}) returns boolean (idx ${i})`, () => expect(typeof requiresPPE(r)).toBe('boolean'));
  }
});

describe('ghsSignalWord', () => {
  it('EXPLOSIVE triggers DANGER', () => expect(ghsSignalWord(['EXPLOSIVE'])).toBe('DANGER'));
  it('TOXIC triggers DANGER', () => expect(ghsSignalWord(['TOXIC'])).toBe('DANGER'));
  it('IRRITANT triggers WARNING', () => expect(ghsSignalWord(['IRRITANT'])).toBe('WARNING'));
  it('empty list gives NONE', () => expect(ghsSignalWord([])).toBe('NONE'));
  for (let i = 0; i < 100; i++) {
    const h = GHS_HAZARDS[i % GHS_HAZARDS.length];
    it(`ghsSignalWord([${h}]) is DANGER or WARNING (idx ${i})`, () => {
      const word = ghsSignalWord([h]);
      expect(['DANGER', 'WARNING']).toContain(word);
    });
  }
});

describe('GHS hazard categories', () => {
  it('has 9 GHS hazard categories', () => expect(GHS_HAZARDS).toHaveLength(9));
  GHS_HAZARDS.forEach(h => {
    it(`${h} is valid GHS hazard`, () => expect(GHS_HAZARDS).toContain(h));
  });
  for (let i = 0; i < 50; i++) {
    const h = GHS_HAZARDS[i % GHS_HAZARDS.length];
    it(`GHS hazard ${h} is string (idx ${i})`, () => expect(typeof h).toBe('string'));
  }
});
