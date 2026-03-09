// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

// Domain spec tests for web-finance-compliance — pure logic, no React imports.
// Covers: control statuses/types/risk areas, SoD roles/conflict types, IR35 determinations,
// HMRC deadline types/statuses, badge/color maps, mock data shapes, and pure helpers.

// ─── Control domain ───────────────────────────────────────────────────────────

const CONTROL_STATUSES = ['ACTIVE', 'INACTIVE', 'UNDER_REVIEW', 'REMEDIATION'] as const;
type ControlStatus = typeof CONTROL_STATUSES[number];

const CONTROL_TYPES = ['Preventive', 'Detective', 'Corrective', 'Directive', 'Compensating'] as const;
type ControlType = typeof CONTROL_TYPES[number];

const RISK_AREAS = [
  'Financial Reporting',
  'Tax Compliance',
  'Anti-Money Laundering',
  'Fraud Prevention',
  'Data Protection',
  'Regulatory',
  'Operational',
] as const;

const statusColors: Record<ControlStatus, string> = {
  ACTIVE:       'bg-emerald-100 text-emerald-800',
  INACTIVE:     'bg-gray-100 text-gray-800',
  UNDER_REVIEW: 'bg-amber-100 text-amber-800',
  REMEDIATION:  'bg-red-100 text-red-800',
};

// ─── SoD domain ───────────────────────────────────────────────────────────────

const CONFLICT_TYPES = [
  'Authorization',
  'Custody',
  'Reconciliation',
  'Recording',
  'Approval',
  'Execution',
] as const;

const ROLE_OPTIONS = [
  'Accounts Payable Clerk',
  'Accounts Receivable Clerk',
  'Bank Reconciliation',
  'Budget Approver',
  'Cash Handler',
  'CFO',
  'Controller',
  'Credit Manager',
  'Financial Analyst',
  'General Ledger',
  'Internal Auditor',
  'Inventory Manager',
  'IT Administrator',
  'Journal Entry Creator',
  'Payroll Administrator',
  'Procurement Officer',
  'Purchase Order Approver',
  'Tax Analyst',
  'Treasury Manager',
  'Vendor Master Editor',
] as const;

// ─── IR35 domain ──────────────────────────────────────────────────────────────

const IR35_DETERMINATIONS = ['PENDING', 'INSIDE', 'OUTSIDE', 'UNKNOWN'] as const;
type Ir35Determination = typeof IR35_DETERMINATIONS[number];

const determinationColors: Record<Ir35Determination, string> = {
  PENDING: 'bg-amber-100 text-amber-800',
  INSIDE:  'bg-red-100 text-red-800',
  OUTSIDE: 'bg-emerald-100 text-emerald-800',
  UNKNOWN: 'bg-gray-100 text-gray-800',
};

// ─── HMRC Calendar domain ─────────────────────────────────────────────────────

const DEADLINE_TYPES = [
  'Corporation Tax',
  'VAT Return',
  'PAYE',
  'Self Assessment',
  'CIS Return',
  'P11D',
  'Annual Accounts',
  'Confirmation Statement',
  'Other',
] as const;

const HMRC_STATUSES = ['PENDING', 'SUBMITTED', 'OVERDUE', 'EXTENSION_REQUESTED'] as const;
type HmrcStatus = typeof HMRC_STATUSES[number];

const hmrcStatusColors: Record<HmrcStatus, string> = {
  PENDING:            'bg-amber-100 text-amber-800',
  SUBMITTED:          'bg-emerald-100 text-emerald-800',
  OVERDUE:            'bg-red-100 text-red-800',
  EXTENSION_REQUESTED:'bg-blue-100 text-blue-800',
};

// ─── Pure helpers ─────────────────────────────────────────────────────────────

function getDeadlineUrgency(
  dueDate: Date,
  now: Date,
  status: string | undefined,
): 'submitted' | 'overdue' | 'urgent' | 'upcoming' | 'future' {
  if (status === 'SUBMITTED') return 'submitted';
  if (dueDate < now) return 'overdue';
  const daysUntil = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (daysUntil <= 7) return 'urgent';
  if (daysUntil <= 30) return 'upcoming';
  return 'future';
}

const urgencyBorderClass: Record<string, string> = {
  overdue:   'border-l-4 border-l-red-500',
  urgent:    'border-l-4 border-l-amber-500',
  upcoming:  'border-l-4 border-l-blue-500',
  future:    'border-l-4 border-l-gray-300',
  submitted: 'border-l-4 border-l-emerald-500',
};

function controlMatchesSearch(
  item: { title: string; referenceNumber?: string; riskArea?: string },
  search: string,
): boolean {
  const q = search.toLowerCase();
  return (
    item.title.toLowerCase().includes(q) ||
    (item.referenceNumber?.toLowerCase().includes(q) ?? false) ||
    (item.riskArea?.toLowerCase().includes(q) ?? false)
  );
}

function sodRoleConflict(role1: string, role2: string): boolean {
  return role1 !== role2 && role1.trim().length > 0 && role2.trim().length > 0;
}

function isControlOverdue(nextTestDate: string | undefined, now: Date): boolean {
  if (!nextTestDate) return false;
  return new Date(nextTestDate) < now;
}

function countByStatus(
  items: Array<{ status: string }>,
  status: string,
): number {
  return items.filter((i) => i.status === status).length;
}

function activeSodConflictCount(rules: Array<{ isActive: boolean }>): number {
  return rules.filter((r) => r.isActive !== false).length;
}

function ir35InsideRate(assessments: Array<{ determination: string }>): number {
  if (assessments.length === 0) return 0;
  const inside = assessments.filter((a) => a.determination === 'INSIDE').length;
  return inside / assessments.length;
}

function upcomingDeadlines(
  deadlines: Array<{ dueDate: string; status?: string }>,
  now: Date,
  days: number,
): number {
  const horizon = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  return deadlines.filter((d) => {
    const due = new Date(d.dueDate);
    return due >= now && due <= horizon && d.status !== 'SUBMITTED';
  }).length;
}

// ─── Mock data shapes ─────────────────────────────────────────────────────────

interface MockControl {
  id: string;
  referenceNumber: string;
  title: string;
  controlType: string;
  riskArea: string;
  status: ControlStatus;
  frequency: string;
  ownerName: string;
  nextTestDate?: string;
  createdAt: string;
}

interface MockSodRule {
  id: string;
  role1: string;
  role2: string;
  conflictType: string;
  description: string;
  mitigatingControl?: string;
  isActive: boolean;
  createdAt: string;
}

interface MockIr35Assessment {
  id: string;
  referenceNumber: string;
  contractorName: string;
  contractorEmail?: string;
  clientName?: string;
  determination: Ir35Determination;
  assessmentDate?: string;
  reviewDate?: string;
  notes?: string;
  createdAt: string;
}

interface MockHmrcDeadline {
  id: string;
  title: string;
  type?: string;
  dueDate: string;
  filingRef?: string;
  status?: HmrcStatus;
  submittedDate?: string;
  createdAt: string;
}

const MOCK_CONTROL: MockControl = {
  id: 'ctrl-001',
  referenceNumber: 'CTRL-2026-001',
  title: 'Revenue Recognition Review',
  controlType: 'Detective',
  riskArea: 'Financial Reporting',
  status: 'ACTIVE',
  frequency: 'Monthly',
  ownerName: 'Jane Smith',
  nextTestDate: '2026-04-01T00:00:00.000Z',
  createdAt: '2026-01-01T00:00:00.000Z',
};

const MOCK_SOD_RULE: MockSodRule = {
  id: 'sod-001',
  role1: 'Accounts Payable Clerk',
  role2: 'Purchase Order Approver',
  conflictType: 'Authorization',
  description: 'Clerk should not approve their own purchase orders',
  mitigatingControl: 'Manager approval required above £5,000',
  isActive: true,
  createdAt: '2026-01-01T00:00:00.000Z',
};

const MOCK_IR35: MockIr35Assessment = {
  id: 'ir35-001',
  referenceNumber: 'IR35-2026-001',
  contractorName: 'John Doe',
  contractorEmail: 'john.doe@example.com',
  clientName: 'Acme Plc',
  determination: 'OUTSIDE',
  assessmentDate: '2026-02-01T00:00:00.000Z',
  reviewDate: '2026-08-01T00:00:00.000Z',
  createdAt: '2026-01-15T00:00:00.000Z',
};

const MOCK_HMRC: MockHmrcDeadline = {
  id: 'hmrc-001',
  title: 'Q4 VAT Return',
  type: 'VAT Return',
  dueDate: '2026-05-07T00:00:00.000Z',
  filingRef: 'VAT-123456789',
  status: 'PENDING',
  createdAt: '2026-01-01T00:00:00.000Z',
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('CONTROL_STATUSES — array integrity', () => {
  it('has 4 statuses', () => {
    expect(CONTROL_STATUSES).toHaveLength(4);
  });
  it('contains ACTIVE', () => expect(CONTROL_STATUSES).toContain('ACTIVE'));
  it('contains INACTIVE', () => expect(CONTROL_STATUSES).toContain('INACTIVE'));
  it('contains UNDER_REVIEW', () => expect(CONTROL_STATUSES).toContain('UNDER_REVIEW'));
  it('contains REMEDIATION', () => expect(CONTROL_STATUSES).toContain('REMEDIATION'));
  it('no duplicates', () => {
    expect(new Set(CONTROL_STATUSES).size).toBe(CONTROL_STATUSES.length);
  });
  for (const s of CONTROL_STATUSES) {
    it(`${s} is uppercase string`, () => {
      expect(typeof s).toBe('string');
      expect(s).toBe(s.toUpperCase());
    });
  }
});

describe('CONTROL_TYPES — array integrity', () => {
  it('has 5 control types', () => {
    expect(CONTROL_TYPES).toHaveLength(5);
  });
  const expected = ['Preventive', 'Detective', 'Corrective', 'Directive', 'Compensating'] as const;
  for (const t of expected) {
    it(`includes ${t}`, () => expect(CONTROL_TYPES).toContain(t));
  }
  it('all types start with uppercase', () => {
    for (const t of CONTROL_TYPES) {
      expect(t[0]).toBe(t[0].toUpperCase());
    }
  });
  it('no duplicates', () => {
    expect(new Set(CONTROL_TYPES).size).toBe(CONTROL_TYPES.length);
  });
});

describe('RISK_AREAS — array integrity', () => {
  it('has 7 risk areas', () => {
    expect(RISK_AREAS).toHaveLength(7);
  });
  const expected = [
    'Financial Reporting',
    'Tax Compliance',
    'Anti-Money Laundering',
    'Fraud Prevention',
    'Data Protection',
    'Regulatory',
    'Operational',
  ] as const;
  for (const area of expected) {
    it(`includes "${area}"`, () => expect(RISK_AREAS).toContain(area));
  }
  it('no duplicates', () => {
    expect(new Set(RISK_AREAS).size).toBe(RISK_AREAS.length);
  });
});

describe('statusColors — badge map', () => {
  it('every CONTROL_STATUS has a color entry', () => {
    for (const s of CONTROL_STATUSES) {
      expect(statusColors[s]).toBeDefined();
    }
  });
  it('ACTIVE has emerald color', () => {
    expect(statusColors.ACTIVE).toContain('emerald');
  });
  it('INACTIVE has gray color', () => {
    expect(statusColors.INACTIVE).toContain('gray');
  });
  it('UNDER_REVIEW has amber color', () => {
    expect(statusColors.UNDER_REVIEW).toContain('amber');
  });
  it('REMEDIATION has red color', () => {
    expect(statusColors.REMEDIATION).toContain('red');
  });
  it('every color entry contains both bg- and text-', () => {
    for (const s of CONTROL_STATUSES) {
      expect(statusColors[s]).toMatch(/bg-/);
      expect(statusColors[s]).toMatch(/text-/);
    }
  });
  it('all color values are non-empty strings', () => {
    for (const s of CONTROL_STATUSES) {
      expect(typeof statusColors[s]).toBe('string');
      expect(statusColors[s].length).toBeGreaterThan(0);
    }
  });
});

describe('CONFLICT_TYPES (SoD) — array integrity', () => {
  it('has 6 conflict types', () => {
    expect(CONFLICT_TYPES).toHaveLength(6);
  });
  const expected = ['Authorization', 'Custody', 'Reconciliation', 'Recording', 'Approval', 'Execution'] as const;
  for (const t of expected) {
    it(`includes ${t}`, () => expect(CONFLICT_TYPES).toContain(t));
  }
  it('no duplicates', () => {
    expect(new Set(CONFLICT_TYPES).size).toBe(CONFLICT_TYPES.length);
  });
  it('all start with uppercase', () => {
    for (const t of CONFLICT_TYPES) {
      expect(t[0]).toBe(t[0].toUpperCase());
    }
  });
});

describe('ROLE_OPTIONS (SoD) — array integrity', () => {
  it('has 20 role options', () => {
    expect(ROLE_OPTIONS).toHaveLength(20);
  });
  it('includes CFO', () => expect(ROLE_OPTIONS).toContain('CFO'));
  it('includes Controller', () => expect(ROLE_OPTIONS).toContain('Controller'));
  it('includes Internal Auditor', () => expect(ROLE_OPTIONS).toContain('Internal Auditor'));
  it('includes Treasury Manager', () => expect(ROLE_OPTIONS).toContain('Treasury Manager'));
  it('includes Payroll Administrator', () => expect(ROLE_OPTIONS).toContain('Payroll Administrator'));
  it('no duplicates', () => {
    expect(new Set(ROLE_OPTIONS).size).toBe(ROLE_OPTIONS.length);
  });
  it('all roles are non-empty strings', () => {
    for (const r of ROLE_OPTIONS) {
      expect(typeof r).toBe('string');
      expect(r.length).toBeGreaterThan(0);
    }
  });
});

describe('IR35_DETERMINATIONS — array integrity', () => {
  it('has 4 determinations', () => {
    expect(IR35_DETERMINATIONS).toHaveLength(4);
  });
  it('contains PENDING', () => expect(IR35_DETERMINATIONS).toContain('PENDING'));
  it('contains INSIDE', () => expect(IR35_DETERMINATIONS).toContain('INSIDE'));
  it('contains OUTSIDE', () => expect(IR35_DETERMINATIONS).toContain('OUTSIDE'));
  it('contains UNKNOWN', () => expect(IR35_DETERMINATIONS).toContain('UNKNOWN'));
  it('all are uppercase strings', () => {
    for (const d of IR35_DETERMINATIONS) {
      expect(d).toBe(d.toUpperCase());
    }
  });
});

describe('determinationColors — badge map', () => {
  it('every determination has a color entry', () => {
    for (const d of IR35_DETERMINATIONS) {
      expect(determinationColors[d]).toBeDefined();
    }
  });
  it('PENDING is amber', () => expect(determinationColors.PENDING).toContain('amber'));
  it('INSIDE is red (within IR35 = higher tax risk)', () => expect(determinationColors.INSIDE).toContain('red'));
  it('OUTSIDE is emerald (outside IR35 = lower tax risk)', () => expect(determinationColors.OUTSIDE).toContain('emerald'));
  it('UNKNOWN is gray', () => expect(determinationColors.UNKNOWN).toContain('gray'));
  it('all entries contain bg- and text-', () => {
    for (const d of IR35_DETERMINATIONS) {
      expect(determinationColors[d]).toMatch(/bg-/);
      expect(determinationColors[d]).toMatch(/text-/);
    }
  });
});

describe('DEADLINE_TYPES (HMRC) — array integrity', () => {
  it('has 9 deadline types', () => {
    expect(DEADLINE_TYPES).toHaveLength(9);
  });
  it('includes Corporation Tax', () => expect(DEADLINE_TYPES).toContain('Corporation Tax'));
  it('includes VAT Return', () => expect(DEADLINE_TYPES).toContain('VAT Return'));
  it('includes PAYE', () => expect(DEADLINE_TYPES).toContain('PAYE'));
  it('includes Self Assessment', () => expect(DEADLINE_TYPES).toContain('Self Assessment'));
  it('includes P11D', () => expect(DEADLINE_TYPES).toContain('P11D'));
  it('includes Annual Accounts', () => expect(DEADLINE_TYPES).toContain('Annual Accounts'));
  it('includes Confirmation Statement', () => expect(DEADLINE_TYPES).toContain('Confirmation Statement'));
  it('includes Other', () => expect(DEADLINE_TYPES).toContain('Other'));
  it('no duplicates', () => {
    expect(new Set(DEADLINE_TYPES).size).toBe(DEADLINE_TYPES.length);
  });
});

describe('HMRC_STATUSES — array integrity', () => {
  it('has 4 statuses', () => {
    expect(HMRC_STATUSES).toHaveLength(4);
  });
  it('contains PENDING', () => expect(HMRC_STATUSES).toContain('PENDING'));
  it('contains SUBMITTED', () => expect(HMRC_STATUSES).toContain('SUBMITTED'));
  it('contains OVERDUE', () => expect(HMRC_STATUSES).toContain('OVERDUE'));
  it('contains EXTENSION_REQUESTED', () => expect(HMRC_STATUSES).toContain('EXTENSION_REQUESTED'));
});

describe('hmrcStatusColors — badge map', () => {
  it('PENDING is amber', () => expect(hmrcStatusColors.PENDING).toContain('amber'));
  it('SUBMITTED is emerald', () => expect(hmrcStatusColors.SUBMITTED).toContain('emerald'));
  it('OVERDUE is red', () => expect(hmrcStatusColors.OVERDUE).toContain('red'));
  it('EXTENSION_REQUESTED is blue', () => expect(hmrcStatusColors.EXTENSION_REQUESTED).toContain('blue'));
  it('every status has a color entry', () => {
    for (const s of HMRC_STATUSES) {
      expect(hmrcStatusColors[s]).toBeDefined();
    }
  });
});

describe('getDeadlineUrgency', () => {
  const now = new Date('2026-03-09T12:00:00Z');

  it('returns "submitted" when status is SUBMITTED regardless of date', () => {
    const past = new Date('2026-01-01T00:00:00Z');
    expect(getDeadlineUrgency(past, now, 'SUBMITTED')).toBe('submitted');
  });
  it('returns "submitted" for future date when status is SUBMITTED', () => {
    const future = new Date('2026-12-31T00:00:00Z');
    expect(getDeadlineUrgency(future, now, 'SUBMITTED')).toBe('submitted');
  });
  it('returns "overdue" when dueDate is before now', () => {
    const past = new Date('2026-02-01T00:00:00Z');
    expect(getDeadlineUrgency(past, now, undefined)).toBe('overdue');
  });
  it('returns "urgent" when 1 day away', () => {
    const tomorrow = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000);
    expect(getDeadlineUrgency(tomorrow, now, undefined)).toBe('urgent');
  });
  it('returns "urgent" when 7 days away', () => {
    const in7 = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    expect(getDeadlineUrgency(in7, now, undefined)).toBe('urgent');
  });
  it('returns "upcoming" when 8 days away', () => {
    const in8 = new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000);
    expect(getDeadlineUrgency(in8, now, undefined)).toBe('upcoming');
  });
  it('returns "upcoming" when 30 days away', () => {
    const in30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    expect(getDeadlineUrgency(in30, now, undefined)).toBe('upcoming');
  });
  it('returns "future" when 31 days away', () => {
    const in31 = new Date(now.getTime() + 31 * 24 * 60 * 60 * 1000);
    expect(getDeadlineUrgency(in31, now, undefined)).toBe('future');
  });
  it('returns "future" for 90 days away', () => {
    const in90 = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
    expect(getDeadlineUrgency(in90, now, undefined)).toBe('future');
  });
  it('PENDING status with past date → overdue (not submitted)', () => {
    const past = new Date('2026-01-01T00:00:00Z');
    expect(getDeadlineUrgency(past, now, 'PENDING')).toBe('overdue');
  });
  it('result is always one of the 5 urgency values', () => {
    const valid = new Set(['submitted', 'overdue', 'urgent', 'upcoming', 'future']);
    for (let dayOffset = -60; dayOffset <= 90; dayOffset += 5) {
      const d = new Date(now.getTime() + dayOffset * 24 * 60 * 60 * 1000);
      expect(valid.has(getDeadlineUrgency(d, now, undefined))).toBe(true);
    }
  });
});

describe('urgencyBorderClass — map', () => {
  const urgencies = ['overdue', 'urgent', 'upcoming', 'future', 'submitted'] as const;
  for (const u of urgencies) {
    it(`${u} has border-l-4 class`, () => {
      expect(urgencyBorderClass[u]).toContain('border-l-4');
    });
  }
  it('overdue is red', () => expect(urgencyBorderClass.overdue).toContain('red'));
  it('urgent is amber', () => expect(urgencyBorderClass.urgent).toContain('amber'));
  it('upcoming is blue', () => expect(urgencyBorderClass.upcoming).toContain('blue'));
  it('submitted is emerald', () => expect(urgencyBorderClass.submitted).toContain('emerald'));
});

describe('controlMatchesSearch', () => {
  const item = { title: 'Revenue Recognition Review', referenceNumber: 'CTRL-2026-001', riskArea: 'Financial Reporting' };

  it('matches on title substring', () => {
    expect(controlMatchesSearch(item, 'Revenue')).toBe(true);
  });
  it('case-insensitive title match', () => {
    expect(controlMatchesSearch(item, 'revenue')).toBe(true);
  });
  it('matches on referenceNumber', () => {
    expect(controlMatchesSearch(item, 'CTRL-2026')).toBe(true);
  });
  it('matches on riskArea', () => {
    expect(controlMatchesSearch(item, 'Financial')).toBe(true);
  });
  it('returns false when no field matches', () => {
    expect(controlMatchesSearch(item, 'XYZZY')).toBe(false);
  });
  it('empty search matches anything', () => {
    expect(controlMatchesSearch(item, '')).toBe(true);
  });
});

describe('sodRoleConflict', () => {
  it('two different roles produce a conflict', () => {
    expect(sodRoleConflict('Accounts Payable Clerk', 'Purchase Order Approver')).toBe(true);
  });
  it('same role does not produce a conflict', () => {
    expect(sodRoleConflict('CFO', 'CFO')).toBe(false);
  });
  it('empty role1 is not a valid conflict', () => {
    expect(sodRoleConflict('', 'Controller')).toBe(false);
  });
  it('empty role2 is not a valid conflict', () => {
    expect(sodRoleConflict('Controller', '')).toBe(false);
  });
});

describe('isControlOverdue', () => {
  const now = new Date('2026-03-09T12:00:00Z');

  it('returns false when no nextTestDate', () => {
    expect(isControlOverdue(undefined, now)).toBe(false);
  });
  it('returns true when nextTestDate is in the past', () => {
    expect(isControlOverdue('2026-01-01T00:00:00Z', now)).toBe(true);
  });
  it('returns false when nextTestDate is in the future', () => {
    expect(isControlOverdue('2026-12-31T00:00:00Z', now)).toBe(false);
  });
});

describe('countByStatus', () => {
  const controls = [
    { status: 'ACTIVE' }, { status: 'ACTIVE' }, { status: 'INACTIVE' },
    { status: 'UNDER_REVIEW' }, { status: 'REMEDIATION' }, { status: 'ACTIVE' },
  ];

  it('counts ACTIVE correctly', () => {
    expect(countByStatus(controls, 'ACTIVE')).toBe(3);
  });
  it('counts INACTIVE correctly', () => {
    expect(countByStatus(controls, 'INACTIVE')).toBe(1);
  });
  it('counts UNDER_REVIEW correctly', () => {
    expect(countByStatus(controls, 'UNDER_REVIEW')).toBe(1);
  });
  it('counts REMEDIATION correctly', () => {
    expect(countByStatus(controls, 'REMEDIATION')).toBe(1);
  });
  it('returns 0 for a status not in the list', () => {
    expect(countByStatus(controls, 'ARCHIVED')).toBe(0);
  });
  it('total of all statuses equals controls.length', () => {
    const total = CONTROL_STATUSES.reduce((sum, s) => sum + countByStatus(controls, s), 0);
    expect(total).toBe(controls.length);
  });
});

describe('activeSodConflictCount', () => {
  it('counts only active rules', () => {
    const rules = [
      { isActive: true }, { isActive: true }, { isActive: false }, { isActive: true },
    ];
    expect(activeSodConflictCount(rules)).toBe(3);
  });
  it('returns 0 when all rules inactive', () => {
    const rules = [{ isActive: false }, { isActive: false }];
    expect(activeSodConflictCount(rules)).toBe(0);
  });
  it('returns 0 for empty list', () => {
    expect(activeSodConflictCount([])).toBe(0);
  });
});

describe('ir35InsideRate', () => {
  it('returns 0 for empty assessments', () => {
    expect(ir35InsideRate([])).toBe(0);
  });
  it('returns 1.0 when all are INSIDE', () => {
    const all = [{ determination: 'INSIDE' }, { determination: 'INSIDE' }];
    expect(ir35InsideRate(all)).toBe(1);
  });
  it('returns 0 when none are INSIDE', () => {
    const none = [{ determination: 'OUTSIDE' }, { determination: 'PENDING' }];
    expect(ir35InsideRate(none)).toBe(0);
  });
  it('computes fractional rate correctly', () => {
    const mixed = [
      { determination: 'INSIDE' }, { determination: 'OUTSIDE' },
      { determination: 'INSIDE' }, { determination: 'PENDING' },
    ];
    expect(ir35InsideRate(mixed)).toBeCloseTo(0.5);
  });
  it('rate is always between 0 and 1', () => {
    const cases = [
      [], [{ determination: 'INSIDE' }], [{ determination: 'OUTSIDE' }],
      [{ determination: 'INSIDE' }, { determination: 'OUTSIDE' }],
    ];
    for (const c of cases) {
      const rate = ir35InsideRate(c);
      expect(rate).toBeGreaterThanOrEqual(0);
      expect(rate).toBeLessThanOrEqual(1);
    }
  });
});

describe('upcomingDeadlines', () => {
  const now = new Date('2026-03-09T12:00:00Z');
  const deadlines = [
    { dueDate: '2026-03-10T00:00:00Z', status: 'PENDING' as HmrcStatus },  // 1 day — upcoming in 30d
    { dueDate: '2026-03-20T00:00:00Z', status: 'PENDING' as HmrcStatus },  // 11 days
    { dueDate: '2026-04-08T00:00:00Z', status: 'PENDING' as HmrcStatus },  // 30 days
    { dueDate: '2026-04-09T00:00:00Z', status: 'PENDING' as HmrcStatus },  // 31 days — outside window
    { dueDate: '2026-03-20T00:00:00Z', status: 'SUBMITTED' as HmrcStatus }, // submitted — excluded
    { dueDate: '2026-01-01T00:00:00Z', status: 'PENDING' as HmrcStatus },  // overdue — excluded
  ];

  it('counts deadlines within 30 days (excl. submitted, excl. overdue)', () => {
    expect(upcomingDeadlines(deadlines, now, 30)).toBe(3);
  });
  it('returns 0 with empty list', () => {
    expect(upcomingDeadlines([], now, 30)).toBe(0);
  });
  it('submitted deadlines are not counted', () => {
    const submitted = [{ dueDate: '2026-03-15T00:00:00Z', status: 'SUBMITTED' as HmrcStatus }];
    expect(upcomingDeadlines(submitted, now, 30)).toBe(0);
  });
  it('overdue deadlines are not counted', () => {
    const overdue = [{ dueDate: '2026-01-01T00:00:00Z', status: 'PENDING' as HmrcStatus }];
    expect(upcomingDeadlines(overdue, now, 30)).toBe(0);
  });
});

describe('Mock data shapes', () => {
  it('MOCK_CONTROL has required fields', () => {
    expect(MOCK_CONTROL.id).toBeDefined();
    expect(MOCK_CONTROL.referenceNumber).toBeDefined();
    expect(MOCK_CONTROL.title).toBeDefined();
    expect(MOCK_CONTROL.status).toBeDefined();
    expect(MOCK_CONTROL.createdAt).toBeDefined();
  });
  it('MOCK_CONTROL status is a valid CONTROL_STATUS', () => {
    expect(CONTROL_STATUSES).toContain(MOCK_CONTROL.status);
  });
  it('MOCK_CONTROL controlType is a valid CONTROL_TYPE', () => {
    expect(CONTROL_TYPES).toContain(MOCK_CONTROL.controlType);
  });
  it('MOCK_CONTROL riskArea is a valid RISK_AREA', () => {
    expect(RISK_AREAS).toContain(MOCK_CONTROL.riskArea);
  });
  it('MOCK_SOD_RULE has required fields', () => {
    expect(MOCK_SOD_RULE.id).toBeDefined();
    expect(MOCK_SOD_RULE.role1).toBeDefined();
    expect(MOCK_SOD_RULE.role2).toBeDefined();
    expect(MOCK_SOD_RULE.conflictType).toBeDefined();
    expect(MOCK_SOD_RULE.isActive).toBeDefined();
  });
  it('MOCK_SOD_RULE roles are different', () => {
    expect(MOCK_SOD_RULE.role1).not.toBe(MOCK_SOD_RULE.role2);
  });
  it('MOCK_SOD_RULE conflictType is a valid CONFLICT_TYPE', () => {
    expect(CONFLICT_TYPES).toContain(MOCK_SOD_RULE.conflictType);
  });
  it('MOCK_IR35 has required fields', () => {
    expect(MOCK_IR35.id).toBeDefined();
    expect(MOCK_IR35.referenceNumber).toBeDefined();
    expect(MOCK_IR35.contractorName).toBeDefined();
    expect(MOCK_IR35.determination).toBeDefined();
  });
  it('MOCK_IR35 determination is valid', () => {
    expect(IR35_DETERMINATIONS).toContain(MOCK_IR35.determination);
  });
  it('MOCK_HMRC has required fields', () => {
    expect(MOCK_HMRC.id).toBeDefined();
    expect(MOCK_HMRC.title).toBeDefined();
    expect(MOCK_HMRC.dueDate).toBeDefined();
  });
  it('MOCK_HMRC type is a valid DEADLINE_TYPE', () => {
    expect(DEADLINE_TYPES).toContain(MOCK_HMRC.type);
  });
  it('MOCK_HMRC status is a valid HMRC_STATUS', () => {
    expect(HMRC_STATUSES).toContain(MOCK_HMRC.status);
  });
  it('MOCK_HMRC dueDate is a parseable ISO string', () => {
    expect(isNaN(new Date(MOCK_HMRC.dueDate).getTime())).toBe(false);
  });
  it('MOCK_CONTROL nextTestDate is parseable when present', () => {
    if (MOCK_CONTROL.nextTestDate) {
      expect(isNaN(new Date(MOCK_CONTROL.nextTestDate).getTime())).toBe(false);
    }
  });
});

describe('Cross-domain invariants', () => {
  it('HMRC_STATUSES includes PENDING (same as CONTROL_STATUSES default start)', () => {
    expect(HMRC_STATUSES).toContain('PENDING');
  });
  it('every IR35 determination has a color in determinationColors', () => {
    for (const d of IR35_DETERMINATIONS) {
      expect(determinationColors[d]).toBeDefined();
    }
  });
  it('every HMRC status has a color in hmrcStatusColors', () => {
    for (const s of HMRC_STATUSES) {
      expect(hmrcStatusColors[s]).toBeDefined();
    }
  });
  it('every CONTROL_STATUS has a color in statusColors', () => {
    for (const s of CONTROL_STATUSES) {
      expect(statusColors[s]).toBeDefined();
    }
  });
  it('urgencyBorderClass covers all 5 urgency levels', () => {
    const urgencies = ['overdue', 'urgent', 'upcoming', 'future', 'submitted'];
    for (const u of urgencies) {
      expect(urgencyBorderClass[u]).toBeDefined();
    }
  });
  it('SoD role validation: a role cannot conflict with itself', () => {
    for (const r of ROLE_OPTIONS) {
      expect(sodRoleConflict(r, r)).toBe(false);
    }
  });
  it('SoD role validation: all pairs of distinct roles are valid conflicts', () => {
    // spot-check 10 pairs
    const pairs: [string, string][] = [
      ['CFO', 'Internal Auditor'],
      ['Accounts Payable Clerk', 'Purchase Order Approver'],
      ['Payroll Administrator', 'Bank Reconciliation'],
      ['Journal Entry Creator', 'Controller'],
      ['Cash Handler', 'Procurement Officer'],
      ['Tax Analyst', 'Treasury Manager'],
      ['Budget Approver', 'Financial Analyst'],
      ['General Ledger', 'Vendor Master Editor'],
      ['Credit Manager', 'Inventory Manager'],
      ['IT Administrator', 'Accounts Receivable Clerk'],
    ];
    for (const [r1, r2] of pairs) {
      expect(sodRoleConflict(r1, r2)).toBe(true);
    }
  });
  it('countByStatus sums to 0 for empty list regardless of status', () => {
    for (const s of CONTROL_STATUSES) {
      expect(countByStatus([], s)).toBe(0);
    }
  });
});
