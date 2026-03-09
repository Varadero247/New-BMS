// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

// ─── Inlined constants from findings/client.tsx ───────────────────────────────

const FINDING_SEVERITIES = ['MAJOR_NC', 'MINOR_NC', 'OBSERVATION', 'OPPORTUNITY', 'POSITIVE'] as const;
type FindingSeverity = typeof FINDING_SEVERITIES[number];

const FINDING_STATUSES = ['OPEN', 'IN_PROGRESS', 'CLOSED', 'VERIFIED', 'OVERDUE'] as const;
type FindingStatus = typeof FINDING_STATUSES[number];

const FINDING_EMPTY_FORM = {
  auditId: '',
  title: '',
  description: '',
  severity: 'MINOR_NC',
  status: 'OPEN',
  clauseRef: '',
  evidence: '',
  rootCause: '',
  correctiveAction: '',
  assigneeName: '',
  dueDate: '',
  notes: '',
};

// ─── Inlined constants from audits/client.tsx ─────────────────────────────────

const AUDIT_TYPES = [
  'INTERNAL',
  'EXTERNAL',
  'SUPPLIER',
  'CERTIFICATION',
  'SURVEILLANCE',
  'PROCESS',
] as const;
type AuditType = typeof AUDIT_TYPES[number];

const AUDIT_STATUSES = ['PLANNED', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] as const;
type AuditStatus = typeof AUDIT_STATUSES[number];

const AUDIT_EMPTY_FORM = {
  title: '',
  description: '',
  type: 'INTERNAL',
  status: 'PLANNED',
  standard: '',
  scope: '',
  department: '',
  leadAuditorName: '',
  scheduledDate: '',
  startDate: '',
  endDate: '',
  conclusion: '',
  notes: '',
};

// ─── Inlined pure helper functions ────────────────────────────────────────────

/** From findings/client.tsx */
function severityColor(severity: string): string {
  switch (severity) {
    case 'MAJOR_NC':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
    case 'MINOR_NC':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
    case 'OBSERVATION':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
    case 'OPPORTUNITY':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    case 'POSITIVE':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
  }
}

/** From findings/client.tsx */
function findingStatusVariant(status: string): string {
  switch (status) {
    case 'CLOSED':
    case 'VERIFIED':
      return 'secondary';
    case 'IN_PROGRESS':
      return 'default';
    case 'OVERDUE':
      return 'destructive';
    default:
      return 'outline';
  }
}

/** From audits/client.tsx */
function auditStatusVariant(status: string): string {
  switch (status) {
    case 'COMPLETED':
      return 'secondary';
    case 'IN_PROGRESS':
      return 'default';
    case 'CANCELLED':
      return 'destructive';
    default:
      return 'outline';
  }
}

/** From checklists/client.tsx */
function completionPercent(completed: number, total: number): number {
  if (!total) return 0;
  return Math.round((completed / total) * 100);
}

// ─── Tests: Finding Severities ────────────────────────────────────────────────

describe('FINDING_SEVERITIES array', () => {
  it('has 5 entries', () => {
    expect(FINDING_SEVERITIES).toHaveLength(5);
  });

  it('contains MAJOR_NC', () => {
    expect(FINDING_SEVERITIES).toContain('MAJOR_NC');
  });

  it('contains MINOR_NC', () => {
    expect(FINDING_SEVERITIES).toContain('MINOR_NC');
  });

  it('contains OBSERVATION', () => {
    expect(FINDING_SEVERITIES).toContain('OBSERVATION');
  });

  it('contains OPPORTUNITY', () => {
    expect(FINDING_SEVERITIES).toContain('OPPORTUNITY');
  });

  it('contains POSITIVE', () => {
    expect(FINDING_SEVERITIES).toContain('POSITIVE');
  });

  it('has no duplicates', () => {
    expect(new Set(FINDING_SEVERITIES).size).toBe(FINDING_SEVERITIES.length);
  });

  it('MAJOR_NC appears before MINOR_NC (severity ordering)', () => {
    const majorIdx = FINDING_SEVERITIES.indexOf('MAJOR_NC');
    const minorIdx = FINDING_SEVERITIES.indexOf('MINOR_NC');
    expect(majorIdx).toBeLessThan(minorIdx);
  });
});

// ─── Tests: Finding Statuses ──────────────────────────────────────────────────

describe('FINDING_STATUSES array', () => {
  it('has 5 entries', () => {
    expect(FINDING_STATUSES).toHaveLength(5);
  });

  it('contains OPEN', () => {
    expect(FINDING_STATUSES).toContain('OPEN');
  });

  it('contains IN_PROGRESS', () => {
    expect(FINDING_STATUSES).toContain('IN_PROGRESS');
  });

  it('contains CLOSED', () => {
    expect(FINDING_STATUSES).toContain('CLOSED');
  });

  it('contains VERIFIED', () => {
    expect(FINDING_STATUSES).toContain('VERIFIED');
  });

  it('contains OVERDUE', () => {
    expect(FINDING_STATUSES).toContain('OVERDUE');
  });

  it('has no duplicates', () => {
    expect(new Set(FINDING_STATUSES).size).toBe(FINDING_STATUSES.length);
  });

  it('starts with OPEN (initial state)', () => {
    expect(FINDING_STATUSES[0]).toBe('OPEN');
  });
});

// ─── Tests: severityColor helper ──────────────────────────────────────────────

describe('severityColor helper', () => {
  it('MAJOR_NC returns red class', () => {
    expect(severityColor('MAJOR_NC')).toContain('red');
  });

  it('MINOR_NC returns orange class', () => {
    expect(severityColor('MINOR_NC')).toContain('orange');
  });

  it('OBSERVATION returns yellow class', () => {
    expect(severityColor('OBSERVATION')).toContain('yellow');
  });

  it('OPPORTUNITY returns blue class', () => {
    expect(severityColor('OPPORTUNITY')).toContain('blue');
  });

  it('POSITIVE returns green class', () => {
    expect(severityColor('POSITIVE')).toContain('green');
  });

  it('unknown severity returns gray class', () => {
    expect(severityColor('UNKNOWN')).toContain('gray');
  });

  it('all known severities return non-empty string', () => {
    for (const s of FINDING_SEVERITIES) {
      expect(severityColor(s)).toBeTruthy();
    }
  });

  it('all known severities return a class with "bg-"', () => {
    for (const s of FINDING_SEVERITIES) {
      expect(severityColor(s)).toContain('bg-');
    }
  });

  it('all known severities return a class with "text-"', () => {
    for (const s of FINDING_SEVERITIES) {
      expect(severityColor(s)).toContain('text-');
    }
  });
});

// ─── Tests: findingStatusVariant helper ───────────────────────────────────────

describe('findingStatusVariant helper', () => {
  it('CLOSED returns "secondary"', () => {
    expect(findingStatusVariant('CLOSED')).toBe('secondary');
  });

  it('VERIFIED returns "secondary"', () => {
    expect(findingStatusVariant('VERIFIED')).toBe('secondary');
  });

  it('IN_PROGRESS returns "default"', () => {
    expect(findingStatusVariant('IN_PROGRESS')).toBe('default');
  });

  it('OVERDUE returns "destructive"', () => {
    expect(findingStatusVariant('OVERDUE')).toBe('destructive');
  });

  it('OPEN returns "outline" (default branch)', () => {
    expect(findingStatusVariant('OPEN')).toBe('outline');
  });

  it('unknown status returns "outline"', () => {
    expect(findingStatusVariant('SOMETHING_ELSE')).toBe('outline');
  });

  it('returns a string for all known statuses', () => {
    for (const s of FINDING_STATUSES) {
      expect(typeof findingStatusVariant(s)).toBe('string');
    }
  });
});

// ─── Tests: Finding empty form defaults ───────────────────────────────────────

describe('finding emptyForm defaults', () => {
  it('severity defaults to MINOR_NC', () => {
    expect(FINDING_EMPTY_FORM.severity).toBe('MINOR_NC');
  });

  it('status defaults to OPEN', () => {
    expect(FINDING_EMPTY_FORM.status).toBe('OPEN');
  });

  it('title is empty string', () => {
    expect(FINDING_EMPTY_FORM.title).toBe('');
  });

  it('auditId is empty string', () => {
    expect(FINDING_EMPTY_FORM.auditId).toBe('');
  });

  it('severity default is a valid FINDING_SEVERITY', () => {
    expect(FINDING_SEVERITIES).toContain(FINDING_EMPTY_FORM.severity as FindingSeverity);
  });

  it('status default is a valid FINDING_STATUS', () => {
    expect(FINDING_STATUSES).toContain(FINDING_EMPTY_FORM.status as FindingStatus);
  });
});

// ─── Tests: AUDIT_TYPES array ─────────────────────────────────────────────────

describe('AUDIT_TYPES array', () => {
  it('has 6 entries', () => {
    expect(AUDIT_TYPES).toHaveLength(6);
  });

  it('contains INTERNAL', () => {
    expect(AUDIT_TYPES).toContain('INTERNAL');
  });

  it('contains EXTERNAL', () => {
    expect(AUDIT_TYPES).toContain('EXTERNAL');
  });

  it('contains SUPPLIER', () => {
    expect(AUDIT_TYPES).toContain('SUPPLIER');
  });

  it('contains CERTIFICATION', () => {
    expect(AUDIT_TYPES).toContain('CERTIFICATION');
  });

  it('contains SURVEILLANCE', () => {
    expect(AUDIT_TYPES).toContain('SURVEILLANCE');
  });

  it('contains PROCESS', () => {
    expect(AUDIT_TYPES).toContain('PROCESS');
  });

  it('has no duplicates', () => {
    expect(new Set(AUDIT_TYPES).size).toBe(AUDIT_TYPES.length);
  });

  it('all values are uppercase strings', () => {
    for (const t of AUDIT_TYPES) {
      expect(t).toBe(t.toUpperCase());
    }
  });
});

// ─── Tests: AUDIT_STATUSES array ──────────────────────────────────────────────

describe('AUDIT_STATUSES array', () => {
  it('has 5 entries', () => {
    expect(AUDIT_STATUSES).toHaveLength(5);
  });

  it('contains PLANNED', () => {
    expect(AUDIT_STATUSES).toContain('PLANNED');
  });

  it('contains SCHEDULED', () => {
    expect(AUDIT_STATUSES).toContain('SCHEDULED');
  });

  it('contains IN_PROGRESS', () => {
    expect(AUDIT_STATUSES).toContain('IN_PROGRESS');
  });

  it('contains COMPLETED', () => {
    expect(AUDIT_STATUSES).toContain('COMPLETED');
  });

  it('contains CANCELLED', () => {
    expect(AUDIT_STATUSES).toContain('CANCELLED');
  });

  it('has no duplicates', () => {
    expect(new Set(AUDIT_STATUSES).size).toBe(AUDIT_STATUSES.length);
  });

  it('starts with PLANNED (initial lifecycle state)', () => {
    expect(AUDIT_STATUSES[0]).toBe('PLANNED');
  });

  it('PLANNED appears before IN_PROGRESS (lifecycle order)', () => {
    const plannedIdx = AUDIT_STATUSES.indexOf('PLANNED');
    const inProgressIdx = AUDIT_STATUSES.indexOf('IN_PROGRESS');
    expect(plannedIdx).toBeLessThan(inProgressIdx);
  });
});

// ─── Tests: auditStatusVariant helper ────────────────────────────────────────

describe('auditStatusVariant helper', () => {
  it('COMPLETED returns "secondary"', () => {
    expect(auditStatusVariant('COMPLETED')).toBe('secondary');
  });

  it('IN_PROGRESS returns "default"', () => {
    expect(auditStatusVariant('IN_PROGRESS')).toBe('default');
  });

  it('CANCELLED returns "destructive"', () => {
    expect(auditStatusVariant('CANCELLED')).toBe('destructive');
  });

  it('PLANNED returns "outline" (default branch)', () => {
    expect(auditStatusVariant('PLANNED')).toBe('outline');
  });

  it('SCHEDULED returns "outline" (default branch)', () => {
    expect(auditStatusVariant('SCHEDULED')).toBe('outline');
  });

  it('unknown status returns "outline"', () => {
    expect(auditStatusVariant('UNKNOWN_STATUS')).toBe('outline');
  });

  it('returns a non-empty string for all known audit statuses', () => {
    for (const s of AUDIT_STATUSES) {
      expect(auditStatusVariant(s)).toBeTruthy();
    }
  });
});

// ─── Tests: Audit empty form defaults ────────────────────────────────────────

describe('audit emptyForm defaults', () => {
  it('type defaults to INTERNAL', () => {
    expect(AUDIT_EMPTY_FORM.type).toBe('INTERNAL');
  });

  it('status defaults to PLANNED', () => {
    expect(AUDIT_EMPTY_FORM.status).toBe('PLANNED');
  });

  it('title is empty string', () => {
    expect(AUDIT_EMPTY_FORM.title).toBe('');
  });

  it('type default is a valid AUDIT_TYPE', () => {
    expect(AUDIT_TYPES).toContain(AUDIT_EMPTY_FORM.type as AuditType);
  });

  it('status default is a valid AUDIT_STATUS', () => {
    expect(AUDIT_STATUSES).toContain(AUDIT_EMPTY_FORM.status as AuditStatus);
  });

  it('scheduledDate is empty string', () => {
    expect(AUDIT_EMPTY_FORM.scheduledDate).toBe('');
  });
});

// ─── Tests: completionPercent helper ─────────────────────────────────────────

describe('completionPercent helper', () => {
  it('0/0 returns 0 (guard against division by zero)', () => {
    expect(completionPercent(0, 0)).toBe(0);
  });

  it('10/10 returns 100', () => {
    expect(completionPercent(10, 10)).toBe(100);
  });

  it('0/10 returns 0', () => {
    expect(completionPercent(0, 10)).toBe(0);
  });

  it('5/10 returns 50', () => {
    expect(completionPercent(5, 10)).toBe(50);
  });

  it('1/3 rounds to 33', () => {
    expect(completionPercent(1, 3)).toBe(33);
  });

  it('2/3 rounds to 67', () => {
    expect(completionPercent(2, 3)).toBe(67);
  });

  it('result is always 0–100 for valid inputs', () => {
    for (let total = 1; total <= 20; total++) {
      for (let completed = 0; completed <= total; completed++) {
        const pct = completionPercent(completed, total);
        expect(pct).toBeGreaterThanOrEqual(0);
        expect(pct).toBeLessThanOrEqual(100);
      }
    }
  });

  it('result is an integer (Math.round applied)', () => {
    expect(Number.isInteger(completionPercent(1, 3))).toBe(true);
    expect(Number.isInteger(completionPercent(2, 7))).toBe(true);
  });

  it('increases monotonically as completed increases with fixed total', () => {
    const total = 10;
    let prev = -1;
    for (let c = 0; c <= total; c++) {
      const pct = completionPercent(c, total);
      expect(pct).toBeGreaterThanOrEqual(prev);
      prev = pct;
    }
  });
});

// ─── Tests: Cross-domain invariants ──────────────────────────────────────────

describe('cross-domain invariants', () => {
  it('FINDING_SEVERITIES and FINDING_STATUSES are disjoint', () => {
    const sevSet = new Set<string>(FINDING_SEVERITIES);
    for (const s of FINDING_STATUSES) {
      expect(sevSet.has(s)).toBe(false);
    }
  });

  it('AUDIT_TYPES and AUDIT_STATUSES are disjoint', () => {
    const typeSet = new Set<string>(AUDIT_TYPES);
    for (const s of AUDIT_STATUSES) {
      expect(typeSet.has(s)).toBe(false);
    }
  });

  it('severityColor distinguishes all 5 severities (no two return same class)', () => {
    const colors = FINDING_SEVERITIES.map(severityColor);
    expect(new Set(colors).size).toBe(FINDING_SEVERITIES.length);
  });

  it('INTERNAL audit type is the default form type', () => {
    expect(AUDIT_EMPTY_FORM.type).toBe('INTERNAL');
    expect(AUDIT_TYPES).toContain('INTERNAL');
  });

  it('MINOR_NC finding severity is the default form severity', () => {
    expect(FINDING_EMPTY_FORM.severity).toBe('MINOR_NC');
    expect(FINDING_SEVERITIES).toContain('MINOR_NC');
  });

  it('PLANNED audit status is the default form status', () => {
    expect(AUDIT_EMPTY_FORM.status).toBe('PLANNED');
    expect(AUDIT_STATUSES).toContain('PLANNED');
  });

  it('OPEN finding status is the default form status', () => {
    expect(FINDING_EMPTY_FORM.status).toBe('OPEN');
    expect(FINDING_STATUSES).toContain('OPEN');
  });
});

// ─── Tests: severityColor — per-severity parametric ──────────────────────────

describe('severityColor — per-severity color keyword parametric', () => {
  const cases: [string, string][] = [
    ['MAJOR_NC',    'red'],
    ['MINOR_NC',    'orange'],
    ['OBSERVATION', 'yellow'],
    ['OPPORTUNITY', 'blue'],
    ['POSITIVE',    'green'],
  ];
  for (const [severity, color] of cases) {
    it(`${severity} badge contains "${color}"`, () => {
      expect(severityColor(severity)).toContain(color);
    });
  }
  it('unknown input returns gray class', () => {
    expect(severityColor('UNKNOWN')).toContain('gray');
  });
});

// ─── Tests: findingStatusVariant — per-status parametric ─────────────────────

describe('findingStatusVariant — per-status parametric', () => {
  const cases: [string, string][] = [
    ['CLOSED',      'secondary'],
    ['VERIFIED',    'secondary'],
    ['IN_PROGRESS', 'default'],
    ['OVERDUE',     'destructive'],
    ['OPEN',        'outline'],
  ];
  for (const [status, variant] of cases) {
    it(`${status} → "${variant}"`, () => {
      expect(findingStatusVariant(status)).toBe(variant);
    });
  }
  it('unknown status → "outline"', () => {
    expect(findingStatusVariant('ANYTHING_ELSE')).toBe('outline');
  });
});

// ─── Tests: auditStatusVariant — per-status parametric ───────────────────────

describe('auditStatusVariant — per-status parametric', () => {
  const cases: [string, string][] = [
    ['COMPLETED',   'secondary'],
    ['IN_PROGRESS', 'default'],
    ['CANCELLED',   'destructive'],
    ['PLANNED',     'outline'],
    ['SCHEDULED',   'outline'],
  ];
  for (const [status, variant] of cases) {
    it(`${status} → "${variant}"`, () => {
      expect(auditStatusVariant(status)).toBe(variant);
    });
  }
  it('unknown status → "outline"', () => {
    expect(auditStatusVariant('SOME_STATUS')).toBe('outline');
  });
});

// ─── Tests: completionPercent — exact values parametric ──────────────────────

describe('completionPercent — exact values parametric', () => {
  const cases: [number, number, number][] = [
    [0,  0,  0],
    [0,  10, 0],
    [5,  10, 50],
    [10, 10, 100],
    [1,  3,  33],
    [2,  3,  67],
    [3,  4,  75],
    [7,  8,  88],
    [1,  4,  25],
    [3,  7,  43],
  ];
  for (const [completed, total, expected] of cases) {
    it(`completionPercent(${completed}, ${total}) = ${expected}`, () => {
      expect(completionPercent(completed, total)).toBe(expected);
    });
  }
});

// ─── Tests: AUDIT_TYPES positional index parametric ──────────────────────────

describe('AUDIT_TYPES — positional index parametric', () => {
  const expected: [AuditType, number][] = [
    ['INTERNAL',      0],
    ['EXTERNAL',      1],
    ['SUPPLIER',      2],
    ['CERTIFICATION', 3],
    ['SURVEILLANCE',  4],
    ['PROCESS',       5],
  ];
  for (const [type, idx] of expected) {
    it(`${type} is at index ${idx}`, () => {
      expect(AUDIT_TYPES[idx]).toBe(type);
    });
  }
});

// ─── Tests: AUDIT_STATUSES positional index parametric ───────────────────────

describe('AUDIT_STATUSES — positional index parametric', () => {
  const expected: [AuditStatus, number][] = [
    ['PLANNED',     0],
    ['SCHEDULED',   1],
    ['IN_PROGRESS', 2],
    ['COMPLETED',   3],
    ['CANCELLED',   4],
  ];
  for (const [status, idx] of expected) {
    it(`${status} is at index ${idx}`, () => {
      expect(AUDIT_STATUSES[idx]).toBe(status);
    });
  }
});

// ─── Tests: FINDING_SEVERITIES ordering parametric ───────────────────────────

describe('FINDING_SEVERITIES — ordering parametric', () => {
  it('MAJOR_NC(0) < MINOR_NC(1) < OBSERVATION(2) < OPPORTUNITY(3) < POSITIVE(4)', () => {
    for (let i = 1; i < FINDING_SEVERITIES.length; i++) {
      expect(FINDING_SEVERITIES.indexOf(FINDING_SEVERITIES[i])).toBeGreaterThan(
        FINDING_SEVERITIES.indexOf(FINDING_SEVERITIES[i - 1]),
      );
    }
  });
  const positional: [FindingSeverity, number][] = [
    ['MAJOR_NC',    0],
    ['MINOR_NC',    1],
    ['OBSERVATION', 2],
    ['OPPORTUNITY', 3],
    ['POSITIVE',    4],
  ];
  for (const [sev, idx] of positional) {
    it(`${sev} is at index ${idx}`, () => expect(FINDING_SEVERITIES[idx]).toBe(sev));
  }
});

// ─── Tests: completionPercent additional exact values ────────────────────────

describe('completionPercent — additional exact values parametric', () => {
  const cases: [number, number, number][] = [
    [4,  9,  44],  // Math.round(44.44) = 44
    [3,  8,  38],  // Math.round(37.5) = 38
    [7,  12, 58],  // Math.round(58.33) = 58
    [1,  9,  11],  // Math.round(11.11) = 11
    [8,  9,  89],  // Math.round(88.88) = 89
    [5,  6,  83],  // Math.round(83.33) = 83
    [6,  7,  86],  // Math.round(85.71) = 86
    [11, 12, 92],  // Math.round(91.67) = 92
    [9,  10, 90],
    [1,  8,  13],  // Math.round(12.5) = 13
  ];
  for (const [completed, total, expected] of cases) {
    it(`completionPercent(${completed}, ${total}) = ${expected}`, () => {
      expect(completionPercent(completed, total)).toBe(expected);
    });
  }
});

// ─── Tests: severityColor bg-/text- color family consistency ─────────────────

describe('severityColor — bg and text same color family parametric', () => {
  const cases: [string, string][] = [
    ['MAJOR_NC',    'red'],
    ['MINOR_NC',    'orange'],
    ['OBSERVATION', 'yellow'],
    ['OPPORTUNITY', 'blue'],
    ['POSITIVE',    'green'],
  ];
  for (const [sev, color] of cases) {
    it(`${sev} bg-${color} and text-${color} both present`, () => {
      const cls = severityColor(sev);
      expect(cls).toContain(`bg-${color}`);
      expect(cls).toContain(`text-${color}`);
    });
  }
});

// ─── Tests: FINDING_EMPTY_FORM keys ──────────────────────────────────────────

describe('FINDING_EMPTY_FORM — all required keys present', () => {
  const keys = [
    'auditId', 'title', 'description', 'severity', 'status',
    'clauseRef', 'evidence', 'rootCause', 'correctiveAction',
    'assigneeName', 'dueDate', 'notes',
  ];
  for (const key of keys) {
    it(`has key "${key}"`, () => {
      expect(FINDING_EMPTY_FORM).toHaveProperty(key);
    });
  }
  it('has exactly 12 keys', () => {
    expect(Object.keys(FINDING_EMPTY_FORM)).toHaveLength(12);
  });
  it('all values are strings', () => {
    for (const v of Object.values(FINDING_EMPTY_FORM)) {
      expect(typeof v).toBe('string');
    }
  });
});

// ─── Tests: AUDIT_EMPTY_FORM keys ────────────────────────────────────────────

describe('AUDIT_EMPTY_FORM — all required keys present', () => {
  const keys = [
    'title', 'description', 'type', 'status', 'standard', 'scope',
    'department', 'leadAuditorName', 'scheduledDate', 'startDate',
    'endDate', 'conclusion', 'notes',
  ];
  for (const key of keys) {
    it(`has key "${key}"`, () => {
      expect(AUDIT_EMPTY_FORM).toHaveProperty(key);
    });
  }
  it('has exactly 13 keys', () => {
    expect(Object.keys(AUDIT_EMPTY_FORM)).toHaveLength(13);
  });
  it('all values are strings', () => {
    for (const v of Object.values(AUDIT_EMPTY_FORM)) {
      expect(typeof v).toBe('string');
    }
  });
  it('non-default fields are empty string', () => {
    const nonDefault = Object.entries(AUDIT_EMPTY_FORM)
      .filter(([k]) => !['type', 'status'].includes(k));
    for (const [, v] of nonDefault) {
      expect(v).toBe('');
    }
  });
});
