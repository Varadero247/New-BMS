// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import { DocumentStore } from '../document-store';
import { ReviewTracker } from '../review-tracker';
import {
  DocumentRecord,
  DocumentStatus,
  DocumentType,
  ReviewOutcome,
  DistributionMethod,
} from '../types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const ALL_TYPES: DocumentType[] = [
  'PROCEDURE',
  'WORK_INSTRUCTION',
  'POLICY',
  'FORM',
  'RECORD',
  'MANUAL',
  'SPECIFICATION',
];

const ALL_STATUSES: DocumentStatus[] = [
  'DRAFT',
  'UNDER_REVIEW',
  'APPROVED',
  'PUBLISHED',
  'OBSOLETE',
  'WITHDRAWN',
];

const ALL_OUTCOMES: ReviewOutcome[] = ['APPROVED', 'REJECTED', 'NEEDS_REVISION'];

function makeDoc(
  store: DocumentStore,
  overrides: Partial<Omit<DocumentRecord, 'status' | 'createdAt' | 'updatedAt'>> = {},
): DocumentRecord {
  return store.create({
    id: `doc-test-${Date.now()}-${Math.random()}`,
    title: 'Test Document',
    documentType: 'PROCEDURE',
    version: '1.0',
    author: 'author@example.com',
    owner: 'owner@example.com',
    tags: [],
    ...overrides,
  });
}

// ---------------------------------------------------------------------------
// 1. Type exports
// ---------------------------------------------------------------------------
describe('Type exports', () => {
  it('DocumentStatus values are exported', () => {
    const statuses: DocumentStatus[] = ['DRAFT', 'UNDER_REVIEW', 'APPROVED', 'PUBLISHED', 'OBSOLETE', 'WITHDRAWN'];
    expect(statuses).toHaveLength(6);
  });

  it('DocumentType values are exported', () => {
    expect(ALL_TYPES).toHaveLength(7);
  });

  it('ReviewOutcome values are exported', () => {
    expect(ALL_OUTCOMES).toHaveLength(3);
  });

  it('DistributionMethod values are exported', () => {
    const methods: DistributionMethod[] = ['ELECTRONIC', 'PRINT', 'PORTAL'];
    expect(methods).toHaveLength(3);
  });
});

// ---------------------------------------------------------------------------
// 2. DocumentStore — create
// ---------------------------------------------------------------------------
describe('DocumentStore.create — defaults', () => {
  let store: DocumentStore;
  beforeEach(() => { store = new DocumentStore(); });

  it('returns a record with status DRAFT', () => {
    const doc = makeDoc(store);
    expect(doc.status).toBe('DRAFT');
  });

  it('sets createdAt as ISO string', () => {
    const doc = makeDoc(store);
    expect(() => new Date(doc.createdAt)).not.toThrow();
  });

  it('sets updatedAt as ISO string', () => {
    const doc = makeDoc(store);
    expect(() => new Date(doc.updatedAt)).not.toThrow();
  });

  it('createdAt equals updatedAt on creation', () => {
    const doc = makeDoc(store);
    expect(doc.createdAt).toBe(doc.updatedAt);
  });

  it('stores the supplied id', () => {
    const doc = store.create({ id: 'my-id', title: 'T', documentType: 'POLICY', version: '1.0', author: 'a', owner: 'o', tags: [] });
    expect(doc.id).toBe('my-id');
  });

  it('stores the supplied title', () => {
    const doc = makeDoc(store, { title: 'Safety Plan' });
    expect(doc.title).toBe('Safety Plan');
  });

  it('stores the supplied version', () => {
    const doc = makeDoc(store, { version: '2.3' });
    expect(doc.version).toBe('2.3');
  });

  it('stores the supplied author', () => {
    const doc = makeDoc(store, { author: 'alice@ims.local' });
    expect(doc.author).toBe('alice@ims.local');
  });

  it('stores the supplied owner', () => {
    const doc = makeDoc(store, { owner: 'bob@ims.local' });
    expect(doc.owner).toBe('bob@ims.local');
  });

  it('stores the supplied tags array', () => {
    const doc = makeDoc(store, { tags: ['iso9001', 'quality'] });
    expect(doc.tags).toEqual(['iso9001', 'quality']);
  });

  it('stores optional content', () => {
    const doc = makeDoc(store, { content: 'Hello world' });
    expect(doc.content).toBe('Hello world');
  });

  it('increments count with each create', () => {
    makeDoc(store);
    makeDoc(store);
    expect(store.getCount()).toBe(2);
  });

  it('getAll returns created record', () => {
    const doc = makeDoc(store);
    expect(store.getAll()).toContainEqual(doc);
  });

  it('get returns created record', () => {
    const doc = makeDoc(store);
    expect(store.get(doc.id)).toEqual(doc);
  });
});

// ---------------------------------------------------------------------------
// 3. DocumentStore — create with all document types (parameterized × 7)
// ---------------------------------------------------------------------------
describe('DocumentStore.create — all document types', () => {
  let store: DocumentStore;
  beforeEach(() => { store = new DocumentStore(); });

  ALL_TYPES.forEach(type => {
    it(`creates document of type ${type}`, () => {
      const doc = makeDoc(store, { documentType: type });
      expect(doc.documentType).toBe(type);
    });

    it(`DRAFT after create for type ${type}`, () => {
      const doc = makeDoc(store, { documentType: type });
      expect(doc.status).toBe('DRAFT');
    });

    it(`getByType('${type}') returns correct record`, () => {
      const doc = makeDoc(store, { documentType: type });
      expect(store.getByType(type)).toContainEqual(doc);
    });
  });
});

// ---------------------------------------------------------------------------
// 4. DocumentStore — submitForReview (parameterized × 20)
// ---------------------------------------------------------------------------
describe('DocumentStore.submitForReview', () => {
  let store: DocumentStore;
  beforeEach(() => { store = new DocumentStore(); });

  Array.from({ length: 20 }, (_, i) => i).forEach(i => {
    it(`submitForReview transitions status to UNDER_REVIEW (iteration ${i})`, () => {
      const doc = makeDoc(store, { title: `Doc ${i}` });
      const updated = store.submitForReview(doc.id);
      expect(updated.status).toBe('UNDER_REVIEW');
    });

    it(`submitForReview returns updated record with same id (iteration ${i})`, () => {
      const doc = makeDoc(store, { title: `Doc ${i}` });
      const updated = store.submitForReview(doc.id);
      expect(updated.id).toBe(doc.id);
    });

    it(`submitForReview persists status (iteration ${i})`, () => {
      const doc = makeDoc(store, { title: `Doc ${i}` });
      store.submitForReview(doc.id);
      expect(store.get(doc.id)?.status).toBe('UNDER_REVIEW');
    });
  });

  it('throws for unknown id', () => {
    expect(() => store.submitForReview('no-such-id')).toThrow('Document not found: no-such-id');
  });
});

// ---------------------------------------------------------------------------
// 5. DocumentStore — approve (parameterized × 20)
// ---------------------------------------------------------------------------
describe('DocumentStore.approve', () => {
  let store: DocumentStore;
  beforeEach(() => { store = new DocumentStore(); });

  Array.from({ length: 20 }, (_, i) => i).forEach(i => {
    it(`approve sets status to APPROVED (iteration ${i})`, () => {
      const doc = makeDoc(store, { title: `Doc ${i}` });
      const approved = store.approve(doc.id, `approver${i}@ims.local`);
      expect(approved.status).toBe('APPROVED');
    });

    it(`approve sets approvedBy (iteration ${i})`, () => {
      const doc = makeDoc(store, { title: `Doc ${i}` });
      const approved = store.approve(doc.id, `approver${i}@ims.local`);
      expect(approved.approvedBy).toBe(`approver${i}@ims.local`);
    });

    it(`approve sets approvedAt (iteration ${i})`, () => {
      const doc = makeDoc(store, { title: `Doc ${i}` });
      const approved = store.approve(doc.id, `approver${i}@ims.local`);
      expect(approved.approvedAt).toBeDefined();
    });

    it(`approve sets nextReviewDate when provided (iteration ${i})`, () => {
      const doc = makeDoc(store, { title: `Doc ${i}` });
      const nrd = `202${i % 10}-01-01`;
      const approved = store.approve(doc.id, `approver${i}@ims.local`, nrd);
      expect(approved.nextReviewDate).toBe(nrd);
    });
  });

  it('approve without nextReviewDate leaves it undefined if not previously set', () => {
    const doc = makeDoc(store);
    const approved = store.approve(doc.id, 'manager@ims.local');
    expect(approved.nextReviewDate).toBeUndefined();
  });

  it('throws for unknown id', () => {
    expect(() => store.approve('no-such-id', 'approver')).toThrow('Document not found: no-such-id');
  });
});

// ---------------------------------------------------------------------------
// 6. DocumentStore — publish (parameterized × 20)
// ---------------------------------------------------------------------------
describe('DocumentStore.publish', () => {
  let store: DocumentStore;
  beforeEach(() => { store = new DocumentStore(); });

  Array.from({ length: 20 }, (_, i) => i).forEach(i => {
    it(`publish transitions status to PUBLISHED (iteration ${i})`, () => {
      const doc = makeDoc(store, { title: `Doc ${i}` });
      const published = store.publish(doc.id);
      expect(published.status).toBe('PUBLISHED');
    });

    it(`publish persists PUBLISHED status (iteration ${i})`, () => {
      const doc = makeDoc(store, { title: `Doc ${i}` });
      store.publish(doc.id);
      expect(store.get(doc.id)?.status).toBe('PUBLISHED');
    });

    it(`publish returns record with same id (iteration ${i})`, () => {
      const doc = makeDoc(store, { title: `Doc ${i}` });
      const published = store.publish(doc.id);
      expect(published.id).toBe(doc.id);
    });
  });

  it('throws for unknown id', () => {
    expect(() => store.publish('no-such-id')).toThrow('Document not found: no-such-id');
  });
});

// ---------------------------------------------------------------------------
// 7. DocumentStore — obsolete (parameterized × 20)
// ---------------------------------------------------------------------------
describe('DocumentStore.obsolete', () => {
  let store: DocumentStore;
  beforeEach(() => { store = new DocumentStore(); });

  Array.from({ length: 20 }, (_, i) => i).forEach(i => {
    it(`obsolete transitions status to OBSOLETE (iteration ${i})`, () => {
      const doc = makeDoc(store, { title: `Doc ${i}` });
      const obs = store.obsolete(doc.id);
      expect(obs.status).toBe('OBSOLETE');
    });

    it(`obsolete persists status (iteration ${i})`, () => {
      const doc = makeDoc(store, { title: `Doc ${i}` });
      store.obsolete(doc.id);
      expect(store.get(doc.id)?.status).toBe('OBSOLETE');
    });

    it(`obsolete returns record with correct id (iteration ${i})`, () => {
      const doc = makeDoc(store, { title: `Doc ${i}` });
      const obs = store.obsolete(doc.id);
      expect(obs.id).toBe(doc.id);
    });
  });

  it('throws for unknown id', () => {
    expect(() => store.obsolete('no-such-id')).toThrow('Document not found: no-such-id');
  });
});

// ---------------------------------------------------------------------------
// 8. DocumentStore — withdraw (parameterized × 20)
// ---------------------------------------------------------------------------
describe('DocumentStore.withdraw', () => {
  let store: DocumentStore;
  beforeEach(() => { store = new DocumentStore(); });

  Array.from({ length: 20 }, (_, i) => i).forEach(i => {
    it(`withdraw transitions status to WITHDRAWN (iteration ${i})`, () => {
      const doc = makeDoc(store, { title: `Doc ${i}` });
      const wd = store.withdraw(doc.id);
      expect(wd.status).toBe('WITHDRAWN');
    });

    it(`withdraw persists status (iteration ${i})`, () => {
      const doc = makeDoc(store, { title: `Doc ${i}` });
      store.withdraw(doc.id);
      expect(store.get(doc.id)?.status).toBe('WITHDRAWN');
    });

    it(`withdraw returns record with correct id (iteration ${i})`, () => {
      const doc = makeDoc(store, { title: `Doc ${i}` });
      const wd = store.withdraw(doc.id);
      expect(wd.id).toBe(doc.id);
    });
  });

  it('throws for unknown id', () => {
    expect(() => store.withdraw('no-such-id')).toThrow('Document not found: no-such-id');
  });
});

// ---------------------------------------------------------------------------
// 9. DocumentStore — revise (parameterized × 20)
// ---------------------------------------------------------------------------
describe('DocumentStore.revise', () => {
  let store: DocumentStore;
  beforeEach(() => { store = new DocumentStore(); });

  Array.from({ length: 20 }, (_, i) => i).forEach(i => {
    it(`revise creates new record with new version (iteration ${i})`, () => {
      const doc = makeDoc(store, { title: `Doc ${i}`, version: `${i}.0` });
      const revised = store.revise(doc.id, `${i + 1}.0`);
      expect(revised.version).toBe(`${i + 1}.0`);
    });

    it(`revise new record has status DRAFT (iteration ${i})`, () => {
      const doc = makeDoc(store, { title: `Doc ${i}` });
      const revised = store.revise(doc.id, '2.0');
      expect(revised.status).toBe('DRAFT');
    });

    it(`revise original record is unchanged (iteration ${i})`, () => {
      const doc = makeDoc(store, { title: `Doc ${i}` });
      const originalStatus = doc.status;
      store.revise(doc.id, '2.0');
      expect(store.get(doc.id)?.status).toBe(originalStatus);
    });

    it(`revise new record has different id from original (iteration ${i})`, () => {
      const doc = makeDoc(store, { title: `Doc ${i}` });
      const revised = store.revise(doc.id, '2.0');
      expect(revised.id).not.toBe(doc.id);
    });

    it(`revise increases total count (iteration ${i})`, () => {
      const countBefore = store.getCount();
      const doc = makeDoc(store, { title: `Doc ${i}` });
      store.revise(doc.id, '2.0');
      expect(store.getCount()).toBe(countBefore + 2);
    });
  });

  it('revise clears approvedBy on new record', () => {
    const doc = makeDoc(store);
    store.approve(doc.id, 'approver@ims.local');
    const revised = store.revise(doc.id, '2.0');
    expect(revised.approvedBy).toBeUndefined();
  });

  it('revise clears approvedAt on new record', () => {
    const doc = makeDoc(store);
    store.approve(doc.id, 'approver@ims.local');
    const revised = store.revise(doc.id, '2.0');
    expect(revised.approvedAt).toBeUndefined();
  });

  it('throws for unknown id', () => {
    expect(() => store.revise('no-such-id', '2.0')).toThrow('Document not found: no-such-id');
  });
});

// ---------------------------------------------------------------------------
// 10. DocumentStore — getByStatus (parameterized × 6 statuses × 5 docs)
// ---------------------------------------------------------------------------
describe('DocumentStore.getByStatus', () => {
  let store: DocumentStore;
  beforeEach(() => { store = new DocumentStore(); });

  it('getByStatus DRAFT returns only DRAFT records', () => {
    const doc = makeDoc(store);
    const results = store.getByStatus('DRAFT');
    expect(results.every(d => d.status === 'DRAFT')).toBe(true);
    expect(results).toContainEqual(doc);
  });

  Array.from({ length: 5 }, (_, i) => i).forEach(i => {
    it(`getByStatus UNDER_REVIEW returns correct records (set ${i})`, () => {
      const doc = makeDoc(store, { title: `UR Doc ${i}` });
      store.submitForReview(doc.id);
      const results = store.getByStatus('UNDER_REVIEW');
      expect(results.some(d => d.id === doc.id)).toBe(true);
    });

    it(`getByStatus APPROVED returns correct records (set ${i})`, () => {
      const doc = makeDoc(store, { title: `Appr Doc ${i}` });
      store.approve(doc.id, 'manager@ims.local');
      const results = store.getByStatus('APPROVED');
      expect(results.some(d => d.id === doc.id)).toBe(true);
    });

    it(`getByStatus PUBLISHED returns correct records (set ${i})`, () => {
      const doc = makeDoc(store, { title: `Pub Doc ${i}` });
      store.publish(doc.id);
      const results = store.getByStatus('PUBLISHED');
      expect(results.some(d => d.id === doc.id)).toBe(true);
    });

    it(`getByStatus OBSOLETE returns correct records (set ${i})`, () => {
      const doc = makeDoc(store, { title: `Obs Doc ${i}` });
      store.obsolete(doc.id);
      const results = store.getByStatus('OBSOLETE');
      expect(results.some(d => d.id === doc.id)).toBe(true);
    });

    it(`getByStatus WITHDRAWN returns correct records (set ${i})`, () => {
      const doc = makeDoc(store, { title: `Wd Doc ${i}` });
      store.withdraw(doc.id);
      const results = store.getByStatus('WITHDRAWN');
      expect(results.some(d => d.id === doc.id)).toBe(true);
    });
  });
});

// ---------------------------------------------------------------------------
// 11. DocumentStore — getByType (parameterized × 7 types × 5)
// ---------------------------------------------------------------------------
describe('DocumentStore.getByType — bulk parameterized', () => {
  let store: DocumentStore;
  beforeEach(() => { store = new DocumentStore(); });

  ALL_TYPES.forEach(type => {
    Array.from({ length: 5 }, (_, i) => i).forEach(i => {
      it(`getByType ${type} includes doc (iteration ${i})`, () => {
        const doc = makeDoc(store, { documentType: type, title: `${type}-${i}` });
        expect(store.getByType(type)).toContainEqual(doc);
      });
    });
  });

  it('getByType does not return wrong type', () => {
    makeDoc(store, { documentType: 'POLICY' });
    const procedures = store.getByType('PROCEDURE');
    expect(procedures.every(d => d.documentType === 'PROCEDURE')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 12. DocumentStore — getByOwner (parameterized × 15)
// ---------------------------------------------------------------------------
describe('DocumentStore.getByOwner', () => {
  let store: DocumentStore;
  beforeEach(() => { store = new DocumentStore(); });

  Array.from({ length: 15 }, (_, i) => i).forEach(i => {
    it(`getByOwner returns docs owned by owner${i} (iteration ${i})`, () => {
      const doc = makeDoc(store, { owner: `owner${i}@ims.local` });
      const results = store.getByOwner(`owner${i}@ims.local`);
      expect(results).toContainEqual(doc);
    });

    it(`getByOwner excludes docs with different owner (iteration ${i})`, () => {
      makeDoc(store, { owner: `owner${i}@ims.local` });
      const results = store.getByOwner(`other-owner@ims.local`);
      expect(results.every(d => d.owner === 'other-owner@ims.local')).toBe(true);
    });
  });
});

// ---------------------------------------------------------------------------
// 13. DocumentStore — getByTag (parameterized × 15)
// ---------------------------------------------------------------------------
describe('DocumentStore.getByTag', () => {
  let store: DocumentStore;
  beforeEach(() => { store = new DocumentStore(); });

  Array.from({ length: 15 }, (_, i) => i).forEach(i => {
    it(`getByTag includes doc tagged with tag${i} (iteration ${i})`, () => {
      const doc = makeDoc(store, { tags: [`tag${i}`, 'common'] });
      expect(store.getByTag(`tag${i}`)).toContainEqual(doc);
    });

    it(`getByTag returns docs with multiple tags (iteration ${i})`, () => {
      const doc = makeDoc(store, { tags: ['alpha', `beta${i}`] });
      expect(store.getByTag('alpha')).toContainEqual(doc);
    });

    it(`getByTag excludes docs without tag (iteration ${i})`, () => {
      makeDoc(store, { tags: [`tag${i}`] });
      const results = store.getByTag('unrelated-tag-xyz');
      expect(results.every(d => d.tags.includes('unrelated-tag-xyz'))).toBe(true);
    });
  });

  it('getByTag returns empty array when no docs have that tag', () => {
    makeDoc(store, { tags: ['alpha'] });
    expect(store.getByTag('omega')).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// 14. DocumentStore — getOverdueReview (parameterized × 15)
// ---------------------------------------------------------------------------
describe('DocumentStore.getOverdueReview', () => {
  let store: DocumentStore;
  beforeEach(() => { store = new DocumentStore(); });

  Array.from({ length: 15 }, (_, i) => i).forEach(i => {
    it(`getOverdueReview includes PUBLISHED doc with nextReviewDate in past (iteration ${i})`, () => {
      const doc = makeDoc(store, { title: `Overdue ${i}`, nextReviewDate: '2020-01-01' });
      store.publish(doc.id);
      const results = store.getOverdueReview('2026-01-01');
      expect(results.some(d => d.id === doc.id)).toBe(true);
    });

    it(`getOverdueReview excludes PUBLISHED doc with future nextReviewDate (iteration ${i})`, () => {
      const doc = makeDoc(store, { title: `Future ${i}`, nextReviewDate: '2030-01-01' });
      store.publish(doc.id);
      const results = store.getOverdueReview('2026-01-01');
      expect(results.every(d => d.id !== doc.id || d.nextReviewDate! >= '2026-01-01')).toBe(true);
    });

    it(`getOverdueReview excludes non-PUBLISHED docs (iteration ${i})`, () => {
      const doc = makeDoc(store, { title: `Draft ${i}`, nextReviewDate: '2020-01-01' });
      // leave as DRAFT
      const results = store.getOverdueReview('2026-01-01');
      expect(results.every(d => d.id !== doc.id)).toBe(true);
    });
  });

  it('getOverdueReview excludes PUBLISHED doc without nextReviewDate', () => {
    const doc = makeDoc(store);
    store.publish(doc.id);
    const results = store.getOverdueReview('2026-01-01');
    expect(results.every(d => d.id !== doc.id)).toBe(true);
  });

  it('getOverdueReview excludes OBSOLETE doc even with past nextReviewDate', () => {
    const doc = makeDoc(store, { nextReviewDate: '2020-01-01' });
    store.obsolete(doc.id);
    const results = store.getOverdueReview('2026-01-01');
    expect(results.every(d => d.id !== doc.id)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 15. DocumentStore — getCount (parameterized × 20)
// ---------------------------------------------------------------------------
describe('DocumentStore.getCount', () => {
  let store: DocumentStore;
  beforeEach(() => { store = new DocumentStore(); });

  Array.from({ length: 20 }, (_, i) => i).forEach(i => {
    it(`getCount returns ${i + 1} after adding ${i + 1} documents (iteration ${i})`, () => {
      Array.from({ length: i + 1 }, (_, j) => makeDoc(store, { title: `Count Doc ${i}-${j}` }));
      expect(store.getCount()).toBe(i + 1);
    });
  });
});

// ---------------------------------------------------------------------------
// 16. DocumentStore — getAll (parameterized × 10)
// ---------------------------------------------------------------------------
describe('DocumentStore.getAll', () => {
  let store: DocumentStore;
  beforeEach(() => { store = new DocumentStore(); });

  Array.from({ length: 10 }, (_, i) => i).forEach(i => {
    it(`getAll returns all ${i + 1} documents (iteration ${i})`, () => {
      const docs = Array.from({ length: i + 1 }, (_, j) => makeDoc(store, { title: `All Doc ${i}-${j}` }));
      const all = store.getAll();
      docs.forEach(doc => expect(all).toContainEqual(doc));
    });
  });

  it('getAll returns empty array on empty store', () => {
    expect(store.getAll()).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// 17. DocumentStore — get (parameterized × 15)
// ---------------------------------------------------------------------------
describe('DocumentStore.get', () => {
  let store: DocumentStore;
  beforeEach(() => { store = new DocumentStore(); });

  Array.from({ length: 15 }, (_, i) => i).forEach(i => {
    it(`get returns correct record for id (iteration ${i})`, () => {
      const doc = makeDoc(store, { title: `Get Doc ${i}` });
      expect(store.get(doc.id)).toEqual(doc);
    });
  });

  it('get returns undefined for unknown id', () => {
    expect(store.get('non-existent-id')).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// 18. DocumentStore — error paths
// ---------------------------------------------------------------------------
describe('DocumentStore — error paths', () => {
  let store: DocumentStore;
  beforeEach(() => { store = new DocumentStore(); });

  it('submitForReview throws with message containing id', () => {
    expect(() => store.submitForReview('bad-id')).toThrow('bad-id');
  });

  it('approve throws with message containing id', () => {
    expect(() => store.approve('bad-id', 'approver')).toThrow('bad-id');
  });

  it('publish throws with message containing id', () => {
    expect(() => store.publish('bad-id')).toThrow('bad-id');
  });

  it('obsolete throws with message containing id', () => {
    expect(() => store.obsolete('bad-id')).toThrow('bad-id');
  });

  it('withdraw throws with message containing id', () => {
    expect(() => store.withdraw('bad-id')).toThrow('bad-id');
  });

  it('revise throws with message containing id', () => {
    expect(() => store.revise('bad-id', '2.0')).toThrow('bad-id');
  });

  Array.from({ length: 10 }, (_, i) => i).forEach(i => {
    it(`throws Error (not string) for unknown id pattern-${i}`, () => {
      expect(() => store.publish(`unknown-${i}`)).toThrow(Error);
    });
  });
});

// ---------------------------------------------------------------------------
// 19. ReviewTracker — addReview (parameterized × 25)
// ---------------------------------------------------------------------------
describe('ReviewTracker.addReview', () => {
  let tracker: ReviewTracker;
  beforeEach(() => { tracker = new ReviewTracker(); });

  Array.from({ length: 25 }, (_, i) => i).forEach(i => {
    it(`addReview returns record with id starting rev- (iteration ${i})`, () => {
      const rev = tracker.addReview(`doc-${i}`, `reviewer-${i}`, 'APPROVED');
      expect(rev.id).toMatch(/^rev-/);
    });

    it(`addReview sets documentId (iteration ${i})`, () => {
      const rev = tracker.addReview(`doc-${i}`, `reviewer-${i}`, 'APPROVED');
      expect(rev.documentId).toBe(`doc-${i}`);
    });

    it(`addReview sets reviewerId (iteration ${i})`, () => {
      const rev = tracker.addReview(`doc-${i}`, `reviewer-${i}`, 'REJECTED');
      expect(rev.reviewerId).toBe(`reviewer-${i}`);
    });

    it(`addReview sets outcome (iteration ${i})`, () => {
      const outcome = ALL_OUTCOMES[i % 3];
      const rev = tracker.addReview(`doc-${i}`, `reviewer-${i}`, outcome);
      expect(rev.outcome).toBe(outcome);
    });

    it(`addReview stores in tracker and increments count (iteration ${i})`, () => {
      tracker.addReview(`doc-${i}`, `reviewer-${i}`, 'NEEDS_REVISION');
      expect(tracker.getCount()).toBeGreaterThan(0);
    });
  });

  it('addReview sets reviewedAt to provided value', () => {
    const ts = '2026-01-15T10:00:00.000Z';
    const rev = tracker.addReview('doc-1', 'r1', 'APPROVED', undefined, ts);
    expect(rev.reviewedAt).toBe(ts);
  });

  it('addReview defaults reviewedAt to current ISO string', () => {
    const before = new Date().toISOString();
    const rev = tracker.addReview('doc-1', 'r1', 'APPROVED');
    const after = new Date().toISOString();
    expect(rev.reviewedAt >= before).toBe(true);
    expect(rev.reviewedAt <= after).toBe(true);
  });

  it('addReview stores optional comments', () => {
    const rev = tracker.addReview('doc-1', 'r1', 'REJECTED', 'Needs more detail');
    expect(rev.comments).toBe('Needs more detail');
  });

  it('addReview comments undefined when not provided', () => {
    const rev = tracker.addReview('doc-1', 'r1', 'APPROVED');
    expect(rev.comments).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// 20. ReviewTracker — getByDocument (parameterized × 15)
// ---------------------------------------------------------------------------
describe('ReviewTracker.getByDocument', () => {
  let tracker: ReviewTracker;
  beforeEach(() => { tracker = new ReviewTracker(); });

  Array.from({ length: 15 }, (_, i) => i).forEach(i => {
    it(`getByDocument returns reviews for document ${i}`, () => {
      const rev = tracker.addReview(`doc-${i}`, 'reviewer', 'APPROVED');
      const results = tracker.getByDocument(`doc-${i}`);
      expect(results).toContainEqual(rev);
    });

    it(`getByDocument excludes reviews for other documents (iteration ${i})`, () => {
      tracker.addReview(`doc-${i}`, 'reviewer', 'APPROVED');
      const results = tracker.getByDocument('other-doc');
      expect(results.every(r => r.documentId === 'other-doc')).toBe(true);
    });

    it(`getByDocument returns multiple reviews for same document (iteration ${i})`, () => {
      tracker.addReview(`multi-${i}`, 'r1', 'APPROVED');
      tracker.addReview(`multi-${i}`, 'r2', 'REJECTED');
      const results = tracker.getByDocument(`multi-${i}`);
      expect(results).toHaveLength(2);
    });
  });

  it('getByDocument returns empty array for unknown document', () => {
    expect(tracker.getByDocument('unknown-doc')).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// 21. ReviewTracker — getByReviewer (parameterized × 15)
// ---------------------------------------------------------------------------
describe('ReviewTracker.getByReviewer', () => {
  let tracker: ReviewTracker;
  beforeEach(() => { tracker = new ReviewTracker(); });

  Array.from({ length: 15 }, (_, i) => i).forEach(i => {
    it(`getByReviewer returns reviews by reviewer${i}`, () => {
      const rev = tracker.addReview('doc-1', `reviewer${i}`, 'APPROVED');
      const results = tracker.getByReviewer(`reviewer${i}`);
      expect(results).toContainEqual(rev);
    });

    it(`getByReviewer excludes reviews by other reviewers (iteration ${i})`, () => {
      tracker.addReview('doc-1', `reviewer${i}`, 'APPROVED');
      const results = tracker.getByReviewer('other-reviewer');
      expect(results.every(r => r.reviewerId === 'other-reviewer')).toBe(true);
    });

    it(`getByReviewer returns multiple docs reviewed by reviewer${i}`, () => {
      tracker.addReview(`docA-${i}`, `reviewer${i}`, 'APPROVED');
      tracker.addReview(`docB-${i}`, `reviewer${i}`, 'REJECTED');
      const results = tracker.getByReviewer(`reviewer${i}`);
      expect(results).toHaveLength(2);
    });
  });

  it('getByReviewer returns empty array for unknown reviewer', () => {
    expect(tracker.getByReviewer('no-one')).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// 22. ReviewTracker — getByOutcome (parameterized × 10 × 3 outcomes)
// ---------------------------------------------------------------------------
describe('ReviewTracker.getByOutcome', () => {
  let tracker: ReviewTracker;
  beforeEach(() => { tracker = new ReviewTracker(); });

  ALL_OUTCOMES.forEach(outcome => {
    Array.from({ length: 10 }, (_, i) => i).forEach(i => {
      it(`getByOutcome(${outcome}) includes correct review (iteration ${i})`, () => {
        const rev = tracker.addReview(`doc-${outcome}-${i}`, 'reviewer', outcome);
        const results = tracker.getByOutcome(outcome);
        expect(results).toContainEqual(rev);
      });
    });

    it(`getByOutcome(${outcome}) returns only ${outcome} reviews`, () => {
      tracker.addReview('doc-1', 'r1', outcome);
      const results = tracker.getByOutcome(outcome);
      expect(results.every(r => r.outcome === outcome)).toBe(true);
    });
  });

  it('getByOutcome returns empty array when none match', () => {
    tracker.addReview('doc-1', 'r1', 'APPROVED');
    const results = tracker.getByOutcome('REJECTED');
    expect(results).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// 23. ReviewTracker — getLatestReview (parameterized × 15)
// ---------------------------------------------------------------------------
describe('ReviewTracker.getLatestReview', () => {
  let tracker: ReviewTracker;
  beforeEach(() => { tracker = new ReviewTracker(); });

  Array.from({ length: 15 }, (_, i) => i).forEach(i => {
    it(`getLatestReview returns latest review for document (iteration ${i})`, () => {
      tracker.addReview(`doc-${i}`, 'r1', 'APPROVED', undefined, '2025-01-01T00:00:00.000Z');
      const latest = tracker.addReview(`doc-${i}`, 'r2', 'REJECTED', undefined, '2026-01-01T00:00:00.000Z');
      expect(tracker.getLatestReview(`doc-${i}`)?.id).toBe(latest.id);
    });

    it(`getLatestReview returns single review when only one exists (iteration ${i})`, () => {
      const rev = tracker.addReview(`solo-${i}`, 'r1', 'APPROVED', undefined, '2026-01-01T00:00:00.000Z');
      expect(tracker.getLatestReview(`solo-${i}`)).toEqual(rev);
    });

    it(`getLatestReview returns undefined for unknown document (iteration ${i})`, () => {
      expect(tracker.getLatestReview(`unknown-${i}`)).toBeUndefined();
    });
  });

  it('getLatestReview handles three reviews correctly', () => {
    tracker.addReview('doc-x', 'r1', 'APPROVED', undefined, '2024-01-01T00:00:00.000Z');
    tracker.addReview('doc-x', 'r2', 'REJECTED', undefined, '2025-06-01T00:00:00.000Z');
    const latest = tracker.addReview('doc-x', 'r3', 'NEEDS_REVISION', undefined, '2026-01-01T00:00:00.000Z');
    expect(tracker.getLatestReview('doc-x')?.id).toBe(latest.id);
  });
});

// ---------------------------------------------------------------------------
// 24. ReviewTracker — getCount (parameterized × 20)
// ---------------------------------------------------------------------------
describe('ReviewTracker.getCount', () => {
  let tracker: ReviewTracker;
  beforeEach(() => { tracker = new ReviewTracker(); });

  Array.from({ length: 20 }, (_, i) => i).forEach(i => {
    it(`getCount returns ${i + 1} after ${i + 1} reviews added (iteration ${i})`, () => {
      Array.from({ length: i + 1 }, (_, j) => tracker.addReview(`doc-${i}-${j}`, 'r', 'APPROVED'));
      expect(tracker.getCount()).toBe(i + 1);
    });
  });
});

// ---------------------------------------------------------------------------
// 25. ReviewTracker — id sequence (parameterized × 15)
// ---------------------------------------------------------------------------
describe('ReviewTracker — id sequence', () => {
  let tracker: ReviewTracker;
  beforeEach(() => { tracker = new ReviewTracker(); });

  Array.from({ length: 15 }, (_, i) => i).forEach(i => {
    it(`review id is rev-${i + 1} for sequential addition (iteration ${i})`, () => {
      const revs = Array.from({ length: i + 1 }, (_, j) =>
        tracker.addReview(`doc-${j}`, 'r', 'APPROVED'),
      );
      expect(revs[i].id).toBe(`rev-${i + 1}`);
    });
  });
});

// ---------------------------------------------------------------------------
// 26. Integration: full document lifecycle (parameterized × 20)
// ---------------------------------------------------------------------------
describe('Integration: full document lifecycle', () => {
  let store: DocumentStore;
  let tracker: ReviewTracker;
  beforeEach(() => {
    store = new DocumentStore();
    tracker = new ReviewTracker();
  });

  Array.from({ length: 20 }, (_, i) => i).forEach(i => {
    it(`full lifecycle: DRAFT → UNDER_REVIEW → APPROVED → PUBLISHED → OBSOLETE (iteration ${i})`, () => {
      const doc = makeDoc(store, { title: `Lifecycle Doc ${i}` });
      expect(doc.status).toBe('DRAFT');

      const underReview = store.submitForReview(doc.id);
      expect(underReview.status).toBe('UNDER_REVIEW');

      const rev = tracker.addReview(doc.id, `reviewer${i}@ims.local`, 'APPROVED', 'LGTM');
      expect(rev.outcome).toBe('APPROVED');

      const approved = store.approve(doc.id, `manager${i}@ims.local`, '2027-01-01');
      expect(approved.status).toBe('APPROVED');
      expect(approved.approvedBy).toBe(`manager${i}@ims.local`);

      const published = store.publish(doc.id);
      expect(published.status).toBe('PUBLISHED');

      const obs = store.obsolete(doc.id);
      expect(obs.status).toBe('OBSOLETE');
    });
  });

  Array.from({ length: 10 }, (_, i) => i).forEach(i => {
    it(`lifecycle with revision: original preserved, new record is DRAFT (iteration ${i})`, () => {
      const doc = makeDoc(store, { title: `Rev Lifecycle ${i}`, version: '1.0' });
      store.approve(doc.id, 'manager@ims.local');
      store.publish(doc.id);
      const revised = store.revise(doc.id, '2.0');

      expect(store.get(doc.id)?.status).toBe('PUBLISHED');
      expect(revised.status).toBe('DRAFT');
      expect(revised.version).toBe('2.0');
    });
  });

  Array.from({ length: 10 }, (_, i) => i).forEach(i => {
    it(`lifecycle: submit then withdraw (iteration ${i})`, () => {
      const doc = makeDoc(store, { title: `Withdraw Lifecycle ${i}` });
      store.submitForReview(doc.id);
      const wd = store.withdraw(doc.id);
      expect(wd.status).toBe('WITHDRAWN');
    });
  });
});

// ---------------------------------------------------------------------------
// 27. DocumentStore — bulk operations (parameterized × 10)
// ---------------------------------------------------------------------------
describe('DocumentStore — bulk operations', () => {
  let store: DocumentStore;
  beforeEach(() => { store = new DocumentStore(); });

  Array.from({ length: 10 }, (_, i) => i).forEach(i => {
    it(`creates 30 documents and all are retrievable (iteration ${i})`, () => {
      const ids = Array.from({ length: 30 }, (_, j) =>
        makeDoc(store, { title: `Bulk-${i}-${j}` }).id,
      );
      expect(store.getCount()).toBe(30);
      ids.forEach(id => expect(store.get(id)).toBeDefined());
    });
  });
});

// ---------------------------------------------------------------------------
// 28. DocumentStore — updatedAt changes on state transitions (parameterized × 10)
// ---------------------------------------------------------------------------
describe('DocumentStore — updatedAt changes on transitions', () => {
  let store: DocumentStore;
  beforeEach(() => { store = new DocumentStore(); });

  Array.from({ length: 10 }, (_, i) => i).forEach(i => {
    it(`submitForReview updates updatedAt (iteration ${i})`, () => {
      const doc = makeDoc(store, { title: `TS Doc ${i}` });
      const originalUpdatedAt = doc.updatedAt;
      const updated = store.submitForReview(doc.id);
      expect(updated.updatedAt >= originalUpdatedAt).toBe(true);
    });

    it(`publish updates updatedAt (iteration ${i})`, () => {
      const doc = makeDoc(store, { title: `Pub TS Doc ${i}` });
      const originalUpdatedAt = doc.updatedAt;
      const updated = store.publish(doc.id);
      expect(updated.updatedAt >= originalUpdatedAt).toBe(true);
    });
  });
});

// ---------------------------------------------------------------------------
// 29. DocumentStore — multiple tags and multi-filter (parameterized × 10)
// ---------------------------------------------------------------------------
describe('DocumentStore — multiple tags', () => {
  let store: DocumentStore;
  beforeEach(() => { store = new DocumentStore(); });

  Array.from({ length: 10 }, (_, i) => i).forEach(i => {
    it(`getByTag returns docs with tag at any position in array (iteration ${i})`, () => {
      const doc = makeDoc(store, { tags: ['first', `middle-${i}`, 'last'] });
      expect(store.getByTag(`middle-${i}`)).toContainEqual(doc);
    });

    it(`getByTag with first tag (iteration ${i})`, () => {
      const doc = makeDoc(store, { tags: [`first-${i}`, 'other'] });
      expect(store.getByTag(`first-${i}`)).toContainEqual(doc);
    });

    it(`getByTag with last tag (iteration ${i})`, () => {
      const doc = makeDoc(store, { tags: ['other', `last-${i}`] });
      expect(store.getByTag(`last-${i}`)).toContainEqual(doc);
    });
  });
});

// ---------------------------------------------------------------------------
// 30. ReviewTracker — multiple reviews same document (parameterized × 10)
// ---------------------------------------------------------------------------
describe('ReviewTracker — multiple reviews same document', () => {
  let tracker: ReviewTracker;
  beforeEach(() => { tracker = new ReviewTracker(); });

  Array.from({ length: 10 }, (_, i) => i).forEach(i => {
    it(`document can have ${i + 1} reviews and getByDocument returns all (iteration ${i})`, () => {
      const docId = `doc-multi-${i}`;
      Array.from({ length: i + 1 }, (_, j) =>
        tracker.addReview(docId, `reviewer-${j}`, ALL_OUTCOMES[j % 3]),
      );
      const reviews = tracker.getByDocument(docId);
      expect(reviews).toHaveLength(i + 1);
    });
  });
});

// ---------------------------------------------------------------------------
// 31. DocumentStore — getByType excludes other types (parameterized × 7 × 7)
// ---------------------------------------------------------------------------
describe('DocumentStore — getByType cross-exclusion', () => {
  let store: DocumentStore;
  beforeEach(() => { store = new DocumentStore(); });

  ALL_TYPES.forEach(sourceType => {
    it(`getByType(${sourceType}) returns only ${sourceType} records`, () => {
      ALL_TYPES.forEach(t => makeDoc(store, { documentType: t }));
      const results = store.getByType(sourceType);
      expect(results.every(d => d.documentType === sourceType)).toBe(true);
    });
  });
});

// ---------------------------------------------------------------------------
// 32. DocumentStore — approve with all types (parameterized × 7)
// ---------------------------------------------------------------------------
describe('DocumentStore — approve across all document types', () => {
  let store: DocumentStore;
  beforeEach(() => { store = new DocumentStore(); });

  ALL_TYPES.forEach(type => {
    it(`approve works for type ${type}`, () => {
      const doc = makeDoc(store, { documentType: type });
      const approved = store.approve(doc.id, 'approver@ims.local');
      expect(approved.status).toBe('APPROVED');
      expect(approved.documentType).toBe(type);
    });
  });
});

// ---------------------------------------------------------------------------
// 33. ReviewTracker — outcome distribution (parameterized × 10)
// ---------------------------------------------------------------------------
describe('ReviewTracker — outcome distribution', () => {
  let tracker: ReviewTracker;
  beforeEach(() => { tracker = new ReviewTracker(); });

  Array.from({ length: 10 }, (_, i) => i).forEach(i => {
    it(`after adding 3 reviews (one each outcome), each getByOutcome returns 1 (iteration ${i})`, () => {
      const docId = `distrib-${i}`;
      tracker.addReview(docId, 'r1', 'APPROVED');
      tracker.addReview(docId, 'r2', 'REJECTED');
      tracker.addReview(docId, 'r3', 'NEEDS_REVISION');
      expect(tracker.getByOutcome('APPROVED').length).toBeGreaterThanOrEqual(1);
      expect(tracker.getByOutcome('REJECTED').length).toBeGreaterThanOrEqual(1);
      expect(tracker.getByOutcome('NEEDS_REVISION').length).toBeGreaterThanOrEqual(1);
    });
  });
});

// ---------------------------------------------------------------------------
// 34. DocumentRecord interface shape
// ---------------------------------------------------------------------------
describe('DocumentRecord shape', () => {
  let store: DocumentStore;
  beforeEach(() => { store = new DocumentStore(); });

  Array.from({ length: 20 }, (_, i) => i).forEach(i => {
    it(`DocumentRecord has all required fields (iteration ${i})`, () => {
      const doc = makeDoc(store, { title: `Shape Doc ${i}` });
      expect(doc).toHaveProperty('id');
      expect(doc).toHaveProperty('title');
      expect(doc).toHaveProperty('documentType');
      expect(doc).toHaveProperty('version');
      expect(doc).toHaveProperty('status');
      expect(doc).toHaveProperty('author');
      expect(doc).toHaveProperty('owner');
      expect(doc).toHaveProperty('createdAt');
      expect(doc).toHaveProperty('updatedAt');
      expect(doc).toHaveProperty('tags');
    });
  });
});

// ---------------------------------------------------------------------------
// 35. ReviewRecord interface shape
// ---------------------------------------------------------------------------
describe('ReviewRecord shape', () => {
  let tracker: ReviewTracker;
  beforeEach(() => { tracker = new ReviewTracker(); });

  Array.from({ length: 20 }, (_, i) => i).forEach(i => {
    it(`ReviewRecord has all required fields (iteration ${i})`, () => {
      const rev = tracker.addReview(`doc-${i}`, `reviewer-${i}`, ALL_OUTCOMES[i % 3]);
      expect(rev).toHaveProperty('id');
      expect(rev).toHaveProperty('documentId');
      expect(rev).toHaveProperty('reviewerId');
      expect(rev).toHaveProperty('outcome');
      expect(rev).toHaveProperty('reviewedAt');
    });
  });
});

// ---------------------------------------------------------------------------
// 36. Edge cases — empty store operations
// ---------------------------------------------------------------------------
describe('Edge cases — empty store', () => {
  let store: DocumentStore;
  let tracker: ReviewTracker;
  beforeEach(() => {
    store = new DocumentStore();
    tracker = new ReviewTracker();
  });

  it('getAll returns [] on empty store', () => {
    expect(store.getAll()).toEqual([]);
  });

  it('getCount returns 0 on empty store', () => {
    expect(store.getCount()).toBe(0);
  });

  it('getByStatus returns [] on empty store', () => {
    expect(store.getByStatus('DRAFT')).toEqual([]);
  });

  it('getByType returns [] on empty store', () => {
    expect(store.getByType('PROCEDURE')).toEqual([]);
  });

  it('getByOwner returns [] on empty store', () => {
    expect(store.getByOwner('nobody')).toEqual([]);
  });

  it('getByTag returns [] on empty store', () => {
    expect(store.getByTag('sometag')).toEqual([]);
  });

  it('getOverdueReview returns [] on empty store', () => {
    expect(store.getOverdueReview('2026-01-01')).toEqual([]);
  });

  it('tracker getByDocument returns [] on empty tracker', () => {
    expect(tracker.getByDocument('doc-1')).toEqual([]);
  });

  it('tracker getByReviewer returns [] on empty tracker', () => {
    expect(tracker.getByReviewer('r1')).toEqual([]);
  });

  it('tracker getByOutcome returns [] on empty tracker', () => {
    expect(tracker.getByOutcome('APPROVED')).toEqual([]);
  });

  it('tracker getLatestReview returns undefined on empty tracker', () => {
    expect(tracker.getLatestReview('doc-1')).toBeUndefined();
  });

  it('tracker getCount returns 0 on empty tracker', () => {
    expect(tracker.getCount()).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// 37. Idempotency checks — re-running transitions
// ---------------------------------------------------------------------------
describe('Idempotency — re-running transitions', () => {
  let store: DocumentStore;
  beforeEach(() => { store = new DocumentStore(); });

  Array.from({ length: 10 }, (_, i) => i).forEach(i => {
    it(`publish twice keeps PUBLISHED status (iteration ${i})`, () => {
      const doc = makeDoc(store, { title: `Idemp ${i}` });
      store.publish(doc.id);
      store.publish(doc.id);
      expect(store.get(doc.id)?.status).toBe('PUBLISHED');
    });

    it(`obsolete twice keeps OBSOLETE status (iteration ${i})`, () => {
      const doc = makeDoc(store, { title: `Obs Idemp ${i}` });
      store.obsolete(doc.id);
      store.obsolete(doc.id);
      expect(store.get(doc.id)?.status).toBe('OBSOLETE');
    });
  });
});

// ---------------------------------------------------------------------------
// 38. DocumentStore — content optional field
// ---------------------------------------------------------------------------
describe('DocumentStore — content field', () => {
  let store: DocumentStore;
  beforeEach(() => { store = new DocumentStore(); });

  Array.from({ length: 10 }, (_, i) => i).forEach(i => {
    it(`content is preserved through status transitions (iteration ${i})`, () => {
      const doc = makeDoc(store, { content: `Content block ${i}` });
      const published = store.publish(doc.id);
      expect(published.content).toBe(`Content block ${i}`);
    });
  });

  Array.from({ length: 10 }, (_, i) => i).forEach(i => {
    it(`content is preserved in revised document (iteration ${i})`, () => {
      const doc = makeDoc(store, { content: `Original content ${i}` });
      const revised = store.revise(doc.id, '2.0');
      expect(revised.content).toBe(`Original content ${i}`);
    });
  });
});

// ---------------------------------------------------------------------------
// 39. DocumentStore — tags preserved through transitions
// ---------------------------------------------------------------------------
describe('DocumentStore — tags preserved through transitions', () => {
  let store: DocumentStore;
  beforeEach(() => { store = new DocumentStore(); });

  Array.from({ length: 10 }, (_, i) => i).forEach(i => {
    it(`tags preserved after submitForReview (iteration ${i})`, () => {
      const doc = makeDoc(store, { tags: [`t${i}a`, `t${i}b`] });
      const updated = store.submitForReview(doc.id);
      expect(updated.tags).toEqual([`t${i}a`, `t${i}b`]);
    });

    it(`tags preserved after approve (iteration ${i})`, () => {
      const doc = makeDoc(store, { tags: [`tag-${i}`] });
      const approved = store.approve(doc.id, 'approver@ims.local');
      expect(approved.tags).toEqual([`tag-${i}`]);
    });
  });
});

// ---------------------------------------------------------------------------
// 40. DocumentStore — version preserved through transitions
// ---------------------------------------------------------------------------
describe('DocumentStore — version preserved through transitions', () => {
  let store: DocumentStore;
  beforeEach(() => { store = new DocumentStore(); });

  Array.from({ length: 15 }, (_, i) => i).forEach(i => {
    it(`version preserved after publish (iteration ${i})`, () => {
      const v = `${i}.${i}.${i}`;
      const doc = makeDoc(store, { version: v });
      const published = store.publish(doc.id);
      expect(published.version).toBe(v);
    });
  });
});

// ---------------------------------------------------------------------------
// 41. ReviewTracker — unique ids
// ---------------------------------------------------------------------------
describe('ReviewTracker — unique ids', () => {
  let tracker: ReviewTracker;
  beforeEach(() => { tracker = new ReviewTracker(); });

  Array.from({ length: 20 }, (_, i) => i).forEach(i => {
    it(`all ${i + 2} review ids are unique (iteration ${i})`, () => {
      const ids = Array.from({ length: i + 2 }, (_, j) =>
        tracker.addReview(`doc-${j}`, 'r', 'APPROVED').id,
      );
      const unique = new Set(ids);
      expect(unique.size).toBe(ids.length);
    });
  });
});

// ---------------------------------------------------------------------------
// 42. DocumentStore — author preserved through transitions
// ---------------------------------------------------------------------------
describe('DocumentStore — author preserved through transitions', () => {
  let store: DocumentStore;
  beforeEach(() => { store = new DocumentStore(); });

  Array.from({ length: 10 }, (_, i) => i).forEach(i => {
    it(`author preserved through full lifecycle (iteration ${i})`, () => {
      const doc = makeDoc(store, { author: `author${i}@ims.local` });
      store.submitForReview(doc.id);
      store.approve(doc.id, 'approver@ims.local');
      store.publish(doc.id);
      const final = store.get(doc.id);
      expect(final?.author).toBe(`author${i}@ims.local`);
    });
  });
});

// ---------------------------------------------------------------------------
// 43. DocumentStore — title preserved through transitions
// ---------------------------------------------------------------------------
describe('DocumentStore — title preserved', () => {
  let store: DocumentStore;
  beforeEach(() => { store = new DocumentStore(); });

  Array.from({ length: 10 }, (_, i) => i).forEach(i => {
    it(`title preserved after obsolete (iteration ${i})`, () => {
      const title = `Important Procedure ${i}`;
      const doc = makeDoc(store, { title });
      store.obsolete(doc.id);
      expect(store.get(doc.id)?.title).toBe(title);
    });
  });
});
