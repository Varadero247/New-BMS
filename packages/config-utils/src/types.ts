// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

/** Primitive configuration value types */
export type ConfigValue = string | number | boolean | null | undefined | ConfigValue[] | { [key: string]: ConfigValue };

/** A single field definition within a config schema */
export interface ConfigField {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  required?: boolean;
  default?: ConfigValue;
  min?: number;
  max?: number;
  enum?: ConfigValue[];
  description?: string;
}

/** A schema describing the shape and rules of a config object */
export type ConfigSchema = Record<string, ConfigField>;

/** A config error with a message and optional field path */
export interface ConfigError {
  field: string;
  message: string;
  code: string;
}

/** Result of parsing an env-like object, with typed accessor methods */
export interface ParsedEnv {
  raw: Record<string, string | undefined>;
  getString(key: string, defaultValue?: string): string;
  getNumber(key: string, defaultValue?: number): number;
  getBoolean(key: string, defaultValue?: boolean): boolean;
  getArray(key: string, separator?: string, defaultValue?: string[]): string[];
  getJson<T>(key: string, defaultValue?: T): T;
  require(keys: string[]): void;
  has(key: string): boolean;
  keys(): string[];
}

/** Source of configuration (for audit/tracing purposes) */
export type ConfigSource = 'env' | 'file' | 'default' | 'runtime' | 'remote';

/** Utility type for deep partial of any object */
export type DeepPartial<T> = T extends object
  ? { [P in keyof T]?: DeepPartial<T[P]> }
  : T;

/** Event emitted when a config value changes */
export interface ConfigChangeEvent<T extends object> {
  previous: T;
  current: T;
  changedPaths: string[];
  timestamp: number;
}
