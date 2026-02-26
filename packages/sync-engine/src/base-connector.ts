// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import { EventEmitter } from 'events';
import type {
  ConnectorConfig,
  SyncJob,
  SyncRecord,
  SyncStats,
  SyncError,
  EntityType,
  ConnectorHealthStatus,
  SyncProgress,
} from './types';

export abstract class BaseConnector extends EventEmitter {
  protected config: ConnectorConfig;

  constructor(config: ConnectorConfig) {
    super();
    this.config = config;
  }

  get id(): string { return this.config.id; }
  get name(): string { return this.config.name; }
  get type(): string { return this.config.type; }
  get enabled(): boolean { return this.config.enabled; }

  /** Test connectivity and credentials */
  abstract testConnection(): Promise<ConnectorHealthStatus>;

  /** Fetch records of a given entity type from the external system */
  abstract fetchRecords(entityType: EntityType, since?: Date): Promise<SyncRecord[]>;

  /** Push records to the external system (for OUTBOUND/BIDIRECTIONAL) */
  pushRecords?(entityType: EntityType, records: SyncRecord[]): Promise<SyncStats>;

  /** Execute a full sync job */
  async executeSync(job: SyncJob): Promise<SyncJob> {
    job.status = 'RUNNING';
    job.startedAt = new Date();
    this.emit('job:start', job);

    const errors: SyncError[] = [];
    const stats: SyncStats = { totalFetched: 0, created: 0, updated: 0, skipped: 0, failed: 0 };

    for (const entityType of job.entityTypes) {
      try {
        const records = await this.fetchRecords(entityType);
        stats.totalFetched += records.length;

        const progress: SyncProgress = {
          jobId: job.id,
          entityType,
          processed: 0,
          total: records.length,
          status: 'RUNNING',
        };
        this.emit('progress', progress);

        // Process in batches of 100
        const batchSize = 100;
        for (let i = 0; i < records.length; i += batchSize) {
          const batch = records.slice(i, i + batchSize);
          const batchResult = await this.processBatch(entityType, batch);
          stats.created += batchResult.created;
          stats.updated += batchResult.updated;
          stats.skipped += batchResult.skipped;
          stats.failed += batchResult.failed;
          progress.processed = Math.min(i + batchSize, records.length);
          this.emit('progress', progress);
        }
      } catch (err) {
        errors.push({ entityType, message: String(err), timestamp: new Date() });
        stats.failed++;
      }
    }

    job.completedAt = new Date();
    job.stats = stats;
    job.errors = errors;
    job.status = errors.length === 0 ? 'SUCCESS' : (stats.created + stats.updated > 0 ? 'PARTIAL' : 'FAILED');

    this.emit('job:complete', job);
    return job;
  }

  /** Override to provide custom batch processing logic */
  protected async processBatch(_entityType: EntityType, records: SyncRecord[]): Promise<SyncStats> {
    // Default: simulate upsert by counting
    return {
      totalFetched: records.length,
      created: records.length,
      updated: 0,
      skipped: 0,
      failed: 0,
    };
  }

  /** Build a deterministic checksum for change detection */
  protected checksum(data: Record<string, unknown>): string {
    return Buffer.from(JSON.stringify(data)).toString('base64').slice(0, 16);
  }
}
