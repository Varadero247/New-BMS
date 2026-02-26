// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

export type MigrationStatus = 'PENDING' | 'ANALYSING' | 'READY' | 'RUNNING' | 'COMPLETED' | 'FAILED';

export type TargetModule =
  | 'NONCONFORMANCES'
  | 'INCIDENTS'
  | 'RISKS'
  | 'DOCUMENTS'
  | 'SUPPLIERS'
  | 'EMPLOYEES'
  | 'CALIBRATION'
  | 'AUDITS';

export type DetectedType =
  | 'string'
  | 'integer'
  | 'float'
  | 'date'
  | 'datetime'
  | 'boolean'
  | 'email'
  | 'phone'
  | 'enum'
  | 'unknown';

export interface DetectedColumn {
  name: string;
  detectedType: DetectedType;
  nullCount: number;
  uniqueCount: number;
  sampleValues: string[];
}

export interface DetectedFileStructure {
  uploadId: string;
  filename: string;
  rowCount: number;
  headers: string[];
  columns: DetectedColumn[];
  sampleRows: Record<string, string>[];
  detectedTypes: Record<string, DetectedType>;
  confidence: number;
  fileType: 'csv' | 'json' | 'xlsx' | 'xml';
}

export interface MappingSuggestion {
  sourceField: string;
  suggestedTarget: string | 'SKIP';
  confidence: number;
  reason: string;
  transformRequired?: string;
  alternatives?: Array<{ field: string; confidence: number }>;
}

export interface FieldMapping {
  sourceField: string;
  targetField: string | 'SKIP';
  transform?: string;
}

export interface TransformWarning {
  field: string;
  message: string;
  originalValue: string;
  transformedValue?: string;
}

export interface TransformedRow {
  original: Record<string, unknown>;
  transformed: Record<string, unknown>;
  warnings: TransformWarning[];
  errors: string[];
}

export interface MigrationJob {
  id: string;
  orgId: string;
  uploadId: string;
  targetModule: TargetModule;
  mappings: FieldMapping[];
  status: MigrationStatus;
  progress: number;
  errors: string[];
  result?: MigrationResult;
  createdAt: Date;
  updatedAt: Date;
}

export interface MigrationResult {
  jobId: string;
  created: number;
  skipped: number;
  failed: number;
  errors: Array<{ row: number; field?: string; message: string }>;
  completedAt: Date;
}

export interface MigrationProgress {
  processed: number;
  total: number;
  created: number;
  failed: number;
  currentBatch: number;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface SchemaField {
  label: string;
  type: DetectedType | 'enum' | 'text';
  required: boolean;
  example?: string;
  formats?: string[];
  values?: string[];
  maxLength?: number;
}

export interface ModuleSchema {
  title: string;
  fields: Record<string, SchemaField>;
}
