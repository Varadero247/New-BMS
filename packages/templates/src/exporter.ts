// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import type { FieldDefinition } from './types';
import { renderTemplateToHtml } from './renderer';

export interface ExportResult {
  content: string;
  mimeType: string;
  filename: string;
}

/**
 * Exports a template in the specified format.
 * Supports 'html' and 'json'. PDF is not supported (no Chromium in Alpine containers).
 */
export function exportTemplate(
  template: {
    code: string;
    name: string;
    description?: string | null;
    fields: FieldDefinition[];
    version?: number;
  },
  filledData: Record<string, unknown> | undefined,
  format: 'html' | 'json' = 'html'
): ExportResult {
  const slug = template.code.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  if (format === 'json') {
    const payload = {
      code: template.code,
      name: template.name,
      description: template.description,
      version: template.version ?? 1,
      fields: template.fields,
      filledData: filledData ?? null,
      exportedAt: new Date().toISOString(),
    };
    return {
      content: JSON.stringify(payload, null, 2),
      mimeType: 'application/json',
      filename: `${slug}.json`,
    };
  }

  // Default: HTML
  return {
    content: renderTemplateToHtml(template, filledData),
    mimeType: 'text/html',
    filename: `${slug}.html`,
  };
}
