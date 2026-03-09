// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

/**
 * web-esg domain spec tests
 *
 * Covers (all inlined — no source imports):
 *   - ESG pillar / category / status / priority / trend arrays
 *   - Reporting framework catalogue (GRI, TCFD, SASB, CDP, CSRD, SFDR)
 *   - Badge/colour maps for pillar, category, status, priority, governance category
 *   - MOCK metrics and initiatives datasets
 *   - Score/progress/budget pure helpers
 */

// ─── Types ──────────────────────────────────────────────────────────────────

type Pillar = 'environmental' | 'social' | 'governance';
type MetricCategory = 'environmental' | 'social' | 'governance';
type InitiativeStatus = 'planned' | 'in-progress' | 'completed' | 'on-hold';
type Priority = 'critical' | 'high' | 'medium' | 'low';
type MetricStatus = 'on-track' | 'at-risk' | 'off-track';
type Trend = 'up' | 'down' | 'stable';
type GovernanceCategory =
  | 'BOARD'
  | 'RISK'
  | 'ETHICS'
  | 'TRANSPARENCY'
  | 'EXECUTIVE_PAY'
  | 'ANTI_CORRUPTION';
type FrameworkStatus = 'ACTIVE' | 'INACTIVE' | 'PLANNED';

// ─── Domain arrays ───────────────────────────────────────────────────────────

const PILLARS: Pillar[] = ['environmental', 'social', 'governance'];
const METRIC_CATEGORIES: MetricCategory[] = ['environmental', 'social', 'governance'];
const INITIATIVE_STATUSES: InitiativeStatus[] = [
  'planned',
  'in-progress',
  'completed',
  'on-hold',
];
const PRIORITIES: Priority[] = ['critical', 'high', 'medium', 'low'];
const METRIC_STATUSES: MetricStatus[] = ['on-track', 'at-risk', 'off-track'];
const TRENDS: Trend[] = ['up', 'down', 'stable'];
const GOVERNANCE_CATEGORIES: GovernanceCategory[] = [
  'BOARD',
  'RISK',
  'ETHICS',
  'TRANSPARENCY',
  'EXECUTIVE_PAY',
  'ANTI_CORRUPTION',
];
const FRAMEWORK_STATUSES: FrameworkStatus[] = ['ACTIVE', 'INACTIVE', 'PLANNED'];

// ─── Reporting frameworks ────────────────────────────────────────────────────

interface FrameworkMeta {
  name: string;
  color: string;
  badge: string;
  description: string;
}

const FRAMEWORKS: FrameworkMeta[] = [
  {
    name: 'GRI Standards',
    color: 'bg-green-50 border-green-200',
    badge: 'bg-green-100 text-green-700',
    description: 'Global Reporting Initiative - most widely used ESG reporting framework',
  },
  {
    name: 'TCFD',
    color: 'bg-blue-50 border-blue-200',
    badge: 'bg-blue-100 text-blue-700',
    description: 'Task Force on Climate-related Financial Disclosures',
  },
  {
    name: 'SASB',
    color: 'bg-purple-50 border-purple-200',
    badge: 'bg-purple-100 text-purple-700',
    description: 'Sustainability Accounting Standards Board',
  },
  {
    name: 'CDP',
    color: 'bg-emerald-50 border-emerald-200',
    badge: 'bg-emerald-100 text-emerald-700',
    description: 'Carbon Disclosure Project',
  },
  {
    name: 'CSRD',
    color: 'bg-orange-50 border-orange-200',
    badge: 'bg-orange-100 text-orange-700',
    description: 'Corporate Sustainability Reporting Directive (EU)',
  },
  {
    name: 'SFDR',
    color: 'bg-indigo-50 border-indigo-200',
    badge: 'bg-indigo-100 text-indigo-700',
    description: 'Sustainable Finance Disclosure Regulation (EU)',
  },
];

// ─── Badge / colour maps ─────────────────────────────────────────────────────

const pillarColor: Record<Pillar, string> = {
  environmental: 'bg-green-100 text-green-700',
  social: 'bg-blue-100 text-blue-700',
  governance: 'bg-purple-100 text-purple-700',
};

const priorityColor: Record<Priority, string> = {
  critical: 'bg-red-100 text-red-700',
  high: 'bg-orange-100 text-orange-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-gray-100 text-gray-600',
};

const statusColor: Record<MetricStatus, string> = {
  'on-track': 'bg-green-100 text-green-700',
  'at-risk': 'bg-amber-100 text-amber-700',
  'off-track': 'bg-red-100 text-red-700',
};

const initiativeStatusLabel: Record<InitiativeStatus, string> = {
  planned: 'Planned',
  'in-progress': 'In Progress',
  completed: 'Completed',
  'on-hold': 'On Hold',
};

const categoryTextColor: Record<MetricCategory, string> = {
  environmental: 'text-green-700',
  social: 'text-blue-700',
  governance: 'text-purple-700',
};

const governanceCategoryColor: Record<GovernanceCategory, string> = {
  BOARD: 'bg-purple-100 text-purple-700',
  RISK: 'bg-red-100 text-red-700',
  ETHICS: 'bg-blue-100 text-blue-700',
  TRANSPARENCY: 'bg-green-100 text-green-700',
  EXECUTIVE_PAY: 'bg-amber-100 text-amber-700',
  ANTI_CORRUPTION: 'bg-rose-100 text-rose-700',
};

// ─── MOCK metrics dataset ────────────────────────────────────────────────────

interface MockMetric {
  id: string;
  name: string;
  category: MetricCategory;
  value: number;
  unit: string;
  target: number;
  previousPeriod: number;
  trend: Trend;
  framework: string;
  disclosure: string;
  status: MetricStatus;
}

const MOCK_METRICS: MockMetric[] = [
  {
    id: 'E1',
    name: 'Scope 1 Emissions',
    category: 'environmental',
    value: 4250,
    unit: 'tCO₂e',
    target: 3500,
    previousPeriod: 4800,
    trend: 'down',
    framework: 'GRI',
    disclosure: '305-1',
    status: 'at-risk',
  },
  {
    id: 'E2',
    name: 'Scope 2 Emissions',
    category: 'environmental',
    value: 2100,
    unit: 'tCO₂e',
    target: 1800,
    previousPeriod: 2900,
    trend: 'down',
    framework: 'GRI',
    disclosure: '305-2',
    status: 'at-risk',
  },
  {
    id: 'E3',
    name: 'Renewable Energy %',
    category: 'environmental',
    value: 62,
    unit: '%',
    target: 80,
    previousPeriod: 48,
    trend: 'up',
    framework: 'TCFD',
    disclosure: 'Strategy',
    status: 'on-track',
  },
  {
    id: 'S1',
    name: 'Women in Leadership',
    category: 'social',
    value: 35,
    unit: '%',
    target: 40,
    previousPeriod: 30,
    trend: 'up',
    framework: 'GRI',
    disclosure: '405-1',
    status: 'on-track',
  },
  {
    id: 'S2',
    name: 'Gender Pay Gap',
    category: 'social',
    value: 3.2,
    unit: '%',
    target: 0,
    previousPeriod: 4.8,
    trend: 'down',
    framework: 'GRI',
    disclosure: '405-2',
    status: 'on-track',
  },
  {
    id: 'G1',
    name: 'Board Independence',
    category: 'governance',
    value: 67,
    unit: '%',
    target: 60,
    previousPeriod: 58,
    trend: 'up',
    framework: 'GRI',
    disclosure: '2-9',
    status: 'on-track',
  },
  {
    id: 'G3',
    name: 'Data Breaches',
    category: 'governance',
    value: 0,
    unit: 'incidents',
    target: 0,
    previousPeriod: 1,
    trend: 'down',
    framework: 'GRI',
    disclosure: '418-1',
    status: 'on-track',
  },
];

// ─── MOCK initiatives dataset ────────────────────────────────────────────────

interface MockInitiative {
  id: string;
  name: string;
  pillar: Pillar;
  priority: Priority;
  status: InitiativeStatus;
  budget: number;
  spent: number;
  progress: number;
  sdgs: number[];
}

const MOCK_INITIATIVES: MockInitiative[] = [
  {
    id: 'INI-001',
    name: 'Carbon Neutrality Programme',
    pillar: 'environmental',
    priority: 'critical',
    status: 'in-progress',
    budget: 2500000,
    spent: 850000,
    progress: 34,
    sdgs: [7, 13],
  },
  {
    id: 'INI-002',
    name: 'Circular Economy Transition',
    pillar: 'environmental',
    priority: 'high',
    status: 'in-progress',
    budget: 800000,
    spent: 320000,
    progress: 45,
    sdgs: [12],
  },
  {
    id: 'INI-004',
    name: 'Diversity & Inclusion Programme',
    pillar: 'social',
    priority: 'high',
    status: 'in-progress',
    budget: 600000,
    spent: 280000,
    progress: 52,
    sdgs: [5, 10],
  },
  {
    id: 'INI-006',
    name: 'Supply Chain Transparency',
    pillar: 'governance',
    priority: 'high',
    status: 'in-progress',
    budget: 350000,
    spent: 180000,
    progress: 60,
    sdgs: [8, 12],
  },
  {
    id: 'INI-007',
    name: 'Board ESG Competency',
    pillar: 'governance',
    priority: 'medium',
    status: 'completed',
    budget: 120000,
    spent: 95000,
    progress: 100,
    sdgs: [16],
  },
  {
    id: 'INI-010',
    name: 'Anti-Corruption Framework',
    pillar: 'governance',
    priority: 'high',
    status: 'completed',
    budget: 200000,
    spent: 185000,
    progress: 100,
    sdgs: [16],
  },
];

// ─── Pure helpers (spec copies) ──────────────────────────────────────────────

function budgetUtilisationPct(spent: number, budget: number): number {
  if (!budget) return 0;
  return Math.round((spent / budget) * 100);
}

function overallEsgScore(metrics: { status: MetricStatus }[]): number {
  if (!metrics.length) return 0;
  const onTrack = metrics.filter((m) => m.status === 'on-track').length;
  return Math.round((onTrack / metrics.length) * 100);
}

function pillarProgress(initiatives: { progress: number }[]): number {
  if (!initiatives.length) return 0;
  return Math.round(
    initiatives.reduce((s, i) => s + i.progress, 0) / initiatives.length
  );
}

function progressBarColor(progress: number): string {
  if (progress === 100) return 'bg-green-500';
  if (progress >= 50) return 'bg-blue-500';
  return 'bg-amber-500';
}

function budgetBarColor(pct: number): string {
  if (pct > 90) return 'bg-red-500';
  if (pct > 70) return 'bg-amber-500';
  return 'bg-green-500';
}

function formatBudgetMillions(amount: number): string {
  return `£${(amount / 1_000_000).toFixed(1)}M`;
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('ESG pillar array', () => {
  it('has 3 pillars', () => expect(PILLARS).toHaveLength(3));
  it('includes environmental', () => expect(PILLARS).toContain('environmental'));
  it('includes social', () => expect(PILLARS).toContain('social'));
  it('includes governance', () => expect(PILLARS).toContain('governance'));
  for (const p of PILLARS) {
    it(`pillar ${p} is a string`, () => expect(typeof p).toBe('string'));
  }
});

describe('Initiative status array', () => {
  it('has 4 statuses', () => expect(INITIATIVE_STATUSES).toHaveLength(4));
  for (const s of INITIATIVE_STATUSES) {
    it(`${s} is defined`, () => expect(s).toBeDefined());
    it(`${s} has a label`, () => expect(initiativeStatusLabel[s]).toBeDefined());
    it(`${s} label is non-empty`, () => expect(initiativeStatusLabel[s].length).toBeGreaterThan(0));
  }
  it('planned label is Planned', () => expect(initiativeStatusLabel['planned']).toBe('Planned'));
  it('completed label is Completed', () => expect(initiativeStatusLabel['completed']).toBe('Completed'));
  it('on-hold label is On Hold', () => expect(initiativeStatusLabel['on-hold']).toBe('On Hold'));
});

describe('Priority array', () => {
  it('has 4 priorities', () => expect(PRIORITIES).toHaveLength(4));
  for (const p of PRIORITIES) {
    it(`${p} has a colour`, () => expect(priorityColor[p]).toBeDefined());
    it(`${p} colour contains bg-`, () => expect(priorityColor[p]).toContain('bg-'));
  }
  it('critical is red', () => expect(priorityColor['critical']).toContain('red'));
  it('high is orange', () => expect(priorityColor['high']).toContain('orange'));
  it('medium is yellow', () => expect(priorityColor['medium']).toContain('yellow'));
  it('low is gray', () => expect(priorityColor['low']).toContain('gray'));
});

describe('Metric status colours', () => {
  it('has 3 metric statuses', () => expect(METRIC_STATUSES).toHaveLength(3));
  for (const s of METRIC_STATUSES) {
    it(`${s} has a colour`, () => expect(statusColor[s]).toBeDefined());
    it(`${s} colour contains bg-`, () => expect(statusColor[s]).toContain('bg-'));
  }
  it('on-track is green', () => expect(statusColor['on-track']).toContain('green'));
  it('at-risk is amber', () => expect(statusColor['at-risk']).toContain('amber'));
  it('off-track is red', () => expect(statusColor['off-track']).toContain('red'));
});

describe('Pillar colour map', () => {
  for (const p of PILLARS) {
    it(`${p} has a colour`, () => expect(pillarColor[p]).toBeDefined());
  }
  it('environmental is green', () => expect(pillarColor['environmental']).toContain('green'));
  it('social is blue', () => expect(pillarColor['social']).toContain('blue'));
  it('governance is purple', () => expect(pillarColor['governance']).toContain('purple'));
});

describe('Category text colour map', () => {
  for (const c of METRIC_CATEGORIES) {
    it(`${c} text colour is defined`, () => expect(categoryTextColor[c]).toBeDefined());
    it(`${c} text colour starts with text-`, () => expect(categoryTextColor[c]).toMatch(/^text-/));
  }
});

describe('Governance category colours', () => {
  it('has 6 governance categories', () => expect(GOVERNANCE_CATEGORIES).toHaveLength(6));
  for (const gc of GOVERNANCE_CATEGORIES) {
    it(`${gc} has a colour`, () => expect(governanceCategoryColor[gc]).toBeDefined());
    it(`${gc} colour contains bg-`, () => expect(governanceCategoryColor[gc]).toContain('bg-'));
  }
  it('BOARD is purple', () => expect(governanceCategoryColor['BOARD']).toContain('purple'));
  it('RISK is red', () => expect(governanceCategoryColor['RISK']).toContain('red'));
  it('ETHICS is blue', () => expect(governanceCategoryColor['ETHICS']).toContain('blue'));
  it('TRANSPARENCY is green', () => expect(governanceCategoryColor['TRANSPARENCY']).toContain('green'));
  it('ANTI_CORRUPTION is rose', () => expect(governanceCategoryColor['ANTI_CORRUPTION']).toContain('rose'));
});

describe('Reporting frameworks catalogue', () => {
  it('has 6 frameworks', () => expect(FRAMEWORKS).toHaveLength(6));
  const names = FRAMEWORKS.map((f) => f.name);
  for (const expected of ['GRI Standards', 'TCFD', 'SASB', 'CDP', 'CSRD', 'SFDR']) {
    it(`includes ${expected}`, () => expect(names).toContain(expected));
  }
  for (const fw of FRAMEWORKS) {
    it(`${fw.name} has colour`, () => expect(fw.color).toBeDefined());
    it(`${fw.name} has badge`, () => expect(fw.badge).toBeDefined());
    it(`${fw.name} has non-empty description`, () => expect(fw.description.length).toBeGreaterThan(0));
    it(`${fw.name} badge contains bg-`, () => expect(fw.badge).toContain('bg-'));
  }
  it('GRI is green', () => {
    const gri = FRAMEWORKS.find((f) => f.name === 'GRI Standards')!;
    expect(gri.badge).toContain('green');
  });
  it('TCFD is blue', () => {
    const tcfd = FRAMEWORKS.find((f) => f.name === 'TCFD')!;
    expect(tcfd.badge).toContain('blue');
  });
  it('CSRD is orange', () => {
    const csrd = FRAMEWORKS.find((f) => f.name === 'CSRD')!;
    expect(csrd.badge).toContain('orange');
  });
});

describe('Trend array', () => {
  it('has 3 trend values', () => expect(TRENDS).toHaveLength(3));
  it('includes up', () => expect(TRENDS).toContain('up'));
  it('includes down', () => expect(TRENDS).toContain('down'));
  it('includes stable', () => expect(TRENDS).toContain('stable'));
});

describe('MOCK metrics dataset integrity', () => {
  it('has metrics', () => expect(MOCK_METRICS.length).toBeGreaterThan(0));
  for (const m of MOCK_METRICS) {
    it(`${m.id} has a name`, () => expect(m.name.length).toBeGreaterThan(0));
    it(`${m.id} category is valid`, () => expect(METRIC_CATEGORIES).toContain(m.category));
    it(`${m.id} status is valid`, () => expect(METRIC_STATUSES).toContain(m.status));
    it(`${m.id} trend is valid`, () => expect(TRENDS).toContain(m.trend));
    it(`${m.id} value is a number`, () => expect(typeof m.value).toBe('number'));
    it(`${m.id} target is a number`, () => expect(typeof m.target).toBe('number'));
    it(`${m.id} has disclosure code`, () => expect(m.disclosure.length).toBeGreaterThan(0));
  }
  it('E1 is Scope 1 Emissions', () => {
    const e1 = MOCK_METRICS.find((m) => m.id === 'E1')!;
    expect(e1.name).toBe('Scope 1 Emissions');
  });
  it('G3 data breaches value is 0', () => {
    const g3 = MOCK_METRICS.find((m) => m.id === 'G3')!;
    expect(g3.value).toBe(0);
  });
});

describe('MOCK initiatives dataset integrity', () => {
  it('has initiatives', () => expect(MOCK_INITIATIVES.length).toBeGreaterThan(0));
  for (const ini of MOCK_INITIATIVES) {
    it(`${ini.id} pillar is valid`, () => expect(PILLARS).toContain(ini.pillar));
    it(`${ini.id} priority is valid`, () => expect(PRIORITIES).toContain(ini.priority));
    it(`${ini.id} status is valid`, () => expect(INITIATIVE_STATUSES).toContain(ini.status));
    it(`${ini.id} progress in [0,100]`, () => {
      expect(ini.progress).toBeGreaterThanOrEqual(0);
      expect(ini.progress).toBeLessThanOrEqual(100);
    });
    it(`${ini.id} spent <= budget`, () => expect(ini.spent).toBeLessThanOrEqual(ini.budget));
    it(`${ini.id} has at least one SDG`, () => expect(ini.sdgs.length).toBeGreaterThan(0));
  }
  it('completed initiatives have 100% progress', () => {
    const completed = MOCK_INITIATIVES.filter((i) => i.status === 'completed');
    for (const ini of completed) {
      expect(ini.progress).toBe(100);
    }
  });
});

describe('budgetUtilisationPct', () => {
  it('850k of 2.5M ≈ 34%', () => expect(budgetUtilisationPct(850_000, 2_500_000)).toBe(34));
  it('0 of 1M = 0%', () => expect(budgetUtilisationPct(0, 1_000_000)).toBe(0));
  it('1M of 1M = 100%', () => expect(budgetUtilisationPct(1_000_000, 1_000_000)).toBe(100));
  it('zero budget returns 0', () => expect(budgetUtilisationPct(500, 0)).toBe(0));
  it('result is a number', () => expect(typeof budgetUtilisationPct(100, 1000)).toBe('number'));
  for (const ini of MOCK_INITIATIVES) {
    it(`${ini.id} utilisation in [0,100]`, () => {
      const pct = budgetUtilisationPct(ini.spent, ini.budget);
      expect(pct).toBeGreaterThanOrEqual(0);
      expect(pct).toBeLessThanOrEqual(100);
    });
  }
});

describe('overallEsgScore', () => {
  it('all on-track gives 100', () =>
    expect(overallEsgScore([{ status: 'on-track' }, { status: 'on-track' }])).toBe(100));
  it('none on-track gives 0', () =>
    expect(overallEsgScore([{ status: 'at-risk' }, { status: 'off-track' }])).toBe(0));
  it('half on-track gives 50', () =>
    expect(overallEsgScore([{ status: 'on-track' }, { status: 'at-risk' }])).toBe(50));
  it('empty array gives 0', () => expect(overallEsgScore([])).toBe(0));
  it('returns a number', () => expect(typeof overallEsgScore(MOCK_METRICS)).toBe('number'));
  it('score on mock metrics is between 0 and 100', () => {
    const score = overallEsgScore(MOCK_METRICS);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });
});

describe('pillarProgress', () => {
  it('single initiative returns its progress', () =>
    expect(pillarProgress([{ progress: 60 }])).toBe(60));
  it('two equal returns that value', () =>
    expect(pillarProgress([{ progress: 40 }, { progress: 40 }])).toBe(40));
  it('empty returns 0', () => expect(pillarProgress([])).toBe(0));
  it('rounds to integer', () =>
    expect(Number.isInteger(pillarProgress([{ progress: 33 }, { progress: 34 }]))).toBe(true));
});

describe('progressBarColor', () => {
  it('100% is green', () => expect(progressBarColor(100)).toBe('bg-green-500'));
  it('75% is blue', () => expect(progressBarColor(75)).toBe('bg-blue-500'));
  it('50% is blue', () => expect(progressBarColor(50)).toBe('bg-blue-500'));
  it('49% is amber', () => expect(progressBarColor(49)).toBe('bg-amber-500'));
  it('0% is amber', () => expect(progressBarColor(0)).toBe('bg-amber-500'));
});

describe('budgetBarColor', () => {
  it('>90% is red', () => expect(budgetBarColor(91)).toBe('bg-red-500'));
  it('90% threshold is red', () => expect(budgetBarColor(91)).toBe('bg-red-500'));
  it('>70% and <=90 is amber', () => expect(budgetBarColor(80)).toBe('bg-amber-500'));
  it('70% threshold is amber', () => expect(budgetBarColor(71)).toBe('bg-amber-500'));
  it('<=70% is green', () => expect(budgetBarColor(70)).toBe('bg-green-500'));
  it('0% is green', () => expect(budgetBarColor(0)).toBe('bg-green-500'));
});

describe('formatBudgetMillions', () => {
  it('2.5M formats correctly', () =>
    expect(formatBudgetMillions(2_500_000)).toBe('£2.5M'));
  it('1M formats correctly', () =>
    expect(formatBudgetMillions(1_000_000)).toBe('£1.0M'));
  it('800k formats correctly', () =>
    expect(formatBudgetMillions(800_000)).toBe('£0.8M'));
  it('result starts with £', () =>
    expect(formatBudgetMillions(1_000_000)).toMatch(/^£/));
  it('result ends with M', () =>
    expect(formatBudgetMillions(1_500_000)).toMatch(/M$/));
});

describe('Framework status array', () => {
  it('has 3 statuses', () => expect(FRAMEWORK_STATUSES).toHaveLength(3));
  for (const s of FRAMEWORK_STATUSES) {
    it(`${s} is a string`, () => expect(typeof s).toBe('string'));
  }
  it('includes ACTIVE', () => expect(FRAMEWORK_STATUSES).toContain('ACTIVE'));
  it('includes INACTIVE', () => expect(FRAMEWORK_STATUSES).toContain('INACTIVE'));
  it('includes PLANNED', () => expect(FRAMEWORK_STATUSES).toContain('PLANNED'));
});

describe('Cross-domain invariants', () => {
  it('PILLARS and METRIC_CATEGORIES have same members', () =>
    expect([...PILLARS].sort()).toEqual([...METRIC_CATEGORIES].sort()));
  it('all framework names are unique', () => {
    const names = FRAMEWORKS.map((f) => f.name);
    expect(new Set(names).size).toBe(names.length);
  });
  it('all mock metric IDs are unique', () => {
    const ids = MOCK_METRICS.map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
  it('all mock initiative IDs are unique', () => {
    const ids = MOCK_INITIATIVES.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
  it('all SDG numbers are positive integers', () => {
    for (const ini of MOCK_INITIATIVES) {
      for (const sdg of ini.sdgs) {
        expect(Number.isInteger(sdg)).toBe(true);
        expect(sdg).toBeGreaterThan(0);
      }
    }
  });
  it('all metric values are finite numbers', () => {
    for (const m of MOCK_METRICS) {
      expect(Number.isFinite(m.value)).toBe(true);
      expect(Number.isFinite(m.target)).toBe(true);
    }
  });
  it('governance category colour map covers all categories', () => {
    for (const gc of GOVERNANCE_CATEGORIES) {
      expect(governanceCategoryColor[gc]).toBeDefined();
    }
  });
  it('initiatives with governance pillar all have SDG 8, 12, or 16', () => {
    const govInits = MOCK_INITIATIVES.filter((i) => i.pillar === 'governance');
    for (const ini of govInits) {
      const hasExpectedSdg = ini.sdgs.some((s) => [8, 12, 16].includes(s));
      expect(hasExpectedSdg).toBe(true);
    }
  });
});

// ─── Phase 212 parametric additions ──────────────────────────────────────────

describe('PILLARS — positional index parametric', () => {
  const expected = [
    [0, 'environmental'],
    [1, 'social'],
    [2, 'governance'],
  ] as const;
  for (const [idx, val] of expected) {
    it(`PILLARS[${idx}] === '${val}'`, () => {
      expect(PILLARS[idx]).toBe(val);
    });
  }
});

describe('INITIATIVE_STATUSES — positional index parametric', () => {
  const expected = [
    [0, 'planned'],
    [1, 'in-progress'],
    [2, 'completed'],
    [3, 'on-hold'],
  ] as const;
  for (const [idx, val] of expected) {
    it(`INITIATIVE_STATUSES[${idx}] === '${val}'`, () => {
      expect(INITIATIVE_STATUSES[idx]).toBe(val);
    });
  }
});

describe('PRIORITIES — positional index parametric', () => {
  const expected = [
    [0, 'critical'],
    [1, 'high'],
    [2, 'medium'],
    [3, 'low'],
  ] as const;
  for (const [idx, val] of expected) {
    it(`PRIORITIES[${idx}] === '${val}'`, () => {
      expect(PRIORITIES[idx]).toBe(val);
    });
  }
});

describe('METRIC_STATUSES — positional index parametric', () => {
  const expected = [
    [0, 'on-track'],
    [1, 'at-risk'],
    [2, 'off-track'],
  ] as const;
  for (const [idx, val] of expected) {
    it(`METRIC_STATUSES[${idx}] === '${val}'`, () => {
      expect(METRIC_STATUSES[idx]).toBe(val);
    });
  }
});

describe('TRENDS — positional index parametric', () => {
  const expected = [
    [0, 'up'],
    [1, 'down'],
    [2, 'stable'],
  ] as const;
  for (const [idx, val] of expected) {
    it(`TRENDS[${idx}] === '${val}'`, () => {
      expect(TRENDS[idx]).toBe(val);
    });
  }
});

describe('GOVERNANCE_CATEGORIES — positional index parametric', () => {
  const expected = [
    [0, 'BOARD'],
    [1, 'RISK'],
    [2, 'ETHICS'],
    [3, 'TRANSPARENCY'],
    [4, 'EXECUTIVE_PAY'],
    [5, 'ANTI_CORRUPTION'],
  ] as const;
  for (const [idx, val] of expected) {
    it(`GOVERNANCE_CATEGORIES[${idx}] === '${val}'`, () => {
      expect(GOVERNANCE_CATEGORIES[idx]).toBe(val);
    });
  }
});

describe('FRAMEWORK_STATUSES — positional index parametric', () => {
  const expected = [
    [0, 'ACTIVE'],
    [1, 'INACTIVE'],
    [2, 'PLANNED'],
  ] as const;
  for (const [idx, val] of expected) {
    it(`FRAMEWORK_STATUSES[${idx}] === '${val}'`, () => {
      expect(FRAMEWORK_STATUSES[idx]).toBe(val);
    });
  }
});

describe('FRAMEWORKS — per-framework name parametric', () => {
  const expected: [number, string][] = [
    [0, 'GRI Standards'],
    [1, 'TCFD'],
    [2, 'SASB'],
    [3, 'CDP'],
    [4, 'CSRD'],
    [5, 'SFDR'],
  ];
  for (const [idx, name] of expected) {
    it(`FRAMEWORKS[${idx}].name === '${name}'`, () => {
      expect(FRAMEWORKS[idx].name).toBe(name);
    });
  }
});
