// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// CONFIDENTIAL — TRADE SECRET.

export type CollabEventType = 'join' | 'leave' | 'update' | 'cursor' | 'awareness' | 'sync';
export type CollabDocType = 'ncr' | 'capa' | 'audit' | 'document' | 'risk' | 'form';

export interface CollabUser {
  id: string;
  name: string;
  color: string; // hex color for cursor
  avatar?: string;
  cursor?: CollabCursor;
  lastActive: Date;
}

export interface CollabCursor {
  field?: string;
  position?: number;
  selection?: [number, number];
}

export interface CollabSession {
  docId: string;
  docType: CollabDocType;
  users: Map<string, CollabUser>;
  version: number;
  lastModified: Date;
}

export interface CollabEvent {
  type: CollabEventType;
  userId: string;
  docId: string;
  timestamp: Date;
  payload?: unknown;
}

export interface CollabOperation {
  id: string;
  type: 'insert' | 'delete' | 'retain' | 'set';
  field: string;
  position?: number;
  value?: unknown;
  length?: number;
  userId: string;
  timestamp: Date;
  version: number;
}
