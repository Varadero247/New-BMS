// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

/** Result returned by every validator */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/** A single validation rule: a function that returns a ValidationResult */
export type ValidatorFn<T> = (value: T) => ValidationResult;

/** Options attached to a validation rule */
export interface RuleOptions {
  message?: string;
  stopOnFail?: boolean;
}

/** A named validation rule with options */
export interface ValidationRule<T> {
  fn: ValidatorFn<T>;
  options?: RuleOptions;
}

/** A validation error for a single field */
export interface FieldError {
  field: string;
  messages: string[];
}

/** Map of field name → error message array */
export type FormErrors = Record<string, string[]>;

/** Compose mode: run 'all' rules or stop on 'first' failure */
export type ComposeMode = 'all' | 'first';
