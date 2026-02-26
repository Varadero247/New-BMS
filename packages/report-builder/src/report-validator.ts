// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// CONFIDENTIAL — TRADE SECRET.

import type {
  ReportDefinition,
  ReportField,
  ReportFieldType,
  ChartType,
  ReportFormat,
} from './types';

const VALID_FIELD_TYPES: ReportFieldType[] = [
  'text', 'number', 'date', 'boolean', 'enum', 'computed',
];

const VALID_CHART_TYPES: ChartType[] = [
  'bar', 'line', 'pie', 'donut', 'area', 'scatter', 'table', 'kpi',
];

const VALID_FORMATS: ReportFormat[] = ['pdf', 'xlsx', 'csv', 'json', 'html'];

export function validateField(field: Partial<ReportField>): string[] {
  const errors: string[] = [];
  if (!field.id) errors.push('Field id is required');
  if (!field.name) errors.push('Field name is required');
  if (!field.label) errors.push('Field label is required');
  if (!field.source) errors.push('Field source is required');
  if (!field.type) {
    errors.push('Field type is required');
  } else if (!VALID_FIELD_TYPES.includes(field.type)) {
    errors.push(`Unknown field type: "${field.type}"`);
  }
  if (field.width !== undefined && (typeof field.width !== 'number' || field.width <= 0)) {
    errors.push('Field width must be a positive number');
  }
  return errors;
}

export function validateReportDefinition(
  report: Partial<ReportDefinition>
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!report.id) errors.push('Report id is required');
  if (!report.name || report.name.trim() === '') errors.push('Report name is required');
  if (!report.module) errors.push('Report module is required');
  if (!report.entity) errors.push('Report entity is required');
  if (!report.createdBy) errors.push('Report createdBy is required');

  if (!Array.isArray(report.fields) || report.fields.length === 0) {
    errors.push('Report must have at least one field');
  } else {
    report.fields.forEach((f, i) => {
      const fieldErrors = validateField(f);
      fieldErrors.forEach((e) => errors.push(`Field[${i}]: ${e}`));
    });
  }

  if (report.chartType !== undefined && !VALID_CHART_TYPES.includes(report.chartType)) {
    errors.push(`Unknown chart type: "${report.chartType}"`);
  }

  if (report.format !== undefined && !VALID_FORMATS.includes(report.format)) {
    errors.push(`Unknown format: "${report.format}"`);
  }

  if (report.limit !== undefined && (typeof report.limit !== 'number' || report.limit < 1)) {
    errors.push('Report limit must be a positive number');
  }

  return { valid: errors.length === 0, errors };
}
