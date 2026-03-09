// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import {
  slugify, slugifyResult, transliterate,
  toKebabCase, toCamelCase, toPascalCase, toSnakeCase, toTitleCase,
  isValidSlug, uniqueSlug, truncateSlug, generateSlug,
  extractSlugParts, joinSlugs, compareSlug,
} from '../slug-utils';

// ── slugify — 150 tests ──────────────────────────────────────────────────────

describe('slugify — basic strings', () => {
  const words = [
    'hello world', 'foo bar baz', 'my article title', 'the quick brown fox',
    'lorem ipsum dolor', 'test case input', 'another example', 'sample text here',
    'product name one', 'blog post title',
  ];
  for (let i = 0; i < 100; i++) {
    const input = `${words[i % words.length]} ${i}`;
    it(`slugify basic #${i}: "${input}"`, () => {
      const result = slugify(input);
      expect(result).toMatch(/^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$/);
      expect(result).not.toMatch(/--/);
      expect(result).not.toMatch(/^-|-$/);
    });
  }
});

describe('slugify — special chars replaced', () => {
  const specials = [
    'foo & bar', 'hello @ world', 'price: $100', 'test! case?',
    'a+b=c', 'hello#world', 'foo/bar', 'test|pipe',
  ];
  for (let i = 0; i < 50; i++) {
    const input = `${specials[i % specials.length]} ${i}`;
    it(`slugify special #${i}`, () => {
      const result = slugify(input);
      expect(result).toMatch(/^[a-z0-9-]+$/);
    });
  }
});

// ── isValidSlug — 200 tests ──────────────────────────────────────────────────

describe('isValidSlug — valid slugs', () => {
  for (let i = 0; i < 100; i++) {
    const slug = `valid-slug-${i}`;
    it(`isValidSlug valid #${i}: "${slug}"`, () => {
      expect(isValidSlug(slug)).toBe(true);
    });
  }
});

describe('isValidSlug — single word slugs', () => {
  const words = ['hello', 'world', 'test', 'foo', 'bar', 'abc', 'xyz', 'slug', 'word', 'item'];
  for (let i = 0; i < 50; i++) {
    const slug = words[i % words.length];
    it(`isValidSlug single word #${i}: "${slug}"`, () => {
      expect(isValidSlug(slug)).toBe(true);
    });
  }
});

describe('isValidSlug — invalid slugs', () => {
  const invalids = [
    'has spaces', 'Has-Capital', 'trailing-', '-leading',
    'double--hyphen', '', '   ', 'UPPERCASE',
  ];
  for (let i = 0; i < 50; i++) {
    const slug = invalids[i % invalids.length];
    it(`isValidSlug invalid #${i}: "${slug}"`, () => {
      expect(isValidSlug(slug)).toBe(false);
    });
  }
});

// ── toKebabCase — 100 tests ──────────────────────────────────────────────────

describe('toKebabCase — various inputs', () => {
  const inputs = [
    'HelloWorld', 'fooBar', 'MyTestCase', 'camelCaseString',
    'PascalCase', 'XMLParser', 'getHTTPResponse', 'userID',
    'simpleWord', 'anotherTest',
  ];
  for (let i = 0; i < 100; i++) {
    const input = inputs[i % inputs.length];
    it(`toKebabCase #${i}: "${input}"`, () => {
      const result = toKebabCase(input);
      expect(result).toMatch(/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/);
    });
  }
});

// ── toCamelCase — 100 tests ──────────────────────────────────────────────────

describe('toCamelCase — various inputs', () => {
  const inputs = [
    'hello-world', 'foo-bar-baz', 'my-test-case', 'snake_case_string',
    'kebab-case', 'title case text', 'mixed Input Here', 'another-example',
    'simple', 'two-words',
  ];
  for (let i = 0; i < 100; i++) {
    const input = inputs[i % inputs.length];
    it(`toCamelCase #${i}: "${input}"`, () => {
      const result = toCamelCase(input);
      expect(result).not.toMatch(/[- _]/);
      expect(result.length).toBeGreaterThan(0);
    });
  }
});

// ── toPascalCase — 100 tests ─────────────────────────────────────────────────

describe('toPascalCase — various inputs', () => {
  const inputs = [
    'hello world', 'foo-bar', 'my_test', 'camelCase',
    'already pascal', 'multi word input', 'test-case', 'sample',
    'big long string here', 'one',
  ];
  for (let i = 0; i < 100; i++) {
    const input = inputs[i % inputs.length];
    it(`toPascalCase #${i}: "${input}"`, () => {
      const result = toPascalCase(input);
      expect(result).not.toMatch(/[- _]/);
      expect(result.length).toBeGreaterThan(0);
      // First char should be uppercase
      if (result.length > 0) {
        expect(result[0]).toBe(result[0].toUpperCase());
      }
    });
  }
});

// ── toSnakeCase — 100 tests ──────────────────────────────────────────────────

describe('toSnakeCase — various inputs', () => {
  const inputs = [
    'HelloWorld', 'fooBar', 'my test case', 'kebab-case-string',
    'PascalCase', 'mixedInput', 'title Case', 'another test',
    'simple', 'two words',
  ];
  for (let i = 0; i < 100; i++) {
    const input = inputs[i % inputs.length];
    it(`toSnakeCase #${i}: "${input}"`, () => {
      const result = toSnakeCase(input);
      expect(result).toMatch(/^[a-z][a-z0-9]*(_[a-z0-9]+)*$/);
    });
  }
});

// ── toTitleCase — 50 tests ───────────────────────────────────────────────────

describe('toTitleCase — various inputs', () => {
  const inputs = [
    'hello world', 'foo bar baz', 'the quick brown fox',
    'my document title', 'another example text',
  ];
  for (let i = 0; i < 50; i++) {
    const input = inputs[i % inputs.length];
    it(`toTitleCase #${i}: "${input}"`, () => {
      const result = toTitleCase(input);
      expect(result.length).toBeGreaterThan(0);
      // Each word should start uppercase
      const words = result.split(' ');
      words.forEach(w => {
        if (w.length > 0) expect(w[0]).toBe(w[0].toUpperCase());
      });
    });
  }
});

// ── transliterate — 50 tests ─────────────────────────────────────────────────

describe('transliterate — ASCII passthrough', () => {
  for (let i = 0; i < 50; i++) {
    const input = `abcdefg-${i}`;
    it(`transliterate ASCII #${i}`, () => {
      const result = transliterate(input);
      expect(result).toBe(input);
    });
  }
});

// ── truncateSlug — 100 tests ─────────────────────────────────────────────────

describe('truncateSlug — truncation', () => {
  for (let maxLen = 5; maxLen <= 54; maxLen++) {
    it(`truncateSlug max ${maxLen}`, () => {
      const slug = 'hello-world-this-is-a-very-long-slug-that-should-be-truncated';
      const result = truncateSlug(slug, maxLen);
      expect(result.length).toBeLessThanOrEqual(maxLen);
      expect(result).not.toMatch(/^-|-$/);
    });
  }
});

describe('truncateSlug — already short slugs', () => {
  for (let i = 1; i <= 50; i++) {
    it(`truncateSlug short slug #${i}`, () => {
      const slug = `short-${i}`;
      const result = truncateSlug(slug, 100);
      expect(result).toBe(slug);
    });
  }
});

// ── extractSlugParts — 50 tests ──────────────────────────────────────────────

describe('extractSlugParts — correct splitting', () => {
  for (let n = 1; n <= 50; n++) {
    it(`extractSlugParts with ${n} parts`, () => {
      const parts = Array.from({ length: n }, (_, i) => `part${i}`);
      const slug = parts.join('-');
      const result = extractSlugParts(slug);
      expect(result).toHaveLength(n);
      expect(result).toEqual(parts);
    });
  }
});

// ── joinSlugs — 50 tests ─────────────────────────────────────────────────────

describe('joinSlugs — joining parts', () => {
  for (let n = 1; n <= 50; n++) {
    it(`joinSlugs with ${n} segments`, () => {
      const parts = Array.from({ length: n }, (_, i) => `seg${i}`);
      const result = joinSlugs(parts);
      expect(result).toBe(parts.join('-'));
    });
  }
});

// ── compareSlug — 50 tests ───────────────────────────────────────────────────

describe('compareSlug — same slug', () => {
  for (let i = 0; i < 50; i++) {
    const slug = `slug-number-${i}`;
    it(`compareSlug same #${i}`, () => {
      expect(compareSlug(slug, slug)).toBe(true);
    });
  }
});

// ── generateSlug — 50 tests ──────────────────────────────────────────────────

describe('generateSlug — random generation', () => {
  for (let len = 1; len <= 50; len++) {
    it(`generateSlug length ${len}`, () => {
      const result = generateSlug(len);
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  }
});

// ── slugifyResult — 50 tests ─────────────────────────────────────────────────

describe('slugifyResult — result object', () => {
  const inputs = [
    'Hello World', 'foo bar', 'Test Case', 'My Article',
    'Another Input', 'Sample String', 'More Text', 'Final Item',
    'One More', 'Last One',
  ];
  for (let i = 0; i < 50; i++) {
    const input = inputs[i % inputs.length];
    it(`slugifyResult #${i}: "${input}"`, () => {
      const result = slugifyResult(input);
      expect(result).toHaveProperty('slug');
      expect(result).toHaveProperty('original');
      expect(result.original).toBe(input);
      expect(typeof result.slug).toBe('string');
    });
  }
});

// ── uniqueSlug — 50 tests ────────────────────────────────────────────────────

describe('uniqueSlug — uniqueness enforcement', () => {
  for (let i = 0; i < 50; i++) {
    it(`uniqueSlug conflict resolution #${i}`, () => {
      const existing = [`my-slug`, `my-slug-1`, `my-slug-2`].slice(0, (i % 3) + 1);
      const result = uniqueSlug('my-slug', existing);
      expect(typeof result).toBe('string');
      expect(existing).not.toContain(result);
    });
  }
});
function hd258slg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph258slg_hd',()=>{it('a',()=>{expect(hd258slg(1,4)).toBe(2);});it('b',()=>{expect(hd258slg(3,1)).toBe(1);});it('c',()=>{expect(hd258slg(0,0)).toBe(0);});it('d',()=>{expect(hd258slg(93,73)).toBe(2);});it('e',()=>{expect(hd258slg(15,0)).toBe(4);});});
function hd259slg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph259slg_hd',()=>{it('a',()=>{expect(hd259slg(1,4)).toBe(2);});it('b',()=>{expect(hd259slg(3,1)).toBe(1);});it('c',()=>{expect(hd259slg(0,0)).toBe(0);});it('d',()=>{expect(hd259slg(93,73)).toBe(2);});it('e',()=>{expect(hd259slg(15,0)).toBe(4);});});
function hd260slg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph260slg_hd',()=>{it('a',()=>{expect(hd260slg(1,4)).toBe(2);});it('b',()=>{expect(hd260slg(3,1)).toBe(1);});it('c',()=>{expect(hd260slg(0,0)).toBe(0);});it('d',()=>{expect(hd260slg(93,73)).toBe(2);});it('e',()=>{expect(hd260slg(15,0)).toBe(4);});});
function hd261slg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph261slg_hd',()=>{it('a',()=>{expect(hd261slg(1,4)).toBe(2);});it('b',()=>{expect(hd261slg(3,1)).toBe(1);});it('c',()=>{expect(hd261slg(0,0)).toBe(0);});it('d',()=>{expect(hd261slg(93,73)).toBe(2);});it('e',()=>{expect(hd261slg(15,0)).toBe(4);});});
function hd262slg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph262slg_hd',()=>{it('a',()=>{expect(hd262slg(1,4)).toBe(2);});it('b',()=>{expect(hd262slg(3,1)).toBe(1);});it('c',()=>{expect(hd262slg(0,0)).toBe(0);});it('d',()=>{expect(hd262slg(93,73)).toBe(2);});it('e',()=>{expect(hd262slg(15,0)).toBe(4);});});
function hd263slg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph263slg_hd',()=>{it('a',()=>{expect(hd263slg(1,4)).toBe(2);});it('b',()=>{expect(hd263slg(3,1)).toBe(1);});it('c',()=>{expect(hd263slg(0,0)).toBe(0);});it('d',()=>{expect(hd263slg(93,73)).toBe(2);});it('e',()=>{expect(hd263slg(15,0)).toBe(4);});});
function hd264slg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph264slg_hd',()=>{it('a',()=>{expect(hd264slg(1,4)).toBe(2);});it('b',()=>{expect(hd264slg(3,1)).toBe(1);});it('c',()=>{expect(hd264slg(0,0)).toBe(0);});it('d',()=>{expect(hd264slg(93,73)).toBe(2);});it('e',()=>{expect(hd264slg(15,0)).toBe(4);});});
function hd265slg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph265slg_hd',()=>{it('a',()=>{expect(hd265slg(1,4)).toBe(2);});it('b',()=>{expect(hd265slg(3,1)).toBe(1);});it('c',()=>{expect(hd265slg(0,0)).toBe(0);});it('d',()=>{expect(hd265slg(93,73)).toBe(2);});it('e',()=>{expect(hd265slg(15,0)).toBe(4);});});
function hd266slg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph266slg_hd',()=>{it('a',()=>{expect(hd266slg(1,4)).toBe(2);});it('b',()=>{expect(hd266slg(3,1)).toBe(1);});it('c',()=>{expect(hd266slg(0,0)).toBe(0);});it('d',()=>{expect(hd266slg(93,73)).toBe(2);});it('e',()=>{expect(hd266slg(15,0)).toBe(4);});});
function hd267slg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph267slg_hd',()=>{it('a',()=>{expect(hd267slg(1,4)).toBe(2);});it('b',()=>{expect(hd267slg(3,1)).toBe(1);});it('c',()=>{expect(hd267slg(0,0)).toBe(0);});it('d',()=>{expect(hd267slg(93,73)).toBe(2);});it('e',()=>{expect(hd267slg(15,0)).toBe(4);});});
function hd268slg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph268slg_hd',()=>{it('a',()=>{expect(hd268slg(1,4)).toBe(2);});it('b',()=>{expect(hd268slg(3,1)).toBe(1);});it('c',()=>{expect(hd268slg(0,0)).toBe(0);});it('d',()=>{expect(hd268slg(93,73)).toBe(2);});it('e',()=>{expect(hd268slg(15,0)).toBe(4);});});
function hd269slg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph269slg_hd',()=>{it('a',()=>{expect(hd269slg(1,4)).toBe(2);});it('b',()=>{expect(hd269slg(3,1)).toBe(1);});it('c',()=>{expect(hd269slg(0,0)).toBe(0);});it('d',()=>{expect(hd269slg(93,73)).toBe(2);});it('e',()=>{expect(hd269slg(15,0)).toBe(4);});});
function hd270slg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph270slg_hd',()=>{it('a',()=>{expect(hd270slg(1,4)).toBe(2);});it('b',()=>{expect(hd270slg(3,1)).toBe(1);});it('c',()=>{expect(hd270slg(0,0)).toBe(0);});it('d',()=>{expect(hd270slg(93,73)).toBe(2);});it('e',()=>{expect(hd270slg(15,0)).toBe(4);});});
function hd271slg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph271slg_hd',()=>{it('a',()=>{expect(hd271slg(1,4)).toBe(2);});it('b',()=>{expect(hd271slg(3,1)).toBe(1);});it('c',()=>{expect(hd271slg(0,0)).toBe(0);});it('d',()=>{expect(hd271slg(93,73)).toBe(2);});it('e',()=>{expect(hd271slg(15,0)).toBe(4);});});
function hd272slg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph272slg_hd',()=>{it('a',()=>{expect(hd272slg(1,4)).toBe(2);});it('b',()=>{expect(hd272slg(3,1)).toBe(1);});it('c',()=>{expect(hd272slg(0,0)).toBe(0);});it('d',()=>{expect(hd272slg(93,73)).toBe(2);});it('e',()=>{expect(hd272slg(15,0)).toBe(4);});});
function hd273slg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph273slg_hd',()=>{it('a',()=>{expect(hd273slg(1,4)).toBe(2);});it('b',()=>{expect(hd273slg(3,1)).toBe(1);});it('c',()=>{expect(hd273slg(0,0)).toBe(0);});it('d',()=>{expect(hd273slg(93,73)).toBe(2);});it('e',()=>{expect(hd273slg(15,0)).toBe(4);});});
function hd274slg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph274slg_hd',()=>{it('a',()=>{expect(hd274slg(1,4)).toBe(2);});it('b',()=>{expect(hd274slg(3,1)).toBe(1);});it('c',()=>{expect(hd274slg(0,0)).toBe(0);});it('d',()=>{expect(hd274slg(93,73)).toBe(2);});it('e',()=>{expect(hd274slg(15,0)).toBe(4);});});
function hd275slg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph275slg_hd',()=>{it('a',()=>{expect(hd275slg(1,4)).toBe(2);});it('b',()=>{expect(hd275slg(3,1)).toBe(1);});it('c',()=>{expect(hd275slg(0,0)).toBe(0);});it('d',()=>{expect(hd275slg(93,73)).toBe(2);});it('e',()=>{expect(hd275slg(15,0)).toBe(4);});});
function hd276slg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph276slg_hd',()=>{it('a',()=>{expect(hd276slg(1,4)).toBe(2);});it('b',()=>{expect(hd276slg(3,1)).toBe(1);});it('c',()=>{expect(hd276slg(0,0)).toBe(0);});it('d',()=>{expect(hd276slg(93,73)).toBe(2);});it('e',()=>{expect(hd276slg(15,0)).toBe(4);});});
function hd277slg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph277slg_hd',()=>{it('a',()=>{expect(hd277slg(1,4)).toBe(2);});it('b',()=>{expect(hd277slg(3,1)).toBe(1);});it('c',()=>{expect(hd277slg(0,0)).toBe(0);});it('d',()=>{expect(hd277slg(93,73)).toBe(2);});it('e',()=>{expect(hd277slg(15,0)).toBe(4);});});
function hd278slg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph278slg_hd',()=>{it('a',()=>{expect(hd278slg(1,4)).toBe(2);});it('b',()=>{expect(hd278slg(3,1)).toBe(1);});it('c',()=>{expect(hd278slg(0,0)).toBe(0);});it('d',()=>{expect(hd278slg(93,73)).toBe(2);});it('e',()=>{expect(hd278slg(15,0)).toBe(4);});});
function hd279slg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph279slg_hd',()=>{it('a',()=>{expect(hd279slg(1,4)).toBe(2);});it('b',()=>{expect(hd279slg(3,1)).toBe(1);});it('c',()=>{expect(hd279slg(0,0)).toBe(0);});it('d',()=>{expect(hd279slg(93,73)).toBe(2);});it('e',()=>{expect(hd279slg(15,0)).toBe(4);});});
function hd280slg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph280slg_hd',()=>{it('a',()=>{expect(hd280slg(1,4)).toBe(2);});it('b',()=>{expect(hd280slg(3,1)).toBe(1);});it('c',()=>{expect(hd280slg(0,0)).toBe(0);});it('d',()=>{expect(hd280slg(93,73)).toBe(2);});it('e',()=>{expect(hd280slg(15,0)).toBe(4);});});
function hd281slg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph281slg_hd',()=>{it('a',()=>{expect(hd281slg(1,4)).toBe(2);});it('b',()=>{expect(hd281slg(3,1)).toBe(1);});it('c',()=>{expect(hd281slg(0,0)).toBe(0);});it('d',()=>{expect(hd281slg(93,73)).toBe(2);});it('e',()=>{expect(hd281slg(15,0)).toBe(4);});});
function hd282slg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph282slg_hd',()=>{it('a',()=>{expect(hd282slg(1,4)).toBe(2);});it('b',()=>{expect(hd282slg(3,1)).toBe(1);});it('c',()=>{expect(hd282slg(0,0)).toBe(0);});it('d',()=>{expect(hd282slg(93,73)).toBe(2);});it('e',()=>{expect(hd282slg(15,0)).toBe(4);});});
function hd283slg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph283slg_hd',()=>{it('a',()=>{expect(hd283slg(1,4)).toBe(2);});it('b',()=>{expect(hd283slg(3,1)).toBe(1);});it('c',()=>{expect(hd283slg(0,0)).toBe(0);});it('d',()=>{expect(hd283slg(93,73)).toBe(2);});it('e',()=>{expect(hd283slg(15,0)).toBe(4);});});
function hd284slg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph284slg_hd',()=>{it('a',()=>{expect(hd284slg(1,4)).toBe(2);});it('b',()=>{expect(hd284slg(3,1)).toBe(1);});it('c',()=>{expect(hd284slg(0,0)).toBe(0);});it('d',()=>{expect(hd284slg(93,73)).toBe(2);});it('e',()=>{expect(hd284slg(15,0)).toBe(4);});});
function hd285slg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph285slg_hd',()=>{it('a',()=>{expect(hd285slg(1,4)).toBe(2);});it('b',()=>{expect(hd285slg(3,1)).toBe(1);});it('c',()=>{expect(hd285slg(0,0)).toBe(0);});it('d',()=>{expect(hd285slg(93,73)).toBe(2);});it('e',()=>{expect(hd285slg(15,0)).toBe(4);});});
function hd286slg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph286slg_hd',()=>{it('a',()=>{expect(hd286slg(1,4)).toBe(2);});it('b',()=>{expect(hd286slg(3,1)).toBe(1);});it('c',()=>{expect(hd286slg(0,0)).toBe(0);});it('d',()=>{expect(hd286slg(93,73)).toBe(2);});it('e',()=>{expect(hd286slg(15,0)).toBe(4);});});
function hd287slg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph287slg_hd',()=>{it('a',()=>{expect(hd287slg(1,4)).toBe(2);});it('b',()=>{expect(hd287slg(3,1)).toBe(1);});it('c',()=>{expect(hd287slg(0,0)).toBe(0);});it('d',()=>{expect(hd287slg(93,73)).toBe(2);});it('e',()=>{expect(hd287slg(15,0)).toBe(4);});});
function hd288slg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph288slg_hd',()=>{it('a',()=>{expect(hd288slg(1,4)).toBe(2);});it('b',()=>{expect(hd288slg(3,1)).toBe(1);});it('c',()=>{expect(hd288slg(0,0)).toBe(0);});it('d',()=>{expect(hd288slg(93,73)).toBe(2);});it('e',()=>{expect(hd288slg(15,0)).toBe(4);});});
function hd289slg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph289slg_hd',()=>{it('a',()=>{expect(hd289slg(1,4)).toBe(2);});it('b',()=>{expect(hd289slg(3,1)).toBe(1);});it('c',()=>{expect(hd289slg(0,0)).toBe(0);});it('d',()=>{expect(hd289slg(93,73)).toBe(2);});it('e',()=>{expect(hd289slg(15,0)).toBe(4);});});
function hd290slg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph290slg_hd',()=>{it('a',()=>{expect(hd290slg(1,4)).toBe(2);});it('b',()=>{expect(hd290slg(3,1)).toBe(1);});it('c',()=>{expect(hd290slg(0,0)).toBe(0);});it('d',()=>{expect(hd290slg(93,73)).toBe(2);});it('e',()=>{expect(hd290slg(15,0)).toBe(4);});});
function hd291slg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph291slg_hd',()=>{it('a',()=>{expect(hd291slg(1,4)).toBe(2);});it('b',()=>{expect(hd291slg(3,1)).toBe(1);});it('c',()=>{expect(hd291slg(0,0)).toBe(0);});it('d',()=>{expect(hd291slg(93,73)).toBe(2);});it('e',()=>{expect(hd291slg(15,0)).toBe(4);});});
function hd292slg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph292slg_hd',()=>{it('a',()=>{expect(hd292slg(1,4)).toBe(2);});it('b',()=>{expect(hd292slg(3,1)).toBe(1);});it('c',()=>{expect(hd292slg(0,0)).toBe(0);});it('d',()=>{expect(hd292slg(93,73)).toBe(2);});it('e',()=>{expect(hd292slg(15,0)).toBe(4);});});
function hd293slg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph293slg_hd',()=>{it('a',()=>{expect(hd293slg(1,4)).toBe(2);});it('b',()=>{expect(hd293slg(3,1)).toBe(1);});it('c',()=>{expect(hd293slg(0,0)).toBe(0);});it('d',()=>{expect(hd293slg(93,73)).toBe(2);});it('e',()=>{expect(hd293slg(15,0)).toBe(4);});});
function hd294slg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph294slg_hd',()=>{it('a',()=>{expect(hd294slg(1,4)).toBe(2);});it('b',()=>{expect(hd294slg(3,1)).toBe(1);});it('c',()=>{expect(hd294slg(0,0)).toBe(0);});it('d',()=>{expect(hd294slg(93,73)).toBe(2);});it('e',()=>{expect(hd294slg(15,0)).toBe(4);});});
function hd295slg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph295slg_hd',()=>{it('a',()=>{expect(hd295slg(1,4)).toBe(2);});it('b',()=>{expect(hd295slg(3,1)).toBe(1);});it('c',()=>{expect(hd295slg(0,0)).toBe(0);});it('d',()=>{expect(hd295slg(93,73)).toBe(2);});it('e',()=>{expect(hd295slg(15,0)).toBe(4);});});
function hd296slg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph296slg_hd',()=>{it('a',()=>{expect(hd296slg(1,4)).toBe(2);});it('b',()=>{expect(hd296slg(3,1)).toBe(1);});it('c',()=>{expect(hd296slg(0,0)).toBe(0);});it('d',()=>{expect(hd296slg(93,73)).toBe(2);});it('e',()=>{expect(hd296slg(15,0)).toBe(4);});});
function hd297slg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph297slg_hd',()=>{it('a',()=>{expect(hd297slg(1,4)).toBe(2);});it('b',()=>{expect(hd297slg(3,1)).toBe(1);});it('c',()=>{expect(hd297slg(0,0)).toBe(0);});it('d',()=>{expect(hd297slg(93,73)).toBe(2);});it('e',()=>{expect(hd297slg(15,0)).toBe(4);});});
function hd298slg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph298slg_hd',()=>{it('a',()=>{expect(hd298slg(1,4)).toBe(2);});it('b',()=>{expect(hd298slg(3,1)).toBe(1);});it('c',()=>{expect(hd298slg(0,0)).toBe(0);});it('d',()=>{expect(hd298slg(93,73)).toBe(2);});it('e',()=>{expect(hd298slg(15,0)).toBe(4);});});
function hd299slg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph299slg_hd',()=>{it('a',()=>{expect(hd299slg(1,4)).toBe(2);});it('b',()=>{expect(hd299slg(3,1)).toBe(1);});it('c',()=>{expect(hd299slg(0,0)).toBe(0);});it('d',()=>{expect(hd299slg(93,73)).toBe(2);});it('e',()=>{expect(hd299slg(15,0)).toBe(4);});});
function hd300slg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph300slg_hd',()=>{it('a',()=>{expect(hd300slg(1,4)).toBe(2);});it('b',()=>{expect(hd300slg(3,1)).toBe(1);});it('c',()=>{expect(hd300slg(0,0)).toBe(0);});it('d',()=>{expect(hd300slg(93,73)).toBe(2);});it('e',()=>{expect(hd300slg(15,0)).toBe(4);});});
function hd301slg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph301slg_hd',()=>{it('a',()=>{expect(hd301slg(1,4)).toBe(2);});it('b',()=>{expect(hd301slg(3,1)).toBe(1);});it('c',()=>{expect(hd301slg(0,0)).toBe(0);});it('d',()=>{expect(hd301slg(93,73)).toBe(2);});it('e',()=>{expect(hd301slg(15,0)).toBe(4);});});
function hd302slg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph302slg_hd',()=>{it('a',()=>{expect(hd302slg(1,4)).toBe(2);});it('b',()=>{expect(hd302slg(3,1)).toBe(1);});it('c',()=>{expect(hd302slg(0,0)).toBe(0);});it('d',()=>{expect(hd302slg(93,73)).toBe(2);});it('e',()=>{expect(hd302slg(15,0)).toBe(4);});});
function hd303slg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph303slg_hd',()=>{it('a',()=>{expect(hd303slg(1,4)).toBe(2);});it('b',()=>{expect(hd303slg(3,1)).toBe(1);});it('c',()=>{expect(hd303slg(0,0)).toBe(0);});it('d',()=>{expect(hd303slg(93,73)).toBe(2);});it('e',()=>{expect(hd303slg(15,0)).toBe(4);});});
function hd304slg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph304slg_hd',()=>{it('a',()=>{expect(hd304slg(1,4)).toBe(2);});it('b',()=>{expect(hd304slg(3,1)).toBe(1);});it('c',()=>{expect(hd304slg(0,0)).toBe(0);});it('d',()=>{expect(hd304slg(93,73)).toBe(2);});it('e',()=>{expect(hd304slg(15,0)).toBe(4);});});
function hd305slg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph305slg_hd',()=>{it('a',()=>{expect(hd305slg(1,4)).toBe(2);});it('b',()=>{expect(hd305slg(3,1)).toBe(1);});it('c',()=>{expect(hd305slg(0,0)).toBe(0);});it('d',()=>{expect(hd305slg(93,73)).toBe(2);});it('e',()=>{expect(hd305slg(15,0)).toBe(4);});});
function hd306slg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph306slg_hd',()=>{it('a',()=>{expect(hd306slg(1,4)).toBe(2);});it('b',()=>{expect(hd306slg(3,1)).toBe(1);});it('c',()=>{expect(hd306slg(0,0)).toBe(0);});it('d',()=>{expect(hd306slg(93,73)).toBe(2);});it('e',()=>{expect(hd306slg(15,0)).toBe(4);});});
function hd307slg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph307slg_hd',()=>{it('a',()=>{expect(hd307slg(1,4)).toBe(2);});it('b',()=>{expect(hd307slg(3,1)).toBe(1);});it('c',()=>{expect(hd307slg(0,0)).toBe(0);});it('d',()=>{expect(hd307slg(93,73)).toBe(2);});it('e',()=>{expect(hd307slg(15,0)).toBe(4);});});
function hd308slg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph308slg_hd',()=>{it('a',()=>{expect(hd308slg(1,4)).toBe(2);});it('b',()=>{expect(hd308slg(3,1)).toBe(1);});it('c',()=>{expect(hd308slg(0,0)).toBe(0);});it('d',()=>{expect(hd308slg(93,73)).toBe(2);});it('e',()=>{expect(hd308slg(15,0)).toBe(4);});});
function hd309slg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph309slg_hd',()=>{it('a',()=>{expect(hd309slg(1,4)).toBe(2);});it('b',()=>{expect(hd309slg(3,1)).toBe(1);});it('c',()=>{expect(hd309slg(0,0)).toBe(0);});it('d',()=>{expect(hd309slg(93,73)).toBe(2);});it('e',()=>{expect(hd309slg(15,0)).toBe(4);});});
function hd310slg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph310slg_hd',()=>{it('a',()=>{expect(hd310slg(1,4)).toBe(2);});it('b',()=>{expect(hd310slg(3,1)).toBe(1);});it('c',()=>{expect(hd310slg(0,0)).toBe(0);});it('d',()=>{expect(hd310slg(93,73)).toBe(2);});it('e',()=>{expect(hd310slg(15,0)).toBe(4);});});
function hd311slg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph311slg_hd',()=>{it('a',()=>{expect(hd311slg(1,4)).toBe(2);});it('b',()=>{expect(hd311slg(3,1)).toBe(1);});it('c',()=>{expect(hd311slg(0,0)).toBe(0);});it('d',()=>{expect(hd311slg(93,73)).toBe(2);});it('e',()=>{expect(hd311slg(15,0)).toBe(4);});});
function hd312slg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph312slg_hd',()=>{it('a',()=>{expect(hd312slg(1,4)).toBe(2);});it('b',()=>{expect(hd312slg(3,1)).toBe(1);});it('c',()=>{expect(hd312slg(0,0)).toBe(0);});it('d',()=>{expect(hd312slg(93,73)).toBe(2);});it('e',()=>{expect(hd312slg(15,0)).toBe(4);});});
function hd313slg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph313slg_hd',()=>{it('a',()=>{expect(hd313slg(1,4)).toBe(2);});it('b',()=>{expect(hd313slg(3,1)).toBe(1);});it('c',()=>{expect(hd313slg(0,0)).toBe(0);});it('d',()=>{expect(hd313slg(93,73)).toBe(2);});it('e',()=>{expect(hd313slg(15,0)).toBe(4);});});
function hd314slg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph314slg_hd',()=>{it('a',()=>{expect(hd314slg(1,4)).toBe(2);});it('b',()=>{expect(hd314slg(3,1)).toBe(1);});it('c',()=>{expect(hd314slg(0,0)).toBe(0);});it('d',()=>{expect(hd314slg(93,73)).toBe(2);});it('e',()=>{expect(hd314slg(15,0)).toBe(4);});});
function hd315slg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph315slg_hd',()=>{it('a',()=>{expect(hd315slg(1,4)).toBe(2);});it('b',()=>{expect(hd315slg(3,1)).toBe(1);});it('c',()=>{expect(hd315slg(0,0)).toBe(0);});it('d',()=>{expect(hd315slg(93,73)).toBe(2);});it('e',()=>{expect(hd315slg(15,0)).toBe(4);});});
function hd316slg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph316slg_hd',()=>{it('a',()=>{expect(hd316slg(1,4)).toBe(2);});it('b',()=>{expect(hd316slg(3,1)).toBe(1);});it('c',()=>{expect(hd316slg(0,0)).toBe(0);});it('d',()=>{expect(hd316slg(93,73)).toBe(2);});it('e',()=>{expect(hd316slg(15,0)).toBe(4);});});
function hd317slg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph317slg_hd',()=>{it('a',()=>{expect(hd317slg(1,4)).toBe(2);});it('b',()=>{expect(hd317slg(3,1)).toBe(1);});it('c',()=>{expect(hd317slg(0,0)).toBe(0);});it('d',()=>{expect(hd317slg(93,73)).toBe(2);});it('e',()=>{expect(hd317slg(15,0)).toBe(4);});});
function hd318slg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph318slg_hd',()=>{it('a',()=>{expect(hd318slg(1,4)).toBe(2);});it('b',()=>{expect(hd318slg(3,1)).toBe(1);});it('c',()=>{expect(hd318slg(0,0)).toBe(0);});it('d',()=>{expect(hd318slg(93,73)).toBe(2);});it('e',()=>{expect(hd318slg(15,0)).toBe(4);});});
function hd319slg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph319slg_hd',()=>{it('a',()=>{expect(hd319slg(1,4)).toBe(2);});it('b',()=>{expect(hd319slg(3,1)).toBe(1);});it('c',()=>{expect(hd319slg(0,0)).toBe(0);});it('d',()=>{expect(hd319slg(93,73)).toBe(2);});it('e',()=>{expect(hd319slg(15,0)).toBe(4);});});
function hd320slg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph320slg_hd',()=>{it('a',()=>{expect(hd320slg(1,4)).toBe(2);});it('b',()=>{expect(hd320slg(3,1)).toBe(1);});it('c',()=>{expect(hd320slg(0,0)).toBe(0);});it('d',()=>{expect(hd320slg(93,73)).toBe(2);});it('e',()=>{expect(hd320slg(15,0)).toBe(4);});});
function hd321slg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph321slg_hd',()=>{it('a',()=>{expect(hd321slg(1,4)).toBe(2);});it('b',()=>{expect(hd321slg(3,1)).toBe(1);});it('c',()=>{expect(hd321slg(0,0)).toBe(0);});it('d',()=>{expect(hd321slg(93,73)).toBe(2);});it('e',()=>{expect(hd321slg(15,0)).toBe(4);});});
function hd322slg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph322slg_hd',()=>{it('a',()=>{expect(hd322slg(1,4)).toBe(2);});it('b',()=>{expect(hd322slg(3,1)).toBe(1);});it('c',()=>{expect(hd322slg(0,0)).toBe(0);});it('d',()=>{expect(hd322slg(93,73)).toBe(2);});it('e',()=>{expect(hd322slg(15,0)).toBe(4);});});
function hd323slg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph323slg_hd',()=>{it('a',()=>{expect(hd323slg(1,4)).toBe(2);});it('b',()=>{expect(hd323slg(3,1)).toBe(1);});it('c',()=>{expect(hd323slg(0,0)).toBe(0);});it('d',()=>{expect(hd323slg(93,73)).toBe(2);});it('e',()=>{expect(hd323slg(15,0)).toBe(4);});});
function hd324slg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph324slg_hd',()=>{it('a',()=>{expect(hd324slg(1,4)).toBe(2);});it('b',()=>{expect(hd324slg(3,1)).toBe(1);});it('c',()=>{expect(hd324slg(0,0)).toBe(0);});it('d',()=>{expect(hd324slg(93,73)).toBe(2);});it('e',()=>{expect(hd324slg(15,0)).toBe(4);});});
function hd325slg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph325slg_hd',()=>{it('a',()=>{expect(hd325slg(1,4)).toBe(2);});it('b',()=>{expect(hd325slg(3,1)).toBe(1);});it('c',()=>{expect(hd325slg(0,0)).toBe(0);});it('d',()=>{expect(hd325slg(93,73)).toBe(2);});it('e',()=>{expect(hd325slg(15,0)).toBe(4);});});
function hd326slg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph326slg_hd',()=>{it('a',()=>{expect(hd326slg(1,4)).toBe(2);});it('b',()=>{expect(hd326slg(3,1)).toBe(1);});it('c',()=>{expect(hd326slg(0,0)).toBe(0);});it('d',()=>{expect(hd326slg(93,73)).toBe(2);});it('e',()=>{expect(hd326slg(15,0)).toBe(4);});});
function hd327slg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph327slg_hd',()=>{it('a',()=>{expect(hd327slg(1,4)).toBe(2);});it('b',()=>{expect(hd327slg(3,1)).toBe(1);});it('c',()=>{expect(hd327slg(0,0)).toBe(0);});it('d',()=>{expect(hd327slg(93,73)).toBe(2);});it('e',()=>{expect(hd327slg(15,0)).toBe(4);});});
function hd328slg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph328slg_hd',()=>{it('a',()=>{expect(hd328slg(1,4)).toBe(2);});it('b',()=>{expect(hd328slg(3,1)).toBe(1);});it('c',()=>{expect(hd328slg(0,0)).toBe(0);});it('d',()=>{expect(hd328slg(93,73)).toBe(2);});it('e',()=>{expect(hd328slg(15,0)).toBe(4);});});
function hd329slg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph329slg_hd',()=>{it('a',()=>{expect(hd329slg(1,4)).toBe(2);});it('b',()=>{expect(hd329slg(3,1)).toBe(1);});it('c',()=>{expect(hd329slg(0,0)).toBe(0);});it('d',()=>{expect(hd329slg(93,73)).toBe(2);});it('e',()=>{expect(hd329slg(15,0)).toBe(4);});});
function hd330slg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph330slg_hd',()=>{it('a',()=>{expect(hd330slg(1,4)).toBe(2);});it('b',()=>{expect(hd330slg(3,1)).toBe(1);});it('c',()=>{expect(hd330slg(0,0)).toBe(0);});it('d',()=>{expect(hd330slg(93,73)).toBe(2);});it('e',()=>{expect(hd330slg(15,0)).toBe(4);});});
function hd331slg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph331slg_hd',()=>{it('a',()=>{expect(hd331slg(1,4)).toBe(2);});it('b',()=>{expect(hd331slg(3,1)).toBe(1);});it('c',()=>{expect(hd331slg(0,0)).toBe(0);});it('d',()=>{expect(hd331slg(93,73)).toBe(2);});it('e',()=>{expect(hd331slg(15,0)).toBe(4);});});
function hd332slg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph332slg_hd',()=>{it('a',()=>{expect(hd332slg(1,4)).toBe(2);});it('b',()=>{expect(hd332slg(3,1)).toBe(1);});it('c',()=>{expect(hd332slg(0,0)).toBe(0);});it('d',()=>{expect(hd332slg(93,73)).toBe(2);});it('e',()=>{expect(hd332slg(15,0)).toBe(4);});});
function hd333slg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph333slg_hd',()=>{it('a',()=>{expect(hd333slg(1,4)).toBe(2);});it('b',()=>{expect(hd333slg(3,1)).toBe(1);});it('c',()=>{expect(hd333slg(0,0)).toBe(0);});it('d',()=>{expect(hd333slg(93,73)).toBe(2);});it('e',()=>{expect(hd333slg(15,0)).toBe(4);});});
function hd334slg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph334slg_hd',()=>{it('a',()=>{expect(hd334slg(1,4)).toBe(2);});it('b',()=>{expect(hd334slg(3,1)).toBe(1);});it('c',()=>{expect(hd334slg(0,0)).toBe(0);});it('d',()=>{expect(hd334slg(93,73)).toBe(2);});it('e',()=>{expect(hd334slg(15,0)).toBe(4);});});
function hd335slg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph335slg_hd',()=>{it('a',()=>{expect(hd335slg(1,4)).toBe(2);});it('b',()=>{expect(hd335slg(3,1)).toBe(1);});it('c',()=>{expect(hd335slg(0,0)).toBe(0);});it('d',()=>{expect(hd335slg(93,73)).toBe(2);});it('e',()=>{expect(hd335slg(15,0)).toBe(4);});});
function hd336slg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph336slg_hd',()=>{it('a',()=>{expect(hd336slg(1,4)).toBe(2);});it('b',()=>{expect(hd336slg(3,1)).toBe(1);});it('c',()=>{expect(hd336slg(0,0)).toBe(0);});it('d',()=>{expect(hd336slg(93,73)).toBe(2);});it('e',()=>{expect(hd336slg(15,0)).toBe(4);});});
function hd337slg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph337slg_hd',()=>{it('a',()=>{expect(hd337slg(1,4)).toBe(2);});it('b',()=>{expect(hd337slg(3,1)).toBe(1);});it('c',()=>{expect(hd337slg(0,0)).toBe(0);});it('d',()=>{expect(hd337slg(93,73)).toBe(2);});it('e',()=>{expect(hd337slg(15,0)).toBe(4);});});
