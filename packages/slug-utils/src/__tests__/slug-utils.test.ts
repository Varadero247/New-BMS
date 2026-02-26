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
