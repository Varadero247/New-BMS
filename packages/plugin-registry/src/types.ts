// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// CONFIDENTIAL — TRADE SECRET.

export type PluginCategory =
  | 'integration'
  | 'report'
  | 'workflow'
  | 'dashboard'
  | 'compliance'
  | 'notification'
  | 'data-import'
  | 'ai'
  | 'custom';

export type PluginStatus =
  | 'draft'
  | 'submitted'
  | 'review'
  | 'approved'
  | 'rejected'
  | 'published'
  | 'deprecated';

export type PluginPermission =
  | 'read:quality'
  | 'write:quality'
  | 'read:hse'
  | 'write:hse'
  | 'read:documents'
  | 'write:documents'
  | 'read:analytics'
  | 'send:notifications'
  | 'access:api'
  | 'read:users';

export interface PluginManifest {
  id: string;
  name: string;
  version: string; // semver
  description: string;
  author: string;
  authorEmail: string;
  category: PluginCategory;
  permissions: PluginPermission[];
  entryPoint: string;
  configSchema?: Record<string, unknown>;
  webhooks?: string[];
  minPlatformVersion?: string;
  iconUrl?: string;
  screenshotUrls?: string[];
  documentationUrl?: string;
  supportUrl?: string;
  licenseType: 'free' | 'paid' | 'freemium';
  price?: number; // monthly in GBP
}

export interface InstalledPlugin {
  manifestId: string;
  organisationId: string;
  installedBy: string;
  installedAt: Date;
  config: Record<string, unknown>;
  enabled: boolean;
  version: string;
  lastUpdated: Date;
}

export interface PluginReview {
  pluginId: string;
  userId: string;
  rating: number; // 1-5
  review: string;
  createdAt: Date;
  verified: boolean;
}
