import { FormField, FormFieldType, FormOption, FormSchema, FormSection, ValidationRule } from './types';

export function createField(
  overrides: Partial<FormField> & { id: string; type: FormFieldType; label: string; order: number }
): FormField {
  return { ...overrides } as FormField;
}

export function createSection(
  id: string, title: string, fields: FormField[], order: number
): FormSection {
  return { id, title, fields, order };
}

export function createSchema(
  id: string, title: string, sections: FormSection[], version = 1
): FormSchema {
  return { id, title, sections, version };
}

export function addFieldToSection(section: FormSection, field: FormField): FormSection {
  return { ...section, fields: [...section.fields, field] };
}

export function removeFieldFromSection(section: FormSection, fieldId: string): FormSection {
  return { ...section, fields: section.fields.filter((f) => f.id !== fieldId) };
}

export function reorderFields(section: FormSection): FormSection {
  return { ...section, fields: [...section.fields].sort((a, b) => a.order - b.order) };
}

export function flattenFields(schema: FormSchema): FormField[] {
  return schema.sections.flatMap((s) => s.fields);
}

export function findField(schema: FormSchema, fieldId: string): FormField | undefined {
  return flattenFields(schema).find((f) => f.id === fieldId);
}

export function getDefaultValues(schema: FormSchema): Record<string, unknown> {
  const defaults: Record<string, unknown> = {};
  for (const field of flattenFields(schema)) {
    defaults[field.id] = field.defaultValue ?? null;
  }
  return defaults;
}

export function countFields(schema: FormSchema): number {
  return flattenFields(schema).length;
}

export function getRequiredFields(schema: FormSchema): FormField[] {
  return flattenFields(schema).filter(
    (f) => f.validation?.some((v) => v.type === 'required')
  );
}

export function schemaToJson(schema: FormSchema): string {
  return JSON.stringify(schema, null, 2);
}

export function schemaFromJson(json: string): FormSchema {
  return JSON.parse(json) as FormSchema;
}

export function isValidFieldType(type: string): type is FormFieldType {
  return [
    'text', 'textarea', 'number', 'email', 'password', 'tel',
    'date', 'datetime', 'time', 'checkbox', 'radio', 'select',
    'multiselect', 'file', 'hidden', 'range', 'color', 'url',
  ].includes(type);
}

export function buildOption(label: string, value: string, disabled = false): FormOption {
  return { label, value, disabled };
}

export function requiredRule(): ValidationRule {
  return { type: 'required' };
}

export function minLengthRule(value: number): ValidationRule {
  return { type: 'minLength', value };
}

export function maxLengthRule(value: number): ValidationRule {
  return { type: 'maxLength', value };
}

export function patternRule(value: string, message?: string): ValidationRule {
  return { type: 'pattern', value, ...(message ? { message } : {}) };
}

export function sortSections(schema: FormSchema): FormSchema {
  return { ...schema, sections: [...schema.sections].sort((a, b) => a.order - b.order) };
}
