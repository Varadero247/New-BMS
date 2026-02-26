// Copyright (c) 2026 Nexara DMCC. All rights reserved.

/** Parse a URL string into its component parts. Returns null for invalid URLs. */
export function parseUrl(url: string): {
  scheme: string;
  host: string;
  port?: number;
  path: string;
  query: Record<string, string>;
  fragment?: string;
} | null {
  try {
    const u = new URL(url);
    const query: Record<string, string> = {};
    u.searchParams.forEach((v, k) => { query[k] = v; });
    const result: {
      scheme: string;
      host: string;
      port?: number;
      path: string;
      query: Record<string, string>;
      fragment?: string;
    } = {
      scheme: u.protocol.replace(/:$/, ''),
      host: u.hostname,
      path: u.pathname,
      query,
    };
    if (u.port) result.port = parseInt(u.port, 10);
    if (u.hash) result.fragment = u.hash.replace(/^#/, '');
    return result;
  } catch {
    return null;
  }
}

/** Build a URL string from its component parts. */
export function buildUrl(parts: {
  scheme?: string;
  host: string;
  port?: number;
  path?: string;
  query?: Record<string, string>;
  fragment?: string;
}): string {
  const scheme = parts.scheme || 'https';
  let url = `${scheme}://${parts.host}`;
  if (parts.port) url += `:${parts.port}`;
  url += parts.path || '/';
  if (parts.query && Object.keys(parts.query).length > 0) {
    url += '?' + buildQueryString(parts.query);
  }
  if (parts.fragment) url += `#${parts.fragment}`;
  return url;
}

/** Get the value of a specific query parameter from a URL. */
export function getQueryParam(url: string, key: string): string | null {
  try {
    const u = new URL(url);
    return u.searchParams.get(key);
  } catch {
    // try as query string
    const qs = url.includes('?') ? url.split('?')[1] : url;
    const params = parseQueryString(qs || '');
    return key in params ? params[key] : null;
  }
}

/** Set (add or replace) a query parameter on a URL. */
export function setQueryParam(url: string, key: string, value: string): string {
  try {
    const u = new URL(url);
    u.searchParams.set(key, value);
    return u.toString();
  } catch {
    const [base, hash] = url.split('#');
    const [path, qs] = base.split('?');
    const params = parseQueryString(qs || '');
    params[key] = value;
    let result = path + '?' + buildQueryString(params);
    if (hash !== undefined) result += '#' + hash;
    return result;
  }
}

/** Remove a query parameter from a URL. */
export function removeQueryParam(url: string, key: string): string {
  try {
    const u = new URL(url);
    u.searchParams.delete(key);
    return u.toString();
  } catch {
    const [base, hash] = url.split('#');
    const [path, qs] = base.split('?');
    const params = parseQueryString(qs || '');
    delete params[key];
    const remaining = buildQueryString(params);
    let result = path;
    if (remaining) result += '?' + remaining;
    if (hash !== undefined) result += '#' + hash;
    return result;
  }
}

/** Get all query parameters from a URL as a key-value record. */
export function getQueryParams(url: string): Record<string, string> {
  try {
    const u = new URL(url);
    const params: Record<string, string> = {};
    u.searchParams.forEach((v, k) => { params[k] = v; });
    return params;
  } catch {
    const qs = url.includes('?') ? url.split('?')[1] : url;
    return parseQueryString(qs || '');
  }
}

/** Set multiple query parameters on a URL (merges with existing). */
export function setQueryParams(url: string, params: Record<string, string>): string {
  let result = url;
  for (const [k, v] of Object.entries(params)) {
    result = setQueryParam(result, k, v);
  }
  return result;
}

/** Parse a query string (with or without leading '?') into a key-value record. */
export function parseQueryString(qs: string): Record<string, string> {
  const clean = qs.replace(/^\?/, '');
  if (!clean) return {};
  const result: Record<string, string> = {};
  for (const part of clean.split('&')) {
    if (!part) continue;
    const eqIdx = part.indexOf('=');
    if (eqIdx === -1) {
      result[decodeURIComponent(part)] = '';
    } else {
      const k = decodeURIComponent(part.slice(0, eqIdx).replace(/\+/g, ' '));
      const v = decodeURIComponent(part.slice(eqIdx + 1).replace(/\+/g, ' '));
      result[k] = v;
    }
  }
  return result;
}

/** Build a query string from a key-value record (without leading '?'). */
export function buildQueryString(params: Record<string, string>): string {
  return Object.entries(params)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
}

/** Percent-encode a URL (encodes characters not allowed in URLs). */
export function encodeUrl(url: string): string {
  return encodeURI(url);
}

/** Decode a percent-encoded URL. */
export function decodeUrl(url: string): string {
  try {
    return decodeURI(url);
  } catch {
    return url;
  }
}

/** Return true if the URL has a scheme (http://, https://, etc.). */
export function isAbsoluteUrl(url: string): boolean {
  return /^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(url);
}

/** Return true if the URL does not have a scheme. */
export function isRelativeUrl(url: string): boolean {
  return !isAbsoluteUrl(url);
}

/** Get the file extension from a URL (e.g. ".html"). Returns "" if none. */
export function getExtension(url: string): string {
  const path = getPathname(url);
  const filename = path.split('/').pop() || '';
  const dotIdx = filename.lastIndexOf('.');
  if (dotIdx <= 0) return '';
  return filename.slice(dotIdx);
}

/** Get the filename (last path segment) from a URL. */
export function getFilename(url: string): string {
  const path = getPathname(url);
  return path.split('/').pop() || '';
}

/** Get the pathname from a URL. */
export function getPathname(url: string): string {
  try {
    return new URL(url).pathname;
  } catch {
    // for relative URLs, strip query and fragment
    return url.split('?')[0].split('#')[0];
  }
}

/** Get the domain (hostname) from an absolute URL. */
export function getDomain(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return '';
  }
}

/** Get the origin (scheme + host + optional port) from an absolute URL. */
export function getOrigin(url: string): string {
  try {
    return new URL(url).origin;
  } catch {
    return '';
  }
}

/** Join path segments with '/', normalising separators. */
export function joinPath(...segments: string[]): string {
  if (segments.length === 0) return '';
  const parts: string[] = [];
  for (let i = 0; i < segments.length; i++) {
    let seg = segments[i];
    if (i > 0) seg = seg.replace(/^\/+/, '');
    seg = seg.replace(/\/+$/, '');
    if (seg) parts.push(seg);
  }
  const result = parts.join('/');
  // preserve leading slash if first segment had one
  const hasLeading = segments[0].startsWith('/');
  return hasLeading ? '/' + result.replace(/^\//, '') : result;
}

/** Normalise a path by removing double slashes and trailing slash. */
export function normalizePath(path: string): string {
  // preserve leading slash, collapse multiples, remove trailing
  let result = path.replace(/\/+/g, '/');
  if (result.length > 1 && result.endsWith('/')) {
    result = result.slice(0, -1);
  }
  return result;
}

/** Return true if the string is a syntactically valid URL. */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/** Return true if the URL uses the http scheme. */
export function isHttpUrl(url: string): boolean {
  try {
    return new URL(url).protocol === 'http:';
  } catch {
    return false;
  }
}

/** Return true if the URL uses the https scheme. */
export function isHttpsUrl(url: string): boolean {
  try {
    return new URL(url).protocol === 'https:';
  } catch {
    return false;
  }
}

/** Remove a trailing slash from a URL (unless it is the bare root '/') */
export function stripTrailingSlash(url: string): string {
  if (url === '/') return url;
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

/** Ensure a URL ends with a trailing slash. */
export function ensureTrailingSlash(url: string): string {
  return url.endsWith('/') ? url : url + '/';
}
