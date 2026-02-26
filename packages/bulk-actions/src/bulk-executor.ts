// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// CONFIDENTIAL — TRADE SECRET.

import type { BulkAction, BulkActionResult } from './types';

export interface BulkExecutorOptions {
  batchSize?: number;
  confirmFn?: (message: string) => Promise<boolean>;
}

export interface BulkExecutor {
  execute<T>(
    action: BulkAction<T>,
    items: T[],
    options?: BulkExecutorOptions
  ): Promise<BulkActionResult>;
}

/**
 * Splits an array into chunks of at most `size` elements.
 */
export function chunkArray<T>(arr: T[], size: number): T[][] {
  if (size <= 0) throw new Error('Batch size must be positive');
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

/**
 * Merges multiple BulkActionResult objects into one aggregate.
 */
export function mergeResults(results: BulkActionResult[]): BulkActionResult {
  const errors: Array<{ id: string; message: string }> = [];
  let processed = 0;
  let failed = 0;

  for (const r of results) {
    processed += r.processed;
    failed += r.failed;
    if (r.errors) {
      errors.push(...r.errors);
    }
  }

  return {
    success: failed === 0,
    processed,
    failed,
    errors: errors.length > 0 ? errors : undefined,
    message: `Processed ${processed} item(s), ${failed} failed.`,
  };
}

/**
 * Creates a BulkExecutor instance.
 */
export function createBulkExecutor(): BulkExecutor {
  return {
    async execute<T>(
      action: BulkAction<T>,
      items: T[],
      options: BulkExecutorOptions = {}
    ): Promise<BulkActionResult> {
      const { batchSize = 50, confirmFn } = options;

      if (items.length === 0) {
        return { success: true, processed: 0, failed: 0, message: 'Nothing to process.' };
      }

      // Handle confirmation
      if (action.requiresConfirmation && confirmFn) {
        const confirmed = await confirmFn(
          action.confirmationMessage || `Are you sure you want to ${action.label}?`
        );
        if (!confirmed) {
          return { success: false, processed: 0, failed: 0, message: 'Cancelled by user.' };
        }
      }

      // Check availability
      if (action.isAvailable && !action.isAvailable(items)) {
        return {
          success: false,
          processed: 0,
          failed: items.length,
          message: 'Action is not available for the selected items.',
        };
      }

      const batches = chunkArray(items, batchSize);
      const results: BulkActionResult[] = [];

      for (const batch of batches) {
        try {
          const result = await action.execute(batch);
          results.push(result);
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Unknown error';
          results.push({
            success: false,
            processed: 0,
            failed: batch.length,
            errors: batch.map((_, i) => ({ id: String(i), message })),
          });
        }
      }

      return mergeResults(results);
    },
  };
}
