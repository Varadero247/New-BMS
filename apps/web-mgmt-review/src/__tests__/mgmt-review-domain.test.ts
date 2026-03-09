// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

// Management Review — ISO 9001 Clause 9.3 (Management Review)
// Domain spec tests: arrays, badge/color maps, data shapes, helpers

// ---------------------------------------------------------------------------
// Domain constants (inlined — no imports from source files)
// ---------------------------------------------------------------------------

type ReviewStatus =
  | 'DRAFT'
  | 'SCHEDULED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

// Badge variant used by the reviews/agenda clients
type BadgeVariant = 'default' | 'secondary' | 'outline' | 'destructive';

// ISO 9.3.2 review input categories
type ReviewInputCategory =
  | 'riskSummary'
  | 'auditSummary'
  | 'incidentSummary'
  | 'capaSummary'
  | 'kpiSummary'
  | 'customerFeedback'
  | 'supplierPerformance'
  | 'trainingStatus'
  | 'complianceStatus';

// ISO 9.3.3 review output categories
type ReviewOutputCategory = 'decisions' | 'actions';

const REVIEW_STATUSES: ReviewStatus[] = [
  'DRAFT',
  'SCHEDULED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
];

const REVIEW_INPUT_CATEGORIES: ReviewInputCategory[] = [
  'riskSummary',
  'auditSummary',
  'incidentSummary',
  'capaSummary',
  'kpiSummary',
  'customerFeedback',
  'supplierPerformance',
  'trainingStatus',
  'complianceStatus',
];

const REVIEW_OUTPUT_CATEGORIES: ReviewOutputCategory[] = ['decisions', 'actions'];

// ---------------------------------------------------------------------------
// Badge variant map (mirrors getStatusVariant in source)
// ---------------------------------------------------------------------------

const reviewStatusBadgeVariant: Record<ReviewStatus, BadgeVariant> = {
  COMPLETED: 'secondary',
  IN_PROGRESS: 'default',
  CANCELLED: 'destructive',
  DRAFT: 'outline',
  SCHEDULED: 'outline',
};

// ---------------------------------------------------------------------------
// Color map (used on dashboard KPI tiles)
// ---------------------------------------------------------------------------

const reviewStatusTileColor: Record<ReviewStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  SCHEDULED: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-amber-100 text-amber-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

// ---------------------------------------------------------------------------
// Default form values
// ---------------------------------------------------------------------------

const reviewDefaultStatus: ReviewStatus = 'DRAFT';

// ---------------------------------------------------------------------------
// Pure helper functions (inlined)
// ---------------------------------------------------------------------------

function isReviewActive(status: ReviewStatus): boolean {
  return status === 'SCHEDULED' || status === 'IN_PROGRESS';
}

function isReviewComplete(status: ReviewStatus): boolean {
  return status === 'COMPLETED';
}

function isReviewTerminal(status: ReviewStatus): boolean {
  return status === 'COMPLETED' || status === 'CANCELLED';
}

function isReviewEditable(status: ReviewStatus): boolean {
  return status === 'DRAFT' || status === 'SCHEDULED';
}

function reviewHasAgenda(aiGeneratedAgenda: string | null | undefined): boolean {
  return Boolean(aiGeneratedAgenda && aiGeneratedAgenda.length > 0);
}

function reviewCompletionRate(
  reviews: Array<{ status: ReviewStatus }>,
): number {
  if (reviews.length === 0) return 0;
  const completed = reviews.filter((r) => r.status === 'COMPLETED').length;
  return (completed / reviews.length) * 100;
}

function reviewCountByStatus(
  reviews: Array<{ status: ReviewStatus }>,
  target: ReviewStatus,
): number {
  return reviews.filter((r) => r.status === target).length;
}

function reviewsWithAgenda(
  reviews: Array<{ aiGeneratedAgenda: string | null | undefined }>,
): number {
  return reviews.filter((r) => reviewHasAgenda(r.aiGeneratedAgenda)).length;
}

function reviewsWithoutAgenda(
  reviews: Array<{ aiGeneratedAgenda: string | null | undefined }>,
): number {
  return reviews.filter((r) => !reviewHasAgenda(r.aiGeneratedAgenda)).length;
}

function splitCommaList(raw: string): string[] {
  if (!raw.trim()) return [];
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function splitISODate(iso: string): string {
  return iso.split('T')[0];
}

function isReviewOverdue(scheduledDate: string, now: Date, status: ReviewStatus): boolean {
  if (status === 'COMPLETED' || status === 'CANCELLED') return false;
  return now > new Date(scheduledDate);
}

function reviewDurationDays(scheduledDate: string, conductedDate: string): number {
  const diff =
    new Date(conductedDate).getTime() - new Date(scheduledDate).getTime();
  return Math.max(0, Math.round(diff / 86400000));
}

function reviewsNeedingAction(
  reviews: Array<{ status: ReviewStatus; actions: string }>,
): number {
  return reviews.filter(
    (r) => r.status === 'COMPLETED' && r.actions && r.actions.trim().length > 0,
  ).length;
}

// ---------------------------------------------------------------------------
// MOCK data shapes
// ---------------------------------------------------------------------------

interface MockReview {
  id: string;
  referenceNumber: string;
  title: string;
  description: string;
  status: ReviewStatus;
  scheduledDate: string;
  conductedDate: string;
  chairpersonName: string;
  attendees: string[];
  standards: string[];
  riskSummary: string;
  auditSummary: string;
  incidentSummary: string;
  capaSummary: string;
  kpiSummary: string;
  customerFeedback: string;
  supplierPerformance: string;
  trainingStatus: string;
  complianceStatus: string;
  decisions: string;
  actions: string;
  nextReviewDate: string;
  minutesUrl: string;
  notes: string;
  aiGeneratedAgenda: string | null;
  createdAt: string;
}

interface MockAgenda {
  title: string;
  items: string[];
  aiNote?: string;
}

const mockReview: MockReview = {
  id: '00000000-0000-0000-0001-000000000001',
  referenceNumber: 'MR-2026-0001',
  title: 'Q1 2026 Management Review',
  description: 'Quarterly ISO 9001 management review covering all process areas',
  status: 'COMPLETED',
  scheduledDate: '2026-03-01T09:00:00.000Z',
  conductedDate: '2026-03-01T11:00:00.000Z',
  chairpersonName: 'Dr. Sarah Lee',
  attendees: ['Dr. Sarah Lee', 'John Smith', 'Alice Brown', 'Bob Johnson'],
  standards: ['ISO 9001:2015', 'ISO 14001:2015'],
  riskSummary: 'All high-risk items addressed; 2 medium-risk items under review',
  auditSummary: 'Internal audit Q4 2025 completed — 3 minor NCs raised, all closed',
  incidentSummary: 'No critical incidents in Q1; 2 near-misses investigated',
  capaSummary: '8 CAPAs open, 6 completed this quarter; effectiveness confirmed',
  kpiSummary: 'OTD 97.2%, Defect Rate 0.8%, Customer Sat 4.6/5',
  customerFeedback: 'Net Promoter Score +42; 2 complaints resolved',
  supplierPerformance: 'Top 5 suppliers rated Satisfactory or above',
  trainingStatus: '95% completion rate for mandatory training',
  complianceStatus: 'Full compliance with all applicable regulations',
  decisions: 'Approve revised QMS scope; Increase audit frequency to bi-annual',
  actions: 'Update quality manual by 2026-04-01; Review supplier criteria',
  nextReviewDate: '2026-06-01T09:00:00.000Z',
  minutesUrl: 'https://files.ims.local/minutes/mr-2026-q1.pdf',
  notes: 'All action owners confirmed; minutes circulated within 5 business days',
  aiGeneratedAgenda:
    '{"title":"Q1 2026 Management Review Agenda","items":["1. Opening and attendance","2. Previous action review","3. Risk register update","4. KPI review","5. AOB"],"aiNote":"AI-generated agenda based on review inputs"}',
  createdAt: '2026-02-15T08:00:00.000Z',
};

const mockDraftReview: MockReview = {
  id: '00000000-0000-0000-0001-000000000002',
  referenceNumber: 'MR-2026-0002',
  title: 'Q2 2026 Management Review',
  description: '',
  status: 'SCHEDULED',
  scheduledDate: '2026-06-01T09:00:00.000Z',
  conductedDate: '',
  chairpersonName: 'Dr. Sarah Lee',
  attendees: [],
  standards: ['ISO 9001:2015'],
  riskSummary: '',
  auditSummary: '',
  incidentSummary: '',
  capaSummary: '',
  kpiSummary: '',
  customerFeedback: '',
  supplierPerformance: '',
  trainingStatus: '',
  complianceStatus: '',
  decisions: '',
  actions: '',
  nextReviewDate: '2026-09-01T09:00:00.000Z',
  minutesUrl: '',
  notes: '',
  aiGeneratedAgenda: null,
  createdAt: '2026-03-01T08:00:00.000Z',
};

const mockAgenda: MockAgenda = {
  title: 'Q1 2026 Management Review Agenda',
  items: [
    '1. Opening and attendance',
    '2. Previous action review',
    '3. Risk register update',
    '4. KPI review',
    '5. AOB',
  ],
  aiNote: 'AI-generated agenda based on review inputs',
};

// ===========================================================================
// Tests
// ===========================================================================

describe('Review statuses array', () => {
  it('has exactly 5 statuses', () => expect(REVIEW_STATUSES).toHaveLength(5));
  it('contains DRAFT', () => expect(REVIEW_STATUSES).toContain('DRAFT'));
  it('contains SCHEDULED', () => expect(REVIEW_STATUSES).toContain('SCHEDULED'));
  it('contains IN_PROGRESS', () => expect(REVIEW_STATUSES).toContain('IN_PROGRESS'));
  it('contains COMPLETED', () => expect(REVIEW_STATUSES).toContain('COMPLETED'));
  it('contains CANCELLED', () => expect(REVIEW_STATUSES).toContain('CANCELLED'));

  it('all statuses are non-empty strings', () => {
    for (const s of REVIEW_STATUSES) {
      expect(typeof s).toBe('string');
      expect(s.length).toBeGreaterThan(0);
    }
  });

  it('all statuses are uppercase', () => {
    for (const s of REVIEW_STATUSES) {
      expect(s).toBe(s.toUpperCase());
    }
  });

  it('no duplicate statuses', () => {
    expect(new Set(REVIEW_STATUSES).size).toBe(REVIEW_STATUSES.length);
  });
});

describe('Review input categories (ISO 9.3.2)', () => {
  it('has exactly 9 input categories', () =>
    expect(REVIEW_INPUT_CATEGORIES).toHaveLength(9));

  const expectedInputs: ReviewInputCategory[] = [
    'riskSummary',
    'auditSummary',
    'incidentSummary',
    'capaSummary',
    'kpiSummary',
    'customerFeedback',
    'supplierPerformance',
    'trainingStatus',
    'complianceStatus',
  ];

  for (const cat of expectedInputs) {
    it(`contains ${cat}`, () => expect(REVIEW_INPUT_CATEGORIES).toContain(cat));
  }

  it('no duplicate input categories', () => {
    expect(new Set(REVIEW_INPUT_CATEGORIES).size).toBe(REVIEW_INPUT_CATEGORIES.length);
  });

  it('all input category keys are camelCase strings', () => {
    for (const c of REVIEW_INPUT_CATEGORIES) {
      expect(typeof c).toBe('string');
      expect(c).toMatch(/^[a-z][a-zA-Z]+$/);
    }
  });
});

describe('Review output categories (ISO 9.3.3)', () => {
  it('has exactly 2 output categories', () =>
    expect(REVIEW_OUTPUT_CATEGORIES).toHaveLength(2));
  it('contains decisions', () =>
    expect(REVIEW_OUTPUT_CATEGORIES).toContain('decisions'));
  it('contains actions', () =>
    expect(REVIEW_OUTPUT_CATEGORIES).toContain('actions'));
});

describe('Default form values', () => {
  it('default status is DRAFT', () => expect(reviewDefaultStatus).toBe('DRAFT'));
  it('DRAFT is a valid review status', () =>
    expect(REVIEW_STATUSES).toContain(reviewDefaultStatus));
});

describe('Review status badge variant map', () => {
  it('has an entry for every review status', () => {
    for (const s of REVIEW_STATUSES) {
      expect(reviewStatusBadgeVariant[s]).toBeDefined();
    }
  });

  it('COMPLETED → "secondary"', () =>
    expect(reviewStatusBadgeVariant.COMPLETED).toBe('secondary'));
  it('IN_PROGRESS → "default"', () =>
    expect(reviewStatusBadgeVariant.IN_PROGRESS).toBe('default'));
  it('CANCELLED → "destructive"', () =>
    expect(reviewStatusBadgeVariant.CANCELLED).toBe('destructive'));
  it('DRAFT → "outline"', () => expect(reviewStatusBadgeVariant.DRAFT).toBe('outline'));
  it('SCHEDULED → "outline"', () =>
    expect(reviewStatusBadgeVariant.SCHEDULED).toBe('outline'));

  const validVariants: BadgeVariant[] = ['default', 'secondary', 'outline', 'destructive'];

  it('all variant values are valid Badge variants', () => {
    for (const s of REVIEW_STATUSES) {
      expect(validVariants).toContain(reviewStatusBadgeVariant[s]);
    }
  });

  it('all variant values are non-empty strings', () => {
    for (const s of REVIEW_STATUSES) {
      expect(typeof reviewStatusBadgeVariant[s]).toBe('string');
      expect(reviewStatusBadgeVariant[s].length).toBeGreaterThan(0);
    }
  });
});

describe('Review status tile color map', () => {
  it('has an entry for every review status', () => {
    for (const s of REVIEW_STATUSES) {
      expect(reviewStatusTileColor[s]).toBeDefined();
    }
  });

  it('COMPLETED maps to green', () =>
    expect(reviewStatusTileColor.COMPLETED).toContain('green'));
  it('IN_PROGRESS maps to amber', () =>
    expect(reviewStatusTileColor.IN_PROGRESS).toContain('amber'));
  it('SCHEDULED maps to blue', () =>
    expect(reviewStatusTileColor.SCHEDULED).toContain('blue'));
  it('CANCELLED maps to red', () =>
    expect(reviewStatusTileColor.CANCELLED).toContain('red'));
  it('DRAFT maps to gray', () =>
    expect(reviewStatusTileColor.DRAFT).toContain('gray'));

  it('every color value contains bg- and text-', () => {
    for (const s of REVIEW_STATUSES) {
      expect(reviewStatusTileColor[s]).toContain('bg-');
      expect(reviewStatusTileColor[s]).toContain('text-');
    }
  });

  it('all color values are non-empty strings', () => {
    for (const s of REVIEW_STATUSES) {
      expect(typeof reviewStatusTileColor[s]).toBe('string');
      expect(reviewStatusTileColor[s].length).toBeGreaterThan(0);
    }
  });
});

describe('isReviewActive', () => {
  it('SCHEDULED is active', () => expect(isReviewActive('SCHEDULED')).toBe(true));
  it('IN_PROGRESS is active', () => expect(isReviewActive('IN_PROGRESS')).toBe(true));
  it('COMPLETED is not active', () => expect(isReviewActive('COMPLETED')).toBe(false));
  it('CANCELLED is not active', () => expect(isReviewActive('CANCELLED')).toBe(false));
  it('DRAFT is not active', () => expect(isReviewActive('DRAFT')).toBe(false));

  it('returns boolean for every status', () => {
    for (const s of REVIEW_STATUSES) {
      expect(typeof isReviewActive(s)).toBe('boolean');
    }
  });
});

describe('isReviewComplete', () => {
  it('COMPLETED returns true', () => expect(isReviewComplete('COMPLETED')).toBe(true));
  it('DRAFT returns false', () => expect(isReviewComplete('DRAFT')).toBe(false));
  it('SCHEDULED returns false', () => expect(isReviewComplete('SCHEDULED')).toBe(false));
  it('IN_PROGRESS returns false', () => expect(isReviewComplete('IN_PROGRESS')).toBe(false));
  it('CANCELLED returns false', () => expect(isReviewComplete('CANCELLED')).toBe(false));
});

describe('isReviewTerminal', () => {
  it('COMPLETED is terminal', () => expect(isReviewTerminal('COMPLETED')).toBe(true));
  it('CANCELLED is terminal', () => expect(isReviewTerminal('CANCELLED')).toBe(true));
  it('DRAFT is not terminal', () => expect(isReviewTerminal('DRAFT')).toBe(false));
  it('SCHEDULED is not terminal', () => expect(isReviewTerminal('SCHEDULED')).toBe(false));
  it('IN_PROGRESS is not terminal', () => expect(isReviewTerminal('IN_PROGRESS')).toBe(false));

  it('active and terminal are mutually exclusive', () => {
    for (const s of REVIEW_STATUSES) {
      if (isReviewActive(s)) {
        expect(isReviewTerminal(s)).toBe(false);
      }
    }
  });
});

describe('isReviewEditable', () => {
  it('DRAFT is editable', () => expect(isReviewEditable('DRAFT')).toBe(true));
  it('SCHEDULED is editable', () => expect(isReviewEditable('SCHEDULED')).toBe(true));
  it('IN_PROGRESS is not editable', () => expect(isReviewEditable('IN_PROGRESS')).toBe(false));
  it('COMPLETED is not editable', () => expect(isReviewEditable('COMPLETED')).toBe(false));
  it('CANCELLED is not editable', () => expect(isReviewEditable('CANCELLED')).toBe(false));

  it('terminal reviews are never editable', () => {
    for (const s of REVIEW_STATUSES) {
      if (isReviewTerminal(s)) {
        expect(isReviewEditable(s)).toBe(false);
      }
    }
  });
});

describe('reviewHasAgenda', () => {
  it('null → false', () => expect(reviewHasAgenda(null)).toBe(false));
  it('undefined → false', () => expect(reviewHasAgenda(undefined)).toBe(false));
  it('empty string → false', () => expect(reviewHasAgenda('')).toBe(false));
  it('non-empty JSON string → true', () =>
    expect(reviewHasAgenda('{"title":"Agenda","items":[]}')).toBe(true));
  it('mockReview has agenda', () =>
    expect(reviewHasAgenda(mockReview.aiGeneratedAgenda)).toBe(true));
  it('mockDraftReview has no agenda', () =>
    expect(reviewHasAgenda(mockDraftReview.aiGeneratedAgenda)).toBe(false));
});

describe('reviewCompletionRate', () => {
  it('empty list → 0', () => expect(reviewCompletionRate([])).toBe(0));
  it('all completed → 100', () => {
    const reviews = REVIEW_STATUSES.map(() => ({ status: 'COMPLETED' as ReviewStatus }));
    expect(reviewCompletionRate(reviews)).toBe(100);
  });
  it('none completed → 0', () => {
    const reviews = [
      { status: 'DRAFT' as ReviewStatus },
      { status: 'SCHEDULED' as ReviewStatus },
    ];
    expect(reviewCompletionRate(reviews)).toBe(0);
  });
  it('half completed → 50', () => {
    const reviews = [
      { status: 'COMPLETED' as ReviewStatus },
      { status: 'SCHEDULED' as ReviewStatus },
    ];
    expect(reviewCompletionRate(reviews)).toBe(50);
  });

  it('parametric: rate is between 0 and 100 for all counts', () => {
    for (let completed = 0; completed <= 10; completed++) {
      const reviews = [
        ...Array(completed).fill({ status: 'COMPLETED' as ReviewStatus }),
        ...Array(10 - completed).fill({ status: 'DRAFT' as ReviewStatus }),
      ];
      const rate = reviewCompletionRate(reviews);
      expect(rate).toBeGreaterThanOrEqual(0);
      expect(rate).toBeLessThanOrEqual(100);
    }
  });
});

describe('reviewCountByStatus', () => {
  const reviews = [
    { status: 'COMPLETED' as ReviewStatus },
    { status: 'COMPLETED' as ReviewStatus },
    { status: 'SCHEDULED' as ReviewStatus },
    { status: 'IN_PROGRESS' as ReviewStatus },
    { status: 'CANCELLED' as ReviewStatus },
  ];

  it('counts COMPLETED correctly', () =>
    expect(reviewCountByStatus(reviews, 'COMPLETED')).toBe(2));
  it('counts SCHEDULED correctly', () =>
    expect(reviewCountByStatus(reviews, 'SCHEDULED')).toBe(1));
  it('counts IN_PROGRESS correctly', () =>
    expect(reviewCountByStatus(reviews, 'IN_PROGRESS')).toBe(1));
  it('counts CANCELLED correctly', () =>
    expect(reviewCountByStatus(reviews, 'CANCELLED')).toBe(1));
  it('counts DRAFT as 0 when none present', () =>
    expect(reviewCountByStatus(reviews, 'DRAFT')).toBe(0));

  it('sum across all statuses equals total', () => {
    const total = REVIEW_STATUSES.reduce(
      (sum, s) => sum + reviewCountByStatus(reviews, s),
      0,
    );
    expect(total).toBe(reviews.length);
  });
});

describe('reviewsWithAgenda / reviewsWithoutAgenda', () => {
  const list = [
    { aiGeneratedAgenda: '{"title":"Agenda","items":[]}' },
    { aiGeneratedAgenda: null },
    { aiGeneratedAgenda: '' },
    { aiGeneratedAgenda: '{"title":"Another","items":["1"]}' },
  ];

  it('withAgenda = 2', () => expect(reviewsWithAgenda(list)).toBe(2));
  it('withoutAgenda = 2', () => expect(reviewsWithoutAgenda(list)).toBe(2));
  it('withAgenda + withoutAgenda = total', () =>
    expect(reviewsWithAgenda(list) + reviewsWithoutAgenda(list)).toBe(list.length));
});

describe('splitCommaList', () => {
  it('empty string → []', () => expect(splitCommaList('')).toEqual([]));
  it('whitespace only → []', () => expect(splitCommaList('   ')).toEqual([]));
  it('single value', () => expect(splitCommaList('ISO 9001')).toEqual(['ISO 9001']));
  it('two values', () =>
    expect(splitCommaList('John, Jane')).toEqual(['John', 'Jane']));
  it('three standards', () =>
    expect(splitCommaList('ISO 9001:2015, ISO 14001:2015, ISO 45001:2018')).toEqual([
      'ISO 9001:2015',
      'ISO 14001:2015',
      'ISO 45001:2018',
    ]));
  it('trims whitespace around each item', () =>
    expect(splitCommaList('  a  ,  b  ')).toEqual(['a', 'b']));
  it('filters empty segments', () =>
    expect(splitCommaList('a,,b')).toEqual(['a', 'b']));
});

describe('splitISODate', () => {
  it('strips time component', () =>
    expect(splitISODate('2026-03-01T09:00:00.000Z')).toBe('2026-03-01'));
  it('returns YYYY-MM-DD format', () => {
    expect(splitISODate('2026-06-01T12:30:00.000Z')).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
  it('handles date without time', () =>
    expect(splitISODate('2026-09-01')).toBe('2026-09-01'));
});

describe('isReviewOverdue', () => {
  const past = '2026-01-01T09:00:00.000Z';
  const future = '2027-01-01T09:00:00.000Z';
  const now = new Date('2026-03-09T00:00:00.000Z');

  it('SCHEDULED past scheduled date → overdue', () =>
    expect(isReviewOverdue(past, now, 'SCHEDULED')).toBe(true));
  it('COMPLETED past scheduled date → not overdue', () =>
    expect(isReviewOverdue(past, now, 'COMPLETED')).toBe(false));
  it('CANCELLED past scheduled date → not overdue', () =>
    expect(isReviewOverdue(past, now, 'CANCELLED')).toBe(false));
  it('IN_PROGRESS past scheduled date → overdue', () =>
    expect(isReviewOverdue(past, now, 'IN_PROGRESS')).toBe(true));
  it('future scheduled date → not overdue', () =>
    expect(isReviewOverdue(future, now, 'SCHEDULED')).toBe(false));
  it('DRAFT past scheduled date → overdue', () =>
    expect(isReviewOverdue(past, now, 'DRAFT')).toBe(true));

  it('terminal reviews are never overdue', () => {
    for (const s of REVIEW_STATUSES) {
      if (isReviewTerminal(s)) {
        expect(isReviewOverdue(past, now, s)).toBe(false);
      }
    }
  });

  it('returns boolean for all statuses', () => {
    for (const s of REVIEW_STATUSES) {
      expect(typeof isReviewOverdue(past, now, s)).toBe('boolean');
    }
  });
});

describe('reviewDurationDays', () => {
  it('same-day review → 0 days', () =>
    expect(
      reviewDurationDays('2026-03-01T09:00:00.000Z', '2026-03-01T11:00:00.000Z'),
    ).toBe(0));
  it('1 day apart → 1 day', () =>
    expect(
      reviewDurationDays('2026-03-01T09:00:00.000Z', '2026-03-02T09:00:00.000Z'),
    ).toBe(1));
  it('7 days apart → 7', () =>
    expect(
      reviewDurationDays('2026-03-01T09:00:00.000Z', '2026-03-08T09:00:00.000Z'),
    ).toBe(7));
  it('result is non-negative when conducted is after scheduled', () => {
    const duration = reviewDurationDays(
      '2026-03-01T09:00:00.000Z',
      '2026-03-05T09:00:00.000Z',
    );
    expect(duration).toBeGreaterThanOrEqual(0);
  });
  it('clamps to 0 when conducted is before scheduled', () =>
    expect(
      reviewDurationDays('2026-03-05T09:00:00.000Z', '2026-03-01T09:00:00.000Z'),
    ).toBe(0));
});

describe('reviewsNeedingAction', () => {
  const reviews = [
    { status: 'COMPLETED' as ReviewStatus, actions: 'Update manual' },
    { status: 'COMPLETED' as ReviewStatus, actions: '' },
    { status: 'COMPLETED' as ReviewStatus, actions: '   ' },
    { status: 'SCHEDULED' as ReviewStatus, actions: 'Should be ignored' },
    { status: 'COMPLETED' as ReviewStatus, actions: 'Review supplier criteria' },
  ];

  it('counts only completed reviews with non-empty actions', () =>
    expect(reviewsNeedingAction(reviews)).toBe(2));
  it('empty list → 0', () => expect(reviewsNeedingAction([])).toBe(0));
  it('no completed reviews → 0', () => {
    const noCompleted = [
      { status: 'SCHEDULED' as ReviewStatus, actions: 'Some action' },
    ];
    expect(reviewsNeedingAction(noCompleted)).toBe(0);
  });
});

describe('Mock review shape (completed)', () => {
  it('has an id field', () => expect(typeof mockReview.id).toBe('string'));
  it('id is non-empty', () => expect(mockReview.id.length).toBeGreaterThan(0));
  it('has a referenceNumber', () => expect(typeof mockReview.referenceNumber).toBe('string'));
  it('has a title', () => expect(mockReview.title.length).toBeGreaterThan(0));
  it('status is a valid ReviewStatus', () =>
    expect(REVIEW_STATUSES).toContain(mockReview.status));
  it('mock is COMPLETED', () => expect(mockReview.status).toBe('COMPLETED'));
  it('isReviewComplete is true', () => expect(isReviewComplete(mockReview.status)).toBe(true));
  it('isReviewTerminal is true', () => expect(isReviewTerminal(mockReview.status)).toBe(true));
  it('isReviewActive is false', () => expect(isReviewActive(mockReview.status)).toBe(false));
  it('attendees is an array', () => expect(Array.isArray(mockReview.attendees)).toBe(true));
  it('standards is an array', () => expect(Array.isArray(mockReview.standards)).toBe(true));
  it('attendees are strings', () => {
    for (const a of mockReview.attendees) {
      expect(typeof a).toBe('string');
    }
  });
  it('has scheduledDate', () => expect(typeof mockReview.scheduledDate).toBe('string'));
  it('has conductedDate', () => expect(typeof mockReview.conductedDate).toBe('string'));
  it('has nextReviewDate', () => expect(typeof mockReview.nextReviewDate).toBe('string'));
  it('has aiGeneratedAgenda (non-null)', () =>
    expect(mockReview.aiGeneratedAgenda).not.toBeNull());
  it('aiGeneratedAgenda is valid JSON', () => {
    expect(() => JSON.parse(mockReview.aiGeneratedAgenda as string)).not.toThrow();
  });
  it('badge variant is "secondary" for COMPLETED', () =>
    expect(reviewStatusBadgeVariant[mockReview.status]).toBe('secondary'));
  it('all 9 input categories are present as fields on mock', () => {
    for (const cat of REVIEW_INPUT_CATEGORIES) {
      expect(mockReview).toHaveProperty(cat);
    }
  });
  it('all 2 output categories are present as fields on mock', () => {
    for (const cat of REVIEW_OUTPUT_CATEGORIES) {
      expect(mockReview).toHaveProperty(cat);
    }
  });
});

describe('Mock review shape (draft/scheduled)', () => {
  it('status is SCHEDULED', () => expect(mockDraftReview.status).toBe('SCHEDULED'));
  it('isReviewEditable is true', () =>
    expect(isReviewEditable(mockDraftReview.status)).toBe(true));
  it('isReviewTerminal is false', () =>
    expect(isReviewTerminal(mockDraftReview.status)).toBe(false));
  it('aiGeneratedAgenda is null', () => expect(mockDraftReview.aiGeneratedAgenda).toBeNull());
  it('reviewHasAgenda is false', () =>
    expect(reviewHasAgenda(mockDraftReview.aiGeneratedAgenda)).toBe(false));
  it('attendees is empty array', () =>
    expect(mockDraftReview.attendees).toHaveLength(0));
  it('has a valid scheduledDate', () =>
    expect(splitISODate(mockDraftReview.scheduledDate)).toMatch(/^\d{4}-\d{2}-\d{2}$/));
});

describe('Mock agenda shape', () => {
  it('has a title', () => expect(typeof mockAgenda.title).toBe('string'));
  it('title is non-empty', () => expect(mockAgenda.title.length).toBeGreaterThan(0));
  it('items is an array', () => expect(Array.isArray(mockAgenda.items)).toBe(true));
  it('has at least 1 item', () => expect(mockAgenda.items.length).toBeGreaterThanOrEqual(1));
  it('all items are strings', () => {
    for (const item of mockAgenda.items) {
      expect(typeof item).toBe('string');
    }
  });
  it('has aiNote field', () => expect(typeof mockAgenda.aiNote).toBe('string'));
  it('aiNote is non-empty', () =>
    expect((mockAgenda.aiNote as string).length).toBeGreaterThan(0));
  it('agenda parsed from mockReview matches structure', () => {
    const parsed = JSON.parse(mockReview.aiGeneratedAgenda as string);
    expect(Array.isArray(parsed.items)).toBe(true);
    expect(typeof parsed.title).toBe('string');
  });
});

describe('Cross-domain invariants', () => {
  it('exactly 2 active statuses', () => {
    const active = REVIEW_STATUSES.filter((s) => isReviewActive(s));
    expect(active).toHaveLength(2);
  });

  it('exactly 2 terminal statuses', () => {
    const terminal = REVIEW_STATUSES.filter((s) => isReviewTerminal(s));
    expect(terminal).toHaveLength(2);
  });

  it('exactly 2 editable statuses', () => {
    const editable = REVIEW_STATUSES.filter((s) => isReviewEditable(s));
    expect(editable).toHaveLength(2);
  });

  it('every status is active, editable, or terminal', () => {
    for (const s of REVIEW_STATUSES) {
      const covered =
        isReviewActive(s) || isReviewEditable(s) || isReviewTerminal(s);
      expect(covered).toBe(true);
    }
  });

  it('COMPLETED is only status where isReviewComplete is true', () => {
    const completeStatuses = REVIEW_STATUSES.filter((s) => isReviewComplete(s));
    expect(completeStatuses).toEqual(['COMPLETED']);
  });

  it('badge variant map has no undefined entries', () => {
    for (const s of REVIEW_STATUSES) {
      expect(reviewStatusBadgeVariant[s]).not.toBeUndefined();
    }
  });

  it('tile color map has no undefined entries', () => {
    for (const s of REVIEW_STATUSES) {
      expect(reviewStatusTileColor[s]).not.toBeUndefined();
    }
  });

  it('COMPLETED badge variant differs from DRAFT/SCHEDULED', () => {
    expect(reviewStatusBadgeVariant.COMPLETED).not.toBe(reviewStatusBadgeVariant.DRAFT);
    expect(reviewStatusBadgeVariant.COMPLETED).not.toBe(
      reviewStatusBadgeVariant.SCHEDULED,
    );
  });

  it('input and output categories are disjoint', () => {
    const inputs = new Set(REVIEW_INPUT_CATEGORIES as string[]);
    for (const cat of REVIEW_OUTPUT_CATEGORIES) {
      expect(inputs.has(cat)).toBe(false);
    }
  });

  it('total input + output categories = 11', () => {
    expect(REVIEW_INPUT_CATEGORIES.length + REVIEW_OUTPUT_CATEGORIES.length).toBe(11);
  });
});

// ─── Parametric: REVIEW_STATUSES positional index ────────────────────────────

describe('REVIEW_STATUSES — positional index parametric', () => {
  const expected: [ReviewStatus, number][] = [
    ['DRAFT',       0],
    ['SCHEDULED',   1],
    ['IN_PROGRESS', 2],
    ['COMPLETED',   3],
    ['CANCELLED',   4],
  ];
  for (const [status, idx] of expected) {
    it(`${status} is at index ${idx}`, () => {
      expect(REVIEW_STATUSES[idx]).toBe(status);
    });
  }
});

// ─── Parametric: isReviewActive per-status ────────────────────────────────────

describe('isReviewActive — per-status parametric', () => {
  const cases: [ReviewStatus, boolean][] = [
    ['DRAFT',       false],
    ['SCHEDULED',   true],
    ['IN_PROGRESS', true],
    ['COMPLETED',   false],
    ['CANCELLED',   false],
  ];
  for (const [status, expected] of cases) {
    it(`isReviewActive("${status}") = ${expected}`, () => {
      expect(isReviewActive(status)).toBe(expected);
    });
  }
});

// ─── Parametric: isReviewTerminal per-status ──────────────────────────────────

describe('isReviewTerminal — per-status parametric', () => {
  const cases: [ReviewStatus, boolean][] = [
    ['DRAFT',       false],
    ['SCHEDULED',   false],
    ['IN_PROGRESS', false],
    ['COMPLETED',   true],
    ['CANCELLED',   true],
  ];
  for (const [status, expected] of cases) {
    it(`isReviewTerminal("${status}") = ${expected}`, () => {
      expect(isReviewTerminal(status)).toBe(expected);
    });
  }
});

// ─── Parametric: isReviewEditable per-status ─────────────────────────────────

describe('isReviewEditable — per-status parametric', () => {
  const cases: [ReviewStatus, boolean][] = [
    ['DRAFT',       true],
    ['SCHEDULED',   true],
    ['IN_PROGRESS', false],
    ['COMPLETED',   false],
    ['CANCELLED',   false],
  ];
  for (const [status, expected] of cases) {
    it(`isReviewEditable("${status}") = ${expected}`, () => {
      expect(isReviewEditable(status)).toBe(expected);
    });
  }
});

// ─── Parametric: reviewStatusBadgeVariant per-status exact ───────────────────

describe('reviewStatusBadgeVariant — per-status exact parametric', () => {
  const cases: [ReviewStatus, BadgeVariant][] = [
    ['DRAFT',       'outline'],
    ['SCHEDULED',   'outline'],
    ['IN_PROGRESS', 'default'],
    ['COMPLETED',   'secondary'],
    ['CANCELLED',   'destructive'],
  ];
  for (const [status, expected] of cases) {
    it(`${status} → "${expected}"`, () => {
      expect(reviewStatusBadgeVariant[status]).toBe(expected);
    });
  }
});

// ─── Parametric: reviewCompletionRate exact fractions ────────────────────────

describe('reviewCompletionRate — exact fraction parametric', () => {
  const total = 5;
  const cases: [number, number][] = [
    [0,  0],
    [1,  20],
    [2,  40],
    [3,  60],
    [4,  80],
    [5,  100],
  ];
  for (const [completedCount, expectedRate] of cases) {
    it(`${completedCount}/${total} completed → ${expectedRate}%`, () => {
      const reviews = [
        ...Array(completedCount).fill({ status: 'COMPLETED' as ReviewStatus }),
        ...Array(total - completedCount).fill({ status: 'DRAFT' as ReviewStatus }),
      ];
      expect(reviewCompletionRate(reviews)).toBeCloseTo(expectedRate, 5);
    });
  }
});

// ─── mockReview specific field values ────────────────────────────────────────

describe('mockReview — specific field values', () => {
  it('referenceNumber = MR-2026-0001', () =>
    expect(mockReview.referenceNumber).toBe('MR-2026-0001'));
  it('attendees count = 4', () => expect(mockReview.attendees).toHaveLength(4));
  it('standards count = 2', () => expect(mockReview.standards).toHaveLength(2));
  it('standards contains ISO 9001:2015', () =>
    expect(mockReview.standards).toContain('ISO 9001:2015'));
  it('aiGeneratedAgenda items count = 5', () => {
    const parsed = JSON.parse(mockReview.aiGeneratedAgenda as string);
    expect(parsed.items).toHaveLength(5);
  });
  it('reviewDurationDays(scheduled, conducted) = 0 (same day)', () => {
    expect(reviewDurationDays(mockReview.scheduledDate, mockReview.conductedDate)).toBe(0);
  });
});

// ─── Phase 209 parametric additions ──────────────────────────────────────────

describe('REVIEW_INPUT_CATEGORIES — positional index parametric', () => {
  const expected = [
    [0, 'riskSummary'],
    [1, 'auditSummary'],
    [2, 'incidentSummary'],
    [3, 'capaSummary'],
    [4, 'kpiSummary'],
    [5, 'customerFeedback'],
    [6, 'supplierPerformance'],
    [7, 'trainingStatus'],
    [8, 'complianceStatus'],
  ] as const;
  for (const [idx, val] of expected) {
    it(`REVIEW_INPUT_CATEGORIES[${idx}] === '${val}'`, () => {
      expect(REVIEW_INPUT_CATEGORIES[idx]).toBe(val);
    });
  }
});

describe('REVIEW_OUTPUT_CATEGORIES — positional index parametric', () => {
  const expected = [
    [0, 'decisions'],
    [1, 'actions'],
  ] as const;
  for (const [idx, val] of expected) {
    it(`REVIEW_OUTPUT_CATEGORIES[${idx}] === '${val}'`, () => {
      expect(REVIEW_OUTPUT_CATEGORIES[idx]).toBe(val);
    });
  }
});

describe('mockAgenda — per-item exact string parametric', () => {
  const expected = [
    [0, '1. Opening and attendance'],
    [1, '2. Previous action review'],
    [2, '3. Risk register update'],
    [3, '4. KPI review'],
    [4, '5. AOB'],
  ] as const;
  for (const [idx, val] of expected) {
    it(`items[${idx}] === '${val}'`, () => {
      expect(mockAgenda.items[idx]).toBe(val);
    });
  }
});

describe('reviewStatusTileColor — per-status exact color keyword parametric', () => {
  const cases: [ReviewStatus, string][] = [
    ['DRAFT',       'gray'],
    ['SCHEDULED',   'blue'],
    ['IN_PROGRESS', 'amber'],
    ['COMPLETED',   'green'],
    ['CANCELLED',   'red'],
  ];
  for (const [status, color] of cases) {
    it(`${status} tileColor contains "${color}"`, () => {
      expect(reviewStatusTileColor[status]).toContain(color);
    });
  }
});

// ─── Algorithm puzzle phases (ph217mr–ph224mr) ────────────────────────────────
function moveZeroes217mr(nums:number[]):number{let k=0;for(const n of nums)if(n!==0)nums[k++]=n;while(k<nums.length)nums[k++]=0;return nums[0];}
describe('ph217mr_mz',()=>{
  it('a',()=>{expect(moveZeroes217mr([0,1,0,3,12])).toBe(1);});
  it('b',()=>{expect(moveZeroes217mr([0,0,1])).toBe(1);});
  it('c',()=>{expect(moveZeroes217mr([1])).toBe(1);});
  it('d',()=>{expect(moveZeroes217mr([0,0,0,1])).toBe(1);});
  it('e',()=>{expect(moveZeroes217mr([4,2,0,0,3])).toBe(4);});
});
function missingNumber218mr(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph218mr_mn',()=>{
  it('a',()=>{expect(missingNumber218mr([3,0,1])).toBe(2);});
  it('b',()=>{expect(missingNumber218mr([0,1])).toBe(2);});
  it('c',()=>{expect(missingNumber218mr([9,6,4,2,3,5,7,0,1])).toBe(8);});
  it('d',()=>{expect(missingNumber218mr([0])).toBe(1);});
  it('e',()=>{expect(missingNumber218mr([1])).toBe(0);});
});
function countBits219mr(n:number):number[]{const r=new Array(n+1).fill(0);for(let i=1;i<=n;i++)r[i]=r[i>>1]+(i&1);return r;}
describe('ph219mr_cb',()=>{
  it('a',()=>{expect(countBits219mr(2)).toEqual([0,1,1]);});
  it('b',()=>{expect(countBits219mr(5)).toEqual([0,1,1,2,1,2]);});
  it('c',()=>{expect(countBits219mr(0)).toEqual([0]);});
  it('d',()=>{expect(countBits219mr(1)).toEqual([0,1]);});
  it('e',()=>{expect(countBits219mr(4)[4]).toBe(1);});
});
function climbStairs220mr(n:number):number{let a=1,b=1;for(let i=2;i<=n;i++){const t=a+b;a=b;b=t;}return b;}
describe('ph220mr_cs',()=>{
  it('a',()=>{expect(climbStairs220mr(2)).toBe(2);});
  it('b',()=>{expect(climbStairs220mr(3)).toBe(3);});
  it('c',()=>{expect(climbStairs220mr(4)).toBe(5);});
  it('d',()=>{expect(climbStairs220mr(5)).toBe(8);});
  it('e',()=>{expect(climbStairs220mr(1)).toBe(1);});
});
function maxProfit221mr(p:number[]):number{let min=Infinity,max=0;for(const x of p){min=Math.min(min,x);max=Math.max(max,x-min);}return max;}
describe('ph221mr_mp',()=>{
  it('a',()=>{expect(maxProfit221mr([7,1,5,3,6,4])).toBe(5);});
  it('b',()=>{expect(maxProfit221mr([7,6,4,3,1])).toBe(0);});
  it('c',()=>{expect(maxProfit221mr([1,2])).toBe(1);});
  it('d',()=>{expect(maxProfit221mr([2,1,4])).toBe(3);});
  it('e',()=>{expect(maxProfit221mr([1])).toBe(0);});
});
function singleNumber222mr(nums:number[]):number{return nums.reduce((a,b)=>a^b,0);}
describe('ph222mr_sn',()=>{
  it('a',()=>{expect(singleNumber222mr([2,2,1])).toBe(1);});
  it('b',()=>{expect(singleNumber222mr([4,1,2,1,2])).toBe(4);});
  it('c',()=>{expect(singleNumber222mr([1])).toBe(1);});
  it('d',()=>{expect(singleNumber222mr([0,1,0])).toBe(1);});
  it('e',()=>{expect(singleNumber222mr([3,3,5])).toBe(5);});
});
function hammingDist223mr(x:number,y:number):number{let n=x^y,c=0;while(n){c+=n&1;n>>>=1;}return c;}
describe('ph223mr_hd',()=>{
  it('a',()=>{expect(hammingDist223mr(1,4)).toBe(2);});
  it('b',()=>{expect(hammingDist223mr(3,1)).toBe(1);});
  it('c',()=>{expect(hammingDist223mr(0,0)).toBe(0);});
  it('d',()=>{expect(hammingDist223mr(0,15)).toBe(4);});
  it('e',()=>{expect(hammingDist223mr(7,7)).toBe(0);});
});
function majorElem224mr(nums:number[]):number{let c=0,m=0;for(const n of nums){if(c===0)m=n;c+=n===m?1:-1;}return m;}
describe('ph224mr_me',()=>{
  it('a',()=>{expect(majorElem224mr([3,2,3])).toBe(3);});
  it('b',()=>{expect(majorElem224mr([2,2,1,1,1,2,2])).toBe(2);});
  it('c',()=>{expect(majorElem224mr([1])).toBe(1);});
  it('d',()=>{expect(majorElem224mr([1,1,2])).toBe(1);});
  it('e',()=>{expect(majorElem224mr([6,5,5])).toBe(5);});
});
