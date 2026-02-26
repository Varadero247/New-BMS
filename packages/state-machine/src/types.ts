// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

export type StateId = string;
export type EventId = string;

export interface StateConfig<TContext = unknown> {
  id: StateId;
  initial?: boolean;
  final?: boolean;
  onEnter?: (ctx: TContext, event?: MachineEvent) => TContext | void;
  onExit?: (ctx: TContext, event?: MachineEvent) => TContext | void;
  meta?: Record<string, unknown>;
}

export interface TransitionConfig<TContext = unknown> {
  from: StateId | StateId[];
  event: EventId;
  to: StateId;
  guard?: (ctx: TContext, event: MachineEvent) => boolean;
  action?: (ctx: TContext, event: MachineEvent) => TContext | void;
}

export interface MachineEvent {
  type: EventId;
  payload?: unknown;
}

export interface MachineConfig<TContext = unknown> {
  id: string;
  initial: StateId;
  context: TContext;
  states: StateConfig<TContext>[];
  transitions: TransitionConfig<TContext>[];
}

export interface MachineState<TContext = unknown> {
  current: StateId;
  context: TContext;
  history: HistoryEntry[];
}

export interface HistoryEntry {
  from: StateId;
  to: StateId;
  event: MachineEvent;
  timestamp: number;
}

export interface TransitionResult<TContext = unknown> {
  success: boolean;
  state: MachineState<TContext>;
  error?: string;
}

export interface Machine<TContext = unknown> {
  config: MachineConfig<TContext>;
  state: MachineState<TContext>;
}
