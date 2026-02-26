// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// CONFIDENTIAL — TRADE SECRET.
export interface DeepLinkConfig {
  module: string;
  entityType: string;
  urlPattern: string;
  queryParams?: Record<string, string>;
  requiresAuth?: boolean;
  fallbackUrl?: string;
}

export interface ResolvedDeepLink {
  url: string;
  module: string;
  entityType: string;
  entityId: string;
  params: Record<string, string>;
}
