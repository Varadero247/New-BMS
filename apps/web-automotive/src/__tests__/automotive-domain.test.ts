// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

// ============================================================================
// Automotive Domain Spec Tests — IATF 16949 / APQP / PPAP
// ============================================================================

// ---------------------------------------------------------------------------
// Types (inlined — no page source imports)
// ---------------------------------------------------------------------------

type APQPPhaseNumber = 1 | 2 | 3 | 4 | 5;
type APQPStatus = 'DRAFT' | 'PLANNING' | 'IN_PROGRESS' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';

type PPAPStatus = 'DRAFT' | 'IN_PROGRESS' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'ON_HOLD';
type PPAPLevel = 1 | 2 | 3 | 4 | 5;
type PPAPElementStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'NOT_APPLICABLE';

type ControlPlanStatus = 'DRAFT' | 'ACTIVE' | 'APPROVED' | 'SUPERSEDED' | 'ARCHIVED';
type ControlPlanType = 'PROTOTYPE' | 'PRE_LAUNCH' | 'PRODUCTION';
type CharacteristicType = 'PRODUCT' | 'PROCESS';
type SpecialCharacteristic = '' | 'CC' | 'SC' | 'HI' | 'YC' | 'SH';

type FMEAStatus = 'open' | 'in-progress' | 'completed' | 'verified';
type EightDStatus = 'open' | 'in-progress' | 'completed';
type MSAStudyType = 'GAUGE_RR' | 'LINEARITY' | 'BIAS' | 'STABILITY';

type LPAStatus = 'OPEN' | 'CLOSED' | 'OVERDUE';
type CSRStatus = 'ACTIVE' | 'UNDER_REVIEW' | 'SUPERSEDED';

// ---------------------------------------------------------------------------
// Constants (inlined)
// ---------------------------------------------------------------------------

const APQP_PHASE_NUMBERS: APQPPhaseNumber[] = [1, 2, 3, 4, 5];
const APQP_STATUSES: APQPStatus[] = [
  'DRAFT', 'PLANNING', 'IN_PROGRESS', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED',
];

const PPAP_STATUSES: PPAPStatus[] = [
  'DRAFT', 'IN_PROGRESS', 'SUBMITTED', 'APPROVED', 'REJECTED', 'ON_HOLD',
];
const PPAP_LEVELS: PPAPLevel[] = [1, 2, 3, 4, 5];
const PPAP_ELEMENT_STATUSES: PPAPElementStatus[] = ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'NOT_APPLICABLE'];

const CONTROL_PLAN_STATUSES: ControlPlanStatus[] = ['DRAFT', 'ACTIVE', 'APPROVED', 'SUPERSEDED', 'ARCHIVED'];
const CONTROL_PLAN_TYPES: ControlPlanType[] = ['PROTOTYPE', 'PRE_LAUNCH', 'PRODUCTION'];
const CHARACTERISTIC_TYPES: CharacteristicType[] = ['PRODUCT', 'PROCESS'];
const SPECIAL_CHARACTERISTICS: SpecialCharacteristic[] = ['', 'CC', 'SC', 'HI', 'YC', 'SH'];

const FMEA_STATUSES: FMEAStatus[] = ['open', 'in-progress', 'completed', 'verified'];
const EIGHT_D_STATUSES: EightDStatus[] = ['open', 'in-progress', 'completed'];
const MSA_STUDY_TYPES: MSAStudyType[] = ['GAUGE_RR', 'LINEARITY', 'BIAS', 'STABILITY'];

const LPA_STATUSES: LPAStatus[] = ['OPEN', 'CLOSED', 'OVERDUE'];
const CSR_STATUSES: CSRStatus[] = ['ACTIVE', 'UNDER_REVIEW', 'SUPERSEDED'];

const PPAP_ELEMENTS: string[] = [
  'Design Records',
  'Authorized Engineering Change Documents',
  'Customer Engineering Approval',
  'Design FMEA',
  'Process Flow Diagram',
  'Process FMEA',
  'Control Plan',
  'Measurement System Analysis Studies',
  'Dimensional Results',
  'Records of Material / Performance Tests',
  'Initial Process Studies',
  'Qualified Laboratory Documentation',
  'Appearance Approval Report',
  'Sample Production Parts',
  'Master Sample',
  'Checking Aids',
  'Customer-Specific Requirements',
  'Part Submission Warrant (PSW)',
];

const EIGHT_D_DISCIPLINES: string[] = [
  'D1 — Team Formation',
  'D2 — Problem Description',
  'D3 — Interim Containment',
  'D4 — Root Cause Analysis',
  'D5 — Corrective Actions',
  'D6 — Implementation',
  'D7 — Prevention',
  'D8 — Congratulations',
];

// ---------------------------------------------------------------------------
// Badge / color maps (inlined from source)
// ---------------------------------------------------------------------------

const apqpPhaseLabels: Record<APQPPhaseNumber, string> = {
  1: 'Planning',
  2: 'Product Design',
  3: 'Process Design',
  4: 'Validation',
  5: 'Production',
};

const apqpPhaseColors: Record<APQPPhaseNumber, string> = {
  1: 'bg-blue-100 text-blue-700',
  2: 'bg-indigo-100 text-indigo-700',
  3: 'bg-violet-100 text-violet-700',
  4: 'bg-amber-100 text-amber-700',
  5: 'bg-green-100 text-green-700',
};

const apqpStatusColors: Record<APQPStatus, string> = {
  DRAFT:       'bg-gray-100 text-gray-700',
  PLANNING:    'bg-blue-100 text-blue-700',
  IN_PROGRESS: 'bg-orange-100 text-orange-700',
  ACTIVE:      'bg-orange-100 text-orange-700',
  ON_HOLD:     'bg-yellow-100 text-yellow-700',
  COMPLETED:   'bg-green-100 text-green-700',
  CANCELLED:   'bg-red-100 text-red-700',
};

const ppapStatusColors: Record<PPAPStatus, string> = {
  DRAFT:       'bg-gray-100 text-gray-700',
  IN_PROGRESS: 'bg-orange-100 text-orange-700',
  SUBMITTED:   'bg-blue-100 text-blue-700',
  APPROVED:    'bg-green-100 text-green-700',
  REJECTED:    'bg-red-100 text-red-700',
  ON_HOLD:     'bg-yellow-100 text-yellow-700',
};

const ppapElementStatusColors: Record<PPAPElementStatus, string> = {
  NOT_STARTED:    'text-gray-400',
  IN_PROGRESS:    'text-yellow-500',
  COMPLETED:      'text-green-500',
  NOT_APPLICABLE: 'text-gray-300',
};

const controlPlanStatusColors: Record<ControlPlanStatus, string> = {
  DRAFT:      'bg-gray-100 text-gray-700',
  ACTIVE:     'bg-orange-100 text-orange-700',
  APPROVED:   'bg-green-100 text-green-700',
  SUPERSEDED: 'bg-yellow-100 text-yellow-700',
  ARCHIVED:   'bg-gray-100 text-gray-500',
};

const controlPlanTypeColors: Record<ControlPlanType, string> = {
  PROTOTYPE:   'bg-blue-100 text-blue-700',
  PRE_LAUNCH:  'bg-violet-100 text-violet-700',
  PRODUCTION:  'bg-green-100 text-green-700',
};

const controlPlanTypeLabels: Record<ControlPlanType, string> = {
  PROTOTYPE:   'Prototype',
  PRE_LAUNCH:  'Pre-Launch',
  PRODUCTION:  'Production',
};

const fmeaStatusConfig: Record<FMEAStatus, { label: string; bg: string; text: string }> = {
  'open':        { label: 'Open',        bg: 'bg-red-100',    text: 'text-red-700'    },
  'in-progress': { label: 'In Progress', bg: 'bg-yellow-100', text: 'text-yellow-700' },
  'completed':   { label: 'Completed',   bg: 'bg-blue-100',   text: 'text-blue-700'   },
  'verified':    { label: 'Verified',    bg: 'bg-green-100',  text: 'text-green-700'  },
};

const eightDStatusConfig: Record<EightDStatus, { label: string; bg: string; text: string }> = {
  'open':        { label: 'Open',        bg: 'bg-red-100',   text: 'text-red-700'   },
  'in-progress': { label: 'In Progress', bg: 'bg-blue-100',  text: 'text-blue-700'  },
  'completed':   { label: 'Completed',   bg: 'bg-green-100', text: 'text-green-700' },
};

// ---------------------------------------------------------------------------
// Mock data shapes (inlined from source client files)
// ---------------------------------------------------------------------------

interface MockAPQPProject {
  id: string;
  referenceNumber: string;
  name: string;
  productName: string;
  productNumber: string;
  customerName: string;
  currentPhase: APQPPhaseNumber;
  status: APQPStatus;
  startDate: string;
  targetDate: string;
}

interface MockPPAP {
  id: string;
  referenceNumber: string;
  partNumber: string;
  partName: string;
  customer: string;
  submissionLevel: PPAPLevel;
  status: PPAPStatus;
  elements: Array<{ elementNumber: number; name: string; status: PPAPElementStatus }>;
}

interface MockFMEA {
  id: string;
  processStep: string;
  failureMode: string;
  effect: string;
  cause: string;
  severity: number;
  occurrence: number;
  detection: number;
  status: FMEAStatus;
  owner: string;
}

interface MockEightD {
  id: string;
  title: string;
  customer: string;
  currentStep: number;
  status: EightDStatus;
  partNumber: string;
  defectQty: number;
}

const MOCK_APQP_PROJECTS: MockAPQPProject[] = [
  {
    id: '1', referenceNumber: 'APQP-2026-001',
    name: 'Turbocharger Housing Launch', productName: 'TC-Housing-X',
    productNumber: 'TCH-8801', customerName: 'Volkswagen Group',
    currentPhase: 2, status: 'IN_PROGRESS',
    startDate: '2026-01-10', targetDate: '2026-09-30',
  },
  {
    id: '2', referenceNumber: 'APQP-2026-002',
    name: 'Brake Caliper Assembly Programme', productName: 'BCA-Premium',
    productNumber: 'BC-4420', customerName: 'BMW AG',
    currentPhase: 4, status: 'ACTIVE',
    startDate: '2025-07-01', targetDate: '2026-06-30',
  },
  {
    id: '3', referenceNumber: 'APQP-2026-003',
    name: 'EV Motor Housing', productName: 'EMH-EV100',
    productNumber: 'EMH-5501', customerName: 'Stellantis',
    currentPhase: 1, status: 'PLANNING',
    startDate: '2026-02-15', targetDate: '2027-01-31',
  },
];

const MOCK_PPAPS: MockPPAP[] = [
  {
    id: '1', referenceNumber: 'PPAP-2026-001',
    partNumber: 'FI-3310-VW', partName: 'Fuel Injector Body', customer: 'Volkswagen Group',
    submissionLevel: 3, status: 'SUBMITTED',
    elements: [
      { elementNumber: 1, name: 'Design Records', status: 'COMPLETED' },
      { elementNumber: 5, name: 'Process Flow Diagram', status: 'COMPLETED' },
      { elementNumber: 18, name: 'Part Submission Warrant (PSW)', status: 'IN_PROGRESS' },
    ],
  },
  {
    id: '2', referenceNumber: 'PPAP-2026-002',
    partNumber: 'TC-8801-VW', partName: 'Turbocharger Housing', customer: 'BMW AG',
    submissionLevel: 2, status: 'IN_PROGRESS',
    elements: [
      { elementNumber: 1, name: 'Design Records', status: 'IN_PROGRESS' },
      { elementNumber: 6, name: 'Process FMEA', status: 'NOT_STARTED' },
    ],
  },
];

const MOCK_FMEAS: MockFMEA[] = [
  {
    id: '1', processStep: 'Cylinder Head Torquing',
    failureMode: 'Under-torque of head bolts', effect: 'Head gasket failure',
    cause: 'Torque wrench calibration drift',
    severity: 9, occurrence: 3, detection: 4,
    status: 'in-progress', owner: 'K. Schulz',
  },
  {
    id: '2', processStep: 'Crankshaft Bearing Assembly',
    failureMode: 'Incorrect bearing clearance', effect: 'Premature bearing wear, engine seizure',
    cause: 'Micrometer reading error',
    severity: 10, occurrence: 2, detection: 5,
    status: 'open', owner: 'M. Bauer',
  },
  {
    id: '3', processStep: 'Fuel Injector Seating',
    failureMode: 'Injector O-ring not seated', effect: 'Fuel leak, fire hazard',
    cause: 'O-ring omitted or rolled during assembly',
    severity: 8, occurrence: 2, detection: 3,
    status: 'completed', owner: 'R. Weber',
  },
  {
    id: '4', processStep: 'Brake Caliper Mounting',
    failureMode: 'Caliper bolt missing', effect: 'Caliper detachment — safety critical',
    cause: 'Bolt dropped or not retrieved from work tray',
    severity: 10, occurrence: 1, detection: 4,
    status: 'verified', owner: 'L. Hoffmann',
  },
];

const MOCK_EIGHT_D: MockEightD[] = [
  {
    id: '1', title: 'Fuel Rail Pressure Fluctuation — Field Returns',
    customer: 'Volkswagen Group', currentStep: 5,
    status: 'in-progress', partNumber: 'FR-4421-VW', defectQty: 23,
  },
  {
    id: '2', title: 'Transmission Housing Porosity — Warranty Claims',
    customer: 'BMW AG', currentStep: 4,
    status: 'in-progress', partNumber: 'TH-8892-BM', defectQty: 8,
  },
  {
    id: '3', title: 'Brake Pad Thickness Variation — PPM Escalation',
    customer: 'Continental AG', currentStep: 8,
    status: 'completed', partNumber: 'BP-2210-CT', defectQty: 156,
  },
];

// ---------------------------------------------------------------------------
// Pure helpers (inlined)
// ---------------------------------------------------------------------------

function computeRPN(severity: number, occurrence: number, detection: number): number {
  return severity * occurrence * detection;
}

function getRPNBand(rpn: number): 'critical' | 'high' | 'acceptable' {
  if (rpn >= 200) return 'critical';
  if (rpn >= 100) return 'high';
  return 'acceptable';
}

function ppmFromDefectRate(defects: number, opportunities: number): number {
  if (opportunities === 0) return 0;
  return (defects / opportunities) * 1_000_000;
}

function isGaugeRRAcceptable(rrPercent: number): boolean {
  return rrPercent < 10;
}

function isGaugeRRMarginal(rrPercent: number): boolean {
  return rrPercent >= 10 && rrPercent <= 30;
}

function computeAPQPPhaseCompletion(currentPhase: number, totalPhases: number): number {
  if (totalPhases === 0) return 0;
  return Math.round(((currentPhase - 1) / totalPhases) * 100);
}

function ppapReadinessPercent(completed: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

function eightDIsComplete(currentStep: number): boolean {
  return currentStep === 8;
}

function apqpIsOnTrack(status: APQPStatus): boolean {
  return status === 'IN_PROGRESS' || status === 'ACTIVE' || status === 'PLANNING';
}

// ============================================================================
// Test suites
// ============================================================================

describe('APQP phase labels', () => {
  it('has 5 phases', () => expect(APQP_PHASE_NUMBERS).toHaveLength(5));
  for (const p of APQP_PHASE_NUMBERS) {
    it(`Phase ${p} has a label defined`, () => expect(apqpPhaseLabels[p]).toBeDefined());
    it(`Phase ${p} label is a non-empty string`, () => expect(apqpPhaseLabels[p].length).toBeGreaterThan(0));
    it(`Phase ${p} has a color defined`, () => expect(apqpPhaseColors[p]).toBeDefined());
    it(`Phase ${p} color has bg-`, () => expect(apqpPhaseColors[p]).toContain('bg-'));
  }
  it('Phase 1 is Planning', () => expect(apqpPhaseLabels[1]).toBe('Planning'));
  it('Phase 2 is Product Design', () => expect(apqpPhaseLabels[2]).toBe('Product Design'));
  it('Phase 3 is Process Design', () => expect(apqpPhaseLabels[3]).toBe('Process Design'));
  it('Phase 4 is Validation', () => expect(apqpPhaseLabels[4]).toBe('Validation'));
  it('Phase 5 is Production', () => expect(apqpPhaseLabels[5]).toBe('Production'));
  it('Phase 5 is green (launch color)', () => expect(apqpPhaseColors[5]).toContain('green'));
});

describe('APQP status colors', () => {
  it('has 7 APQP statuses', () => expect(APQP_STATUSES).toHaveLength(7));
  for (const s of APQP_STATUSES) {
    it(`APQP status "${s}" has color`, () => expect(apqpStatusColors[s]).toBeDefined());
    it(`APQP status "${s}" color has bg-`, () => expect(apqpStatusColors[s]).toContain('bg-'));
    it(`APQP status "${s}" color has text-`, () => expect(apqpStatusColors[s]).toContain('text-'));
  }
  it('COMPLETED is green', () => expect(apqpStatusColors.COMPLETED).toContain('green'));
  it('CANCELLED is red', () => expect(apqpStatusColors.CANCELLED).toContain('red'));
  it('DRAFT is gray', () => expect(apqpStatusColors.DRAFT).toContain('gray'));
  it('ON_HOLD is yellow', () => expect(apqpStatusColors.ON_HOLD).toContain('yellow'));
});

describe('PPAP status colors', () => {
  it('has 6 PPAP statuses', () => expect(PPAP_STATUSES).toHaveLength(6));
  for (const s of PPAP_STATUSES) {
    it(`PPAP status "${s}" has color`, () => expect(ppapStatusColors[s]).toBeDefined());
    it(`PPAP status "${s}" color has bg-`, () => expect(ppapStatusColors[s]).toContain('bg-'));
  }
  it('APPROVED is green', () => expect(ppapStatusColors.APPROVED).toContain('green'));
  it('REJECTED is red', () => expect(ppapStatusColors.REJECTED).toContain('red'));
  it('SUBMITTED is blue', () => expect(ppapStatusColors.SUBMITTED).toContain('blue'));
  it('ON_HOLD is yellow', () => expect(ppapStatusColors.ON_HOLD).toContain('yellow'));
});

describe('PPAP levels', () => {
  it('has 5 levels', () => expect(PPAP_LEVELS).toHaveLength(5));
  for (const l of PPAP_LEVELS) {
    it(`Level ${l} is a number`, () => expect(typeof l).toBe('number'));
    it(`Level ${l} is between 1 and 5`, () => {
      expect(l).toBeGreaterThanOrEqual(1);
      expect(l).toBeLessThanOrEqual(5);
    });
  }
  it('Level 1 is the minimum', () => expect(Math.min(...PPAP_LEVELS)).toBe(1));
  it('Level 5 is the maximum', () => expect(Math.max(...PPAP_LEVELS)).toBe(5));
});

describe('PPAP elements', () => {
  it('has 18 PPAP elements', () => expect(PPAP_ELEMENTS).toHaveLength(18));
  for (const el of PPAP_ELEMENTS) {
    it(`Element "${el}" is a non-empty string`, () => expect(el.length).toBeGreaterThan(0));
  }
  it('includes Part Submission Warrant', () => {
    expect(PPAP_ELEMENTS.some((e) => e.includes('Part Submission Warrant'))).toBe(true);
  });
  it('includes Design FMEA', () => expect(PPAP_ELEMENTS).toContain('Design FMEA'));
  it('includes Control Plan', () => expect(PPAP_ELEMENTS).toContain('Control Plan'));
  it('includes Dimensional Results', () => expect(PPAP_ELEMENTS).toContain('Dimensional Results'));
});

describe('PPAP element status colors', () => {
  for (const s of PPAP_ELEMENT_STATUSES) {
    it(`Element status "${s}" has color`, () => expect(ppapElementStatusColors[s]).toBeDefined());
    it(`Element status "${s}" color has text-`, () => expect(ppapElementStatusColors[s]).toContain('text-'));
  }
  it('COMPLETED is green', () => expect(ppapElementStatusColors.COMPLETED).toContain('green'));
  it('IN_PROGRESS is yellow', () => expect(ppapElementStatusColors.IN_PROGRESS).toContain('yellow'));
  it('NOT_STARTED is gray', () => expect(ppapElementStatusColors.NOT_STARTED).toContain('gray'));
});

describe('Control plan types', () => {
  it('has 3 control plan types', () => expect(CONTROL_PLAN_TYPES).toHaveLength(3));
  for (const t of CONTROL_PLAN_TYPES) {
    it(`Control plan type "${t}" has a label`, () => expect(controlPlanTypeLabels[t]).toBeDefined());
    it(`Control plan type "${t}" has a color`, () => expect(controlPlanTypeColors[t]).toBeDefined());
    it(`Control plan type "${t}" color has bg-`, () => expect(controlPlanTypeColors[t]).toContain('bg-'));
  }
  it('PRODUCTION is green', () => expect(controlPlanTypeColors.PRODUCTION).toContain('green'));
  it('PROTOTYPE is blue', () => expect(controlPlanTypeColors.PROTOTYPE).toContain('blue'));
  it('PRE_LAUNCH is violet', () => expect(controlPlanTypeColors.PRE_LAUNCH).toContain('violet'));
  it('PROTOTYPE label is Prototype', () => expect(controlPlanTypeLabels.PROTOTYPE).toBe('Prototype'));
  it('PRE_LAUNCH label is Pre-Launch', () => expect(controlPlanTypeLabels.PRE_LAUNCH).toBe('Pre-Launch'));
  it('PRODUCTION label is Production', () => expect(controlPlanTypeLabels.PRODUCTION).toBe('Production'));
});

describe('Control plan status colors', () => {
  for (const s of CONTROL_PLAN_STATUSES) {
    it(`CP status "${s}" has color`, () => expect(controlPlanStatusColors[s]).toBeDefined());
    it(`CP status "${s}" has text-`, () => expect(controlPlanStatusColors[s]).toContain('text-'));
  }
  it('APPROVED is green', () => expect(controlPlanStatusColors.APPROVED).toContain('green'));
  it('SUPERSEDED is yellow', () => expect(controlPlanStatusColors.SUPERSEDED).toContain('yellow'));
  it('DRAFT is gray', () => expect(controlPlanStatusColors.DRAFT).toContain('gray'));
});

describe('Characteristic types', () => {
  it('has 2 types', () => expect(CHARACTERISTIC_TYPES).toHaveLength(2));
  it('includes PRODUCT', () => expect(CHARACTERISTIC_TYPES).toContain('PRODUCT'));
  it('includes PROCESS', () => expect(CHARACTERISTIC_TYPES).toContain('PROCESS'));
});

describe('Special characteristics', () => {
  it('has 6 special characteristic designators', () => expect(SPECIAL_CHARACTERISTICS).toHaveLength(6));
  it('includes CC (critical characteristic)', () => expect(SPECIAL_CHARACTERISTICS).toContain('CC'));
  it('includes SC (significant characteristic)', () => expect(SPECIAL_CHARACTERISTICS).toContain('SC'));
  it('allows empty string for non-special', () => expect(SPECIAL_CHARACTERISTICS).toContain(''));
  for (const sc of SPECIAL_CHARACTERISTICS) {
    it(`special char "${sc || '(none)'}" is a string`, () => expect(typeof sc).toBe('string'));
  }
});

describe('FMEA status config', () => {
  for (const s of FMEA_STATUSES) {
    it(`FMEA status "${s}" config has label`, () => expect(fmeaStatusConfig[s].label).toBeDefined());
    it(`FMEA status "${s}" config has bg`, () => expect(fmeaStatusConfig[s].bg).toContain('bg-'));
    it(`FMEA status "${s}" config has text`, () => expect(fmeaStatusConfig[s].text).toContain('text-'));
  }
  it('open config label is Open', () => expect(fmeaStatusConfig.open.label).toBe('Open'));
  it('verified config is green', () => expect(fmeaStatusConfig.verified.bg).toContain('green'));
  it('open config is red', () => expect(fmeaStatusConfig.open.bg).toContain('red'));
});

describe('8D status config', () => {
  for (const s of EIGHT_D_STATUSES) {
    it(`8D status "${s}" config is defined`, () => expect(eightDStatusConfig[s]).toBeDefined());
    it(`8D status "${s}" config has label`, () => expect(eightDStatusConfig[s].label).toBeDefined());
  }
  it('completed config is green', () => expect(eightDStatusConfig.completed.bg).toContain('green'));
  it('open config is red', () => expect(eightDStatusConfig.open.bg).toContain('red'));
});

describe('8D disciplines', () => {
  it('has exactly 8 disciplines', () => expect(EIGHT_D_DISCIPLINES).toHaveLength(8));
  for (let i = 0; i < EIGHT_D_DISCIPLINES.length; i++) {
    const d = EIGHT_D_DISCIPLINES[i];
    it(`Discipline ${i + 1} starts with D${i + 1}`, () => {
      expect(d).toMatch(new RegExp(`^D${i + 1}`));
    });
    it(`Discipline ${i + 1} is a non-empty string`, () => expect(d.length).toBeGreaterThan(0));
  }
  it('D8 is Congratulations', () => expect(EIGHT_D_DISCIPLINES[7]).toContain('Congratulations'));
});

describe('MSA study types', () => {
  it('has 4 MSA study types', () => expect(MSA_STUDY_TYPES).toHaveLength(4));
  for (const t of MSA_STUDY_TYPES) {
    it(`MSA type "${t}" is a string`, () => expect(typeof t).toBe('string'));
  }
  it('includes GAUGE_RR', () => expect(MSA_STUDY_TYPES).toContain('GAUGE_RR'));
  it('includes LINEARITY', () => expect(MSA_STUDY_TYPES).toContain('LINEARITY'));
  it('includes BIAS', () => expect(MSA_STUDY_TYPES).toContain('BIAS'));
  it('includes STABILITY', () => expect(MSA_STUDY_TYPES).toContain('STABILITY'));
});

describe('computeRPN — FMEA helper', () => {
  it('minimum RPN is 1 (1×1×1)', () => expect(computeRPN(1, 1, 1)).toBe(1));
  it('maximum RPN is 1000 (10×10×10)', () => expect(computeRPN(10, 10, 10)).toBe(1000));
  it('5×4×3 = 60', () => expect(computeRPN(5, 4, 3)).toBe(60));
  it('9×3×4 = 108', () => expect(computeRPN(9, 3, 4)).toBe(108));
  it('commutative', () => expect(computeRPN(2, 3, 5)).toBe(computeRPN(5, 3, 2)));
  for (let s = 1; s <= 10; s++) {
    it(`RPN with severity ${s}, occ 5, det 5 is positive`, () => {
      expect(computeRPN(s, 5, 5)).toBeGreaterThan(0);
    });
  }
});

describe('getRPNBand', () => {
  it('200 is critical', () => expect(getRPNBand(200)).toBe('critical'));
  it('999 is critical', () => expect(getRPNBand(999)).toBe('critical'));
  it('100 is high', () => expect(getRPNBand(100)).toBe('high'));
  it('199 is high', () => expect(getRPNBand(199)).toBe('high'));
  it('99 is acceptable', () => expect(getRPNBand(99)).toBe('acceptable'));
  it('0 is acceptable', () => expect(getRPNBand(0)).toBe('acceptable'));
  const bands = ['critical', 'high', 'acceptable'] as const;
  for (let i = 0; i <= 10; i++) {
    it(`getRPNBand(${i * 100}) returns valid band`, () => {
      expect(bands).toContain(getRPNBand(i * 100));
    });
  }
});

describe('isGaugeRRAcceptable / isGaugeRRMarginal', () => {
  it('< 10% is acceptable', () => expect(isGaugeRRAcceptable(9)).toBe(true));
  it('10% is not acceptable', () => expect(isGaugeRRAcceptable(10)).toBe(false));
  it('10-30% is marginal', () => expect(isGaugeRRMarginal(20)).toBe(true));
  it('9% is not marginal', () => expect(isGaugeRRMarginal(9)).toBe(false));
  it('31% is not marginal', () => expect(isGaugeRRMarginal(31)).toBe(false));
  it('acceptable and marginal are mutually exclusive', () => {
    for (let i = 0; i <= 100; i++) {
      expect(isGaugeRRAcceptable(i) && isGaugeRRMarginal(i)).toBe(false);
    }
  });
  it('0% is acceptable', () => expect(isGaugeRRAcceptable(0)).toBe(true));
  it('30% is marginal boundary', () => expect(isGaugeRRMarginal(30)).toBe(true));
});

describe('ppmFromDefectRate', () => {
  it('0 defects gives 0 PPM', () => expect(ppmFromDefectRate(0, 1000)).toBe(0));
  it('0 opportunities gives 0 PPM', () => expect(ppmFromDefectRate(10, 0)).toBe(0));
  it('1 defect per 1000 = 1000 PPM', () => expect(ppmFromDefectRate(1, 1000)).toBe(1000));
  it('sigma-6 ≈ 3.4 PPM', () => expect(ppmFromDefectRate(34, 10_000_000)).toBeCloseTo(3.4));
  for (let i = 0; i <= 10; i++) {
    it(`ppm(${i}, 10000) >= 0`, () => expect(ppmFromDefectRate(i, 10000)).toBeGreaterThanOrEqual(0));
  }
});

describe('computeAPQPPhaseCompletion', () => {
  it('phase 1 of 5 = 0%', () => expect(computeAPQPPhaseCompletion(1, 5)).toBe(0));
  it('phase 5 of 5 = 80%', () => expect(computeAPQPPhaseCompletion(5, 5)).toBe(80));
  it('phase 3 of 5 = 40%', () => expect(computeAPQPPhaseCompletion(3, 5)).toBe(40));
  it('0 total phases returns 0', () => expect(computeAPQPPhaseCompletion(1, 0)).toBe(0));
  for (let p = 1; p <= 5; p++) {
    it(`Phase ${p} completion is between 0 and 100`, () => {
      const pct = computeAPQPPhaseCompletion(p, 5);
      expect(pct).toBeGreaterThanOrEqual(0);
      expect(pct).toBeLessThanOrEqual(100);
    });
  }
  it('completion increases with phase', () => {
    const p1 = computeAPQPPhaseCompletion(1, 5);
    const p3 = computeAPQPPhaseCompletion(3, 5);
    const p5 = computeAPQPPhaseCompletion(5, 5);
    expect(p1).toBeLessThanOrEqual(p3);
    expect(p3).toBeLessThanOrEqual(p5);
  });
});

describe('ppapReadinessPercent', () => {
  it('0 completed of 18 = 0%', () => expect(ppapReadinessPercent(0, 18)).toBe(0));
  it('18 completed of 18 = 100%', () => expect(ppapReadinessPercent(18, 18)).toBe(100));
  it('9 completed of 18 = 50%', () => expect(ppapReadinessPercent(9, 18)).toBe(50));
  it('0 total returns 0', () => expect(ppapReadinessPercent(5, 0)).toBe(0));
  for (let c = 0; c <= 18; c++) {
    it(`ppapReadinessPercent(${c}, 18) is between 0 and 100`, () => {
      const pct = ppapReadinessPercent(c, 18);
      expect(pct).toBeGreaterThanOrEqual(0);
      expect(pct).toBeLessThanOrEqual(100);
    });
  }
});

describe('eightDIsComplete', () => {
  it('step 8 is complete', () => expect(eightDIsComplete(8)).toBe(true));
  for (let s = 1; s <= 7; s++) {
    it(`step ${s} is not complete`, () => expect(eightDIsComplete(s)).toBe(false));
  }
  it('returns boolean', () => expect(typeof eightDIsComplete(5)).toBe('boolean'));
});

describe('apqpIsOnTrack', () => {
  for (const s of ['IN_PROGRESS', 'ACTIVE', 'PLANNING'] as APQPStatus[]) {
    it(`status "${s}" is on track`, () => expect(apqpIsOnTrack(s)).toBe(true));
  }
  for (const s of ['DRAFT', 'ON_HOLD', 'COMPLETED', 'CANCELLED'] as APQPStatus[]) {
    it(`status "${s}" is not on track`, () => expect(apqpIsOnTrack(s)).toBe(false));
  }
});

describe('MOCK APQP project data shapes', () => {
  it('has 3 mock APQP projects', () => expect(MOCK_APQP_PROJECTS).toHaveLength(3));
  for (const p of MOCK_APQP_PROJECTS) {
    it(`Project "${p.referenceNumber}" has valid phase`, () => {
      expect(APQP_PHASE_NUMBERS).toContain(p.currentPhase);
    });
    it(`Project "${p.referenceNumber}" has valid status`, () => {
      expect(APQP_STATUSES).toContain(p.status);
    });
    it(`Project "${p.referenceNumber}" productNumber is non-empty`, () => {
      expect(p.productNumber.length).toBeGreaterThan(0);
    });
    it(`Project "${p.referenceNumber}" customerName is non-empty`, () => {
      expect(p.customerName.length).toBeGreaterThan(0);
    });
    it(`Project "${p.referenceNumber}" refNumber matches pattern`, () => {
      expect(p.referenceNumber).toMatch(/^APQP-\d{4}-\d{3}$/);
    });
  }
});

describe('MOCK PPAP data shapes', () => {
  it('has 2 mock PPAPs', () => expect(MOCK_PPAPS).toHaveLength(2));
  for (const p of MOCK_PPAPS) {
    it(`PPAP "${p.referenceNumber}" has valid status`, () => {
      expect(PPAP_STATUSES).toContain(p.status);
    });
    it(`PPAP "${p.referenceNumber}" submission level is 1-5`, () => {
      expect(p.submissionLevel).toBeGreaterThanOrEqual(1);
      expect(p.submissionLevel).toBeLessThanOrEqual(5);
    });
    it(`PPAP "${p.referenceNumber}" has elements array`, () => {
      expect(Array.isArray(p.elements)).toBe(true);
    });
    for (const el of p.elements) {
      it(`PPAP "${p.referenceNumber}" element "${el.name}" status is valid`, () => {
        expect(PPAP_ELEMENT_STATUSES).toContain(el.status);
      });
    }
  }
});

describe('MOCK FMEA data shapes', () => {
  it('has 4 mock FMEAs', () => expect(MOCK_FMEAS).toHaveLength(4));
  for (const fm of MOCK_FMEAS) {
    it(`FMEA "${fm.id}" has valid status`, () => expect(FMEA_STATUSES).toContain(fm.status));
    it(`FMEA "${fm.id}" severity is 1-10`, () => {
      expect(fm.severity).toBeGreaterThanOrEqual(1);
      expect(fm.severity).toBeLessThanOrEqual(10);
    });
    it(`FMEA "${fm.id}" occurrence is 1-10`, () => {
      expect(fm.occurrence).toBeGreaterThanOrEqual(1);
      expect(fm.occurrence).toBeLessThanOrEqual(10);
    });
    it(`FMEA "${fm.id}" detection is 1-10`, () => {
      expect(fm.detection).toBeGreaterThanOrEqual(1);
      expect(fm.detection).toBeLessThanOrEqual(10);
    });
    it(`FMEA "${fm.id}" RPN = sev × occ × det`, () => {
      const rpn = computeRPN(fm.severity, fm.occurrence, fm.detection);
      expect(rpn).toBe(fm.severity * fm.occurrence * fm.detection);
    });
    it(`FMEA "${fm.id}" processStep is non-empty`, () => {
      expect(fm.processStep.length).toBeGreaterThan(0);
    });
    it(`FMEA "${fm.id}" has non-empty owner`, () => {
      expect(fm.owner.length).toBeGreaterThan(0);
    });
  }
  it('at least one FMEA is open', () => {
    expect(MOCK_FMEAS.some((fm) => fm.status === 'open')).toBe(true);
  });
  it('at least one FMEA is verified', () => {
    expect(MOCK_FMEAS.some((fm) => fm.status === 'verified')).toBe(true);
  });
});

describe('MOCK 8D data shapes', () => {
  it('has 3 mock 8D reports', () => expect(MOCK_EIGHT_D).toHaveLength(3));
  for (const r of MOCK_EIGHT_D) {
    it(`8D "${r.title}" has valid status`, () => expect(EIGHT_D_STATUSES).toContain(r.status));
    it(`8D "${r.title}" currentStep is 1-8`, () => {
      expect(r.currentStep).toBeGreaterThanOrEqual(1);
      expect(r.currentStep).toBeLessThanOrEqual(8);
    });
    it(`8D "${r.title}" defectQty is positive`, () => expect(r.defectQty).toBeGreaterThan(0));
    it(`8D "${r.title}" customer is non-empty`, () => expect(r.customer.length).toBeGreaterThan(0));
  }
  it('completed 8D report is at step 8', () => {
    const completed = MOCK_EIGHT_D.filter((r) => r.status === 'completed');
    for (const r of completed) {
      expect(eightDIsComplete(r.currentStep)).toBe(true);
    }
  });
});
