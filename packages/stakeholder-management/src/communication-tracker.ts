// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import {
  CommunicationLog,
  CommunicationMethod,
  CommunicationStatus,
} from './types';

export class CommunicationTracker {
  private _store: Map<string, CommunicationLog> = new Map();
  private _seq = 0;

  plan(
    stakeholderId: string,
    subject: string,
    method: CommunicationMethod,
    scheduledDate: string,
    notes?: string,
  ): CommunicationLog {
    const id = `comm-${++this._seq}`;
    const log: CommunicationLog = {
      id,
      stakeholderId,
      subject,
      method,
      status: 'PLANNED',
      scheduledDate,
      notes,
    };
    this._store.set(id, log);
    return { ...log };
  }

  send(id: string, sentDate: string): CommunicationLog {
    const log = this._store.get(id);
    if (!log) throw new Error(`Communication not found: ${id}`);
    const updated: CommunicationLog = { ...log, status: 'SENT', sentDate };
    this._store.set(id, updated);
    return { ...updated };
  }

  acknowledge(id: string, acknowledgedDate: string): CommunicationLog {
    const log = this._store.get(id);
    if (!log) throw new Error(`Communication not found: ${id}`);
    const updated: CommunicationLog = {
      ...log,
      status: 'ACKNOWLEDGED',
      acknowledgedDate,
    };
    this._store.set(id, updated);
    return { ...updated };
  }

  respond(
    id: string,
    respondedDate: string,
    notes?: string,
  ): CommunicationLog {
    const log = this._store.get(id);
    if (!log) throw new Error(`Communication not found: ${id}`);
    const updated: CommunicationLog = {
      ...log,
      status: 'RESPONDED',
      respondedDate,
      ...(notes !== undefined ? { notes } : {}),
    };
    this._store.set(id, updated);
    return { ...updated };
  }

  getByStakeholder(stakeholderId: string): CommunicationLog[] {
    return Array.from(this._store.values())
      .filter((l) => l.stakeholderId === stakeholderId)
      .map((l) => ({ ...l }));
  }

  getByStatus(status: CommunicationStatus): CommunicationLog[] {
    return Array.from(this._store.values())
      .filter((l) => l.status === status)
      .map((l) => ({ ...l }));
  }

  getByMethod(method: CommunicationMethod): CommunicationLog[] {
    return Array.from(this._store.values())
      .filter((l) => l.method === method)
      .map((l) => ({ ...l }));
  }

  getPending(): CommunicationLog[] {
    return this.getByStatus('PLANNED');
  }

  /**
   * Returns PLANNED communications whose scheduledDate is strictly before asOf.
   */
  getOverdue(asOf: string): CommunicationLog[] {
    return Array.from(this._store.values())
      .filter((l) => l.status === 'PLANNED' && l.scheduledDate < asOf)
      .map((l) => ({ ...l }));
  }

  getCount(): number {
    return this._store.size;
  }
}
