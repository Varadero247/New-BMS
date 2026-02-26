// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
// ============================================
// @ims/changelog — In-memory changelog store
// ============================================

export type ChangelogCategory = 'new_feature' | 'improvement' | 'bug_fix' | 'security';

export interface ChangelogEntry {
  id: string;
  title: string;
  description: string;
  category: ChangelogCategory;
  modules: string[];
  publishedAt: string;
  isPublished: boolean;
}

export interface CreateEntryInput {
  title: string;
  description: string;
  category: ChangelogCategory;
  modules: string[];
  isPublished?: boolean;
}

// ============================================
// In-memory stores
// ============================================

const entries: ChangelogEntry[] = [];
const userReadTimestamps: Map<string, string> = new Map();
let nextId = 1;

// ============================================
// Core API
// ============================================

export function listEntries(limit = 20, offset = 0): { entries: ChangelogEntry[]; total: number } {
  const published = entries
    .filter((e) => e.isPublished)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  return {
    entries: published.slice(offset, offset + limit),
    total: published.length,
  };
}

export function listAllEntries(
  limit = 50,
  offset = 0
): { entries: ChangelogEntry[]; total: number } {
  const sorted = [...entries].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
  return {
    entries: sorted.slice(offset, offset + limit),
    total: entries.length,
  };
}

export function getUnreadCount(userId: string): number {
  const lastRead = userReadTimestamps.get(userId);
  const published = entries.filter((e) => e.isPublished);

  if (!lastRead) return published.length;

  const lastReadTime = new Date(lastRead).getTime();
  return published.filter((e) => new Date(e.publishedAt).getTime() > lastReadTime).length;
}

export function markAsRead(userId: string): void {
  userReadTimestamps.set(userId, new Date().toISOString());
}

export function createEntry(data: CreateEntryInput): ChangelogEntry {
  const entry: ChangelogEntry = {
    id: `cl_${String(nextId++).padStart(4, '0')}`,
    title: data.title,
    description: data.description,
    category: data.category,
    modules: data.modules,
    publishedAt: new Date().toISOString(),
    isPublished: data.isPublished ?? true,
  };

  entries.push(entry);
  return entry;
}

// ============================================
// Seed data — 5 recent platform entries
// ============================================

function seed(): void {
  if (entries.length > 0) return;

  const seedData: Array<CreateEntryInput & { daysAgo: number }> = [
    {
      title: 'ISO 42001 AI Management Module',
      description:
        'Full AI governance module with system register, impact assessments, controls mapping, and audit trail. Compliant with ISO/IEC 42001:2023.',
      category: 'new_feature',
      modules: ['ISO 42001'],
      daysAgo: 1,
    },
    {
      title: 'ISO 37001 Anti-Bribery Module',
      description:
        'Anti-bribery management system with risk assessments, due diligence workflows, gift/hospitality register, and whistleblower channel.',
      category: 'new_feature',
      modules: ['ISO 37001'],
      daysAgo: 2,
    },
    {
      title: 'Enhanced Evidence Pack Generator',
      description:
        'Automatically compile audit evidence packs with linked documents, records, and compliance matrices. Export as PDF or ZIP.',
      category: 'improvement',
      modules: ['Quality', 'Audit'],
      daysAgo: 3,
    },
    {
      title: 'Multi-Tenant MSP Mode',
      description:
        'Manage multiple client organisations from a single dashboard with tenant isolation, aggregated reporting, and bulk operations.',
      category: 'new_feature',
      modules: ['Platform'],
      daysAgo: 5,
    },
    {
      title: 'Critical Security Patch — Session Management',
      description:
        'Fixed a session fixation vulnerability in the authentication flow. All active sessions have been invalidated. Users must re-authenticate.',
      category: 'security',
      modules: ['Auth', 'Platform'],
      daysAgo: 7,
    },
  ];

  for (const item of seedData) {
    const entry: ChangelogEntry = {
      id: `cl_${String(nextId++).padStart(4, '0')}`,
      title: item.title,
      description: item.description,
      category: item.category,
      modules: item.modules,
      publishedAt: new Date(Date.now() - item.daysAgo * 24 * 60 * 60 * 1000).toISOString(),
      isPublished: true,
    };
    entries.push(entry);
  }
}

// Auto-seed on import
seed();
