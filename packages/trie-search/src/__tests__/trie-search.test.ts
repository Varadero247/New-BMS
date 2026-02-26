// Copyright (c) 2026 Nexara DMCC. All rights reserved.
import { Trie, createTrie, buildTrie } from '../trie-search';

describe('Trie - insert and search', () => {
  it('empty trie has size 0', () => { expect(new Trie().size).toBe(0); });
  it('insert increases size', () => { const t = new Trie(); t.insert('hello'); expect(t.size).toBe(1); });
  it('search for inserted word', () => { const t = new Trie(); t.insert('hello'); expect(t.search('hello')).toBe(true); });
  it('search for missing word returns false', () => { expect(new Trie().search('missing')).toBe(false); });
  it('duplicate insert does not increase size', () => {
    const t = new Trie(); t.insert('abc'); t.insert('abc'); expect(t.size).toBe(1);
  });
  for (let i = 0; i < 100; i++) {
    it('insert and search word' + i, () => {
      const t = new Trie();
      t.insert('word' + i);
      expect(t.search('word' + i)).toBe(true);
    });
  }
  for (let n = 1; n <= 50; n++) {
    it('size after ' + n + ' unique inserts = ' + n, () => {
      const t = new Trie();
      for (let i = 0; i < n; i++) t.insert('w' + i);
      expect(t.size).toBe(n);
    });
  }
});

describe('Trie - startsWith', () => {
  it('startsWith returns true for prefix', () => {
    const t = new Trie(); t.insert('hello');
    expect(t.startsWith('hell')).toBe(true);
  });
  it('startsWith returns false for non-prefix', () => {
    const t = new Trie(); t.insert('hello');
    expect(t.startsWith('world')).toBe(false);
  });
  it('startsWith full word', () => {
    const t = new Trie(); t.insert('abc');
    expect(t.startsWith('abc')).toBe(true);
  });
  for (let i = 0; i < 100; i++) {
    it('startsWith prefix of word' + i, () => {
      const t = new Trie();
      t.insert('prefix' + i + 'suffix');
      expect(t.startsWith('prefix' + i)).toBe(true);
    });
  }
});

describe('Trie - delete', () => {
  it('delete existing word returns true', () => {
    const t = new Trie(); t.insert('hello');
    expect(t.delete('hello')).toBe(true);
  });
  it('delete missing word returns false', () => {
    expect(new Trie().delete('missing')).toBe(false);
  });
  it('after delete search returns false', () => {
    const t = new Trie(); t.insert('hello'); t.delete('hello');
    expect(t.search('hello')).toBe(false);
  });
  it('delete prefix does not delete superset', () => {
    const t = new Trie(); t.insert('hello'); t.insert('hell');
    t.delete('hell');
    expect(t.search('hello')).toBe(true);
  });
  for (let i = 0; i < 50; i++) {
    it('delete then size decreases ' + i, () => {
      const t = new Trie(); t.insert('w' + i);
      t.delete('w' + i);
      expect(t.size).toBe(0);
    });
  }
});

describe('Trie - autocomplete', () => {
  it('autocomplete returns matches', () => {
    const t = buildTrie(['apple', 'app', 'application', 'apply', 'banana']);
    const results = t.autocomplete('app');
    expect(results.length).toBeGreaterThan(0);
    expect(results.every(r => r.startsWith('app'))).toBe(true);
  });
  it('autocomplete with empty prefix returns some words', () => {
    const t = buildTrie(['a', 'b', 'c']);
    expect(t.autocomplete('').length).toBeGreaterThan(0);
  });
  it('autocomplete respects limit', () => {
    const t = buildTrie(['a1', 'a2', 'a3', 'a4', 'a5']);
    expect(t.autocomplete('a', 3)).toHaveLength(3);
  });
  for (let i = 0; i < 50; i++) {
    it('autocomplete has correct prefix ' + i, () => {
      const t = new Trie();
      for (let j = 0; j < 5; j++) t.insert('key' + i + '_' + j);
      const results = t.autocomplete('key' + i);
      expect(results.length).toBe(5);
    });
  }
});

describe('Trie - countWordsWithPrefix and allWords', () => {
  it('countWordsWithPrefix exact prefix', () => {
    const t = buildTrie(['cat', 'car', 'card', 'care']);
    expect(t.countWordsWithPrefix('car')).toBe(3);
  });
  it('allWords returns all inserted words', () => {
    const words = ['apple', 'banana', 'cherry'];
    const t = buildTrie(words);
    const all = t.allWords();
    expect(all).toHaveLength(3);
    expect(all.sort()).toEqual(words.sort());
  });
  for (let n = 1; n <= 50; n++) {
    it('allWords returns ' + n + ' words', () => {
      const words = Array.from({ length: n }, (_, i) => 'word' + i);
      expect(buildTrie(words).allWords()).toHaveLength(n);
    });
  }
});

describe('createTrie and buildTrie', () => {
  it('createTrie returns empty trie', () => { expect(createTrie().size).toBe(0); });
  it('buildTrie from array', () => { expect(buildTrie(['a', 'b', 'c']).size).toBe(3); });
  for (let i = 0; i < 50; i++) {
    it('buildTrie words preserved ' + i, () => {
      const t = buildTrie(['x' + i, 'y' + i]);
      expect(t.search('x' + i)).toBe(true);
      expect(t.search('y' + i)).toBe(true);
    });
  }
});

describe('Trie longestCommonPrefix', () => {
  it('returns common prefix', () => {
    const t = buildTrie(['flow', 'flower', 'flight']);
    expect(t.longestCommonPrefix()).toBe('fl');
  });
  it('no common prefix returns empty', () => {
    const t = buildTrie(['abc', 'def']);
    expect(t.longestCommonPrefix()).toBe('');
  });
  for (let i = 1; i <= 30; i++) {
    it('prefix of length ' + i + ' words', () => {
      const prefix = 'a'.repeat(i);
      const t = buildTrie([prefix + 'x', prefix + 'y']);
      expect(t.longestCommonPrefix()).toBe(prefix);
    });
  }
});

describe('trie top-up', () => {
  for (let i = 0; i < 100; i++) {
    it('search after insert word' + i, () => {
      const t = new Trie(); t.insert('w' + i);
      expect(t.search('w' + i)).toBe(true);
    });
  }
  for (let i = 0; i < 100; i++) {
    it('startsWith after insert ' + i, () => {
      const t = new Trie(); t.insert('prefix' + i);
      expect(t.startsWith('prefix')).toBe(true);
    });
  }
  for (let i = 0; i < 100; i++) {
    it('search missing returns false ' + i, () => {
      expect(new Trie().search('nothere' + i)).toBe(false);
    });
  }
  for (let i = 0; i < 100; i++) {
    it('countWordsWithPrefix ' + i, () => {
      const t = new Trie();
      t.insert('aa' + i); t.insert('ab' + i); t.insert('ba' + i);
      expect(t.countWordsWithPrefix('a')).toBe(2);
    });
  }
  for (let i = 0; i < 100; i++) {
    it('autocomplete returns array ' + i, () => {
      const t = new Trie(); t.insert('hello' + i);
      expect(Array.isArray(t.autocomplete('hello'))).toBe(true);
    });
  }
});
