// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

/**
 * Safely parse a URL string. Returns a URL object on success, null on failure.
 */
export function parseUrl(url: string): URL | null {
  try {
    return new URL(url);
  } catch {
    return null;
  }
}

/**
 * Returns true if the given string is a parseable URL.
 */
export function isValidUrl(url: string): boolean {
  return parseUrl(url) !== null;
}

/**
 * Returns true if the URL scheme is https:.
 */
export function isHttps(url: string): boolean {
  const parsed = parseUrl(url);
  return parsed !== null && parsed.protocol === 'https:';
}

/**
 * Returns the origin of the URL (e.g. "https://example.com:8080"), or null on failure.
 */
export function getOrigin(url: string): string | null {
  const parsed = parseUrl(url);
  return parsed !== null ? parsed.origin : null;
}

/**
 * Returns the pathname of the URL (e.g. "/foo/bar"), or null on failure.
 */
export function getPathname(url: string): string | null {
  const parsed = parseUrl(url);
  return parsed !== null ? parsed.pathname : null;
}

/**
 * Returns the hostname of the URL (e.g. "example.com"), or null on failure.
 */
export function getHostname(url: string): string | null {
  const parsed = parseUrl(url);
  return parsed !== null ? parsed.hostname : null;
}

/**
 * Returns the port string of the URL (e.g. "8080"), or null on failure.
 * Returns empty string "" if no explicit port is present (same as URL.port behaviour).
 */
export function getPort(url: string): string | null {
  const parsed = parseUrl(url);
  return parsed !== null ? parsed.port : null;
}

/**
 * Returns the protocol of the URL including the trailing colon (e.g. "https:"), or null on failure.
 */
export function getProtocol(url: string): string | null {
  const parsed = parseUrl(url);
  return parsed !== null ? parsed.protocol : null;
}

/**
 * Returns all query parameters of the URL as a plain key→value object.
 * When a key appears multiple times, the last value wins.
 * Returns an empty object for invalid URLs.
 */
export function getSearchParams(url: string): Record<string, string> {
  const parsed = parseUrl(url);
  if (parsed === null) return {};
  const result: Record<string, string> = {};
  parsed.searchParams.forEach((value, key) => {
    result[key] = value;
  });
  return result;
}

/**
 * Returns a new URL string with the given query parameter set (added or replaced).
 * Returns the original string unchanged if parsing fails.
 */
export function setSearchParam(url: string, key: string, value: string): string {
  const parsed = parseUrl(url);
  if (parsed === null) return url;
  parsed.searchParams.set(key, value);
  return parsed.toString();
}

/**
 * Returns a new URL string with the given query parameter removed.
 * Returns the original string unchanged if parsing fails.
 */
export function removeSearchParam(url: string, key: string): string {
  const parsed = parseUrl(url);
  if (parsed === null) return url;
  parsed.searchParams.delete(key);
  return parsed.toString();
}

/**
 * Returns a new URL string with all given key/value pairs added as query parameters.
 * Existing values for the same keys are replaced.
 * Returns the original string unchanged if parsing fails.
 */
export function addSearchParams(url: string, params: Record<string, string>): string {
  const parsed = parseUrl(url);
  if (parsed === null) return url;
  for (const [key, value] of Object.entries(params)) {
    parsed.searchParams.set(key, value);
  }
  return parsed.toString();
}

/**
 * Build an absolute URL from a base string, a path, and optional query params.
 * The path is appended to the base origin; any path already in `base` is replaced.
 */
export function buildUrl(base: string, path: string, params?: Record<string, string>): string {
  const parsed = parseUrl(base);
  if (parsed === null) return base;

  // Normalise path so it always starts with /
  const normPath = path.startsWith('/') ? path : '/' + path;
  parsed.pathname = normPath;
  parsed.search = '';

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      parsed.searchParams.set(key, value);
    }
  }

  return parsed.toString();
}

/**
 * Join path segments into a single path string.
 * Trims leading/trailing slashes from each segment and joins with a single '/'.
 * The result will NOT have a leading slash unless the first segment begins with one.
 */
export function joinPaths(...parts: string[]): string {
  if (parts.length === 0) return '';

  const segments: string[] = [];
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (i === 0) {
      // Preserve a leading slash on the first segment
      segments.push(part.replace(/\/+$/, ''));
    } else {
      segments.push(part.replace(/^\/+|\/+$/g, ''));
    }
  }

  return segments.filter((s, i) => i === 0 || s !== '').join('/');
}

/**
 * Encode a key/value map into a URL query string (without a leading '?').
 */
export function encodeQueryString(params: Record<string, string>): string {
  return Object.entries(params)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
}

/**
 * Parse a query string (with or without a leading '?') into a key/value map.
 */
export function decodeQueryString(qs: string): Record<string, string> {
  const cleaned = qs.startsWith('?') ? qs.slice(1) : qs;
  if (!cleaned) return {};
  const result: Record<string, string> = {};
  const sp = new URLSearchParams(cleaned);
  sp.forEach((value, key) => {
    result[key] = value;
  });
  return result;
}

/**
 * Remove a trailing slash from the URL string (if present).
 */
export function stripTrailingSlash(url: string): string {
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

/**
 * Ensure the URL string ends with a trailing slash.
 */
export function ensureTrailingSlash(url: string): string {
  return url.endsWith('/') ? url : url + '/';
}

/**
 * Return the file extension of the last path segment (e.g. '.pdf').
 * Returns an empty string if there is no extension or the URL is invalid.
 */
export function getExtension(url: string): string {
  const pathname = getPathname(url);
  if (pathname === null) return '';
  const lastSegment = pathname.split('/').pop() ?? '';
  const dotIndex = lastSegment.lastIndexOf('.');
  return dotIndex === -1 ? '' : lastSegment.slice(dotIndex);
}

/**
 * Returns true if the string contains a protocol (i.e. is absolute).
 */
export function isAbsolute(url: string): boolean {
  return /^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(url);
}

/**
 * Make `url` relative to `base`. If `url` and `base` share the same origin,
 * the function returns just the path+search+hash portion.
 * Otherwise returns `url` unchanged.
 */
export function toRelative(url: string, base: string): string {
  const parsedUrl = parseUrl(url);
  const parsedBase = parseUrl(base);
  if (parsedUrl === null || parsedBase === null) return url;
  if (parsedUrl.origin !== parsedBase.origin) return url;
  return parsedUrl.pathname + parsedUrl.search + parsedUrl.hash;
}

/**
 * Normalise a URL:
 * - Lowercases the hostname
 * - Strips a trailing slash from the pathname (unless the path is just '/')
 * - Sorts query parameters alphabetically by key
 * Returns the original string if it cannot be parsed.
 */
export function normalizeUrl(url: string): string {
  const parsed = parseUrl(url);
  if (parsed === null) return url;

  parsed.hostname = parsed.hostname.toLowerCase();

  if (parsed.pathname.length > 1 && parsed.pathname.endsWith('/')) {
    parsed.pathname = parsed.pathname.slice(0, -1);
  }

  // Sort search params
  parsed.searchParams.sort();

  return parsed.toString();
}
