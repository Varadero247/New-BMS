// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// CONFIDENTIAL — TRADE SECRET.
import type { InlineEditConfig, InlineEditState, InlineEditActions } from './types';

export function createInlineEditState<T>(
  config: InlineEditConfig<T>,
  onSave: (value: T) => Promise<void>
): { getState: () => InlineEditState<T>; actions: InlineEditActions<T> } {
  let state: InlineEditState<T> = {
    status: 'idle',
    value: config.initialValue,
    originalValue: config.initialValue,
    error: null,
    isDirty: false,
  };

  const getState = () => ({ ...state });

  const actions: InlineEditActions<T> = {
    startEdit() {
      state = { ...state, status: 'editing', error: null };
    },
    cancelEdit() {
      state = { ...state, status: 'idle', value: state.originalValue, error: null, isDirty: false };
    },
    setValue(value: T) {
      state = { ...state, value, isDirty: value !== state.originalValue, error: null };
    },
    async save() {
      if (config.validate) {
        const error = config.validate(state.value);
        if (error) {
          state = { ...state, status: 'error', error };
          return;
        }
      }
      const valueToSave = config.transform ? config.transform(state.value) : state.value;
      state = { ...state, status: 'saving', error: null };
      try {
        await onSave(valueToSave);
        state = { ...state, status: 'success', originalValue: valueToSave, isDirty: false };
      } catch (err) {
        state = { ...state, status: 'error', error: err instanceof Error ? err.message : 'Save failed' };
      }
    },
    reset() {
      state = {
        status: 'idle',
        value: config.initialValue,
        originalValue: config.initialValue,
        error: null,
        isDirty: false,
      };
    },
  };

  return { getState, actions };
}
