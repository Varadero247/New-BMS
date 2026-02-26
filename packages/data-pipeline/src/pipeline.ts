import { DataSchema, FilterFn, Pipeline, PipelineStatus, PipelineStep, StepResult, StepStatus, StepType, TransformFn } from './types';

export function createStep(id: string, name: string, type: StepType, order: number, config?: Record<string, unknown>): PipelineStep {
  return { id, name, type, status: 'pending', order, ...(config ? { config } : {}) };
}

export function createPipeline(id: string, name: string, steps: PipelineStep[] = []): Pipeline {
  return { id, name, steps: [...steps], status: 'idle', createdAt: Date.now() };
}

export function addStepToPipeline(pipeline: Pipeline, step: PipelineStep): Pipeline {
  return { ...pipeline, steps: [...pipeline.steps, step] };
}

export function removeStepFromPipeline(pipeline: Pipeline, stepId: string): Pipeline {
  return { ...pipeline, steps: pipeline.steps.filter(s => s.id !== stepId) };
}

export function sortStepsByOrder(pipeline: Pipeline): Pipeline {
  return { ...pipeline, steps: [...pipeline.steps].sort((a, b) => a.order - b.order) };
}

export function getStepById(pipeline: Pipeline, stepId: string): PipelineStep | undefined {
  return pipeline.steps.find(s => s.id === stepId);
}

export function updateStepStatus(pipeline: Pipeline, stepId: string, status: StepStatus): Pipeline {
  return { ...pipeline, steps: pipeline.steps.map(s => s.id === stepId ? { ...s, status } : s) };
}

export function applyTransform(records: Record<string, unknown>[], fn: TransformFn): Record<string, unknown>[] {
  return records.map(fn);
}

export function applyFilter(records: Record<string, unknown>[], fn: FilterFn): Record<string, unknown>[] {
  return records.filter(fn);
}

export function applyRename(records: Record<string, unknown>[], mapping: Record<string, string>): Record<string, unknown>[] {
  return records.map(record => {
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(record)) {
      result[mapping[key] ?? key] = val;
    }
    return result;
  });
}

export function applyProjection(records: Record<string, unknown>[], fields: string[]): Record<string, unknown>[] {
  return records.map(record => {
    const result: Record<string, unknown> = {};
    for (const field of fields) { if (field in record) result[field] = record[field]; }
    return result;
  });
}

export function applyDefaultValues(records: Record<string, unknown>[], schema: DataSchema): Record<string, unknown>[] {
  return records.map(record => {
    const result = { ...record };
    for (const field of schema.fields) {
      if (!(field.name in result) && field.defaultValue !== undefined) result[field.name] = field.defaultValue;
    }
    return result;
  });
}

export function validateRecord(record: Record<string, unknown>, schema: DataSchema): string[] {
  const errors: string[] = [];
  for (const field of schema.fields) {
    if (field.required && (record[field.name] === undefined || record[field.name] === null)) {
      errors.push(`Field '${field.name}' is required`);
    }
  }
  return errors;
}

export function validateRecords(records: Record<string, unknown>[], schema: DataSchema): { valid: Record<string, unknown>[]; invalid: Record<string, unknown>[] } {
  const valid: Record<string, unknown>[] = [];
  const invalid: Record<string, unknown>[] = [];
  for (const record of records) {
    if (validateRecord(record, schema).length === 0) valid.push(record); else invalid.push(record);
  }
  return { valid, invalid };
}

export function aggregateSum(records: Record<string, unknown>[], field: string): number {
  return records.reduce((s, r) => s + (typeof r[field] === 'number' ? (r[field] as number) : 0), 0);
}

export function aggregateAvg(records: Record<string, unknown>[], field: string): number {
  if (records.length === 0) return 0;
  return aggregateSum(records, field) / records.length;
}

export function aggregateCount(records: Record<string, unknown>[]): number {
  return records.length;
}

export function aggregateGroupBy(records: Record<string, unknown>[], field: string): Record<string, Record<string, unknown>[]> {
  const result: Record<string, Record<string, unknown>[]> = {};
  for (const record of records) {
    const key = String(record[field] ?? '');
    if (!result[key]) result[key] = [];
    result[key].push(record);
  }
  return result;
}

export function sortRecords(records: Record<string, unknown>[], field: string, direction: 'asc' | 'desc' = 'asc'): Record<string, unknown>[] {
  return [...records].sort((a, b) => {
    const av = a[field], bv = b[field];
    if (typeof av === 'number' && typeof bv === 'number') return direction === 'asc' ? av - bv : bv - av;
    return direction === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
  });
}

export function deduplicateRecords(records: Record<string, unknown>[], keyField: string): Record<string, unknown>[] {
  const seen = new Set<unknown>();
  return records.filter(r => { const k = r[keyField]; if (seen.has(k)) return false; seen.add(k); return true; });
}

export function isValidStepType(t: string): t is StepType {
  return ['extract', 'transform', 'load', 'validate', 'filter', 'aggregate', 'join', 'sort'].includes(t);
}

export function isValidStepStatus(s: string): s is StepStatus {
  return ['pending', 'running', 'completed', 'failed', 'skipped'].includes(s);
}

export function isValidPipelineStatus(s: string): s is PipelineStatus {
  return ['idle', 'running', 'completed', 'failed', 'paused'].includes(s);
}

export function getPipelineProgress(pipeline: Pipeline): number {
  if (pipeline.steps.length === 0) return 0;
  const completed = pipeline.steps.filter(s => s.status === 'completed' || s.status === 'skipped').length;
  return (completed / pipeline.steps.length) * 100;
}

export function makeStepResult(stepId: string, status: StepStatus, recordsIn: number, recordsOut: number, durationMs: number, error?: string): StepResult {
  return { stepId, status, recordsIn, recordsOut, durationMs, ...(error ? { error } : {}) };
}
