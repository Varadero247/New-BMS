// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
/** Field input types supported by the template renderer */
export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'date'
  | 'datetime'
  | 'select'
  | 'multiselect'
  | 'checkbox'
  | 'radio'
  | 'email'
  | 'url'
  | 'tel'
  | 'signature'
  | 'file'
  | 'section' // visual divider / grouping header
  | 'table' // repeatable row group
  | 'rating'; // 1-5 scale

/** A single field definition within a template */
export interface FieldDefinition {
  id: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  helpText?: string;
  defaultValue?: string | number | boolean | string[];
  options?: { label: string; value: string }[]; // for select/multiselect/radio
  validation?: {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
  columns?: FieldDefinition[]; // for type=table — defines columns
  width?: 'full' | 'half' | 'third';
  section?: string; // group fields under a section header
}

export type TemplateModule =
  | 'HEALTH_SAFETY'
  | 'ENVIRONMENT'
  | 'QUALITY'
  | 'AUTOMOTIVE'
  | 'MEDICAL'
  | 'AEROSPACE'
  | 'HR'
  | 'PAYROLL'
  | 'WORKFLOWS'
  | 'PROJECT_MANAGEMENT'
  | 'INVENTORY'
  | 'CRM'
  | 'FINANCE'
  | 'INFOSEC'
  | 'ISO37001'
  | 'ISO42001'
  | 'ESG'
  | 'CMMS'
  | 'FOOD_SAFETY'
  | 'ENERGY'
  | 'FIELD_SERVICE'
  | 'ANALYTICS'
  | 'RISK'
  | 'TRAINING'
  | 'SUPPLIERS'
  | 'ASSETS'
  | 'DOCUMENTS'
  | 'COMPLAINTS'
  | 'CONTRACTS'
  | 'PTW'
  | 'INCIDENTS'
  | 'AUDITS'
  | 'MANAGEMENT_REVIEW'
  | 'CHEMICALS';

export type TemplateCategory =
  | 'RISK_ASSESSMENT'
  | 'INCIDENT_INVESTIGATION'
  | 'AUDIT'
  | 'MANAGEMENT_REVIEW'
  | 'CAPA'
  | 'COMPLIANCE'
  | 'INSPECTION'
  | 'TRAINING'
  | 'DESIGN_DEVELOPMENT'
  | 'PROCESS_CONTROL'
  | 'SUPPLIER'
  | 'CUSTOMER'
  | 'REGULATORY'
  | 'PLANNING'
  | 'REPORTING'
  | 'GENERAL'
  | 'CERTIFICATION';

/** Complete template definition used in seed files */
export interface TemplateDefinition {
  code: string;
  name: string;
  description: string;
  module: TemplateModule;
  category: TemplateCategory;
  tags: string[];
  fields: FieldDefinition[];
  defaultContent?: Record<string, unknown>;
  isoClause?: string; // e.g. "6.1.2" — for audit doc reference
}
