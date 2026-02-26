// Copyright (c) 2026 Nexara DMCC. All rights reserved.

// ---------------------------------------------------------------------------
// Core Types
// ---------------------------------------------------------------------------

/** A unit of work that can be executed and optionally undone. */
export interface Command<R = void> {
  execute(): R;
  undo?(): void;
  description?: string;
}

/** Manages an ordered history of executed commands, supporting undo/redo. */
export interface CommandHistory<R = void> {
  execute(cmd: Command<R>): R;
  undo(): void;
  redo(): void;
  canUndo(): boolean;
  canRedo(): boolean;
  history(): Command<R>[];
  future(): Command<R>[];
  clear(): void;
}

/** An all-or-nothing group of commands. */
export interface Transaction {
  add(cmd: Command): this;
  commit(): void;
  rollback(): void;
}

// ---------------------------------------------------------------------------
// createCommandHistory
// ---------------------------------------------------------------------------

/**
 * Creates a new CommandHistory that tracks executed commands and supports
 * undo/redo navigation.
 */
export function createCommandHistory<R = void>(): CommandHistory<R> {
  const _history: Command<R>[] = [];
  const _future: Command<R>[] = [];

  return {
    execute(cmd: Command<R>): R {
      const result = cmd.execute();
      _history.push(cmd);
      // Executing a new command clears the redo stack
      _future.length = 0;
      return result;
    },

    undo(): void {
      const cmd = _history.pop();
      if (cmd) {
        if (cmd.undo) cmd.undo();
        _future.unshift(cmd);
      }
    },

    redo(): void {
      const cmd = _future.shift();
      if (cmd) {
        cmd.execute();
        _history.push(cmd);
      }
    },

    canUndo(): boolean {
      return _history.length > 0;
    },

    canRedo(): boolean {
      return _future.length > 0;
    },

    history(): Command<R>[] {
      return [..._history];
    },

    future(): Command<R>[] {
      return [..._future];
    },

    clear(): void {
      _history.length = 0;
      _future.length = 0;
    },
  };
}

// ---------------------------------------------------------------------------
// createCommand
// ---------------------------------------------------------------------------

/**
 * Creates a simple command from a pair of execute/undo callbacks.
 */
export function createCommand<R>(
  executeFn: () => R,
  undoFn?: () => void,
  description?: string,
): Command<R> {
  return {
    execute: executeFn,
    undo: undoFn,
    description,
  };
}

// ---------------------------------------------------------------------------
// createMacro
// ---------------------------------------------------------------------------

/**
 * Creates a composite command that executes all sub-commands in order and
 * undoes them in reverse order.
 */
export function createMacro<R>(commands: Command<R>[]): Command<R[]> {
  return {
    description: `macro(${commands.length})`,
    execute(): R[] {
      return commands.map((c) => c.execute());
    },
    undo(): void {
      for (let i = commands.length - 1; i >= 0; i--) {
        const c = commands[i];
        if (c.undo) c.undo();
      }
    },
  };
}

// ---------------------------------------------------------------------------
// createTransaction
// ---------------------------------------------------------------------------

/**
 * Creates a transaction that executes all added commands atomically.
 * On rollback, all executed commands are undone in reverse order.
 */
export function createTransaction(): Transaction {
  const _commands: Command[] = [];
  const _executed: Command[] = [];

  return {
    add(cmd: Command): Transaction {
      _commands.push(cmd);
      return this;
    },

    commit(): void {
      for (const cmd of _commands) {
        cmd.execute();
        _executed.push(cmd);
      }
    },

    rollback(): void {
      for (let i = _executed.length - 1; i >= 0; i--) {
        const cmd = _executed[i];
        if (cmd.undo) cmd.undo();
      }
      _executed.length = 0;
    },
  };
}

// ---------------------------------------------------------------------------
// batch
// ---------------------------------------------------------------------------

/**
 * Creates a command that executes a batch of sub-commands and returns all
 * results.  Undo reverses all sub-commands that support it.
 */
export function batch<R>(commands: Command<R>[]): Command<R[]> {
  return {
    description: `batch(${commands.length})`,
    execute(): R[] {
      return commands.map((c) => c.execute());
    },
    undo(): void {
      for (let i = commands.length - 1; i >= 0; i--) {
        const c = commands[i];
        if (c.undo) c.undo();
      }
    },
  };
}

// ---------------------------------------------------------------------------
// withRetry
// ---------------------------------------------------------------------------

/**
 * Wraps a command with retry logic.  On execute, the underlying command is
 * attempted up to `maxAttempts` times before propagating the last error.
 */
export function withRetry<R>(cmd: Command<R>, maxAttempts: number): Command<R> {
  return {
    description: cmd.description ? `retry(${cmd.description}, ${maxAttempts})` : `retry(${maxAttempts})`,
    execute(): R {
      let lastErr: unknown;
      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
          return cmd.execute();
        } catch (err) {
          lastErr = err;
        }
      }
      throw lastErr;
    },
    undo: cmd.undo ? () => cmd.undo!() : undefined,
  };
}

// ---------------------------------------------------------------------------
// when
// ---------------------------------------------------------------------------

/**
 * Creates a conditional command.  If `condition` is true the underlying
 * command is executed; otherwise the command is a no-op returning undefined.
 */
export function when<R>(condition: boolean, cmd: Command<R>): Command<R | undefined> {
  return {
    description: cmd.description ? `when(${condition}, ${cmd.description})` : `when(${condition})`,
    execute(): R | undefined {
      if (condition) return cmd.execute();
      return undefined;
    },
    undo(): void {
      if (condition && cmd.undo) cmd.undo();
    },
  };
}
