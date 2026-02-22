'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import { ShieldCheck, Download, FileText } from 'lucide-react';
import { api } from '@/lib/api';

interface QualityReport {
  id: string;
  title: string;
  reportType: 'AUDIT' | 'INSPECTION' | 'CERTIFICATE' | 'TEST_REPORT';
  standard: string;
  status: 'CURRENT' | 'EXPIRED' | 'PENDING';
  issueDate: string;
  expiryDate?: string;
  documentUrl?: string;
  summary: string;
}

const MOCK_REPORTS: QualityReport[] = [
  {
    id: '1',
    title: 'ISO 9001:2015 Certificate of Registration',
    reportType: 'CERTIFICATE',
    standard: 'ISO 9001:2015',
    status: 'CURRENT',
    issueDate: '2025-03-01T00:00:00Z',
    expiryDate: '2028-02-28T23:59:59Z',
    documentUrl: '#',
    summary:
      'Full scope quality management system certification covering design, manufacture, and supply of precision-engineered components.',
  },
  {
    id: '2',
    title: 'Q4 2025 Supplier Audit Report',
    reportType: 'AUDIT',
    standard: 'AS9100 Rev D',
    status: 'CURRENT',
    issueDate: '2026-01-15T00:00:00Z',
    documentUrl: '#',
    summary:
      'Annual surveillance audit conducted by Bureau Veritas. Zero major non-conformances identified. Three observations raised relating to document control.',
  },
  {
    id: '3',
    title: 'Incoming Inspection Report — Batch 2026-02-A',
    reportType: 'INSPECTION',
    standard: 'Customer Drawing Rev C',
    status: 'CURRENT',
    issueDate: '2026-02-12T00:00:00Z',
    documentUrl: '#',
    summary:
      'Dimensional inspection of 250-piece batch against customer-supplied drawing revision C. Acceptance rate: 99.6%. Two pieces rejected and replaced.',
  },
  {
    id: '4',
    title: 'Material Test Report — Steel Grade S275JR',
    reportType: 'TEST_REPORT',
    standard: 'EN 10025-2',
    status: 'CURRENT',
    issueDate: '2026-02-01T00:00:00Z',
    documentUrl: '#',
    summary:
      'Mill test certificate for structural steel plate. Tensile strength, yield strength, Charpy impact values, and chemical composition confirmed in specification.',
  },
  {
    id: '5',
    title: 'OHSAS 18001 Certificate',
    reportType: 'CERTIFICATE',
    standard: 'OHSAS 18001:2007',
    status: 'EXPIRED',
    issueDate: '2021-06-01T00:00:00Z',
    expiryDate: '2024-05-31T23:59:59Z',
    summary:
      'Legacy OHSAS 18001 certificate. Superseded by ISO 45001:2018 transition completed in June 2024. Retained for historical reference.',
  },
];

const TYPE_STYLES: Record<string, string> = {
  AUDIT: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  INSPECTION: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  CERTIFICATE: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  TEST_REPORT: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
};

const STATUS_STYLES: Record<string, string> = {
  CURRENT: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  EXPIRED: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  PENDING: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
};

const REPORT_TYPE_LABELS: Record<string, string> = {
  AUDIT: 'Audit',
  INSPECTION: 'Inspection',
  CERTIFICATE: 'Certificate',
  TEST_REPORT: 'Test Report',
};

const ALL_TYPES = ['ALL', 'AUDIT', 'INSPECTION', 'CERTIFICATE', 'TEST_REPORT'] as const;
const ALL_STATUSES = ['ALL', 'CURRENT', 'EXPIRED', 'PENDING'] as const;

export default function QualityReportsPage() {
  const [reports, setReports] = useState<QualityReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const res = await api.get('/portal/quality-reports');
      setReports(res.data.data || []);
    } catch {
      setReports(MOCK_REPORTS);
    } finally {
      setLoading(false);
    }
  }

  const filtered = reports
    .filter((r) => typeFilter === 'ALL' || r.reportType === typeFilter)
    .filter((r) => statusFilter === 'ALL' || r.status === statusFilter);

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Quality Reports</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Certificates, audits, inspections, and test reports shared with your account
            </p>
          </div>
          <ShieldCheck className="h-7 w-7 text-teal-500 mt-1 flex-shrink-0" />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div>
            <p className="text-xs font-medium text-gray-400 dark:text-gray-500 mb-1.5">Type</p>
            <div className="flex gap-1 flex-wrap">
              {ALL_TYPES.map((t) => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    typeFilter === t
                      ? 'bg-teal-600 text-white'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {t === 'ALL' ? 'All' : REPORT_TYPE_LABELS[t]}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-400 dark:text-gray-500 mb-1.5">Status</p>
            <div className="flex gap-1 flex-wrap">
              {ALL_STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    statusFilter === s
                      ? 'bg-teal-600 text-white'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Cards */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((r) => (
              <Card key={r.id} className="border border-gray-200 dark:border-gray-700 flex flex-col">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-3">
                    <CardTitle className="text-sm font-semibold text-gray-900 dark:text-white leading-snug">
                      {r.title}
                    </CardTitle>
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${STATUS_STYLES[r.status]}`}
                    >
                      {r.status.charAt(0) + r.status.slice(1).toLowerCase()}
                    </span>
                  </div>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${TYPE_STYLES[r.reportType]}`}>
                      {REPORT_TYPE_LABELS[r.reportType]}
                    </span>
                    <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                      {r.standard}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between">
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                    {r.summary}
                  </p>
                  <div className="flex items-end justify-between">
                    <div className="text-xs text-gray-400 dark:text-gray-500 space-y-0.5">
                      <p>
                        Issued:{' '}
                        <span className="text-gray-600 dark:text-gray-300">
                          {new Date(r.issueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </p>
                      {r.expiryDate && (
                        <p>
                          Expires:{' '}
                          <span
                            className={
                              r.status === 'EXPIRED'
                                ? 'text-red-500 dark:text-red-400 font-medium'
                                : 'text-gray-600 dark:text-gray-300'
                            }
                          >
                            {new Date(r.expiryDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </p>
                      )}
                    </div>
                    {r.documentUrl ? (
                      <a
                        href={r.documentUrl}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium rounded-lg transition-colors"
                        onClick={(e) => e.preventDefault()}
                      >
                        <Download className="h-3.5 w-3.5" />
                        Download
                      </a>
                    ) : (
                      <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                        <FileText className="h-3.5 w-3.5" />
                        No file
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-500 dark:text-gray-400">
            <ShieldCheck className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p className="font-medium">No reports found</p>
            <p className="text-sm mt-1">Try adjusting your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
