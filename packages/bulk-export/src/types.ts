// Copyright (c) 2026 Nexara DMCC. All rights reserved. CONFIDENTIAL — TRADE SECRET.

export type ExportFormat = 'xlsx' | 'csv' | 'pdf' | 'json';

export interface ExportColumn {
  key: string;
  label: string;
  width?: number;
  format?: 'text' | 'number' | 'date' | 'boolean' | 'currency';
}

export interface ExportOptions {
  format: ExportFormat;
  filename: string;
  columns: ExportColumn[];
  sheetName?: string;
  includeHeaders?: boolean;
  dateFormat?: string;
  currencySymbol?: string;
  maxRows?: number;
}

export interface ExportResult {
  filename: string;
  format: ExportFormat;
  rowCount: number;
  byteSize: number;
  mimeType: string;
  content: string; // base64 or CSV string
}

export interface ExportError {
  code: 'INVALID_FORMAT' | 'TOO_MANY_ROWS' | 'EMPTY_DATA' | 'INVALID_COLUMN' | 'ENCODE_ERROR';
  message: string;
}
