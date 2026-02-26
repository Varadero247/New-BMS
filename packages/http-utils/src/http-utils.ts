// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import * as crypto from 'crypto';
import type { StatusInfo, ContentType, ParsedUrl } from './types';

// ─── HTTP Status Codes ────────────────────────────────────────────────────────

export const HTTP_STATUS: Record<number, StatusInfo> = {
  // 1xx Informational
  100: { code: 100, text: 'Continue', category: 'informational' },
  101: { code: 101, text: 'Switching Protocols', category: 'informational' },
  102: { code: 102, text: 'Processing', category: 'informational' },
  103: { code: 103, text: 'Early Hints', category: 'informational' },

  // 2xx Success
  200: { code: 200, text: 'OK', category: 'success' },
  201: { code: 201, text: 'Created', category: 'success' },
  202: { code: 202, text: 'Accepted', category: 'success' },
  203: { code: 203, text: 'Non-Authoritative Information', category: 'success' },
  204: { code: 204, text: 'No Content', category: 'success' },
  205: { code: 205, text: 'Reset Content', category: 'success' },
  206: { code: 206, text: 'Partial Content', category: 'success' },
  207: { code: 207, text: 'Multi-Status', category: 'success' },
  208: { code: 208, text: 'Already Reported', category: 'success' },
  226: { code: 226, text: 'IM Used', category: 'success' },

  // 3xx Redirection
  300: { code: 300, text: 'Multiple Choices', category: 'redirection' },
  301: { code: 301, text: 'Moved Permanently', category: 'redirection' },
  302: { code: 302, text: 'Found', category: 'redirection' },
  303: { code: 303, text: 'See Other', category: 'redirection' },
  304: { code: 304, text: 'Not Modified', category: 'redirection' },
  307: { code: 307, text: 'Temporary Redirect', category: 'redirection' },
  308: { code: 308, text: 'Permanent Redirect', category: 'redirection' },

  // 4xx Client Errors
  400: { code: 400, text: 'Bad Request', category: 'client-error' },
  401: { code: 401, text: 'Unauthorized', category: 'client-error' },
  402: { code: 402, text: 'Payment Required', category: 'client-error' },
  403: { code: 403, text: 'Forbidden', category: 'client-error' },
  404: { code: 404, text: 'Not Found', category: 'client-error' },
  405: { code: 405, text: 'Method Not Allowed', category: 'client-error' },
  406: { code: 406, text: 'Not Acceptable', category: 'client-error' },
  407: { code: 407, text: 'Proxy Authentication Required', category: 'client-error' },
  408: { code: 408, text: 'Request Timeout', category: 'client-error' },
  409: { code: 409, text: 'Conflict', category: 'client-error' },
  410: { code: 410, text: 'Gone', category: 'client-error' },
  411: { code: 411, text: 'Length Required', category: 'client-error' },
  412: { code: 412, text: 'Precondition Failed', category: 'client-error' },
  413: { code: 413, text: 'Payload Too Large', category: 'client-error' },
  414: { code: 414, text: 'URI Too Long', category: 'client-error' },
  415: { code: 415, text: 'Unsupported Media Type', category: 'client-error' },
  416: { code: 416, text: 'Range Not Satisfiable', category: 'client-error' },
  417: { code: 417, text: 'Expectation Failed', category: 'client-error' },
  418: { code: 418, text: "I'm a Teapot", category: 'client-error' },
  421: { code: 421, text: 'Misdirected Request', category: 'client-error' },
  422: { code: 422, text: 'Unprocessable Entity', category: 'client-error' },
  423: { code: 423, text: 'Locked', category: 'client-error' },
  424: { code: 424, text: 'Failed Dependency', category: 'client-error' },
  425: { code: 425, text: 'Too Early', category: 'client-error' },
  426: { code: 426, text: 'Upgrade Required', category: 'client-error' },
  428: { code: 428, text: 'Precondition Required', category: 'client-error' },
  429: { code: 429, text: 'Too Many Requests', category: 'client-error' },
  431: { code: 431, text: 'Request Header Fields Too Large', category: 'client-error' },
  451: { code: 451, text: 'Unavailable For Legal Reasons', category: 'client-error' },

  // 5xx Server Errors
  500: { code: 500, text: 'Internal Server Error', category: 'server-error' },
  501: { code: 501, text: 'Not Implemented', category: 'server-error' },
  502: { code: 502, text: 'Bad Gateway', category: 'server-error' },
  503: { code: 503, text: 'Service Unavailable', category: 'server-error' },
  504: { code: 504, text: 'Gateway Timeout', category: 'server-error' },
  505: { code: 505, text: 'HTTP Version Not Supported', category: 'server-error' },
  506: { code: 506, text: 'Variant Also Negotiates', category: 'server-error' },
  507: { code: 507, text: 'Insufficient Storage', category: 'server-error' },
  508: { code: 508, text: 'Loop Detected', category: 'server-error' },
  510: { code: 510, text: 'Not Extended', category: 'server-error' },
  511: { code: 511, text: 'Network Authentication Required', category: 'server-error' },
};

export function getStatus(code: number): StatusInfo | undefined {
  return HTTP_STATUS[code];
}

export function getStatusText(code: number): string {
  return HTTP_STATUS[code]?.text ?? 'Unknown';
}

export function isSuccess(code: number): boolean {
  return code >= 200 && code <= 299;
}

export function isRedirect(code: number): boolean {
  return code >= 300 && code <= 399;
}

export function isClientError(code: number): boolean {
  return code >= 400 && code <= 499;
}

export function isServerError(code: number): boolean {
  return code >= 500 && code <= 599;
}

export function isError(code: number): boolean {
  return code >= 400;
}

export function getCategory(code: number): StatusInfo['category'] | 'unknown' {
  return HTTP_STATUS[code]?.category ?? 'unknown';
}

export function isRetryable(code: number): boolean {
  return [429, 500, 502, 503, 504].includes(code);
}

// ─── MIME Types ───────────────────────────────────────────────────────────────

export const MIME_TYPES: Record<string, string> = {
  json: 'application/json',
  html: 'text/html',
  htm: 'text/html',
  css: 'text/css',
  js: 'application/javascript',
  mjs: 'application/javascript',
  ts: 'application/typescript',
  xml: 'application/xml',
  txt: 'text/plain',
  csv: 'text/csv',
  md: 'text/markdown',
  pdf: 'application/pdf',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  svg: 'image/svg+xml',
  webp: 'image/webp',
  ico: 'image/x-icon',
  bmp: 'image/bmp',
  mp4: 'video/mp4',
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  ogg: 'audio/ogg',
  webm: 'video/webm',
  woff: 'font/woff',
  woff2: 'font/woff2',
  ttf: 'font/ttf',
  eot: 'application/vnd.ms-fontobject',
  zip: 'application/zip',
  tar: 'application/x-tar',
  gz: 'application/gzip',
  rar: 'application/vnd.rar',
  '7z': 'application/x-7z-compressed',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  yaml: 'application/yaml',
  yml: 'application/yaml',
  toml: 'application/toml',
  ini: 'text/plain',
  sh: 'application/x-sh',
  py: 'text/x-python',
  go: 'text/x-go',
  rs: 'text/x-rust',
  rb: 'text/x-ruby',
  php: 'application/x-httpd-php',
  java: 'text/x-java-source',
};

export function getMimeType(ext: string): string {
  return MIME_TYPES[ext.toLowerCase().replace(/^\./, '')] ?? 'application/octet-stream';
}

export function getExtension(mimeType: string): string | undefined {
  const normalized = mimeType.toLowerCase().split(';')[0].trim();
  return Object.entries(MIME_TYPES).find(([, v]) => v === normalized)?.[0];
}

export function isTextMime(mimeType: string): boolean {
  const base = mimeType.split(';')[0].trim().toLowerCase();
  return (
    base.startsWith('text/') ||
    base === 'application/json' ||
    base === 'application/xml' ||
    base === 'application/javascript' ||
    base === 'application/typescript' ||
    base === 'application/yaml' ||
    base === 'application/toml'
  );
}

// ─── Header Utilities ─────────────────────────────────────────────────────────

export const COMMON_HEADERS: Record<string, string> = {
  CONTENT_TYPE: 'Content-Type',
  AUTHORIZATION: 'Authorization',
  ACCEPT: 'Accept',
  ACCEPT_LANGUAGE: 'Accept-Language',
  ACCEPT_ENCODING: 'Accept-Encoding',
  CACHE_CONTROL: 'Cache-Control',
  CONNECTION: 'Connection',
  HOST: 'Host',
  ORIGIN: 'Origin',
  REFERER: 'Referer',
  USER_AGENT: 'User-Agent',
  X_REQUEST_ID: 'X-Request-ID',
  X_CORRELATION_ID: 'X-Correlation-ID',
  X_FORWARDED_FOR: 'X-Forwarded-For',
  X_REAL_IP: 'X-Real-IP',
  X_API_KEY: 'X-API-Key',
  X_TIMESTAMP: 'X-Timestamp',
  X_SIGNATURE: 'X-Signature',
};

export function buildAuthHeader(token: string, scheme = 'Bearer'): string {
  return `${scheme} ${token}`;
}

export function parseBasicAuth(header: string): { username: string; password: string } | null {
  const match = header.match(/^Basic\s+(.+)$/i);
  if (!match) return null;
  try {
    const decoded = Buffer.from(match[1], 'base64').toString('utf8');
    const colonIdx = decoded.indexOf(':');
    if (colonIdx === -1) return null;
    return {
      username: decoded.slice(0, colonIdx),
      password: decoded.slice(colonIdx + 1),
    };
  } catch {
    return null;
  }
}

export function parseBearerToken(header: string): string | null {
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : null;
}

export function buildContentType(type: string, charset?: string): string {
  return charset ? `${type}; charset=${charset}` : type;
}

export function parseContentType(header: string): ContentType {
  const parts = header.split(';').map((p) => p.trim());
  const [mainType] = parts;
  const [type, subtype] = (mainType ?? '').split('/');
  const parameters: Record<string, string> = {};
  for (let i = 1; i < parts.length; i++) {
    const eqIdx = parts[i].indexOf('=');
    if (eqIdx !== -1) {
      const key = parts[i].slice(0, eqIdx).trim().toLowerCase();
      const val = parts[i].slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
      parameters[key] = val;
    }
  }
  return { type: type ?? '', subtype: subtype ?? '', parameters };
}

export function parseAccept(header: string): Array<{ type: string; q: number }> {
  return header
    .split(',')
    .map((item) => {
      const parts = item.trim().split(';');
      const type = (parts[0] ?? '').trim();
      let q = 1.0;
      for (let i = 1; i < parts.length; i++) {
        const param = (parts[i] ?? '').trim();
        if (param.startsWith('q=')) {
          q = parseFloat(param.slice(2));
          if (isNaN(q)) q = 1.0;
        }
      }
      return { type, q };
    })
    .sort((a, b) => b.q - a.q);
}

export function negotiateContentType(accept: string, available: string[]): string | null {
  const accepted = parseAccept(accept);
  for (const { type } of accepted) {
    if (type === '*/*') return available[0] ?? null;
    const [acceptType, acceptSubtype] = type.split('/');
    for (const avail of available) {
      if (avail === type) return avail;
      if (acceptSubtype === '*') {
        const [availType] = avail.split('/');
        if (availType === acceptType) return avail;
      }
    }
  }
  return null;
}

export interface CacheControlOptions {
  maxAge?: number;
  noCache?: boolean;
  noStore?: boolean;
  mustRevalidate?: boolean;
  public?: boolean;
  private?: boolean;
  immutable?: boolean;
  sMaxAge?: number;
  staleWhileRevalidate?: number;
}

export function buildCacheControl(options: CacheControlOptions): string {
  const directives: string[] = [];
  if (options.public) directives.push('public');
  if (options.private) directives.push('private');
  if (options.noCache) directives.push('no-cache');
  if (options.noStore) directives.push('no-store');
  if (options.mustRevalidate) directives.push('must-revalidate');
  if (options.immutable) directives.push('immutable');
  if (options.maxAge !== undefined) directives.push(`max-age=${options.maxAge}`);
  if (options.sMaxAge !== undefined) directives.push(`s-maxage=${options.sMaxAge}`);
  if (options.staleWhileRevalidate !== undefined) directives.push(`stale-while-revalidate=${options.staleWhileRevalidate}`);
  return directives.join(', ');
}

export function parseCacheControl(header: string): Record<string, string | boolean> {
  const result: Record<string, string | boolean> = {};
  for (const part of header.split(',')) {
    const trimmed = part.trim();
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      result[trimmed.slice(0, eqIdx).trim().toLowerCase()] = trimmed.slice(eqIdx + 1).trim();
    } else if (trimmed) {
      result[trimmed.toLowerCase()] = true;
    }
  }
  return result;
}

// ─── URL Utilities ────────────────────────────────────────────────────────────

export function buildUrl(
  base: string,
  path: string,
  params?: Record<string, string | number | boolean>,
): string {
  const normalizedBase = base.replace(/\/+$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  let url = `${normalizedBase}${normalizedPath}`;
  if (params && Object.keys(params).length > 0) {
    url += `?${encodeQueryString(params)}`;
  }
  return url;
}

export function parseUrl(url: string): ParsedUrl {
  try {
    const u = new URL(url);
    const params: Record<string, string> = {};
    u.searchParams.forEach((value, key) => {
      params[key] = value;
    });
    return {
      protocol: u.protocol.replace(/:$/, ''),
      host: u.host,
      hostname: u.hostname,
      port: u.port,
      pathname: u.pathname,
      search: u.search,
      hash: u.hash,
      params,
    };
  } catch {
    return {
      protocol: '',
      host: '',
      hostname: '',
      port: '',
      pathname: url,
      search: '',
      hash: '',
      params: {},
    };
  }
}

export function addQueryParams(
  url: string,
  params: Record<string, string | number | boolean>,
): string {
  const [base, existing] = url.split('?');
  const existingParams = existing ? decodeQueryString(existing) : {};
  const merged: Record<string, string> = { ...existingParams };
  for (const [k, v] of Object.entries(params)) {
    merged[k] = String(v);
  }
  const qs = encodeQueryString(merged);
  return qs ? `${base}?${qs}` : (base ?? '');
}

export function removeQueryParam(url: string, key: string): string {
  const [base, existing] = url.split('?');
  if (!existing) return url;
  const params = decodeQueryString(existing);
  delete params[key];
  const qs = encodeQueryString(params);
  return qs ? `${base}?${qs}` : (base ?? '');
}

export function getQueryParam(url: string, key: string): string | null {
  const qIdx = url.indexOf('?');
  if (qIdx === -1) return null;
  const params = decodeQueryString(url.slice(qIdx + 1));
  return params[key] ?? null;
}

export function getAllQueryParams(url: string): Record<string, string> {
  const qIdx = url.indexOf('?');
  if (qIdx === -1) return {};
  return decodeQueryString(url.slice(qIdx + 1));
}

export function isAbsoluteUrl(url: string): boolean {
  return /^[a-zA-Z][a-zA-Z0-9+\-.]*:\/\//.test(url);
}

export function isRelativeUrl(url: string): boolean {
  return !isAbsoluteUrl(url);
}

export function joinPaths(...parts: string[]): string {
  const segments: string[] = [];
  for (let i = 0; i < parts.length; i++) {
    let part = parts[i] ?? '';
    if (i > 0) part = part.replace(/^\/+/, '');
    part = part.replace(/\/+$/, '');
    if (part) segments.push(part);
  }
  const result = segments.join('/');
  const leadingSlash = parts[0]?.startsWith('/') ? '/' : '';
  return leadingSlash + result.replace(/^\//, '');
}

export function encodeQueryString(
  params: Record<string, string | number | boolean | undefined>,
): string {
  return Object.entries(params)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&');
}

export function decodeQueryString(qs: string): Record<string, string> {
  const result: Record<string, string> = {};
  if (!qs) return result;
  const cleaned = qs.startsWith('?') ? qs.slice(1) : qs;
  for (const pair of cleaned.split('&')) {
    if (!pair) continue;
    const eqIdx = pair.indexOf('=');
    if (eqIdx === -1) {
      result[decodeURIComponent(pair)] = '';
    } else {
      const key = decodeURIComponent(pair.slice(0, eqIdx));
      const val = decodeURIComponent(pair.slice(eqIdx + 1));
      result[key] = val;
    }
  }
  return result;
}

// ─── Request Signing ──────────────────────────────────────────────────────────

const SIGNATURE_MAX_AGE_SECONDS = 300; // 5 minutes

export function buildHmacSignature(
  secret: string,
  method: string,
  path: string,
  timestamp: number,
  body?: string,
): string {
  const payload = [method.toUpperCase(), path, String(timestamp), body ?? ''].join('\n');
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

export function buildSignedHeaders(
  secret: string,
  method: string,
  path: string,
  body?: string,
): Record<string, string> {
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = buildHmacSignature(secret, method, path, timestamp, body);
  return {
    'X-Timestamp': String(timestamp),
    'X-Signature': signature,
  };
}

export function verifySignature(
  secret: string,
  method: string,
  path: string,
  timestamp: number,
  signature: string,
  body?: string,
): boolean {
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - timestamp) > SIGNATURE_MAX_AGE_SECONDS) return false;
  const expected = buildHmacSignature(secret, method, path, timestamp, body);
  try {
    return crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(signature, 'hex'));
  } catch {
    return false;
  }
}

// ─── Retry Helpers ────────────────────────────────────────────────────────────

const MAX_RETRY_DELAY_MS = 30_000;

export function getRetryDelay(attempt: number, baseMs = 100): number {
  const delay = baseMs * Math.pow(2, attempt);
  return Math.min(delay, MAX_RETRY_DELAY_MS);
}

export function shouldRetry(
  statusCode: number,
  attempt: number,
  maxAttempts = 3,
): boolean {
  if (attempt >= maxAttempts) return false;
  return isRetryable(statusCode);
}
