// Copyright (c) 2026 Nexara DMCC. All rights reserved.
import {
  createFSM,
  getReachableStates,
  hasPath,
  getTransitionsFrom,
  getTransitionsTo,
  validateFSM,
  serializeFSM,
  FSMConfig,
  FSM,
} from "../finite-state-machine";

// ─── Shared configs ───────────────────────────────────────────────────────────

type TrafficState = "red" | "green" | "yellow";
type TrafficEvent = "GO" | "SLOW" | "STOP";

const trafficConfig: FSMConfig<TrafficState, TrafficEvent> = {
  initial: "red",
  states: ["red", "green", "yellow"],
  transitions: [
    { from: "red",    event: "GO",   to: "green"  },
    { from: "green",  event: "SLOW", to: "yellow" },
    { from: "yellow", event: "STOP", to: "red"    },
  ],
};

type LoginState = "idle" | "loading" | "authenticated" | "error";
type LoginEvent = "SUBMIT" | "SUCCESS" | "FAILURE" | "RETRY" | "LOGOUT";

const loginConfig: FSMConfig<LoginState, LoginEvent> = {
  initial: "idle",
  states: ["idle", "loading", "authenticated", "error"],
  final: ["authenticated"],
  transitions: [
    { from: "idle",          event: "SUBMIT",  to: "loading"       },
    { from: "loading",       event: "SUCCESS", to: "authenticated" },
    { from: "loading",       event: "FAILURE", to: "error"         },
    { from: "error",         event: "RETRY",   to: "loading"       },
    { from: "authenticated", event: "LOGOUT",  to: "idle"          },
  ],
};

type OrderState = "pending" | "processing" | "shipped" | "delivered" | "cancelled";
type OrderEvent = "PROCESS" | "SHIP" | "DELIVER" | "CANCEL";

const orderConfig: FSMConfig<OrderState, OrderEvent> = {
  initial: "pending",
  states: ["pending", "processing", "shipped", "delivered", "cancelled"],
  final: ["delivered", "cancelled"],
  transitions: [
    { from: "pending",    event: "PROCESS", to: "processing" },
    { from: "pending",    event: "CANCEL",  to: "cancelled"  },
    { from: "processing", event: "SHIP",    to: "shipped"    },
    { from: "processing", event: "CANCEL",  to: "cancelled"  },
    { from: "shipped",    event: "DELIVER", to: "delivered"  },
  ],
};

// Helper
function makeFSM<S extends string, E extends string>(cfg: FSMConfig<S, E>): FSM<S, E> {
  return createFSM(cfg);
}


describe('createFSM — initial state', () => {
  it('test 1: traffic FSM starts at red', () => {
    const fsm = createFSM(trafficConfig);
    expect(fsm.current).toBe('red');
  });
  it('test 2: traffic FSM starts at red', () => {
    const fsm = createFSM(trafficConfig);
    expect(fsm.current).toBe('red');
  });
  it('test 3: traffic FSM starts at red', () => {
    const fsm = createFSM(trafficConfig);
    expect(fsm.current).toBe('red');
  });
  it('test 4: traffic FSM starts at red', () => {
    const fsm = createFSM(trafficConfig);
    expect(fsm.current).toBe('red');
  });
  it('test 5: traffic FSM starts at red', () => {
    const fsm = createFSM(trafficConfig);
    expect(fsm.current).toBe('red');
  });
  it('test 6: traffic FSM starts at red', () => {
    const fsm = createFSM(trafficConfig);
    expect(fsm.current).toBe('red');
  });
  it('test 7: traffic FSM starts at red', () => {
    const fsm = createFSM(trafficConfig);
    expect(fsm.current).toBe('red');
  });
  it('test 8: traffic FSM starts at red', () => {
    const fsm = createFSM(trafficConfig);
    expect(fsm.current).toBe('red');
  });
  it('test 9: traffic FSM starts at red', () => {
    const fsm = createFSM(trafficConfig);
    expect(fsm.current).toBe('red');
  });
  it('test 10: traffic FSM starts at red', () => {
    const fsm = createFSM(trafficConfig);
    expect(fsm.current).toBe('red');
  });
  it('test 11: traffic FSM starts at red', () => {
    const fsm = createFSM(trafficConfig);
    expect(fsm.current).toBe('red');
  });
  it('test 12: traffic FSM starts at red', () => {
    const fsm = createFSM(trafficConfig);
    expect(fsm.current).toBe('red');
  });
  it('test 13: traffic FSM starts at red', () => {
    const fsm = createFSM(trafficConfig);
    expect(fsm.current).toBe('red');
  });
  it('test 14: traffic FSM starts at red', () => {
    const fsm = createFSM(trafficConfig);
    expect(fsm.current).toBe('red');
  });
  it('test 15: traffic FSM starts at red', () => {
    const fsm = createFSM(trafficConfig);
    expect(fsm.current).toBe('red');
  });
  it('test 16: traffic FSM starts at red', () => {
    const fsm = createFSM(trafficConfig);
    expect(fsm.current).toBe('red');
  });
  it('test 17: traffic FSM starts at red', () => {
    const fsm = createFSM(trafficConfig);
    expect(fsm.current).toBe('red');
  });
  it('test 18: traffic FSM starts at red', () => {
    const fsm = createFSM(trafficConfig);
    expect(fsm.current).toBe('red');
  });
  it('test 19: traffic FSM starts at red', () => {
    const fsm = createFSM(trafficConfig);
    expect(fsm.current).toBe('red');
  });
  it('test 20: traffic FSM starts at red', () => {
    const fsm = createFSM(trafficConfig);
    expect(fsm.current).toBe('red');
  });
  it('test 21: traffic FSM starts at red', () => {
    const fsm = createFSM(trafficConfig);
    expect(fsm.current).toBe('red');
  });
  it('test 22: traffic FSM starts at red', () => {
    const fsm = createFSM(trafficConfig);
    expect(fsm.current).toBe('red');
  });
  it('test 23: traffic FSM starts at red', () => {
    const fsm = createFSM(trafficConfig);
    expect(fsm.current).toBe('red');
  });
  it('test 24: traffic FSM starts at red', () => {
    const fsm = createFSM(trafficConfig);
    expect(fsm.current).toBe('red');
  });
  it('test 25: traffic FSM starts at red', () => {
    const fsm = createFSM(trafficConfig);
    expect(fsm.current).toBe('red');
  });
  it('test 26: traffic FSM starts at red', () => {
    const fsm = createFSM(trafficConfig);
    expect(fsm.current).toBe('red');
  });
  it('test 27: traffic FSM starts at red', () => {
    const fsm = createFSM(trafficConfig);
    expect(fsm.current).toBe('red');
  });
  it('test 28: traffic FSM starts at red', () => {
    const fsm = createFSM(trafficConfig);
    expect(fsm.current).toBe('red');
  });
  it('test 29: traffic FSM starts at red', () => {
    const fsm = createFSM(trafficConfig);
    expect(fsm.current).toBe('red');
  });
  it('test 30: traffic FSM starts at red', () => {
    const fsm = createFSM(trafficConfig);
    expect(fsm.current).toBe('red');
  });
  it('test 31: traffic FSM starts at red', () => {
    const fsm = createFSM(trafficConfig);
    expect(fsm.current).toBe('red');
  });
  it('test 32: traffic FSM starts at red', () => {
    const fsm = createFSM(trafficConfig);
    expect(fsm.current).toBe('red');
  });
  it('test 33: traffic FSM starts at red', () => {
    const fsm = createFSM(trafficConfig);
    expect(fsm.current).toBe('red');
  });
  it('test 34: traffic FSM starts at red', () => {
    const fsm = createFSM(trafficConfig);
    expect(fsm.current).toBe('red');
  });
  it('test 35: traffic FSM starts at red', () => {
    const fsm = createFSM(trafficConfig);
    expect(fsm.current).toBe('red');
  });
  it('test 36: traffic FSM starts at red', () => {
    const fsm = createFSM(trafficConfig);
    expect(fsm.current).toBe('red');
  });
  it('test 37: traffic FSM starts at red', () => {
    const fsm = createFSM(trafficConfig);
    expect(fsm.current).toBe('red');
  });
  it('test 38: traffic FSM starts at red', () => {
    const fsm = createFSM(trafficConfig);
    expect(fsm.current).toBe('red');
  });
  it('test 39: traffic FSM starts at red', () => {
    const fsm = createFSM(trafficConfig);
    expect(fsm.current).toBe('red');
  });
  it('test 40: traffic FSM starts at red', () => {
    const fsm = createFSM(trafficConfig);
    expect(fsm.current).toBe('red');
  });
  it('test 41: traffic FSM starts at red', () => {
    const fsm = createFSM(trafficConfig);
    expect(fsm.current).toBe('red');
  });
  it('test 42: traffic FSM starts at red', () => {
    const fsm = createFSM(trafficConfig);
    expect(fsm.current).toBe('red');
  });
  it('test 43: traffic FSM starts at red', () => {
    const fsm = createFSM(trafficConfig);
    expect(fsm.current).toBe('red');
  });
  it('test 44: traffic FSM starts at red', () => {
    const fsm = createFSM(trafficConfig);
    expect(fsm.current).toBe('red');
  });
  it('test 45: traffic FSM starts at red', () => {
    const fsm = createFSM(trafficConfig);
    expect(fsm.current).toBe('red');
  });
  it('test 46: traffic FSM starts at red', () => {
    const fsm = createFSM(trafficConfig);
    expect(fsm.current).toBe('red');
  });
  it('test 47: traffic FSM starts at red', () => {
    const fsm = createFSM(trafficConfig);
    expect(fsm.current).toBe('red');
  });
  it('test 48: traffic FSM starts at red', () => {
    const fsm = createFSM(trafficConfig);
    expect(fsm.current).toBe('red');
  });
  it('test 49: traffic FSM starts at red', () => {
    const fsm = createFSM(trafficConfig);
    expect(fsm.current).toBe('red');
  });
  it('test 50: traffic FSM starts at red', () => {
    const fsm = createFSM(trafficConfig);
    expect(fsm.current).toBe('red');
  });
  it('test 51: traffic FSM starts at red', () => {
    const fsm = createFSM(trafficConfig);
    expect(fsm.current).toBe('red');
  });
  it('test 52: traffic FSM starts at red', () => {
    const fsm = createFSM(trafficConfig);
    expect(fsm.current).toBe('red');
  });
  it('test 53: traffic FSM starts at red', () => {
    const fsm = createFSM(trafficConfig);
    expect(fsm.current).toBe('red');
  });
  it('test 54: traffic FSM starts at red', () => {
    const fsm = createFSM(trafficConfig);
    expect(fsm.current).toBe('red');
  });
  it('test 55: traffic FSM starts at red', () => {
    const fsm = createFSM(trafficConfig);
    expect(fsm.current).toBe('red');
  });
  it('test 56: traffic FSM starts at red', () => {
    const fsm = createFSM(trafficConfig);
    expect(fsm.current).toBe('red');
  });
  it('test 57: traffic FSM starts at red', () => {
    const fsm = createFSM(trafficConfig);
    expect(fsm.current).toBe('red');
  });
  it('test 58: traffic FSM starts at red', () => {
    const fsm = createFSM(trafficConfig);
    expect(fsm.current).toBe('red');
  });
  it('test 59: traffic FSM starts at red', () => {
    const fsm = createFSM(trafficConfig);
    expect(fsm.current).toBe('red');
  });
  it('test 60: traffic FSM starts at red', () => {
    const fsm = createFSM(trafficConfig);
    expect(fsm.current).toBe('red');
  });
  it('test 61: traffic FSM starts at red', () => {
    const fsm = createFSM(trafficConfig);
    expect(fsm.current).toBe('red');
  });
  it('test 62: traffic FSM starts at red', () => {
    const fsm = createFSM(trafficConfig);
    expect(fsm.current).toBe('red');
  });
  it('test 63: traffic FSM starts at red', () => {
    const fsm = createFSM(trafficConfig);
    expect(fsm.current).toBe('red');
  });
  it('test 64: traffic FSM starts at red', () => {
    const fsm = createFSM(trafficConfig);
    expect(fsm.current).toBe('red');
  });
  it('test 65: traffic FSM starts at red', () => {
    const fsm = createFSM(trafficConfig);
    expect(fsm.current).toBe('red');
  });
  it('test 66: traffic FSM starts at red', () => {
    const fsm = createFSM(trafficConfig);
    expect(fsm.current).toBe('red');
  });
  it('test 67: traffic FSM starts at red', () => {
    const fsm = createFSM(trafficConfig);
    expect(fsm.current).toBe('red');
  });
  it('test 68: traffic FSM starts at red', () => {
    const fsm = createFSM(trafficConfig);
    expect(fsm.current).toBe('red');
  });
  it('test 69: traffic FSM starts at red', () => {
    const fsm = createFSM(trafficConfig);
    expect(fsm.current).toBe('red');
  });
  it('test 70: traffic FSM starts at red', () => {
    const fsm = createFSM(trafficConfig);
    expect(fsm.current).toBe('red');
  });
  it('test 71: traffic FSM starts at red', () => {
    const fsm = createFSM(trafficConfig);
    expect(fsm.current).toBe('red');
  });
  it('test 72: traffic FSM starts at red', () => {
    const fsm = createFSM(trafficConfig);
    expect(fsm.current).toBe('red');
  });
  it('test 73: traffic FSM starts at red', () => {
    const fsm = createFSM(trafficConfig);
    expect(fsm.current).toBe('red');
  });
  it('test 74: traffic FSM starts at red', () => {
    const fsm = createFSM(trafficConfig);
    expect(fsm.current).toBe('red');
  });
  it('test 75: traffic FSM starts at red', () => {
    const fsm = createFSM(trafficConfig);
    expect(fsm.current).toBe('red');
  });
  it('test 76: traffic FSM starts at red', () => {
    const fsm = createFSM(trafficConfig);
    expect(fsm.current).toBe('red');
  });
  it('test 77: traffic FSM starts at red', () => {
    const fsm = createFSM(trafficConfig);
    expect(fsm.current).toBe('red');
  });
  it('test 78: traffic FSM starts at red', () => {
    const fsm = createFSM(trafficConfig);
    expect(fsm.current).toBe('red');
  });
  it('test 79: traffic FSM starts at red', () => {
    const fsm = createFSM(trafficConfig);
    expect(fsm.current).toBe('red');
  });
  it('test 80: traffic FSM starts at red', () => {
    const fsm = createFSM(trafficConfig);
    expect(fsm.current).toBe('red');
  });
  it('test 81: traffic FSM starts at red', () => {
    const fsm = createFSM(trafficConfig);
    expect(fsm.current).toBe('red');
  });
  it('test 82: traffic FSM starts at red', () => {
    const fsm = createFSM(trafficConfig);
    expect(fsm.current).toBe('red');
  });
  it('test 83: traffic FSM starts at red', () => {
    const fsm = createFSM(trafficConfig);
    expect(fsm.current).toBe('red');
  });
  it('test 84: traffic FSM starts at red', () => {
    const fsm = createFSM(trafficConfig);
    expect(fsm.current).toBe('red');
  });
  it('test 85: traffic FSM starts at red', () => {
    const fsm = createFSM(trafficConfig);
    expect(fsm.current).toBe('red');
  });
  it('test 86: traffic FSM starts at red', () => {
    const fsm = createFSM(trafficConfig);
    expect(fsm.current).toBe('red');
  });
  it('test 87: traffic FSM starts at red', () => {
    const fsm = createFSM(trafficConfig);
    expect(fsm.current).toBe('red');
  });
  it('test 88: traffic FSM starts at red', () => {
    const fsm = createFSM(trafficConfig);
    expect(fsm.current).toBe('red');
  });
  it('test 89: traffic FSM starts at red', () => {
    const fsm = createFSM(trafficConfig);
    expect(fsm.current).toBe('red');
  });
  it('test 90: traffic FSM starts at red', () => {
    const fsm = createFSM(trafficConfig);
    expect(fsm.current).toBe('red');
  });
  it('test 91: traffic FSM starts at red', () => {
    const fsm = createFSM(trafficConfig);
    expect(fsm.current).toBe('red');
  });
  it('test 92: traffic FSM starts at red', () => {
    const fsm = createFSM(trafficConfig);
    expect(fsm.current).toBe('red');
  });
  it('test 93: traffic FSM starts at red', () => {
    const fsm = createFSM(trafficConfig);
    expect(fsm.current).toBe('red');
  });
  it('test 94: traffic FSM starts at red', () => {
    const fsm = createFSM(trafficConfig);
    expect(fsm.current).toBe('red');
  });
  it('test 95: traffic FSM starts at red', () => {
    const fsm = createFSM(trafficConfig);
    expect(fsm.current).toBe('red');
  });
  it('test 96: traffic FSM starts at red', () => {
    const fsm = createFSM(trafficConfig);
    expect(fsm.current).toBe('red');
  });
  it('test 97: traffic FSM starts at red', () => {
    const fsm = createFSM(trafficConfig);
    expect(fsm.current).toBe('red');
  });
  it('test 98: traffic FSM starts at red', () => {
    const fsm = createFSM(trafficConfig);
    expect(fsm.current).toBe('red');
  });
  it('test 99: traffic FSM starts at red', () => {
    const fsm = createFSM(trafficConfig);
    expect(fsm.current).toBe('red');
  });
  it('test 100: traffic FSM starts at red', () => {
    const fsm = createFSM(trafficConfig);
    expect(fsm.current).toBe('red');
  });
  it('login FSM starts at idle (101)', () => {
    expect(createFSM(loginConfig).current).toBe('idle');
  });
  it('order FSM starts at pending (102)', () => {
    expect(createFSM(orderConfig).current).toBe('pending');
  });
  it('initial state is included in history (103)', () => {
    const fsm = createFSM(trafficConfig);
    expect(fsm.history()).toContain('red');
  });
  it('history length is 1 at start (104)', () => {
    expect(createFSM(trafficConfig).history()).toHaveLength(1);
  });
  it('isIn(initial) returns true (105)', () => {
    expect(createFSM(trafficConfig).isIn('red')).toBe(true);
  });
  it('matches(initial) returns true (106)', () => {
    expect(createFSM(trafficConfig).matches('red')).toBe(true);
  });
  it('isFinal false on non-final initial state (107)', () => {
    expect(createFSM(trafficConfig).isFinal()).toBe(false);
  });
  it('throws when initial state not in states list (108)', () => {
    expect(() => createFSM({ initial: 'x' as 'red', states: ['red'], transitions: [] })).toThrow();
  });
  it('login initial not final (109)', () => {
    expect(createFSM(loginConfig).isFinal()).toBe(false);
  });
  it('order initial not final (110)', () => {
    expect(createFSM(orderConfig).isFinal()).toBe(false);
  });
});

describe('FSM.send — transitions', () => {
  it('traffic cycle 0 step 1: GO red->green', () => {
    const fsm = createFSM(trafficConfig);
    fsm.send('GO');
    expect(fsm.current).toBe('green');
  });
  it('traffic cycle 0 step 2: SLOW green->yellow', () => {
    const fsm = createFSM(trafficConfig);
    fsm.send('GO').send('SLOW');
    expect(fsm.current).toBe('yellow');
  });
  it('traffic cycle 0 step 3: STOP yellow->red', () => {
    const fsm = createFSM(trafficConfig);
    fsm.send('GO').send('SLOW').send('STOP');
    expect(fsm.current).toBe('red');
  });
  it('traffic cycle 0 invalid event stays same', () => {
    const fsm = createFSM(trafficConfig);
    fsm.send('SLOW');
    expect(fsm.current).toBe('red');
  });
  it('traffic cycle 0 double cycle', () => {
    const fsm = createFSM(trafficConfig);
    fsm.send('GO').send('SLOW').send('STOP').send('GO');
    expect(fsm.current).toBe('green');
  });
  it('traffic cycle 1 step 1: GO red->green', () => {
    const fsm = createFSM(trafficConfig);
    fsm.send('GO');
    expect(fsm.current).toBe('green');
  });
  it('traffic cycle 1 step 2: SLOW green->yellow', () => {
    const fsm = createFSM(trafficConfig);
    fsm.send('GO').send('SLOW');
    expect(fsm.current).toBe('yellow');
  });
  it('traffic cycle 1 step 3: STOP yellow->red', () => {
    const fsm = createFSM(trafficConfig);
    fsm.send('GO').send('SLOW').send('STOP');
    expect(fsm.current).toBe('red');
  });
  it('traffic cycle 1 invalid event stays same', () => {
    const fsm = createFSM(trafficConfig);
    fsm.send('SLOW');
    expect(fsm.current).toBe('red');
  });
  it('traffic cycle 1 double cycle', () => {
    const fsm = createFSM(trafficConfig);
    fsm.send('GO').send('SLOW').send('STOP').send('GO');
    expect(fsm.current).toBe('green');
  });
  it('traffic cycle 2 step 1: GO red->green', () => {
    const fsm = createFSM(trafficConfig);
    fsm.send('GO');
    expect(fsm.current).toBe('green');
  });
  it('traffic cycle 2 step 2: SLOW green->yellow', () => {
    const fsm = createFSM(trafficConfig);
    fsm.send('GO').send('SLOW');
    expect(fsm.current).toBe('yellow');
  });
  it('traffic cycle 2 step 3: STOP yellow->red', () => {
    const fsm = createFSM(trafficConfig);
    fsm.send('GO').send('SLOW').send('STOP');
    expect(fsm.current).toBe('red');
  });
  it('traffic cycle 2 invalid event stays same', () => {
    const fsm = createFSM(trafficConfig);
    fsm.send('SLOW');
    expect(fsm.current).toBe('red');
  });
  it('traffic cycle 2 double cycle', () => {
    const fsm = createFSM(trafficConfig);
    fsm.send('GO').send('SLOW').send('STOP').send('GO');
    expect(fsm.current).toBe('green');
  });
  it('traffic cycle 3 step 1: GO red->green', () => {
    const fsm = createFSM(trafficConfig);
    fsm.send('GO');
    expect(fsm.current).toBe('green');
  });
  it('traffic cycle 3 step 2: SLOW green->yellow', () => {
    const fsm = createFSM(trafficConfig);
    fsm.send('GO').send('SLOW');
    expect(fsm.current).toBe('yellow');
  });
  it('traffic cycle 3 step 3: STOP yellow->red', () => {
    const fsm = createFSM(trafficConfig);
    fsm.send('GO').send('SLOW').send('STOP');
    expect(fsm.current).toBe('red');
  });
  it('traffic cycle 3 invalid event stays same', () => {
    const fsm = createFSM(trafficConfig);
    fsm.send('SLOW');
    expect(fsm.current).toBe('red');
  });
  it('traffic cycle 3 double cycle', () => {
    const fsm = createFSM(trafficConfig);
    fsm.send('GO').send('SLOW').send('STOP').send('GO');
    expect(fsm.current).toBe('green');
  });
  it('traffic cycle 4 step 1: GO red->green', () => {
    const fsm = createFSM(trafficConfig);
    fsm.send('GO');
    expect(fsm.current).toBe('green');
  });
  it('traffic cycle 4 step 2: SLOW green->yellow', () => {
    const fsm = createFSM(trafficConfig);
    fsm.send('GO').send('SLOW');
    expect(fsm.current).toBe('yellow');
  });
  it('traffic cycle 4 step 3: STOP yellow->red', () => {
    const fsm = createFSM(trafficConfig);
    fsm.send('GO').send('SLOW').send('STOP');
    expect(fsm.current).toBe('red');
  });
  it('traffic cycle 4 invalid event stays same', () => {
    const fsm = createFSM(trafficConfig);
    fsm.send('SLOW');
    expect(fsm.current).toBe('red');
  });
  it('traffic cycle 4 double cycle', () => {
    const fsm = createFSM(trafficConfig);
    fsm.send('GO').send('SLOW').send('STOP').send('GO');
    expect(fsm.current).toBe('green');
  });
  it('traffic cycle 5 step 1: GO red->green', () => {
    const fsm = createFSM(trafficConfig);
    fsm.send('GO');
    expect(fsm.current).toBe('green');
  });
  it('traffic cycle 5 step 2: SLOW green->yellow', () => {
    const fsm = createFSM(trafficConfig);
    fsm.send('GO').send('SLOW');
    expect(fsm.current).toBe('yellow');
  });
  it('traffic cycle 5 step 3: STOP yellow->red', () => {
    const fsm = createFSM(trafficConfig);
    fsm.send('GO').send('SLOW').send('STOP');
    expect(fsm.current).toBe('red');
  });
  it('traffic cycle 5 invalid event stays same', () => {
    const fsm = createFSM(trafficConfig);
    fsm.send('SLOW');
    expect(fsm.current).toBe('red');
  });
  it('traffic cycle 5 double cycle', () => {
    const fsm = createFSM(trafficConfig);
    fsm.send('GO').send('SLOW').send('STOP').send('GO');
    expect(fsm.current).toBe('green');
  });
  it('traffic cycle 6 step 1: GO red->green', () => {
    const fsm = createFSM(trafficConfig);
    fsm.send('GO');
    expect(fsm.current).toBe('green');
  });
  it('traffic cycle 6 step 2: SLOW green->yellow', () => {
    const fsm = createFSM(trafficConfig);
    fsm.send('GO').send('SLOW');
    expect(fsm.current).toBe('yellow');
  });
  it('traffic cycle 6 step 3: STOP yellow->red', () => {
    const fsm = createFSM(trafficConfig);
    fsm.send('GO').send('SLOW').send('STOP');
    expect(fsm.current).toBe('red');
  });
  it('traffic cycle 6 invalid event stays same', () => {
    const fsm = createFSM(trafficConfig);
    fsm.send('SLOW');
    expect(fsm.current).toBe('red');
  });
  it('traffic cycle 6 double cycle', () => {
    const fsm = createFSM(trafficConfig);
    fsm.send('GO').send('SLOW').send('STOP').send('GO');
    expect(fsm.current).toBe('green');
  });
  it('traffic cycle 7 step 1: GO red->green', () => {
    const fsm = createFSM(trafficConfig);
    fsm.send('GO');
    expect(fsm.current).toBe('green');
  });
  it('traffic cycle 7 step 2: SLOW green->yellow', () => {
    const fsm = createFSM(trafficConfig);
    fsm.send('GO').send('SLOW');
    expect(fsm.current).toBe('yellow');
  });
  it('traffic cycle 7 step 3: STOP yellow->red', () => {
    const fsm = createFSM(trafficConfig);
    fsm.send('GO').send('SLOW').send('STOP');
    expect(fsm.current).toBe('red');
  });
  it('traffic cycle 7 invalid event stays same', () => {
    const fsm = createFSM(trafficConfig);
    fsm.send('SLOW');
    expect(fsm.current).toBe('red');
  });
  it('traffic cycle 7 double cycle', () => {
    const fsm = createFSM(trafficConfig);
    fsm.send('GO').send('SLOW').send('STOP').send('GO');
    expect(fsm.current).toBe('green');
  });
});

describe('FSM.can — event availability', () => {
  it('can test 0a: can GO from red', () => {
    expect(createFSM(trafficConfig).can('GO')).toBe(true);
  });
  it('can test 0b: cannot SLOW from red', () => {
    expect(createFSM(trafficConfig).can('SLOW')).toBe(false);
  });
  it('can test 0c: cannot STOP from red', () => {
    expect(createFSM(trafficConfig).can('STOP')).toBe(false);
  });
  it('can test 0d: can SLOW from green', () => {
    const fsm = createFSM(trafficConfig); fsm.send('GO');
    expect(fsm.can('SLOW')).toBe(true);
  });
  it('can test 0e: can STOP from yellow', () => {
    const fsm = createFSM(trafficConfig); fsm.send('GO').send('SLOW');
    expect(fsm.can('STOP')).toBe(true);
  });
  it('can test 1a: can GO from red', () => {
    expect(createFSM(trafficConfig).can('GO')).toBe(true);
  });
  it('can test 1b: cannot SLOW from red', () => {
    expect(createFSM(trafficConfig).can('SLOW')).toBe(false);
  });
  it('can test 1c: cannot STOP from red', () => {
    expect(createFSM(trafficConfig).can('STOP')).toBe(false);
  });
  it('can test 1d: can SLOW from green', () => {
    const fsm = createFSM(trafficConfig); fsm.send('GO');
    expect(fsm.can('SLOW')).toBe(true);
  });
  it('can test 1e: can STOP from yellow', () => {
    const fsm = createFSM(trafficConfig); fsm.send('GO').send('SLOW');
    expect(fsm.can('STOP')).toBe(true);
  });
  it('can test 2a: can GO from red', () => {
    expect(createFSM(trafficConfig).can('GO')).toBe(true);
  });
  it('can test 2b: cannot SLOW from red', () => {
    expect(createFSM(trafficConfig).can('SLOW')).toBe(false);
  });
  it('can test 2c: cannot STOP from red', () => {
    expect(createFSM(trafficConfig).can('STOP')).toBe(false);
  });
  it('can test 2d: can SLOW from green', () => {
    const fsm = createFSM(trafficConfig); fsm.send('GO');
    expect(fsm.can('SLOW')).toBe(true);
  });
  it('can test 2e: can STOP from yellow', () => {
    const fsm = createFSM(trafficConfig); fsm.send('GO').send('SLOW');
    expect(fsm.can('STOP')).toBe(true);
  });
  it('can test 3a: can GO from red', () => {
    expect(createFSM(trafficConfig).can('GO')).toBe(true);
  });
  it('can test 3b: cannot SLOW from red', () => {
    expect(createFSM(trafficConfig).can('SLOW')).toBe(false);
  });
  it('can test 3c: cannot STOP from red', () => {
    expect(createFSM(trafficConfig).can('STOP')).toBe(false);
  });
  it('can test 3d: can SLOW from green', () => {
    const fsm = createFSM(trafficConfig); fsm.send('GO');
    expect(fsm.can('SLOW')).toBe(true);
  });
  it('can test 3e: can STOP from yellow', () => {
    const fsm = createFSM(trafficConfig); fsm.send('GO').send('SLOW');
    expect(fsm.can('STOP')).toBe(true);
  });
  it('can test 4a: can GO from red', () => {
    expect(createFSM(trafficConfig).can('GO')).toBe(true);
  });
  it('can test 4b: cannot SLOW from red', () => {
    expect(createFSM(trafficConfig).can('SLOW')).toBe(false);
  });
  it('can test 4c: cannot STOP from red', () => {
    expect(createFSM(trafficConfig).can('STOP')).toBe(false);
  });
  it('can test 4d: can SLOW from green', () => {
    const fsm = createFSM(trafficConfig); fsm.send('GO');
    expect(fsm.can('SLOW')).toBe(true);
  });
  it('can test 4e: can STOP from yellow', () => {
    const fsm = createFSM(trafficConfig); fsm.send('GO').send('SLOW');
    expect(fsm.can('STOP')).toBe(true);
  });
  it('can test 5a: can GO from red', () => {
    expect(createFSM(trafficConfig).can('GO')).toBe(true);
  });
  it('can test 5b: cannot SLOW from red', () => {
    expect(createFSM(trafficConfig).can('SLOW')).toBe(false);
  });
  it('can test 5c: cannot STOP from red', () => {
    expect(createFSM(trafficConfig).can('STOP')).toBe(false);
  });
  it('can test 5d: can SLOW from green', () => {
    const fsm = createFSM(trafficConfig); fsm.send('GO');
    expect(fsm.can('SLOW')).toBe(true);
  });
  it('can test 5e: can STOP from yellow', () => {
    const fsm = createFSM(trafficConfig); fsm.send('GO').send('SLOW');
    expect(fsm.can('STOP')).toBe(true);
  });
  it('can test 6a: can GO from red', () => {
    expect(createFSM(trafficConfig).can('GO')).toBe(true);
  });
  it('can test 6b: cannot SLOW from red', () => {
    expect(createFSM(trafficConfig).can('SLOW')).toBe(false);
  });
  it('can test 6c: cannot STOP from red', () => {
    expect(createFSM(trafficConfig).can('STOP')).toBe(false);
  });
  it('can test 6d: can SLOW from green', () => {
    const fsm = createFSM(trafficConfig); fsm.send('GO');
    expect(fsm.can('SLOW')).toBe(true);
  });
  it('can test 6e: can STOP from yellow', () => {
    const fsm = createFSM(trafficConfig); fsm.send('GO').send('SLOW');
    expect(fsm.can('STOP')).toBe(true);
  });
  it('can test 7a: can GO from red', () => {
    expect(createFSM(trafficConfig).can('GO')).toBe(true);
  });
  it('can test 7b: cannot SLOW from red', () => {
    expect(createFSM(trafficConfig).can('SLOW')).toBe(false);
  });
  it('can test 7c: cannot STOP from red', () => {
    expect(createFSM(trafficConfig).can('STOP')).toBe(false);
  });
  it('can test 7d: can SLOW from green', () => {
    const fsm = createFSM(trafficConfig); fsm.send('GO');
    expect(fsm.can('SLOW')).toBe(true);
  });
  it('can test 7e: can STOP from yellow', () => {
    const fsm = createFSM(trafficConfig); fsm.send('GO').send('SLOW');
    expect(fsm.can('STOP')).toBe(true);
  });
  it('can test 8a: can GO from red', () => {
    expect(createFSM(trafficConfig).can('GO')).toBe(true);
  });
  it('can test 8b: cannot SLOW from red', () => {
    expect(createFSM(trafficConfig).can('SLOW')).toBe(false);
  });
  it('can test 8c: cannot STOP from red', () => {
    expect(createFSM(trafficConfig).can('STOP')).toBe(false);
  });
  it('can test 8d: can SLOW from green', () => {
    const fsm = createFSM(trafficConfig); fsm.send('GO');
    expect(fsm.can('SLOW')).toBe(true);
  });
  it('can test 8e: can STOP from yellow', () => {
    const fsm = createFSM(trafficConfig); fsm.send('GO').send('SLOW');
    expect(fsm.can('STOP')).toBe(true);
  });
  it('can test 9a: can GO from red', () => {
    expect(createFSM(trafficConfig).can('GO')).toBe(true);
  });
  it('can test 9b: cannot SLOW from red', () => {
    expect(createFSM(trafficConfig).can('SLOW')).toBe(false);
  });
  it('can test 9c: cannot STOP from red', () => {
    expect(createFSM(trafficConfig).can('STOP')).toBe(false);
  });
  it('can test 9d: can SLOW from green', () => {
    const fsm = createFSM(trafficConfig); fsm.send('GO');
    expect(fsm.can('SLOW')).toBe(true);
  });
  it('can test 9e: can STOP from yellow', () => {
    const fsm = createFSM(trafficConfig); fsm.send('GO').send('SLOW');
    expect(fsm.can('STOP')).toBe(true);
  });
  it('can test 10a: can GO from red', () => {
    expect(createFSM(trafficConfig).can('GO')).toBe(true);
  });
  it('can test 10b: cannot SLOW from red', () => {
    expect(createFSM(trafficConfig).can('SLOW')).toBe(false);
  });
  it('can test 10c: cannot STOP from red', () => {
    expect(createFSM(trafficConfig).can('STOP')).toBe(false);
  });
  it('can test 10d: can SLOW from green', () => {
    const fsm = createFSM(trafficConfig); fsm.send('GO');
    expect(fsm.can('SLOW')).toBe(true);
  });
  it('can test 10e: can STOP from yellow', () => {
    const fsm = createFSM(trafficConfig); fsm.send('GO').send('SLOW');
    expect(fsm.can('STOP')).toBe(true);
  });
  it('can test 11a: can GO from red', () => {
    expect(createFSM(trafficConfig).can('GO')).toBe(true);
  });
  it('can test 11b: cannot SLOW from red', () => {
    expect(createFSM(trafficConfig).can('SLOW')).toBe(false);
  });
  it('can test 11c: cannot STOP from red', () => {
    expect(createFSM(trafficConfig).can('STOP')).toBe(false);
  });
  it('can test 11d: can SLOW from green', () => {
    const fsm = createFSM(trafficConfig); fsm.send('GO');
    expect(fsm.can('SLOW')).toBe(true);
  });
  it('login can 0a: can SUBMIT from idle', () => { expect(createFSM(loginConfig).can('SUBMIT')).toBe(true); });
  it('login can 0b: cannot SUCCESS from idle', () => { expect(createFSM(loginConfig).can('SUCCESS')).toBe(false); });
  it('login can 0c: cannot FAILURE from idle', () => { expect(createFSM(loginConfig).can('FAILURE')).toBe(false); });
  it('login can 0d: can SUCCESS from loading', () => { const f = createFSM(loginConfig); f.send('SUBMIT'); expect(f.can('SUCCESS')).toBe(true); });
  it('login can 0e: can FAILURE from loading', () => { const f = createFSM(loginConfig); f.send('SUBMIT'); expect(f.can('FAILURE')).toBe(true); });
  it('login can 1a: can SUBMIT from idle', () => { expect(createFSM(loginConfig).can('SUBMIT')).toBe(true); });
  it('login can 1b: cannot SUCCESS from idle', () => { expect(createFSM(loginConfig).can('SUCCESS')).toBe(false); });
  it('login can 1c: cannot FAILURE from idle', () => { expect(createFSM(loginConfig).can('FAILURE')).toBe(false); });
  it('login can 1d: can SUCCESS from loading', () => { const f = createFSM(loginConfig); f.send('SUBMIT'); expect(f.can('SUCCESS')).toBe(true); });
  it('login can 1e: can FAILURE from loading', () => { const f = createFSM(loginConfig); f.send('SUBMIT'); expect(f.can('FAILURE')).toBe(true); });
  it('login can 2a: can SUBMIT from idle', () => { expect(createFSM(loginConfig).can('SUBMIT')).toBe(true); });
  it('login can 2b: cannot SUCCESS from idle', () => { expect(createFSM(loginConfig).can('SUCCESS')).toBe(false); });
  it('login can 2c: cannot FAILURE from idle', () => { expect(createFSM(loginConfig).can('FAILURE')).toBe(false); });
  it('login can 2d: can SUCCESS from loading', () => { const f = createFSM(loginConfig); f.send('SUBMIT'); expect(f.can('SUCCESS')).toBe(true); });
  it('login can 2e: can FAILURE from loading', () => { const f = createFSM(loginConfig); f.send('SUBMIT'); expect(f.can('FAILURE')).toBe(true); });
  it('login can 3a: can SUBMIT from idle', () => { expect(createFSM(loginConfig).can('SUBMIT')).toBe(true); });
  it('login can 3b: cannot SUCCESS from idle', () => { expect(createFSM(loginConfig).can('SUCCESS')).toBe(false); });
  it('login can 3c: cannot FAILURE from idle', () => { expect(createFSM(loginConfig).can('FAILURE')).toBe(false); });
  it('login can 3d: can SUCCESS from loading', () => { const f = createFSM(loginConfig); f.send('SUBMIT'); expect(f.can('SUCCESS')).toBe(true); });
  it('login can 3e: can FAILURE from loading', () => { const f = createFSM(loginConfig); f.send('SUBMIT'); expect(f.can('FAILURE')).toBe(true); });
  it('login can 4a: can SUBMIT from idle', () => { expect(createFSM(loginConfig).can('SUBMIT')).toBe(true); });
  it('login can 4b: cannot SUCCESS from idle', () => { expect(createFSM(loginConfig).can('SUCCESS')).toBe(false); });
  it('login can 4c: cannot FAILURE from idle', () => { expect(createFSM(loginConfig).can('FAILURE')).toBe(false); });
  it('login can 4d: can SUCCESS from loading', () => { const f = createFSM(loginConfig); f.send('SUBMIT'); expect(f.can('SUCCESS')).toBe(true); });
  it('login can 4e: can FAILURE from loading', () => { const f = createFSM(loginConfig); f.send('SUBMIT'); expect(f.can('FAILURE')).toBe(true); });
  it('login can 5a: can SUBMIT from idle', () => { expect(createFSM(loginConfig).can('SUBMIT')).toBe(true); });
  it('login can 5b: cannot SUCCESS from idle', () => { expect(createFSM(loginConfig).can('SUCCESS')).toBe(false); });
  it('login can 5c: cannot FAILURE from idle', () => { expect(createFSM(loginConfig).can('FAILURE')).toBe(false); });
  it('login can 5d: can SUCCESS from loading', () => { const f = createFSM(loginConfig); f.send('SUBMIT'); expect(f.can('SUCCESS')).toBe(true); });
  it('login can 5e: can FAILURE from loading', () => { const f = createFSM(loginConfig); f.send('SUBMIT'); expect(f.can('FAILURE')).toBe(true); });
  it('login can 6a: can SUBMIT from idle', () => { expect(createFSM(loginConfig).can('SUBMIT')).toBe(true); });
  it('login can 6b: cannot SUCCESS from idle', () => { expect(createFSM(loginConfig).can('SUCCESS')).toBe(false); });
  it('login can 6c: cannot FAILURE from idle', () => { expect(createFSM(loginConfig).can('FAILURE')).toBe(false); });
  it('login can 6d: can SUCCESS from loading', () => { const f = createFSM(loginConfig); f.send('SUBMIT'); expect(f.can('SUCCESS')).toBe(true); });
  it('login can 6e: can FAILURE from loading', () => { const f = createFSM(loginConfig); f.send('SUBMIT'); expect(f.can('FAILURE')).toBe(true); });
  it('login can 7a: can SUBMIT from idle', () => { expect(createFSM(loginConfig).can('SUBMIT')).toBe(true); });
  it('login can 7b: cannot SUCCESS from idle', () => { expect(createFSM(loginConfig).can('SUCCESS')).toBe(false); });
  it('login can 7c: cannot FAILURE from idle', () => { expect(createFSM(loginConfig).can('FAILURE')).toBe(false); });
  it('login can 7d: can SUCCESS from loading', () => { const f = createFSM(loginConfig); f.send('SUBMIT'); expect(f.can('SUCCESS')).toBe(true); });
  it('login can 7e: can FAILURE from loading', () => { const f = createFSM(loginConfig); f.send('SUBMIT'); expect(f.can('FAILURE')).toBe(true); });
});

describe('FSM.isIn / isFinal / matches', () => {
  it('isIn 0a: isIn red at start', () => { expect(createFSM(trafficConfig).isIn('red')).toBe(true); });
  it('isIn 0b: not isIn green at start', () => { expect(createFSM(trafficConfig).isIn('green')).toBe(false); });
  it('isIn 0c: isIn green after GO', () => { const f=createFSM(trafficConfig); f.send('GO'); expect(f.isIn('green')).toBe(true); });
  it('matches 0d: matches red', () => { expect(createFSM(trafficConfig).matches('red')).toBe(true); });
  it('isFinal 0e: authenticated is final', () => { const f=createFSM(loginConfig); f.send('SUBMIT').send('SUCCESS'); expect(f.isFinal()).toBe(true); });
  it('isIn 1a: isIn red at start', () => { expect(createFSM(trafficConfig).isIn('red')).toBe(true); });
  it('isIn 1b: not isIn green at start', () => { expect(createFSM(trafficConfig).isIn('green')).toBe(false); });
  it('isIn 1c: isIn green after GO', () => { const f=createFSM(trafficConfig); f.send('GO'); expect(f.isIn('green')).toBe(true); });
  it('matches 1d: matches red', () => { expect(createFSM(trafficConfig).matches('red')).toBe(true); });
  it('isFinal 1e: authenticated is final', () => { const f=createFSM(loginConfig); f.send('SUBMIT').send('SUCCESS'); expect(f.isFinal()).toBe(true); });
  it('isIn 2a: isIn red at start', () => { expect(createFSM(trafficConfig).isIn('red')).toBe(true); });
  it('isIn 2b: not isIn green at start', () => { expect(createFSM(trafficConfig).isIn('green')).toBe(false); });
  it('isIn 2c: isIn green after GO', () => { const f=createFSM(trafficConfig); f.send('GO'); expect(f.isIn('green')).toBe(true); });
  it('matches 2d: matches red', () => { expect(createFSM(trafficConfig).matches('red')).toBe(true); });
  it('isFinal 2e: authenticated is final', () => { const f=createFSM(loginConfig); f.send('SUBMIT').send('SUCCESS'); expect(f.isFinal()).toBe(true); });
  it('isIn 3a: isIn red at start', () => { expect(createFSM(trafficConfig).isIn('red')).toBe(true); });
  it('isIn 3b: not isIn green at start', () => { expect(createFSM(trafficConfig).isIn('green')).toBe(false); });
  it('isIn 3c: isIn green after GO', () => { const f=createFSM(trafficConfig); f.send('GO'); expect(f.isIn('green')).toBe(true); });
  it('matches 3d: matches red', () => { expect(createFSM(trafficConfig).matches('red')).toBe(true); });
  it('isFinal 3e: authenticated is final', () => { const f=createFSM(loginConfig); f.send('SUBMIT').send('SUCCESS'); expect(f.isFinal()).toBe(true); });
  it('isIn 4a: isIn red at start', () => { expect(createFSM(trafficConfig).isIn('red')).toBe(true); });
  it('isIn 4b: not isIn green at start', () => { expect(createFSM(trafficConfig).isIn('green')).toBe(false); });
  it('isIn 4c: isIn green after GO', () => { const f=createFSM(trafficConfig); f.send('GO'); expect(f.isIn('green')).toBe(true); });
  it('matches 4d: matches red', () => { expect(createFSM(trafficConfig).matches('red')).toBe(true); });
  it('isFinal 4e: authenticated is final', () => { const f=createFSM(loginConfig); f.send('SUBMIT').send('SUCCESS'); expect(f.isFinal()).toBe(true); });
  it('isIn 5a: isIn red at start', () => { expect(createFSM(trafficConfig).isIn('red')).toBe(true); });
  it('isIn 5b: not isIn green at start', () => { expect(createFSM(trafficConfig).isIn('green')).toBe(false); });
  it('isIn 5c: isIn green after GO', () => { const f=createFSM(trafficConfig); f.send('GO'); expect(f.isIn('green')).toBe(true); });
  it('matches 5d: matches red', () => { expect(createFSM(trafficConfig).matches('red')).toBe(true); });
  it('isFinal 5e: authenticated is final', () => { const f=createFSM(loginConfig); f.send('SUBMIT').send('SUCCESS'); expect(f.isFinal()).toBe(true); });
  it('isIn 6a: isIn red at start', () => { expect(createFSM(trafficConfig).isIn('red')).toBe(true); });
  it('isIn 6b: not isIn green at start', () => { expect(createFSM(trafficConfig).isIn('green')).toBe(false); });
  it('isIn 6c: isIn green after GO', () => { const f=createFSM(trafficConfig); f.send('GO'); expect(f.isIn('green')).toBe(true); });
  it('matches 6d: matches red', () => { expect(createFSM(trafficConfig).matches('red')).toBe(true); });
  it('isFinal 6e: authenticated is final', () => { const f=createFSM(loginConfig); f.send('SUBMIT').send('SUCCESS'); expect(f.isFinal()).toBe(true); });
  it('isIn 7a: isIn red at start', () => { expect(createFSM(trafficConfig).isIn('red')).toBe(true); });
  it('isIn 7b: not isIn green at start', () => { expect(createFSM(trafficConfig).isIn('green')).toBe(false); });
  it('isIn 7c: isIn green after GO', () => { const f=createFSM(trafficConfig); f.send('GO'); expect(f.isIn('green')).toBe(true); });
  it('matches 7d: matches red', () => { expect(createFSM(trafficConfig).matches('red')).toBe(true); });
  it('isFinal 7e: authenticated is final', () => { const f=createFSM(loginConfig); f.send('SUBMIT').send('SUCCESS'); expect(f.isFinal()).toBe(true); });
  it('isIn 8a: isIn red at start', () => { expect(createFSM(trafficConfig).isIn('red')).toBe(true); });
  it('isIn 8b: not isIn green at start', () => { expect(createFSM(trafficConfig).isIn('green')).toBe(false); });
  it('isIn 8c: isIn green after GO', () => { const f=createFSM(trafficConfig); f.send('GO'); expect(f.isIn('green')).toBe(true); });
  it('matches 8d: matches red', () => { expect(createFSM(trafficConfig).matches('red')).toBe(true); });
  it('isFinal 8e: authenticated is final', () => { const f=createFSM(loginConfig); f.send('SUBMIT').send('SUCCESS'); expect(f.isFinal()).toBe(true); });
  it('isIn 9a: isIn red at start', () => { expect(createFSM(trafficConfig).isIn('red')).toBe(true); });
  it('isIn 9b: not isIn green at start', () => { expect(createFSM(trafficConfig).isIn('green')).toBe(false); });
  it('isIn 9c: isIn green after GO', () => { const f=createFSM(trafficConfig); f.send('GO'); expect(f.isIn('green')).toBe(true); });
  it('matches 9d: matches red', () => { expect(createFSM(trafficConfig).matches('red')).toBe(true); });
  it('isFinal 9e: authenticated is final', () => { const f=createFSM(loginConfig); f.send('SUBMIT').send('SUCCESS'); expect(f.isFinal()).toBe(true); });
  it('isIn 10a: isIn red at start', () => { expect(createFSM(trafficConfig).isIn('red')).toBe(true); });
  it('isIn 10b: not isIn green at start', () => { expect(createFSM(trafficConfig).isIn('green')).toBe(false); });
  it('isIn 10c: isIn green after GO', () => { const f=createFSM(trafficConfig); f.send('GO'); expect(f.isIn('green')).toBe(true); });
  it('matches 10d: matches red', () => { expect(createFSM(trafficConfig).matches('red')).toBe(true); });
  it('isFinal 10e: authenticated is final', () => { const f=createFSM(loginConfig); f.send('SUBMIT').send('SUCCESS'); expect(f.isFinal()).toBe(true); });
  it('isIn 11a: isIn red at start', () => { expect(createFSM(trafficConfig).isIn('red')).toBe(true); });
  it('isIn 11b: not isIn green at start', () => { expect(createFSM(trafficConfig).isIn('green')).toBe(false); });
  it('isIn 11c: isIn green after GO', () => { const f=createFSM(trafficConfig); f.send('GO'); expect(f.isIn('green')).toBe(true); });
  it('matches 11d: matches red', () => { expect(createFSM(trafficConfig).matches('red')).toBe(true); });
  it('isFinal 11e: authenticated is final', () => { const f=createFSM(loginConfig); f.send('SUBMIT').send('SUCCESS'); expect(f.isFinal()).toBe(true); });
  it('isIn 12a: isIn red at start', () => { expect(createFSM(trafficConfig).isIn('red')).toBe(true); });
  it('isIn 12b: not isIn green at start', () => { expect(createFSM(trafficConfig).isIn('green')).toBe(false); });
  it('isIn 12c: isIn green after GO', () => { const f=createFSM(trafficConfig); f.send('GO'); expect(f.isIn('green')).toBe(true); });
  it('matches 12d: matches red', () => { expect(createFSM(trafficConfig).matches('red')).toBe(true); });
  it('isFinal 12e: authenticated is final', () => { const f=createFSM(loginConfig); f.send('SUBMIT').send('SUCCESS'); expect(f.isFinal()).toBe(true); });
  it('isIn 13a: isIn red at start', () => { expect(createFSM(trafficConfig).isIn('red')).toBe(true); });
  it('isIn 13b: not isIn green at start', () => { expect(createFSM(trafficConfig).isIn('green')).toBe(false); });
  it('isIn 13c: isIn green after GO', () => { const f=createFSM(trafficConfig); f.send('GO'); expect(f.isIn('green')).toBe(true); });
  it('matches 13d: matches red', () => { expect(createFSM(trafficConfig).matches('red')).toBe(true); });
  it('isFinal 13e: authenticated is final', () => { const f=createFSM(loginConfig); f.send('SUBMIT').send('SUCCESS'); expect(f.isFinal()).toBe(true); });
  it('isIn 14a: isIn red at start', () => { expect(createFSM(trafficConfig).isIn('red')).toBe(true); });
  it('isIn 14b: not isIn green at start', () => { expect(createFSM(trafficConfig).isIn('green')).toBe(false); });
  it('isIn 14c: isIn green after GO', () => { const f=createFSM(trafficConfig); f.send('GO'); expect(f.isIn('green')).toBe(true); });
  it('matches 14d: matches red', () => { expect(createFSM(trafficConfig).matches('red')).toBe(true); });
  it('isFinal 14e: authenticated is final', () => { const f=createFSM(loginConfig); f.send('SUBMIT').send('SUCCESS'); expect(f.isFinal()).toBe(true); });
  it('isIn 15a: isIn red at start', () => { expect(createFSM(trafficConfig).isIn('red')).toBe(true); });
  it('isIn 15b: not isIn green at start', () => { expect(createFSM(trafficConfig).isIn('green')).toBe(false); });
  it('isIn 15c: isIn green after GO', () => { const f=createFSM(trafficConfig); f.send('GO'); expect(f.isIn('green')).toBe(true); });
  it('matches 15d: matches red', () => { expect(createFSM(trafficConfig).matches('red')).toBe(true); });
  it('isFinal 15e: authenticated is final', () => { const f=createFSM(loginConfig); f.send('SUBMIT').send('SUCCESS'); expect(f.isFinal()).toBe(true); });
  it('isIn 16a: isIn red at start', () => { expect(createFSM(trafficConfig).isIn('red')).toBe(true); });
  it('isIn 16b: not isIn green at start', () => { expect(createFSM(trafficConfig).isIn('green')).toBe(false); });
  it('isIn 16c: isIn green after GO', () => { const f=createFSM(trafficConfig); f.send('GO'); expect(f.isIn('green')).toBe(true); });
  it('matches 16d: matches red', () => { expect(createFSM(trafficConfig).matches('red')).toBe(true); });
  it('isFinal 16e: authenticated is final', () => { const f=createFSM(loginConfig); f.send('SUBMIT').send('SUCCESS'); expect(f.isFinal()).toBe(true); });
  it('isIn 17a: isIn red at start', () => { expect(createFSM(trafficConfig).isIn('red')).toBe(true); });
  it('isIn 17b: not isIn green at start', () => { expect(createFSM(trafficConfig).isIn('green')).toBe(false); });
  it('isIn 17c: isIn green after GO', () => { const f=createFSM(trafficConfig); f.send('GO'); expect(f.isIn('green')).toBe(true); });
  it('matches 17d: matches red', () => { expect(createFSM(trafficConfig).matches('red')).toBe(true); });
  it('isFinal 17e: authenticated is final', () => { const f=createFSM(loginConfig); f.send('SUBMIT').send('SUCCESS'); expect(f.isFinal()).toBe(true); });
  it('isIn 18a: isIn red at start', () => { expect(createFSM(trafficConfig).isIn('red')).toBe(true); });
  it('isIn 18b: not isIn green at start', () => { expect(createFSM(trafficConfig).isIn('green')).toBe(false); });
  it('isIn 18c: isIn green after GO', () => { const f=createFSM(trafficConfig); f.send('GO'); expect(f.isIn('green')).toBe(true); });
  it('matches 18d: matches red', () => { expect(createFSM(trafficConfig).matches('red')).toBe(true); });
  it('isFinal 18e: authenticated is final', () => { const f=createFSM(loginConfig); f.send('SUBMIT').send('SUCCESS'); expect(f.isFinal()).toBe(true); });
  it('isIn 19a: isIn red at start', () => { expect(createFSM(trafficConfig).isIn('red')).toBe(true); });
  it('isIn 19b: not isIn green at start', () => { expect(createFSM(trafficConfig).isIn('green')).toBe(false); });
  it('isIn 19c: isIn green after GO', () => { const f=createFSM(trafficConfig); f.send('GO'); expect(f.isIn('green')).toBe(true); });
  it('matches 19d: matches red', () => { expect(createFSM(trafficConfig).matches('red')).toBe(true); });
  it('isFinal 19e: authenticated is final', () => { const f=createFSM(loginConfig); f.send('SUBMIT').send('SUCCESS'); expect(f.isFinal()).toBe(true); });
  it('isIn 20a: isIn red at start', () => { expect(createFSM(trafficConfig).isIn('red')).toBe(true); });
  it('isIn 20b: not isIn green at start', () => { expect(createFSM(trafficConfig).isIn('green')).toBe(false); });
  it('isIn 20c: isIn green after GO', () => { const f=createFSM(trafficConfig); f.send('GO'); expect(f.isIn('green')).toBe(true); });
  it('matches 20d: matches red', () => { expect(createFSM(trafficConfig).matches('red')).toBe(true); });
  it('isFinal 20e: authenticated is final', () => { const f=createFSM(loginConfig); f.send('SUBMIT').send('SUCCESS'); expect(f.isFinal()).toBe(true); });
  it('isIn 21a: isIn red at start', () => { expect(createFSM(trafficConfig).isIn('red')).toBe(true); });
  it('isIn 21b: not isIn green at start', () => { expect(createFSM(trafficConfig).isIn('green')).toBe(false); });
  it('isIn 21c: isIn green after GO', () => { const f=createFSM(trafficConfig); f.send('GO'); expect(f.isIn('green')).toBe(true); });
  it('matches 21d: matches red', () => { expect(createFSM(trafficConfig).matches('red')).toBe(true); });
  it('isFinal 21e: authenticated is final', () => { const f=createFSM(loginConfig); f.send('SUBMIT').send('SUCCESS'); expect(f.isFinal()).toBe(true); });
  it('isIn 22a: isIn red at start', () => { expect(createFSM(trafficConfig).isIn('red')).toBe(true); });
  it('isIn 22b: not isIn green at start', () => { expect(createFSM(trafficConfig).isIn('green')).toBe(false); });
  it('isIn 22c: isIn green after GO', () => { const f=createFSM(trafficConfig); f.send('GO'); expect(f.isIn('green')).toBe(true); });
  it('matches 22d: matches red', () => { expect(createFSM(trafficConfig).matches('red')).toBe(true); });
  it('isFinal 22e: authenticated is final', () => { const f=createFSM(loginConfig); f.send('SUBMIT').send('SUCCESS'); expect(f.isFinal()).toBe(true); });
  it('isIn 23a: isIn red at start', () => { expect(createFSM(trafficConfig).isIn('red')).toBe(true); });
  it('isIn 23b: not isIn green at start', () => { expect(createFSM(trafficConfig).isIn('green')).toBe(false); });
  it('isIn 23c: isIn green after GO', () => { const f=createFSM(trafficConfig); f.send('GO'); expect(f.isIn('green')).toBe(true); });
  it('matches 23d: matches red', () => { expect(createFSM(trafficConfig).matches('red')).toBe(true); });
  it('isFinal 23e: authenticated is final', () => { const f=createFSM(loginConfig); f.send('SUBMIT').send('SUCCESS'); expect(f.isFinal()).toBe(true); });
  it('isIn 24a: isIn red at start', () => { expect(createFSM(trafficConfig).isIn('red')).toBe(true); });
  it('isIn 24b: not isIn green at start', () => { expect(createFSM(trafficConfig).isIn('green')).toBe(false); });
  it('isIn 24c: isIn green after GO', () => { const f=createFSM(trafficConfig); f.send('GO'); expect(f.isIn('green')).toBe(true); });
  it('matches 24d: matches red', () => { expect(createFSM(trafficConfig).matches('red')).toBe(true); });
  it('isFinal 24e: authenticated is final', () => { const f=createFSM(loginConfig); f.send('SUBMIT').send('SUCCESS'); expect(f.isFinal()).toBe(true); });
  it('isIn 25a: isIn red at start', () => { expect(createFSM(trafficConfig).isIn('red')).toBe(true); });
  it('isIn 25b: not isIn green at start', () => { expect(createFSM(trafficConfig).isIn('green')).toBe(false); });
  it('isIn 25c: isIn green after GO', () => { const f=createFSM(trafficConfig); f.send('GO'); expect(f.isIn('green')).toBe(true); });
  it('matches 25d: matches red', () => { expect(createFSM(trafficConfig).matches('red')).toBe(true); });
  it('isFinal 25e: authenticated is final', () => { const f=createFSM(loginConfig); f.send('SUBMIT').send('SUCCESS'); expect(f.isFinal()).toBe(true); });
  it('isIn 26a: isIn red at start', () => { expect(createFSM(trafficConfig).isIn('red')).toBe(true); });
  it('isIn 26b: not isIn green at start', () => { expect(createFSM(trafficConfig).isIn('green')).toBe(false); });
  it('isIn 26c: isIn green after GO', () => { const f=createFSM(trafficConfig); f.send('GO'); expect(f.isIn('green')).toBe(true); });
  it('matches 26d: matches red', () => { expect(createFSM(trafficConfig).matches('red')).toBe(true); });
  it('isFinal 26e: authenticated is final', () => { const f=createFSM(loginConfig); f.send('SUBMIT').send('SUCCESS'); expect(f.isFinal()).toBe(true); });
  it('isIn 27a: isIn red at start', () => { expect(createFSM(trafficConfig).isIn('red')).toBe(true); });
  it('isIn 27b: not isIn green at start', () => { expect(createFSM(trafficConfig).isIn('green')).toBe(false); });
  it('isIn 27c: isIn green after GO', () => { const f=createFSM(trafficConfig); f.send('GO'); expect(f.isIn('green')).toBe(true); });
  it('matches 27d: matches red', () => { expect(createFSM(trafficConfig).matches('red')).toBe(true); });
  it('isFinal 27e: authenticated is final', () => { const f=createFSM(loginConfig); f.send('SUBMIT').send('SUCCESS'); expect(f.isFinal()).toBe(true); });
  it('isIn 28a: isIn red at start', () => { expect(createFSM(trafficConfig).isIn('red')).toBe(true); });
  it('isIn 28b: not isIn green at start', () => { expect(createFSM(trafficConfig).isIn('green')).toBe(false); });
  it('isIn 28c: isIn green after GO', () => { const f=createFSM(trafficConfig); f.send('GO'); expect(f.isIn('green')).toBe(true); });
  it('matches 28d: matches red', () => { expect(createFSM(trafficConfig).matches('red')).toBe(true); });
  it('isFinal 28e: authenticated is final', () => { const f=createFSM(loginConfig); f.send('SUBMIT').send('SUCCESS'); expect(f.isFinal()).toBe(true); });
  it('isIn 29a: isIn red at start', () => { expect(createFSM(trafficConfig).isIn('red')).toBe(true); });
  it('isIn 29b: not isIn green at start', () => { expect(createFSM(trafficConfig).isIn('green')).toBe(false); });
  it('isIn 29c: isIn green after GO', () => { const f=createFSM(trafficConfig); f.send('GO'); expect(f.isIn('green')).toBe(true); });
  it('matches 29d: matches red', () => { expect(createFSM(trafficConfig).matches('red')).toBe(true); });
  it('isFinal 29e: authenticated is final', () => { const f=createFSM(loginConfig); f.send('SUBMIT').send('SUCCESS'); expect(f.isFinal()).toBe(true); });
});

describe('FSM.history / reset', () => {
  it('history 0a: history starts with initial', () => { expect(createFSM(trafficConfig).history()[0]).toBe('red'); });
  it('history 0b: history grows with sends', () => { const f=createFSM(trafficConfig); f.send('GO'); expect(f.history()).toHaveLength(2); });
  it('history 0c: history records states in order', () => { const f=createFSM(trafficConfig); f.send('GO').send('SLOW'); expect(f.history()).toEqual(['red','green','yellow']); });
  it('history 0d: returns copy not ref', () => { const f=createFSM(trafficConfig); const h=f.history(); h.push('red' as any); expect(f.history()).toHaveLength(1); });
  it('reset 0e: reset returns to initial', () => { const f=createFSM(trafficConfig); f.send('GO').reset(); expect(f.current).toBe('red'); });
  it('reset 0f: reset clears history to 1', () => { const f=createFSM(trafficConfig); f.send('GO').reset(); expect(f.history()).toHaveLength(1); });
  it('reset 0g: can re-send after reset', () => { const f=createFSM(trafficConfig); f.send('GO').reset(); f.send('GO'); expect(f.current).toBe('green'); });
  it('history 1a: history starts with initial', () => { expect(createFSM(trafficConfig).history()[0]).toBe('red'); });
  it('history 1b: history grows with sends', () => { const f=createFSM(trafficConfig); f.send('GO'); expect(f.history()).toHaveLength(2); });
  it('history 1c: history records states in order', () => { const f=createFSM(trafficConfig); f.send('GO').send('SLOW'); expect(f.history()).toEqual(['red','green','yellow']); });
  it('history 1d: returns copy not ref', () => { const f=createFSM(trafficConfig); const h=f.history(); h.push('red' as any); expect(f.history()).toHaveLength(1); });
  it('reset 1e: reset returns to initial', () => { const f=createFSM(trafficConfig); f.send('GO').reset(); expect(f.current).toBe('red'); });
  it('reset 1f: reset clears history to 1', () => { const f=createFSM(trafficConfig); f.send('GO').reset(); expect(f.history()).toHaveLength(1); });
  it('reset 1g: can re-send after reset', () => { const f=createFSM(trafficConfig); f.send('GO').reset(); f.send('GO'); expect(f.current).toBe('green'); });
  it('history 2a: history starts with initial', () => { expect(createFSM(trafficConfig).history()[0]).toBe('red'); });
  it('history 2b: history grows with sends', () => { const f=createFSM(trafficConfig); f.send('GO'); expect(f.history()).toHaveLength(2); });
  it('history 2c: history records states in order', () => { const f=createFSM(trafficConfig); f.send('GO').send('SLOW'); expect(f.history()).toEqual(['red','green','yellow']); });
  it('history 2d: returns copy not ref', () => { const f=createFSM(trafficConfig); const h=f.history(); h.push('red' as any); expect(f.history()).toHaveLength(1); });
  it('reset 2e: reset returns to initial', () => { const f=createFSM(trafficConfig); f.send('GO').reset(); expect(f.current).toBe('red'); });
  it('reset 2f: reset clears history to 1', () => { const f=createFSM(trafficConfig); f.send('GO').reset(); expect(f.history()).toHaveLength(1); });
  it('reset 2g: can re-send after reset', () => { const f=createFSM(trafficConfig); f.send('GO').reset(); f.send('GO'); expect(f.current).toBe('green'); });
  it('history 3a: history starts with initial', () => { expect(createFSM(trafficConfig).history()[0]).toBe('red'); });
  it('history 3b: history grows with sends', () => { const f=createFSM(trafficConfig); f.send('GO'); expect(f.history()).toHaveLength(2); });
  it('history 3c: history records states in order', () => { const f=createFSM(trafficConfig); f.send('GO').send('SLOW'); expect(f.history()).toEqual(['red','green','yellow']); });
  it('history 3d: returns copy not ref', () => { const f=createFSM(trafficConfig); const h=f.history(); h.push('red' as any); expect(f.history()).toHaveLength(1); });
  it('reset 3e: reset returns to initial', () => { const f=createFSM(trafficConfig); f.send('GO').reset(); expect(f.current).toBe('red'); });
  it('reset 3f: reset clears history to 1', () => { const f=createFSM(trafficConfig); f.send('GO').reset(); expect(f.history()).toHaveLength(1); });
  it('reset 3g: can re-send after reset', () => { const f=createFSM(trafficConfig); f.send('GO').reset(); f.send('GO'); expect(f.current).toBe('green'); });
  it('history 4a: history starts with initial', () => { expect(createFSM(trafficConfig).history()[0]).toBe('red'); });
  it('history 4b: history grows with sends', () => { const f=createFSM(trafficConfig); f.send('GO'); expect(f.history()).toHaveLength(2); });
  it('history 4c: history records states in order', () => { const f=createFSM(trafficConfig); f.send('GO').send('SLOW'); expect(f.history()).toEqual(['red','green','yellow']); });
  it('history 4d: returns copy not ref', () => { const f=createFSM(trafficConfig); const h=f.history(); h.push('red' as any); expect(f.history()).toHaveLength(1); });
  it('reset 4e: reset returns to initial', () => { const f=createFSM(trafficConfig); f.send('GO').reset(); expect(f.current).toBe('red'); });
  it('reset 4f: reset clears history to 1', () => { const f=createFSM(trafficConfig); f.send('GO').reset(); expect(f.history()).toHaveLength(1); });
  it('reset 4g: can re-send after reset', () => { const f=createFSM(trafficConfig); f.send('GO').reset(); f.send('GO'); expect(f.current).toBe('green'); });
  it('history 5a: history starts with initial', () => { expect(createFSM(trafficConfig).history()[0]).toBe('red'); });
  it('history 5b: history grows with sends', () => { const f=createFSM(trafficConfig); f.send('GO'); expect(f.history()).toHaveLength(2); });
  it('history 5c: history records states in order', () => { const f=createFSM(trafficConfig); f.send('GO').send('SLOW'); expect(f.history()).toEqual(['red','green','yellow']); });
  it('history 5d: returns copy not ref', () => { const f=createFSM(trafficConfig); const h=f.history(); h.push('red' as any); expect(f.history()).toHaveLength(1); });
  it('reset 5e: reset returns to initial', () => { const f=createFSM(trafficConfig); f.send('GO').reset(); expect(f.current).toBe('red'); });
  it('reset 5f: reset clears history to 1', () => { const f=createFSM(trafficConfig); f.send('GO').reset(); expect(f.history()).toHaveLength(1); });
  it('reset 5g: can re-send after reset', () => { const f=createFSM(trafficConfig); f.send('GO').reset(); f.send('GO'); expect(f.current).toBe('green'); });
  it('history 6a: history starts with initial', () => { expect(createFSM(trafficConfig).history()[0]).toBe('red'); });
  it('history 6b: history grows with sends', () => { const f=createFSM(trafficConfig); f.send('GO'); expect(f.history()).toHaveLength(2); });
  it('history 6c: history records states in order', () => { const f=createFSM(trafficConfig); f.send('GO').send('SLOW'); expect(f.history()).toEqual(['red','green','yellow']); });
  it('history 6d: returns copy not ref', () => { const f=createFSM(trafficConfig); const h=f.history(); h.push('red' as any); expect(f.history()).toHaveLength(1); });
  it('reset 6e: reset returns to initial', () => { const f=createFSM(trafficConfig); f.send('GO').reset(); expect(f.current).toBe('red'); });
  it('reset 6f: reset clears history to 1', () => { const f=createFSM(trafficConfig); f.send('GO').reset(); expect(f.history()).toHaveLength(1); });
  it('reset 6g: can re-send after reset', () => { const f=createFSM(trafficConfig); f.send('GO').reset(); f.send('GO'); expect(f.current).toBe('green'); });
  it('history 7a: history starts with initial', () => { expect(createFSM(trafficConfig).history()[0]).toBe('red'); });
  it('history 7b: history grows with sends', () => { const f=createFSM(trafficConfig); f.send('GO'); expect(f.history()).toHaveLength(2); });
  it('history 7c: history records states in order', () => { const f=createFSM(trafficConfig); f.send('GO').send('SLOW'); expect(f.history()).toEqual(['red','green','yellow']); });
  it('history 7d: returns copy not ref', () => { const f=createFSM(trafficConfig); const h=f.history(); h.push('red' as any); expect(f.history()).toHaveLength(1); });
  it('reset 7e: reset returns to initial', () => { const f=createFSM(trafficConfig); f.send('GO').reset(); expect(f.current).toBe('red'); });
  it('reset 7f: reset clears history to 1', () => { const f=createFSM(trafficConfig); f.send('GO').reset(); expect(f.history()).toHaveLength(1); });
  it('reset 7g: can re-send after reset', () => { const f=createFSM(trafficConfig); f.send('GO').reset(); f.send('GO'); expect(f.current).toBe('green'); });
  it('history 8a: history starts with initial', () => { expect(createFSM(trafficConfig).history()[0]).toBe('red'); });
  it('history 8b: history grows with sends', () => { const f=createFSM(trafficConfig); f.send('GO'); expect(f.history()).toHaveLength(2); });
  it('history 8c: history records states in order', () => { const f=createFSM(trafficConfig); f.send('GO').send('SLOW'); expect(f.history()).toEqual(['red','green','yellow']); });
  it('history 8d: returns copy not ref', () => { const f=createFSM(trafficConfig); const h=f.history(); h.push('red' as any); expect(f.history()).toHaveLength(1); });
  it('reset 8e: reset returns to initial', () => { const f=createFSM(trafficConfig); f.send('GO').reset(); expect(f.current).toBe('red'); });
  it('reset 8f: reset clears history to 1', () => { const f=createFSM(trafficConfig); f.send('GO').reset(); expect(f.history()).toHaveLength(1); });
  it('reset 8g: can re-send after reset', () => { const f=createFSM(trafficConfig); f.send('GO').reset(); f.send('GO'); expect(f.current).toBe('green'); });
  it('history 9a: history starts with initial', () => { expect(createFSM(trafficConfig).history()[0]).toBe('red'); });
  it('history 9b: history grows with sends', () => { const f=createFSM(trafficConfig); f.send('GO'); expect(f.history()).toHaveLength(2); });
  it('history 9c: history records states in order', () => { const f=createFSM(trafficConfig); f.send('GO').send('SLOW'); expect(f.history()).toEqual(['red','green','yellow']); });
  it('history 9d: returns copy not ref', () => { const f=createFSM(trafficConfig); const h=f.history(); h.push('red' as any); expect(f.history()).toHaveLength(1); });
  it('reset 9e: reset returns to initial', () => { const f=createFSM(trafficConfig); f.send('GO').reset(); expect(f.current).toBe('red'); });
  it('reset 9f: reset clears history to 1', () => { const f=createFSM(trafficConfig); f.send('GO').reset(); expect(f.history()).toHaveLength(1); });
  it('reset 9g: can re-send after reset', () => { const f=createFSM(trafficConfig); f.send('GO').reset(); f.send('GO'); expect(f.current).toBe('green'); });
  it('history 10a: history starts with initial', () => { expect(createFSM(trafficConfig).history()[0]).toBe('red'); });
  it('history 10b: history grows with sends', () => { const f=createFSM(trafficConfig); f.send('GO'); expect(f.history()).toHaveLength(2); });
  it('history 10c: history records states in order', () => { const f=createFSM(trafficConfig); f.send('GO').send('SLOW'); expect(f.history()).toEqual(['red','green','yellow']); });
  it('history 10d: returns copy not ref', () => { const f=createFSM(trafficConfig); const h=f.history(); h.push('red' as any); expect(f.history()).toHaveLength(1); });
  it('reset 10e: reset returns to initial', () => { const f=createFSM(trafficConfig); f.send('GO').reset(); expect(f.current).toBe('red'); });
  it('reset 10f: reset clears history to 1', () => { const f=createFSM(trafficConfig); f.send('GO').reset(); expect(f.history()).toHaveLength(1); });
  it('reset 10g: can re-send after reset', () => { const f=createFSM(trafficConfig); f.send('GO').reset(); f.send('GO'); expect(f.current).toBe('green'); });
  it('history 11a: history starts with initial', () => { expect(createFSM(trafficConfig).history()[0]).toBe('red'); });
  it('history 11b: history grows with sends', () => { const f=createFSM(trafficConfig); f.send('GO'); expect(f.history()).toHaveLength(2); });
  it('history 11c: history records states in order', () => { const f=createFSM(trafficConfig); f.send('GO').send('SLOW'); expect(f.history()).toEqual(['red','green','yellow']); });
  it('history 11d: returns copy not ref', () => { const f=createFSM(trafficConfig); const h=f.history(); h.push('red' as any); expect(f.history()).toHaveLength(1); });
  it('reset 11e: reset returns to initial', () => { const f=createFSM(trafficConfig); f.send('GO').reset(); expect(f.current).toBe('red'); });
  it('reset 11f: reset clears history to 1', () => { const f=createFSM(trafficConfig); f.send('GO').reset(); expect(f.history()).toHaveLength(1); });
  it('reset 11g: can re-send after reset', () => { const f=createFSM(trafficConfig); f.send('GO').reset(); f.send('GO'); expect(f.current).toBe('green'); });
  it('history 12a: history starts with initial', () => { expect(createFSM(trafficConfig).history()[0]).toBe('red'); });
  it('history 12b: history grows with sends', () => { const f=createFSM(trafficConfig); f.send('GO'); expect(f.history()).toHaveLength(2); });
  it('history 12c: history records states in order', () => { const f=createFSM(trafficConfig); f.send('GO').send('SLOW'); expect(f.history()).toEqual(['red','green','yellow']); });
  it('history 12d: returns copy not ref', () => { const f=createFSM(trafficConfig); const h=f.history(); h.push('red' as any); expect(f.history()).toHaveLength(1); });
  it('reset 12e: reset returns to initial', () => { const f=createFSM(trafficConfig); f.send('GO').reset(); expect(f.current).toBe('red'); });
  it('reset 12f: reset clears history to 1', () => { const f=createFSM(trafficConfig); f.send('GO').reset(); expect(f.history()).toHaveLength(1); });
  it('reset 12g: can re-send after reset', () => { const f=createFSM(trafficConfig); f.send('GO').reset(); f.send('GO'); expect(f.current).toBe('green'); });
  it('history 13a: history starts with initial', () => { expect(createFSM(trafficConfig).history()[0]).toBe('red'); });
  it('history 13b: history grows with sends', () => { const f=createFSM(trafficConfig); f.send('GO'); expect(f.history()).toHaveLength(2); });
  it('history 13c: history records states in order', () => { const f=createFSM(trafficConfig); f.send('GO').send('SLOW'); expect(f.history()).toEqual(['red','green','yellow']); });
  it('history 13d: returns copy not ref', () => { const f=createFSM(trafficConfig); const h=f.history(); h.push('red' as any); expect(f.history()).toHaveLength(1); });
  it('reset 13e: reset returns to initial', () => { const f=createFSM(trafficConfig); f.send('GO').reset(); expect(f.current).toBe('red'); });
  it('reset 13f: reset clears history to 1', () => { const f=createFSM(trafficConfig); f.send('GO').reset(); expect(f.history()).toHaveLength(1); });
  it('reset 13g: can re-send after reset', () => { const f=createFSM(trafficConfig); f.send('GO').reset(); f.send('GO'); expect(f.current).toBe('green'); });
  it('history 14a: history starts with initial', () => { expect(createFSM(trafficConfig).history()[0]).toBe('red'); });
  it('history 14b: history grows with sends', () => { const f=createFSM(trafficConfig); f.send('GO'); expect(f.history()).toHaveLength(2); });
  it('history 14c: history records states in order', () => { const f=createFSM(trafficConfig); f.send('GO').send('SLOW'); expect(f.history()).toEqual(['red','green','yellow']); });
  it('history 14d: returns copy not ref', () => { const f=createFSM(trafficConfig); const h=f.history(); h.push('red' as any); expect(f.history()).toHaveLength(1); });
  it('reset 14e: reset returns to initial', () => { const f=createFSM(trafficConfig); f.send('GO').reset(); expect(f.current).toBe('red'); });
  it('reset 14f: reset clears history to 1', () => { const f=createFSM(trafficConfig); f.send('GO').reset(); expect(f.history()).toHaveLength(1); });
  it('reset 14g: can re-send after reset', () => { const f=createFSM(trafficConfig); f.send('GO').reset(); f.send('GO'); expect(f.current).toBe('green'); });
  it('history 15a: history starts with initial', () => { expect(createFSM(trafficConfig).history()[0]).toBe('red'); });
  it('history 15b: history grows with sends', () => { const f=createFSM(trafficConfig); f.send('GO'); expect(f.history()).toHaveLength(2); });
  it('history 15c: history records states in order', () => { const f=createFSM(trafficConfig); f.send('GO').send('SLOW'); expect(f.history()).toEqual(['red','green','yellow']); });
  it('history 15d: returns copy not ref', () => { const f=createFSM(trafficConfig); const h=f.history(); h.push('red' as any); expect(f.history()).toHaveLength(1); });
  it('reset 15e: reset returns to initial', () => { const f=createFSM(trafficConfig); f.send('GO').reset(); expect(f.current).toBe('red'); });
  it('reset 15f: reset clears history to 1', () => { const f=createFSM(trafficConfig); f.send('GO').reset(); expect(f.history()).toHaveLength(1); });
  it('reset 15g: can re-send after reset', () => { const f=createFSM(trafficConfig); f.send('GO').reset(); f.send('GO'); expect(f.current).toBe('green'); });
  it('history 16a: history starts with initial', () => { expect(createFSM(trafficConfig).history()[0]).toBe('red'); });
  it('history 16b: history grows with sends', () => { const f=createFSM(trafficConfig); f.send('GO'); expect(f.history()).toHaveLength(2); });
  it('history 16c: history records states in order', () => { const f=createFSM(trafficConfig); f.send('GO').send('SLOW'); expect(f.history()).toEqual(['red','green','yellow']); });
  it('history 16d: returns copy not ref', () => { const f=createFSM(trafficConfig); const h=f.history(); h.push('red' as any); expect(f.history()).toHaveLength(1); });
  it('reset 16e: reset returns to initial', () => { const f=createFSM(trafficConfig); f.send('GO').reset(); expect(f.current).toBe('red'); });
  it('reset 16f: reset clears history to 1', () => { const f=createFSM(trafficConfig); f.send('GO').reset(); expect(f.history()).toHaveLength(1); });
  it('reset 16g: can re-send after reset', () => { const f=createFSM(trafficConfig); f.send('GO').reset(); f.send('GO'); expect(f.current).toBe('green'); });
  it('history 17a: history starts with initial', () => { expect(createFSM(trafficConfig).history()[0]).toBe('red'); });
});

describe('getReachableStates', () => {
  it('reachable 0a: traffic from red reachable has all 3 states', () => {
    const r = getReachableStates(trafficConfig, 'red');
    expect(r.sort()).toEqual(['green','red','yellow']);
  });
  it('reachable 0b: traffic from default uses initial red', () => {
    const r = getReachableStates(trafficConfig);
    expect(r).toContain('red');
  });
  it('reachable 1a: traffic from red reachable has all 3 states', () => {
    const r = getReachableStates(trafficConfig, 'red');
    expect(r.sort()).toEqual(['green','red','yellow']);
  });
  it('reachable 1b: traffic from default uses initial red', () => {
    const r = getReachableStates(trafficConfig);
    expect(r).toContain('red');
  });
  it('reachable 2a: traffic from red reachable has all 3 states', () => {
    const r = getReachableStates(trafficConfig, 'red');
    expect(r.sort()).toEqual(['green','red','yellow']);
  });
  it('reachable 2b: traffic from default uses initial red', () => {
    const r = getReachableStates(trafficConfig);
    expect(r).toContain('red');
  });
  it('reachable 3a: traffic from red reachable has all 3 states', () => {
    const r = getReachableStates(trafficConfig, 'red');
    expect(r.sort()).toEqual(['green','red','yellow']);
  });
  it('reachable 3b: traffic from default uses initial red', () => {
    const r = getReachableStates(trafficConfig);
    expect(r).toContain('red');
  });
  it('reachable 4a: traffic from red reachable has all 3 states', () => {
    const r = getReachableStates(trafficConfig, 'red');
    expect(r.sort()).toEqual(['green','red','yellow']);
  });
  it('reachable 4b: traffic from default uses initial red', () => {
    const r = getReachableStates(trafficConfig);
    expect(r).toContain('red');
  });
  it('reachable 5a: traffic from red reachable has all 3 states', () => {
    const r = getReachableStates(trafficConfig, 'red');
    expect(r.sort()).toEqual(['green','red','yellow']);
  });
  it('reachable 5b: traffic from default uses initial red', () => {
    const r = getReachableStates(trafficConfig);
    expect(r).toContain('red');
  });
  it('reachable 6a: traffic from red reachable has all 3 states', () => {
    const r = getReachableStates(trafficConfig, 'red');
    expect(r.sort()).toEqual(['green','red','yellow']);
  });
  it('reachable 6b: traffic from default uses initial red', () => {
    const r = getReachableStates(trafficConfig);
    expect(r).toContain('red');
  });
  it('reachable 7a: traffic from red reachable has all 3 states', () => {
    const r = getReachableStates(trafficConfig, 'red');
    expect(r.sort()).toEqual(['green','red','yellow']);
  });
  it('reachable 7b: traffic from default uses initial red', () => {
    const r = getReachableStates(trafficConfig);
    expect(r).toContain('red');
  });
  it('reachable 8a: traffic from red reachable has all 3 states', () => {
    const r = getReachableStates(trafficConfig, 'red');
    expect(r.sort()).toEqual(['green','red','yellow']);
  });
  it('reachable 8b: traffic from default uses initial red', () => {
    const r = getReachableStates(trafficConfig);
    expect(r).toContain('red');
  });
  it('reachable 9a: traffic from red reachable has all 3 states', () => {
    const r = getReachableStates(trafficConfig, 'red');
    expect(r.sort()).toEqual(['green','red','yellow']);
  });
  it('reachable 9b: traffic from default uses initial red', () => {
    const r = getReachableStates(trafficConfig);
    expect(r).toContain('red');
  });
  it('reachable 10a: traffic from red reachable has all 3 states', () => {
    const r = getReachableStates(trafficConfig, 'red');
    expect(r.sort()).toEqual(['green','red','yellow']);
  });
  it('reachable 10b: traffic from default uses initial red', () => {
    const r = getReachableStates(trafficConfig);
    expect(r).toContain('red');
  });
  it('reachable 11a: traffic from red reachable has all 3 states', () => {
    const r = getReachableStates(trafficConfig, 'red');
    expect(r.sort()).toEqual(['green','red','yellow']);
  });
  it('reachable 11b: traffic from default uses initial red', () => {
    const r = getReachableStates(trafficConfig);
    expect(r).toContain('red');
  });
  it('reachable 12a: traffic from red reachable has all 3 states', () => {
    const r = getReachableStates(trafficConfig, 'red');
    expect(r.sort()).toEqual(['green','red','yellow']);
  });
});

describe('hasPath', () => {
  it('hasPath 0a: red->green has path', () => { expect(hasPath(trafficConfig,'red','green')).toBe(true); });
  it('hasPath 0b: red->yellow has path', () => { expect(hasPath(trafficConfig,'red','yellow')).toBe(true); });
  it('hasPath 0c: same state has path to itself', () => { expect(hasPath(trafficConfig,'red','red')).toBe(true); });
  it('hasPath 1a: red->green has path', () => { expect(hasPath(trafficConfig,'red','green')).toBe(true); });
  it('hasPath 1b: red->yellow has path', () => { expect(hasPath(trafficConfig,'red','yellow')).toBe(true); });
  it('hasPath 1c: same state has path to itself', () => { expect(hasPath(trafficConfig,'red','red')).toBe(true); });
  it('hasPath 2a: red->green has path', () => { expect(hasPath(trafficConfig,'red','green')).toBe(true); });
  it('hasPath 2b: red->yellow has path', () => { expect(hasPath(trafficConfig,'red','yellow')).toBe(true); });
  it('hasPath 2c: same state has path to itself', () => { expect(hasPath(trafficConfig,'red','red')).toBe(true); });
  it('hasPath 3a: red->green has path', () => { expect(hasPath(trafficConfig,'red','green')).toBe(true); });
  it('hasPath 3b: red->yellow has path', () => { expect(hasPath(trafficConfig,'red','yellow')).toBe(true); });
  it('hasPath 3c: same state has path to itself', () => { expect(hasPath(trafficConfig,'red','red')).toBe(true); });
  it('hasPath 4a: red->green has path', () => { expect(hasPath(trafficConfig,'red','green')).toBe(true); });
  it('hasPath 4b: red->yellow has path', () => { expect(hasPath(trafficConfig,'red','yellow')).toBe(true); });
  it('hasPath 4c: same state has path to itself', () => { expect(hasPath(trafficConfig,'red','red')).toBe(true); });
  it('hasPath 5a: red->green has path', () => { expect(hasPath(trafficConfig,'red','green')).toBe(true); });
  it('hasPath 5b: red->yellow has path', () => { expect(hasPath(trafficConfig,'red','yellow')).toBe(true); });
  it('hasPath 5c: same state has path to itself', () => { expect(hasPath(trafficConfig,'red','red')).toBe(true); });
  it('hasPath 6a: red->green has path', () => { expect(hasPath(trafficConfig,'red','green')).toBe(true); });
  it('hasPath 6b: red->yellow has path', () => { expect(hasPath(trafficConfig,'red','yellow')).toBe(true); });
  it('hasPath 6c: same state has path to itself', () => { expect(hasPath(trafficConfig,'red','red')).toBe(true); });
  it('hasPath 7a: red->green has path', () => { expect(hasPath(trafficConfig,'red','green')).toBe(true); });
  it('hasPath 7b: red->yellow has path', () => { expect(hasPath(trafficConfig,'red','yellow')).toBe(true); });
  it('hasPath 7c: same state has path to itself', () => { expect(hasPath(trafficConfig,'red','red')).toBe(true); });
  it('hasPath 8a: red->green has path', () => { expect(hasPath(trafficConfig,'red','green')).toBe(true); });
  it('hasPath 8b: red->yellow has path', () => { expect(hasPath(trafficConfig,'red','yellow')).toBe(true); });
  it('hasPath 8c: same state has path to itself', () => { expect(hasPath(trafficConfig,'red','red')).toBe(true); });
  it('hasPath 9a: red->green has path', () => { expect(hasPath(trafficConfig,'red','green')).toBe(true); });
  it('hasPath 9b: red->yellow has path', () => { expect(hasPath(trafficConfig,'red','yellow')).toBe(true); });
  it('hasPath 9c: same state has path to itself', () => { expect(hasPath(trafficConfig,'red','red')).toBe(true); });
  it('hasPath 10a: red->green has path', () => { expect(hasPath(trafficConfig,'red','green')).toBe(true); });
  it('hasPath 10b: red->yellow has path', () => { expect(hasPath(trafficConfig,'red','yellow')).toBe(true); });
  it('hasPath 10c: same state has path to itself', () => { expect(hasPath(trafficConfig,'red','red')).toBe(true); });
  it('hasPath 11a: red->green has path', () => { expect(hasPath(trafficConfig,'red','green')).toBe(true); });
  it('hasPath 11b: red->yellow has path', () => { expect(hasPath(trafficConfig,'red','yellow')).toBe(true); });
  it('hasPath 11c: same state has path to itself', () => { expect(hasPath(trafficConfig,'red','red')).toBe(true); });
  it('hasPath 12a: red->green has path', () => { expect(hasPath(trafficConfig,'red','green')).toBe(true); });
  it('hasPath 12b: red->yellow has path', () => { expect(hasPath(trafficConfig,'red','yellow')).toBe(true); });
  it('hasPath 12c: same state has path to itself', () => { expect(hasPath(trafficConfig,'red','red')).toBe(true); });
  it('hasPath 13a: red->green has path', () => { expect(hasPath(trafficConfig,'red','green')).toBe(true); });
  it('hasPath 13b: red->yellow has path', () => { expect(hasPath(trafficConfig,'red','yellow')).toBe(true); });
  it('hasPath 13c: same state has path to itself', () => { expect(hasPath(trafficConfig,'red','red')).toBe(true); });
  it('hasPath 14a: red->green has path', () => { expect(hasPath(trafficConfig,'red','green')).toBe(true); });
  it('hasPath 14b: red->yellow has path', () => { expect(hasPath(trafficConfig,'red','yellow')).toBe(true); });
  it('hasPath 14c: same state has path to itself', () => { expect(hasPath(trafficConfig,'red','red')).toBe(true); });
  it('hasPath 15a: red->green has path', () => { expect(hasPath(trafficConfig,'red','green')).toBe(true); });
  it('hasPath 15b: red->yellow has path', () => { expect(hasPath(trafficConfig,'red','yellow')).toBe(true); });
  it('hasPath 15c: same state has path to itself', () => { expect(hasPath(trafficConfig,'red','red')).toBe(true); });
  it('hasPath 16a: red->green has path', () => { expect(hasPath(trafficConfig,'red','green')).toBe(true); });
  it('hasPath 16b: red->yellow has path', () => { expect(hasPath(trafficConfig,'red','yellow')).toBe(true); });
  it('hasPath 16c: same state has path to itself', () => { expect(hasPath(trafficConfig,'red','red')).toBe(true); });
  it('hasPath 17a: red->green has path', () => { expect(hasPath(trafficConfig,'red','green')).toBe(true); });
  it('hasPath 17b: red->yellow has path', () => { expect(hasPath(trafficConfig,'red','yellow')).toBe(true); });
  it('hasPath 17c: same state has path to itself', () => { expect(hasPath(trafficConfig,'red','red')).toBe(true); });
  it('hasPath 18a: red->green has path', () => { expect(hasPath(trafficConfig,'red','green')).toBe(true); });
  it('hasPath 18b: red->yellow has path', () => { expect(hasPath(trafficConfig,'red','yellow')).toBe(true); });
  it('hasPath 18c: same state has path to itself', () => { expect(hasPath(trafficConfig,'red','red')).toBe(true); });
  it('hasPath 19a: red->green has path', () => { expect(hasPath(trafficConfig,'red','green')).toBe(true); });
  it('hasPath 19b: red->yellow has path', () => { expect(hasPath(trafficConfig,'red','yellow')).toBe(true); });
  it('hasPath 19c: same state has path to itself', () => { expect(hasPath(trafficConfig,'red','red')).toBe(true); });
  it('hasPath 20a: red->green has path', () => { expect(hasPath(trafficConfig,'red','green')).toBe(true); });
  it('hasPath 20b: red->yellow has path', () => { expect(hasPath(trafficConfig,'red','yellow')).toBe(true); });
  it('hasPath 20c: same state has path to itself', () => { expect(hasPath(trafficConfig,'red','red')).toBe(true); });
  it('hasPath 21a: red->green has path', () => { expect(hasPath(trafficConfig,'red','green')).toBe(true); });
  it('hasPath 21b: red->yellow has path', () => { expect(hasPath(trafficConfig,'red','yellow')).toBe(true); });
  it('hasPath 21c: same state has path to itself', () => { expect(hasPath(trafficConfig,'red','red')).toBe(true); });
  it('hasPath 22a: red->green has path', () => { expect(hasPath(trafficConfig,'red','green')).toBe(true); });
  it('hasPath 22b: red->yellow has path', () => { expect(hasPath(trafficConfig,'red','yellow')).toBe(true); });
  it('hasPath 22c: same state has path to itself', () => { expect(hasPath(trafficConfig,'red','red')).toBe(true); });
  it('hasPath 23a: red->green has path', () => { expect(hasPath(trafficConfig,'red','green')).toBe(true); });
  it('hasPath 23b: red->yellow has path', () => { expect(hasPath(trafficConfig,'red','yellow')).toBe(true); });
  it('hasPath 23c: same state has path to itself', () => { expect(hasPath(trafficConfig,'red','red')).toBe(true); });
  it('hasPath 24a: red->green has path', () => { expect(hasPath(trafficConfig,'red','green')).toBe(true); });
  it('hasPath 24b: red->yellow has path', () => { expect(hasPath(trafficConfig,'red','yellow')).toBe(true); });
  it('hasPath 24c: same state has path to itself', () => { expect(hasPath(trafficConfig,'red','red')).toBe(true); });
  it('hasPath 25a: red->green has path', () => { expect(hasPath(trafficConfig,'red','green')).toBe(true); });
  it('hasPath 25b: red->yellow has path', () => { expect(hasPath(trafficConfig,'red','yellow')).toBe(true); });
  it('hasPath 25c: same state has path to itself', () => { expect(hasPath(trafficConfig,'red','red')).toBe(true); });
  it('hasPath 26a: red->green has path', () => { expect(hasPath(trafficConfig,'red','green')).toBe(true); });
  it('hasPath 26b: red->yellow has path', () => { expect(hasPath(trafficConfig,'red','yellow')).toBe(true); });
  it('hasPath 26c: same state has path to itself', () => { expect(hasPath(trafficConfig,'red','red')).toBe(true); });
  it('hasPath 27a: red->green has path', () => { expect(hasPath(trafficConfig,'red','green')).toBe(true); });
  it('hasPath 27b: red->yellow has path', () => { expect(hasPath(trafficConfig,'red','yellow')).toBe(true); });
  it('hasPath 27c: same state has path to itself', () => { expect(hasPath(trafficConfig,'red','red')).toBe(true); });
  it('hasPath 28a: red->green has path', () => { expect(hasPath(trafficConfig,'red','green')).toBe(true); });
  it('hasPath 28b: red->yellow has path', () => { expect(hasPath(trafficConfig,'red','yellow')).toBe(true); });
  it('hasPath 28c: same state has path to itself', () => { expect(hasPath(trafficConfig,'red','red')).toBe(true); });
  it('hasPath 29a: red->green has path', () => { expect(hasPath(trafficConfig,'red','green')).toBe(true); });
  it('hasPath 29b: red->yellow has path', () => { expect(hasPath(trafficConfig,'red','yellow')).toBe(true); });
  it('hasPath 29c: same state has path to itself', () => { expect(hasPath(trafficConfig,'red','red')).toBe(true); });
  it('hasPath 30a: red->green has path', () => { expect(hasPath(trafficConfig,'red','green')).toBe(true); });
  it('hasPath 30b: red->yellow has path', () => { expect(hasPath(trafficConfig,'red','yellow')).toBe(true); });
  it('hasPath 30c: same state has path to itself', () => { expect(hasPath(trafficConfig,'red','red')).toBe(true); });
  it('hasPath 31a: red->green has path', () => { expect(hasPath(trafficConfig,'red','green')).toBe(true); });
  it('hasPath 31b: red->yellow has path', () => { expect(hasPath(trafficConfig,'red','yellow')).toBe(true); });
  it('hasPath 31c: same state has path to itself', () => { expect(hasPath(trafficConfig,'red','red')).toBe(true); });
  it('hasPath 32a: red->green has path', () => { expect(hasPath(trafficConfig,'red','green')).toBe(true); });
  it('hasPath 32b: red->yellow has path', () => { expect(hasPath(trafficConfig,'red','yellow')).toBe(true); });
  it('hasPath 32c: same state has path to itself', () => { expect(hasPath(trafficConfig,'red','red')).toBe(true); });
  it('hasPath login 0a: idle->authenticated', () => { expect(hasPath(loginConfig,'idle','authenticated')).toBe(true); });
});

describe('getTransitionsFrom / getTransitionsTo', () => {
  it('transFrom 0a: from red has 1 transition', () => { expect(getTransitionsFrom(trafficConfig,'red')).toHaveLength(1); });
  it('transFrom 0b: from green has 1 transition', () => { expect(getTransitionsFrom(trafficConfig,'green')).toHaveLength(1); });
  it('transFrom 0c: from yellow has 1 transition', () => { expect(getTransitionsFrom(trafficConfig,'yellow')).toHaveLength(1); });
  it('transTo 0d: to green has 1 transition', () => { expect(getTransitionsTo(trafficConfig,'green')).toHaveLength(1); });
  it('transFrom 1a: from red has 1 transition', () => { expect(getTransitionsFrom(trafficConfig,'red')).toHaveLength(1); });
  it('transFrom 1b: from green has 1 transition', () => { expect(getTransitionsFrom(trafficConfig,'green')).toHaveLength(1); });
  it('transFrom 1c: from yellow has 1 transition', () => { expect(getTransitionsFrom(trafficConfig,'yellow')).toHaveLength(1); });
  it('transTo 1d: to green has 1 transition', () => { expect(getTransitionsTo(trafficConfig,'green')).toHaveLength(1); });
  it('transFrom 2a: from red has 1 transition', () => { expect(getTransitionsFrom(trafficConfig,'red')).toHaveLength(1); });
  it('transFrom 2b: from green has 1 transition', () => { expect(getTransitionsFrom(trafficConfig,'green')).toHaveLength(1); });
  it('transFrom 2c: from yellow has 1 transition', () => { expect(getTransitionsFrom(trafficConfig,'yellow')).toHaveLength(1); });
  it('transTo 2d: to green has 1 transition', () => { expect(getTransitionsTo(trafficConfig,'green')).toHaveLength(1); });
  it('transFrom 3a: from red has 1 transition', () => { expect(getTransitionsFrom(trafficConfig,'red')).toHaveLength(1); });
  it('transFrom 3b: from green has 1 transition', () => { expect(getTransitionsFrom(trafficConfig,'green')).toHaveLength(1); });
  it('transFrom 3c: from yellow has 1 transition', () => { expect(getTransitionsFrom(trafficConfig,'yellow')).toHaveLength(1); });
  it('transTo 3d: to green has 1 transition', () => { expect(getTransitionsTo(trafficConfig,'green')).toHaveLength(1); });
  it('transFrom 4a: from red has 1 transition', () => { expect(getTransitionsFrom(trafficConfig,'red')).toHaveLength(1); });
  it('transFrom 4b: from green has 1 transition', () => { expect(getTransitionsFrom(trafficConfig,'green')).toHaveLength(1); });
  it('transFrom 4c: from yellow has 1 transition', () => { expect(getTransitionsFrom(trafficConfig,'yellow')).toHaveLength(1); });
  it('transTo 4d: to green has 1 transition', () => { expect(getTransitionsTo(trafficConfig,'green')).toHaveLength(1); });
  it('transFrom 5a: from red has 1 transition', () => { expect(getTransitionsFrom(trafficConfig,'red')).toHaveLength(1); });
  it('transFrom 5b: from green has 1 transition', () => { expect(getTransitionsFrom(trafficConfig,'green')).toHaveLength(1); });
  it('transFrom 5c: from yellow has 1 transition', () => { expect(getTransitionsFrom(trafficConfig,'yellow')).toHaveLength(1); });
  it('transTo 5d: to green has 1 transition', () => { expect(getTransitionsTo(trafficConfig,'green')).toHaveLength(1); });
  it('transFrom 6a: from red has 1 transition', () => { expect(getTransitionsFrom(trafficConfig,'red')).toHaveLength(1); });
  it('transFrom 6b: from green has 1 transition', () => { expect(getTransitionsFrom(trafficConfig,'green')).toHaveLength(1); });
  it('transFrom 6c: from yellow has 1 transition', () => { expect(getTransitionsFrom(trafficConfig,'yellow')).toHaveLength(1); });
  it('transTo 6d: to green has 1 transition', () => { expect(getTransitionsTo(trafficConfig,'green')).toHaveLength(1); });
  it('transFrom 7a: from red has 1 transition', () => { expect(getTransitionsFrom(trafficConfig,'red')).toHaveLength(1); });
  it('transFrom 7b: from green has 1 transition', () => { expect(getTransitionsFrom(trafficConfig,'green')).toHaveLength(1); });
  it('transFrom 7c: from yellow has 1 transition', () => { expect(getTransitionsFrom(trafficConfig,'yellow')).toHaveLength(1); });
  it('transTo 7d: to green has 1 transition', () => { expect(getTransitionsTo(trafficConfig,'green')).toHaveLength(1); });
  it('transFrom 8a: from red has 1 transition', () => { expect(getTransitionsFrom(trafficConfig,'red')).toHaveLength(1); });
  it('transFrom 8b: from green has 1 transition', () => { expect(getTransitionsFrom(trafficConfig,'green')).toHaveLength(1); });
  it('transFrom 8c: from yellow has 1 transition', () => { expect(getTransitionsFrom(trafficConfig,'yellow')).toHaveLength(1); });
  it('transTo 8d: to green has 1 transition', () => { expect(getTransitionsTo(trafficConfig,'green')).toHaveLength(1); });
  it('transFrom 9a: from red has 1 transition', () => { expect(getTransitionsFrom(trafficConfig,'red')).toHaveLength(1); });
  it('transFrom 9b: from green has 1 transition', () => { expect(getTransitionsFrom(trafficConfig,'green')).toHaveLength(1); });
  it('transFrom 9c: from yellow has 1 transition', () => { expect(getTransitionsFrom(trafficConfig,'yellow')).toHaveLength(1); });
  it('transTo 9d: to green has 1 transition', () => { expect(getTransitionsTo(trafficConfig,'green')).toHaveLength(1); });
  it('transFrom 10a: from red has 1 transition', () => { expect(getTransitionsFrom(trafficConfig,'red')).toHaveLength(1); });
  it('transFrom 10b: from green has 1 transition', () => { expect(getTransitionsFrom(trafficConfig,'green')).toHaveLength(1); });
  it('transFrom 10c: from yellow has 1 transition', () => { expect(getTransitionsFrom(trafficConfig,'yellow')).toHaveLength(1); });
  it('transTo 10d: to green has 1 transition', () => { expect(getTransitionsTo(trafficConfig,'green')).toHaveLength(1); });
  it('transFrom 11a: from red has 1 transition', () => { expect(getTransitionsFrom(trafficConfig,'red')).toHaveLength(1); });
  it('transFrom 11b: from green has 1 transition', () => { expect(getTransitionsFrom(trafficConfig,'green')).toHaveLength(1); });
  it('transFrom 11c: from yellow has 1 transition', () => { expect(getTransitionsFrom(trafficConfig,'yellow')).toHaveLength(1); });
  it('transTo 11d: to green has 1 transition', () => { expect(getTransitionsTo(trafficConfig,'green')).toHaveLength(1); });
  it('transFrom 12a: from red has 1 transition', () => { expect(getTransitionsFrom(trafficConfig,'red')).toHaveLength(1); });
  it('transFrom 12b: from green has 1 transition', () => { expect(getTransitionsFrom(trafficConfig,'green')).toHaveLength(1); });
  it('transFrom 12c: from yellow has 1 transition', () => { expect(getTransitionsFrom(trafficConfig,'yellow')).toHaveLength(1); });
  it('transTo 12d: to green has 1 transition', () => { expect(getTransitionsTo(trafficConfig,'green')).toHaveLength(1); });
  it('transFrom 13a: from red has 1 transition', () => { expect(getTransitionsFrom(trafficConfig,'red')).toHaveLength(1); });
  it('transFrom 13b: from green has 1 transition', () => { expect(getTransitionsFrom(trafficConfig,'green')).toHaveLength(1); });
  it('transFrom 13c: from yellow has 1 transition', () => { expect(getTransitionsFrom(trafficConfig,'yellow')).toHaveLength(1); });
  it('transTo 13d: to green has 1 transition', () => { expect(getTransitionsTo(trafficConfig,'green')).toHaveLength(1); });
  it('transFrom 14a: from red has 1 transition', () => { expect(getTransitionsFrom(trafficConfig,'red')).toHaveLength(1); });
  it('transFrom 14b: from green has 1 transition', () => { expect(getTransitionsFrom(trafficConfig,'green')).toHaveLength(1); });
  it('transFrom 14c: from yellow has 1 transition', () => { expect(getTransitionsFrom(trafficConfig,'yellow')).toHaveLength(1); });
  it('transTo 14d: to green has 1 transition', () => { expect(getTransitionsTo(trafficConfig,'green')).toHaveLength(1); });
  it('transFrom 15a: from red has 1 transition', () => { expect(getTransitionsFrom(trafficConfig,'red')).toHaveLength(1); });
  it('transFrom 15b: from green has 1 transition', () => { expect(getTransitionsFrom(trafficConfig,'green')).toHaveLength(1); });
  it('transFrom 15c: from yellow has 1 transition', () => { expect(getTransitionsFrom(trafficConfig,'yellow')).toHaveLength(1); });
  it('transTo 15d: to green has 1 transition', () => { expect(getTransitionsTo(trafficConfig,'green')).toHaveLength(1); });
  it('transFrom 16a: from red has 1 transition', () => { expect(getTransitionsFrom(trafficConfig,'red')).toHaveLength(1); });
  it('transFrom 16b: from green has 1 transition', () => { expect(getTransitionsFrom(trafficConfig,'green')).toHaveLength(1); });
  it('transFrom 16c: from yellow has 1 transition', () => { expect(getTransitionsFrom(trafficConfig,'yellow')).toHaveLength(1); });
  it('transTo 16d: to green has 1 transition', () => { expect(getTransitionsTo(trafficConfig,'green')).toHaveLength(1); });
  it('transFrom 17a: from red has 1 transition', () => { expect(getTransitionsFrom(trafficConfig,'red')).toHaveLength(1); });
  it('transFrom 17b: from green has 1 transition', () => { expect(getTransitionsFrom(trafficConfig,'green')).toHaveLength(1); });
  it('transFrom 17c: from yellow has 1 transition', () => { expect(getTransitionsFrom(trafficConfig,'yellow')).toHaveLength(1); });
  it('transTo 17d: to green has 1 transition', () => { expect(getTransitionsTo(trafficConfig,'green')).toHaveLength(1); });
  it('transFrom 18a: from red has 1 transition', () => { expect(getTransitionsFrom(trafficConfig,'red')).toHaveLength(1); });
  it('transFrom 18b: from green has 1 transition', () => { expect(getTransitionsFrom(trafficConfig,'green')).toHaveLength(1); });
  it('transFrom 18c: from yellow has 1 transition', () => { expect(getTransitionsFrom(trafficConfig,'yellow')).toHaveLength(1); });
  it('transTo 18d: to green has 1 transition', () => { expect(getTransitionsTo(trafficConfig,'green')).toHaveLength(1); });
  it('transFrom 19a: from red has 1 transition', () => { expect(getTransitionsFrom(trafficConfig,'red')).toHaveLength(1); });
  it('transFrom 19b: from green has 1 transition', () => { expect(getTransitionsFrom(trafficConfig,'green')).toHaveLength(1); });
  it('transFrom 19c: from yellow has 1 transition', () => { expect(getTransitionsFrom(trafficConfig,'yellow')).toHaveLength(1); });
  it('transTo 19d: to green has 1 transition', () => { expect(getTransitionsTo(trafficConfig,'green')).toHaveLength(1); });
  it('transFrom 20a: from red has 1 transition', () => { expect(getTransitionsFrom(trafficConfig,'red')).toHaveLength(1); });
  it('transFrom 20b: from green has 1 transition', () => { expect(getTransitionsFrom(trafficConfig,'green')).toHaveLength(1); });
  it('transFrom 20c: from yellow has 1 transition', () => { expect(getTransitionsFrom(trafficConfig,'yellow')).toHaveLength(1); });
  it('transTo 20d: to green has 1 transition', () => { expect(getTransitionsTo(trafficConfig,'green')).toHaveLength(1); });
  it('transFrom 21a: from red has 1 transition', () => { expect(getTransitionsFrom(trafficConfig,'red')).toHaveLength(1); });
  it('transFrom 21b: from green has 1 transition', () => { expect(getTransitionsFrom(trafficConfig,'green')).toHaveLength(1); });
  it('transFrom 21c: from yellow has 1 transition', () => { expect(getTransitionsFrom(trafficConfig,'yellow')).toHaveLength(1); });
  it('transTo 21d: to green has 1 transition', () => { expect(getTransitionsTo(trafficConfig,'green')).toHaveLength(1); });
  it('transFrom 22a: from red has 1 transition', () => { expect(getTransitionsFrom(trafficConfig,'red')).toHaveLength(1); });
  it('transFrom 22b: from green has 1 transition', () => { expect(getTransitionsFrom(trafficConfig,'green')).toHaveLength(1); });
  it('transFrom 22c: from yellow has 1 transition', () => { expect(getTransitionsFrom(trafficConfig,'yellow')).toHaveLength(1); });
  it('transTo 22d: to green has 1 transition', () => { expect(getTransitionsTo(trafficConfig,'green')).toHaveLength(1); });
  it('transFrom 23a: from red has 1 transition', () => { expect(getTransitionsFrom(trafficConfig,'red')).toHaveLength(1); });
  it('transFrom 23b: from green has 1 transition', () => { expect(getTransitionsFrom(trafficConfig,'green')).toHaveLength(1); });
  it('transFrom 23c: from yellow has 1 transition', () => { expect(getTransitionsFrom(trafficConfig,'yellow')).toHaveLength(1); });
  it('transTo 23d: to green has 1 transition', () => { expect(getTransitionsTo(trafficConfig,'green')).toHaveLength(1); });
  it('transFrom 24a: from red has 1 transition', () => { expect(getTransitionsFrom(trafficConfig,'red')).toHaveLength(1); });
  it('transFrom 24b: from green has 1 transition', () => { expect(getTransitionsFrom(trafficConfig,'green')).toHaveLength(1); });
  it('transFrom 24c: from yellow has 1 transition', () => { expect(getTransitionsFrom(trafficConfig,'yellow')).toHaveLength(1); });
  it('transTo 24d: to green has 1 transition', () => { expect(getTransitionsTo(trafficConfig,'green')).toHaveLength(1); });
});

describe('validateFSM', () => {
  it('validate 0a: valid traffic config', () => { expect(validateFSM(trafficConfig).valid).toBe(true); });
  it('validate 0b: valid login config', () => { expect(validateFSM(loginConfig).valid).toBe(true); });
  it('validate 0c: invalid initial reports error', () => {
    const cfg = { initial: 'x' as 'red', states: ['red'], transitions: [] };
    expect(validateFSM(cfg).valid).toBe(false);
  });
  it('validate 0d: unknown from state reports error', () => {
    const cfg = { initial: 'red', states: ['red'], transitions: [{ from: 'blue' as 'red', event: 'GO' as 'GO', to: 'red' }] };
    expect(validateFSM(cfg).valid).toBe(false);
  });
  it('validate 0e: no errors on valid', () => { expect(validateFSM(trafficConfig).errors).toHaveLength(0); });
  it('validate 1a: valid traffic config', () => { expect(validateFSM(trafficConfig).valid).toBe(true); });
  it('validate 1b: valid login config', () => { expect(validateFSM(loginConfig).valid).toBe(true); });
  it('validate 1c: invalid initial reports error', () => {
    const cfg = { initial: 'x' as 'red', states: ['red'], transitions: [] };
    expect(validateFSM(cfg).valid).toBe(false);
  });
  it('validate 1d: unknown from state reports error', () => {
    const cfg = { initial: 'red', states: ['red'], transitions: [{ from: 'blue' as 'red', event: 'GO' as 'GO', to: 'red' }] };
    expect(validateFSM(cfg).valid).toBe(false);
  });
  it('validate 1e: no errors on valid', () => { expect(validateFSM(trafficConfig).errors).toHaveLength(0); });
  it('validate 2a: valid traffic config', () => { expect(validateFSM(trafficConfig).valid).toBe(true); });
  it('validate 2b: valid login config', () => { expect(validateFSM(loginConfig).valid).toBe(true); });
  it('validate 2c: invalid initial reports error', () => {
    const cfg = { initial: 'x' as 'red', states: ['red'], transitions: [] };
    expect(validateFSM(cfg).valid).toBe(false);
  });
  it('validate 2d: unknown from state reports error', () => {
    const cfg = { initial: 'red', states: ['red'], transitions: [{ from: 'blue' as 'red', event: 'GO' as 'GO', to: 'red' }] };
    expect(validateFSM(cfg).valid).toBe(false);
  });
  it('validate 2e: no errors on valid', () => { expect(validateFSM(trafficConfig).errors).toHaveLength(0); });
  it('validate 3a: valid traffic config', () => { expect(validateFSM(trafficConfig).valid).toBe(true); });
  it('validate 3b: valid login config', () => { expect(validateFSM(loginConfig).valid).toBe(true); });
  it('validate 3c: invalid initial reports error', () => {
    const cfg = { initial: 'x' as 'red', states: ['red'], transitions: [] };
    expect(validateFSM(cfg).valid).toBe(false);
  });
  it('validate 3d: unknown from state reports error', () => {
    const cfg = { initial: 'red', states: ['red'], transitions: [{ from: 'blue' as 'red', event: 'GO' as 'GO', to: 'red' }] };
    expect(validateFSM(cfg).valid).toBe(false);
  });
  it('validate 3e: no errors on valid', () => { expect(validateFSM(trafficConfig).errors).toHaveLength(0); });
  it('validate 4a: valid traffic config', () => { expect(validateFSM(trafficConfig).valid).toBe(true); });
  it('validate 4b: valid login config', () => { expect(validateFSM(loginConfig).valid).toBe(true); });
  it('validate 4c: invalid initial reports error', () => {
    const cfg = { initial: 'x' as 'red', states: ['red'], transitions: [] };
    expect(validateFSM(cfg).valid).toBe(false);
  });
});

describe('serializeFSM', () => {
  it('serialize 0a: initial state', () => {
    const s = serializeFSM(createFSM(trafficConfig));
    expect(s.current).toBe('red');
    expect(s.history).toEqual(['red']);
  });
  it('serialize 0b: after transitions', () => {
    const f = createFSM(trafficConfig); f.send('GO');
    const s = serializeFSM(f);
    expect(s.current).toBe('green');
    expect(s.history).toEqual(['red','green']);
  });
  it('serialize 0c: login after success', () => {
    const f = createFSM(loginConfig); f.send('SUBMIT').send('SUCCESS');
    const s = serializeFSM(f);
    expect(s.current).toBe('authenticated');
  });
  it('serialize 1a: initial state', () => {
    const s = serializeFSM(createFSM(trafficConfig));
    expect(s.current).toBe('red');
    expect(s.history).toEqual(['red']);
  });
  it('serialize 1b: after transitions', () => {
    const f = createFSM(trafficConfig); f.send('GO');
    const s = serializeFSM(f);
    expect(s.current).toBe('green');
    expect(s.history).toEqual(['red','green']);
  });
  it('serialize 1c: login after success', () => {
    const f = createFSM(loginConfig); f.send('SUBMIT').send('SUCCESS');
    const s = serializeFSM(f);
    expect(s.current).toBe('authenticated');
  });
  it('serialize 2a: initial state', () => {
    const s = serializeFSM(createFSM(trafficConfig));
    expect(s.current).toBe('red');
    expect(s.history).toEqual(['red']);
  });
  it('serialize 2b: after transitions', () => {
    const f = createFSM(trafficConfig); f.send('GO');
    const s = serializeFSM(f);
    expect(s.current).toBe('green');
    expect(s.history).toEqual(['red','green']);
  });
  it('serialize 2c: login after success', () => {
    const f = createFSM(loginConfig); f.send('SUBMIT').send('SUCCESS');
    const s = serializeFSM(f);
    expect(s.current).toBe('authenticated');
  });
  it('serialize 3a: initial state', () => {
    const s = serializeFSM(createFSM(trafficConfig));
});

describe('guard and action on transitions', () => {
  it('guard 0a: blocked when guard returns false', () => {
    const cfg: FSMConfig<'on'|'off', 'TOGGLE'> = {
      initial: 'on', states: ['on','off'],
      transitions: [{ from: 'on', event: 'TOGGLE', to: 'off', guard: () => false }],
    };
    const f = createFSM(cfg); f.send('TOGGLE');
    expect(f.current).toBe('on');
  });
  it('guard 0b: allowed when guard returns true', () => {
    const cfg: FSMConfig<'on'|'off', 'TOGGLE'> = {
      initial: 'on', states: ['on','off'],
      transitions: [{ from: 'on', event: 'TOGGLE', to: 'off', guard: () => true }],
    };
    const f = createFSM(cfg); f.send('TOGGLE');
    expect(f.current).toBe('off');
  });
  it('guard 0c: action fires on transition', () => {
    let called = false;
    const cfg: FSMConfig<'on'|'off', 'TOGGLE'> = {
      initial: 'on', states: ['on','off'],
      transitions: [{ from: 'on', event: 'TOGGLE', to: 'off', action: () => { called = true; } }],
    };
    createFSM(cfg).send('TOGGLE');
    expect(called).toBe(true);
  });
  it('guard 0d: action does not fire when guard blocks', () => {
    let called = false;
    const cfg: FSMConfig<'on'|'off', 'TOGGLE'> = {
      initial: 'on', states: ['on','off'],
      transitions: [{ from: 'on', event: 'TOGGLE', to: 'off', guard: () => false, action: () => { called = true; } }],
    };
    createFSM(cfg).send('TOGGLE');
    expect(called).toBe(false);
  });
  it('guard 1a: blocked when guard returns false', () => {
    const cfg: FSMConfig<'on'|'off', 'TOGGLE'> = {
      initial: 'on', states: ['on','off'],
      transitions: [{ from: 'on', event: 'TOGGLE', to: 'off', guard: () => false }],
    };
    const f = createFSM(cfg); f.send('TOGGLE');
    expect(f.current).toBe('on');
  });
  it('guard 1b: allowed when guard returns true', () => {
    const cfg: FSMConfig<'on'|'off', 'TOGGLE'> = {
      initial: 'on', states: ['on','off'],
      transitions: [{ from: 'on', event: 'TOGGLE', to: 'off', guard: () => true }],
    };
    const f = createFSM(cfg); f.send('TOGGLE');
    expect(f.current).toBe('off');
  });
  it('guard 1c: action fires on transition', () => {
    let called = false;
    const cfg: FSMConfig<'on'|'off', 'TOGGLE'> = {
      initial: 'on', states: ['on','off'],
      transitions: [{ from: 'on', event: 'TOGGLE', to: 'off', action: () => { called = true; } }],
    };
    createFSM(cfg).send('TOGGLE');
    expect(called).toBe(true);
  });
  it('guard 1d: action does not fire when guard blocks', () => {
    let called = false;
    const cfg: FSMConfig<'on'|'off', 'TOGGLE'> = {
      initial: 'on', states: ['on','off'],
      transitions: [{ from: 'on', event: 'TOGGLE', to: 'off', guard: () => false, action: () => { called = true; } }],
    };
    createFSM(cfg).send('TOGGLE');
    expect(called).toBe(false);
  });
  it('guard 2a: blocked when guard returns false', () => {
    const cfg: FSMConfig<'on'|'off', 'TOGGLE'> = {
      initial: 'on', states: ['on','off'],
      transitions: [{ from: 'on', event: 'TOGGLE', to: 'off', guard: () => false }],
    };
    const f = createFSM(cfg); f.send('TOGGLE');
    expect(f.current).toBe('on');
  });
  it('guard 2b: allowed when guard returns true', () => {
    const cfg: FSMConfig<'on'|'off', 'TOGGLE'> = {
      initial: 'on', states: ['on','off'],
      transitions: [{ from: 'on', event: 'TOGGLE', to: 'off', guard: () => true }],
});

describe('Extra edge cases and coverage', () => {
  it('extra 0a: send returns same FSM instance for chaining', () => {
    const f = createFSM(trafficConfig);
    expect(f.send('GO')).toBe(f);
  });
  it('extra 0b: reset returns same FSM instance', () => {
    const f = createFSM(trafficConfig);
    expect(f.reset()).toBe(f);
  });
  it('extra 0c: invalid event does not change history length', () => {
    const f = createFSM(trafficConfig);
    f.send('STOP' as any);
    expect(f.history()).toHaveLength(1);
  });
  it('extra 0d: multiple resets keep history at 1', () => {
    const f = createFSM(trafficConfig);
    f.send('GO').reset().send('GO').reset();
    expect(f.history()).toHaveLength(1);
  });
  it('extra 0e: getReachableStates returns array', () => {
    expect(Array.isArray(getReachableStates(trafficConfig))).toBe(true);
  });
  it('extra 1a: send returns same FSM instance for chaining', () => {
    const f = createFSM(trafficConfig);
    expect(f.send('GO')).toBe(f);
  });
  it('extra 1b: reset returns same FSM instance', () => {
    const f = createFSM(trafficConfig);
    expect(f.reset()).toBe(f);
  });
  it('extra 1c: invalid event does not change history length', () => {
    const f = createFSM(trafficConfig);
    f.send('STOP' as any);
    expect(f.history()).toHaveLength(1);
  });
  it('extra 1d: multiple resets keep history at 1', () => {
    const f = createFSM(trafficConfig);
    f.send('GO').reset().send('GO').reset();
    expect(f.history()).toHaveLength(1);
  });
  it('extra 1e: getReachableStates returns array', () => {
    expect(Array.isArray(getReachableStates(trafficConfig))).toBe(true);
  });
  it('extra 2a: send returns same FSM instance for chaining', () => {
    const f = createFSM(trafficConfig);
    expect(f.send('GO')).toBe(f);
  });
  it('extra 2b: reset returns same FSM instance', () => {
    const f = createFSM(trafficConfig);
    expect(f.reset()).toBe(f);
  });
  it('extra 2c: invalid event does not change history length', () => {
    const f = createFSM(trafficConfig);
    f.send('STOP' as any);
    expect(f.history()).toHaveLength(1);
  });
  it('extra 2d: multiple resets keep history at 1', () => {
    const f = createFSM(trafficConfig);
    f.send('GO').reset().send('GO').reset();
    expect(f.history()).toHaveLength(1);
  });
  it('extra 2e: getReachableStates returns array', () => {
    expect(Array.isArray(getReachableStates(trafficConfig))).toBe(true);
  });
  it('extra 3a: send returns same FSM instance for chaining', () => {
    const f = createFSM(trafficConfig);
    expect(f.send('GO')).toBe(f);
  });
  it('extra 3b: reset returns same FSM instance', () => {
    const f = createFSM(trafficConfig);
    expect(f.reset()).toBe(f);
  });
  it('extra 3c: invalid event does not change history length', () => {
    const f = createFSM(trafficConfig);
    f.send('STOP' as any);
    expect(f.history()).toHaveLength(1);
  });
  it('extra 3d: multiple resets keep history at 1', () => {
    const f = createFSM(trafficConfig);
    f.send('GO').reset().send('GO').reset();
    expect(f.history()).toHaveLength(1);
  });
  it('extra 3e: getReachableStates returns array', () => {
    expect(Array.isArray(getReachableStates(trafficConfig))).toBe(true);
  });
  it('extra 4a: send returns same FSM instance for chaining', () => {
    const f = createFSM(trafficConfig);
    expect(f.send('GO')).toBe(f);
  });
  it('extra 4b: reset returns same FSM instance', () => {
    const f = createFSM(trafficConfig);
    expect(f.reset()).toBe(f);
  });
  it('extra 4c: invalid event does not change history length', () => {
    const f = createFSM(trafficConfig);
    f.send('STOP' as any);
    expect(f.history()).toHaveLength(1);
  });
  it('extra 4d: multiple resets keep history at 1', () => {
    const f = createFSM(trafficConfig);
    f.send('GO').reset().send('GO').reset();
    expect(f.history()).toHaveLength(1);
  });
  it('extra 4e: getReachableStates returns array', () => {
    expect(Array.isArray(getReachableStates(trafficConfig))).toBe(true);
  });
  it('extra 5a: send returns same FSM instance for chaining', () => {
    const f = createFSM(trafficConfig);
    expect(f.send('GO')).toBe(f);
  });
  it('extra 5b: reset returns same FSM instance', () => {
    const f = createFSM(trafficConfig);
    expect(f.reset()).toBe(f);
  });
  it('extra 5c: invalid event does not change history length', () => {
    const f = createFSM(trafficConfig);
    f.send('STOP' as any);
    expect(f.history()).toHaveLength(1);
  });
  it('extra 5d: multiple resets keep history at 1', () => {
    const f = createFSM(trafficConfig);
    f.send('GO').reset().send('GO').reset();
    expect(f.history()).toHaveLength(1);
  });
  it('extra 5e: getReachableStates returns array', () => {
    expect(Array.isArray(getReachableStates(trafficConfig))).toBe(true);
  });
  it('extra 6a: send returns same FSM instance for chaining', () => {
    const f = createFSM(trafficConfig);
    expect(f.send('GO')).toBe(f);
  });
  it('extra 6b: reset returns same FSM instance', () => {
    const f = createFSM(trafficConfig);
    expect(f.reset()).toBe(f);
  });
  it('extra 6c: invalid event does not change history length', () => {
    const f = createFSM(trafficConfig);
    f.send('STOP' as any);
    expect(f.history()).toHaveLength(1);
  });
  it('extra 6d: multiple resets keep history at 1', () => {
    const f = createFSM(trafficConfig);
    f.send('GO').reset().send('GO').reset();
    expect(f.history()).toHaveLength(1);
  });
  it('extra 6e: getReachableStates returns array', () => {
    expect(Array.isArray(getReachableStates(trafficConfig))).toBe(true);
  });
  it('extra 7a: send returns same FSM instance for chaining', () => {
    const f = createFSM(trafficConfig);
    expect(f.send('GO')).toBe(f);
  });
  it('extra 7b: reset returns same FSM instance', () => {
    const f = createFSM(trafficConfig);
    expect(f.reset()).toBe(f);
  });
  it('extra 7c: invalid event does not change history length', () => {
    const f = createFSM(trafficConfig);
    f.send('STOP' as any);
    expect(f.history()).toHaveLength(1);
  });
  it('extra 7d: multiple resets keep history at 1', () => {
    const f = createFSM(trafficConfig);
    f.send('GO').reset().send('GO').reset();
    expect(f.history()).toHaveLength(1);
  });
  it('extra 7e: getReachableStates returns array', () => {
    expect(Array.isArray(getReachableStates(trafficConfig))).toBe(true);
  });
  it('extra 8a: send returns same FSM instance for chaining', () => {
    const f = createFSM(trafficConfig);
    expect(f.send('GO')).toBe(f);
  });
  it('extra 8b: reset returns same FSM instance', () => {
    const f = createFSM(trafficConfig);
    expect(f.reset()).toBe(f);
  });
  it('extra 8c: invalid event does not change history length', () => {
    const f = createFSM(trafficConfig);
    f.send('STOP' as any);
    expect(f.history()).toHaveLength(1);
  });
  it('extra 8d: multiple resets keep history at 1', () => {
    const f = createFSM(trafficConfig);
    f.send('GO').reset().send('GO').reset();
    expect(f.history()).toHaveLength(1);
  });
  it('extra 8e: getReachableStates returns array', () => {
    expect(Array.isArray(getReachableStates(trafficConfig))).toBe(true);
  });
  it('extra 9a: send returns same FSM instance for chaining', () => {
    const f = createFSM(trafficConfig);
    expect(f.send('GO')).toBe(f);
  });
  it('extra 9b: reset returns same FSM instance', () => {
    const f = createFSM(trafficConfig);
    expect(f.reset()).toBe(f);
  });
  it('extra 9c: invalid event does not change history length', () => {
    const f = createFSM(trafficConfig);
    f.send('STOP' as any);
});


describe('Additional send coverage', () => {
  it('add-send 0a: order pending->cancelled direct', () => {
    const f = createFSM(orderConfig); f.send('CANCEL');
    expect(f.current).toBe('cancelled');
  });
  it('add-send 0b: order full happy path', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.current).toBe('delivered');
  });
  it('add-send 0c: order isFinal after deliver', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.isFinal()).toBe(true);
  });
  it('add-send 1a: order pending->cancelled direct', () => {
    const f = createFSM(orderConfig); f.send('CANCEL');
    expect(f.current).toBe('cancelled');
  });
  it('add-send 1b: order full happy path', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.current).toBe('delivered');
  });
  it('add-send 1c: order isFinal after deliver', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.isFinal()).toBe(true);
  });
  it('add-send 2a: order pending->cancelled direct', () => {
    const f = createFSM(orderConfig); f.send('CANCEL');
    expect(f.current).toBe('cancelled');
  });
  it('add-send 2b: order full happy path', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.current).toBe('delivered');
  });
  it('add-send 2c: order isFinal after deliver', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.isFinal()).toBe(true);
  });
  it('add-send 3a: order pending->cancelled direct', () => {
    const f = createFSM(orderConfig); f.send('CANCEL');
    expect(f.current).toBe('cancelled');
  });
  it('add-send 3b: order full happy path', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.current).toBe('delivered');
  });
  it('add-send 3c: order isFinal after deliver', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.isFinal()).toBe(true);
  });
  it('add-send 4a: order pending->cancelled direct', () => {
    const f = createFSM(orderConfig); f.send('CANCEL');
    expect(f.current).toBe('cancelled');
  });
  it('add-send 4b: order full happy path', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.current).toBe('delivered');
  });
  it('add-send 4c: order isFinal after deliver', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.isFinal()).toBe(true);
  });
  it('add-send 5a: order pending->cancelled direct', () => {
    const f = createFSM(orderConfig); f.send('CANCEL');
    expect(f.current).toBe('cancelled');
  });
  it('add-send 5b: order full happy path', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.current).toBe('delivered');
  });
  it('add-send 5c: order isFinal after deliver', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.isFinal()).toBe(true);
  });
  it('add-send 6a: order pending->cancelled direct', () => {
    const f = createFSM(orderConfig); f.send('CANCEL');
    expect(f.current).toBe('cancelled');
  });
  it('add-send 6b: order full happy path', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.current).toBe('delivered');
  });
  it('add-send 6c: order isFinal after deliver', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.isFinal()).toBe(true);
  });
  it('add-send 7a: order pending->cancelled direct', () => {
    const f = createFSM(orderConfig); f.send('CANCEL');
    expect(f.current).toBe('cancelled');
  });
  it('add-send 7b: order full happy path', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.current).toBe('delivered');
  });
  it('add-send 7c: order isFinal after deliver', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.isFinal()).toBe(true);
  });
  it('add-send 8a: order pending->cancelled direct', () => {
    const f = createFSM(orderConfig); f.send('CANCEL');
    expect(f.current).toBe('cancelled');
  });
  it('add-send 8b: order full happy path', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.current).toBe('delivered');
  });
  it('add-send 8c: order isFinal after deliver', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.isFinal()).toBe(true);
  });
  it('add-send 9a: order pending->cancelled direct', () => {
    const f = createFSM(orderConfig); f.send('CANCEL');
    expect(f.current).toBe('cancelled');
  });
  it('add-send 9b: order full happy path', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.current).toBe('delivered');
  });
  it('add-send 9c: order isFinal after deliver', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.isFinal()).toBe(true);
  });
  it('add-send 10a: order pending->cancelled direct', () => {
    const f = createFSM(orderConfig); f.send('CANCEL');
    expect(f.current).toBe('cancelled');
  });
  it('add-send 10b: order full happy path', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.current).toBe('delivered');
  });
  it('add-send 10c: order isFinal after deliver', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.isFinal()).toBe(true);
  });
  it('add-send 11a: order pending->cancelled direct', () => {
    const f = createFSM(orderConfig); f.send('CANCEL');
    expect(f.current).toBe('cancelled');
  });
  it('add-send 11b: order full happy path', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.current).toBe('delivered');
  });
  it('add-send 11c: order isFinal after deliver', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.isFinal()).toBe(true);
  });
  it('add-send 12a: order pending->cancelled direct', () => {
    const f = createFSM(orderConfig); f.send('CANCEL');
    expect(f.current).toBe('cancelled');
  });
  it('add-send 12b: order full happy path', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.current).toBe('delivered');
  });
  it('add-send 12c: order isFinal after deliver', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.isFinal()).toBe(true);
  });
  it('add-send 13a: order pending->cancelled direct', () => {
    const f = createFSM(orderConfig); f.send('CANCEL');
    expect(f.current).toBe('cancelled');
  });
  it('add-send 13b: order full happy path', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.current).toBe('delivered');
  });
  it('add-send 13c: order isFinal after deliver', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.isFinal()).toBe(true);
  });
  it('add-send 14a: order pending->cancelled direct', () => {
    const f = createFSM(orderConfig); f.send('CANCEL');
    expect(f.current).toBe('cancelled');
  });
  it('add-send 14b: order full happy path', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.current).toBe('delivered');
  });
  it('add-send 14c: order isFinal after deliver', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.isFinal()).toBe(true);
  });
  it('add-send 15a: order pending->cancelled direct', () => {
    const f = createFSM(orderConfig); f.send('CANCEL');
    expect(f.current).toBe('cancelled');
  });
  it('add-send 15b: order full happy path', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.current).toBe('delivered');
  });
  it('add-send 15c: order isFinal after deliver', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.isFinal()).toBe(true);
  });
  it('add-send 16a: order pending->cancelled direct', () => {
    const f = createFSM(orderConfig); f.send('CANCEL');
    expect(f.current).toBe('cancelled');
  });
  it('add-send 16b: order full happy path', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.current).toBe('delivered');
  });
  it('add-send 16c: order isFinal after deliver', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.isFinal()).toBe(true);
  });
  it('add-send 17a: order pending->cancelled direct', () => {
    const f = createFSM(orderConfig); f.send('CANCEL');
    expect(f.current).toBe('cancelled');
  });
  it('add-send 17b: order full happy path', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.current).toBe('delivered');
  });
  it('add-send 17c: order isFinal after deliver', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.isFinal()).toBe(true);
  });
  it('add-send 18a: order pending->cancelled direct', () => {
    const f = createFSM(orderConfig); f.send('CANCEL');
    expect(f.current).toBe('cancelled');
  });
  it('add-send 18b: order full happy path', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.current).toBe('delivered');
  });
  it('add-send 18c: order isFinal after deliver', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.isFinal()).toBe(true);
  });
  it('add-send 19a: order pending->cancelled direct', () => {
    const f = createFSM(orderConfig); f.send('CANCEL');
    expect(f.current).toBe('cancelled');
  });
  it('add-send 19b: order full happy path', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.current).toBe('delivered');
  });
  it('add-send 19c: order isFinal after deliver', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.isFinal()).toBe(true);
  });
  it('add-send 20a: order pending->cancelled direct', () => {
    const f = createFSM(orderConfig); f.send('CANCEL');
    expect(f.current).toBe('cancelled');
  });
  it('add-send 20b: order full happy path', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.current).toBe('delivered');
  });
  it('add-send 20c: order isFinal after deliver', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.isFinal()).toBe(true);
  });
  it('add-send 21a: order pending->cancelled direct', () => {
    const f = createFSM(orderConfig); f.send('CANCEL');
    expect(f.current).toBe('cancelled');
  });
  it('add-send 21b: order full happy path', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.current).toBe('delivered');
  });
  it('add-send 21c: order isFinal after deliver', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.isFinal()).toBe(true);
  });
  it('add-send 22a: order pending->cancelled direct', () => {
    const f = createFSM(orderConfig); f.send('CANCEL');
    expect(f.current).toBe('cancelled');
  });
  it('add-send 22b: order full happy path', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.current).toBe('delivered');
  });
  it('add-send 22c: order isFinal after deliver', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.isFinal()).toBe(true);
  });
  it('add-send 23a: order pending->cancelled direct', () => {
    const f = createFSM(orderConfig); f.send('CANCEL');
    expect(f.current).toBe('cancelled');
  });
  it('add-send 23b: order full happy path', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.current).toBe('delivered');
  });
  it('add-send 23c: order isFinal after deliver', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.isFinal()).toBe(true);
  });
  it('add-send 24a: order pending->cancelled direct', () => {
    const f = createFSM(orderConfig); f.send('CANCEL');
    expect(f.current).toBe('cancelled');
  });
  it('add-send 24b: order full happy path', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.current).toBe('delivered');
  });
  it('add-send 24c: order isFinal after deliver', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.isFinal()).toBe(true);
  });
  it('add-send 25a: order pending->cancelled direct', () => {
    const f = createFSM(orderConfig); f.send('CANCEL');
    expect(f.current).toBe('cancelled');
  });
  it('add-send 25b: order full happy path', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.current).toBe('delivered');
  });
  it('add-send 25c: order isFinal after deliver', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.isFinal()).toBe(true);
  });
  it('add-send 26a: order pending->cancelled direct', () => {
    const f = createFSM(orderConfig); f.send('CANCEL');
    expect(f.current).toBe('cancelled');
  });
  it('add-send 26b: order full happy path', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.current).toBe('delivered');
  });
  it('add-send 26c: order isFinal after deliver', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.isFinal()).toBe(true);
  });
  it('add-send 27a: order pending->cancelled direct', () => {
    const f = createFSM(orderConfig); f.send('CANCEL');
    expect(f.current).toBe('cancelled');
  });
  it('add-send 27b: order full happy path', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.current).toBe('delivered');
  });
  it('add-send 27c: order isFinal after deliver', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.isFinal()).toBe(true);
  });
  it('add-send 28a: order pending->cancelled direct', () => {
    const f = createFSM(orderConfig); f.send('CANCEL');
    expect(f.current).toBe('cancelled');
  });
  it('add-send 28b: order full happy path', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.current).toBe('delivered');
  });
  it('add-send 28c: order isFinal after deliver', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.isFinal()).toBe(true);
  });
  it('add-send 29a: order pending->cancelled direct', () => {
    const f = createFSM(orderConfig); f.send('CANCEL');
    expect(f.current).toBe('cancelled');
  });
  it('add-send 29b: order full happy path', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.current).toBe('delivered');
  });
  it('add-send 29c: order isFinal after deliver', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.isFinal()).toBe(true);
  });
  it('add-send 30a: order pending->cancelled direct', () => {
    const f = createFSM(orderConfig); f.send('CANCEL');
    expect(f.current).toBe('cancelled');
  });
  it('add-send 30b: order full happy path', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.current).toBe('delivered');
  });
  it('add-send 30c: order isFinal after deliver', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.isFinal()).toBe(true);
  });
  it('add-send 31a: order pending->cancelled direct', () => {
    const f = createFSM(orderConfig); f.send('CANCEL');
    expect(f.current).toBe('cancelled');
  });
  it('add-send 31b: order full happy path', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.current).toBe('delivered');
  });
  it('add-send 31c: order isFinal after deliver', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.isFinal()).toBe(true);
  });
  it('add-send 32a: order pending->cancelled direct', () => {
    const f = createFSM(orderConfig); f.send('CANCEL');
    expect(f.current).toBe('cancelled');
  });
  it('add-send 32b: order full happy path', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.current).toBe('delivered');
  });
  it('add-send 32c: order isFinal after deliver', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.isFinal()).toBe(true);
  });
  it('add-send 33a: order pending->cancelled direct', () => {
    const f = createFSM(orderConfig); f.send('CANCEL');
    expect(f.current).toBe('cancelled');
  });
  it('add-send 33b: order full happy path', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.current).toBe('delivered');
  });
  it('add-send 33c: order isFinal after deliver', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.isFinal()).toBe(true);
  });
  it('add-send 34a: order pending->cancelled direct', () => {
    const f = createFSM(orderConfig); f.send('CANCEL');
    expect(f.current).toBe('cancelled');
  });
  it('add-send 34b: order full happy path', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.current).toBe('delivered');
  });
  it('add-send 34c: order isFinal after deliver', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.isFinal()).toBe(true);
  });
  it('add-send 35a: order pending->cancelled direct', () => {
    const f = createFSM(orderConfig); f.send('CANCEL');
    expect(f.current).toBe('cancelled');
  });
  it('add-send 35b: order full happy path', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.current).toBe('delivered');
  });
  it('add-send 35c: order isFinal after deliver', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.isFinal()).toBe(true);
  });
  it('add-send 36a: order pending->cancelled direct', () => {
    const f = createFSM(orderConfig); f.send('CANCEL');
    expect(f.current).toBe('cancelled');
  });
  it('add-send 36b: order full happy path', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.current).toBe('delivered');
  });
  it('add-send 36c: order isFinal after deliver', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.isFinal()).toBe(true);
  });
  it('add-send 37a: order pending->cancelled direct', () => {
    const f = createFSM(orderConfig); f.send('CANCEL');
    expect(f.current).toBe('cancelled');
  });
  it('add-send 37b: order full happy path', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.current).toBe('delivered');
  });
  it('add-send 37c: order isFinal after deliver', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.isFinal()).toBe(true);
  });
  it('add-send 38a: order pending->cancelled direct', () => {
    const f = createFSM(orderConfig); f.send('CANCEL');
    expect(f.current).toBe('cancelled');
  });
  it('add-send 38b: order full happy path', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.current).toBe('delivered');
  });
  it('add-send 38c: order isFinal after deliver', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.isFinal()).toBe(true);
  });
  it('add-send 39a: order pending->cancelled direct', () => {
    const f = createFSM(orderConfig); f.send('CANCEL');
    expect(f.current).toBe('cancelled');
  });
  it('add-send 39b: order full happy path', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.current).toBe('delivered');
  });
  it('add-send 39c: order isFinal after deliver', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.isFinal()).toBe(true);
  });
  it('add-send 40a: order pending->cancelled direct', () => {
    const f = createFSM(orderConfig); f.send('CANCEL');
    expect(f.current).toBe('cancelled');
  });
  it('add-send 40b: order full happy path', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.current).toBe('delivered');
  });
  it('add-send 40c: order isFinal after deliver', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.isFinal()).toBe(true);
  });
  it('add-send 41a: order pending->cancelled direct', () => {
    const f = createFSM(orderConfig); f.send('CANCEL');
    expect(f.current).toBe('cancelled');
  });
  it('add-send 41b: order full happy path', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.current).toBe('delivered');
  });
  it('add-send 41c: order isFinal after deliver', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.isFinal()).toBe(true);
  });
  it('add-send 42a: order pending->cancelled direct', () => {
    const f = createFSM(orderConfig); f.send('CANCEL');
    expect(f.current).toBe('cancelled');
  });
  it('add-send 42b: order full happy path', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.current).toBe('delivered');
  });
  it('add-send 42c: order isFinal after deliver', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.isFinal()).toBe(true);
  });
  it('add-send 43a: order pending->cancelled direct', () => {
    const f = createFSM(orderConfig); f.send('CANCEL');
    expect(f.current).toBe('cancelled');
  });
  it('add-send 43b: order full happy path', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.current).toBe('delivered');
  });
  it('add-send 43c: order isFinal after deliver', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.isFinal()).toBe(true);
  });
  it('add-send 44a: order pending->cancelled direct', () => {
    const f = createFSM(orderConfig); f.send('CANCEL');
    expect(f.current).toBe('cancelled');
  });
  it('add-send 44b: order full happy path', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.current).toBe('delivered');
  });
  it('add-send 44c: order isFinal after deliver', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.isFinal()).toBe(true);
  });
  it('add-send 45a: order pending->cancelled direct', () => {
    const f = createFSM(orderConfig); f.send('CANCEL');
    expect(f.current).toBe('cancelled');
  });
  it('add-send 45b: order full happy path', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.current).toBe('delivered');
  });
  it('add-send 45c: order isFinal after deliver', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.isFinal()).toBe(true);
  });
  it('add-send 46a: order pending->cancelled direct', () => {
    const f = createFSM(orderConfig); f.send('CANCEL');
    expect(f.current).toBe('cancelled');
  });
  it('add-send 46b: order full happy path', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.current).toBe('delivered');
  });
  it('add-send 46c: order isFinal after deliver', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.isFinal()).toBe(true);
  });
  it('add-send 47a: order pending->cancelled direct', () => {
    const f = createFSM(orderConfig); f.send('CANCEL');
    expect(f.current).toBe('cancelled');
  });
  it('add-send 47b: order full happy path', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.current).toBe('delivered');
  });
  it('add-send 47c: order isFinal after deliver', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.isFinal()).toBe(true);
  });
  it('add-send 48a: order pending->cancelled direct', () => {
    const f = createFSM(orderConfig); f.send('CANCEL');
    expect(f.current).toBe('cancelled');
  });
  it('add-send 48b: order full happy path', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.current).toBe('delivered');
  });
  it('add-send 48c: order isFinal after deliver', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.isFinal()).toBe(true);
  });
  it('add-send 49a: order pending->cancelled direct', () => {
    const f = createFSM(orderConfig); f.send('CANCEL');
    expect(f.current).toBe('cancelled');
  });
  it('add-send 49b: order full happy path', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.current).toBe('delivered');
  });
  it('add-send 49c: order isFinal after deliver', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.isFinal()).toBe(true);
  });
  it('add-send 50a: order pending->cancelled direct', () => {
    const f = createFSM(orderConfig); f.send('CANCEL');
    expect(f.current).toBe('cancelled');
  });
  it('add-send 50b: order full happy path', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.current).toBe('delivered');
  });
  it('add-send 50c: order isFinal after deliver', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.isFinal()).toBe(true);
  });
  it('add-send 51a: order pending->cancelled direct', () => {
    const f = createFSM(orderConfig); f.send('CANCEL');
    expect(f.current).toBe('cancelled');
  });
  it('add-send 51b: order full happy path', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.current).toBe('delivered');
  });
  it('add-send 51c: order isFinal after deliver', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.isFinal()).toBe(true);
  });
  it('add-send 52a: order pending->cancelled direct', () => {
    const f = createFSM(orderConfig); f.send('CANCEL');
    expect(f.current).toBe('cancelled');
  });
  it('add-send 52b: order full happy path', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.current).toBe('delivered');
  });
  it('add-send 52c: order isFinal after deliver', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.isFinal()).toBe(true);
  });
  it('add-send 53a: order pending->cancelled direct', () => {
    const f = createFSM(orderConfig); f.send('CANCEL');
    expect(f.current).toBe('cancelled');
  });
  it('add-send 53b: order full happy path', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.current).toBe('delivered');
  });
  it('add-send 53c: order isFinal after deliver', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.isFinal()).toBe(true);
  });
  it('add-send 54a: order pending->cancelled direct', () => {
    const f = createFSM(orderConfig); f.send('CANCEL');
    expect(f.current).toBe('cancelled');
  });
  it('add-send 54b: order full happy path', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.current).toBe('delivered');
  });
  it('add-send 54c: order isFinal after deliver', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.isFinal()).toBe(true);
  });
  it('add-send 55a: order pending->cancelled direct', () => {
    const f = createFSM(orderConfig); f.send('CANCEL');
    expect(f.current).toBe('cancelled');
  });
  it('add-send 55b: order full happy path', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.current).toBe('delivered');
  });
  it('add-send 55c: order isFinal after deliver', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.isFinal()).toBe(true);
  });
  it('add-send 56a: order pending->cancelled direct', () => {
    const f = createFSM(orderConfig); f.send('CANCEL');
    expect(f.current).toBe('cancelled');
  });
  it('add-send 56b: order full happy path', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.current).toBe('delivered');
  });
  it('add-send 56c: order isFinal after deliver', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.isFinal()).toBe(true);
  });
  it('add-send 57a: order pending->cancelled direct', () => {
    const f = createFSM(orderConfig); f.send('CANCEL');
    expect(f.current).toBe('cancelled');
  });
  it('add-send 57b: order full happy path', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.current).toBe('delivered');
  });
  it('add-send 57c: order isFinal after deliver', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.isFinal()).toBe(true);
  });
  it('add-send 58a: order pending->cancelled direct', () => {
    const f = createFSM(orderConfig); f.send('CANCEL');
    expect(f.current).toBe('cancelled');
  });
  it('add-send 58b: order full happy path', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.current).toBe('delivered');
  });
  it('add-send 58c: order isFinal after deliver', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.isFinal()).toBe(true);
  });
  it('add-send 59a: order pending->cancelled direct', () => {
    const f = createFSM(orderConfig); f.send('CANCEL');
    expect(f.current).toBe('cancelled');
  });
  it('add-send 59b: order full happy path', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.current).toBe('delivered');
  });
  it('add-send 59c: order isFinal after deliver', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.isFinal()).toBe(true);
  });
  it('add-send 60a: order pending->cancelled direct', () => {
    const f = createFSM(orderConfig); f.send('CANCEL');
    expect(f.current).toBe('cancelled');
  });
  it('add-send 60b: order full happy path', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.current).toBe('delivered');
  });
  it('add-send 60c: order isFinal after deliver', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.isFinal()).toBe(true);
  });
  it('add-send 61a: order pending->cancelled direct', () => {
    const f = createFSM(orderConfig); f.send('CANCEL');
    expect(f.current).toBe('cancelled');
  });
  it('add-send 61b: order full happy path', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.current).toBe('delivered');
  });
  it('add-send 61c: order isFinal after deliver', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.isFinal()).toBe(true);
  });
  it('add-send 62a: order pending->cancelled direct', () => {
    const f = createFSM(orderConfig); f.send('CANCEL');
    expect(f.current).toBe('cancelled');
  });
  it('add-send 62b: order full happy path', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.current).toBe('delivered');
  });
  it('add-send 62c: order isFinal after deliver', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.isFinal()).toBe(true);
  });
  it('add-send 63a: order pending->cancelled direct', () => {
    const f = createFSM(orderConfig); f.send('CANCEL');
    expect(f.current).toBe('cancelled');
  });
  it('add-send 63b: order full happy path', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.current).toBe('delivered');
  });
  it('add-send 63c: order isFinal after deliver', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.isFinal()).toBe(true);
  });
  it('add-send 64a: order pending->cancelled direct', () => {
    const f = createFSM(orderConfig); f.send('CANCEL');
    expect(f.current).toBe('cancelled');
  });
  it('add-send 64b: order full happy path', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.current).toBe('delivered');
  });
  it('add-send 64c: order isFinal after deliver', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.isFinal()).toBe(true);
  });
  it('add-send 65a: order pending->cancelled direct', () => {
    const f = createFSM(orderConfig); f.send('CANCEL');
    expect(f.current).toBe('cancelled');
  });
  it('add-send 65b: order full happy path', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.current).toBe('delivered');
  });
  it('add-send 65c: order isFinal after deliver', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.isFinal()).toBe(true);
  });
  it('add-send 66a: order pending->cancelled direct', () => {
    const f = createFSM(orderConfig); f.send('CANCEL');
    expect(f.current).toBe('cancelled');
  });
  it('add-send 66b: order full happy path', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.current).toBe('delivered');
  });
  it('add-send 66c: order isFinal after deliver', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.isFinal()).toBe(true);
  });
  it('add-send 67a: order pending->cancelled direct', () => {
    const f = createFSM(orderConfig); f.send('CANCEL');
    expect(f.current).toBe('cancelled');
  });
  it('add-send 67b: order full happy path', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.current).toBe('delivered');
  });
  it('add-send 67c: order isFinal after deliver', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.isFinal()).toBe(true);
  });
  it('add-send 68a: order pending->cancelled direct', () => {
    const f = createFSM(orderConfig); f.send('CANCEL');
    expect(f.current).toBe('cancelled');
  });
  it('add-send 68b: order full happy path', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.current).toBe('delivered');
  });
  it('add-send 68c: order isFinal after deliver', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.isFinal()).toBe(true);
  });
  it('add-send 69a: order pending->cancelled direct', () => {
    const f = createFSM(orderConfig); f.send('CANCEL');
    expect(f.current).toBe('cancelled');
  });
  it('add-send 69b: order full happy path', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.current).toBe('delivered');
  });
  it('add-send 69c: order isFinal after deliver', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.isFinal()).toBe(true);
  });
  it('add-send 70a: order pending->cancelled direct', () => {
    const f = createFSM(orderConfig); f.send('CANCEL');
    expect(f.current).toBe('cancelled');
  });
  it('add-send 70b: order full happy path', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.current).toBe('delivered');
  });
  it('add-send 70c: order isFinal after deliver', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.isFinal()).toBe(true);
  });
  it('add-send 71a: order pending->cancelled direct', () => {
    const f = createFSM(orderConfig); f.send('CANCEL');
    expect(f.current).toBe('cancelled');
  });
  it('add-send 71b: order full happy path', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.current).toBe('delivered');
  });
  it('add-send 71c: order isFinal after deliver', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.isFinal()).toBe(true);
  });
  it('add-send 72a: order pending->cancelled direct', () => {
    const f = createFSM(orderConfig); f.send('CANCEL');
    expect(f.current).toBe('cancelled');
  });
  it('add-send 72b: order full happy path', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.current).toBe('delivered');
  });
  it('add-send 72c: order isFinal after deliver', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.isFinal()).toBe(true);
  });
  it('add-send 73a: order pending->cancelled direct', () => {
    const f = createFSM(orderConfig); f.send('CANCEL');
    expect(f.current).toBe('cancelled');
  });
  it('add-send 73b: order full happy path', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.current).toBe('delivered');
  });
  it('add-send 73c: order isFinal after deliver', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.isFinal()).toBe(true);
  });
  it('add-send 74a: order pending->cancelled direct', () => {
    const f = createFSM(orderConfig); f.send('CANCEL');
    expect(f.current).toBe('cancelled');
  });
  it('add-send 74b: order full happy path', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.current).toBe('delivered');
  });
  it('add-send 74c: order isFinal after deliver', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.isFinal()).toBe(true);
  });
  it('add-send 75a: order pending->cancelled direct', () => {
    const f = createFSM(orderConfig); f.send('CANCEL');
    expect(f.current).toBe('cancelled');
  });
  it('add-send 75b: order full happy path', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.current).toBe('delivered');
  });
  it('add-send 75c: order isFinal after deliver', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.isFinal()).toBe(true);
  });
  it('add-send 76a: order pending->cancelled direct', () => {
    const f = createFSM(orderConfig); f.send('CANCEL');
    expect(f.current).toBe('cancelled');
  });
  it('add-send 76b: order full happy path', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.current).toBe('delivered');
  });
  it('add-send 76c: order isFinal after deliver', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.isFinal()).toBe(true);
  });
  it('add-send 77a: order pending->cancelled direct', () => {
    const f = createFSM(orderConfig); f.send('CANCEL');
    expect(f.current).toBe('cancelled');
  });
  it('add-send 77b: order full happy path', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.current).toBe('delivered');
  });
  it('add-send 77c: order isFinal after deliver', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.isFinal()).toBe(true);
  });
  it('add-send 78a: order pending->cancelled direct', () => {
    const f = createFSM(orderConfig); f.send('CANCEL');
    expect(f.current).toBe('cancelled');
  });
  it('add-send 78b: order full happy path', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.current).toBe('delivered');
  });
  it('add-send 78c: order isFinal after deliver', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.isFinal()).toBe(true);
  });
  it('add-send 79a: order pending->cancelled direct', () => {
    const f = createFSM(orderConfig); f.send('CANCEL');
    expect(f.current).toBe('cancelled');
  });
  it('add-send 79b: order full happy path', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.current).toBe('delivered');
  });
  it('add-send 79c: order isFinal after deliver', () => {
    const f = createFSM(orderConfig);
    f.send('PROCESS').send('SHIP').send('DELIVER');
    expect(f.isFinal()).toBe(true);
  });
});

describe('Additional can coverage', () => {
  it('add-can 0a: order can PROCESS from pending', () => {
    expect(createFSM(orderConfig).can('PROCESS')).toBe(true);
  });
  it('add-can 0b: order cannot DELIVER from pending', () => {
    expect(createFSM(orderConfig).can('DELIVER')).toBe(false);
  });
  it('add-can 0c: order can CANCEL from pending', () => {
    expect(createFSM(orderConfig).can('CANCEL')).toBe(true);
  });
  it('add-can 1a: order can PROCESS from pending', () => {
    expect(createFSM(orderConfig).can('PROCESS')).toBe(true);
  });
  it('add-can 1b: order cannot DELIVER from pending', () => {
    expect(createFSM(orderConfig).can('DELIVER')).toBe(false);
  });
  it('add-can 1c: order can CANCEL from pending', () => {
    expect(createFSM(orderConfig).can('CANCEL')).toBe(true);
  });
  it('add-can 2a: order can PROCESS from pending', () => {
    expect(createFSM(orderConfig).can('PROCESS')).toBe(true);
  });
  it('add-can 2b: order cannot DELIVER from pending', () => {
    expect(createFSM(orderConfig).can('DELIVER')).toBe(false);
  });
  it('add-can 2c: order can CANCEL from pending', () => {
    expect(createFSM(orderConfig).can('CANCEL')).toBe(true);
  });
  it('add-can 3a: order can PROCESS from pending', () => {
    expect(createFSM(orderConfig).can('PROCESS')).toBe(true);
  });
  it('add-can 3b: order cannot DELIVER from pending', () => {
    expect(createFSM(orderConfig).can('DELIVER')).toBe(false);
  });
  it('add-can 3c: order can CANCEL from pending', () => {
    expect(createFSM(orderConfig).can('CANCEL')).toBe(true);
  });
  it('add-can 4a: order can PROCESS from pending', () => {
    expect(createFSM(orderConfig).can('PROCESS')).toBe(true);
  });
  it('add-can 4b: order cannot DELIVER from pending', () => {
    expect(createFSM(orderConfig).can('DELIVER')).toBe(false);
  });
  it('add-can 4c: order can CANCEL from pending', () => {
    expect(createFSM(orderConfig).can('CANCEL')).toBe(true);
  });
  it('add-can 5a: order can PROCESS from pending', () => {
    expect(createFSM(orderConfig).can('PROCESS')).toBe(true);
  });
  it('add-can 5b: order cannot DELIVER from pending', () => {
    expect(createFSM(orderConfig).can('DELIVER')).toBe(false);
  });
  it('add-can 5c: order can CANCEL from pending', () => {
    expect(createFSM(orderConfig).can('CANCEL')).toBe(true);
  });
  it('add-can 6a: order can PROCESS from pending', () => {
    expect(createFSM(orderConfig).can('PROCESS')).toBe(true);
  });
  it('add-can 6b: order cannot DELIVER from pending', () => {
    expect(createFSM(orderConfig).can('DELIVER')).toBe(false);
  });
  it('add-can 6c: order can CANCEL from pending', () => {
    expect(createFSM(orderConfig).can('CANCEL')).toBe(true);
  });
  it('add-can 7a: order can PROCESS from pending', () => {
    expect(createFSM(orderConfig).can('PROCESS')).toBe(true);
  });
  it('add-can 7b: order cannot DELIVER from pending', () => {
    expect(createFSM(orderConfig).can('DELIVER')).toBe(false);
  });
  it('add-can 7c: order can CANCEL from pending', () => {
    expect(createFSM(orderConfig).can('CANCEL')).toBe(true);
  });
  it('add-can 8a: order can PROCESS from pending', () => {
    expect(createFSM(orderConfig).can('PROCESS')).toBe(true);
  });
  it('add-can 8b: order cannot DELIVER from pending', () => {
    expect(createFSM(orderConfig).can('DELIVER')).toBe(false);
  });
  it('add-can 8c: order can CANCEL from pending', () => {
    expect(createFSM(orderConfig).can('CANCEL')).toBe(true);
  });
  it('add-can 9a: order can PROCESS from pending', () => {
    expect(createFSM(orderConfig).can('PROCESS')).toBe(true);
  });
  it('add-can 9b: order cannot DELIVER from pending', () => {
    expect(createFSM(orderConfig).can('DELIVER')).toBe(false);
  });
  it('add-can 9c: order can CANCEL from pending', () => {
    expect(createFSM(orderConfig).can('CANCEL')).toBe(true);
  });
  it('add-can 10a: order can PROCESS from pending', () => {
    expect(createFSM(orderConfig).can('PROCESS')).toBe(true);
  });
  it('add-can 10b: order cannot DELIVER from pending', () => {
    expect(createFSM(orderConfig).can('DELIVER')).toBe(false);
  });
  it('add-can 10c: order can CANCEL from pending', () => {
    expect(createFSM(orderConfig).can('CANCEL')).toBe(true);
  });
  it('add-can 11a: order can PROCESS from pending', () => {
    expect(createFSM(orderConfig).can('PROCESS')).toBe(true);
  });
  it('add-can 11b: order cannot DELIVER from pending', () => {
    expect(createFSM(orderConfig).can('DELIVER')).toBe(false);
  });
  it('add-can 11c: order can CANCEL from pending', () => {
    expect(createFSM(orderConfig).can('CANCEL')).toBe(true);
  });
  it('add-can 12a: order can PROCESS from pending', () => {
    expect(createFSM(orderConfig).can('PROCESS')).toBe(true);
  });
  it('add-can 12b: order cannot DELIVER from pending', () => {
    expect(createFSM(orderConfig).can('DELIVER')).toBe(false);
  });
  it('add-can 12c: order can CANCEL from pending', () => {
    expect(createFSM(orderConfig).can('CANCEL')).toBe(true);
  });
  it('add-can 13a: order can PROCESS from pending', () => {
    expect(createFSM(orderConfig).can('PROCESS')).toBe(true);
  });
  it('add-can 13b: order cannot DELIVER from pending', () => {
    expect(createFSM(orderConfig).can('DELIVER')).toBe(false);
  });
  it('add-can 13c: order can CANCEL from pending', () => {
    expect(createFSM(orderConfig).can('CANCEL')).toBe(true);
  });
  it('add-can 14a: order can PROCESS from pending', () => {
    expect(createFSM(orderConfig).can('PROCESS')).toBe(true);
  });
  it('add-can 14b: order cannot DELIVER from pending', () => {
    expect(createFSM(orderConfig).can('DELIVER')).toBe(false);
  });
  it('add-can 14c: order can CANCEL from pending', () => {
    expect(createFSM(orderConfig).can('CANCEL')).toBe(true);
  });
  it('add-can 15a: order can PROCESS from pending', () => {
    expect(createFSM(orderConfig).can('PROCESS')).toBe(true);
  });
  it('add-can 15b: order cannot DELIVER from pending', () => {
    expect(createFSM(orderConfig).can('DELIVER')).toBe(false);
  });
  it('add-can 15c: order can CANCEL from pending', () => {
    expect(createFSM(orderConfig).can('CANCEL')).toBe(true);
  });
  it('add-can 16a: order can PROCESS from pending', () => {
    expect(createFSM(orderConfig).can('PROCESS')).toBe(true);
  });
  it('add-can 16b: order cannot DELIVER from pending', () => {
    expect(createFSM(orderConfig).can('DELIVER')).toBe(false);
  });
  it('add-can 16c: order can CANCEL from pending', () => {
    expect(createFSM(orderConfig).can('CANCEL')).toBe(true);
  });
  it('add-can 17a: order can PROCESS from pending', () => {
    expect(createFSM(orderConfig).can('PROCESS')).toBe(true);
  });
  it('add-can 17b: order cannot DELIVER from pending', () => {
    expect(createFSM(orderConfig).can('DELIVER')).toBe(false);
  });
  it('add-can 17c: order can CANCEL from pending', () => {
    expect(createFSM(orderConfig).can('CANCEL')).toBe(true);
  });
  it('add-can 18a: order can PROCESS from pending', () => {
    expect(createFSM(orderConfig).can('PROCESS')).toBe(true);
  });
  it('add-can 18b: order cannot DELIVER from pending', () => {
    expect(createFSM(orderConfig).can('DELIVER')).toBe(false);
  });
  it('add-can 18c: order can CANCEL from pending', () => {
    expect(createFSM(orderConfig).can('CANCEL')).toBe(true);
  });
  it('add-can 19a: order can PROCESS from pending', () => {
    expect(createFSM(orderConfig).can('PROCESS')).toBe(true);
  });
  it('add-can 19b: order cannot DELIVER from pending', () => {
    expect(createFSM(orderConfig).can('DELIVER')).toBe(false);
  });
  it('add-can 19c: order can CANCEL from pending', () => {
    expect(createFSM(orderConfig).can('CANCEL')).toBe(true);
  });
  it('add-can 20a: order can PROCESS from pending', () => {
    expect(createFSM(orderConfig).can('PROCESS')).toBe(true);
  });
  it('add-can 20b: order cannot DELIVER from pending', () => {
    expect(createFSM(orderConfig).can('DELIVER')).toBe(false);
  });
  it('add-can 20c: order can CANCEL from pending', () => {
    expect(createFSM(orderConfig).can('CANCEL')).toBe(true);
  });
  it('add-can 21a: order can PROCESS from pending', () => {
    expect(createFSM(orderConfig).can('PROCESS')).toBe(true);
  });
  it('add-can 21b: order cannot DELIVER from pending', () => {
    expect(createFSM(orderConfig).can('DELIVER')).toBe(false);
  });
  it('add-can 21c: order can CANCEL from pending', () => {
    expect(createFSM(orderConfig).can('CANCEL')).toBe(true);
  });
  it('add-can 22a: order can PROCESS from pending', () => {
    expect(createFSM(orderConfig).can('PROCESS')).toBe(true);
  });
  it('add-can 22b: order cannot DELIVER from pending', () => {
    expect(createFSM(orderConfig).can('DELIVER')).toBe(false);
  });
  it('add-can 22c: order can CANCEL from pending', () => {
    expect(createFSM(orderConfig).can('CANCEL')).toBe(true);
  });
  it('add-can 23a: order can PROCESS from pending', () => {
    expect(createFSM(orderConfig).can('PROCESS')).toBe(true);
  });
  it('add-can 23b: order cannot DELIVER from pending', () => {
    expect(createFSM(orderConfig).can('DELIVER')).toBe(false);
  });
  it('add-can 23c: order can CANCEL from pending', () => {
    expect(createFSM(orderConfig).can('CANCEL')).toBe(true);
  });
  it('add-can 24a: order can PROCESS from pending', () => {
    expect(createFSM(orderConfig).can('PROCESS')).toBe(true);
  });
  it('add-can 24b: order cannot DELIVER from pending', () => {
    expect(createFSM(orderConfig).can('DELIVER')).toBe(false);
  });
  it('add-can 24c: order can CANCEL from pending', () => {
    expect(createFSM(orderConfig).can('CANCEL')).toBe(true);
  });
  it('add-can 25a: order can PROCESS from pending', () => {
    expect(createFSM(orderConfig).can('PROCESS')).toBe(true);
  });
  it('add-can 25b: order cannot DELIVER from pending', () => {
    expect(createFSM(orderConfig).can('DELIVER')).toBe(false);
  });
  it('add-can 25c: order can CANCEL from pending', () => {
    expect(createFSM(orderConfig).can('CANCEL')).toBe(true);
  });
  it('add-can 26a: order can PROCESS from pending', () => {
    expect(createFSM(orderConfig).can('PROCESS')).toBe(true);
  });
  it('add-can 26b: order cannot DELIVER from pending', () => {
    expect(createFSM(orderConfig).can('DELIVER')).toBe(false);
  });
  it('add-can 26c: order can CANCEL from pending', () => {
    expect(createFSM(orderConfig).can('CANCEL')).toBe(true);
  });
  it('add-can 27a: order can PROCESS from pending', () => {
    expect(createFSM(orderConfig).can('PROCESS')).toBe(true);
  });
  it('add-can 27b: order cannot DELIVER from pending', () => {
    expect(createFSM(orderConfig).can('DELIVER')).toBe(false);
  });
  it('add-can 27c: order can CANCEL from pending', () => {
    expect(createFSM(orderConfig).can('CANCEL')).toBe(true);
  });
  it('add-can 28a: order can PROCESS from pending', () => {
    expect(createFSM(orderConfig).can('PROCESS')).toBe(true);
  });
  it('add-can 28b: order cannot DELIVER from pending', () => {
    expect(createFSM(orderConfig).can('DELIVER')).toBe(false);
  });
  it('add-can 28c: order can CANCEL from pending', () => {
    expect(createFSM(orderConfig).can('CANCEL')).toBe(true);
  });
  it('add-can 29a: order can PROCESS from pending', () => {
    expect(createFSM(orderConfig).can('PROCESS')).toBe(true);
  });
  it('add-can 29b: order cannot DELIVER from pending', () => {
    expect(createFSM(orderConfig).can('DELIVER')).toBe(false);
  });
  it('add-can 29c: order can CANCEL from pending', () => {
    expect(createFSM(orderConfig).can('CANCEL')).toBe(true);
  });
  it('add-can 30a: order can PROCESS from pending', () => {
    expect(createFSM(orderConfig).can('PROCESS')).toBe(true);
  });
  it('add-can 30b: order cannot DELIVER from pending', () => {
    expect(createFSM(orderConfig).can('DELIVER')).toBe(false);
  });
  it('add-can 30c: order can CANCEL from pending', () => {
    expect(createFSM(orderConfig).can('CANCEL')).toBe(true);
  });
  it('add-can 31a: order can PROCESS from pending', () => {
    expect(createFSM(orderConfig).can('PROCESS')).toBe(true);
  });
  it('add-can 31b: order cannot DELIVER from pending', () => {
    expect(createFSM(orderConfig).can('DELIVER')).toBe(false);
  });
  it('add-can 31c: order can CANCEL from pending', () => {
    expect(createFSM(orderConfig).can('CANCEL')).toBe(true);
  });
  it('add-can 32a: order can PROCESS from pending', () => {
    expect(createFSM(orderConfig).can('PROCESS')).toBe(true);
  });
  it('add-can 32b: order cannot DELIVER from pending', () => {
    expect(createFSM(orderConfig).can('DELIVER')).toBe(false);
  });
  it('add-can 32c: order can CANCEL from pending', () => {
    expect(createFSM(orderConfig).can('CANCEL')).toBe(true);
  });
  it('add-can 33a: order can PROCESS from pending', () => {
    expect(createFSM(orderConfig).can('PROCESS')).toBe(true);
  });
  it('add-can 33b: order cannot DELIVER from pending', () => {
    expect(createFSM(orderConfig).can('DELIVER')).toBe(false);
  });
  it('add-can 33c: order can CANCEL from pending', () => {
    expect(createFSM(orderConfig).can('CANCEL')).toBe(true);
  });
  it('add-can 34a: order can PROCESS from pending', () => {
    expect(createFSM(orderConfig).can('PROCESS')).toBe(true);
  });
  it('add-can 34b: order cannot DELIVER from pending', () => {
    expect(createFSM(orderConfig).can('DELIVER')).toBe(false);
  });
  it('add-can 34c: order can CANCEL from pending', () => {
    expect(createFSM(orderConfig).can('CANCEL')).toBe(true);
  });
  it('add-can 35a: order can PROCESS from pending', () => {
    expect(createFSM(orderConfig).can('PROCESS')).toBe(true);
  });
  it('add-can 35b: order cannot DELIVER from pending', () => {
    expect(createFSM(orderConfig).can('DELIVER')).toBe(false);
  });
  it('add-can 35c: order can CANCEL from pending', () => {
    expect(createFSM(orderConfig).can('CANCEL')).toBe(true);
  });
  it('add-can 36a: order can PROCESS from pending', () => {
    expect(createFSM(orderConfig).can('PROCESS')).toBe(true);
  });
  it('add-can 36b: order cannot DELIVER from pending', () => {
    expect(createFSM(orderConfig).can('DELIVER')).toBe(false);
  });
  it('add-can 36c: order can CANCEL from pending', () => {
    expect(createFSM(orderConfig).can('CANCEL')).toBe(true);
  });
  it('add-can 37a: order can PROCESS from pending', () => {
    expect(createFSM(orderConfig).can('PROCESS')).toBe(true);
  });
  it('add-can 37b: order cannot DELIVER from pending', () => {
    expect(createFSM(orderConfig).can('DELIVER')).toBe(false);
  });
  it('add-can 37c: order can CANCEL from pending', () => {
    expect(createFSM(orderConfig).can('CANCEL')).toBe(true);
  });
  it('add-can 38a: order can PROCESS from pending', () => {
    expect(createFSM(orderConfig).can('PROCESS')).toBe(true);
  });
  it('add-can 38b: order cannot DELIVER from pending', () => {
    expect(createFSM(orderConfig).can('DELIVER')).toBe(false);
  });
  it('add-can 38c: order can CANCEL from pending', () => {
    expect(createFSM(orderConfig).can('CANCEL')).toBe(true);
  });
  it('add-can 39a: order can PROCESS from pending', () => {
    expect(createFSM(orderConfig).can('PROCESS')).toBe(true);
  });
  it('add-can 39b: order cannot DELIVER from pending', () => {
    expect(createFSM(orderConfig).can('DELIVER')).toBe(false);
  });
  it('add-can 39c: order can CANCEL from pending', () => {
    expect(createFSM(orderConfig).can('CANCEL')).toBe(true);
  });
});

describe('Serialize round-trip', () => {
  it('serialize-rt 0a: history matches send sequence', () => {
    const f = createFSM(trafficConfig);
    f.send('GO').send('SLOW').send('STOP');
    const s = serializeFSM(f);
    expect(s.history).toEqual(['red','green','yellow','red']);
  });
  it('serialize-rt 0b: serialize returns plain object', () => {
    const s = serializeFSM(createFSM(trafficConfig));
    expect(typeof s).toBe('object');
    expect(s).toHaveProperty('current');
    expect(s).toHaveProperty('history');
  });
  it('serialize-rt 1a: history matches send sequence', () => {
    const f = createFSM(trafficConfig);
    f.send('GO').send('SLOW').send('STOP');
    const s = serializeFSM(f);
    expect(s.history).toEqual(['red','green','yellow','red']);
  });
  it('serialize-rt 1b: serialize returns plain object', () => {
    const s = serializeFSM(createFSM(trafficConfig));
    expect(typeof s).toBe('object');
    expect(s).toHaveProperty('current');
    expect(s).toHaveProperty('history');
  });
  it('serialize-rt 2a: history matches send sequence', () => {
    const f = createFSM(trafficConfig);
    f.send('GO').send('SLOW').send('STOP');
    const s = serializeFSM(f);
    expect(s.history).toEqual(['red','green','yellow','red']);
  });
  it('serialize-rt 2b: serialize returns plain object', () => {
    const s = serializeFSM(createFSM(trafficConfig));
    expect(typeof s).toBe('object');
    expect(s).toHaveProperty('current');
    expect(s).toHaveProperty('history');
  });
  it('serialize-rt 3a: history matches send sequence', () => {
    const f = createFSM(trafficConfig);
    f.send('GO').send('SLOW').send('STOP');
    const s = serializeFSM(f);
    expect(s.history).toEqual(['red','green','yellow','red']);
  });
  it('serialize-rt 3b: serialize returns plain object', () => {
    const s = serializeFSM(createFSM(trafficConfig));
    expect(typeof s).toBe('object');
    expect(s).toHaveProperty('current');
    expect(s).toHaveProperty('history');
  });
  it('serialize-rt 4a: history matches send sequence', () => {
    const f = createFSM(trafficConfig);
    f.send('GO').send('SLOW').send('STOP');
    const s = serializeFSM(f);
    expect(s.history).toEqual(['red','green','yellow','red']);
  });
  it('serialize-rt 4b: serialize returns plain object', () => {
    const s = serializeFSM(createFSM(trafficConfig));
    expect(typeof s).toBe('object');
    expect(s).toHaveProperty('current');
    expect(s).toHaveProperty('history');
  });
  it('serialize-rt 5a: history matches send sequence', () => {
    const f = createFSM(trafficConfig);
    f.send('GO').send('SLOW').send('STOP');
    const s = serializeFSM(f);
    expect(s.history).toEqual(['red','green','yellow','red']);
  });
  it('serialize-rt 5b: serialize returns plain object', () => {
    const s = serializeFSM(createFSM(trafficConfig));
    expect(typeof s).toBe('object');
    expect(s).toHaveProperty('current');
    expect(s).toHaveProperty('history');
  });
  it('serialize-rt 6a: history matches send sequence', () => {
    const f = createFSM(trafficConfig);
    f.send('GO').send('SLOW').send('STOP');
    const s = serializeFSM(f);
    expect(s.history).toEqual(['red','green','yellow','red']);
  });
  it('serialize-rt 6b: serialize returns plain object', () => {
    const s = serializeFSM(createFSM(trafficConfig));
    expect(typeof s).toBe('object');
    expect(s).toHaveProperty('current');
    expect(s).toHaveProperty('history');
  });
  it('serialize-rt 7a: history matches send sequence', () => {
    const f = createFSM(trafficConfig);
    f.send('GO').send('SLOW').send('STOP');
    const s = serializeFSM(f);
    expect(s.history).toEqual(['red','green','yellow','red']);
  });
  it('serialize-rt 7b: serialize returns plain object', () => {
    const s = serializeFSM(createFSM(trafficConfig));
    expect(typeof s).toBe('object');
    expect(s).toHaveProperty('current');
    expect(s).toHaveProperty('history');
  });
  it('serialize-rt 8a: history matches send sequence', () => {
    const f = createFSM(trafficConfig);
    f.send('GO').send('SLOW').send('STOP');
    const s = serializeFSM(f);
    expect(s.history).toEqual(['red','green','yellow','red']);
  });
  it('serialize-rt 8b: serialize returns plain object', () => {
    const s = serializeFSM(createFSM(trafficConfig));
    expect(typeof s).toBe('object');
    expect(s).toHaveProperty('current');
    expect(s).toHaveProperty('history');
  });
  it('serialize-rt 9a: history matches send sequence', () => {
    const f = createFSM(trafficConfig);
    f.send('GO').send('SLOW').send('STOP');
    const s = serializeFSM(f);
    expect(s.history).toEqual(['red','green','yellow','red']);
  });
  it('serialize-rt 9b: serialize returns plain object', () => {
    const s = serializeFSM(createFSM(trafficConfig));
    expect(typeof s).toBe('object');
    expect(s).toHaveProperty('current');
    expect(s).toHaveProperty('history');
  });
  it('serialize-rt 10a: history matches send sequence', () => {
    const f = createFSM(trafficConfig);
    f.send('GO').send('SLOW').send('STOP');
    const s = serializeFSM(f);
    expect(s.history).toEqual(['red','green','yellow','red']);
  });
  it('serialize-rt 10b: serialize returns plain object', () => {
    const s = serializeFSM(createFSM(trafficConfig));
    expect(typeof s).toBe('object');
    expect(s).toHaveProperty('current');
    expect(s).toHaveProperty('history');
  });
  it('serialize-rt 11a: history matches send sequence', () => {
    const f = createFSM(trafficConfig);
    f.send('GO').send('SLOW').send('STOP');
    const s = serializeFSM(f);
    expect(s.history).toEqual(['red','green','yellow','red']);
  });
  it('serialize-rt 11b: serialize returns plain object', () => {
    const s = serializeFSM(createFSM(trafficConfig));
    expect(typeof s).toBe('object');
    expect(s).toHaveProperty('current');
    expect(s).toHaveProperty('history');
  });
  it('serialize-rt 12a: history matches send sequence', () => {
    const f = createFSM(trafficConfig);
    f.send('GO').send('SLOW').send('STOP');
    const s = serializeFSM(f);
    expect(s.history).toEqual(['red','green','yellow','red']);
  });
  it('serialize-rt 12b: serialize returns plain object', () => {
    const s = serializeFSM(createFSM(trafficConfig));
    expect(typeof s).toBe('object');
    expect(s).toHaveProperty('current');
    expect(s).toHaveProperty('history');
  });
  it('serialize-rt 13a: history matches send sequence', () => {
    const f = createFSM(trafficConfig);
    f.send('GO').send('SLOW').send('STOP');
    const s = serializeFSM(f);
    expect(s.history).toEqual(['red','green','yellow','red']);
  });
  it('serialize-rt 13b: serialize returns plain object', () => {
    const s = serializeFSM(createFSM(trafficConfig));
    expect(typeof s).toBe('object');
    expect(s).toHaveProperty('current');
    expect(s).toHaveProperty('history');
  });
  it('serialize-rt 14a: history matches send sequence', () => {
    const f = createFSM(trafficConfig);
    f.send('GO').send('SLOW').send('STOP');
    const s = serializeFSM(f);
    expect(s.history).toEqual(['red','green','yellow','red']);
  });
  it('serialize-rt 14b: serialize returns plain object', () => {
    const s = serializeFSM(createFSM(trafficConfig));
    expect(typeof s).toBe('object');
    expect(s).toHaveProperty('current');
    expect(s).toHaveProperty('history');
  });
  it('serialize-rt 15a: history matches send sequence', () => {
    const f = createFSM(trafficConfig);
    f.send('GO').send('SLOW').send('STOP');
    const s = serializeFSM(f);
    expect(s.history).toEqual(['red','green','yellow','red']);
  });
  it('serialize-rt 15b: serialize returns plain object', () => {
    const s = serializeFSM(createFSM(trafficConfig));
    expect(typeof s).toBe('object');
    expect(s).toHaveProperty('current');
    expect(s).toHaveProperty('history');
  });
  it('serialize-rt 16a: history matches send sequence', () => {
    const f = createFSM(trafficConfig);
    f.send('GO').send('SLOW').send('STOP');
    const s = serializeFSM(f);
    expect(s.history).toEqual(['red','green','yellow','red']);
  });
  it('serialize-rt 16b: serialize returns plain object', () => {
    const s = serializeFSM(createFSM(trafficConfig));
    expect(typeof s).toBe('object');
    expect(s).toHaveProperty('current');
    expect(s).toHaveProperty('history');
  });
  it('serialize-rt 17a: history matches send sequence', () => {
    const f = createFSM(trafficConfig);
    f.send('GO').send('SLOW').send('STOP');
    const s = serializeFSM(f);
    expect(s.history).toEqual(['red','green','yellow','red']);
  });
  it('serialize-rt 17b: serialize returns plain object', () => {
    const s = serializeFSM(createFSM(trafficConfig));
    expect(typeof s).toBe('object');
    expect(s).toHaveProperty('current');
    expect(s).toHaveProperty('history');
  });
  it('serialize-rt 18a: history matches send sequence', () => {
    const f = createFSM(trafficConfig);
    f.send('GO').send('SLOW').send('STOP');
    const s = serializeFSM(f);
    expect(s.history).toEqual(['red','green','yellow','red']);
  });
  it('serialize-rt 18b: serialize returns plain object', () => {
    const s = serializeFSM(createFSM(trafficConfig));
    expect(typeof s).toBe('object');
    expect(s).toHaveProperty('current');
    expect(s).toHaveProperty('history');
  });
  it('serialize-rt 19a: history matches send sequence', () => {
    const f = createFSM(trafficConfig);
    f.send('GO').send('SLOW').send('STOP');
    const s = serializeFSM(f);
    expect(s.history).toEqual(['red','green','yellow','red']);
  });
  it('serialize-rt 19b: serialize returns plain object', () => {
    const s = serializeFSM(createFSM(trafficConfig));
    expect(typeof s).toBe('object');
    expect(s).toHaveProperty('current');
    expect(s).toHaveProperty('history');
  });
  it('serialize-rt 20a: history matches send sequence', () => {
    const f = createFSM(trafficConfig);
    f.send('GO').send('SLOW').send('STOP');
    const s = serializeFSM(f);
    expect(s.history).toEqual(['red','green','yellow','red']);
  });
  it('serialize-rt 20b: serialize returns plain object', () => {
    const s = serializeFSM(createFSM(trafficConfig));
    expect(typeof s).toBe('object');
    expect(s).toHaveProperty('current');
    expect(s).toHaveProperty('history');
  });
  it('serialize-rt 21a: history matches send sequence', () => {
    const f = createFSM(trafficConfig);
    f.send('GO').send('SLOW').send('STOP');
    const s = serializeFSM(f);
    expect(s.history).toEqual(['red','green','yellow','red']);
  });
  it('serialize-rt 21b: serialize returns plain object', () => {
    const s = serializeFSM(createFSM(trafficConfig));
    expect(typeof s).toBe('object');
    expect(s).toHaveProperty('current');
    expect(s).toHaveProperty('history');
  });
  it('serialize-rt 22a: history matches send sequence', () => {
    const f = createFSM(trafficConfig);
    f.send('GO').send('SLOW').send('STOP');
    const s = serializeFSM(f);
    expect(s.history).toEqual(['red','green','yellow','red']);
  });
  it('serialize-rt 22b: serialize returns plain object', () => {
    const s = serializeFSM(createFSM(trafficConfig));
    expect(typeof s).toBe('object');
    expect(s).toHaveProperty('current');
    expect(s).toHaveProperty('history');
  });
  it('serialize-rt 23a: history matches send sequence', () => {
    const f = createFSM(trafficConfig);
    f.send('GO').send('SLOW').send('STOP');
    const s = serializeFSM(f);
    expect(s.history).toEqual(['red','green','yellow','red']);
  });
  it('serialize-rt 23b: serialize returns plain object', () => {
    const s = serializeFSM(createFSM(trafficConfig));
    expect(typeof s).toBe('object');
    expect(s).toHaveProperty('current');
    expect(s).toHaveProperty('history');
  });
  it('serialize-rt 24a: history matches send sequence', () => {
    const f = createFSM(trafficConfig);
    f.send('GO').send('SLOW').send('STOP');
    const s = serializeFSM(f);
    expect(s.history).toEqual(['red','green','yellow','red']);
  });
  it('serialize-rt 24b: serialize returns plain object', () => {
    const s = serializeFSM(createFSM(trafficConfig));
    expect(typeof s).toBe('object');
    expect(s).toHaveProperty('current');
    expect(s).toHaveProperty('history');
  });
  it('serialize-rt 25a: history matches send sequence', () => {
    const f = createFSM(trafficConfig);
    f.send('GO').send('SLOW').send('STOP');
    const s = serializeFSM(f);
    expect(s.history).toEqual(['red','green','yellow','red']);
  });
  it('serialize-rt 25b: serialize returns plain object', () => {
    const s = serializeFSM(createFSM(trafficConfig));
    expect(typeof s).toBe('object');
    expect(s).toHaveProperty('current');
    expect(s).toHaveProperty('history');
  });
  it('serialize-rt 26a: history matches send sequence', () => {
    const f = createFSM(trafficConfig);
    f.send('GO').send('SLOW').send('STOP');
    const s = serializeFSM(f);
    expect(s.history).toEqual(['red','green','yellow','red']);
  });
  it('serialize-rt 26b: serialize returns plain object', () => {
    const s = serializeFSM(createFSM(trafficConfig));
    expect(typeof s).toBe('object');
    expect(s).toHaveProperty('current');
    expect(s).toHaveProperty('history');
  });
  it('serialize-rt 27a: history matches send sequence', () => {
    const f = createFSM(trafficConfig);
    f.send('GO').send('SLOW').send('STOP');
    const s = serializeFSM(f);
    expect(s.history).toEqual(['red','green','yellow','red']);
  });
  it('serialize-rt 27b: serialize returns plain object', () => {
    const s = serializeFSM(createFSM(trafficConfig));
    expect(typeof s).toBe('object');
    expect(s).toHaveProperty('current');
    expect(s).toHaveProperty('history');
  });
  it('serialize-rt 28a: history matches send sequence', () => {
    const f = createFSM(trafficConfig);
    f.send('GO').send('SLOW').send('STOP');
    const s = serializeFSM(f);
    expect(s.history).toEqual(['red','green','yellow','red']);
  });
  it('serialize-rt 28b: serialize returns plain object', () => {
    const s = serializeFSM(createFSM(trafficConfig));
    expect(typeof s).toBe('object');
    expect(s).toHaveProperty('current');
    expect(s).toHaveProperty('history');
  });
  it('serialize-rt 29a: history matches send sequence', () => {
    const f = createFSM(trafficConfig);
    f.send('GO').send('SLOW').send('STOP');
    const s = serializeFSM(f);
    expect(s.history).toEqual(['red','green','yellow','red']);
  });
  it('serialize-rt 29b: serialize returns plain object', () => {
    const s = serializeFSM(createFSM(trafficConfig));
    expect(typeof s).toBe('object');
    expect(s).toHaveProperty('current');
    expect(s).toHaveProperty('history');
  });
});
