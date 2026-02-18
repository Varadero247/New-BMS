import {
  PDFTemplate,
  PDFOptions,
  PDFSection,
  InvoiceData,
  ReportData,
  EvidencePackData,
} from './types';
import { invoiceTemplate, reportTemplate, evidencePackTemplate } from './templates';

/**
 * Format a currency amount with the appropriate symbol.
 * @param amount - Numeric amount
 * @param currency - ISO currency code
 * @returns Formatted string
 */
export function formatCurrency(amount: number, currency: string): string {
  const symbols: Record<string, string> = {
    GBP: '\u00a3',
    USD: '$',
    EUR: '\u20ac',
    AED: 'AED ',
    AUD: 'A$',
    CAD: 'C$',
    JPY: '\u00a5',
    CHF: 'CHF ',
    INR: '\u20b9',
    ZAR: 'R',
  };
  const symbol = symbols[currency] || currency + ' ';
  return `${symbol}${amount.toFixed(2)}`;
}

/**
 * Format a date for display.
 * @param date - Date to format
 * @param locale - Locale string (default: 'en-GB')
 * @returns Formatted date string
 */
export function formatDate(date: Date, locale: string = 'en-GB'): string {
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function renderSection(section: PDFSection): string {
  switch (section.type) {
    case 'header':
      return `<h2 style="${styleToString(section.style)}">${section.content || ''}</h2>`;

    case 'paragraph':
      return `<p style="${styleToString(section.style)}">${section.content || ''}</p>`;

    case 'table':
      if (!section.headers || !section.rows) return '';
      const headerRow = section.headers.map((h) => `<th>${h}</th>`).join('');
      const bodyRows = section.rows
        .map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join('')}</tr>`)
        .join('');
      return `<table><thead><tr>${headerRow}</tr></thead><tbody>${bodyRows}</tbody></table>`;

    case 'list':
      if (!section.items) return '';
      const listItems = section.items.map((item) => `<li>${item}</li>`).join('');
      return `<ul style="${styleToString(section.style)}">${listItems}</ul>`;

    case 'divider':
      return '<hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />';

    case 'key-value':
      if (!section.pairs) return '';
      const kvRows = section.pairs
        .map(
          (p) =>
            `<div class="kv-pair"><span class="kv-key">${p.key}:</span><span>${p.value}</span></div>`
        )
        .join('');
      return `<div>${kvRows}</div>`;

    case 'signature':
      return `<div class="signature-line">${section.content || 'Signature'}</div>`;

    default:
      return '';
  }
}

function styleToString(style?: Record<string, string>): string {
  if (!style) return '';
  return Object.entries(style)
    .map(([key, value]) => `${key}: ${value}`)
    .join('; ');
}

/**
 * Generate a PDF as an HTML Buffer from a template and data.
 * In production, this HTML would be converted to PDF via puppeteer or similar.
 * For now, returns the HTML as a Buffer.
 *
 * @param template - PDF template with sections
 * @param data - Data to interpolate into the template
 * @param options - PDF generation options
 * @returns Buffer containing the generated HTML
 */
export function generatePDF(
  template: PDFTemplate,
  data: Record<string, any>,
  options: PDFOptions = {}
): Buffer {
  const watermarkHtml = options.watermark
    ? `<div class="watermark">${options.watermark}</div>`
    : '';

  const headerHtml = template.header
    ? `<div class="header">
        <div>
          <h1>${template.title}</h1>
          ${template.header.subtitle ? `<div class="subtitle">${template.header.subtitle}</div>` : ''}
        </div>
        <div class="company-info">
          ${template.header.company ? `<strong>${template.header.company}</strong>` : ''}
        </div>
      </div>`
    : `<h1>${template.title}</h1>`;

  // Interpolate data into section content
  const sectionsHtml = template.sections
    .map((section) => {
      const interpolated = { ...section };
      if (interpolated.content) {
        interpolated.content = interpolateString(interpolated.content, data);
      }
      return renderSection(interpolated);
    })
    .join('\n');

  const footerHtml = template.footer
    ? `<div class="footer">${template.footer.text || ''}</div>`
    : '';

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 12px; color: #333; line-height: 1.5; }
    .page { max-width: ${options.pageSize === 'Letter' ? '8.5in' : '210mm'}; margin: 0 auto; padding: 20mm; }
    .header { display: flex; justify-content: space-between; margin-bottom: 30px; border-bottom: 2px solid #1a56db; padding-bottom: 15px; }
    .header h1 { font-size: 24px; color: #1a56db; }
    .subtitle { color: #666; font-size: 14px; }
    .company-info { text-align: right; }
    table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    th { background: #f1f5f9; padding: 10px; text-align: left; border-bottom: 2px solid #e2e8f0; }
    td { padding: 8px 10px; border-bottom: 1px solid #e2e8f0; }
    .kv-pair { display: flex; gap: 10px; padding: 4px 0; }
    .kv-key { font-weight: 600; min-width: 150px; }
    .footer { margin-top: 40px; padding-top: 15px; border-top: 1px solid #e2e8f0; color: #999; font-size: 10px; text-align: center; }
    .watermark { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); font-size: 80px; color: rgba(0,0,0,0.05); z-index: -1; }
    .signature-line { margin-top: 40px; border-top: 1px solid #333; width: 200px; padding-top: 5px; }
    ul { margin-left: 20px; }
    li { margin: 3px 0; }
  </style>
</head>
<body>
  ${watermarkHtml}
  <div class="page">
    ${headerHtml}
    ${sectionsHtml}
    ${footerHtml}
  </div>
</body>
</html>`;

  return Buffer.from(html, 'utf-8');
}

/**
 * Generate an invoice PDF.
 * @param invoice - Invoice data
 * @returns Buffer containing the generated HTML
 */
export function generateInvoicePDF(invoice: InvoiceData): Buffer {
  const html = invoiceTemplate(invoice);
  return Buffer.from(html, 'utf-8');
}

/**
 * Generate a report PDF.
 * @param report - Report data
 * @returns Buffer containing the generated HTML
 */
export function generateReportPDF(report: ReportData): Buffer {
  const html = reportTemplate(report);
  return Buffer.from(html, 'utf-8');
}

/**
 * Generate an evidence pack PDF.
 * @param evidence - Evidence pack data
 * @returns Buffer containing the generated HTML
 */
export function generateEvidencePackPDF(evidence: EvidencePackData): Buffer {
  const html = evidencePackTemplate(evidence);
  return Buffer.from(html, 'utf-8');
}

function interpolateString(str: string, data: Record<string, any>): string {
  return str.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (_, key) => {
    const keys = key.split('.');
    let value: unknown = data;
    for (const k of keys) {
      value = value?.[k];
    }
    return value !== undefined ? String(value) : '';
  });
}
