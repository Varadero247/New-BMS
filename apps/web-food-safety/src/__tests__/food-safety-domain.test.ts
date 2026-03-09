// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

/**
 * web-food-safety domain spec tests
 *
 * Covers (all inlined — no source imports):
 *   - HACCP hazard types, CCP statuses, severity/likelihood arrays
 *   - Allergen type list (14 EU Regulation 1169/2011 allergens)
 *   - HACCP step type array and process flow metadata
 *   - Badge/colour maps for hazard type, severity, CCP status
 *   - MOCK HACCP steps and CCP datasets
 *   - Hazard risk scoring helpers (severity × likelihood matrix)
 *   - CCP status helpers (in-control, corrective action)
 *   - Critical-limit tolerance helpers
 */

// ─── Types ───────────────────────────────────────────────────────────────────

type HazardType = 'BIOLOGICAL' | 'CHEMICAL' | 'PHYSICAL' | 'ALLERGENIC';
type HazardSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
type HazardLikelihood = 'RARE' | 'UNLIKELY' | 'POSSIBLE' | 'LIKELY' | 'ALMOST_CERTAIN';
type HazardStatus = 'IDENTIFIED' | 'UNDER_REVIEW' | 'CONTROLLED' | 'CLOSED';
type CCPStatus = 'ACTIVE' | 'IN_CONTROL' | 'DEVIATION' | 'INACTIVE';
type MonitoringFrequency =
  | 'CONTINUOUS'
  | 'EVERY_BATCH'
  | 'HOURLY'
  | 'DAILY'
  | 'WEEKLY';
type AllergenStatus = 'ACTIVE' | 'MANAGED' | 'INACTIVE';
type HaccpStepType =
  | 'receive'
  | 'storage'
  | 'preparation'
  | 'processing'
  | 'cooling'
  | 'packaging'
  | 'dispatch'
  | 'ccp';
type FlowHazardType = 'Biological' | 'Chemical' | 'Physical' | 'Allergen';
type FlowHazardSeverity = 'High' | 'Medium' | 'Low';
type FoodSafetyRisk = 'NEGLIGIBLE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

// ─── Domain arrays ────────────────────────────────────────────────────────────

const HAZARD_TYPES: HazardType[] = ['BIOLOGICAL', 'CHEMICAL', 'PHYSICAL', 'ALLERGENIC'];
const HAZARD_SEVERITIES: HazardSeverity[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const HAZARD_LIKELIHOODS: HazardLikelihood[] = [
  'RARE',
  'UNLIKELY',
  'POSSIBLE',
  'LIKELY',
  'ALMOST_CERTAIN',
];
const HAZARD_STATUSES: HazardStatus[] = [
  'IDENTIFIED',
  'UNDER_REVIEW',
  'CONTROLLED',
  'CLOSED',
];
const CCP_STATUSES: CCPStatus[] = ['ACTIVE', 'IN_CONTROL', 'DEVIATION', 'INACTIVE'];
const MONITORING_FREQUENCIES: MonitoringFrequency[] = [
  'CONTINUOUS',
  'EVERY_BATCH',
  'HOURLY',
  'DAILY',
  'WEEKLY',
];
const ALLERGEN_STATUSES: AllergenStatus[] = ['ACTIVE', 'MANAGED', 'INACTIVE'];
const HACCP_STEP_TYPES: HaccpStepType[] = [
  'receive',
  'storage',
  'preparation',
  'processing',
  'cooling',
  'packaging',
  'dispatch',
  'ccp',
];
const FLOW_HAZARD_TYPES: FlowHazardType[] = [
  'Biological',
  'Chemical',
  'Physical',
  'Allergen',
];
const FOOD_SAFETY_RISKS: FoodSafetyRisk[] = [
  'NEGLIGIBLE',
  'LOW',
  'MEDIUM',
  'HIGH',
  'CRITICAL',
];

// ─── 14 EU allergens (Regulation 1169/2011) ──────────────────────────────────

const EU_ALLERGENS = [
  'CELERY',
  'CEREALS_GLUTEN',
  'CRUSTACEANS',
  'EGGS',
  'FISH',
  'LUPIN',
  'MILK',
  'MOLLUSCS',
  'MUSTARD',
  'PEANUTS',
  'SESAME',
  'SOY',
  'SULPHITES',
  'TREE_NUTS',
] as const;

// ─── Badge / colour maps ──────────────────────────────────────────────────────

const severityColor: Record<HazardSeverity, string> = {
  LOW: 'bg-green-100 text-green-700',
  MEDIUM: 'bg-yellow-100 text-yellow-700',
  HIGH: 'bg-orange-100 text-orange-700',
  CRITICAL: 'bg-red-100 text-red-700',
};

const hazardFlowColor: Record<FlowHazardType, string> = {
  Biological: 'bg-red-100 text-red-700',
  Chemical: 'bg-purple-100 text-purple-700',
  Physical: 'bg-orange-100 text-orange-700',
  Allergen: 'bg-pink-100 text-pink-700',
};

const stepTypeColor: Record<HaccpStepType, string> = {
  receive: 'border-sky-400 bg-sky-50',
  storage: 'border-blue-400 bg-blue-50',
  preparation: 'border-yellow-400 bg-yellow-50',
  processing: 'border-orange-400 bg-orange-50',
  cooling: 'border-cyan-400 bg-cyan-50',
  packaging: 'border-green-400 bg-green-50',
  dispatch: 'border-gray-400 bg-gray-50',
  ccp: 'border-red-500 bg-red-50',
};

const ccpStatusBadgeColor: Record<CCPStatus, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  IN_CONTROL: 'bg-green-100 text-green-700',
  DEVIATION: 'bg-red-100 text-red-700',
  INACTIVE: 'bg-yellow-100 text-yellow-700',
};

// ─── MOCK HACCP process steps ─────────────────────────────────────────────────

interface MockHaccpStep {
  id: string;
  number: number;
  name: string;
  type: HaccpStepType;
  isCCP: boolean;
  ccpNumber?: string;
  hazards: { type: FlowHazardType; severity: FlowHazardSeverity }[];
  criticalLimits?: string;
}

const MOCK_HACCP_STEPS: MockHaccpStep[] = [
  {
    id: 's1',
    number: 1,
    name: 'Receiving Raw Materials',
    type: 'receive',
    isCCP: false,
    hazards: [
      { type: 'Biological', severity: 'High' },
      { type: 'Chemical', severity: 'Medium' },
      { type: 'Physical', severity: 'Medium' },
    ],
  },
  {
    id: 's2',
    number: 2,
    name: 'Cold Storage (Refrigerated)',
    type: 'storage',
    isCCP: true,
    ccpNumber: 'CCP-1',
    hazards: [{ type: 'Biological', severity: 'High' }],
    criticalLimits: 'Temperature <= 5°C',
  },
  {
    id: 's3',
    number: 3,
    name: 'Ingredient Preparation',
    type: 'preparation',
    isCCP: false,
    hazards: [
      { type: 'Physical', severity: 'Medium' },
      { type: 'Allergen', severity: 'High' },
    ],
  },
  {
    id: 's4',
    number: 4,
    name: 'Thermal Processing (Cooking)',
    type: 'processing',
    isCCP: true,
    ccpNumber: 'CCP-2',
    hazards: [{ type: 'Biological', severity: 'High' }],
    criticalLimits: 'Core temperature >= 75°C for 15 seconds',
  },
  {
    id: 's5',
    number: 5,
    name: 'Rapid Cooling',
    type: 'cooling',
    isCCP: true,
    ccpNumber: 'CCP-3',
    hazards: [{ type: 'Biological', severity: 'High' }],
    criticalLimits: 'Cool from 60°C to 10°C within 4 hours',
  },
  {
    id: 's6',
    number: 6,
    name: 'Metal Detection',
    type: 'processing',
    isCCP: true,
    ccpNumber: 'CCP-4',
    hazards: [{ type: 'Physical', severity: 'High' }],
    criticalLimits: 'Fe: 1.5mm, Non-Fe: 2.0mm, SS: 2.5mm',
  },
  {
    id: 's7',
    number: 7,
    name: 'Packaging & Labelling',
    type: 'packaging',
    isCCP: false,
    hazards: [
      { type: 'Allergen', severity: 'High' },
      { type: 'Chemical', severity: 'Low' },
    ],
  },
  {
    id: 's8',
    number: 8,
    name: 'Cold Storage (Finished Product)',
    type: 'storage',
    isCCP: false,
    hazards: [{ type: 'Biological', severity: 'Medium' }],
  },
  {
    id: 's9',
    number: 9,
    name: 'Dispatch & Distribution',
    type: 'dispatch',
    isCCP: false,
    hazards: [{ type: 'Biological', severity: 'Medium' }],
  },
];

// ─── Pure helpers ─────────────────────────────────────────────────────────────

function isCCPInControl(status: CCPStatus): boolean {
  return status === 'ACTIVE' || status === 'IN_CONTROL';
}

function requiresCorrectiveAction(status: CCPStatus): boolean {
  return status === 'DEVIATION';
}

function computeHazardRisk(severity: number, likelihood: number): FoodSafetyRisk {
  const score = severity * likelihood;
  if (score <= 2) return 'NEGLIGIBLE';
  if (score <= 6) return 'LOW';
  if (score <= 12) return 'MEDIUM';
  if (score <= 20) return 'HIGH';
  return 'CRITICAL';
}

function allergenDisplayName(allergen: string): string {
  return allergen.replace(/_/g, ' ');
}

function ccpCount(steps: { isCCP: boolean }[]): number {
  return steps.filter((s) => s.isCCP).length;
}

function totalHazardCount(steps: { hazards: unknown[] }[]): number {
  return steps.reduce((acc, s) => acc + s.hazards.length, 0);
}

function highRiskHazardCount(
  steps: { hazards: { severity: FlowHazardSeverity }[] }[]
): number {
  return steps.reduce(
    (acc, s) => acc + s.hazards.filter((h) => h.severity === 'High').length,
    0
  );
}

function isTemperatureWithinLimit(actual: number, limit: number): boolean {
  return actual <= limit;
}

function isCookingTemperatureMet(actual: number): boolean {
  return actual >= 75;
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Hazard type array', () => {
  it('has 4 hazard types', () => expect(HAZARD_TYPES).toHaveLength(4));
  for (const h of HAZARD_TYPES) {
    it(`${h} is a string`, () => expect(typeof h).toBe('string'));
    it(`${h} is uppercase`, () => expect(h).toBe(h.toUpperCase()));
  }
  it('includes BIOLOGICAL', () => expect(HAZARD_TYPES).toContain('BIOLOGICAL'));
  it('includes CHEMICAL', () => expect(HAZARD_TYPES).toContain('CHEMICAL'));
  it('includes PHYSICAL', () => expect(HAZARD_TYPES).toContain('PHYSICAL'));
  it('includes ALLERGENIC', () => expect(HAZARD_TYPES).toContain('ALLERGENIC'));
});

describe('Hazard severity array', () => {
  it('has 4 severities', () => expect(HAZARD_SEVERITIES).toHaveLength(4));
  for (const s of HAZARD_SEVERITIES) {
    it(`${s} has a colour`, () => expect(severityColor[s]).toBeDefined());
    it(`${s} colour contains bg-`, () => expect(severityColor[s]).toContain('bg-'));
  }
  it('LOW is green', () => expect(severityColor['LOW']).toContain('green'));
  it('MEDIUM is yellow', () => expect(severityColor['MEDIUM']).toContain('yellow'));
  it('HIGH is orange', () => expect(severityColor['HIGH']).toContain('orange'));
  it('CRITICAL is red', () => expect(severityColor['CRITICAL']).toContain('red'));
});

describe('Hazard likelihood array', () => {
  it('has 5 likelihoods', () => expect(HAZARD_LIKELIHOODS).toHaveLength(5));
  for (const l of HAZARD_LIKELIHOODS) {
    it(`${l} is a string`, () => expect(typeof l).toBe('string'));
  }
  it('first is RARE', () => expect(HAZARD_LIKELIHOODS[0]).toBe('RARE'));
  it('last is ALMOST_CERTAIN', () =>
    expect(HAZARD_LIKELIHOODS[HAZARD_LIKELIHOODS.length - 1]).toBe('ALMOST_CERTAIN'));
});

describe('Hazard status array', () => {
  it('has 4 statuses', () => expect(HAZARD_STATUSES).toHaveLength(4));
  it('includes IDENTIFIED', () => expect(HAZARD_STATUSES).toContain('IDENTIFIED'));
  it('includes CONTROLLED', () => expect(HAZARD_STATUSES).toContain('CONTROLLED'));
  it('includes CLOSED', () => expect(HAZARD_STATUSES).toContain('CLOSED'));
});

describe('Flow hazard type colour map', () => {
  it('has 4 flow hazard types', () => expect(FLOW_HAZARD_TYPES).toHaveLength(4));
  for (const h of FLOW_HAZARD_TYPES) {
    it(`${h} has a colour`, () => expect(hazardFlowColor[h]).toBeDefined());
    it(`${h} colour contains bg-`, () => expect(hazardFlowColor[h]).toContain('bg-'));
  }
  it('Biological is red', () => expect(hazardFlowColor['Biological']).toContain('red'));
  it('Chemical is purple', () => expect(hazardFlowColor['Chemical']).toContain('purple'));
  it('Physical is orange', () => expect(hazardFlowColor['Physical']).toContain('orange'));
  it('Allergen is pink', () => expect(hazardFlowColor['Allergen']).toContain('pink'));
});

describe('HACCP step type colour map', () => {
  it('has 8 step types', () => expect(HACCP_STEP_TYPES).toHaveLength(8));
  for (const t of HACCP_STEP_TYPES) {
    it(`${t} has a colour`, () => expect(stepTypeColor[t]).toBeDefined());
    it(`${t} colour contains bg-`, () => expect(stepTypeColor[t]).toContain('bg-'));
    it(`${t} colour contains border-`, () => expect(stepTypeColor[t]).toContain('border-'));
  }
  it('ccp step type is red border', () => expect(stepTypeColor['ccp']).toContain('red'));
  it('packaging is green', () => expect(stepTypeColor['packaging']).toContain('green'));
  it('cooling is cyan', () => expect(stepTypeColor['cooling']).toContain('cyan'));
});

describe('CCP status badge colour map', () => {
  it('has 4 CCP statuses', () => expect(CCP_STATUSES).toHaveLength(4));
  for (const s of CCP_STATUSES) {
    it(`${s} has a badge colour`, () => expect(ccpStatusBadgeColor[s]).toBeDefined());
    it(`${s} badge contains bg-`, () => expect(ccpStatusBadgeColor[s]).toContain('bg-'));
  }
  it('ACTIVE is green', () => expect(ccpStatusBadgeColor['ACTIVE']).toContain('green'));
  it('IN_CONTROL is green', () => expect(ccpStatusBadgeColor['IN_CONTROL']).toContain('green'));
  it('DEVIATION is red', () => expect(ccpStatusBadgeColor['DEVIATION']).toContain('red'));
  it('INACTIVE is yellow', () => expect(ccpStatusBadgeColor['INACTIVE']).toContain('yellow'));
});

describe('EU Allergen list (14 allergens)', () => {
  it('has exactly 14 allergens', () => expect(EU_ALLERGENS).toHaveLength(14));
  const expected = [
    'CELERY',
    'CEREALS_GLUTEN',
    'CRUSTACEANS',
    'EGGS',
    'FISH',
    'LUPIN',
    'MILK',
    'MOLLUSCS',
    'MUSTARD',
    'PEANUTS',
    'SESAME',
    'SOY',
    'SULPHITES',
    'TREE_NUTS',
  ];
  for (const a of expected) {
    it(`includes ${a}`, () => expect([...EU_ALLERGENS]).toContain(a));
  }
  it('all allergens are uppercase strings', () => {
    for (const a of EU_ALLERGENS) {
      expect(typeof a).toBe('string');
      expect(a).toBe(a.toUpperCase());
    }
  });
  it('all allergen names are unique', () =>
    expect(new Set(EU_ALLERGENS).size).toBe(EU_ALLERGENS.length));
});

describe('Monitoring frequency array', () => {
  it('has 5 frequencies', () => expect(MONITORING_FREQUENCIES).toHaveLength(5));
  for (const f of MONITORING_FREQUENCIES) {
    it(`${f} is a string`, () => expect(typeof f).toBe('string'));
  }
  it('includes CONTINUOUS', () => expect(MONITORING_FREQUENCIES).toContain('CONTINUOUS'));
  it('includes EVERY_BATCH', () => expect(MONITORING_FREQUENCIES).toContain('EVERY_BATCH'));
});

describe('MOCK HACCP steps integrity', () => {
  it('has 9 process steps', () => expect(MOCK_HACCP_STEPS).toHaveLength(9));
  it('has 4 CCPs', () => expect(ccpCount(MOCK_HACCP_STEPS)).toBe(4));
  for (const step of MOCK_HACCP_STEPS) {
    it(`step ${step.id} has a name`, () => expect(step.name.length).toBeGreaterThan(0));
    it(`step ${step.id} type is valid`, () => expect(HACCP_STEP_TYPES).toContain(step.type));
    it(`step ${step.id} has at least one hazard`, () =>
      expect(step.hazards.length).toBeGreaterThan(0));
    it(`step ${step.id} number is positive`, () => expect(step.number).toBeGreaterThan(0));
    for (const h of step.hazards) {
      it(`step ${step.id} hazard type ${h.type} is valid`, () =>
        expect(FLOW_HAZARD_TYPES).toContain(h.type));
      it(`step ${step.id} hazard severity ${h.severity} is valid`, () =>
        expect(['High', 'Medium', 'Low']).toContain(h.severity));
    }
  }
  it('CCPs have ccpNumber defined', () => {
    const ccps = MOCK_HACCP_STEPS.filter((s) => s.isCCP);
    for (const ccp of ccps) {
      expect(ccp.ccpNumber).toBeDefined();
    }
  });
  it('CCPs have critical limits defined', () => {
    const ccps = MOCK_HACCP_STEPS.filter((s) => s.isCCP);
    for (const ccp of ccps) {
      expect(ccp.criticalLimits).toBeDefined();
    }
  });
  it('non-CCPs have no ccpNumber', () => {
    const nonCcps = MOCK_HACCP_STEPS.filter((s) => !s.isCCP);
    for (const step of nonCcps) {
      expect(step.ccpNumber).toBeUndefined();
    }
  });
  it('step numbers are sequential 1..9', () => {
    const numbers = MOCK_HACCP_STEPS.map((s) => s.number).sort((a, b) => a - b);
    expect(numbers).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });
  it('total hazard count is > 0', () =>
    expect(totalHazardCount(MOCK_HACCP_STEPS)).toBeGreaterThan(0));
  it('high risk hazard count is > 0', () =>
    expect(highRiskHazardCount(MOCK_HACCP_STEPS)).toBeGreaterThan(0));
});

describe('isCCPInControl', () => {
  it('ACTIVE returns true', () => expect(isCCPInControl('ACTIVE')).toBe(true));
  it('IN_CONTROL returns true', () => expect(isCCPInControl('IN_CONTROL')).toBe(true));
  it('DEVIATION returns false', () => expect(isCCPInControl('DEVIATION')).toBe(false));
  it('INACTIVE returns false', () => expect(isCCPInControl('INACTIVE')).toBe(false));
  for (const s of CCP_STATUSES) {
    it(`isCCPInControl(${s}) returns a boolean`, () =>
      expect(typeof isCCPInControl(s)).toBe('boolean'));
  }
});

describe('requiresCorrectiveAction', () => {
  it('DEVIATION requires action', () => expect(requiresCorrectiveAction('DEVIATION')).toBe(true));
  it('ACTIVE does not require action', () =>
    expect(requiresCorrectiveAction('ACTIVE')).toBe(false));
  it('IN_CONTROL does not require action', () =>
    expect(requiresCorrectiveAction('IN_CONTROL')).toBe(false));
  it('INACTIVE does not require action', () =>
    expect(requiresCorrectiveAction('INACTIVE')).toBe(false));
  for (const s of CCP_STATUSES) {
    it(`requiresCorrectiveAction(${s}) is boolean`, () =>
      expect(typeof requiresCorrectiveAction(s)).toBe('boolean'));
  }
});

describe('computeHazardRisk matrix', () => {
  it('1×1=1 → NEGLIGIBLE', () => expect(computeHazardRisk(1, 1)).toBe('NEGLIGIBLE'));
  it('1×2=2 → NEGLIGIBLE', () => expect(computeHazardRisk(1, 2)).toBe('NEGLIGIBLE'));
  it('2×2=4 → LOW', () => expect(computeHazardRisk(2, 2)).toBe('LOW'));
  it('3×2=6 → LOW', () => expect(computeHazardRisk(3, 2)).toBe('LOW'));
  it('3×3=9 → MEDIUM', () => expect(computeHazardRisk(3, 3)).toBe('MEDIUM'));
  it('4×3=12 → MEDIUM', () => expect(computeHazardRisk(4, 3)).toBe('MEDIUM'));
  it('4×4=16 → HIGH', () => expect(computeHazardRisk(4, 4)).toBe('HIGH'));
  it('5×4=20 → HIGH', () => expect(computeHazardRisk(5, 4)).toBe('HIGH'));
  it('5×5=25 → CRITICAL', () => expect(computeHazardRisk(5, 5)).toBe('CRITICAL'));
  for (let s = 1; s <= 5; s++) {
    for (let l = 1; l <= 5; l++) {
      it(`hazardRisk(${s},${l}) is a valid risk level`, () =>
        expect(FOOD_SAFETY_RISKS).toContain(computeHazardRisk(s, l)));
    }
  }
});

describe('allergenDisplayName', () => {
  it('TREE_NUTS → TREE NUTS', () =>
    expect(allergenDisplayName('TREE_NUTS')).toBe('TREE NUTS'));
  it('CEREALS_GLUTEN → CEREALS GLUTEN', () =>
    expect(allergenDisplayName('CEREALS_GLUTEN')).toBe('CEREALS GLUTEN'));
  it('PEANUTS unchanged', () => expect(allergenDisplayName('PEANUTS')).toBe('PEANUTS'));
  it('MILK unchanged', () => expect(allergenDisplayName('MILK')).toBe('MILK'));
  it('replaces all underscores', () =>
    expect(allergenDisplayName('A_B_C')).toBe('A B C'));
  for (const a of EU_ALLERGENS) {
    it(`${a} display name has no underscores`, () =>
      expect(allergenDisplayName(a)).not.toContain('_'));
  }
});

describe('Temperature limit helpers', () => {
  it('5°C is within 5°C storage limit', () =>
    expect(isTemperatureWithinLimit(5, 5)).toBe(true));
  it('4°C is within 5°C storage limit', () =>
    expect(isTemperatureWithinLimit(4, 5)).toBe(true));
  it('6°C exceeds 5°C storage limit', () =>
    expect(isTemperatureWithinLimit(6, 5)).toBe(false));
  it('75°C meets cooking requirement', () =>
    expect(isCookingTemperatureMet(75)).toBe(true));
  it('80°C meets cooking requirement', () =>
    expect(isCookingTemperatureMet(80)).toBe(true));
  it('74°C does not meet cooking requirement', () =>
    expect(isCookingTemperatureMet(74)).toBe(false));
  it('return types are boolean', () => {
    expect(typeof isTemperatureWithinLimit(5, 5)).toBe('boolean');
    expect(typeof isCookingTemperatureMet(75)).toBe('boolean');
  });
});

describe('Cross-domain invariants', () => {
  it('all HACCP step IDs are unique', () => {
    const ids = MOCK_HACCP_STEPS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
  it('CCP numbers are unique', () => {
    const ccpNums = MOCK_HACCP_STEPS
      .filter((s) => s.isCCP)
      .map((s) => s.ccpNumber);
    expect(new Set(ccpNums).size).toBe(ccpNums.length);
  });
  it('EU allergen count matches regulatory requirement', () =>
    expect(EU_ALLERGENS.length).toBe(14));
  it('FOOD_SAFETY_RISKS has 5 levels', () => expect(FOOD_SAFETY_RISKS).toHaveLength(5));
  it('risk levels are strictly ordered by score', () => {
    expect(computeHazardRisk(1, 1)).toBe('NEGLIGIBLE');
    expect(computeHazardRisk(2, 2)).toBe('LOW');
    expect(computeHazardRisk(3, 3)).toBe('MEDIUM');
    expect(computeHazardRisk(4, 4)).toBe('HIGH');
    expect(computeHazardRisk(5, 5)).toBe('CRITICAL');
  });
  it('all DEVIATION CCPs require corrective action', () => {
    for (const s of CCP_STATUSES) {
      if (s === 'DEVIATION') {
        expect(requiresCorrectiveAction(s)).toBe(true);
      }
    }
  });
  it('isCCPInControl and requiresCorrectiveAction never both true', () => {
    for (const s of CCP_STATUSES) {
      const inControl = isCCPInControl(s);
      const needsAction = requiresCorrectiveAction(s);
      expect(inControl && needsAction).toBe(false);
    }
  });
  it('all step type colours include both border and bg tokens', () => {
    for (const t of HACCP_STEP_TYPES) {
      expect(stepTypeColor[t]).toContain('border-');
      expect(stepTypeColor[t]).toContain('bg-');
    }
  });
  it('severity colour map keys match HAZARD_SEVERITIES', () => {
    for (const s of HAZARD_SEVERITIES) {
      expect(severityColor[s]).toBeDefined();
    }
  });
});
