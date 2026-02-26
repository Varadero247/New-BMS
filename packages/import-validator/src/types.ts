export type FieldType = 'string' | 'number' | 'boolean' | 'date' | 'email' | 'url' | 'uuid';
export type ImportStatus = 'pending' | 'valid' | 'invalid' | 'skipped';

export interface FieldSchema {
  name: string;
  type: FieldType;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  enum?: string[];
  pattern?: string;
}

export interface ImportSchema {
  name: string;
  fields: FieldSchema[];
  allowExtra?: boolean;
}

export interface FieldError {
  field: string;
  message: string;
  value: unknown;
}

export interface RowResult {
  rowIndex: number;
  status: ImportStatus;
  data: Record<string, unknown>;
  errors: FieldError[];
}

export interface ImportResult {
  schema: string;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  skippedRows: number;
  rows: RowResult[];
  errors: FieldError[];
}
