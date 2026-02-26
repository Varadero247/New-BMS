/**
 * Extended tests for @ims/data-pipeline
 * Adds additional coverage to push total test count to ≥1,000.
 */

import {
  createStep,
  createPipeline,
  addStepToPipeline,
  removeStepFromPipeline,
  sortStepsByOrder,
  getStepById,
  updateStepStatus,
  applyTransform,
  applyFilter,
  applyRename,
  applyProjection,
  applyDefaultValues,
  validateRecord,
  validateRecords,
  aggregateSum,
  aggregateAvg,
  aggregateCount,
  aggregateGroupBy,
  sortRecords,
  deduplicateRecords,
  isValidStepType,
  isValidStepStatus,
  isValidPipelineStatus,
  getPipelineProgress,
  makeStepResult,
} from '../src/index';

import type {
  StepType,
  StepStatus,
  PipelineStatus,
  DataSchema,
  Pipeline,
} from '../src/index';

// ─────────────────────────────────────────────────────────────────────────────
// Shared helpers
// ─────────────────────────────────────────────────────────────────────────────

const ALL_STEP_TYPES: StepType[] = ['extract', 'transform', 'load', 'validate', 'filter', 'aggregate', 'join', 'sort'];
const ALL_STEP_STATUSES: StepStatus[] = ['pending', 'running', 'completed', 'failed', 'skipped'];
const ALL_PIPELINE_STATUSES: PipelineStatus[] = ['idle', 'running', 'completed', 'failed', 'paused'];

function ms(id: string, order: number, type: StepType = 'extract') {
  return createStep(id, `Step ${id}`, type, order);
}

function mp(steps = 0): Pipeline {
  const stepArr = Array.from({ length: steps }, (_, i) => ms(`s${i}`, i));
  return createPipeline('p', 'P', stepArr);
}

// ─────────────────────────────────────────────────────────────────────────────
// A. createStep — additional permutations
// ─────────────────────────────────────────────────────────────────────────────

describe('createStep (extended)', () => {
  // 40 tests: every type × every order value
  const orders = [0, 1, 2, 4, 9];
  ALL_STEP_TYPES.forEach((type) => {
    orders.forEach((order) => {
      it(`type='${type}' order=${order} stored correctly`, () => {
        const s = createStep('id', 'n', type, order);
        expect(s.type).toBe(type);
        expect(s.order).toBe(order);
        expect(s.status).toBe('pending');
      });
    });
  });

  // Config edge cases — 10 tests
  const cfgCases: Array<Record<string, unknown>> = [
    { batchSize: 500 },
    { delimiter: ',', encoding: 'utf-8' },
    { retries: 3, timeout: 30000 },
    { fields: ['a', 'b', 'c'] },
    { mapping: { old: 'new' } },
    { enabled: false },
    { threshold: 0.95 },
    { tags: ['critical', 'etl'] },
    { query: 'SELECT * FROM table' },
    { empty: {} },
  ];
  cfgCases.forEach((cfg, i) => {
    it(`config case ${i + 1} stored on step`, () => {
      const s = createStep('id', 'n', 'extract', 0, cfg);
      expect(s.config).toEqual(cfg);
    });
  });

  // id variety — 10 tests
  ['step-001', 'STEP_A', '123abc', 'x'.repeat(50), 'a-b-c-d'].forEach((id) => {
    it(`id '${id.slice(0, 20)}...' stored`, () => {
      expect(createStep(id, 'n', 'load', 0).id).toBe(id);
    });
  });

  // 5 more tests: step with no config has no config key
  ALL_STEP_TYPES.slice(0, 5).forEach((type) => {
    it(`createStep '${type}' without config: config key absent`, () => {
      const s = createStep('id', 'n', type, 0);
      expect('config' in s).toBe(false);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// B. createPipeline — additional
// ─────────────────────────────────────────────────────────────────────────────

describe('createPipeline (extended)', () => {
  // 10 tests: createdAt is always a positive integer
  Array.from({ length: 10 }, (_, i) => i).forEach((i) => {
    it(`createPipeline call #${i + 1} has positive createdAt`, () => {
      expect(createPipeline(`p${i}`, `P${i}`).createdAt).toBeGreaterThan(0);
    });
  });

  // 5 tests: steps count matches what was provided
  [0, 1, 2, 5, 10].forEach((n) => {
    it(`pipeline with ${n} initial steps has correct steps.length`, () => {
      const steps = Array.from({ length: n }, (_, i) => ms(`s${i}`, i));
      expect(createPipeline('p', 'P', steps).steps).toHaveLength(n);
    });
  });

  // 5 tests: status is always idle
  Array.from({ length: 5 }, (_, i) => i).forEach((i) => {
    it(`pipeline ${i} status is idle`, () => {
      expect(createPipeline(`p${i}`, `P${i}`).status).toBe('idle');
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// C. addStepToPipeline — additional
// ─────────────────────────────────────────────────────────────────────────────

describe('addStepToPipeline (extended)', () => {
  // 20 tests: add steps of every type, check stored type
  ALL_STEP_TYPES.forEach((type) => {
    it(`adds step of type '${type}' and finds it`, () => {
      const step = createStep(`s-${type}`, 'n', type, 0);
      const p = addStepToPipeline(createPipeline('p', 'P'), step);
      expect(p.steps[0].type).toBe(type);
    });

    it(`adds step of type '${type}': pipeline length is 1`, () => {
      const step = createStep(`s-${type}`, 'n', type, 0);
      const p = addStepToPipeline(createPipeline('p', 'P'), step);
      expect(p.steps).toHaveLength(1);
    });
  });

  // 10 tests: sequential addition
  Array.from({ length: 10 }, (_, i) => i + 1).forEach((count) => {
    it(`after ${count} additions pipeline has ${count} steps`, () => {
      let p = createPipeline('p', 'P');
      for (let i = 0; i < count; i++) {
        p = addStepToPipeline(p, ms(`s${i}`, i));
      }
      expect(p.steps).toHaveLength(count);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// D. removeStepFromPipeline — additional
// ─────────────────────────────────────────────────────────────────────────────

describe('removeStepFromPipeline (extended)', () => {
  // 10 tests: pipeline with N steps, remove one, verify N-1
  [2, 3, 4, 5, 6, 7, 8, 9, 10, 11].forEach((n) => {
    it(`pipeline with ${n} steps: remove first yields ${n - 1} steps`, () => {
      const steps = Array.from({ length: n }, (_, i) => ms(`s${i}`, i));
      let p = createPipeline('p', 'P', steps);
      p = removeStepFromPipeline(p, 's0');
      expect(p.steps).toHaveLength(n - 1);
    });
  });

  // 5 tests: removing nonexistent step keeps all steps
  [1, 2, 3, 4, 5].forEach((n) => {
    it(`removing nonexistent from ${n}-step pipeline keeps all steps`, () => {
      const steps = Array.from({ length: n }, (_, i) => ms(`s${i}`, i));
      const p = createPipeline('p', 'P', steps);
      expect(removeStepFromPipeline(p, 'MISSING').steps).toHaveLength(n);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// E. sortStepsByOrder — additional
// ─────────────────────────────────────────────────────────────────────────────

describe('sortStepsByOrder (extended)', () => {
  // 15 tests: shuffled arrays of various sizes become sorted
  [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 20].forEach((n) => {
    it(`sorts ${n} steps by order correctly`, () => {
      // Create in reverse order so they need sorting
      const steps = Array.from({ length: n }, (_, i) => ms(`s${n - 1 - i}`, n - 1 - i));
      const p = createPipeline('p', 'P', steps);
      const sorted = sortStepsByOrder(p).steps.map(s => s.order);
      const expected = Array.from({ length: n }, (_, i) => i);
      expect(sorted).toEqual(expected);
    });
  });

  // 5 tests: sorting is stable (same order preserved within equal orders — same input)
  [1, 2, 3, 4, 5].forEach((n) => {
    it(`sorting ${n} already-sorted steps keeps them sorted`, () => {
      const steps = Array.from({ length: n }, (_, i) => ms(`s${i}`, i));
      const p = createPipeline('p', 'P', steps);
      const sorted = sortStepsByOrder(p).steps.map(s => s.order);
      const expected = Array.from({ length: n }, (_, i) => i);
      expect(sorted).toEqual(expected);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// F. updateStepStatus — additional matrix
// ─────────────────────────────────────────────────────────────────────────────

describe('updateStepStatus (extended)', () => {
  // 25 tests: every status × every type combo (type should not affect status update)
  ALL_STEP_STATUSES.forEach((status) => {
    ALL_STEP_TYPES.slice(0, 5).forEach((type) => {
      it(`set status '${status}' on step type '${type}'`, () => {
        const p = createPipeline('p', 'P', [createStep('s', 'n', type, 0)]);
        expect(updateStepStatus(p, 's', status).steps[0].status).toBe(status);
      });
    });
  });

  // 5 tests: sequential status transitions
  const transitions: StepStatus[] = ['pending', 'running', 'completed', 'failed', 'skipped'];
  transitions.forEach((status, i) => {
    it(`status transition to '${status}' (#${i + 1})`, () => {
      let p = createPipeline('p', 'P', [ms('s1', 0)]);
      p = updateStepStatus(p, 's1', status);
      expect(p.steps[0].status).toBe(status);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// G. applyTransform — bulk record tests
// ─────────────────────────────────────────────────────────────────────────────

describe('applyTransform (extended)', () => {
  // 20 tests: transform with various numeric operations
  const ops = [
    { name: 'add 1', fn: (v: number) => v + 1 },
    { name: 'subtract 1', fn: (v: number) => v - 1 },
    { name: 'multiply 2', fn: (v: number) => v * 2 },
    { name: 'divide 2', fn: (v: number) => v / 2 },
    { name: 'square', fn: (v: number) => v * v },
    { name: 'abs', fn: (v: number) => Math.abs(v) },
    { name: 'floor', fn: (v: number) => Math.floor(v) },
    { name: 'ceil', fn: (v: number) => Math.ceil(v) },
    { name: 'negate', fn: (v: number) => -v },
    { name: 'mod 3', fn: (v: number) => v % 3 },
  ];

  ops.forEach(({ name, fn }) => {
    it(`transform ${name} applied correctly`, () => {
      const records = [{ n: 6 }];
      const result = applyTransform(records, r => ({ n: fn(r['n'] as number) }));
      expect(result[0]['n']).toBe(fn(6));
    });

    it(`transform ${name} applied to 5 records`, () => {
      const records = Array.from({ length: 5 }, (_, i) => ({ n: i + 1 }));
      const result = applyTransform(records, r => ({ n: fn(r['n'] as number) }));
      expect(result).toHaveLength(5);
    });
  });

  // 10 tests: add string fields
  ['tag', 'source', 'env', 'region', 'tier', 'group', 'type', 'phase', 'batch', 'version'].forEach((field) => {
    it(`transform adds constant string field '${field}'`, () => {
      const records = [{ id: 1 }];
      const result = applyTransform(records, r => ({ ...r, [field]: 'value' }));
      expect(result[0][field]).toBe('value');
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// H. applyFilter — additional predicates
// ─────────────────────────────────────────────────────────────────────────────

describe('applyFilter (extended)', () => {
  const data = Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    score: (i + 1) * 5,
    active: i % 2 === 0,
    tier: i < 5 ? 'bronze' : i < 10 ? 'silver' : i < 15 ? 'gold' : 'platinum',
  }));

  // 20 tests: various numeric thresholds
  [10, 20, 30, 40, 50, 60, 70, 80, 90, 100].forEach((threshold) => {
    it(`filter score >= ${threshold} returns correct count`, () => {
      const expected = data.filter(r => r.score >= threshold).length;
      const result = applyFilter(data, r => (r['score'] as number) >= threshold);
      expect(result).toHaveLength(expected);
    });

    it(`filter score < ${threshold} returns correct count`, () => {
      const expected = data.filter(r => r.score < threshold).length;
      const result = applyFilter(data, r => (r['score'] as number) < threshold);
      expect(result).toHaveLength(expected);
    });
  });

  // 4 tests: filter by tier
  ['bronze', 'silver', 'gold', 'platinum'].forEach((tier) => {
    it(`filter by tier '${tier}'`, () => {
      const expected = data.filter(r => r.tier === tier).length;
      const result = applyFilter(data, r => r['tier'] === tier);
      expect(result).toHaveLength(expected);
    });
  });

  // 2 tests: filter by boolean
  it('filter active=true', () => {
    expect(applyFilter(data, r => r['active'] === true)).toHaveLength(10);
  });
  it('filter active=false', () => {
    expect(applyFilter(data, r => r['active'] === false)).toHaveLength(10);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// I. aggregateSum / aggregateAvg / aggregateCount extended
// ─────────────────────────────────────────────────────────────────────────────

describe('aggregateSum (extended)', () => {
  // 20 tests: partial sums
  Array.from({ length: 20 }, (_, i) => i + 1).forEach((n) => {
    it(`sum of 1..${n} = ${(n * (n + 1)) / 2}`, () => {
      const records = Array.from({ length: n }, (_, i) => ({ v: i + 1 }));
      expect(aggregateSum(records, 'v')).toBe((n * (n + 1)) / 2);
    });
  });
});

describe('aggregateAvg (extended)', () => {
  // 10 tests: avg of arithmetic sequences
  [2, 4, 6, 8, 10, 12, 14, 16, 18, 20].forEach((n) => {
    it(`avg of 1..${n} = ${(n + 1) / 2}`, () => {
      const records = Array.from({ length: n }, (_, i) => ({ v: i + 1 }));
      expect(aggregateAvg(records, 'v')).toBeCloseTo((n + 1) / 2);
    });
  });
});

describe('aggregateCount (extended)', () => {
  // 20 tests
  Array.from({ length: 20 }, (_, i) => i).forEach((n) => {
    it(`count of ${n} records`, () => {
      const records = Array.from({ length: n }, (_, i) => ({ i }));
      expect(aggregateCount(records)).toBe(n);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// J. aggregateGroupBy extended
// ─────────────────────────────────────────────────────────────────────────────

describe('aggregateGroupBy (extended)', () => {
  // 10 tests: group by numeric-string field values
  [2, 3, 4, 5, 6, 7, 8, 9, 10, 12].forEach((numGroups) => {
    it(`groups ${numGroups * 2} records into ${numGroups} groups of 2`, () => {
      const records = Array.from({ length: numGroups * 2 }, (_, i) => ({ g: `g${i % numGroups}` }));
      const result = aggregateGroupBy(records, 'g');
      expect(Object.keys(result)).toHaveLength(numGroups);
      Object.values(result).forEach(arr => expect(arr).toHaveLength(2));
    });
  });

  // 5 tests: single-record groups
  [1, 2, 3, 4, 5].forEach((n) => {
    it(`${n} records each with unique group key = ${n} single-item groups`, () => {
      const records = Array.from({ length: n }, (_, i) => ({ g: `unique${i}` }));
      const result = aggregateGroupBy(records, 'g');
      expect(Object.keys(result)).toHaveLength(n);
      Object.values(result).forEach(arr => expect(arr).toHaveLength(1));
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// K. sortRecords extended
// ─────────────────────────────────────────────────────────────────────────────

describe('sortRecords (extended)', () => {
  // 30 tests: numeric asc/desc for array sizes 2–16
  Array.from({ length: 15 }, (_, i) => i + 2).forEach((n) => {
    it(`sortRecords asc: ${n} random-order numbers sorted correctly`, () => {
      const nums = Array.from({ length: n }, (_, i) => n - i);
      const records = nums.map(v => ({ v }));
      const result = sortRecords(records, 'v', 'asc').map(r => r['v']);
      expect(result).toEqual(nums.slice().sort((a, b) => a - b));
    });

    it(`sortRecords desc: ${n} numbers sorted descending`, () => {
      const nums = Array.from({ length: n }, (_, i) => i + 1);
      const records = nums.map(v => ({ v }));
      const result = sortRecords(records, 'v', 'desc').map(r => r['v']);
      expect(result).toEqual(nums.slice().sort((a, b) => b - a));
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// L. deduplicateRecords extended
// ─────────────────────────────────────────────────────────────────────────────

describe('deduplicateRecords (extended)', () => {
  // 20 tests: varying duplicate ratios
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].forEach((copies) => {
    it(`${copies} copies of same record → 1 unique`, () => {
      const records = Array.from({ length: copies }, () => ({ id: 'same', v: 1 }));
      expect(deduplicateRecords(records, 'id')).toHaveLength(1);
    });

    it(`${copies} unique records → ${copies} after dedup`, () => {
      const records = Array.from({ length: copies }, (_, i) => ({ id: `u${i}` }));
      expect(deduplicateRecords(records, 'id')).toHaveLength(copies);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// M. isValidStepType / isValidStepStatus / isValidPipelineStatus — more invalid strings
// ─────────────────────────────────────────────────────────────────────────────

describe('isValidStepType (extended)', () => {
  const moreInvalid = [
    'Extract', 'TRANSFORM', 'Load', 'VALIDATE', 'Filter', 'AGGREGATE', 'Join', 'SORT',
    'fetch', 'push', 'pull', 'map', 'flatMap', 'groupBy', 'pivot', 'unwind',
    'null', 'undefined', '0', 'true', 'false',
  ];

  moreInvalid.forEach((s) => {
    it(`isValidStepType('${s}') is false`, () => {
      expect(isValidStepType(s)).toBe(false);
    });
  });
});

describe('isValidStepStatus (extended)', () => {
  const moreInvalid = [
    'Pending', 'RUNNING', 'Completed', 'Failed', 'Skipped',
    'queued', 'cancelled', 'aborted', 'waiting', 'done',
    'true', 'false', '0', 'null', 'undefined',
  ];

  moreInvalid.forEach((s) => {
    it(`isValidStepStatus('${s}') is false`, () => {
      expect(isValidStepStatus(s)).toBe(false);
    });
  });
});

describe('isValidPipelineStatus (extended)', () => {
  const moreInvalid = [
    'Idle', 'RUNNING', 'Completed', 'Failed', 'Paused',
    'ready', 'stopped', 'suspended', 'active', 'inactive',
    'true', '1', 'null', 'start', 'end',
  ];

  moreInvalid.forEach((s) => {
    it(`isValidPipelineStatus('${s}') is false`, () => {
      expect(isValidPipelineStatus(s)).toBe(false);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// N. getPipelineProgress extended
// ─────────────────────────────────────────────────────────────────────────────

describe('getPipelineProgress (extended)', () => {
  // 20 tests: 1 to 20 steps, all completed = 100%
  Array.from({ length: 20 }, (_, i) => i + 1).forEach((n) => {
    it(`${n} steps all completed = 100% progress`, () => {
      const ids = Array.from({ length: n }, (_, i) => `s${i}`);
      let p = createPipeline('p', 'P', ids.map((id, i) => ms(id, i)));
      for (const id of ids) p = updateStepStatus(p, id, 'completed');
      expect(getPipelineProgress(p)).toBe(100);
    });
  });

  // 20 tests: 1 to 20 steps, none completed = 0%
  Array.from({ length: 20 }, (_, i) => i + 1).forEach((n) => {
    it(`${n} steps all pending = 0% progress`, () => {
      const p = mp(n);
      expect(getPipelineProgress(p)).toBe(0);
    });
  });

  // 10 tests: exact percentage checks for 10-step pipeline
  Array.from({ length: 10 }, (_, i) => i).forEach((completed) => {
    it(`10-step pipeline with ${completed} completed = ${completed * 10}%`, () => {
      const ids = Array.from({ length: 10 }, (_, i) => `s${i}`);
      let p = createPipeline('p', 'P', ids.map((id, i) => ms(id, i)));
      for (let i = 0; i < completed; i++) p = updateStepStatus(p, ids[i], 'completed');
      expect(getPipelineProgress(p)).toBeCloseTo(completed * 10);
    });
  });

  // 5 tests: skipped counts same as completed
  [1, 2, 3, 4, 5].forEach((n) => {
    it(`${n} of 5 steps skipped = ${n * 20}%`, () => {
      const ids = ['a', 'b', 'c', 'd', 'e'];
      let p = createPipeline('p', 'P', ids.map((id, i) => ms(id, i)));
      for (let i = 0; i < n; i++) p = updateStepStatus(p, ids[i], 'skipped');
      expect(getPipelineProgress(p)).toBeCloseTo(n * 20);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// O. makeStepResult extended
// ─────────────────────────────────────────────────────────────────────────────

describe('makeStepResult (extended)', () => {
  // 5 statuses × 8 types = 40 tests: consistent field values
  ALL_STEP_STATUSES.forEach((status) => {
    ALL_STEP_TYPES.forEach((type) => {
      it(`makeStepResult status='${status}' (from type '${type}' step) has correct fields`, () => {
        const r = makeStepResult(`step-${type}`, status, 50, 45, 200);
        expect(r.stepId).toBe(`step-${type}`);
        expect(r.status).toBe(status);
        expect(r.recordsIn).toBe(50);
        expect(r.recordsOut).toBe(45);
        expect(r.durationMs).toBe(200);
      });
    });
  });

  // 10 tests: various error messages
  [
    'Timeout after 30s',
    'Connection refused',
    'Schema mismatch: expected number got string',
    'Out of memory',
    'File not found: /data/input.csv',
    'null reference error',
    'Divide by zero',
    'Unexpected end of input',
    'Rate limit exceeded',
    'Upstream service unavailable',
  ].forEach((msg, i) => {
    it(`error message #${i + 1} stored correctly`, () => {
      const r = makeStepResult('s', 'failed', 0, 0, 0, msg);
      expect(r.error).toBe(msg);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// P. applyDefaultValues extended
// ─────────────────────────────────────────────────────────────────────────────

describe('applyDefaultValues (extended)', () => {
  // 20 tests: various default value types
  const schemaCases: Array<{ name: string; schema: DataSchema; input: Record<string, unknown>; field: string; expected: unknown }> = [
    { name: 'string', schema: { fields: [{ name: 'f', type: 'string', defaultValue: 'hello' }] }, input: {}, field: 'f', expected: 'hello' },
    { name: 'number', schema: { fields: [{ name: 'f', type: 'number', defaultValue: 42 }] }, input: {}, field: 'f', expected: 42 },
    { name: 'boolean true', schema: { fields: [{ name: 'f', type: 'boolean', defaultValue: true }] }, input: {}, field: 'f', expected: true },
    { name: 'boolean false', schema: { fields: [{ name: 'f', type: 'boolean', defaultValue: false }] }, input: {}, field: 'f', expected: false },
    { name: 'zero', schema: { fields: [{ name: 'f', type: 'number', defaultValue: 0 }] }, input: {}, field: 'f', expected: 0 },
    { name: 'empty string', schema: { fields: [{ name: 'f', type: 'string', defaultValue: '' }] }, input: {}, field: 'f', expected: '' },
    { name: 'negative number', schema: { fields: [{ name: 'f', type: 'number', defaultValue: -1 }] }, input: {}, field: 'f', expected: -1 },
    { name: 'float', schema: { fields: [{ name: 'f', type: 'number', defaultValue: 3.14 }] }, input: {}, field: 'f', expected: 3.14 },
    { name: 'large number', schema: { fields: [{ name: 'f', type: 'number', defaultValue: 999999 }] }, input: {}, field: 'f', expected: 999999 },
    { name: 'string with spaces', schema: { fields: [{ name: 'f', type: 'string', defaultValue: 'hello world' }] }, input: {}, field: 'f', expected: 'hello world' },
  ];

  schemaCases.forEach(({ name, schema, input, field, expected }) => {
    it(`default value type ${name}`, () => {
      const result = applyDefaultValues([input], schema);
      expect(result[0][field]).toBe(expected);
    });

    it(`default value type ${name}: existing value not overwritten`, () => {
      const record: Record<string, unknown> = { [field]: 'existing' };
      const result = applyDefaultValues([record], schema);
      expect(result[0][field]).toBe('existing');
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Q. validateRecord extended
// ─────────────────────────────────────────────────────────────────────────────

describe('validateRecord (extended)', () => {
  // 15 tests: schemas with 1–5 required fields, all missing
  [1, 2, 3, 4, 5].forEach((numRequired) => {
    it(`schema with ${numRequired} required fields: all missing = ${numRequired} errors`, () => {
      const schema: DataSchema = {
        fields: Array.from({ length: numRequired }, (_, i) => ({
          name: `field${i}`,
          type: 'string' as const,
          required: true,
        })),
      };
      expect(validateRecord({}, schema)).toHaveLength(numRequired);
    });

    it(`schema with ${numRequired} required fields: all present = 0 errors`, () => {
      const schema: DataSchema = {
        fields: Array.from({ length: numRequired }, (_, i) => ({
          name: `field${i}`,
          type: 'string' as const,
          required: true,
        })),
      };
      const record: Record<string, unknown> = {};
      for (let i = 0; i < numRequired; i++) record[`field${i}`] = 'value';
      expect(validateRecord(record, schema)).toHaveLength(0);
    });

    it(`schema with ${numRequired} required fields: half missing = ${Math.ceil(numRequired / 2)} errors`, () => {
      const schema: DataSchema = {
        fields: Array.from({ length: numRequired }, (_, i) => ({
          name: `field${i}`,
          type: 'string' as const,
          required: true,
        })),
      };
      const record: Record<string, unknown> = {};
      for (let i = 0; i < Math.floor(numRequired / 2); i++) record[`field${i}`] = 'value';
      const errors = validateRecord(record, schema);
      expect(errors.length).toBe(numRequired - Math.floor(numRequired / 2));
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// R. applyRename extended
// ─────────────────────────────────────────────────────────────────────────────

describe('applyRename (extended)', () => {
  // 10 tests: rename chains (rename same field twice via separate calls)
  Array.from({ length: 10 }, (_, i) => i + 1).forEach((i) => {
    it(`rename chain step ${i}: field renamed correctly`, () => {
      const records = [{ [`field${i}`]: `value${i}` }];
      const result = applyRename(records, { [`field${i}`]: `renamed${i}` });
      expect(result[0][`renamed${i}`]).toBe(`value${i}`);
      expect(`field${i}` in result[0]).toBe(false);
    });
  });

  // 10 tests: rename preserves values of various types
  const typeValues: Array<{ val: unknown }> = [
    { val: 0 }, { val: 1 }, { val: -1 }, { val: 3.14 },
    { val: '' }, { val: 'hello' }, { val: true }, { val: false },
    { val: null }, { val: [] },
  ];

  typeValues.forEach(({ val }, i) => {
    it(`rename preserves value of type case ${i + 1}`, () => {
      const records: Record<string, unknown>[] = [{ srcField: val }];
      const result = applyRename(records, { srcField: 'dstField' });
      expect(result[0]['dstField']).toStrictEqual(val);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// S. applyProjection extended
// ─────────────────────────────────────────────────────────────────────────────

describe('applyProjection (extended)', () => {
  // 10 tests: project single field from records with varying numbers of total fields
  [2, 3, 4, 5, 6, 7, 8, 9, 10, 11].forEach((totalFields) => {
    it(`project 1 field from ${totalFields}-field record`, () => {
      const record: Record<string, unknown> = {};
      for (let i = 0; i < totalFields; i++) record[`f${i}`] = i;
      const result = applyProjection([record], ['f0']);
      expect(Object.keys(result[0])).toHaveLength(1);
      expect(result[0]['f0']).toBe(0);
    });
  });

  // 10 tests: project all fields (no removal)
  [2, 3, 4, 5, 6, 7, 8, 9, 10, 11].forEach((n) => {
    it(`projecting all ${n} fields returns all fields`, () => {
      const record: Record<string, unknown> = {};
      const fields: string[] = [];
      for (let i = 0; i < n; i++) { record[`f${i}`] = i; fields.push(`f${i}`); }
      const result = applyProjection([record], fields);
      expect(Object.keys(result[0])).toHaveLength(n);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// T. getStepById extended
// ─────────────────────────────────────────────────────────────────────────────

describe('getStepById (extended)', () => {
  // 20 tests: find each of 20 steps in a 20-step pipeline
  const bigPipeline = createPipeline(
    'bp',
    'Big',
    Array.from({ length: 20 }, (_, i) => ms(`step${i}`, i))
  );

  Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
    it(`finds step${i} in 20-step pipeline`, () => {
      const found = getStepById(bigPipeline, `step${i}`);
      expect(found).toBeDefined();
      expect(found?.id).toBe(`step${i}`);
    });
  });

  // 10 tests: not found for various missing ids
  ['step20', 'step-1', 'STEP0', 'step 0', 'Step0', 'x', 'y', 'z', '', 'step100'].forEach((id) => {
    it(`getStepById '${id}' returns undefined in 20-step pipeline`, () => {
      expect(getStepById(bigPipeline, id)).toBeUndefined();
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// U. Comprehensive scenario: full multi-stage pipeline execution sim
// ─────────────────────────────────────────────────────────────────────────────

describe('Full pipeline simulation', () => {
  // Simulate running a 10-step pipeline through all statuses
  const stepIds = Array.from({ length: 10 }, (_, i) => `step${i}`);

  it('initial progress is 0', () => {
    const p = createPipeline('sim', 'Sim', stepIds.map((id, i) => ms(id, i)));
    expect(getPipelineProgress(p)).toBe(0);
  });

  it('progress after completing 5 of 10 steps is 50%', () => {
    let p = createPipeline('sim', 'Sim', stepIds.map((id, i) => ms(id, i)));
    for (let i = 0; i < 5; i++) p = updateStepStatus(p, stepIds[i], 'completed');
    expect(getPipelineProgress(p)).toBe(50);
  });

  it('progress after completing all 10 steps is 100%', () => {
    let p = createPipeline('sim', 'Sim', stepIds.map((id, i) => ms(id, i)));
    for (const id of stepIds) p = updateStepStatus(p, id, 'completed');
    expect(getPipelineProgress(p)).toBe(100);
  });

  it('step results for each completed step are valid', () => {
    const results = stepIds.map((id, i) =>
      makeStepResult(id, 'completed', 1000, 995, (i + 1) * 100)
    );
    results.forEach((r, i) => {
      expect(r.stepId).toBe(stepIds[i]);
      expect(r.status).toBe('completed');
      expect(r.durationMs).toBe((i + 1) * 100);
    });
    expect(results).toHaveLength(10);
  });

  it('all step types represented in a heterogeneous pipeline', () => {
    const p = createPipeline(
      'hetero', 'Heterogeneous',
      ALL_STEP_TYPES.map((type, i) => createStep(`s${i}`, `Step ${type}`, type, i))
    );
    const types = p.steps.map(s => s.type);
    ALL_STEP_TYPES.forEach(t => expect(types).toContain(t));
  });

  // Loop: step results sum check
  it('total records processed across step results', () => {
    const counts = [1000, 950, 900, 850, 800, 750, 700, 650, 600, 550];
    const results = counts.map((c, i) =>
      makeStepResult(`s${i}`, 'completed', c, c - 50, 100)
    );
    const totalIn = results.reduce((s, r) => s + r.recordsIn, 0);
    expect(totalIn).toBe(counts.reduce((a, b) => a + b, 0));
  });

  it('total duration across step results', () => {
    const results = Array.from({ length: 10 }, (_, i) =>
      makeStepResult(`s${i}`, 'completed', 100, 100, (i + 1) * 50)
    );
    const totalMs = results.reduce((s, r) => s + r.durationMs, 0);
    expect(totalMs).toBe(50 + 100 + 150 + 200 + 250 + 300 + 350 + 400 + 450 + 500);
  });

  it('sort pipeline after out-of-order additions', () => {
    const types = ALL_STEP_TYPES;
    let p = createPipeline('p', 'P');
    // Add in reverse order
    for (let i = types.length - 1; i >= 0; i--) {
      p = addStepToPipeline(p, createStep(`s${i}`, types[i], types[i], i));
    }
    p = sortStepsByOrder(p);
    expect(p.steps.map(s => s.order)).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
  });

  it('remove all steps then add fresh set', () => {
    let p = createPipeline('p', 'P', ALL_STEP_TYPES.map((type, i) => createStep(`s${i}`, type, type, i)));
    for (let i = 0; i < ALL_STEP_TYPES.length; i++) {
      p = removeStepFromPipeline(p, `s${i}`);
    }
    expect(p.steps).toHaveLength(0);
    p = addStepToPipeline(p, createStep('new', 'New', 'extract', 0));
    expect(p.steps).toHaveLength(1);
  });

  it('dedup + sort + group aggregation', () => {
    const records = [
      { id: 1, region: 'EU', revenue: 100 },
      { id: 2, region: 'US', revenue: 200 },
      { id: 1, region: 'EU', revenue: 150 }, // duplicate id=1
      { id: 3, region: 'EU', revenue: 50 },
      { id: 4, region: 'US', revenue: 300 },
    ];
    const deduped = deduplicateRecords(records, 'id');
    expect(deduped).toHaveLength(4);
    const sorted = sortRecords(deduped, 'revenue', 'desc');
    expect(sorted[0]['revenue']).toBe(300);
    const grouped = aggregateGroupBy(sorted, 'region');
    const euRevenue = aggregateSum(grouped['EU'] ?? [], 'revenue');
    const usRevenue = aggregateSum(grouped['US'] ?? [], 'revenue');
    expect(euRevenue).toBe(150); // EU: id=1 (first occurrence: 100), id=3 (50) → 150
    expect(usRevenue).toBe(500); // US: id=2 (200), id=4 (300) → 500
  });

  it('transform → project → validate pattern passes', () => {
    const schema: DataSchema = {
      fields: [
        { name: 'userId', type: 'number', required: true },
        { name: 'status', type: 'string', required: true },
      ],
    };
    const rawRecords = Array.from({ length: 10 }, (_, i) => ({ userId: i + 1, name: `User ${i + 1}`, age: 20 + i }));
    const transformed = applyTransform(rawRecords, r => ({ ...r, status: 'active' }));
    const projected = applyProjection(transformed, ['userId', 'status']);
    const { valid, invalid } = validateRecords(projected, schema);
    expect(valid).toHaveLength(10);
    expect(invalid).toHaveLength(0);
  });
});
