// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
export type {
  FieldType,
  FieldDefinition,
  TemplateModule,
  TemplateCategory,
  TemplateDefinition,
} from './types';

export { renderTemplateToHtml } from './renderer';
export { exportTemplate, type ExportResult } from './exporter';

// Seed data — lazy-loaded barrel
export { allTemplates } from './seeds';
