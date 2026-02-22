'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import {
  FileText,
  Plus,
  X,
  Download,
  Loader2,
  CheckCircle,
  AlertCircle,
  FileSpreadsheet,
  File,
} from 'lucide-react';
import { api } from '@/lib/api';

type TemplateFormat = 'DOCX' | 'PDF' | 'XLSX';
type TemplateStatus = 'GENERATING' | 'READY' | 'ERROR';

interface GeneratedTemplate {
  id: string;
  templateType: string;
  format: TemplateFormat;
  status: TemplateStatus;
  downloadUrl?: string;
  createdAt: string;
}

const TEMPLATE_TYPES = [
  { id: 'QUALITY_MANUAL', label: 'Quality Manual' },
  { id: 'QUALITY_POLICY', label: 'Quality Policy' },
  { id: 'PROCESS_MAP', label: 'Process Map' },
  { id: 'PROCEDURE', label: 'Procedure Document' },
  { id: 'WORK_INSTRUCTION', label: 'Work Instruction' },
  { id: 'RISK_REGISTER', label: 'Risk Register' },
  { id: 'OBJECTIVES_PLAN', label: 'Objectives Plan' },
  { id: 'MANAGEMENT_REVIEW_AGENDA', label: 'Management Review Agenda' },
  { id: 'AUDIT_CHECKLIST', label: 'Audit Checklist' },
  { id: 'CAPA_FORM', label: 'CAPA Form' },
];

const MOCK_TEMPLATES: GeneratedTemplate[] = [
  {
    id: '1',
    templateType: 'QUALITY_MANUAL',
    format: 'DOCX',
    status: 'READY',
    downloadUrl: '#',
    createdAt: '2026-02-20T00:00:00Z',
  },
  {
    id: '2',
    templateType: 'AUDIT_CHECKLIST',
    format: 'XLSX',
    status: 'READY',
    downloadUrl: '#',
    createdAt: '2026-02-21T00:00:00Z',
  },
  {
    id: '3',
    templateType: 'CAPA_FORM',
    format: 'PDF',
    status: 'GENERATING',
    createdAt: '2026-02-22T00:00:00Z',
  },
  {
    id: '4',
    templateType: 'RISK_REGISTER',
    format: 'XLSX',
    status: 'READY',
    downloadUrl: '#',
    createdAt: '2026-02-19T00:00:00Z',
  },
];

function formatLabel(type: string) {
  return TEMPLATE_TYPES.find((t) => t.id === type)?.label ?? type.replace(/_/g, ' ');
}

function FormatIcon({ format }: { format: TemplateFormat }) {
  if (format === 'XLSX') return <FileSpreadsheet className="h-5 w-5 text-green-600" />;
  if (format === 'PDF') return <File className="h-5 w-5 text-red-500" />;
  return <FileText className="h-5 w-5 text-blue-500" />;
}

function StatusBadge({ status }: { status: TemplateStatus }) {
  if (status === 'READY') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
        <CheckCircle className="h-3 w-3" /> Ready
      </span>
    );
  }
  if (status === 'GENERATING') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
        <Loader2 className="h-3 w-3 animate-spin" /> Generating
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
      <AlertCircle className="h-3 w-3" /> Error
    </span>
  );
}

export default function TemplateGeneratorClient() {
  const [templates, setTemplates] = useState<GeneratedTemplate[]>(MOCK_TEMPLATES);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    templateType: 'QUALITY_MANUAL',
    format: 'DOCX' as TemplateFormat,
    includeGuidance: true,
  });

  useEffect(() => {
    const fetchTemplates = async () => {
      setLoading(true);
      try {
        const r = await api.get('/template-generator');
        setTemplates(r.data.data);
      } catch {
        // Fall back to mock data
      } finally {
        setLoading(false);
      }
    };
    fetchTemplates();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const r = await api.post('/template-generator', form);
      setTemplates((prev) => [r.data.data, ...prev]);
      setModalOpen(false);
      setForm({ templateType: 'QUALITY_MANUAL', format: 'DOCX', includeGuidance: true });
    } catch {
      setError('Failed to generate template. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const readyCount = templates.filter((t) => t.status === 'READY').length;
  const generatingCount = templates.filter((t) => t.status === 'GENERATING').length;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="h-7 w-7 text-green-600" />
            Document Template Generator
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Generate ISO 9001:2015 compliant document templates in multiple formats
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Generate Template
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Generated</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{templates.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Ready</p>
            <p className="mt-1 text-2xl font-bold text-green-600">{readyCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Generating</p>
            <p className="mt-1 text-2xl font-bold text-yellow-600">{generatingCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Template Catalog */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Available Template Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
            {TEMPLATE_TYPES.map((t) => (
              <div
                key={t.id}
                className="rounded-md border border-gray-100 bg-gray-50 px-3 py-2 text-center"
              >
                <FileText className="h-5 w-5 text-green-500 mx-auto mb-1" />
                <p className="text-xs font-medium text-gray-700 leading-tight">{t.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Generated Templates List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Generated Templates</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-10 text-gray-400">
              <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading templates...
            </div>
          ) : templates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-gray-400">
              <FileText className="h-10 w-10 mb-2" />
              <p>No templates generated yet.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {templates.map((t) => (
                <div
                  key={t.id}
                  className="rounded-lg border border-gray-200 p-4 flex flex-col gap-3 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <FormatIcon format={t.format} />
                    <StatusBadge status={t.status} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{formatLabel(t.templateType)}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Format: {t.format}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(t.createdAt).toLocaleDateString('en-GB')}
                    </p>
                  </div>
                  {t.status === 'READY' && t.downloadUrl ? (
                    <a
                      href={t.downloadUrl}
                      className="inline-flex items-center justify-center gap-1.5 rounded-md border border-green-600 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-50 transition-colors"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Download
                    </a>
                  ) : t.status === 'GENERATING' ? (
                    <div className="flex items-center gap-1.5 text-xs text-yellow-600">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Processing...
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="relative w-full max-w-md rounded-lg bg-white shadow-xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-gray-900">Generate Template</h2>
              <button
                onClick={() => { setModalOpen(false); setError(null); }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {error && (
              <div className="mb-4 rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Template Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.templateType}
                  onChange={(e) => setForm((f) => ({ ...f, templateType: e.target.value }))}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {TEMPLATE_TYPES.map((t) => (
                    <option key={t.id} value={t.id}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Format <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-4">
                  {(['DOCX', 'PDF', 'XLSX'] as TemplateFormat[]).map((fmt) => (
                    <label key={fmt} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="format"
                        value={fmt}
                        checked={form.format === fmt}
                        onChange={() => setForm((f) => ({ ...f, format: fmt }))}
                        className="accent-green-600"
                      />
                      <span className="text-sm text-gray-700">{fmt}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.includeGuidance}
                    onChange={(e) => setForm((f) => ({ ...f, includeGuidance: e.target.checked }))}
                    className="accent-green-600 h-4 w-4"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Include implementation guidance notes
                  </span>
                </label>
                <p className="text-xs text-gray-400 mt-1 ml-6">
                  Adds clause-by-clause guidance aligned to ISO 9001:2015 requirements.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setModalOpen(false); setError(null); }}
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Generating...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4" /> Generate
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
