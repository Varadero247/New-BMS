// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

export { analyseFile, parseCsv, parseJson, detectType } from './analyser';
export { suggestMappings } from './ai-mapper';
export { validateMappings } from './validator';
export { transformRows, convertDate, normalizeEnum, parseBoolean, parseNumber } from './transformer';
export { MigrationExecutor } from './executor';
export { MIGRATION_SCHEMAS } from './schema-registry';
export { bamboohrProfile } from './system-profiles/bamboohr';
export { intelexProfile } from './system-profiles/intelex';
export { sharepointProfile } from './system-profiles/sharepoint';
export { corityProfile } from './system-profiles/cority';
export { etqProfile } from './system-profiles/etq';
export type {
  MigrationStatus,
  TargetModule,
  DetectedType,
  DetectedColumn,
  DetectedFileStructure,
  MappingSuggestion,
  FieldMapping,
  TransformWarning,
  TransformedRow,
  MigrationJob,
  MigrationResult,
  MigrationProgress,
  ValidationResult,
  SchemaField,
  ModuleSchema,
} from './types';
