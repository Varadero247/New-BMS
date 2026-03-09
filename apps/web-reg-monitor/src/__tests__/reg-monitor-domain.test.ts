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
