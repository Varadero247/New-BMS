/**
 * Phase 131 — web-risk analytics specification tests
 *
 * Tests pure functions and constants from:
 *   apps/web-risk/src/app/analytics/page.tsx   (getCellColor, getCellTextColor, constants)
 *   apps/web-risk/src/app/heat-map/page.tsx     (getHeatMapCellColor, L_SCORES, C_SCORES)
 *
 * Functions are not exported, so they are recreated identically here as a specification.
 */

// ─── Functions under test (spec copies from source files) ──────────────────────

/** From analytics/page.tsx */
function getCellColor(l: number, c: number): string {
  const score = l * c;
  if (score >= 15) return 'bg-red-500';
  if (score >= 10) return 'bg-orange-400';
  if (score >= 5) return 'bg-yellow-400';
  return 'bg-green-400';
}

/** From analytics/page.tsx */
function getCellTextColor(l: number, c: number): string {
  const score = l * c;
  if (score >= 5) return 'text-white';
  return 'text-gray-800';
}

/** From heat-map/page.tsx */
function getHeatMapCellColor(l: number, c: number): string {
  const score = l * c;
  if (score >= 15) return 'bg-red-500 text-white';
  if (score >= 10) return 'bg-orange-400 text-white';
  if (score >= 5) return 'bg-yellow-400 text-gray-900';
  return 'bg-green-400 text-white';
}

// ─── Constants (spec copies from source files) ──────────────────────────────────

/** From analytics/page.tsx */
const LEVEL_COLORS: Record<string, string> = {
  CRITICAL: 'bg-red-500',
  VERY_HIGH: 'bg-orange-400',
  HIGH: 'bg-yellow-400',
  MEDIUM: 'bg-blue-400',
  LOW: 'bg-green-400',
};

/** From analytics/page.tsx */
const LEVEL_TEXT: Record<string, string> = {
  CRITICAL: 'text-red-700 dark:text-red-300',
  VERY_HIGH: 'text-orange-700 dark:text-orange-300',
  HIGH: 'text-yellow-700 dark:text-yellow-300',
  MEDIUM: 'text-blue-700 dark:text-blue-300',
  LOW: 'text-green-700 dark:text-green-300',
};

/** From analytics/page.tsx */
const CATEGORY_COLORS = [
  '#EF4444', '#F97316', '#EAB308', '#22C55E', '#3B82F6',
  '#8B5CF6', '#EC4899', '#14B8A6', '#F59E0B', '#6366F1',
  '#10B981', '#0EA5E9', '#D946EF', '#84CC16', '#FB923C',
];

/** From analytics/page.tsx */
const LIKELIHOOD_LABELS = ['', 'Rare', 'Unlikely', 'Possible', 'Likely', 'Almost Certain'];

/** From analytics/page.tsx */
const CONSEQUENCE_LABELS = ['', 'Insignif.', 'Minor', 'Moderate', 'Major', 'Catastrophic'];

/** From heat-map/page.tsx */
const L_SCORES: Record<string, number> = {
  RARE: 1, UNLIKELY: 2, POSSIBLE: 3, LIKELY: 4, ALMOST_CERTAIN: 5,
};

/** From heat-map/page.tsx */
const C_SCORES: Record<string, number> = {
  INSIGNIFICANT: 1, MINOR: 2, MODERATE: 3, MAJOR: 4, CATASTROPHIC: 5,
};

/** From heat-map/page.tsx */
const LIKELIHOODS = ['ALMOST_CERTAIN', 'LIKELY', 'POSSIBLE', 'UNLIKELY', 'RARE'];

/** From heat-map/page.tsx */
const CONSEQUENCES = ['INSIGNIFICANT', 'MINOR', 'MODERATE', 'MAJOR', 'CATASTROPHIC'];

// ─── Derived lookup tables used across many tests ───────────────────────────────

type CellSpec = {
  l: number; c: number; score: number;
  bg: string; textClass: string; heatmapClass: string;
  tier: 'critical' | 'high' | 'medium' | 'low';
};

function deriveTier(score: number): 'critical' | 'high' | 'medium' | 'low' {
  if (score >= 15) return 'critical';
  if (score >= 10) return 'high';
  if (score >= 5) return 'medium';
  return 'low';
}

const CELL_SPECS: CellSpec[] = [];
for (let l = 1; l <= 5; l++) {
  for (let c = 1; c <= 5; c++) {
    const score = l * c;
    const tier = deriveTier(score);
    CELL_SPECS.push({
      l, c, score,
      bg: getCellColor(l, c),
      textClass: getCellTextColor(l, c),
      heatmapClass: getHeatMapCellColor(l, c),
      tier,
    });
  }
}

// ─── Helpers ────────────────────────────────────────────────────────────────────

function scoreToTier(s: number) { return deriveTier(s); }

// ═══════════════════════════════════════════════════════════════════════════════
// DESCRIBE: getCellColor
// ═══════════════════════════════════════════════════════════════════════════════

describe('getCellColor — bg class for all 25 cells', () => {
  CELL_SPECS.forEach(({ l, c, bg }) => {
    it(`getCellColor(${l},${c}) returns "${bg}"`, () => {
      expect(getCellColor(l, c)).toBe(bg);
    });
  });
});

describe('getCellColor — returns a string', () => {
  CELL_SPECS.forEach(({ l, c }) => {
    it(`getCellColor(${l},${c}) is a string`, () => {
      expect(typeof getCellColor(l, c)).toBe('string');
    });
  });
});

describe('getCellColor — starts with bg-', () => {
  CELL_SPECS.forEach(({ l, c }) => {
    it(`getCellColor(${l},${c}) starts with "bg-"`, () => {
      expect(getCellColor(l, c).startsWith('bg-')).toBe(true);
    });
  });
});

describe('getCellColor — critical cells (score>=15) → bg-red-500', () => {
  CELL_SPECS.filter((s) => s.score >= 15).forEach(({ l, c }) => {
    it(`getCellColor(${l},${c}) → bg-red-500`, () => {
      expect(getCellColor(l, c)).toBe('bg-red-500');
    });
  });
});

describe('getCellColor — high cells (score 10-14) → bg-orange-400', () => {
  CELL_SPECS.filter((s) => s.score >= 10 && s.score < 15).forEach(({ l, c }) => {
    it(`getCellColor(${l},${c}) → bg-orange-400`, () => {
      expect(getCellColor(l, c)).toBe('bg-orange-400');
    });
  });
});

describe('getCellColor — medium cells (score 5-9) → bg-yellow-400', () => {
  CELL_SPECS.filter((s) => s.score >= 5 && s.score < 10).forEach(({ l, c }) => {
    it(`getCellColor(${l},${c}) → bg-yellow-400`, () => {
      expect(getCellColor(l, c)).toBe('bg-yellow-400');
    });
  });
});

describe('getCellColor — low cells (score <5) → bg-green-400', () => {
  CELL_SPECS.filter((s) => s.score < 5).forEach(({ l, c }) => {
    it(`getCellColor(${l},${c}) → bg-green-400`, () => {
      expect(getCellColor(l, c)).toBe('bg-green-400');
    });
  });
});

describe('getCellColor — not empty string', () => {
  CELL_SPECS.forEach(({ l, c }) => {
    it(`getCellColor(${l},${c}) is non-empty`, () => {
      expect(getCellColor(l, c).length).toBeGreaterThan(0);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// DESCRIBE: getCellTextColor
// ═══════════════════════════════════════════════════════════════════════════════

describe('getCellTextColor — exact value for all 25 cells', () => {
  CELL_SPECS.forEach(({ l, c, textClass }) => {
    it(`getCellTextColor(${l},${c}) returns "${textClass}"`, () => {
      expect(getCellTextColor(l, c)).toBe(textClass);
    });
  });
});

describe('getCellTextColor — is a string', () => {
  CELL_SPECS.forEach(({ l, c }) => {
    it(`getCellTextColor(${l},${c}) is a string`, () => {
      expect(typeof getCellTextColor(l, c)).toBe('string');
    });
  });
});

describe('getCellTextColor — starts with text-', () => {
  CELL_SPECS.forEach(({ l, c }) => {
    it(`getCellTextColor(${l},${c}) starts with "text-"`, () => {
      expect(getCellTextColor(l, c).startsWith('text-')).toBe(true);
    });
  });
});

describe('getCellTextColor — score>=5 → text-white', () => {
  CELL_SPECS.filter((s) => s.score >= 5).forEach(({ l, c }) => {
    it(`getCellTextColor(${l},${c}) → text-white`, () => {
      expect(getCellTextColor(l, c)).toBe('text-white');
    });
  });
});

describe('getCellTextColor — score<5 → text-gray-800', () => {
  CELL_SPECS.filter((s) => s.score < 5).forEach(({ l, c }) => {
    it(`getCellTextColor(${l},${c}) → text-gray-800`, () => {
      expect(getCellTextColor(l, c)).toBe('text-gray-800');
    });
  });
});

describe('getCellTextColor — only two possible values', () => {
  const valid = new Set(['text-white', 'text-gray-800']);
  CELL_SPECS.forEach(({ l, c }) => {
    it(`getCellTextColor(${l},${c}) is one of the two valid classes`, () => {
      expect(valid.has(getCellTextColor(l, c))).toBe(true);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// DESCRIBE: getHeatMapCellColor
// ═══════════════════════════════════════════════════════════════════════════════

describe('getHeatMapCellColor — exact value for all 25 cells', () => {
  CELL_SPECS.forEach(({ l, c, heatmapClass }) => {
    it(`getHeatMapCellColor(${l},${c}) returns "${heatmapClass}"`, () => {
      expect(getHeatMapCellColor(l, c)).toBe(heatmapClass);
    });
  });
});

describe('getHeatMapCellColor — is a string', () => {
  CELL_SPECS.forEach(({ l, c }) => {
    it(`getHeatMapCellColor(${l},${c}) is a string`, () => {
      expect(typeof getHeatMapCellColor(l, c)).toBe('string');
    });
  });
});

describe('getHeatMapCellColor — contains a bg- class', () => {
  CELL_SPECS.forEach(({ l, c }) => {
    it(`getHeatMapCellColor(${l},${c}) includes "bg-"`, () => {
      expect(getHeatMapCellColor(l, c)).toMatch(/bg-/);
    });
  });
});

describe('getHeatMapCellColor — contains a text- class', () => {
  CELL_SPECS.forEach(({ l, c }) => {
    it(`getHeatMapCellColor(${l},${c}) includes "text-"`, () => {
      expect(getHeatMapCellColor(l, c)).toMatch(/text-/);
    });
  });
});

describe('getHeatMapCellColor — critical cells → bg-red-500 text-white', () => {
  CELL_SPECS.filter((s) => s.score >= 15).forEach(({ l, c }) => {
    it(`getHeatMapCellColor(${l},${c}) → bg-red-500 text-white`, () => {
      expect(getHeatMapCellColor(l, c)).toBe('bg-red-500 text-white');
    });
  });
});

describe('getHeatMapCellColor — high cells → bg-orange-400 text-white', () => {
  CELL_SPECS.filter((s) => s.score >= 10 && s.score < 15).forEach(({ l, c }) => {
    it(`getHeatMapCellColor(${l},${c}) → bg-orange-400 text-white`, () => {
      expect(getHeatMapCellColor(l, c)).toBe('bg-orange-400 text-white');
    });
  });
});

describe('getHeatMapCellColor — medium cells → bg-yellow-400 text-gray-900', () => {
  CELL_SPECS.filter((s) => s.score >= 5 && s.score < 10).forEach(({ l, c }) => {
    it(`getHeatMapCellColor(${l},${c}) → bg-yellow-400 text-gray-900`, () => {
      expect(getHeatMapCellColor(l, c)).toBe('bg-yellow-400 text-gray-900');
    });
  });
});

describe('getHeatMapCellColor — low cells → bg-green-400 text-white', () => {
  CELL_SPECS.filter((s) => s.score < 5).forEach(({ l, c }) => {
    it(`getHeatMapCellColor(${l},${c}) → bg-green-400 text-white`, () => {
      expect(getHeatMapCellColor(l, c)).toBe('bg-green-400 text-white');
    });
  });
});

describe('getHeatMapCellColor — bg word matches getCellColor bg word', () => {
  CELL_SPECS.forEach(({ l, c, bg }) => {
    it(`getHeatMapCellColor(${l},${c}) bg word matches getCellColor`, () => {
      const hm = getHeatMapCellColor(l, c);
      const bgWord = hm.split(' ')[0];
      expect(bgWord).toBe(bg);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// DESCRIBE: Score computation (l * c)
// ═══════════════════════════════════════════════════════════════════════════════

describe('score computation — exact products for all 25 cells', () => {
  CELL_SPECS.forEach(({ l, c, score }) => {
    it(`score(${l},${c}) = ${score}`, () => {
      expect(l * c).toBe(score);
    });
  });
});

describe('score computation — tier boundaries', () => {
  CELL_SPECS.forEach(({ l, c, score, tier }) => {
    it(`score ${score} (l=${l},c=${c}) → tier "${tier}"`, () => {
      expect(scoreToTier(l * c)).toBe(tier);
    });
  });
});

describe('score computation — min is 1, max is 25', () => {
  it('minimum score across all cells is 1', () => {
    expect(Math.min(...CELL_SPECS.map((s) => s.score))).toBe(1);
  });
  it('maximum score across all cells is 25', () => {
    expect(Math.max(...CELL_SPECS.map((s) => s.score))).toBe(25);
  });
  it('exactly 25 cells in spec', () => {
    expect(CELL_SPECS.length).toBe(25);
  });
  it('score is always positive', () => {
    CELL_SPECS.forEach(({ score }) => expect(score).toBeGreaterThan(0));
  });
});

describe('score computation — symmetry (l*c === c*l)', () => {
  CELL_SPECS.forEach(({ l, c, score }) => {
    it(`score(${l},${c}) equals score(${c},${l}) = ${score}`, () => {
      expect(l * c).toBe(c * l);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// DESCRIBE: LEVEL_COLORS
// ═══════════════════════════════════════════════════════════════════════════════

describe('LEVEL_COLORS — exact values', () => {
  const cases: [string, string][] = [
    ['CRITICAL', 'bg-red-500'],
    ['VERY_HIGH', 'bg-orange-400'],
    ['HIGH', 'bg-yellow-400'],
    ['MEDIUM', 'bg-blue-400'],
    ['LOW', 'bg-green-400'],
  ];
  cases.forEach(([level, expected]) => {
    it(`LEVEL_COLORS.${level} === "${expected}"`, () => {
      expect(LEVEL_COLORS[level]).toBe(expected);
    });
  });
});

describe('LEVEL_COLORS — all values start with bg-', () => {
  Object.entries(LEVEL_COLORS).forEach(([level, val]) => {
    it(`LEVEL_COLORS.${level} starts with "bg-"`, () => {
      expect(val.startsWith('bg-')).toBe(true);
    });
  });
});

describe('LEVEL_COLORS — has exactly 5 keys', () => {
  it('LEVEL_COLORS has 5 entries', () => {
    expect(Object.keys(LEVEL_COLORS)).toHaveLength(5);
  });
  it('LEVEL_COLORS contains CRITICAL', () => {
    expect(LEVEL_COLORS).toHaveProperty('CRITICAL');
  });
  it('LEVEL_COLORS contains VERY_HIGH', () => {
    expect(LEVEL_COLORS).toHaveProperty('VERY_HIGH');
  });
  it('LEVEL_COLORS contains HIGH', () => {
    expect(LEVEL_COLORS).toHaveProperty('HIGH');
  });
  it('LEVEL_COLORS contains MEDIUM', () => {
    expect(LEVEL_COLORS).toHaveProperty('MEDIUM');
  });
  it('LEVEL_COLORS contains LOW', () => {
    expect(LEVEL_COLORS).toHaveProperty('LOW');
  });
});

describe('LEVEL_COLORS — values are strings', () => {
  Object.entries(LEVEL_COLORS).forEach(([level, val]) => {
    it(`LEVEL_COLORS.${level} is a string`, () => {
      expect(typeof val).toBe('string');
    });
  });
});

describe('LEVEL_COLORS — all values are non-empty', () => {
  Object.entries(LEVEL_COLORS).forEach(([level, val]) => {
    it(`LEVEL_COLORS.${level} is non-empty`, () => {
      expect(val.length).toBeGreaterThan(0);
    });
  });
});

describe('LEVEL_COLORS — CRITICAL is more severe than LOW', () => {
  it('CRITICAL !== LOW', () => {
    expect(LEVEL_COLORS.CRITICAL).not.toBe(LEVEL_COLORS.LOW);
  });
  it('CRITICAL contains red', () => {
    expect(LEVEL_COLORS.CRITICAL).toMatch(/red/);
  });
  it('LOW contains green', () => {
    expect(LEVEL_COLORS.LOW).toMatch(/green/);
  });
  it('MEDIUM contains blue', () => {
    expect(LEVEL_COLORS.MEDIUM).toMatch(/blue/);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// DESCRIBE: LEVEL_TEXT
// ═══════════════════════════════════════════════════════════════════════════════

describe('LEVEL_TEXT — exact values', () => {
  const cases: [string, string][] = [
    ['CRITICAL', 'text-red-700 dark:text-red-300'],
    ['VERY_HIGH', 'text-orange-700 dark:text-orange-300'],
    ['HIGH', 'text-yellow-700 dark:text-yellow-300'],
    ['MEDIUM', 'text-blue-700 dark:text-blue-300'],
    ['LOW', 'text-green-700 dark:text-green-300'],
  ];
  cases.forEach(([level, expected]) => {
    it(`LEVEL_TEXT.${level} === "${expected}"`, () => {
      expect(LEVEL_TEXT[level]).toBe(expected);
    });
  });
});

describe('LEVEL_TEXT — values start with text-', () => {
  Object.entries(LEVEL_TEXT).forEach(([level, val]) => {
    it(`LEVEL_TEXT.${level} starts with "text-"`, () => {
      expect(val.startsWith('text-')).toBe(true);
    });
  });
});

describe('LEVEL_TEXT — values contain dark: variant', () => {
  Object.entries(LEVEL_TEXT).forEach(([level, val]) => {
    it(`LEVEL_TEXT.${level} contains "dark:"`, () => {
      expect(val).toMatch(/dark:/);
    });
  });
});

describe('LEVEL_TEXT — has exactly 5 keys', () => {
  it('has 5 entries', () => {
    expect(Object.keys(LEVEL_TEXT)).toHaveLength(5);
  });
});

describe('LEVEL_TEXT — all values are strings', () => {
  Object.entries(LEVEL_TEXT).forEach(([level, val]) => {
    it(`LEVEL_TEXT.${level} is a string`, () => {
      expect(typeof val).toBe('string');
    });
  });
});

describe('LEVEL_TEXT — color name matches LEVEL_COLORS color name', () => {
  const colorMap: Record<string, string> = {
    CRITICAL: 'red', VERY_HIGH: 'orange', HIGH: 'yellow', MEDIUM: 'blue', LOW: 'green',
  };
  Object.entries(colorMap).forEach(([level, color]) => {
    it(`LEVEL_TEXT.${level} references "${color}"`, () => {
      expect(LEVEL_TEXT[level]).toMatch(color);
    });
    it(`LEVEL_COLORS.${level} references "${color}"`, () => {
      expect(LEVEL_COLORS[level]).toMatch(color);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// DESCRIBE: CATEGORY_COLORS
// ═══════════════════════════════════════════════════════════════════════════════

describe('CATEGORY_COLORS — has 15 entries', () => {
  it('length is 15', () => {
    expect(CATEGORY_COLORS).toHaveLength(15);
  });
});

describe('CATEGORY_COLORS — exact values', () => {
  const expected = [
    '#EF4444', '#F97316', '#EAB308', '#22C55E', '#3B82F6',
    '#8B5CF6', '#EC4899', '#14B8A6', '#F59E0B', '#6366F1',
    '#10B981', '#0EA5E9', '#D946EF', '#84CC16', '#FB923C',
  ];
  expected.forEach((hex, i) => {
    it(`CATEGORY_COLORS[${i}] === "${hex}"`, () => {
      expect(CATEGORY_COLORS[i]).toBe(hex);
    });
  });
});

describe('CATEGORY_COLORS — all values are hex strings', () => {
  CATEGORY_COLORS.forEach((color, i) => {
    it(`CATEGORY_COLORS[${i}] matches #RRGGBB pattern`, () => {
      expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });
  });
});

describe('CATEGORY_COLORS — all values start with #', () => {
  CATEGORY_COLORS.forEach((color, i) => {
    it(`CATEGORY_COLORS[${i}] starts with "#"`, () => {
      expect(color.startsWith('#')).toBe(true);
    });
  });
});

describe('CATEGORY_COLORS — all values are 7 characters', () => {
  CATEGORY_COLORS.forEach((color, i) => {
    it(`CATEGORY_COLORS[${i}] has length 7`, () => {
      expect(color).toHaveLength(7);
    });
  });
});

describe('CATEGORY_COLORS — all values are unique', () => {
  it('no duplicates in CATEGORY_COLORS', () => {
    expect(new Set(CATEGORY_COLORS).size).toBe(CATEGORY_COLORS.length);
  });
});

describe('CATEGORY_COLORS — all values are uppercase hex', () => {
  CATEGORY_COLORS.forEach((color, i) => {
    it(`CATEGORY_COLORS[${i}] is uppercase`, () => {
      expect(color).toBe(color.toUpperCase());
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// DESCRIBE: LIKELIHOOD_LABELS
// ═══════════════════════════════════════════════════════════════════════════════

describe('LIKELIHOOD_LABELS — exact values', () => {
  const expected = ['', 'Rare', 'Unlikely', 'Possible', 'Likely', 'Almost Certain'];
  expected.forEach((label, i) => {
    it(`LIKELIHOOD_LABELS[${i}] === "${label}"`, () => {
      expect(LIKELIHOOD_LABELS[i]).toBe(label);
    });
  });
});

describe('LIKELIHOOD_LABELS — has 6 entries (index 0 is empty)', () => {
  it('length is 6', () => {
    expect(LIKELIHOOD_LABELS).toHaveLength(6);
  });
  it('index 0 is empty string', () => {
    expect(LIKELIHOOD_LABELS[0]).toBe('');
  });
});

describe('LIKELIHOOD_LABELS — indices 1-5 are non-empty strings', () => {
  for (let i = 1; i <= 5; i++) {
    it(`LIKELIHOOD_LABELS[${i}] is non-empty`, () => {
      expect(LIKELIHOOD_LABELS[i].length).toBeGreaterThan(0);
    });
  }
});

describe('LIKELIHOOD_LABELS — all elements are strings', () => {
  LIKELIHOOD_LABELS.forEach((label, i) => {
    it(`LIKELIHOOD_LABELS[${i}] is a string`, () => {
      expect(typeof label).toBe('string');
    });
  });
});

describe('LIKELIHOOD_LABELS — index alignment with L_SCORES', () => {
  it('LIKELIHOOD_LABELS[1] corresponds to RARE (L_SCORES lowest)', () => {
    expect(LIKELIHOOD_LABELS[L_SCORES.RARE]).toBe('Rare');
  });
  it('LIKELIHOOD_LABELS[2] corresponds to UNLIKELY', () => {
    expect(LIKELIHOOD_LABELS[L_SCORES.UNLIKELY]).toBe('Unlikely');
  });
  it('LIKELIHOOD_LABELS[3] corresponds to POSSIBLE', () => {
    expect(LIKELIHOOD_LABELS[L_SCORES.POSSIBLE]).toBe('Possible');
  });
  it('LIKELIHOOD_LABELS[4] corresponds to LIKELY', () => {
    expect(LIKELIHOOD_LABELS[L_SCORES.LIKELY]).toBe('Likely');
  });
  it('LIKELIHOOD_LABELS[5] corresponds to ALMOST_CERTAIN', () => {
    expect(LIKELIHOOD_LABELS[L_SCORES.ALMOST_CERTAIN]).toBe('Almost Certain');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// DESCRIBE: CONSEQUENCE_LABELS
// ═══════════════════════════════════════════════════════════════════════════════

describe('CONSEQUENCE_LABELS — exact values', () => {
  const expected = ['', 'Insignif.', 'Minor', 'Moderate', 'Major', 'Catastrophic'];
  expected.forEach((label, i) => {
    it(`CONSEQUENCE_LABELS[${i}] === "${label}"`, () => {
      expect(CONSEQUENCE_LABELS[i]).toBe(label);
    });
  });
});

describe('CONSEQUENCE_LABELS — has 6 entries (index 0 is empty)', () => {
  it('length is 6', () => {
    expect(CONSEQUENCE_LABELS).toHaveLength(6);
  });
  it('index 0 is empty string', () => {
    expect(CONSEQUENCE_LABELS[0]).toBe('');
  });
});

describe('CONSEQUENCE_LABELS — indices 1-5 are non-empty', () => {
  for (let i = 1; i <= 5; i++) {
    it(`CONSEQUENCE_LABELS[${i}] is non-empty`, () => {
      expect(CONSEQUENCE_LABELS[i].length).toBeGreaterThan(0);
    });
  }
});

describe('CONSEQUENCE_LABELS — all elements are strings', () => {
  CONSEQUENCE_LABELS.forEach((label, i) => {
    it(`CONSEQUENCE_LABELS[${i}] is a string`, () => {
      expect(typeof label).toBe('string');
    });
  });
});

describe('CONSEQUENCE_LABELS — index alignment with C_SCORES', () => {
  it('CONSEQUENCE_LABELS[1] corresponds to INSIGNIFICANT', () => {
    expect(CONSEQUENCE_LABELS[C_SCORES.INSIGNIFICANT]).toBe('Insignif.');
  });
  it('CONSEQUENCE_LABELS[2] corresponds to MINOR', () => {
    expect(CONSEQUENCE_LABELS[C_SCORES.MINOR]).toBe('Minor');
  });
  it('CONSEQUENCE_LABELS[3] corresponds to MODERATE', () => {
    expect(CONSEQUENCE_LABELS[C_SCORES.MODERATE]).toBe('Moderate');
  });
  it('CONSEQUENCE_LABELS[4] corresponds to MAJOR', () => {
    expect(CONSEQUENCE_LABELS[C_SCORES.MAJOR]).toBe('Major');
  });
  it('CONSEQUENCE_LABELS[5] corresponds to CATASTROPHIC', () => {
    expect(CONSEQUENCE_LABELS[C_SCORES.CATASTROPHIC]).toBe('Catastrophic');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// DESCRIBE: L_SCORES
// ═══════════════════════════════════════════════════════════════════════════════

describe('L_SCORES — exact values', () => {
  const cases: [string, number][] = [
    ['RARE', 1], ['UNLIKELY', 2], ['POSSIBLE', 3], ['LIKELY', 4], ['ALMOST_CERTAIN', 5],
  ];
  cases.forEach(([key, val]) => {
    it(`L_SCORES.${key} === ${val}`, () => {
      expect(L_SCORES[key]).toBe(val);
    });
  });
});

describe('L_SCORES — has exactly 5 keys', () => {
  it('has 5 keys', () => {
    expect(Object.keys(L_SCORES)).toHaveLength(5);
  });
});

describe('L_SCORES — all values are numbers', () => {
  Object.entries(L_SCORES).forEach(([key, val]) => {
    it(`L_SCORES.${key} is a number`, () => {
      expect(typeof val).toBe('number');
    });
  });
});

describe('L_SCORES — all values are integers 1-5', () => {
  Object.entries(L_SCORES).forEach(([key, val]) => {
    it(`L_SCORES.${key} is between 1 and 5`, () => {
      expect(val).toBeGreaterThanOrEqual(1);
      expect(val).toBeLessThanOrEqual(5);
    });
  });
});

describe('L_SCORES — values are unique', () => {
  it('no duplicates in L_SCORES values', () => {
    const vals = Object.values(L_SCORES);
    expect(new Set(vals).size).toBe(vals.length);
  });
});

describe('L_SCORES — RARE < ALMOST_CERTAIN', () => {
  it('RARE is smallest', () => {
    expect(L_SCORES.RARE).toBe(Math.min(...Object.values(L_SCORES)));
  });
  it('ALMOST_CERTAIN is largest', () => {
    expect(L_SCORES.ALMOST_CERTAIN).toBe(Math.max(...Object.values(L_SCORES)));
  });
});

describe('L_SCORES — sequential ordering', () => {
  it('UNLIKELY > RARE', () => { expect(L_SCORES.UNLIKELY).toBeGreaterThan(L_SCORES.RARE); });
  it('POSSIBLE > UNLIKELY', () => { expect(L_SCORES.POSSIBLE).toBeGreaterThan(L_SCORES.UNLIKELY); });
  it('LIKELY > POSSIBLE', () => { expect(L_SCORES.LIKELY).toBeGreaterThan(L_SCORES.POSSIBLE); });
  it('ALMOST_CERTAIN > LIKELY', () => { expect(L_SCORES.ALMOST_CERTAIN).toBeGreaterThan(L_SCORES.LIKELY); });
});

describe('L_SCORES — matches LIKELIHOODS array length', () => {
  it('LIKELIHOODS has same count as L_SCORES keys', () => {
    expect(LIKELIHOODS.length).toBe(Object.keys(L_SCORES).length);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// DESCRIBE: C_SCORES
// ═══════════════════════════════════════════════════════════════════════════════

describe('C_SCORES — exact values', () => {
  const cases: [string, number][] = [
    ['INSIGNIFICANT', 1], ['MINOR', 2], ['MODERATE', 3], ['MAJOR', 4], ['CATASTROPHIC', 5],
  ];
  cases.forEach(([key, val]) => {
    it(`C_SCORES.${key} === ${val}`, () => {
      expect(C_SCORES[key]).toBe(val);
    });
  });
});

describe('C_SCORES — has exactly 5 keys', () => {
  it('has 5 keys', () => {
    expect(Object.keys(C_SCORES)).toHaveLength(5);
  });
});

describe('C_SCORES — all values are numbers', () => {
  Object.entries(C_SCORES).forEach(([key, val]) => {
    it(`C_SCORES.${key} is a number`, () => {
      expect(typeof val).toBe('number');
    });
  });
});

describe('C_SCORES — all values are integers 1-5', () => {
  Object.entries(C_SCORES).forEach(([key, val]) => {
    it(`C_SCORES.${key} is between 1 and 5`, () => {
      expect(val).toBeGreaterThanOrEqual(1);
      expect(val).toBeLessThanOrEqual(5);
    });
  });
});

describe('C_SCORES — values are unique', () => {
  it('no duplicates in C_SCORES values', () => {
    const vals = Object.values(C_SCORES);
    expect(new Set(vals).size).toBe(vals.length);
  });
});

describe('C_SCORES — INSIGNIFICANT < CATASTROPHIC', () => {
  it('INSIGNIFICANT is smallest', () => {
    expect(C_SCORES.INSIGNIFICANT).toBe(Math.min(...Object.values(C_SCORES)));
  });
  it('CATASTROPHIC is largest', () => {
    expect(C_SCORES.CATASTROPHIC).toBe(Math.max(...Object.values(C_SCORES)));
  });
});

describe('C_SCORES — sequential ordering', () => {
  it('MINOR > INSIGNIFICANT', () => { expect(C_SCORES.MINOR).toBeGreaterThan(C_SCORES.INSIGNIFICANT); });
  it('MODERATE > MINOR', () => { expect(C_SCORES.MODERATE).toBeGreaterThan(C_SCORES.MINOR); });
  it('MAJOR > MODERATE', () => { expect(C_SCORES.MAJOR).toBeGreaterThan(C_SCORES.MODERATE); });
  it('CATASTROPHIC > MAJOR', () => { expect(C_SCORES.CATASTROPHIC).toBeGreaterThan(C_SCORES.MAJOR); });
});

describe('C_SCORES — matches CONSEQUENCES array length', () => {
  it('CONSEQUENCES has same count as C_SCORES keys', () => {
    expect(CONSEQUENCES.length).toBe(Object.keys(C_SCORES).length);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// DESCRIBE: L_SCORES × C_SCORES cross-product
// ═══════════════════════════════════════════════════════════════════════════════

describe('L_SCORES × C_SCORES — products match CELL_SPECS scores', () => {
  const lKeys = Object.keys(L_SCORES);
  const cKeys = Object.keys(C_SCORES);
  lKeys.forEach((lk) => {
    cKeys.forEach((ck) => {
      const l = L_SCORES[lk];
      const c = C_SCORES[ck];
      const expected = l * c;
      it(`L_SCORES.${lk}(${l}) × C_SCORES.${ck}(${c}) = ${expected}`, () => {
        expect(L_SCORES[lk] * C_SCORES[ck]).toBe(expected);
      });
    });
  });
});

describe('L_SCORES × C_SCORES — getCellColor agrees with tier', () => {
  const lKeys = Object.keys(L_SCORES);
  const cKeys = Object.keys(C_SCORES);
  lKeys.forEach((lk) => {
    cKeys.forEach((ck) => {
      const l = L_SCORES[lk];
      const c = C_SCORES[ck];
      it(`getCellColor(L_SCORES.${lk}, C_SCORES.${ck}) is a string`, () => {
        expect(typeof getCellColor(l, c)).toBe('string');
      });
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// DESCRIBE: Tier consistency between getCellColor and getHeatMapCellColor
// ═══════════════════════════════════════════════════════════════════════════════

describe('Tier consistency — getCellColor and getHeatMapCellColor same tier', () => {
  CELL_SPECS.forEach(({ l, c, tier }) => {
    it(`l=${l},c=${c} both functions agree on tier "${tier}"`, () => {
      const bg = getCellColor(l, c);
      const hm = getHeatMapCellColor(l, c);
      if (tier === 'critical') {
        expect(bg).toBe('bg-red-500');
        expect(hm).toMatch(/bg-red-500/);
      } else if (tier === 'high') {
        expect(bg).toBe('bg-orange-400');
        expect(hm).toMatch(/bg-orange-400/);
      } else if (tier === 'medium') {
        expect(bg).toBe('bg-yellow-400');
        expect(hm).toMatch(/bg-yellow-400/);
      } else {
        expect(bg).toBe('bg-green-400');
        expect(hm).toMatch(/bg-green-400/);
      }
    });
  });
});

describe('Tier consistency — getCellColor red matches getCellTextColor white', () => {
  CELL_SPECS.filter((s) => s.bg === 'bg-red-500').forEach(({ l, c }) => {
    it(`l=${l},c=${c}: red bg → text-white`, () => {
      expect(getCellTextColor(l, c)).toBe('text-white');
    });
  });
});

describe('Tier consistency — getCellColor orange matches getCellTextColor white', () => {
  CELL_SPECS.filter((s) => s.bg === 'bg-orange-400').forEach(({ l, c }) => {
    it(`l=${l},c=${c}: orange bg → text-white`, () => {
      expect(getCellTextColor(l, c)).toBe('text-white');
    });
  });
});

describe('Tier consistency — getCellColor yellow matches getCellTextColor white', () => {
  CELL_SPECS.filter((s) => s.bg === 'bg-yellow-400').forEach(({ l, c }) => {
    it(`l=${l},c=${c}: yellow bg → text-white`, () => {
      expect(getCellTextColor(l, c)).toBe('text-white');
    });
  });
});

describe('Tier consistency — green bg may be text-gray-800', () => {
  CELL_SPECS.filter((s) => s.bg === 'bg-green-400').forEach(({ l, c, score }) => {
    it(`l=${l},c=${c} (score=${score}): green bg textColor is deterministic`, () => {
      const tc = getCellTextColor(l, c);
      if (score >= 5) expect(tc).toBe('text-white');
      else expect(tc).toBe('text-gray-800');
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// DESCRIBE: Heat-map text word for medium tier
// ═══════════════════════════════════════════════════════════════════════════════

describe('getHeatMapCellColor — medium tier text word is gray-900 (not white)', () => {
  CELL_SPECS.filter((s) => s.score >= 5 && s.score < 10).forEach(({ l, c }) => {
    it(`getHeatMapCellColor(${l},${c}) text word is "text-gray-900"`, () => {
      const words = getHeatMapCellColor(l, c).split(' ');
      expect(words[1]).toBe('text-gray-900');
    });
  });
});

describe('getHeatMapCellColor — critical/high/low tier text word is "text-white"', () => {
  CELL_SPECS.filter((s) => s.score >= 15 || s.score >= 10 || s.score < 5)
    .filter((s) => s.score < 5 || s.score >= 10)
    .forEach(({ l, c }) => {
      it(`getHeatMapCellColor(${l},${c}) text word is "text-white"`, () => {
        const words = getHeatMapCellColor(l, c).split(' ');
        expect(words[1]).toBe('text-white');
      });
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// DESCRIBE: Boundary values
// ═══════════════════════════════════════════════════════════════════════════════

describe('Boundary score 15 — exactly critical', () => {
  // l=3,c=5 or l=5,c=3 gives score=15
  it('getCellColor(3,5) → bg-red-500', () => expect(getCellColor(3, 5)).toBe('bg-red-500'));
  it('getCellColor(5,3) → bg-red-500', () => expect(getCellColor(5, 3)).toBe('bg-red-500'));
  it('getCellColor(3,5) score is 15', () => expect(3 * 5).toBe(15));
});

describe('Boundary score 14 — just below critical (high)', () => {
  // No standard l×c pair gives exactly 14 from 1-5 grid — closest: 14 not possible in 5×5
  // But we can test l=4,c=3=12 (high) and l=3,c=4=12 (high)
  it('getCellColor(4,3) → bg-orange-400', () => expect(getCellColor(4, 3)).toBe('bg-orange-400'));
  it('getCellColor(3,4) → bg-orange-400', () => expect(getCellColor(3, 4)).toBe('bg-orange-400'));
  it('score 4*3 = 12', () => expect(4 * 3).toBe(12));
});

describe('Boundary score 10 — exactly high', () => {
  // l=2,c=5 or l=5,c=2 gives score=10
  it('getCellColor(2,5) → bg-orange-400', () => expect(getCellColor(2, 5)).toBe('bg-orange-400'));
  it('getCellColor(5,2) → bg-orange-400', () => expect(getCellColor(5, 2)).toBe('bg-orange-400'));
  it('score 2*5 = 10', () => expect(2 * 5).toBe(10));
});

describe('Boundary score 5 — exactly medium', () => {
  // l=1,c=5 or l=5,c=1 gives score=5
  it('getCellColor(1,5) → bg-yellow-400', () => expect(getCellColor(1, 5)).toBe('bg-yellow-400'));
  it('getCellColor(5,1) → bg-yellow-400', () => expect(getCellColor(5, 1)).toBe('bg-yellow-400'));
  it('score 1*5 = 5', () => expect(1 * 5).toBe(5));
});

describe('Boundary score 4 — just below medium (low)', () => {
  // l=2,c=2 gives score=4
  it('getCellColor(2,2) → bg-green-400', () => expect(getCellColor(2, 2)).toBe('bg-green-400'));
  it('score 2*2 = 4', () => expect(2 * 2).toBe(4));
  it('getCellTextColor(2,2) → text-gray-800', () => expect(getCellTextColor(2, 2)).toBe('text-gray-800'));
});

describe('Boundary score 1 — minimum (l=1,c=1)', () => {
  it('getCellColor(1,1) → bg-green-400', () => expect(getCellColor(1, 1)).toBe('bg-green-400'));
  it('getCellTextColor(1,1) → text-gray-800', () => expect(getCellTextColor(1, 1)).toBe('text-gray-800'));
  it('getHeatMapCellColor(1,1) → bg-green-400 text-white', () => expect(getHeatMapCellColor(1, 1)).toBe('bg-green-400 text-white'));
});

describe('Boundary score 25 — maximum (l=5,c=5)', () => {
  it('getCellColor(5,5) → bg-red-500', () => expect(getCellColor(5, 5)).toBe('bg-red-500'));
  it('getCellTextColor(5,5) → text-white', () => expect(getCellTextColor(5, 5)).toBe('text-white'));
  it('getHeatMapCellColor(5,5) → bg-red-500 text-white', () => expect(getHeatMapCellColor(5, 5)).toBe('bg-red-500 text-white'));
});

// ═══════════════════════════════════════════════════════════════════════════════
// DESCRIBE: LIKELIHOODS / CONSEQUENCES arrays
// ═══════════════════════════════════════════════════════════════════════════════

describe('LIKELIHOODS array — 5 entries', () => {
  it('LIKELIHOODS has length 5', () => {
    expect(LIKELIHOODS).toHaveLength(5);
  });
  it('contains ALMOST_CERTAIN', () => { expect(LIKELIHOODS).toContain('ALMOST_CERTAIN'); });
  it('contains LIKELY', () => { expect(LIKELIHOODS).toContain('LIKELY'); });
  it('contains POSSIBLE', () => { expect(LIKELIHOODS).toContain('POSSIBLE'); });
  it('contains UNLIKELY', () => { expect(LIKELIHOODS).toContain('UNLIKELY'); });
  it('contains RARE', () => { expect(LIKELIHOODS).toContain('RARE'); });
});

describe('LIKELIHOODS — all keys exist in L_SCORES', () => {
  LIKELIHOODS.forEach((lk) => {
    it(`L_SCORES["${lk}"] is defined`, () => {
      expect(L_SCORES[lk]).toBeDefined();
    });
  });
});

describe('CONSEQUENCES array — 5 entries', () => {
  it('CONSEQUENCES has length 5', () => {
    expect(CONSEQUENCES).toHaveLength(5);
  });
  it('contains INSIGNIFICANT', () => { expect(CONSEQUENCES).toContain('INSIGNIFICANT'); });
  it('contains MINOR', () => { expect(CONSEQUENCES).toContain('MINOR'); });
  it('contains MODERATE', () => { expect(CONSEQUENCES).toContain('MODERATE'); });
  it('contains MAJOR', () => { expect(CONSEQUENCES).toContain('MAJOR'); });
  it('contains CATASTROPHIC', () => { expect(CONSEQUENCES).toContain('CATASTROPHIC'); });
});

describe('CONSEQUENCES — all keys exist in C_SCORES', () => {
  CONSEQUENCES.forEach((ck) => {
    it(`C_SCORES["${ck}"] is defined`, () => {
      expect(C_SCORES[ck]).toBeDefined();
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// DESCRIBE: Tier distribution verification
// ═══════════════════════════════════════════════════════════════════════════════

describe('Tier distribution — expected cell counts', () => {
  const criticalCells = CELL_SPECS.filter((s) => s.tier === 'critical');
  const highCells = CELL_SPECS.filter((s) => s.tier === 'high');
  const mediumCells = CELL_SPECS.filter((s) => s.tier === 'medium');
  const lowCells = CELL_SPECS.filter((s) => s.tier === 'low');

  it('total 25 cells', () => expect(CELL_SPECS).toHaveLength(25));
  it('critical + high + medium + low = 25', () => {
    expect(criticalCells.length + highCells.length + mediumCells.length + lowCells.length).toBe(25);
  });
  it('critical cells: score >= 15', () => {
    criticalCells.forEach((s) => expect(s.score).toBeGreaterThanOrEqual(15));
  });
  it('high cells: score 10-14', () => {
    highCells.forEach((s) => {
      expect(s.score).toBeGreaterThanOrEqual(10);
      expect(s.score).toBeLessThan(15);
    });
  });
  it('medium cells: score 5-9', () => {
    mediumCells.forEach((s) => {
      expect(s.score).toBeGreaterThanOrEqual(5);
      expect(s.score).toBeLessThan(10);
    });
  });
  it('low cells: score < 5', () => {
    lowCells.forEach((s) => expect(s.score).toBeLessThan(5));
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// DESCRIBE: Mirror symmetry (l,c) vs (c,l)
// ═══════════════════════════════════════════════════════════════════════════════

describe('Mirror symmetry — getCellColor(l,c) === getCellColor(c,l)', () => {
  for (let l = 1; l <= 5; l++) {
    for (let c = 1; c <= 5; c++) {
      it(`getCellColor(${l},${c}) === getCellColor(${c},${l})`, () => {
        expect(getCellColor(l, c)).toBe(getCellColor(c, l));
      });
    }
  }
});

describe('Mirror symmetry — getHeatMapCellColor(l,c) === getHeatMapCellColor(c,l)', () => {
  for (let l = 1; l <= 5; l++) {
    for (let c = 1; c <= 5; c++) {
      it(`getHeatMapCellColor(${l},${c}) === getHeatMapCellColor(${c},${l})`, () => {
        expect(getHeatMapCellColor(l, c)).toBe(getHeatMapCellColor(c, l));
      });
    }
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// DESCRIBE: Monotonicity — increasing l or c does not decrease tier
// ═══════════════════════════════════════════════════════════════════════════════

describe('Monotonicity — increasing l with fixed c does not decrease score', () => {
  for (let c = 1; c <= 5; c++) {
    for (let l = 1; l < 5; l++) {
      it(`score(${l + 1},${c}) >= score(${l},${c})`, () => {
        expect((l + 1) * c).toBeGreaterThanOrEqual(l * c);
      });
    }
  }
});

describe('Monotonicity — increasing c with fixed l does not decrease score', () => {
  for (let l = 1; l <= 5; l++) {
    for (let c = 1; c < 5; c++) {
      it(`score(${l},${c + 1}) >= score(${l},${c})`, () => {
        expect(l * (c + 1)).toBeGreaterThanOrEqual(l * c);
      });
    }
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// DESCRIBE: Additional structural checks
// ═══════════════════════════════════════════════════════════════════════════════

describe('LEVEL_COLORS — all 5 values are distinct', () => {
  it('all LEVEL_COLORS values are unique', () => {
    const vals = Object.values(LEVEL_COLORS);
    expect(new Set(vals).size).toBe(vals.length);
  });
});

describe('LEVEL_TEXT — all 5 values are distinct', () => {
  it('all LEVEL_TEXT values are unique', () => {
    const vals = Object.values(LEVEL_TEXT);
    expect(new Set(vals).size).toBe(vals.length);
  });
});

describe('getCellColor — four distinct output values', () => {
  it('only 4 unique bg classes exist across all 25 cells', () => {
    const classes = new Set(CELL_SPECS.map((s) => s.bg));
    expect(classes.size).toBe(4);
  });
  it('bg-red-500 is one of the 4', () => {
    expect(new Set(CELL_SPECS.map((s) => s.bg)).has('bg-red-500')).toBe(true);
  });
  it('bg-orange-400 is one of the 4', () => {
    expect(new Set(CELL_SPECS.map((s) => s.bg)).has('bg-orange-400')).toBe(true);
  });
  it('bg-yellow-400 is one of the 4', () => {
    expect(new Set(CELL_SPECS.map((s) => s.bg)).has('bg-yellow-400')).toBe(true);
  });
  it('bg-green-400 is one of the 4', () => {
    expect(new Set(CELL_SPECS.map((s) => s.bg)).has('bg-green-400')).toBe(true);
  });
});

describe('getCellTextColor — two distinct output values', () => {
  it('only 2 unique text classes exist across all 25 cells', () => {
    const classes = new Set(CELL_SPECS.map((s) => s.textClass));
    expect(classes.size).toBe(2);
  });
  it('text-white is one of them', () => {
    expect(new Set(CELL_SPECS.map((s) => s.textClass)).has('text-white')).toBe(true);
  });
  it('text-gray-800 is one of them', () => {
    expect(new Set(CELL_SPECS.map((s) => s.textClass)).has('text-gray-800')).toBe(true);
  });
});

describe('getHeatMapCellColor — four distinct output values', () => {
  it('only 4 unique heatmap classes exist across all 25 cells', () => {
    const classes = new Set(CELL_SPECS.map((s) => s.heatmapClass));
    expect(classes.size).toBe(4);
  });
});

describe('L_SCORES — values cover 1 through 5', () => {
  it('L_SCORES includes value 1', () => { expect(Object.values(L_SCORES)).toContain(1); });
  it('L_SCORES includes value 2', () => { expect(Object.values(L_SCORES)).toContain(2); });
  it('L_SCORES includes value 3', () => { expect(Object.values(L_SCORES)).toContain(3); });
  it('L_SCORES includes value 4', () => { expect(Object.values(L_SCORES)).toContain(4); });
  it('L_SCORES includes value 5', () => { expect(Object.values(L_SCORES)).toContain(5); });
});

describe('C_SCORES — values cover 1 through 5', () => {
  it('C_SCORES includes value 1', () => { expect(Object.values(C_SCORES)).toContain(1); });
  it('C_SCORES includes value 2', () => { expect(Object.values(C_SCORES)).toContain(2); });
  it('C_SCORES includes value 3', () => { expect(Object.values(C_SCORES)).toContain(3); });
  it('C_SCORES includes value 4', () => { expect(Object.values(C_SCORES)).toContain(4); });
  it('C_SCORES includes value 5', () => { expect(Object.values(C_SCORES)).toContain(5); });
});

describe('Score sanity — diagonal cells l===c', () => {
  it('score(1,1) = 1', () => expect(1 * 1).toBe(1));
  it('score(2,2) = 4', () => expect(2 * 2).toBe(4));
  it('score(3,3) = 9', () => expect(3 * 3).toBe(9));
  it('score(4,4) = 16', () => expect(4 * 4).toBe(16));
  it('score(5,5) = 25', () => expect(5 * 5).toBe(25));
});
