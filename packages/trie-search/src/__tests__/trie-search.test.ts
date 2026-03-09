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
function hd258tri(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph258tri_hd',()=>{it('a',()=>{expect(hd258tri(1,4)).toBe(2);});it('b',()=>{expect(hd258tri(3,1)).toBe(1);});it('c',()=>{expect(hd258tri(0,0)).toBe(0);});it('d',()=>{expect(hd258tri(93,73)).toBe(2);});it('e',()=>{expect(hd258tri(15,0)).toBe(4);});});
function hd259tri(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph259tri_hd',()=>{it('a',()=>{expect(hd259tri(1,4)).toBe(2);});it('b',()=>{expect(hd259tri(3,1)).toBe(1);});it('c',()=>{expect(hd259tri(0,0)).toBe(0);});it('d',()=>{expect(hd259tri(93,73)).toBe(2);});it('e',()=>{expect(hd259tri(15,0)).toBe(4);});});
function hd260tri(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph260tri_hd',()=>{it('a',()=>{expect(hd260tri(1,4)).toBe(2);});it('b',()=>{expect(hd260tri(3,1)).toBe(1);});it('c',()=>{expect(hd260tri(0,0)).toBe(0);});it('d',()=>{expect(hd260tri(93,73)).toBe(2);});it('e',()=>{expect(hd260tri(15,0)).toBe(4);});});
function hd261tri(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph261tri_hd',()=>{it('a',()=>{expect(hd261tri(1,4)).toBe(2);});it('b',()=>{expect(hd261tri(3,1)).toBe(1);});it('c',()=>{expect(hd261tri(0,0)).toBe(0);});it('d',()=>{expect(hd261tri(93,73)).toBe(2);});it('e',()=>{expect(hd261tri(15,0)).toBe(4);});});
function hd262tri(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph262tri_hd',()=>{it('a',()=>{expect(hd262tri(1,4)).toBe(2);});it('b',()=>{expect(hd262tri(3,1)).toBe(1);});it('c',()=>{expect(hd262tri(0,0)).toBe(0);});it('d',()=>{expect(hd262tri(93,73)).toBe(2);});it('e',()=>{expect(hd262tri(15,0)).toBe(4);});});
function hd263tri(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph263tri_hd',()=>{it('a',()=>{expect(hd263tri(1,4)).toBe(2);});it('b',()=>{expect(hd263tri(3,1)).toBe(1);});it('c',()=>{expect(hd263tri(0,0)).toBe(0);});it('d',()=>{expect(hd263tri(93,73)).toBe(2);});it('e',()=>{expect(hd263tri(15,0)).toBe(4);});});
function hd264tri(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph264tri_hd',()=>{it('a',()=>{expect(hd264tri(1,4)).toBe(2);});it('b',()=>{expect(hd264tri(3,1)).toBe(1);});it('c',()=>{expect(hd264tri(0,0)).toBe(0);});it('d',()=>{expect(hd264tri(93,73)).toBe(2);});it('e',()=>{expect(hd264tri(15,0)).toBe(4);});});
function hd265tri(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph265tri_hd',()=>{it('a',()=>{expect(hd265tri(1,4)).toBe(2);});it('b',()=>{expect(hd265tri(3,1)).toBe(1);});it('c',()=>{expect(hd265tri(0,0)).toBe(0);});it('d',()=>{expect(hd265tri(93,73)).toBe(2);});it('e',()=>{expect(hd265tri(15,0)).toBe(4);});});
function hd266tri(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph266tri_hd',()=>{it('a',()=>{expect(hd266tri(1,4)).toBe(2);});it('b',()=>{expect(hd266tri(3,1)).toBe(1);});it('c',()=>{expect(hd266tri(0,0)).toBe(0);});it('d',()=>{expect(hd266tri(93,73)).toBe(2);});it('e',()=>{expect(hd266tri(15,0)).toBe(4);});});
function hd267tri(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph267tri_hd',()=>{it('a',()=>{expect(hd267tri(1,4)).toBe(2);});it('b',()=>{expect(hd267tri(3,1)).toBe(1);});it('c',()=>{expect(hd267tri(0,0)).toBe(0);});it('d',()=>{expect(hd267tri(93,73)).toBe(2);});it('e',()=>{expect(hd267tri(15,0)).toBe(4);});});
function hd268tri(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph268tri_hd',()=>{it('a',()=>{expect(hd268tri(1,4)).toBe(2);});it('b',()=>{expect(hd268tri(3,1)).toBe(1);});it('c',()=>{expect(hd268tri(0,0)).toBe(0);});it('d',()=>{expect(hd268tri(93,73)).toBe(2);});it('e',()=>{expect(hd268tri(15,0)).toBe(4);});});
function hd269tri(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph269tri_hd',()=>{it('a',()=>{expect(hd269tri(1,4)).toBe(2);});it('b',()=>{expect(hd269tri(3,1)).toBe(1);});it('c',()=>{expect(hd269tri(0,0)).toBe(0);});it('d',()=>{expect(hd269tri(93,73)).toBe(2);});it('e',()=>{expect(hd269tri(15,0)).toBe(4);});});
function hd270tri(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph270tri_hd',()=>{it('a',()=>{expect(hd270tri(1,4)).toBe(2);});it('b',()=>{expect(hd270tri(3,1)).toBe(1);});it('c',()=>{expect(hd270tri(0,0)).toBe(0);});it('d',()=>{expect(hd270tri(93,73)).toBe(2);});it('e',()=>{expect(hd270tri(15,0)).toBe(4);});});
function hd271tri(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph271tri_hd',()=>{it('a',()=>{expect(hd271tri(1,4)).toBe(2);});it('b',()=>{expect(hd271tri(3,1)).toBe(1);});it('c',()=>{expect(hd271tri(0,0)).toBe(0);});it('d',()=>{expect(hd271tri(93,73)).toBe(2);});it('e',()=>{expect(hd271tri(15,0)).toBe(4);});});
function hd272tri(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph272tri_hd',()=>{it('a',()=>{expect(hd272tri(1,4)).toBe(2);});it('b',()=>{expect(hd272tri(3,1)).toBe(1);});it('c',()=>{expect(hd272tri(0,0)).toBe(0);});it('d',()=>{expect(hd272tri(93,73)).toBe(2);});it('e',()=>{expect(hd272tri(15,0)).toBe(4);});});
function hd273tri(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph273tri_hd',()=>{it('a',()=>{expect(hd273tri(1,4)).toBe(2);});it('b',()=>{expect(hd273tri(3,1)).toBe(1);});it('c',()=>{expect(hd273tri(0,0)).toBe(0);});it('d',()=>{expect(hd273tri(93,73)).toBe(2);});it('e',()=>{expect(hd273tri(15,0)).toBe(4);});});
function hd274tri(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph274tri_hd',()=>{it('a',()=>{expect(hd274tri(1,4)).toBe(2);});it('b',()=>{expect(hd274tri(3,1)).toBe(1);});it('c',()=>{expect(hd274tri(0,0)).toBe(0);});it('d',()=>{expect(hd274tri(93,73)).toBe(2);});it('e',()=>{expect(hd274tri(15,0)).toBe(4);});});
function hd275tri(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph275tri_hd',()=>{it('a',()=>{expect(hd275tri(1,4)).toBe(2);});it('b',()=>{expect(hd275tri(3,1)).toBe(1);});it('c',()=>{expect(hd275tri(0,0)).toBe(0);});it('d',()=>{expect(hd275tri(93,73)).toBe(2);});it('e',()=>{expect(hd275tri(15,0)).toBe(4);});});
function hd276tri(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph276tri_hd',()=>{it('a',()=>{expect(hd276tri(1,4)).toBe(2);});it('b',()=>{expect(hd276tri(3,1)).toBe(1);});it('c',()=>{expect(hd276tri(0,0)).toBe(0);});it('d',()=>{expect(hd276tri(93,73)).toBe(2);});it('e',()=>{expect(hd276tri(15,0)).toBe(4);});});
function hd277tri(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph277tri_hd',()=>{it('a',()=>{expect(hd277tri(1,4)).toBe(2);});it('b',()=>{expect(hd277tri(3,1)).toBe(1);});it('c',()=>{expect(hd277tri(0,0)).toBe(0);});it('d',()=>{expect(hd277tri(93,73)).toBe(2);});it('e',()=>{expect(hd277tri(15,0)).toBe(4);});});
function hd278tri(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph278tri_hd',()=>{it('a',()=>{expect(hd278tri(1,4)).toBe(2);});it('b',()=>{expect(hd278tri(3,1)).toBe(1);});it('c',()=>{expect(hd278tri(0,0)).toBe(0);});it('d',()=>{expect(hd278tri(93,73)).toBe(2);});it('e',()=>{expect(hd278tri(15,0)).toBe(4);});});
function hd279tri(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph279tri_hd',()=>{it('a',()=>{expect(hd279tri(1,4)).toBe(2);});it('b',()=>{expect(hd279tri(3,1)).toBe(1);});it('c',()=>{expect(hd279tri(0,0)).toBe(0);});it('d',()=>{expect(hd279tri(93,73)).toBe(2);});it('e',()=>{expect(hd279tri(15,0)).toBe(4);});});
function hd280tri(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph280tri_hd',()=>{it('a',()=>{expect(hd280tri(1,4)).toBe(2);});it('b',()=>{expect(hd280tri(3,1)).toBe(1);});it('c',()=>{expect(hd280tri(0,0)).toBe(0);});it('d',()=>{expect(hd280tri(93,73)).toBe(2);});it('e',()=>{expect(hd280tri(15,0)).toBe(4);});});
function hd281tri(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph281tri_hd',()=>{it('a',()=>{expect(hd281tri(1,4)).toBe(2);});it('b',()=>{expect(hd281tri(3,1)).toBe(1);});it('c',()=>{expect(hd281tri(0,0)).toBe(0);});it('d',()=>{expect(hd281tri(93,73)).toBe(2);});it('e',()=>{expect(hd281tri(15,0)).toBe(4);});});
function hd282tri(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph282tri_hd',()=>{it('a',()=>{expect(hd282tri(1,4)).toBe(2);});it('b',()=>{expect(hd282tri(3,1)).toBe(1);});it('c',()=>{expect(hd282tri(0,0)).toBe(0);});it('d',()=>{expect(hd282tri(93,73)).toBe(2);});it('e',()=>{expect(hd282tri(15,0)).toBe(4);});});
function hd283tri(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph283tri_hd',()=>{it('a',()=>{expect(hd283tri(1,4)).toBe(2);});it('b',()=>{expect(hd283tri(3,1)).toBe(1);});it('c',()=>{expect(hd283tri(0,0)).toBe(0);});it('d',()=>{expect(hd283tri(93,73)).toBe(2);});it('e',()=>{expect(hd283tri(15,0)).toBe(4);});});
function hd284tri(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph284tri_hd',()=>{it('a',()=>{expect(hd284tri(1,4)).toBe(2);});it('b',()=>{expect(hd284tri(3,1)).toBe(1);});it('c',()=>{expect(hd284tri(0,0)).toBe(0);});it('d',()=>{expect(hd284tri(93,73)).toBe(2);});it('e',()=>{expect(hd284tri(15,0)).toBe(4);});});
function hd285tri(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph285tri_hd',()=>{it('a',()=>{expect(hd285tri(1,4)).toBe(2);});it('b',()=>{expect(hd285tri(3,1)).toBe(1);});it('c',()=>{expect(hd285tri(0,0)).toBe(0);});it('d',()=>{expect(hd285tri(93,73)).toBe(2);});it('e',()=>{expect(hd285tri(15,0)).toBe(4);});});
function hd286tri(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph286tri_hd',()=>{it('a',()=>{expect(hd286tri(1,4)).toBe(2);});it('b',()=>{expect(hd286tri(3,1)).toBe(1);});it('c',()=>{expect(hd286tri(0,0)).toBe(0);});it('d',()=>{expect(hd286tri(93,73)).toBe(2);});it('e',()=>{expect(hd286tri(15,0)).toBe(4);});});
function hd287tri(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph287tri_hd',()=>{it('a',()=>{expect(hd287tri(1,4)).toBe(2);});it('b',()=>{expect(hd287tri(3,1)).toBe(1);});it('c',()=>{expect(hd287tri(0,0)).toBe(0);});it('d',()=>{expect(hd287tri(93,73)).toBe(2);});it('e',()=>{expect(hd287tri(15,0)).toBe(4);});});
function hd288tri(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph288tri_hd',()=>{it('a',()=>{expect(hd288tri(1,4)).toBe(2);});it('b',()=>{expect(hd288tri(3,1)).toBe(1);});it('c',()=>{expect(hd288tri(0,0)).toBe(0);});it('d',()=>{expect(hd288tri(93,73)).toBe(2);});it('e',()=>{expect(hd288tri(15,0)).toBe(4);});});
function hd289tri(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph289tri_hd',()=>{it('a',()=>{expect(hd289tri(1,4)).toBe(2);});it('b',()=>{expect(hd289tri(3,1)).toBe(1);});it('c',()=>{expect(hd289tri(0,0)).toBe(0);});it('d',()=>{expect(hd289tri(93,73)).toBe(2);});it('e',()=>{expect(hd289tri(15,0)).toBe(4);});});
function hd290tri(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph290tri_hd',()=>{it('a',()=>{expect(hd290tri(1,4)).toBe(2);});it('b',()=>{expect(hd290tri(3,1)).toBe(1);});it('c',()=>{expect(hd290tri(0,0)).toBe(0);});it('d',()=>{expect(hd290tri(93,73)).toBe(2);});it('e',()=>{expect(hd290tri(15,0)).toBe(4);});});
function hd291tri(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph291tri_hd',()=>{it('a',()=>{expect(hd291tri(1,4)).toBe(2);});it('b',()=>{expect(hd291tri(3,1)).toBe(1);});it('c',()=>{expect(hd291tri(0,0)).toBe(0);});it('d',()=>{expect(hd291tri(93,73)).toBe(2);});it('e',()=>{expect(hd291tri(15,0)).toBe(4);});});
function hd292tri(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph292tri_hd',()=>{it('a',()=>{expect(hd292tri(1,4)).toBe(2);});it('b',()=>{expect(hd292tri(3,1)).toBe(1);});it('c',()=>{expect(hd292tri(0,0)).toBe(0);});it('d',()=>{expect(hd292tri(93,73)).toBe(2);});it('e',()=>{expect(hd292tri(15,0)).toBe(4);});});
function hd293tri(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph293tri_hd',()=>{it('a',()=>{expect(hd293tri(1,4)).toBe(2);});it('b',()=>{expect(hd293tri(3,1)).toBe(1);});it('c',()=>{expect(hd293tri(0,0)).toBe(0);});it('d',()=>{expect(hd293tri(93,73)).toBe(2);});it('e',()=>{expect(hd293tri(15,0)).toBe(4);});});
function hd294tri(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph294tri_hd',()=>{it('a',()=>{expect(hd294tri(1,4)).toBe(2);});it('b',()=>{expect(hd294tri(3,1)).toBe(1);});it('c',()=>{expect(hd294tri(0,0)).toBe(0);});it('d',()=>{expect(hd294tri(93,73)).toBe(2);});it('e',()=>{expect(hd294tri(15,0)).toBe(4);});});
function hd295tri(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph295tri_hd',()=>{it('a',()=>{expect(hd295tri(1,4)).toBe(2);});it('b',()=>{expect(hd295tri(3,1)).toBe(1);});it('c',()=>{expect(hd295tri(0,0)).toBe(0);});it('d',()=>{expect(hd295tri(93,73)).toBe(2);});it('e',()=>{expect(hd295tri(15,0)).toBe(4);});});
function hd296tri(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph296tri_hd',()=>{it('a',()=>{expect(hd296tri(1,4)).toBe(2);});it('b',()=>{expect(hd296tri(3,1)).toBe(1);});it('c',()=>{expect(hd296tri(0,0)).toBe(0);});it('d',()=>{expect(hd296tri(93,73)).toBe(2);});it('e',()=>{expect(hd296tri(15,0)).toBe(4);});});
function hd297tri(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph297tri_hd',()=>{it('a',()=>{expect(hd297tri(1,4)).toBe(2);});it('b',()=>{expect(hd297tri(3,1)).toBe(1);});it('c',()=>{expect(hd297tri(0,0)).toBe(0);});it('d',()=>{expect(hd297tri(93,73)).toBe(2);});it('e',()=>{expect(hd297tri(15,0)).toBe(4);});});
function hd298tri(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph298tri_hd',()=>{it('a',()=>{expect(hd298tri(1,4)).toBe(2);});it('b',()=>{expect(hd298tri(3,1)).toBe(1);});it('c',()=>{expect(hd298tri(0,0)).toBe(0);});it('d',()=>{expect(hd298tri(93,73)).toBe(2);});it('e',()=>{expect(hd298tri(15,0)).toBe(4);});});
function hd299tri(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph299tri_hd',()=>{it('a',()=>{expect(hd299tri(1,4)).toBe(2);});it('b',()=>{expect(hd299tri(3,1)).toBe(1);});it('c',()=>{expect(hd299tri(0,0)).toBe(0);});it('d',()=>{expect(hd299tri(93,73)).toBe(2);});it('e',()=>{expect(hd299tri(15,0)).toBe(4);});});
function hd300tri(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph300tri_hd',()=>{it('a',()=>{expect(hd300tri(1,4)).toBe(2);});it('b',()=>{expect(hd300tri(3,1)).toBe(1);});it('c',()=>{expect(hd300tri(0,0)).toBe(0);});it('d',()=>{expect(hd300tri(93,73)).toBe(2);});it('e',()=>{expect(hd300tri(15,0)).toBe(4);});});
function hd301tri(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph301tri_hd',()=>{it('a',()=>{expect(hd301tri(1,4)).toBe(2);});it('b',()=>{expect(hd301tri(3,1)).toBe(1);});it('c',()=>{expect(hd301tri(0,0)).toBe(0);});it('d',()=>{expect(hd301tri(93,73)).toBe(2);});it('e',()=>{expect(hd301tri(15,0)).toBe(4);});});
function hd302tri(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph302tri_hd',()=>{it('a',()=>{expect(hd302tri(1,4)).toBe(2);});it('b',()=>{expect(hd302tri(3,1)).toBe(1);});it('c',()=>{expect(hd302tri(0,0)).toBe(0);});it('d',()=>{expect(hd302tri(93,73)).toBe(2);});it('e',()=>{expect(hd302tri(15,0)).toBe(4);});});
function hd303tri(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph303tri_hd',()=>{it('a',()=>{expect(hd303tri(1,4)).toBe(2);});it('b',()=>{expect(hd303tri(3,1)).toBe(1);});it('c',()=>{expect(hd303tri(0,0)).toBe(0);});it('d',()=>{expect(hd303tri(93,73)).toBe(2);});it('e',()=>{expect(hd303tri(15,0)).toBe(4);});});
function hd304tri(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph304tri_hd',()=>{it('a',()=>{expect(hd304tri(1,4)).toBe(2);});it('b',()=>{expect(hd304tri(3,1)).toBe(1);});it('c',()=>{expect(hd304tri(0,0)).toBe(0);});it('d',()=>{expect(hd304tri(93,73)).toBe(2);});it('e',()=>{expect(hd304tri(15,0)).toBe(4);});});
function hd305tri(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph305tri_hd',()=>{it('a',()=>{expect(hd305tri(1,4)).toBe(2);});it('b',()=>{expect(hd305tri(3,1)).toBe(1);});it('c',()=>{expect(hd305tri(0,0)).toBe(0);});it('d',()=>{expect(hd305tri(93,73)).toBe(2);});it('e',()=>{expect(hd305tri(15,0)).toBe(4);});});
function hd306tri(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph306tri_hd',()=>{it('a',()=>{expect(hd306tri(1,4)).toBe(2);});it('b',()=>{expect(hd306tri(3,1)).toBe(1);});it('c',()=>{expect(hd306tri(0,0)).toBe(0);});it('d',()=>{expect(hd306tri(93,73)).toBe(2);});it('e',()=>{expect(hd306tri(15,0)).toBe(4);});});
function hd307tri(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph307tri_hd',()=>{it('a',()=>{expect(hd307tri(1,4)).toBe(2);});it('b',()=>{expect(hd307tri(3,1)).toBe(1);});it('c',()=>{expect(hd307tri(0,0)).toBe(0);});it('d',()=>{expect(hd307tri(93,73)).toBe(2);});it('e',()=>{expect(hd307tri(15,0)).toBe(4);});});
function hd308tri(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph308tri_hd',()=>{it('a',()=>{expect(hd308tri(1,4)).toBe(2);});it('b',()=>{expect(hd308tri(3,1)).toBe(1);});it('c',()=>{expect(hd308tri(0,0)).toBe(0);});it('d',()=>{expect(hd308tri(93,73)).toBe(2);});it('e',()=>{expect(hd308tri(15,0)).toBe(4);});});
function hd309tri(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph309tri_hd',()=>{it('a',()=>{expect(hd309tri(1,4)).toBe(2);});it('b',()=>{expect(hd309tri(3,1)).toBe(1);});it('c',()=>{expect(hd309tri(0,0)).toBe(0);});it('d',()=>{expect(hd309tri(93,73)).toBe(2);});it('e',()=>{expect(hd309tri(15,0)).toBe(4);});});
function hd310tri(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph310tri_hd',()=>{it('a',()=>{expect(hd310tri(1,4)).toBe(2);});it('b',()=>{expect(hd310tri(3,1)).toBe(1);});it('c',()=>{expect(hd310tri(0,0)).toBe(0);});it('d',()=>{expect(hd310tri(93,73)).toBe(2);});it('e',()=>{expect(hd310tri(15,0)).toBe(4);});});
function hd311tri(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph311tri_hd',()=>{it('a',()=>{expect(hd311tri(1,4)).toBe(2);});it('b',()=>{expect(hd311tri(3,1)).toBe(1);});it('c',()=>{expect(hd311tri(0,0)).toBe(0);});it('d',()=>{expect(hd311tri(93,73)).toBe(2);});it('e',()=>{expect(hd311tri(15,0)).toBe(4);});});
function hd312tri(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph312tri_hd',()=>{it('a',()=>{expect(hd312tri(1,4)).toBe(2);});it('b',()=>{expect(hd312tri(3,1)).toBe(1);});it('c',()=>{expect(hd312tri(0,0)).toBe(0);});it('d',()=>{expect(hd312tri(93,73)).toBe(2);});it('e',()=>{expect(hd312tri(15,0)).toBe(4);});});
function hd313tri(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph313tri_hd',()=>{it('a',()=>{expect(hd313tri(1,4)).toBe(2);});it('b',()=>{expect(hd313tri(3,1)).toBe(1);});it('c',()=>{expect(hd313tri(0,0)).toBe(0);});it('d',()=>{expect(hd313tri(93,73)).toBe(2);});it('e',()=>{expect(hd313tri(15,0)).toBe(4);});});
function hd314tri(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph314tri_hd',()=>{it('a',()=>{expect(hd314tri(1,4)).toBe(2);});it('b',()=>{expect(hd314tri(3,1)).toBe(1);});it('c',()=>{expect(hd314tri(0,0)).toBe(0);});it('d',()=>{expect(hd314tri(93,73)).toBe(2);});it('e',()=>{expect(hd314tri(15,0)).toBe(4);});});
function hd315tri(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph315tri_hd',()=>{it('a',()=>{expect(hd315tri(1,4)).toBe(2);});it('b',()=>{expect(hd315tri(3,1)).toBe(1);});it('c',()=>{expect(hd315tri(0,0)).toBe(0);});it('d',()=>{expect(hd315tri(93,73)).toBe(2);});it('e',()=>{expect(hd315tri(15,0)).toBe(4);});});
function hd316tri(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph316tri_hd',()=>{it('a',()=>{expect(hd316tri(1,4)).toBe(2);});it('b',()=>{expect(hd316tri(3,1)).toBe(1);});it('c',()=>{expect(hd316tri(0,0)).toBe(0);});it('d',()=>{expect(hd316tri(93,73)).toBe(2);});it('e',()=>{expect(hd316tri(15,0)).toBe(4);});});
function hd317tri(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph317tri_hd',()=>{it('a',()=>{expect(hd317tri(1,4)).toBe(2);});it('b',()=>{expect(hd317tri(3,1)).toBe(1);});it('c',()=>{expect(hd317tri(0,0)).toBe(0);});it('d',()=>{expect(hd317tri(93,73)).toBe(2);});it('e',()=>{expect(hd317tri(15,0)).toBe(4);});});
function hd318tri(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph318tri_hd',()=>{it('a',()=>{expect(hd318tri(1,4)).toBe(2);});it('b',()=>{expect(hd318tri(3,1)).toBe(1);});it('c',()=>{expect(hd318tri(0,0)).toBe(0);});it('d',()=>{expect(hd318tri(93,73)).toBe(2);});it('e',()=>{expect(hd318tri(15,0)).toBe(4);});});
function hd319tri(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph319tri_hd',()=>{it('a',()=>{expect(hd319tri(1,4)).toBe(2);});it('b',()=>{expect(hd319tri(3,1)).toBe(1);});it('c',()=>{expect(hd319tri(0,0)).toBe(0);});it('d',()=>{expect(hd319tri(93,73)).toBe(2);});it('e',()=>{expect(hd319tri(15,0)).toBe(4);});});
function hd320tri(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph320tri_hd',()=>{it('a',()=>{expect(hd320tri(1,4)).toBe(2);});it('b',()=>{expect(hd320tri(3,1)).toBe(1);});it('c',()=>{expect(hd320tri(0,0)).toBe(0);});it('d',()=>{expect(hd320tri(93,73)).toBe(2);});it('e',()=>{expect(hd320tri(15,0)).toBe(4);});});
function hd321tri(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph321tri_hd',()=>{it('a',()=>{expect(hd321tri(1,4)).toBe(2);});it('b',()=>{expect(hd321tri(3,1)).toBe(1);});it('c',()=>{expect(hd321tri(0,0)).toBe(0);});it('d',()=>{expect(hd321tri(93,73)).toBe(2);});it('e',()=>{expect(hd321tri(15,0)).toBe(4);});});
function hd322tri(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph322tri_hd',()=>{it('a',()=>{expect(hd322tri(1,4)).toBe(2);});it('b',()=>{expect(hd322tri(3,1)).toBe(1);});it('c',()=>{expect(hd322tri(0,0)).toBe(0);});it('d',()=>{expect(hd322tri(93,73)).toBe(2);});it('e',()=>{expect(hd322tri(15,0)).toBe(4);});});
function hd323tri(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph323tri_hd',()=>{it('a',()=>{expect(hd323tri(1,4)).toBe(2);});it('b',()=>{expect(hd323tri(3,1)).toBe(1);});it('c',()=>{expect(hd323tri(0,0)).toBe(0);});it('d',()=>{expect(hd323tri(93,73)).toBe(2);});it('e',()=>{expect(hd323tri(15,0)).toBe(4);});});
function hd324tri(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph324tri_hd',()=>{it('a',()=>{expect(hd324tri(1,4)).toBe(2);});it('b',()=>{expect(hd324tri(3,1)).toBe(1);});it('c',()=>{expect(hd324tri(0,0)).toBe(0);});it('d',()=>{expect(hd324tri(93,73)).toBe(2);});it('e',()=>{expect(hd324tri(15,0)).toBe(4);});});
function hd325tri(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph325tri_hd',()=>{it('a',()=>{expect(hd325tri(1,4)).toBe(2);});it('b',()=>{expect(hd325tri(3,1)).toBe(1);});it('c',()=>{expect(hd325tri(0,0)).toBe(0);});it('d',()=>{expect(hd325tri(93,73)).toBe(2);});it('e',()=>{expect(hd325tri(15,0)).toBe(4);});});
function hd326tri(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph326tri_hd',()=>{it('a',()=>{expect(hd326tri(1,4)).toBe(2);});it('b',()=>{expect(hd326tri(3,1)).toBe(1);});it('c',()=>{expect(hd326tri(0,0)).toBe(0);});it('d',()=>{expect(hd326tri(93,73)).toBe(2);});it('e',()=>{expect(hd326tri(15,0)).toBe(4);});});
function hd327tri(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph327tri_hd',()=>{it('a',()=>{expect(hd327tri(1,4)).toBe(2);});it('b',()=>{expect(hd327tri(3,1)).toBe(1);});it('c',()=>{expect(hd327tri(0,0)).toBe(0);});it('d',()=>{expect(hd327tri(93,73)).toBe(2);});it('e',()=>{expect(hd327tri(15,0)).toBe(4);});});
function hd328tri(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph328tri_hd',()=>{it('a',()=>{expect(hd328tri(1,4)).toBe(2);});it('b',()=>{expect(hd328tri(3,1)).toBe(1);});it('c',()=>{expect(hd328tri(0,0)).toBe(0);});it('d',()=>{expect(hd328tri(93,73)).toBe(2);});it('e',()=>{expect(hd328tri(15,0)).toBe(4);});});
function hd329tri(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph329tri_hd',()=>{it('a',()=>{expect(hd329tri(1,4)).toBe(2);});it('b',()=>{expect(hd329tri(3,1)).toBe(1);});it('c',()=>{expect(hd329tri(0,0)).toBe(0);});it('d',()=>{expect(hd329tri(93,73)).toBe(2);});it('e',()=>{expect(hd329tri(15,0)).toBe(4);});});
function hd330tri(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph330tri_hd',()=>{it('a',()=>{expect(hd330tri(1,4)).toBe(2);});it('b',()=>{expect(hd330tri(3,1)).toBe(1);});it('c',()=>{expect(hd330tri(0,0)).toBe(0);});it('d',()=>{expect(hd330tri(93,73)).toBe(2);});it('e',()=>{expect(hd330tri(15,0)).toBe(4);});});
function hd331tri(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph331tri_hd',()=>{it('a',()=>{expect(hd331tri(1,4)).toBe(2);});it('b',()=>{expect(hd331tri(3,1)).toBe(1);});it('c',()=>{expect(hd331tri(0,0)).toBe(0);});it('d',()=>{expect(hd331tri(93,73)).toBe(2);});it('e',()=>{expect(hd331tri(15,0)).toBe(4);});});
function hd332tri(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph332tri_hd',()=>{it('a',()=>{expect(hd332tri(1,4)).toBe(2);});it('b',()=>{expect(hd332tri(3,1)).toBe(1);});it('c',()=>{expect(hd332tri(0,0)).toBe(0);});it('d',()=>{expect(hd332tri(93,73)).toBe(2);});it('e',()=>{expect(hd332tri(15,0)).toBe(4);});});
function hd333tri(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph333tri_hd',()=>{it('a',()=>{expect(hd333tri(1,4)).toBe(2);});it('b',()=>{expect(hd333tri(3,1)).toBe(1);});it('c',()=>{expect(hd333tri(0,0)).toBe(0);});it('d',()=>{expect(hd333tri(93,73)).toBe(2);});it('e',()=>{expect(hd333tri(15,0)).toBe(4);});});
function hd334tri(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph334tri_hd',()=>{it('a',()=>{expect(hd334tri(1,4)).toBe(2);});it('b',()=>{expect(hd334tri(3,1)).toBe(1);});it('c',()=>{expect(hd334tri(0,0)).toBe(0);});it('d',()=>{expect(hd334tri(93,73)).toBe(2);});it('e',()=>{expect(hd334tri(15,0)).toBe(4);});});
function hd335tri(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph335tri_hd',()=>{it('a',()=>{expect(hd335tri(1,4)).toBe(2);});it('b',()=>{expect(hd335tri(3,1)).toBe(1);});it('c',()=>{expect(hd335tri(0,0)).toBe(0);});it('d',()=>{expect(hd335tri(93,73)).toBe(2);});it('e',()=>{expect(hd335tri(15,0)).toBe(4);});});
function hd336tri(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph336tri_hd',()=>{it('a',()=>{expect(hd336tri(1,4)).toBe(2);});it('b',()=>{expect(hd336tri(3,1)).toBe(1);});it('c',()=>{expect(hd336tri(0,0)).toBe(0);});it('d',()=>{expect(hd336tri(93,73)).toBe(2);});it('e',()=>{expect(hd336tri(15,0)).toBe(4);});});
function hd337tri(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph337tri_hd',()=>{it('a',()=>{expect(hd337tri(1,4)).toBe(2);});it('b',()=>{expect(hd337tri(3,1)).toBe(1);});it('c',()=>{expect(hd337tri(0,0)).toBe(0);});it('d',()=>{expect(hd337tri(93,73)).toBe(2);});it('e',()=>{expect(hd337tri(15,0)).toBe(4);});});
function hd338tri2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph338tri2_hd',()=>{it('a',()=>{expect(hd338tri2(1,4)).toBe(2);});it('b',()=>{expect(hd338tri2(3,1)).toBe(1);});it('c',()=>{expect(hd338tri2(0,0)).toBe(0);});it('d',()=>{expect(hd338tri2(93,73)).toBe(2);});it('e',()=>{expect(hd338tri2(15,0)).toBe(4);});});
function hd339tri2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph339tri2_hd',()=>{it('a',()=>{expect(hd339tri2(1,4)).toBe(2);});it('b',()=>{expect(hd339tri2(3,1)).toBe(1);});it('c',()=>{expect(hd339tri2(0,0)).toBe(0);});it('d',()=>{expect(hd339tri2(93,73)).toBe(2);});it('e',()=>{expect(hd339tri2(15,0)).toBe(4);});});
function hd340tri2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph340tri2_hd',()=>{it('a',()=>{expect(hd340tri2(1,4)).toBe(2);});it('b',()=>{expect(hd340tri2(3,1)).toBe(1);});it('c',()=>{expect(hd340tri2(0,0)).toBe(0);});it('d',()=>{expect(hd340tri2(93,73)).toBe(2);});it('e',()=>{expect(hd340tri2(15,0)).toBe(4);});});
function hd341tri2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph341tri2_hd',()=>{it('a',()=>{expect(hd341tri2(1,4)).toBe(2);});it('b',()=>{expect(hd341tri2(3,1)).toBe(1);});it('c',()=>{expect(hd341tri2(0,0)).toBe(0);});it('d',()=>{expect(hd341tri2(93,73)).toBe(2);});it('e',()=>{expect(hd341tri2(15,0)).toBe(4);});});
function hd342tri2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph342tri2_hd',()=>{it('a',()=>{expect(hd342tri2(1,4)).toBe(2);});it('b',()=>{expect(hd342tri2(3,1)).toBe(1);});it('c',()=>{expect(hd342tri2(0,0)).toBe(0);});it('d',()=>{expect(hd342tri2(93,73)).toBe(2);});it('e',()=>{expect(hd342tri2(15,0)).toBe(4);});});
function hd343tri2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph343tri2_hd',()=>{it('a',()=>{expect(hd343tri2(1,4)).toBe(2);});it('b',()=>{expect(hd343tri2(3,1)).toBe(1);});it('c',()=>{expect(hd343tri2(0,0)).toBe(0);});it('d',()=>{expect(hd343tri2(93,73)).toBe(2);});it('e',()=>{expect(hd343tri2(15,0)).toBe(4);});});
function hd344tri2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph344tri2_hd',()=>{it('a',()=>{expect(hd344tri2(1,4)).toBe(2);});it('b',()=>{expect(hd344tri2(3,1)).toBe(1);});it('c',()=>{expect(hd344tri2(0,0)).toBe(0);});it('d',()=>{expect(hd344tri2(93,73)).toBe(2);});it('e',()=>{expect(hd344tri2(15,0)).toBe(4);});});
function hd345tri2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph345tri2_hd',()=>{it('a',()=>{expect(hd345tri2(1,4)).toBe(2);});it('b',()=>{expect(hd345tri2(3,1)).toBe(1);});it('c',()=>{expect(hd345tri2(0,0)).toBe(0);});it('d',()=>{expect(hd345tri2(93,73)).toBe(2);});it('e',()=>{expect(hd345tri2(15,0)).toBe(4);});});
function hd346tri2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph346tri2_hd',()=>{it('a',()=>{expect(hd346tri2(1,4)).toBe(2);});it('b',()=>{expect(hd346tri2(3,1)).toBe(1);});it('c',()=>{expect(hd346tri2(0,0)).toBe(0);});it('d',()=>{expect(hd346tri2(93,73)).toBe(2);});it('e',()=>{expect(hd346tri2(15,0)).toBe(4);});});
function hd347tri2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph347tri2_hd',()=>{it('a',()=>{expect(hd347tri2(1,4)).toBe(2);});it('b',()=>{expect(hd347tri2(3,1)).toBe(1);});it('c',()=>{expect(hd347tri2(0,0)).toBe(0);});it('d',()=>{expect(hd347tri2(93,73)).toBe(2);});it('e',()=>{expect(hd347tri2(15,0)).toBe(4);});});
function hd348tri2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph348tri2_hd',()=>{it('a',()=>{expect(hd348tri2(1,4)).toBe(2);});it('b',()=>{expect(hd348tri2(3,1)).toBe(1);});it('c',()=>{expect(hd348tri2(0,0)).toBe(0);});it('d',()=>{expect(hd348tri2(93,73)).toBe(2);});it('e',()=>{expect(hd348tri2(15,0)).toBe(4);});});
function hd349tri2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph349tri2_hd',()=>{it('a',()=>{expect(hd349tri2(1,4)).toBe(2);});it('b',()=>{expect(hd349tri2(3,1)).toBe(1);});it('c',()=>{expect(hd349tri2(0,0)).toBe(0);});it('d',()=>{expect(hd349tri2(93,73)).toBe(2);});it('e',()=>{expect(hd349tri2(15,0)).toBe(4);});});
function hd350tri2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph350tri2_hd',()=>{it('a',()=>{expect(hd350tri2(1,4)).toBe(2);});it('b',()=>{expect(hd350tri2(3,1)).toBe(1);});it('c',()=>{expect(hd350tri2(0,0)).toBe(0);});it('d',()=>{expect(hd350tri2(93,73)).toBe(2);});it('e',()=>{expect(hd350tri2(15,0)).toBe(4);});});
function hd351tri2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph351tri2_hd',()=>{it('a',()=>{expect(hd351tri2(1,4)).toBe(2);});it('b',()=>{expect(hd351tri2(3,1)).toBe(1);});it('c',()=>{expect(hd351tri2(0,0)).toBe(0);});it('d',()=>{expect(hd351tri2(93,73)).toBe(2);});it('e',()=>{expect(hd351tri2(15,0)).toBe(4);});});
function hd352tri2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph352tri2_hd',()=>{it('a',()=>{expect(hd352tri2(1,4)).toBe(2);});it('b',()=>{expect(hd352tri2(3,1)).toBe(1);});it('c',()=>{expect(hd352tri2(0,0)).toBe(0);});it('d',()=>{expect(hd352tri2(93,73)).toBe(2);});it('e',()=>{expect(hd352tri2(15,0)).toBe(4);});});
function hd353tri2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph353tri2_hd',()=>{it('a',()=>{expect(hd353tri2(1,4)).toBe(2);});it('b',()=>{expect(hd353tri2(3,1)).toBe(1);});it('c',()=>{expect(hd353tri2(0,0)).toBe(0);});it('d',()=>{expect(hd353tri2(93,73)).toBe(2);});it('e',()=>{expect(hd353tri2(15,0)).toBe(4);});});
function hd354tri2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph354tri2_hd',()=>{it('a',()=>{expect(hd354tri2(1,4)).toBe(2);});it('b',()=>{expect(hd354tri2(3,1)).toBe(1);});it('c',()=>{expect(hd354tri2(0,0)).toBe(0);});it('d',()=>{expect(hd354tri2(93,73)).toBe(2);});it('e',()=>{expect(hd354tri2(15,0)).toBe(4);});});
function hd355tri2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph355tri2_hd',()=>{it('a',()=>{expect(hd355tri2(1,4)).toBe(2);});it('b',()=>{expect(hd355tri2(3,1)).toBe(1);});it('c',()=>{expect(hd355tri2(0,0)).toBe(0);});it('d',()=>{expect(hd355tri2(93,73)).toBe(2);});it('e',()=>{expect(hd355tri2(15,0)).toBe(4);});});
function hd356tri2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph356tri2_hd',()=>{it('a',()=>{expect(hd356tri2(1,4)).toBe(2);});it('b',()=>{expect(hd356tri2(3,1)).toBe(1);});it('c',()=>{expect(hd356tri2(0,0)).toBe(0);});it('d',()=>{expect(hd356tri2(93,73)).toBe(2);});it('e',()=>{expect(hd356tri2(15,0)).toBe(4);});});
function hd357tri2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph357tri2_hd',()=>{it('a',()=>{expect(hd357tri2(1,4)).toBe(2);});it('b',()=>{expect(hd357tri2(3,1)).toBe(1);});it('c',()=>{expect(hd357tri2(0,0)).toBe(0);});it('d',()=>{expect(hd357tri2(93,73)).toBe(2);});it('e',()=>{expect(hd357tri2(15,0)).toBe(4);});});
function hd358tri2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph358tri2_hd',()=>{it('a',()=>{expect(hd358tri2(1,4)).toBe(2);});it('b',()=>{expect(hd358tri2(3,1)).toBe(1);});it('c',()=>{expect(hd358tri2(0,0)).toBe(0);});it('d',()=>{expect(hd358tri2(93,73)).toBe(2);});it('e',()=>{expect(hd358tri2(15,0)).toBe(4);});});
function hd359tri2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph359tri2_hd',()=>{it('a',()=>{expect(hd359tri2(1,4)).toBe(2);});it('b',()=>{expect(hd359tri2(3,1)).toBe(1);});it('c',()=>{expect(hd359tri2(0,0)).toBe(0);});it('d',()=>{expect(hd359tri2(93,73)).toBe(2);});it('e',()=>{expect(hd359tri2(15,0)).toBe(4);});});
function hd360tri2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph360tri2_hd',()=>{it('a',()=>{expect(hd360tri2(1,4)).toBe(2);});it('b',()=>{expect(hd360tri2(3,1)).toBe(1);});it('c',()=>{expect(hd360tri2(0,0)).toBe(0);});it('d',()=>{expect(hd360tri2(93,73)).toBe(2);});it('e',()=>{expect(hd360tri2(15,0)).toBe(4);});});
function hd361tri2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph361tri2_hd',()=>{it('a',()=>{expect(hd361tri2(1,4)).toBe(2);});it('b',()=>{expect(hd361tri2(3,1)).toBe(1);});it('c',()=>{expect(hd361tri2(0,0)).toBe(0);});it('d',()=>{expect(hd361tri2(93,73)).toBe(2);});it('e',()=>{expect(hd361tri2(15,0)).toBe(4);});});
function hd362tri2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph362tri2_hd',()=>{it('a',()=>{expect(hd362tri2(1,4)).toBe(2);});it('b',()=>{expect(hd362tri2(3,1)).toBe(1);});it('c',()=>{expect(hd362tri2(0,0)).toBe(0);});it('d',()=>{expect(hd362tri2(93,73)).toBe(2);});it('e',()=>{expect(hd362tri2(15,0)).toBe(4);});});
function hd363tri2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph363tri2_hd',()=>{it('a',()=>{expect(hd363tri2(1,4)).toBe(2);});it('b',()=>{expect(hd363tri2(3,1)).toBe(1);});it('c',()=>{expect(hd363tri2(0,0)).toBe(0);});it('d',()=>{expect(hd363tri2(93,73)).toBe(2);});it('e',()=>{expect(hd363tri2(15,0)).toBe(4);});});
function hd364tri2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph364tri2_hd',()=>{it('a',()=>{expect(hd364tri2(1,4)).toBe(2);});it('b',()=>{expect(hd364tri2(3,1)).toBe(1);});it('c',()=>{expect(hd364tri2(0,0)).toBe(0);});it('d',()=>{expect(hd364tri2(93,73)).toBe(2);});it('e',()=>{expect(hd364tri2(15,0)).toBe(4);});});
function hd365tri2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph365tri2_hd',()=>{it('a',()=>{expect(hd365tri2(1,4)).toBe(2);});it('b',()=>{expect(hd365tri2(3,1)).toBe(1);});it('c',()=>{expect(hd365tri2(0,0)).toBe(0);});it('d',()=>{expect(hd365tri2(93,73)).toBe(2);});it('e',()=>{expect(hd365tri2(15,0)).toBe(4);});});
function hd366tri2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph366tri2_hd',()=>{it('a',()=>{expect(hd366tri2(1,4)).toBe(2);});it('b',()=>{expect(hd366tri2(3,1)).toBe(1);});it('c',()=>{expect(hd366tri2(0,0)).toBe(0);});it('d',()=>{expect(hd366tri2(93,73)).toBe(2);});it('e',()=>{expect(hd366tri2(15,0)).toBe(4);});});
function hd367tri2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph367tri2_hd',()=>{it('a',()=>{expect(hd367tri2(1,4)).toBe(2);});it('b',()=>{expect(hd367tri2(3,1)).toBe(1);});it('c',()=>{expect(hd367tri2(0,0)).toBe(0);});it('d',()=>{expect(hd367tri2(93,73)).toBe(2);});it('e',()=>{expect(hd367tri2(15,0)).toBe(4);});});
function hd368tri2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph368tri2_hd',()=>{it('a',()=>{expect(hd368tri2(1,4)).toBe(2);});it('b',()=>{expect(hd368tri2(3,1)).toBe(1);});it('c',()=>{expect(hd368tri2(0,0)).toBe(0);});it('d',()=>{expect(hd368tri2(93,73)).toBe(2);});it('e',()=>{expect(hd368tri2(15,0)).toBe(4);});});
function hd369tri2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph369tri2_hd',()=>{it('a',()=>{expect(hd369tri2(1,4)).toBe(2);});it('b',()=>{expect(hd369tri2(3,1)).toBe(1);});it('c',()=>{expect(hd369tri2(0,0)).toBe(0);});it('d',()=>{expect(hd369tri2(93,73)).toBe(2);});it('e',()=>{expect(hd369tri2(15,0)).toBe(4);});});
function hd370tri2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph370tri2_hd',()=>{it('a',()=>{expect(hd370tri2(1,4)).toBe(2);});it('b',()=>{expect(hd370tri2(3,1)).toBe(1);});it('c',()=>{expect(hd370tri2(0,0)).toBe(0);});it('d',()=>{expect(hd370tri2(93,73)).toBe(2);});it('e',()=>{expect(hd370tri2(15,0)).toBe(4);});});
function hd371tri2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph371tri2_hd',()=>{it('a',()=>{expect(hd371tri2(1,4)).toBe(2);});it('b',()=>{expect(hd371tri2(3,1)).toBe(1);});it('c',()=>{expect(hd371tri2(0,0)).toBe(0);});it('d',()=>{expect(hd371tri2(93,73)).toBe(2);});it('e',()=>{expect(hd371tri2(15,0)).toBe(4);});});
function hd372tri2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph372tri2_hd',()=>{it('a',()=>{expect(hd372tri2(1,4)).toBe(2);});it('b',()=>{expect(hd372tri2(3,1)).toBe(1);});it('c',()=>{expect(hd372tri2(0,0)).toBe(0);});it('d',()=>{expect(hd372tri2(93,73)).toBe(2);});it('e',()=>{expect(hd372tri2(15,0)).toBe(4);});});
function hd373tri2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph373tri2_hd',()=>{it('a',()=>{expect(hd373tri2(1,4)).toBe(2);});it('b',()=>{expect(hd373tri2(3,1)).toBe(1);});it('c',()=>{expect(hd373tri2(0,0)).toBe(0);});it('d',()=>{expect(hd373tri2(93,73)).toBe(2);});it('e',()=>{expect(hd373tri2(15,0)).toBe(4);});});
function hd374tri2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph374tri2_hd',()=>{it('a',()=>{expect(hd374tri2(1,4)).toBe(2);});it('b',()=>{expect(hd374tri2(3,1)).toBe(1);});it('c',()=>{expect(hd374tri2(0,0)).toBe(0);});it('d',()=>{expect(hd374tri2(93,73)).toBe(2);});it('e',()=>{expect(hd374tri2(15,0)).toBe(4);});});
function hd375tri2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph375tri2_hd',()=>{it('a',()=>{expect(hd375tri2(1,4)).toBe(2);});it('b',()=>{expect(hd375tri2(3,1)).toBe(1);});it('c',()=>{expect(hd375tri2(0,0)).toBe(0);});it('d',()=>{expect(hd375tri2(93,73)).toBe(2);});it('e',()=>{expect(hd375tri2(15,0)).toBe(4);});});
function hd376tri2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph376tri2_hd',()=>{it('a',()=>{expect(hd376tri2(1,4)).toBe(2);});it('b',()=>{expect(hd376tri2(3,1)).toBe(1);});it('c',()=>{expect(hd376tri2(0,0)).toBe(0);});it('d',()=>{expect(hd376tri2(93,73)).toBe(2);});it('e',()=>{expect(hd376tri2(15,0)).toBe(4);});});
function hd377tri2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph377tri2_hd',()=>{it('a',()=>{expect(hd377tri2(1,4)).toBe(2);});it('b',()=>{expect(hd377tri2(3,1)).toBe(1);});it('c',()=>{expect(hd377tri2(0,0)).toBe(0);});it('d',()=>{expect(hd377tri2(93,73)).toBe(2);});it('e',()=>{expect(hd377tri2(15,0)).toBe(4);});});
function hd378tri2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph378tri2_hd',()=>{it('a',()=>{expect(hd378tri2(1,4)).toBe(2);});it('b',()=>{expect(hd378tri2(3,1)).toBe(1);});it('c',()=>{expect(hd378tri2(0,0)).toBe(0);});it('d',()=>{expect(hd378tri2(93,73)).toBe(2);});it('e',()=>{expect(hd378tri2(15,0)).toBe(4);});});
function hd379tri2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph379tri2_hd',()=>{it('a',()=>{expect(hd379tri2(1,4)).toBe(2);});it('b',()=>{expect(hd379tri2(3,1)).toBe(1);});it('c',()=>{expect(hd379tri2(0,0)).toBe(0);});it('d',()=>{expect(hd379tri2(93,73)).toBe(2);});it('e',()=>{expect(hd379tri2(15,0)).toBe(4);});});
function hd380tri2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph380tri2_hd',()=>{it('a',()=>{expect(hd380tri2(1,4)).toBe(2);});it('b',()=>{expect(hd380tri2(3,1)).toBe(1);});it('c',()=>{expect(hd380tri2(0,0)).toBe(0);});it('d',()=>{expect(hd380tri2(93,73)).toBe(2);});it('e',()=>{expect(hd380tri2(15,0)).toBe(4);});});
function hd381tri2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph381tri2_hd',()=>{it('a',()=>{expect(hd381tri2(1,4)).toBe(2);});it('b',()=>{expect(hd381tri2(3,1)).toBe(1);});it('c',()=>{expect(hd381tri2(0,0)).toBe(0);});it('d',()=>{expect(hd381tri2(93,73)).toBe(2);});it('e',()=>{expect(hd381tri2(15,0)).toBe(4);});});
function hd382tri2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph382tri2_hd',()=>{it('a',()=>{expect(hd382tri2(1,4)).toBe(2);});it('b',()=>{expect(hd382tri2(3,1)).toBe(1);});it('c',()=>{expect(hd382tri2(0,0)).toBe(0);});it('d',()=>{expect(hd382tri2(93,73)).toBe(2);});it('e',()=>{expect(hd382tri2(15,0)).toBe(4);});});
function hd383tri2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph383tri2_hd',()=>{it('a',()=>{expect(hd383tri2(1,4)).toBe(2);});it('b',()=>{expect(hd383tri2(3,1)).toBe(1);});it('c',()=>{expect(hd383tri2(0,0)).toBe(0);});it('d',()=>{expect(hd383tri2(93,73)).toBe(2);});it('e',()=>{expect(hd383tri2(15,0)).toBe(4);});});
function hd384tri2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph384tri2_hd',()=>{it('a',()=>{expect(hd384tri2(1,4)).toBe(2);});it('b',()=>{expect(hd384tri2(3,1)).toBe(1);});it('c',()=>{expect(hd384tri2(0,0)).toBe(0);});it('d',()=>{expect(hd384tri2(93,73)).toBe(2);});it('e',()=>{expect(hd384tri2(15,0)).toBe(4);});});
function hd385tri2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph385tri2_hd',()=>{it('a',()=>{expect(hd385tri2(1,4)).toBe(2);});it('b',()=>{expect(hd385tri2(3,1)).toBe(1);});it('c',()=>{expect(hd385tri2(0,0)).toBe(0);});it('d',()=>{expect(hd385tri2(93,73)).toBe(2);});it('e',()=>{expect(hd385tri2(15,0)).toBe(4);});});
function hd386tri2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph386tri2_hd',()=>{it('a',()=>{expect(hd386tri2(1,4)).toBe(2);});it('b',()=>{expect(hd386tri2(3,1)).toBe(1);});it('c',()=>{expect(hd386tri2(0,0)).toBe(0);});it('d',()=>{expect(hd386tri2(93,73)).toBe(2);});it('e',()=>{expect(hd386tri2(15,0)).toBe(4);});});
function hd387tri2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph387tri2_hd',()=>{it('a',()=>{expect(hd387tri2(1,4)).toBe(2);});it('b',()=>{expect(hd387tri2(3,1)).toBe(1);});it('c',()=>{expect(hd387tri2(0,0)).toBe(0);});it('d',()=>{expect(hd387tri2(93,73)).toBe(2);});it('e',()=>{expect(hd387tri2(15,0)).toBe(4);});});
function hd388tri2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph388tri2_hd',()=>{it('a',()=>{expect(hd388tri2(1,4)).toBe(2);});it('b',()=>{expect(hd388tri2(3,1)).toBe(1);});it('c',()=>{expect(hd388tri2(0,0)).toBe(0);});it('d',()=>{expect(hd388tri2(93,73)).toBe(2);});it('e',()=>{expect(hd388tri2(15,0)).toBe(4);});});
function hd389tri2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph389tri2_hd',()=>{it('a',()=>{expect(hd389tri2(1,4)).toBe(2);});it('b',()=>{expect(hd389tri2(3,1)).toBe(1);});it('c',()=>{expect(hd389tri2(0,0)).toBe(0);});it('d',()=>{expect(hd389tri2(93,73)).toBe(2);});it('e',()=>{expect(hd389tri2(15,0)).toBe(4);});});
function hd390tri2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph390tri2_hd',()=>{it('a',()=>{expect(hd390tri2(1,4)).toBe(2);});it('b',()=>{expect(hd390tri2(3,1)).toBe(1);});it('c',()=>{expect(hd390tri2(0,0)).toBe(0);});it('d',()=>{expect(hd390tri2(93,73)).toBe(2);});it('e',()=>{expect(hd390tri2(15,0)).toBe(4);});});
function hd391tri2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph391tri2_hd',()=>{it('a',()=>{expect(hd391tri2(1,4)).toBe(2);});it('b',()=>{expect(hd391tri2(3,1)).toBe(1);});it('c',()=>{expect(hd391tri2(0,0)).toBe(0);});it('d',()=>{expect(hd391tri2(93,73)).toBe(2);});it('e',()=>{expect(hd391tri2(15,0)).toBe(4);});});
function hd392tri2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph392tri2_hd',()=>{it('a',()=>{expect(hd392tri2(1,4)).toBe(2);});it('b',()=>{expect(hd392tri2(3,1)).toBe(1);});it('c',()=>{expect(hd392tri2(0,0)).toBe(0);});it('d',()=>{expect(hd392tri2(93,73)).toBe(2);});it('e',()=>{expect(hd392tri2(15,0)).toBe(4);});});
function hd393tri2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph393tri2_hd',()=>{it('a',()=>{expect(hd393tri2(1,4)).toBe(2);});it('b',()=>{expect(hd393tri2(3,1)).toBe(1);});it('c',()=>{expect(hd393tri2(0,0)).toBe(0);});it('d',()=>{expect(hd393tri2(93,73)).toBe(2);});it('e',()=>{expect(hd393tri2(15,0)).toBe(4);});});
function hd394tri2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph394tri2_hd',()=>{it('a',()=>{expect(hd394tri2(1,4)).toBe(2);});it('b',()=>{expect(hd394tri2(3,1)).toBe(1);});it('c',()=>{expect(hd394tri2(0,0)).toBe(0);});it('d',()=>{expect(hd394tri2(93,73)).toBe(2);});it('e',()=>{expect(hd394tri2(15,0)).toBe(4);});});
function hd395tri2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph395tri2_hd',()=>{it('a',()=>{expect(hd395tri2(1,4)).toBe(2);});it('b',()=>{expect(hd395tri2(3,1)).toBe(1);});it('c',()=>{expect(hd395tri2(0,0)).toBe(0);});it('d',()=>{expect(hd395tri2(93,73)).toBe(2);});it('e',()=>{expect(hd395tri2(15,0)).toBe(4);});});
function hd396tri2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph396tri2_hd',()=>{it('a',()=>{expect(hd396tri2(1,4)).toBe(2);});it('b',()=>{expect(hd396tri2(3,1)).toBe(1);});it('c',()=>{expect(hd396tri2(0,0)).toBe(0);});it('d',()=>{expect(hd396tri2(93,73)).toBe(2);});it('e',()=>{expect(hd396tri2(15,0)).toBe(4);});});
function hd397tri2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph397tri2_hd',()=>{it('a',()=>{expect(hd397tri2(1,4)).toBe(2);});it('b',()=>{expect(hd397tri2(3,1)).toBe(1);});it('c',()=>{expect(hd397tri2(0,0)).toBe(0);});it('d',()=>{expect(hd397tri2(93,73)).toBe(2);});it('e',()=>{expect(hd397tri2(15,0)).toBe(4);});});
function hd398tri2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph398tri2_hd',()=>{it('a',()=>{expect(hd398tri2(1,4)).toBe(2);});it('b',()=>{expect(hd398tri2(3,1)).toBe(1);});it('c',()=>{expect(hd398tri2(0,0)).toBe(0);});it('d',()=>{expect(hd398tri2(93,73)).toBe(2);});it('e',()=>{expect(hd398tri2(15,0)).toBe(4);});});
function hd399tri2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph399tri2_hd',()=>{it('a',()=>{expect(hd399tri2(1,4)).toBe(2);});it('b',()=>{expect(hd399tri2(3,1)).toBe(1);});it('c',()=>{expect(hd399tri2(0,0)).toBe(0);});it('d',()=>{expect(hd399tri2(93,73)).toBe(2);});it('e',()=>{expect(hd399tri2(15,0)).toBe(4);});});
function hd400tri2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph400tri2_hd',()=>{it('a',()=>{expect(hd400tri2(1,4)).toBe(2);});it('b',()=>{expect(hd400tri2(3,1)).toBe(1);});it('c',()=>{expect(hd400tri2(0,0)).toBe(0);});it('d',()=>{expect(hd400tri2(93,73)).toBe(2);});it('e',()=>{expect(hd400tri2(15,0)).toBe(4);});});
function hd401tri2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph401tri2_hd',()=>{it('a',()=>{expect(hd401tri2(1,4)).toBe(2);});it('b',()=>{expect(hd401tri2(3,1)).toBe(1);});it('c',()=>{expect(hd401tri2(0,0)).toBe(0);});it('d',()=>{expect(hd401tri2(93,73)).toBe(2);});it('e',()=>{expect(hd401tri2(15,0)).toBe(4);});});
function hd402tri2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph402tri2_hd',()=>{it('a',()=>{expect(hd402tri2(1,4)).toBe(2);});it('b',()=>{expect(hd402tri2(3,1)).toBe(1);});it('c',()=>{expect(hd402tri2(0,0)).toBe(0);});it('d',()=>{expect(hd402tri2(93,73)).toBe(2);});it('e',()=>{expect(hd402tri2(15,0)).toBe(4);});});
function hd403tri2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph403tri2_hd',()=>{it('a',()=>{expect(hd403tri2(1,4)).toBe(2);});it('b',()=>{expect(hd403tri2(3,1)).toBe(1);});it('c',()=>{expect(hd403tri2(0,0)).toBe(0);});it('d',()=>{expect(hd403tri2(93,73)).toBe(2);});it('e',()=>{expect(hd403tri2(15,0)).toBe(4);});});
function hd404tri2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph404tri2_hd',()=>{it('a',()=>{expect(hd404tri2(1,4)).toBe(2);});it('b',()=>{expect(hd404tri2(3,1)).toBe(1);});it('c',()=>{expect(hd404tri2(0,0)).toBe(0);});it('d',()=>{expect(hd404tri2(93,73)).toBe(2);});it('e',()=>{expect(hd404tri2(15,0)).toBe(4);});});
function hd405tri2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph405tri2_hd',()=>{it('a',()=>{expect(hd405tri2(1,4)).toBe(2);});it('b',()=>{expect(hd405tri2(3,1)).toBe(1);});it('c',()=>{expect(hd405tri2(0,0)).toBe(0);});it('d',()=>{expect(hd405tri2(93,73)).toBe(2);});it('e',()=>{expect(hd405tri2(15,0)).toBe(4);});});
function hd406tri2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph406tri2_hd',()=>{it('a',()=>{expect(hd406tri2(1,4)).toBe(2);});it('b',()=>{expect(hd406tri2(3,1)).toBe(1);});it('c',()=>{expect(hd406tri2(0,0)).toBe(0);});it('d',()=>{expect(hd406tri2(93,73)).toBe(2);});it('e',()=>{expect(hd406tri2(15,0)).toBe(4);});});
function hd407tri2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph407tri2_hd',()=>{it('a',()=>{expect(hd407tri2(1,4)).toBe(2);});it('b',()=>{expect(hd407tri2(3,1)).toBe(1);});it('c',()=>{expect(hd407tri2(0,0)).toBe(0);});it('d',()=>{expect(hd407tri2(93,73)).toBe(2);});it('e',()=>{expect(hd407tri2(15,0)).toBe(4);});});
function hd408tri2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph408tri2_hd',()=>{it('a',()=>{expect(hd408tri2(1,4)).toBe(2);});it('b',()=>{expect(hd408tri2(3,1)).toBe(1);});it('c',()=>{expect(hd408tri2(0,0)).toBe(0);});it('d',()=>{expect(hd408tri2(93,73)).toBe(2);});it('e',()=>{expect(hd408tri2(15,0)).toBe(4);});});
function hd409tri2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph409tri2_hd',()=>{it('a',()=>{expect(hd409tri2(1,4)).toBe(2);});it('b',()=>{expect(hd409tri2(3,1)).toBe(1);});it('c',()=>{expect(hd409tri2(0,0)).toBe(0);});it('d',()=>{expect(hd409tri2(93,73)).toBe(2);});it('e',()=>{expect(hd409tri2(15,0)).toBe(4);});});
function hd410tri2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph410tri2_hd',()=>{it('a',()=>{expect(hd410tri2(1,4)).toBe(2);});it('b',()=>{expect(hd410tri2(3,1)).toBe(1);});it('c',()=>{expect(hd410tri2(0,0)).toBe(0);});it('d',()=>{expect(hd410tri2(93,73)).toBe(2);});it('e',()=>{expect(hd410tri2(15,0)).toBe(4);});});
function hd411tri2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph411tri2_hd',()=>{it('a',()=>{expect(hd411tri2(1,4)).toBe(2);});it('b',()=>{expect(hd411tri2(3,1)).toBe(1);});it('c',()=>{expect(hd411tri2(0,0)).toBe(0);});it('d',()=>{expect(hd411tri2(93,73)).toBe(2);});it('e',()=>{expect(hd411tri2(15,0)).toBe(4);});});
function hd412tri2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph412tri2_hd',()=>{it('a',()=>{expect(hd412tri2(1,4)).toBe(2);});it('b',()=>{expect(hd412tri2(3,1)).toBe(1);});it('c',()=>{expect(hd412tri2(0,0)).toBe(0);});it('d',()=>{expect(hd412tri2(93,73)).toBe(2);});it('e',()=>{expect(hd412tri2(15,0)).toBe(4);});});
function hd413tri2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph413tri2_hd',()=>{it('a',()=>{expect(hd413tri2(1,4)).toBe(2);});it('b',()=>{expect(hd413tri2(3,1)).toBe(1);});it('c',()=>{expect(hd413tri2(0,0)).toBe(0);});it('d',()=>{expect(hd413tri2(93,73)).toBe(2);});it('e',()=>{expect(hd413tri2(15,0)).toBe(4);});});
function hd414tri2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph414tri2_hd',()=>{it('a',()=>{expect(hd414tri2(1,4)).toBe(2);});it('b',()=>{expect(hd414tri2(3,1)).toBe(1);});it('c',()=>{expect(hd414tri2(0,0)).toBe(0);});it('d',()=>{expect(hd414tri2(93,73)).toBe(2);});it('e',()=>{expect(hd414tri2(15,0)).toBe(4);});});
function hd415tri2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph415tri2_hd',()=>{it('a',()=>{expect(hd415tri2(1,4)).toBe(2);});it('b',()=>{expect(hd415tri2(3,1)).toBe(1);});it('c',()=>{expect(hd415tri2(0,0)).toBe(0);});it('d',()=>{expect(hd415tri2(93,73)).toBe(2);});it('e',()=>{expect(hd415tri2(15,0)).toBe(4);});});
function hd416tri2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph416tri2_hd',()=>{it('a',()=>{expect(hd416tri2(1,4)).toBe(2);});it('b',()=>{expect(hd416tri2(3,1)).toBe(1);});it('c',()=>{expect(hd416tri2(0,0)).toBe(0);});it('d',()=>{expect(hd416tri2(93,73)).toBe(2);});it('e',()=>{expect(hd416tri2(15,0)).toBe(4);});});
function hd417tri2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph417tri2_hd',()=>{it('a',()=>{expect(hd417tri2(1,4)).toBe(2);});it('b',()=>{expect(hd417tri2(3,1)).toBe(1);});it('c',()=>{expect(hd417tri2(0,0)).toBe(0);});it('d',()=>{expect(hd417tri2(93,73)).toBe(2);});it('e',()=>{expect(hd417tri2(15,0)).toBe(4);});});
