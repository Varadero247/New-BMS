// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import nodePath from 'path';
import { ParsedPath, UrlParts } from './types';

// ─── POSIX / Platform-agnostic wrappers ─────────────────────────────────────

/**
 * Join path segments and normalize the result using forward slashes.
 */
export function join(...parts: string[]): string {
  return toPosix(nodePath.join(...parts));
}

/**
 * Resolve a sequence of paths to an absolute path.
 */
export function resolve(...parts: string[]): string {
  return toPosix(nodePath.resolve(...parts));
}

/**
 * Normalize a path, resolving '.' and '..' segments.
 */
export function normalize(p: string): string {
  return toPosix(nodePath.normalize(p));
}

/**
 * Return the directory component of a path.
 */
export function dirname(p: string): string {
  return toPosix(nodePath.dirname(p));
}

/**
 * Return the final component (filename) of a path.
 * Optionally strips a known extension suffix.
 */
export function basename(p: string, ext?: string): string {
  return nodePath.basename(p, ext);
}

/**
 * Return the extension of the path, including the leading dot.
 * Returns an empty string if there is no extension.
 */
export function extname(p: string): string {
  return nodePath.extname(p);
}

/**
 * Return true if the given path is an absolute path.
 */
export function isAbsolute(p: string): boolean {
  return nodePath.isAbsolute(p);
}

/**
 * Return the relative path from `from` to `to`.
 */
export function relative(from: string, to: string): string {
  return toPosix(nodePath.relative(from, to));
}

/**
 * Parse a path string into its constituent parts.
 */
export function parse(p: string): ParsedPath {
  const parsed = nodePath.parse(p);
  return {
    root: parsed.root,
    dir: toPosix(parsed.dir),
    base: parsed.base,
    name: parsed.name,
    ext: parsed.ext,
  };
}

/**
 * Format a ParsedPath object back into a path string.
 */
export function format(parsed: ParsedPath): string {
  return toPosix(
    nodePath.format({
      root: parsed.root,
      dir: parsed.dir,
      base: parsed.base,
      name: parsed.name,
      ext: parsed.ext,
    })
  );
}

// ─── URL Path Utilities ──────────────────────────────────────────────────────

/**
 * Extract protocol, host, path, query and hash parts from a URL string.
 * Implemented manually without the Node.js `url` module.
 */
export function parseUrl(url: string): UrlParts {
  let remaining = url.trim();
  let protocol = '';
  let host = '';
  let port = '';
  let pathname = '';
  let search = '';
  let hash = '';

  // Extract hash
  const hashIdx = remaining.indexOf('#');
  if (hashIdx !== -1) {
    hash = remaining.slice(hashIdx);
    remaining = remaining.slice(0, hashIdx);
  }

  // Extract search / query
  const queryIdx = remaining.indexOf('?');
  if (queryIdx !== -1) {
    search = remaining.slice(queryIdx);
    remaining = remaining.slice(0, queryIdx);
  }

  // Extract protocol (anything before '://')
  const protoMatch = remaining.match(/^([a-zA-Z][a-zA-Z0-9+\-.]*):\/\//);
  if (protoMatch) {
    protocol = protoMatch[1] + ':';
    remaining = remaining.slice(protoMatch[0].length);

    // Extract host (everything up to next '/')
    const slashIdx = remaining.indexOf('/');
    if (slashIdx === -1) {
      host = remaining;
      remaining = '';
    } else {
      host = remaining.slice(0, slashIdx);
      remaining = remaining.slice(slashIdx);
    }

    // Separate port from host
    const portMatch = host.match(/:(\d+)$/);
    if (portMatch) {
      port = portMatch[1];
      host = host.slice(0, host.length - portMatch[0].length);
    }

    pathname = remaining || '/';
  } else {
    // No protocol — treat entire string as pathname
    pathname = remaining || '/';
  }

  return { protocol, host, port, pathname, search, hash };
}

/**
 * Join URL segments, ensuring no double slashes and preserving the protocol+host.
 */
export function joinUrl(...parts: string[]): string {
  if (parts.length === 0) return '';

  const first = parts[0];
  const parsed = parseUrl(first);

  // Base prefix (protocol + host) if present
  let prefix = '';
  if (parsed.protocol) {
    prefix = parsed.protocol + '//' + parsed.host;
    if (parsed.port) prefix += ':' + parsed.port;
  }

  // Collect all path segments
  const allSegments: string[] = [];

  // Start with the pathname of the first part
  const firstPath = parsed.protocol ? parsed.pathname : first;
  for (const seg of firstPath.split('/')) {
    allSegments.push(seg);
  }

  // Append remaining parts
  for (let i = 1; i < parts.length; i++) {
    // Ignore any protocol/host on subsequent parts — treat them as paths
    const p = parseUrl(parts[i]);
    const path = p.protocol ? p.pathname : parts[i];
    for (const seg of path.split('/')) {
      allSegments.push(seg);
    }
  }

  // Build clean path from segments (filter empty except possible leading empty for absolute)
  const filtered = allSegments.filter((s, idx) => s !== '' || idx === 0);
  let path = filtered.join('/');

  // Normalise double slashes
  path = path.replace(/\/\/+/g, '/');
  if (!path.startsWith('/') && prefix) {
    path = '/' + path;
  }

  // Append query and hash from the first part only
  return prefix + path + parsed.search + parsed.hash;
}

/**
 * Extract the path portion from a URL (strips protocol + host + query + hash).
 */
export function getUrlPath(url: string): string {
  return parseUrl(url).pathname;
}

/**
 * Extract query parameters from a URL as a key→value record.
 */
export function getUrlQuery(url: string): Record<string, string> {
  const { search } = parseUrl(url);
  if (!search) return {};
  const result: Record<string, string> = {};
  const qs = search.startsWith('?') ? search.slice(1) : search;
  for (const pair of qs.split('&')) {
    if (!pair) continue;
    const eqIdx = pair.indexOf('=');
    if (eqIdx === -1) {
      result[decodeURIComponent(pair)] = '';
    } else {
      const k = decodeURIComponent(pair.slice(0, eqIdx));
      const v = decodeURIComponent(pair.slice(eqIdx + 1));
      result[k] = v;
    }
  }
  return result;
}

/**
 * Replace the entire query string of a URL with the provided params.
 */
export function setUrlQuery(url: string, params: Record<string, string>): string {
  const parts = parseUrl(url);
  let prefix = '';
  if (parts.protocol) {
    prefix = parts.protocol + '//' + parts.host;
    if (parts.port) prefix += ':' + parts.port;
  }
  const qs = Object.entries(params)
    .map(([k, v]) => encodeURIComponent(k) + '=' + encodeURIComponent(v))
    .join('&');
  const search = qs ? '?' + qs : '';
  return prefix + parts.pathname + search + parts.hash;
}

/**
 * Add or update a single query parameter on a URL.
 */
export function addQueryParam(url: string, key: string, value: string): string {
  const existing = getUrlQuery(url);
  existing[key] = value;
  return setUrlQuery(url, existing);
}

/**
 * Remove a single query parameter from a URL.
 */
export function removeQueryParam(url: string, key: string): string {
  const existing = getUrlQuery(url);
  delete existing[key];
  return setUrlQuery(url, existing);
}

/**
 * Split the path portion of a URL into non-empty segments.
 */
export function getUrlSegments(url: string): string[] {
  const path = getUrlPath(url);
  return path.split('/').filter((s) => s !== '');
}

// ─── Glob Matching ───────────────────────────────────────────────────────────

/**
 * Convert a glob pattern into a RegExp.
 * Supports: * (any chars except /), ** (any chars including /), ? (single char), [abc] (character class)
 */
export function globToRegex(pattern: string): RegExp {
  let regexStr = '';
  let i = 0;
  while (i < pattern.length) {
    const ch = pattern[i];

    if (ch === '*') {
      if (pattern[i + 1] === '*') {
        // ** — match anything including slashes
        regexStr += '.*';
        i += 2;
        // Consume optional trailing slash in pattern
        if (pattern[i] === '/') i++;
      } else {
        // * — match anything except slash
        regexStr += '[^/]*';
        i++;
      }
    } else if (ch === '?') {
      regexStr += '[^/]';
      i++;
    } else if (ch === '[') {
      // Character class — copy verbatim until closing ]
      const close = pattern.indexOf(']', i + 1);
      if (close === -1) {
        regexStr += '\\[';
        i++;
      } else {
        regexStr += pattern.slice(i, close + 1);
        i = close + 1;
      }
    } else if ('.+^${}()|\\'.includes(ch)) {
      // Escape regex special chars
      regexStr += '\\' + ch;
      i++;
    } else {
      regexStr += ch;
      i++;
    }
  }
  return new RegExp('^' + regexStr + '$');
}

/**
 * Test whether a path matches a glob pattern.
 */
export function matchGlob(path: string, pattern: string): boolean {
  return globToRegex(pattern).test(toPosix(path));
}

/**
 * Filter an array of paths to those that match the given glob pattern.
 */
export function filterByGlob(paths: string[], pattern: string): string[] {
  const re = globToRegex(pattern);
  return paths.filter((p) => re.test(toPosix(p)));
}

/**
 * Return true if a path matches any of the provided glob patterns.
 */
export function matchesAny(path: string, patterns: string[]): boolean {
  return patterns.some((pat) => matchGlob(path, pat));
}

// ─── Path Manipulation Utilities ─────────────────────────────────────────────

/**
 * Add an extension to a path if it does not already end with that extension.
 * The extension should include the leading dot, e.g. '.ts'.
 */
export function addExtension(p: string, ext: string): string {
  const normalExt = ext.startsWith('.') ? ext : '.' + ext;
  if (p.endsWith(normalExt)) return p;
  return p + normalExt;
}

/**
 * Change the extension of a path to a new extension.
 * The new extension should include the leading dot, e.g. '.js'.
 */
export function changeExtension(p: string, newExt: string): string {
  const normalExt = newExt.startsWith('.') ? newExt : '.' + newExt;
  const current = extname(p);
  if (current) {
    return p.slice(0, p.length - current.length) + normalExt;
  }
  return p + normalExt;
}

/**
 * Remove the extension from a path, returning the path without extension.
 */
export function stripExtension(p: string): string {
  const ext = extname(p);
  if (!ext) return p;
  return p.slice(0, p.length - ext.length);
}

/**
 * Ensure the path ends with a trailing slash.
 */
export function ensureTrailingSlash(p: string): string {
  return p.endsWith('/') ? p : p + '/';
}

/**
 * Remove a trailing slash from a path (unless the path is just '/').
 */
export function stripTrailingSlash(p: string): string {
  if (p === '/') return p;
  return p.endsWith('/') ? p.slice(0, -1) : p;
}

/**
 * Ensure the path starts with a leading slash.
 */
export function ensureLeadingSlash(p: string): string {
  return p.startsWith('/') ? p : '/' + p;
}

/**
 * Return true if `child` is a sub-path of `parent`.
 * Both paths are normalised before comparison.
 */
export function isSubPath(parent: string, child: string): boolean {
  const normParent = toPosix(nodePath.normalize(parent)).replace(/\/$/, '');
  const normChild = toPosix(nodePath.normalize(child)).replace(/\/$/, '');
  if (normChild === normParent) return false;
  return normChild.startsWith(normParent + '/');
}

/**
 * Find the longest common ancestor path from an array of paths.
 * Returns '/' if there is no common prefix beyond root, or '' for empty input.
 */
export function commonAncestor(paths: string[]): string {
  if (paths.length === 0) return '';
  if (paths.length === 1) return dirname(toPosix(paths[0]));

  // Split each path into segments
  const splitAll = paths.map((p) => toPosix(nodePath.normalize(p)).split('/'));

  const first = splitAll[0];
  let commonParts: string[] = [];

  for (let i = 0; i < first.length; i++) {
    const seg = first[i];
    if (splitAll.every((segs) => segs[i] === seg)) {
      commonParts.push(seg);
    } else {
      break;
    }
  }

  const result = commonParts.join('/');
  if (result === '') return '/';
  return result;
}

/**
 * Return the depth (number of non-empty segments) of a path.
 */
export function depth(p: string): number {
  return segments(p).length;
}

/**
 * Split a path into its non-empty segments.
 */
export function segments(p: string): string[] {
  return toPosix(p).split('/').filter((s) => s !== '');
}

/**
 * Replace all backslashes with forward slashes (Windows → POSIX).
 */
export function toPosix(p: string): string {
  return p.replace(/\\/g, '/');
}

/**
 * Prefix every non-empty segment of a path with a namespace string.
 * E.g. toNamespaced('/a/b', 'ns') => '/ns:a/ns:b'
 */
export function toNamespaced(p: string, namespace: string): string {
  const posix = toPosix(p);
  const leading = posix.startsWith('/') ? '/' : '';
  const segs = posix.split('/').filter((s) => s !== '');
  return leading + segs.map((s) => namespace + ':' + s).join('/');
}

/**
 * Keep only the first `maxDepth` segments of a path.
 * The leading slash is preserved for absolute paths.
 */
export function truncatePath(p: string, maxDepth: number): string {
  const posix = toPosix(p);
  const leading = posix.startsWith('/') ? '/' : '';
  const segs = posix.split('/').filter((s) => s !== '');
  return leading + segs.slice(0, maxDepth).join('/');
}
