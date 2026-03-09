// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

// ─── Types ───────────────────────────────────────────────────────────────────

type DeviceClassSimple = 'I' | 'II' | 'III';
type DeviceClassFull = 'CLASS_I' | 'CLASS_IIA' | 'CLASS_IIB' | 'CLASS_III';
type DesignStage =
  | 'Planning'
  | 'Input'
  | 'Output'
  | 'Review'
  | 'Verification'
  | 'Validation'
  | 'Transfer';
type DesignStatus = 'DRAFT' | 'ACTIVE' | 'IN_PROGRESS' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';
type RegulatoryPathway =
  | '510(k)'
  | 'PMA'
  | 'De Novo'
  | 'CE Marking'
  | 'TGA'
  | 'Health Canada'
  | 'PMDA'
  | 'Other';
type CAPAType = 'corrective' | 'preventive';
type CAPASource = 'complaint' | 'audit' | 'ncr' | 'capa-review' | 'risk-assessment';
type CAPASeverity = 'critical' | 'major' | 'minor';
type CAPAStatus =
  | 'open'
  | 'investigation'
  | 'action-plan'
  | 'implementation'
  | 'verification'
  | 'closed';
type RiskLevel = 'NEGLIGIBLE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'UNACCEPTABLE';
type HazardCategory =
  | 'ELECTRICAL'
  | 'MECHANICAL'
  | 'BIOLOGICAL'
  | 'CHEMICAL'
  | 'THERMAL'
  | 'RADIATION'
  | 'SOFTWARE'
  | 'USABILITY';

// ─── Arrays ──────────────────────────────────────────────────────────────────

const DEVICE_CLASSES_SIMPLE: DeviceClassSimple[] = ['I', 'II', 'III'];
const DEVICE_CLASSES_FULL: DeviceClassFull[] = [
  'CLASS_I',
  'CLASS_IIA',
  'CLASS_IIB',
  'CLASS_III',
];
const DESIGN_STAGES: DesignStage[] = [
  'Planning',
  'Input',
  'Output',
  'Review',
  'Verification',
  'Validation',
  'Transfer',
];
const DESIGN_STATUSES: DesignStatus[] = [
  'DRAFT',
  'ACTIVE',
  'IN_PROGRESS',
  'ON_HOLD',
  'COMPLETED',
  'CANCELLED',
];
const REGULATORY_PATHWAYS: RegulatoryPathway[] = [
  '510(k)',
  'PMA',
  'De Novo',
  'CE Marking',
  'TGA',
  'Health Canada',
  'PMDA',
  'Other',
];
const CAPA_TYPES: CAPAType[] = ['corrective', 'preventive'];
const CAPA_SOURCES: CAPASource[] = [
  'complaint',
  'audit',
  'ncr',
  'capa-review',
  'risk-assessment',
];
const CAPA_SEVERITIES: CAPASeverity[] = ['critical', 'major', 'minor'];
const CAPA_STATUSES: CAPAStatus[] = [
  'open',
  'investigation',
  'action-plan',
  'implementation',
  'verification',
  'closed',
];
const RISK_LEVELS: RiskLevel[] = ['NEGLIGIBLE', 'LOW', 'MEDIUM', 'HIGH', 'UNACCEPTABLE'];
const HAZARD_CATEGORIES: HazardCategory[] = [
  'ELECTRICAL',
  'MECHANICAL',
  'BIOLOGICAL',
  'CHEMICAL',
  'THERMAL',
  'RADIATION',
  'SOFTWARE',
  'USABILITY',
];

// ─── Badge / Color maps ───────────────────────────────────────────────────────

const deviceClassSimpleColor: Record<DeviceClassSimple, string> = {
  I: 'bg-blue-100 text-blue-800',
  II: 'bg-orange-100 text-orange-800',
  III: 'bg-red-100 text-red-800',
};

const deviceClassSimpleBadgeVariant: Record<
  DeviceClassSimple,
  'info' | 'warning' | 'danger' | 'secondary'
> = {
  I: 'info',
  II: 'warning',
  III: 'danger',
};

const stageColor: Record<DesignStage, string> = {
  Planning: 'bg-gray-100 text-gray-800',
  Input: 'bg-blue-100 text-blue-800',
  Output: 'bg-indigo-100 text-indigo-800',
  Review: 'bg-purple-100 text-purple-800',
  Verification: 'bg-amber-100 text-amber-800',
  Validation: 'bg-teal-100 text-teal-800',
  Transfer: 'bg-green-100 text-green-800',
};

const stageBadgeVariant: Record<
  DesignStage,
  'secondary' | 'info' | 'warning' | 'success' | 'danger' | 'outline'
> = {
  Planning: 'secondary',
  Input: 'info',
  Output: 'info',
  Review: 'warning',
  Verification: 'warning',
  Validation: 'success',
  Transfer: 'success',
};

const designStatusColor: Record<DesignStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  ACTIVE: 'bg-teal-100 text-teal-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  ON_HOLD: 'bg-amber-100 text-amber-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

const designStatusBadgeVariant: Record<
  DesignStatus,
  'secondary' | 'info' | 'warning' | 'success' | 'danger' | 'outline'
> = {
  DRAFT: 'secondary',
  ACTIVE: 'info',
  IN_PROGRESS: 'info',
  ON_HOLD: 'warning',
  COMPLETED: 'success',
  CANCELLED: 'danger',
};

const capaStatusConfig: Record<CAPAStatus, { label: string; color: string; step: number }> = {
  open: { label: 'Open', color: 'bg-blue-100 text-blue-700', step: 1 },
  investigation: { label: 'Investigation', color: 'bg-purple-100 text-purple-700', step: 2 },
  'action-plan': { label: 'Action Plan', color: 'bg-indigo-100 text-indigo-700', step: 3 },
  implementation: { label: 'Implementation', color: 'bg-amber-100 text-amber-700', step: 4 },
  verification: { label: 'Verification', color: 'bg-cyan-100 text-cyan-700', step: 5 },
  closed: { label: 'Closed', color: 'bg-emerald-100 text-emerald-700', step: 6 },
};

const capaSeverityColor: Record<CAPASeverity, string> = {
  critical: 'bg-red-100 text-red-700',
  major: 'bg-orange-100 text-orange-700',
  minor: 'bg-yellow-100 text-yellow-700',
};

// ─── Stage descriptions (ISO 13485:7.3.x) ────────────────────────────────────

const STAGE_DESCRIPTIONS: Record<DesignStage, string> = {
  Planning: 'Define design plan, team, and milestones per 7.3.2',
  Input: 'Document functional, performance, regulatory requirements per 7.3.3',
  Output: 'Document design output meeting input requirements per 7.3.4',
  Review: 'Systematic review of design results per 7.3.5',
  Verification: 'Confirm outputs meet inputs per 7.3.6',
  Validation: 'Confirm device meets user needs per 7.3.7',
  Transfer: 'Transfer design to production per 7.3.8',
};

// ─── Pure helpers ─────────────────────────────────────────────────────────────

function isoRPN(severity: number, occurrence: number, detectability: number): number {
  return severity * occurrence * detectability;
}

function riskLevelFromRPN(rpn: number): RiskLevel {
  if (rpn <= 10) return 'NEGLIGIBLE';
  if (rpn <= 50) return 'LOW';
  if (rpn <= 100) return 'MEDIUM';
  if (rpn <= 200) return 'HIGH';
  return 'UNACCEPTABLE';
}

function requiresNotifiedBody(deviceClass: DeviceClassSimple): boolean {
  return deviceClass !== 'I';
}

function capaTypeLabel(type: CAPAType): string {
  return type === 'corrective' ? 'CA' : 'PA';
}

function isCAPAOpen(status: CAPAStatus): boolean {
  return status !== 'closed';
}

function regulatoryPathwayRequiresPMA(pathway: RegulatoryPathway): boolean {
  return pathway === 'PMA';
}

function postMarketSurveillancePeriodYears(deviceClass: DeviceClassSimple): number {
  const periods: Record<DeviceClassSimple, number> = { I: 5, II: 5, III: 1 };
  return periods[deviceClass];
}

function highestRiskFirst(a: RiskLevel, b: RiskLevel): number {
  const order: Record<RiskLevel, number> = {
    UNACCEPTABLE: 0,
    HIGH: 1,
    MEDIUM: 2,
    LOW: 3,
    NEGLIGIBLE: 4,
  };
  return order[a] - order[b];
}

// ─── Mock data shapes ─────────────────────────────────────────────────────────

interface MockDesignControl {
  id: string;
  referenceNumber: string;
  name: string;
  deviceName: string;
  deviceClass: DeviceClassSimple;
  regulatoryPathway: RegulatoryPathway;
  currentStage: DesignStage;
  status: DesignStatus;
  assignedTo: string;
  createdAt: string;
}

interface MockCAPA {
  id: string;
  capaNumber: string;
  title: string;
  type: CAPAType;
  source: CAPASource;
  severity: CAPASeverity;
  status: CAPAStatus;
  product: string;
  rootCause: string;
  owner: string;
  dateOpened: string;
  targetDate: string;
  daysOpen: number;
  effectivenessCheck: boolean;
}

const MOCK_DESIGN_CONTROLS: MockDesignControl[] = [
  {
    id: 'dc-001',
    referenceNumber: 'DC-2026-001',
    name: 'CardioMonitor Pro X3 Design Controls',
    deviceName: 'CardioMonitor Pro X3',
    deviceClass: 'III',
    regulatoryPathway: 'PMA',
    currentStage: 'Verification',
    status: 'IN_PROGRESS',
    assignedTo: 'Dr. Sarah Chen',
    createdAt: '2026-01-10T09:00:00Z',
  },
  {
    id: 'dc-002',
    referenceNumber: 'DC-2026-002',
    name: 'SurgiView Endoscope Design Controls',
    deviceName: 'SurgiView Endoscope',
    deviceClass: 'II',
    regulatoryPathway: '510(k)',
    currentStage: 'Validation',
    status: 'ACTIVE',
    assignedTo: 'Emily Rodriguez',
    createdAt: '2026-01-20T11:00:00Z',
  },
  {
    id: 'dc-003',
    referenceNumber: 'DC-2025-015',
    name: 'DiagnosScan Portable Design Controls',
    deviceName: 'DiagnosScan Portable',
    deviceClass: 'I',
    regulatoryPathway: 'CE Marking',
    currentStage: 'Transfer',
    status: 'COMPLETED',
    assignedTo: 'James Wilson',
    createdAt: '2025-09-05T08:30:00Z',
  },
];

const MOCK_CAPAS: MockCAPA[] = [
  {
    id: 'capa-001',
    capaNumber: 'CAPA-2026-001',
    title: 'Biocompatibility test failure on silicone housing',
    type: 'corrective',
    source: 'complaint',
    severity: 'critical',
    status: 'implementation',
    product: 'CardioMonitor Pro X3',
    rootCause: 'Supplier changed silicone formulation without notification',
    owner: 'Dr. Sarah Chen',
    dateOpened: '2026-01-08',
    targetDate: '2026-03-08',
    daysOpen: 36,
    effectivenessCheck: false,
  },
  {
    id: 'capa-002',
    capaNumber: 'CAPA-2026-002',
    title: 'Software validation gap in alarm subsystem',
    type: 'corrective',
    source: 'audit',
    severity: 'major',
    status: 'verification',
    product: 'NeuroStim Controller V2',
    rootCause: 'Incomplete test coverage for edge-case alarm conditions',
    owner: 'James Wilson',
    dateOpened: '2026-01-15',
    targetDate: '2026-02-28',
    daysOpen: 29,
    effectivenessCheck: true,
  },
  {
    id: 'capa-003',
    capaNumber: 'CAPA-2026-003',
    title: 'Preventive action for supplier qualification process',
    type: 'preventive',
    source: 'capa-review',
    severity: 'minor',
    status: 'closed',
    product: 'All Products',
    rootCause: 'Gap analysis identified insufficient supplier audit frequency',
    owner: 'Lisa Park',
    dateOpened: '2026-01-20',
    targetDate: '2026-03-20',
    daysOpen: 0,
    effectivenessCheck: true,
  },
];

// =============================================================================
// Tests
// =============================================================================

describe('Device class arrays', () => {
  it('DEVICE_CLASSES_SIMPLE has exactly 3 entries', () => {
    expect(DEVICE_CLASSES_SIMPLE).toHaveLength(3);
  });
  it('DEVICE_CLASSES_FULL has exactly 4 entries', () => {
    expect(DEVICE_CLASSES_FULL).toHaveLength(4);
  });
  for (const cls of DEVICE_CLASSES_SIMPLE) {
    it(`DeviceClassSimple "${cls}" is a non-empty string`, () => {
      expect(typeof cls).toBe('string');
      expect(cls.length).toBeGreaterThan(0);
    });
  }
  for (const cls of DEVICE_CLASSES_FULL) {
    it(`DeviceClassFull "${cls}" starts with CLASS_`, () => {
      expect(cls.startsWith('CLASS_')).toBe(true);
    });
  }
  it('DEVICE_CLASSES_FULL contains CLASS_I', () => {
    expect(DEVICE_CLASSES_FULL).toContain('CLASS_I');
  });
  it('DEVICE_CLASSES_FULL contains CLASS_III', () => {
    expect(DEVICE_CLASSES_FULL).toContain('CLASS_III');
  });
});

describe('Design stage array', () => {
  it('has exactly 7 stages', () => {
    expect(DESIGN_STAGES).toHaveLength(7);
  });
  it('starts with Planning', () => {
    expect(DESIGN_STAGES[0]).toBe('Planning');
  });
  it('ends with Transfer', () => {
    expect(DESIGN_STAGES[DESIGN_STAGES.length - 1]).toBe('Transfer');
  });
  for (const stage of DESIGN_STAGES) {
    it(`stage "${stage}" is a non-empty string`, () => {
      expect(typeof stage).toBe('string');
      expect(stage.length).toBeGreaterThan(0);
    });
  }
});

describe('Design status array', () => {
  it('has exactly 6 statuses', () => {
    expect(DESIGN_STATUSES).toHaveLength(6);
  });
  it('contains DRAFT', () => expect(DESIGN_STATUSES).toContain('DRAFT'));
  it('contains COMPLETED', () => expect(DESIGN_STATUSES).toContain('COMPLETED'));
  it('contains CANCELLED', () => expect(DESIGN_STATUSES).toContain('CANCELLED'));
  for (const s of DESIGN_STATUSES) {
    it(`status "${s}" is uppercase`, () => expect(s).toBe(s.toUpperCase()));
  }
});

describe('Regulatory pathways array', () => {
  it('has exactly 8 pathways', () => {
    expect(REGULATORY_PATHWAYS).toHaveLength(8);
  });
  it('includes 510(k)', () => expect(REGULATORY_PATHWAYS).toContain('510(k)'));
  it('includes PMA', () => expect(REGULATORY_PATHWAYS).toContain('PMA'));
  it('includes CE Marking', () => expect(REGULATORY_PATHWAYS).toContain('CE Marking'));
  it('includes PMDA', () => expect(REGULATORY_PATHWAYS).toContain('PMDA'));
  it('ends with Other', () => {
    expect(REGULATORY_PATHWAYS[REGULATORY_PATHWAYS.length - 1]).toBe('Other');
  });
});

describe('CAPA type / source / severity / status arrays', () => {
  it('CAPA_TYPES has 2 entries', () => expect(CAPA_TYPES).toHaveLength(2));
  it('CAPA_SOURCES has 5 entries', () => expect(CAPA_SOURCES).toHaveLength(5));
  it('CAPA_SEVERITIES has 3 entries', () => expect(CAPA_SEVERITIES).toHaveLength(3));
  it('CAPA_STATUSES has 6 entries', () => expect(CAPA_STATUSES).toHaveLength(6));
  it('CAPA_TYPES contains corrective', () => expect(CAPA_TYPES).toContain('corrective'));
  it('CAPA_TYPES contains preventive', () => expect(CAPA_TYPES).toContain('preventive'));
  it('CAPA_SOURCES contains complaint', () => expect(CAPA_SOURCES).toContain('complaint'));
  it('CAPA_SOURCES contains risk-assessment', () =>
    expect(CAPA_SOURCES).toContain('risk-assessment'));
  it('CAPA_SEVERITIES contains critical', () => expect(CAPA_SEVERITIES).toContain('critical'));
  it('CAPA_SEVERITIES contains minor', () => expect(CAPA_SEVERITIES).toContain('minor'));
  it('CAPA_STATUSES first entry is open', () => expect(CAPA_STATUSES[0]).toBe('open'));
  it('CAPA_STATUSES last entry is closed', () =>
    expect(CAPA_STATUSES[CAPA_STATUSES.length - 1]).toBe('closed'));
});

describe('Hazard categories array', () => {
  it('has exactly 8 hazard categories', () => {
    expect(HAZARD_CATEGORIES).toHaveLength(8);
  });
  for (const cat of HAZARD_CATEGORIES) {
    it(`hazard category "${cat}" is uppercase`, () => expect(cat).toBe(cat.toUpperCase()));
  }
  it('contains SOFTWARE', () => expect(HAZARD_CATEGORIES).toContain('SOFTWARE'));
  it('contains USABILITY', () => expect(HAZARD_CATEGORIES).toContain('USABILITY'));
});

describe('Device class color map (simple)', () => {
  for (const cls of DEVICE_CLASSES_SIMPLE) {
    it(`class "${cls}" has a color string`, () => {
      expect(typeof deviceClassSimpleColor[cls]).toBe('string');
    });
    it(`class "${cls}" color contains bg-`, () => {
      expect(deviceClassSimpleColor[cls]).toContain('bg-');
    });
  }
  it('class I is blue (lowest risk)', () =>
    expect(deviceClassSimpleColor.I).toContain('blue'));
  it('class III is red (highest risk)', () =>
    expect(deviceClassSimpleColor.III).toContain('red'));
  it('class II is orange (intermediate)', () =>
    expect(deviceClassSimpleColor.II).toContain('orange'));
});

describe('Device class badge variant map', () => {
  it('class I is info', () => expect(deviceClassSimpleBadgeVariant.I).toBe('info'));
  it('class II is warning', () => expect(deviceClassSimpleBadgeVariant.II).toBe('warning'));
  it('class III is danger', () => expect(deviceClassSimpleBadgeVariant.III).toBe('danger'));
  for (const cls of DEVICE_CLASSES_SIMPLE) {
    it(`badge variant for class "${cls}" is a non-empty string`, () => {
      expect(deviceClassSimpleBadgeVariant[cls].length).toBeGreaterThan(0);
    });
  }
});

describe('Stage color map', () => {
  for (const stage of DESIGN_STAGES) {
    it(`stage "${stage}" has a color string with bg-`, () => {
      expect(stageColor[stage]).toContain('bg-');
    });
  }
  it('Transfer is green (final/positive)', () =>
    expect(stageColor.Transfer).toContain('green'));
  it('Planning is gray (initial)', () =>
    expect(stageColor.Planning).toContain('gray'));
  it('Review is purple', () => expect(stageColor.Review).toContain('purple'));
});

describe('Stage badge variant map', () => {
  it('Planning is secondary', () => expect(stageBadgeVariant.Planning).toBe('secondary'));
  it('Input is info', () => expect(stageBadgeVariant.Input).toBe('info'));
  it('Output is info', () => expect(stageBadgeVariant.Output).toBe('info'));
  it('Review is warning', () => expect(stageBadgeVariant.Review).toBe('warning'));
  it('Verification is warning', () => expect(stageBadgeVariant.Verification).toBe('warning'));
  it('Validation is success', () => expect(stageBadgeVariant.Validation).toBe('success'));
  it('Transfer is success', () => expect(stageBadgeVariant.Transfer).toBe('success'));
});

describe('Design status color map', () => {
  for (const s of DESIGN_STATUSES) {
    it(`status "${s}" has a color with bg-`, () => {
      expect(designStatusColor[s]).toContain('bg-');
    });
  }
  it('COMPLETED is green', () => expect(designStatusColor.COMPLETED).toContain('green'));
  it('CANCELLED is red', () => expect(designStatusColor.CANCELLED).toContain('red'));
  it('DRAFT is gray', () => expect(designStatusColor.DRAFT).toContain('gray'));
});

describe('Design status badge variant map', () => {
  it('DRAFT is secondary', () => expect(designStatusBadgeVariant.DRAFT).toBe('secondary'));
  it('ACTIVE is info', () => expect(designStatusBadgeVariant.ACTIVE).toBe('info'));
  it('IN_PROGRESS is info', () => expect(designStatusBadgeVariant.IN_PROGRESS).toBe('info'));
  it('ON_HOLD is warning', () => expect(designStatusBadgeVariant.ON_HOLD).toBe('warning'));
  it('COMPLETED is success', () => expect(designStatusBadgeVariant.COMPLETED).toBe('success'));
  it('CANCELLED is danger', () => expect(designStatusBadgeVariant.CANCELLED).toBe('danger'));
});

describe('CAPA status config', () => {
  for (const s of CAPA_STATUSES) {
    it(`status "${s}" has label`, () =>
      expect(capaStatusConfig[s].label.length).toBeGreaterThan(0));
    it(`status "${s}" has color with bg-`, () =>
      expect(capaStatusConfig[s].color).toContain('bg-'));
    it(`status "${s}" step is between 1 and 6`, () => {
      expect(capaStatusConfig[s].step).toBeGreaterThanOrEqual(1);
      expect(capaStatusConfig[s].step).toBeLessThanOrEqual(6);
    });
  }
  it('open is step 1', () => expect(capaStatusConfig.open.step).toBe(1));
  it('closed is step 6', () => expect(capaStatusConfig.closed.step).toBe(6));
  it('steps are strictly increasing', () => {
    for (let i = 0; i < CAPA_STATUSES.length - 1; i++) {
      expect(capaStatusConfig[CAPA_STATUSES[i]].step).toBeLessThan(
        capaStatusConfig[CAPA_STATUSES[i + 1]].step,
      );
    }
  });
});

describe('CAPA severity color map', () => {
  it('critical is red', () => expect(capaSeverityColor.critical).toContain('red'));
  it('major is orange', () => expect(capaSeverityColor.major).toContain('orange'));
  it('minor is yellow', () => expect(capaSeverityColor.minor).toContain('yellow'));
  for (const sev of CAPA_SEVERITIES) {
    it(`severity "${sev}" color contains bg-`, () => {
      expect(capaSeverityColor[sev]).toContain('bg-');
    });
  }
});

describe('Stage descriptions (ISO 13485:7.3.x)', () => {
  for (const stage of DESIGN_STAGES) {
    it(`stage "${stage}" has a description`, () => {
      expect(STAGE_DESCRIPTIONS[stage].length).toBeGreaterThan(0);
    });
    it(`stage "${stage}" description references 7.3`, () => {
      expect(STAGE_DESCRIPTIONS[stage]).toContain('7.3');
    });
  }
  it('Planning references 7.3.2', () =>
    expect(STAGE_DESCRIPTIONS.Planning).toContain('7.3.2'));
  it('Transfer references 7.3.8', () =>
    expect(STAGE_DESCRIPTIONS.Transfer).toContain('7.3.8'));
  it('Validation mentions user needs', () =>
    expect(STAGE_DESCRIPTIONS.Validation.toLowerCase()).toContain('user'));
});

describe('requiresNotifiedBody helper', () => {
  it('class I does not require notified body', () =>
    expect(requiresNotifiedBody('I')).toBe(false));
  it('class II requires notified body', () =>
    expect(requiresNotifiedBody('II')).toBe(true));
  it('class III requires notified body', () =>
    expect(requiresNotifiedBody('III')).toBe(true));
  for (const cls of DEVICE_CLASSES_SIMPLE) {
    it(`requiresNotifiedBody("${cls}") returns boolean`, () =>
      expect(typeof requiresNotifiedBody(cls)).toBe('boolean'));
  }
});

describe('isoRPN helper', () => {
  it('1×1×1 = 1', () => expect(isoRPN(1, 1, 1)).toBe(1));
  it('10×10×10 = 1000', () => expect(isoRPN(10, 10, 10)).toBe(1000));
  it('5×4×3 = 60', () => expect(isoRPN(5, 4, 3)).toBe(60));
  it('2×3×4 = 24', () => expect(isoRPN(2, 3, 4)).toBe(24));
  for (let s = 1; s <= 10; s++) {
    it(`RPN with severity ${s} is positive`, () => {
      expect(isoRPN(s, 5, 5)).toBeGreaterThan(0);
    });
  }
});

describe('riskLevelFromRPN helper', () => {
  it('RPN 10 is NEGLIGIBLE', () => expect(riskLevelFromRPN(10)).toBe('NEGLIGIBLE'));
  it('RPN 11 is LOW', () => expect(riskLevelFromRPN(11)).toBe('LOW'));
  it('RPN 50 is LOW', () => expect(riskLevelFromRPN(50)).toBe('LOW'));
  it('RPN 51 is MEDIUM', () => expect(riskLevelFromRPN(51)).toBe('MEDIUM'));
  it('RPN 100 is MEDIUM', () => expect(riskLevelFromRPN(100)).toBe('MEDIUM'));
  it('RPN 101 is HIGH', () => expect(riskLevelFromRPN(101)).toBe('HIGH'));
  it('RPN 200 is HIGH', () => expect(riskLevelFromRPN(200)).toBe('HIGH'));
  it('RPN 201 is UNACCEPTABLE', () => expect(riskLevelFromRPN(201)).toBe('UNACCEPTABLE'));
  it('RPN 1000 is UNACCEPTABLE', () => expect(riskLevelFromRPN(1000)).toBe('UNACCEPTABLE'));
  for (let rpn = 1; rpn <= 50; rpn++) {
    it(`riskLevelFromRPN(${rpn}) is a valid risk level`, () => {
      expect(RISK_LEVELS).toContain(riskLevelFromRPN(rpn));
    });
  }
});

describe('capaTypeLabel helper', () => {
  it('corrective returns "CA"', () => expect(capaTypeLabel('corrective')).toBe('CA'));
  it('preventive returns "PA"', () => expect(capaTypeLabel('preventive')).toBe('PA'));
  for (const t of CAPA_TYPES) {
    it(`capaTypeLabel("${t}") is 2 characters`, () =>
      expect(capaTypeLabel(t)).toHaveLength(2));
  }
});

describe('isCAPAOpen helper', () => {
  it('open is open', () => expect(isCAPAOpen('open')).toBe(true));
  it('investigation is open', () => expect(isCAPAOpen('investigation')).toBe(true));
  it('action-plan is open', () => expect(isCAPAOpen('action-plan')).toBe(true));
  it('implementation is open', () => expect(isCAPAOpen('implementation')).toBe(true));
  it('verification is open', () => expect(isCAPAOpen('verification')).toBe(true));
  it('closed is NOT open', () => expect(isCAPAOpen('closed')).toBe(false));
  for (const s of CAPA_STATUSES) {
    it(`isCAPAOpen("${s}") returns boolean`, () =>
      expect(typeof isCAPAOpen(s)).toBe('boolean'));
  }
});

describe('regulatoryPathwayRequiresPMA helper', () => {
  it('PMA pathway requires PMA', () =>
    expect(regulatoryPathwayRequiresPMA('PMA')).toBe(true));
  it('510(k) does not require PMA', () =>
    expect(regulatoryPathwayRequiresPMA('510(k)')).toBe(false));
  it('CE Marking does not require PMA', () =>
    expect(regulatoryPathwayRequiresPMA('CE Marking')).toBe(false));
  for (const pathway of REGULATORY_PATHWAYS) {
    it(`pathway "${pathway}" returns boolean`, () =>
      expect(typeof regulatoryPathwayRequiresPMA(pathway)).toBe('boolean'));
  }
});

describe('postMarketSurveillancePeriodYears helper', () => {
  it('class I is 5 years', () =>
    expect(postMarketSurveillancePeriodYears('I')).toBe(5));
  it('class II is 5 years', () =>
    expect(postMarketSurveillancePeriodYears('II')).toBe(5));
  it('class III is 1 year (highest risk = most frequent)', () =>
    expect(postMarketSurveillancePeriodYears('III')).toBe(1));
  for (const cls of DEVICE_CLASSES_SIMPLE) {
    it(`PMS period for class "${cls}" is positive`, () =>
      expect(postMarketSurveillancePeriodYears(cls)).toBeGreaterThan(0));
  }
});

describe('highestRiskFirst comparator', () => {
  it('UNACCEPTABLE sorts before HIGH', () =>
    expect(highestRiskFirst('UNACCEPTABLE', 'HIGH')).toBeLessThan(0));
  it('HIGH sorts before MEDIUM', () =>
    expect(highestRiskFirst('HIGH', 'MEDIUM')).toBeLessThan(0));
  it('NEGLIGIBLE sorts after LOW', () =>
    expect(highestRiskFirst('NEGLIGIBLE', 'LOW')).toBeGreaterThan(0));
  it('same level returns 0', () =>
    expect(highestRiskFirst('MEDIUM', 'MEDIUM')).toBe(0));
  it('sorted RISK_LEVELS descending starts with UNACCEPTABLE', () => {
    const sorted = [...RISK_LEVELS].sort(highestRiskFirst);
    expect(sorted[0]).toBe('UNACCEPTABLE');
    expect(sorted[sorted.length - 1]).toBe('NEGLIGIBLE');
  });
});

describe('Mock DesignControl data shapes', () => {
  it('MOCK_DESIGN_CONTROLS has 3 entries', () =>
    expect(MOCK_DESIGN_CONTROLS).toHaveLength(3));
  for (const dc of MOCK_DESIGN_CONTROLS) {
    it(`"${dc.referenceNumber}" has required string fields`, () => {
      expect(typeof dc.id).toBe('string');
      expect(typeof dc.referenceNumber).toBe('string');
      expect(typeof dc.name).toBe('string');
      expect(typeof dc.deviceName).toBe('string');
      expect(typeof dc.assignedTo).toBe('string');
    });
    it(`"${dc.referenceNumber}" deviceClass is a valid simple class`, () => {
      expect(DEVICE_CLASSES_SIMPLE).toContain(dc.deviceClass);
    });
    it(`"${dc.referenceNumber}" regulatoryPathway is a valid pathway`, () => {
      expect(REGULATORY_PATHWAYS).toContain(dc.regulatoryPathway);
    });
    it(`"${dc.referenceNumber}" currentStage is a valid stage`, () => {
      expect(DESIGN_STAGES).toContain(dc.currentStage);
    });
    it(`"${dc.referenceNumber}" status is a valid design status`, () => {
      expect(DESIGN_STATUSES).toContain(dc.status);
    });
    it(`"${dc.referenceNumber}" createdAt parses to a valid date`, () => {
      expect(new Date(dc.createdAt).toString()).not.toBe('Invalid Date');
    });
  }
  it('class III device uses PMA pathway', () => {
    const classIII = MOCK_DESIGN_CONTROLS.find((d) => d.deviceClass === 'III');
    expect(classIII?.regulatoryPathway).toBe('PMA');
  });
  it('completed device is at Transfer stage', () => {
    const completed = MOCK_DESIGN_CONTROLS.find((d) => d.status === 'COMPLETED');
    expect(completed?.currentStage).toBe('Transfer');
  });
});

describe('Mock CAPA data shapes', () => {
  it('MOCK_CAPAS has 3 entries', () => expect(MOCK_CAPAS).toHaveLength(3));
  for (const capa of MOCK_CAPAS) {
    it(`"${capa.capaNumber}" has required string fields`, () => {
      expect(typeof capa.id).toBe('string');
      expect(typeof capa.capaNumber).toBe('string');
      expect(typeof capa.title).toBe('string');
      expect(typeof capa.product).toBe('string');
      expect(typeof capa.owner).toBe('string');
    });
    it(`"${capa.capaNumber}" capaNumber starts with CAPA-`, () => {
      expect(capa.capaNumber.startsWith('CAPA-')).toBe(true);
    });
    it(`"${capa.capaNumber}" type is valid`, () => {
      expect(CAPA_TYPES).toContain(capa.type);
    });
    it(`"${capa.capaNumber}" source is valid`, () => {
      expect(CAPA_SOURCES).toContain(capa.source);
    });
    it(`"${capa.capaNumber}" severity is valid`, () => {
      expect(CAPA_SEVERITIES).toContain(capa.severity);
    });
    it(`"${capa.capaNumber}" status is valid`, () => {
      expect(CAPA_STATUSES).toContain(capa.status);
    });
    it(`"${capa.capaNumber}" effectivenessCheck is boolean`, () => {
      expect(typeof capa.effectivenessCheck).toBe('boolean');
    });
    it(`"${capa.capaNumber}" daysOpen is non-negative`, () => {
      expect(capa.daysOpen).toBeGreaterThanOrEqual(0);
    });
  }
  it('closed CAPA has daysOpen = 0', () => {
    const closed = MOCK_CAPAS.find((c) => c.status === 'closed');
    expect(closed?.daysOpen).toBe(0);
  });
  it('closed CAPA has effectivenessCheck = true', () => {
    const closed = MOCK_CAPAS.find((c) => c.status === 'closed');
    expect(closed?.effectivenessCheck).toBe(true);
  });
  it('critical CAPA is corrective type', () => {
    const critical = MOCK_CAPAS.find((c) => c.severity === 'critical');
    expect(critical?.type).toBe('corrective');
  });
});
