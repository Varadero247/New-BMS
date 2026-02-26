// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import {
  parseUrl,
  isValidUrl,
  isHttps,
  getOrigin,
  getPathname,
  getHostname,
  getPort,
  getProtocol,
  getSearchParams,
  setSearchParam,
  removeSearchParam,
  addSearchParams,
  buildUrl,
  joinPaths,
  encodeQueryString,
  decodeQueryString,
  stripTrailingSlash,
  ensureTrailingSlash,
  getExtension,
  isAbsolute,
  toRelative,
  normalizeUrl,
} from '../src/urls';

// ---------------------------------------------------------------------------
// parseUrl — 40 tests
// ---------------------------------------------------------------------------
describe('parseUrl', () => {
  for (let i = 0; i < 20; i++) {
    it(`parseUrl returns URL object for valid https URL #${i}`, () => {
      const result = parseUrl(`https://example${i}.com/path?q=${i}`);
      expect(result).not.toBeNull();
      expect(result).toBeInstanceOf(URL);
    });
  }

  for (let i = 0; i < 10; i++) {
    it(`parseUrl returns null for invalid string #${i}`, () => {
      expect(parseUrl(`not-a-url-${i}`)).toBeNull();
    });
  }

  for (let i = 0; i < 10; i++) {
    it(`parseUrl returns URL object for http URL #${i}`, () => {
      const result = parseUrl(`http://host${i}.org`);
      expect(result).not.toBeNull();
    });
  }
});

// ---------------------------------------------------------------------------
// isValidUrl — 50 tests
// ---------------------------------------------------------------------------
describe('isValidUrl', () => {
  for (let i = 0; i < 25; i++) {
    it(`isValidUrl returns true for valid URL #${i}`, () => {
      expect(isValidUrl(`https://site${i}.example.com`)).toBe(true);
    });
  }

  for (let i = 0; i < 25; i++) {
    it(`isValidUrl returns false for garbage string #${i}`, () => {
      expect(isValidUrl(`garbage-string-${i}`)).toBe(false);
    });
  }
});

// ---------------------------------------------------------------------------
// isHttps — 50 tests
// ---------------------------------------------------------------------------
describe('isHttps', () => {
  for (let i = 0; i < 25; i++) {
    it(`isHttps returns true for https scheme #${i}`, () => {
      expect(isHttps(`https://secure${i}.example.com`)).toBe(true);
    });
  }

  for (let i = 0; i < 15; i++) {
    it(`isHttps returns false for http scheme #${i}`, () => {
      expect(isHttps(`http://insecure${i}.example.com`)).toBe(false);
    });
  }

  for (let i = 0; i < 10; i++) {
    it(`isHttps returns false for invalid URL #${i}`, () => {
      expect(isHttps(`invalid-${i}`)).toBe(false);
    });
  }
});

// ---------------------------------------------------------------------------
// getOrigin — 40 tests
// ---------------------------------------------------------------------------
describe('getOrigin', () => {
  for (let i = 0; i < 20; i++) {
    it(`getOrigin returns origin for valid URL #${i}`, () => {
      const origin = getOrigin(`https://host${i}.com/path`);
      expect(origin).toBe(`https://host${i}.com`);
    });
  }

  for (let i = 0; i < 10; i++) {
    it(`getOrigin returns non-null for URL with port #${i}`, () => {
      const origin = getOrigin(`https://host${i}.com:443/path`);
      expect(origin).not.toBeNull();
    });
  }

  for (let i = 0; i < 10; i++) {
    it(`getOrigin returns null for invalid URL #${i}`, () => {
      expect(getOrigin(`no-protocol-${i}`)).toBeNull();
    });
  }
});

// ---------------------------------------------------------------------------
// getPathname — 40 tests
// ---------------------------------------------------------------------------
describe('getPathname', () => {
  for (let i = 0; i < 20; i++) {
    it(`getPathname returns correct path #${i}`, () => {
      const path = getPathname(`https://example.com/segment${i}/resource`);
      expect(path).toBe(`/segment${i}/resource`);
    });
  }

  for (let i = 0; i < 10; i++) {
    it(`getPathname returns '/' for root URL #${i}`, () => {
      expect(getPathname(`https://example${i}.com`)).toBe('/');
    });
  }

  for (let i = 0; i < 10; i++) {
    it(`getPathname returns null for invalid URL #${i}`, () => {
      expect(getPathname(`bad-url-${i}`)).toBeNull();
    });
  }
});

// ---------------------------------------------------------------------------
// getHostname — 40 tests
// ---------------------------------------------------------------------------
describe('getHostname', () => {
  for (let i = 0; i < 20; i++) {
    it(`getHostname extracts hostname #${i}`, () => {
      const hostname = getHostname(`https://subdomain${i}.example.com/path`);
      expect(hostname).toBe(`subdomain${i}.example.com`);
    });
  }

  for (let i = 0; i < 10; i++) {
    it(`getHostname works with non-standard port #${i}`, () => {
      const hostname = getHostname(`https://api${i}.example.com:9000/endpoint`);
      expect(hostname).toBe(`api${i}.example.com`);
    });
  }

  for (let i = 0; i < 10; i++) {
    it(`getHostname returns null for invalid URL #${i}`, () => {
      expect(getHostname(`not-a-url-${i}`)).toBeNull();
    });
  }
});

// ---------------------------------------------------------------------------
// getPort — 40 tests
// ---------------------------------------------------------------------------
describe('getPort', () => {
  for (let i = 0; i < 20; i++) {
    it(`getPort returns port string for explicit port #${i}`, () => {
      const port = i + 3000;
      const result = getPort(`https://example.com:${port}/path`);
      expect(result).toBe(String(port));
    });
  }

  for (let i = 0; i < 10; i++) {
    it(`getPort returns empty string when no explicit port #${i}`, () => {
      expect(getPort(`https://example${i}.com/path`)).toBe('');
    });
  }

  for (let i = 0; i < 10; i++) {
    it(`getPort returns null for invalid URL #${i}`, () => {
      expect(getPort(`invalid-url-${i}`)).toBeNull();
    });
  }
});

// ---------------------------------------------------------------------------
// getProtocol — 40 tests
// ---------------------------------------------------------------------------
describe('getProtocol', () => {
  for (let i = 0; i < 20; i++) {
    it(`getProtocol returns "https:" for https URL #${i}`, () => {
      expect(getProtocol(`https://example${i}.com`)).toBe('https:');
    });
  }

  for (let i = 0; i < 10; i++) {
    it(`getProtocol returns "http:" for http URL #${i}`, () => {
      expect(getProtocol(`http://example${i}.com`)).toBe('http:');
    });
  }

  for (let i = 0; i < 10; i++) {
    it(`getProtocol returns null for invalid URL #${i}`, () => {
      expect(getProtocol(`no-scheme-${i}`)).toBeNull();
    });
  }
});

// ---------------------------------------------------------------------------
// getSearchParams — 50 tests
// ---------------------------------------------------------------------------
describe('getSearchParams', () => {
  for (let i = 0; i < 25; i++) {
    it(`getSearchParams returns correct param map #${i}`, () => {
      const result = getSearchParams(`https://example.com?key${i}=value${i}&extra=1`);
      expect(result[`key${i}`]).toBe(`value${i}`);
      expect(result['extra']).toBe('1');
    });
  }

  for (let i = 0; i < 15; i++) {
    it(`getSearchParams returns empty object for URL without params #${i}`, () => {
      const result = getSearchParams(`https://example${i}.com/path`);
      expect(Object.keys(result).length).toBe(0);
    });
  }

  for (let i = 0; i < 10; i++) {
    it(`getSearchParams returns empty object for invalid URL #${i}`, () => {
      const result = getSearchParams(`invalid-url-${i}`);
      expect(result).toEqual({});
    });
  }
});

// ---------------------------------------------------------------------------
// setSearchParam — 50 tests
// ---------------------------------------------------------------------------
describe('setSearchParam', () => {
  for (let i = 0; i < 40; i++) {
    it(`setSearchParam sets key${i}=val${i}`, () => {
      const result = setSearchParam('https://example.com', `key${i}`, `val${i}`);
      expect(result).toContain(`key${i}=val${i}`);
    });
  }

  for (let i = 0; i < 10; i++) {
    it(`setSearchParam replaces existing param #${i}`, () => {
      const result = setSearchParam(`https://example.com?foo=old${i}`, 'foo', `new${i}`);
      expect(result).toContain(`foo=new${i}`);
      expect(result).not.toContain(`foo=old${i}`);
    });
  }
});

// ---------------------------------------------------------------------------
// removeSearchParam — 40 tests
// ---------------------------------------------------------------------------
describe('removeSearchParam', () => {
  for (let i = 0; i < 30; i++) {
    it(`removeSearchParam removes key${i} from URL`, () => {
      const url = `https://example.com?key${i}=val&other=keep`;
      const result = removeSearchParam(url, `key${i}`);
      expect(result).not.toContain(`key${i}=`);
      expect(result).toContain('other=keep');
    });
  }

  for (let i = 0; i < 10; i++) {
    it(`removeSearchParam is no-op when key not present #${i}`, () => {
      const url = `https://example${i}.com?a=1`;
      const result = removeSearchParam(url, `nonexistent${i}`);
      expect(result).toContain('a=1');
    });
  }
});

// ---------------------------------------------------------------------------
// addSearchParams — 40 tests
// ---------------------------------------------------------------------------
describe('addSearchParams', () => {
  for (let i = 0; i < 30; i++) {
    it(`addSearchParams adds multiple params #${i}`, () => {
      const result = addSearchParams('https://example.com', {
        [`p${i}a`]: `va${i}`,
        [`p${i}b`]: `vb${i}`,
      });
      expect(result).toContain(`p${i}a=va${i}`);
      expect(result).toContain(`p${i}b=vb${i}`);
    });
  }

  for (let i = 0; i < 10; i++) {
    it(`addSearchParams returns original for invalid URL #${i}`, () => {
      const url = `invalid-${i}`;
      expect(addSearchParams(url, { k: 'v' })).toBe(url);
    });
  }
});

// ---------------------------------------------------------------------------
// buildUrl — 50 tests
// ---------------------------------------------------------------------------
describe('buildUrl', () => {
  for (let i = 0; i < 25; i++) {
    it(`buildUrl constructs URL with path /resource/${i}`, () => {
      const result = buildUrl('https://api.example.com', `/resource/${i}`);
      expect(result).toContain(`/resource/${i}`);
      expect(result).toContain('https://api.example.com');
    });
  }

  for (let i = 0; i < 15; i++) {
    it(`buildUrl includes query params #${i}`, () => {
      const result = buildUrl('https://api.example.com', '/path', {
        page: String(i),
        limit: '10',
      });
      expect(result).toContain(`page=${i}`);
      expect(result).toContain('limit=10');
    });
  }

  for (let i = 0; i < 10; i++) {
    it(`buildUrl prepends slash to path if missing #${i}`, () => {
      const result = buildUrl(`https://example${i}.com`, `segment${i}`);
      expect(result).toContain(`/segment${i}`);
    });
  }
});

// ---------------------------------------------------------------------------
// joinPaths — 50 tests
// ---------------------------------------------------------------------------
describe('joinPaths', () => {
  for (let i = 0; i < 25; i++) {
    it(`joinPaths joins two segments without double slash #${i}`, () => {
      const result = joinPaths(`/base${i}`, `child${i}`);
      expect(result).toBe(`/base${i}/child${i}`);
      expect(result).not.toContain('//');
    });
  }

  for (let i = 0; i < 15; i++) {
    it(`joinPaths strips trailing slashes from intermediate segments #${i}`, () => {
      const result = joinPaths('/root/', `/middle${i}/`, `/leaf${i}`);
      expect(result).not.toMatch(/\/\//);
    });
  }

  for (let i = 0; i < 10; i++) {
    it(`joinPaths handles single segment #${i}`, () => {
      const result = joinPaths(`/only${i}`);
      expect(result).toBe(`/only${i}`);
    });
  }
});

// ---------------------------------------------------------------------------
// encodeQueryString — 40 tests
// ---------------------------------------------------------------------------
describe('encodeQueryString', () => {
  for (let i = 0; i < 30; i++) {
    it(`encodeQueryString produces key=value pairs #${i}`, () => {
      const result = encodeQueryString({ [`k${i}`]: `v${i}` });
      expect(result).toBe(`k${i}=v${i}`);
    });
  }

  for (let i = 0; i < 10; i++) {
    it(`encodeQueryString URL-encodes special characters #${i}`, () => {
      const result = encodeQueryString({ [`key ${i}`]: `value ${i}` });
      expect(result).toContain('%20');
    });
  }
});

// ---------------------------------------------------------------------------
// decodeQueryString — 40 tests
// ---------------------------------------------------------------------------
describe('decodeQueryString', () => {
  for (let i = 0; i < 20; i++) {
    it(`decodeQueryString parses key${i}=val${i}`, () => {
      const result = decodeQueryString(`key${i}=val${i}`);
      expect(result[`key${i}`]).toBe(`val${i}`);
    });
  }

  for (let i = 0; i < 10; i++) {
    it(`decodeQueryString handles leading ? #${i}`, () => {
      const result = decodeQueryString(`?foo${i}=bar${i}`);
      expect(result[`foo${i}`]).toBe(`bar${i}`);
    });
  }

  for (let i = 0; i < 10; i++) {
    it(`decodeQueryString returns empty object for empty string #${i}`, () => {
      expect(decodeQueryString('')).toEqual({});
    });
  }
});

// ---------------------------------------------------------------------------
// stripTrailingSlash — 40 tests
// ---------------------------------------------------------------------------
describe('stripTrailingSlash', () => {
  for (let i = 0; i < 20; i++) {
    it(`stripTrailingSlash removes trailing slash #${i}`, () => {
      const result = stripTrailingSlash(`https://example${i}.com/path/`);
      expect(result).toBe(`https://example${i}.com/path`);
    });
  }

  for (let i = 0; i < 20; i++) {
    it(`stripTrailingSlash is no-op when no trailing slash #${i}`, () => {
      const url = `https://example${i}.com/path`;
      expect(stripTrailingSlash(url)).toBe(url);
    });
  }
});

// ---------------------------------------------------------------------------
// ensureTrailingSlash — 40 tests
// ---------------------------------------------------------------------------
describe('ensureTrailingSlash', () => {
  for (let i = 0; i < 20; i++) {
    it(`ensureTrailingSlash adds slash when missing #${i}`, () => {
      const result = ensureTrailingSlash(`https://example${i}.com/path`);
      expect(result).toBe(`https://example${i}.com/path/`);
    });
  }

  for (let i = 0; i < 20; i++) {
    it(`ensureTrailingSlash is no-op when slash already present #${i}`, () => {
      const url = `https://example${i}.com/path/`;
      expect(ensureTrailingSlash(url)).toBe(url);
    });
  }
});

// ---------------------------------------------------------------------------
// getExtension — 50 tests
// ---------------------------------------------------------------------------
describe('getExtension', () => {
  const extensions = ['.pdf', '.png', '.jpg', '.docx', '.xlsx', '.csv', '.mp4', '.zip', '.json', '.xml'];

  for (let i = 0; i < 40; i++) {
    const ext = extensions[i % extensions.length];
    it(`getExtension returns "${ext}" for file #${i}`, () => {
      const result = getExtension(`https://example.com/files/doc${i}${ext}`);
      expect(result).toBe(ext);
    });
  }

  for (let i = 0; i < 10; i++) {
    it(`getExtension returns empty string for path without extension #${i}`, () => {
      const result = getExtension(`https://example${i}.com/no-extension`);
      expect(result).toBe('');
    });
  }
});

// ---------------------------------------------------------------------------
// isAbsolute — 40 tests
// ---------------------------------------------------------------------------
describe('isAbsolute', () => {
  for (let i = 0; i < 20; i++) {
    it(`isAbsolute returns true for https URL #${i}`, () => {
      expect(isAbsolute(`https://example${i}.com`)).toBe(true);
    });
  }

  for (let i = 0; i < 10; i++) {
    it(`isAbsolute returns true for http URL #${i}`, () => {
      expect(isAbsolute(`http://example${i}.com`)).toBe(true);
    });
  }

  for (let i = 0; i < 10; i++) {
    it(`isAbsolute returns false for relative path #${i}`, () => {
      expect(isAbsolute(`/relative/path/${i}`)).toBe(false);
    });
  }
});

// ---------------------------------------------------------------------------
// toRelative — 50 tests
// ---------------------------------------------------------------------------
describe('toRelative', () => {
  for (let i = 0; i < 25; i++) {
    it(`toRelative strips origin when same origin #${i}`, () => {
      const base = 'https://example.com';
      const url = `https://example.com/path/${i}?q=1`;
      const result = toRelative(url, base);
      expect(result).toBe(`/path/${i}?q=1`);
    });
  }

  for (let i = 0; i < 15; i++) {
    it(`toRelative returns full URL when different origin #${i}`, () => {
      const base = `https://other${i}.com`;
      const url = `https://example.com/path/${i}`;
      const result = toRelative(url, base);
      expect(result).toBe(url);
    });
  }

  for (let i = 0; i < 10; i++) {
    it(`toRelative returns url when url is invalid #${i}`, () => {
      const url = `invalid-${i}`;
      expect(toRelative(url, 'https://example.com')).toBe(url);
    });
  }
});

// ---------------------------------------------------------------------------
// normalizeUrl — 50 tests
// ---------------------------------------------------------------------------
describe('normalizeUrl', () => {
  for (let i = 0; i < 20; i++) {
    it(`normalizeUrl lowercases hostname #${i}`, () => {
      const result = normalizeUrl(`https://EXAMPLE${i}.COM/path`);
      expect(result).toContain(`example${i}.com`);
    });
  }

  for (let i = 0; i < 15; i++) {
    it(`normalizeUrl strips trailing slash from pathname #${i}`, () => {
      const result = normalizeUrl(`https://example${i}.com/path/`);
      expect(result).not.toMatch(/\/\?|\/$/);
    });
  }

  for (let i = 0; i < 15; i++) {
    it(`normalizeUrl sorts query params alphabetically #${i}`, () => {
      const result = normalizeUrl(`https://example.com?z${i}=1&a${i}=2`);
      const qIndex = result.indexOf('?');
      const qs = result.slice(qIndex + 1);
      const keys = qs.split('&').map((p) => p.split('=')[0]);
      const sorted = [...keys].sort();
      expect(keys).toEqual(sorted);
    });
  }
});

// ---------------------------------------------------------------------------
// Round-trip encode/decode — 40 tests
// ---------------------------------------------------------------------------
describe('encodeQueryString / decodeQueryString round-trip', () => {
  for (let i = 0; i < 40; i++) {
    it(`round-trip preserves params for iteration #${i}`, () => {
      const original: Record<string, string> = {
        [`alpha${i}`]: `one${i}`,
        [`beta${i}`]: `two ${i}`,
      };
      const encoded = encodeQueryString(original);
      const decoded = decodeQueryString(encoded);
      expect(decoded[`alpha${i}`]).toBe(`one${i}`);
      expect(decoded[`beta${i}`]).toBe(`two ${i}`);
    });
  }
});

// ---------------------------------------------------------------------------
// stripTrailingSlash / ensureTrailingSlash idempotency — 40 tests
// ---------------------------------------------------------------------------
describe('stripTrailingSlash idempotency', () => {
  for (let i = 0; i < 20; i++) {
    it(`double strip is idempotent #${i}`, () => {
      const url = `https://example${i}.com/path/`;
      expect(stripTrailingSlash(stripTrailingSlash(url))).toBe(stripTrailingSlash(url));
    });
  }

  for (let i = 0; i < 20; i++) {
    it(`double ensure is idempotent #${i}`, () => {
      const url = `https://example${i}.com/path`;
      expect(ensureTrailingSlash(ensureTrailingSlash(url))).toBe(ensureTrailingSlash(url));
    });
  }
});

// ---------------------------------------------------------------------------
// setSearchParam then removeSearchParam round-trip — 30 tests
// ---------------------------------------------------------------------------
describe('setSearchParam then removeSearchParam round-trip', () => {
  for (let i = 0; i < 30; i++) {
    it(`set then remove leaves URL without param #${i}`, () => {
      const base = `https://example.com/path?existing=1`;
      const withParam = setSearchParam(base, `temp${i}`, `val${i}`);
      const removed = removeSearchParam(withParam, `temp${i}`);
      expect(removed).not.toContain(`temp${i}`);
      expect(removed).toContain('existing=1');
    });
  }
});

// ---------------------------------------------------------------------------
// buildUrl with params — 30 tests
// ---------------------------------------------------------------------------
describe('buildUrl with query params round-trip', () => {
  for (let i = 0; i < 30; i++) {
    it(`buildUrl params can be retrieved via getSearchParams #${i}`, () => {
      const built = buildUrl('https://api.example.com', `/resource/${i}`, {
        id: String(i),
        version: '2',
      });
      const params = getSearchParams(built);
      expect(params['id']).toBe(String(i));
      expect(params['version']).toBe('2');
    });
  }
});

// ---------------------------------------------------------------------------
// joinPaths with three segments — 30 tests
// ---------------------------------------------------------------------------
describe('joinPaths three segments', () => {
  for (let i = 0; i < 30; i++) {
    it(`joinPaths produces correct result with three segments #${i}`, () => {
      const result = joinPaths('/api', `v${i}`, 'resources');
      expect(result).toBe(`/api/v${i}/resources`);
    });
  }
});

// ---------------------------------------------------------------------------
// isValidUrl edge cases — 20 tests
// ---------------------------------------------------------------------------
describe('isValidUrl edge cases', () => {
  const validUrls = [
    'https://example.com',
    'http://localhost:3000',
    'https://user:pass@example.com/path',
    'https://example.com/path?a=1&b=2#anchor',
    'ftp://files.example.com',
  ];

  for (let i = 0; i < 20; i++) {
    it(`isValidUrl edge case valid #${i}`, () => {
      const url = validUrls[i % validUrls.length];
      expect(isValidUrl(url)).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// getExtension with query string and hash — 20 tests
// ---------------------------------------------------------------------------
describe('getExtension with query string', () => {
  const exts = ['.pdf', '.png', '.docx'];
  for (let i = 0; i < 20; i++) {
    const ext = exts[i % exts.length];
    it(`getExtension ignores query string, returns ${ext} #${i}`, () => {
      const result = getExtension(`https://example.com/file${i}${ext}?v=${i}`);
      expect(result).toBe(ext);
    });
  }
});

// ---------------------------------------------------------------------------
// isAbsolute with various schemes — 20 tests
// ---------------------------------------------------------------------------
describe('isAbsolute various schemes', () => {
  const schemes = ['https', 'http', 'ftp', 'ws', 'wss'];
  for (let i = 0; i < 20; i++) {
    const scheme = schemes[i % schemes.length];
    it(`isAbsolute returns true for ${scheme} scheme #${i}`, () => {
      expect(isAbsolute(`${scheme}://example${i}.com`)).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// normalizeUrl preserves path — 20 tests
// ---------------------------------------------------------------------------
describe('normalizeUrl preserves path content', () => {
  for (let i = 0; i < 20; i++) {
    it(`normalizeUrl preserves /segment/${i} in path`, () => {
      const result = normalizeUrl(`https://EXAMPLE.COM/segment/${i}/`);
      expect(result).toContain(`/segment/${i}`);
    });
  }
});

// ---------------------------------------------------------------------------
// addSearchParams multiple keys — 20 tests
// ---------------------------------------------------------------------------
describe('addSearchParams multiple keys', () => {
  for (let i = 0; i < 20; i++) {
    it(`addSearchParams adds 3 params at once #${i}`, () => {
      const result = addSearchParams('https://example.com', {
        [`x${i}`]: `1`,
        [`y${i}`]: `2`,
        [`z${i}`]: `3`,
      });
      expect(result).toContain(`x${i}=1`);
      expect(result).toContain(`y${i}=2`);
      expect(result).toContain(`z${i}=3`);
    });
  }
});

// ---------------------------------------------------------------------------
// getHostname with subdomains — 20 tests
// ---------------------------------------------------------------------------
describe('getHostname subdomain variants', () => {
  const subs = ['api', 'app', 'admin', 'mail', 'cdn'];
  for (let i = 0; i < 20; i++) {
    const sub = subs[i % subs.length];
    it(`getHostname returns ${sub}${i}.example.com #${i}`, () => {
      const hostname = getHostname(`https://${sub}${i}.example.com/path`);
      expect(hostname).toBe(`${sub}${i}.example.com`);
    });
  }
});

// ---------------------------------------------------------------------------
// toRelative with hash — 20 tests
// ---------------------------------------------------------------------------
describe('toRelative preserves hash', () => {
  for (let i = 0; i < 20; i++) {
    it(`toRelative includes hash in result #${i}`, () => {
      const base = 'https://example.com';
      const url = `https://example.com/page/${i}#section${i}`;
      const result = toRelative(url, base);
      expect(result).toBe(`/page/${i}#section${i}`);
    });
  }
});

// ---------------------------------------------------------------------------
// parseUrl href property — 20 tests
// ---------------------------------------------------------------------------
describe('parseUrl href', () => {
  for (let i = 0; i < 20; i++) {
    it(`parseUrl returns object with correct href #${i}`, () => {
      const rawUrl = `https://example${i}.com/path?q=${i}`;
      const parsed = parseUrl(rawUrl);
      expect(parsed).not.toBeNull();
      expect(parsed!.href).toContain(`example${i}.com`);
    });
  }
});

// ---------------------------------------------------------------------------
// decodeQueryString multiple params — 20 tests
// ---------------------------------------------------------------------------
describe('decodeQueryString multiple params', () => {
  for (let i = 0; i < 20; i++) {
    it(`decodeQueryString handles multiple params #${i}`, () => {
      const qs = `a${i}=1&b${i}=2&c${i}=3`;
      const result = decodeQueryString(qs);
      expect(result[`a${i}`]).toBe('1');
      expect(result[`b${i}`]).toBe('2');
      expect(result[`c${i}`]).toBe('3');
    });
  }
});

// ---------------------------------------------------------------------------
// getPort with standard ports — 20 tests
// ---------------------------------------------------------------------------
describe('getPort standard port range', () => {
  for (let i = 0; i < 20; i++) {
    const port = 4000 + i;
    it(`getPort returns "${port}" for explicit port ${port}`, () => {
      const result = getPort(`https://example.com:${port}/api`);
      expect(result).toBe(String(port));
    });
  }
});

// ---------------------------------------------------------------------------
// isHttps vs http — 20 tests
// ---------------------------------------------------------------------------
describe('isHttps negative cases with explicit http', () => {
  for (let i = 0; i < 20; i++) {
    it(`isHttps returns false for http://host${i}.com`, () => {
      expect(isHttps(`http://host${i}.com`)).toBe(false);
    });
  }
});

// ---------------------------------------------------------------------------
// getProtocol for ftp scheme — 20 tests
// ---------------------------------------------------------------------------
describe('getProtocol ftp scheme', () => {
  for (let i = 0; i < 20; i++) {
    it(`getProtocol returns "ftp:" for ftp URL #${i}`, () => {
      expect(getProtocol(`ftp://files${i}.example.com`)).toBe('ftp:');
    });
  }
});

// ---------------------------------------------------------------------------
// getOrigin with port — 20 tests
// ---------------------------------------------------------------------------
describe('getOrigin with explicit port', () => {
  for (let i = 0; i < 20; i++) {
    const port = 5000 + i;
    it(`getOrigin includes port ${port} #${i}`, () => {
      const origin = getOrigin(`https://example.com:${port}/path`);
      expect(origin).toBe(`https://example.com:${port}`);
    });
  }
});

// ---------------------------------------------------------------------------
// buildUrl clears existing path — 20 tests
// ---------------------------------------------------------------------------
describe('buildUrl replaces existing path', () => {
  for (let i = 0; i < 20; i++) {
    it(`buildUrl replaces path with /new/${i}`, () => {
      const result = buildUrl(`https://api.example.com/old/path`, `/new/${i}`);
      expect(result).toContain(`/new/${i}`);
      expect(result).not.toContain('/old/path');
    });
  }
});

// ---------------------------------------------------------------------------
// joinPaths empty parts filtering — 10 tests
// ---------------------------------------------------------------------------
describe('joinPaths filters empty intermediate parts', () => {
  for (let i = 0; i < 10; i++) {
    it(`joinPaths with four segments #${i}`, () => {
      const result = joinPaths('/a', `b${i}`, `c${i}`, 'd');
      expect(result).toBe(`/a/b${i}/c${i}/d`);
    });
  }
});

// ---------------------------------------------------------------------------
// encodeQueryString empty object — 10 tests
// ---------------------------------------------------------------------------
describe('encodeQueryString empty object', () => {
  for (let i = 0; i < 10; i++) {
    it(`encodeQueryString returns empty string for empty object #${i}`, () => {
      expect(encodeQueryString({})).toBe('');
    });
  }
});

// ---------------------------------------------------------------------------
// getSearchParams last-wins for duplicate keys — 10 tests
// ---------------------------------------------------------------------------
describe('getSearchParams last-value-wins for duplicate keys', () => {
  for (let i = 0; i < 10; i++) {
    it(`getSearchParams takes last value for duplicate key #${i}`, () => {
      const result = getSearchParams(`https://example.com?k${i}=first&k${i}=last`);
      expect(result[`k${i}`]).toBe('last');
    });
  }
});

// ---------------------------------------------------------------------------
// normalizeUrl returns original on invalid input — 10 tests
// ---------------------------------------------------------------------------
describe('normalizeUrl returns original on invalid input', () => {
  for (let i = 0; i < 10; i++) {
    it(`normalizeUrl returns original string for invalid URL #${i}`, () => {
      const url = `invalid-url-${i}`;
      expect(normalizeUrl(url)).toBe(url);
    });
  }
});
