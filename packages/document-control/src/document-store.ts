// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import { DocumentRecord, DocumentStatus, DocumentType } from './types';

export class DocumentStore {
  private _store: Map<string, DocumentRecord> = new Map();
  private _seq = 0;

  create(doc: Omit<DocumentRecord, 'status' | 'createdAt' | 'updatedAt'>): DocumentRecord {
    const id = doc.id || `doc-${++this._seq}`;
    const now = new Date().toISOString();
    const record: DocumentRecord = {
      ...doc,
      id,
      status: 'DRAFT',
      createdAt: now,
      updatedAt: now,
    };
    this._store.set(id, record);
    return record;
  }

  submitForReview(id: string): DocumentRecord {
    const record = this._getOrThrow(id);
    const updated: DocumentRecord = { ...record, status: 'UNDER_REVIEW', updatedAt: new Date().toISOString() };
    this._store.set(id, updated);
    return updated;
  }

  approve(id: string, approvedBy: string, nextReviewDate?: string): DocumentRecord {
    const record = this._getOrThrow(id);
    const now = new Date().toISOString();
    const updated: DocumentRecord = {
      ...record,
      status: 'APPROVED',
      approvedBy,
      approvedAt: now,
      updatedAt: now,
      ...(nextReviewDate ? { nextReviewDate } : {}),
    };
    this._store.set(id, updated);
    return updated;
  }

  publish(id: string): DocumentRecord {
    const record = this._getOrThrow(id);
    const updated: DocumentRecord = { ...record, status: 'PUBLISHED', updatedAt: new Date().toISOString() };
    this._store.set(id, updated);
    return updated;
  }

  obsolete(id: string): DocumentRecord {
    const record = this._getOrThrow(id);
    const updated: DocumentRecord = { ...record, status: 'OBSOLETE', updatedAt: new Date().toISOString() };
    this._store.set(id, updated);
    return updated;
  }

  withdraw(id: string): DocumentRecord {
    const record = this._getOrThrow(id);
    const updated: DocumentRecord = { ...record, status: 'WITHDRAWN', updatedAt: new Date().toISOString() };
    this._store.set(id, updated);
    return updated;
  }

  revise(id: string, newVersion: string): DocumentRecord {
    const original = this._getOrThrow(id);
    const now = new Date().toISOString();
    const newId = `doc-${++this._seq}`;
    const revised: DocumentRecord = {
      ...original,
      id: newId,
      version: newVersion,
      status: 'DRAFT',
      createdAt: now,
      updatedAt: now,
      approvedBy: undefined,
      approvedAt: undefined,
    };
    this._store.set(newId, revised);
    return revised;
  }

  get(id: string): DocumentRecord | undefined {
    return this._store.get(id);
  }

  getAll(): DocumentRecord[] {
    return Array.from(this._store.values());
  }

  getByStatus(status: DocumentStatus): DocumentRecord[] {
    return Array.from(this._store.values()).filter(d => d.status === status);
  }

  getByType(type: DocumentType): DocumentRecord[] {
    return Array.from(this._store.values()).filter(d => d.documentType === type);
  }

  getByOwner(owner: string): DocumentRecord[] {
    return Array.from(this._store.values()).filter(d => d.owner === owner);
  }

  getByTag(tag: string): DocumentRecord[] {
    return Array.from(this._store.values()).filter(d => d.tags.includes(tag));
  }

  getOverdueReview(asOf: string): DocumentRecord[] {
    return Array.from(this._store.values()).filter(
      d => d.status === 'PUBLISHED' && d.nextReviewDate !== undefined && d.nextReviewDate < asOf,
    );
  }

  getCount(): number {
    return this._store.size;
  }

  private _getOrThrow(id: string): DocumentRecord {
    const record = this._store.get(id);
    if (!record) throw new Error(`Document not found: ${id}`);
    return record;
  }
}
