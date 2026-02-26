// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
export interface EventPayload {
  id: string;
  type: string;
  source: string;
  timestamp: string;
  organisationId: string;
  userId?: string;
  data: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface EventHandler {
  (payload: EventPayload): Promise<void>;
}

export interface EventSubscription {
  event: string;
  handler: EventHandler;
  group?: string;
}

export type EventTrigger = {
  event: string;
  triggers: string[];
};
