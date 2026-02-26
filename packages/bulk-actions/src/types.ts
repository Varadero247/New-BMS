// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// CONFIDENTIAL — TRADE SECRET.

export type BulkActionStatus = 'idle' | 'selecting' | 'processing' | 'complete' | 'error';

export interface BulkAction<T = unknown> {
  id: string;
  label: string;
  icon?: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'warning';
  requiresConfirmation?: boolean;
  confirmationMessage?: string;
  isAvailable?: (selectedItems: T[]) => boolean;
  execute: (selectedItems: T[]) => Promise<BulkActionResult>;
}

export interface BulkActionResult {
  success: boolean;
  processed: number;
  failed: number;
  errors?: Array<{ id: string; message: string }>;
  message?: string;
}

export interface BulkSelection<T = unknown> {
  selectedIds: Set<string>;
  selectedItems: T[];
  allSelected: boolean;
  count: number;
}

export interface BulkActionsState<T = unknown> {
  status: BulkActionStatus;
  selection: BulkSelection<T>;
  lastResult?: BulkActionResult;
  error?: string;
}
