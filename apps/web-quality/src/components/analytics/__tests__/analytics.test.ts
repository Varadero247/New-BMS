// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
/**
 * Unit tests for Quality Analytics pure factory functions.
 * Tests createEmpty6MFishbone() and create8DFunnelData() — both are
 * pure functions with no side effects or React dependencies.
 */
import { createEmpty6MFishbone } from '../FishboneDiagram';
import { create8DFunnelData } from '../CAPAFunnel';

// ─────────────────────────────────────────────────────────────────────────────
// Constants mirroring the source (used for assertion building)
// ─────────────────────────────────────────────────────────────────────────────

const EXPECTED_NAMES = ['Manpower', 'Methods', 'Materials', 'Machines', 'Measurement', 'Environment'];
const EXPECTED_COLORS = ['#1E3A8A', '#10B981', '#F59E0B', '#DC2626', '#8B5CF6', '#EC4899'];
const PHASES = ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8'];

// Helper: build expected counts for a set of CAPAs
function expectedCounts(capas: Array<{ currentPhase: string }>): number[] {
  const phaseOrder = new Map(PHASES.map((p, i) => [p, i]));
  return PHASES.map((phase) => {
    const targetIdx = phaseOrder.get(phase) ?? -1;
    return capas.filter((c) => (phaseOrder.get(c.currentPhase) ?? -1) >= targetIdx).length;
  });
}

// ═════════════════════════════════════════════════════════════════════════════
// createEmpty6MFishbone
// ═════════════════════════════════════════════════════════════════════════════

describe('createEmpty6MFishbone — return type', () => {
  it('returns a value', () => expect(createEmpty6MFishbone()).toBeDefined());
  it('returns an array', () => expect(Array.isArray(createEmpty6MFishbone())).toBe(true));
  it('is not null', () => expect(createEmpty6MFishbone()).not.toBeNull());
  it('length is 6', () => expect(createEmpty6MFishbone()).toHaveLength(6));
  it('has no extra elements', () => expect(createEmpty6MFishbone().length).toBe(6));
  it('is not a string', () => expect(typeof createEmpty6MFishbone()).not.toBe('string'));
  it('is not a number', () => expect(typeof createEmpty6MFishbone()).not.toBe('number'));
  it('typeof is object', () => expect(typeof createEmpty6MFishbone()).toBe('object'));
});

describe('createEmpty6MFishbone — element structure', () => {
  EXPECTED_NAMES.forEach((_, i) => {
    it(`element [${i}] is an object`, () => expect(typeof createEmpty6MFishbone()[i]).toBe('object'));
    it(`element [${i}] is not null`, () => expect(createEmpty6MFishbone()[i]).not.toBeNull());
    it(`element [${i}] is not an array`, () => expect(Array.isArray(createEmpty6MFishbone()[i])).toBe(false));
    it(`element [${i}] has 'name'`, () => expect(createEmpty6MFishbone()[i]).toHaveProperty('name'));
    it(`element [${i}] has 'causes'`, () => expect(createEmpty6MFishbone()[i]).toHaveProperty('causes'));
    it(`element [${i}] has 'color'`, () => expect(createEmpty6MFishbone()[i]).toHaveProperty('color'));
  });
});

describe('createEmpty6MFishbone — category names', () => {
  EXPECTED_NAMES.forEach((name, i) => {
    it(`element [${i}].name === '${name}'`, () => expect(createEmpty6MFishbone()[i].name).toBe(name));
    it(`element [${i}].name is a string`, () => expect(typeof createEmpty6MFishbone()[i].name).toBe('string'));
    it(`element [${i}].name length > 0`, () => expect(createEmpty6MFishbone()[i].name.length).toBeGreaterThan(0));
    it(`element [${i}].name has no leading whitespace`, () => expect(createEmpty6MFishbone()[i].name).toBe(createEmpty6MFishbone()[i].name.trimStart()));
    it(`element [${i}].name has no trailing whitespace`, () => expect(createEmpty6MFishbone()[i].name).toBe(createEmpty6MFishbone()[i].name.trimEnd()));
  });
});

describe('createEmpty6MFishbone — 6M completeness', () => {
  it('includes Manpower', () => expect(createEmpty6MFishbone().map(c => c.name)).toContain('Manpower'));
  it('includes Methods', () => expect(createEmpty6MFishbone().map(c => c.name)).toContain('Methods'));
  it('includes Materials', () => expect(createEmpty6MFishbone().map(c => c.name)).toContain('Materials'));
  it('includes Machines', () => expect(createEmpty6MFishbone().map(c => c.name)).toContain('Machines'));
  it('includes Measurement', () => expect(createEmpty6MFishbone().map(c => c.name)).toContain('Measurement'));
  it('includes Environment', () => expect(createEmpty6MFishbone().map(c => c.name)).toContain('Environment'));
  it('all names are unique', () => {
    const names = createEmpty6MFishbone().map(c => c.name);
    expect(new Set(names).size).toBe(6);
  });
  it('names match expected set exactly', () => {
    const names = createEmpty6MFishbone().map(c => c.name).sort();
    expect(names).toEqual([...EXPECTED_NAMES].sort());
  });
  it('Manpower is first', () => expect(createEmpty6MFishbone()[0].name).toBe('Manpower'));
  it('Environment is last', () => expect(createEmpty6MFishbone()[5].name).toBe('Environment'));
  it('Methods comes before Materials', () => {
    const result = createEmpty6MFishbone();
    const methodsIdx = result.findIndex(c => c.name === 'Methods');
    const materialsIdx = result.findIndex(c => c.name === 'Materials');
    expect(methodsIdx).toBeLessThan(materialsIdx);
  });
  it('Machines comes after Materials', () => {
    const result = createEmpty6MFishbone();
    const machinesIdx = result.findIndex(c => c.name === 'Machines');
    const materialsIdx = result.findIndex(c => c.name === 'Materials');
    expect(machinesIdx).toBeGreaterThan(materialsIdx);
  });
  it('Measurement comes before Environment', () => {
    const result = createEmpty6MFishbone();
    const measurementIdx = result.findIndex(c => c.name === 'Measurement');
    const environmentIdx = result.findIndex(c => c.name === 'Environment');
    expect(measurementIdx).toBeLessThan(environmentIdx);
  });
});

describe('createEmpty6MFishbone — colors', () => {
  EXPECTED_COLORS.forEach((color, i) => {
    it(`element [${i}].color === '${color}'`, () => expect(createEmpty6MFishbone()[i].color).toBe(color));
    it(`element [${i}].color is a string`, () => expect(typeof createEmpty6MFishbone()[i].color).toBe('string'));
    it(`element [${i}].color starts with '#'`, () => expect(createEmpty6MFishbone()[i].color.startsWith('#')).toBe(true));
    it(`element [${i}].color has length 7`, () => expect(createEmpty6MFishbone()[i].color).toHaveLength(7));
    it(`element [${i}].color is valid hex`, () => expect(createEmpty6MFishbone()[i].color).toMatch(/^#[0-9A-Fa-f]{6}$/));
  });
  it('all colors are unique', () => {
    const colors = createEmpty6MFishbone().map(c => c.color);
    expect(new Set(colors).size).toBe(6);
  });
  it('colors match expected palette', () => {
    const colors = createEmpty6MFishbone().map(c => c.color);
    expect(colors).toEqual(EXPECTED_COLORS);
  });
  it('first color is navy #1E3A8A', () => expect(createEmpty6MFishbone()[0].color).toBe('#1E3A8A'));
  it('last color is pink #EC4899', () => expect(createEmpty6MFishbone()[5].color).toBe('#EC4899'));
});

describe('createEmpty6MFishbone — causes arrays', () => {
  EXPECTED_NAMES.forEach((_, i) => {
    it(`element [${i}].causes is an array`, () => expect(Array.isArray(createEmpty6MFishbone()[i].causes)).toBe(true));
    it(`element [${i}].causes is empty (length = 0)`, () => expect(createEmpty6MFishbone()[i].causes).toHaveLength(0));
    it(`element [${i}].causes deep equals []`, () => expect(createEmpty6MFishbone()[i].causes).toEqual([]));
    it(`element [${i}].causes is not null`, () => expect(createEmpty6MFishbone()[i].causes).not.toBeNull());
  });
  it('all causes arrays are empty', () => {
    createEmpty6MFishbone().forEach(c => expect(c.causes).toHaveLength(0));
  });
  it('causes arrays are mutable (can push to them)', () => {
    const result = createEmpty6MFishbone();
    result[0].causes.push({ id: 'test', text: 'test' } as any);
    expect(result[0].causes).toHaveLength(1);
  });
});

describe('createEmpty6MFishbone — freshness and immutability', () => {
  it('two calls return different array references', () => {
    const a = createEmpty6MFishbone();
    const b = createEmpty6MFishbone();
    expect(a).not.toBe(b);
  });
  it('two calls return deep-equal results', () => {
    expect(createEmpty6MFishbone()).toEqual(createEmpty6MFishbone());
  });
  it('modifying first call does not affect second call', () => {
    const a = createEmpty6MFishbone();
    const b = createEmpty6MFishbone();
    a[0].causes.push({ id: 'x', text: 'x' } as any);
    expect(b[0].causes).toHaveLength(0);
  });
  it('modifying element name in first call does not affect second', () => {
    const a = createEmpty6MFishbone();
    const b = createEmpty6MFishbone();
    (a[0] as any).name = 'Changed';
    expect(b[0].name).toBe('Manpower');
  });
  it('each call returns completely fresh array', () => {
    for (let i = 0; i < 5; i++) {
      const r1 = createEmpty6MFishbone();
      const r2 = createEmpty6MFishbone();
      expect(r1).not.toBe(r2);
      expect(r1).toEqual(r2);
    }
  });
  it('two calls return different element objects at [0]', () => {
    const a = createEmpty6MFishbone();
    const b = createEmpty6MFishbone();
    expect(a[0]).not.toBe(b[0]);
  });
  it('two calls return different element objects at [5]', () => {
    const a = createEmpty6MFishbone();
    const b = createEmpty6MFishbone();
    expect(a[5]).not.toBe(b[5]);
  });
  it('ten consecutive calls all return equal results', () => {
    const first = createEmpty6MFishbone();
    for (let i = 0; i < 9; i++) {
      expect(createEmpty6MFishbone()).toEqual(first);
    }
  });
});

describe('createEmpty6MFishbone — name/color pairs are consistent', () => {
  it('Manpower always paired with navy #1E3A8A', () => {
    const r = createEmpty6MFishbone();
    const cat = r.find(c => c.name === 'Manpower')!;
    expect(cat.color).toBe('#1E3A8A');
  });
  it('Methods always paired with green #10B981', () => {
    const r = createEmpty6MFishbone();
    const cat = r.find(c => c.name === 'Methods')!;
    expect(cat.color).toBe('#10B981');
  });
  it('Materials always paired with amber #F59E0B', () => {
    const r = createEmpty6MFishbone();
    const cat = r.find(c => c.name === 'Materials')!;
    expect(cat.color).toBe('#F59E0B');
  });
  it('Machines always paired with red #DC2626', () => {
    const r = createEmpty6MFishbone();
    const cat = r.find(c => c.name === 'Machines')!;
    expect(cat.color).toBe('#DC2626');
  });
  it('Measurement always paired with violet #8B5CF6', () => {
    const r = createEmpty6MFishbone();
    const cat = r.find(c => c.name === 'Measurement')!;
    expect(cat.color).toBe('#8B5CF6');
  });
  it('Environment always paired with pink #EC4899', () => {
    const r = createEmpty6MFishbone();
    const cat = r.find(c => c.name === 'Environment')!;
    expect(cat.color).toBe('#EC4899');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// create8DFunnelData — return structure
// ═════════════════════════════════════════════════════════════════════════════

describe('create8DFunnelData — return structure', () => {
  it('returns an array', () => expect(Array.isArray(create8DFunnelData([]))).toBe(true));
  it('returns exactly 8 elements', () => expect(create8DFunnelData([])).toHaveLength(8));
  it('is not null', () => expect(create8DFunnelData([])).not.toBeNull());
  it('each element has a phase property', () => {
    create8DFunnelData([]).forEach(item => expect(item).toHaveProperty('phase'));
  });
  it('each element has a count property', () => {
    create8DFunnelData([]).forEach(item => expect(item).toHaveProperty('count'));
  });
  it('all phase values are strings', () => {
    create8DFunnelData([]).forEach(item => expect(typeof item.phase).toBe('string'));
  });
  it('all count values are numbers', () => {
    create8DFunnelData([]).forEach(item => expect(typeof item.count).toBe('number'));
  });
  it('all count values are integers', () => {
    create8DFunnelData([]).forEach(item => expect(Number.isInteger(item.count)).toBe(true));
  });
  it('all count values are >= 0', () => {
    create8DFunnelData([]).forEach(item => expect(item.count).toBeGreaterThanOrEqual(0));
  });
  it('phase names are D1 through D8 in order', () => {
    const phases = create8DFunnelData([]).map(r => r.phase);
    expect(phases).toEqual(PHASES);
  });
  it('result[0].phase is D1', () => expect(create8DFunnelData([])[0].phase).toBe('D1'));
  it('result[1].phase is D2', () => expect(create8DFunnelData([])[1].phase).toBe('D2'));
  it('result[2].phase is D3', () => expect(create8DFunnelData([])[2].phase).toBe('D3'));
  it('result[3].phase is D4', () => expect(create8DFunnelData([])[3].phase).toBe('D4'));
  it('result[4].phase is D5', () => expect(create8DFunnelData([])[4].phase).toBe('D5'));
  it('result[5].phase is D6', () => expect(create8DFunnelData([])[5].phase).toBe('D6'));
  it('result[6].phase is D7', () => expect(create8DFunnelData([])[6].phase).toBe('D7'));
  it('result[7].phase is D8', () => expect(create8DFunnelData([])[7].phase).toBe('D8'));
  it('all phase names are unique', () => {
    const phases = create8DFunnelData([]).map(r => r.phase);
    expect(new Set(phases).size).toBe(8);
  });
  it('two calls with same input return equal results', () => {
    const input = [{ currentPhase: 'D4' }];
    expect(create8DFunnelData(input)).toEqual(create8DFunnelData(input));
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// create8DFunnelData — empty input
// ─────────────────────────────────────────────────────────────────────────────

describe('create8DFunnelData — empty input', () => {
  PHASES.forEach((phase, idx) => {
    it(`${phase} count = 0 for empty input`, () => {
      expect(create8DFunnelData([])[idx].count).toBe(0);
    });
  });
  it('sum of all counts = 0 for empty input', () => {
    expect(create8DFunnelData([]).reduce((a, r) => a + r.count, 0)).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// create8DFunnelData — single CAPA at each phase
// ─────────────────────────────────────────────────────────────────────────────

describe('create8DFunnelData — single CAPA per phase', () => {
  PHASES.forEach((inputPhase, inputIdx) => {
    describe(`single CAPA at ${inputPhase}`, () => {
      const result = create8DFunnelData([{ currentPhase: inputPhase }]);
      PHASES.forEach((targetPhase, targetIdx) => {
        const expected = targetIdx <= inputIdx ? 1 : 0;
        it(`${targetPhase} count = ${expected}`, () => {
          expect(result[targetIdx].count).toBe(expected);
        });
      });
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// create8DFunnelData — two identical CAPAs at each phase
// ─────────────────────────────────────────────────────────────────────────────

describe('create8DFunnelData — two identical CAPAs per phase', () => {
  PHASES.forEach((inputPhase, inputIdx) => {
    describe(`two CAPAs at ${inputPhase}`, () => {
      const result = create8DFunnelData([{ currentPhase: inputPhase }, { currentPhase: inputPhase }]);
      PHASES.forEach((targetPhase, targetIdx) => {
        const expected = targetIdx <= inputIdx ? 2 : 0;
        it(`${targetPhase} count = ${expected}`, () => {
          expect(result[targetIdx].count).toBe(expected);
        });
      });
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// create8DFunnelData — unknown/invalid phases
// ─────────────────────────────────────────────────────────────────────────────

describe('create8DFunnelData — unknown phases', () => {
  const unknownPhases = ['X', '', 'd1', 'D9', 'D0', 'Phase1', 'D10', 'D12', 'complete', 'COMPLETE', 'step1', 'n/a'];
  unknownPhases.forEach(phase => {
    PHASES.forEach((targetPhase, targetIdx) => {
      it(`unknown phase '${phase}' → ${targetPhase} count = 0`, () => {
        expect(create8DFunnelData([{ currentPhase: phase }])[targetIdx].count).toBe(0);
      });
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// create8DFunnelData — mixed phase combinations (D_i + D_j where i < j)
// ─────────────────────────────────────────────────────────────────────────────

describe('create8DFunnelData — two-phase combinations', () => {
  // Generate all pairs where i < j
  const pairs: Array<[string, number, string, number]> = [];
  PHASES.forEach((p1, i) => {
    PHASES.forEach((p2, j) => {
      if (i < j) pairs.push([p1, i, p2, j]);
    });
  });

  pairs.forEach(([p1, i, p2, j]) => {
    describe(`CAPAs at ${p1} + ${p2}`, () => {
      const result = create8DFunnelData([{ currentPhase: p1 }, { currentPhase: p2 }]);
      PHASES.forEach((targetPhase, targetIdx) => {
        // CAPA at p1 (index i) contributes to targets with idx <= i
        // CAPA at p2 (index j) contributes to targets with idx <= j
        const expected = (targetIdx <= i ? 1 : 0) + (targetIdx <= j ? 1 : 0);
        it(`${targetPhase} count = ${expected}`, () => {
          expect(result[targetIdx].count).toBe(expected);
        });
      });
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// create8DFunnelData — all 8 phases present
// ─────────────────────────────────────────────────────────────────────────────

describe('create8DFunnelData — one CAPA per phase (all 8)', () => {
  const allCapas = PHASES.map(p => ({ currentPhase: p }));
  const result = create8DFunnelData(allCapas);
  PHASES.forEach((phase, idx) => {
    // Phase at idx has count = number of CAPAs at index >= idx = 8 - idx
    const expected = 8 - idx;
    it(`${phase} count = ${expected}`, () => {
      expect(result[idx].count).toBe(expected);
    });
  });
  it('D1 count = 8 (all CAPAs have reached D1)', () => expect(result[0].count).toBe(8));
  it('D8 count = 1 (only D8 CAPA has reached D8)', () => expect(result[7].count).toBe(1));
  it('counts are strictly decreasing', () => {
    for (let i = 0; i < 7; i++) {
      expect(result[i].count).toBeGreaterThan(result[i + 1].count);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// create8DFunnelData — monotonicity invariant
// ─────────────────────────────────────────────────────────────────────────────

describe('create8DFunnelData — monotonicity invariant', () => {
  const testCases = [
    [{ currentPhase: 'D1' }],
    [{ currentPhase: 'D8' }],
    [{ currentPhase: 'D4' }, { currentPhase: 'D4' }],
    [{ currentPhase: 'D1' }, { currentPhase: 'D8' }],
    [{ currentPhase: 'D2' }, { currentPhase: 'D5' }, { currentPhase: 'D7' }],
    [{ currentPhase: 'D3' }, { currentPhase: 'D3' }, { currentPhase: 'D6' }],
    PHASES.map(p => ({ currentPhase: p })),
    PHASES.map(p => ({ currentPhase: p })).concat(PHASES.map(p => ({ currentPhase: p }))),
    [{ currentPhase: 'D1' }, { currentPhase: 'D2' }, { currentPhase: 'D3' }, { currentPhase: 'D4' }],
    [],
  ];

  testCases.forEach((input, testIdx) => {
    it(`input[${testIdx}]: D1.count >= D2.count >= ... >= D8.count`, () => {
      const result = create8DFunnelData(input);
      for (let i = 0; i < 7; i++) {
        expect(result[i].count).toBeGreaterThanOrEqual(result[i + 1].count);
      }
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// create8DFunnelData — large datasets
// ─────────────────────────────────────────────────────────────────────────────

describe('create8DFunnelData — large datasets', () => {
  it('100 CAPAs all at D8 → all counts = 100', () => {
    const input = Array.from({ length: 100 }, () => ({ currentPhase: 'D8' }));
    const result = create8DFunnelData(input);
    result.forEach(r => expect(r.count).toBe(100));
  });

  it('100 CAPAs all at D1 → D1=100, D2-D8=0', () => {
    const input = Array.from({ length: 100 }, () => ({ currentPhase: 'D1' }));
    const result = create8DFunnelData(input);
    expect(result[0].count).toBe(100);
    for (let i = 1; i < 8; i++) expect(result[i].count).toBe(0);
  });

  it('50 at D4, 50 at D8 → D1-D4=100, D5-D8=50', () => {
    const input = [
      ...Array.from({ length: 50 }, () => ({ currentPhase: 'D4' })),
      ...Array.from({ length: 50 }, () => ({ currentPhase: 'D8' })),
    ];
    const result = create8DFunnelData(input);
    for (let i = 0; i < 4; i++) expect(result[i].count).toBe(100);
    for (let i = 4; i < 8; i++) expect(result[i].count).toBe(50);
  });

  it('10 CAPAs per phase → D1=80, D2=70, ..., D8=10', () => {
    const input = PHASES.flatMap(p => Array.from({ length: 10 }, () => ({ currentPhase: p })));
    const result = create8DFunnelData(input);
    PHASES.forEach((_, idx) => {
      expect(result[idx].count).toBe(80 - idx * 10);
    });
  });

  it('1000 CAPAs all at D5 → D1-D5=1000, D6-D8=0', () => {
    const input = Array.from({ length: 1000 }, () => ({ currentPhase: 'D5' }));
    const result = create8DFunnelData(input);
    for (let i = 0; i < 5; i++) expect(result[i].count).toBe(1000);
    for (let i = 5; i < 8; i++) expect(result[i].count).toBe(0);
  });

  it('200 at D1 + 800 at D8 → D1=1000, D2-D8=800', () => {
    const input = [
      ...Array.from({ length: 200 }, () => ({ currentPhase: 'D1' })),
      ...Array.from({ length: 800 }, () => ({ currentPhase: 'D8' })),
    ];
    const result = create8DFunnelData(input);
    expect(result[0].count).toBe(1000);
    for (let i = 1; i < 8; i++) expect(result[i].count).toBe(800);
  });

  it('mixed valid and unknown phases → unknowns not counted', () => {
    const input = [
      { currentPhase: 'D4' },
      { currentPhase: 'unknown' },
      { currentPhase: 'D4' },
    ];
    const result = create8DFunnelData(input);
    expect(result[3].count).toBe(2); // D4 (index 3) has count 2
    expect(result[4].count).toBe(0); // D5 (index 4) has count 0
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// create8DFunnelData — sum property
// ─────────────────────────────────────────────────────────────────────────────

describe('create8DFunnelData — sum property', () => {
  it('sum of all counts = sum of CAPA phase positions (phase index+1 each)', () => {
    // Each CAPA at D_k contributes (k) to the sum (count for D1 through D_k)
    const input = [{ currentPhase: 'D1' }]; // contributes 1
    const sum = create8DFunnelData(input).reduce((a, r) => a + r.count, 0);
    expect(sum).toBe(1);
  });
  it('one CAPA at D4 has sum = 4', () => {
    const sum = create8DFunnelData([{ currentPhase: 'D4' }]).reduce((a, r) => a + r.count, 0);
    expect(sum).toBe(4);
  });
  it('one CAPA at D8 has sum = 8', () => {
    const sum = create8DFunnelData([{ currentPhase: 'D8' }]).reduce((a, r) => a + r.count, 0);
    expect(sum).toBe(8);
  });
  it('two CAPAs at D4 and D6 has sum = 4+6 = 10', () => {
    const sum = create8DFunnelData([{ currentPhase: 'D4' }, { currentPhase: 'D6' }])
      .reduce((a, r) => a + r.count, 0);
    expect(sum).toBe(10);
  });
  it('empty input sum = 0', () => {
    expect(create8DFunnelData([]).reduce((a, r) => a + r.count, 0)).toBe(0);
  });
  it('one CAPA at each phase sum = 1+2+3+4+5+6+7+8 = 36', () => {
    const input = PHASES.map(p => ({ currentPhase: p }));
    const sum = create8DFunnelData(input).reduce((a, r) => a + r.count, 0);
    expect(sum).toBe(36);
  });
  it('sum matches expectedCounts helper for complex input', () => {
    const input = [
      { currentPhase: 'D2' },
      { currentPhase: 'D5' },
      { currentPhase: 'D7' },
    ];
    const expected = expectedCounts(input);
    const result = create8DFunnelData(input).map(r => r.count);
    expect(result).toEqual(expected);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// create8DFunnelData — D8 is the terminal phase
// ─────────────────────────────────────────────────────────────────────────────

describe('create8DFunnelData — D8 terminal phase behavior', () => {
  it('D8 count = number of CAPAs at exactly D8', () => {
    const n = 7;
    const input = Array.from({ length: n }, () => ({ currentPhase: 'D8' }));
    expect(create8DFunnelData(input)[7].count).toBe(n);
  });
  it('D8 count = 0 when all CAPAs are at D7', () => {
    const input = Array.from({ length: 5 }, () => ({ currentPhase: 'D7' }));
    expect(create8DFunnelData(input)[7].count).toBe(0);
  });
  it('D1 count = total CAPAs when all are at D8', () => {
    const n = 15;
    const input = Array.from({ length: n }, () => ({ currentPhase: 'D8' }));
    expect(create8DFunnelData(input)[0].count).toBe(n);
  });
  it('D8 count <= D7 count <= D6 count <= ... <= D1 count always', () => {
    const input = [
      { currentPhase: 'D3' },
      { currentPhase: 'D6' },
      { currentPhase: 'D8' },
    ];
    const result = create8DFunnelData(input);
    for (let i = 0; i < 7; i++) {
      expect(result[i].count).toBeGreaterThanOrEqual(result[i + 1].count);
    }
  });
  it('phase name at index 7 is always D8', () => {
    const input = [{ currentPhase: 'D5' }];
    expect(create8DFunnelData(input)[7].phase).toBe('D8');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// create8DFunnelData — D1 is the entry phase
// ─────────────────────────────────────────────────────────────────────────────

describe('create8DFunnelData — D1 entry phase behavior', () => {
  it('D1 count = total number of valid CAPAs', () => {
    const input = [
      { currentPhase: 'D1' },
      { currentPhase: 'D4' },
      { currentPhase: 'D8' },
    ];
    // All 3 have reached D1 (index 0)
    expect(create8DFunnelData(input)[0].count).toBe(3);
  });
  it('D1 count = total CAPAs when all are at known phases', () => {
    const input = PHASES.map(p => ({ currentPhase: p }));
    expect(create8DFunnelData(input)[0].count).toBe(8);
  });
  it('D1 count excludes unknown phases', () => {
    const input = [
      { currentPhase: 'D3' },
      { currentPhase: 'unknown' },
    ];
    expect(create8DFunnelData(input)[0].count).toBe(1);
  });
  it('D1 count is always the maximum count', () => {
    const input = [
      { currentPhase: 'D2' },
      { currentPhase: 'D6' },
    ];
    const result = create8DFunnelData(input);
    const max = Math.max(...result.map(r => r.count));
    expect(result[0].count).toBe(max);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// create8DFunnelData — specific business scenarios
// ─────────────────────────────────────────────────────────────────────────────

describe('create8DFunnelData — business scenarios', () => {
  it('5 new CAPAs all at D1 (just opened)', () => {
    const input = Array.from({ length: 5 }, () => ({ currentPhase: 'D1' }));
    const result = create8DFunnelData(input);
    expect(result[0].count).toBe(5);
    for (let i = 1; i < 8; i++) expect(result[i].count).toBe(0);
  });
  it('5 resolved CAPAs all at D8 (completed)', () => {
    const input = Array.from({ length: 5 }, () => ({ currentPhase: 'D8' }));
    const result = create8DFunnelData(input);
    result.forEach(r => expect(r.count).toBe(5));
  });
  it('funnel shape: more at earlier phases', () => {
    const input = [
      ...Array.from({ length: 10 }, () => ({ currentPhase: 'D1' })),
      ...Array.from({ length: 5 }, () => ({ currentPhase: 'D3' })),
      ...Array.from({ length: 2 }, () => ({ currentPhase: 'D6' })),
      { currentPhase: 'D8' },
    ];
    const result = create8DFunnelData(input);
    expect(result[0].count).toBe(18); // all reach D1
    expect(result[2].count).toBe(8);  // D3, D6, D8 reach D3 = 5+2+1=8
    expect(result[7].count).toBe(1);  // only D8 CAPA
  });
  it('no completed CAPAs → D8 count = 0', () => {
    const input = PHASES.slice(0, 7).map(p => ({ currentPhase: p }));
    expect(create8DFunnelData(input)[7].count).toBe(0);
  });
  it('all CAPAs in investigation phase D2', () => {
    const n = 20;
    const input = Array.from({ length: n }, () => ({ currentPhase: 'D2' }));
    const result = create8DFunnelData(input);
    expect(result[0].count).toBe(20);
    expect(result[1].count).toBe(20);
    for (let i = 2; i < 8; i++) expect(result[i].count).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// create8DFunnelData — helper consistency
// ─────────────────────────────────────────────────────────────────────────────

describe('create8DFunnelData — matches expectedCounts helper', () => {
  const testInputs = [
    [],
    [{ currentPhase: 'D1' }],
    [{ currentPhase: 'D4' }],
    [{ currentPhase: 'D8' }],
    [{ currentPhase: 'D1' }, { currentPhase: 'D8' }],
    [{ currentPhase: 'D3' }, { currentPhase: 'D3' }],
    [{ currentPhase: 'D2' }, { currentPhase: 'D5' }, { currentPhase: 'D7' }],
    PHASES.map(p => ({ currentPhase: p })),
    [{ currentPhase: 'X' }, { currentPhase: 'D4' }],
    [{ currentPhase: 'D6' }, { currentPhase: 'D6' }, { currentPhase: 'D6' }],
  ];

  testInputs.forEach((input, testIdx) => {
    it(`matches expectedCounts for input[${testIdx}]`, () => {
      const expected = expectedCounts(input);
      const result = create8DFunnelData(input).map(r => r.count);
      expect(result).toEqual(expected);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// create8DFunnelData — three-phase combinations (sample)
// ─────────────────────────────────────────────────────────────────────────────

describe('create8DFunnelData — three-phase combinations', () => {
  const threePhaseCombos: Array<[string, string, string]> = [
    ['D1', 'D4', 'D8'],
    ['D2', 'D5', 'D8'],
    ['D1', 'D2', 'D3'],
    ['D3', 'D5', 'D7'],
    ['D4', 'D6', 'D8'],
    ['D1', 'D3', 'D5'],
    ['D2', 'D4', 'D6'],
    ['D1', 'D6', 'D8'],
  ];

  threePhaseCombos.forEach(([p1, p2, p3]) => {
    describe(`CAPAs at ${p1}+${p2}+${p3}`, () => {
      const input = [{ currentPhase: p1 }, { currentPhase: p2 }, { currentPhase: p3 }];
      const expected = expectedCounts(input);
      PHASES.forEach((targetPhase, targetIdx) => {
        it(`${targetPhase} count = ${expected[targetIdx]}`, () => {
          expect(create8DFunnelData(input)[targetIdx].count).toBe(expected[targetIdx]);
        });
      });
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// create8DFunnelData — three CAPAs per phase
// ─────────────────────────────────────────────────────────────────────────────

describe('create8DFunnelData — three CAPAs per phase', () => {
  PHASES.forEach((inputPhase, inputIdx) => {
    describe(`three CAPAs at ${inputPhase}`, () => {
      const result = create8DFunnelData([
        { currentPhase: inputPhase },
        { currentPhase: inputPhase },
        { currentPhase: inputPhase },
      ]);
      PHASES.forEach((targetPhase, targetIdx) => {
        const expected = targetIdx <= inputIdx ? 3 : 0;
        it(`${targetPhase} count = ${expected}`, () => {
          expect(result[targetIdx].count).toBe(expected);
        });
      });
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// create8DFunnelData — five CAPAs per phase
// ─────────────────────────────────────────────────────────────────────────────

describe('create8DFunnelData — five CAPAs per phase', () => {
  PHASES.forEach((inputPhase, inputIdx) => {
    describe(`five CAPAs at ${inputPhase}`, () => {
      const result = create8DFunnelData(
        Array.from({ length: 5 }, () => ({ currentPhase: inputPhase }))
      );
      PHASES.forEach((targetPhase, targetIdx) => {
        const expected = targetIdx <= inputIdx ? 5 : 0;
        it(`${targetPhase} count = ${expected}`, () => {
          expect(result[targetIdx].count).toBe(expected);
        });
      });
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// createEmpty6MFishbone — extended property validation
// ─────────────────────────────────────────────────────────────────────────────

describe('createEmpty6MFishbone — name string properties', () => {
  EXPECTED_NAMES.forEach((name, i) => {
    it(`element [${i}].name starts with uppercase`, () => {
      const n = createEmpty6MFishbone()[i].name;
      expect(n[0]).toBe(n[0].toUpperCase());
    });
    it(`element [${i}].name contains no digits`, () => {
      expect(createEmpty6MFishbone()[i].name).toMatch(/^[^0-9]+$/);
    });
    it(`element [${i}].name length is >= 5`, () => {
      expect(createEmpty6MFishbone()[i].name.length).toBeGreaterThanOrEqual(5);
    });
    it(`element [${i}].name length is <= 15`, () => {
      expect(createEmpty6MFishbone()[i].name.length).toBeLessThanOrEqual(15);
    });
  });
});

describe('createEmpty6MFishbone — color hex format', () => {
  EXPECTED_COLORS.forEach((color, i) => {
    it(`element [${i}].color uppercase hex digits`, () => {
      const hex = createEmpty6MFishbone()[i].color.slice(1);
      expect(hex).toBe(hex.toUpperCase());
    });
    it(`element [${i}].color is not lowercase hex`, () => {
      expect(createEmpty6MFishbone()[i].color).not.toMatch(/[a-z]/);
    });
    it(`element [${i}].color slice(1) has length 6`, () => {
      expect(createEmpty6MFishbone()[i].color.slice(1)).toHaveLength(6);
    });
  });
});

describe('createEmpty6MFishbone — causes is definitely empty', () => {
  EXPECTED_NAMES.forEach((_, i) => {
    it(`element [${i}].causes !== undefined`, () => {
      expect(createEmpty6MFishbone()[i].causes).not.toBeUndefined();
    });
    it(`element [${i}].causes[0] is undefined (no first item)`, () => {
      expect(createEmpty6MFishbone()[i].causes[0]).toBeUndefined();
    });
  });
  it('reducing causes lengths sum to 0', () => {
    const sum = createEmpty6MFishbone().reduce((acc, c) => acc + c.causes.length, 0);
    expect(sum).toBe(0);
  });
  it('every causes array passes Array.isArray', () => {
    expect(createEmpty6MFishbone().every(c => Array.isArray(c.causes))).toBe(true);
  });
  it('every causes array has falsy length', () => {
    expect(createEmpty6MFishbone().every(c => !c.causes.length)).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// create8DFunnelData — count non-negative invariant
// ─────────────────────────────────────────────────────────────────────────────

describe('create8DFunnelData — counts are always non-negative', () => {
  const testCases = [
    [],
    [{ currentPhase: 'D1' }],
    [{ currentPhase: 'D8' }],
    [{ currentPhase: 'unknown' }],
    PHASES.map(p => ({ currentPhase: p })),
    Array.from({ length: 50 }, () => ({ currentPhase: 'D3' })),
    [{ currentPhase: '' }, { currentPhase: 'D5' }],
  ];

  testCases.forEach((input, ti) => {
    it(`input[${ti}]: all 8 counts >= 0`, () => {
      create8DFunnelData(input).forEach(r => expect(r.count).toBeGreaterThanOrEqual(0));
    });
    it(`input[${ti}]: no count is NaN`, () => {
      create8DFunnelData(input).forEach(r => expect(isNaN(r.count)).toBe(false));
    });
    it(`input[${ti}]: no count is Infinity`, () => {
      create8DFunnelData(input).forEach(r => expect(isFinite(r.count)).toBe(true));
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// create8DFunnelData — phase label correctness (explicit per-index)
// ─────────────────────────────────────────────────────────────────────────────

describe('create8DFunnelData — phase labels are correct regardless of input', () => {
  const inputs = [
    [],
    [{ currentPhase: 'D4' }],
    PHASES.map(p => ({ currentPhase: p })),
  ];

  inputs.forEach((input, ti) => {
    PHASES.forEach((phase, idx) => {
      it(`input[${ti}] result[${idx}].phase === '${phase}'`, () => {
        expect(create8DFunnelData(input)[idx].phase).toBe(phase);
      });
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// createEmpty6MFishbone — final sanity checks
// ─────────────────────────────────────────────────────────────────────────────

describe('createEmpty6MFishbone — findIndex sanity', () => {
  it('findIndex Manpower returns 0', () => expect(createEmpty6MFishbone().findIndex(c => c.name === 'Manpower')).toBe(0));
  it('findIndex Methods returns 1', () => expect(createEmpty6MFishbone().findIndex(c => c.name === 'Methods')).toBe(1));
  it('findIndex Materials returns 2', () => expect(createEmpty6MFishbone().findIndex(c => c.name === 'Materials')).toBe(2));
  it('findIndex Machines returns 3', () => expect(createEmpty6MFishbone().findIndex(c => c.name === 'Machines')).toBe(3));
  it('findIndex Measurement returns 4', () => expect(createEmpty6MFishbone().findIndex(c => c.name === 'Measurement')).toBe(4));
  it('findIndex Environment returns 5', () => expect(createEmpty6MFishbone().findIndex(c => c.name === 'Environment')).toBe(5));
  it('findIndex of unknown name returns -1', () => expect(createEmpty6MFishbone().findIndex(c => c.name === 'Personnel')).toBe(-1));
  it('every name can be found', () => {
    EXPECTED_NAMES.forEach(name => {
      expect(createEmpty6MFishbone().findIndex(c => c.name === name)).toBeGreaterThanOrEqual(0);
    });
  });
  it('map of names equals EXPECTED_NAMES', () => {
    expect(createEmpty6MFishbone().map(c => c.name)).toEqual(EXPECTED_NAMES);
  });
});
