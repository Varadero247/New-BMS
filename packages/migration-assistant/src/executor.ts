// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import { EventEmitter } from 'events';
import type { MigrationJob, MigrationProgress, MigrationResult, TransformedRow } from './types';

const BATCH_SIZE = 100;

export class MigrationExecutor extends EventEmitter {
  async *execute(
    job: MigrationJob,
    transformedRows: TransformedRow[],
  ): AsyncGenerator<MigrationProgress> {
    const total = transformedRows.length;
    let created = 0;
    let failed = 0;
    let skipped = 0;
    const errors: MigrationResult['errors'] = [];

    for (let batchStart = 0; batchStart < total; batchStart += BATCH_SIZE) {
      const batch = transformedRows.slice(batchStart, batchStart + BATCH_SIZE);
      const batchNumber = Math.floor(batchStart / BATCH_SIZE) + 1;

      for (let i = 0; i < batch.length; i++) {
        const row = batch[i];
        const rowIndex = batchStart + i + 1;

        // Row-level errors from transformation
        if (row.errors.length > 0) {
          failed++;
          for (const err of row.errors) {
            errors.push({ row: rowIndex, message: err });
          }
          continue;
        }

        try {
          // In production: call appropriate service API to insert record
          // For now: simulate successful insert
          await Promise.resolve();
          created++;
        } catch (err) {
          failed++;
          errors.push({ row: rowIndex, message: String(err) });
        }
      }

      const progress: MigrationProgress = {
        processed: Math.min(batchStart + batch.length, total),
        total,
        created,
        failed,
        currentBatch: batchNumber,
      };
      this.emit('progress', progress);
      yield progress;
    }

    const result: MigrationResult = {
      jobId: job.id,
      created,
      skipped,
      failed,
      errors: errors.slice(0, 100), // Cap error list at 100
      completedAt: new Date(),
    };
    this.emit('complete', result);
  }

  async executeSync(
    job: MigrationJob,
    transformedRows: TransformedRow[],
  ): Promise<MigrationResult> {
    let lastProgress: MigrationProgress | undefined;
    for await (const progress of this.execute(job, transformedRows)) {
      lastProgress = progress;
    }
    return {
      jobId: job.id,
      created: lastProgress?.created ?? 0,
      skipped: 0,
      failed: lastProgress?.failed ?? 0,
      errors: [],
      completedAt: new Date(),
    };
  }
}
