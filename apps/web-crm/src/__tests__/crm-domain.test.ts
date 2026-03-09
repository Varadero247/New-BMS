// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

// ---------------------------------------------------------------------------
// Pipeline STAGES (from apps/web-crm/src/app/pipeline/page.tsx)
// ---------------------------------------------------------------------------

interface Stage {
  key: string;
  label: string;
  color: string;
}

const STAGES: Stage[] = [
  { key: 'PROSPECTING',   label: 'Prospecting',   color: 'bg-gray-100 dark:bg-gray-800 border-gray-300' },
  { key: 'QUALIFICATION', label: 'Qualification', color: 'bg-blue-50 border-blue-300' },
  { key: 'PROPOSAL',      label: 'Proposal',      color: 'bg-violet-50 border-violet-300' },
  { key: 'NEGOTIATION',   label: 'Negotiation',   color: 'bg-amber-50 border-amber-300' },
  { key: 'CLOSED_WON',    label: 'Closed Won',    color: 'bg-green-50 border-green-300' },
  { key: 'CLOSED_LOST',   label: 'Closed Lost',   color: 'bg-red-50 border-red-300' },
];

// ---------------------------------------------------------------------------
// Contacts — sourceColors & initialFormState
// (from apps/web-crm/src/app/contacts/page.tsx)
// ---------------------------------------------------------------------------

const CONTACT_SOURCE_COLORS: Record<string, string> = {
  WEBSITE:    'bg-blue-100 text-blue-700',
  REFERRAL:   'bg-green-100 text-green-700',
  LINKEDIN:   'bg-indigo-100 text-indigo-700',
  COLD_CALL:  'bg-orange-100 text-orange-700',
  TRADE_SHOW: 'bg-purple-100 text-purple-700',
  INBOUND:    'bg-teal-100 text-teal-700',
  OTHER:      'bg-gray-100 dark:bg-gray-800 text-gray-700',
};

const CONTACT_SOURCES = ['WEBSITE', 'REFERRAL', 'LINKEDIN', 'COLD_CALL', 'TRADE_SHOW', 'INBOUND', 'OTHER'] as const;
type ContactSource = typeof CONTACT_SOURCES[number];

const CONTACT_INITIAL_FORM = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  title: '',
  source: 'WEBSITE',
  accountId: '',
};

// ---------------------------------------------------------------------------
// Leads — statusColors & initialFormState
// (from apps/web-crm/src/app/leads/page.tsx)
// ---------------------------------------------------------------------------

const LEAD_STATUS_COLORS: Record<string, string> = {
  NEW:          'bg-blue-100 text-blue-700',
  CONTACTED:    'bg-indigo-100 text-indigo-700',
  QUALIFIED:    'bg-green-100 text-green-700',
  DISQUALIFIED: 'bg-red-100 text-red-700',
  CONVERTED:    'bg-purple-100 text-purple-700',
};

const LEAD_STATUSES = ['NEW', 'CONTACTED', 'QUALIFIED', 'DISQUALIFIED', 'CONVERTED'] as const;
type LeadStatus = typeof LEAD_STATUSES[number];

const LEAD_INITIAL_FORM = {
  firstName: '',
  lastName: '',
  email: '',
  company: '',
  source: 'WEBSITE',
  score: '0',
};

// ---------------------------------------------------------------------------
// Deals — statusColors, stageLabels, initialFormState
// (from apps/web-crm/src/app/deals/page.tsx)
// ---------------------------------------------------------------------------

const DEAL_STATUS_COLORS: Record<string, string> = {
  OPEN: 'bg-blue-100 text-blue-700',
  WON:  'bg-green-100 text-green-700',
  LOST: 'bg-red-100 text-red-700',
};

const DEAL_STATUSES = ['OPEN', 'WON', 'LOST'] as const;
type DealStatus = typeof DEAL_STATUSES[number];

const STAGE_LABELS: Record<string, string> = {
  PROSPECTING:   'Prospecting',
  QUALIFICATION: 'Qualification',
  PROPOSAL:      'Proposal',
  NEGOTIATION:   'Negotiation',
  CLOSED_WON:    'Closed Won',
  CLOSED_LOST:   'Closed Lost',
};

const DEAL_INITIAL_FORM = {
  title: '',
  value: '',
  stage: 'PROSPECTING',
  probability: '20',
  expectedCloseDate: '',
  assignedTo: '',
  accountId: '',
};

// ---------------------------------------------------------------------------
// Dashboard kpiCards shape
// (from apps/web-crm/src/app/page.tsx)
// ---------------------------------------------------------------------------

interface KpiCard {
  title: string;
  subtitle: string;
  href: string;
}

const KPI_CARDS: KpiCard[] = [
  { title: 'Total Contacts',  subtitle: 'All contacts',      href: '/contacts' },
  { title: 'Total Accounts',  subtitle: 'Active accounts',   href: '/accounts' },
  { title: 'Open Deals',      subtitle: 'In pipeline',       href: '/deals' },
  { title: 'Pipeline Value',  subtitle: 'Total open value',  href: '/pipeline' },
  { title: 'Won This Month',  subtitle: 'Closed won',        href: '/deals' },
  { title: 'Conversion Rate', subtitle: 'Lead to deal',      href: '/reports' },
];

// ---------------------------------------------------------------------------
// Pure helper functions (inlined from source)
// ---------------------------------------------------------------------------

function formatCurrencyUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function getNextStage(currentStage: string): string | null {
  const stageKeys = STAGES.map((s) => s.key);
  const idx = stageKeys.indexOf(currentStage);
  if (idx === -1 || idx >= stageKeys.length - 1) return null;
  return stageKeys[idx + 1];
}

function computeWeightedValue(value: number, probability: number): number {
  return value * (probability / 100);
}

function isLeadQualifiable(status: LeadStatus): boolean {
  return status === 'NEW' || status === 'CONTACTED';
}

function scoreClass(score: number): 'high' | 'medium' | 'low' {
  if (score >= 70) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
}

// ===========================================================================
// TEST SUITES
// ===========================================================================

// ---------------------------------------------------------------------------
// STAGES array
// ---------------------------------------------------------------------------

describe('CRM STAGES array', () => {
  it('has exactly 6 stages', () => {
    expect(STAGES).toHaveLength(6);
  });

  it('first stage is PROSPECTING', () => {
    expect(STAGES[0].key).toBe('PROSPECTING');
  });

  it('last stage is CLOSED_LOST', () => {
    expect(STAGES[STAGES.length - 1].key).toBe('CLOSED_LOST');
  });

  it('contains QUALIFICATION', () => {
    expect(STAGES.map((s) => s.key)).toContain('QUALIFICATION');
  });

  it('contains PROPOSAL', () => {
    expect(STAGES.map((s) => s.key)).toContain('PROPOSAL');
  });

  it('contains NEGOTIATION', () => {
    expect(STAGES.map((s) => s.key)).toContain('NEGOTIATION');
  });

  it('contains CLOSED_WON', () => {
    expect(STAGES.map((s) => s.key)).toContain('CLOSED_WON');
  });

  it('CLOSED_WON is before CLOSED_LOST in order', () => {
    const keys = STAGES.map((s) => s.key);
    expect(keys.indexOf('CLOSED_WON')).toBeLessThan(keys.indexOf('CLOSED_LOST'));
  });

  it('PROSPECTING is before NEGOTIATION', () => {
    const keys = STAGES.map((s) => s.key);
    expect(keys.indexOf('PROSPECTING')).toBeLessThan(keys.indexOf('NEGOTIATION'));
  });

  for (const stage of STAGES) {
    it(`${stage.key} has a non-empty label`, () => {
      expect(stage.label.length).toBeGreaterThan(0);
    });

    it(`${stage.key} has a non-empty color string`, () => {
      expect(stage.color.length).toBeGreaterThan(0);
    });

    it(`${stage.key} color contains 'border-'`, () => {
      expect(stage.color).toContain('border-');
    });
  }

  it('CLOSED_WON label is "Closed Won"', () => {
    const s = STAGES.find((s) => s.key === 'CLOSED_WON');
    expect(s?.label).toBe('Closed Won');
  });

  it('CLOSED_LOST color contains red', () => {
    const s = STAGES.find((s) => s.key === 'CLOSED_LOST');
    expect(s?.color).toContain('red');
  });

  it('CLOSED_WON color contains green', () => {
    const s = STAGES.find((s) => s.key === 'CLOSED_WON');
    expect(s?.color).toContain('green');
  });

  it('all stage keys are unique', () => {
    const keys = STAGES.map((s) => s.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('all stage labels are unique', () => {
    const labels = STAGES.map((s) => s.label);
    expect(new Set(labels).size).toBe(labels.length);
  });
});

// ---------------------------------------------------------------------------
// getNextStage pure function
// ---------------------------------------------------------------------------

describe('getNextStage', () => {
  it('PROSPECTING → QUALIFICATION', () => {
    expect(getNextStage('PROSPECTING')).toBe('QUALIFICATION');
  });

  it('QUALIFICATION → PROPOSAL', () => {
    expect(getNextStage('QUALIFICATION')).toBe('PROPOSAL');
  });

  it('PROPOSAL → NEGOTIATION', () => {
    expect(getNextStage('PROPOSAL')).toBe('NEGOTIATION');
  });

  it('NEGOTIATION → CLOSED_WON', () => {
    expect(getNextStage('NEGOTIATION')).toBe('CLOSED_WON');
  });

  it('CLOSED_WON → CLOSED_LOST', () => {
    expect(getNextStage('CLOSED_WON')).toBe('CLOSED_LOST');
  });

  it('CLOSED_LOST → null (no next stage)', () => {
    expect(getNextStage('CLOSED_LOST')).toBeNull();
  });

  it('unknown stage → null', () => {
    expect(getNextStage('UNKNOWN')).toBeNull();
  });

  it('result for non-terminal stages is a non-empty string', () => {
    const nonTerminal = ['PROSPECTING', 'QUALIFICATION', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON'];
    for (const key of nonTerminal) {
      const next = getNextStage(key);
      expect(typeof next).toBe('string');
      expect((next as string).length).toBeGreaterThan(0);
    }
  });

  it('next stage is always a valid STAGES key when not null', () => {
    const validKeys = STAGES.map((s) => s.key);
    for (const stage of STAGES) {
      const next = getNextStage(stage.key);
      if (next !== null) {
        expect(validKeys).toContain(next);
      }
    }
  });
});

// ---------------------------------------------------------------------------
// Contact source colors
// ---------------------------------------------------------------------------

describe('CONTACT_SOURCE_COLORS', () => {
  it('has 7 source entries', () => {
    expect(Object.keys(CONTACT_SOURCE_COLORS)).toHaveLength(7);
  });

  for (const source of CONTACT_SOURCES) {
    it(`${source} has a color`, () => {
      expect(CONTACT_SOURCE_COLORS[source]).toBeDefined();
    });

    it(`${source} color contains bg-`, () => {
      expect(CONTACT_SOURCE_COLORS[source]).toContain('bg-');
    });

    it(`${source} color contains text-`, () => {
      expect(CONTACT_SOURCE_COLORS[source]).toContain('text-');
    });
  }

  it('WEBSITE is blue', () => {
    expect(CONTACT_SOURCE_COLORS.WEBSITE).toContain('blue');
  });

  it('REFERRAL is green', () => {
    expect(CONTACT_SOURCE_COLORS.REFERRAL).toContain('green');
  });

  it('LINKEDIN is indigo', () => {
    expect(CONTACT_SOURCE_COLORS.LINKEDIN).toContain('indigo');
  });

  it('COLD_CALL is orange', () => {
    expect(CONTACT_SOURCE_COLORS.COLD_CALL).toContain('orange');
  });

  it('TRADE_SHOW is purple', () => {
    expect(CONTACT_SOURCE_COLORS.TRADE_SHOW).toContain('purple');
  });

  it('INBOUND is teal', () => {
    expect(CONTACT_SOURCE_COLORS.INBOUND).toContain('teal');
  });

  it('OTHER is gray', () => {
    expect(CONTACT_SOURCE_COLORS.OTHER).toContain('gray');
  });
});

// ---------------------------------------------------------------------------
// Contact initial form state
// ---------------------------------------------------------------------------

describe('CONTACT_INITIAL_FORM', () => {
  it('firstName is empty string', () => expect(CONTACT_INITIAL_FORM.firstName).toBe(''));
  it('lastName is empty string', () => expect(CONTACT_INITIAL_FORM.lastName).toBe(''));
  it('email is empty string', () => expect(CONTACT_INITIAL_FORM.email).toBe(''));
  it('phone is empty string', () => expect(CONTACT_INITIAL_FORM.phone).toBe(''));
  it('title is empty string', () => expect(CONTACT_INITIAL_FORM.title).toBe(''));
  it('source defaults to WEBSITE', () => expect(CONTACT_INITIAL_FORM.source).toBe('WEBSITE'));
  it('accountId is empty string', () => expect(CONTACT_INITIAL_FORM.accountId).toBe(''));
  it('has 7 fields', () => expect(Object.keys(CONTACT_INITIAL_FORM)).toHaveLength(7));
});

// ---------------------------------------------------------------------------
// Lead status colors
// ---------------------------------------------------------------------------

describe('LEAD_STATUS_COLORS', () => {
  it('has 5 status entries', () => {
    expect(Object.keys(LEAD_STATUS_COLORS)).toHaveLength(5);
  });

  for (const status of LEAD_STATUSES) {
    it(`${status} has a color defined`, () => {
      expect(LEAD_STATUS_COLORS[status]).toBeDefined();
    });

    it(`${status} color contains bg-`, () => {
      expect(LEAD_STATUS_COLORS[status]).toContain('bg-');
    });
  }

  it('QUALIFIED is green', () => {
    expect(LEAD_STATUS_COLORS.QUALIFIED).toContain('green');
  });

  it('DISQUALIFIED is red', () => {
    expect(LEAD_STATUS_COLORS.DISQUALIFIED).toContain('red');
  });

  it('NEW is blue', () => {
    expect(LEAD_STATUS_COLORS.NEW).toContain('blue');
  });

  it('CONVERTED is purple', () => {
    expect(LEAD_STATUS_COLORS.CONVERTED).toContain('purple');
  });
});

// ---------------------------------------------------------------------------
// Lead initial form state
// ---------------------------------------------------------------------------

describe('LEAD_INITIAL_FORM', () => {
  it('firstName is empty string', () => expect(LEAD_INITIAL_FORM.firstName).toBe(''));
  it('lastName is empty string', () => expect(LEAD_INITIAL_FORM.lastName).toBe(''));
  it('email is empty string', () => expect(LEAD_INITIAL_FORM.email).toBe(''));
  it('company is empty string', () => expect(LEAD_INITIAL_FORM.company).toBe(''));
  it('source defaults to WEBSITE', () => expect(LEAD_INITIAL_FORM.source).toBe('WEBSITE'));
  it('score defaults to "0"', () => expect(LEAD_INITIAL_FORM.score).toBe('0'));
  it('has 6 fields', () => expect(Object.keys(LEAD_INITIAL_FORM)).toHaveLength(6));
});

// ---------------------------------------------------------------------------
// Deal status colors
// ---------------------------------------------------------------------------

describe('DEAL_STATUS_COLORS', () => {
  it('has 3 status entries', () => {
    expect(Object.keys(DEAL_STATUS_COLORS)).toHaveLength(3);
  });

  for (const status of DEAL_STATUSES) {
    it(`${status} has a color`, () => {
      expect(DEAL_STATUS_COLORS[status]).toBeDefined();
    });
  }

  it('OPEN is blue', () => expect(DEAL_STATUS_COLORS.OPEN).toContain('blue'));
  it('WON is green', () => expect(DEAL_STATUS_COLORS.WON).toContain('green'));
  it('LOST is red', () => expect(DEAL_STATUS_COLORS.LOST).toContain('red'));
});

// ---------------------------------------------------------------------------
// Stage labels map
// ---------------------------------------------------------------------------

describe('STAGE_LABELS', () => {
  it('has 6 entries', () => {
    expect(Object.keys(STAGE_LABELS)).toHaveLength(6);
  });

  const stageLabelCases: [string, string][] = [
    ['PROSPECTING',   'Prospecting'],
    ['QUALIFICATION', 'Qualification'],
    ['PROPOSAL',      'Proposal'],
    ['NEGOTIATION',   'Negotiation'],
    ['CLOSED_WON',    'Closed Won'],
    ['CLOSED_LOST',   'Closed Lost'],
  ];

  for (const [key, expected] of stageLabelCases) {
    it(`${key} label is "${expected}"`, () => {
      expect(STAGE_LABELS[key]).toBe(expected);
    });
  }

  it('all label values are non-empty strings', () => {
    for (const label of Object.values(STAGE_LABELS)) {
      expect(typeof label).toBe('string');
      expect(label.length).toBeGreaterThan(0);
    }
  });

  it('STAGE_LABELS keys match STAGES keys', () => {
    const stageKeys = STAGES.map((s) => s.key).sort();
    const labelKeys = Object.keys(STAGE_LABELS).sort();
    expect(labelKeys).toEqual(stageKeys);
  });
});

// ---------------------------------------------------------------------------
// Deal initial form state
// ---------------------------------------------------------------------------

describe('DEAL_INITIAL_FORM', () => {
  it('title is empty string', () => expect(DEAL_INITIAL_FORM.title).toBe(''));
  it('value is empty string', () => expect(DEAL_INITIAL_FORM.value).toBe(''));
  it('stage defaults to PROSPECTING', () => expect(DEAL_INITIAL_FORM.stage).toBe('PROSPECTING'));
  it('probability defaults to "20"', () => expect(DEAL_INITIAL_FORM.probability).toBe('20'));
  it('expectedCloseDate is empty string', () => expect(DEAL_INITIAL_FORM.expectedCloseDate).toBe(''));
  it('assignedTo is empty string', () => expect(DEAL_INITIAL_FORM.assignedTo).toBe(''));
  it('accountId is empty string', () => expect(DEAL_INITIAL_FORM.accountId).toBe(''));
  it('has 7 fields', () => expect(Object.keys(DEAL_INITIAL_FORM)).toHaveLength(7));
});

// ---------------------------------------------------------------------------
// Dashboard KPI cards
// ---------------------------------------------------------------------------

describe('KPI_CARDS', () => {
  it('has 6 KPI cards', () => {
    expect(KPI_CARDS).toHaveLength(6);
  });

  for (const card of KPI_CARDS) {
    it(`"${card.title}" has a non-empty subtitle`, () => {
      expect(card.subtitle.length).toBeGreaterThan(0);
    });

    it(`"${card.title}" href starts with /`, () => {
      expect(card.href.startsWith('/')).toBe(true);
    });
  }

  it('Total Contacts links to /contacts', () => {
    const card = KPI_CARDS.find((c) => c.title === 'Total Contacts');
    expect(card?.href).toBe('/contacts');
  });

  it('Pipeline Value links to /pipeline', () => {
    const card = KPI_CARDS.find((c) => c.title === 'Pipeline Value');
    expect(card?.href).toBe('/pipeline');
  });

  it('Conversion Rate links to /reports', () => {
    const card = KPI_CARDS.find((c) => c.title === 'Conversion Rate');
    expect(card?.href).toBe('/reports');
  });
});

// ---------------------------------------------------------------------------
// formatCurrencyUSD
// ---------------------------------------------------------------------------

describe('formatCurrencyUSD', () => {
  it('formats 0 with dollar sign', () => {
    expect(formatCurrencyUSD(0)).toContain('$');
  });

  it('formats 1000 with no decimal places', () => {
    const result = formatCurrencyUSD(1000);
    expect(result).not.toContain('.');
    expect(result).toContain('$');
  });

  it('formats 1000000 as $1,000,000', () => {
    expect(formatCurrencyUSD(1000000)).toBe('$1,000,000');
  });

  it('returns a non-empty string for any non-negative integer', () => {
    for (let i = 0; i <= 10; i++) {
      expect(formatCurrencyUSD(i * 1000).length).toBeGreaterThan(0);
    }
  });
});

// ---------------------------------------------------------------------------
// computeWeightedValue
// ---------------------------------------------------------------------------

describe('computeWeightedValue', () => {
  it('100% probability = full value', () => {
    expect(computeWeightedValue(50000, 100)).toBe(50000);
  });

  it('0% probability = 0', () => {
    expect(computeWeightedValue(50000, 0)).toBe(0);
  });

  it('50% probability = half value', () => {
    expect(computeWeightedValue(50000, 50)).toBe(25000);
  });

  it('20% probability (PROSPECTING default)', () => {
    expect(computeWeightedValue(100000, 20)).toBe(20000);
  });

  it('result is always >= 0 for non-negative inputs', () => {
    for (let p = 0; p <= 100; p += 10) {
      expect(computeWeightedValue(10000, p)).toBeGreaterThanOrEqual(0);
    }
  });

  it('result is always <= value for probability in 0-100', () => {
    for (let p = 0; p <= 100; p += 10) {
      expect(computeWeightedValue(10000, p)).toBeLessThanOrEqual(10000);
    }
  });
});

// ---------------------------------------------------------------------------
// isLeadQualifiable
// ---------------------------------------------------------------------------

describe('isLeadQualifiable', () => {
  it('NEW leads can be qualified', () => {
    expect(isLeadQualifiable('NEW')).toBe(true);
  });

  it('CONTACTED leads can be qualified', () => {
    expect(isLeadQualifiable('CONTACTED')).toBe(true);
  });

  it('QUALIFIED leads cannot be re-qualified', () => {
    expect(isLeadQualifiable('QUALIFIED')).toBe(false);
  });

  it('DISQUALIFIED leads cannot be qualified', () => {
    expect(isLeadQualifiable('DISQUALIFIED')).toBe(false);
  });

  it('CONVERTED leads cannot be qualified', () => {
    expect(isLeadQualifiable('CONVERTED')).toBe(false);
  });

  it('returns boolean for all statuses', () => {
    for (const status of LEAD_STATUSES) {
      expect(typeof isLeadQualifiable(status)).toBe('boolean');
    }
  });
});

// ---------------------------------------------------------------------------
// scoreClass
// ---------------------------------------------------------------------------

describe('scoreClass', () => {
  it('score 70 → high', () => expect(scoreClass(70)).toBe('high'));
  it('score 100 → high', () => expect(scoreClass(100)).toBe('high'));
  it('score 40 → medium', () => expect(scoreClass(40)).toBe('medium'));
  it('score 69 → medium', () => expect(scoreClass(69)).toBe('medium'));
  it('score 0 → low', () => expect(scoreClass(0)).toBe('low'));
  it('score 39 → low', () => expect(scoreClass(39)).toBe('low'));

  it('returns "high" | "medium" | "low" for all integer scores 0-100', () => {
    const valid = new Set(['high', 'medium', 'low']);
    for (let s = 0; s <= 100; s++) {
      expect(valid.has(scoreClass(s))).toBe(true);
    }
  });
});
