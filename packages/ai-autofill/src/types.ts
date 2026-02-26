export type FieldType = 'text' | 'number' | 'date' | 'email' | 'phone' | 'address' | 'boolean' | 'select' | 'multiselect';
export type ConfidenceLevel = 'high' | 'medium' | 'low' | 'none';
export type ExtractionStrategy = 'regex' | 'nlp' | 'ml' | 'rule';

export interface FieldDefinition {
  id: string;
  label: string;
  type: FieldType;
  required: boolean;
  options?: string[];
  validation?: FieldValidation;
}

export interface FieldValidation {
  pattern?: string;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
}

export interface ExtractedValue {
  fieldId: string;
  value: string | number | boolean | string[] | null;
  confidence: number;
  confidenceLevel: ConfidenceLevel;
  strategy: ExtractionStrategy;
  rawMatch?: string;
}

export interface AutofillResult {
  documentId: string;
  fields: ExtractedValue[];
  overallConfidence: number;
  processedAt: string;
  warnings: string[];
}

export interface AutofillOptions {
  minConfidence?: number;
  strategies?: ExtractionStrategy[];
  includeRawMatch?: boolean;
}

export interface DocumentContext {
  text: string;
  metadata?: Record<string, string>;
}
