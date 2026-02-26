// Copyright (c) 2026 Nexara DMCC. All rights reserved.

// ─── IP Address Utilities ────────────────────────────────────────────────────

export function isValidIPv4(ip: string): boolean {
  if (typeof ip !== 'string') return false;
  const parts = ip.split('.');
  if (parts.length !== 4) return false;
  return parts.every((part) => {
    if (part === '' || part.length > 3) return false;
    if (part.length > 1 && part[0] === '0') return false; // no leading zeros
    const n = Number(part);
    return Number.isInteger(n) && n >= 0 && n <= 255 && String(n) === part;
  });
}

export function isValidIPv6(ip: string): boolean {
  if (typeof ip !== 'string') return false;
  // Handle :: compressed notation
  const full = ip;

  // Basic structural checks
  if (full.includes(':::')) return false;

  const doubleColonCount = (full.match(/::/g) || []).length;
  if (doubleColonCount > 1) return false;

  let groups: string[];
  if (full.includes('::')) {
    const [left, right] = full.split('::');
    const leftGroups = left ? left.split(':') : [];
    const rightGroups = right ? right.split(':') : [];
    if (leftGroups.length + rightGroups.length > 7) return false;
    groups = [...leftGroups, ...rightGroups];
  } else {
    groups = full.split(':');
    if (groups.length !== 8) return false;
  }

  return groups.every((g) => /^[0-9a-fA-F]{1,4}$/.test(g));
}

export function isPrivateIP(ip: string): boolean {
  if (!isValidIPv4(ip)) return false;
  const parts = ip.split('.').map(Number);
  const [a, b] = parts;
  // 10.0.0.0/8
  if (a === 10) return true;
  // 172.16.0.0/12
  if (a === 172 && b >= 16 && b <= 31) return true;
  // 192.168.0.0/16
  if (a === 192 && b === 168) return true;
  return false;
}

export function isLoopback(ip: string): boolean {
  if (ip === '::1') return true;
  if (!isValidIPv4(ip)) return false;
  const parts = ip.split('.').map(Number);
  return parts[0] === 127;
}

export function ipToNumber(ip: string): number {
  if (!isValidIPv4(ip)) throw new Error(`Invalid IPv4: ${ip}`);
  const parts = ip.split('.').map(Number);
  return (
    (parts[0] << 24 | parts[1] << 16 | parts[2] << 8 | parts[3]) >>> 0
  );
}

export function numberToIp(n: number): string {
  if (!Number.isInteger(n) || n < 0 || n > 4294967295) {
    throw new Error(`Invalid number: ${n}`);
  }
  const a = (n >>> 24) & 0xff;
  const b = (n >>> 16) & 0xff;
  const c = (n >>> 8) & 0xff;
  const d = n & 0xff;
  return `${a}.${b}.${c}.${d}`;
}

export function getNetworkAddress(ip: string, mask: string): string {
  const ipNum = ipToNumber(ip);
  const maskNum = ipToNumber(mask);
  return numberToIp((ipNum & maskNum) >>> 0);
}

export function getBroadcastAddress(ip: string, mask: string): string {
  const ipNum = ipToNumber(ip);
  const maskNum = ipToNumber(mask);
  const wildcard = (~maskNum) >>> 0;
  return numberToIp(((ipNum & maskNum) | wildcard) >>> 0);
}

export function isInSubnet(ip: string, subnet: string, mask: string): boolean {
  const ipNum = ipToNumber(ip);
  const subnetNum = ipToNumber(subnet);
  const maskNum = ipToNumber(mask);
  return ((ipNum & maskNum) >>> 0) === ((subnetNum & maskNum) >>> 0);
}

export function cidrToMask(cidr: number): string {
  if (!Number.isInteger(cidr) || cidr < 0 || cidr > 32) {
    throw new Error(`Invalid CIDR: ${cidr}`);
  }
  if (cidr === 0) return '0.0.0.0';
  const mask = (0xffffffff << (32 - cidr)) >>> 0;
  return numberToIp(mask);
}

export function maskToCidr(mask: string): number {
  const maskNum = ipToNumber(mask);
  let count = 0;
  let n = maskNum;
  while (n & 0x80000000) {
    count++;
    n = (n << 1) >>> 0;
  }
  // Validate: remaining bits must be 0
  if ((n & 0xffffffff) !== 0) throw new Error(`Invalid mask: ${mask}`);
  return count;
}

// ─── Port Utilities ───────────────────────────────────────────────────────────

export function isValidPort(port: number): boolean {
  return Number.isInteger(port) && port >= 1 && port <= 65535;
}

export function isWellKnownPort(port: number): boolean {
  return Number.isInteger(port) && port >= 0 && port < 1024;
}

export function isRegisteredPort(port: number): boolean {
  return Number.isInteger(port) && port >= 1024 && port <= 49151;
}

export function isDynamicPort(port: number): boolean {
  return Number.isInteger(port) && port >= 49152 && port <= 65535;
}

// ─── HTTP Status Utilities ────────────────────────────────────────────────────

export function isValidStatusCode(code: number): boolean {
  return Number.isInteger(code) && code >= 100 && code <= 599;
}

export function isSuccessStatus(code: number): boolean {
  return Number.isInteger(code) && code >= 200 && code <= 299;
}

export function isRedirectStatus(code: number): boolean {
  return Number.isInteger(code) && code >= 300 && code <= 399;
}

export function isClientErrorStatus(code: number): boolean {
  return Number.isInteger(code) && code >= 400 && code <= 499;
}

export function isServerErrorStatus(code: number): boolean {
  return Number.isInteger(code) && code >= 500 && code <= 599;
}

const STATUS_TEXTS: Record<number, string> = {
  100: 'Continue',
  101: 'Switching Protocols',
  102: 'Processing',
  103: 'Early Hints',
  200: 'OK',
  201: 'Created',
  202: 'Accepted',
  203: 'Non-Authoritative Information',
  204: 'No Content',
  205: 'Reset Content',
  206: 'Partial Content',
  207: 'Multi-Status',
  208: 'Already Reported',
  226: 'IM Used',
  300: 'Multiple Choices',
  301: 'Moved Permanently',
  302: 'Found',
  303: 'See Other',
  304: 'Not Modified',
  305: 'Use Proxy',
  307: 'Temporary Redirect',
  308: 'Permanent Redirect',
  400: 'Bad Request',
  401: 'Unauthorized',
  402: 'Payment Required',
  403: 'Forbidden',
  404: 'Not Found',
  405: 'Method Not Allowed',
  406: 'Not Acceptable',
  407: 'Proxy Authentication Required',
  408: 'Request Timeout',
  409: 'Conflict',
  410: 'Gone',
  411: 'Length Required',
  412: 'Precondition Failed',
  413: 'Payload Too Large',
  414: 'URI Too Long',
  415: 'Unsupported Media Type',
  416: 'Range Not Satisfiable',
  417: 'Expectation Failed',
  418: "I'm a Teapot",
  421: 'Misdirected Request',
  422: 'Unprocessable Entity',
  423: 'Locked',
  424: 'Failed Dependency',
  425: 'Too Early',
  426: 'Upgrade Required',
  428: 'Precondition Required',
  429: 'Too Many Requests',
  431: 'Request Header Fields Too Large',
  451: 'Unavailable For Legal Reasons',
  500: 'Internal Server Error',
  501: 'Not Implemented',
  502: 'Bad Gateway',
  503: 'Service Unavailable',
  504: 'Gateway Timeout',
  505: 'HTTP Version Not Supported',
  506: 'Variant Also Negotiates',
  507: 'Insufficient Storage',
  508: 'Loop Detected',
  510: 'Not Extended',
  511: 'Network Authentication Required',
};

export function getStatusText(code: number): string {
  return STATUS_TEXTS[code] ?? 'Unknown Status';
}

// ─── URL / Domain Utilities ───────────────────────────────────────────────────

export function isValidDomain(domain: string): boolean {
  if (typeof domain !== 'string' || domain.length === 0 || domain.length > 253)
    return false;
  // No leading/trailing dots
  if (domain.startsWith('.') || domain.endsWith('.')) return false;
  const labels = domain.split('.');
  if (labels.length < 2) return false;
  return labels.every((label) => {
    if (label.length === 0 || label.length > 63) return false;
    if (label.startsWith('-') || label.endsWith('-')) return false;
    return /^[a-zA-Z0-9-]+$/.test(label);
  });
}

export function isValidHostname(hostname: string): boolean {
  if (typeof hostname !== 'string' || hostname.length === 0) return false;
  // Allow single-label hostnames (e.g. "localhost")
  if (hostname.length > 253) return false;
  if (hostname.startsWith('.') || hostname.endsWith('.')) return false;
  const labels = hostname.split('.');
  return labels.every((label) => {
    if (label.length === 0 || label.length > 63) return false;
    if (label.startsWith('-') || label.endsWith('-')) return false;
    return /^[a-zA-Z0-9-]+$/.test(label);
  });
}

export function extractSubdomain(hostname: string): string | null {
  if (!isValidHostname(hostname)) return null;
  const labels = hostname.split('.');
  // Need at least 3 labels to have a subdomain (sub.domain.tld)
  if (labels.length < 3) return null;
  return labels.slice(0, labels.length - 2).join('.');
}

export function extractTLD(hostname: string): string {
  const labels = hostname.split('.');
  return labels[labels.length - 1];
}

// ─── MAC Address Utilities ────────────────────────────────────────────────────

export function isValidMac(mac: string): boolean {
  if (typeof mac !== 'string') return false;
  return /^([0-9a-fA-F]{2})([:|-][0-9a-fA-F]{2}){5}$/.test(mac);
}

export function normalizeMac(mac: string): string {
  if (!isValidMac(mac)) throw new Error(`Invalid MAC address: ${mac}`);
  return mac.replace(/-/g, ':').toUpperCase();
}
