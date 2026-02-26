// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import { z } from 'zod';

export const customisationOptionSchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  type: z.enum(['string', 'number', 'boolean', 'select']),
  required: z.boolean(),
  placeholder: z.string().optional(),
  options: z.array(z.string()).optional(),
});

export const manifestSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  version: z.string().regex(/^\d+\.\d+\.\d+$/, 'Version must be semver x.y.z'),
  standards: z.array(z.string()).min(1, 'At least one standard required'),
  estimatedSetupMinutes: z.number().int().positive(),
  description: z.string().min(10),
  targetCustomer: z.string().min(1),
  includes: z.object({
    riskCategories: z.number().int().nonnegative(),
    documentTypes: z.number().int().nonnegative(),
    workflowTemplates: z.number().int().nonnegative(),
    auditChecklists: z.number().int().nonnegative(),
    kpis: z.number().int().nonnegative(),
  }),
  prerequisites: z.array(z.string()),
  customisationOptions: z.array(customisationOptionSchema),
});

export type PackManifest = z.infer<typeof manifestSchema>;
export type PackCustomisationOption = z.infer<typeof customisationOptionSchema>;

export interface SeedData {
  key: string;
  data: Record<string, unknown>;
}

export interface PackSection {
  name: string;
  type: 'riskCategories' | 'documentTypes' | 'kpis' | 'auditChecklists' | 'workflowTemplates' | 'suppliers' | 'processes';
  items: SeedData[];
}

export interface InstantStartPack {
  manifest: PackManifest;
  sections: PackSection[];
}

export interface InstallResult {
  packId: string;
  orgId: string;
  status: 'COMPLETED' | 'PARTIAL' | 'FAILED';
  created: Record<string, number>;
  skipped: Record<string, number>;
  errors: string[];
  installedAt: Date;
}

export interface InstallProgress {
  phase: string;
  current: number;
  total: number;
  message: string;
}
