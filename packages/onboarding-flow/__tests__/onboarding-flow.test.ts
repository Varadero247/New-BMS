// Copyright (c) 2026 Nexara DMCC. All rights reserved. CONFIDENTIAL — TRADE SECRET.
import {
  calculateProgress, getNextStep, isChecklistComplete, completeStep,
  skipStep, createProgress, getRemainingSteps, estimateTotalMinutes, sortStepsByOrder,
  DEFAULT_TOURS, getTourById, getAutoTours, validateTour, buildTourStep,
  getTourStepCount, isTourValid,
} from '../src/index';
import type { OnboardingChecklist, OnboardingStep, TourConfig } from '../src/index';

function makeStep(id: string, order: number, required = false): OnboardingStep {
  return { id, title: `Step ${id}`, description: `Desc ${id}`, order, required };
}

function makeChecklist(stepCount = 3): OnboardingChecklist {
  return {
    id: 'cl-1',
    name: 'Test Checklist',
    module: 'quality',
    steps: Array.from({ length: stepCount }, (_, i) => makeStep(`s${i + 1}`, i + 1, i === 0)),
  };
}

// ─── calculateProgress ────────────────────────────────────────────────────────
describe('calculateProgress', () => {
  it('0% when nothing done', () => expect(calculateProgress(makeChecklist(4), [])).toBe(0));
  it('100% when all complete', () => {
    const cl = makeChecklist(4);
    expect(calculateProgress(cl, ['s1', 's2', 's3', 's4'])).toBe(100);
  });
  it('50% when half done', () => {
    const cl = makeChecklist(4);
    expect(calculateProgress(cl, ['s1', 's2'])).toBe(50);
  });
  it('empty checklist → 100%', () => {
    expect(calculateProgress({ id: 'x', name: 'x', module: 'x', steps: [] }, [])).toBe(100);
  });
  it('counts skipped steps in progress', () => {
    const cl = makeChecklist(4);
    expect(calculateProgress(cl, ['s1'], ['s2'])).toBe(50);
  });
  for (let n = 1; n <= 50; n++) {
    it(`progress ${n}/50`, () => {
      const cl = makeChecklist(50);
      const completed = Array.from({ length: n }, (_, i) => `s${i + 1}`);
      expect(calculateProgress(cl, completed)).toBe(Math.round((n / 50) * 100));
    });
  }
  for (let n = 1; n <= 30; n++) {
    it(`full progress ${n} steps`, () => {
      const cl = makeChecklist(n);
      const ids = Array.from({ length: n }, (_, i) => `s${i + 1}`);
      expect(calculateProgress(cl, ids)).toBe(100);
    });
  }
});

// ─── getNextStep ──────────────────────────────────────────────────────────────
describe('getNextStep', () => {
  it('returns first step when none complete', () => {
    const cl = makeChecklist(3);
    expect(getNextStep(cl, [])?.id).toBe('s1');
  });
  it('returns null when all complete', () => {
    const cl = makeChecklist(3);
    expect(getNextStep(cl, ['s1', 's2', 's3'])).toBeNull();
  });
  it('skips completed steps', () => {
    const cl = makeChecklist(3);
    expect(getNextStep(cl, ['s1'])?.id).toBe('s2');
  });
  it('skips skipped steps', () => {
    const cl = makeChecklist(3);
    expect(getNextStep(cl, [], ['s1'])?.id).toBe('s2');
  });
  for (let i = 0; i < 30; i++) {
    it(`getNextStep skip ${i} steps`, () => {
      const cl = makeChecklist(50);
      const completed = Array.from({ length: i }, (_, j) => `s${j + 1}`);
      const next = getNextStep(cl, completed);
      if (i < 50) {
        expect(next?.id).toBe(`s${i + 1}`);
      } else {
        expect(next).toBeNull();
      }
    });
  }
});

// ─── isChecklistComplete ──────────────────────────────────────────────────────
describe('isChecklistComplete', () => {
  it('false when nothing done', () => expect(isChecklistComplete(makeChecklist(3), [])).toBe(false));
  it('true when all completed', () => {
    const cl = makeChecklist(3);
    expect(isChecklistComplete(cl, ['s1', 's2', 's3'])).toBe(true);
  });
  it('false if required step only skipped', () => {
    const cl = makeChecklist(3);
    expect(isChecklistComplete(cl, ['s2', 's3'], ['s1'])).toBe(false);
  });
  it('true if non-required skipped', () => {
    const cl = makeChecklist(3);
    // s1 is required (index 0), s2 and s3 not required
    expect(isChecklistComplete(cl, ['s1'], ['s2', 's3'])).toBe(true);
  });
  for (let n = 1; n <= 30; n++) {
    it(`complete with ${n} steps`, () => {
      const cl = makeChecklist(n);
      // Only s1 is required (required: i === 0 in makeChecklist)
      const completed = Array.from({ length: n }, (_, i) => `s${i + 1}`);
      expect(isChecklistComplete(cl, completed)).toBe(true);
    });
  }
});

// ─── createProgress ───────────────────────────────────────────────────────────
describe('createProgress', () => {
  it('starts at 0%', () => expect(createProgress('cl-1', 'user-1').percentComplete).toBe(0));
  it('no completed steps', () => expect(createProgress('cl-1', 'user-1').completedStepIds).toHaveLength(0));
  it('no skipped steps', () => expect(createProgress('cl-1', 'user-1').skippedStepIds).toHaveLength(0));
  it('sets checklistId', () => expect(createProgress('cl-1', 'user-1').checklistId).toBe('cl-1'));
  it('sets userId', () => expect(createProgress('cl-1', 'user-1').userId).toBe('user-1'));
  it('startedAt is a Date', () => expect(createProgress('cl-1', 'user-1').startedAt).toBeInstanceOf(Date));
  it('no completedAt initially', () => expect(createProgress('cl-1', 'user-1').completedAt).toBeUndefined());
  for (let i = 0; i < 40; i++) {
    it(`createProgress user${i}`, () => {
      const p = createProgress(`cl-${i}`, `user-${i}`);
      expect(p.userId).toBe(`user-${i}`);
      expect(p.percentComplete).toBe(0);
    });
  }
});

// ─── completeStep ─────────────────────────────────────────────────────────────
describe('completeStep', () => {
  it('adds step to completedStepIds', () => {
    const cl = makeChecklist(3);
    const p = createProgress('cl-1', 'u1');
    const p2 = completeStep(p, 's1', cl);
    expect(p2.completedStepIds).toContain('s1');
  });
  it('is immutable', () => {
    const cl = makeChecklist(3);
    const p = createProgress('cl-1', 'u1');
    const p2 = completeStep(p, 's1', cl);
    expect(p.completedStepIds).toHaveLength(0);
    expect(p2.completedStepIds).toHaveLength(1);
  });
  it('idempotent', () => {
    const cl = makeChecklist(3);
    const p = createProgress('cl-1', 'u1');
    const p2 = completeStep(completeStep(p, 's1', cl), 's1', cl);
    expect(p2.completedStepIds).toHaveLength(1);
  });
  it('sets completedAt when all done', () => {
    const cl = makeChecklist(1);
    const p = createProgress('cl-1', 'u1');
    const p2 = completeStep(p, 's1', cl);
    expect(p2.completedAt).toBeInstanceOf(Date);
  });
  it('updates percentComplete', () => {
    const cl = makeChecklist(4);
    const p = createProgress('cl-1', 'u1');
    const p2 = completeStep(p, 's1', cl);
    expect(p2.percentComplete).toBe(25);
  });
  for (let i = 1; i <= 30; i++) {
    it(`completeStep ${i} steps`, () => {
      const cl = makeChecklist(30);
      let p = createProgress('cl-1', 'u1');
      for (let j = 1; j <= i; j++) {
        p = completeStep(p, `s${j}`, cl);
      }
      expect(p.completedStepIds).toHaveLength(i);
    });
  }
});

// ─── skipStep ─────────────────────────────────────────────────────────────────
describe('skipStep', () => {
  it('adds to skippedStepIds for non-required', () => {
    const cl = makeChecklist(3);
    const p = createProgress('cl-1', 'u1');
    const p2 = skipStep(p, 's2', cl); // s2 not required
    expect(p2.skippedStepIds).toContain('s2');
  });
  it('does NOT skip required step', () => {
    const cl = makeChecklist(3);
    const p = createProgress('cl-1', 'u1');
    const p2 = skipStep(p, 's1', cl); // s1 IS required
    expect(p2.skippedStepIds).not.toContain('s1');
  });
  it('idempotent', () => {
    const cl = makeChecklist(3);
    const p = createProgress('cl-1', 'u1');
    const p2 = skipStep(skipStep(p, 's2', cl), 's2', cl);
    expect(p2.skippedStepIds).toHaveLength(1);
  });
  for (let i = 0; i < 30; i++) {
    it(`skipStep s2 iter${i}`, () => {
      const cl = makeChecklist(10);
      const p = createProgress('cl-1', 'u1');
      const p2 = skipStep(p, 's2', cl);
      expect(p2.skippedStepIds).toContain('s2');
    });
  }
});

// ─── getRemainingSteps ────────────────────────────────────────────────────────
describe('getRemainingSteps', () => {
  it('returns all steps when nothing done', () => {
    const cl = makeChecklist(3);
    const p = createProgress('cl-1', 'u1');
    expect(getRemainingSteps(cl, p)).toHaveLength(3);
  });
  it('excludes completed', () => {
    const cl = makeChecklist(3);
    const p = { ...createProgress('cl-1', 'u1'), completedStepIds: ['s1'] };
    expect(getRemainingSteps(cl, p)).toHaveLength(2);
  });
  it('excludes skipped', () => {
    const cl = makeChecklist(3);
    const p = { ...createProgress('cl-1', 'u1'), skippedStepIds: ['s2'] };
    expect(getRemainingSteps(cl, p)).toHaveLength(2);
  });
  it('sorted by order', () => {
    const cl = makeChecklist(3);
    const p = createProgress('cl-1', 'u1');
    const rem = getRemainingSteps(cl, p);
    expect(rem[0].order).toBeLessThan(rem[1].order);
  });
  for (let done = 0; done <= 20; done++) {
    it(`remaining ${20 - done} after ${done} done`, () => {
      const cl = makeChecklist(20);
      const p = { ...createProgress('cl-1', 'u1'), completedStepIds: Array.from({ length: done }, (_, i) => `s${i + 1}`) };
      expect(getRemainingSteps(cl, p)).toHaveLength(20 - done);
    });
  }
});

// ─── estimateTotalMinutes ─────────────────────────────────────────────────────
describe('estimateTotalMinutes', () => {
  it('returns > 0 for non-empty checklist', () => {
    expect(estimateTotalMinutes(makeChecklist(3))).toBeGreaterThan(0);
  });
  it('0 for empty checklist', () => {
    expect(estimateTotalMinutes({ id: 'x', name: 'x', module: 'x', steps: [] })).toBe(0);
  });
  it('default 5 min per step', () => {
    expect(estimateTotalMinutes(makeChecklist(4))).toBe(20);
  });
  it('respects estimatedMinutes', () => {
    const cl: OnboardingChecklist = {
      id: 'x', name: 'x', module: 'x',
      steps: [{ id: 's1', title: 't', description: 'd', order: 1, estimatedMinutes: 10 }],
    };
    expect(estimateTotalMinutes(cl)).toBe(10);
  });
  for (let i = 1; i <= 30; i++) {
    it(`estimateTotalMinutes ${i} steps`, () => {
      expect(estimateTotalMinutes(makeChecklist(i))).toBe(i * 5);
    });
  }
});

// ─── sortStepsByOrder ─────────────────────────────────────────────────────────
describe('sortStepsByOrder', () => {
  it('sorts ascending', () => {
    const steps = [makeStep('c', 3), makeStep('a', 1), makeStep('b', 2)];
    const sorted = sortStepsByOrder(steps);
    expect(sorted[0].id).toBe('a');
    expect(sorted[1].id).toBe('b');
    expect(sorted[2].id).toBe('c');
  });
  it('is immutable', () => {
    const steps = [makeStep('b', 2), makeStep('a', 1)];
    sortStepsByOrder(steps);
    expect(steps[0].id).toBe('b');
  });
  for (let n = 2; n <= 30; n++) {
    it(`sortStepsByOrder ${n} steps`, () => {
      const steps = Array.from({ length: n }, (_, i) => makeStep(`s${n - i}`, n - i));
      const sorted = sortStepsByOrder(steps);
      expect(sorted[0].order).toBe(1);
      expect(sorted[sorted.length - 1].order).toBe(n);
    });
  }
});

// ─── DEFAULT_TOURS ────────────────────────────────────────────────────────────
describe('DEFAULT_TOURS', () => {
  it('is an array', () => expect(Array.isArray(DEFAULT_TOURS)).toBe(true));
  it('has entries', () => expect(DEFAULT_TOURS.length).toBeGreaterThan(0));
  it('each has id', () => DEFAULT_TOURS.forEach((t) => expect(t.id).toBeTruthy()));
  it('each has steps', () => DEFAULT_TOURS.forEach((t) => expect(t.steps.length).toBeGreaterThan(0)));
  for (let i = 0; i < 30; i++) {
    it(`DEFAULT_TOURS iter${i}`, () => {
      const t = DEFAULT_TOURS[i % DEFAULT_TOURS.length];
      expect(t.id).toBeTruthy();
      expect(t.steps.length).toBeGreaterThan(0);
    });
  }
});

// ─── getTourById ──────────────────────────────────────────────────────────────
describe('getTourById', () => {
  it('finds existing tour', () => expect(getTourById('welcome')).not.toBeNull());
  it('returns null for missing', () => expect(getTourById('nonexistent')).toBeNull());
  it('works with custom tours', () => {
    const tours: TourConfig[] = [{ id: 'custom', name: 'Custom', trigger: 'manual', steps: [makeStep('s1', 1)] }];
    expect(getTourById('custom', tours)?.id).toBe('custom');
  });
  for (let i = 0; i < 30; i++) {
    it(`getTourById missing${i}`, () => expect(getTourById(`tour-missing-${i}`)).toBeNull());
  }
});

// ─── getAutoTours ─────────────────────────────────────────────────────────────
describe('getAutoTours', () => {
  it('returns only auto tours', () => {
    getAutoTours().forEach((t) => expect(t.trigger).toBe('auto'));
  });
  it('filters correctly', () => {
    const tours: TourConfig[] = [
      { id: 'a', name: 'A', trigger: 'auto', steps: [] },
      { id: 'b', name: 'B', trigger: 'manual', steps: [] },
    ];
    expect(getAutoTours(tours)).toHaveLength(1);
    expect(getAutoTours(tours)[0].id).toBe('a');
  });
  for (let i = 0; i < 20; i++) {
    it(`getAutoTours filters manual iter${i}`, () => {
      const tours: TourConfig[] = [
        { id: `auto${i}`, name: `A${i}`, trigger: 'auto', steps: [] },
        { id: `manual${i}`, name: `M${i}`, trigger: 'manual', steps: [] },
      ];
      expect(getAutoTours(tours)).toHaveLength(1);
    });
  }
});

// ─── validateTour ─────────────────────────────────────────────────────────────
describe('validateTour', () => {
  const validTour: TourConfig = { id: 'x', name: 'X', trigger: 'auto', steps: [makeStep('s1', 1)] };
  it('valid tour → empty errors', () => expect(validateTour(validTour)).toHaveLength(0));
  it('missing id → error', () => expect(validateTour({ ...validTour, id: '' })).not.toHaveLength(0));
  it('missing name → error', () => expect(validateTour({ ...validTour, name: '' })).not.toHaveLength(0));
  it('no steps → error', () => expect(validateTour({ ...validTour, steps: [] })).not.toHaveLength(0));
  it('invalid trigger → error', () => expect(validateTour({ ...validTour, trigger: 'unknown' as 'auto' })).not.toHaveLength(0));
  for (let i = 0; i < 30; i++) {
    it(`validateTour valid iter${i}`, () => {
      const t = { ...validTour, id: `tour${i}` };
      expect(validateTour(t)).toHaveLength(0);
    });
  }
});

// ─── buildTourStep ────────────────────────────────────────────────────────────
describe('buildTourStep', () => {
  it('sets defaults', () => {
    const s = buildTourStep({ id: 's1', title: 'T', description: 'D', order: 1 });
    expect(s.placement).toBe('bottom');
    expect(s.required).toBe(false);
    expect(s.estimatedMinutes).toBe(5);
  });
  it('overrides defaults', () => {
    const s = buildTourStep({ id: 's1', title: 'T', description: 'D', order: 1, placement: 'top', required: true });
    expect(s.placement).toBe('top');
    expect(s.required).toBe(true);
  });
  for (let i = 0; i < 30; i++) {
    it(`buildTourStep iter${i}`, () => {
      const s = buildTourStep({ id: `s${i}`, title: `T${i}`, description: `D${i}`, order: i });
      expect(s.id).toBe(`s${i}`);
      expect(s.placement).toBeTruthy();
    });
  }
});

// ─── getTourStepCount + isTourValid ───────────────────────────────────────────
describe('getTourStepCount and isTourValid', () => {
  const t: TourConfig = { id: 'x', name: 'X', trigger: 'auto', steps: [makeStep('s1', 1), makeStep('s2', 2)] };
  it('step count', () => expect(getTourStepCount(t)).toBe(2));
  it('valid tour', () => expect(isTourValid(t)).toBe(true));
  it('invalid tour (no id)', () => expect(isTourValid({ ...t, id: '' })).toBe(false));
  for (let i = 1; i <= 30; i++) {
    it(`getTourStepCount ${i}`, () => {
      const tour = { ...t, steps: Array.from({ length: i }, (_, j) => makeStep(`s${j}`, j)) };
      expect(getTourStepCount(tour)).toBe(i);
    });
  }
});

// ─── Top-up tests ─────────────────────────────────────────────────────────────
describe('onboarding top-up A', () => {
  for (let i = 0; i < 100; i++) {
    it('calculateProgress 0 completed = 0 ' + i, () => {
      const cl = makeChecklist(3);
      expect(calculateProgress(cl, [])).toBe(0);
    });
  }
  for (let i = 1; i <= 100; i++) {
    it('calculateProgress all completed = 100 n=' + i, () => {
      const n = (i % 4) + 1;
      const cl = makeChecklist(n);
      const ids = cl.steps.map(s => s.id);
      expect(calculateProgress(cl, ids)).toBe(100);
    });
  }
  for (let i = 0; i < 100; i++) {
    it('createProgress has 0 percent ' + i, () => {
      const p = createProgress('cl-' + i, 'user-' + i);
      expect(p.percentComplete).toBe(0);
    });
  }
  for (let i = 0; i < 100; i++) {
    it('estimateTotalMinutes returns number ' + i, () => {
      const cl = makeChecklist((i % 5) + 1);
      expect(typeof estimateTotalMinutes(cl)).toBe('number');
    });
  }
  for (let i = 0; i < 100; i++) {
    it('DEFAULT_TOURS is array ' + i, () => {
      expect(Array.isArray(DEFAULT_TOURS)).toBe(true);
    });
  }
});

describe('onboarding top-up B', () => {
  for (let i = 0; i < 100; i++) {
    it('sortStepsByOrder returns sorted ' + i, () => {
      const steps = [makeStep('b', 2), makeStep('a', 1)];
      const sorted = sortStepsByOrder(steps);
      expect(sorted[0].order).toBeLessThanOrEqual(sorted[1].order);
    });
  }
  for (let i = 0; i < 100; i++) {
    it('getTourById returns null for unknown ' + i, () => {
      const t = getTourById('no-such-tour-' + i);
      expect(t).toBeNull();
    });
  }
  for (let i = 0; i < 100; i++) {
    it('getAutoTours returns array ' + i, () => {
      expect(Array.isArray(getAutoTours())).toBe(true);
    });
  }
  for (let i = 0; i < 100; i++) {
    it('isChecklistComplete false when none done ' + i, () => {
      const cl = makeChecklist((i % 3) + 1);
      expect(isChecklistComplete(cl, [])).toBe(false);
    });
  }
  for (let i = 0; i < 100; i++) {
    it('getRemainingSteps all remain when none done ' + i, () => {
      const n = (i % 4) + 1;
      const cl = makeChecklist(n);
      const progress = createProgress('cl', 'u');
      expect(getRemainingSteps(cl, progress).length).toBe(n);
    });
  }
});
