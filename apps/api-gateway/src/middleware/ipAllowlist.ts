// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import type { Request, Response, NextFunction } from 'express';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('api-gateway:ip-allowlist');

// ─── Types ──────────────────────────────────────────────────────────────────

export interface IpAllowlistEntry {
  id: string;
  cidr: string;
  label: string;
  createdAt: string;
}

interface OrgAllowlist {
  entries: IpAllowlistEntry[];
}

// ─── In-Memory Store ────────────────────────────────────────────────────────

const allowlistStore = new Map<string, OrgAllowlist>();

// Export for route handlers
export function getOrgAllowlist(orgId: string): IpAllowlistEntry[] {
  const org = allowlistStore.get(orgId);
  return org ? org.entries : [];
}

export function addOrgAllowlistEntry(orgId: string, entry: IpAllowlistEntry): void {
  let org = allowlistStore.get(orgId);
  if (!org) {
    org = { entries: [] };
    allowlistStore.set(orgId, org);
  }
  org.entries.push(entry);
}

export function removeOrgAllowlistEntry(orgId: string, entryId: string): boolean {
  const org = allowlistStore.get(orgId);
  if (!org) return false;
  const idx = org.entries.findIndex((e) => e.id === entryId);
  if (idx === -1) return false;
  org.entries.splice(idx, 1);
  if (org.entries.length === 0) {
    allowlistStore.delete(orgId);
  }
  return true;
}

// ─── CIDR Matching ──────────────────────────────────────────────────────────

function parseCidr(cidr: string): { ip: number; mask: number } | null {
  const parts = cidr.split('/');
  const ipStr = parts[0];
  const prefixLen = parts[1] ? parseInt(parts[1], 10) : 32;

  if (prefixLen < 0 || prefixLen > 32) return null;

  const ipParts = ipStr.split('.');
  if (ipParts.length !== 4) return null;

  let ip = 0;
  for (let i = 0; i < 4; i++) {
    const octet = parseInt(ipParts[i], 10);
    if (isNaN(octet) || octet < 0 || octet > 255) return null;
    ip = (ip << 8) | octet;
  }

  // Create mask: for /32, all bits set; for /0, no bits set
  const mask = prefixLen === 0 ? 0 : (~0 << (32 - prefixLen)) >>> 0;

  return { ip: ip >>> 0, mask };
}

function ipToNumber(ipStr: string): number | null {
  // Handle IPv4-mapped IPv6 addresses (::ffff:127.0.0.1)
  let ip = ipStr;
  if (ip.startsWith('::ffff:')) {
    ip = ip.slice(7);
  }

  const parts = ip.split('.');
  if (parts.length !== 4) return null;

  let num = 0;
  for (let i = 0; i < 4; i++) {
    const octet = parseInt(parts[i], 10);
    if (isNaN(octet) || octet < 0 || octet > 255) return null;
    num = (num << 8) | octet;
  }

  return num >>> 0;
}

function matchesCidr(clientIp: string, cidr: string): boolean {
  const parsed = parseCidr(cidr);
  if (!parsed) return false;

  const clientNum = ipToNumber(clientIp);
  if (clientNum === null) return false;

  return (clientNum & parsed.mask) === (parsed.ip & parsed.mask);
}

/**
 * Check if a client IP matches any CIDR in the org's allowlist.
 */
export function isIpAllowed(orgId: string, clientIp: string): boolean {
  const entries = getOrgAllowlist(orgId);

  // If org has no allowlist entries, allow all (opt-in feature)
  if (entries.length === 0) return true;

  for (const entry of entries) {
    if (matchesCidr(clientIp, entry.cidr)) {
      return true;
    }
  }

  return false;
}

// ─── Express Middleware ─────────────────────────────────────────────────────

/**
 * IP Allowlist middleware.
 * Checks if the client IP is in the org's allowlist.
 * If the org has no allowlist, all IPs are allowed (opt-in).
 */
export function ipAllowlistMiddleware(req: Request, res: Response, next: NextFunction): void {
  const user = (req as Request & { user?: Record<string, unknown> }).user;
  if (!user || !user.orgId) {
    // No authenticated user yet — skip (auth middleware will handle)
    next();
    return;
  }

  const clientIp = req.ip || req.socket.remoteAddress || '0.0.0.0';

  if (!isIpAllowed(user.orgId as string, clientIp)) {
    logger.warn('IP not allowed', { orgId: user.orgId, clientIp });
    res.status(403).json({
      success: false,
      error: {
        code: 'IP_NOT_ALLOWED',
        message: 'Your IP address is not in the allowlist for this organisation',
        clientIp,
      },
    });
    return;
  }

  next();
}
