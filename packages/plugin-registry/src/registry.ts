// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// CONFIDENTIAL — TRADE SECRET.

import type { PluginManifest, InstalledPlugin, PluginCategory } from './types';

export function createPluginRegistry() {
  const manifests = new Map<string, PluginManifest>();
  const installations = new Map<string, InstalledPlugin>(); // key: `${manifestId}:${orgId}`

  function register(manifest: PluginManifest): void {
    manifests.set(manifest.id, { ...manifest });
  }

  function unregister(id: string): boolean {
    return manifests.delete(id);
  }

  function getPlugin(id: string): PluginManifest | undefined {
    return manifests.get(id);
  }

  function getAllPlugins(): PluginManifest[] {
    return Array.from(manifests.values());
  }

  function searchPlugins(query: string): PluginManifest[] {
    const q = query.toLowerCase();
    return Array.from(manifests.values()).filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.author.toLowerCase().includes(q)
    );
  }

  function getByCategory(category: PluginCategory): PluginManifest[] {
    return Array.from(manifests.values()).filter((p) => p.category === category);
  }

  function getByAuthor(author: string): PluginManifest[] {
    return Array.from(manifests.values()).filter(
      (p) => p.author.toLowerCase() === author.toLowerCase()
    );
  }

  function install(
    manifestId: string,
    orgId: string,
    installedBy: string,
    config: Record<string, unknown> = {}
  ): InstalledPlugin | null {
    const manifest = manifests.get(manifestId);
    if (!manifest) return null;

    const key = `${manifestId}:${orgId}`;
    const installed: InstalledPlugin = {
      manifestId,
      organisationId: orgId,
      installedBy,
      installedAt: new Date(),
      config,
      enabled: true,
      version: manifest.version,
      lastUpdated: new Date(),
    };
    installations.set(key, installed);
    return installed;
  }

  function uninstall(manifestId: string, orgId: string): boolean {
    return installations.delete(`${manifestId}:${orgId}`);
  }

  function isInstalled(manifestId: string, orgId: string): boolean {
    return installations.has(`${manifestId}:${orgId}`);
  }

  function getInstalledPlugins(orgId: string): InstalledPlugin[] {
    return Array.from(installations.values()).filter(
      (i) => i.organisationId === orgId
    );
  }

  return {
    register,
    unregister,
    getPlugin,
    getAllPlugins,
    searchPlugins,
    getByCategory,
    getByAuthor,
    install,
    uninstall,
    isInstalled,
    getInstalledPlugins,
  };
}
