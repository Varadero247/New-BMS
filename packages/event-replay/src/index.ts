// Copyright (c) 2026 Nexara DMCC. All rights reserved.
export {
  createEventLog,
  createReplay,
  deduplicate,
  aggregate,
  groupByType,
  groupByTimeBucket,
  filterByTypes,
  filterByTimeRange,
  serializeLog,
  deserializeLog,
} from './event-replay';

export type {
  RecordedEvent,
  EventLog,
  ReplayOptions,
  ReplayController,
} from './event-replay';
