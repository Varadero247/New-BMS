// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// CONFIDENTIAL — TRADE SECRET.
export type InlineEditStatus = 'idle' | 'editing' | 'saving' | 'error' | 'success';
export type InlineEditFieldType = 'text' | 'textarea' | 'number' | 'date' | 'select' | 'boolean';

export interface InlineEditConfig<T = unknown> {
  fieldType: InlineEditFieldType;
  initialValue: T;
  validate?: (value: T) => string | null;
  transform?: (value: T) => T;
  options?: Array<{ value: string; label: string }>;
  min?: number;
  max?: number;
  maxLength?: number;
  required?: boolean;
  placeholder?: string;
}

export interface InlineEditState<T = unknown> {
  status: InlineEditStatus;
  value: T;
  originalValue: T;
  error: string | null;
  isDirty: boolean;
}

export interface InlineEditActions<T = unknown> {
  startEdit: () => void;
  cancelEdit: () => void;
  setValue: (value: T) => void;
  save: () => Promise<void>;
  reset: () => void;
}
