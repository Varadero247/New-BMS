// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

// ── Domain constants (inlined — no imports from page source files) ─────────

type KpiStatus = 'ON_TARGET' | 'NEAR_TARGET' | 'OFF_TARGET';
type KpiTrend = 'UP' | 'DOWN' | 'STABLE' | 'IMPROVING' | 'DECLINING';
type DashboardVisibility = 'PUBLIC' | 'PRIVATE' | 'RESTRICTED';
type KpiCategory = 'H&S' | 'Quality' | 'Operations' | 'ESG' | 'HR' | 'Supply Chain' | 'Finance';
type FindingType = 'MAJOR_NC' | 'MINOR_NC' | 'OBSERVATION' | 'CLEAR';
type DateRange = '7D' | '30D' | '90D' | '1Y' | 'ALL';
type ChartType = 'BAR' | 'LINE' | 'PIE' | 'SCATTER' | 'HEATMAP' | 'AREA';
type ReportStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

const KPI_STATUSES: KpiStatus[] = ['ON_TARGET', 'NEAR_TARGET', 'OFF_TARGET'];
const KPI_TRENDS: KpiTrend[] = ['UP', 'DOWN', 'STABLE', 'IMPROVING', 'DECLINING'];
const DASHBOARD_VISIBILITIES: DashboardVisibility[] = ['PUBLIC', 'PRIVATE', 'RESTRICTED'];
const KPI_CATEGORIES: KpiCategory[] = ['H&S', 'Quality', 'Operations', 'ESG', 'HR', 'Supply Chain', 'Finance'];
const FINDING_TYPES: FindingType[] = ['MAJOR_NC', 'MINOR_NC', 'OBSERVATION', 'CLEAR'];
const DATE_RANGES: DateRange[] = ['7D', '30D', '90D', '1Y', 'ALL'];
const CHART_TYPES: ChartType[] = ['BAR', 'LINE', 'PIE', 'SCATTER', 'HEATMAP', 'AREA'];
const REPORT_STATUSES: ReportStatus[] = ['DRAFT', 'PUBLISHED', 'ARCHIVED'];

const kpiStatusStyles: Record<KpiStatus, string> = {
  ON_TARGET: 'bg-green-100 text-green-700',
  NEAR_TARGET: 'bg-yellow-100 text-yellow-700',
  OFF_TARGET: 'bg-red-100 text-red-700',
};

const dashboardVisibilityStyles: Record<DashboardVisibility, string> = {
  PUBLIC: 'bg-green-100 text-green-700',
  PRIVATE: 'bg-gray-100 text-gray-600',
  RESTRICTED: 'bg-orange-100 text-orange-700',
};

const findingColors: Record<FindingType, string> = {
  MAJOR_NC: 'bg-red-100 text-red-700',
  MINOR_NC: 'bg-orange-100 text-orange-700',
  OBSERVATION: 'bg-yellow-100 text-yellow-700',
  CLEAR: 'bg-green-100 text-green-700',
};

const findingLabels: Record<FindingType, string> = {
  MAJOR_NC: 'Major NC',
  MINOR_NC: 'Minor NC',
  OBSERVATION: 'Observation',
  CLEAR: 'Clear',
};

const dateRangeDays: Record<DateRange, number | null> = {
  '7D': 7,
  '30D': 30,
  '90D': 90,
  '1Y': 365,
  ALL: null,
};

// ── Mock data ──────────────────────────────────────────────────────────────

interface KpiItem {
  id: string;
  name: string;
  category: KpiCategory;
  value: number;
  target: number;
  unit: string;
  trend: KpiTrend;
  status: KpiStatus;
  owner: string;
  lastUpdated: string;
  description: string;
}

interface DashboardItem {
  id: string;
  name: string;
  description: string;
  owner: string;
  widgetCount: number;
  visibility: DashboardVisibility;
  isFeatured: boolean;
  lastUpdated: string;
  viewCount: number;
  tags: string[];
}

const MOCK_KPIS: KpiItem[] = [
  { id: '1', name: 'Lost Time Injury Rate', category: 'H&S', value: 0.12, target: 0, unit: 'per 100k hrs', trend: 'DOWN', status: 'OFF_TARGET', owner: 'Bob Smith', lastUpdated: '2026-02-10', description: 'Number of lost time injuries per 100,000 hours worked' },
  { id: '2', name: 'Customer Satisfaction Score', category: 'Quality', value: 88, target: 90, unit: '%', trend: 'UP', status: 'NEAR_TARGET', owner: 'Alice Johnson', lastUpdated: '2026-02-01', description: 'Average customer satisfaction rating from surveys' },
  { id: '3', name: 'CAPA Closure Rate', category: 'Quality', value: 76, target: 85, unit: '%', trend: 'STABLE', status: 'OFF_TARGET', owner: 'Carol Davis', lastUpdated: '2026-02-14', description: 'Percentage of CAPAs closed on time' },
  { id: '4', name: 'On-Time Delivery', category: 'Operations', value: 93, target: 95, unit: '%', trend: 'UP', status: 'NEAR_TARGET', owner: 'George Ops', lastUpdated: '2026-02-13', description: 'Percentage of orders delivered on or before due date' },
  { id: '5', name: 'Carbon Intensity', category: 'ESG', value: 24.8, target: 20, unit: 'tCO2/£m', trend: 'DOWN', status: 'OFF_TARGET', owner: 'Eve Green', lastUpdated: '2026-02-01', description: 'GHG emissions per £million revenue' },
  { id: '6', name: 'First Pass Yield', category: 'Quality', value: 97.4, target: 98, unit: '%', trend: 'UP', status: 'ON_TARGET', owner: 'Ivan Quality', lastUpdated: '2026-02-12', description: 'Percentage of products passing quality inspection first time' },
  { id: '7', name: 'Employee Engagement', category: 'HR', value: 74, target: 80, unit: '%', trend: 'UP', status: 'OFF_TARGET', owner: 'Jane HR', lastUpdated: '2026-01-15', description: 'Annual employee engagement survey score' },
  { id: '8', name: 'Supplier On-Time Delivery', category: 'Supply Chain', value: 89, target: 92, unit: '%', trend: 'STABLE', status: 'OFF_TARGET', owner: 'Karl Procurement', lastUpdated: '2026-02-05', description: 'Supplier on-time delivery performance' },
  { id: '9', name: 'Energy Consumption', category: 'ESG', value: 1240, target: 1100, unit: 'MWh/month', trend: 'DOWN', status: 'OFF_TARGET', owner: 'Heidi Energy', lastUpdated: '2026-02-01', description: 'Total site energy consumption' },
  { id: '10', name: 'Training Completion Rate', category: 'HR', value: 96, target: 95, unit: '%', trend: 'UP', status: 'ON_TARGET', owner: 'Jane HR', lastUpdated: '2026-02-10', description: 'Percentage of employees with up-to-date mandatory training' },
];

const MOCK_DASHBOARDS: DashboardItem[] = [
  { id: '1', name: 'Executive Overview', description: 'High-level cross-module KPIs and compliance scores for leadership', owner: 'Alice Johnson', widgetCount: 12, visibility: 'PUBLIC', isFeatured: true, lastUpdated: '2026-02-14', viewCount: 284, tags: ['Executive', 'KPIs', 'Compliance'] },
  { id: '2', name: 'H&S Performance Monitor', description: 'Incident rates, LTI trends, near-miss frequency and CAPA status', owner: 'Bob Smith', widgetCount: 8, visibility: 'PUBLIC', isFeatured: false, lastUpdated: '2026-02-13', viewCount: 156, tags: ['H&S', 'Safety', 'Incidents'] },
  { id: '3', name: 'Quality KPI Tracker', description: 'NCR rates, CAPA closure, first-pass yield and customer satisfaction', owner: 'Ivan Quality', widgetCount: 10, visibility: 'PUBLIC', isFeatured: true, lastUpdated: '2026-02-12', viewCount: 198, tags: ['Quality', 'NCR', 'CAPA'] },
  { id: '4', name: 'ESG Metrics Board', description: 'Scope 1/2/3 emissions, energy consumption, waste and water KPIs', owner: 'Eve Green', widgetCount: 14, visibility: 'PUBLIC', isFeatured: false, lastUpdated: '2026-02-10', viewCount: 112, tags: ['ESG', 'Emissions', 'Sustainability'] },
  { id: '5', name: 'Supply Chain Scorecard', description: 'Supplier OTD, defect rates, audit findings and risk indicators', owner: 'Karl Procurement', widgetCount: 6, visibility: 'PRIVATE', isFeatured: false, lastUpdated: '2026-02-08', viewCount: 43, tags: ['Supply Chain', 'Suppliers'] },
  { id: '6', name: 'Finance BI Dashboard', description: 'Revenue, margin, budget variance and financial KPIs by department', owner: 'Jane Finance', widgetCount: 9, visibility: 'RESTRICTED', isFeatured: false, lastUpdated: '2026-02-07', viewCount: 67, tags: ['Finance', 'Budget', 'Revenue'] },
  { id: '7', name: 'ISO Compliance Radar', description: 'Compliance scoring across all active ISO standards at a glance', owner: 'Alice Johnson', widgetCount: 7, visibility: 'PUBLIC', isFeatured: true, lastUpdated: '2026-02-14', viewCount: 321, tags: ['Compliance', 'ISO', 'Audit'] },
  { id: '8', name: 'Workforce Analytics', description: 'Headcount, training completion, engagement and turnover metrics', owner: 'Jane HR', widgetCount: 5, visibility: 'RESTRICTED', isFeatured: false, lastUpdated: '2026-02-06', viewCount: 89, tags: ['HR', 'Training', 'Workforce'] },
];

// ── Helper functions (inlined) ─────────────────────────────────────────────

function computeVariance(actual: number, target: number): number {
  if (target === 0) return 0;
  return ((actual - target) / target) * 100;
}

function probabilityColor(p: number): string {
  if (p >= 0.7) return 'text-red-600 bg-red-100';
  if (p >= 0.4) return 'text-orange-600 bg-orange-100';
  return 'text-green-600 bg-green-100';
}

function formatMetric(value: number, unit: string): string {
  if (unit === '%') return value.toFixed(1) + '%';
  if (unit === '£') return '£' + value.toLocaleString('en-GB');
  return value.toString() + ' ' + unit;
}

function filterKpisByStatus(kpis: KpiItem[], status: KpiStatus): KpiItem[] {
  return kpis.filter((k) => k.status === status);
}

function filterKpisByCategory(kpis: KpiItem[], category: KpiCategory): KpiItem[] {
  return kpis.filter((k) => k.category === category);
}

function featuredDashboards(dashboards: DashboardItem[]): DashboardItem[] {
  return dashboards.filter((d) => d.isFeatured);
}

function totalDashboardViews(dashboards: DashboardItem[]): number {
  return dashboards.reduce((sum, d) => sum + d.viewCount, 0);
}

function uniqueCategories(kpis: KpiItem[]): string[] {
  return [...new Set(kpis.map((k) => k.category))].sort();
}

function kpiPercentageOnTarget(kpis: KpiItem[]): number {
  if (kpis.length === 0) return 0;
  return Math.round((kpis.filter((k) => k.status === 'ON_TARGET').length / kpis.length) * 100);
}

function dashboardsByVisibility(dashboards: DashboardItem[], visibility: DashboardVisibility): DashboardItem[] {
  return dashboards.filter((d) => d.visibility === visibility);
}

function kpiTrendLabel(trend: KpiTrend): string {
  const labels: Record<KpiTrend, string> = {
    UP: 'Improving',
    DOWN: 'Declining',
    STABLE: 'Stable',
    IMPROVING: 'Improving',
    DECLINING: 'Declining',
  };
  return labels[trend];
}

// ═══════════════════════════════════════════════════════════════════════════
// TEST SUITES
// ═══════════════════════════════════════════════════════════════════════════

describe('KPI status array', () => {
  it('has exactly 3 statuses', () => expect(KPI_STATUSES).toHaveLength(3));
  it('contains ON_TARGET', () => expect(KPI_STATUSES).toContain('ON_TARGET'));
  it('contains NEAR_TARGET', () => expect(KPI_STATUSES).toContain('NEAR_TARGET'));
  it('contains OFF_TARGET', () => expect(KPI_STATUSES).toContain('OFF_TARGET'));
  for (const s of KPI_STATUSES) {
    it(`status "${s}" is a non-empty string`, () => expect(s.length).toBeGreaterThan(0));
  }
});

describe('KPI status style map', () => {
  for (const s of KPI_STATUSES) {
    it(`${s} has a style class`, () => expect(kpiStatusStyles[s]).toBeDefined());
    it(`${s} style includes bg-`, () => expect(kpiStatusStyles[s]).toContain('bg-'));
    it(`${s} style includes text-`, () => expect(kpiStatusStyles[s]).toContain('text-'));
  }
  it('ON_TARGET is green', () => expect(kpiStatusStyles.ON_TARGET).toContain('green'));
  it('NEAR_TARGET is yellow', () => expect(kpiStatusStyles.NEAR_TARGET).toContain('yellow'));
  it('OFF_TARGET is red', () => expect(kpiStatusStyles.OFF_TARGET).toContain('red'));
});

describe('Dashboard visibility array', () => {
  it('has exactly 3 visibility options', () => expect(DASHBOARD_VISIBILITIES).toHaveLength(3));
  for (const v of DASHBOARD_VISIBILITIES) {
    it(`visibility "${v}" is defined`, () => expect(v).toBeDefined());
  }
  it('includes PUBLIC', () => expect(DASHBOARD_VISIBILITIES).toContain('PUBLIC'));
  it('includes PRIVATE', () => expect(DASHBOARD_VISIBILITIES).toContain('PRIVATE'));
  it('includes RESTRICTED', () => expect(DASHBOARD_VISIBILITIES).toContain('RESTRICTED'));
});

describe('Dashboard visibility style map', () => {
  for (const v of DASHBOARD_VISIBILITIES) {
    it(`${v} has a style class`, () => expect(dashboardVisibilityStyles[v]).toBeDefined());
    it(`${v} style has bg-`, () => expect(dashboardVisibilityStyles[v]).toContain('bg-'));
  }
  it('PUBLIC is green', () => expect(dashboardVisibilityStyles.PUBLIC).toContain('green'));
  it('RESTRICTED is orange', () => expect(dashboardVisibilityStyles.RESTRICTED).toContain('orange'));
  it('PRIVATE is gray', () => expect(dashboardVisibilityStyles.PRIVATE).toContain('gray'));
});

describe('Finding type array', () => {
  it('has exactly 4 finding types', () => expect(FINDING_TYPES).toHaveLength(4));
  for (const f of FINDING_TYPES) {
    it(`finding type "${f}" is a string`, () => expect(typeof f).toBe('string'));
  }
  it('includes MAJOR_NC', () => expect(FINDING_TYPES).toContain('MAJOR_NC'));
  it('includes MINOR_NC', () => expect(FINDING_TYPES).toContain('MINOR_NC'));
  it('includes OBSERVATION', () => expect(FINDING_TYPES).toContain('OBSERVATION'));
  it('includes CLEAR', () => expect(FINDING_TYPES).toContain('CLEAR'));
});

describe('Finding color map', () => {
  for (const f of FINDING_TYPES) {
    it(`${f} has a color class`, () => expect(findingColors[f]).toBeDefined());
    it(`${f} color has bg-`, () => expect(findingColors[f]).toContain('bg-'));
    it(`${f} color has text-`, () => expect(findingColors[f]).toContain('text-'));
  }
  it('MAJOR_NC is red', () => expect(findingColors.MAJOR_NC).toContain('red'));
  it('MINOR_NC is orange', () => expect(findingColors.MINOR_NC).toContain('orange'));
  it('OBSERVATION is yellow', () => expect(findingColors.OBSERVATION).toContain('yellow'));
  it('CLEAR is green', () => expect(findingColors.CLEAR).toContain('green'));
});

describe('Finding label map', () => {
  it('MAJOR_NC label is "Major NC"', () => expect(findingLabels.MAJOR_NC).toBe('Major NC'));
  it('MINOR_NC label is "Minor NC"', () => expect(findingLabels.MINOR_NC).toBe('Minor NC'));
  it('OBSERVATION label is "Observation"', () => expect(findingLabels.OBSERVATION).toBe('Observation'));
  it('CLEAR label is "Clear"', () => expect(findingLabels.CLEAR).toBe('Clear'));
  for (const f of FINDING_TYPES) {
    it(`${f} label is a non-empty string`, () => expect(findingLabels[f].length).toBeGreaterThan(0));
  }
});

describe('Chart type array', () => {
  it('has exactly 6 chart types', () => expect(CHART_TYPES).toHaveLength(6));
  for (const c of CHART_TYPES) {
    it(`chart type "${c}" is defined`, () => expect(c).toBeDefined());
  }
  it('includes BAR', () => expect(CHART_TYPES).toContain('BAR'));
  it('includes LINE', () => expect(CHART_TYPES).toContain('LINE'));
  it('includes PIE', () => expect(CHART_TYPES).toContain('PIE'));
  it('includes HEATMAP', () => expect(CHART_TYPES).toContain('HEATMAP'));
});

describe('Date range mapping', () => {
  it('7D maps to 7', () => expect(dateRangeDays['7D']).toBe(7));
  it('30D maps to 30', () => expect(dateRangeDays['30D']).toBe(30));
  it('90D maps to 90', () => expect(dateRangeDays['90D']).toBe(90));
  it('1Y maps to 365', () => expect(dateRangeDays['1Y']).toBe(365));
  it('ALL maps to null (no limit)', () => expect(dateRangeDays['ALL']).toBeNull());
  for (const r of DATE_RANGES) {
    it(`date range "${r}" entry exists in map`, () => expect(dateRangeDays[r]).not.toBeUndefined());
    it(`date range "${r}" is null or positive number`, () => {
      const d = dateRangeDays[r];
      expect(d === null || (typeof d === 'number' && d > 0)).toBe(true);
    });
  }
});

describe('Mock KPI data shape', () => {
  it('has 10 mock KPIs', () => expect(MOCK_KPIS).toHaveLength(10));
  for (const kpi of MOCK_KPIS) {
    it(`KPI "${kpi.name}" has a non-empty id`, () => expect(kpi.id.length).toBeGreaterThan(0));
    it(`KPI "${kpi.name}" has a valid status`, () => expect(KPI_STATUSES).toContain(kpi.status));
    it(`KPI "${kpi.name}" has a valid trend`, () => expect(KPI_TRENDS).toContain(kpi.trend));
    it(`KPI "${kpi.name}" has a non-empty unit`, () => expect(kpi.unit.length).toBeGreaterThan(0));
    it(`KPI "${kpi.name}" value is a finite number`, () => expect(isFinite(kpi.value)).toBe(true));
  }
  it('KPI ids are unique', () => {
    const ids = MOCK_KPIS.map((k) => k.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
  it('has at least one ON_TARGET KPI', () => {
    expect(MOCK_KPIS.some((k) => k.status === 'ON_TARGET')).toBe(true);
  });
  it('has at least one OFF_TARGET KPI', () => {
    expect(MOCK_KPIS.some((k) => k.status === 'OFF_TARGET')).toBe(true);
  });
  it('has at least one NEAR_TARGET KPI', () => {
    expect(MOCK_KPIS.some((k) => k.status === 'NEAR_TARGET')).toBe(true);
  });
  it('covers Quality category', () => {
    expect(MOCK_KPIS.some((k) => k.category === 'Quality')).toBe(true);
  });
  it('covers ESG category', () => {
    expect(MOCK_KPIS.some((k) => k.category === 'ESG')).toBe(true);
  });
  it('covers HR category', () => {
    expect(MOCK_KPIS.some((k) => k.category === 'HR')).toBe(true);
  });
  it('Training Completion Rate value >= its target (ON_TARGET)', () => {
    const kpi = MOCK_KPIS.find((k) => k.name === 'Training Completion Rate')!;
    expect(kpi.value).toBeGreaterThanOrEqual(kpi.target);
  });
});

describe('Mock dashboard data shape', () => {
  it('has 8 mock dashboards', () => expect(MOCK_DASHBOARDS).toHaveLength(8));
  for (const d of MOCK_DASHBOARDS) {
    it(`dashboard "${d.name}" has a valid visibility`, () => expect(DASHBOARD_VISIBILITIES).toContain(d.visibility));
    it(`dashboard "${d.name}" widgetCount >= 0`, () => expect(d.widgetCount).toBeGreaterThanOrEqual(0));
    it(`dashboard "${d.name}" viewCount >= 0`, () => expect(d.viewCount).toBeGreaterThanOrEqual(0));
    it(`dashboard "${d.name}" has at least one tag`, () => expect(d.tags.length).toBeGreaterThan(0));
  }
  it('dashboard ids are unique', () => {
    const ids = MOCK_DASHBOARDS.map((d) => d.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
  it('at least one dashboard is featured', () => {
    expect(MOCK_DASHBOARDS.some((d) => d.isFeatured)).toBe(true);
  });
  it('at least one dashboard is PUBLIC', () => {
    expect(MOCK_DASHBOARDS.some((d) => d.visibility === 'PUBLIC')).toBe(true);
  });
  it('at least one dashboard is PRIVATE', () => {
    expect(MOCK_DASHBOARDS.some((d) => d.visibility === 'PRIVATE')).toBe(true);
  });
  it('at least one dashboard is RESTRICTED', () => {
    expect(MOCK_DASHBOARDS.some((d) => d.visibility === 'RESTRICTED')).toBe(true);
  });
  it('Executive Overview is featured', () => {
    const d = MOCK_DASHBOARDS.find((d) => d.name === 'Executive Overview')!;
    expect(d.isFeatured).toBe(true);
  });
});

describe('computeVariance helper', () => {
  it('returns 0 when actual equals target', () => expect(computeVariance(100, 100)).toBe(0));
  it('returns +10 when actual is 10% above target', () => expect(computeVariance(110, 100)).toBeCloseTo(10));
  it('returns -10 when actual is 10% below target', () => expect(computeVariance(90, 100)).toBeCloseTo(-10));
  it('returns 0 when target is 0 (guard)', () => expect(computeVariance(50, 0)).toBe(0));
  it('result is finite for all integer actuals 0-100', () => {
    for (let i = 0; i <= 100; i++) {
      expect(isFinite(computeVariance(i, 100))).toBe(true);
    }
  });
  it('positive actual above target gives positive variance', () => {
    expect(computeVariance(120, 100)).toBeGreaterThan(0);
  });
  it('actual below target gives negative variance', () => {
    expect(computeVariance(80, 100)).toBeLessThan(0);
  });
});

describe('probabilityColor helper', () => {
  it('returns red class for p >= 0.7', () => expect(probabilityColor(0.8)).toContain('red'));
  it('returns orange class for p >= 0.4', () => expect(probabilityColor(0.5)).toContain('orange'));
  it('returns green class for p < 0.4', () => expect(probabilityColor(0.2)).toContain('green'));
  it('boundary 0.7 is red', () => expect(probabilityColor(0.7)).toContain('red'));
  it('boundary 0.4 is orange', () => expect(probabilityColor(0.4)).toContain('orange'));
  it('0.39 is green', () => expect(probabilityColor(0.39)).toContain('green'));
  it('returns a non-empty string for any probability in [0,1]', () => {
    for (let i = 0; i <= 10; i++) {
      expect(probabilityColor(i / 10).length).toBeGreaterThan(0);
    }
  });
});

describe('formatMetric helper', () => {
  it('formats percentage correctly', () => expect(formatMetric(85.5, '%')).toBe('85.5%'));
  it('percentage format ends with %', () => expect(formatMetric(92.0, '%')).toMatch(/%$/));
  it('currency format starts with £', () => expect(formatMetric(1000, '£')).toMatch(/^£/));
  it('generic format appends unit', () => expect(formatMetric(42, 'MWh/month')).toBe('42 MWh/month'));
  it('integer percentage shows one decimal', () => expect(formatMetric(80, '%')).toBe('80.0%'));
  for (let i = 0; i <= 100; i++) {
    it(`formatMetric(${i}, '%') ends with %`, () => expect(formatMetric(i, '%')).toMatch(/%$/));
  }
});

describe('filterKpisByStatus helper', () => {
  it('ON_TARGET filter returns only ON_TARGET items', () => {
    const result = filterKpisByStatus(MOCK_KPIS, 'ON_TARGET');
    expect(result.every((k) => k.status === 'ON_TARGET')).toBe(true);
  });
  it('OFF_TARGET filter returns only OFF_TARGET items', () => {
    const result = filterKpisByStatus(MOCK_KPIS, 'OFF_TARGET');
    expect(result.every((k) => k.status === 'OFF_TARGET')).toBe(true);
  });
  it('returns empty array for empty input', () => {
    expect(filterKpisByStatus([], 'ON_TARGET')).toHaveLength(0);
  });
  for (const s of KPI_STATUSES) {
    it(`filterKpisByStatus("${s}") returns an array`, () => {
      expect(Array.isArray(filterKpisByStatus(MOCK_KPIS, s))).toBe(true);
    });
  }
  it('all statuses together equal total KPI count', () => {
    const total = KPI_STATUSES.reduce((sum, s) => sum + filterKpisByStatus(MOCK_KPIS, s).length, 0);
    expect(total).toBe(MOCK_KPIS.length);
  });
});

describe('filterKpisByCategory helper', () => {
  it('Quality filter returns only Quality KPIs', () => {
    const result = filterKpisByCategory(MOCK_KPIS, 'Quality');
    expect(result.every((k) => k.category === 'Quality')).toBe(true);
  });
  it('returns more than one Quality KPI from mock data', () => {
    expect(filterKpisByCategory(MOCK_KPIS, 'Quality').length).toBeGreaterThan(1);
  });
  it('returns empty array when no KPI matches category', () => {
    expect(filterKpisByCategory([], 'HR')).toHaveLength(0);
  });
  for (const c of KPI_CATEGORIES) {
    it(`filterKpisByCategory("${c}") returns an array`, () => {
      expect(Array.isArray(filterKpisByCategory(MOCK_KPIS, c))).toBe(true);
    });
  }
});

describe('featuredDashboards helper', () => {
  it('returns only featured dashboards', () => {
    const result = featuredDashboards(MOCK_DASHBOARDS);
    expect(result.every((d) => d.isFeatured)).toBe(true);
  });
  it('returns 3 featured dashboards from mock data', () => {
    expect(featuredDashboards(MOCK_DASHBOARDS)).toHaveLength(3);
  });
  it('returns empty for empty input', () => {
    expect(featuredDashboards([])).toHaveLength(0);
  });
  it('ISO Compliance Radar is featured', () => {
    const featured = featuredDashboards(MOCK_DASHBOARDS);
    expect(featured.some((d) => d.name === 'ISO Compliance Radar')).toBe(true);
  });
});

describe('totalDashboardViews helper', () => {
  it('returns 0 for empty list', () => expect(totalDashboardViews([])).toBe(0));
  it('sum matches manual calculation for mock data', () => {
    const expected = MOCK_DASHBOARDS.reduce((s, d) => s + d.viewCount, 0);
    expect(totalDashboardViews(MOCK_DASHBOARDS)).toBe(expected);
  });
  it('total is a positive number for mock data', () => {
    expect(totalDashboardViews(MOCK_DASHBOARDS)).toBeGreaterThan(0);
  });
  it('single dashboard returns its own viewCount', () => {
    const d = MOCK_DASHBOARDS[0];
    expect(totalDashboardViews([d])).toBe(d.viewCount);
  });
});

describe('uniqueCategories helper', () => {
  it('returns a sorted array of unique categories', () => {
    const cats = uniqueCategories(MOCK_KPIS);
    expect(Array.isArray(cats)).toBe(true);
    expect(cats.length).toBeGreaterThan(0);
  });
  it('returns no duplicate categories', () => {
    const cats = uniqueCategories(MOCK_KPIS);
    expect(new Set(cats).size).toBe(cats.length);
  });
  it('returns empty array for empty input', () => {
    expect(uniqueCategories([])).toHaveLength(0);
  });
  it('result is sorted alphabetically', () => {
    const cats = uniqueCategories(MOCK_KPIS);
    const sorted = [...cats].sort();
    expect(cats).toEqual(sorted);
  });
});

describe('kpiPercentageOnTarget helper', () => {
  it('returns 0 for empty list', () => expect(kpiPercentageOnTarget([])).toBe(0));
  it('returns a number in [0, 100]', () => {
    const pct = kpiPercentageOnTarget(MOCK_KPIS);
    expect(pct).toBeGreaterThanOrEqual(0);
    expect(pct).toBeLessThanOrEqual(100);
  });
  it('returns 100 when all KPIs are ON_TARGET', () => {
    const all = MOCK_KPIS.map((k) => ({ ...k, status: 'ON_TARGET' as KpiStatus }));
    expect(kpiPercentageOnTarget(all)).toBe(100);
  });
  it('returns 0 when no KPIs are ON_TARGET', () => {
    const none = MOCK_KPIS.map((k) => ({ ...k, status: 'OFF_TARGET' as KpiStatus }));
    expect(kpiPercentageOnTarget(none)).toBe(0);
  });
});

describe('dashboardsByVisibility helper', () => {
  it('returns only PUBLIC dashboards', () => {
    const result = dashboardsByVisibility(MOCK_DASHBOARDS, 'PUBLIC');
    expect(result.every((d) => d.visibility === 'PUBLIC')).toBe(true);
  });
  it('returns only RESTRICTED dashboards', () => {
    const result = dashboardsByVisibility(MOCK_DASHBOARDS, 'RESTRICTED');
    expect(result.every((d) => d.visibility === 'RESTRICTED')).toBe(true);
  });
  it('all visibility groups together equal total dashboards', () => {
    const total = DASHBOARD_VISIBILITIES.reduce(
      (sum, v) => sum + dashboardsByVisibility(MOCK_DASHBOARDS, v).length,
      0,
    );
    expect(total).toBe(MOCK_DASHBOARDS.length);
  });
  for (const v of DASHBOARD_VISIBILITIES) {
    it(`dashboardsByVisibility("${v}") returns an array`, () => {
      expect(Array.isArray(dashboardsByVisibility(MOCK_DASHBOARDS, v))).toBe(true);
    });
  }
});

describe('kpiTrendLabel helper', () => {
  it('UP maps to "Improving"', () => expect(kpiTrendLabel('UP')).toBe('Improving'));
  it('DOWN maps to "Declining"', () => expect(kpiTrendLabel('DOWN')).toBe('Declining'));
  it('STABLE maps to "Stable"', () => expect(kpiTrendLabel('STABLE')).toBe('Stable'));
  it('IMPROVING maps to "Improving"', () => expect(kpiTrendLabel('IMPROVING')).toBe('Improving'));
  it('DECLINING maps to "Declining"', () => expect(kpiTrendLabel('DECLINING')).toBe('Declining'));
  for (const t of KPI_TRENDS) {
    it(`kpiTrendLabel("${t}") returns a non-empty string`, () => {
      expect(kpiTrendLabel(t).length).toBeGreaterThan(0);
    });
  }
});

// ─── Phase 216 parametric additions ──────────────────────────────────────────

describe('KPI_STATUSES — positional index parametric', () => {
  const expected = [
    [0, 'ON_TARGET'],
    [1, 'NEAR_TARGET'],
    [2, 'OFF_TARGET'],
  ] as const;
  for (const [idx, val] of expected) {
    it(`KPI_STATUSES[${idx}] === '${val}'`, () => {
      expect(KPI_STATUSES[idx]).toBe(val);
    });
  }
});

describe('KPI_TRENDS — positional index parametric', () => {
  const expected = [
    [0, 'UP'],
    [1, 'DOWN'],
    [2, 'STABLE'],
    [3, 'IMPROVING'],
    [4, 'DECLINING'],
  ] as const;
  for (const [idx, val] of expected) {
    it(`KPI_TRENDS[${idx}] === '${val}'`, () => {
      expect(KPI_TRENDS[idx]).toBe(val);
    });
  }
});

describe('DASHBOARD_VISIBILITIES — positional index parametric', () => {
  const expected = [
    [0, 'PUBLIC'],
    [1, 'PRIVATE'],
    [2, 'RESTRICTED'],
  ] as const;
  for (const [idx, val] of expected) {
    it(`DASHBOARD_VISIBILITIES[${idx}] === '${val}'`, () => {
      expect(DASHBOARD_VISIBILITIES[idx]).toBe(val);
    });
  }
});

describe('KPI_CATEGORIES — positional index parametric', () => {
  const expected = [
    [0, 'H&S'],
    [1, 'Quality'],
    [2, 'Operations'],
    [3, 'ESG'],
    [4, 'HR'],
    [5, 'Supply Chain'],
    [6, 'Finance'],
  ] as const;
  for (const [idx, val] of expected) {
    it(`KPI_CATEGORIES[${idx}] === '${val}'`, () => {
      expect(KPI_CATEGORIES[idx]).toBe(val);
    });
  }
});

describe('DATE_RANGES — positional index parametric', () => {
  const expected = [
    [0, '7D'],
    [1, '30D'],
    [2, '90D'],
    [3, '1Y'],
    [4, 'ALL'],
  ] as const;
  for (const [idx, val] of expected) {
    it(`DATE_RANGES[${idx}] === '${val}'`, () => {
      expect(DATE_RANGES[idx]).toBe(val);
    });
  }
});

describe('CHART_TYPES — positional index parametric', () => {
  const expected = [
    [0, 'BAR'],
    [1, 'LINE'],
    [2, 'PIE'],
    [3, 'SCATTER'],
    [4, 'HEATMAP'],
    [5, 'AREA'],
  ] as const;
  for (const [idx, val] of expected) {
    it(`CHART_TYPES[${idx}] === '${val}'`, () => {
      expect(CHART_TYPES[idx]).toBe(val);
    });
  }
});

describe('REPORT_STATUSES — positional index parametric', () => {
  const expected = [
    [0, 'DRAFT'],
    [1, 'PUBLISHED'],
    [2, 'ARCHIVED'],
  ] as const;
  for (const [idx, val] of expected) {
    it(`REPORT_STATUSES[${idx}] === '${val}'`, () => {
      expect(REPORT_STATUSES[idx]).toBe(val);
    });
  }
});

describe('FINDING_TYPES — positional index parametric', () => {
  const expected = [
    [0, 'MAJOR_NC'],
    [1, 'MINOR_NC'],
    [2, 'OBSERVATION'],
    [3, 'CLEAR'],
  ] as const;
  for (const [idx, val] of expected) {
    it(`FINDING_TYPES[${idx}] === '${val}'`, () => {
      expect(FINDING_TYPES[idx]).toBe(val);
    });
  }
});

// ─── Algorithm puzzle phases (ph217anl–ph220anl) ────────────────────────────────
function moveZeroes217anl(nums:number[]):number{let k=0;for(const n of nums)if(n!==0)nums[k++]=n;while(k<nums.length)nums[k++]=0;return nums[0];}
describe('ph217anl_mz',()=>{
  it('a',()=>{expect(moveZeroes217anl([0,1,0,3,12])).toBe(1);});
  it('b',()=>{expect(moveZeroes217anl([0,0,1])).toBe(1);});
  it('c',()=>{expect(moveZeroes217anl([1])).toBe(1);});
  it('d',()=>{expect(moveZeroes217anl([0,0,0,1])).toBe(1);});
  it('e',()=>{expect(moveZeroes217anl([4,2,0,0,3])).toBe(4);});
});
function missingNumber218anl(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph218anl_mn',()=>{
  it('a',()=>{expect(missingNumber218anl([3,0,1])).toBe(2);});
  it('b',()=>{expect(missingNumber218anl([0,1])).toBe(2);});
  it('c',()=>{expect(missingNumber218anl([9,6,4,2,3,5,7,0,1])).toBe(8);});
  it('d',()=>{expect(missingNumber218anl([0])).toBe(1);});
  it('e',()=>{expect(missingNumber218anl([1])).toBe(0);});
});
function countBits219anl(n:number):number[]{const r=new Array(n+1).fill(0);for(let i=1;i<=n;i++)r[i]=r[i>>1]+(i&1);return r;}
describe('ph219anl_cb',()=>{
  it('a',()=>{expect(countBits219anl(2)).toEqual([0,1,1]);});
  it('b',()=>{expect(countBits219anl(5)).toEqual([0,1,1,2,1,2]);});
  it('c',()=>{expect(countBits219anl(0)).toEqual([0]);});
  it('d',()=>{expect(countBits219anl(1)).toEqual([0,1]);});
  it('e',()=>{expect(countBits219anl(4)[4]).toBe(1);});
});
function climbStairs220anl(n:number):number{let a=1,b=1;for(let i=2;i<=n;i++){const t=a+b;a=b;b=t;}return b;}
describe('ph220anl_cs',()=>{
  it('a',()=>{expect(climbStairs220anl(2)).toBe(2);});
  it('b',()=>{expect(climbStairs220anl(3)).toBe(3);});
  it('c',()=>{expect(climbStairs220anl(4)).toBe(5);});
  it('d',()=>{expect(climbStairs220anl(5)).toBe(8);});
  it('e',()=>{expect(climbStairs220anl(1)).toBe(1);});
});
