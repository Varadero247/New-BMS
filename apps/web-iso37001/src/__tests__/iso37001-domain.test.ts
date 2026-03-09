// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

// ─── ISO 37001 Anti-Bribery Management System — Domain Spec Tests ───────────

// ─── Enum arrays (mirrored from source pages) ───────────────────────────────

const riskAssessmentCategories = [
  'BRIBERY_OF_PUBLIC_OFFICIALS',
  'COMMERCIAL_BRIBERY',
  'FACILITATION_PAYMENTS',
  'GIFTS_HOSPITALITY',
  'POLITICAL_CONTRIBUTIONS',
  'CHARITABLE_DONATIONS',
  'SPONSORSHIPS',
  'THIRD_PARTY',
  'PROCUREMENT',
  'OTHER',
];

const riskAssessmentStatuses = ['DRAFT', 'ASSESSED', 'MITIGATED', 'ACCEPTED', 'CLOSED'];

const dueDiligenceThirdPartyTypes = ['SUPPLIER', 'AGENT', 'PARTNER', 'CONSULTANT'];
const dueDiligenceRiskLevels = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const dueDiligenceStatuses = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'REQUIRES_REVIEW'];

const giftTypes = ['GIFT', 'HOSPITALITY', 'ENTERTAINMENT', 'TRAVEL'];
const giftDirections = ['GIVEN', 'RECEIVED'];
const giftApprovalStatuses = ['PENDING', 'APPROVED', 'REJECTED'];

const trainingTypes = ['ONLINE', 'CLASSROOM', 'WORKSHOP'];
const trainingStatuses = ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED'];

const commonCurrencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CNY', 'CHF'];

// ─── Badge / colour maps (mirrored from source pages) ───────────────────────

const riskAssessmentStatusColors: Record<string, string> = {
  DRAFT: 'bg-gray-100 dark:bg-gray-800 text-gray-700',
  ASSESSED: 'bg-blue-100 text-blue-700',
  MITIGATED: 'bg-green-100 text-green-700',
  ACCEPTED: 'bg-yellow-100 text-yellow-700',
  CLOSED: 'bg-gray-100 dark:bg-gray-800 text-gray-700',
};

const dueDiligenceRiskColors: Record<string, string> = {
  LOW: 'bg-green-100 text-green-700',
  MEDIUM: 'bg-yellow-100 text-yellow-700',
  HIGH: 'bg-orange-100 text-orange-700',
  CRITICAL: 'bg-red-100 text-red-700',
};

const dueDiligenceStatusColors: Record<string, string> = {
  PENDING: 'bg-gray-100 dark:bg-gray-800 text-gray-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-green-100 text-green-700',
  REQUIRES_REVIEW: 'bg-orange-100 text-orange-700',
};

const giftTypeColors: Record<string, string> = {
  GIFT: 'bg-purple-100 text-purple-700',
  HOSPITALITY: 'bg-blue-100 text-blue-700',
  ENTERTAINMENT: 'bg-indigo-100 text-indigo-700',
  TRAVEL: 'bg-cyan-100 text-cyan-700',
};

const giftApprovalColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
};

const trainingTypeColors: Record<string, string> = {
  ONLINE: 'bg-blue-100 text-blue-700',
  CLASSROOM: 'bg-indigo-100 text-indigo-700',
  WORKSHOP: 'bg-purple-100 text-purple-700',
};

const trainingStatusColors: Record<string, string> = {
  SCHEDULED: 'bg-gray-100 dark:bg-gray-800 text-gray-700',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-700',
  COMPLETED: 'bg-green-100 text-green-700',
};

// ─── Pure helpers (mirrored from source pages) ───────────────────────────────

function getRiskColor(score: number): string {
  if (score >= 20) return 'bg-red-100 text-red-700';
  if (score >= 12) return 'bg-orange-100 text-orange-700';
  if (score >= 6) return 'bg-yellow-100 text-yellow-700';
  return 'bg-green-100 text-green-700';
}

function getCompletionColor(rate: number): string {
  if (rate >= 90) return 'bg-green-500';
  if (rate >= 60) return 'bg-yellow-500';
  return 'bg-red-500';
}

function isHighRisk(riskLevel: string): boolean {
  return riskLevel === 'HIGH' || riskLevel === 'CRITICAL';
}

function requiresDueDiligenceReview(status: string): boolean {
  return status === 'REQUIRES_REVIEW';
}

function isGiftOverThreshold(value: number, threshold: number): boolean {
  return value > threshold;
}

function briberyRiskScore(likelihood: number, impact: number): number {
  return likelihood * impact;
}

function giftNeedsApproval(approvalStatus: string): boolean {
  return approvalStatus === 'PENDING';
}

function isTrainingOverdue(status: string, dueDate: string | null): boolean {
  if (status === 'COMPLETED') return false;
  if (!dueDate) return false;
  return new Date(dueDate) < new Date();
}

function avgCompletionRate(rates: number[]): number {
  if (rates.length === 0) return 0;
  return Math.round(rates.reduce((s, r) => s + r, 0) / rates.length);
}

// ─── Mock data shapes ────────────────────────────────────────────────────────

interface RiskAssessment {
  id: string;
  title: string;
  category: string;
  likelihood: number;
  impact: number;
  riskScore: number;
  status: string;
  owner?: string;
  reviewDate?: string;
  mitigationMeasures?: string;
  residualRisk?: string;
}

interface DueDiligenceRecord {
  id: string;
  thirdPartyName: string;
  type: string;
  riskLevel: string;
  status: string;
  findings?: string;
  reviewer?: string;
}

interface GiftRecord {
  id: string;
  description: string;
  type: string;
  value: number;
  currency: string;
  givenOrReceived: string;
  counterparty: string;
  approvalStatus: string;
  approvedBy?: string;
  date: string;
}

interface TrainingRecord {
  id: string;
  title: string;
  type: string;
  status: string;
  completionRate: number;
  dueDate?: string;
  participants?: string;
  facilitator?: string;
}

const mockRiskAssessments: RiskAssessment[] = [
  { id: 'r1', title: 'Public Official Bribery Risk', category: 'BRIBERY_OF_PUBLIC_OFFICIALS', likelihood: 3, impact: 5, riskScore: 15, status: 'ASSESSED', owner: 'Chief Compliance Officer' },
  { id: 'r2', title: 'Third-Party Agent Risk', category: 'THIRD_PARTY', likelihood: 4, impact: 4, riskScore: 16, status: 'MITIGATED', mitigationMeasures: 'Background checks, contractual clauses' },
  { id: 'r3', title: 'Gifts to Procurement Officials', category: 'GIFTS_HOSPITALITY', likelihood: 2, impact: 3, riskScore: 6, status: 'DRAFT' },
  { id: 'r4', title: 'Facilitation Payment Pressure', category: 'FACILITATION_PAYMENTS', likelihood: 1, impact: 2, riskScore: 2, status: 'ACCEPTED', residualRisk: 'LOW' },
];

const mockDueDiligence: DueDiligenceRecord[] = [
  { id: 'd1', thirdPartyName: 'Acme Suppliers Ltd', type: 'SUPPLIER', riskLevel: 'HIGH', status: 'IN_PROGRESS', reviewer: 'J. Smith' },
  { id: 'd2', thirdPartyName: 'Global Agents Co', type: 'AGENT', riskLevel: 'CRITICAL', status: 'REQUIRES_REVIEW', findings: 'PEP connections identified' },
  { id: 'd3', thirdPartyName: 'Tech Partners Inc', type: 'PARTNER', riskLevel: 'LOW', status: 'COMPLETED', reviewer: 'A. Jones' },
  { id: 'd4', thirdPartyName: 'Strategy Consultants', type: 'CONSULTANT', riskLevel: 'MEDIUM', status: 'PENDING' },
];

const mockGifts: GiftRecord[] = [
  { id: 'g1', description: 'Business dinner', type: 'HOSPITALITY', value: 250, currency: 'USD', givenOrReceived: 'RECEIVED', counterparty: 'Acme Corp', approvalStatus: 'APPROVED', approvedBy: 'CEO', date: '2026-01-15' },
  { id: 'g2', description: 'Conference travel', type: 'TRAVEL', value: 1200, currency: 'GBP', givenOrReceived: 'GIVEN', counterparty: 'Ministry of X', approvalStatus: 'PENDING', date: '2026-02-01' },
  { id: 'g3', description: 'Gift basket', type: 'GIFT', value: 85, currency: 'EUR', givenOrReceived: 'RECEIVED', counterparty: 'Supplier B', approvalStatus: 'REJECTED', date: '2026-01-20' },
  { id: 'g4', description: 'Client entertainment', type: 'ENTERTAINMENT', value: 500, currency: 'USD', givenOrReceived: 'GIVEN', counterparty: 'Client Corp', approvalStatus: 'APPROVED', approvedBy: 'COO', date: '2026-03-01' },
];

const mockTraining: TrainingRecord[] = [
  { id: 't1', title: 'Anti-Bribery Awareness for New Joiners', type: 'ONLINE', status: 'COMPLETED', completionRate: 100, participants: 'All Staff' },
  { id: 't2', title: 'ABMS Board Training', type: 'CLASSROOM', status: 'IN_PROGRESS', completionRate: 60, facilitator: 'External Counsel', dueDate: '2026-06-30' },
  { id: 't3', title: 'High-Risk Region Workshop', type: 'WORKSHOP', status: 'SCHEDULED', completionRate: 0, dueDate: '2026-04-15' },
];

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('ISO 37001 — risk assessment category array', () => {
  it('has 10 categories', () => {
    expect(riskAssessmentCategories).toHaveLength(10);
  });
  it('includes BRIBERY_OF_PUBLIC_OFFICIALS', () => {
    expect(riskAssessmentCategories).toContain('BRIBERY_OF_PUBLIC_OFFICIALS');
  });
  it('includes THIRD_PARTY', () => {
    expect(riskAssessmentCategories).toContain('THIRD_PARTY');
  });
  it('includes OTHER as catch-all', () => {
    expect(riskAssessmentCategories).toContain('OTHER');
  });
  for (const cat of riskAssessmentCategories) {
    it(`category ${cat} is a non-empty string`, () => {
      expect(typeof cat).toBe('string');
      expect(cat.length).toBeGreaterThan(0);
    });
  }
});

describe('ISO 37001 — risk assessment status array', () => {
  it('has 5 statuses', () => {
    expect(riskAssessmentStatuses).toHaveLength(5);
  });
  it('starts with DRAFT', () => {
    expect(riskAssessmentStatuses[0]).toBe('DRAFT');
  });
  it('ends with CLOSED', () => {
    expect(riskAssessmentStatuses[riskAssessmentStatuses.length - 1]).toBe('CLOSED');
  });
  it('includes MITIGATED', () => {
    expect(riskAssessmentStatuses).toContain('MITIGATED');
  });
  for (const status of riskAssessmentStatuses) {
    it(`status ${status} has a color entry`, () => {
      expect(riskAssessmentStatusColors[status]).toBeDefined();
    });
  }
});

describe('ISO 37001 — risk score colour thresholds (getRiskColor)', () => {
  it('score 25 is red', () => {
    expect(getRiskColor(25)).toContain('red');
  });
  it('score 20 is red (boundary)', () => {
    expect(getRiskColor(20)).toContain('red');
  });
  it('score 12 is orange (boundary)', () => {
    expect(getRiskColor(12)).toContain('orange');
  });
  it('score 15 is orange', () => {
    expect(getRiskColor(15)).toContain('orange');
  });
  it('score 6 is yellow (boundary)', () => {
    expect(getRiskColor(6)).toContain('yellow');
  });
  it('score 8 is yellow', () => {
    expect(getRiskColor(8)).toContain('yellow');
  });
  it('score 5 is green', () => {
    expect(getRiskColor(5)).toContain('green');
  });
  it('score 1 is green', () => {
    expect(getRiskColor(1)).toContain('green');
  });
  it('score 0 is green', () => {
    expect(getRiskColor(0)).toContain('green');
  });
  for (let score = 0; score <= 25; score++) {
    it(`getRiskColor(${score}) returns a non-empty string`, () => {
      const result = getRiskColor(score);
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  }
});

describe('ISO 37001 — bribery risk score computation', () => {
  it('3 × 5 = 15', () => {
    expect(briberyRiskScore(3, 5)).toBe(15);
  });
  it('5 × 5 = 25 (maximum)', () => {
    expect(briberyRiskScore(5, 5)).toBe(25);
  });
  it('1 × 1 = 1 (minimum positive)', () => {
    expect(briberyRiskScore(1, 1)).toBe(1);
  });
  it('0 × 5 = 0', () => {
    expect(briberyRiskScore(0, 5)).toBe(0);
  });
  for (let l = 1; l <= 5; l++) {
    for (let i = 1; i <= 5; i++) {
      it(`briberyRiskScore(${l}, ${i}) equals ${l * i}`, () => {
        expect(briberyRiskScore(l, i)).toBe(l * i);
      });
    }
  }
});

describe('ISO 37001 — due diligence risk level colours', () => {
  for (const level of dueDiligenceRiskLevels) {
    it(`${level} has a defined colour`, () => {
      expect(dueDiligenceRiskColors[level]).toBeDefined();
    });
    it(`${level} colour includes bg- prefix`, () => {
      expect(dueDiligenceRiskColors[level]).toContain('bg-');
    });
  }
  it('LOW is green', () => {
    expect(dueDiligenceRiskColors.LOW).toContain('green');
  });
  it('CRITICAL is red', () => {
    expect(dueDiligenceRiskColors.CRITICAL).toContain('red');
  });
  it('HIGH is orange', () => {
    expect(dueDiligenceRiskColors.HIGH).toContain('orange');
  });
  it('MEDIUM is yellow', () => {
    expect(dueDiligenceRiskColors.MEDIUM).toContain('yellow');
  });
});

describe('ISO 37001 — isHighRisk helper', () => {
  it('HIGH is high risk', () => {
    expect(isHighRisk('HIGH')).toBe(true);
  });
  it('CRITICAL is high risk', () => {
    expect(isHighRisk('CRITICAL')).toBe(true);
  });
  it('LOW is not high risk', () => {
    expect(isHighRisk('LOW')).toBe(false);
  });
  it('MEDIUM is not high risk', () => {
    expect(isHighRisk('MEDIUM')).toBe(false);
  });
  for (const level of dueDiligenceRiskLevels) {
    it(`isHighRisk(${level}) returns a boolean`, () => {
      expect(typeof isHighRisk(level)).toBe('boolean');
    });
  }
});

describe('ISO 37001 — due diligence status colours', () => {
  for (const status of dueDiligenceStatuses) {
    it(`${status} has a defined colour`, () => {
      expect(dueDiligenceStatusColors[status]).toBeDefined();
    });
  }
  it('IN_PROGRESS is blue', () => {
    expect(dueDiligenceStatusColors.IN_PROGRESS).toContain('blue');
  });
  it('COMPLETED is green', () => {
    expect(dueDiligenceStatusColors.COMPLETED).toContain('green');
  });
  it('REQUIRES_REVIEW is orange', () => {
    expect(dueDiligenceStatusColors.REQUIRES_REVIEW).toContain('orange');
  });
});

describe('ISO 37001 — requiresDueDiligenceReview helper', () => {
  it('REQUIRES_REVIEW returns true', () => {
    expect(requiresDueDiligenceReview('REQUIRES_REVIEW')).toBe(true);
  });
  it('COMPLETED returns false', () => {
    expect(requiresDueDiligenceReview('COMPLETED')).toBe(false);
  });
  it('PENDING returns false', () => {
    expect(requiresDueDiligenceReview('PENDING')).toBe(false);
  });
  it('IN_PROGRESS returns false', () => {
    expect(requiresDueDiligenceReview('IN_PROGRESS')).toBe(false);
  });
});

describe('ISO 37001 — gift type colours', () => {
  for (const type of giftTypes) {
    it(`${type} has a defined colour`, () => {
      expect(giftTypeColors[type]).toBeDefined();
    });
    it(`${type} colour includes bg- prefix`, () => {
      expect(giftTypeColors[type]).toContain('bg-');
    });
  }
});

describe('ISO 37001 — gift approval status colours', () => {
  for (const status of giftApprovalStatuses) {
    it(`${status} has a defined colour`, () => {
      expect(giftApprovalColors[status]).toBeDefined();
    });
  }
  it('APPROVED is green', () => {
    expect(giftApprovalColors.APPROVED).toContain('green');
  });
  it('REJECTED is red', () => {
    expect(giftApprovalColors.REJECTED).toContain('red');
  });
  it('PENDING is yellow', () => {
    expect(giftApprovalColors.PENDING).toContain('yellow');
  });
});

describe('ISO 37001 — isGiftOverThreshold helper', () => {
  it('value above threshold returns true', () => {
    expect(isGiftOverThreshold(150, 100)).toBe(true);
  });
  it('value at threshold returns false (not strictly over)', () => {
    expect(isGiftOverThreshold(100, 100)).toBe(false);
  });
  it('value below threshold returns false', () => {
    expect(isGiftOverThreshold(50, 100)).toBe(false);
  });
  it('zero value never exceeds positive threshold', () => {
    expect(isGiftOverThreshold(0, 100)).toBe(false);
  });
  for (let v = 0; v <= 200; v += 10) {
    it(`isGiftOverThreshold(${v}, 100) returns boolean`, () => {
      expect(typeof isGiftOverThreshold(v, 100)).toBe('boolean');
    });
  }
});

describe('ISO 37001 — giftNeedsApproval helper', () => {
  it('PENDING needs approval', () => {
    expect(giftNeedsApproval('PENDING')).toBe(true);
  });
  it('APPROVED does not need approval', () => {
    expect(giftNeedsApproval('APPROVED')).toBe(false);
  });
  it('REJECTED does not need approval', () => {
    expect(giftNeedsApproval('REJECTED')).toBe(false);
  });
});

describe('ISO 37001 — common currencies list', () => {
  it('includes 8 currencies', () => {
    expect(commonCurrencies).toHaveLength(8);
  });
  it('includes USD', () => {
    expect(commonCurrencies).toContain('USD');
  });
  it('includes GBP', () => {
    expect(commonCurrencies).toContain('GBP');
  });
  it('includes EUR', () => {
    expect(commonCurrencies).toContain('EUR');
  });
  for (const currency of commonCurrencies) {
    it(`currency ${currency} is a 3-character string`, () => {
      expect(currency).toHaveLength(3);
    });
  }
});

describe('ISO 37001 — training type colours', () => {
  for (const type of trainingTypes) {
    it(`${type} has a defined colour`, () => {
      expect(trainingTypeColors[type]).toBeDefined();
    });
    it(`${type} colour includes bg- prefix`, () => {
      expect(trainingTypeColors[type]).toContain('bg-');
    });
  }
  it('ONLINE is blue', () => {
    expect(trainingTypeColors.ONLINE).toContain('blue');
  });
  it('WORKSHOP is purple', () => {
    expect(trainingTypeColors.WORKSHOP).toContain('purple');
  });
});

describe('ISO 37001 — training status colours', () => {
  for (const status of trainingStatuses) {
    it(`${status} has a defined colour`, () => {
      expect(trainingStatusColors[status]).toBeDefined();
    });
  }
  it('COMPLETED is green', () => {
    expect(trainingStatusColors.COMPLETED).toContain('green');
  });
  it('IN_PROGRESS is yellow', () => {
    expect(trainingStatusColors.IN_PROGRESS).toContain('yellow');
  });
});

describe('ISO 37001 — getCompletionColor helper', () => {
  it('100% is green', () => {
    expect(getCompletionColor(100)).toContain('green');
  });
  it('90% is green (boundary)', () => {
    expect(getCompletionColor(90)).toContain('green');
  });
  it('89% is yellow', () => {
    expect(getCompletionColor(89)).toContain('yellow');
  });
  it('60% is yellow (boundary)', () => {
    expect(getCompletionColor(60)).toContain('yellow');
  });
  it('59% is red', () => {
    expect(getCompletionColor(59)).toContain('red');
  });
  it('0% is red', () => {
    expect(getCompletionColor(0)).toContain('red');
  });
  for (let rate = 0; rate <= 100; rate += 5) {
    it(`getCompletionColor(${rate}) returns non-empty string`, () => {
      const result = getCompletionColor(rate);
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  }
});

describe('ISO 37001 — isTrainingOverdue helper', () => {
  it('COMPLETED is never overdue', () => {
    expect(isTrainingOverdue('COMPLETED', '2020-01-01')).toBe(false);
  });
  it('null dueDate is never overdue', () => {
    expect(isTrainingOverdue('SCHEDULED', null)).toBe(false);
  });
  it('past due date makes non-completed record overdue', () => {
    expect(isTrainingOverdue('SCHEDULED', '2020-01-01')).toBe(true);
  });
  it('future due date is not overdue', () => {
    expect(isTrainingOverdue('IN_PROGRESS', '2099-12-31')).toBe(false);
  });
});

describe('ISO 37001 — avgCompletionRate helper', () => {
  it('empty array returns 0', () => {
    expect(avgCompletionRate([])).toBe(0);
  });
  it('single value returns that value', () => {
    expect(avgCompletionRate([80])).toBe(80);
  });
  it('100 + 0 = 50% average', () => {
    expect(avgCompletionRate([100, 0])).toBe(50);
  });
  it('rounds to nearest integer', () => {
    expect(avgCompletionRate([100, 0, 0])).toBe(33);
  });
  for (let rate = 0; rate <= 100; rate += 10) {
    it(`avgCompletionRate([${rate}]) returns ${rate}`, () => {
      expect(avgCompletionRate([rate])).toBe(rate);
    });
  }
});

describe('ISO 37001 — mock risk assessment data shapes', () => {
  it('mockRiskAssessments has 4 records', () => {
    expect(mockRiskAssessments).toHaveLength(4);
  });
  for (const ra of mockRiskAssessments) {
    it(`risk assessment ${ra.id} has required fields`, () => {
      expect(ra.id).toBeTruthy();
      expect(ra.title).toBeTruthy();
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

describe('ISO 37001 — mock due diligence data shapes', () => {
  it('mockDueDiligence has 4 records', () => {
    expect(mockDueDiligence).toHaveLength(4);
  });
  for (const dd of mockDueDiligence) {
    it(`due diligence ${dd.id} has required fields`, () => {
      expect(dd.id).toBeTruthy();
      expect(dd.thirdPartyName).toBeTruthy();
      expect(dd.type).toBeTruthy();
      expect(dd.riskLevel).toBeTruthy();
      expect(dd.status).toBeTruthy();
    });
    it(`due diligence ${dd.id} type is in typeOptions`, () => {
      expect(dueDiligenceThirdPartyTypes).toContain(dd.type);
    });
    it(`due diligence ${dd.id} riskLevel is in riskLevelOptions`, () => {
      expect(dueDiligenceRiskLevels).toContain(dd.riskLevel);
    });
    it(`due diligence ${dd.id} status is in statusOptions`, () => {
      expect(dueDiligenceStatuses).toContain(dd.status);
    });
  }
  it('high/critical risk records are identified correctly', () => {
    const highOrCritical = mockDueDiligence.filter((d) => isHighRisk(d.riskLevel));
    expect(highOrCritical.length).toBeGreaterThanOrEqual(2);
  });
});

describe('ISO 37001 — mock gifts register data shapes', () => {
  it('mockGifts has 4 records', () => {
    expect(mockGifts).toHaveLength(4);
  });
  for (const g of mockGifts) {
    it(`gift ${g.id} has required fields`, () => {
      expect(g.id).toBeTruthy();
      expect(g.description).toBeTruthy();
      expect(g.type).toBeTruthy();
      expect(typeof g.value).toBe('number');
      expect(g.currency).toBeTruthy();
      expect(g.givenOrReceived).toBeTruthy();
      expect(g.counterparty).toBeTruthy();
      expect(g.approvalStatus).toBeTruthy();
      expect(g.date).toBeTruthy();
    });
    it(`gift ${g.id} type is in giftTypes`, () => {
      expect(giftTypes).toContain(g.type);
    });
    it(`gift ${g.id} direction is in giftDirections`, () => {
      expect(giftDirections).toContain(g.givenOrReceived);
    });
    it(`gift ${g.id} approvalStatus is in giftApprovalStatuses`, () => {
      expect(giftApprovalStatuses).toContain(g.approvalStatus);
    });
    it(`gift ${g.id} currency is in commonCurrencies`, () => {
      expect(commonCurrencies).toContain(g.currency);
    });
    it(`gift ${g.id} value is non-negative`, () => {
      expect(g.value).toBeGreaterThanOrEqual(0);
    });
  }
  it('pending gifts can be identified via giftNeedsApproval', () => {
    const pending = mockGifts.filter((g) => giftNeedsApproval(g.approvalStatus));
    expect(pending.length).toBeGreaterThanOrEqual(1);
  });
  it('total USD received value is computable', () => {
    const total = mockGifts
      .filter((g) => g.givenOrReceived === 'RECEIVED' && g.currency === 'USD')
      .reduce((sum, g) => sum + g.value, 0);
    expect(total).toBeGreaterThanOrEqual(0);
  });
});

describe('ISO 37001 — mock training data shapes', () => {
  it('mockTraining has 3 records', () => {
    expect(mockTraining).toHaveLength(3);
  });
  for (const t of mockTraining) {
    it(`training ${t.id} has required fields`, () => {
      expect(t.id).toBeTruthy();
      expect(t.title).toBeTruthy();
      expect(t.type).toBeTruthy();
      expect(t.status).toBeTruthy();
      expect(typeof t.completionRate).toBe('number');
    });
    it(`training ${t.id} type is in trainingTypes`, () => {
      expect(trainingTypes).toContain(t.type);
    });
    it(`training ${t.id} status is in trainingStatuses`, () => {
      expect(trainingStatuses).toContain(t.status);
    });
    it(`training ${t.id} completionRate is 0–100`, () => {
      expect(t.completionRate).toBeGreaterThanOrEqual(0);
      expect(t.completionRate).toBeLessThanOrEqual(100);
    });
  }
  it('completed training has 100% completionRate', () => {
    const completed = mockTraining.filter((t) => t.status === 'COMPLETED');
    for (const t of completed) {
      expect(t.completionRate).toBe(100);
    }
  });
  it('avgCompletionRate across all mock training is 0–100', () => {
    const avg = avgCompletionRate(mockTraining.map((t) => t.completionRate));
    expect(avg).toBeGreaterThanOrEqual(0);
    expect(avg).toBeLessThanOrEqual(100);
  });
});
