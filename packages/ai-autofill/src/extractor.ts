import {
  FieldDefinition,
  ExtractedValue,
  ConfidenceLevel,
  ExtractionStrategy,
  DocumentContext,
  AutofillOptions,
} from './types';

export function getConfidenceLevel(confidence: number): ConfidenceLevel {
  if (confidence >= 0.85) return 'high';
  if (confidence >= 0.60) return 'medium';
  if (confidence >= 0.30) return 'low';
  return 'none';
}

export function clampConfidence(value: number): number {
  return Math.max(0, Math.min(1, value));
}

export function extractEmail(text: string): { value: string | null; confidence: number; raw?: string } {
  const pattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
  const match = text.match(pattern);
  if (match) return { value: match[0], confidence: 0.95, raw: match[0] };
  return { value: null, confidence: 0 };
}

export function extractPhone(text: string): { value: string | null; confidence: number; raw?: string } {
  const pattern = /\b(\+?[\d\s\-().]{7,20})\b/;
  const match = text.match(pattern);
  if (match) {
    const digits = match[1].replace(/\D/g, '');
    if (digits.length >= 7 && digits.length <= 15) {
      return { value: match[1].trim(), confidence: 0.80, raw: match[0] };
    }
  }
  return { value: null, confidence: 0 };
}

export function extractDate(text: string): { value: string | null; confidence: number; raw?: string } {
  const patterns = [
    /\b(\d{4}[-/]\d{2}[-/]\d{2})\b/,
    /\b(\d{2}[-/]\d{2}[-/]\d{4})\b/,
    /\b(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4})\b/i,
  ];
  for (const p of patterns) {
    const match = text.match(p);
    if (match) return { value: match[1], confidence: 0.88, raw: match[0] };
  }
  return { value: null, confidence: 0 };
}

export function extractNumber(
  text: string,
  field: FieldDefinition
): { value: number | null; confidence: number; raw?: string } {
  const pattern = /\b(-?\d+(?:\.\d+)?)\b/;
  const match = text.match(pattern);
  if (match) {
    const num = parseFloat(match[1]);
    const { min, max } = field.validation ?? {};
    if (min !== undefined && num < min) return { value: null, confidence: 0 };
    if (max !== undefined && num > max) return { value: null, confidence: 0 };
    return { value: num, confidence: 0.85, raw: match[0] };
  }
  return { value: null, confidence: 0 };
}

export function extractBoolean(text: string): { value: boolean | null; confidence: number } {
  const lower = text.toLowerCase();
  if (/\b(yes|true|enabled|active|confirmed|agreed)\b/.test(lower)) return { value: true, confidence: 0.90 };
  if (/\b(no|false|disabled|inactive|denied|declined)\b/.test(lower)) return { value: false, confidence: 0.90 };
  return { value: null, confidence: 0 };
}

export function extractSelect(
  text: string,
  options: string[]
): { value: string | null; confidence: number; raw?: string } {
  const lower = text.toLowerCase();
  for (const option of options) {
    if (lower.includes(option.toLowerCase())) {
      return { value: option, confidence: 0.85, raw: option };
    }
  }
  for (const option of options) {
    const words = option.toLowerCase().split(/\s+/);
    if (words.some((w) => lower.includes(w) && w.length > 3)) {
      return { value: option, confidence: 0.55, raw: option };
    }
  }
  return { value: null, confidence: 0 };
}

export function extractText(
  text: string,
  field: FieldDefinition
): { value: string | null; confidence: number } {
  const trimmed = text.trim();
  if (!trimmed) return { value: null, confidence: 0 };
  const { minLength = 0, maxLength = Infinity } = field.validation ?? {};
  if (trimmed.length < minLength || trimmed.length > maxLength) return { value: null, confidence: 0.3 };
  return { value: trimmed.slice(0, 500), confidence: 0.65 };
}

export function extractFieldValue(
  fieldDef: FieldDefinition,
  context: DocumentContext,
  options: AutofillOptions = {}
): ExtractedValue {
  const text = context.text;
  let value: ExtractedValue['value'] = null;
  let confidence = 0;
  let rawMatch: string | undefined;
  const strategy: ExtractionStrategy = fieldDef.type === 'email' ? 'regex' : 'rule';

  switch (fieldDef.type) {
    case 'email': {
      const r = extractEmail(text);
      value = r.value; confidence = r.confidence; rawMatch = r.raw; break;
    }
    case 'phone': {
      const r = extractPhone(text);
      value = r.value; confidence = r.confidence; rawMatch = r.raw; break;
    }
    case 'date': {
      const r = extractDate(text);
      value = r.value; confidence = r.confidence; rawMatch = r.raw; break;
    }
    case 'number': {
      const r = extractNumber(text, fieldDef);
      value = r.value; confidence = r.confidence; rawMatch = r.raw; break;
    }
    case 'boolean': {
      const r = extractBoolean(text);
      value = r.value; confidence = r.confidence; break;
    }
    case 'select': {
      const opts = fieldDef.options ?? [];
      const r = extractSelect(text, opts);
      value = r.value; confidence = r.confidence; rawMatch = r.raw; break;
    }
    default: {
      const r = extractText(text, fieldDef);
      value = r.value; confidence = r.confidence; break;
    }
  }

  const minConf = options.minConfidence ?? 0;
  if (confidence < minConf) { value = null; confidence = 0; }

  return {
    fieldId: fieldDef.id,
    value,
    confidence: clampConfidence(confidence),
    confidenceLevel: getConfidenceLevel(confidence),
    strategy,
    ...(options.includeRawMatch ? { rawMatch } : {}),
  };
}

export function extractAllFields(
  fields: FieldDefinition[],
  context: DocumentContext,
  options: AutofillOptions = {}
): ExtractedValue[] {
  return fields.map((f) => extractFieldValue(f, context, options));
}

export function computeOverallConfidence(extracted: ExtractedValue[]): number {
  if (extracted.length === 0) return 0;
  const sum = extracted.reduce((acc, e) => acc + e.confidence, 0);
  return clampConfidence(sum / extracted.length);
}

export function buildWarnings(fields: FieldDefinition[], extracted: ExtractedValue[]): string[] {
  const warnings: string[] = [];
  for (const f of fields) {
    const ev = extracted.find((e) => e.fieldId === f.id);
    if (f.required && (!ev || ev.value === null)) {
      warnings.push(`Required field "${f.label}" could not be extracted`);
    }
    if (ev && ev.confidenceLevel === 'low') {
      warnings.push(`Low confidence for field "${f.label}" (${(ev.confidence * 100).toFixed(0)}%)`);
    }
  }
  return warnings;
}

export function isValidFieldType(type: string): type is FieldDefinition['type'] {
  return ['text', 'number', 'date', 'email', 'phone', 'address', 'boolean', 'select', 'multiselect'].includes(type);
}

export function normaliseFieldId(id: string): string {
  return id.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
}
