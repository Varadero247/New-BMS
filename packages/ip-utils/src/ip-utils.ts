// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import { IPv4Parts, CIDRInfo, IPVersion } from './types';

// ─── IPv4 Validation & Parsing ───────────────────────────────────────────────

export function isValidIPv4(ip: string): boolean {
  if (typeof ip !== 'string') return false;
  const parts = ip.split('.');
  if (parts.length !== 4) return false;
  for (const part of parts) {
    if (!/^\d+$/.test(part)) return false;
    if (part.length > 1 && part[0] === '0') return false; // no leading zeros
    const n = parseInt(part, 10);
    if (n < 0 || n > 255) return false;
  }
  return true;
}

export function parseIPv4(ip: string): IPv4Parts | null {
  if (!isValidIPv4(ip)) return null;
  const [a, b, c, d] = ip.split('.').map(Number);
  return { a, b, c, d };
}

export function ipv4ToNumber(ip: string): number {
  const parts = parseIPv4(ip);
  if (!parts) return 0;
  return ((parts.a << 24) | (parts.b << 16) | (parts.c << 8) | parts.d) >>> 0;
}

export function numberToIPv4(n: number): string {
  const num = n >>> 0;
  return [
    (num >>> 24) & 0xff,
    (num >>> 16) & 0xff,
    (num >>> 8) & 0xff,
    num & 0xff,
  ].join('.');
}

export function ipv4ToHex(ip: string): string {
  const n = ipv4ToNumber(ip);
  return n.toString(16).padStart(8, '0');
}

export function hexToIPv4(hex: string): string {
  const clean = hex.replace(/^0x/i, '').padStart(8, '0');
  const n = parseInt(clean, 16);
  return numberToIPv4(n);
}

export function ipv4ToBinary(ip: string): string {
  const n = ipv4ToNumber(ip);
  return n.toString(2).padStart(32, '0');
}

export function binaryToIPv4(bin: string): string {
  const padded = bin.padStart(32, '0').slice(-32);
  const n = parseInt(padded, 2) >>> 0;
  return numberToIPv4(n);
}

export function incrementIPv4(ip: string, by: number = 1): string {
  const n = ipv4ToNumber(ip);
  return numberToIPv4((n + by) >>> 0);
}

export function decrementIPv4(ip: string, by: number = 1): string {
  const n = ipv4ToNumber(ip);
  return numberToIPv4((n - by) >>> 0);
}

export function compareIPv4(a: string, b: string): -1 | 0 | 1 {
  const na = ipv4ToNumber(a);
  const nb = ipv4ToNumber(b);
  if (na < nb) return -1;
  if (na > nb) return 1;
  return 0;
}

// ─── IPv4 Classification ─────────────────────────────────────────────────────

export function isPrivateIPv4(ip: string): boolean {
  if (!isValidIPv4(ip)) return false;
  const parts = parseIPv4(ip);
  if (!parts) return false;
  const { a, b } = parts;
  // 10.0.0.0/8
  if (a === 10) return true;
  // 172.16.0.0/12
  if (a === 172 && b >= 16 && b <= 31) return true;
  // 192.168.0.0/16
  if (a === 192 && b === 168) return true;
  return false;
}

export function isLoopbackIPv4(ip: string): boolean {
  if (!isValidIPv4(ip)) return false;
  const parts = parseIPv4(ip);
  if (!parts) return false;
  return parts.a === 127;
}

export function isMulticastIPv4(ip: string): boolean {
  if (!isValidIPv4(ip)) return false;
  const parts = parseIPv4(ip);
  if (!parts) return false;
  return parts.a >= 224 && parts.a <= 239;
}

export function isLinkLocalIPv4(ip: string): boolean {
  if (!isValidIPv4(ip)) return false;
  const parts = parseIPv4(ip);
  if (!parts) return false;
  return parts.a === 169 && parts.b === 254;
}

export function isBroadcastIPv4(ip: string): boolean {
  return ip === '255.255.255.255';
}

export function isPublicIPv4(ip: string): boolean {
  if (!isValidIPv4(ip)) return false;
  return (
    !isPrivateIPv4(ip) &&
    !isLoopbackIPv4(ip) &&
    !isMulticastIPv4(ip) &&
    !isLinkLocalIPv4(ip) &&
    !isBroadcastIPv4(ip)
  );
}

export function getIPv4Class(ip: string): 'A' | 'B' | 'C' | 'D' | 'E' | 'unknown' {
  if (!isValidIPv4(ip)) return 'unknown';
  const parts = parseIPv4(ip);
  if (!parts) return 'unknown';
  const a = parts.a;
  if (a >= 1 && a <= 126) return 'A';
  if (a >= 128 && a <= 191) return 'B';
  if (a >= 192 && a <= 223) return 'C';
  if (a >= 224 && a <= 239) return 'D';
  if (a >= 240 && a <= 255) return 'E';
  return 'unknown'; // 0.x.x.x and 127.x.x.x are reserved / loopback
}

// ─── CIDR ────────────────────────────────────────────────────────────────────

export function getCIDRMask(prefix: number): string {
  if (prefix < 0 || prefix > 32) return '0.0.0.0';
  const mask = prefix === 0 ? 0 : (~0 << (32 - prefix)) >>> 0;
  return numberToIPv4(mask);
}

export function getMaskPrefix(mask: string): number {
  if (!isValidIPv4(mask)) return -1;
  const n = ipv4ToNumber(mask);
  const bin = n.toString(2).padStart(32, '0');
  const firstZero = bin.indexOf('0');
  if (firstZero === -1) return 32;
  // Validate it's a valid contiguous mask
  if (bin.slice(firstZero).includes('1')) return -1;
  return firstZero;
}

export function getNetworkAddress(ip: string, prefix: number): string {
  const ipNum = ipv4ToNumber(ip);
  const maskNum = ipv4ToNumber(getCIDRMask(prefix));
  return numberToIPv4((ipNum & maskNum) >>> 0);
}

export function getBroadcastAddress(ip: string, prefix: number): string {
  const ipNum = ipv4ToNumber(ip);
  const maskNum = ipv4ToNumber(getCIDRMask(prefix));
  const wildcard = (~maskNum) >>> 0;
  return numberToIPv4(((ipNum & maskNum) | wildcard) >>> 0);
}

export function getFirstHost(ip: string, prefix: number): string {
  if (prefix === 32) return ip;
  if (prefix === 31) return getNetworkAddress(ip, prefix);
  const network = ipv4ToNumber(getNetworkAddress(ip, prefix));
  return numberToIPv4((network + 1) >>> 0);
}

export function getLastHost(ip: string, prefix: number): string {
  if (prefix === 32) return ip;
  if (prefix === 31) return getBroadcastAddress(ip, prefix);
  const broadcast = ipv4ToNumber(getBroadcastAddress(ip, prefix));
  return numberToIPv4((broadcast - 1) >>> 0);
}

export function getTotalHosts(prefix: number): number {
  if (prefix === 32) return 1;
  if (prefix === 31) return 2;
  return Math.pow(2, 32 - prefix) - 2;
}

export function parseCIDR(cidr: string): CIDRInfo | null {
  const parts = cidr.split('/');
  if (parts.length !== 2) return null;
  const ip = parts[0];
  const prefix = parseInt(parts[1], 10);
  if (!isValidIPv4(ip)) return null;
  if (isNaN(prefix) || prefix < 0 || prefix > 32) return null;

  const networkAddress = getNetworkAddress(ip, prefix);
  const broadcastAddress = getBroadcastAddress(ip, prefix);
  const firstHost = getFirstHost(ip, prefix);
  const lastHost = getLastHost(ip, prefix);
  const totalHosts = getTotalHosts(prefix);
  const mask = getCIDRMask(prefix);

  return { ip, prefix, networkAddress, broadcastAddress, firstHost, lastHost, totalHosts, mask };
}

export function isInCIDR(ip: string, cidr: string): boolean {
  if (!isValidIPv4(ip)) return false;
  const info = parseCIDR(cidr);
  if (!info) return false;
  const ipNum = ipv4ToNumber(ip);
  const networkNum = ipv4ToNumber(info.networkAddress);
  const broadcastNum = ipv4ToNumber(info.broadcastAddress);
  return ipNum >= networkNum && ipNum <= broadcastNum;
}

export function subnetContains(network: string, prefix: number, ip: string): boolean {
  return isInCIDR(ip, `${network}/${prefix}`);
}

export function cidrToRange(cidr: string): { start: string; end: string } | null {
  const info = parseCIDR(cidr);
  if (!info) return null;
  return { start: info.networkAddress, end: info.broadcastAddress };
}

export function ipRangeContains(start: string, end: string, ip: string): boolean {
  if (!isValidIPv4(start) || !isValidIPv4(end) || !isValidIPv4(ip)) return false;
  const startNum = ipv4ToNumber(start);
  const endNum = ipv4ToNumber(end);
  const ipNum = ipv4ToNumber(ip);
  return ipNum >= startNum && ipNum <= endNum;
}

export function summarizeCIDRs(cidrs: string[]): string[] {
  const valid = cidrs.filter(c => parseCIDR(c) !== null);
  const result: string[] = [];
  for (const cidr of valid) {
    const info = parseCIDR(cidr)!;
    const canonical = `${info.networkAddress}/${info.prefix}`;
    // Check if already covered by an existing result entry
    let covered = false;
    for (const existing of result) {
      if (isInCIDR(info.networkAddress, existing) && isInCIDR(info.broadcastAddress, existing)) {
        covered = true;
        break;
      }
    }
    if (!covered) {
      // Remove any entries in result covered by this new CIDR
      const filtered = result.filter(existing => {
        const eInfo = parseCIDR(existing)!;
        return !(isInCIDR(eInfo.networkAddress, canonical) && isInCIDR(eInfo.broadcastAddress, canonical));
      });
      filtered.push(canonical);
      result.length = 0;
      result.push(...filtered);
    }
  }
  return result;
}

// ─── IPv6 ────────────────────────────────────────────────────────────────────

export function isValidIPv6(ip: string): boolean {
  if (typeof ip !== 'string') return false;
  // Handle IPv4-mapped IPv6 like ::ffff:192.168.1.1
  const withoutBrackets = ip.replace(/^\[|\]$/g, '');
  // Basic structure check
  if (withoutBrackets.includes(':::')) return false;
  const doubleColonCount = (withoutBrackets.match(/::/g) || []).length;
  if (doubleColonCount > 1) return false;

  let expanded = withoutBrackets;
  // Handle ::
  if (expanded === '::') return true;

  // Split on ::
  if (expanded.includes('::')) {
    const [left, right] = expanded.split('::');
    const leftGroups = left ? left.split(':') : [];
    const rightGroups = right ? right.split(':') : [];
    const totalGroups = leftGroups.length + rightGroups.length;
    if (totalGroups > 7) return false;
    // Validate each group
    for (const g of [...leftGroups, ...rightGroups]) {
      if (g === '') return false;
      // Allow IPv4 in last group
      if (g.includes('.')) {
        if (!isValidIPv4(g)) return false;
        continue;
      }
      if (!/^[0-9a-fA-F]{1,4}$/.test(g)) return false;
    }
    return true;
  }

  // No ::, must have exactly 8 groups
  const groups = expanded.split(':');
  if (groups.length !== 8) return false;
  for (const g of groups) {
    if (!/^[0-9a-fA-F]{1,4}$/.test(g)) return false;
  }
  return true;
}

export function expandIPv6(ip: string): string {
  if (!isValidIPv6(ip)) return ip;
  if (ip === '::') return Array(8).fill('0000').join(':');

  let addr = ip;
  if (addr.includes('::')) {
    const [left, right] = addr.split('::');
    const leftGroups = left ? left.split(':') : [];
    const rightGroups = right ? right.split(':') : [];
    const missing = 8 - leftGroups.length - rightGroups.length;
    const middle = Array(missing).fill('0');
    const allGroups = [...leftGroups, ...middle, ...rightGroups];
    addr = allGroups.join(':');
  }

  return addr
    .split(':')
    .map(g => g.padStart(4, '0'))
    .join(':');
}

export function compressIPv6(ip: string): string {
  const expanded = expandIPv6(ip);
  if (!expanded.includes(':')) return ip;

  const groups = expanded.split(':').map(g => parseInt(g, 16).toString(16));

  // Find the longest run of zeros
  let bestStart = -1;
  let bestLen = 0;
  let currentStart = -1;
  let currentLen = 0;

  for (let i = 0; i < groups.length; i++) {
    if (groups[i] === '0') {
      if (currentStart === -1) {
        currentStart = i;
        currentLen = 1;
      } else {
        currentLen++;
      }
      if (currentLen > bestLen) {
        bestLen = currentLen;
        bestStart = currentStart;
      }
    } else {
      currentStart = -1;
      currentLen = 0;
    }
  }

  if (bestLen < 2) {
    return groups.join(':');
  }

  const before = groups.slice(0, bestStart).join(':');
  const after = groups.slice(bestStart + bestLen).join(':');

  if (before === '' && after === '') return '::';
  if (before === '') return `::${after}`;
  if (after === '') return `${before}::`;
  return `${before}::${after}`;
}

export function normalizeIPv6(ip: string): string {
  return compressIPv6(expandIPv6(ip));
}

export function ipv6ToGroups(ip: string): string[] {
  const expanded = expandIPv6(ip);
  return expanded.split(':');
}

export function isLoopbackIPv6(ip: string): boolean {
  if (!isValidIPv6(ip)) return false;
  const expanded = expandIPv6(ip);
  return expanded === '0000:0000:0000:0000:0000:0000:0000:0001';
}

export function isLinkLocalIPv6(ip: string): boolean {
  if (!isValidIPv6(ip)) return false;
  const expanded = expandIPv6(ip);
  const firstGroup = parseInt(expanded.split(':')[0], 16);
  // fe80::/10 — first 10 bits are 1111 1110 10
  return (firstGroup & 0xffc0) === 0xfe80;
}

export function isMulticastIPv6(ip: string): boolean {
  if (!isValidIPv6(ip)) return false;
  const expanded = expandIPv6(ip);
  const firstGroup = parseInt(expanded.split(':')[0], 16);
  // ff00::/8
  return (firstGroup & 0xff00) === 0xff00;
}

// ─── General Utilities ───────────────────────────────────────────────────────

export function detectIPVersion(ip: string): IPVersion | null {
  if (isValidIPv4(ip)) return 4;
  if (isValidIPv6(ip)) return 6;
  return null;
}

export function isValidIP(ip: string): boolean {
  return isValidIPv4(ip) || isValidIPv6(ip);
}

export function isPrivateIP(ip: string): boolean {
  if (isValidIPv4(ip)) return isPrivateIPv4(ip) || isLoopbackIPv4(ip) || isLinkLocalIPv4(ip);
  if (isValidIPv6(ip)) return isLoopbackIPv6(ip) || isLinkLocalIPv6(ip);
  return false;
}

export function ipToSortableKey(ip: string): string {
  if (isValidIPv4(ip)) {
    return ip
      .split('.')
      .map(p => p.padStart(3, '0'))
      .join('.');
  }
  if (isValidIPv6(ip)) {
    return expandIPv6(ip);
  }
  return ip;
}

export function generateRandomIPv4(privateRange: boolean = false): string {
  if (privateRange) {
    // 10.x.x.x
    const b = Math.floor(Math.random() * 256);
    const c = Math.floor(Math.random() * 256);
    const d = Math.floor(Math.random() * 256);
    return `10.${b}.${c}.${d}`;
  }
  // Random public IP (avoid private/loopback/multicast)
  let ip: string;
  do {
    const a = Math.floor(Math.random() * 223) + 1; // 1-223, avoids multicast
    const b = Math.floor(Math.random() * 256);
    const c = Math.floor(Math.random() * 256);
    const d = Math.floor(Math.random() * 256);
    ip = `${a}.${b}.${c}.${d}`;
  } while (!isPublicIPv4(ip));
  return ip;
}

export function maskToWildcard(mask: string): string {
  if (!isValidIPv4(mask)) return '0.0.0.0';
  const parts = mask.split('.').map(Number);
  return parts.map(p => 255 - p).join('.');
}
