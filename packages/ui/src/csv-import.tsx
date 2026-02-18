'use client';

import { useState, useCallback, useRef } from 'react';
import { cn } from './utils';

// ─── Types ──────────────────────────────────────────────────────────────────

interface RecordType {
  recordType: string;
  label: string;
  fieldCount: number;
  requiredFields: string[];
}

interface ValidationResult {
  valid: Record<string, unknown>[];
  errors: string[];
  totalRows: number;
  validCount: number;
  errorCount: number;
}

export interface BulkImportWizardProps {
  onComplete?: (result: { imported: number; recordType: string }) => void;
  apiBaseUrl?: string;
  recordTypes?: RecordType[];
}

// ─── Default Record Types ───────────────────────────────────────────────────

const DEFAULT_RECORD_TYPES: RecordType[] = [
  {
    recordType: 'risks',
    label: 'Risk Register',
    fieldCount: 8,
    requiredFields: ['title', 'category', 'likelihood', 'consequence', 'status'],
  },
  {
    recordType: 'incidents',
    label: 'Incidents',
    fieldCount: 7,
    requiredFields: ['title', 'description', 'dateOccurred', 'severity', 'status'],
  },
  {
    recordType: 'aspects',
    label: 'Environmental Aspects',
    fieldCount: 6,
    requiredFields: ['name', 'activity', 'impact', 'severity', 'probability'],
  },
  {
    recordType: 'ncrs',
    label: 'Non-Conformance Reports',
    fieldCount: 6,
    requiredFields: ['title', 'description', 'source', 'severity', 'dateIdentified'],
  },
  {
    recordType: 'capas',
    label: 'CAPAs',
    fieldCount: 7,
    requiredFields: ['title', 'description', 'type', 'priority', 'dueDate'],
  },
  {
    recordType: 'assets',
    label: 'Assets',
    fieldCount: 7,
    requiredFields: ['name', 'assetTag', 'category', 'location', 'status'],
  },
  {
    recordType: 'employees',
    label: 'Employees',
    fieldCount: 7,
    requiredFields: ['firstName', 'lastName', 'email', 'department', 'jobTitle', 'startDate'],
  },
  {
    recordType: 'contacts',
    label: 'CRM Contacts',
    fieldCount: 6,
    requiredFields: ['firstName', 'lastName', 'email', 'type'],
  },
  {
    recordType: 'audits',
    label: 'Audits',
    fieldCount: 6,
    requiredFields: ['title', 'type', 'standard', 'scheduledDate', 'leadAuditor'],
  },
  {
    recordType: 'actions',
    label: 'Action Items',
    fieldCount: 6,
    requiredFields: ['title', 'priority', 'assignedTo', 'dueDate', 'status'],
  },
];

// ─── Component ──────────────────────────────────────────────────────────────

export function BulkImportWizard({
  onComplete,
  apiBaseUrl = 'http://localhost:4000',
  recordTypes = DEFAULT_RECORD_TYPES,
}: BulkImportWizardProps) {
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState('');
  const [csvData, setCsvData] = useState('');
  const [fileName, setFileName] = useState('');
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [importResult, setImportResult] = useState<{ imported: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedLabel = recordTypes.find((r) => r.recordType === selectedType)?.label || '';

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      setCsvData(evt.target?.result as string);
    };
    reader.readAsText(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      setCsvData(evt.target?.result as string);
    };
    reader.readAsText(file);
  }, []);

  const handleValidate = async () => {
    if (!csvData || !selectedType) return;

    setLoading(true);
    setError('');

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const res = await fetch(`${apiBaseUrl}/api/admin/import/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ csvData, recordType: selectedType }),
      });

      const data = await res.json();
      if (data.success) {
        setValidation(data.data);
        setStep(2);
      } else {
        setError(data.error?.message || 'Validation failed');
      }
    } catch {
      setError('Failed to connect to the server');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!validation || validation.valid.length === 0) return;

    setLoading(true);
    setError('');

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const res = await fetch(`${apiBaseUrl}/api/admin/import/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ rows: validation.valid, recordType: selectedType }),
      });

      const data = await res.json();
      if (data.success) {
        setImportResult(data.data);
        setStep(3);
        onComplete?.({ imported: data.data.imported, recordType: selectedType });
      } else {
        setError(data.error?.message || 'Import failed');
      }
    } catch {
      setError('Failed to connect to the server');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setSelectedType('');
    setCsvData('');
    setFileName('');
    setValidation(null);
    setError('');
    setImportResult(null);
  };

  return (
    <div className="space-y-6">
      {/* Step Indicator */}
      <div className="flex items-center gap-4">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                step >= s
                  ? 'bg-brand-600 text-white'
                  : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
              )}
            >
              {step > s ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                s
              )}
            </div>
            <span
              className={cn(
                'text-sm',
                step >= s
                  ? 'text-gray-900 dark:text-gray-100 font-medium'
                  : 'text-gray-500 dark:text-gray-400'
              )}
            >
              {s === 1 ? 'Select & Upload' : s === 2 ? 'Preview & Validate' : 'Complete'}
            </span>
            {s < 3 && <div className="w-12 h-px bg-gray-300 dark:bg-gray-600" />}
          </div>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Step 1: Select & Upload */}
      {step === 1 && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Record Type
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            >
              <option value="">Select a record type...</option>
              {recordTypes.map((rt) => (
                <option key={rt.recordType} value={rt.recordType}>
                  {rt.label} ({rt.fieldCount} fields)
                </option>
              ))}
            </select>
          </div>

          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
              csvData
                ? 'border-brand-400 bg-brand-50 dark:bg-brand-900/20 dark:border-brand-600'
                : 'border-gray-300 dark:border-gray-600 hover:border-brand-400 hover:bg-gray-50 dark:hover:bg-gray-800'
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
            />
            {csvData ? (
              <div>
                <svg
                  className="w-8 h-8 mx-auto text-brand-500 mb-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{fileName}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Click to replace</p>
              </div>
            ) : (
              <div>
                <svg
                  className="w-8 h-8 mx-auto text-gray-400 mb-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Drop a CSV file here or click to browse
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  Maximum file size: 10MB
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleValidate}
              disabled={!selectedType || !csvData || loading}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                selectedType && csvData && !loading
                  ? 'bg-brand-600 text-white hover:bg-brand-700'
                  : 'bg-gray-200 text-gray-400 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed'
              )}
            >
              {loading ? 'Validating...' : 'Validate & Preview'}
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Preview & Validate */}
      {step === 2 && validation && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Rows</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {validation.totalRows}
              </p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <p className="text-sm text-green-600 dark:text-green-400">Valid</p>
              <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                {validation.validCount}
              </p>
            </div>
            <div
              className={cn(
                'rounded-lg p-4',
                validation.errorCount > 0
                  ? 'bg-red-50 dark:bg-red-900/20'
                  : 'bg-gray-50 dark:bg-gray-800'
              )}
            >
              <p
                className={cn(
                  'text-sm',
                  validation.errorCount > 0
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-gray-500 dark:text-gray-400'
                )}
              >
                Errors
              </p>
              <p
                className={cn(
                  'text-2xl font-bold',
                  validation.errorCount > 0
                    ? 'text-red-700 dark:text-red-300'
                    : 'text-gray-900 dark:text-gray-100'
                )}
              >
                {validation.errorCount}
              </p>
            </div>
          </div>

          {/* Error List */}
          {validation.errors.length > 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 max-h-40 overflow-y-auto">
              <p className="text-sm font-medium text-red-700 dark:text-red-400 mb-2">
                Validation Errors:
              </p>
              <ul className="space-y-1">
                {validation.errors.slice(0, 20).map((err, i) => (
                  <li key={i} className="text-xs text-red-600 dark:text-red-400">
                    {err}
                  </li>
                ))}
                {validation.errors.length > 20 && (
                  <li className="text-xs text-red-500 dark:text-red-400 font-medium">
                    ...and {validation.errors.length - 20} more errors
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* Preview Table */}
          {validation.valid.length > 0 && (
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        #
                      </th>
                      {Object.keys(validation.valid[0]).map((key) => (
                        <th
                          key={key}
                          className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase"
                        >
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {validation.valid.slice(0, 10).map((row, i) => (
                      <tr key={i}>
                        <td className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400">
                          {i + 1}
                        </td>
                        {Object.values(row).map((val, j) => (
                          <td
                            key={j}
                            className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100 whitespace-nowrap"
                          >
                            {val === null ? (
                              <span className="text-gray-400 italic">null</span>
                            ) : (
                              String(val)
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {validation.valid.length > 10 && (
                <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 text-xs text-gray-500 dark:text-gray-400">
                  Showing 10 of {validation.valid.length} valid rows
                </div>
              )}
            </div>
          )}

          <div className="flex justify-between">
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Back
            </button>
            <button
              onClick={handleImport}
              disabled={validation.validCount === 0 || loading}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                validation.validCount > 0 && !loading
                  ? 'bg-brand-600 text-white hover:bg-brand-700'
                  : 'bg-gray-200 text-gray-400 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed'
              )}
            >
              {loading ? 'Importing...' : `Import ${validation.validCount} records`}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Complete */}
      {step === 3 && importResult && (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-green-600 dark:text-green-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Import Complete
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Successfully imported {importResult.imported} {selectedLabel.toLowerCase()} records.
          </p>
          <button
            onClick={handleReset}
            className="mt-6 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700"
          >
            Import More Data
          </button>
        </div>
      )}
    </div>
  );
}
