import { ArticleStore } from '../article-store';
import { CategoryManager } from '../category-manager';
import {
  ArticleStatus,
  ArticleCategory,
  ContentType,
  KBArticle,
  KBCategory,
} from '../types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const ALL_STATUSES: ArticleStatus[] = ['DRAFT', 'REVIEW', 'PUBLISHED', 'ARCHIVED', 'DEPRECATED'];
const ALL_CATEGORIES: ArticleCategory[] = ['PROCEDURE', 'POLICY', 'GUIDE', 'FAQ', 'REFERENCE', 'TEMPLATE'];
const ALL_CONTENT_TYPES: ContentType[] = ['TEXT', 'MARKDOWN', 'HTML'];

function makeStore(): ArticleStore { return new ArticleStore(); }
function makeCatMgr(): CategoryManager { return new CategoryManager(); }

// ---------------------------------------------------------------------------
// ArticleStore — basic creation
// ---------------------------------------------------------------------------

describe('ArticleStore.create — basic properties', () => {
  let store: ArticleStore;
  beforeEach(() => { store = makeStore(); });

  it('returns an object', () => {
    const a = store.create('T', 'C', 'GUIDE', 'alice');
    expect(a).toBeDefined();
  });
  it('id starts with kb-', () => {
    const a = store.create('T', 'C', 'GUIDE', 'alice');
    expect(a.id).toMatch(/^kb-/);
  });
  it('stores the title', () => {
    const a = store.create('My Title', 'C', 'POLICY', 'bob');
    expect(a.title).toBe('My Title');
  });
  it('stores the content', () => {
    const a = store.create('T', 'My content here', 'FAQ', 'carol');
    expect(a.content).toBe('My content here');
  });
  it('stores the category', () => {
    const a = store.create('T', 'C', 'PROCEDURE', 'dave');
    expect(a.category).toBe('PROCEDURE');
  });
  it('stores the author', () => {
    const a = store.create('T', 'C', 'REFERENCE', 'eve');
    expect(a.author).toBe('eve');
  });
  it('status defaults to DRAFT', () => {
    const a = store.create('T', 'C', 'GUIDE', 'alice');
    expect(a.status).toBe('DRAFT');
  });
  it('version defaults to 1', () => {
    const a = store.create('T', 'C', 'GUIDE', 'alice');
    expect(a.version).toBe(1);
  });
  it('viewCount defaults to 0', () => {
    const a = store.create('T', 'C', 'GUIDE', 'alice');
    expect(a.viewCount).toBe(0);
  });
  it('helpful defaults to 0', () => {
    const a = store.create('T', 'C', 'GUIDE', 'alice');
    expect(a.helpful).toBe(0);
  });
  it('notHelpful defaults to 0', () => {
    const a = store.create('T', 'C', 'GUIDE', 'alice');
    expect(a.notHelpful).toBe(0);
  });
  it('contentType defaults to MARKDOWN', () => {
    const a = store.create('T', 'C', 'GUIDE', 'alice');
    expect(a.contentType).toBe('MARKDOWN');
  });
  it('tags default to empty array', () => {
    const a = store.create('T', 'C', 'GUIDE', 'alice');
    expect(a.tags).toEqual([]);
  });
  it('createdAt is a Date', () => {
    const a = store.create('T', 'C', 'GUIDE', 'alice');
    expect(a.createdAt).toBeInstanceOf(Date);
  });
  it('updatedAt is a Date', () => {
    const a = store.create('T', 'C', 'GUIDE', 'alice');
    expect(a.updatedAt).toBeInstanceOf(Date);
  });
  it('publishedAt is undefined initially', () => {
    const a = store.create('T', 'C', 'GUIDE', 'alice');
    expect(a.publishedAt).toBeUndefined();
  });
  it('each article gets a unique id', () => {
    const a1 = store.create('T1', 'C', 'GUIDE', 'alice');
    const a2 = store.create('T2', 'C', 'GUIDE', 'alice');
    expect(a1.id).not.toBe(a2.id);
  });
  it('custom tags are stored', () => {
    const a = store.create('T', 'C', 'GUIDE', 'alice', ['tag1', 'tag2']);
    expect(a.tags).toEqual(['tag1', 'tag2']);
  });
  it('custom contentType TEXT is stored', () => {
    const a = store.create('T', 'C', 'GUIDE', 'alice', [], 'TEXT');
    expect(a.contentType).toBe('TEXT');
  });
  it('custom contentType HTML is stored', () => {
    const a = store.create('T', 'C', 'GUIDE', 'alice', [], 'HTML');
    expect(a.contentType).toBe('HTML');
  });
});

// ---------------------------------------------------------------------------
// ArticleStore — create with all categories (parameterized)
// ---------------------------------------------------------------------------

describe('ArticleStore.create — all categories', () => {
  let store: ArticleStore;
  beforeEach(() => { store = makeStore(); });

  ALL_CATEGORIES.forEach((cat) => {
    it(`stores category ${cat}`, () => {
      const a = store.create('T', 'C', cat, 'author');
      expect(a.category).toBe(cat);
    });
  });
});

// ---------------------------------------------------------------------------
// ArticleStore — create with all content types (parameterized)
// ---------------------------------------------------------------------------

describe('ArticleStore.create — all content types', () => {
  let store: ArticleStore;
  beforeEach(() => { store = makeStore(); });

  ALL_CONTENT_TYPES.forEach((ct) => {
    it(`stores contentType ${ct}`, () => {
      const a = store.create('T', 'C', 'GUIDE', 'author', [], ct);
      expect(a.contentType).toBe(ct);
    });
  });
});

// ---------------------------------------------------------------------------
// ArticleStore — getCount
// ---------------------------------------------------------------------------

describe('ArticleStore.getCount', () => {
  let store: ArticleStore;
  beforeEach(() => { store = makeStore(); });

  it('starts at 0', () => {
    expect(store.getCount()).toBe(0);
  });
  it('is 1 after one create', () => {
    store.create('T', 'C', 'GUIDE', 'alice');
    expect(store.getCount()).toBe(1);
  });
  it('is 2 after two creates', () => {
    store.create('T1', 'C', 'GUIDE', 'alice');
    store.create('T2', 'C', 'GUIDE', 'alice');
    expect(store.getCount()).toBe(2);
  });

  Array.from({ length: 20 }, (_, i) => i + 1).forEach((n) => {
    it(`count is ${n} after creating ${n} articles`, () => {
      for (let k = 0; k < n; k++) store.create(`T${k}`, 'C', 'GUIDE', 'a');
      expect(store.getCount()).toBe(n);
    });
  });
});

// ---------------------------------------------------------------------------
// ArticleStore — get
// ---------------------------------------------------------------------------

describe('ArticleStore.get', () => {
  let store: ArticleStore;
  beforeEach(() => { store = makeStore(); });

  it('returns undefined for unknown id', () => {
    expect(store.get('unknown')).toBeUndefined();
  });
  it('returns the article for a known id', () => {
    const a = store.create('T', 'C', 'GUIDE', 'alice');
    expect(store.get(a.id)).toEqual(a);
  });
  it('returns undefined after creating a different article', () => {
    store.create('T', 'C', 'GUIDE', 'alice');
    expect(store.get('kb-0')).toBeUndefined();
  });
  it('get returns the exact same data', () => {
    const a = store.create('My Article', 'content here', 'POLICY', 'bob', ['x']);
    const fetched = store.get(a.id);
    expect(fetched?.title).toBe('My Article');
    expect(fetched?.content).toBe('content here');
    expect(fetched?.author).toBe('bob');
    expect(fetched?.tags).toEqual(['x']);
  });
});

// ---------------------------------------------------------------------------
// ArticleStore — getAll
// ---------------------------------------------------------------------------

describe('ArticleStore.getAll', () => {
  let store: ArticleStore;
  beforeEach(() => { store = makeStore(); });

  it('returns empty array initially', () => {
    expect(store.getAll()).toEqual([]);
  });
  it('returns all articles', () => {
    store.create('T1', 'C', 'GUIDE', 'alice');
    store.create('T2', 'C', 'POLICY', 'bob');
    expect(store.getAll()).toHaveLength(2);
  });
  it('each element is a KBArticle', () => {
    store.create('T', 'C', 'GUIDE', 'alice');
    const all = store.getAll();
    expect(all[0]).toHaveProperty('id');
    expect(all[0]).toHaveProperty('title');
    expect(all[0]).toHaveProperty('status');
  });

  Array.from({ length: 15 }, (_, i) => i + 1).forEach((n) => {
    it(`getAll returns ${n} items after ${n} creates`, () => {
      for (let k = 0; k < n; k++) store.create(`T${k}`, 'C', 'GUIDE', 'a');
      expect(store.getAll()).toHaveLength(n);
    });
  });
});

// ---------------------------------------------------------------------------
// ArticleStore — update
// ---------------------------------------------------------------------------

describe('ArticleStore.update', () => {
  let store: ArticleStore;
  beforeEach(() => { store = makeStore(); });

  it('throws for unknown id', () => {
    expect(() => store.update('no-such', { title: 'X' })).toThrow('Article not found: no-such');
  });
  it('updates the title', () => {
    const a = store.create('Old', 'C', 'GUIDE', 'alice');
    const u = store.update(a.id, { title: 'New' });
    expect(u.title).toBe('New');
  });
  it('updates the content', () => {
    const a = store.create('T', 'Old content', 'GUIDE', 'alice');
    const u = store.update(a.id, { content: 'New content' });
    expect(u.content).toBe('New content');
  });
  it('updates the tags', () => {
    const a = store.create('T', 'C', 'GUIDE', 'alice', ['old']);
    const u = store.update(a.id, { tags: ['new1', 'new2'] });
    expect(u.tags).toEqual(['new1', 'new2']);
  });
  it('updates the category', () => {
    const a = store.create('T', 'C', 'GUIDE', 'alice');
    const u = store.update(a.id, { category: 'POLICY' });
    expect(u.category).toBe('POLICY');
  });
  it('increments version on update', () => {
    const a = store.create('T', 'C', 'GUIDE', 'alice');
    expect(a.version).toBe(1);
    const u = store.update(a.id, { title: 'V2' });
    expect(u.version).toBe(2);
  });
  it('version increments again on second update', () => {
    const a = store.create('T', 'C', 'GUIDE', 'alice');
    const u1 = store.update(a.id, { title: 'V2' });
    const u2 = store.update(a.id, { title: 'V3' });
    expect(u1.version).toBe(2);
    expect(u2.version).toBe(3);
  });
  it('updatedAt changes after update', () => {
    const a = store.create('T', 'C', 'GUIDE', 'alice');
    const before = a.updatedAt.getTime();
    const u = store.update(a.id, { title: 'New' });
    expect(u.updatedAt.getTime()).toBeGreaterThanOrEqual(before);
  });
  it('does not change author on update', () => {
    const a = store.create('T', 'C', 'GUIDE', 'alice');
    const u = store.update(a.id, { title: 'New' });
    expect(u.author).toBe('alice');
  });
  it('does not change status on update', () => {
    const a = store.create('T', 'C', 'GUIDE', 'alice');
    const u = store.update(a.id, { title: 'New' });
    expect(u.status).toBe('DRAFT');
  });
  it('partial update leaves other fields unchanged', () => {
    const a = store.create('T', 'Original content', 'GUIDE', 'alice');
    const u = store.update(a.id, { title: 'New Title' });
    expect(u.content).toBe('Original content');
  });
  it('get returns updated article after update', () => {
    const a = store.create('T', 'C', 'GUIDE', 'alice');
    store.update(a.id, { title: 'Updated' });
    expect(store.get(a.id)?.title).toBe('Updated');
  });

  Array.from({ length: 10 }, (_, i) => i + 1).forEach((n) => {
    it(`version is ${n + 1} after ${n} updates`, () => {
      const a = store.create('T', 'C', 'GUIDE', 'alice');
      for (let k = 0; k < n; k++) store.update(a.id, { title: `V${k + 2}` });
      expect(store.get(a.id)?.version).toBe(n + 1);
    });
  });
});

// ---------------------------------------------------------------------------
// ArticleStore — publish
// ---------------------------------------------------------------------------

describe('ArticleStore.publish', () => {
  let store: ArticleStore;
  beforeEach(() => { store = makeStore(); });

  it('throws for unknown id', () => {
    expect(() => store.publish('no-such')).toThrow('Article not found: no-such');
  });
  it('sets status to PUBLISHED', () => {
    const a = store.create('T', 'C', 'GUIDE', 'alice');
    const p = store.publish(a.id);
    expect(p.status).toBe('PUBLISHED');
  });
  it('sets publishedAt to a Date', () => {
    const a = store.create('T', 'C', 'GUIDE', 'alice');
    const p = store.publish(a.id);
    expect(p.publishedAt).toBeInstanceOf(Date);
  });
  it('updates updatedAt', () => {
    const a = store.create('T', 'C', 'GUIDE', 'alice');
    const before = a.updatedAt.getTime();
    const p = store.publish(a.id);
    expect(p.updatedAt.getTime()).toBeGreaterThanOrEqual(before);
  });
  it('does not change version', () => {
    const a = store.create('T', 'C', 'GUIDE', 'alice');
    const p = store.publish(a.id);
    expect(p.version).toBe(1);
  });
  it('published article appears in getPublished', () => {
    const a = store.create('T', 'C', 'GUIDE', 'alice');
    store.publish(a.id);
    expect(store.getPublished().some(x => x.id === a.id)).toBe(true);
  });
  it('draft article does not appear in getPublished', () => {
    const a = store.create('T', 'C', 'GUIDE', 'alice');
    expect(store.getPublished().some(x => x.id === a.id)).toBe(false);
  });
  it('get returns published status after publish', () => {
    const a = store.create('T', 'C', 'GUIDE', 'alice');
    store.publish(a.id);
    expect(store.get(a.id)?.status).toBe('PUBLISHED');
  });

  Array.from({ length: 10 }, (_, i) => i).forEach((i) => {
    it(`publish article ${i} — status is PUBLISHED`, () => {
      const a = store.create(`T${i}`, 'C', 'GUIDE', 'alice');
      expect(store.publish(a.id).status).toBe('PUBLISHED');
    });
  });
});

// ---------------------------------------------------------------------------
// ArticleStore — archive
// ---------------------------------------------------------------------------

describe('ArticleStore.archive', () => {
  let store: ArticleStore;
  beforeEach(() => { store = makeStore(); });

  it('throws for unknown id', () => {
    expect(() => store.archive('no-such')).toThrow('Article not found: no-such');
  });
  it('sets status to ARCHIVED', () => {
    const a = store.create('T', 'C', 'GUIDE', 'alice');
    const ar = store.archive(a.id);
    expect(ar.status).toBe('ARCHIVED');
  });
  it('updates updatedAt', () => {
    const a = store.create('T', 'C', 'GUIDE', 'alice');
    const before = a.updatedAt.getTime();
    const ar = store.archive(a.id);
    expect(ar.updatedAt.getTime()).toBeGreaterThanOrEqual(before);
  });
  it('archived article is not in getPublished', () => {
    const a = store.create('T', 'C', 'GUIDE', 'alice');
    store.publish(a.id);
    store.archive(a.id);
    expect(store.getPublished().some(x => x.id === a.id)).toBe(false);
  });
  it('archived article appears in getByStatus ARCHIVED', () => {
    const a = store.create('T', 'C', 'GUIDE', 'alice');
    store.archive(a.id);
    expect(store.getByStatus('ARCHIVED').some(x => x.id === a.id)).toBe(true);
  });
  it('does not change version', () => {
    const a = store.create('T', 'C', 'GUIDE', 'alice');
    expect(store.archive(a.id).version).toBe(1);
  });

  Array.from({ length: 10 }, (_, i) => i).forEach((i) => {
    it(`archive article ${i} — status is ARCHIVED`, () => {
      const a = store.create(`T${i}`, 'C', 'GUIDE', 'alice');
      expect(store.archive(a.id).status).toBe('ARCHIVED');
    });
  });
});

// ---------------------------------------------------------------------------
// ArticleStore — submitForReview
// ---------------------------------------------------------------------------

describe('ArticleStore.submitForReview', () => {
  let store: ArticleStore;
  beforeEach(() => { store = makeStore(); });

  it('throws for unknown id', () => {
    expect(() => store.submitForReview('no-such')).toThrow('Article not found: no-such');
  });
  it('sets status to REVIEW', () => {
    const a = store.create('T', 'C', 'GUIDE', 'alice');
    const r = store.submitForReview(a.id);
    expect(r.status).toBe('REVIEW');
  });
  it('updates updatedAt', () => {
    const a = store.create('T', 'C', 'GUIDE', 'alice');
    const before = a.updatedAt.getTime();
    const r = store.submitForReview(a.id);
    expect(r.updatedAt.getTime()).toBeGreaterThanOrEqual(before);
  });
  it('review article appears in getByStatus REVIEW', () => {
    const a = store.create('T', 'C', 'GUIDE', 'alice');
    store.submitForReview(a.id);
    expect(store.getByStatus('REVIEW').some(x => x.id === a.id)).toBe(true);
  });
  it('does not appear in getByStatus DRAFT after submitForReview', () => {
    const a = store.create('T', 'C', 'GUIDE', 'alice');
    store.submitForReview(a.id);
    expect(store.getByStatus('DRAFT').some(x => x.id === a.id)).toBe(false);
  });
  it('does not change version', () => {
    const a = store.create('T', 'C', 'GUIDE', 'alice');
    expect(store.submitForReview(a.id).version).toBe(1);
  });

  Array.from({ length: 10 }, (_, i) => i).forEach((i) => {
    it(`submitForReview article ${i} — status is REVIEW`, () => {
      const a = store.create(`T${i}`, 'C', 'GUIDE', 'alice');
      expect(store.submitForReview(a.id).status).toBe('REVIEW');
    });
  });
});

// ---------------------------------------------------------------------------
// ArticleStore — full status lifecycle
// ---------------------------------------------------------------------------

describe('ArticleStore — status lifecycle transitions', () => {
  let store: ArticleStore;
  beforeEach(() => { store = makeStore(); });

  it('DRAFT → REVIEW → PUBLISHED', () => {
    const a = store.create('T', 'C', 'GUIDE', 'alice');
    store.submitForReview(a.id);
    store.publish(a.id);
    expect(store.get(a.id)?.status).toBe('PUBLISHED');
  });
  it('DRAFT → PUBLISHED → ARCHIVED', () => {
    const a = store.create('T', 'C', 'GUIDE', 'alice');
    store.publish(a.id);
    store.archive(a.id);
    expect(store.get(a.id)?.status).toBe('ARCHIVED');
  });
  it('DRAFT → REVIEW → ARCHIVED', () => {
    const a = store.create('T', 'C', 'GUIDE', 'alice');
    store.submitForReview(a.id);
    store.archive(a.id);
    expect(store.get(a.id)?.status).toBe('ARCHIVED');
  });
  it('publish twice gives PUBLISHED both times', () => {
    const a = store.create('T', 'C', 'GUIDE', 'alice');
    store.publish(a.id);
    const p2 = store.publish(a.id);
    expect(p2.status).toBe('PUBLISHED');
  });
  it('can go from ARCHIVED back to PUBLISHED', () => {
    const a = store.create('T', 'C', 'GUIDE', 'alice');
    store.archive(a.id);
    store.publish(a.id);
    expect(store.get(a.id)?.status).toBe('PUBLISHED');
  });
  it('submit for review twice stays REVIEW', () => {
    const a = store.create('T', 'C', 'GUIDE', 'alice');
    store.submitForReview(a.id);
    store.submitForReview(a.id);
    expect(store.get(a.id)?.status).toBe('REVIEW');
  });
});

// ---------------------------------------------------------------------------
// ArticleStore — recordView
// ---------------------------------------------------------------------------

describe('ArticleStore.recordView', () => {
  let store: ArticleStore;
  beforeEach(() => { store = makeStore(); });

  it('increments viewCount by 1', () => {
    const a = store.create('T', 'C', 'GUIDE', 'alice');
    store.recordView(a.id);
    expect(store.get(a.id)?.viewCount).toBe(1);
  });
  it('increments viewCount multiple times', () => {
    const a = store.create('T', 'C', 'GUIDE', 'alice');
    store.recordView(a.id);
    store.recordView(a.id);
    store.recordView(a.id);
    expect(store.get(a.id)?.viewCount).toBe(3);
  });
  it('does nothing for unknown id', () => {
    expect(() => store.recordView('unknown')).not.toThrow();
  });
  it('does not affect other articles', () => {
    const a1 = store.create('T1', 'C', 'GUIDE', 'alice');
    const a2 = store.create('T2', 'C', 'GUIDE', 'alice');
    store.recordView(a1.id);
    expect(store.get(a2.id)?.viewCount).toBe(0);
  });

  Array.from({ length: 20 }, (_, i) => i + 1).forEach((n) => {
    it(`viewCount is ${n} after ${n} recordView calls`, () => {
      const a = store.create('T', 'C', 'GUIDE', 'alice');
      for (let k = 0; k < n; k++) store.recordView(a.id);
      expect(store.get(a.id)?.viewCount).toBe(n);
    });
  });
});

// ---------------------------------------------------------------------------
// ArticleStore — recordFeedback
// ---------------------------------------------------------------------------

describe('ArticleStore.recordFeedback', () => {
  let store: ArticleStore;
  beforeEach(() => { store = makeStore(); });

  it('increments helpful when true', () => {
    const a = store.create('T', 'C', 'GUIDE', 'alice');
    store.recordFeedback(a.id, true);
    expect(store.get(a.id)?.helpful).toBe(1);
  });
  it('increments notHelpful when false', () => {
    const a = store.create('T', 'C', 'GUIDE', 'alice');
    store.recordFeedback(a.id, false);
    expect(store.get(a.id)?.notHelpful).toBe(1);
  });
  it('does not increment notHelpful when helpful', () => {
    const a = store.create('T', 'C', 'GUIDE', 'alice');
    store.recordFeedback(a.id, true);
    expect(store.get(a.id)?.notHelpful).toBe(0);
  });
  it('does not increment helpful when notHelpful', () => {
    const a = store.create('T', 'C', 'GUIDE', 'alice');
    store.recordFeedback(a.id, false);
    expect(store.get(a.id)?.helpful).toBe(0);
  });
  it('does nothing for unknown id', () => {
    expect(() => store.recordFeedback('unknown', true)).not.toThrow();
  });
  it('mixed feedback accumulates correctly', () => {
    const a = store.create('T', 'C', 'GUIDE', 'alice');
    store.recordFeedback(a.id, true);
    store.recordFeedback(a.id, true);
    store.recordFeedback(a.id, false);
    expect(store.get(a.id)?.helpful).toBe(2);
    expect(store.get(a.id)?.notHelpful).toBe(1);
  });

  Array.from({ length: 15 }, (_, i) => i + 1).forEach((n) => {
    it(`helpful is ${n} after ${n} positive feedbacks`, () => {
      const a = store.create('T', 'C', 'GUIDE', 'alice');
      for (let k = 0; k < n; k++) store.recordFeedback(a.id, true);
      expect(store.get(a.id)?.helpful).toBe(n);
    });
  });

  Array.from({ length: 15 }, (_, i) => i + 1).forEach((n) => {
    it(`notHelpful is ${n} after ${n} negative feedbacks`, () => {
      const a = store.create('T', 'C', 'GUIDE', 'alice');
      for (let k = 0; k < n; k++) store.recordFeedback(a.id, false);
      expect(store.get(a.id)?.notHelpful).toBe(n);
    });
  });
});

// ---------------------------------------------------------------------------
// ArticleStore — getByStatus
// ---------------------------------------------------------------------------

describe('ArticleStore.getByStatus', () => {
  let store: ArticleStore;
  beforeEach(() => { store = makeStore(); });

  it('returns empty array when none exist', () => {
    expect(store.getByStatus('DRAFT')).toEqual([]);
  });
  it('returns only DRAFT articles', () => {
    const a = store.create('T', 'C', 'GUIDE', 'alice');
    const result = store.getByStatus('DRAFT');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(a.id);
  });
  it('returns only PUBLISHED after publish', () => {
    const a = store.create('T', 'C', 'GUIDE', 'alice');
    store.publish(a.id);
    expect(store.getByStatus('PUBLISHED')).toHaveLength(1);
    expect(store.getByStatus('DRAFT')).toHaveLength(0);
  });
  it('returns only ARCHIVED after archive', () => {
    const a = store.create('T', 'C', 'GUIDE', 'alice');
    store.archive(a.id);
    expect(store.getByStatus('ARCHIVED')).toHaveLength(1);
  });
  it('returns only REVIEW after submitForReview', () => {
    const a = store.create('T', 'C', 'GUIDE', 'alice');
    store.submitForReview(a.id);
    expect(store.getByStatus('REVIEW')).toHaveLength(1);
  });
  it('filters correctly across multiple articles', () => {
    const a1 = store.create('T1', 'C', 'GUIDE', 'alice');
    const a2 = store.create('T2', 'C', 'GUIDE', 'alice');
    store.publish(a1.id);
    expect(store.getByStatus('PUBLISHED')).toHaveLength(1);
    expect(store.getByStatus('DRAFT')).toHaveLength(1);
    expect(store.getByStatus('DRAFT')[0].id).toBe(a2.id);
  });

  ALL_STATUSES.forEach((status) => {
    it(`getByStatus returns empty for ${status} on empty store`, () => {
      expect(store.getByStatus(status)).toEqual([]);
    });
  });

  Array.from({ length: 10 }, (_, i) => i + 1).forEach((n) => {
    it(`getByStatus DRAFT returns ${n} items when ${n} drafts exist`, () => {
      for (let k = 0; k < n; k++) store.create(`T${k}`, 'C', 'GUIDE', 'alice');
      expect(store.getByStatus('DRAFT')).toHaveLength(n);
    });
  });
});

// ---------------------------------------------------------------------------
// ArticleStore — getByCategory
// ---------------------------------------------------------------------------

describe('ArticleStore.getByCategory', () => {
  let store: ArticleStore;
  beforeEach(() => { store = makeStore(); });

  it('returns empty array when none match', () => {
    expect(store.getByCategory('GUIDE')).toEqual([]);
  });

  ALL_CATEGORIES.forEach((cat) => {
    it(`filters by category ${cat}`, () => {
      store.create('T', 'C', cat, 'alice');
      const result = store.getByCategory(cat);
      expect(result).toHaveLength(1);
      expect(result[0].category).toBe(cat);
    });
  });

  it('does not return articles of other categories', () => {
    store.create('T', 'C', 'GUIDE', 'alice');
    expect(store.getByCategory('POLICY')).toHaveLength(0);
  });
  it('returns multiple articles of same category', () => {
    store.create('T1', 'C', 'FAQ', 'alice');
    store.create('T2', 'C', 'FAQ', 'bob');
    expect(store.getByCategory('FAQ')).toHaveLength(2);
  });

  Array.from({ length: 8 }, (_, i) => i + 1).forEach((n) => {
    it(`getByCategory PROCEDURE returns ${n} items`, () => {
      for (let k = 0; k < n; k++) store.create(`T${k}`, 'C', 'PROCEDURE', 'alice');
      expect(store.getByCategory('PROCEDURE')).toHaveLength(n);
    });
  });
});

// ---------------------------------------------------------------------------
// ArticleStore — getByAuthor
// ---------------------------------------------------------------------------

describe('ArticleStore.getByAuthor', () => {
  let store: ArticleStore;
  beforeEach(() => { store = makeStore(); });

  it('returns empty array for unknown author', () => {
    expect(store.getByAuthor('nobody')).toEqual([]);
  });
  it('returns articles by the given author', () => {
    store.create('T', 'C', 'GUIDE', 'alice');
    expect(store.getByAuthor('alice')).toHaveLength(1);
  });
  it('does not return articles by other authors', () => {
    store.create('T', 'C', 'GUIDE', 'alice');
    expect(store.getByAuthor('bob')).toHaveLength(0);
  });
  it('returns all articles by the same author', () => {
    store.create('T1', 'C', 'GUIDE', 'alice');
    store.create('T2', 'C', 'POLICY', 'alice');
    expect(store.getByAuthor('alice')).toHaveLength(2);
  });
  it('separates articles by different authors', () => {
    store.create('T1', 'C', 'GUIDE', 'alice');
    store.create('T2', 'C', 'GUIDE', 'bob');
    expect(store.getByAuthor('alice')).toHaveLength(1);
    expect(store.getByAuthor('bob')).toHaveLength(1);
  });

  Array.from({ length: 10 }, (_, i) => i + 1).forEach((n) => {
    it(`getByAuthor returns ${n} items for author with ${n} articles`, () => {
      for (let k = 0; k < n; k++) store.create(`T${k}`, 'C', 'GUIDE', 'carol');
      expect(store.getByAuthor('carol')).toHaveLength(n);
    });
  });
});

// ---------------------------------------------------------------------------
// ArticleStore — getByTag
// ---------------------------------------------------------------------------

describe('ArticleStore.getByTag', () => {
  let store: ArticleStore;
  beforeEach(() => { store = makeStore(); });

  it('returns empty array for unknown tag', () => {
    expect(store.getByTag('unknown')).toEqual([]);
  });
  it('returns article with matching tag', () => {
    store.create('T', 'C', 'GUIDE', 'alice', ['safety']);
    expect(store.getByTag('safety')).toHaveLength(1);
  });
  it('does not return articles without the tag', () => {
    store.create('T', 'C', 'GUIDE', 'alice', ['other']);
    expect(store.getByTag('safety')).toHaveLength(0);
  });
  it('returns articles with multiple tags', () => {
    store.create('T1', 'C', 'GUIDE', 'alice', ['safety', 'ops']);
    store.create('T2', 'C', 'GUIDE', 'alice', ['ops']);
    expect(store.getByTag('safety')).toHaveLength(1);
    expect(store.getByTag('ops')).toHaveLength(2);
  });
  it('tag search is exact match', () => {
    store.create('T', 'C', 'GUIDE', 'alice', ['safety-procedures']);
    expect(store.getByTag('safety')).toHaveLength(0);
    expect(store.getByTag('safety-procedures')).toHaveLength(1);
  });

  Array.from({ length: 10 }, (_, i) => i + 1).forEach((n) => {
    it(`getByTag returns ${n} items when ${n} articles share the tag`, () => {
      for (let k = 0; k < n; k++) store.create(`T${k}`, 'C', 'GUIDE', 'alice', ['common-tag']);
      expect(store.getByTag('common-tag')).toHaveLength(n);
    });
  });
});

// ---------------------------------------------------------------------------
// ArticleStore — getPublished
// ---------------------------------------------------------------------------

describe('ArticleStore.getPublished', () => {
  let store: ArticleStore;
  beforeEach(() => { store = makeStore(); });

  it('returns empty array initially', () => {
    expect(store.getPublished()).toEqual([]);
  });
  it('returns published articles', () => {
    const a = store.create('T', 'C', 'GUIDE', 'alice');
    store.publish(a.id);
    expect(store.getPublished()).toHaveLength(1);
  });
  it('does not include drafts', () => {
    store.create('T', 'C', 'GUIDE', 'alice');
    expect(store.getPublished()).toHaveLength(0);
  });
  it('does not include archived', () => {
    const a = store.create('T', 'C', 'GUIDE', 'alice');
    store.archive(a.id);
    expect(store.getPublished()).toHaveLength(0);
  });
  it('all returned articles have status PUBLISHED', () => {
    for (let i = 0; i < 5; i++) {
      const a = store.create(`T${i}`, 'C', 'GUIDE', 'alice');
      store.publish(a.id);
    }
    store.getPublished().forEach(a => expect(a.status).toBe('PUBLISHED'));
  });

  Array.from({ length: 10 }, (_, i) => i + 1).forEach((n) => {
    it(`getPublished returns ${n} items after publishing ${n} articles`, () => {
      for (let k = 0; k < n; k++) {
        const a = store.create(`T${k}`, 'C', 'GUIDE', 'alice');
        store.publish(a.id);
      }
      expect(store.getPublished()).toHaveLength(n);
    });
  });
});

// ---------------------------------------------------------------------------
// ArticleStore — search
// ---------------------------------------------------------------------------

describe('ArticleStore.search', () => {
  let store: ArticleStore;
  beforeEach(() => { store = makeStore(); });

  it('returns empty array when no articles exist', () => {
    expect(store.search('anything')).toEqual([]);
  });
  it('returns empty array when no match', () => {
    store.create('Hello World', 'Some content', 'GUIDE', 'alice');
    expect(store.search('nonexistent')).toEqual([]);
  });
  it('matches by title', () => {
    store.create('Safety Procedures', 'Content', 'GUIDE', 'alice');
    expect(store.search('safety')).toHaveLength(1);
  });
  it('title search is case-insensitive', () => {
    store.create('Safety Procedures', 'Content', 'GUIDE', 'alice');
    expect(store.search('SAFETY')).toHaveLength(1);
  });
  it('matches by content', () => {
    store.create('Title', 'Contains the word hazard in it', 'GUIDE', 'alice');
    expect(store.search('hazard')).toHaveLength(1);
  });
  it('content search is case-insensitive', () => {
    store.create('Title', 'Contains HAZARD in it', 'GUIDE', 'alice');
    expect(store.search('hazard')).toHaveLength(1);
  });
  it('matches by tag', () => {
    store.create('Title', 'Content', 'GUIDE', 'alice', ['environment']);
    expect(store.search('environment')).toHaveLength(1);
  });
  it('tag search is case-insensitive', () => {
    store.create('Title', 'Content', 'GUIDE', 'alice', ['Environment']);
    expect(store.search('environment')).toHaveLength(1);
  });
  it('returns multiple matches', () => {
    store.create('Safety Guide', 'Content', 'GUIDE', 'alice');
    store.create('Safety Policy', 'Content', 'POLICY', 'bob');
    expect(store.search('safety')).toHaveLength(2);
  });
  it('partial match in title works', () => {
    store.create('Environmental Assessment', 'Content', 'GUIDE', 'alice');
    expect(store.search('environ')).toHaveLength(1);
  });
  it('partial match in content works', () => {
    store.create('Title', 'This is about environmental sustainability', 'GUIDE', 'alice');
    expect(store.search('sustain')).toHaveLength(1);
  });
  it('does not match author name', () => {
    store.create('Title', 'Content', 'GUIDE', 'alice-unique-author');
    expect(store.search('alice-unique-author')).toHaveLength(0);
  });
  it('empty query matches all articles', () => {
    store.create('T1', 'C', 'GUIDE', 'alice');
    store.create('T2', 'C', 'POLICY', 'bob');
    expect(store.search('')).toHaveLength(2);
  });

  Array.from({ length: 10 }, (_, i) => i + 1).forEach((n) => {
    it(`search returns ${n} results when ${n} articles match`, () => {
      for (let k = 0; k < n; k++) {
        store.create(`Searchable Article ${k}`, 'Content', 'GUIDE', 'alice');
      }
      store.create('Irrelevant', 'Irrelevant content', 'POLICY', 'bob');
      expect(store.search('searchable')).toHaveLength(n);
    });
  });
});

// ---------------------------------------------------------------------------
// ArticleStore — getTopViewed
// ---------------------------------------------------------------------------

describe('ArticleStore.getTopViewed', () => {
  let store: ArticleStore;
  beforeEach(() => { store = makeStore(); });

  it('returns empty array when no articles', () => {
    expect(store.getTopViewed()).toEqual([]);
  });
  it('returns articles sorted by viewCount descending', () => {
    const a1 = store.create('T1', 'C', 'GUIDE', 'alice');
    const a2 = store.create('T2', 'C', 'GUIDE', 'alice');
    store.recordView(a2.id);
    store.recordView(a2.id);
    store.recordView(a1.id);
    const top = store.getTopViewed();
    expect(top[0].id).toBe(a2.id);
    expect(top[1].id).toBe(a1.id);
  });
  it('default limit is 10', () => {
    for (let i = 0; i < 15; i++) store.create(`T${i}`, 'C', 'GUIDE', 'alice');
    expect(store.getTopViewed()).toHaveLength(10);
  });
  it('respects custom limit', () => {
    for (let i = 0; i < 15; i++) store.create(`T${i}`, 'C', 'GUIDE', 'alice');
    expect(store.getTopViewed(5)).toHaveLength(5);
  });
  it('returns all if fewer than limit', () => {
    store.create('T1', 'C', 'GUIDE', 'alice');
    store.create('T2', 'C', 'GUIDE', 'alice');
    expect(store.getTopViewed(10)).toHaveLength(2);
  });
  it('first element has highest viewCount', () => {
    const articles = [];
    for (let i = 0; i < 5; i++) articles.push(store.create(`T${i}`, 'C', 'GUIDE', 'alice'));
    for (let j = 0; j < 10; j++) store.recordView(articles[3].id);
    expect(store.getTopViewed(1)[0].id).toBe(articles[3].id);
  });
  it('limit 1 returns exactly 1 article', () => {
    store.create('T1', 'C', 'GUIDE', 'alice');
    store.create('T2', 'C', 'GUIDE', 'alice');
    expect(store.getTopViewed(1)).toHaveLength(1);
  });

  Array.from({ length: 10 }, (_, i) => i + 1).forEach((limit) => {
    it(`getTopViewed(${limit}) returns at most ${limit} items`, () => {
      for (let k = 0; k < 15; k++) store.create(`T${k}`, 'C', 'GUIDE', 'alice');
      expect(store.getTopViewed(limit).length).toBeLessThanOrEqual(limit);
    });
  });
});

// ---------------------------------------------------------------------------
// ArticleStore — error handling
// ---------------------------------------------------------------------------

describe('ArticleStore — error cases', () => {
  let store: ArticleStore;
  beforeEach(() => { store = makeStore(); });

  it('update throws with correct message for missing id', () => {
    expect(() => store.update('missing', { title: 'X' })).toThrow('Article not found: missing');
  });
  it('publish throws with correct message for missing id', () => {
    expect(() => store.publish('missing')).toThrow('Article not found: missing');
  });
  it('archive throws with correct message for missing id', () => {
    expect(() => store.archive('missing')).toThrow('Article not found: missing');
  });
  it('submitForReview throws with correct message for missing id', () => {
    expect(() => store.submitForReview('missing')).toThrow('Article not found: missing');
  });
  it('recordView on unknown id does not throw', () => {
    expect(() => store.recordView('unknown')).not.toThrow();
  });
  it('recordFeedback on unknown id does not throw', () => {
    expect(() => store.recordFeedback('unknown', true)).not.toThrow();
    expect(() => store.recordFeedback('unknown', false)).not.toThrow();
  });

  const badIds = ['', 'kb-99999', 'null', 'undefined', '   ', 'NONEXISTENT-ID'];
  badIds.forEach((badId) => {
    it(`update throws for id "${badId}"`, () => {
      expect(() => store.update(badId, { title: 'X' })).toThrow();
    });
  });

  badIds.forEach((badId) => {
    it(`publish throws for id "${badId}"`, () => {
      expect(() => store.publish(badId)).toThrow();
    });
  });

  badIds.forEach((badId) => {
    it(`archive throws for id "${badId}"`, () => {
      expect(() => store.archive(badId)).toThrow();
    });
  });

  badIds.forEach((badId) => {
    it(`submitForReview throws for id "${badId}"`, () => {
      expect(() => store.submitForReview(badId)).toThrow();
    });
  });
});

// ---------------------------------------------------------------------------
// ArticleStore — immutability / independence
// ---------------------------------------------------------------------------

describe('ArticleStore — article isolation', () => {
  let store: ArticleStore;
  beforeEach(() => { store = makeStore(); });

  it('creating two articles gives two distinct stored objects', () => {
    const a1 = store.create('T1', 'C', 'GUIDE', 'alice');
    const a2 = store.create('T2', 'C', 'GUIDE', 'alice');
    expect(store.get(a1.id)?.title).toBe('T1');
    expect(store.get(a2.id)?.title).toBe('T2');
  });
  it('two stores are independent', () => {
    const store2 = makeStore();
    const a = store.create('T', 'C', 'GUIDE', 'alice');
    expect(store2.get(a.id)).toBeUndefined();
  });
  it('getAll does not affect internal state', () => {
    store.create('T', 'C', 'GUIDE', 'alice');
    const all = store.getAll();
    all.length = 0;
    expect(store.getCount()).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// CategoryManager — basic creation
// ---------------------------------------------------------------------------

describe('CategoryManager.create — basic properties', () => {
  let catMgr: CategoryManager;
  beforeEach(() => { catMgr = makeCatMgr(); });

  it('returns an object', () => {
    const c = catMgr.create('Safety', 'Safety articles');
    expect(c).toBeDefined();
  });
  it('id starts with cat-', () => {
    const c = catMgr.create('Safety', 'Safety articles');
    expect(c.id).toMatch(/^cat-/);
  });
  it('stores the name', () => {
    const c = catMgr.create('Procedures', 'All procedures');
    expect(c.name).toBe('Procedures');
  });
  it('stores the description', () => {
    const c = catMgr.create('Safety', 'Safety related articles');
    expect(c.description).toBe('Safety related articles');
  });
  it('articleCount starts at 0', () => {
    const c = catMgr.create('Safety', 'Desc');
    expect(c.articleCount).toBe(0);
  });
  it('parentId is undefined when not provided', () => {
    const c = catMgr.create('Safety', 'Desc');
    expect(c.parentId).toBeUndefined();
  });
  it('stores parentId when provided', () => {
    const parent = catMgr.create('Parent', 'Parent desc');
    const child = catMgr.create('Child', 'Child desc', parent.id);
    expect(child.parentId).toBe(parent.id);
  });
  it('each category gets a unique id', () => {
    const c1 = catMgr.create('Cat1', 'Desc');
    const c2 = catMgr.create('Cat2', 'Desc');
    expect(c1.id).not.toBe(c2.id);
  });
});

// ---------------------------------------------------------------------------
// CategoryManager — getCount
// ---------------------------------------------------------------------------

describe('CategoryManager.getCount', () => {
  let catMgr: CategoryManager;
  beforeEach(() => { catMgr = makeCatMgr(); });

  it('starts at 0', () => {
    expect(catMgr.getCount()).toBe(0);
  });
  it('is 1 after one create', () => {
    catMgr.create('Cat', 'Desc');
    expect(catMgr.getCount()).toBe(1);
  });

  Array.from({ length: 20 }, (_, i) => i + 1).forEach((n) => {
    it(`count is ${n} after creating ${n} categories`, () => {
      for (let k = 0; k < n; k++) catMgr.create(`Cat${k}`, 'Desc');
      expect(catMgr.getCount()).toBe(n);
    });
  });
});

// ---------------------------------------------------------------------------
// CategoryManager — get
// ---------------------------------------------------------------------------

describe('CategoryManager.get', () => {
  let catMgr: CategoryManager;
  beforeEach(() => { catMgr = makeCatMgr(); });

  it('returns undefined for unknown id', () => {
    expect(catMgr.get('unknown')).toBeUndefined();
  });
  it('returns the category for a known id', () => {
    const c = catMgr.create('Safety', 'Desc');
    expect(catMgr.get(c.id)).toEqual(c);
  });
  it('returns the correct category when multiple exist', () => {
    const c1 = catMgr.create('Cat1', 'Desc1');
    const c2 = catMgr.create('Cat2', 'Desc2');
    expect(catMgr.get(c1.id)?.name).toBe('Cat1');
    expect(catMgr.get(c2.id)?.name).toBe('Cat2');
  });
});

// ---------------------------------------------------------------------------
// CategoryManager — getAll
// ---------------------------------------------------------------------------

describe('CategoryManager.getAll', () => {
  let catMgr: CategoryManager;
  beforeEach(() => { catMgr = makeCatMgr(); });

  it('returns empty array initially', () => {
    expect(catMgr.getAll()).toEqual([]);
  });
  it('returns all categories', () => {
    catMgr.create('C1', 'D1');
    catMgr.create('C2', 'D2');
    expect(catMgr.getAll()).toHaveLength(2);
  });

  Array.from({ length: 15 }, (_, i) => i + 1).forEach((n) => {
    it(`getAll returns ${n} items after ${n} creates`, () => {
      for (let k = 0; k < n; k++) catMgr.create(`Cat${k}`, 'D');
      expect(catMgr.getAll()).toHaveLength(n);
    });
  });
});

// ---------------------------------------------------------------------------
// CategoryManager — incrementCount / decrementCount
// ---------------------------------------------------------------------------

describe('CategoryManager.incrementCount / decrementCount', () => {
  let catMgr: CategoryManager;
  beforeEach(() => { catMgr = makeCatMgr(); });

  it('incrementCount increases articleCount by 1', () => {
    const c = catMgr.create('Cat', 'Desc');
    catMgr.incrementCount(c.id);
    expect(catMgr.get(c.id)?.articleCount).toBe(1);
  });
  it('incrementCount multiple times accumulates', () => {
    const c = catMgr.create('Cat', 'Desc');
    catMgr.incrementCount(c.id);
    catMgr.incrementCount(c.id);
    catMgr.incrementCount(c.id);
    expect(catMgr.get(c.id)?.articleCount).toBe(3);
  });
  it('decrementCount decreases articleCount by 1', () => {
    const c = catMgr.create('Cat', 'Desc');
    catMgr.incrementCount(c.id);
    catMgr.decrementCount(c.id);
    expect(catMgr.get(c.id)?.articleCount).toBe(0);
  });
  it('decrementCount does not go below 0', () => {
    const c = catMgr.create('Cat', 'Desc');
    catMgr.decrementCount(c.id);
    expect(catMgr.get(c.id)?.articleCount).toBe(0);
  });
  it('incrementCount on unknown id does not throw', () => {
    expect(() => catMgr.incrementCount('unknown')).not.toThrow();
  });
  it('decrementCount on unknown id does not throw', () => {
    expect(() => catMgr.decrementCount('unknown')).not.toThrow();
  });
  it('incrementCount does not affect other categories', () => {
    const c1 = catMgr.create('Cat1', 'D');
    const c2 = catMgr.create('Cat2', 'D');
    catMgr.incrementCount(c1.id);
    expect(catMgr.get(c2.id)?.articleCount).toBe(0);
  });
  it('net zero increment then decrement stays at 0', () => {
    const c = catMgr.create('Cat', 'D');
    catMgr.incrementCount(c.id);
    catMgr.incrementCount(c.id);
    catMgr.decrementCount(c.id);
    catMgr.decrementCount(c.id);
    expect(catMgr.get(c.id)?.articleCount).toBe(0);
  });

  Array.from({ length: 15 }, (_, i) => i + 1).forEach((n) => {
    it(`articleCount is ${n} after ${n} increments`, () => {
      const c = catMgr.create('Cat', 'D');
      for (let k = 0; k < n; k++) catMgr.incrementCount(c.id);
      expect(catMgr.get(c.id)?.articleCount).toBe(n);
    });
  });

  Array.from({ length: 10 }, (_, i) => i + 1).forEach((n) => {
    it(`articleCount is ${n} after ${n + 5} increments and 5 decrements`, () => {
      const c = catMgr.create('Cat', 'D');
      for (let k = 0; k < n + 5; k++) catMgr.incrementCount(c.id);
      for (let k = 0; k < 5; k++) catMgr.decrementCount(c.id);
      expect(catMgr.get(c.id)?.articleCount).toBe(n);
    });
  });
});

// ---------------------------------------------------------------------------
// CategoryManager — getChildren
// ---------------------------------------------------------------------------

describe('CategoryManager.getChildren', () => {
  let catMgr: CategoryManager;
  beforeEach(() => { catMgr = makeCatMgr(); });

  it('returns empty array for unknown parent', () => {
    expect(catMgr.getChildren('unknown')).toEqual([]);
  });
  it('returns empty array for parent with no children', () => {
    const parent = catMgr.create('Parent', 'D');
    expect(catMgr.getChildren(parent.id)).toEqual([]);
  });
  it('returns children of a parent', () => {
    const parent = catMgr.create('Parent', 'D');
    const child = catMgr.create('Child', 'D', parent.id);
    const result = catMgr.getChildren(parent.id);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(child.id);
  });
  it('returns multiple children', () => {
    const parent = catMgr.create('Parent', 'D');
    catMgr.create('Child1', 'D', parent.id);
    catMgr.create('Child2', 'D', parent.id);
    expect(catMgr.getChildren(parent.id)).toHaveLength(2);
  });
  it('does not return grandchildren', () => {
    const parent = catMgr.create('Parent', 'D');
    const child = catMgr.create('Child', 'D', parent.id);
    catMgr.create('Grandchild', 'D', child.id);
    expect(catMgr.getChildren(parent.id)).toHaveLength(1);
  });
  it('separates children of different parents', () => {
    const p1 = catMgr.create('P1', 'D');
    const p2 = catMgr.create('P2', 'D');
    catMgr.create('C1', 'D', p1.id);
    catMgr.create('C2', 'D', p2.id);
    expect(catMgr.getChildren(p1.id)).toHaveLength(1);
    expect(catMgr.getChildren(p2.id)).toHaveLength(1);
  });

  Array.from({ length: 10 }, (_, i) => i + 1).forEach((n) => {
    it(`getChildren returns ${n} children when parent has ${n} children`, () => {
      const parent = catMgr.create('Parent', 'D');
      for (let k = 0; k < n; k++) catMgr.create(`Child${k}`, 'D', parent.id);
      expect(catMgr.getChildren(parent.id)).toHaveLength(n);
    });
  });
});

// ---------------------------------------------------------------------------
// CategoryManager — getRoots
// ---------------------------------------------------------------------------

describe('CategoryManager.getRoots', () => {
  let catMgr: CategoryManager;
  beforeEach(() => { catMgr = makeCatMgr(); });

  it('returns empty array initially', () => {
    expect(catMgr.getRoots()).toEqual([]);
  });
  it('root category has no parentId', () => {
    const c = catMgr.create('Root', 'D');
    const roots = catMgr.getRoots();
    expect(roots).toHaveLength(1);
    expect(roots[0].id).toBe(c.id);
  });
  it('child category is not in roots', () => {
    const parent = catMgr.create('Parent', 'D');
    catMgr.create('Child', 'D', parent.id);
    expect(catMgr.getRoots()).toHaveLength(1);
    expect(catMgr.getRoots()[0].id).toBe(parent.id);
  });
  it('returns multiple root categories', () => {
    catMgr.create('R1', 'D');
    catMgr.create('R2', 'D');
    expect(catMgr.getRoots()).toHaveLength(2);
  });
  it('all returned categories have no parentId', () => {
    catMgr.create('R1', 'D');
    catMgr.create('R2', 'D');
    const parent = catMgr.create('R3', 'D');
    catMgr.create('Child', 'D', parent.id);
    catMgr.getRoots().forEach(c => expect(c.parentId).toBeUndefined());
  });

  Array.from({ length: 10 }, (_, i) => i + 1).forEach((n) => {
    it(`getRoots returns ${n} roots when ${n} root categories exist`, () => {
      for (let k = 0; k < n; k++) catMgr.create(`Root${k}`, 'D');
      expect(catMgr.getRoots()).toHaveLength(n);
    });
  });
});

// ---------------------------------------------------------------------------
// CategoryManager — getByName
// ---------------------------------------------------------------------------

describe('CategoryManager.getByName', () => {
  let catMgr: CategoryManager;
  beforeEach(() => { catMgr = makeCatMgr(); });

  it('returns undefined when not found', () => {
    expect(catMgr.getByName('Nonexistent')).toBeUndefined();
  });
  it('returns the category by name', () => {
    catMgr.create('Safety', 'Safety articles');
    const result = catMgr.getByName('Safety');
    expect(result).toBeDefined();
    expect(result?.name).toBe('Safety');
  });
  it('returns the first match when names are duplicated', () => {
    catMgr.create('Safety', 'Desc1');
    catMgr.create('Safety', 'Desc2');
    const result = catMgr.getByName('Safety');
    expect(result).toBeDefined();
  });
  it('name search is exact', () => {
    catMgr.create('Safety Procedures', 'D');
    expect(catMgr.getByName('Safety')).toBeUndefined();
    expect(catMgr.getByName('Safety Procedures')).toBeDefined();
  });

  const names = ['Procedures', 'Policies', 'Guides', 'FAQs', 'References', 'Templates', 'Safety', 'Quality', 'Environment', 'HR'];
  names.forEach((name) => {
    it(`getByName finds category named "${name}"`, () => {
      catMgr.create(name, 'Desc');
      expect(catMgr.getByName(name)?.name).toBe(name);
    });
  });
});

// ---------------------------------------------------------------------------
// CategoryManager — delete
// ---------------------------------------------------------------------------

describe('CategoryManager.delete', () => {
  let catMgr: CategoryManager;
  beforeEach(() => { catMgr = makeCatMgr(); });

  it('returns false for unknown id', () => {
    expect(catMgr.delete('unknown')).toBe(false);
  });
  it('returns true for existing id', () => {
    const c = catMgr.create('Cat', 'D');
    expect(catMgr.delete(c.id)).toBe(true);
  });
  it('removes the category from store', () => {
    const c = catMgr.create('Cat', 'D');
    catMgr.delete(c.id);
    expect(catMgr.get(c.id)).toBeUndefined();
  });
  it('decrements count after delete', () => {
    const c = catMgr.create('Cat', 'D');
    expect(catMgr.getCount()).toBe(1);
    catMgr.delete(c.id);
    expect(catMgr.getCount()).toBe(0);
  });
  it('second delete returns false', () => {
    const c = catMgr.create('Cat', 'D');
    catMgr.delete(c.id);
    expect(catMgr.delete(c.id)).toBe(false);
  });
  it('delete does not affect other categories', () => {
    const c1 = catMgr.create('Cat1', 'D');
    const c2 = catMgr.create('Cat2', 'D');
    catMgr.delete(c1.id);
    expect(catMgr.get(c2.id)).toBeDefined();
    expect(catMgr.getCount()).toBe(1);
  });
  it('getAll does not contain deleted category', () => {
    const c = catMgr.create('Cat', 'D');
    catMgr.delete(c.id);
    expect(catMgr.getAll().some(x => x.id === c.id)).toBe(false);
  });
  it('getRoots does not contain deleted root', () => {
    const c = catMgr.create('Root', 'D');
    catMgr.delete(c.id);
    expect(catMgr.getRoots().some(x => x.id === c.id)).toBe(false);
  });

  Array.from({ length: 10 }, (_, i) => i + 1).forEach((n) => {
    it(`delete ${n} categories reduces count to 0`, () => {
      const ids: string[] = [];
      for (let k = 0; k < n; k++) ids.push(catMgr.create(`Cat${k}`, 'D').id);
      ids.forEach(id => catMgr.delete(id));
      expect(catMgr.getCount()).toBe(0);
    });
  });
});

// ---------------------------------------------------------------------------
// CategoryManager — hierarchy scenarios
// ---------------------------------------------------------------------------

describe('CategoryManager — hierarchy scenarios', () => {
  let catMgr: CategoryManager;
  beforeEach(() => { catMgr = makeCatMgr(); });

  it('3-level hierarchy: grandchild has correct parentId', () => {
    const root = catMgr.create('Root', 'R');
    const child = catMgr.create('Child', 'C', root.id);
    const grandchild = catMgr.create('Grandchild', 'G', child.id);
    expect(grandchild.parentId).toBe(child.id);
  });
  it('root has no parent', () => {
    const root = catMgr.create('Root', 'R');
    expect(root.parentId).toBeUndefined();
  });
  it('getChildren of root returns only direct children', () => {
    const root = catMgr.create('Root', 'R');
    const child = catMgr.create('Child', 'C', root.id);
    catMgr.create('Grandchild', 'G', child.id);
    expect(catMgr.getChildren(root.id)).toHaveLength(1);
  });
  it('deleting child keeps grandchild in store', () => {
    const root = catMgr.create('Root', 'R');
    const child = catMgr.create('Child', 'C', root.id);
    const grandchild = catMgr.create('Grandchild', 'G', child.id);
    catMgr.delete(child.id);
    expect(catMgr.get(grandchild.id)).toBeDefined();
  });
  it('sibling categories have same parentId', () => {
    const root = catMgr.create('Root', 'R');
    const s1 = catMgr.create('Sib1', 'S', root.id);
    const s2 = catMgr.create('Sib2', 'S', root.id);
    expect(s1.parentId).toBe(root.id);
    expect(s2.parentId).toBe(root.id);
  });

  Array.from({ length: 5 }, (_, depth) => depth + 2).forEach((depth) => {
    it(`can build a ${depth}-level hierarchy`, () => {
      let currentId: string | undefined = undefined;
      const ids: string[] = [];
      for (let d = 0; d < depth; d++) {
        const c = catMgr.create(`Level${d}`, 'D', currentId);
        ids.push(c.id);
        currentId = c.id;
      }
      expect(catMgr.getCount()).toBe(depth);
      expect(catMgr.get(ids[ids.length - 1])?.parentId).toBe(ids[ids.length - 2]);
    });
  });
});

// ---------------------------------------------------------------------------
// Integration: ArticleStore + CategoryManager
// ---------------------------------------------------------------------------

describe('Integration — ArticleStore + CategoryManager', () => {
  let store: ArticleStore;
  let catMgr: CategoryManager;
  beforeEach(() => {
    store = makeStore();
    catMgr = makeCatMgr();
  });

  it('can create category then article in that category', () => {
    catMgr.create('Guides', 'All guide articles');
    const a = store.create('My Guide', 'Content', 'GUIDE', 'alice');
    expect(a.category).toBe('GUIDE');
    expect(catMgr.getByName('Guides')).toBeDefined();
  });
  it('incrementCount after creating article', () => {
    const cat = catMgr.create('Guides', 'D');
    store.create('A', 'C', 'GUIDE', 'alice');
    catMgr.incrementCount(cat.id);
    expect(catMgr.get(cat.id)?.articleCount).toBe(1);
  });
  it('decrementCount after archiving article', () => {
    const cat = catMgr.create('Guides', 'D');
    const a = store.create('A', 'C', 'GUIDE', 'alice');
    catMgr.incrementCount(cat.id);
    store.archive(a.id);
    catMgr.decrementCount(cat.id);
    expect(catMgr.get(cat.id)?.articleCount).toBe(0);
  });
  it('published articles can be searched by content', () => {
    const a = store.create('Safety Guide', 'Always wear PPE', 'GUIDE', 'alice');
    store.publish(a.id);
    const results = store.search('PPE');
    expect(results).toHaveLength(1);
    expect(results[0].status).toBe('PUBLISHED');
  });
  it('getTopViewed works across different categories', () => {
    const a1 = store.create('T1', 'C', 'GUIDE', 'alice');
    const a2 = store.create('T2', 'C', 'POLICY', 'bob');
    store.recordView(a2.id);
    store.recordView(a2.id);
    store.recordView(a1.id);
    const top = store.getTopViewed(2);
    expect(top[0].id).toBe(a2.id);
    expect(top[1].id).toBe(a1.id);
  });
  it('search finds articles across multiple categories', () => {
    store.create('Safety Guide', 'Content', 'GUIDE', 'alice');
    store.create('Safety Policy', 'Content', 'POLICY', 'bob');
    store.create('Safety FAQ', 'Content', 'FAQ', 'carol');
    expect(store.search('safety')).toHaveLength(3);
  });
  it('getByTag and getByCategory can both be used', () => {
    store.create('T1', 'C', 'GUIDE', 'alice', ['iso', 'safety']);
    store.create('T2', 'C', 'GUIDE', 'alice', ['iso']);
    store.create('T3', 'C', 'POLICY', 'alice', ['safety']);
    expect(store.getByTag('iso')).toHaveLength(2);
    expect(store.getByCategory('GUIDE')).toHaveLength(2);
    expect(store.getByTag('safety')).toHaveLength(2);
  });
  it('version tracking across lifecycle', () => {
    const a = store.create('T', 'C', 'GUIDE', 'alice');
    expect(a.version).toBe(1);
    store.update(a.id, { title: 'Updated' });
    expect(store.get(a.id)?.version).toBe(2);
    store.publish(a.id);
    expect(store.get(a.id)?.version).toBe(2); // publish does not change version
    store.update(a.id, { content: 'New content' });
    expect(store.get(a.id)?.version).toBe(3);
  });

  Array.from({ length: 10 }, (_, i) => i + 1).forEach((n) => {
    it(`integration: ${n} articles each with a category increment`, () => {
      const cat = catMgr.create('TestCat', 'D');
      for (let k = 0; k < n; k++) {
        store.create(`Article${k}`, 'C', 'GUIDE', 'alice');
        catMgr.incrementCount(cat.id);
      }
      expect(catMgr.get(cat.id)?.articleCount).toBe(n);
      expect(store.getCount()).toBe(n);
    });
  });
});

// ---------------------------------------------------------------------------
// Type coverage: ArticleStatus values
// ---------------------------------------------------------------------------

describe('ArticleStatus type values', () => {
  let store: ArticleStore;
  beforeEach(() => { store = makeStore(); });

  it('DRAFT is a valid initial status', () => {
    const a = store.create('T', 'C', 'GUIDE', 'alice');
    const status: ArticleStatus = a.status;
    expect(status).toBe('DRAFT');
  });
  it('REVIEW is reachable via submitForReview', () => {
    const a = store.create('T', 'C', 'GUIDE', 'alice');
    const r = store.submitForReview(a.id);
    const status: ArticleStatus = r.status;
    expect(status).toBe('REVIEW');
  });
  it('PUBLISHED is reachable via publish', () => {
    const a = store.create('T', 'C', 'GUIDE', 'alice');
    const p = store.publish(a.id);
    const status: ArticleStatus = p.status;
    expect(status).toBe('PUBLISHED');
  });
  it('ARCHIVED is reachable via archive', () => {
    const a = store.create('T', 'C', 'GUIDE', 'alice');
    const ar = store.archive(a.id);
    const status: ArticleStatus = ar.status;
    expect(status).toBe('ARCHIVED');
  });
  it('ALL_STATUSES array contains all 5 values', () => {
    expect(ALL_STATUSES).toHaveLength(5);
    expect(ALL_STATUSES).toContain('DRAFT');
    expect(ALL_STATUSES).toContain('REVIEW');
    expect(ALL_STATUSES).toContain('PUBLISHED');
    expect(ALL_STATUSES).toContain('ARCHIVED');
    expect(ALL_STATUSES).toContain('DEPRECATED');
  });
});

// ---------------------------------------------------------------------------
// Type coverage: ArticleCategory values
// ---------------------------------------------------------------------------

describe('ArticleCategory type values', () => {
  let store: ArticleStore;
  beforeEach(() => { store = makeStore(); });

  ALL_CATEGORIES.forEach((cat) => {
    it(`can create article with category ${cat}`, () => {
      const a = store.create('T', 'C', cat, 'alice');
      const category: ArticleCategory = a.category;
      expect(category).toBe(cat);
    });
  });

  it('ALL_CATEGORIES contains 6 values', () => {
    expect(ALL_CATEGORIES).toHaveLength(6);
    expect(ALL_CATEGORIES).toContain('PROCEDURE');
    expect(ALL_CATEGORIES).toContain('POLICY');
    expect(ALL_CATEGORIES).toContain('GUIDE');
    expect(ALL_CATEGORIES).toContain('FAQ');
    expect(ALL_CATEGORIES).toContain('REFERENCE');
    expect(ALL_CATEGORIES).toContain('TEMPLATE');
  });
});

// ---------------------------------------------------------------------------
// Type coverage: ContentType values
// ---------------------------------------------------------------------------

describe('ContentType type values', () => {
  let store: ArticleStore;
  beforeEach(() => { store = makeStore(); });

  ALL_CONTENT_TYPES.forEach((ct) => {
    it(`can create article with contentType ${ct}`, () => {
      const a = store.create('T', 'C', 'GUIDE', 'alice', [], ct);
      const contentType: ContentType = a.contentType;
      expect(contentType).toBe(ct);
    });
  });

  it('ALL_CONTENT_TYPES contains 3 values', () => {
    expect(ALL_CONTENT_TYPES).toHaveLength(3);
    expect(ALL_CONTENT_TYPES).toContain('TEXT');
    expect(ALL_CONTENT_TYPES).toContain('MARKDOWN');
    expect(ALL_CONTENT_TYPES).toContain('HTML');
  });
});

// ---------------------------------------------------------------------------
// KBArticle interface shape verification
// ---------------------------------------------------------------------------

describe('KBArticle interface shape', () => {
  let store: ArticleStore;
  beforeEach(() => { store = makeStore(); });

  it('article has id field', () => {
    const a = store.create('T', 'C', 'GUIDE', 'alice');
    expect(a).toHaveProperty('id');
  });
  it('article has title field', () => {
    const a = store.create('T', 'C', 'GUIDE', 'alice');
    expect(a).toHaveProperty('title');
  });
  it('article has content field', () => {
    const a = store.create('T', 'C', 'GUIDE', 'alice');
    expect(a).toHaveProperty('content');
  });
  it('article has contentType field', () => {
    const a = store.create('T', 'C', 'GUIDE', 'alice');
    expect(a).toHaveProperty('contentType');
  });
  it('article has category field', () => {
    const a = store.create('T', 'C', 'GUIDE', 'alice');
    expect(a).toHaveProperty('category');
  });
  it('article has status field', () => {
    const a = store.create('T', 'C', 'GUIDE', 'alice');
    expect(a).toHaveProperty('status');
  });
  it('article has tags field', () => {
    const a = store.create('T', 'C', 'GUIDE', 'alice');
    expect(a).toHaveProperty('tags');
  });
  it('article has author field', () => {
    const a = store.create('T', 'C', 'GUIDE', 'alice');
    expect(a).toHaveProperty('author');
  });
  it('article has version field', () => {
    const a = store.create('T', 'C', 'GUIDE', 'alice');
    expect(a).toHaveProperty('version');
  });
  it('article has createdAt field', () => {
    const a = store.create('T', 'C', 'GUIDE', 'alice');
    expect(a).toHaveProperty('createdAt');
  });
  it('article has updatedAt field', () => {
    const a = store.create('T', 'C', 'GUIDE', 'alice');
    expect(a).toHaveProperty('updatedAt');
  });
  it('article has viewCount field', () => {
    const a = store.create('T', 'C', 'GUIDE', 'alice');
    expect(a).toHaveProperty('viewCount');
  });
  it('article has helpful field', () => {
    const a = store.create('T', 'C', 'GUIDE', 'alice');
    expect(a).toHaveProperty('helpful');
  });
  it('article has notHelpful field', () => {
    const a = store.create('T', 'C', 'GUIDE', 'alice');
    expect(a).toHaveProperty('notHelpful');
  });
});

// ---------------------------------------------------------------------------
// KBCategory interface shape verification
// ---------------------------------------------------------------------------

describe('KBCategory interface shape', () => {
  let catMgr: CategoryManager;
  beforeEach(() => { catMgr = makeCatMgr(); });

  it('category has id field', () => {
    const c = catMgr.create('Cat', 'D');
    expect(c).toHaveProperty('id');
  });
  it('category has name field', () => {
    const c = catMgr.create('Cat', 'D');
    expect(c).toHaveProperty('name');
  });
  it('category has description field', () => {
    const c = catMgr.create('Cat', 'D');
    expect(c).toHaveProperty('description');
  });
  it('category has articleCount field', () => {
    const c = catMgr.create('Cat', 'D');
    expect(c).toHaveProperty('articleCount');
  });
  it('root category does not have parentId as own property (or it is undefined)', () => {
    const c = catMgr.create('Cat', 'D');
    expect(c.parentId).toBeUndefined();
  });
  it('child category has parentId as own property', () => {
    const parent = catMgr.create('Parent', 'D');
    const child = catMgr.create('Child', 'D', parent.id);
    expect(child).toHaveProperty('parentId');
    expect(child.parentId).toBe(parent.id);
  });
});

// ---------------------------------------------------------------------------
// Stress / bulk tests
// ---------------------------------------------------------------------------

describe('ArticleStore — bulk operations', () => {
  let store: ArticleStore;
  beforeEach(() => { store = makeStore(); });

  it('can create 100 articles and count is 100', () => {
    for (let i = 0; i < 100; i++) store.create(`T${i}`, 'C', 'GUIDE', 'alice');
    expect(store.getCount()).toBe(100);
  });
  it('can publish all 50 articles', () => {
    const ids: string[] = [];
    for (let i = 0; i < 50; i++) ids.push(store.create(`T${i}`, 'C', 'GUIDE', 'alice').id);
    ids.forEach(id => store.publish(id));
    expect(store.getPublished()).toHaveLength(50);
  });
  it('search across 50 articles', () => {
    for (let i = 0; i < 50; i++) store.create(`Safety Article ${i}`, 'Content', 'GUIDE', 'alice');
    for (let i = 0; i < 25; i++) store.create(`Other Article ${i}`, 'Content', 'POLICY', 'bob');
    expect(store.search('safety')).toHaveLength(50);
  });
  it('getTopViewed returns correct order for 30 articles', () => {
    const articles = [];
    for (let i = 0; i < 30; i++) articles.push(store.create(`T${i}`, 'C', 'GUIDE', 'alice'));
    // Give article at index 15 the most views
    for (let v = 0; v < 100; v++) store.recordView(articles[15].id);
    for (let v = 0; v < 50; v++) store.recordView(articles[5].id);
    const top = store.getTopViewed(3);
    expect(top[0].id).toBe(articles[15].id);
    expect(top[1].id).toBe(articles[5].id);
  });

  Array.from({ length: 5 }, (_, i) => (i + 1) * 10).forEach((n) => {
    it(`${n} articles: getByStatus DRAFT returns ${n} items`, () => {
      for (let k = 0; k < n; k++) store.create(`T${k}`, 'C', 'GUIDE', 'alice');
      expect(store.getByStatus('DRAFT')).toHaveLength(n);
    });
  });
});

describe('CategoryManager — bulk operations', () => {
  let catMgr: CategoryManager;
  beforeEach(() => { catMgr = makeCatMgr(); });

  it('can create 100 categories', () => {
    for (let i = 0; i < 100; i++) catMgr.create(`Cat${i}`, 'D');
    expect(catMgr.getCount()).toBe(100);
  });
  it('can delete all 50 categories', () => {
    const ids: string[] = [];
    for (let i = 0; i < 50; i++) ids.push(catMgr.create(`Cat${i}`, 'D').id);
    ids.forEach(id => catMgr.delete(id));
    expect(catMgr.getCount()).toBe(0);
  });
  it('100 increments then 100 decrements yields 0', () => {
    const c = catMgr.create('Cat', 'D');
    for (let i = 0; i < 100; i++) catMgr.incrementCount(c.id);
    for (let i = 0; i < 100; i++) catMgr.decrementCount(c.id);
    expect(catMgr.get(c.id)?.articleCount).toBe(0);
  });
  it('getRoots excludes all children in large tree', () => {
    const roots = [];
    for (let i = 0; i < 5; i++) roots.push(catMgr.create(`Root${i}`, 'D'));
    for (const root of roots) {
      for (let j = 0; j < 4; j++) catMgr.create(`Child${j}`, 'D', root.id);
    }
    expect(catMgr.getRoots()).toHaveLength(5);
    expect(catMgr.getCount()).toBe(25);
  });
});

// ---------------------------------------------------------------------------
// Edge cases for ArticleStore
// ---------------------------------------------------------------------------

describe('ArticleStore — edge cases', () => {
  let store: ArticleStore;
  beforeEach(() => { store = makeStore(); });

  it('empty string title is stored', () => {
    const a = store.create('', 'C', 'GUIDE', 'alice');
    expect(a.title).toBe('');
  });
  it('empty string content is stored', () => {
    const a = store.create('T', '', 'GUIDE', 'alice');
    expect(a.content).toBe('');
  });
  it('empty string author is stored', () => {
    const a = store.create('T', 'C', 'GUIDE', '');
    expect(a.author).toBe('');
  });
  it('many tags are stored correctly', () => {
    const tags = Array.from({ length: 50 }, (_, i) => `tag${i}`);
    const a = store.create('T', 'C', 'GUIDE', 'alice', tags);
    expect(a.tags).toHaveLength(50);
  });
  it('very long title is stored', () => {
    const longTitle = 'A'.repeat(1000);
    const a = store.create(longTitle, 'C', 'GUIDE', 'alice');
    expect(a.title).toBe(longTitle);
  });
  it('very long content is stored', () => {
    const longContent = 'B'.repeat(10000);
    const a = store.create('T', longContent, 'GUIDE', 'alice');
    expect(a.content).toBe(longContent);
  });
  it('search with special characters does not throw', () => {
    store.create('T', 'C', 'GUIDE', 'alice');
    expect(() => store.search('.*+')).not.toThrow();
  });
  it('update with no changes increments version', () => {
    const a = store.create('T', 'C', 'GUIDE', 'alice');
    const u = store.update(a.id, {});
    expect(u.version).toBe(2);
  });
  it('tags array is stored as passed in', () => {
    const tags = ['tag1', 'tag2', 'tag3'];
    const a = store.create('T', 'C', 'GUIDE', 'alice', tags);
    // All passed tags must be present in the stored article
    const stored = store.get(a.id);
    expect(stored?.tags).toContain('tag1');
    expect(stored?.tags).toContain('tag2');
    expect(stored?.tags).toContain('tag3');
  });

  Array.from({ length: 10 }, (_, i) => i).forEach((i) => {
    it(`article ${i}: create with unicode title`, () => {
      const title = `Article ${i}: 日本語テスト`;
      const a = store.create(title, 'C', 'GUIDE', 'alice');
      expect(a.title).toBe(title);
    });
  });
});

// ---------------------------------------------------------------------------
// Edge cases for CategoryManager
// ---------------------------------------------------------------------------

describe('CategoryManager — edge cases', () => {
  let catMgr: CategoryManager;
  beforeEach(() => { catMgr = makeCatMgr(); });

  it('empty name is stored', () => {
    const c = catMgr.create('', 'D');
    expect(c.name).toBe('');
  });
  it('empty description is stored', () => {
    const c = catMgr.create('Cat', '');
    expect(c.description).toBe('');
  });
  it('very long name is stored', () => {
    const name = 'C'.repeat(500);
    const c = catMgr.create(name, 'D');
    expect(c.name).toBe(name);
  });
  it('getByName with empty string', () => {
    catMgr.create('', 'D');
    expect(catMgr.getByName('')?.name).toBe('');
  });
  it('getChildren for a category that has no children returns []', () => {
    const c = catMgr.create('Lone', 'D');
    expect(catMgr.getChildren(c.id)).toEqual([]);
  });
  it('delete non-existent id returns false without throwing', () => {
    expect(() => catMgr.delete('ghost')).not.toThrow();
    expect(catMgr.delete('ghost')).toBe(false);
  });
  it('incrementCount on non-existent id is a no-op', () => {
    expect(() => catMgr.incrementCount('ghost')).not.toThrow();
  });
  it('decrementCount on non-existent id is a no-op', () => {
    expect(() => catMgr.decrementCount('ghost')).not.toThrow();
  });
  it('articleCount never goes below 0 after many decrements', () => {
    const c = catMgr.create('Cat', 'D');
    for (let i = 0; i < 20; i++) catMgr.decrementCount(c.id);
    expect(catMgr.get(c.id)?.articleCount).toBe(0);
  });

  Array.from({ length: 10 }, (_, i) => i).forEach((i) => {
    it(`category ${i}: create with unicode name`, () => {
      const name = `分類 ${i}`;
      const c = catMgr.create(name, 'D');
      expect(c.name).toBe(name);
    });
  });
});

// ---------------------------------------------------------------------------
// Comprehensive multi-operation sequences (parameterized)
// ---------------------------------------------------------------------------

describe('ArticleStore — parameterized operation sequences', () => {
  let store: ArticleStore;
  beforeEach(() => { store = makeStore(); });

  // Create N drafts, publish half, archive the other half — verify counts
  Array.from({ length: 5 }, (_, i) => (i + 2) * 2).forEach((total) => {
    it(`create ${total}, publish half, archive half: counts correct`, () => {
      const ids: string[] = [];
      for (let k = 0; k < total; k++) ids.push(store.create(`T${k}`, 'C', 'GUIDE', 'alice').id);
      const half = total / 2;
      for (let k = 0; k < half; k++) store.publish(ids[k]);
      for (let k = half; k < total; k++) store.archive(ids[k]);
      expect(store.getByStatus('PUBLISHED')).toHaveLength(half);
      expect(store.getByStatus('ARCHIVED')).toHaveLength(half);
      expect(store.getByStatus('DRAFT')).toHaveLength(0);
    });
  });

  // N articles, each viewed N times, getTopViewed returns correct top item
  Array.from({ length: 8 }, (_, i) => i + 2).forEach((n) => {
    it(`${n} articles: most-viewed article appears first in getTopViewed`, () => {
      const arts = [];
      for (let k = 0; k < n; k++) arts.push(store.create(`T${k}`, 'C', 'GUIDE', 'alice'));
      // The last article gets the most views
      for (let v = 0; v < n * 10; v++) store.recordView(arts[n - 1].id);
      for (let v = 0; v < 1; v++) store.recordView(arts[0].id);
      const top = store.getTopViewed(1);
      expect(top[0].id).toBe(arts[n - 1].id);
    });
  });

  // N articles tagged 'common', verify getByTag count
  Array.from({ length: 10 }, (_, i) => i + 1).forEach((n) => {
    it(`${n} articles tagged 'shared': getByTag returns ${n}`, () => {
      for (let k = 0; k < n; k++) store.create(`T${k}`, 'C', 'GUIDE', 'alice', ['shared']);
      for (let k = 0; k < 5; k++) store.create(`Other${k}`, 'C', 'POLICY', 'bob', ['different']);
      expect(store.getByTag('shared')).toHaveLength(n);
    });
  });

  // Feedback ratio tests
  Array.from({ length: 8 }, (_, i) => i + 1).forEach((ratio) => {
    it(`feedback ratio: ${ratio} helpful, 1 not helpful`, () => {
      const a = store.create('T', 'C', 'GUIDE', 'alice');
      for (let k = 0; k < ratio; k++) store.recordFeedback(a.id, true);
      store.recordFeedback(a.id, false);
      expect(store.get(a.id)?.helpful).toBe(ratio);
      expect(store.get(a.id)?.notHelpful).toBe(1);
    });
  });
});

// ---------------------------------------------------------------------------
// Final: index re-exports
// ---------------------------------------------------------------------------

describe('Index re-exports', () => {
  it('exports ArticleStore', async () => {
    const mod = await import('../index');
    expect(mod.ArticleStore).toBeDefined();
  });
  it('exports CategoryManager', async () => {
    const mod = await import('../index');
    expect(mod.CategoryManager).toBeDefined();
  });
  it('ArticleStore from index is constructable', async () => {
    const { ArticleStore: AS } = await import('../index');
    const s = new AS();
    expect(s.getCount()).toBe(0);
  });
  it('CategoryManager from index is constructable', async () => {
    const { CategoryManager: CM } = await import('../index');
    const m = new CM();
    expect(m.getCount()).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// ArticleStore — getByAuthor exhaustive parameterized (authors A0..A29)
// ---------------------------------------------------------------------------

describe('ArticleStore.getByAuthor — 30 unique authors', () => {
  let store: ArticleStore;
  beforeEach(() => { store = makeStore(); });

  Array.from({ length: 30 }, (_, i) => `author-${i}`).forEach((author) => {
    it(`getByAuthor("${author}") returns only that author's articles`, () => {
      store.create('T1', 'C', 'GUIDE', author);
      store.create('T2', 'C', 'POLICY', author);
      store.create('Other', 'C', 'FAQ', 'someone-else');
      const result = store.getByAuthor(author);
      expect(result).toHaveLength(2);
      result.forEach(a => expect(a.author).toBe(author));
    });
  });
});

// ---------------------------------------------------------------------------
// ArticleStore — create: all category × contentType combinations
// ---------------------------------------------------------------------------

describe('ArticleStore.create — category × contentType matrix', () => {
  let store: ArticleStore;
  beforeEach(() => { store = makeStore(); });

  ALL_CATEGORIES.forEach((cat) => {
    ALL_CONTENT_TYPES.forEach((ct) => {
      it(`category=${cat} contentType=${ct} stored correctly`, () => {
        const a = store.create('Title', 'Content', cat, 'tester', [], ct);
        expect(a.category).toBe(cat);
        expect(a.contentType).toBe(ct);
        expect(a.status).toBe('DRAFT');
      });
    });
  });
});

// ---------------------------------------------------------------------------
// ArticleStore — update changes persist across multiple get calls
// ---------------------------------------------------------------------------

describe('ArticleStore.update — persistence of changes', () => {
  let store: ArticleStore;
  beforeEach(() => { store = makeStore(); });

  Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
    it(`update iteration ${i}: title persists after get`, () => {
      const a = store.create('Original', 'C', 'GUIDE', 'alice');
      store.update(a.id, { title: `Updated-${i}` });
      expect(store.get(a.id)?.title).toBe(`Updated-${i}`);
    });
  });
});

// ---------------------------------------------------------------------------
// ArticleStore — getByStatus with various transition paths
// ---------------------------------------------------------------------------

describe('ArticleStore.getByStatus — comprehensive state transitions', () => {
  let store: ArticleStore;
  beforeEach(() => { store = makeStore(); });

  // All status values return correct articles
  const transitions: Array<{ label: string; fn: (id: string, s: ArticleStore) => void; expectedStatus: ArticleStatus }> = [
    { label: 'publish', fn: (id, s) => s.publish(id), expectedStatus: 'PUBLISHED' },
    { label: 'archive', fn: (id, s) => s.archive(id), expectedStatus: 'ARCHIVED' },
    { label: 'submitForReview', fn: (id, s) => s.submitForReview(id), expectedStatus: 'REVIEW' },
  ];

  transitions.forEach(({ label, fn, expectedStatus }) => {
    Array.from({ length: 8 }, (_, i) => i + 1).forEach((n) => {
      it(`${label} applied to ${n} articles: getByStatus(${expectedStatus}) = ${n}`, () => {
        const ids: string[] = [];
        for (let k = 0; k < n; k++) ids.push(store.create(`T${k}`, 'C', 'GUIDE', 'alice').id);
        ids.forEach(id => fn(id, store));
        expect(store.getByStatus(expectedStatus)).toHaveLength(n);
      });
    });
  });
});

// ---------------------------------------------------------------------------
// ArticleStore — search: tag matching across all categories
// ---------------------------------------------------------------------------

describe('ArticleStore.search — tag matching per category', () => {
  let store: ArticleStore;
  beforeEach(() => { store = makeStore(); });

  ALL_CATEGORIES.forEach((cat) => {
    it(`search matches tag in ${cat} article`, () => {
      store.create('Title', 'Content', cat, 'author', [`tag-${cat.toLowerCase()}`]);
      const results = store.search(`tag-${cat.toLowerCase()}`);
      expect(results).toHaveLength(1);
      expect(results[0].category).toBe(cat);
    });
  });
});

// ---------------------------------------------------------------------------
// ArticleStore — viewCount correctness across multiple articles
// ---------------------------------------------------------------------------

describe('ArticleStore.recordView — multi-article view tracking', () => {
  let store: ArticleStore;
  beforeEach(() => { store = makeStore(); });

  Array.from({ length: 15 }, (_, i) => i + 1).forEach((views) => {
    it(`article with ${views} views has viewCount=${views} in getTopViewed`, () => {
      const a = store.create('T', 'C', 'GUIDE', 'alice');
      for (let v = 0; v < views; v++) store.recordView(a.id);
      const top = store.getTopViewed(1);
      expect(top[0].viewCount).toBe(views);
    });
  });
});

// ---------------------------------------------------------------------------
// ArticleStore — getAll returns articles in creation order (stable)
// ---------------------------------------------------------------------------

describe('ArticleStore.getAll — order stability', () => {
  let store: ArticleStore;
  beforeEach(() => { store = makeStore(); });

  Array.from({ length: 10 }, (_, i) => i + 2).forEach((n) => {
    it(`getAll returns ${n} items and all have the correct author`, () => {
      for (let k = 0; k < n; k++) store.create(`Article${k}`, 'C', 'GUIDE', `author-${k}`);
      const all = store.getAll();
      expect(all).toHaveLength(n);
      all.forEach(a => expect(a.author).toMatch(/^author-\d+$/));
    });
  });
});

// ---------------------------------------------------------------------------
// CategoryManager — getByName: 20 distinct names
// ---------------------------------------------------------------------------

describe('CategoryManager.getByName — 20 distinct names', () => {
  let catMgr: CategoryManager;
  beforeEach(() => { catMgr = makeCatMgr(); });

  Array.from({ length: 20 }, (_, i) => `Category-${i}`).forEach((name) => {
    it(`getByName("${name}") returns correct category`, () => {
      catMgr.create(name, `Description for ${name}`);
      const result = catMgr.getByName(name);
      expect(result).toBeDefined();
      expect(result?.name).toBe(name);
      expect(result?.description).toBe(`Description for ${name}`);
    });
  });
});

// ---------------------------------------------------------------------------
// CategoryManager — incrementCount / decrementCount floor at 0
// ---------------------------------------------------------------------------

describe('CategoryManager.decrementCount — floor at 0', () => {
  let catMgr: CategoryManager;
  beforeEach(() => { catMgr = makeCatMgr(); });

  Array.from({ length: 15 }, (_, i) => i + 1).forEach((excess) => {
    it(`${excess} extra decrements beyond 0 stays at 0`, () => {
      const c = catMgr.create('Cat', 'D');
      catMgr.incrementCount(c.id); // bring to 1
      for (let k = 0; k < excess + 1; k++) catMgr.decrementCount(c.id); // go to 0 and then excess more
      expect(catMgr.get(c.id)?.articleCount).toBe(0);
    });
  });
});

// ---------------------------------------------------------------------------
// CategoryManager — getAll returns correct items after creates + deletes
// ---------------------------------------------------------------------------

describe('CategoryManager.getAll — after create/delete cycles', () => {
  let catMgr: CategoryManager;
  beforeEach(() => { catMgr = makeCatMgr(); });

  Array.from({ length: 10 }, (_, i) => i + 2).forEach((n) => {
    it(`create ${n} then delete 1: getAll has ${n - 1} items`, () => {
      const ids: string[] = [];
      for (let k = 0; k < n; k++) ids.push(catMgr.create(`Cat${k}`, 'D').id);
      catMgr.delete(ids[0]);
      expect(catMgr.getAll()).toHaveLength(n - 1);
    });
  });
});

// ---------------------------------------------------------------------------
// ArticleStore — search by content with various content types
// ---------------------------------------------------------------------------

describe('ArticleStore.search — content type does not block search', () => {
  let store: ArticleStore;
  beforeEach(() => { store = makeStore(); });

  ALL_CONTENT_TYPES.forEach((ct) => {
    it(`search finds article with contentType=${ct} by content`, () => {
      store.create('Title', `Searchable keyword for ${ct}`, 'GUIDE', 'alice', [], ct);
      const results = store.search('searchable keyword');
      expect(results).toHaveLength(1);
      expect(results[0].contentType).toBe(ct);
    });
  });

  ALL_CONTENT_TYPES.forEach((ct) => {
    it(`search finds article with contentType=${ct} by title`, () => {
      store.create(`Findable Article ${ct}`, 'Content', 'GUIDE', 'alice', [], ct);
      const results = store.search(`findable article ${ct.toLowerCase()}`);
      expect(results).toHaveLength(1);
    });
  });
});

// ---------------------------------------------------------------------------
// ArticleStore — full pipeline: create → review → publish → view → feedback
// ---------------------------------------------------------------------------

describe('ArticleStore — full pipeline end-to-end', () => {
  let store: ArticleStore;
  beforeEach(() => { store = makeStore(); });

  Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
    it(`pipeline iteration ${i}: full lifecycle produces correct state`, () => {
      const a = store.create(`Article ${i}`, `Content ${i}`, 'GUIDE', `author-${i}`, [`tag-${i}`]);
      expect(a.status).toBe('DRAFT');
      expect(a.version).toBe(1);

      const reviewed = store.submitForReview(a.id);
      expect(reviewed.status).toBe('REVIEW');

      const updated = store.update(a.id, { title: `Updated Article ${i}` });
      expect(updated.version).toBe(2);

      const published = store.publish(a.id);
      expect(published.status).toBe('PUBLISHED');
      expect(published.publishedAt).toBeInstanceOf(Date);

      store.recordView(a.id);
      store.recordView(a.id);
      expect(store.get(a.id)?.viewCount).toBe(2);

      store.recordFeedback(a.id, true);
      store.recordFeedback(a.id, false);
      expect(store.get(a.id)?.helpful).toBe(1);
      expect(store.get(a.id)?.notHelpful).toBe(1);

      const found = store.search(`Updated Article ${i}`);
      expect(found.some(x => x.id === a.id)).toBe(true);
    });
  });
});

// ---------------------------------------------------------------------------
// ArticleStore — getTopViewed with tied viewCounts
// ---------------------------------------------------------------------------

describe('ArticleStore.getTopViewed — tied view counts', () => {
  let store: ArticleStore;
  beforeEach(() => { store = makeStore(); });

  Array.from({ length: 8 }, (_, i) => i + 2).forEach((n) => {
    it(`${n} articles all with same viewCount: getTopViewed returns ${n} items`, () => {
      const arts = [];
      for (let k = 0; k < n; k++) arts.push(store.create(`T${k}`, 'C', 'GUIDE', 'alice'));
      arts.forEach(a => { store.recordView(a.id); store.recordView(a.id); });
      const top = store.getTopViewed(n);
      expect(top).toHaveLength(n);
      top.forEach(a => expect(a.viewCount).toBe(2));
    });
  });
});

// ---------------------------------------------------------------------------
// CategoryManager — children count after increments tied to children
// ---------------------------------------------------------------------------

describe('CategoryManager — articleCount reflects correct increments per category', () => {
  let catMgr: CategoryManager;
  beforeEach(() => { catMgr = makeCatMgr(); });

  Array.from({ length: 15 }, (_, i) => i + 1).forEach((n) => {
    it(`parent and child both track their own counts: n=${n}`, () => {
      const parent = catMgr.create('Parent', 'D');
      const child = catMgr.create('Child', 'D', parent.id);
      for (let k = 0; k < n; k++) catMgr.incrementCount(parent.id);
      for (let k = 0; k < n * 2; k++) catMgr.incrementCount(child.id);
      expect(catMgr.get(parent.id)?.articleCount).toBe(n);
      expect(catMgr.get(child.id)?.articleCount).toBe(n * 2);
    });
  });
});

// ---------------------------------------------------------------------------
// ArticleStore — getByCategory after publish/archive does not affect filter
// ---------------------------------------------------------------------------

describe('ArticleStore.getByCategory — status does not affect category filter', () => {
  let store: ArticleStore;
  beforeEach(() => { store = makeStore(); });

  ALL_CATEGORIES.forEach((cat) => {
    it(`getByCategory(${cat}) includes PUBLISHED articles`, () => {
      const a = store.create('T', 'C', cat, 'alice');
      store.publish(a.id);
      expect(store.getByCategory(cat).some(x => x.id === a.id)).toBe(true);
    });
    it(`getByCategory(${cat}) includes ARCHIVED articles`, () => {
      const a = store.create('T', 'C', cat, 'alice');
      store.archive(a.id);
      expect(store.getByCategory(cat).some(x => x.id === a.id)).toBe(true);
    });
  });
});

// ---------------------------------------------------------------------------
// ArticleStore — version tracking with update + status transitions interleaved
// ---------------------------------------------------------------------------

describe('ArticleStore — version is not affected by status transitions', () => {
  let store: ArticleStore;
  beforeEach(() => { store = makeStore(); });

  Array.from({ length: 20 }, (_, i) => i + 1).forEach((n) => {
    it(`version is ${n + 1} after ${n} updates regardless of publish`, () => {
      const a = store.create('T', 'C', 'GUIDE', 'alice');
      for (let k = 0; k < n; k++) store.update(a.id, { title: `V${k + 2}` });
      store.publish(a.id); // publish should NOT increment version
      expect(store.get(a.id)?.version).toBe(n + 1);
    });
  });
});

// ---------------------------------------------------------------------------
// ArticleStore — search returns no duplicates
// ---------------------------------------------------------------------------

describe('ArticleStore.search — no duplicate results', () => {
  let store: ArticleStore;
  beforeEach(() => { store = makeStore(); });

  Array.from({ length: 15 }, (_, i) => i + 1).forEach((n) => {
    it(`search returns exactly ${n} unique articles when ${n} distinct articles match`, () => {
      for (let k = 0; k < n; k++) {
        store.create(`Unique Title ${k}`, `Matching content alpha-beta-${k}`, 'GUIDE', `author-${k}`, [`tag-alpha`]);
      }
      // alpha-beta matches content only on each article uniquely
      const results = store.search('alpha-beta');
      const uniqueIds = new Set(results.map(a => a.id));
      expect(uniqueIds.size).toBe(results.length);
    });
  });
});

// ---------------------------------------------------------------------------
// CategoryManager — getChildren is isolated per parent
// ---------------------------------------------------------------------------

describe('CategoryManager.getChildren — parent isolation', () => {
  let catMgr: CategoryManager;
  beforeEach(() => { catMgr = makeCatMgr(); });

  Array.from({ length: 15 }, (_, i) => i + 1).forEach((childCount) => {
    it(`parent with ${childCount} children: getChildren(wrongParent) returns 0`, () => {
      const p1 = catMgr.create('P1', 'D');
      const p2 = catMgr.create('P2', 'D');
      for (let k = 0; k < childCount; k++) catMgr.create(`Child${k}`, 'D', p1.id);
      expect(catMgr.getChildren(p2.id)).toHaveLength(0);
    });
  });
});

// ---------------------------------------------------------------------------
// ArticleStore — getPublished matches getByStatus('PUBLISHED') exactly
// ---------------------------------------------------------------------------

describe('ArticleStore.getPublished === getByStatus(PUBLISHED)', () => {
  let store: ArticleStore;
  beforeEach(() => { store = makeStore(); });

  Array.from({ length: 12 }, (_, i) => i + 1).forEach((n) => {
    it(`${n} published: getPublished and getByStatus return same set`, () => {
      for (let k = 0; k < n; k++) {
        const a = store.create(`T${k}`, 'C', 'GUIDE', 'alice');
        store.publish(a.id);
      }
      const byPublished = store.getPublished().map(a => a.id).sort();
      const byStatus = store.getByStatus('PUBLISHED').map(a => a.id).sort();
      expect(byPublished).toEqual(byStatus);
    });
  });
});

// ---------------------------------------------------------------------------
// ArticleStore — createdAt and updatedAt timestamps
// ---------------------------------------------------------------------------

describe('ArticleStore — timestamp correctness', () => {
  let store: ArticleStore;
  beforeEach(() => { store = makeStore(); });

  Array.from({ length: 15 }, (_, i) => i).forEach((i) => {
    it(`article ${i}: createdAt <= updatedAt after creation`, () => {
      const a = store.create(`T${i}`, 'C', 'GUIDE', 'alice');
      expect(a.createdAt.getTime()).toBeLessThanOrEqual(a.updatedAt.getTime());
    });
  });

  Array.from({ length: 10 }, (_, i) => i).forEach((i) => {
    it(`article ${i}: publishedAt >= createdAt after publish`, () => {
      const a = store.create(`T${i}`, 'C', 'GUIDE', 'alice');
      const p = store.publish(a.id);
      expect(p.publishedAt!.getTime()).toBeGreaterThanOrEqual(a.createdAt.getTime());
    });
  });
});

// ---------------------------------------------------------------------------
// ArticleStore — multi-tag search overlap
// ---------------------------------------------------------------------------

describe('ArticleStore.getByTag — multi-tag articles', () => {
  let store: ArticleStore;
  beforeEach(() => { store = makeStore(); });

  Array.from({ length: 10 }, (_, i) => i + 2).forEach((tagCount) => {
    it(`article with ${tagCount} tags is findable by each tag`, () => {
      const tags = Array.from({ length: tagCount }, (_, t) => `tag-${t}`);
      const a = store.create('Multi-Tag Article', 'Content', 'GUIDE', 'alice', tags);
      tags.forEach(tag => {
        const results = store.getByTag(tag);
        expect(results.some(x => x.id === a.id)).toBe(true);
      });
    });
  });
});

// ---------------------------------------------------------------------------
// ArticleStore — getByTag returns articles with only that tag (not all)
// ---------------------------------------------------------------------------

describe('ArticleStore.getByTag — exclusivity', () => {
  let store: ArticleStore;
  beforeEach(() => { store = makeStore(); });

  Array.from({ length: 10 }, (_, i) => i).forEach((i) => {
    it(`getByTag("tag-${i}") does not return articles without that tag`, () => {
      store.create(`T${i}`, 'C', 'GUIDE', 'alice', [`tag-${i}`]);
      store.create(`Other${i}`, 'C', 'GUIDE', 'alice', [`different-tag-${i}`]);
      const results = store.getByTag(`tag-${i}`);
      results.forEach(a => expect(a.tags).toContain(`tag-${i}`));
      expect(results).toHaveLength(1);
    });
  });
});
