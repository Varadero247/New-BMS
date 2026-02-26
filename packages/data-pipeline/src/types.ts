export type StepStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
export type StepType = 'extract' | 'transform' | 'load' | 'validate' | 'filter' | 'aggregate' | 'join' | 'sort';
export type PipelineStatus = 'idle' | 'running' | 'completed' | 'failed' | 'paused';
export type DataType = 'string' | 'number' | 'boolean' | 'date' | 'object' | 'array' | 'null';

export interface FieldSchema {
  name: string;
  type: DataType;
  required?: boolean;
  defaultValue?: unknown;
}

export interface DataSchema {
  fields: FieldSchema[];
}

export interface PipelineStep {
  id: string;
  name: string;
  type: StepType;
  status: StepStatus;
  inputSchema?: DataSchema;
  outputSchema?: DataSchema;
  config?: Record<string, unknown>;
  order: number;
}

export interface Pipeline {
  id: string;
  name: string;
  steps: PipelineStep[];
  status: PipelineStatus;
  createdAt: number;
  lastRunAt?: number;
  description?: string;
}

export interface PipelineRun {
  runId: string;
  pipelineId: string;
  startedAt: number;
  completedAt?: number;
  status: PipelineStatus;
  stepResults: StepResult[];
  recordsProcessed: number;
  errors: string[];
}

export interface StepResult {
  stepId: string;
  status: StepStatus;
  recordsIn: number;
  recordsOut: number;
  durationMs: number;
  error?: string;
}

export type TransformFn = (record: Record<string, unknown>) => Record<string, unknown>;
export type FilterFn = (record: Record<string, unknown>) => boolean;
