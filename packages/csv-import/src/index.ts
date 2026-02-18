/**
 * @ims/csv-import — Bulk CSV Import Engine
 *
 * Parses CSV strings, validates against per-record-type schemas,
 * and stores imported records in memory.
 */

// ─── Types ──────────────────────────────────────────────────────────────────

export interface FieldDef {
  name: string;
  label: string;
  required: boolean;
  type: 'string' | 'number' | 'date' | 'email' | 'enum';
  enumValues?: string[];
}

export interface ImportSchema {
  recordType: string;
  label: string;
  fields: FieldDef[];
}

export interface ParsedRow {
  [key: string]: string | number | null;
}

export interface ParseResult {
  valid: ParsedRow[];
  errors: string[];
  totalRows: number;
}

export interface ImportResult {
  imported: number;
  recordType: string;
  orgId: string;
  importedAt: string;
}

export interface ImportedRecord {
  id: string;
  recordType: string;
  orgId: string;
  data: ParsedRow;
  importedAt: string;
}

// ─── Import Schemas (10 record types) ───────────────────────────────────────

export const IMPORT_SCHEMAS: ImportSchema[] = [
  {
    recordType: 'risks',
    label: 'Risk Register',
    fields: [
      { name: 'title', label: 'Title', required: true, type: 'string' },
      { name: 'description', label: 'Description', required: false, type: 'string' },
      { name: 'category', label: 'Category', required: true, type: 'string' },
      { name: 'likelihood', label: 'Likelihood (1-5)', required: true, type: 'number' },
      { name: 'consequence', label: 'Consequence (1-5)', required: true, type: 'number' },
      {
        name: 'status',
        label: 'Status',
        required: true,
        type: 'enum',
        enumValues: ['OPEN', 'MITIGATED', 'CLOSED', 'ACCEPTED'],
      },
      { name: 'owner', label: 'Owner', required: false, type: 'string' },
      { name: 'dueDate', label: 'Due Date', required: false, type: 'date' },
    ],
  },
  {
    recordType: 'incidents',
    label: 'Incidents',
    fields: [
      { name: 'title', label: 'Title', required: true, type: 'string' },
      { name: 'description', label: 'Description', required: true, type: 'string' },
      { name: 'dateOccurred', label: 'Date Occurred', required: true, type: 'date' },
      {
        name: 'severity',
        label: 'Severity',
        required: true,
        type: 'enum',
        enumValues: ['MINOR', 'MODERATE', 'MAJOR', 'CRITICAL', 'CATASTROPHIC'],
      },
      { name: 'location', label: 'Location', required: false, type: 'string' },
      { name: 'reportedBy', label: 'Reported By', required: false, type: 'string' },
      {
        name: 'status',
        label: 'Status',
        required: true,
        type: 'enum',
        enumValues: ['OPEN', 'INVESTIGATING', 'RESOLVED', 'CLOSED'],
      },
    ],
  },
  {
    recordType: 'aspects',
    label: 'Environmental Aspects',
    fields: [
      { name: 'name', label: 'Aspect Name', required: true, type: 'string' },
      { name: 'activity', label: 'Activity', required: true, type: 'string' },
      { name: 'impact', label: 'Impact', required: true, type: 'string' },
      { name: 'severity', label: 'Severity (1-10)', required: true, type: 'number' },
      { name: 'probability', label: 'Probability (1-10)', required: true, type: 'number' },
      { name: 'controlMeasure', label: 'Control Measure', required: false, type: 'string' },
    ],
  },
  {
    recordType: 'ncrs',
    label: 'Non-Conformance Reports',
    fields: [
      { name: 'title', label: 'Title', required: true, type: 'string' },
      { name: 'description', label: 'Description', required: true, type: 'string' },
      {
        name: 'source',
        label: 'Source',
        required: true,
        type: 'enum',
        enumValues: ['AUDIT', 'INSPECTION', 'CUSTOMER_COMPLAINT', 'INTERNAL', 'SUPPLIER'],
      },
      {
        name: 'severity',
        label: 'Severity',
        required: true,
        type: 'enum',
        enumValues: ['MINOR', 'MAJOR', 'CRITICAL'],
      },
      { name: 'dateIdentified', label: 'Date Identified', required: true, type: 'date' },
      { name: 'assignedTo', label: 'Assigned To', required: false, type: 'string' },
    ],
  },
  {
    recordType: 'capas',
    label: 'CAPAs',
    fields: [
      { name: 'title', label: 'Title', required: true, type: 'string' },
      { name: 'description', label: 'Description', required: true, type: 'string' },
      {
        name: 'type',
        label: 'Type',
        required: true,
        type: 'enum',
        enumValues: ['CORRECTIVE', 'PREVENTIVE'],
      },
      {
        name: 'priority',
        label: 'Priority',
        required: true,
        type: 'enum',
        enumValues: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      },
      { name: 'dueDate', label: 'Due Date', required: true, type: 'date' },
      { name: 'assignedTo', label: 'Assigned To', required: false, type: 'string' },
      { name: 'rootCause', label: 'Root Cause', required: false, type: 'string' },
    ],
  },
  {
    recordType: 'assets',
    label: 'Assets',
    fields: [
      { name: 'name', label: 'Asset Name', required: true, type: 'string' },
      { name: 'assetTag', label: 'Asset Tag', required: true, type: 'string' },
      { name: 'category', label: 'Category', required: true, type: 'string' },
      { name: 'location', label: 'Location', required: true, type: 'string' },
      {
        name: 'status',
        label: 'Status',
        required: true,
        type: 'enum',
        enumValues: ['ACTIVE', 'MAINTENANCE', 'RETIRED', 'DISPOSED'],
      },
      { name: 'purchaseDate', label: 'Purchase Date', required: false, type: 'date' },
      { name: 'purchaseCost', label: 'Purchase Cost', required: false, type: 'number' },
    ],
  },
  {
    recordType: 'employees',
    label: 'Employees',
    fields: [
      { name: 'firstName', label: 'First Name', required: true, type: 'string' },
      { name: 'lastName', label: 'Last Name', required: true, type: 'string' },
      { name: 'email', label: 'Email', required: true, type: 'email' },
      { name: 'department', label: 'Department', required: true, type: 'string' },
      { name: 'jobTitle', label: 'Job Title', required: true, type: 'string' },
      { name: 'startDate', label: 'Start Date', required: true, type: 'date' },
      { name: 'employeeId', label: 'Employee ID', required: false, type: 'string' },
    ],
  },
  {
    recordType: 'contacts',
    label: 'CRM Contacts',
    fields: [
      { name: 'firstName', label: 'First Name', required: true, type: 'string' },
      { name: 'lastName', label: 'Last Name', required: true, type: 'string' },
      { name: 'email', label: 'Email', required: true, type: 'email' },
      { name: 'company', label: 'Company', required: false, type: 'string' },
      { name: 'phone', label: 'Phone', required: false, type: 'string' },
      {
        name: 'type',
        label: 'Type',
        required: true,
        type: 'enum',
        enumValues: ['CUSTOMER', 'SUPPLIER', 'PARTNER', 'PROSPECT'],
      },
    ],
  },
  {
    recordType: 'audits',
    label: 'Audits',
    fields: [
      { name: 'title', label: 'Audit Title', required: true, type: 'string' },
      {
        name: 'type',
        label: 'Type',
        required: true,
        type: 'enum',
        enumValues: ['INTERNAL', 'EXTERNAL', 'SURVEILLANCE', 'CERTIFICATION'],
      },
      { name: 'standard', label: 'Standard', required: true, type: 'string' },
      { name: 'scheduledDate', label: 'Scheduled Date', required: true, type: 'date' },
      { name: 'leadAuditor', label: 'Lead Auditor', required: true, type: 'string' },
      { name: 'scope', label: 'Scope', required: false, type: 'string' },
    ],
  },
  {
    recordType: 'actions',
    label: 'Action Items',
    fields: [
      { name: 'title', label: 'Title', required: true, type: 'string' },
      { name: 'description', label: 'Description', required: false, type: 'string' },
      {
        name: 'priority',
        label: 'Priority',
        required: true,
        type: 'enum',
        enumValues: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      },
      { name: 'assignedTo', label: 'Assigned To', required: true, type: 'string' },
      { name: 'dueDate', label: 'Due Date', required: true, type: 'date' },
      {
        name: 'status',
        label: 'Status',
        required: true,
        type: 'enum',
        enumValues: ['OPEN', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE', 'CANCELLED'],
      },
    ],
  },
];

// ─── In-Memory Store ────────────────────────────────────────────────────────

const importedRecords: ImportedRecord[] = [];
let importCounter = 0;

// ─── Helpers ────────────────────────────────────────────────────────────────

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

function validateField(
  value: string,
  field: FieldDef,
  rowIndex: number
): { value: string | number | null; error?: string } {
  const trimmed = value.trim();

  if (!trimmed && field.required) {
    return { value: null, error: `Row ${rowIndex}: "${field.label}" is required` };
  }

  if (!trimmed) {
    return { value: null };
  }

  switch (field.type) {
    case 'number': {
      const num = Number(trimmed);
      if (isNaN(num)) {
        return {
          value: null,
          error: `Row ${rowIndex}: "${field.label}" must be a number, got "${trimmed}"`,
        };
      }
      return { value: num };
    }
    case 'date': {
      const date = new Date(trimmed);
      if (isNaN(date.getTime())) {
        return {
          value: null,
          error: `Row ${rowIndex}: "${field.label}" must be a valid date, got "${trimmed}"`,
        };
      }
      return { value: trimmed };
    }
    case 'email': {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmed)) {
        return {
          value: null,
          error: `Row ${rowIndex}: "${field.label}" must be a valid email, got "${trimmed}"`,
        };
      }
      return { value: trimmed };
    }
    case 'enum': {
      if (field.enumValues && !field.enumValues.includes(trimmed.toUpperCase())) {
        return {
          value: null,
          error: `Row ${rowIndex}: "${field.label}" must be one of [${field.enumValues!.join(', ')}], got "${trimmed}"`,
        };
      }
      return { value: trimmed.toUpperCase() };
    }
    default:
      return { value: trimmed };
  }
}

// ─── Public API ─────────────────────────────────────────────────────────────

export function getImportSchema(recordType: string): ImportSchema | undefined {
  return IMPORT_SCHEMAS.find((s) => s.recordType === recordType);
}

export function getTemplateHeaders(recordType: string): string | null {
  const schema = getImportSchema(recordType);
  if (!schema) return null;
  return schema.fields.map((f) => f.name).join(',');
}

export function parseCSV(csvString: string, recordType: string): ParseResult {
  const schema = getImportSchema(recordType);
  if (!schema) {
    return { valid: [], errors: [`Unknown record type: "${recordType}"`], totalRows: 0 };
  }

  const lines = csvString.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) {
    return { valid: [], errors: ['CSV file is empty'], totalRows: 0 };
  }

  // Parse header row
  const headers = parseCsvLine(lines[0]).map((h) => h.trim());
  const expectedHeaders = schema.fields.map((f) => f.name);

  // Validate headers
  const missingHeaders = expectedHeaders.filter((h) => {
    const field = schema.fields.find((f) => f.name === h);
    return field?.required && !headers.includes(h);
  });

  const errors: string[] = [];
  if (missingHeaders.length > 0) {
    errors.push(`Missing required headers: ${missingHeaders.join(', ')}`);
  }

  // Map header indices
  const headerMap: Record<string, number> = {};
  headers.forEach((h, i) => {
    headerMap[h] = i;
  });

  const valid: ParsedRow[] = [];
  const totalRows = lines.length - 1;

  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]);
    const row: ParsedRow = {};
    let rowValid = true;

    for (const field of schema.fields) {
      const colIndex = headerMap[field.name];
      const rawValue = colIndex !== undefined ? values[colIndex] || '' : '';

      const result = validateField(rawValue, field, i);
      if (result.error) {
        errors.push(result.error);
        rowValid = false;
      }
      row[field.name] = result.value;
    }

    if (rowValid) {
      valid.push(row);
    }
  }

  return { valid, errors, totalRows };
}

export function importRecords(rows: ParsedRow[], recordType: string, orgId: string): ImportResult {
  const now = new Date().toISOString();

  for (const row of rows) {
    importCounter++;
    importedRecords.push({
      id: `imp-${importCounter.toString().padStart(6, '0')}`,
      recordType,
      orgId,
      data: row,
      importedAt: now,
    });
  }

  return {
    imported: rows.length,
    recordType,
    orgId,
    importedAt: now,
  };
}

export function getImportedRecords(orgId: string, recordType?: string): ImportedRecord[] {
  return importedRecords.filter(
    (r) => r.orgId === orgId && (!recordType || r.recordType === recordType)
  );
}
