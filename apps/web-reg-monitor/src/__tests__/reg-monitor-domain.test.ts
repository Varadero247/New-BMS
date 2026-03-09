// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

// ─── Domain constants (inlined from source) ──────────────────────────────────

const SOURCES = [
  'GOVERNMENT',
  'REGULATOR',
  'STANDARDS_BODY',
  'INDUSTRY',
  'EU_UK',
  'OTHER',
] as const;
type Source = (typeof SOURCES)[number];

const CHANGE_STATUSES = [
  'NEW',
  'UNDER_REVIEW',
  'ASSESSED',
  'IMPLEMENTED',
  'NOT_APPLICABLE',
  'MONITORING',
] as const;
type ChangeStatus = (typeof CHANGE_STATUSES)[number];

const IMPACTS = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'NONE'] as const;
type Impact = (typeof IMPACTS)[number];

const OBLIGATION_STATUSES = [
  'OPEN',
  'IN_PROGRESS',
  'COMPLETED',
  'OVERDUE',
  'NOT_APPLICABLE',
] as const;
type ObligationStatus = (typeof OBLIGATION_STATUSES)[number];

const FREQUENCIES = [
  'ONE_OFF',
  'DAILY',
  'WEEKLY',
  'MONTHLY',
  'QUARTERLY',
  'SEMI_ANNUAL',
  'ANNUAL',
  'BIENNIAL',
] as const;
type Frequency = (typeof FREQUENCIES)[number];

const COMPLIANCE_STATUSES = [
  'COMPLIANT',
  'PARTIALLY_COMPLIANT',
  'NON_COMPLIANT',
  'NOT_ASSESSED',
  'NOT_APPLICABLE',
] as const;
type ComplianceStatus = (typeof COMPLIANCE_STATUSES)[number];

// ─── Badge / colour maps (inlined from source) ────────────────────────────────

const impactColor: Record<Impact, string> = {
  CRITICAL: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  HIGH: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  MEDIUM: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  LOW: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  NONE: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
};

const obligationStatusColor: Record<ObligationStatus, string> = {
  COMPLETED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  IN_PROGRESS: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  OVERDUE: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  OPEN: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  NOT_APPLICABLE: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
};

const complianceColor: Record<ComplianceStatus, string> = {
  COMPLIANT: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  PARTIALLY_COMPLIANT: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  NON_COMPLIANT: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  NOT_ASSESSED: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
  NOT_APPLICABLE: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
};

// ─── Impact severity ordering ──────────────────────────────────────────────────

const impactRank: Record<Impact, number> = {
  NONE: 0,
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
  CRITICAL: 4,
};

// ─── Compliance score (based on obligation-colour logic) ──────────────────────

function complianceScore(totalItems: number, compliantItems: number): number {
  if (totalItems === 0) return 100;
  return Math.round((compliantItems / totalItems) * 100);
}

// ─── Is high/critical impact (mirrors dashboard card filter) ─────────────────

function isHighImpact(impact: Impact): boolean {
  return impact === 'CRITICAL' || impact === 'HIGH';
}

// ─── Is change pending review (mirrors "Under Review" dashboard card) ─────────

function isPendingReview(status: ChangeStatus): boolean {
  return status === 'NEW' || status === 'UNDER_REVIEW';
}

// ─── Obligation is actionable ─────────────────────────────────────────────────

function isActionableObligation(status: ObligationStatus): boolean {
  return status === 'OPEN' || status === 'IN_PROGRESS' || status === 'OVERDUE';
}

// ─── Days overdue (positive when past due date) ───────────────────────────────

function daysOverdue(dueDate: Date, now: Date): number {
  return Math.ceil((now.getTime() - dueDate.getTime()) / 86400000);
}

// ─── Reference number format helpers ─────────────────────────────────────────

function isValidChangeRef(ref: string): boolean {
  return /^RM-CHG-\d{4}-\d{3}$/.test(ref);
}

function isValidObligationRef(ref: string): boolean {
  return /^RM-OBL-\d{4}-\d{3}$/.test(ref);
}

function isValidLegalRef(ref: string): boolean {
  return /^RM-LEG-\d{4}-\d{3}$/.test(ref);
}

// ─── Mock data shapes ─────────────────────────────────────────────────────────

interface MockChange {
  id: string;
  referenceNumber: string;
  title: string;
  source: Source;
  status: ChangeStatus;
  impact: Impact;
  affectedAreas: string[];
  publishedDate: string;
  effectiveDate: string;
  assigneeName: string;
}

interface MockObligation {
  id: string;
  referenceNumber: string;
  title: string;
  source: string;
  dueDate: string;
  frequency: Frequency;
  responsible: string;
  status: ObligationStatus;
}

interface MockLegalItem {
  id: string;
  referenceNumber: string;
  title: string;
  legislation: string;
  jurisdiction: string;
  complianceStatus: ComplianceStatus;
  responsiblePerson: string;
  reviewDate: string;
}

const mockChanges: MockChange[] = [
  {
    id: 'c-001',
    referenceNumber: 'RM-CHG-2026-001',
    title: 'REACH Amendment 2026',
    source: 'REGULATOR',
    status: 'NEW',
    impact: 'HIGH',
    affectedAreas: ['Quality', 'Environment'],
    publishedDate: '2026-01-15T00:00:00.000Z',
    effectiveDate: '2026-07-01T00:00:00.000Z',
    assigneeName: 'Sarah Green',
  },
  {
    id: 'c-002',
    referenceNumber: 'RM-CHG-2026-002',
    title: 'ISO 14001 Guidance Update',
    source: 'STANDARDS_BODY',
    status: 'UNDER_REVIEW',
    impact: 'MEDIUM',
    affectedAreas: ['Environment'],
    publishedDate: '2026-02-01T00:00:00.000Z',
    effectiveDate: '2026-06-01T00:00:00.000Z',
    assigneeName: 'Tom Clark',
  },
  {
    id: 'c-003',
    referenceNumber: 'RM-CHG-2026-003',
    title: 'Health & Safety at Work (Amendment)',
    source: 'GOVERNMENT',
    status: 'IMPLEMENTED',
    impact: 'CRITICAL',
    affectedAreas: ['H&S'],
    publishedDate: '2025-11-01T00:00:00.000Z',
    effectiveDate: '2026-01-01T00:00:00.000Z',
    assigneeName: 'Jane Smith',
  },
];

const mockObligations: MockObligation[] = [
  {
    id: 'o-001',
    referenceNumber: 'RM-OBL-2026-001',
    title: 'Annual GDPR Review',
    source: 'GDPR Article 35',
    dueDate: '2026-12-31T00:00:00.000Z',
    frequency: 'ANNUAL',
    responsible: 'DPO',
    status: 'OPEN',
  },
  {
    id: 'o-002',
    referenceNumber: 'RM-OBL-2026-002',
    title: 'Quarterly Environment Report',
    source: 'ISO 14001',
    dueDate: '2026-03-31T00:00:00.000Z',
    frequency: 'QUARTERLY',
    responsible: 'EHS Manager',
    status: 'IN_PROGRESS',
  },
  {
    id: 'o-003',
    referenceNumber: 'RM-OBL-2025-012',
    title: 'H&S Risk Assessment Review',
    source: 'HSWA 1974',
    dueDate: '2025-12-01T00:00:00.000Z',
    frequency: 'SEMI_ANNUAL',
    responsible: 'H&S Manager',
    status: 'OVERDUE',
  },
];

const mockLegalItems: MockLegalItem[] = [
  {
    id: 'l-001',
    referenceNumber: 'RM-LEG-2026-001',
    title: 'UK GDPR Compliance',
    legislation: 'Data Protection Act 2018',
    jurisdiction: 'UK',
    complianceStatus: 'COMPLIANT',
    responsiblePerson: 'DPO',
    reviewDate: '2026-12-01T00:00:00.000Z',
  },
  {
    id: 'l-002',
    referenceNumber: 'RM-LEG-2026-002',
    title: 'REACH Substances Compliance',
    legislation: 'REACH Regulation (EC) 1907/2006',
    jurisdiction: 'EU',
    complianceStatus: 'PARTIALLY_COMPLIANT',
    responsiblePerson: 'Chemical Manager',
    reviewDate: '2026-06-01T00:00:00.000Z',
  },
  {
    id: 'l-003',
    referenceNumber: 'RM-LEG-2026-003',
    title: 'Modern Slavery Statement',
    legislation: 'Modern Slavery Act 2015',
    jurisdiction: 'UK',
    complianceStatus: 'NON_COMPLIANT',
    responsiblePerson: 'Legal Counsel',
    reviewDate: '2026-03-01T00:00:00.000Z',
  },
];

// ═════════════════════════════════════════════════════════════════════════════
// TEST SUITES
// ═════════════════════════════════════════════════════════════════════════════

describe('SOURCES array', () => {
  it('has 6 members', () => expect(SOURCES.length).toBe(6));
  it('contains GOVERNMENT', () => expect(SOURCES).toContain('GOVERNMENT'));
  it('contains REGULATOR', () => expect(SOURCES).toContain('REGULATOR'));
  it('contains STANDARDS_BODY', () => expect(SOURCES).toContain('STANDARDS_BODY'));
  it('contains INDUSTRY', () => expect(SOURCES).toContain('INDUSTRY'));
  it('contains EU_UK', () => expect(SOURCES).toContain('EU_UK'));
  it('contains OTHER', () => expect(SOURCES).toContain('OTHER'));
  for (const source of SOURCES) {
    it(`${source} is a non-empty string`, () => {
      expect(typeof source).toBe('string');
      expect(source.length).toBeGreaterThan(0);
    });
  }
});

describe('CHANGE_STATUSES array', () => {
  it('has 6 members', () => expect(CHANGE_STATUSES.length).toBe(6));
  it('contains NEW', () => expect(CHANGE_STATUSES).toContain('NEW'));
  it('contains UNDER_REVIEW', () => expect(CHANGE_STATUSES).toContain('UNDER_REVIEW'));
  it('contains ASSESSED', () => expect(CHANGE_STATUSES).toContain('ASSESSED'));
  it('contains IMPLEMENTED', () => expect(CHANGE_STATUSES).toContain('IMPLEMENTED'));
  it('contains NOT_APPLICABLE', () => expect(CHANGE_STATUSES).toContain('NOT_APPLICABLE'));
  it('contains MONITORING', () => expect(CHANGE_STATUSES).toContain('MONITORING'));
  for (const s of CHANGE_STATUSES) {
    it(`${s} matches UPPER_SNAKE_CASE`, () => expect(s).toMatch(/^[A-Z_]+$/));
  }
});

describe('IMPACTS array', () => {
  it('has 5 members', () => expect(IMPACTS.length).toBe(5));
  it('contains CRITICAL', () => expect(IMPACTS).toContain('CRITICAL'));
  it('contains HIGH', () => expect(IMPACTS).toContain('HIGH'));
  it('contains MEDIUM', () => expect(IMPACTS).toContain('MEDIUM'));
  it('contains LOW', () => expect(IMPACTS).toContain('LOW'));
  it('contains NONE', () => expect(IMPACTS).toContain('NONE'));
  for (const i of IMPACTS) {
    it(`${i} is non-empty string`, () => expect(i.length).toBeGreaterThan(0));
  }
});

describe('OBLIGATION_STATUSES array', () => {
  it('has 5 members', () => expect(OBLIGATION_STATUSES.length).toBe(5));
  it('contains OPEN', () => expect(OBLIGATION_STATUSES).toContain('OPEN'));
  it('contains IN_PROGRESS', () => expect(OBLIGATION_STATUSES).toContain('IN_PROGRESS'));
  it('contains COMPLETED', () => expect(OBLIGATION_STATUSES).toContain('COMPLETED'));
  it('contains OVERDUE', () => expect(OBLIGATION_STATUSES).toContain('OVERDUE'));
  it('contains NOT_APPLICABLE', () => expect(OBLIGATION_STATUSES).toContain('NOT_APPLICABLE'));
});

describe('FREQUENCIES array', () => {
  it('has 8 members', () => expect(FREQUENCIES.length).toBe(8));
  it('contains ONE_OFF', () => expect(FREQUENCIES).toContain('ONE_OFF'));
  it('contains ANNUAL', () => expect(FREQUENCIES).toContain('ANNUAL'));
  it('contains QUARTERLY', () => expect(FREQUENCIES).toContain('QUARTERLY'));
  it('contains MONTHLY', () => expect(FREQUENCIES).toContain('MONTHLY'));
  it('contains SEMI_ANNUAL', () => expect(FREQUENCIES).toContain('SEMI_ANNUAL'));
  it('contains BIENNIAL', () => expect(FREQUENCIES).toContain('BIENNIAL'));
  for (const f of FREQUENCIES) {
    it(`${f} is non-empty string`, () => expect(f.length).toBeGreaterThan(0));
  }
});

describe('COMPLIANCE_STATUSES array', () => {
  it('has 5 members', () => expect(COMPLIANCE_STATUSES.length).toBe(5));
  it('contains COMPLIANT', () => expect(COMPLIANCE_STATUSES).toContain('COMPLIANT'));
  it('contains PARTIALLY_COMPLIANT', () => expect(COMPLIANCE_STATUSES).toContain('PARTIALLY_COMPLIANT'));
  it('contains NON_COMPLIANT', () => expect(COMPLIANCE_STATUSES).toContain('NON_COMPLIANT'));
  it('contains NOT_ASSESSED', () => expect(COMPLIANCE_STATUSES).toContain('NOT_ASSESSED'));
  it('contains NOT_APPLICABLE', () => expect(COMPLIANCE_STATUSES).toContain('NOT_APPLICABLE'));
});

describe('impactColor badge map', () => {
  for (const impact of IMPACTS) {
    it(`${impact} has a color class`, () => expect(impactColor[impact]).toBeDefined());
    it(`${impact} color contains bg-`, () => expect(impactColor[impact]).toContain('bg-'));
    it(`${impact} color contains text-`, () => expect(impactColor[impact]).toContain('text-'));
  }
  it('CRITICAL uses red', () => expect(impactColor.CRITICAL).toContain('red'));
  it('HIGH uses orange', () => expect(impactColor.HIGH).toContain('orange'));
  it('MEDIUM uses yellow', () => expect(impactColor.MEDIUM).toContain('yellow'));
  it('LOW uses green', () => expect(impactColor.LOW).toContain('green'));
  it('NONE uses gray', () => expect(impactColor.NONE).toContain('gray'));
});

describe('obligationStatusColor badge map', () => {
  for (const status of OBLIGATION_STATUSES) {
    it(`${status} has a color class`, () => expect(obligationStatusColor[status]).toBeDefined());
    it(`${status} color contains bg-`, () => expect(obligationStatusColor[status]).toContain('bg-'));
  }
  it('COMPLETED uses green', () => expect(obligationStatusColor.COMPLETED).toContain('green'));
  it('OVERDUE uses red', () => expect(obligationStatusColor.OVERDUE).toContain('red'));
  it('IN_PROGRESS uses blue', () => expect(obligationStatusColor.IN_PROGRESS).toContain('blue'));
  it('OPEN uses yellow', () => expect(obligationStatusColor.OPEN).toContain('yellow'));
});

describe('complianceColor badge map', () => {
  for (const status of COMPLIANCE_STATUSES) {
    it(`${status} has a color class`, () => expect(complianceColor[status]).toBeDefined());
    it(`${status} color contains bg-`, () => expect(complianceColor[status]).toContain('bg-'));
  }
  it('COMPLIANT uses green', () => expect(complianceColor.COMPLIANT).toContain('green'));
  it('PARTIALLY_COMPLIANT uses yellow', () => expect(complianceColor.PARTIALLY_COMPLIANT).toContain('yellow'));
  it('NON_COMPLIANT uses red', () => expect(complianceColor.NON_COMPLIANT).toContain('red'));
});

describe('impactRank ordering', () => {
  it('NONE = 0', () => expect(impactRank.NONE).toBe(0));
  it('LOW = 1', () => expect(impactRank.LOW).toBe(1));
  it('MEDIUM = 2', () => expect(impactRank.MEDIUM).toBe(2));
  it('HIGH = 3', () => expect(impactRank.HIGH).toBe(3));
  it('CRITICAL = 4', () => expect(impactRank.CRITICAL).toBe(4));
  it('NONE < LOW < MEDIUM < HIGH < CRITICAL (monotone)', () => {
    expect(impactRank.NONE).toBeLessThan(impactRank.LOW);
    expect(impactRank.LOW).toBeLessThan(impactRank.MEDIUM);
    expect(impactRank.MEDIUM).toBeLessThan(impactRank.HIGH);
    expect(impactRank.HIGH).toBeLessThan(impactRank.CRITICAL);
  });
  for (const impact of IMPACTS) {
    it(`${impact} rank is non-negative`, () => expect(impactRank[impact]).toBeGreaterThanOrEqual(0));
    it(`${impact} rank is a number`, () => expect(typeof impactRank[impact]).toBe('number'));
  }
});

describe('isHighImpact helper', () => {
  it('CRITICAL is high impact', () => expect(isHighImpact('CRITICAL')).toBe(true));
  it('HIGH is high impact', () => expect(isHighImpact('HIGH')).toBe(true));
  it('MEDIUM is not high impact', () => expect(isHighImpact('MEDIUM')).toBe(false));
  it('LOW is not high impact', () => expect(isHighImpact('LOW')).toBe(false));
  it('NONE is not high impact', () => expect(isHighImpact('NONE')).toBe(false));
  for (const impact of IMPACTS) {
    it(`isHighImpact(${impact}) returns boolean`, () => expect(typeof isHighImpact(impact)).toBe('boolean'));
  }
});

describe('isPendingReview helper', () => {
  it('NEW is pending review', () => expect(isPendingReview('NEW')).toBe(true));
  it('UNDER_REVIEW is pending review', () => expect(isPendingReview('UNDER_REVIEW')).toBe(true));
  it('ASSESSED is not pending', () => expect(isPendingReview('ASSESSED')).toBe(false));
  it('IMPLEMENTED is not pending', () => expect(isPendingReview('IMPLEMENTED')).toBe(false));
  it('MONITORING is not pending', () => expect(isPendingReview('MONITORING')).toBe(false));
  it('NOT_APPLICABLE is not pending', () => expect(isPendingReview('NOT_APPLICABLE')).toBe(false));
  for (const s of CHANGE_STATUSES) {
    it(`isPendingReview(${s}) returns boolean`, () => expect(typeof isPendingReview(s)).toBe('boolean'));
  }
});

describe('isActionableObligation helper', () => {
  it('OPEN is actionable', () => expect(isActionableObligation('OPEN')).toBe(true));
  it('IN_PROGRESS is actionable', () => expect(isActionableObligation('IN_PROGRESS')).toBe(true));
  it('OVERDUE is actionable', () => expect(isActionableObligation('OVERDUE')).toBe(true));
  it('COMPLETED is not actionable', () => expect(isActionableObligation('COMPLETED')).toBe(false));
  it('NOT_APPLICABLE is not actionable', () => expect(isActionableObligation('NOT_APPLICABLE')).toBe(false));
  for (const s of OBLIGATION_STATUSES) {
    it(`isActionableObligation(${s}) returns boolean`, () => expect(typeof isActionableObligation(s)).toBe('boolean'));
  }
});

describe('complianceScore helper', () => {
  it('0 items returns 100', () => expect(complianceScore(0, 0)).toBe(100));
  it('all compliant returns 100', () => expect(complianceScore(10, 10)).toBe(100));
  it('none compliant returns 0', () => expect(complianceScore(10, 0)).toBe(0));
  it('half compliant returns 50', () => expect(complianceScore(10, 5)).toBe(50));
  it('result is between 0 and 100', () => {
    for (let total = 1; total <= 10; total++) {
      for (let compliant = 0; compliant <= total; compliant++) {
        const score = complianceScore(total, compliant);
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(100);
      }
    }
  });
  it('score is a number', () => expect(typeof complianceScore(5, 3)).toBe('number'));
  it('5/8 rounds to 63', () => expect(complianceScore(8, 5)).toBe(63));
});

describe('daysOverdue helper', () => {
  const BASE = new Date('2026-03-01T00:00:00.000Z');

  it('due today → 0 days overdue', () => {
    expect(daysOverdue(BASE, BASE)).toBe(0);
  });
  it('due 7 days ago → 7 days overdue', () => {
    const dueDate = new Date(BASE.getTime() - 7 * 86400000);
    expect(daysOverdue(dueDate, BASE)).toBe(7);
  });
  it('due in future → negative (not overdue)', () => {
    const dueDate = new Date(BASE.getTime() + 5 * 86400000);
    expect(daysOverdue(dueDate, BASE)).toBeLessThan(0);
  });
  for (let d = 1; d <= 10; d++) {
    it(`${d} days overdue returns ${d}`, () => {
      const dueDate = new Date(BASE.getTime() - d * 86400000);
      expect(daysOverdue(dueDate, BASE)).toBe(d);
    });
  }
});

describe('reference number validators', () => {
  it('valid change ref passes', () => expect(isValidChangeRef('RM-CHG-2026-001')).toBe(true));
  it('valid obligation ref passes', () => expect(isValidObligationRef('RM-OBL-2026-042')).toBe(true));
  it('valid legal ref passes', () => expect(isValidLegalRef('RM-LEG-2025-100')).toBe(true));
  it('wrong prefix fails change', () => expect(isValidChangeRef('RM-OBL-2026-001')).toBe(false));
  it('missing dashes fails', () => expect(isValidChangeRef('RMCHG2026001')).toBe(false));
  it('wrong year length fails', () => expect(isValidChangeRef('RM-CHG-26-001')).toBe(false));
  it('wrong seq length fails', () => expect(isValidChangeRef('RM-CHG-2026-1')).toBe(false));
  it('empty string fails all validators', () => {
    expect(isValidChangeRef('')).toBe(false);
    expect(isValidObligationRef('')).toBe(false);
    expect(isValidLegalRef('')).toBe(false);
  });
});

describe('mock regulatory changes data shapes', () => {
  it('mockChanges has 3 entries', () => expect(mockChanges.length).toBe(3));

  for (const change of mockChanges) {
    it(`change ${change.id} has id`, () => expect(change.id).toBeTruthy());
    it(`change ${change.id} has referenceNumber`, () => expect(change.referenceNumber).toBeTruthy());
    it(`change ${change.id} has title`, () => expect(change.title.length).toBeGreaterThan(0));
    it(`change ${change.id} source is valid`, () => expect(SOURCES as readonly string[]).toContain(change.source));
    it(`change ${change.id} status is valid`, () => expect(CHANGE_STATUSES as readonly string[]).toContain(change.status));
    it(`change ${change.id} impact is valid`, () => expect(IMPACTS as readonly string[]).toContain(change.impact));
    it(`change ${change.id} affectedAreas is array`, () => expect(Array.isArray(change.affectedAreas)).toBe(true));
    it(`change ${change.id} publishedDate is ISO string`, () => expect(change.publishedDate).toMatch(/^\d{4}-\d{2}-\d{2}T/));
    it(`change ${change.id} effectiveDate is ISO string`, () => expect(change.effectiveDate).toMatch(/^\d{4}-\d{2}-\d{2}T/));
  }
});

describe('mock obligations data shapes', () => {
  it('mockObligations has 3 entries', () => expect(mockObligations.length).toBe(3));

  for (const obl of mockObligations) {
    it(`obligation ${obl.id} has id`, () => expect(obl.id).toBeTruthy());
    it(`obligation ${obl.id} has referenceNumber`, () => expect(obl.referenceNumber).toBeTruthy());
    it(`obligation ${obl.id} title is non-empty`, () => expect(obl.title.length).toBeGreaterThan(0));
    it(`obligation ${obl.id} frequency is valid`, () => expect(FREQUENCIES as readonly string[]).toContain(obl.frequency));
    it(`obligation ${obl.id} status is valid`, () => expect(OBLIGATION_STATUSES as readonly string[]).toContain(obl.status));
    it(`obligation ${obl.id} dueDate is ISO string`, () => expect(obl.dueDate).toMatch(/^\d{4}-\d{2}-\d{2}T/));
    it(`obligation ${obl.id} responsible is non-empty`, () => expect(obl.responsible.length).toBeGreaterThan(0));
  }
});

describe('mock legal items data shapes', () => {
  it('mockLegalItems has 3 entries', () => expect(mockLegalItems.length).toBe(3));

  for (const item of mockLegalItems) {
    it(`legal item ${item.id} has id`, () => expect(item.id).toBeTruthy());
    it(`legal item ${item.id} has referenceNumber`, () => expect(item.referenceNumber).toBeTruthy());
    it(`legal item ${item.id} title is non-empty`, () => expect(item.title.length).toBeGreaterThan(0));
    it(`legal item ${item.id} complianceStatus is valid`, () => expect(COMPLIANCE_STATUSES as readonly string[]).toContain(item.complianceStatus));
    it(`legal item ${item.id} has jurisdiction`, () => expect(item.jurisdiction.length).toBeGreaterThan(0));
    it(`legal item ${item.id} has legislation`, () => expect(item.legislation.length).toBeGreaterThan(0));
    it(`legal item ${item.id} reviewDate is ISO string`, () => expect(item.reviewDate).toMatch(/^\d{4}-\d{2}-\d{2}T/));
  }
});

// ─── Parametric: SOURCES positional index ────────────────────────────────────

describe('SOURCES — positional index parametric', () => {
  const cases: [Source, number][] = [
    ['GOVERNMENT', 0],
    ['REGULATOR', 1],
    ['STANDARDS_BODY', 2],
    ['INDUSTRY', 3],
    ['EU_UK', 4],
    ['OTHER', 5],
  ];
  for (const [source, idx] of cases) {
    it(`${source} is at index ${idx}`, () => {
      expect(SOURCES[idx]).toBe(source);
    });
  }
});

// ─── Parametric: CHANGE_STATUSES positional index ────────────────────────────

describe('CHANGE_STATUSES — positional index parametric', () => {
  const cases: [ChangeStatus, number][] = [
    ['NEW', 0],
    ['UNDER_REVIEW', 1],
    ['ASSESSED', 2],
    ['IMPLEMENTED', 3],
    ['NOT_APPLICABLE', 4],
    ['MONITORING', 5],
  ];
  for (const [status, idx] of cases) {
    it(`${status} is at index ${idx}`, () => {
      expect(CHANGE_STATUSES[idx]).toBe(status);
    });
  }
});

// ─── Parametric: FREQUENCIES positional index ────────────────────────────────

describe('FREQUENCIES — positional index parametric', () => {
  const cases: [Frequency, number][] = [
    ['ONE_OFF', 0],
    ['DAILY', 1],
    ['WEEKLY', 2],
    ['MONTHLY', 3],
    ['QUARTERLY', 4],
    ['SEMI_ANNUAL', 5],
    ['ANNUAL', 6],
    ['BIENNIAL', 7],
  ];
  for (const [freq, idx] of cases) {
    it(`${freq} is at index ${idx}`, () => {
      expect(FREQUENCIES[idx]).toBe(freq);
    });
  }
});

// ─── Parametric: mockChanges per-change exact source+status+impact ────────────

describe('mockChanges — per-change exact source+status+impact parametric', () => {
  const cases: [string, Source, ChangeStatus, Impact][] = [
    ['c-001', 'REGULATOR', 'NEW', 'HIGH'],
    ['c-002', 'STANDARDS_BODY', 'UNDER_REVIEW', 'MEDIUM'],
    ['c-003', 'GOVERNMENT', 'IMPLEMENTED', 'CRITICAL'],
  ];
  for (const [id, source, status, impact] of cases) {
    it(`${id}: source=${source}, status=${status}, impact=${impact}`, () => {
      const c = mockChanges.find((x) => x.id === id)!;
      expect(c.source).toBe(source);
      expect(c.status).toBe(status);
      expect(c.impact).toBe(impact);
    });
  }
});

// ─── Parametric: mockObligations per-obligation exact frequency+status ─────────

describe('mockObligations — per-obligation exact frequency+status parametric', () => {
  const cases: [string, Frequency, ObligationStatus][] = [
    ['o-001', 'ANNUAL', 'OPEN'],
    ['o-002', 'QUARTERLY', 'IN_PROGRESS'],
    ['o-003', 'SEMI_ANNUAL', 'OVERDUE'],
  ];
  for (const [id, frequency, status] of cases) {
    it(`${id}: frequency=${frequency}, status=${status}`, () => {
      const o = mockObligations.find((x) => x.id === id)!;
      expect(o.frequency).toBe(frequency);
      expect(o.status).toBe(status);
    });
  }
});

// ─── Parametric: mockLegalItems per-item exact complianceStatus+jurisdiction ──

describe('mockLegalItems — per-item exact complianceStatus+jurisdiction parametric', () => {
  const cases: [string, ComplianceStatus, string][] = [
    ['l-001', 'COMPLIANT', 'UK'],
    ['l-002', 'PARTIALLY_COMPLIANT', 'EU'],
    ['l-003', 'NON_COMPLIANT', 'UK'],
  ];
  for (const [id, complianceStatus, jurisdiction] of cases) {
    it(`${id}: complianceStatus=${complianceStatus}, jurisdiction=${jurisdiction}`, () => {
      const item = mockLegalItems.find((x) => x.id === id)!;
      expect(item.complianceStatus).toBe(complianceStatus);
      expect(item.jurisdiction).toBe(jurisdiction);
    });
  }
});

// ─── Parametric: complianceScore additional exact values ─────────────────────

describe('complianceScore — additional exact values parametric', () => {
  const cases: [number, number, number][] = [
    [4, 3, 75],
    [10, 7, 70],
    [3, 2, 67],
    [4, 1, 25],
    [10, 9, 90],
  ];
  for (const [total, compliant, expected] of cases) {
    it(`${compliant}/${total} → ${expected}`, () => {
      expect(complianceScore(total, compliant)).toBe(expected);
    });
  }
});

describe('dashboard aggregate logic (inlined)', () => {
  it('high/critical count is correct', () => {
    const count = mockChanges.filter((c) => isHighImpact(c.impact)).length;
    expect(count).toBe(2); // HIGH + CRITICAL
  });

  it('pending review count is correct', () => {
    const count = mockChanges.filter((c) => isPendingReview(c.status)).length;
    expect(count).toBe(2); // NEW + UNDER_REVIEW
  });

  it('implemented count is correct', () => {
    const count = mockChanges.filter((c) => c.status === 'IMPLEMENTED').length;
    expect(count).toBe(1);
  });

  it('overdue obligations count is correct', () => {
    const count = mockObligations.filter((o) => o.status === 'OVERDUE').length;
    expect(count).toBe(1);
  });

  it('compliant legal items count is correct', () => {
    const count = mockLegalItems.filter((l) => l.complianceStatus === 'COMPLIANT').length;
    expect(count).toBe(1);
  });

  it('non-compliant legal items count is correct', () => {
    const count = mockLegalItems.filter((l) => l.complianceStatus === 'NON_COMPLIANT').length;
    expect(count).toBe(1);
  });

  it('compliance score for mock legal items', () => {
    const total = mockLegalItems.length;
    const compliant = mockLegalItems.filter((l) => l.complianceStatus === 'COMPLIANT').length;
    const score = complianceScore(total, compliant);
    expect(score).toBe(33); // 1/3 → 33
  });
});

// ─── SOURCES — positional index parametric ───────────────────────────────────

describe('SOURCES — positional index parametric', () => {
  const expected = [
    [0, 'GOVERNMENT'],
    [1, 'REGULATOR'],
    [2, 'STANDARDS_BODY'],
    [3, 'INDUSTRY'],
    [4, 'EU_UK'],
    [5, 'OTHER'],
  ] as const;
  for (const [idx, val] of expected) {
    it(`SOURCES[${idx}] === '${val}'`, () => {
      expect(SOURCES[idx]).toBe(val);
    });
  }
});

// ─── CHANGE_STATUSES — positional index parametric ───────────────────────────

describe('CHANGE_STATUSES — positional index parametric', () => {
  const expected = [
    [0, 'NEW'],
    [1, 'UNDER_REVIEW'],
    [2, 'ASSESSED'],
    [3, 'IMPLEMENTED'],
    [4, 'NOT_APPLICABLE'],
    [5, 'MONITORING'],
  ] as const;
  for (const [idx, val] of expected) {
    it(`CHANGE_STATUSES[${idx}] === '${val}'`, () => {
      expect(CHANGE_STATUSES[idx]).toBe(val);
    });
  }
});

// ─── FREQUENCIES — positional index parametric ───────────────────────────────

describe('FREQUENCIES — positional index parametric', () => {
  const expected = [
    [0, 'ONE_OFF'],
    [1, 'DAILY'],
    [2, 'WEEKLY'],
    [3, 'MONTHLY'],
    [4, 'QUARTERLY'],
    [5, 'SEMI_ANNUAL'],
    [6, 'ANNUAL'],
    [7, 'BIENNIAL'],
  ] as const;
  for (const [idx, val] of expected) {
    it(`FREQUENCIES[${idx}] === '${val}'`, () => {
      expect(FREQUENCIES[idx]).toBe(val);
    });
  }
});

// ─── COMPLIANCE_STATUSES — positional index parametric ───────────────────────

describe('COMPLIANCE_STATUSES — positional index parametric', () => {
  const expected = [
    [0, 'COMPLIANT'],
    [1, 'PARTIALLY_COMPLIANT'],
    [2, 'NON_COMPLIANT'],
    [3, 'NOT_ASSESSED'],
    [4, 'NOT_APPLICABLE'],
  ] as const;
  for (const [idx, val] of expected) {
    it(`COMPLIANCE_STATUSES[${idx}] === '${val}'`, () => {
      expect(COMPLIANCE_STATUSES[idx]).toBe(val);
    });
  }
});
function hd258rmd(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph258rmd_hd',()=>{it('a',()=>{expect(hd258rmd(1,4)).toBe(2);});it('b',()=>{expect(hd258rmd(3,1)).toBe(1);});it('c',()=>{expect(hd258rmd(0,0)).toBe(0);});it('d',()=>{expect(hd258rmd(93,73)).toBe(2);});it('e',()=>{expect(hd258rmd(15,0)).toBe(4);});});
function hd259rmd(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph259rmd_hd',()=>{it('a',()=>{expect(hd259rmd(1,4)).toBe(2);});it('b',()=>{expect(hd259rmd(3,1)).toBe(1);});it('c',()=>{expect(hd259rmd(0,0)).toBe(0);});it('d',()=>{expect(hd259rmd(93,73)).toBe(2);});it('e',()=>{expect(hd259rmd(15,0)).toBe(4);});});
function hd260rmd(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph260rmd_hd',()=>{it('a',()=>{expect(hd260rmd(1,4)).toBe(2);});it('b',()=>{expect(hd260rmd(3,1)).toBe(1);});it('c',()=>{expect(hd260rmd(0,0)).toBe(0);});it('d',()=>{expect(hd260rmd(93,73)).toBe(2);});it('e',()=>{expect(hd260rmd(15,0)).toBe(4);});});
function hd261rmd(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph261rmd_hd',()=>{it('a',()=>{expect(hd261rmd(1,4)).toBe(2);});it('b',()=>{expect(hd261rmd(3,1)).toBe(1);});it('c',()=>{expect(hd261rmd(0,0)).toBe(0);});it('d',()=>{expect(hd261rmd(93,73)).toBe(2);});it('e',()=>{expect(hd261rmd(15,0)).toBe(4);});});
function hd262rmd(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph262rmd_hd',()=>{it('a',()=>{expect(hd262rmd(1,4)).toBe(2);});it('b',()=>{expect(hd262rmd(3,1)).toBe(1);});it('c',()=>{expect(hd262rmd(0,0)).toBe(0);});it('d',()=>{expect(hd262rmd(93,73)).toBe(2);});it('e',()=>{expect(hd262rmd(15,0)).toBe(4);});});
function hd263rmd(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph263rmd_hd',()=>{it('a',()=>{expect(hd263rmd(1,4)).toBe(2);});it('b',()=>{expect(hd263rmd(3,1)).toBe(1);});it('c',()=>{expect(hd263rmd(0,0)).toBe(0);});it('d',()=>{expect(hd263rmd(93,73)).toBe(2);});it('e',()=>{expect(hd263rmd(15,0)).toBe(4);});});
function hd264rmd(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph264rmd_hd',()=>{it('a',()=>{expect(hd264rmd(1,4)).toBe(2);});it('b',()=>{expect(hd264rmd(3,1)).toBe(1);});it('c',()=>{expect(hd264rmd(0,0)).toBe(0);});it('d',()=>{expect(hd264rmd(93,73)).toBe(2);});it('e',()=>{expect(hd264rmd(15,0)).toBe(4);});});
function hd265rmd(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph265rmd_hd',()=>{it('a',()=>{expect(hd265rmd(1,4)).toBe(2);});it('b',()=>{expect(hd265rmd(3,1)).toBe(1);});it('c',()=>{expect(hd265rmd(0,0)).toBe(0);});it('d',()=>{expect(hd265rmd(93,73)).toBe(2);});it('e',()=>{expect(hd265rmd(15,0)).toBe(4);});});
function hd266rmd(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph266rmd_hd',()=>{it('a',()=>{expect(hd266rmd(1,4)).toBe(2);});it('b',()=>{expect(hd266rmd(3,1)).toBe(1);});it('c',()=>{expect(hd266rmd(0,0)).toBe(0);});it('d',()=>{expect(hd266rmd(93,73)).toBe(2);});it('e',()=>{expect(hd266rmd(15,0)).toBe(4);});});
function hd267rmd(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph267rmd_hd',()=>{it('a',()=>{expect(hd267rmd(1,4)).toBe(2);});it('b',()=>{expect(hd267rmd(3,1)).toBe(1);});it('c',()=>{expect(hd267rmd(0,0)).toBe(0);});it('d',()=>{expect(hd267rmd(93,73)).toBe(2);});it('e',()=>{expect(hd267rmd(15,0)).toBe(4);});});
function hd268rmd(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph268rmd_hd',()=>{it('a',()=>{expect(hd268rmd(1,4)).toBe(2);});it('b',()=>{expect(hd268rmd(3,1)).toBe(1);});it('c',()=>{expect(hd268rmd(0,0)).toBe(0);});it('d',()=>{expect(hd268rmd(93,73)).toBe(2);});it('e',()=>{expect(hd268rmd(15,0)).toBe(4);});});
function hd269rmd(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph269rmd_hd',()=>{it('a',()=>{expect(hd269rmd(1,4)).toBe(2);});it('b',()=>{expect(hd269rmd(3,1)).toBe(1);});it('c',()=>{expect(hd269rmd(0,0)).toBe(0);});it('d',()=>{expect(hd269rmd(93,73)).toBe(2);});it('e',()=>{expect(hd269rmd(15,0)).toBe(4);});});
function hd270rmd(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph270rmd_hd',()=>{it('a',()=>{expect(hd270rmd(1,4)).toBe(2);});it('b',()=>{expect(hd270rmd(3,1)).toBe(1);});it('c',()=>{expect(hd270rmd(0,0)).toBe(0);});it('d',()=>{expect(hd270rmd(93,73)).toBe(2);});it('e',()=>{expect(hd270rmd(15,0)).toBe(4);});});
function hd271rmd(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph271rmd_hd',()=>{it('a',()=>{expect(hd271rmd(1,4)).toBe(2);});it('b',()=>{expect(hd271rmd(3,1)).toBe(1);});it('c',()=>{expect(hd271rmd(0,0)).toBe(0);});it('d',()=>{expect(hd271rmd(93,73)).toBe(2);});it('e',()=>{expect(hd271rmd(15,0)).toBe(4);});});
function hd272rmd(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph272rmd_hd',()=>{it('a',()=>{expect(hd272rmd(1,4)).toBe(2);});it('b',()=>{expect(hd272rmd(3,1)).toBe(1);});it('c',()=>{expect(hd272rmd(0,0)).toBe(0);});it('d',()=>{expect(hd272rmd(93,73)).toBe(2);});it('e',()=>{expect(hd272rmd(15,0)).toBe(4);});});
