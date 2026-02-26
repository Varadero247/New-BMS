export type EventSeverity = 'info' | 'warning' | 'error' | 'critical';
export type EventCategory = 'create' | 'update' | 'delete' | 'view' | 'export' | 'import' | 'approve' | 'reject' | 'escalate' | 'comment' | 'assign' | 'complete' | 'cancel' | 'system';

export interface TimelineEvent {
  id: string;
  entityId: string;
  entityType: string;
  category: EventCategory;
  severity: EventSeverity;
  actor: string;
  description: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
  tags?: string[];
}

export interface Timeline {
  entityId: string;
  entityType: string;
  events: TimelineEvent[];
}

export interface TimelineFilter {
  fromTimestamp?: number;
  toTimestamp?: number;
  categories?: EventCategory[];
  severities?: EventSeverity[];
  actors?: string[];
  tags?: string[];
}

export interface TimelineStats {
  totalEvents: number;
  eventsByCategory: Record<EventCategory, number>;
  eventsBySeverity: Record<EventSeverity, number>;
  uniqueActors: number;
  firstEventAt?: number;
  lastEventAt?: number;
}
