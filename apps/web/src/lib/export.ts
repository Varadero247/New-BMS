import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { format } from 'date-fns';

// Types for export data
export interface ExportColumn {
  header: string;
  key: string;
  width?: number;
}

export interface ExportOptions {
  title: string;
  subtitle?: string;
  filename: string;
  columns: ExportColumn[];
  data: Record<string, unknown>[];
  standard?: 'ISO_45001' | 'ISO_14001' | 'ISO_9001' | 'ALL';
  dateRange?: { from: Date; to: Date };
}

// Standard colors
const standardColors = {
  ISO_45001: { r: 239, g: 68, b: 68 },   // Red
  ISO_14001: { r: 34, g: 197, b: 94 },   // Green
  ISO_9001: { r: 59, g: 130, b: 246 },   // Blue
  ALL: { r: 139, g: 92, b: 246 },        // Purple
};

// PDF Export
export function exportToPDF(options: ExportOptions): void {
  const { title, subtitle, filename, columns, data, standard = 'ALL', dateRange } = options;
  const doc = new jsPDF();
  const color = standardColors[standard];

  // Header background
  doc.setFillColor(color.r, color.g, color.b);
  doc.rect(0, 0, 210, 40, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 14, 18);

  // Subtitle
  if (subtitle) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(subtitle, 14, 28);
  }

  // Date info
  doc.setFontSize(10);
  const dateText = dateRange
    ? `${format(dateRange.from, 'dd MMM yyyy')} - ${format(dateRange.to, 'dd MMM yyyy')}`
    : `Generated: ${format(new Date(), 'dd MMM yyyy HH:mm')}`;
  doc.text(dateText, 14, 36);

  // Standard badge
  if (standard !== 'ALL') {
    const standardLabel = standard.replace('_', ' ');
    doc.setFontSize(10);
    const textWidth = doc.getTextWidth(standardLabel);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(196 - textWidth - 10, 10, textWidth + 8, 8, 2, 2, 'F');
    doc.setTextColor(color.r, color.g, color.b);
    doc.text(standardLabel, 196 - textWidth - 6, 16);
  }

  // Prepare table data
  const headers = columns.map(col => col.header);
  const tableData = data.map(row =>
    columns.map(col => formatCellValue(row[col.key]))
  );

  // Add table
  autoTable(doc, {
    head: [headers],
    body: tableData,
    startY: 50,
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [color.r, color.g, color.b],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    columnStyles: columns.reduce((acc, col, index) => {
      if (col.width) {
        acc[index] = { cellWidth: col.width };
      }
      return acc;
    }, {} as Record<number, { cellWidth: number }>),
    didDrawPage: (data) => {
      // Footer
      const pageCount = doc.getNumberOfPages();
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(
        `Page ${data.pageNumber} of ${pageCount} | IMS Report`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    },
  });

  // Save
  doc.save(`${filename}.pdf`);
}

// Excel Export
export function exportToExcel(options: ExportOptions): void {
  const { title, filename, columns, data, standard = 'ALL', dateRange } = options;

  // Create workbook
  const wb = XLSX.utils.book_new();

  // Prepare data with headers
  const wsData = [
    [title],
    [standard !== 'ALL' ? standard.replace('_', ' ') : 'All Standards'],
    [dateRange
      ? `${format(dateRange.from, 'dd MMM yyyy')} - ${format(dateRange.to, 'dd MMM yyyy')}`
      : `Generated: ${format(new Date(), 'dd MMM yyyy HH:mm')}`
    ],
    [], // Empty row
    columns.map(col => col.header), // Headers
    ...data.map(row => columns.map(col => formatCellValue(row[col.key]))),
  ];

  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Set column widths
  ws['!cols'] = columns.map(col => ({ wch: col.width || 15 }));

  // Merge title cell
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: columns.length - 1 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: columns.length - 1 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: columns.length - 1 } },
  ];

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Report');

  // Generate buffer
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

  // Save
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `${filename}.xlsx`);
}

// Helper to format cell values
function formatCellValue(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (value instanceof Date) return format(value, 'dd/MM/yyyy');
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

// Pre-configured export functions for specific modules

// Incidents Export
export interface IncidentExportData {
  referenceNumber: string;
  title: string;
  type: string;
  severity: string;
  status: string;
  dateOccurred: string;
  location?: string;
  reportedBy?: string;
  [key: string]: string | undefined;
}

export function exportIncidents(
  incidents: IncidentExportData[],
  standard: ExportOptions['standard'],
  title: string
): void {
  const columns: ExportColumn[] = [
    { header: 'Reference', key: 'referenceNumber', width: 15 },
    { header: 'Title', key: 'title', width: 30 },
    { header: 'Type', key: 'type', width: 15 },
    { header: 'Severity', key: 'severity', width: 12 },
    { header: 'Status', key: 'status', width: 12 },
    { header: 'Date', key: 'dateOccurred', width: 12 },
    { header: 'Location', key: 'location', width: 20 },
  ];

  const standardNames = {
    ISO_45001: 'HS_Incidents',
    ISO_14001: 'Environmental_Events',
    ISO_9001: 'Quality_NCs',
    ALL: 'All_Incidents',
  };

  const filename = `${standardNames[standard || 'ALL']}_${format(new Date(), 'yyyyMMdd')}`;

  exportToPDF({ title, filename, columns, data: incidents, standard });
}

export function exportIncidentsExcel(
  incidents: IncidentExportData[],
  standard: ExportOptions['standard'],
  title: string
): void {
  const columns: ExportColumn[] = [
    { header: 'Reference', key: 'referenceNumber', width: 15 },
    { header: 'Title', key: 'title', width: 40 },
    { header: 'Type', key: 'type', width: 20 },
    { header: 'Severity', key: 'severity', width: 12 },
    { header: 'Status', key: 'status', width: 15 },
    { header: 'Date', key: 'dateOccurred', width: 15 },
    { header: 'Location', key: 'location', width: 25 },
  ];

  const standardNames = {
    ISO_45001: 'HS_Incidents',
    ISO_14001: 'Environmental_Events',
    ISO_9001: 'Quality_NCs',
    ALL: 'All_Incidents',
  };

  const filename = `${standardNames[standard || 'ALL']}_${format(new Date(), 'yyyyMMdd')}`;

  exportToExcel({ title, filename, columns, data: incidents, standard });
}

// Actions Export
export interface ActionExportData {
  referenceNumber: string;
  title: string;
  type: string;
  priority: string;
  status: string;
  dueDate: string;
  owner?: string;
  standard?: string;
  [key: string]: string | undefined;
}

export function exportActions(actions: ActionExportData[], title: string = 'CAPA Actions Report'): void {
  const columns: ExportColumn[] = [
    { header: 'Reference', key: 'referenceNumber', width: 15 },
    { header: 'Title', key: 'title', width: 30 },
    { header: 'Type', key: 'type', width: 12 },
    { header: 'Priority', key: 'priority', width: 10 },
    { header: 'Status', key: 'status', width: 15 },
    { header: 'Due Date', key: 'dueDate', width: 12 },
    { header: 'Owner', key: 'owner', width: 18 },
    { header: 'Standard', key: 'standard', width: 12 },
  ];

  const filename = `CAPA_Actions_${format(new Date(), 'yyyyMMdd')}`;

  exportToPDF({ title, filename, columns, data: actions });
}

export function exportActionsExcel(actions: ActionExportData[], title: string = 'CAPA Actions Report'): void {
  const columns: ExportColumn[] = [
    { header: 'Reference', key: 'referenceNumber', width: 18 },
    { header: 'Title', key: 'title', width: 45 },
    { header: 'Type', key: 'type', width: 15 },
    { header: 'Priority', key: 'priority', width: 12 },
    { header: 'Status', key: 'status', width: 18 },
    { header: 'Due Date', key: 'dueDate', width: 15 },
    { header: 'Owner', key: 'owner', width: 22 },
    { header: 'Standard', key: 'standard', width: 15 },
  ];

  const filename = `CAPA_Actions_${format(new Date(), 'yyyyMMdd')}`;

  exportToExcel({ title, filename, columns, data: actions });
}

// Risks Export
export interface RiskExportData {
  referenceNumber: string;
  title: string;
  category: string;
  likelihood: number;
  severity: number;
  riskScore: number;
  riskLevel: string;
  status: string;
  owner?: string;
  [key: string]: string | number | undefined;
}

export function exportRisks(
  risks: RiskExportData[],
  standard: ExportOptions['standard'],
  title: string
): void {
  const columns: ExportColumn[] = [
    { header: 'Reference', key: 'referenceNumber', width: 15 },
    { header: 'Title', key: 'title', width: 28 },
    { header: 'Category', key: 'category', width: 15 },
    { header: 'L', key: 'likelihood', width: 6 },
    { header: 'S', key: 'severity', width: 6 },
    { header: 'Score', key: 'riskScore', width: 8 },
    { header: 'Level', key: 'riskLevel', width: 10 },
    { header: 'Status', key: 'status', width: 10 },
  ];

  const standardNames = {
    ISO_45001: 'HS_Risks',
    ISO_14001: 'Environmental_Aspects',
    ISO_9001: 'Quality_Risks',
    ALL: 'All_Risks',
  };

  const filename = `${standardNames[standard || 'ALL']}_${format(new Date(), 'yyyyMMdd')}`;

  exportToPDF({ title, filename, columns, data: risks, standard });
}

export function exportRisksExcel(
  risks: RiskExportData[],
  standard: ExportOptions['standard'],
  title: string
): void {
  const columns: ExportColumn[] = [
    { header: 'Reference', key: 'referenceNumber', width: 18 },
    { header: 'Title', key: 'title', width: 40 },
    { header: 'Category', key: 'category', width: 18 },
    { header: 'Likelihood', key: 'likelihood', width: 12 },
    { header: 'Severity', key: 'severity', width: 12 },
    { header: 'Risk Score', key: 'riskScore', width: 12 },
    { header: 'Risk Level', key: 'riskLevel', width: 12 },
    { header: 'Status', key: 'status', width: 15 },
    { header: 'Owner', key: 'owner', width: 22 },
  ];

  const standardNames = {
    ISO_45001: 'HS_Risks',
    ISO_14001: 'Environmental_Aspects',
    ISO_9001: 'Quality_Risks',
    ALL: 'All_Risks',
  };

  const filename = `${standardNames[standard || 'ALL']}_${format(new Date(), 'yyyyMMdd')}`;

  exportToExcel({ title, filename, columns, data: risks, standard });
}

// Compliance Summary Export
export interface ComplianceSummaryData {
  standard: string;
  compliance: number;
  totalRequirements: number;
  compliant: number;
  nonCompliant: number;
  lastAuditDate?: string;
  [key: string]: string | number | undefined;
}

export function exportComplianceSummary(data: ComplianceSummaryData[]): void {
  const columns: ExportColumn[] = [
    { header: 'Standard', key: 'standard', width: 15 },
    { header: 'Compliance %', key: 'compliance', width: 15 },
    { header: 'Total Requirements', key: 'totalRequirements', width: 18 },
    { header: 'Compliant', key: 'compliant', width: 12 },
    { header: 'Non-Compliant', key: 'nonCompliant', width: 15 },
    { header: 'Last Audit', key: 'lastAuditDate', width: 15 },
  ];

  const filename = `Compliance_Summary_${format(new Date(), 'yyyyMMdd')}`;

  exportToPDF({
    title: 'IMS Compliance Summary',
    subtitle: 'Integrated Management System',
    filename,
    columns,
    data,
  });
}

export function exportComplianceSummaryExcel(data: ComplianceSummaryData[]): void {
  const columns: ExportColumn[] = [
    { header: 'Standard', key: 'standard', width: 18 },
    { header: 'Compliance %', key: 'compliance', width: 15 },
    { header: 'Total Requirements', key: 'totalRequirements', width: 20 },
    { header: 'Compliant', key: 'compliant', width: 15 },
    { header: 'Non-Compliant', key: 'nonCompliant', width: 15 },
    { header: 'Last Audit', key: 'lastAuditDate', width: 18 },
  ];

  const filename = `Compliance_Summary_${format(new Date(), 'yyyyMMdd')}`;

  exportToExcel({
    title: 'IMS Compliance Summary',
    subtitle: 'Integrated Management System',
    filename,
    columns,
    data,
  });
}

// Safety Metrics Export
export interface SafetyMetricsData {
  period: string;
  ltifr: number;
  trir: number;
  severityRate: number;
  nearMisses: number;
  incidents: number;
  lostDays: number;
  [key: string]: string | number | undefined;
}

export function exportSafetyMetrics(data: SafetyMetricsData[]): void {
  const columns: ExportColumn[] = [
    { header: 'Period', key: 'period', width: 15 },
    { header: 'LTIFR', key: 'ltifr', width: 10 },
    { header: 'TRIR', key: 'trir', width: 10 },
    { header: 'Severity Rate', key: 'severityRate', width: 14 },
    { header: 'Near Misses', key: 'nearMisses', width: 12 },
    { header: 'Incidents', key: 'incidents', width: 10 },
    { header: 'Lost Days', key: 'lostDays', width: 12 },
  ];

  const filename = `Safety_Metrics_${format(new Date(), 'yyyyMMdd')}`;

  exportToPDF({
    title: 'Safety Performance Metrics',
    subtitle: 'ISO 45001 Health & Safety',
    filename,
    columns,
    data,
    standard: 'ISO_45001',
  });
}

export function exportSafetyMetricsExcel(data: SafetyMetricsData[]): void {
  const columns: ExportColumn[] = [
    { header: 'Period', key: 'period', width: 18 },
    { header: 'LTIFR', key: 'ltifr', width: 12 },
    { header: 'TRIR', key: 'trir', width: 12 },
    { header: 'Severity Rate', key: 'severityRate', width: 15 },
    { header: 'Near Misses', key: 'nearMisses', width: 15 },
    { header: 'Incidents', key: 'incidents', width: 12 },
    { header: 'Lost Days', key: 'lostDays', width: 15 },
  ];

  const filename = `Safety_Metrics_${format(new Date(), 'yyyyMMdd')}`;

  exportToExcel({
    title: 'Safety Performance Metrics',
    subtitle: 'ISO 45001 Health & Safety',
    filename,
    columns,
    data,
    standard: 'ISO_45001',
  });
}

// Quality Metrics Export
export interface QualityMetricsData {
  period: string;
  dpmo: number;
  firstPassYield: number;
  processSigma: number;
  copqInternal: number;
  copqExternal: number;
  copqTotal: number;
  [key: string]: string | number | undefined;
}

export function exportQualityMetrics(data: QualityMetricsData[]): void {
  const columns: ExportColumn[] = [
    { header: 'Period', key: 'period', width: 12 },
    { header: 'DPMO', key: 'dpmo', width: 10 },
    { header: 'FPY %', key: 'firstPassYield', width: 10 },
    { header: 'Sigma', key: 'processSigma', width: 10 },
    { header: 'COPQ Int', key: 'copqInternal', width: 12 },
    { header: 'COPQ Ext', key: 'copqExternal', width: 12 },
    { header: 'COPQ Total', key: 'copqTotal', width: 12 },
  ];

  const filename = `Quality_Metrics_${format(new Date(), 'yyyyMMdd')}`;

  exportToPDF({
    title: 'Quality Performance Metrics',
    subtitle: 'ISO 9001 Quality Management',
    filename,
    columns,
    data,
    standard: 'ISO_9001',
  });
}

export function exportQualityMetricsExcel(data: QualityMetricsData[]): void {
  const columns: ExportColumn[] = [
    { header: 'Period', key: 'period', width: 15 },
    { header: 'DPMO', key: 'dpmo', width: 12 },
    { header: 'First Pass Yield %', key: 'firstPassYield', width: 18 },
    { header: 'Process Sigma', key: 'processSigma', width: 15 },
    { header: 'COPQ Internal', key: 'copqInternal', width: 15 },
    { header: 'COPQ External', key: 'copqExternal', width: 15 },
    { header: 'COPQ Total', key: 'copqTotal', width: 15 },
  ];

  const filename = `Quality_Metrics_${format(new Date(), 'yyyyMMdd')}`;

  exportToExcel({
    title: 'Quality Performance Metrics',
    subtitle: 'ISO 9001 Quality Management',
    filename,
    columns,
    data,
    standard: 'ISO_9001',
  });
}
