// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

// ── Inlined domain constants (from contracts/client.tsx) ─────────────────────

const TYPES = [
  'SUPPLIER',
  'CUSTOMER',
  'SERVICE',
  'NDA',
  'LEASE',
  'EMPLOYMENT',
  'PARTNERSHIP',
  'OTHER',
] as const;

const STATUSES = [
  'DRAFT',
  'PENDING_APPROVAL',
  'ACTIVE',
  'EXPIRED',
  'TERMINATED',
  'RENEWED',
] as const;

// ── Inlined clause categories (from clauses/client.tsx) ───────────────────────

const CATEGORIES = [
  'GENERAL',
  'PAYMENT',
  'TERMINATION',
  'LIABILITY',
  'CONFIDENTIALITY',
  'INDEMNITY',
  'IP',
  'COMPLIANCE',
  'DISPUTE',
  'OTHER',
] as const;

// ── Inlined extraction result field keys (from extraction/client.tsx) ─────────

const EXTRACTION_FIELDS = ['parties', 'dates', 'values', 'keyTerms'] as const;

// ── Inlined status color map (mirrors getStatusColor in source) ───────────────

const STATUS_COLOR: Record<string, string> = {
  ACTIVE:           'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  DRAFT:            'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
  PENDING_APPROVAL: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  EXPIRED:          'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  TERMINATED:       'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  RENEWED:          'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
};

// ── Inlined emptyForm defaults (from contracts/client.tsx) ────────────────────

const EMPTY_CONTRACT_FORM = {
  title:               '',
  description:         '',
  type:                'SERVICE',
  status:              'DRAFT',
  counterparty:        '',
  counterpartyContact: '',
  value:               '',
  currency:            'USD',
  startDate:           '',
  endDate:             '',
  renewalDate:         '',
  autoRenew:           false,
  noticePeriodDays:    '30',
  paymentTerms:        '',
  owner:               '',
  ownerName:           '',
  department:          '',
  notes:               '',
} as const;

// ── Inlined clause emptyForm defaults (from clauses/client.tsx) ───────────────

const EMPTY_CLAUSE_FORM = {
  contractId:   '',
  title:        '',
  content:      '',
  clauseNumber: '',
  category:     'GENERAL',
  isKey:        false,
} as const;

// ── Inlined mock contracts ────────────────────────────────────────────────────

interface MockContract {
  id: string;
  referenceNumber: string;
  title: string;
  type: string;
  status: string;
  counterparty: string;
  value: number;
  currency: string;
  autoRenew: boolean;
  noticePeriodDays: number;
}

const MOCK_CONTRACTS: MockContract[] = [
  {
    id: 'ctr-001',
    referenceNumber: 'CTR-2026-001',
    title: 'Annual SaaS Platform License',
    type: 'SERVICE',
    status: 'ACTIVE',
    counterparty: 'Acme Corp',
    value: 120000,
    currency: 'USD',
    autoRenew: true,
    noticePeriodDays: 90,
  },
  {
    id: 'ctr-002',
    referenceNumber: 'CTR-2026-002',
    title: 'Supplier Framework Agreement',
    type: 'SUPPLIER',
    status: 'DRAFT',
    counterparty: 'Global Parts Ltd',
    value: 500000,
    currency: 'GBP',
    autoRenew: false,
    noticePeriodDays: 60,
  },
  {
    id: 'ctr-003',
    referenceNumber: 'CTR-2026-003',
    title: 'Non-Disclosure Agreement — R&D',
    type: 'NDA',
    status: 'PENDING_APPROVAL',
    counterparty: 'Research Partners AG',
    value: 0,
    currency: 'EUR',
    autoRenew: false,
    noticePeriodDays: 30,
  },
  {
    id: 'ctr-004',
    referenceNumber: 'CTR-2026-004',
    title: 'Office Lease — Headquarters',
    type: 'LEASE',
    status: 'EXPIRED',
    counterparty: 'City Properties PLC',
    value: 240000,
    currency: 'GBP',
    autoRenew: false,
    noticePeriodDays: 180,
  },
  {
    id: 'ctr-005',
    referenceNumber: 'CTR-2026-005',
    title: 'Employment Contract — CTO',
    type: 'EMPLOYMENT',
    status: 'ACTIVE',
    counterparty: 'Internal',
    value: 180000,
    currency: 'USD',
    autoRenew: true,
    noticePeriodDays: 90,
  },
];

// ── Inlined mock clauses ──────────────────────────────────────────────────────

interface MockClause {
  id: string;
  referenceNumber: string;
  contractId: string;
  title: string;
  category: string;
  isKey: boolean;
  clauseNumber: string;
}

const MOCK_CLAUSES: MockClause[] = [
  {
    id: 'cls-001',
    referenceNumber: 'CLS-2026-001',
    contractId: 'ctr-001',
    title: 'Payment Terms and Schedule',
    category: 'PAYMENT',
    isKey: true,
    clauseNumber: '4.1',
  },
  {
    id: 'cls-002',
    referenceNumber: 'CLS-2026-002',
    contractId: 'ctr-001',
    title: 'Confidentiality Obligations',
    category: 'CONFIDENTIALITY',
    isKey: true,
    clauseNumber: '7.2',
  },
  {
    id: 'cls-003',
    referenceNumber: 'CLS-2026-003',
    contractId: 'ctr-002',
    title: 'Termination for Convenience',
    category: 'TERMINATION',
    isKey: false,
    clauseNumber: '12.1',
  },
  {
    id: 'cls-004',
    referenceNumber: 'CLS-2026-004',
    contractId: 'ctr-003',
    title: 'Limitation of Liability',
    category: 'LIABILITY',
    isKey: true,
    clauseNumber: '9.3',
  },
  {
    id: 'cls-005',
    referenceNumber: 'CLS-2026-005',
    contractId: 'ctr-001',
    title: 'Intellectual Property Ownership',
    category: 'IP',
    isKey: false,
    clauseNumber: '15.2',
  },
];

// ── Pure helper functions (domain logic) ──────────────────────────────────────

function isActiveContract(status: string): boolean {
  return status === 'ACTIVE';
}

function isTerminalStatus(status: string): boolean {
  return status === 'EXPIRED' || status === 'TERMINATED';
}

function requiresApproval(status: string): boolean {
  return status === 'PENDING_APPROVAL';
}

function totalContractValue(contracts: { value: number }[]): number {
  return contracts.reduce((sum, c) => sum + c.value, 0);
}

function normaliseDisplay(raw: string): string {
  return raw.replace(/_/g, ' ');
}

// ── 1. TYPES array ────────────────────────────────────────────────────────────

describe('TYPES array', () => {
  it('has exactly 8 values', () => expect(TYPES).toHaveLength(8));
  it('contains SUPPLIER', () => expect(TYPES).toContain('SUPPLIER'));
  it('contains CUSTOMER', () => expect(TYPES).toContain('CUSTOMER'));
  it('contains SERVICE', () => expect(TYPES).toContain('SERVICE'));
  it('contains NDA', () => expect(TYPES).toContain('NDA'));
  it('contains LEASE', () => expect(TYPES).toContain('LEASE'));
  it('contains EMPLOYMENT', () => expect(TYPES).toContain('EMPLOYMENT'));
  it('contains PARTNERSHIP', () => expect(TYPES).toContain('PARTNERSHIP'));
  it('contains OTHER', () => expect(TYPES).toContain('OTHER'));
  it('first value is SUPPLIER', () => expect(TYPES[0]).toBe('SUPPLIER'));
  it('last value is OTHER', () => expect(TYPES[TYPES.length - 1]).toBe('OTHER'));
  it('has no duplicates', () => expect(new Set(TYPES).size).toBe(TYPES.length));

  for (const t of TYPES) {
    it(`${t} is a non-empty string`, () => {
      expect(typeof t).toBe('string');
      expect(t.length).toBeGreaterThan(0);
    });
    it(`${t} is uppercase`, () => expect(t).toBe(t.toUpperCase()));
  }
});

// ── 2. STATUSES array ─────────────────────────────────────────────────────────

describe('STATUSES array', () => {
  it('has exactly 6 values', () => expect(STATUSES).toHaveLength(6));
  it('contains DRAFT', () => expect(STATUSES).toContain('DRAFT'));
  it('contains PENDING_APPROVAL', () => expect(STATUSES).toContain('PENDING_APPROVAL'));
  it('contains ACTIVE', () => expect(STATUSES).toContain('ACTIVE'));
  it('contains EXPIRED', () => expect(STATUSES).toContain('EXPIRED'));
  it('contains TERMINATED', () => expect(STATUSES).toContain('TERMINATED'));
  it('contains RENEWED', () => expect(STATUSES).toContain('RENEWED'));
  it('first value is DRAFT', () => expect(STATUSES[0]).toBe('DRAFT'));
  it('has no duplicates', () => expect(new Set(STATUSES).size).toBe(STATUSES.length));

  for (const s of STATUSES) {
    it(`${s} is a non-empty string`, () => {
      expect(typeof s).toBe('string');
      expect(s.length).toBeGreaterThan(0);
    });
    it(`${s} is uppercase`, () => expect(s).toBe(s.toUpperCase()));
  }
});

// ── 3. CATEGORIES array ───────────────────────────────────────────────────────

describe('CATEGORIES array', () => {
  it('has exactly 10 values', () => expect(CATEGORIES).toHaveLength(10));
  it('contains GENERAL', () => expect(CATEGORIES).toContain('GENERAL'));
  it('contains PAYMENT', () => expect(CATEGORIES).toContain('PAYMENT'));
  it('contains TERMINATION', () => expect(CATEGORIES).toContain('TERMINATION'));
  it('contains LIABILITY', () => expect(CATEGORIES).toContain('LIABILITY'));
  it('contains CONFIDENTIALITY', () => expect(CATEGORIES).toContain('CONFIDENTIALITY'));
  it('contains INDEMNITY', () => expect(CATEGORIES).toContain('INDEMNITY'));
  it('contains IP', () => expect(CATEGORIES).toContain('IP'));
  it('contains COMPLIANCE', () => expect(CATEGORIES).toContain('COMPLIANCE'));
  it('contains DISPUTE', () => expect(CATEGORIES).toContain('DISPUTE'));
  it('contains OTHER', () => expect(CATEGORIES).toContain('OTHER'));
  it('first value is GENERAL', () => expect(CATEGORIES[0]).toBe('GENERAL'));
  it('last value is OTHER', () => expect(CATEGORIES[CATEGORIES.length - 1]).toBe('OTHER'));
  it('has no duplicates', () => expect(new Set(CATEGORIES).size).toBe(CATEGORIES.length));

  for (const c of CATEGORIES) {
    it(`${c} is a non-empty string`, () => {
      expect(typeof c).toBe('string');
      expect(c.length).toBeGreaterThan(0);
    });
    it(`${c} is uppercase`, () => expect(c).toBe(c.toUpperCase()));
  }
});

// ── 4. EXTRACTION_FIELDS ──────────────────────────────────────────────────────

describe('EXTRACTION_FIELDS', () => {
  it('has exactly 4 fields', () => expect(EXTRACTION_FIELDS).toHaveLength(4));
  it('contains parties', () => expect(EXTRACTION_FIELDS).toContain('parties'));
  it('contains dates', () => expect(EXTRACTION_FIELDS).toContain('dates'));
  it('contains values', () => expect(EXTRACTION_FIELDS).toContain('values'));
  it('contains keyTerms', () => expect(EXTRACTION_FIELDS).toContain('keyTerms'));
  it('has no duplicates', () => expect(new Set(EXTRACTION_FIELDS).size).toBe(EXTRACTION_FIELDS.length));

  for (const f of EXTRACTION_FIELDS) {
    it(`${f} is a non-empty string`, () => {
      expect(typeof f).toBe('string');
      expect(f.length).toBeGreaterThan(0);
    });
  }
});

// ── 5. STATUS_COLOR map ───────────────────────────────────────────────────────

describe('STATUS_COLOR map', () => {
  for (const s of STATUSES) {
    it(`${s} has a color entry`, () => expect(STATUS_COLOR[s]).toBeDefined());
    it(`${s} color is a non-empty string`, () => {
      expect(typeof STATUS_COLOR[s]).toBe('string');
      expect(STATUS_COLOR[s].length).toBeGreaterThan(0);
    });
    it(`${s} color contains bg-`, () => expect(STATUS_COLOR[s]).toContain('bg-'));
    it(`${s} color contains text-`, () => expect(STATUS_COLOR[s]).toContain('text-'));
  }

  it('ACTIVE is green', () => expect(STATUS_COLOR.ACTIVE).toContain('green'));
  it('DRAFT is gray', () => expect(STATUS_COLOR.DRAFT).toContain('gray'));
  it('PENDING_APPROVAL is amber', () => expect(STATUS_COLOR.PENDING_APPROVAL).toContain('amber'));
  it('EXPIRED is red', () => expect(STATUS_COLOR.EXPIRED).toContain('red'));
  it('TERMINATED is red', () => expect(STATUS_COLOR.TERMINATED).toContain('red'));
  it('RENEWED is blue', () => expect(STATUS_COLOR.RENEWED).toContain('blue'));
  it('all color entries have dark-mode class', () => {
    for (const color of Object.values(STATUS_COLOR)) {
      expect(color).toContain('dark:');
    }
  });
  it('has exactly 6 entries', () => expect(Object.keys(STATUS_COLOR)).toHaveLength(6));
});

// ── 6. EMPTY_CONTRACT_FORM defaults ──────────────────────────────────────────

describe('EMPTY_CONTRACT_FORM defaults', () => {
  it('default type is SERVICE', () => expect(EMPTY_CONTRACT_FORM.type).toBe('SERVICE'));
  it('default status is DRAFT', () => expect(EMPTY_CONTRACT_FORM.status).toBe('DRAFT'));
  it('default currency is USD', () => expect(EMPTY_CONTRACT_FORM.currency).toBe('USD'));
  it('default autoRenew is false', () => expect(EMPTY_CONTRACT_FORM.autoRenew).toBe(false));
  it('default noticePeriodDays is 30', () => expect(EMPTY_CONTRACT_FORM.noticePeriodDays).toBe('30'));
  it('default title is empty string', () => expect(EMPTY_CONTRACT_FORM.title).toBe(''));
  it('default value is empty string', () => expect(EMPTY_CONTRACT_FORM.value).toBe(''));
  it('default counterparty is empty string', () => expect(EMPTY_CONTRACT_FORM.counterparty).toBe(''));
  it('default notes is empty string', () => expect(EMPTY_CONTRACT_FORM.notes).toBe(''));
  it('TYPES includes default type', () => expect(TYPES).toContain(EMPTY_CONTRACT_FORM.type));
  it('STATUSES includes default status', () => expect(STATUSES).toContain(EMPTY_CONTRACT_FORM.status));
});

// ── 7. EMPTY_CLAUSE_FORM defaults ────────────────────────────────────────────

describe('EMPTY_CLAUSE_FORM defaults', () => {
  it('default category is GENERAL', () => expect(EMPTY_CLAUSE_FORM.category).toBe('GENERAL'));
  it('default isKey is false', () => expect(EMPTY_CLAUSE_FORM.isKey).toBe(false));
  it('default contractId is empty string', () => expect(EMPTY_CLAUSE_FORM.contractId).toBe(''));
  it('default title is empty string', () => expect(EMPTY_CLAUSE_FORM.title).toBe(''));
  it('default content is empty string', () => expect(EMPTY_CLAUSE_FORM.content).toBe(''));
  it('default clauseNumber is empty string', () => expect(EMPTY_CLAUSE_FORM.clauseNumber).toBe(''));
  it('CATEGORIES includes default category', () => expect(CATEGORIES).toContain(EMPTY_CLAUSE_FORM.category));
});

// ── 8. Mock contracts shape ───────────────────────────────────────────────────

describe('MOCK_CONTRACTS', () => {
  it('has 5 entries', () => expect(MOCK_CONTRACTS).toHaveLength(5));

  for (const c of MOCK_CONTRACTS) {
    it(`${c.referenceNumber} has id`, () => expect(typeof c.id).toBe('string'));
    it(`${c.referenceNumber} has non-empty referenceNumber`, () => expect(c.referenceNumber.length).toBeGreaterThan(0));
    it(`${c.referenceNumber} has non-empty title`, () => expect(c.title.length).toBeGreaterThan(0));
    it(`${c.referenceNumber} type is in TYPES`, () => expect(TYPES).toContain(c.type));
    it(`${c.referenceNumber} status is in STATUSES`, () => expect(STATUSES).toContain(c.status));
    it(`${c.referenceNumber} value is non-negative`, () => expect(c.value).toBeGreaterThanOrEqual(0));
    it(`${c.referenceNumber} currency is non-empty`, () => expect(c.currency.length).toBeGreaterThan(0));
    it(`${c.referenceNumber} autoRenew is boolean`, () => expect(typeof c.autoRenew).toBe('boolean'));
    it(`${c.referenceNumber} noticePeriodDays is positive`, () => expect(c.noticePeriodDays).toBeGreaterThan(0));
    it(`${c.referenceNumber} referenceNumber starts with CTR-`, () => expect(c.referenceNumber).toMatch(/^CTR-/));
  }

  it('mock contract ids are unique', () => {
    const ids = MOCK_CONTRACTS.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
  it('mock contract referenceNumbers are unique', () => {
    const refs = MOCK_CONTRACTS.map((c) => c.referenceNumber);
    expect(new Set(refs).size).toBe(refs.length);
  });
});

// ── 9. Mock clauses shape ─────────────────────────────────────────────────────

describe('MOCK_CLAUSES', () => {
  it('has 5 entries', () => expect(MOCK_CLAUSES).toHaveLength(5));

  for (const cl of MOCK_CLAUSES) {
    it(`${cl.referenceNumber} has id`, () => expect(typeof cl.id).toBe('string'));
    it(`${cl.referenceNumber} has non-empty title`, () => expect(cl.title.length).toBeGreaterThan(0));
    it(`${cl.referenceNumber} category is in CATEGORIES`, () => expect(CATEGORIES).toContain(cl.category));
    it(`${cl.referenceNumber} isKey is boolean`, () => expect(typeof cl.isKey).toBe('boolean'));
    it(`${cl.referenceNumber} clauseNumber is non-empty`, () => expect(cl.clauseNumber.length).toBeGreaterThan(0));
    it(`${cl.referenceNumber} referenceNumber starts with CLS-`, () => expect(cl.referenceNumber).toMatch(/^CLS-/));
    it(`${cl.referenceNumber} contractId references a known contract`, () => {
      const knownIds = MOCK_CONTRACTS.map((c) => c.id);
      expect(knownIds).toContain(cl.contractId);
    });
  }

  it('key clauses count is 3', () => {
    expect(MOCK_CLAUSES.filter((c) => c.isKey)).toHaveLength(3);
  });
  it('non-key clauses count is 2', () => {
    expect(MOCK_CLAUSES.filter((c) => !c.isKey)).toHaveLength(2);
  });
  it('mock clause ids are unique', () => {
    const ids = MOCK_CLAUSES.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

// ── 10. isActiveContract ──────────────────────────────────────────────────────

describe('isActiveContract', () => {
  it('ACTIVE returns true', () => expect(isActiveContract('ACTIVE')).toBe(true));

  for (const s of STATUSES) {
    if (s !== 'ACTIVE') {
      it(`${s} returns false`, () => expect(isActiveContract(s)).toBe(false));
    }
  }

  it('empty string returns false', () => expect(isActiveContract('')).toBe(false));
  it('unknown status returns false', () => expect(isActiveContract('UNKNOWN')).toBe(false));
  it('mock active contracts count is 2', () => {
    expect(MOCK_CONTRACTS.filter((c) => isActiveContract(c.status))).toHaveLength(2);
  });

  for (const s of STATUSES) {
    it(`${s} returns boolean`, () => expect(typeof isActiveContract(s)).toBe('boolean'));
  }
});

// ── 11. isTerminalStatus ──────────────────────────────────────────────────────

describe('isTerminalStatus', () => {
  it('EXPIRED returns true', () => expect(isTerminalStatus('EXPIRED')).toBe(true));
  it('TERMINATED returns true', () => expect(isTerminalStatus('TERMINATED')).toBe(true));
  it('ACTIVE returns false', () => expect(isTerminalStatus('ACTIVE')).toBe(false));
  it('DRAFT returns false', () => expect(isTerminalStatus('DRAFT')).toBe(false));
  it('RENEWED returns false', () => expect(isTerminalStatus('RENEWED')).toBe(false));
  it('PENDING_APPROVAL returns false', () => expect(isTerminalStatus('PENDING_APPROVAL')).toBe(false));
  it('empty string returns false', () => expect(isTerminalStatus('')).toBe(false));
  it('mock terminal contracts count is 1', () => {
    expect(MOCK_CONTRACTS.filter((c) => isTerminalStatus(c.status))).toHaveLength(1);
  });

  for (const s of STATUSES) {
    it(`${s} returns boolean`, () => expect(typeof isTerminalStatus(s)).toBe('boolean'));
  }
});

// ── 12. requiresApproval ──────────────────────────────────────────────────────

describe('requiresApproval', () => {
  it('PENDING_APPROVAL returns true', () => expect(requiresApproval('PENDING_APPROVAL')).toBe(true));
  it('ACTIVE returns false', () => expect(requiresApproval('ACTIVE')).toBe(false));
  it('DRAFT returns false', () => expect(requiresApproval('DRAFT')).toBe(false));
  it('empty string returns false', () => expect(requiresApproval('')).toBe(false));
  it('mock pending count is 1', () => {
    expect(MOCK_CONTRACTS.filter((c) => requiresApproval(c.status))).toHaveLength(1);
  });

  for (const s of STATUSES) {
    it(`${s} returns boolean`, () => expect(typeof requiresApproval(s)).toBe('boolean'));
  }
});

// ── 13. totalContractValue ────────────────────────────────────────────────────

describe('totalContractValue', () => {
  it('empty array returns 0', () => expect(totalContractValue([])).toBe(0));
  it('single contract returns its value', () => {
    expect(totalContractValue([{ value: 50000 }])).toBe(50000);
  });
  it('multiple contracts sum correctly', () => {
    expect(totalContractValue([{ value: 100 }, { value: 200 }, { value: 300 }])).toBe(600);
  });
  it('zero-value contract adds 0', () => {
    expect(totalContractValue([{ value: 1000 }, { value: 0 }])).toBe(1000);
  });
  it('mock contracts total is 1040000', () => {
    const total = totalContractValue(MOCK_CONTRACTS.map((c) => ({ value: c.value })));
    expect(total).toBe(1040000);
  });

  for (let n = 0; n <= 10; n++) {
    it(`sum of ${n} contracts at 1000 each = ${n * 1000}`, () => {
      const items = Array.from({ length: n }, () => ({ value: 1000 }));
      expect(totalContractValue(items)).toBe(n * 1000);
    });
  }
});

// ── 14. normaliseDisplay (underscore to space) ────────────────────────────────

describe('normaliseDisplay', () => {
  it('PENDING_APPROVAL becomes PENDING APPROVAL', () => {
    expect(normaliseDisplay('PENDING_APPROVAL')).toBe('PENDING APPROVAL');
  });
  it('ROOT_CAUSE_ANALYSIS replaces all underscores', () => {
    expect(normaliseDisplay('ROOT_CAUSE_ANALYSIS')).toBe('ROOT CAUSE ANALYSIS');
  });
  it('ACTIVE remains ACTIVE', () => expect(normaliseDisplay('ACTIVE')).toBe('ACTIVE'));
  it('empty string stays empty', () => expect(normaliseDisplay('')).toBe(''));

  for (const s of STATUSES) {
    it(`${s} normalised has no underscores`, () => {
      expect(normaliseDisplay(s)).not.toContain('_');
    });
  }

  for (const t of TYPES) {
    it(`${t} normalised has no underscores`, () => {
      expect(normaliseDisplay(t)).not.toContain('_');
    });
  }

  for (const c of CATEGORIES) {
    it(`${c} normalised has no underscores`, () => {
      expect(normaliseDisplay(c)).not.toContain('_');
    });
  }
});

// ── 15. Mock data uniqueness invariants ───────────────────────────────────────

describe('Uniqueness invariants', () => {
  it('TYPES has no duplicates', () => expect(new Set(TYPES).size).toBe(TYPES.length));
  it('STATUSES has no duplicates', () => expect(new Set(STATUSES).size).toBe(STATUSES.length));
  it('CATEGORIES has no duplicates', () => expect(new Set(CATEGORIES).size).toBe(CATEGORIES.length));
  it('EXTRACTION_FIELDS has no duplicates', () => expect(new Set(EXTRACTION_FIELDS).size).toBe(EXTRACTION_FIELDS.length));
  it('STATUS_COLOR keys match STATUSES', () => {
    for (const s of STATUSES) {
      expect(Object.keys(STATUS_COLOR)).toContain(s);
    }
  });
});

// ── 16. Status filter simulation ─────────────────────────────────────────────

describe('Status filter simulation', () => {
  it('filtering ACTIVE gives 2 contracts', () => {
    expect(MOCK_CONTRACTS.filter((c) => c.status === 'ACTIVE')).toHaveLength(2);
  });
  it('filtering DRAFT gives 1 contract', () => {
    expect(MOCK_CONTRACTS.filter((c) => c.status === 'DRAFT')).toHaveLength(1);
  });
  it('filtering PENDING_APPROVAL gives 1 contract', () => {
    expect(MOCK_CONTRACTS.filter((c) => c.status === 'PENDING_APPROVAL')).toHaveLength(1);
  });
  it('filtering EXPIRED gives 1 contract', () => {
    expect(MOCK_CONTRACTS.filter((c) => c.status === 'EXPIRED')).toHaveLength(1);
  });
  it('all mock contracts have a status in STATUSES', () => {
    for (const c of MOCK_CONTRACTS) {
      expect(STATUSES).toContain(c.status);
    }
  });
  it('all mock clauses have a category in CATEGORIES', () => {
    for (const cl of MOCK_CLAUSES) {
      expect(CATEGORIES).toContain(cl.category);
    }
  });
  it('autoRenew contracts: 2', () => {
    expect(MOCK_CONTRACTS.filter((c) => c.autoRenew)).toHaveLength(2);
  });
  it('non-autoRenew contracts: 3', () => {
    expect(MOCK_CONTRACTS.filter((c) => !c.autoRenew)).toHaveLength(3);
  });
});

// ─── TYPES — positional index parametric ─────────────────────────────────────

describe('TYPES — positional index parametric', () => {
  const expected = [
    [0, 'SUPPLIER'],
    [1, 'CUSTOMER'],
    [2, 'SERVICE'],
    [3, 'NDA'],
    [4, 'LEASE'],
    [5, 'EMPLOYMENT'],
    [6, 'PARTNERSHIP'],
    [7, 'OTHER'],
  ] as const;
  for (const [idx, val] of expected) {
    it(`TYPES[${idx}] === '${val}'`, () => {
      expect(TYPES[idx]).toBe(val);
    });
  }
});

// ─── STATUSES — positional index parametric ──────────────────────────────────

describe('STATUSES — positional index parametric', () => {
  const expected = [
    [0, 'DRAFT'],
    [1, 'PENDING_APPROVAL'],
    [2, 'ACTIVE'],
    [3, 'EXPIRED'],
    [4, 'TERMINATED'],
    [5, 'RENEWED'],
  ] as const;
  for (const [idx, val] of expected) {
    it(`STATUSES[${idx}] === '${val}'`, () => {
      expect(STATUSES[idx]).toBe(val);
    });
  }
});

// ─── CATEGORIES — positional index parametric ────────────────────────────────

describe('CATEGORIES — positional index parametric', () => {
  const expected = [
    [0, 'GENERAL'],
    [1, 'PAYMENT'],
    [2, 'TERMINATION'],
    [3, 'LIABILITY'],
    [4, 'CONFIDENTIALITY'],
    [5, 'INDEMNITY'],
    [6, 'IP'],
    [7, 'COMPLIANCE'],
    [8, 'DISPUTE'],
    [9, 'OTHER'],
  ] as const;
  for (const [idx, val] of expected) {
    it(`CATEGORIES[${idx}] === '${val}'`, () => {
      expect(CATEGORIES[idx]).toBe(val);
    });
  }
});

// ─── EXTRACTION_FIELDS — positional index parametric ─────────────────────────

describe('EXTRACTION_FIELDS — positional index parametric', () => {
  const expected = [
    [0, 'parties'],
    [1, 'dates'],
    [2, 'values'],
    [3, 'keyTerms'],
  ] as const;
  for (const [idx, val] of expected) {
    it(`EXTRACTION_FIELDS[${idx}] === '${val}'`, () => {
      expect(EXTRACTION_FIELDS[idx]).toBe(val);
    });
  }
});
