// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import {
  join,
  resolve,
  normalize,
  dirname,
  basename,
  extname,
  isAbsolute,
  relative,
  parse,
  format,
  joinUrl,
  getUrlPath,
  getUrlQuery,
  setUrlQuery,
  addQueryParam,
  removeQueryParam,
  getUrlSegments,
  parseUrl,
  globToRegex,
  matchGlob,
  filterByGlob,
  matchesAny,
  addExtension,
  changeExtension,
  stripExtension,
  ensureTrailingSlash,
  stripTrailingSlash,
  ensureLeadingSlash,
  isSubPath,
  commonAncestor,
  depth,
  segments,
  toPosix,
  toNamespaced,
  truncatePath,
} from '../path-utils';

// ─── Loop 1: join with i segments, check depth === i (i = 1..100) ────────────
describe('join + depth loop (i=1..100)', () => {
  for (let i = 1; i <= 100; i++) {
    it(`depth of join of ${i} segments equals ${i}`, () => {
      const parts = Array.from({ length: i }, (_, k) => `seg${k}`);
      const result = join(...parts);
      expect(depth(result)).toBe(i);
    });
  }
});

// ─── Loop 2: basename with extension (i=0..99) ───────────────────────────────
describe('basename with extension loop (i=0..99)', () => {
  for (let i = 0; i < 100; i++) {
    it(`basename strips extension for index ${i}`, () => {
      const name = `file${i}`;
      const ext = '.ts';
      const p = `/some/dir/${name}${ext}`;
      expect(basename(p, ext)).toBe(name);
    });
  }
});

// ─── Loop 3: matchGlob on generated paths (i=0..99) ─────────────────────────
describe('matchGlob loop (i=0..99)', () => {
  for (let i = 0; i < 100; i++) {
    it(`matchGlob matches src/module${i}/index.ts with src/*/index.ts`, () => {
      const p = `src/module${i}/index.ts`;
      expect(matchGlob(p, 'src/*/index.ts')).toBe(true);
    });
  }
});

// ─── Loop 4: addQueryParam roundtrip with removeQueryParam (i=0..99) ─────────
describe('addQueryParam + removeQueryParam roundtrip (i=0..99)', () => {
  for (let i = 0; i < 100; i++) {
    it(`roundtrip for param key${i}`, () => {
      const base = 'https://example.com/api/resource';
      const key = `key${i}`;
      const value = `value${i}`;
      const withParam = addQueryParam(base, key, value);
      expect(getUrlQuery(withParam)[key]).toBe(value);
      const removed = removeQueryParam(withParam, key);
      expect(getUrlQuery(removed)[key]).toBeUndefined();
    });
  }
});

// ─── Loop 5: depth of absolute path with i segments === i (i=1..100) ─────────
describe('depth of absolute path (i=1..100)', () => {
  for (let i = 1; i <= 100; i++) {
    it(`depth of /${Array.from({ length: i }, (_, k) => `s${k}`).join('/')} === ${i}`, () => {
      const p = '/' + Array.from({ length: i }, (_, k) => `s${k}`).join('/');
      expect(depth(p)).toBe(i);
    });
  }
});

// ─── Loop 6: globToRegex basic patterns (i=0..49) ───────────────────────────
describe('globToRegex basic patterns (i=0..49)', () => {
  for (let i = 0; i < 50; i++) {
    it(`globToRegex matches file${i}.ts with *.ts`, () => {
      const re = globToRegex('*.ts');
      expect(re.test(`file${i}.ts`)).toBe(true);
    });
  }
});

// ─── Loop 7: commonAncestor for pairs (i=0..49) ──────────────────────────────
describe('commonAncestor for pairs (i=0..49)', () => {
  for (let i = 0; i < 50; i++) {
    it(`commonAncestor of /root/branch${i}/a and /root/branch${i}/b is /root/branch${i}`, () => {
      const a = `/root/branch${i}/a`;
      const b = `/root/branch${i}/b`;
      const ancestor = commonAncestor([a, b]);
      expect(ancestor).toBe(`/root/branch${i}`);
    });
  }
});

// ─── Correctness tests for all functions ─────────────────────────────────────

// --- POSIX wrappers ---

describe('join', () => {
  it('joins simple segments', () => {
    expect(join('a', 'b', 'c')).toBe('a/b/c');
  });
  it('joins with absolute path', () => {
    expect(join('/foo', 'bar')).toBe('/foo/bar');
  });
  it('normalises double slashes', () => {
    expect(join('a/', '/b')).toBe('a/b');
  });
  it('handles single segment', () => {
    expect(join('hello')).toBe('hello');
  });
  it('handles empty string segments gracefully', () => {
    expect(join('a', '', 'b')).toBe('a/b');
  });
  it('returns posix slashes even on windows-style input', () => {
    const result = join('a', 'b');
    expect(result).not.toContain('\\');
  });
});

describe('resolve', () => {
  it('returns an absolute path', () => {
    const result = resolve('foo/bar');
    expect(result.startsWith('/')).toBe(true);
  });
  it('resolves relative segments', () => {
    const result = resolve('/a/b', '../c');
    expect(result).toBe('/a/c');
  });
  it('resolves to cwd for empty', () => {
    const result = resolve('');
    expect(result.startsWith('/')).toBe(true);
  });
});

describe('normalize', () => {
  it('resolves single dots', () => {
    expect(normalize('/a/./b')).toBe('/a/b');
  });
  it('resolves double dots', () => {
    expect(normalize('/a/b/../c')).toBe('/a/c');
  });
  it('handles trailing slash', () => {
    expect(normalize('/a/b/')).toBe('/a/b/');
  });
  it('collapses double slashes', () => {
    expect(normalize('/a//b')).toBe('/a/b');
  });
  it('returns posix slashes', () => {
    expect(normalize('a/b/c')).not.toContain('\\');
  });
});

describe('dirname', () => {
  it('returns directory of absolute path', () => {
    expect(dirname('/a/b/c.ts')).toBe('/a/b');
  });
  it('returns . for filename only', () => {
    expect(dirname('file.ts')).toBe('.');
  });
  it('returns / for root file', () => {
    expect(dirname('/file.ts')).toBe('/');
  });
  it('handles nested path', () => {
    expect(dirname('/a/b/c/d/e.txt')).toBe('/a/b/c/d');
  });
});

describe('basename', () => {
  it('returns filename from path', () => {
    expect(basename('/a/b/file.ts')).toBe('file.ts');
  });
  it('strips extension when provided', () => {
    expect(basename('/a/b/file.ts', '.ts')).toBe('file');
  });
  it('handles no extension', () => {
    expect(basename('/a/b/file')).toBe('file');
  });
  it('handles filename only', () => {
    expect(basename('file.txt')).toBe('file.txt');
  });
  it('does not strip wrong extension', () => {
    expect(basename('/a/file.ts', '.js')).toBe('file.ts');
  });
});

describe('extname', () => {
  it('returns extension with dot', () => {
    expect(extname('file.ts')).toBe('.ts');
  });
  it('returns empty for no extension', () => {
    expect(extname('file')).toBe('');
  });
  it('returns last extension for multiple dots', () => {
    expect(extname('file.test.ts')).toBe('.ts');
  });
  it('handles dotfile', () => {
    expect(extname('.gitignore')).toBe('');
  });
  it('handles path with directory', () => {
    expect(extname('/a/b/file.json')).toBe('.json');
  });
});

describe('isAbsolute', () => {
  it('returns true for absolute path', () => {
    expect(isAbsolute('/a/b')).toBe(true);
  });
  it('returns false for relative path', () => {
    expect(isAbsolute('a/b')).toBe(false);
  });
  it('returns false for empty string', () => {
    expect(isAbsolute('')).toBe(false);
  });
  it('returns true for root', () => {
    expect(isAbsolute('/')).toBe(true);
  });
});

describe('relative', () => {
  it('computes relative path', () => {
    expect(relative('/a/b', '/a/b/c/d')).toBe('c/d');
  });
  it('computes relative path upward', () => {
    expect(relative('/a/b/c', '/a/d')).toBe('../../d');
  });
  it('returns empty string for same path', () => {
    expect(relative('/a/b', '/a/b')).toBe('');
  });
  it('uses posix separators', () => {
    const result = relative('/a/b/c', '/a/b/d/e');
    expect(result).not.toContain('\\');
  });
});

describe('parse', () => {
  it('parses absolute path', () => {
    const p = parse('/home/user/file.txt');
    expect(p.root).toBe('/');
    expect(p.dir).toBe('/home/user');
    expect(p.base).toBe('file.txt');
    expect(p.name).toBe('file');
    expect(p.ext).toBe('.txt');
  });
  it('parses relative path', () => {
    const p = parse('a/b/c.ts');
    expect(p.base).toBe('c.ts');
    expect(p.name).toBe('c');
    expect(p.ext).toBe('.ts');
  });
  it('parses filename only', () => {
    const p = parse('file.json');
    expect(p.dir).toBe('');
    expect(p.base).toBe('file.json');
  });
  it('parses no-extension path', () => {
    const p = parse('/usr/local/bin/node');
    expect(p.ext).toBe('');
    expect(p.name).toBe('node');
  });
});

describe('format', () => {
  it('round-trips parse+format for absolute path', () => {
    const original = '/home/user/file.txt';
    expect(format(parse(original))).toBe(original);
  });
  it('produces a non-empty string', () => {
    const result = format({ root: '/', dir: '/a', base: 'b.ts', name: 'b', ext: '.ts' });
    expect(result.length).toBeGreaterThan(0);
  });
  it('uses posix slashes', () => {
    const result = format({ root: '/', dir: '/a/b', base: 'c.ts', name: 'c', ext: '.ts' });
    expect(result).not.toContain('\\');
  });
});

// --- URL Utilities ---

describe('parseUrl', () => {
  it('parses https URL correctly', () => {
    const p = parseUrl('https://example.com:8080/api/v1?foo=bar#section');
    expect(p.protocol).toBe('https:');
    expect(p.host).toBe('example.com');
    expect(p.port).toBe('8080');
    expect(p.pathname).toBe('/api/v1');
    expect(p.search).toBe('?foo=bar');
    expect(p.hash).toBe('#section');
  });
  it('parses URL without port', () => {
    const p = parseUrl('https://example.com/path');
    expect(p.host).toBe('example.com');
    expect(p.port).toBe('');
  });
  it('parses URL without protocol as pathname', () => {
    const p = parseUrl('/api/users');
    expect(p.protocol).toBe('');
    expect(p.pathname).toBe('/api/users');
  });
  it('parses URL with only query', () => {
    const p = parseUrl('https://example.com?x=1');
    expect(p.search).toBe('?x=1');
    expect(p.pathname).toBe('/');
  });
  it('parses URL with hash only', () => {
    const p = parseUrl('https://example.com/page#top');
    expect(p.hash).toBe('#top');
  });
  it('handles http protocol', () => {
    const p = parseUrl('http://localhost:3000/test');
    expect(p.protocol).toBe('http:');
    expect(p.port).toBe('3000');
  });
});

describe('joinUrl', () => {
  it('joins two path segments', () => {
    expect(joinUrl('/api', 'users')).toBe('/api/users');
  });
  it('avoids double slashes', () => {
    expect(joinUrl('/api/', '/users')).toBe('/api/users');
  });
  it('preserves protocol and host', () => {
    const result = joinUrl('https://example.com/api', 'users');
    expect(result.startsWith('https://example.com')).toBe(true);
    expect(result).toContain('/api/users');
  });
  it('handles empty parts array', () => {
    expect(joinUrl()).toBe('');
  });
  it('handles single part', () => {
    expect(joinUrl('/api/users')).toBe('/api/users');
  });
  it('joins three segments', () => {
    expect(joinUrl('/a', 'b', 'c')).toBe('/a/b/c');
  });
});

describe('getUrlPath', () => {
  it('extracts path from full URL', () => {
    expect(getUrlPath('https://example.com/api/v1?x=1')).toBe('/api/v1');
  });
  it('returns path for path-only string', () => {
    expect(getUrlPath('/api/users')).toBe('/api/users');
  });
  it('returns / when no path', () => {
    expect(getUrlPath('https://example.com')).toBe('/');
  });
  it('strips query and hash', () => {
    expect(getUrlPath('https://example.com/path?q=1#top')).toBe('/path');
  });
});

describe('getUrlQuery', () => {
  it('extracts single query param', () => {
    const q = getUrlQuery('https://example.com?foo=bar');
    expect(q.foo).toBe('bar');
  });
  it('extracts multiple query params', () => {
    const q = getUrlQuery('https://example.com?a=1&b=2&c=3');
    expect(q.a).toBe('1');
    expect(q.b).toBe('2');
    expect(q.c).toBe('3');
  });
  it('returns empty object when no query', () => {
    expect(getUrlQuery('https://example.com/path')).toEqual({});
  });
  it('decodes URI components', () => {
    const q = getUrlQuery('https://example.com?name=John%20Doe');
    expect(q.name).toBe('John Doe');
  });
  it('handles param with no value', () => {
    const q = getUrlQuery('https://example.com?flag');
    expect(q.flag).toBe('');
  });
});

describe('setUrlQuery', () => {
  it('sets query string on URL', () => {
    const result = setUrlQuery('https://example.com/path', { x: '1', y: '2' });
    const q = getUrlQuery(result);
    expect(q.x).toBe('1');
    expect(q.y).toBe('2');
  });
  it('replaces existing query', () => {
    const result = setUrlQuery('https://example.com/path?old=val', { new: 'value' });
    const q = getUrlQuery(result);
    expect(q.old).toBeUndefined();
    expect(q.new).toBe('value');
  });
  it('produces empty query string for empty params', () => {
    const result = setUrlQuery('https://example.com/path?x=1', {});
    expect(result).not.toContain('?');
  });
});

describe('addQueryParam', () => {
  it('adds param to URL without query', () => {
    const result = addQueryParam('https://example.com/path', 'page', '2');
    expect(getUrlQuery(result).page).toBe('2');
  });
  it('adds param to URL with existing query', () => {
    const result = addQueryParam('https://example.com/path?a=1', 'b', '2');
    const q = getUrlQuery(result);
    expect(q.a).toBe('1');
    expect(q.b).toBe('2');
  });
  it('overwrites existing param', () => {
    const result = addQueryParam('https://example.com/path?page=1', 'page', '2');
    expect(getUrlQuery(result).page).toBe('2');
  });
  it('preserves pathname', () => {
    const result = addQueryParam('https://example.com/api/users', 'sort', 'asc');
    expect(getUrlPath(result)).toBe('/api/users');
  });
});

describe('removeQueryParam', () => {
  it('removes a param', () => {
    const result = removeQueryParam('https://example.com?foo=1&bar=2', 'foo');
    const q = getUrlQuery(result);
    expect(q.foo).toBeUndefined();
    expect(q.bar).toBe('2');
  });
  it('returns URL unchanged if param not present', () => {
    const url = 'https://example.com?a=1';
    const result = removeQueryParam(url, 'b');
    expect(getUrlQuery(result).a).toBe('1');
  });
  it('removes query string when last param removed', () => {
    const result = removeQueryParam('https://example.com?x=1', 'x');
    expect(result).not.toContain('?');
  });
});

describe('getUrlSegments', () => {
  it('splits path into segments', () => {
    expect(getUrlSegments('https://example.com/api/v1/users')).toEqual(['api', 'v1', 'users']);
  });
  it('handles root path', () => {
    expect(getUrlSegments('https://example.com/')).toEqual([]);
  });
  it('handles path-only string', () => {
    expect(getUrlSegments('/a/b/c')).toEqual(['a', 'b', 'c']);
  });
  it('ignores query and hash in segment count', () => {
    const segs = getUrlSegments('https://example.com/a/b?q=1#h');
    expect(segs).toEqual(['a', 'b']);
  });
});

// --- Glob Matching ---

describe('globToRegex', () => {
  it('converts * to non-slash wildcard', () => {
    const re = globToRegex('src/*.ts');
    expect(re.test('src/file.ts')).toBe(true);
    expect(re.test('src/a/b.ts')).toBe(false);
  });
  it('converts ** to match anything including slashes', () => {
    const re = globToRegex('src/**/*.ts');
    expect(re.test('src/a/b/c.ts')).toBe(true);
    expect(re.test('src/file.ts')).toBe(true);
  });
  it('converts ? to single non-slash char', () => {
    const re = globToRegex('file?.ts');
    expect(re.test('fileA.ts')).toBe(true);
    expect(re.test('fileAB.ts')).toBe(false);
  });
  it('converts character class', () => {
    const re = globToRegex('[abc].ts');
    expect(re.test('a.ts')).toBe(true);
    expect(re.test('b.ts')).toBe(true);
    expect(re.test('d.ts')).toBe(false);
  });
  it('escapes regex special characters in literal parts', () => {
    const re = globToRegex('file.ts');
    expect(re.test('fileXts')).toBe(false);
    expect(re.test('file.ts')).toBe(true);
  });
  it('returns a RegExp instance', () => {
    expect(globToRegex('*.ts')).toBeInstanceOf(RegExp);
  });
  it('matches exact string with no wildcards', () => {
    const re = globToRegex('exact.ts');
    expect(re.test('exact.ts')).toBe(true);
    expect(re.test('inexact.ts')).toBe(false);
  });
  it('handles ** at start', () => {
    const re = globToRegex('**/index.ts');
    expect(re.test('src/index.ts')).toBe(true);
    expect(re.test('a/b/c/index.ts')).toBe(true);
  });
});

describe('matchGlob', () => {
  it('matches single-level glob', () => {
    expect(matchGlob('src/file.ts', 'src/*.ts')).toBe(true);
  });
  it('does not match cross-directory with single *', () => {
    expect(matchGlob('src/a/file.ts', 'src/*.ts')).toBe(false);
  });
  it('matches multi-level with **', () => {
    expect(matchGlob('src/a/b/file.ts', 'src/**/*.ts')).toBe(true);
  });
  it('does not match wrong extension', () => {
    expect(matchGlob('src/file.js', 'src/*.ts')).toBe(false);
  });
  it('matches exact path', () => {
    expect(matchGlob('src/index.ts', 'src/index.ts')).toBe(true);
  });
  it('handles backslashes in path via toPosix', () => {
    expect(matchGlob('src\\file.ts', 'src/*.ts')).toBe(true);
  });
});

describe('filterByGlob', () => {
  const paths = ['src/a.ts', 'src/b.ts', 'src/sub/c.ts', 'lib/d.ts', 'lib/e.js'];
  it('filters matching paths', () => {
    expect(filterByGlob(paths, 'src/*.ts')).toEqual(['src/a.ts', 'src/b.ts']);
  });
  it('returns empty for no matches', () => {
    expect(filterByGlob(paths, '*.py')).toEqual([]);
  });
  it('filters with ** glob', () => {
    const result = filterByGlob(paths, 'src/**/*.ts');
    expect(result).toContain('src/a.ts');
    expect(result).toContain('src/sub/c.ts');
  });
  it('handles empty array', () => {
    expect(filterByGlob([], '*.ts')).toEqual([]);
  });
});

describe('matchesAny', () => {
  it('returns true if path matches any pattern', () => {
    expect(matchesAny('src/file.ts', ['*.js', '**/*.ts'])).toBe(true);
  });
  it('returns false if path matches no pattern', () => {
    expect(matchesAny('src/file.py', ['*.ts', '*.js'])).toBe(false);
  });
  it('returns false for empty patterns array', () => {
    expect(matchesAny('src/file.ts', [])).toBe(false);
  });
  it('returns true for first matching pattern', () => {
    expect(matchesAny('index.ts', ['*.ts', '*.js'])).toBe(true);
  });
});

// --- Path Manipulation ---

describe('addExtension', () => {
  it('adds extension if not present', () => {
    expect(addExtension('file', '.ts')).toBe('file.ts');
  });
  it('does not add if extension already present', () => {
    expect(addExtension('file.ts', '.ts')).toBe('file.ts');
  });
  it('adds dot if extension given without dot', () => {
    expect(addExtension('file', 'ts')).toBe('file.ts');
  });
  it('handles nested path', () => {
    expect(addExtension('/src/file', '.js')).toBe('/src/file.js');
  });
  it('does not double-add', () => {
    expect(addExtension('a.ts', '.ts')).toBe('a.ts');
  });
});

describe('changeExtension', () => {
  it('changes existing extension', () => {
    expect(changeExtension('file.ts', '.js')).toBe('file.js');
  });
  it('adds extension to extensionless file', () => {
    expect(changeExtension('file', '.ts')).toBe('file.ts');
  });
  it('adds dot if extension given without dot', () => {
    expect(changeExtension('file.ts', 'js')).toBe('file.js');
  });
  it('handles nested path', () => {
    expect(changeExtension('/src/file.ts', '.js')).toBe('/src/file.js');
  });
  it('changes .test.ts to .test.js (last extension only)', () => {
    expect(changeExtension('file.test.ts', '.js')).toBe('file.test.js');
  });
});

describe('stripExtension', () => {
  it('removes extension', () => {
    expect(stripExtension('file.ts')).toBe('file');
  });
  it('returns path unchanged if no extension', () => {
    expect(stripExtension('file')).toBe('file');
  });
  it('handles nested path', () => {
    expect(stripExtension('/src/file.ts')).toBe('/src/file');
  });
  it('only strips last extension', () => {
    expect(stripExtension('file.test.ts')).toBe('file.test');
  });
});

describe('ensureTrailingSlash', () => {
  it('adds trailing slash when absent', () => {
    expect(ensureTrailingSlash('/api/users')).toBe('/api/users/');
  });
  it('does not double-add trailing slash', () => {
    expect(ensureTrailingSlash('/api/users/')).toBe('/api/users/');
  });
  it('handles root', () => {
    expect(ensureTrailingSlash('/')).toBe('/');
  });
  it('handles empty string', () => {
    expect(ensureTrailingSlash('')).toBe('/');
  });
});

describe('stripTrailingSlash', () => {
  it('removes trailing slash', () => {
    expect(stripTrailingSlash('/api/users/')).toBe('/api/users');
  });
  it('does not affect path without trailing slash', () => {
    expect(stripTrailingSlash('/api/users')).toBe('/api/users');
  });
  it('preserves root slash', () => {
    expect(stripTrailingSlash('/')).toBe('/');
  });
  it('handles empty string', () => {
    expect(stripTrailingSlash('')).toBe('');
  });
});

describe('ensureLeadingSlash', () => {
  it('adds leading slash when absent', () => {
    expect(ensureLeadingSlash('api/users')).toBe('/api/users');
  });
  it('does not double-add leading slash', () => {
    expect(ensureLeadingSlash('/api/users')).toBe('/api/users');
  });
  it('handles empty string', () => {
    expect(ensureLeadingSlash('')).toBe('/');
  });
  it('handles single segment', () => {
    expect(ensureLeadingSlash('users')).toBe('/users');
  });
});

describe('isSubPath', () => {
  it('returns true for sub-path', () => {
    expect(isSubPath('/a/b', '/a/b/c/d')).toBe(true);
  });
  it('returns false for equal paths', () => {
    expect(isSubPath('/a/b', '/a/b')).toBe(false);
  });
  it('returns false for sibling path', () => {
    expect(isSubPath('/a/b', '/a/c')).toBe(false);
  });
  it('returns false for parent path', () => {
    expect(isSubPath('/a/b/c', '/a/b')).toBe(false);
  });
  it('handles normalised paths with trailing slashes', () => {
    expect(isSubPath('/a/b/', '/a/b/c')).toBe(true);
  });
  it('returns false for unrelated paths', () => {
    expect(isSubPath('/x/y', '/a/b/c')).toBe(false);
  });
});

describe('commonAncestor', () => {
  it('returns empty string for empty array', () => {
    expect(commonAncestor([])).toBe('');
  });
  it('returns dirname for single path', () => {
    const result = commonAncestor(['/a/b/c.ts']);
    expect(result).toBe('/a/b');
  });
  it('returns common ancestor for two sibling paths', () => {
    expect(commonAncestor(['/a/b/c', '/a/b/d'])).toBe('/a/b');
  });
  it('returns common ancestor for deeper paths', () => {
    expect(commonAncestor(['/a/b/c/d', '/a/b/e/f'])).toBe('/a/b');
  });
  it('returns / when no common dir beyond root', () => {
    const result = commonAncestor(['/a/b', '/c/d']);
    expect(result).toBe('/');
  });
  it('handles three paths', () => {
    const result = commonAncestor(['/a/b/c', '/a/b/d', '/a/b/e']);
    expect(result).toBe('/a/b');
  });
});

describe('depth', () => {
  it('returns 0 for root', () => {
    expect(depth('/')).toBe(0);
  });
  it('returns 1 for single segment', () => {
    expect(depth('/a')).toBe(1);
  });
  it('returns correct depth for deep path', () => {
    expect(depth('/a/b/c/d/e')).toBe(5);
  });
  it('handles relative path', () => {
    expect(depth('a/b/c')).toBe(3);
  });
  it('returns 0 for empty string', () => {
    expect(depth('')).toBe(0);
  });
});

describe('segments', () => {
  it('splits absolute path into segments', () => {
    expect(segments('/a/b/c')).toEqual(['a', 'b', 'c']);
  });
  it('splits relative path', () => {
    expect(segments('a/b/c')).toEqual(['a', 'b', 'c']);
  });
  it('returns empty array for root', () => {
    expect(segments('/')).toEqual([]);
  });
  it('returns empty array for empty string', () => {
    expect(segments('')).toEqual([]);
  });
  it('handles trailing slash', () => {
    expect(segments('/a/b/')).toEqual(['a', 'b']);
  });
  it('filters out empty segments from double slashes', () => {
    expect(segments('a//b')).toEqual(['a', 'b']);
  });
});

describe('toPosix', () => {
  it('converts backslashes to forward slashes', () => {
    expect(toPosix('a\\b\\c')).toBe('a/b/c');
  });
  it('leaves forward slashes unchanged', () => {
    expect(toPosix('/a/b/c')).toBe('/a/b/c');
  });
  it('handles empty string', () => {
    expect(toPosix('')).toBe('');
  });
  it('handles mixed slashes', () => {
    expect(toPosix('a/b\\c/d')).toBe('a/b/c/d');
  });
});

describe('toNamespaced', () => {
  it('prefixes each segment with namespace', () => {
    expect(toNamespaced('/a/b/c', 'ns')).toBe('/ns:a/ns:b/ns:c');
  });
  it('handles relative path', () => {
    expect(toNamespaced('a/b', 'x')).toBe('x:a/x:b');
  });
  it('handles single segment', () => {
    expect(toNamespaced('/file', 'mod')).toBe('/mod:file');
  });
  it('handles root (no segments)', () => {
    expect(toNamespaced('/', 'ns')).toBe('/');
  });
});

describe('truncatePath', () => {
  it('truncates to maxDepth segments', () => {
    expect(truncatePath('/a/b/c/d/e', 3)).toBe('/a/b/c');
  });
  it('returns full path when maxDepth >= depth', () => {
    expect(truncatePath('/a/b', 10)).toBe('/a/b');
  });
  it('returns root for maxDepth 0 on absolute path', () => {
    expect(truncatePath('/a/b/c', 0)).toBe('/');
  });
  it('handles relative path', () => {
    expect(truncatePath('a/b/c/d', 2)).toBe('a/b');
  });
  it('handles empty path', () => {
    expect(truncatePath('', 5)).toBe('');
  });
});

// ─── Additional edge-case correctness tests ───────────────────────────────────

describe('join with . and .. segments', () => {
  it('resolves . in middle', () => {
    expect(join('a', '.', 'b')).toBe('a/b');
  });
  it('resolves .. in middle', () => {
    expect(join('a', 'b', '..', 'c')).toBe('a/c');
  });
});

describe('URL edge cases', () => {
  it('addQueryParam encodes special characters', () => {
    const result = addQueryParam('/path', 'q', 'hello world');
    expect(result).toContain('hello%20world');
  });
  it('getUrlQuery decodes encoded values', () => {
    const q = getUrlQuery('/path?q=hello%20world');
    expect(q.q).toBe('hello world');
  });
  it('joinUrl with trailing slashes in all parts', () => {
    const result = joinUrl('/api/', '/v1/', '/users/');
    expect(result).not.toContain('//');
  });
  it('parseUrl handles no-path URL (host only)', () => {
    const p = parseUrl('https://example.com');
    expect(p.pathname).toBe('/');
    expect(p.host).toBe('example.com');
  });
});

describe('glob edge cases', () => {
  it('globToRegex handles pattern with no wildcards', () => {
    expect(matchGlob('exact.ts', 'exact.ts')).toBe(true);
    expect(matchGlob('other.ts', 'exact.ts')).toBe(false);
  });
  it('matchesAny with mixed glob styles', () => {
    const patterns = ['**/*.ts', '**/*.js'];
    expect(matchesAny('src/index.ts', patterns)).toBe(true);
    expect(matchesAny('src/index.py', patterns)).toBe(false);
  });
  it('filterByGlob returns correct subset', () => {
    const paths = ['a.ts', 'b.ts', 'c.js'];
    expect(filterByGlob(paths, '*.ts')).toEqual(['a.ts', 'b.ts']);
  });
});

describe('isSubPath edge cases', () => {
  it('handles partial name overlap correctly', () => {
    // /a/bc is NOT a subpath of /a/b
    expect(isSubPath('/a/b', '/a/bc')).toBe(false);
  });
  it('deeply nested is subpath', () => {
    expect(isSubPath('/a', '/a/b/c/d/e')).toBe(true);
  });
});

describe('commonAncestor with identical paths', () => {
  it('two identical paths return the common ancestor as parent dir', () => {
    const result = commonAncestor(['/a/b/c', '/a/b/c']);
    // Both are identical; commonAncestor returns longest common prefix by segment
    expect(result).toBe('/a/b/c');
  });
});

describe('truncatePath with maxDepth equals depth', () => {
  it('returns same path when maxDepth equals number of segments', () => {
    expect(truncatePath('/a/b/c', 3)).toBe('/a/b/c');
  });
});

describe('changeExtension preserves path', () => {
  it('path before filename is preserved', () => {
    const result = changeExtension('/some/deep/path/file.ts', '.js');
    expect(result).toBe('/some/deep/path/file.js');
  });
});

// ─── Loop 8: normalize with double-dot segments (i=1..50) ────────────────────
describe('normalize resolves double-dot segments (i=1..50)', () => {
  for (let i = 1; i <= 50; i++) {
    it(`normalize /a/b${i}/../c is /a/c`, () => {
      expect(normalize(`/a/b${i}/../c`)).toBe('/a/c');
    });
  }
});

// ─── Loop 9: extname on various extensions (i=0..49) ────────────────────────
describe('extname loop (i=0..49)', () => {
  const extensions = ['.ts', '.js', '.json', '.yaml', '.md'];
  for (let i = 0; i < 50; i++) {
    const ext = extensions[i % extensions.length];
    it(`extname of file${i}${ext} is ${ext}`, () => {
      expect(extname(`file${i}${ext}`)).toBe(ext);
    });
  }
});

// ─── Loop 10: addExtension idempotent (i=0..49) ──────────────────────────────
describe('addExtension is idempotent (i=0..49)', () => {
  for (let i = 0; i < 50; i++) {
    it(`addExtension twice on file${i}.ts gives file${i}.ts`, () => {
      const once = addExtension(`file${i}`, '.ts');
      const twice = addExtension(once, '.ts');
      expect(twice).toBe(once);
    });
  }
});

// ─── Loop 11: ensureTrailingSlash + stripTrailingSlash roundtrip (i=0..49) ───
describe('ensureTrailingSlash + stripTrailingSlash roundtrip (i=0..49)', () => {
  for (let i = 0; i < 50; i++) {
    it(`roundtrip /path/${i} stays /path/${i}`, () => {
      const p = `/path/${i}`;
      expect(stripTrailingSlash(ensureTrailingSlash(p))).toBe(p);
    });
  }
});

// ─── Loop 12: ensureLeadingSlash idempotent (i=0..49) ────────────────────────
describe('ensureLeadingSlash is idempotent (i=0..49)', () => {
  for (let i = 0; i < 50; i++) {
    it(`ensureLeadingSlash twice on api${i} gives /api${i}`, () => {
      const once = ensureLeadingSlash(`api${i}`);
      const twice = ensureLeadingSlash(once);
      expect(twice).toBe(once);
    });
  }
});

// ─── Loop 13: getUrlSegments count matches expected (i=1..50) ────────────────
describe('getUrlSegments count (i=1..50)', () => {
  for (let i = 1; i <= 50; i++) {
    it(`getUrlSegments of /${Array.from({ length: i }, (_, k) => `s${k}`).join('/')} returns ${i} segments`, () => {
      const p = '/' + Array.from({ length: i }, (_, k) => `s${k}`).join('/');
      expect(getUrlSegments(p)).toHaveLength(i);
    });
  }
});

// ─── Loop 14: toPosix is idempotent (i=0..49) ────────────────────────────────
describe('toPosix is idempotent (i=0..49)', () => {
  for (let i = 0; i < 50; i++) {
    it(`toPosix twice on path${i} gives same result`, () => {
      const p = `src\\module${i}\\index.ts`;
      expect(toPosix(toPosix(p))).toBe(toPosix(p));
    });
  }
});

// ─── Loop 15: isSubPath positive cases (i=0..49) ─────────────────────────────
describe('isSubPath positive loop (i=0..49)', () => {
  for (let i = 0; i < 50; i++) {
    it(`/root/parent${i} is parent of /root/parent${i}/child`, () => {
      expect(isSubPath(`/root/parent${i}`, `/root/parent${i}/child`)).toBe(true);
    });
  }
});

// ─── Loop 16: stripExtension + addExtension roundtrip (i=0..49) ──────────────
describe('stripExtension + addExtension roundtrip (i=0..49)', () => {
  for (let i = 0; i < 50; i++) {
    it(`strip then add .ts on file${i}.ts restores original`, () => {
      const original = `file${i}.ts`;
      expect(addExtension(stripExtension(original), '.ts')).toBe(original);
    });
  }
});
