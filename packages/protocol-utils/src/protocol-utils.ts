// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Proprietary and confidential.

export function parseQueryString(qs: string): Record<string, string> {
  const result: Record<string, string> = {};
  const clean = qs.startsWith('?') ? qs.slice(1) : qs;
  if (!clean) return result;
  for (const pair of clean.split('&')) {
    const [key, value = ''] = pair.split('=');
    if (key) result[decodeURIComponent(key)] = decodeURIComponent(value);
  }
  return result;
}

export function buildQueryString(params: Record<string, string | number | boolean>): string {
  const parts = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
  return parts.length ? `?${parts.join('&')}` : '';
}

export function parseUrl(url: string): { protocol: string; host: string; pathname: string; search: string; hash: string } {
  try {
    const u = new URL(url);
    return { protocol: u.protocol, host: u.host, pathname: u.pathname, search: u.search, hash: u.hash };
  } catch {
    return { protocol: '', host: '', pathname: url, search: '', hash: '' };
  }
}

export function isValidUrl(url: string): boolean {
  try { new URL(url); return true; } catch { return false; }
}

export function isValidHttpUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch { return false; }
}

export function parseHttpMethod(method: string): string {
  return method.toUpperCase().trim();
}

export function isValidHttpMethod(method: string): boolean {
  return ['GET','POST','PUT','PATCH','DELETE','HEAD','OPTIONS','TRACE','CONNECT'].includes(method.toUpperCase());
}

export function parseStatusCode(code: number): { code: number; category: string; description: string } {
  let category: string;
  if (code >= 100 && code < 200) category = 'Informational';
  else if (code >= 200 && code < 300) category = 'Success';
  else if (code >= 300 && code < 400) category = 'Redirection';
  else if (code >= 400 && code < 500) category = 'Client Error';
  else if (code >= 500 && code < 600) category = 'Server Error';
  else category = 'Unknown';
  const descriptions: Record<number, string> = {
    200: 'OK', 201: 'Created', 204: 'No Content', 301: 'Moved Permanently',
    302: 'Found', 400: 'Bad Request', 401: 'Unauthorized', 403: 'Forbidden',
    404: 'Not Found', 500: 'Internal Server Error', 503: 'Service Unavailable'
  };
  return { code, category, description: descriptions[code] ?? '' };
}

export function isSuccessStatus(code: number): boolean {
  return code >= 200 && code < 300;
}

export function isClientError(code: number): boolean {
  return code >= 400 && code < 500;
}

export function isServerError(code: number): boolean {
  return code >= 500 && code < 600;
}

export function parseHeaders(raw: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const line of raw.split('\n')) {
    const idx = line.indexOf(':');
    if (idx > 0) {
      const key = line.slice(0, idx).trim().toLowerCase();
      const value = line.slice(idx + 1).trim();
      result[key] = value;
    }
  }
  return result;
}

export function buildHeaders(headers: Record<string, string>): string {
  return Object.entries(headers).map(([k, v]) => `${k}: ${v}`).join('\n');
}

export function parseMimeType(contentType: string): { type: string; subtype: string; params: Record<string, string> } {
  const parts = contentType.split(';').map(p => p.trim());
  const [type = '', subtype = ''] = (parts[0] ?? '').split('/');
  const params: Record<string, string> = {};
  for (const p of parts.slice(1)) {
    const [k, v = ''] = p.split('=');
    if (k) params[k.trim()] = v.trim().replace(/^"|"$/g, '');
  }
  return { type, subtype, params };
}

export function isJsonMimeType(contentType: string): boolean {
  return contentType.toLowerCase().includes('application/json');
}

export function encodeFormData(data: Record<string, string>): string {
  return Object.entries(data)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
}

export function decodeFormData(data: string): Record<string, string> {
  return parseQueryString(data);
}

export function generateBoundary(): string {
  return '----FormBoundary' + Math.random().toString(36).slice(2);
}

export function extractPathParams(template: string, path: string): Record<string, string> | null {
  const templateParts = template.split('/');
  const pathParts = path.split('/');
  if (templateParts.length !== pathParts.length) return null;
  const params: Record<string, string> = {};
  for (let i = 0; i < templateParts.length; i++) {
    const t = templateParts[i];
    if (t.startsWith(':')) {
      params[t.slice(1)] = pathParts[i];
    } else if (t !== pathParts[i]) {
      return null;
    }
  }
  return params;
}

export function normalizePath(path: string): string {
  const parts = path.split('/').filter(p => p !== '');
  const result: string[] = [];
  for (const part of parts) {
    if (part === '..') result.pop();
    else if (part !== '.') result.push(part);
  }
  return '/' + result.join('/');
}
