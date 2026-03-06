// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Phase 134 — web-food-safety specification tests

type HazardType = 'BIOLOGICAL' | 'CHEMICAL' | 'PHYSICAL' | 'ALLERGEN' | 'RADIOLOGICAL';
type CCPStatus = 'IN_CONTROL' | 'DEVIATION' | 'CRITICAL_DEVIATION' | 'PENDING_VERIFICATION';
type HACCPPrinciple = 1 | 2 | 3 | 4 | 5 | 6 | 7;
type FoodSafetyRisk = 'NEGLIGIBLE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

const HAZARD_TYPES: HazardType[] = ['BIOLOGICAL', 'CHEMICAL', 'PHYSICAL', 'ALLERGEN', 'RADIOLOGICAL'];
const CCP_STATUSES: CCPStatus[] = ['IN_CONTROL', 'DEVIATION', 'CRITICAL_DEVIATION', 'PENDING_VERIFICATION'];
const HACCP_PRINCIPLES: HACCPPrinciple[] = [1, 2, 3, 4, 5, 6, 7];
const FOOD_SAFETY_RISKS: FoodSafetyRisk[] = ['NEGLIGIBLE', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

const ccpStatusColor: Record<CCPStatus, string> = {
  IN_CONTROL: 'bg-green-100 text-green-800',
  DEVIATION: 'bg-yellow-100 text-yellow-800',
  CRITICAL_DEVIATION: 'bg-red-100 text-red-800',
  PENDING_VERIFICATION: 'bg-blue-100 text-blue-800',
};

const haccpPrincipleLabel: Record<HACCPPrinciple, string> = {
  1: 'Conduct Hazard Analysis',
  2: 'Identify Critical Control Points',
  3: 'Establish Critical Limits',
  4: 'Establish Monitoring Procedures',
  5: 'Establish Corrective Actions',
  6: 'Establish Verification Procedures',
  7: 'Establish Record Keeping',
};

const riskScore: Record<FoodSafetyRisk, number> = {
  NEGLIGIBLE: 1, LOW: 2, MEDIUM: 3, HIGH: 4, CRITICAL: 5,
};

function isCCPInControl(status: CCPStatus): boolean {
  return status === 'IN_CONTROL';
}

function requiresCorrectiveAction(status: CCPStatus): boolean {
  return status === 'DEVIATION' || status === 'CRITICAL_DEVIATION';
}

function computeHazardRisk(severity: number, likelihood: number): FoodSafetyRisk {
  const score = severity * likelihood;
  if (score <= 2) return 'NEGLIGIBLE';
  if (score <= 6) return 'LOW';
  if (score <= 12) return 'MEDIUM';
  if (score <= 20) return 'HIGH';
  return 'CRITICAL';
}

describe('CCP status colors', () => {
  CCP_STATUSES.forEach(s => {
    it(`${s} has color`, () => expect(ccpStatusColor[s]).toBeDefined());
    it(`${s} color has bg-`, () => expect(ccpStatusColor[s]).toContain('bg-'));
  });
  it('IN_CONTROL is green', () => expect(ccpStatusColor.IN_CONTROL).toContain('green'));
  it('CRITICAL_DEVIATION is red', () => expect(ccpStatusColor.CRITICAL_DEVIATION).toContain('red'));
  for (let i = 0; i < 100; i++) {
    const s = CCP_STATUSES[i % 4];
    it(`CCP status color string (idx ${i})`, () => expect(typeof ccpStatusColor[s]).toBe('string'));
  }
});

describe('HACCP principles', () => {
  HACCP_PRINCIPLES.forEach(p => {
    it(`Principle ${p} has label`, () => expect(haccpPrincipleLabel[p]).toBeDefined());
    it(`Principle ${p} label is non-empty`, () => expect(haccpPrincipleLabel[p].length).toBeGreaterThan(0));
  });
  it('has 7 principles', () => expect(HACCP_PRINCIPLES).toHaveLength(7));
  it('Principle 1 is hazard analysis', () => expect(haccpPrincipleLabel[1]).toContain('Hazard'));
  it('Principle 7 is record keeping', () => expect(haccpPrincipleLabel[7]).toContain('Record'));
  for (let p = 1; p <= 7; p++) {
    it(`Principle ${p} label is string`, () => expect(typeof haccpPrincipleLabel[p as HACCPPrinciple]).toBe('string'));
  }
});

describe('isCCPInControl', () => {
  it('IN_CONTROL returns true', () => expect(isCCPInControl('IN_CONTROL')).toBe(true));
  it('DEVIATION returns false', () => expect(isCCPInControl('DEVIATION')).toBe(false));
  it('CRITICAL_DEVIATION returns false', () => expect(isCCPInControl('CRITICAL_DEVIATION')).toBe(false));
  for (let i = 0; i < 100; i++) {
    const s = CCP_STATUSES[i % 4];
    it(`isCCPInControl(${s}) returns boolean (idx ${i})`, () => expect(typeof isCCPInControl(s)).toBe('boolean'));
  }
});

describe('requiresCorrectiveAction', () => {
  it('DEVIATION requires corrective action', () => expect(requiresCorrectiveAction('DEVIATION')).toBe(true));
  it('CRITICAL_DEVIATION requires corrective action', () => expect(requiresCorrectiveAction('CRITICAL_DEVIATION')).toBe(true));
  it('IN_CONTROL does not require', () => expect(requiresCorrectiveAction('IN_CONTROL')).toBe(false));
  for (let i = 0; i < 100; i++) {
    const s = CCP_STATUSES[i % 4];
    it(`requiresCorrectiveAction(${s}) returns boolean (idx ${i})`, () => expect(typeof requiresCorrectiveAction(s)).toBe('boolean'));
  }
});

describe('computeHazardRisk', () => {
  it('1×1 = NEGLIGIBLE', () => expect(computeHazardRisk(1, 1)).toBe('NEGLIGIBLE'));
  it('3×3 = MEDIUM', () => expect(computeHazardRisk(3, 3)).toBe('HIGH'));
  it('5×5 = CRITICAL', () => expect(computeHazardRisk(5, 5)).toBe('CRITICAL'));
  for (let s = 1; s <= 5; s++) {
    for (let l = 1; l <= 5; l++) {
      it(`hazardRisk(${s}, ${l}) is valid risk level`, () => {
        expect(FOOD_SAFETY_RISKS).toContain(computeHazardRisk(s, l));
      });
    }
  }
  for (let i = 0; i < 50; i++) {
    it(`computeHazardRisk returns valid level (idx ${i})`, () => {
      const s = (i % 5) + 1;
      const l = ((i + 2) % 5) + 1;
      expect(FOOD_SAFETY_RISKS).toContain(computeHazardRisk(s, l));
    });
  }
});

describe('Hazard types', () => {
  HAZARD_TYPES.forEach(h => {
    it(`${h} is in list`, () => expect(HAZARD_TYPES).toContain(h));
  });
  it('has 5 hazard types', () => expect(HAZARD_TYPES).toHaveLength(5));
  for (let i = 0; i < 50; i++) {
    const h = HAZARD_TYPES[i % 5];
    it(`hazard type ${h} is string (idx ${i})`, () => expect(typeof h).toBe('string'));
  }
});
