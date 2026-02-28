// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import { ReviewRecord, ReviewOutcome } from './types';

export class ReviewTracker {
  private _store: Map<string, ReviewRecord> = new Map();
  private _seq = 0;

  addReview(
    documentId: string,
    reviewerId: string,
    outcome: ReviewOutcome,
    comments?: string,
    reviewedAt?: string,
  ): ReviewRecord {
    const id = `rev-${++this._seq}`;
    const record: ReviewRecord = {
      id,
      documentId,
      reviewerId,
      outcome,
      comments,
      reviewedAt: reviewedAt ?? new Date().toISOString(),
    };
    this._store.set(id, record);
    return record;
  }

  getByDocument(documentId: string): ReviewRecord[] {
    return Array.from(this._store.values()).filter(r => r.documentId === documentId);
  }

  getByReviewer(reviewerId: string): ReviewRecord[] {
    return Array.from(this._store.values()).filter(r => r.reviewerId === reviewerId);
  }

  getByOutcome(outcome: ReviewOutcome): ReviewRecord[] {
    return Array.from(this._store.values()).filter(r => r.outcome === outcome);
  }

  getLatestReview(documentId: string): ReviewRecord | undefined {
    const reviews = this.getByDocument(documentId);
    if (reviews.length === 0) return undefined;
    return reviews.reduce((latest, r) => (r.reviewedAt > latest.reviewedAt ? r : latest));
  }

  getCount(): number {
    return this._store.size;
  }
}
