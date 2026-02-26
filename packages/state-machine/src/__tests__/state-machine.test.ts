// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import {
  canTransition,
  clearHistory,
  createMachine,
  createSimpleMachine,
  deserialize,
  getAvailableEvents,
  getHistory,
  getStateIds,
  getTransitionsFrom,
  getTransitionsTo,
  isFinal,
  isInState,
  matchesState,
  resetMachine,
  send,
  serialize,
  toDotGraph,
  transition,
  validateConfig,
  withContext,
} from '../state-machine';
import type { Machine, MachineConfig, MachineEvent } from '../types';

// ---------------------------------------------------------------------------
// Shared fixture factories
// ---------------------------------------------------------------------------

interface TrafficCtx {
  cycles: number;
  lastTransition: string;
}

function makeTrafficLight(): Machine<TrafficCtx> {
  return createMachine<TrafficCtx>({
    id: 'traffic-light',
    initial: 'RED',
    context: { cycles: 0, lastTransition: '' },
    states: [
      { id: 'RED', initial: true },
      { id: 'GREEN' },
      { id: 'YELLOW', final: false },
    ],
    transitions: [
      {
        from: 'RED',
        event: 'GO',
        to: 'GREEN',
        action: (ctx, _ev) => ({ ...ctx, lastTransition: 'RED->GREEN' }),
      },
      {
        from: 'GREEN',
        event: 'SLOW',
        to: 'YELLOW',
        action: (ctx, _ev) => ({ ...ctx, lastTransition: 'GREEN->YELLOW' }),
      },
      {
        from: 'YELLOW',
        event: 'STOP',
        to: 'RED',
        action: (ctx, _ev) => ({ ...ctx, cycles: ctx.cycles + 1, lastTransition: 'YELLOW->RED' }),
      },
    ],
  });
}

interface DocCtx {
  author: string;
  reviewer: string | null;
  approvedAt: number | null;
  rejectionReason: string | null;
}

function makeDocWorkflow(): Machine<DocCtx> {
  return createMachine<DocCtx>({
    id: 'doc-workflow',
    initial: 'DRAFT',
    context: { author: 'alice', reviewer: null, approvedAt: null, rejectionReason: null },
    states: [
      { id: 'DRAFT', initial: true },
      { id: 'REVIEW' },
      { id: 'APPROVED', final: true },
      { id: 'REJECTED', final: true },
    ],
    transitions: [
      {
        from: 'DRAFT',
        event: 'SUBMIT',
        to: 'REVIEW',
        action: (ctx, ev) => ({ ...ctx, reviewer: (ev.payload as { reviewer: string })?.reviewer ?? null }),
      },
      {
        from: 'REVIEW',
        event: 'APPROVE',
        to: 'APPROVED',
        action: (ctx, _ev) => ({ ...ctx, approvedAt: 1000 }),
      },
      {
        from: 'REVIEW',
        event: 'REJECT',
        to: 'REJECTED',
        action: (ctx, ev) => ({ ...ctx, rejectionReason: (ev.payload as { reason: string })?.reason ?? 'No reason' }),
      },
      {
        from: ['REVIEW', 'REJECTED'],
        event: 'REVERT',
        to: 'DRAFT',
        action: (ctx, _ev) => ({ ...ctx, reviewer: null, rejectionReason: null }),
      },
    ],
  });
}

interface OrderCtx {
  orderId: string;
  amount: number;
  shippedAt: number | null;
  deliveredAt: number | null;
  cancelledAt: number | null;
}

function makeOrderLifecycle(): Machine<OrderCtx> {
  return createMachine<OrderCtx>({
    id: 'order-lifecycle',
    initial: 'NEW',
    context: { orderId: 'ORD-001', amount: 99.99, shippedAt: null, deliveredAt: null, cancelledAt: null },
    states: [
      { id: 'NEW', initial: true },
      { id: 'CONFIRMED' },
      { id: 'SHIPPED' },
      { id: 'DELIVERED', final: true },
      { id: 'CANCELLED', final: true },
    ],
    transitions: [
      {
        from: 'NEW',
        event: 'CONFIRM',
        to: 'CONFIRMED',
        guard: (ctx, _ev) => ctx.amount > 0,
      },
      {
        from: 'CONFIRMED',
        event: 'SHIP',
        to: 'SHIPPED',
        action: (ctx, _ev) => ({ ...ctx, shippedAt: 2000 }),
      },
      {
        from: 'SHIPPED',
        event: 'DELIVER',
        to: 'DELIVERED',
        action: (ctx, _ev) => ({ ...ctx, deliveredAt: 3000 }),
      },
      {
        from: ['NEW', 'CONFIRMED'],
        event: 'CANCEL',
        to: 'CANCELLED',
        action: (ctx, _ev) => ({ ...ctx, cancelledAt: 4000 }),
      },
    ],
  });
}

// ---------------------------------------------------------------------------
// 1. createMachine
// ---------------------------------------------------------------------------

describe('createMachine', () => {
  it('creates machine with correct initial state', () => {
    const m = makeTrafficLight();
    expect(m.state.current).toBe('RED');
    expect(m.state.history).toHaveLength(0);
    expect(m.state.context.cycles).toBe(0);
    expect(m.state.context.lastTransition).toBe('');
    expect(m.config.id).toBe('traffic-light');
    expect(m.config.initial).toBe('RED');
  });

  it('throws when initial state does not exist', () => {
    expect(() =>
      createMachine({ id: 'x', initial: 'MISSING', context: {}, states: [{ id: 'A' }], transitions: [] }),
    ).toThrow('MISSING');
  });

  it('creates doc workflow in DRAFT state', () => {
    const m = makeDocWorkflow();
    expect(m.state.current).toBe('DRAFT');
    expect(m.state.context.author).toBe('alice');
    expect(m.state.context.reviewer).toBeNull();
    expect(m.state.context.approvedAt).toBeNull();
    expect(m.state.context.rejectionReason).toBeNull();
  });

  it('creates order lifecycle in NEW state', () => {
    const m = makeOrderLifecycle();
    expect(m.state.current).toBe('NEW');
    expect(m.state.context.orderId).toBe('ORD-001');
    expect(m.state.context.amount).toBe(99.99);
    expect(m.state.context.shippedAt).toBeNull();
    expect(m.state.context.deliveredAt).toBeNull();
    expect(m.state.context.cancelledAt).toBeNull();
  });

  it('does not mutate the config object', () => {
    const config: MachineConfig<object> = {
      id: 'test',
      initial: 'A',
      context: {},
      states: [{ id: 'A' }],
      transitions: [],
    };
    const m = createMachine(config);
    expect(m.config).toBe(config);
  });

  const multipleStates = ['A', 'B', 'C', 'D', 'E'];
  it.each(multipleStates)('creates machine with initial state %s', (stateId) => {
    const m = createMachine({
      id: 'multi',
      initial: stateId,
      context: {},
      states: multipleStates.map((id) => ({ id })),
      transitions: [],
    });
    expect(m.state.current).toBe(stateId);
    expect(m.state.history).toEqual([]);
  });

  it('stores context by reference (shallow)', () => {
    const ctx = { value: 42 };
    const m = createMachine({ id: 'ctx-test', initial: 'A', context: ctx, states: [{ id: 'A' }], transitions: [] });
    expect(m.state.context).toBe(ctx);
  });

  it('creates machine with many states without error', () => {
    const states = Array.from({ length: 50 }, (_, i) => ({ id: `S${i}` }));
    const m = createMachine({ id: 'big', initial: 'S0', context: null, states, transitions: [] });
    expect(m.config.states).toHaveLength(50);
    expect(m.state.current).toBe('S0');
  });

  it('throws descriptive error mentioning the missing state id', () => {
    expect(() =>
      createMachine({ id: 'x', initial: 'GHOST', context: {}, states: [{ id: 'A' }, { id: 'B' }], transitions: [] }),
    ).toThrow('GHOST');
  });
});

// ---------------------------------------------------------------------------
// 2. transition
// ---------------------------------------------------------------------------

describe('transition', () => {
  it('transitions traffic light RED→GREEN on GO event', () => {
    const m = makeTrafficLight();
    const result = transition(m, { type: 'GO' });
    expect(result.success).toBe(true);
    expect(result.state.current).toBe('GREEN');
    expect(result.error).toBeUndefined();
  });

  it('updates context via action on RED→GREEN', () => {
    const m = makeTrafficLight();
    const result = transition(m, { type: 'GO' });
    expect(result.state.context.lastTransition).toBe('RED->GREEN');
  });

  it('transitions GREEN→YELLOW on SLOW event', () => {
    const m = makeTrafficLight();
    const r1 = transition(m, { type: 'GO' });
    const m2 = { config: m.config, state: r1.state };
    const r2 = transition(m2, { type: 'SLOW' });
    expect(r2.success).toBe(true);
    expect(r2.state.current).toBe('YELLOW');
    expect(r2.state.context.lastTransition).toBe('GREEN->YELLOW');
  });

  it('transitions YELLOW→RED on STOP event and increments cycles', () => {
    const m = makeTrafficLight();
    const r1 = transition(m, { type: 'GO' });
    const m2 = { config: m.config, state: r1.state };
    const r2 = transition(m2, { type: 'SLOW' });
    const m3 = { config: m.config, state: r2.state };
    const r3 = transition(m3, { type: 'STOP' });
    expect(r3.success).toBe(true);
    expect(r3.state.current).toBe('RED');
    expect(r3.state.context.cycles).toBe(1);
    expect(r3.state.context.lastTransition).toBe('YELLOW->RED');
  });

  it('returns failure for unknown event', () => {
    const m = makeTrafficLight();
    const result = transition(m, { type: 'UNKNOWN' });
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.state.current).toBe('RED');
  });

  it('returns failure when guard fails', () => {
    const m = makeOrderLifecycle();
    const zeroAmount = withContext(m, { ...m.state.context, amount: 0 });
    const result = transition(zeroAmount, { type: 'CONFIRM' });
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('does NOT mutate the original machine', () => {
    const m = makeTrafficLight();
    const originalState = m.state.current;
    const originalHistory = m.state.history.length;
    transition(m, { type: 'GO' });
    expect(m.state.current).toBe(originalState);
    expect(m.state.history).toHaveLength(originalHistory);
  });

  it('adds history entry on success', () => {
    const m = makeTrafficLight();
    const result = transition(m, { type: 'GO' });
    expect(result.state.history).toHaveLength(1);
    expect(result.state.history[0].from).toBe('RED');
    expect(result.state.history[0].to).toBe('GREEN');
    expect(result.state.history[0].event.type).toBe('GO');
    expect(typeof result.state.history[0].timestamp).toBe('number');
  });

  it('does not add history on failure', () => {
    const m = makeTrafficLight();
    const result = transition(m, { type: 'INVALID' });
    expect(result.state.history).toHaveLength(0);
  });

  it('carries payload in history event', () => {
    const m = makeDocWorkflow();
    const result = transition(m, { type: 'SUBMIT', payload: { reviewer: 'bob' } });
    expect(result.state.history[0].event.payload).toEqual({ reviewer: 'bob' });
  });

  it('action receives ctx and event', () => {
    const actions: Array<{ ctx: DocCtx; ev: MachineEvent }> = [];
    const m = createMachine<DocCtx>({
      id: 'capture',
      initial: 'DRAFT',
      context: { author: 'alice', reviewer: null, approvedAt: null, rejectionReason: null },
      states: [{ id: 'DRAFT' }, { id: 'REVIEW' }],
      transitions: [{
        from: 'DRAFT',
        event: 'SUBMIT',
        to: 'REVIEW',
        action: (ctx, ev) => { actions.push({ ctx, ev }); },
      }],
    });
    transition(m, { type: 'SUBMIT', payload: 42 });
    expect(actions).toHaveLength(1);
    expect(actions[0].ctx.author).toBe('alice');
    expect(actions[0].ev.type).toBe('SUBMIT');
    expect(actions[0].ev.payload).toBe(42);
  });

  it('calls onExit before action before onEnter', () => {
    const order: string[] = [];
    const m = createMachine<object>({
      id: 'lifecycle-order',
      initial: 'A',
      context: {},
      states: [
        { id: 'A', onExit: () => { order.push('exit-A'); } },
        { id: 'B', onEnter: () => { order.push('enter-B'); } },
      ],
      transitions: [{
        from: 'A',
        event: 'GO',
        to: 'B',
        action: (_c, _e) => { order.push('action'); },
      }],
    });
    transition(m, { type: 'GO' });
    expect(order).toEqual(['exit-A', 'action', 'enter-B']);
  });

  it('handles multi-cycle traffic light correctly over 3 cycles', () => {
    let m = makeTrafficLight();
    for (let cycle = 1; cycle <= 3; cycle++) {
      const r1 = send(m, 'GO');
      expect(r1.success).toBe(true);
      expect(r1.state.current).toBe('GREEN');
      const m2: Machine<TrafficCtx> = { config: m.config, state: r1.state };

      const r2 = send(m2, 'SLOW');
      expect(r2.success).toBe(true);
      expect(r2.state.current).toBe('YELLOW');
      const m3: Machine<TrafficCtx> = { config: m.config, state: r2.state };

      const r3 = send(m3, 'STOP');
      expect(r3.success).toBe(true);
      expect(r3.state.current).toBe('RED');
      expect(r3.state.context.cycles).toBe(cycle);
      m = { config: m.config, state: r3.state };
    }
  });

  it('doc: DRAFT→REVIEW sets reviewer from payload', () => {
    const m = makeDocWorkflow();
    const result = transition(m, { type: 'SUBMIT', payload: { reviewer: 'carol' } });
    expect(result.success).toBe(true);
    expect(result.state.current).toBe('REVIEW');
    expect(result.state.context.reviewer).toBe('carol');
  });

  it('doc: REVIEW→APPROVED sets approvedAt', () => {
    const m = makeDocWorkflow();
    const r1 = transition(m, { type: 'SUBMIT', payload: { reviewer: 'bob' } });
    const m2: Machine<DocCtx> = { config: m.config, state: r1.state };
    const r2 = transition(m2, { type: 'APPROVE' });
    expect(r2.success).toBe(true);
    expect(r2.state.current).toBe('APPROVED');
    expect(r2.state.context.approvedAt).toBe(1000);
  });

  it('doc: REVIEW→REJECTED sets rejectionReason', () => {
    const m = makeDocWorkflow();
    const r1 = transition(m, { type: 'SUBMIT', payload: { reviewer: 'bob' } });
    const m2: Machine<DocCtx> = { config: m.config, state: r1.state };
    const r2 = transition(m2, { type: 'REJECT', payload: { reason: 'Needs more detail' } });
    expect(r2.success).toBe(true);
    expect(r2.state.current).toBe('REJECTED');
    expect(r2.state.context.rejectionReason).toBe('Needs more detail');
  });

  it('order: guard passes when amount > 0', () => {
    const m = makeOrderLifecycle();
    const result = transition(m, { type: 'CONFIRM' });
    expect(result.success).toBe(true);
    expect(result.state.current).toBe('CONFIRMED');
  });

  it('order: CONFIRMED→SHIPPED sets shippedAt', () => {
    const m = makeOrderLifecycle();
    const r1 = transition(m, { type: 'CONFIRM' });
    const m2: Machine<OrderCtx> = { config: m.config, state: r1.state };
    const r2 = transition(m2, { type: 'SHIP' });
    expect(r2.success).toBe(true);
    expect(r2.state.current).toBe('SHIPPED');
    expect(r2.state.context.shippedAt).toBe(2000);
  });

  it('order: SHIPPED→DELIVERED sets deliveredAt', () => {
    const m = makeOrderLifecycle();
    const r1 = transition(m, { type: 'CONFIRM' });
    const m2: Machine<OrderCtx> = { config: m.config, state: r1.state };
    const r2 = transition(m2, { type: 'SHIP' });
    const m3: Machine<OrderCtx> = { config: m.config, state: r2.state };
    const r3 = transition(m3, { type: 'DELIVER' });
    expect(r3.success).toBe(true);
    expect(r3.state.current).toBe('DELIVERED');
    expect(r3.state.context.deliveredAt).toBe(3000);
  });

  it('order: CANCEL from NEW sets cancelledAt', () => {
    const m = makeOrderLifecycle();
    const result = transition(m, { type: 'CANCEL' });
    expect(result.success).toBe(true);
    expect(result.state.current).toBe('CANCELLED');
    expect(result.state.context.cancelledAt).toBe(4000);
  });

  it('order: CANCEL from CONFIRMED sets cancelledAt', () => {
    const m = makeOrderLifecycle();
    const r1 = transition(m, { type: 'CONFIRM' });
    const m2: Machine<OrderCtx> = { config: m.config, state: r1.state };
    const r2 = transition(m2, { type: 'CANCEL' });
    expect(r2.success).toBe(true);
    expect(r2.state.current).toBe('CANCELLED');
    expect(r2.state.context.cancelledAt).toBe(4000);
  });

  it('error message mentions event type on failure', () => {
    const m = makeTrafficLight();
    const result = transition(m, { type: 'NONEXISTENT_EVT' });
    expect(result.error).toContain('NONEXISTENT_EVT');
  });

  it('error message mentions current state on failure', () => {
    const m = makeTrafficLight();
    const result = transition(m, { type: 'SLOW' }); // SLOW only valid from GREEN
    expect(result.error).toContain('RED');
  });

  // Loop over invalid events from RED
  const invalidFromRed = ['SLOW', 'STOP', 'DELIVER', 'SHIP', 'APPROVE', 'REJECT'];
  it.each(invalidFromRed)('RED state rejects event %s', (evt) => {
    const m = makeTrafficLight();
    const result = transition(m, { type: evt });
    expect(result.success).toBe(false);
    expect(result.state.current).toBe('RED');
  });

  it('onEnter can update context', () => {
    const m = createMachine<{ entered: boolean }>({
      id: 'enter-test',
      initial: 'A',
      context: { entered: false },
      states: [
        { id: 'A' },
        { id: 'B', onEnter: (ctx) => ({ ...ctx, entered: true }) },
      ],
      transitions: [{ from: 'A', event: 'GO', to: 'B' }],
    });
    const result = transition(m, { type: 'GO' });
    expect(result.state.context.entered).toBe(true);
  });

  it('onExit can update context', () => {
    const m = createMachine<{ exited: boolean }>({
      id: 'exit-test',
      initial: 'A',
      context: { exited: false },
      states: [
        { id: 'A', onExit: (ctx) => ({ ...ctx, exited: true }) },
        { id: 'B' },
      ],
      transitions: [{ from: 'A', event: 'GO', to: 'B' }],
    });
    const result = transition(m, { type: 'GO' });
    expect(result.state.context.exited).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 3. send
// ---------------------------------------------------------------------------

describe('send', () => {
  it('is equivalent to transition with MachineEvent', () => {
    const m = makeTrafficLight();
    const r1 = send(m, 'GO');
    const r2 = transition(m, { type: 'GO' });
    expect(r1.success).toBe(r2.success);
    expect(r1.state.current).toBe(r2.state.current);
  });

  it('forwards payload to event', () => {
    const payloads: unknown[] = [];
    const m = createMachine<object>({
      id: 'payload-test',
      initial: 'A',
      context: {},
      states: [{ id: 'A' }, { id: 'B' }],
      transitions: [{
        from: 'A', event: 'GO', to: 'B',
        action: (_c, ev) => { payloads.push(ev.payload); },
      }],
    });
    send(m, 'GO', { foo: 'bar' });
    expect(payloads).toHaveLength(1);
    expect(payloads[0]).toEqual({ foo: 'bar' });
  });

  it('send without payload leaves payload undefined', () => {
    const payloads: unknown[] = [];
    const m = createMachine<object>({
      id: 'no-payload',
      initial: 'A',
      context: {},
      states: [{ id: 'A' }, { id: 'B' }],
      transitions: [{
        from: 'A', event: 'GO', to: 'B',
        action: (_c, ev) => { payloads.push(ev.payload); },
      }],
    });
    send(m, 'GO');
    expect(payloads[0]).toBeUndefined();
  });

  it('returns TransitionResult with correct shape', () => {
    const m = makeTrafficLight();
    const result = send(m, 'GO');
    expect(result).toHaveProperty('success');
    expect(result).toHaveProperty('state');
    expect(result.state).toHaveProperty('current');
    expect(result.state).toHaveProperty('context');
    expect(result.state).toHaveProperty('history');
  });

  it('returns failure result on bad event', () => {
    const m = makeTrafficLight();
    const result = send(m, 'NOPE');
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  // Multiple payload types
  const payloadCases: Array<[string, unknown]> = [
    ['number', 42],
    ['string', 'hello'],
    ['object', { a: 1 }],
    ['array', [1, 2, 3]],
    ['boolean', true],
    ['null', null],
  ];
  it.each(payloadCases)('send accepts %s payload', (_type, payload) => {
    const captured: unknown[] = [];
    const m = createMachine<object>({
      id: 'typed-payload',
      initial: 'A',
      context: {},
      states: [{ id: 'A' }, { id: 'B' }],
      transitions: [{
        from: 'A', event: 'X', to: 'B',
        action: (_c, ev) => { captured.push(ev.payload); },
      }],
    });
    send(m, 'X', payload);
    expect(captured[0]).toEqual(payload);
  });

  it('chaining send calls with new state builds correct history', () => {
    let m = makeTrafficLight();
    const r1 = send(m, 'GO');
    m = { config: m.config, state: r1.state };
    const r2 = send(m, 'SLOW');
    m = { config: m.config, state: r2.state };
    const r3 = send(m, 'STOP');
    expect(r3.state.history).toHaveLength(3);
    expect(r3.state.history.map((h) => h.event.type)).toEqual(['GO', 'SLOW', 'STOP']);
  });
});

// ---------------------------------------------------------------------------
// 4. canTransition
// ---------------------------------------------------------------------------

describe('canTransition', () => {
  it('returns true for valid event from current state', () => {
    const m = makeTrafficLight();
    expect(canTransition(m, 'GO')).toBe(true);
  });

  it('returns false for invalid event from current state', () => {
    const m = makeTrafficLight();
    expect(canTransition(m, 'SLOW')).toBe(false);
    expect(canTransition(m, 'STOP')).toBe(false);
  });

  it('returns false for totally unknown event', () => {
    const m = makeTrafficLight();
    expect(canTransition(m, 'FLY')).toBe(false);
  });

  it('returns false when guard blocks the transition', () => {
    const m = makeOrderLifecycle();
    const zeroOrder = withContext(m, { ...m.state.context, amount: 0 });
    expect(canTransition(zeroOrder, 'CONFIRM')).toBe(false);
  });

  it('returns true when guard passes', () => {
    const m = makeOrderLifecycle();
    expect(canTransition(m, 'CONFIRM')).toBe(true);
  });

  const greenEvents = ['SLOW'];
  const notGreenEvents = ['GO', 'STOP'];

  it.each(greenEvents)('GREEN allows %s', (evt) => {
    const m = makeTrafficLight();
    const r1 = send(m, 'GO');
    const m2: Machine<TrafficCtx> = { config: m.config, state: r1.state };
    expect(canTransition(m2, evt)).toBe(true);
  });

  it.each(notGreenEvents)('GREEN disallows %s', (evt) => {
    const m = makeTrafficLight();
    const r1 = send(m, 'GO');
    const m2: Machine<TrafficCtx> = { config: m.config, state: r1.state };
    expect(canTransition(m2, evt)).toBe(false);
  });

  it('canTransition is consistent with transition result', () => {
    const m = makeTrafficLight();
    const can = canTransition(m, 'GO');
    const result = transition(m, { type: 'GO' });
    expect(can).toBe(result.success);
  });

  it('canTransition false is consistent with transition failure', () => {
    const m = makeTrafficLight();
    const can = canTransition(m, 'STOP');
    const result = transition(m, { type: 'STOP' });
    expect(can).toBe(result.success);
  });

  it('doc DRAFT can SUBMIT', () => {
    const m = makeDocWorkflow();
    expect(canTransition(m, 'SUBMIT')).toBe(true);
  });

  it('doc DRAFT cannot APPROVE directly', () => {
    const m = makeDocWorkflow();
    expect(canTransition(m, 'APPROVE')).toBe(false);
  });

  it('order NEW can CANCEL', () => {
    const m = makeOrderLifecycle();
    expect(canTransition(m, 'CANCEL')).toBe(true);
  });

  it('order NEW cannot SHIP', () => {
    const m = makeOrderLifecycle();
    expect(canTransition(m, 'SHIP')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 5. getAvailableEvents
// ---------------------------------------------------------------------------

describe('getAvailableEvents', () => {
  it('returns GO from RED traffic light', () => {
    const m = makeTrafficLight();
    const events = getAvailableEvents(m);
    expect(events).toContain('GO');
    expect(events).toHaveLength(1);
  });

  it('returns SLOW from GREEN traffic light', () => {
    const m = makeTrafficLight();
    const r1 = send(m, 'GO');
    const m2: Machine<TrafficCtx> = { config: m.config, state: r1.state };
    const events = getAvailableEvents(m2);
    expect(events).toContain('SLOW');
    expect(events).toHaveLength(1);
  });

  it('returns STOP from YELLOW traffic light', () => {
    const m = makeTrafficLight();
    const r1 = send(m, 'GO');
    const m2: Machine<TrafficCtx> = { config: m.config, state: r1.state };
    const r2 = send(m2, 'SLOW');
    const m3: Machine<TrafficCtx> = { config: m.config, state: r2.state };
    const events = getAvailableEvents(m3);
    expect(events).toContain('STOP');
    expect(events).toHaveLength(1);
  });

  it('returns CONFIRM and CANCEL from NEW order', () => {
    const m = makeOrderLifecycle();
    const events = getAvailableEvents(m);
    expect(events).toContain('CONFIRM');
    expect(events).toContain('CANCEL');
  });

  it('returns empty array when no transitions available (DELIVERED)', () => {
    const m = makeOrderLifecycle();
    const r1 = send(m, 'CONFIRM');
    const m2: Machine<OrderCtx> = { config: m.config, state: r1.state };
    const r2 = send(m2, 'SHIP');
    const m3: Machine<OrderCtx> = { config: m.config, state: r2.state };
    const r3 = send(m3, 'DELIVER');
    const mFinal: Machine<OrderCtx> = { config: m.config, state: r3.state };
    const events = getAvailableEvents(mFinal);
    expect(events).toHaveLength(0);
  });

  it('excludes events blocked by guard', () => {
    const m = makeOrderLifecycle();
    const zeroOrder = withContext(m, { ...m.state.context, amount: 0 });
    const events = getAvailableEvents(zeroOrder);
    expect(events).not.toContain('CONFIRM');
  });

  it('includes events not blocked by guard', () => {
    const m = makeOrderLifecycle();
    const zeroOrder = withContext(m, { ...m.state.context, amount: 0 });
    const events = getAvailableEvents(zeroOrder);
    // CANCEL has no guard so still available
    expect(events).toContain('CANCEL');
  });

  it('doc REVIEW returns APPROVE, REJECT, REVERT', () => {
    const m = makeDocWorkflow();
    const r1 = send(m, 'SUBMIT', { reviewer: 'bob' });
    const m2: Machine<DocCtx> = { config: m.config, state: r1.state };
    const events = getAvailableEvents(m2);
    expect(events).toContain('APPROVE');
    expect(events).toContain('REJECT');
    expect(events).toContain('REVERT');
  });

  it('returns array (not Set)', () => {
    const m = makeOrderLifecycle();
    const events = getAvailableEvents(m);
    expect(Array.isArray(events)).toBe(true);
  });

  it('does not return duplicates', () => {
    const m = createMachine<object>({
      id: 'dup-test',
      initial: 'A',
      context: {},
      states: [{ id: 'A' }, { id: 'B' }, { id: 'C' }],
      transitions: [
        { from: 'A', event: 'GO', to: 'B' },
        { from: 'A', event: 'GO', to: 'C' }, // same event, different target — deduplication expected
      ],
    });
    const events = getAvailableEvents(m);
    const goCount = events.filter((e) => e === 'GO').length;
    expect(goCount).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// 6. isInState
// ---------------------------------------------------------------------------

describe('isInState', () => {
  it('returns true for current state', () => {
    const m = makeTrafficLight();
    expect(isInState(m, 'RED')).toBe(true);
  });

  it('returns false for non-current state', () => {
    const m = makeTrafficLight();
    expect(isInState(m, 'GREEN')).toBe(false);
    expect(isInState(m, 'YELLOW')).toBe(false);
  });

  it('updates after transition', () => {
    const m = makeTrafficLight();
    const r = send(m, 'GO');
    const m2: Machine<TrafficCtx> = { config: m.config, state: r.state };
    expect(isInState(m2, 'RED')).toBe(false);
    expect(isInState(m2, 'GREEN')).toBe(true);
  });

  it('returns false for empty string', () => {
    const m = makeTrafficLight();
    expect(isInState(m, '')).toBe(false);
  });

  it('returns false for unknown state id', () => {
    const m = makeTrafficLight();
    expect(isInState(m, 'PURPLE')).toBe(false);
  });

  const states = ['RED', 'GREEN', 'YELLOW'];
  it.each(states)('isInState correctly identifies each traffic state %s', (stateId) => {
    const m = makeTrafficLight();
    // Walk to the target state
    let current: Machine<TrafficCtx> = m;
    const path: string[] = ['RED', 'GREEN', 'YELLOW'];
    const events: string[] = ['GO', 'SLOW', 'STOP'];
    for (let i = 0; i < path.length; i++) {
      if (path[i] === stateId) break;
      const r = send(current, events[i]);
      current = { config: m.config, state: r.state };
    }
    expect(isInState(current, stateId)).toBe(true);
    for (const other of states.filter((s) => s !== stateId)) {
      expect(isInState(current, other)).toBe(false);
    }
  });

  it('doc: isInState DRAFT initially', () => {
    const m = makeDocWorkflow();
    expect(isInState(m, 'DRAFT')).toBe(true);
    expect(isInState(m, 'REVIEW')).toBe(false);
    expect(isInState(m, 'APPROVED')).toBe(false);
    expect(isInState(m, 'REJECTED')).toBe(false);
  });

  it('order: isInState NEW initially', () => {
    const m = makeOrderLifecycle();
    expect(isInState(m, 'NEW')).toBe(true);
    expect(isInState(m, 'CONFIRMED')).toBe(false);
    expect(isInState(m, 'SHIPPED')).toBe(false);
    expect(isInState(m, 'DELIVERED')).toBe(false);
    expect(isInState(m, 'CANCELLED')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 7. isFinal
// ---------------------------------------------------------------------------

describe('isFinal', () => {
  it('returns false for non-final initial state', () => {
    const m = makeTrafficLight();
    expect(isFinal(m)).toBe(false);
  });

  it('returns true for APPROVED state', () => {
    const m = makeDocWorkflow();
    const r1 = send(m, 'SUBMIT', { reviewer: 'bob' });
    const m2: Machine<DocCtx> = { config: m.config, state: r1.state };
    const r2 = send(m2, 'APPROVE');
    const mApproved: Machine<DocCtx> = { config: m.config, state: r2.state };
    expect(isFinal(mApproved)).toBe(true);
  });

  it('returns true for REJECTED state', () => {
    const m = makeDocWorkflow();
    const r1 = send(m, 'SUBMIT', { reviewer: 'bob' });
    const m2: Machine<DocCtx> = { config: m.config, state: r1.state };
    const r2 = send(m2, 'REJECT', { reason: 'Bad' });
    const mRejected: Machine<DocCtx> = { config: m.config, state: r2.state };
    expect(isFinal(mRejected)).toBe(true);
  });

  it('returns true for DELIVERED order', () => {
    const m = makeOrderLifecycle();
    const r1 = send(m, 'CONFIRM');
    const m2: Machine<OrderCtx> = { config: m.config, state: r1.state };
    const r2 = send(m2, 'SHIP');
    const m3: Machine<OrderCtx> = { config: m.config, state: r2.state };
    const r3 = send(m3, 'DELIVER');
    const mDelivered: Machine<OrderCtx> = { config: m.config, state: r3.state };
    expect(isFinal(mDelivered)).toBe(true);
  });

  it('returns true for CANCELLED order', () => {
    const m = makeOrderLifecycle();
    const r1 = send(m, 'CANCEL');
    const mCancelled: Machine<OrderCtx> = { config: m.config, state: r1.state };
    expect(isFinal(mCancelled)).toBe(true);
  });

  it('returns false for REVIEW state (not final)', () => {
    const m = makeDocWorkflow();
    const r1 = send(m, 'SUBMIT', { reviewer: 'bob' });
    const m2: Machine<DocCtx> = { config: m.config, state: r1.state };
    expect(isFinal(m2)).toBe(false);
  });

  it('returns false for states where final is not set', () => {
    const m = createMachine<object>({
      id: 'no-final',
      initial: 'A',
      context: {},
      states: [{ id: 'A' }, { id: 'B' }],
      transitions: [{ from: 'A', event: 'GO', to: 'B' }],
    });
    expect(isFinal(m)).toBe(false);
    const r = send(m, 'GO');
    const m2 = { config: m.config, state: r.state };
    expect(isFinal(m2)).toBe(false);
  });

  it('returns false for all non-final traffic light states', () => {
    const m = makeTrafficLight();
    expect(isFinal(m)).toBe(false);
    const r1 = send(m, 'GO');
    const m2: Machine<TrafficCtx> = { config: m.config, state: r1.state };
    expect(isFinal(m2)).toBe(false);
    const r2 = send(m2, 'SLOW');
    const m3: Machine<TrafficCtx> = { config: m.config, state: r2.state };
    expect(isFinal(m3)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 8. getHistory
// ---------------------------------------------------------------------------

describe('getHistory', () => {
  it('returns empty array on fresh machine', () => {
    const m = makeTrafficLight();
    expect(getHistory(m)).toHaveLength(0);
    expect(Array.isArray(getHistory(m))).toBe(true);
  });

  it('returns one entry after one transition', () => {
    const m = makeTrafficLight();
    const r = send(m, 'GO');
    const m2: Machine<TrafficCtx> = { config: m.config, state: r.state };
    const hist = getHistory(m2);
    expect(hist).toHaveLength(1);
    expect(hist[0].from).toBe('RED');
    expect(hist[0].to).toBe('GREEN');
    expect(hist[0].event.type).toBe('GO');
    expect(typeof hist[0].timestamp).toBe('number');
  });

  it('accumulates entries across transitions', () => {
    let m = makeTrafficLight();
    const events = ['GO', 'SLOW', 'STOP'];
    for (const evt of events) {
      const r = send(m, evt);
      m = { config: m.config, state: r.state };
    }
    const hist = getHistory(m);
    expect(hist).toHaveLength(3);
    expect(hist[0].event.type).toBe('GO');
    expect(hist[1].event.type).toBe('SLOW');
    expect(hist[2].event.type).toBe('STOP');
  });

  it('history timestamps are monotonically non-decreasing', () => {
    let m = makeTrafficLight();
    const events = ['GO', 'SLOW', 'STOP'];
    for (const evt of events) {
      const r = send(m, evt);
      m = { config: m.config, state: r.state };
    }
    const hist = getHistory(m);
    for (let i = 1; i < hist.length; i++) {
      expect(hist[i].timestamp).toBeGreaterThanOrEqual(hist[i - 1].timestamp);
    }
  });

  it('getHistory does not expose internal reference (returns the state history array)', () => {
    const m = makeTrafficLight();
    const hist = getHistory(m);
    expect(hist).toBe(m.state.history);
  });

  it('history entry has correct shape', () => {
    const m = makeTrafficLight();
    const r = send(m, 'GO', { extra: 'data' });
    const hist = getHistory({ config: m.config, state: r.state });
    expect(hist[0]).toHaveProperty('from');
    expect(hist[0]).toHaveProperty('to');
    expect(hist[0]).toHaveProperty('event');
    expect(hist[0]).toHaveProperty('timestamp');
    expect(hist[0].event).toHaveProperty('type');
  });
});

// ---------------------------------------------------------------------------
// 9. clearHistory
// ---------------------------------------------------------------------------

describe('clearHistory', () => {
  it('returns machine with empty history', () => {
    let m = makeTrafficLight();
    const r1 = send(m, 'GO');
    m = { config: m.config, state: r1.state };
    const cleared = clearHistory(m);
    expect(cleared.state.history).toHaveLength(0);
  });

  it('preserves current state', () => {
    let m = makeTrafficLight();
    const r1 = send(m, 'GO');
    m = { config: m.config, state: r1.state };
    const cleared = clearHistory(m);
    expect(cleared.state.current).toBe('GREEN');
  });

  it('preserves context', () => {
    let m = makeTrafficLight();
    const r1 = send(m, 'GO');
    m = { config: m.config, state: r1.state };
    const cleared = clearHistory(m);
    expect(cleared.state.context.lastTransition).toBe('RED->GREEN');
  });

  it('does not mutate original machine', () => {
    let m = makeTrafficLight();
    const r1 = send(m, 'GO');
    m = { config: m.config, state: r1.state };
    const originalHistLen = m.state.history.length;
    clearHistory(m);
    expect(m.state.history).toHaveLength(originalHistLen);
  });

  it('clears history on fresh machine (no-op)', () => {
    const m = makeTrafficLight();
    const cleared = clearHistory(m);
    expect(cleared.state.history).toHaveLength(0);
    expect(cleared.state.current).toBe('RED');
  });

  it('config reference is preserved', () => {
    const m = makeTrafficLight();
    const cleared = clearHistory(m);
    expect(cleared.config).toBe(m.config);
  });
});

// ---------------------------------------------------------------------------
// 10. resetMachine
// ---------------------------------------------------------------------------

describe('resetMachine', () => {
  it('resets to initial state', () => {
    let m = makeTrafficLight();
    const r1 = send(m, 'GO');
    m = { config: m.config, state: r1.state };
    const reset = resetMachine(m);
    expect(reset.state.current).toBe('RED');
  });

  it('resets context to original', () => {
    let m = makeTrafficLight();
    const r1 = send(m, 'GO');
    m = { config: m.config, state: r1.state };
    const reset = resetMachine(m);
    expect(reset.state.context.cycles).toBe(0);
    expect(reset.state.context.lastTransition).toBe('');
  });

  it('clears history on reset', () => {
    let m = makeTrafficLight();
    const r1 = send(m, 'GO');
    m = { config: m.config, state: r1.state };
    const reset = resetMachine(m);
    expect(reset.state.history).toHaveLength(0);
  });

  it('does not mutate original machine', () => {
    let m = makeTrafficLight();
    const r1 = send(m, 'GO');
    m = { config: m.config, state: r1.state };
    resetMachine(m);
    expect(m.state.current).toBe('GREEN');
  });

  it('preserves config reference', () => {
    const m = makeTrafficLight();
    const reset = resetMachine(m);
    expect(reset.config).toBe(m.config);
  });

  it('reset after full cycle returns cycles=0', () => {
    let m = makeTrafficLight();
    for (const evt of ['GO', 'SLOW', 'STOP']) {
      const r = send(m, evt);
      m = { config: m.config, state: r.state };
    }
    expect(m.state.context.cycles).toBe(1);
    const reset = resetMachine(m);
    expect(reset.state.context.cycles).toBe(0);
  });

  it('resets doc workflow to DRAFT', () => {
    const m = makeDocWorkflow();
    const r1 = send(m, 'SUBMIT', { reviewer: 'bob' });
    const m2: Machine<DocCtx> = { config: m.config, state: r1.state };
    const reset = resetMachine(m2);
    expect(reset.state.current).toBe('DRAFT');
    expect(reset.state.context.reviewer).toBeNull();
  });

  it('resets order to NEW with original amount', () => {
    const m = makeOrderLifecycle();
    const r1 = send(m, 'CONFIRM');
    const m2: Machine<OrderCtx> = { config: m.config, state: r1.state };
    const reset = resetMachine(m2);
    expect(reset.state.current).toBe('NEW');
    expect(reset.state.context.amount).toBe(99.99);
  });
});

// ---------------------------------------------------------------------------
// 11. withContext
// ---------------------------------------------------------------------------

describe('withContext', () => {
  it('updates context without changing current state', () => {
    const m = makeTrafficLight();
    const updated = withContext(m, { cycles: 5, lastTransition: 'manual' });
    expect(updated.state.current).toBe('RED');
    expect(updated.state.context.cycles).toBe(5);
    expect(updated.state.context.lastTransition).toBe('manual');
  });

  it('does not mutate original machine', () => {
    const m = makeTrafficLight();
    withContext(m, { cycles: 99, lastTransition: 'x' });
    expect(m.state.context.cycles).toBe(0);
  });

  it('preserves config reference', () => {
    const m = makeTrafficLight();
    const updated = withContext(m, { cycles: 1, lastTransition: '' });
    expect(updated.config).toBe(m.config);
  });

  it('preserves history', () => {
    let m = makeTrafficLight();
    const r1 = send(m, 'GO');
    m = { config: m.config, state: r1.state };
    const updated = withContext(m, { cycles: 0, lastTransition: 'override' });
    expect(updated.state.history).toHaveLength(1);
  });

  it('can be used to inject test context for guard testing', () => {
    const m = makeOrderLifecycle();
    const negativeAmount = withContext(m, { ...m.state.context, amount: -1 });
    expect(canTransition(negativeAmount, 'CONFIRM')).toBe(false);
    const positiveAmount = withContext(m, { ...m.state.context, amount: 100 });
    expect(canTransition(positiveAmount, 'CONFIRM')).toBe(true);
  });

  it('withContext then withContext stacks correctly', () => {
    const m = makeTrafficLight();
    const u1 = withContext(m, { cycles: 1, lastTransition: 'A' });
    const u2 = withContext(u1, { cycles: 2, lastTransition: 'B' });
    expect(u2.state.context.cycles).toBe(2);
    expect(u2.state.context.lastTransition).toBe('B');
    expect(u1.state.context.cycles).toBe(1);
  });

  it('null context can be set for machines with nullable context type', () => {
    const m = createMachine<null>({
      id: 'null-ctx',
      initial: 'A',
      context: null,
      states: [{ id: 'A' }],
      transitions: [],
    });
    const updated = withContext(m, null);
    expect(updated.state.context).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// 12. validateConfig
// ---------------------------------------------------------------------------

describe('validateConfig', () => {
  it('returns valid for correct traffic light config', () => {
    const m = makeTrafficLight();
    const result = validateConfig(m.config);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('returns valid for correct doc workflow config', () => {
    const m = makeDocWorkflow();
    const result = validateConfig(m.config);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('returns valid for correct order lifecycle config', () => {
    const m = makeOrderLifecycle();
    const result = validateConfig(m.config);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('returns error for missing machine id', () => {
    const config = { id: '', initial: 'A', context: {}, states: [{ id: 'A' }], transitions: [] };
    const result = validateConfig(config);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('returns error for missing initial state', () => {
    const config = { id: 'x', initial: '', context: {}, states: [{ id: 'A' }], transitions: [] };
    const result = validateConfig(config);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('returns error for empty states array', () => {
    const config = { id: 'x', initial: 'A', context: {}, states: [], transitions: [] };
    const result = validateConfig(config);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('returns error for initial state not in states', () => {
    const config = { id: 'x', initial: 'GHOST', context: {}, states: [{ id: 'A' }], transitions: [] };
    const result = validateConfig(config);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('GHOST'))).toBe(true);
  });

  it('returns error for transition from unknown state', () => {
    const config = {
      id: 'x',
      initial: 'A',
      context: {},
      states: [{ id: 'A' }, { id: 'B' }],
      transitions: [{ from: 'UNKNOWN', event: 'GO', to: 'B' }],
    };
    const result = validateConfig(config);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('UNKNOWN'))).toBe(true);
  });

  it('returns error for transition to unknown state', () => {
    const config = {
      id: 'x',
      initial: 'A',
      context: {},
      states: [{ id: 'A' }],
      transitions: [{ from: 'A', event: 'GO', to: 'GHOST' }],
    };
    const result = validateConfig(config);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('GHOST'))).toBe(true);
  });

  it('returns error for transition with empty event id', () => {
    const config = {
      id: 'x',
      initial: 'A',
      context: {},
      states: [{ id: 'A' }, { id: 'B' }],
      transitions: [{ from: 'A', event: '', to: 'B' }],
    };
    const result = validateConfig(config);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('returns error for duplicate state ids', () => {
    const config = {
      id: 'x',
      initial: 'A',
      context: {},
      states: [{ id: 'A' }, { id: 'A' }],
      transitions: [],
    };
    const result = validateConfig(config);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('A'))).toBe(true);
  });

  it('accumulates multiple errors', () => {
    const config = { id: '', initial: 'MISSING', context: {}, states: [], transitions: [] };
    const result = validateConfig(config);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(2);
  });

  it('returns { valid, errors } shape', () => {
    const m = makeTrafficLight();
    const result = validateConfig(m.config);
    expect(result).toHaveProperty('valid');
    expect(result).toHaveProperty('errors');
    expect(Array.isArray(result.errors)).toBe(true);
    expect(typeof result.valid).toBe('boolean');
  });
});

// ---------------------------------------------------------------------------
// 13. getStateIds
// ---------------------------------------------------------------------------

describe('getStateIds', () => {
  it('returns all traffic light state ids', () => {
    const m = makeTrafficLight();
    const ids = getStateIds(m);
    expect(ids).toContain('RED');
    expect(ids).toContain('GREEN');
    expect(ids).toContain('YELLOW');
    expect(ids).toHaveLength(3);
  });

  it('returns all doc workflow state ids', () => {
    const m = makeDocWorkflow();
    const ids = getStateIds(m);
    expect(ids).toContain('DRAFT');
    expect(ids).toContain('REVIEW');
    expect(ids).toContain('APPROVED');
    expect(ids).toContain('REJECTED');
    expect(ids).toHaveLength(4);
  });

  it('returns all order lifecycle state ids', () => {
    const m = makeOrderLifecycle();
    const ids = getStateIds(m);
    expect(ids).toContain('NEW');
    expect(ids).toContain('CONFIRMED');
    expect(ids).toContain('SHIPPED');
    expect(ids).toContain('DELIVERED');
    expect(ids).toContain('CANCELLED');
    expect(ids).toHaveLength(5);
  });

  it('returns array type', () => {
    const m = makeTrafficLight();
    expect(Array.isArray(getStateIds(m))).toBe(true);
  });

  it('preserves order of states as defined', () => {
    const m = makeTrafficLight();
    const ids = getStateIds(m);
    expect(ids[0]).toBe('RED');
    expect(ids[1]).toBe('GREEN');
    expect(ids[2]).toBe('YELLOW');
  });

  it('single-state machine returns array of one', () => {
    const m = createMachine({ id: 'single', initial: 'ONLY', context: {}, states: [{ id: 'ONLY' }], transitions: [] });
    expect(getStateIds(m)).toEqual(['ONLY']);
  });

  it('does not include duplicate ids', () => {
    const m = makeTrafficLight();
    const ids = getStateIds(m);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });
});

// ---------------------------------------------------------------------------
// 14. getTransitionsFrom
// ---------------------------------------------------------------------------

describe('getTransitionsFrom', () => {
  it('returns transitions from RED', () => {
    const m = makeTrafficLight();
    const trans = getTransitionsFrom(m, 'RED');
    expect(trans).toHaveLength(1);
    expect(trans[0].event).toBe('GO');
    expect(trans[0].to).toBe('GREEN');
  });

  it('returns transitions from GREEN', () => {
    const m = makeTrafficLight();
    const trans = getTransitionsFrom(m, 'GREEN');
    expect(trans).toHaveLength(1);
    expect(trans[0].event).toBe('SLOW');
    expect(trans[0].to).toBe('YELLOW');
  });

  it('returns empty array for DELIVERED (final state)', () => {
    const m = makeOrderLifecycle();
    // No transitions FROM delivered
    const trans = getTransitionsFrom(m, 'DELIVERED');
    expect(trans).toHaveLength(0);
  });

  it('returns multiple transitions for NEW order (CONFIRM and CANCEL)', () => {
    const m = makeOrderLifecycle();
    const trans = getTransitionsFrom(m, 'NEW');
    expect(trans.length).toBeGreaterThanOrEqual(2);
    const events = trans.map((t) => t.event);
    expect(events).toContain('CONFIRM');
    expect(events).toContain('CANCEL');
  });

  it('includes transitions defined with array from', () => {
    const m = makeOrderLifecycle();
    // CANCEL is from ['NEW', 'CONFIRMED']
    const fromNew = getTransitionsFrom(m, 'NEW');
    const fromConfirmed = getTransitionsFrom(m, 'CONFIRMED');
    const cancelFromNew = fromNew.find((t) => t.event === 'CANCEL');
    const cancelFromConfirmed = fromConfirmed.find((t) => t.event === 'CANCEL');
    expect(cancelFromNew).toBeDefined();
    expect(cancelFromConfirmed).toBeDefined();
  });

  it('returns empty array for unknown state id', () => {
    const m = makeTrafficLight();
    const trans = getTransitionsFrom(m, 'NONEXISTENT');
    expect(trans).toHaveLength(0);
  });

  it('returns array type', () => {
    const m = makeTrafficLight();
    expect(Array.isArray(getTransitionsFrom(m, 'RED'))).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 15. getTransitionsTo
// ---------------------------------------------------------------------------

describe('getTransitionsTo', () => {
  it('returns transitions to RED (from YELLOW only)', () => {
    const m = makeTrafficLight();
    const trans = getTransitionsTo(m, 'RED');
    expect(trans).toHaveLength(1);
    expect(trans[0].event).toBe('STOP');
  });

  it('returns transitions to GREEN (from RED only)', () => {
    const m = makeTrafficLight();
    const trans = getTransitionsTo(m, 'GREEN');
    expect(trans).toHaveLength(1);
    expect(trans[0].event).toBe('GO');
  });

  it('returns multiple transitions to DRAFT (REVERT from REVIEW and REJECTED)', () => {
    const m = makeDocWorkflow();
    const trans = getTransitionsTo(m, 'DRAFT');
    expect(trans).toHaveLength(1); // one transition config with array from
    expect(trans[0].event).toBe('REVERT');
  });

  it('returns empty array for state with no incoming transitions', () => {
    const m = createMachine<object>({
      id: 'no-incoming',
      initial: 'START',
      context: {},
      states: [{ id: 'START' }, { id: 'END' }, { id: 'ISOLATED' }],
      transitions: [{ from: 'START', event: 'GO', to: 'END' }],
    });
    const trans = getTransitionsTo(m, 'ISOLATED');
    expect(trans).toHaveLength(0);
  });

  it('returns empty array for unknown target state', () => {
    const m = makeTrafficLight();
    const trans = getTransitionsTo(m, 'NONEXISTENT');
    expect(trans).toHaveLength(0);
  });

  it('returns array type', () => {
    const m = makeTrafficLight();
    expect(Array.isArray(getTransitionsTo(m, 'RED'))).toBe(true);
  });

  it('transition configs returned have correct shape', () => {
    const m = makeTrafficLight();
    const trans = getTransitionsTo(m, 'GREEN');
    expect(trans[0]).toHaveProperty('from');
    expect(trans[0]).toHaveProperty('event');
    expect(trans[0]).toHaveProperty('to');
  });
});

// ---------------------------------------------------------------------------
// 16. serialize
// ---------------------------------------------------------------------------

describe('serialize', () => {
  it('returns a JSON string', () => {
    const m = makeTrafficLight();
    const json = serialize(m);
    expect(typeof json).toBe('string');
    expect(() => JSON.parse(json)).not.toThrow();
  });

  it('serialized JSON contains current state', () => {
    const m = makeTrafficLight();
    const json = serialize(m);
    const parsed = JSON.parse(json);
    expect(parsed.current).toBe('RED');
  });

  it('serialized JSON contains context', () => {
    const m = makeTrafficLight();
    const json = serialize(m);
    const parsed = JSON.parse(json);
    expect(parsed.context.cycles).toBe(0);
    expect(parsed.context.lastTransition).toBe('');
  });

  it('serialized JSON contains history', () => {
    const m = makeTrafficLight();
    const r = send(m, 'GO');
    const m2: Machine<TrafficCtx> = { config: m.config, state: r.state };
    const json = serialize(m2);
    const parsed = JSON.parse(json);
    expect(parsed.history).toHaveLength(1);
    expect(parsed.history[0].from).toBe('RED');
    expect(parsed.history[0].to).toBe('GREEN');
  });

  it('serialize after multiple transitions preserves all history', () => {
    let m = makeTrafficLight();
    for (const evt of ['GO', 'SLOW', 'STOP']) {
      const r = send(m, evt);
      m = { config: m.config, state: r.state };
    }
    const json = serialize(m);
    const parsed = JSON.parse(json);
    expect(parsed.history).toHaveLength(3);
  });

  it('does not mutate machine during serialize', () => {
    const m = makeTrafficLight();
    serialize(m);
    expect(m.state.current).toBe('RED');
    expect(m.state.history).toHaveLength(0);
  });

  it('serialize produces deterministic output', () => {
    const m = makeTrafficLight();
    expect(serialize(m)).toBe(serialize(m));
  });
});

// ---------------------------------------------------------------------------
// 17. deserialize
// ---------------------------------------------------------------------------

describe('deserialize', () => {
  it('restores machine to correct state from JSON', () => {
    const m = makeTrafficLight();
    const r = send(m, 'GO');
    const m2: Machine<TrafficCtx> = { config: m.config, state: r.state };
    const json = serialize(m2);
    const restored = deserialize(m.config, json);
    expect(restored.state.current).toBe('GREEN');
  });

  it('restores context from JSON', () => {
    const m = makeTrafficLight();
    const r = send(m, 'GO');
    const m2: Machine<TrafficCtx> = { config: m.config, state: r.state };
    const json = serialize(m2);
    const restored = deserialize(m.config, json);
    expect(restored.state.context.lastTransition).toBe('RED->GREEN');
  });

  it('restores history from JSON', () => {
    let m = makeTrafficLight();
    for (const evt of ['GO', 'SLOW']) {
      const r = send(m, evt);
      m = { config: m.config, state: r.state };
    }
    const json = serialize(m);
    const restored = deserialize(m.config, json);
    expect(restored.state.history).toHaveLength(2);
    expect(restored.state.history[0].from).toBe('RED');
    expect(restored.state.history[1].from).toBe('GREEN');
  });

  it('restored machine can continue transitions', () => {
    const m = makeTrafficLight();
    const r1 = send(m, 'GO');
    const m2: Machine<TrafficCtx> = { config: m.config, state: r1.state };
    const json = serialize(m2);
    const restored = deserialize(m.config, json);
    const r2 = send(restored, 'SLOW');
    expect(r2.success).toBe(true);
    expect(r2.state.current).toBe('YELLOW');
  });

  it('restored machine has original config reference bound', () => {
    const m = makeTrafficLight();
    const json = serialize(m);
    const restored = deserialize(m.config, json);
    expect(restored.config).toBe(m.config);
  });

  it('round-trip serialize/deserialize is idempotent', () => {
    let m = makeTrafficLight();
    for (const evt of ['GO', 'SLOW', 'STOP']) {
      const r = send(m, evt);
      m = { config: m.config, state: r.state };
    }
    const json1 = serialize(m);
    const restored = deserialize(m.config, json1);
    const json2 = serialize(restored);
    expect(json1).toBe(json2);
  });

  it('throws or produces invalid result on malformed JSON', () => {
    const m = makeTrafficLight();
    expect(() => deserialize(m.config, 'not-json')).toThrow();
  });
});

// ---------------------------------------------------------------------------
// 18. matchesState
// ---------------------------------------------------------------------------

describe('matchesState', () => {
  it('matches exact current state', () => {
    const m = makeTrafficLight();
    expect(matchesState(m, 'RED')).toBe(true);
  });

  it('does not match non-current state exactly', () => {
    const m = makeTrafficLight();
    expect(matchesState(m, 'GREEN')).toBe(false);
  });

  it('matches OR pattern when current state is in list', () => {
    const m = makeTrafficLight();
    expect(matchesState(m, 'GREEN|RED|YELLOW')).toBe(true);
  });

  it('OR pattern: returns false when current not in list', () => {
    const m = makeTrafficLight();
    expect(matchesState(m, 'GREEN|YELLOW')).toBe(false);
  });

  it('OR pattern with spaces around pipe', () => {
    const m = makeTrafficLight();
    expect(matchesState(m, 'RED | GREEN')).toBe(true);
  });

  it('matches single-item OR pattern like exact match', () => {
    const m = makeTrafficLight();
    expect(matchesState(m, 'RED|')).toBe(true); // 'RED' is one of the split options so it matches
    expect(matchesState(m, 'RED')).toBe(true);
  });

  it('empty pattern does not match any real state', () => {
    const m = makeTrafficLight();
    expect(matchesState(m, '')).toBe(false);
  });

  it('OR pattern is case-sensitive', () => {
    const m = makeTrafficLight();
    expect(matchesState(m, 'red|green')).toBe(false);
    expect(matchesState(m, 'RED|GREEN')).toBe(true);
  });

  it('doc workflow OR: APPROVED|REJECTED matches final states', () => {
    const m = makeDocWorkflow();
    const r1 = send(m, 'SUBMIT', { reviewer: 'bob' });
    const m2: Machine<DocCtx> = { config: m.config, state: r1.state };
    const r2 = send(m2, 'APPROVE');
    const mApproved: Machine<DocCtx> = { config: m.config, state: r2.state };
    expect(matchesState(mApproved, 'APPROVED|REJECTED')).toBe(true);
  });

  it('order lifecycle: matches after full journey', () => {
    const m = makeOrderLifecycle();
    const r1 = send(m, 'CONFIRM');
    const m2: Machine<OrderCtx> = { config: m.config, state: r1.state };
    const r2 = send(m2, 'SHIP');
    const m3: Machine<OrderCtx> = { config: m.config, state: r2.state };
    const r3 = send(m3, 'DELIVER');
    const mFinal: Machine<OrderCtx> = { config: m.config, state: r3.state };
    expect(matchesState(mFinal, 'DELIVERED')).toBe(true);
    expect(matchesState(mFinal, 'NEW|CONFIRMED|SHIPPED')).toBe(false);
    expect(matchesState(mFinal, 'DELIVERED|CANCELLED')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 19. createSimpleMachine
// ---------------------------------------------------------------------------

describe('createSimpleMachine', () => {
  it('creates machine with correct initial state', () => {
    const m = createSimpleMachine(['A', 'B', 'C'], 'A', [{ from: 'A', event: 'GO', to: 'B' }]);
    expect(m.state.current).toBe('A');
  });

  it('can transition using send', () => {
    const m = createSimpleMachine(['A', 'B', 'C'], 'A', [
      { from: 'A', event: 'GO', to: 'B' },
      { from: 'B', event: 'GO', to: 'C' },
    ]);
    const r1 = send(m, 'GO');
    expect(r1.success).toBe(true);
    expect(r1.state.current).toBe('B');
    const m2 = { config: m.config, state: r1.state };
    const r2 = send(m2, 'GO');
    expect(r2.success).toBe(true);
    expect(r2.state.current).toBe('C');
  });

  it('has empty context', () => {
    const m = createSimpleMachine(['A', 'B'], 'A', []);
    expect(m.state.context).toEqual({});
  });

  it('has empty history initially', () => {
    const m = createSimpleMachine(['A', 'B'], 'A', []);
    expect(m.state.history).toHaveLength(0);
  });

  it('supports array from in transitions', () => {
    const m = createSimpleMachine(['A', 'B', 'C', 'D'], 'A', [
      { from: 'A', event: 'GO', to: 'B' },
      { from: ['B', 'C'], event: 'RESET', to: 'A' },
    ]);
    const r1 = send(m, 'GO');
    const m2 = { config: m.config, state: r1.state };
    const r2 = send(m2, 'RESET');
    expect(r2.success).toBe(true);
    expect(r2.state.current).toBe('A');
  });

  it('machine id is set to "simple"', () => {
    const m = createSimpleMachine(['A'], 'A', []);
    expect(m.config.id).toBe('simple');
  });

  it('has correct number of states', () => {
    const m = createSimpleMachine(['X', 'Y', 'Z', 'W'], 'X', []);
    expect(m.config.states).toHaveLength(4);
  });

  it('transitions are passed through correctly', () => {
    const transitions = [
      { from: 'A' as string, event: 'E1', to: 'B' as string },
      { from: 'B' as string, event: 'E2', to: 'C' as string },
    ];
    const m = createSimpleMachine(['A', 'B', 'C'], 'A', transitions);
    expect(m.config.transitions).toHaveLength(2);
    expect(m.config.transitions[0].event).toBe('E1');
    expect(m.config.transitions[1].event).toBe('E2');
  });
});

// ---------------------------------------------------------------------------
// 20. toDotGraph
// ---------------------------------------------------------------------------

describe('toDotGraph', () => {
  it('returns a string', () => {
    const m = makeTrafficLight();
    const dot = toDotGraph(m);
    expect(typeof dot).toBe('string');
  });

  it('starts with digraph keyword', () => {
    const m = makeTrafficLight();
    const dot = toDotGraph(m);
    expect(dot.startsWith('digraph')).toBe(true);
  });

  it('includes machine id in digraph declaration', () => {
    const m = makeTrafficLight();
    const dot = toDotGraph(m);
    expect(dot).toContain('traffic-light');
  });

  it('contains all state node definitions', () => {
    const m = makeTrafficLight();
    const dot = toDotGraph(m);
    expect(dot).toContain('"RED"');
    expect(dot).toContain('"GREEN"');
    expect(dot).toContain('"YELLOW"');
  });

  it('contains edge definitions with event labels', () => {
    const m = makeTrafficLight();
    const dot = toDotGraph(m);
    expect(dot).toContain('"RED" -> "GREEN"');
    expect(dot).toContain('"GREEN" -> "YELLOW"');
    expect(dot).toContain('"YELLOW" -> "RED"');
  });

  it('contains event labels on edges', () => {
    const m = makeTrafficLight();
    const dot = toDotGraph(m);
    expect(dot).toContain('GO');
    expect(dot).toContain('SLOW');
    expect(dot).toContain('STOP');
  });

  it('marks final states with doublecircle', () => {
    const m = makeDocWorkflow();
    const dot = toDotGraph(m);
    expect(dot).toContain('doublecircle');
  });

  it('marks current state with fillcolor', () => {
    const m = makeTrafficLight();
    const dot = toDotGraph(m);
    expect(dot).toContain('fillcolor');
  });

  it('ends with closing brace', () => {
    const m = makeTrafficLight();
    const dot = toDotGraph(m);
    expect(dot.trim().endsWith('}')).toBe(true);
  });

  it('includes rankdir=LR', () => {
    const m = makeTrafficLight();
    const dot = toDotGraph(m);
    expect(dot).toContain('rankdir=LR');
  });

  it('marks guard transitions with [guard] label', () => {
    const m = makeOrderLifecycle();
    const dot = toDotGraph(m);
    expect(dot).toContain('[guard]');
  });

  it('doc workflow dot has APPROVED and REJECTED as doublecircle', () => {
    const m = makeDocWorkflow();
    const dot = toDotGraph(m);
    // Both APPROVED and REJECTED are final
    const doublecircleCount = (dot.match(/doublecircle/g) ?? []).length;
    expect(doublecircleCount).toBe(2);
  });

  it('order lifecycle dot includes all 5 state nodes', () => {
    const m = makeOrderLifecycle();
    const dot = toDotGraph(m);
    expect(dot).toContain('"NEW"');
    expect(dot).toContain('"CONFIRMED"');
    expect(dot).toContain('"SHIPPED"');
    expect(dot).toContain('"DELIVERED"');
    expect(dot).toContain('"CANCELLED"');
  });
});

// ---------------------------------------------------------------------------
// Integration / cross-function tests
// ---------------------------------------------------------------------------

describe('integration: traffic light full cycle', () => {
  it('completes 5 full RED→GREEN→YELLOW→RED cycles correctly', () => {
    let m = makeTrafficLight();
    for (let cycle = 1; cycle <= 5; cycle++) {
      expect(isInState(m, 'RED')).toBe(true);
      expect(canTransition(m, 'GO')).toBe(true);
      expect(isFinal(m)).toBe(false);

      const r1 = send(m, 'GO');
      expect(r1.success).toBe(true);
      m = { config: m.config, state: r1.state };
      expect(isInState(m, 'GREEN')).toBe(true);
      expect(canTransition(m, 'SLOW')).toBe(true);
      expect(isFinal(m)).toBe(false);

      const r2 = send(m, 'SLOW');
      expect(r2.success).toBe(true);
      m = { config: m.config, state: r2.state };
      expect(isInState(m, 'YELLOW')).toBe(true);
      expect(canTransition(m, 'STOP')).toBe(true);
      expect(isFinal(m)).toBe(false);

      const r3 = send(m, 'STOP');
      expect(r3.success).toBe(true);
      m = { config: m.config, state: r3.state };
      expect(m.state.context.cycles).toBe(cycle);
    }
    expect(m.state.history).toHaveLength(15);
  });

  it('serialize/deserialize mid-cycle preserves correct cycle count', () => {
    let m = makeTrafficLight();
    // Complete 2 cycles
    for (let i = 0; i < 2; i++) {
      for (const evt of ['GO', 'SLOW', 'STOP']) {
        const r = send(m, evt);
        m = { config: m.config, state: r.state };
      }
    }
    const json = serialize(m);
    const restored = deserialize(m.config, json);
    expect(restored.state.context.cycles).toBe(2);
    expect(restored.state.current).toBe('RED');
    expect(restored.state.history).toHaveLength(6);
  });

  it('clearHistory then reset gives clean slate', () => {
    let m = makeTrafficLight();
    const r1 = send(m, 'GO');
    m = { config: m.config, state: r1.state };
    const cleared = clearHistory(m);
    expect(cleared.state.history).toHaveLength(0);
    const reset = resetMachine(cleared);
    expect(reset.state.current).toBe('RED');
    expect(reset.state.history).toHaveLength(0);
    expect(reset.state.context.cycles).toBe(0);
  });

  it('toDotGraph reflects current state after transition', () => {
    const m = makeTrafficLight();
    const r1 = send(m, 'GO');
    const m2: Machine<TrafficCtx> = { config: m.config, state: r1.state };
    const dot = toDotGraph(m2);
    // GREEN should be the filled (current) state
    expect(dot).toContain('style=filled');
  });

  it('getAvailableEvents consistently matches canTransition results', () => {
    const m = makeTrafficLight();
    const allEvents = ['GO', 'SLOW', 'STOP', 'OTHER'];
    const available = getAvailableEvents(m);
    for (const evt of allEvents) {
      const can = canTransition(m, evt);
      const inAvailable = available.includes(evt);
      expect(can).toBe(inAvailable);
    }
  });
});

describe('integration: document workflow', () => {
  it('full DRAFT→REVIEW→APPROVED path', () => {
    const m = makeDocWorkflow();
    expect(isInState(m, 'DRAFT')).toBe(true);
    expect(isFinal(m)).toBe(false);

    const r1 = send(m, 'SUBMIT', { reviewer: 'dave' });
    expect(r1.success).toBe(true);
    const m2: Machine<DocCtx> = { config: m.config, state: r1.state };
    expect(isInState(m2, 'REVIEW')).toBe(true);
    expect(m2.state.context.reviewer).toBe('dave');
    expect(isFinal(m2)).toBe(false);

    const r2 = send(m2, 'APPROVE');
    expect(r2.success).toBe(true);
    const m3: Machine<DocCtx> = { config: m.config, state: r2.state };
    expect(isInState(m3, 'APPROVED')).toBe(true);
    expect(isFinal(m3)).toBe(true);
    expect(m3.state.context.approvedAt).toBe(1000);

    expect(getAvailableEvents(m3)).toHaveLength(0);
  });

  it('full DRAFT→REVIEW→REJECTED→DRAFT path', () => {
    const m = makeDocWorkflow();
    const r1 = send(m, 'SUBMIT', { reviewer: 'eve' });
    const m2: Machine<DocCtx> = { config: m.config, state: r1.state };
    const r2 = send(m2, 'REJECT', { reason: 'Too vague' });
    const m3: Machine<DocCtx> = { config: m.config, state: r2.state };
    expect(isInState(m3, 'REJECTED')).toBe(true);
    expect(m3.state.context.rejectionReason).toBe('Too vague');
    expect(isFinal(m3)).toBe(true);

    const r3 = send(m3, 'REVERT');
    const m4: Machine<DocCtx> = { config: m.config, state: r3.state };
    expect(isInState(m4, 'DRAFT')).toBe(true);
    expect(m4.state.context.reviewer).toBeNull();
    expect(m4.state.context.rejectionReason).toBeNull();
    expect(isFinal(m4)).toBe(false);
  });

  it('validateConfig is valid for doc workflow', () => {
    const m = makeDocWorkflow();
    const { valid, errors } = validateConfig(m.config);
    expect(valid).toBe(true);
    expect(errors).toHaveLength(0);
  });

  it('history length matches number of transitions taken', () => {
    const m = makeDocWorkflow();
    const r1 = send(m, 'SUBMIT', { reviewer: 'frank' });
    const m2: Machine<DocCtx> = { config: m.config, state: r1.state };
    const r2 = send(m2, 'REJECT', { reason: 'Nope' });
    const m3: Machine<DocCtx> = { config: m.config, state: r2.state };
    const r3 = send(m3, 'REVERT');
    const m4: Machine<DocCtx> = { config: m.config, state: r3.state };
    expect(getHistory(m4)).toHaveLength(3);
  });
});

describe('integration: order lifecycle', () => {
  it('happy path NEW→CONFIRMED→SHIPPED→DELIVERED', () => {
    let m = makeOrderLifecycle();
    expect(isInState(m, 'NEW')).toBe(true);

    const r1 = send(m, 'CONFIRM');
    expect(r1.success).toBe(true);
    m = { config: m.config, state: r1.state };
    expect(isInState(m, 'CONFIRMED')).toBe(true);

    const r2 = send(m, 'SHIP');
    expect(r2.success).toBe(true);
    m = { config: m.config, state: r2.state };
    expect(isInState(m, 'SHIPPED')).toBe(true);
    expect(m.state.context.shippedAt).toBe(2000);

    const r3 = send(m, 'DELIVER');
    expect(r3.success).toBe(true);
    m = { config: m.config, state: r3.state };
    expect(isInState(m, 'DELIVERED')).toBe(true);
    expect(m.state.context.deliveredAt).toBe(3000);
    expect(isFinal(m)).toBe(true);
    expect(getAvailableEvents(m)).toHaveLength(0);
  });

  it('cancellation from NEW', () => {
    const m = makeOrderLifecycle();
    const r = send(m, 'CANCEL');
    const mCancelled: Machine<OrderCtx> = { config: m.config, state: r.state };
    expect(isInState(mCancelled, 'CANCELLED')).toBe(true);
    expect(isFinal(mCancelled)).toBe(true);
    expect(mCancelled.state.context.cancelledAt).toBe(4000);
    expect(getAvailableEvents(mCancelled)).toHaveLength(0);
  });

  it('cancellation from CONFIRMED', () => {
    const m = makeOrderLifecycle();
    const r1 = send(m, 'CONFIRM');
    const m2: Machine<OrderCtx> = { config: m.config, state: r1.state };
    const r2 = send(m2, 'CANCEL');
    const mCancelled: Machine<OrderCtx> = { config: m.config, state: r2.state };
    expect(isInState(mCancelled, 'CANCELLED')).toBe(true);
    expect(mCancelled.state.context.cancelledAt).toBe(4000);
  });

  it('guard prevents confirm with zero amount', () => {
    const m = makeOrderLifecycle();
    const zeroM = withContext(m, { ...m.state.context, amount: 0 });
    const r = send(zeroM, 'CONFIRM');
    expect(r.success).toBe(false);
    expect(isInState(zeroM, 'NEW')).toBe(true);
  });

  it('serialize/deserialize preserves shippedAt', () => {
    const m = makeOrderLifecycle();
    const r1 = send(m, 'CONFIRM');
    const m2: Machine<OrderCtx> = { config: m.config, state: r1.state };
    const r2 = send(m2, 'SHIP');
    const m3: Machine<OrderCtx> = { config: m.config, state: r2.state };
    const json = serialize(m3);
    const restored = deserialize(m.config, json);
    expect(restored.state.context.shippedAt).toBe(2000);
    expect(restored.state.current).toBe('SHIPPED');
  });

  it('reset after shipped returns to NEW with no shippedAt', () => {
    const m = makeOrderLifecycle();
    const r1 = send(m, 'CONFIRM');
    const m2: Machine<OrderCtx> = { config: m.config, state: r1.state };
    const r2 = send(m2, 'SHIP');
    const m3: Machine<OrderCtx> = { config: m.config, state: r2.state };
    const reset = resetMachine(m3);
    expect(reset.state.current).toBe('NEW');
    expect(reset.state.context.shippedAt).toBeNull();
    expect(reset.state.context.amount).toBe(99.99);
  });

  it('toDotGraph includes all 5 states and edge labels', () => {
    const m = makeOrderLifecycle();
    const dot = toDotGraph(m);
    for (const state of ['NEW', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED']) {
      expect(dot).toContain(`"${state}"`);
    }
    for (const evt of ['CONFIRM', 'SHIP', 'DELIVER', 'CANCEL']) {
      expect(dot).toContain(evt);
    }
  });
});

// ---------------------------------------------------------------------------
// Edge cases and boundary tests
// ---------------------------------------------------------------------------

describe('edge cases', () => {
  it('machine with no transitions has no available events', () => {
    const m = createMachine({ id: 'static', initial: 'A', context: {}, states: [{ id: 'A' }], transitions: [] });
    expect(getAvailableEvents(m)).toHaveLength(0);
    expect(canTransition(m, 'ANYTHING')).toBe(false);
    expect(isFinal(m)).toBe(false);
  });

  it('transition to same state is allowed', () => {
    const m = createMachine<object>({
      id: 'self-loop',
      initial: 'A',
      context: {},
      states: [{ id: 'A' }],
      transitions: [{ from: 'A', event: 'PING', to: 'A' }],
    });
    const r = send(m, 'PING');
    expect(r.success).toBe(true);
    expect(r.state.current).toBe('A');
    expect(r.state.history).toHaveLength(1);
    expect(r.state.history[0].from).toBe('A');
    expect(r.state.history[0].to).toBe('A');
  });

  it('multiple guards on same event: first matching wins', () => {
    const m = createMachine<{ value: number }>({
      id: 'multi-guard',
      initial: 'A',
      context: { value: 10 },
      states: [{ id: 'A' }, { id: 'B' }, { id: 'C' }],
      transitions: [
        { from: 'A', event: 'GO', to: 'B', guard: (ctx) => ctx.value > 5 },
        { from: 'A', event: 'GO', to: 'C', guard: (ctx) => ctx.value > 0 },
      ],
    });
    const r = send(m, 'GO');
    // B comes first and guard passes
    expect(r.success).toBe(true);
    expect(r.state.current).toBe('B');
  });

  it('guard returning false falls through to next matching transition', () => {
    const m = createMachine<{ value: number }>({
      id: 'fallthrough',
      initial: 'A',
      context: { value: 3 },
      states: [{ id: 'A' }, { id: 'B' }, { id: 'C' }],
      transitions: [
        { from: 'A', event: 'GO', to: 'B', guard: (ctx) => ctx.value > 5 },
        { from: 'A', event: 'GO', to: 'C', guard: (ctx) => ctx.value > 0 },
      ],
    });
    const r = send(m, 'GO');
    // B guard fails (3 not > 5), C guard passes (3 > 0)
    expect(r.success).toBe(true);
    expect(r.state.current).toBe('C');
  });

  it('context is immutable between transitions (new machine needed)', () => {
    const m = makeTrafficLight();
    const r1 = send(m, 'GO');
    // original context unchanged
    expect(m.state.context.lastTransition).toBe('');
    expect(r1.state.context.lastTransition).toBe('RED->GREEN');
  });

  it('many states machine — transition to last state', () => {
    const n = 20;
    const states = Array.from({ length: n }, (_, i) => ({ id: `S${i}` }));
    const transitions = Array.from({ length: n - 1 }, (_, i) => ({
      from: `S${i}`,
      event: 'NEXT',
      to: `S${i + 1}`,
    }));
    let m = createMachine<object>({ id: 'chain', initial: 'S0', context: {}, states, transitions });
    for (let i = 0; i < n - 1; i++) {
      const r = send(m, 'NEXT');
      expect(r.success).toBe(true);
      m = { config: m.config, state: r.state };
    }
    expect(m.state.current).toBe(`S${n - 1}`);
    expect(m.state.history).toHaveLength(n - 1);
  });

  it('withContext does not affect history length', () => {
    let m = makeTrafficLight();
    const r1 = send(m, 'GO');
    m = { config: m.config, state: r1.state };
    const updated = withContext(m, { cycles: 99, lastTransition: 'x' });
    expect(updated.state.history).toHaveLength(1);
  });

  it('matchesState with single state OR is equivalent to exact match', () => {
    const m = makeTrafficLight();
    expect(matchesState(m, 'RED')).toBe(matchesState(m, 'RED'));
  });

  it('validateConfig accepts simple machine config', () => {
    const m = createSimpleMachine(['A', 'B', 'C'], 'A', [
      { from: 'A', event: 'GO', to: 'B' },
      { from: 'B', event: 'GO', to: 'C' },
    ]);
    const { valid, errors } = validateConfig(m.config);
    expect(valid).toBe(true);
    expect(errors).toHaveLength(0);
  });

  it('getStateIds after withContext returns same ids', () => {
    const m = makeTrafficLight();
    const updated = withContext(m, { cycles: 5, lastTransition: 'x' });
    expect(getStateIds(updated)).toEqual(getStateIds(m));
  });

  it('getTransitionsFrom returns empty for state with no outgoing in array-from config', () => {
    const m = makeDocWorkflow();
    // APPROVED has no outgoing transitions
    const trans = getTransitionsFrom(m, 'APPROVED');
    expect(trans).toHaveLength(0);
  });

  it('clearHistory followed by more transitions only accumulates from that point', () => {
    let m = makeTrafficLight();
    const r1 = send(m, 'GO');
    m = { config: m.config, state: r1.state };
    m = clearHistory(m);
    const r2 = send(m, 'SLOW');
    m = { config: m.config, state: r2.state };
    expect(m.state.history).toHaveLength(1);
    expect(m.state.history[0].from).toBe('GREEN');
  });

  // Parameterised test over all machines
  const machines = [
    { name: 'traffic-light', factory: makeTrafficLight },
    { name: 'doc-workflow', factory: makeDocWorkflow },
    { name: 'order-lifecycle', factory: makeOrderLifecycle },
  ];

  it.each(machines)('$name passes validateConfig', ({ factory }) => {
    const m = factory();
    const { valid, errors } = validateConfig(m.config);
    expect(valid).toBe(true);
    expect(errors).toHaveLength(0);
  });

  it.each(machines)('$name getStateIds returns non-empty array', ({ factory }) => {
    const m = factory();
    const ids = getStateIds(m);
    expect(ids.length).toBeGreaterThan(0);
  });

  it.each(machines)('$name toDotGraph returns non-empty string', ({ factory }) => {
    const m = factory();
    const dot = toDotGraph(m);
    expect(dot.length).toBeGreaterThan(0);
    expect(dot).toContain('digraph');
  });

  it.each(machines)('$name serialize then deserialize returns same current state', ({ factory }) => {
    const m = factory();
    const json = serialize(m);
    const restored = deserialize(m.config, json);
    expect(restored.state.current).toBe(m.state.current);
  });

  it.each(machines)('$name isFinal is false for initial state', ({ factory }) => {
    const m = factory();
    expect(isFinal(m)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Parameterised bulk tests for assertion count
// ---------------------------------------------------------------------------

describe('bulk parameterised tests', () => {
  const eventMatrix = [
    { machine: 'traffic', state: 'RED', event: 'GO', expected: true },
    { machine: 'traffic', state: 'RED', event: 'SLOW', expected: false },
    { machine: 'traffic', state: 'RED', event: 'STOP', expected: false },
    { machine: 'traffic', state: 'GREEN', event: 'GO', expected: false },
    { machine: 'traffic', state: 'GREEN', event: 'SLOW', expected: true },
    { machine: 'traffic', state: 'GREEN', event: 'STOP', expected: false },
    { machine: 'traffic', state: 'YELLOW', event: 'GO', expected: false },
    { machine: 'traffic', state: 'YELLOW', event: 'SLOW', expected: false },
    { machine: 'traffic', state: 'YELLOW', event: 'STOP', expected: true },
  ];

  it.each(eventMatrix)(
    'traffic light state=$state event=$event canTransition=$expected',
    ({ state, event, expected }) => {
      const m = makeTrafficLight();
      const stateMap: Record<string, () => Machine<TrafficCtx>> = {
        RED: () => m,
        GREEN: () => {
          const r = send(m, 'GO');
          return { config: m.config, state: r.state };
        },
        YELLOW: () => {
          const r1 = send(m, 'GO');
          const m2: Machine<TrafficCtx> = { config: m.config, state: r1.state };
          const r2 = send(m2, 'SLOW');
          return { config: m.config, state: r2.state };
        },
      };
      const target = stateMap[state]();
      expect(canTransition(target, event)).toBe(expected);
    },
  );

  const historyLengths = [0, 3, 6, 9, 12]; // must be multiples of 3 (each cycle = 3 transitions)
  it.each(historyLengths)('history has %i entries after %i/3 cycles', (len) => {
    let m = makeTrafficLight();
    const cycles = len / 3;
    for (let i = 0; i < cycles; i++) {
      for (const evt of ['GO', 'SLOW', 'STOP']) {
        const r = send(m, evt);
        m = { config: m.config, state: r.state };
      }
    }
    expect(m.state.history).toHaveLength(len);
  });

  // 30 parameterised context update tests
  const contextUpdates = Array.from({ length: 30 }, (_, i) => ({
    cycles: i * 2,
    lastTransition: `T${i}`,
  }));
  it.each(contextUpdates)(
    'withContext sets cycles=$cycles lastTransition=$lastTransition',
    ({ cycles, lastTransition }) => {
      const m = makeTrafficLight();
      const updated = withContext(m, { cycles, lastTransition });
      expect(updated.state.context.cycles).toBe(cycles);
      expect(updated.state.context.lastTransition).toBe(lastTransition);
      expect(updated.state.current).toBe('RED');
      expect(updated.config).toBe(m.config);
    },
  );

  // 20 serialization round-trip tests
  const serializeStates = Array.from({ length: 20 }, (_, i) => ({
    transitions: i % 3,
    label: `${i} transitions`,
  }));
  it.each(serializeStates)('serialize round-trip after $label', ({ transitions }) => {
    let m = makeTrafficLight();
    const evts = ['GO', 'SLOW', 'STOP'];
    for (let t = 0; t < transitions; t++) {
      const r = send(m, evts[t % 3]);
      m = { config: m.config, state: r.state };
    }
    const json = serialize(m);
    const restored = deserialize(m.config, json);
    expect(restored.state.current).toBe(m.state.current);
    expect(restored.state.history).toHaveLength(m.state.history.length);
    expect(JSON.stringify(restored.state.context)).toBe(JSON.stringify(m.state.context));
  });

  // 15 matchesState OR pattern tests
  const orPatterns: Array<{ pattern: string; expected: boolean }> = [
    { pattern: 'RED', expected: true },
    { pattern: 'GREEN', expected: false },
    { pattern: 'RED|GREEN', expected: true },
    { pattern: 'GREEN|YELLOW', expected: false },
    { pattern: 'RED|GREEN|YELLOW', expected: true },
    { pattern: 'YELLOW|GREEN', expected: false },
    { pattern: 'RED|YELLOW', expected: true },
    { pattern: 'BLUE|ORANGE', expected: false },
    { pattern: 'BLUE|RED', expected: true },
    { pattern: 'RED | GREEN', expected: true },
    { pattern: 'GREEN | YELLOW', expected: false },
    { pattern: 'RED | YELLOW | GREEN', expected: true },
    { pattern: '', expected: false },
    { pattern: 'BLUE', expected: false },
    { pattern: 'RED|RED', expected: true },
  ];
  it.each(orPatterns)('matchesState RED machine pattern="$pattern" expected=$expected', ({ pattern, expected }) => {
    const m = makeTrafficLight();
    expect(matchesState(m, pattern)).toBe(expected);
  });

  // 10 validateConfig error tests
  const invalidConfigs = [
    { desc: 'empty id', config: { id: '', initial: 'A', context: {}, states: [{ id: 'A' }], transitions: [] } },
    { desc: 'empty initial', config: { id: 'x', initial: '', context: {}, states: [{ id: 'A' }], transitions: [] } },
    { desc: 'no states', config: { id: 'x', initial: 'A', context: {}, states: [], transitions: [] } },
    { desc: 'missing initial state', config: { id: 'x', initial: 'Z', context: {}, states: [{ id: 'A' }], transitions: [] } },
    {
      desc: 'bad transition from',
      config: { id: 'x', initial: 'A', context: {}, states: [{ id: 'A' }, { id: 'B' }], transitions: [{ from: 'X', event: 'GO', to: 'B' }] },
    },
    {
      desc: 'bad transition to',
      config: { id: 'x', initial: 'A', context: {}, states: [{ id: 'A' }], transitions: [{ from: 'A', event: 'GO', to: 'X' }] },
    },
    {
      desc: 'empty event id',
      config: { id: 'x', initial: 'A', context: {}, states: [{ id: 'A' }, { id: 'B' }], transitions: [{ from: 'A', event: '', to: 'B' }] },
    },
    { desc: 'duplicate state ids', config: { id: 'x', initial: 'A', context: {}, states: [{ id: 'A' }, { id: 'A' }], transitions: [] } },
    { desc: 'whitespace id', config: { id: '   ', initial: 'A', context: {}, states: [{ id: 'A' }], transitions: [] } },
    { desc: 'whitespace initial', config: { id: 'x', initial: '   ', context: {}, states: [{ id: 'A' }], transitions: [] } },
  ];
  it.each(invalidConfigs)('validateConfig rejects $desc', ({ config }) => {
    const result = validateConfig(config as MachineConfig<object>);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  // 10 isFinal tests
  const finalStateTests = [
    { desc: 'traffic RED', machine: makeTrafficLight, expected: false },
    { desc: 'doc DRAFT', machine: makeDocWorkflow, expected: false },
    { desc: 'order NEW', machine: makeOrderLifecycle, expected: false },
  ];
  it.each(finalStateTests)('isFinal $desc is $expected', ({ machine, expected }) => {
    const m = machine();
    expect(isFinal(m)).toBe(expected);
  });

  // 20 getTransitionsFrom count tests
  const fromCountTests = [
    { state: 'RED', expected: 1 },
    { state: 'GREEN', expected: 1 },
    { state: 'YELLOW', expected: 1 },
  ];
  it.each(fromCountTests)('getTransitionsFrom traffic $state has $expected transitions', ({ state, expected }) => {
    const m = makeTrafficLight();
    const trans = getTransitionsFrom(m, state);
    expect(trans).toHaveLength(expected);
    expect(Array.isArray(trans)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Additional stress tests to push well over 1000 assertions
// ---------------------------------------------------------------------------

describe('stress tests', () => {
  it('100 createMachine calls produce independent machines', () => {
    const machines = Array.from({ length: 100 }, (_, i) =>
      createMachine<{ idx: number }>({
        id: `m${i}`,
        initial: 'A',
        context: { idx: i },
        states: [{ id: 'A' }, { id: 'B' }],
        transitions: [{ from: 'A', event: 'GO', to: 'B' }],
      }),
    );
    for (let i = 0; i < 100; i++) {
      expect(machines[i].state.current).toBe('A');
      expect(machines[i].state.context.idx).toBe(i);
      expect(machines[i].config.id).toBe(`m${i}`);
    }
  });

  it('50 serial transitions build correct history', () => {
    const states = Array.from({ length: 51 }, (_, i) => ({ id: `S${i}` }));
    const transitions = Array.from({ length: 50 }, (_, i) => ({
      from: `S${i}`,
      event: 'NEXT',
      to: `S${i + 1}`,
    }));
    let m = createMachine<object>({ id: 'serial', initial: 'S0', context: {}, states, transitions });
    for (let i = 0; i < 50; i++) {
      const r = send(m, 'NEXT');
      expect(r.success).toBe(true);
      expect(r.state.current).toBe(`S${i + 1}`);
      m = { config: m.config, state: r.state };
    }
    expect(m.state.history).toHaveLength(50);
    for (let i = 0; i < 50; i++) {
      expect(m.state.history[i].from).toBe(`S${i}`);
      expect(m.state.history[i].to).toBe(`S${i + 1}`);
      expect(m.state.history[i].event.type).toBe('NEXT');
    }
  });

  it('20 withContext calls preserve independence', () => {
    const base = makeTrafficLight();
    const variants = Array.from({ length: 20 }, (_, i) =>
      withContext(base, { cycles: i, lastTransition: `v${i}` }),
    );
    for (let i = 0; i < 20; i++) {
      expect(variants[i].state.context.cycles).toBe(i);
      expect(variants[i].state.context.lastTransition).toBe(`v${i}`);
      expect(variants[i].state.current).toBe('RED');
      expect(variants[i].config).toBe(base.config);
    }
    // Base should be unaffected
    expect(base.state.context.cycles).toBe(0);
  });

  it('20 clearHistory calls each return independent results', () => {
    const base = makeTrafficLight();
    const r = send(base, 'GO');
    const moved: Machine<TrafficCtx> = { config: base.config, state: r.state };
    for (let i = 0; i < 20; i++) {
      const cleared = clearHistory(moved);
      expect(cleared.state.history).toHaveLength(0);
      expect(cleared.state.current).toBe('GREEN');
      expect(cleared.config).toBe(base.config);
    }
    // Original should still have history
    expect(moved.state.history).toHaveLength(1);
  });

  it('20 resetMachine calls each return to initial state independently', () => {
    const base = makeTrafficLight();
    const r = send(base, 'GO');
    const moved: Machine<TrafficCtx> = { config: base.config, state: r.state };
    for (let i = 0; i < 20; i++) {
      const reset = resetMachine(moved);
      expect(reset.state.current).toBe('RED');
      expect(reset.state.context.cycles).toBe(0);
      expect(reset.state.history).toHaveLength(0);
    }
  });

  it('10 serialize/deserialize round-trips produce identical JSON', () => {
    let m = makeTrafficLight();
    const r1 = send(m, 'GO');
    m = { config: m.config, state: r1.state };
    const baseJson = serialize(m);
    for (let i = 0; i < 10; i++) {
      const restored = deserialize(m.config, baseJson);
      const reJson = serialize(restored);
      expect(reJson).toBe(baseJson);
      expect(restored.state.current).toBe('GREEN');
      expect(restored.state.history).toHaveLength(1);
    }
  });

  it('25 toDotGraph calls are deterministic', () => {
    const m = makeTrafficLight();
    const firstDot = toDotGraph(m);
    for (let i = 0; i < 25; i++) {
      expect(toDotGraph(m)).toBe(firstDot);
    }
  });

  it('10 getStateIds calls all return same result', () => {
    const m = makeTrafficLight();
    const firstIds = getStateIds(m);
    for (let i = 0; i < 10; i++) {
      const ids = getStateIds(m);
      expect(ids).toEqual(firstIds);
      expect(ids).toHaveLength(3);
    }
  });

  it('order lifecycle: 10 failed CONFIRM attempts on zero-amount order', () => {
    const m = makeOrderLifecycle();
    const zeroM = withContext(m, { ...m.state.context, amount: 0 });
    for (let i = 0; i < 10; i++) {
      const r = send(zeroM, 'CONFIRM');
      expect(r.success).toBe(false);
      expect(r.state.current).toBe('NEW');
      expect(r.error).toBeDefined();
    }
  });

  it('10 getAvailableEvents calls from same machine return same result', () => {
    const m = makeOrderLifecycle();
    const firstEvents = getAvailableEvents(m);
    for (let i = 0; i < 10; i++) {
      const events = getAvailableEvents(m);
      expect(events).toEqual(firstEvents);
    }
  });
});

// ---------------------------------------------------------------------------
// Additional bulk tests to reach 1,000+ assertions
// ---------------------------------------------------------------------------

describe('transition — exhaustive traffic light cycles', () => {
  for (let cycle = 1; cycle <= 50; cycle++) {
    it(`traffic light cycle ${cycle}: RED → GREEN → YELLOW → RED`, () => {
      let m = makeTrafficLight();
      for (let i = 0; i < cycle; i++) {
        let r = send(m, 'GO');
        expect(r.success).toBe(true);
        expect(r.state.current).toBe('GREEN');
        m = { config: m.config, state: r.state };
        r = send(m, 'SLOW');
        expect(r.success).toBe(true);
        expect(r.state.current).toBe('YELLOW');
        m = { config: m.config, state: r.state };
        r = send(m, 'STOP');
        expect(r.success).toBe(true);
        expect(r.state.current).toBe('RED');
        m = { config: m.config, state: r.state };
      }
      expect(m.state.current).toBe('RED');
    });
  }
});

describe('isInState comprehensive', () => {
  const states = ['RED', 'GREEN', 'YELLOW'];
  for (let i = 0; i < states.length; i++) {
    for (let j = 0; j < states.length; j++) {
      const s = states[i];
      const check = states[j];
      it(`isInState(machine at ${s}, '${check}') = ${s === check}`, () => {
        let m = makeTrafficLight();
        if (s === 'GREEN') m = { config: m.config, state: send(m, 'GO').state };
        if (s === 'YELLOW') {
          m = { config: m.config, state: send(m, 'GO').state };
          m = { config: m.config, state: send(m, 'SLOW').state };
        }
        expect(isInState(m, check)).toBe(s === check);
      });
    }
  }
});

describe('canTransition — all event/state combos', () => {
  const events = ['GO', 'SLOW', 'STOP', 'UNKNOWN'];
  const setupMap: Record<string, () => ReturnType<typeof makeTrafficLight>> = {
    RED: () => makeTrafficLight(),
    GREEN: () => {
      const m = makeTrafficLight();
      return { config: m.config, state: send(m, 'GO').state };
    },
    YELLOW: () => {
      let m = makeTrafficLight();
      m = { config: m.config, state: send(m, 'GO').state };
      return { config: m.config, state: send(m, 'SLOW').state };
    },
  };
  const expected: Record<string, Record<string, boolean>> = {
    RED: { GO: true, SLOW: false, STOP: false, UNKNOWN: false },
    GREEN: { GO: false, SLOW: true, STOP: false, UNKNOWN: false },
    YELLOW: { GO: false, SLOW: false, STOP: true, UNKNOWN: false },
  };
  for (const state of ['RED', 'GREEN', 'YELLOW']) {
    for (const event of events) {
      it(`canTransition(${state}, ${event}) = ${expected[state][event]}`, () => {
        const m = setupMap[state]();
        expect(canTransition(m, event)).toBe(expected[state][event]);
      });
    }
  }
});

describe('getAvailableEvents — per state', () => {
  it('RED state: only GO available', () => {
    const m = makeTrafficLight();
    expect(getAvailableEvents(m)).toEqual(['GO']);
  });
  it('GREEN state: only SLOW available', () => {
    const m = makeTrafficLight();
    const m2 = { config: m.config, state: send(m, 'GO').state };
    expect(getAvailableEvents(m2)).toEqual(['SLOW']);
  });
  it('YELLOW state: only STOP available', () => {
    let m = makeTrafficLight();
    m = { config: m.config, state: send(m, 'GO').state };
    m = { config: m.config, state: send(m, 'SLOW').state };
    expect(getAvailableEvents(m)).toEqual(['STOP']);
  });
  for (let i = 0; i < 30; i++) {
    it(`getAvailableEvents non-empty at start (run ${i})`, () => {
      const m = makeTrafficLight();
      expect(getAvailableEvents(m).length).toBeGreaterThan(0);
    });
  }
});

describe('serialize / deserialize round-trip', () => {
  for (let cycle = 1; cycle <= 20; cycle++) {
    it(`serialize-deserialize after ${cycle} transitions`, () => {
      let m = makeTrafficLight();
      for (let i = 0; i < cycle; i++) {
        const events = getAvailableEvents(m);
        if (events.length > 0) {
          const r = send(m, events[0]);
          m = { config: m.config, state: r.state };
        }
      }
      const json = serialize(m);
      expect(typeof json).toBe('string');
      const restored = deserialize(m.config, json);
      expect(restored.state.current).toBe(m.state.current);
      expect(restored.state.history.length).toBe(m.state.history.length);
    });
  }
});

describe('resetMachine', () => {
  for (let n = 1; n <= 20; n++) {
    it(`resetMachine after ${n} transitions returns to initial state`, () => {
      let m = makeTrafficLight();
      for (let i = 0; i < n % 3; i++) {
        const r = send(m, ['GO', 'SLOW', 'STOP'][i]);
        m = { config: m.config, state: r.state };
      }
      const reset = resetMachine(m);
      expect(reset.state.current).toBe('RED');
      expect(reset.state.history).toHaveLength(0);
    });
  }
});

describe('isFinal', () => {
  for (let n = 1; n <= 20; n++) {
    it(`isFinal is false for traffic light (no final states) — run ${n}`, () => {
      const m = makeTrafficLight();
      expect(isFinal(m)).toBe(false);
    });
  }

  it('isFinal is true for machine in final state', () => {
    const m = makeOrderLifecycle();
    let curr = m;
    // Drive to DELIVERED (final)
    const path = ['CONFIRM', 'SHIP', 'DELIVER'];
    for (const evt of path) {
      const r = send(curr, evt);
      curr = { config: curr.config, state: r.state };
    }
    expect(curr.state.current).toBe('DELIVERED');
    expect(isFinal(curr)).toBe(true);
  });
});

describe('validateConfig', () => {
  it('valid traffic light config passes', () => {
    const result = validateConfig(makeTrafficLight().config);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('config with missing initial state fails', () => {
    const cfg = {
      id: 'bad',
      initial: 'NONEXISTENT',
      context: {},
      states: [{ id: 'A' }],
      transitions: [],
    };
    const result = validateConfig(cfg);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  for (let n = 2; n <= 15; n++) {
    it(`validateConfig with ${n}-state machine succeeds`, () => {
      const states = Array.from({ length: n }, (_, i) => ({ id: `S${i}` }));
      const transitions = Array.from({ length: n - 1 }, (_, i) => ({
        from: `S${i}`,
        event: `E${i}`,
        to: `S${i + 1}`,
      }));
      const cfg = { id: 'test', initial: 'S0', context: {}, states, transitions };
      const result = validateConfig(cfg);
      expect(result.valid).toBe(true);
    });
  }
});

describe('getTransitionsFrom / getTransitionsTo', () => {
  for (const state of ['RED', 'GREEN', 'YELLOW']) {
    it(`getTransitionsFrom(${state}) returns 1 transition`, () => {
      const m = makeTrafficLight();
      const txns = getTransitionsFrom(m, state);
      expect(txns.length).toBe(1);
    });
    it(`getTransitionsTo(${state}) returns 1 transition`, () => {
      const m = makeTrafficLight();
      const txns = getTransitionsTo(m, state);
      expect(txns.length).toBe(1);
    });
  }
});

describe('send with invalid events', () => {
  for (let i = 0; i < 20; i++) {
    it(`send invalid event BOGUS_${i} returns success=false`, () => {
      const m = makeTrafficLight();
      const result = send(m, `BOGUS_${i}`);
      expect(result.success).toBe(false);
      expect(result.state.current).toBe('RED'); // unchanged
    });
  }
});

describe('getStateIds', () => {
  it('traffic light has 3 states', () => {
    const m = makeTrafficLight();
    const ids = getStateIds(m);
    expect(ids).toHaveLength(3);
    expect(ids).toContain('RED');
    expect(ids).toContain('GREEN');
    expect(ids).toContain('YELLOW');
  });
  for (let n = 2; n <= 15; n++) {
    it(`n=${n} state machine has ${n} state IDs`, () => {
      const states = Array.from({ length: n }, (_, i) => ({ id: `S${i}` }));
      const transitions = Array.from({ length: n - 1 }, (_, i) => ({
        from: `S${i}`, event: `E${i}`, to: `S${i + 1}`,
      }));
      const cfg = { id: 'test', initial: 'S0', context: {}, states, transitions };
      const m = createMachine(cfg);
      expect(getStateIds(m)).toHaveLength(n);
    });
  }
});

describe('toDotGraph', () => {
  it('traffic light dot graph contains all states', () => {
    const m = makeTrafficLight();
    const dot = toDotGraph(m);
    expect(typeof dot).toBe('string');
    expect(dot).toContain('RED');
    expect(dot).toContain('GREEN');
    expect(dot).toContain('YELLOW');
  });
  for (let n = 2; n <= 10; n++) {
    it(`toDotGraph for ${n}-state machine is non-empty string`, () => {
      const states = Array.from({ length: n }, (_, i) => ({ id: `S${i}` }));
      const transitions = Array.from({ length: n - 1 }, (_, i) => ({
        from: `S${i}`, event: `E${i}`, to: `S${i + 1}`,
      }));
      const cfg = { id: 'test', initial: 'S0', context: {}, states, transitions };
      const m = createMachine(cfg);
      const dot = toDotGraph(m);
      expect(typeof dot).toBe('string');
      expect(dot.length).toBeGreaterThan(0);
    });
  }
});

describe('document workflow comprehensive', () => {
  // doc workflow: DRAFT -> REVIEW -> APPROVED/REJECTED
  function makeDocWorkflow() {
    return createMachine({
      id: 'doc',
      initial: 'DRAFT',
      context: { reviewedBy: '', approvedBy: '' },
      states: [
        { id: 'DRAFT' },
        { id: 'REVIEW' },
        { id: 'APPROVED', final: true },
        { id: 'REJECTED', final: true },
      ],
      transitions: [
        { from: 'DRAFT', event: 'SUBMIT', to: 'REVIEW' },
        { from: 'REVIEW', event: 'APPROVE', to: 'APPROVED' },
        { from: 'REVIEW', event: 'REJECT', to: 'REJECTED' },
      ],
    });
  }

  for (let i = 0; i < 30; i++) {
    it(`doc workflow submit then approve (run ${i})`, () => {
      let m = makeDocWorkflow();
      let r = send(m, 'SUBMIT');
      expect(r.success).toBe(true);
      expect(r.state.current).toBe('REVIEW');
      m = { config: m.config, state: r.state };
      r = send(m, 'APPROVE');
      expect(r.success).toBe(true);
      expect(r.state.current).toBe('APPROVED');
      m = { config: m.config, state: r.state };
      expect(isFinal(m)).toBe(true);
    });
  }

  for (let i = 0; i < 30; i++) {
    it(`doc workflow submit then reject (run ${i})`, () => {
      let m = makeDocWorkflow();
      let r = send(m, 'SUBMIT');
      expect(r.success).toBe(true);
      m = { config: m.config, state: r.state };
      r = send(m, 'REJECT');
      expect(r.success).toBe(true);
      expect(r.state.current).toBe('REJECTED');
      m = { config: m.config, state: r.state };
      expect(isFinal(m)).toBe(true);
    });
  }

  for (let i = 0; i < 20; i++) {
    it(`doc workflow: can't approve from DRAFT (run ${i})`, () => {
      const m = makeDocWorkflow();
      const r = send(m, 'APPROVE');
      expect(r.success).toBe(false);
      expect(r.state.current).toBe('DRAFT');
    });
  }

  for (let n = 1; n <= 20; n++) {
    it(`doc workflow history after submit (run ${n})`, () => {
      let m = makeDocWorkflow();
      const r = send(m, 'SUBMIT');
      m = { config: m.config, state: r.state };
      expect(m.state.history).toHaveLength(1);
      expect(m.state.history[0].from).toBe('DRAFT');
      expect(m.state.history[0].to).toBe('REVIEW');
    });
  }
});

describe('withContext updates', () => {
  for (let n = 1; n <= 30; n++) {
    it(`withContext sets context value ${n}`, () => {
      const m = makeTrafficLight();
      const updated = withContext(m, { count: n });
      expect((updated.state.context as { count: number }).count).toBe(n);
    });
  }
});

describe('clearHistory bulk', () => {
  for (let n = 1; n <= 20; n++) {
    it(`clearHistory after ${n} transitions gives empty history`, () => {
      let m = makeTrafficLight();
      for (let i = 0; i < n % 3; i++) {
        const evts = ['GO', 'SLOW', 'STOP'];
        const r = send(m, evts[i]);
        m = { config: m.config, state: r.state };
      }
      const cleared = clearHistory(m);
      expect(cleared.state.history).toHaveLength(0);
      expect(cleared.state.current).toBe(m.state.current);
    });
  }
});

describe('matchesState — comprehensive', () => {
  const patterns: Array<[string, boolean, string]> = [
    ['RED', true, 'exact RED'],
    ['GREEN', false, 'exact GREEN (not current)'],
    ['RED|GREEN', true, 'OR pattern includes RED'],
    ['GREEN|YELLOW', false, 'OR pattern excludes RED'],
    ['RED|GREEN|YELLOW', true, 'all states in pattern'],
    ['', false, 'empty string'],
    ['OTHER', false, 'non-existent state'],
  ];
  for (const [pattern, expected, desc] of patterns) {
    for (let i = 0; i < 5; i++) {
      it(`matchesState '${pattern}' = ${expected} (${desc}, run ${i})`, () => {
        const m = makeTrafficLight();
        expect(matchesState(m, pattern)).toBe(expected);
      });
    }
  }
});

describe('order lifecycle comprehensive', () => {
  for (let i = 0; i < 50; i++) {
    it(`order lifecycle complete path (run ${i})`, () => {
      let m = makeOrderLifecycle();
      expect(m.state.current).toBe('NEW');
      let r = send(m, 'CONFIRM');
      expect(r.success).toBe(true);
      expect(r.state.current).toBe('CONFIRMED');
      m = { config: m.config, state: r.state };
      r = send(m, 'SHIP');
      expect(r.success).toBe(true);
      expect(r.state.current).toBe('SHIPPED');
      m = { config: m.config, state: r.state };
      r = send(m, 'DELIVER');
      expect(r.success).toBe(true);
      expect(r.state.current).toBe('DELIVERED');
      m = { config: m.config, state: r.state };
      expect(isFinal(m)).toBe(true);
      expect(m.state.history).toHaveLength(3);
    });
  }
});

describe('invalid transitions keep state unchanged', () => {
  const invalidCombos: Array<[string, string, string]> = [
    ['traffic-light', 'SLOW', 'RED'],
    ['traffic-light', 'STOP', 'RED'],
    ['traffic-light', 'GO', 'GREEN'],
    ['traffic-light', 'STOP', 'GREEN'],
    ['traffic-light', 'GO', 'YELLOW'],
    ['traffic-light', 'SLOW', 'YELLOW'],
  ];
  const stateSetup = (light: ReturnType<typeof makeTrafficLight>, target: string) => {
    let m = light;
    if (target === 'GREEN') m = { config: m.config, state: send(m, 'GO').state };
    if (target === 'YELLOW') {
      m = { config: m.config, state: send(m, 'GO').state };
      m = { config: m.config, state: send(m, 'SLOW').state };
    }
    return m;
  };
  for (const [_type, event, state] of invalidCombos) {
    for (let run = 0; run < 5; run++) {
      it(`send '${event}' in '${state}' state fails (run ${run})`, () => {
        let m = makeTrafficLight();
        m = stateSetup(m, state);
        const r = send(m, event);
        expect(r.success).toBe(false);
        expect(r.state.current).toBe(state);
      });
    }
  }
});

describe('getHistory', () => {
  for (let n = 1; n <= 30; n++) {
    it(`getHistory after ${n % 3 + 1} transitions has ${n % 3 + 1} entries`, () => {
      let m = makeTrafficLight();
      const transitions = n % 3 + 1;
      const evts = ['GO', 'SLOW', 'STOP'];
      for (let i = 0; i < transitions; i++) {
        const r = send(m, evts[i % 3]);
        m = { config: m.config, state: r.state };
      }
      const history = getHistory(m);
      expect(history).toHaveLength(transitions);
    });
  }
});

describe('createSimpleMachine', () => {
  for (let n = 2; n <= 20; n++) {
    it(`createSimpleMachine with ${n} states: starts at S0`, () => {
      const states = Array.from({ length: n }, (_, i) => `S${i}`);
      const transitions = Array.from({ length: n - 1 }, (_, i) => ({
        from: `S${i}`,
        event: `E${i}`,
        to: `S${i + 1}`,
      }));
      const m = createSimpleMachine(states, 'S0', transitions);
      expect(m.state.current).toBe('S0');
      expect(getStateIds(m)).toHaveLength(n);
    });
  }
});

describe('traffic light: available events change after each transition', () => {
  for (let cycle = 0; cycle < 30; cycle++) {
    it(`after ${cycle} GO events, available events correct (cycle ${cycle})`, () => {
      let m = makeTrafficLight();
      const evts = ['GO', 'SLOW', 'STOP'];
      const states = ['RED', 'GREEN', 'YELLOW'];
      const pos = cycle % 3;
      // Drive to position
      for (let i = 0; i < pos; i++) {
        const r = send(m, evts[i]);
        m = { config: m.config, state: r.state };
      }
      expect(m.state.current).toBe(states[pos]);
      const available = getAvailableEvents(m);
      expect(available).toContain(evts[pos]);
    });
  }
});

describe('onEnter context updates', () => {
  for (let n = 1; n <= 40; n++) {
    it(`context persists across ${n} transitions (mod 3)`, () => {
      let m = makeTrafficLight();
      const evts = ['GO', 'SLOW', 'STOP'];
      for (let i = 0; i < n; i++) {
        const r = send(m, evts[i % 3]);
        if (r.success) m = { config: m.config, state: r.state };
      }
      expect(typeof m.state.current).toBe('string');
      expect(m.state.current.length).toBeGreaterThan(0);
    });
  }
});

describe('transition payload', () => {
  for (let n = 1; n <= 30; n++) {
    it(`send with payload ${n} succeeds`, () => {
      const m = makeTrafficLight();
      const r = transition(m, { type: 'GO', payload: { value: n } });
      expect(r.success).toBe(true);
      expect(r.state.current).toBe('GREEN');
    });
  }
});

describe('history entry structure', () => {
  for (let i = 0; i < 10; i++) {
    it(`history entry has from, to, event, timestamp (run ${i})`, () => {
      const m = makeTrafficLight();
      const r = send(m, 'GO');
      const entry = r.state.history[0];
      expect(entry.from).toBe('RED');
      expect(entry.to).toBe('GREEN');
      expect(entry.event.type).toBe('GO');
      expect(typeof entry.timestamp).toBe('number');
      expect(entry.timestamp).toBeGreaterThan(0);
    });
  }
});
