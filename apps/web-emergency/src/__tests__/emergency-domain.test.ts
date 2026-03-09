// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

// ─── Domain constants (inlined from source) ──────────────────────────────────

const INCIDENT_TYPES = [
  'FIRE',
  'FLOOD',
  'GAS_LEAK',
  'CHEMICAL_SPILL',
  'STRUCTURAL_FAILURE',
  'POWER_OUTAGE',
  'BOMB_THREAT',
  'MEDICAL_EMERGENCY',
  'CIVIL_UNREST',
  'CYBER_ATTACK',
  'PANDEMIC',
  'OTHER',
] as const;
type IncidentType = (typeof INCIDENT_TYPES)[number];

const SEVERITY_LEVELS = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;
type SeverityLevel = (typeof SEVERITY_LEVELS)[number];

const INCIDENT_STATUSES = ['ACTIVE', 'CONTROLLED', 'STANDBY', 'CLOSED'] as const;
type IncidentStatus = (typeof INCIDENT_STATUSES)[number];

const DRILL_TYPES = [
  'FULL_EVACUATION',
  'PARTIAL_EVACUATION',
  'DESKTOP_EXERCISE',
  'FIRE_WARDEN_EXERCISE',
  'LOCKDOWN_DRILL',
  'OTHER',
] as const;
type DrillType = (typeof DRILL_TYPES)[number];

const DRILL_OUTCOMES = ['PASS', 'FAIL', 'PARTIAL'] as const;
type DrillOutcome = (typeof DRILL_OUTCOMES)[number];

const FRA_RISK_RATINGS = ['LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH'] as const;
type FRArisk = (typeof FRA_RISK_RATINGS)[number];

const FRA_STATUSES = ['CURRENT', 'ACTION_REQUIRED', 'OVERDUE', 'NOT_COMPLETED'] as const;
type FRAStatus = (typeof FRA_STATUSES)[number];

const BCP_STATUSES = ['DRAFT', 'APPROVED', 'ACTIVE', 'UNDER_REVIEW', 'ARCHIVED'] as const;
type BCPStatus = (typeof BCP_STATUSES)[number];

// ─── Badge / colour maps (inlined from source) ────────────────────────────────

const SEVERITY_STYLES: Record<SeverityLevel, string> = {
  LOW: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  MEDIUM: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  HIGH: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  CRITICAL: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
};

const RISK_COLORS: Record<FRAisk, string> = {
  LOW: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  MEDIUM: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  HIGH: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  VERY_HIGH: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
};

const BCP_STATUS_STYLES: Record<BCPStatus, { style: string; label: string }> = {
  DRAFT: { style: 'bg-gray-100 text-gray-600', label: 'Draft' },
  APPROVED: { style: 'bg-green-100 text-green-800', label: 'Approved' },
  ACTIVE: { style: 'bg-blue-100 text-blue-800', label: 'Active' },
  UNDER_REVIEW: { style: 'bg-amber-100 text-amber-800', label: 'Under Review' },
  ARCHIVED: { style: 'bg-gray-100 text-gray-500', label: 'Archived' },
};

// ─── Type icon map (inlined from source) ─────────────────────────────────────

const TYPE_ICONS: Record<IncidentType, string> = {
  FIRE: '🔥',
  FLOOD: '🌊',
  GAS_LEAK: '💨',
  CHEMICAL_SPILL: '⚗️',
  STRUCTURAL_FAILURE: '🏗️',
  POWER_OUTAGE: '⚡',
  BOMB_THREAT: '💣',
  MEDICAL_EMERGENCY: '🏥',
  CIVIL_UNREST: '⚠️',
  CYBER_ATTACK: '💻',
  PANDEMIC: '🦠',
  OTHER: '⚠️',
};

// ─── Severity rank ordering ───────────────────────────────────────────────────

const severityRank: Record<SeverityLevel, number> = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
  CRITICAL: 4,
};

// ─── Domain helpers (inlined / derived from business logic) ──────────────────

function isCriticalIncident(severity: SeverityLevel): boolean {
  return severity === 'CRITICAL';
}

function requiresEvacuation(type: IncidentType): boolean {
  return (
    type === 'FIRE' ||
    type === 'FLOOD' ||
    type === 'GAS_LEAK' ||
    type === 'CHEMICAL_SPILL' ||
    type === 'STRUCTURAL_FAILURE' ||
    type === 'BOMB_THREAT' ||
    type === 'PANDEMIC'
  );
}

function isActiveIncident(status: IncidentStatus): boolean {
  return status === 'ACTIVE';
}

function isOpenIncident(status: IncidentStatus): boolean {
  return status === 'ACTIVE' || status === 'CONTROLLED' || status === 'STANDBY';
}

/** elapsed time helpers (mirrors source elapsed() function) */
function elapsedMinutes(declaredAt: Date, now: Date): number {
  return Math.floor((now.getTime() - declaredAt.getTime()) / 60000);
}

function elapsedLabel(declaredAt: Date, now: Date): string {
  const mins = elapsedMinutes(declaredAt, now);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

/** Drill pass rate (mirrors analytics card) */
function passRate(drills: { outcome: DrillOutcome }[]): number {
  if (drills.length === 0) return 0;
  const passes = drills.filter((d) => d.outcome === 'PASS').length;
  return Math.round((passes / drills.length) * 100);
}

/** Evacuation time met */
function evacuationTimeMet(actual: number, target: number): boolean {
  return actual <= target;
}

/** BCP is approved or active (mirrors dashboard aggregate) */
function isBCPLive(status: BCPStatus): boolean {
  return status === 'APPROVED' || status === 'ACTIVE';
}

/** FRA is overdue or action required */
function fraRequiresAttention(status: FRAStatus): boolean {
  return status === 'OVERDUE' || status === 'ACTION_REQUIRED';
}

// ─── Mock data shapes ─────────────────────────────────────────────────────────

interface MockIncident {
  id: string;
  referenceNumber: string;
  title: string;
  type: IncidentType;
  severity: SeverityLevel;
  status: IncidentStatus;
  premisesName: string;
  declaredAt: string;
  closedAt: string | null;
  commanderName: string;
}

interface MockDrill {
  id: string;
  referenceNumber: string;
  premisesName: string;
  drillDate: string;
  drillType: DrillType;
  participantCount: number;
  evacuationTime: number | null;
  targetEvacuationTime: number | null;
  outcome: DrillOutcome;
  conductedBy: string;
}

interface MockFRA {
  id: string;
  referenceNumber: string;
  premisesName: string;
  assessorName: string;
  assessmentDate: string;
  reviewDate: string;
  status: FRAStatus;
  overallRiskRating: FRAisk;
  findingsCount: number;
  actionsOpen: number;
}

interface MockBCP {
  id: string;
  referenceNumber: string;
  title: string;
  status: BCPStatus;
  ownerName: string;
  lastTestedDate: string | null;
  nextTestDue: string | null;
  crisisTeamSize: number;
}

const mockIncidents: MockIncident[] = [
  {
    id: 'i-001',
    referenceNumber: 'EM-INC-2026-001',
    title: 'Kitchen Fire - Level 2',
    type: 'FIRE',
    severity: 'HIGH',
    status: 'ACTIVE',
    premisesName: 'Head Office',
    declaredAt: '2026-03-09T08:30:00.000Z',
    closedAt: null,
    commanderName: 'James Ward',
  },
  {
    id: 'i-002',
    referenceNumber: 'EM-INC-2026-002',
    title: 'Chemical Storage Leak',
    type: 'CHEMICAL_SPILL',
    severity: 'CRITICAL',
    status: 'CONTROLLED',
    premisesName: 'Warehouse B',
    declaredAt: '2026-03-08T14:00:00.000Z',
    closedAt: null,
    commanderName: 'Alice Brown',
  },
  {
    id: 'i-003',
    referenceNumber: 'EM-INC-2025-089',
    title: 'Power Failure - Server Room',
    type: 'POWER_OUTAGE',
    severity: 'MEDIUM',
    status: 'CLOSED',
    premisesName: 'Data Centre',
    declaredAt: '2025-11-20T02:15:00.000Z',
    closedAt: '2025-11-20T06:00:00.000Z',
    commanderName: 'Tech Lead',
  },
];

const mockDrills: MockDrill[] = [
  {
    id: 'd-001',
    referenceNumber: 'EM-DRL-2026-001',
    premisesName: 'Head Office',
    drillDate: '2026-02-15T09:00:00.000Z',
    drillType: 'FULL_EVACUATION',
    participantCount: 120,
    evacuationTime: 4,
    targetEvacuationTime: 5,
    outcome: 'PASS',
    conductedBy: 'Fire Warden Lead',
  },
  {
    id: 'd-002',
    referenceNumber: 'EM-DRL-2026-002',
    premisesName: 'Warehouse B',
    drillDate: '2026-01-20T14:00:00.000Z',
    drillType: 'PARTIAL_EVACUATION',
    participantCount: 45,
    evacuationTime: 8,
    targetEvacuationTime: 6,
    outcome: 'FAIL',
    conductedBy: 'Safety Officer',
  },
  {
    id: 'd-003',
    referenceNumber: 'EM-DRL-2025-018',
    premisesName: 'Head Office',
    drillDate: '2025-09-10T10:30:00.000Z',
    drillType: 'DESKTOP_EXERCISE',
    participantCount: 20,
    evacuationTime: null,
    targetEvacuationTime: null,
    outcome: 'PARTIAL',
    conductedBy: 'EHS Manager',
  },
];

const mockFRAs: MockFRA[] = [
  {
    id: 'f-001',
    referenceNumber: 'EM-FRA-2026-001',
    premisesName: 'Head Office',
    assessorName: 'John Miles',
    assessmentDate: '2026-01-10T00:00:00.000Z',
    reviewDate: '2027-01-10T00:00:00.000Z',
    status: 'CURRENT',
    overallRiskRating: 'MEDIUM',
    findingsCount: 5,
    actionsOpen: 2,
  },
  {
    id: 'f-002',
    referenceNumber: 'EM-FRA-2025-003',
    premisesName: 'Warehouse B',
    assessorName: 'Sara Lee',
    assessmentDate: '2024-10-01T00:00:00.000Z',
    reviewDate: '2025-10-01T00:00:00.000Z',
    status: 'OVERDUE',
    overallRiskRating: 'HIGH',
    findingsCount: 12,
    actionsOpen: 7,
  },
];

const mockBCPs: MockBCP[] = [
  {
    id: 'b-001',
    referenceNumber: 'EM-BCP-2026-001',
    title: 'IT Disaster Recovery Plan',
    status: 'ACTIVE',
    ownerName: 'CTO',
    lastTestedDate: '2025-11-01T00:00:00.000Z',
    nextTestDue: '2026-11-01T00:00:00.000Z',
    crisisTeamSize: 8,
  },
  {
    id: 'b-002',
    referenceNumber: 'EM-BCP-2026-002',
    title: 'Pandemic Response Plan',
    status: 'DRAFT',
    ownerName: 'HR Director',
    lastTestedDate: null,
    nextTestDue: null,
    crisisTeamSize: 5,
  },
];

// ═════════════════════════════════════════════════════════════════════════════
// TEST SUITES
// ═════════════════════════════════════════════════════════════════════════════

describe('INCIDENT_TYPES array', () => {
  it('has 12 members', () => expect(INCIDENT_TYPES.length).toBe(12));
  it('contains FIRE', () => expect(INCIDENT_TYPES).toContain('FIRE'));
  it('contains FLOOD', () => expect(INCIDENT_TYPES).toContain('FLOOD'));
  it('contains GAS_LEAK', () => expect(INCIDENT_TYPES).toContain('GAS_LEAK'));
  it('contains CHEMICAL_SPILL', () => expect(INCIDENT_TYPES).toContain('CHEMICAL_SPILL'));
  it('contains STRUCTURAL_FAILURE', () => expect(INCIDENT_TYPES).toContain('STRUCTURAL_FAILURE'));
  it('contains POWER_OUTAGE', () => expect(INCIDENT_TYPES).toContain('POWER_OUTAGE'));
  it('contains BOMB_THREAT', () => expect(INCIDENT_TYPES).toContain('BOMB_THREAT'));
  it('contains MEDICAL_EMERGENCY', () => expect(INCIDENT_TYPES).toContain('MEDICAL_EMERGENCY'));
  it('contains CIVIL_UNREST', () => expect(INCIDENT_TYPES).toContain('CIVIL_UNREST'));
  it('contains CYBER_ATTACK', () => expect(INCIDENT_TYPES).toContain('CYBER_ATTACK'));
  it('contains PANDEMIC', () => expect(INCIDENT_TYPES).toContain('PANDEMIC'));
  it('contains OTHER', () => expect(INCIDENT_TYPES).toContain('OTHER'));
  for (const t of INCIDENT_TYPES) {
    it(`${t} is uppercase string`, () => expect(t).toMatch(/^[A-Z_]+$/));
  }
});

describe('SEVERITY_LEVELS array', () => {
  it('has 4 members', () => expect(SEVERITY_LEVELS.length).toBe(4));
  it('contains LOW', () => expect(SEVERITY_LEVELS).toContain('LOW'));
  it('contains MEDIUM', () => expect(SEVERITY_LEVELS).toContain('MEDIUM'));
  it('contains HIGH', () => expect(SEVERITY_LEVELS).toContain('HIGH'));
  it('contains CRITICAL', () => expect(SEVERITY_LEVELS).toContain('CRITICAL'));
  for (const s of SEVERITY_LEVELS) {
    it(`${s} is non-empty string`, () => expect(s.length).toBeGreaterThan(0));
  }
});

describe('INCIDENT_STATUSES array', () => {
  it('has 4 members', () => expect(INCIDENT_STATUSES.length).toBe(4));
  it('contains ACTIVE', () => expect(INCIDENT_STATUSES).toContain('ACTIVE'));
  it('contains CONTROLLED', () => expect(INCIDENT_STATUSES).toContain('CONTROLLED'));
  it('contains STANDBY', () => expect(INCIDENT_STATUSES).toContain('STANDBY'));
  it('contains CLOSED', () => expect(INCIDENT_STATUSES).toContain('CLOSED'));
});

describe('DRILL_TYPES array', () => {
  it('has 6 members', () => expect(DRILL_TYPES.length).toBe(6));
  it('contains FULL_EVACUATION', () => expect(DRILL_TYPES).toContain('FULL_EVACUATION'));
  it('contains PARTIAL_EVACUATION', () => expect(DRILL_TYPES).toContain('PARTIAL_EVACUATION'));
  it('contains DESKTOP_EXERCISE', () => expect(DRILL_TYPES).toContain('DESKTOP_EXERCISE'));
  it('contains FIRE_WARDEN_EXERCISE', () => expect(DRILL_TYPES).toContain('FIRE_WARDEN_EXERCISE'));
  it('contains LOCKDOWN_DRILL', () => expect(DRILL_TYPES).toContain('LOCKDOWN_DRILL'));
  it('contains OTHER', () => expect(DRILL_TYPES).toContain('OTHER'));
  for (const t of DRILL_TYPES) {
    it(`${t} matches UPPER_SNAKE_CASE`, () => expect(t).toMatch(/^[A-Z_]+$/));
  }
});

describe('DRILL_OUTCOMES array', () => {
  it('has 3 members', () => expect(DRILL_OUTCOMES.length).toBe(3));
  it('contains PASS', () => expect(DRILL_OUTCOMES).toContain('PASS'));
  it('contains FAIL', () => expect(DRILL_OUTCOMES).toContain('FAIL'));
  it('contains PARTIAL', () => expect(DRILL_OUTCOMES).toContain('PARTIAL'));
});

describe('FRA_RISK_RATINGS array', () => {
  it('has 4 members', () => expect(FRA_RISK_RATINGS.length).toBe(4));
  it('contains LOW', () => expect(FRA_RISK_RATINGS).toContain('LOW'));
  it('contains MEDIUM', () => expect(FRA_RISK_RATINGS).toContain('MEDIUM'));
  it('contains HIGH', () => expect(FRA_RISK_RATINGS).toContain('HIGH'));
  it('contains VERY_HIGH', () => expect(FRA_RISK_RATINGS).toContain('VERY_HIGH'));
});

describe('BCP_STATUSES array', () => {
  it('has 5 members', () => expect(BCP_STATUSES.length).toBe(5));
  it('contains DRAFT', () => expect(BCP_STATUSES).toContain('DRAFT'));
  it('contains APPROVED', () => expect(BCP_STATUSES).toContain('APPROVED'));
  it('contains ACTIVE', () => expect(BCP_STATUSES).toContain('ACTIVE'));
  it('contains UNDER_REVIEW', () => expect(BCP_STATUSES).toContain('UNDER_REVIEW'));
  it('contains ARCHIVED', () => expect(BCP_STATUSES).toContain('ARCHIVED'));
});

describe('SEVERITY_STYLES badge map', () => {
  for (const level of SEVERITY_LEVELS) {
    it(`${level} has a style class`, () => expect(SEVERITY_STYLES[level]).toBeDefined());
    it(`${level} style contains bg-`, () => expect(SEVERITY_STYLES[level]).toContain('bg-'));
    it(`${level} style contains text-`, () => expect(SEVERITY_STYLES[level]).toContain('text-'));
  }
  it('CRITICAL uses red', () => expect(SEVERITY_STYLES.CRITICAL).toContain('red'));
  it('HIGH uses orange', () => expect(SEVERITY_STYLES.HIGH).toContain('orange'));
  it('MEDIUM uses amber', () => expect(SEVERITY_STYLES.MEDIUM).toContain('amber'));
  it('LOW uses green', () => expect(SEVERITY_STYLES.LOW).toContain('green'));
});

describe('RISK_COLORS badge map (FRA)', () => {
  for (const rating of FRA_RISK_RATINGS) {
    it(`${rating} has a color class`, () => expect(RISK_COLORS[rating]).toBeDefined());
    it(`${rating} color contains bg-`, () => expect(RISK_COLORS[rating]).toContain('bg-'));
  }
  it('VERY_HIGH uses red', () => expect(RISK_COLORS.VERY_HIGH).toContain('red'));
  it('HIGH uses orange', () => expect(RISK_COLORS.HIGH).toContain('orange'));
  it('MEDIUM uses amber', () => expect(RISK_COLORS.MEDIUM).toContain('amber'));
  it('LOW uses green', () => expect(RISK_COLORS.LOW).toContain('green'));
});

describe('BCP_STATUS_STYLES badge map', () => {
  for (const status of BCP_STATUSES) {
    it(`${status} has style`, () => expect(BCP_STATUS_STYLES[status].style).toBeTruthy());
    it(`${status} has label`, () => expect(BCP_STATUS_STYLES[status].label.length).toBeGreaterThan(0));
    it(`${status} style contains bg-`, () => expect(BCP_STATUS_STYLES[status].style).toContain('bg-'));
  }
  it('APPROVED label is "Approved"', () => expect(BCP_STATUS_STYLES.APPROVED.label).toBe('Approved'));
  it('ACTIVE label is "Active"', () => expect(BCP_STATUS_STYLES.ACTIVE.label).toBe('Active'));
  it('DRAFT label is "Draft"', () => expect(BCP_STATUS_STYLES.DRAFT.label).toBe('Draft'));
  it('APPROVED uses green', () => expect(BCP_STATUS_STYLES.APPROVED.style).toContain('green'));
});

describe('TYPE_ICONS map', () => {
  for (const type of INCIDENT_TYPES) {
    it(`${type} has an icon`, () => expect(TYPE_ICONS[type]).toBeDefined());
    it(`${type} icon is a non-empty string`, () => expect(TYPE_ICONS[type].length).toBeGreaterThan(0));
  }
  it('FIRE icon is 🔥', () => expect(TYPE_ICONS.FIRE).toBe('🔥'));
  it('FLOOD icon is 🌊', () => expect(TYPE_ICONS.FLOOD).toBe('🌊'));
  it('MEDICAL_EMERGENCY icon is 🏥', () => expect(TYPE_ICONS.MEDICAL_EMERGENCY).toBe('🏥'));
  it('CYBER_ATTACK icon is 💻', () => expect(TYPE_ICONS.CYBER_ATTACK).toBe('💻'));
  it('PANDEMIC icon is 🦠', () => expect(TYPE_ICONS.PANDEMIC).toBe('🦠'));
});

describe('severityRank ordering', () => {
  it('LOW = 1', () => expect(severityRank.LOW).toBe(1));
  it('MEDIUM = 2', () => expect(severityRank.MEDIUM).toBe(2));
  it('HIGH = 3', () => expect(severityRank.HIGH).toBe(3));
  it('CRITICAL = 4', () => expect(severityRank.CRITICAL).toBe(4));
  it('LOW < MEDIUM < HIGH < CRITICAL (monotone)', () => {
    expect(severityRank.LOW).toBeLessThan(severityRank.MEDIUM);
    expect(severityRank.MEDIUM).toBeLessThan(severityRank.HIGH);
    expect(severityRank.HIGH).toBeLessThan(severityRank.CRITICAL);
  });
  for (const level of SEVERITY_LEVELS) {
    it(`${level} rank is positive`, () => expect(severityRank[level]).toBeGreaterThan(0));
    it(`${level} rank is a number`, () => expect(typeof severityRank[level]).toBe('number'));
  }
});

describe('isCriticalIncident helper', () => {
  it('CRITICAL is critical', () => expect(isCriticalIncident('CRITICAL')).toBe(true));
  it('HIGH is not critical', () => expect(isCriticalIncident('HIGH')).toBe(false));
  it('MEDIUM is not critical', () => expect(isCriticalIncident('MEDIUM')).toBe(false));
  it('LOW is not critical', () => expect(isCriticalIncident('LOW')).toBe(false));
  for (const level of SEVERITY_LEVELS) {
    it(`isCriticalIncident(${level}) returns boolean`, () => expect(typeof isCriticalIncident(level)).toBe('boolean'));
  }
});

describe('requiresEvacuation helper', () => {
  it('FIRE requires evacuation', () => expect(requiresEvacuation('FIRE')).toBe(true));
  it('FLOOD requires evacuation', () => expect(requiresEvacuation('FLOOD')).toBe(true));
  it('GAS_LEAK requires evacuation', () => expect(requiresEvacuation('GAS_LEAK')).toBe(true));
  it('CHEMICAL_SPILL requires evacuation', () => expect(requiresEvacuation('CHEMICAL_SPILL')).toBe(true));
  it('STRUCTURAL_FAILURE requires evacuation', () => expect(requiresEvacuation('STRUCTURAL_FAILURE')).toBe(true));
  it('BOMB_THREAT requires evacuation', () => expect(requiresEvacuation('BOMB_THREAT')).toBe(true));
  it('PANDEMIC requires evacuation', () => expect(requiresEvacuation('PANDEMIC')).toBe(true));
  it('MEDICAL_EMERGENCY does not require evacuation', () => expect(requiresEvacuation('MEDICAL_EMERGENCY')).toBe(false));
  it('CIVIL_UNREST does not require evacuation', () => expect(requiresEvacuation('CIVIL_UNREST')).toBe(false));
  it('CYBER_ATTACK does not require evacuation', () => expect(requiresEvacuation('CYBER_ATTACK')).toBe(false));
  it('POWER_OUTAGE does not require evacuation', () => expect(requiresEvacuation('POWER_OUTAGE')).toBe(false));
  it('OTHER does not require evacuation', () => expect(requiresEvacuation('OTHER')).toBe(false));
  for (const t of INCIDENT_TYPES) {
    it(`requiresEvacuation(${t}) returns boolean`, () => expect(typeof requiresEvacuation(t)).toBe('boolean'));
  }
});

describe('isActiveIncident helper', () => {
  it('ACTIVE is active', () => expect(isActiveIncident('ACTIVE')).toBe(true));
  it('CONTROLLED is not active', () => expect(isActiveIncident('CONTROLLED')).toBe(false));
  it('STANDBY is not active', () => expect(isActiveIncident('STANDBY')).toBe(false));
  it('CLOSED is not active', () => expect(isActiveIncident('CLOSED')).toBe(false));
  for (const s of INCIDENT_STATUSES) {
    it(`isActiveIncident(${s}) returns boolean`, () => expect(typeof isActiveIncident(s)).toBe('boolean'));
  }
});

describe('isOpenIncident helper', () => {
  it('ACTIVE is open', () => expect(isOpenIncident('ACTIVE')).toBe(true));
  it('CONTROLLED is open', () => expect(isOpenIncident('CONTROLLED')).toBe(true));
  it('STANDBY is open', () => expect(isOpenIncident('STANDBY')).toBe(true));
  it('CLOSED is not open', () => expect(isOpenIncident('CLOSED')).toBe(false));
  for (const s of INCIDENT_STATUSES) {
    it(`isOpenIncident(${s}) returns boolean`, () => expect(typeof isOpenIncident(s)).toBe('boolean'));
  }
});

describe('elapsedMinutes / elapsedLabel helpers', () => {
  const BASE = new Date('2026-03-09T10:00:00.000Z');

  it('elapsed 30 minutes = 30', () => {
    const start = new Date(BASE.getTime() - 30 * 60000);
    expect(elapsedMinutes(start, BASE)).toBe(30);
  });

  it('elapsed 90 minutes → "1h" label', () => {
    const start = new Date(BASE.getTime() - 90 * 60000);
    expect(elapsedLabel(start, BASE)).toBe('1h');
  });

  it('elapsed 45 minutes → "45m" label', () => {
    const start = new Date(BASE.getTime() - 45 * 60000);
    expect(elapsedLabel(start, BASE)).toBe('45m');
  });

  it('elapsed 25 hours → "1d" label', () => {
    const start = new Date(BASE.getTime() - 25 * 3600000);
    expect(elapsedLabel(start, BASE)).toBe('1d');
  });

  it('elapsed 0 minutes = 0', () => {
    expect(elapsedMinutes(BASE, BASE)).toBe(0);
  });

  for (let m = 1; m <= 10; m++) {
    it(`elapsedMinutes for ${m}m returns ${m}`, () => {
      const start = new Date(BASE.getTime() - m * 60000);
      expect(elapsedMinutes(start, BASE)).toBe(m);
    });
  }
});

describe('evacuationTimeMet helper', () => {
  it('actual <= target is met', () => expect(evacuationTimeMet(4, 5)).toBe(true));
  it('actual = target is met', () => expect(evacuationTimeMet(5, 5)).toBe(true));
  it('actual > target is not met', () => expect(evacuationTimeMet(8, 6)).toBe(false));
  for (let target = 1; target <= 10; target++) {
    it(`target ${target}: actual=${target - 1} is met`, () => expect(evacuationTimeMet(target - 1, target)).toBe(true));
    it(`target ${target}: actual=${target + 1} is not met`, () => expect(evacuationTimeMet(target + 1, target)).toBe(false));
  }
});

describe('passRate helper', () => {
  it('empty drills → 0%', () => expect(passRate([])).toBe(0));
  it('all pass → 100%', () => {
    const drills = [{ outcome: 'PASS' as DrillOutcome }, { outcome: 'PASS' as DrillOutcome }];
    expect(passRate(drills)).toBe(100);
  });
  it('all fail → 0%', () => {
    const drills = [{ outcome: 'FAIL' as DrillOutcome }, { outcome: 'FAIL' as DrillOutcome }];
    expect(passRate(drills)).toBe(0);
  });
  it('1 pass 1 fail → 50%', () => {
    const drills = [{ outcome: 'PASS' as DrillOutcome }, { outcome: 'FAIL' as DrillOutcome }];
    expect(passRate(drills)).toBe(50);
  });
  it('2 pass 1 fail → 67%', () => {
    const drills = [
      { outcome: 'PASS' as DrillOutcome },
      { outcome: 'PASS' as DrillOutcome },
      { outcome: 'FAIL' as DrillOutcome },
    ];
    expect(passRate(drills)).toBe(67);
  });
  it('result is between 0 and 100', () => {
    const drills = [
      { outcome: 'PASS' as DrillOutcome },
      { outcome: 'FAIL' as DrillOutcome },
      { outcome: 'PARTIAL' as DrillOutcome },
    ];
    const rate = passRate(drills);
    expect(rate).toBeGreaterThanOrEqual(0);
    expect(rate).toBeLessThanOrEqual(100);
  });
});

describe('isBCPLive helper', () => {
  it('APPROVED is live', () => expect(isBCPLive('APPROVED')).toBe(true));
  it('ACTIVE is live', () => expect(isBCPLive('ACTIVE')).toBe(true));
  it('DRAFT is not live', () => expect(isBCPLive('DRAFT')).toBe(false));
  it('UNDER_REVIEW is not live', () => expect(isBCPLive('UNDER_REVIEW')).toBe(false));
  it('ARCHIVED is not live', () => expect(isBCPLive('ARCHIVED')).toBe(false));
  for (const s of BCP_STATUSES) {
    it(`isBCPLive(${s}) returns boolean`, () => expect(typeof isBCPLive(s)).toBe('boolean'));
  }
});

describe('fraRequiresAttention helper', () => {
  it('OVERDUE requires attention', () => expect(fraRequiresAttention('OVERDUE')).toBe(true));
  it('ACTION_REQUIRED requires attention', () => expect(fraRequiresAttention('ACTION_REQUIRED')).toBe(true));
  it('CURRENT does not require attention', () => expect(fraRequiresAttention('CURRENT')).toBe(false));
  it('NOT_COMPLETED does not require attention', () => expect(fraRequiresAttention('NOT_COMPLETED')).toBe(false));
  for (const s of FRA_STATUSES) {
    it(`fraRequiresAttention(${s}) returns boolean`, () => expect(typeof fraRequiresAttention(s)).toBe('boolean'));
  }
});

describe('mock incidents data shapes', () => {
  it('mockIncidents has 3 entries', () => expect(mockIncidents.length).toBe(3));

  for (const inc of mockIncidents) {
    it(`incident ${inc.id} has id`, () => expect(inc.id).toBeTruthy());
    it(`incident ${inc.id} has referenceNumber`, () => expect(inc.referenceNumber).toBeTruthy());
    it(`incident ${inc.id} title is non-empty`, () => expect(inc.title.length).toBeGreaterThan(0));
    it(`incident ${inc.id} type is valid`, () => expect(INCIDENT_TYPES as readonly string[]).toContain(inc.type));
    it(`incident ${inc.id} severity is valid`, () => expect(SEVERITY_LEVELS as readonly string[]).toContain(inc.severity));
    it(`incident ${inc.id} status is valid`, () => expect(INCIDENT_STATUSES as readonly string[]).toContain(inc.status));
    it(`incident ${inc.id} declaredAt is ISO string`, () => expect(inc.declaredAt).toMatch(/^\d{4}-\d{2}-\d{2}T/));
    it(`incident ${inc.id} premisesName is non-empty`, () => expect(inc.premisesName.length).toBeGreaterThan(0));
  }
});

describe('mock drills data shapes', () => {
  it('mockDrills has 3 entries', () => expect(mockDrills.length).toBe(3));

  for (const drill of mockDrills) {
    it(`drill ${drill.id} has id`, () => expect(drill.id).toBeTruthy());
    it(`drill ${drill.id} has referenceNumber`, () => expect(drill.referenceNumber).toBeTruthy());
    it(`drill ${drill.id} drillType is valid`, () => expect(DRILL_TYPES as readonly string[]).toContain(drill.drillType));
    it(`drill ${drill.id} outcome is valid`, () => expect(DRILL_OUTCOMES as readonly string[]).toContain(drill.outcome));
    it(`drill ${drill.id} participantCount is non-negative`, () => expect(drill.participantCount).toBeGreaterThanOrEqual(0));
    it(`drill ${drill.id} drillDate is ISO string`, () => expect(drill.drillDate).toMatch(/^\d{4}-\d{2}-\d{2}T/));
  }
});

describe('mock FRA data shapes', () => {
  it('mockFRAs has 2 entries', () => expect(mockFRAs.length).toBe(2));

  for (const fra of mockFRAs) {
    it(`FRA ${fra.id} has id`, () => expect(fra.id).toBeTruthy());
    it(`FRA ${fra.id} has referenceNumber`, () => expect(fra.referenceNumber).toBeTruthy());
    it(`FRA ${fra.id} status is valid`, () => expect(FRA_STATUSES as readonly string[]).toContain(fra.status));
    it(`FRA ${fra.id} overallRiskRating is valid`, () => expect(FRA_RISK_RATINGS as readonly string[]).toContain(fra.overallRiskRating));
    it(`FRA ${fra.id} findingsCount is non-negative`, () => expect(fra.findingsCount).toBeGreaterThanOrEqual(0));
    it(`FRA ${fra.id} actionsOpen is non-negative`, () => expect(fra.actionsOpen).toBeGreaterThanOrEqual(0));
  }
});

describe('mock BCP data shapes', () => {
  it('mockBCPs has 2 entries', () => expect(mockBCPs.length).toBe(2));

  for (const bcp of mockBCPs) {
    it(`BCP ${bcp.id} has id`, () => expect(bcp.id).toBeTruthy());
    it(`BCP ${bcp.id} has referenceNumber`, () => expect(bcp.referenceNumber).toBeTruthy());
    it(`BCP ${bcp.id} status is valid`, () => expect(BCP_STATUSES as readonly string[]).toContain(bcp.status));
    it(`BCP ${bcp.id} title is non-empty`, () => expect(bcp.title.length).toBeGreaterThan(0));
    it(`BCP ${bcp.id} crisisTeamSize is positive`, () => expect(bcp.crisisTeamSize).toBeGreaterThan(0));
  }
});

describe('dashboard aggregate logic (inlined)', () => {
  it('active incidents count is correct', () => {
    const count = mockIncidents.filter((i) => isActiveIncident(i.status)).length;
    expect(count).toBe(1);
  });

  it('open (non-closed) incidents count is correct', () => {
    const count = mockIncidents.filter((i) => isOpenIncident(i.status)).length;
    expect(count).toBe(2);
  });

  it('closed incidents count is correct', () => {
    const count = mockIncidents.filter((i) => i.status === 'CLOSED').length;
    expect(count).toBe(1);
  });

  it('drill pass rate for mock drills is 33%', () => {
    const rate = passRate(mockDrills.map((d) => ({ outcome: d.outcome })));
    expect(rate).toBe(33); // 1 PASS out of 3
  });

  it('FRAs requiring attention count is correct', () => {
    const count = mockFRAs.filter((f) => fraRequiresAttention(f.status)).length;
    expect(count).toBe(1); // only OVERDUE
  });

  it('live BCPs count is correct', () => {
    const count = mockBCPs.filter((b) => isBCPLive(b.status)).length;
    expect(count).toBe(1); // only ACTIVE
  });

  it('never tested BCPs count is correct', () => {
    const count = mockBCPs.filter((b) => !b.lastTestedDate).length;
    expect(count).toBe(1);
  });

  it('drill with met evacuation time — head office drill passes target', () => {
    const drill = mockDrills[0];
    expect(evacuationTimeMet(drill.evacuationTime!, drill.targetEvacuationTime!)).toBe(true);
  });

  it('drill with missed evacuation time — warehouse drill fails target', () => {
    const drill = mockDrills[1];
    expect(evacuationTimeMet(drill.evacuationTime!, drill.targetEvacuationTime!)).toBe(false);
  });

  it('critical incident in mock is chemical spill', () => {
    const critical = mockIncidents.find((i) => isCriticalIncident(i.severity));
    expect(critical?.type).toBe('CHEMICAL_SPILL');
  });

  it('FIRE incident requires evacuation', () => {
    const fire = mockIncidents.find((i) => i.type === 'FIRE');
    expect(requiresEvacuation(fire!.type)).toBe(true);
  });

  it('POWER_OUTAGE incident does not require evacuation', () => {
    const outage = mockIncidents.find((i) => i.type === 'POWER_OUTAGE');
    expect(requiresEvacuation(outage!.type)).toBe(false);
  });
});

// ─── INCIDENT_TYPES — positional index parametric ────────────────────────────

describe('INCIDENT_TYPES — positional index parametric', () => {
  const expected = [
    [0,  'FIRE'],
    [1,  'FLOOD'],
    [2,  'GAS_LEAK'],
    [3,  'CHEMICAL_SPILL'],
    [4,  'STRUCTURAL_FAILURE'],
    [5,  'POWER_OUTAGE'],
    [6,  'BOMB_THREAT'],
    [7,  'MEDICAL_EMERGENCY'],
    [8,  'CIVIL_UNREST'],
    [9,  'CYBER_ATTACK'],
    [10, 'PANDEMIC'],
    [11, 'OTHER'],
  ] as const;
  for (const [idx, val] of expected) {
    it(`INCIDENT_TYPES[${idx}] === '${val}'`, () => {
      expect(INCIDENT_TYPES[idx]).toBe(val);
    });
  }
});

// ─── SEVERITY_LEVELS — positional index parametric ───────────────────────────

describe('SEVERITY_LEVELS — positional index parametric', () => {
  const expected = [
    [0, 'LOW'],
    [1, 'MEDIUM'],
    [2, 'HIGH'],
    [3, 'CRITICAL'],
  ] as const;
  for (const [idx, val] of expected) {
    it(`SEVERITY_LEVELS[${idx}] === '${val}'`, () => {
      expect(SEVERITY_LEVELS[idx]).toBe(val);
    });
  }
});

// ─── INCIDENT_STATUSES — positional index parametric ─────────────────────────

describe('INCIDENT_STATUSES — positional index parametric', () => {
  const expected = [
    [0, 'ACTIVE'],
    [1, 'CONTROLLED'],
    [2, 'STANDBY'],
    [3, 'CLOSED'],
  ] as const;
  for (const [idx, val] of expected) {
    it(`INCIDENT_STATUSES[${idx}] === '${val}'`, () => {
      expect(INCIDENT_STATUSES[idx]).toBe(val);
    });
  }
});

// ─── DRILL_TYPES — positional index parametric ───────────────────────────────

describe('DRILL_TYPES — positional index parametric', () => {
  const expected = [
    [0, 'FULL_EVACUATION'],
    [1, 'PARTIAL_EVACUATION'],
    [2, 'DESKTOP_EXERCISE'],
    [3, 'FIRE_WARDEN_EXERCISE'],
    [4, 'LOCKDOWN_DRILL'],
    [5, 'OTHER'],
  ] as const;
  for (const [idx, val] of expected) {
    it(`DRILL_TYPES[${idx}] === '${val}'`, () => {
      expect(DRILL_TYPES[idx]).toBe(val);
    });
  }
});

// ─── DRILL_OUTCOMES — positional index parametric ────────────────────────────

describe('DRILL_OUTCOMES — positional index parametric', () => {
  const expected = [
    [0, 'PASS'],
    [1, 'FAIL'],
    [2, 'PARTIAL'],
  ] as const;
  for (const [idx, val] of expected) {
    it(`DRILL_OUTCOMES[${idx}] === '${val}'`, () => {
      expect(DRILL_OUTCOMES[idx]).toBe(val);
    });
  }
});

// ─── FRA_RISK_RATINGS — positional index parametric ──────────────────────────

describe('FRA_RISK_RATINGS — positional index parametric', () => {
  const expected = [
    [0, 'LOW'],
    [1, 'MEDIUM'],
    [2, 'HIGH'],
    [3, 'VERY_HIGH'],
  ] as const;
  for (const [idx, val] of expected) {
    it(`FRA_RISK_RATINGS[${idx}] === '${val}'`, () => {
      expect(FRA_RISK_RATINGS[idx]).toBe(val);
    });
  }
});

// ─── FRA_STATUSES — positional index parametric ──────────────────────────────

describe('FRA_STATUSES — positional index parametric', () => {
  const expected = [
    [0, 'CURRENT'],
    [1, 'ACTION_REQUIRED'],
    [2, 'OVERDUE'],
    [3, 'NOT_COMPLETED'],
  ] as const;
  for (const [idx, val] of expected) {
    it(`FRA_STATUSES[${idx}] === '${val}'`, () => {
      expect(FRA_STATUSES[idx]).toBe(val);
    });
  }
});

// ─── BCP_STATUSES — positional index parametric ──────────────────────────────

describe('BCP_STATUSES — positional index parametric', () => {
  const expected = [
    [0, 'DRAFT'],
    [1, 'APPROVED'],
    [2, 'ACTIVE'],
    [3, 'UNDER_REVIEW'],
    [4, 'ARCHIVED'],
  ] as const;
  for (const [idx, val] of expected) {
    it(`BCP_STATUSES[${idx}] === '${val}'`, () => {
      expect(BCP_STATUSES[idx]).toBe(val);
    });
  }
});
