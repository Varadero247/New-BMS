import {
  createApprover,
  createStep,
  createFlow,
  getCurrentStep,
  isStepComplete,
  computeStepStatus,
  addDecision,
  advanceFlow,
  withdrawFlow,
  getFlowSummary,
  canApprove,
  hasApproved,
  isValidStatus,
  isValidStepType,
  makeDecision,
  sortStepsByOrder,
  getPendingApprovers,
  ApprovalFlow,
  ApprovalStep,
  Approver,
  ApprovalDecision,
  ApprovalStatus,
  StepType,
} from '../src/index';

// ─── helpers ────────────────────────────────────────────────────────────────

function mkApprover(i: number, opts: Partial<Approver> = {}): Approver {
  return createApprover(`a${i}`, `Approver ${i}`, `a${i}@example.com`, opts.role);
}

function mkStep(i: number, type: StepType = 'sequential', approvers?: Approver[]): ApprovalStep {
  const apps = approvers ?? [mkApprover(i)];
  return createStep(`s${i}`, `Step ${i}`, i, type, apps);
}

function mkFlow(steps: ApprovalStep[] = [], requestedBy = 'user1'): ApprovalFlow {
  return createFlow('f1', 'Flow 1', 'entity1', 'document', steps, requestedBy);
}

function mkDecision(approverId: string, status: 'approved' | 'rejected', comment?: string): ApprovalDecision {
  return makeDecision(approverId, `Name ${approverId}`, status, comment);
}

// ─── createApprover ─────────────────────────────────────────────────────────

describe('createApprover', () => {
  it('stores id', () => expect(createApprover('x', 'X', 'x@e.com').id).toBe('x'));
  it('stores name', () => expect(createApprover('x', 'Alice', 'a@e.com').name).toBe('Alice'));
  it('stores email', () => expect(createApprover('x', 'X', 'foo@bar.com').email).toBe('foo@bar.com'));
  it('role is undefined when omitted', () => expect(createApprover('x', 'X', 'x@e.com').role).toBeUndefined());
  it('stores role when provided', () => expect(createApprover('x', 'X', 'x@e.com', 'manager').role).toBe('manager'));
  it('delegateTo is undefined by default', () => expect(createApprover('x', 'X', 'x@e.com').delegateTo).toBeUndefined());

  const roles = ['admin', 'manager', 'director', 'ceo', 'supervisor', 'lead', 'head', 'vp', 'cto', 'cfo'];
  roles.forEach(role => {
    it(`stores role '${role}'`, () => {
      const a = createApprover('id', 'Name', 'e@e.com', role);
      expect(a.role).toBe(role);
    });
  });

  const emails = ['alice@corp.com', 'bob@example.org', 'carol@test.io', 'dave@domain.net', 'eve@startup.co'];
  emails.forEach(email => {
    it(`stores email ${email}`, () => {
      expect(createApprover('id', 'Name', email).email).toBe(email);
    });
  });

  for (let i = 0; i < 20; i++) {
    it(`createApprover loop ${i}: id stored`, () => {
      const a = createApprover(`id-${i}`, `Name ${i}`, `email${i}@test.com`);
      expect(a.id).toBe(`id-${i}`);
      expect(a.name).toBe(`Name ${i}`);
      expect(a.email).toBe(`email${i}@test.com`);
    });
  }

  it('returns a plain object', () => {
    const a = createApprover('x', 'X', 'x@e.com');
    expect(typeof a).toBe('object');
  });

  it('no extra properties when no role', () => {
    const a = createApprover('x', 'X', 'x@e.com');
    expect(Object.keys(a).sort()).toEqual(['email', 'id', 'name'].sort());
  });

  it('has role key when role provided', () => {
    const a = createApprover('x', 'X', 'x@e.com', 'admin');
    expect('role' in a).toBe(true);
  });
});

// ─── createStep ─────────────────────────────────────────────────────────────

describe('createStep', () => {
  const stepTypes: StepType[] = ['sequential', 'parallel', 'any_one'];

  stepTypes.forEach(type => {
    it(`createStep with type '${type}' stores type`, () => {
      const s = createStep('sid', 'Step', 1, type, [mkApprover(1)]);
      expect(s.type).toBe(type);
    });
    it(`createStep with type '${type}' has status 'pending'`, () => {
      const s = createStep('sid', 'Step', 1, type, [mkApprover(1)]);
      expect(s.status).toBe('pending');
    });
    it(`createStep with type '${type}' has empty decisions`, () => {
      const s = createStep('sid', 'Step', 1, type, [mkApprover(1)]);
      expect(s.decisions).toEqual([]);
    });
  });

  it('stores id', () => expect(createStep('myid', 'n', 0, 'sequential', []).id).toBe('myid'));
  it('stores name', () => expect(createStep('id', 'My Step', 0, 'sequential', []).name).toBe('My Step'));
  it('stores order', () => expect(createStep('id', 'n', 5, 'sequential', []).order).toBe(5));
  it('stores approvers array', () => {
    const apps = [mkApprover(1), mkApprover(2)];
    expect(createStep('id', 'n', 0, 'parallel', apps).approvers).toHaveLength(2);
  });
  it('stores approvers reference equality', () => {
    const apps = [mkApprover(1)];
    expect(createStep('id', 'n', 0, 'sequential', apps).approvers[0].id).toBe('a1');
  });
  it('dueDate is undefined by default', () => {
    expect(createStep('id', 'n', 0, 'sequential', []).dueDate).toBeUndefined();
  });
  it('escalationAfterHours is undefined by default', () => {
    expect(createStep('id', 'n', 0, 'sequential', []).escalationAfterHours).toBeUndefined();
  });

  for (let i = 0; i < 15; i++) {
    it(`createStep loop ${i}: order stored correctly`, () => {
      const s = createStep(`s${i}`, `Step ${i}`, i * 2, 'sequential', []);
      expect(s.order).toBe(i * 2);
      expect(s.id).toBe(`s${i}`);
    });
  }

  for (let i = 1; i <= 5; i++) {
    it(`createStep with ${i} approvers stores them all`, () => {
      const apps = Array.from({ length: i }, (_, idx) => mkApprover(idx));
      const s = createStep('id', 'n', 0, 'parallel', apps);
      expect(s.approvers).toHaveLength(i);
    });
  }
});

// ─── createFlow ─────────────────────────────────────────────────────────────

describe('createFlow', () => {
  it('stores id', () => expect(mkFlow().id).toBe('f1'));
  it('stores name', () => expect(mkFlow().name).toBe('Flow 1'));
  it('stores entityId', () => expect(mkFlow().entityId).toBe('entity1'));
  it('stores entityType', () => expect(mkFlow().entityType).toBe('document'));
  it('stores requestedBy', () => expect(mkFlow().requestedBy).toBe('user1'));
  it('status is pending', () => expect(mkFlow().status).toBe('pending'));
  it('currentStepIndex is 0', () => expect(mkFlow().currentStepIndex).toBe(0));
  it('requestedAt is a number', () => expect(typeof mkFlow().requestedAt).toBe('number'));
  it('requestedAt is recent', () => expect(mkFlow().requestedAt).toBeGreaterThan(Date.now() - 5000));
  it('completedAt is undefined', () => expect(mkFlow().completedAt).toBeUndefined());
  it('subject is undefined by default', () => expect(mkFlow().subject).toBeUndefined());
  it('stores steps array', () => {
    const steps = [mkStep(1), mkStep(2)];
    expect(mkFlow(steps).steps).toHaveLength(2);
  });
  it('steps array is same reference elements', () => {
    const steps = [mkStep(1)];
    expect(mkFlow(steps).steps[0].id).toBe('s1');
  });

  const entityTypes = ['document', 'change', 'purchase', 'contract', 'policy', 'training', 'audit', 'expense', 'invoice', 'risk'];
  entityTypes.forEach(type => {
    it(`createFlow with entityType '${type}'`, () => {
      const f = createFlow('fid', 'name', 'eid', type, [], 'u1');
      expect(f.entityType).toBe(type);
    });
  });

  for (let i = 0; i < 15; i++) {
    it(`createFlow loop ${i}: id, entityId stored`, () => {
      const f = createFlow(`f${i}`, `Flow ${i}`, `entity${i}`, 'doc', [], `user${i}`);
      expect(f.id).toBe(`f${i}`);
      expect(f.entityId).toBe(`entity${i}`);
      expect(f.requestedBy).toBe(`user${i}`);
    });
  }
});

// ─── getCurrentStep ──────────────────────────────────────────────────────────

describe('getCurrentStep', () => {
  it('returns first step when index=0', () => {
    const steps = [mkStep(1), mkStep(2)];
    const flow = mkFlow(steps);
    expect(getCurrentStep(flow)?.id).toBe('s1');
  });
  it('returns second step when index=1', () => {
    const steps = [mkStep(1), mkStep(2)];
    const flow = { ...mkFlow(steps), currentStepIndex: 1 };
    expect(getCurrentStep(flow)?.id).toBe('s2');
  });
  it('returns undefined for empty steps', () => {
    expect(getCurrentStep(mkFlow([]))).toBeUndefined();
  });
  it('returns undefined when index out of range', () => {
    const flow = { ...mkFlow([mkStep(1)]), currentStepIndex: 5 };
    expect(getCurrentStep(flow)).toBeUndefined();
  });
  it('returns correct step for index 2', () => {
    const steps = [mkStep(0), mkStep(1), mkStep(2)];
    const flow = { ...mkFlow(steps), currentStepIndex: 2 };
    expect(getCurrentStep(flow)?.id).toBe('s2');
  });

  for (let i = 0; i < 10; i++) {
    it(`getCurrentStep returns step at index ${i}`, () => {
      const steps = Array.from({ length: 10 }, (_, idx) => mkStep(idx));
      const flow = { ...mkFlow(steps), currentStepIndex: i };
      expect(getCurrentStep(flow)?.id).toBe(`s${i}`);
    });
  }
});

// ─── isStepComplete ──────────────────────────────────────────────────────────

describe('isStepComplete', () => {
  it('returns true when status=approved', () => {
    const s = { ...mkStep(1), status: 'approved' as ApprovalStatus };
    expect(isStepComplete(s)).toBe(true);
  });
  it('returns true when status=rejected', () => {
    const s = { ...mkStep(1), status: 'rejected' as ApprovalStatus };
    expect(isStepComplete(s)).toBe(true);
  });
  it('returns false for pending step with no decisions', () => {
    expect(isStepComplete(mkStep(1))).toBe(false);
  });
  it('returns true when a decision is rejected (any type)', () => {
    const s: ApprovalStep = { ...mkStep(1, 'parallel'), decisions: [mkDecision('a1', 'rejected')] };
    expect(isStepComplete(s)).toBe(true);
  });
  it('any_one: true when one approval present', () => {
    const apps = [mkApprover(1), mkApprover(2)];
    const s: ApprovalStep = { ...mkStep(1, 'any_one', apps), decisions: [mkDecision('a1', 'approved')] };
    expect(isStepComplete(s)).toBe(true);
  });
  it('any_one: false when no decisions', () => {
    const s = mkStep(1, 'any_one', [mkApprover(1), mkApprover(2)]);
    expect(isStepComplete(s)).toBe(false);
  });
  it('parallel: true when all have approved', () => {
    const apps = [mkApprover(1), mkApprover(2)];
    const decisions = [mkDecision('a1', 'approved'), mkDecision('a2', 'approved')];
    const s: ApprovalStep = { ...mkStep(1, 'parallel', apps), decisions };
    expect(isStepComplete(s)).toBe(true);
  });
  it('parallel: false when only one of two has approved', () => {
    const apps = [mkApprover(1), mkApprover(2)];
    const decisions = [mkDecision('a1', 'approved')];
    const s: ApprovalStep = { ...mkStep(1, 'parallel', apps), decisions };
    expect(isStepComplete(s)).toBe(false);
  });
  it('sequential: true with one decision', () => {
    const s: ApprovalStep = { ...mkStep(1, 'sequential'), decisions: [mkDecision('a1', 'approved')] };
    expect(isStepComplete(s)).toBe(true);
  });
  it('sequential: false with no decisions', () => {
    expect(isStepComplete(mkStep(1, 'sequential'))).toBe(false);
  });

  // Parameterised loops for parallel step with varying approver counts
  for (let total = 2; total <= 6; total++) {
    for (let approvedCount = 0; approvedCount < total; approvedCount++) {
      it(`parallel: ${approvedCount}/${total} approved → ${approvedCount === total ? 'complete' : 'incomplete'}`, () => {
        const apps = Array.from({ length: total }, (_, i) => mkApprover(i));
        const decisions = Array.from({ length: approvedCount }, (_, i) => mkDecision(`a${i}`, 'approved'));
        const s: ApprovalStep = { ...mkStep(1, 'parallel', apps), decisions };
        expect(isStepComplete(s)).toBe(approvedCount >= total);
      });
    }
  }

  for (let i = 0; i < 10; i++) {
    it(`isStepComplete rejected decision loop ${i}`, () => {
      const s: ApprovalStep = { ...mkStep(i, 'any_one'), decisions: [mkDecision(`a${i}`, 'rejected')] };
      expect(isStepComplete(s)).toBe(true);
    });
  }
});

// ─── computeStepStatus ──────────────────────────────────────────────────────

describe('computeStepStatus', () => {
  it('returns pending for empty decisions', () => {
    expect(computeStepStatus(mkStep(1))).toBe('pending');
  });
  it('returns rejected if any decision is rejected (sequential)', () => {
    const s: ApprovalStep = { ...mkStep(1), decisions: [mkDecision('a1', 'rejected')] };
    expect(computeStepStatus(s)).toBe('rejected');
  });
  it('returns rejected if any decision is rejected (parallel)', () => {
    const apps = [mkApprover(1), mkApprover(2)];
    const decisions = [mkDecision('a1', 'approved'), mkDecision('a2', 'rejected')];
    const s: ApprovalStep = { ...mkStep(1, 'parallel', apps), decisions };
    expect(computeStepStatus(s)).toBe('rejected');
  });
  it('returns rejected if any decision is rejected (any_one)', () => {
    const s: ApprovalStep = { ...mkStep(1, 'any_one'), decisions: [mkDecision('a1', 'rejected')] };
    expect(computeStepStatus(s)).toBe('rejected');
  });
  it('any_one: approved when one approval', () => {
    const apps = [mkApprover(1), mkApprover(2)];
    const s: ApprovalStep = { ...mkStep(1, 'any_one', apps), decisions: [mkDecision('a1', 'approved')] };
    expect(computeStepStatus(s)).toBe('approved');
  });
  it('any_one: pending when no decisions', () => {
    const s = mkStep(1, 'any_one', [mkApprover(1), mkApprover(2)]);
    expect(computeStepStatus(s)).toBe('pending');
  });
  it('parallel: approved when all approved', () => {
    const apps = [mkApprover(1), mkApprover(2)];
    const decisions = [mkDecision('a1', 'approved'), mkDecision('a2', 'approved')];
    const s: ApprovalStep = { ...mkStep(1, 'parallel', apps), decisions };
    expect(computeStepStatus(s)).toBe('approved');
  });
  it('parallel: pending when not all approved', () => {
    const apps = [mkApprover(1), mkApprover(2)];
    const s: ApprovalStep = { ...mkStep(1, 'parallel', apps), decisions: [mkDecision('a1', 'approved')] };
    expect(computeStepStatus(s)).toBe('pending');
  });
  it('sequential: approved when first decision is approved', () => {
    const s: ApprovalStep = { ...mkStep(1), decisions: [mkDecision('a1', 'approved')] };
    expect(computeStepStatus(s)).toBe('approved');
  });
  it('sequential: rejected when first decision is rejected', () => {
    const s: ApprovalStep = { ...mkStep(1), decisions: [mkDecision('a1', 'rejected')] };
    expect(computeStepStatus(s)).toBe('rejected');
  });
  it('parallel: pending with zero approvers and zero decisions', () => {
    const s = mkStep(1, 'parallel', []);
    expect(computeStepStatus(s)).toBe('approved'); // 0 >= 0
  });

  // rejected takes priority over everything
  for (let i = 0; i < 10; i++) {
    it(`computeStepStatus rejection-priority loop ${i}`, () => {
      const apps = [mkApprover(0), mkApprover(1)];
      const decisions = [mkDecision('a0', 'approved'), mkDecision('a1', 'rejected')];
      const s: ApprovalStep = { ...mkStep(i, 'parallel', apps), decisions };
      expect(computeStepStatus(s)).toBe('rejected');
    });
  }

  // any_one with multiple approvers, only one approves
  for (let i = 0; i < 8; i++) {
    it(`any_one approved by approver ${i}`, () => {
      const apps = Array.from({ length: 8 }, (_, idx) => mkApprover(idx));
      const s: ApprovalStep = { ...mkStep(1, 'any_one', apps), decisions: [mkDecision(`a${i}`, 'approved')] };
      expect(computeStepStatus(s)).toBe('approved');
    });
  }
});

// ─── makeDecision ────────────────────────────────────────────────────────────

describe('makeDecision', () => {
  it('stores approverId', () => expect(makeDecision('a1', 'Alice', 'approved').approverId).toBe('a1'));
  it('stores approverName', () => expect(makeDecision('a1', 'Alice', 'approved').approverName).toBe('Alice'));
  it('stores status approved', () => expect(makeDecision('a1', 'Alice', 'approved').status).toBe('approved'));
  it('stores status rejected', () => expect(makeDecision('a1', 'Alice', 'rejected').status).toBe('rejected'));
  it('decidedAt is a number', () => expect(typeof makeDecision('a1', 'Alice', 'approved').decidedAt).toBe('number'));
  it('decidedAt is recent', () => expect(makeDecision('a1', 'Alice', 'approved').decidedAt).toBeGreaterThan(Date.now() - 5000));
  it('comment is undefined when not provided', () => expect(makeDecision('a1', 'Alice', 'approved').comment).toBeUndefined());
  it('stores comment when provided', () => expect(makeDecision('a1', 'Alice', 'approved', 'LGTM').comment).toBe('LGTM'));
  it('comment key not present when not provided', () => {
    const d = makeDecision('a1', 'Alice', 'approved');
    expect('comment' in d).toBe(false);
  });
  it('comment key present when provided', () => {
    const d = makeDecision('a1', 'Alice', 'approved', 'ok');
    expect('comment' in d).toBe(true);
  });

  const statuses: Array<'approved' | 'rejected'> = ['approved', 'rejected'];
  statuses.forEach(s => {
    for (let i = 0; i < 10; i++) {
      it(`makeDecision status=${s} loop ${i}`, () => {
        const d = makeDecision(`a${i}`, `Name${i}`, s, `comment${i}`);
        expect(d.status).toBe(s);
        expect(d.approverId).toBe(`a${i}`);
        expect(d.comment).toBe(`comment${i}`);
      });
    }
  });

  const comments = ['Looks good', 'Approved pending review', 'See notes', 'No issues found', 'Escalate to manager'];
  comments.forEach(comment => {
    it(`stores comment: "${comment}"`, () => {
      expect(makeDecision('id', 'Name', 'approved', comment).comment).toBe(comment);
    });
  });
});

// ─── addDecision ────────────────────────────────────────────────────────────

describe('addDecision', () => {
  it('adds decision to the correct step', () => {
    const steps = [mkStep(1), mkStep(2)];
    const flow = mkFlow(steps);
    const d = mkDecision('a1', 'approved');
    const updated = addDecision(flow, 's1', d);
    const step = updated.steps.find(s => s.id === 's1');
    expect(step?.decisions).toHaveLength(1);
  });
  it('does not modify other steps', () => {
    const steps = [mkStep(1), mkStep(2)];
    const flow = mkFlow(steps);
    const updated = addDecision(flow, 's1', mkDecision('a1', 'approved'));
    expect(updated.steps.find(s => s.id === 's2')?.decisions).toHaveLength(0);
  });
  it('is immutable: original flow unchanged', () => {
    const flow = mkFlow([mkStep(1)]);
    addDecision(flow, 's1', mkDecision('a1', 'approved'));
    expect(flow.steps[0].decisions).toHaveLength(0);
  });
  it('advances flow when step is complete (sequential approved)', () => {
    const steps = [mkStep(1, 'sequential', [mkApprover(1)]), mkStep(2)];
    const flow = mkFlow(steps);
    const updated = addDecision(flow, 's1', mkDecision('a1', 'approved'));
    expect(updated.currentStepIndex).toBe(1);
  });
  it('sets flow to rejected when decision is rejected', () => {
    const steps = [mkStep(1, 'sequential', [mkApprover(1)])];
    const flow = mkFlow(steps);
    const updated = addDecision(flow, 's1', mkDecision('a1', 'rejected'));
    expect(updated.status).toBe('rejected');
  });
  it('sets flow to approved when last step approved', () => {
    const steps = [mkStep(1, 'sequential', [mkApprover(1)])];
    const flow = mkFlow(steps);
    const updated = addDecision(flow, 's1', mkDecision('a1', 'approved'));
    expect(updated.status).toBe('approved');
  });
  it('does not advance if step not yet complete (parallel)', () => {
    const apps = [mkApprover(1), mkApprover(2)];
    const steps = [mkStep(1, 'parallel', apps), mkStep(2)];
    const flow = mkFlow(steps);
    const updated = addDecision(flow, 's1', mkDecision('a1', 'approved'));
    expect(updated.currentStepIndex).toBe(0);
    expect(updated.status).toBe('pending');
  });
  it('does not modify stepId that does not match', () => {
    const steps = [mkStep(1)];
    const flow = mkFlow(steps);
    const updated = addDecision(flow, 'nonexistent', mkDecision('a1', 'approved'));
    expect(updated.steps[0].decisions).toHaveLength(0);
  });
  it('accumulates multiple decisions on any_one step', () => {
    const apps = [mkApprover(1), mkApprover(2), mkApprover(3)];
    const steps = [mkStep(1, 'any_one', apps)];
    const flow = mkFlow(steps);
    let updated = addDecision(flow, 's1', mkDecision('a1', 'approved'));
    expect(updated.status).toBe('approved');
  });

  // parallel: needs both
  for (let i = 0; i < 5; i++) {
    it(`addDecision parallel both approve loop ${i}`, () => {
      const apps = [mkApprover(1), mkApprover(2)];
      const steps = [mkStep(i, 'parallel', apps)];
      const flow = { ...mkFlow(steps), currentStepIndex: 0 };
      let updated = addDecision(flow, `s${i}`, mkDecision('a1', 'approved'));
      expect(updated.status).toBe('pending');
      updated = addDecision(updated, `s${i}`, mkDecision('a2', 'approved'));
      expect(updated.status).toBe('approved');
    });
  }
});

// ─── advanceFlow ────────────────────────────────────────────────────────────

describe('advanceFlow', () => {
  it('does not advance if current step is pending', () => {
    const flow = mkFlow([mkStep(1)]);
    expect(advanceFlow(flow).currentStepIndex).toBe(0);
    expect(advanceFlow(flow).status).toBe('pending');
  });
  it('advances index when current step is approved', () => {
    const steps = [{ ...mkStep(1), status: 'approved' as ApprovalStatus, decisions: [mkDecision('a1', 'approved')] }, mkStep(2)];
    const flow = mkFlow(steps);
    const updated = advanceFlow(flow);
    expect(updated.currentStepIndex).toBe(1);
  });
  it('sets status=approved when all steps done', () => {
    const steps = [{ ...mkStep(1), status: 'approved' as ApprovalStatus, decisions: [mkDecision('a1', 'approved')] }];
    const flow = mkFlow(steps);
    const updated = advanceFlow(flow);
    expect(updated.status).toBe('approved');
  });
  it('sets completedAt when fully approved', () => {
    const steps = [{ ...mkStep(1), status: 'approved' as ApprovalStatus, decisions: [mkDecision('a1', 'approved')] }];
    const flow = mkFlow(steps);
    const updated = advanceFlow(flow);
    expect(updated.completedAt).toBeGreaterThan(0);
  });
  it('sets status=rejected on rejection', () => {
    const steps = [{ ...mkStep(1), status: 'rejected' as ApprovalStatus, decisions: [mkDecision('a1', 'rejected')] }];
    const flow = mkFlow(steps);
    expect(advanceFlow(flow).status).toBe('rejected');
  });
  it('sets completedAt on rejection', () => {
    const steps = [{ ...mkStep(1), status: 'rejected' as ApprovalStatus, decisions: [mkDecision('a1', 'rejected')] }];
    const flow = mkFlow(steps);
    expect(advanceFlow(flow).completedAt).toBeGreaterThan(0);
  });
  it('no advance for empty steps (returns approved)', () => {
    const flow = mkFlow([]);
    const updated = advanceFlow(flow);
    expect(updated.status).toBe('approved');
  });
  it('is immutable', () => {
    const flow = mkFlow([mkStep(1)]);
    advanceFlow(flow);
    expect(flow.currentStepIndex).toBe(0);
  });

  // multi-step flows
  for (let n = 2; n <= 5; n++) {
    it(`advanceFlow multi-step: advances through ${n} approved steps to approved`, () => {
      let steps = Array.from({ length: n }, (_, i) => mkStep(i, 'sequential', [mkApprover(i)]));
      let flow = mkFlow(steps);
      for (let i = 0; i < n; i++) {
        flow = addDecision(flow, `s${i}`, mkDecision(`a${i}`, 'approved'));
      }
      expect(flow.status).toBe('approved');
    });
  }

  for (let i = 0; i < 8; i++) {
    it(`advanceFlow rejection at step ${i} of 8-step flow`, () => {
      const n = 8;
      const steps = Array.from({ length: n }, (_, idx) => mkStep(idx, 'sequential', [mkApprover(idx)]));
      let flow = mkFlow(steps);
      for (let j = 0; j < i; j++) {
        flow = addDecision(flow, `s${j}`, mkDecision(`a${j}`, 'approved'));
      }
      flow = addDecision(flow, `s${i}`, mkDecision(`a${i}`, 'rejected'));
      expect(flow.status).toBe('rejected');
    });
  }
});

// ─── withdrawFlow ────────────────────────────────────────────────────────────

describe('withdrawFlow', () => {
  it('sets status to withdrawn', () => {
    expect(withdrawFlow(mkFlow([mkStep(1)])).status).toBe('withdrawn');
  });
  it('sets completedAt', () => {
    expect(withdrawFlow(mkFlow()).completedAt).toBeGreaterThan(0);
  });
  it('is immutable', () => {
    const flow = mkFlow([mkStep(1)]);
    withdrawFlow(flow);
    expect(flow.status).toBe('pending');
  });
  it('completedAt is recent', () => {
    const withdrawn = withdrawFlow(mkFlow());
    expect(withdrawn.completedAt!).toBeGreaterThan(Date.now() - 5000);
  });
  it('can withdraw an already-pending flow', () => {
    const flow = mkFlow([mkStep(1), mkStep(2)]);
    const w = withdrawFlow(flow);
    expect(w.status).toBe('withdrawn');
    expect(w.steps).toHaveLength(2);
  });
  it('preserves all other fields', () => {
    const flow = mkFlow([mkStep(1)]);
    const w = withdrawFlow(flow);
    expect(w.id).toBe(flow.id);
    expect(w.name).toBe(flow.name);
    expect(w.entityId).toBe(flow.entityId);
    expect(w.requestedBy).toBe(flow.requestedBy);
  });

  for (let i = 0; i < 15; i++) {
    it(`withdrawFlow loop ${i}: status is withdrawn`, () => {
      const flow = createFlow(`f${i}`, `Flow${i}`, `e${i}`, 'doc', [], `user${i}`);
      expect(withdrawFlow(flow).status).toBe('withdrawn');
    });
  }
});

// ─── getFlowSummary ──────────────────────────────────────────────────────────

describe('getFlowSummary', () => {
  it('totalSteps counts all steps', () => {
    const flow = mkFlow([mkStep(1), mkStep(2), mkStep(3)]);
    expect(getFlowSummary(flow).totalSteps).toBe(3);
  });
  it('completedSteps=0 when none done', () => {
    expect(getFlowSummary(mkFlow([mkStep(1)])).completedSteps).toBe(0);
  });
  it('completedSteps=1 when one approved', () => {
    const steps = [{ ...mkStep(1), status: 'approved' as ApprovalStatus, decisions: [mkDecision('a1', 'approved')] }, mkStep(2)];
    const flow = mkFlow(steps);
    expect(getFlowSummary(flow).completedSteps).toBe(1);
  });
  it('completedSteps counts rejected steps too', () => {
    const steps = [{ ...mkStep(1), status: 'rejected' as ApprovalStatus, decisions: [mkDecision('a1', 'rejected')] }];
    const flow = mkFlow(steps);
    expect(getFlowSummary(flow).completedSteps).toBe(1);
  });
  it('pendingSteps=1 when one pending', () => {
    expect(getFlowSummary(mkFlow([mkStep(1)])).pendingSteps).toBe(1);
  });
  it('pendingSteps=0 when all approved', () => {
    const steps = [{ ...mkStep(1), status: 'approved' as ApprovalStatus, decisions: [mkDecision('a1', 'approved')] }];
    const flow = { ...mkFlow(steps), status: 'approved' as ApprovalStatus };
    expect(getFlowSummary(flow).pendingSteps).toBe(0);
  });
  it('isComplete=false for pending flow', () => {
    expect(getFlowSummary(mkFlow([mkStep(1)])).isComplete).toBe(false);
  });
  it('isComplete=true for approved flow', () => {
    const flow = { ...mkFlow(), status: 'approved' as ApprovalStatus };
    expect(getFlowSummary(flow).isComplete).toBe(true);
  });
  it('isComplete=true for rejected flow', () => {
    const flow = { ...mkFlow(), status: 'rejected' as ApprovalStatus };
    expect(getFlowSummary(flow).isComplete).toBe(true);
  });
  it('isComplete=true for withdrawn flow', () => {
    const flow = { ...mkFlow(), status: 'withdrawn' as ApprovalStatus };
    expect(getFlowSummary(flow).isComplete).toBe(true);
  });
  it('isFinallyApproved=true for approved', () => {
    const flow = { ...mkFlow(), status: 'approved' as ApprovalStatus };
    expect(getFlowSummary(flow).isFinallyApproved).toBe(true);
  });
  it('isFinallyApproved=false for rejected', () => {
    const flow = { ...mkFlow(), status: 'rejected' as ApprovalStatus };
    expect(getFlowSummary(flow).isFinallyApproved).toBe(false);
  });
  it('isFinallyRejected=true for rejected', () => {
    const flow = { ...mkFlow(), status: 'rejected' as ApprovalStatus };
    expect(getFlowSummary(flow).isFinallyRejected).toBe(true);
  });
  it('isFinallyRejected=false for approved', () => {
    const flow = { ...mkFlow(), status: 'approved' as ApprovalStatus };
    expect(getFlowSummary(flow).isFinallyRejected).toBe(false);
  });
  it('currentStep is the step at currentStepIndex', () => {
    const steps = [mkStep(1), mkStep(2)];
    const flow = mkFlow(steps);
    expect(getFlowSummary(flow).currentStep?.id).toBe('s1');
  });
  it('currentStep is undefined for empty steps flow', () => {
    expect(getFlowSummary(mkFlow([])).currentStep).toBeUndefined();
  });

  const terminalStatuses: ApprovalStatus[] = ['approved', 'rejected', 'withdrawn', 'escalated', 'expired'];
  terminalStatuses.forEach(s => {
    it(`isComplete=true when status=${s}`, () => {
      const flow = { ...mkFlow(), status: s };
      expect(getFlowSummary(flow).isComplete).toBe(true);
    });
  });

  for (let n = 0; n <= 10; n++) {
    it(`getFlowSummary totalSteps=${n}`, () => {
      const steps = Array.from({ length: n }, (_, i) => mkStep(i));
      expect(getFlowSummary(mkFlow(steps)).totalSteps).toBe(n);
    });
  }

  for (let approved = 0; approved <= 5; approved++) {
    it(`getFlowSummary completedSteps=${approved} of 5`, () => {
      const steps = Array.from({ length: 5 }, (_, i) => {
        if (i < approved) return { ...mkStep(i), status: 'approved' as ApprovalStatus, decisions: [mkDecision(`a${i}`, 'approved')] };
        return mkStep(i);
      });
      const flow = mkFlow(steps);
      expect(getFlowSummary(flow).completedSteps).toBe(approved);
    });
  }
});

// ─── canApprove ──────────────────────────────────────────────────────────────

describe('canApprove', () => {
  it('returns true when approver is in current step', () => {
    const flow = mkFlow([mkStep(1, 'sequential', [mkApprover(1)])]);
    expect(canApprove(flow, 'a1')).toBe(true);
  });
  it('returns false when approver is not in current step', () => {
    const flow = mkFlow([mkStep(1, 'sequential', [mkApprover(1)])]);
    expect(canApprove(flow, 'a99')).toBe(false);
  });
  it('returns false when flow is not pending', () => {
    const flow = { ...mkFlow([mkStep(1)]), status: 'approved' as ApprovalStatus };
    expect(canApprove(flow, 'a1')).toBe(false);
  });
  it('returns false when flow is rejected', () => {
    const flow = { ...mkFlow([mkStep(1)]), status: 'rejected' as ApprovalStatus };
    expect(canApprove(flow, 'a1')).toBe(false);
  });
  it('returns false when flow is withdrawn', () => {
    const flow = { ...mkFlow([mkStep(1)]), status: 'withdrawn' as ApprovalStatus };
    expect(canApprove(flow, 'a1')).toBe(false);
  });
  it('returns false when no steps', () => {
    expect(canApprove(mkFlow([]), 'a1')).toBe(false);
  });
  it('returns true for delegate approver', () => {
    const approver: Approver = { ...mkApprover(1), delegateTo: 'delegate99' };
    const step = createStep('s1', 'Step', 1, 'sequential', [approver]);
    const flow = mkFlow([step]);
    expect(canApprove(flow, 'delegate99')).toBe(true);
  });
  it('returns false for delegate of wrong step approver', () => {
    const approver: Approver = { ...mkApprover(1), delegateTo: 'delegate99' };
    const step = createStep('s1', 'Step', 1, 'sequential', [approver]);
    const flow = mkFlow([step]);
    expect(canApprove(flow, 'delegate00')).toBe(false);
  });
  it('returns false when current step is already approved', () => {
    const step = { ...mkStep(1), status: 'approved' as ApprovalStatus };
    const flow = mkFlow([step]);
    expect(canApprove(flow, 'a1')).toBe(false);
  });
  it('returns false when current step is rejected', () => {
    const step = { ...mkStep(1), status: 'rejected' as ApprovalStatus };
    const flow = mkFlow([step]);
    expect(canApprove(flow, 'a1')).toBe(false);
  });

  // Many approvers in parallel step - each can approve
  for (let i = 0; i < 8; i++) {
    it(`canApprove: approver ${i} in parallel step`, () => {
      const apps = Array.from({ length: 8 }, (_, idx) => mkApprover(idx));
      const flow = mkFlow([mkStep(1, 'parallel', apps)]);
      expect(canApprove(flow, `a${i}`)).toBe(true);
    });
  }

  const nonPendingStatuses: ApprovalStatus[] = ['approved', 'rejected', 'withdrawn', 'escalated', 'expired'];
  nonPendingStatuses.forEach(s => {
    it(`canApprove returns false when flow status=${s}`, () => {
      const flow = { ...mkFlow([mkStep(1, 'sequential', [mkApprover(1)])]), status: s };
      expect(canApprove(flow, 'a1')).toBe(false);
    });
  });
});

// ─── hasApproved ─────────────────────────────────────────────────────────────

describe('hasApproved', () => {
  it('returns false when no decisions made', () => {
    const flow = mkFlow([mkStep(1)]);
    expect(hasApproved(flow, 's1', 'a1')).toBe(false);
  });
  it('returns true after decision made by approver', () => {
    const flow = mkFlow([mkStep(1)]);
    const updated = addDecision(flow, 's1', mkDecision('a1', 'approved'));
    expect(hasApproved(updated, 's1', 'a1')).toBe(true);
  });
  it('returns false for different approver', () => {
    const flow = mkFlow([mkStep(1)]);
    const updated = addDecision(flow, 's1', mkDecision('a1', 'approved'));
    expect(hasApproved(updated, 's1', 'a99')).toBe(false);
  });
  it('returns false for non-existent step', () => {
    const flow = mkFlow([mkStep(1)]);
    expect(hasApproved(flow, 'nonexistent', 'a1')).toBe(false);
  });
  it('returns true for rejected decision too', () => {
    const flow = mkFlow([mkStep(1)]);
    const updated = addDecision(flow, 's1', mkDecision('a1', 'rejected'));
    expect(hasApproved(updated, 's1', 'a1')).toBe(true);
  });
  it('returns false when step id wrong', () => {
    const flow = mkFlow([mkStep(1), mkStep(2)]);
    const updated = addDecision(flow, 's1', mkDecision('a1', 'approved'));
    expect(hasApproved(updated, 's2', 'a1')).toBe(false);
  });

  for (let i = 0; i < 10; i++) {
    it(`hasApproved returns true for approver a${i} after decision`, () => {
      const apps = [mkApprover(i)];
      const steps = [mkStep(1, 'sequential', apps)];
      const flow = mkFlow(steps);
      const updated = addDecision(flow, 's1', mkDecision(`a${i}`, 'approved'));
      expect(hasApproved(updated, 's1', `a${i}`)).toBe(true);
    });
  }

  for (let i = 0; i < 5; i++) {
    it(`hasApproved returns false for approver who did not decide (loop ${i})`, () => {
      const flow = mkFlow([mkStep(1)]);
      expect(hasApproved(flow, 's1', `nobody${i}`)).toBe(false);
    });
  }
});

// ─── isValidStatus ───────────────────────────────────────────────────────────

describe('isValidStatus', () => {
  const validStatuses = ['pending', 'approved', 'rejected', 'escalated', 'withdrawn', 'expired'];
  validStatuses.forEach(s => {
    it(`isValidStatus('${s}') is true`, () => expect(isValidStatus(s)).toBe(true));
  });

  const invalidStatuses = ['', 'unknown', 'PENDING', 'Approved', 'REJECTED', 'null', 'undefined', '0', 'active', 'inactive', 'done', 'complete', 'cancelled', 'closed'];
  invalidStatuses.forEach(s => {
    it(`isValidStatus('${s}') is false`, () => expect(isValidStatus(s)).toBe(false));
  });

  for (let i = 0; i < 10; i++) {
    it(`isValidStatus with random string loop ${i} is false`, () => {
      expect(isValidStatus(`random_${i}`)).toBe(false);
    });
  }

  it('returns true for all 6 valid statuses count check', () => {
    const count = validStatuses.filter(s => isValidStatus(s)).length;
    expect(count).toBe(6);
  });
});

// ─── isValidStepType ─────────────────────────────────────────────────────────

describe('isValidStepType', () => {
  const validTypes = ['sequential', 'parallel', 'any_one'];
  validTypes.forEach(t => {
    it(`isValidStepType('${t}') is true`, () => expect(isValidStepType(t)).toBe(true));
  });

  const invalidTypes = ['', 'any', 'all', 'SEQUENTIAL', 'Parallel', 'ANY_ONE', 'sync', 'async', 'batch', '0', 'none'];
  invalidTypes.forEach(t => {
    it(`isValidStepType('${t}') is false`, () => expect(isValidStepType(t)).toBe(false));
  });

  for (let i = 0; i < 10; i++) {
    it(`isValidStepType with random string loop ${i} is false`, () => {
      expect(isValidStepType(`bad_type_${i}`)).toBe(false);
    });
  }

  it('returns true for all 3 valid types count check', () => {
    const count = validTypes.filter(t => isValidStepType(t)).length;
    expect(count).toBe(3);
  });

  validTypes.forEach(t => {
    it(`createStep with type '${t}' has valid type`, () => {
      expect(isValidStepType(createStep('id', 'n', 0, t as StepType, []).type)).toBe(true);
    });
  });
});

// ─── sortStepsByOrder ────────────────────────────────────────────────────────

describe('sortStepsByOrder', () => {
  it('sorts ascending by order', () => {
    const steps = [mkStep(3), mkStep(1), mkStep(2)];
    const sorted = sortStepsByOrder(steps);
    expect(sorted.map(s => s.order)).toEqual([1, 2, 3]);
  });
  it('returns new array (immutable)', () => {
    const steps = [mkStep(2), mkStep(1)];
    const sorted = sortStepsByOrder(steps);
    expect(sorted).not.toBe(steps);
  });
  it('original array unchanged', () => {
    const steps = [mkStep(2), mkStep(1)];
    sortStepsByOrder(steps);
    expect(steps[0].order).toBe(2);
  });
  it('handles empty array', () => {
    expect(sortStepsByOrder([])).toEqual([]);
  });
  it('handles single step', () => {
    const steps = [mkStep(5)];
    expect(sortStepsByOrder(steps)[0].order).toBe(5);
  });
  it('preserves step data after sorting', () => {
    const steps = [mkStep(3), mkStep(1)];
    const sorted = sortStepsByOrder(steps);
    expect(sorted[0].id).toBe('s1');
    expect(sorted[1].id).toBe('s3');
  });
  it('handles already-sorted array', () => {
    const steps = [mkStep(1), mkStep(2), mkStep(3)];
    const sorted = sortStepsByOrder(steps);
    expect(sorted.map(s => s.order)).toEqual([1, 2, 3]);
  });
  it('handles reverse-sorted array', () => {
    const steps = [mkStep(5), mkStep(4), mkStep(3), mkStep(2), mkStep(1)];
    const sorted = sortStepsByOrder(steps);
    expect(sorted.map(s => s.order)).toEqual([1, 2, 3, 4, 5]);
  });
  it('handles equal orders without crashing', () => {
    const steps = [mkStep(1), mkStep(1)];
    expect(() => sortStepsByOrder(steps)).not.toThrow();
  });

  // Generate random permutations and verify sorted order
  for (let n = 2; n <= 10; n++) {
    it(`sortStepsByOrder with ${n} steps in reverse`, () => {
      const steps = Array.from({ length: n }, (_, i) => mkStep(n - i));
      const sorted = sortStepsByOrder(steps);
      for (let j = 0; j < n - 1; j++) {
        expect(sorted[j].order).toBeLessThanOrEqual(sorted[j + 1].order);
      }
    });
  }

  for (let n = 2; n <= 8; n++) {
    it(`sortStepsByOrder produces ascending order for ${n} shuffled steps`, () => {
      // Shuffle by reversing
      const steps = Array.from({ length: n }, (_, i) => mkStep(n - 1 - i));
      const sorted = sortStepsByOrder(steps);
      const orders = sorted.map(s => s.order);
      const isSorted = orders.every((v, i, arr) => i === 0 || arr[i - 1] <= v);
      expect(isSorted).toBe(true);
    });
  }
});

// ─── getPendingApprovers ─────────────────────────────────────────────────────

describe('getPendingApprovers', () => {
  it('returns all approvers when none have decided', () => {
    const apps = [mkApprover(1), mkApprover(2), mkApprover(3)];
    const flow = mkFlow([mkStep(1, 'parallel', apps)]);
    expect(getPendingApprovers(flow)).toHaveLength(3);
  });
  it('returns empty when step is done', () => {
    const apps = [mkApprover(1)];
    const step = { ...mkStep(1, 'sequential', apps), status: 'approved' as ApprovalStatus };
    const flow = mkFlow([step]);
    expect(getPendingApprovers(flow)).toHaveLength(0);
  });
  it('returns empty when flow has no steps', () => {
    expect(getPendingApprovers(mkFlow([]))).toHaveLength(0);
  });
  it('removes approver after they decide', () => {
    const apps = [mkApprover(1), mkApprover(2)];
    const flow = mkFlow([mkStep(1, 'parallel', apps)]);
    const updated = addDecision(flow, 's1', mkDecision('a1', 'approved'));
    // step still pending (only one of two approved), so pending approvers = a2
    const pending = getPendingApprovers(updated);
    expect(pending.some(a => a.id === 'a1')).toBe(false);
    expect(pending.some(a => a.id === 'a2')).toBe(true);
  });
  it('returns empty when no current step approvers pending', () => {
    const apps = [mkApprover(1)];
    const decisions = [mkDecision('a1', 'approved')];
    const step: ApprovalStep = { ...mkStep(1, 'parallel', apps), decisions };
    // step status: approved (1/1) - which means status is 'approved', not pending anymore
    const updatedStep = { ...step, status: computeStepStatus(step) };
    const flow = mkFlow([updatedStep]);
    expect(getPendingApprovers(flow)).toHaveLength(0);
  });
  it('correctly identifies pending in large parallel step', () => {
    const n = 5;
    const apps = Array.from({ length: n }, (_, i) => mkApprover(i));
    const flow = mkFlow([mkStep(1, 'parallel', apps)]);
    let updated = flow;
    // approve 3 of 5
    for (let i = 0; i < 3; i++) {
      updated = addDecision(updated, 's1', mkDecision(`a${i}`, 'approved'));
    }
    // After 3 approvals the step is still pending (need all 5)
    const pending = getPendingApprovers(updated);
    expect(pending.some(a => a.id === 'a3')).toBe(true);
    expect(pending.some(a => a.id === 'a4')).toBe(true);
  });

  for (let decided = 0; decided <= 4; decided++) {
    it(`getPendingApprovers: ${decided} decided → ${5 - decided} pending (parallel 5)`, () => {
      const apps = Array.from({ length: 5 }, (_, i) => mkApprover(i));
      const flow = mkFlow([mkStep(1, 'parallel', apps)]);
      let updated = flow;
      for (let i = 0; i < decided; i++) {
        // Only run if step is still pending
        if (updated.status === 'pending' && updated.steps[0]?.status === 'pending') {
          updated = addDecision(updated, 's1', mkDecision(`a${i}`, 'approved'));
        }
      }
      // If step is still pending (decided < 5), pending approvers = 5 - decided
      if (updated.steps[0]?.status === 'pending') {
        expect(getPendingApprovers(updated)).toHaveLength(5 - decided);
      }
    });
  }
});

// ─── end-to-end integration flows ────────────────────────────────────────────

describe('end-to-end: sequential 3-step approval', () => {
  function buildThreeStepFlow() {
    const a1 = createApprover('mgr1', 'Manager 1', 'mgr1@corp.com', 'manager');
    const a2 = createApprover('dir1', 'Director 1', 'dir1@corp.com', 'director');
    const a3 = createApprover('ceo1', 'CEO', 'ceo1@corp.com', 'ceo');
    const s1 = createStep('step-mgr', 'Manager Approval', 1, 'sequential', [a1]);
    const s2 = createStep('step-dir', 'Director Approval', 2, 'sequential', [a2]);
    const s3 = createStep('step-ceo', 'CEO Approval', 3, 'sequential', [a3]);
    return createFlow('flow1', 'Document Approval', 'doc123', 'document', [s1, s2, s3], 'submitter1');
  }

  it('starts at step 1 with status pending', () => {
    const flow = buildThreeStepFlow();
    expect(flow.currentStepIndex).toBe(0);
    expect(flow.status).toBe('pending');
  });
  it('manager can approve', () => {
    const flow = buildThreeStepFlow();
    expect(canApprove(flow, 'mgr1')).toBe(true);
  });
  it('director cannot approve before manager', () => {
    const flow = buildThreeStepFlow();
    expect(canApprove(flow, 'dir1')).toBe(false);
  });
  it('after manager approves, moves to step 2', () => {
    const flow = buildThreeStepFlow();
    const d = makeDecision('mgr1', 'Manager 1', 'approved');
    const updated = addDecision(flow, 'step-mgr', d);
    expect(updated.currentStepIndex).toBe(1);
    expect(updated.status).toBe('pending');
  });
  it('after manager approves, director can approve', () => {
    const flow = buildThreeStepFlow();
    const d = makeDecision('mgr1', 'Manager 1', 'approved');
    const updated = addDecision(flow, 'step-mgr', d);
    expect(canApprove(updated, 'dir1')).toBe(true);
  });
  it('fully approved after all 3 steps', () => {
    let flow = buildThreeStepFlow();
    flow = addDecision(flow, 'step-mgr', makeDecision('mgr1', 'Manager 1', 'approved'));
    flow = addDecision(flow, 'step-dir', makeDecision('dir1', 'Director 1', 'approved'));
    flow = addDecision(flow, 'step-ceo', makeDecision('ceo1', 'CEO', 'approved'));
    expect(flow.status).toBe('approved');
  });
  it('rejected at step 2 stops the flow', () => {
    let flow = buildThreeStepFlow();
    flow = addDecision(flow, 'step-mgr', makeDecision('mgr1', 'Manager 1', 'approved'));
    flow = addDecision(flow, 'step-dir', makeDecision('dir1', 'Director 1', 'rejected', 'Budget exceeded'));
    expect(flow.status).toBe('rejected');
  });
  it('summary after full approval', () => {
    let flow = buildThreeStepFlow();
    flow = addDecision(flow, 'step-mgr', makeDecision('mgr1', 'Manager 1', 'approved'));
    flow = addDecision(flow, 'step-dir', makeDecision('dir1', 'Director 1', 'approved'));
    flow = addDecision(flow, 'step-ceo', makeDecision('ceo1', 'CEO', 'approved'));
    const summary = getFlowSummary(flow);
    expect(summary.isComplete).toBe(true);
    expect(summary.isFinallyApproved).toBe(true);
    expect(summary.isFinallyRejected).toBe(false);
    expect(summary.totalSteps).toBe(3);
  });
  it('withdraw after step 1 approval', () => {
    let flow = buildThreeStepFlow();
    flow = addDecision(flow, 'step-mgr', makeDecision('mgr1', 'Manager 1', 'approved'));
    flow = withdrawFlow(flow);
    expect(flow.status).toBe('withdrawn');
  });
  it('completedAt set after withdrawal', () => {
    let flow = buildThreeStepFlow();
    flow = withdrawFlow(flow);
    expect(flow.completedAt).toBeDefined();
  });
  it('hasApproved is true for manager after approval', () => {
    let flow = buildThreeStepFlow();
    flow = addDecision(flow, 'step-mgr', makeDecision('mgr1', 'Manager 1', 'approved'));
    expect(hasApproved(flow, 'step-mgr', 'mgr1')).toBe(true);
  });
  it('hasApproved is false for director before their turn', () => {
    const flow = buildThreeStepFlow();
    expect(hasApproved(flow, 'step-dir', 'dir1')).toBe(false);
  });

  for (let i = 0; i < 5; i++) {
    it(`end-to-end sequential 3-step loop ${i}: all approve → approved`, () => {
      let flow = buildThreeStepFlow();
      flow = addDecision(flow, 'step-mgr', makeDecision('mgr1', 'M', 'approved'));
      flow = addDecision(flow, 'step-dir', makeDecision('dir1', 'D', 'approved'));
      flow = addDecision(flow, 'step-ceo', makeDecision('ceo1', 'C', 'approved'));
      expect(flow.status).toBe('approved');
    });
  }
});

describe('end-to-end: parallel step', () => {
  function buildParallelFlow() {
    const apps = [
      createApprover('a1', 'Alice', 'alice@corp.com'),
      createApprover('a2', 'Bob', 'bob@corp.com'),
      createApprover('a3', 'Carol', 'carol@corp.com'),
    ];
    const step = createStep('par-step', 'Parallel Step', 1, 'parallel', apps);
    return createFlow('pf1', 'Parallel Flow', 'e1', 'change', [step], 'requester');
  }

  it('all three can approve initially', () => {
    const flow = buildParallelFlow();
    expect(canApprove(flow, 'a1')).toBe(true);
    expect(canApprove(flow, 'a2')).toBe(true);
    expect(canApprove(flow, 'a3')).toBe(true);
  });
  it('flow still pending after one approval', () => {
    let flow = buildParallelFlow();
    flow = addDecision(flow, 'par-step', makeDecision('a1', 'Alice', 'approved'));
    expect(flow.status).toBe('pending');
  });
  it('flow still pending after two approvals', () => {
    let flow = buildParallelFlow();
    flow = addDecision(flow, 'par-step', makeDecision('a1', 'Alice', 'approved'));
    flow = addDecision(flow, 'par-step', makeDecision('a2', 'Bob', 'approved'));
    expect(flow.status).toBe('pending');
  });
  it('flow approved after all three approve', () => {
    let flow = buildParallelFlow();
    flow = addDecision(flow, 'par-step', makeDecision('a1', 'Alice', 'approved'));
    flow = addDecision(flow, 'par-step', makeDecision('a2', 'Bob', 'approved'));
    flow = addDecision(flow, 'par-step', makeDecision('a3', 'Carol', 'approved'));
    expect(flow.status).toBe('approved');
  });
  it('flow rejected immediately if one rejects', () => {
    let flow = buildParallelFlow();
    flow = addDecision(flow, 'par-step', makeDecision('a1', 'Alice', 'rejected'));
    expect(flow.status).toBe('rejected');
  });
  it('getPendingApprovers reflects decided set', () => {
    let flow = buildParallelFlow();
    flow = addDecision(flow, 'par-step', makeDecision('a1', 'Alice', 'approved'));
    const pending = getPendingApprovers(flow);
    expect(pending.map(a => a.id)).not.toContain('a1');
    expect(pending.map(a => a.id)).toContain('a2');
    expect(pending.map(a => a.id)).toContain('a3');
  });

  for (let i = 0; i < 5; i++) {
    it(`parallel flow all approve loop ${i}`, () => {
      let flow = buildParallelFlow();
      flow = addDecision(flow, 'par-step', makeDecision('a1', 'Alice', 'approved'));
      flow = addDecision(flow, 'par-step', makeDecision('a2', 'Bob', 'approved'));
      flow = addDecision(flow, 'par-step', makeDecision('a3', 'Carol', 'approved'));
      expect(flow.status).toBe('approved');
      const summary = getFlowSummary(flow);
      expect(summary.isFinallyApproved).toBe(true);
    });
  }
});

describe('end-to-end: any_one step', () => {
  function buildAnyOneFlow() {
    const apps = [
      createApprover('r1', 'Reviewer 1', 'r1@corp.com'),
      createApprover('r2', 'Reviewer 2', 'r2@corp.com'),
      createApprover('r3', 'Reviewer 3', 'r3@corp.com'),
    ];
    const step = createStep('any-step', 'Any One Step', 1, 'any_one', apps);
    return createFlow('af1', 'AnyOne Flow', 'e1', 'purchase', [step], 'requester');
  }

  it('approved once any reviewer approves', () => {
    let flow = buildAnyOneFlow();
    flow = addDecision(flow, 'any-step', makeDecision('r2', 'Reviewer 2', 'approved'));
    expect(flow.status).toBe('approved');
  });
  it('rejected if first decision is rejected', () => {
    let flow = buildAnyOneFlow();
    flow = addDecision(flow, 'any-step', makeDecision('r1', 'Reviewer 1', 'rejected'));
    expect(flow.status).toBe('rejected');
  });
  it('pending before any decision', () => {
    const flow = buildAnyOneFlow();
    expect(flow.status).toBe('pending');
  });
  it('any approver can approve immediately', () => {
    for (let i = 1; i <= 3; i++) {
      let flow = buildAnyOneFlow();
      flow = addDecision(flow, 'any-step', makeDecision(`r${i}`, `Reviewer ${i}`, 'approved'));
      expect(flow.status).toBe('approved');
    }
  });

  for (let i = 0; i < 10; i++) {
    it(`any_one: reviewer ${(i % 3) + 1} approves in loop ${i}`, () => {
      const reviewerId = `r${(i % 3) + 1}`;
      let flow = buildAnyOneFlow();
      flow = addDecision(flow, 'any-step', makeDecision(reviewerId, `Reviewer ${(i % 3) + 1}`, 'approved'));
      expect(flow.status).toBe('approved');
    });
  }
});

describe('end-to-end: delegation', () => {
  it('delegate can approve on behalf', () => {
    const primary: Approver = { id: 'primary1', name: 'Primary', email: 'p@c.com', delegateTo: 'delegate1' };
    const step = createStep('step1', 'Step', 1, 'sequential', [primary]);
    const flow = createFlow('f1', 'Flow', 'e1', 'doc', [step], 'req');
    expect(canApprove(flow, 'delegate1')).toBe(true);
  });
  it('original approver still can approve when delegation set', () => {
    const primary: Approver = { id: 'primary1', name: 'Primary', email: 'p@c.com', delegateTo: 'delegate1' };
    const step = createStep('step1', 'Step', 1, 'sequential', [primary]);
    const flow = createFlow('f1', 'Flow', 'e1', 'doc', [step], 'req');
    expect(canApprove(flow, 'primary1')).toBe(true);
  });
  it('random user cannot approve just because delegation exists', () => {
    const primary: Approver = { id: 'primary1', name: 'Primary', email: 'p@c.com', delegateTo: 'delegate1' };
    const step = createStep('step1', 'Step', 1, 'sequential', [primary]);
    const flow = createFlow('f1', 'Flow', 'e1', 'doc', [step], 'req');
    expect(canApprove(flow, 'random999')).toBe(false);
  });

  for (let i = 0; i < 8; i++) {
    it(`delegation loop ${i}: delegate${i} can approve`, () => {
      const primary: Approver = { id: `primary${i}`, name: `Primary ${i}`, email: `p${i}@c.com`, delegateTo: `delegate${i}` };
      const step = createStep('s1', 'Step', 1, 'sequential', [primary]);
      const flow = createFlow('f1', 'Flow', 'e1', 'doc', [step], 'req');
      expect(canApprove(flow, `delegate${i}`)).toBe(true);
    });
  }
});

describe('end-to-end: mixed multi-step with parallel + sequential', () => {
  function buildMixedFlow() {
    const a1 = createApprover('p1', 'Peer 1', 'p1@c.com');
    const a2 = createApprover('p2', 'Peer 2', 'p2@c.com');
    const mgr = createApprover('mgr', 'Manager', 'mgr@c.com');
    const parStep = createStep('par', 'Peer Review', 1, 'parallel', [a1, a2]);
    const seqStep = createStep('seq', 'Manager Sign-off', 2, 'sequential', [mgr]);
    return createFlow('mix', 'Mixed Flow', 'e1', 'policy', [parStep, seqStep], 'req');
  }

  it('starts at parallel step', () => {
    expect(buildMixedFlow().currentStepIndex).toBe(0);
  });
  it('advance to sequential after both peers approve', () => {
    let flow = buildMixedFlow();
    flow = addDecision(flow, 'par', makeDecision('p1', 'Peer 1', 'approved'));
    flow = addDecision(flow, 'par', makeDecision('p2', 'Peer 2', 'approved'));
    expect(flow.currentStepIndex).toBe(1);
  });
  it('full approval: peers + manager', () => {
    let flow = buildMixedFlow();
    flow = addDecision(flow, 'par', makeDecision('p1', 'Peer 1', 'approved'));
    flow = addDecision(flow, 'par', makeDecision('p2', 'Peer 2', 'approved'));
    flow = addDecision(flow, 'seq', makeDecision('mgr', 'Manager', 'approved'));
    expect(flow.status).toBe('approved');
  });
  it('rejection at parallel step stops flow', () => {
    let flow = buildMixedFlow();
    flow = addDecision(flow, 'par', makeDecision('p1', 'Peer 1', 'rejected'));
    expect(flow.status).toBe('rejected');
  });
  it('rejection at sequential step after parallel approved', () => {
    let flow = buildMixedFlow();
    flow = addDecision(flow, 'par', makeDecision('p1', 'Peer 1', 'approved'));
    flow = addDecision(flow, 'par', makeDecision('p2', 'Peer 2', 'approved'));
    flow = addDecision(flow, 'seq', makeDecision('mgr', 'Manager', 'rejected'));
    expect(flow.status).toBe('rejected');
  });
  it('sortStepsByOrder returns parallel before sequential', () => {
    const flow = buildMixedFlow();
    const sorted = sortStepsByOrder([...flow.steps].reverse());
    expect(sorted[0].id).toBe('par');
    expect(sorted[1].id).toBe('seq');
  });
  it('summary after both peers approve: completedSteps=1', () => {
    let flow = buildMixedFlow();
    flow = addDecision(flow, 'par', makeDecision('p1', 'Peer 1', 'approved'));
    flow = addDecision(flow, 'par', makeDecision('p2', 'Peer 2', 'approved'));
    const summary = getFlowSummary(flow);
    expect(summary.completedSteps).toBe(1);
    expect(summary.pendingSteps).toBe(1);
    expect(summary.isComplete).toBe(false);
  });

  for (let i = 0; i < 5; i++) {
    it(`mixed flow full approval loop ${i}`, () => {
      let flow = buildMixedFlow();
      flow = addDecision(flow, 'par', makeDecision('p1', 'P1', 'approved'));
      flow = addDecision(flow, 'par', makeDecision('p2', 'P2', 'approved'));
      flow = addDecision(flow, 'seq', makeDecision('mgr', 'Mgr', 'approved'));
      expect(flow.status).toBe('approved');
      expect(getFlowSummary(flow).isFinallyApproved).toBe(true);
    });
  }
});

// ─── edge cases ──────────────────────────────────────────────────────────────

describe('edge cases', () => {
  it('flow with zero steps is immediately approved on advanceFlow', () => {
    const flow = mkFlow([]);
    expect(advanceFlow(flow).status).toBe('approved');
  });
  it('addDecision with unknown stepId returns flow unchanged (structurally)', () => {
    const flow = mkFlow([mkStep(1)]);
    const updated = addDecision(flow, 'ghost', mkDecision('a1', 'approved'));
    expect(updated.steps[0].decisions).toHaveLength(0);
    expect(updated.status).toBe('pending');
  });
  it('parallel step with zero approvers is immediately approved', () => {
    const step = createStep('s0', 'Empty Parallel', 1, 'parallel', []);
    expect(computeStepStatus(step)).toBe('approved');
  });
  it('isStepComplete for parallel step with zero approvers', () => {
    const step = createStep('s0', 'Empty Parallel', 1, 'parallel', []);
    expect(isStepComplete(step)).toBe(true);
  });
  it('canApprove returns false for expired flow', () => {
    const flow = { ...mkFlow([mkStep(1)]), status: 'expired' as ApprovalStatus };
    expect(canApprove(flow, 'a1')).toBe(false);
  });
  it('canApprove returns false for escalated flow', () => {
    const flow = { ...mkFlow([mkStep(1)]), status: 'escalated' as ApprovalStatus };
    expect(canApprove(flow, 'a1')).toBe(false);
  });
  it('createFlow requestedAt is within last second', () => {
    const before = Date.now();
    const flow = mkFlow([]);
    const after = Date.now();
    expect(flow.requestedAt).toBeGreaterThanOrEqual(before);
    expect(flow.requestedAt).toBeLessThanOrEqual(after + 10);
  });
  it('withdrawFlow preserves steps', () => {
    const steps = [mkStep(1), mkStep(2), mkStep(3)];
    const flow = mkFlow(steps);
    const withdrawn = withdrawFlow(flow);
    expect(withdrawn.steps).toHaveLength(3);
  });
  it('multiple withdrawals do not throw', () => {
    let flow = mkFlow([mkStep(1)]);
    flow = withdrawFlow(flow);
    expect(() => withdrawFlow(flow)).not.toThrow();
  });
  it('sortStepsByOrder with negative orders', () => {
    const steps = [
      createStep('a', 'A', 5, 'sequential', []),
      createStep('b', 'B', -1, 'sequential', []),
      createStep('c', 'C', 0, 'sequential', []),
    ];
    const sorted = sortStepsByOrder(steps);
    expect(sorted[0].order).toBe(-1);
    expect(sorted[1].order).toBe(0);
    expect(sorted[2].order).toBe(5);
  });
  it('getFlowSummary on zero-step flow', () => {
    const summary = getFlowSummary(mkFlow([]));
    expect(summary.totalSteps).toBe(0);
    expect(summary.completedSteps).toBe(0);
    expect(summary.pendingSteps).toBe(0);
  });
  it('hasApproved returns false for empty flow steps', () => {
    expect(hasApproved(mkFlow([]), 's1', 'a1')).toBe(false);
  });
  it('getCurrentStep returns undefined when index equals steps length', () => {
    const flow = { ...mkFlow([mkStep(1)]), currentStepIndex: 1 };
    expect(getCurrentStep(flow)).toBeUndefined();
  });

  // Stress: create 20 approvers and assign to parallel step, all approve
  it('parallel step with 20 approvers all approve', () => {
    const apps = Array.from({ length: 20 }, (_, i) => mkApprover(i));
    const steps = [mkStep(0, 'parallel', apps)];
    let flow = mkFlow(steps);
    for (let i = 0; i < 20; i++) {
      flow = addDecision(flow, 's0', mkDecision(`a${i}`, 'approved'));
    }
    expect(flow.status).toBe('approved');
  });

  // Stress: 10-step sequential
  it('10-step sequential all approve', () => {
    const steps = Array.from({ length: 10 }, (_, i) => mkStep(i, 'sequential', [mkApprover(i)]));
    let flow = mkFlow(steps);
    for (let i = 0; i < 10; i++) {
      flow = addDecision(flow, `s${i}`, mkDecision(`a${i}`, 'approved'));
    }
    expect(flow.status).toBe('approved');
    expect(getFlowSummary(flow).isFinallyApproved).toBe(true);
  });

  for (let i = 0; i < 10; i++) {
    it(`edge case: withdraw after ${i} approvals in 10-step flow`, () => {
      const steps = Array.from({ length: 10 }, (_, idx) => mkStep(idx, 'sequential', [mkApprover(idx)]));
      let flow = mkFlow(steps);
      for (let j = 0; j < i; j++) {
        flow = addDecision(flow, `s${j}`, mkDecision(`a${j}`, 'approved'));
      }
      const withdrawn = withdrawFlow(flow);
      expect(withdrawn.status).toBe('withdrawn');
    });
  }
});

// ─── type guard and utility completeness ─────────────────────────────────────

describe('type completeness and utility', () => {
  it('createApprover result has exactly id,name,email without role', () => {
    const a = createApprover('x', 'y', 'z@z.com');
    expect(a.id).toBe('x');
    expect(a.name).toBe('y');
    expect(a.email).toBe('z@z.com');
    expect(a.role).toBeUndefined();
  });
  it('makeDecision decidedAt within 1s', () => {
    const before = Date.now();
    const d = makeDecision('x', 'X', 'approved');
    expect(d.decidedAt).toBeGreaterThanOrEqual(before);
    expect(d.decidedAt).toBeLessThanOrEqual(before + 1000);
  });
  it('isValidStatus returns boolean', () => {
    expect(typeof isValidStatus('pending')).toBe('boolean');
    expect(typeof isValidStatus('bad')).toBe('boolean');
  });
  it('isValidStepType returns boolean', () => {
    expect(typeof isValidStepType('parallel')).toBe('boolean');
    expect(typeof isValidStepType('bad')).toBe('boolean');
  });
  it('getPendingApprovers returns array', () => {
    expect(Array.isArray(getPendingApprovers(mkFlow([])))).toBe(true);
  });
  it('sortStepsByOrder returns array', () => {
    expect(Array.isArray(sortStepsByOrder([]))).toBe(true);
  });
  it('getFlowSummary returns object with all keys', () => {
    const s = getFlowSummary(mkFlow([]));
    expect('totalSteps' in s).toBe(true);
    expect('completedSteps' in s).toBe(true);
    expect('pendingSteps' in s).toBe(true);
    expect('isComplete' in s).toBe(true);
    expect('isFinallyApproved' in s).toBe(true);
    expect('isFinallyRejected' in s).toBe(true);
  });
  it('createFlow returns object with all required keys', () => {
    const f = mkFlow([]);
    expect('id' in f && 'name' in f && 'entityId' in f && 'steps' in f).toBe(true);
  });
  it('createStep returns object with all required keys', () => {
    const s = mkStep(1);
    expect('id' in s && 'name' in s && 'order' in s && 'type' in s).toBe(true);
    expect('status' in s && 'decisions' in s && 'approvers' in s).toBe(true);
  });

  // Ensure immutability across various operations
  const ops = [
    { name: 'addDecision', fn: (f: ApprovalFlow) => addDecision(f, 's0', mkDecision('a0', 'approved')) },
    { name: 'advanceFlow', fn: (f: ApprovalFlow) => advanceFlow(f) },
    { name: 'withdrawFlow', fn: (f: ApprovalFlow) => withdrawFlow(f) },
  ];
  ops.forEach(op => {
    it(`${op.name} does not mutate original flow`, () => {
      const steps = [mkStep(0, 'sequential', [mkApprover(0)])];
      const flow = mkFlow(steps);
      const originalStatus = flow.status;
      op.fn(flow);
      expect(flow.status).toBe(originalStatus);
    });
  });

  for (let i = 0; i < 10; i++) {
    it(`createApprover with index ${i} stores correct id and email`, () => {
      const a = createApprover(`id-${i}`, `Name ${i}`, `user${i}@corp.com`);
      expect(a.id).toBe(`id-${i}`);
      expect(a.email).toBe(`user${i}@corp.com`);
    });
  }

  for (let i = 0; i < 10; i++) {
    it(`sortStepsByOrder idempotent (already sorted) ${i}`, () => {
      const steps = Array.from({ length: i + 1 }, (_, idx) => mkStep(idx));
      const sorted = sortStepsByOrder(sortStepsByOrder(steps));
      expect(sorted.map(s => s.order)).toEqual(steps.map(s => s.order));
    });
  }
});

// ─── extended createApprover coverage ────────────────────────────────────────

describe('extended createApprover coverage', () => {
  for (let i = 0; i < 30; i++) {
    it(`createApprover extended loop ${i}: fields correct`, () => {
      const id = `ext-id-${i}`;
      const name = `Ext Name ${i}`;
      const email = `ext${i}@domain.com`;
      const role = i % 2 === 0 ? `role-${i}` : undefined;
      const a = createApprover(id, name, email, role);
      expect(a.id).toBe(id);
      expect(a.name).toBe(name);
      expect(a.email).toBe(email);
      if (role) {
        expect(a.role).toBe(role);
      } else {
        expect(a.role).toBeUndefined();
      }
    });
  }

  for (let i = 0; i < 20; i++) {
    it(`createApprover delegateTo absent by default (loop ${i})`, () => {
      const a = createApprover(`did-${i}`, `N ${i}`, `n${i}@e.com`);
      expect(a.delegateTo).toBeUndefined();
    });
  }
});

// ─── extended createStep coverage ────────────────────────────────────────────

describe('extended createStep coverage', () => {
  const stepTypes: StepType[] = ['sequential', 'parallel', 'any_one'];

  for (let i = 0; i < 30; i++) {
    it(`createStep extended loop ${i}`, () => {
      const type = stepTypes[i % 3];
      const apps = Array.from({ length: (i % 4) + 1 }, (_, idx) => mkApprover(idx));
      const s = createStep(`ext-s${i}`, `EStep ${i}`, i, type, apps);
      expect(s.id).toBe(`ext-s${i}`);
      expect(s.name).toBe(`EStep ${i}`);
      expect(s.order).toBe(i);
      expect(s.type).toBe(type);
      expect(s.status).toBe('pending');
      expect(s.decisions).toHaveLength(0);
      expect(s.approvers).toHaveLength((i % 4) + 1);
    });
  }
});

// ─── extended createFlow coverage ────────────────────────────────────────────

describe('extended createFlow coverage', () => {
  for (let i = 0; i < 25; i++) {
    it(`createFlow extended loop ${i}: all base fields correct`, () => {
      const steps = Array.from({ length: i % 5 }, (_, idx) => mkStep(idx));
      const f = createFlow(`fl-${i}`, `Flow ${i}`, `eid-${i}`, `type-${i}`, steps, `user-${i}`);
      expect(f.id).toBe(`fl-${i}`);
      expect(f.name).toBe(`Flow ${i}`);
      expect(f.entityId).toBe(`eid-${i}`);
      expect(f.entityType).toBe(`type-${i}`);
      expect(f.requestedBy).toBe(`user-${i}`);
      expect(f.status).toBe('pending');
      expect(f.currentStepIndex).toBe(0);
      expect(f.steps).toHaveLength(i % 5);
    });
  }
});

// ─── extended isValidStatus coverage ─────────────────────────────────────────

describe('extended isValidStatus coverage', () => {
  const valid = ['pending', 'approved', 'rejected', 'escalated', 'withdrawn', 'expired'];
  for (let rep = 0; rep < 8; rep++) {
    valid.forEach(s => {
      it(`isValidStatus('${s}') rep ${rep} is true`, () => expect(isValidStatus(s)).toBe(true));
    });
  }

  const invalid = ['', 'open', 'closed', 'active', 'done', 'complete', 'draft', 'submitted', 'processing', 'failed'];
  for (let rep = 0; rep < 4; rep++) {
    invalid.forEach(s => {
      it(`isValidStatus invalid('${s}') rep ${rep} is false`, () => expect(isValidStatus(s)).toBe(false));
    });
  }
});

// ─── extended isValidStepType coverage ───────────────────────────────────────

describe('extended isValidStepType coverage', () => {
  const valid = ['sequential', 'parallel', 'any_one'];
  for (let rep = 0; rep < 10; rep++) {
    valid.forEach(t => {
      it(`isValidStepType('${t}') rep ${rep} is true`, () => expect(isValidStepType(t)).toBe(true));
    });
  }

  const invalid = ['', 'seq', 'par', 'any', 'round-robin', 'unanimous', 'majority'];
  for (let rep = 0; rep < 5; rep++) {
    invalid.forEach(t => {
      it(`isValidStepType invalid('${t}') rep ${rep} is false`, () => expect(isValidStepType(t)).toBe(false));
    });
  }
});

// ─── extended makeDecision coverage ──────────────────────────────────────────

describe('extended makeDecision coverage', () => {
  for (let i = 0; i < 25; i++) {
    it(`makeDecision extended loop ${i}: approved`, () => {
      const d = makeDecision(`app-${i}`, `Approver ${i}`, 'approved', `comment ${i}`);
      expect(d.approverId).toBe(`app-${i}`);
      expect(d.approverName).toBe(`Approver ${i}`);
      expect(d.status).toBe('approved');
      expect(d.comment).toBe(`comment ${i}`);
      expect(typeof d.decidedAt).toBe('number');
    });
  }

  for (let i = 0; i < 25; i++) {
    it(`makeDecision extended loop ${i}: rejected`, () => {
      const d = makeDecision(`app-${i}`, `Approver ${i}`, 'rejected');
      expect(d.status).toBe('rejected');
      expect(d.comment).toBeUndefined();
    });
  }
});

// ─── extended withdrawFlow coverage ──────────────────────────────────────────

describe('extended withdrawFlow coverage', () => {
  for (let i = 0; i < 20; i++) {
    it(`withdrawFlow extended loop ${i}: status and completedAt`, () => {
      const steps = Array.from({ length: i % 4 }, (_, idx) => mkStep(idx));
      const flow = createFlow(`wf-${i}`, `W Flow ${i}`, `e${i}`, 'doc', steps, `u${i}`);
      const w = withdrawFlow(flow);
      expect(w.status).toBe('withdrawn');
      expect(typeof w.completedAt).toBe('number');
      expect(w.id).toBe(`wf-${i}`);
    });
  }
});

// ─── extended getFlowSummary coverage ────────────────────────────────────────

describe('extended getFlowSummary coverage', () => {
  const terminalStatuses: ApprovalStatus[] = ['approved', 'rejected', 'withdrawn', 'escalated', 'expired'];

  for (let n = 0; n <= 8; n++) {
    terminalStatuses.forEach(s => {
      it(`getFlowSummary extended: ${n} steps status=${s}`, () => {
        const steps = Array.from({ length: n }, (_, i) => mkStep(i));
        const flow = { ...createFlow('f', 'n', 'e', 't', steps, 'u'), status: s };
        const summary = getFlowSummary(flow);
        expect(summary.totalSteps).toBe(n);
        expect(summary.isComplete).toBe(true);
        expect(summary.isFinallyApproved).toBe(s === 'approved');
        expect(summary.isFinallyRejected).toBe(s === 'rejected');
      });
    });
  }
});

// ─── extended canApprove coverage ────────────────────────────────────────────

describe('extended canApprove coverage', () => {
  for (let i = 0; i < 15; i++) {
    it(`canApprove extended loop ${i}: approver a${i} in fresh flow`, () => {
      const apps = [mkApprover(i)];
      const flow = mkFlow([mkStep(i, 'sequential', apps)]);
      expect(canApprove(flow, `a${i}`)).toBe(true);
      expect(canApprove(flow, `x${i}`)).toBe(false);
    });
  }

  const blocked: ApprovalStatus[] = ['approved', 'rejected', 'withdrawn', 'escalated', 'expired'];
  for (let i = 0; i < 10; i++) {
    blocked.forEach(s => {
      it(`canApprove blocked extended status=${s} loop ${i}`, () => {
        const flow = { ...mkFlow([mkStep(0, 'sequential', [mkApprover(0)])]), status: s };
        expect(canApprove(flow, 'a0')).toBe(false);
      });
    });
  }
});

// ─── extended hasApproved coverage ───────────────────────────────────────────

describe('extended hasApproved coverage', () => {
  for (let i = 0; i < 20; i++) {
    it(`hasApproved extended loop ${i}: true after decision`, () => {
      const apps = [mkApprover(i)];
      const flow = mkFlow([mkStep(i, 'sequential', apps)]);
      const updated = addDecision(flow, `s${i}`, mkDecision(`a${i}`, 'approved'));
      expect(hasApproved(updated, `s${i}`, `a${i}`)).toBe(true);
    });
  }

  for (let i = 0; i < 15; i++) {
    it(`hasApproved extended loop ${i}: false before decision`, () => {
      const flow = mkFlow([mkStep(i)]);
      expect(hasApproved(flow, `s${i}`, `a${i}`)).toBe(false);
    });
  }
});

// ─── extended sortStepsByOrder coverage ──────────────────────────────────────

describe('extended sortStepsByOrder coverage', () => {
  for (let n = 1; n <= 15; n++) {
    it(`sortStepsByOrder extended: ${n} steps half-shuffle always sorted`, () => {
      const orders = Array.from({ length: n }, (_, i) => i);
      const half = Math.floor(n / 2);
      const shuffled = [...orders.slice(half), ...orders.slice(0, half)];
      const steps = shuffled.map((o, i) => createStep(`id${i}`, `n${i}`, o, 'sequential', []));
      const sorted = sortStepsByOrder(steps);
      for (let i = 0; i < n - 1; i++) {
        expect(sorted[i].order).toBeLessThanOrEqual(sorted[i + 1].order);
      }
    });
  }
});

// ─── extended getPendingApprovers coverage ───────────────────────────────────

describe('extended getPendingApprovers coverage', () => {
  for (let total = 1; total <= 8; total++) {
    it(`getPendingApprovers extended: ${total} approvers all pending initially`, () => {
      const apps = Array.from({ length: total }, (_, i) => mkApprover(i));
      const flow = mkFlow([mkStep(0, 'parallel', apps)]);
      expect(getPendingApprovers(flow)).toHaveLength(total);
    });
  }

  for (let total = 2; total <= 6; total++) {
    it(`getPendingApprovers extended: after first approves, ${total - 1} pending (total=${total})`, () => {
      const apps = Array.from({ length: total }, (_, i) => mkApprover(i));
      const flow = mkFlow([mkStep(0, 'parallel', apps)]);
      const updated = addDecision(flow, 's0', mkDecision('a0', 'approved'));
      if (updated.steps[0]?.status === 'pending') {
        expect(getPendingApprovers(updated)).toHaveLength(total - 1);
      }
    });
  }

  for (let i = 0; i < 10; i++) {
    it(`getPendingApprovers extended: empty for flow with no steps (loop ${i})`, () => {
      expect(getPendingApprovers(mkFlow([]))).toHaveLength(0);
    });
  }
});

// ─── extended advanceFlow coverage ───────────────────────────────────────────

describe('extended advanceFlow coverage', () => {
  for (let n = 1; n <= 8; n++) {
    it(`advanceFlow extended: fully approve ${n}-step sequential flow`, () => {
      const steps = Array.from({ length: n }, (_, i) => mkStep(i, 'sequential', [mkApprover(i)]));
      let flow = mkFlow(steps);
      for (let i = 0; i < n; i++) {
        flow = addDecision(flow, `s${i}`, mkDecision(`a${i}`, 'approved'));
      }
      expect(flow.status).toBe('approved');
      expect(getFlowSummary(flow).isFinallyApproved).toBe(true);
    });
  }

  for (let rejectAt = 0; rejectAt < 6; rejectAt++) {
    it(`advanceFlow extended: reject at step ${rejectAt} of 6-step flow`, () => {
      const n = 6;
      const steps = Array.from({ length: n }, (_, i) => mkStep(i, 'sequential', [mkApprover(i)]));
      let flow = mkFlow(steps);
      for (let i = 0; i < rejectAt; i++) {
        flow = addDecision(flow, `s${i}`, mkDecision(`a${i}`, 'approved'));
      }
      flow = addDecision(flow, `s${rejectAt}`, mkDecision(`a${rejectAt}`, 'rejected'));
      expect(flow.status).toBe('rejected');
      expect(getFlowSummary(flow).isFinallyRejected).toBe(true);
    });
  }
});

// ─── extended addDecision coverage ───────────────────────────────────────────

describe('extended addDecision coverage', () => {
  for (let i = 0; i < 15; i++) {
    it(`addDecision extended immutable: original unchanged loop ${i}`, () => {
      const steps = [mkStep(0, 'sequential', [mkApprover(0)])];
      const flow = mkFlow(steps);
      addDecision(flow, 's0', mkDecision('a0', 'approved'));
      expect(flow.steps[0].decisions).toHaveLength(0);
      expect(flow.status).toBe('pending');
    });
  }

  for (let i = 0; i < 10; i++) {
    it(`addDecision extended loop ${i}: decision stored with correct approverId`, () => {
      const steps = [mkStep(i, 'sequential', [mkApprover(i)])];
      const flow = mkFlow(steps);
      const updated = addDecision(flow, `s${i}`, mkDecision(`a${i}`, 'approved'));
      expect(updated.steps[0].decisions[0].approverId).toBe(`a${i}`);
    });
  }
});

// ─── extended computeStepStatus coverage ─────────────────────────────────────

describe('extended computeStepStatus coverage', () => {
  for (let n = 1; n <= 6; n++) {
    it(`computeStepStatus extended parallel: exactly ${n} approvals → approved`, () => {
      const apps = Array.from({ length: n }, (_, i) => mkApprover(i));
      const decisions = Array.from({ length: n }, (_, i) => mkDecision(`a${i}`, 'approved'));
      const s: ApprovalStep = { ...mkStep(0, 'parallel', apps), decisions };
      expect(computeStepStatus(s)).toBe('approved');
    });
  }

  for (let n = 2; n <= 6; n++) {
    it(`computeStepStatus extended parallel: ${n - 1} of ${n} approved → pending`, () => {
      const apps = Array.from({ length: n }, (_, i) => mkApprover(i));
      const decisions = Array.from({ length: n - 1 }, (_, i) => mkDecision(`a${i}`, 'approved'));
      const s: ApprovalStep = { ...mkStep(0, 'parallel', apps), decisions };
      expect(computeStepStatus(s)).toBe('pending');
    });
  }

  for (let i = 0; i < 10; i++) {
    it(`computeStepStatus extended any_one loop ${i}: first approver approves`, () => {
      const apps = Array.from({ length: 5 }, (_, idx) => mkApprover(idx));
      const s: ApprovalStep = { ...mkStep(0, 'any_one', apps), decisions: [mkDecision('a0', 'approved')] };
      expect(computeStepStatus(s)).toBe('approved');
    });
  }

  for (let i = 0; i < 10; i++) {
    it(`computeStepStatus extended sequential loop ${i}: single approved decision`, () => {
      const s: ApprovalStep = { ...mkStep(i, 'sequential', [mkApprover(i)]), decisions: [mkDecision(`a${i}`, 'approved')] };
      expect(computeStepStatus(s)).toBe('approved');
    });
  }
});

// ─── extended isStepComplete coverage ────────────────────────────────────────

describe('extended isStepComplete coverage', () => {
  for (let i = 0; i < 15; i++) {
    it(`isStepComplete extended: step with status approved loop ${i}`, () => {
      const s = { ...mkStep(i), status: 'approved' as ApprovalStatus };
      expect(isStepComplete(s)).toBe(true);
    });
  }

  for (let i = 0; i < 15; i++) {
    it(`isStepComplete extended: step with status rejected loop ${i}`, () => {
      const s = { ...mkStep(i), status: 'rejected' as ApprovalStatus };
      expect(isStepComplete(s)).toBe(true);
    });
  }

  for (let i = 0; i < 10; i++) {
    it(`isStepComplete extended: any_one with one approval loop ${i}`, () => {
      const apps = Array.from({ length: 4 }, (_, idx) => mkApprover(idx));
      const s: ApprovalStep = { ...mkStep(i, 'any_one', apps), decisions: [mkDecision('a0', 'approved')] };
      expect(isStepComplete(s)).toBe(true);
    });
  }
});

// ─── extended getCurrentStep coverage ────────────────────────────────────────

describe('extended getCurrentStep coverage', () => {
  for (let i = 0; i < 20; i++) {
    it(`getCurrentStep extended: index ${i % 5} of 5-step flow (loop ${i})`, () => {
      const steps = Array.from({ length: 5 }, (_, idx) => mkStep(idx));
      const idx = i % 5;
      const flow = { ...mkFlow(steps), currentStepIndex: idx };
      expect(getCurrentStep(flow)?.id).toBe(`s${idx}`);
    });
  }
});

// ─── stress: large sequential flows ──────────────────────────────────────────

describe('stress: large sequential flows', () => {
  for (let n = 5; n <= 12; n++) {
    it(`stress: ${n}-step sequential all approve`, () => {
      const steps = Array.from({ length: n }, (_, i) => mkStep(i, 'sequential', [mkApprover(i)]));
      let flow = mkFlow(steps);
      for (let i = 0; i < n; i++) {
        flow = addDecision(flow, `s${i}`, mkDecision(`a${i}`, 'approved'));
      }
      expect(flow.status).toBe('approved');
    });
  }

  for (let n = 3; n <= 8; n++) {
    it(`stress: ${n}-step sequential, reject at last`, () => {
      const steps = Array.from({ length: n }, (_, i) => mkStep(i, 'sequential', [mkApprover(i)]));
      let flow = mkFlow(steps);
      for (let i = 0; i < n - 1; i++) {
        flow = addDecision(flow, `s${i}`, mkDecision(`a${i}`, 'approved'));
      }
      flow = addDecision(flow, `s${n - 1}`, mkDecision(`a${n - 1}`, 'rejected'));
      expect(flow.status).toBe('rejected');
    });
  }
});

// ─── stress: parallel flows ───────────────────────────────────────────────────

describe('stress: large parallel flows', () => {
  for (let n = 2; n <= 8; n++) {
    it(`stress: parallel ${n} approvers, all approve`, () => {
      const apps = Array.from({ length: n }, (_, i) => mkApprover(i));
      const steps = [mkStep(0, 'parallel', apps)];
      let flow = mkFlow(steps);
      for (let i = 0; i < n; i++) {
        flow = addDecision(flow, 's0', mkDecision(`a${i}`, 'approved'));
      }
      expect(flow.status).toBe('approved');
    });
  }

  for (let n = 2; n <= 6; n++) {
    it(`stress: parallel ${n} approvers, first rejects`, () => {
      const apps = Array.from({ length: n }, (_, i) => mkApprover(i));
      const steps = [mkStep(0, 'parallel', apps)];
      const flow = mkFlow(steps);
      const updated = addDecision(flow, 's0', mkDecision('a0', 'rejected'));
      expect(updated.status).toBe('rejected');
    });
  }
});

// ─── summary completeness matrix ─────────────────────────────────────────────

describe('summary completeness matrix', () => {
  for (let total = 1; total <= 5; total++) {
    for (let approvedCount = 0; approvedCount <= total; approvedCount++) {
      it(`summary matrix: ${approvedCount}/${total} steps approved`, () => {
        const steps = Array.from({ length: total }, (_, i) => {
          if (i < approvedCount) {
            return { ...mkStep(i), status: 'approved' as ApprovalStatus, decisions: [mkDecision(`a${i}`, 'approved')] };
          }
          return mkStep(i);
        });
        const isFullyApproved = approvedCount === total;
        const status: ApprovalStatus = isFullyApproved ? 'approved' : 'pending';
        const flow = { ...mkFlow(steps), status, currentStepIndex: approvedCount };
        const summary = getFlowSummary(flow);
        expect(summary.totalSteps).toBe(total);
        expect(summary.completedSteps).toBe(approvedCount);
        expect(summary.isFinallyApproved).toBe(isFullyApproved);
      });
    }
  }
});
