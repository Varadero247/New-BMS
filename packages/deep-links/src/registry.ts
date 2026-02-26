// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// CONFIDENTIAL — TRADE SECRET.
import type { DeepLinkConfig, ResolvedDeepLink } from './types';
import { buildDeepLink, parseDeepLink } from './url-builder';

export interface DeepLinkRegistry {
  register(config: DeepLinkConfig): void;
  unregister(module: string, entityType: string): void;
  resolve(module: string, entityType: string, entityId: string, params?: Record<string, string>): ResolvedDeepLink | null;
  parse(url: string): ResolvedDeepLink | null;
  getConfig(module: string, entityType: string): DeepLinkConfig | undefined;
  getAllConfigs(): DeepLinkConfig[];
}

export function createDeepLinkRegistry(initialConfigs: DeepLinkConfig[] = []): DeepLinkRegistry {
  const configs = new Map<string, DeepLinkConfig>();

  for (const c of initialConfigs) {
    configs.set(`${c.module}:${c.entityType}`, c);
  }

  return {
    register(config) {
      configs.set(`${config.module}:${config.entityType}`, config);
    },
    unregister(module, entityType) {
      configs.delete(`${module}:${entityType}`);
    },
    resolve(module, entityType, entityId, params) {
      const config = configs.get(`${module}:${entityType}`);
      if (!config) return null;
      const url = buildDeepLink(module, entityType, entityId, params);
      return { url, module, entityType, entityId, params: params || {} };
    },
    parse(url) {
      return parseDeepLink(url, Array.from(configs.values()));
    },
    getConfig(module, entityType) {
      return configs.get(`${module}:${entityType}`);
    },
    getAllConfigs() {
      return Array.from(configs.values());
    },
  };
}
