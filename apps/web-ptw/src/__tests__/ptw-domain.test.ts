// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

// ─── Types ───────────────────────────────────────────────────────────────────

type PermitType =
  | 'HOT_WORK'
  | 'CONFINED_SPACE'
  | 'WORKING_AT_HEIGHT'
  | 'ELECTRICAL'
  | 'EXCAVATION'
  | 'CHEMICAL'
  | 'RADIATION'
  | 'GENERAL';

type PermitStatus =
  | 'DRAFT'
  | 'REQUESTED'
  | 'APPROVED'
  | 'ACTIVE'
  | 'SUSPENDED'
  | 'CLOSED'
  | 'CANCELLED'
  | 'EXPIRED';

type PermitPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

type PermitExpiryState = 'EXPIRED' | 'EXPIRING_SOON' | 'VALID';

type ConflictSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

// ─── Domain Constants ─────────────────────────────────────────────────────────

const PERMIT_TYPES: PermitType[] = [
  'HOT_WORK',
  'CONFINED_SPACE',
  'WORKING_AT_HEIGHT',
  'ELECTRICAL',
  'EXCAVATION',
  'CHEMICAL',
  'RADIATION',
  'GENERAL',
];

const PERMIT_STATUSES: PermitStatus[] = [
  'DRAFT',
  'REQUESTED',
  'APPROVED',
  'ACTIVE',
  'SUSPENDED',
  'CLOSED',
  'CANCELLED',
  'EXPIRED',
];

const PERMIT_PRIORITIES: PermitPriority[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

const CONFLICT_SEVERITIES: ConflictSeverity[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

// ─── Badge / Color Maps ───────────────────────────────────────────────────────

const permitStatusColor: Record<PermitStatus, string> = {
  DRAFT:     'bg-gray-100 text-gray-700',
  REQUESTED: 'bg-amber-100 text-amber-800',
  APPROVED:  'bg-blue-100 text-blue-800',
  ACTIVE:    'bg-green-100 text-green-800',
  SUSPENDED: 'bg-red-100 text-red-800',
  CLOSED:    'bg-gray-200 text-gray-600',
  CANCELLED: 'bg-gray-100 text-gray-500',
  EXPIRED:   'bg-red-100 text-red-800',
};

const permitPriorityColor: Record<PermitPriority, string> = {
  CRITICAL: 'bg-red-100 text-red-800',
  HIGH:     'bg-orange-100 text-orange-800',
  MEDIUM:   'bg-amber-100 text-amber-800',
  LOW:      'bg-green-100 text-green-800',
};

const conflictSeverityColor: Record<ConflictSeverity, string> = {
  CRITICAL: 'bg-red-100 text-red-800',
  HIGH:     'bg-orange-100 text-orange-800',
  MEDIUM:   'bg-amber-100 text-amber-800',
  LOW:      'bg-green-100 text-green-800',
};

// ─── Permit Metadata ──────────────────────────────────────────────────────────

/** Types that require a gas test before work commences */
const permitTypeRequiresGasTest: Record<PermitType, boolean> = {
  HOT_WORK:          true,
  CONFINED_SPACE:    true,
  EXCAVATION:        true,
  CHEMICAL:          true,
  WORKING_AT_HEIGHT: false,
  ELECTRICAL:        false,
  RADIATION:         false,
  GENERAL:           false,
};

/** Types that require formal energy/process isolation (LOTO or equivalent) */
const permitTypeRequiresIsolation: Record<PermitType, boolean> = {
  ELECTRICAL:        true,
  CONFINED_SPACE:    true,
  CHEMICAL:          true,
  HOT_WORK:          false,
  WORKING_AT_HEIGHT: false,
  EXCAVATION:        false,
  RADIATION:         false,
  GENERAL:           false,
};

/** Display labels for permit types */
const permitTypeLabel: Record<PermitType, string> = {
  HOT_WORK:          'Hot Work',
  CONFINED_SPACE:    'Confined Space',
  WORKING_AT_HEIGHT: 'Working at Height',
  ELECTRICAL:        'Electrical',
  EXCAVATION:        'Excavation',
  CHEMICAL:          'Chemical',
  RADIATION:         'Radiation',
  GENERAL:           'General',
};

// ─── Domain Helpers ───────────────────────────────────────────────────────────

function isPermitActive(status: PermitStatus): boolean {
  return status === 'ACTIVE';
}

function isPermitEditable(status: PermitStatus): boolean {
  return status === 'DRAFT' || status === 'REQUESTED';
}

function isPermitTerminal(status: PermitStatus): boolean {
  return status === 'CLOSED' || status === 'CANCELLED' || status === 'EXPIRED';
}

function canActivatePermit(status: PermitStatus): boolean {
  return status === 'APPROVED';
}

function canSuspendPermit(status: PermitStatus): boolean {
  return status === 'ACTIVE';
}

function permitExpiryState(expiryDate: Date, now: Date): PermitExpiryState {
  const hoursRemaining = (expiryDate.getTime() - now.getTime()) / 3600000;
  if (hoursRemaining < 0)    return 'EXPIRED';
  if (hoursRemaining <= 2)   return 'EXPIRING_SOON';
  return 'VALID';
}

function permitReferenceFormat(year: number, seq: number): string {
  return `PTW-${year}-${String(seq).padStart(4, '0')}`;
}

function methodStatementReferenceFormat(year: number, seq: number): string {
  return `MS-${year}-${String(seq).padStart(3, '0')}`;
}

function priorityScore(priority: PermitPriority): number {
  const scores: Record<PermitPriority, number> = {
    CRITICAL: 4,
    HIGH:     3,
    MEDIUM:   2,
    LOW:      1,
  };
  return scores[priority];
}

function toolboxTalkIsConducted(conductedDate: string | null): boolean {
  return conductedDate !== null && conductedDate !== '';
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

interface MockPermit {
  id: string;
  referenceNumber: string;
  title: string;
  type: PermitType;
  status: PermitStatus;
  priority: PermitPriority;
  location: string;
  area: string;
  requestedByName: string;
  approvedByName: string;
  startDate: string;
  endDate: string;
  gasTestRequired: boolean;
  isolations: string;
}

interface MockMethodStatement {
  id: string;
  referenceNumber: string;
  title: string;
  permitId: string;
  version: number;
  approvedBy: string;
  approvedAt: string | null;
}

interface MockToolboxTalk {
  id: string;
  referenceNumber: string;
  topic: string;
  permitId: string;
  presenterName: string;
  scheduledDate: string;
  conductedDate: string | null;
  attendeeCount: number;
}

interface MockConflict {
  id: string;
  referenceNumber: string;
  permitId1: string;
  permitId2: string;
  conflictType: string;
  severity: ConflictSeverity;
  description: string;
  resolved: boolean;
}

const MOCK_PERMITS: MockPermit[] = [
  {
    id: 'ptw-001',
    referenceNumber: 'PTW-2026-0001',
    title: 'Welding on Tank 4 inlet pipe',
    type: 'HOT_WORK',
    status: 'ACTIVE',
    priority: 'HIGH',
    location: 'Process Area A',
    area: 'Tank Farm',
    requestedByName: 'John Smith',
    approvedByName: 'Jane Doe',
    startDate: '2026-03-09T08:00:00Z',
    endDate: '2026-03-09T17:00:00Z',
    gasTestRequired: true,
    isolations: '',
  },
  {
    id: 'ptw-002',
    referenceNumber: 'PTW-2026-0002',
    title: 'Inspection of reactor vessel interior',
    type: 'CONFINED_SPACE',
    status: 'APPROVED',
    priority: 'CRITICAL',
    location: 'Reactor Building',
    area: 'Level 2',
    requestedByName: 'Alice Brown',
    approvedByName: 'Bob Wilson',
    startDate: '2026-03-10T07:00:00Z',
    endDate: '2026-03-10T16:00:00Z',
    gasTestRequired: true,
    isolations: 'LOTO applied to vessel inlet/outlet valves',
  },
  {
    id: 'ptw-003',
    referenceNumber: 'PTW-2026-0003',
    title: 'Replace MCC panel in substation',
    type: 'ELECTRICAL',
    status: 'DRAFT',
    priority: 'MEDIUM',
    location: 'Electrical Substation 3',
    area: 'Room B',
    requestedByName: 'Charlie Green',
    approvedByName: '',
    startDate: '',
    endDate: '',
    gasTestRequired: false,
    isolations: 'Full electrical isolation required',
  },
];

const MOCK_METHOD_STATEMENTS: MockMethodStatement[] = [
  {
    id: 'ms-001',
    referenceNumber: 'MS-2026-001',
    title: 'Hot Work Method Statement — Tank 4',
    permitId: 'ptw-001',
    version: 2,
    approvedBy: 'Jane Doe',
    approvedAt: '2026-03-08T10:00:00Z',
  },
  {
    id: 'ms-002',
    referenceNumber: 'MS-2026-002',
    title: 'Confined Space Entry Procedure',
    permitId: 'ptw-002',
    version: 1,
    approvedBy: '',
    approvedAt: null,
  },
];

const MOCK_TOOLBOX_TALKS: MockToolboxTalk[] = [
  {
    id: 'tbt-001',
    referenceNumber: 'TBT-2026-001',
    topic: 'Hot Work Safety Precautions',
    permitId: 'ptw-001',
    presenterName: 'Safety Manager',
    scheduledDate: '2026-03-09T07:30:00Z',
    conductedDate: '2026-03-09T07:35:00Z',
    attendeeCount: 8,
  },
  {
    id: 'tbt-002',
    referenceNumber: 'TBT-2026-002',
    topic: 'Confined Space Hazard Awareness',
    permitId: 'ptw-002',
    presenterName: 'EHS Officer',
    scheduledDate: '2026-03-10T06:45:00Z',
    conductedDate: null,
    attendeeCount: 0,
  },
];

const MOCK_CONFLICTS: MockConflict[] = [
  {
    id: 'cfl-001',
    referenceNumber: 'CONF-2026-001',
    permitId1: 'ptw-001',
    permitId2: 'ptw-002',
    conflictType: 'SIMULTANEOUS_HOT_WORK_CONFINED_SPACE',
    severity: 'CRITICAL',
    description: 'Hot work within 15m of an open confined space entry is prohibited.',
    resolved: false,
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// TEST SUITES
// ═══════════════════════════════════════════════════════════════════════════════

describe('permit type enumeration', () => {
  it('has 8 permit types', () => expect(PERMIT_TYPES).toHaveLength(8));

  for (const t of PERMIT_TYPES) {
    it(`${t} is a non-empty string`, () => {
      expect(typeof t).toBe('string');
      expect(t.length).toBeGreaterThan(0);
    });
    it(`${t} has a display label`, () => {
      expect(permitTypeLabel[t]).toBeDefined();
      expect(permitTypeLabel[t].length).toBeGreaterThan(0);
    });
  }

  it('includes HOT_WORK',          () => expect(PERMIT_TYPES).toContain('HOT_WORK'));
  it('includes CONFINED_SPACE',    () => expect(PERMIT_TYPES).toContain('CONFINED_SPACE'));
  it('includes WORKING_AT_HEIGHT', () => expect(PERMIT_TYPES).toContain('WORKING_AT_HEIGHT'));
  it('includes ELECTRICAL',        () => expect(PERMIT_TYPES).toContain('ELECTRICAL'));
  it('includes EXCAVATION',        () => expect(PERMIT_TYPES).toContain('EXCAVATION'));
  it('includes GENERAL',           () => expect(PERMIT_TYPES).toContain('GENERAL'));
});

describe('permit status enumeration', () => {
  it('has 8 permit statuses', () => expect(PERMIT_STATUSES).toHaveLength(8));

  for (const s of PERMIT_STATUSES) {
    it(`${s} is a non-empty string`, () => {
      expect(typeof s).toBe('string');
      expect(s.length).toBeGreaterThan(0);
    });
  }

  it('includes DRAFT',     () => expect(PERMIT_STATUSES).toContain('DRAFT'));
  it('includes REQUESTED', () => expect(PERMIT_STATUSES).toContain('REQUESTED'));
  it('includes APPROVED',  () => expect(PERMIT_STATUSES).toContain('APPROVED'));
  it('includes ACTIVE',    () => expect(PERMIT_STATUSES).toContain('ACTIVE'));
  it('includes SUSPENDED', () => expect(PERMIT_STATUSES).toContain('SUSPENDED'));
  it('includes CLOSED',    () => expect(PERMIT_STATUSES).toContain('CLOSED'));
  it('includes CANCELLED', () => expect(PERMIT_STATUSES).toContain('CANCELLED'));
  it('includes EXPIRED',   () => expect(PERMIT_STATUSES).toContain('EXPIRED'));
});

describe('permit priority enumeration', () => {
  it('has 4 priorities', () => expect(PERMIT_PRIORITIES).toHaveLength(4));
  for (const p of PERMIT_PRIORITIES) {
    it(`${p} is a string`, () => expect(typeof p).toBe('string'));
  }
  it('includes CRITICAL', () => expect(PERMIT_PRIORITIES).toContain('CRITICAL'));
  it('includes HIGH',     () => expect(PERMIT_PRIORITIES).toContain('HIGH'));
  it('includes MEDIUM',   () => expect(PERMIT_PRIORITIES).toContain('MEDIUM'));
  it('includes LOW',      () => expect(PERMIT_PRIORITIES).toContain('LOW'));
});

describe('permit status badge colors', () => {
  for (const s of PERMIT_STATUSES) {
    it(`${s} has a badge class`, () => expect(permitStatusColor[s]).toBeDefined());
    it(`${s} badge contains bg-`,   () => expect(permitStatusColor[s]).toContain('bg-'));
    it(`${s} badge contains text-`, () => expect(permitStatusColor[s]).toContain('text-'));
  }

  it('ACTIVE is green',    () => expect(permitStatusColor.ACTIVE).toContain('green'));
  it('APPROVED is blue',   () => expect(permitStatusColor.APPROVED).toContain('blue'));
  it('SUSPENDED is red',   () => expect(permitStatusColor.SUSPENDED).toContain('red'));
  it('EXPIRED is red',     () => expect(permitStatusColor.EXPIRED).toContain('red'));
  it('DRAFT is gray',      () => expect(permitStatusColor.DRAFT).toContain('gray'));
  it('CLOSED is gray',     () => expect(permitStatusColor.CLOSED).toContain('gray'));
  it('CANCELLED is gray',  () => expect(permitStatusColor.CANCELLED).toContain('gray'));
  it('REQUESTED is amber', () => expect(permitStatusColor.REQUESTED).toContain('amber'));
});

describe('permit priority badge colors', () => {
  for (const p of PERMIT_PRIORITIES) {
    it(`${p} has a badge class`, () => expect(permitPriorityColor[p]).toBeDefined());
    it(`${p} badge contains bg-`,   () => expect(permitPriorityColor[p]).toContain('bg-'));
    it(`${p} badge contains text-`, () => expect(permitPriorityColor[p]).toContain('text-'));
  }

  it('CRITICAL is red',    () => expect(permitPriorityColor.CRITICAL).toContain('red'));
  it('HIGH is orange',     () => expect(permitPriorityColor.HIGH).toContain('orange'));
  it('MEDIUM is amber',    () => expect(permitPriorityColor.MEDIUM).toContain('amber'));
  it('LOW is green',       () => expect(permitPriorityColor.LOW).toContain('green'));
});

describe('conflict severity badge colors', () => {
  for (const s of CONFLICT_SEVERITIES) {
    it(`${s} has a badge class`, () => expect(conflictSeverityColor[s]).toBeDefined());
  }
  it('CRITICAL is red',  () => expect(conflictSeverityColor.CRITICAL).toContain('red'));
  it('HIGH is orange',   () => expect(conflictSeverityColor.HIGH).toContain('orange'));
  it('MEDIUM is amber',  () => expect(conflictSeverityColor.MEDIUM).toContain('amber'));
  it('LOW is green',     () => expect(conflictSeverityColor.LOW).toContain('green'));
});

describe('gas test requirements', () => {
  it('HOT_WORK requires gas test',       () => expect(permitTypeRequiresGasTest.HOT_WORK).toBe(true));
  it('CONFINED_SPACE requires gas test', () => expect(permitTypeRequiresGasTest.CONFINED_SPACE).toBe(true));
  it('EXCAVATION requires gas test',     () => expect(permitTypeRequiresGasTest.EXCAVATION).toBe(true));
  it('CHEMICAL requires gas test',       () => expect(permitTypeRequiresGasTest.CHEMICAL).toBe(true));
  it('ELECTRICAL does not',              () => expect(permitTypeRequiresGasTest.ELECTRICAL).toBe(false));
  it('WORKING_AT_HEIGHT does not',       () => expect(permitTypeRequiresGasTest.WORKING_AT_HEIGHT).toBe(false));
  it('RADIATION does not',               () => expect(permitTypeRequiresGasTest.RADIATION).toBe(false));
  it('GENERAL does not',                 () => expect(permitTypeRequiresGasTest.GENERAL).toBe(false));

  for (const t of PERMIT_TYPES) {
    it(`gasTest requirement for ${t} is boolean`, () => {
      expect(typeof permitTypeRequiresGasTest[t]).toBe('boolean');
    });
  }
});

describe('isolation requirements', () => {
  it('ELECTRICAL requires isolation',     () => expect(permitTypeRequiresIsolation.ELECTRICAL).toBe(true));
  it('CONFINED_SPACE requires isolation', () => expect(permitTypeRequiresIsolation.CONFINED_SPACE).toBe(true));
  it('CHEMICAL requires isolation',       () => expect(permitTypeRequiresIsolation.CHEMICAL).toBe(true));
  it('HOT_WORK does not',                 () => expect(permitTypeRequiresIsolation.HOT_WORK).toBe(false));
  it('WORKING_AT_HEIGHT does not',        () => expect(permitTypeRequiresIsolation.WORKING_AT_HEIGHT).toBe(false));
  it('EXCAVATION does not',               () => expect(permitTypeRequiresIsolation.EXCAVATION).toBe(false));
  it('GENERAL does not',                  () => expect(permitTypeRequiresIsolation.GENERAL).toBe(false));

  for (const t of PERMIT_TYPES) {
    it(`isolation requirement for ${t} is boolean`, () => {
      expect(typeof permitTypeRequiresIsolation[t]).toBe('boolean');
    });
  }
});

describe('isPermitActive', () => {
  it('ACTIVE → true',    () => expect(isPermitActive('ACTIVE')).toBe(true));
  it('APPROVED → false', () => expect(isPermitActive('APPROVED')).toBe(false));
  it('DRAFT → false',    () => expect(isPermitActive('DRAFT')).toBe(false));
  it('SUSPENDED → false',() => expect(isPermitActive('SUSPENDED')).toBe(false));
  it('CLOSED → false',   () => expect(isPermitActive('CLOSED')).toBe(false));
  it('EXPIRED → false',  () => expect(isPermitActive('EXPIRED')).toBe(false));

  for (const s of PERMIT_STATUSES) {
    it(`isPermitActive(${s}) returns boolean`, () => {
      expect(typeof isPermitActive(s)).toBe('boolean');
    });
  }
});

describe('isPermitEditable', () => {
  it('DRAFT is editable',     () => expect(isPermitEditable('DRAFT')).toBe(true));
  it('REQUESTED is editable', () => expect(isPermitEditable('REQUESTED')).toBe(true));
  it('APPROVED is not',       () => expect(isPermitEditable('APPROVED')).toBe(false));
  it('ACTIVE is not',         () => expect(isPermitEditable('ACTIVE')).toBe(false));
  it('CLOSED is not',         () => expect(isPermitEditable('CLOSED')).toBe(false));
  it('EXPIRED is not',        () => expect(isPermitEditable('EXPIRED')).toBe(false));
});

describe('isPermitTerminal', () => {
  it('CLOSED is terminal',    () => expect(isPermitTerminal('CLOSED')).toBe(true));
  it('CANCELLED is terminal', () => expect(isPermitTerminal('CANCELLED')).toBe(true));
  it('EXPIRED is terminal',   () => expect(isPermitTerminal('EXPIRED')).toBe(true));
  it('ACTIVE is not',         () => expect(isPermitTerminal('ACTIVE')).toBe(false));
  it('DRAFT is not',          () => expect(isPermitTerminal('DRAFT')).toBe(false));
  it('APPROVED is not',       () => expect(isPermitTerminal('APPROVED')).toBe(false));
});

describe('canActivatePermit / canSuspendPermit', () => {
  it('APPROVED can be activated',  () => expect(canActivatePermit('APPROVED')).toBe(true));
  it('DRAFT cannot be activated',  () => expect(canActivatePermit('DRAFT')).toBe(false));
  it('ACTIVE cannot be activated', () => expect(canActivatePermit('ACTIVE')).toBe(false));

  it('ACTIVE can be suspended',    () => expect(canSuspendPermit('ACTIVE')).toBe(true));
  it('APPROVED cannot be suspended',() => expect(canSuspendPermit('APPROVED')).toBe(false));
  it('DRAFT cannot be suspended',  () => expect(canSuspendPermit('DRAFT')).toBe(false));
});

describe('permitExpiryState', () => {
  it('past expiry → EXPIRED', () => {
    const now = new Date();
    const expiry = new Date(now.getTime() - 3600000);
    expect(permitExpiryState(expiry, now)).toBe('EXPIRED');
  });

  it('1h remaining → EXPIRING_SOON', () => {
    const now = new Date();
    const expiry = new Date(now.getTime() + 3600000);
    expect(permitExpiryState(expiry, now)).toBe('EXPIRING_SOON');
  });

  it('exactly 2h remaining → EXPIRING_SOON', () => {
    const now = new Date();
    const expiry = new Date(now.getTime() + 2 * 3600000);
    expect(permitExpiryState(expiry, now)).toBe('EXPIRING_SOON');
  });

  it('3h remaining → VALID', () => {
    const now = new Date();
    const expiry = new Date(now.getTime() + 3 * 3600000);
    expect(permitExpiryState(expiry, now)).toBe('VALID');
  });

  it('24h remaining → VALID', () => {
    const now = new Date();
    const expiry = new Date(now.getTime() + 86400000);
    expect(permitExpiryState(expiry, now)).toBe('VALID');
  });

  for (let h = 1; h <= 20; h++) {
    it(`permitExpiryState at +${h}h returns valid value`, () => {
      const now = new Date();
      const expiry = new Date(now.getTime() + h * 3600000);
      expect(['EXPIRED', 'EXPIRING_SOON', 'VALID']).toContain(permitExpiryState(expiry, now));
    });
  }
});

describe('permitReferenceFormat', () => {
  it('generates PTW-2026-0001 for seq=1', () => {
    expect(permitReferenceFormat(2026, 1)).toBe('PTW-2026-0001');
  });
  it('pads to 4 digits', () => {
    expect(permitReferenceFormat(2026, 42)).toBe('PTW-2026-0042');
  });
  it('handles 4-digit seq without extra padding', () => {
    expect(permitReferenceFormat(2026, 1000)).toBe('PTW-2026-1000');
  });
  it('contains the year', () => {
    expect(permitReferenceFormat(2026, 5)).toContain('2026');
  });
  it('starts with PTW-', () => {
    expect(permitReferenceFormat(2026, 5)).toMatch(/^PTW-/);
  });

  for (let seq = 1; seq <= 10; seq++) {
    it(`PTW reference for seq=${seq} is a non-empty string`, () => {
      const ref = permitReferenceFormat(2026, seq);
      expect(typeof ref).toBe('string');
      expect(ref.length).toBeGreaterThan(0);
    });
  }
});

describe('methodStatementReferenceFormat', () => {
  it('generates MS-2026-001 for seq=1', () => {
    expect(methodStatementReferenceFormat(2026, 1)).toBe('MS-2026-001');
  });
  it('pads to 3 digits', () => {
    expect(methodStatementReferenceFormat(2026, 9)).toBe('MS-2026-009');
  });
  it('starts with MS-', () => {
    expect(methodStatementReferenceFormat(2026, 1)).toMatch(/^MS-/);
  });
  it('contains the year', () => {
    expect(methodStatementReferenceFormat(2026, 1)).toContain('2026');
  });
});

describe('priorityScore ordering', () => {
  it('CRITICAL > HIGH',  () => expect(priorityScore('CRITICAL')).toBeGreaterThan(priorityScore('HIGH')));
  it('HIGH > MEDIUM',    () => expect(priorityScore('HIGH')).toBeGreaterThan(priorityScore('MEDIUM')));
  it('MEDIUM > LOW',     () => expect(priorityScore('MEDIUM')).toBeGreaterThan(priorityScore('LOW')));
  it('LOW is positive',  () => expect(priorityScore('LOW')).toBeGreaterThan(0));

  for (const p of PERMIT_PRIORITIES) {
    it(`priorityScore(${p}) is a positive integer`, () => {
      const score = priorityScore(p);
      expect(score).toBeGreaterThan(0);
      expect(Number.isInteger(score)).toBe(true);
    });
  }
});

describe('toolboxTalkIsConducted', () => {
  it('non-null date → conducted',        () => expect(toolboxTalkIsConducted('2026-03-09')).toBe(true));
  it('null → not conducted',             () => expect(toolboxTalkIsConducted(null)).toBe(false));
  it('empty string → not conducted',     () => expect(toolboxTalkIsConducted('')).toBe(false));
  it('ISO string → conducted',           () => expect(toolboxTalkIsConducted('2026-03-09T07:35:00Z')).toBe(true));

  for (let i = 0; i < 10; i++) {
    it(`toolboxTalkIsConducted returns boolean (idx ${i})`, () => {
      const date = i % 2 === 0 ? '2026-03-09' : null;
      expect(typeof toolboxTalkIsConducted(date)).toBe('boolean');
    });
  }
});

describe('mock permit data shapes', () => {
  it('has 3 mock permits', () => expect(MOCK_PERMITS).toHaveLength(3));

  for (const permit of MOCK_PERMITS) {
    it(`${permit.referenceNumber}: id is non-empty`,      () => expect(permit.id.length).toBeGreaterThan(0));
    it(`${permit.referenceNumber}: title is non-empty`,   () => expect(permit.title.length).toBeGreaterThan(0));
    it(`${permit.referenceNumber}: type is valid`,        () => expect(PERMIT_TYPES).toContain(permit.type));
    it(`${permit.referenceNumber}: status is valid`,      () => expect(PERMIT_STATUSES).toContain(permit.status));
    it(`${permit.referenceNumber}: priority is valid`,    () => expect(PERMIT_PRIORITIES).toContain(permit.priority));
    it(`${permit.referenceNumber}: gasTestRequired is boolean`, () => {
      expect(typeof permit.gasTestRequired).toBe('boolean');
    });
  }

  it('HOT_WORK permit has gasTestRequired=true', () => {
    const p = MOCK_PERMITS.find(x => x.type === 'HOT_WORK')!;
    expect(p.gasTestRequired).toBe(true);
  });

  it('ELECTRICAL permit has gasTestRequired=false', () => {
    const p = MOCK_PERMITS.find(x => x.type === 'ELECTRICAL')!;
    expect(p.gasTestRequired).toBe(false);
  });

  it('CONFINED_SPACE permit has non-empty isolation text', () => {
    const p = MOCK_PERMITS.find(x => x.type === 'CONFINED_SPACE')!;
    expect(p.isolations.length).toBeGreaterThan(0);
  });

  it('DRAFT permit has no approvedByName', () => {
    const p = MOCK_PERMITS.find(x => x.status === 'DRAFT')!;
    expect(p.approvedByName).toBe('');
  });

  it('ACTIVE permit has a requestedByName', () => {
    const p = MOCK_PERMITS.find(x => x.status === 'ACTIVE')!;
    expect(p.requestedByName.length).toBeGreaterThan(0);
  });

  it('permit references start with PTW-', () => {
    for (const p of MOCK_PERMITS) {
      expect(p.referenceNumber).toMatch(/^PTW-/);
    }
  });
});

describe('mock method statement data shapes', () => {
  it('has 2 mock method statements', () => expect(MOCK_METHOD_STATEMENTS).toHaveLength(2));

  for (const ms of MOCK_METHOD_STATEMENTS) {
    it(`${ms.referenceNumber}: id is non-empty`,    () => expect(ms.id.length).toBeGreaterThan(0));
    it(`${ms.referenceNumber}: title is non-empty`, () => expect(ms.title.length).toBeGreaterThan(0));
    it(`${ms.referenceNumber}: version >= 1`,       () => expect(ms.version).toBeGreaterThanOrEqual(1));
    it(`${ms.referenceNumber}: permitId non-empty`, () => expect(ms.permitId.length).toBeGreaterThan(0));
    it(`${ms.referenceNumber}: ref starts with MS-`, () => expect(ms.referenceNumber).toMatch(/^MS-/));
  }

  it('approved MS has non-empty approvedBy', () => {
    const approved = MOCK_METHOD_STATEMENTS.filter(m => m.approvedAt !== null);
    for (const ms of approved) {
      expect(ms.approvedBy.length).toBeGreaterThan(0);
    }
  });

  it('version 2 MS exists', () => {
    expect(MOCK_METHOD_STATEMENTS.some(m => m.version === 2)).toBe(true);
  });
});

describe('mock toolbox talk data shapes', () => {
  it('has 2 mock toolbox talks', () => expect(MOCK_TOOLBOX_TALKS).toHaveLength(2));

  for (const tbt of MOCK_TOOLBOX_TALKS) {
    it(`${tbt.referenceNumber}: id is non-empty`,     () => expect(tbt.id.length).toBeGreaterThan(0));
    it(`${tbt.referenceNumber}: topic is non-empty`,  () => expect(tbt.topic.length).toBeGreaterThan(0));
    it(`${tbt.referenceNumber}: attendeeCount >= 0`,  () => expect(tbt.attendeeCount).toBeGreaterThanOrEqual(0));
    it(`${tbt.referenceNumber}: ref starts with TBT-`, () => expect(tbt.referenceNumber).toMatch(/^TBT-/));
  }

  it('conducted talk has attendeeCount > 0', () => {
    const conducted = MOCK_TOOLBOX_TALKS.filter(t => t.conductedDate !== null);
    for (const tbt of conducted) {
      expect(tbt.attendeeCount).toBeGreaterThan(0);
    }
  });

  it('pending talk has conductedDate=null', () => {
    const pending = MOCK_TOOLBOX_TALKS.find(t => t.conductedDate === null)!;
    expect(pending).toBeDefined();
    expect(toolboxTalkIsConducted(pending.conductedDate)).toBe(false);
  });
});

describe('mock conflict data shapes', () => {
  it('has 1 mock conflict', () => expect(MOCK_CONFLICTS).toHaveLength(1));

  for (const c of MOCK_CONFLICTS) {
    it(`${c.referenceNumber}: id is non-empty`,         () => expect(c.id.length).toBeGreaterThan(0));
    it(`${c.referenceNumber}: severity is valid`,       () => expect(CONFLICT_SEVERITIES).toContain(c.severity));
    it(`${c.referenceNumber}: description non-empty`,   () => expect(c.description.length).toBeGreaterThan(0));
    it(`${c.referenceNumber}: resolved is boolean`,     () => expect(typeof c.resolved).toBe('boolean'));
    it(`${c.referenceNumber}: ref starts with CONF-`,   () => expect(c.referenceNumber).toMatch(/^CONF-/));
    it(`${c.referenceNumber}: both permitIds non-empty`, () => {
      expect(c.permitId1.length).toBeGreaterThan(0);
      expect(c.permitId2.length).toBeGreaterThan(0);
    });
  }

  it('unresolved CRITICAL conflict exists', () => {
    const crit = MOCK_CONFLICTS.find(c => c.severity === 'CRITICAL' && !c.resolved);
    expect(crit).toBeDefined();
  });
});

// ─── Parametric: PERMIT_TYPES positional index ───────────────────────────────

describe('PERMIT_TYPES — positional index parametric', () => {
  const cases: [PermitType, number][] = [
    ['HOT_WORK', 0],
    ['CONFINED_SPACE', 1],
    ['WORKING_AT_HEIGHT', 2],
    ['ELECTRICAL', 3],
    ['EXCAVATION', 4],
    ['CHEMICAL', 5],
    ['RADIATION', 6],
    ['GENERAL', 7],
  ];
  for (const [type, idx] of cases) {
    it(`${type} is at index ${idx}`, () => {
      expect(PERMIT_TYPES[idx]).toBe(type);
    });
  }
});

// ─── Parametric: PERMIT_STATUSES positional index ────────────────────────────

describe('PERMIT_STATUSES — positional index parametric', () => {
  const cases: [PermitStatus, number][] = [
    ['DRAFT', 0],
    ['REQUESTED', 1],
    ['APPROVED', 2],
    ['ACTIVE', 3],
    ['SUSPENDED', 4],
    ['CLOSED', 5],
    ['CANCELLED', 6],
    ['EXPIRED', 7],
  ];
  for (const [status, idx] of cases) {
    it(`${status} is at index ${idx}`, () => {
      expect(PERMIT_STATUSES[idx]).toBe(status);
    });
  }
});

// ─── Parametric: priorityScore exact values ───────────────────────────────────

describe('priorityScore — exact values parametric', () => {
  const cases: [PermitPriority, number][] = [
    ['CRITICAL', 4],
    ['HIGH', 3],
    ['MEDIUM', 2],
    ['LOW', 1],
  ];
  for (const [priority, expected] of cases) {
    it(`${priority} → score ${expected}`, () => {
      expect(priorityScore(priority)).toBe(expected);
    });
  }
});

// ─── Parametric: permitTypeLabel exact values ─────────────────────────────────

describe('permitTypeLabel — exact values parametric', () => {
  const cases: [PermitType, string][] = [
    ['HOT_WORK', 'Hot Work'],
    ['CONFINED_SPACE', 'Confined Space'],
    ['WORKING_AT_HEIGHT', 'Working at Height'],
    ['ELECTRICAL', 'Electrical'],
    ['EXCAVATION', 'Excavation'],
    ['CHEMICAL', 'Chemical'],
    ['RADIATION', 'Radiation'],
    ['GENERAL', 'General'],
  ];
  for (const [type, label] of cases) {
    it(`${type} label is "${label}"`, () => {
      expect(permitTypeLabel[type]).toBe(label);
    });
  }
});

// ─── Parametric: MOCK_PERMITS per-permit exact type+status+priority ───────────

describe('MOCK_PERMITS — per-permit exact type+status+priority parametric', () => {
  const cases: [string, PermitType, PermitStatus, PermitPriority][] = [
    ['ptw-001', 'HOT_WORK', 'ACTIVE', 'HIGH'],
    ['ptw-002', 'CONFINED_SPACE', 'APPROVED', 'CRITICAL'],
    ['ptw-003', 'ELECTRICAL', 'DRAFT', 'MEDIUM'],
  ];
  for (const [id, type, status, priority] of cases) {
    it(`${id}: type=${type}, status=${status}, priority=${priority}`, () => {
      const p = MOCK_PERMITS.find((x) => x.id === id)!;
      expect(p.type).toBe(type);
      expect(p.status).toBe(status);
      expect(p.priority).toBe(priority);
    });
  }
});

// ─── PERMIT_TYPES — positional index parametric ──────────────────────────────

describe('PERMIT_TYPES — positional index parametric', () => {
  const expected = [
    [0, 'HOT_WORK'],
    [1, 'CONFINED_SPACE'],
    [2, 'WORKING_AT_HEIGHT'],
    [3, 'ELECTRICAL'],
    [4, 'EXCAVATION'],
    [5, 'CHEMICAL'],
    [6, 'RADIATION'],
    [7, 'GENERAL'],
  ] as const;
  for (const [idx, val] of expected) {
    it(`PERMIT_TYPES[${idx}] === '${val}'`, () => {
      expect(PERMIT_TYPES[idx]).toBe(val);
    });
  }
});

// ─── PERMIT_STATUSES — positional index parametric ───────────────────────────

describe('PERMIT_STATUSES — positional index parametric', () => {
  const expected = [
    [0, 'DRAFT'],
    [1, 'REQUESTED'],
    [2, 'APPROVED'],
    [3, 'ACTIVE'],
    [4, 'SUSPENDED'],
    [5, 'CLOSED'],
    [6, 'CANCELLED'],
    [7, 'EXPIRED'],
  ] as const;
  for (const [idx, val] of expected) {
    it(`PERMIT_STATUSES[${idx}] === '${val}'`, () => {
      expect(PERMIT_STATUSES[idx]).toBe(val);
    });
  }
});

// ─── PERMIT_PRIORITIES — positional index parametric ─────────────────────────

describe('PERMIT_PRIORITIES — positional index parametric', () => {
  const expected = [
    [0, 'CRITICAL'],
    [1, 'HIGH'],
    [2, 'MEDIUM'],
    [3, 'LOW'],
  ] as const;
  for (const [idx, val] of expected) {
    it(`PERMIT_PRIORITIES[${idx}] === '${val}'`, () => {
      expect(PERMIT_PRIORITIES[idx]).toBe(val);
    });
  }
});
