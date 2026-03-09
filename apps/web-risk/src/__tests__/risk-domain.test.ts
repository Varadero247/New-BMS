// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

// ─── Inlined constants from categories/client.tsx ────────────────────────────

const CATEGORY_MOCK_DATA = [
  { category: 'STRATEGIC', count: 8 },
  { category: 'OPERATIONAL', count: 15 },
  { category: 'FINANCIAL', count: 6 },
  { category: 'COMPLIANCE', count: 4 },
  { category: 'REPUTATIONAL', count: 3 },
  { category: 'ENVIRONMENTAL', count: 5 },
  { category: 'HEALTH_SAFETY', count: 7 },
  { category: 'INFORMATION_SECURITY', count: 9 },
  { category: 'QUALITY', count: 11 },
  { category: 'SUPPLY_CHAIN', count: 6 },
];

const CATEGORY_COLORS: Record<string, string> = {
  STRATEGIC: 'bg-purple-500',
  OPERATIONAL: 'bg-blue-500',
  FINANCIAL: 'bg-green-500',
  COMPLIANCE: 'bg-yellow-500',
  REPUTATIONAL: 'bg-pink-500',
  ENVIRONMENTAL: 'bg-teal-500',
  HEALTH_SAFETY: 'bg-orange-500',
  INFORMATION_SECURITY: 'bg-red-500',
  QUALITY: 'bg-indigo-500',
  SUPPLY_CHAIN: 'bg-cyan-500',
};

const CATEGORY_BADGE_COLORS: Record<string, string> = {
  STRATEGIC: 'bg-purple-100 text-purple-700',
  OPERATIONAL: 'bg-blue-100 text-blue-700',
  FINANCIAL: 'bg-green-100 text-green-700',
  COMPLIANCE: 'bg-yellow-100 text-yellow-700',
  REPUTATIONAL: 'bg-pink-100 text-pink-700',
  ENVIRONMENTAL: 'bg-teal-100 text-teal-700',
  HEALTH_SAFETY: 'bg-orange-100 text-orange-700',
  INFORMATION_SECURITY: 'bg-red-100 text-red-700',
  QUALITY: 'bg-indigo-100 text-indigo-700',
  SUPPLY_CHAIN: 'bg-cyan-100 text-cyan-700',
};

// ─── Inlined constants from controls/client.tsx ───────────────────────────────

const CONTROL_TYPES = ['PREVENTIVE', 'DETECTIVE', 'REACTIVE', 'DIRECTIVE'] as const;
const EFFECTIVENESS_LEVELS = ['STRONG', 'ADEQUATE', 'WEAK', 'NONE_EFFECTIVE'] as const;

const CONTROL_TYPE_COLORS: Record<string, string> = {
  PREVENTIVE: 'bg-blue-100 text-blue-700',
  DETECTIVE: 'bg-yellow-100 text-yellow-700',
  REACTIVE: 'bg-red-100 text-red-700',
  DIRECTIVE: 'bg-purple-100 text-purple-700',
};

const EFFECTIVENESS_COLORS: Record<string, string> = {
  STRONG: 'bg-green-100 text-green-700',
  ADEQUATE: 'bg-blue-100 text-blue-700',
  WEAK: 'bg-yellow-100 text-yellow-700',
  NONE_EFFECTIVE: 'bg-red-100 text-red-700',
};

// ─── Inlined constants from risks/client.tsx ─────────────────────────────────

const CATEGORIES = [
  'STRATEGIC',
  'OPERATIONAL',
  'FINANCIAL',
  'COMPLIANCE',
  'REPUTATIONAL',
  'ENVIRONMENTAL',
  'HEALTH_SAFETY',
  'INFORMATION_SECURITY',
  'QUALITY',
  'SUPPLY_CHAIN',
] as const;

const LIKELIHOODS = ['RARE', 'UNLIKELY', 'POSSIBLE', 'LIKELY', 'ALMOST_CERTAIN'] as const;
const CONSEQUENCES = ['INSIGNIFICANT', 'MINOR', 'MODERATE', 'MAJOR', 'CATASTROPHIC'] as const;
const TREATMENTS = ['ACCEPT', 'MITIGATE', 'TRANSFER', 'AVOID', 'ESCALATE'] as const;
const RISK_STATUSES = ['IDENTIFIED', 'ASSESSED', 'TREATING', 'MONITORING', 'CLOSED'] as const;

const LIKELIHOOD_SCORES: Record<string, number> = {
  RARE: 1,
  UNLIKELY: 2,
  POSSIBLE: 3,
  LIKELY: 4,
  ALMOST_CERTAIN: 5,
};

const CONSEQUENCE_SCORES: Record<string, number> = {
  INSIGNIFICANT: 1,
  MINOR: 2,
  MODERATE: 3,
  MAJOR: 4,
  CATASTROPHIC: 5,
};

// ─── Inlined constants from treatments/client.tsx ────────────────────────────

const TREATMENT_MOCK_DATA = [
  { treatment: 'MITIGATE', count: 23 },
  { treatment: 'ACCEPT', count: 12 },
  { treatment: 'TRANSFER', count: 7 },
  { treatment: 'AVOID', count: 5 },
  { treatment: 'ESCALATE', count: 3 },
];

const TREATMENT_META: Record<string, { label: string; color: string; barColor: string; description: string; icon: string }> = {
  MITIGATE: {
    label: 'Mitigate',
    color: 'bg-blue-100 text-blue-700',
    barColor: 'bg-blue-500',
    description: 'Reduce the impact or likelihood of the risk through controls and action plans.',
    icon: 'M',
  },
  ACCEPT: {
    label: 'Accept',
    color: 'bg-green-100 text-green-700',
    barColor: 'bg-green-500',
    description: 'Tolerate the risk as it falls within acceptable risk appetite thresholds.',
    icon: 'A',
  },
  TRANSFER: {
    label: 'Transfer',
    color: 'bg-yellow-100 text-yellow-700',
    barColor: 'bg-yellow-500',
    description: 'Shift risk exposure to a third party via insurance, contracts, or outsourcing.',
    icon: 'T',
  },
  AVOID: {
    label: 'Avoid',
    color: 'bg-red-100 text-red-700',
    barColor: 'bg-red-500',
    description: 'Cease or redesign the activity that gives rise to the risk entirely.',
    icon: 'AV',
  },
  ESCALATE: {
    label: 'Escalate',
    color: 'bg-purple-100 text-purple-700',
    barColor: 'bg-purple-500',
    description: 'Escalate to senior management or the board for a risk beyond delegated authority.',
    icon: 'E',
  },
};

// ─── Inlined pure helper functions ───────────────────────────────────────────

/** From categories/client.tsx */
function formatCategory(cat: string): string {
  return cat
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

/** From controls/client.tsx */
function formatLabel(val: string): string {
  return val.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

/** From risks/client.tsx */
function getRiskColor(score: number): string {
  if (score >= 15) return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
  if (score >= 8) return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
  if (score >= 4) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
  return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
}

/** Inherent score calculation (from risks/client.tsx handleSubmit) */
function calcInherentScore(likelihood: string, consequence: string): number {
  return (LIKELIHOOD_SCORES[likelihood] ?? 3) * (CONSEQUENCE_SCORES[consequence] ?? 3);
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('CATEGORY_MOCK_DATA integrity', () => {
  it('has 10 entries', () => {
    expect(CATEGORY_MOCK_DATA).toHaveLength(10);
  });

  it('has no duplicate categories', () => {
    const cats = CATEGORY_MOCK_DATA.map((d) => d.category);
    expect(new Set(cats).size).toBe(cats.length);
  });

  it('all counts are positive integers', () => {
    for (const d of CATEGORY_MOCK_DATA) {
      expect(d.count).toBeGreaterThan(0);
      expect(Number.isInteger(d.count)).toBe(true);
    }
  });

  it('OPERATIONAL has the highest count', () => {
    const max = Math.max(...CATEGORY_MOCK_DATA.map((d) => d.count));
    const top = CATEGORY_MOCK_DATA.find((d) => d.count === max);
    expect(top?.category).toBe('OPERATIONAL');
  });

  it('REPUTATIONAL has the lowest count', () => {
    const min = Math.min(...CATEGORY_MOCK_DATA.map((d) => d.count));
    const bottom = CATEGORY_MOCK_DATA.find((d) => d.count === min);
    expect(bottom?.category).toBe('REPUTATIONAL');
  });

  it('total count sums to 74', () => {
    const total = CATEGORY_MOCK_DATA.reduce((s, d) => s + d.count, 0);
    expect(total).toBe(74);
  });
});

describe('CATEGORY_COLORS map', () => {
  const keys = Object.keys(CATEGORY_COLORS);

  it('has 10 entries', () => {
    expect(keys).toHaveLength(10);
  });

  for (const cat of CATEGORIES) {
    it(`${cat} has a non-empty color`, () => {
      expect(CATEGORY_COLORS[cat]).toBeTruthy();
    });

    it(`${cat} color contains "bg-"`, () => {
      expect(CATEGORY_COLORS[cat]).toContain('bg-');
    });
  }

  it('INFORMATION_SECURITY is red', () => {
    expect(CATEGORY_COLORS.INFORMATION_SECURITY).toContain('red');
  });

  it('ENVIRONMENTAL is teal', () => {
    expect(CATEGORY_COLORS.ENVIRONMENTAL).toContain('teal');
  });

  it('all values are strings', () => {
    for (const v of Object.values(CATEGORY_COLORS)) {
      expect(typeof v).toBe('string');
    }
  });
});

describe('CATEGORY_BADGE_COLORS map', () => {
  it('has same keys as CATEGORY_COLORS', () => {
    expect(Object.keys(CATEGORY_BADGE_COLORS).sort()).toEqual(Object.keys(CATEGORY_COLORS).sort());
  });

  for (const cat of CATEGORIES) {
    it(`${cat} badge color is defined`, () => {
      expect(CATEGORY_BADGE_COLORS[cat]).toBeTruthy();
    });

    it(`${cat} badge color contains "text-"`, () => {
      expect(CATEGORY_BADGE_COLORS[cat]).toContain('text-');
    });
  }

  it('STRATEGIC badge is purple', () => {
    expect(CATEGORY_BADGE_COLORS.STRATEGIC).toContain('purple');
  });

  it('QUALITY badge is indigo', () => {
    expect(CATEGORY_BADGE_COLORS.QUALITY).toContain('indigo');
  });
});

describe('formatCategory helper', () => {
  it('converts STRATEGIC to "Strategic"', () => {
    expect(formatCategory('STRATEGIC')).toBe('Strategic');
  });

  it('converts HEALTH_SAFETY to "Health Safety"', () => {
    expect(formatCategory('HEALTH_SAFETY')).toBe('Health Safety');
  });

  it('converts INFORMATION_SECURITY to "Information Security"', () => {
    expect(formatCategory('INFORMATION_SECURITY')).toBe('Information Security');
  });

  it('converts SUPPLY_CHAIN to "Supply Chain"', () => {
    expect(formatCategory('SUPPLY_CHAIN')).toBe('Supply Chain');
  });

  it('handles single word correctly', () => {
    expect(formatCategory('QUALITY')).toBe('Quality');
  });

  it('produces title-case output', () => {
    for (const cat of CATEGORIES) {
      const result = formatCategory(cat);
      const words = result.split(' ');
      for (const word of words) {
        expect(word[0]).toBe(word[0].toUpperCase());
      }
    }
  });

  it('never returns an empty string', () => {
    for (const cat of CATEGORIES) {
      expect(formatCategory(cat)).toBeTruthy();
    }
  });
});

describe('CONTROL_TYPES array', () => {
  it('has 4 entries', () => {
    expect(CONTROL_TYPES).toHaveLength(4);
  });

  it('contains PREVENTIVE', () => {
    expect(CONTROL_TYPES).toContain('PREVENTIVE');
  });

  it('contains DETECTIVE', () => {
    expect(CONTROL_TYPES).toContain('DETECTIVE');
  });

  it('contains REACTIVE', () => {
    expect(CONTROL_TYPES).toContain('REACTIVE');
  });

  it('contains DIRECTIVE', () => {
    expect(CONTROL_TYPES).toContain('DIRECTIVE');
  });

  it('has no duplicates', () => {
    expect(new Set(CONTROL_TYPES).size).toBe(CONTROL_TYPES.length);
  });
});

describe('EFFECTIVENESS_LEVELS array', () => {
  it('has 4 entries', () => {
    expect(EFFECTIVENESS_LEVELS).toHaveLength(4);
  });

  it('contains STRONG', () => {
    expect(EFFECTIVENESS_LEVELS).toContain('STRONG');
  });

  it('contains ADEQUATE', () => {
    expect(EFFECTIVENESS_LEVELS).toContain('ADEQUATE');
  });

  it('contains WEAK', () => {
    expect(EFFECTIVENESS_LEVELS).toContain('WEAK');
  });

  it('contains NONE_EFFECTIVE', () => {
    expect(EFFECTIVENESS_LEVELS).toContain('NONE_EFFECTIVE');
  });

  it('has no duplicates', () => {
    expect(new Set(EFFECTIVENESS_LEVELS).size).toBe(EFFECTIVENESS_LEVELS.length);
  });
});

describe('CONTROL_TYPE_COLORS map', () => {
  for (const ct of CONTROL_TYPES) {
    it(`${ct} has a defined color`, () => {
      expect(CONTROL_TYPE_COLORS[ct]).toBeTruthy();
    });

    it(`${ct} color contains "bg-"`, () => {
      expect(CONTROL_TYPE_COLORS[ct]).toContain('bg-');
    });

    it(`${ct} color contains "text-"`, () => {
      expect(CONTROL_TYPE_COLORS[ct]).toContain('text-');
    });
  }

  it('PREVENTIVE is blue', () => {
    expect(CONTROL_TYPE_COLORS.PREVENTIVE).toContain('blue');
  });

  it('REACTIVE is red', () => {
    expect(CONTROL_TYPE_COLORS.REACTIVE).toContain('red');
  });
});

describe('EFFECTIVENESS_COLORS map', () => {
  for (const el of EFFECTIVENESS_LEVELS) {
    it(`${el} has a defined color`, () => {
      expect(EFFECTIVENESS_COLORS[el]).toBeTruthy();
    });

    it(`${el} color is a non-empty string`, () => {
      expect(typeof EFFECTIVENESS_COLORS[el]).toBe('string');
    });
  }

  it('STRONG is green', () => {
    expect(EFFECTIVENESS_COLORS.STRONG).toContain('green');
  });

  it('NONE_EFFECTIVE is red', () => {
    expect(EFFECTIVENESS_COLORS.NONE_EFFECTIVE).toContain('red');
  });

  it('WEAK is yellow', () => {
    expect(EFFECTIVENESS_COLORS.WEAK).toContain('yellow');
  });
});

describe('formatLabel helper', () => {
  it('converts PREVENTIVE to "Preventive"', () => {
    expect(formatLabel('PREVENTIVE')).toBe('Preventive');
  });

  it('converts NONE_EFFECTIVE to "None Effective"', () => {
    expect(formatLabel('NONE_EFFECTIVE')).toBe('None Effective');
  });

  it('converts ALMOST_CERTAIN to "Almost Certain"', () => {
    expect(formatLabel('ALMOST_CERTAIN')).toBe('Almost Certain');
  });

  it('returns non-empty string for all control types', () => {
    for (const ct of CONTROL_TYPES) {
      expect(formatLabel(ct)).toBeTruthy();
    }
  });

  it('returns non-empty string for all effectiveness levels', () => {
    for (const el of EFFECTIVENESS_LEVELS) {
      expect(formatLabel(el)).toBeTruthy();
    }
  });
});

describe('CATEGORIES array (risks/client)', () => {
  it('has 10 entries', () => {
    expect(CATEGORIES).toHaveLength(10);
  });

  it('has no duplicates', () => {
    expect(new Set(CATEGORIES).size).toBe(CATEGORIES.length);
  });

  it('matches CATEGORY_MOCK_DATA categories exactly', () => {
    const mockCats = CATEGORY_MOCK_DATA.map((d) => d.category).sort();
    const enumCats = [...CATEGORIES].sort();
    expect(mockCats).toEqual(enumCats);
  });
});

describe('LIKELIHOODS array', () => {
  it('has 5 entries', () => {
    expect(LIKELIHOODS).toHaveLength(5);
  });

  it('starts with RARE', () => {
    expect(LIKELIHOODS[0]).toBe('RARE');
  });

  it('ends with ALMOST_CERTAIN', () => {
    expect(LIKELIHOODS[LIKELIHOODS.length - 1]).toBe('ALMOST_CERTAIN');
  });

  it('has no duplicates', () => {
    expect(new Set(LIKELIHOODS).size).toBe(LIKELIHOODS.length);
  });
});

describe('CONSEQUENCES array', () => {
  it('has 5 entries', () => {
    expect(CONSEQUENCES).toHaveLength(5);
  });

  it('starts with INSIGNIFICANT', () => {
    expect(CONSEQUENCES[0]).toBe('INSIGNIFICANT');
  });

  it('ends with CATASTROPHIC', () => {
    expect(CONSEQUENCES[CONSEQUENCES.length - 1]).toBe('CATASTROPHIC');
  });

  it('has no duplicates', () => {
    expect(new Set(CONSEQUENCES).size).toBe(CONSEQUENCES.length);
  });
});

describe('TREATMENTS array', () => {
  it('has 5 entries', () => {
    expect(TREATMENTS).toHaveLength(5);
  });

  it('contains MITIGATE', () => {
    expect(TREATMENTS).toContain('MITIGATE');
  });

  it('contains ACCEPT', () => {
    expect(TREATMENTS).toContain('ACCEPT');
  });

  it('has no duplicates', () => {
    expect(new Set(TREATMENTS).size).toBe(TREATMENTS.length);
  });

  it('matches TREATMENT_MOCK_DATA keys', () => {
    const mockKeys = TREATMENT_MOCK_DATA.map((d) => d.treatment).sort();
    const enumKeys = [...TREATMENTS].sort();
    expect(mockKeys).toEqual(enumKeys);
  });
});

describe('RISK_STATUSES array', () => {
  it('has 5 entries', () => {
    expect(RISK_STATUSES).toHaveLength(5);
  });

  it('starts with IDENTIFIED', () => {
    expect(RISK_STATUSES[0]).toBe('IDENTIFIED');
  });

  it('ends with CLOSED', () => {
    expect(RISK_STATUSES[RISK_STATUSES.length - 1]).toBe('CLOSED');
  });

  it('has no duplicates', () => {
    expect(new Set(RISK_STATUSES).size).toBe(RISK_STATUSES.length);
  });
});

describe('LIKELIHOOD_SCORES', () => {
  it('RARE scores 1', () => {
    expect(LIKELIHOOD_SCORES.RARE).toBe(1);
  });

  it('ALMOST_CERTAIN scores 5', () => {
    expect(LIKELIHOOD_SCORES.ALMOST_CERTAIN).toBe(5);
  });

  it('scores are strictly increasing', () => {
    const ordered = [...LIKELIHOODS];
    for (let i = 1; i < ordered.length; i++) {
      expect(LIKELIHOOD_SCORES[ordered[i]]).toBeGreaterThan(LIKELIHOOD_SCORES[ordered[i - 1]]);
    }
  });

  it('all scores are integers between 1 and 5', () => {
    for (const l of LIKELIHOODS) {
      expect(LIKELIHOOD_SCORES[l]).toBeGreaterThanOrEqual(1);
      expect(LIKELIHOOD_SCORES[l]).toBeLessThanOrEqual(5);
      expect(Number.isInteger(LIKELIHOOD_SCORES[l])).toBe(true);
    }
  });
});

describe('CONSEQUENCE_SCORES', () => {
  it('INSIGNIFICANT scores 1', () => {
    expect(CONSEQUENCE_SCORES.INSIGNIFICANT).toBe(1);
  });

  it('CATASTROPHIC scores 5', () => {
    expect(CONSEQUENCE_SCORES.CATASTROPHIC).toBe(5);
  });

  it('scores are strictly increasing', () => {
    const ordered = [...CONSEQUENCES];
    for (let i = 1; i < ordered.length; i++) {
      expect(CONSEQUENCE_SCORES[ordered[i]]).toBeGreaterThan(CONSEQUENCE_SCORES[ordered[i - 1]]);
    }
  });

  it('all scores are integers between 1 and 5', () => {
    for (const c of CONSEQUENCES) {
      expect(CONSEQUENCE_SCORES[c]).toBeGreaterThanOrEqual(1);
      expect(CONSEQUENCE_SCORES[c]).toBeLessThanOrEqual(5);
      expect(Number.isInteger(CONSEQUENCE_SCORES[c])).toBe(true);
    }
  });
});

describe('calcInherentScore', () => {
  it('RARE × INSIGNIFICANT = 1', () => {
    expect(calcInherentScore('RARE', 'INSIGNIFICANT')).toBe(1);
  });

  it('ALMOST_CERTAIN × CATASTROPHIC = 25', () => {
    expect(calcInherentScore('ALMOST_CERTAIN', 'CATASTROPHIC')).toBe(25);
  });

  it('POSSIBLE × MODERATE = 9', () => {
    expect(calcInherentScore('POSSIBLE', 'MODERATE')).toBe(9);
  });

  it('LIKELY × MAJOR = 16', () => {
    expect(calcInherentScore('LIKELY', 'MAJOR')).toBe(16);
  });

  it('score is always in range 1–25 for valid inputs', () => {
    for (const l of LIKELIHOODS) {
      for (const c of CONSEQUENCES) {
        const score = calcInherentScore(l, c);
        expect(score).toBeGreaterThanOrEqual(1);
        expect(score).toBeLessThanOrEqual(25);
      }
    }
  });

  it('unknown inputs fall back to 3×3=9', () => {
    expect(calcInherentScore('UNKNOWN', 'UNKNOWN')).toBe(9);
  });
});

describe('getRiskColor helper', () => {
  it('score >= 15 is red', () => {
    expect(getRiskColor(15)).toContain('red');
    expect(getRiskColor(25)).toContain('red');
  });

  it('score 8–14 is orange', () => {
    expect(getRiskColor(8)).toContain('orange');
    expect(getRiskColor(14)).toContain('orange');
  });

  it('score 4–7 is yellow', () => {
    expect(getRiskColor(4)).toContain('yellow');
    expect(getRiskColor(7)).toContain('yellow');
  });

  it('score < 4 is green', () => {
    expect(getRiskColor(1)).toContain('green');
    expect(getRiskColor(3)).toContain('green');
  });

  it('returns a non-empty string for all 1–25 scores', () => {
    for (let s = 1; s <= 25; s++) {
      expect(getRiskColor(s)).toBeTruthy();
    }
  });

  it('score 0 maps to green (below threshold)', () => {
    expect(getRiskColor(0)).toContain('green');
  });
});

describe('TREATMENT_MOCK_DATA integrity', () => {
  it('has 5 entries', () => {
    expect(TREATMENT_MOCK_DATA).toHaveLength(5);
  });

  it('has no duplicate treatments', () => {
    const keys = TREATMENT_MOCK_DATA.map((d) => d.treatment);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('all counts are positive integers', () => {
    for (const d of TREATMENT_MOCK_DATA) {
      expect(d.count).toBeGreaterThan(0);
      expect(Number.isInteger(d.count)).toBe(true);
    }
  });

  it('MITIGATE has the highest count', () => {
    const max = Math.max(...TREATMENT_MOCK_DATA.map((d) => d.count));
    const top = TREATMENT_MOCK_DATA.find((d) => d.count === max);
    expect(top?.treatment).toBe('MITIGATE');
  });

  it('ESCALATE has the lowest count', () => {
    const min = Math.min(...TREATMENT_MOCK_DATA.map((d) => d.count));
    const bottom = TREATMENT_MOCK_DATA.find((d) => d.count === min);
    expect(bottom?.treatment).toBe('ESCALATE');
  });
});

describe('TREATMENT_META integrity', () => {
  const treatmentKeys = Object.keys(TREATMENT_META) as Array<keyof typeof TREATMENT_META>;

  it('has 5 entries', () => {
    expect(treatmentKeys).toHaveLength(5);
  });

  for (const key of ['MITIGATE', 'ACCEPT', 'TRANSFER', 'AVOID', 'ESCALATE'] as const) {
    it(`${key} has a label`, () => {
      expect(TREATMENT_META[key].label).toBeTruthy();
    });

    it(`${key} has a color containing "bg-"`, () => {
      expect(TREATMENT_META[key].color).toContain('bg-');
    });

    it(`${key} has a barColor containing "bg-"`, () => {
      expect(TREATMENT_META[key].barColor).toContain('bg-');
    });

    it(`${key} has a non-empty description`, () => {
      expect(TREATMENT_META[key].description.length).toBeGreaterThan(10);
    });

    it(`${key} has a non-empty icon`, () => {
      expect(TREATMENT_META[key].icon).toBeTruthy();
    });
  }

  it('MITIGATE description references controls', () => {
    expect(TREATMENT_META.MITIGATE.description.toLowerCase()).toContain('control');
  });

  it('ESCALATE description references management', () => {
    expect(TREATMENT_META.ESCALATE.description.toLowerCase()).toContain('management');
  });
});

// ─── Parametric expansions ─────────────────────────────────────────────────

describe('CATEGORY_MOCK_DATA — per-category count parametric', () => {
  const cases: [string, number][] = [
    ['STRATEGIC',           8],
    ['OPERATIONAL',        15],
    ['FINANCIAL',           6],
    ['COMPLIANCE',          4],
    ['REPUTATIONAL',        3],
    ['ENVIRONMENTAL',       5],
    ['HEALTH_SAFETY',       7],
    ['INFORMATION_SECURITY',9],
    ['QUALITY',            11],
    ['SUPPLY_CHAIN',        6],
  ];
  for (const [category, count] of cases) {
    it(`${category}: count = ${count}`, () => {
      const entry = CATEGORY_MOCK_DATA.find((d) => d.category === category)!;
      expect(entry.count).toBe(count);
    });
  }
});

describe('LIKELIHOOD_SCORES — per-likelihood value parametric', () => {
  const cases: [string, number][] = [
    ['RARE',          1],
    ['UNLIKELY',      2],
    ['POSSIBLE',      3],
    ['LIKELY',        4],
    ['ALMOST_CERTAIN',5],
  ];
  for (const [likelihood, score] of cases) {
    it(`${likelihood} = ${score}`, () => {
      expect(LIKELIHOOD_SCORES[likelihood]).toBe(score);
    });
  }
});

describe('CONSEQUENCE_SCORES — per-consequence value parametric', () => {
  const cases: [string, number][] = [
    ['INSIGNIFICANT', 1],
    ['MINOR',         2],
    ['MODERATE',      3],
    ['MAJOR',         4],
    ['CATASTROPHIC',  5],
  ];
  for (const [consequence, score] of cases) {
    it(`${consequence} = ${score}`, () => {
      expect(CONSEQUENCE_SCORES[consequence]).toBe(score);
    });
  }
});

describe('CATEGORY_COLORS — per-category color keyword parametric', () => {
  const cases: [string, string][] = [
    ['STRATEGIC',           'purple'],
    ['OPERATIONAL',         'blue'],
    ['FINANCIAL',           'green'],
    ['COMPLIANCE',          'yellow'],
    ['REPUTATIONAL',        'pink'],
    ['ENVIRONMENTAL',       'teal'],
    ['HEALTH_SAFETY',       'orange'],
    ['INFORMATION_SECURITY','red'],
    ['QUALITY',             'indigo'],
    ['SUPPLY_CHAIN',        'cyan'],
  ];
  for (const [category, color] of cases) {
    it(`${category} color contains "${color}"`, () => {
      expect(CATEGORY_COLORS[category]).toContain(color);
    });
  }
});

describe('formatCategory — remaining categories parametric', () => {
  const cases: [string, string][] = [
    ['OPERATIONAL',  'Operational'],
    ['FINANCIAL',    'Financial'],
    ['COMPLIANCE',   'Compliance'],
    ['REPUTATIONAL', 'Reputational'],
    ['ENVIRONMENTAL','Environmental'],
  ];
  for (const [input, expected] of cases) {
    it(`formatCategory("${input}") = "${expected}"`, () => {
      expect(formatCategory(input)).toBe(expected);
    });
  }
});

describe('calcInherentScore — additional exact values parametric', () => {
  const cases: [string, string, number][] = [
    ['UNLIKELY',      'MINOR',        4],  // 2 × 2
    ['POSSIBLE',      'MAJOR',       12],  // 3 × 4
    ['LIKELY',        'MODERATE',    12],  // 4 × 3
    ['ALMOST_CERTAIN','MAJOR',       20],  // 5 × 4
    ['RARE',          'CATASTROPHIC', 5],  // 1 × 5
  ];
  for (const [likelihood, consequence, expected] of cases) {
    it(`${likelihood} × ${consequence} = ${expected}`, () => {
      expect(calcInherentScore(likelihood, consequence)).toBe(expected);
    });
  }
});
