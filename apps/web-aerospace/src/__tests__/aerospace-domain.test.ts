// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

// ============================================================================
// Aerospace Domain Spec Tests — AS9100D / DO-178C
// ============================================================================

// ---------------------------------------------------------------------------
// Types (inlined — no page source imports)
// ---------------------------------------------------------------------------

type NCRStatus = 'OPEN' | 'UNDER_REVIEW' | 'DISPOSITION' | 'CLOSED' | 'VOIDED';
type NCRType = 'INTERNAL' | 'SUPPLIER' | 'CUSTOMER' | 'IN_PROCESS';
type NCRSeverity = 'MINOR' | 'MAJOR' | 'CRITICAL';

type DocumentType = 'DRAWING' | 'SPECIFICATION' | 'PROCEDURE' | 'FORM' | 'RECORD' | 'MANUAL';
type RevisionStatus = 'DRAFT' | 'IN_REVIEW' | 'APPROVED' | 'OBSOLETE' | 'SUPERSEDED';

type SpecialProcessType = 'welding' | 'NDT' | 'heat-treat' | 'surface-treatment' | 'composites' | 'chemical-processing';
type SpecialProcessCertification = 'NADCAP' | 'customer-approved' | 'internal';
type SpecialProcessStatus = 'active' | 'expiring-soon' | 'expired' | 'pending';

type BaselineStatus = 'current' | 'superseded' | 'draft';
type CounterfeitVerificationMethod = 'certificate' | 'xrf' | 'visual' | 'dimensional';
type CounterfeitStatus = 'verified' | 'suspect' | 'quarantined';

type FAIStatus = 'OPEN' | 'IN_PROGRESS' | 'PASS' | 'FAIL' | 'CONDITIONALLY_ACCEPTED';
type FAIType = 'FULL' | 'PARTIAL' | 'DELTA';
type FAIPartStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'PASS' | 'FAIL';

type ComplianceStatus = 'compliant' | 'partial' | 'non-compliant' | 'not-assessed';

// ---------------------------------------------------------------------------
// Constants (inlined)
// ---------------------------------------------------------------------------

const NCR_STATUSES: NCRStatus[] = ['OPEN', 'UNDER_REVIEW', 'DISPOSITION', 'CLOSED', 'VOIDED'];
const NCR_TYPES: NCRType[] = ['INTERNAL', 'SUPPLIER', 'CUSTOMER', 'IN_PROCESS'];
const NCR_SEVERITIES: NCRSeverity[] = ['MINOR', 'MAJOR', 'CRITICAL'];

const DOCUMENT_TYPES: DocumentType[] = ['DRAWING', 'SPECIFICATION', 'PROCEDURE', 'FORM', 'RECORD', 'MANUAL'];
const REVISION_STATUSES: RevisionStatus[] = ['DRAFT', 'IN_REVIEW', 'APPROVED', 'OBSOLETE', 'SUPERSEDED'];

const SPECIAL_PROCESS_TYPES: SpecialProcessType[] = [
  'welding', 'NDT', 'heat-treat', 'surface-treatment', 'composites', 'chemical-processing',
];
const SPECIAL_PROCESS_CERTIFICATIONS: SpecialProcessCertification[] = ['NADCAP', 'customer-approved', 'internal'];
const SPECIAL_PROCESS_STATUSES: SpecialProcessStatus[] = ['active', 'expiring-soon', 'expired', 'pending'];

const BASELINE_STATUSES: BaselineStatus[] = ['current', 'superseded', 'draft'];

const COUNTERFEIT_METHODS: CounterfeitVerificationMethod[] = ['certificate', 'xrf', 'visual', 'dimensional'];
const COUNTERFEIT_STATUSES: CounterfeitStatus[] = ['verified', 'suspect', 'quarantined'];

const FAI_STATUSES: FAIStatus[] = ['OPEN', 'IN_PROGRESS', 'PASS', 'FAIL', 'CONDITIONALLY_ACCEPTED'];
const FAI_TYPES: FAIType[] = ['FULL', 'PARTIAL', 'DELTA'];
const FAI_PART_STATUSES: FAIPartStatus[] = ['NOT_STARTED', 'IN_PROGRESS', 'PASS', 'FAIL'];

const COMPLIANCE_STATUSES: ComplianceStatus[] = ['compliant', 'partial', 'non-compliant', 'not-assessed'];

// ---------------------------------------------------------------------------
// Badge / color maps (inlined from source)
// ---------------------------------------------------------------------------

const ncrStatusColors: Record<NCRStatus, string> = {
  OPEN:         'bg-red-100 text-red-700',
  UNDER_REVIEW: 'bg-yellow-100 text-yellow-700',
  DISPOSITION:  'bg-orange-100 text-orange-700',
  CLOSED:       'bg-green-100 text-green-700',
  VOIDED:       'bg-gray-100 text-gray-500',
};

const ncrSeverityColors: Record<NCRSeverity, string> = {
  MINOR:    'bg-blue-100 text-blue-700',
  MAJOR:    'bg-orange-100 text-orange-700',
  CRITICAL: 'bg-red-100 text-red-800',
};

const ncrTypeColors: Record<NCRType, string> = {
  INTERNAL:   'bg-purple-100 text-purple-700',
  SUPPLIER:   'bg-pink-100 text-pink-700',
  CUSTOMER:   'bg-indigo-100 text-indigo-700',
  IN_PROCESS: 'bg-amber-100 text-amber-700',
};

const revisionStatusColors: Record<RevisionStatus, string> = {
  DRAFT:      'bg-gray-100 text-gray-700',
  IN_REVIEW:  'bg-yellow-100 text-yellow-800',
  APPROVED:   'bg-green-100 text-green-800',
  OBSOLETE:   'bg-red-100 text-red-700',
  SUPERSEDED: 'bg-orange-100 text-orange-700',
};

const specialProcessStatusColors: Record<SpecialProcessStatus, string> = {
  'active':        'bg-green-100 text-green-700',
  'expiring-soon': 'bg-yellow-100 text-yellow-700',
  'expired':       'bg-red-100 text-red-700',
  'pending':       'bg-blue-100 text-blue-700',
};

const counterfeitMethodColors: Record<CounterfeitVerificationMethod, string> = {
  certificate: 'bg-green-100 text-green-700',
  xrf:         'bg-purple-100 text-purple-700',
  visual:      'bg-blue-100 text-blue-700',
  dimensional: 'bg-orange-100 text-orange-700',
};

const counterfeitStatusColors: Record<CounterfeitStatus, string> = {
  verified:    'bg-green-100 text-green-700',
  suspect:     'bg-yellow-100 text-yellow-700',
  quarantined: 'bg-red-100 text-red-700',
};

const baselineStatusColors: Record<BaselineStatus, string> = {
  current:    'bg-green-100 text-green-700',
  superseded: 'bg-gray-100 text-gray-500',
  draft:      'bg-blue-100 text-blue-700',
};

const complianceStatusColors: Record<ComplianceStatus, string> = {
  'compliant':     'bg-green-100 text-green-700',
  'partial':       'bg-yellow-100 text-yellow-700',
  'non-compliant': 'bg-red-100 text-red-700',
  'not-assessed':  'bg-gray-100 text-gray-500',
};

const faiStatusColors: Record<FAIStatus, string> = {
  OPEN:                   'bg-gray-100 text-gray-700',
  IN_PROGRESS:            'bg-blue-100 text-blue-700',
  PASS:                   'bg-green-100 text-green-700',
  FAIL:                   'bg-red-100 text-red-700',
  CONDITIONALLY_ACCEPTED: 'bg-yellow-100 text-yellow-700',
};

// ---------------------------------------------------------------------------
// Mock data shapes (inlined)
// ---------------------------------------------------------------------------

interface MockNCR {
  id: string;
  refNumber: string;
  title: string;
  type: NCRType;
  status: NCRStatus;
  severity: NCRSeverity;
  partNumber: string;
  supplier?: string;
  disposition?: string;
  openedAt: string;
}

interface MockFAI {
  id: string;
  refNumber: string;
  partNumber: string;
  partName: string;
  revision: string;
  faiType: FAIType;
  status: FAIStatus;
  part1Status: FAIPartStatus;
  part2Status: FAIPartStatus;
  part3Status: FAIPartStatus;
  customer: string;
  createdAt: string;
}

interface MockBaseline {
  id: string;
  name: string;
  version: string;
  status: BaselineStatus;
  itemCount: number;
  changesSinceLastBaseline: number;
  approvedBy: string | null;
}

interface MockSpecialProcess {
  id: string;
  processName: string;
  type: SpecialProcessType;
  certification: SpecialProcessCertification;
  status: SpecialProcessStatus;
  accreditationNumber: string;
}

const MOCK_NCRS: MockNCR[] = [
  {
    id: '1', refNumber: 'NCR-AE-2026-001',
    title: 'Fastener material CoC missing', type: 'SUPPLIER', status: 'OPEN', severity: 'MAJOR',
    partNumber: 'AN960-416L', supplier: 'GlobalFasteners LLC', openedAt: '2026-01-10',
  },
  {
    id: '2', refNumber: 'NCR-AE-2026-002',
    title: 'Surface finish out of spec — hard anodise', type: 'IN_PROCESS', status: 'UNDER_REVIEW', severity: 'MINOR',
    partNumber: 'FRAME-AS-0047', openedAt: '2026-01-20',
  },
  {
    id: '3', refNumber: 'NCR-AE-2026-003',
    title: 'Weld porosity detected during FPI', type: 'INTERNAL', status: 'DISPOSITION', severity: 'CRITICAL',
    partNumber: 'SPAR-WLD-1193', disposition: 'Scrap and rework batch', openedAt: '2026-02-01',
  },
  {
    id: '4', refNumber: 'NCR-AE-2026-004',
    title: 'Dimension out-of-tolerance at final inspection', type: 'CUSTOMER', status: 'CLOSED', severity: 'MAJOR',
    partNumber: 'RIB-2240A', customer: 'Airbus SE', openedAt: '2026-02-15',
  },
];

const MOCK_FAIS: MockFAI[] = [
  {
    id: '1', refNumber: 'FAI-AE-2026-001',
    partNumber: 'WING-SPAR-A320', partName: 'Wing Spar Assembly A320', revision: 'D',
    faiType: 'FULL', status: 'IN_PROGRESS',
    part1Status: 'PASS', part2Status: 'IN_PROGRESS', part3Status: 'NOT_STARTED',
    customer: 'Airbus SE', createdAt: '2026-01-15',
  },
  {
    id: '2', refNumber: 'FAI-AE-2026-002',
    partNumber: 'FUS-FRAME-B737', partName: 'Fuselage Frame 737', revision: 'B',
    faiType: 'DELTA', status: 'PASS',
    part1Status: 'PASS', part2Status: 'PASS', part3Status: 'PASS',
    customer: 'Boeing Commercial', createdAt: '2026-02-01',
  },
];

const MOCK_BASELINES: MockBaseline[] = [
  {
    id: '1', name: 'Airframe Assembly Baseline', version: 'v4.2.0',
    status: 'current', itemCount: 247, changesSinceLastBaseline: 0, approvedBy: 'C. Rodriguez',
  },
  {
    id: '2', name: 'Avionics Software Baseline', version: 'v2.5.1',
    status: 'current', itemCount: 93, changesSinceLastBaseline: 0, approvedBy: 'P. Nakamura',
  },
  {
    id: '3', name: 'Propulsion System Baseline', version: 'v3.0.0',
    status: 'draft', itemCount: 158, changesSinceLastBaseline: 14, approvedBy: null,
  },
];

const MOCK_SPECIAL_PROCESSES: MockSpecialProcess[] = [
  { id: '1', processName: 'Electron Beam Welding', type: 'welding', certification: 'NADCAP', status: 'active', accreditationNumber: 'NADCAP-W-21045' },
  { id: '2', processName: 'Fluorescent Penetrant Inspection', type: 'NDT', certification: 'NADCAP', status: 'expiring-soon', accreditationNumber: 'NADCAP-NDT-18932' },
  { id: '3', processName: 'Vacuum Heat Treatment', type: 'heat-treat', certification: 'NADCAP', status: 'expired', accreditationNumber: 'NADCAP-HT-14567' },
  { id: '4', processName: 'Carbon Fibre Lay-up', type: 'composites', certification: 'customer-approved', status: 'active', accreditationNumber: 'CA-BOEING-7734' },
  { id: '5', processName: 'Cadmium Plating', type: 'chemical-processing', certification: 'NADCAP', status: 'pending', accreditationNumber: 'NADCAP-CP-33201' },
];

// ---------------------------------------------------------------------------
// Pure helper functions (inlined)
// ---------------------------------------------------------------------------

/** AS9100 / FMEA: Risk Priority Number = Severity × Occurrence × Detection */
function computeRPN(severity: number, occurrence: number, detection: number): number {
  return severity * occurrence * detection;
}

/** Classify RPN into aerospace criticality bands */
function classifyRPN(rpn: number): 'critical' | 'high' | 'acceptable' {
  if (rpn >= 200) return 'critical';
  if (rpn >= 100) return 'high';
  return 'acceptable';
}

/** Check whether a special process certification is expiring */
function isCertificationExpiringSoon(daysUntilExpiry: number): boolean {
  return daysUntilExpiry >= 0 && daysUntilExpiry <= 90;
}

/** Compute FAI pass rate across three parts */
function faPartPassCount(part1: FAIPartStatus, part2: FAIPartStatus, part3: FAIPartStatus): number {
  return [part1, part2, part3].filter((s) => s === 'PASS').length;
}

/** Compute airworthiness score (same formula as existing stub) */
function computeAirworthinessScore(defects: number, openCAPAs: number, auditFindings: number): number {
  return Math.max(0, 100 - defects * 5 - openCAPAs * 3 - auditFindings * 2);
}

/** Counterfeit risk band */
function counterfeitRiskBand(score: number): 'low' | 'medium' | 'high' {
  if (score <= 25) return 'low';
  if (score <= 60) return 'medium';
  return 'high';
}

/** Format AS9100 reference number */
function formatNCRRef(year: number, seq: number): string {
  return `NCR-AE-${year}-${String(seq).padStart(3, '0')}`;
}

/** Determine if delta FAI is applicable (design or material change) */
function deltaFAIApplicable(changeType: string): boolean {
  return ['DESIGN_CHANGE', 'MATERIAL_CHANGE', 'PROCESS_CHANGE'].includes(changeType);
}

// ============================================================================
// Test suites
// ============================================================================

describe('NCR status array', () => {
  it('has 5 statuses', () => expect(NCR_STATUSES).toHaveLength(5));
  for (const s of NCR_STATUSES) {
    it(`NCR status "${s}" is a non-empty string`, () => {
      expect(typeof s).toBe('string');
      expect(s.length).toBeGreaterThan(0);
    });
    it(`NCR status "${s}" has color defined`, () => {
      expect(ncrStatusColors[s]).toBeDefined();
    });
    it(`NCR status "${s}" color includes bg-`, () => {
      expect(ncrStatusColors[s]).toContain('bg-');
    });
  }
  it('OPEN is red', () => expect(ncrStatusColors.OPEN).toContain('red'));
  it('CLOSED is green', () => expect(ncrStatusColors.CLOSED).toContain('green'));
  it('VOIDED is gray', () => expect(ncrStatusColors.VOIDED).toContain('gray'));
});

describe('NCR type array', () => {
  it('has 4 types', () => expect(NCR_TYPES).toHaveLength(4));
  for (const t of NCR_TYPES) {
    it(`NCR type "${t}" has color defined`, () => expect(ncrTypeColors[t]).toBeDefined());
    it(`NCR type "${t}" color includes text-`, () => expect(ncrTypeColors[t]).toContain('text-'));
  }
  it('SUPPLIER is pink', () => expect(ncrTypeColors.SUPPLIER).toContain('pink'));
  it('CUSTOMER is indigo', () => expect(ncrTypeColors.CUSTOMER).toContain('indigo'));
});

describe('NCR severity array', () => {
  it('has 3 severities', () => expect(NCR_SEVERITIES).toHaveLength(3));
  for (const s of NCR_SEVERITIES) {
    it(`NCR severity "${s}" has color defined`, () => expect(ncrSeverityColors[s]).toBeDefined());
    it(`NCR severity "${s}" color is a string`, () => expect(typeof ncrSeverityColors[s]).toBe('string'));
  }
  it('CRITICAL is red', () => expect(ncrSeverityColors.CRITICAL).toContain('red'));
  it('MINOR is blue', () => expect(ncrSeverityColors.MINOR).toContain('blue'));
  it('MAJOR is orange', () => expect(ncrSeverityColors.MAJOR).toContain('orange'));
});

describe('Document types', () => {
  it('has 6 document types', () => expect(DOCUMENT_TYPES).toHaveLength(6));
  for (const d of DOCUMENT_TYPES) {
    it(`document type "${d}" is a string`, () => expect(typeof d).toBe('string'));
  }
  it('includes DRAWING', () => expect(DOCUMENT_TYPES).toContain('DRAWING'));
  it('includes MANUAL', () => expect(DOCUMENT_TYPES).toContain('MANUAL'));
});

describe('Revision status colors', () => {
  it('has 5 revision statuses', () => expect(REVISION_STATUSES).toHaveLength(5));
  for (const s of REVISION_STATUSES) {
    it(`revision status "${s}" has color`, () => expect(revisionStatusColors[s]).toBeDefined());
    it(`revision status "${s}" has bg-`, () => expect(revisionStatusColors[s]).toContain('bg-'));
  }
  it('APPROVED is green', () => expect(revisionStatusColors.APPROVED).toContain('green'));
  it('OBSOLETE is red', () => expect(revisionStatusColors.OBSOLETE).toContain('red'));
  it('DRAFT is gray', () => expect(revisionStatusColors.DRAFT).toContain('gray'));
});

describe('Special process types', () => {
  it('has 6 special process types', () => expect(SPECIAL_PROCESS_TYPES).toHaveLength(6));
  for (const t of SPECIAL_PROCESS_TYPES) {
    it(`special process type "${t}" is a string`, () => expect(typeof t).toBe('string'));
  }
  it('includes NDT', () => expect(SPECIAL_PROCESS_TYPES).toContain('NDT'));
  it('includes composites', () => expect(SPECIAL_PROCESS_TYPES).toContain('composites'));
  it('includes welding', () => expect(SPECIAL_PROCESS_TYPES).toContain('welding'));
});

describe('Special process certifications', () => {
  it('has 3 certification types', () => expect(SPECIAL_PROCESS_CERTIFICATIONS).toHaveLength(3));
  for (const c of SPECIAL_PROCESS_CERTIFICATIONS) {
    it(`certification "${c}" is a string`, () => expect(typeof c).toBe('string'));
  }
  it('includes NADCAP', () => expect(SPECIAL_PROCESS_CERTIFICATIONS).toContain('NADCAP'));
  it('includes internal', () => expect(SPECIAL_PROCESS_CERTIFICATIONS).toContain('internal'));
});

describe('Special process status colors', () => {
  for (const s of SPECIAL_PROCESS_STATUSES) {
    it(`status "${s}" has color`, () => expect(specialProcessStatusColors[s]).toBeDefined());
    it(`status "${s}" has bg-`, () => expect(specialProcessStatusColors[s]).toContain('bg-'));
  }
  it('active is green', () => expect(specialProcessStatusColors.active).toContain('green'));
  it('expired is red', () => expect(specialProcessStatusColors.expired).toContain('red'));
  it('expiring-soon is yellow', () => expect(specialProcessStatusColors['expiring-soon']).toContain('yellow'));
  it('pending is blue', () => expect(specialProcessStatusColors.pending).toContain('blue'));
});

describe('FAI status colors', () => {
  it('has 5 FAI statuses', () => expect(FAI_STATUSES).toHaveLength(5));
  for (const s of FAI_STATUSES) {
    it(`FAI status "${s}" has color`, () => expect(faiStatusColors[s]).toBeDefined());
    it(`FAI status "${s}" has text-`, () => expect(faiStatusColors[s]).toContain('text-'));
  }
  it('PASS is green', () => expect(faiStatusColors.PASS).toContain('green'));
  it('FAIL is red', () => expect(faiStatusColors.FAIL).toContain('red'));
});

describe('FAI types', () => {
  it('has 3 FAI types', () => expect(FAI_TYPES).toHaveLength(3));
  for (const t of FAI_TYPES) {
    it(`FAI type "${t}" is a string`, () => expect(typeof t).toBe('string'));
  }
  it('includes FULL', () => expect(FAI_TYPES).toContain('FULL'));
  it('includes DELTA', () => expect(FAI_TYPES).toContain('DELTA'));
  it('includes PARTIAL', () => expect(FAI_TYPES).toContain('PARTIAL'));
});

describe('Counterfeit verification method colors', () => {
  for (const m of COUNTERFEIT_METHODS) {
    it(`method "${m}" has color`, () => expect(counterfeitMethodColors[m]).toBeDefined());
    it(`method "${m}" has bg-`, () => expect(counterfeitMethodColors[m]).toContain('bg-'));
  }
  it('xrf is purple', () => expect(counterfeitMethodColors.xrf).toContain('purple'));
  it('certificate is green', () => expect(counterfeitMethodColors.certificate).toContain('green'));
  it('dimensional is orange', () => expect(counterfeitMethodColors.dimensional).toContain('orange'));
});

describe('Counterfeit status colors', () => {
  for (const s of COUNTERFEIT_STATUSES) {
    it(`counterfeit status "${s}" has color`, () => expect(counterfeitStatusColors[s]).toBeDefined());
    it(`counterfeit status "${s}" is a string`, () => expect(typeof counterfeitStatusColors[s]).toBe('string'));
  }
  it('quarantined is red', () => expect(counterfeitStatusColors.quarantined).toContain('red'));
  it('verified is green', () => expect(counterfeitStatusColors.verified).toContain('green'));
  it('suspect is yellow', () => expect(counterfeitStatusColors.suspect).toContain('yellow'));
});

describe('Baseline status colors', () => {
  for (const s of BASELINE_STATUSES) {
    it(`baseline status "${s}" has color`, () => expect(baselineStatusColors[s]).toBeDefined());
    it(`baseline status "${s}" has text-`, () => expect(baselineStatusColors[s]).toContain('text-'));
  }
  it('current is green', () => expect(baselineStatusColors.current).toContain('green'));
  it('superseded is gray', () => expect(baselineStatusColors.superseded).toContain('gray'));
  it('draft is blue', () => expect(baselineStatusColors.draft).toContain('blue'));
});

describe('Compliance status colors', () => {
  for (const s of COMPLIANCE_STATUSES) {
    it(`compliance status "${s}" has color`, () => expect(complianceStatusColors[s]).toBeDefined());
  }
  it('compliant is green', () => expect(complianceStatusColors.compliant).toContain('green'));
  it('non-compliant is red', () => expect(complianceStatusColors['non-compliant']).toContain('red'));
  it('partial is yellow', () => expect(complianceStatusColors.partial).toContain('yellow'));
  it('not-assessed is gray', () => expect(complianceStatusColors['not-assessed']).toContain('gray'));
});

describe('computeRPN — FMEA helper', () => {
  it('minimum RPN is 1 (1×1×1)', () => expect(computeRPN(1, 1, 1)).toBe(1));
  it('maximum RPN is 1000 (10×10×10)', () => expect(computeRPN(10, 10, 10)).toBe(1000));
  it('5×4×3 = 60', () => expect(computeRPN(5, 4, 3)).toBe(60));
  it('9×3×4 = 108', () => expect(computeRPN(9, 3, 4)).toBe(108));
  it('commutative: 2×3×5 = 3×5×2', () => expect(computeRPN(2, 3, 5)).toBe(computeRPN(3, 5, 2)));
  for (let s = 1; s <= 10; s++) {
    it(`RPN with severity ${s} is positive`, () => expect(computeRPN(s, 5, 5)).toBeGreaterThan(0));
  }
});

describe('classifyRPN', () => {
  it('200 is critical', () => expect(classifyRPN(200)).toBe('critical'));
  it('500 is critical', () => expect(classifyRPN(500)).toBe('critical'));
  it('100 is high', () => expect(classifyRPN(100)).toBe('high'));
  it('199 is high', () => expect(classifyRPN(199)).toBe('high'));
  it('99 is acceptable', () => expect(classifyRPN(99)).toBe('acceptable'));
  it('1 is acceptable', () => expect(classifyRPN(1)).toBe('acceptable'));
  it('0 is acceptable', () => expect(classifyRPN(0)).toBe('acceptable'));
  const bands = ['critical', 'high', 'acceptable'] as const;
  for (let i = 0; i <= 100; i++) {
    it(`classifyRPN(${i * 10}) returns a valid band`, () => {
      expect(bands).toContain(classifyRPN(i * 10));
    });
  }
});

describe('isCertificationExpiringSoon', () => {
  it('0 days is expiring soon', () => expect(isCertificationExpiringSoon(0)).toBe(true));
  it('90 days is expiring soon', () => expect(isCertificationExpiringSoon(90)).toBe(true));
  it('91 days is not expiring soon', () => expect(isCertificationExpiringSoon(91)).toBe(false));
  it('negative days (already expired) is not "expiring soon"', () => expect(isCertificationExpiringSoon(-1)).toBe(false));
  for (let d = 0; d <= 90; d += 10) {
    it(`${d} days is expiring soon`, () => expect(isCertificationExpiringSoon(d)).toBe(true));
  }
});

describe('faPartPassCount', () => {
  it('all PASS returns 3', () => expect(faPartPassCount('PASS', 'PASS', 'PASS')).toBe(3));
  it('all NOT_STARTED returns 0', () => expect(faPartPassCount('NOT_STARTED', 'NOT_STARTED', 'NOT_STARTED')).toBe(0));
  it('one PASS returns 1', () => expect(faPartPassCount('PASS', 'FAIL', 'IN_PROGRESS')).toBe(1));
  it('two PASS returns 2', () => expect(faPartPassCount('PASS', 'PASS', 'FAIL')).toBe(2));
  it('FAIL does not count as PASS', () => expect(faPartPassCount('FAIL', 'FAIL', 'FAIL')).toBe(0));
});

describe('computeAirworthinessScore', () => {
  it('zero inputs gives 100', () => expect(computeAirworthinessScore(0, 0, 0)).toBe(100));
  it('clamps to 0 with extreme inputs', () => expect(computeAirworthinessScore(100, 100, 100)).toBe(0));
  it('1 defect costs 5 points', () => expect(computeAirworthinessScore(1, 0, 0)).toBe(95));
  it('1 CAPA costs 3 points', () => expect(computeAirworthinessScore(0, 1, 0)).toBe(97));
  it('1 audit finding costs 2 points', () => expect(computeAirworthinessScore(0, 0, 1)).toBe(98));
  it('result is always between 0 and 100', () => {
    for (let i = 0; i <= 20; i++) {
      const score = computeAirworthinessScore(i, i, i);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    }
  });
});

describe('counterfeitRiskBand', () => {
  it('0 is low', () => expect(counterfeitRiskBand(0)).toBe('low'));
  it('25 is low', () => expect(counterfeitRiskBand(25)).toBe('low'));
  it('26 is medium', () => expect(counterfeitRiskBand(26)).toBe('medium'));
  it('60 is medium', () => expect(counterfeitRiskBand(60)).toBe('medium'));
  it('61 is high', () => expect(counterfeitRiskBand(61)).toBe('high'));
  it('100 is high', () => expect(counterfeitRiskBand(100)).toBe('high'));
  const bands = ['low', 'medium', 'high'] as const;
  for (let i = 0; i <= 100; i++) {
    it(`counterfeitRiskBand(${i}) returns a valid band`, () => {
      expect(bands).toContain(counterfeitRiskBand(i));
    });
  }
});

describe('formatNCRRef', () => {
  it('formats NCR-AE-2026-001 correctly', () => expect(formatNCRRef(2026, 1)).toBe('NCR-AE-2026-001'));
  it('formats NCR-AE-2026-010 correctly', () => expect(formatNCRRef(2026, 10)).toBe('NCR-AE-2026-010'));
  it('formats NCR-AE-2026-100 correctly', () => expect(formatNCRRef(2026, 100)).toBe('NCR-AE-2026-100'));
  for (let i = 1; i <= 20; i++) {
    it(`formatNCRRef(2026, ${i}) starts with NCR-AE-2026-`, () => {
      expect(formatNCRRef(2026, i)).toMatch(/^NCR-AE-2026-\d{3,}$/);
    });
  }
});

describe('deltaFAIApplicable', () => {
  for (const ct of ['DESIGN_CHANGE', 'MATERIAL_CHANGE', 'PROCESS_CHANGE']) {
    it(`"${ct}" requires delta FAI`, () => expect(deltaFAIApplicable(ct)).toBe(true));
  }
  for (const ct of ['DOCUMENTATION', 'LABEL_CHANGE', 'PACKAGING']) {
    it(`"${ct}" does not require delta FAI`, () => expect(deltaFAIApplicable(ct)).toBe(false));
  }
  it('returns boolean', () => expect(typeof deltaFAIApplicable('UNKNOWN')).toBe('boolean'));
});

describe('MOCK NCR data shapes', () => {
  it('has 4 mock NCRs', () => expect(MOCK_NCRS).toHaveLength(4));
  for (const ncr of MOCK_NCRS) {
    it(`NCR "${ncr.refNumber}" has valid refNumber pattern`, () => {
      expect(ncr.refNumber).toMatch(/^NCR-AE-\d{4}-\d{3}$/);
    });
    it(`NCR "${ncr.refNumber}" has a valid type`, () => {
      expect(NCR_TYPES).toContain(ncr.type);
    });
    it(`NCR "${ncr.refNumber}" has a valid status`, () => {
      expect(NCR_STATUSES).toContain(ncr.status);
    });
    it(`NCR "${ncr.refNumber}" has a valid severity`, () => {
      expect(NCR_SEVERITIES).toContain(ncr.severity);
    });
    it(`NCR "${ncr.refNumber}" partNumber is non-empty`, () => {
      expect(ncr.partNumber.length).toBeGreaterThan(0);
    });
  }
});

describe('MOCK FAI data shapes', () => {
  it('has 2 mock FAIs', () => expect(MOCK_FAIS).toHaveLength(2));
  for (const fai of MOCK_FAIS) {
    it(`FAI "${fai.refNumber}" has valid status`, () => expect(FAI_STATUSES).toContain(fai.status));
    it(`FAI "${fai.refNumber}" has valid type`, () => expect(FAI_TYPES).toContain(fai.faiType));
    it(`FAI "${fai.refNumber}" part1Status is valid`, () => expect(FAI_PART_STATUSES).toContain(fai.part1Status));
    it(`FAI "${fai.refNumber}" part2Status is valid`, () => expect(FAI_PART_STATUSES).toContain(fai.part2Status));
    it(`FAI "${fai.refNumber}" part3Status is valid`, () => expect(FAI_PART_STATUSES).toContain(fai.part3Status));
    it(`FAI "${fai.refNumber}" has non-empty partNumber`, () => expect(fai.partNumber.length).toBeGreaterThan(0));
    it(`FAI "${fai.refNumber}" revision is non-empty`, () => expect(fai.revision.length).toBeGreaterThan(0));
  }
});

describe('MOCK Baseline data shapes', () => {
  it('has 3 mock baselines', () => expect(MOCK_BASELINES).toHaveLength(3));
  for (const b of MOCK_BASELINES) {
    it(`Baseline "${b.name}" has valid status`, () => expect(BASELINE_STATUSES).toContain(b.status));
    it(`Baseline "${b.name}" itemCount is positive`, () => expect(b.itemCount).toBeGreaterThan(0));
    it(`Baseline "${b.name}" changesSinceLastBaseline is non-negative`, () => {
      expect(b.changesSinceLastBaseline).toBeGreaterThanOrEqual(0);
    });
  }
  it('current baselines have approvedBy set', () => {
    const currents = MOCK_BASELINES.filter((b) => b.status === 'current');
    for (const b of currents) {
      expect(b.approvedBy).not.toBeNull();
    }
  });
  it('draft baselines may have null approvedBy', () => {
    const drafts = MOCK_BASELINES.filter((b) => b.status === 'draft');
    for (const b of drafts) {
      expect(b.approvedBy === null || typeof b.approvedBy === 'string').toBe(true);
    }
  });
  it('current baselines have 0 changesSinceLastBaseline', () => {
    const currents = MOCK_BASELINES.filter((b) => b.status === 'current');
    for (const b of currents) {
      expect(b.changesSinceLastBaseline).toBe(0);
    }
  });
});

describe('MOCK Special Processes data shapes', () => {
  it('has 5 mock special processes', () => expect(MOCK_SPECIAL_PROCESSES).toHaveLength(5));
  for (const sp of MOCK_SPECIAL_PROCESSES) {
    it(`Special process "${sp.processName}" type is valid`, () => {
      expect(SPECIAL_PROCESS_TYPES).toContain(sp.type);
    });
    it(`Special process "${sp.processName}" certification is valid`, () => {
      expect(SPECIAL_PROCESS_CERTIFICATIONS).toContain(sp.certification);
    });
    it(`Special process "${sp.processName}" status is valid`, () => {
      expect(SPECIAL_PROCESS_STATUSES).toContain(sp.status);
    });
    it(`Special process "${sp.processName}" has non-empty accreditation number`, () => {
      expect(sp.accreditationNumber.length).toBeGreaterThan(0);
    });
  }
  it('all NADCAP processes have NADCAP prefix in accreditation', () => {
    const nadcap = MOCK_SPECIAL_PROCESSES.filter((sp) => sp.certification === 'NADCAP');
    for (const sp of nadcap) {
      expect(sp.accreditationNumber).toMatch(/^NADCAP-/);
    }
  });
});
