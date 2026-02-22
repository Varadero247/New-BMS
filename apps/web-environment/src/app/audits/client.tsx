'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import {
  ClipboardList,
  Plus,
  X,
  CheckCircle,
  Clock,
  Calendar,
  AlertTriangle,
  User,
  Search,
} from 'lucide-react';
import { api } from '@/lib/api';

type AuditType = 'INTERNAL' | 'EXTERNAL' | 'REGULATORY' | 'SURVEILLANCE';
type AuditStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE' | 'CANCELLED';

interface Audit {
  id: string;
  refNumber: string;
  title: string;
  type: AuditType;
  status: AuditStatus;
  scope: string;
  lead: string;
  scheduledDate: string;
  completedDate?: string;
  findings: number;
  nonconformances: number;
  createdAt?: string;
}

const MOCK_AUDITS: Audit[] = [
  {
    id: '1',
    refNumber: 'ENV-AUD-2601-0001',
    title: 'Annual Environmental Management Audit',
    type: 'INTERNAL',
    status: 'COMPLETED',
    scope: 'ISO 14001:2015 full scope',
    lead: 'Internal Audit Team',
    scheduledDate: '2026-01-20T00:00:00Z',
    completedDate: '2026-01-22T00:00:00Z',
    findings: 5,
    nonconformances: 1,
  },
  {
    id: '2',
    refNumber: 'ENV-AUD-2602-0001',
    title: 'Q1 Compliance Verification',
    type: 'INTERNAL',
    status: 'SCHEDULED',
    scope: 'Legal compliance & aspects register',
    lead: 'Environment Manager',
    scheduledDate: '2026-03-10T00:00:00Z',
    findings: 0,
    nonconformances: 0,
  },
  {
    id: '3',
    refNumber: 'ENV-AUD-2601-0002',
    title: 'ISO 14001 Surveillance Audit',
    type: 'SURVEILLANCE',
    status: 'COMPLETED',
    scope: 'Full ISO 14001 scope',
    lead: 'BSI Certifications',
    scheduledDate: '2026-01-15T00:00:00Z',
    completedDate: '2026-01-16T00:00:00Z',
    findings: 2,
    nonconformances: 0,
  },
  {
    id: '4',
    refNumber: 'ENV-AUD-2602-0002',
    title: 'Regulatory Inspection — EA',
    type: 'REGULATORY',
    status: 'SCHEDULED',
    scope: 'Environmental permit compliance',
    lead: 'Environment Agency',
    scheduledDate: '2026-04-05T00:00:00Z',
    findings: 0,
    nonconformances: 0,
  },
];

const TYPE_LABELS: Record<AuditType, string> = {
  INTERNAL: 'Internal',
  EXTERNAL: 'External',
  REGULATORY: 'Regulatory',
  SURVEILLANCE: 'Surveillance',
};

function StatusBadge({ status }: { status: AuditStatus }) {
  const config: Record<AuditStatus, { label: string; classes: string; icon: React.ReactNode }> = {
    SCHEDULED: { label: 'Scheduled', classes: 'bg-blue-100 text-blue-800', icon: <Calendar className="h-3 w-3" /> },
    IN_PROGRESS: { label: 'In Progress', classes: 'bg-yellow-100 text-yellow-800', icon: <Clock className="h-3 w-3" /> },
    COMPLETED: { label: 'Completed', classes: 'bg-green-100 text-green-800', icon: <CheckCircle className="h-3 w-3" /> },
    OVERDUE: { label: 'Overdue', classes: 'bg-red-100 text-red-800', icon: <AlertTriangle className="h-3 w-3" /> },
    CANCELLED: { label: 'Cancelled', classes: 'bg-gray-100 text-gray-600', icon: <X className="h-3 w-3" /> },
  };
  const { label, classes, icon } = config[status];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${classes}`}>
      {icon} {label}
    </span>
  );
}

function TypeBadge({ type }: { type: AuditType }) {
  const colors: Record<AuditType, string> = {
    INTERNAL: 'bg-purple-100 text-purple-800',
    EXTERNAL: 'bg-orange-100 text-orange-800',
    REGULATORY: 'bg-red-100 text-red-800',
    SURVEILLANCE: 'bg-teal-100 text-teal-800',
  };
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${colors[type]}`}>
      {TYPE_LABELS[type]}
    </span>
  );
}

export default function AuditsClient() {
  const [audits, setAudits] = useState<Audit[]>(MOCK_AUDITS);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const [form, setForm] = useState({
    title: '',
    type: 'INTERNAL' as AuditType,
    scope: '',
    lead: '',
    scheduledDate: '',
  });

  useEffect(() => {
    const fetchAudits = async () => {
      setLoading(true);
      try {
        const r = await api.get('/audits');
        setAudits(r.data.data);
      } catch {
        // Fall back to mock data
      } finally {
        setLoading(false);
      }
    };
    fetchAudits();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.scope.trim() || !form.lead.trim() || !form.scheduledDate) {
      setError('All fields are required.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const r = await api.post('/audits', form);
      setAudits((prev) => [r.data.data, ...prev]);
      setModalOpen(false);
      setForm({ title: '', type: 'INTERNAL', scope: '', lead: '', scheduledDate: '' });
    } catch {
      setError('Failed to create audit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = audits.filter(
    (a) =>
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.refNumber.toLowerCase().includes(search.toLowerCase()) ||
      a.lead.toLowerCase().includes(search.toLowerCase()),
  );

  const scheduled = audits.filter((a) => a.status === 'SCHEDULED').length;
  const completed = audits.filter((a) => a.status === 'COMPLETED').length;
  const inProgress = audits.filter((a) => a.status === 'IN_PROGRESS').length;
  const overdue = audits.filter((a) => a.status === 'OVERDUE').length;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ClipboardList className="h-7 w-7 text-green-600" />
            Environmental Audits
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            ISO 14001:2015 Cl. 9.2 — Internal & external environmental audits
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Audit
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="pt-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Scheduled</p>
            <p className="mt-1 text-2xl font-bold text-blue-600">{scheduled}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="pt-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Completed</p>
            <p className="mt-1 text-2xl font-bold text-green-600">{completed}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="pt-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">In Progress</p>
            <p className="mt-1 text-2xl font-bold text-yellow-600">{inProgress}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="pt-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Overdue</p>
            <p className="mt-1 text-2xl font-bold text-red-600">{overdue}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search audits..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-md border border-gray-300 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Audit Register</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-gray-400">Loading audits...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Ref</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Title</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Lead</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Scheduled</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Completed</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wide">Findings</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wide">NCs</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-10 text-center text-sm text-gray-400">
                        No audits found.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((a) => (
                      <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-xs font-mono text-gray-600 whitespace-nowrap">{a.refNumber}</td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{a.title}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{a.scope}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap"><TypeBadge type={a.type} /></td>
                        <td className="px-4 py-3 whitespace-nowrap"><StatusBadge status={a.status} /></td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5 text-sm text-gray-700">
                            <User className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                            <span className="whitespace-nowrap">{a.lead}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                          {new Date(a.scheduledDate).toLocaleDateString('en-GB')}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                          {a.completedDate ? new Date(a.completedDate).toLocaleDateString('en-GB') : '—'}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`text-sm font-semibold ${a.findings > 0 ? 'text-orange-600' : 'text-gray-400'}`}>
                            {a.findings}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`text-sm font-semibold ${a.nonconformances > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                            {a.nonconformances}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="relative w-full max-w-lg rounded-lg bg-white shadow-xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-gray-900">Add Audit</h2>
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
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Annual Environmental Management Audit"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as AuditType }))}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="INTERNAL">Internal</option>
                    <option value="EXTERNAL">External</option>
                    <option value="REGULATORY">Regulatory</option>
                    <option value="SURVEILLANCE">Surveillance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Scheduled Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={form.scheduledDate}
                    onChange={(e) => setForm((f) => ({ ...f, scheduledDate: e.target.value }))}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Scope <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.scope}
                  onChange={(e) => setForm((f) => ({ ...f, scope: e.target.value }))}
                  placeholder="e.g. ISO 14001:2015 full scope"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lead Auditor / Body <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.lead}
                  onChange={(e) => setForm((f) => ({ ...f, lead: e.target.value }))}
                  placeholder="e.g. Environment Manager"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
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
                  className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Add Audit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
