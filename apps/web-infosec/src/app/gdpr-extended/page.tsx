'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import {
  ShieldCheck,
  Plus,
  AlertCircle,
  X,
  FileSearch,
  ClipboardList,
  CheckCircle2,
  Clock,
  XCircle,
} from 'lucide-react';
import { api } from '@/lib/api';

type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
type DpiaStatus = 'DRAFT' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';

interface Dpia {
  id: string;
  processName: string;
  processingPurpose: string;
  dataCategories: string[];
  legalBasis: string;
  riskLevel: RiskLevel;
  status: DpiaStatus;
  dpoReviewDate?: string;
  outcome?: string;
  createdAt?: string;
}

const MOCK_DPIAS: Dpia[] = [
  {
    id: '1',
    processName: 'Employee Monitoring System',
    processingPurpose: 'Productivity and security monitoring',
    dataCategories: ['Location', 'Browsing History', 'Communications'],
    legalBasis: 'Legitimate Interest',
    riskLevel: 'HIGH',
    status: 'APPROVED',
    dpoReviewDate: '2026-01-15T00:00:00Z',
    outcome: 'Approved with additional safeguards',
  },
  {
    id: '2',
    processName: 'Customer Biometric Authentication',
    processingPurpose: 'Secure login for enterprise customers',
    dataCategories: ['Biometric Data', 'Identity'],
    legalBasis: 'Consent',
    riskLevel: 'VERY_HIGH',
    status: 'UNDER_REVIEW',
  },
  {
    id: '3',
    processName: 'Marketing Analytics Profiling',
    processingPurpose: 'Personalised marketing campaigns',
    dataCategories: ['Behavioural', 'Preferences'],
    legalBasis: 'Legitimate Interest',
    riskLevel: 'MEDIUM',
    status: 'APPROVED',
  },
  {
    id: '4',
    processName: 'AI-Powered Risk Scoring',
    processingPurpose: 'Automated decision making for risk assessment',
    dataCategories: ['Financial', 'Behavioural'],
    legalBasis: 'Contract',
    riskLevel: 'VERY_HIGH',
    status: 'DRAFT',
  },
];

const RISK_CONFIG: Record<RiskLevel, { label: string; color: string }> = {
  LOW: { label: 'Low', color: 'bg-green-100 text-green-700 border-green-200' },
  MEDIUM: { label: 'Medium', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  HIGH: { label: 'High', color: 'bg-orange-100 text-orange-800 border-orange-200' },
  VERY_HIGH: { label: 'Very High', color: 'bg-red-100 text-red-700 border-red-200' },
};

const STATUS_CONFIG: Record<DpiaStatus, { label: string; color: string; icon: React.ReactNode }> = {
  DRAFT: { label: 'Draft', color: 'bg-gray-100 text-gray-600', icon: <Clock className="h-3 w-3" /> },
  UNDER_REVIEW: { label: 'Under Review', color: 'bg-blue-100 text-blue-700', icon: <FileSearch className="h-3 w-3" /> },
  APPROVED: { label: 'Approved', color: 'bg-green-100 text-green-700', icon: <CheckCircle2 className="h-3 w-3" /> },
  REJECTED: { label: 'Rejected', color: 'bg-red-100 text-red-700', icon: <XCircle className="h-3 w-3" /> },
};

const LEGAL_BASES = ['Consent', 'Contract', 'Legal Obligation', 'Vital Interest', 'Public Task', 'Legitimate Interest'];
const RISK_LEVELS: RiskLevel[] = ['LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH'];

export default function GdprExtendedPage() {
  const [dpias, setDpias] = useState<Dpia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    processName: '',
    processingPurpose: '',
    dataCategories: '',
    legalBasis: 'Consent',
    riskLevel: 'MEDIUM' as RiskLevel,
  });

  useEffect(() => {
    fetchDpias();
  }, []);

  async function fetchDpias() {
    try {
      setLoading(true);
      const r = await api.get('/gdpr-extended');
      setDpias(r.data.data);
    } catch {
      setDpias(MOCK_DPIAS);
      setError('Using mock data — API unavailable');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const payload = {
      ...form,
      dataCategories: form.dataCategories.split(',').map(s => s.trim()).filter(Boolean),
      status: 'DRAFT' as DpiaStatus,
    };
    try {
      await api.post('/gdpr-extended', payload);
    } catch {
      setDpias(prev => [...prev, { id: String(Date.now()), ...payload, createdAt: new Date().toISOString() }]);
    } finally {
      setSubmitting(false);
      setShowModal(false);
      setForm({ processName: '', processingPurpose: '', dataCategories: '', legalBasis: 'Consent', riskLevel: 'MEDIUM' });
      fetchDpias();
    }
  }

  const counts = {
    total: dpias.length,
    approved: dpias.filter(d => d.status === 'APPROVED').length,
    underReview: dpias.filter(d => d.status === 'UNDER_REVIEW').length,
    veryHigh: dpias.filter(d => d.riskLevel === 'VERY_HIGH').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-lg">
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">GDPR Extended — DPIA Register</h1>
              <p className="text-sm text-gray-500">Data Protection Impact Assessments under Article 35 GDPR</p>
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            <Plus className="h-4 w-4" />
            New DPIA
          </button>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="flex items-center gap-2 px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-indigo-100">
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-indigo-700">{counts.total}</div>
              <div className="text-sm text-gray-500">Total DPIAs</div>
            </CardContent>
          </Card>
          <Card className="border-green-100">
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-green-700">{counts.approved}</div>
              <div className="text-sm text-gray-500">Approved</div>
            </CardContent>
          </Card>
          <Card className="border-blue-100">
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-blue-700">{counts.underReview}</div>
              <div className="text-sm text-gray-500">Under Review</div>
            </CardContent>
          </Card>
          <Card className="border-red-100">
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-red-700">{counts.veryHigh}</div>
              <div className="text-sm text-gray-500">Very High Risk</div>
            </CardContent>
          </Card>
        </div>

        {/* DPIA Table */}
        <Card className="border-indigo-100">
          <CardHeader>
            <CardTitle className="text-indigo-800 flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              DPIA Register ({dpias.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin h-8 w-8 border-2 border-indigo-600 border-t-transparent rounded-full" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">Process Name</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">Purpose</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">Data Categories</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">Legal Basis</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-600">Risk</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-600">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">Outcome</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dpias.map((dpia, i) => (
                      <tr key={dpia.id} className={`border-b border-gray-50 hover:bg-indigo-50/30 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}>
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-900">{dpia.processName}</div>
                          {dpia.dpoReviewDate && (
                            <div className="text-xs text-gray-400 mt-1">
                              DPO review: {new Date(dpia.dpoReviewDate).toLocaleDateString()}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4 text-gray-600 text-xs max-w-xs">{dpia.processingPurpose}</td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1">
                            {dpia.dataCategories.map(cat => (
                              <span key={cat} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs rounded border border-indigo-100">
                                {cat}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-xs text-gray-600">{dpia.legalBasis}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${RISK_CONFIG[dpia.riskLevel].color}`}>
                            {RISK_CONFIG[dpia.riskLevel].label}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${STATUS_CONFIG[dpia.status].color}`}>
                            {STATUS_CONFIG[dpia.status].icon}
                            {STATUS_CONFIG[dpia.status].label}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-xs text-gray-500">{dpia.outcome ?? '—'}</td>
                      </tr>
                    ))}
                    {dpias.length === 0 && (
                      <tr>
                        <td colSpan={7} className="text-center py-12 text-gray-400">
                          No DPIAs recorded yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add DPIA Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">New Data Protection Impact Assessment</h2>
              <button onClick={() => setShowModal(false)} className="p-1 rounded hover:bg-gray-100">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Process Name</label>
                <input
                  required
                  value={form.processName}
                  onChange={e => setForm(p => ({ ...p, processName: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. Employee Monitoring System"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Processing Purpose</label>
                <textarea
                  required
                  value={form.processingPurpose}
                  onChange={e => setForm(p => ({ ...p, processingPurpose: e.target.value }))}
                  rows={2}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  placeholder="Describe the purpose of processing..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data Categories</label>
                <input
                  required
                  value={form.dataCategories}
                  onChange={e => setForm(p => ({ ...p, dataCategories: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Location, Biometric Data, Identity (comma-separated)"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Legal Basis</label>
                  <select
                    value={form.legalBasis}
                    onChange={e => setForm(p => ({ ...p, legalBasis: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {LEGAL_BASES.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Risk Level</label>
                  <select
                    value={form.riskLevel}
                    onChange={e => setForm(p => ({ ...p, riskLevel: e.target.value as RiskLevel }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {RISK_LEVELS.map(r => (
                      <option key={r} value={r}>{RISK_CONFIG[r].label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create DPIA'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
