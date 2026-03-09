// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

// ─── ISO 42001 AI Management System — Domain Spec Tests ─────────────────────

// ─── Enum arrays (mirrored from source pages) ───────────────────────────────

const aiSystemCategories = [
  'MACHINE_LEARNING',
  'DEEP_LEARNING',
  'NLP',
  'COMPUTER_VISION',
  'GENERATIVE_AI',
  'ROBOTICS',
  'RECOMMENDATION',
  'OTHER',
];

const aiRiskTiers = ['UNACCEPTABLE', 'HIGH', 'LIMITED', 'MINIMAL'];

const aiSystemStatuses = ['DRAFT', 'ACTIVE', 'UNDER_REVIEW', 'DECOMMISSIONED', 'SUSPENDED'];

const riskAssessmentCategories = [
  'BIAS_DISCRIMINATION',
  'PRIVACY',
  'SECURITY',
  'TRANSPARENCY',
  'ACCOUNTABILITY',
  'SAFETY',
  'HUMAN_OVERSIGHT',
  'DATA_GOVERNANCE',
  'OTHER',
];

const riskAssessmentStatuses = ['IDENTIFIED', 'ASSESSED', 'MITIGATING', 'ACCEPTED', 'CLOSED'];

const impactLevelOptions = ['NEGLIGIBLE', 'LOW', 'MODERATE', 'HIGH', 'VERY_HIGH'];
const impactAssessmentStatuses = ['DRAFT', 'IN_PROGRESS', 'COMPLETED', 'APPROVED', 'ARCHIVED'];

const impactDimensions = [
  { key: 'accuracyScore', label: 'Accuracy' },
  { key: 'biasScore', label: 'Bias' },
  { key: 'privacyScore', label: 'Privacy' },
  { key: 'safetyScore', label: 'Safety' },
  { key: 'autonomyScore', label: 'Autonomy' },
];

const impactDomains = [
  'humanRightsImpact',
  'safetyImpact',
  'privacyImpact',
  'biasImpact',
  'transparencyImpact',
];

// ─── Badge / colour maps (mirrored from source pages) ───────────────────────

const aiSystemStatusColors: Record<string, string> = {
  DRAFT: 'bg-gray-100 dark:bg-gray-800 text-gray-700',
  ACTIVE: 'bg-green-100 text-green-700',
  UNDER_REVIEW: 'bg-yellow-100 text-yellow-700',
  DECOMMISSIONED: 'bg-red-100 text-red-700',
  SUSPENDED: 'bg-orange-100 text-orange-700',
};

const riskTierColors: Record<string, string> = {
  UNACCEPTABLE: 'bg-red-100 text-red-700',
  HIGH: 'bg-orange-100 text-orange-700',
  LIMITED: 'bg-yellow-100 text-yellow-700',
  MINIMAL: 'bg-green-100 text-green-700',
};

const riskAssessmentStatusColors: Record<string, string> = {
  IDENTIFIED: 'bg-gray-100 dark:bg-gray-800 text-gray-700',
  ASSESSED: 'bg-blue-100 text-blue-700',
  MITIGATING: 'bg-yellow-100 text-yellow-700',
  ACCEPTED: 'bg-green-100 text-green-700',
  CLOSED: 'bg-gray-100 dark:bg-gray-800 text-gray-700',
};

const impactColors: Record<string, string> = {
  NEGLIGIBLE: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 dark:bg-gray-800 dark:text-gray-400',
  LOW: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  MODERATE: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  HIGH: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  VERY_HIGH: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const impactAssessmentStatusColors: Record<string, string> = {
  DRAFT: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 dark:bg-gray-800 dark:text-gray-400',
  IN_PROGRESS: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  COMPLETED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  APPROVED: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  ARCHIVED: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
};

// ─── Pure helpers (mirrored / derived from source pages) ────────────────────

function getRiskColor(score: number): string {
  if (score >= 20) return 'bg-red-100 text-red-700';
  if (score >= 12) return 'bg-orange-100 text-orange-700';
  if (score >= 6) return 'bg-yellow-100 text-yellow-700';
  return 'bg-green-100 text-green-700';
}

function isProhibited(riskTier: string): boolean {
  return riskTier === 'UNACCEPTABLE';
}

function requiresImpactAssessment(riskTier: string): boolean {
  return riskTier === 'HIGH' || riskTier === 'UNACCEPTABLE';
}

function isSystemActive(status: string): boolean {
  return status === 'ACTIVE';
}

function computeRiskScore(likelihood: number, impact: number): number {
  return likelihood * impact;
}

function dimensionScoreToRating(score: number): string {
  if (score >= 8) return 'CRITICAL';
  if (score >= 5) return 'HIGH';
  if (score >= 3) return 'MEDIUM';
  return 'LOW';
}

function impactLevelRank(level: string): number {
  const ranks: Record<string, number> = {
    NEGLIGIBLE: 0, LOW: 1, MODERATE: 2, HIGH: 3, VERY_HIGH: 4,
  };
  return ranks[level] ?? -1;
}

function overallImpactScore(scores: (number | undefined)[]): number {
  const defined = scores.filter((s): s is number => s !== undefined);
  if (defined.length === 0) return 0;
  return Math.round(defined.reduce((a, b) => a + b, 0) / defined.length);
}

// ─── Mock data shapes ────────────────────────────────────────────────────────

interface AISystem {
  id: string;
  name: string;
  category: string;
  riskTier: string;
  status: string;
  owner: string;
  purpose?: string;
}

interface AIRiskAssessment {
  id: string;
  title: string;
  system: string;
  category: string;
  likelihood: number;
  impact: number;
  riskScore: number;
  status: string;
  mitigationPlan?: string;
  owner?: string;
}

interface ImpactAssessment {
  id: string;
  title: string;
  system: string;
  impactLevel: string;
  status: string;
  assessor?: string;
  accuracyScore?: number;
  biasScore?: number;
  privacyScore?: number;
  safetyScore?: number;
  autonomyScore?: number;
  approvedBy?: string;
}

const mockAISystems: AISystem[] = [
  { id: 'sys1', name: 'Fraud Detection Engine', category: 'MACHINE_LEARNING', riskTier: 'HIGH', status: 'ACTIVE', owner: 'Head of Risk', purpose: 'Detect anomalous transactions' },
  { id: 'sys2', name: 'Recruitment Screener', category: 'NLP', riskTier: 'HIGH', status: 'UNDER_REVIEW', owner: 'HR Director' },
  { id: 'sys3', name: 'Product Recommender', category: 'RECOMMENDATION', riskTier: 'MINIMAL', status: 'ACTIVE', owner: 'CTO', purpose: 'Personalise product suggestions' },
  { id: 'sys4', name: 'Facial Recognition System', category: 'COMPUTER_VISION', riskTier: 'UNACCEPTABLE', status: 'SUSPENDED', owner: 'CISO' },
  { id: 'sys5', name: 'Generative Content Tool', category: 'GENERATIVE_AI', riskTier: 'LIMITED', status: 'DRAFT', owner: 'Marketing Lead' },
];

const mockRiskAssessments: AIRiskAssessment[] = [
  { id: 'ra1', title: 'Bias in recruitment model', system: 'Recruitment Screener', category: 'BIAS_DISCRIMINATION', likelihood: 4, impact: 5, riskScore: 20, status: 'ASSESSED' },
  { id: 'ra2', title: 'Privacy data leak risk', system: 'Fraud Detection Engine', category: 'PRIVACY', likelihood: 3, impact: 4, riskScore: 12, status: 'MITIGATING', mitigationPlan: 'Data anonymisation pipeline' },
  { id: 'ra3', title: 'Transparency of recommendations', system: 'Product Recommender', category: 'TRANSPARENCY', likelihood: 2, impact: 2, riskScore: 4, status: 'ACCEPTED' },
  { id: 'ra4', title: 'Human oversight gap', system: 'Fraud Detection Engine', category: 'HUMAN_OVERSIGHT', likelihood: 3, impact: 3, riskScore: 9, status: 'IDENTIFIED' },
];

const mockImpactAssessments: ImpactAssessment[] = [
  { id: 'ia1', title: 'Recruitment AI Impact Assessment', system: 'Recruitment Screener', impactLevel: 'HIGH', status: 'APPROVED', assessor: 'Ethics Board', accuracyScore: 7, biasScore: 8, privacyScore: 5, safetyScore: 3, autonomyScore: 6, approvedBy: 'Chief Ethics Officer' },
  { id: 'ia2', title: 'Fraud Engine Impact Assessment', system: 'Fraud Detection Engine', impactLevel: 'MODERATE', status: 'COMPLETED', assessor: 'Risk Team', accuracyScore: 4, biasScore: 5, privacyScore: 7, safetyScore: 2, autonomyScore: 3 },
  { id: 'ia3', title: 'Recommender IA', system: 'Product Recommender', impactLevel: 'LOW', status: 'DRAFT', accuracyScore: 2, biasScore: 1, privacyScore: 2, safetyScore: 1, autonomyScore: 2 },
];

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('ISO 42001 — AI system category array', () => {
  it('has 8 categories', () => {
    expect(aiSystemCategories).toHaveLength(8);
  });
  it('includes MACHINE_LEARNING', () => {
    expect(aiSystemCategories).toContain('MACHINE_LEARNING');
  });
  it('includes GENERATIVE_AI', () => {
    expect(aiSystemCategories).toContain('GENERATIVE_AI');
  });
  it('includes NLP', () => {
    expect(aiSystemCategories).toContain('NLP');
  });
  it('includes COMPUTER_VISION', () => {
    expect(aiSystemCategories).toContain('COMPUTER_VISION');
  });
  it('includes OTHER as catch-all', () => {
    expect(aiSystemCategories).toContain('OTHER');
  });
  for (const cat of aiSystemCategories) {
    it(`category ${cat} is a non-empty string`, () => {
      expect(typeof cat).toBe('string');
      expect(cat.length).toBeGreaterThan(0);
    });
  }
});

describe('ISO 42001 — AI risk tier array (EU AI Act alignment)', () => {
  it('has 4 risk tiers', () => {
    expect(aiRiskTiers).toHaveLength(4);
  });
  it('UNACCEPTABLE is a tier', () => {
    expect(aiRiskTiers).toContain('UNACCEPTABLE');
  });
  it('MINIMAL is a tier', () => {
    expect(aiRiskTiers).toContain('MINIMAL');
  });
  for (const tier of aiRiskTiers) {
    it(`tier ${tier} has a colour entry`, () => {
      expect(riskTierColors[tier]).toBeDefined();
    });
    it(`tier ${tier} colour includes bg- prefix`, () => {
      expect(riskTierColors[tier]).toContain('bg-');
    });
  }
  it('UNACCEPTABLE is red', () => {
    expect(riskTierColors.UNACCEPTABLE).toContain('red');
  });
  it('MINIMAL is green', () => {
    expect(riskTierColors.MINIMAL).toContain('green');
  });
  it('HIGH is orange', () => {
    expect(riskTierColors.HIGH).toContain('orange');
  });
  it('LIMITED is yellow', () => {
    expect(riskTierColors.LIMITED).toContain('yellow');
  });
});

describe('ISO 42001 — AI system status array', () => {
  it('has 5 statuses', () => {
    expect(aiSystemStatuses).toHaveLength(5);
  });
  it('starts with DRAFT', () => {
    expect(aiSystemStatuses[0]).toBe('DRAFT');
  });
  for (const status of aiSystemStatuses) {
    it(`status ${status} has a colour entry`, () => {
      expect(aiSystemStatusColors[status]).toBeDefined();
    });
  }
  it('ACTIVE is green', () => {
    expect(aiSystemStatusColors.ACTIVE).toContain('green');
  });
  it('DECOMMISSIONED is red', () => {
    expect(aiSystemStatusColors.DECOMMISSIONED).toContain('red');
  });
  it('SUSPENDED is orange', () => {
    expect(aiSystemStatusColors.SUSPENDED).toContain('orange');
  });
});

describe('ISO 42001 — isProhibited helper', () => {
  it('UNACCEPTABLE is prohibited', () => {
    expect(isProhibited('UNACCEPTABLE')).toBe(true);
  });
  it('HIGH is not prohibited', () => {
    expect(isProhibited('HIGH')).toBe(false);
  });
  it('LIMITED is not prohibited', () => {
    expect(isProhibited('LIMITED')).toBe(false);
  });
  it('MINIMAL is not prohibited', () => {
    expect(isProhibited('MINIMAL')).toBe(false);
  });
  for (const tier of aiRiskTiers) {
    it(`isProhibited(${tier}) returns a boolean`, () => {
      expect(typeof isProhibited(tier)).toBe('boolean');
    });
  }
});

describe('ISO 42001 — requiresImpactAssessment helper', () => {
  it('HIGH requires impact assessment', () => {
    expect(requiresImpactAssessment('HIGH')).toBe(true);
  });
  it('UNACCEPTABLE requires impact assessment', () => {
    expect(requiresImpactAssessment('UNACCEPTABLE')).toBe(true);
  });
  it('LIMITED does not require impact assessment', () => {
    expect(requiresImpactAssessment('LIMITED')).toBe(false);
  });
  it('MINIMAL does not require impact assessment', () => {
    expect(requiresImpactAssessment('MINIMAL')).toBe(false);
  });
  for (const tier of aiRiskTiers) {
    it(`requiresImpactAssessment(${tier}) returns a boolean`, () => {
      expect(typeof requiresImpactAssessment(tier)).toBe('boolean');
    });
  }
  it('exactly 2 tiers require impact assessment', () => {
    const required = aiRiskTiers.filter(requiresImpactAssessment);
    expect(required).toHaveLength(2);
  });
});

describe('ISO 42001 — isSystemActive helper', () => {
  it('ACTIVE returns true', () => {
    expect(isSystemActive('ACTIVE')).toBe(true);
  });
  it('DRAFT returns false', () => {
    expect(isSystemActive('DRAFT')).toBe(false);
  });
  it('UNDER_REVIEW returns false', () => {
    expect(isSystemActive('UNDER_REVIEW')).toBe(false);
  });
  it('SUSPENDED returns false', () => {
    expect(isSystemActive('SUSPENDED')).toBe(false);
  });
  it('DECOMMISSIONED returns false', () => {
    expect(isSystemActive('DECOMMISSIONED')).toBe(false);
  });
  for (const status of aiSystemStatuses) {
    it(`isSystemActive(${status}) returns a boolean`, () => {
      expect(typeof isSystemActive(status)).toBe('boolean');
    });
  }
});

describe('ISO 42001 — risk assessment category array', () => {
  it('has 9 categories', () => {
    expect(riskAssessmentCategories).toHaveLength(9);
  });
  it('includes BIAS_DISCRIMINATION', () => {
    expect(riskAssessmentCategories).toContain('BIAS_DISCRIMINATION');
  });
  it('includes HUMAN_OVERSIGHT', () => {
    expect(riskAssessmentCategories).toContain('HUMAN_OVERSIGHT');
  });
  it('includes DATA_GOVERNANCE', () => {
    expect(riskAssessmentCategories).toContain('DATA_GOVERNANCE');
  });
  for (const cat of riskAssessmentCategories) {
    it(`category ${cat} is a non-empty string`, () => {
      expect(typeof cat).toBe('string');
      expect(cat.length).toBeGreaterThan(0);
    });
  }
});

describe('ISO 42001 — risk assessment status colours', () => {
  for (const status of riskAssessmentStatuses) {
    it(`${status} has a defined colour`, () => {
      expect(riskAssessmentStatusColors[status]).toBeDefined();
    });
  }
  it('ASSESSED is blue', () => {
    expect(riskAssessmentStatusColors.ASSESSED).toContain('blue');
  });
  it('ACCEPTED is green', () => {
    expect(riskAssessmentStatusColors.ACCEPTED).toContain('green');
  });
  it('MITIGATING is yellow', () => {
    expect(riskAssessmentStatusColors.MITIGATING).toContain('yellow');
  });
});

describe('ISO 42001 — AI risk score computation (computeRiskScore)', () => {
  it('4 × 5 = 20', () => {
    expect(computeRiskScore(4, 5)).toBe(20);
  });
  it('5 × 5 = 25 (maximum)', () => {
    expect(computeRiskScore(5, 5)).toBe(25);
  });
  it('1 × 1 = 1', () => {
    expect(computeRiskScore(1, 1)).toBe(1);
  });
  it('0 × 5 = 0', () => {
    expect(computeRiskScore(0, 5)).toBe(0);
  });
  for (let l = 1; l <= 5; l++) {
    for (let i = 1; i <= 5; i++) {
      it(`computeRiskScore(${l}, ${i}) equals ${l * i}`, () => {
        expect(computeRiskScore(l, i)).toBe(l * i);
      });
    }
  }
});

describe('ISO 42001 — getRiskColor thresholds', () => {
  it('score 20 is red (boundary)', () => {
    expect(getRiskColor(20)).toContain('red');
  });
  it('score 25 is red', () => {
    expect(getRiskColor(25)).toContain('red');
  });
  it('score 12 is orange (boundary)', () => {
    expect(getRiskColor(12)).toContain('orange');
  });
  it('score 19 is orange', () => {
    expect(getRiskColor(19)).toContain('orange');
  });
  it('score 6 is yellow (boundary)', () => {
    expect(getRiskColor(6)).toContain('yellow');
  });
  it('score 11 is yellow', () => {
    expect(getRiskColor(11)).toContain('yellow');
  });
  it('score 5 is green', () => {
    expect(getRiskColor(5)).toContain('green');
  });
  it('score 0 is green', () => {
    expect(getRiskColor(0)).toContain('green');
  });
  for (let score = 0; score <= 25; score++) {
    it(`getRiskColor(${score}) returns non-empty string`, () => {
      const result = getRiskColor(score);
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  }
});

describe('ISO 42001 — impact level options', () => {
  it('has 5 levels', () => {
    expect(impactLevelOptions).toHaveLength(5);
  });
  it('starts with NEGLIGIBLE', () => {
    expect(impactLevelOptions[0]).toBe('NEGLIGIBLE');
  });
  it('ends with VERY_HIGH', () => {
    expect(impactLevelOptions[impactLevelOptions.length - 1]).toBe('VERY_HIGH');
  });
  for (const level of impactLevelOptions) {
    it(`${level} has a defined colour`, () => {
      expect(impactColors[level]).toBeDefined();
    });
    it(`${level} colour includes bg- prefix`, () => {
      expect(impactColors[level]).toContain('bg-');
    });
  }
  it('VERY_HIGH is red', () => {
    expect(impactColors.VERY_HIGH).toContain('red');
  });
  it('LOW is green', () => {
    expect(impactColors.LOW).toContain('green');
  });
  it('MODERATE is yellow', () => {
    expect(impactColors.MODERATE).toContain('yellow');
  });
  it('HIGH is orange', () => {
    expect(impactColors.HIGH).toContain('orange');
  });
});

describe('ISO 42001 — impactLevelRank ordering', () => {
  it('NEGLIGIBLE has lowest rank (0)', () => {
    expect(impactLevelRank('NEGLIGIBLE')).toBe(0);
  });
  it('VERY_HIGH has highest rank (4)', () => {
    expect(impactLevelRank('VERY_HIGH')).toBe(4);
  });
  it('levels are strictly ordered', () => {
    const ordered = ['NEGLIGIBLE', 'LOW', 'MODERATE', 'HIGH', 'VERY_HIGH'];
    for (let i = 0; i < ordered.length - 1; i++) {
      expect(impactLevelRank(ordered[i])).toBeLessThan(impactLevelRank(ordered[i + 1]));
    }
  });
  it('unknown level returns -1', () => {
    expect(impactLevelRank('UNKNOWN')).toBe(-1);
  });
  for (const level of impactLevelOptions) {
    it(`impactLevelRank(${level}) is a non-negative integer`, () => {
      const rank = impactLevelRank(level);
      expect(rank).toBeGreaterThanOrEqual(0);
      expect(Number.isInteger(rank)).toBe(true);
    });
  }
});

describe('ISO 42001 — impact assessment status colours', () => {
  for (const status of impactAssessmentStatuses) {
    it(`${status} has a defined colour`, () => {
      expect(impactAssessmentStatusColors[status]).toBeDefined();
    });
  }
  it('APPROVED is indigo', () => {
    expect(impactAssessmentStatusColors.APPROVED).toContain('indigo');
  });
  it('COMPLETED is green', () => {
    expect(impactAssessmentStatusColors.COMPLETED).toContain('green');
  });
  it('IN_PROGRESS is blue', () => {
    expect(impactAssessmentStatusColors.IN_PROGRESS).toContain('blue');
  });
  it('ARCHIVED is orange', () => {
    expect(impactAssessmentStatusColors.ARCHIVED).toContain('orange');
  });
});

describe('ISO 42001 — impact assessment dimensions', () => {
  it('has 5 dimensions', () => {
    expect(impactDimensions).toHaveLength(5);
  });
  it('includes accuracyScore', () => {
    const keys = impactDimensions.map((d) => d.key);
    expect(keys).toContain('accuracyScore');
  });
  it('includes biasScore', () => {
    const keys = impactDimensions.map((d) => d.key);
    expect(keys).toContain('biasScore');
  });
  it('includes autonomyScore', () => {
    const keys = impactDimensions.map((d) => d.key);
    expect(keys).toContain('autonomyScore');
  });
  for (const dim of impactDimensions) {
    it(`dimension ${dim.key} has a label`, () => {
      expect(dim.label).toBeTruthy();
    });
    it(`dimension ${dim.key} label is a non-empty string`, () => {
      expect(typeof dim.label).toBe('string');
      expect(dim.label.length).toBeGreaterThan(0);
    });
  }
});

describe('ISO 42001 — impact domain fields', () => {
  it('has 5 impact domain fields', () => {
    expect(impactDomains).toHaveLength(5);
  });
  it('includes humanRightsImpact', () => {
    expect(impactDomains).toContain('humanRightsImpact');
  });
  it('includes transparencyImpact', () => {
    expect(impactDomains).toContain('transparencyImpact');
  });
  for (const domain of impactDomains) {
    it(`domain field ${domain} ends with Impact`, () => {
      expect(domain.endsWith('Impact')).toBe(true);
    });
  }
});

describe('ISO 42001 — dimensionScoreToRating helper', () => {
  it('score 10 is CRITICAL', () => {
    expect(dimensionScoreToRating(10)).toBe('CRITICAL');
  });
  it('score 8 is CRITICAL (boundary)', () => {
    expect(dimensionScoreToRating(8)).toBe('CRITICAL');
  });
  it('score 7 is HIGH', () => {
    expect(dimensionScoreToRating(7)).toBe('HIGH');
  });
  it('score 5 is HIGH (boundary)', () => {
    expect(dimensionScoreToRating(5)).toBe('HIGH');
  });
  it('score 4 is MEDIUM', () => {
    expect(dimensionScoreToRating(4)).toBe('MEDIUM');
  });
  it('score 3 is MEDIUM (boundary)', () => {
    expect(dimensionScoreToRating(3)).toBe('MEDIUM');
  });
  it('score 2 is LOW', () => {
    expect(dimensionScoreToRating(2)).toBe('LOW');
  });
  it('score 0 is LOW', () => {
    expect(dimensionScoreToRating(0)).toBe('LOW');
  });
  for (let score = 0; score <= 10; score++) {
    it(`dimensionScoreToRating(${score}) returns a non-empty string`, () => {
      const result = dimensionScoreToRating(score);
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  }
});

describe('ISO 42001 — overallImpactScore helper', () => {
  it('empty array returns 0', () => {
    expect(overallImpactScore([])).toBe(0);
  });
  it('all undefined returns 0', () => {
    expect(overallImpactScore([undefined, undefined])).toBe(0);
  });
  it('single score returns that score', () => {
    expect(overallImpactScore([7])).toBe(7);
  });
  it('averages two scores', () => {
    expect(overallImpactScore([4, 6])).toBe(5);
  });
  it('rounds result to integer', () => {
    expect(Number.isInteger(overallImpactScore([1, 2, 3]))).toBe(true);
  });
  it('ignores undefined values in average', () => {
    expect(overallImpactScore([10, undefined])).toBe(10);
  });
  for (let score = 0; score <= 10; score++) {
    it(`overallImpactScore([${score}]) is ${score}`, () => {
      expect(overallImpactScore([score])).toBe(score);
    });
  }
});

describe('ISO 42001 — mock AI system data shapes', () => {
  it('mockAISystems has 5 records', () => {
    expect(mockAISystems).toHaveLength(5);
  });
  for (const sys of mockAISystems) {
    it(`system ${sys.id} has required fields`, () => {
      expect(sys.id).toBeTruthy();
      expect(sys.name).toBeTruthy();
      expect(sys.category).toBeTruthy();
      expect(sys.riskTier).toBeTruthy();
      expect(sys.status).toBeTruthy();
      expect(sys.owner).toBeTruthy();
    });
    it(`system ${sys.id} category is in categoryOptions`, () => {
      expect(aiSystemCategories).toContain(sys.category);
    });
    it(`system ${sys.id} riskTier is in riskTierOptions`, () => {
      expect(aiRiskTiers).toContain(sys.riskTier);
    });
    it(`system ${sys.id} status is in statusOptions`, () => {
      expect(aiSystemStatuses).toContain(sys.status);
    });
  }
  it('prohibited system is suspended or under review', () => {
    const prohibited = mockAISystems.filter((s) => isProhibited(s.riskTier));
    for (const sys of prohibited) {
      expect(['SUSPENDED', 'DECOMMISSIONED', 'UNDER_REVIEW']).toContain(sys.status);
    }
  });
  it('systems requiring impact assessment are identifiable', () => {
    const requiresIA = mockAISystems.filter((s) => requiresImpactAssessment(s.riskTier));
    expect(requiresIA.length).toBeGreaterThanOrEqual(1);
  });
});

describe('ISO 42001 — mock risk assessment data shapes', () => {
  it('mockRiskAssessments has 4 records', () => {
    expect(mockRiskAssessments).toHaveLength(4);
  });
  for (const ra of mockRiskAssessments) {
    it(`risk assessment ${ra.id} has required fields`, () => {
      expect(ra.id).toBeTruthy();
      expect(ra.title).toBeTruthy();
      expect(ra.system).toBeTruthy();
      expect(ra.category).toBeTruthy();
      expect(typeof ra.likelihood).toBe('number');
      expect(typeof ra.impact).toBe('number');
      expect(typeof ra.riskScore).toBe('number');
      expect(ra.status).toBeTruthy();
    });
    it(`risk assessment ${ra.id} riskScore equals likelihood × impact`, () => {
      expect(ra.riskScore).toBe(ra.likelihood * ra.impact);
    });
    it(`risk assessment ${ra.id} category is in categoryOptions`, () => {
      expect(riskAssessmentCategories).toContain(ra.category);
    });
    it(`risk assessment ${ra.id} status is in statusOptions`, () => {
      expect(riskAssessmentStatuses).toContain(ra.status);
    });
    it(`risk assessment ${ra.id} likelihood is 1–5`, () => {
      expect(ra.likelihood).toBeGreaterThanOrEqual(1);
      expect(ra.likelihood).toBeLessThanOrEqual(5);
    });
    it(`risk assessment ${ra.id} impact is 1–5`, () => {
      expect(ra.impact).toBeGreaterThanOrEqual(1);
      expect(ra.impact).toBeLessThanOrEqual(5);
    });
  }
});

describe('ISO 42001 — mock impact assessment data shapes', () => {
  it('mockImpactAssessments has 3 records', () => {
    expect(mockImpactAssessments).toHaveLength(3);
  });
  for (const ia of mockImpactAssessments) {
    it(`impact assessment ${ia.id} has required fields`, () => {
      expect(ia.id).toBeTruthy();
      expect(ia.title).toBeTruthy();
      expect(ia.system).toBeTruthy();
      expect(ia.impactLevel).toBeTruthy();
      expect(ia.status).toBeTruthy();
    });
    it(`impact assessment ${ia.id} impactLevel is in impactLevelOptions`, () => {
      expect(impactLevelOptions).toContain(ia.impactLevel);
    });
    it(`impact assessment ${ia.id} status is in statusOptions`, () => {
      expect(impactAssessmentStatuses).toContain(ia.status);
    });
    it(`impact assessment ${ia.id} dimension scores are 0–10 when defined`, () => {
      const scores = [ia.accuracyScore, ia.biasScore, ia.privacyScore, ia.safetyScore, ia.autonomyScore];
      for (const score of scores) {
        if (score !== undefined) {
          expect(score).toBeGreaterThanOrEqual(0);
          expect(score).toBeLessThanOrEqual(10);
        }
      }
    });
    it(`impact assessment ${ia.id} overallImpactScore is 0–10`, () => {
      const scores = [ia.accuracyScore, ia.biasScore, ia.privacyScore, ia.safetyScore, ia.autonomyScore];
      const overall = overallImpactScore(scores);
      expect(overall).toBeGreaterThanOrEqual(0);
      expect(overall).toBeLessThanOrEqual(10);
    });
  }
  it('approved assessments have approvedBy field', () => {
    const approved = mockImpactAssessments.filter((ia) => ia.status === 'APPROVED');
    for (const ia of approved) {
      expect(ia.approvedBy).toBeTruthy();
    }
  });
  it('impactLevel ranks are ordered correctly across mock data', () => {
    const ranked = [...mockImpactAssessments].sort(
      (a, b) => impactLevelRank(a.impactLevel) - impactLevelRank(b.impactLevel),
    );
    expect(impactLevelRank(ranked[0].impactLevel)).toBeLessThanOrEqual(
      impactLevelRank(ranked[ranked.length - 1].impactLevel),
    );
  });
});
