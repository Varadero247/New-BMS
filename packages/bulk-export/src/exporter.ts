// Copyright (c) 2026 Nexara DMCC. All rights reserved. CONFIDENTIAL — TRADE SECRET.
import type { ExportOptions, ExportResult, ExportError, ExportFormat } from './types';
import {
  getMimeType, getMaxRows, buildCsvContent,
  buildJsonContent, ensureFilenameExtension, isValidFormat, validateColumns,
} from './formatter';

export function exportData(
  rows: Record<string, unknown>[],
  options: ExportOptions
): { result: ExportResult | null; error: ExportError | null } {
  const { format, filename, columns, sheetName: _s, includeHeaders = true, dateFormat, currencySymbol, maxRows } = options;

  if (!isValidFormat(format)) {
    return { result: null, error: { code: 'INVALID_FORMAT', message: `Unsupported format: ${format}` } };
  }

  const colError = validateColumns(columns);
  if (colError) {
    return { result: null, error: { code: 'INVALID_COLUMN', message: colError } };
  }

  const limit = maxRows ?? getMaxRows(format);
  if (rows.length > limit) {
    return { result: null, error: { code: 'TOO_MANY_ROWS', message: `Row count ${rows.length} exceeds limit ${limit}` } };
  }

  let content: string;
  try {
    if (format === 'csv') {
      content = buildCsvContent(rows, columns, includeHeaders, { dateFormat, currencySymbol });
    } else if (format === 'json') {
      content = buildJsonContent(rows, columns);
    } else {
      // xlsx and pdf: return a placeholder base64 stub (real impl uses exceljs/pdfkit)
      content = Buffer.from(`${format.toUpperCase()}:${rows.length}rows`).toString('base64');
    }
  } catch (e) {
    return { result: null, error: { code: 'ENCODE_ERROR', message: String(e) } };
  }

  const finalFilename = ensureFilenameExtension(filename, format);
  const byteSize = Buffer.byteLength(content, 'utf8');

  return {
    result: {
      filename: finalFilename,
      format,
      rowCount: rows.length,
      byteSize,
      mimeType: getMimeType(format),
      content,
    },
    error: null,
  };
}

export function estimateExportSize(rowCount: number, colCount: number, format: ExportFormat): number {
  const bytesPerCell: Record<string, number> = { csv: 15, xlsx: 10, pdf: 25, json: 40 };
  return rowCount * colCount * (bytesPerCell[format] ?? 20);
}

export function chunkRows<T>(rows: T[], chunkSize: number): T[][] {
  if (chunkSize <= 0) return [rows];
  const chunks: T[][] = [];
  for (let i = 0; i < rows.length; i += chunkSize) {
    chunks.push(rows.slice(i, i + chunkSize));
  }
  return chunks;
}

export function mergeExportResults(results: ExportResult[]): ExportResult {
  if (results.length === 0) throw new Error('No results to merge');
  const first = results[0];
  const totalRows = results.reduce((s, r) => s + r.rowCount, 0);
  const totalBytes = results.reduce((s, r) => s + r.byteSize, 0);
  const merged = results.map((r) => r.content).join('\n');
  return { ...first, rowCount: totalRows, byteSize: totalBytes, content: merged };
}
