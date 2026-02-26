// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import { getPack } from './registry';
import { validatePrerequisites, validateCustomisation, type CustomisationValues } from './validator';
import type { InstallResult, InstallProgress, PackSection } from './types';

export type ProgressCallback = (progress: InstallProgress) => void;

export interface InstallOptions {
  orgId: string;
  packId: string;
  customisationValues?: CustomisationValues;
  enabledModules?: string[];
  dryRun?: boolean;
  onProgress?: ProgressCallback;
}

/**
 * Storage adapter interface — the installer writes seed data through this,
 * allowing the caller to provide their own persistence layer (Prisma, HTTP, etc.)
 */
export interface StorageAdapter {
  upsertRiskCategory(orgId: string, data: Record<string, unknown>): Promise<{ created: boolean }>;
  upsertDocumentType(orgId: string, data: Record<string, unknown>): Promise<{ created: boolean }>;
  upsertWorkflowTemplate(orgId: string, data: Record<string, unknown>): Promise<{ created: boolean }>;
  upsertAuditChecklist(orgId: string, data: Record<string, unknown>): Promise<{ created: boolean }>;
  upsertKpi(orgId: string, data: Record<string, unknown>): Promise<{ created: boolean }>;
  upsertSupplier?(orgId: string, data: Record<string, unknown>): Promise<{ created: boolean }>;
  upsertProcess?(orgId: string, data: Record<string, unknown>): Promise<{ created: boolean }>;
}

/** No-op dry-run adapter */
const dryRunAdapter: StorageAdapter = {
  upsertRiskCategory: async () => ({ created: true }),
  upsertDocumentType: async () => ({ created: true }),
  upsertWorkflowTemplate: async () => ({ created: true }),
  upsertAuditChecklist: async () => ({ created: true }),
  upsertKpi: async () => ({ created: true }),
  upsertSupplier: async () => ({ created: true }),
  upsertProcess: async () => ({ created: true }),
};

async function installSection(
  section: PackSection,
  orgId: string,
  adapter: StorageAdapter,
  result: InstallResult,
  onProgress: ProgressCallback,
  sectionIndex: number,
  totalSections: number,
): Promise<void> {
  const sectionStart = Math.floor((sectionIndex / totalSections) * 100);
  const sectionEnd = Math.floor(((sectionIndex + 1) / totalSections) * 100);

  onProgress({ phase: section.name, current: sectionStart, total: 100, message: `Installing ${section.name}…` });

  let upsertFn: ((orgId: string, data: Record<string, unknown>) => Promise<{ created: boolean }>) | undefined;

  switch (section.type) {
    case 'riskCategories': upsertFn = adapter.upsertRiskCategory.bind(adapter); break;
    case 'documentTypes': upsertFn = adapter.upsertDocumentType.bind(adapter); break;
    case 'workflowTemplates': upsertFn = adapter.upsertWorkflowTemplate.bind(adapter); break;
    case 'auditChecklists': upsertFn = adapter.upsertAuditChecklist.bind(adapter); break;
    case 'kpis': upsertFn = adapter.upsertKpi.bind(adapter); break;
    case 'suppliers': upsertFn = adapter.upsertSupplier?.bind(adapter); break;
    case 'processes': upsertFn = adapter.upsertProcess?.bind(adapter); break;
  }

  if (!upsertFn) {
    result.skipped[section.type] = (result.skipped[section.type] ?? 0) + section.items.length;
    return;
  }

  if (!result.created[section.type]) result.created[section.type] = 0;
  if (!result.skipped[section.type]) result.skipped[section.type] = 0;

  for (let i = 0; i < section.items.length; i++) {
    const item = section.items[i];
    const itemProgress = sectionStart + Math.floor(((i + 1) / section.items.length) * (sectionEnd - sectionStart));

    try {
      const { created } = await upsertFn(orgId, { key: item.key, ...item.data });
      if (created) {
        result.created[section.type] = (result.created[section.type] ?? 0) + 1;
      } else {
        result.skipped[section.type] = (result.skipped[section.type] ?? 0) + 1;
      }
    } catch (err) {
      result.errors.push(`${section.type}/${item.key}: ${String(err)}`);
    }

    onProgress({
      phase: section.name,
      current: itemProgress,
      total: 100,
      message: `${section.name}: ${i + 1}/${section.items.length} items`,
    });
  }
}

export async function installPack(
  options: InstallOptions,
  adapter?: StorageAdapter,
): Promise<InstallResult> {
  const { orgId, packId, customisationValues = {}, enabledModules = [], dryRun = false, onProgress = () => undefined } = options;

  const pack = getPack(packId);
  if (!pack) throw new Error(`Pack not found: ${packId}`);

  // Validate prerequisites
  const prereqCheck = validatePrerequisites(pack.manifest, enabledModules);
  if (!prereqCheck.valid) {
    throw new Error(`Prerequisites not met: ${prereqCheck.errors.join('; ')}`);
  }

  // Validate customisation values
  const customCheck = validateCustomisation(pack.manifest, customisationValues);
  if (!customCheck.valid) {
    throw new Error(`Invalid customisation: ${customCheck.errors.join('; ')}`);
  }

  const effectiveAdapter = dryRun ? dryRunAdapter : (adapter ?? dryRunAdapter);

  const result: InstallResult = {
    packId,
    orgId,
    status: 'COMPLETED',
    created: {},
    skipped: {},
    errors: [],
    installedAt: new Date(),
  };

  onProgress({ phase: 'Starting', current: 0, total: 100, message: `Installing ${pack.manifest.name}…` });

  const sections = pack.sections;
  for (let i = 0; i < sections.length; i++) {
    await installSection(sections[i], orgId, effectiveAdapter, result, onProgress, i, sections.length);
  }

  if (result.errors.length > 0) {
    result.status = result.errors.length === sections.reduce((acc, s) => acc + s.items.length, 0)
      ? 'FAILED'
      : 'PARTIAL';
  }

  onProgress({ phase: 'Done', current: 100, total: 100, message: 'Installation complete' });
  return result;
}
