import { FormField, FormSchema, FormValues, ValidationError, ValidationRule } from './types';

export function validateRule(value: unknown, rule: ValidationRule, field: FormField): string | null {
  switch (rule.type) {
    case 'required':
      if (value === null || value === undefined || value === '' ||
          (Array.isArray(value) && value.length === 0)) {
        return `${field.label} is required`;
      }
      break;
    case 'minLength':
      if (typeof value === 'string' && value.length < rule.value) {
        return `${field.label} must be at least ${rule.value} characters`;
      }
      break;
    case 'maxLength':
      if (typeof value === 'string' && value.length > rule.value) {
        return `${field.label} must be at most ${rule.value} characters`;
      }
      break;
    case 'min':
      if (typeof value === 'number' && value < rule.value) {
        return `${field.label} must be at least ${rule.value}`;
      }
      break;
    case 'max':
      if (typeof value === 'number' && value > rule.value) {
        return `${field.label} must be at most ${rule.value}`;
      }
      break;
    case 'pattern': {
      if (typeof value === 'string' && value && !new RegExp(rule.value).test(value)) {
        return rule.message ?? `${field.label} does not match the required pattern`;
      }
      break;
    }
    case 'email':
      if (typeof value === 'string' && value &&
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return `${field.label} must be a valid email address`;
      }
      break;
    case 'url':
      if (typeof value === 'string' && value) {
        try { new URL(value); } catch { return `${field.label} must be a valid URL`; }
      }
      break;
    case 'custom':
      if (!rule.fn(value)) return rule.message;
      break;
  }
  return null;
}

export function validateField(field: FormField, value: unknown): ValidationError[] {
  if (field.disabled || field.hidden) return [];
  const errors: ValidationError[] = [];
  for (const rule of field.validation ?? []) {
    const msg = validateRule(value, rule, field);
    if (msg) errors.push({ fieldId: field.id, message: msg });
  }
  return errors;
}

export function validateForm(schema: FormSchema, values: FormValues): ValidationError[] {
  const errors: ValidationError[] = [];
  for (const section of schema.sections) {
    for (const field of section.fields) {
      const value = values[field.id];
      if (field.dependsOn) {
        const depValue = values[field.dependsOn.fieldId];
        if (depValue !== field.dependsOn.value) continue;
      }
      errors.push(...validateField(field, value));
    }
  }
  return errors;
}

export function isFormValid(schema: FormSchema, values: FormValues): boolean {
  return validateForm(schema, values).length === 0;
}

export function getFieldErrors(errors: ValidationError[], fieldId: string): string[] {
  return errors.filter((e) => e.fieldId === fieldId).map((e) => e.message);
}
