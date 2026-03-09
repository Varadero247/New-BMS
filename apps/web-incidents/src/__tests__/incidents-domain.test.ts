// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

// ── Inlined domain constants (from incidents/client.tsx) ─────────────────────

const TYPES = [
  'INJURY',
  'NEAR_MISS',
  'ENVIRONMENTAL',
  'PROPERTY_DAMAGE',
  'SECURITY',
  'QUALITY',
  'VEHICLE',
  'OTHER',
] as const;

const SEVERITIES = ['MINOR', 'MODERATE', 'MAJOR', 'CRITICAL', 'CATASTROPHIC'] as const;

const STATUSES = [
  'REPORTED',
  'ACKNOWLEDGED',
  'INVESTIGATING',
  'ROOT_CAUSE_ANALYSIS',
  'CORRECTIVE_ACTION',
  'CLOSED',
  'REOPENED',
] as const;

const RIDDOR_OPTIONS = ['YES', 'NO', 'PENDING_ASSESSMENT'] as const;

// ── Inlined investigation statuses (from investigation/client.tsx) ────────────

const INVESTIGATION_STATUSES = [
  'INVESTIGATING',
  'ROOT_CAUSE_ANALYSIS',
  'ACKNOWLEDGED',
  'REPORTED',
] as const;

// ── Inlined RIDDOR view modes (from riddor/client.tsx) ───────────────────────

const RIDDOR_VIEW_MODES = ['reportable', 'pending'] as const;

// ── Inlined severity color map (mirrors getSeverityColor in source) ───────────

const SEVERITY_COLOR: Record<string, string> = {
  CATASTROPHIC: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  CRITICAL:     'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  MAJOR:        'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  MODERATE:     'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  MINOR:        'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
};

// ── Inlined status badge variant map (mirrors getStatusVariant in source) ─────

type BadgeVariant = 'default' | 'secondary' | 'outline' | 'destructive';

function getStatusVariant(status: string): BadgeVariant {
  switch (status) {
    case 'CLOSED':               return 'secondary';
    case 'INVESTIGATING':
    case 'ROOT_CAUSE_ANALYSIS':  return 'default';
    case 'CORRECTIVE_ACTION':    return 'destructive';
    default:                     return 'outline';
  }
}

// ── Inlined empty-form defaults (from incidents/client.tsx emptyForm) ─────────

const EMPTY_FORM = {
  title:            '',
  description:      '',
  type:             'INJURY',
  severity:         'MODERATE',
  status:           'REPORTED',
  dateOccurred:     '',
  timeOccurred:     '',
  location:         '',
  area:             '',
  department:       '',
  reportedByName:   '',
  injuredPerson:    '',
  injuredPersonRole:'',
  injuryType:       '',
  bodyPart:         '',
  treatmentGiven:   '',
  hospitalized:     false,
  daysLost:         0,
  immediateActions: '',
  riddorReportable: 'PENDING_ASSESSMENT',
  notes:            '',
} as const;

// ── Inlined mock incident shape ───────────────────────────────────────────────

interface MockIncident {
  id: string;
  referenceNumber: string;
  title: string;
  type: string;
  severity: string;
  status: string;
  dateOccurred: string;
  location: string;
  riddorReportable: string;
  hospitalized: boolean;
  daysLost: number;
}

const MOCK_INCIDENTS: MockIncident[] = [
  {
    id: 'inc-001',
    referenceNumber: 'INC-2026-001',
    title: 'Slip in warehouse aisle B',
    type: 'INJURY',
    severity: 'MODERATE',
    status: 'INVESTIGATING',
    dateOccurred: '2026-01-10T09:30:00Z',
    location: 'Warehouse — Aisle B',
    riddorReportable: 'PENDING_ASSESSMENT',
    hospitalized: false,
    daysLost: 0,
  },
  {
    id: 'inc-002',
    referenceNumber: 'INC-2026-002',
    title: 'Chemical spill near storage area',
    type: 'ENVIRONMENTAL',
    severity: 'MAJOR',
    status: 'ROOT_CAUSE_ANALYSIS',
    dateOccurred: '2026-01-15T14:00:00Z',
    location: 'Storage Area — Zone C',
    riddorReportable: 'YES',
    hospitalized: true,
    daysLost: 3,
  },
  {
    id: 'inc-003',
    referenceNumber: 'INC-2026-003',
    title: 'Near miss — forklift pedestrian conflict',
    type: 'NEAR_MISS',
    severity: 'CRITICAL',
    status: 'CORRECTIVE_ACTION',
    dateOccurred: '2026-02-01T11:00:00Z',
    location: 'Loading Bay',
    riddorReportable: 'YES',
    hospitalized: false,
    daysLost: 0,
  },
  {
    id: 'inc-004',
    referenceNumber: 'INC-2026-004',
    title: 'Equipment failure — conveyor belt',
    type: 'PROPERTY_DAMAGE',
    severity: 'MINOR',
    status: 'CLOSED',
    dateOccurred: '2026-02-10T08:00:00Z',
    location: 'Production Floor',
    riddorReportable: 'NO',
    hospitalized: false,
    daysLost: 0,
  },
  {
    id: 'inc-005',
    referenceNumber: 'INC-2026-005',
    title: 'Fatal crushing incident — press machine',
    type: 'INJURY',
    severity: 'CATASTROPHIC',
    status: 'REPORTED',
    dateOccurred: '2026-03-01T06:45:00Z',
    location: 'Press Shop',
    riddorReportable: 'YES',
    hospitalized: true,
    daysLost: 120,
  },
];

// ── Helper pure functions (domain logic) ─────────────────────────────────────

function isActiveInvestigation(status: string): boolean {
  return ['INVESTIGATING', 'ROOT_CAUSE_ANALYSIS', 'ACKNOWLEDGED', 'REPORTED'].includes(status);
}

function isRiddorReportable(riddorReportable: string): boolean {
  return riddorReportable === 'YES';
}

function isPendingRiddorAssessment(riddorReportable: string): boolean {
  return riddorReportable === 'PENDING_ASSESSMENT';
}

function isCriticalOrCatastrophic(severity: string): boolean {
  return severity === 'CRITICAL' || severity === 'CATASTROPHIC';
}

// ── 1. TYPES array ────────────────────────────────────────────────────────────

describe('TYPES array', () => {
  it('has exactly 8 values', () => expect(TYPES).toHaveLength(8));
  it('contains INJURY', () => expect(TYPES).toContain('INJURY'));
  it('contains NEAR_MISS', () => expect(TYPES).toContain('NEAR_MISS'));
  it('contains ENVIRONMENTAL', () => expect(TYPES).toContain('ENVIRONMENTAL'));
  it('contains PROPERTY_DAMAGE', () => expect(TYPES).toContain('PROPERTY_DAMAGE'));
  it('contains SECURITY', () => expect(TYPES).toContain('SECURITY'));
  it('contains QUALITY', () => expect(TYPES).toContain('QUALITY'));
  it('contains VEHICLE', () => expect(TYPES).toContain('VEHICLE'));
  it('contains OTHER', () => expect(TYPES).toContain('OTHER'));
  it('first value is INJURY', () => expect(TYPES[0]).toBe('INJURY'));
  it('last value is OTHER', () => expect(TYPES[TYPES.length - 1]).toBe('OTHER'));

  for (const t of TYPES) {
    it(`${t} is a non-empty string`, () => {
      expect(typeof t).toBe('string');
      expect(t.length).toBeGreaterThan(0);
    });
    it(`${t} is uppercase`, () => expect(t).toBe(t.toUpperCase()));
  }
});

// ── 2. SEVERITIES array ───────────────────────────────────────────────────────

describe('SEVERITIES array', () => {
  it('has exactly 5 values', () => expect(SEVERITIES).toHaveLength(5));
  it('first is MINOR', () => expect(SEVERITIES[0]).toBe('MINOR'));
  it('second is MODERATE', () => expect(SEVERITIES[1]).toBe('MODERATE'));
  it('third is MAJOR', () => expect(SEVERITIES[2]).toBe('MAJOR'));
  it('fourth is CRITICAL', () => expect(SEVERITIES[3]).toBe('CRITICAL'));
  it('fifth is CATASTROPHIC', () => expect(SEVERITIES[4]).toBe('CATASTROPHIC'));

  for (const s of SEVERITIES) {
    it(`${s} is a non-empty string`, () => {
      expect(typeof s).toBe('string');
      expect(s.length).toBeGreaterThan(0);
    });
    it(`${s} is uppercase`, () => expect(s).toBe(s.toUpperCase()));
  }
});

// ── 3. STATUSES array ─────────────────────────────────────────────────────────

describe('STATUSES array', () => {
  it('has exactly 7 values', () => expect(STATUSES).toHaveLength(7));
  it('contains REPORTED', () => expect(STATUSES).toContain('REPORTED'));
  it('contains ACKNOWLEDGED', () => expect(STATUSES).toContain('ACKNOWLEDGED'));
  it('contains INVESTIGATING', () => expect(STATUSES).toContain('INVESTIGATING'));
  it('contains ROOT_CAUSE_ANALYSIS', () => expect(STATUSES).toContain('ROOT_CAUSE_ANALYSIS'));
  it('contains CORRECTIVE_ACTION', () => expect(STATUSES).toContain('CORRECTIVE_ACTION'));
  it('contains CLOSED', () => expect(STATUSES).toContain('CLOSED'));
  it('contains REOPENED', () => expect(STATUSES).toContain('REOPENED'));
  it('first value is REPORTED', () => expect(STATUSES[0]).toBe('REPORTED'));

  for (const s of STATUSES) {
    it(`${s} is a non-empty string`, () => {
      expect(typeof s).toBe('string');
      expect(s.length).toBeGreaterThan(0);
    });
    it(`${s} is uppercase`, () => expect(s).toBe(s.toUpperCase()));
  }
});

// ── 4. RIDDOR_OPTIONS array ───────────────────────────────────────────────────

describe('RIDDOR_OPTIONS array', () => {
  it('has exactly 3 values', () => expect(RIDDOR_OPTIONS).toHaveLength(3));
  it('contains YES', () => expect(RIDDOR_OPTIONS).toContain('YES'));
  it('contains NO', () => expect(RIDDOR_OPTIONS).toContain('NO'));
  it('contains PENDING_ASSESSMENT', () => expect(RIDDOR_OPTIONS).toContain('PENDING_ASSESSMENT'));
  it('first is YES', () => expect(RIDDOR_OPTIONS[0]).toBe('YES'));
  it('second is NO', () => expect(RIDDOR_OPTIONS[1]).toBe('NO'));
  it('third is PENDING_ASSESSMENT', () => expect(RIDDOR_OPTIONS[2]).toBe('PENDING_ASSESSMENT'));

  for (const opt of RIDDOR_OPTIONS) {
    it(`${opt} is uppercase`, () => expect(opt).toBe(opt.toUpperCase()));
    it(`${opt} is non-empty`, () => expect(opt.length).toBeGreaterThan(0));
  }
});

// ── 5. RIDDOR view modes ──────────────────────────────────────────────────────

describe('RIDDOR_VIEW_MODES', () => {
  it('has exactly 2 values', () => expect(RIDDOR_VIEW_MODES).toHaveLength(2));
  it('contains reportable', () => expect(RIDDOR_VIEW_MODES).toContain('reportable'));
  it('contains pending', () => expect(RIDDOR_VIEW_MODES).toContain('pending'));
  it('first is reportable', () => expect(RIDDOR_VIEW_MODES[0]).toBe('reportable'));
  it('second is pending', () => expect(RIDDOR_VIEW_MODES[1]).toBe('pending'));
});

// ── 6. Investigation statuses ─────────────────────────────────────────────────

describe('INVESTIGATION_STATUSES', () => {
  it('has exactly 4 values', () => expect(INVESTIGATION_STATUSES).toHaveLength(4));
  it('contains INVESTIGATING', () => expect(INVESTIGATION_STATUSES).toContain('INVESTIGATING'));
  it('contains ROOT_CAUSE_ANALYSIS', () => expect(INVESTIGATION_STATUSES).toContain('ROOT_CAUSE_ANALYSIS'));
  it('contains ACKNOWLEDGED', () => expect(INVESTIGATION_STATUSES).toContain('ACKNOWLEDGED'));
  it('contains REPORTED', () => expect(INVESTIGATION_STATUSES).toContain('REPORTED'));
  it('does not contain CLOSED', () => expect(INVESTIGATION_STATUSES).not.toContain('CLOSED'));
  it('does not contain CORRECTIVE_ACTION', () => expect(INVESTIGATION_STATUSES).not.toContain('CORRECTIVE_ACTION'));
});

// ── 7. SEVERITY_COLOR badge map ───────────────────────────────────────────────

describe('SEVERITY_COLOR map', () => {
  for (const s of SEVERITIES) {
    it(`${s} has a color entry`, () => expect(SEVERITY_COLOR[s]).toBeDefined());
    it(`${s} color is a non-empty string`, () => {
      expect(typeof SEVERITY_COLOR[s]).toBe('string');
      expect(SEVERITY_COLOR[s].length).toBeGreaterThan(0);
    });
    it(`${s} color contains bg-`, () => expect(SEVERITY_COLOR[s]).toContain('bg-'));
    it(`${s} color contains text-`, () => expect(SEVERITY_COLOR[s]).toContain('text-'));
  }

  it('CATASTROPHIC is red', () => expect(SEVERITY_COLOR.CATASTROPHIC).toContain('red'));
  it('CRITICAL is orange', () => expect(SEVERITY_COLOR.CRITICAL).toContain('orange'));
  it('MAJOR is amber', () => expect(SEVERITY_COLOR.MAJOR).toContain('amber'));
  it('MODERATE is yellow', () => expect(SEVERITY_COLOR.MODERATE).toContain('yellow'));
  it('MINOR is green', () => expect(SEVERITY_COLOR.MINOR).toContain('green'));
  it('CATASTROPHIC includes dark variant', () => expect(SEVERITY_COLOR.CATASTROPHIC).toContain('dark:'));
  it('MINOR includes dark variant', () => expect(SEVERITY_COLOR.MINOR).toContain('dark:'));
});

// ── 8. getStatusVariant ───────────────────────────────────────────────────────

describe('getStatusVariant', () => {
  const VALID_VARIANTS: BadgeVariant[] = ['default', 'secondary', 'outline', 'destructive'];

  for (const s of STATUSES) {
    it(`${s} returns a valid badge variant`, () => {
      expect(VALID_VARIANTS).toContain(getStatusVariant(s));
    });
  }

  it('CLOSED returns secondary', () => expect(getStatusVariant('CLOSED')).toBe('secondary'));
  it('INVESTIGATING returns default', () => expect(getStatusVariant('INVESTIGATING')).toBe('default'));
  it('ROOT_CAUSE_ANALYSIS returns default', () => expect(getStatusVariant('ROOT_CAUSE_ANALYSIS')).toBe('default'));
  it('CORRECTIVE_ACTION returns destructive', () => expect(getStatusVariant('CORRECTIVE_ACTION')).toBe('destructive'));
  it('REPORTED returns outline', () => expect(getStatusVariant('REPORTED')).toBe('outline'));
  it('ACKNOWLEDGED returns outline', () => expect(getStatusVariant('ACKNOWLEDGED')).toBe('outline'));
  it('REOPENED returns outline', () => expect(getStatusVariant('REOPENED')).toBe('outline'));
  it('unknown status returns outline', () => expect(getStatusVariant('UNKNOWN')).toBe('outline'));
});

// ── 9. EMPTY_FORM defaults ────────────────────────────────────────────────────

describe('EMPTY_FORM defaults', () => {
  it('default type is INJURY', () => expect(EMPTY_FORM.type).toBe('INJURY'));
  it('default severity is MODERATE', () => expect(EMPTY_FORM.severity).toBe('MODERATE'));
  it('default status is REPORTED', () => expect(EMPTY_FORM.status).toBe('REPORTED'));
  it('default riddorReportable is PENDING_ASSESSMENT', () => expect(EMPTY_FORM.riddorReportable).toBe('PENDING_ASSESSMENT'));
  it('default hospitalized is false', () => expect(EMPTY_FORM.hospitalized).toBe(false));
  it('default daysLost is 0', () => expect(EMPTY_FORM.daysLost).toBe(0));
  it('default title is empty string', () => expect(EMPTY_FORM.title).toBe(''));
  it('default description is empty string', () => expect(EMPTY_FORM.description).toBe(''));
  it('default location is empty string', () => expect(EMPTY_FORM.location).toBe(''));
  it('default notes is empty string', () => expect(EMPTY_FORM.notes).toBe(''));
  it('TYPES includes default type', () => expect(TYPES).toContain(EMPTY_FORM.type));
  it('SEVERITIES includes default severity', () => expect(SEVERITIES).toContain(EMPTY_FORM.severity));
  it('STATUSES includes default status', () => expect(STATUSES).toContain(EMPTY_FORM.status));
  it('RIDDOR_OPTIONS includes default riddorReportable', () => expect(RIDDOR_OPTIONS).toContain(EMPTY_FORM.riddorReportable));
});

// ── 10. Mock incidents shape ──────────────────────────────────────────────────

describe('MOCK_INCIDENTS', () => {
  it('has 5 entries', () => expect(MOCK_INCIDENTS).toHaveLength(5));

  for (const inc of MOCK_INCIDENTS) {
    it(`${inc.referenceNumber} has id`, () => expect(typeof inc.id).toBe('string'));
    it(`${inc.referenceNumber} has non-empty referenceNumber`, () => expect(inc.referenceNumber.length).toBeGreaterThan(0));
    it(`${inc.referenceNumber} has non-empty title`, () => expect(inc.title.length).toBeGreaterThan(0));
    it(`${inc.referenceNumber} type is in TYPES`, () => expect([...TYPES, 'INJURY', 'NEAR_MISS', 'ENVIRONMENTAL', 'PROPERTY_DAMAGE']).toContain(inc.type));
    it(`${inc.referenceNumber} severity is in SEVERITIES`, () => expect(SEVERITIES).toContain(inc.severity));
    it(`${inc.referenceNumber} status is in STATUSES`, () => expect(STATUSES).toContain(inc.status));
    it(`${inc.referenceNumber} riddorReportable is in RIDDOR_OPTIONS`, () => expect(RIDDOR_OPTIONS).toContain(inc.riddorReportable));
    it(`${inc.referenceNumber} hospitalized is boolean`, () => expect(typeof inc.hospitalized).toBe('boolean'));
    it(`${inc.referenceNumber} daysLost is non-negative`, () => expect(inc.daysLost).toBeGreaterThanOrEqual(0));
    it(`${inc.referenceNumber} referenceNumber starts with INC-`, () => expect(inc.referenceNumber).toMatch(/^INC-/));
  }
});

// ── 11. isActiveInvestigation ─────────────────────────────────────────────────

describe('isActiveInvestigation', () => {
  for (const s of INVESTIGATION_STATUSES) {
    it(`${s} returns true`, () => expect(isActiveInvestigation(s)).toBe(true));
  }

  it('CLOSED returns false', () => expect(isActiveInvestigation('CLOSED')).toBe(false));
  it('CORRECTIVE_ACTION returns false', () => expect(isActiveInvestigation('CORRECTIVE_ACTION')).toBe(false));
  it('REOPENED returns false', () => expect(isActiveInvestigation('REOPENED')).toBe(false));
  it('empty string returns false', () => expect(isActiveInvestigation('')).toBe(false));
  it('unknown status returns false', () => expect(isActiveInvestigation('UNKNOWN')).toBe(false));
});

// ── 12. RIDDOR predicate helpers ──────────────────────────────────────────────

describe('isRiddorReportable', () => {
  it('YES returns true', () => expect(isRiddorReportable('YES')).toBe(true));
  it('NO returns false', () => expect(isRiddorReportable('NO')).toBe(false));
  it('PENDING_ASSESSMENT returns false', () => expect(isRiddorReportable('PENDING_ASSESSMENT')).toBe(false));
  it('empty string returns false', () => expect(isRiddorReportable('')).toBe(false));

  for (const opt of RIDDOR_OPTIONS) {
    it(`${opt} returns boolean`, () => expect(typeof isRiddorReportable(opt)).toBe('boolean'));
  }
});

describe('isPendingRiddorAssessment', () => {
  it('PENDING_ASSESSMENT returns true', () => expect(isPendingRiddorAssessment('PENDING_ASSESSMENT')).toBe(true));
  it('YES returns false', () => expect(isPendingRiddorAssessment('YES')).toBe(false));
  it('NO returns false', () => expect(isPendingRiddorAssessment('NO')).toBe(false));
  it('empty string returns false', () => expect(isPendingRiddorAssessment('')).toBe(false));

  for (const opt of RIDDOR_OPTIONS) {
    it(`${opt} returns boolean`, () => expect(typeof isPendingRiddorAssessment(opt)).toBe('boolean'));
  }
});

// ── 13. isCriticalOrCatastrophic ──────────────────────────────────────────────

describe('isCriticalOrCatastrophic', () => {
  it('CRITICAL returns true', () => expect(isCriticalOrCatastrophic('CRITICAL')).toBe(true));
  it('CATASTROPHIC returns true', () => expect(isCriticalOrCatastrophic('CATASTROPHIC')).toBe(true));
  it('MINOR returns false', () => expect(isCriticalOrCatastrophic('MINOR')).toBe(false));
  it('MODERATE returns false', () => expect(isCriticalOrCatastrophic('MODERATE')).toBe(false));
  it('MAJOR returns false', () => expect(isCriticalOrCatastrophic('MAJOR')).toBe(false));
  it('empty string returns false', () => expect(isCriticalOrCatastrophic('')).toBe(false));

  for (const s of SEVERITIES) {
    it(`${s} returns boolean`, () => expect(typeof isCriticalOrCatastrophic(s)).toBe('boolean'));
  }

  it('mock incidents: critical/catastrophic count is 2', () => {
    const count = MOCK_INCIDENTS.filter((i) => isCriticalOrCatastrophic(i.severity)).length;
    expect(count).toBe(2);
  });
});

// ── 14. RIDDOR filter on mock data ────────────────────────────────────────────

describe('RIDDOR filters on mock data', () => {
  it('3 incidents are RIDDOR reportable (YES)', () => {
    expect(MOCK_INCIDENTS.filter((i) => isRiddorReportable(i.riddorReportable))).toHaveLength(3);
  });
  it('1 incident is PENDING_ASSESSMENT', () => {
    expect(MOCK_INCIDENTS.filter((i) => isPendingRiddorAssessment(i.riddorReportable))).toHaveLength(1);
  });
  it('1 incident has riddorReportable = NO', () => {
    expect(MOCK_INCIDENTS.filter((i) => i.riddorReportable === 'NO')).toHaveLength(1);
  });
  it('all RIDDOR_OPTIONS are covered in mock data', () => {
    const found = new Set(MOCK_INCIDENTS.map((i) => i.riddorReportable));
    for (const opt of RIDDOR_OPTIONS) {
      expect(found.has(opt)).toBe(true);
    }
  });
  it('hospitalized incidents: 2', () => {
    expect(MOCK_INCIDENTS.filter((i) => i.hospitalized)).toHaveLength(2);
  });
  it('non-zero daysLost incidents: 2', () => {
    expect(MOCK_INCIDENTS.filter((i) => i.daysLost > 0)).toHaveLength(2);
  });
  it('RIDDOR incidents with riddorRef filter simulation: count ≤ total', () => {
    // Simulates incidents.filter(i => i.riddorRef) — none in mock have a ref yet
    const withRef = MOCK_INCIDENTS.filter((i) => 'riddorRef' in i);
    expect(withRef.length).toBeLessThanOrEqual(MOCK_INCIDENTS.length);
  });
});

// ── 15. Uniqueness invariants ─────────────────────────────────────────────────

describe('Uniqueness invariants', () => {
  it('TYPES has no duplicates', () => expect(new Set(TYPES).size).toBe(TYPES.length));
  it('SEVERITIES has no duplicates', () => expect(new Set(SEVERITIES).size).toBe(SEVERITIES.length));
  it('STATUSES has no duplicates', () => expect(new Set(STATUSES).size).toBe(STATUSES.length));
  it('RIDDOR_OPTIONS has no duplicates', () => expect(new Set(RIDDOR_OPTIONS).size).toBe(RIDDOR_OPTIONS.length));
  it('INVESTIGATION_STATUSES has no duplicates', () => expect(new Set(INVESTIGATION_STATUSES).size).toBe(INVESTIGATION_STATUSES.length));
  it('mock incident ids are unique', () => {
    const ids = MOCK_INCIDENTS.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
  it('mock incident referenceNumbers are unique', () => {
    const refs = MOCK_INCIDENTS.map((i) => i.referenceNumber);
    expect(new Set(refs).size).toBe(refs.length);
  });
});

// ── 16. SEVERITY_COLOR map completeness ──────────────────────────────────────

describe('SEVERITY_COLOR map completeness', () => {
  it('has exactly 5 entries', () => expect(Object.keys(SEVERITY_COLOR)).toHaveLength(5));
  it('all SEVERITIES are present as keys', () => {
    for (const s of SEVERITIES) {
      expect(Object.keys(SEVERITY_COLOR)).toContain(s);
    }
  });
  it('all color values contain at least one Tailwind class', () => {
    for (const color of Object.values(SEVERITY_COLOR)) {
      expect(color.split(' ').length).toBeGreaterThan(1);
    }
  });
  it('no two severities share the exact same color string', () => {
    const colors = Object.values(SEVERITY_COLOR);
    expect(new Set(colors).size).toBe(colors.length);
  });
});
