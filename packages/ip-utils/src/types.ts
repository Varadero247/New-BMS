// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
export interface IPv4Parts { a: number; b: number; c: number; d: number; }
export interface CIDRInfo { ip: string; prefix: number; networkAddress: string; broadcastAddress: string; firstHost: string; lastHost: string; totalHosts: number; mask: string; }
export interface IPv6Parts { groups: string[]; full: string; compressed: string; }
export type IPVersion = 4 | 6;
