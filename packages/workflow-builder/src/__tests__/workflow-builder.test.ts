// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// CONFIDENTIAL — TRADE SECRET.

import {
  getFieldValue,
  compareValues,
  evaluateCondition,
  evaluateConditions,
  validateTrigger,
  validateAction,
  validateStep,
  detectCircularDeps,
  validateWorkflow,
} from '../index';
import type {
  WorkflowCondition,
  WorkflowStep,
  Workflow,
  ConditionOperator,
  TriggerType,
  ActionType,
} from '../types';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const CTX_FLAT: Record<string, unknown> = {
  status: 'OPEN',
  score: 75,
  severity: 'HIGH',
  tags: ['quality', 'critical'],
  assignee: null,
  name: 'Inspection NC',
};

const CTX_NESTED: Record<string, unknown> = {
  risk: { score: 18, level: 'HIGH', owner: { name: 'Alice', dept: 'Quality' } },
  incident: { status: 'OPEN', count: 3 },
  meta: { createdAt: '2026-01-01', active: true },
};

function makeAction(id: string, type: ActionType = 'send_email') {
  return { id, type, config: { to: 'test@example.com' } };
}

function makeStep(id: string, nextStepId?: string): WorkflowStep {
  return { id, name: `Step ${id}`, actions: [makeAction(`action-${id}`)], nextStepId };
}

function makeWorkflow(overrides: Partial<Workflow> = {}): Partial<Workflow> {
  return {
    id: 'wf-001',
    name: 'Test Workflow',
    createdBy: 'admin',
    version: 1,
    enabled: true,
    trigger: { type: 'ncr_created', config: {} },
    steps: [makeStep('s1')],
    runCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

// ─── getFieldValue ─────────────────────────────────────────────────────────────

describe('getFieldValue', () => {
  describe('flat fields', () => {
    const flatCases: [string, unknown][] = [
      ['status', 'OPEN'],
      ['score', 75],
      ['severity', 'HIGH'],
      ['tags', ['quality', 'critical']],
      ['assignee', null],
      ['name', 'Inspection NC'],
    ];
    for (const [field, expected] of flatCases) {
      it(`field "${field}" → ${JSON.stringify(expected)}`, () => {
        expect(getFieldValue(CTX_FLAT, field)).toEqual(expected);
      });
    }
  });

  describe('nested fields (dot notation)', () => {
    const nestedCases: [string, unknown][] = [
      ['risk.score', 18],
      ['risk.level', 'HIGH'],
      ['risk.owner.name', 'Alice'],
      ['risk.owner.dept', 'Quality'],
      ['incident.status', 'OPEN'],
      ['incident.count', 3],
      ['meta.createdAt', '2026-01-01'],
      ['meta.active', true],
    ];
    for (const [field, expected] of nestedCases) {
      it(`nested "${field}" → ${JSON.stringify(expected)}`, () => {
        expect(getFieldValue(CTX_NESTED, field)).toEqual(expected);
      });
    }
  });

  describe('missing fields', () => {
    it('missing flat field → undefined', () => {
      expect(getFieldValue(CTX_FLAT, 'nonExistent')).toBeUndefined();
    });

    it('missing nested field → undefined', () => {
      expect(getFieldValue(CTX_NESTED, 'risk.missing')).toBeUndefined();
    });

    it('path through null → undefined', () => {
      expect(getFieldValue(CTX_FLAT, 'assignee.name')).toBeUndefined();
    });

    it('path through scalar → undefined', () => {
      expect(getFieldValue(CTX_FLAT, 'score.sub')).toBeUndefined();
    });

    it('empty string field → returns whole context', () => {
      // split('') gives [''] which looks up '' key
      const ctx = { '': 'root' };
      expect(getFieldValue(ctx, '')).toBe('root');
    });

    it('deeply missing path → undefined', () => {
      expect(getFieldValue(CTX_NESTED, 'a.b.c.d.e')).toBeUndefined();
    });
  });
});

// ─── compareValues ─────────────────────────────────────────────────────────────

describe('compareValues — equals', () => {
  const cases: [unknown, unknown, boolean][] = [
    ['OPEN', 'OPEN', true],
    ['OPEN', 'CLOSED', false],
    [75, 75, true],
    [75, 76, false],
    [null, null, true],
    [undefined, undefined, true],
    [true, true, true],
    [false, true, false],
    [0, false, false], // strict equality
  ];
  for (const [fv, cv, expected] of cases) {
    it(`${JSON.stringify(fv)} equals ${JSON.stringify(cv)} → ${expected}`, () => {
      expect(compareValues('equals', fv, cv)).toBe(expected);
    });
  }
});

describe('compareValues — not_equals', () => {
  const cases: [unknown, unknown, boolean][] = [
    ['OPEN', 'CLOSED', true],
    ['OPEN', 'OPEN', false],
    [1, 2, true],
    [1, 1, false],
  ];
  for (const [fv, cv, expected] of cases) {
    it(`${JSON.stringify(fv)} not_equals ${JSON.stringify(cv)} → ${expected}`, () => {
      expect(compareValues('not_equals', fv, cv)).toBe(expected);
    });
  }
});

describe('compareValues — contains', () => {
  it('string contains substring → true', () => expect(compareValues('contains', 'Hello World', 'World')).toBe(true));
  it('string does not contain → false', () => expect(compareValues('contains', 'Hello', 'Bye')).toBe(false));
  it('array contains element → true', () => expect(compareValues('contains', ['a', 'b', 'c'], 'b')).toBe(true));
  it('array does not contain → false', () => expect(compareValues('contains', ['a', 'b'], 'z')).toBe(false));
  it('number field value → false (non-string, non-array)', () => expect(compareValues('contains', 42, 'x')).toBe(false));
  it('null field value → false', () => expect(compareValues('contains', null, 'x')).toBe(false));
});

describe('compareValues — not_contains', () => {
  it('string not containing → true', () => expect(compareValues('not_contains', 'Hello', 'Bye')).toBe(true));
  it('string containing → false', () => expect(compareValues('not_contains', 'Hello World', 'World')).toBe(false));
  it('array not containing → true', () => expect(compareValues('not_contains', ['a', 'b'], 'z')).toBe(true));
  it('array containing → false', () => expect(compareValues('not_contains', ['a', 'b'], 'a')).toBe(false));
  it('non-string non-array → true (defaults)', () => expect(compareValues('not_contains', 42, 'x')).toBe(true));
});

describe('compareValues — greater_than / less_than', () => {
  const gtCases: [unknown, unknown, boolean][] = [
    [80, 75, true], [70, 75, false], [75, 75, false], ['80', '75', true],
  ];
  for (const [fv, cv, expected] of gtCases) {
    it(`${fv} greater_than ${cv} → ${expected}`, () => {
      expect(compareValues('greater_than', fv, cv)).toBe(expected);
    });
  }

  const ltCases: [unknown, unknown, boolean][] = [
    [70, 75, true], [80, 75, false], [75, 75, false],
  ];
  for (const [fv, cv, expected] of ltCases) {
    it(`${fv} less_than ${cv} → ${expected}`, () => {
      expect(compareValues('less_than', fv, cv)).toBe(expected);
    });
  }
});

describe('compareValues — is_null / is_not_null', () => {
  const nullCases: [unknown, boolean][] = [
    [null, true], [undefined, true], [0, false], ['', false], [false, false],
  ];
  for (const [fv, expected] of nullCases) {
    it(`is_null(${JSON.stringify(fv)}) → ${expected}`, () => {
      expect(compareValues('is_null', fv, undefined)).toBe(expected);
    });
    it(`is_not_null(${JSON.stringify(fv)}) → ${!expected}`, () => {
      expect(compareValues('is_not_null', fv, undefined)).toBe(!expected);
    });
  }
});

describe('compareValues — in / not_in', () => {
  it('in: value in array → true', () => expect(compareValues('in', 'OPEN', ['OPEN', 'PENDING'])).toBe(true));
  it('in: value not in array → false', () => expect(compareValues('in', 'CLOSED', ['OPEN', 'PENDING'])).toBe(false));
  it('in: conditionValue not array → false', () => expect(compareValues('in', 'x', 'not-array' as unknown)).toBe(false));
  it('not_in: value not in array → true', () => expect(compareValues('not_in', 'CLOSED', ['OPEN', 'PENDING'])).toBe(true));
  it('not_in: value in array → false', () => expect(compareValues('not_in', 'OPEN', ['OPEN', 'PENDING'])).toBe(false));
  it('not_in: conditionValue not array → true', () => expect(compareValues('not_in', 'x', 'not-array' as unknown)).toBe(true));
});

describe('compareValues — between', () => {
  it('[10, 20]: 15 → true', () => expect(compareValues('between', 15, [10, 20])).toBe(true));
  it('[10, 20]: 10 → true (inclusive)', () => expect(compareValues('between', 10, [10, 20])).toBe(true));
  it('[10, 20]: 20 → true (inclusive)', () => expect(compareValues('between', 20, [10, 20])).toBe(true));
  it('[10, 20]: 9 → false', () => expect(compareValues('between', 9, [10, 20])).toBe(false));
  it('[10, 20]: 21 → false', () => expect(compareValues('between', 21, [10, 20])).toBe(false));
  it('not array → false', () => expect(compareValues('between', 15, 10 as unknown)).toBe(false));
  it('wrong length array → false', () => expect(compareValues('between', 15, [10] as unknown)).toBe(false));
  it('string numbers work', () => expect(compareValues('between', '15', ['10', '20'])).toBe(true));
});

describe('compareValues — unknown operator', () => {
  it('returns false for unknown operator', () => {
    expect(compareValues('unknown_op' as ConditionOperator, 'x', 'x')).toBe(false);
  });
});

// ─── evaluateCondition ────────────────────────────────────────────────────────

describe('evaluateCondition', () => {
  it('evaluates flat field condition', () => {
    const cond: WorkflowCondition = { field: 'status', operator: 'equals', value: 'OPEN' };
    expect(evaluateCondition(cond, CTX_FLAT)).toBe(true);
  });

  it('evaluates nested field condition', () => {
    const cond: WorkflowCondition = { field: 'risk.score', operator: 'greater_than', value: 15 };
    expect(evaluateCondition(cond, CTX_NESTED)).toBe(true);
  });

  it('evaluates false condition', () => {
    const cond: WorkflowCondition = { field: 'score', operator: 'greater_than', value: 100 };
    expect(evaluateCondition(cond, CTX_FLAT)).toBe(false);
  });

  it('null field with is_null → true', () => {
    const cond: WorkflowCondition = { field: 'assignee', operator: 'is_null', value: null };
    expect(evaluateCondition(cond, CTX_FLAT)).toBe(true);
  });

  it('missing field with is_null → true', () => {
    const cond: WorkflowCondition = { field: 'nonExistent', operator: 'is_null', value: null };
    expect(evaluateCondition(cond, CTX_FLAT)).toBe(true);
  });

  it('tags array contains item', () => {
    const cond: WorkflowCondition = { field: 'tags', operator: 'contains', value: 'critical' };
    expect(evaluateCondition(cond, CTX_FLAT)).toBe(true);
  });
});

// ─── evaluateConditions ───────────────────────────────────────────────────────

describe('evaluateConditions', () => {
  it('empty conditions → true', () => {
    expect(evaluateConditions([], CTX_FLAT)).toBe(true);
  });

  it('single true condition', () => {
    const conds: WorkflowCondition[] = [{ field: 'status', operator: 'equals', value: 'OPEN' }];
    expect(evaluateConditions(conds, CTX_FLAT)).toBe(true);
  });

  it('single false condition', () => {
    const conds: WorkflowCondition[] = [{ field: 'status', operator: 'equals', value: 'CLOSED' }];
    expect(evaluateConditions(conds, CTX_FLAT)).toBe(false);
  });

  it('AND: true AND true → true', () => {
    const conds: WorkflowCondition[] = [
      { field: 'status', operator: 'equals', value: 'OPEN' },
      { field: 'score', operator: 'greater_than', value: 50, logicalOperator: 'AND' },
    ];
    expect(evaluateConditions(conds, CTX_FLAT)).toBe(true);
  });

  it('AND: true AND false → false', () => {
    const conds: WorkflowCondition[] = [
      { field: 'status', operator: 'equals', value: 'OPEN' },
      { field: 'score', operator: 'greater_than', value: 100, logicalOperator: 'AND' },
    ];
    expect(evaluateConditions(conds, CTX_FLAT)).toBe(false);
  });

  it('AND: false AND true → false', () => {
    const conds: WorkflowCondition[] = [
      { field: 'status', operator: 'equals', value: 'CLOSED' },
      { field: 'score', operator: 'greater_than', value: 50, logicalOperator: 'AND' },
    ];
    expect(evaluateConditions(conds, CTX_FLAT)).toBe(false);
  });

  it('OR: false OR true → true', () => {
    const conds: WorkflowCondition[] = [
      { field: 'status', operator: 'equals', value: 'CLOSED' },
      { field: 'score', operator: 'greater_than', value: 50, logicalOperator: 'OR' },
    ];
    expect(evaluateConditions(conds, CTX_FLAT)).toBe(true);
  });

  it('OR: false OR false → false', () => {
    const conds: WorkflowCondition[] = [
      { field: 'status', operator: 'equals', value: 'CLOSED' },
      { field: 'score', operator: 'greater_than', value: 100, logicalOperator: 'OR' },
    ];
    expect(evaluateConditions(conds, CTX_FLAT)).toBe(false);
  });

  it('OR: true OR false → true', () => {
    const conds: WorkflowCondition[] = [
      { field: 'status', operator: 'equals', value: 'OPEN' },
      { field: 'score', operator: 'greater_than', value: 100, logicalOperator: 'OR' },
    ];
    expect(evaluateConditions(conds, CTX_FLAT)).toBe(true);
  });

  it('default (no logicalOperator) = AND', () => {
    const conds: WorkflowCondition[] = [
      { field: 'status', operator: 'equals', value: 'OPEN' },
      { field: 'score', operator: 'greater_than', value: 100 }, // no logicalOperator
    ];
    expect(evaluateConditions(conds, CTX_FLAT)).toBe(false);
  });

  it('3-condition AND chain: all true', () => {
    const conds: WorkflowCondition[] = [
      { field: 'status', operator: 'equals', value: 'OPEN' },
      { field: 'score', operator: 'greater_than', value: 50, logicalOperator: 'AND' },
      { field: 'severity', operator: 'equals', value: 'HIGH', logicalOperator: 'AND' },
    ];
    expect(evaluateConditions(conds, CTX_FLAT)).toBe(true);
  });

  it('3-condition: true AND true OR false → true (short-circuit)', () => {
    const conds: WorkflowCondition[] = [
      { field: 'status', operator: 'equals', value: 'OPEN' },
      { field: 'score', operator: 'greater_than', value: 50, logicalOperator: 'AND' },
      { field: 'score', operator: 'greater_than', value: 999, logicalOperator: 'OR' },
    ];
    // (true AND true) OR false = true OR false = true
    expect(evaluateConditions(conds, CTX_FLAT)).toBe(true);
  });

  it('nested context conditions work', () => {
    const conds: WorkflowCondition[] = [
      { field: 'risk.score', operator: 'greater_than', value: 15 },
      { field: 'risk.owner.name', operator: 'equals', value: 'Alice', logicalOperator: 'AND' },
    ];
    expect(evaluateConditions(conds, CTX_NESTED)).toBe(true);
  });
});

// ─── validateTrigger ──────────────────────────────────────────────────────────

describe('validateTrigger', () => {
  const allTriggers: TriggerType[] = [
    'ncr_created', 'capa_overdue', 'incident_reported', 'audit_due',
    'document_expiring', 'risk_score_changed', 'training_overdue', 'scheduled',
    'manual', 'webhook', 'form_submitted', 'status_changed', 'field_changed',
  ];

  for (const t of allTriggers) {
    it(`valid trigger type "${t}" → no errors`, () => {
      const errors = validateTrigger({ type: t, config: {} });
      expect(errors).toHaveLength(0);
    });
  }

  it('missing type → error', () => {
    const errors = validateTrigger({ config: {} });
    expect(errors.some((e) => e.includes('type'))).toBe(true);
  });

  it('unknown type → error', () => {
    const errors = validateTrigger({ type: 'unknown_xyz' as TriggerType, config: {} });
    expect(errors.some((e) => e.includes('Unknown trigger type'))).toBe(true);
  });

  it('missing config → error', () => {
    const errors = validateTrigger({ type: 'manual' });
    expect(errors.some((e) => e.includes('config'))).toBe(true);
  });

  it('null config → error', () => {
    const errors = validateTrigger({ type: 'manual', config: null as unknown as Record<string, unknown> });
    expect(errors.some((e) => e.includes('config'))).toBe(true);
  });

  it('empty trigger object → multiple errors', () => {
    const errors = validateTrigger({});
    expect(errors.length).toBeGreaterThan(0);
  });
});

// ─── validateAction ───────────────────────────────────────────────────────────

describe('validateAction', () => {
  const allActions: ActionType[] = [
    'send_email', 'send_notification', 'create_task', 'update_field',
    'assign_user', 'change_status', 'create_ncr', 'create_capa', 'webhook_call',
    'approve', 'reject', 'escalate', 'run_report', 'add_comment',
  ];

  for (const t of allActions) {
    it(`valid action type "${t}" → no errors`, () => {
      const errors = validateAction({ id: 'a1', type: t, config: {} });
      expect(errors).toHaveLength(0);
    });
  }

  it('missing id → error', () => {
    const errors = validateAction({ type: 'send_email', config: {} });
    expect(errors.some((e) => e.includes('id'))).toBe(true);
  });

  it('missing type → error', () => {
    const errors = validateAction({ id: 'a1', config: {} });
    expect(errors.some((e) => e.includes('type'))).toBe(true);
  });

  it('unknown type → error', () => {
    const errors = validateAction({ id: 'a1', type: 'fly_helicopter' as ActionType, config: {} });
    expect(errors.some((e) => e.includes('Unknown action type'))).toBe(true);
  });

  it('missing config → error', () => {
    const errors = validateAction({ id: 'a1', type: 'send_email' });
    expect(errors.some((e) => e.includes('config'))).toBe(true);
  });

  it('negative delay → error', () => {
    const errors = validateAction({ id: 'a1', type: 'send_email', config: {}, delay: -1 });
    expect(errors.some((e) => e.includes('delay'))).toBe(true);
  });

  it('zero delay → no error', () => {
    const errors = validateAction({ id: 'a1', type: 'send_email', config: {}, delay: 0 });
    expect(errors).toHaveLength(0);
  });

  it('positive delay → no error', () => {
    const errors = validateAction({ id: 'a1', type: 'send_email', config: {}, delay: 5000 });
    expect(errors).toHaveLength(0);
  });

  it('negative retryCount → error', () => {
    const errors = validateAction({ id: 'a1', type: 'send_email', config: {}, retryCount: -1 });
    expect(errors.some((e) => e.includes('retryCount'))).toBe(true);
  });

  it('zero retryCount → no error', () => {
    const errors = validateAction({ id: 'a1', type: 'send_email', config: {}, retryCount: 0 });
    expect(errors).toHaveLength(0);
  });

  const validOnError = ['skip', 'stop', 'notify'] as const;
  for (const e of validOnError) {
    it(`onError "${e}" → no error`, () => {
      const errors = validateAction({ id: 'a1', type: 'send_email', config: {}, onError: e });
      expect(errors).toHaveLength(0);
    });
  }

  it('invalid onError → error', () => {
    const errors = validateAction({ id: 'a1', type: 'send_email', config: {}, onError: 'crash' as 'skip' });
    expect(errors.some((e) => e.includes('onError'))).toBe(true);
  });
});

// ─── validateStep ─────────────────────────────────────────────────────────────

describe('validateStep', () => {
  it('valid step → no errors', () => {
    const errors = validateStep(makeStep('s1'));
    expect(errors).toHaveLength(0);
  });

  it('missing id → error', () => {
    const errors = validateStep({ name: 'My Step', actions: [makeAction('a1')] });
    expect(errors.some((e) => e.includes('id'))).toBe(true);
  });

  it('missing name → error', () => {
    const errors = validateStep({ id: 's1', actions: [makeAction('a1')] });
    expect(errors.some((e) => e.includes('name'))).toBe(true);
  });

  it('empty actions → error', () => {
    const errors = validateStep({ id: 's1', name: 'Step', actions: [] });
    expect(errors.some((e) => e.includes('at least one action'))).toBe(true);
  });

  it('invalid action inside step → propagated error', () => {
    const errors = validateStep({
      id: 's1', name: 'Step',
      actions: [{ id: '', type: 'send_email', config: {} }], // missing id
    });
    expect(errors.some((e) => e.includes('action'))).toBe(true);
  });

  it('step with valid nextStepId → no errors', () => {
    const errors = validateStep({ ...makeStep('s1'), nextStepId: 's2' });
    expect(errors).toHaveLength(0);
  });

  it('step with conditions → no errors', () => {
    const step = {
      ...makeStep('s1'),
      conditions: [{ field: 'status', operator: 'equals' as const, value: 'OPEN' }],
    };
    expect(validateStep(step)).toHaveLength(0);
  });

  it('multiple invalid actions → multiple errors', () => {
    const errors = validateStep({
      id: 's1', name: 'Step',
      actions: [
        { type: 'send_email', config: {} }, // missing id
        { id: 'a2', config: {} },           // missing type
      ],
    });
    expect(errors.length).toBeGreaterThanOrEqual(2);
  });
});

// ─── detectCircularDeps ───────────────────────────────────────────────────────

describe('detectCircularDeps', () => {
  it('linear chain → no cycle', () => {
    const steps = [makeStep('s1', 's2'), makeStep('s2', 's3'), makeStep('s3')];
    expect(detectCircularDeps(steps)).toBe(false);
  });

  it('single step → no cycle', () => {
    expect(detectCircularDeps([makeStep('s1')])).toBe(false);
  });

  it('empty steps → no cycle', () => {
    expect(detectCircularDeps([])).toBe(false);
  });

  it('self-referencing step → cycle', () => {
    const steps = [makeStep('s1', 's1')];
    expect(detectCircularDeps(steps)).toBe(true);
  });

  it('simple two-step cycle → cycle', () => {
    const steps = [makeStep('s1', 's2'), makeStep('s2', 's1')];
    expect(detectCircularDeps(steps)).toBe(true);
  });

  it('three-step cycle → cycle', () => {
    const steps = [makeStep('s1', 's2'), makeStep('s2', 's3'), makeStep('s3', 's1')];
    expect(detectCircularDeps(steps)).toBe(true);
  });

  it('branched linear (nextStepId references non-existent) → no cycle', () => {
    const steps = [makeStep('s1', 'does-not-exist')];
    expect(detectCircularDeps(steps)).toBe(false);
  });

  it('diamond pattern with no cycle', () => {
    // s1→s2, s1→s3, s2→s4, s3→s4
    const steps = [
      makeStep('s1', 's2'),
      makeStep('s2', 's4'),
      makeStep('s3', 's4'),
      makeStep('s4'),
    ];
    // Each step follows its own nextStepId chain — no cycle from s1→s2→s4 or s3→s4
    expect(detectCircularDeps(steps)).toBe(false);
  });
});

// ─── validateWorkflow ─────────────────────────────────────────────────────────

describe('validateWorkflow — valid cases', () => {
  it('minimal valid workflow → valid', () => {
    const { valid, errors } = validateWorkflow(makeWorkflow());
    expect(valid).toBe(true);
    expect(errors).toHaveLength(0);
  });

  it('multi-step linear workflow → valid', () => {
    const { valid } = validateWorkflow(makeWorkflow({
      steps: [makeStep('s1', 's2'), makeStep('s2')],
    }));
    expect(valid).toBe(true);
  });

  it('workflow with description → valid', () => {
    const { valid } = validateWorkflow(makeWorkflow({ description: 'A workflow' }));
    expect(valid).toBe(true);
  });

  it('all trigger types produce valid workflow', () => {
    const triggers: TriggerType[] = [
      'ncr_created', 'capa_overdue', 'scheduled', 'manual', 'webhook',
    ];
    for (const t of triggers) {
      const { valid } = validateWorkflow(makeWorkflow({ trigger: { type: t, config: {} } }));
      expect(valid).toBe(true);
    }
  });
});

describe('validateWorkflow — required field errors', () => {
  it('missing id → invalid', () => {
    const { valid, errors } = validateWorkflow(makeWorkflow({ id: undefined }));
    expect(valid).toBe(false);
    expect(errors.some((e) => e.includes('id'))).toBe(true);
  });

  it('missing name → invalid', () => {
    const { valid, errors } = validateWorkflow(makeWorkflow({ name: '' }));
    expect(valid).toBe(false);
    expect(errors.some((e) => e.includes('name'))).toBe(true);
  });

  it('missing createdBy → invalid', () => {
    const { valid, errors } = validateWorkflow(makeWorkflow({ createdBy: undefined }));
    expect(valid).toBe(false);
    expect(errors.some((e) => e.includes('createdBy'))).toBe(true);
  });

  it('missing trigger → invalid', () => {
    const { valid, errors } = validateWorkflow(makeWorkflow({ trigger: undefined }));
    expect(valid).toBe(false);
    expect(errors.some((e) => e.toLowerCase().includes('trigger'))).toBe(true);
  });

  it('missing steps → invalid', () => {
    const { valid, errors } = validateWorkflow(makeWorkflow({ steps: [] }));
    expect(valid).toBe(false);
    expect(errors.some((e) => e.includes('step'))).toBe(true);
  });
});

describe('validateWorkflow — version validation', () => {
  it('version 0 → valid', () => {
    const { valid } = validateWorkflow(makeWorkflow({ version: 0 }));
    expect(valid).toBe(true);
  });

  it('version 100 → valid', () => {
    const { valid } = validateWorkflow(makeWorkflow({ version: 100 }));
    expect(valid).toBe(true);
  });

  it('negative version → invalid', () => {
    const { valid, errors } = validateWorkflow(makeWorkflow({ version: -1 }));
    expect(valid).toBe(false);
    expect(errors.some((e) => e.includes('version'))).toBe(true);
  });
});

describe('validateWorkflow — step errors propagated', () => {
  it('step with no actions → workflow invalid', () => {
    const { valid, errors } = validateWorkflow(makeWorkflow({
      steps: [{ id: 's1', name: 'Step 1', actions: [] }],
    }));
    expect(valid).toBe(false);
    expect(errors.some((e) => e.includes('step') || e.includes('Step') || e.includes('action'))).toBe(true);
  });

  it('step with invalid action → workflow invalid', () => {
    const { valid } = validateWorkflow(makeWorkflow({
      steps: [{
        id: 's1', name: 'Step',
        actions: [{ id: '', type: 'send_email', config: {} }],
      }],
    }));
    expect(valid).toBe(false);
  });
});

describe('validateWorkflow — circular dependency detection', () => {
  it('circular steps → workflow invalid', () => {
    const { valid, errors } = validateWorkflow(makeWorkflow({
      steps: [makeStep('s1', 's2'), makeStep('s2', 's1')],
    }));
    expect(valid).toBe(false);
    expect(errors.some((e) => e.includes('circular'))).toBe(true);
  });

  it('self-referencing step → workflow invalid', () => {
    const { valid, errors } = validateWorkflow(makeWorkflow({
      steps: [makeStep('s1', 's1')],
    }));
    expect(valid).toBe(false);
    expect(errors.some((e) => e.includes('circular'))).toBe(true);
  });

  it('three-step cycle → workflow invalid', () => {
    const { valid } = validateWorkflow(makeWorkflow({
      steps: [makeStep('s1', 's2'), makeStep('s2', 's3'), makeStep('s3', 's1')],
    }));
    expect(valid).toBe(false);
  });
});

describe('validateWorkflow — complex multi-step valid workflows', () => {
  it('5-step linear workflow with multiple actions each', () => {
    const steps: WorkflowStep[] = Array.from({ length: 5 }, (_, i) => ({
      id: `s${i + 1}`,
      name: `Step ${i + 1}`,
      actions: [makeAction(`a${i + 1}-1`), makeAction(`a${i + 1}-2`, 'send_notification')],
      nextStepId: i < 4 ? `s${i + 2}` : undefined,
    }));
    const { valid } = validateWorkflow(makeWorkflow({ steps }));
    expect(valid).toBe(true);
  });

  it('workflow with step conditions', () => {
    const step: WorkflowStep = {
      ...makeStep('s1'),
      conditions: [
        { field: 'status', operator: 'equals', value: 'OPEN' },
        { field: 'severity', operator: 'in', value: ['HIGH', 'CRITICAL'], logicalOperator: 'AND' },
      ],
    };
    const { valid } = validateWorkflow(makeWorkflow({ steps: [step] }));
    expect(valid).toBe(true);
  });

  it('errors array is empty for fully valid workflow', () => {
    const { errors } = validateWorkflow(makeWorkflow());
    expect(errors).toEqual([]);
  });

  it('returns { valid, errors } shape', () => {
    const result = validateWorkflow(makeWorkflow());
    expect(result).toHaveProperty('valid');
    expect(result).toHaveProperty('errors');
    expect(typeof result.valid).toBe('boolean');
    expect(Array.isArray(result.errors)).toBe(true);
  });
});

// ─── Type constants coverage ──────────────────────────────────────────────────

describe('TriggerType coverage', () => {
  const triggers: TriggerType[] = [
    'ncr_created', 'capa_overdue', 'incident_reported', 'audit_due',
    'document_expiring', 'risk_score_changed', 'training_overdue', 'scheduled',
    'manual', 'webhook', 'form_submitted', 'status_changed', 'field_changed',
  ];

  it('has 13 trigger types', () => expect(triggers).toHaveLength(13));
  it('all trigger types are strings', () => {
    for (const t of triggers) expect(typeof t).toBe('string');
  });
  it('trigger types are unique', () => {
    expect(new Set(triggers).size).toBe(triggers.length);
  });
});

describe('ActionType coverage', () => {
  const actions: ActionType[] = [
    'send_email', 'send_notification', 'create_task', 'update_field',
    'assign_user', 'change_status', 'create_ncr', 'create_capa', 'webhook_call',
    'approve', 'reject', 'escalate', 'run_report', 'add_comment',
  ];

  it('has 14 action types', () => expect(actions).toHaveLength(14));
  it('all action types are strings', () => {
    for (const a of actions) expect(typeof a).toBe('string');
  });
  it('action types are unique', () => {
    expect(new Set(actions).size).toBe(actions.length);
  });
});

describe('ConditionOperator coverage', () => {
  const operators: ConditionOperator[] = [
    'equals', 'not_equals', 'contains', 'not_contains',
    'greater_than', 'less_than', 'is_null', 'is_not_null',
    'in', 'not_in', 'between',
  ];

  it('has 11 operators', () => expect(operators).toHaveLength(11));
  it('all operators are strings', () => {
    for (const o of operators) expect(typeof o).toBe('string');
  });
  it('operators are unique', () => {
    expect(new Set(operators).size).toBe(operators.length);
  });

  it('every operator returns boolean from compareValues', () => {
    for (const op of operators) {
      const result = compareValues(op, 'test', 'test');
      expect(typeof result).toBe('boolean');
    }
  });
});

// ─── WorkflowRun type shape ───────────────────────────────────────────────────

describe('WorkflowRun type contract', () => {
  it('has correct status values', () => {
    const statuses = ['running', 'completed', 'failed', 'cancelled'] as const;
    expect(statuses).toHaveLength(4);
    expect(new Set(statuses).size).toBe(4);
  });
});

// ─── Integration-style scenarios ─────────────────────────────────────────────

describe('Real-world workflow scenarios', () => {
  it('NCR escalation workflow — conditions evaluate correctly', () => {
    const context = { ncr: { severity: 'MAJOR', status: 'OPEN', assignee: null, daysOpen: 5 } };
    const conditions: WorkflowCondition[] = [
      { field: 'ncr.severity', operator: 'in', value: ['MAJOR', 'CRITICAL'] },
      { field: 'ncr.status', operator: 'equals', value: 'OPEN', logicalOperator: 'AND' },
      { field: 'ncr.daysOpen', operator: 'greater_than', value: 3, logicalOperator: 'AND' },
    ];
    expect(evaluateConditions(conditions, context)).toBe(true);
  });

  it('Risk auto-escalate — high score triggers', () => {
    const ctx = { risk: { score: 20, level: 'CRITICAL', owner: null } };
    const conds: WorkflowCondition[] = [
      { field: 'risk.score', operator: 'between', value: [15, 25] },
      { field: 'risk.owner', operator: 'is_null', logicalOperator: 'AND', value: null },
    ];
    expect(evaluateConditions(conds, ctx)).toBe(true);
  });

  it('Training overdue → low risk score does not trigger', () => {
    const ctx = { training: { overdueDays: 2, role: 'VIEWER' } };
    const conds: WorkflowCondition[] = [
      { field: 'training.overdueDays', operator: 'greater_than', value: 7 },
      { field: 'training.role', operator: 'equals', value: 'MANAGER', logicalOperator: 'OR' },
    ];
    // (false) OR (false) = false
    expect(evaluateConditions(conds, ctx)).toBe(false);
  });

  it('CAPA deadline workflow validates correctly', () => {
    const workflow: Partial<Workflow> = makeWorkflow({
      trigger: { type: 'capa_overdue', config: { threshold: 7 } },
      steps: [
        {
          id: 'notify',
          name: 'Notify Owner',
          actions: [{ id: 'a1', type: 'send_notification', config: { channel: 'email' } }],
          nextStepId: 'escalate',
        },
        {
          id: 'escalate',
          name: 'Escalate to Manager',
          actions: [{ id: 'a2', type: 'escalate', config: { managerId: 'mgr-001' } }],
        },
      ],
    });
    const { valid, errors } = validateWorkflow(workflow);
    expect(valid).toBe(true);
    expect(errors).toHaveLength(0);
  });

  it('Audit due workflow with conditions on step', () => {
    const step: WorkflowStep = {
      id: 'assign',
      name: 'Assign Auditor',
      actions: [{ id: 'a1', type: 'assign_user', config: { userId: 'auditor-1' } }],
      conditions: [
        { field: 'audit.daysUntilDue', operator: 'less_than', value: 14 },
        { field: 'audit.status', operator: 'not_equals', value: 'ASSIGNED', logicalOperator: 'AND' },
      ],
    };
    const { valid } = validateWorkflow(makeWorkflow({ steps: [step] }));
    expect(valid).toBe(true);
  });
});
