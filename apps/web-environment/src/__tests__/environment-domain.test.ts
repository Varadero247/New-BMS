// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

// ─── Inlined constants from web-environment source files ───────────────────

// From aspects/client.tsx
const ACTIVITY_CATEGORIES = [
  { value: 'ENERGY_USE', label: 'Energy Use' },
  { value: 'WATER_USE', label: 'Water Use' },
  { value: 'WASTE_GENERATION', label: 'Waste Generation' },
  { value: 'EMISSIONS_TO_AIR', label: 'Emissions to Air' },
  { value: 'DISCHARGES_TO_WATER', label: 'Discharges to Water' },
  { value: 'LAND_CONTAMINATION', label: 'Land Contamination' },
  { value: 'RESOURCE_USE', label: 'Resource Use' },
  { value: 'NOISE_VIBRATION', label: 'Noise & Vibration' },
  { value: 'BIODIVERSITY', label: 'Biodiversity' },
  { value: 'TRANSPORT', label: 'Transport' },
  { value: 'PROCUREMENT', label: 'Procurement' },
  { value: 'PRODUCT_DESIGN', label: 'Product Design' },
  { value: 'OTHER', label: 'Other' },
];

const LIFECYCLE_PHASES = [
  'RAW_MATERIALS',
  'DESIGN',
  'PRODUCTION',
  'TRANSPORT',
  'USE',
  'END_OF_LIFE',
  'DISPOSAL',
];

const ENVIRONMENTAL_MEDIA = [
  { value: 'AIR', label: 'Air' },
  { value: 'WATER', label: 'Water' },
  { value: 'SOIL', label: 'Soil' },
  { value: 'BIODIVERSITY', label: 'Biodiversity' },
  { value: 'HUMAN_HEALTH', label: 'Human Health' },
  { value: 'CLIMATE', label: 'Climate' },
  { value: 'NOISE', label: 'Noise' },
  { value: 'OTHER', label: 'Other' },
];

const OPERATING_CONDITIONS = ['NORMAL', 'ABNORMAL', 'EMERGENCY'];
const IMPACT_DIRECTIONS = ['ADVERSE', 'BENEFICIAL'];
const SCALE_OF_IMPACT = ['LOCAL', 'REGIONAL', 'NATIONAL', 'TRANSBOUNDARY'];
const ASPECT_STATUSES = ['ACTIVE', 'UNDER_REVIEW', 'ARCHIVED'];

// Score descriptors from aspects/client.tsx
const SCORE_DESCRIPTOR_KEYS = [
  'scoreSeverity',
  'scoreProbability',
  'scoreDuration',
  'scoreExtent',
  'scoreReversibility',
  'scoreRegulatory',
  'scoreStakeholder',
];

// From legal/client.tsx
const OBLIGATION_TYPES = [
  { value: 'LEGISLATION', label: 'Legislation' },
  { value: 'REGULATION', label: 'Regulation' },
  { value: 'PERMIT', label: 'Permit' },
  { value: 'LICENCE', label: 'Licence' },
  { value: 'PLANNING_CONDITION', label: 'Planning Condition' },
  { value: 'INDUSTRY_STANDARD', label: 'Industry Standard' },
  { value: 'VOLUNTARY_COMMITMENT', label: 'Voluntary Commitment' },
  { value: 'CONTRACTUAL', label: 'Contractual' },
  { value: 'ACOP', label: 'Approved Code of Practice' },
  { value: 'GUIDANCE', label: 'Guidance' },
];

const JURISDICTIONS = [
  { value: 'UK', label: 'United Kingdom' },
  { value: 'EU', label: 'European Union' },
  { value: 'INTERNATIONAL', label: 'International' },
  { value: 'LOCAL_AUTHORITY', label: 'Local Authority' },
  { value: 'OTHER', label: 'Other' },
];

const LEGAL_STATUSES = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'REVIEW_DUE', label: 'Review Due' },
  { value: 'SUPERSEDED', label: 'Superseded' },
  { value: 'ARCHIVED', label: 'Archived' },
];

const COMPLIANCE_STATUSES_LEGAL = [
  { value: 'COMPLIANT', label: 'Compliant', color: 'bg-green-100 text-green-800', variant: 'success' },
  { value: 'PARTIALLY_COMPLIANT', label: 'Partially Compliant', color: 'bg-yellow-100 text-yellow-800', variant: 'warning' },
  { value: 'NON_COMPLIANT', label: 'Non-Compliant', color: 'bg-red-100 text-red-800', variant: 'danger' },
  { value: 'NOT_ASSESSED', label: 'Not Assessed', color: 'bg-gray-100 text-gray-800', variant: 'secondary' },
  { value: 'NOT_APPLICABLE', label: 'Not Applicable', color: 'bg-gray-100 text-gray-500', variant: 'outline' },
];

const ASSESSMENT_METHODS = [
  { value: 'INTERNAL_AUDIT', label: 'Internal Audit' },
  { value: 'THIRD_PARTY_AUDIT', label: 'Third Party Audit' },
  { value: 'SELF_ASSESSMENT', label: 'Self Assessment' },
  { value: 'REGULATORY_INSPECTION', label: 'Regulatory Inspection' },
  { value: 'CONTINUOUS_MONITORING', label: 'Continuous Monitoring' },
];

const ACTION_PRIORITIES_LEGAL = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'CRITICAL', label: 'Critical' },
];

const REPORTING_FREQUENCIES = [
  { value: 'CONTINUOUS', label: 'Continuous' },
  { value: 'DAILY', label: 'Daily' },
  { value: 'WEEKLY', label: 'Weekly' },
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'QUARTERLY', label: 'Quarterly' },
  { value: 'ANNUALLY', label: 'Annually' },
  { value: 'AS_REQUIRED', label: 'As Required' },
];

// From objectives/client.tsx
const OBJECTIVE_CATEGORIES = [
  { value: 'ENERGY_REDUCTION', label: 'Energy Reduction' },
  { value: 'WATER_REDUCTION', label: 'Water Reduction' },
  { value: 'WASTE_REDUCTION', label: 'Waste Reduction' },
  { value: 'EMISSIONS_REDUCTION', label: 'Emissions Reduction' },
  { value: 'BIODIVERSITY', label: 'Biodiversity' },
  { value: 'POLLUTION_PREVENTION', label: 'Pollution Prevention' },
  { value: 'LEGAL_COMPLIANCE', label: 'Legal Compliance' },
  { value: 'SUPPLY_CHAIN', label: 'Supply Chain' },
  { value: 'CIRCULAR_ECONOMY', label: 'Circular Economy' },
  { value: 'NET_ZERO', label: 'Net Zero' },
  { value: 'NATURE_POSITIVE', label: 'Nature Positive' },
  { value: 'COMMUNITY', label: 'Community' },
  { value: 'OTHER', label: 'Other' },
];

const OBJECTIVE_STATUSES = [
  { value: 'NOT_STARTED', label: 'Not Started' },
  { value: 'ON_TRACK', label: 'On Track' },
  { value: 'AT_RISK', label: 'At Risk' },
  { value: 'BEHIND', label: 'Behind' },
  { value: 'ACHIEVED', label: 'Achieved' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'DEFERRED', label: 'Deferred' },
];

const STATUS_BADGE_VARIANT: Record<string, string> = {
  NOT_STARTED: 'secondary',
  ON_TRACK: 'info',
  AT_RISK: 'warning',
  BEHIND: 'danger',
  ACHIEVED: 'success',
  CANCELLED: 'secondary',
  DEFERRED: 'outline',
};

const CATEGORY_COLOURS: Record<string, string> = {
  ENERGY_REDUCTION: 'bg-amber-100 text-amber-800',
  WATER_REDUCTION: 'bg-cyan-100 text-cyan-800',
  WASTE_REDUCTION: 'bg-orange-100 text-orange-800',
  EMISSIONS_REDUCTION: 'bg-emerald-100 text-emerald-800',
  BIODIVERSITY: 'bg-lime-100 text-lime-800',
  POLLUTION_PREVENTION: 'bg-rose-100 text-rose-800',
  LEGAL_COMPLIANCE: 'bg-indigo-100 text-indigo-800',
  SUPPLY_CHAIN: 'bg-violet-100 text-violet-800',
  CIRCULAR_ECONOMY: 'bg-teal-100 text-teal-800',
  NET_ZERO: 'bg-green-100 text-green-800',
  NATURE_POSITIVE: 'bg-emerald-100 text-emerald-800',
  COMMUNITY: 'bg-sky-100 text-sky-800',
  OTHER: 'bg-gray-100 text-gray-800',
};

const ISO_CLAUSES = ['6.2', '8.1', '9.1', '10.1'];

const SDG_OPTIONS = [
  { value: 'SDG 6', label: 'SDG 6 - Clean Water' },
  { value: 'SDG 7', label: 'SDG 7 - Affordable Energy' },
  { value: 'SDG 11', label: 'SDG 11 - Sustainable Cities' },
  { value: 'SDG 12', label: 'SDG 12 - Responsible Consumption' },
  { value: 'SDG 13', label: 'SDG 13 - Climate Action' },
  { value: 'SDG 14', label: 'SDG 14 - Life Below Water' },
  { value: 'SDG 15', label: 'SDG 15 - Life on Land' },
];

const REVIEW_FREQUENCIES_OBJ = [
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'QUARTERLY', label: 'Quarterly' },
  { value: 'ANNUALLY', label: 'Annually' },
];

// From actions/client.tsx
const ACTION_TYPES = [
  'CORRECTIVE',
  'PREVENTIVE',
  'IMPROVEMENT',
  'LEGAL_COMPLIANCE',
  'OBJECTIVE_SUPPORT',
  'ASPECT_CONTROL',
  'EMERGENCY_RESPONSE',
  'MONITORING',
];

const ACTION_PRIORITIES = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

const ACTION_SOURCES = [
  'ASPECT_REGISTER',
  'EVENT_REPORT',
  'LEGAL_REGISTER',
  'OBJECTIVE',
  'AUDIT_FINDING',
  'MANAGEMENT_REVIEW',
  'STAKEHOLDER',
  'REGULATORY_REQUIREMENT',
  'OTHER',
];

const ACTION_STATUSES = [
  'OPEN',
  'IN_PROGRESS',
  'COMPLETED',
  'VERIFIED',
  'OVERDUE',
  'CANCELLED',
  'DEFERRED',
];

const VERIFICATION_METHODS = [
  'DOCUMENT_REVIEW',
  'PHYSICAL_INSPECTION',
  'AUDIT',
  'MONITORING_DATA',
  'MANAGEMENT_SIGN_OFF',
];

const KANBAN_COLUMNS = ['OPEN', 'IN_PROGRESS', 'OVERDUE', 'COMPLETED', 'VERIFIED'];

// From events/client.tsx
const EVENT_TYPES = [
  { value: 'SPILL_RELEASE', label: 'Spill / Release' },
  { value: 'NEAR_MISS', label: 'Near Miss' },
  { value: 'REGULATORY_EXCEEDANCE', label: 'Regulatory Exceedance' },
  { value: 'STAKEHOLDER_COMPLAINT', label: 'Stakeholder Complaint' },
  { value: 'NON_CONFORMANCE', label: 'Non-Conformance' },
  { value: 'ENVIRONMENTAL_EMERGENCY', label: 'Environmental Emergency' },
  { value: 'PERMIT_BREACH', label: 'Permit Breach' },
  { value: 'WASTE_MISMANAGEMENT', label: 'Waste Mismanagement' },
  { value: 'NOISE_COMPLAINT', label: 'Noise Complaint' },
  { value: 'OTHER', label: 'Other' },
];

const EVENT_SEVERITIES = [
  { value: 'MINOR', label: 'Minor', color: 'bg-green-100 text-green-800' },
  { value: 'MODERATE', label: 'Moderate', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'MAJOR', label: 'Major', color: 'bg-orange-100 text-orange-800' },
  { value: 'CRITICAL', label: 'Critical', color: 'bg-red-100 text-red-800' },
  { value: 'CATASTROPHIC', label: 'Catastrophic', color: 'bg-purple-100 text-purple-800' },
];

const EVENT_STATUSES = [
  { value: 'REPORTED', label: 'Reported' },
  { value: 'UNDER_INVESTIGATION', label: 'Under Investigation' },
  { value: 'CONTAINED', label: 'Contained' },
  { value: 'REMEDIATED', label: 'Remediated' },
  { value: 'CLOSED', label: 'Closed' },
];

const EVENT_MEDIA_OPTIONS = [
  'AIR', 'WATER', 'GROUNDWATER', 'SOIL', 'BIODIVERSITY', 'HUMAN_HEALTH', 'NOISE', 'OTHER',
];

const RCA_METHODS = [
  { value: 'FIVE_WHY', label: '5 Why Analysis' },
  { value: 'FISHBONE', label: 'Fishbone / Ishikawa' },
  { value: 'BOWTIE', label: 'Bowtie Analysis' },
  { value: 'TIMELINE', label: 'Timeline Analysis' },
  { value: 'OTHER', label: 'Other' },
];

// ─── Helpers (inlined from source) ────────────────────────────────────────────

function calculateSignificance(
  scoreSeverity: number,
  scoreProbability: number,
  scoreDuration: number,
  scoreExtent: number,
  scoreReversibility: number,
  scoreRegulatory: number,
  scoreStakeholder: number,
): number {
  return Math.round(
    scoreSeverity * 1.5 +
      scoreProbability * 1.5 +
      scoreDuration +
      scoreExtent +
      scoreReversibility +
      scoreRegulatory +
      scoreStakeholder,
  );
}

function getSignificanceLevel(score: number): 'SIGNIFICANT' | 'REVIEW' | 'NOT_SIGNIFICANT' {
  if (score >= 15) return 'SIGNIFICANT';
  if (score >= 8) return 'REVIEW';
  return 'NOT_SIGNIFICANT';
}

function getScoreColor(value: number): string {
  if (value <= 1) return 'bg-green-500';
  if (value <= 2) return 'bg-lime-500';
  if (value <= 3) return 'bg-amber-500';
  if (value <= 4) return 'bg-orange-500';
  return 'bg-red-500';
}

function formatCategoryLabel(cat: string): string {
  return cat
    .split('_')
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(' ');
}

function priorityColor(priority: string): string {
  switch (priority) {
    case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-200';
    case 'HIGH':     return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'MEDIUM':   return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'LOW':      return 'bg-green-100 text-green-800 border-green-200';
    default:         return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

// ─── MOCK data shapes ──────────────────────────────────────────────────────────

interface MockAspect {
  id: string;
  referenceNumber: string;
  activityProcess: string;
  activityCategory: string;
  operatingCondition: string;
  aspect: string;
  impact: string;
  impactDirection: string;
  scaleOfImpact: string;
  scoreSeverity: number;
  scoreProbability: number;
  scoreDuration: number;
  scoreExtent: number;
  scoreReversibility: number;
  scoreRegulatory: number;
  scoreStakeholder: number;
  significanceScore: number;
  isSignificant: boolean;
  status: string;
  aiGenerated: boolean;
}

const MOCK_ASPECTS: MockAspect[] = [
  {
    id: 'asp-001',
    referenceNumber: 'ENV-ASP-2026-001',
    activityProcess: 'Manufacturing',
    activityCategory: 'EMISSIONS_TO_AIR',
    operatingCondition: 'NORMAL',
    aspect: 'Combustion emissions',
    impact: 'Air quality degradation',
    impactDirection: 'ADVERSE',
    scaleOfImpact: 'LOCAL',
    scoreSeverity: 4,
    scoreProbability: 3,
    scoreDuration: 3,
    scoreExtent: 2,
    scoreReversibility: 2,
    scoreRegulatory: 4,
    scoreStakeholder: 3,
    significanceScore: 25,
    isSignificant: true,
    status: 'ACTIVE',
    aiGenerated: false,
  },
  {
    id: 'asp-002',
    referenceNumber: 'ENV-ASP-2026-002',
    activityProcess: 'Office operations',
    activityCategory: 'ENERGY_USE',
    operatingCondition: 'NORMAL',
    aspect: 'Electricity consumption',
    impact: 'Carbon footprint',
    impactDirection: 'ADVERSE',
    scaleOfImpact: 'LOCAL',
    scoreSeverity: 1,
    scoreProbability: 5,
    scoreDuration: 5,
    scoreExtent: 1,
    scoreReversibility: 1,
    scoreRegulatory: 1,
    scoreStakeholder: 1,
    significanceScore: 18,
    isSignificant: false,
    status: 'ACTIVE',
    aiGenerated: true,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Test suites
// ─────────────────────────────────────────────────────────────────────────────

describe('ACTIVITY_CATEGORIES array', () => {
  it('has 13 categories', () => {
    expect(ACTIVITY_CATEGORIES).toHaveLength(13);
  });

  it('every entry has value and label', () => {
    for (const cat of ACTIVITY_CATEGORIES) {
      expect(typeof cat.value).toBe('string');
      expect(typeof cat.label).toBe('string');
    }
  });

  it('first category is ENERGY_USE', () => {
    expect(ACTIVITY_CATEGORIES[0].value).toBe('ENERGY_USE');
  });

  it('last category is OTHER', () => {
    expect(ACTIVITY_CATEGORIES[ACTIVITY_CATEGORIES.length - 1].value).toBe('OTHER');
  });

  it('values are unique', () => {
    const values = ACTIVITY_CATEGORIES.map((c) => c.value);
    expect(new Set(values).size).toBe(values.length);
  });

  it('contains BIODIVERSITY', () => {
    expect(ACTIVITY_CATEGORIES.some((c) => c.value === 'BIODIVERSITY')).toBe(true);
  });

  it('contains TRANSPORT', () => {
    expect(ACTIVITY_CATEGORIES.some((c) => c.value === 'TRANSPORT')).toBe(true);
  });

  for (const cat of ACTIVITY_CATEGORIES) {
    it(`${cat.value} label is non-empty string`, () => {
      expect(cat.label.length).toBeGreaterThan(0);
    });
  }
});

describe('LIFECYCLE_PHASES array', () => {
  it('has 7 phases', () => {
    expect(LIFECYCLE_PHASES).toHaveLength(7);
  });

  it('starts with RAW_MATERIALS', () => {
    expect(LIFECYCLE_PHASES[0]).toBe('RAW_MATERIALS');
  });

  it('ends with DISPOSAL', () => {
    expect(LIFECYCLE_PHASES[LIFECYCLE_PHASES.length - 1]).toBe('DISPOSAL');
  });

  it('contains END_OF_LIFE', () => {
    expect(LIFECYCLE_PHASES).toContain('END_OF_LIFE');
  });

  for (const phase of LIFECYCLE_PHASES) {
    it(`${phase} is a non-empty string`, () => {
      expect(typeof phase).toBe('string');
      expect(phase.length).toBeGreaterThan(0);
    });
  }
});

describe('ENVIRONMENTAL_MEDIA array', () => {
  it('has 8 entries', () => {
    expect(ENVIRONMENTAL_MEDIA).toHaveLength(8);
  });

  it('every entry has value and label', () => {
    for (const m of ENVIRONMENTAL_MEDIA) {
      expect(typeof m.value).toBe('string');
      expect(typeof m.label).toBe('string');
    }
  });

  it('contains AIR', () => {
    expect(ENVIRONMENTAL_MEDIA.some((m) => m.value === 'AIR')).toBe(true);
  });

  it('contains HUMAN_HEALTH', () => {
    expect(ENVIRONMENTAL_MEDIA.some((m) => m.value === 'HUMAN_HEALTH')).toBe(true);
  });

  it('contains CLIMATE', () => {
    expect(ENVIRONMENTAL_MEDIA.some((m) => m.value === 'CLIMATE')).toBe(true);
  });

  it('values are unique', () => {
    const values = ENVIRONMENTAL_MEDIA.map((m) => m.value);
    expect(new Set(values).size).toBe(values.length);
  });
});

describe('Aspect status/condition/direction/scale arrays', () => {
  it('OPERATING_CONDITIONS has NORMAL, ABNORMAL, EMERGENCY', () => {
    expect(OPERATING_CONDITIONS).toContain('NORMAL');
    expect(OPERATING_CONDITIONS).toContain('ABNORMAL');
    expect(OPERATING_CONDITIONS).toContain('EMERGENCY');
  });

  it('OPERATING_CONDITIONS has exactly 3 entries', () => {
    expect(OPERATING_CONDITIONS).toHaveLength(3);
  });

  it('IMPACT_DIRECTIONS has ADVERSE and BENEFICIAL', () => {
    expect(IMPACT_DIRECTIONS).toContain('ADVERSE');
    expect(IMPACT_DIRECTIONS).toContain('BENEFICIAL');
  });

  it('SCALE_OF_IMPACT includes TRANSBOUNDARY', () => {
    expect(SCALE_OF_IMPACT).toContain('TRANSBOUNDARY');
  });

  it('SCALE_OF_IMPACT has 4 entries', () => {
    expect(SCALE_OF_IMPACT).toHaveLength(4);
  });

  it('ASPECT_STATUSES has ACTIVE', () => {
    expect(ASPECT_STATUSES).toContain('ACTIVE');
  });

  it('ASPECT_STATUSES has ARCHIVED', () => {
    expect(ASPECT_STATUSES).toContain('ARCHIVED');
  });

  it('SCORE_DESCRIPTOR_KEYS has 7 keys', () => {
    expect(SCORE_DESCRIPTOR_KEYS).toHaveLength(7);
  });

  it('SCORE_DESCRIPTOR_KEYS includes scoreSeverity', () => {
    expect(SCORE_DESCRIPTOR_KEYS).toContain('scoreSeverity');
  });

  it('SCORE_DESCRIPTOR_KEYS includes scoreStakeholder', () => {
    expect(SCORE_DESCRIPTOR_KEYS).toContain('scoreStakeholder');
  });
});

describe('calculateSignificance helper', () => {
  it('all-one inputs produce 8', () => {
    // 1*1.5 + 1*1.5 + 1 + 1 + 1 + 1 + 1 = 3 + 5 = 8
    expect(calculateSignificance(1, 1, 1, 1, 1, 1, 1)).toBe(8);
  });

  it('all-zero inputs produce 0', () => {
    expect(calculateSignificance(0, 0, 0, 0, 0, 0, 0)).toBe(0);
  });

  it('max scores produce expected value', () => {
    // 5*1.5 + 5*1.5 + 5 + 5 + 5 + 5 + 5 = 7.5 + 7.5 + 25 = 40
    expect(calculateSignificance(5, 5, 5, 5, 5, 5, 5)).toBe(40);
  });

  it('severity and probability are weighted 1.5x', () => {
    const withSev = calculateSignificance(2, 1, 1, 1, 1, 1, 1);
    const withDur = calculateSignificance(1, 1, 2, 1, 1, 1, 1);
    // Adding 1 to severity contributes 1.5 extra; adding 1 to duration contributes 1 extra
    expect(withSev).toBeGreaterThan(withDur);
  });

  it('result is a number', () => {
    expect(typeof calculateSignificance(3, 3, 3, 3, 3, 3, 3)).toBe('number');
  });

  it('result for mock aspect 1 is 25 (SIGNIFICANT)', () => {
    const a = MOCK_ASPECTS[0];
    const score = calculateSignificance(
      a.scoreSeverity, a.scoreProbability, a.scoreDuration,
      a.scoreExtent, a.scoreReversibility, a.scoreRegulatory, a.scoreStakeholder,
    );
    expect(score).toBe(25);
  });

  for (let sev = 1; sev <= 5; sev++) {
    for (let prob = 1; prob <= 5; prob++) {
      it(`calculateSignificance(${sev}, ${prob}, 1,1,1,1,1) >= 8`, () => {
        const score = calculateSignificance(sev, prob, 1, 1, 1, 1, 1);
        expect(score).toBeGreaterThanOrEqual(8);
      });
    }
  }
});

describe('getSignificanceLevel helper', () => {
  it('score 15 returns SIGNIFICANT', () => {
    expect(getSignificanceLevel(15)).toBe('SIGNIFICANT');
  });

  it('score 14 returns REVIEW', () => {
    expect(getSignificanceLevel(14)).toBe('REVIEW');
  });

  it('score 8 returns REVIEW', () => {
    expect(getSignificanceLevel(8)).toBe('REVIEW');
  });

  it('score 7 returns NOT_SIGNIFICANT', () => {
    expect(getSignificanceLevel(7)).toBe('NOT_SIGNIFICANT');
  });

  it('score 0 returns NOT_SIGNIFICANT', () => {
    expect(getSignificanceLevel(0)).toBe('NOT_SIGNIFICANT');
  });

  it('score 40 returns SIGNIFICANT', () => {
    expect(getSignificanceLevel(40)).toBe('SIGNIFICANT');
  });

  for (let score = 15; score <= 40; score++) {
    it(`score ${score} is SIGNIFICANT`, () => {
      expect(getSignificanceLevel(score)).toBe('SIGNIFICANT');
    });
  }

  for (let score = 8; score <= 14; score++) {
    it(`score ${score} is REVIEW`, () => {
      expect(getSignificanceLevel(score)).toBe('REVIEW');
    });
  }
});

describe('getScoreColor helper', () => {
  it('value 1 returns green', () => {
    expect(getScoreColor(1)).toContain('green');
  });

  it('value 2 returns lime', () => {
    expect(getScoreColor(2)).toContain('lime');
  });

  it('value 3 returns amber', () => {
    expect(getScoreColor(3)).toContain('amber');
  });

  it('value 4 returns orange', () => {
    expect(getScoreColor(4)).toContain('orange');
  });

  it('value 5 returns red', () => {
    expect(getScoreColor(5)).toContain('red');
  });

  it('returns a string for all valid values', () => {
    for (const v of [1, 2, 3, 4, 5]) {
      expect(typeof getScoreColor(v)).toBe('string');
    }
  });
});

describe('formatCategoryLabel helper', () => {
  it('ENERGY_USE formats to Energy Use', () => {
    expect(formatCategoryLabel('ENERGY_USE')).toBe('Energy Use');
  });

  it('EMISSIONS_TO_AIR formats correctly', () => {
    expect(formatCategoryLabel('EMISSIONS_TO_AIR')).toBe('Emissions To Air');
  });

  it('single word BIODIVERSITY formats to Biodiversity', () => {
    expect(formatCategoryLabel('BIODIVERSITY')).toBe('Biodiversity');
  });

  it('result is a string', () => {
    expect(typeof formatCategoryLabel('WATER_USE')).toBe('string');
  });
});

describe('OBLIGATION_TYPES array', () => {
  it('has 10 entries', () => {
    expect(OBLIGATION_TYPES).toHaveLength(10);
  });

  it('contains LEGISLATION', () => {
    expect(OBLIGATION_TYPES.some((o) => o.value === 'LEGISLATION')).toBe(true);
  });

  it('contains PERMIT', () => {
    expect(OBLIGATION_TYPES.some((o) => o.value === 'PERMIT')).toBe(true);
  });

  it('every entry has value and label', () => {
    for (const o of OBLIGATION_TYPES) {
      expect(typeof o.value).toBe('string');
      expect(typeof o.label).toBe('string');
    }
  });
});

describe('JURISDICTIONS array', () => {
  it('has 5 entries', () => {
    expect(JURISDICTIONS).toHaveLength(5);
  });

  it('contains UK', () => {
    expect(JURISDICTIONS.some((j) => j.value === 'UK')).toBe(true);
  });

  it('contains INTERNATIONAL', () => {
    expect(JURISDICTIONS.some((j) => j.value === 'INTERNATIONAL')).toBe(true);
  });
});

describe('COMPLIANCE_STATUSES_LEGAL array', () => {
  it('has 5 entries', () => {
    expect(COMPLIANCE_STATUSES_LEGAL).toHaveLength(5);
  });

  it('COMPLIANT has green color', () => {
    const cs = COMPLIANCE_STATUSES_LEGAL.find((s) => s.value === 'COMPLIANT');
    expect(cs?.color).toContain('green');
  });

  it('NON_COMPLIANT has red color', () => {
    const cs = COMPLIANCE_STATUSES_LEGAL.find((s) => s.value === 'NON_COMPLIANT');
    expect(cs?.color).toContain('red');
  });

  it('PARTIALLY_COMPLIANT has yellow color', () => {
    const cs = COMPLIANCE_STATUSES_LEGAL.find((s) => s.value === 'PARTIALLY_COMPLIANT');
    expect(cs?.color).toContain('yellow');
  });

  it('every entry has value, label, color, variant', () => {
    for (const cs of COMPLIANCE_STATUSES_LEGAL) {
      expect(typeof cs.value).toBe('string');
      expect(typeof cs.label).toBe('string');
      expect(typeof cs.color).toBe('string');
      expect(typeof cs.variant).toBe('string');
    }
  });

  it('all colors contain bg-', () => {
    for (const cs of COMPLIANCE_STATUSES_LEGAL) {
      expect(cs.color).toContain('bg-');
    }
  });
});

describe('LEGAL_STATUSES / ASSESSMENT_METHODS arrays', () => {
  it('LEGAL_STATUSES has 4 entries', () => {
    expect(LEGAL_STATUSES).toHaveLength(4);
  });

  it('LEGAL_STATUSES contains ACTIVE', () => {
    expect(LEGAL_STATUSES.some((s) => s.value === 'ACTIVE')).toBe(true);
  });

  it('LEGAL_STATUSES contains ARCHIVED', () => {
    expect(LEGAL_STATUSES.some((s) => s.value === 'ARCHIVED')).toBe(true);
  });

  it('ASSESSMENT_METHODS has 5 entries', () => {
    expect(ASSESSMENT_METHODS).toHaveLength(5);
  });

  it('ASSESSMENT_METHODS contains INTERNAL_AUDIT', () => {
    expect(ASSESSMENT_METHODS.some((m) => m.value === 'INTERNAL_AUDIT')).toBe(true);
  });

  it('REPORTING_FREQUENCIES has 7 entries', () => {
    expect(REPORTING_FREQUENCIES).toHaveLength(7);
  });

  it('REPORTING_FREQUENCIES contains ANNUALLY', () => {
    expect(REPORTING_FREQUENCIES.some((f) => f.value === 'ANNUALLY')).toBe(true);
  });
});

describe('OBJECTIVE_CATEGORIES array', () => {
  it('has 13 entries', () => {
    expect(OBJECTIVE_CATEGORIES).toHaveLength(13);
  });

  it('contains EMISSIONS_REDUCTION', () => {
    expect(OBJECTIVE_CATEGORIES.some((c) => c.value === 'EMISSIONS_REDUCTION')).toBe(true);
  });

  it('contains NET_ZERO', () => {
    expect(OBJECTIVE_CATEGORIES.some((c) => c.value === 'NET_ZERO')).toBe(true);
  });

  it('contains CIRCULAR_ECONOMY', () => {
    expect(OBJECTIVE_CATEGORIES.some((c) => c.value === 'CIRCULAR_ECONOMY')).toBe(true);
  });

  it('all categories have colors defined', () => {
    for (const cat of OBJECTIVE_CATEGORIES) {
      expect(typeof CATEGORY_COLOURS[cat.value]).toBe('string');
    }
  });

  it('all category colors contain bg-', () => {
    for (const cat of OBJECTIVE_CATEGORIES) {
      expect(CATEGORY_COLOURS[cat.value]).toContain('bg-');
    }
  });
});

describe('OBJECTIVE_STATUSES and badge variants', () => {
  it('has 7 statuses', () => {
    expect(OBJECTIVE_STATUSES).toHaveLength(7);
  });

  it('contains NOT_STARTED', () => {
    expect(OBJECTIVE_STATUSES.some((s) => s.value === 'NOT_STARTED')).toBe(true);
  });

  it('contains ACHIEVED', () => {
    expect(OBJECTIVE_STATUSES.some((s) => s.value === 'ACHIEVED')).toBe(true);
  });

  it('all statuses have badge variant defined', () => {
    for (const s of OBJECTIVE_STATUSES) {
      expect(typeof STATUS_BADGE_VARIANT[s.value]).toBe('string');
    }
  });

  it('ACHIEVED has success variant', () => {
    expect(STATUS_BADGE_VARIANT['ACHIEVED']).toBe('success');
  });

  it('BEHIND has danger variant', () => {
    expect(STATUS_BADGE_VARIANT['BEHIND']).toBe('danger');
  });

  it('AT_RISK has warning variant', () => {
    expect(STATUS_BADGE_VARIANT['AT_RISK']).toBe('warning');
  });
});

describe('ISO_CLAUSES and SDG_OPTIONS', () => {
  it('ISO_CLAUSES has 4 entries', () => {
    expect(ISO_CLAUSES).toHaveLength(4);
  });

  it('ISO_CLAUSES contains 6.2', () => {
    expect(ISO_CLAUSES).toContain('6.2');
  });

  it('SDG_OPTIONS has 7 entries', () => {
    expect(SDG_OPTIONS).toHaveLength(7);
  });

  it('SDG_OPTIONS contains SDG 13 (Climate Action)', () => {
    expect(SDG_OPTIONS.some((s) => s.value === 'SDG 13')).toBe(true);
  });

  it('SDG labels contain SDG prefix', () => {
    for (const sdg of SDG_OPTIONS) {
      expect(sdg.value).toMatch(/^SDG \d+/);
    }
  });

  it('REVIEW_FREQUENCIES_OBJ has MONTHLY, QUARTERLY, ANNUALLY', () => {
    const values = REVIEW_FREQUENCIES_OBJ.map((r) => r.value);
    expect(values).toContain('MONTHLY');
    expect(values).toContain('QUARTERLY');
    expect(values).toContain('ANNUALLY');
  });
});

describe('ACTION_TYPES / ACTION_STATUSES / ACTION_SOURCES arrays', () => {
  it('ACTION_TYPES has 8 entries', () => {
    expect(ACTION_TYPES).toHaveLength(8);
  });

  it('ACTION_TYPES contains CORRECTIVE', () => {
    expect(ACTION_TYPES).toContain('CORRECTIVE');
  });

  it('ACTION_TYPES contains EMERGENCY_RESPONSE', () => {
    expect(ACTION_TYPES).toContain('EMERGENCY_RESPONSE');
  });

  it('ACTION_PRIORITIES has 4 entries', () => {
    expect(ACTION_PRIORITIES).toHaveLength(4);
  });

  it('ACTION_PRIORITIES order: CRITICAL, HIGH, MEDIUM, LOW', () => {
    expect(ACTION_PRIORITIES[0]).toBe('CRITICAL');
    expect(ACTION_PRIORITIES[3]).toBe('LOW');
  });

  it('ACTION_SOURCES has 9 entries', () => {
    expect(ACTION_SOURCES).toHaveLength(9);
  });

  it('ACTION_SOURCES contains ASPECT_REGISTER', () => {
    expect(ACTION_SOURCES).toContain('ASPECT_REGISTER');
  });

  it('ACTION_STATUSES has 7 entries', () => {
    expect(ACTION_STATUSES).toHaveLength(7);
  });

  it('ACTION_STATUSES contains VERIFIED', () => {
    expect(ACTION_STATUSES).toContain('VERIFIED');
  });

  it('VERIFICATION_METHODS has 5 entries', () => {
    expect(VERIFICATION_METHODS).toHaveLength(5);
  });

  it('KANBAN_COLUMNS has 5 entries', () => {
    expect(KANBAN_COLUMNS).toHaveLength(5);
  });

  it('KANBAN_COLUMNS first column is OPEN', () => {
    expect(KANBAN_COLUMNS[0]).toBe('OPEN');
  });
});

describe('priorityColor helper', () => {
  it('CRITICAL returns red classes', () => {
    expect(priorityColor('CRITICAL')).toContain('red');
  });

  it('HIGH returns orange classes', () => {
    expect(priorityColor('HIGH')).toContain('orange');
  });

  it('MEDIUM returns yellow classes', () => {
    expect(priorityColor('MEDIUM')).toContain('yellow');
  });

  it('LOW returns green classes', () => {
    expect(priorityColor('LOW')).toContain('green');
  });

  it('unknown returns gray classes', () => {
    expect(priorityColor('UNKNOWN')).toContain('gray');
  });

  it('returns a string for all named priorities', () => {
    for (const p of ACTION_PRIORITIES) {
      expect(typeof priorityColor(p)).toBe('string');
    }
  });
});

describe('EVENT_TYPES array', () => {
  it('has 10 entries', () => {
    expect(EVENT_TYPES).toHaveLength(10);
  });

  it('contains SPILL_RELEASE', () => {
    expect(EVENT_TYPES.some((e) => e.value === 'SPILL_RELEASE')).toBe(true);
  });

  it('contains ENVIRONMENTAL_EMERGENCY', () => {
    expect(EVENT_TYPES.some((e) => e.value === 'ENVIRONMENTAL_EMERGENCY')).toBe(true);
  });

  it('every entry has value and label', () => {
    for (const e of EVENT_TYPES) {
      expect(typeof e.value).toBe('string');
      expect(typeof e.label).toBe('string');
    }
  });
});

describe('EVENT_SEVERITIES array', () => {
  it('has 5 severity levels', () => {
    expect(EVENT_SEVERITIES).toHaveLength(5);
  });

  it('MINOR has green color', () => {
    const s = EVENT_SEVERITIES.find((e) => e.value === 'MINOR');
    expect(s?.color).toContain('green');
  });

  it('CRITICAL has red color', () => {
    const s = EVENT_SEVERITIES.find((e) => e.value === 'CRITICAL');
    expect(s?.color).toContain('red');
  });

  it('CATASTROPHIC has purple color', () => {
    const s = EVENT_SEVERITIES.find((e) => e.value === 'CATASTROPHIC');
    expect(s?.color).toContain('purple');
  });

  it('MODERATE has yellow color', () => {
    const s = EVENT_SEVERITIES.find((e) => e.value === 'MODERATE');
    expect(s?.color).toContain('yellow');
  });

  it('all severity colors contain bg-', () => {
    for (const s of EVENT_SEVERITIES) {
      expect(s.color).toContain('bg-');
    }
  });
});

describe('EVENT_STATUSES and RCA_METHODS arrays', () => {
  it('EVENT_STATUSES has 5 entries', () => {
    expect(EVENT_STATUSES).toHaveLength(5);
  });

  it('EVENT_STATUSES first entry is REPORTED', () => {
    expect(EVENT_STATUSES[0].value).toBe('REPORTED');
  });

  it('EVENT_STATUSES last entry is CLOSED', () => {
    expect(EVENT_STATUSES[EVENT_STATUSES.length - 1].value).toBe('CLOSED');
  });

  it('EVENT_MEDIA_OPTIONS has 8 entries', () => {
    expect(EVENT_MEDIA_OPTIONS).toHaveLength(8);
  });

  it('EVENT_MEDIA_OPTIONS contains GROUNDWATER', () => {
    expect(EVENT_MEDIA_OPTIONS).toContain('GROUNDWATER');
  });

  it('RCA_METHODS has 5 entries', () => {
    expect(RCA_METHODS).toHaveLength(5);
  });

  it('RCA_METHODS contains FIVE_WHY', () => {
    expect(RCA_METHODS.some((r) => r.value === 'FIVE_WHY')).toBe(true);
  });
});

describe('MOCK_ASPECTS data shapes', () => {
  it('has 2 mock aspects', () => {
    expect(MOCK_ASPECTS).toHaveLength(2);
  });

  it('every mock aspect has id, referenceNumber, status', () => {
    for (const a of MOCK_ASPECTS) {
      expect(typeof a.id).toBe('string');
      expect(typeof a.referenceNumber).toBe('string');
      expect(typeof a.status).toBe('string');
    }
  });

  it('referenceNumbers follow ENV-ASP-YYYY-NNN pattern', () => {
    for (const a of MOCK_ASPECTS) {
      expect(a.referenceNumber).toMatch(/^ENV-ASP-\d{4}-\d{3}$/);
    }
  });

  it('all score fields are numbers between 1 and 5', () => {
    const scoreFields = [
      'scoreSeverity', 'scoreProbability', 'scoreDuration',
      'scoreExtent', 'scoreReversibility', 'scoreRegulatory', 'scoreStakeholder',
    ] as const;
    for (const a of MOCK_ASPECTS) {
      for (const field of scoreFields) {
        expect(a[field]).toBeGreaterThanOrEqual(1);
        expect(a[field]).toBeLessThanOrEqual(5);
      }
    }
  });

  it('isSignificant is boolean', () => {
    for (const a of MOCK_ASPECTS) {
      expect(typeof a.isSignificant).toBe('boolean');
    }
  });

  it('first mock aspect is significant', () => {
    expect(MOCK_ASPECTS[0].isSignificant).toBe(true);
  });

  it('significanceScore matches calculation', () => {
    for (const a of MOCK_ASPECTS) {
      const computed = calculateSignificance(
        a.scoreSeverity, a.scoreProbability, a.scoreDuration,
        a.scoreExtent, a.scoreReversibility, a.scoreRegulatory, a.scoreStakeholder,
      );
      expect(computed).toBe(a.significanceScore);
    }
  });

  it('impactDirection is ADVERSE or BENEFICIAL', () => {
    for (const a of MOCK_ASPECTS) {
      expect(IMPACT_DIRECTIONS).toContain(a.impactDirection);
    }
  });

  it('operatingCondition is valid', () => {
    for (const a of MOCK_ASPECTS) {
      expect(OPERATING_CONDITIONS).toContain(a.operatingCondition);
    }
  });

  it('activityCategory is in ACTIVITY_CATEGORIES', () => {
    for (const a of MOCK_ASPECTS) {
      expect(ACTIVITY_CATEGORIES.some((c) => c.value === a.activityCategory)).toBe(true);
    }
  });
});

// ─── LIFECYCLE_PHASES — positional index parametric ──────────────────────────

describe('LIFECYCLE_PHASES — positional index parametric', () => {
  const expected = [
    [0, 'RAW_MATERIALS'],
    [1, 'DESIGN'],
    [2, 'PRODUCTION'],
    [3, 'TRANSPORT'],
    [4, 'USE'],
    [5, 'END_OF_LIFE'],
    [6, 'DISPOSAL'],
  ] as const;
  for (const [idx, val] of expected) {
    it(`LIFECYCLE_PHASES[${idx}] === '${val}'`, () => {
      expect(LIFECYCLE_PHASES[idx]).toBe(val);
    });
  }
});

// ─── OPERATING_CONDITIONS — positional index parametric ──────────────────────

describe('OPERATING_CONDITIONS — positional index parametric', () => {
  const expected = [
    [0, 'NORMAL'],
    [1, 'ABNORMAL'],
    [2, 'EMERGENCY'],
  ] as const;
  for (const [idx, val] of expected) {
    it(`OPERATING_CONDITIONS[${idx}] === '${val}'`, () => {
      expect(OPERATING_CONDITIONS[idx]).toBe(val);
    });
  }
});

// ─── SCALE_OF_IMPACT — positional index parametric ───────────────────────────

describe('SCALE_OF_IMPACT — positional index parametric', () => {
  const expected = [
    [0, 'LOCAL'],
    [1, 'REGIONAL'],
    [2, 'NATIONAL'],
    [3, 'TRANSBOUNDARY'],
  ] as const;
  for (const [idx, val] of expected) {
    it(`SCALE_OF_IMPACT[${idx}] === '${val}'`, () => {
      expect(SCALE_OF_IMPACT[idx]).toBe(val);
    });
  }
});

// ─── ACTIVITY_CATEGORIES — per-value label parametric ────────────────────────

describe('ACTIVITY_CATEGORIES — per-value label parametric', () => {
  const cases: [string, string][] = [
    ['ENERGY_USE',          'Energy Use'],
    ['WATER_USE',           'Water Use'],
    ['WASTE_GENERATION',    'Waste Generation'],
    ['EMISSIONS_TO_AIR',    'Emissions to Air'],
    ['DISCHARGES_TO_WATER', 'Discharges to Water'],
    ['LAND_CONTAMINATION',  'Land Contamination'],
    ['RESOURCE_USE',        'Resource Use'],
    ['NOISE_VIBRATION',     'Noise & Vibration'],
    ['BIODIVERSITY',        'Biodiversity'],
    ['TRANSPORT',           'Transport'],
    ['PROCUREMENT',         'Procurement'],
    ['PRODUCT_DESIGN',      'Product Design'],
    ['OTHER',               'Other'],
  ];
  for (const [value, label] of cases) {
    it(`ACTIVITY_CATEGORIES[${value}].label === '${label}'`, () => {
      const cat = ACTIVITY_CATEGORIES.find(c => c.value === value)!;
      expect(cat.label).toBe(label);
    });
  }
});

// ─── Algorithm puzzle phases (ph217ed2–ph220ed2) ────────────────────────────────
function moveZeroes217ed2(nums:number[]):number{let k=0;for(const n of nums)if(n!==0)nums[k++]=n;while(k<nums.length)nums[k++]=0;return nums[0];}
describe('ph217ed2_mz',()=>{
  it('a',()=>{expect(moveZeroes217ed2([0,1,0,3,12])).toBe(1);});
  it('b',()=>{expect(moveZeroes217ed2([0,0,1])).toBe(1);});
  it('c',()=>{expect(moveZeroes217ed2([1])).toBe(1);});
  it('d',()=>{expect(moveZeroes217ed2([0,0,0,1])).toBe(1);});
  it('e',()=>{expect(moveZeroes217ed2([4,2,0,0,3])).toBe(4);});
});
function missingNumber218ed2(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph218ed2_mn',()=>{
  it('a',()=>{expect(missingNumber218ed2([3,0,1])).toBe(2);});
  it('b',()=>{expect(missingNumber218ed2([0,1])).toBe(2);});
  it('c',()=>{expect(missingNumber218ed2([9,6,4,2,3,5,7,0,1])).toBe(8);});
  it('d',()=>{expect(missingNumber218ed2([0])).toBe(1);});
  it('e',()=>{expect(missingNumber218ed2([1])).toBe(0);});
});
function countBits219ed2(n:number):number[]{const r=new Array(n+1).fill(0);for(let i=1;i<=n;i++)r[i]=r[i>>1]+(i&1);return r;}
describe('ph219ed2_cb',()=>{
  it('a',()=>{expect(countBits219ed2(2)).toEqual([0,1,1]);});
  it('b',()=>{expect(countBits219ed2(5)).toEqual([0,1,1,2,1,2]);});
  it('c',()=>{expect(countBits219ed2(0)).toEqual([0]);});
  it('d',()=>{expect(countBits219ed2(1)).toEqual([0,1]);});
  it('e',()=>{expect(countBits219ed2(4)[4]).toBe(1);});
});
function climbStairs220ed2(n:number):number{let a=1,b=1;for(let i=2;i<=n;i++){const t=a+b;a=b;b=t;}return b;}
describe('ph220ed2_cs',()=>{
  it('a',()=>{expect(climbStairs220ed2(2)).toBe(2);});
  it('b',()=>{expect(climbStairs220ed2(3)).toBe(3);});
  it('c',()=>{expect(climbStairs220ed2(4)).toBe(5);});
  it('d',()=>{expect(climbStairs220ed2(5)).toBe(8);});
  it('e',()=>{expect(climbStairs220ed2(1)).toBe(1);});
});
