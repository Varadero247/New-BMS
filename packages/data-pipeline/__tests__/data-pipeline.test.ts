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
  PipelineStep,
} from '../src/index';

// ─────────────────────────────────────────────────────────────────────────────
// Fixtures
// ─────────────────────────────────────────────────────────────────────────────

const ALL_STEP_TYPES: StepType[] = [
  'extract', 'transform', 'load', 'validate', 'filter', 'aggregate', 'join', 'sort',
];

const ALL_STEP_STATUSES: StepStatus[] = [
  'pending', 'running', 'completed', 'failed', 'skipped',
];

const ALL_PIPELINE_STATUSES: PipelineStatus[] = [
  'idle', 'running', 'completed', 'failed', 'paused',
];

const INVALID_TYPE_STRINGS = [
  '', 'EXTRACT', 'Transform', 'unknown', 'map', 'reduce', 'merge', 'split',
  'none', 'pending', 'idle', '123', ' ', 'extract ', ' extract',
];

const INVALID_STATUS_STRINGS = [
  '', 'PENDING', 'Running', 'done', 'ok', 'error', 'idle', 'extract', '0', 'null',
];

const INVALID_PIPELINE_STATUS_STRINGS = [
  '', 'IDLE', 'Running', 'done', 'pending', 'extract', 'suspended', 'stopped',
];

function makeBasePipeline(): Pipeline {
  return createPipeline('p1', 'Test Pipeline');
}

function makeStep(id: string, order: number, type: StepType = 'extract'): PipelineStep {
  return createStep(id, `Step ${id}`, type, order);
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. createStep
// ─────────────────────────────────────────────────────────────────────────────

describe('createStep', () => {
  it('returns an object', () => {
    expect(typeof createStep('a', 'A', 'extract', 0)).toBe('object');
  });

  it('sets id', () => {
    expect(createStep('step-1', 'S', 'load', 0).id).toBe('step-1');
  });

  it('sets name', () => {
    expect(createStep('x', 'My Name', 'filter', 1).name).toBe('My Name');
  });

  it('sets order', () => {
    expect(createStep('x', 'n', 'sort', 5).order).toBe(5);
  });

  it('default status is pending', () => {
    expect(createStep('x', 'n', 'extract', 0).status).toBe('pending');
  });

  it('config is undefined when not provided', () => {
    expect(createStep('x', 'n', 'extract', 0).config).toBeUndefined();
  });

  it('config is set when provided', () => {
    const cfg = { timeout: 5000 };
    expect(createStep('x', 'n', 'extract', 0, cfg).config).toEqual(cfg);
  });

  it('config with multiple keys', () => {
    const cfg = { a: 1, b: 'hello', c: true };
    expect(createStep('x', 'n', 'load', 0, cfg).config).toEqual(cfg);
  });

  it('does not set inputSchema by default', () => {
    expect(createStep('x', 'n', 'extract', 0).inputSchema).toBeUndefined();
  });

  it('does not set outputSchema by default', () => {
    expect(createStep('x', 'n', 'extract', 0).outputSchema).toBeUndefined();
  });

  // Loop over all step types
  ALL_STEP_TYPES.forEach((t) => {
    it(`creates step with type '${t}'`, () => {
      expect(createStep('id', 'name', t, 0).type).toBe(t);
    });
  });

  // Loop over various orders
  [0, 1, 5, 10, 100, 999, -1].forEach((order) => {
    it(`creates step with order ${order}`, () => {
      expect(createStep('id', 'name', 'extract', order).order).toBe(order);
    });
  });

  // Loop over various ids
  ['a', 'step-1', 'STEP_ABC', 'uuid-1234-xyz', ''].forEach((id) => {
    it(`creates step with id '${id}'`, () => {
      expect(createStep(id, 'n', 'extract', 0).id).toBe(id);
    });
  });

  // Loop over various names
  ['Alpha', 'Beta Step', 'Extract Records', 'Load to DB', ''].forEach((name) => {
    it(`creates step with name '${name}'`, () => {
      expect(createStep('id', name, 'load', 0).name).toBe(name);
    });
  });

  it('each createStep call returns a new object', () => {
    const s1 = createStep('a', 'n', 'extract', 0);
    const s2 = createStep('a', 'n', 'extract', 0);
    expect(s1).not.toBe(s2);
  });

  it('status is always pending regardless of type', () => {
    ALL_STEP_TYPES.forEach((t) => {
      expect(createStep('id', 'n', t, 0).status).toBe('pending');
    });
  });

  it('config with nested object', () => {
    const cfg = { nested: { a: 1, b: [1, 2, 3] } };
    expect(createStep('id', 'n', 'extract', 0, cfg).config).toEqual(cfg);
  });

  it('config with array value', () => {
    const cfg = { fields: ['a', 'b', 'c'] };
    expect(createStep('id', 'n', 'transform', 0, cfg).config).toEqual(cfg);
  });

  it('config with null value', () => {
    const cfg = { key: null } as unknown as Record<string, unknown>;
    expect(createStep('id', 'n', 'filter', 0, cfg).config).toEqual(cfg);
  });

  it('returned step has exactly expected keys (no extra keys when no config)', () => {
    const step = createStep('id', 'name', 'extract', 0);
    expect(Object.keys(step).sort()).toEqual(['id', 'name', 'order', 'status', 'type'].sort());
  });

  it('returned step has config key when config provided', () => {
    const step = createStep('id', 'name', 'extract', 0, { x: 1 });
    expect('config' in step).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. createPipeline
// ─────────────────────────────────────────────────────────────────────────────

describe('createPipeline', () => {
  it('returns an object', () => {
    expect(typeof createPipeline('p1', 'My Pipeline')).toBe('object');
  });

  it('sets id', () => {
    expect(createPipeline('pipe-1', 'P').id).toBe('pipe-1');
  });

  it('sets name', () => {
    expect(createPipeline('p', 'Pipeline Name').name).toBe('Pipeline Name');
  });

  it('default status is idle', () => {
    expect(createPipeline('p', 'P').status).toBe('idle');
  });

  it('default steps is empty array', () => {
    expect(createPipeline('p', 'P').steps).toEqual([]);
  });

  it('steps can be provided', () => {
    const step = makeStep('s1', 0);
    const p = createPipeline('p', 'P', [step]);
    expect(p.steps).toHaveLength(1);
    expect(p.steps[0]).toEqual(step);
  });

  it('createdAt is a number', () => {
    expect(typeof createPipeline('p', 'P').createdAt).toBe('number');
  });

  it('createdAt is roughly now', () => {
    const before = Date.now();
    const p = createPipeline('p', 'P');
    const after = Date.now();
    expect(p.createdAt).toBeGreaterThanOrEqual(before);
    expect(p.createdAt).toBeLessThanOrEqual(after);
  });

  it('lastRunAt is undefined by default', () => {
    expect(createPipeline('p', 'P').lastRunAt).toBeUndefined();
  });

  it('description is undefined by default', () => {
    expect(createPipeline('p', 'P').description).toBeUndefined();
  });

  it('two pipelines have independent steps arrays', () => {
    const p1 = createPipeline('p1', 'A');
    const p2 = createPipeline('p2', 'B');
    expect(p1.steps).not.toBe(p2.steps);
  });

  // Loop over various ids and names
  ['p-1', 'pipeline-abc', 'uuid-999', ''].forEach((id) => {
    it(`creates pipeline with id '${id}'`, () => {
      expect(createPipeline(id, 'N').id).toBe(id);
    });
  });

  ['Pipeline A', 'ETL Flow', 'Data Sync', ''].forEach((name) => {
    it(`creates pipeline with name '${name}'`, () => {
      expect(createPipeline('p', name).name).toBe(name);
    });
  });

  it('accepts multiple steps', () => {
    const steps = [makeStep('s1', 0), makeStep('s2', 1), makeStep('s3', 2)];
    const p = createPipeline('p', 'P', steps);
    expect(p.steps).toHaveLength(3);
  });

  it('each call returns new object', () => {
    const p1 = createPipeline('p', 'P');
    const p2 = createPipeline('p', 'P');
    expect(p1).not.toBe(p2);
  });

  it('status is always idle regardless of steps provided', () => {
    const steps = [makeStep('s1', 0)];
    expect(createPipeline('p', 'P', steps).status).toBe('idle');
  });

  it('steps array is a copy (new reference)', () => {
    const steps = [makeStep('s1', 0)];
    const p = createPipeline('p', 'P', steps);
    expect(p.steps).not.toBe(steps);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. addStepToPipeline
// ─────────────────────────────────────────────────────────────────────────────

describe('addStepToPipeline', () => {
  it('returns a new pipeline object', () => {
    const p = makeBasePipeline();
    const s = makeStep('s1', 0);
    expect(addStepToPipeline(p, s)).not.toBe(p);
  });

  it('original pipeline is not mutated', () => {
    const p = makeBasePipeline();
    const originalLen = p.steps.length;
    addStepToPipeline(p, makeStep('s1', 0));
    expect(p.steps.length).toBe(originalLen);
  });

  it('new pipeline has one more step', () => {
    const p = makeBasePipeline();
    const result = addStepToPipeline(p, makeStep('s1', 0));
    expect(result.steps).toHaveLength(1);
  });

  it('added step is at the end', () => {
    const p = createPipeline('p', 'P', [makeStep('s1', 0), makeStep('s2', 1)]);
    const s3 = makeStep('s3', 2);
    const result = addStepToPipeline(p, s3);
    expect(result.steps[2]).toEqual(s3);
  });

  it('pipeline id is preserved', () => {
    const p = makeBasePipeline();
    expect(addStepToPipeline(p, makeStep('s1', 0)).id).toBe(p.id);
  });

  it('pipeline name is preserved', () => {
    const p = makeBasePipeline();
    expect(addStepToPipeline(p, makeStep('s1', 0)).name).toBe(p.name);
  });

  it('pipeline status is preserved', () => {
    const p = makeBasePipeline();
    expect(addStepToPipeline(p, makeStep('s1', 0)).status).toBe(p.status);
  });

  it('existing steps are preserved', () => {
    const s1 = makeStep('s1', 0);
    const p = createPipeline('p', 'P', [s1]);
    const result = addStepToPipeline(p, makeStep('s2', 1));
    expect(result.steps[0]).toEqual(s1);
  });

  it('returns new steps array reference', () => {
    const p = makeBasePipeline();
    const result = addStepToPipeline(p, makeStep('s1', 0));
    expect(result.steps).not.toBe(p.steps);
  });

  // Loop: add 10 steps sequentially
  it('can add many steps in sequence', () => {
    let p = makeBasePipeline();
    for (let i = 0; i < 10; i++) {
      p = addStepToPipeline(p, makeStep(`s${i}`, i));
    }
    expect(p.steps).toHaveLength(10);
  });

  // Loop: verify each added step
  [1, 2, 3, 4, 5].forEach((n) => {
    it(`after adding ${n} steps, pipeline has ${n} steps`, () => {
      let p = makeBasePipeline();
      for (let i = 0; i < n; i++) p = addStepToPipeline(p, makeStep(`s${i}`, i));
      expect(p.steps).toHaveLength(n);
    });
  });

  it('added step data is correct', () => {
    const s = createStep('my-step', 'My Step', 'transform', 3, { key: 'val' });
    const result = addStepToPipeline(makeBasePipeline(), s);
    expect(result.steps[0]).toEqual(s);
  });

  it('createdAt is preserved', () => {
    const p = makeBasePipeline();
    const result = addStepToPipeline(p, makeStep('s1', 0));
    expect(result.createdAt).toBe(p.createdAt);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. removeStepFromPipeline
// ─────────────────────────────────────────────────────────────────────────────

describe('removeStepFromPipeline', () => {
  it('returns a new pipeline object', () => {
    const p = createPipeline('p', 'P', [makeStep('s1', 0)]);
    expect(removeStepFromPipeline(p, 's1')).not.toBe(p);
  });

  it('original pipeline is not mutated', () => {
    const p = createPipeline('p', 'P', [makeStep('s1', 0)]);
    removeStepFromPipeline(p, 's1');
    expect(p.steps).toHaveLength(1);
  });

  it('removes the target step', () => {
    const p = createPipeline('p', 'P', [makeStep('s1', 0), makeStep('s2', 1)]);
    const result = removeStepFromPipeline(p, 's1');
    expect(result.steps.find(s => s.id === 's1')).toBeUndefined();
  });

  it('non-target steps remain', () => {
    const p = createPipeline('p', 'P', [makeStep('s1', 0), makeStep('s2', 1)]);
    const result = removeStepFromPipeline(p, 's1');
    expect(result.steps).toHaveLength(1);
    expect(result.steps[0].id).toBe('s2');
  });

  it('removing non-existent step returns same-length pipeline', () => {
    const p = createPipeline('p', 'P', [makeStep('s1', 0)]);
    const result = removeStepFromPipeline(p, 'does-not-exist');
    expect(result.steps).toHaveLength(1);
  });

  it('pipeline id preserved after removal', () => {
    const p = createPipeline('p', 'P', [makeStep('s1', 0)]);
    expect(removeStepFromPipeline(p, 's1').id).toBe('p');
  });

  it('pipeline name preserved after removal', () => {
    const p = createPipeline('p', 'Pipeline Name', [makeStep('s1', 0)]);
    expect(removeStepFromPipeline(p, 's1').name).toBe('Pipeline Name');
  });

  it('pipeline status preserved after removal', () => {
    const p = createPipeline('p', 'P', [makeStep('s1', 0)]);
    expect(removeStepFromPipeline(p, 's1').status).toBe('idle');
  });

  it('returns new steps array reference', () => {
    const p = createPipeline('p', 'P', [makeStep('s1', 0)]);
    const result = removeStepFromPipeline(p, 's1');
    expect(result.steps).not.toBe(p.steps);
  });

  it('removes the correct step from the middle', () => {
    const p = createPipeline('p', 'P', [makeStep('a', 0), makeStep('b', 1), makeStep('c', 2)]);
    const result = removeStepFromPipeline(p, 'b');
    expect(result.steps.map(s => s.id)).toEqual(['a', 'c']);
  });

  it('removes the last step', () => {
    const p = createPipeline('p', 'P', [makeStep('a', 0), makeStep('b', 1)]);
    const result = removeStepFromPipeline(p, 'b');
    expect(result.steps).toHaveLength(1);
    expect(result.steps[0].id).toBe('a');
  });

  // Loop: remove each step from a 5-step pipeline
  ['s0', 's1', 's2', 's3', 's4'].forEach((stepId, idx) => {
    it(`removes step '${stepId}' from 5-step pipeline`, () => {
      const steps = ['s0', 's1', 's2', 's3', 's4'].map((id, i) => makeStep(id, i));
      const p = createPipeline('p', 'P', steps);
      const result = removeStepFromPipeline(p, stepId);
      expect(result.steps).toHaveLength(4);
      expect(result.steps.find(s => s.id === stepId)).toBeUndefined();
    });
  });

  it('can remove all steps one by one', () => {
    let p = createPipeline('p', 'P', [makeStep('a', 0), makeStep('b', 1), makeStep('c', 2)]);
    p = removeStepFromPipeline(p, 'a');
    p = removeStepFromPipeline(p, 'b');
    p = removeStepFromPipeline(p, 'c');
    expect(p.steps).toHaveLength(0);
  });

  it('only removes first matching id (ids should be unique)', () => {
    const p = createPipeline('p', 'P', [makeStep('s1', 0), makeStep('s2', 1)]);
    const result = removeStepFromPipeline(p, 's1');
    expect(result.steps.every(s => s.id !== 's1')).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. sortStepsByOrder
// ─────────────────────────────────────────────────────────────────────────────

describe('sortStepsByOrder', () => {
  it('returns a new pipeline object', () => {
    const p = makeBasePipeline();
    expect(sortStepsByOrder(p)).not.toBe(p);
  });

  it('original pipeline is not mutated', () => {
    const steps = [makeStep('b', 2), makeStep('a', 0)];
    const p = createPipeline('p', 'P', steps);
    sortStepsByOrder(p);
    expect(p.steps[0].id).toBe('b');
  });

  it('sorts steps by order ascending', () => {
    const p = createPipeline('p', 'P', [makeStep('b', 2), makeStep('a', 0), makeStep('c', 1)]);
    const result = sortStepsByOrder(p);
    expect(result.steps.map(s => s.order)).toEqual([0, 1, 2]);
  });

  it('already sorted pipeline remains correct', () => {
    const p = createPipeline('p', 'P', [makeStep('a', 0), makeStep('b', 1), makeStep('c', 2)]);
    const result = sortStepsByOrder(p);
    expect(result.steps.map(s => s.id)).toEqual(['a', 'b', 'c']);
  });

  it('reverse sorted pipeline becomes correct', () => {
    const p = createPipeline('p', 'P', [makeStep('c', 2), makeStep('b', 1), makeStep('a', 0)]);
    const result = sortStepsByOrder(p);
    expect(result.steps.map(s => s.id)).toEqual(['a', 'b', 'c']);
  });

  it('empty steps stays empty', () => {
    const p = makeBasePipeline();
    expect(sortStepsByOrder(p).steps).toEqual([]);
  });

  it('single step stays the same', () => {
    const p = createPipeline('p', 'P', [makeStep('a', 5)]);
    expect(sortStepsByOrder(p).steps).toHaveLength(1);
  });

  it('pipeline id is preserved', () => {
    const p = createPipeline('my-pipe', 'P', [makeStep('a', 0)]);
    expect(sortStepsByOrder(p).id).toBe('my-pipe');
  });

  it('pipeline name is preserved', () => {
    const p = createPipeline('p', 'My Name', [makeStep('a', 0)]);
    expect(sortStepsByOrder(p).name).toBe('My Name');
  });

  it('returns new steps array reference', () => {
    const p = createPipeline('p', 'P', [makeStep('a', 0)]);
    const result = sortStepsByOrder(p);
    expect(result.steps).not.toBe(p.steps);
  });

  // Loop over scrambled orderings
  [
    [3, 1, 2, 0],
    [9, 5, 7, 1, 3],
    [0, 10, 5, 2, 8],
  ].forEach((orders, i) => {
    it(`sorts scrambled order set ${i + 1} correctly`, () => {
      const steps = orders.map((o, idx) => makeStep(`s${idx}`, o));
      const p = createPipeline('p', 'P', steps);
      const sorted = sortStepsByOrder(p).steps.map(s => s.order);
      expect(sorted).toEqual([...orders].sort((a, b) => a - b));
    });
  });

  it('step objects are preserved after sort', () => {
    const s1 = createStep('s1', 'Step1', 'extract', 1, { cfg: 'val' });
    const s2 = createStep('s2', 'Step2', 'load', 0);
    const p = createPipeline('p', 'P', [s1, s2]);
    const result = sortStepsByOrder(p);
    expect(result.steps[0]).toEqual(s2);
    expect(result.steps[1]).toEqual(s1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. getStepById
// ─────────────────────────────────────────────────────────────────────────────

describe('getStepById', () => {
  it('returns undefined for empty pipeline', () => {
    expect(getStepById(makeBasePipeline(), 's1')).toBeUndefined();
  });

  it('returns undefined when step not found', () => {
    const p = createPipeline('p', 'P', [makeStep('s1', 0)]);
    expect(getStepById(p, 'not-there')).toBeUndefined();
  });

  it('returns the matching step', () => {
    const s = makeStep('target', 0);
    const p = createPipeline('p', 'P', [s, makeStep('other', 1)]);
    expect(getStepById(p, 'target')).toEqual(s);
  });

  it('returns the first step', () => {
    const s = makeStep('first', 0);
    const p = createPipeline('p', 'P', [s, makeStep('second', 1)]);
    expect(getStepById(p, 'first')).toEqual(s);
  });

  it('returns the last step', () => {
    const s = makeStep('last', 2);
    const p = createPipeline('p', 'P', [makeStep('first', 0), makeStep('middle', 1), s]);
    expect(getStepById(p, 'last')).toEqual(s);
  });

  it('returns all fields of the step', () => {
    const s = createStep('s1', 'My Step', 'transform', 3, { x: 1 });
    const p = createPipeline('p', 'P', [s]);
    const found = getStepById(p, 's1');
    expect(found).toEqual(s);
  });

  // Loop: find each step in a pipeline
  ['a', 'b', 'c', 'd', 'e'].forEach((id) => {
    it(`finds step '${id}' in multi-step pipeline`, () => {
      const steps = ['a', 'b', 'c', 'd', 'e'].map((sid, i) => makeStep(sid, i));
      const p = createPipeline('p', 'P', steps);
      const found = getStepById(p, id);
      expect(found).toBeDefined();
      expect(found?.id).toBe(id);
    });
  });

  // Loop: ensure not found for various missing ids
  ['z', 'X', '1', '', 'step-999'].forEach((missingId) => {
    it(`returns undefined for missing id '${missingId}'`, () => {
      const p = createPipeline('p', 'P', [makeStep('a', 0), makeStep('b', 1)]);
      expect(getStepById(p, missingId)).toBeUndefined();
    });
  });

  it('does not mutate the pipeline', () => {
    const p = createPipeline('p', 'P', [makeStep('s1', 0)]);
    getStepById(p, 's1');
    expect(p.steps).toHaveLength(1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 7. updateStepStatus
// ─────────────────────────────────────────────────────────────────────────────

describe('updateStepStatus', () => {
  it('returns a new pipeline', () => {
    const p = createPipeline('p', 'P', [makeStep('s1', 0)]);
    expect(updateStepStatus(p, 's1', 'completed')).not.toBe(p);
  });

  it('original pipeline is not mutated', () => {
    const p = createPipeline('p', 'P', [makeStep('s1', 0)]);
    updateStepStatus(p, 's1', 'completed');
    expect(p.steps[0].status).toBe('pending');
  });

  it('updates the target step status', () => {
    const p = createPipeline('p', 'P', [makeStep('s1', 0)]);
    const result = updateStepStatus(p, 's1', 'completed');
    expect(result.steps[0].status).toBe('completed');
  });

  it('does not change other steps', () => {
    const p = createPipeline('p', 'P', [makeStep('s1', 0), makeStep('s2', 1)]);
    const result = updateStepStatus(p, 's1', 'running');
    expect(result.steps[1].status).toBe('pending');
  });

  it('pipeline id preserved', () => {
    const p = createPipeline('pipe-x', 'P', [makeStep('s1', 0)]);
    expect(updateStepStatus(p, 's1', 'failed').id).toBe('pipe-x');
  });

  it('pipeline name preserved', () => {
    const p = createPipeline('p', 'My Pipeline', [makeStep('s1', 0)]);
    expect(updateStepStatus(p, 's1', 'failed').name).toBe('My Pipeline');
  });

  it('pipeline status preserved', () => {
    const p = createPipeline('p', 'P', [makeStep('s1', 0)]);
    expect(updateStepStatus(p, 's1', 'completed').status).toBe('idle');
  });

  // Loop over all statuses
  ALL_STEP_STATUSES.forEach((status) => {
    it(`can set step status to '${status}'`, () => {
      const p = createPipeline('p', 'P', [makeStep('s1', 0)]);
      const result = updateStepStatus(p, 's1', status);
      expect(result.steps[0].status).toBe(status);
    });
  });

  it('updating non-existent step leaves all steps unchanged', () => {
    const p = createPipeline('p', 'P', [makeStep('s1', 0), makeStep('s2', 1)]);
    const result = updateStepStatus(p, 'missing', 'completed');
    expect(result.steps.every(s => s.status === 'pending')).toBe(true);
  });

  it('returns new steps array reference', () => {
    const p = createPipeline('p', 'P', [makeStep('s1', 0)]);
    const result = updateStepStatus(p, 's1', 'running');
    expect(result.steps).not.toBe(p.steps);
  });

  it('step other fields are preserved after status update', () => {
    const s = createStep('s1', 'Named Step', 'transform', 5, { cfg: 'val' });
    const p = createPipeline('p', 'P', [s]);
    const result = updateStepStatus(p, 's1', 'completed');
    const updated = result.steps[0];
    expect(updated.name).toBe('Named Step');
    expect(updated.type).toBe('transform');
    expect(updated.order).toBe(5);
    expect(updated.config).toEqual({ cfg: 'val' });
  });

  // Loop: update each step in a multi-step pipeline
  [0, 1, 2, 3, 4].forEach((idx) => {
    it(`updates only step at index ${idx} in 5-step pipeline`, () => {
      const ids = ['a', 'b', 'c', 'd', 'e'];
      const steps = ids.map((id, i) => makeStep(id, i));
      const p = createPipeline('p', 'P', steps);
      const result = updateStepStatus(p, ids[idx], 'completed');
      result.steps.forEach((s, i) => {
        expect(s.status).toBe(i === idx ? 'completed' : 'pending');
      });
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 8. applyTransform
// ─────────────────────────────────────────────────────────────────────────────

describe('applyTransform', () => {
  it('returns empty array for empty input', () => {
    expect(applyTransform([], r => r)).toEqual([]);
  });

  it('applies transform to each record', () => {
    const records = [{ a: 1 }, { a: 2 }, { a: 3 }];
    const result = applyTransform(records, r => ({ ...r, b: (r['a'] as number) * 2 }));
    expect(result).toEqual([{ a: 1, b: 2 }, { a: 2, b: 4 }, { a: 3, b: 6 }]);
  });

  it('identity transform returns same values', () => {
    const records = [{ x: 'hello' }, { x: 'world' }];
    const result = applyTransform(records, r => r);
    expect(result).toEqual(records);
  });

  it('original array is not mutated', () => {
    const records = [{ a: 1 }];
    applyTransform(records, r => ({ ...r, b: 2 }));
    expect(records[0]).toEqual({ a: 1 });
  });

  it('can add fields to each record', () => {
    const records = [{ id: 1 }, { id: 2 }];
    const result = applyTransform(records, r => ({ ...r, processed: true }));
    expect(result.every(r => r['processed'] === true)).toBe(true);
  });

  it('can remove fields from each record', () => {
    const records = [{ a: 1, b: 2 }, { a: 3, b: 4 }];
    const result = applyTransform(records, ({ b: _b, ...rest }) => rest);
    expect(result.every(r => !('b' in r))).toBe(true);
  });

  it('can uppercase string fields', () => {
    const records = [{ name: 'alice' }, { name: 'bob' }];
    const result = applyTransform(records, r => ({ name: String(r['name']).toUpperCase() }));
    expect(result).toEqual([{ name: 'ALICE' }, { name: 'BOB' }]);
  });

  it('returns an array of same length', () => {
    const records = Array.from({ length: 20 }, (_, i) => ({ i }));
    const result = applyTransform(records, r => r);
    expect(result).toHaveLength(20);
  });

  it('transform can completely replace record shape', () => {
    const records = [{ old: 1 }];
    const result = applyTransform(records, () => ({ newField: 'new' }));
    expect(result).toEqual([{ newField: 'new' }]);
  });

  // Loop: various transform functions
  [
    { fn: (r: Record<string, unknown>) => ({ ...r, tag: 'tagged' }), key: 'tag', val: 'tagged' },
    { fn: (r: Record<string, unknown>) => ({ ...r, count: 42 }), key: 'count', val: 42 },
    { fn: (r: Record<string, unknown>) => ({ ...r, active: true }), key: 'active', val: true },
  ].forEach(({ fn, key, val }) => {
    it(`transform adds '${key}' field with value`, () => {
      const result = applyTransform([{ x: 1 }], fn);
      expect(result[0][key]).toBe(val);
    });
  });

  // Loop: apply to arrays of various sizes
  [0, 1, 5, 10, 50].forEach((size) => {
    it(`applies transform to array of size ${size}`, () => {
      const records = Array.from({ length: size }, (_, i) => ({ i }));
      const result = applyTransform(records, r => ({ ...r, doubled: (r['i'] as number) * 2 }));
      expect(result).toHaveLength(size);
      if (size > 0) {
        expect(result[0]['doubled']).toBe(0);
      }
    });
  });

  it('each transformed record is a new object', () => {
    const records = [{ a: 1 }];
    const result = applyTransform(records, r => ({ ...r }));
    expect(result[0]).not.toBe(records[0]);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 9. applyFilter
// ─────────────────────────────────────────────────────────────────────────────

describe('applyFilter', () => {
  it('returns empty array for empty input', () => {
    expect(applyFilter([], () => true)).toEqual([]);
  });

  it('returns all records when predicate is always true', () => {
    const records = [{ a: 1 }, { a: 2 }, { a: 3 }];
    expect(applyFilter(records, () => true)).toHaveLength(3);
  });

  it('returns no records when predicate is always false', () => {
    const records = [{ a: 1 }, { a: 2 }];
    expect(applyFilter(records, () => false)).toHaveLength(0);
  });

  it('filters records by numeric condition', () => {
    const records = [{ val: 1 }, { val: 5 }, { val: 3 }, { val: 8 }];
    const result = applyFilter(records, r => (r['val'] as number) > 3);
    expect(result).toEqual([{ val: 5 }, { val: 8 }]);
  });

  it('filters records by string condition', () => {
    const records = [{ type: 'a' }, { type: 'b' }, { type: 'a' }];
    const result = applyFilter(records, r => r['type'] === 'a');
    expect(result).toHaveLength(2);
  });

  it('original array is not mutated', () => {
    const records = [{ a: 1 }, { a: 2 }];
    applyFilter(records, () => false);
    expect(records).toHaveLength(2);
  });

  it('returns new array reference', () => {
    const records = [{ a: 1 }];
    const result = applyFilter(records, () => true);
    expect(result).not.toBe(records);
  });

  it('filter on boolean field', () => {
    const records = [{ active: true }, { active: false }, { active: true }];
    const result = applyFilter(records, r => r['active'] === true);
    expect(result).toHaveLength(2);
  });

  it('filter on nested value using type cast', () => {
    const records = [{ score: 90 }, { score: 45 }, { score: 75 }];
    const result = applyFilter(records, r => (r['score'] as number) >= 75);
    expect(result).toHaveLength(2);
  });

  // Loop: filter thresholds
  [1, 2, 3, 4, 5].forEach((threshold) => {
    it(`keeps records with val >= ${threshold}`, () => {
      const records = [1, 2, 3, 4, 5].map(val => ({ val }));
      const result = applyFilter(records, r => (r['val'] as number) >= threshold);
      expect(result).toHaveLength(6 - threshold);
    });
  });

  // Loop: filter sizes
  [0, 5, 10, 20].forEach((size) => {
    it(`filters empty results from array of size ${size}`, () => {
      const records = Array.from({ length: size }, (_, i) => ({ i }));
      expect(applyFilter(records, () => false)).toHaveLength(0);
    });
  });

  it('preserved records are the same references', () => {
    const r1 = { id: 1 };
    const r2 = { id: 2 };
    const result = applyFilter([r1, r2], r => r['id'] === 1);
    expect(result[0]).toBe(r1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 10. applyRename
// ─────────────────────────────────────────────────────────────────────────────

describe('applyRename', () => {
  it('returns empty array for empty input', () => {
    expect(applyRename([], { a: 'b' })).toEqual([]);
  });

  it('renames a field', () => {
    const records = [{ old: 'value' }];
    const result = applyRename(records, { old: 'newKey' });
    expect(result[0]['newKey']).toBe('value');
    expect('old' in result[0]).toBe(false);
  });

  it('preserves unmentioned fields', () => {
    const records = [{ a: 1, b: 2 }];
    const result = applyRename(records, { a: 'alpha' });
    expect(result[0]['b']).toBe(2);
  });

  it('renames multiple fields', () => {
    const records = [{ x: 10, y: 20 }];
    const result = applyRename(records, { x: 'lon', y: 'lat' });
    expect(result[0]).toEqual({ lon: 10, lat: 20 });
  });

  it('original records are not mutated', () => {
    const records = [{ a: 1 }];
    applyRename(records, { a: 'b' });
    expect(records[0]).toEqual({ a: 1 });
  });

  it('empty mapping returns original shape', () => {
    const records = [{ a: 1, b: 2 }];
    const result = applyRename(records, {});
    expect(result[0]).toEqual({ a: 1, b: 2 });
  });

  it('handles multiple records', () => {
    const records = [{ name: 'Alice' }, { name: 'Bob' }];
    const result = applyRename(records, { name: 'fullName' });
    expect(result.every(r => 'fullName' in r && !('name' in r))).toBe(true);
  });

  it('value is preserved after rename', () => {
    const records = [{ count: 42 }];
    const result = applyRename(records, { count: 'total' });
    expect(result[0]['total']).toBe(42);
  });

  it('does not add extra fields', () => {
    const records = [{ a: 1 }];
    const result = applyRename(records, { a: 'b' });
    expect(Object.keys(result[0])).toHaveLength(1);
  });

  // Loop: rename different field names
  ['firstName', 'lastName', 'email', 'phone', 'address'].forEach((field) => {
    it(`renames '${field}' to 'mapped_${field}'`, () => {
      const record: Record<string, unknown> = {};
      record[field] = 'test-value';
      const result = applyRename([record], { [field]: `mapped_${field}` });
      expect(result[0][`mapped_${field}`]).toBe('test-value');
      expect(field in result[0]).toBe(false);
    });
  });

  it('returns new array reference', () => {
    const records = [{ a: 1 }];
    expect(applyRename(records, { a: 'b' })).not.toBe(records);
  });

  it('each result record is a new object', () => {
    const records = [{ a: 1 }];
    const result = applyRename(records, { a: 'b' });
    expect(result[0]).not.toBe(records[0]);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 11. applyProjection
// ─────────────────────────────────────────────────────────────────────────────

describe('applyProjection', () => {
  it('returns empty array for empty input', () => {
    expect(applyProjection([], ['a'])).toEqual([]);
  });

  it('keeps only specified fields', () => {
    const records = [{ a: 1, b: 2, c: 3 }];
    const result = applyProjection(records, ['a', 'c']);
    expect(result[0]).toEqual({ a: 1, c: 3 });
  });

  it('removes non-specified fields', () => {
    const records = [{ x: 1, y: 2, z: 3 }];
    const result = applyProjection(records, ['x']);
    expect('y' in result[0]).toBe(false);
    expect('z' in result[0]).toBe(false);
  });

  it('empty fields array returns empty records', () => {
    const records = [{ a: 1, b: 2 }];
    const result = applyProjection(records, []);
    expect(result[0]).toEqual({});
  });

  it('requesting non-existent field skips it', () => {
    const records = [{ a: 1 }];
    const result = applyProjection(records, ['a', 'missing']);
    expect(result[0]).toEqual({ a: 1 });
  });

  it('original records are not mutated', () => {
    const records = [{ a: 1, b: 2 }];
    applyProjection(records, ['a']);
    expect(records[0]).toEqual({ a: 1, b: 2 });
  });

  it('handles multiple records', () => {
    const records = [{ a: 1, b: 2 }, { a: 3, b: 4 }];
    const result = applyProjection(records, ['a']);
    expect(result).toEqual([{ a: 1 }, { a: 3 }]);
  });

  it('values are preserved', () => {
    const records = [{ name: 'Alice', age: 30 }];
    const result = applyProjection(records, ['name']);
    expect(result[0]['name']).toBe('Alice');
  });

  it('returns new array reference', () => {
    const records = [{ a: 1 }];
    expect(applyProjection(records, ['a'])).not.toBe(records);
  });

  // Loop: projection of various field subsets
  [['a'], ['a', 'b'], ['b', 'c'], ['a', 'b', 'c']].forEach((fields) => {
    it(`projection with fields [${fields.join(', ')}] returns correct shape`, () => {
      const records = [{ a: 1, b: 2, c: 3 }];
      const result = applyProjection(records, fields);
      fields.forEach((f) => expect(f in result[0]).toBe(true));
      Object.keys(records[0]).filter(k => !fields.includes(k)).forEach((k) => {
        expect(k in result[0]).toBe(false);
      });
    });
  });

  // Loop: size checks
  [1, 3, 5, 10].forEach((size) => {
    it(`projection over ${size} records returns ${size} results`, () => {
      const records = Array.from({ length: size }, (_, i) => ({ id: i, name: `n${i}`, extra: true }));
      const result = applyProjection(records, ['id', 'name']);
      expect(result).toHaveLength(size);
      expect(result.every(r => !('extra' in r))).toBe(true);
    });
  });

  it('each result record is a new object', () => {
    const records = [{ a: 1 }];
    const result = applyProjection(records, ['a']);
    expect(result[0]).not.toBe(records[0]);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 12. applyDefaultValues
// ─────────────────────────────────────────────────────────────────────────────

describe('applyDefaultValues', () => {
  const schema: DataSchema = {
    fields: [
      { name: 'status', type: 'string', defaultValue: 'active' },
      { name: 'count', type: 'number', defaultValue: 0 },
      { name: 'enabled', type: 'boolean', defaultValue: true },
    ],
  };

  it('returns empty array for empty input', () => {
    expect(applyDefaultValues([], schema)).toEqual([]);
  });

  it('adds default value for missing field', () => {
    const records = [{ name: 'Alice' }];
    const result = applyDefaultValues(records, schema);
    expect(result[0]['status']).toBe('active');
  });

  it('does not overwrite existing field', () => {
    const records = [{ status: 'inactive' }];
    const result = applyDefaultValues(records, schema);
    expect(result[0]['status']).toBe('inactive');
  });

  it('adds multiple defaults', () => {
    const records = [{ name: 'Bob' }];
    const result = applyDefaultValues(records, schema);
    expect(result[0]['status']).toBe('active');
    expect(result[0]['count']).toBe(0);
    expect(result[0]['enabled']).toBe(true);
  });

  it('original records are not mutated', () => {
    const records = [{ name: 'Alice' }];
    applyDefaultValues(records, schema);
    expect('status' in records[0]).toBe(false);
  });

  it('returns new array reference', () => {
    expect(applyDefaultValues([{ a: 1 }], { fields: [] })).not.toBe([{ a: 1 }]);
  });

  it('schema with no fields changes nothing', () => {
    const records = [{ a: 1 }];
    const result = applyDefaultValues(records, { fields: [] });
    expect(result[0]).toEqual({ a: 1 });
  });

  it('field without defaultValue is not added', () => {
    const s: DataSchema = { fields: [{ name: 'x', type: 'string' }] };
    const records = [{ a: 1 }];
    const result = applyDefaultValues(records, s);
    expect('x' in result[0]).toBe(false);
  });

  it('false defaultValue is applied', () => {
    const s: DataSchema = { fields: [{ name: 'active', type: 'boolean', defaultValue: false }] };
    const records = [{ name: 'Test' }];
    const result = applyDefaultValues(records, s);
    expect(result[0]['active']).toBe(false);
  });

  it('zero defaultValue is applied', () => {
    const s: DataSchema = { fields: [{ name: 'score', type: 'number', defaultValue: 0 }] };
    const records = [{ name: 'Test' }];
    const result = applyDefaultValues(records, s);
    expect(result[0]['score']).toBe(0);
  });

  it('null existing value is not overwritten (key present)', () => {
    const records: Record<string, unknown>[] = [{ status: null }];
    const result = applyDefaultValues(records, schema);
    expect(result[0]['status']).toBeNull();
  });

  // Loop: multiple records each get defaults
  [1, 3, 5].forEach((n) => {
    it(`adds defaults to ${n} records`, () => {
      const records = Array.from({ length: n }, () => ({ name: 'x' }));
      const result = applyDefaultValues(records, schema);
      expect(result.every(r => r['status'] === 'active')).toBe(true);
      expect(result).toHaveLength(n);
    });
  });

  it('each result record is a new object', () => {
    const records = [{ name: 'Alice' }];
    const result = applyDefaultValues(records, schema);
    expect(result[0]).not.toBe(records[0]);
  });

  it('string default value type', () => {
    const s: DataSchema = { fields: [{ name: 'tag', type: 'string', defaultValue: 'default-tag' }] };
    const result = applyDefaultValues([{}], s);
    expect(result[0]['tag']).toBe('default-tag');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 13. validateRecord
// ─────────────────────────────────────────────────────────────────────────────

describe('validateRecord', () => {
  const schema: DataSchema = {
    fields: [
      { name: 'id', type: 'number', required: true },
      { name: 'name', type: 'string', required: true },
      { name: 'email', type: 'string', required: false },
    ],
  };

  it('returns empty array for valid record', () => {
    expect(validateRecord({ id: 1, name: 'Alice' }, schema)).toEqual([]);
  });

  it('returns error for missing required field', () => {
    const errors = validateRecord({ id: 1 }, schema);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('error message mentions missing field name', () => {
    const errors = validateRecord({ id: 1 }, schema);
    expect(errors.some(e => e.includes('name'))).toBe(true);
  });

  it('returns multiple errors for multiple missing required fields', () => {
    const errors = validateRecord({}, schema);
    expect(errors.length).toBe(2);
  });

  it('optional field missing does not produce error', () => {
    const errors = validateRecord({ id: 1, name: 'Alice' }, schema);
    expect(errors).toHaveLength(0);
  });

  it('null value for required field produces error', () => {
    const errors = validateRecord({ id: null, name: 'Alice' }, schema);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('undefined value for required field produces error', () => {
    const errors = validateRecord({ id: undefined, name: 'Alice' }, schema);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('schema with no required fields always passes', () => {
    const s: DataSchema = { fields: [{ name: 'x', type: 'string', required: false }] };
    expect(validateRecord({}, s)).toEqual([]);
  });

  it('schema with all required fields, all present, passes', () => {
    const s: DataSchema = {
      fields: [
        { name: 'a', type: 'string', required: true },
        { name: 'b', type: 'number', required: true },
        { name: 'c', type: 'boolean', required: true },
      ],
    };
    expect(validateRecord({ a: 'x', b: 1, c: true }, s)).toEqual([]);
  });

  it('returns array of strings', () => {
    const errors = validateRecord({}, schema);
    expect(errors.every(e => typeof e === 'string')).toBe(true);
  });

  // Loop: validate each required field missing individually
  ['id', 'name'].forEach((missingField) => {
    it(`produces error when required field '${missingField}' is missing`, () => {
      const record: Record<string, unknown> = { id: 1, name: 'Alice' };
      delete record[missingField];
      const errors = validateRecord(record, schema);
      expect(errors.some(e => e.includes(missingField))).toBe(true);
    });
  });

  // Loop: no error when all required fields present with various values
  [
    { id: 0, name: '' },
    { id: 99, name: 'Bob' },
    { id: -1, name: 'Charlie' },
  ].forEach((record, i) => {
    it(`record set ${i + 1} with all required fields is valid`, () => {
      expect(validateRecord(record, schema)).toEqual([]);
    });
  });

  it('empty schema validates any record', () => {
    expect(validateRecord({ a: 1, b: 2 }, { fields: [] })).toEqual([]);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 14. validateRecords
// ─────────────────────────────────────────────────────────────────────────────

describe('validateRecords', () => {
  const schema: DataSchema = {
    fields: [{ name: 'id', type: 'number', required: true }, { name: 'name', type: 'string', required: true }],
  };

  it('returns valid and invalid keys', () => {
    const result = validateRecords([], schema);
    expect('valid' in result && 'invalid' in result).toBe(true);
  });

  it('empty input returns empty valid and invalid', () => {
    const result = validateRecords([], schema);
    expect(result.valid).toEqual([]);
    expect(result.invalid).toEqual([]);
  });

  it('all valid records go to valid', () => {
    const records = [{ id: 1, name: 'A' }, { id: 2, name: 'B' }];
    const result = validateRecords(records, schema);
    expect(result.valid).toHaveLength(2);
    expect(result.invalid).toHaveLength(0);
  });

  it('all invalid records go to invalid', () => {
    const records = [{ id: 1 }, { name: 'B' }];
    const result = validateRecords(records, schema);
    expect(result.valid).toHaveLength(0);
    expect(result.invalid).toHaveLength(2);
  });

  it('mixes valid and invalid correctly', () => {
    const records = [{ id: 1, name: 'A' }, { id: 2 }, { id: 3, name: 'C' }];
    const result = validateRecords(records, schema);
    expect(result.valid).toHaveLength(2);
    expect(result.invalid).toHaveLength(1);
  });

  it('preserves record data in valid list', () => {
    const records = [{ id: 1, name: 'Alice', extra: 'data' }];
    const result = validateRecords(records, schema);
    expect(result.valid[0]['extra']).toBe('data');
  });

  it('preserves record data in invalid list', () => {
    const records = [{ id: 1 }];
    const result = validateRecords(records, schema);
    expect(result.invalid[0]['id']).toBe(1);
  });

  it('valid + invalid = total records count', () => {
    const records = Array.from({ length: 10 }, (_, i) =>
      i % 2 === 0 ? { id: i, name: `n${i}` } : { id: i }
    );
    const result = validateRecords(records, schema);
    expect(result.valid.length + result.invalid.length).toBe(10);
  });

  // Loop: various split ratios
  [0, 1, 2, 3, 4, 5].forEach((validCount) => {
    it(`validates batch with ${validCount} valid and ${5 - validCount} invalid`, () => {
      const records = Array.from({ length: 5 }, (_, i) =>
        i < validCount ? { id: i, name: `n${i}` } : { id: i }
      );
      const result = validateRecords(records, schema);
      expect(result.valid).toHaveLength(validCount);
      expect(result.invalid).toHaveLength(5 - validCount);
    });
  });

  it('original records array is not mutated', () => {
    const records = [{ id: 1, name: 'A' }];
    validateRecords(records, schema);
    expect(records).toHaveLength(1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 15. aggregateSum
// ─────────────────────────────────────────────────────────────────────────────

describe('aggregateSum', () => {
  it('returns 0 for empty array', () => {
    expect(aggregateSum([], 'val')).toBe(0);
  });

  it('returns value for single record', () => {
    expect(aggregateSum([{ val: 42 }], 'val')).toBe(42);
  });

  it('sums multiple records', () => {
    expect(aggregateSum([{ val: 1 }, { val: 2 }, { val: 3 }], 'val')).toBe(6);
  });

  it('ignores non-numeric values', () => {
    expect(aggregateSum([{ val: 1 }, { val: 'x' as unknown as number }], 'val')).toBe(1);
  });

  it('ignores missing field', () => {
    expect(aggregateSum([{ other: 5 }], 'val')).toBe(0);
  });

  it('handles negative numbers', () => {
    expect(aggregateSum([{ val: -5 }, { val: 3 }], 'val')).toBe(-2);
  });

  it('handles decimal numbers', () => {
    expect(aggregateSum([{ val: 1.5 }, { val: 2.5 }], 'val')).toBeCloseTo(4.0);
  });

  // Loop: various sums
  [
    { records: [{ n: 10 }, { n: 20 }], expected: 30 },
    { records: [{ n: 100 }], expected: 100 },
    { records: [{ n: 1 }, { n: 1 }, { n: 1 }, { n: 1 }], expected: 4 },
    { records: [{ n: -10 }, { n: 10 }], expected: 0 },
    { records: [{ n: 0 }, { n: 0 }], expected: 0 },
  ].forEach(({ records, expected }, i) => {
    it(`sum case ${i + 1}: expected ${expected}`, () => {
      expect(aggregateSum(records as Record<string, unknown>[], 'n')).toBe(expected);
    });
  });

  // Loop: sum with various field names
  ['amount', 'total', 'revenue', 'cost', 'qty'].forEach((field) => {
    it(`sums field '${field}'`, () => {
      const records: Record<string, unknown>[] = [{ [field]: 5 }, { [field]: 10 }];
      expect(aggregateSum(records, field)).toBe(15);
    });
  });

  it('large array sum', () => {
    const records = Array.from({ length: 100 }, () => ({ n: 1 }));
    expect(aggregateSum(records, 'n')).toBe(100);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 16. aggregateAvg
// ─────────────────────────────────────────────────────────────────────────────

describe('aggregateAvg', () => {
  it('returns 0 for empty array', () => {
    expect(aggregateAvg([], 'val')).toBe(0);
  });

  it('returns value for single record', () => {
    expect(aggregateAvg([{ val: 10 }], 'val')).toBe(10);
  });

  it('averages multiple records', () => {
    expect(aggregateAvg([{ val: 1 }, { val: 2 }, { val: 3 }], 'val')).toBeCloseTo(2);
  });

  it('handles decimals', () => {
    expect(aggregateAvg([{ val: 1.5 }, { val: 2.5 }], 'val')).toBeCloseTo(2.0);
  });

  it('ignores non-numeric values', () => {
    expect(aggregateAvg([{ val: 4 }, { val: 'x' as unknown as number }], 'val')).toBe(2);
  });

  it('missing field treated as 0', () => {
    expect(aggregateAvg([{ other: 5 }], 'val')).toBe(0);
  });

  // Loop: avg test cases
  [
    { records: [{ v: 10 }, { v: 20 }], expected: 15 },
    { records: [{ v: 100 }, { v: 0 }], expected: 50 },
    { records: [{ v: 5 }, { v: 5 }, { v: 5 }], expected: 5 },
    { records: [{ v: -5 }, { v: 5 }], expected: 0 },
  ].forEach(({ records, expected }, i) => {
    it(`avg case ${i + 1}: expected ${expected}`, () => {
      expect(aggregateAvg(records as Record<string, unknown>[], 'v')).toBeCloseTo(expected);
    });
  });

  // Loop: avg with various field names
  ['price', 'score', 'rating', 'weight'].forEach((field) => {
    it(`averages field '${field}'`, () => {
      const records: Record<string, unknown>[] = [{ [field]: 2 }, { [field]: 4 }];
      expect(aggregateAvg(records, field)).toBeCloseTo(3);
    });
  });

  it('100 records each with value 1 avg is 1', () => {
    const records = Array.from({ length: 100 }, () => ({ n: 1 }));
    expect(aggregateAvg(records, 'n')).toBe(1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 17. aggregateCount
// ─────────────────────────────────────────────────────────────────────────────

describe('aggregateCount', () => {
  it('returns 0 for empty array', () => {
    expect(aggregateCount([])).toBe(0);
  });

  it('returns 1 for single record', () => {
    expect(aggregateCount([{ a: 1 }])).toBe(1);
  });

  it('returns correct count for multiple records', () => {
    expect(aggregateCount([{ a: 1 }, { a: 2 }, { a: 3 }])).toBe(3);
  });

  // Loop: count various sizes
  [0, 1, 2, 5, 10, 50, 100].forEach((n) => {
    it(`count of ${n} records returns ${n}`, () => {
      const records = Array.from({ length: n }, (_, i) => ({ i }));
      expect(aggregateCount(records)).toBe(n);
    });
  });

  it('records with various shapes are counted equally', () => {
    const records = [{ a: 1 }, {}, { b: 'x', c: true }];
    expect(aggregateCount(records)).toBe(3);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 18. aggregateGroupBy
// ─────────────────────────────────────────────────────────────────────────────

describe('aggregateGroupBy', () => {
  it('returns empty object for empty array', () => {
    expect(aggregateGroupBy([], 'type')).toEqual({});
  });

  it('groups into single group when all same', () => {
    const records = [{ type: 'a' }, { type: 'a' }, { type: 'a' }];
    const result = aggregateGroupBy(records, 'type');
    expect(Object.keys(result)).toHaveLength(1);
    expect(result['a']).toHaveLength(3);
  });

  it('groups into multiple groups', () => {
    const records = [{ type: 'a' }, { type: 'b' }, { type: 'a' }];
    const result = aggregateGroupBy(records, 'type');
    expect(Object.keys(result)).toHaveLength(2);
    expect(result['a']).toHaveLength(2);
    expect(result['b']).toHaveLength(1);
  });

  it('each record appears once in result', () => {
    const records = [{ g: 'x' }, { g: 'y' }, { g: 'x' }];
    const result = aggregateGroupBy(records, 'g');
    const total = Object.values(result).reduce((s, arr) => s + arr.length, 0);
    expect(total).toBe(3);
  });

  it('missing field treated as empty string group', () => {
    const records = [{ other: 1 }];
    const result = aggregateGroupBy(records, 'type');
    expect('' in result).toBe(true);
  });

  it('original records are not mutated', () => {
    const records = [{ g: 'a' }, { g: 'b' }];
    aggregateGroupBy(records, 'g');
    expect(records).toHaveLength(2);
  });

  it('preserves all fields in grouped records', () => {
    const records = [{ type: 'a', value: 42 }];
    const result = aggregateGroupBy(records, 'type');
    expect(result['a'][0]['value']).toBe(42);
  });

  // Loop: group by with various group counts
  [2, 3, 4, 5].forEach((numGroups) => {
    it(`groups into exactly ${numGroups} groups`, () => {
      const records = Array.from({ length: numGroups * 3 }, (_, i) => ({ g: `group${i % numGroups}` }));
      const result = aggregateGroupBy(records, 'g');
      expect(Object.keys(result)).toHaveLength(numGroups);
    });
  });

  // Loop: group by numeric string values
  ['1', '2', '3'].forEach((key) => {
    it(`group key '${key}' exists in result`, () => {
      const records = [{ g: '1' }, { g: '2' }, { g: '3' }];
      const result = aggregateGroupBy(records, 'g');
      expect(key in result).toBe(true);
    });
  });

  it('each group array is an array', () => {
    const records = [{ g: 'a' }, { g: 'b' }];
    const result = aggregateGroupBy(records, 'g');
    Object.values(result).forEach(arr => expect(Array.isArray(arr)).toBe(true));
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 19. sortRecords
// ─────────────────────────────────────────────────────────────────────────────

describe('sortRecords', () => {
  it('returns empty array for empty input', () => {
    expect(sortRecords([], 'val')).toEqual([]);
  });

  it('sorts numbers ascending by default', () => {
    const records = [{ n: 3 }, { n: 1 }, { n: 2 }];
    const result = sortRecords(records, 'n');
    expect(result.map(r => r['n'])).toEqual([1, 2, 3]);
  });

  it('sorts numbers descending', () => {
    const records = [{ n: 1 }, { n: 3 }, { n: 2 }];
    const result = sortRecords(records, 'n', 'desc');
    expect(result.map(r => r['n'])).toEqual([3, 2, 1]);
  });

  it('sorts strings ascending', () => {
    const records = [{ s: 'c' }, { s: 'a' }, { s: 'b' }];
    const result = sortRecords(records, 's');
    expect(result.map(r => r['s'])).toEqual(['a', 'b', 'c']);
  });

  it('sorts strings descending', () => {
    const records = [{ s: 'a' }, { s: 'c' }, { s: 'b' }];
    const result = sortRecords(records, 's', 'desc');
    expect(result.map(r => r['s'])).toEqual(['c', 'b', 'a']);
  });

  it('original array is not mutated', () => {
    const records = [{ n: 3 }, { n: 1 }];
    sortRecords(records, 'n');
    expect(records[0]['n']).toBe(3);
  });

  it('returns new array reference', () => {
    const records = [{ n: 1 }];
    expect(sortRecords(records, 'n')).not.toBe(records);
  });

  it('single record returns same single record', () => {
    const records = [{ n: 42 }];
    const result = sortRecords(records, 'n');
    expect(result).toHaveLength(1);
    expect(result[0]['n']).toBe(42);
  });

  it('all records preserved after sort', () => {
    const records = [{ n: 5 }, { n: 2 }, { n: 8 }, { n: 1 }];
    const result = sortRecords(records, 'n');
    expect(result).toHaveLength(4);
  });

  it('asc is default when direction omitted', () => {
    const records = [{ n: 5 }, { n: 1 }, { n: 3 }];
    expect(sortRecords(records, 'n')[0]['n']).toBe(1);
  });

  // Loop: numeric asc sorted correctly
  [
    [5, 3, 1, 4, 2],
    [10, 7, 3, 9, 1],
    [100, 50, 25, 75],
  ].forEach((nums, i) => {
    it(`sorts numeric set ${i + 1} ascending`, () => {
      const records = nums.map(n => ({ n }));
      const result = sortRecords(records, 'n', 'asc');
      const sorted = result.map(r => r['n']);
      expect(sorted).toEqual([...nums].sort((a, b) => a - b));
    });

    it(`sorts numeric set ${i + 1} descending`, () => {
      const records = nums.map(n => ({ n }));
      const result = sortRecords(records, 'n', 'desc');
      const sorted = result.map(r => r['n']);
      expect(sorted).toEqual([...nums].sort((a, b) => b - a));
    });
  });

  it('sorts large array', () => {
    const records = Array.from({ length: 100 }, (_, i) => ({ n: 100 - i }));
    const result = sortRecords(records, 'n', 'asc');
    expect(result[0]['n']).toBe(1);
    expect(result[99]['n']).toBe(100);
  });

  it('non-numeric field compared as string', () => {
    const records = [{ val: 'banana' }, { val: 'apple' }, { val: 'cherry' }];
    const result = sortRecords(records, 'val', 'asc');
    expect(result[0]['val']).toBe('apple');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 20. deduplicateRecords
// ─────────────────────────────────────────────────────────────────────────────

describe('deduplicateRecords', () => {
  it('returns empty for empty input', () => {
    expect(deduplicateRecords([], 'id')).toEqual([]);
  });

  it('returns single record when no duplicates', () => {
    const records = [{ id: 1 }, { id: 2 }, { id: 3 }];
    expect(deduplicateRecords(records, 'id')).toHaveLength(3);
  });

  it('removes duplicate records', () => {
    const records = [{ id: 1 }, { id: 2 }, { id: 1 }];
    const result = deduplicateRecords(records, 'id');
    expect(result).toHaveLength(2);
  });

  it('keeps the first occurrence', () => {
    const records = [{ id: 1, val: 'first' }, { id: 1, val: 'second' }];
    const result = deduplicateRecords(records, 'id');
    expect(result[0]['val']).toBe('first');
  });

  it('original array is not mutated', () => {
    const records = [{ id: 1 }, { id: 1 }];
    deduplicateRecords(records, 'id');
    expect(records).toHaveLength(2);
  });

  it('all duplicate records removed', () => {
    const records = [{ id: 'x' }, { id: 'x' }, { id: 'x' }];
    const result = deduplicateRecords(records, 'id');
    expect(result).toHaveLength(1);
  });

  it('works with string keys', () => {
    const records = [{ code: 'abc' }, { code: 'def' }, { code: 'abc' }];
    const result = deduplicateRecords(records, 'code');
    expect(result).toHaveLength(2);
  });

  it('records without the key field all get the same key (undefined)', () => {
    const records = [{ a: 1 }, { a: 2 }];
    const result = deduplicateRecords(records, 'id');
    expect(result).toHaveLength(1);
  });

  it('result is a new array', () => {
    const records = [{ id: 1 }];
    expect(deduplicateRecords(records, 'id')).not.toBe(records);
  });

  // Loop: deduplicate various patterns
  [
    { records: [{ id: 1 }, { id: 2 }, { id: 3 }], expected: 3 },
    { records: [{ id: 1 }, { id: 1 }, { id: 2 }], expected: 2 },
    { records: [{ id: 1 }, { id: 1 }, { id: 1 }], expected: 1 },
    { records: [{ id: 1 }, { id: 2 }, { id: 1 }, { id: 2 }], expected: 2 },
  ].forEach(({ records, expected }, i) => {
    it(`dedup case ${i + 1}: expected ${expected} unique records`, () => {
      expect(deduplicateRecords(records as Record<string, unknown>[], 'id')).toHaveLength(expected);
    });
  });

  // Loop: various key field names
  ['id', 'uuid', 'code', 'ref', 'sku'].forEach((keyField) => {
    it(`deduplicates using key field '${keyField}'`, () => {
      const r1: Record<string, unknown> = {};
      r1[keyField] = 'val1';
      const r2: Record<string, unknown> = {};
      r2[keyField] = 'val1';
      const r3: Record<string, unknown> = {};
      r3[keyField] = 'val2';
      const result = deduplicateRecords([r1, r2, r3], keyField);
      expect(result).toHaveLength(2);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 21. isValidStepType
// ─────────────────────────────────────────────────────────────────────────────

describe('isValidStepType', () => {
  ALL_STEP_TYPES.forEach((t) => {
    it(`'${t}' is a valid step type`, () => {
      expect(isValidStepType(t)).toBe(true);
    });
  });

  INVALID_TYPE_STRINGS.forEach((s) => {
    it(`'${s}' is not a valid step type`, () => {
      expect(isValidStepType(s)).toBe(false);
    });
  });

  it('returns boolean', () => {
    expect(typeof isValidStepType('extract')).toBe('boolean');
    expect(typeof isValidStepType('invalid')).toBe('boolean');
  });

  it('case sensitive — uppercase is invalid', () => {
    expect(isValidStepType('EXTRACT')).toBe(false);
    expect(isValidStepType('TRANSFORM')).toBe(false);
  });

  it('partial match is invalid', () => {
    expect(isValidStepType('ext')).toBe(false);
    expect(isValidStepType('trans')).toBe(false);
  });

  it('extra whitespace is invalid', () => {
    expect(isValidStepType(' sort')).toBe(false);
    expect(isValidStepType('sort ')).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 22. isValidStepStatus
// ─────────────────────────────────────────────────────────────────────────────

describe('isValidStepStatus', () => {
  ALL_STEP_STATUSES.forEach((s) => {
    it(`'${s}' is a valid step status`, () => {
      expect(isValidStepStatus(s)).toBe(true);
    });
  });

  INVALID_STATUS_STRINGS.forEach((s) => {
    it(`'${s}' is not a valid step status`, () => {
      expect(isValidStepStatus(s)).toBe(false);
    });
  });

  it('returns boolean', () => {
    expect(typeof isValidStepStatus('pending')).toBe('boolean');
    expect(typeof isValidStepStatus('bad')).toBe('boolean');
  });

  it('case sensitive', () => {
    expect(isValidStepStatus('PENDING')).toBe(false);
    expect(isValidStepStatus('Running')).toBe(false);
  });

  it('partial match is invalid', () => {
    expect(isValidStepStatus('run')).toBe(false);
    expect(isValidStepStatus('complet')).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 23. isValidPipelineStatus
// ─────────────────────────────────────────────────────────────────────────────

describe('isValidPipelineStatus', () => {
  ALL_PIPELINE_STATUSES.forEach((s) => {
    it(`'${s}' is a valid pipeline status`, () => {
      expect(isValidPipelineStatus(s)).toBe(true);
    });
  });

  INVALID_PIPELINE_STATUS_STRINGS.forEach((s) => {
    it(`'${s}' is not a valid pipeline status`, () => {
      expect(isValidPipelineStatus(s)).toBe(false);
    });
  });

  it('returns boolean', () => {
    expect(typeof isValidPipelineStatus('idle')).toBe('boolean');
    expect(typeof isValidPipelineStatus('xyz')).toBe('boolean');
  });

  it('case sensitive', () => {
    expect(isValidPipelineStatus('IDLE')).toBe(false);
    expect(isValidPipelineStatus('Paused')).toBe(false);
  });

  it('partial match invalid', () => {
    expect(isValidPipelineStatus('run')).toBe(false);
    expect(isValidPipelineStatus('fail')).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 24. getPipelineProgress
// ─────────────────────────────────────────────────────────────────────────────

describe('getPipelineProgress', () => {
  it('returns 0 for pipeline with no steps', () => {
    expect(getPipelineProgress(makeBasePipeline())).toBe(0);
  });

  it('returns 0 when all steps are pending', () => {
    const p = createPipeline('p', 'P', [makeStep('a', 0), makeStep('b', 1)]);
    expect(getPipelineProgress(p)).toBe(0);
  });

  it('returns 100 when all steps are completed', () => {
    let p = createPipeline('p', 'P', [makeStep('a', 0), makeStep('b', 1)]);
    p = updateStepStatus(p, 'a', 'completed');
    p = updateStepStatus(p, 'b', 'completed');
    expect(getPipelineProgress(p)).toBe(100);
  });

  it('returns 100 when all steps are skipped', () => {
    let p = createPipeline('p', 'P', [makeStep('a', 0), makeStep('b', 1)]);
    p = updateStepStatus(p, 'a', 'skipped');
    p = updateStepStatus(p, 'b', 'skipped');
    expect(getPipelineProgress(p)).toBe(100);
  });

  it('returns 50 when half steps completed', () => {
    let p = createPipeline('p', 'P', [makeStep('a', 0), makeStep('b', 1)]);
    p = updateStepStatus(p, 'a', 'completed');
    expect(getPipelineProgress(p)).toBe(50);
  });

  it('returns correct percentage for 1/4 steps completed', () => {
    let p = createPipeline('p', 'P', [makeStep('a', 0), makeStep('b', 1), makeStep('c', 2), makeStep('d', 3)]);
    p = updateStepStatus(p, 'a', 'completed');
    expect(getPipelineProgress(p)).toBe(25);
  });

  it('returns correct percentage for 3/4 steps completed', () => {
    let p = createPipeline('p', 'P', [makeStep('a', 0), makeStep('b', 1), makeStep('c', 2), makeStep('d', 3)]);
    p = updateStepStatus(p, 'a', 'completed');
    p = updateStepStatus(p, 'b', 'completed');
    p = updateStepStatus(p, 'c', 'completed');
    expect(getPipelineProgress(p)).toBe(75);
  });

  it('mixed completed and skipped count toward progress', () => {
    let p = createPipeline('p', 'P', [makeStep('a', 0), makeStep('b', 1), makeStep('c', 2), makeStep('d', 3)]);
    p = updateStepStatus(p, 'a', 'completed');
    p = updateStepStatus(p, 'b', 'skipped');
    expect(getPipelineProgress(p)).toBe(50);
  });

  it('running status does not count toward progress', () => {
    let p = createPipeline('p', 'P', [makeStep('a', 0), makeStep('b', 1)]);
    p = updateStepStatus(p, 'a', 'running');
    expect(getPipelineProgress(p)).toBe(0);
  });

  it('failed status does not count toward progress', () => {
    let p = createPipeline('p', 'P', [makeStep('a', 0), makeStep('b', 1)]);
    p = updateStepStatus(p, 'a', 'failed');
    expect(getPipelineProgress(p)).toBe(0);
  );

  // Loop: progress with various step counts and completions
  [
    { total: 5, done: 0, expected: 0 },
    { total: 5, done: 1, expected: 20 },
    { total: 5, done: 2, expected: 40 },
    { total: 5, done: 3, expected: 60 },
    { total: 5, done: 4, expected: 80 },
    { total: 5, done: 5, expected: 100 },
    { total: 10, done: 5, expected: 50 },
  ].forEach(({ total, done, expected }) => {
    it(`progress with ${done}/${total} steps done = ${expected}%`, () => {
      const steps = Array.from({ length: total }, (_, i) => makeStep(`s${i}`, i));
      let p = createPipeline('p', 'P', steps);
      for (let i = 0; i < done; i++) {
        p = updateStepStatus(p, `s${i}`, 'completed');
      }
      expect(getPipelineProgress(p)).toBeCloseTo(expected);
    });
  });

  it('progress is a number', () => {
    expect(typeof getPipelineProgress(makeBasePipeline())).toBe('number');
  });

  it('progress does not exceed 100', () => {
    let p = createPipeline('p', 'P', [makeStep('a', 0)]);
    p = updateStepStatus(p, 'a', 'completed');
    expect(getPipelineProgress(p)).toBeLessThanOrEqual(100);
  });

  it('progress is not negative', () => {
    expect(getPipelineProgress(makeBasePipeline())).toBeGreaterThanOrEqual(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 25. makeStepResult
// ─────────────────────────────────────────────────────────────────────────────

describe('makeStepResult', () => {
  it('returns an object', () => {
    expect(typeof makeStepResult('s1', 'completed', 10, 10, 100)).toBe('object');
  });

  it('sets stepId', () => {
    expect(makeStepResult('my-step', 'completed', 0, 0, 0).stepId).toBe('my-step');
  });

  it('sets status', () => {
    expect(makeStepResult('s', 'failed', 0, 0, 0).status).toBe('failed');
  });

  it('sets recordsIn', () => {
    expect(makeStepResult('s', 'completed', 42, 0, 0).recordsIn).toBe(42);
  });

  it('sets recordsOut', () => {
    expect(makeStepResult('s', 'completed', 0, 7, 0).recordsOut).toBe(7);
  });

  it('sets durationMs', () => {
    expect(makeStepResult('s', 'completed', 0, 0, 500).durationMs).toBe(500);
  });

  it('error is undefined when not provided', () => {
    expect(makeStepResult('s', 'completed', 0, 0, 0).error).toBeUndefined();
  });

  it('error is set when provided', () => {
    expect(makeStepResult('s', 'failed', 0, 0, 0, 'Something went wrong').error).toBe('Something went wrong');
  });

  it('no error key when error not provided', () => {
    const result = makeStepResult('s', 'completed', 0, 0, 0);
    expect('error' in result).toBe(false);
  });

  it('error key present when error is provided', () => {
    const result = makeStepResult('s', 'failed', 0, 0, 0, 'oops');
    expect('error' in result).toBe(true);
  });

  // Loop: all statuses
  ALL_STEP_STATUSES.forEach((status) => {
    it(`creates step result with status '${status}'`, () => {
      expect(makeStepResult('s', status, 0, 0, 0).status).toBe(status);
    });
  });

  // Loop: various recordsIn/recordsOut combos
  [
    { recordsIn: 100, recordsOut: 95 },
    { recordsIn: 0, recordsOut: 0 },
    { recordsIn: 1000, recordsOut: 999 },
    { recordsIn: 500, recordsOut: 500 },
  ].forEach(({ recordsIn, recordsOut }, i) => {
    it(`step result set ${i + 1}: recordsIn=${recordsIn}, recordsOut=${recordsOut}`, () => {
      const result = makeStepResult('s', 'completed', recordsIn, recordsOut, 100);
      expect(result.recordsIn).toBe(recordsIn);
      expect(result.recordsOut).toBe(recordsOut);
    });
  });

  // Loop: various durations
  [0, 1, 100, 1000, 5000, 60000].forEach((ms) => {
    it(`durationMs of ${ms} is stored correctly`, () => {
      expect(makeStepResult('s', 'completed', 0, 0, ms).durationMs).toBe(ms);
    });
  });

  // Loop: various step IDs
  ['step-1', 'extract-data', 'load-db', '', 'uuid-abc-123'].forEach((id) => {
    it(`stepId '${id}' is stored correctly`, () => {
      expect(makeStepResult(id, 'completed', 0, 0, 0).stepId).toBe(id);
    });
  });

  it('each call returns new object', () => {
    const r1 = makeStepResult('s', 'completed', 0, 0, 0);
    const r2 = makeStepResult('s', 'completed', 0, 0, 0);
    expect(r1).not.toBe(r2);
  });

  it('base keys always present', () => {
    const result = makeStepResult('s', 'completed', 10, 8, 200);
    expect('stepId' in result).toBe(true);
    expect('status' in result).toBe(true);
    expect('recordsIn' in result).toBe(true);
    expect('recordsOut' in result).toBe(true);
    expect('durationMs' in result).toBe(true);
  });

  it('error string content is preserved', () => {
    const err = 'Connection refused at host:5432';
    expect(makeStepResult('s', 'failed', 100, 0, 250, err).error).toBe(err);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 26. Integration / Composed Scenarios
// ─────────────────────────────────────────────────────────────────────────────

describe('Integration: pipeline composition', () => {
  it('full pipeline creation with steps', () => {
    let p = createPipeline('etl-1', 'ETL Pipeline');
    p = addStepToPipeline(p, createStep('extract', 'Extract', 'extract', 0));
    p = addStepToPipeline(p, createStep('transform', 'Transform', 'transform', 1));
    p = addStepToPipeline(p, createStep('load', 'Load', 'load', 2));
    expect(p.steps).toHaveLength(3);
    expect(p.id).toBe('etl-1');
  });

  it('pipeline sort after adding out-of-order steps', () => {
    let p = createPipeline('p', 'P');
    p = addStepToPipeline(p, createStep('s3', 'S3', 'load', 2));
    p = addStepToPipeline(p, createStep('s1', 'S1', 'extract', 0));
    p = addStepToPipeline(p, createStep('s2', 'S2', 'transform', 1));
    p = sortStepsByOrder(p);
    expect(p.steps.map(s => s.id)).toEqual(['s1', 's2', 's3']);
  });

  it('step status tracking through lifecycle', () => {
    let p = createPipeline('p', 'P', [createStep('s1', 'S1', 'extract', 0)]);
    expect(getStepById(p, 's1')?.status).toBe('pending');
    p = updateStepStatus(p, 's1', 'running');
    expect(getStepById(p, 's1')?.status).toBe('running');
    p = updateStepStatus(p, 's1', 'completed');
    expect(getStepById(p, 's1')?.status).toBe('completed');
  });

  it('progress increases as steps complete', () => {
    const ids = ['s1', 's2', 's3', 's4'];
    let p = createPipeline('p', 'P', ids.map((id, i) => makeStep(id, i)));
    let prev = getPipelineProgress(p);
    for (const id of ids) {
      p = updateStepStatus(p, id, 'completed');
      const current = getPipelineProgress(p);
      expect(current).toBeGreaterThan(prev);
      prev = current;
    }
    expect(getPipelineProgress(p)).toBe(100);
  });

  it('full ETL data flow simulation', () => {
    // Extract
    const rawData = [
      { id: 1, name: 'alice', score: 85, dept: 'eng' },
      { id: 2, name: 'bob', score: 42, dept: 'sales' },
      { id: 3, name: 'carol', score: 91, dept: 'eng' },
      { id: 4, name: 'dave', score: 42, dept: 'hr' },
    ];

    // Transform: uppercase names
    const transformed = applyTransform(rawData, r => ({ ...r, name: String(r['name']).toUpperCase() }));
    expect(transformed[0]['name']).toBe('ALICE');

    // Filter: score > 50
    const filtered = applyFilter(transformed, r => (r['score'] as number) > 50);
    expect(filtered).toHaveLength(2);

    // Rename
    const renamed = applyRename(filtered, { dept: 'department' });
    expect('department' in renamed[0]).toBe(true);

    // Aggregate
    expect(aggregateSum(filtered, 'score')).toBe(176);
    expect(aggregateAvg(filtered, 'score')).toBeCloseTo(88);
    expect(aggregateCount(filtered)).toBe(2);

    // Group by department
    const grouped = aggregateGroupBy(filtered, 'dept');
    expect('eng' in grouped).toBe(true);
  });

  it('remove then add step workflow', () => {
    let p = createPipeline('p', 'P', [makeStep('a', 0), makeStep('b', 1), makeStep('c', 2)]);
    p = removeStepFromPipeline(p, 'b');
    expect(p.steps).toHaveLength(2);
    p = addStepToPipeline(p, makeStep('d', 3));
    expect(p.steps).toHaveLength(3);
    expect(p.steps.find(s => s.id === 'b')).toBeUndefined();
    expect(p.steps.find(s => s.id === 'd')).toBeDefined();
  });

  it('validate → filter pattern', () => {
    const schema: DataSchema = {
      fields: [{ name: 'id', type: 'number', required: true }, { name: 'name', type: 'string', required: true }],
    };
    const records = [
      { id: 1, name: 'Valid' },
      { id: 2 },
      { id: 3, name: 'Also Valid' },
    ];
    const { valid } = validateRecords(records, schema);
    expect(valid).toHaveLength(2);
    const result = applyFilter(valid, r => (r['id'] as number) > 1);
    expect(result).toHaveLength(1);
    expect(result[0]['name']).toBe('Also Valid');
  });

  it('sort → deduplicate → project pipeline', () => {
    const records = [
      { id: 3, name: 'Charlie', extra: 'x' },
      { id: 1, name: 'Alice', extra: 'y' },
      { id: 1, name: 'Alice Duplicate', extra: 'z' },
      { id: 2, name: 'Bob', extra: 'w' },
    ];
    const sorted = sortRecords(records, 'id', 'asc');
    const deduped = deduplicateRecords(sorted, 'id');
    const projected = applyProjection(deduped, ['id', 'name']);
    expect(projected).toHaveLength(3);
    expect(projected.every(r => !('extra' in r))).toBe(true);
    expect(projected[0]['id']).toBe(1);
  });

  it('applyDefaultValues → validate passes for previously invalid records', () => {
    const schema: DataSchema = {
      fields: [
        { name: 'status', type: 'string', required: true, defaultValue: 'active' },
        { name: 'count', type: 'number', required: true, defaultValue: 0 },
      ],
    };
    const records = [{ name: 'Test' }];
    const withDefaults = applyDefaultValues(records, schema);
    const { valid, invalid } = validateRecords(withDefaults, schema);
    expect(valid).toHaveLength(1);
    expect(invalid).toHaveLength(0);
  });

  it('makeStepResult for each step in a pipeline run', () => {
    const stepIds = ['extract', 'transform', 'load'];
    const results = stepIds.map((id, i) =>
      makeStepResult(id, 'completed', 100, 100 - i, (i + 1) * 50)
    );
    expect(results).toHaveLength(3);
    expect(results[0].recordsIn).toBe(100);
    expect(results[2].durationMs).toBe(150);
  });

  // Loop: run pipeline status through all lifecycle statuses
  ALL_PIPELINE_STATUSES.forEach((status) => {
    it(`pipeline can have status '${status}'`, () => {
      expect(isValidPipelineStatus(status)).toBe(true);
    });
  });

  // Loop: check step type validity for pipeline steps
  ALL_STEP_TYPES.forEach((type) => {
    it(`can create pipeline step of type '${type}' and validate type`, () => {
      const step = createStep(`id-${type}`, `Name`, type, 0);
      expect(step.type).toBe(type);
      expect(isValidStepType(step.type)).toBe(true);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 27. Edge Cases and Boundary Conditions
// ─────────────────────────────────────────────────────────────────────────────

describe('Edge Cases', () => {
  it('applyTransform with 1000 records', () => {
    const records = Array.from({ length: 1000 }, (_, i) => ({ i }));
    const result = applyTransform(records, r => ({ ...r, doubled: (r['i'] as number) * 2 }));
    expect(result).toHaveLength(1000);
    expect(result[500]['doubled']).toBe(1000);
  });

  it('applyFilter keeps none of 1000 records', () => {
    const records = Array.from({ length: 1000 }, (_, i) => ({ i }));
    const result = applyFilter(records, () => false);
    expect(result).toHaveLength(0);
  });

  it('applyFilter keeps all of 1000 records', () => {
    const records = Array.from({ length: 1000 }, (_, i) => ({ i }));
    const result = applyFilter(records, () => true);
    expect(result).toHaveLength(1000);
  });

  it('aggregateSum with 1000 records each val=1 = 1000', () => {
    const records = Array.from({ length: 1000 }, () => ({ val: 1 }));
    expect(aggregateSum(records, 'val')).toBe(1000);
  });

  it('deduplicateRecords with 500 duplicates leaves 1', () => {
    const records = Array.from({ length: 500 }, () => ({ id: 'same' }));
    expect(deduplicateRecords(records, 'id')).toHaveLength(1);
  });

  it('sortRecords with already sorted array is stable', () => {
    const records = [1, 2, 3, 4, 5].map(n => ({ n }));
    const result = sortRecords(records, 'n', 'asc');
    expect(result.map(r => r['n'])).toEqual([1, 2, 3, 4, 5]);
  });

  it('aggregateGroupBy distributes 100 records into 10 groups evenly', () => {
    const records = Array.from({ length: 100 }, (_, i) => ({ g: `group${i % 10}` }));
    const grouped = aggregateGroupBy(records, 'g');
    Object.values(grouped).forEach(arr => expect(arr).toHaveLength(10));
  });

  it('pipeline with 100 steps, all completed = 100% progress', () => {
    const stepIds = Array.from({ length: 100 }, (_, i) => `s${i}`);
    let p = createPipeline('p', 'P', stepIds.map((id, i) => makeStep(id, i)));
    for (const id of stepIds) p = updateStepStatus(p, id, 'completed');
    expect(getPipelineProgress(p)).toBe(100);
  });

  it('applyRename with 100 fields all renamed', () => {
    const mapping: Record<string, string> = {};
    const record: Record<string, unknown> = {};
    for (let i = 0; i < 100; i++) {
      const oldKey = `field${i}`;
      const newKey = `renamed${i}`;
      mapping[oldKey] = newKey;
      record[oldKey] = i;
    }
    const result = applyRename([record], mapping);
    for (let i = 0; i < 100; i++) {
      expect(result[0][`renamed${i}`]).toBe(i);
      expect(`field${i}` in result[0]).toBe(false);
    }
  });

  it('validateRecords with mixed schema - 50% valid', () => {
    const schema: DataSchema = { fields: [{ name: 'id', type: 'number', required: true }] };
    const records = Array.from({ length: 100 }, (_, i) =>
      i % 2 === 0 ? { id: i } : { other: i }
    );
    const { valid, invalid } = validateRecords(records, schema);
    expect(valid).toHaveLength(50);
    expect(invalid).toHaveLength(50);
  });

  it('createPipeline with 0 steps, then add 50 steps one by one', () => {
    let p = createPipeline('big', 'Big Pipeline');
    for (let i = 0; i < 50; i++) p = addStepToPipeline(p, makeStep(`s${i}`, i));
    expect(p.steps).toHaveLength(50);
  });

  it('sortRecords handles equal values without error', () => {
    const records = [{ n: 5 }, { n: 5 }, { n: 5 }];
    const result = sortRecords(records, 'n');
    expect(result).toHaveLength(3);
    expect(result.every(r => r['n'] === 5)).toBe(true);
  });

  // Loop: quick stress tests for aggregation
  [10, 50, 100, 500].forEach((n) => {
    it(`aggregateCount on ${n} records`, () => {
      const records = Array.from({ length: n }, (_, i) => ({ i }));
      expect(aggregateCount(records)).toBe(n);
    });
  });

  // Loop: applyProjection with single field on many records
  [10, 50, 100].forEach((n) => {
    it(`applyProjection on ${n} records picks single field`, () => {
      const records = Array.from({ length: n }, (_, i) => ({ id: i, name: `n${i}`, extra: true }));
      const result = applyProjection(records, ['id']);
      expect(result).toHaveLength(n);
      expect(result.every(r => !('name' in r) && !('extra' in r))).toBe(true);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 28. Type guard exhaustiveness loops
// ─────────────────────────────────────────────────────────────────────────────

describe('Type guard completeness', () => {
  // Each valid step type also creates valid step
  ALL_STEP_TYPES.forEach((t) => {
    it(`createStep with type '${t}' and isValidStepType are consistent`, () => {
      const step = createStep('id', 'name', t, 0);
      expect(isValidStepType(step.type)).toBe(true);
    });
  });

  // Each valid step status can be set and is validated
  ALL_STEP_STATUSES.forEach((status) => {
    it(`updateStepStatus to '${status}' produces isValidStepStatus=true`, () => {
      const p = createPipeline('p', 'P', [makeStep('s1', 0)]);
      const updated = updateStepStatus(p, 's1', status);
      const foundStatus = updated.steps[0].status;
      expect(isValidStepStatus(foundStatus)).toBe(true);
    });
  });

  // makeStepResult with each status
  ALL_STEP_STATUSES.forEach((status) => {
    it(`makeStepResult with status '${status}' has isValidStepStatus=true`, () => {
      const r = makeStepResult('id', status, 0, 0, 0);
      expect(isValidStepStatus(r.status)).toBe(true);
    });
  });

  // isValidPipelineStatus for all valid statuses
  ALL_PIPELINE_STATUSES.forEach((status) => {
    it(`freshly created pipeline status passes isValidPipelineStatus check for '${status}'`, () => {
      expect(isValidPipelineStatus(status)).toBe(true);
    });
  });

  // Every step type creates a step where type is unchanged
  ALL_STEP_TYPES.forEach((t) => {
    it(`step type '${t}' roundtrip through createStep then getStepById`, () => {
      const p = createPipeline('p', 'P', [createStep(`id-${t}`, 'n', t, 0)]);
      const found = getStepById(p, `id-${t}`);
      expect(found?.type).toBe(t);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 29. Additional applyTransform / applyFilter combos
// ─────────────────────────────────────────────────────────────────────────────

describe('Transform and Filter chains', () => {
  const baseData = Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    value: (i + 1) * 10,
    category: i % 3 === 0 ? 'A' : i % 3 === 1 ? 'B' : 'C',
    active: i % 2 === 0,
  }));

  it('filter then transform', () => {
    const filtered = applyFilter(baseData, r => r['active'] === true);
    const transformed = applyTransform(filtered, r => ({ ...r, doubled: (r['value'] as number) * 2 }));
    expect(transformed.every(r => r['active'] === true)).toBe(true);
    expect(transformed.every(r => 'doubled' in r)).toBe(true);
  });

  it('transform then filter', () => {
    const transformed = applyTransform(baseData, r => ({ ...r, score: (r['value'] as number) / 10 }));
    const filtered = applyFilter(transformed, r => (r['score'] as number) > 10);
    expect(filtered.every(r => (r['score'] as number) > 10)).toBe(true);
  });

  it('double filter reduces records', () => {
    const f1 = applyFilter(baseData, r => r['active'] === true);
    const f2 = applyFilter(f1, r => r['category'] === 'A');
    expect(f2.length).toBeLessThanOrEqual(f1.length);
  });

  it('double transform accumulates fields', () => {
    const t1 = applyTransform(baseData, r => ({ ...r, tag1: 'x' }));
    const t2 = applyTransform(t1, r => ({ ...r, tag2: 'y' }));
    expect(t2.every(r => 'tag1' in r && 'tag2' in r)).toBe(true);
  });

  // Loop: category filter
  ['A', 'B', 'C'].forEach((cat) => {
    it(`filter by category '${cat}' returns only those records`, () => {
      const result = applyFilter(baseData, r => r['category'] === cat);
      expect(result.every(r => r['category'] === cat)).toBe(true);
    });
  });

  // Loop: transform multipliers
  [2, 3, 5, 10].forEach((multiplier) => {
    it(`transform multiplies value by ${multiplier}`, () => {
      const result = applyTransform([{ value: 10 }], r => ({ ...r, result: (r['value'] as number) * multiplier }));
      expect(result[0]['result']).toBe(10 * multiplier);
    });
  });

  it('rename then project', () => {
    const records = [{ first_name: 'Alice', last_name: 'Smith', age: 30 }];
    const renamed = applyRename(records, { first_name: 'firstName', last_name: 'lastName' });
    const projected = applyProjection(renamed, ['firstName', 'lastName']);
    expect(projected[0]).toEqual({ firstName: 'Alice', lastName: 'Smith' });
    expect('age' in projected[0]).toBe(false);
  });

  it('sort then group produces sorted sub-arrays', () => {
    const records = [
      { g: 'A', n: 3 }, { g: 'B', n: 1 }, { g: 'A', n: 1 }, { g: 'B', n: 2 },
    ];
    const sorted = sortRecords(records, 'n', 'asc');
    const grouped = aggregateGroupBy(sorted, 'g');
    // A group should be [1, 3], B group should be [1, 2]
    expect(grouped['A'].map(r => r['n'])).toEqual([1, 3]);
    expect(grouped['B'].map(r => r['n'])).toEqual([1, 2]);
  });

  it('project → sum aggregate', () => {
    const records = [{ id: 1, score: 10, name: 'a' }, { id: 2, score: 20, name: 'b' }];
    const projected = applyProjection(records, ['score']);
    const sum = aggregateSum(projected, 'score');
    expect(sum).toBe(30);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 30. Schema validation variety
// ─────────────────────────────────────────────────────────────────────────────

describe('Schema validation variety', () => {
  const schemas = [
    {
      name: 'user schema',
      schema: { fields: [{ name: 'userId', type: 'number' as const, required: true }, { name: 'email', type: 'string' as const, required: true }] },
      valid: { userId: 1, email: 'a@b.com' },
      invalid: { email: 'a@b.com' },
    },
    {
      name: 'product schema',
      schema: { fields: [{ name: 'sku', type: 'string' as const, required: true }, { name: 'price', type: 'number' as const, required: true }] },
      valid: { sku: 'ABC-123', price: 9.99 },
      invalid: { sku: 'ABC-123' },
    },
    {
      name: 'order schema',
      schema: { fields: [{ name: 'orderId', type: 'string' as const, required: true }, { name: 'qty', type: 'number' as const, required: true }, { name: 'status', type: 'string' as const, required: false }] },
      valid: { orderId: 'ORD-001', qty: 5 },
      invalid: { qty: 5 },
    },
  ];

  schemas.forEach(({ name, schema, valid, invalid }) => {
    it(`${name}: valid record produces no errors`, () => {
      expect(validateRecord(valid, schema)).toEqual([]);
    });

    it(`${name}: invalid record produces errors`, () => {
      expect(validateRecord(invalid, schema).length).toBeGreaterThan(0);
    });

    it(`${name}: validateRecords correctly splits`, () => {
      const result = validateRecords([valid, invalid], schema);
      expect(result.valid).toHaveLength(1);
      expect(result.invalid).toHaveLength(1);
    });
  });

  // Loop: all field types with defaultValue
  (['string', 'number', 'boolean', 'date', 'object', 'array', 'null'] as const).forEach((type) => {
    it(`FieldSchema type '${type}' accepted in DataSchema`, () => {
      const schema: DataSchema = { fields: [{ name: 'f', type, required: false }] };
      expect(schema.fields[0].type).toBe(type);
    });
  });
});
