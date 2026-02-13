'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface Investigation {
  id: string;
  title: string;
  description?: string;
  caseNumber: string;
  reportedBy?: string;
  reportedDate: string;
  category: string;
  severity: string;
  status: string;
  investigator?: string;
  findings?: string;
  recommendations?: string;
  closedDate?: string;
  createdAt: string;
  updatedAt: string;
}

const categoryOptions = ['BRIBERY', 'CORRUPTION', 'FACILITATION_PAYMENT', 'CONFLICT_OF_INTEREST', 'FRAUD', 'GIFTS_VIOLATION', 'WHISTLEBLOWER_REPORT', 'OTHER'];
const severityOptions = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const statusOptions = ['REPORTED', 'UNDER_INVESTIGATION', 'EVIDENCE_GATHERING', 'REVIEW', 'CLOSED_SUBSTANTIATED', 'CLOSED_UNSUBSTANTIATED', 'CLOSED_INCONCLUSIVE'];

const severityColors: Record<string, string> = {
  LOW: 'bg-green-100 text-green-700',
  MEDIUM: 'bg-yellow-100 text-yellow-700',
  HIGH: 'bg-orange-100 text-orange-700',
  CRITICAL: 'bg-red-100 text-red-700',
};

const statusColors: Record<string, string> = {
  REPORTED: 'bg-gray-100 text-gray-700',
  UNDER_INVESTIGATION: 'bg-blue-100 text-blue-700',
  EVIDENCE_GATHERING: 'bg-yellow-100 text-yellow-700',
  REVIEW: 'bg-purple-100 text-purple-700',
  CLOSED_SUBSTANTIATED: 'bg-red-100 text-red-700',
  CLOSED_UNSUBSTANTIATED: 'bg-green-100 text-green-700',
  CLOSED_INCONCLUSIVE: 'bg-orange-100 text-orange-700',
};

export default function InvestigationsPage() {
  const [investigations, setInvestigations] = useState<Investigation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingInvestigation, setEditingInvestigation] = useState<Investigation | null>(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('');

  const [form, setForm] = useState({
    title: '',
    description: '',
    caseNumber: '',
    reportedBy: '',
    reportedDate: new Date().toISOString().split('T')[0],
    category: 'BRIBERY',
    severity: 'MEDIUM',
    status: 'REPORTED',
    investigator: '',
    findings: '',
    recommendations: '',
    closedDate: '',
  });

  useEffect(() => {
    loadInvestigations();
  }, []);

  async function loadInvestigations() {
    try {
      setError(null);
      const res = await api.get('/investigations');
      setInvestigations(res.data.data || []);
    } catch (err) {
      console.error('Error loading investigations:', err);
      setError('Failed to load investigations.');
    } finally {
      setLoading(false);
    }
  }

  function openAddModal() {
    setEditingInvestigation(null);
    setForm({ title: '', description: '', caseNumber: '', reportedBy: '', reportedDate: new Date().toISOString().split('T')[0], category: 'BRIBERY', severity: 'MEDIUM', status: 'REPORTED', investigator: '', findings: '', recommendations: '', closedDate: '' });
    setModalOpen(true);
  }

  function openEditModal(investigation: Investigation) {
    setEditingInvestigation(investigation);
    setForm({
      title: investigation.title,
      description: investigation.description || '',
      caseNumber: investigation.caseNumber,
      reportedBy: investigation.reportedBy || '',
      reportedDate: investigation.reportedDate ? investigation.reportedDate.split('T')[0] : '',
      category: investigation.category,
      severity: investigation.severity,
      status: investigation.status,
      investigator: investigation.investigator || '',
      findings: investigation.findings || '',
      recommendations: investigation.recommendations || '',
      closedDate: investigation.closedDate ? investigation.closedDate.split('T')[0] : '',
    });
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editingInvestigation) {
        await api.put(`/investigations/${editingInvestigation.id}`, form);
      } else {
        await api.post('/investigations', form);
      }
      setModalOpen(false);
      loadInvestigations();
    } catch (err) {
      console.error('Error saving investigation:', err);
      setError('Failed to save investigation.');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this investigation?')) return;
    try {
      await api.delete(`/investigations/${id}`);
      loadInvestigations();
    } catch (err) {
      console.error('Error deleting investigation:', err);
      setError('Failed to delete investigation.');
    }
  }

  const filteredInvestigations = investigations.filter((i) => {
    if (filterStatus && i.status !== filterStatus) return false;
    if (filterSeverity && i.severity !== filterSeverity) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Investigations</h1>
            <p className="text-gray-500 mt-1">Bribery and corruption investigation log</p>
          </div>
          <button onClick={openAddModal} className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors">
            New Investigation
          </button>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 p-4">
          <div className="flex gap-4">
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500">
              <option value="">All Statuses</option>
              {statusOptions.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
            </select>
            <select value={filterSeverity} onChange={(e) => setFilterSeverity(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500">
              <option value="">All Severities</option>
              {severityOptions.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Case</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Severity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Investigator</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reported</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredInvestigations.length > 0 ? (
                filteredInvestigations.map((investigation) => (
                  <tr key={investigation.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-mono text-gray-500">{investigation.caseNumber}</td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">{investigation.title}</p>
                      {investigation.description && <p className="text-xs text-gray-500 mt-1 truncate max-w-xs">{investigation.description}</p>}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{investigation.category.replace(/_/g, ' ')}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${severityColors[investigation.severity] || 'bg-gray-100 text-gray-700'}`}>
                        {investigation.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusColors[investigation.status] || 'bg-gray-100 text-gray-700'}`}>
                        {investigation.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{investigation.investigator || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(investigation.reportedDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => openEditModal(investigation)} className="text-rose-600 hover:text-rose-700 text-sm mr-3">Edit</button>
                      <button onClick={() => handleDelete(investigation.id)} className="text-red-600 hover:text-red-700 text-sm">Delete</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">No investigations found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setModalOpen(false)} />
            <div className="relative bg-white rounded-xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold text-gray-900 mb-4">{editingInvestigation ? 'Edit Investigation' : 'New Investigation'}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500" rows={3} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Case Number</label>
                    <input type="text" value={form.caseNumber} onChange={(e) => setForm({ ...form, caseNumber: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reported By</label>
                    <input type="text" value={form.reportedBy} onChange={(e) => setForm({ ...form, reportedBy: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500">
                      {categoryOptions.map((c) => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
                    <select value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500">
                      {severityOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500">
                      {statusOptions.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reported Date</label>
                    <input type="date" value={form.reportedDate} onChange={(e) => setForm({ ...form, reportedDate: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Investigator</label>
                    <input type="text" value={form.investigator} onChange={(e) => setForm({ ...form, investigator: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Findings</label>
                  <textarea value={form.findings} onChange={(e) => setForm({ ...form, findings: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500" rows={3} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Recommendations</label>
                  <textarea value={form.recommendations} onChange={(e) => setForm({ ...form, recommendations: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500" rows={2} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Closed Date</label>
                  <input type="date" value={form.closedDate} onChange={(e) => setForm({ ...form, closedDate: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500" />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700">
                    {editingInvestigation ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
