// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import {
  Machine,
  MachineConfig,
  MachineEvent,
  MachineState,
  StateId,
  TransitionConfig,
  TransitionResult,
} from './types';

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function normaliseFroms(from: StateId | StateId[]): StateId[] {
  return Array.isArray(from) ? from : [from];
}

function findMatchingTransition<T>(
  machine: Machine<T>,
  event: MachineEvent,
): TransitionConfig<T> | undefined {
  const { config, state } = machine;
  return config.transitions.find((t) => {
    const froms = normaliseFroms(t.from);
    if (!froms.includes(state.current)) return false;
    if (t.event !== event.type) return false;
    if (t.guard && !t.guard(state.context, event)) return false;
    return true;
  });
}

function cloneState<T>(s: MachineState<T>): MachineState<T> {
  return {
    current: s.current,
    context: s.context,
    history: [...s.history],
  };
}

// ---------------------------------------------------------------------------
// 1. createMachine
// ---------------------------------------------------------------------------

export function createMachine<T>(config: MachineConfig<T>): Machine<T> {
  const initialStateExists = config.states.some((s) => s.id === config.initial);
  if (!initialStateExists) {
    throw new Error(
      `createMachine: initial state "${config.initial}" does not exist in states array`,
    );
  }
  return {
    config,
    state: {
      current: config.initial,
      context: config.context,
      history: [],
    },
  };
}

// ---------------------------------------------------------------------------
// 2. transition
// ---------------------------------------------------------------------------

export function transition<T>(machine: Machine<T>, event: MachineEvent): TransitionResult<T> {
  const matched = findMatchingTransition(machine, event);

  if (!matched) {
    return {
      success: false,
      state: cloneState(machine.state),
      error: `No transition found for event "${event.type}" from state "${machine.state.current}"`,
    };
  }

  const toStateConfig = machine.config.states.find((s) => s.id === matched.to);
  if (!toStateConfig) {
    return {
      success: false,
      state: cloneState(machine.state),
      error: `Target state "${matched.to}" does not exist in states array`,
    };
  }

  const fromStateConfig = machine.config.states.find((s) => s.id === machine.state.current);

  let ctx = machine.state.context;

  // onExit
  if (fromStateConfig?.onExit) {
    const result = fromStateConfig.onExit(ctx, event);
    if (result !== undefined && result !== null) {
      ctx = result as T;
    }
  }

  // action
  if (matched.action) {
    const result = matched.action(ctx, event);
    if (result !== undefined && result !== null) {
      ctx = result as T;
    }
  }

  // onEnter
  if (toStateConfig.onEnter) {
    const result = toStateConfig.onEnter(ctx, event);
    if (result !== undefined && result !== null) {
      ctx = result as T;
    }
  }

  const historyEntry = {
    from: machine.state.current,
    to: matched.to,
    event,
    timestamp: Date.now(),
  };

  const newState: MachineState<T> = {
    current: matched.to,
    context: ctx,
    history: [...machine.state.history, historyEntry],
  };

  return { success: true, state: newState };
}

// ---------------------------------------------------------------------------
// 3. send
// ---------------------------------------------------------------------------

export function send<T>(machine: Machine<T>, eventType: string, payload?: unknown): TransitionResult<T> {
  return transition(machine, { type: eventType, payload });
}

// ---------------------------------------------------------------------------
// 4. canTransition
// ---------------------------------------------------------------------------

export function canTransition<T>(machine: Machine<T>, eventType: string): boolean {
  return findMatchingTransition(machine, { type: eventType }) !== undefined;
}

// ---------------------------------------------------------------------------
// 5. getAvailableEvents
// ---------------------------------------------------------------------------

export function getAvailableEvents<T>(machine: Machine<T>): string[] {
  const events = new Set<string>();
  for (const t of machine.config.transitions) {
    const froms = normaliseFroms(t.from);
    if (!froms.includes(machine.state.current)) continue;
    if (t.guard && !t.guard(machine.state.context, { type: t.event })) continue;
    events.add(t.event);
  }
  return Array.from(events);
}

// ---------------------------------------------------------------------------
// 6. isInState
// ---------------------------------------------------------------------------

export function isInState<T>(machine: Machine<T>, stateId: StateId): boolean {
  return machine.state.current === stateId;
}

// ---------------------------------------------------------------------------
// 7. isFinal
// ---------------------------------------------------------------------------

export function isFinal<T>(machine: Machine<T>): boolean {
  const currentStateConfig = machine.config.states.find((s) => s.id === machine.state.current);
  return currentStateConfig?.final === true;
}

// ---------------------------------------------------------------------------
// 8. getHistory
// ---------------------------------------------------------------------------

export function getHistory<T>(machine: Machine<T>) {
  return machine.state.history;
}

// ---------------------------------------------------------------------------
// 9. clearHistory
// ---------------------------------------------------------------------------

export function clearHistory<T>(machine: Machine<T>): Machine<T> {
  return {
    config: machine.config,
    state: {
      current: machine.state.current,
      context: machine.state.context,
      history: [],
    },
  };
}

// ---------------------------------------------------------------------------
// 10. resetMachine
// ---------------------------------------------------------------------------

export function resetMachine<T>(machine: Machine<T>): Machine<T> {
  return {
    config: machine.config,
    state: {
      current: machine.config.initial,
      context: machine.config.context,
      history: [],
    },
  };
}

// ---------------------------------------------------------------------------
// 11. withContext
// ---------------------------------------------------------------------------

export function withContext<T>(machine: Machine<T>, context: T): Machine<T> {
  return {
    config: machine.config,
    state: {
      current: machine.state.current,
      context,
      history: [...machine.state.history],
    },
  };
}

// ---------------------------------------------------------------------------
// 12. validateConfig
// ---------------------------------------------------------------------------

export function validateConfig<T>(config: MachineConfig<T>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!config.id || config.id.trim() === '') {
    errors.push('Machine id must be a non-empty string');
  }

  if (!config.initial || config.initial.trim() === '') {
    errors.push('Machine initial state must be a non-empty string');
  }

  if (!Array.isArray(config.states) || config.states.length === 0) {
    errors.push('Machine must have at least one state');
  } else {
    const stateIds = new Set<string>();
    for (const s of config.states) {
      if (!s.id || s.id.trim() === '') {
        errors.push('All states must have a non-empty id');
      } else if (stateIds.has(s.id)) {
        errors.push(`Duplicate state id: "${s.id}"`);
      } else {
        stateIds.add(s.id);
      }
    }

    const initialExists = config.states.some((s) => s.id === config.initial);
    if (!initialExists) {
      errors.push(`Initial state "${config.initial}" not found in states`);
    }

    if (!Array.isArray(config.transitions)) {
      errors.push('Transitions must be an array');
    } else {
      for (const t of config.transitions) {
        const froms = normaliseFroms(t.from);
        for (const f of froms) {
          if (!stateIds.has(f)) {
            errors.push(`Transition from unknown state: "${f}"`);
          }
        }
        if (!stateIds.has(t.to)) {
          errors.push(`Transition to unknown state: "${t.to}"`);
        }
        if (!t.event || t.event.trim() === '') {
          errors.push('All transitions must have a non-empty event id');
        }
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

// ---------------------------------------------------------------------------
// 13. getStateIds
// ---------------------------------------------------------------------------

export function getStateIds<T>(machine: Machine<T>): StateId[] {
  return machine.config.states.map((s) => s.id);
}

// ---------------------------------------------------------------------------
// 14. getTransitionsFrom
// ---------------------------------------------------------------------------

export function getTransitionsFrom<T>(machine: Machine<T>, stateId: StateId): TransitionConfig<T>[] {
  return machine.config.transitions.filter((t) => {
    const froms = normaliseFroms(t.from);
    return froms.includes(stateId);
  });
}

// ---------------------------------------------------------------------------
// 15. getTransitionsTo
// ---------------------------------------------------------------------------

export function getTransitionsTo<T>(machine: Machine<T>, stateId: StateId): TransitionConfig<T>[] {
  return machine.config.transitions.filter((t) => t.to === stateId);
}

// ---------------------------------------------------------------------------
// 16. serialize
// ---------------------------------------------------------------------------

export function serialize<T>(machine: Machine<T>): string {
  return JSON.stringify({
    current: machine.state.current,
    context: machine.state.context,
    history: machine.state.history,
  });
}

// ---------------------------------------------------------------------------
// 17. deserialize
// ---------------------------------------------------------------------------

export function deserialize<T>(config: MachineConfig<T>, json: string): Machine<T> {
  const parsed = JSON.parse(json) as {
    current: StateId;
    context: T;
    history: MachineState<T>['history'];
  };
  return {
    config,
    state: {
      current: parsed.current,
      context: parsed.context,
      history: parsed.history,
    },
  };
}

// ---------------------------------------------------------------------------
// 18. matchesState
// ---------------------------------------------------------------------------

export function matchesState<T>(machine: Machine<T>, pattern: string): boolean {
  if (pattern.includes('|')) {
    const options = pattern.split('|').map((s) => s.trim());
    return options.includes(machine.state.current);
  }
  return machine.state.current === pattern;
}

// ---------------------------------------------------------------------------
// 19. createSimpleMachine
// ---------------------------------------------------------------------------

export function createSimpleMachine(
  states: StateId[],
  initial: StateId,
  transitions: Array<{ from: StateId | StateId[]; event: EventId; to: StateId }>,
): Machine<Record<string, never>> {
  return createMachine<Record<string, never>>({
    id: 'simple',
    initial,
    context: {},
    states: states.map((id, idx) => ({ id, initial: idx === 0 })),
    transitions,
  });
}

// ---------------------------------------------------------------------------
// 20. toDotGraph
// ---------------------------------------------------------------------------

export function toDotGraph<T>(machine: Machine<T>): string {
  const lines: string[] = [];
  lines.push(`digraph "${machine.config.id}" {`);
  lines.push('  rankdir=LR;');

  // Nodes
  for (const s of machine.config.states) {
    const isCurrent = s.id === machine.state.current;
    const shape = s.final ? 'doublecircle' : 'circle';
    const style = isCurrent ? ' style=filled fillcolor=lightblue' : '';
    lines.push(`  "${s.id}" [shape=${shape}${style}];`);
  }

  // Edges
  for (const t of machine.config.transitions) {
    const froms = normaliseFroms(t.from);
    for (const f of froms) {
      const guardLabel = t.guard ? ' [guard]' : '';
      lines.push(`  "${f}" -> "${t.to}" [label="${t.event}${guardLabel}"];`);
    }
  }

  lines.push('}');
  return lines.join('\n');
}
