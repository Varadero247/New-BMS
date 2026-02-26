export type FormFieldType =
  | 'text' | 'textarea' | 'number' | 'email' | 'password' | 'tel'
  | 'date' | 'datetime' | 'time' | 'checkbox' | 'radio' | 'select'
  | 'multiselect' | 'file' | 'hidden' | 'range' | 'color' | 'url';

export type ValidationRule =
  | { type: 'required' }
  | { type: 'minLength'; value: number }
  | { type: 'maxLength'; value: number }
  | { type: 'min'; value: number }
  | { type: 'max'; value: number }
  | { type: 'pattern'; value: string; message?: string }
  | { type: 'email' }
  | { type: 'url' }
  | { type: 'custom'; fn: (value: unknown) => boolean; message: string };

export interface FormOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface FormField {
  id: string;
  type: FormFieldType;
  label: string;
  placeholder?: string;
  defaultValue?: unknown;
  validation?: ValidationRule[];
  options?: FormOption[];
  helpText?: string;
  disabled?: boolean;
  hidden?: boolean;
  dependsOn?: { fieldId: string; value: unknown };
  order: number;
}

export interface FormSection {
  id: string;
  title: string;
  fields: FormField[];
  collapsible?: boolean;
  order: number;
}

export interface FormSchema {
  id: string;
  title: string;
  description?: string;
  sections: FormSection[];
  submitLabel?: string;
  version: number;
}

export interface FormValues {
  [fieldId: string]: unknown;
}

export interface ValidationError {
  fieldId: string;
  message: string;
}

export interface FormState {
  values: FormValues;
  errors: ValidationError[];
  isValid: boolean;
  isDirty: boolean;
  touchedFields: Set<string>;
}
